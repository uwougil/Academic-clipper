import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBridgeServer } from '../src/bridge.mjs';
import { isSafeExternalUrl, safeExternalUrl } from '../src/security.mjs';

const allowedOrigin = 'chrome-extension://abcdefghijklmnopqrstuvwxzyabcdef';

test('bridge only permits configured origins and bearer token', async () => {
  const server = createBridgeServer({
    port: 0,
    libraryPath: process.cwd(),
    downloadFigures: false,
    saveDebug: false,
    bridgeToken: 'test-bridge-token',
    allowedOrigins: [allowedOrigin],
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const endpoint = `http://127.0.0.1:${port}`;
  try {
    const blocked = await fetch(`${endpoint}/health`, { headers: { origin: 'https://evil.example' } });
    assert.equal(blocked.status, 403);
    assert.notEqual(blocked.headers.get('access-control-allow-origin'), '*');

    const health = await fetch(`${endpoint}/health`, { headers: { origin: allowedOrigin } });
    assert.equal(health.status, 200);
    assert.equal(health.headers.get('access-control-allow-origin'), allowedOrigin);

    const missingToken = await fetch(`${endpoint}/preview`, {
      method: 'POST',
      headers: { origin: allowedOrigin, 'content-type': 'application/json' },
      body: '{}',
    });
    assert.equal(missingToken.status, 401);

    const authenticated = await fetch(`${endpoint}/preview`, {
      method: 'POST',
      headers: {
        origin: allowedOrigin,
        authorization: 'Bearer test-bridge-token',
        'content-type': 'application/json',
      },
      body: '{}',
    });
    assert.equal(authenticated.status, 400);
    assert.match((await authenticated.json()).error, /html and url/);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('figure URL guard blocks local, private and non-http resources', () => {
  for (const url of [
    'file:///C:/secret.txt',
    'data:text/plain,secret',
    'ftp://127.0.0.1/file',
    'http://localhost:8080/',
    'http://127.0.0.1:8080/',
    'http://192.168.1.10/image.png',
    'http://[::1]/image.png',
  ]) {
    assert.equal(isSafeExternalUrl(url), false, url);
    assert.throws(() => safeExternalUrl(url), /not allowed|local or private/);
  }
  assert.equal(safeExternalUrl('https://media.springernature.com/image.png'), 'https://media.springernature.com/image.png');
});
