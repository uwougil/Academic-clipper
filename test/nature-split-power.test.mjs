import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import {after, test} from 'node:test';
import {JSDOM} from 'jsdom';
import {clipNature} from '../src/clip.mjs';
import {parseNaturePage} from '../src/adapters/nature.mjs';
import {normalizeAcademicInline} from '../src/normalizers/academic-inline.mjs';
import {validateMathDelimiters} from '../src/validators/math-delimiters.mjs';

const root=new URL('./fixtures/nature-split-power/',import.meta.url);
const provenance=JSON.parse(await readFile(new URL('s41534-023-00746-0.provenance.json',root),'utf8'));
const bytes=await readFile(new URL(provenance.fixture.path,root));
assert.equal(bytes.length,provenance.fixture.bytes);
assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.fixture.sha256);
const html=bytes.toString('utf8'), doms=[], receipts=[];
const sourceDom=new JSDOM(html);doms.push(sourceDom);
const sourceCitationClusters=[...sourceDom.window.document.querySelector('.c-article-body').querySelectorAll('sup:has(a[href*="#ref-CR"])')].map(sup=>[...sup.querySelectorAll('a[href*="#ref-CR"]')].map(a=>Number(a.getAttribute('href').match(/#ref-CR(\d+)/u)[1])));
after(async()=>{if(process.env.SPLIT_POWER_RECEIPT)await writeFile(process.env.SPLIT_POWER_RECEIPT,JSON.stringify(receipts,null,2)+'\n');for(const dom of doms)dom.window.close();});

test('source split-power excerpt preserves original nodes, complete blocks, creators, rights and reference prefix',()=>{
  const dom=new JSDOM(html);doms.push(dom);const d=dom.window.document;
  assert.equal(d.querySelector('link[rel="canonical"]').href,provenance.source.url);
  assert.equal(d.querySelector('meta[name="citation_doi"]').content,provenance.source.doi);
  assert.deepEqual([...d.querySelectorAll('meta[name="citation_author"]')].map(n=>n.content),provenance.sourceRights.orderedSourceCreators);
  assert.equal(provenance.sourceRights.orderedSourceCreators.length,6);
  for(const notice of provenance.sourceRights.notices){const n=d.querySelectorAll(notice.sourceSelector)[notice.sourceParagraphIndex];assert.equal(n.textContent,notice.sourceRawNoticeText);assert.equal(n.querySelector('a[rel="license"]').href,'http://creativecommons.org/licenses/by/4.0/');}
  assert.equal(d.querySelector('p.c-footer__legal').textContent,provenance.sourceRights.siteFooterNotice.text);
  assert.equal(d.querySelectorAll('ol.c-article-references > li').length,58);
  assert.equal(d.querySelector(provenance.figure.selector).textContent,provenance.figure.sourceText);
  for(const paragraph of provenance.paragraphs){const n=d.querySelector(paragraph.selector);assert.equal(n.textContent,paragraph.sourceText);assert.deepEqual([...n.querySelectorAll('sup,sub,i,b,.mathjax-tex')].map((n,index)=>({index,tag:n.tagName,text:n.textContent})),paragraph.orderedScientificNodes.map(({html,...n})=>n));}
  const split=d.querySelector(provenance.paragraphs[0].selector).querySelector('sup + sup');
  assert.equal(split.previousSibling.tagName,'SUP');
  assert.equal(split.previousSibling.textContent,'−');assert.equal(split.textContent,'15');
  assert.ok(split.previousSibling.previousSibling.textContent.endsWith('~10'));
  assert.equal(split.previousSibling.previousElementSibling.tagName,'SUB','Exponent sign is NOT nested in another SUP');
  assert.ok([...d.querySelector(provenance.paragraphs[1].selector).querySelectorAll('sup')].some(n=>n.textContent==='−15'&&!n.querySelector('a')));
  assert.equal(provenance.fixture.repeatBytesEqual,true);assert.equal(provenance.fixture.idempotentBytesEqual,true);
  assert.equal(provenance.dependencies.helper.gitBlob,'e56f140d9756bb83013b9df0716dc650e04d7917');
  assert.doesNotMatch(html,/ACADEMICCLIPPER|data-track|<script(?![^>]*type="application\/ld\+json")/u);
  const page=parseNaturePage(html,provenance.source.url);doms.push(page.dom);
  assert.equal(page.tables.length,0,'No table hydration/request is declared by this excerpt');
});

function sourceContext(markdown,id){
  const start=markdown.indexOf(id==='split'?'In the following, we will show':'we plot the minimal total logical error probability');
  assert.ok(start>=0,`${id}: original paragraph start`);
  const sentinel=id==='split'?'for cat code.':'for the cat.';
  const end=markdown.indexOf(sentinel,start);assert.ok(end>=start,`${id}: complete paragraph end`);
  return markdown.slice(start,end+sentinel.length);
}
function numericPowerAtoms(context){
  return [...context.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].flatMap(match=>{
    const atom=match[1].replace(/\s+/gu,'').match(/^(\d+(?:\.\d+)?)\^\{([−+\-]?\d+)\}$/u);
    return atom?[{base:atom[1],exponent:atom[2],precedingText:context.slice(0,match.index),followingText:context.slice(match.index+match[0].length)}]:[];
  });
}
for(const dialect of ['markdown','links','quarto']){
  let resultPromise;
  const getResult=()=>resultPromise??=clipNature({html,url:provenance.source.url,citationStyle:dialect}).then(result=>{receipts.push({dialect,markdown:result.markdown,semantic:result.semantic,debug:result.debug,tables:result.tables.map(t=>t.label),references:result.references.map(r=>({number:r.number,text:r.text}))});return result;});
  test(`real split SUP sign and digits retain one preceding numeric base (${dialect})`,async()=>{
    const result=await getResult();
    const p=provenance.paragraphs[0],context=sourceContext(result.markdown,p.id);
    const actual=numericPowerAtoms(context).map(({base,exponent})=>[base,exponent]);
    assert.deepEqual(actual,[[p.correctRole.base,p.correctRole.exponent]],`Source ~10 with sibling SUP −/15 is one negative power, not two powers: ${context}`);
    const atom=numericPowerAtoms(context)[0];assert.ok(atom.precedingText.endsWith(p.correctRole.precedingText));
    assert.ok(atom.followingText.startsWith(' even with a small SC '),'Original neighboring prose stays outside exponent');
    assert.equal(validateMathDelimiters(context).valid,true);
    for(const key of ['mathValidation','rawHtmlValidation','markdownStructure','crossReferenceValidation'])assert.equal(result.debug[key].valid,true,key);
    assert.deepEqual(result.debug.warnings,['No equation nodes were detected.']);
  });
  test(`real same-source single SUP negative power and citation roles remain valid (${dialect})`,async()=>{
    const result=await getResult();
    const context=sourceContext(result.markdown,'single'),atoms=numericPowerAtoms(context);
    assert.deepEqual(atoms.map(({base,exponent})=>[base,exponent]),[['10','−3'],['10','−3'],['10','−15'],['10','−2'],['10','−5']]);
    assert.equal(validateMathDelimiters(context).valid,true);
    assert.deepEqual(result.semantic.citations.map(c=>c.numbers),sourceCitationClusters);
    for(const key of ['rawHtmlValidation','markdownStructure','crossReferenceValidation'])assert.equal(result.debug[key].valid,true,key);
    assert.doesNotMatch(context,/ACADEMICCLIPPER|\$\^\{(?:58|8,51)\}/u);
  });
}

test('explicit synthetic math/code, citation-shaped prose and unrelated multiple SUP stay opaque',()=>{
  const cases=[
    ['single signed power','10<sup>−15</sup>','$10^{−15}$'],
    ['single ASCII signed power','10<sup>-15</sup>','$10^{-15}$'],
    ['single styled power','<i>x</i><sup>2</sup>','$x^{2}$'],
    ['typed multiple superscripts','$10^{−}^{15}$','$10^{−}^{15}$'],
    ['unknown word','word<sup>−</sup><sup>15</sup>','word$^{−}$$^{15}$'],
    ['separate complete powers','10<sup>−2</sup> and 10<sup>15</sup>','$10^{−2}$ and $10^{15}$'],
    ['actual code syntax with dollar fragments','`10$^{−}$ $^{15}$`','`10$^{−}$ $^{15}$`'],
    ['fenced dollar fragments','~~~\n10$^{−}$ $^{15}$\n~~~','~~~\n10$^{−}$ $^{15}$\n~~~'],
  ];
  for(const [name,input,expected]of cases){assert.equal(normalizeAcademicInline(input),expected,name);}
  assert.equal(validateMathDelimiters('10$^{−}$ $^{15}$').valid,false,'Validator keeps rejecting original orphan powers');
});

// All constructed content below is labeled synthetic; it is not an admission
// or scholarly source. Existing article metadata and reference prefix are reused.
test('synthetic DOM separates citation SUP, wrappers, spacing, existing math and code from split-power inference',async()=>{
  const dom=new JSDOM(html);doms.push(dom);const body=dom.window.document.querySelector('.c-article-body');
  body.innerHTML='<p>Boundary 10<sup>2</sup><sup><a data-test="citation-ref" href="#ref-CR58">58</a></sup>; <code>10$^{−}$ $^{15}$</code>; 10<sup>−</sup> <sup>15</sup>; 10<sup>−</sup><span><sup>15</sup></span>; <span class="mathjax-tex">\\(10^{-15}\\)</span>.</p>'+body.querySelector('section[data-title="References"]').outerHTML;
  const synthetic=dom.serialize(),page=parseNaturePage(synthetic,provenance.source.url);doms.push(page.dom);
  assert.deepEqual(page.semantic.citations.map(c=>c.numbers),[[58]]);
  assert.equal(page.tables.length,0);
  // This is a protection test, not evidence that invalid separated runs pass.
  const result=await clipNature({html:synthetic,url:provenance.source.url,citationStyle:'markdown'});
  assert.ok(result.markdown.includes('$10^{2}$[^58]'));
  assert.ok(result.markdown.includes('`10$^{−}$ $^{15}$`'));
  assert.ok(result.markdown.includes('$10^{-15}$'));
  assert.equal(result.debug.mathValidation.valid,false,'Deliberately unmerged whitespace/wrapper SUP remain diagnosed');
  assert.equal(result.semantic.inlineMath.length,1);
  assert.equal(result.semantic.citations.length,1);
});
