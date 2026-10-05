import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';
import { validateMathDelimiters } from '../src/validators/math-delimiters.mjs';
import { validateMarkdownStructure } from '../src/validators/markdown-structure.mjs';
import { validateRawHtml } from '../src/validators/html-audit.mjs';
import { validateCrossReferences } from '../src/validators/cross-references.mjs';

test('committed complete Nature golden stays read-only with exact scholarly baselines and local resources',async()=>{
  const root=new URL('../papers/s41586-026-10401-1/',import.meta.url);
  const bytes=await readFile(new URL('index.md',root)),markdown=bytes.toString('utf8').replace(/\r\n/gu,'\n');
  const authors=markdown.split('\nauthors:\n')[1].split('\njournal:')[0].split('\n').filter(line=>line.startsWith('  - '));
  assert.deepEqual(authors.map(a=>JSON.parse(a.slice(4))),['Liu, Yuntian','Chen, Xiaobing','Yu, Yutong','Etxebarria, Jesús','Perez-Mato, J. Manuel','Liu, Qihang']);
  assert.equal(Array.from(markdown.matchAll(/^!\[Figure \d+\]/gmu)).length,3);
  assert.equal(Array.from(markdown.matchAll(/^!\[Extended Data Figure \d+\]/gmu)).length,4);
  const math=validateMathDelimiters(markdown);
  assert.equal(math.displayMathCount,13);
  assert.equal(math.valid,true,JSON.stringify(math.issues));
  assert.equal(math.scientificFragments.valid,true);
  assert.equal(validateMarkdownStructure(markdown,{citationStyle:'markdown'}).valid,true);
  assert.equal(validateRawHtml(markdown).valid,true);
  assert.equal(validateCrossReferences(markdown,{citationStyle:'markdown'}).valid,true);
  assert.deepEqual(Array.from(markdown.matchAll(/^\[\^(\d+)\]:/gmu)).map(m=>Number(m[1])),Array.from({length:50},(_,n)=>n+1));
  assert.match(markdown,/\*\*Table 1\.\*\*/u);
  assert.match(markdown,/^\| Symmetry \| Effects \| Pure AFM \| SOM \| FM \|$/mu);
  const images=Array.from(markdown.matchAll(/!\[[^\]]+\]\(([^)]+)\)/gu)).map(m=>m[1]);
  assert.equal(images.length,7);
  for(const image of images){ assert.match(image,/^figures\/[A-Za-z0-9_.-]+$/u);assert.ok((await stat(new URL(image,root))).isFile()); }
  assert.deepEqual(await readFile(new URL('index.md',root)),bytes);
});
