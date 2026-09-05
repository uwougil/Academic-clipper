function referencesSection(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const heading = lines.findIndex((line) => /^##\s+References\s*$/u.test(line));
  if (heading < 0) return '';
  const end = lines.findIndex((line, index) => index > heading && /^#{1,6}\s+/u.test(line));
  return lines.slice(heading + 1, end < 0 ? lines.length : end).join('\n');
}

export function detectCitationStyle(markdown) {
  const source = String(markdown || '');
  const referenceBody = referencesSection(source);
  const frontmatter = source.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/u)?.[1] || '';
  const hasQuarto = /^bibliography\s*:/mu.test(frontmatter);
  const hasMarkdown = /^\[\^\d+\]:\s+\S/mu.test(referenceBody);
  const hasLinks = /^\d+\.\s+.*<a\s+id="ref-\d+"><\/a>\s*$/mu.test(referenceBody);
  const matches = [
    hasQuarto && 'quarto',
    hasMarkdown && 'markdown',
    hasLinks && 'links',
  ].filter(Boolean);
  if (matches.length === 1) return matches[0];
  if (matches.length === 0) throw new Error('Unable to determine citation style; use --citation-style markdown, links, or quarto.');
  throw new Error(`Ambiguous citation style (${matches.join(', ')}); use --citation-style explicitly.`);
}
