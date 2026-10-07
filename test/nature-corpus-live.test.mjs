import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { test } from 'node:test';
import { clipNature } from '../src/clip.mjs';
import { hydrateNatureTables } from '../src/adapters/nature.mjs';
import { createReplay, sanitizeNatureHtml, sha256Bytes } from '../scripts/lib/nature-corpus-infrastructure.mjs';
import { ASSERTION_VERSION, runProductionValidators, semanticSummary, assertionRegistry, compareArticleResult } from '../scripts/lib/nature-corpus-assertions.mjs';
import { fileURLToPath } from 'node:url';
import { classifyLive, createBoundedTransport, exitCode, inspectSource, parseOptions, retryAfterMs,
  runVerifier, UsageError, MAX_RETRY_AFTER_MS } from '../scripts/verify-nature-corpus-live.mjs';

// Explicitly synthetic existing unit fixture; this is transport evidence, not admission.
const fixture = await readFile(new URL('./fixtures/nature-minimal.html', import.meta.url), 'utf8');
const articleUrl = 'https://www.nature.com/articles/s41586-026-10401-1';
const tableUrl = `${articleUrl}/tables/2`;
const hydratedFixture = fixture.replace(/<table>[\s\S]*?<\/table>/u, '');
const publicDns = { 'www.nature.com': [{ address: '93.184.216.34', family: 4 }] };
const request = (url = tableUrl) => ({ url, method: 'GET', redirect: 'manual' });
const resolution = { hostname: 'www.nature.com', all: true, verbatim: true };

function replay(resources, dns = publicDns) {
  return createReplay({ resources: resources.map(({ body, location, ...resource }) => ({
    ...request(), responseMocked: true,
    headers: { 'content-type': 'text/html', ...(location ? { location } : {}) },
    bodyBytes: body == null ? undefined : Buffer.from(body), ...resource,
  })), dns });
}

test('full clip forwards declared table replay in every dialect without a writer or live DNS/HTTP', async t => {
  for (const citationStyle of ['markdown', 'links', 'quarto']) {
    const transport = replay([{ status: 200,
      body: '<table><tr><th>Transport</th><th>Value</th></tr><tr><td>Synthetic replay</td><td>7</td></tr></table>' }]);
    t.after(() => transport.assertClean({ expectedRequests: [request()], expectedDns: [resolution] }));
    const result = await clipNature({ html: hydratedFixture, url: articleUrl, citationStyle, ...transport });
    assert.equal(result.tables[0].tableContentStatus, 'full-size-html');
    assert.match(result.markdown, /Synthetic replay/);
    assert.equal(result.debug.mathValidation.valid, true);
    assert.equal(result.debug.rawHtmlValidation.valid, true);
    assert.equal(result.debug.markdownStructure.valid, true);
    assert.equal(result.debug.crossReferenceValidation.valid, true);
    assert.deepEqual(result.debug.warnings, []);
  }
});

test('full clip preserves the declared no-cell table fallback warning', async t => {
  const transport = replay([{ status: 200, body: '<main>Synthetic image-only table response</main>' }]);
  t.after(() => transport.assertClean({ expectedRequests: [request()], expectedDns: [resolution] }));
  const result = await clipNature({ html: hydratedFixture, url: articleUrl, ...transport });
  assert.equal(result.tables[0].tableContentStatus, 'fallback-no-html-table');
  assert.deepEqual(result.debug.warnings, ['Extended Data Table 1: The full-size Nature page did not expose HTML table cells; retained the absolute URL.']);
  assert.ok(result.markdown.includes(tableUrl));
});

test('full clip scope rejection never resolves or requests an escaped table URL', async t => {
  const transport = replay([{ status: 302, location: 'https://public.example/escaped', body: null }]);
  t.after(() => transport.assertClean({ expectedRequests: [request()], expectedDns: [resolution] }));
  const result = await clipNature({ html: hydratedFixture, url: articleUrl, ...transport });
  assert.equal(result.tables[0].tableContentStatus, 'fallback-fetch-failed');
  assert.match(result.debug.warnings[0], /escaped the current article table scope/u);
});

test('full clip follows a declared same-article table redirect and preserves HTTP failure evidence', async t => {
  const revised = `${articleUrl}/tables/revision-2`;
  const transport = replay([{ status: 302, location: revised }, { url: revised, status: 200,
    body: '<table><tr><th>Synthetic redirect</th></tr><tr><td>Guarded</td></tr></table>' }]);
  t.after(() => transport.assertClean({ expectedRequests: [request(), request(revised)], expectedDns: [resolution, resolution] }));
  const result = await clipNature({ html: hydratedFixture, url: articleUrl, ...transport });
  assert.equal(result.tables[0].tableContentStatus, 'full-size-html');
  assert.equal(result.tables[0].tableContentUrl, revised);
  assert.deepEqual(result.debug.warnings, []);
  const failed = replay([{ status: 503, body: 'Explicit mocked table HTTP failure' }]);
  t.after(() => failed.assertClean({ expectedRequests: [request()], expectedDns: [resolution] }));
  const fallback = await clipNature({ html: hydratedFixture, url: articleUrl, ...failed });
  assert.equal(fallback.tables[0].tableContentStatus, 'fallback-fetch-failed');
  assert.match(fallback.debug.warnings[0], /HTTP 503/u);
});

test('a swallowed undeclared operation still fails the full clip request ledger', async () => {
  const transport = replay([]);
  const result = await clipNature({ html: hydratedFixture, url: articleUrl, ...transport });
  assert.equal(result.tables[0].tableContentStatus, 'fallback-fetch-failed');
  assert.throws(() => transport.assertClean(), /Unexpected HTTP\/DNS ledger/u);
  assert.equal(transport.ledger().unexpected.length, 1);
});

test('full clip with an inline table needs no transport and keeps default bytes', async t => {
  const transport = replay([]);
  t.after(() => transport.assertClean({ expectedRequests: [], expectedDns: [] }));
  const defaults = await clipNature({ html: fixture, url: articleUrl });
  const injected = await clipNature({ html: fixture, url: articleUrl, ...transport });
  assert.equal(injected.markdown, defaults.markdown);
  assert.deepEqual(injected.debug, defaults.debug);
});

// Synthetic controller fixture and one strict source oracle. It is not one of B's
// admitted articles or a substitute for C's 85 independent source consumers.
const syntheticId = 'synthetic-live-verifier';
const syntheticUrl = `https://www.nature.com/articles/${syntheticId}`;
const prose = 'This explicitly synthetic paragraph is a verifier transport test. It has enough plain text for the public body gate, and carries no real scholarly claim, equation or reference. ';
const syntheticHtml = `<!doctype html><html><head id="metadata"><link rel="canonical" href="${syntheticUrl}">
<meta name="citation_title" content="Synthetic live verifier"><meta name="citation_doi" content="10.1038/${syntheticId}">
<meta name="citation_journal_title" content="Synthetic Nature fixture"><meta name="citation_author" content="Synthetic Author">
<script type="application/ld+json">{"@type":"ScholarlyArticle","url":"${syntheticUrl}","isAccessibleForFree":true}</script>
</head><body><main id="body" class="c-article-body"><section data-title="Abstract"><h2>Abstract</h2><p>${prose}</p></section>
<section data-title="Results"><h2>Results</h2><p>${prose}</p></section></main></body></html>`;
const syntheticRegistry = new Map([['synthetic-title-v1', { validate: value => typeof value === 'string',
  assert: (context, expectation) => assert.equal(context.metadata.title, expectation.value) }]]);
const syntheticComparison = {
  assertionRegistry: syntheticRegistry,
  compareArticleResult(article, parsed) {
    const wanted = article.expectations[0];
    const valid = parsed.metadata.title === wanted.value;
    const validators = runProductionValidators(parsed);
    const expected = article.title === 'Synthetic live verifier'
      ? ['No Nature figures were detected.', 'No equation nodes were detected.', 'No Nature reference list was detected.'] : [];
    const actual = parsed.debug.warnings;
    const warnings = { expected, actual, unexpected: actual.filter(value => !expected.includes(value)),
      missing: expected.filter(value => !actual.includes(value)) };
    return { version: '1.0.0', articleId: article.articleId, citationStyle: parsed.citationStyle,
      expectations: [{ id: wanted.id, assertionId: wanted.assertionId, status: valid ? 'pass' : 'failure',
        failures: valid ? [] : [{ path: 'metadata.title', expected: wanted.value, actual: parsed.metadata.title }] }],
      validators, warnings, summary: semanticSummary(parsed),
      pass: valid && Object.values(validators).every(value => value.valid) && !warnings.unexpected.length && !warnings.missing.length };
  },
};
const defaultOptions = { articleId: null, citationStyle: 'markdown', json: false, timeoutMs: 1000 };

async function controllerFixture(t, rawHtml = syntheticHtml, title = 'Synthetic live verifier', id = syntheticId) {
  const url = `https://www.nature.com/articles/${id}`;
  const corpusRoot = await mkdtemp(path.join(tmpdir(), 'academic-clipper-live-mock-'));
  t.after(() => rm(corpusRoot, { recursive: true, force: true }));
  const recipe = { version: '1.0.0', id: 'synthetic-live-v1', articleUrl: url,
    blocks: [{ id: 'metadata', selector: '#metadata', role: 'metadata' },
      { id: 'body', selector: '#body', role: 'body' }], removeSelectors: [] };
  const sanitized = sanitizeNatureHtml(rawHtml, recipe);
  const fixturePath = `fixtures/${id}/article.excerpt.html`;
  await mkdir(path.join(corpusRoot, 'fixtures', id), { recursive: true });
  await writeFile(path.join(corpusRoot, fixturePath), sanitized.bytes);
  const article = { articleId: id, url, doi: `10.1038/${id}`,
    title, journal: 'Synthetic Nature fixture', observedAt: '2026-10-04T00:00:00Z',
    captureMode: 'guarded-http', sourceSha256: sha256Bytes(Buffer.from(rawHtml)), fixturePath,
    fixtureSha256: sanitized.fixtureSha256, sanitizerVersion: sanitized.sanitizerVersion,
    serializerVersion: sanitized.serializerVersion, recipe, retainedBlocks: sanitized.retainedBlocks,
    transformations: sanitized.transformations, omittedContent: [], resources: [],
    coverage: [{ feature: 'synthetic-controller-only', blockId: 'metadata', expectationId: 'synthetic-title' }],
    expectations: [{ id: 'synthetic-title', assertionId: 'synthetic-title-v1', blockIds: ['metadata'], value: title }],
    liveObservations: { observedAt: '2026-10-04T00:00:00Z', fullPageObservations: [], retainedProjection: sanitized.signatures } };
  return { corpusRoot, manifest: { schemaVersion: '1.0.0', articles: [article] }, article };
}

function captureReplay(t, body = syntheticHtml, { status = 200, headers = {}, dns = publicDns } = {}) {
  const transport = createReplay({ resources: [{ url: syntheticUrl, method: 'GET', redirect: 'manual', responseMocked: true,
    status, headers: { 'content-type': 'text/html', ...headers }, bodyBytes: REDIRECT_STATUS(status) ? undefined : Buffer.from(body) }], dns });
  t.after(() => transport.assertClean());
  return transport;
}
function REDIRECT_STATUS(status) { return [301, 302, 303, 307, 308].includes(status); }
function sequenceReplay(t, responses) {
  const transports = responses.map(response => captureReplay(t, response.body || syntheticHtml, response));
  let index = 0;
  return { fetchImpl: (...args) => transports[index++].fetchImpl(...args),
    resolveHostname: (...args) => transports[index].resolveHostname(...args),
    requests: () => transports.flatMap(transport => transport.ledger().requests),
    index: () => index };
}

test('CLI options reject unknown, duplicate, missing, unbounded and invalid values before network', () => {
  assert.deepEqual(parseOptions(['--article', syntheticId, '--citation-style', 'quarto', '--json', '--timeout', '12'], [syntheticId]),
    { articleId: syntheticId, citationStyle: 'quarto', json: true, timeoutMs: 12, help: false });
  for (const args of [['--what'], ['--json', '--json'], ['--article'], ['--article', 'unknown'],
    ['--timeout', '0'], ['--timeout', '-1'], ['--timeout', '1.5'], ['--timeout', '120001'],
    ['--timeout', 'Infinity'], ['--timeout', '2e3'], ['--citation-style', 'auto'], ['--output', 'papers']]) {
    assert.throws(() => parseOptions(args, [syntheticId]), UsageError, args.join(' '));
  }
});

test('cause taxonomy and severity/exit precedence keep all mixed results', () => {
  const validatorPass = { math: { valid: true }, structure: { valid: true }, rawHtml: { valid: true }, crossReferences: { valid: true } };
  const comparison = { pass: true, validators: validatorPass, warnings: { actual: [] } };
  assert.equal(classifyLive({ comparison, fullValidators: validatorPass, changes: [] }), 'PASS');
  assert.equal(classifyLive({ comparison: { ...comparison, warnings: { actual: ['declared'] } }, fullValidators: validatorPass, changes: [] }), 'EXPECTED_WARNING');
  assert.equal(classifyLive({ comparison, fullValidators: validatorPass, changes: [{ payloadChanged: true }] }), 'FIXTURE_DRIFT');
  assert.equal(classifyLive({ comparison, fullValidators: validatorPass, changes: [{ structureChanged: true }] }), 'UPSTREAM_MARKUP_CHANGE');
  assert.equal(classifyLive({ comparison, fullValidators: { math: { valid: false } }, changes: [{ structureChanged: true }] }), 'UNCLASSIFIED_FAILURE');
  assert.equal(classifyLive({ fullValidators: validatorPass, changes: [], projectionError: 'Block body must select exactly one source node; got 0', identity: { substantialBody: true, accessSignals: [] } }), 'UPSTREAM_MARKUP_CHANGE');
  assert.equal(classifyLive({ changes: [], identity: { accessSignals: ['challenge'] } }), 'ACCESS_BLOCKED');
  for (const [codes, wanted] of [[[0, 3, 2, 1, 64], 64], [[3, 2, 1, 0], 1], [[3, 2, 0], 2], [[3, 0], 3], [[0, 0], 0]]) {
    const results = codes.map(exitCode => ({ exitCode }));
    assert.equal(exitCode(results), wanted); assert.equal(results.length, codes.length);
  }
});

test('identity gate uses exact canonical/structured DOI and recognizes real access evidence', () => {
  const article = { url: syntheticUrl, doi: `10.1038/${syntheticId}` };
  assert.equal(inspectSource(syntheticHtml, article).doiMatches, true);
  assert.equal(inspectSource(syntheticHtml.replace(`10.1038/${syntheticId}`, `10.1038/${syntheticId}-wrong`), article).doiMatches, false);
  assert.equal(inspectSource(syntheticHtml.replace(`href="${syntheticUrl}"`, `href="${syntheticUrl}-wrong"`), article).canonicalMatches, false);
  assert.equal(inspectSource(`<p>Arbitrary DOI substring 10.1038/${syntheticId}</p>`, article).doiMatches, false);
  assert.ok(inspectSource(syntheticHtml.replace('"isAccessibleForFree":true', '"isAccessibleForFree":false'), article).accessSignals.length);
  assert.ok(inspectSource('<form id="challenge-form">Verify you are human</form>', article).accessSignals.length);
});

test('offline hash failure and unchanged frozen oracle failure both forbid live DNS/HTTP', async t => {
  const context = await controllerFixture(t), transport = captureReplay(t);
  context.article.fixtureSha256 = '0'.repeat(64);
  const integrity = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport });
  assert.equal(integrity.results[0].cause, 'FIXTURE_INTEGRITY_FAILURE'); assert.equal(integrity.exitCode, 1);
  assert.deepEqual(transport.ledger(), { requests: [], resolutions: [], unexpected: [] });
  const second = await controllerFixture(t);
  second.article.expectations[0].value = 'Explicitly wrong synthetic controller oracle';
  const parser = await runVerifier(defaultOptions, { ...second, comparisonApi: syntheticComparison, transport });
  assert.equal(parser.results[0].cause, 'PARSER_REGRESSION'); assert.equal(parser.exitCode, 1);
  assert.equal(parser.results[0].failedAssertions[0].id, 'synthetic-title');
  assert.deepEqual(transport.ledger(), { requests: [], resolutions: [], unexpected: [] });
});

test('comparison API execution errors stay unclassified and forbid live requests', async t => {
  const context = await controllerFixture(t), transport = captureReplay(t);
  const report = await runVerifier(defaultOptions, { ...context, transport,
    comparisonApi: { ...syntheticComparison, compareArticleResult() { throw new TypeError('Explicit mock comparison execution error'); } } });
  assert.equal(report.results[0].cause, 'UNCLASSIFIED_FAILURE'); assert.equal(report.exitCode, 1);
  assert.equal(report.results[0].phase, 'offline-assertions');
  assert.match(report.results[0].error, /C source comparison failed/u);
  assert.deepEqual(transport.ledger(), { requests: [], resolutions: [], unexpected: [] });
});

test('a passing comparison provider cannot omit, reorder or replace required execution records', async t => {
  for (const corruption of ['version', 'missing', 'reordered', 'replaced']) {
    const context = await controllerFixture(t), transport = captureReplay(t);
    context.article.expectations.push({ ...context.article.expectations[0], id: 'synthetic-title-second' });
    const report = await runVerifier(defaultOptions, { ...context, transport, comparisonApi: {
      assertionRegistry: syntheticRegistry,
      compareArticleResult(article, parsed) {
        const comparison = syntheticComparison.compareArticleResult(article, parsed);
        comparison.expectations = article.expectations.map(expectation => ({
          ...comparison.expectations[0], id: expectation.id, assertionId: expectation.assertionId,
        }));
        if (corruption === 'version') comparison.version = 'unreviewed';
        if (corruption === 'missing') comparison.expectations.pop();
        if (corruption === 'reordered') comparison.expectations.reverse();
        if (corruption === 'replaced') comparison.expectations[0].assertionId = 'unreviewed-consumer';
        return comparison;
      },
    } });
    assert.equal(report.exitCode, 1, corruption);
    assert.equal(report.results[0].cause, 'FIXTURE_INTEGRITY_FAILURE', corruption);
    assert.equal(report.results[0].phase, 'offline-assertions', corruption);
    assert.match(report.results[0].error, /every declared source expectation in order/u);
    assert.deepEqual(transport.ledger(), { requests: [], resolutions: [], unexpected: [] }, corruption);
  }
});

test('comparison boundary enforces complete facts and preserves coherent negative results', async t => {
  const failure = { path: 'synthetic.required', expected: 'pass', actual: 'failure' };
  const cases = [
    { name: 'coherent pass', change: () => {}, cause: 'EXPECTED_WARNING', requests: 1 },
    { name: 'coherent required failure', change: comparison => {
      Object.assign(comparison.expectations[0], { status: 'failure', failures: [failure] }); comparison.pass = false;
    }, cause: 'PARSER_REGRESSION' },
    ...['math', 'structure', 'rawHtml', 'crossReferences'].map(key => ({ name: `coherent ${key} failure`,
      change: comparison => { comparison.validators[key].valid = false; comparison.pass = false; }, cause: 'PARSER_REGRESSION' })),
    { name: 'coherent unexpected warning', change: comparison => {
      comparison.warnings.actual.push('Explicit synthetic unexpected warning.');
      comparison.warnings.unexpected.push('Explicit synthetic unexpected warning.'); comparison.pass = false;
    }, cause: 'PARSER_REGRESSION' },
    { name: 'coherent missing warning', change: comparison => {
      comparison.warnings.expected.push('Explicit synthetic missing warning.');
      comparison.warnings.missing.push('Explicit synthetic missing warning.'); comparison.pass = false;
    }, cause: 'PARSER_REGRESSION' },
    { name: 'coherent warning order failure', change: comparison => {
      comparison.warnings.expected.reverse(); comparison.pass = false;
    }, cause: 'PARSER_REGRESSION' },
    { name: 'required failure cannot claim pass', change: comparison => {
      Object.assign(comparison.expectations[0], { status: 'failure', failures: [failure] });
    } },
    { name: 'missing status', change: comparison => { delete comparison.expectations[0].status; } },
    { name: 'unknown status', change: comparison => { comparison.expectations[0].status = 'failed'; } },
    { name: 'missing failures', change: comparison => { delete comparison.expectations[0].failures; } },
    { name: 'non-array failures', change: comparison => { comparison.expectations[0].failures = {}; } },
    { name: 'malformed failure fact', change: comparison => {
      Object.assign(comparison.expectations[0], { status: 'failure', failures: [null] }); comparison.pass = false;
    } },
    { name: 'passing record contains failure', change: comparison => { comparison.expectations[0].failures = [failure]; } },
    { name: 'failure record has no failure fact', change: comparison => {
      comparison.expectations[0].status = 'failure'; comparison.pass = false;
    } },
    { name: 'missing aggregate pass', change: comparison => { delete comparison.pass; } },
    { name: 'non-boolean aggregate pass', change: comparison => { comparison.pass = 'true'; } },
    { name: 'aggregate false contradicts complete passing facts', change: comparison => { comparison.pass = false; } },
    { name: 'missing validators', change: comparison => { delete comparison.validators; } },
    { name: 'empty validators', change: comparison => { comparison.validators = {}; } },
    { name: 'null validators', change: comparison => { comparison.validators = null; } },
    ...['math', 'structure', 'rawHtml', 'crossReferences'].flatMap(key => [
      { name: `missing ${key} validator`, change: comparison => { delete comparison.validators[key]; } },
      { name: `${key} failure cannot claim pass`, change: comparison => { comparison.validators[key].valid = false; } },
      { name: `non-boolean ${key} validation`, change: comparison => { comparison.validators[key].valid = 'true'; } },
    ]),
    { name: 'missing warnings', change: comparison => { delete comparison.warnings; } },
    ...['expected', 'actual', 'unexpected', 'missing'].map(key => ({ name: `missing warnings.${key}`,
      change: comparison => { delete comparison.warnings[key]; } })),
    { name: 'non-string warning', change: comparison => { comparison.warnings.expected.push(null); } },
    { name: 'warning facts omit an actual unexpected warning', change: comparison => {
      comparison.warnings.actual.push('Explicit synthetic unexpected warning.');
    } },
    { name: 'warning facts omit an actual missing warning', change: comparison => {
      comparison.warnings.expected.push('Explicit synthetic missing warning.');
    } },
    { name: 'warning actual facts differ from parsed warnings', change: comparison => {
      comparison.warnings.actual = []; comparison.warnings.expected = [];
    } },
    { name: 'actual unexpected warning cannot claim pass', change: comparison => {
      comparison.warnings.actual.push('Explicit synthetic unexpected warning.');
      comparison.warnings.unexpected.push('Explicit synthetic unexpected warning.');
    } },
    { name: 'incorrect article identity', change: comparison => { comparison.articleId = 'synthetic-other'; } },
    { name: 'incorrect dialect identity', change: comparison => { comparison.citationStyle = 'quarto'; } },
    { name: 'missing summary', change: comparison => { delete comparison.summary; } },
    { name: 'undefined comparison', change: () => undefined, empty: true },
  ];
  for (const { name, change, cause = 'FIXTURE_INTEGRITY_FAILURE', requests = 0, empty } of cases) {
    await t.test(name, async t => {
      const context = await controllerFixture(t), transport = captureReplay(t);
      const report = await runVerifier(defaultOptions, { ...context, transport, comparisonApi: {
        ...syntheticComparison,
        compareArticleResult(...args) {
          const comparison = syntheticComparison.compareArticleResult(...args);
          change(comparison); return empty ? undefined : comparison;
        },
      } });
      const entry = report.results[0], ledger = transport.ledger();
      t.diagnostic(JSON.stringify({ name, cause: entry.cause, phase: entry.phase, exitCode: report.exitCode,
        requests: ledger.requests.length, resolutions: ledger.resolutions.length, unexpected: ledger.unexpected }));
      assert.equal(entry.cause, cause); assert.equal(report.exitCode, requests ? 0 : 1);
      assert.equal(entry.phase, requests ? 'live-comparison' : 'offline-assertions');
      assert.equal(ledger.requests.length, requests); assert.equal(ledger.resolutions.length, requests);
      if (cause === 'PARSER_REGRESSION' && name === 'coherent required failure') {
        assert.deepEqual(entry.failedAssertions[0].failures, [failure]);
      }
    });
  }
});

test('mock successful full/projection parse yields EXPECTED_WARNING and leaves every artifact unchanged', async t => {
  const context = await controllerFixture(t), transport = captureReplay(t);
  const before = await readFile(path.join(context.corpusRoot, context.article.fixturePath));
  const golden = await readFile(new URL('../papers/s41586-026-10401-1/index.md', import.meta.url));
  const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport });
  assert.equal(report.exitCode, 0, JSON.stringify(report)); assert.equal(report.results[0].cause, 'EXPECTED_WARNING');
  assert.equal(report.results[0].severity, 'warning');
  assert.deepEqual(report.results[0].signatures.frozen, report.results[0].signatures.observed);
  assert.deepEqual(await readFile(path.join(context.corpusRoot, context.article.fixturePath)), before);
  assert.deepEqual(await readFile(new URL('../papers/s41586-026-10401-1/index.md', import.meta.url)), golden);
  assert.deepEqual(await readdir(context.corpusRoot), ['fixtures']);
  const implementation = await readFile(new URL('../scripts/verify-nature-corpus-live.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(implementation, /\bwritePaper\b|\bwriteFile\b|\bmkdir\b|\bdownloadFigureAssets\b/u);
  transport.assertClean({ expectedRequests: [{ url: syntheticUrl, method: 'GET', redirect: 'manual' }], expectedDns: [resolution] });
});

test('same retained structure with changed scholarly payload reports drift, not parser regression', async t => {
  const context = await controllerFixture(t);
  const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison,
    transport: captureReplay(t, syntheticHtml.replace('Synthetic live verifier', 'Changed synthetic live title')) });
  assert.equal(report.results[0].cause, 'FIXTURE_DRIFT'); assert.equal(report.exitCode, 3);
  assert.equal(report.results[0].changes[0].structureChanged, false);
  assert.equal(report.results[0].changes[0].payloadChanged, true);
  assert.equal(report.results[0].failedAssertions[0].id, 'synthetic-title');
});

test('moved retained wrapper and missing selected block retain usable-body markup evidence', async t => {
  for (const html of [syntheticHtml.replace('id="body" class=', 'id="body" data-test="new-wrapper" class='),
    syntheticHtml.replace('id="body" class=', 'id="moved-body" class=')]) {
    const context = await controllerFixture(t);
    const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport: captureReplay(t, html) });
    assert.equal(report.results[0].cause, 'UPSTREAM_MARKUP_CHANGE'); assert.equal(report.exitCode, 3);
    assert.equal(report.results[0].identity.substantialBody, true);
  }
});

test('new live parser exception stays unclassified with no parser retry', async t => {
  const context = await controllerFixture(t), html = syntheticHtml.replace('</main>', '<p>Injected live parse failure</p></main>');
  const transport = captureReplay(t, html);
  const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport,
    clipImpl: options => { if (options.html.includes('Injected live parse failure')) throw new Error('Explicitly mocked new parse failure'); return clipNature(options); } });
  assert.equal(report.results[0].cause, 'UNCLASSIFIED_FAILURE'); assert.equal(report.exitCode, 1);
  assert.equal(report.results[0].phase, 'live-parse'); assert.equal(transport.ledger().requests.length, 1);
});

test('access/challenge pages and idp redirects are incomplete and never retried or followed', async t => {
  for (const [body, options] of [['<form id="challenge-form">Checking your browser</form>', {}],
    [syntheticHtml, { status: 403 }], ['', { status: 302, headers: { location: 'https://idp.nature.com/authorize?code=DO-NOT-REPORT' } }]]) {
    const context = await controllerFixture(t), transport = captureReplay(t, body, options);
    const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport });
    assert.equal(report.results[0].cause, 'ACCESS_BLOCKED'); assert.equal(report.exitCode, 2);
    assert.equal(transport.ledger().requests.length, 1); assert.equal(transport.ledger().resolutions.length, 1);
    assert.doesNotMatch(JSON.stringify(report), /DO-NOT-REPORT|\?code=/u);
  }
});

test('captured access evidence precedes transient HTTP retry without bypassing body guards', async t => {
  const challenge = '<form id="challenge-form">Explicit synthetic challenge; verify you are human.</form>';
  const bodies = [
    { name: 'challenge', body: challenge, access: true },
    { name: 'structured restriction', body: syntheticHtml.replace('"isAccessibleForFree":true', '"isAccessibleForFree":false'), access: true },
    { name: 'preview', body: '<main data-test="subscription-preview">Explicit synthetic preview</main>', access: true },
    { name: 'generic short error', body: '<main>Explicit synthetic temporary server error.</main>', access: false },
    { name: 'navigation login', body: syntheticHtml.replace('<body>', '<body><nav><a href="/login">Log in</a></nav>'), access: false },
  ];
  for (const { name, body, access } of bodies) for (const status of [429, 503]) {
    await t.test(`${name} HTTP ${status}`, async t => {
      const context = await controllerFixture(t), transport = captureReplay(t, body, { status, headers: { 'retry-after': '0' } }), waits = [];
      assert.equal(inspectSource(body, context.article).accessSignals.length > 0, access);
      const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport,
        sleep: async milliseconds => { waits.push(milliseconds); } });
      const entry = report.results[0], ledger = transport.ledger();
      t.diagnostic(JSON.stringify({ name, status, cause: entry.cause, requests: ledger.requests.length, waits }));
      assert.equal(entry.cause, access ? 'ACCESS_BLOCKED' : 'NETWORK_FAILURE'); assert.equal(report.exitCode, 2);
      assert.equal(ledger.requests.length, access ? 1 : 3); assert.equal(ledger.resolutions.length, access ? 1 : 3);
      assert.equal(entry.attempts.length, access ? 1 : 3); assert.equal(waits.length, access ? 0 : 2);
      assert.ok(entry.transport.exchanges.every(exchange => exchange.status === status));
      if (access) assert.ok(entry.transport.exchanges[0].accessSignals.length);
    });
  }
  for (const { name, body, access } of bodies.filter(value => value.name !== 'generic short error')) {
    await t.test(`${name} HTTP 200`, async t => {
      const context = await controllerFixture(t), transport = captureReplay(t, body);
      const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport,
        sleep() { assert.fail('A successful capture must not retry'); } });
      assert.equal(report.results[0].cause, access ? 'ACCESS_BLOCKED' : 'EXPECTED_WARNING');
      assert.equal(transport.ledger().requests.length, 1); assert.equal(report.results[0].attempts.length, 1);
    });
  }
  for (const mode of ['content-type', 'declared-size', 'partial-body-timeout']) {
    await t.test(`challenge behind ${mode} guard`, async t => {
      const context = await controllerFixture(t), transport = captureReplay(t), waits = [];
      let cancelled = 0;
      const report = await runVerifier({ ...defaultOptions, timeoutMs: 20 }, { ...context, comparisonApi: syntheticComparison,
        sleep: async milliseconds => { waits.push(milliseconds); }, transport: { ...transport,
          fetchImpl: async (...args) => {
            await transport.fetchImpl(...args);
            if (mode === 'partial-body-timeout') return new Response(new ReadableStream({
              start(controller) { controller.enqueue(Buffer.from(challenge)); },
              pull: () => new Promise(() => {}), cancel() { cancelled += 1; },
            }), { status: 503, headers: { 'content-type': 'text/html', 'retry-after': '0' } });
            return new Response(challenge, { status: 503, headers: {
              'content-type': mode === 'content-type' ? 'application/json' : 'text/html',
              ...(mode === 'declared-size' ? { 'content-length': String(25 * 1024 * 1024 + 1) } : {}),
            } });
          },
        } });
      const entry = report.results[0], attempts = mode === 'partial-body-timeout' ? 3 : 1;
      assert.equal(entry.cause, 'NETWORK_FAILURE'); assert.equal(entry.attempts.length, attempts);
      assert.equal(transport.ledger().requests.length, attempts); assert.equal(waits.length, attempts - 1);
      assert.equal(cancelled, mode === 'partial-body-timeout' ? 3 : 0);
      assert.ok(entry.transport.exchanges.every(exchange => !exchange.accessSignals?.length));
      assert.ok(entry.transport.exchanges.every(exchange => exchange.error.code ===
        (mode === 'content-type' ? 'CONTENT_TYPE' : mode === 'declared-size' ? 'BODY_TOO_LARGE' : 'BODY_TIMEOUT')));
    });
  }
});

test('captured table access evidence stops retries through the same bounded reader', async t => {
  const url = `${syntheticUrl}/tables/1`;
  const html = syntheticHtml.replace('</main>', `<figure id="Tab1"><figcaption><span data-test="table-caption">Table 1 Synthetic transport case.</span></figcaption><a data-test="table-link" href="${url}">Full table</a></figure></main>`);
  for (const status of [429, 503]) await t.test(`HTTP ${status}`, async t => {
    const context = await controllerFixture(t, html), waits = [];
    context.article.resources = [{ id: 'synthetic-table-1', kind: 'table', url, method: 'GET', redirect: 'manual',
      responseMocked: true, status: 200, contentType: 'text/html',
      body: '<table><tr><th>Synthetic transport</th></tr><tr><td>Declared</td></tr></table>' }];
    const transport = createReplay({ resources: [
      { url: syntheticUrl, method: 'GET', redirect: 'manual', responseMocked: true, status: 200,
        headers: { 'content-type': 'text/html' }, bodyBytes: Buffer.from(html) },
      { url, method: 'GET', redirect: 'manual', responseMocked: true, status,
        headers: { 'content-type': 'text/html', 'retry-after': '0' },
        bodyBytes: Buffer.from('<form id="challenge-form">Explicit synthetic table challenge; verify you are human.</form>') },
    ], dns: publicDns });
    t.after(() => transport.assertClean());
    const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport,
      sleep: async milliseconds => { waits.push(milliseconds); } });
    const entry = report.results[0];
    t.diagnostic(JSON.stringify({ status, cause: entry.cause, requests: transport.ledger().requests.length, waits }));
    assert.equal(entry.cause, 'ACCESS_BLOCKED'); assert.equal(report.exitCode, 2);
    assert.equal(entry.tableAttempts.length, 1); assert.equal(transport.ledger().requests.length, 2); assert.deepEqual(waits, []);
    assert.equal(entry.transport.exchanges.at(-1).status, status); assert.ok(entry.transport.exchanges.at(-1).accessSignals.length);
  });
});

test('DNS guard rejects a private answer before HTTP without retry or live DNS', async t => {
  const context = await controllerFixture(t), transport = captureReplay(t, syntheticHtml,
    { dns: { 'www.nature.com': [{ address: '127.0.0.1', family: 4 }] } });
  const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport });
  assert.equal(report.results[0].cause, 'NETWORK_FAILURE'); assert.equal(report.exitCode, 2);
  assert.equal(transport.ledger().requests.length, 0); assert.equal(transport.ledger().resolutions.length, 1);
  assert.match(report.results[0].error, /local or private/u);
});

test('bounded transient article retries respect Retry-After and stop after two retries', async t => {
  for (const statuses of [[429, 503, 200], [503, 503, 503]]) {
    const context = await controllerFixture(t), waits = [];
    const transport = sequenceReplay(t, statuses.map(status => ({ status, headers: { 'retry-after': '999999999' } })));
    const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport,
      sleep: milliseconds => { waits.push(milliseconds); } });
    assert.equal(transport.requests().length, 3); assert.deepEqual(waits, [MAX_RETRY_AFTER_MS, MAX_RETRY_AFTER_MS]);
    assert.equal(report.results[0].attempts.length, 3);
    assert.equal(report.exitCode, statuses.at(-1) === 200 ? 0 : 2);
  }
  assert.equal(retryAfterMs('bad'), 0); assert.equal(retryAfterMs('0'), 0);
  assert.equal(retryAfterMs('1.5'), 1500); assert.equal(retryAfterMs('Wed, 01 Jan 2020 00:00:02 GMT', Date.UTC(2020, 0, 1)), 2000);
  assert.equal(retryAfterMs('Wed, 01 Jan 2099 00:00:00 GMT', 0), MAX_RETRY_AFTER_MS);
});

test('permanent HTTP and wrong content type failures do not retry', async t => {
  for (const options of [{ status: 404 }, { headers: { 'content-type': 'application/octet-stream' } },
    { headers: { 'content-type': 'text/html-malicious' } }]) {
    const context = await controllerFixture(t), transport = captureReplay(t, syntheticHtml, options);
    const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport });
    assert.equal(report.results[0].cause, 'NETWORK_FAILURE'); assert.equal(report.exitCode, 2);
    assert.equal(transport.ledger().requests.length, 1); assert.equal(report.results[0].attempts.length, 1);
  }
});

test('bounded injected table reader rejects declared/streamed size and cancels a body timeout', async () => {
  for (const response of [() => new Response('123456', { headers: { 'content-type': 'text/html', 'content-length': '6' } }),
    () => new Response('123456', { headers: { 'content-type': 'text/html' } })]) {
    const bounded = createBoundedTransport({ fetchImpl: async () => response(), resolveHostname: async () => [], maxBytes: 5 });
    await assert.rejects(() => bounded.fetchImpl(tableUrl, { redirect: 'manual' }), /exceeds 5 bytes/u);
    assert.equal(bounded.facts().exchanges[0].error.code, 'BODY_TOO_LARGE');
  }
  let cancelled = false;
  const bounded = createBoundedTransport({ timeoutMs: 10, resolveHostname: async () => [],
    fetchImpl: async () => new Response(new ReadableStream({ pull: () => new Promise(() => {}), cancel: () => { cancelled = true; } }),
      { headers: { 'content-type': 'text/html' } }) });
  await assert.rejects(() => bounded.fetchImpl(tableUrl, { redirect: 'manual' }), /timed out after 10 ms/u);
  assert.equal(cancelled, true); assert.equal(bounded.facts().exchanges[0].error.code, 'BODY_TIMEOUT');
});

test('bounded transport also times out a stalled DNS or header promise', async () => {
  const bounded = createBoundedTransport({ timeoutMs: 10, fetchImpl: () => new Promise(() => {}), resolveHostname: () => new Promise(() => {}) });
  await assert.rejects(() => bounded.resolveHostname('www.nature.com', { all: true, verbatim: true }), /timed out/u);
  await assert.rejects(() => bounded.fetchImpl(syntheticUrl, { redirect: 'manual' }), /timed out/u);
});

test('guarded table redirects keep final body limits, cancellation and the existing parent signal', async t => {
  const revised = `${articleUrl}/tables/revision-2`;
  for (const mode of ['declared-oversize', 'streamed-oversize', 'stalled-body']) {
    const transport = replay([{ status: 303, location: revised }, { url: revised, status: 200, body: '' }]);
    t.after(() => transport.assertClean({ expectedRequests: [request(), request(revised)], expectedDns: [resolution, resolution] }));
    let cancelled = 0;
    const parentSignals = [];
    const bounded = createBoundedTransport({ timeoutMs: 20, maxBytes: 5,
      resolveHostname: transport.resolveHostname,
      fetchImpl: async (url, options) => {
        const response = await transport.fetchImpl(url, options);
        if (url !== revised) return response;
        const body = new ReadableStream({
          start(controller) { if (mode !== 'stalled-body') controller.enqueue(new Uint8Array(6)); },
          pull: () => new Promise(() => {}),
          cancel() { cancelled += 1; },
        });
        return new Response(body, { headers: { 'content-type': 'text/html',
          ...(mode === 'declared-oversize' ? { 'content-length': '6' } : {}) } });
      } });
    const table = { label: 'Synthetic redirect body', url: tableUrl };
    await hydrateNatureTables([table], articleUrl, { resolveHostname: bounded.resolveHostname,
      fetchImpl: (url, options) => { parentSignals.push(options.signal); return bounded.fetchImpl(url, options); } });
    assert.equal(table.tableContentStatus, 'fallback-fetch-failed');
    assert.equal(parentSignals.length, 2);
    assert.ok(parentSignals[0] instanceof AbortSignal);
    assert.equal(parentSignals[0], parentSignals[1]); // Existing 20 s guard spans redirect hops.
    assert.equal(cancelled, 1);
    assert.deepEqual(bounded.facts().exchanges.map(exchange => exchange.status), [303, 200]);
    const last = bounded.facts().exchanges.at(-1);
    assert.equal(last.error.code, mode === 'stalled-body' ? 'BODY_TIMEOUT' : 'BODY_TOO_LARGE');
    assert.equal(bounded.captureFor(tableUrl), undefined);
  }
});

test('a stalled article body retries only the bounded transient timeout and never reaches parsing', async t => {
  const context = await controllerFixture(t), transport = captureReplay(t);
  let cancelled = 0;
  const report = await runVerifier({ ...defaultOptions, timeoutMs: 20 }, { ...context, comparisonApi: syntheticComparison,
    sleep: async () => {}, transport: { ...transport, fetchImpl: async (...args) => {
      await transport.fetchImpl(...args);
      return new Response(new ReadableStream({ pull: () => new Promise(() => {}), cancel: () => { cancelled += 1; } }), { headers: { 'content-type': 'text/html' } });
    } } });
  assert.equal(report.exitCode, 2); assert.equal(report.results[0].cause, 'NETWORK_FAILURE');
  assert.equal(report.results[0].phase, 'live-capture'); assert.equal(cancelled, 3);
  assert.equal(report.results[0].attempts.length, 3);
  assert.ok(report.results[0].transport.exchanges.every(exchange => exchange.error.code === 'BODY_TIMEOUT'));
});

test('access status and permanent body/type guards prevent retries despite transient transport facts', async t => {
  for (const mode of ['forbidden-stall', '503-oversize', '503-content-type']) {
    const context = await controllerFixture(t), transport = captureReplay(t);
    let cancelled = 0;
    const report = await runVerifier({ ...defaultOptions, timeoutMs: 20 }, { ...context, comparisonApi: syntheticComparison,
      sleep() { assert.fail('Access/permanent guard failure must not retry'); },
      transport: { ...transport, fetchImpl: async (...args) => {
        await transport.fetchImpl(...args);
        if (mode === 'forbidden-stall') return new Response(new ReadableStream({
          pull: () => new Promise(() => {}), cancel() { cancelled += 1; },
        }), { status: 403, headers: { 'content-type': 'text/html' } });
        return new Response('Explicit mocked permanent guard failure', { status: 503,
          headers: { 'content-type': mode === '503-content-type' ? 'text/plain' : 'text/html',
            ...(mode === '503-oversize' ? { 'content-length': String(25 * 1024 * 1024 + 1) } : {}) } });
      } } });
    assert.equal(report.exitCode, 2);
    assert.equal(report.results[0].cause, mode === 'forbidden-stall' ? 'ACCESS_BLOCKED' : 'NETWORK_FAILURE');
    assert.equal(report.results[0].attempts.length, 1);
    assert.equal(transport.ledger().requests.length, 1);
    assert.equal(cancelled, mode === 'forbidden-stall' ? 1 : 0);
  }
});

test('declared oversize never waits for a broken cancellation and non-streaming bodies are refused', async () => {
  const bounded = createBoundedTransport({ timeoutMs: 20, maxBytes: 5, resolveHostname: async () => [],
    fetchImpl: async () => ({ status: 200, headers: new Headers({ 'content-type': 'text/html', 'content-length': '6' }),
      body: { cancel: () => new Promise(() => {}) } }) });
  await assert.rejects(() => bounded.fetchImpl(tableUrl, { redirect: 'manual' }), /exceeds 5 bytes/u);
  let read = false;
  const unsupported = createBoundedTransport({ maxBytes: 5, resolveHostname: async () => [],
    fetchImpl: async () => ({ status: 200, headers: new Headers({ 'content-type': 'text/html' }), body: {},
      arrayBuffer: () => { read = true; return new ArrayBuffer(100); } }) });
  await assert.rejects(() => unsupported.fetchImpl(tableUrl, { redirect: 'manual' }), /incremental bounds/u);
  assert.equal(read, false);
});

test('partial injected transports and unknown article IDs never permit a network fallback', async t => {
  const context = await controllerFixture(t);
  const invalid = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport: { fetchImpl: async () => { throw new Error('must not run'); } } });
  assert.equal(invalid.exitCode, 64);
  const unknown = await runVerifier({ ...defaultOptions, articleId: 'unknown' }, { ...context, comparisonApi: syntheticComparison, transport: captureReplay(t) });
  assert.equal(unknown.exitCode, 64);
});

test('CLI help/usage run in a subprocess without importing a writer or touching live transport', async () => {
  for (const [args, wanted] of [[['--help'], 0], [['--unknown', '--json'], 64], [['--timeout', '0'], 64], [['--article', 'definitely-unknown', '--json'], 64]]) {
    const response = await new Promise(resolve => {
      const child = spawn(process.execPath, ['scripts/verify-nature-corpus-live.mjs', ...args], { cwd: rootForTests(), windowsHide: true });
      let stdout = '', stderr = '';
      child.stdout.on('data', chunk => { stdout += chunk; }); child.stderr.on('data', chunk => { stderr += chunk; });
      child.on('close', code => resolve({ code, stdout, stderr }));
    });
    assert.equal(response.code, wanted); assert.doesNotMatch(response.stderr, /\n\s+at /u);
    if (args.includes('--json')) assert.equal(JSON.parse(response.stdout).results[0].cause, 'USAGE_ERROR');
  }
});
function rootForTests() { return fileURLToPath(new URL('..', import.meta.url)); }

test('PASS runs the real production pipeline and same projection in all three dialects', async t => {
  const complete = fixture.replaceAll('s41586-026-10401-1', syntheticId)
    .replace('<head>', '<head id="metadata">').replace('<div class="c-article-body">', '<div id="body" class="c-article-body">');
  const context = await controllerFixture(t, complete, 'Fixture title');
  for (const citationStyle of ['markdown', 'links', 'quarto']) {
    const report = await runVerifier({ ...defaultOptions, citationStyle }, { ...context,
      comparisonApi: syntheticComparison, transport: captureReplay(t, complete) });
    assert.equal(report.exitCode, 0, JSON.stringify(report)); assert.equal(report.results[0].cause, 'PASS');
    assert.equal(report.results[0].severity, 'pass');
    assert.deepEqual(report.results[0].signatures.frozen, report.results[0].signatures.observed);
    assert.deepEqual(report.results[0].warnings.fullPage.unexpected, []);
  }
});

test('unexpected warning in a live-only block never becomes PASS or EXPECTED_WARNING', async t => {
  const context = await controllerFixture(t), html = syntheticHtml.replace('</main>', '<p>Injected new warning</p></main>');
  const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport: captureReplay(t, html),
    clipImpl: async options => {
      const parsed = await clipNature(options);
      if (options.html.includes('Injected new warning')) parsed.debug.warnings.push('Explicit unexpected synthetic warning.');
      return parsed;
    } });
  assert.equal(report.results[0].cause, 'UNCLASSIFIED_FAILURE'); assert.equal(report.exitCode, 1);
  assert.deepEqual(report.results[0].warnings.fullPage.unexpected, ['Explicit unexpected synthetic warning.']);
});

test('a repeated full-page warning beyond its declared multiplicity stays unclassified', async t => {
  const context = await controllerFixture(t), html = syntheticHtml.replace('</body>', '<p>Injected repeated warning</p></body>');
  const warning = 'No equation nodes were detected.';
  const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport: captureReplay(t, html),
    clipImpl: async options => {
      const parsed = await clipNature(options);
      if (options.html.includes('Injected repeated warning')) parsed.debug.warnings.push(warning);
      return parsed;
    } });
  assert.deepEqual(report.results[0].signatures.frozen, report.results[0].signatures.observed);
  assert.equal(report.results[0].cause, 'UNCLASSIFIED_FAILURE'); assert.equal(report.exitCode, 1);
  assert.deepEqual(report.results[0].warnings.fullPage.unexpected, [warning]);
});

test('changed markup plus new validator failure retains both facts without asserting causality', async t => {
  const context = await controllerFixture(t), html = syntheticHtml.replace('</main>', '<p>Injected validator failure</p></main>');
  const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport: captureReplay(t, html),
    clipImpl: async options => {
      const parsed = await clipNature(options);
      if (options.html.includes('Injected validator failure')) parsed.markdown += '\n<div>Explicit mocked raw HTML regression evidence</div>\n';
      return parsed;
    } });
  assert.equal(report.results[0].cause, 'UNCLASSIFIED_FAILURE'); assert.equal(report.exitCode, 1);
  assert.equal(report.results[0].changes[0].structureChanged, true);
  assert.equal(report.results[0].validators.fullPage.rawHtml.valid, false);
  assert.ok(report.results[0].signatures.observed.structureSha256);
});

test('live table body guard remains enforced through hydration after its error is caught as fallback', async t => {
  const html = syntheticHtml.replace('</main>', `<figure id="Tab1"><figcaption><span data-test="table-caption">Table 1 Synthetic transport case.</span></figcaption><a data-test="table-link" href="${syntheticUrl}/tables/1">Full table</a></figure></main>`);
  const context = await controllerFixture(t, html);
  context.article.resources = [{ id: 'synthetic-table-1', kind: 'table', url: `${syntheticUrl}/tables/1`,
    method: 'GET', redirect: 'manual', responseMocked: true, status: 200, contentType: 'text/html',
    body: '<table><tr><th>Synthetic transport</th></tr><tr><td>Declared</td></tr></table>' }];
  const transport = createReplay({ resources: [
    { url: syntheticUrl, method: 'GET', redirect: 'manual', responseMocked: true, status: 200,
      headers: { 'content-type': 'text/html' }, bodyBytes: Buffer.from(html) },
    { url: `${syntheticUrl}/tables/1`, method: 'GET', redirect: 'manual', responseMocked: true, status: 200,
      // Exact production cap 25 MiB; declared oversize is rejected before consuming.
      headers: { 'content-type': 'text/html' }, bodyBytes: Buffer.from('Synthetic body') },
  ], dns: publicDns });
  t.after(() => transport.assertClean());
  const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison,
    transport: { ...transport, fetchImpl: async (url, options) => {
      const response = await transport.fetchImpl(url, options);
      if (url.endsWith('/tables/1')) response.headers.set('content-length', String(25 * 1024 * 1024 + 1));
      return response;
    } } });
  assert.equal(report.exitCode, 2, JSON.stringify(report)); assert.equal(report.results[0].cause, 'NETWORK_FAILURE');
  assert.equal(report.results[0].phase, 'live-resources');
  assert.equal(report.results[0].transport.exchanges.at(-1).error.code, 'BODY_TOO_LARGE');
  assert.equal(transport.ledger().requests.filter(request => request.url.endsWith('/tables/1')).length, 1);
  // Initial hydration only; oversized content is not transient.
});

test('undeclared live replay table operation fails integrity even when hydration swallows it', async t => {
  const html = syntheticHtml.replace('</main>', `<figure id="Tab1"><figcaption><span data-test="table-caption">Table 1 Synthetic transport case.</span></figcaption><a data-test="table-link" href="${syntheticUrl}/tables/1">Full table</a></figure></main>`);
  const context = await controllerFixture(t, html);
  context.article.resources = [{ id: 'synthetic-table-1', kind: 'table', url: `${syntheticUrl}/tables/1`,
    method: 'GET', redirect: 'manual', responseMocked: true, status: 200, contentType: 'text/html',
    body: '<table><tr><th>Synthetic</th></tr><tr><td>Declared</td></tr></table>' }];
  const transport = createReplay({ resources: [{ url: syntheticUrl, method: 'GET', redirect: 'manual', responseMocked: true,
    status: 200, headers: { 'content-type': 'text/html' }, bodyBytes: Buffer.from(html) }], dns: publicDns });
  const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport });
  assert.equal(report.exitCode, 1); assert.equal(report.results.at(-1).cause, 'FIXTURE_INTEGRITY_FAILURE');
  assert.throws(() => transport.assertClean(), /Unexpected HTTP\/DNS ledger/u);
});

test('connection reset and temporary DNS failures retry twice through the bounded transport', async t => {
  for (const kind of ['http', 'dns']) {
    const context = await controllerFixture(t), transport = captureReplay(t);
    let attempts = 0;
    const mock = { ...transport,
      fetchImpl: async (...args) => {
        const response = await transport.fetchImpl(...args);
        if (kind === 'http' && ++attempts <= 2) throw Object.assign(new Error('Explicit mocked connection reset'), { code: 'ECONNRESET' });
        return response;
      },
      resolveHostname: async (...args) => {
        const records = await transport.resolveHostname(...args);
        if (kind === 'dns' && ++attempts <= 2) throw Object.assign(new Error('Explicit mocked temporary DNS failure'), { code: 'EAI_AGAIN' });
        return records;
      } };
    const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport: mock, sleep: async () => {} });
    assert.equal(report.exitCode, 0, JSON.stringify(report)); assert.equal(report.results[0].attempts.length, 3);
    assert.equal(transport.ledger().resolutions.length, 3); assert.equal(transport.ledger().requests.length, kind === 'http' ? 3 : 1);
  }
});

test('transient live table failures retry through fresh guarded full clips at most twice', async t => {
  const html = syntheticHtml.replace('</main>', `<figure id="Tab1"><figcaption><span data-test="table-caption">Table 1 Synthetic transport case.</span></figcaption><a data-test="table-link" href="${syntheticUrl}/tables/1">Full table</a></figure></main>`);
  for (const statuses of [[503, 200], [503, 503, 503]]) {
    const context = await controllerFixture(t, html);
    context.article.resources = [{ id: 'synthetic-table-1', kind: 'table', url: `${syntheticUrl}/tables/1`,
      method: 'GET', redirect: 'manual', responseMocked: true, status: 200, contentType: 'text/html',
      body: '<table><tr><th>Synthetic transport</th></tr><tr><td>Declared</td></tr></table>' }];
    const exchanges = statuses.map(status => createReplay({ resources: [
      { url: syntheticUrl, method: 'GET', redirect: 'manual', responseMocked: true, status: 200,
        headers: { 'content-type': 'text/html' }, bodyBytes: Buffer.from(html) },
      { url: `${syntheticUrl}/tables/1`, method: 'GET', redirect: 'manual', responseMocked: true, status,
        headers: { 'content-type': 'text/html', 'retry-after': '0' },
        bodyBytes: Buffer.from('<table><tr><th>Synthetic transport</th></tr><tr><td>Declared</td></tr></table>') },
    ], dns: publicDns }));
    let index = 0;
    const waits = [], transport = {
      resolveHostname: (...args) => exchanges[index].resolveHostname(...args),
      fetchImpl: async (url, options) => {
        const response = await exchanges[index].fetchImpl(url, options);
        if (url.endsWith('/tables/1')) index += 1;
        return response;
      },
      assertClean: () => exchanges.forEach(exchange => exchange.assertClean()),
    };
    t.after(() => transport.assertClean());
    const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport,
      sleep: async milliseconds => { waits.push(milliseconds); } });
    assert.equal(index, statuses.length); assert.equal(report.results[0].tableAttempts.length, statuses.length);
    assert.deepEqual(waits, statuses.slice(1).map(() => 0));
    assert.equal(report.exitCode, statuses.at(-1) === 200 ? 0 : 2, JSON.stringify(report));
    const ledger = exchanges.flatMap(exchange => exchange.ledger().requests);
    assert.equal(ledger.filter(request => request.url === syntheticUrl).length, 1);
    assert.equal(ledger.filter(request => request.url.endsWith('/tables/1')).length, statuses.length);
  }
});

test('fixture-backed resource comparison retries a transient table when the live page inlines it', async t => {
  // Explicit synthetic unit data exercises the schema's fixture-backed branch;
  // neither these generated hashes nor responseMocked:false claim real admission.
  const cells = '<table><tr><th>Synthetic transport</th></tr><tr><td>Declared</td></tr></table>';
  const tablePage = `<!doctype html><html><body><main id="table-source"><h1>Synthetic table</h1>${cells}</main></body></html>`;
  const figure = `<figure id="Tab1"><figcaption><span data-test="table-caption">Table 1 Synthetic transport case.</span></figcaption><a data-test="table-link" href="${syntheticUrl}/tables/1">Full table</a></figure>`;
  const frozenHtml = syntheticHtml.replace('</main>', `${figure}</main>`);
  const liveHtml = frozenHtml.replace('</figure>', `${cells}</figure>`);
  for (const statuses of [[503, 200], [503, 503, 503]]) {
    const context = await controllerFixture(t, frozenHtml);
    const recipe = { version: '1.0.0', id: 'synthetic-table-v1', articleUrl: syntheticUrl,
      blocks: [{ id: 'synthetic-table-body', selector: '#table-source', role: 'table-response' }], removeSelectors: [] };
    const table = sanitizeNatureHtml(tablePage, recipe), fixturePath = `fixtures/${syntheticId}/tables/table-1.excerpt.html`;
    await mkdir(path.join(context.corpusRoot, 'fixtures', syntheticId, 'tables'), { recursive: true });
    await writeFile(path.join(context.corpusRoot, fixturePath), table.bytes);
    context.article.resources = [{ id: 'synthetic-table-1', kind: 'table', url: `${syntheticUrl}/tables/1`,
      method: 'GET', redirect: 'manual', responseMocked: false, status: 200, contentType: 'text/html',
      fixturePath, sourceSha256: sha256Bytes(Buffer.from(tablePage)), fixtureSha256: table.fixtureSha256,
      sanitizerVersion: table.sanitizerVersion, serializerVersion: table.serializerVersion,
      recipe, retainedBlocks: table.retainedBlocks, transformations: table.transformations, omittedContent: [],
      observedAt: '2026-10-04T00:00:00Z', captureMode: 'guarded-http' }];
    const exchanges = statuses.map(status => createReplay({ resources: [
      { url: syntheticUrl, method: 'GET', redirect: 'manual', responseMocked: true, status: 200,
        headers: { 'content-type': 'text/html' }, bodyBytes: Buffer.from(liveHtml) },
      { url: `${syntheticUrl}/tables/1`, method: 'GET', redirect: 'manual', responseMocked: true, status,
        headers: { 'content-type': 'text/html', 'retry-after': '0' }, bodyBytes: Buffer.from(tablePage) },
    ], dns: publicDns }));
    let index = 0;
    const transport = {
      resolveHostname: (...args) => exchanges[index].resolveHostname(...args),
      fetchImpl: async (url, options) => {
        const response = await exchanges[index].fetchImpl(url, options);
        if (url.endsWith('/tables/1')) index += 1;
        return response;
      },
      assertClean: () => exchanges.forEach(exchange => exchange.assertClean()),
    };
    t.after(() => transport.assertClean());
    const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport, sleep: async () => {} });
    assert.equal(index, statuses.length, JSON.stringify(report));
    assert.equal(report.results[0].tableAttempts.length, statuses.length);
    assert.equal(report.results[0].cause, statuses.at(-1) === 200 ? 'UPSTREAM_MARKUP_CHANGE' : 'NETWORK_FAILURE');
    if (statuses.at(-1) === 200) {
      const signature = report.results[0].signatures.resources[0];
      assert.deepEqual(signature.frozen, signature.observed);
      assert.deepEqual(report.results[0].failedAssertions, []);
    }
    assert.equal(exchanges.flatMap(exchange => exchange.ledger().requests).filter(operation => operation.url === syntheticUrl).length, 1);
  }
});

test('mixed controller results preserve each article and parser/network/drift exit precedence', async t => {
  const contexts = [];
  for (const id of ['synthetic-drift', 'synthetic-network', 'synthetic-parser']) {
    contexts.push(await controllerFixture(t, syntheticHtml.replaceAll(syntheticId, id), 'Synthetic live verifier', id));
  }
  const corpusRoot = contexts[0].corpusRoot;
  for (const context of contexts.slice(1)) {
    await mkdir(path.join(corpusRoot, 'fixtures', context.article.articleId), { recursive: true });
    await writeFile(path.join(corpusRoot, context.article.fixturePath), await readFile(path.join(context.corpusRoot, context.article.fixturePath)));
  }
  contexts[2].article.expectations[0].value = 'Deliberately incorrect synthetic frozen oracle';
  const resources = contexts.slice(0, 2).map((context, index) => ({ url: context.article.url, method: 'GET', redirect: 'manual',
    responseMocked: true, status: index === 1 ? 404 : 200, headers: { 'content-type': 'text/html' },
    bodyBytes: Buffer.from(syntheticHtml.replaceAll(syntheticId, context.article.articleId).replace('Synthetic live verifier', 'Changed synthetic title')) }));
  const transport = createReplay({ resources, dns: publicDns });
  t.after(() => transport.assertClean({ expectedRequests: resources.map(({ url, method, redirect }) => ({ url, method, redirect })), expectedDns: [resolution, resolution] }));
  const report = await runVerifier(defaultOptions, { manifest: { schemaVersion: '1.0.0', articles: contexts.map(context => context.article) },
    corpusRoot, comparisonApi: syntheticComparison, transport });
  assert.equal(report.results.length, 3); assert.equal(report.exitCode, 1);
  assert.deepEqual(report.results.map(result => result.cause).sort(), ['FIXTURE_DRIFT', 'NETWORK_FAILURE', 'PARSER_REGRESSION']);
  assert.deepEqual(report.results.map(result => result.articleId).sort(), contexts.map(context => context.article.articleId).sort());
});

test('article redirects cannot escape article or SSRF scope before another DNS/HTTP operation', async t => {
  for (const location of ['https://www.nature.com/articles/other', 'https://public.example/escaped', 'http://127.0.0.1/private']) {
    const context = await controllerFixture(t), transport = captureReplay(t, '', { status: 302, headers: { location } });
    const report = await runVerifier(defaultOptions, { ...context, comparisonApi: syntheticComparison, transport });
    assert.equal(report.exitCode, 2); assert.equal(report.results[0].cause, 'NETWORK_FAILURE');
    assert.equal(transport.ledger().requests.length, 1); assert.equal(transport.ledger().resolutions.length, 1);
    assert.equal(report.results[0].attempts.length, 1);
  }
});

test('frozen-source integration consumes actual C API and records all9 entries without live network fallback', async t => {
  const corpusRoot = path.join(rootForTests(), 'test', 'corpus');
  const manifest = JSON.parse(await readFile(path.join(corpusRoot, 'corpus-manifest.json')));
  const resources = await Promise.all(manifest.articles.map(async article => ({ url: article.url, method: 'GET', redirect: 'manual',
    responseMocked: true, status: 200, headers: { 'content-type': 'text/html' }, bodyBytes: await readFile(path.join(corpusRoot, article.fixturePath)) })));
  for (const article of manifest.articles) for (const resource of article.resources) resources.push({ url: resource.url,
    method: 'GET', redirect: 'manual', responseMocked: true, status: resource.status,
    headers: { 'content-type': resource.contentType }, bodyBytes: await readFile(path.join(corpusRoot, resource.fixturePath)) });
  const transport = createReplay({ resources, dns: publicDns });
  t.after(() => transport.assertClean());
  const comparisons = [];
  const report = await runVerifier(defaultOptions, { manifest, corpusRoot, comparisonApi: {
    assertionRegistry,
    compareArticleResult(...args) {
      const comparison = compareArticleResult(...args);
      comparisons.push(comparison);
      return comparison;
    },
  }, transport });
  assert.equal(ASSERTION_VERSION, '1.0.0');
  assert.equal(assertionRegistry.size, 10);
  // These are the actual helper's first nine calls, before any ready article's
  // projected comparison. Collect a receipt without running the corpus twice.
  const offlineComparisons = comparisons.slice(0, manifest.articles.length);
  assert.deepEqual(offlineComparisons.map(comparison => comparison.articleId), manifest.articles.map(article => article.articleId));
  const executions = offlineComparisons.flatMap(comparison => comparison.expectations);
  assert.equal(executions.length, manifest.articles.reduce((count, article) => count + article.expectations.length, 0));
  assert.equal(report.results.length, 9);
  const reported = report.results.filter(result => result.articleId).map(result => result.articleId).sort();
  assert.deepEqual(reported, manifest.articles.map(article => article.articleId).sort());
  for (const entry of report.results) {
    if (entry.phase === 'offline-assertions') {
      assert.equal(entry.cause, 'PARSER_REGRESSION');
      assert.equal(transport.ledger().requests.filter(request => request.url.startsWith(`https://www.nature.com/articles/${entry.articleId}`)).length, 0);
    }
  }
  // No required failing C source expectation is converted into a passing result.
  assert.equal(report.exitCode, exitCode(report.results));
  const invalidValidators = (validators, prefix = '') => Object.entries(validators).flatMap(([key, value]) =>
    'valid' in value ? value.valid ? [] : [`${prefix}${key}`] : invalidValidators(value, `${prefix}${key}.`));
  t.diagnostic(JSON.stringify({ assertionVersion: ASSERTION_VERSION, consumers: assertionRegistry.size,
    citationStyle: report.citationStyle, sourceExecutions: executions.length,
    sourcePass: executions.filter(execution => execution.status === 'pass').length,
    sourceFailure: executions.filter(execution => execution.status !== 'pass').length,
    exitCode: report.exitCode, results: report.results.map(entry => ({ articleId: entry.articleId, phase: entry.phase, cause: entry.cause,
      failedAssertions: entry.failedAssertions.map(execution => ({ id: execution.id, paths: execution.failures.map(failure => failure.path) })),
      invalidValidators: invalidValidators(entry.validators), warnings: entry.warnings })), ledger: transport.ledger() }));
});
