#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { detectCitationStyle } from './validators/citation-style.mjs';
import { validateMathDelimiters } from './validators/math-delimiters.mjs';
import { validateMarkdownStructure } from './validators/markdown-structure.mjs';

class UsageError extends Error {}

function argument(name, fallback = '') {
  const index = process.argv.indexOf(name);
  if (index < 0) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new UsageError(`Missing value for ${name}.`);
  return value;
}

let file;
let requestedCitationStyle;
try {
  file = argument('--file', './papers/s41586-026-10401-1/index.md');
  requestedCitationStyle = argument('--citation-style', 'auto');
  if (!['auto', 'markdown', 'links', 'quarto'].includes(requestedCitationStyle)) {
    throw new UsageError(`Invalid --citation-style ${requestedCitationStyle}; expected auto, markdown, links, or quarto.`);
  }
  const markdown = await readFile(file, 'utf8');
  const validation = validateMathDelimiters(markdown);
  const citationStyle = requestedCitationStyle === 'auto' ? detectCitationStyle(markdown) : requestedCitationStyle;
  const structure = validateMarkdownStructure(markdown, { citationStyle });
  console.log(JSON.stringify({ file, citationStyle, ...validation, markdownStructure: structure }, null, 2));
  if (!validation.valid || !structure.valid) process.exitCode = 1;
} catch (error) {
  const prefix = error instanceof UsageError ? 'Usage error' : `Unable to validate ${file || 'paper'}`;
  console.error(`${prefix}: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
