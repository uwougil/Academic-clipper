// Offline reduction of the observed truncated NRE export. No network or JS execution.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
const [inputPath, outputDir] = process.argv.slice(2);
const source = JSON.parse(await readFile(inputPath, 'utf8'));
if (!source.html.endsWith('[Truncated]') || source.references !== 52)
  throw new Error('Expected the observed truncated 52-reference export.');
const hash = value => createHash('sha256').update(value).digest('hex');
const dom = new JSDOM(source.html);
const d = dom.window.document;
const bibliography = d.querySelector('#title_-12');
const paragraph = d.querySelector('xref[ref-type="bibr"][rid="b8"]').closest('p');
const selected = [paragraph, bibliography].map(n => hash(n.outerHTML));
const head = [...d.querySelectorAll('meta[name^="citation_"]')].map(n => n.outerHTML).join('');
const excerpt = new JSDOM(`<html><head>${head}</head><body><div id="v4_art_main_center"><div id="insert_content_one"><div id="s01" class="v4-art-content-p"></div></div></div></body></html>`);
const target = excerpt.window.document;
target.querySelector('#s01').append(d.querySelector('#s01 h2').cloneNode(true), paragraph.cloneNode(true));
target.querySelector('#v4_art_main_center').append(bibliography.cloneNode(true));
for (const n of target.querySelectorAll('script,style,.v4-art-reference-item-pos')) n.remove();
for (const n of target.querySelectorAll('*')) for (const attr of [...n.attributes]) {
  if (/^on/i.test(attr.name) || attr.name === 'style') n.removeAttribute(attr.name);
  if (['src', 'href'].includes(attr.name) && attr.value.includes('?')) {
    const u = new URL(attr.value, source.url); u.search = ''; n.setAttribute(attr.name, u.href);
  }
}
const html = '<!doctype html>\n' + target.documentElement.outerHTML + '\n';
await mkdir(outputDir, { recursive: true });
await writeFile(`${outputDir}/article.excerpt.html`, html);
await writeFile(`${outputDir}/provenance.json`, JSON.stringify({
  url: source.url, observedAt: '2026-10-02', captureMode: 'truncated-public-rendered-dom-selected-blocks',
  recipe: 'sciopen-reference-repro-v1', serializedSourceSha256: hash(source.html),
  fixtureSha256: hash(html), retainedSourceSubtreeSha256: selected,
  sourceEvidence: { browserReferences: 52, serializedCharacters: source.html.length,
    serializedReferenceIds: [...source.html.matchAll(/id="r_b(\d+)"/g)].map(m => Number(m[1])),
    reparsedReferenceIds: [...d.querySelectorAll('.v4-art-reference-item-index')].map(n => n.id),
    terminalMarker: '[Truncated]', closedScaffold: false },
  transformations: ['fixed scaffold', 'retain source citation range ending at b8 and exported bibliography',
    'remove reference navigation and event handlers; strip URL queries'],
  omissions: ['other article content', 'references absent from truncated acquisition'],
}, null, 2) + '\n');
dom.window.close(); excerpt.window.close();
