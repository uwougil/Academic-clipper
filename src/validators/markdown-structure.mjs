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
  return { headingCount: 1, itemCount: items.length, anchorCount: anchors.length, issues };
}

function inspectFootnoteReferences(lines) {
  const range = sectionRange(lines, 'References');
  if (!range) return { headingCount: 0, itemCount: 0, definitionCount: 0, anchorCount: 0, issues: [] };
  const definitions = [];
  const issues = [];
  for (let index = range.heading + 1; index < range.end; index += 1) {
    const line = lines[index];
    if (line.trim() === '') continue;
    if (line.trim().startsWith('<a id=')) {
      issues.push(issue(index, 'References contains an HTML anchor; Markdown footnotes do not need reference anchors.'));
      continue;
    }
    const match = line.match(/^\[\^(\d+)\]:\s+\S/u);
    if (match) definitions.push({ line: index, number: Number(match[1]) });
  }
  definitions.forEach((definition, index) => {
    const expected = index + 1;
    if (definition.number !== expected) issues.push(issue(definition.line, `References footnote numbering is not sequential at ${definition.number}.`));
  });
  return {
    headingCount: 1,
    itemCount: definitions.length,
    definitionCount: definitions.length,
    anchorCount: 0,
    issues,
  };
}

function inspectQuartoReferences(lines) {
  const range = sectionRange(lines, 'References');
  if (!range) return { headingCount: 0, itemCount: 0, definitionCount: 0, anchorCount: 0, issues: [] };
  const content = lines.slice(range.heading + 1, range.end);
  const opening = content.findIndex((line) => /^:::\s+\{#refs\}\s*$/u.test(line.trim()));
  const closing = opening >= 0 ? content.findIndex((line, index) => index > opening && line.trim() === ':::') : -1;
  const issues = [];
  if (opening < 0 || closing < 0) issues.push(issue(range.heading, 'Quarto References must expose a ::: {#refs} citeproc target.'));
  return { headingCount: 1, itemCount: 0, definitionCount: 0, anchorCount: 0, issues };
}

function inspectTables(lines) {
  const range = sectionRange(lines, 'Tables');
  if (!range) return { headingCount: 0, itemCount: 0, tableCount: 0, anchorCount: 0, issues: [] };
  const content = lines.slice(range.heading + 1, range.end);
  const listItems = content.filter((line) => /^\s*[-*+]\s+/u.test(line)).length;
  let tableCount = 0;
  for (let index = 0; index < content.length - 1; index += 1) {
    if (/^\s*\|.*\|\s*$/u.test(content[index]) && /^\s*\|?\s*:?-{3,}/u.test(content[index + 1])) tableCount += 1;
  }
  const anchors = content
    .map((line, index) => ({ line: index + range.heading + 1, match: line.match(/<a id="table-(\d+)"><\/a>/u) }))
    .filter((entry) => entry.match)
    .map((entry) => ({ line: entry.line, number: Number(entry.match[1]) }));
  const issues = [];
  for (const line of content) {
    if (line.trim().startsWith('<a id=')) issues.push(issue(range.heading + 1, 'Tables contains an anchor-only line that can break table structure.'));
  }
  return {
    headingCount: 1,
    itemCount: listItems + tableCount,
    tableCount,
    anchorCount: anchors.length,
    issues,
  };
}

export function validateMarkdownStructure(markdown, options = {}) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const citationStyle = options.citationStyle || (options.dialect === 'quarto' ? 'quarto' : 'markdown');
  const references = citationStyle === 'quarto'
    ? inspectQuartoReferences(lines)
    : citationStyle === 'links'
      ? inspectListSection(lines, 'References', /^(\d+)\.\s+/u, 'ref', true)
      : inspectFootnoteReferences(lines);
  const tables = inspectTables(lines);
  const issues = [...references.issues, ...tables.issues];
  if (references.headingCount && citationStyle !== 'quarto' && references.itemCount === 0) {
    issues.push(issue(lines.findIndex((line) => /^##\s+References\s*$/u.test(line)),
      citationStyle === 'links' ? 'References heading has no ordered-list items.' : 'References heading has no footnote definitions.'));
  }
  if (tables.headingCount && tables.itemCount === 0) {
    issues.push(issue(lines.findIndex((line) => /^##\s+Tables\s*$/u.test(line)), 'Tables heading has no list items.'));
  }
  return {
    valid: issues.length === 0,
    citationStyle,
    sections: { references, tables },
    issues,
  };
}
