// Synthetic DOM contracts only: no article admission, source counts or scholarship.
import assert from 'node:assert/strict';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {writeFile} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after, test} from 'node:test';
import {pathToFileURL} from 'node:url';

const scope = process.env.CHEMICAL_GROUP_SYNTHETIC_SCOPE || 'all';
assert.ok(['all', 'review-tail'].includes(scope), 'Explicit synthetic scope');
const tailOnly = scope === 'review-tail';

const attempts = [];
const original = {fetch: globalThis.fetch, lookup: dns.lookup, promiseLookup: dnsPromises.lookup};
const domKeys = ['window','document','DOMParser','XMLSerializer','Node','NodeFilter','HTMLElement','Element','SVGElement','Document'];
const domSnapshot = domKeys.map(key => ({key, descriptor: Object.getOwnPropertyDescriptor(globalThis, key)}));
globalThis.fetch = async (...args) => {attempts.push({kind: 'HTTP', target: String(args[0])}); throw new Error('Unexpected synthetic group HTTP');};
dns.lookup = (...args) => {attempts.push({kind: 'DNS', target: String(args[0])}); throw new Error('Unexpected synthetic group DNS');};
dnsPromises.lookup = async (...args) => {attempts.push({kind: 'DNS-promise', target: String(args[0])}); throw new Error('Unexpected synthetic group DNS');};
syncBuiltinESMExports();
const observations = [];
const windows = new Set();
let closedWindows = 0;
after(async () => {
  try {
    for (const window of windows) {window.close(); closedWindows += 1;}
  } finally {
    globalThis.fetch = original.fetch; dns.lookup = original.lookup; dnsPromises.lookup = original.promiseLookup;
    syncBuiltinESMExports();
    for (const {key, descriptor} of domSnapshot) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
  const lifecycle = {attempts, parsedWindows: windows.size, closedWindows, clips: 0,
    sourceReads: 0, sourceAudits: 0, synthetic: true, scope,
    restoredNetworkBindings: globalThis.fetch === original.fetch && dns.lookup === original.lookup && dnsPromises.lookup === original.promiseLookup,
    restoredDomDescriptors: domSnapshot.every(({key, descriptor}) => {
      const actual = Object.getOwnPropertyDescriptor(globalThis, key);
      return descriptor ? actual?.value === descriptor.value && actual?.get === descriptor.get && actual?.set === descriptor.set
        && actual?.writable === descriptor.writable && actual?.enumerable === descriptor.enumerable && actual?.configurable === descriptor.configurable : !actual;
    })};
  if (process.env.CHEMICAL_GROUP_SYNTHETIC_RECEIPT) await writeFile(process.env.CHEMICAL_GROUP_SYNTHETIC_RECEIPT,
    JSON.stringify({version: 'chemical-group-synthetic/1.0', implementationRoot: process.env.CHEMICAL_GROUP_SNAPSHOT_ROOT || 'current checkout', observations, lifecycle}, null, 2) + '\n');
  assert.deepEqual(attempts, [], 'Record-before-throw ledger is checked independently after every case, including caught errors');
  assert.equal(lifecycle.restoredNetworkBindings, true);
  assert.equal(lifecycle.restoredDomDescriptors, true);
  assert.equal(closedWindows, windows.size);
});
// Install guards before importing any production modules, then use the real API.
const moduleUrl = process.env.CHEMICAL_GROUP_SNAPSHOT_ROOT
  ? pathToFileURL(`${process.env.CHEMICAL_GROUP_SNAPSHOT_ROOT}/src/adapters/nature.mjs`)
  : new URL('../src/adapters/nature.mjs', import.meta.url);
const {parseNaturePage} = await import(moduleUrl.href);
const url = 'https://www.nature.com/articles/synthetic-group-contract';
const formula = {
  pb4: '\\mathrm{Pb}(\\mathrm{OAc})_{4}', pb2: '\\mathrm{Pb}(\\mathrm{OAc})_{2}',
  fe3: '\\mathrm{Fe}_{2}(\\mathrm{ox})_{3}', fe2: '\\mathrm{Fe}_{2}(\\mathrm{ox})_{2}',
  cd2: '(\\mathrm{CD}_{3})_{2}\\mathrm{CO}', ch4: '(\\mathrm{CH}_{3})_{4}\\mathrm{CO}',
  oh2: '\\mathrm{Ca}(\\mathrm{OH})_{2}',
};
const positive = tailOnly ? [] : [
  ['source-shaped Pb whole group', 'Pb(OAc)<sub>4</sub>', formula.pb4],
  ['source-shaped Fe inner and outer counts', 'Fe<sub>2</sub>(ox)<sub>3</sub>', formula.fe3],
  ['source-shaped CD inner count and outside CO', '(CD<sub>3</sub>)<sub>2</sub>CO', formula.cd2],
  ['same structural family with outer 2', 'Pb(OAc)<sub>2</sub>', formula.pb2],
  ['same inner and outer 2 remain two owners', 'Fe<sub>2</sub>(ox)<sub>2</sub>', formula.fe2],
  ['native inner 3 and outer 4 remain two owners', '(CH<sub>3</sub>)<sub>4</sub>CO', formula.ch4],
  ['element token family without article identity', 'Ca(OH)<sub>2</sub>', formula.oh2],
];
const reviewTailNegative = [
  ['short ligand needs original prefix atom SUB', 'Fe(ox)<sub>3</sub>'],
  ['short ligand needs element-led prefix', '(ox)<sub>3</sub>'],
  ['unknown prefix SUB cannot authorize short ligand', 'word<sub>2</sub>(ox)<sub>3</sub>'],
  ['native prefix SUB cannot authorize long unknown ligand', 'Fe<sub>2</sub>(word)<sub>3</sub>'],
  ['unknown left sibling preserves inherited styled role', '<i>x</i><sub>2</sub>; <span>x</span>Pb(OAc)<sub>4</sub>', ['x_{2}']],
  ['unknown right sibling is not an edge', 'Pb(OAc)<sub>4</sub><span>x</span>'],
  ['right comment is not an edge', 'Pb(OAc)<sub>4</sub><!-- x -->'],
  ['right empty wrapper is not an edge', 'Pb(OAc)<sub>4</sub><span></span>'],
  ['extra native SUB has no authorized owner', 'Pb(OAc)<sub>4</sub><sub>2</sub>'],
  ['extra native SUP has no authorized owner', 'Pb(OAc)<sub>4</sub><sup>2</sup>'],
  ['untyped right anchor is not an independent citation', 'Pb(OAc)<sub>4</sub><a href="#unknown">x</a>'],
];
const negative = tailOnly ? reviewTailNegative : [
  ['unknown word', 'unknown(word)<sub>4</sub>'],
  ['element prefix cannot authorize a long unknown word', 'Ca(word)<sub>4</sub>'],
  ['numeric parentheses belong to a separate contract', '(2)<sub>4</sub>'],
  ['unbalanced group', 'Pb(OAc<sub>4</sub>'],
  ['complex inner wrapper', 'Pb(<span>OAc</span>)<sub>4</sub>'],
  ['script wrapper', 'Pb(OAc)<sub><span>4</span></sub>'],
  ['outer SUP is not a group SUB', 'Pb(OAc)<sup>4</sup>'],
  ['code ancestor', '<code>Pb(OAc)<sub>4</sub></code>'],
  ['literal math across siblings', '$Pb(OAc)<sub>4</sub>$'],
  ['literal code across siblings', '`Pb(OAc)<sub>4</sub>`'],
  ['typed reference child cannot become a numeric SUB', 'Pb(OAc)<sub><a data-test="citation-ref" href="#ref-CR1">1</a></sub>'],
  ...reviewTailNegative,
];
if (!tailOnly) for (const [kind, value] of [['letter','x'], ['number','9'], ['mark','\u0301'], ['underscore','_'], ['astral letter','\u{10400}']]) {
  negative.push([`${kind} prefix and suffix boundaries`, `${value}Pb(OAc)<sub>4</sub>; Pb(OAc)<sub>4</sub>${value}`]);
}

function observe(id, body, expected, checks = () => {}) {
  let page;
  const observation = {id, synthetic: true, expected, status: 'HARNESS_ERROR'};
  try {
    page = parseNaturePage(`<!doctype html><html><head><title>Synthetic group contract</title></head><body><div class="c-article-body">${body}</div></body></html>`, url);
    windows.add(page.dom.window);
    observation.scientificRuns = page.semantic.scientificRuns.map(({marker, tex}) => ({marker, tex}));
    observation.inlineMath = page.semantic.inlineMath.map(({marker, tex}) => ({marker, tex}));
    observation.citations = page.semantic.citations.map(({marker, numbers}) => ({marker, numbers}));
    observation.cleanedHtml = page.cleanedHtml;
    // Exact complete ordered array: no filtering, minima, or count-only pass.
    assert.deepEqual(observation.scientificRuns, expected.map((tex, index) => ({marker: `ACADEMICCLIPPERSCIENTIFICRUN${index}X`, tex})));
    for (const {marker} of observation.scientificRuns) assert.equal(page.cleanedHtml.split(marker).length - 1, 1, 'Each scientific marker has exactly one DOM owner');
    checks(page);
    observation.status = 'PASS';
  } catch (error) {
    observation.error = {name: error.name, message: error.message, stack: error.stack};
    observation.status = error instanceof assert.AssertionError ? 'CONTRACT_RED' : 'HARNESS_ERROR';
    throw error;
  } finally {
    observations.push(observation);
  }
}
for (const [name, html, tex] of positive) test(`synthetic positive: ${name}`, () => observe(name, `<p>${html}.</p>`, [tex]));
for (const [name, html, expected = []] of negative) test(`synthetic exclusion: ${name}`, () => observe(name, `<p>${html}</p>`, expected, page => {
  if (name.startsWith('typed reference')) assert.deepEqual(page.semantic.citations.map(c => c.numbers), [[1]]);
}));
if (!tailOnly) {
test('synthetic native MathML integration point keeps its math ancestor', () => observe('native MathML ancestor',
  '<math><mtext><p id="math-integration">Pb(OAc)<sub>4</sub></p></mtext></math>', [], page => {
    const paragraph = page.document.querySelector('#math-integration');
    assert.ok(paragraph, 'Real HTML-in-MathML integration point must exist');
    assert.equal(paragraph.closest('math')?.namespaceURI, 'http://www.w3.org/1998/Math/MathML');
    assert.equal(paragraph.querySelector('sub')?.textContent, '4');
  }));
test('synthetic opaque MathJax remains its existing typed role', () => observe('opaque MathJax',
  '<p><span class="mathjax-tex">\\(\\mathrm{Pb}(\\mathrm{OAc})_{4}\\)</span></p>', [], page => {
    assert.deepEqual(page.semantic.inlineMath.map(({marker, tex}) => ({marker, tex})), [{marker: 'ACADEMICCLIPPERINLINEMATH0X', tex: formula.pb4}]);
    assert.equal(page.cleanedHtml.split('ACADEMICCLIPPERINLINEMATH0X').length - 1, 1);
  }));
test('synthetic mixed body and caption preserve all ordered roles and nonzero shared indices', () => observe('mixed body caption',
  '<p id="mixed-body"><i>x</i><sub>2</sub>; mScm<sup>−1</sup>; 10<sup>4</sup>; <span class="mathjax-tex">\\(q\\)</span><sub>1</sub>; Pb(OAc)<sub>4</sub><sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>; Fe<sub>2</sub>(ox)<sub>3</sub>.</p>'
  + '<figcaption id="mixed-caption">(CD<sub>3</sub>)<sub>2</sub>CO; Pb(OAc)<sub>4</sub><a data-test="citation-ref" href="#ref-CR2">2</a>.</figcaption>',
  ['x_{2}', '\\mathrm{mS}\\,\\mathrm{cm}^{-1}', '10^{4}', 'q_{1}', formula.pb4, formula.fe3, formula.cd2, formula.pb4], page => {
    assert.deepEqual(page.semantic.inlineMath.map(({marker, tex}) => ({marker, tex})), [{marker: 'ACADEMICCLIPPERINLINEMATH0X', tex: 'q'}]);
    assert.deepEqual(page.semantic.citations.map(({marker, numbers}) => ({marker, numbers})), [
      {marker: 'ACADEMICCLIPPERCITATION0X', numbers: [1]}, {marker: 'ACADEMICCLIPPERCITATION1X', numbers: [2]},
    ]);
    assert.equal(page.document.querySelector('#mixed-body').textContent,
      'ACADEMICCLIPPERSCIENTIFICRUN0X; ACADEMICCLIPPERSCIENTIFICRUN1X; ACADEMICCLIPPERSCIENTIFICRUN2X; ACADEMICCLIPPERSCIENTIFICRUN3X; ACADEMICCLIPPERSCIENTIFICRUN4XACADEMICCLIPPERCITATION0X; ACADEMICCLIPPERSCIENTIFICRUN5X.');
    assert.equal(page.document.querySelector('#mixed-caption').textContent,
      'ACADEMICCLIPPERSCIENTIFICRUN6X; ACADEMICCLIPPERSCIENTIFICRUN7XACADEMICCLIPPERCITATION1X.');
    for (const {marker} of page.semantic.citations) assert.equal(page.cleanedHtml.split(marker).length - 1, 1);
  }));
}
