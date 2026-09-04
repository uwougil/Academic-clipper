import { JSDOM } from 'jsdom';
import { semanticMarker } from '../normalizers/markers.mjs';

const NATURE_HOSTS = new Set(['nature.com', 'www.nature.com']);
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

function captionFor(figure) {
  const element = figure.querySelector('[data-test="figure-caption-text"]')
    || figure.querySelector('[data-test="table-caption"]')
    || figure.querySelector('.c-article-table__figcaption')
    || figure.querySelector('figcaption');
  return {
    text: cleanText(element?.textContent),
    html: element?.innerHTML || '',
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
    const captionData = captionFor(figure);
    const caption = captionData.text;
    const isTable = /^Table\b|^Extended Data Table\b/i.test(caption);
    const inExcludedSection = Boolean(figure.closest('section[data-title="Extended data figures and tables"]'));
    const imageUrl = imageUrlFor(figure, url);
    if (inExcludedSection || isTable || !imageUrl || !caption) continue;

    const id = figure.id || figure.querySelector('[id^="Fig"]')?.id || '';
    const number = figures.length + 1;
    const identity = `inline-figure-${number}`;
    figure.setAttribute(FIGURE_IDENTITY_ATTR, identity);
    figures.push({
      identity,
      id,
      natureId: id,
      anchor: `figure-${number}`,
      label: figureLabel(caption, `Figure ${number}`),
      caption,
      captionHtml: captionData.html,
      alt: `Figure ${number}`,
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

function extractTables(body, url) {
  let number = 0;
  return Array.from(body.querySelectorAll('figure')).flatMap((figure) => {
    const caption = captionFor(figure).text;
    if (!/^Table\b|^Extended Data Table\b/i.test(caption)) return [];
    number += 1;
    const link = figure.querySelector('[data-test="table-link"], a[href]')?.getAttribute('href');
    const id = figure.id || figure.querySelector('[id^="Tab"]')?.id || '';
    return [{
      id,
      natureId: id,
      anchor: `table-${number}`,
      label: tableLabel(caption, `Table ${number}`),
      caption,
      url: normalizeUrl(link, url),
    }];
  });
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

function replaceDisplayMath(body) {
  const values = [];
  for (const element of Array.from(body.querySelectorAll('.c-article-equation .mathjax-tex'))) {
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
    const tex = extractMathSource(element.textContent);
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
  return node?.nodeType === 1 && tags.has(node.tagName);
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

function allowedScientificText(text) {
  const normalized = String(text || '').replace(/\u00a0/g, ' ');
  if (!normalized || /^\s/u.test(normalized)) return null;
  const match = normalized.match(/^[A-Za-z0-9∞−+\-_/|{}'=′″]+/u);
  if (!match) return null;
  return { length: match[0].length, text: match[0] };
}

function setRangeEnd(range, end) {
  if (end.after) range.setEndAfter(end.node);
  else range.setEnd(end.node, end.offset);
}

function replaceRangeWithScientificMarker(parent, start, end, values, inlineMathByMarker, provenance) {
  const range = parent.ownerDocument.createRange();
  range.setStart(start.node, start.offset);
  setRangeEnd(range, end);
  const fragment = range.extractContents();
  const tex = Array.from(fragment.childNodes)
    .map((node) => scientificTex(node, inlineMathByMarker))
    .join('')
    .replace(/[ \t\r\n\u00a0\u2009]+/gu, '');
  if (!tex) return false;
  const marker = semanticMarker('SCIENTIFICRUN', values.length);
  values.push({ marker, tex, provenance });
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

function collectTextAndStyledSymbolRun(parent, startIndex) {
  const node = parent.childNodes[startIndex];
  if (!isElement(node, new Set(['I', 'B']))) return null;
  const previous = parent.childNodes[startIndex - 1];
  if (previous?.nodeType !== 3) return null;
  const match = previous.textContent.match(/(?:∞|[−+\-]?\d+)(?:\/)?$/u);
  if (!match || match.index === undefined) return null;
  const token = previous.textContent.slice(match.index);
  if (!/^(?:∞|[−+\-]?\d+)(?:\/)?$/u.test(token)) return null;
  return {
    start: { node: previous, offset: match.index },
    end: { node, after: true },
  };
}

function replaceScientificRuns(body, inlineMath) {
  const values = [];
  const inlineMathByMarker = new Map(inlineMath.map((item) => [item.marker, item]));
  const parents = Array.from(body.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, figcaption'));
  for (const parent of parents) {
    let index = 0;
    while (index < parent.childNodes.length) {
      const node = parent.childNodes[index];
      const range = node.nodeType === 3
        ? collectMathMarkerRun(parent, index, inlineMathByMarker)
        : collectStyledRun(parent, index)
          || collectTextAndStyledSymbolRun(parent, index)
          || collectNumericAttachmentRun(parent, index)
          || collectNumericSuperscriptRun(parent, index)
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
  // These are plain Nature text nodes, not MathJax. Protect every numeric
  // bracket expression before Defuddle can serialize it as \\[...\\]. This
  // covers crystallographic directions such as [100], [210] and [001], as
  // well as the [111]-strained form, without hard-coding an article string.
  const pattern = /\[(\d+(?:[,\s−+\-]\d+)*)\]/gu;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement?.closest('.mathjax-tex, .c-article-equation, ol.c-article-references, ol.c-article-references__list')) continue;
    const next = node.textContent.replace(pattern, (match) => {
      const marker = semanticMarker('LITERALTEXT', values.length);
      values.push({ marker, text: match });
      return marker;
    });
    if (next !== node.textContent) node.textContent = next;
  }
  return values;
}

function citationNumber(anchor) {
  const text = cleanText(anchor.textContent).match(/\d+/)?.[0];
  if (text) return Number(text);
  const href = anchor.getAttribute('href') || '';
  return Number(href.match(/#ref-CR(\d+)/i)?.[1] || 0);
}

function replaceCitations(body) {
  const values = [];
  for (const sup of Array.from(body.querySelectorAll('sup'))) {
    const anchors = Array.from(sup.querySelectorAll('a[data-test="citation-ref"], a[href*="#ref-CR"]'));
    const numbers = anchors.map(citationNumber).filter(Boolean);
    if (!numbers.length) continue;
    const marker = semanticMarker('CITATION', values.length);
    values.push({ marker, numbers });
    sup.replaceWith(body.ownerDocument.createTextNode(marker));
  }

  for (const anchor of Array.from(body.querySelectorAll('a[data-test="citation-ref"], a[href*="#ref-CR"]'))) {
    if (anchor.closest('ol.c-article-references, ol.c-article-references__list')) continue;
    const number = citationNumber(anchor);
    if (!number) continue;
    const marker = semanticMarker('CITATION', values.length);
    values.push({ marker, numbers: [number] });
    anchor.replaceWith(body.ownerDocument.createTextNode(marker));
  }
  return values;
}

function buildCrossReferences(body, figures, tables) {
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
    const baseAnchor = slugify(heading.textContent);
    let anchor = baseAnchor;
    let suffix = 2;
    while (usedAnchors.has(anchor)) anchor = `${baseAnchor}-${suffix++}`;
    usedAnchors.add(anchor);
    references.set(heading.id, {
      type: 'section',
      label: cleanText(heading.textContent),
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
  const displayMath = replaceDisplayMath(body);
  const inlineMath = replaceInlineMath(body);
  const scientificRuns = replaceScientificRuns(body, inlineMath);
  const literalText = replaceScientificBracketText(body);
  const citations = replaceCitations(body);
  const crossReferences = buildCrossReferences(body, figures, tables);

  for (const anchor of Array.from(body.querySelectorAll('a[href]'))) {
    const href = anchor.getAttribute('href') || '';
    let fragment = '';
    try {
      fragment = new URL(href, url).hash.slice(1);
    } catch {
      fragment = href.startsWith('#') ? href.slice(1) : '';
    }
    const target = crossReferences.get(fragment);
    if (target) anchor.setAttribute('href', `#${target.anchor}`);
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
    return NATURE_HOSTS.has(parsed.hostname.toLowerCase()) && parsed.pathname.startsWith('/articles/');
  } catch {
    return false;
  }
}

export function articleIdFromUrl(url) {
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
