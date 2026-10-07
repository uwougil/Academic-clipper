import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature, referencesBib, referencesMarkdown } from '../src/clip.mjs';
import { parseNaturePage } from '../src/adapters/nature.mjs';
import { withDomGlobals } from '../src/dom-runtime.mjs';
import { outputPolicy } from '../src/renderers/output-policy.mjs';
import { validateRawHtml } from '../src/validators/html-audit.mjs';

const directory = new URL('./fixtures/nature-reference-literal/', import.meta.url);
const bytes = await readFile(new URL('materials-reference-literal.excerpt.html', directory));
const html = new TextDecoder('utf8', { fatal: true }).decode(bytes);
const provenance = JSON.parse(await readFile(new URL('source-provenance.json', directory), 'utf8'));
const sourceDom = new JSDOM(html);
const source = sourceDom.window.document;
const page = parseNaturePage(html, provenance.source.url);
after(() => { page.dom.window.close(); sourceDom.window.close(); });

// Prevent an accidental new resource from making any focused clip access the
// network. clipNature's hydration loop has no operations for an empty table list;
// it returns results only and does not invoke writePaper or image downloads.
assert.deepEqual(page.tables, []);
assert.deepEqual(page.figures, []);
assert.equal(source.querySelectorAll('table,a[href*="/tables/"]').length, 0);

function readableText(text) {
  return text.replace(/\\([<>])/gu, '$1')
    .replace(/&lt;|&#0*60;|&#x0*3c;/giu, '<')
    .replace(/&gt;|&#0*62;|&#x0*3e;/giu, '>')
    .replace(/&amp;/gu, '&')
    .replace(/&quot;/gu, '"')
    .replace(/&#0*39;|&apos;/gu, "'");
}

test('real reference projection retains original prefix, creators, DOM science and rights', () => {
  assert.equal(bytes.length, provenance.fixture.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), provenance.fixture.sha256);
  assert.equal(bytes.includes(13), false, 'Source fixture is UTF8/LF');
  assert.equal(source.querySelector('link[rel="canonical"]').href, provenance.source.url);
  assert.equal(source.querySelector('meta[name="citation_doi"]').content, provenance.source.doi);
  assert.deepEqual([...source.querySelectorAll('meta[name="citation_author"]')].map(n => n.content), provenance.sourceRights.orderedSourceCreators);
  const references = [...source.querySelectorAll('ol.c-article-references > li')];
  assert.equal(references.length, 2, 'Original prefix 1–2, no renumbering');
  for (const [index, node] of references.entries()) {
    const text = node.querySelector('.c-article-references__text');
    const oracle = provenance.references[index];
    assert.equal(text.id, oracle.sourceAnchorId);
    assert.equal(text.textContent, oracle.sourceText);
    assert.deepEqual([...text.querySelectorAll('i,b,sub,sup')].map(n => ({tag:n.tagName,text:n.textContent})), oracle.sourceScientificNodes);
    assert.equal(node.querySelector('[data-doi]').getAttribute('data-doi'), oracle.doi);
    assert.equal(node.querySelector('[data-doi]').getAttribute('href'), oracle.sourceDoiHref);
  }
  assert.match(references[1].querySelector('.c-article-references__text').innerHTML, /\(0&lt;<i>x<\/i>&lt;-1\)/u);
  assert.equal(source.querySelector(provenance.body.selector).textContent, provenance.body.sourceText);
  assert.equal(source.querySelector('section[data-title="Rights and permissions"] p').textContent.replace(/\s+/gu, ' ').trim(), provenance.sourceRights.notices[0].sourceNoticeText);
  assert.equal(source.querySelector('section[data-title="Rights and permissions"] a').href, 'http://creativecommons.org/licenses/by/4.0/');
  assert.equal(source.querySelector('p.c-footer__legal').textContent, provenance.sourceRights.siteFooterNotice.text);
  assert.equal(provenance.fixture.repeatBytesEqual, true);
  assert.equal(provenance.fixture.idempotentBytesEqual, true);
  assert.equal(provenance.dependencies.helper.gitBlob, 'e56f140d9756bb83013b9df0716dc650e04d7917');
  assert.doesNotMatch(html, /ACADEMICCLIPPER|<script(?![^>]*type="application\/ld\+json")/u);
});

// One real production clip per dialect is shared by both source assertions and
// validator assertions. No full-document snapshot or second parser is used.
const clipCache = new Map();
function realClip(dialect) {
  if (!clipCache.has(dialect)) clipCache.set(dialect, clipNature({html, url:provenance.source.url, citationStyle:dialect}));
  return clipCache.get(dialect);
}
for (const dialect of ['markdown', 'links', 'quarto']) {
  test(`real reference text, DOI, keys and source literal survive (${dialect})`, async () => {
    const result = await realClip(dialect);
    assert.equal(result.metadata.title, provenance.source.title);
    assert.equal(result.metadata.doi, provenance.source.doi);
    assert.deepEqual(result.metadata.authors, provenance.sourceRights.orderedSourceCreators);
    assert.deepEqual(result.references.map(({number,anchor,text,doi}) => ({number,anchor,text,doi})), provenance.references.map(r => ({number:r.number,anchor:`ref-${r.number}`,text:r.normalizedSourceText,doi:r.doi})));
    assert.deepEqual(result.references.map(r => r.citationKey), ['Green2014','Mizushima1980']);
    const bib = referencesBib(result.references);
    assert.ok(bib.includes(provenance.expectations.titleLiteral), 'Quarto data preserves the published inequality exactly');
    for (const reference of provenance.references) assert.ok(bib.includes(`doi = {${reference.doi}}`));
    if (dialect === 'quarto') {
      assert.match(result.markdown, /::: \{#refs\}\n:::/u);
      assert.doesNotMatch(result.markdown, /<a\b/u);
    } else {
      for (const reference of provenance.references) {
        const prefix = dialect === 'links' ? `${reference.number}. ` : `[^${reference.number}]: `;
        const line = result.markdown.split('\n').find(line => line.startsWith(prefix));
        assert.ok(line, `Original source reference ${reference.number} renders once`);
        assert.ok(readableText(line).includes(reference.normalizedSourceText));
        assert.ok(line.includes(`https://doi.org/${reference.doi}`));
        assert.equal(result.markdown.split('\n').filter(line => line.startsWith(prefix)).length, 1);
      }
      assert.ok(readableText(result.markdown).includes('(0<x<-1)'), 'Do not repair the source negative bound');
    }
    assert.deepEqual(result.debug.warnings, provenance.expectations.expectedWarnings);
    assert.equal(result.debug.tableSummary.totalTables, 0);
  });
  test(`real reference literal respects all production validators (${dialect})`, async () => {
    const result = await realClip(dialect);
    for (const key of ['mathValidation','markdownStructure','rawHtmlValidation','crossReferenceValidation']) {
      assert.equal(result.debug[key].valid, true, `${key}: ${JSON.stringify(result.debug[key].violations || result.debug[key].issues)}`);
    }
    assert.equal(result.debug.mathValidation.scientificFragments.valid, true);
    assert.equal(result.debug.mathValidation.displayMathCount, 0);
    if (dialect === 'links') assert.deepEqual([...result.markdown.matchAll(/<a id="(ref-\d+)"><\/a>/gu)].map(m => m[1]), ['ref-1','ref-2']);
  });
}

// These strings are deliberately constructed boundary controls, not scholarly
// quotations, Nature article evidence or additional corpus admissions.
const syntheticReference = (text) => [{number:1,anchor:'ref-1',citationKey:'Synthetic2020',text,doi:''}];
test('synthetic operator entities, ampersands and quotes remain readable text beside allowed anchors', async () => {
  const text = 'Synthetic only. (0<x<1) & "quoted" > limit (2020).';
  const rendered = await withDomGlobals(page.dom, () => referencesMarkdown(syntheticReference(text), provenance.source.url, outputPolicy('links')));
  assert.ok(readableText(rendered).includes(text));
  assert.equal(validateRawHtml(rendered,{allowHtmlAnchors:true}).valid, true, 'Literal operators are safely encoded; the compatible anchor is retained');
  assert.equal((rendered.match(/<a id="ref-1"><\/a>/gu) || []).length, 1);
});
test('synthetic HTML-looking reference text stays literal without authorizing injection', async () => {
  const text = 'Synthetic only. literal <span onclick="doBad()">payload</span> (2020).';
  const rendered = await withDomGlobals(page.dom, () => referencesMarkdown(syntheticReference(text), provenance.source.url, outputPolicy('links')));
  assert.ok(readableText(rendered).includes(text));
  assert.equal(validateRawHtml(rendered,{allowHtmlAnchors:true}).valid, true, 'No raw span/event attributes can be emitted from text');
});
test('synthetic reference code and existing math retain opaque bytes and delimiter roles', async () => {
  // A typed DOM code node is opaque. Plain reference.text has no source code
  // identity and is not used to invent one in this compatibility control.
  const constructed = '<html><body><div class="c-article-body"><p>Synthetic boundary. Code <code>&lt;span&gt;literal&lt;/span&gt;</code> and math <span class="mathjax-tex">\\(x+1\\)</span>; cite <sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>.</p><h2 id="Bib1">References</h2><ol class="c-article-references"><li><p class="c-article-references__text" id="ref-CR1">Synthetic, S. Constructed boundary. Journal 1, 1 (2020).</p></li></ol></div></body></html>';
  for (const dialect of ['markdown','links','quarto']) {
    const result = await clipNature({html:constructed,url:'https://www.nature.com/articles/synthetic-reference-boundary',citationStyle:dialect});
    assert.ok(result.markdown.includes('`<span>literal</span>`'), dialect);
    assert.ok(result.markdown.includes('$x+1$'), dialect);
    assert.deepEqual(result.semantic.citations.map(c => c.numbers), [[1]]);
    for (const key of ['mathValidation','rawHtmlValidation','markdownStructure','crossReferenceValidation']) assert.equal(result.debug[key].valid, true, `${dialect}/${key}`);
  }
});
test('synthetic strict HTML policy continues to reject foreign or malformed anchors', () => {
  assert.equal(validateRawHtml('<a id="ref-1"></a>',{allowHtmlAnchors:true}).valid, true);
  for (const input of ['<span>payload</span>', '<a href="https://example.invalid/">link</a>', '<a id="ref-1" onclick="doBad()"></a>', '<a id="ref-1">']) {
    assert.equal(validateRawHtml(input,{allowHtmlAnchors:true}).valid, false, input);
    assert.equal(validateRawHtml(input,{allowHtmlAnchors:false}).valid, false, input);
  }
  assert.equal(validateRawHtml('`<span>payload</span>`').valid, true);
});
