// Isolated cold-start integration probe; deliberately outside test discovery.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const [order, citationStyle] = process.argv.slice(2);
const keys = ['window', 'document', 'DOMParser', 'XMLSerializer', 'Node', 'NodeFilter', 'HTMLElement', 'Element', 'SVGElement', 'Document'];
const snapshot = keys.map(key => [key, Object.hasOwn(globalThis, key), globalThis[key]]);
const restored = () => { for (const [key, present, value] of snapshot) { assert.equal(Object.hasOwn(globalThis, key), present, key); assert.equal(globalThis[key], value, key); } };
const records = [];
const observed = new WeakSet();
const descriptor = Object.getOwnPropertyDescriptor(JSDOM.prototype, 'window');
const injected = new Error('Injected caption conversion failure');
let failCaption = false;
Object.defineProperty(JSDOM.prototype, 'window', { ...descriptor, get() {
  const window = descriptor.get.call(this);
  const stack = new Error().stack;
  if (failCaption && stack.includes('protectCaptionMath')) { failCaption = false; throw injected; }
  const publisher = stack.includes('parseRscPage') ? 'rsc' : stack.includes('parseAaasPage') ? 'aaas' : null;
  if (publisher && !observed.has(window)) {
    observed.add(window);
    const record = { publisher, closes: 0 }; records.push(record);
    const close = window.close;
    window.close = function () { record.closes++; return close.call(this); };
  }
  return window;
} });
const clips = {}, inputs = {}, expected = {};
async function load(name) {
  if (clips[name]) return;
  if (name === 'rsc') {
    clips.rsc = (await import('../src/experimental/rsc-clip.mjs')).clipRsc;
    const provenance = JSON.parse(await readFile(new URL('../test/fixtures/rsc/d4tc01199f.json', import.meta.url), 'utf8'));
    inputs.rsc = { url: provenance.url, html: await readFile(new URL('../test/fixtures/rsc/d4tc01199f.html', import.meta.url), 'utf8') };
  } else if (name === 'aaas') {
    clips.aaas = (await import('../src/adapters/aaas.mjs')).clipAaas;
    inputs.aaas = { url: 'https://www.science.org/doi/10.1126/science.aaa9297', html: await readFile(new URL('../test/fixtures/aaas/science.aaa9297.excerpt.html', import.meta.url), 'utf8') };
  } else {
    clips.pnas = (await import('../src/pnas-clip.mjs')).clipPnas;
    const manifest = JSON.parse(await readFile(new URL('../test/fixtures/pnas/manifest.json', import.meta.url), 'utf8'));
    const entry = manifest.find(item => item.file === '1319030111.html');
    inputs.pnas = { url: entry.url, html: await readFile(new URL('../test/fixtures/pnas/1319030111.html', import.meta.url), 'utf8') };
  }
}
async function run(name) {
  await load(name);
  const result = await clips[name]({ ...inputs[name], citationStyle });
  assert.ok(result.markdown.length > 1000);
  assert.doesNotMatch(result.markdown, /ACADEMICCLIPPER/);
  if (expected[name]) assert.equal(result.markdown, expected[name]);
  else expected[name] = result.markdown;
  return result;
}
try {
  // Dynamic imports ensure each order really tests a cold converter.
  for (const name of order.split(',')) { await run(name); restored(); }
  for (const name of ['rsc', 'aaas', 'pnas']) { await run(name); restored(); }
  for (let i = 0; i < 4; i++) { await run('rsc'); restored(); }
  await Promise.all(['rsc', 'aaas', 'pnas'].map(run)); restored();
  // Fail during caption conversion, after parsing and global installation.
  for (const name of ['rsc', 'aaas', 'pnas']) {
    failCaption = true;
    await assert.rejects(() => clips[name]({ ...inputs[name], citationStyle }), error => error === injected);
    assert.equal(failCaption, false); restored();
    await run(name); restored();
  }
  assert.ok(records.some(record => record.publisher === 'rsc'));
  for (const record of records) assert.equal(record.closes, 1, `${record.publisher} article window must close exactly once`);
  console.log(JSON.stringify({ order, citationStyle, articleWindows: records.length, heapUsed: process.memoryUsage().heapUsed }));
} finally {
  Object.defineProperty(JSDOM.prototype, 'window', descriptor);
}
