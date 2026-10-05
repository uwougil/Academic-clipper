import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { clipNature, referencesBib } from '../src/clip.mjs';
import { hydrateNatureTables, parseNaturePage } from '../src/adapters/nature.mjs';
import { withDomGlobals } from '../src/dom-runtime.mjs';
import { normalizeAcademicInline } from '../src/normalizers/academic-inline.mjs';
import { normalizeTableContents, renderTables } from '../src/normalizers/figures.mjs';
import { outputPolicy } from '../src/renderers/output-policy.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';
import { validateMarkdownStructure } from '../src/validators/markdown-structure.mjs';
import { validateRawHtml } from '../src/validators/html-audit.mjs';
import { validateCrossReferences } from '../src/validators/cross-references.mjs';

const fixtureRoot = new URL('./fixtures/nature-scientific-units/', import.meta.url);
const ids = ['s41598-018-38309-5', 's41586-022-04755-5'];
const records = await Promise.all(ids.map(async id => {
  const provenance = JSON.parse(await readFile(new URL(`${id}.provenance.json`, fixtureRoot), 'utf8'));
  const articleBytes = await readFile(new URL(provenance.article.fixturePath, fixtureRoot));
  const tableBytes = provenance.table ? await readFile(new URL(provenance.table.fixturePath, fixtureRoot)) : null;
  return { id, provenance, articleBytes, tableBytes, html: articleBytes.toString('utf8') };
}));

// Defuddle retains the first DOM realm it receives; close supplied realms only after the run.
const opened = [];
after(() => { for (const dom of opened) dom.window.close(); });
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

function plainTex(value) {
  return value.replace(/\\mathrm\{([^{}]*)\}/gu, '$1').replace(/−/gu, '-');
}

function powerPairs(markdown) {
  return Array.from(markdown.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)).flatMap(([, expression]) => (
    Array.from(plainTex(expression).matchAll(/([A-Za-zÅ]+|10)\^\{([+\-]?\d+)\}/gu), match => [match[1], match[2]])
  ));
}

function assertValidators(markdown, citationStyle) {
  const policy = outputPolicy(citationStyle);
  for (const validation of [
    validateMathDelimiters(markdown),
    validateMarkdownStructure(markdown, { dialect: policy.dialect, citationStyle }),
    validateRawHtml(markdown, { allowHtmlAnchors: policy.allowHtmlAnchors }),
    validateCrossReferences(markdown, { dialect: policy.dialect, citationStyle }),
  ]) assert.equal(validation.valid, true, JSON.stringify(validation));
  assert.equal(validateMathDelimiters(markdown).scientificFragments.valid, true);
}

test('unit excerpts retain frozen source identities, complete creators, licenses and source powers', () => {
  for (const record of records) {
    const { provenance } = record;
    for (const [bytes, resource] of [[record.articleBytes, provenance.article], ...(record.tableBytes ? [[record.tableBytes, provenance.table]] : [])]) {
      assert.equal(bytes.length, resource.fixtureBytes);
      assert.equal(digest(bytes), resource.fixtureSha256);
      assert.equal(resource.sanitizerVersion, 'nature-corpus-sanitizer/1.1.0');
      assert.equal(resource.serializerVersion, 'nature-corpus-subtree/1.0.0');
      assert.equal(resource.repeatedBytesEqual, true);
      assert.equal(resource.idempotentBytesEqual, true);
    }
    const dom = new JSDOM(record.html);
    opened.push(dom);
    const document = dom.window.document;
    assert.deepEqual(Array.from(document.querySelectorAll('meta[name="citation_author"]'), node => node.content), provenance.sourceRights.orderedSourceCreators);
    const rights = document.querySelector('section[data-title="Rights and permissions"] p');
    assert.equal(rights.textContent.replace(/\s+/gu, ' ').trim(), provenance.sourceRights.notices[0].sourceNoticeText);
    assert.equal(rights.querySelector('a').getAttribute('href'), provenance.sourceRights.notices[0].sourceLicenseLinks[0].href);
    if (provenance.sourceUnitPowers) {
      for (const block of provenance.sourceUnitPowers) {
        const selector = provenance.article.recipe.blocks.find(candidate => candidate.id === block.blockId).selector;
        const paragraph = document.querySelector(selector);
        const pairs = Array.from(paragraph.querySelectorAll('sup')).filter(sup => !sup.querySelector('a')).map(sup => [sup.previousSibling.textContent.match(/[A-Za-z]+$/u)[0], sup.textContent]);
        assert.deepEqual(pairs, block.pairs);
        assert.equal(provenance.article.sourcePositions.find(position => position.id === block.blockId).sourceParagraphIndex, block.sourceParagraphIndex);
      }
      assert.equal(document.querySelectorAll('ol.c-article-references li').length, 73);
    } else {
      const tableDom = new JSDOM(record.tableBytes.toString('utf8'));
      opened.push(tableDom);
      const table = tableDom.window.document.querySelector('table');
      assert.equal(table.rows.length, provenance.table.physicalRows);
      assert.equal(provenance.table.sourcePowers.length, 12);
      for (const source of provenance.table.sourcePowers) {
        const cell = table.rows[source.rowIndex].cells[source.cellIndex];
        const superscripts = Array.from(cell.querySelectorAll('sup')).filter(sup => /^[−+\-]?\d+$/u.test(sup.textContent));
        const sup = superscripts[source.powerIndex];
        assert.equal(sup.previousSibling.textContent.match(/(?:[A-Za-z]+|10)$/u)[0], source.base);
        assert.equal(sup.textContent, source.exponent);
      }
      assert.equal(tableDom.window.document.querySelectorAll('.c-article-table-footer li').length, 6);
    }
  }
});

for (const citationStyle of ['markdown', 'quarto', 'links']) {
  test(`source Methods units retain their bases, powers, separators and citations: ${citationStyle}`, async () => {
    const record = records[0];
    const result = await clipNature({ html: record.html, url: record.provenance.url, citationStyle });
    const expected = record.provenance.sourceUnitPowers.flatMap(block => block.pairs).map(([base, exponent]) => [base, exponent.replace(/−/gu, '-')]);
    assert.deepEqual(powerPairs(result.markdown), expected, 'Plain unit bases must be inside the same math expression as their powers');
    const body = plainTex(result.markdown);
    assert.match(body, /m\^\{3\}\$\s*\/\$m\^\{3\}/u, 'The original m³/m³ division must remain between its two attached unit powers');
    assert.match(body, /kg\s+\$m\^\{-2\}\$\s+\$s\^\{-1\}\$/u);
    assert.match(body, /kg\/\$m\^\{2\}\$/u);
    assert.deepEqual(result.semantic.citations.map(citation => citation.numbers), record.provenance.sourceCitationClusters);
    assert.equal(result.references.length, 73);
    assert.deepEqual(result.metadata.authors, record.provenance.sourceRights.orderedSourceCreators);
    assert.deepEqual(result.debug.warnings, ['No Nature figures were detected.', 'No equation nodes were detected.']);
    if (citationStyle === 'quarto') {
      const bibliography = referencesBib(result.references);
      const bibliographyKeys = new Set(Array.from(bibliography.matchAll(/^@[A-Za-z]+\{([^,]+),/gmu), match => match[1]));
      for (const citation of result.semantic.citations) for (const number of citation.numbers) {
        const key = result.references.find(reference => reference.number === number).citationKey;
        assert.ok(result.markdown.includes(`@${key}`));
        assert.ok(bibliographyKeys.has(key));
      }
    }
    assertValidators(result.markdown, citationStyle);
  });
}

async function hydratedTable(record) {
  const page = parseNaturePage(record.html, record.provenance.url);
  opened.push(page.dom);
  assert.equal(page.tables.length, 1);
  const requests = [], resolutions = [], unexpected = [];
  const warnings = await hydrateNatureTables(page.tables, record.provenance.url, {
    fetchImpl: async (url, options) => {
      const request = { url, method: options.method || 'GET', redirect: options.redirect };
      requests.push(request);
      if (url !== record.provenance.table.url || request.method !== 'GET' || request.redirect !== 'manual') {
        unexpected.push(request);
        throw new Error('Undeclared table request');
      }
      return new Response(record.tableBytes, { status: 200, headers: { 'content-type': 'text/html' } });
    },
    resolveHostname: async (hostname, options) => {
      resolutions.push({ hostname, ...options });
      if (hostname !== 'www.nature.com') {
        unexpected.push({ hostname });
        throw new Error('Undeclared DNS request');
      }
      return [{ address: '151.101.0.95', family: 4 }];
    },
  });
  assert.deepEqual(unexpected, []); // Hydration can catch replay errors, so inspect this separately.
  assert.deepEqual(requests, [{ url: record.provenance.table.url, method: 'GET', redirect: 'manual' }]);
  assert.deepEqual(resolutions, [{ hostname: 'www.nature.com', all: true, verbatim: true }]);
  assert.deepEqual(warnings, []);
  await withDomGlobals(page.dom, () => normalizeTableContents(page.tables, record.provenance.url));
  return page.tables[0];
}

for (const citationStyle of ['markdown', 'quarto', 'links']) {
  test(`source FRB table preserves 12 unit and numeric powers: ${citationStyle}`, async () => {
    const record = records[1];
    const table = await hydratedTable(record);
    const expected = record.provenance.table.sourcePowers.map(source => [source.base, source.exponent.replace(/−/gu, '-')]);
    const markdown = renderTables([table], outputPolicy(citationStyle));
    assert.deepEqual(powerPairs(markdown), expected, 'Table unit and numeric bases must be attached to their own source powers');
    assert.equal(table.tableContentStatus, 'full-size-html');
    assert.match(plainTex(markdown), /\$10\^\{37\}\$ erg/u);
    assert.match(plainTex(markdown), /3 × \$10\^\{29\}\$/u);
    assert.match(plainTex(markdown), /7\.4 × \$10\^\{40\}\$ ± 0\.2 × \$10\^\{40\}\$/u);
    assert.match(markdown, /359\.67°, 29\.91°/u);
    assert.match(markdown, /−11° 17′ 17\.32″/u);
    // Retained a–f annotations belong to the accepted Issue #45 prerequisite.
    assert.equal(table.notes?.length, 6, 'The independent table-footer prerequisite must retain all six original notes');
    assertValidators(markdown, citationStyle);
  });
}

test('synthetic boundary controls preserve existing styled runs, chemistry, math, citations and independent cases', () => {
  const styled = normalizeAcademicInline('<i>P</i><sub>spin</sub><sup>-1</sup>');
  assert.equal(styled, '$P_{\\mathrm{spin}}^{-1}$');
  assert.equal(normalizeAcademicInline('Mn<sub>3</sub>Ge'), 'Mn$_{3}$Ge');
  for (const input of ['$x^{2}$', '$10^{-4}$', '$$\nE=mc^2\n$$', '[O III]', '[^3]', '[@source]', '`m$^{3}$`', '```text\nm$^{3}$\n```']) {
    assert.equal(normalizeAcademicInline(input), input);
  }
  for (const [input, expected] of [
    ['items<sup>2</sup>', 'items$^{2}$'],
    ['sample<sup>-1</sup>', 'sample$^{-1}$'],
    ['column<sup>3</sup>', 'column$^{3}$'],
    ['[<sup>3</sup>H]-TBOB', '[$^{3}$H]-TBOB'],
    ['19.0 ppm <sup>1</sup>H NMR', '19.0 ppm$^{1}$H NMR'],
    ['r<sup>2</sup>SCAN', 'r$^{2}$SCAN'],
    ['m<sup>a</sup>', 'm$^{a}$'],
  ]) assert.equal(normalizeAcademicInline(input), expected);
  const citation = 'm<sup><a data-test="citation-ref" href="#ref-CR3">3</a></sup>';
  assert.equal(normalizeAcademicInline(citation), 'm$^{<a data-test="citation-ref" href="#ref-CR3">3</a>}$');
  assert.equal(validateMathDelimiters('m$^{3}$').valid, false, 'Scientific validators must continue rejecting the old orphan');
});

test('synthetic unit prefixes and explicit numeric bases keep typed signed powers', () => {
  for (const [html, expected] of [
    ['cm<sup>−3</sup>', '$\\mathrm{cm}^{−3}$'],
    ['ml<sup>-1</sup>', '$\\mathrm{ml}^{-1}$'],
    ['Å<sup>3</sup>', '$\\mathrm{Å}^{3}$'],
    ['atom<sup>−1</sup>', '$\\mathrm{atom}^{−1}$'],
    ['10<sup>37</sup>', '$10^{37}$'],
    ['2.5<sup>+2</sup>', '$2.5^{+2}$'],
  ]) {
    const result = normalizeAcademicInline(html);
    assert.equal(result, expected);
    assert.equal(validateMathDelimiters(result).valid, true);
    assert.equal(normalizeAcademicInline(result), result);
  }
});

test('literal powers respect escaped math delimiters and backslash parity', () => {
  for (const opaque of [String.raw`$\text{cost \$5}$`, String.raw`$x \\ $`, '$$\n\\text{cost \\$5}\n$$']) {
    const expected = `${opaque} $\\mathrm{cm}^{2}$`;
    const result = normalizeAcademicInline(`${opaque} cm<sup>2</sup>`);
    assert.equal(result, expected);
    assert.equal(normalizeAcademicInline(result), expected);
    assert.equal(validateMathDelimiters(result).valid, true);
  }
  assert.equal(normalizeAcademicInline(String.raw`\$5 cm<sup>2</sup>`), String.raw`\$5 $\mathrm{cm}^{2}$`);
});

test('literal powers preserve nested inline code and complete fenced code spans', () => {
  for (const opaque of ['``a``` m$^{3}$``', '``a` m$^{3}$``', '```text\nm$^{3}$\n````', '~~~text\nm$^{3}$\n~~~']) {
    const expected = `${opaque}\n$\\mathrm{cm}^{2}$`;
    const result = normalizeAcademicInline(`${opaque}\ncm<sup>2</sup>`);
    assert.equal(result, expected);
    assert.equal(normalizeAcademicInline(result), expected);
  }
  assert.equal(normalizeAcademicInline('~~~text\nm$^{3}$'), '~~~text\nm$^{3}$');
  assert.equal(normalizeAcademicInline('~~~text\nm$^{3}$\n~~\ns$^{-1}$'), '~~~text\nm$^{3}$\n~~\ns$^{-1}$');
  assert.equal(normalizeAcademicInline('\\` cm<sup>2</sup>'), '\\` $\\mathrm{cm}^{2}$');
});

for (const [name, code] of [
  ['four-space indented code', '    m$^{3}$'],
  ['tab-indented code', '\tm$^{3}$'],
  ['blockquoted tilde fence', '> ~~~text\n> m$^{3}$\n> ~~~'],
  ['list tilde fence', '- ~~~text\n  m$^{3}$\n  ~~~'],
  ['blockquoted indented code', '>     m$^{3}$'],
  ['list indented code', '- Prose\n\n      m$^{3}$'],
  ['nested quote/list fence', '> - ~~~text\n>   m$^{3}$\n>   ~~~'],
  ['ordered list fence', '12. ~~~text\n    m$^{3}$\n    ~~~'],
  ['empty list item with indented code', '- \n      m$^{3}$'],
  ['tab-padded list item with indented code', '-\tProse\n\n\t\tm$^{3}$'],
  ['blockquoted fence ending with its container', '> ~~~text\n> m$^{3}$'],
]) {
  test(`synthetic ${name} preserves code bytes and repairs the following prose unit`, () => {
    const expected = `${code}\n\n$\\mathrm{cm}^{2}$`;
    const result = normalizeAcademicInline(`${code}\n\ncm<sup>2</sup>`);
    assert.equal(result, expected);
    assert.equal(normalizeAcademicInline(result), expected);
  });
}

test('synthetic indented prose and list paragraphs still attach their unit powers', () => {
  for (const [input, expected] of [
    ['Prose continues\n    cm<sup>2</sup>', 'Prose continues\n    $\\mathrm{cm}^{2}$'],
    ['- Prose\n\n    cm<sup>2</sup>', '- Prose\n\n    $\\mathrm{cm}^{2}$'],
    ['> Prose continues\n>     cm<sup>2</sup>', '> Prose continues\n>     $\\mathrm{cm}^{2}$'],
    ['-\tProse\n\n      cm<sup>2</sup>', '-\tProse\n\n      $\\mathrm{cm}^{2}$'],
    ['    m$^{3}$\n\ncm<sup>2</sup>\n\n    s$^{-1}$', '    m$^{3}$\n\n$\\mathrm{cm}^{2}$\n\n    s$^{-1}$'],
  ]) assert.equal(normalizeAcademicInline(input), expected);
});
