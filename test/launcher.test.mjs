import assert from 'node:assert/strict';
import { test } from 'node:test';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { PassThrough } from 'node:stream';
import { spawn } from 'node:child_process';

import {
  resolveLauncherPaths,
  checkBridgeHealth,
  isBridgeRunning,
  acquireStartupLock,
  wakeBridge,
  handleMessage,
  runMessageLoop,
  writeNativeMessage,
} from '../src/launcher.mjs';
import { executeBridgeRequest, verifyBridgeHealth } from '../extension/lifecycle.mjs';
import {
  generateManifest,
  generateBatContent,
  getRegistryKeys,
  installWindowsHost,
} from '../scripts/install-windows.mjs';
import { uninstallWindowsHost } from '../scripts/uninstall-windows.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const launcherScript = path.resolve(rootDir, 'src', 'launcher.mjs');

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = http.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close((err) => (err ? reject(err) : resolve(port)));
    });
  });
}

function sendNativeMessageToProcess(child, msg) {
  const payload = Buffer.from(JSON.stringify(msg), 'utf8');
  const len = Buffer.alloc(4);
  len.writeUInt32LE(payload.length, 0);
  child.stdin.write(Buffer.concat([len, payload]));
}

function readNativeMessageFromBuffer(buffer) {
  if (buffer.length < 4) return null;
  const len = buffer.readUInt32LE(0);
  if (buffer.length < 4 + len) return null;
  const msgBuffer = buffer.subarray(4, 4 + len);
  return {
    message: JSON.parse(msgBuffer.toString('utf8')),
    remaining: buffer.subarray(4 + len),
  };
}

test('1. bridge not running -> starts once', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-1-'));
  const port = await getFreePort();
  const options = {
    rootDir,
    configPath: path.join(tempDir, 'config.json'),
    env: { ACADEMIC_CLIPPER_PORT: String(port) },
    runFile: path.join(tempDir, '.bridge-run.json'),
    startupLockFile: path.join(tempDir, '.bridge-startup.lock'),
  };

  let res;
  try {
    res = await wakeBridge(options);
    assert.equal(res.ok, true);
    assert.equal(res.port, port);
    assert.equal(res.reused, false);
    assert.ok(res.token);

    const running = await isBridgeRunning(options);
    assert.ok(running);
    assert.equal(running.port, port);
  } finally {
    if (res && res.instanceId) {
      const running = await isBridgeRunning(options);
      if (running?.pid) {
        try { process.kill(running.pid, 'SIGKILL'); } catch {}
      }
    }
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});

test('2. bridge already running -> reuse', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-2-'));
  const port = await getFreePort();
  const options = {
    rootDir,
    configPath: path.join(tempDir, 'config.json'),
    env: { ACADEMIC_CLIPPER_PORT: String(port) },
    runFile: path.join(tempDir, '.bridge-run.json'),
    startupLockFile: path.join(tempDir, '.bridge-startup.lock'),
  };

  let res1;
  try {
    res1 = await wakeBridge(options);
    assert.equal(res1.ok, true);
    assert.equal(res1.reused, false);

    const res2 = await wakeBridge(options);
    assert.equal(res2.ok, true);
    assert.equal(res2.reused, true);
    assert.equal(res2.port, res1.port);
    assert.equal(res2.token, res1.token);
    assert.equal(res2.instanceId, res1.instanceId);
  } finally {
    const running = await isBridgeRunning(options);
    if (running?.pid) {
      try { process.kill(running.pid, 'SIGKILL'); } catch {}
    }
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});

test('3. two concurrent wake calls -> no duplicate process', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-3-'));
  const port = await getFreePort();
  const options = {
    rootDir,
    configPath: path.join(tempDir, 'config.json'),
    env: { ACADEMIC_CLIPPER_PORT: String(port) },
    runFile: path.join(tempDir, '.bridge-run.json'),
    startupLockFile: path.join(tempDir, '.bridge-startup.lock'),
  };

  try {
    const [call1, call2] = await Promise.all([
      wakeBridge(options),
      wakeBridge(options),
    ]);
    assert.equal(call1.ok, true);
    assert.equal(call2.ok, true);
    assert.equal(call1.port, call2.port);
    assert.equal(call1.token, call2.token);
    assert.equal(call1.instanceId, call2.instanceId);
  } finally {
    const running = await isBridgeRunning(options);
    if (running?.pid) {
      try { process.kill(running.pid, 'SIGKILL'); } catch {}
    }
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});

test('4. stale run file is cleaned up and ignored', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-4-'));
  const runFile = path.join(tempDir, '.bridge-run.json');
  const options = { runFile };

  await writeFile(runFile, '{ malformed json content...', 'utf8');
  const running = await isBridgeRunning(options);
  assert.equal(running, null);

  await writeFile(runFile, JSON.stringify({ pid: 1234 }), 'utf8');
  const runningMissingFields = await isBridgeRunning(options);
  assert.equal(runningMissingFields, null);
  assert.equal(existsSync(runFile), false);

  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('5. dead PID is detected and run file removed', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-5-'));
  const runFile = path.join(tempDir, '.bridge-run.json');
  const options = { runFile };

  await writeFile(
    runFile,
    JSON.stringify({
      pid: 99999999,
      port: 34123,
      bridgeToken: 'token',
      instanceId: 'inst-1',
    }),
    'utf8'
  );

  const running = await isBridgeRunning(options);
  assert.equal(running, null);
  assert.equal(existsSync(runFile), false);

  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('6. PID alive but port closed is detected as stale', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-6-'));
  const runFile = path.join(tempDir, '.bridge-run.json');
  const unusedPort = await getFreePort();
  const options = { runFile, healthTimeoutMs: 300 };

  await writeFile(
    runFile,
    JSON.stringify({
      pid: process.pid,
      port: unusedPort,
      bridgeToken: 'token',
      instanceId: 'inst-alive-pid',
    }),
    'utf8'
  );

  const running = await isBridgeRunning(options);
  assert.equal(running, null);
  assert.equal(existsSync(runFile), false);

  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('7. health endpoint wrong identity is rejected as stale', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-7-'));
  const runFile = path.join(tempDir, '.bridge-run.json');
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, service: 'unrelated-dummy-service' }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    await writeFile(
      runFile,
      JSON.stringify({
        pid: process.pid,
        port,
        bridgeToken: 'token',
        instanceId: 'inst-wrong-service',
      }),
      'utf8'
    );

    const running = await isBridgeRunning({ runFile, healthTimeoutMs: 500 });
    assert.equal(running, null);
    assert.equal(existsSync(runFile), false);

    const healthCheck = await verifyBridgeHealth(`http://127.0.0.1:${port}`);
    assert.equal(healthCheck.ok, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});

test('8. startup timeout cleans up lock and returns error', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-8-'));
  const lockFile = path.join(tempDir, '.bridge-startup.lock');
  const options = {
    rootDir,
    configPath: path.join(tempDir, 'config.json'),
    bridgeScript: path.resolve(__dirname, 'fixtures', 'dummy-hang.js'),
    runFile: path.join(tempDir, '.bridge-run.json'),
    startupLockFile: lockFile,
    startupTimeoutMs: 300,
  };

  await assert.rejects(
    () => wakeBridge(options),
    /Startup timeout/
  );

  assert.equal(existsSync(lockFile), false);
  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('9. launcher spawn failure releases lock', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-9-'));
  const lockFile = path.join(tempDir, '.bridge-startup.lock');
  const options = {
    rootDir,
    configPath: path.join(tempDir, 'config.json'),
    nodeBin: 'definitely_non_existent_node_executable_12345',
    runFile: path.join(tempDir, '.bridge-run.json'),
    startupLockFile: lockFile,
    startupTimeoutMs: 300,
  };

  await assert.rejects(
    () => wakeBridge(options),
    /Failed to spawn bridge process/
  );

  assert.equal(existsSync(lockFile), false);
  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('10. stale token -> refresh -> one retry only', async () => {
  let callCount = 0;
  let wakeCount = 0;

  const mockFetchSuccessOnRetry = async (url, options) => {
    callCount++;
    if (callCount === 1) {
      return {
        status: 401,
        ok: false,
        json: async () => ({ ok: false, error: 'Bridge token is missing or invalid.' }),
      };
    }
    return {
      status: 200,
      ok: true,
      json: async () => ({ ok: true, articleId: 's41586-026-10401-1' }),
    };
  };

  const mockWakeBridge = async () => {
    wakeCount++;
    return { port: 34123, token: 'new-valid-token' };
  };

  let sessionUpdated = null;
  const result = await executeBridgeRequest({
    endpoint: 'http://127.0.0.1:34123',
    route: '/preview',
    payload: { url: 'https://www.nature.com/articles/s41586-026-10401-1', html: '<html/>' },
    token: 'old-stale-token',
    wakeBridgeFn: mockWakeBridge,
    onSessionUpdated: async (sess) => { sessionUpdated = sess; },
    fetchFn: mockFetchSuccessOnRetry,
  });

  assert.equal(result.ok, true);
  assert.equal(callCount, 2);
  assert.equal(wakeCount, 1);
  assert.deepEqual(sessionUpdated, { endpoint: 'http://127.0.0.1:34123', token: 'new-valid-token' });

  // Test that persistent 401 stops after exactly 1 retry without infinite loop
  let persistentCalls = 0;
  let persistentWakes = 0;
  const mockFetchAlways401 = async () => {
    persistentCalls++;
    return {
      status: 401,
      ok: false,
      json: async () => ({ ok: false, error: 'Unauthorized persistently.' }),
    };
  };

  await assert.rejects(
    () => executeBridgeRequest({
      endpoint: 'http://127.0.0.1:34123',
      route: '/preview',
      payload: {},
      token: 'tok',
      wakeBridgeFn: async () => { persistentWakes++; return { port: 34123, token: 'tok2' }; },
      fetchFn: mockFetchAlways401,
    }),
    /Unauthorized persistently/
  );

  assert.equal(persistentCalls, 2);
  assert.equal(persistentWakes, 1);
});

test('11. invalid native message is rejected gracefully', async () => {
  const res1 = await handleMessage(null);
  assert.equal(res1.ok, false);
  assert.match(res1.error, /must be an object/);

  const res2 = await handleMessage({ action: 'invalid_action' });
  assert.equal(res2.ok, false);
  assert.match(res2.error, /Unknown action/);

  // Test runMessageLoop with stream
  const input = new PassThrough();
  const output = new PassThrough();

  const loopPromise = runMessageLoop(input, output);

  // Send malformed JSON bytes
  const badBytes = Buffer.from('{not json}');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32LE(badBytes.length, 0);
  input.write(Buffer.concat([lenBuf, badBytes]));

  let outputBuffer = Buffer.alloc(0);
  output.on('data', (chunk) => {
    outputBuffer = Buffer.concat([outputBuffer, chunk]);
  });

  await new Promise((resolve) => setTimeout(resolve, 100));
  input.end();
  await loopPromise;

  const parsed = readNativeMessageFromBuffer(outputBuffer);
  assert.ok(parsed);
  assert.equal(parsed.message.ok, false);
  assert.match(parsed.message.error, /JSON parse error/);
});

test('11b. oversized native message is rejected gracefully', async () => {
  const input = new PassThrough();
  const output = new PassThrough();

  const loopPromise = runMessageLoop(input, output);

  // Send length > 10MB without matching JSON
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32LE(20 * 1024 * 1024, 0);
  input.write(lenBuf);

  let outputBuffer = Buffer.alloc(0);
  output.on('data', (chunk) => {
    outputBuffer = Buffer.concat([outputBuffer, chunk]);
  });

  await new Promise((resolve) => setTimeout(resolve, 100));
  input.end();
  await loopPromise;

  const parsed = readNativeMessageFromBuffer(outputBuffer);
  assert.ok(parsed);
  assert.equal(parsed.message.ok, false);
  assert.match(parsed.message.error, /Message size exceeds maximum limit/);
});

test('11c. leading BOM or whitespace is handled gracefully', async () => {
  const input = new PassThrough();
  const output = new PassThrough();

  const loopPromise = runMessageLoop(input, output);

  // Send leading BOM and CRLF before a valid message
  const bom = Buffer.from([0xef, 0xbb, 0xbf, 0x0d, 0x0a]);
  const msgBytes = Buffer.from(JSON.stringify({ action: 'unknown' }));
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32LE(msgBytes.length, 0);
  input.write(Buffer.concat([bom, lenBuf, msgBytes]));

  let outputBuffer = Buffer.alloc(0);
  output.on('data', (chunk) => {
    outputBuffer = Buffer.concat([outputBuffer, chunk]);
  });

  await new Promise((resolve) => setTimeout(resolve, 100));
  input.end();
  await loopPromise;

  const parsed = readNativeMessageFromBuffer(outputBuffer);
  assert.ok(parsed);
  assert.equal(parsed.message.ok, false);
  assert.match(parsed.message.error, /Unknown action: unknown/);
});

test('12. config path and launcher work independent of process cwd', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-12-'));
  const port = await getFreePort();
  const configPath = path.join(tempDir, 'custom-config.json');
  await writeFile(
    configPath,
    JSON.stringify({
      port,
      libraryPath: './papers',
      bridgeToken: 'cwd-independent-token',
    }),
    'utf8'
  );

  // Spawn launcher from an arbitrary cwd (os.tmpdir())
  const child = spawn(process.execPath, [launcherScript], {
    cwd: os.tmpdir(),
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      ACADEMIC_CLIPPER_CONFIG: configPath,
    },
  });

  let stdoutBuffer = Buffer.alloc(0);
  child.stdout.on('data', (chunk) => {
    stdoutBuffer = Buffer.concat([stdoutBuffer, chunk]);
  });

  sendNativeMessageToProcess(child, { action: 'wake' });

  // Wait for response
  const timeout = Date.now() + 10000;
  let parsed = null;
  while (Date.now() < timeout && !parsed) {
    parsed = readNativeMessageFromBuffer(stdoutBuffer);
    if (!parsed) await new Promise((r) => setTimeout(r, 100));
  }

  child.stdin.end();

  assert.ok(parsed, 'Expected response from launcher when invoked from foreign cwd');
  assert.equal(parsed.message.ok, true);
  assert.equal(parsed.message.port, port);
  assert.equal(parsed.message.token, 'cwd-independent-token');

  // Verify run file was written to config directory, NOT to foreign cwd
  const runFile = path.join(tempDir, '.bridge-run.json');
  assert.equal(existsSync(runFile), true);
  const runContent = JSON.parse(await readFile(runFile, 'utf8'));

  if (runContent?.pid) {
    try { process.kill(runContent.pid, 'SIGKILL'); } catch {}
  }
  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('13. Windows manifest generated with correct allowed origin and strict extension ID', () => {
  const validExtensionId = 'abcdefghijklmnopabcdefghijklmnop';
  const manifest = generateManifest('com.academic_clipper.bridge', 'C:\\app\\launcher.exe', validExtensionId);

  assert.equal(manifest.name, 'com.academic_clipper.bridge');
  assert.equal(manifest.path, 'C:\\app\\launcher.exe');
  assert.equal(manifest.type, 'stdio');
  assert.deepEqual(manifest.allowed_origins, [
    `chrome-extension://${validExtensionId}/`,
  ]);

  // Invalid IDs rejected
  assert.throws(() => generateManifest('name', 'path', ''), /extension ID is required/);
  assert.throws(() => generateManifest('name', 'path', null), /extension ID is required/);
  assert.throws(() => generateManifest('name', 'path', 'short-id'), /extension ID is required/);
  assert.throws(() => generateManifest('name', 'path', '12345678901234567890123456789012'), /extension ID is required/);
  assert.throws(() => generateManifest('name', 'path', 'ABCDEFGHIJKLMNOPABCDEFGHIJKLMNOP'), /extension ID is required/);
  assert.throws(() => generateManifest('name', 'path', 'abcdefghijklmnopqrstuvwxyz123456'), /extension ID is required/);
  assert.throws(() => generateManifest('name', 'path', 'a'.repeat(33)), /extension ID is required/);
});

test('13b. Windows installer fails if compiler is unavailable or compilation fails', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-install-fail-'));
  const validId = 'abcdefghijklmnopabcdefghijklmnop';

  try {
    // Missing compiler throws
    assert.throws(
      () => installWindowsHost(validId, {
        rootDir: tempDir,
        cscCompiler: 'C:\\definitely\\nonexistent\\csc.exe',
      }),
      /C# compiler \(csc\.exe\) not found/
    );

    // Failing compiler throws
    const srcDir = path.join(tempDir, 'src');
    await mkdir(srcDir, { recursive: true });
    await writeFile(path.join(srcDir, 'launcher.cs'), 'invalid c# syntax !!!', 'utf8');

    assert.throws(
      () => installWindowsHost(validId, {
        rootDir: tempDir,
        cscCompiler: process.execPath,
      }),
      /Failed to compile launcher.exe/
    );

    // skipCompile without existing launcher.exe throws
    assert.throws(
      () => installWindowsHost(validId, {
        rootDir: tempDir,
        skipCompile: true,
      }),
      /launcher\.exe not found/
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});

test('14. install/uninstall scripts properly quote registry and file paths', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic space-'));
  const rootWithSpaces = path.join(tempDir, 'Academic Clipper Project');
  const validId = 'abcdefghijklmnopabcdefghijklmnop';

  try {
    const srcDir = path.join(rootWithSpaces, 'src');
    await mkdir(srcDir, { recursive: true });
    await writeFile(path.join(srcDir, 'launcher.exe'), 'mock binary', 'utf8');

    const installResult = installWindowsHost(validId, {
      rootDir: rootWithSpaces,
      skipRegistry: true,
      skipCompile: true,
    });

    assert.ok(installResult.executedCommands.length >= 2);
    for (const cmd of installResult.executedCommands) {
      assert.match(
        cmd,
        /^REG ADD "HKCU\\Software\\(Google\\Chrome|Microsoft\\Edge)\\NativeMessagingHosts\\com\.academic_clipper\.bridge" \/ve \/t REG_SZ \/d ".+Academic Clipper Project.+com\.academic_clipper\.bridge\.json" \/f$/
      );
    }

    assert.equal(existsSync(installResult.manifestPath), true);
    assert.equal(existsSync(installResult.entryPath), true);
    assert.equal(installResult.entryPath.endsWith('launcher.exe'), true);

    const manifestContent = JSON.parse(await readFile(installResult.manifestPath, 'utf8'));
    assert.equal(manifestContent.path.endsWith('launcher.exe'), true);

    const uninstallResult = uninstallWindowsHost({
      rootDir: rootWithSpaces,
      skipRegistry: true,
    });

    assert.ok(uninstallResult.executedCommands.length >= 2);
    for (const cmd of uninstallResult.executedCommands) {
      assert.match(
        cmd,
        /^REG DELETE "HKCU\\Software\\(Google\\Chrome|Microsoft\\Edge)\\NativeMessagingHosts\\com\.academic_clipper\.bridge" \/f$/
      );
    }

    assert.equal(existsSync(installResult.manifestPath), false);
    assert.equal(existsSync(installResult.entryPath), false);

    const bat = generateBatContent('node');
    assert.match(bat, /"%~dp0launcher\.mjs"/);
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});

test('15. slow start does not reclaim lock while owner PID is alive', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-15-'));
  const lockFile = path.join(tempDir, '.bridge-startup.lock');
  const options = {
    startupLockFile: lockFile,
    hardStaleLockTimeoutMs: 50000,
  };

  // Process 1 (current process, which is alive) creates lock
  const lock1 = await acquireStartupLock(options);
  assert.equal(lock1.acquired, true);

  // Process 2 tries to acquire immediately
  const lock2 = await acquireStartupLock(options);
  assert.equal(lock2.acquired, false);

  // Process 2 tries after a simulated slow-start delay (where lock age is > 0 but < hardStaleTimeout)
  await new Promise((r) => setTimeout(r, 100));
  const lock3 = await acquireStartupLock(options);
  assert.equal(lock3.acquired, false, 'Lock must not be stolen while owner PID is alive');

  await lock1.release();
  assert.equal(existsSync(lockFile), false);
  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('16. alive owner PID lock is only reclaimed after hard stale threshold', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-16-'));
  const lockFile = path.join(tempDir, '.bridge-startup.lock');
  const shortHardStaleMs = 150;
  const options = {
    startupLockFile: lockFile,
    hardStaleLockTimeoutMs: shortHardStaleMs,
  };

  const lock1 = await acquireStartupLock(options);
  assert.equal(lock1.acquired, true);

  // Wait for hard stale threshold to elapse
  await new Promise((r) => setTimeout(r, shortHardStaleMs + 50));

  // Secondary caller should now be able to reclaim the stale lock
  const lock2 = await acquireStartupLock(options);
  assert.equal(lock2.acquired, true, 'Lock should be reclaimed after hard stale threshold');

  await lock2.release();
  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('17. dead owner PID lock is reclaimed immediately regardless of age', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-17-'));
  const lockFile = path.join(tempDir, '.bridge-startup.lock');
  const options = {
    startupLockFile: lockFile,
    hardStaleLockTimeoutMs: 60000,
  };

  // Write a lock with a dead PID and brand new createdAt (1ms ago)
  await writeFile(
    lockFile,
    JSON.stringify({ pid: 99999999, createdAt: Date.now() }),
    'utf8'
  );

  const lock = await acquireStartupLock(options);
  assert.equal(lock.acquired, true, 'Dead PID lock must be reclaimed immediately');

  await lock.release();
  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('17b. old owner release cannot delete replacement startup lock', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-17b-'));
  const lockFile = path.join(tempDir, '.bridge-startup.lock');
  const shortStaleMs = 100;

  // 1. Owner A acquires lock
  const lockA = await acquireStartupLock({
    startupLockFile: lockFile,
    ownerId: 'owner-A',
    hardStaleLockTimeoutMs: shortStaleMs,
  });
  assert.equal(lockA.acquired, true);
  assert.equal(lockA.ownerId, 'owner-A');

  // 2. Wait for hard stale threshold to elapse so lock becomes reclaimable
  await new Promise((r) => setTimeout(r, shortStaleMs + 50));

  // 3. Owner B acquires replacement lock
  const lockB = await acquireStartupLock({
    startupLockFile: lockFile,
    ownerId: 'owner-B',
    hardStaleLockTimeoutMs: shortStaleMs,
  });
  assert.equal(lockB.acquired, true);
  assert.equal(lockB.ownerId, 'owner-B');

  // 4. Owner A tries to release its old lock
  await lockA.release();

  // 5. Replacement lock MUST still exist and belong to owner B
  assert.equal(existsSync(lockFile), true, 'Replacement lock must NOT be deleted by old owner');
  const currentContent = JSON.parse(await readFile(lockFile, 'utf8'));
  assert.equal(currentContent.ownerId, 'owner-B', 'Lock must still be owned by owner-B');

  // 6. Owner B releases -> lock is deleted
  await lockB.release();
  assert.equal(existsSync(lockFile), false, 'Lock must be deleted when current owner releases');

  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('17c. fresh empty lock cannot be reclaimed', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-empty-'));
  const lockFile = path.join(tempDir, '.bridge-startup.lock');
  await writeFile(lockFile, '', 'utf8');

  const result = await acquireStartupLock({
    startupLockFile: lockFile,
    hardStaleLockTimeoutMs: 60000,
  });

  assert.equal(result.acquired, false, 'Fresh empty lock must NOT be reclaimed');
  assert.equal(existsSync(lockFile), true, 'Fresh empty lock file must remain untouched');

  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('17d. fresh partial JSON lock cannot be reclaimed', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-partial-'));
  const lockFile = path.join(tempDir, '.bridge-startup.lock');
  await writeFile(lockFile, '{"pid": 12345, "ownerId": "part', 'utf8');

  const result = await acquireStartupLock({
    startupLockFile: lockFile,
    hardStaleLockTimeoutMs: 60000,
  });

  assert.equal(result.acquired, false, 'Fresh partial lock must NOT be reclaimed');
  assert.equal(existsSync(lockFile), true, 'Fresh partial lock file must remain untouched');
  assert.equal(await readFile(lockFile, 'utf8'), '{"pid": 12345, "ownerId": "part');

  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('17e. sufficiently stale malformed lock can be reclaimed', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-stale-malformed-'));
  const lockFile = path.join(tempDir, '.bridge-startup.lock');
  await writeFile(lockFile, '{"broken-json-corrupt', 'utf8');

  const shortStale = 50;
  await new Promise((resolve) => setTimeout(resolve, 80));

  const result = await acquireStartupLock({
    startupLockFile: lockFile,
    hardStaleLockTimeoutMs: shortStale,
    ownerId: 'reclaiming-owner',
  });

  assert.equal(result.acquired, true, 'Sufficiently stale malformed lock MUST be reclaimed');
  assert.equal(result.ownerId, 'reclaiming-owner');
  assert.equal(existsSync(lockFile), true);
  const content = JSON.parse(await readFile(lockFile, 'utf8'));
  assert.equal(content.ownerId, 'reclaiming-owner');

  await result.release();
  assert.equal(existsSync(lockFile), false, 'Reclaimed lock released cleanly');

  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});

test('18. Windows smoke validation: manifest generation -> host entry execution -> launcher protocol -> bridge startup -> health', async (t) => {
  if (process.platform !== 'win32') {
    t.skip('Windows smoke validation requires win32 platform and csc compiler');
    return;
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'academic-launcher-smoke-'));
  const port = await getFreePort();
  const extId = 'abcdefghijklmnopabcdefghijklmnop';

  const configPath = path.join(tempDir, 'config.json');
  await writeFile(
    configPath,
    JSON.stringify({
      port,
      libraryPath: './papers',
      bridgeToken: 'smoke-token-secret',
    }),
    'utf8'
  );

  // Copy launcher.cs and launcher.mjs so csc compiles launcher.exe in tempDir/src
  const tempSrc = path.join(tempDir, 'src');
  await mkdir(tempSrc, { recursive: true });
  await copyFile(path.join(rootDir, 'src', 'launcher.cs'), path.join(tempSrc, 'launcher.cs'));
  await copyFile(path.join(rootDir, 'src', 'launcher.mjs'), path.join(tempSrc, 'launcher.mjs'));

  // Install host in temp directory
  const installResult = installWindowsHost(extId, {
    rootDir: tempDir,
    skipRegistry: true,
  });

  assert.ok(existsSync(installResult.manifestPath));
  assert.ok(existsSync(installResult.entryPath));
  assert.equal(installResult.entryPath.endsWith('.exe'), true, 'Host entry must strictly be .exe');

  const manifestData = JSON.parse(await readFile(installResult.manifestPath, 'utf8'));
  assert.equal(manifestData.path.endsWith('.exe'), true, 'Manifest path must strictly be .exe');

  // Directly execute the compiled .exe host entry point
  const proc = spawn(installResult.entryPath, [], {
    cwd: tempDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      ACADEMIC_CLIPPER_ROOT: rootDir,
      ACADEMIC_CLIPPER_CONFIG: configPath,
    },
  });

  let stdoutBuffer = Buffer.alloc(0);
  proc.stdout.on('data', (d) => {
    stdoutBuffer = Buffer.concat([stdoutBuffer, d]);
  });

  // Send native message { action: 'wake' }
  sendNativeMessageToProcess(proc, { action: 'wake' });

  // Read native message response
  const timeout = Date.now() + 10000;
  let parsed = null;
  while (Date.now() < timeout && !parsed) {
    parsed = readNativeMessageFromBuffer(stdoutBuffer);
    if (!parsed) await new Promise((r) => setTimeout(r, 100));
  }

  // Verify response received BEFORE closing stdin
  assert.ok(parsed, 'Expected native host response from compiled launcher.exe');
  assert.equal(parsed.message.ok, true, parsed?.message?.error || 'Expected response.ok to be true');
  assert.equal(parsed.message.port, port);
  assert.equal(parsed.message.token, 'smoke-token-secret');

  // Close stdin to signal native messaging host that Chrome has finished
  proc.stdin.end();

  // Wait for launcher.exe to exit completely
  await new Promise((resolve, reject) => {
    if (proc.exitCode !== null) return resolve();
    const done = () => resolve();
    proc.once('exit', done);
    proc.once('close', done);
    setTimeout(() => reject(new Error('launcher.exe did not exit within timeout')), 5000);
  });
  assert.equal(proc.exitCode, 0, 'launcher.exe must exit cleanly with code 0');
  proc.stdout.destroy();
  proc.stderr.destroy();

  // Verify health endpoint directly AFTER launcher.exe has exited, proving bridge survives
  const health = await checkBridgeHealth(`http://127.0.0.1:${port}`);
  assert.equal(health.ok, true, health.error);
  assert.equal(health.payload.service, 'academic-clipper-bridge');

  // Verify run file persists with expected details
  const runFile = path.join(tempDir, '.bridge-run.json');
  assert.ok(existsSync(runFile), 'Bridge run file must persist after launcher.exe exits');
  const runData = JSON.parse(await readFile(runFile, 'utf8'));
  assert.equal(runData.port, port);
  assert.equal(runData.bridgeToken, 'smoke-token-secret');
  assert.equal(runData.instanceId, health.payload.instanceId);
  assert.equal(runData.pid, health.payload.pid);

  // Clean up bridge process
  if (runData?.pid) {
    try { process.kill(runData.pid, 'SIGKILL'); } catch {}
  }

  uninstallWindowsHost({ rootDir: tempDir, skipRegistry: true });
  await rm(tempDir, { recursive: true, force: true }).catch(() => {});
});
