import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { parseNaturePage } from '../src/adapters/nature.mjs';
import { clipNature } from '../src/clip.mjs';
import { withDomGlobals } from '../src/dom-runtime.mjs';
import { defuddleToMarkdown } from '../src/markdown.mjs';
import { normalizeMath } from '../src/normalizers/math.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';

const fixtureRoot = new URL('./fixtures/nature-literal-brackets/', import.meta.url);
const ids = ['s41586-022-04755-5', 's41467-023-44030-3'];
const records = await Promise.all(ids.map(async (id) => {
  const provenance = JSON.parse(await readFile(new URL(`${id}.provenance.json`, fixtureRoot), 'utf8'));
  const bytes = await readFile(new URL(provenance.fixture.path, fixtureRoot));
  assert.equal(bytes.length, provenance.fixture.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), provenance.fixture.sha256);
  return { id, provenance, html:bytes.toString('utf8') };
}));
const opened = [];
after(() => { for (const dom of opened) dom.window.close(); });

test('lawful literal bracket excerpts preserve source identities, creators, semantic blocks and original scientific nodes', () => {
  for (const { id, provenance, html } of records) {
    const dom = new JSDOM(html); opened.push(dom);
    const document = dom.window.document;
    assert.equal(document.querySelector('link[rel="canonical"]').href, provenance.source.canonical);
    assert.equal(document.querySelector('meta[name="citation_doi"]').content, provenance.source.doi);
    assert.deepEqual([...document.querySelectorAll('meta[name="citation_author"]')].map(node => node.content), provenance.sourceRights.orderedSourceCreators);
    assert.equal(provenance.sourceRights.orderedSourceCreators.length, id === ids[0] ? 35 : 9);
    assert.equal(provenance.sourceRights.notices[0].sourceLicenseLinks[0].href, 'http://creativecommons.org/licenses/by/4.0/');
    assert.ok(provenance.sourceRights.notices[0].sourceNoticeText.startsWith('Open Access This article is licensed under a Creative Commons Attribution 4.0'));
    const paragraph = document.querySelector(provenance.paragraph.selector);
    assert.equal(paragraph.textContent, provenance.paragraph.sourceText);
    assert.deepEqual([...paragraph.querySelectorAll('sup,sub,i,.u-small-caps')].map(node => ({tag:node.tagName,text:node.textContent})), provenance.paragraph.orderedScientificNodes);
    const equations = [...document.querySelectorAll('.c-article-equation')];
    assert.equal(equations.length, provenance.expected.displayCount);
    assert.deepEqual(equations.map(node => node.id), provenance.expected.equations.map(equation => equation.id));
    for (const equation of provenance.expected.equations) {
      assert.deepEqual([...document.getElementById(equation.id).querySelectorAll('.mathjax-tex')].map(node => node.textContent), equation.originalTeX);
    }
    for (const block of provenance.expected.sourceRecords) assert.equal(document.querySelector(block.selector).textContent, block.text);
    assert.equal(document.querySelectorAll('ol.c-article-references li, ol.c-article-references__list li').length, provenance.expected.referencePrefix);
    assert.ok(provenance.fixture.repeatBytesEqual && provenance.fixture.idempotentBytesEqual);
    assert.notEqual(provenance.paragraph.rawPreSanitizationSha256, provenance.paragraph.frozenParagraphSha256);
    assert.doesNotMatch(html, /ACADEMICCLIPPER|data-track|<script(?![^>]*type="application\/ld\+json")/u);
  }
});

for (const record of records) {
  for (const dialect of ['markdown', 'links', 'quarto']) {
    test(`${record.id} literal brackets retain source boundaries without phantom math (${dialect})`, async () => {
      const page = parseNaturePage(record.html, record.provenance.source.url); opened.push(page.dom);
      assert.equal(page.tables.length, 0, 'This real excerpt needs no live DNS/HTTP or resource replay');
      const result = await clipNature({html:record.html,url:record.provenance.source.url,citationStyle:dialect});
      const { expected } = record.provenance;
      assert.equal(result.debug.equations, expected.displayCount);
      assert.deepEqual(result.semantic.displayMath.map(math => math.tex), expected.equations.flatMap(equation => equation.originalTeX.map(tex => tex.slice(2, -2).trim())), 'Original typed equation payload remains independent of literal labels');
      assert.equal(result.debug.mathValidation.displayMathCount, expected.displayCount, 'Literal bracket source text must not create display equations');
      if (record.id === ids[0]) {
        assert.equal(result.markdown.split(expected.literalLabel).length - 1, expected.literalOccurrences);
        assert.doesNotMatch(result.markdown, /\$\$\s*O III|\$O III\$/u);
        let previousEquationPosition = -1;
        for (const equation of expected.equations) {
          for (const tex of equation.renderedTeX) {
            const display = `$$\n${tex}\n$$`;
            assert.equal(result.markdown.split(display).length - 1, 1, `${equation.id}: original TeX and display identity`);
            const position = result.markdown.indexOf(display);
            assert.ok(position > previousEquationPosition, 'Original equation order');
            previousEquationPosition = position;
            assert.equal(result.markdown.slice(position + display.length).match(/\(\d+\)/u)?.[0], equation.number.trim(), `${equation.id}: source equation number association`);
          }
          if (dialect === 'quarto') assert.ok(result.markdown.includes(`{#eq-equation-${equation.id.slice(3)}}`));
        }
        assert.deepEqual(result.debug.crossReferenceMap.filter(target => target.type === 'equation').map(target => target.natureId), expected.equations.map(equation => equation.id));
        for (const math of expected.inlineMath) assert.ok(result.markdown.includes(`$${math.renderedTeX}$`));
        assert.ok(result.markdown.includes(dialect === 'quarto' ? '[Methods](#sec-methods)' : '[Methods](#methods)'));
      } else {
        const start = result.markdown.indexOf('In a preliminary screen');
        const end = result.markdown.indexOf('for binding to rat cerebral cortex', start);
        const isotopeContext = result.markdown.slice(start, end);
        assert.equal((isotopeContext.match(/\[[^\]\n]*H\]/gu) || []).length, expected.literalOccurrences, 'Original isotope label brackets remain literal boundaries');
        assert.equal((isotopeContext.match(/\^\{3\}/gu) || []).length, expected.literalOccurrences, 'Original leading isotope mass remains present');
        assert.ok(isotopeContext.includes('butylbicycloorthobenzoate'));
        assert.ok(isotopeContext.includes('TBOB'));
        assert.doesNotMatch(isotopeContext, /\$\$\^/u);
        // This contract restores literal boundaries only. Source-leading 3H
        // attachment remains an independently recorded scientific defect.
      }
      assert.ok(result.debug.rawHtmlValidation.valid);
      assert.ok(result.debug.markdownStructure.valid);
      assert.ok(result.debug.crossReferenceValidation.valid);
      assert.doesNotMatch(result.markdown, /ACADEMICCLIPPER|<math|mjx-container|<sup|<sub/u);
      const delimiterIssues = result.debug.mathValidation.issues.filter(issue => issue.type !== 'scientific-isolatedSuperscript');
      assert.deepEqual(delimiterIssues, [], 'Production math validation still runs; unrelated source units/isotope attachment remain rejected');
    });
  }
}

// Synthetic controls below are ordinary labels/math/code and are not Nature
// scientific source admission, authored article prose or fabricated equations.
function syntheticBody(contents) {
  return `<!doctype html><html><body><div class="c-article-body">${contents}</div></body></html>`;
}

test('synthetic MathJax and explicit legacy delimiters retain their original math roles', async () => {
  const page = parseNaturePage(syntheticBody(String.raw`<p><span class="mathjax-tex">\(x_{i}\)</span></p><div class="c-article-equation" id="Equ1"><span class="mathjax-tex">\[y_{j}\]</span></div><p>\[z\]</p><p>$$w$$</p><p>\(q\)</p>`), 'https://www.nature.com/articles/synthetic-control');
  opened.push(page.dom);
  assert.equal(page.semantic.inlineMath[0].tex, String.raw`x_{i}`);
  assert.equal(page.semantic.displayMath[0].tex, String.raw`y_{j}`);
  const markdown = await withDomGlobals(page.dom, async () => normalizeMath((await defuddleToMarkdown(page.document, 'https://www.nature.com/articles/synthetic-control')).markdown, page.semantic));
  assert.ok(markdown.includes('$x_{i}$'));
  assert.ok(markdown.includes('$$\ny_{j}\n$$'));
  assert.ok(markdown.includes('$$\nz\n$$'));
  assert.ok(markdown.includes('$$w$$'));
  assert.ok(markdown.includes('$q$'));
  assert.equal(validateMathDelimiters(markdown).displayMathCount, 3);
});

test('synthetic code, reference DOM, bracket citation ranges and known internal targets keep their source text', () => {
  const html = syntheticBody('<p><code>[code]</code><kbd>[key]</kbd><samp>[sample]</samp><a href="#ref-CR1" data-test="citation-ref">[1–3]</a> <a href="#other" data-test="citation-ref">[4–6]</a> <a href="#ref-CR7">[7–9]</a> <a href="#Sec1">Section</a></p><pre>[preformatted]</pre><h2 id="Sec1">Section</h2><ol class="c-article-references"><li id="ref-CR1">[reference]</li></ol>');
  const page = parseNaturePage(html, 'https://www.nature.com/articles/synthetic-control'); opened.push(page.dom);
  assert.equal(page.document.querySelector('code').textContent, '[code]');
  assert.equal(page.document.querySelector('kbd').textContent, '[key]');
  assert.equal(page.document.querySelector('samp').textContent, '[sample]');
  assert.equal(page.document.querySelector('pre').textContent, '[preformatted]');
  assert.deepEqual(page.semantic.citations.map(citation => citation.numbers), [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  assert.ok(page.semantic.crossReferences.has('Sec1'));
  assert.equal(page.references.length, 1);
  assert.equal(page.references[0].text, '[reference]');
});

test('synthetic explicitly escaped source delimiters remain available to legacy normalization', () => {
  const page = parseNaturePage(syntheticBody(String.raw`<p>\[legacy\] and \(inline\)</p><code>\[code\]</code>`), 'https://www.nature.com/articles/synthetic-control'); opened.push(page.dom);
  assert.equal(page.document.querySelector('p').textContent, String.raw`\[legacy\] and \(inline\)`);
  assert.equal(page.document.querySelector('code').textContent, String.raw`\[code\]`);
  assert.equal(page.semantic.literalText.length, 0);
});

test('synthetic nested bracket TeX and escaped source edges retain their explicit legacy identity', async () => {
  const page = parseNaturePage(syntheticBody(String.raw`<p>\[\left[label\right]\]</p><p>\[edge</p><p>edge\]</p><code>\[escaped code\]</code>`), 'https://www.nature.com/articles/synthetic-control'); opened.push(page.dom);
  assert.equal(page.document.querySelectorAll('p')[1].textContent, String.raw`\[edge`);
  assert.equal(page.document.querySelectorAll('p')[2].textContent, String.raw`edge\]`);
  assert.equal(page.document.querySelector('code').textContent, String.raw`\[escaped code\]`);
  const legacy = page.document.querySelector('p');
  const restored = normalizeMath(legacy.textContent, page.semantic);
  assert.equal(restored, String.raw`$$
\left[label\right]
$$`);
});

test('synthetic numeric crystallographic directions remain literal prose', async () => {
  const page = parseNaturePage(syntheticBody('<p>[100], [210], [001] and [111]-strained</p>'), 'https://www.nature.com/articles/synthetic-control'); opened.push(page.dom);
  const markdown = await withDomGlobals(page.dom, async () => normalizeMath((await defuddleToMarkdown(page.document, 'https://www.nature.com/articles/synthetic-control')).markdown, page.semantic));
  for (const text of ['[100]', '[210]', '[001]', '[111]-strained']) assert.ok(markdown.includes(text));
  assert.equal(validateMathDelimiters(markdown).displayMathCount, 0);
});
