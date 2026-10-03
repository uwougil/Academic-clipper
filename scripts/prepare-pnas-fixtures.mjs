// Offline research tool: input is browser DOM blocks, never HTTP response bytes.
import { readFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/prepare-pnas-fixtures.mjs <temporary capture directory>');
const destination = path.resolve('test/fixtures/pnas');
await mkdir(destination, { recursive: true });
const hash = (s) => createHash('sha256').update(s).digest('hex');
const manifest = [];
for (const id of ['2400689121', '2318124121', '1319030111']) {
  const blocks = [];
  for (const i of [0, 1, 2, 3, 6, 7]) {
    const filename = id === '2400689121' && i === 2 ? `pnas-${id}-body-complete.html` : `pnas-${id}-block${i}.html`;
    const html = await readFile(path.join(source, filename), 'utf8');
    if (html.endsWith('[truncated]')) throw new Error(`Truncated capture: ${filename}`);
    const capturedAtUTC = (await stat(path.join(source, filename))).mtime.toISOString();
    blocks.push({ filename, capturedAtUTC, sha256: hash(html), characters: html.length, html });
  }
  const head = new JSDOM(blocks[0].html).window.document;
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
  const doc = dom.window.document;
  for (const meta of head.querySelectorAll('meta[name^="citation_"]')) doc.head.append(meta.cloneNode(true));
  for (const block of blocks.slice(1)) {
    const original = new JSDOM(block.html).window.document.body.firstElementChild;
    doc.body.append(original.cloneNode(true));
  }
  // Preserve complete introductory paragraphs and sec-1 ancestry. Omit the other
  // long gossip sections, rather than synthesizing shortened academic prose.
  if (id === '2400689121') {
    // Include a real caption with equation crossrefs as regression evidence,
    // retaining its original ancestor path and ancestor headings in sec-2.
    const keepCaptionPath = (node) => {
      if (node.id === 'fig02') return;
      for (const child of [...node.children]) {
        if (child.id === 'fig02' || child.querySelector('#fig02')) keepCaptionPath(child);
        else if (!/^H[2-5]$/u.test(child.tagName)) child.remove();
      }
    };
    for (const section of doc.querySelectorAll('#bodymatter > .core-container > section:not(#sec-1)')) {
      if (section.id === 'sec-2') keepCaptionPath(section);
      else section.remove();
    }
  }
  for (const element of doc.querySelectorAll('script,style,iframe,noscript,.to-citation__accordion,.to-citation__wrapper,.core-xlink-google-scholar,.core-xlink-pubmed')) element.remove();
  // CHTML glyph trees duplicate the intact assistive MathML. Keep the original
  // mjx-container/assistive MathML ancestry and all mathematical content.
  for (const element of doc.querySelectorAll('mjx-math')) element.remove();
  for (const element of doc.querySelectorAll('*')) for (const attr of [...element.attributes]) {
    if (/^on/i.test(attr.name) || ['style', 'nonce', 'integrity'].includes(attr.name)) element.removeAttribute(attr.name);
  }
  const html = dom.serialize().replace(/[ \t]+$/gmu, '') + '\n';
  if (Buffer.byteLength(html) > 256 * 1024) throw new Error(`Fixture too large: ${id}`);
  const file = `${id}.html`;
  await writeFile(path.join(destination, file), html);
  manifest.push({ file, url: `https://www.pnas.org/doi/10.1073/pnas.${id}`, captureMode: 'browser-loaded-dom-blocks', capturedOn: '2026-10-03', fixtureSha256: hash(html), bytes: Buffer.byteLength(html), blocks: blocks.map(({ html: _, ...b }) => b), omissions: id === '2400689121' ? ['sec-2 except fig02 with ancestor path/headings; body sec-3, sec-4; figures/equations therein'] : [], sanitation: ['citation_* head metadata only', 'scripts/styles/frames/noscript removed', 'reference return menus, Scholar/PubMed UI removed; DOI links retained', 'redundant visual mjx-math removed; original assistive MathML retained', 'event handlers/style/nonce/integrity attributes removed', 'trailing horizontal whitespace removed; fixtures stored with LF'], coverage: 'Public loaded DOM excerpt; not raw HTTP, not complete page, not a subscription access oracle' });
}
await writeFile(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(manifest.map(({ file, bytes }) => ({ file, bytes })));
