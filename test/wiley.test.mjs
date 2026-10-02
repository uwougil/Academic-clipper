import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { parseWileyPage, wileyDoiFromUrl } from '../src/adapters/wiley.mjs';
import { clipWiley } from '../src/adapters/wiley-clip.mjs';

const cases = {
  adfm: { doi: '10.1002/adfm.202411631', journal: 'Advanced Functional Materials', authors: 13, firstAuthor: 'Ting Huang', date: '2024-10-10', refs: 0, supp: 2, preview: true },
  advs: { doi: '10.1002/advs.202404860', journal: 'Advanced Science', authors: 9, firstAuthor: 'Johannes Bader', date: '2024-12-31', refs: 5, supp: 3 },
  smll: { doi: '10.1002/smll.202402938', journal: 'Small', authors: 11, firstAuthor: 'Jiahui Lin', date: '2024-08-07', refs: 9, supp: 2 },
  aelm: { doi: '10.1002/aelm.202300874', journal: 'Advanced Electronic Materials', authors: 7, firstAuthor: 'Guangqian Ding', date: '2024-02-05', refs: 24, supp: 1 },
  'smll-expanded': { doi: '10.1002/smll.202402938', journal: 'Small', authors: 11, firstAuthor: 'Jiahui Lin', date: '2024-08-07', refs: 9, supp: 2, expanded: true },
};
async function fixture(id) {
  const base = new URL(`./fixtures/wiley/${id}/`, import.meta.url);
  return { html: await readFile(new URL('article.excerpt.html', base), 'utf8'), provenance: JSON.parse(await readFile(new URL('provenance.json', base))) };
}
for (const [id, expected] of Object.entries(cases)) {
  test(`Wiley source excerpt identity and semantics: ${id}`, async () => {
    const { html, provenance } = await fixture(id);
    assert.equal(createHash('sha256').update(html).digest('hex'), provenance.fixtureSha256);
    assert.equal(provenance.sourceResponseSha256, null);
    assert.ok(provenance.retainedBlocks.every(b => /^[a-f0-9]{64}$/u.test(b.sourceDomSha256)));
    const page = parseWileyPage(html, provenance.url);
    assert.equal(page.metadata.doi, expected.doi);
    assert.equal(page.metadata.journal, expected.journal);
    assert.equal(page.metadata.authors.length, expected.authors);
    assert.equal(page.metadata.authors[0], expected.firstAuthor);
    assert.equal(page.metadata.authorInformation.affiliations.length, expected.authors);
    assert.equal(page.metadata.date, expected.date);
    assert.equal(page.references.length, expected.refs);
    assert.deepEqual(page.references.map(r => r.number), Array.from({ length: expected.refs }, (_, i) => i + 1));
    assert.equal(page.supplementaryLinks.length, expected.supp);
    assert.ok(page.supplementaryLinks.every(l => l.url.startsWith(new URL(provenance.url).origin + '/action/downloadSupplement?')));
    assert.equal(page.debug.access, expected.preview ? 'preview' : 'full-content-present');
    assert.equal(page.figures.length, expected.preview ? 0 : 1);
    if (!expected.preview) {
      assert.equal(page.figures[0].label, 'Figure 1');
      assert.match(page.figures[0].imageUrl, /-fig-0001-m\.jpg$/u);
      assert.equal(page.document.querySelector('h2.article-section__title').textContent, '1 Introduction');
      assert.ok(!page.cleanedHtml.includes('Open in figure viewer'));
    }
    if (id === 'aelm') assert.deepEqual(page.semantic.citations.map(c => c.numbers), [[1,2,3],[4,5,6,7,8,9],[10],[11,12,13,14,15,16,17,18],[19],[20,21,22,23],[24]]);
    if (expected.expanded) {
      assert.equal(page.semantic.displayMath.length, 1);
      assert.equal(page.semantic.displayMath[0].tex, '{\\mathrm{L\\ }} = \\frac{{{{{\\mathrm{M}}}_0} - {{{\\mathrm{M}}}_{\\mathrm{X}}}}}{{{{{\\mathrm{M}}}_0}}}\\ \\times 100{\\mathrm{\\% }}');
      assert.ok(page.semantic.crossReferences.has('smll202402938-fig-0001'));
    } else if (!expected.preview) assert.match(page.debug.warnings.join(' '), /no source TeX; retained remote image fallback/u);
  });
  for (const citationStyle of ['markdown', 'links', 'quarto']) {
    test(`Wiley Defuddle + production validators: ${id}/${citationStyle}`, async () => {
      const { html, provenance } = await fixture(id);
      const result = await clipWiley({ html, url: provenance.url, citationStyle, allowPreview: Boolean(expected.preview) });
      assert.ok(Object.values(result.debug.validations).every(v => v.valid));
      assert.doesNotMatch(result.markdown, /ACADEMICCLIPPER|<math|mjx-|Open in figure viewer|PowerPoint|Google Scholar/u);
      assert.match(result.markdown, new RegExp(expected.doi.replaceAll('.', '\\.')));
      if (expected.refs && citationStyle === 'markdown') {
        assert.equal((result.markdown.match(/^\[\^\d+\]:/gmu) || []).length, expected.refs);
        assert.match(result.markdown, /\[\^1\]/u);
      }
      if (expected.refs && citationStyle === 'quarto') {
        assert.match(result.markdown, /\[@wileyRef1/u);
        for (const r of result.references) assert.ok(result.bibliography.includes(`{${r.citationKey},`));
      }
      if (id.startsWith('smll')) {
        assert.equal(result.tables.length, 1);
        assert.match(result.tables[0].markdown, /56\.11 \| 60\.42 \| 166\.18/u);
        assert.equal(result.tables[0].markdown.split('\n').length, 10);
        assert.ok(result.tables[0].markdown.split('\n').every(line => line.split('|').length === 9));
        assert.match(result.tables[0].markdown, /\[°C\]/u);
        assert.match(result.markdown, /\\mathrm\{SiO\}_\{\\mathrm\{2\}\}/u);
      }
      if (expected.expanded) {
        assert.match(result.markdown, /The data that support the findings/u);
        assert.match(result.markdown, /\\frac/u);
        assert.ok(result.debug.validations.crossrefs.valid);
        assert.ok(result.markdown.includes(citationStyle === 'quarto' ? '#fig-figure-1' : citationStyle === 'links' ? '#figure-1' : 'Figure'));
      }
    });
  }
}
test('Wiley preview is refused unless explicitly requested as incomplete', async () => {
  const { html, provenance } = await fixture('adfm');
  await assert.rejects(clipWiley({ html, url: provenance.url }), /full content absent/u);
});
test('Wiley URL and identity boundaries reject foreign hosts, journals and mismatched DOI', async () => {
  for (const url of ['http://onlinelibrary.wiley.com/doi/10.1002/advs.1', 'https://onlinelibrary.wiley.com.evil.test/doi/10.1002/advs.1', 'https://user@onlinelibrary.wiley.com/doi/10.1002/advs.1', 'https://onlinelibrary.wiley.com/doi/pdf/10.1002/advs.1']) assert.equal(wileyDoiFromUrl(url), '');
  const { html, provenance } = await fixture('advs');
  assert.throws(() => parseWileyPage(html, provenance.url.replace('202404860', '202400981')), /DOI does not match/u);
  assert.throws(() => parseWileyPage(html.replace('content="Advanced Science"', 'content="Other Journal"'), provenance.url), /outside/u);
  assert.throws(() => parseWileyPage(html.replace(/class="article__body[^"]*"/u, 'class="challenge"'), provenance.url), /root/u);
});
test('Wiley offline conversion is deterministic across different DOMs and has no fetch', async () => {
  const original = globalThis.fetch; let requests = 0;
  globalThis.fetch = () => { requests++; throw new Error('Undeclared fixture request'); };
  try {
    const a = await fixture('advs'), b = await fixture('smll-expanded');
    const clip = f => clipWiley({ html: f.html, url: f.provenance.url });
    const first = await clip(a); await clip(b); const again = await clip(a);
    assert.equal(first.markdown, again.markdown); assert.equal(requests, 0);
  } finally { globalThis.fetch = original; }
});
test('Synthetic unexpanded table and absent bibliography do not trigger fetch or fabricate definitions', async () => {
  const { html, provenance } = await fixture('smll');
  const dom = new JSDOM(html); const { document } = dom.window;
  document.querySelector('.article-table-content table').remove();
  document.querySelector('.article-section__references').remove();
  const result = await clipWiley({ html: document.documentElement.outerHTML, url: provenance.url });
  assert.equal(result.tables[0].tableContentStatus, 'fallback-not-expanded');
  assert.ok(result.debug.warnings.some(w => w.includes('table cells not expanded')));
  assert.ok(result.debug.warnings.some(w => w.includes('reference definitions absent')));
  assert.doesNotMatch(result.markdown, /^\[\^\d+\]:/mu);
  assert.match(result.markdown, /Wiley table cells are absent/u);
});
