import assert from 'node:assert/strict';
import dns from 'node:dns';
import { syncBuiltinESMExports } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { after, before, test } from 'node:test';

// Synthetic DOM/prose scaffolds only: no scholarly fixture or corpus admission.
const url = 'https://www.nature.com/articles/synthetic-qualified-metric';
const metric = 'r.m.s.d.<sub>95</sub>';
const ledger = { http: [], dns: [] };
const originals = { fetch: globalThis.fetch, lookup: dns.lookup, promiseLookup: dns.promises.lookup };
let parseNaturePage;
let opened = 0;
let closed = 0;
const deny = kind => (...args) => {
  ledger[kind].push(String(args[0]));
  throw new Error(`Undeclared ${kind} in synthetic qualifier boundary test`);
};
before(async () => {
  globalThis.fetch = deny('http');
  dns.lookup = deny('dns');
  dns.promises.lookup = deny('dns');
  syncBuiltinESMExports();
  const target = process.env.NATURE_ALPHA_QUALIFIER_SRC_ROOT
    ? pathToFileURL(resolve(process.env.NATURE_ALPHA_QUALIFIER_SRC_ROOT, 'adapters/nature.mjs'))
    : new URL('../src/adapters/nature.mjs', import.meta.url);
  ({ parseNaturePage } = await import(target.href));
});
after(() => {
  try {
    // Independent of case assertions; attempted requests cannot hide in catches.
    assert.deepEqual(ledger, { http: [], dns: [] });
    assert.equal(closed, opened, 'Every parser-owned DOM is closed');
  } finally {
    globalThis.fetch = originals.fetch;
    dns.lookup = originals.lookup;
    dns.promises.lookup = originals.promiseLookup;
    syncBuiltinESMExports();
    assert.equal(globalThis.fetch, originals.fetch);
    assert.equal(dns.lookup, originals.lookup);
    assert.equal(dns.promises.lookup, originals.promiseLookup);
  }
});
function withPage(content, inspect) {
  const page = parseNaturePage(`<html><body><div class="c-article-body">${content}</div></body></html>`, url);
  opened += 1;
  try { inspect(page); } finally { page.dom.window.close(); closed += 1; }
}
const metricTex = tex => String(tex).replace(/\\(?:mathrm|text|mathit)\{([^{}]*)\}/gu, '$1').replace(/[{}]/gu, '');
const allRuns = page => page.semantic.scientificRuns.map(run => metricTex(run.tex));
const expectRuns = (content, expected) => withPage(content, page => assert.deepEqual(allRuns(page), expected));

for (const [name, content] of [
  ['paragraph start', `<p>${metric} end.</p>`],
  ['separate measurement', `<p>0.96 Å ${metric} end.</p>`],
  ['punctuation', `<p>Start (${metric}); end.</p>`],
  ['source nonbreaking space', `<p>Start&nbsp;${metric} end.</p>`],
]) {
  test(`synthetic qualified metric keeps complete base and original qualifier: ${name}`, () => {
    expectRuns(content, ['r.m.s.d._95']);
  });
}

// Whole-prefix Unicode boundaries include supplementary-plane scalars; a
// previous UTF-16 code unit cannot establish an identifier/word boundary.
for (const [name, value] of [
  ['letter', 'x'], ['number', '2'], ['mark', '\u0301'], ['underscore', '_'],
  ['astral letter', '\u{10400}'], ['astral number', '\u{1D7CE}'], ['astral mark', '\u{1D185}'],
]) {
  test(`synthetic qualified metric rejects contiguous Unicode ${name}`, () => {
    expectRuns(`<p>${value}${metric} end.</p>`, []);
    expectRuns(`<p>Start ${metric}${value} end.</p>`, []);
  });
}

for (const [name, content, inherited = []] of [
  ['unknown metric and extended base', '<p>unknown<sub>95</sub>; r.m.s.d.extra<sub>95</sub>.</p>'],
  ['wrong qualifier and superscript', '<p>r.m.s.d.<sub>96</sub>; r.m.s.d.<sup>95</sup>.</p>'],
  ['cross sibling and comment', `<p><span>word</span>${metric}; word<!-- boundary -->${metric}.</p>`],
  ['wrapper around base', '<p><span>r.m.s.d.</span><sub>95</sub>.</p>'],
  ['wrapper around qualifier', '<p>r.m.s.d.<span><sub>95</sub></span>.</p>'],
  ['empty styled sibling', '<p>r.m.s.d.<i></i><sub>95</sub>.</p>', ['_95']],
  ['space and nested/mixed attachment', '<p>r.m.s.d. <sub>95</sub>; r.m.s.d.<sub><span>95</span></sub>; r.m.s.d.<sub>9<i>5</i></sub>.</p>'],
  ['extra script', '<p>r.m.s.d.<sub>95</sub><sup>2</sup>.</p>'],
]) {
  test(`synthetic qualified metric rejects unproven topology: ${name}`, () => expectRuns(content, inherited));
}

for (const [name, content] of [
  ['native code', `<code><p>${metric}</p></code><pre><p>${metric}</p></pre>`],
  ['native math integration point', `<math><mtext><p>${metric}</p></mtext></math>`],
  ['equation ancestor', `<div class="c-article-equation"><p>${metric}</p></div>`],
  ['MathJax', '<p><span class="mathjax-tex">\\(\\mathrm{r.m.s.d.}_{95}\\)</span>.</p>'],
  ['cross-span literal dollar', `<p>$<span>opaque</span> ${metric}$</p>`],
  ['cross-span literal backtick', `<p>\x60<span>opaque</span> ${metric}\x60</p>`],
  ['cross-span tilde fence', `<p>~~~\n<span>opaque</span> ${metric}\n~~~</p>`],
]) {
  test(`synthetic qualified metric respects opaque source context: ${name}`, () => {
    withPage(content, page => {
      assert.deepEqual(allRuns(page), []);
      if (name === 'native math integration point') {
        const p = page.dom.window.document.querySelector('math mtext p');
        assert.ok(p?.closest('math'), 'Exercise a real MathML ancestor, not HTML parser breakout');
      }
      if (name === 'MathJax') assert.deepEqual(page.semantic.inlineMath.map(run => run.tex), ['\\mathrm{r.m.s.d.}_{95}']);
    });
  });
}

test('synthetic qualified metric leaves both typed citation cues separate', () => {
  withPage(`<p>Start ${metric}<sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>; `
    + `${metric}<sup><a href="#ref-CR2">2</a></sup>.</p>`
    + '<ol class="c-article-references"><li id="ref-CR1"><p>Synthetic reference one.</p></li>'
    + '<li id="ref-CR2"><p>Synthetic reference two.</p></li></ol>', page => {
    assert.deepEqual(allRuns(page), ['r.m.s.d._95', 'r.m.s.d._95']);
    assert.deepEqual(page.semantic.citations.map(citation => citation.numbers), [[1], [2]]);
  });
});

test('synthetic body and caption use shared nonzero markers in exact role order', () => {
  withPage(`<p>Start <i>N</i><sub>res</sub>; 0.96 Å ${metric} end.</p>`
    + '<figure id="FigSynthetic"><img src="https://media.springernature.com/synthetic.png" alt="Synthetic scaffold">'
    + '<figcaption><h3>Synthetic caption.</h3>'
    + `<p>Start ${metric} end.</p></figcaption></figure>`, page => {
    assert.deepEqual(allRuns(page), ['N_res', 'r.m.s.d._95', 'r.m.s.d._95']);
    assert.deepEqual(page.semantic.scientificRuns.map(run => run.marker), [
      'ACADEMICCLIPPERSCIENTIFICRUN0X', 'ACADEMICCLIPPERSCIENTIFICRUN1X', 'ACADEMICCLIPPERSCIENTIFICRUN2X',
    ]);
    assert.equal(page.figures.length, 1);
    const combined = page.cleanedHtml + page.figures[0].captionHtml;
    for (const run of page.semantic.scientificRuns) assert.equal(combined.split(run.marker).length - 1, 1);
    assert.match(page.cleanedHtml, /0\.96 Å ACADEMICCLIPPERSCIENTIFICRUN1X end/u);
    assert.match(page.figures[0].captionHtml, /Start ACADEMICCLIPPERSCIENTIFICRUN2X end/u);
  });
});
