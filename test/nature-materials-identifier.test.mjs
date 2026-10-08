import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {after,test} from 'node:test';
import {JSDOM} from 'jsdom';
import {clipNature,referencesBib} from '../src/clip.mjs';
import {parseNaturePage} from '../src/adapters/nature.mjs';
import {normalizeAcademicInline} from '../src/normalizers/academic-inline.mjs';
import {validateMathDelimiters} from '../src/validators/math-delimiters.mjs';
const directory=new URL('./fixtures/nature-materials-identifier/',import.meta.url);
const bytes=await readFile(new URL('materials-identifier.excerpt.html',directory));
const html=new TextDecoder('utf8',{fatal:true}).decode(bytes);
const provenance=JSON.parse(await readFile(new URL('source-provenance.json',directory),'utf8'));
const dom=new JSDOM(html),doc=dom.window.document;
const parsed=parseNaturePage(html,provenance.source.url);
assert.deepEqual(parsed.tables,[]);
assert.equal(doc.querySelectorAll('table,a[href*="/tables/"]').length,0);
const cache=new Map();
function clip(dialect){if(!cache.has(dialect))cache.set(dialect,clipNature({html,url:provenance.source.url,citationStyle:dialect}));return cache.get(dialect);}
after(async()=>{
  const output=process.env.ACADEMIC_CLIPPER_IDENTIFIER_EVIDENCE_DIR;
  if(output){assert.ok(path.isAbsolute(output));const records=[];for(const [dialect,promise]of cache){const result=await promise;await writeFile(path.join(output,`identifier.${dialect}.md`),result.markdown);records.push({dialect,metadata:result.metadata,debug:result.debug,references:result.references,sourceIdentifierLines:result.markdown.split('\n').flatMap((line,i)=>/SCAN/u.test(line)&&!/^\[\^|^\d+\. /u.test(line)?[{line:i+1,text:line}]:[]),scientificRuns:result.semantic.scientificRuns,citations:result.semantic.citations});}await writeFile(path.join(output,'actual-three-dialects.json'),JSON.stringify({base:provenance.baseSha,newRealClips:cache.size,records},null,2)+'\n');}
  dom.window.close();parsed.dom.window.close();
});
function roles(node){return [...node.querySelectorAll('sup')].filter(s=>s.textContent==='2'&&s.previousSibling?.textContent.endsWith('r')&&s.nextSibling?.textContent.startsWith('SCAN'));}
function attachedIdentifiers(text){
  // Source-derived attachment oracle, accepting Unicode or equivalent inline
  // TeX typography. It does not infer roles/counts from production semantics.
  let count=(text.match(/r²SCAN/gu)||[]).length;
  for(const match of text.matchAll(/\$([^$\n]+)\$/gu)){
    const normalized=match[1].replace(/\\(?:mathrm|mathit|operatorname)\{([^{}]*)\}/gu,'$1').replace(/\s+/gu,'');
    if(/^r\^(?:\{2\}|2)SCAN$/u.test(normalized))count++;
    else if(/^r\^(?:\{2\}|2)$/u.test(normalized)&&text.slice(match.index+match[0].length).startsWith('SCAN'))count++;
  }
  return count;
}
const contextCues={'main-p2':'Through this iterative procedure','figure-2-caption-p2':'Validation by r','crystals-p5':'We also validate predictions','methods-p25':'is an accurate and numerically efficient functional','data-availability-p0':'Crystal structures corresponding to stable discoveries'};
test('real all-nine projection preserves complete source roles, headings, reference prefix and rights',()=>{
  assert.equal(bytes.length,provenance.fixture.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.fixture.sha256);
  assert.equal(bytes.includes(13),false);
  assert.equal(doc.querySelector('link[rel="canonical"]').href,provenance.source.url);
  assert.equal(doc.querySelector('meta[name="citation_doi"]').content,provenance.source.doi);
  assert.deepEqual([...doc.querySelectorAll('meta[name="citation_author"]')].map(n=>n.content),provenance.sourceRights.orderedSourceCreators);
  assert.equal(doc.querySelectorAll('ol.c-article-references > li').length,43);
  assert.equal(doc.querySelectorAll('figure').length,1);
  assert.equal(doc.querySelector('figure [data-test="figure-caption-text"]').id,'Fig2');
  assert.equal(doc.querySelector('section[data-title="Rights and permissions"] p').textContent.replace(/\s+/gu,' ').trim(),provenance.sourceRights.notices[0].sourceNoticeText);
  assert.equal(doc.querySelector('p.c-footer__legal').textContent,provenance.sourceRights.siteFooterNotice.text);
  let count=0;
  for(const context of provenance.oracles){const node=doc.querySelector(context.selector);assert.equal(node.textContent,context.sourceParagraphText);assert.equal(roles(node).length,context.count);assert.deepEqual([...node.querySelectorAll('i,b,sub,sup')].map(s=>({tag:s.tagName,text:s.textContent})),context.sourceScientificNodes.map(s=>({tag:s.tag,text:s.text})));count+=context.count;}
  assert.equal(count,9);
  for(const heading of provenance.headingContexts){assert.equal(doc.querySelector(heading.selector).innerHTML,heading.sourceHtml);assert.equal(roles(doc.querySelector(heading.selector)).length,1);}
  assert.equal(provenance.fixture.repeatBytesEqual,true);
  assert.equal(provenance.fixture.idempotentBytesEqual,true);
});
for(const dialect of ['markdown','links','quarto']){
  for(const context of provenance.oracles)test(`real r/SUP2/SCAN attachment: ${context.id} (${dialect})`,async()=>{
    const result=await clip(dialect);
    const lines=result.markdown.split('\n').filter(line=>line.includes(contextCues[context.id]));
    assert.equal(lines.length,1,'Complete original context occurs once');
    assert.equal(attachedIdentifiers(lines[0]),context.count,'SUP2 belongs to r with contiguous SCAN suffix, preserving every source position');
  });
  for(const heading of provenance.headingContexts)test(`real source heading script attachment: ${heading.id} (${dialect})`,async()=>{
    const result=await clip(dialect);
    const prefix=heading.id==='Sec7'?'### Validation through experimental matching and ':'#### ';
    const lines=result.markdown.split('\n').filter(line=>line.startsWith(prefix));
    assert.equal(lines.length,1);
    assert.equal(attachedIdentifiers(lines[0]),1,'Original heading SUP2 retains its script role, not a flat 2');
  });
  test(`real identifier math validator (${dialect})`,async()=>{const result=await clip(dialect);assert.equal(result.debug.mathValidation.valid,true);assert.equal(result.debug.mathValidation.scientificFragments.valid,true);assert.equal(result.debug.mathValidation.displayMathCount,0);});
  test(`real retained-context other validators and warnings (${dialect})`,async()=>{const result=await clip(dialect);for(const key of ['markdownStructure','rawHtmlValidation','crossReferenceValidation'])assert.equal(result.debug[key].valid,true,`${key}: ${JSON.stringify(result.debug[key].violations||result.debug[key].issues)}`);assert.deepEqual(result.debug.warnings,provenance.expectations.expectedWarnings);});
}
test('real metadata, references and citation roles remain separate from identifier scripts',async()=>{
  for(const dialect of ['markdown','links','quarto']){const result=await clip(dialect);assert.equal(result.metadata.doi,provenance.source.doi);assert.deepEqual(result.metadata.authors,provenance.sourceRights.orderedSourceCreators);assert.deepEqual(result.references.map(r=>r.number),Array.from({length:43},(_,i)=>i+1));assert.deepEqual(result.semantic.citations.map(c=>c.numbers),[[15,16,17,27],[28],[17],[29],[39],[40,41],[29,42,43]]);assert.equal(result.figures[0].natureId,'Fig2');const bib=referencesBib(result.references);assert.ok(bib.includes('10.1038/s41586-023-06735-9')===false,'Article DOI is not invented as a cited reference');assert.ok(bib.includes('(0<x<-1)'), 'Original ref2 remains; independent #65 is not rewritten');}
});
// Raw SUP markup inside Markdown code has an independent pre-existing academic
// normalizer defect. Its original input/failure remains in external diagnostics;
// this collector boundary uses source Unicode code and existing typed math.
test('synthetic opaque Unicode code and existing math retain their own roles',()=>{const text='`r²SCAN` and $r^{2}\\mathrm{SCAN}$; $x^2$';assert.equal(normalizeAcademicInline(text),text);});
test('synthetic accepted unit and numeric powers retain literal bases',()=>{const text=normalizeAcademicInline('m<sup>3</sup> / s<sup>−1</sup> and 10<sup>−3</sup>');const equivalent=text.replace(/\\mathrm\{([^{}]*)\}/gu,'$1');assert.ok(equivalent.includes('$m^{3}$'));assert.ok(equivalent.includes('$s^{−1}$'));assert.ok(equivalent.includes('$10^{−3}$'));assert.equal(validateMathDelimiters(text).valid,true);});
test('synthetic citation SUP and typed MathJax are not identifier exponents',async()=>{
  const constructed='<html><body><div class="c-article-body"><p>Synthetic only. r<sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup> SCAN; <code>r²SCAN</code>; <span class="mathjax-tex">\\(r^2\\mathrm{SCAN}\\)</span>.</p><h2>References</h2><ol class="c-article-references"><li><p class="c-article-references__text" id="ref-CR1">Synthetic, S. Constructed roles. Journal (2020).</p></li></ol></div></body></html>';
  for(const dialect of ['markdown','links','quarto']){const result=await clipNature({html:constructed,url:'https://www.nature.com/articles/synthetic-identifier-boundary',citationStyle:dialect});assert.deepEqual(result.semantic.citations.map(c=>c.numbers),[[1]]);assert.ok(result.markdown.includes('`r²SCAN`'));assert.ok(result.markdown.includes('$r^2\\mathrm{SCAN}$'));for(const key of ['mathValidation','markdownStructure','rawHtmlValidation','crossReferenceValidation'])assert.equal(result.debug[key].valid,true,key);}
});
test('synthetic unknown prose is not promoted to a typed functional identifier',()=>{
  const constructed='<html><body><div class="c-article-body"><p>Synthetic only. ordinary<sup>2</sup>word.</p></div></body></html>';
  const result=parseNaturePage(constructed,'https://www.nature.com/articles/synthetic-unknown-identifier');
  try{assert.equal(result.semantic.scientificRuns.length,0);assert.ok(result.cleanedHtml.includes('ordinary<sup>2</sup>word'));}finally{result.dom.window.close();}
});
