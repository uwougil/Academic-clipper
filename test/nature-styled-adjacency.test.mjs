import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature } from '../src/clip.mjs';
import { parseNaturePage } from '../src/adapters/nature.mjs';

const fixtureRoot = new URL('./fixtures/nature-styled-adjacency/', import.meta.url);
const provenance = JSON.parse(await readFile(new URL('s41586-023-06735-9.provenance.json', fixtureRoot), 'utf8'));
const bytes = await readFile(new URL(provenance.article.fixturePath, fixtureRoot));
const html = new TextDecoder('utf8', { fatal:true }).decode(bytes);
const sha256 = value => createHash('sha256').update(value).digest('hex');
const opened = [];
after(() => { for (const dom of opened) dom.window.close(); });
const open = value => { const dom = new JSDOM(value); opened.push(dom); return dom.window.document; };
const source = open(html);
const clipCache = new Map();
const clip = citationStyle => {
  if (!clipCache.has(citationStyle)) clipCache.set(citationStyle, clipNature({html, url:provenance.url, citationStyle}));
  return clipCache.get(citationStyle);
};
const modelExpression = markdown => markdown.match(/representations only, ([^\n]*?)\), as well/u)?.[1];

test('Materials reduced source preserves complete paragraph, original nodes, equation, creators and rights', () => {
  assert.equal(bytes.length, provenance.article.fixtureBytes);
  assert.equal(sha256(bytes), provenance.article.fixtureSha256);
  const paragraph = source.querySelector(provenance.sourceParagraph.fixtureSelector);
  assert.equal(sha256(Buffer.from(paragraph.outerHTML)), provenance.sourceParagraph.frozenParagraphSha256);
  assert.ok(paragraph.innerHTML.includes(provenance.sourceParagraph.html));
  const fragment = open(`<p>${provenance.sourceParagraph.html}</p>`).querySelector('p');
  assert.deepEqual([...fragment.childNodes].map(node => ({nodeType:node.nodeType,tag:node.tagName || null,text:node.textContent})), provenance.sourceParagraph.orderedChildNodes);
  assert.equal(fragment.textContent, '128x0e\u2009+\u200964x1x\u2009+\u200932x2e');
  assert.equal(fragment.querySelectorAll('sup,sub').length, 0);
  assert.equal(fragment.querySelectorAll('i').length, 6);
  assert.deepEqual([...paragraph.querySelectorAll('a[data-test="citation-ref"]')].map(link => Number(link.textContent)), [30,66,67,68,30]);
  assert.deepEqual([...source.querySelectorAll('meta[name="citation_author"]')].map(node => node.getAttribute('content')), provenance.sourceRights.orderedSourceCreators);
  assert.equal(source.querySelectorAll('.c-article-equation').length, 1);
  const equation = source.querySelector('#Equ1');
  assert.equal(sha256(Buffer.from(equation.outerHTML)), provenance.sourceDisplay.rawSourceSubtreeSha256);
  assert.equal(equation.querySelector('.mathjax-tex').textContent, `$$${provenance.sourceDisplay.sourceTeX}$$`);
  assert.deepEqual([...source.querySelectorAll('ol.c-article-references > li')].map(node => node.querySelector('p.c-article-references__text').id), Array.from({length:68}, (_, index) => `ref-CR${index + 1}`));
  const notice = provenance.sourceRights.notices[0];
  const rights = source.querySelectorAll(notice.sourceSelector)[notice.sourceParagraphIndex];
  assert.equal(rights.textContent.replace(/\s+/gu, ' ').trim(), notice.sourceNoticeText);
  assert.deepEqual([...rights.querySelectorAll('a')].map(link => ({href:link.getAttribute('href'),text:link.textContent})), notice.sourceLicenseLinks);
  assert.doesNotMatch(html, /<script\b|\bon\w+\s*=|(?:javascript|file|data):/iu);
});

test('Nature source preflight retains one real display and declares zero external resources', () => {
  const page = parseNaturePage(html, provenance.url);
  opened.push(page.dom);
  assert.equal(page.debug.articleRoot, '.c-article-body');
  assert.equal(page.tables.length, 0);
  assert.equal(page.figures.length, 0);
  assert.equal(page.references.length, 68);
  assert.equal(page.semantic.displayMath.length, provenance.sourceDisplay.sourceDisplayCount);
  assert.equal(page.semantic.displayMath[0].tex, provenance.sourceDisplay.sourceTeX);
  assert.deepEqual(page.metadata.authors, provenance.sourceRights.orderedSourceCreators);
});

for (const citationStyle of ['markdown', 'links', 'quarto']) {
  test(`source controls preserve actual indexed distance, powers, independent terms and citations (${citationStyle})`, async () => {
    const result = await clip(citationStyle);
    // These controls come from the same untouched full paragraph, not synthetic source claims.
    assert.ok(result.markdown.includes('$r_{ij}$'));
    for (const exponent of ['−3', '−4', '−5']) assert.ok(result.markdown.includes(`$10^{${exponent}}$`));
    assert.ok(result.markdown.includes('$0e$\u2009+\u2009$1e$\u2009+\u2009$2e$'));
    assert.equal(result.semantic.displayMath.length, 1);
    assert.equal(result.semantic.displayMath[0].tex, provenance.sourceDisplay.sourceTeX);
    // Existing C source-equations contract allows this braced legacy font switch.
    // TeX symbols/attachments/order are unchanged, and the original semantic TeX is exact above.
    const renderedEquation = provenance.sourceDisplay.sourceTeX.replace(/\{\s*\\rm\s*\{([^{}]*)\}\}/gu, '\\mathrm{$1}');
    assert.equal(result.markdown.split(renderedEquation).length - 1, 1);
    assert.equal(result.debug.markdownStructure.valid, true);
    assert.equal(result.debug.crossReferenceValidation.valid, true);
    assert.equal(result.references.length, 68);
    assert.equal(result.tables.length, 0);
    assert.equal(result.figures.length, 0);
    assert.deepEqual(result.debug.warnings, ['No Nature figures were detected.']);
    assert.deepEqual(result.semantic.citations.flatMap(item => item.numbers), [30,66,67,68,30]);
    if (citationStyle !== 'links') assert.equal(result.debug.rawHtmlValidation.valid, true);
  });

  test(`real source styled adjacency preserves tokens/style and adds no display (${citationStyle})`, async t => {
    const result = await clip(citationStyle);
    const expression = modelExpression(result.markdown);
    assert.ok(expression, 'The complete original scientific context must survive');
    assert.equal(expression.replace(/[$*]/gu, ''), provenance.sourceParagraph.text, 'Numbers, italic variables, plus signs, zero gaps and U+2009 operator spacing come from source');
    assert.doesNotMatch(expression, /[\^_{}×]|\\(?:times|cdot|sup|sub)/u, 'Source has no attachment or multiplication sign in this run');
    // Accept a faithful math or Markdown italic representation, without freezing a snapshot.
    const styledLetters = [...expression.matchAll(/\$([^$\n]+)\$|(?<!\*)\*([xe])\*(?!\*)/gu)]
      .flatMap(match => match[2] ? [match[2]] : [...match[1].matchAll(/[xe]/gu)].map(letter => letter[0]));
    assert.deepEqual(styledLetters, ['x','e','x','x','x','e']);
    t.diagnostic(JSON.stringify({citationStyle,sourceDisplayCount:1,actualDisplayCount:result.debug.mathValidation.displayMathCount,math:result.debug.mathValidation.valid,mathIssueTypes:result.debug.mathValidation.issues.map(issue => issue.type),structure:result.debug.markdownStructure.valid,rawHtml:result.debug.rawHtmlValidation.valid,crossReferences:result.debug.crossReferenceValidation.valid}));
    // All checks run before the failure so RED reports the actual independent conditions.
    const failures = [];
    if (/\$\$/u.test(expression)) failures.push('Adjacent inline dollars collide inside the source run');
    if (result.debug.mathValidation.displayMathCount !== provenance.sourceDisplay.sourceDisplayCount) failures.push(`Source display count 1 became ${result.debug.mathValidation.displayMathCount}`);
    if (!result.debug.mathValidation.valid) failures.push(`Math delimiter failures: ${result.debug.mathValidation.issues.map(issue => issue.type).join(', ')}`);
    if (/ACADEMICCLIPPER[A-Z0-9-]+X/u.test(result.markdown)) failures.push('Unresolved semantic marker');
    assert.deepEqual(failures, [], 'Source-derived meaning and math boundaries must hold');
    // links ref-2 literal < is a distinct retained defect, reported above and in the handoff.
    // It is not changed or declared valid by this scoped styled-adjacency regression.
  });
}
