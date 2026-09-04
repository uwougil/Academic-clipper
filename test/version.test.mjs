import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { ACADEMIC_CLIPPER_VERSION, ACADEMIC_CLIPPER_USER_AGENT } from '../src/version.mjs';

test('package, extension and runtime user-agent share v0.2.0', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const manifest = JSON.parse(await readFile(new URL('../extension/manifest.json', import.meta.url), 'utf8'));
  assert.equal(packageJson.version, ACADEMIC_CLIPPER_VERSION);
  assert.equal(manifest.version, ACADEMIC_CLIPPER_VERSION);
  assert.match(ACADEMIC_CLIPPER_USER_AGENT, new RegExp(`academic-clipper/${ACADEMIC_CLIPPER_VERSION}`));
});
