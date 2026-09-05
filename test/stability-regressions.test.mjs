import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { clipNature, writePaper } from '../src/clip.mjs';
import { buildExtension } from '../src/build.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixturePath = new URL('./fixtures/nature-minimal.html', import.meta.url);
const fixtureHtml = await readFile(fixturePath, 'utf8');
const idlessEquationHtml = await readFile(new URL('./fixtures/nature-idless-equation.html', import.meta.url), 'utf8');
const fixtureUrl = 'https://www.nature.com/articles/s41586-026-10401-1';
const idlessEquationUrl = 'https://www.nature.com/articles/idless-equation';

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function withFigureUrls(result, count) {
  return {
    ...result,
    figures: result.figures.slice(0, count).map((figure, index) => ({
      ...figure,
      imageUrl: `https://example.org/regression-figure-${index + 1}.png`,
    })),
    debug: { ...result.debug, warnings: [...result.debug.warnings] },
  };
}

function runCli(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(repoRoot, 'src', 'cli.mjs'), ...args], {
      cwd: repoRoot,
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (code, signal) => resolve({ code, signal, stdout, stderr }));
  });
}

test('concurrent Nature clips keep each DOM environment isolated and restore prior globals', async () => {
  const previous = {
    hasWindow: Object.prototype.hasOwnProperty.call(globalThis, 'window'),
    window: globalThis.window,
    hasDocument: Object.prototype.hasOwnProperty.call(globalThis, 'document'),
    document: globalThis.document,
  };
  const sentinelWindow = { name: 'pre-existing-window' };
  const sentinelDocument = { name: 'pre-existing-document' };
  globalThis.window = sentinelWindow;
  globalThis.document = sentinelDocument;
  try {
    for (let index = 0; index < 3; index += 1) {
      const [first, second] = await Promise.all([
        clipNature({
          html: fixtureHtml.replaceAll('Fixture title', 'Concurrent A title').replaceAll('Paragraph A', 'Concurrent A paragraph'),
          url: `${fixtureUrl}/a-${index}`,
        }),
        clipNature({
          html: fixtureHtml.replaceAll('Fixture title', 'Concurrent B title').replaceAll('Paragraph A', 'Concurrent B paragraph'),
          url: `${fixtureUrl}/b-${index}`,
        }),
      ]);
      assert.match(first.markdown, /Concurrent A title/);
      assert.match(first.markdown, /Concurrent A paragraph/);
      assert.doesNotMatch(first.markdown, /Concurrent B title|Concurrent B paragraph/);
      assert.match(second.markdown, /Concurrent B title/);
      assert.match(second.markdown, /Concurrent B paragraph/);
      assert.doesNotMatch(second.markdown, /Concurrent A title|Concurrent A paragraph/);
    }
    assert.equal(globalThis.window, sentinelWindow);
    assert.equal(globalThis.document, sentinelDocument);
  } finally {
    if (previous.hasWindow) globalThis.window = previous.window;
    else delete globalThis.window;
    if (previous.hasDocument) globalThis.document = previous.document;
    else delete globalThis.document;
  }
});

test('id-less equations receive deterministic cross-reference identities and external fragments stay external', async () => {
  const result = await clipNature({ html: idlessEquationHtml, url: idlessEquationUrl });
  assert.match(result.markdown, /\[Equation 1\]\(#equation-1\)/);
  assert.match(result.markdown, /<a id="equation-1"><\/a>/);
  assert.match(result.markdown, /\[Same article equation\]\(#equation-1\)/);
  assert.match(result.markdown, /\[External article link\]\(https:\/\/external\.example\/articles\/other#Equ1\)/);
  assert.equal(validateMathDelimiters(result.markdown).valid, true);
});

test('writer removes stale bibliography and debug artifacts during directory replacement', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-stale-'));
  const quarto = await clipNature({ html: fixtureHtml, url: fixtureUrl, citationStyle: 'quarto' });
  await writePaper(quarto, { libraryPath: root, downloadFigures: false, saveDebug: true });
  const destination = path.join(root, quarto.articleId);
  for (const name of ['references.bib', 'debug.json', 'raw.html', 'cleaned.html']) {
    assert.equal(await exists(path.join(destination, name)), true, name);
  }

  const markdown = await clipNature({ html: fixtureHtml, url: fixtureUrl, citationStyle: 'markdown' });
  await writePaper(markdown, { libraryPath: root, downloadFigures: false, saveDebug: false });
  assert.deepEqual(await readdir(destination), ['index.md']);
});

test('writer removes stale figures when the next complete article has fewer figures', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-figures-'));
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('image', {
    status: 200,
    headers: { 'content-type': 'image/png' },
  });
  try {
    const first = withFigureUrls(await clipNature({ html: fixtureHtml, url: fixtureUrl }), 3);
    await writePaper(first, { libraryPath: root, downloadFigures: true });
    const second = withFigureUrls(await clipNature({ html: fixtureHtml, url: fixtureUrl }), 2);
    await writePaper(second, { libraryPath: root, downloadFigures: true });
    assert.deepEqual(await readdir(path.join(root, first.articleId, 'figures')), ['fig1.png', 'fig2.png']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('failed second writer commit preserves the previous complete article', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-rollback-'));
  const first = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  await writePaper(first, { libraryPath: root, downloadFigures: false });
  const destination = path.join(root, first.articleId);
  const previous = await readFile(path.join(destination, 'index.md'), 'utf8');

  const second = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  second.bodyMarkdown += '\nVersion B must not be installed.';
  await assert.rejects(
    () => writePaper(second, {
      libraryPath: root,
      downloadFigures: false,
      beforeInstall: async () => { throw new Error('simulated commit failure'); },
    }),
    /simulated commit failure/,
  );
  assert.equal(await readFile(path.join(destination, 'index.md'), 'utf8'), previous);
  assert.deepEqual(await readdir(destination), ['index.md']);
  assert.deepEqual((await readdir(root)).filter((name) => name.includes('previous')), []);
});

test('concurrent writes to one article install one complete request', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-concurrent-writer-'));
  const first = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  const second = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  first.bodyMarkdown += '\nWriter A marker.';
  second.bodyMarkdown += '\nWriter B marker.';
  await Promise.all([
    writePaper(first, { libraryPath: root, downloadFigures: false }),
    writePaper(second, { libraryPath: root, downloadFigures: false }),
  ]);
  const markdown = await readFile(path.join(root, first.articleId, 'index.md'), 'utf8');
  assert.equal(markdown.includes('Writer A marker.') + markdown.includes('Writer B marker.'), 1);
});

test('CLI rejects missing values instead of consuming another option', async () => {
  for (const [option, next] of [['--url', '--debug'], ['--output', '--debug'], ['--citation-style', '--debug']]) {
    const result = await runCli([option, next]);
    assert.notEqual(result.code, 0, `${option} unexpectedly succeeded`);
    assert.match(result.stderr, new RegExp(`Missing value for ${option.replaceAll('-', '\\-')}`));
  }
});

test('extension build removes stale files from the output directory', async () => {
  const output = await mkdtemp(path.join(tmpdir(), 'academic-clipper-build-'));
  await writeFile(path.join(output, 'stale-extension-file.txt'), 'stale', 'utf8');
  await buildExtension(output);
  assert.equal(await exists(path.join(output, 'stale-extension-file.txt')), false);
  assert.equal(await exists(path.join(output, 'manifest.json')), true);
});
