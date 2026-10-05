const TAG_PATTERN = /<\/?(sub|sup|i|b)\b[^>]*>/gi;

function renderKnownTag(tag, inner, inMath) {
  if (tag === 'sub') return `$_{${inner.trim()}}$`;
  if (tag === 'sup') return `$^{${inner.trim()}}$`;
  if (tag === 'i') return inMath ? inner : `*${inner}*`;
  if (tag === 'b') return inMath ? inner : `**${inner}**`;
  return inner;
}

function removeSuffixSpaceBeforeAttachment(output) {
  const trimmed = output.replace(/[ \u2009]+$/u, '');
  if (!trimmed || trimmed === output) return output;
  const last = trimmed.at(-1);
  return /[\p{L}\p{N}*)\]]/u.test(last) ? trimmed : output;
}

function renderRange(markdown, start = 0, stopTag = '', inMath = false) {
  let cursor = start;
  let output = '';
  while (cursor < markdown.length) {
    TAG_PATTERN.lastIndex = cursor;
    const match = TAG_PATTERN.exec(markdown);
    if (!match) return { output: output + markdown.slice(cursor), cursor: markdown.length, closed: false };
    const tagStart = match.index;
    const tagEnd = TAG_PATTERN.lastIndex;
    output += markdown.slice(cursor, tagStart);
    const isClosing = markdown[tagStart + 1] === '/';
    const tag = match[1].toLowerCase();
    if (isClosing) {
      if (tag === stopTag) return { output, cursor: tagEnd, closed: true };
      output += markdown.slice(tagStart, tagEnd);
      cursor = tagEnd;
      continue;
    }

    const nested = renderRange(markdown, tagEnd, tag, inMath || tag === 'sub' || tag === 'sup');
    if (!nested.closed) {
      output += markdown.slice(tagStart, tagEnd);
      output += nested.output;
      return { output, cursor: nested.cursor, closed: false };
    }
    if (tag === 'sub' || tag === 'sup') output = removeSuffixSpaceBeforeAttachment(output);
    output += renderKnownTag(tag, nested.output, inMath || tag === 'sub' || tag === 'sup');
    cursor = nested.cursor;
  }
  return { output, cursor, closed: false };
}

function mathFragmentAt(value, start) {
  const prefix = value.startsWith('$_{', start) ? '_' : value.startsWith('$^{', start) ? '^' : '';
  if (!prefix) return null;
  let cursor = start + 3;
  let depth = 1;
  while (cursor < value.length) {
    if (value[cursor] === '\\') {
      cursor += 2;
      continue;
    }
    if (value[cursor] === '{') depth += 1;
    if (value[cursor] === '}') {
      depth -= 1;
      if (depth === 0 && value[cursor + 1] === '$') {
        return { kind: prefix, content: value.slice(start + 3, cursor), end: cursor + 2 };
      }
    }
    cursor += 1;
  }
  return null;
}

function styledBaseAt(value, start) {
  if (value.startsWith('**', start)) {
    const end = value.indexOf('**', start + 2);
    if (end > start + 2) return { style: 'bold', content: value.slice(start + 2, end), end: end + 2 };
  }
  if (value[start] === '*') {
    const end = value.indexOf('*', start + 1);
    if (end > start + 1) return { style: 'italic', content: value.slice(start + 1, end), end: end + 1 };
  }
  return null;
}

function subscriptValue(content) {
  const value = String(content || '').trim();
  if (/^\\mathrm\{.*\}$/u.test(value)) return value;
  // Short tensor/component indices stay math italic. Named semantic labels
  // such as spin, orbital and SOC are textual and therefore roman.
  if (/^[A-Za-z]{2,}$/u.test(value) && !/^(?:ij|ji|ik|ki|il|li|jk|kj|jl|lj|kl|lk|xyz|xy|xz|yz)$/u.test(value)) {
    return `\\mathrm{${value}}`;
  }
  return value;
}

// Recognize complete unit tokens, never an arbitrary word's terminal letters.
// The non-SI tokens cover common astronomical, chemical and rate notation.
const UNIT_SYMBOL = /^(?:(?:[fpnumcdhkMGT]|[µμ])?(?:m|s|g|l|L|Hz|A|K|mol|cd|eV)|Å|erg|pc|Jy|yr|min|h|d|day|atom)$/u;

function isEscaped(value, index) {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor -= 1) backslashes += 1;
  return backslashes % 2 === 1;
}

function literalProtectedEnd(value, start) {
  const character = value[start];
  if (!/[$`~]/u.test(character) || isEscaped(value, start)) return null;
  if (character === '$') {
    const delimiter = value.startsWith('$$', start) ? '$$' : '$';
    let closing = start + delimiter.length;
    while ((closing = value.indexOf(delimiter, closing)) >= 0) {
      if (!isEscaped(value, closing)) return closing + delimiter.length;
      closing += delimiter.length;
    }
    return value.length;
  }

  const run = value.slice(start).match(/^(?:`+|~+)/u)[0];
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = value.indexOf('\n', start);
  const restOfLine = value.slice(start + run.length, lineEnd < 0 ? value.length : lineEnd);
  const fenced = run.length >= 3 && /^ {0,3}$/u.test(value.slice(lineStart, start))
    && (character !== '`' || !restOfLine.includes('`'));
  if (fenced) {
    const fences = /(?:^|\n) {0,3}(`{3,}|~{3,})[ \t]*\r?(?=\n|$)/gu;
    fences.lastIndex = start + run.length;
    let match;
    while ((match = fences.exec(value))) {
      if (match[1][0] === character && match[1].length >= run.length) return fences.lastIndex;
    }
    return value.length;
  }
  if (character !== '`') return null;
  const runs = /`+/gu;
  runs.lastIndex = start + run.length;
  let match;
  while ((match = runs.exec(value))) {
    if (match[0].length === run.length) return runs.lastIndex;
  }
  return value.length;
}

function combineLiteralPowers(value) {
  let output = '';
  let cursor = 0;
  while (cursor < value.length) {
    // This pass only repairs prose attachments. Existing math and code remain
    // opaque, including source examples that happen to contain orphan syntax.
    const end = literalProtectedEnd(value, cursor);
    if (end !== null) {
      output += value.slice(cursor, end);
      cursor = end;
      continue;
    }

    const token = value.slice(cursor).match(/^(?:\p{L}+|\d+(?:\.\d+)?)/u)?.[0];
    if (token) {
      const tokenEnd = cursor + token.length;
      const before = value[cursor - 1] || '';
      const fragment = mathFragmentAt(value, tokenEnd);
      const numericBase = /^\d+(?:\.\d+)?$/u.test(token);
      if (!/[\p{L}\p{N}_*$]/u.test(before)
        && (numericBase || UNIT_SYMBOL.test(token))
        && fragment?.kind === '^'
        && /^[−+\-]?\d+$/u.test(fragment.content)
        // A leading isotope attaches to the following element, not a prior
        // number/unit. Do not consume forms such as ppm <sup>1</sup>H.
        && !/[\p{L}\p{N}_]/u.test(value[fragment.end] || '')) {
        const base = numericBase ? token : `\\mathrm{${token}}`;
        output += `$${base}^{${fragment.content}}$`;
        cursor = fragment.end;
      } else {
        output += token;
        cursor = tokenEnd;
      }
      continue;
    }
    output += value[cursor];
    cursor += 1;
  }
  return output;
}

function combineScientificRuns(value) {
  let output = '';
  let cursor = 0;
  while (cursor < value.length) {
    const base = styledBaseAt(value, cursor);
    if (!base) {
      output += value[cursor];
      cursor += 1;
      continue;
    }

    let fragmentCursor = base.end;
    const fragments = [];
    while (fragments.length < 2) {
      const whitespace = value.slice(fragmentCursor).match(/^[ \u2009]+/u)?.[0] || '';
      const fragmentStart = fragmentCursor + whitespace.length;
      const fragment = mathFragmentAt(value, fragmentStart);
      if (!fragment) break;
      fragments.push(fragment);
      fragmentCursor = fragment.end;
    }
    if (!fragments.length) {
      output += value.slice(cursor, base.end);
      cursor = fragmentCursor;
      continue;
    }

    const baseTex = base.style === 'bold' ? `\\mathbf{${base.content}}` : base.content;
    output += `$${baseTex}${fragments.map(({ kind, content }) => {
      const attachment = kind === '_' ? subscriptValue(content) : content;
      return `${kind}{${attachment}}`;
    }).join('')}$`;
    cursor = fragmentCursor;
  }
  return output;
}

function normalizeAcademicAdjacency(value) {
  return String(value || '')
    // Nature separates an italic variable from a hyphenated academic term.
    .replace(/(\*[A-Za-z]\*)\s+-(?=(?:wave|direction|points)\b)/gu, '$1-')
    // Ordinal markers such as i th are part of the variable phrase.
    .replace(/(\*[A-Za-z]\*)\s+(?=(?:st|nd|rd|th)\b)/gu, '$1')
    // The multi-q label is one lexical unit, while ordinary prose spacing is
    // intentionally left untouched.
    .replace(/\bmulti-\s+(\*[A-Za-z]\*)/gu, 'multi-$1');
}

export function normalizeAcademicInline(markdown) {
  const converted = combineLiteralPowers(renderRange(String(markdown || '')).output);
  // Nature often represents a scientific variable as adjacent italic base and
  // sub/sup nodes. Rejoin the complete semantic run so P + sub(spin) + sup(-1)
  // becomes one math expression, while chemical formulas such as Mn + sub(3)
  // stay text-led. The fragments are parsed rather than repaired with a
  // delimiter replacement, so sup/sub order and nested braces are preserved.
  return normalizeAcademicAdjacency(combineScientificRuns(converted))
    // Defuddle may put a presentation space between adjacent chemical
    // symbols around a numeric subscript. Remove only that unambiguous
    // element-boundary space; keep ordinary scientific prose untouched.
    .replace(/[A-Z][a-z]?\$_\{\d+\}\$\s+(?=[A-Z][a-z]?)/g, (match) => match.replace(/\s+$/u, ''));
}
