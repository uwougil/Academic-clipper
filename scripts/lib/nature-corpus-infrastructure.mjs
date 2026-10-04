import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { isIP } from 'node:net';
import { JSDOM } from 'jsdom';

export const SCHEMA_VERSION = '1.0.0';
export const SANITIZER_VERSION = 'nature-corpus-sanitizer/1.1.0';
export const LEGACY_SANITIZER_VERSION = 'nature-corpus-sanitizer/1.0.0';
export const SERIALIZER_VERSION = 'nature-corpus-subtree/1.0.0';
export const PROJECTION_VERSION = 'nature-corpus-projection/1.0.0';
export const RECIPE_VERSION = '1.0.0';
const ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/u;
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const schema = JSON.parse(await readFile(new URL('../../test/corpus/corpus-schema.json', import.meta.url), 'utf8'));

export class CorpusIntegrityError extends Error {
  constructor(message) { super(message); this.name = 'CorpusIntegrityError'; this.code = 'FIXTURE_INTEGRITY_FAILURE'; }
}
function requireThat(condition, message) { if (!condition) throw new CorpusIntegrityError(message); }
export function sha256Bytes(bytes) {
  requireThat(bytes instanceof Uint8Array, 'Hash input must be raw Uint8Array/Buffer bytes, not decoded text.');
  return createHash('sha256').update(bytes).digest('hex');
}
export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  requireThat(value !== undefined && (typeof value !== 'number' || Number.isFinite(value)), 'Value is not finite JSON.');
  return JSON.stringify(value);
}
function schemaCheck(value, rule, location = '$') {
  if (rule.$ref) return schemaCheck(value, schema.$defs[rule.$ref.split('/').at(-1)], location);
  if (rule.if) {
    let matches = true;
    try { schemaCheck(value, rule.if, location); } catch (error) { if (!(error instanceof CorpusIntegrityError)) throw error; matches = false; }
    if (matches && rule.then) schemaCheck(value, rule.then, location);
    if (!matches && rule.else) schemaCheck(value, rule.else, location);
  }
  if (rule.enum) requireThat(rule.enum.includes(value), `${location}: unsupported value`);
  if (rule.const !== undefined) requireThat(value === rule.const, `${location}: version/value mismatch`);
  if (rule.type) {
    const types = Array.isArray(rule.type) ? rule.type : [rule.type];
    requireThat(types.some((type) => type === 'array' ? Array.isArray(value)
      : type === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value)
        : type === 'integer' ? Number.isInteger(value)
          : type === 'null' ? value === null : typeof value === type), `${location}: invalid type`);
  }
  if (typeof value === 'string') {
    if (rule.minLength) requireThat(value.length >= rule.minLength, `${location}: empty string`);
    if (rule.pattern) requireThat(new RegExp(rule.pattern, 'u').test(value), `${location}: invalid format`);
  }
  if (typeof value === 'number') {
    if (rule.minimum !== undefined) requireThat(value >= rule.minimum, `${location}: below minimum`);
    if (rule.maximum !== undefined) requireThat(value <= rule.maximum, `${location}: above maximum`);
  }
  if (Array.isArray(value)) {
    if (rule.minItems) requireThat(value.length >= rule.minItems, `${location}: too few items`);
    if (rule.maxItems) requireThat(value.length <= rule.maxItems, `${location}: too many items`);
    if (rule.uniqueItems) requireThat(new Set(value.map(stableJson)).size === value.length, `${location}: duplicate values`);
    value.forEach((item, index) => schemaCheck(item, rule.items || {}, `${location}[${index}]`));
  } else if (value && typeof value === 'object') {
    for (const key of rule.required || []) requireThat(Object.hasOwn(value, key), `${location}: missing ${key}`);
    for (const [key, item] of Object.entries(value)) {
      if (rule.additionalProperties === false) requireThat(Object.hasOwn(rule.properties || {}, key), `${location}: unknown field ${key}`);
      if (rule.properties?.[key]) schemaCheck(item, rule.properties[key], `${location}.${key}`);
    }
  }
}
function unique(items, label) {
  requireThat(new Set(items).size === items.length, `Duplicate ${label}`);
}
export function validateFixturePath(fixturePath, articleId) {
  requireThat(typeof fixturePath === 'string' && typeof articleId === 'string' && ID.test(articleId), 'Invalid fixture path/article ID');
  const prefix = `fixtures/${articleId}/`;
  requireThat(fixturePath.startsWith(prefix) && !fixturePath.includes('\\') && !fixturePath.includes('%')
    && !fixturePath.includes(':') && !fixturePath.includes('\0'), `Unsafe fixture path: ${fixturePath}`);
  const parts = fixturePath.split('/');
  requireThat(parts.every((part) => ID.test(part) && !['.', '..'].includes(part)
    && !/[. ]$/u.test(part) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(part)), `Unsafe fixture path: ${fixturePath}`);
  requireThat(fixturePath === `${prefix}article.excerpt.html`
    || new RegExp(`^fixtures/${articleId.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}/tables/[a-zA-Z0-9][a-zA-Z0-9._-]*\\.excerpt\\.html$`, 'u').test(fixturePath), 'Fixture path must name an article/table excerpt');
  return fixturePath;
}
export function validateRecipe(recipe) {
  schemaCheck(recipe, schema.$defs.recipe, '$recipe');
  unique(recipe.blocks.map((block) => block.id), 'recipe block IDs');
  return recipe;
}
/** Registry Map<assertionId, {validate(value): boolean, assert(context, expectation): any}>.
 * Validation is synchronous; false or a thrown error rejects the oracle. */
export function validateManifest(manifest, { assertionRegistry } = {}) {
  stableJson(manifest); // Reject non-JSON values in consumer-owned oracle payloads too.
  schemaCheck(manifest, schema);
  requireThat(assertionRegistry instanceof Map, 'An assertionRegistry Map is required (even for an empty manifest).');
  unique(manifest.articles.map((article) => article.articleId), 'article IDs');
  for (const article of manifest.articles) {
    requireThat(article.url === `https://www.nature.com/articles/${article.articleId}`
      && article.doi === `10.1038/${article.articleId}`, `Article identity mismatch: ${article.articleId}`);
    requireThat(Number.isFinite(Date.parse(article.observedAt)) && /T.*(?:Z|[+-]\d\d:\d\d)$/u.test(article.observedAt), 'observedAt must be an actual ISO timestamp with timezone');
    requireThat(article.fixturePath === `fixtures/${article.articleId}/article.excerpt.html`, 'Article must use its article excerpt path');
    validateFixturePath(article.fixturePath, article.articleId);
    validateRecipe(article.recipe);
    if (article.liveObservations) {
      requireThat(Number.isFinite(Date.parse(article.liveObservations.observedAt)) && /T.*(?:Z|[+-]\d\d:\d\d)$/u.test(article.liveObservations.observedAt), 'liveObservations observedAt must include timezone');
      requireThat(article.liveObservations.retainedProjection.recipeSha256 === sha256Bytes(Buffer.from(stableJson(article.recipe))), 'Live observation recipe hash mismatch');
    }
    unique(article.retainedBlocks.map((block) => block.id), 'retained block IDs');
    requireThat(stableJson(article.recipe.blocks) === stableJson(article.retainedBlocks.map(({ sourceSubtreeSha256, ...block }) => block)), 'Recipe/retained blocks mismatch');
    unique(article.resources.map((resource) => resource.id), 'resource IDs');
    unique(article.resources.map((resource) => `${resource.method} ${resource.url}`), 'resource operations');
    for (const resource of article.resources) {
      let url;
      try { url = new URL(resource.url); } catch { throw new CorpusIntegrityError('Invalid resource URL'); }
      requireThat(url.href === resource.url && url.origin === 'https://www.nature.com'
        && url.pathname.startsWith(`/articles/${article.articleId}/tables/`) && !url.search && !url.hash, 'Resource must be a same-article Nature table URL');
      if (resource.responseMocked) requireThat(!resource.fixturePath && !resource.sourceSha256 && !resource.fixtureSha256, 'Mock response cannot claim source provenance');
      else {
        requireThat(resource.fixturePath && resource.sourceSha256 && resource.fixtureSha256 && !Object.hasOwn(resource, 'body'), 'Real resource requires fixture and independent source/fixture hashes');
        validateFixturePath(resource.fixturePath, article.articleId);
        requireThat(resource.fixturePath.includes('/tables/'), 'Table resource must use a table fixture path');
        for (const key of ['sanitizerVersion', 'serializerVersion', 'recipe', 'retainedBlocks', 'transformations', 'omittedContent']) requireThat(Object.hasOwn(resource, key), `Real resource missing ${key}`);
        validateRecipe(resource.recipe);
        requireThat(Number.isFinite(Date.parse(resource.observedAt)) && /T.*(?:Z|[+-]\d\d:\d\d)$/u.test(resource.observedAt), 'Resource observedAt must include timezone');
        requireThat(stableJson(resource.recipe.blocks) === stableJson(resource.retainedBlocks.map(({ sourceSubtreeSha256, ...block }) => block)), 'Resource recipe/retained blocks mismatch');
      }
      requireThat([301, 302, 303, 307, 308].includes(resource.status) === Boolean(resource.location), 'Redirect status/location mismatch');
    }
    unique([article.fixturePath, ...article.resources.filter((r) => r.fixturePath).map((r) => r.fixturePath)], 'fixture paths');
    unique(article.expectations.map((expectation) => expectation.id), 'expectation IDs');
    const blockList = [...article.retainedBlocks, ...article.resources.filter((r) => !r.responseMocked).flatMap((r) => r.retainedBlocks)];
    unique(blockList.map((block) => block.id), 'article/resource block IDs');
    const blocks = new Set(blockList.map((block) => block.id));
    requireThat(article.recipe.articleUrl === article.url && article.resources.every((r) => !r.recipe || r.recipe.articleUrl === article.url), 'Recipe article identity mismatch');
    const expectationIds = new Set(article.expectations.map((expectation) => expectation.id));
    for (const expectation of article.expectations) {
      requireThat(expectation.blockIds.every((id) => blocks.has(id)), 'Expectation references an unknown source block');
      const consumer = assertionRegistry.get(expectation.assertionId);
      requireThat(typeof consumer?.validate === 'function' && typeof consumer?.assert === 'function', `Unconsumed expectation: ${expectation.assertionId}`);
      requireThat(consumer.validate(expectation.value) === true, `Invalid oracle value: ${expectation.id}`);
    }
    for (const coverage of article.coverage) {
      requireThat(blocks.has(coverage.blockId) && expectationIds.has(coverage.expectationId), 'Coverage references unknown block/expectation');
      requireThat(article.expectations.find((e) => e.id === coverage.expectationId).blockIds.includes(coverage.blockId), 'Coverage block is not consumed by its expectation');
    }
  }
  return manifest;
}
/** Run every registered expectation; no parser-derived values are created here. */
export async function consumeExpectations(article, context, assertionRegistry) {
  const consumed = [];
  for (const expectation of article.expectations) {
    const consumer = assertionRegistry.get(expectation.assertionId);
    requireThat(typeof consumer?.assert === 'function', `Unconsumed expectation: ${expectation.assertionId}`);
    requireThat(await consumer.assert(context, expectation) !== false, `Assertion failed: ${expectation.id}`);
    consumed.push(expectation.id);
  }
  return consumed;
}
export async function readFixtureBytes(corpusRoot, fixturePath, articleId, expectedSha256) {
  validateFixturePath(fixturePath, articleId);
  const root = await realpath(corpusRoot);
  const target = await realpath(path.join(root, fixturePath));
  const relative = path.relative(root, target);
  requireThat(relative && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative), 'Fixture escaped corpus root (including symlink)');
  const bytes = await readFile(target);
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  requireThat(!bytes.subarray(0, 3).equals(Buffer.from([239, 187, 191])) && !text.includes('\r') && text.endsWith('\n'), 'Fixture must be UTF-8 without BOM, LF, final LF');
  requireThat(sha256Bytes(bytes) === expectedSha256, `Fixture hash mismatch: ${fixturePath}`);
  return bytes;
}
const escapeText = (text) => text.replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;');
const escapeAttr = (text) => escapeText(text).replace(/"/gu, '&quot;');
/** Source subtree serializer: DOM-normalized entities/line endings, sorted attributes,
 * exact text-node whitespace. Call BEFORE sanitization for source subtree hashes. */
export function serializeSubtree(node) {
  if (node.nodeType === 3) return ['SCRIPT', 'STYLE'].includes(node.parentNode?.tagName) ? node.data : escapeText(node.data);
  if (node.nodeType === 8) return `<!--${node.data}-->`;
  if (node.nodeType !== 1) return Array.from(node.childNodes || [], serializeSubtree).join('');
  const tag = node.localName;
  const attrs = Array.from(node.attributes).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    .map((attribute) => ` ${attribute.name}="${escapeAttr(attribute.value)}"`).join('');
  return `<${tag}${attrs}>${VOID.has(tag) ? '' : `${Array.from(node.childNodes, serializeSubtree).join('')}</${tag}>`}`;
}
function selectedDocument(html, recipe) {
  validateRecipe(recipe);
  requireThat(typeof html === 'string', 'Sanitizer input must be decoded HTML text; hash raw bytes separately first.');
  // HTML parsing moves whitespace after </html> into body. Exclude only that
  // document-external suffix so the scaffold's final LF cannot grow on each pass.
  const dom = new JSDOM(html.replace(/(<\/html>)[\t\r\n ]+$/iu, '$1')); // No resources/runScripts.
  const document = dom.window.document;
  const referenceLists = Array.from(document.querySelectorAll('ol.c-article-references, ol.c-article-references__list'))
    .map((list) => Array.from(list.children).filter((node) => node.tagName === 'LI'));
  const selected = [];
  for (const block of recipe.blocks) {
    let nodes;
    try { nodes = document.querySelectorAll(block.selector); } catch { dom.window.close(); throw new CorpusIntegrityError(`Invalid selector: ${block.selector}`); }
    if (nodes.length !== 1) { dom.window.close(); throw new CorpusIntegrityError(`Block ${block.id} must select exactly one source node; got ${nodes.length}`); }
    selected.push({ ...block, node: nodes[0], sourceSubtreeSha256: sha256Bytes(Buffer.from(serializeSubtree(nodes[0]), 'utf8')) });
  }
  const full = new Set(selected.map((block) => block.node));
  const ancestors = new Set([document.documentElement, document.head, document.body]);
  for (const node of full) for (let current = node.parentElement; current; current = current.parentElement) ancestors.add(current);
  function prune(node) {
    if (full.has(node)) return;
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3 && /^\s*$/u.test(child.data)) continue;
      if (ancestors.has(child) || full.has(child)) prune(child);
      else child.remove();
    }
  }
  prune(document.documentElement);
  return { dom, document, selected, referenceLists };
}
const DROP_SELECTOR = 'style, base, iframe, object, embed, form, input, button, textarea, select, link[rel="stylesheet"], .c-article-recommendations, .app-explore-related-subjects, [class*="analytics"], [id*="analytics"], [class*="advert"], [id*="advert"], [class*="consent"], [id*="consent"], [class*="cookie"], [id*="cookie"], [class*="account"], [id*="account"], [class*="session"], [id*="session"]';
const ALLOWED_ATTR = /^(?:id|class|name|property|content|charset|rel|href|src|srcset|type|alt|title|lang|dir|width|height|colspan|rowspan|scope|headers|start|value|aria-[a-z-]+|data-(?:test|title|doi|src|srcset|original|lazy-src|supp-info-image))$/u;
const SECRET = /(?:-----BEGIN (?:[A-Z ]*PRIVATE KEY)|(?:cookie|authorization|access[_-]?token|session[_-]?token|password)\s*[:=]|[a-z]:\\(?:Users|Windows)\\|file:\/\/|\/(?:Users|home)\/[^\s/]+\/)/iu;
const TRACK_PARAM = /^(?:utm_.*|fbclid|gclid|session.*|token|access_token|auth.*|signature|sig|x-amz-.*|x-goog-.*|api[_-]?key|password|cookie)$/iu;
function cleanUrl(value) {
  if (/^(?:data|blob|javascript|file|vbscript):/iu.test(value.replace(/[\u0000-\u0020]/gu, ''))) return null;
  // Preserve relative/root-relative spelling and fragments; only remove access/tracking query parameters.
  const question = value.indexOf('?');
  if (question < 0) {
    requireThat(!SECRET.test(value), 'Private/local material in URL; manual source review required');
    return value;
  }
  const hash = value.indexOf('#', question);
  const query = value.slice(question + 1, hash < 0 ? undefined : hash);
  const parts = query.split('&').filter((part) => {
    let key;
    try { key = decodeURIComponent(part.split('=')[0]); } catch { throw new CorpusIntegrityError('Invalid URL query encoding'); }
    return !TRACK_PARAM.test(key);
  });
  const cleaned = value.slice(0, question) + (parts.length ? `?${parts.join('&')}` : '') + (hash < 0 ? '' : value.slice(hash));
  requireThat(!SECRET.test(cleaned), 'Private/local material in URL; manual source review required');
  return cleaned;
}
function legacyArticleObjects(value) {
  return (Array.isArray(value) ? value : value?.['@graph'] || [value]).flatMap((item) => item?.['@graph'] ? legacyArticleObjects(item) : [item])
    .filter((item) => item && (Array.isArray(item['@type']) ? item['@type'] : [item['@type']]).some((type) => /^(?:Article|ScholarlyArticle|NewsArticle)$/u.test(type)));
}
/** Traverse only JSON-LD document containers, never arbitrary scholarly fields.
 * Preserve inherited context when extracting an article from WebPage.mainEntity. */
function articleObjects(value, inheritedContext) {
  if (Array.isArray(value)) return value.flatMap((item) => articleObjects(item, inheritedContext));
  if (!value || typeof value !== 'object') return [];
  const context = value['@context'] ?? inheritedContext;
  const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  if (types.some((type) => /^(?:Article|ScholarlyArticle|NewsArticle)$/u.test(type))) {
    return [{ ...value, ...(context !== undefined ? { '@context': context } : {}) }];
  }
  return [...articleObjects(value['@graph'], context), ...articleObjects(value.mainEntity, context)];
}
function exactArticleIdentity(item, articleUrl) {
  const doiUrl = `https://doi.org/10.1038/${new URL(articleUrl).pathname.split('/').at(-1)}`;
  const values = [];
  for (const key of ['url', '@id', 'mainEntityOfPage', 'sameAs']) {
    if (!Object.hasOwn(item, key)) continue;
    if (Array.isArray(item[key]) && item[key].length === 0) return false;
    for (const value of Array.isArray(item[key]) ? item[key] : [item[key]]) {
      const identity = typeof value === 'string' ? value : value && typeof value === 'object' ? value['@id'] : undefined;
      // Missing, malformed and conflicting identities cannot use an identity-free fallback.
      if (typeof identity !== 'string' || !identity) return false;
      values.push({ key, identity });
    }
  }
  return values.length > 0 && values.every(({ key, identity }) => {
    if (identity === articleUrl || identity === doiUrl) return true;
    // JSON-LD @id/mainEntityOfPage may identify the article node by a fragment.
    return ['@id', 'mainEntityOfPage'].includes(key) && identity.startsWith(`${articleUrl}#`)
      && identity.length > articleUrl.length + 1;
  });
}
function cleanJson(value) {
  if (Array.isArray(value)) return value.map(cleanJson);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !/cookie|token|password|session|tracking|analytics|interactionStatistic/iu.test(key)).map(([key, item]) => [key, cleanJson(item)]));
  if (typeof value === 'string') {
    if (/^(?:https?:|\/|data:|file:|javascript:)/iu.test(value)) return cleanUrl(value) || '';
    requireThat(!SECRET.test(value), 'Private/local material in JSON-LD; manual review required');
  }
  return value;
}
/** Sanitizes only recipe-selected source blocks plus original ancestors. No prose is authored.
 * Returns UTF-8 LF bytes, pre-sanitize digests, transformation counts, recipe identity,
 * and signatures of exactly this sanitized retained projection. */
export function sanitizeNatureHtml(html, recipe, { sanitizerVersion = SANITIZER_VERSION } = {}) {
  requireThat([SANITIZER_VERSION, LEGACY_SANITIZER_VERSION].includes(sanitizerVersion), 'Unsupported sanitizer version');
  const { dom, document, selected, referenceLists } = selectedDocument(html, recipe);
  const transformations = [];
  const record = (operation, count = 1) => { if (count) transformations.push({ operation, count }); };
  try {
    record('select-complete-source-blocks-with-ancestors', selected.length);
    record('fixed-html-scaffold-sorted-attributes-utf8-lf');
    const removed = Array.from(document.querySelectorAll(DROP_SELECTOR));
    for (const node of removed) node.remove();
    record('remove-executable-or-private-ui', removed.length);
    for (const selector of recipe.removeSelectors) {
      let nodes;
      try { nodes = Array.from(document.querySelectorAll(selector)); } catch { throw new CorpusIntegrityError(`Invalid removal selector: ${selector}`); }
      nodes.forEach((node) => node.remove());
      record(`recipe-remove:${selector}`, nodes.length);
    }
    for (const script of Array.from(document.querySelectorAll('script'))) {
      if (script.getAttribute('type') !== 'application/ld+json') { script.remove(); record('remove-executable-script'); continue; }
      let objects;
      const legacy = sanitizerVersion === LEGACY_SANITIZER_VERSION;
      try { objects = (legacy ? legacyArticleObjects : articleObjects)(JSON.parse(script.textContent)); } catch { throw new CorpusIntegrityError('Invalid selected JSON-LD'); }
      const matches = objects.filter((item) => {
        if (!legacy) return exactArticleIdentity(item, recipe.articleUrl);
        const identity = [item.url, typeof item.mainEntityOfPage === 'string' ? item.mainEntityOfPage : item.mainEntityOfPage?.['@id'], item['@id']].filter(Boolean);
        return identity.some((url) => String(url).split('#')[0] === recipe.articleUrl);
      });
      const article = matches.length === 1 ? matches[0] : legacy && objects.length === 1 && !objects[0].url && !objects[0].mainEntityOfPage && !objects[0]['@id'] ? objects[0] : null;
      requireThat(article, 'Ambiguous or mismatched article JSON-LD; select relevant article script explicitly');
      const cleaned = stableJson(cleanJson(article)).replace(/</gu, '\\u003c');
      if (cleaned !== script.textContent) record('trim-json-ld-to-article-object');
      script.textContent = cleaned;
      script.removeAttribute('src');
    }
    let metadataRemoved = 0;
    for (const meta of Array.from(document.querySelectorAll('meta'))) {
      const name = meta.getAttribute('name') || meta.getAttribute('property') || '';
      if (!/^(?:citation_[a-z_]+|og:(?:title|url|type)|dc\.(?:identifier|title)|date)$/iu.test(name) && !meta.hasAttribute('charset')) {
        meta.remove(); metadataRemoved++;
      }
    }
    record('remove-non-article-metadata', metadataRemoved);
    let attributesRemoved = 0;
    let urlsCleaned = 0;
    const walker = document.createTreeWalker(document.documentElement, 128);
    const comments = [];
    while (walker.nextNode()) comments.push(walker.currentNode);
    comments.forEach((node) => node.remove());
    record('remove-comments', comments.length);
    for (const element of document.querySelectorAll('*')) {
      for (const attr of Array.from(element.attributes)) {
        const originalValue = attr.value;
        if (!ALLOWED_ATTR.test(attr.name) || /^on/iu.test(attr.name)) { element.removeAttribute(attr.name); attributesRemoved++; continue; }
        if (/^(?:href|src|data-src|data-original|data-lazy-src|data-supp-info-image|srcset|data-srcset)$/u.test(attr.name)) {
          let cleaned;
          if (attr.name.endsWith('srcset')) {
            // A binary data URL cannot safely be split on commas; drop the entire candidate list.
            cleaned = /(?:^|[,\s])data:/iu.test(attr.value) ? null : attr.value.split(',').map((candidate) => {
              const match = candidate.match(/^(\s*)(\S+)(.*)$/u);
              if (!match) return candidate;
              const url = cleanUrl(match[2]);
              return url === null ? '' : `${match[1]}${url}${match[3]}`;
            }).filter(Boolean).join(',');
          } else cleaned = cleanUrl(attr.value);
          if (cleaned === null) element.removeAttribute(attr.name);
          else element.setAttribute(attr.name, cleaned);
          if (cleaned !== originalValue) urlsCleaned++;
        } else if (element.tagName === 'META' && /^(?:citation_|og:|dc\.)/iu.test(element.getAttribute('name') || element.getAttribute('property') || '')
          && /^(?:https?:|data:|file:)/iu.test(attr.value)) {
          element.setAttribute(attr.name, cleanUrl(attr.value) || '');
        } else requireThat(!SECRET.test(attr.value), 'Private/local material in attribute; manual review required');
      }
    }
    record('remove-attributes', attributesRemoved);
    record('sanitize-resource-urls', urlsCleaned);
    requireThat(!SECRET.test(document.documentElement.textContent), 'Private/local material in retained text; manual review required');
    for (const block of selected) requireThat(document.documentElement.contains(block.node), `Sanitization removed selected block ${block.id}; revise recipe explicitly`);
    for (const original of referenceLists) {
      const retainedIndices = original.flatMap((node, index) => document.documentElement.contains(node) ? [index] : []);
      requireThat(retainedIndices.every((index, position) => index === position), 'Selected references must retain complete source list prefix; renumbering is forbidden');
    }
    const htmlOutput = `<!doctype html>\n${serializeSubtree(document.documentElement)}\n`;
    const bytes = Buffer.from(htmlOutput, 'utf8');
    // Removing nodes can leave adjacent text nodes that HTML parsing merges.
    // Canonicalize that representational detail without changing any text bytes.
    document.documentElement.normalize();
    const signatures = projectionSignatures(document.documentElement, recipe);
    return { bytes, html: htmlOutput, fixtureSha256: sha256Bytes(bytes), sanitizerVersion,
      serializerVersion: SERIALIZER_VERSION, recipeSha256: sha256Bytes(Buffer.from(stableJson(recipe))),
      retainedBlocks: selected.map(({ node, ...block }) => block), transformations, signatures };
  } finally { dom.window.close(); }
}
/** Called on the sanitized retained root, never the unrelated full-page root.
 * Text node positions are structural; text/TeX and semantic resource attribute values
 * are payload. JSON-LD keys/types are structure; values are payload. */
export function projectionSignatures(root, recipe) {
  const payloadAttr = /^(?:href|src|srcset|data-src|data-srcset|data-original|data-lazy-src|data-supp-info-image|alt|title|content|data-title|data-doi)$/u;
  function tree(node, structure) {
    if (node.nodeType === 3) return structure ? ['text'] : ['text', node.data];
    if (node.nodeType !== 1) return null;
    const attrs = Array.from(node.attributes).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
      .map((attr) => [attr.name, structure && payloadAttr.test(attr.name) ? null : attr.value]);
    if (node.tagName === 'SCRIPT' && node.getAttribute('type') === 'application/ld+json') {
      function shape(value) {
        if (Array.isArray(value)) return value.map(shape);
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, key === '@type' ? item : shape(item)]));
        return typeof value;
      }
      const value = JSON.parse(node.textContent);
      return [node.localName, attrs, structure ? shape(value) : value];
    }
    return [node.localName, attrs, Array.from(node.childNodes).map((child) => tree(child, structure)).filter(Boolean)];
  }
  const recipeSha256 = sha256Bytes(Buffer.from(stableJson(recipe)));
  const digest = (structure) => sha256Bytes(Buffer.from(stableJson({ projectionVersion: PROJECTION_VERSION, recipeSha256, tree: tree(root, structure) })));
  return { projectionVersion: PROJECTION_VERSION, serializerVersion: SERIALIZER_VERSION, recipeSha256,
    structureSha256: digest(true), payloadSha256: digest(false) };
}
/** No real network or global mutation. Resources are exact HTTP exchanges; redirects
 * must be manual and each followed hop separately declared. bodyBytes are copied. */
export function createReplay({ resources, dns }) {
  requireThat(Array.isArray(resources) && dns && typeof dns === 'object', 'Replay requires resources and explicit DNS declarations');
  const declared = new Map();
  for (const resource of resources) {
    requireThat(resource.method === 'GET' && resource.redirect === 'manual' && typeof resource.responseMocked === 'boolean', 'Replay declaration requires GET/manual/responseMocked');
    const url = new URL(resource.url).href;
    requireThat(url === resource.url && !new URL(url).username && !new URL(url).password, 'Replay URL must be exact and credential-free');
    const key = `${resource.method} ${url}`;
    requireThat(!declared.has(key), `Duplicate replay operation: ${key}`);
    requireThat(resource.bodyBytes === undefined || resource.bodyBytes instanceof Uint8Array, 'Replay bodyBytes must be bytes');
    // Response constructor also validates status/headers/body constraints at declaration time.
    const bytes = resource.bodyBytes ? Buffer.from(resource.bodyBytes) : null;
    const headers = new Headers(resource.headers || {});
    for (const name of headers.keys()) requireThat(['content-type', 'location', 'retry-after'].includes(name), `Undeclared replay header: ${name}`);
    new Response(bytes, { status: resource.status, headers });
    declared.set(key, { bytes, status: resource.status, headers: Array.from(headers) });
  }
  const records = new Map(Object.entries(dns).map(([host, values]) => {
    requireThat(Array.isArray(values) && values.length && values.every((record) => [4, 6].includes(record.family) && isIP(record.address) === record.family), 'DNS declaration must contain IP/family records');
    return [host, values.map((record) => ({ address: record.address, family: record.family }))];
  }));
  const requests = [], resolutions = [], unexpected = [];
  function rejectOperation(operation) { unexpected.push(operation); throw new CorpusIntegrityError(`Undeclared replay operation: ${stableJson(operation)}`); }
  return {
    fetchImpl: async (value, options = {}) => {
      const url = value instanceof Request ? value.url : String(value);
      const method = options.method || (value instanceof Request ? value.method : 'GET');
      const operation = { url, method, redirect: options.redirect || 'follow' };
      requests.push(operation);
      const resource = declared.get(`${method} ${url}`);
      if (!resource || operation.redirect !== 'manual' || options.body != null) return rejectOperation({ kind: 'http', ...operation });
      if (options.signal?.aborted) throw options.signal.reason;
      return new Response(resource.bytes === null ? null : Buffer.from(resource.bytes), { status: resource.status, headers: resource.headers });
    },
    resolveHostname: async (hostname, options = {}) => {
      resolutions.push({ hostname, all: options.all, verbatim: options.verbatim });
      if (!records.has(hostname) || options.all !== true || options.verbatim !== true) return rejectOperation({ kind: 'dns', hostname, ...options });
      return records.get(hostname).map((record) => ({ ...record }));
    },
    ledger: () => structuredClone({ requests, resolutions, unexpected }),
    assertClean: ({ expectedRequests, expectedDns } = {}) => {
      requireThat(unexpected.length === 0, `Unexpected HTTP/DNS ledger: ${stableJson(unexpected)}`);
      if (expectedRequests) requireThat(stableJson(requests) === stableJson(expectedRequests), 'Request ledger mismatch');
      if (expectedDns) requireThat(stableJson(resolutions) === stableJson(expectedDns), 'DNS ledger mismatch');
      return true;
    },
  };
}
export async function loadReplayResources(article, corpusRoot) {
  return Promise.all(article.resources.map(async (resource) => ({
    url: resource.url, method: resource.method, redirect: resource.redirect, status: resource.status, responseMocked: resource.responseMocked,
    headers: { ...(resource.contentType ? { 'content-type': resource.contentType } : {}), ...(resource.location ? { location: resource.location } : {}) },
    bodyBytes: [204, 205, 304].includes(resource.status) ? undefined : resource.responseMocked
      ? (Object.hasOwn(resource, 'body') ? Buffer.from(resource.body, 'utf8') : undefined)
      : await readFixtureBytes(corpusRoot, resource.fixturePath, article.articleId, resource.fixtureSha256),
  })));
}

/** Integrity preflight. No provenance is reconstructed from parser output. Source
 * hashes/digests still require B/C's independent source review. */
export async function verifyManifestFixtures(manifest, corpusRoot, options) {
  validateManifest(manifest, options);
  let totalBytes = 0;
  const files = [];
  for (const article of manifest.articles) {
    for (const resource of [article, ...article.resources.filter((r) => !r.responseMocked)]) {
      const bytes = await readFixtureBytes(corpusRoot, resource.fixturePath, article.articleId, resource.fixtureSha256);
      const maxBytes = resource === article ? 256 * 1024 : 64 * 1024;
      requireThat(bytes.length <= maxBytes || resource.sizeException, `Size limit exceeded: ${resource.fixturePath}`);
      const repeated = sanitizeNatureHtml(new TextDecoder('utf-8', { fatal: true }).decode(bytes), resource.recipe, { sanitizerVersion: resource.sanitizerVersion });
      requireThat(bytes.equals(repeated.bytes), `Fixture/recipe is not canonical or idempotent: ${resource.fixturePath}`);
      if (resource === article && article.liveObservations) requireThat(stableJson(article.liveObservations.retainedProjection) === stableJson(repeated.signatures), 'Frozen observation/excerpt projection signatures differ');
      totalBytes += bytes.length;
      files.push({ fixturePath: resource.fixturePath, bytes: bytes.length, fixtureSha256: resource.fixtureSha256 });
    }
  }
  requireThat(totalBytes <= 2 * 1024 * 1024 || manifest.sizeException, 'Corpus exceeds 2 MiB without reviewed exception');
  return { files, totalBytes };
}
