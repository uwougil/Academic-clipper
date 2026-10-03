import { parseRscPage } from '../adapters/rsc.mjs';
import { withDomGlobals } from '../dom-runtime.mjs';
import { htmlToMarkdown } from '../markdown.mjs';
import { normalizeMath } from '../normalizers/math.mjs';
import { normalizeAcademicInline } from '../normalizers/academic-inline.mjs';
import { normalizeCitations, normalizeAnchorMarkers } from '../normalizers/citations.mjs';
import { normalizeFigureCaptions, normalizeTableContents } from '../normalizers/figures.mjs';
import { outputPolicy } from '../renderers/output-policy.mjs';
import { renderClipMarkdown } from '../clip.mjs';
import { validateMathDelimiters } from '../validators/math-delimiters.mjs';
import { validateMarkdownStructure } from '../validators/markdown-structure.mjs';
import { validateRawHtml } from '../validators/html-audit.mjs';
import { validateCrossReferences } from '../validators/cross-references.mjs';

// Experimental direct entry point. No production routing, fetch or filesystem
// effects. Keep assembly separate from DOM extraction and existing normalizers.
export async function clipRsc({ html, url, citationStyle = 'markdown' }) {
  if (!['markdown', 'links', 'quarto'].includes(citationStyle)) throw new Error('Unknown citation style.');
  const page = parseRscPage(html, url, { citationStyle });
  const policy = outputPolicy(citationStyle);
  const finish = (md) => normalizeAnchorMarkers(normalizeCitations(normalizeAcademicInline(normalizeMath(md, page.semantic)), page.semantic.citations,
    { policy, references: page.references }), page.semantic.crossReferences.values(), { policy });
  // Existing Defuddle caches its first DOMParser realm. Like clipNature, keep
  // that realm alive; closing it breaks subsequent conversions in this process.
  return await withDomGlobals(page.dom, async () => {
    await normalizeFigureCaptions(page.figures, url);
    for (const f of page.figures) f.captionMarkdown = finish(f.captionMarkdown);
    for (const t of page.tables) {
      await normalizeTableContents(t.tableParts, url);
      t.caption = finish(await htmlToMarkdown(t.captionHtml, url));
      t.markdown = finish([t.tableParts.map((p) => p.markdown || '').join('\n\n'), await htmlToMarkdown(t.notesHtml, url)].filter(Boolean).join('\n\n'));
    }
    const references = ['## References', ''];
    for (const r of page.references) {
      const value = `${r.text.replace(/\$/gu, '\\$')}${r.doi ? ` [DOI](https://doi.org/${r.doi})` : ''}`;
      references.push(policy.references === 'ordered-list' ? `${r.number}. ${value} <a id="${r.anchor}"></a>` : `[^${r.number}]: ${value}`, '');
    }
    const result = { articleId: page.metadata.doi.split('/')[1], metadata: page.metadata, figures: page.figures, tables: page.tables,
      references: page.references, equations: page.equations, semantic: page.semantic, citationStyle, outputPolicy: policy,
      bodyMarkdown: await htmlToMarkdown(page.cleanedHtml, url),
      referencesMarkdown: citationStyle === 'quarto' ? '## References\n\n::: {#refs}\n:::' : references.join('\n').trim(),
    };
    // Source text is retained as an explicit BibTeX note, not parsed with the
    // Nature-specific free-text heuristics. No invented titles or author fields.
    const bib = (s) => s.replace(/\\/gu, '\\textbackslash{}').replace(/[{}]/gu, '').replace(/[$%&#_]/gu, '\\$&');
    result.referencesBib = page.references.map((r) => `@misc{${r.citationKey},\n  note = {${bib(r.text)}},${r.doi ? `\n  doi = {${bib(r.doi)}},` : ''}\n}`).join('\n\n') + '\n';
    result.markdown = renderClipMarkdown(result);
    result.cleanedHtml = page.cleanedHtml;
    result.debug = { ...page.debug,
      mathValidation: validateMathDelimiters(result.markdown),
      markdownStructure: validateMarkdownStructure(result.markdown, { dialect: policy.dialect, citationStyle }),
      rawHtmlValidation: validateRawHtml(result.markdown, { allowHtmlAnchors: policy.allowHtmlAnchors }),
      crossReferenceValidation: validateCrossReferences(result.markdown, { dialect: policy.dialect, citationStyle, referencesBib: result.referencesBib }),
    };
    return result;
  });
}
