#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { clipNature, writePaper } from './clip.mjs';
import { isNatureUrl } from './adapters/nature.mjs';
import { ACADEMIC_CLIPPER_USER_AGENT } from './version.mjs';

const USAGE = 'Usage: node src/cli.mjs --url <Nature article URL> [--output ./papers] [--debug] [--download-figures|--no-download-figures] [--citation-style markdown|links|quarto]';

class CliUsageError extends Error {}

function argument(name, fallback = '') {
  const index = process.argv.indexOf(name);
  if (index < 0) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new CliUsageError(`Missing value for ${name}.\n${USAGE}`);
  return value;
}

async function main() {
  const url = argument('--url');
  const output = argument('--output', './papers');
  const saveDebug = process.argv.includes('--debug');
  const downloadFigures = !process.argv.includes('--no-download-figures');
  const citationStyle = argument('--citation-style', 'markdown');

  if (!url) throw new CliUsageError(`Missing value for --url.\n${USAGE}`);
  try {
    new URL(url);
  } catch {
    throw new CliUsageError(`Invalid URL for --url: ${url}.\n${USAGE}`);
  }
  if (!isNatureUrl(url)) throw new CliUsageError('Unsupported site: only Nature article URLs are supported.');
  if (!['markdown', 'links', 'quarto'].includes(citationStyle)) {
    throw new CliUsageError(`Invalid --citation-style ${citationStyle}; expected markdown, links, or quarto.`);
  }

  let response;
  try {
    response = await fetch(url, { headers: { 'user-agent': ACADEMIC_CLIPPER_USER_AGENT } });
  } catch (error) {
    throw new Error(`Unable to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!response.ok) throw new Error(`Unable to fetch ${url}: HTTP ${response.status}`);
  const html = await response.text();
  const result = await clipNature({ html, url, citationStyle });
  const saved = await writePaper(result, { libraryPath: path.resolve(output), saveDebug, downloadFigures });
  await writeFile(path.resolve(output, 'last-run-debug.json'), `${JSON.stringify(saved.debug, null, 2)}\n`, 'utf8');

  console.log(`Saved: ${saved.relativePath}`);
  console.log(JSON.stringify(saved.debug, null, 2));
}

try {
  await main();
} catch (error) {
  console.error(`${error instanceof CliUsageError ? 'Usage error' : 'Error'}: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
