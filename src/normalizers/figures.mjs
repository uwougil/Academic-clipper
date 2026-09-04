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

function protectCaptionMath(html) {
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
  return { html: root.innerHTML, math };
}

export async function normalizeFigureCaptions(figures, url) {
  for (const figure of figures) {
    if (!figure.captionHtml) {
      figure.captionMarkdown = figure.caption;
      continue;
    }
    const protectedCaption = protectCaptionMath(figure.captionHtml);
    let converted = await htmlToMarkdown(`<p>${protectedCaption.html}</p>`, url);
    converted = normalizeMath(converted);
    for (const { marker, tex } of protectedCaption.math) converted = converted.replaceAll(marker, `$${tex}$`);
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
  const boldLabel = /^\*\*((?:Extended Data\s+)?Fig(?:ure)?\.?\s*\d+)\*\*\s*(?:[:|.-]\s*|\s+)/i;
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
    ...(policy.dialect === 'quarto' ? [] : [`<a id="${figure.anchor}"></a>`]),
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
    const identifier = policy.dialect === 'quarto' ? ` {#tbl-${table.anchor}}` : ` <a id="${table.anchor}"></a>`;
    lines.push(`- ${caption}${table.url ? ` ([Full size table](${table.url}))` : ''}${identifier}`, '');
  }
  return lines.join('\n').trimEnd();
}
