import { JSDOM } from 'jsdom';
// Initialize Defuddle outside an article window: Turndown captures its DOMParser
// at module load, and an article-owned parser becomes unusable after close().
import 'defuddle/full';
import { withDomGlobals } from '../dom-runtime.mjs';
import { defuddleToMarkdown, htmlToMarkdown } from '../markdown.mjs';
import { semanticMarker } from '../normalizers/markers.mjs';
import { normalizeFigureCaptions, normalizeTableContents } from '../normalizers/figures.mjs';
import { normalizeAcademicInline } from '../normalizers/academic-inline.mjs';
import { normalizeMath } from '../normalizers/math.mjs';
import { normalizeCitations, normalizeAnchorMarkers } from '../normalizers/citations.mjs';
import { renderClipMarkdown, referencesMarkdown } from '../clip.mjs';
import { outputPolicy } from '../renderers/output-policy.mjs';
import { validateMathDelimiters } from '../validators/math-delimiters.mjs';
import { validateMarkdownStructure } from '../validators/markdown-structure.mjs';
import { validateRawHtml } from '../validators/html-audit.mjs';
import { validateCrossReferences } from '../validators/cross-references.mjs';

const text = node => String(node?.textContent || '').replace(/\s+/gu, ' ').trim();
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';

// Experimental DOM-only entry point. Production URL routing remains Nature-only.
export function aaasArticleIdentity(value) {
  try {
    const url = new URL(value);
    const match = url.pathname.match(/^\/doi\/(?:full\/|abs\/)?(10\.1126\/(science|sciadv)\.[a-z0-9]+)$/i);
    if (url.protocol !== 'https:' || url.hostname !== 'www.science.org' || url.port || url.username || url.password || !match) return null;
    return { doi: match[1].toLowerCase(), articleId: match[1].replace('/', '-').toLowerCase(), journal: match[2].toLowerCase() === 'science' ? 'Science' : 'Science Advances' };
  } catch { return null; }
}

function metadataFor(document, url, identity) {
  const values = name => [...document.querySelectorAll('meta[name]')]
    .filter(n => n.getAttribute('name').toLowerCase() === name.toLowerCase()).map(n => n.content.trim()).filter(Boolean);
  const meta = (...names) => names.map(n => values(n)[0]).find(Boolean) || '';
  let ld = {};
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent);
      const candidates = Array.isArray(data) ? data : data['@graph'] || [data];
      const found = candidates.find(n => ['Article', 'ScholarlyArticle'].includes(n['@type']));
      if (found) { ld = found; break; }
    } catch { /* Malformed structured metadata does not establish identity. */ }
  }
  const doi = values('citation_doi')[0] || values('dc.Identifier').find(n => /^10\.1126\//i.test(n)) || '';
  if (doi.toLowerCase() !== identity.doi) throw new Error('AAAS article DOI metadata does not match the requested article.');
  const canonical = document.querySelector('link[rel="canonical"]')?.href || ld.mainEntityOfPage;
  if (canonical && aaasArticleIdentity(canonical)?.doi !== identity.doi) throw new Error('AAAS canonical article identity mismatch.');
  const journal = meta('citation_journal_title');
  if (journal !== identity.journal) throw new Error('AAAS journal metadata does not match the requested journal.');
  const contributors = [...document.querySelectorAll('#tab-contributors .core-authors > [property="author"]')];
  const nameFor = n => [text(n.querySelector('[property="givenName"]')), text(n.querySelector('[property="familyName"]'))].filter(Boolean).join(' ');
  const date = meta('citation_online_date', 'citation_publication_date') || ld.datePublished || meta('dc.Date');
  const contact = document.querySelector('#tab-contributors .core-authors-notes a[href^="mailto:"]');
  return {
    title: meta('citation_title', 'dc.Title') || ld.headline || text(document.querySelector('h1')),
    authors: values('citation_author').length ? values('citation_author') : values('dc.Creator').length ? values('dc.Creator') : (Array.isArray(ld.author) ? ld.author : [ld.author]).map(n => n?.name).filter(Boolean),
    journal, doi, url, date: date.slice(0, 10).replaceAll('/', '-'),
    dates: { structuredPublished: ld.datePublished || '', visiblePublished: text(document.querySelector('[property="datePublished"]')), dcDate: meta('dc.Date') },
    volume: meta('citation_volume'), issue: meta('citation_issue'), pages: '',
    metadataSource: 'AAAS dc.* / citation_* with Article JSON-LD fallback',
    authorInformation: {
      notes: contributors.flatMap(n => [...n.querySelectorAll('.author-notes [role="paragraph"]')].map(text)),
      affiliations: contributors.flatMap(n => [...n.querySelectorAll('[property="affiliation"]')].map(a => ({ authors: nameFor(n), address: text(a) }))),
      contributions: '', correspondence: contact ? { text: text(contact.closest('[role="paragraph"]')), email: contact.getAttribute('href') } : null,
    },
  };
}

function parseReferences(document) {
  return [...document.querySelectorAll('#bibliography .biblioentry')].map(entry => {
    const number = Number(text(entry.querySelector(':scope > .label')));
    const citation = entry.querySelector('.citation-content');
    const doiLink = entry.querySelector('a[href^="https://doi.org/"]');
    return { number, anchor: `ref-${number}`, citationKey: `AAASRef${number}`, text: text(citation), doi: doiLink?.href.replace('https://doi.org/', '') || '' };
  }).filter(n => n.text);
}

function protectCitations(root, semantic, referenceNumbers, warnings) {
  // AAAS ranges are often two anchors separated by a text dash. Expand only
  // adjacent bibliographic anchors; a scientific minus sign is never a range.
  for (const anchor of [...root.querySelectorAll('a[role="doc-biblioref"]')]) {
    if (!root.contains(anchor)) continue;
    const number = Number(anchor.getAttribute('data-xml-rid')?.match(/^R(\d+)$/)?.[1]);
    const separator = anchor.nextSibling;
    const end = separator?.nodeType === 3 && /^\s*[–—-]\s*$/u.test(separator.textContent) ? separator.nextSibling : null;
    const last = end?.matches?.('a[role="doc-biblioref"]') ? Number(end.getAttribute('data-xml-rid')?.match(/^R(\d+)$/)?.[1]) : number;
    if (!number || !last || last < number || last - number > 200) throw new Error('Unsupported AAAS citation cluster; refusing partial conversion.');
    const numbers = Array.from({ length: last - number + 1 }, (_, i) => number + i);
    if (numbers.some(n => !referenceNumbers.has(n))) {
      if (anchor.closest('#supplementary-materials')) {
        // The genome article's supplementary summary names its own R62–R128
        // list; the main bibliography ends at R106. Do not invent definitions.
        anchor.replaceWith(root.ownerDocument.createTextNode(text(anchor)));
        if (end) { end.replaceWith(root.ownerDocument.createTextNode(text(end))); }
        const warning = 'Supplementary citation range is outside the main bibliography; retained its labels without inventing reference definitions.';
        if (!warnings.includes(warning)) warnings.push(warning);
        continue;
      }
      throw new Error('AAAS citation references are missing; page may be partial or not fully loaded.');
    }
    const marker = semanticMarker('CITATION', semantic.citations.length);
    semantic.citations.push({ marker, numbers });
    anchor.replaceWith(root.ownerDocument.createTextNode(marker));
    if (end) { separator.remove(); end.remove(); }
  }
}

async function protectMath(root, semantic, warnings, audit) {
  // Use actual assistive MathML once, not the duplicated visual MathJax tree.
  for (const element of [...root.querySelectorAll('mjx-container, math')].filter(n => !n.parentElement.closest('mjx-container, math'))) {
    const math = element.matches('math') ? element : element.querySelector('math');
    if (!math) throw new Error('AAAS rendered math has no retained MathML source.');
    const display = Boolean(element.closest('.display-formula')) || math.getAttribute('display') === 'block';
    const annotation = math.querySelector('annotation[encoding="application/x-tex"],annotation[encoding="application/x-latex"]');
    const rawTex = annotation?.textContent.trim();
    // AAAS's placeholder alttext is not TeX. Defuddle converts the source MathML.
    const clone = math.cloneNode(true);
    clone.removeAttribute('alttext');
    for (const n of clone.querySelectorAll('annotation')) if (!n.textContent.trim()) n.remove();
    const converted = rawTex ? '' : (await htmlToMarkdown(clone.outerHTML, root.ownerDocument.URL)).trim();
    const tex = rawTex || converted.replace(/^\$\$?\s*|\s*\$\$?$/g, '').trim();
    if (!tex || /No alternative text|<\/?(?:math|mrow|mjx)|ACADEMICCLIPPER/i.test(tex)) throw new Error('AAAS math could not be converted reliably.');
    const values = display ? semantic.displayMath : semantic.inlineMath;
    const marker = semanticMarker(display ? 'DISPLAYMATH' : 'INLINEMATH', values.length);
    values.push({ marker, tex });
    audit.push({ display, source: rawTex ? 'source TeX annotation' : 'source MathML converted by Defuddle', tex });
    element.replaceWith(root.ownerDocument.createTextNode(marker));
  }
  if (audit.some(n => n.source.startsWith('source MathML'))) warnings.push('AAAS equations converted from source MathML; original TeX was not available.');
}

function protectScientificAttachments(root, semantic) {
  for (const attachment of [...root.querySelectorAll('sub,sup')]) {
    if (!root.contains(attachment) || attachment.closest('math')) continue;
    const previous = attachment.previousSibling;
    let base = '';
    if (previous?.nodeType === 3) {
      const match = previous.textContent.match(/([\p{L}\p{N}]+)\s*$/u);
      if (match) { base = match[1]; previous.textContent = previous.textContent.slice(0, match.index); }
    } else if (previous?.matches?.('i,b,em,strong')) {
      base = text(previous); previous.remove();
    }
    if (!base) continue;
    let tex = base;
    let node = attachment;
    const consumed = [];
    while (node?.matches?.('sub,sup')) {
      tex += `${node.tagName === 'SUB' ? '_' : '^'}{${text(node)}}`;
      consumed.push(node); node = node.nextSibling;
    }
    const marker = semanticMarker('SCIENTIFICRUN', semantic.scientificRuns.length);
    semantic.scientificRuns.push({ marker, tex });
    attachment.before(root.ownerDocument.createTextNode(marker));
    for (const n of consumed) n.remove();
  }
}

function protectLiteralBrackets(root, semantic) {
  const walker = root.ownerDocument.createTreeWalker(root, 4);
  const nodes = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
  for (const n of nodes) n.textContent = n.textContent.replace(/[\[\]]/g, bracket => {
    const marker = semanticMarker('LITERALTEXT', semantic.literalText.length);
    semantic.literalText.push({ marker, text: bracket }); return marker;
  });
}

export async function parseAaasPage(html, url) {
  const identity = aaasArticleIdentity(url);
  if (!identity) throw new Error('Experimental AAAS supports only Science / Science Advances HTTPS article URLs.');
  const dom = new JSDOM(html, { url });
  try {
    const document = dom.window.document;
    const sourceBody = document.querySelector('#bodymatter[data-extent="bodymatter"]');
    // A real subscription preview has the normal article root but no body.
    if (!sourceBody || sourceBody.querySelector('.denial-block') || document.querySelector('.meta-panel__access--other')) {
      throw new Error('AAAS full article is unavailable (access wall, preview, challenge, or unloaded body).');
    }
    if (!sourceBody.querySelector('[role="paragraph"],p')) throw new Error('AAAS article has no substantive body paragraphs.');
    const metadata = metadataFor(document, url, identity);
    const references = parseReferences(document);
    if (!references.length || references.some((n, i) => n.number !== i + 1)) throw new Error('AAAS complete sequential reference list was not found; page may be partial.');
    const warnings = [];
    const mathAudit = [];
    const semantic = { displayMath: [], inlineMath: [], scientificRuns: [], literalText: [], citations: [], crossReferences: new Map() };
    const article = document.createElement('article');
    for (const source of [document.querySelector('#abstracts'), sourceBody, document.querySelector('#supplementary-materials')].filter(Boolean)) article.append(source.cloneNode(true));
    for (const button of article.querySelectorAll('[role="paragraph"] button[data-target^="core-fv-"]')) {
      const anchor = document.createElement('a');
      anchor.setAttribute('href', `#${button.getAttribute('data-target').replace(/^core-fv-/, '')}`);
      anchor.textContent = (button.getAttribute('aria-label') || '').replace(/^OPEN\s+|\s+IN VIEWER$/g, '');
      button.replaceWith(anchor);
    }
    for (const n of article.querySelectorAll('script,style,button,nav,aside,form,.newsletter,.inline-newsletter,[class*="newsletter"],.alert-signup__dropzone,.external-links,.figure-pop-btn')) n.remove();
    const figures = [...article.querySelectorAll('figure.graphic')].map((n, i) => ({
      id: n.id, anchor: `figure-${i + 1}`, label: `Figure ${n.id.match(/\d+/)?.[0] || i + 1}`, alt: `Figure ${n.id.match(/\d+/)?.[0] || i + 1}`,
      imageUrl: n.querySelector('img')?.getAttribute('src') ? new URL(n.querySelector('img').getAttribute('src'), url).href : '',
      caption: text(n.querySelector('figcaption')), captionHtml: n.querySelector('figcaption')?.innerHTML || '', source: 'inline figure',
    }));
    const tables = [...article.querySelectorAll('figure.table')].map((n, i) => ({
      id: n.id, anchor: `table-${i + 1}`, label: `Table ${n.id.match(/\d+/)?.[0] || i + 1}`, caption: text(n.querySelector('figcaption')),
      tableHtml: n.querySelector('table')?.outerHTML || '', url: `${url}#${n.id}`,
      tableContentStatus: n.querySelector('table') ? 'captured-inline' : 'fallback-no-html',
      tableContentWarning: n.querySelector('table') ? '' : 'AAAS table cells were not exposed; retained article link.',
    }));
    for (const [type, items] of [['figure', figures], ['table', tables]]) for (const n of items) semantic.crossReferences.set(n.id, { type, anchor: n.anchor, label: n.label });
    const headingSlugs = new Set();
    for (const heading of article.querySelectorAll('h2,h3,h4,h5,h6')) {
      const section = heading.parentElement;
      const base = slug(text(heading)); let anchor = base; let suffix = 1;
      while (headingSlugs.has(anchor)) anchor = `${base}-${++suffix}`;
      headingSlugs.add(anchor);
      const target = { type: 'section', anchor, label: text(heading) };
      if (!heading.id && !section.id) heading.id = `aaas-${anchor}`;
      for (const id of [heading.id, section.id].filter(Boolean)) semantic.crossReferences.set(id, target);
      const p = document.createElement('p'); p.textContent = semanticMarker('SECTIONANCHOR', anchor); heading.before(p);
    }
    for (const [i, equation] of [...article.querySelectorAll('.display-formula')].entries()) {
      const anchor = `equation-${i + 1}`;
      semantic.crossReferences.set(equation.id, { type: 'equation', anchor, label: `Equation ${i + 1}` });
      const p = document.createElement('p'); p.textContent = semanticMarker('EQUATIONANCHOR', anchor); equation.before(p);
      equation.querySelector(':scope > .label')?.remove();
    }
    // Viewer crossrefs may be buttons after browser enhancement. Source data-rid
    // links remain supported; viewer controls around figures are excluded above.
    for (const n of [...article.querySelectorAll('a[href], [data-target^="core-fv-"]')]) {
      if (n.matches('img')) continue;
      let fragment = n.getAttribute('data-target')?.replace(/^core-fv-/, '') || '';
      if (!fragment && n.hasAttribute('href')) {
        const resolved = new URL(n.getAttribute('href'), url);
        if (resolved.origin === new URL(url).origin && aaasArticleIdentity(resolved.href)?.doi === identity.doi) fragment = resolved.hash.slice(1).replace(/^core-collateral-/, '');
      }
      const target = semantic.crossReferences.get(fragment);
      if (target) n.setAttribute('href', `#${target.anchor}`);
      else if (n.hasAttribute('href') && !n.getAttribute('href').startsWith('#')) n.setAttribute('href', new URL(n.getAttribute('href'), url).href);
    }
    protectCitations(article, semantic, new Set(references.map(n => n.number)), warnings);
    await withDomGlobals(dom, async () => {
      await protectMath(article, semantic, warnings, mathAudit);
      protectScientificAttachments(article, semantic);
      protectLiteralBrackets(article, semantic);
      for (const table of tables) {
        const node = [...article.querySelectorAll('figure.table')].find(n => n.id === table.id);
        table.tableHtml = node.querySelector('table')?.outerHTML || '';
      }
      for (const figure of figures) {
        const node = [...article.querySelectorAll('figure.graphic')].find(n => n.id === figure.id);
        figure.captionHtml = node.querySelector('figcaption')?.innerHTML || '';
        const p = document.createElement('p'); p.textContent = semanticMarker('FIGURE', figure.anchor); node.replaceWith(p);
        if (!figure.imageUrl) warnings.push(`AAAS ${figure.label} has no image URL.`);
      }
      for (const table of article.querySelectorAll('figure.table')) table.remove();
    });
    // Preserve AAAS paragraphs even when they are div[role=paragraph].
    for (const n of [...article.querySelectorAll('div[role="paragraph"],div[role="doc-footnote"]')]) {
      const p = document.createElement('p'); p.append(...n.childNodes); n.replaceWith(p);
    }
    document.body.replaceChildren(article);
    for (const n of document.querySelectorAll('script')) n.remove();
    return { dom, document, articleId: identity.articleId, metadata, references, figures, tables, semantic, cleanedHtml: document.documentElement.outerHTML,
      debug: { publisher: 'AAAS (experimental)', articleRoot: '#bodymatter', warnings, mathAudit, access: 'body-present; completeness not guaranteed', metadataSource: metadata.metadataSource } };
  } catch (error) {
    dom.window.close();
    throw error;
  }
}

export async function clipAaas({ html, url, citationStyle = 'markdown' }) {
  if (!['markdown', 'links', 'quarto'].includes(citationStyle)) throw new Error('citationStyle must be markdown, links, or quarto.');
  const page = await parseAaasPage(html, url);
  try {
    const policy = outputPolicy(citationStyle);
    const converted = await withDomGlobals(page.dom, async () => {
      await normalizeFigureCaptions(page.figures, url);
      // Caption math markers share the article semantics.
      for (const figure of page.figures) figure.captionMarkdown = normalizeAnchorMarkers(normalizeCitations(normalizeAcademicInline(normalizeMath(figure.captionMarkdown, page.semantic)), page.semantic.citations, { policy, references: page.references }), page.semantic.crossReferences.values(), { policy });
      await normalizeTableContents(page.tables, url);
      for (const table of page.tables) table.markdown = normalizeCitations(normalizeMath(table.markdown, page.semantic), page.semantic.citations, { policy, references: page.references });
      const supplementary = page.document.querySelector('#supplementary-materials');
      const supplementaryMarkdown = supplementary ? await htmlToMarkdown(supplementary.outerHTML, url) : '';
      supplementary?.remove();
      const body = await defuddleToMarkdown(page.document, url);
      return { ...body, markdown: [body.markdown, supplementaryMarkdown].filter(Boolean).join('\n\n'), referencesMarkdown: await referencesMarkdown(page.references, url, policy) };
    });
    const { articleId, metadata, references, figures, tables, semantic, cleanedHtml } = page;
    const result = { articleId, metadata, references, figures, tables, semantic, cleanedHtml, rawHtml: html, citationStyle, outputPolicy: policy, bodyMarkdown: converted.markdown, referencesMarkdown: converted.referencesMarkdown };
    result.markdown = renderClipMarkdown(result);
    const validators = {
      mathValidation: validateMathDelimiters(result.markdown),
      markdownStructure: validateMarkdownStructure(result.markdown, { dialect: policy.dialect, citationStyle }),
      rawHtmlValidation: validateRawHtml(result.markdown, { allowHtmlAnchors: policy.allowHtmlAnchors }),
      crossReferenceValidation: validateCrossReferences(result.markdown, { dialect: policy.dialect, citationStyle }),
    };
    result.debug = { ...page.debug, ...validators };
    if (Object.values(validators).some(n => !n.valid)) throw new Error(`AAAS output validation failed: ${JSON.stringify(validators)}`);
    return result;
  } finally {
    page.dom.window.close();
  }
}
