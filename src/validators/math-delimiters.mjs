const CODE_STATE = 'INLINE_CODE';
const FENCE_STATE = 'FENCED_CODE';

function isEscaped(text, index) {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) backslashes += 1;
  return backslashes % 2 === 1;
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

function contextAt(text, index, radius = 100) {
  const lineStart = lineStartAt(text, index);
  const newline = text.indexOf('\n', index);
  const lineEnd = newline < 0 ? text.length : newline;
  const line = text.slice(lineStart, lineEnd).replace(/\r/g, '');
  const column = index - lineStart;
  if (line.length <= radius * 2) return line;
  const start = Math.max(0, Math.min(column - radius, line.length - radius * 2));
  return `${start > 0 ? '…' : ''}${line.slice(start, start + radius * 2)}${start + radius * 2 < line.length ? '…' : ''}`;
}

function issueAt(text, issues, type, index, delimiter, message) {
  const { line, column } = lineAndColumn(text, index);
  issues.push({ type, line, column, delimiter, context: contextAt(text, index), message });
}

function fenceAt(text, index) {
  const lineStart = lineStartAt(text, index);
  const prefix = text.slice(lineStart, index);
  if (!/^ {0,3}$/.test(prefix)) return null;
  const match = text.slice(index).match(/^(`{3,}|~{3,})/);
  if (!match) return null;
  return { character: match[1][0], length: match[1].length };
}

function codeDelimiterAt(text, index) {
  if (text[index] !== '`' || isEscaped(text, index)) return '';
  let end = index;
  while (text[end] === '`') end += 1;
  return text.slice(index, end);
}

function isLinkDestination(text, index) {
  const lineStart = lineStartAt(text, index);
  const line = text.slice(lineStart, text.indexOf('\n', index) < 0 ? text.length : text.indexOf('\n', index));
  const offset = index - lineStart;
  const destinationStart = line.lastIndexOf('](', offset);
  if (destinationStart < 0) return false;
  const destinationEnd = line.indexOf(')', destinationStart + 2);
  return destinationEnd >= 0 && offset > destinationStart + 1 && offset < destinationEnd;
}

function isLinkLabel(text, index) {
  const lineStart = lineStartAt(text, index);
  const lineEnd = text.indexOf('\n', index) < 0 ? text.length : text.indexOf('\n', index);
  const line = text.slice(lineStart, lineEnd);
  const offset = index - lineStart;
  const open = line.lastIndexOf('[', offset);
  const close = line.lastIndexOf(']', offset);
  return open > close && line.indexOf(']', open + 1) >= 0;
}

function isMarkdownSyntaxPosition(text, index) {
  return isLinkDestination(text, index) || isLinkLabel(text, index);
}

function markerIndex(text) {
  return text.search(/ACADEMICCLIPPER[A-Z0-9-]+X/);
}

export function validateMathDelimiters(markdown) {
  const text = String(markdown ?? '');
  const issues = [];
  const states = { TEXT: 0, INLINE_MATH: 0, DISPLAY_MATH: 0, INLINE_CODE: 0, FENCED_CODE: 0 };
  let state = 'TEXT';
  let inlineStart = -1;
  let displayStart = -1;
  let codeDelimiter = '';
  let fenceCharacter = '';
  let fenceLength = 0;
  let inlineMathCount = 0;
  let displayMathCount = 0;

  const marker = markerIndex(text);
  if (marker >= 0) issueAt(text, issues, 'semantic-marker-leak', marker, '', 'Academic semantic marker survived final rendering.');

  let index = 0;
  while (index < text.length) {
    states[state] += 1;

    if (state === FENCE_STATE) {
      const fence = fenceAt(text, index);
      if (fence && fence.character === fenceCharacter && fence.length >= fenceLength) {
        state = 'TEXT';
        index += fence.length;
        continue;
      }
      index += 1;
      continue;
    }

    if (state === CODE_STATE) {
      if (text.startsWith(codeDelimiter, index) && !isEscaped(text, index)) {
        state = 'TEXT';
        index += codeDelimiter.length;
        continue;
      }
      index += 1;
      continue;
    }

    if (state === 'TEXT') {
      const fence = fenceAt(text, index);
      if (fence) {
        state = FENCE_STATE;
        fenceCharacter = fence.character;
        fenceLength = fence.length;
        index += fence.length;
        continue;
      }

      const codeDelimiterCandidate = codeDelimiterAt(text, index);
      if (codeDelimiterCandidate) {
        state = CODE_STATE;
        codeDelimiter = codeDelimiterCandidate;
        index += codeDelimiter.length;
        continue;
      }

      if (text[index] === '\\' && !isEscaped(text, index) && /[()[\]]/.test(text[index + 1] || '')) {
        issueAt(text, issues, 'legacy-math-delimiter', index, text.slice(index, index + 2), 'Legacy \\( \\) or \\[ \\] delimiter remains in final Markdown.');
        index += 2;
        continue;
      }

      if (text[index] === '$' && !isEscaped(text, index) && !isMarkdownSyntaxPosition(text, index)) {
        if (text.startsWith('$$', index)) {
          state = 'DISPLAY_MATH';
          displayStart = index;
          index += 2;
        } else {
          state = 'INLINE_MATH';
          inlineStart = index;
          index += 1;
        }
        continue;
      }
      index += 1;
      continue;
    }

    if (state === 'INLINE_MATH') {
      if (text.startsWith('$$', index) && !isEscaped(text, index)) {
        issueAt(text, issues, 'inline-display-switch', index, '$$', 'Inline math encountered a display delimiter before it closed.');
        state = 'TEXT';
        index += 2;
        continue;
      }
      if (text[index] === '$' && !isEscaped(text, index)) {
        state = 'TEXT';
        inlineMathCount += 1;
        inlineStart = -1;
        index += 1;
        continue;
      }
      if (text[index] === '\n') {
        issueAt(text, issues, 'inline-math-crosses-line', inlineStart, '$', 'Inline math crossed a Markdown line boundary.');
        state = 'TEXT';
        inlineStart = -1;
      }
      index += 1;
      continue;
    }

    if (state === 'DISPLAY_MATH') {
      if (text.startsWith('$$', index) && !isEscaped(text, index)) {
        state = 'TEXT';
        displayMathCount += 1;
        displayStart = -1;
        index += 2;
        continue;
      }
      if (text[index] === '$' && !isEscaped(text, index)) {
        issueAt(text, issues, 'single-dollar-in-display', index, '$', 'A single dollar appeared inside display math; use escaped literal text or a valid TeX expression.');
      }
      index += 1;
      continue;
    }
  }

  if (state === 'INLINE_MATH') issueAt(text, issues, 'unclosed-inline-math', inlineStart, '$', 'Inline math was not closed before EOF.');
  if (state === 'DISPLAY_MATH') issueAt(text, issues, 'unclosed-display-math', displayStart, '$$', 'Display math was not closed before EOF.');

  return {
    valid: issues.length === 0,
    inlineMathCount,
    displayMathCount,
    issues,
    states,
  };
}

export class MathDelimiterValidationError extends Error {
  constructor(validation, file = '') {
    const location = validation.issues
      .map((item) => `${item.type} at ${file ? `${file}:` : ''}${item.line}:${item.column}: ${item.context}`)
      .join('\n');
    super(`Math delimiter validation failed.\n${location}`);
    this.name = 'MathDelimiterValidationError';
    this.validation = validation;
    this.issues = validation.issues;
  }
}

export function assertValidMathDelimiters(markdown, options = {}) {
  const validation = validateMathDelimiters(markdown);
  if (!validation.valid) throw new MathDelimiterValidationError(validation, options.file || '');
  return validation;
}
