import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { inspectIopPage, iopArticleIdentity, parseIopPage } from '../src/adapters/iop.mjs';

const synthetic = await readFile(new URL('./fixtures/iop/synthetic-head.html', import.meta.url), 'utf8');
const url = 'https://iopscience.iop.org/article/10.1088/2053-1583/synthetic';

test('IOP identity recognizes modern and legacy 2D Materials paths only', () => {
  for (const doi of ['10.1088/2053-1583/ae2b82', '10.1088/2053-1583/3/3/031012']) {
    const canonical = `https://iopscience.iop.org/article/${doi}`;
    for (const suffix of ['', '/', '/meta', '/fulltext', '?utm_source=example#fig1']) {
      assert.deepEqual(iopArticleIdentity(canonical + suffix), { doi, journal: '2D Materials', url: canonical });
    }
  }
  for (const invalid of [
    'not a URL', url.replace('https:', 'http:'),
    url.replace('iopscience.iop.org', 'iopscience.iop.org.example.com'),
    url.replace('iopscience.iop.org', 'localhost'),
    url.replace('iopscience.iop.org', 'iopscience.iop.org:444'),
    url.replace('iopscience.iop.org', 'user:secret@iopscience.iop.org'),
    url.replace('2053-1583', '1361-648X'),
    url.replace('/article/', '/journal/'), `${url}/pdf`, `${url}/figures/1`,
    url.replace('/synthetic', '/%73ynthetic'), `${url}/unrecognized`,
  ]) assert.equal(iopArticleIdentity(invalid), null, invalid);
});

test('synthetic candidate metadata preserves ordered authors and identifies its unverified status', () => {
  const result = inspectIopPage(synthetic, url);
  assert.deepEqual(result.metadata, {
    doi: '10.1088/2053-1583/synthetic', journal: '2D Materials', url,
    title: 'Synthetic preflight example', authors: ['Example A', 'Example B'],
    date: '2026/10/02', volume: '13', issue: '4',
    authorInformation: null, metadataSource: 'candidate-citation-meta',
  });
  assert.equal(result.status, 'blocked-unverified-dom');
  assert.equal(result.fullTextVerified, false);
  assert.deepEqual(result.warnings.map((warning) => warning.code), ['IOP_DOM_UNVERIFIED']);
  assert.equal(Object.hasOwn(result, 'cleanedHtml'), false);
});

test('metadata alone, a preview, or plausible synthetic body never enables full-text conversion', () => {
  for (const html of [synthetic, '<h1>Access required</h1>',
    synthetic.replace('Synthetic preview, not full text.', '<article><h2>Introduction</h2><p>Invented body</p></article>')]) {
    assert.throws(() => parseIopPage(html, url), (error) => {
      assert.equal(error.code, 'IOP_DOM_UNVERIFIED');
      assert.equal(error.diagnostics.fullTextVerified, false);
      return true;
    });
  }
  assert.equal(inspectIopPage('<h1>Access required</h1>', url).metadata, null);
});

test('preflight rejects conflicting or cross-article identity instead of silently preferring a value', () => {
  for (const html of [
    synthetic.replace('content="10.1088/2053-1583/synthetic"', 'content="10.1088/2053-1583/other"'),
    synthetic.replace('content="2D Materials"', 'content="Other IOP journal"'),
    synthetic.replace('href="https://iopscience.iop.org/article/10.1088/2053-1583/synthetic"', 'href="/article/10.1088/2053-1583/other"'),
    synthetic.replace('</head>', '<meta name="citation_doi" content="10.1088/2053-1583/other"></head>'),
  ]) assert.throws(() => inspectIopPage(html, url), (error) => /IOP_(?:IDENTITY_MISMATCH|METADATA_CONFLICT)/.test(error.code));
  assert.throws(() => inspectIopPage(synthetic, 'https://example.com'), { code: 'IOP_URL_UNSUPPORTED' });
});

test('preflight does not run scripts, load resources, or install DOM globals; repeated results are stable', () => {
  const originalDocument = globalThis.document;
  const html = synthetic.replace('</body>', '<script>globalThis.IOP_SCRIPT_EXECUTED = true</script><img src="https://localhost/private"></body>');
  const first = inspectIopPage(html, url);
  inspectIopPage('<p>Other document</p>', url);
  assert.deepEqual(inspectIopPage(html, url), first);
  assert.equal(globalThis.IOP_SCRIPT_EXECUTED, undefined);
  assert.equal(globalThis.document, originalDocument);
});

test('the Nature production entry point continues to reject IOP URLs', async () => {
  const { clipNature } = await import('../src/clip.mjs');
  await assert.rejects(() => clipNature({ html: synthetic, url }), /nature\.com/);
});
