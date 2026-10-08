import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after,before,test} from 'node:test';
import {JSDOM} from 'jsdom';

const directory=new URL('./fixtures/nature-chemistry-delta/',import.meta.url);
const provenance=JSON.parse(await readFile(new URL('s41467-023-44030-3.provenance.json',directory),'utf8'));
const bytes=await readFile(new URL(provenance.fixture.path,directory)),html=bytes.toString('utf8');
const attempts=[],originals=[],results=new Map(),clipWindows=new Set(),closedWindows=new Set();
const domKeys=['window','document','DOMParser','XMLSerializer','Node','NodeFilter','HTMLElement','Element','SVGElement','Document'];
const descriptors=new Map(domKeys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
let referencesBib,parseNaturePage,normalizeAcademicInline,validateMathDelimiters,sourceParagraphWithoutCitations,sourceDomsOpened=0,sourceDomsClosed=0;
before(async()=>{
  for(const [owner,kind,methods]of [[globalThis,'HTTP',['fetch']],
    [dns,'DNS-callback',['lookup','resolve','resolve4','resolve6','reverse']],
    [dnsPromises,'DNS-promise',['lookup','resolve','resolve4','resolve6','reverse']]])for(const method of methods){
    originals.push({owner,method,value:owner[method]});
    owner[method]=(...args)=>{attempts.push({kind,method,value:String(args[0])});throw new Error(`Unexpected Delta-test ${kind}`);};
  }
  syncBuiltinESMExports();
  let currentWindow=globalThis.window;
  Object.defineProperty(globalThis,'window',{configurable:true,get:()=>currentWindow,set:value=>{
    currentWindow=value;if(value?.document&&typeof value.close==='function')clipWindows.add(value);
  }});
  const {clipNature,referencesBib:bib}=await import('../src/clip.mjs');referencesBib=bib;
  ({parseNaturePage}=await import('../src/adapters/nature.mjs'));
  ({normalizeAcademicInline}=await import('../src/normalizers/academic-inline.mjs'));
  ({validateMathDelimiters}=await import('../src/validators/math-delimiters.mjs'));
  try{for(const citationStyle of ['markdown','links','quarto']){
    const result=await clipNature({html,url:provenance.source.url,citationStyle});
    assert.equal(result.rawHtml,html);assert.equal(result.citationStyle,citationStyle);
    results.set(citationStyle,result);
    if(process.env.CHEMISTRY_DELTA_RECEIPT_ROOT){const root=process.env.CHEMISTRY_DELTA_RECEIPT_ROOT;await mkdir(root,{recursive:true});await writeFile(`${root}/${citationStyle}.result.json`,JSON.stringify(result,null,2)+'\n');await writeFile(`${root}/${citationStyle}.md`,result.markdown);}
  }}finally{
    // Defuddle caches the first real DOMParser; keep its window alive until
    // all three actual conversions finish, then close each observed window.
    for(const window of clipWindows){window.close();closedWindows.add(window);}
  }
});
after(async()=>{
  try{
    assert.deepEqual(attempts,[],'Unexpected operations recorded before throw, even when fallback catches it');
    assert.equal(results.size,3);assert.equal(clipWindows.size,3);assert.equal(closedWindows.size,3);
    assert.equal(sourceDomsOpened,sourceDomsClosed);
  }finally{
    for(const window of clipWindows)if(!closedWindows.has(window)){window.close();closedWindows.add(window);}
    for(const {owner,method,value}of originals)owner[method]=value;syncBuiltinESMExports();
    for(const [key,descriptor]of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
    const restoredBindings=originals.every(({owner,method,value})=>owner[method]===value);
    const restoredDomGlobals=[...descriptors].every(([key,descriptor])=>assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis,key),descriptor)===undefined);
    assert.ok(restoredBindings&&restoredDomGlobals);
    if(process.env.CHEMISTRY_DELTA_RECEIPT_ROOT)await writeFile(`${process.env.CHEMISTRY_DELTA_RECEIPT_ROOT}/network-ledger.json`,JSON.stringify({attempts,realClipCalls:results.size,clipWindowsOpened:clipWindows.size,clipWindowsClosed:closedWindows.size,sourceDomsOpened,sourceDomsClosed,guardedMethods:originals.length,restoredBindings,restoredDomGlobals,writerProof:'Static clipNature returns data without invoking writePaper; no writer spy claimed.'},null,2)+'\n');
  }
});

test('source Delta projection preserves complete paragraph, original script positions, creators and prefix',()=>{
  const dom=new JSDOM(html),source=dom.window.document,page=parseNaturePage(html,provenance.source.url);sourceDomsOpened+=2;
  try{
  assert.deepEqual(page.figures,[]);assert.deepEqual(page.tables,[]);
  assert.equal(bytes.length,provenance.fixture.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.fixture.sha256);assert.equal(bytes.includes(13),false);
  assert.equal(source.querySelector('link[rel="canonical"]').href,provenance.source.url);
  assert.equal(source.querySelector('meta[name="citation_doi"]').content,provenance.source.doi);
  assert.deepEqual([...source.querySelectorAll('meta[name="citation_author"]')].map(n=>n.content),provenance.sourceRights.orderedSourceCreators);assert.equal(provenance.sourceRights.orderedSourceCreators.length,9);
  assert.equal(source.querySelectorAll('ol.c-article-references > li').length,36);
  assert.deepEqual([...source.querySelectorAll('.c-article-body h2,.c-article-body h3')].slice(0,2).map(n=>[n.tagName,n.id,n.textContent]),[['H2','Sec2','Results'],['H3','Sec3','The design and synthesis of picrotoxinin analogs']]);
  const paragraph=source.querySelector(provenance.paragraph.sourceSelector);assert.equal(paragraph.textContent,provenance.paragraph.sourceText);
  const readableParagraph=paragraph.cloneNode(true);for(const citation of readableParagraph.querySelectorAll('sup:has(a[data-test="citation-ref"])'))citation.remove();sourceParagraphWithoutCitations=readableParagraph.textContent;
  assert.deepEqual([...paragraph.querySelectorAll('sup,sub,i,b,.mathjax-tex')].map(n=>({tag:n.tagName,text:n.textContent})),provenance.paragraph.orderedScientificNodes.map(({html,...n})=>n));
  assert.equal(provenance.paragraph.roles.length,2);
  for(const role of provenance.paragraph.roles){const sup=paragraph.querySelectorAll('sup')[role.supIndex];assert.equal(sup.textContent,'12,13');assert.equal(sup.querySelector('a'),null);assert.ok(sup.previousSibling.textContent.endsWith('Δ'));assert.ok(sup.nextSibling.textContent.startsWith('-alkene'));}
  for(const notice of provenance.sourceRights.notices)assert.equal(source.querySelectorAll(notice.sourceSelector)[notice.sourceParagraphIndex].textContent,notice.sourceRawNoticeText);
  assert.equal(source.querySelector('p.c-footer__legal').textContent,provenance.sourceRights.siteFooterNotice.text);
  assert.equal(provenance.fixture.repeatBytesEqual,true);assert.equal(provenance.fixture.idempotentBytesEqual,true);
  }finally{dom.window.close();page.dom.window.close();sourceDomsClosed+=2;}
});

function sourceContext(text){
  const start=text.indexOf('Hydration of the'),endText='-catalyzed hydrogenation.',end=text.indexOf(endText,start);
  assert.ok(start>=0&&end>start,'Complete original paragraph remains present');return text.slice(start,end+endText.length);
}
function deltaAtoms(context){
  return [...context.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].filter(m=>/^(?:Δ|\\Delta)\^\{12,13\}$/u.test(m[1].replace(/\s+/gu,''))).map(m=>({index:m.index,end:m.index+m[0].length,text:m[1]}));
}
function readableScript(text){return text.replace(/\\(?:mathrm|text)\{([^{}]*)\}/gu,'$1').replace(/[${}]/gu,'').replace(/\s+/gu,' ');}
function withoutCitationClusters(text,result){
  for(const numbers of provenance.retainedCitationClusters){
    const cluster=result.citationStyle==='markdown'?numbers.map(number=>`[^${number}]`).join('')
      :result.citationStyle==='links'?numbers.map(number=>`[${number}](#ref-${number})`).join(', ')
      :`[${numbers.map(number=>`@${result.references[number-1].citationKey}`).join('; ')}]`;
    assert.equal(text.split(cluster).length,2,'One exact emitted cluster from independently checked original source citations');
    text=text.replace(cluster,'');
  }
  return text;
}
for(const dialect of ['markdown','links','quarto']){
  const result=()=>results.get(dialect);
  for(const [roleIndex,role]of provenance.paragraph.roles.entries())test(`real ${role.id} retains Delta and comma bond-position script (${dialect})`,async()=>{
    const r=await result(),context=sourceContext(r.markdown),atoms=deltaAtoms(context);
    assert.equal(atoms.length,2,'Both original Δ12,13 labels remain attached, without orphan or duplication');
    const atom=atoms[roleIndex],prefix=roleIndex===0?'Hydration of the ':'Cobalt catalyzed ';
    assert.ok(context.slice(0,atom.index).endsWith(prefix));assert.ok(context.slice(atom.end).startsWith('-alkene'));
    assert.doesNotMatch(context,/Δ\$\^\{12,13\}\$/u,'No detached script fragments');
  });
  test(`Delta paragraph passes unchanged strict math validator (${dialect})`,async()=>{
    const r=await result();assert.equal(r.debug.mathValidation.valid,true,JSON.stringify(r.debug.mathValidation));
  });
  test(`source chemistry numbers, receptor, catalyst, citations and strict resources remain valid (${dialect})`,async()=>{
    const r=await result(),context=sourceContext(r.markdown);
    assert.deepEqual(r.semantic.citations.map(c=>c.numbers),provenance.retainedCitationClusters);assert.equal(r.references.length,36);
    assert.deepEqual(r.semantic.scientificRuns.map(run=>run.tex),['Δ^{12,13}','Δ^{12,13}'],'All source-backed typed runs, original order and complete groups');
    assert.deepEqual(r.semantic.scientificRuns.map(run=>run.marker),['ACADEMICCLIPPERSCIENTIFICRUN0X','ACADEMICCLIPPERSCIENTIFICRUN1X']);
    assert.deepEqual([...context.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].map(match=>match[1]),['Δ^{12,13}','_{A}','Δ^{12,13}','_{2}'],'ALL final paragraph atoms; no orphan/extra/misgrouped Delta');
    const readableParagraph=withoutCitationClusters(readableScript(context),r).replace(/\*\*|[_^]/gu,'').replace(/\s+-/gu,'-').replace(/\s+/gu,' ').trim();
    assert.equal(readableParagraph,sourceParagraphWithoutCitations.replace(/\s+/gu,' ').trim(),'Complete original paragraph science and prose');
    assert.doesNotMatch(r.markdown,/ACADEMICCLIPPER/u);
    assert.deepEqual([...context.matchAll(/\*\*(\d+)\*\*/gu)].map(m=>m[1]),provenance.expected.compoundBoldSequence);
    const readable=readableScript(context);assert.ok(readable.includes('GABA_A receptors'));assert.ok(readable.includes('PtO_2 -catalyzed')||readable.includes('PtO_2-catalyzed'));
    for(const value of ['C12 and C6','C5 methylation','65% yield','41% yield','81% and 88%'])assert.ok(context.includes(value));
    assert.deepEqual(r.semantic.citations.map(c=>c.numbers),provenance.retainedCitationClusters);assert.equal(r.references.length,36);
    assert.deepEqual(r.figures,[]);assert.deepEqual(r.tables,[]);assert.deepEqual(r.semantic.displayMath,[]);
    for(const key of ['rawHtmlValidation','markdownStructure','crossReferenceValidation'])assert.equal(r.debug[key].valid,true,key);
    assert.deepEqual(r.debug.warnings,provenance.expected.warnings);assert.deepEqual(attempts,[]);
    if(dialect==='quarto'){const bib=referencesBib(r.references);for(const c of r.semantic.citations)for(const number of c.numbers)assert.ok(bib.includes(r.references[number-1].citationKey));}
  });
}

// Explicit compatibility inputs, never counted as scholarly/source admission.
test('synthetic existing math, isotope, Greek SUB and code remain opaque; integer unit stays bound',()=>{
  for(const text of ['$\\Delta^{12,13}$','$\\Gamma_{\\phi}$','$^{1}H$','`Δ$^{12,13}$`','~~~\nΔ$^{12,13}$\n~~~'])assert.equal(normalizeAcademicInline(text),text);
  assert.equal(normalizeAcademicInline('cm<sup>−3</sup>'),'$\\mathrm{cm}^{−3}$');
});
test('synthetic unknown word never becomes inferred Delta label; orphan validator stays strict',()=>{
  const text=normalizeAcademicInline('word<sup>12,13</sup>');assert.doesNotMatch(text,/\$word\^|\\mathrm\{word\}/u);
  assert.equal(validateMathDelimiters('Δ$^{12,13}$').valid,false);
});
