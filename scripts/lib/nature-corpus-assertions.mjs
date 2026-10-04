import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import { JSDOM } from 'jsdom';
import { referencesBib } from '../../src/clip.mjs';
import { validateMathDelimiters } from '../../src/validators/math-delimiters.mjs';
import { validateMarkdownStructure } from '../../src/validators/markdown-structure.mjs';
import { validateRawHtml } from '../../src/validators/html-audit.mjs';
import { validateCrossReferences } from '../../src/validators/cross-references.mjs';
import { stableJson } from './nature-corpus-infrastructure.mjs';

export const ASSERTION_VERSION = '1.0.0';
export const DIALECTS = Object.freeze(['markdown', 'links', 'quarto']);
export const EXPECTATION_STATES = Object.freeze([
  'EXECUTABLE_NOW', 'BLOCKED_BY_PARSER_DEFECT', 'BLOCKED_BY_D_TRANSPORT_SEAM', 'BLOCKED_BY_SPEC_QUESTION',
]);

const string = v => typeof v === 'string';
const boolean = v => typeof v === 'boolean';
const integer = v => Number.isSafeInteger(v) && v >= 0;
const positive = v => integer(v) && v > 0;
const array = rule => v => Array.isArray(v) && v.every(rule);
const nullable = rule => v => v === null || rule(v);
const object = (required, optional = {}) => v => !!v && typeof v === 'object' && !Array.isArray(v)
  && Object.keys(v).every(k => Object.hasOwn(required, k) || Object.hasOwn(optional, k))
  && Object.entries(required).every(([k, rule]) => Object.hasOwn(v, k) && rule(v[k]))
  && Object.entries(optional).every(([k, rule]) => !Object.hasOwn(v, k) || rule(v[k]));
const version = v => v === ASSERTION_VERSION;
const ids = array(v => string(v) && v.length > 0);
const located = fields => object({ ...fields, blockIds: ids });
const placement = object({ id: string, parentTag: string, parentClass: string, insideFigure: boolean, previousSiblingTag: string });
const image = v => object({}, { src: string, srcset: string, 'data-src': string, 'data-srcset': string,
  'data-original': string, 'data-lazy-src': string, 'data-supp-info-image': string, alt: string })(v)
  && Object.keys(v).length > 0;
const validators = new Map([
  ['metadata', object({ version, title: string, doi: string, journal: string, url: string, authors: ids,
    date: string, notes: array(string), affiliations: array(object({ address: string, authors: string })),
    contributions: string, correspondence: nullable(object({ text: string, firstEmail: string })),
    sourceDateFields: object({ citation_online_date: string, citation_publication_date: string, date: string }),
    volume: string, issue: string, firstPage: string, lastPage: string })],
  ['abstract', object({ version, paragraphs: ids })],
  ['headings', object({ version, ordered: array(located({ level: v => integer(v) && v >= 2 && v <= 6,
    id: string, text: string, parentSection: string })) })],
  ['equations', v => object({ version, count: integer, ordered: array(located({ id: string, number: string,
    sourceTeX: string })), absenceWarning: nullable(string) })(v) && v.count === v.ordered.length],
  ['figures', v => object({ version, count: integer, mainCount: integer, extendedCount: integer,
    ordered: array(located({ id: string, label: string, captionText: string, captionStart: string,
      captionEnd: string, descriptionIsSibling: boolean, previousParagraph: nullable(string), nextParagraph: nullable(string),
      imageCandidates: array(image), descriptionPlacement: nullable(placement), boldSingleLetterSequence: array(string) })) })(v)
      && v.count === v.ordered.length && v.count === v.mainCount + v.extendedCount],
  ['citations', v => object({ version, clusters: array(located({ text: string,
    anchors: array(object({ text: string, href: string })), orderedNumbers: array(positive) })),
    referenceCount: integer, references: array(object({ number: positive, id: string, text: string,
      doi: string, doiLinks: array(string) }, { sourceAnchorId: string, sourceAnchorSelector: string })) })(v)
      && v.referenceCount === v.references.length && v.references.every((r, i) => r.number === i + 1)],
  ['inline', object({ version, cases: array(located({ tag: string, text: string, subtree: string,
    paragraphStart: string, paragraphEnd: string, sourceContext: string,
    sourceLocation: object({ blockId: string, selector: string, index: integer }) })) })],
  ['crossrefs', object({ version, internal: array(located({ href: string, text: string, external: boolean,
    targetRetained: boolean })), externalFragments: array(located({ href: string, text: string })) })],
  ['ui', object({ version, excluded: array(object({ blockId: string, selector: string, text: string })) })],
  ['tables', object({ version, resources: array(object({ id: string, url: string, title: string,
    sourceRows: array(array(object({ tag: v => ['TH', 'TD'].includes(v), text: string, colspan: positive,
      rowspan: positive, html: string }))), sourceNotes: array(object({ text: string, html: string })),
    physicalRowCount: integer, physicalCellCounts: array(integer), expectedStatus: string,
    warning: nullable(string), sourceNotesLocator: string })) })],
]);

export function sourceText(value) {
  return String(value ?? '').replace(/\u00a0/gu, ' ').replace(/[\t\r\n ]+/gu, ' ').trim();
}
const stripTex = value => String(value).trim().replace(/^(?:\$\$|\\\(|\\\[)/u, '')
  .replace(/(?:\$\$|\\\)|\\\])$/u, '').trim();
const texCanonical = value => stripTex(value).replace(/\{\s*\\bf\s*\{([^{}]*)\}\s*\}/gu, '\\mathbf{$1}')
  .replace(/\{\s*\\rm\s*\{([^{}]*)\}\s*\}/gu, '\\mathrm{$1}');
const escapeRegExp = value => String(value).replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
const excludedSection = new Set(['author information', 'extended data figures and tables', 'references',
  'rights and permissions', 'supplementary information', 'about this article']);

function checks() {
  const failures = [];
  return {
    failures,
    equal(path, actual, expected) { if (!isDeepStrictEqual(actual, expected)) failures.push({ path, message: 'Exact value differs', expected, actual }); },
    truth(path, actual, message) { if (!actual) failures.push({ path, message, expected: true, actual: Boolean(actual) }); },
  };
}

// This is a test-only readable projection, not an HTML-to-Markdown converter.
// It removes presentation syntax while retaining prose, citation identities and scientific values.
function readable(value, result) {
  const byKey = new Map(result.references.map(r => [r.citationKey, r.number]));
  return sourceText(String(value)
    .replace(/\[\^\d+\]:[^\n]*/gu, '')
    .replace(/<a id="[A-Za-z0-9_.:-]+"><\/a>/gu, '')
    .replace(/\{#[^}]+\}/gu, '')
    .replace(/\[([^\]]+)\]\([^\n]*?\)/gu, '$1')
    .replace(/\[\^([0-9]+)\]/gu, '$1')
    .replace(/\[@([^\]]+)\]/gu, (_, keys) => keys.split(/;\s*@?/u).map(k => byKey.get(k) ?? k).join(','))
    .replace(/\*\*|(?<!\\)\*/gu, '')
    .replace(/\\([\[\]{}|])/gu, '$1')
    .replace(/\\(?:mathrm|mathbf|text|mathit)\{([^{}]*)\}/gu, '$1')
    .replace(/\\(?:,|;|!|quad|qquad|thinspace|\s)/gu, '')
    .replace(/\\times/gu, '×').replace(/\\pm/gu, '±')
    .replace(/\\(?:alpha|beta|gamma|delta|lambda|mu|sigma|tau|omega|theta|chi|rho|nu|phi|pi|epsilon|eta|kappa|zeta|psi)/gu,
      s => ({ alpha:'α',beta:'β',gamma:'γ',delta:'δ',lambda:'λ',mu:'μ',sigma:'σ',tau:'τ',omega:'ω',theta:'θ',chi:'χ',rho:'ρ',nu:'ν',phi:'φ',pi:'π',epsilon:'ϵ',eta:'η',kappa:'κ',zeta:'ζ',psi:'ψ' })[s.slice(1)])
    .replace(/[$^_{}]/gu, '').replace(/\s*−\s*/gu, '−'));
}
function sourceReadable(value) { return sourceText(value).replace(/[$^_{}]/gu, ''); }
function sameProse(c, path, actual, expected, result) {
  c.equal(path, readable(actual, result), sourceReadable(expected));
}
const blockNode = (context, blockId) => {
  const block = context.article.retainedBlocks.find(b => b.id === blockId);
  return block ? context.sourceDocument.querySelector(block.selector) : null;
};

function assertMetadata(context, e, c) {
  const { result } = context, v = e.value, m = result.metadata;
  for (const k of ['title', 'doi', 'journal', 'url', 'authors', 'volume', 'issue']) c.equal(k, m[k], v[k]);
  c.equal('date', m.date, v.date.replace(/\//gu, '-'));
  c.equal('date.precedence', v.date, v.sourceDateFields.citation_online_date || v.sourceDateFields.citation_publication_date || v.sourceDateFields.date);
  c.equal('pages', m.pages, v.firstPage && v.lastPage ? `${v.firstPage}-${v.lastPage}` : '');
  const info = m.authorInformation;
  c.equal('authorInformation.notes', info.notes, v.notes);
  c.equal('authorInformation.affiliations', info.affiliations, v.affiliations);
  c.equal('authorInformation.contributions', info.contributions, v.contributions);
  c.equal('authorInformation.correspondence', info.correspondence,
    v.correspondence ? { text: v.correspondence.text, email: v.correspondence.firstEmail } : null);
  const audit = { authorInformation: v.notes.length || v.affiliations.length ? 'captured' : 'not-found',
    authorContributions: v.contributions ? 'captured' : 'not-found', correspondence: v.correspondence?.text ? 'captured' : 'not-found' };
  for (const [k, expected] of Object.entries(audit)) c.equal(`debug.metadataAudit.${k}`, result.debug.metadataAudit[k], expected);
  for (const text of [...v.notes, ...v.affiliations.flatMap(a => [a.authors, a.address]), v.contributions,
    v.correspondence?.text].filter(Boolean)) c.truth(`rendered.${text.slice(0, 40)}`, readable(result.markdown, result).includes(sourceReadable(text)), 'Author information must be rendered');
  c.truth('frontmatter.authors', result.markdown.startsWith(`---\ntitle: ${JSON.stringify(v.title)}\nauthors:\n${v.authors.map(a => `  - ${JSON.stringify(a)}`).join('\n')}`), 'Front matter must preserve the complete ordered author list');
}
function assertAbstract(context, e, c) {
  const { result } = context;
  const section = result.markdown.split(/^## Abstract(?:\s+\{#[^}]+\})?\s*$/mu)[1]?.split(/^## /mu)[0] || '';
  const paragraphs = section.trim().split(/\n\s*\n/u).filter(p => p.trim() && !/^<a id=/u.test(p));
  c.equal('paragraphCount', paragraphs.length, e.value.paragraphs.length);
  e.value.paragraphs.forEach((p, i) => sameProse(c, `paragraphs[${i}]`, paragraphs[i] || '', p, result));
}
function assertHeadings(context, e, c) {
  const { result, sourceDocument } = context;
  const expected = e.value.ordered.filter(h => {
    const node = h.id ? sourceDocument.getElementById(h.id) : e.blockIds.map(id => blockNode(context, id))
      .flatMap(root => root ? Array.from(root.querySelectorAll('h2,h3,h4,h5,h6')) : []).find(n => sourceText(n.textContent) === h.text);
    return node && !excludedSection.has(sourceText(node.closest('section')?.getAttribute('data-title')).toLowerCase());
  }).map(h => ({ level: h.level, text: h.text }));
  const actual = Array.from(result.markdown.matchAll(/^(#{2,6})\s+([^\n]+)$/gmu))
    .map(m => ({ level: m[1].length, text: sourceText(m[2].replace(/\s+\{#[^}]+\}$/u, '')) }))
    .filter(h => !['Extended Data', 'Tables', 'Author notes', 'Authors and affiliations', 'Author contributions', 'Correspondence', 'References'].includes(h.text));
  c.equal('orderedBodyHeadings', actual, expected);
  for (const h of expected) c.truth(`heading.${h.text}`, result.markdown.includes(`${'#'.repeat(h.level)} ${h.text}`), 'Source heading level must remain intact');
}
function assertEquations(context, e, c) {
  const { result } = context, v = e.value;
  c.equal('semantic.displayMath.count', result.semantic.displayMath.length, v.count);
  c.equal('debug.equations', result.debug.equations, v.count);
  const rendered = Array.from(result.markdown.matchAll(/\$\$\s*\n?([\s\S]*?)\$\$/gu)).map(m => m[1].trim());
  c.equal('rendered.displayMath.count', rendered.length, v.count);
  v.ordered.forEach((eq, i) => {
    c.equal(`equations[${i}].sourceTeX`, result.semantic.displayMath[i]?.tex, stripTex(eq.sourceTeX));
    c.equal(`equations[${i}].renderedTeX`, rendered[i], texCanonical(eq.sourceTeX));
    const target = result.semantic.crossReferences.get(eq.id);
    c.truth(`equations[${i}].identity`, target?.type === 'equation', 'Original equation ID must map to an equation target');
    const number = Number(eq.number.replace(/[()]/gu, ''));
    c.equal(`equations[${i}].number`, target?.anchor, `equation-${number}`);
    if (context.citationStyle === 'quarto') c.truth(`equations[${i}].quarto`, result.markdown.includes(`{#eq-${target?.anchor}}`), 'Equation identifier must be rendered');
    if (context.citationStyle === 'links') c.truth(`equations[${i}].links`, result.markdown.includes(`<a id="${target?.anchor}"></a>`), 'Legacy equation anchor must be rendered');
  });
}
function expectedImage(v, url) {
  // Independently score declared source candidates; no adapter call or parser-produced oracle.
  const candidates = [];
  for (const item of v.imageCandidates) {
    const srcset = item.srcset || item['data-srcset'];
    if (srcset) for (const part of srcset.split(',')) {
      const [raw, descriptor = ''] = part.trim().split(/\s+/u);
      candidates.push({ url: new URL(raw, url).href, score: Number(descriptor.replace(/w$/u, '')) || Number(descriptor.replace(/x$/u, '')) * 1000 || 1 });
    }
    for (const k of ['data-src', 'data-original', 'data-lazy-src', 'src', 'data-supp-info-image'])
      if (item[k]) candidates.push({ url: new URL(item[k], url).href, score: 1 });
  }
  return candidates.sort((a, b) => b.score - a.score)[0]?.url;
}
function assertFigures(context, e, c) {
  const { result } = context, v = e.value;
  c.equal('count', result.figures.length, v.count);
  c.equal('debug.figures', result.debug.figures, v.count);
  c.equal('mainCount', result.figures.filter(f => f.source === 'inline figure').length, v.mainCount);
  c.equal('extendedCount', result.figures.filter(f => f.source === 'supplementary figure').length, v.extendedCount);
  v.ordered.forEach((f, i) => {
    const actual = result.figures[i];
    c.equal(`figures[${i}].id`, actual?.natureId, f.id);
    c.equal(`figures[${i}].caption`, actual?.caption, f.captionText);
    c.equal(`figures[${i}].image`, actual?.imageUrl, expectedImage(f, context.article.url));
    if (!actual) return;
    c.equal(`figures[${i}].shortAlt`, actual.alt, actual.label);
    const image = `![${actual.alt}](${actual.imageUrl})`;
    c.equal(`figures[${i}].renderedImageOccurrences`, result.markdown.split(image).length - 1, 1);
    const start = result.markdown.indexOf(image), next = result.markdown.indexOf('\n![', start + image.length);
    const renderedCaption = result.markdown.slice(start + image.length, next < 0 ? undefined : next).split(/^## /mu)[0];
    const withoutLabel = f.captionText.replace(/^(?:Extended Data )?Fig(?:ure)?\.?\s*\d+\s*[:.]?\s*/iu, '');
    c.truth(`figures[${i}].captionStart`, readable(renderedCaption, result).includes(sourceReadable(withoutLabel.slice(0, 80))), 'Complete caption start must follow its image');
    c.truth(`figures[${i}].captionEnd`, readable(renderedCaption, result).includes(sourceReadable(f.captionEnd)), 'Complete caption end must follow its image');
    for (const letter of f.boldSingleLetterSequence) c.truth(`figures[${i}].bold.${letter}`, actual.captionMarkdown?.includes(`**${letter}**`) || actual.captionMarkdown?.includes(`\\mathbf{${letter}}`), 'Source bold panel/variable marker must survive');
    const captionPlain = readable(result.markdown, result), sentinel = sourceReadable(withoutLabel.slice(0, 72));
    c.equal(`figures[${i}].captionOccurrences`, captionPlain.split(sentinel).length - 1, 1);
    if (actual.source === 'inline figure') {
      const before = readable(result.markdown.slice(0, start), result), after = readable(result.markdown.slice(start + image.length), result);
      if (f.previousParagraph) c.truth(`figures[${i}].previousParagraph`, before.includes(sourceReadable(f.previousParagraph)), 'Image must follow its source-adjacent paragraph');
      if (f.nextParagraph) c.truth(`figures[${i}].nextParagraph`, after.includes(sourceReadable(f.nextParagraph)), 'Image must precede its source-adjacent paragraph');
    }
    if (context.citationStyle === 'quarto') c.truth(`figures[${i}].identifier`, result.markdown.includes(`${image}{#fig-${actual.anchor}}`), 'Quarto image must carry its figure identifier');
  });
}
function assertCitations(context, e, c) {
  const { result, bibliography } = context, v = e.value;
  c.equal('references.count', result.references.length, v.referenceCount);
  c.equal('debug.references', result.debug.references, v.referenceCount);
  c.equal('references.sourcePayload', result.references.map(r => ({ number: r.number, text: r.text, doi: r.doi })),
    v.references.map(r => ({ number: r.number, text: r.text, doi: r.doi })));
  const keys = result.references.map(r => r.citationKey);
  c.equal('bibliography.uniqueKeys', new Set(keys).size, keys.length);
  const bibKeys = Array.from(bibliography.matchAll(/^@\w+\{([^,]+),/gmu)).map(m => m[1]);
  c.equal('bibliography.orderedKeys', bibKeys, keys);
  const body = result.markdown.split(/^## References\s*$/mu)[0];
  for (const [i, cluster] of v.clusters.entries()) {
    const expected = context.citationStyle === 'quarto'
      ? `[${cluster.orderedNumbers.map(n => `@${keys[n - 1]}`).join('; ')}]`
      : context.citationStyle === 'links' ? cluster.orderedNumbers.map(n => `[${n}](#ref-${n})`).join(', ')
        : cluster.orderedNumbers.map(n => `[^${n}]`).join('');
    c.truth(`clusters[${i}].rendered`, body.includes(expected), `Ordered source citation cluster ${cluster.text} must be rendered`);
  }
  if (context.citationStyle === 'markdown') c.equal('referenceDefinitions', Array.from(result.markdown.matchAll(/^\[\^(\d+)\]:/gmu)).map(m => Number(m[1])), v.references.map(r => r.number));
  if (context.citationStyle === 'links') c.equal('orderedReferenceAnchors', Array.from(result.referencesMarkdown.matchAll(/<a id="ref-(\d+)"><\/a>/gu)).map(m => Number(m[1])), v.references.map(r => r.number));
  if (context.citationStyle === 'quarto') {
    const emitted = Array.from(body.matchAll(/\[@([^\]]+)\]/gu)).flatMap(m => m[1].split(/;\s*@?/u));
    for (const key of emitted) c.truth(`citationKey.${key}`, bibKeys.includes(key), 'Every emitted citation key must exist in references.bib');
  }
}
function assertInline(context, e, c) {
  const { result } = context;
  for (const [i, v] of e.value.cases.entries()) {
    const root = blockNode(context, v.sourceLocation.blockId);
    const node = root?.querySelectorAll(v.sourceLocation.selector)[v.sourceLocation.index];
    c.equal(`cases[${i}].sourceTag`, node?.tagName, v.tag);
    c.equal(`cases[${i}].sourceText`, sourceText(node?.textContent), v.text);
    if (!node) continue;
    // Compare complete source paragraph prose and all literal scientific attachments,
    // rather than merely checking that a symbol exists somewhere in the document.
    const paragraph = sourceText(node.closest('p')?.textContent), plain = readable(result.markdown, result);
    const expected = sourceReadable(paragraph);
    c.truth(`cases[${i}].paragraph`, plain.includes(expected), 'Full paragraph including source scientific attachment must survive');
    const scientific = result.semantic.scientificRuns || [];
    if (['SUB','SUP'].includes(v.tag) && !node.querySelector('a[href*="#ref-CR"]'))
      c.truth(`cases[${i}].attachment`, scientific.some(run => run.tex.includes(v.text) || texCanonical(run.tex).includes(v.text))
        || !result.debug.mathValidation.scientificFragments?.length, 'Sub/sup must remain attached without isolated scientific fragments');
  }
}
function assertCrossrefs(context, e, c) {
  const { result, bibliography } = context;
  for (const [i, v] of e.value.internal.entries()) {
    const original = new URL(v.href, context.article.url).hash.slice(1), target = result.semantic.crossReferences.get(original);
    const expectedTarget = target?.anchor;
    if (v.targetRetained && target) {
      const prefix = { figure:'fig', table:'tbl', equation:'eq', section:'sec' }[target.type];
      const renderedTarget = context.citationStyle === 'quarto' ? `${prefix}-${expectedTarget}` : expectedTarget;
      if (context.citationStyle === 'markdown' && target.type !== 'section') c.truth(`internal[${i}].degraded`, !result.markdown.includes(`](#${expectedTarget})`), 'Markdown semantic refs must not target missing anchors');
      else c.truth(`internal[${i}].target`, result.markdown.includes(`](#${renderedTarget})`), 'Retained internal reference must use the dialect target');
    } else if (!v.targetRetained) c.truth(`internal[${i}].noDangling`, !result.markdown.includes(`](#${original})`), 'Omitted target must not emit a dangling local reference');
  }
  for (const [i, v] of e.value.externalFragments.entries()) c.truth(`externalFragments[${i}]`,
    result.markdown.includes(v.href) || (context.citationStyle === 'quarto' && bibliography.includes(v.href)), 'External article fragment must remain an external URL');
}
function assertUi(context, e, c) {
  for (const [i, ui] of e.value.excluded.entries()) {
    c.truth(`excluded[${i}].source`, sourceText(blockNode(context, ui.blockId)?.textContent) === ui.text, 'UI expectation must identify the actual retained source block');
    c.truth(`excluded[${i}].output`, !readable(context.result.markdown, context.result).includes(ui.text), 'Retained publisher UI must be absent from final Markdown');
  }
}
function assertTables(context, e, c) {
  const { result } = context;
  c.equal('tables.count', result.tables.length, e.value.resources.length);
  for (const [i, v] of e.value.resources.entries()) {
    const actual = result.tables.find(t => t.url === v.url);
    c.truth(`tables[${i}].present`, !!actual, 'Declared source table must be rendered');
    if (!actual) continue;
    c.equal(`tables[${i}].status`, actual.tableContentStatus, v.expectedStatus);
    c.equal(`tables[${i}].warning`, actual.tableContentWarning || null, v.warning);
    c.truth(`tables[${i}].url`, result.markdown.includes(v.url), 'Absolute full-size table URL must remain available');
    if (actual.tableHtml) {
      const dom = new JSDOM(actual.tableHtml), table = dom.window.document.querySelector('table');
      const rows = Array.from(table?.rows || []).map(row => Array.from(row.cells).map(cell => ({ tag:cell.tagName,
        text:sourceText(cell.textContent), colspan:cell.colSpan, rowspan:cell.rowSpan })));
      c.equal(`tables[${i}].sourceCellsAndSpans`, rows, v.sourceRows.map(row => row.map(({ tag,text,colspan,rowspan }) => ({ tag,text,colspan,rowspan }))));
      dom.window.close();
      c.truth(`tables[${i}].markdown`, !!actual.markdown, 'Structured table must have rendered Markdown cells');
    }
    for (const [j, note] of v.sourceNotes.entries()) c.truth(`tables[${i}].notes[${j}]`,
      readable(result.markdown, result).includes(sourceReadable(note.text)), 'Source table footer note must survive');
  }
  c.equal('debug.tableSummary.total', result.debug.tableSummary.totalTables, e.value.resources.length);
  c.equal('debug.tableSummary.statuses', result.debug.tableSummary.statuses.map(s => s.status), e.value.resources.map(r => r.expectedStatus));
}
const consumers = new Map([['metadata',assertMetadata],['abstract',assertAbstract],['headings',assertHeadings],
  ['equations',assertEquations],['figures',assertFigures],['citations',assertCitations],['inline',assertInline],
  ['crossrefs',assertCrossrefs],['ui',assertUi],['tables',assertTables]]);

export const assertionRegistry = new Map(Array.from(consumers, ([kind, consumer]) => [
  `nature-source-${kind}-v1`, { validate: validators.get(kind), assert(context, expectation) {
    const c = checks(); consumer(context, expectation, c);
    assert.deepEqual(c.failures, [], `${context.article.articleId}/${expectation.id}/${context.citationStyle}: ${stableJson(c.failures)}`);
    return true;
  } },
]));

export function runProductionValidators(result, citationStyle = result.citationStyle) {
  return {
    math: validateMathDelimiters(result.markdown),
    structure: validateMarkdownStructure(result.markdown, { dialect:citationStyle, citationStyle }),
    rawHtml: validateRawHtml(result.markdown, { allowHtmlAnchors:citationStyle === 'links' }),
    crossReferences: validateCrossReferences(result.markdown, { dialect:citationStyle, citationStyle }),
  };
}
export function semanticSummary(result) {
  return JSON.parse(stableJson({ metadata:result.metadata,
    figures:result.figures.map(f => ({ id:f.natureId, label:f.label, imageUrl:f.imageUrl, caption:f.captionMarkdown, alt:f.alt, source:f.source })),
    equations:result.semantic.displayMath.map(m => m.tex),
    citations:result.semantic.citations.map(c => c.numbers), references:result.references,
    tables:result.tables.map(t => ({ url:t.url, label:t.label, status:t.tableContentStatus, warning:t.tableContentWarning || null, markdown:t.markdown || '' })),
    warnings:result.debug.warnings, validators:runProductionValidators(result),
  }));
}

export function compareArticleResult(article, result, { sourceDocument, sourceHtml, citationStyle = result.citationStyle,
  bibliography = referencesBib(result.references) } = {}) {
  let dom;
  if (!sourceDocument) {
    if (typeof sourceHtml !== 'string') throw new TypeError('Comparison requires the immutable sourceDocument or sourceHtml retained projection');
    dom = new JSDOM(sourceHtml, { url:article.url }); sourceDocument = dom.window.document;
  }
  try {
    const context = { article,result,sourceDocument,citationStyle,bibliography };
    const expectations = article.expectations.map(e => {
      const kind = e.assertionId.replace(/^nature-source-/u, '').replace(/-v1$/u, ''), c = checks();
      if (!assertionRegistry.get(e.assertionId)?.validate(e.value)) c.truth('schema', false, 'Strict source expectation schema rejected');
      else consumers.get(kind)(context, e, c);
      return { id:e.id, assertionId:e.assertionId, status:c.failures.length ? 'failure':'pass', failures:c.failures };
    });
    const expected = article.expectations.flatMap(e => e.assertionId === 'nature-source-equations-v1'
      ? (e.value.absenceWarning ? [e.value.absenceWarning] : [])
      : e.assertionId === 'nature-source-tables-v1' ? e.value.resources.filter(r => r.warning).map(r => `${result.tables.find(t => t.url === r.url)?.label}: ${r.warning}`) : []);
    const actual = result.debug.warnings, warnings = { expected,actual,
      unexpected:actual.filter(w => !expected.includes(w)), missing:expected.filter(w => !actual.includes(w)) };
    const validation = runProductionValidators(result,citationStyle);
    return { version:ASSERTION_VERSION, articleId:article.articleId, citationStyle, expectations,
      validators:validation, warnings, summary:semanticSummary(result),
      pass:expectations.every(e => e.status === 'pass') && Object.values(validation).every(v => v.valid)
        && !warnings.unexpected.length && !warnings.missing.length };
  } finally { dom?.window.close(); }
}

export function expectationCoverage(manifest, { transportSeamAvailable = false, parserDefects = new Map() } = {}) {
  return manifest.articles.flatMap(article => article.expectations.map(e => ({ articleId:article.articleId,
    id:e.id, assertionId:e.assertionId, blockIds:e.blockIds, state:
      parserDefects.has(`${article.articleId}/${e.id}`) ? 'BLOCKED_BY_PARSER_DEFECT'
        : article.resources.length && !transportSeamAvailable ? 'BLOCKED_BY_D_TRANSPORT_SEAM':'EXECUTABLE_NOW',
    reason:parserDefects.get(`${article.articleId}/${e.id}`) || (article.resources.length && !transportSeamAvailable
      ? 'clipNature table replay transport forwarding is required before any whole-article offline clip':'') })));
}
