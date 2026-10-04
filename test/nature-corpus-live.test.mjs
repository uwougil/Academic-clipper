import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { clipNature } from '../src/clip.mjs';
import { createReplay } from '../scripts/lib/nature-corpus-infrastructure.mjs';

// Explicitly synthetic existing unit fixture; this is transport evidence, not admission.
const fixture = await readFile(new URL('./fixtures/nature-minimal.html', import.meta.url), 'utf8');
const articleUrl = 'https://www.nature.com/articles/s41586-026-10401-1';
const tableUrl = `${articleUrl}/tables/2`;
const hydratedFixture = fixture.replace(/<table>[\s\S]*?<\/table>/u, '');
const publicDns = { 'www.nature.com': [{ address: '93.184.216.34', family: 4 }] };
const request = (url = tableUrl) => ({ url, method: 'GET', redirect: 'manual' });
const resolution = { hostname: 'www.nature.com', all: true, verbatim: true };

function replay(resources, dns = publicDns) {
  return createReplay({ resources: resources.map(({ body, location, ...resource }) => ({
    ...request(), responseMocked: true,
    headers: { 'content-type': 'text/html', ...(location ? { location } : {}) },
    bodyBytes: body == null ? undefined : Buffer.from(body), ...resource,
  })), dns });
}

test('full clip forwards declared table replay in every dialect without a writer or live DNS/HTTP', async t => {
  for (const citationStyle of ['markdown', 'links', 'quarto']) {
    const transport = replay([{ status: 200,
      body: '<table><tr><th>Transport</th><th>Value</th></tr><tr><td>Synthetic replay</td><td>7</td></tr></table>' }]);
    t.after(() => transport.assertClean({ expectedRequests: [request()], expectedDns: [resolution] }));
    const result = await clipNature({ html: hydratedFixture, url: articleUrl, citationStyle, ...transport });
    assert.equal(result.tables[0].tableContentStatus, 'full-size-html');
    assert.match(result.markdown, /Synthetic replay/);
    assert.equal(result.debug.mathValidation.valid, true);
    assert.equal(result.debug.rawHtmlValidation.valid, true);
    assert.equal(result.debug.markdownStructure.valid, true);
    assert.equal(result.debug.crossReferenceValidation.valid, true);
    assert.deepEqual(result.debug.warnings, []);
  }
});

test('full clip preserves the declared no-cell table fallback warning', async t => {
  const transport = replay([{ status: 200, body: '<main>Synthetic image-only table response</main>' }]);
  t.after(() => transport.assertClean({ expectedRequests: [request()], expectedDns: [resolution] }));
  const result = await clipNature({ html: hydratedFixture, url: articleUrl, ...transport });
  assert.equal(result.tables[0].tableContentStatus, 'fallback-no-html-table');
  assert.deepEqual(result.debug.warnings, ['Extended Data Table 1: The full-size Nature page did not expose HTML table cells; retained the absolute URL.']);
  assert.ok(result.markdown.includes(tableUrl));
});

test('full clip scope rejection never resolves or requests an escaped table URL', async t => {
  const transport = replay([{ status: 302, location: 'https://public.example/escaped', body: null }]);
  t.after(() => transport.assertClean({ expectedRequests: [request()], expectedDns: [resolution] }));
  const result = await clipNature({ html: hydratedFixture, url: articleUrl, ...transport });
  assert.equal(result.tables[0].tableContentStatus, 'fallback-fetch-failed');
  assert.match(result.debug.warnings[0], /escaped the current article table scope/u);
});

test('a swallowed undeclared operation still fails the full clip request ledger', async () => {
  const transport = replay([]);
  const result = await clipNature({ html: hydratedFixture, url: articleUrl, ...transport });
  assert.equal(result.tables[0].tableContentStatus, 'fallback-fetch-failed');
  assert.throws(() => transport.assertClean(), /Unexpected HTTP\/DNS ledger/u);
  assert.equal(transport.ledger().unexpected.length, 1);
});

test('full clip with an inline table needs no transport and keeps default bytes', async t => {
  const transport = replay([]);
  t.after(() => transport.assertClean({ expectedRequests: [], expectedDns: [] }));
  const defaults = await clipNature({ html: fixture, url: articleUrl });
  const injected = await clipNature({ html: fixture, url: articleUrl, ...transport });
  assert.equal(injected.markdown, defaults.markdown);
  assert.deepEqual(injected.debug, defaults.debug);
});
