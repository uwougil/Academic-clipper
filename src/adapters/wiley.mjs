import { JSDOM } from 'jsdom';
import { semanticMarker } from '../normalizers/markers.mjs';

const HOSTS = new Set(['onlinelibrary.wiley.com', 'advanced.onlinelibrary.wiley.com']);
const JOURNALS = new Set(['Advanced Functional Materials', 'Advanced Science', 'Small', 'Advanced Electronic Materials']);
const text = (value) => String(value ?? '').replace(/\s+/gu, ' ').trim();
const slug = (value) => text(value).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/gu, '-');

export function wileyDoiFromUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !HOSTS.has(url.hostname) || url.username || url.password || url.port) return '';
    return decodeURIComponent(url.pathname).match(/^\/doi\/(?:full\/|abs\/)?(10\.1002\/(?:adfm|advs|smll|aelm)\.[a-z0-9]+)\/?$/iu)?.[1] || '';
  } catch { return ''; }
}

// Parsing only: never fetch missing content, overlays, or authenticated resources.
export function parseWileyPage(html, url) {
  const expectedDoi = wileyDoiFromUrl(url);
  if (!expectedDoi) throw new Error('Unsupported experimental Wiley article URL.');
  const dom = new JSDOM(html, { url });
  const { document } = dom.window;
  const values = (name) => Array.from(document.querySelectorAll(`meta[name="${name}"]`)).map(n => text(n.content)).filter(Boolean);
  const meta = (name) => values(name)[0] || '';
  const doi = meta('citation_doi').replace(/^https?:\/\/doi\.org\//iu, '').replace(/^doi:/iu, '');
  if (doi.toLowerCase() !== expectedDoi.toLowerCase()) throw new Error('Wiley citation DOI does not match the requested article.');
  const journal = meta('citation_journal_title');
  if (!JOURNALS.has(journal)) throw new Error('Journal is outside the experimental Wiley scope.');
  const original = document.querySelector('.article__body');
  if (!original) throw new Error('Wiley article root .article__body was not found (challenge or non-article page).');
  const full = original.querySelector('.article-section__full');
  const access = full?.querySelector('p') ? 'full-content-present' : 'preview';
  const warnings = [];
  if (access === 'preview') warnings.push('Wiley preview only: full article content is absent; this is not a complete capture.');
  const affiliations = [];
  let currentAuthor = '';
  for (const node of document.querySelectorAll('meta[name="citation_author"],meta[name="citation_author_institution"]')) {
    if (node.name === 'citation_author') currentAuthor = text(node.content);
    else if (text(node.content)) affiliations.push({ authors: currentAuthor, address: text(node.content) });
  }
  const metadata = {
    title: meta('citation_title') || text(document.querySelector('h1')?.textContent),
    authors: values('citation_author'), journal, doi, url: new URL(url).href.split('#')[0],
    date: (meta('citation_online_date') || meta('citation_publication_date')).replaceAll('/', '-'),
    dates: { online: meta('citation_online_date'), publication: meta('citation_publication_date') },
    volume: meta('citation_volume'), issue: meta('citation_issue'), pages: meta('citation_firstpage'),
    metadataSource: 'Wiley citation_* meta tags',
    authorInformation: { notes: [], affiliations, contributions: '', correspondence: null },
  };
  const body = original.cloneNode(true);
  const semantic = { displayMath: [], inlineMath: [], scientificRuns: [], literalText: [], citations: [], crossReferences: new Map() };
  const figures = [], tables = [], references = [], supplementaryLinks = [];
  const absolute = (value) => {
    try {
      const resolved = new URL(value, url);
      return ['https:', 'http:'].includes(resolved.protocol) ? resolved.href : '';
    } catch { return ''; }
  };
  const markerParagraph = (kind, value) => {
    const node = document.createElement('p');
    node.textContent = semanticMarker(kind, value);
    return node;
  };
  const targets = semantic.crossReferences;
  const addTarget = (id, target) => { if (id) targets.set(id, target); };

  // Freeze DOM-attached units, chemicals and styled symbols as complete runs.
  // Citation superscripts and bibliography markup are handled separately.
  const texText = value => text(value).replace(/([{}%&#_$])/gu, '\\$1');
  const texNode = node => node.nodeType === 3 ? `\\mathrm{${texText(node.textContent)}}`
    : node.tagName === 'SUB' ? `_{${Array.from(node.childNodes).map(texNode).join('')}}`
    : node.tagName === 'SUP' ? `^{${Array.from(node.childNodes).map(texNode).join('')}}`
    : ['I', 'EM'].includes(node.tagName) ? `\\mathit{${texText(node.textContent)}}`
    : ['B', 'STRONG'].includes(node.tagName) ? `\\mathbf{${texText(node.textContent)}}`
    : texText(node.textContent);
  for (const attachment of Array.from(body.querySelectorAll('sub,sup'))) {
    if (!body.contains(attachment) || attachment.closest('.article-section__references,.inline-equation')
      || attachment.querySelector('a') || /^[\[\],]$/u.test(text(attachment.textContent))) continue;
    const previous = attachment.previousSibling;
    const range = document.createRange();
    if (previous?.nodeType === 3) {
      const match = previous.textContent.match(/[\p{L}\p{N}]+$/u);
      if (!match) continue;
      range.setStart(previous, match.index);
    } else if (previous && ['I','EM','B','STRONG'].includes(previous.tagName)) range.setStartBefore(previous);
    else continue;
    let end = attachment;
    while (end.nextSibling) {
      const next = end.nextSibling;
      if (['SUB','SUP'].includes(next.tagName) && !next.querySelector('a')) end = next;
      else if ((next.nodeType === 3 && /^[\p{L}\p{N}]+$/u.test(next.textContent) || ['I','EM','B','STRONG'].includes(next.tagName))
        && ['SUB','SUP'].includes(next.nextSibling?.tagName)) end = next;
      else break;
    }
    range.setEndAfter(end);
    const fragment = range.extractContents();
    const marker = semanticMarker('SCIENTIFICRUN', semantic.scientificRuns.length);
    semantic.scientificRuns.push({ marker, tex: Array.from(fragment.childNodes).map(texNode).join(''), provenance: 'Wiley DOM-attached scientific formatting' });
    range.insertNode(document.createTextNode(marker));
  }
  // Bracketed unit labels in Wiley table headers are prose, not TeX delimiters.
  for (const cell of body.querySelectorAll('td,th')) {
    const walker = document.createTreeWalker(cell, 4);
    const nodes = []; for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node);
    for (const node of nodes) node.textContent = node.textContent.replace(/[\[\]]/gu, value => {
      const marker = semanticMarker('LITERALTEXT', semantic.literalText.length);
      semantic.literalText.push({ marker, text: value }); return marker;
    });
  }

  // Only the actual bibliography, never Citing Literature or related articles.
  for (const item of body.querySelectorAll('.article-section__references li[data-bib-id]')) {
    const number = Number(text(item.querySelector('.bullet')?.textContent) || item.getAttribute('data-bib-id')?.match(/bib-0*(\d+)$/u)?.[1]);
    if (!Number.isSafeInteger(number) || number < 1 || references.some(r => r.number === number)) continue;
    const clone = item.cloneNode(true);
    const referenceDoi = text(clone.querySelector('.data-doi')?.textContent);
    clone.querySelectorAll('.bullet,.extra-links').forEach(n => n.remove());
    references.push({ number, anchor: `ref-${number}`, citationKey: `wileyRef${number}`, text: text(clone.textContent), doi: referenceDoi });
  }
  if (body.querySelector('.article-section__references') && !references.length) warnings.push('Wiley references are not expanded in the supplied DOM.');
  for (const node of body.querySelectorAll('.article-section__citedBy,.article-section__references,script,style,iframe,.figure-extra,.article-tools,.advertisement')) node.remove();
  for (const anchor of body.querySelectorAll('.article-section__supporting a[href]')) {
    const href = absolute(anchor.getAttribute('href'));
    if (href) supplementaryLinks.push({ label: text(anchor.textContent), url: href });
  }
  // The accordion controls are navigation, but their semantic headings must survive.
  for (const section of body.querySelectorAll('.article-section__supporting')) {
    const heading = section.querySelector('h2');
    if (heading) heading.textContent = 'Supporting Information';
  }
  for (const [index, figure] of Array.from(body.querySelectorAll('figure.figure')).entries()) {
    const label = text(figure.querySelector('.figure__title')?.textContent) || `Figure ${index + 1}`;
    const anchor = `figure-${index + 1}`;
    const image = figure.querySelector('img');
    const imageUrl = absolute(image?.getAttribute('data-lg-src') || image?.getAttribute('src') || '');
    const captionNode = figure.querySelector('.figure__caption-text');
    if (!imageUrl) {
      warnings.push(`${label}: image URL absent; retained caption and source link.`);
      const p = document.createElement('p');
      const a = document.createElement('a'); a.href = `${metadata.url}#${figure.id}`; a.textContent = label;
      p.append(a, document.createTextNode(`. ${text(captionNode?.textContent)}`)); figure.replaceWith(p); continue;
    }
    figures.push({ label, anchor, source: 'inline figure', imageUrl, alt: label,
      caption: text(captionNode?.textContent), captionHtml: captionNode?.innerHTML || '', url: `${metadata.url}#${figure.id}` });
    addTarget(figure.id, { type: 'figure', label, anchor });
    figure.replaceWith(markerParagraph('FIGURE', anchor));
  }
  for (const [index, wrapper] of Array.from(body.querySelectorAll('.article-table-content[id]')).entries()) {
    const caption = text(wrapper.querySelector('.article-table-caption')?.textContent);
    const label = caption.match(/^Table\s+\d+/iu)?.[0].replace(/\s+/gu, ' ') || `Table ${index + 1}`;
    const anchor = `table-${index + 1}`;
    const tableHtml = wrapper.querySelector('table')?.outerHTML || '';
    tables.push({ label, anchor, caption, tableHtml, url: `${metadata.url}#${wrapper.id}`,
      tableContentStatus: tableHtml ? 'captured-html' : 'fallback-not-expanded',
      tableContentWarning: tableHtml ? '' : 'Wiley table cells are absent from the supplied DOM; no overlay was fetched.' });
    if (!tableHtml) warnings.push(`${label}: table cells not expanded.`);
    addTarget(wrapper.id, { type: 'table', label, anchor }); wrapper.remove();
  }
  // Freeze TeX before Defuddle. Lazy/empty MathJax must use its real image URL.
  let displayEquationCount = 0;
  for (const [index, equation] of Array.from(body.querySelectorAll('.inline-equation')).entries()) {
    const annotation = equation.querySelector('annotation[encoding="application/x-tex"],script[type^="math/tex"]');
    let tex = (annotation?.textContent || '').trim();
    tex = tex.replace(/^\$\$([\s\S]*)\$\$$/u, '$1').replace(/^\\\[([\s\S]*)\\\]$/u, '$1')
      .replace(/^\\\(([\s\S]*)\\\)$/u, '$1').replace(/^\$([^$]*)\$$/u, '$1')
      .replace(/^\\begin\{equation\*?\}([\s\S]*)\\end\{equation\*?\}$/u, '$1').trim();
    const label = text(equation.querySelector('.inline-equation__label')?.textContent);
    const display = Boolean(label || equation.querySelector('math[display="block"]'));
    const displayNumber = display ? ++displayEquationCount : null;
    const equationLabel = label.replace(/^\((.*)\)$/u, '$1').trim() || displayNumber || index + 1;
    if (tex) {
      const group = display ? semantic.displayMath : semantic.inlineMath;
      const marker = semanticMarker(display ? 'DISPLAYMATH' : 'INLINEMATH', group.length);
      group.push({ marker, tex });
      if (display) {
        const anchor = `equation-${slug(equationLabel) || displayNumber}`;
        addTarget(equation.id, { type: 'equation', label: `Equation ${equationLabel}`, anchor });
        equation.before(markerParagraph('EQUATIONANCHOR', anchor));
      }
      equation.textContent = marker;
    } else {
      const imageUrl = absolute(equation.querySelector('[data-altimg]')?.getAttribute('data-altimg') || '');
      const replacement = document.createElement(display ? 'p' : 'span');
      if (imageUrl) {
        const image = document.createElement('img'); image.src = imageUrl; image.alt = `Equation ${equationLabel} (image fallback)`; replacement.append(image);
      } else replacement.textContent = `Equation ${equationLabel} unavailable in supplied DOM.`;
      warnings.push(`Equation ${equationLabel}: no source TeX; ${imageUrl ? 'retained remote image fallback' : 'unavailable'}.`);
      equation.replaceWith(replacement);
    }
  }
  const usedSlugs = new Set();
  for (const [index, heading] of Array.from(body.querySelectorAll('h2,h3,h4,h5,h6')).entries()) {
    const base = slug(heading.textContent); let anchor = base; let suffix = 1;
    while (usedSlugs.has(anchor)) anchor = `${base}-${suffix++}`;
    usedSlugs.add(anchor);
    const target = { type: 'section', label: text(heading.textContent), anchor };
    if (!heading.id) heading.id = `wiley-heading-${index + 1}`;
    addTarget(heading.id, target); addTarget(heading.closest('section[id]')?.id, target);
    heading.before(markerParagraph('SECTIONANCHOR', anchor));
  }
  const knownReferences = new Set(references.map(r => r.number));
  // Wiley groups range endpoints inside a superscript; preserve original numbers.
  for (const sup of Array.from(body.querySelectorAll('sup')).filter(n => n.querySelector('a.bibLink'))) {
    const source = text(sup.textContent);
    const numbers = [];
    for (const part of source.split(/[,;]\s*/u)) {
      const range = part.match(/^\[?(\d+)\s*[-–−]\s*(\d+)\]?$/u);
      if (range && Number(range[2]) >= Number(range[1]) && Number(range[2]) - Number(range[1]) < 1000) {
        for (let n = Number(range[1]); n <= Number(range[2]); n++) numbers.push(n);
      } else numbers.push(...Array.from(part.matchAll(/\d+/gu), m => Number(m[0])));
    }
    const unique = [...new Set(numbers)];
    if (!unique.length || unique.some(n => !knownReferences.has(n))) {
      warnings.push(`Citation ${source}: reference definitions absent; retained public article links.`);
      const span = document.createElement('span');
      span.append(...Array.from(sup.childNodes)); sup.replaceWith(span);
      continue;
    }
    // Wiley uses separate bracket-only superscripts surrounding a span/sup.
    const container = sup.parentElement.tagName === 'SPAN' && sup.parentElement.children.length === 1 ? sup.parentElement : sup;
    if (text(container.previousElementSibling?.textContent) === '[') container.previousElementSibling.remove();
    if (text(container.nextElementSibling?.textContent) === ']') container.nextElementSibling.remove();
    const marker = semanticMarker('CITATION', semantic.citations.length);
    semantic.citations.push({ marker, numbers: unique }); container.replaceWith(document.createTextNode(marker));
  }
  for (const sup of body.querySelectorAll('sup')) {
    if (/^[\[\],]$/u.test(text(sup.textContent))) sup.replaceWith(document.createTextNode(sup.textContent));
  }
  for (const anchor of body.querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href');
    const resolved = absolute(href);
    if (!resolved) { anchor.replaceWith(document.createTextNode(anchor.textContent)); continue; }
    const linked = new URL(resolved), page = new URL(url);
    const sameArticle = linked.origin === page.origin && wileyDoiFromUrl(resolved).toLowerCase() === doi.toLowerCase();
    const target = sameArticle ? targets.get(decodeURIComponent(linked.hash.slice(1))) : null;
    anchor.setAttribute('href', target ? `#${target.anchor}` : resolved);
  }
  // Give Defuddle only the selected scholarly body; no header/account/sidebar UI.
  document.body.replaceChildren(body);
  return { dom, document, metadata, figures, tables, references, semantic, supplementaryLinks,
    cleanedHtml: document.documentElement.outerHTML,
    debug: { publisher: 'Wiley (experimental)', articleRoot: '.article__body', access,
      paragraphs: body.querySelectorAll('p').length, figures: figures.length, tables: tables.length,
      references: references.length, equations: semantic.displayMath.length, warnings } };
}
