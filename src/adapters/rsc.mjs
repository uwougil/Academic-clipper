import { JSDOM } from 'jsdom';
import { semanticMarker } from '../normalizers/markers.mjs';

const JOURNALS = new Map([
  ['mh', 'Materials Horizons'],
  ['cp', 'Physical Chemistry Chemical Physics'],
  ['tc', 'Journal of Materials Chemistry C'],
]);
const text = (node) => String(node?.textContent || '').replace(/\s+/gu, ' ').trim();
const slug = (value) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/gu, '');
const markerParagraph = (document, marker) => {
  const p = document.createElement('p'); p.textContent = marker; return p;
};

function protectTypography(root, semantic) {
  const d = root.ownerDocument;
  const markerFor = (kind, field, value) => {
    const marker = semanticMarker(kind, String(semantic[field].length));
    semantic[field].push({ marker, ...value }); return marker;
  };
  // Preserve source square brackets as prose, before Defuddle interprets them
  // as legacy math delimiters. Citation links have already become typed markers.
  const walker = d.createTreeWalker(root, 4);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    n.textContent = n.textContent.replace(/[\[\]$]/gu, (s) => markerFor('LITERALTEXT', 'literalText', { text: s === '$' ? '\\$' : s }));
  }
  const texText = (s) => s.replace(/−/gu, '-').replace(/[{}\\]/gu, '');
  const mathTex = (n) => {
    const children = [...n.children];
    const values = children.map(mathTex);
    if (['math', 'mrow'].includes(n.localName)) return values.join('');
    if (['mi', 'mn'].includes(n.localName)) return texText(text(n));
    if (n.localName === 'mo') return texText(text(n));
    if (n.localName === 'mover' && ['⃑', '→', '¯', '̄'].includes(text(children[1]))) {
      return `${['⃑', '→'].includes(text(children[1])) ? '\\vec' : '\\overline'}{${values[0]}}`;
    }
    throw new Error('Unsupported MathML node');
  };
  for (const container of root.querySelectorAll('mjx-container')) {
    const math = container.querySelector('mjx-assistive-mml math');
    if (!math) continue;
    try { container.replaceWith(d.createTextNode(markerFor('SCIENTIFICRUN', 'scientificRuns', { tex: mathTex(math) }))); }
    catch { /* Preserve unsupported source MathML for Defuddle and validation. */ }
  }
  const texNode = (n) => {
    if (n.nodeType === 3) return texText(n.textContent);
    const inside = [...n.childNodes].map(texNode).join('');
    if (n.tagName === 'SUB') return `_{${inside}}`;
    if (n.tagName === 'SUP') return `^{${inside}}`;
    if (['B', 'STRONG'].includes(n.tagName)) return `\\mathbf{${inside}}`;
    return inside;
  };
  for (const attachment of [...root.querySelectorAll('sub,sup')]) {
    if (!root.contains(attachment) || attachment.closest('sub sub,sub sup,sup sub,sup sup')) continue;
    // Table note letters are labels, not exponents.
    if (attachment.tagName === 'SUP' && /^[a-z]$/u.test(text(attachment))
        && (attachment.closest('.table-wrap-foot') || attachment.querySelector('a[reveal-id*="fn"]'))) {
      attachment.replaceWith(d.createTextNode(`[${text(attachment)}]`)); continue;
    }
    let previous = attachment.previousSibling;
    const parent = attachment.parentNode;
    if (previous?.nodeType === 3 && !previous.textContent.trim()) previous = previous.previousSibling;
    let base = '{}';
    if (previous?.nodeType === 3) {
      const mathMatch = previous.textContent.match(/ACADEMICCLIPPERSCIENTIFICRUN\d+X$/u);
      const match = previous.textContent.match(/[\p{L}\p{N}]+$/u);
      if (mathMatch) { base = semantic.scientificRuns.find((s) => s.marker === mathMatch[0]).tex; previous.textContent = previous.textContent.slice(0, mathMatch.index); }
      else if (match && !match[0].includes('ACADEMICCLIPPER')) { base = `\\mathrm{${texText(match[0])}}`; previous.textContent = previous.textContent.slice(0, match.index); }
    } else if (previous && ['EM', 'I', 'B', 'STRONG'].includes(previous.tagName)) {
      base = texNode(previous); previous.remove();
    }
    let tex = base;
    let node = attachment;
    while (node && ['SUB', 'SUP'].includes(node.nodeName)) {
      const next = node.nextSibling;
      tex += texNode(node); node.remove(); node = next;
      if (node?.nodeType === 3 && !node.textContent.trim() && ['SUB', 'SUP'].includes(node.nextSibling?.nodeName)) {
        const after = node.nextSibling; node.remove(); node = after;
      }
    }
    // Insert at the original position even when the base text was emptied.
    const replacement = d.createTextNode(markerFor('SCIENTIFICRUN', 'scientificRuns', { tex }));
    if (node) node.before(replacement); else parent.append(replacement);
  }
  // Adjacent source attachments form one math run, preventing accidental $$ at
  // the join between chemical groups. Only typed DOM-derived markers combine.
  for (const empty of root.querySelectorAll('.mathFormula:empty')) empty.remove();
  root.normalize();
  const combined = d.createTreeWalker(root, 4);
  for (let n = combined.nextNode(); n; n = combined.nextNode()) {
    n.textContent = n.textContent.replace(/(?:ACADEMICCLIPPERSCIENTIFICRUN\d+X){2,}/gu, (run) => {
      const tex = run.match(/ACADEMICCLIPPERSCIENTIFICRUN\d+X/gu).map((m) => semantic.scientificRuns.find((s) => s.marker === m).tex).join('');
      return markerFor('SCIENTIFICRUN', 'scientificRuns', { tex });
    });
  }
}

// Only the three evidenced Silverchair journal paths, not a general RSC router.
export function isExperimentalRscUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && u.hostname === 'pubs.rsc.org' && !u.port
      && !u.username && !u.password
      && /^\/(mh|cp|tc)\/article\/(?:doi\/10\.1039\/[^/]+\/\d+|\d+\/\d+\/\d+\/\d+)\/[^/]+\/?$/u.test(u.pathname);
  } catch { return false; }
}

export function parseRscPage(html, url, { citationStyle = 'markdown' } = {}) {
  if (!isExperimentalRscUrl(url)) throw new Error('Unsupported experimental RSC full-text URL.');
  const dom = new JSDOM(html, { url });
  const document = dom.window.document;
  const meta = (name) => document.querySelector(`meta[name="citation_${name}"]`)?.content.trim() || '';
  const journal = JOURNALS.get(new URL(url).pathname.split('/')[1]);
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (canonical && new URL(canonical, url).pathname !== new URL(url).pathname) {
    dom.window.close(); throw new Error('RSC canonical article identity does not match the supplied URL.');
  }
  const root = document.querySelector('.article-body .widget-ArticleFulltext');
  if (!root?.querySelector('.jumplink-heading[data-section-title]')
      || !root.querySelector('.article-section-wrapper') || meta('journal_title') !== journal
      || !meta('title') || !/^10\.1039\/[a-z0-9]+$/iu.test(meta('doi'))
      || document.querySelector('.unauth,#unauth')) {
    dom.window.close();
    throw new Error('RSC full article DOM/metadata unavailable; refusing abstract, paywall or challenge page.');
  }
  const metadata = {
    title: meta('title'), authors: [...document.querySelectorAll('meta[name="citation_author"]')].map((m) => m.content.trim()),
    journal, doi: meta('doi'), url, date: meta('publication_date').replaceAll('/', '-'),
    volume: meta('volume'), issue: meta('issue'), pages: [meta('firstpage'), meta('lastpage')].filter(Boolean).join('–'),
  };
  const warnings = [];
  const semantic = { displayMath: [], inlineMath: [], scientificRuns: [], literalText: [], citations: [], crossReferences: new Map() };
  const figures = [], tables = [], equations = [], references = [];
  for (const node of root.querySelectorAll('.table-modal,.reveal-modal,.fig-orig,.hidden,[hidden],input,script,style')) node.remove();
  // The published data-src contains the image, while src can remain a preloader.
  for (const image of root.querySelectorAll('img')) {
    const source = image.getAttribute('data-src') || image.getAttribute('src');
    try {
      const resolved = new URL(source, url);
      if (resolved.protocol !== 'https:') throw new Error('Non-HTTPS image');
      image.src = resolved.href;
      if (resolved.search) warnings.push('Publisher image URL is signed and may expire; assets have not been downloaded.');
      if (!image.closest('.fig,.table-wrap,.disp-formula')) warnings.push('Inline or unnumbered scientific image retained without source TeX.');
    } catch { image.replaceWith(document.createTextNode('[Image unavailable]')); warnings.push('Invalid image URL retained as an explicit fallback.'); }
  }
  for (const entry of root.querySelectorAll('.ref-list [data-content-id]')) {
    const number = Number.parseInt(text(entry.querySelector('.ref-content > .label')));
    const body = entry.querySelector('.ref-body');
    if (!body || !Number.isInteger(number)) throw new Error('Unrecognized RSC reference structure.');
    const doiUrl = body.querySelector('.crossref-doi a')?.getAttribute('href');
    const doi = doiUrl ? new URL(doiUrl, url).pathname.slice(1) : '';
    const copy = body.cloneNode(true);
    for (const links of copy.querySelectorAll('.citation-links')) links.remove();
    // RSC XML typography uses block divs for inline reference fields.
    const value = text(copy);
    if (references.some((r) => r.number === number)) throw new Error('Duplicate RSC reference number.');
    references.push({ number, anchor: `ref-${number}`, citationKey: `ref${number}`, text: value, doi, sourceId: entry.getAttribute('data-content-id') });
  }
  const referenceNumbers = new Map(references.map((r) => [r.sourceId, r.number]));
  for (const list of root.querySelectorAll('.ref-list')) {
    const wrapper = list.closest('.article-section-wrapper');
    const heading = document.getElementById(wrapper?.id.replace(/-content$/u, ''));
    heading?.remove();
    (wrapper || list).remove();
  }
  // Target lookup is publisher-local; downstream normalizers receive only the
  // existing semantic model, never Silverchair selectors or attribute names.
  const targets = new Map();
  for (const h of root.querySelectorAll('.jumplink-heading[data-section-title]')) {
    const anchor = slug(text(h));
    const target = { type: 'section', anchor, label: text(h) };
    targets.set(h.id, target);
    semantic.crossReferences.set(h.id, target);
    h.before(markerParagraph(document, semanticMarker('SECTIONANCHOR', anchor)));
  }
  for (const f of root.querySelectorAll('.fig[data-id]')) {
    const id = f.getAttribute('data-id');
    if (targets.has(id)) { f.remove(); continue; }
    const caption = f.querySelector('.fig-caption');
    const image = f.querySelector('.graphic-wrap img');
    const label = text(f.querySelector('.fig-label')) || (id === 'ga' ? 'Visual abstract' : id);
    const target = { type: 'figure', anchor: `rsc-${id}`, label };
    targets.set(id, target); semantic.crossReferences.set(id, target);
    figures.push({ ...target, imageUrl: image?.src || '', alt: label, caption: text(caption), captionHtml: caption?.innerHTML || '', source: 'inline figure', node: f });
  }
  for (const t of root.querySelectorAll('.table-wrap')) {
    const title = t.querySelector('.table-wrap-title');
    if (!title?.id || targets.has(title.id)) throw new Error('Unrecognized or duplicate RSC table.');
    const target = { type: 'table', anchor: `rsc-${title.id}`, label: text(title.querySelector('.label')) };
    targets.set(title.id, target); semantic.crossReferences.set(title.id, target);
    tables.push({ ...target, caption: text(t.querySelector('.caption')), captionHtml: t.querySelector('.caption')?.innerHTML || '',
      parts: [...t.querySelectorAll('.table-overflow > table')], notes: [...t.querySelectorAll('.table-wrap-foot')], node: t });
  }
  for (const e of root.querySelectorAll('.disp-formula[id]')) {
    const id = e.id.replace(/^jumplink-/u, '');
    const target = { type: 'equation', anchor: `rsc-${id}`, label: `Equation ${id.replace(/^eqn/u, '')}` };
    targets.set(id, target);
    // HTML/image equations have no authoritative TeX in this observed family.
    // links mode can use a normal anchor; Quarto equation identifiers require
    // display TeX, so its equation links explicitly degrade to labels.
    if (citationStyle !== 'quarto') semantic.crossReferences.set(id, target);
    equations.push({ ...target, imageOnly: !!e.querySelector('img'), text: text(e) });
    if (e.querySelector('img')) warnings.push(`${target.label}: image-only source; retained image without inventing TeX.`);
    else warnings.push(`${target.label}: retained source HTML typography; no source TeX available.`);
    if (citationStyle !== 'quarto') e.before(markerParagraph(document, semanticMarker('EQUATIONANCHOR', target.anchor)));
  }
  for (const a of [...root.querySelectorAll('a')]) {
    if (a.classList.contains('xref-bibr')) {
      const ids = (a.getAttribute('data-modal-source-id') || '').trim().split(/\s+/u);
      const numbers = ids.map((id) => referenceNumbers.get(id));
      if (numbers.some((n) => n === undefined)) throw new Error(`Unresolved RSC citation: ${ids.join(' ')}`);
      const marker = semanticMarker('CITATION', String(semantic.citations.length));
      semantic.citations.push({ marker, numbers });
      const parent = a.parentElement;
      const replace = parent.tagName === 'SUP' && text(parent) === text(a) ? parent : a;
      replace.replaceWith(document.createTextNode(marker));
    } else if (a.hasAttribute('reveal-id') || a.getAttribute('href')?.startsWith('#')) {
      const id = a.getAttribute('reveal-id') || a.getAttribute('href').slice(1);
      const target = targets.get(id);
      if (target && !(citationStyle === 'quarto' && target.type === 'equation')) a.setAttribute('href', `#${target.anchor}`);
      else { a.replaceWith(document.createTextNode(text(a))); warnings.push(`Unresolved or unsupported internal target ${id}: retained label.`); }
    } else if ((a.getAttribute('href') || '').startsWith('javascript:') || !a.hasAttribute('href')) {
      a.replaceWith(...a.childNodes);
    } else {
      const destination = new URL(a.getAttribute('href'), url);
      if (['https:', 'http:', 'mailto:'].includes(destination.protocol)) a.href = destination.href;
      else a.replaceWith(...a.childNodes);
    }
  }
  protectTypography(root, semantic);
  // Extract after transforming citation/crossref links in all academic contexts.
  for (const f of figures) {
    f.captionHtml = f.node.querySelector('.fig-caption')?.innerHTML || '';
    f.node.replaceWith(markerParagraph(document, semanticMarker('FIGURE', f.anchor))); delete f.node;
  }
  for (const t of tables) {
    t.captionHtml = t.node.querySelector('.caption')?.innerHTML || '';
    t.tableParts = t.parts.map((p) => ({ tableHtml: p.outerHTML }));
    t.notesHtml = t.node.querySelector('.table-wrap-foot')?.innerHTML || '';
    if (!t.tableParts.length) warnings.push(`${t.label}: HTML cells unavailable.`);
    t.node.remove(); delete t.node; delete t.parts; delete t.notes;
  }
  // Defuddle sees only this prepared scholarly article; page chrome is excluded.
  const article = document.createElement('article'); article.innerHTML = root.innerHTML;
  for (const formula of article.querySelectorAll('.formula-wrap')) {
    const p = document.createElement('p'); p.append(...formula.childNodes); formula.replaceWith(p);
  }
  // Presentation wrappers have no scholarly semantics. Flatten them to keep
  // conversion independent of Silverchair layout and its inline block divs.
  for (const wrapper of [...article.querySelectorAll('div,section,span')].reverse()) wrapper.replaceWith(...wrapper.childNodes);
  for (const element of article.querySelectorAll('*')) for (const attr of [...element.attributes]) {
    if (!['href', 'src', 'alt'].includes(attr.name)) element.removeAttribute(attr.name);
  }
  document.body.replaceChildren(article);
  return { dom, document, metadata, figures, tables, equations, references, semantic, cleanedHtml: article.outerHTML,
    debug: { articleRoot: '.article-body .widget-ArticleFulltext', warnings: [...new Set(warnings)] } };
}
