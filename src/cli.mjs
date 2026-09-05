#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { clipNature, writePaper } from './clip.mjs';
import { ACADEMIC_CLIPPER_USER_AGENT } from './version.mjs';

function argument(name, fallback = '') {
  const index = process.argv.indexOf(name);
  if (index < 0) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${name}.`);
  return value;
}

const url = argument('--url');
const output = argument('--output', './papers');
const saveDebug = process.argv.includes('--debug');
const downloadFigures = !process.argv.includes('--no-download-figures');
const citationStyle = argument('--citation-style', 'markdown');

if (!url) {
  console.error('Usage: node src/cli.mjs --url <Nature article URL> [--output ./papers] [--debug] [--download-figures|--no-download-figures] [--citation-style markdown|quarto]');
  process.exit(1);
}

const response = await fetch(url, { headers: { 'user-agent': ACADEMIC_CLIPPER_USER_AGENT } });
if (!response.ok) throw new Error(`Unable to fetch ${url}: HTTP ${response.status}`);
const html = await response.text();
const result = await clipNature({ html, url, citationStyle });
const saved = await writePaper(result, { libraryPath: path.resolve(output), saveDebug, downloadFigures });
await writeFile(path.resolve(output, 'last-run-debug.json'), `${JSON.stringify(saved.debug, null, 2)}\n`, 'utf8');

console.log(`Saved: ${saved.relativePath}`);
console.log(JSON.stringify(saved.debug, null, 2));
