// Cold-start composition and ownership probe, outside normal test discovery.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { setImmediate as yieldEventLoop } from 'node:timers/promises';

const order = process.argv[2];
const keys = ['window','document','DOMParser','XMLSerializer','Node','NodeFilter','HTMLElement','Element','SVGElement','Document'];
// Seed nontrivial sentinels so restoration is verified for present properties,
// while absent keys must stay absent. No adapter is imported under sentinels.
const before = keys.map(key => [key, Object.hasOwn(globalThis, key), globalThis[key]]);
const snapshot = () => keys.map(key => [key, Object.hasOwn(globalThis, key), globalThis[key]]);
const restored = expected => {
  for (const [key, present, value] of expected) {
    assert.equal(Object.hasOwn(globalThis, key), present, key);
    assert.equal(globalThis[key], value, key);
  }
};
const records = [];
const windows = new WeakSet();
const descriptor = Object.getOwnPropertyDescriptor(JSDOM.prototype, 'window');
const injected = new Error('Injected SciOpen conversion failure');
let failConversion = false, failLateParser = false;
const replace = String.prototype.replace;
String.prototype.replace = function(...args) {
  if (failConversion && new Error().stack.includes('normalizeAcademicInline')) {
    failConversion = false;
    assert.equal(globalThis.document?.URL, inputs.sciopen.url, 'conversion globals are installed');
    throw injected;
  }
  return replace.apply(this, args);
};
Object.defineProperty(JSDOM.prototype, 'window', { ...descriptor, get() {
  const window = descriptor.get.call(this);
  if (new Error().stack.includes('parseSciOpenPage') && !windows.has(window)) {
    windows.add(window);
    const record = { closes: 0 }; records.push(record);
    const close = window.close;
    window.close = function() { record.closes++; return close.call(this); };
    const create = window.document.createElement;
    window.document.createElement = function(...args) {
      if (failLateParser && args[0] === 'article') { failLateParser = false; throw injected; }
      return create.apply(this, args);
    };
  }
  return window;
} });
const clips = {}, inputs = {}, expected = {};
async function load(name) {
  if (clips[name]) return;
  if (name === 'sciopen') {
    clips[name] = (await import('../src/adapters/sciopen.mjs')).clipSciOpenExperimental;
    const dir = new URL('../test/fixtures/sciopen/nr-94907575/', import.meta.url);
    const p = JSON.parse(await readFile(new URL('provenance.json', dir), 'utf8'));
    inputs[name] = { html: await readFile(new URL('article.excerpt.html', dir), 'utf8'), url: p.url, sourceScope: 'excerpt' };
  } else if (name === 'rsc') {
    clips[name] = (await import('../src/experimental/rsc-clip.mjs')).clipRsc;
    const dir = new URL('../test/fixtures/rsc/', import.meta.url);
    const p = JSON.parse(await readFile(new URL('d4tc01199f.json', dir), 'utf8'));
    inputs[name] = { html: await readFile(new URL('d4tc01199f.html', dir), 'utf8'), url: p.url };
  } else if (name === 'aaas') {
    clips[name] = (await import('../src/adapters/aaas.mjs')).clipAaas;
    inputs[name] = { html: await readFile(new URL('../test/fixtures/aaas/science.aaa9297.excerpt.html', import.meta.url), 'utf8'), url: 'https://www.science.org/doi/10.1126/science.aaa9297' };
  } else if (name === 'pnas') {
    clips[name] = (await import('../src/pnas-clip.mjs')).clipPnas;
    const dir = new URL('../test/fixtures/pnas/', import.meta.url);
    const p = JSON.parse(await readFile(new URL('manifest.json', dir), 'utf8')).find(n => n.file === '1319030111.html');
    inputs[name] = { html: await readFile(new URL(p.file, dir), 'utf8'), url: p.url };
  } else throw new Error('Unknown probe publisher.');
}
const fingerprints = { sciopen: /Se concentration-dependent/, rsc: /Decoding the domain dynamics/, aaas: /Weyl/, pnas: /Active learning/ };
async function run(name) {
  await load(name);
  const result = await clips[name](inputs[name]);
  assert.match(result.metadata.title, fingerprints[name]);
  assert.doesNotMatch(result.markdown, /ACADEMICCLIPPER|SCIOPENCITE|SCIOPENSCI/);
  if (expected[name]) assert.equal(result.markdown, expected[name]); else expected[name] = result.markdown;
  if (name === 'sciopen') {
    assert.equal(result.references.length, 32);
    assert.equal(result.formulas.length, 1);
    assert.equal(result.metadata.doi, '10.26599/NR.2025.94907575');
    assert.ok(!('dom' in result) && !('document' in result));
  }
  return result;
}
const assertClosed = () => { for (const r of records) assert.equal(r.closes, 1, 'SciOpen article closes exactly once'); };
try {
  for (const name of order.split(',')) { await run(name); restored(before); assertClosed(); }
  for (const name of ['sciopen','rsc','aaas','pnas']) { await run(name); restored(before); assertClosed(); }
  globalThis.NodeFilter = { sentinel: 'existing-global' };
  const seeded = snapshot();
  await Promise.all(['sciopen','rsc','aaas','pnas'].map(run)); restored(seeded); assertClosed();
  for (const [html, message] of [
    [inputs.sciopen.html.replace('content="10.26599/NR.2025.94907575"', 'content="other"'), /identity/],
    [inputs.sciopen.html.replace('id="insert_content_one"', 'id="missing-body"'), /main text/],
    [inputs.sciopen.html.replace('rid="b25"', 'rid="absent"'), /reference/],
  ]) {
    const count = records.length;
    await assert.rejects(() => clips.sciopen({ ...inputs.sciopen, html }), message);
    assert.equal(records.length, count + 1); assertClosed(); restored(seeded);
  }
  failLateParser = true;
  await assert.rejects(() => clips.sciopen(inputs.sciopen), e => e === injected);
  assert.equal(failLateParser, false); assertClosed(); restored(seeded);
  failConversion = true;
  await assert.rejects(() => clips.sciopen(inputs.sciopen), e => e === injected);
  assert.equal(failConversion, false); assertClosed(); restored(seeded);
  const memory = [];
  for (let batch = 0; batch < 3; batch++) {
    for (let i = 0; i < 8; i++) { await run('sciopen'); assertClosed(); restored(seeded); }
    await yieldEventLoop(); globalThis.gc?.(); await yieldEventLoop();
    memory.push(process.memoryUsage().heapUsed);
  }
  assert.equal(records.length, 32, 'expected SciOpen-owned article count');
  // Measurements are diagnostics, not a claim that heap bytes stay constant.
  const markdownHashes = Object.fromEntries(Object.entries(expected).map(([name, value]) =>
    [name, createHash('sha256').update(value).digest('hex')]));
  console.log(JSON.stringify({ order, citationStyle: 'markdown', articleWindows: records.length, memoryBytes: memory, markdownHashes }));
} finally {
  for (const [key,present,value] of before) { if (present) globalThis[key] = value; else delete globalThis[key]; }
  Object.defineProperty(JSDOM.prototype, 'window', descriptor);
  String.prototype.replace = replace;
}
