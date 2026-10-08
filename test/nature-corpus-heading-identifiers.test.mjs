import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { syncBuiltinESMExports } from 'node:module';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import { JSDOM } from 'jsdom';
import { assertionRegistry } from '../scripts/lib/nature-corpus-assertions.mjs';

// Explicit synthetic heading source, independent of any admitted article.
const html='<section id="synthetic-heading" data-title="Synthetic"><h3 id="Synthetic1">Synthetic q<sup>2</sup>MODEL</h3><h4 id="Synthetic2">Following heading</h4></section>';
const article={articleId:'synthetic-heading',retainedBlocks:[{id:'synthetic-heading',selector:'#synthetic-heading'}]};
const expectation={id:'synthetic-headings',assertionId:'nature-source-headings-v1',blockIds:['synthetic-heading'],value:{version:'1.0.0',ordered:[
  {id:'Synthetic1',level:3,text:'Synthetic q2MODEL',parentSection:'Synthetic',blockIds:['synthetic-heading']},
  {id:'Synthetic2',level:4,text:'Following heading',parentSection:'Synthetic',blockIds:['synthetic-heading']},
]}};
const consumer=assertionRegistry.get('nature-source-headings-v1');
const attempts=[],bindings=[],doms=[];
let synthetic,source,manifest,cached=[];
function guard(object,key,label){const descriptor=Object.getOwnPropertyDescriptor(object,key);bindings.push({object,key,descriptor});Object.defineProperty(object,key,{...descriptor,value:(...args)=>{attempts.push({binding:label,argument:String(args[0])});throw new Error(`Undeclared network ${label}`);}});}
before(async()=>{
  guard(globalThis,'fetch','fetch');guard(dns,'lookup','dns.lookup');guard(dnsPromises,'lookup','dns.promises.lookup');syncBuiltinESMExports();
  synthetic=new JSDOM(html);doms.push(synthetic);
  const prefix=process.env.ACADEMIC_CLIPPER_HEADING_CACHE_PREFIX;
  if(!prefix)return;
  // Optional diagnostic consumes six previously returned outputs; no clip.
  // One frozen source DOM is required by the actual source-dependent consumer.
  const bytes=await readFile(new URL('./corpus/fixtures/s41586-023-06735-9/article.excerpt.html',import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),'c997a761f1dea592df1d1b6007d338bf028de4825e48acdd94645cd2eba05517');
  source=new JSDOM(bytes.toString('utf8'));doms.push(source);
  manifest=JSON.parse(await readFile(new URL('./corpus/corpus-manifest.json',import.meta.url),'utf8'));
  const observer=JSON.parse(await readFile(`${prefix}-observer.json`,'utf8'));
  for(const capture of observer.captures){const data=await readFile(capture.file);assert.equal(createHash('sha256').update(data).digest('hex'),capture.sha256);cached.push(JSON.parse(data));}
  assert.equal(cached.length,6);
});
after(async()=>{
  for(const dom of doms)dom.window.close();
  for(const {object,key,descriptor}of bindings)Object.defineProperty(object,key,descriptor);
  syncBuiltinESMExports();
  assert.deepEqual(attempts,[]);assert.ok(bindings.every(b=>Object.getOwnPropertyDescriptor(b.object,b.key).value===b.descriptor.value));
  if(process.env.ACADEMIC_CLIPPER_HEADING_CACHE_PREFIX)await writeFile(`${process.env.ACADEMIC_CLIPPER_HEADING_CACHE_PREFIX}-consumer-guard.json`,JSON.stringify({attempts,restored:true,constructedDoms:1,frozenSourceDoms:1,closedDoms:doms.length,newClipInvocations:0,clipEvidence:'This test invokes only assertionRegistry consumer with cached results, never clipNature or parser exports'},null,2)+'\n');
});
for(const dialect of ['markdown','links','quarto']){
  const target=dialect==='quarto'?' {#sec-synthetic-q2model}':'';
  const check=(heading,tail='#### Following heading',value=expectation)=>consumer.assert({article,result:{markdown:`### Synthetic ${heading}${target}\n\n${tail}\n`},sourceDocument:synthetic.window.document,citationStyle:dialect},value);
  test(`source-native heading accepts only whole lawful identifier encodings/${dialect}`,()=>{
    for(const spelling of ['$q^{2}MODEL$','$q^2MODEL$',String.raw`$\mathrm{q}^{2}\mathrm{MODEL}$`,String.raw`$q^{2}\mathrm{MODEL}$`,String.raw`$\mathrm{q^{2}MODEL}$`,'q²MODEL'])assert.equal(check(spelling),true);
  });
  test(`source-native heading rejects lost script, case, grouping, level and order/${dialect}`,()=>{
    for(const changed of ['q2MODEL','$q^{3}MODEL$','$Q^{2}MODEL$','$q^{2}Model$','$^{2}MODEL$','q$^{2}$MODEL','$q^{2}$MODEL','$q^{2}MO$DEL','$q^{2MODEL}$','$q^2M$ODEL','$q^{2}MODEL$ extra','q²MODELq','$q^{2}MODEL$$q^{2}MODEL$'])assert.throws(()=>check(changed),assert.AssertionError,changed);
    assert.throws(()=>check('$q^{2}MODEL$','### Following heading'),assert.AssertionError);
    assert.throws(()=>check('$q^{2}MODEL$',''),assert.AssertionError);
    assert.throws(()=>check('$q^{2}MODEL$','#### Following heading\n\n### Synthetic $q^{2}MODEL$'),assert.AssertionError);
    const wrongSource=structuredClone(expectation);wrongSource.value.ordered[0].text='Synthetic q3MODEL';assert.throws(()=>check('$q^{2}MODEL$','#### Following heading',wrongSource),assert.AssertionError);
  });
}
if(process.env.ACADEMIC_CLIPPER_HEADING_CACHE_PREFIX)test('six cached Materials headings retain original native scripts, full hierarchy and semantic identity',()=>{
  const paper=manifest.articles.find(a=>a.articleId==='s41586-023-06735-9'),oracle=paper.expectations.find(e=>e.id==='source-headings-v1');
  const results=[];
  for(const entry of cached){
    const result={markdown:entry.markdown,semantic:{...entry.semantic,crossReferences:new Map(entry.semantic.crossReferences)}};
    assert.equal(consumer.assert({article:paper,result,sourceDocument:source.window.document,citationStyle:entry.citationStyle},oracle),true);
    for(const [id,label,anchor]of [['Sec7','Validation through experimental matching and r2SCAN','validation-through-experimental-matching-and-r2scan'],['Sec33','r2SCAN','r2scan']])assert.deepEqual(result.semantic.crossReferences.get(id),{type:'section',label,anchor});
    const headingLines=entry.markdown.split('\n').filter(l=>/^#{3,4} /u.test(l)&&l.includes('$r^{2}SCAN$'));assert.equal(headingLines.length,2);
    for(const native of headingLines){
      for(const spelling of ['r2SCAN','$r^{3}SCAN$','$R^{2}SCAN$','$r^{2}scan$','r$^{2}$SCAN','$r^{2SCAN}$']){
        const changed={...result,markdown:entry.markdown.replace(native,native.replace('$r^{2}SCAN$',spelling))};
        assert.throws(()=>consumer.assert({article:paper,result:changed,sourceDocument:source.window.document,citationStyle:entry.citationStyle},oracle),assert.AssertionError);
      }
      const changed={...result,markdown:entry.markdown.replace(native,`${native}\n\n${native}`)};
      assert.throws(()=>consumer.assert({article:paper,result:changed,sourceDocument:source.window.document,citationStyle:entry.citationStyle},oracle),assert.AssertionError);
    }
    results.push({dialect:entry.citationStyle,ordinal:entry.ordinal,expectation:oracle.id,status:'pass',mutationsRejected:14});
  }
  return writeFile(`${process.env.ACADEMIC_CLIPPER_HEADING_CACHE_PREFIX}-consumer-results.json`,JSON.stringify({results,newClips:0,unchangedOtherSourceChecksRerun:0},null,2)+'\n');
});
