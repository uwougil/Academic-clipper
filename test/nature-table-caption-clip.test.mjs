import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature, referencesBib } from '../src/clip.mjs';
import { hydrateNatureTables, parseNaturePage } from '../src/adapters/nature.mjs';
import { withDomGlobals } from '../src/dom-runtime.mjs';
import { normalizeTableContents, renderTables } from '../src/normalizers/figures.mjs';
import { outputPolicy } from '../src/renderers/output-policy.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';

const fixtures = new URL('./fixtures/nature-table-caption/', import.meta.url);
const provenance = JSON.parse(await readFile(new URL('s41534-023-00746-0.provenance.json',fixtures),'utf8'));
const article = await readFile(new URL(provenance.fixture.path,fixtures));
const resource = await readFile(new URL(provenance.resource.fixturePath,fixtures));
const url = provenance.source.url;
const styles = ['markdown','links','quarto'];
const opened = [];
after(() => { for (const dom of opened) dom.window.close(); });
const clean = value => value.replace(/\s+/gu,' ').trim();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(hash(article),provenance.fixture.sha256);
assert.equal(hash(resource),provenance.resource.fixtureSha256);

// Test-only composition, NOT the publisher's original inline-table layout or
// full-size-resource admission. Actual caption/context/metadata/references
// are unchanged; only the declared, unchanged table DOM is inserted. Real
// clipNature/finishClip/validators run without any transport patch.
const source = new JSDOM(article.toString()); opened.push(source);
const resourceDom = new JSDOM(resource.toString()); opened.push(resourceDom);
const captionSource = source.window.document.querySelector(provenance.caption.selector).outerHTML;
const articleBefore = source.serialize();
const tableNode = resourceDom.window.document.querySelector('table');
const inserted = source.window.document.importNode(tableNode,true);
source.window.document.querySelector(provenance.caption.selector).closest('figure').append(inserted);
assert.equal(inserted.outerHTML,tableNode.outerHTML);
assert.equal(source.window.document.querySelector(provenance.caption.selector).outerHTML,captionSource);
const composed = source.serialize();
inserted.remove();
assert.equal(source.serialize(),articleBefore,'Composition changes only the inserted actual table node');
const results = new Map();
async function clipped(style) {
  if (!results.has(style)) results.set(style,await clipNature({html:composed,url,citationStyle:style}));
  return results.get(style);
}
function captionBody(result) {
  assert.equal(typeof result.tables[0].captionMarkdown,'string','Actual clipNature must normalize the table caption');
  return result.tables[0].captionMarkdown;
}
function readableCaption(caption,style) {
  let result = caption;
  for (const math of provenance.caption.inlineMath) result = result.replaceAll('$' + math.renderedTeX + '$',math.originalTeX);
  result = result.replaceAll('$Z$','Z').replaceAll('$θ$','θ').replaceAll('$\\theta$','θ');
  result = result.replaceAll(style==='quarto'?'[@Chamberland2022]':style==='links'?'[58](#ref-58)':'[^58]','58');
  return clean(result.replace(/\[([^\]]+)\]\([^)]+\)/gu,'$1').replace(/\*/gu,''));
}

for (const style of styles) {
  test('source-derived synthetic composition preserves complete Quantum caption/TeX order in real clipNature (' + style + ')',async () => {
    const result = await clipped(style), caption = captionBody(result);
    const counts = new Map();
    let afterPosition = 0;
    for (const math of provenance.caption.inlineMath) {
      const fragment = '$' + math.renderedTeX + '$';
      const position = caption.indexOf(fragment,afterPosition);
      assert.ok(position>=afterPosition,'Original caption math identity/order: ' + math.originalTeX);
      afterPosition = position+fragment.length;
      counts.set(fragment,(counts.get(fragment)||0)+1);
    }
    for (const [fragment,count] of counts) assert.equal(caption.split(fragment).length-1,count);
    assert.equal(readableCaption(caption,style),clean(provenance.caption.sourceText));
    assert.doesNotMatch(caption,/\\\(|\\\)|ACADEMICCLIPPER/u);
    assert.equal(result.tables[0].tableContentStatus,'inline-html');
    assert.equal(result.tables[0].tableHtml,tableNode.outerHTML);
    assert.equal(result.tables[0].markdown.split('\n').length,4);
    assert.equal(result.references.length,71);
    assert.equal(result.metadata.title,provenance.source.title);
    assert.deepEqual(result.semantic.displayMath.map(math=>math.tex),provenance.expected.equations.flatMap(equation=>equation.originalTeX.map(tex=>tex.slice(2,-2).trim())));
    assert.equal(result.debug.mathValidation.displayMathCount,2);
    // Narrow-excerpt diagnostics cannot admit independent whole-Quantum
    // Greek/SUP failures. These are actual production validators.
    assert.equal(result.debug.rawHtmlValidation.valid,true);
    assert.equal(result.debug.markdownStructure.valid,true);
    assert.equal(result.debug.crossReferenceValidation.valid,true);
    assert.equal(result.debug.mathValidation.valid,true,JSON.stringify(result.debug.mathValidation.issues));
  });

  test('real clipNature keeps caption citation58 outside the second formula with its definition (' + style + ')',async () => {
    const result = await clipped(style), caption = captionBody(result);
    const citation = style==='quarto'?'[@Chamberland2022]':style==='links'?'[58](#ref-58)':'[^58]';
    assert.ok(caption.includes('$' + provenance.caption.inlineMath[1].renderedTeX + '$' + citation + '. The definitions'));
    assert.equal(caption.split(citation).length-1,1);
    if (style==='quarto') assert.ok(referencesBib(result.references).includes('@article{Chamberland2022,'));
    else assert.ok(result.referencesMarkdown.includes(style==='links'?'58. Chamberland':'[^58]: Chamberland'));
    assert.ok(result.semantic.citations.some(citation=>citation.numbers.length===1 && citation.numbers[0]===58));
  });

  test('real clipNature keeps caption Equ7/15 targets/order and the original retained equations (' + style + ')',async () => {
    const result = await clipped(style), caption = captionBody(result);
    const labels = provenance.caption.crossReferences.map(target=>style==='markdown'?target.sourceText:'[' + target.sourceText + '](#' + (style==='quarto'?'eq-':'') + 'equation-' + target.sourceText + ')');
    assert.ok(caption.includes('Eq. (' + labels[0] + ') and Eq. (' + labels[1] + ') respectively'));
    for (const equation of provenance.expected.equations) {
      for (const tex of equation.renderedTeX) assert.ok(result.markdown.includes('$$\n' + tex + '\n$$'));
      const anchor = 'equation-' + equation.natureId.slice(3);
      if (style==='links') assert.ok(result.markdown.includes('<a id="' + anchor + '"></a>'));
      if (style==='quarto') assert.ok(result.markdown.includes('{#eq-' + anchor + '}'));
    }
    assert.doesNotMatch(result.markdown,/ACADEMICCLIPPER/u);
  });
}

const emptyTable = '<table><tr><th>Control</th></tr><tr><td>Value</td></tr></table>';
function syntheticHtml(figures) {
  return '<!doctype html><html><head><title>Caption boundary control</title></head><body><div class="c-article-body"><p>Leading control.</p>' + figures + '<p>Trailing control.</p></div></body></html>';
}
for (const style of styles) {
  for (const [name,ids] of [
    ['missing IDs',['','']],
    ['duplicate labels, distinct source IDs',['TabA','TabB']],
    ['duplicate source IDs',['TabA','TabA']],
  ]) {
    test('synthetic caption association with ' + name + ' (' + style + ')',async () => {
      const html = syntheticHtml(ids.map((id,index)=>'<figure' + (id?' id="' + id + '"':'') + '><figcaption data-test="table-caption">Table 1 ' + (index?'SECOND_CONTROL':'FIRST_CONTROL') + ' <span class="mathjax-tex">\\(' + (index?'b_i':'a_i') + '\\)</span>.</figcaption>' + emptyTable + '</figure>').join(''));
      const result = await clipNature({html,url,citationStyle:style});
      assert.equal(result.tables.length,2);
      assert.deepEqual(result.tables.map(table=>table.natureId),ids);
      assert.deepEqual(result.tables.map(table=>table.anchor),['table-1','table-2']);
      for (const [index,table] of result.tables.entries()) {
        assert.equal(table.captionMarkdown,'Table 1 ' + (index?'SECOND_CONTROL':'FIRST_CONTROL') + ' $' + (index?'b_i':'a_i') + '$.');
        assert.equal(result.markdown.split(index?'SECOND_CONTROL':'FIRST_CONTROL').length-1,1);
      }
      assert.equal(result.debug.mathValidation.displayMathCount,0);
      assert.equal(result.debug.mathValidation.inlineMathCount,2);
    });
  }
  test('synthetic plain caption/no-HTML fallback retains text/status with zero network (' + style + ')',async () => {
    const result = await clipNature({html:syntheticHtml('<figure><figcaption data-test="table-caption">Table 1 Plain control.</figcaption></figure>'),url,citationStyle:style});
    assert.equal(result.tables[0].tableContentStatus,'fallback-no-url');
    assert.equal(result.tables[0].captionMarkdown,'Table 1 Plain control.');
    assert.ok(result.markdown.includes('**Table 1.** Plain control.'));
    assert.equal(result.debug.mathValidation.displayMathCount,0);
    assert.equal(result.debug.mathValidation.inlineMathCount,0);
  });
  for (const [name,tex,display] of [
    ['typed display brackets','\\[D_i\\]',true],
    ['typed display dollars','$$D_i$$',true],
    ['typed inline','\\(I_i\\)',false],
  ]) {
    test('synthetic table caption preserves ' + name + ' role (' + style + ')',async () => {
      const result = await clipNature({html:syntheticHtml('<figure><figcaption data-test="table-caption">Table 1 Before <span class="mathjax-tex">' + tex + '</span> after.</figcaption>' + emptyTable + '</figure>'),url,citationStyle:style});
      assert.equal(typeof result.tables[0].captionMarkdown,'string');
      assert.ok(result.tables[0].captionMarkdown.includes(display?'$$\nD_i\n$$':'$I_i$'));
      assert.equal(result.debug.mathValidation.displayMathCount,display?1:0);
      assert.equal(result.debug.mathValidation.inlineMathCount,display?0:1);
      assert.equal(result.debug.mathValidation.valid,true);
    });
  }
  test('synthetic caption preserves explicit legacy roles, numeric brackets and plain underscore (' + style + ')',async () => {
    const payload = String.raw`Table 1 Before \(L_i\) then \[D_i\] then $$E_i$$; [100] and literal_name.`;
    const result = await clipNature({html:syntheticHtml('<figure><figcaption data-test="table-caption">' + payload + '</figcaption>' + emptyTable + '</figure>'),url,citationStyle:style});
    const caption = result.tables[0].captionMarkdown;
    assert.equal(typeof caption,'string');
    assert.ok(caption.includes('$L_i$'));
    assert.ok(caption.includes('$$\nD_i\n$$'));
    assert.ok(caption.includes('$$E_i$$'));
    assert.ok(caption.includes('[100]'));
    assert.ok(caption.includes('literal\\_name'));
    assert.equal(result.debug.mathValidation.displayMathCount,2);
    assert.equal(result.debug.mathValidation.inlineMathCount,1);
  });
  test('synthetic caption preserves opaque code and original literal TeX underscore (' + style + ')',async () => {
    const payload = String.raw`Table 1 <code>\(CODE_i\) [100] literal_name</code> and <span class="mathjax-tex">\(M_{\text{literal\_name}}\)</span>.`;
    const result = await clipNature({html:syntheticHtml('<figure><figcaption data-test="table-caption">' + payload + '</figcaption>' + emptyTable + '</figure>'),url,citationStyle:style});
    const caption = result.tables[0].captionMarkdown;
    assert.equal(typeof caption,'string');
    assert.ok(caption.includes(String.raw`\(CODE_i\) [100] literal_name`),'Code remains opaque/verbatim');
    assert.ok(caption.includes(String.raw`$M_{\text{literal\_name}}$`),'Source literal TeX escape stays intact');
    const validation = validateMathDelimiters(renderTables(result.tables,outputPolicy(style)));
    assert.equal(validation.displayMathCount,0);
    assert.equal(validation.inlineMathCount,1);
  });
}

test('synthetic plain-record fallback works without caption HTML',async () => {
  const tables = [{label:'Table 1',anchor:'table-1',caption:'Table 1 ORIGINAL_TEXT_CONTROL',notes:[]}];
  await withDomGlobals(source,()=>normalizeTableContents(tables,url));
  assert.equal(tables[0].captionMarkdown,tables[0].caption);
  assert.ok(renderTables(tables).includes('ORIGINAL_TEXT_CONTROL'));
});

test('source full-size hydration remains independent of synthetic clip composition',async () => {
  const page = parseNaturePage(article.toString(),url); opened.push(page.dom);
  const before = page.tables[0].captionHtml;
  const ledger = {requests:[],resolutions:[],unexpected:[]};
  const warnings = await hydrateNatureTables(page.tables,url,{
    fetchImpl:async (requestUrl,options) => {
      const request = {url:requestUrl,method:options.method||'GET',redirect:options.redirect};
      ledger.requests.push(request);
      if (requestUrl!==provenance.resource.url || request.method!=='GET' || request.redirect!=='manual') {
        ledger.unexpected.push(request); throw new Error('Undeclared table request');
      }
      return new Response(resource,{status:200,headers:{'content-type':provenance.resource.contentType}});
    },
    resolveHostname:async (hostname,options) => {
      ledger.resolutions.push({hostname,...options});
      if (hostname!=='www.nature.com' || options.all!==true || options.verbatim!==true) {
        ledger.unexpected.push({hostname,...options}); throw new Error('Undeclared table DNS');
      }
      return [{address:'151.101.0.95',family:4}];
    },
  });
  assert.deepEqual(ledger.unexpected,[]);
  assert.deepEqual(ledger.requests,[{url:provenance.resource.url,method:'GET',redirect:'manual'}]);
  assert.deepEqual(ledger.resolutions,[{hostname:'www.nature.com',all:true,verbatim:true}]);
  assert.deepEqual(warnings,[]);
  assert.equal(page.tables[0].tableContentStatus,'full-size-html');
  assert.equal(page.tables[0].tableHtml,tableNode.outerHTML);
  assert.equal(page.tables[0].captionHtml,before);
  assert.equal(typeof before,'string');
});
