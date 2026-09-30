#!/usr/bin/env node
// Assembles the Windows release artifact: Academic-clipper-v<version>-windows.zip
//
// Layout of the artifact (and of the installed application, which mirrors it):
//   install.ps1 / uninstall.ps1 / QUICKSTART.md / release-manifest.json
//   src/            bridge + launcher sources (PR14 runtime, unchanged)
//   node_modules/   production dependencies
//   runtime/node.exe  bundled Node.js runtime
//   extension/      built browser extension (load unpacked)
//   config.template.json
import { execFileSync, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, readdir, rm, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildExtension } from '../src/build.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

export const REQUIRED_RELEASE_FILES = [
  'install.ps1',
  'uninstall.ps1',
  'QUICKSTART.md',
  'release-manifest.json',
  'config.template.json',
  'package.json',
  'runtime/node.exe',
  'extension/manifest.json',
  'src/bridge.mjs',
  'src/launcher.mjs',
  'src/launcher.cs',
  'src/version.mjs',
];

export function releaseName(version) {
  return `Academic-clipper-v${version}-windows`;
}

async function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listFiles(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out.sort();
}

export async function verifyReleaseDir(dir) {
  const missing = REQUIRED_RELEASE_FILES.filter((f) => !existsSync(path.join(dir, f)));
  if (missing.length > 0) throw new Error(`Release is missing required files: ${missing.join(', ')}`);
}

export async function stageRelease(options = {}) {
  const outDir = path.resolve(options.outDir || path.join(root, 'dist', 'release'));
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const version = pkg.version;
  const name = releaseName(version);
  const stage = path.join(outDir, name);
  const nodeExe = options.nodeExe || process.execPath;

  if (!existsSync(nodeExe)) throw new Error(`Node runtime not found: ${nodeExe}`);

  await rm(stage, { recursive: true, force: true });
  await mkdir(stage, { recursive: true });

  await cp(path.join(root, 'src'), path.join(stage, 'src'), { recursive: true });
  await buildExtension(path.join(stage, 'extension'));
  await mkdir(path.join(stage, 'runtime'), { recursive: true });
  await copyFile(nodeExe, path.join(stage, 'runtime', 'node.exe'));

  await copyFile(path.join(root, 'package.json'), path.join(stage, 'package.json'));
  await copyFile(path.join(root, 'package-lock.json'), path.join(stage, 'package-lock.json'));
  await copyFile(path.join(root, 'config.example.json'), path.join(stage, 'config.template.json'));
  await copyFile(path.join(root, 'release', 'install.ps1'), path.join(stage, 'install.ps1'));
  await copyFile(path.join(root, 'release', 'uninstall.ps1'), path.join(stage, 'uninstall.ps1'));
  await copyFile(path.join(root, 'release', 'QUICKSTART.md'), path.join(stage, 'QUICKSTART.md'));

  if (!options.skipDeps) {
    execSync('npm ci --omit=dev --ignore-scripts --no-audit --no-fund', { cwd: stage, stdio: 'inherit' });
  }

  const manifest = {
    name: 'academic-clipper',
    version,
    platform: 'win32-x64',
    builtAt: new Date().toISOString(),
    nodeVersion: process.version,
    nativeHostName: 'com.academic_clipper.bridge',
    files: [],
  };
  await writeFile(path.join(stage, 'release-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  await verifyReleaseDir(stage);
  manifest.files = (await listFiles(stage)).filter((f) => !f.startsWith('node_modules/'));
  await writeFile(path.join(stage, 'release-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  return { stage, name, version, outDir };
}

export function zipRelease({ stage, name, outDir }) {
  const zipPath = path.join(outDir, `${name}.zip`);
  // bsdtar ships with Windows 10+ and writes standard forward-slash zip entries.
  const tar = process.platform === 'win32'
    ? path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe')
    : 'tar';
  execFileSync(tar, ['-a', '-c', '-f', zipPath, '-C', path.dirname(stage), name], { stdio: 'inherit' });
  return zipPath;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const options = { skipDeps: args.includes('--skip-deps') };
  const nodeIdx = args.indexOf('--node-exe');
  if (nodeIdx >= 0) options.nodeExe = args[nodeIdx + 1];
  const res = await stageRelease(options);
  console.log(`Staged ${res.stage}`);
  if (!args.includes('--no-zip')) {
    const zip = zipRelease(res);
    console.log(`Created ${zip}`);
  }
}
