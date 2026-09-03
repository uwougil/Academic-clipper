import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { installDomGlobals } from './dom-runtime.mjs';
import { htmlToMarkdown, defuddleToMarkdown } from './markdown.mjs';
import { articleIdFromUrl, isNatureUrl, parseNaturePage } from './adapters/nature.mjs';

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

function normalizeInlineMath(markdown) {
  // Do not interpret TeX commands such as \[ ... \] inside an existing
  // $$...$$ block as a second display-math delimiter. Nature equations use
  // those commands for matrices and grouped terms.
  const blocks = [];
  const protectedMarkdown = markdown.replace(/\$\$[\s\S]*?\$\$/g, (block) => {
    const token = `\uE000${blocks.length}\uE001`;
    blocks.push(block);
    return token;
  });

  const normalized = protectedMarkdown
    // Defuddle escapes dollar delimiters when the source is a MathJax span.
    .replaceAll('\\$', '$')
    .replace(/\\+\(([^\n]*?)\\+\)/g, (_, expression) => {
      const inner = expression.replace(/\\\\/g, '\\');
      return `$${inner.trim()}$`;
    })
    .replace(/\\+\[([\s\S]*?)\\+\]/g, (_, expression) => `$$\n${expression.trim()}\n$$`)
    .replace(/\[\^(\d+)\]/g, '[$1]');

  return normalizeBlockMath(normalized.replace(/\uE000(\d+)\uE001/g, (_, index) => blocks[Number(index)]));
}

function normalizeBlockMath(markdown) {
  return markdown.replace(/\$\$([\s\S]*?)\$\$/g, (_, expression) => {
    // The Nature/Defuddle path can carry TeX through one extra escaping
    // layer. Pairwise unescaping keeps TeX row breaks (four slashes become
    // the intended two) while restoring commands such as \\begin and \\hat.
    const tex = expression
      .replace(/\\\\/g, '\\')
      .replaceAll('\\[', '\\left[')
      .replaceAll('\\]', '\\right]');
    return `$$${tex}$$`;
  });
}

function normalizeMarkdown(markdown) {
  return normalizeInlineMath(markdown)
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/(^|\n)## References\n(?=\n## |\n*$)/g, '$1')
    .trim();
}

function figureMarkdown(figures) {
  if (!figures.length) return '';
  const blocks = [];
  for (const figure of figures) {
    blocks.push(`## ${figure.label}`, '', `![${figure.caption}](${figure.imageUrl})`, '', `**${figure.caption}**`, '');
  }
  return blocks.join('\n').trim();
}

function tableMarkdown(tables) {
  if (!tables.length) return '';
  const lines = ['## Tables', ''];
  for (const table of tables) {
    lines.push(`- **${table.caption}**${table.url ? ` ([Full size table](${table.url}))` : ''}`);
  }
  return lines.join('\n');
}

async function referencesMarkdown(references, url) {
  if (!references.length) return '';
  const lines = ['## References', ''];
  for (const reference of references) {
    // Defuddle is reused for inline emphasis/links; the visible reference
    // text is kept as a single numbered Markdown item.
    let converted = await htmlToMarkdown(`<p>${reference.text}</p>`, url);
    converted = normalizeMarkdown(converted).replace(/^[-*]\s+/, '').replace(/\n+/g, ' ');
    if (reference.doi && !converted.includes(reference.doi)) {
      converted += ` [doi:${reference.doi}](https://doi.org/${encodeURIComponent(reference.doi)})`;
    }
    lines.push(`${reference.number}. ${converted}`);
  }
  return lines.join('\n');
}

export async function clipNature({ html, url, rawHtml = html }) {
  if (!isNatureUrl(url)) {
    throw new Error('This prototype only supports Nature article URLs.');
  }

  const parsedPage = parseNaturePage(html, url);
  installDomGlobals(parsedPage.dom);

  const { parsed, markdown } = await defuddleToMarkdown(parsedPage.document, url);
  const body = normalizeMarkdown(markdown);
  const figures = figureMarkdown(parsedPage.figures);
  const tables = tableMarkdown(parsedPage.tables);
  const references = await referencesMarkdown(parsedPage.references, url);
  const sections = [body, figures, tables, references].filter(Boolean);
  const markdownBody = `# ${parsedPage.metadata.title}\n\n${sections.join('\n\n')}`.trim();
  const fullMarkdown = `${frontmatter(parsedPage.metadata)}${markdownBody}\n`;

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
    articleId: articleIdFromUrl(url),
    metadata: parsedPage.metadata,
    figures: parsedPage.figures,
    tables: parsedPage.tables,
    references: parsedPage.references,
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
  const byType = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg' };
  if (byType[type]) return byType[type];
  try {
    const extension = path.extname(new URL(imageUrl).pathname).toLowerCase();
    return extension && extension.length <= 5 ? extension : '.bin';
  } catch {
    return '.bin';
  }
}

export async function writePaper(result, { libraryPath, downloadFigures = false, saveDebug = false }) {
  const { destination } = safeArticleDirectory(libraryPath, result.articleId);
  await mkdir(destination, { recursive: true });
  let markdown = result.markdown;

  if (downloadFigures && result.figures.length) {
    const figuresDir = path.join(destination, 'figures');
    await mkdir(figuresDir, { recursive: true });
    for (let index = 0; index < result.figures.length; index += 1) {
      const figure = result.figures[index];
      try {
        const response = await fetch(figure.imageUrl, { headers: { 'user-agent': 'academic-clipper/0.1' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const extension = extensionFor(response.headers.get('content-type'), figure.imageUrl);
        const filename = `fig${index + 1}${extension}`;
        await writeFile(path.join(figuresDir, filename), Buffer.from(await response.arrayBuffer()));
        markdown = markdown.replaceAll(`](${figure.imageUrl})`, `](figures/${filename})`);
      } catch (error) {
        result.debug.warnings.push(`Figure download failed for ${figure.label}: ${error.message}`);
      }
    }
  }

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
