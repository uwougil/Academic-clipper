// Explicit experimental entry point. Bridge/CLI/extension remain Nature-first.
import { parsePnasPage } from './adapters/pnas.mjs';
import { withDomGlobals } from './dom-runtime.mjs';
import { htmlToMarkdown } from './markdown.mjs';
import { referencesMarkdown, renderClipMarkdown } from './clip.mjs';
import { normalizeAnchorMarkers, normalizeCitations } from './normalizers/citations.mjs';
import { normalizeMath } from './normalizers/math.mjs';
import { semanticMarker } from './normalizers/markers.mjs';
import { normalizeFigureCaptions, normalizeTableContents } from './normalizers/figures.mjs';
import { outputPolicy } from './renderers/output-policy.mjs';
import { validateMathDelimiters } from './validators/math-delimiters.mjs';
import { validateMarkdownStructure } from './validators/markdown-structure.mjs';
import { validateRawHtml } from './validators/html-audit.mjs';
import { validateCrossReferences } from './validators/cross-references.mjs';

export async function clipPnas({ html, url, rawHtml = html, citationStyle = 'markdown' }) {
  if (!['markdown', 'links', 'quarto'].includes(citationStyle)) throw new Error('citationStyle must be markdown, links, or quarto.');
  const page = parsePnasPage(html, url);
  const policy = outputPolicy(citationStyle);
  const converted = await withDomGlobals(page.dom, async () => {
    // Convert each source MathML tree in isolation before composing prose.
    // This avoids adjacent inline/display delimiters being merged by Turndown.
    const fragments = [{ html: page.cleanedHtml }, ...page.figures.map((item) => ({ item, key: 'captionHtml', html: item.captionHtml })), ...page.tables.filter((item) => item.tableHtml).map((item) => ({ item, key: 'tableHtml', html: item.tableHtml }))];
    for (const fragment of fragments) {
      const scope = page.document.createElement('div');
      scope.innerHTML = fragment.html;
      for (const math of [...scope.querySelectorAll('math')]) {
        const display = math.getAttribute('display') === 'block';
        // Defuddle concatenates TeX tokens inside separator-free mfenced,
        // producing e.g. "\\cdotr" from the source multiplication and r.
        // Expand this observed MathML shorthand to an equivalent mrow, keeping
        // the exact source fence characters (including reported anomalies).
        for (const fenced of [...math.querySelectorAll('mfenced[separators=""]')].reverse()) {
          const row = page.document.createElement('mrow');
          const left = page.document.createElement('mo');
          const right = page.document.createElement('mo');
          left.textContent = fenced.getAttribute('open') ?? '(';
          right.textContent = fenced.getAttribute('close') ?? ')';
          row.append(left, ...fenced.childNodes, right);
          fenced.replaceWith(row);
        }
        const convertedMath = (await htmlToMarkdown(math.outerHTML, url)).trim();
        const tex = convertedMath.replace(/^\${1,2}\s*/u, '').replace(/\s*\${1,2}$/u, '').trim();
        if (!tex || tex.includes('No alternative text available')) throw new Error('PNAS MathML conversion failed.');
        const list = display ? page.semantic.displayMath : page.semantic.inlineMath;
        const marker = semanticMarker(display ? 'DISPLAYMATH' : 'INLINEMATH', list.length);
        list.push({ marker, tex });
        math.replaceWith(page.document.createTextNode(marker));
      }
      if (fragment.item) fragment.item[fragment.key] = scope.innerHTML;
      else page.cleanedHtml = scope.innerHTML;
    }
    await normalizeFigureCaptions(page.figures, url);
    await normalizeTableContents(page.tables, url);
    const normalizeFragment = (markdown) => {
      let result = normalizeCitations(normalizeMath(markdown, page.semantic), page.semantic.citations, { policy, references: page.references });
      const targets = [...page.semantic.crossReferences.values()];
      result = normalizeAnchorMarkers(result, targets.filter((target) => target.type !== 'section'), { policy });
      // These sections exist in the article body, rather than in the caption.
      for (const target of targets.filter((target) => target.type === 'section')) result = result.replaceAll(`](#${target.anchor})`, `](${policy.sectionLink(target)})`);
      return result;
    };
    for (const figure of page.figures) figure.captionMarkdown = normalizeFragment(figure.captionMarkdown);
    for (const table of page.tables) if (table.markdown) table.markdown = normalizeFragment(table.markdown);
    return { bodyMarkdown: await htmlToMarkdown(page.cleanedHtml, url), referencesMarkdown: await referencesMarkdown(page.references, url, policy) };
  });
  const result = { articleId: `pnas.${page.metadata.doi.split('pnas.')[1]}`, metadata: page.metadata, figures: page.figures, tables: page.tables, references: page.references, semantic: page.semantic, outputPolicy: policy, citationStyle, ...converted, rawHtml, cleanedHtml: page.cleanedHtml };
  result.markdown = renderClipMarkdown(result);
  result.debug = { ...page.debug, articleId: result.articleId, citationStyle,
    mathValidation: validateMathDelimiters(result.markdown),
    markdownStructure: validateMarkdownStructure(result.markdown, { dialect: policy.dialect, citationStyle }),
    rawHtmlValidation: validateRawHtml(result.markdown, { allowHtmlAnchors: policy.allowHtmlAnchors }),
    crossReferenceValidation: validateCrossReferences(result.markdown, { dialect: policy.dialect, citationStyle }),
  };
  return result;
}
