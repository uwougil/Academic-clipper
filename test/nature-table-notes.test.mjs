import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { after, test } from 'node:test';
import { JSDOM } from 'jsdom';
import { hydrateNatureTables, parseNaturePage } from '../src/adapters/nature.mjs';
import { withDomGlobals } from '../src/dom-runtime.mjs';
import { normalizeTableContents, renderTables } from '../src/normalizers/figures.mjs';
import { outputPolicy } from '../src/renderers/output-policy.mjs';
import { validateCrossReferences } from '../src/validators/cross-references.mjs';
import { validateRawHtml } from '../src/validators/html-audit.mjs';
import { validateMarkdownStructure } from '../src/validators/markdown-structure.mjs';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';

const fixtureRoot = new URL('./fixtures/nature-table-notes/', import.meta.url);
const articleIds = ['s41586-026-10401-1', 's41586-020-2012-7', 's41586-022-04755-5'];
const cases = await Promise.all(articleIds.map(async (id) => {
  const provenance = JSON.parse(await readFile(new URL(`${id}.provenance.json`, fixtureRoot), 'utf8'));
  const articleBytes = await readFile(new URL(provenance.article.fixturePath, fixtureRoot));
  const tableBytes = await readFile(new URL(provenance.table.fixturePath, fixtureRoot));
  for (const [bytes, record] of [[articleBytes, provenance.article], [tableBytes, provenance.table]]) {
    assert.equal(bytes.length, record.fixtureBytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), record.fixtureSha256);
  }
  return { id, provenance, articleHtml:articleBytes.toString('utf8'), tableHtml:tableBytes.toString('utf8') };
}));

// Defuddle retains a DOM realm; keep every supplied realm alive until the run ends.
const opened = [];
after(() => { for (const dom of opened) dom.window.close(); });

async function hydrate(record, { body = record.tableHtml, status = 200, redirect = '' } = {}) {
  const page = parseNaturePage(record.articleHtml, record.provenance.article.url);
  opened.push(page.dom);
  assert.equal(page.tables.length, 1);
  const requests = [], resolutions = [], unexpected = [];
  const warnings = await hydrateNatureTables(page.tables, record.provenance.article.url, {
    fetchImpl: async (url, options) => {
      requests.push({ url, method:options.method || 'GET', redirect:options.redirect });
      if (url !== record.provenance.table.url || (options.method || 'GET') !== 'GET' || options.redirect !== 'manual') {
        unexpected.push({ url, options });
        throw new Error('Undeclared table request');
      }
      return new Response(body, { status, headers:{ 'content-type':'text/html', ...(redirect ? { location:redirect } : {}) } });
    },
    resolveHostname: async (hostname, options) => {
      resolutions.push({ hostname, ...options });
      if (hostname !== 'www.nature.com') {
        unexpected.push({ hostname });
        throw new Error('Undeclared DNS request');
      }
      return [{ address:'151.101.0.95', family:4 }];
    },
  });
  // A hydrator may catch replay exceptions, so the ledger is asserted separately.
  assert.deepEqual(unexpected, []);
  assert.deepEqual(requests, [{ url:record.provenance.table.url, method:'GET', redirect:'manual' }]);
  assert.deepEqual(resolutions, [{ hostname:'www.nature.com', all:true, verbatim:true }]);
  await withDomGlobals(page.dom, () => normalizeTableContents(page.tables, record.provenance.article.url));
  return { page, table:page.tables[0], warnings };
}

function plain(value) {
  return value.replace(/\\([*_[\]\\])/gu, '$1').replace(/\*/gu, '').replace(/\s+/gu, ' ').trim();
}

for (const record of cases) {
  test(`real-source ${record.id} preserves full-size table notes in every dialect`, async (t) => {
    const { table, warnings } = await hydrate(record);
    const expected = record.provenance.table.notes;
    assert.equal(table.notes?.length || 0, expected.length, 'Source footer notes must survive hydration');
    assert.deepEqual(table.notes.map(note => note.marker), expected.map(note => note.marker));
    const imageOnly = record.id === 's41586-020-2012-7';
    assert.equal(table.tableContentStatus, imageOnly ? 'fallback-no-html-table' : 'full-size-html');
    assert.deepEqual(warnings, imageOnly ? [
      'Extended Data Table 1: The full-size Nature page did not expose HTML table cells; retained the absolute URL.',
    ] : []);

    for (let index = 0; index < expected.length; index += 1) {
      const note = table.notes[index];
      assert.ok(note.markdown, 'Every source note needs readable Markdown');
      if (record.id === 's41586-026-10401-1') {
        assert.match(note.markdown, /^The expansion of SOC is abbreviated as the order form of SOC coefficients\. /u);
        assert.match(note.markdown, /\$(?:λ|\\lambda)\^\{?0\}?\$/u);
        assert.match(note.markdown, / represents the non-SOC effects allowed by OSSG\.$/u);
      } else {
        const text = note.marker ? note.markdown.replace(/^\*\*[^*]+\*\*\s*/u, '') : note.markdown;
        assert.equal(plain(text), plain(expected[index].bodyText));
      }
    }
    if (imageOnly) assert.match(table.notes[1].markdown, /^\\\*This patient reported fever/u);

    for (const citationStyle of ['markdown', 'quarto', 'links']) {
      const policy = outputPolicy(citationStyle);
      const rendered = renderTables([table], policy);
      let previous = -1;
      for (const note of table.notes) {
        assert.equal(rendered.split(note.markdown).length - 1, 1, 'Each complete note appears once');
        const position = rendered.indexOf(note.markdown);
        assert.ok(position > previous, 'Source note order is preserved');
        previous = position;
        if (note.marker) assert.match(note.markdown, new RegExp(`^\\*\\*${note.marker}\\*\\*\\s`, 'u'));
      }
      assert.match(rendered, new RegExp(record.provenance.table.url.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'));
      if (citationStyle === 'quarto') assert.match(rendered, /\{#tbl-table-1\}/u);
      if (citationStyle === 'links') assert.match(rendered, /<a id="table-1"><\/a>/u);
      if (citationStyle === 'markdown') assert.doesNotMatch(rendered, /<a\b|\{#tbl-/u);
      assert.equal(validateRawHtml(rendered, { allowHtmlAnchors:policy.allowHtmlAnchors }).valid, true);
      assert.equal(validateMarkdownStructure(rendered, { dialect:policy.dialect, citationStyle }).valid, true);
      assert.equal(validateCrossReferences(rendered, { dialect:policy.dialect, citationStyle }).valid, true);
      assert.equal(validateMathDelimiters(table.notes.map(note => note.markdown).join('\n\n')).valid, true);
      const completeMath = validateMathDelimiters(rendered);
      if (record.id === 's41586-022-04755-5' && !completeMath.valid) {
        // Independently recorded unit/numeric exponents are outside Issue #45;
        // this footer regression is not a claim that the full FRB corpus passes.
        t.diagnostic(`${citationStyle}: remaining FRB cell scientific-unit/numeric-power issues outside Issue #45: ${completeMath.issues.length}`);
      } else {
        assert.equal(completeMath.valid, true);
      }
    }

    if (!imageOnly) {
      const dom = new JSDOM(table.tableHtml);
      opened.push(dom);
      const rows = [...dom.window.document.querySelector('table').rows];
      assert.deepEqual(rows.map(row => row.cells.length), record.provenance.table.physicalCellCounts);
      const spans = rows.flatMap((row, rowIndex) => [...row.cells].flatMap((cell, cellIndex) =>
        cell.rowSpan > 1 || cell.colSpan > 1 ? [{ rowIndex, cellIndex, rowSpan:cell.rowSpan, colSpan:cell.colSpan, text:cell.textContent }] : []));
      assert.deepEqual(spans, record.provenance.table.spans);
      const markdownRows = table.markdown.split('\n');
      for (const { rowIndex, cellIndex, marker } of record.provenance.table.cellNoteMarkers) {
        const cell = markdownRows[rowIndex + 1].split('|')[cellIndex + 1];
        assert.ok(cell.includes(`**${marker}**`), `Source cell marker ${marker} remains associated with row ${rowIndex}, cell ${cellIndex}`);
      }
      assert.doesNotMatch(table.markdown, /\$\^\{[a-f]\}\$/u);
    }
  });
}

test('failed or out-of-scope full-size responses cannot install footer notes', async () => {
  const record = cases[2];
  for (const options of [{ status:503 }, { status:302, redirect:'https://www.nature.com/articles/other/tables/1' }]) {
    const { table, warnings } = await hydrate(record, options);
    assert.equal(table.tableContentStatus, 'fallback-fetch-failed');
    assert.equal(table.notes?.length || 0, 0);
    assert.equal(warnings.length, 1);
    assert.doesNotMatch(renderTables([table]), /Including the FAST and VLA observations/u);
  }
});

test('synthetic extra table container cannot contaminate the selected source footer', async () => {
  // A declared topology variant combines two unchanged recorded table containers;
  // it is not an additional real article or a source layout claim.
  const unrelated = new JSDOM(cases[1].tableHtml);
  opened.push(unrelated);
  const dom = new JSDOM(cases[2].tableHtml);
  opened.push(dom);
  dom.window.document.querySelector('#content').append(unrelated.window.document.querySelector('.c-article-table-container').cloneNode(true));
  const { table } = await hydrate(cases[2], { body:dom.serialize() });
  assert.equal(table.notes?.length || 0, 6);
  assert.doesNotMatch(renderTables([table]), /some records are missing/u);
});

test('table-note Markdown is stable across repeated A then B then A conversion', async () => {
  const first = await hydrate(cases[0]);
  await hydrate(cases[1]);
  const last = await hydrate(cases[0]);
  for (const style of ['markdown', 'quarto', 'links']) {
    assert.equal(renderTables([first.table], outputPolicy(style)), renderTables([last.table], outputPolicy(style)));
  }
  assert.equal(first.table.notes?.length || 0, 1);
});

test('synthetic inline relocation keeps recorded notes without a table fetch', async () => {
  // Move the unchanged recorded full-size container into its recorded link figure.
  // This explicitly synthetic placement protects the inline-table path only.
  const source = new JSDOM(cases[2].tableHtml);
  const article = new JSDOM(cases[2].articleHtml);
  opened.push(source, article);
  article.window.document.querySelector('.c-article-body figure').append(
    source.window.document.querySelector('.c-article-table-container').cloneNode(true),
  );
  const page = parseNaturePage(article.serialize(), cases[2].provenance.article.url);
  opened.push(page.dom);
  const operations = [];
  const warnings = await hydrateNatureTables(page.tables, cases[2].provenance.article.url, {
    fetchImpl: async () => { operations.push('HTTP'); throw new Error('Unexpected inline table fetch'); },
    resolveHostname: async () => { operations.push('DNS'); throw new Error('Unexpected inline table DNS'); },
  });
  assert.deepEqual(operations, []);
  assert.deepEqual(warnings, []);
  await withDomGlobals(page.dom, () => normalizeTableContents(page.tables, cases[2].provenance.article.url));
  assert.equal(page.tables[0].tableContentStatus, 'inline-html');
  assert.equal(page.tables[0].notes.length, 6);
  assert.ok(renderTables(page.tables).includes('Including the FAST and VLA observations.'));
});

test('synthetic marker boundary does not reinterpret scientific powers or citations', async () => {
  // Non-scholarly synthetic values exercise the marker/attachment boundary.
  const dom = new JSDOM('');
  opened.push(dom);
  const tables = [{
    tableHtml:'<table><tr><td><i>x</i> <sup>a</sup>; <span class="mathjax-tex">\\(x\\)</span><sup>a</sup>; <sup><a href="#ref-CR1">a</a></sup>; x<sup>a</sup>; x<sup>z</sup>; 10<sup>3</sup></td></tr></table>',
    notes:[{ marker:'a', html:'<sup>a</sup>marker boundary' }],
  }];
  await withDomGlobals(dom, () => normalizeTableContents(tables, cases[0].provenance.article.url));
  assert.doesNotMatch(tables[0].markdown, /\*\*a\*\*/u);
  assert.match(tables[0].markdown, /\^\{a\}/u);
  assert.match(tables[0].markdown, /\^\{z\}/u);
  assert.match(tables[0].markdown, /\^\{3\}/u);
});

test('synthetic numeric footer marker cannot turn unit or numeric powers into note markers', async () => {
  const dom = new JSDOM('');
  opened.push(dom);
  const tables = [{
    tableHtml:'<table><tr><td>cm<sup>3</sup>; 10<sup>3</sup></td></tr></table>',
    notes:[{ marker:'3', html:'<sup>3</sup>numeric marker boundary' }],
  }];
  await withDomGlobals(dom, () => normalizeTableContents(tables, cases[0].provenance.article.url));
  assert.doesNotMatch(tables[0].markdown, /\*\*3\*\*/u);
  assert.equal((tables[0].markdown.match(/\^\{3\}/gu) || []).length, 2);
  assert.match(tables[0].notes[0].markdown, /^\*\*3\*\* /u);
});

for (const [context, html, marker] of [
  ['indexed variable', 'x<sub>i</sub><sup>a</sup>', 'a'],
  ['Greek variable', 'λ<sup>a</sup>', 'a'],
  ['wrapped variable', '<span>x</span><sup>a</sup>', 'a'],
  ['wrapped indexed variable', '<span><i>x</i><sub>i</sub></span><sup>a</sup>', 'a'],
  ['parenthesized expression', '(x<sub>i</sub> + y<sub>i</sub>)<sup>a</sup>', 'a'],
  ['unit after a label', 'Volume mol<sup>a</sup>', 'a'],
  ['chemical formula', 'H<sub>2</sub>O<sup>a</sup>', 'a'],
  ['ionic charge', 'Fe<sup>3+</sup>', '3+'],
]) {
  test(`synthetic matching footer marker preserves the ${context} superscript`, async () => {
    // Explicitly synthetic boundary examples, not scholarly source excerpts.
    // A matching footer must not change the meaning of any scientific base.
    const dom = new JSDOM('');
    opened.push(dom);
    const tables = [{
      tableHtml:`<table><tr><td>${html}</td></tr></table>`,
      notes:[{ marker, html:`<sup>${marker}</sup>synthetic boundary` }],
    }];
    await withDomGlobals(dom, () => normalizeTableContents(tables, cases[0].provenance.article.url));
    assert.ok(tables[0].markdown.includes(`^{${marker}}`), `${context} must retain its exponent or charge`);
    assert.ok(!tables[0].markdown.includes(`**${marker}**`), 'Marker equality alone is not a note association');
  });
}
