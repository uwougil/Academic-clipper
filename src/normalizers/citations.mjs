import { semanticMarker } from './markers.mjs';

export function normalizeCitations(markdown, citationMarkers = []) {
  let result = String(markdown || '');
  for (const { marker, numbers } of citationMarkers) {
    const links = numbers.map((number) => `[${number}](#ref-${number})`).join(', ');
    result = result.replaceAll(marker, links);
  }
  return result.replace(/\[\^(\d+)\]/g, (_, number) => `[${number}](#ref-${number})`);
}

export function normalizeAnchorMarkers(markdown, crossReferences = []) {
  let result = String(markdown || '');
  for (const target of crossReferences) {
    for (const kind of ['SECTIONANCHOR', 'EQUATIONANCHOR']) {
      result = result.replaceAll(
        semanticMarker(kind, target.anchor),
        `<a id="${target.anchor}"></a>`,
      );
    }
  }
  return result;
}
