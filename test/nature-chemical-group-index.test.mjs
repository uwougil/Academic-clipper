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
import {assertChemicalGroupFormula} from './helpers/chemical-group-output-oracle.mjs';

const directory=new URL('./fixtures/nature-chemical-group-index/',import.meta.url);
const provenance=JSON.parse(await readFile(new URL('s41467-023-44030-3.provenance.json',directory),'utf8'));
const bytes=await readFile(new URL(provenance.fixture.path,directory)),html=bytes.toString('utf8');
const dom=new JSDOM(html),source=dom.window.document,page=parseNaturePage(html,provenance.source.url);
const attempts=[],original={fetch:globalThis.fetch,lookup:dns.lookup,promiseLookup:dnsPromises.lookup};
globalThis.fetch=async(...args)=>{attempts.push({kind:'HTTP',url:String(args[0])});throw new Error('Unexpected chemical-group-test HTTP');};
dns.lookup=(...args)=>{attempts.push({kind:'DNS',host:String(args[0])});throw new Error('Unexpected chemical-group-test DNS');};
dnsPromises.lookup=async(...args)=>{attempts.push({kind:'DNS-promise',host:String(args[0])});throw new Error('Unexpected chemical-group-test DNS');};
syncBuiltinESMExports();
after(async()=>{
 globalThis.fetch=original.fetch;dns.lookup=original.lookup;dnsPromises.lookup=original.promiseLookup;syncBuiltinESMExports();dom.window.close();page.dom.window.close();
 if(process.env.CHEMICAL_GROUP_RECEIPT_ROOT)await writeFile(`${process.env.CHEMICAL_GROUP_RECEIPT_ROOT}/network-ledger.json`,JSON.stringify({attempts,writerProof:'Static clipNature returns data without invoking writePaper; no writer spy claimed.'},null,2)+'\n');
 assert.deepEqual(attempts,[],'Unexpected operations recorded before throw even if fallback catches the error');
});

test('source chemical-group projection retains three whole paragraphs, all scripts, creators, rights and target closure',()=>{
 assert.equal(bytes.length,provenance.fixture.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.fixture.sha256);assert.equal(bytes.includes(13),false);
 assert.equal(source.querySelector('link[rel="canonical"]').href,provenance.source.url);assert.equal(source.querySelector('meta[name="citation_doi"]').content,provenance.source.doi);
 assert.deepEqual([...source.querySelectorAll('meta[name="citation_author"]')].map(n=>n.content),provenance.sourceRights.orderedSourceCreators);assert.equal(provenance.sourceRights.orderedSourceCreators.length,9);
 assert.equal(source.querySelectorAll('ol.c-article-references > li').length,37);
 assert.deepEqual([...source.querySelectorAll('.c-article-body h2,.c-article-body h3[id]')].map(n=>[n.tagName,n.id,n.textContent]),[['H2','Sec2','Results'],['H3','Sec3','The design and synthesis of picrotoxinin analogs'],['H2','Sec8','Methods'],['H2','Sec10','Supplementary information']]);
 for(const p of provenance.paragraphs){const n=source.querySelector(p.selector);assert.equal(n.textContent,p.sourceText);assert.deepEqual([...n.querySelectorAll('sup,sub,i,b,.mathjax-tex')].map(n=>({tag:n.tagName,text:n.textContent})),p.orderedScientificNodes.map(({html,...n})=>n));const sub=n.querySelectorAll('sub')[p.subIndex];assert.equal(sub.textContent,p.indexValue);assert.ok(sub.previousSibling.textContent.endsWith(')'));assert.equal(sub.nextSibling.textContent,p.nextText);}
 for(const f of provenance.figures){assert.equal(source.querySelector(f.selector).textContent,f.sourceText);assert.equal(source.querySelector(f.selector).querySelector('[data-test="bottom-caption"]').textContent,f.caption);}
 assert.ok(source.querySelector('#MOESM1 a').href.endsWith('41467_2023_44030_MOESM1_ESM.pdf'));
 for(const notice of provenance.sourceRights.notices)assert.equal(source.querySelectorAll(notice.sourceSelector)[notice.sourceParagraphIndex].textContent,notice.sourceRawNoticeText);
 assert.equal(source.querySelector('p.c-footer__legal').textContent,provenance.sourceRights.siteFooterNotice.text);
 assert.equal(provenance.fixture.repeatBytesEqual,true);assert.equal(provenance.fixture.idempotentBytesEqual,true);
 assert.deepEqual(page.figures.map(f=>f.id),['Fig2','Fig3']);assert.deepEqual(page.tables,[]);
});

function context(markdown,index){
 const starts=['The divergent syntheses of parallel PXN','The fluorinated analogs','Unless otherwise noted, all experiments'];
 // Use the complete original paragraph's unique opening, rather than headings
 // or final renderer order. This scope prevents an unrelated formula from
 // satisfying the source role.
 const first=index===1?'6F12FPXN ':starts[index];
 const lines=markdown.split('\n').filter(line=>line.includes(first));assert.equal(lines.length,1,`Unique original paragraph ${index}`);return lines[0];
}
function readable(text){return text.replace(/\\(?:mathrm|text)\{([^{}]*)\}/gu,'$1').replace(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu,(_,s)=>s).replace(/[{}]/gu,'').replace(/\s+/gu,' ');}
for(const dialect of ['markdown','links','quarto']){
 let promise;
 const result=()=>promise??=(async()=>{
  const r=process.env.CHEMICAL_GROUP_CACHE_ROOT?JSON.parse(await readFile(`${process.env.CHEMICAL_GROUP_CACHE_ROOT}/${dialect}.result.json`,'utf8')):await clipNature({html,url:provenance.source.url,citationStyle:dialect});
  assert.equal(r.rawHtml,html);assert.equal(r.citationStyle,dialect);
  if(process.env.CHEMICAL_GROUP_RECEIPT_ROOT){const root=process.env.CHEMICAL_GROUP_RECEIPT_ROOT;await mkdir(root,{recursive:true});await writeFile(`${root}/${dialect}.result.json`,JSON.stringify(r,null,2)+'\n');await writeFile(`${root}/${dialect}.md`,r.markdown);}
  return r;
 })();
 for(const[pIndex,p]of provenance.paragraphs.entries())test(`real ${p.id} outer count belongs to complete original chemical group (${dialect})`,async()=>{const r=await result();assertChemicalGroupFormula(context(r.markdown,pIndex),pIndex);});
 test(`three real group contexts pass unchanged strict math validator (${dialect})`,async()=>{const r=await result();assert.equal(r.debug.mathValidation.valid,true,JSON.stringify(r.debug.mathValidation));});
 test(`ordinary chemical counts, measured NMR values, citations and target resources remain valid (${dialect})`,async()=>{
  const r=await result();
  for(const[pIndex,p]of provenance.paragraphs.entries())assert.deepEqual([...context(r.markdown,pIndex).matchAll(/\*\*(\d+)\*\*/gu)].map(m=>m[1]),p.boldCompoundSequence);
  const pb=readable(context(r.markdown,0)),fe=readable(context(r.markdown,1)),cd=readable(context(r.markdown,2));
  for(const token of ['I_2','RuCl_3','NaIO_4','CH_2I_2','GABA_A','PtO_2'])assert.ok(pb.includes(token),token);
  assert.ok(fe.includes('Fe_2'));assert.ok(fe.includes('NaBH_4'));
  for(const token of ['CHCl_3 @ 7.26 ppm','77.16 ppm','2.05','206.26','3.31','49.00','589.3'])assert.ok(cd.includes(token),token);
  const nmrAtoms=[...context(r.markdown,2).matchAll(/(?<!\$)\$(?:\{\})?\^\{(1|13)\}(?:\\(?:mathrm|text)\{(H|C)\}|(H|C))\$(?!\$)/gu)];assert.deepEqual(nmrAtoms.map(m=>[m[1],m[2]||m[3]]),[['1','H'],['13','C'],['1','H'],['13','C'],['1','H'],['13','C']]);
  assert.deepEqual(r.semantic.citations.map(c=>c.numbers),provenance.retainedCitationClusters);assert.equal(r.references.length,37);assert.deepEqual(r.figures.map(f=>f.id),['Fig2','Fig3']);assert.deepEqual(r.tables,[]);assert.deepEqual(r.semantic.displayMath,[]);
  for(const key of ['rawHtmlValidation','markdownStructure','crossReferenceValidation'])assert.equal(r.debug[key].valid,true,key);
  assert.deepEqual(r.debug.warnings,provenance.expected.warnings);assert.deepEqual(attempts,[]);
  assert.ok(r.markdown.includes('https://www.nature.com/articles/s41467-023-44030-3#MOESM1'));
  if(dialect==='quarto'){const bib=referencesBib(r.references);for(const c of r.semantic.citations)for(const number of c.numbers)assert.ok(bib.includes(r.references[number-1].citationKey));}
 });
}

// Explicit compatibility strings; never scholarly/source admission evidence.
test('synthetic complete TeX, opaque code, leading isotope and bound integer units retain existing contracts',()=>{
 for(const text of ['$\\mathrm{Pb}(\\mathrm{OAc})_{4}$','$\\mathrm{Fe}_{2}(\\mathrm{ox})_{3}$','$(\\mathrm{CD}_{3})_{2}\\mathrm{CO}$','`(OAc)$_{4}$`','~~~\n(ox)$_{3}$\n~~~','$^{1}H$'])assert.equal(normalizeAcademicInline(text),text);
 assert.equal(normalizeAcademicInline('cm<sup>−3</sup>'),'$\\mathrm{cm}^{−3}$');
});
test('synthetic unknown group word is not guessed as chemistry and isolated fragments stay rejected',()=>{
 const value=normalizeAcademicInline('unknown(word)<sub>4</sub>');assert.doesNotMatch(value,/\$.*\(word\).*_\{4\}/u);
 assert.equal(validateMathDelimiters('Pb(OAc)$_{4}$').valid,false);assert.equal(validateMathDelimiters('Fe$_{2}$(ox)$_{3}$').valid,false);assert.equal(validateMathDelimiters('(CD$_{3}$)$_{2}$CO').valid,false);
});
