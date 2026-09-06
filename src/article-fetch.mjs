import { articleIdFromUrl, isNatureUrl } from './adapters/nature.mjs';
import { safeFetchExternal } from './security.mjs';
import { ACADEMIC_CLIPPER_USER_AGENT } from './version.mjs';

export const ARTICLE_FETCH_TIMEOUT_MS = 30_000;
export const MAX_ARTICLE_BYTES = 25 * 1024 * 1024;

function sizeError(maxBytes) {
  return new Error(`Article HTML exceeds the ${maxBytes}-byte limit.`);
}

async function boundedResponseText(response, maxBytes) {
  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) throw sizeError(maxBytes);

  if (!response.body?.getReader) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > maxBytes) throw sizeError(maxBytes);
    return new TextDecoder().decode(bytes);
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw sizeError(maxBytes);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function fetchNatureArticle(url, {
  fetchImpl = globalThis.fetch,
  resolveHostname,
  timeoutMs = ARTICLE_FETCH_TIMEOUT_MS,
  maxBytes = MAX_ARTICLE_BYTES,
} = {}) {
  if (!isNatureUrl(url)) throw new Error('Only https://www.nature.com/articles/<id> URLs are supported.');
  const articleId = articleIdFromUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error('Article fetch timed out.')), timeoutMs);
  const { signal } = controller;
  try {
    const { response, url: finalUrl } = await safeFetchExternal(url, {
      fetchImpl,
      ...(resolveHostname ? { resolveHostname } : {}),
      signal,
      headers: { 'user-agent': ACADEMIC_CLIPPER_USER_AGENT },
      validateUrl: (candidate) => {
        if (!isNatureUrl(candidate) || articleIdFromUrl(candidate) !== articleId) {
          throw new Error('Nature article redirect escaped the requested article scope.');
        }
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }
    return { html: await boundedResponseText(response, maxBytes), url: finalUrl };
  } catch (error) {
    if (signal.aborted || error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      throw new Error(`Unable to fetch ${url}: timed out after ${timeoutMs} ms.`);
    }
    throw new Error(`Unable to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    clearTimeout(timeout);
  }
}
