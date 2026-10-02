import { JSDOM } from 'jsdom';

// Experimental preflight only. No IOPscience article DOM has been admitted yet.
// Do not route production clipping here until source-backed full-text tests exist.
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

/**
 * Inspect conventional citation_* head metadata without claiming full text.
 * This convention is a candidate tested with synthetic input, NOT observed IOP
 * DOM evidence. Never use metadata presence as proof of access or completeness.
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
      date: single(document, 'citation_publication_date'),
      volume: single(document, 'citation_volume'),
      issue: single(document, 'citation_issue'),
      // Author/affiliation relationships and correspondence need observed DOM.
      authorInformation: null,
      metadataSource: 'candidate-citation-meta',
    } : null;
    return {
      identity,
      metadata,
      status: 'blocked-unverified-dom',
      fullTextVerified: false,
      warnings: [{
        code: 'IOP_DOM_UNVERIFIED',
        message: 'No source-backed IOPscience article DOM has been admitted. Full-text conversion is disabled.',
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
