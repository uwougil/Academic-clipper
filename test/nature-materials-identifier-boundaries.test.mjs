import assert from 'node:assert/strict';
import {after, before, test} from 'node:test';
import {pathToFileURL} from 'node:url';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {syncBuiltinESMExports} from 'node:module';
import {writeFile} from 'node:fs/promises';
import path from 'node:path';

// Explicitly constructed DOM qualification cases, never scholarly source.
// A preflight can import an exact accepted-main source snapshot without
// changing this branch's production files or rerunning its real-source tests.
const adapterUrl = process.env.ACADEMIC_CLIPPER_IDENTIFIER_ADAPTER
  ? pathToFileURL(process.env.ACADEMIC_CLIPPER_IDENTIFIER_ADAPTER)
  : new URL('../src/adapters/nature.mjs', import.meta.url);
const {parseNaturePage} = await import(adapterUrl.href);
const source = 'https://www.nature.com/articles/synthetic-identifier-boundaries';
const identifier = 'r<sup>2</sup>SCAN';
const equivalent = (tex) => tex.replace(/\\(?:mathrm|mathit|operatorname)\{([^{}]*)\}/gu, '$1').replace(/\s+/gu, '');
const attempts = [];
const originals = [];
let constructedParses = 0;
before(() => {
  for (const [owner, label, methods] of [
    [globalThis, 'global', ['fetch']],
    [dns, 'dns', ['lookup', 'resolve', 'resolve4', 'resolve6', 'reverse']],
    [dnsPromises, 'dnsPromises', ['lookup', 'resolve', 'resolve4', 'resolve6', 'reverse']],
  ]) for (const method of methods) {
    const original = owner[method];
    originals.push({owner, method, original});
    owner[method] = () => {
      attempts.push(`${label}.${method}`);
      throw new Error(`Unexpected live operation: ${label}.${method}`);
    };
  }
  syncBuiltinESMExports();
});
after(async () => {
  try {
    assert.deepEqual(attempts, [], 'Record-before-throw catches even swallowed attempts');
  } finally {
    for (const {owner, method, original} of originals) owner[method] = original;
    syncBuiltinESMExports();
    const restored = originals.every(({owner, method, original}) => owner[method] === original);
    if (process.env.ACADEMIC_CLIPPER_IDENTIFIER_GUARD_RECEIPT) {
      assert.ok(path.isAbsolute(process.env.ACADEMIC_CLIPPER_IDENTIFIER_GUARD_RECEIPT));
      await writeFile(process.env.ACADEMIC_CLIPPER_IDENTIFIER_GUARD_RECEIPT,
        JSON.stringify({constructedParses, attempts, restored, newRealClips: 0}, null, 2) + '\n');
    }
    assert.equal(restored, true);
  }
});
function parse(content, inspect) {
  constructedParses += 1;
  const page = parseNaturePage(`<html><body><div class="c-article-body">${content}</div></body></html>`, source);
  try {
    assert.deepEqual(page.tables, []);
    inspect(page);
  } finally {
    page.dom.window.close();
  }
}
function identifierRuns(page, expected = 'r^{2}SCAN') {
  return page.semantic.scientificRuns.filter(({tex}) => equivalent(tex) === expected);
}

for (const [name, left, right] of [
  ['parent start', '', ''], ['space', 'Constructed ', ' tail'],
  ['thin space', 'Constructed\u2009', '\u2009tail'],
  ['open parenthesis', '(', ')'], ['equality', 'x=', ';'],
  ['comma', 'x,', ',y'], ['colon', 'x:', ':y'],
]) test(`synthetic identifier qualifies at ${name}`, () => {
  parse(`<p>${left}${identifier}${right}</p>`, (page) => {
    assert.equal(identifierRuns(page).length, 1, 'One complete typed base/exponent/suffix role');
    assert.equal(page.semantic.scientificRuns.length, 1);
    const marker = page.semantic.scientificRuns[0].marker;
    assert.equal(page.document.querySelector('p').textContent, `${left}${marker}${right}`);
  });
});

test('synthetic same-shape identifier is source text, not an article or functional allowlist', () => {
  parse('<p>Constructed q<sup>2</sup>MODEL.</p>', (page) => {
    assert.equal(identifierRuns(page, 'q^{2}MODEL').length, 1);
    assert.equal(page.semantic.scientificRuns.length, 1);
  });
});

const reject = [
  ...['word', 'Ω', 'é', '1', '_', '𝒙', 'e\u0301', '\u0301'].map((prefix) => [`Unicode lexical prefix ${prefix}`, `${prefix}${identifier}`]),
  ...['word', 'Ω', 'é', '1', '_', '𝒙', '\u0301'].map((suffix) => [`Unicode lexical suffix ${suffix}`, `${identifier}${suffix}`]),
  ['separated base', 'r <sup>2</sup>SCAN'],
  ['separated suffix', 'r<sup>2</sup> SCAN'],
  ['base comment', 'r<!-- constructed boundary --><sup>2</sup>SCAN'],
  ['suffix comment', 'r<sup>2</sup><!-- constructed boundary -->SCAN'],
  ['styled prefix sibling', '<i>word</i>r<sup>2</sup>SCAN'],
  ['empty styled prefix sibling', '<i></i>r<sup>2</sup>SCAN'],
  ['styled suffix sibling', 'r<sup>2</sup><i>SCAN</i>'],
  ['empty styled suffix sibling', 'r<sup>2</sup><i></i>SCAN'],
  ['nested script style', 'r<sup><i>2</i></sup>SCAN'],
  ['mixed script children', 'r<sup>2<i>x</i></sup>SCAN'],
  ['extra SUP', 'r<sup>2</sup><sup>3</sup>SCAN'],
  ['extra SUB', 'r<sup>2</sup><sub>x</sub>SCAN'],
  ['suffix extra SUP', 'r<sup>2</sup>SCAN<sup>3</sup>'],
  ['code ancestor', `<code>${identifier}</code>`],
  ['pre ancestor', `<pre>${identifier}</pre>`],
  ['MathML ancestor', `<math><mtext>${identifier}</mtext></math>`],
  ['parent literal dollars', `$x$ ${identifier}`],
  ['parent literal backticks', `\u0060x\u0060 ${identifier}`],
  ['unknown lower-case prose', 'ordinary<sup>2</sup>word'],
  ['unknown mixed-case suffix', 'r<sup>2</sup>Scan'],
  ['unknown multi-letter base', 'rr<sup>2</sup>SCAN'],
  ['unknown exponent', 'r<sup>3</sup>SCAN'],
];
for (const [name, content] of reject) test(`synthetic identifier rejects ${name}`, () => {
  parse(`<p>${content}</p>`, (page) => assert.equal(identifierRuns(page).length, 0));
});

test('synthetic existing styled base retains its independently established role', () => {
  parse('<p><i>r</i><sup>2</sup>SCAN</p>', (page) => {
    assert.equal(identifierRuns(page).length, 1);
    assert.equal(page.semantic.scientificRuns.length, 1);
  });
});

test('synthetic citation SUP and typed MathJax retain separate roles', () => {
  parse('<p>r<sup><a href="#ref-CR1" data-test="citation-ref">2</a></sup>SCAN; <span class="mathjax-tex">\\(r^2\\mathrm{SCAN}\\)</span>.</p>', (page) => {
    assert.equal(identifierRuns(page).length, 0);
    assert.deepEqual(page.semantic.citations.map(({numbers}) => numbers), [[2]]);
    assert.deepEqual(page.semantic.inlineMath.map(({tex}) => tex), ['r^2\\mathrm{SCAN}']);
  });
});

test('synthetic body, H3, H4 and caption share markers without changing heading roles', () => {
  parse(`<p><i>v</i><sub>0</sub> then ${identifier}.</p><h3 id="Sec7">Constructed ${identifier}</h3><h4 id="Sec33">${identifier}</h4><figure><figcaption><b>Fig. 1: Constructed marker case.</b><p id="Fig1" data-test="figure-caption-text">Caption ${identifier}.</p></figcaption><img src="https://media.springernature.com/constructed.png" alt="Constructed only"></figure>`, (page) => {
    assert.deepEqual(page.semantic.scientificRuns.map(({tex}) => equivalent(tex)), ['v_{0}', 'r^{2}SCAN', 'r^{2}SCAN', 'r^{2}SCAN', 'r^{2}SCAN']);
    assert.equal(page.figures.length, 1);
    const markers = page.semantic.scientificRuns.map(({marker}) => marker);
    assert.equal(new Set(markers).size, 5);
    assert.equal(page.document.querySelector('p').textContent, `${markers[0]} then ${markers[1]}.`);
    assert.equal(page.document.querySelector('h3#Sec7').textContent, `Constructed ${markers[2]}`);
    assert.equal(page.document.querySelector('h4#Sec33').textContent, markers[3]);
    assert.equal(page.figures[0].captionHtml, `Caption ${markers[4]}.`);
    for (const marker of markers.slice(0, 4)) assert.equal(page.figures[0].captionHtml.includes(marker), false);
    for (const marker of markers) assert.equal((`${page.cleanedHtml}${page.figures[0].captionHtml}`.match(new RegExp(marker, 'gu')) || []).length, 1);
  });
});

// Incremental plan-review controls; these check every scientific range, so an
// incorrect partial capture cannot evade an exact r²SCAN-only filter.
for (const [name, content] of [
  ['plain nonshape', 'ordinary<sup>2</sup>word'],
  ['whole Unicode prefix', `𝒙${identifier}`],
  ['whole Unicode suffix', `${identifier}\u0301`],
  ['cross-span dollars', `<span>$</span>x<span>$</span> ${identifier}`],
  ['cross-span backticks', `<span>\u0060</span>x<span>\u0060</span> ${identifier}`],
  ['cross-span tilde fence', `<span>~~~</span>\n${identifier}`],
  ['MathJax ancestor', `<span class="mathjax-tex">\\(${identifier}\\)</span>`],
  ['equation ancestor', `<div class="c-article-equation"><p>${identifier}</p></div>`],
]) test(`synthetic plan-tail rejects all ranges: ${name}`, () => {
  parse(`<p>${content}</p>`, (page) => assert.deepEqual(page.semantic.scientificRuns, []));
});
for (const [name, cue] of [
  ['data-test cue', 'data-test="citation-ref" href="#ref-CR1"'],
  ['href-only cue', 'href="#ref-CR1"'],
]) test(`synthetic plan-tail supported identifier before ${name}`, () => {
  parse(`<p>Before ${identifier}<sup><a ${cue}>1</a></sup> after.</p>`, (page) => {
    assert.deepEqual(page.semantic.scientificRuns.map(({tex}) => equivalent(tex)), ['r^{2}SCAN']);
    assert.deepEqual(page.semantic.citations.map(({numbers}) => numbers), [[1]]);
    assert.equal(page.document.querySelector('p').textContent,
      `Before ${page.semantic.scientificRuns[0].marker}${page.semantic.citations[0].marker} after.`);
  });
});
