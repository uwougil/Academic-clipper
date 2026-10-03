import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';
import { validateRawHtml } from '../src/validators/html-audit.mjs';
import { validateCrossReferences } from '../src/validators/cross-references.mjs';
import { convertIopPage, extractIopFigures, extractIopMath, inspectIopPage, iopArticleIdentity, parseIopPage } from '../src/adapters/iop.mjs';

const synthetic = await readFile(new URL('./fixtures/iop/synthetic-head.html', import.meta.url), 'utf8');
const url = 'https://iopscience.iop.org/article/10.1088/2053-1583/synthetic';

test('publisher-local selected excerpt integrity is deterministic across LF/CRLF checkout', async () => {
  const manifest = JSON.parse(await readFile(new URL('./fixtures/iop/excerpt-integrity.json', import.meta.url), 'utf8'));
  for (const [file, expected] of Object.entries(manifest.sha256)) {
    const html = await readFile(new URL(`./fixtures/iop/${file}`, import.meta.url), 'utf8');
    assert.equal(createHash('sha256').update(html.replaceAll('\r\n', '\n')).digest('hex'), expected, file);
  }
});

test('source figure converts to one remote image and one complete semantic caption without toolbar text', async () => {
  const html = await readFile(new URL('./fixtures/iop/aeaa68-figure.excerpt.html', import.meta.url), 'utf8');
  const result = await convertIopPage(html, 'https://iopscience.iop.org/article/10.1088/2053-1583/aeaa68');
  assert.equal((result.markdown.match(/!\[/g) || []).length, 1);
  assert.equal((result.markdown.match(/Lattice thermal conductivity/g) || []).length, 1);
  assert.ok(result.markdown.includes('tdmaeaa68f3_hr.jpg'));
  assert.ok(result.markdown.includes('$\\kappa$'));
  assert.doesNotMatch(result.markdown, /Standard image|High-resolution image|IOPSEMANTICTOKEN|<figure/);
  assert.equal(validateMathDelimiters(result.markdown).valid, true);
  assert.equal(validateRawHtml(result.markdown).valid, true);
});

test('real subscription panel cannot become an accessible paper even with fulltext metadata or a derived body', async () => {
  const preview = await readFile(new URL('./fixtures/iop/025001-preview.excerpt.html', import.meta.url), 'utf8');
  const articleUrl = 'https://iopscience.iop.org/article/10.1088/2053-1583/1/2/025001';
  assert.equal(inspectIopPage(preview, articleUrl).metadata.title, 'Isolation and characterization of few-layer black phosphorus');
  assert.throws(() => parseIopPage(preview, articleUrl), { code: 'IOP_DOM_UNVERIFIED' });
  const derived = preview.replace('</body>', '<div class="wd-jnl-art-full-text" itemprop="articleBody"><p>Derived access-boundary fault</p></div></body>');
  await assert.rejects(() => convertIopPage(derived, articleUrl), { code: 'IOP_DOM_UNVERIFIED' });
});

test('source scientific units and derived section link pass existing validators', async () => {
  const seed = await readFile(new URL('./fixtures/iop/aeaa68-math.excerpt.html', import.meta.url), 'utf8');
  const units = await readFile(new URL('./fixtures/iop/aeaa68-units.excerpt.html', import.meta.url), 'utf8');
  const crossrefs = await readFile(new URL('./fixtures/iop/aeaa68-crossrefs.excerpt.html', import.meta.url), 'utf8');
  // Source anchor observed independently; the test harness composes these blocks.
  const anchor = '<p><a class="secref" href="#tdmaeaa68s2">2</a></p>';
  const html = seed.replace(/<\/div>\r?\n<\/body>/, `${units}${crossrefs}${anchor}</div>\n</body>`);
  const result = await convertIopPage(html, 'https://iopscience.iop.org/article/10.1088/2053-1583/aeaa68');
  assert.ok(result.markdown.includes('W\u2009$\\mathrm{m}^{-1}$\u2009$\\mathrm{K}^{-1}$'));
  assert.ok(result.markdown.includes('$m = 1.00\\pm0.02$'));
  assert.ok(result.markdown.includes('[2](#2-computational-details)'));
  for (const validate of [validateMathDelimiters, validateRawHtml, validateCrossReferences]) {
    const validation = validate(result.markdown);
    assert.equal(validation.valid, true, JSON.stringify(validation));
  }
});

test('source range 1–3 expands all available references and image alt retains original math', async () => {
  const seed = await readFile(new URL('./fixtures/iop/aeaa68-math.excerpt.html', import.meta.url), 'utf8');
  const excerpt = await readFile(new URL('./fixtures/iop/aeaa68-citations.excerpt.html', import.meta.url), 'utf8');
  const html = seed.replace(/<\/div>\r?\n<\/body>/, `${excerpt}</div>\n</body>`);
  const result = await convertIopPage(html, 'https://iopscience.iop.org/article/10.1088/2053-1583/aeaa68');
  assert.ok(result.markdown.includes('[^1][^2][^3]'));
  assert.ok(result.markdown.includes('$\\mathrm{MoS}_2$'));
  assert.deepEqual(result.warnings.map(w => w.target), ['#tdmaeaa68bib4', '#tdmaeaa68bib5']);
  assert.equal((result.markdown.match(/Bertolazzi S/g) || []).length, 1);
  assert.doesNotMatch(result.markdown, /tdmaeaa68ieqn517\.gif/);
  const incomplete = html.replace(/<li data-reference="" id="tdmaeaa68bib2"[\s\S]*?<\/li>/, '');
  const partial = await convertIopPage(incomplete, result.metadata.url);
  assert.ok(partial.warnings.some(w => w.code === 'IOP_CITATION_RANGE_INCOMPLETE'));
  assert.ok(!partial.markdown.includes('[^2]'));
});

test('derived malformed table and duplicate reference faults fail closed', async () => {
  const table = await readFile(new URL('./fixtures/iop/aeaa6b-table.excerpt.html', import.meta.url), 'utf8');
  const articleUrl = 'https://iopscience.iop.org/article/10.1088/2053-1583/aeaa6b';
  await assert.rejects(() => convertIopPage(table.replace('<th scope="col">', '<th scope="col" colspan="2">'), articleUrl), { code: 'IOP_TABLE_UNSUPPORTED' });
  const refs = await readFile(new URL('./fixtures/iop/aeaa6b-references.excerpt.html', import.meta.url), 'utf8');
  assert.throws(() => parseIopPage(table.replace('</body>', `${refs}${refs}</body>`), articleUrl), { code: 'IOP_REFERENCE_INVALID' });
});

test('source-backed paragraph preserves vectors, equation reference text and external data DOI', async () => {
  const seed = await readFile(new URL('./fixtures/iop/aeaa68-math.excerpt.html', import.meta.url), 'utf8');
  const excerpt = await readFile(new URL('./fixtures/iop/aeaa68-crossrefs.excerpt.html', import.meta.url), 'utf8');
  const html = seed.replace('</div>\n</body>', `${excerpt}</div>\n</body>`).replace('</div>\r\n</body>', `${excerpt}</div>\r\n</body>`);
  const result = await convertIopPage(html, 'https://iopscience.iop.org/article/10.1088/2053-1583/aeaa68');
  assert.match(result.markdown, /\$\\boldsymbol\{V\}_\\alpha = \(V_\\alpha\^x, V_\\alpha\^y\)\$/);
  assert.match(result.markdown, /Projecting equation \(3\) then gives/);
  assert.match(result.markdown, /\$\$\n\\begin\{align\}/);
  assert.match(result.markdown, /10\.5281\/zenodo\.19881818/);
  assert.doesNotMatch(result.markdown, /\]\(#tdmaeaa68eqn3\)/);
  assert.deepEqual(result.sections.map(s => s.id), ['tdmaeaa68s1', 'tdmaeaa68s2', 'tdmaeaa68s6']);
  assert.equal(result.warnings[0].target, '#tdmaeaa68bib88');
});

test('loaded publisher references resolve table citations and preserve source indices and scientific subscript', async () => {
  const table = await readFile(new URL('./fixtures/iop/aeaa6b-table.excerpt.html', import.meta.url), 'utf8');
  const references = await readFile(new URL('./fixtures/iop/aeaa6b-references.excerpt.html', import.meta.url), 'utf8');
  const result = await convertIopPage(table.replace('</body>', `${references}</body>`), 'https://iopscience.iop.org/article/10.1088/2053-1583/aeaa6b');
  assert.deepEqual(result.warnings, []);
  assert.deepEqual(result.references.map(r => r.number), [11, 40, 41]);
  assert.ok(result.markdown.includes('[[^40], [^41]]'));
  assert.match(result.markdown, /\[\^11\]: Li X/);
  assert.ok(result.markdown.includes('$\\mathrm{SiO}_{2}$'));
  assert.match(result.markdown, /https:\/\/doi.org\/10\.1038\/srep43886/);
  assert.doesNotMatch(result.markdown, /IOPSEMANTICTOKEN|<sub|fnref-/);
});

test('source-backed Table 2 converts native rows, source units and unresolved citations honestly', async () => {
  const html = await readFile(new URL('./fixtures/iop/aeaa6b-table.excerpt.html', import.meta.url), 'utf8');
  const result = await convertIopPage(html, 'https://iopscience.iop.org/article/10.1088/2053-1583/aeaa6b');
  assert.match(result.markdown, /## 4\. Discussion and conclusions/);
  assert.match(result.markdown, /\|.*Raman thermometry.*Electrical thermometry.*Optomechanics.*\|/);
  assert.match(result.markdown, /50\$-\$100 K/);
  assert.match(result.markdown, /\$\\lt 10\$ K/);
  assert.match(result.markdown, /Sample preparation \| Easy \| Difficult \| Easy/);
  assert.equal(result.warnings.filter(w => w.code === 'IOP_REFERENCE_UNAVAILABLE').length, 3);
  assert.match(result.markdown, /aeaa6b#tdmaeaa6bbib40/);
  assert.match(result.markdown, /\[Supplementary data\]\(https:\/\/iopscience\.iop\.org\/article\/10\.1088\/2053-1583\/aeaa6b\/data\)/);
  assert.equal(result.fullTextVerified, false);
  assert.equal(result.sections[0].id, 'tdmaeaa6bs4');
  assert.deepEqual(await convertIopPage(html, result.metadata.url), result);
  const gated = html.replace('</body>', '<div class="wd-jnl-art-turn-away-panel">Subscription required</div></body>');
  assert.throws(() => parseIopPage(gated, result.metadata.url), { code: 'IOP_DOM_UNVERIFIED' });
});

test('source-backed Figure 3 retains complete caption TeX, units and both image variants', async () => {
  const html = await readFile(new URL('./fixtures/iop/aeaa68-figure.excerpt.html', import.meta.url), 'utf8');
  const articleUrl = 'https://iopscience.iop.org/article/10.1088/2053-1583/aeaa68';
  const result = await extractIopFigures(html, articleUrl);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.figures.length, 1);
  const figure = result.figures[0];
  assert.equal(figure.id, 'tdmaeaa68f3');
  assert.equal(figure.captionMarkdown, '**Figure 3.** Lattice thermal conductivity $\\kappa$ at 300 K calculated via phoebe as a function of the average mass $\\left \\lt M\\right \\gt$ of each pristine heterobilayer.');
  assert.match(figure.standardUrl, /tdmaeaa68f3_lr\.jpg$/);
  assert.match(figure.highResolutionUrl, /tdmaeaa68f3_hr\.jpg$/);
  const hostile = html.replaceAll('https://content.cld.iop.org/', 'https://content.cld.iop.org.example.com/');
  const rejected = await extractIopFigures(hostile, articleUrl);
  assert.equal(rejected.figures[0].standardUrl, null);
  assert.equal(rejected.figures[0].highResolutionUrl, null);
  assert.deepEqual(rejected.warnings.map(w => w.code), ['IOP_FIGURE_IMAGE_MISSING']);
});

test('browser-source aeaa68 excerpt preserves real identity and publication date', async () => {
  const html = await readFile(new URL('./fixtures/iop/aeaa68-math.excerpt.html', import.meta.url), 'utf8');
  const result = inspectIopPage(html, 'https://iopscience.iop.org/article/10.1088/2053-1583/aeaa68');
  assert.equal(result.metadata.title, 'Tuning magnitude and direction of lattice thermal conductivity in transition metal dichalcogenide heterobilayers');
  assert.deepEqual(result.metadata.authors, ['Elliot Perviz', 'Antonio Cammarata']);
  assert.deepEqual(result.metadata.authorInformation.map(author => author.orcid), [
    'https://orcid.org/0000-0002-0348-8369', 'https://orcid.org/0000-0002-5691-0682',
  ]);
  for (const author of result.metadata.authorInformation) {
    assert.deepEqual(author.institutions, ['Department of Control Engineering, Faculty of Electrical Engineering, Czech Technical University in Prague, Technicka 2, 16627 Prague 6, Czech Republic']);
  }
  assert.equal(result.metadata.date, '2026/10/01');
  assert.equal(result.metadata.doi, '10.1088/2053-1583/aeaa68');
  assert.equal(result.metadata.journal, '2D Materials');
  assert.equal(result.fullTextVerified, false);
});

test('browser-source equation keeps original TeX and number, not image or rendered MathJax text', async () => {
  const html = await readFile(new URL('./fixtures/iop/aeaa68-math.excerpt.html', import.meta.url), 'utf8');
  const { equations, warnings } = extractIopMath(html, 'https://iopscience.iop.org/article/10.1088/2053-1583/aeaa68');
  assert.deepEqual(warnings, []);
  assert.equal(equations.length, 1);
  assert.deepEqual(equations[0], {
    id: 'tdmaeaa68eqn1', display: true, source: 'script-math-tex',
    tex: '\\begin{align} \\kappa^{ij} & = \\frac{1}{\\mathcal{V}} \\sum_\\lambda \\kappa_\\lambda^{ij} = \\frac{1}{\\mathcal{V}} \\sum_\\lambda C_\\lambda v_\\lambda^i \\Lambda_\\lambda^{j},\\end{align}\n\t\t\t\t\\tag{\n\t\t\t\t1\n\t\t\t\t}',
  });
});

test('IOP identity recognizes modern and legacy 2D Materials paths only', () => {
  for (const doi of ['10.1088/2053-1583/ae2b82', '10.1088/2053-1583/3/3/031012']) {
    const canonical = `https://iopscience.iop.org/article/${doi}`;
    for (const suffix of ['', '/', '/meta', '/fulltext', '?utm_source=example#fig1']) {
      assert.deepEqual(iopArticleIdentity(canonical + suffix), { doi, journal: '2D Materials', url: canonical });
    }
  }
  for (const invalid of [
    'not a URL', url.replace('https:', 'http:'),
    url.replace('iopscience.iop.org', 'iopscience.iop.org.example.com'),
    url.replace('iopscience.iop.org', 'localhost'),
    url.replace('iopscience.iop.org', 'iopscience.iop.org:444'),
    url.replace('iopscience.iop.org', 'user:secret@iopscience.iop.org'),
    url.replace('2053-1583', '1361-648X'),
    url.replace('/article/', '/journal/'), `${url}/pdf`, `${url}/figures/1`,
    url.replace('/synthetic', '/%73ynthetic'), `${url}/unrecognized`,
  ]) assert.equal(iopArticleIdentity(invalid), null, invalid);
});

test('synthetic candidate metadata preserves ordered authors and identifies its unverified status', () => {
  const result = inspectIopPage(synthetic, url);
  assert.deepEqual(result.metadata, {
    doi: '10.1088/2053-1583/synthetic', journal: '2D Materials', url,
    title: 'Synthetic preflight example', authors: ['Example A', 'Example B'],
    date: '2026/10/02', volume: '13', issue: '4',
    authorInformation: null, metadataSource: 'candidate-citation-meta',
  });
  assert.equal(result.status, 'blocked-unverified-dom');
  assert.equal(result.fullTextVerified, false);
  assert.deepEqual(result.warnings.map((warning) => warning.code), ['IOP_DOM_UNVERIFIED']);
  assert.equal(Object.hasOwn(result, 'cleanedHtml'), false);
});

test('metadata alone, a preview, or plausible synthetic body never enables full-text conversion', () => {
  for (const html of [synthetic, '<h1>Access required</h1>',
    synthetic.replace('Synthetic preview, not full text.', '<article><h2>Introduction</h2><p>Invented body</p></article>')]) {
    assert.throws(() => parseIopPage(html, url), (error) => {
      assert.equal(error.code, 'IOP_DOM_UNVERIFIED');
      assert.equal(error.diagnostics.fullTextVerified, false);
      return true;
    });
  }
  assert.equal(inspectIopPage('<h1>Access required</h1>', url).metadata, null);
});

test('preflight rejects conflicting or cross-article identity instead of silently preferring a value', () => {
  for (const html of [
    synthetic.replace('content="10.1088/2053-1583/synthetic"', 'content="10.1088/2053-1583/other"'),
    synthetic.replace('content="2D Materials"', 'content="Other IOP journal"'),
    synthetic.replace('href="https://iopscience.iop.org/article/10.1088/2053-1583/synthetic"', 'href="/article/10.1088/2053-1583/other"'),
    synthetic.replace('</head>', '<meta name="citation_doi" content="10.1088/2053-1583/other"></head>'),
  ]) assert.throws(() => inspectIopPage(html, url), (error) => /IOP_(?:IDENTITY_MISMATCH|METADATA_CONFLICT)/.test(error.code));
  assert.throws(() => inspectIopPage(synthetic, 'https://example.com'), { code: 'IOP_URL_UNSUPPORTED' });
});

test('preflight does not run scripts, load resources, or install DOM globals; repeated results are stable', () => {
  const originalDocument = globalThis.document;
  const html = synthetic.replace('</body>', '<script>globalThis.IOP_SCRIPT_EXECUTED = true</script><img src="https://localhost/private"></body>');
  const first = inspectIopPage(html, url);
  inspectIopPage('<p>Other document</p>', url);
  assert.deepEqual(inspectIopPage(html, url), first);
  assert.equal(globalThis.IOP_SCRIPT_EXECUTED, undefined);
  assert.equal(globalThis.document, originalDocument);
});

test('the Nature production entry point continues to reject IOP URLs', async () => {
  const { clipNature } = await import('../src/clip.mjs');
  await assert.rejects(() => clipNature({ html: synthetic, url }), /nature\.com/);
});
