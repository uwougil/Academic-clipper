import { JSDOM } from 'jsdom';
import { semanticMarker } from '../normalizers/markers.mjs';
import { ACADEMIC_CLIPPER_USER_AGENT } from '../version.mjs';
import { safeFetchExternal } from '../security.mjs';

const NATURE_HOST = 'www.nature.com';
const FIGURE_IDENTITY_ATTR = 'data-academic-clipper-figure';
const EXCLUDED_SECTIONS = new Set([
  'about this article',
  'author information',
  'extended data figures and tables',
  'references',
  'rights and permissions',
  'supplementary information',
]);

const JUNK_SELECTORS = [
  '.c-article-recommendations',
  '.app-explore-related-subjects',
  '.js-context-bar-sticky-point-mobile',
  '.c-context-bar',
  '.c-pdf-button__container',
  '[data-test="article-tools"]',
  '[data-test="metrics"]',
  '[data-test="share-tools"]',
  '.c-article-share-box',
  '.cookie-banner',
  '[class*="cookie"]',
  '[id*="cookie"]',
  '.c-article-references__links',
  '.c-article-section__figure-content',
];

function cleanText(value) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\t\r\n ]+/g, ' ')
    .trim();
}

function metaValues(document, matcher) {
  return Array.from(document.querySelectorAll('meta'))
    .filter((meta) => matcher(
      (meta.getAttribute('name') ?? '').toLowerCase(),
      (meta.getAttribute('property') ?? '').toLowerCase(),
    ))
    .map((meta) => cleanText(meta.getAttribute('content')))
    .filter(Boolean);
}

function firstMeta(document, names) {
  for (const requestedName of names) {
    const wanted = requestedName.toLowerCase();
    const value = metaValues(document, (name, property) => name === wanted || property === wanted)[0];
    if (value) return value;
  }
  return '';
}

function normalizeUrl(value, baseUrl) {
  if (!value) return '';
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return value;
  }
}

function parseJsonLd(document) {
  const values = [];
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const parsed = JSON.parse(script.textContent || '');
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const candidate of candidates) {
        if (candidate?.['@graph'] && Array.isArray(candidate['@graph'])) values.push(...candidate['@graph']);
        else values.push(candidate);
      }
    } catch {
      // Some pages contain analytics JSON in a JSON-LD script. Ignore it.
    }
  }
  return values;
}

function jsonLdArticle(document) {
  return parseJsonLd(document).find((item) => {
    const types = Array.isArray(item?.['@type']) ? item['@type'] : [item?.['@type']];
    return types.some((type) => /article|scholarly/i.test(String(type)));
  }) ?? {};
}

function extractAuthorInformation(document) {
  const section = document.querySelector('section[data-title="Author information"]');
  const notes = Array.from(section?.querySelectorAll('.c-article-author-information__item p') || [])
    .map((node) => cleanText(node.textContent))
    .filter(Boolean);
  const affiliations = Array.from(section?.querySelectorAll('.c-article-author-affiliation__list > li') || [])
    .map((item) => ({
      address: cleanText(item.querySelector('.c-article-author-affiliation__address')?.textContent),
      authors: cleanText(item.querySelector('.c-article-author-affiliation__authors-list')?.textContent),
    }))
    .filter((item) => item.address || item.authors);
  const contributions = cleanText(section?.querySelector('#contributions + p')?.textContent);
  const correspondenceNode = section?.querySelector('#corresponding-author-list');
  const correspondence = correspondenceNode ? {
    text: cleanText(correspondenceNode.textContent),
    email: correspondenceNode.querySelector('a[href^="mailto:"]')?.getAttribute('href') || '',
  } : null;
  return { notes, affiliations, contributions, correspondence };
}

function extractPublisherNotes(document) {
  return Array.from(document.querySelectorAll('section[data-title="Peer review"] p'))
    .map((node) => cleanText(node.textContent))
    .filter(Boolean);
}

function extractMetadata(document, url) {
  const jsonArticle = jsonLdArticle(document);
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  const title = firstMeta(document, ['citation_title', 'og:title'])
    || cleanText(jsonArticle.headline)
    || cleanText(document.querySelector('h1')?.textContent)
    || 'Untitled';

  let authors = metaValues(document, (name) => name === 'citation_author');
  if (authors.length === 0) {
    const jsonAuthors = Array.isArray(jsonArticle.author) ? jsonArticle.author : [jsonArticle.author];
    authors = jsonAuthors.map((author) => typeof author === 'string' ? author : author?.name).filter(Boolean);
  }

  const doi = firstMeta(document, ['citation_doi', 'dc.identifier']).replace(/^doi:/i, '');
  const date = firstMeta(document, ['citation_online_date', 'citation_publication_date', 'date'])
    || cleanText(jsonArticle.datePublished);
  const authorInformation = extractAuthorInformation(document);

  return {
    title,
    authors,
    journal: firstMeta(document, ['citation_journal_title']) || cleanText(jsonArticle.isPartOf?.name) || 'Nature',
    date: date.replace(/\//g, '-'),
    doi,
    url: normalizeUrl(canonical || url, url).split('#')[0],
    volume: firstMeta(document, ['citation_volume']),
    issue: firstMeta(document, ['citation_issue']),
    pages: firstMeta(document, ['citation_firstpage']) && firstMeta(document, ['citation_lastpage'])
      ? `${firstMeta(document, ['citation_firstpage'])}-${firstMeta(document, ['citation_lastpage'])}`
      : '',
    metadataSource: 'Nature citation_* meta tags, with JSON-LD fallback',
    authorInformation,
    publisherNotes: extractPublisherNotes(document),
  };
}

function figureLabel(caption, fallback) {
  const match = cleanText(caption).match(/^(Extended Data )?Fig\.?\s*([0-9]+)/i);
  if (!match) return fallback;
  return `${match[1] ?? ''}Figure ${match[2]}`;
}

function figureNumber(label, fallback) {
  return Number(label.match(/(\d+)$/)?.[1] || fallback);
}

function tableLabel(caption, fallback) {
  const match = cleanText(caption).match(/^(Extended Data )?Table\s*([0-9]+)/i);
  if (!match) return fallback;
  return `${match[1] ?? ''}Table ${match[2]}`;
}

function citationKeyFor(text, index, usedKeys) {
  const authorPart = cleanText(text).split(/\.\s+/u)[0] || '';
  const surname = (authorPart.match(/[A-Za-zÀ-ÖØ-öø-ÿŠšŽžĆćČčĐđŁł]+/u)?.[0] || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .replace(/^./, (value) => value.toUpperCase()) || `Reference${index}`;
  const year = cleanText(text).match(/\b(?:19|20)\d{2}\b/u)?.[0] || '';
  const base = `${surname}${year}`;
  let key = base || `Reference${index}`;
  let suffix = 2;
  while (usedKeys.has(key)) key = `${base || `Reference${index}`}${suffix++}`;
  usedKeys.add(key);
  return key;
}

function srcsetCandidates(value, baseUrl) {
  return String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => {
      const [rawUrl, descriptor = ''] = part.split(/\s+/);
      const width = Number(descriptor.match(/(\d+)w/i)?.[1] || 0);
      const density = Number(descriptor.match(/([\d.]+)x/i)?.[1] || 0);
      return { url: normalizeUrl(rawUrl, baseUrl), score: width || density * 1000 || 1, index };
    })
    .filter((candidate) => candidate.url);
}

function imageUrlFor(element, url) {
  const candidates = [];
  for (const source of element.querySelectorAll('source[srcset], source[data-srcset]')) {
    candidates.push(...srcsetCandidates(source.getAttribute('srcset') || source.getAttribute('data-srcset'), url));
  }
  for (const image of element.querySelectorAll('img')) {
    for (const attribute of ['srcset', 'data-srcset']) {
      candidates.push(...srcsetCandidates(image.getAttribute(attribute), url));
    }
    for (const attribute of ['data-src', 'data-original', 'data-lazy-src', 'src']) {
      const value = image.getAttribute(attribute);
      if (value) candidates.push({ url: normalizeUrl(value, url), score: 1, index: candidates.length });
    }
  }
  const supplemental = element.querySelector('[data-supp-info-image]')?.getAttribute('data-supp-info-image');
  if (supplemental) candidates.push({ url: normalizeUrl(supplemental, url), score: 1, index: candidates.length });
  return candidates.sort((a, b) => b.score - a.score || a.index - b.index)[0]?.url || '';
}

function captionFor(figure, { includeFigureDescription = false } = {}) {
  const element = figure.querySelector('[data-test="figure-caption-text"]')
    || figure.querySelector('[data-test="table-caption"]')
    || figure.querySelector('.c-article-table__figcaption')
    || figure.querySelector('figcaption');
  const description = includeFigureDescription
    ? figure.parentElement?.querySelector('[data-test="bottom-caption"], .c-article-section__figure-description')
    : null;
  const html = [element?.innerHTML, description?.innerHTML].filter(Boolean).join(' ');
  return {
    element,
    text: cleanText([element?.textContent, description?.textContent].filter(Boolean).join(' ')),
    html,
  };
}

function elementContentHtml(element) {
  if (!element) return '';
  return Array.from(element.childNodes).map((node) => {
    if (node.nodeType === 1 && node.tagName === 'P') return node.innerHTML;
    return node.nodeType === 1 ? node.outerHTML : node.textContent;
  }).join(' ');
}

function extractFigures(body, url) {
  const figures = [];
  for (const figure of body.querySelectorAll('figure')) {
    const captionData = captionFor(figure, { includeFigureDescription: true });
    const caption = captionData.text;
    const isTable = /^Table\b|^Extended Data Table\b/i.test(caption);
    const inExcludedSection = Boolean(figure.closest('section[data-title="Extended data figures and tables"]'));
    const imageUrl = imageUrlFor(figure, url);
    if (inExcludedSection || isTable || !imageUrl || !caption) continue;

    const id = figure.id || figure.querySelector('[id^="Fig"]')?.id || '';
    const number = figures.length + 1;
    const label = figureLabel(caption, `Figure ${number}`);
    const identity = `inline-figure-${number}`;
    figure.setAttribute(FIGURE_IDENTITY_ATTR, identity);
    figures.push({
      identity,
      id,
      natureId: id,
      anchor: `figure-${number}`,
      label,
      caption,
      captionHtml: captionData.html,
      alt: `Figure ${figureNumber(label, number)}`,
      imageUrl,
      source: 'inline figure',
    });
  }

  let extendedNumber = 0;
  for (const item of body.querySelectorAll('.js-c-reading-companion-figures-item[data-test="supp-item"]')) {
    const heading = item.querySelector('h3');
    const description = item.querySelector('.c-article-supplementary__description');
    const captionParts = [heading?.textContent, description?.textContent].map(cleanText).filter(Boolean);
    const caption = cleanText(captionParts.join(' '));
    const label = figureLabel(caption, `Extended Data Figure ${extendedNumber + 1}`);
    const imageUrl = imageUrlFor(item, url);
    if (!imageUrl || !caption || !/Extended Data Fig/i.test(caption)) continue;
    extendedNumber += 1;
    const number = figureNumber(label, extendedNumber);
    const identity = item.id || `supplementary-figure-${extendedNumber}`;
    item.setAttribute(FIGURE_IDENTITY_ATTR, identity);
    figures.push({
      identity,
      id: item.id || '',
      natureId: item.id || '',
      anchor: `extended-data-figure-${number}`,
      label,
      caption,
      captionHtml: [elementContentHtml(heading), elementContentHtml(description)].filter(Boolean).join(' '),
      alt: `Extended Data Figure ${number}`,
      imageUrl,
      source: 'supplementary figure',
    });
  }
  return figures;
}

function tableNotes(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll('.c-article-table-footer li')).map((item) => {
    const first = Array.from(item.childNodes).find((node) => node.nodeType !== 3 || node.textContent.trim());
    const marker = first?.nodeType === 1 && first.tagName === 'SUP' && /^[A-Za-z0-9*†‡]$/u.test(first.textContent.trim())
      ? first.textContent.trim() : '';
    return { html: item.innerHTML, marker };
  });
}

function extractTables(body, url) {
  let number = 0;
  return Array.from(body.querySelectorAll('figure')).flatMap((figure) => {
    const captionData = captionFor(figure);
    const caption = captionData.text;
    if (!/^Table\b|^Extended Data Table\b/i.test(caption)) return [];
    number += 1;
    const identity = `inline-table-${number}`;
    figure.setAttribute(FIGURE_IDENTITY_ATTR, identity);
    const link = figure.querySelector('[data-test="table-link"]')?.getAttribute('href')
      || figure.querySelector('a[href]')?.getAttribute('href');
    const id = figure.id || figure.querySelector('[id^="Tab"]')?.id || '';
    const tableElement = figure.querySelector('table');
    return [{
      identity,
      id,
      natureId: id,
      anchor: `table-${number}`,
      label: tableLabel(caption, `Table ${number}`),
      caption,
      captionHtml: captionData.html,
      url: normalizeUrl(link, url),
      tableHtml: tableElement?.outerHTML || '',
      notes: tableNotes(figure),
      tableContentStatus: tableElement ? 'inline-html' : 'not-loaded',
    }];
  });
}

function sameNatureTableOrigin(tableUrl, articleUrl) {
  try {
    const table = new URL(tableUrl);
    const article = new URL(articleUrl);
    return table.origin === article.origin
      && table.pathname.startsWith(`${article.pathname.replace(/\/$/u, '')}/tables/`);
  } catch {
    return false;
  }
}

export async function hydrateNatureTables(tables, articleUrl, {
  fetchImpl = globalThis.fetch,
  resolveHostname,
} = {}) {
  const warnings = [];
  if (!isNatureUrl(articleUrl)) {
    for (const table of tables) {
      if (table.tableHtml) continue;
      table.tableContentStatus = 'fallback-unsupported-article-url';
      table.tableContentWarning = 'Full-size table hydration requires a supported Nature article URL.';
      warnings.push(`${table.label}: ${table.tableContentWarning}`);
    }
    return warnings;
  }
  for (const table of tables) {
    if (table.tableHtml) continue;
    if (!table.url) {
      table.tableContentStatus = 'fallback-no-url';
      table.tableContentWarning = 'No full-size table URL was exposed by Nature.';
      warnings.push(`${table.label}: ${table.tableContentWarning}`);
      continue;
    }
    if (!sameNatureTableOrigin(table.url, articleUrl)) {
      table.tableContentStatus = 'fallback-unsafe-url';
      table.tableContentWarning = 'Full-size table URL was not a same-article Nature table URL.';
      warnings.push(`${table.label}: ${table.tableContentWarning}`);
      continue;
    }
    try {
      const { response, url: finalUrl } = await safeFetchExternal(table.url, {
        fetchImpl,
        ...(resolveHostname ? { resolveHostname } : {}),
        validateUrl: (candidate) => {
          if (!sameNatureTableOrigin(candidate, articleUrl)) {
            throw new Error('Nature table redirect escaped the current article table scope.');
          }
        },
        headers: { 'user-agent': ACADEMIC_CLIPPER_USER_AGENT },
        timeoutMs: 20_000,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = String(response.headers.get('content-type') || '').toLowerCase();
      if (contentType && !contentType.includes('html')) throw new Error(`Unexpected content-type: ${contentType}`);
      const html = await response.text();
      const tableDocument = new JSDOM(html, { url: table.url }).window.document;
      const tableElement = tableDocument.querySelector('table');
      const container = tableElement
        ? tableElement.closest('.c-article-table-container') || tableElement.parentElement
        : tableDocument.querySelector('#content .c-article-table-container');
      table.notes = tableNotes(container);
      table.tableContentUrl = finalUrl;
      if (!tableElement) {
        table.tableContentStatus = 'fallback-no-html-table';
        table.tableContentWarning = 'The full-size Nature page did not expose HTML table cells; retained the absolute URL.';
        warnings.push(`${table.label}: ${table.tableContentWarning}`);
        continue;
      }
      table.tableHtml = tableElement.outerHTML;
      table.tableContentStatus = 'full-size-html';
    } catch (error) {
      table.tableContentStatus = 'fallback-fetch-failed';
      table.tableContentWarning = `Unable to fetch or parse the full-size table: ${error instanceof Error ? error.message : String(error)}`;
      warnings.push(`${table.label}: ${table.tableContentWarning}`);
    }
  }
  return warnings;
}

function extractReferences(body) {
  const usedKeys = new Set();
  return Array.from(body.querySelectorAll('ol.c-article-references > li, ol.c-article-references__list > li'))
    .map((item, index) => {
      const text = cleanText(item.querySelector('.c-article-references__text')?.textContent || item.textContent);
      const doi = item.querySelector('[data-doi]')?.getAttribute('data-doi') || '';
      return {
        number: index + 1,
        anchor: `ref-${index + 1}`,
        citationKey: citationKeyFor(text, index + 1, usedKeys),
        text,
        doi,
      };
    })
    .filter((reference) => reference.text);
}

function slugify(value) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
}

function extractMathSource(value) {
  const text = String(value || '').trim();
  const pairs = [['\\(', '\\)'], ['\\[', '\\]'], ['$$', '$$']];
  for (const [left, right] of pairs) {
    if (text.startsWith(left) && text.endsWith(right)) return text.slice(left.length, -right.length).trim();
  }
  return text;
}

function replaceDisplayMath(body, tables) {
  const values = [];
  const tableDisplayMath = [];
  for (const table of tables) {
    const figure = body.querySelector(`[${FIGURE_IDENTITY_ATTR}="${table.identity}"]`);
    if (!figure) continue;
    for (const element of captionFor(figure).element?.querySelectorAll('.mathjax-tex') || []) {
      const source = element.textContent.trim();
      if (!element.closest('pre, code') && (source.startsWith('\\[') && source.endsWith('\\]')
        || source.startsWith('$$') && source.endsWith('$$'))) tableDisplayMath.push(element);
    }
  }
  for (const element of new Set([...body.querySelectorAll('.c-article-equation .mathjax-tex'), ...tableDisplayMath])) {
    const tex = extractMathSource(element.textContent);
    if (!tex) continue;
    const marker = semanticMarker('DISPLAYMATH', values.length);
    values.push({ marker, tex });
    element.replaceWith(body.ownerDocument.createTextNode(marker));
  }
  return values;
}

function replaceInlineMath(body) {
  const values = [];
  for (const element of Array.from(body.querySelectorAll('.mathjax-tex'))) {
    if (element.closest('.c-article-equation')) continue;
    const source = extractMathSource(element.textContent);
    const tex = source.includes('||') ? canonicalScientificTex(source) : source;
    if (!tex) continue;
    const marker = semanticMarker('INLINEMATH', values.length);
    values.push({ marker, tex });
    element.replaceWith(body.ownerDocument.createTextNode(marker));
  }
  return values;
}

const SCIENTIFIC_TAGS = new Set(['I', 'B', 'SUB', 'SUP']);
const SCIENTIFIC_BASE_TAGS = new Set(['I', 'B']);
const SCIENTIFIC_ATTACHMENT_TAGS = new Set(['SUB', 'SUP']);
const INLINE_MATH_MARKER = /^ACADEMICCLIPPERINLINEMATH\d+X$/;

function isElement(node, tags = SCIENTIFIC_TAGS) {
  // Keep typed reference superscripts available to the later citation pass.
  // Both existing citation anchor cues end a scientific range.
  return node?.nodeType === 1 && tags.has(node.tagName)
    && !(node.tagName === 'SUP'
      && node.querySelector('a[data-test="citation-ref"], a[href*="#ref-CR"]'));
}

function inlineMathValue(text, inlineMathByMarker) {
  return String(text || '').replace(/ACADEMICCLIPPERINLINEMATH\d+X/g, (marker) => (
    inlineMathByMarker.get(marker)?.tex || marker
  ));
}

function scientificTex(node, inlineMathByMarker) {
  if (node.nodeType === 3) return inlineMathValue(node.textContent, inlineMathByMarker);
  if (node.nodeType !== 1) return '';
  const content = Array.from(node.childNodes)
    .map((child) => scientificTex(child, inlineMathByMarker))
    .join('');
  if (node.tagName === 'I') return content;
  if (node.tagName === 'B') return `\\mathbf{${content}}`;
  if (node.tagName === 'SUB') {
    const plain = content.replace(/\s+/gu, '');
    const hasExplicitMathStyle = node.querySelector('i, b');
    const value = !hasExplicitMathStyle && /^[A-Za-z]{2,}$/u.test(plain)
      ? `\\mathrm{${plain}}`
      : plain;
    return `_{${value}}`;
  }
  if (node.tagName === 'SUP') return `^{${content.replace(/\s+/gu, '')}}`;
  return content;
}

const SCIENTIFIC_GREEK = new Map([
  ['α', '\\alpha'], ['β', '\\beta'], ['γ', '\\gamma'], ['δ', '\\delta'],
  ['Δ', '\\Delta'], ['ε', '\\epsilon'], ['λ', '\\lambda'], ['μ', '\\mu'],
  ['ν', '\\nu'], ['ω', '\\omega'], ['Ω', '\\Omega'], ['σ', '\\sigma'],
  ['τ', '\\tau'], ['χ', '\\chi'], ['φ', '\\phi'], ['ψ', '\\psi'],
  ['∞', '\\infty'],
]);

function canonicalScientificTex(tex) {
  let result = String(tex || '').replace(/[αβγδΔελμνωΩστυχφψ∞]/gu, (value) => SCIENTIFIC_GREEK.get(value) || value);
  result = result.replace(/−/gu, '-').replace(/\|\|/gu, '\\Vert ').replace(/(?<!\\)\|/gu, '\\mid ');
  // A delimited symmetry operation is a literal set-like expression. Escape
  // only its outer braces; sub/superscript and \mathbf braces remain TeX groups.
  if (result.startsWith('{')) result = `\\{${result.slice(1)}`;
  if (result.endsWith('}') && !result.endsWith('\\}')) result = `${result.slice(0, -1)}\\}`;
  return result;
}

function allowedScientificText(text) {
  const normalized = String(text || '').replace(/\u00a0/g, ' ');
  if (!normalized || /^\s/u.test(normalized)) return null;
  const match = normalized.match(/^[A-Za-z0-9∞−+\-_/|{}'=′″]+/u);
  if (!match) return null;
  return { length: match[0].length, text: match[0] };
}

function collectDelimitedScientificRun(parent, startIndex) {
  const startNode = parent.childNodes[startIndex];
  if (startNode?.nodeType !== 3) return null;
  const startOffset = startNode.textContent.lastIndexOf('{');
  if (startOffset < 0) return null;

  const initialTail = startNode.textContent.slice(startOffset);
  const initialClose = initialTail.indexOf('}');
  if (initialClose >= 0 && initialTail.slice(0, initialClose + 1).includes('||')) {
    return {
      start: { node: startNode, offset: startOffset },
      end: { node: startNode, offset: startOffset + initialClose + 1 },
    };
  }

  let index = startIndex + 1;
  let sawParallelSeparator = initialTail.includes('||');
  let end = null;
  while (index < parent.childNodes.length) {
    const node = parent.childNodes[index];
    if (isElement(node, SCIENTIFIC_TAGS)) {
      index += 1;
      continue;
    }
    if (node.nodeType !== 3) break;
    const text = node.textContent;
    const closeIndex = text.indexOf('}');
    const candidate = closeIndex >= 0 ? text.slice(0, closeIndex + 1) : text;
    if (!/^[A-Za-z0-9∞α-ωΑ-ΩΔ−+\-_/|{}'=′″,.;:\s\u00a0\u2009]+$/u.test(candidate)) break;
    if (candidate.includes('||')) sawParallelSeparator = true;
    if (closeIndex >= 0) {
      end = { node, offset: closeIndex + 1 };
      break;
    }
    index += 1;
  }
  if (!end || !sawParallelSeparator) return null;
  return {
    start: { node: startNode, offset: startOffset },
    end,
  };
}

function setRangeEnd(range, end) {
  if (end.after) range.setEndAfter(end.node);
  else range.setEnd(end.node, end.offset);
}

function replaceRangeWithScientificMarker(parent, start, end, values, inlineMathByMarker, provenance, sourceTex, sourceText) {
  const range = parent.ownerDocument.createRange();
  range.setStart(start.node, start.offset);
  setRangeEnd(range, end);
  const fragment = range.extractContents();
  let tex = sourceTex ?? Array.from(fragment.childNodes)
    .map((node) => scientificTex(node, inlineMathByMarker))
    .join('')
    .replace(/[ \t\r\n\u00a0\u2009]+/gu, '');
  if (tex.includes('||')) tex = canonicalScientificTex(tex);
  if (!tex) return false;
  const marker = semanticMarker('SCIENTIFICRUN', values.length);
  values.push({ marker, tex, provenance, ...(sourceText === undefined ? {} : { sourceText }) });
  range.insertNode(parent.ownerDocument.createTextNode(marker));
  return true;
}

function collectStyledRun(parent, startIndex) {
  const startNode = parent.childNodes[startIndex];
  if (!isElement(startNode, SCIENTIFIC_BASE_TAGS)) return null;

  let index = startIndex + 1;
  let sawAttachment = false;
  let lastEnd = { node: startNode, after: true };
  let beforeFirstAttachment = true;
  while (index < parent.childNodes.length) {
    const node = parent.childNodes[index];
    if (node.nodeType === 3 && /^[ \t\r\n\u00a0\u2009]*$/u.test(node.textContent)) {
      const next = parent.childNodes[index + 1];
      if (beforeFirstAttachment && isElement(next, SCIENTIFIC_ATTACHMENT_TAGS)) {
        index += 1;
        continue;
      }
      break;
    }

    if (isElement(node, SCIENTIFIC_ATTACHMENT_TAGS)) {
      sawAttachment = true;
      beforeFirstAttachment = false;
      lastEnd = { node, after: true };
      index += 1;
      continue;
    }

    if (isElement(node, SCIENTIFIC_BASE_TAGS)) {
      const next = parent.childNodes[index + 1];
      if (!sawAttachment || !isElement(next, SCIENTIFIC_ATTACHMENT_TAGS)) break;
      lastEnd = { node, after: true };
      index += 1;
      continue;
    }

    if (node.nodeType === 3 && sawAttachment) {
      const part = allowedScientificText(node.textContent);
      if (!part) break;
      lastEnd = part.length === node.textContent.length
        ? { node, after: true }
        : { node, offset: part.length };
      index += 1;
      if (part.length !== node.textContent.length) break;
      continue;
    }
    break;
  }

  if (!sawAttachment) return null;
  return {
    start: { node: startNode, offset: 0 },
    end: lastEnd,
  };
}

function collectMathMarkerRun(parent, startIndex, inlineMathByMarker) {
  const startNode = parent.childNodes[startIndex];
  if (startNode?.nodeType !== 3) return null;
  const markerMatch = startNode.textContent.match(INLINE_MATH_MARKER);
  if (!markerMatch) return null;
  const markerStart = markerMatch.index;
  let index = startIndex + 1;
  let sawAttachment = false;
  let lastEnd = null;

  while (index < parent.childNodes.length) {
    const node = parent.childNodes[index];
    if (isElement(node, SCIENTIFIC_ATTACHMENT_TAGS)) {
      sawAttachment = true;
      lastEnd = { node, after: true };
      index += 1;
      continue;
    }
    if (isElement(node, SCIENTIFIC_BASE_TAGS)) {
      lastEnd = { node, after: true };
      index += 1;
      continue;
    }
    if (node.nodeType === 3) {
      const part = allowedScientificText(node.textContent);
      if (!part) break;
      lastEnd = part.length === node.textContent.length
        ? { node, after: true }
        : { node, offset: part.length };
      index += 1;
      if (part.length !== node.textContent.length) break;
      continue;
    }
    break;
  }

  if (!sawAttachment || !lastEnd) return null;
  return {
    start: { node: startNode, offset: markerStart },
    end: lastEnd,
  };
}

function collectNumericAttachmentRun(parent, startIndex) {
  const attachment = parent.childNodes[startIndex];
  if (!isElement(attachment, SCIENTIFIC_ATTACHMENT_TAGS)) return null;
  const previous = parent.childNodes[startIndex - 1];
  if (previous?.nodeType !== 3) return null;
  const text = previous.textContent;
  const match = text.match(/(\d+)$/u);
  if (!match) return null;
  const prefix = text.slice(0, match.index).replace(/[ \t\r\n\u00a0\u2009]+/gu, '');
  // Numeric attachments in Nature's symmetry-operation notation appear after
  // an opening brace or a parallel-operation separator. Chemical formulas
  // such as Mn<sub>3</sub> remain text-led because their prefix is Mn.
  if (!/(?:\{|\|\|)$/u.test(prefix)) return null;
  return {
    start: { node: previous, offset: match.index },
    end: { node: attachment, after: true },
  };
}

function collectDetachedSuperscriptRun(parent, startIndex) {
  const node = parent.childNodes[startIndex];
  if (!isElement(node, new Set(['SUP'])) || node.querySelector('a[data-test="citation-ref"]')) return null;
  if (!/[∞]|<i\b|<b\b/u.test(`${node.textContent}${node.innerHTML}`)) return null;
  let end = { node, after: true };
  const next = parent.childNodes[startIndex + 1];
  if (next?.nodeType === 3) {
    const part = allowedScientificText(next.textContent);
    if (part) end = part.length === next.textContent.length
      ? { node: next, after: true }
      : { node: next, offset: part.length };
  }
  return { start: { node, offset: 0 }, end };
}

function collectNumericSuperscriptRun(parent, startIndex) {
  const node = parent.childNodes[startIndex];
  if (!isElement(node, new Set(['SUP'])) || node.querySelector('a[data-test="citation-ref"]')) return null;
  if (!/^[−+\-]?\d+$/u.test(cleanText(node.textContent))) return null;
  const previous = parent.childNodes[startIndex - 1];
  if (previous?.nodeType !== 3) return null;
  const match = previous.textContent.match(/10$/u);
  if (!match) return null;
  return {
    start: { node: previous, offset: match.index },
    end: { node, after: true },
  };
}

function collectPlainFractionalUnitRun(parent, startIndex) {
  if (parent.closest('pre, code, math, .mathjax-tex, .c-article-equation')) return null;
  if (/[$`]|(?:^|\n)[ \t]*~{3,}/u.test(parent.textContent)) return null;
  const exponent = parent.childNodes[startIndex];
  if (!isElement(exponent, new Set(['SUP'])) || exponent.childNodes.length !== 1
    || exponent.firstChild.nodeType !== 3) return null;
  const base = exponent.previousSibling;
  const unit = base?.nodeType === 3 ? base.textContent.match(/(?:pc|km)$/u)?.[0] : null;
  // Only these source-backed factor/exponent pairs are proved here. Neither
  // a measurement prefix nor an adjacent unit belongs to this exponent.
  if (!unit || exponent.textContent !== (unit === 'pc' ? '−2/3' : '−1/3')) return null;
  const offset = base.textContent.length - unit.length;
  if (offset === 0 ? base.previousSibling
    : /[\p{L}\p{N}\p{M}_]$/u.test(base.textContent.slice(0, offset))) return null;
  const next = exponent.nextSibling;
  // Unknown topology and lexical continuations cannot prove a factor edge.
  // A typed citation SUP keeps its original independent ownership.
  if (next && !(next.nodeType === 3 && /^[\s\p{P}]/u.test(next.textContent)
      && !next.textContent.startsWith('_'))
    && !(next.nodeType === 1 && next.tagName === 'SUP'
      && next.querySelector('a[data-test="citation-ref"], a[href*="#ref-CR"]'))) return null;
  return {
    start: { node: base, offset },
    end: { node: exponent, after: true },
    tex: `\\mathrm{${unit}}^{${exponent.textContent}}`,
  };
}

function collectDeltaPositionRun(parent, startIndex) {
  if (parent.closest('pre, code, math, .mathjax-tex, .c-article-equation')) return null;
  // Literal math/code may span siblings; keep the whole opaque context with
  // its existing collector rather than interpreting its delimiters here.
  if (/[$`]|(?:^|\n)[ \t]*~{3,}|\\[([]/u.test(parent.textContent)) return null;
  const position = parent.childNodes[startIndex];
  if (!isElement(position, new Set(['SUP'])) || position.childNodes.length !== 1
    || position.firstChild.nodeType !== 3
    || !new Set(['12,13', '12', '13']).has(position.textContent)) return null;
  const base = position.previousSibling;
  if (base?.nodeType !== 3 || !base.textContent.endsWith('Δ')) return null;
  const offset = base.textContent.length - 1;
  if (offset === 0 ? base.previousSibling
    : /[\p{L}\p{N}\p{M}_]$/u.test(base.textContent.slice(0, offset))) return null;
  const next = position.nextSibling;
  // A complete label ends at a known lexical boundary. Its alkene suffix and
  // a proven citation stay outside the attachment; unknown nodes are opaque.
  if (next && !(next.nodeType === 3 && /^[\s\p{P}]/u.test(next.textContent)
      && !next.textContent.startsWith('_'))
    && !(next.nodeType === 1 && next.tagName === 'SUP'
      && next.querySelector('a[data-test="citation-ref"], a[href*="#ref-CR"]'))) return null;
  return {
    start: { node: base, offset },
    end: { node: position, after: true },
    tex: `Δ^{${position.textContent}}`,
  };
}

function collectQualifiedMetricRun(parent, startIndex) {
  if (parent.closest('pre, code, math, .mathjax-tex, .c-article-equation')) return null;
  if (/[$`]|(?:^|\n)[ \t]*~{3,}/u.test(parent.textContent)) return null;
  const qualifier = parent.childNodes[startIndex];
  if (!isElement(qualifier, new Set(['SUB'])) || qualifier.childNodes.length !== 1
    || qualifier.firstChild.nodeType !== 3 || qualifier.textContent !== '95') return null;
  const base = qualifier.previousSibling;
  if (base?.nodeType !== 3 || !/r\.m\.s\.d\.$/u.test(base.textContent)) return null;
  const offset = base.textContent.length - 'r.m.s.d.'.length;
  if (offset === 0 ? base.previousSibling
    : /[\p{L}\p{N}\p{M}_]$/u.test(base.textContent.slice(0, offset))) return null;
  const next = qualifier.nextSibling;
  // Preserve a complete literal metric, never a prefix of an unknown token or
  // an extra attachment. A proven citation SUP retains its independent role.
  if (next && !(next.nodeType === 3 && /^[\s\p{P}]/u.test(next.textContent)
      && !next.textContent.startsWith('_'))
    && !(next.nodeType === 1 && next.tagName === 'SUP'
      && next.querySelector('a[data-test="citation-ref"], a[href*="#ref-CR"]'))) return null;
  return {
    start: { node: base, offset },
    end: { node: qualifier, after: true },
    tex: '\\mathrm{r.m.s.d.}_{95}',
  };
}

function collectPlainScriptedIdentifierRun(parent, startIndex) {
  if (parent.closest('pre, code, math, .mathjax-tex, .c-article-equation')) return null;
  if (/[$`]|(?:^|\n)[ \t]*~{3,}/u.test(parent.textContent)) return null;
  const exponent = parent.childNodes[startIndex];
  if (!isElement(exponent, new Set(['SUP'])) || exponent.childNodes.length !== 1
    || exponent.firstChild.nodeType !== 3 || exponent.textContent !== '2') return null;
  const base = exponent.previousSibling;
  const suffix = exponent.nextSibling;
  if (base?.nodeType !== 3 || suffix?.nodeType !== 3 || !/[a-z]$/u.test(base.textContent)) return null;
  const offset = base.textContent.length - 1;
  // Node edges cannot prove a whole lexical boundary across unknown siblings.
  if (offset === 0 ? base.previousSibling
    : /[\p{L}\p{N}\p{M}_]$/u.test(base.textContent.slice(0, offset))) return null;
  const acronym = suffix.textContent.match(/^[A-Z]{2,}(?![\p{L}\p{N}\p{M}_])/u)?.[0];
  if (!acronym) return null;
  if (acronym.length === suffix.textContent.length && suffix.nextSibling
    && !(suffix.nextSibling.nodeType === 1 && suffix.nextSibling.tagName === 'SUP'
      && suffix.nextSibling.querySelector('a[data-test="citation-ref"], a[href*="#ref-CR"]'))) return null;
  // Preserve the complete original base, exponent and acronym in one typed
  // range before Defuddle can flatten heading scripts or detach body scripts.
  return {
    start: { node: base, offset },
    end: { node: suffix, offset: acronym.length },
    tex: `${base.textContent.slice(offset)}^{${exponent.textContent}}${acronym}`,
    sourceText: `${base.textContent.slice(offset)}${exponent.textContent}${acronym}`,
  };
}

function collectCompoundConductivityRun(parent, startIndex) {
  if (parent.closest('pre, code, math, .mathjax-tex, .c-article-equation')) return null;
  if (/[$`]|(?:^|\n)[ \t]*~{3,}/u.test(parent.textContent)) return null;
  const exponent = parent.childNodes[startIndex];
  // This source-backed conductivity role has two factors: mS stays a
  // multiplier, and only cm has the inverse exponent. Never invert mScm.
  if (!isElement(exponent, new Set(['SUP'])) || exponent.childNodes.length !== 1
    || exponent.firstChild.nodeType !== 3 || !/^[−-]1$/u.test(exponent.textContent)) return null;
  const previous = exponent.previousSibling;
  if (previous?.nodeType !== 3 || !/mScm$/u.test(previous.textContent)) return null;
  const offset = previous.textContent.length - 4;
  if (offset === 0 ? previous.previousSibling
    : /[\p{L}\p{N}\p{M}_]$/u.test(previous.textContent.slice(0, offset))) return null;
  const next = exponent.nextSibling;
  // A following typed citation owns its SUP. Other nodes can continue an
  // unknown token or attachment; do not flatten those into a guessed unit.
  if (next && !(next.nodeType === 3 && /^[\s.,;:!?()[\]{}+−\-*/=×]/u.test(next.textContent))
    && !(next.nodeType === 1 && next.tagName === 'SUP'
      && next.querySelector('a[data-test="citation-ref"], a[href*="#ref-CR"]'))) return null;
  return {
    start: { node: previous, offset },
    end: { node: exponent, after: true },
    tex: '\\mathrm{mS}\\,\\mathrm{cm}^{-1}',
  };
}

function collectPlainGreekSubscriptRun(parent, startIndex) {
  if (parent.closest('pre, code, math, .mathjax-tex, .c-article-equation')) return null;
  // Literal math/code can span siblings. This narrow DOM role leaves that
  // opaque context to existing paths rather than interpreting its delimiters.
  if (/[$`]|(?:^|\n)[ \t]*~{3,}/u.test(parent.textContent)) return null;
  const subscript = parent.childNodes[startIndex];
  if (!isElement(subscript, new Set(['SUB'])) || subscript.childNodes.length !== 1) return null;
  const child = subscript.firstChild;
  const atom = child.nodeType === 3 ? child
    : child.nodeType === 1 && child.tagName === 'I' && child.childNodes.length === 1
      && child.firstChild.nodeType === 3 ? child.firstChild : null;
  // Preserve the source-backed atoms without flattening nested, mixed, linked
  // or typed-math children into a guessed index.
  if (!atom || !/^[abi0]$/u.test(atom.textContent)) return null;
  const previous = subscript.previousSibling;
  if (previous?.nodeType !== 3 || !/[ΓΩ]$/u.test(previous.textContent)) return null;
  const offset = previous.textContent.length - 1;
  if (offset === 0 ? previous.previousSibling
    : /[\p{L}\p{N}\p{M}_]$/u.test(previous.textContent.slice(0, offset))) return null;
  // Additional mathematical attachments are ambiguous here. A following
  // citation SUP remains independent, as defined by isElement's typed guard.
  if (isElement(subscript.nextSibling, SCIENTIFIC_ATTACHMENT_TAGS)) return null;
  return {
    start: { node: previous, offset },
    end: { node: subscript, after: true },
  };
}

function collectSplitNumericSuperscriptRun(parent, startIndex) {
  if (parent.closest('pre, code, math, .mathjax-tex, .c-article-equation')) return null;
  // Literal math/code cues can span inline siblings. This DOM role does not
  // parse those opaque syntaxes: leave the whole candidate to existing paths.
  if (/[$`]|(?:^|\n)[ \t]*~{3,}/u.test(parent.textContent)) return null;
  const sign = parent.childNodes[startIndex];
  const digits = sign?.nextSibling;
  const plainSup = (node) => isElement(node, new Set(['SUP']))
    && node.childNodes.length === 1 && node.firstChild.nodeType === 3;
  // These are two original, contiguous plain SUP nodes forming one signed
  // integer exponent. Whitespace, comments and styled/citation children are
  // boundaries; scientificTex must not serialize this as two exponent groups.
  if (!plainSup(sign) || !/^[−+\-]$/u.test(sign.textContent)
    || !plainSup(digits) || !/^\d+$/u.test(digits.textContent)) return null;
  const previous = sign.previousSibling;
  if (previous?.nodeType !== 3) return null;
  const text = previous.textContent;
  if (!/(?:^|[\s~=(,:;+\-*/×])10$/u.test(text)) return null;
  const offset = text.length - 2;
  // A text-node edge is not a lexical edge. An unknown sibling/comment can
  // continue a word, decimal or identifier; require a boundary in this text.
  if (offset === 0 && previous.previousSibling) return null;
  // A subsequent citation keeps its own typed role. A third scientific SUP
  // instead makes this an ambiguous chain, which this narrow role cannot infer.
  if (isElement(digits.nextSibling, new Set(['SUP']))) return null;
  return {
    start: { node: previous, offset },
    end: { node: digits, after: true },
    tex: `10^{${sign.textContent}${digits.textContent}}`,
  };
}

function collectLeadingIsotopeRun(parent, startIndex) {
  const mass = parent.childNodes[startIndex];
  if (!isElement(mass, new Set(['SUP'])) || mass.firstElementChild
    || !/^[1-9]\d*$/u.test(mass.textContent)
    || mass.closest('pre, code, math, .mathjax-tex, .c-article-equation')) return null;
  const element = mass.nextSibling;
  // These are the source-backed element roles. A whole word, another element,
  // or presentation whitespace after SUP is not evidence of this prefix role.
  if (element?.nodeType !== 3 || !/^[HCF](?![\p{L}\p{N}_])/u.test(element.textContent)) return null;
  const previous = mass.previousSibling;
  // Contiguous numeric/styled bases belong to the existing exponent collectors.
  // A measurement's original separating whitespace stays outside this range.
  if (previous && (previous.nodeType !== 3
    || !/[\s\u2009\[(]$/u.test(previous.textContent))) return null;
  return {
    start: { node: parent, offset: startIndex },
    end: { node: element, offset: 1 },
  };
}

function collectTextAndStyledSymbolRun(parent, startIndex, inlineMathByMarker, displayMath) {
  const node = parent.childNodes[startIndex];
  if (!isElement(node, new Set(['I', 'B']))) return null;
  const previous = parent.childNodes[startIndex - 1];
  if (previous?.nodeType !== 3) return null;
  const match = previous.textContent.match(/(?:∞|[−+\-]?\d+)(?:\/)?$/u);
  if (!match || match.index === undefined) return null;
  const token = previous.textContent.slice(match.index);
  if (!/^(?:∞|[−+\-]?\d+)(?:\/)?$/u.test(token)) return null;
  const canExtend = (styled) => {
    if (styled.firstElementChild) return false;
    // MathJax children have already become text markers. Keep their typed role
    // at this boundary, including markers embedded in other styled text.
    const text = styled.textContent;
    for (const marker of inlineMathByMarker.keys()) if (text.includes(marker)) return false;
    return !displayMath.some(({ marker }) => text.includes(marker));
  };
  let endNode = node;
  if (canExtend(node)) {
    let index = startIndex + 1;
    while (index + 1 < parent.childNodes.length) {
      const digits = parent.childNodes[index];
      const styled = parent.childNodes[index + 1];
      // Keep contiguous source digit/style pairs in one range. A whitespace,
      // operator, wrapper or typed marker is a boundary, not a missing exponent.
      if (digits.nodeType !== 3 || !/^\d+$/u.test(digits.textContent)
        || !isElement(styled, SCIENTIFIC_BASE_TAGS) || !canExtend(styled)) break;
      let next = styled.nextSibling;
      while (next?.nodeType === 3 && /^[ \t\r\n\u00a0\u2009]*$/u.test(next.textContent)) next = next.nextSibling;
      // A genuine attachment belongs to this styled base and must remain for
      // collectStyledRun; reference superscripts are excluded by isElement.
      if (isElement(next, SCIENTIFIC_ATTACHMENT_TAGS)) break;
      endNode = styled;
      index += 2;
    }
  }
  return {
    start: { node: previous, offset: match.index },
    end: { node: endNode, after: true },
  };
}

function replaceScientificRuns(body, inlineMath, displayMath) {
  const values = [];
  const inlineMathByMarker = new Map(inlineMath.map((item) => [item.marker, item]));
  const parents = Array.from(body.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, figcaption'));
  for (const parent of parents) {
    let index = 0;
    while (index < parent.childNodes.length) {
      const node = parent.childNodes[index];
      const range = node.nodeType === 3
        ? collectDelimitedScientificRun(parent, index)
          || collectMathMarkerRun(parent, index, inlineMathByMarker)
        : collectStyledRun(parent, index)
          || collectTextAndStyledSymbolRun(parent, index, inlineMathByMarker, displayMath)
          || collectNumericAttachmentRun(parent, index)
          || collectPlainFractionalUnitRun(parent, index)
          || collectQualifiedMetricRun(parent, index)
          || collectDeltaPositionRun(parent, index)
          || collectPlainScriptedIdentifierRun(parent, index)
          || collectCompoundConductivityRun(parent, index)
          || collectPlainGreekSubscriptRun(parent, index)
          || collectSplitNumericSuperscriptRun(parent, index)
          || collectNumericSuperscriptRun(parent, index)
          || collectLeadingIsotopeRun(parent, index)
          || collectDetachedSuperscriptRun(parent, index);
      if (!range) {
        index += 1;
        continue;
      }
      const replaced = replaceRangeWithScientificMarker(
        parent,
        range.start,
        range.end,
        values,
        inlineMathByMarker,
        node.nodeType === 3
          ? 'Nature MathJax plus adjacent inline scientific nodes'
          : 'Nature inline style nodes (<i>/<b>/<sub>/<sup>)',
        range.tex,
        range.sourceText,
      );
      if (!replaced) {
        index += 1;
        continue;
      }
      index += 1;
    }
  }
  return values;
}

function replaceScientificBracketText(body) {
  const values = [];
  const walker = body.ownerDocument.createTreeWalker(body, 4);
  // Literal bracket edges can span styled Nature inline nodes. Preserve
  // their source-text identity before Defuddle escapes them as TeX fences;
  // backslash-prefixed delimiters continue through the legacy math path.
  const pattern = /(?<!\\)[\[\]]/gu;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement?.closest('.mathjax-tex, .c-article-equation, code, pre, ol.c-article-references, ol.c-article-references__list, a[data-test="citation-ref"], a[href*="#ref-CR"]')) continue;
    const next = node.textContent.replace(pattern, (match) => {
      const marker = semanticMarker('LITERALTEXT', values.length);
      values.push({ marker, text: match });
      return marker;
    });
    if (next !== node.textContent) node.textContent = next;
  }
  return values;
}

const MAX_CITATION_RANGE = 100;

function citationNumbers(anchor) {
  const text = cleanText(anchor.textContent);
  if (text) {
    const hasOpeningBracket = text.startsWith('[');
    const hasClosingBracket = text.endsWith(']');
    if (hasOpeningBracket !== hasClosingBracket) return null;
    const label = hasOpeningBracket ? text.slice(1, -1).trim() : text;
    if (!/^\d+(?:\s*(?:[,;]|[-–—])\s*\d+)*$/u.test(label)) return null;
    const numbers = [];
    for (const part of label.split(/\s*[,;]\s*/u)) {
      const range = part.match(/^(\d+)\s*[-–—]\s*(\d+)$/u);
      if (!range) {
        const number = Number(part);
        if (!Number.isSafeInteger(number) || number < 1) return null;
        numbers.push(number);
        continue;
      }
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)
        || start < 1 || end < start || end - start + 1 > MAX_CITATION_RANGE) return null;
      for (let number = start; number <= end; number += 1) numbers.push(number);
    }
    return [...new Set(numbers)];
  }
  const href = anchor.getAttribute('href') || '';
  const number = Number(href.match(/#ref-CR(\d+)/i)?.[1] || 0);
  return Number.isSafeInteger(number) && number > 0 ? [number] : null;
}

function replaceCitations(body) {
  const values = [];
  for (const sup of Array.from(body.querySelectorAll('sup'))) {
    const anchors = Array.from(sup.querySelectorAll('a[data-test="citation-ref"], a[href*="#ref-CR"]'));
    const parsed = anchors.map(citationNumbers);
    if (!anchors.length || parsed.some((numbers) => numbers === null)) continue;
    const numbers = [...new Set(parsed.flat())];
    if (!numbers.length) continue;
    const marker = semanticMarker('CITATION', values.length);
    values.push({ marker, numbers });
    sup.replaceWith(body.ownerDocument.createTextNode(marker));
  }

  for (const anchor of Array.from(body.querySelectorAll('a[data-test="citation-ref"], a[href*="#ref-CR"]'))) {
    if (anchor.closest('ol.c-article-references, ol.c-article-references__list')) continue;
    const numbers = citationNumbers(anchor);
    if (!numbers?.length) continue;
    const marker = semanticMarker('CITATION', values.length);
    values.push({ marker, numbers });
    anchor.replaceWith(body.ownerDocument.createTextNode(marker));
  }
  return values;
}

function buildCrossReferences(body, figures, tables, scientificRuns) {
  const references = new Map();
  const usedAnchors = new Set();
  for (const figure of figures) {
    if (figure.natureId) {
      references.set(figure.natureId, { type: 'figure', label: figure.label, anchor: figure.anchor });
      usedAnchors.add(figure.anchor);
    }
  }
  for (const table of tables) {
    if (table.natureId) {
      references.set(table.natureId, { type: 'table', label: table.label, anchor: table.anchor });
      usedAnchors.add(table.anchor);
    }
  }
  for (const [index, equation] of Array.from(body.querySelectorAll('.c-article-equation')).entries()) {
    const id = equation.id || `Equ${index + 1}`;
    if (!equation.id) equation.id = id;
    const number = Number(id.match(/(\d+)$/)?.[1] || index + 1);
    const anchor = `equation-${number}`;
    references.set(id, { type: 'equation', label: `Equation ${number}`, anchor });
    usedAnchors.add(anchor);
  }
  for (const heading of body.querySelectorAll('[id]')) {
    if (!/^H[2-6]$/.test(heading.tagName)) continue;
    const section = heading.closest('section');
    const sectionTitle = cleanText(
      section?.getAttribute('data-title')
      || section?.querySelector(':scope > .c-article-section > h2, :scope > h2')?.textContent,
    ).toLowerCase();
    if (EXCLUDED_SECTIONS.has(sectionTitle) || heading.closest(JUNK_SELECTORS.join(','))) continue;
    // The identifier range retains its original source text for section
    // identity. A temporary scientific marker is never a scholarly label.
    const headingText = scientificRuns.reduce((text, run) => run.sourceText === undefined
      ? text : text.replaceAll(run.marker, run.sourceText), heading.textContent);
    const baseAnchor = slugify(headingText);
    let anchor = baseAnchor;
    let suffix = 2;
    while (usedAnchors.has(anchor)) anchor = `${baseAnchor}-${suffix++}`;
    usedAnchors.add(anchor);
    references.set(heading.id, {
      type: 'section',
      label: cleanText(headingText),
      // Use the heading's natural Markdown slug. The renderer may add a
      // Quarto `sec-` identifier, but the semantic target stays dialect-free.
      anchor,
    });
  }
  return references;
}

function insertAnchorMarker(parent, marker) {
  const paragraph = parent.ownerDocument.createElement('p');
  paragraph.textContent = marker;
  parent.before(paragraph);
}

function prepareSemanticNodes(body, url, figures, tables) {
  const displayMath = replaceDisplayMath(body, tables);
  const inlineMath = replaceInlineMath(body);
  const scientificRuns = replaceScientificRuns(body, inlineMath, displayMath);
  const literalText = replaceScientificBracketText(body);
  const citations = replaceCitations(body);
  const crossReferences = buildCrossReferences(body, figures, tables, scientificRuns);

  for (const anchor of Array.from(body.querySelectorAll('a[href]'))) {
    const href = anchor.getAttribute('href') || '';
    let fragment = '';
    try {
      if (href.startsWith('#')) {
        fragment = href.slice(1);
      } else {
        const resolved = new URL(href, url);
        const article = new URL(url);
        if (resolved.origin !== article.origin || resolved.pathname !== article.pathname) continue;
        fragment = resolved.hash.slice(1);
      }
    } catch {
      fragment = href.startsWith('#') ? href.slice(1) : '';
    }
    const target = crossReferences.get(fragment);
    // Numeric scholarly links must not match a DOM ID while Defuddle detects
    // prose footnotes. Restore the semantic target after conversion.
    if (target) anchor.setAttribute('href', `#${semanticMarker('CROSSREFERENCE', target.anchor)}`);
  }

  // Capture the protected caption DOM, including citations and typed math,
  // before main figures become placeholders or supplementary sections vanish.
  for (const element of body.querySelectorAll(`[${FIGURE_IDENTITY_ATTR}]`)) {
    const table = tables.find((candidate) => candidate.identity === element.getAttribute(FIGURE_IDENTITY_ATTR));
    if (table) {
      table.captionHtml = captionFor(element).html;
      continue;
    }
    const data = figures.find((candidate) => candidate.identity === element.getAttribute(FIGURE_IDENTITY_ATTR));
    if (!data) continue;
    data.captionHtml = data.source === 'inline figure'
      ? captionFor(element, { includeFigureDescription: true }).html
      : [elementContentHtml(element.querySelector('h3')), elementContentHtml(element.querySelector('.c-article-supplementary__description'))].filter(Boolean).join(' ');
  }

  for (const heading of Array.from(body.querySelectorAll('[id]')).filter((node) => /^H[2-6]$/.test(node.tagName))) {
    const target = crossReferences.get(heading.id);
    if (target) insertAnchorMarker(heading, semanticMarker('SECTIONANCHOR', target.anchor));
  }
  for (const equation of Array.from(body.querySelectorAll('.c-article-equation'))) {
    const target = crossReferences.get(equation.id);
    if (target) insertAnchorMarker(equation, semanticMarker('EQUATIONANCHOR', target.anchor));
  }

  for (const figure of Array.from(body.querySelectorAll('figure'))) {
    const identity = figure.getAttribute(FIGURE_IDENTITY_ATTR) || '';
    const data = figures.find((candidate) => candidate.source === 'inline figure' && candidate.identity === identity);
    if (!data) continue;
    const placeholder = body.ownerDocument.createElement('p');
    placeholder.textContent = semanticMarker('FIGURE', data.anchor);
    figure.replaceWith(placeholder);
  }

  return { displayMath, inlineMath, scientificRuns, literalText, citations, crossReferences };
}

function removeUnwantedContent(document, body) {
  let removedNodes = 0;
  for (const selector of JUNK_SELECTORS) {
    for (const node of Array.from(body.querySelectorAll(selector))) {
      node.remove();
      removedNodes += 1;
    }
  }

  for (const section of Array.from(body.querySelectorAll('section'))) {
    const title = cleanText(
      section.getAttribute('data-title')
      || section.querySelector(':scope > .c-article-section > h2, :scope > h2')?.textContent,
    ).toLowerCase();
    if (EXCLUDED_SECTIONS.has(title)) {
      section.remove();
      removedNodes += 1;
    }
  }

  for (const list of Array.from(body.querySelectorAll('ol.c-article-references, ol.c-article-references__list'))) {
    const section = list.closest('section');
    (section || list).remove();
    removedNodes += 1;
  }

  // Main figures have already become stable placeholders. Remaining figures
  // are tables or unrecognised Nature widgets and should not leak into body.
  for (const node of Array.from(body.querySelectorAll('figure'))) {
    node.remove();
    removedNodes += 1;
  }

  for (const node of Array.from(document.querySelectorAll('header, footer, nav, aside'))) {
    if (node.closest('.c-article-body')) continue;
    node.remove();
    removedNodes += 1;
  }
  return removedNodes;
}

export function isNatureUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:'
      && parsed.hostname.toLowerCase() === NATURE_HOST
      && parsed.pathname.startsWith('/articles/');
  } catch {
    return false;
  }
}

export function articleIdFromUrl(url) {
  if (!isNatureUrl(url)) return '';
  try {
    return new URL(url).pathname.match(/\/articles\/([^/]+)/i)?.[1] || '';
  } catch {
    return '';
  }
}

export function parseNaturePage(html, url) {
  const dom = new JSDOM(html, { url, contentType: 'text/html' });
  const { document } = dom.window;
  const body = document.querySelector('.c-article-body');
  const warnings = [];

  if (!body) {
    warnings.push('Nature article root .c-article-body was not found.');
    return {
      dom,
      document,
      metadata: extractMetadata(document, url),
      figures: [],
      tables: [],
      references: [],
      semantic: { displayMath: [], inlineMath: [], scientificRuns: [], literalText: [], citations: [], crossReferences: new Map() },
      cleanedHtml: document.documentElement.outerHTML,
      debug: {
        publisher: 'Nature', articleRoot: 'not found', metadataSource: 'unknown',
        paragraphs: 0, equations: 0, figures: 0, references: 0, removedNodes: 0, warnings,
      },
    };
  }

  const metadata = extractMetadata(document, url);
  const figures = extractFigures(body, url);
  const tables = extractTables(body, url);
  const references = extractReferences(body);
  const equations = body.querySelectorAll('.c-article-equation, math, mjx-container').length;
  const paragraphs = body.querySelectorAll('p').length;
  const semantic = prepareSemanticNodes(body, url, figures, tables);
  const removedNodes = removeUnwantedContent(document, body);

  if (figures.length === 0) warnings.push('No Nature figures were detected.');
  if (equations === 0) warnings.push('No equation nodes were detected.');
  if (references.length === 0) warnings.push('No Nature reference list was detected.');

  return {
    dom,
    document,
    metadata,
    figures,
    tables,
    references,
    semantic,
    cleanedHtml: document.documentElement.outerHTML,
    debug: {
      publisher: 'Nature',
      articleRoot: '.c-article-body',
      metadataSource: metadata.metadataSource,
      paragraphs,
      equations,
      figures: figures.length,
      references: references.length,
      removedNodes,
      inlineMath: semantic.inlineMath.length,
      scientificRuns: semantic.scientificRuns.length,
      citations: semantic.citations.reduce((sum, item) => sum + item.numbers.length, 0),
      crossReferences: semantic.crossReferences.size,
      crossReferenceMap: Array.from(semantic.crossReferences, ([natureId, target]) => ({ natureId, ...target })),
      warnings,
    },
  };
}
