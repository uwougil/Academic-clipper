import { JSDOM } from 'jsdom';
import { htmlToMarkdown } from '../markdown.mjs';
import { withDomGlobals } from '../dom-runtime.mjs';

// Defuddle caches a DOMParser bound to its first window. Keep one empty,
// publisher-local conversion window alive; article DOMs are still closed.
let conversionDom;

// Experimental DOM adapter; acquisition and completeness validation are ongoing.
// Do not route production clipping here until complete source-backed tests exist.
const ORIGIN = 'https://iopscience.iop.org';
const ARTICLE_PATH = /^\/article\/(10\.1088\/2053-1583\/(?:[a-z0-9]+|\d+\/\d+\/\d+))(?:\/(?:meta|fulltext))?\/?$/i;

/** Recognize only the two observed DOI path families for 2D Materials. */
export function iopArticleIdentity(value) {
  try {
    const url = new URL(value);
    if (url.origin !== ORIGIN || url.username || url.password) return null;
    const match = url.pathname.match(ARTICLE_PATH);
    if (!match) return null;
    const doi = match[1].toLowerCase();
    // Query/fragment are navigation context, never article identity or credentials
    // to propagate into requests. This module performs no requests.
    return { doi, journal: '2D Materials', url: `${ORIGIN}/article/${doi}` };
  } catch {
    return null;
  }
}

export class IopAdapterError extends Error {
  constructor(code, message, diagnostics = undefined) {
    super(message);
    this.name = 'IopAdapterError';
    this.code = code;
    if (diagnostics) this.diagnostics = diagnostics;
  }
}

function values(document, name) {
  return Array.from(document.querySelectorAll('meta[name]'))
    .filter((node) => node.getAttribute('name').toLowerCase() === name)
    .map((node) => (node.getAttribute('content') || '').trim())
    .filter(Boolean);
}

function single(document, name) {
  const found = [...new Set(values(document, name))];
  if (found.length > 1) {
    throw new IopAdapterError('IOP_METADATA_CONFLICT', `Conflicting ${name} metadata.`);
  }
  return found[0] || '';
}

function authorInformation(document) {
  const authors = [];
  let author;
  for (const node of document.querySelectorAll('meta[name]')) {
    const name = node.getAttribute('name').toLowerCase();
    const content = (node.getAttribute('content') || '').trim();
    if (name === 'citation_author' && content) {
      author = { name: content, institutions: [], orcid: null };
      authors.push(author);
    } else if (author && name === 'citation_author_institution' && content) {
      author.institutions.push(content);
    } else if (author && name === 'citation_author_orcid' && content) {
      const match = content.match(/^https?:\/\/orcid\.org\/(\d{4}-\d{4}-\d{4}-\d{3}[\dX])$/);
      if (match) author.orcid = `https://orcid.org/${match[1]}`;
    }
  }
  return authors.some(item => item.institutions.length || item.orcid) ? authors : null;
}

/**
 * Inspect conventional citation_* head metadata without claiming full text.
 * citation_* has been observed in aeaa68 and the subscription 025001 browser DOM.
 * Never use metadata presence as proof of access or completeness.
 */
export function inspectIopPage(html, url) {
  const identity = iopArticleIdentity(url);
  if (!identity) {
    throw new IopAdapterError('IOP_URL_UNSUPPORTED', 'Expected a 2D Materials IOPscience article URL.');
  }
  const dom = new JSDOM(html, { url: identity.url, contentType: 'text/html' });
  try {
    const { document } = dom.window;
    for (const link of document.querySelectorAll('link[rel]')) {
      if (!link.rel.toLowerCase().split(/\s+/).includes('canonical')) continue;
      const canonical = iopArticleIdentity(new URL(link.getAttribute('href') || '', identity.url).href);
      if (!canonical || canonical.doi !== identity.doi) {
        throw new IopAdapterError('IOP_IDENTITY_MISMATCH', 'Canonical URL disagrees with the requested article.');
      }
    }
    const doi = single(document, 'citation_doi').toLowerCase();
    const journal = single(document, 'citation_journal_title');
    if ((doi && doi !== identity.doi) || (journal && journal !== identity.journal)) {
      throw new IopAdapterError('IOP_IDENTITY_MISMATCH', 'Citation metadata disagrees with the requested article.');
    }
    const title = single(document, 'citation_title');
    const authors = values(document, 'citation_author');
    const metadata = doi && journal && title ? {
      ...identity, title, authors,
      date: single(document, 'citation_online_date') || single(document, 'citation_publication_date'),
      volume: single(document, 'citation_volume'),
      issue: single(document, 'citation_issue'),
      // In the observed 2D Materials head, institution/ORCID entries follow
      // their author. Correspondence is not inferred from this metadata.
      authorInformation: authorInformation(document),
      metadataSource: 'candidate-citation-meta',
    } : null;
    return {
      identity,
      metadata,
      status: 'blocked-unverified-dom',
      fullTextVerified: false,
      warnings: [{
        code: 'IOP_DOM_UNVERIFIED',
        message: 'Metadata inspection alone does not verify an accessible or complete article body.',
      }],
    };
  } finally {
    dom.window.close();
  }
}

/** Fail closed rather than output a preview/challenge page as a complete paper. */
export function parseIopPage(html, url) {
  const diagnostics = inspectIopPage(html, url);
  const dom = new JSDOM(html, { url: diagnostics.identity.url });
  try {
    const document = dom.window.document;
    const body = document.querySelector('.wd-jnl-art-full-text[itemprop="articleBody"]');
    if (!diagnostics.metadata || !body || !body.querySelector('p')
      || document.querySelector('.wd-jnl-art-turn-away-panel')) {
      throw new IopAdapterError('IOP_DOM_UNVERIFIED', 'An accessible publisher article body and identity are required.', diagnostics);
    }
    const warnings = [];
    const references = [...document.querySelectorAll('#references-wrapper li[data-reference]')].map(node => ({
      id: node.id, number: Number(node.querySelector('.indices-id')?.textContent.match(/\d+/)?.[0]),
      html: node.querySelector('cite')?.innerHTML || '', doi: node.getAttribute('doi') || null,
    }));
    const referenceIds = new Set(references.map(item => item.id));
    const citations = [...body.querySelectorAll('a.cite')].map(node => ({ target: node.getAttribute('href'), text: node.textContent }));
    for (const citation of citations) if (!referenceIds.has(citation.target?.slice(1))) {
      warnings.push({ code: 'IOP_REFERENCE_UNAVAILABLE', target: citation.target });
    }
    return {
      metadata: diagnostics.metadata, bodyHtml: body.outerHTML, references, citations,
      sections: [...body.querySelectorAll('h2,h3,h4')].map(node => ({ id: node.id, level: Number(node.tagName.slice(1)), title: node.textContent.trim() })),
      supplementary: [...document.querySelectorAll('a#supplDataLink')].map(node => ({ title: node.textContent.trim(), url: new URL(node.getAttribute('href'), diagnostics.identity.url).href }))
        .filter(item => item.url === `${diagnostics.identity.url}/data`),
      warnings, fullTextVerified: false, status: 'experimental-body-extracted',
    };
  } finally { dom.window.close(); }
}

/** Convert the supplied accessible DOM; never fetch or claim HTTP completeness. */
export async function convertIopPage(html, url) {
  const parsed = parseIopPage(html, url);
  const dom = new JSDOM(parsed.bodyHtml, { url: parsed.metadata.url });
  try {
    const document = dom.window.document;
    const root = document.querySelector('[itemprop="articleBody"]');
    const tokens = [];
    let prefix = 'IOPSEMANTICTOKEN';
    while (html.includes(prefix)) prefix += 'X';
    const protect = (node, markdown) => {
      const token = `${prefix}${tokens.length}END`;
      tokens.push({ token, markdown });
      node.replaceWith(document.createTextNode(token));
    };
    const prepareMath = (scope) => {
      for (const node of [...scope.querySelectorAll('.inline-eqn,.display-eqn')]) {
        if (node.parentElement?.closest('.inline-eqn,.display-eqn')) continue;
        const script = [...node.querySelectorAll('script[type]')].find(n => /^math\/tex(?:\s*;\s*mode=display)?$/i.test(n.type));
        const alt = node.querySelector('img[role="math"]')?.getAttribute('alt') || '';
        const tex = script?.textContent.trim() || (alt.startsWith('$') && alt.endsWith('$') ? alt.slice(1, -1).trim() : '');
        if (!tex) throw new IopAdapterError('IOP_MATH_SOURCE_MISSING', `Missing original TeX at ${node.id || 'inline equation'}.`);
        protect(node, node.classList.contains('display-eqn') ? `\n\n$$\n${tex}\n$$\n\n` : `$${tex}$`);
      }
    };
    prepareMath(root);
    // Preserve actual sub/superscript semantics without guessing chemical runs.
    for (const node of root.querySelectorAll('sub,sup')) protect(node, node.tagName === 'SUB' ? `$_{${node.textContent}}$` : `$^{${node.textContent}}$`);
    const referenceMap = new Map(parsed.references.map(item => [item.id, item]));
    for (const anchor of root.querySelectorAll('a.cite')) {
      const href = anchor.getAttribute('href');
      const reference = referenceMap.get(href?.slice(1));
      if (reference?.number) protect(anchor, `[^${reference.number}]`);
      else anchor.setAttribute('href', `${parsed.metadata.url}${href}`);
    }
    for (const figure of root.querySelectorAll('figure[data-toolbar-type="figure"]')) {
      const caption = figure.querySelector('.figure-caption');
      const image = figure.querySelector('a.fig-dwnld-hi-img,a.fig-dwnld-std-img');
      const candidate = image && new URL(image.getAttribute('href'), parsed.metadata.url);
      const replacement = document.createElement('div');
      if (candidate?.protocol === 'https:' && candidate.hostname === 'content.cld.iop.org' && !candidate.username && !candidate.password && !candidate.port) {
        const label = caption?.querySelector('strong')?.textContent || 'Figure';
        protect(image, `\n\n![${label}](${candidate.href})\n\n`);
        replacement.append(figure.querySelector('figcaption') || caption || document.createElement('div'));
        replacement.querySelectorAll('a,button,.print-hide').forEach(n => n.remove());
      } else if (caption) replacement.append(caption);
      figure.replaceWith(replacement);
    }
    // Publisher numeric crossrefs remain readable; no dangling local targets.
    for (const anchor of root.querySelectorAll('a[href^="#"]')) anchor.replaceWith(document.createTextNode(anchor.textContent));
    root.querySelectorAll('script,svg,mjx-container,button,.print-hide,.texImage,iframe').forEach(node => node.remove());
    const referenceHtml = document.createElement('div');
    for (const reference of parsed.references) {
      if (!Number.isInteger(reference.number) || !reference.number || !reference.html) throw new IopAdapterError('IOP_REFERENCE_INVALID', 'Reference identity or content is missing.');
      const row = document.createElement('p'); row.innerHTML = reference.html;
      prepareMath(row);
      for (const node of row.querySelectorAll('sub,sup')) protect(node, node.tagName === 'SUB' ? `$_{${node.textContent}}$` : `$^{${node.textContent}}$`);
      referenceHtml.append(row);
    }
    conversionDom ??= new JSDOM('<!doctype html><html><body></body></html>');
    const convert = content => withDomGlobals(conversionDom, () => htmlToMarkdown(content, parsed.metadata.url));
    let markdown = await convert(root.outerHTML);
    if (parsed.references.length) {
      markdown += '\n\n## References\n\n';
      for (let i = 0; i < parsed.references.length; i++) {
        const reference = parsed.references[i];
        const text = (await convert(referenceHtml.children[i].outerHTML)).trim().replace(/\n/g, ' ');
        markdown += `[^${reference.number}]: ${text}${reference.doi ? ` [Crossref](https://doi.org/${encodeURI(reference.doi)})` : ''}\n`;
      }
    }
    for (const { token, markdown: value } of tokens) markdown = markdown.replaceAll(token, () => value);
    markdown = markdown.replaceAll('\u00a0', ' ').trim() + '\n';
    for (const item of parsed.supplementary) markdown += `\n[${item.title}](${item.url})\n`;
    return { ...parsed, markdown };
  } finally { dom.window.close(); }
}

/** Extract source TeX only; rendered MathJax and image fallbacks are duplicates. */
export function extractIopMath(html, url) {
  inspectIopPage(html, url);
  const dom = new JSDOM(html);
  try {
    const root = dom.window.document.querySelector('.wd-jnl-art-full-text[itemprop="articleBody"]');
    if (!root) throw new IopAdapterError('IOP_BODY_UNAVAILABLE', 'IOPscience full-text root was not found.');
    const equations = [];
    const warnings = [];
    for (const node of root.querySelectorAll('.inline-eqn, .display-eqn')) {
      if (node.parentElement?.closest('.inline-eqn, .display-eqn')) continue;
      const script = Array.from(node.querySelectorAll('script[type]'))
        .find((item) => /^math\/tex(?:\s*;\s*mode=display)?$/i.test(item.type));
      const tex = script?.textContent.trim();
      const display = node.classList.contains('display-eqn');
      if (!tex) {
        warnings.push({ code: 'IOP_MATH_SOURCE_MISSING', id: node.id, display });
        continue;
      }
      equations.push({ id: node.id, display, tex, source: 'script-math-tex' });
    }
    return { equations, warnings };
  } finally {
    dom.window.close();
  }
}

/** Inspect publisher figure captions without downloading external resources. */
export async function extractIopFigures(html, url) {
  const { identity } = inspectIopPage(html, url);
  const dom = new JSDOM(html, { url: identity.url });
  try {
    const root = dom.window.document.querySelector('.wd-jnl-art-full-text[itemprop="articleBody"]');
    if (!root) throw new IopAdapterError('IOP_BODY_UNAVAILABLE', 'IOPscience full-text root was not found.');
    const figures = [];
    const warnings = [];
    for (const figure of root.querySelectorAll('figure[data-toolbar-type="figure"]')) {
      const caption = figure.querySelector('.figure-caption')?.cloneNode(true);
      if (!caption) {
        warnings.push({ code: 'IOP_FIGURE_CAPTION_MISSING', id: figure.id });
        continue;
      }
      // Defuddle escapes backslashes in ordinary text. Restore source TeX after
      // conversion using tokens guaranteed absent from the original caption.
      const mathSources = [];
      let prefix = 'IOPFIGUREMATHTOKEN';
      while (caption.textContent.includes(prefix)) prefix += 'X';
      for (const math of caption.querySelectorAll('.inline-eqn')) {
        const source = math.querySelector('script[type="math/tex"]')?.textContent.trim();
        if (!source) throw new IopAdapterError('IOP_MATH_SOURCE_MISSING', 'Figure caption lacks source TeX.');
        const token = `${prefix}${mathSources.length}END`;
        mathSources.push({ token, source });
        math.replaceWith(dom.window.document.createTextNode(token));
      }
      caption.querySelectorAll('script,svg,mjx-container,button').forEach((node) => node.remove());
      const imageUrl = (selector) => {
        const href = figure.querySelector(selector)?.getAttribute('href');
        if (!href) return null;
        try {
          const candidate = new URL(href, identity.url);
          if (candidate.protocol !== 'https:' || candidate.hostname !== 'content.cld.iop.org'
            || candidate.port || candidate.username || candidate.password) return null;
          return candidate.href;
        } catch { return null; }
      };
      const standardUrl = imageUrl('a.fig-dwnld-std-img');
      const highResolutionUrl = imageUrl('a.fig-dwnld-hi-img');
      if (!standardUrl && !highResolutionUrl) warnings.push({ code: 'IOP_FIGURE_IMAGE_MISSING', id: figure.id });
      conversionDom ??= new JSDOM('<!doctype html><html><body></body></html>');
      let captionMarkdown = await withDomGlobals(conversionDom, () => htmlToMarkdown(caption.outerHTML, identity.url));
      for (const { token, source } of mathSources) captionMarkdown = captionMarkdown.replaceAll(token, () => `$${source}$`);
      captionMarkdown = captionMarkdown.replaceAll('\u00a0', ' ');
      figures.push({ id: figure.id, captionMarkdown: captionMarkdown.trim(), standardUrl, highResolutionUrl });
    }
    return { figures, warnings };
  } finally { dom.window.close(); }
}
