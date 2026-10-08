import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {test,after} from 'node:test';
import {JSDOM} from 'jsdom';
import {parseNaturePage} from '../src/adapters/nature.mjs';

// Explicit synthetic DOM boundaries. These are not real article admissions or
// new scholarly evidence; the existing real p33/p37 test covers all dialects.
const url='https://www.nature.com/articles/s41534-023-00746-0';
const source=await readFile(new URL('./fixtures/nature-split-power/s41534-023-00746-0.excerpt.html',import.meta.url),'utf8');
const rows=[];
after(async()=>{if(process.env.SPLIT_POWER_BOUNDARY_RECEIPT)await writeFile(process.env.SPLIT_POWER_BOUNDARY_RECEIPT,JSON.stringify(rows,null,2)+'\n');});
const positive=[
 ['Unicode minus','~10<sup>−</sup><sup>15</sup> next','10^{−15}'],
 ['ASCII minus','10<sup>-</sup><sup>15</sup>, next','10^{-15}'],
 ['plus sign','10<sup>+</sup><sup>2</sup>; next','10^{+2}'],
 ['operator boundary','x = 10<sup>−</sup><sup>123</sup> next','10^{−123}'],
 ['parenthesis edge','(10<sup>−</sup><sup>0</sup>) next','10^{−0}'],
 ['reference immediately after exponent','10<sup>−</sup><sup>15</sup><sup><a data-test="citation-ref" href="#ref-CR58">58</a></sup> next','10^{−15}'],
];
const negative=[
 ['other numeric base','2<sup>−</sup><sup>15</sup> next',[]],
 ['unknown word','word<sup>−</sup><sup>15</sup> next',[]],
 ['word tail10','word10<sup>−</sup><sup>15</sup> next',[]],
 ['digit tail10','210<sup>−</sup><sup>15</sup> next',[]],
 ['decimal tail10','0.10<sup>−</sup><sup>15</sup> next',[]],
 ['identifier tail10','x_10<sup>−</sup><sup>15</sup> next',[]],
 ['base separating space','10 <sup>−</sup><sup>15</sup> next',[]],
 ['between SUP space','10<sup>−</sup> <sup>15</sup> next',[]],
 ['between SUP thin space','10<sup>−</sup>\u2009<sup>15</sup> next',[]],
 ['between SUP comment','10<sup>−</sup><!-- boundary --><sup>15</sup> next',[]],
 ['digits wrapper','10<sup>−</sup><span><sup>15</sup></span> next',[]],
 // Existing detached styled SUP roles are retained; they are not a merged
 // numeric exponent, and their existing orphan validation is outside #63.
 ['nested sign style','10<sup><i>−</i></sup><sup>15</sup> next',['^{−}']],
 ['nested digit style','10<sup>−</sup><sup><i>15</i></sup> next',['^{15}']],
 ['sign content whitespace','10<sup> − </sup><sup>15</sup> next',[]],
 ['digits content whitespace','10<sup>−</sup><sup> 15 </sup> next',[]],
 ['sign comments','10<sup>−<!-- boundary --></sup><sup>15</sup> next',[]],
 ['digits comments','10<sup>−</sup><sup>1<!-- boundary -->5</sup> next',[]],
 ['noninteger digits','10<sup>−</sup><sup>1.5</sup> next',[]],
 ['already signed digits','10<sup>−</sup><sup>−15</sup> next',[]],
 ['third contiguous numeric SUP','10<sup>−</sup><sup>15</sup><sup>2</sup> next',[]],
 ['preceding extra SUP','<sup>2</sup>10<sup>−</sup><sup>15</sup> next',[]],
 ['sign reference cue','10<sup><a data-test="citation-ref" href="#ref-CR58">−</a></sup><sup>15</sup> next',[]],
 ['digit reference cue','10<sup>−</sup><sup><a href="#ref-CR58">15</a></sup> next',[]],
 ['code DOM','<code>10<sup>−</sup><sup>15</sup></code> next',[]],
 ['pre DOM','<pre>10<sup>−</sup><sup>15</sup></pre> next',[]],
 ['math DOM','<math>10<sup>−</sup><sup>15</sup></math> next',[]],
 ['inline dollar math','$10<sup>−</sup><sup>15</sup>$ next',[]],
 ['inline backtick code','`10<sup>−</sup><sup>15</sup>` next',[]],
 ['lone sign','10<sup>−</sup> next',[]],
 ['single signed SUP control','10<sup>−15</sup> next',['10^{−15}']],
 ['single positive SUP control','10<sup>15</sup> next',['10^{15}']],
 ['styled existing control','<i>x</i><sup>2</sup> next',['x^{2}']],
 ['leading isotope control','value <sup>13</sup>C NMR next',['^{13}C']],
 ['existing MathJax control','<span class="mathjax-tex">\\(10^{-15}\\)</span> next',[]],
];
for(const[qualifying,cases]of [[true,positive],[false,negative]])for(const[name,input,expected]of cases)test(`synthetic split-power boundary ${qualifying?'qualifies':'retains'}: ${name}`,()=>{
 const dom=new JSDOM(source),body=dom.window.document.querySelector('.c-article-body');
 body.innerHTML=`<p id="boundary">${input}</p>`;const page=parseNaturePage(dom.serialize(),url);
 const actual=page.semantic.scientificRuns.map(r=>r.tex);rows.push({name,qualifying,input,expected:qualifying?[expected]:expected,actual,cleaned:page.cleanedHtml,inlineMath:page.semantic.inlineMath.map(m=>m.tex),citations:page.semantic.citations.map(c=>c.numbers)});
 try{
  assert.deepEqual(actual,qualifying?[expected]:expected,'Exactly the declared original DOM role is captured; no inferred unknown role');
  if(name==='reference immediately after exponent')assert.deepEqual(page.semantic.citations.map(c=>c.numbers),[[58]]);
  if(name==='existing MathJax control')assert.deepEqual(page.semantic.inlineMath.map(m=>m.tex),['10^{-15}']);
 }finally{page.dom.window.close();dom.window.close();}
});
