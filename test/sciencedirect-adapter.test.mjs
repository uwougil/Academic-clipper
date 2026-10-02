import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { isScienceDirectUrl, scienceDirectArticleIdFromUrl, parseScienceDirectPage } from '../src/adapters/sciencedirect.mjs';
import { withDomGlobals } from '../src/dom-runtime.mjs';
import { htmlToMarkdown } from '../src/markdown.mjs';
import { normalizeMath } from '../src/normalizers/math.mjs';
import { normalizeAcademicInline } from '../src/normalizers/academic-inline.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';
import { validateRawHtml } from '../src/validators/html-audit.mjs';
import { validateCrossReferences } from '../src/validators/cross-references.mjs';

const url = 'https://www.sciencedirect.com/science/article/pii/S0927025619301296';
const fixture = await readFile(new URL('./fixtures/sciencedirect/contract.synthetic.html', import.meta.url), 'utf8');
const parse = (html = fixture, source = url) => parseScienceDirectPage(html, source);
const meta = '<meta name="citation_journal_title" content="Computational Materials Science">';
const page = body => `<html><head>${meta}</head><body>${body}</body></html>`;

test('experimental ScienceDirect URL recognition is exact and rejects lookalikes/credentials', () => {
  assert.equal(isScienceDirectUrl(url), true);
  assert.equal(isScienceDirectUrl(url.replace('/pii/', '/abs/pii/')), true);
  assert.equal(scienceDirectArticleIdFromUrl(url), 'S0927025619301296');
  for (const value of [url.replace('https:', 'http:'), url.replace('www.', ''), url + '/extra',
    url.replace('www.sciencedirect.com', 'www.sciencedirect.com.evil.test'),
    url.replace('https://', 'https://user:password@'), url.replace('.com/', '.com:4433/'), 'invalid']) {
    assert.equal(isScienceDirectUrl(value), false, value);
    assert.equal(scienceDirectArticleIdFromUrl(value), '');
    assert.throws(() => parse(fixture, value), /exact HTTPS/);
  }
});

test('source-backed challenge excerpt is integrity checked and cannot become an article', async () => {
  const bytes = await readFile(new URL('./fixtures/sciencedirect/challenge.excerpt.html', import.meta.url));
  const provenance = JSON.parse(await readFile(new URL('./fixtures/sciencedirect/provenance.json', import.meta.url)));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), provenance.fixtureSha256);
  for (const source of provenance.articleUrls) {
    const result = parse(bytes.toString('utf8'), source);
    assert.equal(result.availability.status, 'blocked');
    assert.equal(result.availability.canRenderExcerpt, false);
    assert.deepEqual(result.metadata, {});
    assert.equal(result.bodyHtml, '');
    assert.equal(result.sections.length + result.figures.length + result.references.length, 0);
    assert.ok(result.debug.warnings.some(w => w.startsWith('ACCESS_BLOCKED:')));
  }
});

test('SYNTHETIC metadata, authors and affiliation addresses keep ordering without guessing associations', () => {
  const result = parse();
  assert.equal(result.metadata.title, 'Synthetic material test');
  assert.deepEqual(result.metadata.authors, ['Example Scientist', 'Second Scientist']);
  assert.equal(result.metadata.doi, '10.0000/synthetic');
  assert.equal(result.metadata.date, '2020/01/01');
  assert.equal(result.metadata.volume, '1');
  assert.deepEqual(result.metadata.authorInformation.affiliations, [{ id: 'aff1', address: 'Example Institute', authors: '' }]);
  assert.equal(result.availability.status, 'body-present');
  assert.equal(result.availability.fullTextVerified, false);
  assert.ok(result.debug.warnings.some(w => w.startsWith('EXPERIMENTAL_UNVERIFIED:')));
});

test('SYNTHETIC JSON-LD graph and author DOM fallbacks; malformed metadata never executes', () => {
  const json = { '@graph': [{ '@type': 'ScholarlyArticle', headline: 'JSON title', author: [{ name: 'JSON Author' }], isPartOf: { name: 'Computational Materials Science' } }] };
  const result = parse(`<script type="application/ld+json">${JSON.stringify(json)}</script><div class="Abstracts"><p>Abstract only.</p></div>`);
  assert.equal(result.metadata.title, 'JSON title');
  assert.deepEqual(result.metadata.authors, ['JSON Author']);
  assert.equal(result.availability.status, 'abstract-only');
  const dom = parse(page('<script type="application/ld+json">invalid</script><div class="author-group"><a class="author"><span class="given-name">Test</span> <span class="surname">Author</span><sup>a</sup></a></div>'));
  assert.deepEqual(dom.metadata.authors, ['Test Author']);
});

test('SYNTHETIC identity gate, target restriction, previews, abstract-only and empty JS shells', () => {
  assert.equal(parse(page('<div class="Body"><h2>Empty</h2></div>')).availability.status, 'missing-body');
  assert.equal(parse(page('<script>window.article = {body: "private"};</script>')).bodyHtml, '');
  assert.equal(parse(page('<div class="Abstracts"><p>Abstract</p></div>')).availability.status, 'abstract-only');
  assert.equal(parse(fixture, url.replace('/pii/', '/abs/pii/')).availability.status, 'preview');
  assert.equal(parse(fixture.replace('<div class="Body">', '<div class="article-preview"></div><div class="Body">')).availability.status, 'preview');
  assert.equal(parse(fixture.replace('Computational Materials Science', 'Acta Materialia')).availability.status, 'unsupported-journal');
  assert.equal(parse('<h1>Generic login page</h1>').availability.status, 'missing-identity');
  const wrong = fixture.replace('</head>', '<link rel="canonical" href="https://www.sciencedirect.com/science/article/pii/S0927025620300355"></head>');
  assert.equal(parse(wrong).availability.status, 'identity-mismatch');
  assert.equal(parse(wrong.replace('https://www.sciencedirect.com/science/article/pii/S0927025620300355', 'http://[')).availability.status, 'identity-mismatch');
  assert.equal(parse(page('<h1>Access denied</h1><div class="Body"><p>Cached body</p></div>')).availability.status, 'blocked');
});

test('SYNTHETIC sections, figures/captions and tables are extracted without modal fetches', () => {
  const result = parse();
  assert.deepEqual(result.sections.slice(0, 3).map(n => [n.level, n.title]), [[2, 'Abstract'], [2, '1. Model'], [3, '1.1 Detail']]);
  assert.deepEqual(result.figures.map(n => n.id), ['fig1']);
  assert.equal(result.figures[0].caption, 'Fig. 1. Synthetic full caption with H2O and panel (b).');
  assert.equal(result.figures[0].imageUrl, 'https://ars.els-cdn.com/content/image/synthetic.jpg');
  assert.deepEqual(result.tables[0].rows, [['Symbol', 'Value'], ['x', '1']]);
  assert.equal(result.tables[0].status, 'html');
  assert.equal(result.tables[1].status, 'unavailable');
  assert.ok(result.debug.warnings.some(w => w.startsWith('TABLE_FALLBACK: tbl2')));
  assert.equal(parse(fixture.replace('<th>Symbol</th>', '<th colspan="2">Symbol</th>')).tables[0].status, 'html-complex');
  const absent = parse(page('<div class="Body"><p>Body</p><figure id="fig2"><figcaption>Caption only</figcaption></figure></div>'));
  assert.equal(absent.figures[0].status, 'unavailable');
  assert.ok(absent.debug.warnings.some(w => w.startsWith('FIGURE_UNAVAILABLE:')));
});

test('SYNTHETIC references/citations retain IDs, labels and unavailable/external targets honestly', () => {
  const result = parse();
  assert.equal(result.references.length, 1);
  assert.equal(result.references[0].label, '[1]');
  assert.equal(result.references[0].doiUrl, 'https://doi.org/10.0000/reference');
  assert.deepEqual(result.citations, [{ label: '[1]', target: 'bib1', resolved: true, referenceLabel: '[1]' }]);
  assert.equal(result.internalReferences.find(n => n.target === 'missing').resolved, false);
  assert.equal(result.internalReferences.find(n => n.target === 'fig1').resolved, true);
  assert.equal(result.internalReferences.filter(n => n.target === 'sec1').length, 1);
  assert.match(result.bodyHtml, /S0927025620300355#sec1/);
  assert.ok(result.debug.warnings.some(w => w.startsWith('REFERENCE_UNRESOLVED: missing')));
  const range = parse(fixture.replace('href="#bib1">[1]', 'href="#bib1">[1–3]'));
  assert.equal(range.citations[0].label, '[1–3]'); // No fictional missing definitions.
  assert.equal(range.references.length, 1);
  assert.deepEqual(result.supplementaryLinks, [{ text: 'Supplement 1', url: 'https://ars.els-cdn.com/content/image/synthetic-mmc1.pdf' }]);
  assert.deepEqual(result.dataLinks, [{ text: 'Data record', url: 'https://data.mendeley.com/datasets/synthetic/1' }]);
});

test('SYNTHETIC equations retain TeX row breaks; image/unknown MathML never invent TeX', () => {
  const result = parse();
  assert.equal(result.equations.length, 2);
  assert.equal(result.equations[0].status, 'tex');
  assert.match(result.equations[0].tex, /\\\\\n/);
  assert.equal(result.equations[1].tex, 'x_i');
  const unsupported = parse(page('<div class="Body"><p>Body</p><div class="display-formula" id="eq2"><img src="https://ars.els-cdn.com/equation.gif" alt="x squared"></div><math><mi>x</mi><mo>+</mo><mn>1</mn></math></div>'));
  assert.deepEqual(unsupported.equations.map(n => n.status), ['image-only', 'unsupported-mathml']);
  assert.equal(unsupported.semantic.displayMath.length, 0);
  assert.match(unsupported.bodyHtml, /Equation unavailable/);
  assert.equal(unsupported.debug.warnings.filter(w => w.startsWith('EQUATION_UNSUPPORTED:')).length, 2);
});

test('SYNTHETIC Defuddle conversion seam preserves science and order; no writer/dialect claim', async () => {
  const result = parse();
  const dom = new JSDOM(result.bodyHtml);
  try {
    const markdown = await withDomGlobals(dom, async () => normalizeAcademicInline(normalizeMath(await htmlToMarkdown(result.bodyHtml, url), result.semantic)));
    assert.match(markdown, /H\$_\{2\}\$O/);
    assert.match(markdown, /\$x_i\$/);
    assert.match(markdown, /\\begin\{aligned\}/);
    assert.match(markdown, /\\\\\n/);
    assert.ok(markdown.indexOf('Before equation') < markdown.indexOf('Synthetic full caption'));
    assert.ok(markdown.indexOf('Synthetic full caption') < markdown.indexOf('After figure'));
    assert.match(markdown, /\| Symbol \| Value \|/);
    assert.doesNotMatch(markdown, /ACADEMICCLIPPER|Synthetic unwanted recommendation|Scripts must not execute/);
    assert.equal(validateMathDelimiters(markdown).valid, true);
    assert.equal(validateRawHtml(markdown).valid, true);
    assert.equal(validateCrossReferences(markdown).valid, true);
  } finally { dom.window.close(); }
});

test('SYNTHETIC hostile resource URLs and handlers are removed; parsing is offline/deterministic', () => {
  const hostile = fixture.replace('https://ars.els-cdn.com/content/image/synthetic.jpg', 'http://127.0.0.1/private')
    .replace('<p>After figure.', '<p onclick="alert(1)">After figure.')
    .replace('https://data.mendeley.com/datasets/synthetic/1', 'javascript:alert(1)');
  const first = parse(hostile);
  assert.equal(first.figures[0].imageUrl, '');
  assert.deepEqual(first.dataLinks, []);
  assert.doesNotMatch(first.bodyHtml, /onclick|javascript:|127\.0\.0\.1|<script/);
  // JSDOM has no scripts/resource loading; adapter contains no transport seam.
  parse(page('<div class="Abstracts"><p>Different input</p></div>'));
  assert.deepEqual(parse(hostile), first);
});
