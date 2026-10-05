import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { parseNaturePage } from '../src/adapters/nature.mjs';
import { clipNature, referencesBib } from '../src/clip.mjs';

const fixtureRoot = new URL('./fixtures/nature-sparse-figure-alt/', import.meta.url);
const articleId = 's41586-023-05896-x';
const fixtureBytes = await readFile(new URL(`${articleId}.excerpt.html`, fixtureRoot));
const html = fixtureBytes.toString('utf8');
const provenance = JSON.parse(await readFile(new URL(`${articleId}.provenance.json`, fixtureRoot), 'utf8'));
const clean = (value) => String(value).replace(/\s+/gu, ' ').trim();
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const source = new JSDOM(html, { url: provenance.url });
const sourceFigures = provenance.sourceFigures.map((expected) => {
  const wrapper = source.window.document.querySelector(expected.selector);
  const title = clean(wrapper.querySelector('figcaption').textContent);
  const number = title.match(/^Fig\.\s*(\d+):/u)?.[1];
  assert.ok(number, `original source caption label: ${expected.selector}`);
  assert.equal(wrapper.querySelector('[id^="Fig"]').id, `Fig${number}`);
  return { ...expected, sourceShortAlt: `Figure ${number}` };
});
source.window.close();

function readable(markdown, references) {
  const numberByKey = new Map(references.map((reference) => [reference.citationKey, reference.number]));
  return clean(markdown
    .replace(/(?:\[\^\d+\]){2,}/gu, (cluster) => (
      Array.from(cluster.matchAll(/\[\^(\d+)\]/gu), (match) => match[1]).join(',')
    ))
    .replace(/\[\^(\d+)\]/gu, '$1')
    .replace(/\[((?:@[A-Za-z0-9_-]+(?:;\s*)?)+)\]/gu, (_match, keys) => (
      Array.from(keys.matchAll(/@([A-Za-z0-9_-]+)/gu), (match) => numberByKey.get(match[1])).join(',')
    ))
    .replace(/\[([^\]]+)\]\([^\n)]+\)/gu, '$1')
    .replace(/\*\*([^*]+)\*\*/gu, '$1')
    .replace(/\*([^*]+)\*/gu, '$1')
    .replace(/\\([()[\]_*])/gu, '$1'));
}

function renderedImages(markdown) {
  return Array.from(markdown.matchAll(/!\[([^\]]*)\]\(([^\n)]*)\)/gu), (match) => ({
    alt: match[1], imageUrl: match[2], position: match.index,
  }));
}

test('sparse main-figure regression retains reviewed source bytes, rights, and complete figure blocks', () => {
  assert.equal(sha256(fixtureBytes), provenance.fixtureSha256);
  assert.equal(fixtureBytes.length, provenance.fixtureBytes);
  assert.equal(html.includes('\r'), false);
  assert.equal(fixtureBytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])), false);
  assert.equal(provenance.sourceBytes, 1251945);
  assert.equal(provenance.sourceSha256, '342b8dc5d0bf7d01618a3e9965ef6de9b23c59c7f7bef429592cbdb7852c36ec');
  assert.equal(provenance.repeatedBytesEqual, true);
  assert.equal(provenance.idempotentBytesEqual, true);
  assert.equal(provenance.admission.usableArticleDom, true);
  assert.equal(provenance.admission.jsonLdIsAccessibleForFree, true);
  assert.equal(provenance.sanitizerVersion, 'nature-corpus-sanitizer/1.1.0');
  assert.equal(provenance.serializerVersion, 'nature-corpus-subtree/1.0.0');
  assert.deepEqual(sourceFigures.map((figure) => figure.sourceId), ['Fig1', 'Fig3', 'Fig4', 'Fig5']);
  assert.deepEqual(sourceFigures.map((figure) => figure.sourceShortAlt), ['Figure 1', 'Figure 3', 'Figure 4', 'Figure 5']);
  assert.deepEqual(sourceFigures.map((figure) => figure.sourceWrapperSha256), [
    'a67baa58454b5076eb464f4c74d03fc02ba56af081e7ca81512805d02334e8f1',
    '0f62fea715fb860ff8ff262245ac20798dbb989ce926ea605434c87fee9fec11',
    'ef1abb9b5ba8717a76a24d4bc31b39cbc884bdba0280508cb3aebef94f86b0d4',
    '7ec9deb70e1b659a58c27b09ae5a9173c62cdeecdbdb00c85ea34bc8480e04b3',
  ]);
  const dom = new JSDOM(html, { url: provenance.url });
  const document = dom.window.document;
  assert.equal(document.querySelector('link[rel="canonical"]').href, provenance.url);
  assert.equal(document.querySelector('meta[name="citation_doi"]').content, provenance.doi);
  assert.deepEqual(Array.from(document.querySelectorAll('meta[name="citation_author"]'), (node) => node.content), provenance.sourceRights.orderedSourceCreators);
  assert.equal(provenance.sourceRights.orderedSourceCreators.length, 119);
  assert.equal(document.querySelector('#figure-2'), null, 'the real unselected Figure 2 is not synthesized');
  assert.equal(provenance.originalMainFigure2.presentInRaw, true);
  for (const expected of sourceFigures) {
    const wrapper = document.querySelector(expected.selector);
    const description = wrapper.querySelector('[data-test="bottom-caption"]');
    assert.equal(clean(description.textContent), expected.sourceDescriptionText);
    assert.equal(description.previousElementSibling.className, 'c-article-section__figure-item');
    assert.equal(description.parentElement.className, 'c-article-section__figure-content');
    assert.equal(clean(wrapper.previousElementSibling.textContent), expected.previousParagraph.sourceText);
    assert.equal(clean(wrapper.nextElementSibling.textContent), expected.nextParagraph.sourceText);
    assert.equal(new URL(wrapper.querySelector('img').getAttribute('src'), provenance.url).href, expected.sourceImageUrl);
    assert.equal(new URL(wrapper.querySelector('source[srcset]').getAttribute('srcset'), provenance.url).href, expected.expectedImageUrl);
    assert.deepEqual(Array.from(description.querySelectorAll('b'), (node) => clean(node.textContent)), expected.sourcePanelSequence);
  }
  for (const notice of provenance.sourceRights.notices) {
    assert.equal(clean(document.querySelector(notice.sourceSelector).textContent), notice.sourceNoticeText);
  }
  assert.equal(document.querySelector('#Sec18').textContent, 'Methods');
  assert.ok(document.querySelector('#Sec19 + p').textContent.trim(), 'real target context survives Defuddle');
  assert.equal(document.querySelectorAll('ol.c-article-references > li').length, 48);
  assert.equal(document.querySelectorAll('table,[data-test="table-link"]').length, 0, 'offline source needs no hydration/DNS/HTTP');
  assert.equal(document.querySelectorAll('script:not([type="application/ld+json"]),iframe,form,input,object,embed').length, 0);
  for (const node of document.querySelectorAll('*')) {
    assert.equal(Array.from(node.attributes).some((attribute) => /^on/iu.test(attribute.name)), false, 'sanitizer removed executable event attributes');
  }
  dom.window.close();
});

test('real sparse source figures use their source labels for adapter short alt', () => {
  const page = parseNaturePage(html, provenance.url);
  try {
    assert.deepEqual(page.figures.map((figure) => figure.natureId), sourceFigures.map((figure) => figure.sourceId));
    assert.deepEqual(page.figures.map((figure) => figure.label), sourceFigures.map((figure) => figure.expectedLabel));
    assert.deepEqual(page.figures.map((figure) => figure.alt), sourceFigures.map((figure) => figure.sourceShortAlt));
  } finally {
    page.dom.window.close();
  }
});

for (const citationStyle of ['markdown', 'links', 'quarto']) {
  const result = await clipNature({ html, url: provenance.url, citationStyle });
  test(`real sparse source figures preserve captions, positions, resources, and validators in ${citationStyle}`, () => {
    assert.equal(result.metadata.title, provenance.title);
    assert.deepEqual(result.metadata.authors, provenance.sourceRights.orderedSourceCreators);
    assert.equal(result.references.length, 48);
    assert.equal(result.tables.length, 0, 'clipNature has no resources to hydrate');
    assert.deepEqual(result.figures.map((figure) => figure.natureId), sourceFigures.map((figure) => figure.sourceId));
    assert.deepEqual(result.figures.map((figure) => figure.anchor), sourceFigures.map((figure) => figure.expectedAnchor));
    assert.deepEqual(result.figures.map((figure) => figure.identity), sourceFigures.map((figure) => figure.expectedIdentity));
    assert.deepEqual(result.figures.map((figure) => figure.imageUrl), sourceFigures.map((figure) => figure.expectedImageUrl));
    assert.deepEqual(renderedImages(result.markdown).map((image) => image.imageUrl), sourceFigures.map((figure) => figure.expectedImageUrl));
    const positionText = readable(result.markdown, result.references).replace(/\s/gu, '');
    for (const [index, expected] of sourceFigures.entries()) {
      const figure = result.figures[index];
      assert.equal(figure.label, expected.expectedLabel);
      assert.equal(clean(figure.caption), expected.sourceCaptionText);
      assert.equal(readable(figure.captionMarkdown, result.references), expected.sourceCaptionText);
      assert.deepEqual(Array.from(figure.captionMarkdown.matchAll(/\*\*([^*]+)\*\*/gu), (match) => match[1]), expected.sourcePanelSequence);
      const image = renderedImages(result.markdown)[index];
      const renderedCaption = `**${expected.expectedLabel}.** ${figure.captionMarkdown.replace(/^Fig\.\s*\d+:\s*/u, '')}`;
      assert.equal(result.markdown.split(renderedCaption).length - 1, 1, `${expected.sourceId} renders its complete caption once`);
      const captionPosition = result.markdown.indexOf(renderedCaption);
      assert.ok(image.position < captionPosition, 'caption belongs to this source image');
      const previous = readable(expected.previousParagraph.sourceText.slice(0, 90), []).replace(/\s/gu, '');
      const next = readable(expected.nextParagraph.sourceText.slice(0, 90), []).replace(/\s/gu, '');
      const captionStart = readable(renderedCaption, result.references).slice(0, 90).replace(/\s/gu, '');
      const previousPosition = positionText.indexOf(previous);
      const figurePosition = positionText.indexOf(captionStart);
      const nextPosition = positionText.indexOf(next);
      assert.ok(previousPosition >= 0 && previousPosition < figurePosition, `${expected.sourceId} follows its original paragraph`);
      assert.ok(nextPosition >= 0 && figurePosition < nextPosition, `${expected.sourceId} precedes its original paragraph`);
      if (citationStyle === 'quarto') assert.ok(result.markdown.includes(`){#fig-${figure.anchor}}`));
      if (citationStyle === 'links') assert.ok(result.markdown.includes(`<a id="${figure.anchor}"></a>`));
    }
    assert.equal(result.debug.mathValidation.valid, true, JSON.stringify(result.debug.mathValidation.issues));
    assert.equal(result.debug.mathValidation.scientificFragments.valid, true);
    assert.equal(result.debug.markdownStructure.valid, true, JSON.stringify(result.debug.markdownStructure.issues));
    assert.equal(result.debug.rawHtmlValidation.valid, true, JSON.stringify(result.debug.rawHtmlValidation.violations));
    assert.equal(result.debug.crossReferenceValidation.valid, true, JSON.stringify(result.debug.crossReferenceValidation.issues));
    assert.deepEqual(result.debug.warnings, ['No equation nodes were detected.']);
    assert.doesNotMatch(result.markdown, /ACADEMICCLIPPER/u);
    if (citationStyle === 'quarto') {
      const bibliography = referencesBib(result.references);
      for (const key of Array.from(result.markdown.matchAll(/@([A-Za-z0-9_-]+)/gu), (match) => match[1])) {
        assert.ok(bibliography.includes(`{${key},`), key);
      }
    }
  });

  test(`real sparse source short alt renders Figure 1/3/4/5 with the matching source images in ${citationStyle}`, () => {
    assert.deepEqual(renderedImages(result.markdown).map(({ alt, imageUrl }) => ({ alt, imageUrl })), sourceFigures.map((figure) => ({
      alt: figure.sourceShortAlt, imageUrl: figure.expectedImageUrl,
    })));
  });
}

test('synthetic controls keep sequential id-less source labels and conservative unlabelled fallback', () => {
  const syntheticHtml = `<html><body><div class="c-article-body"><section data-title="Main">
    <h2>Main</h2><p>Synthetic control only, not a Nature source admission.</p>
    <figure><figcaption>Fig. 1: First id-less caption.</figcaption><img src="https://example.org/first.png"></figure>
    <figure><figcaption>Fig. 2: Second id-less caption.</figcaption><img src="https://example.org/second.png"></figure>
    <figure id="Fig90"><figcaption>Comparison of 47 samples without a source figure label.</figcaption><img src="https://example.org/third.png"></figure>
  </section></div></body></html>`;
  const page = parseNaturePage(syntheticHtml, 'https://www.nature.com/articles/synthetic-sparse-alt-controls');
  assert.deepEqual(page.figures.map((figure) => figure.natureId), ['', '', 'Fig90']);
  assert.deepEqual(page.figures.map((figure) => figure.label), ['Figure 1', 'Figure 2', 'Figure 3']);
  assert.deepEqual(page.figures.map((figure) => figure.alt), ['Figure 1', 'Figure 2', 'Figure 3']);
  assert.deepEqual(page.figures.map((figure) => figure.anchor), ['figure-1', 'figure-2', 'figure-3']);
  assert.deepEqual(page.figures.map((figure) => figure.identity), ['inline-figure-1', 'inline-figure-2', 'inline-figure-3']);
  page.dom.window.close();
});

test('synthetic Extended Data identity and alt stay distinct from the main ordinal sequence', () => {
  const syntheticHtml = `<html><body><div class="c-article-body"><section data-title="Main">
    <h2>Main</h2><p>Synthetic control only, not a Nature source admission.</p>
    <figure><figcaption>Fig. 1: Main caption.</figcaption><img src="https://example.org/main.png"></figure>
  </section><section data-title="Extended data figures and tables">
    <div id="Fig100" class="js-c-reading-companion-figures-item" data-test="supp-item">
      <h3>Extended Data Fig. 7: Original synthetic Extended Data label.</h3>
      <div class="c-article-supplementary__description">Separate synthetic description.</div>
      <img src="https://example.org/extended.png">
    </div>
  </section></div></body></html>`;
  const page = parseNaturePage(syntheticHtml, 'https://www.nature.com/articles/synthetic-sparse-alt-controls');
  assert.deepEqual(page.figures.map((figure) => ({ id: figure.natureId, identity: figure.identity, anchor: figure.anchor, alt: figure.alt, source: figure.source })), [
    { id: '', identity: 'inline-figure-1', anchor: 'figure-1', alt: 'Figure 1', source: 'inline figure' },
    { id: 'Fig100', identity: 'Fig100', anchor: 'extended-data-figure-7', alt: 'Extended Data Figure 7', source: 'supplementary figure' },
  ]);
  page.dom.window.close();
});
