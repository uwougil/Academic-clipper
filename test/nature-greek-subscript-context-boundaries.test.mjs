import assert from 'node:assert/strict';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {writeFile} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after,test} from 'node:test';

// Explicit synthetic additions requested by independent pre-implementation
// review. Standalone file permits one new-cases baseline without loading the
// real-source suite or rerunning the existing 45 synthetic controls.
const adapterUrl=process.env.GREEK_BOUNDARY_ADAPTER_MODULE||new URL('../src/adapters/nature.mjs',import.meta.url).href;
const {parseNaturePage}=await import(adapterUrl);
const attempts=[],original={fetch:globalThis.fetch,lookup:dns.lookup,promiseLookup:dnsPromises.lookup},observations=[];
globalThis.fetch=async(...args)=>{attempts.push({kind:'HTTP',url:String(args[0])});throw new Error('Unexpected Greek context HTTP');};
dns.lookup=(...args)=>{attempts.push({kind:'DNS',host:String(args[0])});throw new Error('Unexpected Greek context DNS');};
dnsPromises.lookup=async(...args)=>{attempts.push({kind:'DNS-promise',host:String(args[0])});throw new Error('Unexpected Greek context DNS');};
syncBuiltinESMExports();
after(async()=>{
 globalThis.fetch=original.fetch;dns.lookup=original.lookup;dnsPromises.lookup=original.promiseLookup;syncBuiltinESMExports();
 assert.deepEqual(attempts,[]);
 if(process.env.GREEK_CONTEXT_BOUNDARY_RECEIPT)await writeFile(process.env.GREEK_CONTEXT_BOUNDARY_RECEIPT,JSON.stringify({version:'nature-greek-context-boundaries/1.0.0',scope:'new synthetic parseNaturePage cases only; no original45, real source clip, Defuddle, validators, writer or acquisition',adapterUrl,observations,attempts,bindingsRestored:globalThis.fetch===original.fetch&&dns.lookup===original.lookup&&dnsPromises.lookup===original.promiseLookup},null,2)+'\n');
});
const cases=[
 {id:'nonempty-sibling-continues-word',html:'<span>word</span>Γ<sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'comment-continues-word',html:'word<!--edge-->Γ<sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'identifier-prefix',html:'x_Γ<sub><i>b</i></sub>',tex:[],kind:'reject'},
 {id:'explicitly-separated-sibling',html:'<span>word</span> Γ<sub><i>b</i></sub>',tex:['Γ_{b}'],kind:'qualify'},
 {id:'cross-span-dollar-with-separate-base',html:'$x+<span>z</span> Γ<sub>b</sub>$',tex:[],kind:'reject'},
 {id:'cross-span-backtick-with-separate-base',html:'`x+<span>z</span> Γ<sub>b</sub>`',tex:[],kind:'reject'},
 {id:'cross-span-fence-with-separate-base',html:'~~~\nx+<span>z</span> Γ<sub>b</sub>\n~~~',tex:[],kind:'reject'},
 {id:'two-italic-subscript-children',html:'Γ<sub><i>b</i><i>a</i></sub>',tex:[],kind:'reject'},
 {id:'italic-plus-text-subscript',html:'Γ<sub><i>b</i>tail</sub>',tex:[],kind:'reject'},
 {id:'anchor-inside-italic-subscript',html:'Γ<sub><i><a href="#ref-CR1">1</a></i></sub>',tex:[],kind:'reject',citations:[[1]]},
 {id:'mathjax-inside-italic-subscript',html:'Γ<sub><i><span class="mathjax-tex">\\(b\\)</span></i></sub>',tex:[],kind:'reject',inline:['b']},
 {id:'additional-subscript-chain',html:'Γ<sub>b</sub><sub>a</sub>',tex:[],kind:'reject'},
 {id:'additional-plain-superscript-chain',html:'Γ<sub>b</sub><sup>2</sup>',tex:[],kind:'reject'},
 // The existing detached styled SUP has its own legacy role. Rejecting a new
 // native Greek range must not remove or reinterpret this inherited record.
 {id:'additional-styled-superscript-keeps-legacy-role',html:'Γ<sub>b</sub><sup><i>2</i></sup>',tex:['^{2}'],kind:'legacy-preserving-reject'},
 {id:'href-only-following-citation',html:'Γ<sub><i>b</i></sub><sup><a href="#ref-CR1">1</a></sup>',tex:['Γ_{b}'],kind:'qualify',citations:[[1]]},
];
const wrapper=html=>`<html><head><title>Synthetic context boundary</title></head><body><div class="c-article-body"><p>${html}</p></div></body></html>`;
for(const row of cases)test(`synthetic Greek context ${row.kind}: ${row.id}`,()=>{
 const page=parseNaturePage(wrapper(row.html),'https://www.nature.com/articles/synthetic-context-boundary');
 const snapshot={id:row.id,kind:row.kind,expectedTex:row.tex,actualTex:page.semantic.scientificRuns.map(v=>v.tex),citations:page.semantic.citations.map(v=>v.numbers),inlineMath:page.semantic.inlineMath.map(v=>v.tex),passed:false};
 try{assert.deepEqual(snapshot.actualTex,row.tex);assert.deepEqual(snapshot.citations,row.citations||[]);assert.deepEqual(snapshot.inlineMath,row.inline||[]);assert.equal(page.tables.length,0);snapshot.passed=true;}
 catch(error){snapshot.failure={name:error.name,message:error.message};throw error;}
 finally{observations.push(snapshot);page.dom.window.close();}
});

const occurrences=(text,marker)=>text.split(marker).length-1;
test('synthetic Greek context qualify: shared body-caption marker subsets are exact, ordered and independent',()=>{
 const html=String.raw`<html><body><div class="c-article-body"><p>Body <i>v</i><sub>0</sub> plus <span class="mathjax-tex">\(x+1\)</span> cite <sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>.</p><figure id="figure-mixed"><figcaption>Synthetic mixed caption</figcaption><img src="https://example.org/synthetic.png" alt="Synthetic control"><div data-test="bottom-caption"><p>Caption Γ<sub><i>a</i></sub> and Γ<sub><i>b</i></sub> with <span class="mathjax-tex">\(\Omega_0\)</span> cite <sup><a href="#ref-CR2">2</a></sup>.</p></div></figure></div></body></html>`;
 const page=parseNaturePage(html,'https://www.nature.com/articles/synthetic-context-boundary');
 const snapshot={id:'shared-body-caption-marker-subsets',kind:'qualify',expectedTex:['v_{0}','Γ_{a}','Γ_{b}'],actualTex:page.semantic.scientificRuns.map(v=>v.tex),bodyHtml:page.cleanedHtml,captionHtml:page.figures[0]?.captionHtml,inlineMath:page.semantic.inlineMath,citations:page.semantic.citations,passed:false};
 try{
  const runs=page.semantic.scientificRuns;
  assert.deepEqual(runs.map(v=>v.tex),snapshot.expectedTex);
  assert.equal(new Set(runs.map(v=>v.marker)).size,3);
  const body=page.cleanedHtml,caption=page.figures[0].captionHtml;
  assert.deepEqual(page.semantic.inlineMath.map(v=>v.tex),['x+1','\\Omega_0']);
  assert.deepEqual(page.semantic.citations.map(v=>v.numbers),[[1],[2]]);
  const [bodyRun,...captionRuns]=runs;
  assert.equal(occurrences(body,bodyRun.marker),1);assert.equal(occurrences(caption,bodyRun.marker),0);
  for(const run of captionRuns){assert.equal(occurrences(caption,run.marker),1);assert.equal(occurrences(body,run.marker),0);}
  assert.ok(caption.indexOf(captionRuns[0].marker)<caption.indexOf(captionRuns[1].marker));
  for(const records of[page.semantic.inlineMath,page.semantic.citations]){
   const [bodyRecord,captionRecord]=records;assert.equal(occurrences(body,bodyRecord.marker),1);assert.equal(occurrences(caption,bodyRecord.marker),0);assert.equal(occurrences(caption,captionRecord.marker),1);assert.equal(occurrences(body,captionRecord.marker),0);
  }
  assert.ok(body.includes(`Body ${bodyRun.marker} plus ${page.semantic.inlineMath[0].marker} cite ${page.semantic.citations[0].marker}.`));
  assert.ok(caption.includes(`Caption ${captionRuns[0].marker} and ${captionRuns[1].marker} with ${page.semantic.inlineMath[1].marker} cite ${page.semantic.citations[1].marker}.`));
  assert.doesNotMatch(caption,/[ΓΩ]<sub/u,'Qualified source nodes have been replaced, not duplicated beside their markers');
  assert.equal(page.tables.length,0);snapshot.passed=true;
 }catch(error){snapshot.failure={name:error.name,message:error.message};throw error;}
 finally{observations.push(snapshot);page.dom.window.close();}
});
