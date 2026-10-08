import assert from 'node:assert/strict';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {mkdir,writeFile} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {pathToFileURL} from 'node:url';
import {test} from 'node:test';

// Explicitly synthetic boundary probes: no article/source admission, source
// projection, resource hydration or real Chemistry regression is repeated here.
const production=process.env.CHEMISTRY_DELTA_PRODUCTION_ROOT
  ? pathToFileURL(`${process.env.CHEMISTRY_DELTA_PRODUCTION_ROOT.replace(/\\/gu,'/')}/`)
  : new URL('../',import.meta.url);
const url='https://www.nature.com/articles/synthetic-delta-boundary';
const citation='<sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>';
const references='<ol class="c-article-references"><li id="ref-CR1"><p>Alpha, A. Synthetic reference. Journal 1, 1 (2020).</p></li></ol>';
const fixture=body=>`<html><head><title>Synthetic Delta boundary</title></head><body><div class="c-article-body">${body}${references}</div></body></html>`;
const atom=tex=>`$${tex}$`;
// ALL inline atoms, no Delta/power filtering: grouping must be exact. In
// particular a valid-looking ^{1}2 is not accepted as source ^{12}.
const atoms=text=>[...text.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].map(m=>m[1]);
const cases=[
  {id:'original-comma-label',body:'Δ<sup>12,13</sup>-alkene',runs:['Δ^{12,13}']},
  {id:'single-group-12',body:'Δ<sup>12</sup>-alkene',runs:['Δ^{12}']},
  {id:'single-group-13',body:'Δ<sup>13</sup>-alkene',runs:['Δ^{13}']},
  {id:'two-labels-ordered',body:'Δ<sup>12</sup>-alkene; Δ<sup>13</sup>-alkene',runs:['Δ^{12}','Δ^{13}']},
  ...['A','é','2','\u0301','_','𐐀','𝟚'].map(edge=>({id:`left-token-${edge.codePointAt(0).toString(16)}`,body:`${edge}Δ<sup>12,13</sup>-alkene`,runs:[]})),
  ...['A','é','2','\u0301','_','𐐀','𝟚'].map(edge=>({id:`right-token-${edge.codePointAt(0).toString(16)}`,body:`Δ<sup>12,13</sup>${edge}`,runs:[]})),
  {id:'separating-space',body:'Δ <sup>12,13</sup>-alkene',runs:[]},
  {id:'separating-comment',body:'Δ<!-- boundary --><sup>12,13</sup>-alkene',runs:[]},
  {id:'wrapped-base',body:'<span>Δ</span><sup>12,13</sup>-alkene',runs:[]},
  {id:'wrapped-script',body:'Δ<span><sup>12,13</sup></span>-alkene',runs:[]},
  {id:'complex-script',body:'Δ<sup><span>12,13</span></sup>-alkene',runs:[]},
  {id:'extra-attachment',body:'Δ<sup>12,13</sup><sub>2</sub>-alkene',runs:[]},
  {id:'non-label-script',body:'Δ<sup>12,13junk</sup>-alkene',runs:[]},
  {id:'other-greek',body:'Γ<sup>12,13</sup>-alkene',runs:[]},
  {id:'unknown-word',body:'word<sup>12,13</sup>-alkene',runs:[]},
  {id:'styled-base',body:'<i>Δ</i><sup>12,13</sup>-alkene',runs:['Δ^{12,13}-alkene']},
  // Existing detached styled SUP collector owns this run. It is not a plain
  // Delta label and is not claimed semantically healthy by this boundary test.
  {id:'styled-script',body:'Δ<sup><i>12,13</i></sup>-alkene',runs:['^{12,13}-alkene']},
  {id:'typed-citation-is-separate',body:`Δ${citation}-alkene`,runs:[],citations:[[1]]},
  {id:'direct-citation-after-label',body:`Δ<sup>12,13</sup>${citation}-alkene`,runs:['Δ^{12,13}'],citations:[[1]]},
  {id:'code-ancestor',body:'<code>Δ<sup>12,13</sup>-alkene</code>',runs:[]},
  {id:'pre-ancestor',html:'<pre><p>Δ<sup>12,13</sup>-alkene</p></pre>',runs:[]},
  {id:'real-mathml-ancestor',html:'<math><mtext><p>Δ<sup>12,13</sup>-alkene</p></mtext></math>',runs:[]},
  {id:'mathjax-opaque',body:String.raw`<span class="mathjax-tex">\(\Delta^{12,13}\)</span>`,runs:[],inline:['\\Delta^{12,13}']},
  {id:'equation-opaque',html:String.raw`<div class="c-article-equation" id="Equ1"><p>Δ<sup>12,13</sup>-alkene</p><span class="mathjax-tex">\[\Delta^{12,13}\]</span></div>`,runs:[],display:['\\Delta^{12,13}']},
  {id:'closed-dollar-across-span',body:'$<span>q+</span>Δ<sup>12,13</sup>$',runs:[]},
  {id:'closed-parens-across-span',body:String.raw`\(<span>q+</span>Δ<sup>12,13</sup>\)`,runs:[]},
];

test('synthetic Chemistry Delta preflight (no production edits)',async t=>{
  const attempts=[],records=[],doms=[],clipWindows=new Set();
  const original={fetch:globalThis.fetch,lookup:dns.lookup,promiseLookup:dnsPromises.lookup};
  // Guards precede dynamic production imports and all DOM/parser operations.
  globalThis.fetch=async(...args)=>{attempts.push({kind:'HTTP',url:String(args[0])});throw Error('Unexpected synthetic Delta HTTP');};
  dns.lookup=(...args)=>{attempts.push({kind:'DNS',host:String(args[0])});throw Error('Unexpected synthetic Delta DNS');};
  dnsPromises.lookup=async(...args)=>{attempts.push({kind:'DNS-promise',host:String(args[0])});throw Error('Unexpected synthetic Delta DNS');};
  syncBuiltinESMExports();
  try{
    const {parseNaturePage}=await import(new URL('src/adapters/nature.mjs',production));
    const {clipNature}=await import(new URL('src/clip.mjs',production));
    for(const item of cases)await t.test(item.id,()=>{
      const html=fixture(item.html||`<p>BEGIN ${item.body} END</p>`),page=parseNaturePage(html,url);doms.push(page.dom);
      const record={id:item.id,input:html,runs:page.semantic.scientificRuns.map(({marker,tex})=>({marker,tex})),inline:page.semantic.inlineMath.map(({marker,tex})=>({marker,tex})),display:page.semantic.displayMath.map(({marker,tex})=>({marker,tex})),citations:page.semantic.citations.map(c=>c.numbers),cleanedHtml:page.cleanedHtml,expected:item};records.push(record);
      assert.deepEqual(record.runs.map(r=>r.tex),item.runs,'Full ordered scientific runs retain only proven roles');
      assert.deepEqual(record.runs.map(r=>r.marker),item.runs.map((_,i)=>`ACADEMICCLIPPERSCIENTIFICRUN${i}X`),'Exact marker identity and multiplicity');
      assert.deepEqual(record.inline.map(r=>r.tex),item.inline||[]);
      assert.deepEqual(record.display.map(r=>r.tex),item.display||[]);
      assert.deepEqual(record.citations,item.citations||[]);
      assert.deepEqual(attempts,[],'Even swallowed transport attempts fail independently');
    });
    await t.test('grouped-atom-oracle-rejects-valid-looking-counterfeits',()=>{
      assert.deepEqual(atoms('$Δ^{12}$; $Δ^{13}$'),['Δ^{12}','Δ^{13}']);
      for(const [counterfeit,expected] of [['$Δ^{1}2$','Δ^{12}'],['$Δ^{1}3$','Δ^{13}'],['$Δ^{12.13}$','Δ^{12,13}'],['$Δ^{12/13}$','Δ^{12,13}'],['Δ$^{12,13}$','Δ^{12,13}']])assert.notDeepEqual(atoms(counterfeit),[expected]);
    });
    const mixed=fixture(String.raw`<p>BODY0 <i>x</i><sup>2</sup> BODY1 10<sup>3</sup> BODY2 <span class="mathjax-tex">\(z_{1}\)</span> BODY3 Δ<sup>12,13</sup>-alkene BODY4 ${citation} BODY5</p><figure id="Fig1"><h3>Fig. 1: Synthetic boundary.</h3><img src="https://www.nature.com/synthetic.png" alt="Synthetic boundary"><figcaption><p>CAP0 <i>y</i><sup>2</sup> CAP1 Δ<sup>13</sup>-alkene CAP2 ${citation} CAP3</p></figcaption></figure>`);
    for(const dialect of ['markdown','links','quarto'])await t.test(`mixed-existing-and-Delta-body-caption-${dialect}`,async()=>{
      // clipNature does not expose its parser DOM. Observe only the existing
      // withDomGlobals window assignment so the harness can close it too.
      const descriptor=Object.getOwnPropertyDescriptor(globalThis,'window');
      const previousWindow=globalThis.window;
      let value=previousWindow,result;
      Object.defineProperty(globalThis,'window',{configurable:true,get:()=>value,set:next=>{value=next;if(next!==previousWindow&&next?.close&&next?.document)clipWindows.add(next);}});
      try{result=await clipNature({html:mixed,url,citationStyle:dialect});}
      finally{if(descriptor)Object.defineProperty(globalThis,'window',descriptor);else delete globalThis.window;assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis,'window'),descriptor);}
      records.push({id:`mixed-${dialect}`,synthetic:true,result});
      const runs=['x^{2}','10^{3}','Δ^{12,13}','y^{2}','Δ^{13}'];
      assert.deepEqual(result.semantic.scientificRuns.map(r=>r.tex),runs,'ALL ordered mixed runs');
      assert.deepEqual(result.semantic.scientificRuns.map(r=>r.marker),runs.map((_,i)=>`ACADEMICCLIPPERSCIENTIFICRUN${i}X`));
      assert.deepEqual(result.semantic.inlineMath.map(r=>r.tex),['z_{1}']);
      assert.deepEqual(result.semantic.citations.map(c=>c.numbers),[[1],[1]]);
      assert.deepEqual(atoms(result.markdown),['x^{2}','10^{3}','z_{1}','Δ^{12,13}','y^{2}','Δ^{13}'],'All emitted atoms, exact groups and body/caption source order');
      const cite=dialect==='markdown'?'[^1]':dialect==='links'?'[1](#ref-1)':'[@Alpha2020]';
      assert.ok(result.markdown.includes(`BODY0 ${atom(runs[0])} BODY1 ${atom(runs[1])} BODY2 $z_{1}$ BODY3 ${atom(runs[2])}-alkene BODY4 ${cite} BODY5`));
      assert.ok(result.markdown.includes(`CAP0 ${atom(runs[3])} CAP1 ${atom(runs[4])}-alkene CAP2 ${cite} CAP3`));
      assert.doesNotMatch(result.markdown,/ACADEMICCLIPPER/u);
      for(const key of ['mathValidation','rawHtmlValidation','markdownStructure','crossReferenceValidation'])assert.equal(result.debug[key].valid,true,key);
      assert.deepEqual(attempts,[]);
    });
  }finally{
    try{for(const dom of doms)dom.window.close();for(const window of clipWindows)window.close();}
    finally{globalThis.fetch=original.fetch;dns.lookup=original.lookup;dnsPromises.lookup=original.promiseLookup;syncBuiltinESMExports();}
    assert.equal(globalThis.fetch,original.fetch);assert.equal(dns.lookup,original.lookup);assert.equal(dnsPromises.lookup,original.promiseLookup);
    if(process.env.CHEMISTRY_DELTA_PREFLIGHT_RECEIPT_ROOT){const root=process.env.CHEMISTRY_DELTA_PREFLIGHT_RECEIPT_ROOT;await mkdir(root,{recursive:true});await writeFile(`${root}/synthetic-results.json`,JSON.stringify({synthetic:true,production:String(production),node:process.version,newRealClips:0,newSourceProjections:0,closedParserDoms:doms.length,closedInternalClipWindows:clipWindows.size,restoredExactBindings:true,attempts,records},null,2)+'\n');}
    assert.deepEqual(attempts,[],'Global final ledger assertion after all attempts and restoration');
  }
});
