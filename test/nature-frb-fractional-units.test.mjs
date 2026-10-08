import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after, before, test} from 'node:test';
import {JSDOM} from 'jsdom';

const directory=new URL('./fixtures/nature-frb-fractional-units/',import.meta.url);
const provenance=JSON.parse(await readFile(new URL('s41586-022-04755-5.provenance.json',directory),'utf8'));
const bytes=await readFile(new URL(provenance.fixture.path,directory)),html=bytes.toString('utf8');
const attempts=[],originals=[],results=new Map(),clipWindows=new Set(),closedWindows=new Set();
const domKeys=['window','document','DOMParser','XMLSerializer','Node','NodeFilter','HTMLElement','Element','SVGElement','Document'];
const descriptors=new Map(domKeys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
let referencesBib,normalizeAcademicInline,validateMathDelimiters,sourceDomsOpened=0,sourceDomsClosed=0;
before(async()=>{
  for(const [owner,kind,methods]of [[globalThis,'HTTP',['fetch']],
    [dns,'DNS-callback',['lookup','resolve','resolve4','resolve6','reverse']],
    [dnsPromises,'DNS-promise',['lookup','resolve','resolve4','resolve6','reverse']]])for(const method of methods){
    originals.push({owner,method,value:owner[method]});
    owner[method]=(...args)=>{attempts.push({kind,method,value:String(args[0])});throw new Error(`Unexpected fractional-unit ${kind}`);};
  }
  syncBuiltinESMExports();
  let currentWindow=globalThis.window;
  Object.defineProperty(globalThis,'window',{configurable:true,get:()=>currentWindow,set:value=>{
    currentWindow=value;if(value?.document&&typeof value.close==='function')clipWindows.add(value);
  }});
  const {clipNature,referencesBib:bib}=await import('../src/clip.mjs');referencesBib=bib;
  ({normalizeAcademicInline}=await import('../src/normalizers/academic-inline.mjs'));
  ({validateMathDelimiters}=await import('../src/validators/math-delimiters.mjs'));
  try{for(const citationStyle of ['markdown','links','quarto']){
    const result=await clipNature({html,url:provenance.source.url,citationStyle});
    assert.equal(result.rawHtml,html);assert.equal(result.citationStyle,citationStyle);
    results.set(citationStyle,result);
    if(process.env.FRB_FRACTIONAL_RECEIPT_ROOT){const root=process.env.FRB_FRACTIONAL_RECEIPT_ROOT;await mkdir(root,{recursive:true});await writeFile(`${root}/${citationStyle}.result.json`,JSON.stringify(result,null,2)+'\n');await writeFile(`${root}/${citationStyle}.md`,result.markdown);}
  }}finally{
    // The converter caches the first real DOMParser. Keep its window alive
    // until all three actual conversions finish, then close the observed DOMs.
    for(const window of clipWindows){window.close();closedWindows.add(window);}
  }
});
after(async()=>{
  try{
    assert.deepEqual(attempts,[],'Record-before-throw guard catches swallowed network fallbacks');
    assert.equal(results.size,3);assert.equal(clipWindows.size,3);assert.equal(closedWindows.size,3);
    assert.equal(sourceDomsOpened,sourceDomsClosed);
  }finally{
    for(const window of clipWindows)if(!closedWindows.has(window)){window.close();closedWindows.add(window);}
    for(const {owner,method,value}of originals)owner[method]=value;syncBuiltinESMExports();
    for(const [key,descriptor]of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
    const restoredBindings=originals.every(({owner,method,value})=>owner[method]===value);
    const restoredDomGlobals=[...descriptors].every(([key,descriptor])=>assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis,key),descriptor)===undefined);
    assert.ok(restoredBindings&&restoredDomGlobals);
    if(process.env.FRB_FRACTIONAL_RECEIPT_ROOT)await writeFile(`${process.env.FRB_FRACTIONAL_RECEIPT_ROOT}/network-ledger.json`,JSON.stringify({attempts,realClipCalls:results.size,clipWindowsOpened:clipWindows.size,clipWindowsClosed:closedWindows.size,sourceDomsOpened,sourceDomsClosed,guardedMethods:originals.length,restoredBindings,restoredDomGlobals,writerProof:'Static call graph: clipNature returns data and does not invoke writePaper. No writer spy claimed.'},null,2)+'\n');
  }
});

test('FRB source projection retains complete source paragraphs, original twelve powers and identity',()=>{
  const dom=new JSDOM(html),source=dom.window.document;sourceDomsOpened++;
  try{
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
  }finally{dom.window.close();sourceDomsClosed++;}
});

function context(markdown,index){
  const start=markdown.indexOf(index===0?'where DM':'For the nominal DM contribution');
  const endText=index===0?'in Mpc.':'from an intervening galaxy.';
  const end=markdown.indexOf(endText,start);assert.ok(start>=0&&end>start,'Complete source paragraph remains present');
  return markdown.slice(start,end+endText.length);
}
function mathAtoms(text){return [...text.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].map(m=>m[1]);}
// Compare the complete original paragraphs as text/TeX. Font wrappers,
// Markdown emphasis and presentation whitespace are renderer presentation;
// scientific attachment and complete factor atoms are checked separately.
function paragraphPayload(text,citationKey){
  return text.replaceAll(`[@${citationKey}]`,'52').replace(/\[\^52\]/gu,'52')
    .replace(/\[([^\]]+)\]\([^\n]*?\)/gu,'$1')
    .replace(/\\[()[\]]/gu,'').replace(/\\(?:mathrm|mathit|mathbf|rm)(?![A-Za-z])/gu,'')
    .replace(/\\[,;!]/gu,'').replace(/[$*_{}^]/gu,'').replace(/\s+/gu,'');
}
const unitTex=base=>`\\mathrm{${base}}^{${base==='pc'?'−2/3':'−1/3'}}`;
// Ordered native styled roles from the two independently audited source
// paragraphs, plus the twelve original unit factors at their source positions.
const scientificTexes=['z_{l}',unitTex('pc'),unitTex('km'),'ϵ^{2}','l_{0}','l_{i}',
  '10^{−3}',unitTex('pc'),unitTex('km'),'\\gtrsim10^{2}',unitTex('pc'),unitTex('km'),
  unitTex('pc'),unitTex('km'),'G_{\\mathrm{scatt}}','d_{\\mathrm{sl}}','d_{\\mathrm{so}}','d_{\\mathrm{so}}',
  'T_{4}',unitTex('pc'),unitTex('km'),unitTex('pc'),unitTex('km')];
function unitRoles(text){
  return mathAtoms(text).flatMap(atom=>[...atom.matchAll(/(?:\\(?:mathrm|text)\{(pc|km)\}|(?<![\p{L}])(pc|km))\^\{((?:[^{}]|\\frac\{\d+\}\{\d+\})+)\}/gu)].map(m=>({base:m[1]||m[2],exponent:m[3].replace(/\s+/gu,'').replace(/\\frac\{(\d+)\}\{(\d+)\}/gu,'$1/$2').replace(/-/gu,'−')})));
}
for(const dialect of ['markdown','links','quarto']){
  const result=()=>results.get(dialect);
  test(`real fractional powers bind to twelve original unit factors (${dialect})`,async()=>{
    const r=await result();
    assert.deepEqual(r.semantic.scientificRuns,scientificTexes.map((tex,index)=>({marker:`ACADEMICCLIPPERSCIENTIFICRUN${index}X`,tex,provenance:index===9?'Nature MathJax plus adjacent inline scientific nodes':'Nature inline style nodes (<i>/<b>/<sub>/<sup>)'})),'Complete source-ordered scientific registry, including inherited roles and marker identities');
    for(const [index,p]of provenance.paragraphs.entries()){
      const actual=unitRoles(context(r.markdown,index));
      assert.deepEqual(actual,p.fractionalUnits.map(({base,exponent})=>({base,exponent})),`Methods p${p.sourceParagraphIndex}: preserve original unit-only base, signed fraction and multiplicity`);
      assert.deepEqual(mathAtoms(context(r.markdown,index)).filter(atom=>/\\mathrm\{(?:pc|km)\}/u.test(atom)),p.fractionalUnits.map(({base,exponent})=>`\\mathrm{${base}}^{${exponent}}`),'Each complete math atom owns one whole original factor, never a coefficient or adjacent unit');
      assert.equal(paragraphPayload(context(r.markdown,index),r.references[51].citationKey),paragraphPayload(p.sourceText,r.references[51].citationKey),'Complete scholarly paragraph, coefficient/range/measurement/order and ordinary context remain source-derived');
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
    assert.deepEqual(r.metadata.authors,provenance.sourceRights.orderedSourceCreators);
    assert.equal(r.metadata.doi,provenance.source.doi);assert.equal(r.metadata.url,provenance.source.url);
    assert.equal(r.references.length,52);assert.deepEqual(r.figures,[]);assert.deepEqual(r.tables,[]);
    assert.equal(r.semantic.displayMath.length,1);assert.equal(r.semantic.displayMath[0].tex,provenance.equation.originalTeX[0].slice(2,-2));
    assert.deepEqual(r.semantic.inlineMath,provenance.paragraphs.flatMap(p=>p.orderedScientificNodes.filter(n=>n.tag==='SPAN')).map(({text},index)=>({marker:`ACADEMICCLIPPERINLINEMATH${index}X`,tex:text.slice(2,-2).trim()})),'Complete ordered original inline TeX registry');
    for(const key of ['rawHtmlValidation','markdownStructure','crossReferenceValidation'])assert.equal(r.debug[key].valid,true,key);
    assert.deepEqual(r.debug.warnings,provenance.expected.warnings);assert.deepEqual(attempts,[]);
    assert.doesNotMatch(r.markdown,/ACADEMICCLIPPER(?:SCIENTIFICRUN|INLINEMATH|DISPLAYMATH|CITATION)\d+X/u);
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
