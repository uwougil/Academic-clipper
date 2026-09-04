function sectionRange(lines, title) {
  const heading = lines.findIndex((line) => new RegExp(`^##\\s+${title}\\s*$`, 'u').test(line));
  if (heading < 0) return null;
  const end = lines.findIndex((line, index) => index > heading && /^#{1,6}\s+/u.test(line));
  return { heading, end: end < 0 ? lines.length : end };
}

function issue(line, message) {
  return { line: line + 1, message };
}

function inspectListSection(lines, title, marker, anchorPrefix, ordered = false) {
  const range = sectionRange(lines, title);
  if (!range) return { headingCount: 0, itemCount: 0, anchorCount: 0, issues: [] };
  const items = [];
  const anchors = [];
  const issues = [];
  for (let index = range.heading + 1; index < range.end; index += 1) {
    const line = lines[index];
    if (line.trim() === '') continue;
    if (line.trim().startsWith('<a id=')) {
      issues.push(issue(index, `${title} contains an anchor-only line that can break list structure.`));
      continue;
    }
    const match = line.match(marker);
    if (match) items.push({ line: index, number: ordered ? Number(match[1] || 0) : 0 });
    const anchor = line.match(new RegExp(`<a id="${anchorPrefix}-(\\d+)"></a>`, 'u'));
    if (anchor) anchors.push({ line: index, number: Number(anchor[1]) });
  }
  if (ordered) items.forEach((item, index) => {
    const expected = index + 1;
    if (item.number !== expected) issues.push(issue(item.line, `${title} list numbering is not sequential at ${item.number}.`));
  });
  return {
    headingCount: 1,
    itemCount: items.length,
    anchorCount: anchors.length,
    issues,
  };
}

export function validateMarkdownStructure(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const references = inspectListSection(lines, 'References', /^(\d+)\.\s+/u, 'ref', true);
  const tables = inspectListSection(lines, 'Tables', /^[-*+]\s+/u, 'table');
  const issues = [...references.issues, ...tables.issues];
  if (references.headingCount && references.itemCount === 0) {
    issues.push(issue(lines.findIndex((line) => /^##\s+References\s*$/u.test(line)), 'References heading has no ordered-list items.'));
  }
  if (tables.headingCount && tables.itemCount === 0) {
    issues.push(issue(lines.findIndex((line) => /^##\s+Tables\s*$/u.test(line)), 'Tables heading has no list items.'));
  }
  return {
    valid: issues.length === 0,
    sections: { references, tables },
    issues,
  };
}
