import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, mkdtemp, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { hydrateNatureTables } from '../src/adapters/nature.mjs';
import { clipNature, writePaper } from '../src/clip.mjs';
import { isPrivateIpAddress, isSafeExternalUrl, safeFetchExternal } from '../src/security.mjs';
import { normalizeBridgeEndpoint, isValidBridgeEndpoint } from '../extension/endpoint.mjs';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixtureHtml = await readFile(new URL('./fixtures/nature-minimal.html', import.meta.url), 'utf8');
const fixtureUrl = 'https://www.nature.com/articles/s41586-026-10401-1';
const articleId = 's41586-026-10401-1';
const clipModuleUrl = pathToFileURL(path.join(repoRoot, 'src', 'clip.mjs')).href;

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function publicResolver() {
  return [{ address: '93.184.216.34', family: 4 }];
}

function response(status, headers = {}) {
  return new Response(status >= 300 && status < 400 ? null : 'ok', { status, headers });
}

test('external resource policy blocks private DNS, redirects, mapped IPv6, and redirect loops', async () => {
  for (const address of ['127.0.0.1', '10.0.0.1', '192.168.1.1', '::1', '::ffff:127.0.0.1', '::ffff:7f00:1']) {
    assert.equal(isPrivateIpAddress(address), true, address);
  }
  assert.equal(isSafeExternalUrl('https://[::ffff:127.0.0.1]/image.png'), false);
  assert.equal(isSafeExternalUrl('https://[::ffff:7f00:1]/image.png'), false);

  let fetchCalls = 0;
  let resolverOptions;
  await assert.rejects(
    () => safeFetchExternal('https://public-looking.example/image.png', {
      fetchImpl: async () => { fetchCalls += 1; return response(200); },
      resolveHostname: async (_hostname, options) => {
        resolverOptions = options;
        return [
        { address: '93.184.216.34', family: 4 },
        { address: '127.0.0.1', family: 4 },
        ];
      },
    }),
    /resolves to a local or private address/,
  );
  assert.equal(fetchCalls, 0);
  assert.deepEqual(resolverOptions, { all: true, verbatim: true });

  const seen = [];
  let step = 0;
  const redirected = await safeFetchExternal('https://public.example/one', {
    fetchImpl: async (url, options) => {
      seen.push({ url, redirect: options.redirect });
      step += 1;
      return step === 1
        ? response(302, { location: '/two' })
        : step === 2
          ? response(307, { location: 'https://cdn.example/three' })
          : response(200);
    },
    resolveHostname: publicResolver,
  });
  assert.equal(redirected.url, 'https://cdn.example/three');
  assert.equal(redirected.redirects, 2);
  assert.deepEqual(seen, [
    { url: 'https://public.example/one', redirect: 'manual' },
    { url: 'https://public.example/two', redirect: 'manual' },
    { url: 'https://cdn.example/three', redirect: 'manual' },
  ]);

  let redirectCalls = 0;
  await assert.rejects(
    () => safeFetchExternal('https://public.example/start', {
      fetchImpl: async () => {
        redirectCalls += 1;
        return response(302, { location: `/hop-${redirectCalls + 1}` });
      },
      resolveHostname: publicResolver,
    }),
    /redirect limit exceeded/,
  );
  assert.equal(redirectCalls, 6);
});

test('external resource policy rejects private redirect targets before following them', async () => {
  let calls = 0;
  await assert.rejects(
    () => safeFetchExternal('https://public.example/start', {
      fetchImpl: async () => {
        calls += 1;
        return response(302, { location: 'http://127.0.0.1/secret' });
      },
      resolveHostname: publicResolver,
    }),
    /local or private address/,
  );
  assert.equal(calls, 1);
});

test('Nature table redirect cannot escape the current article table scope', async () => {
  const table = {
    label: 'Table 1',
    url: 'https://www.nature.com/articles/example/tables/1',
    tableContentStatus: 'not-loaded',
  };
  let calls = 0;
  const warnings = await hydrateNatureTables([table], 'https://www.nature.com/articles/example', {
    fetchImpl: async () => {
      calls += 1;
      return response(302, { location: 'https://public.example/escaped' });
    },
    resolveHostname: publicResolver,
  });
  assert.equal(calls, 1);
  assert.equal(table.tableContentStatus, 'fallback-fetch-failed');
  assert.match(table.tableContentWarning, /escaped the current article table scope/);
  assert.match(warnings.join('\n'), /escaped the current article table scope/);
});

test('custom bridge endpoint accepts only localhost HTTP origins', () => {
  assert.equal(normalizeBridgeEndpoint('http://127.0.0.1:34124/'), 'http://127.0.0.1:34124');
  assert.equal(normalizeBridgeEndpoint('http://localhost:34124'), 'http://localhost:34124');
  for (const value of [
    'https://localhost:34124',
    'http://192.168.1.2:34124',
    'http://example.com:34124',
    'http://localhost:65536',
    'http://user:pass@localhost:34124',
    'http://localhost:34124/path',
  ]) {
    assert.equal(isValidBridgeEndpoint(value), false, value);
  }
});

test('extension host permissions cover localhost ports without broad web access', async () => {
  const manifest = JSON.parse(await readFile(path.join(repoRoot, 'extension', 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest.host_permissions, ['http://127.0.0.1/*', 'http://localhost/*']);
  assert.equal(manifest.host_permissions.includes('<all_urls>'), false);
});

function runValidator(file, citationStyle) {
  return new Promise((resolve) => {
    const args = [path.join(repoRoot, 'src', 'validate-paper.mjs'), '--file', file];
    if (citationStyle) args.push('--citation-style', citationStyle);
    const child = spawn(process.execPath, args, { cwd: repoRoot, windowsHide: true });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
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
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

test('CLI reports common usage errors without an uncaught stack trace', async () => {
  const cases = [
    { args: ['--url', 'not-a-url'], message: /Invalid URL/ },
    { args: ['--url', 'https://example.org/article'], message: /Unsupported site/ },
    { args: ['--url', fixtureUrl, '--citation-style', 'invalid'], message: /Invalid --citation-style/ },
  ];
  for (const item of cases) {
    const result = await runCli(item.args);
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, item.message);
    assert.doesNotMatch(result.stderr, /\n\s+at /u);
  }
});

test('standalone validator handles Markdown, links, and Quarto styles explicitly and in auto mode', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-validator-'));
  const fixtures = {
    markdown: '# Paper\n\n## References\n\n[^1]: Source.',
    links: '# Paper\n\n## References\n\n1. Source. <a id="ref-1"></a>',
    quarto: '---\nbibliography: "references.bib"\n---\n\n# Paper\n\n## References\n\n::: {#refs}\n:::',
  };
  for (const [style, markdown] of Object.entries(fixtures)) {
    const file = path.join(root, `${style}.md`);
    await writeFile(file, markdown, 'utf8');
    for (const requested of [style, 'auto']) {
      const result = await runValidator(file, requested);
      assert.equal(result.code, 0, `${style}/${requested}: ${result.stderr}`);
      assert.match(result.stdout, new RegExp(`"citationStyle": "${style}"`));
    }
  }
});

async function runWriterChild(root, marker, { delayMs = 0 } = {}) {
  const active = path.join(root, 'writer-a-active');
  const overlap = path.join(root, 'writer-overlap');
  const script = `
    import { access, readFile, rm, writeFile } from 'node:fs/promises';
    import { clipNature, writePaper } from ${JSON.stringify(clipModuleUrl)};
    const root = process.env.ACADEMIC_TEST_ROOT;
    const html = await readFile(process.env.ACADEMIC_TEST_FIXTURE, 'utf8');
    const result = await clipNature({ html, url: ${JSON.stringify(fixtureUrl)} });
    result.bodyMarkdown += '\\n' + process.env.ACADEMIC_TEST_MARKER;
    await writePaper(result, {
      libraryPath: root,
      downloadFigures: false,
      beforeInstall: async () => {
        if (${delayMs} > 0) {
          await writeFile(${JSON.stringify(active)}, String(process.pid), 'utf8');
          await new Promise((resolve) => setTimeout(resolve, ${delayMs}));
          await rm(${JSON.stringify(active)}, { force: true });
        } else {
          try { await access(${JSON.stringify(active)}); await writeFile(${JSON.stringify(overlap)}, 'overlap', 'utf8'); } catch {}
        }
      },
    });
  `;
  const child = spawn(process.execPath, ['--input-type=module', '-e', script], {
    cwd: repoRoot,
    windowsHide: true,
    env: {
      ...process.env,
      ACADEMIC_TEST_ROOT: root,
      ACADEMIC_TEST_FIXTURE: path.join(repoRoot, 'test', 'fixtures', 'nature-minimal.html'),
      ACADEMIC_TEST_MARKER: marker,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  return {
    process: child,
    result: new Promise((resolve) => child.on('close', (code, signal) => resolve({ code, signal, stdout, stderr }))),
  };
}

async function waitForFile(file, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await exists(file)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${file}`);
}

test('independent writer processes serialize one article and leave no active lock', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-cross-process-'));
  const first = await runWriterChild(root, 'Cross-process A marker.', { delayMs: 700 });
  await waitForFile(path.join(root, 'writer-a-active'));
  const second = await runWriterChild(root, 'Cross-process B marker.');
  const [firstResult, secondResult] = await Promise.all([first.result, second.result]);
  assert.equal(firstResult.code, 0, firstResult.stderr);
  assert.equal(secondResult.code, 0, secondResult.stderr);
  const markdown = await readFile(path.join(root, articleId, 'index.md'), 'utf8');
  assert.equal(markdown.includes('Cross-process A marker.') + markdown.includes('Cross-process B marker.'), 1);
  assert.equal(await exists(path.join(root, 'writer-overlap')), false);
  const lockRoot = path.join(root, '.academic-clipper-locks');
  assert.deepEqual(await readdir(lockRoot), []);
});

test('stale writer lock is recovered after the recorded process is gone', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-stale-lock-'));
  const digest = createHash('sha256').update(articleId).digest('hex').slice(0, 32);
  const lockDir = path.join(root, '.academic-clipper-locks', `${digest}-${articleId}.lock`);
  await mkdir(lockDir, { recursive: true });
  await writeFile(path.join(lockDir, 'owner.json'), JSON.stringify({
    pid: 2147483647,
    createdAt: Date.now() - 60_000,
    token: 'stale-test',
  }), 'utf8');
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  await writePaper(result, { libraryPath: root, downloadFigures: false, lockStaleMs: 10 });
  assert.equal(await exists(path.join(root, articleId, 'index.md')), true);
  assert.deepEqual(await readdir(path.join(root, '.academic-clipper-locks')), []);
});

test('successful install remains successful when old backup cleanup fails', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-cleanup-warning-'));
  const first = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  await writePaper(first, { libraryPath: root, downloadFigures: false, saveDebug: true });
  const second = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  second.bodyMarkdown += '\nNew version installed.';
  const saved = await writePaper(second, {
    libraryPath: root,
    downloadFigures: false,
    saveDebug: true,
    removeBackup: async () => { throw new Error('simulated backup cleanup failure'); },
  });
  assert.match(saved.markdown, /New version installed/);
  assert.match(saved.debug.warnings.join('\n'), /backup cleanup failed/);
  const debug = JSON.parse(await readFile(path.join(root, articleId, 'debug.json'), 'utf8'));
  assert.match(debug.warnings.join('\n'), /backup cleanup failed/);
  assert.equal((await readdir(root)).filter((name) => name.endsWith('-previous')).length, 1);
});

async function createTransaction(root, { backup = false, index = 'recovered' } = {}) {
  const digest = createHash('sha256').update(articleId).digest('hex').slice(0, 32);
  const staging = await mkdtemp(path.join(root, `.academic-clipper-${digest}-`));
  await writeFile(path.join(staging, 'index.md'), index, 'utf8');
  if (!backup) return staging;
  const backupPath = `${staging}-previous`;
  await rename(staging, backupPath);
  return backupPath;
}

test('next write restores a complete backup when destination is missing', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-recovery-backup-'));
  await createTransaction(root, { backup: true, index: 'Recovered complete article.' });
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  await assert.rejects(
    () => writePaper(result, {
      libraryPath: root,
      downloadFigures: false,
      beforeInstall: async () => { throw new Error('stop after recovery'); },
    }),
    /stop after recovery/,
  );
  assert.equal(await readFile(path.join(root, articleId, 'index.md'), 'utf8'), 'Recovered complete article.');
});

test('next write keeps destination and removes stale backup and staging transactions', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-recovery-stale-'));
  const result = await clipNature({ html: fixtureHtml, url: fixtureUrl });
  await writePaper(result, { libraryPath: root, downloadFigures: false });
  const staleBackup = await createTransaction(root, { backup: true, index: 'stale backup' });
  const staleStaging = await createTransaction(root, { index: 'stale staging' });
  await assert.rejects(
    () => writePaper(result, {
      libraryPath: root,
      downloadFigures: false,
      beforeInstall: async () => { throw new Error('stop after stale cleanup'); },
    }),
    /stop after stale cleanup/,
  );
  assert.equal(await exists(staleBackup), false);
  assert.equal(await exists(staleStaging), false);
  assert.equal(await exists(path.join(root, articleId, 'index.md')), true);
});
