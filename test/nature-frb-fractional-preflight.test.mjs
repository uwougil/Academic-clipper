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
  let cleanupError;
  try {
    // clipNature owns additional DOMs. Capture window getters in memory only
    // and close all of them, including converter DOMs, after the final case.
    for(const window of capturedWindows)window.close();
    assert.deepEqual(attempts,[],'Final independent record-before-throw ledger');
    assert.equal(domsOpened,domsClosed,'All harness-owned DOMs closed');
  } catch(error){
    cleanupError=error;
  } finally {
    if(windowDescriptor)Object.defineProperty(JSDOM.prototype,'window',windowDescriptor);
    globalThis.fetch=original.fetch;dns.lookup=original.lookup;dnsPromises.lookup=original.promiseLookup;syncBuiltinESMExports();
  }
  const restoredIdentities={fetch:globalThis.fetch===original.fetch,dnsCallback:dns.lookup===original.lookup,dnsPromise:dnsPromises.lookup===original.promiseLookup,windowDescriptor:!windowDescriptor||Object.entries(windowDescriptor).every(([key,value])=>Object.getOwnPropertyDescriptor(JSDOM.prototype,'window')[key]===value)};
  if(receiptRoot){
    await mkdir(receiptRoot,{recursive:true});
    await writeFile(path.join(receiptRoot,'matrix-records.json'),JSON.stringify({node:process.version,sourceRoot:sourceRoot.href,records,attempts,parseCalls,clipCalls,domsOpened,domsClosed,capturedWindowsClosed:capturedWindows.size,restoredIdentities,writerProof:'Only parseNaturePage/clipNature/normalizer/validator called. No writePaper invocation; no runtime writer spy claimed.'},null,2)+'\n');
  }
  assert.deepEqual(restoredIdentities,{fetch:true,dnsCallback:true,dnsPromise:true,windowDescriptor:true},'Actual restored function/getter identities');
  if(cleanupError)throw cleanupError;
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
const marker=(kind,index)=>`ACADEMICCLIPPER${kind}${index}X`;
const scientificRecords=texes=>texes.map((tex,index)=>({marker:marker('SCIENTIFICRUN',index),tex,provenance:'Nature inline style nodes (<i>/<b>/<sub>/<sup>)'}));
function assertScientificRegistry(page,texes){assert.deepEqual(page.semantic.scientificRuns,scientificRecords(texes));}
function typedMarkers(value){return [...value.matchAll(/ACADEMICCLIPPER(?:SCIENTIFICRUN|INLINEMATH|DISPLAYMATH|CITATION)\d+X/gu)].map(m=>m[0]);}
function mathCitationMarkers(value){return [...value.matchAll(/ACADEMICCLIPPER(?:INLINEMATH|DISPLAYMATH|CITATION)\d+X/gu)].map(m=>m[0]);}
function region(value,start,end){
  const index=value.indexOf(start),stop=value.indexOf(end,index);
  assert.ok(index>=0&&stop>=index,`Exact region ${start}/${end} must exist`);
  assert.equal(value.indexOf(start,index+start.length),-1,`Unique region ${start}`);
  return value.slice(index,stop+end.length);
}

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
    check(record,'complete ordered scientific registry including marker identity and multiplicity',()=>assertScientificRegistry(page,bases.map(fractionTex)));
    check(record,'complete ordered marker placement in cleaned input',()=>assert.deepEqual(typedMarkers(page.cleanedHtml),bases.map((_,i)=>marker('SCIENTIFICRUN',i))));
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
    // Accepted detached styled SUP is an existing orphan family. Preserve its
    // exact record rather than pretending every rejected unit input is empty.
    const expected=id==='nested-italic'?['^{−2/3}']:[];
    check(record,'complete registry preserves only explicitly frozen inherited roles',()=>assertScientificRegistry(page,expected));
    check(record,'complete marker order/multiplicity in cleaned input',()=>assert.deepEqual(typedMarkers(page.cleanedHtml),expected.map((_,i)=>marker('SCIENTIFICRUN',i))));
    if(id.startsWith('typed-'))check(record,'non-numeric citation label is preserved without guessed citation number',()=>{
      assert.deepEqual(page.semantic.citations,[]);
      assert.ok(page.cleanedHtml.includes('−2/3</a>'));
    });
  });
  finish(record);
});

const rightContinuations=[
 ['letter','x'],['digit','1'],['combining-mark','\u0301'],['underscore','_tail'],
 ['astral-letter','𝐴'],['astral-number','𝟙'],['wrapper','<span>x</span>'],
 ['styled-element','<i>x</i>'],['empty-wrapper','<span></span>'],['comment-continuation','<!--edge-->x'],
];
for(const [id,continuation] of rightContinuations)test(`synthetic right continuation: ${id}`,async()=>{
  const base=id==='digit'||id==='astral-number'?'km':'pc';
  const input=`${base}<sup>${base==='pc'?'−2/3':'−1/3'}</sup>${continuation}`,record={id:`right/${id}`,category:'RIGHT_EDGE_REJECTION',input,checks:[]};
  await withPage(`<p>${input}</p>`,page=>{
    check(record,'whole scientific registry remains empty at unproved right edge',()=>assertScientificRegistry(page,[]));
    check(record,'no hidden extra or reordered typed markers',()=>assert.deepEqual(typedMarkers(page.cleanedHtml),[]));
  });
  finish(record);
});
test('synthetic direct typed citation right-edge control',async()=>{
  const input='<p>pc<sup>−2/3</sup><sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup></p><p>km<sup>−1/3</sup><sup><a href="#ref-CR2">2</a></sup></p>';
  const record={id:'right/direct-typed-citations',category:'RIGHT_EDGE_POSITIVE_WITH_TYPED_CONTROL',input,checks:[]};
  await withPage(input,page=>{
    check(record,'both typed citation cues retain complete ordered identities',()=>assert.deepEqual(page.semantic.citations,[{marker:marker('CITATION',0),numbers:[1]},{marker:marker('CITATION',1),numbers:[2]}]));
    check(record,'whole factor registry coexists with independent direct citations',()=>assertScientificRegistry(page,['pc','km'].map(fractionTex)));
    check(record,'complete body marker sequence retains distinct factor/citation ownership',()=>assert.deepEqual(typedMarkers(page.cleanedHtml),[marker('SCIENTIFICRUN',0),marker('CITATION',0),marker('SCIENTIFICRUN',1),marker('CITATION',1)]));
  });
  finish(record);
});
test('synthetic exact registry oracle rejects extra orphan unknown reordered and duplicate records',()=>{
  const record={id:'oracle/exact-registry',category:'ORACLE_STRING_CONTROL',checks:[]};
  const expected=scientificRecords(['pc','km'].map(fractionTex));
  const bad={
    unknown:[...expected,{marker:marker('SCIENTIFICRUN',2),tex:'unknown^{2}',provenance:'unexpected'}],
    orphan:[...expected,{marker:marker('SCIENTIFICRUN',2),tex:'^{−2/3}',provenance:'unexpected'}],
    reordered:[expected[1],expected[0]],duplicate:[...expected,expected[0]],
  };
  for(const [id,actual] of Object.entries(bad))check(record,`${id} cannot be washed out`,()=>assert.throws(()=>assert.deepEqual(actual,expected),assert.AssertionError));
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
    check(record,'complete scientific registry remains empty in opaque context',()=>assertScientificRegistry(page,[]));
    if(id==='mathjax')check(record,'complete typed source TeX registry remains exact',()=>assert.deepEqual(page.semantic.inlineMath,[{marker:marker('INLINEMATH',0),tex:'$\\mathrm{pc}^{−2/3}$'}]));
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
  await withPage(`<p>${input}</p>`,page=>{
    check(record,'existing complete scientific registry remains exact',()=>assertScientificRegistry(page,[tex]));
    check(record,'existing marker placement/multiplicity remains exact',()=>assert.deepEqual(typedMarkers(page.cleanedHtml),[marker('SCIENTIFICRUN',0)]));
  });
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
  const completeTex=[fractionTex('pc'),fractionTex('km'),'10^{−3}','F_{n}',fractionTex('pc'),fractionTex('km'),'10^{2}','\\mathbf{D}_{n}'];
  check(record,'complete ordered registry freezes new factors and inherited roles without filtering',()=>assertScientificRegistry(result,completeTex));
  check(record,'complete body and display marker placement/order/multiplicity',()=>assert.deepEqual(typedMarkers(result.bodyMarkdown),[0,1,2,3].map(i=>marker('SCIENTIFICRUN',i)).concat(marker('INLINEMATH',0),marker('CITATION',0),marker('DISPLAYMATH',0))));
  check(record,'complete caption registry placement/order/multiplicity',()=>{
    assert.equal(result.figures.length,1);
    assert.deepEqual(typedMarkers(result.figures[0].captionHtml),[4,5,6,7].map(i=>marker('SCIENTIFICRUN',i)).concat(marker('INLINEMATH',1),marker('CITATION',1)));
  });
  check(record,'complete inline/display typed registry identities and values',()=>{assert.deepEqual(result.semantic.inlineMath,[{marker:marker('INLINEMATH',0),tex:'$x^2$'},{marker:marker('INLINEMATH',1),tex:'$y^2$'}]);assert.deepEqual(result.semantic.displayMath,[{marker:marker('DISPLAYMATH',0),tex:'Q=1'}]);});
  check(record,'complete typed citation registry identities and numbers',()=>assert.deepEqual(result.semantic.citations,[{marker:marker('CITATION',0),numbers:[1]},{marker:marker('CITATION',1),numbers:[1]}]));
  check(record,'typed math/citation ownership is exact in body and caption',()=>{
    assert.deepEqual(mathCitationMarkers(region(result.bodyMarkdown,'BODY START','BODY END.')),[marker('INLINEMATH',0),marker('CITATION',0)]);
    assert.deepEqual(mathCitationMarkers(result.figures[0].captionHtml),[marker('INLINEMATH',1),marker('CITATION',1)]);
    assert.deepEqual(mathCitationMarkers(result.bodyMarkdown),[marker('INLINEMATH',0),marker('CITATION',0),marker('DISPLAYMATH',0)]);
  });
  check(record,'exact rendered body and caption retain factors coefficients and inherited roles',()=>{
    const citation={markdown:'[^1]',links:'[1](#ref-1)',quarto:'[@Synthetic]'}[dialect];
    const body=`BODY START 392 $${fractionTex('pc')}$ $${fractionTex('km')}$; $10^{−3}$; $\\mathrm{cm}^{−3}$; $F_{n}$; $x^2$; citation${citation} BODY END.`;
    const caption=`CAPTION START 50 $${fractionTex('pc')}$ $${fractionTex('km')}$; $10^{2}$; $\\mathrm{cm}^{−3}$; $\\mathbf{D}_{n}$; $y^2$; citation${citation} CAPTION END.`;
    assert.deepEqual([region(result.markdown,'BODY START','BODY END.'),result.figures[0].captionMarkdown],[body,caption]);
  });
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
