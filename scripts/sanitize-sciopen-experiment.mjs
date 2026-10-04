import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';

// Offline acquisition recipe. Input is selected public rendered DOM blocks,
// never cookies, browser state, or a full-page capture. No network operation.
const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('Usage: node scripts/sanitize-sciopen-experiment.mjs <blocks.json> <output-directory>');
const source = JSON.parse(await readFile(input, 'utf8'));
const dom = new JSDOM(`<html><head>${source.metadata}</head><body><div id="v4_art_main_center"></div></body></html>`);
const d = dom.window.document;
const center = d.querySelector('#v4_art_main_center');
const main = d.createElement('div'); main.id = 'insert_content_one';
center.append(main);
const retained = [];
const hash = value => createHash('sha256').update(value).digest('hex');
for (const block of source.blocks) {
  if (!block.html) continue;
  // Browser DOM can contain MathJax block divs inside <p>. HTML reparsing
  // closes that p and detaches the formula. Compact original payload first.
  const compactMath = block.html.replace(/<(inline-formula|disp-formula)\b([^>]*)>([\s\S]*?)<\/\1>/g, (whole, tag, attrs, inner) => {
    const payload = inner.match(/<script\b[^>]*type="math\/mml"[^>]*>([\s\S]*?)<\/script>/)?.[1];
    return payload ? `<${tag}${attrs}>${inner.match(/<label>[\s\S]*?<\/label>/)?.[0] || ''}${payload}</${tag}>` : whole;
  });
  const fragment = JSDOM.fragment(compactMath);
  const node = fragment.firstElementChild;
  if (block.selector === '#s01') {
    for (const p of [...node.querySelectorAll('p')].slice(1)) p.remove();
  }
  if (block.selector === '#s03') {
    // Keep figure crossrefs and a separate Greek-subscript witness.
    const p = [...node.querySelectorAll('p')].find(x => x.querySelector('xref[ref-type="fig"]'));
    const greek = [...node.querySelectorAll('p')].find(x => /Δ/.test(x.textContent) && x.querySelector('sub'));
    const fig = node.querySelector('fig');
    const heading = node.querySelector('h2');
    node.replaceChildren(...new Set([heading, p, greek, fig].filter(Boolean)));
  }
  if (block.selector === '#s04-09') {
    // Related-journal equation witness: first equation and adjacent prose.
    const formula = node.querySelector('disp-formula');
    const heading = node.querySelector('h2');
    const wrapper = formula?.closest('p') || formula;
    const before = wrapper?.previousElementSibling;
    const after = wrapper?.nextElementSibling;
    node.replaceChildren(...[heading, before, formula, after].filter(Boolean));
  }
  if (block.selector === '#insert_content_two') {
    const data = [...node.querySelectorAll('.notes-item')].find(x => /Data availability/.test(x.querySelector('h2')?.textContent));
    node.replaceChildren(...[data].filter(Boolean));
  }
  retained.push({ selector: block.selector, selectedSourceSha256: hash(node.outerHTML) });
  (block.selector.startsWith('#s') ? main : center).append(node);
}
for (const formula of d.querySelectorAll('inline-formula, disp-formula')) {
  const math = formula.querySelector('math');
  const label = formula.querySelector('label');
  // MathJax's accessible MathML is the original mathematical payload;
  // drop visual duplicate spans and its inert math/mml script copy.
  formula.replaceChildren(...[label, math].filter(Boolean));
}
for (const n of d.querySelectorAll('script, style, video, .v4-art-image, .v4-art-reference-item-pos')) n.remove();
for (const n of d.querySelectorAll('*')) {
  for (const a of [...n.attributes]) {
    if (/^on/i.test(a.name) || ['style', 'tabindex', 'aria-describedby'].includes(a.name)) n.removeAttribute(a.name);
    if (['src', 'href'].includes(a.name) && /\?/.test(a.value)) {
      const u = new URL(a.value, source.url); u.search = ''; n.setAttribute(a.name, u.href);
    }
  }
}
const html = '<!doctype html>\n' + d.documentElement.outerHTML + '\n';
await mkdir(output, { recursive: true });
await writeFile(`${output}/article.excerpt.html`, html);
await writeFile(`${output}/provenance.json`, JSON.stringify({
  url: source.url, observedAt: '2026-10-02', captureMode: 'public-rendered-dom-selected-blocks',
  recipe: 'sanitize-sciopen-experiment-v2', selectedInputSha256: hash(await readFile(input)),
  fixtureSha256: hash(html), retained, fullPageObservations: source.counts,
  transformations: ['fixed html scaffold', 'selected first introduction paragraph / figure-crossref and Greek-subscript results paragraphs with one figure',
    'related journal retains first display equation and adjacent prose', 'retain only data availability from back matter',
    'replace MathJax duplicate rendering with original accessible MathML', 'remove event handlers, styles and executable scripts',
    'remove image URL query including access signatures; unsigned URL is a locator, not verified downloadable media'],
  omissions: ['other paragraphs and figures', 'author UI and account/navigation state', 'PDF contents and ESM download handlers'],
}, null, 2) + '\n');
dom.window.close();
