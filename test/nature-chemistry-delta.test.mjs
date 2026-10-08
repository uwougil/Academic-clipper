import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after,test} from 'node:test';
import {JSDOM} from 'jsdom';
import {clipNature,referencesBib} from '../src/clip.mjs';
import {parseNaturePage} from '../src/adapters/nature.mjs';
import {normalizeAcademicInline} from '../src/normalizers/academic-inline.mjs';
import {validateMathDelimiters} from '../src/validators/math-delimiters.mjs';

const directory=new URL('./fixtures/nature-chemistry-delta/',import.meta.url);
const provenance=JSON.parse(await readFile(new URL('s41467-023-44030-3.provenance.json',directory),'utf8'));
const bytes=await readFile(new URL(provenance.fixture.path,directory)),html=bytes.toString('utf8');
const dom=new JSDOM(html),source=dom.window.document,page=parseNaturePage(html,provenance.source.url);
const attempts=[],original={fetch:globalThis.fetch,lookup:dns.lookup,promiseLookup:dnsPromises.lookup};
globalThis.fetch=async(...args)=>{attempts.push({kind:'HTTP',url:String(args[0])});throw new Error('Unexpected Delta-test HTTP');};
dns.lookup=(...args)=>{attempts.push({kind:'DNS',host:String(args[0])});throw new Error('Unexpected Delta-test DNS');};
dnsPromises.lookup=async(...args)=>{attempts.push({kind:'DNS-promise',host:String(args[0])});throw new Error('Unexpected Delta-test DNS');};
syncBuiltinESMExports();
after(async()=>{
  globalThis.fetch=original.fetch;dns.lookup=original.lookup;dnsPromises.lookup=original.promiseLookup;syncBuiltinESMExports();
  dom.window.close();page.dom.window.close();
  if(process.env.CHEMISTRY_DELTA_RECEIPT_ROOT)await writeFile(`${process.env.CHEMISTRY_DELTA_RECEIPT_ROOT}/network-ledger.json`,JSON.stringify({attempts,writerProof:'Static clipNature returns data without invoking writePaper; no writer spy claimed.'},null,2)+'\n');
  assert.deepEqual(attempts,[],'Unexpected operations recorded before throw, even when fallback catches it');
});
assert.deepEqual(page.figures,[]);assert.deepEqual(page.tables,[]);

test('source Delta projection preserves complete paragraph, original script positions, creators and prefix',()=>{
  assert.equal(bytes.length,provenance.fixture.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.fixture.sha256);assert.equal(bytes.includes(13),false);
  assert.equal(source.querySelector('link[rel="canonical"]').href,provenance.source.url);
  assert.equal(source.querySelector('meta[name="citation_doi"]').content,provenance.source.doi);
  assert.deepEqual([...source.querySelectorAll('meta[name="citation_author"]')].map(n=>n.content),provenance.sourceRights.orderedSourceCreators);assert.equal(provenance.sourceRights.orderedSourceCreators.length,9);
  assert.equal(source.querySelectorAll('ol.c-article-references > li').length,36);
  assert.deepEqual([...source.querySelectorAll('.c-article-body h2,.c-article-body h3')].slice(0,2).map(n=>[n.tagName,n.id,n.textContent]),[['H2','Sec2','Results'],['H3','Sec3','The design and synthesis of picrotoxinin analogs']]);
  const paragraph=source.querySelector(provenance.paragraph.sourceSelector);assert.equal(paragraph.textContent,provenance.paragraph.sourceText);
  assert.deepEqual([...paragraph.querySelectorAll('sup,sub,i,b,.mathjax-tex')].map(n=>({tag:n.tagName,text:n.textContent})),provenance.paragraph.orderedScientificNodes.map(({html,...n})=>n));
  assert.equal(provenance.paragraph.roles.length,2);
  for(const role of provenance.paragraph.roles){const sup=paragraph.querySelectorAll('sup')[role.supIndex];assert.equal(sup.textContent,'12,13');assert.equal(sup.querySelector('a'),null);assert.ok(sup.previousSibling.textContent.endsWith('Δ'));assert.ok(sup.nextSibling.textContent.startsWith('-alkene'));}
  for(const notice of provenance.sourceRights.notices)assert.equal(source.querySelectorAll(notice.sourceSelector)[notice.sourceParagraphIndex].textContent,notice.sourceRawNoticeText);
  assert.equal(source.querySelector('p.c-footer__legal').textContent,provenance.sourceRights.siteFooterNotice.text);
  assert.equal(provenance.fixture.repeatBytesEqual,true);assert.equal(provenance.fixture.idempotentBytesEqual,true);
});

function sourceContext(text){
  const start=text.indexOf('Hydration of the'),endText='-catalyzed hydrogenation.',end=text.indexOf(endText,start);
  assert.ok(start>=0&&end>start,'Complete original paragraph remains present');return text.slice(start,end+endText.length);
}
function deltaAtoms(context){
  return [...context.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].filter(m=>/^(?:Δ|\\Delta)\^\{12,13\}$/u.test(m[1].replace(/\s+/gu,''))).map(m=>({index:m.index,end:m.index+m[0].length,text:m[1]}));
}
function readableScript(text){return text.replace(/\\(?:mathrm|text)\{([^{}]*)\}/gu,'$1').replace(/[${}]/gu,'').replace(/\s+/gu,' ');}
for(const dialect of ['markdown','links','quarto']){
  let promise;
  const result=()=>promise??=(async()=>{
    const r=process.env.CHEMISTRY_DELTA_CACHE_ROOT?JSON.parse(await readFile(`${process.env.CHEMISTRY_DELTA_CACHE_ROOT}/${dialect}.result.json`,'utf8')):await clipNature({html,url:provenance.source.url,citationStyle:dialect});
    assert.equal(r.rawHtml,html);assert.equal(r.citationStyle,dialect);
    if(process.env.CHEMISTRY_DELTA_RECEIPT_ROOT){const root=process.env.CHEMISTRY_DELTA_RECEIPT_ROOT;await mkdir(root,{recursive:true});await writeFile(`${root}/${dialect}.result.json`,JSON.stringify(r,null,2)+'\n');await writeFile(`${root}/${dialect}.md`,r.markdown);}
    return r;
  })();
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
