import { JSDOM } from 'jsdom';

const NATURE_HOSTS = new Set(['nature.com', 'www.nature.com']);
const EXCLUDED_SECTIONS = new Set([
  'about this article',
  'author information',
  'extended data figures and tables',
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
        if (candidate?.['@graph'] && Array.isArray(candidate['@graph'])) {
          values.push(...candidate['@graph']);
        } else {
          values.push(candidate);
        }
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
  const normalizedDate = date.replace(/\//g, '-');

  return {
    title,
    authors,
    journal: firstMeta(document, ['citation_journal_title']) || cleanText(jsonArticle.isPartOf?.name) || 'Nature',
    date: normalizedDate,
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

function imageUrlFor(element, url) {
  const image = element.querySelector('img');
  const source = element.querySelector('source[srcset]');
  const candidate = image?.getAttribute('src')
    || image?.getAttribute('data-src')
    || source?.getAttribute('srcset')?.split(',')[0]?.trim().split(' ')[0]
    || element.querySelector('[data-supp-info-image]')?.getAttribute('data-supp-info-image');
  return normalizeUrl(candidate, url);
}

function extractFigures(body, url) {
  const figures = [];

  for (const figure of body.querySelectorAll('figure')) {
    const caption = cleanText(figure.querySelector('[data-test="figure-caption-text"], figcaption')?.textContent);
    const imageUrl = imageUrlFor(figure, url);
    const id = figure.querySelector('[id^="Fig"]')?.id || '';
    if (!imageUrl || !caption || /^Table\b/i.test(caption) || /^Extended Data Table\b/i.test(caption)) continue;
    figures.push({
      id,
      label: figureLabel(caption, `Figure ${figures.length + 1}`),
      caption,
      imageUrl,
      source: 'inline figure',
    });
  }

  for (const item of body.querySelectorAll('.js-c-reading-companion-figures-item[data-test="supp-item"]')) {
    const heading = item.querySelector('h3')?.textContent;
    const imageUrl = imageUrlFor(item, url);
    const caption = cleanText(heading || item.querySelector('.c-article-supplementary__description')?.textContent);
    if (!imageUrl || !caption || !/Extended Data Fig/i.test(caption)) continue;
    figures.push({
      id: item.id,
      label: figureLabel(caption, `Figure ${figures.length + 1}`),
      caption,
      imageUrl,
      source: 'supplementary figure',
    });
  }

  return figures;
}

function extractTables(body, url) {
  return Array.from(body.querySelectorAll('figure')).flatMap((figure) => {
    const caption = cleanText(figure.querySelector('[data-test="table-caption"], .c-article-table__figcaption')?.textContent);
    if (!caption) return [];
    const link = figure.querySelector('[data-test="table-link"]')?.getAttribute('href');
    return [{ caption, url: normalizeUrl(link, url) }];
  });
}

function extractReferences(body) {
  return Array.from(body.querySelectorAll('ol.c-article-references > li, ol.c-article-references__list > li'))
    .map((item, index) => {
      const text = cleanText(item.querySelector('.c-article-references__text')?.textContent || item.textContent);
      const doi = item.querySelector('[data-doi]')?.getAttribute('data-doi') || '';
      return { number: index + 1, text, doi };
    })
    .filter((reference) => reference.text);
}

function removeUnwantedContent(document, body) {
  let removedNodes = 0;
  for (const selector of JUNK_SELECTORS) {
    const nodes = Array.from(body.querySelectorAll(selector));
    for (const node of nodes) {
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

  // Figures, references, and tables are rendered explicitly after Defuddle
  // so their scholarly structure is stable and never hidden by reader logic.
  for (const node of Array.from(body.querySelectorAll('figure'))) {
    node.remove();
    removedNodes += 1;
  }

  // This catches generic Nature controls that vary slightly between releases.
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
    const match = new URL(url).pathname.match(/\/articles\/([^/]+)/i);
    return match?.[1] || '';
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
      cleanedHtml: document.documentElement.outerHTML,
      debug: {
        publisher: 'Nature',
        articleRoot: 'not found',
        metadataSource: 'unknown',
        paragraphs: 0,
        equations: 0,
        figures: 0,
        references: 0,
        removedNodes: 0,
        warnings,
      },
    };
  }

  const metadata = extractMetadata(document, url);
  const figures = extractFigures(body, url);
  const tables = extractTables(body, url);
  const references = extractReferences(body);
  const equations = body.querySelectorAll('.c-article-equation, math, mjx-container').length;
  const paragraphs = body.querySelectorAll('p').length;
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
      warnings,
    },
  };
}
