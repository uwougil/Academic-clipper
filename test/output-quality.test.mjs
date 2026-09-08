import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { clipNature, writePaper } from '../src/clip.mjs';
import { normalizeAnchorMarkers, normalizeCitations } from '../src/normalizers/citations.mjs';
import { semanticMarker } from '../src/normalizers/markers.mjs';
import { normalizeMath } from '../src/normalizers/math.mjs';
import { assertValidMathDelimiters, validateMathDelimiters } from '../src/validators/math-delimiters.mjs';
import { validateMarkdownStructure } from '../src/validators/markdown-structure.mjs';
import { validateRawHtml } from '../src/validators/html-audit.mjs';
import { validateCrossReferences } from '../src/validators/cross-references.mjs';

const fixturePath = new URL('./fixtures/nature-minimal.html', import.meta.url);
const fixtureHtml = await readFile(fixturePath, 'utf8');
const fixtureUrl = 'https://www.nature.com/articles/s41586-026-10401-1';
const publicResolver = async () => [{ address: '93.184.216.34', family: 4 }];

function assertOutputQuality(markdown, { localFigures = false } = {}) {
  const mathValidation = validateMathDelimiters(markdown);
  assert.equal(mathValidation.valid, true, JSON.stringify(mathValidation.issues));
  assert.equal(mathValidation.scientificFragments.valid, true, JSON.stringify(mathValidation.scientificFragments.issues));
  assert.equal(validateMarkdownStructure(markdown).valid, true);
  const rawHtmlValidation = validateRawHtml(markdown, { allowHtmlAnchors: false });
  assert.equal(rawHtmlValidation.valid, true, JSON.stringify(rawHtmlValidation.violations));
  const crossReferenceValidation = validateCrossReferences(markdown);
  assert.equal(crossReferenceValidation.valid, true, JSON.stringify(crossReferenceValidation.issues));
  assert.ok(mathValidation.inlineMathCount > 0);
  assert.ok(mathValidation.displayMathCount > 0);
  assert.doesNotMatch(markdown, /<sub\b|<sup\b|<i\b/);
  assert.doesNotMatch(markdown, /^## (?:Figure|Extended Data Figure)\b/gm);
  assert.doesNotMatch(markdown, /\*\*Figure \d+\.\*\*[^\n]+\*\*$/);
  assert.doesNotMatch(markdown, /\$\$\s*\n\s*111\s*\n\s*\$\$\s*-strained/);
  assert.equal((markdown.match(/^## References\s*$/gm) || []).length, 1);
  assert.equal((markdown.match(/^\[\^\d+\]:/gm) || []).length, 3);
  assert.equal((markdown.match(/<a id="ref-\d+"><\/a>/g) || []).length, 0);
  assert.equal((markdown.match(/\]\(#ref-\d+\)/g) || []).length, 0);
  assert.equal((markdown.match(/<a id="(?:figure|table|equation|extended-data)-[^"]+"><\/a>/g) || []).length, 0);
  assert.equal((markdown.match(/\]\(#(?:figure|table|equation|extended-data)-[^)]+\)/g) || []).length, 0);
  if (localFigures) {
    assert.match(markdown, /!\[Figure 1\]\(figures\/fig1\.png\)/);
    assert.match(markdown, /!\[Extended Data Figure 3\]\(figures\/fig2\.png\)/);
  }
  assert.doesNotMatch(markdown, /!\[[^\]]{40,}\]/);
}

test('math delimiter validator accepts code, escapes, URLs, inline and display math', () => {
  const valid = [
    '$a+b$',
    '$$a+b$$',
    '\\$100',
    '`const x = "$"`',
    '~~~\ncode with $ and $$\n~~~',
    '[price](https://example.org/$100)',
    '$$\\begin{array}{c}a_i \\\\ b_j\\end{array}$$',
  ].join('\n');
  assertValidMathDelimiters(valid);
  assert.equal(validateMathDelimiters(valid).issues.length, 0);
});

test('math delimiter validator rejects malformed and leaked semantic markup', () => {
  const cases = [
    ['$unclosed', 'unclosed-inline-math'],
    ['$$unclosed', 'unclosed-display-math'],
    ['foo $A$$ bar $', 'inline-display-switch'],
    ['$$a$b$$', 'single-dollar-in-display'],
    ['\\(x\\)', 'legacy-math-delimiter'],
    ['ACADEMICCLIPPERINLINEMATH0X', 'semantic-marker-leak'],
    ['**M**$_{s}$', 'scientific-boldThenSubscript'],
    ['*λ*$^{2}$', 'scientific-italicThenSuperscript'],
    ['$\\{-{6}_{001}^{5}\\Vert {6}_{001}^{1}\\\\}$', 'malformed-tex-escape'],
  ];
  for (const [markdown, type] of cases) {
    const validation = validateMathDelimiters(markdown);
    assert.equal(validation.valid, false, markdown);
    assert.ok(validation.issues.some((issue) => issue.type === type), `${markdown}: ${JSON.stringify(validation.issues)}`);
    assert.throws(() => assertValidMathDelimiters(markdown), /Math delimiter validation failed/);
  }
});

test('Markdown structure validator accepts footnote references and legacy link references explicitly', () => {
  const footnotes = '## References\n\n[^1]: First\n\n[^2]: Second';
  assert.equal(validateMarkdownStructure(footnotes).valid, true);
  const valid = '## Tables\n\n- Table one <a id="table-1"></a>\n\n## References\n\n1. First <a id="ref-1"></a>\n\n2. Second <a id="ref-2"></a>';
  assert.equal(validateMarkdownStructure(valid, { citationStyle: 'links' }).valid, true);
  const broken = '## References\n\n<a id="ref-1"></a>\n1. First';
  assert.equal(validateMarkdownStructure(broken, { citationStyle: 'links' }).valid, false);
});

test('citation normalization leaves unrelated user footnotes untouched', async () => {
  assert.equal(normalizeCitations('A note[^1].', [], { style: 'markdown' }), 'A note[^1].');
  assert.equal(normalizeMath('A note[^1].'), 'A note[^1].');
  const marker = semanticMarker('CITATION', 0);
  const markdown = normalizeCitations(`${marker} and ${marker}`, [{ marker, numbers: [1, 2] }], {
    style: 'markdown',
  });
  assert.equal(markdown, '[^1][^2] and [^1][^2]');
  assert.equal((markdown.match(/\[\^1\]/g) || []).length, 2);
});

test('section cross-references use clean Markdown slugs and Quarto identifiers', () => {
  const target = { type: 'section', anchor: 'materials' };
  const marker = semanticMarker('SECTIONANCHOR', target.anchor);
  const source = `${marker}\n\n## Materials\n\n[Materials](#materials)`;
  const markdown = normalizeAnchorMarkers(source, [target], { style: 'markdown' });
  assert.equal(markdown.includes('<a id="section-materials">'), false);
  assert.match(markdown, /## Materials/);
  assert.match(markdown, /\[Materials\]\(#materials\)/);
  const quarto = normalizeAnchorMarkers(source, [target], { style: 'quarto' });
  assert.match(quarto, /## Materials \{#sec-materials\}/);
  assert.match(quarto, /\[Materials\]\(#sec-materials\)/);
});

test('final fixture Markdown passes academic output quality assertions', async () => {
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  assertOutputQuality(result.markdown);
});

test('quarto citation policy emits semantic keys and a reusable BibTeX source', async () => {
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl, citationStyle: 'quarto' });
  assert.match(result.markdown, /bibliography: "references\.bib"/);
  assert.match(result.markdown, /\[@Lovelace; @Turing; @Noether\]/);
  assert.match(result.referencesMarkdown, /^## References\n\n::: \{#refs\}\n:::/);
  assert.doesNotMatch(result.referencesMarkdown, /^\d+\. /m);
  assert.doesNotMatch(result.markdown, /<a id="section-/);
  assert.doesNotMatch(result.markdown, /<a id="ref-/);
  assert.doesNotMatch(result.markdown, /<a id="(?:figure|table|equation)-/);
  assert.match(result.markdown, /!\[Figure 1\]\([^\n]+\)\{#fig-figure-1\}/);
  assert.match(result.markdown, /\{#eq-equation-2\}/);
  assert.match(result.markdown, /\{#tbl-table-1\}/);
  const { referencesBib } = await import('../src/clip.mjs');
  const bib = referencesBib(result.references);
  assert.match(bib, /@misc\{Lovelace,/);
  assert.match(bib, /@misc\{Turing,/);
  const richBib = referencesBib([{
    number: 9,
    citationKey: 'Jungwirth2016',
    doi: '10.1038/nnano.2016.18',
    text: 'Jungwirth, T., Marti, X., Wadley, P. & Wunderlich, J. Antiferromagnetic spintronics. Nat. Nanotechnol. 11, 231–241 (2016).',
  }]);
  assert.match(richBib, /@article\{Jungwirth2016,/);
  assert.match(richBib, /author = \{Jungwirth, T\. and Marti, X\. and Wadley, P\. and Wunderlich, J\}/);
  assert.match(richBib, /title = \{Antiferromagnetic spintronics\}/);
});

test('writer downloads high-quality and duplicate figure URLs with diagnostics', async () => {
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => new Response(`image:${url}`, {
    status: 200,
    headers: { 'content-type': 'image/png' },
  });
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-'));
  try {
    const saved = await writePaper(result, { libraryPath: root, downloadFigures: true, saveDebug: true, resolveHostname: publicResolver });
    assertOutputQuality(saved.markdown, { localFigures: true });
    assert.deepEqual((await readdir(path.join(root, result.articleId, 'figures'))).sort(), ['fig1.png', 'fig2.png']);
    assert.equal(result.debug.figureDownloads.length, 3);
    assert.equal(result.debug.figureDownloads[2].status, 'deduped');
    assert.equal(result.debug.figureDownloads[0].sourceUrl, 'https://example.org/fig1-high.png');
    const debug = JSON.parse(await readFile(path.join(root, result.articleId, 'debug.json'), 'utf8'));
    assert.equal(debug.figureDownloads[0].status, 200);
    assert.equal(debug.figureSummary.localFigures, 3);
    assert.equal(debug.figureSummary.remoteFallbackFigures, 0);
    assert.equal(debug.figureSummary.failedResources, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('writer keeps clipping alive and records failed figure downloads', async () => {
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).endsWith('/fig2.jpg')) return new Response('unavailable', { status: 503 });
    return new Response('image', { status: 200, headers: { 'content-type': 'image/png' } });
  };
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-failure-'));
  try {
    const saved = await writePaper(result, { libraryPath: root, downloadFigures: true, resolveHostname: publicResolver });
    const failed = result.debug.figureDownloads.filter((entry) => entry.status === 503);
    const dedupedFailure = result.debug.figureDownloads.find((entry) => entry.status === 'deduped');
    assert.equal(failed.length, 1);
    assert.equal(failed[0].sourceUrl, 'https://example.org/fig2.jpg');
    assert.match(failed[0].error, /HTTP 503/);
    assert.equal(dedupedFailure.sourceStatus, 503);
    assert.equal(dedupedFailure.fallback, true);
    assert.match(saved.markdown, /!\[Extended Data Figure 1\]\(https:\/\/example\.org\/fig2\.jpg\)/);
    assert.equal(result.debug.figureSummary.localFigures, 1);
    assert.equal(result.debug.figureSummary.remoteFallbackFigures, 2);
    assert.equal(result.debug.figureSummary.failedResources, 1);
    assert.match(result.debug.warnings.join('\n'), /Figure download failed/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('writer rejects non-image and oversized responses with remote fallback', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response('<html>challenge</html>', {
      status: 200,
      headers: { 'content-type': 'text/html', 'content-length': '32' },
    });
  };
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-type-'));
  try {
    const saved = await writePaper(result, { libraryPath: root, downloadFigures: true, resolveHostname: publicResolver });
    assert.equal(calls, 2);
    assert.equal(result.debug.figureSummary.localFigures, 0);
    assert.equal(result.debug.figureSummary.remoteFallbackFigures, 3);
    assert.equal(result.debug.figureSummary.failedResources, 2);
    assert.match(result.debug.warnings.join('\n'), /Unexpected content-type/);
    assert.match(saved.markdown, /!\[Figure 1\]\(https:\/\/example\.org\/fig1-high\.png\)/);
    assert.deepEqual(await readdir(path.join(root, result.articleId, 'figures')), []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('writer enforces image size limit and timeout signal', async () => {
  const originalFetch = globalThis.fetch;
  let sawSignal = false;
  globalThis.fetch = async (_url, options) => {
    sawSignal = options?.signal instanceof AbortSignal;
    return new Response('', {
      status: 200,
      headers: { 'content-type': 'image/png', 'content-length': String(21 * 1024 * 1024) },
    });
  };
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-size-'));
  try {
    await writePaper(result, { libraryPath: root, downloadFigures: true, resolveHostname: publicResolver });
    assert.equal(sawSignal, true);
    assert.match(result.debug.warnings.join('\n'), /exceeds 20971520 byte limit/);
    assert.equal(result.debug.figureSummary.failedResources, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('writer refuses invalid final Markdown before writing index.md', async () => {
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  result.bodyMarkdown += '\n$unclosed';
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-invalid-'));
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response('should not be requested', { status: 200, headers: { 'content-type': 'image/png' } });
  };
  try {
    await assert.rejects(
      () => writePaper(result, { libraryPath: root, downloadFigures: true, saveDebug: true }),
      (error) => error.name === 'MathDelimiterValidationError'
        && error.issues.some((issue) => issue.type === 'inline-math-crosses-line'),
    );
    assert.equal(calls, 0);
    await assert.rejects(access(path.join(root, result.articleId, 'index.md')));
    await assert.rejects(access(path.join(root, result.articleId)));
    assert.equal(result.debug.mathValidation.valid, false);
    assert.equal(result.debug.mathValidation.issues[0].type, 'inline-math-crosses-line');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('raw HTML validator forbids unpermitted tags but accepts code examples and legacy anchors', () => {
  // 1. Default mode rejects any raw HTML tags
  assert.equal(validateRawHtml('<a id="figure-1"></a>', { allowHtmlAnchors: false }).valid, false);
  assert.equal(validateRawHtml('<span>test</span>', { allowHtmlAnchors: false }).valid, false);
  assert.equal(validateRawHtml('<div>content</div>', { allowHtmlAnchors: false }).valid, false);

  // 2. Inline code and fenced code blocks with HTML examples are not flagged
  const codeExamples = [
    'Use `<span>` for styling.',
    'Refer to `<a href="https://example.com">`.',
    'Example:\n```html\n<div>\n  <a href="#test">link</a>\n</div>\n```',
    'Fenced with tildes:\n~~~\n<a onclick="alert(1)">\n~~~',
  ].join('\n\n');
  const codeValidation = validateRawHtml(codeExamples, { allowHtmlAnchors: false });
  assert.equal(codeValidation.valid, true, JSON.stringify(codeValidation.violations));

  // 3. Legacy links mode allows strict compatibility anchors
  const validAnchors = '<a id="figure-1"></a>\n\n1. First <a id="ref-1"></a>\n\n<a id="table-2"></a>';
  assert.equal(validateRawHtml(validAnchors, { allowHtmlAnchors: true }).valid, true);

  // 4. Legacy links mode rejects any arbitrary raw HTML tags or invalid anchors
  assert.equal(validateRawHtml('<a href="https://example.com">link</a>', { allowHtmlAnchors: true }).valid, false);
  assert.equal(validateRawHtml('<a onclick="bad()"></a>', { allowHtmlAnchors: true }).valid, false);
  assert.equal(validateRawHtml('<a id="figure-1" href="foo"></a>', { allowHtmlAnchors: true }).valid, false);
  assert.equal(validateRawHtml('<div>block</div>', { allowHtmlAnchors: true }).valid, false);
  assert.equal(validateRawHtml('<span>text</span>', { allowHtmlAnchors: true }).valid, false);
});

test('cross-reference validator detects dangling links across figures, equations, tables, extended data, and sections', () => {
  const danglingFigures = '[Figure 1](#figure-1)';
  const figVal = validateCrossReferences(danglingFigures);
  assert.equal(figVal.valid, false);
  assert.equal(figVal.issues[0].category, 'figure');
  assert.equal(figVal.issues[0].type, 'dangling-figure-reference');

  const danglingEquations = '[Equation (2)](#equation-2)';
  const eqVal = validateCrossReferences(danglingEquations);
  assert.equal(eqVal.valid, false);
  assert.equal(eqVal.issues[0].category, 'equation');
  assert.equal(eqVal.issues[0].type, 'dangling-equation-reference');

  const danglingTables = '[Table 1](#table-1)';
  const tblVal = validateCrossReferences(danglingTables);
  assert.equal(tblVal.valid, false);
  assert.equal(tblVal.issues[0].category, 'table');
  assert.equal(tblVal.issues[0].type, 'dangling-table-reference');

  const danglingExtendedData = '[Extended Data Fig. 3](#extended-data-figure-3)';
  const extVal = validateCrossReferences(danglingExtendedData);
  assert.equal(extVal.valid, false);
  assert.equal(extVal.issues[0].category, 'extended-data');
  assert.equal(extVal.issues[0].type, 'dangling-extended-data-reference');

  const danglingSections = '[Missing Section](#missing-section)';
  const secVal = validateCrossReferences(danglingSections);
  assert.equal(secVal.valid, false);
  assert.equal(secVal.issues[0].category, 'section');
  assert.equal(secVal.issues[0].type, 'dangling-section-reference');

  // Valid targets: HTML anchors, Quarto identifiers, and heading slugs
  const validDocument = [
    '[Figure 1](#figure-1) with anchor: <a id="figure-1"></a>',
    '[Figure 2](#fig-figure-2) with Quarto id: {#fig-figure-2}',
    '[Equation 1](#eq-equation-1) with Quarto id: {#eq-equation-1}',
    '[Table 1](#tbl-table-1) with Quarto id: {#tbl-table-1}',
    '[Materials](#materials) with heading:\n\n## Materials',
    '`[Not a link](#dangling)` in code',
  ].join('\n\n');
  const validVal = validateCrossReferences(validDocument);
  assert.equal(validVal.valid, true, JSON.stringify(validVal.issues));
});

test('default markdown mode eliminates native HTML anchors and produces zero dangling cross-references', async () => {
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl, citationStyle: 'markdown' });
  assert.equal(validateRawHtml(result.markdown, { allowHtmlAnchors: false }).valid, true);
  assert.equal(validateCrossReferences(result.markdown).valid, true);
  assert.doesNotMatch(result.markdown, /<a id=/);
  assert.doesNotMatch(result.markdown, /\]\(#(?:figure|table|equation|extended-data)-/);
  assert.match(result.markdown, /Paragraph A contains Figure 1, Extended Data Fig\. 3, Table 1 and Equation \(2\)\./);
});

test('quarto dialect properly establishes cross-reference targets and links', async () => {
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl, citationStyle: 'quarto' });
  assert.equal(validateRawHtml(result.markdown, { allowHtmlAnchors: false }).valid, true);
  const crossRefs = validateCrossReferences(result.markdown);
  assert.equal(crossRefs.valid, true, JSON.stringify(crossRefs.issues));
  assert.match(result.markdown, /\[Figure 1\]\(#fig-figure-1\)/);
  assert.match(result.markdown, /\[Extended Data Fig\. 3\]\(#fig-extended-data-figure-3\)/);
  assert.match(result.markdown, /\[Table 1\]\(#tbl-table-1\)/);
  assert.match(result.markdown, /\[Equation \(2\)\]\(#eq-equation-2\)/);
  assert.match(result.markdown, /\{#fig-figure-1\}/);
  assert.match(result.markdown, /\{#fig-extended-data-figure-3\}/);
  assert.match(result.markdown, /\{#tbl-table-1\}/);
  assert.match(result.markdown, /\{#eq-equation-2\}/);
});

test('legacy links compatibility mode preserves valid HTML anchors and links', async () => {
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl, citationStyle: 'links' });
  assert.equal(validateRawHtml(result.markdown, { allowHtmlAnchors: true }).valid, true);
  const crossRefs = validateCrossReferences(result.markdown);
  assert.equal(crossRefs.valid, true, JSON.stringify(crossRefs.issues));
  assert.match(result.markdown, /<a id="figure-1"><\/a>/);
  assert.match(result.markdown, /<a id="extended-data-figure-3"><\/a>/);
  assert.match(result.markdown, /<a id="table-1"><\/a>/);
  assert.match(result.markdown, /<a id="equation-2"><\/a>/);
  assert.match(result.markdown, /\[Figure 1\]\(#figure-1\)/);
  assert.match(result.markdown, /\[Extended Data Fig\. 3\]\(#extended-data-figure-3\)/);
  assert.match(result.markdown, /\[Table 1\]\(#table-1\)/);
  assert.match(result.markdown, /\[Equation \(2\)\]\(#equation-2\)/);
});

test('fenced code masking properly handles varying fence lengths and rejects unmasked HTML', () => {
  // 1. opening ``` / closing ```
  const sameFence = '```html\n<div>inside standard fence</div>\n```';
  assert.equal(validateRawHtml(sameFence, { allowHtmlAnchors: false }).valid, true);

  // 2. opening ``` / closing ```` (closing longer than opening)
  const longerBackticks = '```html\n<div>inside shorter opening</div>\n<a href="https://example.org">link</a>\n````';
  assert.equal(validateRawHtml(longerBackticks, { allowHtmlAnchors: false }).valid, true);

  // 3. opening ~~~ / closing ~~~~ (closing longer than opening)
  const longerTildes = '~~~\n<div class="test">inside tildes</div>\n<a href="#test">link</a>\n~~~~';
  assert.equal(validateRawHtml(longerTildes, { allowHtmlAnchors: false }).valid, true);

  // 4. HTML inside fenced code is not reported, but outside is reported
  const mixed = [
    '```html',
    '<div>inside code</div>',
    '````',
    '',
    '<div>outside code</div>',
  ].join('\n');
  const mixedValidation = validateRawHtml(mixed, { allowHtmlAnchors: false });
  assert.equal(mixedValidation.valid, false);
  assert.equal(mixedValidation.violations.length, 2); // <div> and </div>
  assert.equal(mixedValidation.violations[0].line, 5);
});

test('dangling-link degradation selectively degrades known scholarly targets and preserves unexpected dangling targets for validation', async () => {
  // 1. Known scholarly targets degrade per contract in markdown mode
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl, citationStyle: 'markdown' });
  assert.match(result.markdown, /Paragraph A contains Figure 1, Extended Data Fig\. 3, Table 1 and Equation \(2\)\./);
  assert.equal(validateCrossReferences(result.markdown).valid, true);

  // 2. Unexpected arbitrary dangling links are NOT degraded and trigger validator failure
  result.bodyMarkdown += '\n\nAn unexpected [broken link](#arbitrary-unknown-target).';
  const { renderClipMarkdown } = await import('../src/clip.mjs');
  const renderedWithDangling = renderClipMarkdown(result);
  assert.match(renderedWithDangling, /\[broken link\]\(#arbitrary-unknown-target\)/);
  const validation = validateCrossReferences(renderedWithDangling);
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some((issue) => issue.target === 'arbitrary-unknown-target'));
});
