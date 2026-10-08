import assert from 'node:assert/strict';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {writeFile} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after,test} from 'node:test';

// Explicit synthetic boundary controls. These are neither scholarly source
// excerpts nor replacements for the 17 independently verified real roles.
// Preflight may point to unchanged accepted Git bytes without merging a pending
// prerequisite. Normal regression runs use this checkout's production adapter.
const adapterUrl=process.env.GREEK_BOUNDARY_ADAPTER_MODULE||new URL('../src/adapters/nature.mjs',import.meta.url).href;
const {parseNaturePage}=await import(adapterUrl);
const attempts=[],original={fetch:globalThis.fetch,lookup:dns.lookup,promiseLookup:dnsPromises.lookup},observations=[];
globalThis.fetch=async(...args)=>{attempts.push({kind:'HTTP',url:String(args[0])});throw new Error('Unexpected Greek boundary HTTP');};
dns.lookup=(...args)=>{attempts.push({kind:'DNS',host:String(args[0])});throw new Error('Unexpected Greek boundary DNS');};
dnsPromises.lookup=async(...args)=>{attempts.push({kind:'DNS-promise',host:String(args[0])});throw new Error('Unexpected Greek boundary DNS');};
syncBuiltinESMExports();
after(async()=>{
 globalThis.fetch=original.fetch;dns.lookup=original.lookup;dnsPromises.lookup=original.promiseLookup;syncBuiltinESMExports();
 assert.deepEqual(attempts,[],'Record before throw catches even a swallowed operation');
 if(process.env.GREEK_BOUNDARY_RECEIPT)await writeFile(process.env.GREEK_BOUNDARY_RECEIPT,JSON.stringify({version:'nature-greek-boundaries/1.0.0',scope:'synthetic parseNaturePage only; no clipNature, Defuddle, validators, writer or live acquisition',adapterUrl,observations,attempts,bindingsRestored:globalThis.fetch===original.fetch&&dns.lookup===original.lookup&&dnsPromises.lookup===original.promiseLookup},null,2)+'\n');
});

const cases=[
 {id:'gamma-italic-b',html:'Γ<sub><i>b</i></sub>',tex:['Γ_{b}'],kind:'qualify'},
 {id:'gamma-italic-a',html:'Γ<sub><i>a</i></sub>',tex:['Γ_{a}'],kind:'qualify'},
 {id:'omega-plain-zero',html:'Ω<sub>0</sub>',tex:['Ω_{0}'],kind:'qualify'},
 {id:'omega-italic-i',html:'Ω<sub><i>i</i></sub>',tex:['Ω_{i}'],kind:'qualify'},
 {id:'plain-single-letter-equivalent',html:'Γ<sub>b</sub>',tex:['Γ_{b}'],kind:'qualify'},
 {id:'punctuation-remains-outside',html:'Left; Γ<sub><i>b</i></sub>, right.',tex:['Γ_{b}'],kind:'qualify',outside:['Left; ', ', right.']},
 {id:'measurement-remains-outside',html:'Value 0.5 Ω<sub>0</sub>.',tex:['Ω_{0}'],kind:'qualify',outside:['Value 0.5 ', '.']},
 {id:'two-independent-source-ranges',html:'Γ<sub><i>a</i></sub> + Ω<sub>0</sub>',tex:['Γ_{a}','Ω_{0}'],kind:'qualify',outside:[' + ']},
 {id:'following-citation-remains-typed',html:'Γ<sub><i>b</i></sub><sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>',tex:['Γ_{b}'],kind:'qualify',citations:[[1]]},
 {id:'preceding-typed-math-remains-separate',html:'<span class="mathjax-tex">\\(x+1\\)</span> Γ<sub><i>b</i></sub>',tex:['Γ_{b}'],kind:'qualify',inline:['x+1']},
 {id:'caption-gamma-italic-a',html:'Synthetic panel Γ<sub><i>a</i></sub>, control.',tex:['Γ_{a}'],kind:'qualify',caption:true,outside:['Synthetic panel ', ', control.']},
 {id:'caption-two-native-ranges',html:'Synthetic Γ<sub><i>a</i></sub> and Γ<sub><i>b</i></sub>.',tex:['Γ_{a}','Γ_{b}'],kind:'qualify',caption:true,outside:['Synthetic ', ' and ', '.']},
 {id:'ordinary-greek-prose',html:'Ordinary Γ, Ω, β remain prose.',tex:[],kind:'reject',outside:['Ordinary Γ, Ω, β remain prose.']},
 {id:'separating-ascii-space',html:'Γ <sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'separating-thin-space',html:'Γ\u2009<sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'separating-newline',html:'Γ\n<sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'separating-comment',html:'Γ<!-- synthetic boundary --><sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'wrapped-base',html:'<span>Γ</span><sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'wrapped-subscript',html:'Γ<span><sub><i>b</i></sub></span>',tex:[],kind:'reject'},
 {id:'unknown-word-prefix',html:'wordΓ<sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'latin-prefix',html:'XΓ<sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'numeric-prefix',html:'3Γ<sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'other-greek-prefix',html:'ΓΩ<sub>0</sub>',tex:[],kind:'reject'},
 {id:'unknown-sibling-continues-word',html:'word<span></span>Γ<sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'subscript-citation-anchor',html:'Γ<sub><a data-test="citation-ref" href="#ref-CR1">1</a></sub>',tex:[],kind:'reject',citations:[[1]]},
 {id:'subscript-external-anchor',html:'Γ<sub><a href="https://example.org/">b</a></sub>',tex:[],kind:'reject'},
 {id:'nested-subscript',html:'Γ<sub><sub>b</sub></sub>',tex:[],kind:'reject'},
 {id:'nested-superscript',html:'Γ<sub><sup>b</sup></sub>',tex:[],kind:'reject'},
 {id:'unsupported-child-wrapper',html:'Γ<sub><span>b</span></sub>',tex:[],kind:'reject'},
 {id:'subscript-mathjax-child',html:'Γ<sub><span class="mathjax-tex">\\(b\\)</span></sub>',tex:[],kind:'reject',inline:['b']},
 {id:'empty-subscript',html:'Γ<sub></sub>',tex:[],kind:'reject'},
 {id:'prose-subscript',html:'Γ<sub>unknown words</sub>',tex:[],kind:'reject'},
 {id:'other-greek-family-out-of-scope',html:'β<sub>b</sub>',tex:[],kind:'reject'},
 {id:'superscript-is-separate-contract',html:'Γ<sup>2</sup>',tex:[],kind:'reject'},
 {id:'code-element',html:'<code>Γ<sub><i>b</i></sub></code>',tex:[],kind:'reject'},
 {id:'code-ancestor',html:'<pre><p>Γ<sub><i>b</i></sub></p></pre>',tex:[],kind:'reject'},
 // Mtext is an HTML integration point: a bare P under Math would be moved
 // outside Math by the HTML parser and would not test an opaque ancestor.
 {id:'math-element',html:'<math><mtext><p>Γ<sub><i>b</i></sub></p></mtext></math>',tex:[],kind:'reject'},
 {id:'inline-dollar-context',html:'$Γ<sub>b</sub>$',tex:[],kind:'reject'},
 {id:'backtick-context',html:'`Γ<sub>b</sub>`',tex:[],kind:'reject'},
 {id:'fenced-context',html:'~~~\nΓ<sub>b</sub>\n~~~',tex:[],kind:'reject'},
 {id:'known-mathjax-is-opaque',html:'<span class="mathjax-tex">\\(\\Gamma_b+\\Omega_0\\)</span>',tex:[],kind:'compatibility',inline:['\\Gamma_b+\\Omega_0']},
 {id:'known-styled-greek-base',html:'<i>Γ</i><sub><i>b</i></sub>',tex:['Γ_{b}'],kind:'compatibility'},
 {id:'known-integer-power',html:'10<sup>−6</sup>',tex:['10^{−6}'],kind:'compatibility'},
 {id:'known-leading-isotope',html:'<sup>13</sup>C, synthetic control.',tex:['^{13}C'],kind:'compatibility'},
 {id:'native-reference-superscript',html:'Γ<sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>',tex:[],kind:'compatibility',citations:[[1]]},
];

function wrapper(row){
 const value=row.caption
  ? `<figure class="c-article-section__figure" id="figure-boundary"><figcaption id="FigBoundary">Synthetic caption</figcaption><img src="https://example.org/synthetic.png" alt="Synthetic control"><div id="figure-boundary-desc" data-test="bottom-caption"><p>${row.html}</p></div></figure>`
  : `<p id="boundary-source">${row.html}</p>`;
 return `<html><head><title>Synthetic Greek boundary</title></head><body><div class="c-article-body">${value}</div></body></html>`;
}
for(const row of cases)test(`synthetic Greek ${row.kind}: ${row.id}`,()=>{
 const page=parseNaturePage(wrapper(row),'https://www.nature.com/articles/synthetic-greek-boundary');
 const snapshot={id:row.id,kind:row.kind,caption:!!row.caption,expectedTex:row.tex,actualTex:page.semantic.scientificRuns.map(v=>v.tex),citations:page.semantic.citations.map(v=>v.numbers),inlineMath:page.semantic.inlineMath.map(v=>v.tex),passed:false};
 try {
  assert.deepEqual(snapshot.actualTex,row.tex,'Only the qualified whole native Greek/SUB source range is typed');
  assert.deepEqual(snapshot.citations,row.citations||[],'Citations keep their independent semantic role');
  assert.deepEqual(snapshot.inlineMath,row.inline||[],'Typed math is not absorbed into a plain Greek candidate');
  const protectedHtml=row.caption?page.figures[0]?.captionHtml:page.cleanedHtml;
  assert.equal(typeof protectedHtml,'string','Caption/body remains available in its existing lifecycle');
  for(const text of row.outside||[])assert.ok(protectedHtml.includes(text),'Neighbors retain exact source punctuation/spacing');
  if(row.caption)for(const run of page.semantic.scientificRuns)assert.ok(protectedHtml.includes(run.marker),'Original caption recapture uses the shared scientific semantic context');
  assert.equal(page.tables.length,0);snapshot.passed=true;
 }catch(error){snapshot.failure={name:error.name,message:error.message};throw error;}
 finally{observations.push(snapshot);page.dom.window.close();}
});
