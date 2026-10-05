import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature, referencesBib } from '../src/clip.mjs';
import { parseNaturePage } from '../src/adapters/nature.mjs';

const folder = new URL('./fixtures/nature-scientific-citations/', import.meta.url);
const fixtures = await Promise.all(['quantum', 'chemistry'].map(async (kind) => {
  const bytes = await readFile(new URL(`${kind}.excerpt.html`, folder));
  const provenance = JSON.parse(await readFile(new URL(`${kind}.provenance.json`, folder), 'utf8'));
  return { kind, bytes, html: bytes.toString('utf8'), provenance };
}));
const compact = (value) => String(value).replace(/\s/gu, '');
const citationSelector = 'a[data-test="citation-ref"], a[href*="#ref-CR"]';
const sourceClusters = (root) => Array.from(root.querySelectorAll('sup')).flatMap((sup) => (
  sup.querySelector(citationSelector)
    ? [Array.from(sup.querySelectorAll(citationSelector), (anchor) => Number(anchor.textContent))]
    : []
));

// These are attribute-only boundary variants of the frozen original nodes,
// not additional source evidence. Their labels, order, base and prose stay intact.
function withSingleCitationCue(fixture, item, cue) {
  const dom = new JSDOM(fixture.html);
  try {
    for (const original of item.sourceAnchors) {
      const anchor = dom.window.document.getElementById(original.id);
      assert.equal(anchor.getAttribute('href'), original.href);
      assert.equal(anchor.getAttribute('data-test'), 'citation-ref');
      anchor.removeAttribute(cue === 'data-test-only' ? 'href' : 'data-test');
      assert.ok(anchor.matches(citationSelector));
    }
    return dom.serialize();
  } finally {
    dom.window.close();
  }
}

function assertAdapterCitation(html, fixture, item) {
  const page = parseNaturePage(html, fixture.provenance.url);
  try {
    assert.ok(page.semantic.citations.some((citation) => JSON.stringify(citation.numbers) === JSON.stringify(item.sourceNumbers)), 'the typed source SUP survives as the original citation cluster');
    for (const { tex } of page.semantic.scientificRuns) {
      assert.equal(tex.includes(`^{${item.sourceNumbers.join(',')}}`), false, 'citation numbers never become a scientific exponent');
    }
  } finally {
    page.dom.window.close();
  }
}

async function assertRenderedCitation(t, html, fixture, item, citationStyle) {
  const { provenance } = fixture;
  const source = new JSDOM(html);
  try {
    const expectedClusters = sourceClusters(source.window.document);
    const result = await clipNature({ html, url: provenance.url, citationStyle });
    if (fixture.kind === 'chemistry' && !result.debug.mathValidation.valid) {
      t.diagnostic(`Complete-source paragraph has an independent chemical-subscript validator failure: ${JSON.stringify(result.debug.mathValidation.scientificFragments.issues)}`);
    }
    assert.deepEqual(result.semantic.citations.map((citation) => citation.numbers), expectedClusters, 'all selected paragraph clusters retain original order and numbers');
    assert.equal(result.references.length, provenance.retainedReferencePrefix);
    const references = new Map(result.references.map((reference) => [reference.number, reference]));
    const citation = citationStyle === 'markdown'
      ? item.sourceNumbers.map((number) => `[^${number}]`).join('')
      : citationStyle === 'links'
        ? item.sourceNumbers.map((number) => `[${number}](#ref-${number})`).join(', ')
        : `[${item.sourceNumbers.map((number) => `@${references.get(number).citationKey}`).join('; ')}]`;
    const bases = item.scientificBase.tex
      ? [`$${item.scientificBase.tex}$`]
      : [`**${item.scientificBase.text}**`, `$\\mathbf{${item.scientificBase.text}}$`];
    const body = result.markdown.split('\n## References\n')[0];
    assert.ok(bases.some((base) => compact(body).includes(compact(`${base}${citation}${item.afterCitationText}`))), 'original math or bold compound, ordered citation and following prose remain adjacent with separate identities');
    assert.doesNotMatch(body, /\^\{(?:58,64|42,58|33,34)\}/u);
    assert.doesNotMatch(result.markdown, /ACADEMICCLIPPER|<sup\b|<a\s+[^>]*href=/u);
    assert.equal(result.debug.rawHtmlValidation.valid, true);
    assert.equal(result.debug.markdownStructure.valid, true);
    assert.equal(result.debug.crossReferenceValidation.valid, true);
    if (fixture.kind === 'quantum') {
      assert.equal(result.debug.mathValidation.valid, true);
      assert.equal(result.debug.mathValidation.scientificFragments.valid, true);
    }
    if (citationStyle === 'quarto') {
      const bibliography = referencesBib(result.references);
      for (const number of item.sourceNumbers) assert.ok(bibliography.includes(`{${references.get(number).citationKey},`));
      assert.equal(result.referencesMarkdown, '');
    } else {
      const pattern = citationStyle === 'markdown' ? /^\[\^(\d+)\]:/gmu : /^(\d+)\. .*<a id="ref-\d+"><\/a>/gmu;
      assert.deepEqual(Array.from(result.referencesMarkdown.matchAll(pattern), (match) => Number(match[1])), Array.from({ length: provenance.retainedReferencePrefix }, (_value, index) => index + 1));
    }
  } finally {
    source.window.close();
  }
}

test('scientific-adjacent citation excerpts retain source bytes, complete creators, roles and attachment', () => {
  for (const { bytes, html, provenance } of fixtures) {
    assert.equal(createHash('sha256').update(bytes).digest('hex'), provenance.fixtureSha256);
    assert.equal(bytes.length, provenance.fixtureBytes);
    assert.equal(html.includes('\r'), false);
    assert.equal(bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])), false);
    assert.equal(provenance.repeatByteEqual, true);
    assert.equal(provenance.idempotent, true);
    const dom = new JSDOM(html);
    const document = dom.window.document;
    assert.deepEqual(Array.from(document.querySelectorAll('meta[name="citation_author"]'), (node) => node.content), provenance.sourceRights.orderedSourceCreators);
    const references = Array.from(document.querySelectorAll('ol.c-article-references > li'));
    assert.equal(references.length, provenance.retainedReferencePrefix);
    for (const item of provenance.cases) {
      const paragraph = document.querySelector(item.selector);
      assert.ok(paragraph, item.selector);
      assert.deepEqual(sourceClusters(paragraph), item.paragraphCitationClusters);
      const cluster = paragraph.querySelector(`#${item.sourceAnchors[0].id}`).closest('sup');
      assert.deepEqual(Array.from(cluster.querySelectorAll('a[data-test="citation-ref"]'), (anchor) => Number(anchor.textContent)), item.sourceNumbers);
      assert.equal(cluster.previousSibling.tagName, item.scientificBase.tag);
      assert.equal(cluster.previousSibling.textContent, item.scientificBase.text);
      assert.equal(cluster.nextSibling.textContent, item.afterCitationText);
      for (const anchor of item.sourceAnchors) {
        assert.equal(document.getElementById(anchor.id).getAttribute('href'), anchor.href);
        assert.equal(document.getElementById(anchor.id).getAttribute('data-test'), 'citation-ref');
        assert.ok(references[Number(anchor.label) - 1].querySelector(`#ref-CR${anchor.label}`));
      }
    }
    dom.window.close();
  }
});

for (const fixture of fixtures) {
  for (const item of fixture.provenance.cases) {
    test(`${fixture.kind} original cluster ${item.clusterIndexInBOracle} retains citation identity at the adapter boundary`, () => {
      assertAdapterCitation(fixture.html, fixture, item);
    });

    for (const citationStyle of ['markdown', 'links', 'quarto']) {
      test(`${fixture.kind} original cluster ${item.clusterIndexInBOracle} remains attached to its scientific base in ${citationStyle}`, async (t) => {
        await assertRenderedCitation(t, fixture.html, fixture, item, citationStyle);
      });
    }

    for (const cue of ['data-test-only', 'href-only']) {
      test(`${fixture.kind} cluster ${item.clusterIndexInBOracle} selector boundary ${cue} retains adapter identity`, () => {
        assertAdapterCitation(withSingleCitationCue(fixture, item, cue), fixture, item);
      });
      for (const citationStyle of ['markdown', 'links', 'quarto']) {
        test(`${fixture.kind} cluster ${item.clusterIndexInBOracle} selector boundary ${cue} retains attachment in ${citationStyle}`, async (t) => {
          await assertRenderedCitation(t, withSingleCitationCue(fixture, item, cue), fixture, item, citationStyle);
        });
      }
    }
  }
}

const quantum = fixtures.find((fixture) => fixture.kind === 'quantum');
const genuineExponential = (tex) => compact(tex).replace(/−/gu, '-') === 'e^{-2r}';

test('original non-citation scientific SUP remains an exponent at the adapter boundary', () => {
  const source = new JSDOM(quantum.html);
  const page = parseNaturePage(quantum.html, quantum.provenance.url);
  try {
    const paragraph = source.window.document.querySelector(quantum.provenance.cases[0].selector);
    const sup = Array.from(paragraph.querySelectorAll('sup')).find((node) => node.textContent === '−2r');
    assert.ok(sup, 'the complete original paragraph supplies the negative control');
    assert.equal(sup.previousSibling.outerHTML, '<i>e</i>');
    assert.equal(sup.innerHTML, '−2<i>r</i>');
    assert.equal(sup.querySelector(citationSelector), null, 'neither existing citation cue identifies this scientific SUP');
    assert.ok(page.semantic.scientificRuns.some(({ tex }) => genuineExponential(tex)));
    assert.ok(page.semantic.inlineMath.some(({ tex }) => compact(tex) === compact(quantum.provenance.cases[0].scientificBase.tex)), 'the intrinsic prime in original alpha TeX stays intact');
  } finally {
    page.dom.window.close();
    source.window.close();
  }
});

for (const citationStyle of ['markdown', 'links', 'quarto']) {
  test(`original non-citation scientific SUP remains an attached exponent in ${citationStyle}`, async () => {
    const result = await clipNature({ html: quantum.html, url: quantum.provenance.url, citationStyle });
    assert.ok(result.semantic.scientificRuns.some(({ tex }) => genuineExponential(tex)));
    assert.match(result.markdown, /\$e\^\{[−-]2r\}\$/u);
    assert.equal(result.debug.mathValidation.valid, true);
    assert.equal(result.debug.mathValidation.scientificFragments.valid, true);
    assert.equal(result.debug.rawHtmlValidation.valid, true);
  });
}
