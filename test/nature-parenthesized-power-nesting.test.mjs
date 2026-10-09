// Explicit synthetic qualification regressions; no scholarly source/admission.
import assert from 'node:assert/strict';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {writeFile} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after,test} from 'node:test';

const attempts=[],originals=[],observations=[];
const domKeys=['window','document','DOMParser','XMLSerializer','Node','NodeFilter','HTMLElement','Element','SVGElement','Document'];
const descriptors=new Map(domKeys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
let opened=0,closed=0;
for(const[owner,kind,methods]of [[globalThis,'HTTP',['fetch']],
 [dns,'DNS-callback',['lookup','resolve','resolve4','resolve6','reverse']],
 [dnsPromises,'DNS-promise',['lookup','resolve','resolve4','resolve6','reverse']]])for(const method of methods){
 originals.push({owner,method,value:owner[method]});
 owner[method]=(...args)=>{attempts.push({kind,method,value:String(args[0])});throw new Error(`Unexpected nested-square ${kind}`);};
}
syncBuiltinESMExports();
after(async()=>{
 try{assert.deepEqual(attempts,[]);assert.equal(opened,closed);}
 finally{
  for(const {owner,method,value}of originals)owner[method]=value;syncBuiltinESMExports();
  for(const [key,descriptor]of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
  const restoredBindings=originals.every(({owner,method,value})=>owner[method]===value);
  const restoredDomDescriptors=[...descriptors].every(([key,descriptor])=>assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis,key),descriptor)===undefined);
  assert.ok(restoredBindings&&restoredDomDescriptors);
  if(process.env.NUMERIC_NESTING_RECEIPT)await writeFile(process.env.NUMERIC_NESTING_RECEIPT,JSON.stringify({observations,lifecycle:{opened,closed,guardedMethods:originals.length,attempts,restoredBindings,restoredDomDescriptors},execution:{parses:opened,clips:0,sourceAudits:0,rawReads:0,AExecutions:0}},null,2)+'\n');
 }
});
const {parseNaturePage}=await import('../src/adapters/nature.mjs');
const cases=[
 ['nested-inner-script','((5/60)<sup>2</sup>)',[],null],
 ['lexical-outer-group','x((5/60)<sup>2</sup>)',[],null],
 ['numeric-outer-denominator','(5/(5/60)<sup>2</sup>)',[],null],
 ['numeric-outer-with-separating-space','(5/ (5/60)<sup>2</sup>)',[],null],
 ['numeric-outer-with-pi-factor','(5/π(5/60)<sup>2</sup>/8)',[],null],
 ['prose-parenthetical-control','(see (5/60)<sup>2</sup>)',['(5/60)^{2}'],'(see ACADEMICCLIPPERSCIENTIFICRUN0X)'],
 ['prose-parenthetical-pi-and-divisor','(see π(0.19/60/60)<sup>2</sup>/8)',['(0.19/60/60)^{2}'],'(see πACADEMICCLIPPERSCIENTIFICRUN0X/8)'],
];
for(const[id,input,expected,cleaned]of cases)test(`synthetic nested-square qualification: ${id}`,()=>{
 const observation={id,synthetic:true,input,expected,status:'HARNESS_ERROR'};
 const page=parseNaturePage(`<!doctype html><html><body><div class="c-article-body"><p id="case">${input}</p></div></body></html>`,'https://www.nature.com/articles/synthetic-nested-square');opened+=1;
 try{
  observation.scientificRuns=page.semantic.scientificRuns.map(({marker,tex})=>({marker,tex}));
  observation.inlineMath=page.semantic.inlineMath;observation.citations=page.semantic.citations;
  observation.cleanedParagraph=page.document.querySelector('#case').textContent;
  assert.deepEqual(observation.scientificRuns,expected.map((tex,index)=>({marker:`ACADEMICCLIPPERSCIENTIFICRUN${index}X`,tex})),'Entire ordered registry rejects inner roles of unqualified enclosing mathematics');
  assert.deepEqual(observation.inlineMath,[]);assert.deepEqual(observation.citations,[]);
  for(const{marker}of observation.scientificRuns)assert.equal(page.cleanedHtml.split(marker).length-1,1,'Unique native paragraph ownership');
  if(cleaned)assert.equal(observation.cleanedParagraph,cleaned);
  else assert.equal(page.document.querySelector('#case').innerHTML,input,'Rejected topology remains untouched');
  observation.status='PASS';
 }catch(error){observation.status=error instanceof assert.AssertionError?'CONTRACT_RED':'HARNESS_ERROR';observation.error={name:error.name,message:error.message};throw error;}
 finally{page.dom.window.close();closed+=1;observations.push(observation);}
});
