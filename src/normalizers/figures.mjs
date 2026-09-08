import { JSDOM } from 'jsdom';
import { htmlToMarkdown } from '../markdown.mjs';
import { normalizeAcademicInline } from './academic-inline.mjs';
import { normalizeMath } from './math.mjs';

function extractMathSource(value) {
  const text = String(value || '').trim();
  for (const [left, right] of [['\\(', '\\)'], ['\\[', '\\]'], ['$$', '$$']]) {
    if (text.startsWith(left) && text.endsWith(right)) return text.slice(left.length, -right.length).trim();
  }
  return text;
}

function normalizeHtmlUrls(html, url) {
  const dom = new JSDOM(`<div>${html || ''}</div>`, { url });
  const root = dom.window.document.body.firstElementChild;
  for (const anchor of Array.from(root.querySelectorAll('a[href]'))) {
    const href = anchor.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) continue;
    try {
      anchor.setAttribute('href', new URL(href, url).href);
    } catch {
      // Keep an unusual publisher URL unchanged rather than dropping a link.
    }
  }
  return root.innerHTML;
}

function protectCaptionMath(html, url) {
  const dom = new JSDOM(`<div>${html || ''}</div>`);
  const root = dom.window.document.body.firstElementChild;
  const math = [];
  for (const element of Array.from(root.querySelectorAll('.mathjax-tex'))) {
    const tex = extractMathSource(element.textContent);
    if (!tex) continue;
    const marker = `ACADEMICCLIPPERFIGUREMATH${math.length}X`;
    math.push({ marker, tex });
    element.replaceWith(root.ownerDocument.createTextNode(marker));
  }
  return { html: normalizeHtmlUrls(root.innerHTML, url), math };
}

function protectCaptionDirections(html) {
  const dom = new JSDOM(`<div>${html || ''}</div>`);
  const root = dom.window.document.body.firstElementChild;
  const directions = [];
  const walker = root.ownerDocument.createTreeWalker(root, 4);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const next = node.textContent.replace(/\[(\d+(?:[,\s−+\-]\d+)*)\]/gu, (match) => {
      const marker = `ACADEMICCLIPPERFIGUREDIRECTION${directions.length}X`;
      directions.push({ marker, value: match });
      return marker;
    });
    if (next !== node.textContent) node.textContent = next;
  }
  return { html: root.innerHTML, directions };
}

function markdownFragment(html, url) {
  return /<(?:p|div|table|thead|tbody|tr|ul|ol|h[1-6])\b/i.test(html)
    ? htmlToMarkdown(html, url)
    : htmlToMarkdown(`<p>${html}</p>`, url);
}

export async function normalizeFigureCaptions(figures, url) {
  for (const figure of figures) {
    if (!figure.captionHtml) {
      figure.captionMarkdown = figure.caption;
      continue;
    }
    const protectedCaption = protectCaptionMath(figure.captionHtml, url);
    const protectedDirections = protectCaptionDirections(protectedCaption.html);
    let converted = await markdownFragment(protectedDirections.html, url);
    converted = normalizeMath(converted);
    for (const { marker, tex } of protectedCaption.math) converted = converted.replaceAll(marker, `$${tex}$`);
    for (const { marker, value } of protectedDirections.directions) converted = converted.replaceAll(marker, value);
    figure.captionMarkdown = normalizeAcademicInline(converted)
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .trim();
  }
  return figures;
}

function stripOuterBold(value) {
  const text = String(value || '').trim();
  if (text.startsWith('**') && text.endsWith('**') && text.length > 4) return text.slice(2, -2).trim();
  return text;
}

function captionBody(figure) {
  let caption = stripOuterBold(figure.captionMarkdown || figure.caption);
  const linkedLabel = caption.match(/^\[((?:Extended Data\s+)?Fig(?:ure)?\.?\s*\d+)\s*(?:[:|.-]\s*)?([^\]]*)\]\(([^)]+)\)/i);
  if (linkedLabel) {
    const rest = linkedLabel[2].trim();
    return rest ? `[${rest}](${linkedLabel[3]})${caption.slice(linkedLabel[0].length)}` : caption.slice(linkedLabel[0].length).trim();
  }
  const boldLabel = /^\*\*((?:Extended Data\s+)?Fig(?:ure)?\.?\s*\d+)\s*(?:[:|.-]\s*)?\*\*\s*/i;
  caption = caption.replace(boldLabel, '');
  const label = /^(?:Extended Data\s+)?Fig(?:ure)?\.?\s*\d+\s*(?:[:|.-]\s*|\s+)/i;
  caption = caption.replace(label, '').trim();
  return caption;
}

export function renderFigure(figure, imagePath = figure.imageUrl, policy = { dialect: 'markdown' }) {
  const body = captionBody(figure);
  const label = `**${figure.label}.**`;
  const image = `![${figure.alt || figure.label}](${imagePath})`;
  const imageWithIdentifier = policy.dialect === 'quarto'
    ? `${image}{#fig-${figure.anchor}}`
    : image;
  return [
    ...(policy.allowHtmlAnchors ? [`<a id="${figure.anchor}"></a>`] : []),
    imageWithIdentifier,
    '',
    `${label}${body ? ` ${body}` : ''}`,
  ].join('\n');
}

export function renderFigures(figures, imagePathByAnchor = new Map(), policy = { dialect: 'markdown' }) {
  if (!figures.length) return '';
  const main = figures.filter((figure) => figure.source === 'inline figure');
  const extended = figures.filter((figure) => figure.source === 'supplementary figure');
  const render = (figure) => renderFigure(
    figure,
    imagePathByAnchor.get(figure.anchor) || figure.imageUrl,
    policy,
  );
  const sections = [];
  if (main.length) sections.push(main.map(render).join('\n\n'));
  if (extended.length) sections.push(['## Extended Data', '', extended.map(render).join('\n\n')].join('\n'));
  return sections.join('\n\n');
}

export function renderTables(tables, policy = { dialect: 'markdown' }) {
  if (!tables.length) return '';
  const lines = ['## Tables', ''];
  for (const table of tables) {
    const body = String(table.caption || '')
      .replace(/^(?:Extended Data )?Table\s*\d+\s*(?:[:|.-]\s*|\s+)/i, '')
      .trim();
    const caption = `**${table.label}.**${body ? ` ${body}` : ''}`;
    const identifier = policy.dialect === 'quarto' ? ` {#tbl-${table.anchor}}` : (policy.allowHtmlAnchors ? ` <a id="${table.anchor}"></a>` : '');
    if (table.markdown) {
      lines.push(`${caption}${identifier}`, '');
      lines.push(table.markdown, '');
      if (table.url) lines.push(`[Full size table](${table.url})`, '');
    } else {
      const warning = table.tableContentWarning
        ? ` — ⚠️ ${table.tableContentWarning}`
        : ' — ⚠️ Table cells were not exposed as HTML; retained the full-size link.';
      lines.push(`- ${caption}${table.url ? ` ([Full size table](${table.url}))` : ''}${identifier}${warning}`, '');
    }
  }
  return lines.join('\n').trimEnd();
}

function cellTextForMarkdown(value) {
  return String(value || '')
    .replace(/\r?\n+/gu, ' ')
    .replace(/\s{2,}/gu, ' ')
    .replace(/(?<!\\)\|/gu, '\\|')
    .trim();
}

async function tableCellMarkdown(cell, url) {
  const html = normalizeHtmlUrls(cell.innerHTML, url);
  let converted = await markdownFragment(html, url);
  converted = normalizeMath(converted);
  return cellTextForMarkdown(normalizeAcademicInline(converted));
}

async function tableMarkdown(tableHtml, url) {
  const document = new JSDOM(tableHtml, { url }).window.document;
  const table = document.querySelector('table');
  if (!table) return '';
  const rows = Array.from(table.rows).filter((row) => row.closest('table') === table);
  if (!rows.length) return '';

  const grid = [];
  let maxColumns = 0;
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    grid[rowIndex] ||= [];
    let column = 0;
    for (const cell of Array.from(row.children).filter((node) => node.tagName === 'TH' || node.tagName === 'TD')) {
      while (grid[rowIndex][column] !== undefined) column += 1;
      const value = await tableCellMarkdown(cell, url);
      const rowSpan = Math.max(Number(cell.getAttribute('rowspan') || 1), 1);
      const colSpan = Math.max(Number(cell.getAttribute('colspan') || 1), 1);
      for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
        const targetRow = rowIndex + rowOffset;
        grid[targetRow] ||= [];
        for (let columnOffset = 0; columnOffset < colSpan; columnOffset += 1) {
          const targetColumn = column + columnOffset;
          if (grid[targetRow][targetColumn] === undefined) {
            grid[targetRow][targetColumn] = rowOffset === 0 && columnOffset === 0 ? value : '';
          }
        }
      }
      column += colSpan;
      maxColumns = Math.max(maxColumns, column);
    }
  }

  const hasHeader = Boolean(rows[0].querySelector('th'));
  const header = (grid[0] || []).slice(0, maxColumns);
  while (header.length < maxColumns) header.push(`Column ${header.length + 1}`);
  if (!hasHeader) {
    for (let index = 0; index < maxColumns; index += 1) header[index] = `Column ${index + 1}`;
  }
  const separator = Array.from({ length: maxColumns }, () => '---');
  const output = [`| ${header.join(' | ')} |`, `| ${separator.join(' | ')} |`];
  const dataRows = hasHeader ? grid.slice(1) : grid;
  for (const row of dataRows) {
    const cells = row.slice(0, maxColumns);
    while (cells.length < maxColumns) cells.push('');
    output.push(`| ${cells.join(' | ')} |`);
  }
  return output.join('\n');
}

export async function normalizeTableContents(tables, url) {
  for (const table of tables) {
    if (!table.tableHtml) continue;
    try {
      table.markdown = await tableMarkdown(table.tableHtml, table.tableContentUrl || url);
      if (!table.markdown) {
        table.tableContentStatus = 'fallback-empty-table';
        table.tableContentWarning = 'The exposed HTML table contained no usable rows.';
      } else {
        table.tableContentStatus = table.tableContentStatus || 'captured-html';
      }
    } catch (error) {
      table.markdown = '';
      table.tableContentStatus = 'fallback-conversion-failed';
      table.tableContentWarning = `Unable to convert HTML table cells: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  return tables;
}
