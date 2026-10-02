import { JSDOM } from 'jsdom';
import { isSafeExternalUrl } from '../security.mjs';
import { semanticMarker } from '../normalizers/markers.mjs';

// Experimental, detached from the production Nature router. These article
// selectors are hypotheses tested synthetically, NOT observed CMS DOM facts.
const TARGET_JOURNAL = 'Computational Materials Science';
const BODY = '.Body';
const ABSTRACT = '.Abstracts';
const text = (node) => String(node?.textContent ?? '').replace(/\s+/gu, ' ').trim();

export function isScienceDirectUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'www.sciencedirect.com'
      && !url.username && !url.password && !url.port
      && /^\/science\/article\/(?:abs\/)?pii\/S\d{16}$/u.test(url.pathname);
  } catch { return false; }
}

export function scienceDirectArticleIdFromUrl(value) {
  return isScienceDirectUrl(value) ? new URL(value).pathname.split('/').at(-1) : '';
}

function resourceUrl(value, base) {
  try {
    const url = new URL(value, base);
    return !url.username && !url.password && isSafeExternalUrl(url.href) ? url.href : '';
  } catch { return ''; }
}

function articleJson(document) {
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const value = JSON.parse(script.textContent);
      const entries = (Array.isArray(value) ? value : [value]).flatMap(x => x?.['@graph'] || [x]);
      const article = entries.find(x => [x?.['@type']].flat().some(t => /^(?:ScholarlyArticle|Article)$/u.test(t)));
      if (article) return article;
    } catch { /* Malformed metadata is not executable content. */ }
  }
  return {};
}

function metadata(document, url, warnings) {
  const values = (name) => [...document.querySelectorAll('meta[name], meta[property]')]
    .filter(n => (n.getAttribute('name') || n.getAttribute('property')).toLowerCase() === name)
    .map(n => (n.getAttribute('content') || '').trim()).filter(Boolean);
  const first = (...names) => names.map(n => values(n)[0]).find(Boolean) || '';
  const json = articleJson(document);
  const domAuthors = [...document.querySelectorAll('.author-group .author')].map(n => {
    const given = text(n.querySelector('.given-name'));
    const surname = text(n.querySelector('.surname'));
    return [given, surname].filter(Boolean).join(' ');
  }).filter(Boolean);
  const jsonAuthors = [json.author || []].flat().map(a => typeof a === 'string' ? a : a?.name).filter(Boolean);
  const authors = values('citation_author');
  const affiliations = [...document.querySelectorAll('.affiliation')]
    .filter(n => !n.parentElement?.closest('.affiliation'))
    .map(n => ({ id: n.id, address: text(n.querySelector('.text') || n), authors: '' }));
  const metaAffiliations = values('citation_author_institution');
  if (!affiliations.length) affiliations.push(...metaAffiliations.map(address => ({ id: '', address, authors: '' })));
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (canonical && scienceDirectArticleIdFromUrl(resourceUrl(canonical, url)) !== scienceDirectArticleIdFromUrl(url)) {
    warnings.push('IDENTITY_MISMATCH: canonical does not identify the requested ScienceDirect article.');
  }
  return {
    title: first('citation_title', 'dc.title') || json.headline || text(document.querySelector('.title-text')),
    authors: authors.length ? authors : jsonAuthors.length ? jsonAuthors : domAuthors,
    journal: first('citation_journal_title') || json.isPartOf?.name || text(document.querySelector('.publication-title')),
    doi: first('citation_doi', 'dc.identifier').replace(/^(?:doi:|https?:\/\/(?:dx\.)?doi\.org\/)/iu, ''),
    date: first('citation_publication_date', 'citation_online_date') || json.datePublished || '',
    volume: first('citation_volume'), issue: first('citation_issue'),
    url: new URL(url).origin + new URL(url).pathname,
    authorInformation: { affiliations, notes: [], contributions: '', correspondence: null },
    metadataSource: 'citation/DC metadata, article JSON-LD, then experimental DOM selectors',
  };
}

function cleanClone(node, url) {
  const clone = node.cloneNode(true);
  for (const junk of clone.querySelectorAll('script, style, iframe, object, embed, form, input, button, nav, aside, [hidden], [aria-hidden="true"], .recommended-articles, .download-links')) junk.remove();
  for (const element of [clone, ...clone.querySelectorAll('*')]) {
    for (const attr of [...element.attributes]) {
      if (/^on/iu.test(attr.name) || ['style', 'srcdoc', 'srcset'].includes(attr.name)) element.removeAttribute(attr.name);
    }
    for (const name of ['href', 'src']) {
      if (!element.hasAttribute(name)) continue;
      const value = element.getAttribute(name);
      const safe = value ? resourceUrl(value, url) : '';
      if (safe) element.setAttribute(name, safe);
      else element.removeAttribute(name);
    }
  }
  return clone;
}

function equations(root, warnings) {
  const result = [];
  const semantic = { inlineMath: [], displayMath: [] };
  const selector = '.display-formula, .inline-formula, .equation, math';
  for (const node of [...root.querySelectorAll(selector)].filter(n => !n.parentElement?.closest(selector))) {
    const math = node.matches('math') ? node : node.querySelector('math');
    const tex = node.querySelector('annotation[encoding="application/x-tex"], annotation[encoding="application/x-latex"]')?.textContent.trim()
      || math?.getAttribute('alttext')?.trim() || '';
    const display = node.matches('.display-formula, .equation') || math?.getAttribute('display') === 'block';
    const image = node.querySelector('img');
    const alternative = image?.getAttribute('alt') || text(node);
    const status = tex ? 'tex' : image ? 'image-only' : 'unsupported-mathml';
    result.push({ id: node.id, display, tex, status, alternative, imageUrl: image?.getAttribute('src') || '' });
    if (tex) {
      const items = display ? semantic.displayMath : semantic.inlineMath;
      const marker = semanticMarker(display ? 'DISPLAYMATH' : 'INLINEMATH', items.length);
      items.push({ marker, tex });
      const replacement = root.ownerDocument.createElement(display ? 'p' : 'span');
      replacement.textContent = marker;
      node.replaceWith(replacement);
    } else {
      warnings.push(`EQUATION_UNSUPPORTED: ${node.id || '(no id)'} has ${status}; no TeX was inferred.`);
      // Keep an available image/alt through Defuddle; unsupported MathML is
      // explicitly unavailable rather than leaking XML or inventing TeX.
      if (!image) node.textContent = `[Equation unavailable${node.id ? `: ${node.id}` : ''}]`;
    }
  }
  return { result, semantic };
}

function links(root, selector, url) {
  return [...root.querySelectorAll(selector)].flatMap(n => [...n.querySelectorAll('a[href]')])
    .map(n => ({ text: text(n), url: resourceUrl(n.getAttribute('href'), url) }))
    .filter(n => n.url);
}

/**
 * Parse only supplied HTML; no scripts, network, hydration, credentials or IO.
 * body-present describes supplied evidence, never verified full-text access.
 * Result is an experimental extraction model, not the shared writer contract.
 */
export function parseScienceDirectPage(html, url) {
  if (!isScienceDirectUrl(url)) throw new Error('Expected an exact HTTPS www.sciencedirect.com article PII URL.');
  const dom = new JSDOM(html, { url }); // Default: no runScripts, no resource loader.
  const document = dom.window.document;
  const warnings = ['EXPERIMENTAL_UNVERIFIED: article selectors lack accessible Computational Materials Science DOM evidence.'];
  const result = {
    publisher: 'ScienceDirect', experimental: true,
    articleId: scienceDirectArticleIdFromUrl(url), metadata: {},
    availability: { status: 'missing-body', fullTextVerified: false, canRenderExcerpt: false },
    sections: [], figures: [], tables: [], references: [], citations: [],
    internalReferences: [], supplementaryLinks: [], dataLinks: [], equations: [],
    semantic: { inlineMath: [], displayMath: [] }, bodyHtml: '',
    debug: { warnings },
  };
  try {
    const heading = text(document.querySelector('h1'));
    const blocked = /^(?:Are you a robot\?|Access denied|Just a moment|Robot check)/iu.test(heading)
      || document.querySelector('#challenge-form, #cf-challenge-running');
    if (blocked) {
      result.availability.status = 'blocked';
      warnings.push('ACCESS_BLOCKED: challenge/access page; no article extraction attempted.');
      return result;
    }
    result.metadata = metadata(document, url, warnings);
    if (warnings.some(w => w.startsWith('IDENTITY_MISMATCH:'))) {
      result.availability.status = 'identity-mismatch';
      return result;
    }
    if (result.metadata.journal !== TARGET_JOURNAL) {
      result.availability.status = result.metadata.journal ? 'unsupported-journal' : 'missing-identity';
      warnings.push('TARGET_NOT_CONFIRMED: only Computational Materials Science is admitted to this experiment.');
      return result;
    }
    const body = document.querySelector(BODY);
    const abstract = document.querySelector(ABSTRACT);
    const preview = new URL(url).pathname.includes('/abs/') || document.querySelector('.article-preview, #article-preview');
    const bodyPresent = Boolean(body && [...body.querySelectorAll('p')].some(n => text(n)));
    result.availability.status = preview ? 'preview' : bodyPresent ? 'body-present' : abstract ? 'abstract-only' : 'missing-body';
    warnings.push(`CONTENT_INCOMPLETE: ${result.availability.status}; full article completeness is not established.`);
    const root = document.createElement('article');
    if (abstract && !body?.contains(abstract)) root.append(cleanClone(abstract, result.metadata.url));
    if (body) root.append(cleanClone(body, result.metadata.url));
    if (!root.children.length) return result;
    result.availability.canRenderExcerpt = Boolean(text(root));
    result.sections = [...root.querySelectorAll('h2, h3, h4, h5, h6')]
      .map(n => ({ id: n.id || n.parentElement?.id || '', level: Number(n.tagName[1]), title: text(n) }));
    result.figures = [...root.querySelectorAll('figure, .figure')]
      .filter(n => !n.parentElement?.closest('figure, .figure'))
      .map(n => ({ id: n.id, caption: text(n.querySelector('figcaption, .caption')),
        imageUrl: n.querySelector('img')?.getAttribute('src') || '',
        alt: n.querySelector('img')?.getAttribute('alt') || '',
        status: n.querySelector('img[src]') ? 'image-present' : 'unavailable',
        url: `${result.metadata.url}${n.id ? `#${n.id}` : ''}` }));
    for (const figure of result.figures) if (figure.status === 'unavailable') warnings.push(`FIGURE_UNAVAILABLE: ${figure.id || '(no id)'}; modal content was not fetched.`);
    result.tables = [...root.querySelectorAll('.tables, .table, table')]
      .filter(n => !n.parentElement?.closest('.tables, .table, table'))
      .map(n => {
        const table = n.matches('table') ? n : n.querySelector('table');
        const complex = Boolean(table?.querySelector('[rowspan]:not([rowspan="1"]), [colspan]:not([colspan="1"])'));
        const rows = [...table?.querySelectorAll('tr') || []].map(row => [...row.children]
          .filter(cell => cell.matches('td, th')).map(text));
        const status = rows.some(row => row.length) ? complex ? 'html-complex' : 'html' : 'unavailable';
        if (status !== 'html') warnings.push(`TABLE_FALLBACK: ${n.id || '(no id)'} is ${status}; no modal/API content was fetched.`);
        return { id: n.id, caption: text(n.querySelector('caption, .caption')), rows, status,
          html: table?.outerHTML || '', url: `${result.metadata.url}${n.id ? `#${n.id}` : ''}` };
      });
    result.references = [...root.querySelectorAll('.references .reference, .references li')]
      .filter(n => !n.parentElement?.closest('.references .reference, .references li'))
      .map(n => ({ id: n.id, label: text(n.querySelector('.label')), text: text(n),
        doiUrl: [...n.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).find(h => /^https:\/\/doi\.org\//u.test(h)) || '' }));
    const refs = new Map(result.references.filter(r => r.id).map(r => [r.id, r]));
    for (const anchor of root.querySelectorAll('a[href]')) {
      const link = new URL(anchor.getAttribute('href'), result.metadata.url);
      if (link.origin + link.pathname !== result.metadata.url || !link.hash) continue;
      let target;
      try { target = decodeURIComponent(link.hash.slice(1)); } catch { target = link.hash.slice(1); }
      const citation = refs.get(target);
      const resolved = Boolean([...root.querySelectorAll('[id]')].some(n => n.id === target));
      const entry = { label: text(anchor), target, resolved };
      if (citation) result.citations.push({ ...entry, referenceLabel: citation.label });
      else result.internalReferences.push(entry);
      // No crossref/citation dialect is promised. Absolute source links remain
      // useful for excerpts and never create a dangling local Markdown target.
      if (!resolved) warnings.push(`REFERENCE_UNRESOLVED: ${target}; source link retained.`);
    }
    result.supplementaryLinks = links(root, '.appendices, .supplementary-material', result.metadata.url);
    result.dataLinks = links(root, '.data-availability', result.metadata.url);
    const extracted = equations(root, warnings);
    result.equations = extracted.result;
    result.semantic = extracted.semantic;
    result.bodyHtml = root.outerHTML;
    return result;
  } finally {
    dom.window.close();
  }
}
