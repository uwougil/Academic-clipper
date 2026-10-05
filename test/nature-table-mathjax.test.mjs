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

const fixtureRoot = new URL('./fixtures/nature-table-mathjax/', import.meta.url);
const provenance = JSON.parse(await readFile(new URL('s41586-022-04755-5.provenance.json', fixtureRoot), 'utf8'));
const fixtureBytes = await readFile(new URL(provenance.table.fixturePath, fixtureRoot));
const dependency = provenance.article.fixtureDependency;
const articleBytes = await readFile(new URL(`../${dependency.path}`, import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(fixtureBytes.length, provenance.table.fixtureBytes);
assert.equal(sha256(fixtureBytes), provenance.table.fixtureSha256);
assert.equal(articleBytes.length, dependency.bytes);
assert.equal(sha256(articleBytes), dependency.sha256);

// Defuddle retains its first DOM realm. Keep supplied realms until all conversions finish.
const opened = [];
const open = html => {
  const dom = new JSDOM(html);
  opened.push(dom);
  return dom;
};
after(() => { for (const dom of opened) dom.window.close(); });

function renderedCell(table, rowIndex, cellIndex) {
  // The source table's first physical row is a two-column header.
  return table.markdown.split('\n')[rowIndex + 1].split(/(?<!\\)\|/u)[cellIndex + 1].trim();
}

async function hydrate() {
  const page = parseNaturePage(articleBytes.toString('utf8'), provenance.article.url);
  opened.push(page.dom);
  assert.equal(page.tables.length, 1);
  const requests = [], resolutions = [], unexpected = [];
  const warnings = await hydrateNatureTables(page.tables, provenance.article.url, {
    fetchImpl:async (url, options) => {
      const operation = { url, method:options.method || 'GET', redirect:options.redirect };
      requests.push(operation);
      if (url !== provenance.table.url || operation.method !== 'GET' || operation.redirect !== 'manual') {
        unexpected.push(operation);
        throw new Error('Undeclared source table request');
      }
      return new Response(fixtureBytes, { headers:{'content-type':'text/html'} });
    },
    resolveHostname:async (hostname, options) => {
      resolutions.push({hostname,...options});
      if (hostname !== 'www.nature.com') {
        unexpected.push({hostname});
        throw new Error('Undeclared source table DNS request');
      }
      return [{address:'151.101.0.95',family:4}];
    },
  });
  // The hydrator catches transport errors; an undeclared operation must still fail.
  assert.deepEqual(unexpected, []);
  assert.deepEqual(requests, [{url:provenance.table.url,method:'GET',redirect:'manual'}]);
  assert.deepEqual(resolutions, [{hostname:'www.nature.com',all:true,verbatim:true}]);
  assert.deepEqual(warnings, []);
  await withDomGlobals(page.dom, () => normalizeTableContents(page.tables, provenance.article.url));
  assert.equal(page.tables[0].tableContentStatus, 'full-size-html');
  return page.tables[0];
}

test('real-source Table 1 fixture preserves original TeX, physical cells, notes and attribution', () => {
  const source = open(fixtureBytes.toString('utf8')).window.document;
  assert.doesNotMatch(fixtureBytes.toString('utf8'), /<script\b|\bon\w+\s*=|(?:data|javascript|file):/iu);
  const table = source.querySelector('#content table');
  assert.deepEqual([...table.rows].map(row => row.cells.length), provenance.table.physicalCellCounts);
  const spans = [...table.rows].flatMap((row,rowIndex) => [...row.cells].flatMap((cell,cellIndex) =>
    cell.rowSpan > 1 || cell.colSpan > 1 ? [{rowIndex,cellIndex,rowSpan:cell.rowSpan,colSpan:cell.colSpan,text:cell.textContent}] : []));
  assert.deepEqual(spans, provenance.table.spans);
  for (const expected of provenance.table.cells) {
    const cell = table.rows[expected.rowIndex].cells[expected.cellIndex];
    // These TDs have a single class attribute; source outerHTML equals A's sorted subtree bytes.
    assert.equal(sha256(Buffer.from(cell.outerHTML)), expected.sourceCellSha256);
    assert.equal(cell.outerHTML, expected.html);
    assert.deepEqual([...cell.querySelectorAll('.mathjax-tex')].map(node => node.textContent), expected.originalTeX);
    assert.doesNotMatch(expected.originalTeX.join(''), /\\_/u);
    assert.doesNotMatch(expected.expectedRenderedMath, /\\_/u);
    assert.equal((expected.expectedRenderedMath.match(/_/gu) || []).length, expected.sourceAttachment.length);
  }
  const notes = [...source.querySelectorAll('#content .c-article-table-footer li')];
  assert.equal(notes.length, 6);
  assert.deepEqual(notes.map(node => node.innerHTML), provenance.table.notes.map(note => note.html));
  assert.equal(provenance.table.cellNoteMarkers.length, 7);
  assert.equal(provenance.sourceRights.orderedSourceCreators.length, 35);
  assert.equal(provenance.sourceRights.orderedSourceCreators[0], 'Niu, C.-H.');
  assert.equal(provenance.sourceRights.orderedSourceCreators.at(-1), 'Zhang, B.');
  assert.equal(provenance.sourceRights.notices[0].sourceLicenseLinks[0].href, 'http://creativecommons.org/licenses/by/4.0/');
  assert.deepEqual(provenance.sourceRights.observedArticleRightsMetadata.map(({name,content}) => ({name,content})), [
    {name:'dc.copyright',content:'2022 The Author(s)'},
    {name:'dc.rights',content:'2022 The Author(s)'},
    {name:'prism.copyright',content:'2022 The Author(s)'},
  ]);
  assert.equal(provenance.table.sanitizerVersion, 'nature-corpus-sanitizer/1.1.0');
  assert.equal(provenance.table.serializerVersion, 'nature-corpus-subtree/1.0.0');
  assert.equal(provenance.table.repeatBytesEqual, true);
  assert.equal(provenance.table.idempotentBytesEqual, true);
});

for (const citationStyle of ['markdown', 'links', 'quarto']) {
  test(`real-source Table 1 ${citationStyle} preserves all three MathJax attachments`, async (t) => {
    const table = await hydrate();
    const policy = outputPolicy(citationStyle);
    const rendered = renderTables([table], policy);
    for (const expected of provenance.table.cells) {
      await t.test(`source cell [${expected.rowIndex}][${expected.cellIndex}] keeps its subscript operator`, () => {
        const cell = renderedCell(table, expected.rowIndex, expected.cellIndex);
        const expression = cell.match(/\$[^$]*\$/u)?.[0];
        // The oracle comes from raw MathJax and source attachment, not parser output.
        // The only presentation change here is the established old \rm font switch.
        assert.equal(expression, expected.expectedRenderedMath);
        assert.doesNotMatch(expression, /\\_/u);
        assert.equal(validateMathDelimiters(expression).valid, true);
        assert.ok(rendered.includes(cell), 'The verified cell belongs to final rendered output');
      });
    }
    assert.deepEqual(table.notes.map(note => note.marker), provenance.table.notes.map(note => note.marker));
    let position = -1;
    for (const [index,note] of table.notes.entries()) {
      const expected = provenance.table.notes[index];
      assert.equal(note.markdown, `**${expected.marker}** ${expected.bodyText}`);
      assert.equal(rendered.split(note.markdown).length - 1, 1);
      assert.ok(rendered.indexOf(note.markdown) > position);
      position = rendered.indexOf(note.markdown);
    }
    for (const {rowIndex,cellIndex,marker} of provenance.table.cellNoteMarkers) {
      assert.ok(renderedCell(table,rowIndex,cellIndex).includes(`**${marker}**`));
    }
    assert.doesNotMatch(table.markdown, /\$\^\{[a-f]\}\$/u);
    assert.ok(rendered.includes(provenance.table.url));
    assert.doesNotMatch(rendered, /ACADEMICCLIPPER|<math\b|MathML/u);
    if (citationStyle === 'quarto') assert.match(rendered, /\{#tbl-table-1\}/u);
    if (citationStyle === 'links') assert.match(rendered, /<a id="table-1"><\/a>/u);
    if (citationStyle === 'markdown') assert.doesNotMatch(rendered, /<a\b|\{#tbl-/u);
    assert.equal(validateRawHtml(rendered, {allowHtmlAnchors:policy.allowHtmlAnchors}).valid, true);
    assert.equal(validateMarkdownStructure(rendered, {dialect:policy.dialect,citationStyle}).valid, true);
    assert.equal(validateCrossReferences(rendered, {dialect:policy.dialect,citationStyle}).valid, true);
    // Report the full validator honestly. Issue #48 owns the remaining plain-unit powers.
    const wholeTableMath = validateMathDelimiters(rendered);
    t.diagnostic(`Full FRB table math validator: ${wholeTableMath.valid ? 'valid' : 'invalid'}; issues=${wholeTableMath.issues.length}. Unit/numeric-power repair belongs to Issue #48.`);
  });
}

async function normalizeSynthetic(tableHtml) {
  const dom = open('');
  const tables = [{label:'Synthetic table',anchor:'synthetic-table',caption:'Synthetic table',tableHtml}];
  await withDomGlobals(dom, () => normalizeTableContents(tables, provenance.article.url));
  return tables[0];
}

test('synthetic non-scholarly literal TeX underscores retain their escape', async () => {
  // This is a labelled literal-text boundary case, not invented scholarly content.
  const tex = String.raw`\(\text{literal\_underscore}\)`;
  const table = await normalizeSynthetic(`<table><tr><th>Literal</th></tr><tr><td><span class="mathjax-tex">${tex}</span></td></tr></table>`);
  assert.equal(renderedCell(table,1,0), String.raw`$\text{literal\_underscore}$`);
  assert.equal(validateMathDelimiters(table.markdown).valid, true);
  for (const citationStyle of ['markdown','links','quarto']) {
    assert.ok(renderTables([table],outputPolicy(citationStyle)).includes(String.raw`$\text{literal\_underscore}$`));
  }
});

test('synthetic plain underscores and inline code remain literal Markdown text', async () => {
  const table = await normalizeSynthetic('<table><tr><th>Plain</th><th>Code</th></tr><tr><td>literal_name</td><td><code>literal_name</code></td></tr></table>');
  assert.equal(renderedCell(table,1,0), String.raw`literal\_name`);
  assert.equal(renderedCell(table,1,1), '`literal_name`');
  assert.doesNotMatch(table.markdown, /\$/u);
});

test('source table conversion is deterministic through A then literal boundary then A', async () => {
  const first = await hydrate();
  await normalizeSynthetic(String.raw`<table><tr><td><span class="mathjax-tex">\(\text{literal\_underscore}\)</span></td></tr></table>`);
  const last = await hydrate();
  assert.equal(last.markdown, first.markdown);
  assert.deepEqual(last.notes, first.notes);
  for (const citationStyle of ['markdown','links','quarto']) {
    assert.equal(renderTables([last],outputPolicy(citationStyle)), renderTables([first],outputPolicy(citationStyle)));
  }
});
