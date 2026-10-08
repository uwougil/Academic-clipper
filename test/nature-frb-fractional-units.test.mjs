import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after, test} from 'node:test';
import {JSDOM} from 'jsdom';
import {clipNature, referencesBib} from '../src/clip.mjs';
import {parseNaturePage} from '../src/adapters/nature.mjs';
import {normalizeAcademicInline} from '../src/normalizers/academic-inline.mjs';
import {validateMathDelimiters} from '../src/validators/math-delimiters.mjs';

const directory=new URL('./fixtures/nature-frb-fractional-units/',import.meta.url);
const provenance=JSON.parse(await readFile(new URL('s41586-022-04755-5.provenance.json',directory),'utf8'));
const bytes=await readFile(new URL(provenance.fixture.path,directory)),html=bytes.toString('utf8');
const dom=new JSDOM(html),source=dom.window.document,page=parseNaturePage(html,provenance.source.url);
const attempts=[],original={fetch:globalThis.fetch,lookup:dns.lookup,promiseLookup:dnsPromises.lookup};
globalThis.fetch=async (...args)=>{attempts.push({kind:'HTTP',url:String(args[0])});throw new Error('Unexpected fractional-unit HTTP');};
dns.lookup=(...args)=>{attempts.push({kind:'DNS',host:String(args[0])});throw new Error('Unexpected fractional-unit DNS');};
dnsPromises.lookup=async (...args)=>{attempts.push({kind:'DNS-promise',host:String(args[0])});throw new Error('Unexpected fractional-unit DNS');};
syncBuiltinESMExports();
after(async()=>{
  globalThis.fetch=original.fetch;dns.lookup=original.lookup;dnsPromises.lookup=original.promiseLookup;syncBuiltinESMExports();
  dom.window.close();page.dom.window.close();
  if(process.env.FRB_FRACTIONAL_RECEIPT_ROOT)await writeFile(`${process.env.FRB_FRACTIONAL_RECEIPT_ROOT}/network-ledger.json`,JSON.stringify({attempts,writerProof:'Static call graph: clipNature returns data and does not invoke writePaper. No writer spy claimed.'},null,2)+'\n');
  assert.deepEqual(attempts,[],'Record-before-throw guard catches swallowed network fallbacks');
});
assert.deepEqual(page.tables,[]);assert.deepEqual(page.figures,[]);

test('FRB source projection retains complete source paragraphs, original twelve powers and identity',()=>{
  assert.equal(bytes.length,provenance.fixture.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.fixture.sha256);
  assert.equal(bytes.includes(13),false);assert.equal(source.querySelector('link[rel="canonical"]').href,provenance.source.url);
  assert.equal(source.querySelector('meta[name="citation_doi"]').content,provenance.source.doi);
  assert.deepEqual([...source.querySelectorAll('meta[name="citation_author"]')].map(n=>n.content),provenance.sourceRights.orderedSourceCreators);
  assert.equal(provenance.sourceRights.orderedSourceCreators.length,35);
  assert.deepEqual([...source.querySelectorAll('.c-article-body h2,.c-article-body h3,.c-article-body h4')].slice(0,3).map(n=>[n.tagName,n.id,n.textContent]),[['H2','Sec2','Methods'],['H3','Sec17','FAST burst sample analysis'],['H4','Sec23','Extragalactic scattering']]);
  assert.equal(source.querySelectorAll('ol.c-article-references > li').length,52);
  for(const paragraph of provenance.paragraphs){
    const n=source.querySelector(paragraph.fixtureSelector);assert.equal(n.textContent,paragraph.sourceText);
    assert.deepEqual([...n.querySelectorAll('sup,sub,i,b,.mathjax-tex')].map(n=>({tag:n.tagName,text:n.textContent})),paragraph.orderedScientificNodes.map(({html,...n})=>n));
    for(const role of paragraph.fractionalUnits){const sup=n.querySelectorAll('sup')[role.supIndex];assert.equal(sup.textContent,role.exponent);assert.ok(sup.previousSibling.textContent.endsWith(role.base));assert.equal(sup.querySelector('a'),null);}
  }
  assert.deepEqual(provenance.paragraphs.map(p=>p.fractionalUnits.length),[8,4]);
  assert.deepEqual([...source.querySelector('#Equ8').querySelectorAll('.mathjax-tex')].map(n=>n.textContent),provenance.equation.originalTeX);
  for(const notice of provenance.sourceRights.notices)assert.equal(source.querySelectorAll(notice.sourceSelector)[notice.sourceParagraphIndex].textContent,notice.sourceRawNoticeText);
  assert.equal(source.querySelector('p.c-footer__legal').textContent,provenance.sourceRights.siteFooterNotice.text);
  assert.equal(provenance.fixture.repeatBytesEqual,true);assert.equal(provenance.fixture.idempotentBytesEqual,true);
  assert.equal(provenance.dependencies.helper.gitBlob,'e56f140d9756bb83013b9df0716dc650e04d7917');
});

function context(markdown,index){
  const start=markdown.indexOf(index===0?'where DM':'For the nominal DM contribution');
  const endText=index===0?'in Mpc.':'from an intervening galaxy.';
  const end=markdown.indexOf(endText,start);assert.ok(start>=0&&end>start,'Complete source paragraph remains present');
  return markdown.slice(start,end+endText.length);
}
function mathAtoms(text){return [...text.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].map(m=>m[1]);}
function unitRoles(text){
  return mathAtoms(text).flatMap(atom=>[...atom.matchAll(/(?:\\(?:mathrm|text)\{(pc|km)\}|(?<![\p{L}])(pc|km))\^\{((?:[^{}]|\\frac\{\d+\}\{\d+\})+)\}/gu)].map(m=>({base:m[1]||m[2],exponent:m[3].replace(/\s+/gu,'').replace(/\\frac\{(\d+)\}\{(\d+)\}/gu,'$1/$2').replace(/-/gu,'−')})));
}
for(const dialect of ['markdown','links','quarto']){
  let promise;
  const result=()=>promise??=(async()=>{
    const r=process.env.FRB_FRACTIONAL_CACHE_ROOT
      ? JSON.parse(await readFile(`${process.env.FRB_FRACTIONAL_CACHE_ROOT}/${dialect}.result.json`,'utf8'))
      : await clipNature({html,url:provenance.source.url,citationStyle:dialect});
    assert.equal(r.rawHtml,html,'Cached diagnostics must use this exact source fixture');
    assert.equal(r.citationStyle,dialect);
    if(process.env.FRB_FRACTIONAL_RECEIPT_ROOT){const root=process.env.FRB_FRACTIONAL_RECEIPT_ROOT;await mkdir(root,{recursive:true});await writeFile(`${root}/${dialect}.result.json`,JSON.stringify(r,null,2)+'\n');await writeFile(`${root}/${dialect}.md`,r.markdown);}
    return r;
  })();
  test(`real fractional powers bind to twelve original unit factors (${dialect})`,async()=>{
    const r=await result();
    for(const [index,p]of provenance.paragraphs.entries()){
      const actual=unitRoles(context(r.markdown,index));
      assert.deepEqual(actual,p.fractionalUnits.map(({base,exponent})=>({base,exponent})),`Methods p${p.sourceParagraphIndex}: preserve original unit-only base, signed fraction and multiplicity`);
    }
  });
  test(`fractional source passes strict scientific-fragment validator (${dialect})`,async()=>{
    const r=await result();assert.equal(r.debug.mathValidation.valid,true,JSON.stringify(r.debug.mathValidation));
  });
  test(`existing integer-unit and numeric powers retain coefficient boundaries (${dialect})`,async()=>{
    const r=await result(),a=context(r.markdown,0),b=context(r.markdown,1);
    assert.equal((a.match(/\\mathrm\{cm\}\^\{−3\}/gu)||[]).length,1);
    assert.equal((b.match(/\\mathrm\{cm\}\^\{−3\}/gu)||[]).length,3);
    assert.ok(mathAtoms(a).some(atom=>atom==='10^{−3}'));
    assert.ok(mathAtoms(a).some(atom=>atom==='\\gtrsim10^{2}'),'Source comparison marker and 10² form one legitimate run');
    for(const coefficient of ['392','290','50','0.6'])assert.ok(b.includes(coefficient));
    assert.ok(a.includes('0.1–1'));assert.ok(b.includes('0.1'));assert.ok(b.includes('1.25'));
  });
  test(`source citation, equation, remaining validators, exact warnings and resources (${dialect})`,async()=>{
    const r=await result();assert.deepEqual(r.semantic.citations.map(c=>c.numbers),provenance.retainedCitationClusters);
    assert.equal(r.references.length,52);assert.deepEqual(r.figures,[]);assert.deepEqual(r.tables,[]);
    assert.equal(r.semantic.displayMath.length,1);assert.equal(r.semantic.displayMath[0].tex,provenance.equation.originalTeX[0].slice(2,-2));
    for(const key of ['rawHtmlValidation','markdownStructure','crossReferenceValidation'])assert.equal(r.debug[key].valid,true,key);
    assert.deepEqual(r.debug.warnings,provenance.expected.warnings);assert.deepEqual(attempts,[]);
    if(dialect==='quarto'){assert.ok(r.markdown.includes('](#eq-equation-8)'));assert.ok(r.markdown.includes('{#eq-equation-8}'));assert.ok(referencesBib(r.references).includes(r.references[51].citationKey));}
    else if(dialect==='links')assert.ok(r.markdown.includes('](#equation-8)'));
    else assert.doesNotMatch(r.markdown,/\]\(#equation-8\)/u);
  });
}

// Explicit synthetic compatibility inputs; none count as scholarly evidence.
test('synthetic existing math, code and integer units remain opaque or correctly bound',()=>{
  for(const text of ['$\\mathrm{pc}^{-2/3}$','`pc$^{−2/3}$`','~~~\npc$^{−2/3}$\n~~~'])assert.equal(normalizeAcademicInline(text),text);
  assert.equal(normalizeAcademicInline('cm<sup>−3</sup>'),'$\\mathrm{cm}^{−3}$');
  assert.equal(normalizeAcademicInline('10<sup>2</sup>'),'$10^{2}$');
});
test('synthetic unrelated words are not inferred as unit factors and orphan validator stays strict',()=>{
  const out=normalizeAcademicInline('word<sup>−2/3</sup>');assert.doesNotMatch(out,/\$word\^|\\mathrm\{word\}/u);
  assert.equal(validateMathDelimiters('pc$^{−2/3}$').valid,false);
});
