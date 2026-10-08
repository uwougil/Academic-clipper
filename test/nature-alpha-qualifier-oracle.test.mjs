import assert from 'node:assert/strict';
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
