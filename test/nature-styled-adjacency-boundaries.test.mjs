import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature } from '../src/clip.mjs';
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
  return {rendered, scientific:relevant(page.semantic.scientificRuns).map(item => item.tex), inline:relevant(page.semantic.inlineMath).map(item => item.tex), display:relevant(page.semantic.displayMath).map(item => item.tex), citations:relevant(page.semantic.citations).flatMap(item => item.numbers), math:validateMathDelimiters(rendered), typedInline:page.semantic.inlineMath, typedDisplay:page.semantic.displayMath};
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

// All controls below are explicitly synthetic and use disposable clones.
// MathJax is replaced by text markers before scientific ranges are collected;
// absence of an element child must not grant the new multi-node extension.
// Preserve the accepted single-node fallback, including its independent old
// nested-math failure, rather than treating that failure as repaired here.
const nestedInline = [
  {id:'initial', first:true, content:'<span class="mathjax-tex">$x$</span>', tex:'$x$', typed:['$x$']},
  {id:'candidate', first:false, content:'<span class="mathjax-tex">$e^{a}$</span>', tex:'$e^{a}$', typed:['$e^{a}$']},
  {id:'initial-mixed-text', first:true, content:'q<span class="mathjax-tex">$x$</span>r', tex:'q$x$r', typed:['$x$']},
  {id:'candidate-mixed-text', first:false, content:'q<span class="mathjax-tex">$e^{a}$</span>r', tex:'q$e^{a}$r', typed:['$e^{a}$']},
  {id:'initial-multiple', first:true, content:'<span class="mathjax-tex">$x$</span><span class="mathjax-tex">$y$</span>', tex:'$x$$y$', typed:['$x$','$y$']},
  {id:'candidate-multiple', first:false, content:'<span class="mathjax-tex">$e$</span><span class="mathjax-tex">$f$</span>', tex:'$e$$f$', typed:['$e$','$f$']},
];
for (const tag of ['i','b']) {
  const styledTex = content => tag === 'b' ? `\\mathbf{${content}}` : content;
  for (const record of nestedInline) {
    test(`synthetic typed inline stops extension: ${tag}/${record.id}`, async t => {
      const markup = record.first
        ? `128<${tag}>${record.content}</${tag}>0<i>e</i>`
        : `128<i>x</i>0<${tag}>${record.content}</${tag}>`;
      const result = await renderBoundary(markup);
      t.diagnostic(JSON.stringify({scientific:result.scientific,inline:result.typedInline.map(item => item.tex),rendered:result.rendered,mathValid:result.math.valid}));
      const expected = record.first ? [`128${styledTex(record.tex)}`,'0e'] : ['128x',`0${styledTex(record.tex)}`];
      assert.deepEqual(result.scientific, expected, 'New grouping must stop at the existing typed inline role');
      assert.deepEqual(result.typedInline.map(item => item.tex), record.typed);
      assert.deepEqual(result.typedDisplay.map(item => item.tex), [provenance.sourceDisplay.sourceTeX]);
    });
  }
  for (const first of [true,false]) {
    test(`synthetic typed display stops extension: ${tag}/${first ? 'initial' : 'candidate'}`, async t => {
      const display = `<${tag} class="c-article-equation"><span class="mathjax-tex">$$z^{2}$$</span></${tag}>`;
      const result = await renderBoundary(first ? `128${display}0<i>e</i>` : `128<i>x</i>0${display}`);
      const typed = result.typedDisplay.find(item => item.tex === 'z^{2}');
      assert.ok(typed, 'The explicitly typed display record must survive');
      // This disposable paragraph precedes the retained original Equ1 in DOM order.
      assert.deepEqual(result.typedDisplay.map(item => item.tex), ['z^{2}',provenance.sourceDisplay.sourceTeX]);
      assert.deepEqual(result.typedInline, []);
      const expected = first ? [`128${styledTex(typed.marker)}`,'0e'] : ['128x',`0${styledTex(typed.marker)}`];
      t.diagnostic(JSON.stringify({scientific:result.scientific,display:result.typedDisplay.map(item => item.tex),rendered:result.rendered,mathValid:result.math.valid}));
      assert.deepEqual(result.scientific, expected, 'New grouping must not extend across a display text marker');
      // The old fallback can still leave this nested display marker unresolved;
      // repairing that separate malformed mechanism is outside Issue #57.
    });
  }
  test(`synthetic multiple plain styled letters still group: ${tag}`, async () => {
    const result = await renderBoundary(`128<${tag}>xy</${tag}>0<${tag}>ef</${tag}>`);
    assert.deepEqual(result.scientific, [`128${styledTex('xy')}0${styledTex('ef')}`]);
    assert.deepEqual(result.typedInline, []);
    assert.equal(result.math.valid, true);
  });
}

test('synthetic earlier typed inline sibling does not block a later pure run', async () => {
  const result = await renderBoundary('<span class="mathjax-tex">\\(q\\)</span> 128<i>x</i>0<i>e</i>');
  assert.deepEqual(result.inline, ['q']);
  assert.deepEqual(result.scientific, ['128x0e']);
  assert.equal(result.rendered, '$q$ $128x0e$');
  assert.equal(result.math.valid, true);
});

test('synthetic earlier scientific marker sibling does not block a later pure run', async () => {
  const result = await renderBoundary('<i>x</i><sup>a</sup> 128<i>e</i>0<i>x</i>');
  assert.deepEqual(result.scientific, ['x^{a}','128e0x']);
  assert.equal(result.rendered, '$x^{a}$ $128e0x$');
  assert.equal(result.math.valid, true);
});

test('synthetic href citation at the tail remains a reference', async () => {
  const result = await renderBoundary('128<i>x</i>0<i>e</i><sup><a href="/articles/s41586-023-06735-9#ref-CR30">30</a></sup>');
  assert.deepEqual(result.scientific, ['128x0e']);
  assert.deepEqual(result.citations, [30]);
  assert.equal(result.rendered, '$128x0e$[^30]');
  assert.equal(result.math.valid, true);
});

for (const citationStyle of ['markdown','links','quarto']) {
  for (const first of [true,false]) {
    test(`synthetic nested inline full clip retains its accepted boundary: ${first ? 'initial' : 'candidate'}/${citationStyle}`, async t => {
      const clone = new JSDOM(html);
      opened.push(clone);
      const paragraph = clone.window.document.querySelector(provenance.sourceParagraph.fixtureSelector);
      paragraph.id = 'styled-typed-boundary';
      paragraph.innerHTML = `Independent synthetic control: ${first ? '128<i><span class="mathjax-tex">$x$</span></i>0<i>e</i>' : '128<i>x</i>0<i><span class="mathjax-tex">$e^{a}$</span></i>'}`;
      const result = await clipNature({html:clone.serialize(),url:provenance.url,citationStyle});
      const prepared = result.cleanedHtml.match(/<p id="styled-typed-boundary">[\s\S]*?<\/p>/u)?.[0];
      assert.ok(prepared);
      const scientific = result.semantic.scientificRuns.filter(item => prepared.includes(item.marker)).map(item => item.tex);
      const rendered = result.markdown.split('\n').find(line => line.includes('Independent synthetic control:'));
      t.diagnostic(JSON.stringify({scientific,rendered,mathValid:result.debug.mathValidation.valid,structure:result.debug.markdownStructure.valid,rawHtml:result.debug.rawHtmlValidation.valid,crossReferences:result.debug.crossReferenceValidation.valid}));
      assert.deepEqual(scientific, first ? ['128$x$','0e'] : ['128x','0$e^{a}$']);
      assert.deepEqual(result.semantic.inlineMath.map(item => item.tex), first ? ['$x$'] : ['$e^{a}$']);
      assert.equal(rendered, `Independent synthetic control: ${first ? '$128$x$$0e$' : '$128x$$0$e^{a}$'}`);
      assert.equal(result.debug.mathValidation.valid, false, 'This old malformed nested input must not newly pass after losing its typed role');
      assert.equal(result.semantic.displayMath.length, 1);
      assert.equal(result.semantic.displayMath[0].tex, provenance.sourceDisplay.sourceTeX);
    });
  }
}
