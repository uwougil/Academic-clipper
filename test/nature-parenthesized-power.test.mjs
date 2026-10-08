import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {after,test} from 'node:test';
import {JSDOM} from 'jsdom';
import {clipNature} from '../src/clip.mjs';
import {parseNaturePage} from '../src/adapters/nature.mjs';
import {normalizeAcademicInline} from '../src/normalizers/academic-inline.mjs';
import {validateMathDelimiters} from '../src/validators/math-delimiters.mjs';

const directory=new URL('./fixtures/nature-parenthesized-power/',import.meta.url);
const provenance=JSON.parse(await readFile(new URL('s41586-022-04755-5.provenance.json',directory),'utf8'));
const bytes=await readFile(new URL(provenance.fixture.path,directory)),html=new TextDecoder('utf8',{fatal:true}).decode(bytes);
const dom=new JSDOM(html),source=dom.window.document,page=parseNaturePage(html,provenance.source.url);
const attempts=[],original={fetch:globalThis.fetch,lookup:dns.lookup,promiseLookup:dnsPromises.lookup};
globalThis.fetch=async(...args)=>{attempts.push({kind:'HTTP',url:String(args[0])});throw new Error('Unexpected parenthesized-power HTTP');};
dns.lookup=(...args)=>{attempts.push({kind:'DNS',host:String(args[0])});throw new Error('Unexpected parenthesized-power DNS');};
dnsPromises.lookup=async(...args)=>{attempts.push({kind:'DNS-promise',host:String(args[0])});throw new Error('Unexpected parenthesized-power DNS');};
syncBuiltinESMExports();
after(async()=>{globalThis.fetch=original.fetch;dns.lookup=original.lookup;dnsPromises.lookup=original.promiseLookup;syncBuiltinESMExports();dom.window.close();page.dom.window.close();if(process.env.PARENTHESIZED_POWER_RECEIPT_ROOT)await writeFile(`${process.env.PARENTHESIZED_POWER_RECEIPT_ROOT}/network-ledger.json`,JSON.stringify({attempts,writerProof:'Static: clipNature returns data and does not call writePaper; no writer spy claimed.'},null,2)+'\n');assert.deepEqual(attempts,[],'Record before throw detects requests even if fallback swallows the error');});
assert.deepEqual(page.figures,[]);assert.deepEqual(page.tables,[]);assert.deepEqual(page.references,[]);

test('source parenthesized-power projection preserves complete paragraph, original roles, all creators and rights',()=>{
 assert.equal(bytes.length,provenance.fixture.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),provenance.fixture.sha256);assert.equal(bytes.includes(13),false);
 assert.equal(source.querySelector('link[rel="canonical"]').href,provenance.source.url);assert.equal(source.querySelector('meta[name="citation_doi"]').content,provenance.source.doi);
 assert.deepEqual([...source.querySelectorAll('meta[name="citation_author"]')].map(n=>n.content),provenance.sourceRights.orderedSourceCreators);assert.equal(provenance.sourceRights.orderedSourceCreators.length,35);
 assert.deepEqual([...source.querySelectorAll('.c-article-body h2,.c-article-body h3,.c-article-body h4')].slice(0,3).map(n=>[n.tagName,n.id,n.textContent]),provenance.headingTuples);
 const p=source.querySelector(provenance.paragraph.sourceSelector);assert.equal(p.textContent,provenance.paragraph.sourceText);assert.equal(p.querySelectorAll('a[href]').length,0);assert.equal(source.querySelectorAll('ol.c-article-references > li').length,0);
 assert.deepEqual([...p.querySelectorAll('sup,sub,i,b,.mathjax-tex')].map(n=>({tag:n.tagName,text:n.textContent})),provenance.paragraph.orderedScientificNodes.map(({html,...n})=>n));
 for(const role of provenance.paragraph.roles){const n=p.querySelectorAll('sup')[role.supIndex];assert.equal(n.textContent,'2');assert.equal(n.querySelector('a'),null);assert.equal(n.previousSibling.textContent,role.previousText);assert.equal(n.nextSibling.textContent,role.nextText);assert.ok(n.previousSibling.textContent.endsWith('π'+role.base));assert.ok(n.nextSibling.textContent.startsWith('/8'));}
 for(const notice of provenance.sourceRights.notices)assert.equal(source.querySelectorAll(notice.sourceSelector)[notice.sourceParagraphIndex].textContent,notice.sourceRawNoticeText);
 assert.equal(source.querySelector('p.c-footer__legal').textContent,provenance.sourceRights.siteFooterNotice.text);assert.equal(provenance.fixture.repeatBytesEqual,true);assert.equal(provenance.fixture.idempotentBytesEqual,true);
});

function paragraphContext(markdown){const start=markdown.indexOf('To estimate the chance coincidence probability'),end=markdown.indexOf('10',markdown.indexOf('gives the chance of coincident association',start));assert.ok(start>=0&&end>start);return markdown.slice(start,markdown.indexOf('.',end)+1);}
function mathAtoms(text){return [...text.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].map(m=>({index:m.index,end:m.index+m[0].length,tex:m[1].replace(/\\(?:left|right)/gu,'').replace(/\s+/gu,'')}));}
function attachedRole(context,role){
 const needle=role.base+'^{2}';const atoms=mathAtoms(context).filter(a=>a.tex.includes(needle));
 // Unicode power is also a source-equivalent whole-parentheses representation.
 const unicode=[...context.matchAll(new RegExp(role.base.replace(/[.*+?^${}()|[\]\\]/gu,'\\$&')+'²','gu'))].map(m=>({index:m.index,end:m.index+m[0].length,tex:needle,unicode:true}));
 assert.equal(atoms.length+unicode.length,1,'Exactly one complete original parenthesized base owns exponent2');const atom=[...atoms,...unicode][0],inside=atom.tex.indexOf(needle),before=atom.tex.slice(0,inside),after=atom.tex.slice(inside+needle.length);
 assert.ok(before.endsWith('π')||before.endsWith('\\pi')||context.slice(0,atom.index).trimEnd().endsWith('π'),'The original multiplicative π remains before, outside squared parentheses');
 assert.ok(after.startsWith('/8')||context.slice(atom.end).trimStart().startsWith('/8'),'The original divisor8 remains outside the power');
 assert.doesNotMatch(atom.tex,/\(?(?:π|\\pi)\^\{2\}/u,'Do not square π with the numeric parenthesized factor');return atom;
}
for(const dialect of ['markdown','links','quarto']){
 let promise;const result=()=>promise??=(async()=>{const r=process.env.PARENTHESIZED_POWER_CACHE_ROOT?JSON.parse(await readFile(`${process.env.PARENTHESIZED_POWER_CACHE_ROOT}/${dialect}.result.json`,'utf8')):await clipNature({html,url:provenance.source.url,citationStyle:dialect});assert.equal(r.rawHtml,html);assert.equal(r.citationStyle,dialect);if(process.env.PARENTHESIZED_POWER_RECEIPT_ROOT){const root=process.env.PARENTHESIZED_POWER_RECEIPT_ROOT;await mkdir(root,{recursive:true});await writeFile(`${root}/${dialect}.result.json`,JSON.stringify(r,null,2)+'\n');await writeFile(`${root}/${dialect}.md`,r.markdown);}return r;})();
 for(const role of provenance.paragraph.roles)test(`real ${role.id} attaches square to whole source numeric parentheses (${dialect})`,async()=>{const r=await result(),context=paragraphContext(r.markdown);attachedRole(context,role);assert.doesNotMatch(context,new RegExp(role.base.replace(/[.*+?^${}()|[\]\\]/gu,'\\$&')+'\\$\\^\\{2\\}\\$','u'),'No detached exponent after plain parentheses');});
 test(`parenthesized-power paragraph passes unchanged strict math validator (${dialect})`,async()=>{const r=await result();assert.equal(r.debug.mathValidation.valid,true,JSON.stringify(r.debug.mathValidation));});
 test(`source variables, existing integer power, measurements and zero resources stay truthful (${dialect})`,async()=>{const r=await result(),context=paragraphContext(r.markdown),atoms=mathAtoms(context);
  assert.deepEqual(atoms.map(a=>a.tex.match(/S_\{(?:\\mathrm\{)?(source|offset)/u)?.[1]).filter(Boolean),['source','offset','offset','source']);assert.ok(atoms.some(a=>a.tex==='10^{−6}'));
  const ordinary=context.replace(/\s+/gu,' ');for(const value of ['5.5 GHz','0.06 arcsec','0.01 arcsec','0.12 arcsec','0.19 arcsec','/8 steradians (Sr)','/8 Sr'])assert.ok(ordinary.includes(value),value);
  assert.deepEqual(r.metadata.authors,provenance.sourceRights.orderedSourceCreators);assert.deepEqual(r.references,[]);assert.deepEqual(r.semantic.citations,[]);assert.deepEqual(r.semantic.displayMath,[]);assert.deepEqual(r.figures,[]);assert.deepEqual(r.tables,[]);assert.deepEqual(r.debug.warnings,provenance.expected.warnings);for(const key of ['rawHtmlValidation','markdownStructure','crossReferenceValidation'])assert.equal(r.debug[key].valid,true,key);assert.deepEqual(attempts,[]);
 });
}
// Explicit synthetic compatibility boundaries, never source admissions.
test('synthetic existing math/code, independent citation and known integer unit remain unchanged',()=>{for(const text of ['$(5/60)^{2}$','$\\pi(5/60)^{2}/8$','`(5/60)$^{2}$`','~~~\n(5/60)$^{2}$\n~~~','$10^{−6}$[^7]'])assert.equal(normalizeAcademicInline(text),text);assert.equal(normalizeAcademicInline('cm<sup>−3</sup>'),'$\\mathrm{cm}^{−3}$');});
test('synthetic unknown parentheses are not inferred numeric powers and orphan policy stays strict',()=>{const output=normalizeAcademicInline('(words)<sup>2</sup>');assert.doesNotMatch(output,/\$\(words\)\^|\\mathrm\{words\}/u);assert.equal(validateMathDelimiters('(5/60)$^{2}$').valid,false);});