import { JSDOM } from 'jsdom';
import { htmlToMarkdown } from '../markdown.mjs';
import { withDomGlobals } from '../dom-runtime.mjs';

// Defuddle caches a DOMParser bound to its first window. Keep one empty,
// publisher-local conversion window alive; article DOMs are still closed.
let conversionDom;

// Experimental preflight; source acquisition and full-text implementation are ongoing.
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
        message: 'IOPscience full-text extraction is not implemented yet. Full-text conversion is disabled.',
      }],
    };
  } finally {
    dom.window.close();
  }
}

/** Fail closed rather than output a preview/challenge page as a complete paper. */
export function parseIopPage(html, url) {
  const diagnostics = inspectIopPage(html, url);
  throw new IopAdapterError('IOP_DOM_UNVERIFIED', diagnostics.warnings[0].message, diagnostics);
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
