import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature } from '../src/clip.mjs';
import { normalizeMath } from '../src/normalizers/math.mjs';
import { normalizeAcademicInline } from '../src/normalizers/academic-inline.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';

const fixtureRoot = new URL('./fixtures/nature-isotope-mass/', import.meta.url);
const provenance = JSON.parse(await readFile(new URL('s41467-023-44030-3.all-leading-masses.provenance.json', fixtureRoot), 'utf8'));
const bytes = await readFile(new URL(provenance.fixture.path, fixtureRoot));
assert.equal(bytes.length, provenance.fixture.bytes);
assert.equal(createHash('sha256').update(bytes).digest('hex'), provenance.fixture.sha256);
const html = new TextDecoder('utf8', {fatal:true}).decode(bytes);
const opened = [];
after(() => { for (const dom of opened) dom.window.close(); });
const needles = {
  'results-p0':'The 5 rings, 8 stereocenters',
  'results-p5-fluorine':'arose via Boger hydrofluorination',
  'results-p6-nmr':'Picrotoxinin undergoes reversible hydrolysis',
  'figure3-caption-p7':'Attempted degradation of 5MePXN',
  'figure5-caption-p15':'Relative potencies of PXN and 5MePXN analogs',
  'results-p20-binding':'Within the rat GABA',
  'methods-p0':'NMR spectra were recorded',
};
function context(markdown, paragraph) {
  const lines = markdown.split('\n').filter(line => line.includes(needles[paragraph.id]));
  assert.equal(lines.length, 1, `${paragraph.id}: exactly one complete original paragraph/caption context`);
  return lines[0];
}
function atoms(text) {
  return [...text.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].flatMap(match => {
    const tex = match[1].replace(/\s+/gu, '');
    const isotope = tex.match(/^(?:\{\})?\^\{(\d+)\}(?:\\(?:mathrm|text)\{([A-Z][a-z]?)\}|([A-Z][a-z]?))$/u);
    return isotope ? [{mass:isotope[1],element:isotope[2]||isotope[3],index:match.index,end:match.index+match[0].length}] : [];
  });
}

test('complete leading-isotope projection retains all 15 actual roles, original context and independent exclusions', () => {
  const dom = new JSDOM(html); opened.push(dom);
  const doc = dom.window.document;
  assert.equal(doc.querySelector('link[rel="canonical"]').href, provenance.source.url);
  assert.equal(doc.querySelector('meta[name="citation_doi"]').content, provenance.source.doi);
  assert.deepEqual([...doc.querySelectorAll('meta[name="citation_author"]')].map(n => n.content), provenance.sourceRights.orderedSourceCreators);
  assert.equal(provenance.sourceRights.orderedSourceCreators.length, 9);
  for (const notice of provenance.sourceRights.notices) {
    const node = doc.querySelectorAll(notice.sourceSelector)[notice.sourceParagraphIndex];
    assert.equal(node.textContent, notice.sourceRawNoticeText);
    assert.deepEqual([...node.querySelectorAll('a')].map(a => ({href:a.getAttribute('href'),text:a.textContent})), notice.sourceLicenseLinks);
  }
  assert.equal(doc.querySelector('p.c-footer__legal').textContent, provenance.sourceRights.siteFooterNotice.text);
  assert.equal(doc.querySelectorAll('ol.c-article-references > li').length, 43);
  for (const figure of provenance.figures) assert.equal(doc.querySelector(figure.selector).textContent, figure.completeSourceText);
  const actual = [];
  for (const p of provenance.paragraphs) {
    const node = doc.querySelector(p.selector);
    assert.equal(node.textContent, p.sourceText);
    assert.deepEqual([...node.querySelectorAll('sup,sub,i,b,.mathjax-tex')].map((n,index) => ({index,tag:n.tagName,text:n.textContent})), p.orderedScientificNodes.map(({html,...record}) => record));
    for (const role of p.attachments) {
      const sup = node.querySelectorAll('sup')[role.supIndex];
      assert.equal(sup.textContent, role.mass);
      assert.equal(sup.querySelector('a'), null);
      assert.equal(sup.nextSibling.nodeType, 3);
      assert.equal(sup.nextSibling.textContent[0], role.element);
      assert.equal(role.attachmentDirection, 'following-element');
      actual.push([p.id,role.mass,role.element,role.measurement]);
    }
  }
  assert.deepEqual(actual, [
    ['results-p0','3','H',null],['results-p0','3','H',null],
    ['results-p5-fluorine','19','F',null],['results-p5-fluorine','19','F',null],
    ['results-p6-nmr','1','H',null],['figure3-caption-p7','1','H',null],
    ['figure5-caption-p15','3','H',null],
    ['results-p20-binding','3','H',null],['results-p20-binding','3','H',null],
    ['methods-p0','1','H','7.26'],['methods-p0','13','C','77.16'],
    ['methods-p0','1','H','2.05'],['methods-p0','13','C','206.26'],
    ['methods-p0','1','H','3.31'],['methods-p0','13','C','49.00'],
  ]);
  const roles = provenance.paragraphs.flatMap(p => p.attachments);
  assert.equal(roles.filter(r => r.originalNineCovered).length, 9);
  assert.equal(roles.filter(r => !r.originalNineCovered).length, 6);
  assert.equal(roles.filter(r => r.cAcceptedAc86Role === 'isolated-leading-mass').length, 11);
  assert.equal(roles.filter(r => r.cAcceptedAc86Role === 'silent-measurement-backbinding').length, 4);
  const excluded = provenance.coverage.excludedNonIsotopeSuperscripts;
  assert.equal(excluded.filter(r => r.role === 'Delta-bond-position-label').length, 2);
  assert.ok(excluded.every(r => r.scope === 'excluded-from-isotope61'));
  assert.equal(provenance.coverage.rawNonCitationSupCount, 26);
  assert.equal(provenance.fixture.repeatBytesEqual, true);
  assert.equal(provenance.fixture.idempotentBytesEqual, true);
});

// Exactly three complete clips of this new final projection. The explicit
// external receipt option saves these same results, never a second clip or a
// committed snapshot. The original nine-role test/source packet is unchanged.
for (const dialect of ['markdown','links','quarto']) {
  const result = await clipNature({html,url:provenance.source.url,citationStyle:dialect});
  if (process.env.NATURE_ISOTOPE_RECEIPT_ROOT) {
    const receiptRoot = process.env.NATURE_ISOTOPE_RECEIPT_ROOT;
    const mathBody = normalizeMath(result.bodyMarkdown, result.semantic);
    const academicBody = normalizeAcademicInline(mathBody);
    const stage = {
      acceptedMain:provenance.dependencies.acceptedMain,dialect,fixture:provenance.fixture,
      result,
      bodyStages:{defuddle:result.bodyMarkdown,math:mathBody,academic:academicBody},
      paragraphs:provenance.paragraphs.map(p => ({id:p.id,context:context(result.markdown,p),sourceRoles:p.attachments})),
    };
    await writeFile(`${receiptRoot}/${dialect}.all-leading-masses.actual-cache.json`, JSON.stringify(stage, (key,value) => value instanceof Map ? {entries:[...value]} : value, 2)+'\n');
    await writeFile(`${receiptRoot}/${dialect}.all-leading-masses.actual.md`, result.markdown);
  }
  for (const p of provenance.paragraphs) {
    test(`all real ${p.id} masses attach to following source element (${dialect})`, t => {
      const rendered = context(result.markdown, p);
      for (const key of ['rawHtmlValidation','markdownStructure','crossReferenceValidation']) assert.equal(result.debug[key].valid, true, `${p.id}/${key}`);
      assert.equal(result.semantic.displayMath.length, 0);
      assert.equal(result.tables.length, 0);
      assert.equal(result.figures.length, 2);
      assert.equal(result.references.length, 43);
      assert.deepEqual(result.debug.warnings, ['No equation nodes were detected.']);
      const found = atoms(rendered);
      t.diagnostic(JSON.stringify({sourceId:p.id,dialect,sourceMasses:p.attachments.map(r=>`${r.mass}${r.element}`),actualAtoms:found.map(r=>`${r.mass}${r.element}`),wholeMathValid:result.debug.mathValidation.valid,wholeMathIssues:result.debug.mathValidation.issues.map(i=>i.type)}));
      assert.deepEqual(found.map(({mass,element})=>[mass,element]), p.attachments.map(({mass,element})=>[mass,element]), `${p.id}: original role and order must survive: ${rendered}`);
      if (p.attachments.every(r => r.bracketed)) assert.ok(found.every(r=>rendered[r.index-1]==='['&&rendered[r.end]===']'), 'Original bracket edges');
      if (p.id === 'methods-p0') {
        assert.deepEqual(found.map(r=>rendered.slice(0,r.index).match(/([\d.]+)(?: ppm)?\s+$/u)?.[1]), p.attachments.map(r=>r.measurement));
        assert.ok(found.every(r=>/^\s+NMR/u.test(rendered.slice(r.end))));
      }
      assert.equal(validateMathDelimiters(rendered).displayMathCount, 0);
    });
  }
  test(`all real Methods measurements remain separate from isotope masses (${dialect})`, () => {
    const p = provenance.paragraphs.find(p=>p.id==='methods-p0'), rendered=context(result.markdown,p);
    const counterfeit = [...rendered.matchAll(/\$(\d+(?:\.\d+)?)\^\{(\d+)\}\$\s+([HC])\s+NMR/gu)].map(m=>[m[1],m[2],m[3]]);
    assert.deepEqual(counterfeit, [], 'Source measurement values cannot become preceding isotope exponent bases, even when every TeX delimiter is valid');
  });
}
