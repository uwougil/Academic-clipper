import { JSDOM } from 'jsdom';
import { htmlToMarkdown } from '../markdown.mjs';
import { withDomGlobals } from '../dom-runtime.mjs';
import { normalizeAcademicInline } from '../normalizers/academic-inline.mjs';
import { assertValidMathDelimiters } from '../validators/math-delimiters.mjs';
import { assertValidRawHtml } from '../validators/html-audit.mjs';
import { assertValidCrossReferences } from '../validators/cross-references.mjs';
import { validateMarkdownStructure } from '../validators/markdown-structure.mjs';

// Isolated experiment: no production routing, transport or writer integration.
export function isSciOpenArticleUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && u.hostname === 'www.sciopen.com'
      && !u.username && !u.password && !u.port
      && /^\/article\/10\.\d{4,9}\/[A-Za-z0-9._()-]+$/.test(u.pathname);
  } catch { return false; }
}

const text = n => String(n?.textContent || '').replace(/\s+/gu, ' ').trim();
const slug = s => s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-');
// Defuddle caches its DOMParser constructor. Keep that inert realm alive,
// while closing per-article DOMs; use the existing serial globals boundary.
const converterDom = new JSDOM('<!doctype html><html><body></body></html>');

export function parseSciOpenPage(html, url) {
  if (!isSciOpenArticleUrl(url)) throw new Error('Unsupported SciOpen article URL.');
  // Compact inert original MathML before HTML reparsing can detach MathJax
  // block divs from their browser-rendered <p><disp-formula> ancestry.
  const compactMath = html.replace(/<(inline-formula|disp-formula)\b([^>]*)>([\s\S]*?)<\/\1>/g, (whole, tag, attrs, inner) => {
    const payload = inner.match(/<script\b[^>]*type="math\/mml"[^>]*>([\s\S]*?)<\/script>/)?.[1];
    return payload ? `<${tag}${attrs}>${inner.match(/<label>[\s\S]*?<\/label>/)?.[0] || ''}${payload}</${tag}>` : whole;
  });
  const dom = new JSDOM(compactMath, { url });
  const d = dom.window.document;
  const fail = message => { dom.window.close(); throw new Error(message); };
  const meta = name => [...d.querySelectorAll(`meta[name="citation_${name}"]`)].map(x => x.content);
  const doi = new URL(url).pathname.slice('/article/'.length);
  if (meta('doi')[0]?.toLowerCase() !== doi.toLowerCase()) fail('SciOpen DOI identity mismatch.');
  const root = d.querySelector('#v4_art_main_center');
  const body = root?.querySelector('#insert_content_one');
  if (!body?.querySelector('p') || !text(body).trim()) {
    fail('SciOpen public main text is missing: wait for rendered body; abstract/fulltext URL metadata is insufficient.');
  }
  const titleFragment = JSDOM.fragment(meta('title')[0] || '');
  const metadata = { title: text(titleFragment), authors: meta('author'), affiliations: meta('author_institution'),
    journal: meta('journal_title')[0] || '', publisher: meta('publisher')[0] || '', doi,
    onlineDate: meta('online_date')[0] || '', publicationDate: meta('publication_date')[0] || '', url };
  if (!metadata.title || !metadata.authors.length) fail('SciOpen article metadata is incomplete.');
  const warnings = [];
  const references = [...root.querySelectorAll('#article_references .v4-art-reference-item')].map(n => ({
    id: n.querySelector('.v4-art-reference-item-index')?.id?.replace(/^r_/, '') || '',
    number: Number(text(n.querySelector('.v4-art-reference-item-index')).replace(/\D/g, '')),
    html: n.querySelector('.v4-art-reference-item-title')?.innerHTML || '',
  }));
  if (references.some(r => !r.id || !r.number || !r.html)
      || new Set(references.map(r => r.id)).size !== references.length
      || new Set(references.map(r => r.number)).size !== references.length) fail('Malformed SciOpen references.');
  const refMap = new Map(references.map(r => [r.id, r]));
  const content = d.createElement('article');
  for (const selector of ['#title_-2', '#insert_content_one', '#title_-11', '#insert_content_two']) {
    const n = root.querySelector(selector); if (n) content.append(n.cloneNode(true));
  }
  // Only article semantic blocks are admitted, never sidebar/AI/account UI.
  for (const n of content.querySelectorAll('script, style, .v4-art-image, video, iframe')) n.remove();
  const sections = [];
  const targets = new Map();
  const usedSlugs = new Set();
  for (const h of [...content.querySelectorAll('h2')]) {
    const label = text(h); if (!label) { h.remove(); continue; }
    const depth = label.match(/^\d+(?:\.\d+)+\s/)?.[0].trim().split('.').length || 1;
    const level = Math.min(depth + 1, 6);
    const replacement = d.createElement(`h${level}`); replacement.innerHTML = h.innerHTML;
    const anchor = slug(label);
    // Duplicate headings cannot safely retain section links without dialect IDs.
    if (usedSlugs.has(anchor)) fail('Duplicate SciOpen heading slug.');
    usedSlugs.add(anchor);
    if (h.parentElement.id) targets.set(h.parentElement.id, anchor);
    sections.push({ title: label, level, anchor }); h.replaceWith(replacement);
  }
  const figures = [];
  for (const fig of content.querySelectorAll('fig')) {
    const caption = fig.querySelector('p');
    const captionLabel = caption?.querySelector('label');
    if (captionLabel?.nextSibling && !/^\s/.test(captionLabel.nextSibling.textContent))
      captionLabel.after(d.createTextNode(' '));
    const label = text(fig.querySelector('label')) || fig.id;
    const raw = fig.querySelector('img')?.getAttribute('src') || '';
    // Signed media URLs expire and may contain access credentials. Retain a
    // stable article link and caption; do not guess/download unsigned assets.
    figures.push({ id: fig.id, label, captionHtml: caption?.innerHTML || '', imageAvailable: !!raw });
    const link = d.createElement('a'); link.href = url; link.textContent = `${label}: view image on SciOpen`;
    const p = d.createElement('p'); p.append(link); fig.before(p);
    if (caption) fig.replaceWith(caption); else fig.remove();
    warnings.push(`Figure ${fig.id}: article-link fallback; image download is outside this experiment.`);
  }
  const tables = [...content.querySelectorAll('table')];
  if (tables.length) fail('SciOpen HTML table layout has no admitted source-backed fixture; capture refused.');
  const formulas = [];
  for (const formula of content.querySelectorAll('inline-formula, disp-formula')) {
    const math = formula.querySelector('math');
    if (!math) fail(`SciOpen formula ${formula.id} has no original MathML.`);
    const display = formula.tagName.toLowerCase() === 'disp-formula';
    const label = text(formula.querySelector('label'));
    formulas.push({ id: formula.id, display, label, mathml: math.outerHTML });
    const wrapper = d.createElement(display ? 'div' : 'span');
    wrapper.append(math.cloneNode(true));
    if (label) { const p = d.createElement('p'); p.textContent = `Equation ${label}`; wrapper.append(p); }
    formula.replaceWith(wrapper);
  }
  const citations = [];
  // SciOpen renders ranges as two endpoint xref nodes separated by a minus.
  for (const start of [...content.querySelectorAll('xref[ref-type="bibr"]')]) {
    if (!start.isConnected && !content.contains(start)) continue;
    const separator = start.nextSibling;
    const end = separator?.nextSibling;
    if (separator?.nodeType !== 3 || !/^\s*[-−–—]\s*$/u.test(separator.textContent)
        || end?.nodeName.toLowerCase() !== 'xref' || end.getAttribute('ref-type') !== 'bibr') continue;
    const a = refMap.get(start.getAttribute('rid')), b = refMap.get(end.getAttribute('rid'));
    if (!a || !b || b.number < a.number || b.number - a.number > 100) fail('Invalid SciOpen citation range.');
    const numbers = [];
    for (let i = a.number; i <= b.number; i++) {
      if (![...refMap.values()].some(r => r.number === i)) fail(`Missing SciOpen range reference ${i}.`);
      numbers.push(i);
    }
    citations.push(numbers);
    start.replaceWith(d.createTextNode(numbers.map(i => `SCIOPENCITE${i}END`).join('')));
    separator.remove(); end.remove();
  }
  for (const x of [...content.querySelectorAll('xref')]) {
    const type = x.getAttribute('ref-type');
    const rid = x.getAttribute('rid');
    if (type === 'bibr') {
      const ref = refMap.get(rid); if (!ref) fail(`Missing SciOpen reference ${rid}.`);
      citations.push([ref.number]); x.replaceWith(d.createTextNode(`SCIOPENCITE${ref.number}END`));
    } else if (type === 'sec' && targets.has(rid)) {
      const a = d.createElement('a'); a.href = `#${targets.get(rid)}`; a.textContent = text(x); x.replaceWith(a);
    } else {
      if (!['fig', 'disp-formula', 'table', 'sec'].includes(type)) warnings.push(`Unrecognised SciOpen crossref ${type}/${rid}; retained as text.`);
      x.replaceWith(d.createTextNode(text(x)));
    }
  }
  const supplementary = [...content.querySelectorAll('#title_-11 .v4-art-ele-title')].map(n => text(n));
  for (const n of content.querySelectorAll('#title_-11 .art-reference-item')) {
    const p = d.createElement('p'); const a = d.createElement('a'); a.href = url;
    a.textContent = `${text(n)} — download on article page`; p.append(a); n.replaceWith(p);
    warnings.push('Supplementary download handler has no public href; article-link fallback.');
  }
  for (const n of content.querySelectorAll('*')) for (const a of [...n.attributes]) {
    if (/^on/i.test(a.name)) n.removeAttribute(a.name);
  }
  for (const a of content.querySelectorAll('a[href]')) {
    const value = a.getAttribute('href');
    if (value.startsWith('#')) continue;
    try { const u = new URL(value, url); if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) a.replaceWith(d.createTextNode(text(a))); else a.href = u.href; }
    catch { a.replaceWith(d.createTextNode(text(a))); }
  }
  const scientificRuns = [];
  // Greek variable + source subscript is one math run. The shared inline
  // normalizer deliberately handles a narrower Latin/chemical boundary.
  for (const sub of [...content.querySelectorAll('sub')]) {
    const previous = sub.previousSibling;
    const match = previous?.nodeType === 3 ? previous.textContent.match(/([\p{Script=Greek}]+)$/u) : null;
    if (!match || !/^[\p{Script=Greek}\p{N}]+$/u.test(text(sub))) continue;
    previous.textContent = previous.textContent.slice(0, -match[1].length);
    const marker = `SCIOPENSCI${scientificRuns.length}END`;
    scientificRuns.push({ marker, tex: `${match[1]}_{${text(sub)}}` });
    sub.replaceWith(d.createTextNode(marker));
  }
  for (const sup of [...content.querySelectorAll('sup')]) {
    const previous = sup.previousSibling;
    const match = previous?.nodeType === 3 ? previous.textContent.match(/([\p{L}\p{N}]+)$/u) : null;
    if (!match || !/^[−+\-]?\d+$/u.test(text(sup))) continue;
    const base = match[1];
    const tex = `${/^\d+$/u.test(base) ? base : `\\mathrm{${base}}`}^{${text(sup).replace(/−/g, '-')}}`;
    previous.textContent = previous.textContent.slice(0, -base.length);
    const marker = `SCIOPENSCI${scientificRuns.length}END`;
    scientificRuns.push({ marker, tex }); sup.replaceWith(d.createTextNode(marker));
  }
  return { dom, metadata, sections, figures, formulas, references, citations, supplementary, scientificRuns, warnings, cleanedHtml: content.outerHTML };
}

export async function clipSciOpenExperimental({ html, url }) {
  const result = parseSciOpenPage(html, url);
  try {
    return await withDomGlobals(converterDom, async () => {
    // Defuddle emits MathML as dollar-delimited TeX. Do not run Nature's
    // legacy escaped-bracket pass over SciOpen bracketed citation prose.
    const convert = async value => normalizeAcademicInline(await htmlToMarkdown(value, url));
    let markdown = await convert(result.cleanedHtml);
    markdown = markdown.replace(/\\\[((?:SCIOPENCITE\d+END[\s,;]*)+)\\\]/g, '$1');
    markdown = markdown.replace(/SCIOPENCITE(\d+)END/g, '[^$1]');
    for (const run of result.scientificRuns) markdown = markdown.replaceAll(run.marker, `$${run.tex}$`);
    if (result.references.length) {
      markdown += '\n\n## References\n\n';
      for (const r of result.references) markdown += `[^${r.number}]: ${(await convert(r.html)).replace(/\n+/g, ' ')}\n\n`;
    }
    assertValidMathDelimiters(markdown);
    assertValidRawHtml(markdown, { citationStyle: 'markdown' });
    assertValidCrossReferences(markdown, { citationStyle: 'markdown' });
    const structure = validateMarkdownStructure(markdown, { citationStyle: 'markdown' });
    if (!structure.valid) throw new Error(`SciOpen Markdown structure failed: ${JSON.stringify(structure.issues)}`);
    const { dom, ...summary } = result;
    return { ...summary, markdown };
    });
  } finally { result.dom.window.close(); }
}
