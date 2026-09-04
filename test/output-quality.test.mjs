import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { clipNature, writePaper } from '../src/clip.mjs';

const fixturePath = new URL('./fixtures/nature-minimal.html', import.meta.url);
const fixtureHtml = await readFile(fixturePath, 'utf8');
const fixtureUrl = 'https://www.nature.com/articles/s41586-026-10401-1';

function assertOutputQuality(markdown, { localFigures = false } = {}) {
  assert.doesNotMatch(markdown, /<sub\b|<sup\b|<i\b/);
  assert.doesNotMatch(markdown, /\$\$\s*\n\s*111\s*\n\s*\$\$\s*-strained/);
  assert.equal((markdown.match(/^## References\s*$/gm) || []).length, 1);
  assert.equal((markdown.match(/<a id="ref-\d+"><\/a>/g) || []).length, 3);
  if (localFigures) {
    assert.match(markdown, /!\[Figure 1\]\(figures\/fig1\.png\)/);
    assert.match(markdown, /!\[Extended Data Figure 3\]\(figures\/fig2\.png\)/);
  }
  assert.doesNotMatch(markdown, /!\[[^\]]{40,}\]/);
}

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
    await writePaper(result, { libraryPath: root, downloadFigures: true });
    const failed = result.debug.figureDownloads.filter((entry) => entry.status === 503);
    assert.equal(failed.length, 2);
    assert.equal(failed[0].sourceUrl, 'https://example.org/fig2.jpg');
    assert.match(failed[0].error, /HTTP 503/);
    assert.match(result.debug.warnings.join('\n'), /Figure download failed/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
