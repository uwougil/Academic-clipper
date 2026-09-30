#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_HOST_NAME = 'com.academic_clipper.bridge';
export const CHROMIUM_EXTENSION_ID_REGEX = /^[a-p]{32}$/;

export function findCscCompiler() {
  const root = process.env.SystemRoot || 'C:\\Windows';
  const candidates = [
    path.join(root, 'Microsoft.NET', 'Framework64', 'v4.0.30319', 'csc.exe'),
    path.join(root, 'Microsoft.NET', 'Framework', 'v4.0.30319', 'csc.exe'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

export function generateManifest(hostName, entryPath, extensionId) {
  if (!extensionId || typeof extensionId !== 'string' || !CHROMIUM_EXTENSION_ID_REGEX.test(extensionId)) {
    throw new Error('Valid extension ID is required (must be 32 lowercase characters between a and p)');
  }
  return {
    name: hostName,
    description: 'Academic Clipper Native Messaging Host',
    path: entryPath,
    type: 'stdio',
    allowed_origins: [
      `chrome-extension://${extensionId}/`,
    ],
  };
}

export function generateBatContent(nodePath = 'node') {
  return `@echo off\r\n"${nodePath}" "%~dp0launcher.mjs" %*\r\n`;
}

export function getRegistryKeys(hostName = DEFAULT_HOST_NAME) {
  return [
    `HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${hostName}`,
    `HKCU\\Software\\Microsoft\\Edge\\NativeMessagingHosts\\${hostName}`,
  ];
}

export function installWindowsHost(extensionId, options = {}) {
  if (!extensionId || typeof extensionId !== 'string' || !CHROMIUM_EXTENSION_ID_REGEX.test(extensionId)) {
    throw new Error('Valid extension ID is required (must be 32 lowercase characters between a and p)');
  }

  const rootDir = options.rootDir || path.resolve(__dirname, '..');
  const hostName = options.hostName || DEFAULT_HOST_NAME;
  const srcDir = path.resolve(rootDir, 'src');
  const nodePath = options.nodePath || process.execPath;

  mkdirSync(srcDir, { recursive: true });

  // Record node executable path for native host to find
  const nodePathFile = path.resolve(srcDir, '.node-path.txt');
  writeFileSync(nodePathFile, nodePath, 'utf8');

  // Generate batch/cmd dev/debug helpers (not used in production manifest)
  const batPath = path.resolve(srcDir, 'launcher.bat');
  const cmdPath = path.resolve(srcDir, 'launcher.cmd');
  const scriptContent = generateBatContent(nodePath);
  writeFileSync(batPath, scriptContent, 'utf8');
  writeFileSync(cmdPath, scriptContent, 'utf8');

  // Build launcher.exe - production manifest must strictly point to .exe
  const exePath = path.resolve(srcDir, 'launcher.exe');
  const csSource = path.resolve(srcDir, 'launcher.cs');
  const cscCompiler = options.cscCompiler !== undefined ? options.cscCompiler : findCscCompiler();

  if (options.skipCompile) {
    if (!existsSync(exePath)) {
      throw new Error(`launcher.exe not found at ${exePath} with skipCompile enabled`);
    }
  } else {
    if (!cscCompiler || !existsSync(cscCompiler)) {
      throw new Error(`C# compiler (csc.exe) not found at "${cscCompiler}". Required to build ${exePath} for Native Messaging.`);
    }
    if (!existsSync(csSource)) {
      throw new Error(`C# source file launcher.cs not found at ${csSource}`);
    }
    try {
      execSync(`"${cscCompiler}" /nologo /target:winexe /out:"${exePath}" "${csSource}"`, {
        stdio: 'pipe',
      });
    } catch (compileErr) {
      throw new Error(`Failed to compile launcher.exe: ${compileErr.message}`);
    }
    if (!existsSync(exePath)) {
      throw new Error(`Compilation completed but launcher.exe was not created at ${exePath}`);
    }
  }

  const entryPath = exePath;
  const manifestPath = path.resolve(rootDir, `${hostName}.json`);
  mkdirSync(path.dirname(manifestPath), { recursive: true });

  const manifest = generateManifest(hostName, entryPath, extensionId);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  const regKeys = getRegistryKeys(hostName);
  const executedCommands = [];

  for (const regKey of regKeys) {
    const cmd = `REG ADD "${regKey}" /ve /t REG_SZ /d "${manifestPath}" /f`;
    executedCommands.push(cmd);
    if (process.platform === 'win32' && !options.skipRegistry) {
      execSync(cmd, { stdio: 'inherit' });
    }
  }

  return {
    manifestPath,
    entryPath,
    batPath,
    cmdPath,
    exePath,
    executedCommands,
    regKeys,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const extensionId = process.argv[2];
  if (!extensionId) {
    console.error('Usage: node scripts/install-windows.mjs <extension-id>');
    process.exit(1);
  }
  if (!CHROMIUM_EXTENSION_ID_REGEX.test(extensionId)) {
    console.error('Invalid extension ID: must be 32 lowercase characters between a and p.');
    process.exit(1);
  }
  try {
    const res = installWindowsHost(extensionId);
    console.log(`Successfully registered Native Messaging host for extension ${extensionId}:`);
    console.log(`Host entry point: ${res.entryPath}`);
    for (const key of res.regKeys) {
      console.log(` - ${key}`);
    }
  } catch (err) {
    console.error('Installation failed:', err.message);
    process.exit(1);
  }
}
