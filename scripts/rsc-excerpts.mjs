// Offline, publisher-local excerpt preparation. Input is rendered DOM captured by
// the browser, never an HTTP response. Full captures stay outside the repository.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import path from 'node:path';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/rsc-excerpts.mjs <external capture directory>');
const output = 'test/fixtures/rsc';
await mkdir(output, { recursive: true });
const hash = (s) => createHash('sha256').update(s).digest('hex');
for (const id of ['d3mh00787a', 'd5mh00096c', 'd4cp00788c', 'd4cp00012a', 'd3tc03672c', 'd4tc01199f']) {
  const capture = JSON.parse(await readFile(path.join(input, `${id}.json`), 'utf8'));
  const dom = new JSDOM(`<html><head>${capture.head}</head><body>${capture.body}</body></html>`);
  const d = dom.window.document;
  const root = d.querySelector('.widget-ArticleFulltext');
  const selected = new Set([
    d.querySelector('.abstract'),
    ...root.querySelectorAll('.jumplink-heading'),
    ...Array.from(root.querySelectorAll('.article-section-wrapper p')).filter((p) => !p.closest('.fig,.table-wrap,.ref-list')).slice(0, 3),
    root.querySelector('.fig[data-id="fig1"]'),
    root.querySelector('.fig[data-id="sch1"]'),
    root.querySelector('a[reveal-id="fig1"]')?.closest('.block-child-p,p'),
    root.querySelector('a[reveal-id="tab1"]')?.closest('.block-child-p,p'),
    ...(id === 'd4cp00012a' ? [root.querySelector('.fig[data-id="fig5"]')] : []),
    ...(id === 'd3mh00787a' ? [...root.querySelectorAll('p')].filter((p) => p.textContent.includes('$2800')) : []),
    ...root.querySelectorAll('.table-wrap'),
    ...Array.from(root.querySelectorAll('.formula-wrap')).slice(0, 3).map((e) => e.closest('.block-child-p,p') || e),
  ].filter(Boolean));
  const citations = new Set(['cit1', 'cit2']);
  for (const block of selected) for (const a of block.querySelectorAll('.xref-bibr')) {
    for (const target of (a.getAttribute('data-modal-source-id') || '').split(/\s+/)) citations.add(target);
  }
  // Sequential reference definitions are an existing validator contract. Keep
  // all preceding source entries rather than renumbering excerpt citations.
  const maxCitation = id === 'd3mh00787a' ? 72 : Math.max(...[...citations].map((id) => Number(id.replace('cit', ''))).filter(Number.isFinite));
  for (const ref of root.querySelectorAll('.ref-list [data-content-id]')) {
    if (Number.parseInt(ref.querySelector('.ref-content > .label')?.textContent) <= maxCitation) selected.add(ref);
  }
  // Parent selection wins; preserve real subtree markup and original ancestry.
  const blocks = [...selected].filter((node) => ![...selected].some((other) => other !== node && other.contains(node)));
  const retained = blocks.map((node) => ({
    locator: node.id ? `#${node.id}` : node.getAttribute('data-content-id')
      ? `[data-content-id="${node.getAttribute('data-content-id')}"]`
      : node.getAttribute('data-id') ? `.fig[data-id="${node.getAttribute('data-id')}"]`
        : node.classList.contains('table-wrap') ? `[content-id="${node.getAttribute('content-id')}"]`
          : `${node.tagName.toLowerCase()}.${node.classList[0]} (document order ${[...root.querySelectorAll(node.tagName)].indexOf(node)})`,
    sourceSubtreeSha256: hash(node.outerHTML),
  }));
  const keep = new Set();
  for (const node of blocks) { for (let p = node; p && p !== d.body; p = p.parentElement) keep.add(p); }
  function prune(node) {
    if (blocks.includes(node)) return;
    for (const child of [...node.childNodes]) if (child.nodeType === 3 && child.textContent.trim()) child.remove();
    for (const child of [...node.children]) {
      if (keep.has(child)) prune(child); else child.remove();
    }
  }
  prune(d.querySelector('.article-body'));
  // Metadata institutions are publicly published; no account fields captured.
  for (const links of d.querySelectorAll('.citation-links')) {
    for (const child of [...links.children]) if (!child.classList.contains('crossref-doi')) child.remove();
  }
  for (const element of d.querySelectorAll('.table-modal,.reveal-modal,.fig-orig,input,script')) element.remove();
  for (const element of d.querySelectorAll('*')) for (const attr of [...element.attributes]) {
    if (attr.name.startsWith('on') || attr.name.startsWith('xmlns')) element.removeAttribute(attr.name);
    if (['src', 'data-src', 'href'].includes(attr.name) && /silverchair-cdn/.test(attr.value)) {
      element.setAttribute(attr.name, attr.value.split('?')[0]);
    }
  }
  const html = `<!doctype html>\n${d.documentElement.outerHTML}\n`.replace(/[\t ]+$/gmu, '');
  const text = (node) => node?.textContent.replace(/\s+/g, ' ').trim() || '';
  const expected = {
    title: d.querySelector('meta[name="citation_title"]').content,
    authors: [...d.querySelectorAll('meta[name="citation_author"]')].map((m) => m.content),
    journal: d.querySelector('meta[name="citation_journal_title"]').content,
    doi: d.querySelector('meta[name="citation_doi"]').content,
    headings: [...root.querySelectorAll('.jumplink-heading')].filter((h) => !/references/i.test(text(h))).map(text),
    figures: [...root.querySelectorAll('.fig[data-id]')].map((f) => ({ id: f.dataset.id, label: text(f.querySelector('.fig-label')), caption: text(f.querySelector('.fig-caption')) })),
    tables: [...root.querySelectorAll('.table-wrap')].map((t) => ({ id: t.querySelector('.table-wrap-title').id, parts: t.querySelectorAll('.table-overflow table').length, rows: [...t.querySelectorAll('.table-overflow table')].map((p) => p.rows.length), caption: text(t.querySelector('.caption')) })),
    equations: [...root.querySelectorAll('.disp-formula')].map((e) => ({ id: e.id, imageOnly: !!e.querySelector('img'), text: text(e) })),
    referenceNumbers: [...root.querySelectorAll('.ref-list .ref-content > .label')].map((n) => Number.parseInt(text(n))),
    referenceDois: [...root.querySelectorAll('.ref-list [data-content-id]')].map((r) => {
      const link = r.querySelector('.crossref-doi a');
      return link ? new URL(link.getAttribute('href')).pathname.slice(1) : '';
    }),
  };
  await writeFile(`${output}/${id}.html`, html);
  await writeFile(`${output}/${id}.json`, JSON.stringify({
    url: capture.url, observedAt: capture.observedAt, captureMode: 'browser-rendered DOM serialization',
    serializedBodySha256: hash(capture.body), responseSha256: null,
    responseHashExplanation: 'Browser DOM capture; no HTTP response bytes available.',
    fixtureSha256: hash(html), fixtureHashEncoding: 'UTF-8 with LF line endings', retained,
    sanitization: ['Removed modal duplicates, figure controls, reference discovery links, scripts/inputs and event handlers', 'Removed signed CDN query parameters; asset bytes were not captured', 'Trimmed trailing line whitespace; hashes use LF line endings'],
    omissions: ['Most prose, figures, references, graphical abstract, footnotes, supplements and author panels omitted; this is an excerpt, not a complete article'],
    expected,
  }, null, 2) + '\n');
  dom.window.close();
}
