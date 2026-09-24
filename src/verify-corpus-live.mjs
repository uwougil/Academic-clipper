import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { clipNature } from './clip.mjs';
import { parseNaturePage } from './adapters/nature.mjs';

const manifestUrl = new URL('../test/corpus/corpus-manifest.json', import.meta.url);
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));

const { values } = parseArgs({
  options: {
    article: { type: 'string', short: 'a' },
    timeout: { type: 'string', short: 't', default: '30000' },
    'citation-style': { type: 'string', short: 'c', default: 'markdown' },
    json: { type: 'boolean', default: false },
  },
  strict: false,
});

const citationStyle = values['citation-style'] || 'markdown';
const timeoutMs = Number(values.timeout) || 30000;

const targetArticles = values.article
  ? manifest.articles.filter((a) => a.articleId === values.article)
  : manifest.articles;

if (targetArticles.length === 0) {
  console.error(`Article "${values.article}" not found in corpus manifest.`);
  process.exit(1);
}

if (!values.json) {
  console.log('='.repeat(80));
  console.log('Academic Clipper - Live Nature Corpus Pipeline Verification');
  console.log('='.repeat(80));
  console.log(`Articles:       ${targetArticles.length}`);
  console.log(`Citation Style: ${citationStyle}`);
  console.log(`Timeout:        ${timeoutMs} ms`);
  console.log('(Note: This is an opt-in network verification script; routine CI uses offline fixtures.)');
  console.log('='.repeat(80) + '\n');
}

let passCount = 0;
let warnCount = 0;
let failCount = 0;
const results = [];

for (let i = 0; i < targetArticles.length; i += 1) {
  const article = targetArticles[i];
  const url = article.canonicalUrl || article.url;
  const startTime = Date.now();

  if (!values.json) {
    console.log(`[${i + 1}/${targetArticles.length}] Evaluating ${article.articleId} [${article.archetype}]...`);
    console.log(`  URL:   ${url}`);
    console.log(`  Title: ${article.title}`);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);

    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'AcademicClipperCorpusVerifier/0.2.0 (Academic Research Testing; mailto:academic-clipper@example.org)',
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      failCount += 1;
      const durationMs = Date.now() - startTime;
      const result = {
        articleId: article.articleId,
        doi: article.doi,
        status: 'FAIL',
        durationMs,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
      results.push(result);
      if (!values.json) {
        console.log(`  -> RESULT: FAIL (HTTP ${response.status})\n`);
      }
      continue;
    }

    const html = await response.text();
    const hasDoiInHtml = html.includes(article.doi);
    const parsedPage = parseNaturePage(html, url);
    const parsedDoi = parsedPage.metadata.doi || '';
    const doiMatches = (parsedDoi && parsedDoi.toLowerCase() === article.doi.toLowerCase()) || hasDoiInHtml;

    if (!doiMatches) {
      failCount += 1;
      const durationMs = Date.now() - startTime;
      const result = {
        articleId: article.articleId,
        doi: article.doi,
        status: 'FAIL',
        durationMs,
        error: `Canonical identity mismatch: expected DOI ${article.doi}, found ${parsedDoi || 'none'}`,
      };
      results.push(result);
      if (!values.json) {
        console.log(`  -> RESULT: FAIL (Canonical identity mismatch)\n`);
      }
      continue;
    }

    // Run full Academic Clipper pipeline: DOM -> Adapter -> Defuddle -> Normalizers -> Renderer -> Validators
    const clipResult = await clipNature({ html, url, citationStyle });
    const { debug, metadata, figures, tables, references, markdown } = clipResult;

    const mathVal = debug.mathValidation;
    const structVal = debug.markdownStructure;
    const rawHtmlVal = debug.rawHtmlValidation;
    const crossRefVal = debug.crossReferenceValidation;
    const warnings = debug.warnings || [];

    const fatalIssues = [];
    if (!mathVal.valid) {
      fatalIssues.push(`Math validation failed (${mathVal.issues.length} issue(s))`);
    }
    if (!structVal.valid) {
      fatalIssues.push(`Markdown structure failed (${structVal.issues.length} issue(s))`);
    }
    if (!rawHtmlVal.valid) {
      fatalIssues.push(`Raw HTML audit failed (${rawHtmlVal.violations.length} unpermitted tag(s))`);
    }
    if (!crossRefVal.valid) {
      fatalIssues.push(`Cross-reference validation failed (${crossRefVal.issues.length} dangling link(s))`);
    }

    let status;
    if (fatalIssues.length > 0) {
      status = 'FAIL';
      failCount += 1;
    } else if (warnings.length > 0) {
      status = 'WARN';
      warnCount += 1;
    } else {
      status = 'PASS';
      passCount += 1;
    }

    const durationMs = Date.now() - startTime;
    const result = {
      articleId: article.articleId,
      doi: article.doi,
      status,
      durationMs,
      metrics: {
        authorsCount: metadata.authors?.length || 0,
        figuresCount: figures?.length || 0,
        tablesCount: tables?.length || 0,
        referencesCount: references?.length || 0,
        inlineMathCount: mathVal.inlineMathCount || 0,
        displayMathCount: mathVal.displayMathCount || 0,
        markdownCharacters: markdown.length,
      },
      validators: {
        math: { valid: mathVal.valid, issues: mathVal.issues.length },
        structure: { valid: structVal.valid, issues: structVal.issues.length },
        rawHtml: { valid: rawHtmlVal.valid, violations: rawHtmlVal.violations.length },
        crossReferences: { valid: crossRefVal.valid, issues: crossRefVal.issues.length },
      },
      fatalIssues,
      warnings,
    };
    results.push(result);

    if (!values.json) {
      console.log(`  Metrics:`);
      console.log(`    Authors:     ${metadata.authors?.length || 0}`);
      console.log(`    Figures:     ${figures?.length || 0}`);
      console.log(`    Tables:      ${tables?.length || 0}`);
      console.log(`    References:  ${references?.length || 0}`);
      console.log(`    Math:        ${mathVal.inlineMathCount || 0} inline, ${mathVal.displayMathCount || 0} display`);
      console.log(`    Markdown:    ${markdown.length} characters`);
      console.log(`  Validators:`);
      console.log(`    Math:        ${mathVal.valid ? 'OK' : 'FAIL'} (${mathVal.issues.length} issues)`);
      console.log(`    Structure:   ${structVal.valid ? 'OK' : 'FAIL'} (${structVal.issues.length} issues)`);
      console.log(`    Raw HTML:    ${rawHtmlVal.valid ? 'OK' : 'FAIL'} (${rawHtmlVal.violations.length} violations)`);
      console.log(`    Cross-Refs:  ${crossRefVal.valid ? 'OK' : 'FAIL'} (${crossRefVal.issues.length} dangling)`);
      if (warnings.length > 0) {
        console.log(`  Warnings (${warnings.length}):`);
        for (const w of warnings) {
          console.log(`    ! ${w}`);
        }
      }
      if (fatalIssues.length > 0) {
        console.log(`  Fatal Issues:`);
        for (const f of fatalIssues) {
          console.log(`    X ${f}`);
        }
      }
      console.log(`  -> RESULT: ${status} (${durationMs} ms)\n`);
    }
  } catch (error) {
    failCount += 1;
    const durationMs = Date.now() - startTime;
    const result = {
      articleId: article.articleId,
      doi: article.doi,
      status: 'FAIL',
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    };
    results.push(result);
    if (!values.json) {
      console.log(`  -> RESULT: FAIL (${error instanceof Error ? error.message : String(error)})\n`);
    }
  }
}

if (values.json) {
  console.log(JSON.stringify({
    summary: {
      total: targetArticles.length,
      passed: passCount,
      warned: warnCount,
      failed: failCount,
    },
    results,
  }, null, 2));
} else {
  console.log('='.repeat(80));
  console.log('Live Verification Summary:');
  console.log(`  Total Evaluated: ${targetArticles.length}`);
  console.log(`  PASS:            ${passCount}`);
  console.log(`  WARN:            ${warnCount}`);
  console.log(`  FAIL:            ${failCount}`);
  console.log('='.repeat(80));
}

if (failCount > 0) {
  process.exit(1);
}
