import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { clipNature } from '../src/clip.mjs';
import { articleIdFromUrl, parseNaturePage } from '../src/adapters/nature.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';
import { validateMarkdownStructure } from '../src/validators/markdown-structure.mjs';
import { validateCrossReferences } from '../src/validators/cross-references.mjs';
import { validateRawHtml } from '../src/validators/html-audit.mjs';

const manifestUrl = new URL('./corpus/corpus-manifest.json', import.meta.url);
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));

test('representative Nature corpus manifest contains 8 valid article specifications', () => {
  assert.equal(Array.isArray(manifest.articles), true);
  assert.equal(manifest.articles.length, 8);
  for (const article of manifest.articles) {
    assert.ok(article.articleId);
    assert.ok(article.canonicalUrl || article.url);
    assert.ok(article.doi);
    assert.ok(article.title);
    assert.ok(article.archetype);
    assert.ok(article.selectionRationale);
    assert.ok(article.fixture);
    assert.ok(article.expectations);
    assert.ok(article.provenance);
    assert.equal(article.provenance.fixtureKind, 'sanitized-structural-fixture');
    assert.equal(article.provenance.observedAt, '2026-09-08');
  }
});

for (const article of manifest.articles) {
  test(`Nature corpus [${article.archetype}]: ${article.articleId} (${article.title.slice(0, 40)}...)`, async () => {
    const articleUrl = article.canonicalUrl || article.url;
    const fixturePath = new URL(`../${article.fixture}`, import.meta.url);
    const fixtureHtml = await readFile(fixturePath, 'utf8');
    const { expectations } = article;

    // 1. Nature DOM parsing & authentic metadata extraction
    const parsedPage = parseNaturePage(fixtureHtml, articleUrl);
    assert.equal(parsedPage.metadata.title, article.title);
    assert.equal(parsedPage.metadata.doi, article.doi);
    assert.equal(parsedPage.metadata.journal, article.journal);
    assert.ok(
      parsedPage.metadata.authors.length >= expectations.authorCount,
      `Expected at least ${expectations.authorCount} authors, got ${parsedPage.metadata.authors.length}`,
    );
    if (expectations.firstAuthor) {
      assert.equal(parsedPage.metadata.authors[0], expectations.firstAuthor);
    }
    if (expectations.hasAffiliations) {
      assert.ok(parsedPage.metadata.authorInformation.affiliations.length > 0);
    }
    if (expectations.hasAuthorNotes) {
      assert.ok(parsedPage.metadata.authorInformation.notes.length > 0);
    }
    if (expectations.hasCorrespondence) {
      assert.ok(parsedPage.metadata.authorInformation.correspondence);
      if (expectations.correspondenceEmail) {
        assert.match(parsedPage.metadata.authorInformation.correspondence.email, new RegExp(expectations.correspondenceEmail));
      }
    }

    // Scholarly node counts from adapter
    assert.ok(parsedPage.figures.length >= expectations.figuresCount);
    assert.ok(parsedPage.references.length >= expectations.referencesCount);
    assert.equal(parsedPage.tables.length, expectations.totalTables);

    // 2. Full pipeline execution: Nature DOM -> Adapter -> Defuddle -> Normalizers -> Renderer -> Validators -> Markdown
    const clipResult = await clipNature({
      html: fixtureHtml,
      url: articleUrl,
      citationStyle: 'markdown',
    });

    const { markdown, debug } = clipResult;

    // 3. Document structure & YAML front matter
    assert.match(markdown, /^---\n/);
    assert.match(markdown, new RegExp(`title:\\s*"${article.title.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}"`));
    assert.match(markdown, new RegExp(`doi:\\s*"${article.doi}"`));
    assert.match(markdown, new RegExp(`# ${article.title.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}`));
    assert.match(markdown, /## Abstract/);
    assert.match(markdown, /## Main/);
    assert.match(markdown, /## Methods/);
    assert.match(markdown, /## References/);

    if (expectations.hasAffiliations) {
      assert.match(markdown, /## Authors and affiliations/);
    }
    if (expectations.hasAuthorNotes) {
      assert.match(markdown, /## Author notes/);
    }
    if (expectations.hasCorrespondence) {
      assert.match(markdown, /## Correspondence/);
    }

    // 4. Math validation & delimiter integrity
    const mathVal = validateMathDelimiters(markdown);
    assert.equal(mathVal.valid, true, `Math delimiter validation failed: ${JSON.stringify(mathVal.issues)}`);
    assert.equal(mathVal.issues.length, 0);
    assert.ok(
      mathVal.inlineMathCount >= expectations.mathValidation.minInlineMath,
      `Expected at least ${expectations.mathValidation.minInlineMath} inline math, got ${mathVal.inlineMathCount}`,
    );
    assert.ok(
      mathVal.displayMathCount >= expectations.mathValidation.minDisplayMath,
      `Expected at least ${expectations.mathValidation.minDisplayMath} display math, got ${mathVal.displayMathCount}`,
    );
    assert.doesNotMatch(markdown, /ACADEMICCLIPPER/);
    assert.doesNotMatch(markdown, /\\\(/);
    assert.doesNotMatch(markdown, /\\\)/);

    // 5. Scientific inline formatting: no raw HTML formatting tags leaked into prose
    assert.doesNotMatch(markdown, /<sub\b|<sup\b|<i\b/);
    const rawHtmlVal = validateRawHtml(markdown, { allowHtmlAnchors: true });
    assert.equal(rawHtmlVal.valid, true, `Raw HTML validation failed: ${JSON.stringify(rawHtmlVal.violations)}`);
    assert.equal(debug.rawHtmlValidation.valid, true);
    assert.equal(debug.rawHtmlValidation.violations.length, 0);

    // 6. Citations & References structure
    assert.equal((markdown.match(/^## References\s*$/gm) || []).length, 1);
    const footnoteCount = (markdown.match(/^\[\^\d+\]:/gm) || []).length;
    assert.ok(footnoteCount >= expectations.referencesCount);

    // 7. Figures & Extended Data Figures (semantic presence, no mandatory raw HTML anchors)
    for (const fig of clipResult.figures) {
      assert.ok(
        markdown.includes(`**${fig.label}.**`) || markdown.includes(fig.label),
        `Figure label ${fig.label} not found in markdown`,
      );
    }
    const extendedFigures = clipResult.figures.filter((f) => f.source === 'supplementary figure');
    if (extendedFigures.length > 0) {
      assert.match(markdown, /## Extended Data/);
    }

    // 8. Tables extraction & fallback quality
    assert.equal(debug.tableSummary.totalTables, expectations.totalTables);
    assert.equal(debug.tableSummary.capturedTables, expectations.capturedTables);
    assert.equal(debug.tableSummary.fallbackTables, expectations.fallbackTables);
    if (expectations.capturedTables > 0) {
      assert.match(markdown, /\|.*\|/);
    }

    // 9. Warnings & diagnostics regression check
    if (expectations.expectedWarnings?.length) {
      for (const expectedWarning of expectations.expectedWarnings) {
        assert.ok(
          debug.warnings.some((w) => w.includes(expectedWarning)),
          `Expected warning containing "${expectedWarning}" not found in debug.warnings: ${JSON.stringify(debug.warnings)}`,
        );
      }
      assert.equal(
        debug.warnings.length,
        expectations.expectedWarnings.length,
        `Unexpected warnings count in debug.warnings: ${JSON.stringify(debug.warnings)}`,
      );
    } else {
      assert.deepEqual(debug.warnings, []);
    }

    // 10. Markdown structure validator check
    const structVal = validateMarkdownStructure(markdown, { citationStyle: 'markdown' });
    assert.equal(structVal.valid, true, `Markdown structure invalid: ${JSON.stringify(structVal.issues)}`);
    assert.equal(debug.markdownStructure.valid, true);
    assert.equal(debug.markdownStructure.issues.length, 0);

    // 11. Cross-references target validity & no dangling internal links (official validator)
    const crossRefVal = validateCrossReferences(markdown, { citationStyle: 'markdown' });
    assert.equal(crossRefVal.valid, true, `Cross-reference validation failed: ${JSON.stringify(crossRefVal.issues)}`);
    assert.equal(crossRefVal.issues.length, 0);
    assert.equal(debug.crossReferenceValidation.valid, true);
    assert.equal(debug.crossReferenceValidation.issues.length, 0);

    // 12. Quarto mode compatibility & cross-reference integrity
    const quartoResult = await clipNature({
      html: fixtureHtml,
      url: articleUrl,
      citationStyle: 'quarto',
    });
    assert.match(quartoResult.markdown, /bibliography: "references\.bib"/);
    assert.match(quartoResult.markdown, /\[@\w+/);
    assert.match(quartoResult.referencesMarkdown, /^## References\n\n::: \{#refs\}\n:::/);

    const quartoStructVal = validateMarkdownStructure(quartoResult.markdown, { citationStyle: 'quarto' });
    assert.equal(quartoStructVal.valid, true, `Quarto structure invalid: ${JSON.stringify(quartoStructVal.issues)}`);
    assert.equal(quartoResult.debug.markdownStructure.valid, true);
    assert.equal(quartoResult.debug.markdownStructure.issues.length, 0);

    const quartoCrossRefVal = validateCrossReferences(quartoResult.markdown, { citationStyle: 'quarto' });
    assert.equal(quartoCrossRefVal.valid, true, `Quarto cross-reference validation failed: ${JSON.stringify(quartoCrossRefVal.issues)}`);
    assert.equal(quartoCrossRefVal.issues.length, 0);
    assert.equal(quartoResult.debug.crossReferenceValidation.valid, true);
    assert.equal(quartoResult.debug.crossReferenceValidation.issues.length, 0);

    const quartoRawHtmlVal = validateRawHtml(quartoResult.markdown, { allowHtmlAnchors: false });
    assert.equal(quartoRawHtmlVal.valid, true, `Quarto raw HTML validation failed: ${JSON.stringify(quartoRawHtmlVal.violations)}`);
    assert.equal(quartoResult.debug.rawHtmlValidation.valid, true);
    assert.equal(quartoResult.debug.rawHtmlValidation.violations.length, 0);
  });
}
