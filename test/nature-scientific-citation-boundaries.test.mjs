import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature, referencesBib } from '../src/clip.mjs';
import { parseNaturePage } from '../src/adapters/nature.mjs';

const folder = new URL('./fixtures/nature-scientific-citations/', import.meta.url);
const fixtures = new Map(await Promise.all(['quantum', 'chemistry'].map(async (kind) => [kind, {
  html: await readFile(new URL(`${kind}.excerpt.html`, folder), 'utf8'),
  provenance: JSON.parse(await readFile(new URL(`${kind}.provenance.json`, folder), 'utf8')),
}])));
const citationSelector = 'a[data-test="citation-ref"], a[href*="#ref-CR"]';
const compact = (value) => String(value).replace(/\s/gu, '');
const exponential = (tex) => compact(tex).replace(/−/gu, '-') === 'e^{-2r}';

// Lab variants change only the described representation of frozen original
// nodes. They are compatibility tests, not additional publisher-source rows.
function variant(fixture, item, mutate) {
  const dom = new JSDOM(fixture.html);
  try {
    const anchors = item.sourceAnchors.map(({ id }) => dom.window.document.getElementById(id));
    const sup = anchors[0].closest('sup');
    mutate(dom.window.document, sup, anchors);
    return dom.serialize();
  } finally {
    dom.window.close();
  }
}

async function assertCitationRepresentation(t, kind, mutate) {
  const fixture = fixtures.get(kind);
  const item = fixture.provenance.cases[0];
  const source = new JSDOM(fixture.html);
  const expected = Array.from(source.window.document.querySelectorAll('sup')).flatMap((sup) => (
    sup.querySelector(citationSelector)
      ? [Array.from(sup.querySelectorAll(citationSelector), (anchor) => Number(anchor.textContent))]
      : []
  ));
  source.window.close();
  const html = variant(fixture, item, mutate);
  for (const citationStyle of ['markdown', 'links', 'quarto']) {
    const result = await clipNature({ html, url: fixture.provenance.url, citationStyle });
    if (!result.debug.mathValidation.valid) {
      t.diagnostic(`Independent complete-source chemical-base failure retained: ${JSON.stringify(result.debug.mathValidation.scientificFragments.issues)}`);
    }
    assert.deepEqual(result.semantic.citations.map(({ numbers }) => numbers), expected);
    assert.equal(result.references.length, fixture.provenance.retainedReferencePrefix);
    const references = new Map(result.references.map((reference) => [reference.number, reference]));
    const citation = citationStyle === 'markdown'
      ? item.sourceNumbers.map((number) => `[^${number}]`).join('')
      : citationStyle === 'links'
        ? item.sourceNumbers.map((number) => `[${number}](#ref-${number})`).join(', ')
        : `[${item.sourceNumbers.map((number) => `@${references.get(number).citationKey}`).join('; ')}]`;
    const base = item.scientificBase.tex ? `$${item.scientificBase.tex}$` : `**${item.scientificBase.text}**`;
    assert.ok(compact(result.markdown).includes(compact(`${base}${citation}${item.afterCitationText}`)), 'original scientific base, citation and following source prose keep separate identities');
    assert.doesNotMatch(result.markdown, /ACADEMICCLIPPER|<sup\b|<a\s+[^>]*href=|\^\{(?:58,64|33,34)\}/u);
    assert.equal(result.debug.rawHtmlValidation.valid, true);
    assert.equal(result.debug.markdownStructure.valid, true);
    assert.equal(result.debug.crossReferenceValidation.valid, true);
    if (kind === 'quantum') assert.equal(result.debug.mathValidation.valid, true);
    if (citationStyle === 'quarto') {
      const bibliography = referencesBib(result.references);
      for (const number of item.sourceNumbers) assert.ok(bibliography.includes(`{${references.get(number).citationKey},`));
      assert.equal(bibliography, referencesBib(result.references));
    } else {
      const pattern = citationStyle === 'markdown' ? /^\[\^(\d+)\]:/gmu : /^(\d+)\. .*<a id="ref-\d+"><\/a>/gmu;
      assert.deepEqual(Array.from(result.referencesMarkdown.matchAll(pattern), (match) => Number(match[1])), Array.from({ length: fixture.provenance.retainedReferencePrefix }, (_value, index) => index + 1));
    }
  }
}

for (const prefix of ['fragment', 'absolute']) {
  test(`lab href-only citation ${prefix} prefix preserves ordered attachment in all dialects`, async (t) => {
    await assertCitationRepresentation(t, 'quantum', (_document, _sup, anchors) => {
      for (const anchor of anchors) {
        const target = new URL(anchor.getAttribute('href'), fixtures.get('quantum').provenance.url);
        anchor.removeAttribute('data-test');
        anchor.setAttribute('href', prefix === 'fragment' ? target.hash : target.href);
      }
    });
  });
}

for (const [label, whitespace] of [['ASCII', ' '], ['NBSP', '\u00a0']]) {
  test(`lab ${label} whitespace before compound citation preserves all dialects`, async (t) => {
    await assertCitationRepresentation(t, 'chemistry', (document, sup, _anchors) => {
      sup.before(document.createTextNode(whitespace));
    });
  });
}

test('lab italic labels with href-only cues retain citation identity in all dialects', async (t) => {
  await assertCitationRepresentation(t, 'chemistry', (document, _sup, anchors) => {
    for (const anchor of anchors) {
      anchor.removeAttribute('data-test');
      const italic = document.createElement('i');
      italic.textContent = anchor.textContent;
      anchor.replaceChildren(italic);
    }
  });
});

test('lab single-anchor href-only range expands original adjacent compound numbers in all dialects', async (t) => {
  await assertCitationRepresentation(t, 'chemistry', (_document, sup, anchors) => {
    anchors[0].removeAttribute('data-test');
    anchors[0].textContent = '33–34';
    sup.replaceChildren(anchors[0]);
  });
});

test('lab empty-label href fallback retains original citation numbers in all dialects', async (t) => {
  await assertCitationRepresentation(t, 'chemistry', (_document, _sup, anchors) => {
    for (const anchor of anchors) {
      anchor.removeAttribute('data-test');
      anchor.textContent = '';
    }
  });
});

for (const ordinary of ['whitespace', 'non-reference-anchor']) {
  test(`lab genuine scientific SUP ${ordinary} keeps its original exponent in all dialects`, async () => {
    const fixture = fixtures.get('quantum');
    const dom = new JSDOM(fixture.html);
    const document = dom.window.document;
    const paragraph = document.querySelector(fixture.provenance.cases[0].selector);
    const sup = Array.from(paragraph.querySelectorAll('sup')).find((node) => node.textContent === '−2r');
    assert.equal(sup.querySelector(citationSelector), null);
    if (ordinary === 'whitespace') sup.before(document.createTextNode(' \u00a0'));
    else {
      const href = paragraph.querySelector('a[href$="#MOESM1"]').getAttribute('href');
      const anchor = document.createElement('a');
      anchor.setAttribute('href', href);
      anchor.textContent = sup.firstChild.textContent;
      sup.firstChild.replaceWith(anchor);
      assert.equal(sup.querySelector(citationSelector), null, 'an ordinary link is not a typed citation');
    }
    const html = dom.serialize();
    dom.window.close();
    for (const citationStyle of ['markdown', 'links', 'quarto']) {
      const result = await clipNature({ html, url: fixture.provenance.url, citationStyle });
      assert.ok(result.semantic.scientificRuns.some(({ tex }) => exponential(tex)));
      assert.match(result.markdown, /\$e\^\{[−-]2r\}\$/u);
      assert.equal(result.debug.mathValidation.valid, true);
      assert.equal(result.debug.rawHtmlValidation.valid, true);
    }
  });
}

test('original MathJax source TeX remains opaque to scientific citation eligibility', () => {
  const fixture = fixtures.get('quantum');
  const dom = new JSDOM(fixture.html);
  const expected = Array.from(dom.window.document.querySelectorAll('.mathjax-tex'), (node) => node.textContent.trim().slice(2, -2).trim());
  const page = parseNaturePage(fixture.html, fixture.provenance.url);
  try {
    assert.deepEqual(page.semantic.inlineMath.map(({ tex }) => tex), expected);
  } finally {
    dom.window.close();
    page.dom.window.close();
  }
});
