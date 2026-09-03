import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import path from 'node:path';
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
  assert.equal(result.figures.length, 2);
  assert.equal(result.references.length, 1);
  assert.equal(result.debug.equations, 1);
  assert.ok(!result.cleanedHtml.includes('Rights and permissions'));
});

test('Nature clipping preserves headings, TeX, figures, citations, and references', async () => {
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  assert.match(result.markdown, /^---\ntitle: "Fixture title"/);
  assert.match(result.markdown, /# Fixture title/);
  assert.match(result.markdown, /## Abstract/);
  assert.match(result.markdown, /## Methods/);
  assert.match(result.markdown, /\$\\+mathbf\{k\}\$/);
  assert.match(result.markdown, /\$\$\n?E=mc\^2\n?\$\$/);
  assert.match(result.markdown, /## Figure 1/);
  assert.match(result.markdown, /## Extended Data Figure 1/);
  assert.match(result.markdown, /\[1\]/);
  assert.match(result.markdown, /1\. Lovelace, A\./);
  assert.match(result.markdown, /doi:10\.1000\/test/);
  assert.doesNotMatch(result.markdown, /Cookie banner|Nature navigation|Rights and permissions|\\\(/);
});
