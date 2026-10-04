// Offline investigation: report topology/counts only, never source credentials.
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
const input = JSON.parse(await readFile(process.argv[2], 'utf8'));
const html = input.html || input.blocks.find(b => b.selector === '#title_-12')?.html || '';
const dom = new JSDOM(html);
const d = dom.window.document;
const refs = [...d.querySelectorAll('.v4-art-reference-item')];
const parents = n => {
  const result = [];
  for (let i = 0; n && i < 5; i++, n = n.parentElement) result.push([n.tagName, n.id]);
  return result;
};
console.log(JSON.stringify({
  url: input.url, reportedReferences: input.references ?? null,
  htmlLength: html.length, globalReferences: refs.length,
  closedScaffold: html.endsWith('</html>'),
  terminalMarker: html.endsWith('[Truncated]') ? '[Truncated]' : null,
  rootReferences: d.querySelector('#v4_art_main_center')?.querySelectorAll('.v4-art-reference-item').length ?? null,
  containers: d.querySelectorAll('[id="article_references"]').length,
  referenceSamples: refs.filter((_, i) => [0, 4, 5, 51].includes(i)).map(n => ({ id: n.querySelector('.v4-art-reference-item-index')?.id, parents: parents(n) })),
  referenceSectionAncestor: parents(d.querySelector('#title_-12')),
}, null, 2));
dom.window.close();
