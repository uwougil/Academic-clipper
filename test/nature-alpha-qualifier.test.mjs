import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import dns from 'node:dns';
import {syncBuiltinESMExports} from 'node:module';
import {tmpdir} from 'node:os';
import {isAbsolute,relative,resolve} from 'node:path';
import {after,test} from 'node:test';
import {JSDOM} from 'jsdom';
import {clipNature} from '../src/clip.mjs';
import {normalizeMath} from '../src/normalizers/math.mjs';
import {normalizeAcademicInline} from '../src/normalizers/academic-inline.mjs';

const fixtureRoot=new URL('./fixtures/nature-alpha-qualifier/',import.meta.url);
const provenance=JSON.parse(await readFile(new URL('s41586-021-03819-2.provenance.json',fixtureRoot),'utf8'));
const oracle=JSON.parse(await readFile(new URL('s41586-021-03819-2.source-oracle.json',fixtureRoot),'utf8'));
const bytes=await readFile(new URL(provenance.fixture.path,fixtureRoot));
assert.equal(bytes.length,provenance.fixture.bytes);
assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.fixture.sha256);
const html=new TextDecoder('utf8',{fatal:true}).decode(bytes);
const originalFetch=globalThis.fetch,originalLookup=dns.lookup,originalPromiseLookup=dns.promises.lookup;
const ledger={http:[],dns:[]},entries=[];
const noHttp=(...args)=>{ledger.http.push(String(args[0]));throw new Error('Unexpected HTTP in source-only Alpha qualifier test');};
const noDns=(...args)=>{ledger.dns.push(String(args[0]));throw new Error('Unexpected DNS in source-only Alpha qualifier test');};
globalThis.fetch=noHttp;dns.lookup=noDns;dns.promises.lookup=noDns;syncBuiltinESMExports();
try{
 for(const citationStyle of ['markdown','links','quarto']){
  const result=await clipNature({html,url:oracle.metadata.url,citationStyle});
  const mathBody=normalizeMath(result.bodyMarkdown,result.semantic);
  entries.push({citationStyle,result,bodyStages:{defuddle:result.bodyMarkdown,math:mathBody,academic:normalizeAcademicInline(mathBody)}});
 }
}finally{globalThis.fetch=originalFetch;dns.lookup=originalLookup;dns.promises.lookup=originalPromiseLookup;syncBuiltinESMExports();}
after(async()=>{
 const requested=process.env.NATURE_ALPHA_QUALIFIER_RECEIPT_ROOT;if(!requested)return;
 const target=resolve(requested),child=relative(resolve(tmpdir()),target);
 assert.ok(child!==''&&!child.startsWith('..')&&!isAbsolute(child),'Evidence must stay in an external Temp directory');
 for(const entry of entries){
  await writeFile(`${target}/${entry.citationStyle}.actual-cache.json`,JSON.stringify({sourceKind:'real-source',acceptedMain:provenance.acceptedProductionBase,fixture:provenance.fixture,...entry,networkLedger:ledger},(key,value)=>value instanceof Map?{entries:[...value]}:value,2)+'\n');
  await writeFile(`${target}/${entry.citationStyle}.actual.md`,entry.result.markdown);
 }
});
const plain=value=>String(value).replace(/\[([^\]]+)\]\([^\n]*?\)/gu,'$1')
 .replace(/\$|\*\*|\{#[^}]*\}|<a id="[^"]+"><\/a>/gu,'')
 .replace(/\\(?:mathrm|text|mathit|mathbf)\{([^{}]*)\}/gu,'$1').replace(/\\[,;!]|\\quad/gu,'')
 .replace(/\\([\[\]{}|.-])/gu,'$1').replace(/[_{}*]/gu,'').replace(/\u00a0/gu,' ').replace(/\s+/gu,' ').trim();
function paragraph(result){const p=result.markdown.split('\n').filter(line=>line.startsWith('In CASP14, AlphaFold structures were vastly more accurate'));
 assert.equal(p.length,1,'One complete original source paragraph');return p[0];}
function attachedQualifiers(value){
 const roles=[];
 // Prose projection is checked separately; this recognizer requires the whole
 // literal base and qualifier in the SAME math atom, or literal Unicode SUB.
 // Removing delimiters before this check would falsely accept r.m.s.d.$_{95}$.
 for(const m of value.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)){
  const tex=m[1].replace(/\\(?:mathrm|text|mathit)\{([^{}]*)\}/gu,'$1').replace(/\\[,;!]|\\quad/gu,'').replace(/[{}\s]/gu,'');
  if(/^r\.m\.s\.d\._95$/u.test(tex))roles.push({literalBase:'r.m.s.d.',script:'subscript',value:'95'});
 }
 for(const m of value.matchAll(/r\.m\.s\.d\.₉₅/gu))roles.push({literalBase:'r.m.s.d.',script:'subscript',value:'95'});
 return roles;
}

test('Alpha qualifier fixture preserves complete source paragraph, targets and lawful zero reference prefix',()=>{
 const dom=new JSDOM(html);try{
  const p=dom.window.document.querySelector(oracle.paragraph.rawSelector);
  assert.equal(plain(p.textContent),oracle.paragraph.text);
  assert.equal(p.querySelectorAll('sub').length,4);for(const n of p.querySelectorAll('sub')){assert.equal(n.textContent,'95');assert.ok(n.previousSibling.textContent.endsWith('r.m.s.d.'));}
  assert.equal(dom.window.document.querySelectorAll('meta[name="citation_author"]').length,34);
  assert.deepEqual([...dom.window.document.querySelectorAll('meta[name="citation_author"]')].map(n=>n.content),oracle.metadata.orderedCreators);
  assert.equal(dom.window.document.querySelectorAll('sup a[data-test="citation-ref"],a[href*="#ref-CR"]').length,0);
  assert.equal(dom.window.document.querySelectorAll('ol.c-article-references li,ol.c-article-references__list li').length,0);
  assert.ok(dom.window.document.getElementById('Fig1'));assert.ok(dom.window.document.getElementById('MOESM1'));
  assert.ok(dom.window.document.querySelector('section[data-title="Rights and permissions"] a[href*="creativecommons.org/licenses/by/4.0"]'));
  assert.ok(dom.window.document.querySelector('p.c-footer__legal'));
 }finally{dom.window.close();}
});
test('Alpha source-only full clips make zero HTTP/DNS requests',()=>assert.deepEqual(ledger,{http:[],dns:[]}));
test('synthetic qualifier recognizer distinguishes complete atoms from isolated or naked suffixes',()=>{
 assert.deepEqual(attachedQualifiers('$\\mathrm{r.m.s.d.}_{95}$'),[oracle.roles[0].expectedAttachment]);
 assert.deepEqual(attachedQualifiers('r.m.s.d.₉₅'),[oracle.roles[0].expectedAttachment]);
 for(const value of ['r.m.s.d.$_{95}$','r.m.s.d.95','$\\mathrm{r.m.s.d.}_{96}$','unknown$_{95}$'])assert.deepEqual(attachedQualifiers(value),[]);
});
for(const {citationStyle,result}of entries){
 test(`real qualified metric paragraph and complete Fig1 preserve source context/${citationStyle}`,()=>{
  assert.equal(plain(paragraph(result)),oracle.paragraph.text);
  assert.equal(result.metadata.title,oracle.metadata.title);assert.equal(result.metadata.doi,oracle.metadata.doi);
  assert.deepEqual(result.metadata.authors,oracle.metadata.orderedCreators);
  assert.equal(result.figures.length,1);assert.equal(result.figures[0].id,'Fig1');
  assert.equal(plain(result.figures[0].caption),plain(oracle.figure.captionText));
  assert.equal(plain(result.markdown).split(plain(oracle.figure.captionDescription)).length,2,'Complete original figure description is rendered once');
  assert.equal(result.tables.length,0);assert.equal(result.references.length,0);assert.deepEqual(result.semantic.citations,[]);
  assert.deepEqual(result.debug.warnings,oracle.warningContract);
  const supplementaryCitation=oracle.scholarlyLinks.find(link=>link.href.endsWith('#MOESM1'));
  assert.ok(result.markdown.includes(`[${supplementaryCitation.text}](${new URL(supplementaryCitation.href,oracle.metadata.url).href})`));
  assert.equal(result.debug.markdownStructure.valid,true);assert.equal(result.debug.rawHtmlValidation.valid,true);assert.equal(result.debug.crossReferenceValidation.valid,true);
 });
 test(`all four literal metric bases keep original 95 qualifiers attached/${citationStyle}`,()=>{
  assert.deepEqual(attachedQualifiers(paragraph(result)),oracle.roles.map(r=>r.expectedAttachment),'Whole r.m.s.d. base and original 95 qualifier must remain one scientific atom; naked orphan is incorrect');
 });
 test(`real source qualifier output satisfies all production validators/${citationStyle}`,t=>{
  t.diagnostic(JSON.stringify({sourceKind:'real-source',roles:oracle.roles.map(r=>r.id),validators:{math:result.debug.mathValidation,structure:result.debug.markdownStructure,rawHtml:result.debug.rawHtmlValidation,crossReferences:result.debug.crossReferenceValidation},ledger}));
  assert.equal(result.debug.mathValidation.valid,true);
  assert.equal(result.debug.markdownStructure.valid,true);assert.equal(result.debug.rawHtmlValidation.valid,true);assert.equal(result.debug.crossReferenceValidation.valid,true);
 });
}
