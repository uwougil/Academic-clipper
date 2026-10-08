import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {readFile,writeFile} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after,test} from 'node:test';
import {JSDOM} from 'jsdom';
import {clipNature} from '../src/clip.mjs';
import {parseNaturePage} from '../src/adapters/nature.mjs';
import {normalizeAcademicInline} from '../src/normalizers/academic-inline.mjs';

const base=new URL('./fixtures/nature-greek-subscript/',import.meta.url);
const provenance=JSON.parse(await readFile(new URL('s41534-023-00746-0.provenance.json',base),'utf8'));
const bytes=await readFile(new URL(provenance.fixture.path,base));
assert.equal(bytes.length,provenance.fixture.bytes);
assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.fixture.sha256);
const html=bytes.toString('utf8'),doms=[],receipts=[];
let syntheticClips=0;
const networkAttempts=[],originalNetwork={fetch:globalThis.fetch,lookup:dns.lookup,promiseLookup:dnsPromises.lookup};
globalThis.fetch=async(...args)=>{networkAttempts.push({kind:'HTTP',url:String(args[0])});throw new Error('Unexpected Greek source HTTP');};
dns.lookup=(...args)=>{networkAttempts.push({kind:'DNS',host:String(args[0])});throw new Error('Unexpected Greek source DNS');};
dnsPromises.lookup=async(...args)=>{networkAttempts.push({kind:'DNS-promise',host:String(args[0])});throw new Error('Unexpected Greek source DNS');};
syncBuiltinESMExports();
after(async()=>{
  globalThis.fetch=originalNetwork.fetch;dns.lookup=originalNetwork.lookup;dnsPromises.lookup=originalNetwork.promiseLookup;syncBuiltinESMExports();
  for(const dom of doms)dom.window.close();
  assert.deepEqual(networkAttempts,[],'Record before throw catches even swallowed HTTP/DNS attempts');
  if(process.env.NATURE_GREEK_RECEIPT_PREFIX)await writeFile(process.env.NATURE_GREEK_RECEIPT_PREFIX+'.network.json',JSON.stringify({networkAttempts,bindingsRestored:globalThis.fetch===originalNetwork.fetch&&dns.lookup===originalNetwork.lookup&&dnsPromises.lookup===originalNetwork.promiseLookup,actualSourceClips:receipts.length,actualSyntheticClips:syntheticClips,writerProof:'Static: test calls clipNature only; clipNature returns results and does not call writePaper or download figures. No writer spy claimed.'},null,2)+'\n');
});

test('real Greek source keeps complete original paragraphs, rights, creators, targets and reference prefix',()=>{
  const dom=new JSDOM(html);doms.push(dom);const d=dom.window.document;
  assert.equal(d.querySelector('link[rel="canonical"]').href,provenance.source.url);
  assert.equal(d.querySelector('meta[name="citation_doi"]').content,provenance.source.doi);
  assert.deepEqual([...d.querySelectorAll('meta[name="citation_author"]')].map(x=>x.content),provenance.sourceRights.orderedSourceCreators);
  assert.equal(provenance.sourceRights.orderedSourceCreators.length,6);
  for(const notice of provenance.sourceRights.notices){
    const p=d.querySelectorAll(notice.sourceSelector)[notice.sourceParagraphIndex];
    assert.equal(p.textContent,notice.sourceRawNoticeText);
    assert.equal(p.querySelector('a').href,'http://creativecommons.org/licenses/by/4.0/');
  }
  assert.equal(d.querySelector('p.c-footer__legal').textContent,provenance.sourceRights.siteFooterNotice.text);
  assert.equal(d.querySelectorAll('ol.c-article-references > li').length,76);
  assert.deepEqual([...d.querySelectorAll('.c-article-equation[id]')].map(x=>x.id),provenance.retainedEquationIds);
  assert.deepEqual([...d.querySelectorAll('[data-test="figure"]')].map(x=>x.id),['figure-5','figure-6']);
  const roles=[];
  for(const paragraph of provenance.paragraphs){
    const p=d.querySelector(paragraph.retainedSelector);
    assert.equal(p.textContent,paragraph.sourceText);
    assert.deepEqual([...p.querySelectorAll('sub,sup,i,b,.mathjax-tex')].map((n,index)=>({index,tag:n.tagName,text:n.textContent})),paragraph.orderedScientificNodes.map(({html,...n})=>n));
    for(const role of paragraph.attachments){
      const sub=p.querySelectorAll('sub')[role.subIndex];
      assert.equal(sub.textContent,role.subscript);assert.equal(sub.previousSibling.nodeType,3);
      assert.equal(sub.previousSibling.textContent.at(-1),role.base);
      roles.push([paragraph.sourceParagraphIndex,role.base,role.subscript]);
    }
  }
  assert.deepEqual(roles,[[4,'Γ','b'],[4,'Γ','a'],[5,'Γ','b'],[6,'Γ','a'],[6,'Γ','b'],[7,'Γ','b'],[7,'Γ','b'],[7,'Γ','b'],[7,'Γ','a'],[7,'Γ','b'],[7,'Γ','a'],[7,'Γ','b'],[9,'Γ','b'],[9,'Γ','a'],[13,'Ω','0'],[13,'Ω','i'],[15,'Ω','i']]);
  assert.equal(provenance.fixture.repeatBytesEqual,true);assert.equal(provenance.fixture.idempotentBytesEqual,true);
  const page=parseNaturePage(html,provenance.source.url);doms.push(page.dom);
  assert.equal(page.tables.length,0,'No hydration resource: real clip performs no table fetch/DNS');
  assert.doesNotMatch(html,/<script(?![^>]*type="application\/ld\+json")|ACADEMICCLIPPER|data-track/u);
});

// Source-role oracle: Greek and its subscript belong to the same expression.
// Include original MathJax's matching Gamma/Omega roles in their source order,
// so valid combined expressions need not have a prescribed TeX spelling.
function greekPairs(tex){
  tex=tex.replace(/\s+/gu,'').replace(/\\Gamma/gu,'Γ').replace(/\\Omega/gu,'Ω');
  tex=tex.replace(/\\(?:mathrm|mathit)\{([ΓΩab0i])\}/gu,'$1');
  return [...tex.matchAll(/([ΓΩ])\}?_(?:\{([ab0i])\}|([ab0i])\b)/gu)].map(m=>[m[1],m[2]||m[3]]);
}
function greekAtoms(context){
  return [...context.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].flatMap(match=>{
    return greekPairs(match[1]);
  });
}
function orderedSourceRoles(paragraph){
  const dom=new JSDOM(html);doms.push(dom);const p=dom.window.document.querySelector(paragraph.retainedSelector);
  return [...p.querySelectorAll('.mathjax-tex,sub')].flatMap(node=>{
    if(node.matches('.mathjax-tex'))return greekPairs(node.textContent);
    const prev=node.previousSibling;
    return prev?.nodeType===3&&/[ΓΩ]$/u.test(prev.textContent)?[[prev.textContent.at(-1),node.textContent]]:[];
  });
}
const sourceRoles=new Map(provenance.paragraphs.map(p=>[p.id,orderedSourceRoles(p)]));
const sentinels={4:'In the regime where',5:'we obtain the desired dissipator',6:'Realization of the parity-flipping dissipator',7:'we require the physical setup',9:'is the squeezed annihilation operator',13:'is the trap frequency',15:'is the reduced density matrix on the motional mode'};

for(const dialect of ['markdown','links','quarto']){
  // Lazy shared result keeps all source clips inside the test lifecycle and
  // its network guards; top-level awaits could let after() run prematurely.
  let resultPromise;
  const getResult=()=>resultPromise??=clipNature({html,url:provenance.source.url,citationStyle:dialect}).then(async result=>{
    receipts.push(dialect);
    // Same three results, no extra clip to populate an external receipt.
    if(process.env.NATURE_GREEK_RECEIPT_PREFIX){
      const prefix=process.env.NATURE_GREEK_RECEIPT_PREFIX+'.'+dialect;
      await writeFile(prefix+'.md',result.markdown);
      await writeFile(prefix+'.json',JSON.stringify({baseSha:provenance.baseSha,runtimeScope:'current checkout production; baseSha above is original source baseline, not runtime identity',fixture:provenance.fixture,metadata:result.metadata,figures:result.figures,tables:result.tables,references:result.references,debug:result.debug,bodyMarkdown:result.bodyMarkdown,semantic:result.semantic},(key,value)=>value instanceof Map?[...value]:value,2)+'\n');
    }
    return result;
  });
  for(const paragraph of provenance.paragraphs){
    test(`real Methods p${paragraph.sourceParagraphIndex} preserves ordered plain Greek/subscript roles (${dialect})`,async()=>{
      const result=await getResult();
      const context=result.markdown.split('\n').find(line=>line.includes(sentinels[paragraph.sourceParagraphIndex]));
      assert.ok(context,paragraph.id+': complete source context was rendered');
      assert.deepEqual(greekAtoms(context),sourceRoles.get(paragraph.id),'Every source base/subscript must stay in ONE expression in its original paragraph, with original MathJax roles in source order: '+context);
      assert.doesNotMatch(context,/[ΓΩ]\s*\$_\{/u,'No orphaned subscript after plain Greek');
    });
  }
  test(`real Greek excerpt production validators and original targets remain valid (${dialect})`,async()=>{
    const result=await getResult();
    assert.deepEqual(result.debug.warnings,[]);
    for(const key of ['rawHtmlValidation','markdownStructure','crossReferenceValidation'])assert.equal(result.debug[key].valid,true,key);
    assert.equal(result.debug.mathValidation.valid,true,JSON.stringify(result.debug.mathValidation));
  });
}

test('synthetic ordinary Greek, existing math and code retain their accepted role boundaries',()=>{
  for(const input of ['Ordinary Γ, Ω and β remain prose.',String.raw`$\Gamma_b+\Omega_0$`,String.raw`$$\Gamma_b+\Omega_0$$`,'`Γ$_{b}$ Ω$_{0}$`','~~~\nΓ_b\n~~~'])assert.equal(normalizeAcademicInline(input),input);
});

test('synthetic Nature plain Greek prose, MathJax, citation SUP and code remain separate in three dialects',async()=>{
  const url='https://www.nature.com/articles/synthetic-greek-boundary';
  const synthetic=String.raw`<html><body><div class="c-article-body"><p>Ordinary Γ, Ω and β. Existing <span class="mathjax-tex">\(\Gamma_b+\Omega_0\)</span>. Citation Γ<sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>. Code <code>Γ_b Ω_0</code>.</p><ol class="c-article-references"><li id="ref-CR1"><p>Synthetic test reference.</p></li></ol></div></body></html>`;
  const page=parseNaturePage(synthetic,url);doms.push(page.dom);
  assert.deepEqual(page.semantic.citations.map(x=>x.numbers),[[1]]);
  assert.equal(page.tables.length,0);
  for(const dialect of ['markdown','links','quarto']){
    const result=await clipNature({html:synthetic,url,citationStyle:dialect});
    syntheticClips+=1;
    assert.ok(result.markdown.includes('Ordinary Γ, Ω and β.'));
    assert.ok(result.markdown.includes(String.raw`$\Gamma_b+\Omega_0$`));
    assert.ok(result.markdown.includes('`Γ_b Ω_0`'));
    assert.doesNotMatch(result.markdown,/Γ\^\{1\}/u);
    for(const key of ['mathValidation','rawHtmlValidation','markdownStructure','crossReferenceValidation'])assert.equal(result.debug[key].valid,true,key);
  }
});
