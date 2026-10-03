import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { parsePnasPage, isPnasUrl } from '../src/adapters/pnas.mjs';
import { clipPnas } from '../src/pnas-clip.mjs';
import { referencesBib } from '../src/clip.mjs';

const manifest = JSON.parse(await readFile(new URL('./fixtures/pnas/manifest.json', import.meta.url), 'utf8'));
const fixtures = new Map(await Promise.all(manifest.map(async (entry) => [entry.file.replace('.html', ''), { ...entry, html: await readFile(new URL(`./fixtures/pnas/${entry.file}`, import.meta.url), 'utf8') }])));
const clip = (id, citationStyle = 'markdown') => clipPnas({ ...fixtures.get(id), citationStyle });
const abstractEvidence = {
  '2400689121': 'Social reputations facilitate cooperation: those who help others gain a good reputation',
  '2318124121': 'There is much excitement about the opportunity to harness the power of large language models',
  '1319030111': 'we metaanalyzed 225 studies that reported data on examination scores or failure rates',
};

test('PNAS source excerpts have recorded hashes, actual source topology and no executable captures', () => {
  for (const fixture of fixtures.values()) {
    assert.equal(createHash('sha256').update(fixture.html).digest('hex'), fixture.fixtureSha256);
    assert.equal(Buffer.byteLength(fixture.html), fixture.bytes);
    assert.equal(fixture.captureMode, 'browser-loaded-dom-blocks');
    assert.ok(fixture.blocks.every((block) => /^[a-f0-9]{64}$/u.test(block.sha256)));
    const doc = new JSDOM(fixture.html).window.document;
    assert.ok(doc.querySelector('section#bodymatter[property="articleBody"] > .core-container'));
    assert.equal(doc.querySelector('script,iframe,style'), null);
    assert.ok([...doc.querySelectorAll('*')].every((e) => [...e.attributes].every((a) => !/^on/iu.test(a.name))));
  }
});

test('PNAS identity, distinct online/issue/history dates, all authors and exposed author information', () => {
  const gossip = parsePnasPage(fixtures.get('2400689121').html, fixtures.get('2400689121').url);
  assert.equal(gossip.metadata.title, 'A mechanistic model of gossip, reputations, and cooperation');
  assert.equal(gossip.metadata.doi, '10.1073/pnas.2400689121');
  assert.equal(gossip.metadata.journal, 'Proceedings of the National Academy of Sciences');
  assert.equal(gossip.metadata.date, '2024-05-08');
  assert.equal(gossip.metadata.dates.issue, '2024-05-14');
  assert.equal(gossip.metadata.dates.history.Accepted, 'April 12, 2024');
  assert.deepEqual(gossip.metadata.authors, ['Kawakatsu, Mari', 'Kessinger, Taylor A.', 'Plotkin, Joshua B.']);
  assert.equal(gossip.metadata.authorInformation.affiliations.length, 5);
  assert.match(gossip.metadata.authorInformation.affiliations[1].address, /Center for Mathematical Biology/u);
  assert.match(gossip.metadata.authorInformation.notes[0], /contributed equally/u);
  assert.match(gossip.metadata.authorInformation.correspondence.text, /marikawa@sas.upenn.edu, tkess@sas.upenn.edu, or jplotkin@sas.upenn.edu/u);
  const maths = parsePnasPage(fixtures.get('2318124121').html, fixtures.get('2318124121').url);
  assert.equal(maths.metadata.authors.length, 14);
  assert.equal(maths.metadata.authorInformation.affiliations.length, 19);
  assert.equal(maths.metadata.dates.online, '2024-06-03');
  assert.equal(maths.metadata.dates.issue, '2024-06-11');
  const legacy = parsePnasPage(fixtures.get('1319030111').html, fixtures.get('1319030111').url);
  assert.equal(legacy.metadata.date, '2014-05-12');
  assert.equal(legacy.metadata.dates.issue, '2014-06-10');
  assert.equal(legacy.metadata.authors.length, 7);
});

for (const id of fixtures.keys()) for (const style of ['markdown', 'links', 'quarto']) {
  test(`PNAS ${id} ${style}: shared production validators, citations, UI removal and deterministic output`, async () => {
    const result = await clip(id, style);
    for (const name of ['mathValidation', 'markdownStructure', 'rawHtmlValidation', 'crossReferenceValidation']) assert.equal(result.debug[name].valid, true, `${name}: ${JSON.stringify(result.debug[name])}`);
    assert.doesNotMatch(result.markdown, /ACADEMICCLIPPER|No alternative text available|Sign up for PNAS alerts|Google Scholar|Expand All|EXPAND FOR MORE|Open .* in Viewer|View all articles by/u);
    assert.equal((result.markdown.match(/^## Abstract(?: \{#sec-abstract\})?$/gmu) || []).length, 1);
    assert.ok(result.markdown.includes(abstractEvidence[id]), 'Actual source abstract prose must survive conversion.');
    assert.equal((result.markdown.match(/^## Significance(?: \{#sec-significance\})?$/gmu) || []).length, 1);
    assert.equal((result.markdown.match(/^## References$/gmu) || []).length, 1);
    assert.equal((result.markdown.match(/!\[/gu) || []).length, result.figures.length);
    assert.match(result.markdown, /https:\/\/www\.pnas\.org\/doi\/suppl\//u);
    assert.equal(result.markdown, (await clip(id, style)).markdown);
    if (style === 'quarto') {
      assert.match(result.markdown, /\[@ref1/u);
      assert.equal(referencesBib(result.references).match(/^@/gmu).length, result.references.length);
    } else if (style === 'links') assert.match(result.markdown, /\[1\]\(#ref-1\)/u);
    else assert.match(result.markdown, /\[\^1\]/u);
  });
}

test('PNAS gossip: range expansion, complete original bibliography, MathML equations and caption boundaries', async () => {
  const result = await clip('2400689121', 'links');
  assert.deepEqual(result.semantic.citations[0].numbers, [1, 2, 3]);
  assert.deepEqual(result.semantic.citations[1].numbers, [4, 5, 6, 7]);
  assert.deepEqual(result.references.map((ref) => ref.number), Array.from({ length: 68 }, (_, i) => i + 1));
  assert.equal(result.references[0].doi, '10.1086/406755');
  assert.match(result.references[67].text, /gossip-reputations-cooperation/u);
  assert.equal(result.semantic.displayMath.length, 6);
  assert.ok(result.semantic.inlineMath.length >= 80); // includes the real captions' math
  assert.match(result.semantic.displayMath[0].tex, /\\pi/u);
  assert.match(result.semantic.displayMath[0].tex, /\\cdot r/u);
  assert.doesNotMatch(result.semantic.displayMath[0].tex, /\\cdotr/u);
  assert.match(result.semantic.displayMath[1].tex, /\\frac/u);
  assert.match(result.markdown, /### Reputation Updates \(Fast Timescale\)\./u);
  assert.match(result.markdown, /#### Peer-to-peer gossip\./u);
  assert.match(result.markdown, /\]\(#eqn1\)/u);
  assert.match(result.markdown, /\]\(#fig01\)/u);
  assert.match(result.markdown, /\[1\]\(#ref-1\), \[2\]\(#ref-2\), \[3\]\(#ref-3\)/u);
  assert.equal(result.figures.length, 2);
  assert.match(result.figures[0].captionMarkdown, /scaled duration \$\\tau = T \/ N\$/u);
  assert.doesNotMatch(result.figures[0].captionMarkdown, /Private assessments are then/u);
  assert.match(result.markdown, /October 29, 2024: The text of this article has been updated/u);
  assert.match(result.debug.warnings.join('\n'), /Source MathML has asymmetric fences in eqn6/u);
  const quarto = await clip('2400689121', 'quarto');
  assert.match(quarto.figures[1].captionMarkdown, /\]\(#eq-eqn6\)/u);
  assert.match(quarto.figures[1].captionMarkdown, /\]\(#eq-eqn2\)/u);
});

test('PNAS interactive evaluation: deep hierarchy, ordinary note symbols, data/SI links and unique captions', async () => {
  const result = await clip('2318124121', 'quarto');
  assert.equal(result.figures.length, 3);
  assert.equal(result.references.length, 69);
  assert.match(result.markdown, /#### Dr\. William Hart/u);
  assert.match(result.markdown, /#fig-fig02/u);
  assert.match(result.markdown, /github\.com\/collinskatie\/checkmate/u);
  assert.match(result.markdown, /suppl_file\/.*\.csv/u);
  assert.doesNotMatch(result.markdown, /\$\^\{[†‡§¶#‖*]/u);
  assert.match(result.markdown, /We chose a limit of 20 expecting that participants may fatigue/u);
  assert.equal((result.markdown.match(/Contrasting typical static evaluation/gmu) || []).length, 1);
});

test('PNAS legacy table: hidden final rows, colspan, currency and legacy supplementary URLs survive', async () => {
  const source = new JSDOM(fixtures.get('1319030111').html).window.document;
  assert.equal(source.querySelector('#t01 table').rows.length, 10);
  assert.ok(source.querySelector('#t01 tr[hidden]'));
  assert.equal(source.querySelector('#t01 th[colspan]').getAttribute('colspan'), '2');
  const result = await clip('1319030111', 'links');
  assert.equal(result.tables.length, 1);
  assert.equal(result.tables[0].tableContentStatus, 'captured-html');
  assert.match(result.tables[0].markdown, /95% confidence interval/u);
  assert.match(result.tables[0].markdown, /Identical instructor, randomized assignment, or ≥3 instructors in each treatment \| 99 \| 0\.492 \| 0\.071 \| 0\.347 \| 0\.580/u);
  assert.match(result.markdown, /US\\\$3,500,000/u);
  assert.match(result.markdown, /https:\/\/www\.pnas\.org\/lookup\/doi\/10\.1073\/pnas\.1319030111#supplementary-materials/u);
  assert.match(result.markdown, /\]\(#t01\)/u);
});

test('PNAS rejects preview/challenge/wrong identity and unsupported URLs without fetching', async () => {
  for (const url of ['http://www.pnas.org/doi/10.1073/pnas.2400689121', 'https://www.pnas.org.evil.test/doi/10.1073/pnas.2400689121', 'https://user:pass@www.pnas.org/doi/10.1073/pnas.2400689121', 'https://academic.oup.com/pnasnexus/article/1', 'https://www.pnas.org/action/cookieAbsent']) assert.equal(isPnasUrl(url), false);
  assert.equal(isPnasUrl('https://www.pnas.org/doi/full/10.1073/pnas.2400689121'), true);
  const fixture = fixtures.get('2400689121');
  assert.throws(() => parsePnasPage('<h1>Sign in / verify</h1>', fixture.url), /full article core DOM/u);
  const preview = new JSDOM(fixture.html);
  preview.window.document.querySelector('#bodymatter').remove();
  assert.throws(() => parsePnasPage(preview.serialize(), fixture.url), /full article core DOM/u);
  assert.throws(() => parsePnasPage(fixture.html, 'https://www.pnas.org/doi/10.1073/pnas.9999999999'), /matching citation metadata/u);
  await assert.rejects(clipPnas({ ...fixture, citationStyle: 'unknown' }), /citationStyle/u);
});

test('PNAS synthetic transport variations are separate from real source coverage', async () => {
  const fixture = fixtures.get('1319030111');
  const variation = new JSDOM(fixture.html);
  variation.window.document.body.insertAdjacentHTML('afterbegin', '<nav>Account UI</nav><script>throw new Error("must not run")</script>');
  variation.window.document.querySelector('#t01 table').remove();
  const result = await clipPnas({ html: variation.serialize(), url: fixture.url });
  assert.doesNotMatch(result.markdown, /Account UI|must not run/u);
  assert.equal(result.tables[0].tableContentStatus, 'fallback-not-exposed');
  assert.match(result.markdown, /Table cells were not exposed/u);
  assert.equal(result.debug.crossReferenceValidation.valid, true);
});
