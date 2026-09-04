#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { validateMathDelimiters } from './validators/math-delimiters.mjs';

function argument(name, fallback = '') {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const file = argument('--file', './papers/s41586-026-10401-1/index.md');
try {
  const markdown = await readFile(file, 'utf8');
  const validation = validateMathDelimiters(markdown);
  console.log(JSON.stringify({ file, ...validation }, null, 2));
  if (!validation.valid) process.exitCode = 1;
} catch (error) {
  console.error(`Unable to validate ${file}: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
