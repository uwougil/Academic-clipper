export class RawHtmlValidationError extends Error {
  constructor(validation, file = '') {
    const location = validation.violations
      .map((item) => `Unpermitted raw HTML tag <${item.tag}> at ${file ? `${file}:` : ''}${item.line}:${item.column}`)
      .join('\n');
    super(`Raw HTML validation failed.\n${location}`);
    this.name = 'RawHtmlValidationError';
    this.validation = validation;
    this.issues = validation.violations;
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

export function maskCode(markdown) {
  const text = String(markdown || '');
  const lines = text.split('\n');
  const maskedLines = [];
  let inFence = false;
  let fenceChar = '';
  let fenceLength = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const lineWithoutCr = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;

    if (inFence) {
      // CommonMark: closing fence can have more characters than opening fence, but not fewer.
      const closingMatch = lineWithoutCr.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (closingMatch && closingMatch[1][0] === fenceChar && closingMatch[1].length >= fenceLength) {
        inFence = false;
      }
      maskedLines.push(' '.repeat(rawLine.length));
      continue;
    }

    const openMatch = lineWithoutCr.match(/^ {0,3}(`{3,}|~{3,})(?:[^\n]*)$/);
    if (openMatch) {
      const char = openMatch[1][0];
      const len = openMatch[1].length;
      const rest = lineWithoutCr.slice(openMatch[0].indexOf(openMatch[1]) + len);
      if (char !== '`' || !rest.includes('`')) {
        inFence = true;
        fenceChar = char;
        fenceLength = len;
        maskedLines.push(' '.repeat(rawLine.length));
        continue;
      }
    }

    maskedLines.push(rawLine);
  }

  let result = maskedLines.join('\n');

  // Mask inline code in non-fenced content
  result = result.replace(/(`+)((?:[^\n`]|`(?!\1))*?)\1/g, (match) => (
    match.replace(/[^\n]/g, ' ')
  ));

  return result;
}

const HTML_TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9:-]*)\b[^>]*>/g;
const COMPAT_ANCHOR_PATTERN = /<a\s+id="([a-zA-Z0-9_.:-]+)"\s*>\s*<\/a>/gi;

export function validateRawHtml(markdown, options = {}) {
  const allowHtmlAnchors = options.allowHtmlAnchors === true;
  const masked = maskCode(markdown);
  const violations = [];

  // In legacy links mode, only strict compatibility anchors <a id="..."></a> are permitted.
  // Arbitrary attributes like href or onclick, non-anchor tags, or unclosed anchors are rejected.
  const permittedSpans = [];
  if (allowHtmlAnchors) {
    for (const match of masked.matchAll(COMPAT_ANCHOR_PATTERN)) {
      permittedSpans.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  for (const match of masked.matchAll(HTML_TAG_PATTERN)) {
    const tag = match[1].toLowerCase();
    const tagStart = match.index;
    const tagEnd = match.index + match[0].length;

    if (allowHtmlAnchors) {
      const isPermitted = permittedSpans.some(
        (span) => tagStart >= span.start && tagEnd <= span.end,
      );
      if (isPermitted) continue;
    }

    const { line, column } = lineAndColumn(masked, match.index);
    violations.push({
      tag,
      line,
      column,
      context: match[0],
      type: 'unpermitted-html-tag',
    });
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

export function assertValidRawHtml(markdown, options = {}) {
  const validation = validateRawHtml(markdown, options);
  if (!validation.valid) throw new RawHtmlValidationError(validation, options.file || '');
  return validation;
}
