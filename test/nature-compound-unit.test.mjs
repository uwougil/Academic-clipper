import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import dns from 'node:dns';
import { syncBuiltinESMExports } from 'node:module';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature } from '../src/clip.mjs';
import { normalizeMath } from '../src/normalizers/math.mjs';
import { normalizeAcademicInline } from '../src/normalizers/academic-inline.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';

const fixtureRoot = new URL('./fixtures/nature-compound-unit/', import.meta.url);
const provenance = JSON.parse(await readFile(new URL('s41586-023-06735-9.provenance.json', fixtureRoot), 'utf8'));
const bytes = await readFile(new URL(provenance.fixture.path, fixtureRoot));
assert.equal(bytes.length, provenance.fixture.bytes);
assert.equal(createHash('sha256').update(bytes).digest('hex'), provenance.fixture.sha256);
const html = new TextDecoder('utf8', { fatal:true }).decode(bytes);
const opened=[];
after(() => { for (const dom of opened) dom.window.close(); });

function context(markdown) {
  const matches=markdown.split('\n').filter(line=>line.includes('Following ref.')&&line.includes('superionic behaviour'));
  assert.equal(matches.length,1,'Exactly one complete original conductivity paragraph');
  return matches[0];
}

// Test-only recognizer for the one frozen source role. It requires an actual
// centimetre base inside the exponent's own math atom; stripping all dollars
// would falsely accept the current orphan mScm$^{-1}$ and is forbidden here.
function inverseCentimetreRoles(line) {
  const roles=[];
  for(const match of line.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)) {
    const tex=match[1].trim();
    const cm=/^(?:\\(?:mathrm|text)\{cm\}|cm)\^\{[-−]1\}$/u.test(tex);
    const multiplier=/mS\s*$/u.test(line.slice(0,match.index));
    const combined=/^\\(?:mathrm|text)\{mS\}(?:\\[,;!: ]|\\cdot|\s)*(?:\\(?:mathrm|text)\{cm\}|cm)\^\{[-−]1\}$/u.test(tex);
    if(combined||(cm&&multiplier))roles.push({multiplier:'mS',base:'cm',power:-1});
  }
  for(const ignored of line.matchAll(/\bmS\s*\/\s*cm\b|\bmS\s+cm⁻¹/gu))roles.push({multiplier:'mS',base:'cm',power:-1});
  return roles;
}

test('real source conductivity paragraph retains one compound role, six creators, rights and original reference prefix',()=>{
  const dom=new JSDOM(html);opened.push(dom);const doc=dom.window.document;
  assert.equal(doc.querySelector('link[rel="canonical"]').href,provenance.source.url);
  assert.equal(doc.querySelector('meta[name="citation_doi"]').content,provenance.source.doi);
  assert.deepEqual([...doc.querySelectorAll('meta[name="citation_author"]')].map(n=>n.content),provenance.sourceRights.orderedSourceCreators);
  assert.equal(provenance.sourceRights.orderedSourceCreators.length,6);
  const rights=doc.querySelector(provenance.sourceRights.notice.selector);
  assert.equal(rights.textContent,provenance.sourceRights.notice.sourceRawText);
  assert.deepEqual([...rights.querySelectorAll('a')].map(a=>({href:a.getAttribute('href'),text:a.textContent})),provenance.sourceRights.notice.licenseLinks);
  assert.equal(doc.querySelector(provenance.sourceRights.siteFooter.selector).textContent,provenance.sourceRights.siteFooter.text);
  assert.equal(doc.querySelectorAll('ol.c-article-references > li').length,69);
  assert.deepEqual(['Sec13','Sec41','Sec44'].map(id=>[doc.getElementById(id).tagName,doc.getElementById(id).textContent]),[['H2','Methods'],['H3','MLIPs'],['H4','AIMD conductivity experiments']]);
  const paragraph=doc.querySelector(provenance.paragraph.selector);
  assert.equal(paragraph.textContent,provenance.paragraph.sourceText);
  assert.deepEqual([...paragraph.querySelectorAll('sup,sub,i,b,.mathjax-tex')].map((n,index)=>({index,tag:n.tagName,text:n.textContent})),provenance.paragraph.scientificNodes.map(({html,...x})=>x));
  const sups=[...paragraph.querySelectorAll('sup')];
  assert.equal(sups.length,2);assert.equal(sups[0].querySelector('a[data-test="citation-ref"]').textContent,'69');
  assert.equal(sups[1].textContent,'−1');assert.equal(sups[1].previousSibling.textContent,' > 101.18 mScm');
  assert.equal(provenance.unitRoles.length,1);
  assert.deepEqual(provenance.unitRoles[0].unitFactors.map(({symbol,power})=>[symbol,power]),[['mS',1],['cm',-1]]);
  assert.equal(provenance.fixture.repeatEqual,true);assert.equal(provenance.fixture.idempotenceEqual,true);
});

test('synthetic boundary controls keep typed units, simple powers, unknown words, citations and opaque math/code distinct',()=>{
  const typed=String.raw`$\mathrm{mS}\,\mathrm{cm}^{-1}$`;
  assert.equal(normalizeAcademicInline(typed),typed);
  assert.deepEqual(inverseCentimetreRoles(typed),[{multiplier:'mS',base:'cm',power:-1}]);
  for(const wrong of ['mScm$^{−1}$',String.raw`$\mathrm{mScm}^{-1}$`,'mS$^{-1}$ cm','cm$^{-1}$','samplemScm$^{-1}$'])assert.deepEqual(inverseCentimetreRoles(wrong),[]);
  for(const [input,expected]of [['cm<sup>−1</sup>',String.raw`$\mathrm{cm}^{−1}$`],['10<sup>3</sup>',String.raw`$10^{3}$`],['m<sup>3</sup>',String.raw`$\mathrm{m}^{3}$`]])assert.equal(normalizeAcademicInline(input),expected);
  for(const unknown of ['sample<sup>-1</sup>','column<sup>3</sup>'])assert.ok(!normalizeAcademicInline(unknown).includes('\\mathrm'));
  for(const opaque of ['$x^{2}$','$$\nE=mc^2\n$$','`mScm$^{-1}$`','```text\nmScm$^{-1}$\n```','[^69]','[@Jun2022]'])assert.equal(normalizeAcademicInline(opaque),opaque);
  assert.equal(validateMathDelimiters('mScm$^{−1}$').valid,false,'Validator must keep rejecting the actual old orphan');
});

const networkLedger={http:[],dns:[],writerCalls:0};
const originalFetch=globalThis.fetch,originalLookup=dns.lookup,originalPromiseLookup=dns.promises.lookup;
globalThis.fetch=async(...args)=>{networkLedger.http.push(args.map(String));throw new Error('Undeclared HTTP in compound-unit source test');};
dns.lookup=(...args)=>{networkLedger.dns.push(args.map(String));throw new Error('Undeclared DNS in compound-unit source test');};
dns.promises.lookup=async(...args)=>{networkLedger.dns.push(args.map(String));throw new Error('Undeclared DNS in compound-unit source test');};
syncBuiltinESMExports();
const results=[];
try {
  for(const citationStyle of ['markdown','links','quarto']){
    const result=await clipNature({html,url:provenance.source.url,citationStyle});
    const mathBody=normalizeMath(result.bodyMarkdown,result.semantic);
    const cache={sourceKind:'real-source',acceptedMain:provenance.dependencies.acceptedMain,citationStyle,fixture:provenance.fixture,result,bodyStages:{defuddle:result.bodyMarkdown,math:mathBody,academic:normalizeAcademicInline(mathBody)},networkLedger:structuredClone(networkLedger)};
    if(process.env.NATURE_COMPOUND_UNIT_RECEIPT_ROOT){const dir=process.env.NATURE_COMPOUND_UNIT_RECEIPT_ROOT;await writeFile(`${dir}/${citationStyle}.actual-cache.json`,JSON.stringify(cache,(key,value)=>value instanceof Map?{entries:[...value]}:value,2)+'\n');await writeFile(`${dir}/${citationStyle}.actual.md`,result.markdown);}
    results.push({citationStyle,result});
  }
} finally {globalThis.fetch=originalFetch;dns.lookup=originalLookup;dns.promises.lookup=originalPromiseLookup;syncBuiltinESMExports();}

test('source execution has zero HTTP/DNS and uses only clipNature, with no writer call',()=>{
  assert.deepEqual(networkLedger,{http:[],dns:[],writerCalls:0});
});
for(const {citationStyle,result}of results){
  test(`real compound conductivity unit keeps mS multiplier and inverse cm separately (${citationStyle})`,t=>{
    const line=context(result.markdown);
    assert.equal(result.figures.length,0);assert.equal(result.tables.length,0);assert.equal(result.semantic.displayMath.length,0);assert.equal(result.references.length,69);
    assert.deepEqual(result.debug.warnings,['No Nature figures were detected.','No equation nodes were detected.']);
    assert.deepEqual(result.semantic.citations.map(c=>c.numbers),[[69]]);
    assert.equal(result.debug.markdownStructure.valid,true);assert.equal(result.debug.crossReferenceValidation.valid,true);
    assert.match(line,/101\.18/u,'Keep original threshold literally; source does not have a power on10');
    assert.ok(line.includes('1,000'),'Original temperature digits retained');
    t.diagnostic(JSON.stringify({sourceKind:'real-source',sourceRole:provenance.unitRoles[0],actual:line,validators:{math:result.debug.mathValidation,rawHtml:result.debug.rawHtmlValidation,structure:result.debug.markdownStructure.valid,crossReferences:result.debug.crossReferenceValidation.valid},networkLedger}));
    assert.deepEqual(inverseCentimetreRoles(line),[{multiplier:'mS',base:'cm',power:-1}],'Only centimetre is inverse; orphan/whole compound inverse must fail even if a future delimiter validator passes');
  });
}
