import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import { readFile, writeFile } from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature, referencesBib, referencesMarkdown } from '../src/clip.mjs';
import { parseNaturePage } from '../src/adapters/nature.mjs';
import { withDomGlobals } from '../src/dom-runtime.mjs';
import { outputPolicy } from '../src/renderers/output-policy.mjs';
import { validateRawHtml } from '../src/validators/html-audit.mjs';
import { htmlToMarkdown } from '../src/markdown.mjs';
import { normalizeMath } from '../src/normalizers/math.mjs';
import { normalizeAcademicInline } from '../src/normalizers/academic-inline.mjs';

const directory = new URL('./fixtures/nature-reference-literal/', import.meta.url);
const bytes = await readFile(new URL('materials-reference-literal.excerpt.html', directory));
const html = new TextDecoder('utf8', { fatal: true }).decode(bytes);
const provenance = JSON.parse(await readFile(new URL('source-provenance.json', directory), 'utf8'));
const sourceDom = new JSDOM(html);
const source = sourceDom.window.document;
const page = parseNaturePage(html, provenance.source.url);
after(() => { page.dom.window.close(); sourceDom.window.close(); });

// Record unexpected calls even if a resource fallback catches the thrown error.
// Every input below has zero resource operations; restore the global/builtin
// bindings after this test process so the guard cannot leak to another caller.
const networkAttempts = [];
const originalNetwork = {fetch:globalThis.fetch, lookup:dns.lookup, promiseLookup:dnsPromises.lookup};
globalThis.fetch = async (...args) => { networkAttempts.push({kind:'HTTP',url:String(args[0])}); throw new Error('Unexpected reference-test HTTP'); };
dns.lookup = (...args) => { networkAttempts.push({kind:'DNS',host:String(args[0])}); throw new Error('Unexpected reference-test DNS'); };
dnsPromises.lookup = async (...args) => { networkAttempts.push({kind:'DNS-promise',host:String(args[0])}); throw new Error('Unexpected reference-test DNS'); };
syncBuiltinESMExports();
after(async () => {
  globalThis.fetch = originalNetwork.fetch;
  dns.lookup = originalNetwork.lookup;
  dnsPromises.lookup = originalNetwork.promiseLookup;
  syncBuiltinESMExports();
  if (process.env.NATURE_REFERENCE_RECEIPT_ROOT) await writeFile(`${process.env.NATURE_REFERENCE_RECEIPT_ROOT}/network-ledger.json`, JSON.stringify({networkAttempts,writerProof:'Static: clipNature returns a result; it has no writePaper call. No writer spy claimed.'},null,2)+'\n');
  assert.deepEqual(networkAttempts, [], 'No unexpected HTTP/DNS, including swallowed failures');
});

// Prevent an accidental new resource from making any focused clip access the
// network. clipNature's hydration loop has no operations for an empty table list;
// it returns results only and does not invoke writePaper or image downloads.
assert.deepEqual(page.tables, []);
assert.deepEqual(page.figures, []);
assert.equal(source.querySelectorAll('table,a[href*="/tables/"]').length, 0);

function readableText(text) {
  return text.replace(/\\([<>])/gu, '$1')
    // Decode one Markdown entity layer. Chained replacement would decode
    // source literal '&quot;' twice after '&amp;quot;' becomes '&quot;'.
    .replace(/&(?:lt|gt|amp|quot|apos);|&#0*(?:39|60|62);|&#x0*(?:27|3c|3e);/giu, entity => {
      const lower = entity.toLowerCase();
      if (lower === '&amp;') return '&';
      if (lower === '&quot;') return '"';
      if (lower === '&apos;' || /^&#(?:0*39|x0*27);$/u.test(lower)) return "'";
      return lower === '&lt;' || /^&#(?:0*60|x0*3c);$/u.test(lower) ? '<' : '>';
    });
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
  if (!clipCache.has(dialect)) clipCache.set(dialect, clipNature({html, url:provenance.source.url, citationStyle:dialect}).then(async result => {
    // Optional external evidence uses this same clip, never a second run or a
    // committed Markdown snapshot. The normal test invocation writes nothing.
    if (process.env.NATURE_REFERENCE_RECEIPT_ROOT) {
      const root = process.env.NATURE_REFERENCE_RECEIPT_ROOT;
      await writeFile(`${root}/${dialect}.actual.md`, result.markdown);
      await writeFile(`${root}/${dialect}.actual-cache.json`, JSON.stringify(result, (key,value) => value instanceof Map ? {entries:[...value]} : value, 2)+'\n');
    }
    return result;
  }));
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
test('synthetic existing reference math keeps its original less-than operator', async () => {
  const text = 'Synthetic only. Existing math $x<1$ and $x+1$ (2020).';
  const rendered = await withDomGlobals(page.dom, () => referencesMarkdown(syntheticReference(text), provenance.source.url, outputPolicy('links')));
  assert.ok(rendered.includes('$x<1$'), 'Encoding literal reference text must not turn an existing TeX operator into an HTML entity');
  assert.ok(rendered.includes('$x+1$'));
  assert.equal(validateRawHtml(rendered,{allowHtmlAnchors:true}).valid, true);
});

// Deliberately constructed renderer boundaries. These are not source articles,
// corpus admissions or claims that malformed math should pass math validation.
const rendererBoundaries = [
  {name:'mixed inline math and literal tag', text:'Synthetic. $x<1$ then <span>literal</span>.', opaque:['$x<1$']},
  {name:'mixed display math and literal tag', text:'Synthetic. $$x<1$$ then <span>literal</span>.', opaque:['$$x<1$$']},
  {name:'escaped currency beside literal tag', text:String.raw`Synthetic. \$5 then <span>literal</span> and \$10.`},
  {name:'escaped currency beside balanced math', text:String.raw`Synthetic. $x<1$ and \$5 then <span>literal</span>.`, opaque:['$x<1$']},
  {name:'unclosed inline delimiter', text:'Synthetic. $x<1 then <span>literal</span>.'},
  {name:'unclosed display delimiter', text:'Synthetic. $$x<1 then <span>literal</span>.'},
  {name:'literal entity spelling and ampersand', text:'Synthetic. &lt; &amp; & <span>literal</span>.'},
  {name:'literal foreign compatibility anchor', text:'Synthetic. <a id="ref-foreign" onclick="bad()"></a> <span>literal</span>.'},
  {name:'paired currency cannot hide literal tags', text:'Synthetic. $5 then <span>literal</span> and $10.'},
  {name:'balanced dollars cannot authorize literal HTML', text:'Synthetic. $<span>literal</span>$.'},
  {name:'literal backslash before angle bracket', text:String.raw`Synthetic. \<span>literal\</span>.`, escapedAngles:true},
  {name:'even backslashes before complete math', text:String.raw`Synthetic. \\$x<1$ then <span>literal</span>.`, opaque:['$x<1$']},
];
for (const dialect of ['markdown','links']) {
  for (const boundary of rendererBoundaries) {
    test(`synthetic renderer boundary: ${boundary.name} (${dialect})`, async () => {
      const refs = syntheticReference(boundary.text);
      refs[0].doi = '10.1000/synthetic-boundary';
      const rendered = await withDomGlobals(page.dom, () => referencesMarkdown(refs, provenance.source.url, outputPolicy(dialect)));
      // Defuddle already doubles literal backslashes in reference.text. This
      // comparison removes that presentation escaping only; it does not claim
      // to repair inherited currency/TeX conversion or bless malformed math.
      assert.ok(readableText(rendered).replace(/\\\\/gu,'\\').includes(boundary.text), 'Literal text keeps source order and values');
      for (const opaque of boundary.opaque || []) assert.ok(rendered.includes(opaque), 'Balanced existing TeX bytes stay opaque');
      if (boundary.escapedAngles) assert.ok(rendered.includes(String.raw`\\&lt;span>`), 'The original literal backslash keeps its Markdown escape pair');
      assert.ok(rendered.includes('[doi:10.1000/synthetic-boundary](https://doi.org/10.1000/synthetic-boundary)'), 'DOI appended after literal encoding');
      assert.equal(validateRawHtml(rendered,{allowHtmlAnchors:dialect==='links'}).valid, true, 'No literal tags become raw HTML');
      assert.deepEqual([...rendered.matchAll(/<a id="([^"]+)"><\/a>/gu)].map(m=>m[1]), dialect==='links' ? ['ref-1'] : []);
    });
  }
}

// A rejected literal dollar pair must still consume its closing delimiter.
// Otherwise that closing delimiter is re-used as an opener and can mask the
// following legitimate opener, causing source TeX operators to be encoded.
// These are synthetic renderer controls, not new scholarly source oracles.
const rejectedDollarBoundaries = [
  {name:'rejected inline then valid inline', text:'Synthetic. $<span>bad</span>$ then $x<1$ & literal.', opaque:['$x<1$']},
  {name:'valid inline before rejection', text:'Synthetic. $x<1$ then $<span>bad</span>$ & literal.', opaque:['$x<1$']},
  {name:'valid inline on both sides', text:'Synthetic. $x<1$ then $<span>bad</span>$ then $y<2$.', opaque:['$x<1$','$y<2$']},
  {name:'rejection then two valid inline spans', text:'Synthetic. $<span>bad</span>$ then $x<1$ and $y<2$.', opaque:['$x<1$','$y<2$']},
  {name:'two rejected inline spans then valid inline', text:'Synthetic. $<span>one</span>$ and $<span>two</span>$ then $x<1$.', opaque:['$x<1$']},
  {name:'rejected display then valid display', text:'Synthetic. $$<span>bad</span>$$ then $$x<1$$.', opaque:['$$x<1$$']},
  {name:'valid display on both sides', text:'Synthetic. $$x<1$$ then $$<span>bad</span>$$ then $$y<2$$.', opaque:['$$x<1$$','$$y<2$$']},
  {name:'two rejected display spans then valid display', text:'Synthetic. $$<span>one</span>$$ and $$<span>two</span>$$ then $$x<1$$.', opaque:['$$x<1$$']},
  {name:'inline rejection then valid display', text:'Synthetic. $<span>bad</span>$ then $$x<1$$.', opaque:['$$x<1$$']},
  {name:'display rejection then valid inline', text:'Synthetic. $$<span>bad</span>$$ then $x<1$.', opaque:['$x<1$']},
  {name:'mixed rejections then valid math', text:'Synthetic. $<span>one</span>$ then $$<span>two</span>$$ then $x<1$ and $$y<2$$.', opaque:['$x<1$','$$y<2$$']},
  {name:'literal currency HTML pair then valid inline', text:'Synthetic. $5 <span>cost</span> $10 then $x<1$.', opaque:['$x<1$']},
  {name:'escaped currency pair and valid inline', text:String.raw`Synthetic. \$5 <span>cost</span> \$10 then $x<1$.`, opaque:['$x<1$']},
  {name:'even backslashes and valid inline', text:String.raw`Synthetic. $<span>bad</span>$ then \\$x<1$.`, opaque:['$x<1$']},
  {name:'odd source backslash presentation and valid inline', text:String.raw`Synthetic. $<span>bad</span>$ then \$x<1$.`, opaque:['$x<1$']},
  {name:'math ampersand stays opaque beside literal ampersand', text:'Synthetic. $<span>bad</span>$ then $$x&y$$ & prose.', opaque:['$$x&y$$']},
  {name:'foreign anchor rejection and valid inline', text:'Synthetic. $<a id="ref-foreign" onclick="bad()"></a>$ then $x<1$.', opaque:['$x<1$']},
  {name:'literal entity spellings survive beside math', text:'Synthetic. $<span>bad</span>$ then $x<1$ &quot; &apos; &#60; &#x3c; &lt; &amp; &copy; &.', opaque:['$x<1$']},
];
for (const dialect of ['markdown','links']) {
  for (const boundary of rejectedDollarBoundaries) {
    test(`synthetic rejected-dollar boundary: ${boundary.name} (${dialect})`, async () => {
      const escapedText = boundary.text.replace(/[&<>]/gu, value => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[value]));
      const converted = await withDomGlobals(page.dom, () => htmlToMarkdown(`<p>${escapedText}</p>`, provenance.source.url));
      const beforeEncoder = normalizeAcademicInline(normalizeMath(converted)).replace(/^[-*]\s+/u,'').replace(/\n+/gu,' ').trim();
      for (const opaque of boundary.opaque) assert.ok(beforeEncoder.includes(opaque), 'Control proves exact original math reaches encoder; inherited upstream changes are not encoder RED');
      const refs = syntheticReference(boundary.text);
      refs[0].doi = '10.1000/synthetic-rejected-dollar';
      const rendered = await withDomGlobals(page.dom, () => referencesMarkdown(refs, provenance.source.url, outputPolicy(dialect)));
      for (const opaque of boundary.opaque) assert.ok(rendered.includes(opaque), `Original valid math must retain exact bytes: ${opaque}`);
      // Only remove Defuddle's already-proven presentation backslash pairs.
      // Never decode entities twice or strip math operators to conceal damage.
      assert.ok(readableText(rendered).replace(/\\\\/gu,'\\').includes(boundary.text), 'Original literal spelling, sequence and values survive');
      assert.equal(validateRawHtml(rendered,{allowHtmlAnchors:dialect==='links'}).valid,true);
      assert.deepEqual([...rendered.matchAll(/<a id="([^"]+)"><\/a>/gu)].map(m=>m[1]),dialect==='links'?['ref-1']:[]);
      assert.ok(rendered.includes('[doi:10.1000/synthetic-rejected-dollar](https://doi.org/10.1000/synthetic-rejected-dollar)'));
      // Literal rejected dollar pairs may be malformed math. This test does
      // not demand that they become valid; original math bytes and HTML policy
      // are tested independently from malformed-source math validation.
    });
  }
}
