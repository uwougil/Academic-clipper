import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { clipNature } from '../src/clip.mjs';
import { articleIdFromUrl, isNatureUrl, parseNaturePage } from '../src/adapters/nature.mjs';

const fixturePath = new URL('./fixtures/nature-minimal.html', import.meta.url);
const fixtureHtml = await readFile(fixturePath, 'utf8');
const noIdFixturePath = new URL('./fixtures/nature-no-id-figures.html', import.meta.url);
const noIdFixtureHtml = await readFile(noIdFixturePath, 'utf8');
const fixtureUrl = 'https://www.nature.com/articles/s41586-026-10401-1';

test('Nature URL and article id detection are scoped to Nature articles', () => {
  assert.equal(isNatureUrl(fixtureUrl), true);
  assert.equal(isNatureUrl('https://example.org/articles/test'), false);
  assert.equal(articleIdFromUrl(fixtureUrl), 's41586-026-10401-1');
});

test('Nature adapter extracts structured metadata and scholarly nodes', () => {
  const result = parseNaturePage(fixtureHtml, fixtureUrl);
  assert.equal(result.metadata.title, 'Fixture title');
  assert.deepEqual(result.metadata.authors, ['Ada Lovelace', 'Alan Turing']);
  assert.equal(result.metadata.doi, '10.1038/s41586-026-10401-1');
  assert.equal(result.figures.length, 3);
  assert.equal(result.figures[2].id, 'Fig6');
  assert.equal(result.figures[2].label, 'Extended Data Figure 3');
  assert.equal(result.figures[0].imageUrl, 'https://example.org/fig1-high.png');
  assert.equal(result.tables.length, 1);
  assert.equal(result.references.length, 3);
  assert.equal(result.debug.equations, 2);
  assert.equal(result.tables[0].label, 'Extended Data Table 1');
  assert.ok(!result.cleanedHtml.includes('Rights and permissions'));
});

test('Nature clipping preserves headings, TeX, figures, citations, and references', async () => {
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  assert.match(result.markdown, /^---\ntitle: "Fixture title"/);
  assert.match(result.markdown, /# Fixture title/);
  assert.match(result.markdown, /## Abstract/);
  assert.match(result.markdown, /## Methods/);
  assert.match(result.markdown, /\$\\mathbf\{k\}\$/);
  assert.match(result.markdown, /\$\{P\}\^\{-1\}\{6\}_\{3\}\/\{m\}\^\{1\}\$/);
  assert.match(result.markdown, /\$P\{?\_\{\\mathrm\{spin\}\}\}?\$/);
  assert.match(result.markdown, /\$T_\{c\}\^\{0\}\$/);
  assert.match(result.markdown, /\$P_\{\\mathrm\{spin\}\}\^\{-1\}\$/);
  assert.match(result.markdown, /Mn\$_\{3\}\$/);
  assert.match(result.markdown, /\*\*Figure 1\.\*\* Magnetic response of Mn\$_\{3\}\$Ge with \$P_\{\\mathrm\{spin\}\}\^\{-1\}\$ and \$\\lambda_0\$\./);
  assert.match(result.markdown, /Directions \[100\], \[210\] and \[001\] are plain text/);
  assert.match(result.markdown, /\[111\]-strained/);
  assert.doesNotMatch(result.markdown, /\$\$\n(?:100|210|001)\n\$\$/);
  assert.match(result.markdown, /\$\$\nE=mc\^2\n\$\$/);
  assert.match(result.markdown, /\$\$\n\\begin\{array\}\{c\}a_i \\\\ b_j\\end\{array\}\n\$\$/);
  assert.match(result.markdown, /<a id="figure-1"><\/a>\n!\[Figure 1\]/);
  assert.match(result.markdown, /## Extended Data\n\n<a id="extended-data-figure-1"><\/a>/);
  assert.match(result.markdown, /\[\^1\]\[\^2\]\[\^3\]/);
  assert.match(result.markdown, /\[Figure 1\]\(#figure-1\)/);
  assert.match(result.markdown, /\[Extended Data Fig\. 3\]\(#extended-data-figure-3\)/);
  assert.match(result.markdown, /\[Table 1\]\(#table-1\)/);
  assert.match(result.markdown, /\[Equation \(2\)\]\(#equation-2\)/);
  assert.match(result.markdown, /^\[\^1\]: Lovelace, A\./m);
  assert.match(result.markdown, /doi:10\.1000\/test/);
  assert.match(result.markdown, /https:\/\/doi\.org\/10\.1000\/test/);
  assert.doesNotMatch(result.markdown, /https:\/\/doi\.org\/[^\n]*%2F/);
  assert.doesNotMatch(result.markdown, /<a id="section-/);
  assert.doesNotMatch(result.markdown, /<a id="ref-/);
  assert.doesNotMatch(result.markdown, /\]\(#ref-/);
  assert.doesNotMatch(result.markdown, /Cookie banner|Nature navigation|Rights and permissions|\\\(/);
  assert.doesNotMatch(result.markdown, /<sub\b|<sup\b|<i\b/);
  assert.equal((result.markdown.match(/^## References\s*$/gm) || []).length, 1);
  assert.equal((result.markdown.match(/^\[\^\d+\]:/gm) || []).length, 3);
  assert.equal((result.markdown.match(/Extended caption\./g) || []).length, 1);
  assert.ok(result.markdown.indexOf('Paragraph A') < result.markdown.indexOf('<a id="figure-1">'));
  assert.ok(result.markdown.indexOf('<a id="figure-1">') < result.markdown.indexOf('Paragraph B'));
  assert.doesNotMatch(result.markdown, /^## (?:Figure|Extended Data Figure)\b/gm);
  assert.doesNotMatch(result.markdown, /\*\*Figure 1\.\*\*[^\n]+\*\*$/);
});

test('Nature clipping fails closed when the page is not an article body', async () => {
  await assert.rejects(
    () => clipNature({ html: '<html><head><title>Consent wall</title></head><body><p>Not an article</p></body></html>', url: fixtureUrl }),
    /article body was not found/,
  );
});

test('Nature adapter maps id-less figures by unique DOM identity', async () => {
  const result = await clipNature({ html: noIdFixtureHtml, url: 'https://www.nature.com/articles/no-id-figures' });
  assert.deepEqual(result.figures.map((figure) => figure.id), ['', '']);
  assert.deepEqual(result.figures.map((figure) => figure.anchor), ['figure-1', 'figure-2']);
  assert.ok(result.markdown.indexOf('no-id-one.png') < result.markdown.indexOf('no-id-two.png'));
  assert.equal((result.markdown.match(/<a id="figure-[12]"><\/a>/g) || []).length, 2);
  assert.equal((result.markdown.match(/!\[Figure [12]\]/g) || []).length, 2);
});
