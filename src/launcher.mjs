#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { open, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function resolveLauncherPaths(options = {}) {
  const rootDir = options.rootDir
    ? path.resolve(options.rootDir)
    : (process.env.ACADEMIC_CLIPPER_ROOT
        ? path.resolve(process.env.ACADEMIC_CLIPPER_ROOT)
        : path.resolve(__dirname, '..'));
  const configPath = options.configPath
    ? path.resolve(options.configPath)
    : (process.env.ACADEMIC_CLIPPER_CONFIG
        ? path.resolve(process.env.ACADEMIC_CLIPPER_CONFIG)
        : path.resolve(rootDir, 'config.json'));
  const configDir = path.dirname(configPath);
  const runFile = options.runFile || path.resolve(configDir, '.bridge-run.json');
  const startupLockFile = options.startupLockFile || path.resolve(configDir, '.bridge-startup.lock');
  const bridgeScript = options.bridgeScript || path.resolve(rootDir, 'src', 'bridge.mjs');
  return {
    rootDir,
    configPath,
    configDir,
    runFile,
    startupLockFile,
    bridgeScript,
  };
}

export async function checkBridgeHealth(endpoint, expectedInstanceId = null, timeoutMs = 1500) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${endpoint}/health`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    clearTimeout(timer);
    if (!res.ok) {
      return { ok: false, error: `Health check returned HTTP ${res.status}` };
    }
    const payload = await res.json();
    if (!payload || payload.ok !== true || payload.service !== 'academic-clipper-bridge') {
      return { ok: false, error: 'Health endpoint identity mismatch' };
    }
    if (expectedInstanceId && payload.instanceId !== expectedInstanceId) {
      return { ok: false, error: `Instance ID mismatch: expected ${expectedInstanceId}, got ${payload.instanceId}` };
    }
    return { ok: true, payload };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function isBridgeRunning(options = {}) {
  const paths = resolveLauncherPaths(options);
  let data;
  try {
    const content = await readFile(paths.runFile, 'utf8');
    data = JSON.parse(content);
  } catch {
    return null;
  }

  if (!data || typeof data !== 'object' || !data.pid || !data.port || !data.bridgeToken || !data.instanceId) {
    await rm(paths.runFile, { force: true }).catch(() => {});
    return null;
  }

  let isAlive = false;
  try {
    process.kill(data.pid, 0);
    isAlive = true;
  } catch (err) {
    if (err.code === 'ESRCH') {
      isAlive = false;
    } else {
      isAlive = true;
    }
  }

  if (!isAlive) {
    await rm(paths.runFile, { force: true }).catch(() => {});
    return null;
  }

  const endpoint = `http://127.0.0.1:${data.port}`;
  const health = await checkBridgeHealth(endpoint, data.instanceId, options.healthTimeoutMs || 1500);
  if (!health.ok) {
    await rm(paths.runFile, { force: true }).catch(() => {});
    return null;
  }

  return {
    pid: data.pid,
    port: data.port,
    bridgeToken: data.bridgeToken,
    instanceId: data.instanceId,
    endpoint,
  };
}

export const DEFAULT_STARTUP_TIMEOUT_MS = 10000;
export const DEFAULT_HARD_STALE_LOCK_TIMEOUT_MS = 60000;

export async function acquireStartupLock(options = {}) {
  const paths = resolveLauncherPaths(options);
  const lockFile = paths.startupLockFile;
  const hardStaleTimeout = options.hardStaleLockTimeoutMs || options.staleLockTimeoutMs || DEFAULT_HARD_STALE_LOCK_TIMEOUT_MS;
  const myOwnerId = options.ownerId || randomUUID();

  async function tryCreate() {
    try {
      const handle = await open(lockFile, 'wx');
      const payload = JSON.stringify({
        pid: process.pid,
        ownerId: myOwnerId,
        createdAt: Date.now(),
      });
      await handle.writeFile(payload, 'utf8');
      await handle.close();
      return true;
    } catch (err) {
      if (err.code === 'EEXIST') return false;
      throw err;
    }
  }

  const release = async () => {
    try {
      const raw = await readFile(lockFile, 'utf8');
      const lockInfo = JSON.parse(raw);
      if (lockInfo && lockInfo.ownerId === myOwnerId) {
        await rm(lockFile, { force: true }).catch(() => {});
      }
    } catch {
      // Ignore missing or unparseable lock file
    }
  };

  if (await tryCreate()) {
    return {
      acquired: true,
      ownerId: myOwnerId,
      release,
    };
  }

  try {
    const raw = await readFile(lockFile, 'utf8');
    const lockInfo = JSON.parse(raw);
    let isOwnerAlive = false;
    if (lockInfo && lockInfo.pid) {
      try {
        process.kill(lockInfo.pid, 0);
        isOwnerAlive = true;
      } catch (e) {
        if (e.code === 'ESRCH') isOwnerAlive = false;
        else isOwnerAlive = true;
      }
    }
    const isAgeStale = lockInfo && lockInfo.createdAt && (Date.now() - lockInfo.createdAt > hardStaleTimeout);
    const isStale = !isOwnerAlive || isAgeStale;

    if (isStale) {
      try {
        const currentRaw = await readFile(lockFile, 'utf8');
        const currentInfo = JSON.parse(currentRaw);
        if (currentInfo && currentInfo.ownerId === lockInfo.ownerId) {
          await rm(lockFile, { force: true }).catch(() => {});
        }
      } catch {
        const stats = await stat(lockFile).catch(() => null);
        if (stats) {
          const fileAge = Date.now() - Math.max(stats.mtimeMs || 0, stats.birthtimeMs || 0);
          if (fileAge >= hardStaleTimeout) {
            await rm(lockFile, { force: true }).catch(() => {});
          }
        }
      }
      if (await tryCreate()) {
        return {
          acquired: true,
          ownerId: myOwnerId,
          release,
        };
      }
    }
  } catch {
    const stats = await stat(lockFile).catch(() => null);
    if (!stats) {
      if (await tryCreate()) {
        return {
          acquired: true,
          ownerId: myOwnerId,
          release,
        };
      }
    } else {
      const fileAge = Date.now() - Math.max(stats.mtimeMs || 0, stats.birthtimeMs || 0);
      if (fileAge >= hardStaleTimeout) {
        await rm(lockFile, { force: true }).catch(() => {});
        if (await tryCreate()) {
          return {
            acquired: true,
            ownerId: myOwnerId,
            release,
          };
        }
      }
    }
  }

  return {
    acquired: false,
    release: async () => {},
  };
}

export async function wakeBridge(options = {}) {
  const paths = resolveLauncherPaths(options);
  const startupTimeout = options.startupTimeoutMs || 10000;

  let running = await isBridgeRunning(options);
  if (running) {
    return {
      ok: true,
      port: running.port,
      token: running.bridgeToken,
      endpoint: running.endpoint,
      instanceId: running.instanceId,
      reused: true,
    };
  }

  const lock = await acquireStartupLock(options);
  if (lock.acquired) {
    try {
      running = await isBridgeRunning(options);
      if (running) {
        return {
          ok: true,
          port: running.port,
          token: running.bridgeToken,
          endpoint: running.endpoint,
          instanceId: running.instanceId,
          reused: true,
        };
      }

      const nodeBin = options.nodeBin || process.execPath;
      const child = spawn(nodeBin, [paths.bridgeScript, '--config', paths.configPath], {
        cwd: paths.rootDir,
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
        env: {
          ...process.env,
          ...(options.env || {}),
        },
      });

      let spawnError = null;
      child.on('error', (err) => {
        spawnError = err;
      });

      child.unref();

      const start = Date.now();
      while (Date.now() - start < startupTimeout) {
        if (spawnError) {
          throw new Error(`Failed to spawn bridge process: ${spawnError.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        running = await isBridgeRunning(options);
        if (running) {
          return {
            ok: true,
            port: running.port,
            token: running.bridgeToken,
            endpoint: running.endpoint,
            instanceId: running.instanceId,
            reused: false,
          };
        }
      }

      throw new Error(`Startup timeout: bridge failed to become ready within ${startupTimeout}ms`);
    } finally {
      await lock.release();
    }
  } else {
    const start = Date.now();
    while (Date.now() - start < startupTimeout) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      running = await isBridgeRunning(options);
      if (running) {
        return {
          ok: true,
          port: running.port,
          token: running.bridgeToken,
          endpoint: running.endpoint,
          instanceId: running.instanceId,
          reused: true,
        };
      }
    }

    throw new Error(`Startup timeout waiting for concurrent bridge startup within ${startupTimeout}ms`);
  }
}

export async function handleMessage(msg, options = {}) {
  if (!msg || typeof msg !== 'object') {
    return { ok: false, error: 'Message must be an object' };
  }
  if (msg.action === 'wake') {
    try {
      const res = await wakeBridge(options);
      return {
        ok: true,
        port: res.port,
        token: res.token,
      };
    } catch (err) {
      return {
        ok: false,
        error: err.message,
      };
    }
  }
  return {
    ok: false,
    error: `Unknown action: ${String(msg.action)}`,
  };
}

export function writeNativeMessage(stream, msg) {
  const payload = Buffer.from(JSON.stringify(msg), 'utf8');
  const len = Buffer.alloc(4);
  len.writeUInt32LE(payload.length, 0);
  stream.write(Buffer.concat([len, payload]));
}

export async function runMessageLoop(inputStream = process.stdin, outputStream = process.stdout, options = {}) {
  let buffer = Buffer.alloc(0);
  for await (const chunk of inputStream) {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 4) {
      let msgLen = buffer.readUInt32LE(0);
      const isHeaderInvalid =
        msgLen > 10 * 1024 * 1024 ||
        (buffer.length >= 5 && buffer[4] !== 0x7b && buffer[4] !== 0x5b);

      if (isHeaderInvalid) {
        // Strip potential leading UTF-8 BOM
        if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
          buffer = buffer.subarray(3);
          continue;
        }
        // Strip potential leading UTF-16 BOM
        if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
          buffer = buffer.subarray(2);
          continue;
        }
        // Strip potential leading CRLF
        if (buffer.length >= 2 && buffer[0] === 0x0d && buffer[1] === 0x0a) {
          buffer = buffer.subarray(2);
          continue;
        }
        // Strip potential leading whitespace or lone newline
        if (buffer[0] === 0x0d || buffer[0] === 0x0a || buffer[0] === 0x20 || buffer[0] === 0x09) {
          buffer = buffer.subarray(1);
          continue;
        }

        // Attempt resyncing by searching for the first occurrence of a valid length-prefixed JSON object
        let resynced = false;
        for (let i = 1; i <= buffer.length - 5; i++) {
          const candidateLen = buffer.readUInt32LE(i);
          if (candidateLen > 0 && candidateLen <= 10 * 1024 * 1024) {
            if (buffer[i + 4] === 0x7b || buffer[i + 4] === 0x5b) {
              buffer = buffer.subarray(i);
              msgLen = candidateLen;
              resynced = true;
              break;
            }
          }
        }
        if (!resynced) {
          if (msgLen > 10 * 1024 * 1024) {
            writeNativeMessage(outputStream, {
              ok: false,
              error: `Message size exceeds maximum limit: ${msgLen} (bufferLen=${buffer.length}, hex=${buffer.subarray(0, 32).toString('hex')})`,
            });
            return;
          }
          if (buffer.length < 5) {
            break;
          }
          buffer = buffer.subarray(1);
          continue;
        }
      }
      if (buffer.length < 4 + msgLen) {
        break;
      }
      const msgBytes = buffer.subarray(4, 4 + msgLen);
      buffer = buffer.subarray(4 + msgLen);
      let parsed;
      try {
        parsed = JSON.parse(msgBytes.toString('utf8'));
      } catch (err) {
        writeNativeMessage(outputStream, { ok: false, error: `JSON parse error: ${err.message}` });
        continue;
      }
      const response = await handleMessage(parsed, options);
      writeNativeMessage(outputStream, response);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runMessageLoop()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal launcher error:', err);
      process.exit(1);
    });
}
