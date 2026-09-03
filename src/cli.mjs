#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { clipNature, writePaper } from './clip.mjs';

function argument(name, fallback = '') {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const url = argument('--url');
const output = argument('--output', './papers');
const saveDebug = process.argv.includes('--debug');
const downloadFigures = process.argv.includes('--download-figures');

if (!url) {
  console.error('Usage: node src/cli.mjs --url <Nature article URL> [--output ./papers] [--debug] [--download-figures]');
  process.exit(1);
}

const response = await fetch(url, { headers: { 'user-agent': 'academic-clipper/0.1 (research prototype)' } });
if (!response.ok) throw new Error(`Unable to fetch ${url}: HTTP ${response.status}`);
const html = await response.text();
const result = await clipNature({ html, url });
const saved = await writePaper(result, { libraryPath: path.resolve(output), saveDebug, downloadFigures });
await writeFile(path.resolve(output, 'last-run-debug.json'), `${JSON.stringify(saved.debug, null, 2)}\n`, 'utf8');

console.log(`Saved: ${saved.relativePath}`);
console.log(JSON.stringify(saved.debug, null, 2));
