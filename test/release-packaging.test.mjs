import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { REQUIRED_RELEASE_FILES, releaseName, stageRelease, verifyReleaseDir } from '../scripts/package-release.mjs';

const isWindows = process.platform === 'win32';

async function stage() {
  const outDir = await mkdtemp(path.join(os.tmpdir(), 'ac-release-'));
  const res = await stageRelease({ outDir, skipDeps: true });
  return { outDir, ...res };
}

test('stageRelease produces the expected release layout and manifest', async () => {
  const { outDir, stage: dir, version } = await stage();
  try {
    assert.equal(path.basename(dir), releaseName(version));
    assert.equal(releaseName('0.3.0'), 'Academic-clipper-v0.3.0-windows');
    await verifyReleaseDir(dir);
    for (const f of REQUIRED_RELEASE_FILES) assert.ok(existsSync(path.join(dir, f)), f);
    const manifest = JSON.parse(await readFile(path.join(dir, 'release-manifest.json'), 'utf8'));
    assert.equal(manifest.version, version);
    assert.equal(manifest.nativeHostName, 'com.academic_clipper.bridge');
    assert.ok(manifest.files.includes('install.ps1'));
    const template = JSON.parse(await readFile(path.join(dir, 'config.template.json'), 'utf8'));
    assert.equal(template.bridgeToken, '');
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
});

test('verifyReleaseDir reports missing files', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'ac-empty-'));
  try {
    await assert.rejects(() => verifyReleaseDir(dir), /missing required files/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

function ps(script, args) {
  return spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, ...args], { encoding: 'utf8' });
}

test('install.ps1 and uninstall.ps1 are syntactically valid', { skip: !isWindows }, () => {
  for (const name of ['install.ps1', 'uninstall.ps1']) {
    const file = path.resolve('release', name);
    const r = spawnSync('powershell.exe', ['-NoProfile', '-Command',
      `$e=$null;[void][System.Management.Automation.Language.Parser]::ParseFile('${file}',[ref]$null,[ref]$e);if($e){$e|%{$_.Message};exit 1}`], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stdout + r.stderr);
  }
});

test('install/upgrade/uninstall lifecycle is idempotent and preserves user data', { skip: !isWindows, timeout: 120000 }, async () => {
  const { outDir, stage: dir } = await stage();
  const sandbox = await mkdtemp(path.join(os.tmpdir(), 'ac-install-'));
  const installDir = path.join(sandbox, 'Academic-clipper');
  const library = path.join(sandbox, 'papers');
  const regBase = `HKCU:\\Software\\AcademicClipperTest${process.pid}`;
  const hostKey = 'Microsoft\\Edge\\NativeMessagingHosts\\com.academic_clipper.bridge';
  const id = 'abcdefghijklmnopabcdefghijklmnop';
  const common = ['-InstallDir', installDir, '-RegistryBase', regBase];
  const regExists = (sub) => spawnSync('reg.exe', ['query', `${regBase.replace('HKCU:', 'HKCU')}\\${sub}`]).status === 0;
  try {
    // Fresh install without ID: files + config, host pending.
    let r = ps(path.join(dir, 'install.ps1'), [...common, '-LibraryPath', library]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    let state = JSON.parse((await readFile(path.join(installDir, 'install-state.json'), 'utf8')).replace(/^﻿/, ''));
    assert.equal(state.nativeHost.status, 'pending-extension-id');
    assert.ok(existsSync(path.join(installDir, 'runtime', 'node.exe')));
    assert.ok(existsSync(path.join(installDir, 'src', 'launcher.exe')));

    // Registration with ID.
    r = ps(path.join(dir, 'install.ps1'), [...common, '-ExtensionId', id]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    state = JSON.parse(await readFile(path.join(installDir, 'install-state.json'), 'utf8'));
    assert.equal(state.nativeHost.status, 'registered');
    const firstInstalledAt = state.installedAt;
    assert.ok(regExists(hostKey));
    const hostManifest = JSON.parse(await readFile(path.join(installDir, 'com.academic_clipper.bridge.json'), 'utf8'));
    assert.deepEqual(hostManifest.allowed_origins, [`chrome-extension://${id}/`]);

    // User edits config, then upgrade: config preserved, ID reused, installedAt kept.
    const cfgPath = path.join(installDir, 'config.json');
    const cfg = JSON.parse(await readFile(cfgPath, 'utf8'));
    assert.equal(cfg.libraryPath, library);
    cfg.citationStyle = 'links';
    await writeFile(cfgPath, JSON.stringify(cfg), 'utf8');
    r = ps(path.join(dir, 'install.ps1'), common);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    state = JSON.parse(await readFile(path.join(installDir, 'install-state.json'), 'utf8'));
    assert.equal(state.installedAt, firstInstalledAt);
    assert.equal(state.nativeHost.status, 'registered');
    assert.equal(state.extension.id, id);
    assert.equal(JSON.parse(await readFile(cfgPath, 'utf8')).citationStyle, 'links');

    // Invalid ID is rejected.
    r = ps(path.join(dir, 'install.ps1'), [...common, '-ExtensionId', 'nope']);
    assert.equal(r.status, 1);

    // Uninstall keeps papers and config.
    await mkdir(library, { recursive: true });
    await writeFile(path.join(library, 'keep.md'), 'paper', 'utf8');
    r = ps(path.join(dir, 'uninstall.ps1'), common);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.ok(!existsSync(path.join(installDir, 'runtime')));
    assert.ok(!existsSync(path.join(installDir, 'install-state.json')));
    assert.ok(!existsSync(path.join(installDir, 'com.academic_clipper.bridge.json')));
    assert.ok(!regExists(hostKey));
    assert.ok(existsSync(cfgPath));
    assert.ok(existsSync(path.join(library, 'keep.md')));

    r = ps(path.join(dir, 'uninstall.ps1'), [...common, '-RemoveConfig']);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.ok(!existsSync(installDir));
  } finally {
    spawnSync('powershell.exe', ['-NoProfile', '-Command', `Remove-Item -Recurse -Force '${regBase}' -ErrorAction SilentlyContinue`]);
    await rm(sandbox, { recursive: true, force: true });
    await rm(outDir, { recursive: true, force: true });
  }
});
