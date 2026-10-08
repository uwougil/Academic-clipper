// Synthetic boundary evidence only; no case is a retained scholarly source.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {after, test} from 'node:test';

const attempts=[],records=[];
const original={fetch:globalThis.fetch,lookup:dns.lookup,promiseLookup:dnsPromises.lookup};
// Install before dynamic production imports or any DOM/parse operation.
globalThis.fetch=async (...args)=>{attempts.push({kind:'HTTP',url:String(args[0])});throw new Error('Undeclared synthetic HTTP');};
dns.lookup=(...args)=>{attempts.push({kind:'DNS-callback',host:String(args[0])});throw new Error('Undeclared synthetic DNS');};
dnsPromises.lookup=async (...args)=>{attempts.push({kind:'DNS-promise',host:String(args[0])});throw new Error('Undeclared synthetic DNS promise');};
syncBuiltinESMExports();

const sourceRoot=process.env.FRB_PREFLIGHT_SOURCE_ROOT
  ? pathToFileURL(path.resolve(process.env.FRB_PREFLIGHT_SOURCE_ROOT)+path.sep)
  : new URL('../src/',import.meta.url);
const receiptRoot=process.env.FRB_PREFLIGHT_RECEIPT_ROOT;
let parseNaturePage,clipNature,normalizeAcademicInline,validateMathDelimiters,JSDOM;
let parseCalls=0,clipCalls=0,domsOpened=0,domsClosed=0;
const capturedWindows=new Set();
let windowDescriptor;
after(async()=>{
  try {
    // clipNature owns additional DOMs. Capture window getters in memory only
    // and close all of them, including converter DOMs, after the final case.
    for(const window of capturedWindows)window.close();
    if(receiptRoot){
      await mkdir(receiptRoot,{recursive:true});
      await writeFile(path.join(receiptRoot,'matrix-records.json'),JSON.stringify({node:process.version,sourceRoot:sourceRoot.href,records,attempts,parseCalls,clipCalls,domsOpened,domsClosed,capturedWindowsClosed:capturedWindows.size,writerProof:'Only parseNaturePage/clipNature/normalizer/validator called. No writePaper invocation; no runtime writer spy claimed.'},null,2)+'\n');
    }
    assert.deepEqual(attempts,[],'Final independent record-before-throw ledger');
    assert.equal(domsOpened,domsClosed,'All harness-owned DOMs closed');
  } finally {
    if(windowDescriptor)Object.defineProperty(JSDOM.prototype,'window',windowDescriptor);
    globalThis.fetch=original.fetch;dns.lookup=original.lookup;dnsPromises.lookup=original.promiseLookup;syncBuiltinESMExports();
  }
});
({parseNaturePage}=await import(new URL('adapters/nature.mjs',sourceRoot)));
({clipNature}=await import(new URL('clip.mjs',sourceRoot)));
({normalizeAcademicInline}=await import(new URL('normalizers/academic-inline.mjs',sourceRoot)));
({validateMathDelimiters}=await import(new URL('validators/math-delimiters.mjs',sourceRoot)));
({JSDOM}=await import('jsdom'));
windowDescriptor=Object.getOwnPropertyDescriptor(JSDOM.prototype,'window');
Object.defineProperty(JSDOM.prototype,'window',{...windowDescriptor,get(){const window=windowDescriptor.get.call(this);capturedWindows.add(window);return window;}});

const url='https://www.nature.com/articles/synthetic-fractional-preflight';
function article(body){return `<!doctype html><html><head><title>Synthetic fractional boundary</title><link rel="canonical" href="${url}"><meta name="citation_title" content="Synthetic fractional boundary"><meta name="citation_doi" content="10.1038/synthetic-fractional-preflight"><meta name="citation_author" content="Synthetic author"></head><body><article><div class="c-article-body">${body}</div></article></body></html>`;}
function check(record,label,fn){try{fn();record.checks.push({label,status:'PASS'});}catch(error){record.checks.push({label,status:'FAIL',message:error.message});}}
function finish(record){records.push(record);const failures=record.checks.filter(c=>c.status==='FAIL');assert.equal(failures.length,0,JSON.stringify(failures));}
async function withPage(body,fn){
  const page=parseNaturePage(article(body),url);parseCalls++;domsOpened++;
  try{return await fn(page);}finally{page.dom.window.close();domsClosed++;}
}
const fractionTex=base=>`\\mathrm{${base}}^{${base==='pc'?'−2/3':'−1/3'}}`;
const fractionRuns=page=>page.semantic.scientificRuns.filter(({tex})=>/\\mathrm\{(?:pc|km)\}\^\{[−-][12]\/[3]\}/u.test(tex)).map(({tex})=>tex);

const positives=[
 ['pc-only','pc<sup>−2/3</sup>',['pc']],
 ['km-only','km<sup>−1/3</sup>',['km']],
 ['measurement-prefix','392 pc<sup>−2/3</sup>',['pc']],
 ['range-prefix','0.1–1 pc<sup>−2/3</sup>',['pc']],
 ['denominator-prefix','0.6 / km<sup>−1/3</sup>',['km']],
 ['adjacent-pair','pc<sup>−2/3</sup> km<sup>−1/3</sup>',['pc','km']],
 ['thin-space-pair','50 pc<sup>−2/3</sup>\u2009km<sup>−1/3</sup>',['pc','km']],
 ['repeated-factors','pc<sup>−2/3</sup>, km<sup>−1/3</sup>; pc<sup>−2/3</sup> km<sup>−1/3</sup>',['pc','km','pc','km']],
];
for(const [id,input,bases] of positives)test(`synthetic whole factor: ${id}`,async()=>{
  const record={id:`positive/${id}`,category:'REQUIRED_NEW_ROLE',input,checks:[]};
  await withPage(`<p>${input}</p>`,page=>{
    check(record,'entire source factor uses its own ordered scientific marker',()=>assert.deepEqual(fractionRuns(page),bases.map(fractionTex)));
    check(record,'source coefficients/ranges outside the extracted range remain unchanged',()=>{
      let remaining=input.replace(/(pc|km)<sup>−[12]\/3<\/sup>/gu,'FACTOR');
      const rendered=page.cleanedHtml.replace(/ACADEMICCLIPPERSCIENTIFICRUN\d+X/gu,'FACTOR');
      assert.ok(rendered.includes(`<p>${remaining}</p>`));
    });
  });
  finish(record);
});

const rejects=[
 ['unknown-word','word<sup>−2/3</sup>'],['suffix-word','topic<sup>−2/3</sup>'],
 ['unproved-unit','cm<sup>−2/3</sup>'],['wrong-pc-fraction','pc<sup>−1/3</sup>'],['wrong-km-fraction','km<sup>−2/3</sup>'],
 ['unsigned','pc<sup>2/3</sup>'],['plus-sign','pc<sup>+2/3</sup>'],['ascii-minus','pc<sup>-2/3</sup>'],
 ['zero-denominator','pc<sup>−2/0</sup>'],['zero-numerator','pc<sup>−0/3</sup>'],['extra-slash','pc<sup>−2/3/4</sup>'],
 ['decimal-fraction','pc<sup>−2.0/3</sup>'],['fraction-spaces','pc<sup>−2 /3</sup>'],['fraction-edge-space','pc<sup> −2/3</sup>'],
 ['nested-italic','pc<sup><i>−2/3</i></sup>'],['nested-span','pc<sup><span>−2/3</span></sup>'],
 ['nested-sub','pc<sup>−2/<sub>3</sub></sup>'],['comment-in-sup','pc<sup>−2<!--edge-->/3</sup>'],
 ['split-sup','pc<sup>−2</sup><sup>/3</sup>'],['extra-sup','pc<sup>−2/3</sup><sup>2</sup>'],
 ['extra-sub','pc<sup>−2/3</sup><sub>x</sub>'],['wrapped-base','<span>pc</span><sup>−2/3</sup>'],
 ['wrapped-sup','pc<span><sup>−2/3</sup></span>'],['comment-gap','pc<!--edge--><sup>−2/3</sup>'],
 ['space-gap','pc <sup>−2/3</sup>'],['split-base','p<span>c</span><sup>−2/3</sup>'],
 ['sibling-prefix','<span>x</span>pc<sup>−2/3</sup>'],['comment-prefix','x<!--edge-->pc<sup>−2/3</sup>'],
 ['unicode-letter-prefix','αpc<sup>−2/3</sup>'],['number-prefix','1pc<sup>−2/3</sup>'],
 ['combining-mark-prefix','a\u0301pc<sup>−2/3</sup>'],['bare-mark-prefix','\u0301pc<sup>−2/3</sup>'],
 ['underscore-prefix','_pc<sup>−2/3</sup>'],['astral-letter-prefix','𝐴pc<sup>−2/3</sup>'],['astral-number-prefix','𝟙pc<sup>−2/3</sup>'],
 ['typed-data-test','pc<sup><a data-test="citation-ref" href="#ref-CR1">−2/3</a></sup>'],
 ['typed-href','pc<sup><a href="#ref-CR1">−2/3</a></sup>'],
];
for(const [id,input] of rejects)test(`synthetic reject inference: ${id}`,async()=>{
  const record={id:`reject/${id}`,category:'NEW_COLLECTOR_MUST_REJECT',input,checks:[]};
  await withPage(`<p>${input}</p>`,page=>{
    check(record,'no known or unproved whole unit factor is inferred',()=>assert.equal(page.semantic.scientificRuns.some(({tex})=>/\\(?:mathrm|text)\{(?:pc|km|cm|word|topic)\}\^|(?:pc|km|cm|word|topic)\^/u.test(tex)),false));
    if(id.startsWith('typed-'))check(record,'non-numeric citation label is preserved without guessed citation number',()=>{
      assert.deepEqual(page.semantic.citations,[]);
      assert.ok(page.cleanedHtml.includes('−2/3</a>'));
    });
  });
  finish(record);
});

const opaque=[
 ['inline-tex','<p>$pc<sup>−2/3</sup>$</p>'],['display-tex','<p>$$pc<sup>−2/3</sup>$$</p>'],
 ['cross-span-tex','<p>$<span>pc</span><sup>−2/3</sup>$</p>'],
 ['inline-code','<p><code>pc<sup>−2/3</sup></code></p>'],['pre-code','<pre><code>pc<sup>−2/3</sup></code></pre>'],
 ['literal-backticks','<p>`pc<sup>−2/3</sup>`</p>'],['cross-span-backticks','<p>`<span>pc</span><sup>−2/3</sup>`</p>'],
 ['literal-fence','<p>~~~\npc<sup>−2/3</sup>\n~~~</p>'],
 ['mathjax','<p><span class="mathjax-tex">$\\mathrm{pc}^{−2/3}$</span></p>'],
 ['equation-ancestor','<div class="c-article-equation"><p>pc<sup>−2/3</sup></p></div>'],
 ['mathml-ancestor','<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mtext><p>pc<sup>−2/3</sup></p></mtext></mrow></math>'],
];
for(const [id,input] of opaque)test(`synthetic opaque context: ${id}`,async()=>{
  const record={id:`opaque/${id}`,category:'OPAQUE_CONTEXT',input,checks:[]};
  if(id==='mathml-ancestor'){
    const dom=new JSDOM(article(input));domsOpened++;
    try{check(record,'lawful parsed MathML ancestor exists before production parse',()=>assert.equal(dom.window.document.querySelector('p').closest('math').namespaceURI,'http://www.w3.org/1998/Math/MathML'));}
    finally{dom.window.close();domsClosed++;}
  }
  await withPage(input,page=>{
    check(record,'new whole-factor range does not capture math/code',()=>assert.deepEqual(fractionRuns(page),[]));
    if(id==='mathjax')check(record,'typed source TeX remains exact',()=>assert.deepEqual(page.semantic.inlineMath.map(m=>m.tex),['$\\mathrm{pc}^{−2/3}$']));
  });
  finish(record);
});

const inherited=[
 ['numeric','10<sup>−3</sup>','10^{−3}'],
 ['split-numeric','10<sup>−</sup><sup>3</sup>','10^{−3}'],
 ['styled-variable','<i>F</i><sub>n</sub>','F_{n}'],
 ['bold-variable','<b>D</b><sub>n</sub>','\\mathbf{D}_{n}'],
 ['greek-index','Γ<sub><i>i</i></sub>','Γ_{i}'],
 ['isotope','<sup>13</sup>C','^{13}C'],
];
for(const [id,input,tex] of inherited)test(`synthetic inherited role: ${id}`,async()=>{
  const record={id:`inherited/${id}`,category:'ACCEPTED_COMPATIBILITY',input,checks:[]};
  await withPage(`<p>${input}</p>`,page=>check(record,'existing typed range retains exact source TeX',()=>assert.deepEqual(page.semantic.scientificRuns.map(r=>r.tex),[tex])));
  finish(record);
});
test('synthetic normalizer opacity, integer attachment and strict orphan controls',()=>{
  const record={id:'inherited/normalizer',category:'ACCEPTED_COMPATIBILITY',checks:[]};
  for(const value of ['$\\mathrm{pc}^{-2/3}$','`pc$^{−2/3}$`','~~~\npc$^{−2/3}$\n~~~'])check(record,`opaque ${value}`,()=>assert.equal(normalizeAcademicInline(value),value));
  check(record,'integer unit unchanged',()=>assert.equal(normalizeAcademicInline('cm<sup>−3</sup>'),'$\\mathrm{cm}^{−3}$'));
  check(record,'numeric integer unchanged',()=>assert.equal(normalizeAcademicInline('10<sup>2</sup>'),'$10^{2}$'));
  check(record,'original orphan still rejected',()=>assert.equal(validateMathDelimiters('pc$^{−2/3}$').valid,false));
  finish(record);
});

const mixed=article(`<h2>Results</h2><p>BODY START 392 pc<sup>−2/3</sup> km<sup>−1/3</sup>; 10<sup>−3</sup>; cm<sup>−3</sup>; <i>F</i><sub>n</sub>; <span class="mathjax-tex">$x^2$</span>; citation<sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup> BODY END.</p><div class="c-article-equation" id="Equ1"><span class="mathjax-tex">$$Q=1$$</span><span>(1)</span></div><figure id="Fig1"><img src="https://www.nature.com/synthetic-figure.png"><figcaption>CAPTION START 50 pc<sup>−2/3</sup> km<sup>−1/3</sup>; 10<sup>2</sup>; cm<sup>−3</sup>; <b>D</b><sub>n</sub>; <span class="mathjax-tex">$y^2$</span>; citation<sup><a href="#ref-CR1">1</a></sup> CAPTION END.</figcaption></figure><ol class="c-article-references"><li id="ref-CR1"><p>Synthetic reference.</p></li></ol>`);
for(const dialect of ['markdown','links','quarto'])test(`synthetic mixed body and caption pipeline: ${dialect}`,async()=>{
  const record={id:`mixed/${dialect}`,category:'MIXED_PIPELINE',inputSha256:createHash('sha256').update(mixed).digest('hex'),checks:[]};
  const result=process.env.FRB_PREFLIGHT_MIXED_CACHE_ROOT
    ? JSON.parse(await readFile(path.join(process.env.FRB_PREFLIGHT_MIXED_CACHE_ROOT,`${dialect}.synthetic.result.json`),'utf8'))
    : await clipNature({html:mixed,url,citationStyle:dialect});
  if(!process.env.FRB_PREFLIGHT_MIXED_CACHE_ROOT)clipCalls++;
  assert.equal(result.rawHtml,mixed,'Cached synthetic result must match the exact generated input');
  assert.equal(result.citationStyle,dialect);
  if(receiptRoot){await mkdir(receiptRoot,{recursive:true});await writeFile(path.join(receiptRoot,`${dialect}.synthetic.result.json`),JSON.stringify(result,null,2)+'\n');}
  check(record,'body and caption both retain whole ordered factors',()=>assert.deepEqual(fractionRuns(result),['pc','km','pc','km'].map(fractionTex)));
  check(record,'nonzero inherited numeric and styled markers coexist',()=>{
    const values=result.semantic.scientificRuns.map(r=>r.tex);
    for(const tex of ['10^{−3}','F_{n}','10^{2}','\\mathbf{D}_{n}'])assert.ok(values.includes(tex),tex);
    assert.ok(values.length>=4);
  });
  check(record,'nonzero typed inline/display math preserve exact values',()=>{assert.deepEqual(result.semantic.inlineMath.map(r=>r.tex),['$x^2$','$y^2$']);assert.deepEqual(result.semantic.displayMath.map(r=>r.tex),['Q=1']);});
  check(record,'both typed citation cues retain their roles',()=>assert.deepEqual(result.semantic.citations.map(c=>c.numbers),[[1],[1]]));
  check(record,'body/caption coefficient boundaries and sentinels survive',()=>{for(const value of ['BODY START 392','BODY END.','CAPTION START 50','CAPTION END.'])assert.ok(result.markdown.includes(value),value);});
  check(record,'real figure caption conversion path is exercised',()=>{assert.equal(result.figures.length,1);assert.ok(result.figures[0].captionMarkdown.includes('CAPTION START'));});
  check(record,'two inherited integer cm powers survive',()=>assert.equal((result.markdown.match(/\\mathrm\{cm\}\^\{−3\}/gu)||[]).length,2));
  for(const key of ['mathValidation','rawHtmlValidation','markdownStructure','crossReferenceValidation'])check(record,`strict ${key}`,()=>assert.equal(result.debug[key].valid,true,JSON.stringify(result.debug[key])));
  check(record,'no leaked semantic placeholders',()=>assert.doesNotMatch(result.markdown,/ACADEMICCLIPPER(?:SCIENTIFICRUN|INLINEMATH|DISPLAYMATH|CITATION)\d+X/u));
  check(record,'no attempted synthetic network operation',()=>assert.deepEqual(attempts,[]));
  finish(record);
});
test('synthetic final independent HTTP/DNS ledger',()=>{
  const record={id:'network/final-ledger',category:'SECURITY_CONTROL',checks:[]};
  check(record,'empty record-before-throw attempts including swallowed fallback',()=>assert.deepEqual(attempts,[]));finish(record);
});
