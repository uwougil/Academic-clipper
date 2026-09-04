import { semanticMarker } from './markers.mjs';

export function normalizeCitations(markdown, citationMarkers = [], options = {}) {
  let result = String(markdown || '');
  const style = options.style === 'quarto' ? 'quarto' : 'links';
  const citationKeys = new Map((options.references || []).map((reference) => [reference.number, reference.citationKey]));
  for (const { marker, numbers } of citationMarkers) {
    const citation = style === 'quarto'
      ? `[${numbers.map((number) => `@${citationKeys.get(number) || `ref${number}`}`).join('; ')}]`
      : numbers.map((number) => `[${number}](#ref-${number})`).join(', ');
    result = result.replaceAll(marker, citation);
  }
  return result.replace(/\[\^(\d+)\]/g, (_, number) => (
    style === 'quarto'
      ? `[@${citationKeys.get(Number(number)) || `ref${number}`}]`
      : `[${number}](#ref-${number})`
  ));
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
