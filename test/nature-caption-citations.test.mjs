import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature, referencesBib } from '../src/clip.mjs';
import { parseNaturePage } from '../src/adapters/nature.mjs';
import { withDomGlobals } from '../src/dom-runtime.mjs';
import { defuddleToMarkdown } from '../src/markdown.mjs';
import { normalizeAnchorMarkers } from '../src/normalizers/citations.mjs';
import { outputPolicy } from '../src/renderers/output-policy.mjs';
import { normalizeFigureCaptions, renderFigure } from '../src/normalizers/figures.mjs';

const fixtures = new URL('./fixtures/nature-caption-citations/', import.meta.url);
const cases = new Map(await Promise.all(['scientific-reports', 'section-links', 'internal-links'].map(async (name) => {
  const bytes = await readFile(new URL(`${name}.excerpt.html`, fixtures));
  const provenance = JSON.parse(await readFile(new URL(`${name}.provenance.json`, fixtures), 'utf8'));
  return [name, { bytes, html: bytes.toString('utf8'), provenance }];
})));
const clean = (value) => String(value).replace(/\s+/gu, ' ').trim();
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function readable(markdown, references = []) {
  const numberByKey = new Map(references.map((reference) => [reference.citationKey, reference.number]));
  return clean(markdown
    .replace(/\[\^([0-9]+)\]/gu, '$1')
    .replace(/\[((?:@[A-Za-z0-9_-]+(?:;\s*)?)+)\]/gu, (_match, keys) => (
      Array.from(keys.matchAll(/@([A-Za-z0-9_-]+)/gu), (match) => numberByKey.get(match[1])).join(',')
    ))
    .replace(/\[([^\]]+)\]\([^\n)]+\)/gu, '$1')
    .replace(/\*\*([^*]+)\*\*/gu, '$1')
    .replace(/\\([()[\]_*])/gu, '$1'));
}

function sourceCitationClusters(document) {
  return Array.from(document.querySelectorAll('.c-article-body sup')).flatMap((sup) => {
    const anchors = Array.from(sup.querySelectorAll('a[data-test="citation-ref"]'));
    return anchors.length ? [anchors.map((anchor) => Number(anchor.textContent))] : [];
  });
}

test('caption regressions retain reviewed source bytes, creators, and figure topology', () => {
  for (const { bytes, html, provenance } of cases.values()) {
    assert.equal(sha256(bytes), provenance.fixtureSha256);
    assert.equal(bytes.length, provenance.fixtureBytes);
    assert.equal(html.includes('\r'), false);
    assert.equal(bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])), false);
    assert.equal(provenance.repeatByteEqual, true);
    assert.equal(provenance.idempotent, true);
    const dom = new JSDOM(html);
    const document = dom.window.document;
    assert.deepEqual(Array.from(document.querySelectorAll('meta[name="citation_author"]'), (node) => node.content), provenance.sourceRights.orderedSourceCreators);
    for (const expected of provenance.figures) {
      const label = document.getElementById(expected.id);
      assert.ok(label, expected.id);
      const figure = label.closest('figure');
      const description = figure.querySelector('[data-test="bottom-caption"]');
      assert.equal(clean(description.textContent), expected.descriptionText);
      assert.equal(description.parentElement.className, 'c-article-section__figure-content');
      assert.equal(description.previousElementSibling.className, 'c-article-section__figure-item');
    }
    dom.window.close();
  }
});

for (const citationStyle of ['markdown', 'links', 'quarto']) {
  test(`real Scientific Reports captions and ordered citations render once in ${citationStyle}`, async () => {
    const { html, provenance } = cases.get('scientific-reports');
    const source = new JSDOM(html);
    const expectedClusters = sourceCitationClusters(source.window.document);
    const result = await clipNature({ html, url: provenance.url, citationStyle });
    assert.deepEqual(result.semantic.citations.map((item) => item.numbers), expectedClusters);
    assert.deepEqual(result.figures.map((figure) => figure.natureId), ['Fig1', 'Fig2', 'Fig3', 'Fig4']);
    assert.equal(result.references.length, 74);
    const finalText = readable(result.markdown, result.references);
    const positionText = finalText.replace(/\s/gu, '');
    for (const [index, expected] of provenance.figures.entries()) {
      const figure = result.figures[index];
      assert.equal(readable(figure.captionMarkdown, result.references), clean(`${expected.label} ${expected.descriptionText}`));
      assert.equal(finalText.split(expected.descriptionText).length - 1, 1, `${expected.id} complete caption body rendered once`);
      assert.equal(finalText.split(expected.captionStart).length - 1, 1, `${expected.id} caption start rendered once`);
      const sourceTailCount = provenance.figures.reduce((count, caption) => count + caption.descriptionText.split(expected.captionEnd).length - 1, 0);
      assert.equal(finalText.split(expected.captionEnd).length - 1, sourceTailCount, `${expected.id} caption tail retains its source multiplicity`);
      assert.deepEqual(Array.from(figure.captionMarkdown.matchAll(/\*\*([a-z])\*\*/gu), (match) => match[1]), expected.boldLetters);
      const figurePosition = positionText.indexOf(expected.captionStart.replace(/\s/gu, ''));
      if (expected.previousText) {
        const previousPosition = positionText.indexOf(expected.previousText.slice(0, 70).replace(/\s/gu, ''));
        assert.ok(previousPosition >= 0 && previousPosition < figurePosition, `${expected.id} follows source paragraph`);
      }
      if (expected.nextText) {
        const nextPosition = positionText.indexOf(expected.nextText.slice(0, 70).replace(/\s/gu, ''));
        assert.ok(nextPosition >= 0 && figurePosition < nextPosition, `${expected.id} precedes source paragraph`);
      }
      assert.ok(result.markdown.includes(`![${figure.alt}](${figure.imageUrl})`), 'original remote image fallback remains');
    }
    assert.equal(result.debug.rawHtmlValidation.valid, true, JSON.stringify(result.debug.rawHtmlValidation.violations));
    assert.equal(result.debug.mathValidation.valid, true, JSON.stringify(result.debug.mathValidation.issues));
    assert.equal(result.debug.mathValidation.scientificFragments.valid, true);
    assert.equal(result.debug.markdownStructure.valid, true);
    assert.equal(result.debug.crossReferenceValidation.valid, true);
    assert.doesNotMatch(result.markdown, /ACADEMICCLIPPER|<a\s+[^>]*href=/u);
    assert.doesNotMatch(result.bodyMarkdown, /^\[\^\d+\]:/mu, 'Defuddle must not invent prose footnotes from figure targets');
    const figure3 = result.figures[2].captionMarkdown;
    if (citationStyle === 'markdown') assert.match(figure3, /\[\^74\][\s\S]*\[\^56\]/u);
    else if (citationStyle === 'links') assert.match(figure3, /\[74\]\(#ref-74\)[\s\S]*\[56\]\(#ref-56\)/u);
    else {
      const first = figure3.indexOf(`[@${result.references[73].citationKey}]`);
      const second = figure3.indexOf(`[@${result.references[55].citationKey}]`);
      assert.ok(first >= 0 && second > first, 'original 74,56 order maps to the matching reference keys');
      const bibliography = referencesBib(result.references);
      for (const key of Array.from(figure3.matchAll(/@([A-Za-z0-9_-]+)/gu), (match) => match[1])) assert.ok(bibliography.includes(`{${key},`), key);
    }
    const repeated = await clipNature({ html, url: provenance.url, citationStyle });
    assert.equal(repeated.markdown, result.markdown);
    assert.equal(referencesBib(repeated.references), referencesBib(result.references));
    source.window.close();
  });

  test(`real Figure 3 citation superscripts produce valid citation output in ${citationStyle}`, async () => {
    const { html, provenance } = cases.get('scientific-reports');
    const result = await clipNature({ html, url: provenance.url, citationStyle });
    assert.equal(result.debug.rawHtmlValidation.valid, true, JSON.stringify(result.debug.rawHtmlValidation.violations));
    assert.equal(result.debug.mathValidation.valid, true, JSON.stringify(result.debug.mathValidation.issues));
    assert.doesNotMatch(result.figures[2].captionMarkdown, /\$\^\{|<a\b/u, 'citations are not superscript math or raw anchors');
    if (citationStyle !== 'quarto') {
      const definitionPattern = citationStyle === 'markdown' ? /^\[\^(\d+)\]:/gmu : /^(\d+)\. .*<a id="ref-\d+"><\/a>/gmu;
      assert.deepEqual(Array.from(result.referencesMarkdown.matchAll(definitionPattern), (match) => Number(match[1])), Array.from({ length: 74 }, (_item, index) => index + 1));
      assert.equal((result.markdown.match(definitionPattern) || []).length, 74, 'each source reference definition is emitted once');
    }
  });

  test(`real COVID caption Methods references use retained section targets in ${citationStyle}`, async () => {
    const { html, provenance } = cases.get('section-links');
    const result = await clipNature({ html, url: provenance.url, citationStyle });
    const target = citationStyle === 'quarto' ? '#sec-methods' : '#methods';
    assert.ok(result.markdown.includes(`## Methods${citationStyle === 'quarto' ? ' {#sec-methods}' : ''}`));
    for (const figure of result.figures) {
      assert.ok(figure.captionMarkdown.includes(`[Methods](${target})`), `${figure.natureId} resolves Methods`);
      assert.doesNotMatch(figure.captionMarkdown, /\/articles\/s41586-020-2012-7#Sec2/u);
    }
    assert.equal(result.debug.rawHtmlValidation.valid, true);
    assert.equal(result.debug.crossReferenceValidation.valid, true);
  });
}

test('real quantum numeric internal links remain links through Defuddle and retain closing punctuation', async () => {
  const { html, provenance } = cases.get('internal-links');
  const source = new JSDOM(html);
  const sourceFigureLinks = Array.from(source.window.document.querySelectorAll('a[href]'))
    .filter((anchor) => /#Fig[1-6]$/u.test(anchor.getAttribute('href')))
    .map((anchor) => ({ label: anchor.textContent, id: anchor.getAttribute('href').split('#')[1] }));
  const page = parseNaturePage(html, provenance.url);
  const converted = await withDomGlobals(page.dom, () => defuddleToMarkdown(page.document, provenance.url));
  assert.doesNotMatch(converted.markdown, /^\[\^\d+\]:/mu, 'figure/table targets must not become prose footnote definitions');
  assert.doesNotMatch(converted.markdown, /see Table \[\^\d+\]/u);
  assert.match(converted.markdown, /see Table \[1\]\([^\n]+\)\)\./u);
  assert.match(converted.markdown, /see Table \[1\)\]\([^\n]+\)\./u);
  for (const style of ['markdown', 'links', 'quarto']) {
    const policy = outputPolicy(style);
    const body = normalizeAnchorMarkers(converted.markdown, page.semantic.crossReferences.values(), { policy });
    if (style === 'markdown') {
      assert.match(body, /\(see Table 1\)\./u);
      assert.doesNotMatch(body, /\]\(#(?:figure|table)-/u);
    } else {
      const prefix = style === 'quarto' ? 'tbl-' : '';
      assert.match(body, new RegExp(`\\(see Table \\[1\\]\\(#${prefix}table-1\\)\\)\\.`, 'u'));
      assert.match(body, new RegExp(`\\(see Table \\[1\\)\\]\\(#${prefix}table-1\\)\\.`, 'u'));
      const figurePrefix = style === 'quarto' ? 'fig-' : '';
      for (const { label, id } of sourceFigureLinks) {
        assert.ok(body.includes(`[${label}](#${figurePrefix}${page.semantic.crossReferences.get(id).anchor})`), `${id} retains the actual source link label`);
      }
    }
    await normalizeFigureCaptions(page.figures, provenance.url, {
      semantic: page.semantic, references: page.references, policy, headingContext: converted.markdown,
    });
    for (const id of ['Fig1', 'Fig6']) {
      const figure = page.figures.find((item) => item.natureId === id);
      assert.ok(converted.markdown.includes(`ACADEMICCLIPPERFIGURE${figure.anchor}X`), `${id} retains its source position`);
      const rendered = renderFigure(figure, figure.imageUrl, policy);
      if (style === 'links') assert.ok(rendered.includes(`<a id="${figure.anchor}"></a>`));
      if (style === 'quarto') assert.ok(rendered.includes(`{#fig-${figure.anchor}}`));
    }
  }
  source.window.close();
  page.dom.window.close();
});
