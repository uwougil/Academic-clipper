import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { installDomGlobals } from './dom-runtime.mjs';
import { htmlToMarkdown, defuddleToMarkdown } from './markdown.mjs';
import { articleIdFromUrl, isNatureUrl, parseNaturePage } from './adapters/nature.mjs';
import { semanticMarker } from './normalizers/markers.mjs';
import { normalizeMath } from './normalizers/math.mjs';
import { normalizeAcademicInline } from './normalizers/academic-inline.mjs';
import { normalizeAnchorMarkers, normalizeCitations } from './normalizers/citations.mjs';
import { normalizeFigureCaptions, renderFigure, renderFigures, renderTables } from './normalizers/figures.mjs';
import { MathDelimiterValidationError, validateMathDelimiters } from './validators/math-delimiters.mjs';
import { validateMarkdownStructure } from './validators/markdown-structure.mjs';
import { safeExternalUrl } from './security.mjs';
import { ACADEMIC_CLIPPER_USER_AGENT } from './version.mjs';

const FIGURE_FETCH_TIMEOUT_MS = 20_000;
const MAX_FIGURE_BYTES = 20 * 1024 * 1024;

function yamlQuote(value) {
  return JSON.stringify(String(value ?? ''));
}

function frontmatter(metadata, citationStyle = 'links') {
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

function normalizeMarkdown(markdown, semantic, references, citationStyle) {
  return normalizeCitations(
      normalizeAcademicInline(
      normalizeMath(markdown, semantic),
    ),
    semantic.citations,
    { style: citationStyle, references },
  )
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/(^|\n)## References\n(?=\n## |\n*$)/g, '$1')
    .trim();
}

function applyFigurePlaceholders(markdown, figures, imagePathByAnchor) {
  let result = markdown;
  for (const figure of figures.filter((item) => item.source === 'inline figure')) {
    result = result.replaceAll(
      semanticMarker('FIGURE', figure.anchor),
      renderFigure(figure, imagePathByAnchor.get(figure.anchor) || figure.imageUrl),
    );
  }
  return result;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character]));
}

async function referencesMarkdown(references, url) {
  if (!references.length) return '';
  const lines = ['## References', ''];
  for (const reference of references) {
    let converted = await htmlToMarkdown(`<p>${escapeHtml(reference.text)}</p>`, url);
    converted = normalizeAcademicInline(normalizeMath(converted))
      .replace(/^[-*]\s+/, '')
      .replace(/\n+/g, ' ')
      .trim();
    if (reference.doi && !converted.includes(reference.doi)) {
      converted += ` [doi:${reference.doi}](https://doi.org/${encodeURIComponent(reference.doi)})`;
    }
    lines.push(`${reference.number}. ${converted} <a id="${reference.anchor}"></a>`, '');
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

export function referencesBib(references) {
  return references.map((reference) => {
    const year = reference.text.match(/\b(?:19|20)\d{2}\b/u)?.[0] || '';
    const author = reference.text.split(/\.\s+/u)[0] || `Reference ${reference.number}`;
    const doi = reference.doi || reference.text.match(/10\.\d{4,9}\/[^\s)]+/u)?.[0] || '';
    return [
      `@misc{${reference.citationKey || `ref${reference.number}`},`,
      `  author = {${bibEscape(author)}},`,
      ...(year ? [`  year = {${year}},`] : []),
      `  note = {${bibEscape(reference.text)}},`,
      ...(doi ? [`  doi = {${bibEscape(doi)}},`] : []),
      '}',
      '',
    ].join('\n');
  }).join('\n').trimEnd() + '\n';
}

export function renderClipMarkdown(result, imagePathByAnchor = new Map()) {
  const semantic = result.semantic;
  let body = normalizeMarkdown(result.bodyMarkdown, semantic, result.references, result.citationStyle);
  body = normalizeAnchorMarkers(body, semantic.crossReferences.values());
  body = applyFigurePlaceholders(body, result.figures, imagePathByAnchor);
  const extendedFigures = renderFigures(
    result.figures.filter((figure) => figure.source === 'supplementary figure'),
    imagePathByAnchor,
  );
  const tables = renderTables(result.tables);
  const sections = [body, extendedFigures, tables, result.referencesMarkdown].filter(Boolean);
  const markdownBody = `# ${result.metadata.title}\n\n${sections.join('\n\n')}`.trim();
  return `${frontmatter(result.metadata, result.citationStyle)}${markdownBody}\n`;
}

export async function clipNature({ html, url, rawHtml = html, citationStyle = 'links' }) {
  if (!isNatureUrl(url)) throw new Error('This prototype only supports Nature article URLs.');
  if (!['links', 'quarto'].includes(citationStyle)) throw new Error('citationStyle must be links or quarto.');

  const parsedPage = parseNaturePage(html, url);
  if (parsedPage.debug.articleRoot !== '.c-article-body') {
    throw new Error('Nature article body was not found; refusing to write a non-article page.');
  }
  installDomGlobals(parsedPage.dom);
  await normalizeFigureCaptions(parsedPage.figures, url);
  const { parsed, markdown } = await defuddleToMarkdown(parsedPage.document, url);

  const intermediate = {
    articleId: articleIdFromUrl(url),
    metadata: parsedPage.metadata,
    figures: parsedPage.figures,
    tables: parsedPage.tables,
    references: parsedPage.references,
    semantic: parsedPage.semantic,
    citationStyle,
    bodyMarkdown: markdown,
    referencesMarkdown: await referencesMarkdown(parsedPage.references, url),
  };
  const fullMarkdown = renderClipMarkdown(intermediate);
  const debug = {
    ...parsedPage.debug,
    title: parsedPage.metadata.title,
    articleId: articleIdFromUrl(url),
    citationStyle,
    defuddleTitle: parsed.title || '',
    defuddleWordCount: parsed.wordCount || 0,
    markdownCharacters: fullMarkdown.length,
    mathValidation: validateMathDelimiters(fullMarkdown),
    markdownStructure: validateMarkdownStructure(fullMarkdown),
    warnings: [...parsedPage.debug.warnings],
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

async function downloadFigureAssets(result, figuresDir) {
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
      const safeUrl = safeExternalUrl(sourceUrl);
      const response = await fetch(safeUrl, {
        headers: { 'user-agent': ACADEMIC_CLIPPER_USER_AGENT },
        signal: AbortSignal.timeout(FIGURE_FETCH_TIMEOUT_MS),
      });
      entry.status = response.status;
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

export async function writePaper(result, { libraryPath, downloadFigures = true, saveDebug = false }) {
  const { root, destination } = safeArticleDirectory(libraryPath, result.articleId);
  const remoteMarkdown = renderClipMarkdown(result, new Map());
  const remoteValidation = validateMathDelimiters(remoteMarkdown);
  if (!remoteValidation.valid) {
    result.debug.mathValidation = remoteValidation;
    throw new MathDelimiterValidationError(remoteValidation, path.join(destination, 'index.md'));
  }
  const remoteStructure = validateMarkdownStructure(remoteMarkdown);
  if (!remoteStructure.valid) throw new Error(`Markdown structure validation failed: ${JSON.stringify(remoteStructure.issues)}`);

  await mkdir(root, { recursive: true });
  const tempPrefix = `.academic-clipper-${String(result.articleId).replace(/[^a-z0-9-]/gi, '-')}-`;
  const staging = await mkdtemp(path.join(root, tempPrefix));
  let imagePathByAnchor = new Map();
  result.debug.figureDownloads = [];

  try {
    if (downloadFigures && result.figures.length) {
      const figuresDir = path.join(staging, 'figures');
      await mkdir(figuresDir, { recursive: true });
      const downloaded = await downloadFigureAssets(result, figuresDir);
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
    const markdownStructure = validateMarkdownStructure(markdown);
    result.debug.markdownStructure = markdownStructure;
    if (!markdownStructure.valid) throw new Error(`Markdown structure validation failed: ${JSON.stringify(markdownStructure.issues)}`);

    await writeFile(path.join(staging, 'index.md'), markdown, 'utf8');
    if (saveDebug) {
      await writeFile(path.join(staging, 'raw.html'), result.rawHtml, 'utf8');
      await writeFile(path.join(staging, 'cleaned.html'), result.cleanedHtml, 'utf8');
      await writeFile(path.join(staging, 'debug.json'), `${JSON.stringify(result.debug, null, 2)}\n`, 'utf8');
    }
    if (result.citationStyle === 'quarto') {
      await writeFile(path.join(staging, 'references.bib'), referencesBib(result.references), 'utf8');
    }

    await mkdir(destination, { recursive: true });
    if (downloadFigures && result.figures.length) {
      await mkdir(path.join(destination, 'figures'), { recursive: true });
      for (const figure of result.figures) {
        const localPath = imagePathByAnchor.get(figure.anchor);
        if (!localPath) continue;
        const filename = path.basename(localPath);
        await copyFile(path.join(staging, 'figures', filename), path.join(destination, 'figures', filename));
      }
    }
    await copyFile(path.join(staging, 'index.md'), path.join(destination, 'index.md'));
    if (result.citationStyle === 'quarto') {
      await copyFile(path.join(staging, 'references.bib'), path.join(destination, 'references.bib'));
    }
    if (saveDebug) {
      await copyFile(path.join(staging, 'raw.html'), path.join(destination, 'raw.html'));
      await copyFile(path.join(staging, 'cleaned.html'), path.join(destination, 'cleaned.html'));
      await copyFile(path.join(staging, 'debug.json'), path.join(destination, 'debug.json'));
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
