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

function combineScientificRuns(value) {
  let output = '';
  let cursor = 0;
  while (cursor < value.length) {
    const base = value.slice(cursor).match(/^\*([^*\n]+)\*/);
    if (!base) {
      output += value[cursor];
      cursor += 1;
      continue;
    }

    let fragmentCursor = cursor + base[0].length;
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
      output += base[0];
      cursor = fragmentCursor;
      continue;
    }

    output += `$${base[1]}${fragments.map(({ kind, content }) => {
      const value = kind === '_' && /^[A-Za-z]{2,}$/.test(content) ? `\\mathrm{${content}}` : content;
      return `${kind}{${value}}`;
    }).join('')}$`;
    cursor = fragmentCursor;
  }
  return output;
}

export function normalizeAcademicInline(markdown) {
  const converted = renderRange(String(markdown || '')).output;
  // Nature often represents a scientific variable as adjacent italic base and
  // sub/sup nodes. Rejoin the complete semantic run so P + sub(spin) + sup(-1)
  // becomes one math expression, while chemical formulas such as Mn + sub(3)
  // stay text-led. The fragments are parsed rather than repaired with a
  // delimiter replacement, so sup/sub order and nested braces are preserved.
  return combineScientificRuns(converted)
    // Defuddle may put a presentation space between adjacent chemical
    // symbols around a numeric subscript. Remove only that unambiguous
    // element-boundary space; keep ordinary scientific prose untouched.
    .replace(/[A-Z][a-z]?\$_\{\d+\}\$\s+(?=[A-Z][a-z]?)/g, (match) => match.replace(/\s+$/u, ''));
}
