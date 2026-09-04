import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { clipNature } from '../src/clip.mjs';
import { articleIdFromUrl, isNatureUrl, parseNaturePage } from '../src/adapters/nature.mjs';

const fixturePath = new URL('./fixtures/nature-minimal.html', import.meta.url);
const fixtureHtml = await readFile(fixturePath, 'utf8');
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
  assert.match(result.markdown, /Mn\$_\{3\}\$/);
  assert.match(result.markdown, /Directions \[100\], \[210\] and \[001\] are plain text/);
  assert.match(result.markdown, /\[111\]-strained/);
  assert.doesNotMatch(result.markdown, /\$\$\n(?:100|210|001)\n\$\$/);
  assert.match(result.markdown, /\$\$\nE=mc\^2\n\$\$/);
  assert.match(result.markdown, /\$\$\n\\begin\{array\}\{c\}a_i \\\\ b_j\\end\{array\}\n\$\$/);
  assert.match(result.markdown, /## Figure 1/);
  assert.match(result.markdown, /## Extended Data Figure 1/);
  assert.match(result.markdown, /\[1\]\(#ref-1\), \[2\]\(#ref-2\), \[3\]\(#ref-3\)/);
  assert.match(result.markdown, /\[Figure 1\]\(#figure-1\)/);
  assert.match(result.markdown, /\[Extended Data Fig\. 3\]\(#extended-data-figure-3\)/);
  assert.match(result.markdown, /\[Table 1\]\(#table-1\)/);
  assert.match(result.markdown, /\[Equation \(2\)\]\(#equation-2\)/);
  assert.match(result.markdown, /1\. Lovelace, A\./);
  assert.match(result.markdown, /doi:10\.1000\/test/);
  assert.doesNotMatch(result.markdown, /Cookie banner|Nature navigation|Rights and permissions|\\\(/);
  assert.doesNotMatch(result.markdown, /<sub\b|<sup\b|<i\b/);
  assert.equal((result.markdown.match(/^## References\s*$/gm) || []).length, 1);
  assert.ok(result.markdown.indexOf('Paragraph A') < result.markdown.indexOf('## Figure 1'));
  assert.ok(result.markdown.indexOf('## Figure 1') < result.markdown.indexOf('Paragraph B'));
  assert.doesNotMatch(result.markdown, /## Figure 6/);
});
