import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { fetchNatureArticle } from '../src/article-fetch.mjs';
import { loadConfig, resolveBridgePort } from '../src/bridge.mjs';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const articleUrl = 'https://www.nature.com/articles/example';

function publicResolver() {
  return [{ address: '93.184.216.34', family: 4 }];
}

test('article fetch accepts bounded HTML and forwards an abort signal', async () => {
  let requestOptions;
  const result = await fetchNatureArticle(articleUrl, {
    fetchImpl: async (_url, options) => {
      requestOptions = options;
      return new Response('<main>paper</main>', { headers: { 'content-type': 'text/html; charset=utf-8' } });
    },
    resolveHostname: publicResolver,
  });
  assert.equal(result.html, '<main>paper</main>');
  assert.equal(result.url, articleUrl);
  assert.equal(requestOptions.redirect, 'manual');
  assert.ok(requestOptions.signal instanceof AbortSignal);
});

test('article fetch accepts missing and XHTML content types', async () => {
  for (const headers of [{}, { 'content-type': 'application/xhtml+xml; charset=utf-8' }]) {
    const result = await fetchNatureArticle(articleUrl, {
      fetchImpl: async () => {
        const response = new Response('<article>paper</article>', { headers });
        if (!Object.keys(headers).length) response.headers.delete('content-type');
        return response;
      },
      resolveHostname: publicResolver,
    });
    assert.equal(result.html, '<article>paper</article>');
  }
});

test('article fetch rejects HTTP failures and unrelated content types', async () => {
  await assert.rejects(
    () => fetchNatureArticle(articleUrl, {
      fetchImpl: async () => new Response('missing', { status: 404 }),
      resolveHostname: publicResolver,
    }),
    /Unable to fetch .*: HTTP 404/,
  );
  await assert.rejects(
    () => fetchNatureArticle(articleUrl, {
      fetchImpl: async () => new Response('binary', { headers: { 'content-type': 'application/octet-stream' } }),
      resolveHostname: publicResolver,
    }),
    /Unexpected content-type/,
  );
});

test('article fetch timeout aborts the request with a clear error', async () => {
  await assert.rejects(
    () => fetchNatureArticle(articleUrl, {
      fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      }),
      resolveHostname: publicResolver,
      timeoutMs: 10,
    }),
    /timed out after 10 ms/,
  );
});

test('article fetch enforces declared and streamed body-size limits', async () => {
  let bodyWasRead = false;
  await assert.rejects(
    () => fetchNatureArticle(articleUrl, {
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-length': '6', 'content-type': 'text/html' }),
        get body() { bodyWasRead = true; throw new Error('body should not be read'); },
      }),
      resolveHostname: publicResolver,
      maxBytes: 5,
    }),
    /exceeds the 5-byte limit/,
  );
  assert.equal(bodyWasRead, false);

  await assert.rejects(
    () => fetchNatureArticle(articleUrl, {
      fetchImpl: async () => new Response('123456', { headers: { 'content-type': 'text/html' } }),
      resolveHostname: publicResolver,
      maxBytes: 5,
    }),
    /exceeds the 5-byte limit/,
  );
});

test('article redirects remain on the requested Nature article', async () => {
  let calls = 0;
  await assert.rejects(
    () => fetchNatureArticle(articleUrl, {
      fetchImpl: async () => {
        calls += 1;
        return new Response(null, { status: 302, headers: { location: 'https://www.nature.com/articles/other' } });
      },
      resolveHostname: publicResolver,
    }),
    /redirect escaped the requested article scope/,
  );
  assert.equal(calls, 1);
});

test('bridge port validation accepts only integer TCP ports', () => {
  for (const value of [1, '34123', 65_535]) assert.equal(resolveBridgePort(value), Number(value));
  for (const value of ['abc', 'NaN', -1, 0, 65_536, 70_000, 3.14, '']) {
    assert.throws(() => resolveBridgePort(value), /integer from 1 to 65535/, value);
  }
});

test('bridge configuration files use the same port validation rule', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-config-port-'));
  const configPath = path.join(root, 'config.json');
  await writeFile(configPath, JSON.stringify({ port: 3.14 }), 'utf8');
  await assert.rejects(() => loadConfig(configPath), /integer from 1 to 65535/);
  await writeFile(configPath, JSON.stringify({ port: 65_535 }), 'utf8');
  assert.equal((await loadConfig(configPath)).port, 65_535);
});

test('invalid bridge port from the environment exits cleanly without a stack trace', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'academic-clipper-bridge-port-'));
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(repoRoot, 'src', 'bridge.mjs'), '--config', path.join(root, 'missing.json')], {
      cwd: repoRoot,
      windowsHide: true,
      env: { ...process.env, ACADEMIC_CLIPPER_PORT: 'abc' },
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (code) => resolve({ code, stderr }));
  });
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /Invalid bridge port: expected an integer from 1 to 65535/);
  assert.doesNotMatch(result.stderr, /\n\s+at /u);
});
