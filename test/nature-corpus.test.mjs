import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature, referencesBib } from '../src/clip.mjs';
import { assertionRegistry, auditSourceOracle, compareArticleResult, DIALECTS, expectationCoverage,
  runProductionValidators, semanticSummary } from '../scripts/lib/nature-corpus-assertions.mjs';
import { consumeExpectations, createReplay, loadReplayResources, readFixtureBytes,
  stableJson, validateManifest, verifyManifestFixtures } from '../scripts/lib/nature-corpus-infrastructure.mjs';

const corpusRoot = new URL('./corpus/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('corpus-manifest.json', corpusRoot), 'utf8'));
const dns = { 'www.nature.com':[{ address:'151.101.0.95',family:4 }] };
const request = url => ({ url,method:'GET',redirect:'manual' });
const resolution = () => ({ hostname:'www.nature.com',all:true,verbatim:true });
const cache = new Map();
let preflight;

async function execute(article,citationStyle,resourcesOverride) {
  preflight ||= verifyManifestFixtures(manifest,corpusRoot,{ assertionRegistry });
  await preflight;
  const html = (await readFixtureBytes(corpusRoot,article.fixturePath,article.articleId,article.fixtureSha256)).toString('utf8');
  const resources = resourcesOverride || await loadReplayResources(article,corpusRoot);
  const replay = createReplay({ resources,dns });
  try {
    const result = await clipNature({ html,url:article.url,citationStyle,fetchImpl:replay.fetchImpl,resolveHostname:replay.resolveHostname });
    const comparison = compareArticleResult(article,result,{ sourceHtml:html });
    return { article,html,result,comparison,ledger:replay.ledger() };
  } finally {
    replay.assertClean({ expectedRequests:resources.map(r=>request(r.url)),expectedDns:resources.map(resolution) });
  }
}
function run(article,dialect) {
  const key = `${article.articleId}/${dialect}`;
  if (!cache.has(key)) cache.set(key,execute(article,dialect));
  return cache.get(key);
}

test('strict consumers enumerate every admitted source expectation; unknown oracle fields fail closed', async () => {
  validateManifest(manifest,{assertionRegistry});
  assert.equal(manifest.articles.length,9);
  assert.equal(expectationCoverage(manifest,{transportSeamAvailable:true}).length,85);
  assert.equal(assertionRegistry.size,10);
  for(const article of manifest.articles) for(const expectation of article.expectations) {
    const consumer=assertionRegistry.get(expectation.assertionId);
    assert.equal(consumer.validate(expectation.value),true);
    assert.equal(consumer.validate({...expectation.value,version:'unknown'}),false);
    assert.equal(consumer.validate({...expectation.value,unconsumedField:true}),false);
  }
  const withoutConsumer=new Map(assertionRegistry);withoutConsumer.delete('nature-source-citations-v1');
  assert.throws(()=>validateManifest(manifest,{assertionRegistry:withoutConsumer}),/Unconsumed expectation/u);
  assert.equal((await (preflight ||= verifyManifestFixtures(manifest,corpusRoot,{assertionRegistry}))).files.length,13);
});

test('immutable excerpts independently retain the source oracle and actual caption sibling topology', async t => {
  for(const article of manifest.articles) await t.test(article.articleId,async()=>{
    const dom = new JSDOM(await readFile(new URL(article.fixturePath,corpusRoot),'utf8'),{url:article.url});
    const resourceDoms=[];
    try {
      const resources=new Map();for(const r of article.resources){ const d=new JSDOM(await readFile(new URL(r.fixturePath,corpusRoot),'utf8'));resourceDoms.push(d);resources.set(r.id,d.window.document); }
      const records=auditSourceOracle(article,dom.window.document,resources);
      // Subtree byte identity is established by shared preflight. This independent semantic
      // audit deliberately compares values, not parser output or B's audit receipt.
      assert.deepEqual(records.filter(r=>r.status==='failure'),[]);
      const evidence=JSON.parse(await readFile(new URL(article.fixturePath.replace('article.excerpt.html','source-evidence.json'),corpusRoot),'utf8'));
      for(const sibling of evidence.captionSiblingEvidence){
        const caption=dom.window.document.querySelector(sibling.sourceLocator);
        assert.ok(caption,`Missing source caption sibling locator ${sibling.sourceLocator}`);
        const container=caption.parentElement;
        assert.equal(!!caption.closest('figure'),sibling.insideFigure);
        assert.equal(container.className,sibling.parentClass);
        assert.deepEqual(Array.from(container.children).map(n=>({tag:n.tagName,class:n.className,id:n.id,test:n.getAttribute('data-test')})),sibling.orderedElementSiblings);
      }
    } finally { dom.window.close();resourceDoms.forEach(d=>d.window.close()); }
  });
});

for(const article of manifest.articles) for(const dialect of DIALECTS) {
  test(`${article.articleId}/${dialect}: every source expectation through the complete production chain`,async t=>{
    const entry=await run(article,dialect),dom=new JSDOM(entry.html,{url:article.url});
    try {
      const context={article,result:entry.result,sourceDocument:dom.window.document,citationStyle:dialect,bibliography:referencesBib(entry.result.references)};
      for(const expectation of article.expectations) await t.test(expectation.id,async()=>{
        assert.deepEqual(await consumeExpectations({...article,expectations:[expectation]},context,assertionRegistry),[expectation.id]);
      });
      await t.test('all production validators and strict declared warnings',()=>{
        const validation=runProductionValidators(entry.result,dialect);
        for(const [name,value] of Object.entries(validation))assert.equal(value.valid,true,`${name}: ${stableJson(value)}`);
        assert.deepEqual(entry.comparison.warnings.unexpected,[]);
        assert.deepEqual(entry.comparison.warnings.missing,[]);
        assert.deepEqual(entry.comparison.warnings.actual,entry.comparison.warnings.expected);
        assert.equal(validation.math.scientificFragments.valid,true);
        assert.doesNotMatch(entry.result.markdown,/ACADEMICCLIPPER|<math\b|<mrow\b|<mjx-container\b/iu);
      });
    } finally { dom.window.close(); }
  });
  test(`${article.articleId}/${dialect}: repeat Markdown, bibliography, semantics and replay operations`,async()=>{
    const first=await run(article,dialect),repeat=await execute(article,dialect);
    assert.equal(repeat.result.markdown,first.result.markdown);
    assert.equal(referencesBib(repeat.result.references),referencesBib(first.result.references));
    assert.deepEqual(semanticSummary(repeat.result),semanticSummary(first.result));
    assert.deepEqual(repeat.ledger,first.ledger);
  });
}

test('A → B → A keeps Markdown, bibliography and semantics isolated in every dialect',async()=>{
  for(const dialect of DIALECTS){
    const first=await execute(manifest.articles[0],dialect);
    await execute(manifest.articles[4],dialect);
    const last=await execute(manifest.articles[0],dialect);
    assert.equal(last.result.markdown,first.result.markdown);
    assert.deepEqual(semanticSummary(last.result),semanticSummary(first.result));
    assert.equal(referencesBib(last.result.references),referencesBib(first.result.references));
  }
});

test('source assertions reject lost target, changed scientific attachment, reordered clusters and missing caption',async()=>{
  const article=manifest.articles[0],entry=await run(article,'quarto');
  const compare = result=>compareArticleResult(article,result,{sourceHtml:entry.html});
  const find = (result,id)=>compare(result).expectations.find(e=>e.id===id).failures;
  for(const id of ['source-crossrefs-v1','source-inline-v1','source-citations-v1','source-figures-v1'])assert.deepEqual(find(entry.result,id),[],`Mutation consumer baseline must pass: ${id}`);
  assert.deepEqual(find(entry.result,'source-tables-v1'),[],'Accepted table prerequisite must restore the real table baseline');
  assert.deepEqual(compare(entry.result).warnings.unexpected,[]);
  assert.deepEqual(compare(entry.result).warnings.missing,[]);
  const semantic={...entry.result.semantic,crossReferences:new Map(entry.result.semantic.crossReferences)};
  semantic.crossReferences.delete('Fig1');
  assert.ok(find({...entry.result,semantic},'source-crossrefs-v1').some(f=>f.path.endsWith('.identity')));
  const wrongType=new Map(entry.result.semantic.crossReferences);
  wrongType.set('Fig1',{...wrongType.get('Fig1'),type:'equation'});
  assert.ok(find({...entry.result,semantic:{...entry.result.semantic,crossReferences:wrongType}},'source-crossrefs-v1').some(f=>f.path.endsWith('.sourceType')));
  const equations=entry.result.markdown.replaceAll('M_{s}','M_{wrong}');
  assert.notEqual(equations,entry.result.markdown);
  assert.ok(find({...entry.result,markdown:equations},'source-inline-v1').some(f=>f.path.endsWith('.baseAndAttachment')));
  const citations=[...entry.result.semantic.citations];[citations[0],citations[1]]=[citations[1],citations[0]];
  assert.ok(find({...entry.result,semantic:{...entry.result.semantic,citations}},'source-citations-v1').some(f=>f.path==='semantic.orderedSourceClusters'));
  const sourceDom=new JSDOM(entry.html);
  try {
    const cluster=sourceDom.window.document.querySelector('sup a[data-test="citation-ref"],sup a[href*="#ref-CR"]').closest('sup');
    const range=sourceDom.window.document.createRange();range.selectNodeContents(cluster.closest('p'));range.setEndBefore(cluster);
    const word=range.toString().match(/[\p{L}]{5,}/gu).at(-1);
    const markdown=entry.result.markdown.replaceAll(word,'LOST_SOURCE_CONTEXT');
    assert.notEqual(markdown,entry.result.markdown);
    assert.ok(find({...entry.result,markdown},'source-citations-v1').some(f=>f.path.endsWith('.sourceContext')));
  } finally { sourceDom.window.close(); }
  const figures=entry.result.figures.map(f=>({...f}));figures[0].caption='Lost caption';
  assert.ok(find({...entry.result,figures},'source-figures-v1').some(f=>f.path.endsWith('.caption')));
  const badAlt=entry.result.figures.map(f=>({...f}));badAlt[0].alt='Figure 42';
  assert.ok(find({...entry.result,figures:badAlt},'source-figures-v1').some(f=>f.path.endsWith('.shortAlt')));
  const tables=entry.result.tables.map(table=>({...table,markdown:table.markdown.replaceAll('OSSG','MISSING_SOURCE_CELL')}));
  assert.ok(find({...entry.result,tables,markdown:entry.result.markdown.replaceAll('OSSG','MISSING_SOURCE_CELL')},'source-tables-v1').some(f=>f.path.includes('.renderedCell[')));
  const addedWarning=compare({...entry.result,debug:{...entry.result.debug,warnings:[...entry.result.debug.warnings,'UNDECLARED WARNING']}});
  assert.deepEqual(addedWarning.warnings.unexpected,['UNDECLARED WARNING']);
  assert.equal(addedWarning.pass,false);
});

for(const dialect of DIALECTS)test(`source figures reject loss of an interior word only in the final rendered caption/${dialect}`,async()=>{
  const article=manifest.articles[0],entry=await run(article,dialect);
  const comparison=result=>compareArticleResult(article,result,{sourceHtml:entry.html});
  assert.equal(comparison(entry.result).expectations.find(e=>e.id==='source-figures-v1').status,'pass');
  const figure=entry.result.figures[0],image=`![${figure.alt}](${figure.imageUrl})`;
  const start=entry.result.markdown.indexOf(image)+image.length,next=entry.result.markdown.indexOf('\n![',start);
  const caption=entry.result.markdown.slice(start,next),word='dimensionality',offset=caption.indexOf(word);
  assert.ok(offset>0);assert.equal(caption.indexOf(word,offset+word.length),-1);
  assert.ok(figure.caption.includes('spin dimensionality (collinearity/coplanarity)'));
  const absolute=start+offset,markdown=entry.result.markdown.slice(0,absolute)+entry.result.markdown.slice(absolute+word.length);
  const result={...entry.result,markdown};assert.strictEqual(result.figures,entry.result.figures);
  assert.notEqual(markdown,entry.result.markdown);
  for(const validator of Object.values(runProductionValidators(result)))assert.equal(validator.valid,true);
  assert.equal(comparison(result).expectations.find(e=>e.id==='source-figures-v1').status,'failure');
  const unbolded={...entry.result,markdown:entry.result.markdown.replace('**a**, Distinct magnetic geometries','a, Distinct magnetic geometries')};
  assert.notEqual(unbolded.markdown,entry.result.markdown);
  const panelFailure=comparison(unbolded).expectations.find(e=>e.id==='source-figures-v1').failures;
  assert.ok(panelFailure.some(f=>f.path==='figures[0].renderedBoldSingleLetterSequence'));
});

for(const dialect of ['links','quarto'])test(`source crossrefs reject a wrong target at one real occurrence despite other correct links/${dialect}`,async()=>{
  const article=manifest.articles[0],entry=await run(article,dialect);
  const comparison=result=>compareArticleResult(article,result,{sourceHtml:entry.html});
  assert.equal(comparison(entry.result).expectations.find(e=>e.id==='source-crossrefs-v1').status,'pass');
  const prefix=dialect==='quarto'?'fig-':'';
  const original=`[1a](#${prefix}figure-1)`,wrong=`[1a](#${prefix}figure-2)`;
  const markdown=entry.result.markdown.replace(original,wrong);
  assert.notEqual(markdown,entry.result.markdown);assert.ok(markdown.includes(original),'Other correct target occurrences remain');
  const result={...entry.result,markdown};assert.strictEqual(result.semantic,entry.result.semantic);
  for(const validator of Object.values(runProductionValidators(result)))assert.equal(validator.valid,true);
  assert.equal(comparison(result).expectations.find(e=>e.id==='source-crossrefs-v1').status,'failure');
});

test('default source crossrefs reject relinking a degraded figure occurrence to a valid unrelated section',async()=>{
  const article=manifest.articles[0],entry=await run(article,'markdown');
  const comparison=result=>compareArticleResult(article,result,{sourceHtml:entry.html});
  assert.equal(comparison(entry.result).expectations.find(e=>e.id==='source-crossrefs-v1').status,'pass');
  const markdown=entry.result.markdown.replace('Figure  1a shows','Figure  [1a](#methods) shows');
  assert.notEqual(markdown,entry.result.markdown);
  const result={...entry.result,markdown};assert.strictEqual(result.semantic,entry.result.semantic);
  for(const validator of Object.values(runProductionValidators(result)))assert.equal(validator.valid,true);
  assert.ok(comparison(result).expectations.find(e=>e.id==='source-crossrefs-v1').failures.some(f=>f.path.endsWith('.degraded')));
});

for(const dialect of DIALECTS)test(`source figures frame a label-only source heading without following body prose/${dialect}`,async()=>{
  const article=manifest.articles.find(a=>a.articleId==='s41598-018-38309-5'),entry=await run(article,dialect);
  const figures=result=>compareArticleResult(article,result,{sourceHtml:entry.html}).expectations.find(e=>e.id==='source-figures-v1');
  assert.ok(entry.result.figures.every(f=>f.captionMarkdown.startsWith(`${f.label}\n\n`)));
  assert.equal(figures(entry.result).status,'pass','The complete source captions survive when the renderer joins the standalone label to their description');
  const figure=entry.result.figures[0],image=`![${figure.alt}](${figure.imageUrl})`,start=entry.result.markdown.indexOf(image)+image.length;
  const next=entry.result.markdown.indexOf('\n![',start),caption=entry.result.markdown.slice(start,next),word='topography',offset=caption.indexOf(word);
  assert.ok(offset>0);assert.equal(caption.indexOf(word,offset+word.length),-1);
  const absolute=start+offset,result={...entry.result,markdown:entry.result.markdown.slice(0,absolute)+entry.result.markdown.slice(absolute+word.length)};
  assert.strictEqual(result.figures,entry.result.figures);
  assert.ok(figures(result).failures.some(f=>f.path==='figures[0].completeRenderedCaptionPayload'),'Deleting an interior source word still fails the final caption predicate');
  const captionStart=entry.result.markdown.indexOf(`**${figure.label}.**`,start),captionEnd=entry.result.markdown.indexOf('\n\n',captionStart);
  const sourceFigure=article.expectations.find(e=>e.id==='source-figures-v1').value.ordered[0];
  const insertedBody={...entry.result,markdown:entry.result.markdown.slice(0,captionEnd)+` ${sourceFigure.nextParagraph}`+entry.result.markdown.slice(captionEnd)};
  assert.ok(figures(insertedBody).failures.some(f=>f.path==='figures[0].completeRenderedCaptionPayload'),'Body prose inserted into the final caption is not source caption payload');
  const duplicate={...entry.result,markdown:entry.result.markdown.slice(0,captionEnd)+'\n\n'+entry.result.markdown.slice(captionStart,captionEnd)+entry.result.markdown.slice(captionEnd)};
  assert.ok(figures(duplicate).failures.some(f=>f.path==='figures[0].captionOccurrences'),'An additional caption copy is rejected even when its original remains complete');
});

for(const dialect of DIALECTS)test(`source citations preserve a body citation followed by a colon/${dialect}`,async()=>{
  const article=manifest.articles.find(a=>a.articleId==='s41586-022-04755-5'),entry=await run(article,dialect);
  const citations=result=>compareArticleResult(article,result,{sourceHtml:entry.html}).expectations.find(e=>e.id==='source-citations-v1');
  const key=entry.result.references[16].citationKey,citation=dialect==='markdown'?'[^17]':dialect==='links'?'[17](#ref-17)':`[@${key}]`;
  const context=`following equation (9) of ref. ${citation}:`;
  assert.equal(entry.result.markdown.split(context).length,2,'The source citation and following colon survive in their original body paragraph');
  assert.equal(citations(entry.result).status,'pass','An inline citation before a colon is not a footnote definition');
  const result={...entry.result,markdown:entry.result.markdown.replace(context,context.replace('equation','LOST_SOURCE_CONTEXT'))};
  assert.strictEqual(result.semantic,entry.result.semantic);assert.notEqual(result.markdown,entry.result.markdown);
  assert.ok(citations(result).failures.some(f=>f.path==='clusters[50].sourceContext'),'Changing the text next to the same citation still fails its source context predicate');
});

for(const dialect of DIALECTS)test(`source inline cases use the complete source paragraph context beyond a common introductory word/${dialect}`,async()=>{
  const article=manifest.articles.find(a=>a.articleId==='s41534-023-00746-0'),entry=await run(article,dialect);
  const inline=result=>compareArticleResult(article,result,{sourceHtml:entry.html}).expectations.find(e=>e.id==='source-inline-v1');
  const sourceCase=article.expectations.find(e=>e.id==='source-inline-v1').value.cases[16],tex=sourceCase.text.slice(2,-2);
  assert.ok(entry.result.markdown.includes(`$${tex}$`),'The exact source TeX is already present in the true source paragraph');
  assert.equal(inline(entry.result).status,'pass','Other paragraphs containing where do not invalidate the preserved source paragraph');
  const changedTex=tex.replace('^{\\pm }','^{+}');assert.notEqual(changedTex,tex);
  const result={...entry.result,markdown:entry.result.markdown.replace(tex,changedTex)};
  assert.strictEqual(result.semantic,entry.result.semantic);assert.notEqual(result.markdown,entry.result.markdown);
  assert.ok(inline(result).failures.some(f=>f.path==='cases[16].sourceTeX'),'A changed scientific exponent is rejected in final output despite an unchanged semantic model');
  const missing={...entry.result,markdown:entry.result.markdown.replace(tex,'')};
  assert.ok(inline(missing).failures.some(f=>f.path==='cases[16].sourceTeX'),'Deleting the interior source TeX is rejected');
  const paragraphs=entry.result.markdown.split(/\n\s*\n/u).filter(p=>p.includes(`$${tex}$`));assert.equal(paragraphs.length,1);
  const duplicate={...entry.result,markdown:entry.result.markdown.replace(paragraphs[0],`${paragraphs[0]}\n\n${paragraphs[0]}`)};
  assert.ok(inline(duplicate).failures.some(f=>f.path==='cases[16].paragraphContext'),'Duplicating the true scientific paragraph is rejected');
});

for(const dialect of DIALECTS) test(`mocked full-clip table failure and redirect contracts/${dialect}`,async t=>{
  const article=manifest.articles[0],real=(await loadReplayResources(article,corpusRoot))[0];
  const scenarios=[
    {name:'HTTP failure',resources:[{...request(real.url),status:503,responseMocked:true,headers:{'content-type':'text/html'},bodyBytes:Buffer.from('Synthetic HTTP failure')}],status:'fallback-fetch-failed',message:'Unable to fetch or parse the full-size table: HTTP 503'},
    {name:'HTML without cells',resources:[{...request(real.url),status:200,responseMocked:true,headers:{'content-type':'text/html'},bodyBytes:Buffer.from('<p>Explicit synthetic no-cell response.</p>')}],status:'fallback-no-html-table',message:'The full-size Nature page did not expose HTML table cells; retained the absolute URL.'},
    {name:'same-article redirect',resources:[{...request(real.url),status:302,responseMocked:true,headers:{location:`${real.url}/replay`}}, {...real,url:`${real.url}/replay`,responseMocked:true}],status:'full-size-html',message:''},
    {name:'scope escape rejection',resources:[{...request(real.url),status:302,responseMocked:true,headers:{location:'https://www.nature.com/articles/foreign/tables/1'}}],status:'fallback-fetch-failed',message:'Unable to fetch or parse the full-size table: Nature table redirect escaped the current article table scope.'},
  ];
  for(const scenario of scenarios) await t.test(scenario.name,async()=>{
    const entry=await execute(article,dialect,scenario.resources),table=entry.result.tables[0];
    assert.equal(table.tableContentStatus,scenario.status);
    assert.equal(table.tableContentWarning || '',scenario.message);
    assert.deepEqual(entry.result.debug.warnings,scenario.message?[`${table.label}: ${scenario.message}`]:[]);
    assert.ok(entry.result.markdown.includes(real.url));
    assert.equal(entry.ledger.unexpected.length,0);
  });
});
