import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { hydrateNatureTables, parseNaturePage } from '../src/adapters/nature.mjs';
import { renderTables } from '../src/normalizers/figures.mjs';
import { outputPolicy } from '../src/renderers/output-policy.mjs';

const root = new URL('./fixtures/nature-table-caption/', import.meta.url);
const provenance = JSON.parse(await readFile(new URL('s41534-023-00746-0.provenance.json',root),'utf8'));
const articleBytes = await readFile(new URL(provenance.fixture.path,root));
const resourceBytes = await readFile(new URL(provenance.resource.fixturePath,root));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(articleBytes.length,provenance.fixture.bytes);
assert.equal(sha256(articleBytes),provenance.fixture.sha256);
assert.equal(resourceBytes.length,provenance.resource.fixtureBytes);
assert.equal(sha256(resourceBytes),provenance.resource.fixtureSha256);
const opened = [];
after(() => { for (const dom of opened) dom.window.close(); });

// Nearest-component tests only; no second clipNature pipeline.
// Recorded A helpers generated the frozen excerpts externally, once.
let parsedPage;
function sourcePage() {
  if (!parsedPage) {
    parsedPage = parseNaturePage(articleBytes.toString(), provenance.source.url);
    opened.push(parsedPage.dom);
  }
  return parsedPage;
}

test('real Quantum Table 1 fixture retains original math/citation/targets, complete contexts, creators and rights', () => {
  const dom = new JSDOM(articleBytes.toString()); opened.push(dom);
  const document = dom.window.document;
  const caption = document.querySelector(provenance.caption.selector);
  assert.equal(caption.textContent,provenance.caption.sourceText);
  assert.deepEqual([...caption.querySelectorAll('.mathjax-tex')].map(node=>node.textContent),provenance.caption.inlineMath.map(math=>math.originalTeX));
  assert.equal(provenance.caption.inlineMath.length,12);
  assert.deepEqual([...caption.querySelectorAll('a[data-test="citation-ref"]')].map(node=>({number:Number(node.textContent),href:node.getAttribute('href')})),provenance.caption.citations.map(citation=>({number:citation.number,href:citation.originalHref})));
  assert.deepEqual(provenance.caption.citations.map(citation=>citation.number),[58]);
  assert.deepEqual([...caption.querySelectorAll('a[href*="#Equ"]')].map(node=>({href:node.getAttribute('href'),text:node.textContent})),provenance.caption.crossReferences.map(target=>({href:target.originalHref,text:target.sourceText})));
  assert.deepEqual([...document.querySelectorAll('.c-article-equation')].map(node=>node.id),['Equ7','Equ15']);
  for (const equation of provenance.expected.equations) assert.deepEqual([...document.getElementById(equation.natureId).querySelectorAll('.mathjax-tex')].map(node=>node.textContent),equation.originalTeX);
  for (const context of provenance.expected.contextRecords) assert.equal(document.querySelector(context.selector).textContent,context.text);
  assert.deepEqual([...document.querySelectorAll('meta[name="citation_author"]')].map(node=>node.content),provenance.sourceRights.orderedSourceCreators);
  assert.equal(provenance.sourceRights.orderedSourceCreators.length,6);
  const rights = document.querySelectorAll(provenance.sourceRights.notices[0].sourceSelector)[0];
  assert.equal(rights.textContent.replace(/\s+/gu,' ').trim(),provenance.sourceRights.notices[0].sourceNoticeText);
  assert.equal(rights.querySelector('a[href]').getAttribute('href'),'http://creativecommons.org/licenses/by/4.0/');
  assert.equal(document.querySelectorAll('ol.c-article-references li').length,71);
  assert.equal(provenance.fixture.repeatBytesEqual,true);
  assert.equal(provenance.fixture.idempotentBytesEqual,true);
  assert.doesNotMatch(articleBytes.toString(),/ACADEMICCLIPPER|data-track|<script(?![^>]*type="application\/ld\+json")/u);
});

test('real Quantum retained equation identity/TeX and references exist before table caption projection', () => {
  const page = sourcePage();
  assert.equal(page.tables.length,1);
  assert.equal(page.tables[0].natureId,'Tab1');
  assert.equal(page.tables[0].url,provenance.resource.url);
  assert.equal(page.references.length,71);
  assert.deepEqual(page.debug.crossReferenceMap.filter(target=>target.type==='equation').map(target=>target.natureId),['Equ7','Equ15']);
  assert.deepEqual(page.semantic.displayMath.map(math=>math.tex),provenance.expected.equations.flatMap(equation=>equation.originalTeX.map(tex=>tex.slice(2,-2).trim())));
});

test('real Quantum adapter table caption retains 12 typed original inline TeX nodes in source order', () => {
  const page = sourcePage();
  const html = page.tables[0].captionHtml;
  assert.equal(typeof html,'string','The table model must retain the protected source caption projection');
  const markers = html.match(/ACADEMICCLIPPERINLINEMATH\d+X/gu) || [];
  const byMarker = new Map(page.semantic.inlineMath.map(math=>[math.marker,math.tex]));
  assert.deepEqual(markers.map(marker=>byMarker.get(marker)),provenance.caption.inlineMath.map(math=>math.tex));
});

test('real Quantum adapter table caption keeps citation 58 after the second original math node', () => {
  const page = sourcePage();
  const html = page.tables[0].captionHtml;
  assert.equal(typeof html,'string','Citation identity must survive the table caption projection');
  const mathMarkers = html.match(/ACADEMICCLIPPERINLINEMATH\d+X/gu) || [];
  const citationMarkers = html.match(/ACADEMICCLIPPERCITATION\d+X/gu) || [];
  const byMarker = new Map(page.semantic.citations.map(citation=>[citation.marker,citation.numbers]));
  assert.deepEqual(citationMarkers.map(marker=>byMarker.get(marker)),[[58]]);
  assert.ok(html.includes(mathMarkers[1] + citationMarkers[0] + '. The definitions'),'Source citation remains outside math and before the original next sentence');
});

test('real Quantum adapter table caption keeps Equ7/15 labels and typed retained targets in source order', () => {
  const page = sourcePage();
  const html = page.tables[0].captionHtml;
  assert.equal(typeof html,'string','Known equation targets must survive the table caption projection');
  const dom = new JSDOM(html); opened.push(dom);
  const anchors = [...dom.window.document.querySelectorAll('a[href]')];
  assert.deepEqual(anchors.map(anchor=>({text:anchor.textContent,href:anchor.getAttribute('href')})),provenance.caption.crossReferences.map(target=>({
    text:target.sourceText,
    href:'#ACADEMICCLIPPERCROSSREFERENCE' + page.semantic.crossReferences.get(target.natureId).anchor + 'X',
  })));
});

test('real Quantum full-size table hydration uses the existing guarded seam and retains source cells/caption', async () => {
  const table = structuredClone(sourcePage().tables[0]);
  const captionBefore = table.caption;
  const ledger = {requests:[],resolutions:[],unexpected:[]};
  const warnings = await hydrateNatureTables([table],provenance.source.url,{
    fetchImpl:async (requestUrl,options) => {
      const request = {url:requestUrl,method:options.method || 'GET',redirect:options.redirect};
      ledger.requests.push(request);
      if (requestUrl!==provenance.resource.url || request.method!=='GET' || request.redirect!=='manual') {
        ledger.unexpected.push(request);
        throw new Error('Undeclared source table request');
      }
      return new Response(resourceBytes,{status:200,headers:{'content-type':provenance.resource.contentType}});
    },
    resolveHostname:async (hostname,options) => {
      const resolution = {hostname,...options};
      ledger.resolutions.push(resolution);
      if (hostname!=='www.nature.com' || options.all!==true || options.verbatim!==true) {
        ledger.unexpected.push(resolution);
        throw new Error('Undeclared source table DNS request');
      }
      return [{address:'151.101.0.95',family:4}];
    },
  });
  // Hydration catches failures, so an empty unexpected-operation ledger matters.
  assert.deepEqual(warnings,[]);
  assert.deepEqual(ledger.unexpected,[]);
  assert.deepEqual(ledger.requests,[{url:provenance.resource.url,method:'GET',redirect:'manual'}]);
  assert.deepEqual(ledger.resolutions,[{hostname:'www.nature.com',all:true,verbatim:true}]);
  assert.equal(table.tableContentStatus,'full-size-html');
  assert.equal(table.caption,captionBefore);
  const resourceDom = new JSDOM(resourceBytes.toString()); opened.push(resourceDom);
  assert.equal(table.tableHtml,resourceDom.window.document.querySelector('table').outerHTML);
  assert.deepEqual([...resourceDom.window.document.querySelector('table').rows].map(row=>row.cells.length),[3,3,3]);
});

for (const citationStyle of ['markdown','links','quarto']) {
  test('synthetic renderer boundary honors a normalized caption projection (' + citationStyle + ')', () => {
    // Plain synthetic probes are not scientific source or layout admission.
    const rendered = renderTables([{
      label:'Table 1',anchor:'table-1',caption:'Table 1 RAW_CAPTION_CONTROL',
      captionMarkdown:'Table 1 NORMALIZED_CAPTION_CONTROL',
    }],outputPolicy(citationStyle));
    assert.ok(rendered.includes('**Table 1.** NORMALIZED_CAPTION_CONTROL'));
    assert.doesNotMatch(rendered,/RAW_CAPTION_CONTROL/u);
  });
}
