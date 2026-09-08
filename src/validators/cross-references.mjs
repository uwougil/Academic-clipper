import { maskCode } from './html-audit.mjs';

export class CrossReferenceValidationError extends Error {
  constructor(validation, file = '') {
    const location = validation.issues
      .map((item) => `Dangling internal cross-reference [${item.label}](#${item.target}) (${item.category}) at ${file ? `${file}:` : ''}${item.line}:${item.column}`)
      .join('\n');
    super(`Cross-reference validation failed.\n${location}`);
    this.name = 'CrossReferenceValidationError';
    this.validation = validation;
    this.issues = validation.issues;
  }
}

function lineStartAt(text, index) {
  const newline = text.lastIndexOf('\n', index - 1);
  return newline + 1;
}

function lineAndColumn(text, index) {
  const lineStart = lineStartAt(text, index);
  return {
    line: text.slice(0, lineStart).split('\n').length,
    column: index - lineStart + 1,
  };
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function classifyTarget(target, label = '') {
  if (/^extended-data-(?:fig(?:ure)?|table)/i.test(target) || /^Extended Data\b/i.test(label)) return 'extended-data';
  if (/^(?:fig-|figure-)/i.test(target) || /^Figure\b/i.test(label)) return 'figure';
  if (/^(?:tbl-|table-)/i.test(target) || /^Table\b/i.test(label)) return 'table';
  if (/^(?:eq-|equation-)/i.test(target) || /^Equation\b/i.test(label)) return 'equation';
  if (/^sec-/i.test(target)) return 'section';
  if (/^ref-/i.test(target)) return 'reference';
  return 'section';
}

export function collectDocumentTargets(masked) {
  const targets = new Set();

  // 1. Explicit HTML anchors: <a id="...">
  for (const match of masked.matchAll(/<a\s+[^>]*\bid=["']([a-zA-Z0-9_.:-]+)["'][^>]*>/gi)) {
    targets.add(match[1]);
  }

  // 2. Quarto / Pandoc native identifiers: {#id}
  for (const match of masked.matchAll(/\{#([a-zA-Z0-9_.:-]+)\}/g)) {
    targets.add(match[1]);
  }

  // 3. Markdown heading slugs:
  for (const rawLine of masked.split('\n')) {
    const line = rawLine.replace(/\r/g, '').trim();
    const headingMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (!headingMatch) continue;
    let headingText = headingMatch[1].trim();
    // Strip trailing Quarto attribute if present: ## Heading {#sec-id}
    const quartoAttrMatch = headingText.match(/\s+\{#[a-zA-Z0-9_.:-]+\}\s*$/);
    if (quartoAttrMatch) {
      headingText = headingText.slice(0, quartoAttrMatch.index).trim();
    }
    const slug = slugify(headingText);
    if (slug) targets.add(slug);
  }

  return targets;
}

export function validateCrossReferences(markdown, options = {}) {
  const masked = maskCode(markdown);
  const targets = collectDocumentTargets(masked);
  const issues = [];
  const links = [];

  const linkPattern = /\[([^\]]+)\]\(#([a-zA-Z0-9_.:-]+)\)/g;

  for (const match of masked.matchAll(linkPattern)) {
    const label = match[1];
    const target = match[2];
    const category = classifyTarget(target, label);
    links.push({ label, target, category, index: match.index });

    if (!targets.has(target)) {
      const { line, column } = lineAndColumn(masked, match.index);
      issues.push({
        target,
        label,
        category,
        line,
        column,
        context: match[0],
        type: `dangling-${category}-reference`,
        message: `Dangling internal cross-reference to nonexistent target #${target}`,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    targets: Array.from(targets),
    links,
  };
}

export function assertValidCrossReferences(markdown, options = {}) {
  const validation = validateCrossReferences(markdown, options);
  if (!validation.valid) throw new CrossReferenceValidationError(validation, options.file || '');
  return validation;
}
