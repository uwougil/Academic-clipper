import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { parseNaturePage } from '../src/adapters/nature.mjs';
import { clipNature } from '../src/clip.mjs';

// Explicitly synthetic role controls, not additional publisher admissions.
const url = 'https://www.nature.com/articles/synthetic-isotope-boundaries';
const opened = [];
after(() => { for (const dom of opened) dom.window.close(); });
const article = content => `<html><body><div class="c-article-body">${content}</div></body></html>`;
function parse(content) {
  const page = parseNaturePage(article(content), url);
  opened.push(page.dom);
  return page;
}

for (const [name, content, tex] of [
  ['paragraph start', '<p><sup>13</sup>C NMR.</p>', '^{13}C'],
  ['bracketed label', '<p>Tracer [<sup>3</sup>H]-TBOB.</p>', '^{3}H'],
  ['independent prior measurement', '<p>2.05 <sup>1</sup>H NMR.</p>', '^{1}H'],
  ['fluorine coupling', '<p>The <sup>19</sup>F coupling constant.</p>', '^{19}F'],
  ['nonbreaking source boundary', '<p>By&nbsp;<sup>1</sup>H NMR.</p>', '^{1}H'],
  ['thin source boundary', '<p>By\u2009<sup>1</sup>H NMR.</p>', '^{1}H'],
]) {
  test(`synthetic leading mass retains its following element: ${name}`, () => {
    const page = parse(content);
    assert.deepEqual(page.semantic.scientificRuns.map(run => run.tex), [tex]);
    if (name === 'independent prior measurement') assert.match(page.cleanedHtml, /2\.05\s+ACADEMICCLIPPER/u);
  });
}

for (const [name, content, existingRuns = []] of [
  ['true contiguous numeric power', '<p>10<sup>3</sup>H.</p>', ['10^{3}']],
  ['other contiguous numeric base', '<p>2.5<sup>3</sup>H.</p>'],
  ['styled exponent base', '<p><i>x</i><sup>3</sup>H.</p>', ['x^{3}H']],
  ['styled base with source spacing', '<p><i>x</i> <sup>3</sup>H.</p>', ['x^{3}H']],
  ['Delta bond positions', '<p>Δ<sup>12,13</sup>H.</p>'],
  ['plain word before mass', '<p>word<sup>3</sup>H.</p>'],
  ['unknown following word', '<p><sup>3</sup>word.</p>'],
  ['uppercase word after mass', '<p><sup>3</sup>Hello.</p>'],
  ['unproven following element', '<p><sup>15</sup>N NMR.</p>'],
  ['signed exponent', '<p><sup>−3</sup>H.</p>'],
  ['nested styled attachment', '<p><sup><i>3</i></sup>H.</p>', ['^{3}H']],
  ['source space after mass', '<p><sup>3</sup> H.</p>'],
  ['inline code', '<p><code><sup>3</sup>H</code>.</p>'],
  ['preformatted paragraph', '<pre><p><sup>3</sup>H</p></pre>'],
]) {
  test(`synthetic isotope qualification preserves existing role: ${name}`, () => {
    const page = parse(content);
    assert.deepEqual(page.semantic.scientificRuns.map(run => run.tex), existingRuns);
  });
}

test('synthetic citation cues and typed MathJax remain separate from leading isotope roles', () => {
  const page = parse('<p>Cite <sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>H; '
    + '<sup><a href="#ref-CR2">2</a></sup>C; <span class="mathjax-tex">\\({}^{13}\\mathrm{C}\\)</span>.</p>'
    + '<ol class="c-article-references"><li id="ref-CR1"><p>Alpha, A. First. Journal (2020).</p></li>'
    + '<li id="ref-CR2"><p>Beta, B. Second. Journal (2021).</p></li></ol>');
  assert.deepEqual(page.semantic.scientificRuns, []);
  assert.deepEqual(page.semantic.citations.map(citation => citation.numbers), [[1], [2]]);
  assert.deepEqual(page.semantic.inlineMath.map(math => math.tex), ['{}^{13}\\mathrm{C}']);
});

for (const dialect of ['markdown', 'links', 'quarto']) {
  test(`synthetic isotope rendering preserves measurements, brackets, true powers and code (${dialect})`, async () => {
    const result = await clipNature({html:article('<p>Measurement 2.05 <sup>1</sup>H NMR; tracer [<sup>3</sup>H]-TBOB; '
      + 'coupling <sup>19</sup>F; power 10<sup>3</sup>H; <code>2.05 ^{1} H</code>.</p>'), url, citationStyle:dialect});
    assert.ok(result.markdown.includes('2.05 $^{1}H$ NMR'));
    assert.ok(result.markdown.includes('[$^{3}H$]-TBOB'));
    assert.ok(result.markdown.includes('$^{19}F$'));
    assert.ok(result.markdown.includes('$10^{3}$H') || result.markdown.includes('$10^{3}$ H'));
    assert.ok(result.markdown.includes('`2.05 ^{1} H`'));
    assert.deepEqual(result.debug.warnings, ['No Nature figures were detected.', 'No equation nodes were detected.', 'No Nature reference list was detected.']);
    for (const key of ['mathValidation','rawHtmlValidation','markdownStructure','crossReferenceValidation']) assert.equal(result.debug[key].valid, true, key);
  });
}
