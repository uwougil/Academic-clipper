import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { aaasArticleIdentity, clipAaas, parseAaasPage } from '../src/adapters/aaas.mjs';

const directory = new URL('./fixtures/aaas/', import.meta.url);
const fixture = id => readFile(new URL(`${id}.excerpt.html`, directory), 'utf8');
const url = id => `https://www.science.org/doi/10.1126/${id}`;
const sources = [
  ['science.abj6987', 'The complete sequence of a human genome', 'Science', '2022-03-31', 100, 106, 5, 1],
  ['science.aaa9297', 'Discovery of a Weyl fermion semimetal and topological Fermi arcs', 'Science', '2015-07-16', 21, 32, 4, 0],
  ['sciadv.1700434', 'Morphology controls the thermoelectric power factor of a doped semiconducting polymer', 'Science Advances', '2017-06-16', 7, 69, 7, 1],
  ['sciadv.1602536', 'Mechanical deformation induces depolarization of neutrophils', 'Science Advances', '2017-06-14', 9, 59, 5, 0],
];

test('AAAS URL identity is limited to the two inspected journals', () => {
  assert.equal(aaasArticleIdentity(url('science.aaa9297')).journal, 'Science');
  for (const candidate of ['http://www.science.org/doi/10.1126/science.aaa9297', 'https://science.org/doi/10.1126/science.aaa9297', 'https://www.science.org.evil.test/doi/10.1126/science.aaa9297', 'https://www.science.org/doi/10.1126/scirobotics.test', 'https://user@www.science.org/doi/10.1126/science.aaa9297', 'https://www.science.org:123/doi/10.1126/science.aaa9297']) assert.equal(aaasArticleIdentity(candidate), null);
});

test('source excerpt integrity and absence of executable/session state', async () => {
  const provenance = JSON.parse(await readFile(new URL('provenance.json', directory), 'utf8'));
  for (const item of provenance) {
    const html = await fixture(item.id);
    assert.equal(createHash('sha256').update(html).digest('hex'), item.fixtureSha256);
    const document = new JSDOM(html).window.document;
    assert.equal(document.querySelectorAll('script:not([type="application/ld+json"]),iframe,form,input').length, 0);
    for (const node of document.querySelectorAll('*')) for (const attr of node.attributes) assert.ok(!/^on/i.test(attr.name));
    assert.equal(item.captureMode.includes('no HTTP-byte digest'), true);
    for (const block of item.retainedBlocks) assert.equal(createHash('sha256').update(document.querySelector(block.locator).outerHTML).digest('hex'), block.sha256);
  }
});

for (const [id, title, journal, date, authors, references, figures, tables] of sources) {
  test(`${id}: exact source metadata, authors, structures and all output dialects`, async () => {
    const html = await fixture(id);
    const source = new JSDOM(html).window.document;
    const expectedAuthors = [...source.querySelectorAll('meta[name="dc.Creator"]')].map(n => n.content);
    for (const citationStyle of ['markdown', 'links', 'quarto']) {
      const result = await clipAaas({ html, url: url(id), citationStyle });
      assert.equal(result.metadata.title, title);
      assert.equal(result.metadata.doi, `10.1126/${id}`);
      assert.equal(result.metadata.journal, journal);
      assert.equal(result.metadata.date, date);
      assert.equal(result.metadata.authors.length, authors);
      assert.deepEqual(result.metadata.authors, expectedAuthors);
      assert.equal(result.references.length, references);
      assert.equal(result.figures.length, figures);
      assert.equal(result.tables.length, tables);
      assert.ok(result.metadata.authorInformation.affiliations.length);
      assert.match(result.markdown, /## Abstract/);
      const abstract = source.querySelector('#abstract [role="paragraph"]')?.textContent;
      assert.ok(abstract);
      assert.ok(result.markdown.includes(abstract.slice(0, 55)));
      assert.match(result.markdown, /## Supplementary Material/);
      assert.match(result.markdown, /https:\/\/www\.science\.org\/doi\/suppl\/10\.1126\//);
      assert.match(result.markdown, /Acknowledgments/);
      assert.doesNotMatch(result.markdown, /OPEN IN VIEWER|SIGN UP FOR|GO TO REFERENCE|Submit a Response to This Article|eLetters is a forum|Authors Info & Affiliations|ACADEMICCLIPPER|No alternative text available/);
      for (const name of ['mathValidation', 'markdownStructure', 'rawHtmlValidation', 'crossReferenceValidation']) assert.equal(result.debug[name].valid, true, name);
      assert.equal((result.markdown.match(/^## References$/gm) || []).length, 1);
      if (citationStyle === 'markdown') assert.equal((result.markdown.match(/^\[\^\d+\]:/gm) || []).length, references);
      if (citationStyle === 'quarto') assert.match(result.markdown, /\{#fig-figure-1\}/);
    }
  });
}

test('source Science MathML is inline and the real 1–3 citation cluster expands', async () => {
  const result = await clipAaas({ html: await fixture('science.aaa9297'), url: url('science.aaa9297') });
  assert.equal(result.debug.mathAudit.length, 43);
  assert.ok(result.debug.mathAudit.every(n => !n.display && n.source.includes('MathML')));
  assert.match(result.markdown, /\$C_\{4 v\}\$/);
  assert.match(result.markdown, /\[\^1\]\[\^2\]\[\^3\]/);
  assert.match(result.figures[0].captionMarkdown, /Theoretically calculated band structure/);
  assert.ok(result.markdown.indexOf('Tantalum arsenide') < result.markdown.indexOf('![Figure 1]'));
});

test('source Advances display math, table hidden rows/spans and author notes survive', async () => {
  const result = await clipAaas({ html: await fixture('sciadv.1700434'), url: url('sciadv.1700434') });
  assert.equal(result.debug.mathAudit.length, 1);
  assert.equal(result.debug.mathAudit[0].display, true);
  assert.match(result.debug.mathAudit[0].tex, /\\int.*\\frac.*\\partial/);
  assert.match(result.markdown, /\$\$\n\\alpha =/);
  assert.match(result.tables[0].markdown, /220\.00 ± 0\.02/);
  assert.match(result.tables[0].markdown, /36 ± 3/);
  assert.equal(result.tables[0].markdown.split('\n').length, 10);
  assert.match(result.tables[0].markdown, /\$10\^\{−3\}\$/);
  assert.match(result.figures[0].captionMarkdown, /Solution and vapor doping routes/);
  assert.match(result.markdown, /## Author notes/);
  assert.equal(result.metadata.authorInformation.correspondence.email, 'mailto:mchabinyc@engineering.ucsb.edu');
});

test('actual subscription body root fails closed', async () => {
  const denied = await fixture('science.adv0235');
  assert.match(denied, /id="bodymatter"/);
  await assert.rejects(() => clipAaas({ html: denied, url: url('science.adv0235') }), /unavailable/);
});

test('source genome data/code links and separate supplementary reference range survive', async () => {
  const result = await clipAaas({ html: await fixture('science.abj6987'), url: url('science.abj6987') });
  assert.match(result.markdown, /https:\/\/github\.com\/marbl\/CHM13/);
  assert.match(result.markdown, /https:\/\/github\.com\/snurk\/sg_sandbox/);
  assert.match(result.markdown, /References \(62–128\)/);
  assert.ok(result.debug.warnings.some(n => n.includes('Supplementary citation range')));
  assert.equal(result.references.at(-1).number, 106);
  assert.doesNotMatch(result.markdown, /\[\^128\]/);
  assert.equal(result.metadata.dates.dcDate, '2022-04-01');
  assert.equal(result.metadata.date, '2022-03-31');
});

// Synthetic mutations of source excerpts are explicitly separate from source coverage.
test('synthetic identity mismatch, incomplete references and unloaded body rejection', async () => {
  const html = await fixture('sciadv.1700434');
  await assert.rejects(() => parseAaasPage(html, url('science.aaa9297')), /DOI metadata/);
  await assert.rejects(() => parseAaasPage('<html><body>Checking your browser</body></html>', url('sciadv.1700434')), /unavailable/);
  const dom = new JSDOM(html);
  dom.window.document.querySelector('#R1').closest('.biblioentry').remove();
  await assert.rejects(() => parseAaasPage(dom.serialize(), url('sciadv.1700434')), /sequential reference/);
  const partial = new JSDOM(html);
  partial.window.document.querySelector('#R69').closest('.biblioentry').remove();
  partial.window.document.querySelector('#bodymatter [role="paragraph"]').insertAdjacentHTML('beforeend', '<a role="doc-biblioref" data-xml-rid="R69" href="#core-collateral-R69">69</a>');
  await assert.rejects(() => parseAaasPage(partial.serialize(), url('sciadv.1700434')), /citation references are missing/);
});

test('AAAS deterministic offline clipping performs no fetch and removes synthetic UI', async () => {
  const source = new JSDOM(await fixture('sciadv.1700434'));
  source.window.document.querySelector('#bodymatter').insertAdjacentHTML('afterbegin', '<nav>synthetic-navigation</nav><form>synthetic-login</form><div class="newsletter">synthetic-newsletter</div>');
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Undeclared AAAS network call'); };
  try {
    const input = { html: source.serialize(), url: url('sciadv.1700434') };
    const first = await clipAaas(input);
    const second = await clipAaas(input);
    assert.equal(first.markdown, second.markdown);
    assert.deepEqual(first.debug, second.debug);
    assert.doesNotMatch(first.markdown, /synthetic-navigation|synthetic-login|synthetic-newsletter/);
  } finally { globalThis.fetch = originalFetch; }
});

test('synthetic missing table cells retain fallback and rendered-only math is rejected', async () => {
  const dom = new JSDOM(await fixture('sciadv.1700434'));
  dom.window.document.querySelector('#T1 table').remove();
  const result = await clipAaas({ html: dom.serialize(), url: url('sciadv.1700434') });
  assert.equal(result.tables[0].tableContentStatus, 'fallback-no-html');
  assert.match(result.markdown, /AAAS table cells were not exposed/);
  assert.match(result.markdown, /https:\/\/www\.science\.org\/doi\/10\.1126\/sciadv\.1700434#T1/);
  const mathDom = new JSDOM(await fixture('sciadv.1700434'));
  mathDom.window.document.querySelector('#E1 math').remove();
  await assert.rejects(() => clipAaas({ html: mathDom.serialize(), url: url('sciadv.1700434') }), /no retained MathML/);
});

test('synthetic same-article section/equation links reuse observed source targets', async () => {
  const dom = new JSDOM(await fixture('sciadv.1602536'));
  const paragraph = dom.window.document.querySelector('#bodymatter [role="paragraph"]');
  paragraph.insertAdjacentHTML('beforeend', '<a href="#sec-1">Introduction</a> <a href="#E1">Equation (1)</a> <a href="https://example.org/data#E1">data</a>');
  for (const citationStyle of ['markdown', 'links', 'quarto']) {
    const result = await clipAaas({ html: dom.serialize(), url: url('sciadv.1602536'), citationStyle });
    assert.match(result.markdown, /\[data\]\(https:\/\/example\.org\/data#E1\)/);
    if (citationStyle === 'quarto') {
      assert.match(result.markdown, /\[Equation \(1\)\]\(#eq-equation-1\)/);
      assert.match(result.markdown, /\[Introduction\]\(#sec-introduction\)/);
    } else if (citationStyle === 'markdown') {
      assert.match(result.markdown, /\[Introduction\]\(#introduction\)/);
      assert.doesNotMatch(result.markdown, /\[Equation \(1\)\]\(#/);
    }
  }
});
