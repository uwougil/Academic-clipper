// Publisher-local importer for selected public DOM blocks exported by browser inspection.
// Input is NOT a full raw page or an HTTP response. Do not claim a response hash.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';

const [input, destination] = process.argv.slice(2);
if (!input || !destination) throw new Error('Usage: node scripts/wiley-fixture-from-blocks.mjs <selected-blocks.json> <output-directory>');
const source = JSON.parse(await readFile(input, 'utf8'));
if (!source.observedAt) throw new Error('The source observation date is required.');
const sha = value => createHash('sha256').update(value).digest('hex');
const metadata = source.metadata;
if (!source.projectedBody) throw new Error('Source-order DOM projection is required.');
const scaffold = `<!doctype html><html><head>${metadata}</head><body>${source.projectedBody}</body></html>`;
const dom = new JSDOM(scaffold);
const { document } = dom.window;
for (const node of document.querySelectorAll('script,style,iframe,form,.extra-links a,.getFTR__content')) node.remove();
for (const node of document.querySelectorAll('*')) {
  for (const attr of Array.from(node.attributes)) {
    if (/^on/iu.test(attr.name) || ['style', 'data-references', 'data-pb-dropzone', 'tabindex', 'ctxtmenu_counter'].includes(attr.name)) node.removeAttribute(attr.name);
  }
  // Bibliography DOI is academic metadata; drop analytics/linkout controls.
  if (node.classList.contains('extra-links')) {
    const doi = node.querySelector('.data-doi');
    node.replaceChildren(...(doi ? [doi] : []));
  }
}
const fixture = `${document.documentElement.outerHTML.replace(/\r\n/gu, '\n').replace(/[ \t]+$/gmu, '')}\n`;
await mkdir(destination, { recursive: true });
await writeFile(`${destination}/article.excerpt.html`, fixture);
await writeFile(`${destination}/provenance.json`, `${JSON.stringify({
  url: source.url, title: source.title, observedAt: source.observedAt, captureMode: 'public-browser-selected-DOM-blocks',
  accessLabel: source.access || '', fullWrapperObserved: source.full,
  sourceResponseSha256: null,
  sourceDigestMeaning: 'Hashes below identify selected serialized DOM subtrees before sanitization; no raw HTTP response was obtained.',
  fixtureSha256: sha(fixture), sanitizerVersion: 'wiley-selected-blocks-v1',
  retainedBlocks: Object.entries(source.groups).flatMap(([role, nodes]) => nodes.map(n => ({ role, id: n.id || '', tag: n.tag, class: n.cls, sourceDomSha256: sha(n.html) }))),
  transformations: ['Minimal document scaffold; source-order projection retains selected semantic blocks and their original ancestor opening/closing tags, drops unselected siblings', 'Preserved each selected scholarly block internally; removed executable scripts/forms/iframes/style/events and reference linkout UI', 'UTF-8 LF serialization; removed trailing line indentation while retaining newlines', 'Retained citation numbering and reference prefix through highest selected citation', 'No inserted scholarly prose, captions, cells or equations'],
  omittedContent: ['Unselected paragraphs/sections/figures/equations/tables/references', 'Header, account UI, sidebars, ads, consent, analytics and full raw page', 'Source HTTP bytes and headers'],
}, null, 2)}\n`);
dom.window.close();
