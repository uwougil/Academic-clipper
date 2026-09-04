import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { clipNature, writePaper } from '../src/clip.mjs';
import { assertValidMathDelimiters, validateMathDelimiters } from '../src/validators/math-delimiters.mjs';

const fixturePath = new URL('./fixtures/nature-minimal.html', import.meta.url);
const fixtureHtml = await readFile(fixturePath, 'utf8');
const fixtureUrl = 'https://www.nature.com/articles/s41586-026-10401-1';

function assertOutputQuality(markdown, { localFigures = false } = {}) {
  const mathValidation = validateMathDelimiters(markdown);
  assert.equal(mathValidation.valid, true, JSON.stringify(mathValidation.issues));
  assert.ok(mathValidation.inlineMathCount > 0);
  assert.ok(mathValidation.displayMathCount > 0);
  assert.doesNotMatch(markdown, /<sub\b|<sup\b|<i\b/);
  assert.doesNotMatch(markdown, /^## (?:Figure|Extended Data Figure)\b/gm);
  assert.doesNotMatch(markdown, /\*\*Figure \d+\.\*\*[^\n]+\*\*$/);
  assert.doesNotMatch(markdown, /\$\$\s*\n\s*111\s*\n\s*\$\$\s*-strained/);
  assert.equal((markdown.match(/^## References\s*$/gm) || []).length, 1);
  assert.equal((markdown.match(/<a id="ref-\d+"><\/a>/g) || []).length, 3);
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
  ];
  for (const [markdown, type] of cases) {
    const validation = validateMathDelimiters(markdown);
    assert.equal(validation.valid, false, markdown);
    assert.ok(validation.issues.some((issue) => issue.type === type), `${markdown}: ${JSON.stringify(validation.issues)}`);
    assert.throws(() => assertValidMathDelimiters(markdown), /Math delimiter validation failed/);
  }
});

test('final fixture Markdown passes academic output quality assertions', async () => {
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  assertOutputQuality(result.markdown);
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
    const saved = await writePaper(result, { libraryPath: root, downloadFigures: true, saveDebug: true });
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
    const saved = await writePaper(result, { libraryPath: root, downloadFigures: true });
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
    const saved = await writePaper(result, { libraryPath: root, downloadFigures: true });
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
    await writePaper(result, { libraryPath: root, downloadFigures: true });
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
