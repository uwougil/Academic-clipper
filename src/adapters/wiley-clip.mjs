import { parseWileyPage, wileyDoiFromUrl } from './wiley.mjs';
import { withDomGlobals } from '../dom-runtime.mjs';
import { defuddleToMarkdown, htmlToMarkdown } from '../markdown.mjs';
import { normalizeAcademicInline } from '../normalizers/academic-inline.mjs';
import { normalizeMath } from '../normalizers/math.mjs';
import { normalizeFigureCaptions, normalizeTableContents } from '../normalizers/figures.mjs';
import { outputPolicy } from '../renderers/output-policy.mjs';
import { renderClipMarkdown, referencesBib } from '../clip.mjs';
import { validateMathDelimiters } from '../validators/math-delimiters.mjs';
import { validateMarkdownStructure } from '../validators/markdown-structure.mjs';
import { validateRawHtml } from '../validators/html-audit.mjs';
import { validateCrossReferences } from '../validators/cross-references.mjs';

// Explicit experimental entry point, intentionally not wired to bridge/CLI routing.
export async function clipWiley({ html, url, citationStyle = 'markdown', allowPreview = false }) {
  if (!['markdown', 'quarto', 'links'].includes(citationStyle)) throw new Error('Invalid citationStyle.');
  const page = parseWileyPage(html, url);
  // Match Nature: Defuddle caches a DOMParser bound to its first window.
  if (page.debug.access === 'preview' && !allowPreview) throw new Error('Wiley full content absent; use allowPreview only for an explicitly incomplete preview.');
  const policy = outputPolicy(citationStyle);
  const converted = await withDomGlobals(page.dom, async () => {
    await normalizeFigureCaptions(page.figures, url);
    await normalizeTableContents(page.tables, url);
    for (const figure of page.figures) figure.captionMarkdown = normalizeMath(figure.captionMarkdown, page.semantic);
    for (const table of page.tables) {
      table.markdown = normalizeMath(table.markdown, page.semantic);
      table.caption = normalizeMath(table.caption, page.semantic);
    }
    const { markdown } = await defuddleToMarkdown(page.document, url);
    const lines = [];
    for (const reference of page.references) {
      const escaped = reference.text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      let value = normalizeAcademicInline(normalizeMath(await htmlToMarkdown(`<p>${escaped}</p>`, url))).replace(/\n+/gu, ' ').trim();
      if (reference.doi) value += ` [doi:${reference.doi}](https://doi.org/${reference.doi})`;
      lines.push(citationStyle === 'links' ? `${reference.number}. ${value} <a id="${reference.anchor}"></a>` : `[^${reference.number}]: ${value}`);
    }
    return { markdown, referencesMarkdown: !lines.length ? '' : citationStyle === 'quarto' ? '## References\n\n::: {#refs}\n:::' : `## References\n\n${lines.join('\n\n')}` };
  });
  const result = { ...page, articleId: `wiley-${wileyDoiFromUrl(url).replace(/[^a-z0-9.-]/giu, '-')}`,
    citationStyle, outputPolicy: policy, bodyMarkdown: converted.markdown, referencesMarkdown: converted.referencesMarkdown };
  result.markdown = renderClipMarkdown(result);
  if (/ACADEMICCLIPPER/u.test(result.markdown)) throw new Error('Unresolved Wiley semantic marker in output.');
  result.bibliography = citationStyle === 'quarto' ? referencesBib(result.references) : '';
  result.debug.validations = {
    math: validateMathDelimiters(result.markdown),
    structure: validateMarkdownStructure(result.markdown, { dialect: policy.dialect, citationStyle }),
    html: validateRawHtml(result.markdown, { allowHtmlAnchors: policy.allowHtmlAnchors }),
    crossrefs: validateCrossReferences(result.markdown, { dialect: policy.dialect, citationStyle }),
  };
  if (Object.values(result.debug.validations).some(v => !v.valid)) {
    const error = new Error('Experimental Wiley output validation failed.');
    error.validations = result.debug.validations;
    throw error;
  }
  return result;
}
