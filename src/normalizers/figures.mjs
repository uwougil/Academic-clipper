export function renderFigure(figure, imagePath = figure.imageUrl) {
  return [
    `<a id="${figure.anchor}"></a>`,
    `## ${figure.label}`,
    '',
    `![${figure.alt || figure.label}](${imagePath})`,
    '',
    `**${figure.caption}**`,
  ].join('\n');
}

export function renderFigures(figures, imagePathByAnchor = new Map()) {
  if (!figures.length) return '';
  const main = figures.filter((figure) => figure.source === 'inline figure');
  const extended = figures.filter((figure) => figure.source === 'supplementary figure');
  const render = (figure) => renderFigure(figure, imagePathByAnchor.get(figure.anchor) || figure.imageUrl);
  const sections = [];
  if (main.length) sections.push(main.map(render).join('\n\n'));
  if (extended.length) sections.push(['## Extended Data', '', extended.map(render).join('\n\n')].join('\n'));
  return sections.join('\n\n');
}

export function renderTables(tables) {
  if (!tables.length) return '';
  const lines = ['## Tables', ''];
  for (const table of tables) {
    lines.push(`<a id="${table.anchor}"></a>`, `- **${table.caption}**${table.url ? ` ([Full size table](${table.url}))` : ''}`);
  }
  return lines.join('\n');
}
