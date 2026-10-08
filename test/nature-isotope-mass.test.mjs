import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature } from '../src/clip.mjs';
import { parseNaturePage } from '../src/adapters/nature.mjs';
import { normalizeAcademicInline } from '../src/normalizers/academic-inline.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';

const fixtureRoot = new URL('./fixtures/nature-isotope-mass/', import.meta.url);
const provenance = JSON.parse(await readFile(new URL('s41467-023-44030-3.provenance.json', fixtureRoot), 'utf8'));
const bytes = await readFile(new URL(provenance.fixture.path, fixtureRoot));
assert.equal(bytes.length, provenance.fixture.bytes);
assert.equal(createHash('sha256').update(bytes).digest('hex'), provenance.fixture.sha256);
const html = bytes.toString('utf8');
const doms = [];
after(() => { for (const dom of doms) dom.window.close(); });

test('lawful isotope excerpt retains complete source paragraphs, nine creators, rights, figure and reference prefix', () => {
  const dom = new JSDOM(html); doms.push(dom);
  const document = dom.window.document;
  assert.equal(document.querySelector('link[rel="canonical"]').href, provenance.source.url);
  assert.equal(document.querySelector('meta[name="citation_doi"]').content, provenance.source.doi);
  assert.deepEqual([...document.querySelectorAll('meta[name="citation_author"]')].map(node => node.content), provenance.sourceRights.orderedSourceCreators);
  assert.equal(provenance.sourceRights.orderedSourceCreators.length, 9);
  for (const notice of provenance.sourceRights.notices) {
    const retained = document.querySelectorAll(notice.sourceSelector)[notice.sourceParagraphIndex];
    assert.equal(retained.textContent, notice.sourceRawNoticeText);
    assert.equal(retained.querySelector('a').href, 'http://creativecommons.org/licenses/by/4.0/');
  }
  assert.equal(document.querySelector('p.c-footer__legal').textContent, provenance.sourceRights.siteFooterNotice.text);
  assert.equal(document.querySelectorAll('ol.c-article-references > li').length, 26);
  assert.equal(document.querySelector(provenance.figure.selector).textContent, provenance.figure.completeSourceText);
  const roles = [];
  for (const paragraph of provenance.paragraphs) {
    const node = document.querySelector(paragraph.selector);
    assert.equal(node.textContent, paragraph.sourceText);
    assert.deepEqual([...node.querySelectorAll('sup,sub,i,b,.mathjax-tex')].map((node, index) => ({index,tag:node.tagName,text:node.textContent})), paragraph.orderedScientificNodes.map(({html, ...node}) => node));
    for (const attachment of paragraph.attachments) {
      const sup = node.querySelectorAll('sup')[attachment.supIndex];
      assert.equal(sup.textContent, attachment.mass);
      assert.equal(sup.nextSibling.nodeType, 3);
      assert.equal(sup.nextSibling.textContent[0], attachment.element);
      assert.equal(attachment.attachmentDirection, 'following-element');
      assert.equal(attachment.role, 'leading-isotope-mass');
      roles.push([paragraph.id, attachment.mass, attachment.element, attachment.measurement]);
    }
  }
  assert.deepEqual(roles, [
    ['results','3','H',null], ['results','3','H',null], ['caption','3','H',null],
    ['methods','1','H','7.26'], ['methods','13','C','77.16'],
    ['methods','1','H','2.05'], ['methods','13','C','206.26'],
    ['methods','1','H','3.31'], ['methods','13','C','49.00'],
  ]);
  assert.equal(provenance.fixture.repeatBytesEqual, true);
  assert.equal(provenance.fixture.idempotentBytesEqual, true);
  assert.equal(provenance.dependencies.helper.gitBlob, 'e56f140d9756bb83013b9df0716dc650e04d7917');
  assert.doesNotMatch(html, /ACADEMICCLIPPER|data-track|<script(?![^>]*type="application\/ld\+json")/u);
});

// The oracle is a source role, not a chosen TeX spelling: mass precedes its
// following element in ONE expression; a previous measurement is never a base.
function isotopeAtoms(markdown) {
  const atoms = [];
  for (const match of markdown.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)) {
    const tex = match[1].replace(/\s+/gu, '');
    const isotope = tex.match(/^(?:\{\})?\^\{(\d+)\}(?:\\(?:mathrm|text)\{([A-Z][a-z]?)\}|([A-Z][a-z]?))$/u);
    if (isotope) atoms.push({mass:isotope[1], element:isotope[2] || isotope[3], index:match.index, end:match.index+match[0].length});
  }
  return atoms;
}

function sourceContext(markdown, paragraph) {
  const start = markdown.indexOf(paragraph.id === 'results' ? 'In a preliminary screen' : paragraph.id === 'caption' ? 'Relative potencies of PXN' : 'NMR spectra were recorded');
  assert.ok(start >= 0, `${paragraph.id}: original source context`);
  const end = markdown.indexOf(paragraph.id === 'results' ? 'for binding to rat cerebral cortex' : paragraph.id === 'caption' ? 'Relative potencies of PXN and 5MePXN analogs at RDL' : 'The following abbreviations', start);
  assert.ok(end > start, `${paragraph.id}: complete source context boundary`);
  return markdown.slice(start, end);
}

for (const dialect of ['markdown', 'links', 'quarto']) {
  const result = await clipNature({html, url:provenance.source.url, citationStyle:dialect});
  for (const paragraph of provenance.paragraphs) {
    test(`real ${paragraph.id} leading masses attach to following source H/C (${dialect})`, () => {
      const context = sourceContext(result.markdown, paragraph);
      const atoms = isotopeAtoms(context);
      assert.deepEqual(atoms.map(({mass, element}) => [mass, element]), paragraph.attachments.map(({mass, element}) => [mass, element]), `${paragraph.id}: preserve all ordered isotope roles in the final rendered source context: ${context}`);
      if (paragraph.id === 'methods') {
        assert.deepEqual(atoms.map(atom => context.slice(0, atom.index).match(/([\d.]+)(?: ppm)?\s+$/u)?.[1]), paragraph.attachments.map(attachment => attachment.measurement), 'Each source measurement remains a separate preceding value');
        for (const [index, atom] of atoms.entries()) {
          assert.equal(context.slice(atom.end).match(/^\s+NMR/u)?.[0]?.trim(), 'NMR');
          assert.ok(atom.index < atoms[index + 1]?.index || index === atoms.length - 1, 'Source order');
        }
      } else {
        assert.ok(atoms.every(atom => context[atom.index - 1] === '[' && context[atom.end] === ']'), 'Isotope labels retain their source literal bracket edges');
      }
      assert.equal(validateMathDelimiters(context).displayMathCount, 0, 'No source display equation in these isotope contexts');
      assert.deepEqual(result.debug.warnings, ['No equation nodes were detected.']);
      for (const key of ['rawHtmlValidation','markdownStructure','crossReferenceValidation']) assert.equal(result.debug[key].valid, true, key);
    });
  }
  test(`real Methods measurement powers cannot replace leading isotope roles (${dialect})`, () => {
    const context = sourceContext(result.markdown, provenance.paragraphs.find(p => p.id === 'methods'));
    const counterfeit = [...context.matchAll(/\$(\d+(?:\.\d+)?)\^\{(\d+)\}\$\s+([HC])\s+NMR/gu)].map(match => [match[1],match[2],match[3]]);
    assert.deepEqual(counterfeit, [], 'Source numeric measurements are NOT superscript bases; valid TeX syntax does not establish a correct source role');
  });
}

// Explicitly synthetic compatibility matrix. These are not Nature admissions,
// fabricated source isotopes, or expected outputs chosen from the bug behavior.
test('synthetic powers, math, unknown words, primed variables and uncertainty retain accepted boundaries', () => {
  const cases = [
    ['ASCII unit power','cm<sup>-3</sup>',String.raw`$\mathrm{cm}^{-3}$`],
    ['Unicode unit power','cm<sup>−3</sup>',String.raw`$\mathrm{cm}^{−3}$`],
    ['angstrom power','Å<sup>3</sup>',String.raw`$\mathrm{Å}^{3}$`],
    ['numeric exponent','10<sup>37</sup>','$10^{37}$'],
    ['signed numeric exponent','2.5<sup>+2</sup>','$2.5^{+2}$'],
    ['true exponent before H','10<sup>3</sup> H','$10^{3}$ H'],
    ['ordinary styled exponent','<i>x</i><sup>2</sup>','$x^{2}$'],
    ['ASCII prime','<i>x</i><sup>\'</sup>',"$x^{'}$"],
    ['Unicode prime','<i>x</i><sup>′</sup>','$x^{′}$'],
    ['primed uncertainty','<i>x</i><sup>′</sup><sub>±</sub>','$x^{′}_{±}$'],
    ['ordinary chemical subscript','CH<sub>3</sub>','CH$_{3}$'],
    ['unknown word','word<sup>3</sup>','word$^{3}$'],
    ['unknown prefix element','<sup>3</sup>word','$^{3}$word'],
    ['typed mathematical H',String.raw`$H^{3}+2.05^{1}$`,String.raw`$H^{3}+2.05^{1}$`],
    ['typed prefix isotope','${}^{13}\\mathrm{C}$','${}^{13}\\mathrm{C}$'],
    ['existing inline math with unit-looking text',String.raw`$m^{3}+10^{37}$`,String.raw`$m^{3}+10^{37}$`],
    ['existing display math','$$\n2.05^{1}\n$$','$$\n2.05^{1}\n$$'],
    ['escaped dollar',String.raw`\$5 cm<sup>2</sup>`,String.raw`\$5 $\mathrm{cm}^{2}$`],
    ['inline code','`m$^{3}$ 2.05$^{1}$ H`','`m$^{3}$ 2.05$^{1}$ H`'],
    ['tilde code and outside unit','~~~\nm$^{3}$\n~~~\n\ncm<sup>2</sup>','~~~\nm$^{3}$\n~~~\n\n$\\mathrm{cm}^{2}$'],
    ['indented code and outside unit','    m$^{3}$\n\ncm<sup>2</sup>','    m$^{3}$\n\n$\\mathrm{cm}^{2}$'],
    ['math-looking fence with actual code','$$\n~~~ x\n$$\n\n~~~\nm$^{3}$\n~~~\n\ncm<sup>2</sup>','$$\n~~~ x\n$$\n\n~~~\nm$^{3}$\n~~~\n\n$\\mathrm{cm}^{2}$'],
  ];
  for (const [name, input, expected] of cases) {
    const actual = normalizeAcademicInline(input);
    assert.equal(actual, expected, name);
    assert.equal(normalizeAcademicInline(actual), actual, `${name}: repeat determinism`);
  }
  assert.equal(validateMathDelimiters('$2.05^{1}$ H NMR').valid, true, 'A syntactically valid wrong source attachment needs an explicit semantic assertion');
  assert.equal(validateMathDelimiters('word$^{3}$').valid, false, 'Unknown orphan remains an actual failure, not a new recognized isotope');
});

test('synthetic Nature citation SUP, true numeric exponent and code keep their existing roles', async () => {
  const url = 'https://www.nature.com/articles/synthetic-isotope-boundary';
  const synthetic = '<html><body><div class="c-article-body"><p>Power 10<sup>3</sup>H; cite <sup><a data-test="citation-ref" href="#ref-CR1">1</a></sup>H; <code>m$^{3}$ 2.05$^{1}$ H</code>.</p><ol class="c-article-references"><li id="ref-CR1"><p>Alpha, A. Original reference. Journal 1, 1 (2020).</p></li></ol></div></body></html>';
  const page = parseNaturePage(synthetic, url); doms.push(page.dom);
  assert.deepEqual(page.semantic.citations.map(citation => citation.numbers), [[1]]);
  assert.ok(page.semantic.scientificRuns.some(run => run.tex === '10^{3}'));
  for (const dialect of ['markdown','links','quarto']) {
    const result = await clipNature({html:synthetic,url,citationStyle:dialect});
    assert.ok(result.markdown.includes('$10^{3}$'), 'True exponent retains its numeric base');
    assert.ok(result.markdown.includes('`m$^{3}$ 2.05$^{1}$ H`'), 'Code bytes stay opaque');
    assert.deepEqual(result.semantic.citations.map(citation => citation.numbers), [[1]]);
    const citation = dialect === 'markdown' ? '[^1]' : dialect === 'links' ? '[1](#ref-1)' : '[@Alpha2020]';
    assert.ok(result.markdown.includes(citation), 'Citation SUP is not an isotope mass');
    for (const key of ['mathValidation','rawHtmlValidation','markdownStructure','crossReferenceValidation']) assert.equal(result.debug[key].valid, true, key);
  }
});
