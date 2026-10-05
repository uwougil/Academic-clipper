import { readFile } from 'node:fs/promises';
import { lookup } from 'node:dns/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { fetchNatureArticle, MAX_ARTICLE_BYTES } from '../src/article-fetch.mjs';
import { clipNature } from '../src/clip.mjs';
import { hydrateNatureTables } from '../src/adapters/nature.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';
import { validateMarkdownStructure } from '../src/validators/markdown-structure.mjs';
import { validateRawHtml } from '../src/validators/html-audit.mjs';
import { validateCrossReferences } from '../src/validators/cross-references.mjs';
import { outputPolicy } from '../src/renderers/output-policy.mjs';
import { CorpusIntegrityError, createReplay, loadReplayResources, readFixtureBytes,
  sanitizeNatureHtml, sha256Bytes, stableJson, verifyManifestFixtures } from './lib/nature-corpus-infrastructure.mjs';

export const VERIFIER_VERSION = 'nature-corpus-live/1.0.0';
export const MAX_TIMEOUT_MS = 120_000;
export const MAX_RETRY_AFTER_MS = 5_000;
export const MAX_TRANSIENT_RETRIES = 2;
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_HTML_BYTES = MAX_ARTICLE_BYTES;
const TRANSIENT_HTTP = new Set([408, 429, 500, 502, 503, 504]);
const TRANSIENT_CODES = new Set(['EAI_AGAIN', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED',
  'ENETUNREACH', 'EHOSTUNREACH', 'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET', 'BODY_TIMEOUT']);
const REDIRECTS = new Set([301, 302, 303, 307, 308]);
const DNS = { 'www.nature.com': [{ address: '93.184.216.34', family: 4 }] };
const root = fileURLToPath(new URL('..', import.meta.url));
const defaultCorpusRoot = path.join(root, 'test', 'corpus');

export class UsageError extends Error {
  constructor(message) { super(message); this.name = 'UsageError'; this.code = 'USAGE_ERROR'; }
}
class TransportError extends Error {
  constructor(message, code, facts = {}) { super(message); this.name = 'TransportError'; this.code = code; this.facts = facts; }
}
class ComparisonExecutionError extends Error {
  constructor(error) { super(`C source comparison failed: ${safeMessage(error)}`, { cause: error }); this.name = 'ComparisonExecutionError'; }
}

export function parseOptions(args, articleIds) {
  const options = { articleId: null, citationStyle: 'markdown', json: false, timeoutMs: DEFAULT_TIMEOUT_MS, help: false };
  const seen = new Set();
  for (let i = 0; i < args.length; i += 1) {
    const option = args[i];
    if (!['--article', '--citation-style', '--json', '--timeout', '--help'].includes(option)) throw new UsageError(`Unknown option: ${option}`);
    if (seen.has(option)) throw new UsageError(`Repeated option: ${option}`);
    seen.add(option);
    if (option === '--json') { options.json = true; continue; }
    if (option === '--help') { options.help = true; continue; }
    const value = args[++i];
    if (!value || value.startsWith('--')) throw new UsageError(`Missing value for ${option}`);
    if (option === '--article') {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/u.test(value)) throw new UsageError('Invalid article ID.');
      options.articleId = value;
    }
    if (option === '--citation-style') {
      if (!['markdown', 'quarto', 'links'].includes(value)) throw new UsageError('citation-style must be markdown, quarto, or links.');
      options.citationStyle = value;
    }
    if (option === '--timeout') {
      if (!/^[1-9][0-9]*$/u.test(value) || Number(value) > MAX_TIMEOUT_MS) throw new UsageError(`timeout must be an integer from 1 to ${MAX_TIMEOUT_MS} milliseconds.`);
      options.timeoutMs = Number(value);
    }
  }
  if (options.articleId && articleIds && !articleIds.includes(options.articleId)) throw new UsageError(`Unknown article ID: ${options.articleId}`);
  return options;
}

export function exitCode(results) {
  const ranks = { 64: 5, 1: 4, 2: 3, 3: 2, 0: 1 };
  return results.reduce((code, result) => ranks[result.exitCode] > ranks[code] ? result.exitCode : code, 0);
}

function result(article, phase, cause, evidence = {}) {
  const classification = {
    PARSER_REGRESSION: ['failure', 1], FIXTURE_INTEGRITY_FAILURE: ['failure', 1],
    UNCLASSIFIED_FAILURE: ['failure', 1], NETWORK_FAILURE: ['incomplete', 2],
    ACCESS_BLOCKED: ['incomplete', 2], FIXTURE_DRIFT: ['warning', 3],
    UPSTREAM_MARKUP_CHANGE: ['warning', 3], PASS: ['pass', 0], EXPECTED_WARNING: ['warning', 0],
    USAGE_ERROR: ['failure', 64],
  }[cause];
  if (!classification) throw new Error(`Unknown verifier cause: ${cause}`);
  return { articleId: article?.articleId || null, phase, severity: classification[0], cause,
    exitCode: classification[1], failedAssertions: [], validators: {}, warnings: [], signatures: {}, ...evidence };
}

// No arbitrary header/body/URL values enter the report. In particular auth redirects
// often carry transient access codes in query parameters; only origin/path is evidence.
function publicLocation(value, base) {
  try { const url = new URL(value, base); return { origin: url.origin, pathname: url.pathname }; } catch { return { invalid: true }; }
}
function safeMessage(error) {
  return String(error instanceof Error ? error.message : error).replace(/https?:\/\/[^\s)]+/gu, value => {
    try { const url = new URL(value); return `${url.origin}${url.pathname}`; } catch { return '[invalid URL]'; }
  }).slice(0, 1_000);
}
function codeOf(error) { return error?.code || error?.cause?.code || ''; }

function deadline(timeoutMs, parentSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new TransportError(`HTML operation timed out after ${timeoutMs} ms.`, 'BODY_TIMEOUT', { timeoutMs })), timeoutMs);
  return { signal: parentSignal ? AbortSignal.any([parentSignal, controller.signal]) : controller.signal,
    close: () => clearTimeout(timer) };
}
async function abortable(task, signal) {
  if (signal.aborted) throw signal.reason;
  let abort;
  const failure = new Promise((_, reject) => {
    abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
  });
  try { return await Promise.race([Promise.resolve().then(task), failure]); }
  finally { signal.removeEventListener('abort', abort); }
}

async function boundedBytes(response, signal, maxBytes) {
  const length = Number(response.headers.get('content-length'));
  if (Number.isFinite(length) && length > maxBytes) {
    void response.body?.cancel?.().catch(() => {});
    throw new TransportError(`HTML body exceeds ${maxBytes} bytes.`, 'BODY_TOO_LARGE', { declaredBytes: length, maxBytes });
  }
  if (!response.body) return Buffer.alloc(0);
  if (!response.body.getReader) throw new TransportError('Readable HTML response stream required for incremental bounds.', 'INVALID_RESPONSE');
  const reader = response.body.getReader(), chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await abortable(() => reader.read(), signal);
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) throw new TransportError(`HTML body exceeds ${maxBytes} bytes.`, 'BODY_TOO_LARGE', { bytes: total, maxBytes });
      chunks.push(Buffer.from(value));
    }
  } catch (error) {
    // A broken injected source may never settle cancel(); termination cannot wait on it.
    void reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks, total);
}

/** Injected bounded reader, not a second fetch path. All URL/DNS/redirect guards
 * still execute in fetchNatureArticle / hydrateNatureTables / safeFetchExternal. */
export function createBoundedTransport({ fetchImpl = globalThis.fetch, resolveHostname = lookup,
  timeoutMs = DEFAULT_TIMEOUT_MS, maxBytes = MAX_HTML_BYTES } = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_TIMEOUT_MS) throw new UsageError('Invalid bounded transport timeout.');
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_HTML_BYTES) throw new UsageError('Invalid bounded transport byte limit.');
  const exchanges = [], resolutions = [], captures = new Map(), redirectTargets = new Map(), requested = new Map();
  function captureFor(url) {
    for (let hop = 0; hop <= 5; hop += 1) {
      if (captures.has(url)) return captures.get(url);
      if (!redirectTargets.has(url)) return undefined;
      url = redirectTargets.get(url);
    }
    return undefined;
  }
  return {
    captureFor, wasRequested: (url, since = 0) => requested.has(url) && requested.get(url) >= since,
    facts: () => structuredClone({ exchanges, resolutions }),
    resolveHostname: async (hostname, options) => {
      const record = { hostname, all: options?.all, verbatim: options?.verbatim };
      resolutions.push(record);
      const time = deadline(timeoutMs);
      try { return await abortable(() => resolveHostname(hostname, options), time.signal); }
      catch (error) { record.error = { code: codeOf(error), message: safeMessage(error) }; throw error; }
      finally { time.close(); }
    },
    fetchImpl: async (url, options = {}) => {
      const facts = { url: publicLocation(url, url), method: options.method || 'GET', redirect: options.redirect };
      exchanges.push(facts);
      requested.set(String(url), exchanges.length - 1);
      const time = deadline(timeoutMs, options.signal);
      try {
        const response = await abortable(() => fetchImpl(url, { ...options, signal: time.signal }), time.signal);
        facts.status = response.status;
        const contentType = String(response.headers.get('content-type') || '').toLowerCase();
        facts.contentType = contentType.slice(0, 200);
        const retryAfter = response.headers.get('retry-after');
        if (retryAfter) facts.retryAfterMs = retryAfterMs(retryAfter);
        if (REDIRECTS.has(response.status)) {
          const location = response.headers.get('location');
          if (location) {
            facts.location = publicLocation(location, url);
            try { redirectTargets.set(String(url), new URL(location, url).href); } catch { /* Original guarded fetch rejects the invalid location. */ }
          }
          void response.body?.cancel?.().catch(() => {});
          return new Response(null, { status: response.status, headers: response.headers });
        }
        if (contentType && !['text/html', 'application/xhtml+xml'].includes(contentType.split(';')[0].trim())) {
          void response.body?.cancel?.().catch(() => {});
          throw new TransportError('Unexpected HTML content-type.', 'CONTENT_TYPE', { contentType });
        }
        const bytes = await boundedBytes(response, time.signal, maxBytes);
        facts.bytes = bytes.length;
        facts.bodySha256 = sha256Bytes(bytes);
        captures.set(String(url), { bytes, status: response.status, contentType });
        return new Response([204, 205, 304].includes(response.status) ? null : bytes,
          { status: response.status, headers: response.headers });
      } catch (error) {
        const timedOut = time.signal.aborted && (time.signal.reason?.name === 'TimeoutError'
          || /timed out/iu.test(String(time.signal.reason?.message)));
        facts.error = { code: timedOut ? 'BODY_TIMEOUT' : codeOf(error), message: safeMessage(error),
          ...(timedOut ? { timeoutMs } : {}), ...(error?.facts || {}) };
        throw error;
      } finally { time.close(); }
    },
  };
}

export function retryAfterMs(value, now = Date.now()) {
  const seconds = /^\d+(?:\.\d+)?$/u.test(value) ? Number(value) * 1_000 : Date.parse(value) - now;
  return Number.isFinite(seconds) ? Math.min(MAX_RETRY_AFTER_MS, Math.max(0, seconds)) : 0;
}
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function retryCapture(article, bounded, options, sleep) {
  const attempts = [];
  for (let attempt = 0; attempt <= MAX_TRANSIENT_RETRIES; attempt += 1) {
    const before = bounded.facts(), start = Date.now();
    try {
      const capture = await fetchNatureArticle(article.url, { fetchImpl: bounded.fetchImpl,
        resolveHostname: bounded.resolveHostname, timeoutMs: options.timeoutMs, maxBytes: MAX_HTML_BYTES });
      attempts.push({ attempt: attempt + 1, status: 'captured', durationMs: Date.now() - start });
      return { capture, attempts, activeStart: { exchanges: before.exchanges.length, resolutions: before.resolutions.length } };
    } catch (error) {
      const facts = bounded.facts();
      const exchanges = facts.exchanges.slice(before.exchanges.length);
      const resolutions = facts.resolutions.slice(before.resolutions.length);
      const last = exchanges.at(-1);
      const permanentError = exchanges.concat(resolutions).some(item => item.error && !TRANSIENT_CODES.has(item.error.code));
      const transient = transportProblem({ exchanges, resolutions })?.cause !== 'ACCESS_BLOCKED' && !permanentError
        && (TRANSIENT_HTTP.has(last?.status) || exchanges.some(item => TRANSIENT_CODES.has(item.error?.code))
          || resolutions.some(item => TRANSIENT_CODES.has(item.error?.code)));
      const waitMs = last?.retryAfterMs ?? (attempt + 1) * 250;
      attempts.push({ attempt: attempt + 1, status: 'failed', transient, durationMs: Date.now() - start, error: safeMessage(error) });
      if (!transient || attempt === MAX_TRANSIENT_RETRIES) return { error, attempts,
        activeStart: { exchanges: before.exchanges.length, resolutions: before.resolutions.length } };
      attempts.at(-1).retryDelayMs = waitMs;
      await sleep(waitMs);
    }
  }
}

function jsonArticles(document) {
  const articles = [];
  function visit(value) {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (!value || typeof value !== 'object') return;
    const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
    if (types.some(type => /^(?:ScholarlyArticle|Article|MedicalScholarlyArticle)$/u.test(type))) articles.push(value);
    visit(value['@graph']); visit(value.mainEntity);
  }
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try { visit(JSON.parse(script.textContent)); } catch { /* Gate records missing identity; never infer from body substrings. */ }
  }
  return articles;
}

export function inspectSource(html, article) {
  const dom = new JSDOM(html, { url: article.url });
  try {
    const document = dom.window.document, body = document.querySelector('.c-article-body');
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    const citationDois = Array.from(document.querySelectorAll('meta[name="citation_doi"]')).map(node => node.getAttribute('content')?.trim());
    const objects = jsonArticles(document);
    const jsonDois = objects.flatMap(object => [object.sameAs, object.identifier].flat()).map(value => {
      if (typeof value !== 'string') return '';
      try { const url = new URL(value); return ['doi.org', 'dx.doi.org'].includes(url.hostname) && !url.search && !url.hash ? url.pathname.slice(1) : ''; }
      catch { return value; }
    }).filter(Boolean);
    const dois = [...citationDois, ...jsonDois];
    const substantial = !!body && body.querySelectorAll('p').length >= 2 && body.textContent.trim().length >= 200;
    const accessSignals = [];
    if (document.querySelector('#challenge-form, #cf-challenge-running, .g-recaptcha, [data-test="subscription-preview"], [data-test="article-preview"], .c-article-preview, .c-article-access-message')) accessSignals.push('access/challenge block');
    if (!substantial && document.querySelector('form[action*="login"], form[action*="consent"]')) accessSignals.push('access/consent form without substantial body');
    if (objects.some(object => object.isAccessibleForFree === false)) accessSignals.push('structured access restriction');
    if (!substantial && /(?:access through your institution|subscribe to read|verify you are human|checking your browser|sign in to access)/iu.test(document.body.textContent)) accessSignals.push('preview/challenge text without substantial body');
    const canonicalUrl = publicLocation(canonical, article.url);
    return { canonical: canonical ? canonicalUrl.invalid ? '[invalid canonical]' : `${canonicalUrl.origin}${canonicalUrl.pathname}` : '',
      structuredDois: dois.map(doi => doi === article.doi ? doi : '[mismatched structured DOI]'),
      canonicalMatches: canonical === article.url,
      doiMatches: dois.length > 0 && dois.every(doi => doi === article.doi), substantialBody: substantial,
      accessSignals, title: (document.querySelector('meta[name="citation_title"]')?.getAttribute('content') || '').slice(0, 500) };
  } finally { dom.window.close(); }
}

function validatorsFor(parsed) {
  const style = parsed.citationStyle, policy = outputPolicy(style);
  return { math: validateMathDelimiters(parsed.markdown),
    structure: validateMarkdownStructure(parsed.markdown, { dialect: policy.dialect, citationStyle: style }),
    rawHtml: validateRawHtml(parsed.markdown, { allowHtmlAnchors: policy.allowHtmlAnchors }),
    crossReferences: validateCrossReferences(parsed.markdown, { dialect: policy.dialect, citationStyle: style }) };
}
function validatorFailures(validators) { return Object.entries(validators).filter(([, value]) => value.valid !== true).map(([name]) => name); }
function assertionFailures(comparison) { return comparison.expectations.filter(item => item.status !== 'pass'); }
function unexpectedWarnings(actual, expected) {
  const remaining = [...expected];
  return actual.filter(warning => {
    const index = remaining.indexOf(warning);
    if (index < 0) return true;
    remaining.splice(index, 1);
    return false;
  });
}

function transportProblem(facts, tables = []) {
  const access = facts.exchanges.find(exchange => [401, 403].includes(exchange.status)
    || exchange.location && /(?:idp\.|login|authorize|consent|challenge|subscribe)/iu.test(`${exchange.location.origin}${exchange.location.pathname}`));
  if (access) return { cause: 'ACCESS_BLOCKED', evidence: access };
  const failed = facts.exchanges.find(exchange => exchange.error || exchange.status >= 400)
    || facts.resolutions.find(resolution => resolution.error);
  if (failed) return { cause: 'NETWORK_FAILURE', evidence: failed };
  const guardedFallback = tables.find(table => table.tableContentStatus === 'fallback-fetch-failed'
    && /escaped.*scope|local or private address|no DNS addresses|hostname could not be resolved|redirect limit exceeded|Location header/iu.test(table.tableContentWarning));
  return guardedFallback ? { cause: 'NETWORK_FAILURE', evidence: { resourceUrl: publicLocation(guardedFallback.url),
    warning: guardedFallback.tableContentWarning } } : null;
}

function attemptFacts(bounded, start) {
  const facts = bounded.facts();
  return { exchanges: facts.exchanges.slice(start.exchanges), resolutions: facts.resolutions.slice(start.resolutions) };
}

async function retryLiveClip(article, html, bounded, options, clipImpl, sleep) {
  const attempts = [];
  for (let retry = 0; retry <= MAX_TRANSIENT_RETRIES; retry += 1) {
    const before = bounded.facts(), start = { exchanges: before.exchanges.length, resolutions: before.resolutions.length };
    const began = Date.now();
    try {
      const parsed = await clipImpl({ html, url: article.url, citationStyle: options.citationStyle,
        fetchImpl: bounded.fetchImpl, resolveHostname: bounded.resolveHostname });
      // Use existing guarded hydration if a full page inlines a frozen external resource.
      const missing = article.resources.filter(resource => {
        const captured = bounded.captureFor(resource.url);
        return !resource.responseMocked && !(captured?.status >= 200 && captured.status < 300)
          && !bounded.wasRequested(resource.url, start.exchanges);
      });
      if (missing.length) await hydrateNatureTables(missing.map(resource => ({ label: resource.id, url: resource.url })), article.url, bounded);
      const validators = validatorsFor(parsed), facts = attemptFacts(bounded, start);
      const problem = transportProblem(facts, parsed.tables);
      const failures = facts.exchanges.filter(exchange => exchange.error || exchange.status >= 400);
      const dnsFailures = facts.resolutions.filter(resolution => resolution.error);
      const transient = problem?.cause === 'NETWORK_FAILURE' && validatorFailures(validators).length === 0
        && failures.concat(dnsFailures).length > 0 && failures.every(exchange => exchange.error
          ? TRANSIENT_CODES.has(exchange.error.code) : TRANSIENT_HTTP.has(exchange.status))
        && dnsFailures.every(resolution => TRANSIENT_CODES.has(resolution.error.code));
      attempts.push({ attempt: retry + 1, status: problem ? 'transport-failed' : 'parsed', transient,
        durationMs: Date.now() - began });
      if (!transient || retry === MAX_TRANSIENT_RETRIES) return { parsed, validators, attempts, activeStart: start };
      const retryDelays = failures.filter(exchange => exchange.retryAfterMs !== undefined).map(exchange => exchange.retryAfterMs);
      const waitMs = retryDelays.length ? Math.max(...retryDelays) : (retry + 1) * 250;
      attempts.at(-1).retryDelayMs = waitMs;
      await sleep(waitMs);
      // Fresh production parse/hydration avoids building a second renderer to repair
      // a partial result. Each attempted request repeats the original guards.
    } catch (error) {
      // A thrown parser failure is evidence, never a reason to retry parsing.
      attempts.push({ attempt: retry + 1, status: 'parse-failed', transient: false, durationMs: Date.now() - began });
      return { error, attempts, activeStart: start };
    }
  }
}

function projectionChanged(frozen, observed) {
  return { structureChanged: frozen.structureSha256 !== observed.structureSha256,
    payloadChanged: frozen.payloadSha256 !== observed.payloadSha256 };
}

export function classifyLive({ comparison, fullValidators, changes, projectionError, identity, error, unexpectedWarnings = [] }) {
  if (identity?.accessSignals.length) return 'ACCESS_BLOCKED';
  if (error || unexpectedWarnings.length || validatorFailures(fullValidators || {}).length || comparison && validatorFailures(comparison.validators).length) return 'UNCLASSIFIED_FAILURE';
  if (projectionError) return /must select exactly one source node|Invalid selected JSON-LD|Ambiguous or mismatched article JSON-LD/u.test(projectionError)
    && identity?.substantialBody ? 'UPSTREAM_MARKUP_CHANGE' : 'UNCLASSIFIED_FAILURE';
  if (changes.some(change => change.structureChanged)) return 'UPSTREAM_MARKUP_CHANGE';
  if (changes.some(change => change.payloadChanged)) return 'FIXTURE_DRIFT';
  if (!comparison?.pass) return 'UNCLASSIFIED_FAILURE';
  return comparison.warnings.actual.length ? 'EXPECTED_WARNING' : 'PASS';
}

async function compareClip(article, html, resources, options, comparisonApi, clipImpl) {
  const replay = createReplay({ resources, dns: DNS });
  const source = new JSDOM(html, { url: article.url });
  try {
    const parsed = await clipImpl({ html, url: article.url, citationStyle: options.citationStyle,
      fetchImpl: replay.fetchImpl, resolveHostname: replay.resolveHostname });
    let comparison;
    try {
      comparison = comparisonApi.compareArticleResult(article, parsed, { sourceDocument: source.window.document,
        citationStyle: options.citationStyle });
    } catch (error) { throw new ComparisonExecutionError(error); }
    if (comparison?.version !== '1.0.0' || !Array.isArray(comparison.expectations) || stableJson(comparison.expectations.map(item => [item.id, item.assertionId]))
      !== stableJson(article.expectations.map(item => [item.id, item.assertionId]))) {
      throw new CorpusIntegrityError('C comparison must execute every declared source expectation in order.');
    }
    return { comparison, parsed, ledger: replay.ledger() };
  } finally {
    source.window.close();
    replay.assertClean();
  }
}

async function loadComparisonApi() {
  const api = await import('./lib/nature-corpus-assertions.mjs');
  if (!(api.assertionRegistry instanceof Map) || typeof api.compareArticleResult !== 'function') throw new CorpusIntegrityError('C comparison module does not expose the agreed registry/comparison API.');
  return api;
}

/** No artifact persistence, writer, image downloads, global fetch/DNS mutations.
 * Tests inject BOTH fetch and resolver, with declared A ledgers; no fallback. */
export async function runVerifier(options, { manifest, corpusRoot = defaultCorpusRoot, comparisonApi,
  transport, clipImpl = clipNature, sleep = delay } = {}) {
  const report = { version: VERIFIER_VERSION, citationStyle: options.citationStyle, timeoutMs: options.timeoutMs,
    observedAt: new Date().toISOString(), results: [], exitCode: 0 };
  let selected;
  try {
    manifest ||= JSON.parse(await readFile(path.join(corpusRoot, 'corpus-manifest.json'), 'utf8'));
    selected = options.articleId ? manifest.articles.filter(article => article.articleId === options.articleId) : manifest.articles;
    if (options.articleId && !selected.length) throw new UsageError(`Unknown article ID: ${options.articleId}`);
    comparisonApi ||= await loadComparisonApi();
    await verifyManifestFixtures(manifest, corpusRoot, { assertionRegistry: comparisonApi.assertionRegistry });
    if (transport && (typeof transport.fetchImpl !== 'function' || typeof transport.resolveHostname !== 'function')) throw new UsageError('Injected transport must provide both fetchImpl and resolveHostname.');
  } catch (error) {
    report.results.push(result(null, 'offline-integrity', error instanceof UsageError ? 'USAGE_ERROR' : 'FIXTURE_INTEGRITY_FAILURE', { error: safeMessage(error) }));
    report.exitCode = exitCode(report.results);
    return report;
  }
  // Every selected frozen parser/oracle preflight precedes any live request.
  const ready = [];
  for (const article of selected) {
    try {
      const bytes = await readFixtureBytes(corpusRoot, article.fixturePath, article.articleId, article.fixtureSha256);
      const html = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      const resources = await loadReplayResources(article, corpusRoot);
      const offline = await compareClip(article, html, resources, options, comparisonApi, clipImpl);
      if (!offline.comparison.pass) {
        report.results.push(result(article, 'offline-assertions', 'PARSER_REGRESSION', {
          failedAssertions: assertionFailures(offline.comparison), validators: offline.comparison.validators,
          warnings: offline.comparison.warnings, summary: offline.comparison.summary, ledger: offline.ledger }));
        continue;
      }
      ready.push({ article, html, resources, offline });
    } catch (error) {
      report.results.push(result(article, 'offline-assertions', error instanceof CorpusIntegrityError ? 'FIXTURE_INTEGRITY_FAILURE'
        : error instanceof ComparisonExecutionError ? 'UNCLASSIFIED_FAILURE' : 'PARSER_REGRESSION', { error: safeMessage(error) }));
    }
  }
  for (const { article, html, resources, offline } of ready) {
    try {
      const bounded = createBoundedTransport({ ...(transport ? { fetchImpl: transport.fetchImpl, resolveHostname: transport.resolveHostname } : {}), timeoutMs: options.timeoutMs });
      const capture = await retryCapture(article, bounded, options, sleep);
      let activeStart = capture.activeStart;
      const currentFacts = () => attemptFacts(bounded, activeStart);
      if (capture.error) {
        const problem = transportProblem(currentFacts());
        report.results.push(result(article, 'live-capture', problem?.cause || 'NETWORK_FAILURE',
          { error: safeMessage(capture.error), attempts: capture.attempts, transport: bounded.facts() }));
        continue;
      }
      const identity = inspectSource(capture.capture.html, article);
      if (identity.accessSignals.length || !identity.substantialBody || !identity.canonicalMatches || !identity.doiMatches) {
        const cause = identity.accessSignals.length ? 'ACCESS_BLOCKED' : !identity.substantialBody
          || identity.canonical && !identity.canonicalMatches || identity.structuredDois.length && !identity.doiMatches
          ? 'UNCLASSIFIED_FAILURE' : 'UPSTREAM_MARKUP_CHANGE';
        report.results.push(result(article, 'live-identity', cause, { identity, attempts: capture.attempts, transport: bounded.facts() }));
        continue;
      }
      const live = await retryLiveClip(article, capture.capture.html, bounded, options, clipImpl, sleep);
      activeStart = live.activeStart;
      if (live.error) {
        const problem = transportProblem(currentFacts());
        report.results.push(result(article, 'live-parse', problem?.cause || 'UNCLASSIFIED_FAILURE', {
          error: safeMessage(live.error), identity, attempts: capture.attempts, tableAttempts: live.attempts, transport: bounded.facts() }));
        continue;
      }
      const { parsed: full, validators: fullValidators } = live;
      const problem = transportProblem(currentFacts(), full.tables);
      if (problem) {
        report.results.push(result(article, 'live-resources', validatorFailures(fullValidators).length ? 'UNCLASSIFIED_FAILURE' : problem.cause,
          { transport: bounded.facts(), identity, validators: fullValidators, warnings: full.debug.warnings,
            attempts: capture.attempts, tableAttempts: live.attempts }));
        continue;
      }
      let projection, comparison, changes = [], projectionError, comparisonError;
      const signatures = { frozen: {}, observed: {}, resources: [] };
      try {
        const frozen = sanitizeNatureHtml(html, article.recipe, { sanitizerVersion: article.sanitizerVersion });
        projection = sanitizeNatureHtml(capture.capture.html, article.recipe, { sanitizerVersion: article.sanitizerVersion });
        signatures.frozen = frozen.signatures; signatures.observed = projection.signatures;
        changes.push({ resourceId: 'article', ...projectionChanged(frozen.signatures, projection.signatures) });
        const projectedResources = [];
        for (let i = 0; i < article.resources.length; i += 1) {
          const resource = article.resources[i];
          if (resource.responseMocked) { projectedResources.push(resources[i]); continue; }
          const captured = bounded.captureFor(resource.url);
          if (!captured) throw new Error(`Declared live table resource was not captured: ${resource.id}`);
          const frozenTable = sanitizeNatureHtml(new TextDecoder('utf-8', { fatal: true }).decode(resources[i].bodyBytes), resource.recipe, { sanitizerVersion: resource.sanitizerVersion });
          const liveTable = sanitizeNatureHtml(new TextDecoder('utf-8', { fatal: true }).decode(captured.bytes), resource.recipe, { sanitizerVersion: resource.sanitizerVersion });
          signatures.resources.push({ resourceId: resource.id, frozen: frozenTable.signatures, observed: liveTable.signatures });
          changes.push({ resourceId: resource.id, ...projectionChanged(frozenTable.signatures, liveTable.signatures) });
          projectedResources.push({ ...resources[i], bodyBytes: liveTable.bytes, status: captured.status,
            headers: { 'content-type': captured.contentType || 'text/html' } });
        }
        const projected = await compareClip(article, projection.html, projectedResources, options, comparisonApi, clipImpl);
        comparison = projected.comparison;
      } catch (error) {
        if (!projection || /must select exactly one source node|JSON-LD/u.test(error.message)) projectionError = safeMessage(error);
        else comparisonError = safeMessage(error);
      }
      const fullWarnings = { expected: offline.comparison.warnings.expected, actual: full.debug.warnings,
        unexpected: unexpectedWarnings(full.debug.warnings, offline.comparison.warnings.expected) };
      const cause = classifyLive({ comparison, fullValidators, changes, projectionError, identity, error: comparisonError,
        unexpectedWarnings: fullWarnings.unexpected });
      report.results.push(result(article, 'live-comparison', cause, { identity, signatures, changes,
        ...(projectionError ? { projectionError } : {}), ...(comparisonError ? { error: comparisonError } : {}),
        failedAssertions: comparison ? assertionFailures(comparison) : [],
        validators: { fullPage: fullValidators, retainedProjection: comparison?.validators || {} },
        warnings: { fullPage: fullWarnings, retainedProjection: comparison?.warnings || {} },
        summaries: { frozen: offline.comparison.summary, live: comparison?.summary || null },
        attempts: capture.attempts, tableAttempts: live.attempts, transport: bounded.facts() }));
    } catch (error) {
      report.results.push(result(article, 'live-verifier', error instanceof CorpusIntegrityError ? 'FIXTURE_INTEGRITY_FAILURE' : 'UNCLASSIFIED_FAILURE', { error: safeMessage(error) }));
    }
  }
  try { transport?.assertClean?.(); }
  catch (error) { report.results.push(result(null, 'live-replay-integrity', 'FIXTURE_INTEGRITY_FAILURE', { error: safeMessage(error), ledger: transport?.ledger?.() })); }
  report.exitCode = exitCode(report.results);
  return report;
}

const usage = `Usage: node scripts/verify-nature-corpus-live.mjs [--article <id>] [--citation-style markdown|quarto|links] [--json] [--timeout <1..${MAX_TIMEOUT_MS} ms>]\nLive is opt-in; frozen integrity/assertions run first. Reports are stdout-only.\n`;

export async function main(args = process.argv.slice(2), dependencies = {}) {
  let options;
  try {
    options = parseOptions(args);
    if (options.help) { process.stdout.write(usage); return 0; }
    const report = await runVerifier(options, dependencies);
    process.stdout.write(options.json ? `${JSON.stringify(report, null, 2)}\n` : `${report.results.map(entry => `${entry.articleId || 'corpus'} ${entry.phase}: ${entry.severity} ${entry.cause}`).join('\n')}\n`);
    return report.exitCode;
  } catch (error) {
    const report = { version: VERIFIER_VERSION, results: [result(null, 'usage', error instanceof UsageError ? 'USAGE_ERROR' : 'UNCLASSIFIED_FAILURE', { error: safeMessage(error) })] };
    report.exitCode = exitCode(report.results);
    if (args.includes('--json')) process.stdout.write(`${JSON.stringify(report)}\n`);
    else process.stderr.write(`${safeMessage(error)}\n${usage}`);
    return report.exitCode;
  }
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) process.exitCode = await main();
