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
    .replace(/(?:\[\^(?:[0-9]+)\])+/gu, group => Array.from(group.matchAll(/\[\^(\d+)\]/gu)).map(m => m[1]).join(','))
    .replace(/\[([^\]]+)\]\([^\n]*?\)/gu, '$1')
    .replace(/\[@([^\]]+)\]/gu, (_, keys) => keys.split(/;\s*@?/u).map(k => byKey.get(k) ?? k).join(','))
    .replace(/\*\*|(?<!\\)\*/gu, '')
    .replace(/\\([\[\]{}|.-])/gu, '$1')
    .replace(/\\(?:mathrm|mathbf|text|mathit)\{([^{}]*)\}/gu, '$1')
    .replace(/\\(?:rm|bf)\b/gu,'')
    .replace(/\\(?:left|right)(?=[()[\]{}|])/gu,'')
    .replace(/\\[()[\]]/gu,'')
    .replace(/\\(?:,|;|!|quad|qquad|thinspace|\s)/gu, '')
    .replace(/\\times/gu, '×').replace(/\\pm/gu, '±')
    .replace(/\\Vert/gu,'||').replace(/\\mid/gu,'|')
    .replace(/\\(?:alpha|beta|gamma|delta|lambda|mu|sigma|tau|omega|theta|chi|rho|nu|phi|pi|epsilon|eta|kappa|zeta|psi)/gu,
      s => ({ alpha:'α',beta:'β',gamma:'γ',delta:'δ',lambda:'λ',mu:'μ',sigma:'σ',tau:'τ',omega:'ω',theta:'θ',chi:'χ',rho:'ρ',nu:'ν',phi:'φ',pi:'π',epsilon:'ϵ',eta:'η',kappa:'κ',zeta:'ζ',psi:'ψ' })[s.slice(1)])
    .replace(/[$^_{}]/gu, '').replace(/\s*−\s*/gu, '-').replace(/(\d),\s+(?=\d)/gu, '$1,'));
}
function sourceReadable(value) { return readable(value,{references:[]}); }
function compactProse(value, result) { return readable(value, result).replace(/\s/gu, ''); }
function sameProse(c, path, actual, expected, result) {
  c.equal(path, compactProse(actual, result), sourceReadable(expected).replace(/\s/gu, ''));
}
const blockNode = (context, blockId) => {
  const block = context.article.retainedBlocks.find(b => b.id === blockId);
  return block ? context.sourceDocument.querySelector(block.selector) : null;
};
function retainedNodes(context, selector, blockIds = context.article.retainedBlocks.map(b => b.id)) {
  const roots = blockIds.map(id => blockNode(context, id)).filter(Boolean);
  return Array.from(context.sourceDocument.querySelectorAll(selector)).filter(node => roots.some(root => root === node || root.contains(node)));
}
function sourceNeighbors(node, length = 32) {
  const root = node.closest('p,figcaption,[data-test="bottom-caption"]') || node.parentElement;
  if (!root) return { before:'',after:'' };
  const before = node.ownerDocument.createRange(), after = node.ownerDocument.createRange();
  before.selectNodeContents(root); before.setEndBefore(node);
  after.selectNodeContents(root); after.setStartAfter(node);
  return { before:sourceReadable(before.toString()).slice(-length).replace(/\s/gu,''),
    after:sourceReadable(after.toString()).slice(0,length).replace(/\s/gu,'') };
}

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
    sameProse(c,`figures[${i}].completeCaptionPayload`,actual.captionMarkdown || '',f.captionText,result);
    const label = `${/^Extended Data/u.test(f.label) ? 'Extended Data ':''}Figure ${Number(f.label.match(/\d+/u)?.[0])}`;
    c.equal(`figures[${i}].label`, actual.label, label);
    c.equal(`figures[${i}].shortAlt`, actual.alt, label);
    const image = `![${actual.alt}](${actual.imageUrl})`;
    c.equal(`figures[${i}].renderedImageOccurrences`, result.markdown.split(image).length - 1, 1);
    const start = result.markdown.indexOf(image), next = result.markdown.indexOf('\n![', start + image.length);
    const renderedCaption = result.markdown.slice(start + image.length, next < 0 ? undefined : next).split(/^## /mu)[0];
    const withoutLabel = f.captionText.replace(/^(?:Extended Data )?Fig(?:ure)?\.?\s*\d+\s*[:.]?\s*/iu, '');
    c.truth(`figures[${i}].captionStart`, readable(renderedCaption, result).includes(sourceReadable(withoutLabel.slice(0, 80))), 'Complete caption start must follow its image');
    c.truth(`figures[${i}].captionEnd`, readable(renderedCaption, result).includes(sourceReadable(f.captionEnd)), 'Complete caption end must follow its image');
    const bold = Array.from((actual.captionMarkdown || '').matchAll(/\*\*([a-z])\*\*|\\mathbf\{([a-z])\}/gu)).map(m=>m[1] || m[2]);
    c.equal(`figures[${i}].boldSingleLetterSequence`, bold, f.boldSingleLetterSequence);
    const captionPlain = readable(result.markdown, result), sentinel = sourceReadable(withoutLabel.slice(0, 72));
    c.equal(`figures[${i}].captionOccurrences`, captionPlain.split(sentinel).length - 1, 1);
    if (actual.source === 'inline figure') {
      const before = compactProse(result.markdown.slice(0, start), result), after = compactProse(result.markdown.slice(start + image.length), result);
      if (f.previousParagraph) c.truth(`figures[${i}].previousParagraph`, before.includes(sourceReadable(f.previousParagraph).replace(/\s/gu,'')), 'Image must follow its source-adjacent paragraph');
      if (f.nextParagraph) c.truth(`figures[${i}].nextParagraph`, after.includes(sourceReadable(f.nextParagraph).replace(/\s/gu,'')), 'Image must precede its source-adjacent paragraph');
    }
    if (context.citationStyle === 'quarto') c.truth(`figures[${i}].identifier`, result.markdown.includes(`${image}{#fig-${actual.anchor}}`), 'Quarto image must carry its figure identifier');
  });
}
function assertCitations(context, e, c) {
  const { result, bibliography } = context, v = e.value;
  c.equal('references.count', result.references.length, v.referenceCount);
  c.equal('debug.references', result.debug.references, v.referenceCount);
  c.equal('semantic.orderedSourceClusters',result.semantic.citations.map(item=>item.numbers),v.clusters.map(item=>item.orderedNumbers));
  c.equal('references.sourcePayload', result.references.map(r => ({ number: r.number, text: r.text, doi: r.doi })),
    v.references.map(r => ({ number: r.number, text: r.text, doi: r.doi })));
  const keys = result.references.map(r => r.citationKey);
  c.equal('bibliography.uniqueKeys', new Set(keys).size, keys.length);
  const bibKeys = Array.from(bibliography.matchAll(/^@\w+\{([^,]+),/gmu)).map(m => m[1]);
  c.equal('bibliography.orderedKeys', bibKeys, keys);
  const body = result.markdown.split(/^## References\s*$/mu)[0];
  const keyNumbers = new Map(result.references.map(r=>[r.citationKey,r.number]));
  const renderedClusters = context.citationStyle === 'quarto'
    ? Array.from(body.matchAll(/\[@([^\]]+)\]/gu)).map(m=>m[1].split(/;\s*@?/u).map(k=>keyNumbers.get(k)))
    : context.citationStyle === 'markdown'
      ? Array.from(body.replace(/^\[\^\d+\]:[^\n]*$/gmu,'').matchAll(/(?:\[\^\d+\])+/gu)).map(m=>Array.from(m[0].matchAll(/\[\^(\d+)\]/gu)).map(n=>Number(n[1])))
      : Array.from(body.matchAll(/\[\d+\]\(#ref-\d+\)(?:,\s*\[\d+\]\(#ref-\d+\))*/gu)).map(m=>Array.from(m[0].matchAll(/\[(\d+)\]\(#ref-\d+\)/gu)).map(n=>Number(n[1])));
  c.equal('rendered.orderedSourceClusters',renderedClusters,v.clusters.map(item=>item.orderedNumbers));
  const sourceClusters = retainedNodes(context,'sup',e.blockIds).filter(n=>n.querySelector('a[data-test="citation-ref"],a[href*="#ref-CR"]'));
  c.equal('source.orderedClusterTexts',sourceClusters.map(n=>sourceText(n.textContent)),v.clusters.map(item=>item.text));
  for (const [i, cluster] of v.clusters.entries()) {
    const expected = context.citationStyle === 'quarto'
      ? `[${cluster.orderedNumbers.map(n => `@${keys[n - 1]}`).join('; ')}]`
      : context.citationStyle === 'links' ? cluster.orderedNumbers.map(n => `[${n}](#ref-${n})`).join(', ')
        : cluster.orderedNumbers.map(n => `[^${n}]`).join('');
    c.truth(`clusters[${i}].rendered`, body.includes(expected), `Ordered source citation cluster ${cluster.text} must be rendered`);
    if (sourceClusters[i]) {
      const { before,after } = sourceNeighbors(sourceClusters[i]);
      c.truth(`clusters[${i}].sourceContext`,compactProse(body,result).includes(`${before}${compactProse(expected,result)}${after}`),
        'Citation cluster must remain between its original neighboring source text');
    }
  }
  if (context.citationStyle === 'markdown') c.equal('referenceDefinitions', Array.from(result.referencesMarkdown.matchAll(/^\[\^(\d+)\]:/gmu)).map(m => Number(m[1])), v.references.map(r => r.number));
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
    const paragraph = sourceText(node.closest('p')?.textContent);
    const contextStart = paragraph.split(/\\\(|\$\$/u)[0].slice(0,36);
    const candidates = result.markdown.split(/\n\s*\n/u).filter(p=>compactProse(p,result).includes(contextStart.replace(/\s/gu,'')));
    c.truth(`cases[${i}].paragraphContext`, candidates.length === 1, 'Scientific case must remain in its unique source paragraph');
    const output = candidates[0] || '';
    const compact = value => readable(value,result).replace(/\s/gu,'');
    if (node.matches('sub,sup') && !node.querySelector('a[href*="#ref-CR"]')) {
      let previous = node.previousSibling;while(previous && !sourceText(previous.textContent))previous=previous.previousSibling;
      const base = sourceText(previous?.textContent).match(/[\p{L}\p{N}()′″]+$/u)?.[0] || '';
      const operator = node.tagName === 'SUB' ? '_':'^';
      const attachment = value => sourceText(value).replace(/\\(?:mathrm|mathbf|text|mathit)\{([^{}]*)\}/gu,'$1').replace(/[\s${}]/gu,'');
      const nextBase = !base ? sourceText(node.nextSibling?.textContent).match(/^[\p{L}\p{N}()′″]+/u)?.[0] || '' : '';
      const target = base ? `${attachment(base)}${operator}${attachment(v.text)}` : `${operator}${attachment(v.text)}${attachment(nextBase)}`;
      const rendered = attachment(output.replace(/\[\^\d+\]/gu,'').replace(/\*\*/gu,'').replace(/\*/gu,''));
      c.truth(`cases[${i}].baseAndAttachment`, !!(base || nextBase) && rendered.includes(target), `Source base/exponent must remain attached as ${target}`);
    } else if (node.matches('b,i') && !node.querySelector('sup,sub')) {
      c.truth(`cases[${i}].valueInContext`,compact(output).includes(compact(v.text)),'Styled scientific value must remain in source context');
      if (node.tagName === 'B' && /^\d+$/u.test(v.text)) c.truth(`cases[${i}].compoundMarker`,output.includes(`**${v.text}**`),'Compound numbers must remain bold rather than becoming citations');
    } else if (node.matches('.mathjax-tex')) {
      const tex = texCanonical(v.text);
      c.truth(`cases[${i}].sourceTeX`,output.includes(tex),'Source inline TeX must remain intact in its paragraph');
    }
  }
}
function assertCrossrefs(context, e, c) {
  const { result, bibliography } = context;
  const positions = new Map();
  for (const [i, v] of e.value.internal.entries()) {
    const sourceKey = `${v.blockIds.join(',')}\u0000${v.href}\u0000${v.text}`, position = positions.get(sourceKey) || 0;
    positions.set(sourceKey,position+1);
    const source = retainedNodes(context,'a[href]',v.blockIds).filter(n=>n.getAttribute('href')===v.href && sourceText(n.textContent)===v.text)[position];
    c.truth(`internal[${i}].source`,!!source,'Internal link must retain its source occurrence');
    if (source) {
      const { before,after } = sourceNeighbors(source);
      c.truth(`internal[${i}].readableContext`,compactProse(result.markdown,result).includes(`${before}${sourceReadable(v.text).replace(/\s/gu,'')}${after}`),
        'Internal reference text must survive in its original source context');
    }
    const original = new URL(v.href, context.article.url).hash.slice(1), target = result.semantic.crossReferences.get(original);
    const expectedTarget = target?.anchor;
    if (v.targetRetained) c.truth(`internal[${i}].identity`,!!target,'Retained source identity must have a semantic target');
    if (v.targetRetained && target) {
      const node=context.sourceDocument.getElementById(original);
      const sourceType=node?.closest('.c-article-equation')?'equation'
        :node?.closest('.c-article-table,.c-article-table__figcaption')?'table'
          :node?.closest('figure,.js-c-reading-companion-figures-item')?'figure'
            :node?.matches('h2,h3,h4,h5,h6')?'section':null;
      c.truth(`internal[${i}].sourceIdentity`,!!node && !!sourceType,'Retained target must have an original typed source identity');
      c.equal(`internal[${i}].sourceType`,target.type,sourceType);
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
      c.equal(`tables[${i}].renderedTableOccurrences`,result.markdown.split(actual.markdown || '\u0000').length-1,1);
      const grid=[];
      for(const [rowIndex,row] of v.sourceRows.entries()) { grid[rowIndex] ||= [];let column=0;
        for(const cell of row) { while(grid[rowIndex][column]!==undefined)column++;
          for(let y=0;y<cell.rowspan;y++)for(let x=0;x<cell.colspan;x++) { grid[rowIndex+y] ||= [];grid[rowIndex+y][column+x]=x===0&&y===0?cell.text:''; }
          column+=cell.colspan;
        }
      }
      const width=Math.max(...grid.map(row=>row.length));const header=v.sourceRows[0].some(cell=>cell.tag==='TH');
      const expectedGrid=(header?grid:[Array.from({length:width},(_,n)=>`Column ${n+1}`),...grid]).map(row=>Array.from({length:width},(_,n)=>row[n] || ''));
      const renderedGrid=String(actual.markdown || '').split('\n').filter(line=>line.startsWith('|')).filter(line=>!/^\|\s*:?-+:?\s*\|/u.test(line))
        .map(line=>line.slice(1,-1).split(/(?<!\\)\|/u).map(cell=>cell.trim()));
      c.equal(`tables[${i}].renderedGridDimensions`,renderedGrid.map(row=>row.length),expectedGrid.map(row=>row.length));
      for(const [y,row] of expectedGrid.entries())for(const [x,cell]of row.entries()) {
        const normalizeCell=value=>compactProse(value,result).replace(/\\[()[\]]/gu,'');
        c.equal(`tables[${i}].renderedCell[${y},${x}]`,normalizeCell(renderedGrid[y]?.[x] || ''),normalizeCell(cell));
      }
    }
    let previousNote=-1;
    for (const [j, note] of v.sourceNotes.entries()) {
      const tableSection=result.markdown.split(/^## Tables\s*$/mu)[1]?.split(/^## /mu)[0] || '';
      const output=compactProse(tableSection,result),text=sourceReadable(note.text).replace(/\s/gu,'');
      const position=output.indexOf(text);c.truth(`tables[${i}].notes[${j}]`,position>=0,'Source table footer note must survive');
      c.equal(`tables[${i}].notes[${j}].occurrences`,output.split(text).length-1,1);
      c.truth(`tables[${i}].notes[${j}].order`,position>previousNote,'Table notes must remain in source order');previousNote=position;
    }
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
    const difference = (left,right) => {
      const remaining=[...right];return left.filter(item=>{const index=remaining.indexOf(item);if(index<0)return true;remaining.splice(index,1);return false;});
    };
    const actual = result.debug.warnings, warnings = { expected,actual,
      unexpected:difference(actual,expected), missing:difference(expected,actual) };
    const validation = runProductionValidators(result,citationStyle);
    return { version:ASSERTION_VERSION, articleId:article.articleId, citationStyle, expectations,
      validators:validation, warnings, summary:semanticSummary(result),
      pass:expectations.every(e => e.status === 'pass') && Object.values(validation).every(v => v.valid)
        && !warnings.unexpected.length && !warnings.missing.length && isDeepStrictEqual(actual,expected) };
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

export function auditSourceOracle(article, sourceDocument, resourceDocuments = new Map()) {
  const c = checks(), roots = article.retainedBlocks.map(b => sourceDocument.querySelector(b.selector)).filter(Boolean);
  const selected = selector => Array.from(sourceDocument.querySelectorAll(selector)).filter(n => roots.some(root => root === n || root.contains(n)));
  const metadata = name => sourceText(sourceDocument.querySelector(`meta[name="${name}"]`)?.getAttribute('content'));
  const records = [];
  for (const e of article.expectations) {
    const before = c.failures.length, v = e.value, key = e.assertionId;
    const eq = (p,a,b) => c.equal(`${e.id}.${p}`,a,b);
    const truth = (p,a,m) => c.truth(`${e.id}.${p}`,a,m);
    if (key === 'nature-source-metadata-v1') {
      for (const [field,name] of Object.entries({ title:'citation_title',doi:'citation_doi',journal:'citation_journal_title',volume:'citation_volume',issue:'citation_issue',firstPage:'citation_firstpage',lastPage:'citation_lastpage' })) eq(field,metadata(name),v[field]);
      eq('url',sourceDocument.querySelector('link[rel="canonical"]')?.getAttribute('href'),v.url);
      eq('authors',Array.from(sourceDocument.querySelectorAll('meta[name="citation_author"]')).map(n => sourceText(n.getAttribute('content'))),v.authors);
      for (const [field,value] of Object.entries(v.sourceDateFields)) eq(`sourceDateFields.${field}`,metadata(field),value);
      const section = sourceDocument.querySelector('section[data-title="Author information"]');
      const within = n => roots.some(root => root === n || root.contains(n));
      eq('notes',Array.from(section?.querySelectorAll('.c-article-author-information__item p') || []).filter(within).map(n => sourceText(n.textContent)),v.notes);
      eq('affiliations',Array.from(section?.querySelectorAll('.c-article-author-affiliation__list > li') || []).filter(within).map(n => ({ address:sourceText(n.querySelector('.c-article-author-affiliation__address')?.textContent),authors:sourceText(n.querySelector('.c-article-author-affiliation__authors-list')?.textContent) })),v.affiliations);
      eq('contributions',sourceText(section?.querySelector('#contributions + p')?.textContent),v.contributions);
      const correspondence = section?.querySelector('#corresponding-author-list');
      eq('correspondence',correspondence ? { text:sourceText(correspondence.textContent),firstEmail:correspondence.querySelector('a[href^="mailto:"]')?.getAttribute('href') || '' }:null,v.correspondence);
    } else if (key === 'nature-source-abstract-v1') {
      eq('paragraphs',selected('section[data-title="Abstract"] p').map(n => sourceText(n.textContent)),v.paragraphs);
    } else if (key === 'nature-source-headings-v1') {
      eq('ordered',selected('h2,h3,h4,h5,h6').map(n => ({ level:Number(n.tagName.slice(1)),id:n.id,text:sourceText(n.textContent),parentSection:sourceText(n.closest('section')?.getAttribute('data-title')) })),v.ordered.map(({level,id,text,parentSection})=>({level,id,text,parentSection})));
    } else if (key === 'nature-source-equations-v1') {
      eq('count',selected('.c-article-equation').length,v.count);
      eq('ordered',selected('.c-article-equation').map(n => ({ id:n.id,number:sourceText(n.querySelector('.c-article-equation__number')?.textContent),sourceTeX:n.querySelector('.mathjax-tex')?.textContent.trim() || '' })),v.ordered.map(({id,number,sourceTeX})=>({id,number,sourceTeX})));
    } else if (key === 'nature-source-figures-v1') {
      eq('count',v.ordered.length,v.count);
      eq('mainCount',v.ordered.filter(f=>!/^Extended Data/u.test(f.label)).length,v.mainCount);
      eq('extendedCount',v.ordered.filter(f=>/^Extended Data/u.test(f.label)).length,v.extendedCount);
      for (const [i,f] of v.ordered.entries()) {
        const identity = sourceDocument.getElementById(f.id);
        const node = identity?.closest('figure,.js-c-reading-companion-figures-item') || identity;
        truth(`ordered[${i}].source`,!!node,'Original figure identity must exist');
        if (!node) continue;
        const heading = node.querySelector('[data-test="figure-caption-text"],figcaption,h3');
        const description = node.querySelector('[data-test="bottom-caption"],.c-article-section__figure-description,.c-article-supplementary__description');
        const caption = sourceText([heading?.textContent,description?.textContent].filter(Boolean).join(' '));
        eq(`ordered[${i}].captionText`,caption,f.captionText);
        truth(`ordered[${i}].captionStart`,caption.startsWith(f.captionStart),'Caption start must come from the original caption');
        truth(`ordered[${i}].captionEnd`,caption.endsWith(f.captionEnd),'Caption end must come from the original caption');
        eq(`ordered[${i}].label`,sourceText(heading?.textContent),f.label);
        eq(`ordered[${i}].boldSingleLetterSequence`,Array.from(node.querySelectorAll('b,strong')).map(n=>sourceText(n.textContent)).filter(text=>/^[a-z]$/u.test(text)),f.boldSingleLetterSequence);
        if (description) eq(`ordered[${i}].descriptionPlacement`,{ id:description.id,parentTag:description.parentElement.tagName,parentClass:description.parentElement.className,insideFigure:!!description.closest('figure'),previousSiblingTag:description.previousElementSibling?.tagName || '' },f.descriptionPlacement);
        eq(`ordered[${i}].descriptionIsSibling`,!!description && !node.contains(description),f.descriptionIsSibling);
        if (!/^Extended Data/u.test(f.label)) {
          const wrapper=node.closest('.js-c-reading-companion-figures-item') || node;
          const adjacent=direction=>{let p=wrapper[direction];while(p&&p.tagName!=='P')p=p[direction];return p?sourceText(p.textContent):null;};
          const previous=adjacent('previousElementSibling'),next=adjacent('nextElementSibling');
          eq(`ordered[${i}].previousParagraph`,previous?.slice(-f.previousParagraph?.length) || null,f.previousParagraph);
          eq(`ordered[${i}].nextParagraph`,next?.slice(0,f.nextParagraph?.length) || null,f.nextParagraph);
        }
        const candidates = [...(node.matches('[data-supp-info-image]') ? [node]:[]),...node.querySelectorAll('source,img,[data-supp-info-image]')].map(n=>Object.fromEntries(['src','srcset','data-src','data-srcset','data-original','data-lazy-src','data-supp-info-image','alt'].filter(k=>n.hasAttribute(k)).map(k=>[k,n.getAttribute(k)])));
        eq(`ordered[${i}].imageCandidates`,candidates,f.imageCandidates);
      }
    } else if (key === 'nature-source-citations-v1') {
      const references = selected('ol.c-article-references > li,ol.c-article-references__list > li');
      eq('referenceCount',references.length,v.referenceCount);
      references.forEach((node,i) => { const expected=v.references[i];
        if (!expected) return;
        eq(`references[${i}].text`,sourceText(node.querySelector('.c-article-references__text')?.textContent || node.textContent),expected.text);
        eq(`references[${i}].id`,node.id,expected.id);
        eq(`references[${i}].doi`,node.querySelector('[data-doi]')?.getAttribute('data-doi') || '',expected.doi);
        eq(`references[${i}].doiLinks`,Array.from(node.querySelectorAll('a[href]')).map(n=>n.getAttribute('href')).filter(href=>/doi\.org/u.test(href)),expected.doiLinks);
        if (expected.sourceAnchorId) eq(`references[${i}].sourceAnchorId`,node.querySelector(expected.sourceAnchorSelector)?.id,expected.sourceAnchorId);
      });
      const superscripts = selected('sup').filter(n=>n.querySelector('a[data-test="citation-ref"],a[href*="#ref-CR"]'));
      eq('clusters.orderedSourcePayload',superscripts.map(n=>({text:sourceText(n.textContent),anchors:Array.from(n.querySelectorAll('a[href]')).map(a=>({text:sourceText(a.textContent),href:a.getAttribute('href')}))})),v.clusters.map(({text,anchors})=>({text,anchors})));
      for (const [i,cluster] of v.clusters.entries()) {
        const numbers=cluster.text.split(',').flatMap(part=>{const match=part.trim().match(/^(\d+)\s*[–−-]\s*(\d+)$/u);return match?Array.from({length:Number(match[2])-Number(match[1])+1},(_,n)=>Number(match[1])+n):[Number(part.trim())];});
        eq(`clusters[${i}].orderedNumbers`,numbers,cluster.orderedNumbers);
      }
    } else if (key === 'nature-source-inline-v1') {
      for (const [i,item] of v.cases.entries()) {
        const block=article.retainedBlocks.find(b=>b.id===item.sourceLocation.blockId),root=sourceDocument.querySelector(block?.selector);
        const node=root?.querySelectorAll(item.sourceLocation.selector)[item.sourceLocation.index];
        eq(`cases[${i}].tag`,node?.tagName,item.tag);eq(`cases[${i}].text`,sourceText(node?.textContent),item.text);
        eq(`cases[${i}].subtree`,node?.outerHTML,item.subtree);
        const paragraph=sourceText(node?.closest('p')?.textContent);
        truth(`cases[${i}].paragraphStart`,paragraph.startsWith(item.paragraphStart),'Inline source context start must match');
        truth(`cases[${i}].paragraphEnd`,paragraph.endsWith(item.paragraphEnd),'Inline source context end must match');
      }
    } else if (key === 'nature-source-crossrefs-v1') {
      for (const [i,item] of [...v.internal,...v.externalFragments].entries()) truth(`links[${i}]`,selected('a[href]').some(n=>n.getAttribute('href')===item.href && sourceText(n.textContent)===item.text),'Exact source link identity/text must exist');
    } else if (key === 'nature-source-ui-v1') {
      for (const ui of v.excluded) { const block=article.retainedBlocks.find(b=>b.id===ui.blockId);eq(ui.blockId,sourceText(sourceDocument.querySelector(block?.selector)?.textContent),ui.text); }
    } else if (key === 'nature-source-tables-v1') {
      for (const resource of v.resources) {
        const document=resourceDocuments.get(resource.id);
        truth(resource.id,!!document,'Independent table source document is required');if(!document)continue;
        eq(`${resource.id}.title`,sourceText(document.querySelector('h1')?.textContent),resource.title);
        const rows=Array.from(document.querySelector('table')?.rows || []).map(row=>Array.from(row.cells).map(cell=>({tag:cell.tagName,text:sourceText(cell.textContent),colspan:cell.colSpan,rowspan:cell.rowSpan,html:cell.innerHTML})));
        eq(`${resource.id}.sourceRows`,rows,resource.sourceRows);
        eq(`${resource.id}.sourceNotes`,Array.from(document.querySelectorAll(resource.sourceNotesLocator)).map(n=>({text:sourceText(n.textContent),html:n.innerHTML})),resource.sourceNotes);
        eq(`${resource.id}.physicalRowCount`,rows.length,resource.physicalRowCount);
        eq(`${resource.id}.physicalCellCounts`,rows.map(row=>row.length),resource.physicalCellCounts);
      }
    }
    records.push({ id:e.id,assertionId:e.assertionId,status:c.failures.length===before?'pass':'failure',failures:c.failures.slice(before) });
  }
  return records;
}
