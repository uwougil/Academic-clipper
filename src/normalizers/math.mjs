function protectDisplayMath(markdown) {
  const blocks = [];
  const protectedMarkdown = markdown.replace(/\$\$[\s\S]*?\$\$/g, (block) => {
    const token = `ACADEMICCLIPPERDISPLAY${blocks.length}X`;
    blocks.push(block);
    return token;
  });
  return { protectedMarkdown, blocks };
}

function restoreDisplayMath(markdown, blocks) {
  return markdown.replace(/ACADEMICCLIPPERDISPLAY(\d+)X/g, (_, index) => blocks[Number(index)] || '');
}

function inlineDelimiterContext(markdown, start, end) {
  const before = markdown[start - 1] || '';
  const after = markdown[end] || '';
  return (before && !/\s/.test(before)) || (after && !/\s/.test(after));
}

function normalizeLegacyDelimiters(markdown) {
  const { protectedMarkdown, blocks } = protectDisplayMath(markdown);
  let result = protectedMarkdown
    .replaceAll('\\$', '$')
    .replace(/\\+\(([^\n]*?)\\+\)/g, (_, expression) => `$${expression.replace(/\\\\/g, '\\').trim()}$`);

  const bracketPattern = /\\+\[([\s\S]*?)\\+\]/g;
  result = result.replace(bracketPattern, (match, expression, offset, source) => {
    const end = offset + match.length;
    if (inlineDelimiterContext(source, offset, end)) return `$${expression.trim()}$`;
    return `$$\n${expression.trim()}\n$$`;
  });
  return restoreDisplayMath(result, blocks);
}

export function normalizeBlockMath(markdown) {
  return markdown.replace(/\$\$([\s\S]*?)\$\$/g, (_, expression) => {
    // Defuddle can carry TeX through one extra escaping layer. Pairwise
    // unescaping restores commands and row breaks without changing \_.
    const tex = expression
      .replace(/\\\\/g, '\\')
      .replaceAll('\\[', '\\left[')
      .replaceAll('\\]', '\\right]');
    return `$$${tex}$$`;
  });
}

export function normalizeMath(markdown, semantic = {}) {
  let result = String(markdown || '');
  const displayBlocks = [];
  for (const { marker, tex } of semantic.displayMath || []) {
    const token = `ACADEMICCLIPPERSEMANTICDISPLAY${displayBlocks.length}X`;
    displayBlocks.push(`$$\n${tex}\n$$`);
    result = result.replaceAll(marker, token);
  }
  for (const { marker, tex } of semantic.inlineMath || []) result = result.replaceAll(marker, `$${tex}$`);
  for (const { marker, text } of semantic.literalText || []) result = result.replaceAll(marker, text);
  result = normalizeLegacyDelimiters(result);
  result = result.replace(/\[\^(\d+)\]/g, '[$1]');
  result = normalizeBlockMath(result);
  return result.replace(/ACADEMICCLIPPERSEMANTICDISPLAY(\d+)X/g, (_, index) => displayBlocks[Number(index)] || '');
}
