import { createHash, randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { withDomGlobals } from './dom-runtime.mjs';
import { htmlToMarkdown, defuddleToMarkdown } from './markdown.mjs';
import { articleIdFromUrl, hydrateNatureTables, isNatureUrl, parseNaturePage } from './adapters/nature.mjs';
import { semanticMarker } from './normalizers/markers.mjs';
import { normalizeMath } from './normalizers/math.mjs';
import { normalizeAcademicInline } from './normalizers/academic-inline.mjs';
import { normalizeAnchorMarkers, normalizeCitations } from './normalizers/citations.mjs';
import { normalizeFigureCaptions, normalizeTableContents, renderFigure, renderFigures, renderTables } from './normalizers/figures.mjs';
import { MathDelimiterValidationError, validateMathDelimiters } from './validators/math-delimiters.mjs';
import { validateMarkdownStructure } from './validators/markdown-structure.mjs';
import { RawHtmlValidationError, maskCode, validateRawHtml } from './validators/html-audit.mjs';
import { CrossReferenceValidationError, collectDocumentTargets, validateCrossReferences } from './validators/cross-references.mjs';
import { safeFetchExternal } from './security.mjs';
import { ACADEMIC_CLIPPER_USER_AGENT } from './version.mjs';
import { outputPolicy } from './renderers/output-policy.mjs';

const FIGURE_FETCH_TIMEOUT_MS = 20_000;
const MAX_FIGURE_BYTES = 20 * 1024 * 1024;
const WRITER_LOCK_TIMEOUT_MS = 30_000;
const WRITER_LOCK_RETRY_MS = 100;
const WRITER_LOCK_STALE_MS = 5 * 60_000;
const WRITER_LOCK_DEAD_GRACE_MS = 2_000;
const writerQueues = new Map();

async function withWriterLock(key, task) {
  const previous = writerQueues.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  writerQueues.set(key, current);
  await previous;
  try {
    return await task();
  } finally {
    release();
    if (writerQueues.get(key) === current) writerQueues.delete(key);
  }
}

function yamlQuote(value) {
  return JSON.stringify(String(value ?? ''));
}

function frontmatter(metadata, citationStyle = 'markdown') {
  const lines = [
    '---',
    `title: ${yamlQuote(metadata.title)}`,
    'authors:',
    ...(metadata.authors.length ? metadata.authors.map((author) => `  - ${yamlQuote(author)}`) : ['  - ""']),
    `journal: {name: ${yamlQuote(metadata.journal || 'Nature')}}`,
    `doi: ${yamlQuote(metadata.doi)}`,
    `url: ${yamlQuote(metadata.url)}`,
    `date: ${yamlQuote(metadata.date)}`,
  ];
  if (metadata.volume) lines.push(`volume: ${yamlQuote(metadata.volume)}`);
  if (metadata.issue) lines.push(`issue: ${yamlQuote(metadata.issue)}`);
  if (metadata.pages) lines.push(`pages: ${yamlQuote(metadata.pages)}`);
  if (citationStyle === 'quarto') lines.push('bibliography: "references.bib"');
  lines.push('---', '');
  return `${lines.join('\n')}\n`;
}

function renderAuthorInformation(metadata) {
  const info = metadata.authorInformation || {};
  const sections = [];
  if (info.notes?.length) {
    sections.push(['## Author notes', '', ...info.notes.map((note) => `- ${note}`)].join('\n'));
  }
  if (info.affiliations?.length) {
    sections.push([
      '## Authors and affiliations', '',
      ...info.affiliations.map((item) => `- ${item.authors || 'Authors'} — ${item.address || 'Affiliation not provided'}`),
    ].join('\n'));
  }
  if (info.contributions) sections.push(`## Author contributions\n\n${info.contributions}`);
  if (info.correspondence?.text) {
    const email = info.correspondence.email?.replace(/^mailto:/iu, '');
    const contact = email ? `${info.correspondence.text} [${email}](mailto:${email})` : info.correspondence.text;
    sections.push(`## Correspondence\n\n${contact}`);
  }
  return sections.join('\n\n');
}

function metadataAudit(metadata) {
  const info = metadata.authorInformation || {};
  return {
    authorInformation: info.notes?.length || info.affiliations?.length ? 'captured' : 'not-found',
    authorContributions: info.contributions ? 'captured' : 'not-found',
    correspondence: info.correspondence?.text ? 'captured' : 'not-found',
    publisherNotes: metadata.publisherNotes?.length ? 'captured-in-peer-review-section' : 'not-found',
  };
}

function normalizeMarkdown(markdown, semantic, references, policy) {
  return normalizeCitations(
      normalizeAcademicInline(
      normalizeMath(markdown, semantic),
    ),
    semantic.citations,
    { policy, references },
  )
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/(^|\n)## References\n(?=\n## |\n*$)/g, '$1')
    .trim();
}

function applyFigurePlaceholders(markdown, figures, imagePathByAnchor, policy) {
  let result = markdown;
  for (const figure of figures.filter((item) => item.source === 'inline figure')) {
    result = result.replaceAll(
      semanticMarker('FIGURE', figure.anchor),
      renderFigure(figure, imagePathByAnchor.get(figure.anchor) || figure.imageUrl, policy),
    );
  }
  return result;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character]));
}

function cleanDoi(value) {
  return String(value || '')
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//iu, '')
    .replace(/[.,;:)]+$/u, '');
}

function doiUrl(doi) {
  return `https://doi.org/${cleanDoi(doi).replace(/\s+/gu, '')}`;
}

async function referenceText(reference, url) {
  let converted = await htmlToMarkdown(`<p>${escapeHtml(reference.text)}</p>`, url);
  converted = normalizeAcademicInline(normalizeMath(converted))
    .replace(/^[-*]\s+/, '')
    .replace(/\n+/g, ' ')
    .trim();
  const doi = cleanDoi(reference.doi);
  if (doi && !converted.includes(doi)) converted += ` [doi:${doi}](${doiUrl(doi)})`;
  return converted;
}

async function referencesMarkdown(references, url, policy = outputPolicy()) {
  if (!references.length) return '';
  if (policy.references === 'refs') return ['## References', '', '::: {#refs}', ':::'].join('\n');
  const lines = ['## References', ''];
  for (const reference of references) {
    const converted = await referenceText(reference, url);
    if (policy.references === 'ordered-list') lines.push(`${reference.number}. ${converted} <a id="${reference.anchor}"></a>`, '');
    else lines.push(`[^${reference.number}]: ${converted}`, '');
  }
  return lines.join('\n').trimEnd();
}

function bibEscape(value) {
  return String(value || '')
    .replace(/[\r\n]+/gu, ' ')
    .replace(/[{}]/gu, '')
    .replace(/\\/gu, '\\\\')
    .trim();
}

function bibAuthor(value) {
  const source = bibEscape(value)
    .replace(/\s*&\s*/gu, ', ')
    .replace(/\s+and\s+/giu, ', ');
  return source
    .split(/,\s+(?=\p{Lu}\p{Ll}[\p{L}'’.-]*(?:\s+\p{Lu}\p{Ll}[\p{L}'’.-]*)*,\s*\p{Lu})/gu)
    .map((author) => author.trim())
    .filter(Boolean)
    .join(' and ')
    .replace(/\bet al\.?\b/giu, 'and others');
}

function parseReferenceFields(text, year) {
  const source = String(text || '');
  const authorEnd = source.search(/\.\s+(?!(?:&|and|et al)\b)(?![A-ZÀ-ÖØ-Þ]\.(?:\s|,))[A-Za-zÀ-ÖØ-öø-ÿ]/u);
  if (authorEnd < 0) return null;
  const author = source.slice(0, authorEnd);
  const remainder = source.slice(authorEnd + 1).trim();
  const match = remainder.match(/^(.*?)\.\s+(.+?)\s+(\d+),\s+([^()]+?)\s+\((\d{4})\)/u);
  if (!match) return { author };
  return {
    author,
    title: match[1].trim(),
    journal: match[2].trim(),
    volume: match[3],
    pages: match[4].trim(),
    year: match[5] || year,
  };
}

export function referencesBib(references) {
  return references.map((reference) => {
    const year = reference.text.match(/\b(?:19|20)\d{2}\b/u)?.[0] || '';
    const author = reference.text.split(/\.\s+/u)[0] || `Reference ${reference.number}`;
    const fields = parseReferenceFields(reference.text, year) || { author };
    const entryType = fields.journal ? 'article' : 'misc';
    const doi = reference.doi || reference.text.match(/10\.\d{4,9}\/[^\s)]+/u)?.[0] || '';
    return [
      `@${entryType}{${reference.citationKey || `ref${reference.number}`},`,
      `  author = {${bibAuthor(fields.author || author)}},`,
      ...(fields.title ? [`  title = {${bibEscape(fields.title)}},`] : []),
      ...(fields.journal ? [`  journal = {${bibEscape(fields.journal)}},`] : []),
      ...(fields.volume ? [`  volume = {${bibEscape(fields.volume)}},`] : []),
      ...(fields.pages ? [`  pages = {${bibEscape(fields.pages)}},`] : []),
      ...(year ? [`  year = {${year}},`] : []),
      `  note = {${bibEscape(reference.text)}},`,
      ...(doi ? [`  doi = {${bibEscape(doi)}},`] : []),
      '}',
      '',
    ].join('\n');
  }).join('\n').trimEnd() + '\n';
}

function isKnownScholarlyReference(target, label = '', knownSemanticAnchors = new Set()) {
  if (knownSemanticAnchors.has(target)) return true;
  if (/^(?:figure|fig|extended-data-figure|extended-data-fig|extended-data-table|table|tbl|equation|eq|sec)-/i.test(target)) {
    return true;
  }
  if (/^(?:Figure|Table|Equation|Extended Data)\b/i.test(label)) {
    return true;
  }
  return false;
}

function degradeDanglingInternalLinks(markdown, knownSemanticAnchors = new Set()) {
  const masked = maskCode(markdown);
  const targets = collectDocumentTargets(masked);
  return markdown.replace(/(?<!!)\[([^\]]+)\]\(#([a-zA-Z0-9_.:-]+)\)/g, (fullMatch, label, target) => {
    if (targets.has(target)) return fullMatch;
    if (isKnownScholarlyReference(target, label, knownSemanticAnchors)) {
      return label;
    }
    return fullMatch;
  });
}

export function renderClipMarkdown(result, imagePathByAnchor = new Map()) {
  const semantic = result.semantic;
  const policy = result.outputPolicy || outputPolicy(result.citationStyle);
  let body = normalizeMarkdown(result.bodyMarkdown, semantic, result.references, policy);
  body = normalizeAnchorMarkers(body, semantic.crossReferences.values(), { policy });
  body = applyFigurePlaceholders(body, result.figures, imagePathByAnchor, policy);
  const extendedFigures = renderFigures(
    result.figures.filter((figure) => figure.source === 'supplementary figure'),
    imagePathByAnchor,
    policy,
  );
  const tables = renderTables(result.tables, policy);
  const authorInformation = renderAuthorInformation(result.metadata);
  const sections = [body, extendedFigures, tables, authorInformation, result.referencesMarkdown].filter(Boolean);
  let markdownBody = `# ${result.metadata.title}\n\n${sections.join('\n\n')}`.trim();
  if (!policy.allowHtmlAnchors && policy.dialect !== 'quarto') {
    const knownSemanticAnchors = new Set(
      Array.from(result.semantic?.crossReferences?.values() || []).map((t) => t.anchor),
    );
    markdownBody = degradeDanglingInternalLinks(markdownBody, knownSemanticAnchors);
  }
  return `${frontmatter(result.metadata, policy.dialect === 'quarto' ? 'quarto' : result.citationStyle)}${markdownBody}\n`;
}

export async function clipNature({ html, url, rawHtml = html, citationStyle = 'markdown' }) {
  if (!isNatureUrl(url)) throw new Error('This prototype only supports https://www.nature.com/articles/<id> URLs.');
  if (!['markdown', 'links', 'quarto'].includes(citationStyle)) throw new Error('citationStyle must be markdown, links, or quarto.');
  const policy = outputPolicy(citationStyle);

  const parsedPage = parseNaturePage(html, url);
  if (parsedPage.debug.articleRoot !== '.c-article-body') {
    throw new Error('Nature article body was not found; refusing to write a non-article page.');
  }
  parsedPage.debug.warnings.push(...await hydrateNatureTables(parsedPage.tables, url));
  const converted = await withDomGlobals(parsedPage.dom, async () => {
    await normalizeFigureCaptions(parsedPage.figures, url);
    await normalizeTableContents(parsedPage.tables, url);
    const { parsed, markdown } = await defuddleToMarkdown(parsedPage.document, url);
    return {
      parsed,
      markdown,
      referencesMarkdown: await referencesMarkdown(parsedPage.references, url, policy),
    };
  });

  const intermediate = {
    articleId: articleIdFromUrl(url),
    metadata: parsedPage.metadata,
    figures: parsedPage.figures,
    tables: parsedPage.tables,
    references: parsedPage.references,
    semantic: parsedPage.semantic,
    citationStyle,
    outputPolicy: policy,
    bodyMarkdown: converted.markdown,
    referencesMarkdown: converted.referencesMarkdown,
  };
  const fullMarkdown = renderClipMarkdown(intermediate);
  const debug = {
    ...parsedPage.debug,
    title: parsedPage.metadata.title,
    articleId: articleIdFromUrl(url),
    citationStyle,
    defuddleTitle: converted.parsed.title || '',
    defuddleWordCount: converted.parsed.wordCount || 0,
    markdownCharacters: fullMarkdown.length,
    mathValidation: validateMathDelimiters(fullMarkdown),
    markdownStructure: validateMarkdownStructure(fullMarkdown, { dialect: policy.dialect, citationStyle }),
    rawHtmlValidation: validateRawHtml(fullMarkdown, { allowHtmlAnchors: policy.allowHtmlAnchors }),
    crossReferenceValidation: validateCrossReferences(fullMarkdown, { dialect: policy.dialect, citationStyle }),
    warnings: [...parsedPage.debug.warnings],
    metadataAudit: metadataAudit(parsedPage.metadata),
    tableSummary: {
      totalTables: parsedPage.tables.length,
      capturedTables: parsedPage.tables.filter((table) => table.markdown).length,
      fallbackTables: parsedPage.tables.filter((table) => !table.markdown).length,
      statuses: parsedPage.tables.map((table) => ({
        label: table.label,
        status: table.tableContentStatus || 'unknown',
        warning: table.tableContentWarning || '',
      })),
    },
  };

  return {
    ...intermediate,
    markdown: fullMarkdown,
    rawHtml,
    cleanedHtml: parsedPage.cleanedHtml,
    debug,
  };
}

function safeArticleDirectory(libraryPath, articleId) {
  const root = path.resolve(libraryPath);
  const destination = path.resolve(root, articleId);
  if (!articleId || destination !== root && !destination.startsWith(`${root}${path.sep}`)) {
    throw new Error('Unsafe article output path.');
  }
  return { root, destination };
}

function transactionPrefix(articleId) {
  const digest = createHash('sha256').update(String(articleId)).digest('hex').slice(0, 32);
  return `.academic-clipper-${digest}-`;
}

function lockClaimPrefix(articleId) {
  const digest = createHash('sha256').update(String(articleId)).digest('hex').slice(0, 32);
  return `${digest}-${String(articleId).replace(/[^a-z0-9-]/gi, '-')}.claim-`;
}

function lockDirectory(root, articleId, token) {
  return path.join(root, '.academic-clipper-locks', `${lockClaimPrefix(articleId)}${token}`);
}

function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

async function staleLock(lockDir, staleMs, deadGraceMs = WRITER_LOCK_DEAD_GRACE_MS) {
  let lockStat;
  try {
    lockStat = await stat(lockDir);
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
  let owner = {};
  try {
    owner = JSON.parse(await readFile(path.join(lockDir, 'owner.json'), 'utf8'));
  } catch {
    // A crash between mkdir(lockDir) and owner.json is recoverable by age.
  }
  const createdAt = typeof owner.createdAt === 'number'
    ? owner.createdAt
    : Date.parse(String(owner.createdAt || ''));
  const age = Date.now() - (Number.isFinite(createdAt) ? createdAt : lockStat.mtimeMs);
  const releasedAt = typeof owner.releasedAt === 'number'
    ? owner.releasedAt
    : Date.parse(String(owner.releasedAt || ''));
  if (Number.isFinite(releasedAt)) return true;
  const pid = Number(owner.pid);
  const validOwner = Number.isInteger(pid)
    && pid > 0
    && Number.isFinite(createdAt)
    && typeof owner.token === 'string'
    && owner.token.length > 0;
  if (validOwner) return !processIsAlive(pid) && age >= deadGraceMs;
  return age >= staleMs;
}

async function writerLockClaims(lockRoot, articleId) {
  const prefix = lockClaimPrefix(articleId);
  let entries;
  try {
    entries = await readdir(lockRoot, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(prefix))
    .map((entry) => ({ name: entry.name, path: path.join(lockRoot, entry.name) }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function writerClaimTicket(claimDir) {
  let entries;
  try {
    entries = await readdir(claimDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  const tickets = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name.match(/^ticket-(\d+)$/u)?.[1])
    .filter(Boolean)
    .map((value) => BigInt(value));
  return tickets.length ? tickets.reduce((lowest, value) => value < lowest ? value : lowest) : null;
}

async function removeStaleWriterClaim(claim, {
  staleMs,
  deadGraceMs,
  beforeStaleLockRemoval,
}) {
  if (!await staleLock(claim.path, staleMs, deadGraceMs)) return false;
  await beforeStaleLockRemoval?.(claim.path);
  if (!await staleLock(claim.path, staleMs, deadGraceMs)) return false;
  await rm(claim.path, { recursive: true, force: true });
  return true;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function acquireWriterLock(root, articleId, {
  timeoutMs = WRITER_LOCK_TIMEOUT_MS,
  retryMs = WRITER_LOCK_RETRY_MS,
  staleMs = WRITER_LOCK_STALE_MS,
  deadGraceMs = WRITER_LOCK_DEAD_GRACE_MS,
  removeLock = rm,
  beforeStaleLockRemoval,
} = {}) {
  const lockRoot = path.join(root, '.academic-clipper-locks');
  await mkdir(lockRoot, { recursive: true });
  const deadline = Date.now() + timeoutMs;
  const token = randomBytes(16).toString('hex');
  const lockDir = lockDirectory(root, articleId, token);

  await mkdir(lockDir);
  try {
    try {
      await writeFile(path.join(lockDir, 'owner.json'), `${JSON.stringify({ pid: process.pid, createdAt: Date.now(), token })}\n`, 'utf8');
    } catch (error) {
      await rm(lockDir, { recursive: true, force: true });
      throw error;
    }

    let ownTicket = null;
    while (ownTicket === null) {
      let maxTicket = 0n;
      let removedStaleClaim = false;
      for (const claim of await writerLockClaims(lockRoot, articleId)) {
        if (claim.path === lockDir) continue;
        if (await removeStaleWriterClaim(claim, { staleMs, deadGraceMs, beforeStaleLockRemoval })) {
          removedStaleClaim = true;
          continue;
        }
        const ticket = await writerClaimTicket(claim.path);
        if (ticket !== null && ticket > maxTicket) maxTicket = ticket;
      }
      if (removedStaleClaim) continue;
      ownTicket = maxTicket + 1n;
      await writeFile(path.join(lockDir, `ticket-${ownTicket.toString().padStart(20, '0')}`), '', 'utf8');
    }

    while (true) {
      let blocked = false;
      let removedStaleClaim = false;
      for (const claim of await writerLockClaims(lockRoot, articleId)) {
        if (claim.path === lockDir) continue;
        if (await removeStaleWriterClaim(claim, { staleMs, deadGraceMs, beforeStaleLockRemoval })) {
          removedStaleClaim = true;
          continue;
        }
        const ticket = await writerClaimTicket(claim.path);
        if (ticket === null
          || ticket < ownTicket
          || ticket === ownTicket && claim.name.localeCompare(path.basename(lockDir)) < 0) {
          blocked = true;
        }
      }
      if (!blocked && !removedStaleClaim) break;
      if (Date.now() >= deadline) {
        throw new Error(`Article ${articleId} is already being written by another process.`);
      }
      await wait(Math.min(retryMs, Math.max(1, deadline - Date.now())));
    }

    return {
      async release(onCleanupFailure) {
        const releaseWarning = (error) => `Writer lock cleanup failed; released marker retained for recovery at ${lockDir}: ${error instanceof Error ? error.message : String(error)}`;
        const markReleased = async (warning) => {
          let owner = {};
          try {
            owner = JSON.parse(await readFile(path.join(lockDir, 'owner.json'), 'utf8'));
          } catch {
            // Preserve the local token even if owner metadata was damaged.
          }
          try {
            await writeFile(path.join(lockDir, 'owner.json'), `${JSON.stringify({
              ...owner,
              pid: Number(owner.pid) || process.pid,
              token,
              createdAt: owner.createdAt || Date.now(),
              releasedAt: Date.now(),
              cleanupWarning: warning,
            })}\n`, 'utf8');
          } catch {
            // The warning returned to the caller still exposes the retained lock path.
          }
        };
        try {
          const owner = JSON.parse(await readFile(path.join(lockDir, 'owner.json'), 'utf8'));
          if (owner.token !== token) return { warning: '' };
        } catch (error) {
          if (error.code === 'ENOENT') return { warning: '' };
          const warning = releaseWarning(error);
          await onCleanupFailure?.(warning);
          await markReleased(warning);
          return { warning };
        }
        try {
          await removeLock(lockDir, { recursive: true, force: true });
          return { warning: '' };
        } catch (error) {
          const warning = releaseWarning(error);
          await onCleanupFailure?.(warning);
          await markReleased(warning);
          return { warning };
        }
      },
      directory: lockDir,
    };
  } catch (error) {
    await rm(lockDir, { recursive: true, force: true });
    throw error;
  }
}

async function pathExists(file) {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function completeArticleDirectory(directory) {
  try {
    const index = await stat(path.join(directory, 'index.md'));
    return index.isFile() && index.size > 0;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function transactionDirectories(root, articleId) {
  const prefix = transactionPrefix(articleId);
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(prefix))
    .map((entry) => ({
      name: entry.name,
      path: path.join(root, entry.name),
      backup: entry.name.endsWith('-previous'),
    }));
}

async function recoverArticleDirectory(root, destination, articleId) {
  const transactions = await transactionDirectories(root, articleId);
  if (await pathExists(destination)) {
    await Promise.all(transactions.map((entry) => rm(entry.path, { recursive: true, force: true })));
    return;
  }

  const backups = transactions.filter((entry) => entry.backup);
  const validBackups = [];
  for (const backup of backups) {
    if (await completeArticleDirectory(backup.path)) {
      validBackups.push({ ...backup, modifiedAt: (await stat(backup.path)).mtimeMs });
    }
  }
  if (validBackups.length) {
    validBackups.sort((left, right) => right.modifiedAt - left.modifiedAt || right.name.localeCompare(left.name));
    await rename(validBackups[0].path, destination);
    await Promise.all(transactions
      .filter((entry) => entry.path !== validBackups[0].path)
      .map((entry) => rm(entry.path, { recursive: true, force: true })));
    return;
  }

  // A prepared staging directory is not assumed complete after a crash.
  await Promise.all(transactions.map((entry) => rm(entry.path, { recursive: true, force: true })));
}

async function replaceArticleDirectory(staging, destination, {
  beforeInstall,
  removeBackup = rm,
} = {}) {
  const backup = `${staging}-previous`;
  let previousMoved = false;
  let installed = false;

  try {
    try {
      await rename(destination, backup);
      previousMoved = true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    await beforeInstall?.();
    await rename(staging, destination);
    installed = true;

    let cleanupWarning = '';
    if (previousMoved) {
      try {
        await removeBackup(backup, { recursive: true, force: true });
      } catch (cleanupError) {
        cleanupWarning = `Previous article backup cleanup failed; retained for recovery at ${backup}: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`;
      }
    }
    return { cleanupWarning };
  } catch (error) {
    if (!installed && previousMoved) {
      try {
        await rename(backup, destination);
      } catch (rollbackError) {
        const combined = new Error(`Article directory commit failed and rollback failed: ${error.message}`);
        combined.cause = error;
        combined.rollbackError = rollbackError;
        throw combined;
      }
    }
    throw error;
  }
}

function extensionFor(contentType, imageUrl) {
  const type = String(contentType || '').split(';')[0].toLowerCase();
  const byType = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
  };
  if (byType[type]) return byType[type];
  try {
    const extension = path.extname(new URL(imageUrl).pathname).toLowerCase();
    return extension && extension.length <= 5 ? extension : '.bin';
  } catch {
    return '.bin';
  }
}

async function responseBytes(response) {
  const declaredLength = Number.parseInt(response.headers.get('content-length') || '', 10);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FIGURE_BYTES) {
    throw new Error(`Image exceeds ${MAX_FIGURE_BYTES} byte limit.`);
  }

  if (!response.body?.getReader) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_FIGURE_BYTES) throw new Error(`Image exceeds ${MAX_FIGURE_BYTES} byte limit.`);
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_FIGURE_BYTES) {
        await reader.cancel();
        throw new Error(`Image exceeds ${MAX_FIGURE_BYTES} byte limit.`);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, total);
}

function figureSummary(figures, downloads, downloadFigures) {
  const failedUrls = [...new Set(downloads.filter((entry) => entry.error).map((entry) => entry.sourceUrl))];
  return {
    totalFigures: figures.length,
    localFigures: downloads.filter((entry) => entry.localPath).length,
    remoteFallbackFigures: downloads.filter((entry) => entry.fallback).length,
    failedResources: failedUrls.length,
    failedResourceUrls: failedUrls,
    downloadsEnabled: downloadFigures,
  };
}

async function downloadFigureAssets(result, figuresDir, { fetchImpl, resolveHostname } = {}) {
  const imagePathByAnchor = new Map();
  const downloads = [];
  const byUrl = new Map();
  let uniqueIndex = 0;

  for (const figure of result.figures) {
    const sourceUrl = figure.imageUrl;
    if (!sourceUrl) continue;
    if (byUrl.has(sourceUrl)) {
      const existing = byUrl.get(sourceUrl);
      imagePathByAnchor.set(figure.anchor, existing.localPath);
      downloads.push({
        label: figure.label,
        anchor: figure.anchor,
        sourceUrl,
        status: 'deduped',
        sourceStatus: existing.status,
        localPath: existing.localPath,
        error: existing.error,
        fallback: existing.fallback,
        fallbackPath: existing.fallbackPath,
      });
      continue;
    }

    const entry = { label: figure.label, anchor: figure.anchor, sourceUrl, status: 'pending' };
    byUrl.set(sourceUrl, entry);
    try {
      const { response, url: finalUrl } = await safeFetchExternal(sourceUrl, {
        ...(fetchImpl ? { fetchImpl } : {}),
        ...(resolveHostname ? { resolveHostname } : {}),
        headers: { 'user-agent': ACADEMIC_CLIPPER_USER_AGENT },
        timeoutMs: FIGURE_FETCH_TIMEOUT_MS,
      });
      entry.status = response.status;
      entry.finalUrl = finalUrl;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = String(response.headers.get('content-type') || '').split(';')[0].toLowerCase();
      entry.contentType = contentType;
      if (!contentType.startsWith('image/')) throw new Error(`Unexpected content-type: ${contentType || '(missing)'}`);
      const extension = extensionFor(contentType, sourceUrl);
      const filename = `fig${uniqueIndex + 1}${extension}`;
      const localPath = path.join(figuresDir, filename);
      await writeFile(localPath, await responseBytes(response));
      entry.localPath = `figures/${filename}`;
      imagePathByAnchor.set(figure.anchor, entry.localPath);
      uniqueIndex += 1;
    } catch (error) {
      if (entry.status === 'pending') entry.status = 'error';
      entry.error = error instanceof Error ? error.message : String(error);
      entry.fallback = true;
      entry.fallbackPath = sourceUrl;
      result.debug.warnings.push(`Figure download failed for ${figure.label}: ${entry.error}`);
    }
    downloads.push(entry);
  }
  return { imagePathByAnchor, downloads };
}

export async function writePaper(result, {
  libraryPath,
  downloadFigures = true,
  saveDebug = false,
  beforeInstall,
  removeBackup,
  lockTimeoutMs = WRITER_LOCK_TIMEOUT_MS,
  lockRetryMs = WRITER_LOCK_RETRY_MS,
  lockStaleMs = WRITER_LOCK_STALE_MS,
  lockDeadGraceMs = WRITER_LOCK_DEAD_GRACE_MS,
  removeLock,
  beforeStaleLockRemoval,
  fetchImpl = globalThis.fetch,
  resolveHostname,
}) {
  const { root, destination } = safeArticleDirectory(libraryPath, result.articleId);
  await mkdir(root, { recursive: true });
  return withWriterLock(destination, async () => {
    const lock = await acquireWriterLock(root, result.articleId, {
      timeoutMs: lockTimeoutMs,
      retryMs: lockRetryMs,
      staleMs: lockStaleMs,
      deadGraceMs: lockDeadGraceMs,
      removeLock,
      beforeStaleLockRemoval,
    });
    let saved;
    let operationError;
    try {
      await recoverArticleDirectory(root, destination, result.articleId);
      saved = await writePaperUnlocked(result, {
        root,
        destination,
        downloadFigures,
        saveDebug,
        beforeInstall,
        removeBackup,
        fetchImpl,
        resolveHostname,
      });
    } catch (error) {
      operationError = error;
    }

    let releaseError;
    try {
      await lock.release(async (warning) => {
        if (!saved) return;
        saved.debug.warnings.push(warning);
        if (saveDebug) {
          try {
            await writeFile(path.join(destination, 'debug.json'), `${JSON.stringify(saved.debug, null, 2)}\n`, 'utf8');
          } catch (debugError) {
            saved.debug.warnings.push(`Unable to update debug.json with lock cleanup warning: ${debugError instanceof Error ? debugError.message : String(debugError)}`);
          }
        }
      });
    } catch (error) {
      releaseError = error;
    }
    if (operationError) throw operationError;
    if (releaseError) {
      if (!saved) throw releaseError;
      saved.debug.warnings.push(`Writer lock cleanup failed: ${releaseError instanceof Error ? releaseError.message : String(releaseError)}`);
    }
    return saved;
  });
}

async function writePaperUnlocked(result, {
  root,
  destination,
  downloadFigures,
  saveDebug,
  beforeInstall,
  removeBackup,
  fetchImpl,
  resolveHostname,
}) {
  const remoteMarkdown = renderClipMarkdown(result, new Map());
  const remoteValidation = validateMathDelimiters(remoteMarkdown);
  if (!remoteValidation.valid) {
    result.debug.mathValidation = remoteValidation;
    throw new MathDelimiterValidationError(remoteValidation, path.join(destination, 'index.md'));
  }
  const remoteRawHtmlValidation = validateRawHtml(remoteMarkdown, { allowHtmlAnchors: result.outputPolicy?.allowHtmlAnchors });
  if (!remoteRawHtmlValidation.valid) {
    result.debug.rawHtmlValidation = remoteRawHtmlValidation;
    throw new RawHtmlValidationError(remoteRawHtmlValidation, path.join(destination, 'index.md'));
  }
  const remoteStructure = validateMarkdownStructure(remoteMarkdown, {
    dialect: result.outputPolicy?.dialect,
    citationStyle: result.citationStyle,
  });
  if (!remoteStructure.valid) throw new Error(`Markdown structure validation failed: ${JSON.stringify(remoteStructure.issues)}`);
  const remoteCrossReferences = validateCrossReferences(remoteMarkdown, {
    dialect: result.outputPolicy?.dialect,
    citationStyle: result.citationStyle,
  });
  if (!remoteCrossReferences.valid) {
    result.debug.crossReferenceValidation = remoteCrossReferences;
    throw new CrossReferenceValidationError(remoteCrossReferences, path.join(destination, 'index.md'));
  }

  await mkdir(root, { recursive: true });
  const tempPrefix = transactionPrefix(result.articleId);
  const staging = await mkdtemp(path.join(root, tempPrefix));
  let imagePathByAnchor = new Map();
  result.debug.figureDownloads = [];

  try {
    if (downloadFigures && result.figures.length) {
      const figuresDir = path.join(staging, 'figures');
      await mkdir(figuresDir, { recursive: true });
      const downloaded = await downloadFigureAssets(result, figuresDir, { fetchImpl, resolveHostname });
      imagePathByAnchor = downloaded.imagePathByAnchor;
      result.debug.figureDownloads = downloaded.downloads;
    } else {
      result.debug.figureDownloads = result.figures.map((figure) => ({
        label: figure.label,
        anchor: figure.anchor,
        sourceUrl: figure.imageUrl,
        status: 'disabled',
        fallback: true,
        fallbackPath: figure.imageUrl,
      }));
    }

    result.debug.figureSummary = figureSummary(result.figures, result.debug.figureDownloads, downloadFigures);
    const markdown = renderClipMarkdown(result, imagePathByAnchor);
    const mathValidation = validateMathDelimiters(markdown);
    result.debug.mathValidation = mathValidation;
    if (!mathValidation.valid) throw new MathDelimiterValidationError(mathValidation, path.join(destination, 'index.md'));
    const rawHtmlValidation = validateRawHtml(markdown, { allowHtmlAnchors: result.outputPolicy?.allowHtmlAnchors });
    result.debug.rawHtmlValidation = rawHtmlValidation;
    if (!rawHtmlValidation.valid) throw new RawHtmlValidationError(rawHtmlValidation, path.join(destination, 'index.md'));
    const markdownStructure = validateMarkdownStructure(markdown, {
      dialect: result.outputPolicy?.dialect,
      citationStyle: result.citationStyle,
    });
    result.debug.markdownStructure = markdownStructure;
    if (!markdownStructure.valid) throw new Error(`Markdown structure validation failed: ${JSON.stringify(markdownStructure.issues)}`);
    const crossReferenceValidation = validateCrossReferences(markdown, {
      dialect: result.outputPolicy?.dialect,
      citationStyle: result.citationStyle,
    });
    result.debug.crossReferenceValidation = crossReferenceValidation;
    if (!crossReferenceValidation.valid) throw new CrossReferenceValidationError(crossReferenceValidation, path.join(destination, 'index.md'));

    await writeFile(path.join(staging, 'index.md'), markdown, 'utf8');
    if (saveDebug) {
      await writeFile(path.join(staging, 'raw.html'), result.rawHtml, 'utf8');
      await writeFile(path.join(staging, 'cleaned.html'), result.cleanedHtml, 'utf8');
      await writeFile(path.join(staging, 'debug.json'), `${JSON.stringify(result.debug, null, 2)}\n`, 'utf8');
    }
    if (result.citationStyle === 'quarto') {
      await writeFile(path.join(staging, 'references.bib'), referencesBib(result.references), 'utf8');
    }

    const commit = await replaceArticleDirectory(staging, destination, { beforeInstall, removeBackup });
    if (commit.cleanupWarning) {
      result.debug.warnings.push(commit.cleanupWarning);
      if (saveDebug) {
        try {
          await writeFile(path.join(destination, 'debug.json'), `${JSON.stringify(result.debug, null, 2)}\n`, 'utf8');
        } catch (debugError) {
          result.debug.warnings.push(`Unable to update debug.json with writer cleanup warning: ${debugError instanceof Error ? debugError.message : String(debugError)}`);
        }
      }
    }

    return {
      directory: destination,
      relativePath: `${result.articleId}/index.md`,
      markdown,
      debug: result.debug,
    };
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
