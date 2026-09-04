import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { installDomGlobals } from './dom-runtime.mjs';
import { htmlToMarkdown, defuddleToMarkdown } from './markdown.mjs';
import { articleIdFromUrl, isNatureUrl, parseNaturePage } from './adapters/nature.mjs';
import { semanticMarker } from './normalizers/markers.mjs';
import { normalizeMath } from './normalizers/math.mjs';
import { normalizeAcademicInline } from './normalizers/academic-inline.mjs';
import { normalizeAnchorMarkers, normalizeCitations } from './normalizers/citations.mjs';
import { renderFigure, renderFigures, renderTables } from './normalizers/figures.mjs';

function yamlQuote(value) {
  return JSON.stringify(String(value ?? ''));
}

function frontmatter(metadata) {
  const lines = [
    '---',
    `title: ${yamlQuote(metadata.title)}`,
    'authors:',
    ...(metadata.authors.length ? metadata.authors.map((author) => `  - ${yamlQuote(author)}`) : ['  - ""']),
    `journal: ${yamlQuote(metadata.journal || 'Nature')}`,
    `doi: ${yamlQuote(metadata.doi)}`,
    `url: ${yamlQuote(metadata.url)}`,
    `date: ${yamlQuote(metadata.date)}`,
  ];
  if (metadata.volume) lines.push(`volume: ${yamlQuote(metadata.volume)}`);
  if (metadata.issue) lines.push(`issue: ${yamlQuote(metadata.issue)}`);
  if (metadata.pages) lines.push(`pages: ${yamlQuote(metadata.pages)}`);
  lines.push('---', '');
  return `${lines.join('\n')}\n`;
}

function normalizeMarkdown(markdown, semantic) {
  return normalizeCitations(
      normalizeAcademicInline(
      normalizeMath(markdown, semantic),
    ),
    semantic.citations,
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
    lines.push(`<a id="${reference.anchor}"></a>`, `${reference.number}. ${converted}`);
  }
  return lines.join('\n');
}

export function renderClipMarkdown(result, imagePathByAnchor = new Map()) {
  const semantic = result.semantic;
  let body = normalizeMarkdown(result.bodyMarkdown, semantic);
  body = normalizeAnchorMarkers(body, semantic.crossReferences.values());
  body = applyFigurePlaceholders(body, result.figures, imagePathByAnchor);
  const extendedFigures = renderFigures(
    result.figures.filter((figure) => figure.source === 'supplementary figure'),
    imagePathByAnchor,
  );
  const tables = renderTables(result.tables);
  const sections = [body, extendedFigures, tables, result.referencesMarkdown].filter(Boolean);
  const markdownBody = `# ${result.metadata.title}\n\n${sections.join('\n\n')}`.trim();
  return `${frontmatter(result.metadata)}${markdownBody}\n`;
}

export async function clipNature({ html, url, rawHtml = html }) {
  if (!isNatureUrl(url)) throw new Error('This prototype only supports Nature article URLs.');

  const parsedPage = parseNaturePage(html, url);
  installDomGlobals(parsedPage.dom);
  const { parsed, markdown } = await defuddleToMarkdown(parsedPage.document, url);

  const intermediate = {
    articleId: articleIdFromUrl(url),
    metadata: parsedPage.metadata,
    figures: parsedPage.figures,
    tables: parsedPage.tables,
    references: parsedPage.references,
    semantic: parsedPage.semantic,
    bodyMarkdown: markdown,
    referencesMarkdown: await referencesMarkdown(parsedPage.references, url),
  };
  const fullMarkdown = renderClipMarkdown(intermediate);
  const debug = {
    ...parsedPage.debug,
    title: parsedPage.metadata.title,
    articleId: articleIdFromUrl(url),
    defuddleTitle: parsed.title || '',
    defuddleWordCount: parsed.wordCount || 0,
    markdownCharacters: fullMarkdown.length,
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
  };
  if (byType[type]) return byType[type];
  try {
    const extension = path.extname(new URL(imageUrl).pathname).toLowerCase();
    return extension && extension.length <= 5 ? extension : '.bin';
  } catch {
    return '.bin';
  }
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
      downloads.push({ label: figure.label, anchor: figure.anchor, sourceUrl, status: 'deduped', localPath: existing.localPath });
      continue;
    }

    const entry = { label: figure.label, anchor: figure.anchor, sourceUrl, status: 'pending' };
    try {
      const response = await fetch(sourceUrl, { headers: { 'user-agent': 'academic-clipper/0.2' } });
      entry.status = response.status;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const extension = extensionFor(response.headers.get('content-type'), sourceUrl);
      const filename = `fig${uniqueIndex + 1}${extension}`;
      const localPath = path.join(figuresDir, filename);
      await writeFile(localPath, Buffer.from(await response.arrayBuffer()));
      entry.localPath = `figures/${filename}`;
      byUrl.set(sourceUrl, entry);
      imagePathByAnchor.set(figure.anchor, entry.localPath);
      uniqueIndex += 1;
    } catch (error) {
      if (entry.status === 'pending') entry.status = 'error';
      entry.error = error instanceof Error ? error.message : String(error);
      result.debug.warnings.push(`Figure download failed for ${figure.label}: ${entry.error}`);
    }
    downloads.push(entry);
  }
  return { imagePathByAnchor, downloads };
}

export async function writePaper(result, { libraryPath, downloadFigures = true, saveDebug = false }) {
  const { destination } = safeArticleDirectory(libraryPath, result.articleId);
  await mkdir(destination, { recursive: true });
  let imagePathByAnchor = new Map();
  result.debug.figureDownloads = [];

  if (downloadFigures && result.figures.length) {
    const figuresDir = path.join(destination, 'figures');
    await mkdir(figuresDir, { recursive: true });
    const downloaded = await downloadFigureAssets(result, figuresDir);
    imagePathByAnchor = downloaded.imagePathByAnchor;
    result.debug.figureDownloads = downloaded.downloads;
  }

  const markdown = renderClipMarkdown(result, imagePathByAnchor);
  await writeFile(path.join(destination, 'index.md'), markdown, 'utf8');
  if (saveDebug) {
    await writeFile(path.join(destination, 'raw.html'), result.rawHtml, 'utf8');
    await writeFile(path.join(destination, 'cleaned.html'), result.cleanedHtml, 'utf8');
    await writeFile(path.join(destination, 'debug.json'), `${JSON.stringify(result.debug, null, 2)}\n`, 'utf8');
  }

  return {
    directory: destination,
    relativePath: `${result.articleId}/index.md`,
    markdown,
    debug: result.debug,
  };
}
