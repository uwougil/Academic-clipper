import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseRscPage, isExperimentalRscUrl } from '../src/adapters/rsc.mjs';
import { clipRsc } from '../src/experimental/rsc-clip.mjs';

const ids = ['d3mh00787a', 'd5mh00096c', 'd4cp00788c', 'd4cp00012a', 'd3tc03672c', 'd4tc01199f'];
const fixtures = new Map();
for (const order of ['rsc,aaas', 'aaas,rsc', 'pnas,rsc']) {
  for (const style of ['markdown', 'links', 'quarto']) test(`RSC cold lifecycle ${order} ${style}`, () => {
    const child = spawnSync(process.execPath, ['--max-old-space-size=512', fileURLToPath(new URL('../scripts/rsc-lifecycle-check.mjs', import.meta.url)), order, style], { encoding: 'utf8', timeout: 120000 });
    assert.equal(child.status, 0, child.stderr || child.error?.message);
    assert.ok(JSON.parse(child.stdout).articleWindows > 0);
  });
}
for (const id of ids) fixtures.set(id, {
  html: await readFile(new URL(`./fixtures/rsc/${id}.html`, import.meta.url), 'utf8'),
  provenance: JSON.parse(await readFile(new URL(`./fixtures/rsc/${id}.json`, import.meta.url), 'utf8')),
});

for (const [id, { html, provenance: p }] of fixtures) {
  test(`RSC source identity and extraction oracle: ${id}`, () => {
    assert.equal(createHash('sha256').update(html.replaceAll('\r\n', '\n')).digest('hex'), p.fixtureSha256);
    assert.equal(p.responseSha256, null); // DOM serialization is not HTTP bytes.
    assert.ok(p.retained.length > 5);
    assert.doesNotMatch(html, /Signature=|Key-Pair-Id=|<script|<input|onetrust/iu);
    const sourceDom = new JSDOM(html);
    const source = sourceDom.window.document;
    const page = parseRscPage(html, p.url);
    try {
      for (const field of ['title', 'authors', 'journal', 'doi']) assert.deepEqual(page.metadata[field], p.expected[field]);
      assert.deepEqual(page.references.map((r) => r.number), p.expected.referenceNumbers);
      assert.deepEqual(page.references.map((r) => r.doi), p.expected.referenceDois);
      assert.deepEqual([...page.semantic.crossReferences.values()].filter((t) => t.type === 'section').map((t) => t.label), p.expected.headings);
      assert.deepEqual(page.figures.map((f) => f.label), p.expected.figures.map((f) => f.label));
      assert.deepEqual(page.figures.map((f) => f.caption), p.expected.figures.map((f) => f.caption));
      assert.equal(page.tables.length, p.expected.tables.length);
      for (let i = 0; i < page.tables.length; i++) {
        const actual = page.tables[i], expected = p.expected.tables[i];
        assert.equal(actual.tableParts.length, expected.parts);
        assert.deepEqual(actual.tableParts.map((part) => {
          const tableDom = new JSDOM(part.tableHtml);
          const rows = tableDom.window.document.querySelector('table').rows.length;
          tableDom.window.close(); return rows;
        }), expected.rows);
      }
      assert.deepEqual(page.equations.map((e) => e.imageOnly), p.expected.equations.map((e) => e.imageOnly));
      // Each source citation points to the original reference identity, including
      // grouped/ranged labels whose display text alone cannot establish targets.
      assert.equal(page.semantic.citations.length, source.querySelectorAll('.xref-bibr').length);
      for (const entry of page.semantic.citations) for (const n of entry.numbers) assert.ok(page.references.some((r) => r.number === n));
      assert.doesNotMatch(page.cleanedHtml, /xref-bibr|reveal-modal|table-modal/);
    } finally { page.dom.window.close(); sourceDom.window.close(); }
  });
  for (const citationStyle of ['markdown', 'links', 'quarto']) test(`RSC ${id} renders and validates ${citationStyle}`, async () => {
    const result = await clipRsc({ html, url: p.url, citationStyle });
    for (const name of ['mathValidation', 'markdownStructure', 'rawHtmlValidation', 'crossReferenceValidation']) {
      assert.equal(result.debug[name].valid, true, `${name}: ${JSON.stringify(result.debug[name])}`);
    }
    assert.doesNotMatch(result.markdown, /ACADEMICCLIPPER|Partial conversion|javascript:|preloader\.gif|Google Scholar|Download slide/);
    const renderedHeadings = result.markdown.split('\n').filter((line) => /^#{2,6} /u.test(line));
    assert.equal(renderedHeadings.length, p.expected.headings.length + 1 + (result.tables.length ? 1 : 0));
    assert.ok(renderedHeadings.some((line) => line.replaceAll('\\', '').includes(p.expected.headings[0])));
    for (const f of result.figures) {
      assert.ok(result.markdown.includes(`**${f.label}.**`));
      assert.ok(result.markdown.includes(f.imageUrl));
      assert.ok(f.captionMarkdown.length > 20);
    }
    for (const t of result.tables) {
      assert.ok(result.markdown.includes(`**${t.label}.**`));
      assert.equal(t.markdown.split('\n').filter((line) => /^\| (?:--- \| ?)+$/u.test(line)).length, t.tableParts.length);
    }
    if (citationStyle === 'quarto') {
      for (const r of result.references) assert.ok(result.referencesBib.includes(`@misc{ref${r.number},`));
      assert.doesNotMatch(result.markdown, /\(#eq-rsc-/); // No invented display TeX target.
    } else {
      for (const r of result.references) assert.ok(result.markdown.includes(citationStyle === 'links' ? `id="ref-${r.number}"` : `[^${r.number}]:`));
    }
    if (id === 'd4cp00788c') {
      assert.equal(result.tables[0].tableParts.length, 3);
      for (const value of ['95(5)', '92(12)', 'No deflection', '31(6)', '28(7)']) assert.ok(result.markdown.includes(value), value);
      assert.ok(result.markdown.includes('\\vec{r}_{d}'));
      assert.ok(result.debug.warnings.some((w) => w.includes('image-only')));
    }
    if (id === 'd3mh00787a') assert.ok((citationStyle === 'quarto' ? result.referencesBib : result.markdown).includes('\\$2800'));
    if (id === 'd4cp00012a') assert.ok(result.markdown.includes('[The symmetry labels'));
    if (id === 'd3tc03672c') assert.ok(result.tables[0].tableParts[0].tableHtml.includes('rowspan='));
    if (citationStyle === 'links') assert.ok(result.markdown.includes('](#rsc-fig1)'));
    if (citationStyle === 'quarto') assert.ok(result.markdown.includes('](#fig-rsc-fig1)'));
  });
}

test('RSC guards reject unsupported family, abstract, challenge, missing body and mismatched journal', () => {
  const { html, provenance: p } = fixtures.get(ids[0]);
  for (const url of [p.url.replace('/article/', '/article-abstract/'), p.url.replace('/mh/', '/lc/'), p.url.replace('https:', 'http:'), p.url.replace('pubs.rsc.org', 'pubs.rsc.org.evil.test')]) {
    assert.equal(isExperimentalRscUrl(url), false);
    assert.throws(() => parseRscPage(html, url), /Unsupported/);
  }
  assert.throws(() => parseRscPage('<h1>Verify you are human</h1>', p.url), /unavailable/);
  assert.throws(() => parseRscPage(html.replace('Materials Horizons', 'Unverified journal'), p.url), /unavailable/);
  assert.throws(() => parseRscPage(html.replace('widget-ArticleFulltext', 'missing-fulltext'), p.url), /unavailable/);
  assert.throws(() => parseRscPage(html.replace('<link rel="canonical" href="', '<link rel="canonical" href="https://pubs.rsc.org/mh/article/other/'), p.url), /identity/);
  assert.throws(() => parseRscPage(html.replace('<body>', '<body><div id="unauth">Purchase access</div>'), p.url), /unavailable/);
});

test('RSC refuses dangling citations and remains deterministic over repeated conversion', async () => {
  const { html, provenance: p } = fixtures.get('d4cp00788c');
  assert.throws(() => parseRscPage(html.replace('data-modal-source-id="cit1 cit2"', 'data-modal-source-id="cit999"'), p.url), /Unresolved RSC citation/);
  const first = await clipRsc({ html, url: p.url });
  const second = await clipRsc({ html, url: p.url });
  assert.equal(first.markdown, second.markdown);
});
