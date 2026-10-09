// Test-only final-output oracle for the three independently reviewed source roles.
// This does not parse article DOM or create scientific runs.
import assert from 'node:assert/strict';

const expectedTex = ['Pb(OAc)_{4}', 'Fe_{2}(ox)_{3}', '(CD_{3})_{2}CO'];
const expectedUnicode = ['Pb(OAc)₄', 'Fe₂(ox)₃', '(CD₃)₂CO'];
const families = [/\(OAc\)/u, /\(ox\)/u, /\(CD(?:_|[₀-₉])/u];

function presentationOnly(tex) {
  // Only declared font/spacing equivalents; numeric grouping is never erased.
  return tex.replace(/\\(?:qquad|quad|[,;:!])\s*/gu, '')
    .replace(/\s+/gu, '')
    .replace(/\\(?:mathrm|text)\{([A-Za-z()]+)\}/gu, '$1')
    .replace(/\\left(?=\()/gu, '').replace(/\\right(?=\))/gu, '');
}

export function assertChemicalGroupFormula(context, index) {
  assert.ok(Number.isInteger(index) && index >= 0 && index < 3, 'Known reviewed source role');
  const family = families[index];
  const math = [...context.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)];
  const candidates = math.map(match => presentationOnly(match[1])).filter(atom => family.test(atom));
  // Unicode candidate identity includes every adjacent letter/number/mark/_ and
  // parenthesis, so ₄₀, extra prefix/suffix and variation marks cannot truncate.
  const outsideMath = context.replace(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu, ' ');
  const unicodeCandidates = [...outsideMath.matchAll(/[\p{L}\p{N}\p{M}_()]+/gu)]
    .map(match => match[0]).filter(token => family.test(token));
  assert.equal(candidates.length + unicodeCandidates.length, 1,
    'Exactly one complete source formula; duplicate or split roles are rejected');
  if (candidates.length) assert.equal(candidates[0], expectedTex[index],
    'Whole math atom preserves grouped counts, complete prefix, inner count and suffix');
  else assert.equal(unicodeCandidates[0], expectedUnicode[index],
    'Whole Unicode token preserves all counts, prefix, inner count and suffix');
}
