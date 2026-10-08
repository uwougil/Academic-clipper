import assert from 'node:assert/strict';
import dns from 'node:dns';
import {syncBuiltinESMExports} from 'node:module';
import {after, test} from 'node:test';
import {pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';

// Explicitly synthetic, parse-only boundary tests; no scholarly source entry,
// real fixture, Defuddle conversion, hydration, writer or source acquisition.
const moduleUrl = process.env.NATURE_COMPOUND_PREFLIGHT_MODULE
  ? pathToFileURL(process.env.NATURE_COMPOUND_PREFLIGHT_MODULE)
  : new URL('../src/adapters/nature.mjs', import.meta.url);
const {parseNaturePage} = await import(moduleUrl.href);
const attempts = [], doms = [];
const originals = {fetch:globalThis.fetch, lookup:dns.lookup, promiseLookup:dns.promises.lookup};
globalThis.fetch = async (...args) => {attempts.push(['HTTP',String(args[0])]); throw new Error('Synthetic parse-only HTTP');};
dns.lookup = (...args) => {attempts.push(['DNS',String(args[0])]); throw new Error('Synthetic parse-only DNS');};
dns.promises.lookup = async (...args) => {attempts.push(['DNS-promise',String(args[0])]); throw new Error('Synthetic parse-only DNS');};
syncBuiltinESMExports();
after(() => {
  try {assert.deepEqual(attempts, [], 'Includes caught network attempts');}
  finally {
    for (const dom of doms) dom.window.close();
    globalThis.fetch=originals.fetch; dns.lookup=originals.lookup;
    dns.promises.lookup=originals.promiseLookup; syncBuiltinESMExports();
  }
});

function parse(fragment) {
  const page=parseNaturePage(`<!doctype html><html><head><title>Synthetic boundary</title></head><body><div class="c-article-body">${fragment}</div></body></html>`, 'https://www.nature.com/articles/synthetic-compound-boundary');
  doms.push(page.dom);
  return page;
}
const expectedTex = String.raw`\mathrm{mS}\,\mathrm{cm}^{-1}`;
function compoundRoles(page) {
  return page.semantic.scientificRuns.filter(({tex}) => tex.includes(String.raw`\mathrm{mS}`));
}

for (const [name, contents, prefix, suffix] of [
  ['standalone Unicode inverse', 'mScm<sup>−1</sup>', '', ''],
  ['standalone ASCII inverse', 'mScm<sup>-1</sup>', '', ''],
  ['ordinary quantity with thin spaces', 'quantity > 101.18\u2009mScm<sup>−1</sup> remains.', 'quantity > 101.18\u2009', ' remains.'],
  ['parenthesized unit', '(mScm<sup>−1</sup>), next', '(', '), next'],
  ['operator boundary', 'ratio/mScm<sup>−1</sup>; next', 'ratio/', '; next'],
]) {
  test(`synthetic compound qualification: ${name}`, () => {
    const page=parse(`<p>${contents}</p>`), roles=compoundRoles(page);
    assert.equal(roles.length,1,'One supported compound factor role');
    assert.equal(roles[0].tex,expectedTex,'Only cm is raised to −1; mS remains a multiplier');
    const p=page.document.querySelector('.c-article-body p');
    assert.equal(p.textContent,`${prefix}${roles[0].marker}${suffix}`,'Exact measurement, separators and prose remain outside range');
    assert.equal(p.querySelectorAll('sup').length,0);
  });
}

for (const [name, citation] of [
  ['data-test cue','<a data-test="citation-ref" href="#ref-CR7">7</a>'],
  ['href-only cue','<a href="#ref-CR7">7</a>'],
]) {
  test(`synthetic qualified unit followed by ${name} preserves distinct citation role`, () => {
    const page=parse(`<p>quantity mScm<sup>−1</sup><sup>${citation}</sup> next</p>`);
    const roles=compoundRoles(page);
    assert.equal(roles.length,1);
    assert.equal(roles[0].tex,expectedTex);
    assert.deepEqual(page.semantic.citations.map(c=>c.numbers),[[7]]);
    const p=page.document.querySelector('.c-article-body p');
    assert.equal(p.textContent,`quantity ${roles[0].marker}${page.semantic.citations[0].marker} next`);
  });
}

for (const [name, contents] of [
  ['word suffix','wordmScm<sup>−1</sup>'],
  ['Unicode word suffix','αmScm<sup>−1</sup>'],
  ['combining mark suffix','a\u0301mScm<sup>−1</sup>'],
  ['astral letter suffix','𐐀mScm<sup>−1</sup>'],
  ['astral number suffix','𝟚mScm<sup>−1</sup>'],
  ['digit suffix','2mScm<sup>−1</sup>'],
  ['underscore suffix','_mScm<sup>−1</sup>'],
  ['word continuation','mScm<sup>−1</sup>tail'],
  ['digit continuation','mScm<sup>−1</sup>2'],
  ['combining mark continuation','mScm<sup>−1</sup>\u0301'],
  ['styled word continuation','mScm<sup>−1</sup><b>tail</b>'],
  ['style before a node-edge token','<b>word</b>mScm<sup>−1</sup>'],
  ['empty style before a node-edge token','word<i></i>mScm<sup>−1</sup>'],
  ['comment before a node-edge token','word<!-- boundary -->mScm<sup>−1</sup>'],
  ['space before exponent','mScm <sup>−1</sup>'],
  ['comment before exponent','mScm<!-- boundary --><sup>−1</sup>'],
  ['wrapped exponent','mScm<span><sup>−1</sup></span>'],
  ['styled exponent','mScm<sup><i>−1</i></sup>'],
  ['nested exponent','mScm<sup><span>−1</span></sup>'],
  ['split exponent','mScm<sup>−</sup><sup>1</sup>'],
  ['positive power outside this contract','mScm<sup>1</sup>'],
  ['other inverse outside this contract','mScm<sup>−2</sup>'],
  ['fractional inverse outside this contract','mScm<sup>−1/2</sup>'],
  ['unknown compound','kgcm<sup>−1</sup>'],
  ['uppercase lookalike','MSCM<sup>−1</sup>'],
  ['subscript continuation','mScm<sup>−1</sup><sub>a</sub>'],
  ['extra power','mScm<sup>−1</sup><sup>2</sup>'],
  ['literal math cue','cost $5 mScm<sup>−1</sup>'],
  ['literal code cue','`mScm<sup>−1</sup>`'],
  ['literal tilde fence','~~~text\nmScm<sup>−1</sup>\n~~~'],
  ['non-citation anchor in exponent','mScm<sup><a href="#other">−1</a></sup>'],
  ['data-test citation SUP','mScm<sup><a data-test="citation-ref" href="#ref-CR7">7</a></sup>'],
  ['href-only citation SUP','mScm<sup><a href="#ref-CR7">7</a></sup>'],
]) {
  test(`synthetic compound rejection: ${name}`, () => {
    assert.deepEqual(compoundRoles(parse(`<p>${contents}</p>`)),[],'No new compound role may be inferred');
  });
}

for (const [name, fragment] of [
  ['code ancestor','<code><p>mScm<sup>−1</sup></p></code>'],
  ['pre ancestor','<pre><p>mScm<sup>−1</sup></p></pre>'],
  ['MathJax ancestor','<div class="mathjax-tex"><p>mScm<sup>−1</sup></p></div>'],
  ['equation ancestor','<div class="c-article-equation"><p>mScm<sup>−1</sup></p></div>'],
]) {
  test(`synthetic compound rejection: ${name}`, () => {
    assert.deepEqual(compoundRoles(parse(fragment)),[]);
  });
}

test('synthetic existing styled, numeric and MathJax roles remain separate from unknown compound text', () => {
  const page=parse('<p><i>x</i><sup>2</sup>; 10<sup>−3</sup>; <span class="mathjax-tex">\\(y^2\\)</span>; wordmScm<sup>−1</sup>.</p>');
  assert.deepEqual(page.semantic.scientificRuns.map(s=>s.tex),['x^{2}','10^{−3}']);
  assert.deepEqual(page.semantic.inlineMath.map(s=>s.tex),['y^2']);
  assert.deepEqual(compoundRoles(page),[]);
  assert.match(page.cleanedHtml,/wordmScm<sup>−1<\/sup>/u);
});

test('synthetic explicit source space after a styled neighbor establishes a lexical boundary', () => {
  const page=parse('<p><b>word</b> mScm<sup>−1</sup> next</p>');
  const roles=compoundRoles(page);
  assert.equal(roles.length,1);
  assert.equal(roles[0].tex,expectedTex);
  assert.equal(page.document.querySelector('.c-article-body p').innerHTML,`<b>word</b> ${roles[0].marker} next`);
});

// Small additions requested by the independent plan reviewer. Their baseline
// runs separately by name: the preceding 46 cases and real source are reused.
test('synthetic compound review addition: unknown lexical prefixes create no new scientific record', () => {
  for (const prefix of ['word','a\u0301','𐐀','𝟚']) {
    const page=parse(`<p>${prefix}mScm<sup>−1</sup> next</p>`);
    assert.deepEqual(page.semantic.scientificRuns,[], 'Reject every new record, including an incorrect whole-compound power');
  }
});

test('synthetic compound review addition: styled exponent preserves its inherited detached role only', () => {
  const page=parse('<p>mScm<sup><i>−1</i></sup> next</p>');
  assert.deepEqual(page.semantic.scientificRuns.map(s=>s.tex),['^{−1}']);
  assert.equal(page.document.querySelector('.c-article-body p').textContent,`mScm${page.semantic.scientificRuns[0].marker} next`);
});

for (const [name, literal] of [
  ['cross-span dollar cue','<span>$5</span> '],
  ['cross-span backtick cue','<span>`code`</span> '],
  ['cross-span tilde fence','<span>~~~text</span>\n'],
]) {
  test(`synthetic compound review addition: ${name}`, () => {
    const page=parse(`<p>${literal}mScm<sup>−1</sup> next</p>`);
    assert.deepEqual(page.semantic.scientificRuns,[], 'A node edge and genuine space do not end an opaque parent context');
  });
}

test('synthetic compound review addition: native MathML integration point keeps the actual math ancestor', () => {
  const fragment='<math><mtext><p>mScm<sup>−1</sup> next</p></mtext></math>';
  const input=new JSDOM(fragment); doms.push(input);
  assert.ok(input.window.document.querySelector('p').closest('math'),'HTML integration point preserves lawful DOM ancestry');
  assert.deepEqual(parse(fragment).semantic.scientificRuns,[]);
});

test('synthetic compound review addition: two units preserve nonzero marker indices, typed neighbors and citation order', () => {
  const page=parse('<p><i>x</i><sup>2</sup>; <span class="mathjax-tex">\\(y^2\\)</span>; mScm<sup>−1</sup>, mScm<sup>-1</sup><sup><a href="#ref-CR7">7</a></sup> tail</p>');
  const roles=compoundRoles(page);
  assert.equal(roles.length,2,'Two separate supported factor roles');
  assert.deepEqual(page.semantic.scientificRuns.map(s=>s.tex),['x^{2}',expectedTex,expectedTex]);
  assert.deepEqual(page.semantic.inlineMath.map(s=>s.tex),['y^2']);
  assert.deepEqual(page.semantic.citations.map(s=>s.numbers),[[7]]);
  const [styled,first,second]=page.semantic.scientificRuns;
  assert.equal(page.document.querySelector('.c-article-body p').textContent,`${styled.marker}; ${page.semantic.inlineMath[0].marker}; ${first.marker}, ${second.marker}${page.semantic.citations[0].marker} tail`);
});
