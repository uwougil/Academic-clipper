const TAG_PATTERN = /<\/?(sub|sup|i|b)\b[^>]*>/gi;

function renderKnownTag(tag, inner, inMath) {
  if (tag === 'sub') return `$_{${inner.trim()}}$`;
  if (tag === 'sup') return `$^{${inner.trim()}}$`;
  if (tag === 'i') return inMath ? inner : `*${inner}*`;
  if (tag === 'b') return inMath ? inner : `**${inner}**`;
  return inner;
}

function removeSuffixSpaceBeforeSubscript(output) {
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
    if (tag === 'sub' || tag === 'sup') output = removeSuffixSpaceBeforeSubscript(output);
    output += renderKnownTag(tag, nested.output, inMath || tag === 'sub' || tag === 'sup');
    cursor = nested.cursor;
  }
  return { output, cursor, closed: false };
}

export function normalizeAcademicInline(markdown) {
  const converted = renderRange(String(markdown || '')).output;
  // Nature often represents a scientific variable as adjacent italic base and
  // sub/sup nodes. Rejoin that semantic run so P + sub(spin) becomes one math
  // expression, while chemical formulas such as Mn + sub(3) stay text-led.
  return converted
    .replace(/\*([^*\n]+)\*\$_\{([^{}\n]+)\}\$/g, (_, base, subscript) => {
      const value = /^[A-Za-z]{2,}$/.test(subscript) ? `\\mathrm{${subscript}}` : subscript;
      return `$${base}_{${value}}$`;
    })
    .replace(/\*([^*\n]+)\*\$\^\{([^{}\n]+)\}\$/g, (_, base, superscript) => `$${base}^{${superscript}}$`);
}
