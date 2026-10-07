import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { parseNaturePage } from '../src/adapters/nature.mjs';
import { withDomGlobals } from '../src/dom-runtime.mjs';
import { htmlToMarkdown } from '../src/markdown.mjs';
import { normalizeAcademicInline } from '../src/normalizers/academic-inline.mjs';
import { normalizeCitations } from '../src/normalizers/citations.mjs';
import { normalizeMath } from '../src/normalizers/math.mjs';
import { outputPolicy } from '../src/renderers/output-policy.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';

const fixtureRoot = new URL('./fixtures/nature-styled-adjacency/', import.meta.url);
const provenance = JSON.parse(await readFile(new URL('s41586-023-06735-9.provenance.json', fixtureRoot), 'utf8'));
const html = await readFile(new URL(provenance.article.fixturePath, fixtureRoot), 'utf8');
const observed = JSON.parse(await readFile(new URL('boundary-evidence.json', fixtureRoot), 'utf8'));
const opened = [];
after(() => { for (const dom of opened) dom.window.close(); });

async function renderBoundary(markup, actualDisplay = false) {
  const clone = new JSDOM(html);
  opened.push(clone);
  if (!actualDisplay) {
    // Explicit synthetic algorithm controls change a disposable clone only.
    // The one actual model fragment is copied verbatim from the original source.
    const paragraph = clone.window.document.querySelector(provenance.sourceParagraph.fixtureSelector);
    paragraph.id = 'styled-boundary-control';
    paragraph.innerHTML = markup;
  }
  const page = parseNaturePage(clone.serialize(), provenance.url);
  opened.push(page.dom);
  assert.equal(page.tables.length, 0);
  const carrier = actualDisplay
    ? `<p>${page.semantic.displayMath[0].marker}</p>`
    : page.document.querySelector('#styled-boundary-control').outerHTML;
  const converted = await withDomGlobals(page.dom, () => htmlToMarkdown(carrier, provenance.url));
  const relevant = items => items.filter(item => converted.includes(item.marker));
  const rendered = normalizeCitations(normalizeAcademicInline(normalizeMath(converted, page.semantic)), page.semantic.citations, {policy:outputPolicy('markdown'), references:page.references});
  return {rendered, scientific:relevant(page.semantic.scientificRuns).map(item => item.tex), inline:relevant(page.semantic.inlineMath).map(item => item.tex), display:relevant(page.semantic.displayMath).map(item => item.tex), citations:relevant(page.semantic.citations).flatMap(item => item.numbers), math:validateMathDelimiters(rendered)};
}

const sourceTerms = ['128x0e','64x1x','32x2e'];
const checks = {
  'actual-model-zero-gap': result => {
    assert.deepEqual(result.scientific, sourceTerms);
    assert.equal(result.rendered.replace(/\$/gu, ''), provenance.sourceParagraph.text);
    assert.doesNotMatch(result.rendered, /[\^_{}×]|\\(?:times|cdot)/u);
  },
  'synthetic-single-space': result => {
    assert.deepEqual(result.scientific, ['128x','0e']);
    assert.equal(result.rendered, '$128x$ $0e$');
  },
  'synthetic-thin-space': result => {
    assert.deepEqual(result.scientific, ['128x','0e']);
    assert.equal(result.rendered, '$128x$\u2009$0e$');
  },
  'synthetic-operator': result => {
    assert.deepEqual(result.scientific, ['128x','0e']);
    assert.equal(result.rendered, '$128x$ + $0e$');
  },
  'synthetic-true-sup': result => {
    assert.deepEqual(result.scientific, ['x^{0}']);
    assert.ok(result.rendered.includes('$x^{0}$'));
    assert.ok(result.rendered.startsWith('128'));
  },
  'synthetic-true-sub': result => {
    assert.deepEqual(result.scientific, ['x_{0}']);
    assert.ok(result.rendered.includes('$x_{0}$'));
    assert.ok(result.rendered.startsWith('128'));
  },
  'synthetic-bold': result => {
    assert.deepEqual(result.scientific, ['128\\mathbf{x}0\\mathbf{e}']);
    assert.equal(result.rendered, '$128\\mathbf{x}0\\mathbf{e}$');
  },
  'synthetic-wrapper': result => {
    assert.deepEqual(result.scientific, ['128x']);
    assert.equal(result.rendered, '$128x$0*e*');
  },
  'synthetic-opaque-inline': result => {
    assert.deepEqual(result.scientific, ['128x']);
    assert.deepEqual(result.inline, ['$e^{0}$']);
    assert.deepEqual(result.display, []);
    assert.equal(result.rendered, '$128x$ $e^{0}$');
  },
  'synthetic-adjacent-opaque-inline': result => {
    // This independent existing malformed input is an identity boundary control,
    // not real publisher evidence or a claim that this separate defect is fixed.
    assert.deepEqual(result.inline, ['$x$','$e$']);
    assert.deepEqual(result.scientific, []);
    assert.deepEqual(result.display, []);
  },
  'synthetic-double-dollar-span-without-display-wrapper': result => {
    assert.deepEqual(result.inline, ['e^{0}']);
    assert.deepEqual(result.display, []);
    assert.equal(result.rendered, '$128x$ $e^{0}$');
  },
  'synthetic-inline-code': result => {
    assert.deepEqual(result.scientific, ['128x']);
    assert.ok(result.rendered.includes('`$0e$$1x$`'));
  },
  'synthetic-legacy-inline': result => {
    assert.equal(result.rendered, '$128x$ $e^{0}$');
    assert.deepEqual(result.display, []);
  },
  'synthetic-legacy-display': result => {
    assert.equal(result.rendered, '$$\ne^{0}\n$$');
    assert.equal(result.math.displayMathCount, 1);
  },
  'synthetic-citation-boundary': result => {
    assert.deepEqual(result.citations, [30]);
    assert.deepEqual(result.scientific, ['128x0e']);
    assert.ok(result.rendered.endsWith('[^30]'));
    assert.doesNotMatch(result.rendered, /\^\{30\}/u);
  },
  'actual-source-equ1-display-control': result => {
    assert.deepEqual(result.display, [provenance.sourceDisplay.sourceTeX]);
    assert.deepEqual(result.inline, []);
    assert.equal(result.math.displayMathCount, 1);
  },
};

for (const record of observed.records) {
  test(`styled range boundary: ${record.id}`, async t => {
    assert.equal(typeof checks[record.id], 'function');
    const result = await renderBoundary(record.markup, record.id === 'actual-source-equ1-display-control');
    t.diagnostic(JSON.stringify({id:record.id,sourceEvidence:!record.synthetic,scientific:result.scientific,inline:result.inline,displayCount:result.display.length,citations:result.citations,mathValid:result.math.valid,issueTypes:result.math.issues.map(issue => issue.type)}));
    checks[record.id](result);
    assert.doesNotMatch(result.rendered, /ACADEMICCLIPPER[A-Z0-9-]+X/u);
    if (record.id !== 'synthetic-adjacent-opaque-inline') assert.equal(result.math.valid, true);
  });
}

// New explicit synthetic tail controls prevent the longer range from detaching
// a styled base from a genuine scientific attachment, including source whitespace.
for (const [tag,space,tex] of [['sup','','e^{a}'],['sub','','e_{i}'],['sup','\u2009','e^{a}'],['sub',' ','e_{i}']]) {
  test(`synthetic tail attachment remains scientific: ${tag}/${space ? 'space' : 'zero gap'}`, async t => {
    const attachment = tag === 'sup' ? 'a' : 'i';
    const result = await renderBoundary(`128<i>x</i>0<i>e</i>${space}<${tag}>${attachment}</${tag}>`);
    t.diagnostic(JSON.stringify({scientific:result.scientific,rendered:result.rendered,mathValid:result.math.valid}));
    assert.deepEqual(result.scientific, ['128x',tex]);
    assert.ok(result.rendered.includes(`$${tex}$`));
    assert.equal(result.math.valid, true);
    assert.deepEqual(result.citations, []);
  });
}
