// Explicit synthetic DOM controls; no real article, admission or source oracle.
import assert from 'node:assert/strict';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {writeFile} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after, test} from 'node:test';
import {pathToFileURL} from 'node:url';

const attempts = [], observations = [], windows = new Set();
const original = {fetch: globalThis.fetch, lookup: dns.lookup, promiseLookup: dnsPromises.lookup};
const domKeys = ['window', 'document', 'DOMParser', 'XMLSerializer', 'Node', 'NodeFilter', 'HTMLElement', 'Element', 'SVGElement', 'Document'];
const domSnapshot = domKeys.map(key => ({key, descriptor: Object.getOwnPropertyDescriptor(globalThis, key)}));
globalThis.fetch = async (...args) => {attempts.push({kind: 'HTTP', target: String(args[0])}); throw new Error('Unexpected numeric-parenthesis HTTP');};
dns.lookup = (...args) => {attempts.push({kind: 'DNS', target: String(args[0])}); throw new Error('Unexpected numeric-parenthesis DNS');};
dnsPromises.lookup = async (...args) => {attempts.push({kind: 'DNS-promise', target: String(args[0])}); throw new Error('Unexpected numeric-parenthesis DNS');};
syncBuiltinESMExports();
after(async () => {
  let closedWindows = 0;
  try {for (const window of windows) {window.close(); closedWindows += 1;}}
  finally {
    globalThis.fetch = original.fetch; dns.lookup = original.lookup; dnsPromises.lookup = original.promiseLookup;
    syncBuiltinESMExports();
    for (const {key, descriptor} of domSnapshot) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
  const lifecycle = {attempts, parses: windows.size, closedWindows, clips: 0, sourceReads: 0, sourceAudits: 0,
    restoredNetworkBindings: globalThis.fetch === original.fetch && dns.lookup === original.lookup && dnsPromises.lookup === original.promiseLookup,
    restoredDomDescriptors: domSnapshot.every(({key, descriptor}) => {
      const value = Object.getOwnPropertyDescriptor(globalThis, key);
      return descriptor ? value?.value === descriptor.value && value?.get === descriptor.get && value?.set === descriptor.set
        && value?.writable === descriptor.writable && value?.enumerable === descriptor.enumerable && value?.configurable === descriptor.configurable : !value;
    })};
  if (process.env.NUMERIC_PARENTHESIS_RECEIPT) await writeFile(process.env.NUMERIC_PARENTHESIS_RECEIPT,
    JSON.stringify({version: 'numeric-parenthesis-synthetic/1.0', implementationRoot: process.env.NUMERIC_PARENTHESIS_SNAPSHOT_ROOT || 'current checkout', observations, lifecycle}, null, 2) + '\n');
  assert.deepEqual(attempts, [], 'Record-before-throw ledger also detects swallowed transport errors');
  assert.equal(lifecycle.restoredNetworkBindings, true); assert.equal(lifecycle.restoredDomDescriptors, true);
  assert.equal(closedWindows, windows.size);
});
// Hooks precede lazy production import; no top-level source parsing or clips.
const implementation = process.env.NUMERIC_PARENTHESIS_SNAPSHOT_ROOT
  ? pathToFileURL(`${process.env.NUMERIC_PARENTHESIS_SNAPSHOT_ROOT}/src/adapters/nature.mjs`)
  : new URL('../src/adapters/nature.mjs', import.meta.url);
const {parseNaturePage} = await import(implementation.href);
const url = 'https://www.nature.com/articles/synthetic-numeric-parenthesis';
const first = '(5/60)^{2}', second = '(0.19/60/60)^{2}';
function observe(id, body, expected, checks = () => {}) {
  const observation = {id, synthetic: true, expected, status: 'HARNESS_ERROR'};
  try {
    const page = parseNaturePage(`<!doctype html><html><head><title>Synthetic numeric-parenthesis control</title></head><body><div class="c-article-body">${body}</div></body></html>`, url);
    windows.add(page.dom.window);
    observation.scientificRuns = page.semantic.scientificRuns.map(({marker, tex}) => ({marker, tex}));
    observation.inlineMath = page.semantic.inlineMath.map(({marker, tex}) => ({marker, tex}));
    observation.citations = page.semantic.citations.map(({marker, numbers}) => ({marker, numbers}));
    observation.cleanedHtml = page.cleanedHtml;
    assert.deepEqual(observation.scientificRuns, expected.map((tex, index) => ({marker: `ACADEMICCLIPPERSCIENTIFICRUN${index}X`, tex})), 'Entire ordered scientific registry, including inherited controls');
    for (const {marker} of observation.scientificRuns) assert.equal(page.cleanedHtml.split(marker).length - 1, 1, 'Exactly one DOM owner per complete typed run');
    checks(page); observation.status = 'PASS';
  } catch (error) {
    observation.error = {name: error.name, message: error.message, stack: error.stack};
    observation.status = error instanceof assert.AssertionError ? 'CONTRACT_RED' : 'HARNESS_ERROR'; throw error;
  } finally {observations.push(observation);}
}
const positive = [
  ['source-shaped integer fraction with outside pi and divisor', 'π(5/60)<sup>2</sup>/8', first],
  ['source-shaped decimal and two divisors', 'π(0.19/60/60)<sup>2</sup>/8', second],
  ['same grammar independent of source digits', '(3/12)<sup>2</sup>', '(3/12)^{2}'],
  ['decimal numerator and changed outside divisor', 'π(0.25/12/30)<sup>2</sup>/3', '(0.25/12/30)^{2}'],
  ['zero numerator is a numeric base', '(0/60)<sup>2</sup> ', '(0/60)^{2}'],
  ['ordinary prose separation remains outside', 'Example: (5/60)<sup>2</sup> units', first],
  ['independent direct typed citation', '(5/60)<sup>2</sup><sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>', first],
];
for (const [name, html, tex] of positive) test(`synthetic positive: ${name}`, () => observe(name, `<p>${html}</p>`, [tex], page => {
  if (name.startsWith('independent')) assert.deepEqual(page.semantic.citations.map(c => c.numbers), [[1]]);
}));
const negative = [
  ['unknown parenthesized prose', '(words)<sup>2</sup>'],
  ['operators are outside this fraction grammar', '(5+60)<sup>2</sup>'],
  ['signed numerator is outside this contract', '(-5/60)<sup>2</sup>'],
  ['zero denominator is not a valid fraction', '(5/0)<sup>2</sup>'],
  ['decimal denominator is outside the source grammar', '(5/0.60)<sup>2</sup>'],
  ['third slash is outside the bounded family', '(5/60/60/60)<sup>2</sup>'],
  ['nested numeric parentheses', '((5/60))<sup>2</sup>'],
  ['unbalanced numeric parentheses', '(5/60<sup>2</sup>'],
  ['internal whitespace is not inferred', '(5 /60)<sup>2</sup>'],
  ['different exponent belongs to a different contract', '(5/60)<sup>3</sup>'],
  ['wrapped exponent is unknown topology', '(5/60)<sup><span>2</span></sup>'],
  ['split exponent topology', '(5/60)<sup>2</sup><sup>3</sup>'],
  ['subscript continuation is ambiguous', '(5/60)<sup>2</sup><sub>1</sub>'],
  ['space before exponent is not native attachment', '(5/60) <sup>2</sup>'],
  ['comment before exponent breaks immediate ownership', '(5/60)<!--boundary--><sup>2</sup>'],
  ['split base wrapper is not flattened', '(5/<span>60</span>)<sup>2</sup>'],
  ['unknown left node continues a token', '<span>x</span>(5/60)<sup>2</sup>'],
  ['unknown left comment is not a lexical boundary', '<!--x-->(5/60)<sup>2</sup>'],
  ['unknown right node continues a token', '(5/60)<sup>2</sup><span>x</span>'],
  ['empty right wrapper is not skipped', '(5/60)<sup>2</sup><span></span>'],
  ['unknown right comment is not skipped', '(5/60)<sup>2</sup><!--x-->'],
  ['code ancestor is opaque', '<code>(5/60)<sup>2</sup></code>'],
  ['literal dollar context is opaque', '$(5/60)<sup>2</sup>$'],
  ['literal backtick context is opaque', '`(5/60)<sup>2</sup>`'],
  ['fenced code cue is opaque', '~~~\n(5/60)<sup>2</sup>\n~~~'],
  ['typed citation exponent is not a square', '(5/60)<sup><a data-test="citation-ref" href="#ref-CR2">2</a></sup>'],
];
for (const [kind, value] of [['letter', 'x'], ['number', '9'], ['mark', '\u0301'], ['underscore', '_'], ['astral letter', '\u{10400}'], ['astral number', '\u{1D7D9}']]) {
  negative.push([`${kind} left boundary`, `${value}(5/60)<sup>2</sup>`]);
  negative.push([`${kind} right boundary`, `(5/60)<sup>2</sup>${value}`]);
}
negative.push(['pi is not a word-boundary escape', 'xπ(5/60)<sup>2</sup>/8']);
for (const [name, html] of negative) test(`synthetic exclusion: ${name}`, () => observe(name, `<p>${html}</p>`, [], page => {
  if (name.startsWith('typed citation')) assert.deepEqual(page.semantic.citations.map(c => c.numbers), [[2]]);
}));
test('synthetic MathML integration point preserves its opaque ancestor', () => observe('MathML ancestor',
  '<math><mtext><p id="math-context">(5/60)<sup>2</sup></p></mtext></math>', [], page => {
    const paragraph = page.document.querySelector('#math-context'); assert.ok(paragraph);
    assert.equal(paragraph.closest('math')?.namespaceURI, 'http://www.w3.org/1998/Math/MathML');
    assert.equal(paragraph.querySelector('sup')?.textContent, '2');
  }));
test('synthetic MathJax keeps its independent typed identity', () => observe('MathJax identity',
  '<p><span class="mathjax-tex">\\((5/60)^{2}\\)</span></p>', [], page => {
    assert.deepEqual(page.semantic.inlineMath.map(({marker, tex}) => ({marker, tex})), [{marker: 'ACADEMICCLIPPERINLINEMATH0X', tex: first}]);
    assert.equal(page.cleanedHtml.split('ACADEMICCLIPPERINLINEMATH0X').length - 1, 1);
  }));
test('synthetic mixed body and caption preserve all registry positions, pi, divisors and citations', () => observe('mixed complete registry',
  '<p id="mixed-body"><i>x</i><sub>2</sub>; mScm<sup>−1</sup>; 10<sup>−6</sup>; <span class="mathjax-tex">\\(q\\)</span><sub>1</sub>; π(5/60)<sup>2</sup>/8; (3/12)<sup>2</sup><sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>.</p>'
  + '<figcaption id="mixed-caption">π(0.19/60/60)<sup>2</sup>/8; (5/60)<sup>2</sup><a data-test="citation-ref" href="#ref-CR2">2</a>.</figcaption>',
  ['x_{2}', '\\mathrm{mS}\\,\\mathrm{cm}^{-1}', '10^{−6}', 'q_{1}', first, '(3/12)^{2}', second, first], page => {
    assert.deepEqual(page.semantic.inlineMath.map(({marker, tex}) => ({marker, tex})), [{marker: 'ACADEMICCLIPPERINLINEMATH0X', tex: 'q'}]);
    assert.deepEqual(page.semantic.citations.map(({marker, numbers}) => ({marker, numbers})), [
      {marker: 'ACADEMICCLIPPERCITATION0X', numbers: [1]}, {marker: 'ACADEMICCLIPPERCITATION1X', numbers: [2]}]);
    assert.equal(page.document.querySelector('#mixed-body').textContent, 'ACADEMICCLIPPERSCIENTIFICRUN0X; ACADEMICCLIPPERSCIENTIFICRUN1X; ACADEMICCLIPPERSCIENTIFICRUN2X; ACADEMICCLIPPERSCIENTIFICRUN3X; πACADEMICCLIPPERSCIENTIFICRUN4X/8; ACADEMICCLIPPERSCIENTIFICRUN5XACADEMICCLIPPERCITATION0X.');
    assert.equal(page.document.querySelector('#mixed-caption').textContent, 'πACADEMICCLIPPERSCIENTIFICRUN6X/8; ACADEMICCLIPPERSCIENTIFICRUN7XACADEMICCLIPPERCITATION1X.');
    for (const {marker} of page.semantic.citations) assert.equal(page.cleanedHtml.split(marker).length - 1, 1);
  }));
// Test-side oracle checks exact whole math atoms; no removal of grouping braces.
function ownsWholeSquare(markdown, expected) {
  const atoms = [...markdown.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].map(m => m[1].replace(/\\(?:left|right)/gu, '').replace(/\s+/gu, ''));
  return atoms.length === 1 && atoms[0] === expected;
}
test('synthetic whole-square oracle rejects exponent and base regrouping', () => {
  assert.equal(ownsWholeSquare('π$(5/60)^{2}$/8', first), true);
  assert.equal(ownsWholeSquare('π$\\left(5/60\\right)^{2}$/8', first), true);
  for (const text of ['π(5/60)$^{2}$/8', 'π$(5/60)^{2/8}$', '$π(5/60)^{2}$/8', '$((5/60)/8)^{2}$', 'π$(5/60^{2})$/8', 'π$(5/60)^{2}2$/8', 'π$(5/60)^2$/8', 'π$(5/60)^{2}$$(5/60)^{2}$/8']) assert.equal(ownsWholeSquare(text, first), false, text);
});
