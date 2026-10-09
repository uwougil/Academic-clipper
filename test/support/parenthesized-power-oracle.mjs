// Bounded TEST-ONLY source-equivalence oracle. No DOM/parser or production imports.
const presentation = text => text.replace(/\\left(?=\()/gu, '').replace(/\\right(?=\))/gu, '').replace(/\s+/gu, '');
const occurrences = (text, needle) => {
  const result = []; let start = 0, index;
  while ((index = text.indexOf(needle, start)) >= 0) {result.push(index); start = index + needle.length;}
  return result;
};
const leftBoundary = text => !text || /[\s(,:;=]$/u.test(text);
const rightBoundary = text => !text || /^[\s.,;:!?)]/u.test(text);

export function completeParenthesizedSquare(context, {base}) {
  // Known whole-base forms only. Keep every grouping brace and all operators.
  const atoms = [...context.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)].map(match => ({
    index: match.index, end: match.index + match[0].length, tex: presentation(match[1]),
  }));
  const candidates = [];
  let previousEnd = 0;
  const plainCandidates = (start, end) => {
    const text = context.slice(start, end);
    // Presentation whitespace does not conceal an extra malformed occurrence.
    const positions = []; let compact = '';
    for (let index = 0; index < text.length; index += 1) {
      if (!/\s/u.test(text[index])) {compact += text[index]; positions.push(start + index);}
    }
    for (const index of occurrences(compact, base)) {
      const squareEnd = index + base.length;
      candidates.push({index: positions[index], end: positions[squareEnd] + 1,
        tex: `${base}^{2}`, unicode: true, complete: compact[squareEnd] === '²'});
    }
  };
  for (const atom of atoms) {
    plainCandidates(previousEnd, atom.index);
    for (const ignored of occurrences(atom.tex, base)) candidates.push({...atom, unicode: false});
    previousEnd = atom.end;
  }
  plainCandidates(previousEnd, context.length);
  // Count ALL base-family occurrences, including malformed companions.
  if (candidates.length !== 1) return null;
  const candidate = candidates[0];
  let insidePi = false, insideDivisor = false;
  if (candidate.unicode) {if (!candidate.complete) return null;}
  else {
    let matched = false;
    for (const prefix of ['', 'π', '\\pi']) for (const suffix of ['', '/8']) for (const power of ['^{2}', '²']) {
      if (candidate.tex === `${prefix}${base}${power}${suffix}`) {
        insidePi = Boolean(prefix); insideDivisor = Boolean(suffix); matched = true;
      }
    }
    if (!matched) return null;
  }
  const before = context.slice(0, candidate.index);
  if (insidePi) {if (!leftBoundary(before)) return null;}
  else {
    const pi = before.match(/π\s*$/u);
    if (!pi || !leftBoundary(before.slice(0, pi.index))) return null;
  }
  const after = context.slice(candidate.end);
  if (insideDivisor) {if (!rightBoundary(after)) return null;}
  else {
    const divisor = after.match(/^\s*\/\s*8/u);
    if (!divisor || !rightBoundary(after.slice(divisor[0].length))) return null;
  }
  return candidate;
}

export function completeOrderedParenthesizedSquares(context, roles) {
  const matches = roles.map(role => completeParenthesizedSquare(context, role));
  if (matches.some(match => !match)) return null;
  if (matches.some((match, index) => index > 0 && matches[index - 1].end > match.index)) return null;
  return matches;
}
