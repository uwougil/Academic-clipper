#!/usr/bin/env node
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { DEFAULT_HOST_NAME, getRegistryKeys } from './install-windows.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function uninstallWindowsHost(options = {}) {
  const rootDir = options.rootDir || path.resolve(__dirname, '..');
  const hostName = options.hostName || DEFAULT_HOST_NAME;
  const regKeys = getRegistryKeys(hostName);
  const executedCommands = [];

  for (const regKey of regKeys) {
    const cmd = `REG DELETE "${regKey}" /f`;
    executedCommands.push(cmd);
    if (process.platform === 'win32' && !options.skipRegistry) {
      try {
        execSync(cmd, { stdio: 'inherit' });
      } catch {
        // Key might not exist
      }
    }
  }

  const manifestPath = path.resolve(rootDir, `${hostName}.json`);
  const srcDir = path.resolve(rootDir, 'src');
  const filesToDelete = [
    manifestPath,
    path.resolve(srcDir, 'launcher.bat'),
    path.resolve(srcDir, 'launcher.cmd'),
    path.resolve(srcDir, 'launcher.exe'),
    path.resolve(srcDir, '.node-path.txt'),
  ];

  for (const file of filesToDelete) {
    try {
      rmSync(file, { force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      // File may already be removed or held temporarily
    }
  }

  return {
    deletedFiles: filesToDelete,
    executedCommands,
    regKeys,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    uninstallWindowsHost();
    console.log('Successfully uninstalled Windows Native Messaging host.');
  } catch (err) {
    console.error('Uninstallation failed:', err.message);
    process.exit(1);
  }
}
