import { semanticMarker } from './markers.mjs';
import { outputPolicy } from '../renderers/output-policy.mjs';

export function normalizeCitations(markdown, citationMarkers = [], options = {}) {
  let result = String(markdown || '');
  const style = options.policy?.citationStyle
    || (options.style === 'quarto' ? 'quarto' : options.style === 'links' ? 'links' : 'markdown');
  const citationKeys = new Map((options.references || []).map((reference) => [reference.number, reference.citationKey]));
  for (const { marker, numbers } of citationMarkers) {
    const citation = style === 'quarto'
      ? `[${numbers.map((number) => `@${citationKeys.get(number) || `ref${number}`}`).join('; ')}]`
      : style === 'links'
        ? numbers.map((number) => `[${number}](#ref-${number})`).join(', ')
        : numbers.map((number) => `[^${number}]`).join('');
    result = result.replaceAll(marker, citation);
  }
  // Deliberately do not rewrite arbitrary Markdown footnotes here. Only the
  // semantic citation markers above are article citations; user-authored
  // footnotes must remain footnotes.
  return result;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeAnchorMarkers(markdown, crossReferences = [], options = {}) {
  let result = String(markdown || '');
  const policy = options.policy || outputPolicy(options.style);
  for (const target of crossReferences) {
    const sectionMarker = semanticMarker('SECTIONANCHOR', target.anchor);
    if (target.type === 'section') {
      if (policy.dialect === 'quarto') {
        const markerPattern = new RegExp(
          `${escapeRegExp(sectionMarker)}\\s*\\n\\s*(#{1,6}\\s+[^\\n]+)`,
          'gu',
        );
        result = result.replace(markerPattern, (_match, heading) => (
          `${heading.trim()} {#${policy.sectionIdentifier(target)}}`
        ));
      }
      result = result.replaceAll(sectionMarker, '');
      if (policy.dialect === 'quarto') {
        result = result.replaceAll(
          `](#${target.anchor})`,
          `](${policy.sectionLink(target)})`,
        );
      }
      continue;
    }
    const identifierPrefix = { figure: 'fig', table: 'tbl', equation: 'eq' }[target.type];
    if (policy.dialect === 'quarto' && identifierPrefix) {
      result = result.replaceAll(
        `](#${target.anchor})`,
        `](#${identifierPrefix}-${target.anchor})`,
      );
    }
    const equationMarker = semanticMarker('EQUATIONANCHOR', target.anchor);
    if (target.type === 'equation' && policy.dialect === 'quarto') {
      const markerPattern = new RegExp(
        `${escapeRegExp(equationMarker)}\\s*\\n\\s*(\\$\\$[\\s\\S]*?\\$\\$)`,
        'u',
      );
      result = result.replace(markerPattern, (_match, equation) => (
        `${equation.trim()} {#eq-${target.anchor}}`
      ));
      result = result.replaceAll(equationMarker, '');
    } else {
      result = result.replaceAll(equationMarker, `<a id="${target.anchor}"></a>`);
    }
  }
  return result;
}
