import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { attachedQualifiers, isQualifiedMetricTex, normalizeQualifierRun } from './helpers/nature-alpha-qualifier-oracle.mjs';

const role = { literalBase: 'r.m.s.d.', script: 'subscript', value: '95' };
test('pure-string metric oracle accepts the whole base and exact grouped95', () => {
  for (const tex of ['r.m.s.d._{95}', '\\mathrm{r.m.s.d.}_{95}', '\\text{r.m.s.d.}_{95}', '\\mathit{r.m.s.d.}_{95}']) {
    assert.equal(isQualifiedMetricTex(tex), true);
    assert.equal(normalizeQualifierRun(tex), 'r.m.s.d._{95}');
    assert.deepEqual(attachedQualifiers(`$${tex}$`), [role]);
  }
  assert.deepEqual(attachedQualifiers('r.m.s.d.₉₅'), [role]);
});
test('pure-string metric oracle rejects split, ungrouped, extra and mismatched attachment', () => {
  for (const tex of ['\\mathrm{r.m.s.d.}_{9}5', 'r.m.s.d._95', 'r.m.s.d._{96}', 'r.m.s.d._{95}^{2}',
    'r.m.s.d.extra_{95}', '0.96 Å r.m.s.d._{95}', 'r.m.s.d._{95} 0.96 Å',
    'r.m.s.d._{9 5}', 'r.m.s.d. _{95}', 'r .m.s.d._{95}']) {
    assert.equal(isQualifiedMetricTex(tex), false, tex);
    assert.equal(normalizeQualifierRun(tex), tex, tex);
    assert.deepEqual(attachedQualifiers(`$${tex}$`), [], tex);
  }
  for (const value of ['r.m.s.d.$_{95}$', 'r.m.s.d.95', 'unknown$_{95}$']) assert.deepEqual(attachedQualifiers(value), []);
  assert.equal(isQualifiedMetricTex(undefined), false);
});
test('pure-string run comparison keeps separate inherited styled roles and complete order', () => {
  assert.deepEqual(['N_{res}', '\\mathrm{r.m.s.d.}_{95}', '_{95}', '\\mathrm{r.m.s.d.}_{9}5'].map(normalizeQualifierRun),
    ['N_res', 'r.m.s.d._{95}', '_95', '\\mathrm{r.m.s.d.}_{9}5']);
});
test('original same-run cache still has four missing source metric roles per dialect', async t => {
  // Optional evidence reuse only; this file never imports clip/parser/source tests.
  const root = process.env.NATURE_ALPHA_QUALIFIER_CACHE_ROOT;
  if (!root) { t.skip('External original cache not requested'); return; }
  for (const [style, expectedHash] of [
    ['markdown', '77f5d766925288ac85587df15f749c3696a3029d3bfbdc41291235e801817b1f'],
    ['links', 'df45f76c0282bee74292204cc2a9c212198794d8b1c5e61d96377929c9d44a7b'],
    ['quarto', 'cd2feb61e97f9bb7979ff2d9d51bf598a73ff98944b69a06bd5559afe0499199'],
  ]) {
    const bytes = await readFile(resolve(root, `${style}.actual-cache.json`));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedHash);
    const cached = JSON.parse(bytes);
    const paragraphs = cached.result.markdown.split('\n').filter(line => line.startsWith('In CASP14, AlphaFold structures were vastly more accurate'));
    assert.equal(paragraphs.length, 1);
    assert.equal(paragraphs[0].split('r.m.s.d.$_{95}$').length - 1, 4);
    assert.deepEqual(attachedQualifiers(paragraphs[0]), []);
  }
});
