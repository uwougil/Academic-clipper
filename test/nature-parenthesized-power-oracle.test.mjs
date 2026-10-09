// NEW pure-string controls only. No source fixture, production, DOM or clip import.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {completeParenthesizedSquare, completeOrderedParenthesizedSquares} from './support/parenthesized-power-oracle.mjs';

for (const base of ['(5/60)', '(0.19/60/60)']) {
  const valid = [
    ['source-equivalent outside math', `π$${base}^{2}$/8`],
    ['complete TeX atom', `$\\pi${base}^{2}/8$`],
    ['complete glyph atom', `$π${base}^{2}/8$`],
    ['inside pi and outside divisor', `$π${base}^{2}$/8`],
    ['outside pi and inside divisor', `π$${base}^{2}/8$`],
    ['known presentation whitespace and left/right', `$\\pi \\left${base.slice(0,-1)}\\right) ^{ 2 } / 8$`],
    ['whole Unicode square', `π${base}²/8`],
    ['whole Unicode square inside atom', `$π${base}²/8$`],
  ];
  for (const [name, text] of valid) test(`NEW shared source oracle accepts ${name}: ${base}`, () => assert.ok(completeParenthesizedSquare(text, {base}), text));
  const invalid = [
    ['extra digit after square', `π$${base}^{2}2$/8`],
    ['extra operator and term', `π$${base}^{2}+3$/8`],
    ['duplicate inside one atom', `π$${base}^{2}+${base}^{2}$/8`],
    ['good plus malformed companion', `π$${base}^{2}$/8; π$${base}^{2}2$/8`],
    ['duplicate across atoms', `π$${base}^{2}$/8; π$${base}^{2}$/8`],
    ['orphan after plain base', `π${base}$^{2}$/8`],
    ['wrong exponent grouping', `π$${base}^{2/8}$`],
    ['missing exponent grouping', `π$${base}^2$/8`],
    ['base includes outside divisor', `$π(${base.slice(1,-1)}/8)^{2}$`],
    ['pi enters squared base', `$\u03c0(${base})^{2}/8$`],
    ['wrong pi prefix', `q$${base}^{2}$/8`],
    ['missing pi', `$${base}^{2}$/8`],
    ['wrong divisor', `π$${base}^{2}$/9`],
    ['missing divisor', `π$${base}^{2}$`],
    ['extra digit on outside divisor', `π$${base}^{2}$/88`],
    ['extra slash outside divisor', `π$${base}^{2}$/8/2`],
    ['plain malformed companion is counted', `π$${base}^{2}$/8; π${base}/8`],
    ['Unicode plus malformed exponent', `π${base}²/8; π${base}³/8`],
  ];
  for (const [name, text] of invalid) test(`NEW shared source oracle rejects ${name}: ${base}`, () => assert.equal(completeParenthesizedSquare(text, {base}), null, text));
  for (const [name, value] of [['letter','x'], ['number','9'], ['mark','\u0301'], ['underscore','_'], ['astral letter','\u{10400}'], ['astral number','\u{1D7D9}']]) {
    for (const text of [`${value}π${base}²/8`, `π${base}²/8${value}`]) test(`NEW Unicode whole-square rejects ${name} boundary: ${base} ${text}`, () => assert.equal(completeParenthesizedSquare(text, {base}), null));
  }
}
test('NEW actual shared helper permits both ordered roles among four S variables and integer control', () => {
  const context = '$S_{source}$ and $S_{offset}$, π$(5/60)^{2}$/8 steradians; $S_{offset}$ then $S_{source}$, $\\pi(0.19/60/60)^{2}/8$ Sr, $10^{−6}$.';
  const first = completeParenthesizedSquare(context, {base:'(5/60)'}), second = completeParenthesizedSquare(context, {base:'(0.19/60/60)'});
  assert.ok(first); assert.ok(second); assert.ok(first.index < second.index);
  assert.deepEqual(completeOrderedParenthesizedSquares(context, [{base:'(5/60)'}, {base:'(0.19/60/60)'}]), [first, second]);
});
test('NEW duplicate first role cannot substitute for missing second role', () => {
  const context = 'π$(5/60)^{2}$/8; π$(5/60)^{2}$/8.';
  assert.equal(completeParenthesizedSquare(context, {base:'(5/60)'}), null);
  assert.equal(completeParenthesizedSquare(context, {base:'(0.19/60/60)'}), null);
});
test('NEW one atom cannot hide both source roles behind substring inclusion', () => {
  const context = '$π(5/60)^{2}/8+π(0.19/60/60)^{2}/8$';
  assert.equal(completeParenthesizedSquare(context, {base:'(5/60)'}), null);
  assert.equal(completeParenthesizedSquare(context, {base:'(0.19/60/60)'}), null);
});
test('NEW ordered source oracle rejects reversed whole roles without changing either value', () => {
  assert.equal(completeOrderedParenthesizedSquares('π$(0.19/60/60)^{2}$/8; π$(5/60)^{2}$/8.', [{base:'(5/60)'}, {base:'(0.19/60/60)'}]), null);
});
