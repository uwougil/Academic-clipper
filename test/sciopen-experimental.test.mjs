import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { isSciOpenArticleUrl, parseSciOpenPage as parseArticle, clipSciOpenExperimental } from '../src/adapters/sciopen.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';
import { validateRawHtml } from '../src/validators/html-audit.mjs';
import { validateCrossReferences } from '../src/validators/cross-references.mjs';
import { validateMarkdownStructure } from '../src/validators/markdown-structure.mjs';

async function fixture(id) {
  const dir = new URL(`fixtures/sciopen/${id}/`, import.meta.url);
  const html = await readFile(new URL('article.excerpt.html', dir), 'utf8');
  const provenance = JSON.parse(await readFile(new URL('provenance.json', dir), 'utf8'));
  return { html, url: provenance.url, provenance, sourceScope: 'excerpt' };
}
const parseSciOpenPage = (html, url) => parseArticle(html, url, { sourceScope: 'excerpt' });
const nr = await fixture('nr-94907575');
const nre = await fixture('nre-9120184');
let compositionHashes;
for (const order of ['sciopen,rsc','rsc,sciopen','sciopen,aaas','aaas,sciopen','sciopen,pnas','pnas,sciopen']) {
  test(`SciOpen cold lifecycle, bounded heap and concurrent composition: ${order}`, () => {
    const child = spawnSync(process.execPath, ['--expose-gc','--max-old-space-size=512',
      fileURLToPath(new URL('../scripts/sciopen-lifecycle-check.mjs', import.meta.url)), order],
    { encoding: 'utf8', timeout: 120000 });
    assert.equal(child.status, 0, child.stderr || child.error?.message);
    const result = JSON.parse(child.stdout);
    assert.equal(result.articleWindows, 32);
    assert.equal(result.citationStyle, 'markdown');
    assert.equal(result.memoryBytes.length, 3);
    if (compositionHashes) assert.deepEqual(result.markdownHashes, compositionHashes);
    else compositionHashes = result.markdownHashes;
  });
}

test('SciOpen URL admission uses verified host and DOI path, not branding', () => {
  assert.equal(isSciOpenArticleUrl(nr.url), true);
  for (const url of ['https://www.nature.com/articles/s12274-024-6789-9',
    'https://link.springer.com/article/10.1007/s12274-024-6789-9',
    'http://www.sciopen.com/article/10.26599/NR.2025.94907575',
    'https://www.sciopen.com.evil.test/article/10.26599/NR.2025.94907575',
    'https://user:password@www.sciopen.com/article/10.26599/NR.2025.94907575',
    'https://www.sciopen.com/journal/1998-0124']) assert.equal(isSciOpenArticleUrl(url), false);
});

test('source-backed fixture integrity and credential-free sanitation', () => {
  for (const f of [nr, nre]) {
    assert.equal(createHash('sha256').update(f.html).digest('hex'), f.provenance.fixtureSha256);
    assert.equal(f.provenance.captureMode, 'public-rendered-dom-selected-blocks');
    assert.doesNotMatch(f.html, /<script\b|\son\w+=|OSSAccessKeyId|security-token|Signature=|Expires=/i);
    assert.ok(f.provenance.retained.length);
  }
});

test('Nano Research exact metadata, ordered authors and source hierarchy', () => {
  const p = parseSciOpenPage(nr.html, nr.url);
  try {
    assert.equal(p.metadata.doi, '10.26599/NR.2025.94907575');
    assert.equal(p.metadata.title, 'Se concentration-dependent evolution of atomic structure and Rashba splitting in monolayer AgSexTe1−x');
    assert.equal(p.metadata.journal, 'Nano Research');
    assert.equal(p.metadata.publisher, '清华大学出版社');
    assert.deepEqual(p.metadata.authors, ['Gefei Niu', 'Xi Geng', 'Jianchen Lu', 'Shicheng Li', 'Yuhang Yang', 'Lei Gao', 'Jinming Cai']);
    assert.equal(p.metadata.onlineDate, '2025/7/25');
    assert.equal(p.metadata.publicationDate, '2025/8/1');
    assert.equal(p.metadata.affiliations.length, 7);
    assert.deepEqual(p.sections.map(s => [s.level, s.title]), [[2,'Abstract'],[2,'1 Introduction'],[2,'2 Experimental'],
      [3,'2.2 Sample characterization'],[3,'2.3 Theoretical calculation'],[2,'3 Results and discussion'],[2,'4 Conclusions'],
      [2,'Electronic Supplementary Material'],[2,'Data availability']]);
    assert.deepEqual(p.citations.slice(0,3), [[1,2,3,4,5,6],[7,8,9],[25]]);
    assert.equal(p.references.length, 32);
    assert.deepEqual(p.formulas.map(f => [f.id,f.display]), [['M1',false]]);
    assert.deepEqual(p.figures.map(f => f.id), ['Figure1']);
    assert.match(p.figures[0].captionHtml, /Scanning parameter:/);
    assert.match(p.figures[0].captionHtml, /−0.01 V/);
    assert.deepEqual(p.supplementary, ['7575_ESM.pdf (909.4 KB)']);
  } finally { p.dom.window.close(); }
});

test('Defuddle replay preserves math, scientific powers, caption, citation ranges and resource fallbacks', async () => {
  const r = await clipSciOpenExperimental(nr);
  assert.match(r.markdown, /\$\\Delta = \\frac\{\\left\(2 E\\right\)_\{0\}\}\{k_\{0\}\}\$/);
  assert.match(r.markdown, /1\.0 × \$10\^\{-10\}\$ mbar/);
  assert.match(r.markdown, /AgSe\$_\{x\}\$Te\$_\{1−x\}\$/);
  assert.match(r.markdown, /\$Δ_\{α\}\$/);
  assert.match(r.markdown, /\$Δ_\{β\}\$/);
  assert.match(r.markdown, /materials \[\^1\]\[\^2\]\[\^3\]\[\^4\]\[\^5\]\[\^6\]/);
  for (const math of r.markdown.matchAll(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g))
    assert.doesNotMatch(math[0], /\[\^\d+\]/);
  assert.match(r.markdown, /\[\^25\]: Horcas/);
  assert.match(r.markdown, /https:\/\/doi.org\/10\.1063\/1\.2432410/);
  assert.match(r.markdown, /Fig\. 1\(a\)/);
  assert.doesNotMatch(r.markdown, /\]\(#Figure1\)/);
  assert.match(r.markdown, /view image on SciOpen/);
  assert.match(r.markdown, /Scheme, morphology, and formation energy/);
  assert.match(r.markdown, /download on article page/);
  assert.match(r.markdown, /## Data availability/);
  assert.doesNotMatch(r.markdown, /SCIOPEN|MathJax|<math|showImage|enhanceDownload/);
  for (const validate of [validateMathDelimiters, validateRawHtml, validateCrossReferences, validateMarkdownStructure])
    assert.equal(validate(r.markdown, {citationStyle:'markdown'}).valid, true);
});

test('related Nano Research Energy shares SciOpen family and retains numbered display formula', async () => {
  const r = await clipSciOpenExperimental(nre);
  assert.equal(r.metadata.journal, 'Nano Research Energy');
  assert.equal(r.metadata.authors.length, 11);
  assert.deepEqual(r.formulas.map(f => [f.id,f.display,f.label]), [['E1',true,'(1)']]);
  assert.match(r.markdown, /\$\$\n\\delta = \\frac\{L\}\{R \\cdot S\}\n\$\$/);
  assert.match(r.markdown, /Equation \(1\)/);
  assert.match(r.markdown, /where \*L\*, \*R\* and \*S\*/);
  assert.match(r.markdown, /Eq\. \(1\)/);
});

test('A-B-A and concurrent replay are deterministic without article DOM/global leakage', async () => {
  const a = await clipSciOpenExperimental(nr);
  await clipSciOpenExperimental(nre);
  const c = await clipSciOpenExperimental(nr);
  assert.equal(a.markdown, c.markdown);
  const concurrent = await Promise.all([clipSciOpenExperimental(nr),clipSciOpenExperimental(nre)]);
  assert.equal(concurrent[0].markdown, a.markdown);
});

test('original MathML survives a MathJax block wrapper during HTML reparsing', async () => {
  // Serialization probe around source-backed MathML, not a new article fixture.
  const math = nre.html.match(/<disp-formula\b[^>]*>([\s\S]*?)<\/disp-formula>/)[1];
  const original = math.match(/<math\b[\s\S]*?<\/math>/)[0];
  const wrapped = nre.html.replace(original,
    `<div class="MathJax">visual duplicate</div><script type="math/mml">${original}</script>`);
  const result = await clipSciOpenExperimental({ html: wrapped, url: nre.url, sourceScope: 'excerpt' });
  assert.equal(result.markdown, (await clipSciOpenExperimental(nre)).markdown);
});

test('missing dynamic body, mismatched DOI and unresolved references fail closed', () => {
  const dom = new JSDOM(nr.html);
  dom.window.document.querySelector('#insert_content_one').replaceChildren();
  assert.throws(() => parseSciOpenPage(dom.serialize(), nr.url), /public main text is missing/);
  dom.window.close();
  assert.throws(() => parseSciOpenPage(nr.html.replace('content="10.26599/NR.2025.94907575"','content="10.26599/NR.2025.00000000"'),nr.url), /identity mismatch/);
  assert.throws(() => parseSciOpenPage(nr.html.replace('rid="b25"','rid="missing"'),nr.url), /reference/);
});

test('HTML tables are explicitly unverified, never silently dropped or fabricated', () => {
  // Synthetic blocker probe, not claimed as real SciOpen table evidence.
  assert.equal(nr.provenance.fullPageObservations.tables, 0);
  assert.equal(nre.provenance.fullPageObservations.tables, 0);
  assert.throws(() => parseSciOpenPage(nr.html.replace('<div id="insert_content_one">',
    '<div id="insert_content_one"><table><tr><td>synthetic</td></tr></table>'),nr.url), /table layout has no admitted source-backed fixture/);
});

test('article admission rejects observed partial-loading topology, not just an empty body', () => {
  const mutate = action => {
    const dom = new JSDOM(nr.html); action(dom.window.document);
    const html = dom.serialize(); dom.window.close(); return html;
  };
  for (const [html, reason] of [
    [mutate(d => d.querySelector('#insert_content_one').innerHTML = '<p>Loading</p>'), /not substantively/],
    [mutate(d => d.querySelector('#s01').remove()), /opening\/closing/],
    [mutate(d => d.querySelector('#s04').remove()), /opening\/closing/],
    [mutate(d => d.querySelector('#s02-02 p').remove()), /section 2.2 is unhydrated/],
    [mutate(d => d.querySelector('#title_-12').remove()), /bibliography is unhydrated/],
    [mutate(d => d.body.append(d.querySelector('#v4_art_main_center').cloneNode(true))), /Ambiguous/],
  ]) assert.throws(() => parseArticle(html, nr.url), reason);
  assert.throws(() => parseArticle(nre.html, nre.url), /opening\/closing/);
  assert.throws(() => parseSciOpenPage(nr.html.replace('content="Nano Research"', 'content="Friction"'), nr.url), /outside the observed experiment/);
});

test('NRE transport truncation diagnosis and source-backed missing-range rejection are deterministic', async () => {
  const broken = await fixture('nre-truncated');
  const p = broken.provenance;
  assert.equal(createHash('sha256').update(broken.html).digest('hex'), p.fixtureSha256);
  assert.deepEqual(p.sourceEvidence.serializedReferenceIds, [1,2,3,4,5]);
  assert.deepEqual(p.sourceEvidence.reparsedReferenceIds, ['r_b1','r_b2','r_b3','r_b4','r_b5']);
  assert.equal(p.sourceEvidence.browserReferences, 52);
  assert.equal(p.sourceEvidence.serializedCharacters, 200000 + '[Truncated]'.length);
  assert.doesNotMatch(broken.html, /Signature=|OSSAccessKeyId|security-token|<script\b|\son\w+=/i);
  for (let i = 0; i < 2; i++) {
    await assert.rejects(() => clipSciOpenExperimental(broken), /Invalid SciOpen citation range/);
    await assert.rejects(() => clipSciOpenExperimental({ ...broken, html: broken.html + '[Truncated]' }), /acquisition is truncated/);
  }
});

test('bibliography source scope, source numbering, unresolved targets and unsupported modes fail closed', async () => {
  const dom = new JSDOM(nr.html);
  const d = dom.window.document;
  d.body.insertAdjacentHTML('beforeend', '<div class="v4-art-reference-item">synthetic outside-root copy</div>');
  const p = parseSciOpenPage(dom.serialize(), nr.url);
  assert.equal(p.references.length, 32); p.dom.window.close();
  d.querySelector('#r_b2').textContent = '[3]';
  assert.throws(() => parseSciOpenPage(dom.serialize(), nr.url), /Malformed/);
  dom.window.close();
  assert.throws(() => parseSciOpenPage(nr.html.replace('rid="b6"', 'rid="b0"'), nr.url), /Invalid.*range/);
  assert.throws(() => parseArticle(nr.html.replace('rid="Figure1"', 'rid="absent"'), nr.url), /Unresolved.*target/);
  for (const citationStyle of ['links', 'quarto'])
    await assert.rejects(() => clipSciOpenExperimental({ ...nr, citationStyle }), /markdown only/);
  const result = await clipSciOpenExperimental(nr);
  assert.equal(result.admission.sourceScope, 'excerpt');
  assert.equal(result.admission.targetsChecked, false);
  assert.match(result.admission.completeness, /not established/);
  const visit = value => {
    if (!value || typeof value !== 'object') return;
    assert.ok([Object.prototype, Array.prototype].includes(Object.getPrototypeOf(value)), 'result contains plain data');
    for (const child of Object.values(value)) visit(child);
  };
  visit(result);
  assert.ok(!('dom' in result) && !('document' in result));
});
