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
