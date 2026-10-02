import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { JSDOM } from 'jsdom';
import { hydrateNatureTables } from '../src/adapters/nature.mjs';
import { safeFetchExternal } from '../src/security.mjs';
import { runSanitizerCli } from '../scripts/sanitize-nature-corpus.mjs';
import {
  SCHEMA_VERSION, SANITIZER_VERSION, SERIALIZER_VERSION, sha256Bytes, stableJson,
  validateManifest, validateRecipe, validateFixturePath, serializeSubtree,
  sanitizeNatureHtml, createReplay, readFixtureBytes, loadReplayResources,
  consumeExpectations, verifyManifestFixtures,
} from '../scripts/lib/nature-corpus-infrastructure.mjs';

// ALL HTML, article identities, dates and oracles below are synthetic unit inputs.
// They are not real-paper evidence and never count toward corpus admission/coverage.
const articleId = 'synthetic-infrastructure';
const url = `https://www.nature.com/articles/${articleId}`;
const hash = 'a'.repeat(64);
const tableUrl = `${url}/tables/1`;
const recipe = {
  version: '1.0.0', id: 'synthetic-v1', articleUrl: url,
  blocks: [{ id: 'metadata', selector: 'head', role: 'metadata' }, { id: 'body', selector: '.c-article-body', role: 'article-body' }],
  removeSelectors: [],
};
const html = `<!doctype html><html><head><meta name="citation_title" content="Synthetic fixture">
<script type="application/ld+json">{"@graph":[{"@type":"WebSite","name":"unrelated"},{"@type":"ScholarlyArticle","url":"${url}","headline":"Synthetic fixture","author":[{"@type":"Person","name":"Synthetic author"}]}]}</script>
<script>secret executable</script></head><body><nav>unselected navigation</nav>
<main class="c-article-body" data-test="article-body" id="main"><section data-title="Results" id="Sec1"><h2>Results</h2>
<p id="p1">A <i>x</i><sub>i</sub> − <b>β</b><sup>−2</sup> K&nbsp; T and <span class="mathjax-tex">\\(a_i \\\\ b_j\\)</span>.</p>
<figure id="Fig1"><img src="/a.png?utm_source=x" data-src="/b.png" srcset="/small.png 1x, /large.png?token=abc 2x" onclick="bad()"><figcaption>Fig. 1: synthetic only</figcaption></figure><div data-test="bottom-caption"><p>synthetic panel</p></div>
<table><thead><tr><th rowspan="2">A</th><th colspan="2">B</th></tr></thead><tbody><tr><td>C|D</td></tr></tbody></table>
<ol class="c-article-references"><li id="ref-CR1">synthetic reference one</li><li id="ref-CR2">synthetic reference two</li></ol>
<div class="cookie-banner">private session ui</div><!-- secret comment --><form><input type="hidden" value="private"></form>
<iframe src="https://example.org"></iframe><img src="data:image/png;base64,PRIVATE"><script>bad()</script>
</section></main></body></html>`;
const registry = new Map([['metadata-title', { validate: (value) => typeof value === 'string', assert: (context, expectation) => assert.equal(context.title, expectation.value) }]]);
function manifest() {
  const sanitized = sanitizeNatureHtml(html, recipe);
  return { schemaVersion: SCHEMA_VERSION, articles: [{
    articleId, url, doi: `10.1038/${articleId}`, title: 'Synthetic fixture', journal: 'Synthetic Nature',
    observedAt: '2026-10-02T00:00:00Z', captureMode: 'guarded-http', sourceSha256: hash,
    fixturePath: `fixtures/${articleId}/article.excerpt.html`, fixtureSha256: sanitized.fixtureSha256,
    sanitizerVersion: SANITIZER_VERSION, serializerVersion: SERIALIZER_VERSION, recipe: structuredClone(recipe),
    retainedBlocks: sanitized.retainedBlocks, transformations: sanitized.transformations,
    omittedContent: ['Synthetic unselected navigation'], resources: [],
    coverage: [{ feature: 'metadata', blockId: 'metadata', expectationId: 'title' }],
    expectations: [{ id: 'title', assertionId: 'metadata-title', blockIds: ['metadata'], value: 'Synthetic fixture' }],
  }] };
}
const validate = (value) => validateManifest(value, { assertionRegistry: registry });

test('strict shared manifest contract accepts registered expectations; empty preflight is allowed', () => {
  assert.equal(validate(manifest()).schemaVersion, SCHEMA_VERSION);
  assert.deepEqual(validateManifest({ schemaVersion: SCHEMA_VERSION, articles: [] }, { assertionRegistry: new Map() }).articles, []);
  assert.throws(() => validateManifest(manifest()), /assertionRegistry/);
});

test('schema rejects unknown fields recursively and unknown versions/types', () => {
  for (const mutate of [
    (m) => { m.extra = true; }, (m) => { m.articles[0].extra = true; },
    (m) => { m.articles[0].recipe.extra = true; }, (m) => { m.articles[0].retainedBlocks[0].extra = true; },
    (m) => { m.articles[0].expectations[0].extra = true; }, (m) => { m.articles[0].coverage[0].extra = true; },
    (m) => { m.schemaVersion = '2'; }, (m) => { m.articles[0].sourceSha256 = 'short'; },
    (m) => { delete m.articles[0].omittedContent; }, (m) => { m.articles[0].resources = {}; },
  ]) { const m = manifest(); mutate(m); assert.throws(() => validate(m), { code: 'FIXTURE_INTEGRITY_FAILURE' }); }
});

test('reject duplicate article/block/resource/expectation IDs and broken consumer/coverage links', () => {
  for (const mutate of [
    (m) => { m.articles.push(structuredClone(m.articles[0])); },
    (m) => { m.articles[0].retainedBlocks.push(m.articles[0].retainedBlocks[0]); },
    (m) => { m.articles[0].expectations.push(m.articles[0].expectations[0]); },
    (m) => { m.articles[0].expectations[0].assertionId = 'unregistered'; },
    (m) => { m.articles[0].expectations[0].value = { unsupported: true }; },
    (m) => { m.articles[0].expectations[0].blockIds = ['missing']; },
    (m) => { m.articles[0].coverage[0].expectationId = 'missing'; },
    (m) => { m.articles[0].coverage[0].blockId = 'body'; },
    (m) => { m.articles[0].url += '?token=secret'; },
    (m) => { m.articles[0].doi = '10.1038/different'; },
    (m) => { m.articles[0].observedAt = '2026-10-02'; },
    (m) => { m.articles[0].recipe.articleUrl = `${url}-other`; },
  ]) { const m = manifest(); mutate(m); assert.throws(() => validate(m)); }
});

test('every registered expectation executes, failures are propagated', async () => {
  const article = manifest().articles[0];
  assert.deepEqual(await consumeExpectations(article, { title: 'Synthetic fixture' }, registry), ['title']);
  await assert.rejects(() => consumeExpectations(article, { title: 'wrong' }, registry));
});

test('fixture paths are portable, exact and article-scoped', () => {
  assert.equal(validateFixturePath(`fixtures/${articleId}/tables/1.excerpt.html`, articleId), `fixtures/${articleId}/tables/1.excerpt.html`);
  for (const file of [
    '../x', `fixtures/${articleId}/../x`, `fixtures/${articleId}/tables/CON.excerpt.html`,
    `fixtures/${articleId}/tables/foo.. /x`, `fixtures/${articleId}/tables/%2e%2e.excerpt.html`,
    `fixtures/${articleId}/tables/x:ads.excerpt.html`, `fixtures/${articleId}/tables/a\\b.excerpt.html`,
    `fixtures/other/article.excerpt.html`, 'C:/private.html', `fixtures/${articleId}/raw.html`,
  ]) assert.throws(() => validateFixturePath(file, articleId), /path|excerpt/iu);
});

test('SHA-256 hashes bytes exactly including LF, UTF-8 and pre-decoding bytes', () => {
  assert.equal(sha256Bytes(Buffer.from('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.notEqual(sha256Bytes(Buffer.from('β\n')), sha256Bytes(Buffer.from('β\r\n')));
  assert.notEqual(sha256Bytes(Buffer.from([255])), sha256Bytes(Buffer.from('�')));
  assert.throws(() => sha256Bytes('decoded'), /bytes/);
});

test('source subtree serializer sorts attributes and preserves exact inline whitespace', () => {
  const dom = new JSDOM('<p z="2" a="&amp;">x <i>β</i><sub>i</sub>  Y&nbsp;Z</p>');
  try {
    assert.equal(serializeSubtree(dom.window.document.querySelector('p')), '<p a="&amp;" z="2">x <i>β</i><sub>i</sub>  Y Z</p>');
  } finally { dom.window.close(); }
});

test('sanitization is byte deterministic, idempotent and does not author scholarly content', () => {
  const first = sanitizeNatureHtml(html, recipe);
  assert.equal(first.html, sanitizeNatureHtml(html, recipe).html);
  assert.deepEqual(first.bytes, sanitizeNatureHtml(first.html, recipe).bytes);
  assert.match(first.html, /A <i>x<\/i><sub>i<\/sub> − <b>β<\/b><sup>−2<\/sup> K  T/);
  assert.match(first.html, /\\\(a_i \\\\ b_j\\\)/);
  assert.match(first.html, /<th rowspan="2">/);
  assert.match(first.html, /<th colspan="2">/);
  assert.ok(first.html.indexOf('Fig1') < first.html.indexOf('bottom-caption'));
  assert.match(first.html, /id="ref-CR1"/); assert.match(first.html, /id="ref-CR2"/);
  assert.doesNotMatch(first.html, /unselected navigation|bad\(\)|cookie-banner|private session|PRIVATE|iframe|onclick|utm_source|token=|secret comment|<form/);
  assert.match(first.html, /srcset="\/small.png 1x, \/large.png 2x"/);
  assert.equal(first.bytes.includes(13), false);
  assert.equal(first.bytes.at(-1), 10);
  assert.equal(first.fixtureSha256, sha256Bytes(first.bytes));
  const source = new JSDOM(html);
  try { assert.equal(first.retainedBlocks[1].sourceSubtreeSha256, sha256Bytes(Buffer.from(serializeSubtree(source.window.document.querySelector('.c-article-body'))))); }
  finally { source.window.close(); }
});

test('projection signatures compare the same retained projection, distinguish payload from topology', () => {
  const first = sanitizeNatureHtml(html, recipe);
  assert.deepEqual(first.signatures, sanitizeNatureHtml(first.html, recipe).signatures);
  assert.deepEqual(first.signatures, sanitizeNatureHtml(html.replace('unselected navigation', 'other unselected content'), recipe).signatures);
  const payload = sanitizeNatureHtml(html.replace('synthetic panel', 'different synthetic panel'), recipe);
  assert.equal(first.signatures.structureSha256, payload.signatures.structureSha256);
  assert.notEqual(first.signatures.payloadSha256, payload.signatures.payloadSha256);
  const topology = sanitizeNatureHtml(html.replace('<sub>i</sub>', '<sup>i</sup>'), recipe);
  assert.notEqual(first.signatures.structureSha256, topology.signatures.structureSha256);
  const metadataPayload = sanitizeNatureHtml(html.replace('Synthetic author', 'Different author'), recipe);
  assert.equal(first.signatures.structureSha256, metadataPayload.signatures.structureSha256);
  assert.notEqual(first.signatures.payloadSha256, metadataPayload.signatures.payloadSha256);
});

test('JSON-LD retains only matched article metadata, safely escapes script closing text', () => {
  const result = sanitizeNatureHtml(html, recipe);
  const dom = new JSDOM(result.html);
  try {
    assert.equal(dom.window.document.querySelectorAll('script').length, 1);
    const json = JSON.parse(dom.window.document.querySelector('script').textContent);
    assert.equal(json['@type'], 'ScholarlyArticle'); assert.equal(json.url, url);
    assert.equal(json['@graph'], undefined);
  } finally { dom.window.close(); }
  assert.throws(() => sanitizeNatureHtml(html.replace(`"url":"${url}"`, '"url":"https://other.example"'), recipe), /JSON-LD/);
  assert.throws(() => sanitizeNatureHtml(html.replace('"@graph"', '"invalid"'), recipe), /JSON-LD/);
  const escaped = sanitizeNatureHtml(html.replace('Synthetic author', 'Synthetic \\u003c/script> author'), recipe);
  const escapedDom = new JSDOM(escaped.html);
  try {
    assert.equal(escapedDom.window.document.querySelectorAll('script').length, 1);
    assert.equal(JSON.parse(escapedDom.window.document.querySelector('script').textContent).author[0].name, 'Synthetic </script> author');
    assert.deepEqual(escaped.bytes, sanitizeNatureHtml(escaped.html, recipe).bytes);
  } finally { escapedDom.window.close(); }
});

test('recipes select exact source nodes; preserve ancestors and scientific adjacency', () => {
  const selective = { ...recipe, blocks: [{ id: 'paragraph', selector: '#p1', role: 'scientific-inline' }], removeSelectors: [] };
  const result = sanitizeNatureHtml(html, selective);
  assert.match(result.html, /main class="c-article-body"/); assert.match(result.html, /section data-title="Results" id="Sec1"/);
  assert.doesNotMatch(result.html, /Fig1|synthetic panel|Results<\/h2>/);
  assert.deepEqual(result.bytes, sanitizeNatureHtml(result.html, selective).bytes);
  for (const selector of ['#missing', 'p', ':::']) assert.throws(() => sanitizeNatureHtml(html, { ...selective, blocks: [{ ...selective.blocks[0], selector }] }));
  assert.throws(() => validateRecipe({ ...selective, extra: true }), /unknown field/);
  assert.throws(() => sanitizeNatureHtml(html, { ...selective, removeSelectors: ['#p1'] }), /removed selected/);
});

test('reference selection retains original prefix and never silently renumbers later references', () => {
  const refs = { ...recipe, blocks: [{ id: 'ref2', selector: '#ref-CR2', role: 'reference' }] };
  assert.throws(() => sanitizeNatureHtml(html, refs), /complete source list prefix/);
  const both = { ...refs, blocks: [{ id: 'ref1', selector: '#ref-CR1', role: 'reference' }, ...refs.blocks] };
  assert.match(sanitizeNatureHtml(html, both).html, /ref-CR1.*ref-CR2/su);
  assert.throws(() => sanitizeNatureHtml(html, { ...recipe, removeSelectors: ['#ref-CR1'] }), /complete source list prefix/);
});

test('private/local retained material fails review instead of silently changing scholarly prose', () => {
  for (const privateText of ['password=secret', '-----BEGIN PRIVATE KEY-----', 'C:\\Users\\private\\capture']) {
    assert.throws(() => sanitizeNatureHtml(html.replace('synthetic panel', privateText), recipe), /Private\/local/);
  }
});

test('sensitive metadata and signed resource values are removed, scholarly external fragments remain', () => {
  const altered = html.replace('<meta name="citation_title"', '<meta name="csrf-token" content="PRIVATE"><meta name="citation_title"')
    .replace('/a.png?utm_source=x', '/a.png?access_token=PRIVATE&signature=PRIVATE&width=200#part')
    .replace('<p id="p1">', '<p id="p1"><a href="https://www.nature.com/articles/other#Sec2">external</a>');
  const result = sanitizeNatureHtml(altered, recipe);
  assert.doesNotMatch(result.html, /csrf-token|PRIVATE|access_token|signature=/);
  assert.match(result.html, /src="\/a.png\?width=200#part"/);
  assert.match(result.html, /https:\/\/www.nature.com\/articles\/other#Sec2/);
});

test('independent table resource provenance, blocks and size review are executable', async (t) => {
  const root = await temp(t); const m = manifest(); const article = m.articles[0];
  const tableRecipe = { ...recipe, id: 'synthetic-table', blocks: [{ id: 'table-cells', role: 'table', selector: '#table-root' }] };
  const tableHtml = '<html><head></head><body><table id="table-root"><tr><th>A</th></tr><tr><td>B</td></tr></table></body></html>';
  const sanitized = sanitizeNatureHtml(tableHtml, tableRecipe);
  article.resources.push({ id: 'table-1', kind: 'table', url: tableUrl, method: 'GET', redirect: 'manual', status: 200, responseMocked: false,
    observedAt: '2026-10-02T01:00:00Z', captureMode: 'guarded-http', contentType: 'text/html',
    sourceSha256: sha256Bytes(Buffer.from(tableHtml)), fixturePath: `fixtures/${articleId}/tables/1.excerpt.html`, fixtureSha256: sanitized.fixtureSha256,
    sanitizerVersion: SANITIZER_VERSION, serializerVersion: SERIALIZER_VERSION, recipe: tableRecipe,
    retainedBlocks: sanitized.retainedBlocks, transformations: sanitized.transformations, omittedContent: [] });
  const files = [[article.fixturePath, sanitizeNatureHtml(html, recipe).bytes], [article.resources[0].fixturePath, sanitized.bytes]];
  for (const [file, bytes] of files) { await mkdir(path.dirname(path.join(root, file)), { recursive: true }); await writeFile(path.join(root, file), bytes); }
  assert.equal((await verifyManifestFixtures(m, root, { assertionRegistry: registry })).files.length, 2);
  const transport = replay(await loadReplayResources(article, root)); const value = table();
  assert.deepEqual(await hydrateNatureTables([value], url, transport), []); transport.assertClean();
  const oversized = sanitizeNatureHtml(tableHtml.replace('<td>B</td>', `<td>${'x'.repeat(65 * 1024)}</td>`), tableRecipe);
  const resource = article.resources[0]; resource.fixtureSha256 = oversized.fixtureSha256;
  await writeFile(path.join(root, resource.fixturePath), oversized.bytes);
  await assert.rejects(() => verifyManifestFixtures(m, root, { assertionRegistry: registry }), /Size limit/);
  resource.sizeException = { reason: 'Synthetic size boundary exercise only', reviewedBy: 'synthetic-test' };
  assert.equal((await verifyManifestFixtures(m, root, { assertionRegistry: registry })).files.length, 2);
});

function replayResource(overrides = {}) {
  return { method: 'GET', redirect: 'manual', url: tableUrl, status: 200, responseMocked: true,
    headers: { 'content-type': 'text/html' }, bodyBytes: Buffer.from('<table><tr><th>A</th></tr><tr><td>B</td></tr></table>'), ...overrides };
}
function replay(resources = [replayResource()]) {
  return createReplay({ resources, dns: { 'www.nature.com': [{ address: '93.184.216.34', family: 4 }] } });
}
function table() { return { label: 'Synthetic Table 1', url: tableUrl, tableHtml: '', tableContentStatus: 'not-loaded' }; }

test('replay fresh response/body/header/DNS/ledger isolation and exact request signature', async () => {
  const resource = replayResource(); const transport = replay([resource]);
  resource.bodyBytes.fill(0);
  const a = await transport.fetchImpl(tableUrl, { redirect: 'manual' });
  a.headers.set('content-type', 'mutated');
  assert.match(await a.text(), /<table>/);
  const b = await transport.fetchImpl(tableUrl, { redirect: 'manual' });
  assert.equal(b.headers.get('content-type'), 'text/html'); assert.match(await b.text(), /<table>/);
  const dnsA = await transport.resolveHostname('www.nature.com', { all: true, verbatim: true }); dnsA[0].address = '127.0.0.1';
  assert.equal((await transport.resolveHostname('www.nature.com', { all: true, verbatim: true }))[0].address, '93.184.216.34');
  const ledger = transport.ledger(); ledger.requests.length = 0;
  assert.equal(transport.ledger().requests.length, 2);
  assert.equal(transport.assertClean({ expectedRequests: Array(2).fill({ url: tableUrl, method: 'GET', redirect: 'manual' }), expectedDns: Array(2).fill({ hostname: 'www.nature.com', all: true, verbatim: true }) }), true);
  assert.throws(() => transport.assertClean({ expectedRequests: [] }), /ledger mismatch/);
});

test('actual table hydration replay scenarios: HTML success, absence, HTTP failure', async () => {
  for (const scenario of [
    { resource: replayResource(), status: 'full-size-html', warnings: 0 },
    { resource: replayResource({ bodyBytes: Buffer.from('<p>synthetic no table</p>') }), status: 'fallback-no-html-table', warnings: 1 },
    { resource: replayResource({ status: 503, bodyBytes: undefined }), status: 'fallback-fetch-failed', warnings: 1 },
  ]) {
    const transport = replay([scenario.resource]); const value = table();
    const warnings = await hydrateNatureTables([value], url, transport);
    assert.equal(value.tableContentStatus, scenario.status); assert.equal(warnings.length, scenario.warnings);
    assert.equal(transport.ledger().requests.length, 1); assert.equal(transport.ledger().resolutions.length, 1);
    transport.assertClean();
  }
});

test('redirect replay exercises same-article success and production scope rejection', async () => {
  const final = `${url}/tables/2`;
  const transport = replay([replayResource({ status: 302, bodyBytes: undefined, headers: { location: final } }), replayResource({ url: final })]);
  const value = table(); assert.deepEqual(await hydrateNatureTables([value], url, transport), []);
  assert.equal(value.tableContentUrl, final); assert.equal(transport.ledger().requests.length, 2); transport.assertClean();
  const blocked = replay([replayResource({ status: 302, bodyBytes: undefined, headers: { location: 'https://example.org/escape' } })]);
  const fallback = table(); const warnings = await hydrateNatureTables([fallback], url, blocked);
  assert.match(warnings[0], /escaped the current article table scope/);
  assert.equal(blocked.ledger().requests.length, 1); blocked.assertClean();
});

test('unknown HTTP operation remains a teardown failure after hydration catches the exception', async () => {
  const transport = replay([]); const value = table();
  assert.equal((await hydrateNatureTables([value], url, transport)).length, 1);
  assert.equal(value.tableContentStatus, 'fallback-fetch-failed');
  assert.throws(() => transport.assertClean(), /Unexpected HTTP\/DNS ledger/);
  assert.equal(transport.ledger().unexpected[0].kind, 'http');
});

test('unknown DNS/method/redirect/body operations never fall through to live transport', async () => {
  const transport = replay();
  for (const options of [{ method: 'POST', redirect: 'manual' }, {}, { redirect: 'follow' }, { redirect: 'manual', body: 'bad' }]) {
    await assert.rejects(() => transport.fetchImpl(tableUrl, options), /Undeclared/);
  }
  await assert.rejects(() => transport.resolveHostname('unknown.example', { all: true, verbatim: true }), /Undeclared/);
  await assert.rejects(() => transport.resolveHostname('www.nature.com'), /Undeclared/);
  assert.equal(transport.ledger().unexpected.length, 6);
  assert.throws(() => transport.assertClean(), /Unexpected/);
});

test('production DNS guard still rejects injected private addresses before HTTP', async () => {
  const transport = createReplay({ resources: [replayResource()], dns: { 'www.nature.com': [{ address: '127.0.0.1', family: 4 }] } });
  await assert.rejects(() => safeFetchExternal(tableUrl, transport), /local or private/);
  assert.equal(transport.ledger().requests.length, 0); transport.assertClean();
});

test('replay declarations reject duplicate exchanges, missing mock label and secret headers', () => {
  assert.throws(() => replay([replayResource(), replayResource()]), /Duplicate/);
  assert.throws(() => replay([replayResource({ responseMocked: undefined })]), /responseMocked/);
  assert.throws(() => replay([replayResource({ headers: { cookie: 'private' } })]), /header/);
});

test('independent sanitizer/replay A-B-A state isolation without global mutations', async () => {
  const fetchBefore = globalThis.fetch, documentBefore = globalThis.document;
  const a = sanitizeNatureHtml(html, recipe);
  sanitizeNatureHtml(html.replace('Synthetic fixture', 'Synthetic B'), { ...recipe, id: 'synthetic-b' });
  const bTransport = replay([replayResource({ status: 404 })]); await hydrateNatureTables([table()], url, bTransport); bTransport.assertClean();
  assert.deepEqual(a.bytes, sanitizeNatureHtml(html, recipe).bytes);
  assert.equal(globalThis.fetch, fetchBefore); assert.equal(globalThis.document, documentBefore);
});

async function temp(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'nature-corpus-synthetic-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test('fixture integrity validates exact bytes, canonical recipe and independent resource hashes', async (t) => {
  const root = await temp(t); const m = manifest(); const article = m.articles[0];
  const file = path.join(root, article.fixturePath); await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, sanitizeNatureHtml(html, recipe).bytes);
  assert.equal((await verifyManifestFixtures(m, root, { assertionRegistry: registry })).files.length, 1);
  for (const bytes of [Buffer.from('changed\n'), Buffer.from('\uFEFFbad\n'), Buffer.from('bad\r\n'), Buffer.from([255, 10])]) {
    await writeFile(file, bytes); await assert.rejects(() => readFixtureBytes(root, article.fixturePath, articleId, article.fixtureSha256));
  }
});

test('symlink fixture escape is rejected using real paths', async (t) => {
  const root = await temp(t); const corpus = path.join(root, 'corpus'); const outside = path.join(root, 'outside');
  await mkdir(corpus); await mkdir(outside); await mkdir(path.join(corpus, 'fixtures'));
  await writeFile(path.join(outside, 'article.excerpt.html'), 'outside\n');
  try { await symlink(outside, path.join(corpus, 'fixtures', articleId), process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (error.code === 'EPERM') { t.skip('OS does not permit symlink creation'); return; } throw error; }
  await assert.rejects(() => readFixtureBytes(corpus, `fixtures/${articleId}/article.excerpt.html`, articleId, hash), /escaped corpus/);
});

test('mock manifest resources are clearly labeled and load fresh byte exchanges', async () => {
  const m = manifest(); m.articles[0].resources = [{ id: 'mock-no-table', kind: 'table', url: tableUrl, method: 'GET', redirect: 'manual', status: 200, responseMocked: true, contentType: 'text/html', body: '<p>synthetic absence</p>' }];
  validate(m); const resources = await loadReplayResources(m.articles[0], 'unused');
  assert.equal(resources[0].bodyBytes.toString(), '<p>synthetic absence</p>');
  const transport = replay(resources); assert.match(await (await transport.fetchImpl(tableUrl, { redirect: 'manual' })).text(), /synthetic absence/); transport.assertClean();
  for (const mutate of [
    (r) => { r.sourceSha256 = hash; }, (r) => { r.responseMocked = false; },
    (r) => { r.location = 'https://example.org'; }, (r) => { r.url = 'https://example.org'; },
    (r) => { r.unknown = true; },
  ]) { const copy = structuredClone(m); mutate(copy.articles[0].resources[0]); assert.throws(() => validate(copy)); }
});

test('CLI uses same sanitizer and hashes pre-decoding bytes; exclusive writes preserve existing output', async (t) => {
  const root = await temp(t); const input = path.join(root, 'raw.html'); const recipeFile = path.join(root, 'recipe.json'); const output = path.join(root, 'article.excerpt.html');
  await writeFile(input, html); await writeFile(recipeFile, JSON.stringify(recipe));
  const args = ['--input', input, '--recipe', recipeFile, '--output', output, '--kind', 'article'];
  const result = await runSanitizerCli(args);
  assert.equal(result.sourceSha256, sha256Bytes(await readFile(input)));
  assert.equal(result.fixtureSha256, sha256Bytes(await readFile(output)));
  await assert.rejects(() => runSanitizerCli(args), { code: 'EEXIST' });
  await assert.rejects(() => runSanitizerCli(['--unknown']), { code: 'USAGE' });
  await assert.rejects(() => runSanitizerCli([...args, '--kind', 'table']), { code: 'USAGE' });
  await assert.rejects(() => runSanitizerCli(args.map((item) => item === output ? input : item)), { code: 'USAGE' });
});

test('CLI manifest preflight shares schema/registry contract and rejects unknown options with exit 64', async (t) => {
  const root = await temp(t); const manifestFile = path.join(root, 'manifest.json'); const registryFile = path.join(root, 'registry.mjs');
  await writeFile(manifestFile, JSON.stringify({ schemaVersion: SCHEMA_VERSION, articles: [] }));
  await writeFile(registryFile, 'export const assertionRegistry = new Map();\n');
  assert.deepEqual(await runSanitizerCli(['--validate-manifest', manifestFile, '--corpus-root', root, '--registry', registryFile]), { files: [], totalBytes: 0 });
  const child = spawnSync(process.execPath, ['scripts/sanitize-nature-corpus.mjs', '--unknown'], { encoding: 'utf8', windowsHide: true });
  assert.equal(child.status, 64); assert.match(child.stderr, /USAGE/);
});
