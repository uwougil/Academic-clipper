#!/usr/bin/env node
import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clipNature, writePaper } from './clip.mjs';
import { ACADEMIC_CLIPPER_VERSION } from './version.mjs';

const DEFAULT_PORT = 34123;
const MAX_BODY_BYTES = 25 * 1024 * 1024;

export function resolveBridgePort(value = DEFAULT_PORT) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('Invalid bridge port: expected an integer from 1 to 65535.');
  }
  return port;
}

function allowedOrigin(origin, config) {
  if (!origin) return true;
  if (Array.isArray(config.allowedOrigins) && config.allowedOrigins.length > 0) return config.allowedOrigins.includes(origin);
  // Chrome extension origins are not web pages. A configured allow-list can
  // narrow this further to the unpacked extension's concrete origin.
  return /^chrome-extension:\/\/[a-p]{32}$/i.test(origin);
}

function responseHeaders(origin, config) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-headers': 'content-type, authorization',
  };
  if (origin && allowedOrigin(origin, config)) headers['access-control-allow-origin'] = origin;
  return headers;
}

function jsonResponse(response, status, payload, origin = '', config = {}) {
  response.writeHead(status, responseHeaders(origin, config));
  response.end(JSON.stringify(payload));
}

function authorized(request, config) {
  if (!config.bridgeToken) return true;
  const received = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const expected = String(config.bridgeToken);
  const receivedBytes = Buffer.from(received);
  const expectedBytes = Buffer.from(expected);
  return receivedBytes.length === expectedBytes.length
    && timingSafeEqual(receivedBytes, expectedBytes);
}

async function readJson(request) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_BODY_BYTES) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function loadConfig(configPath) {
  let config = {};
  try {
    config = JSON.parse(await readFile(configPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const configuredLibrary = config.libraryPath || process.env.ACADEMIC_CLIPPER_LIBRARY || './papers';
  return {
    ...config,
    port: resolveBridgePort(config.port ?? process.env.ACADEMIC_CLIPPER_PORT ?? DEFAULT_PORT),
    libraryPath: path.resolve(path.dirname(configPath), configuredLibrary),
    downloadFigures: config.downloadFigures === undefined ? true : Boolean(config.downloadFigures),
    saveDebug: Boolean(config.saveDebug),
    citationStyle: ['markdown', 'links', 'quarto'].includes(config.citationStyle) ? config.citationStyle : 'markdown',
    allowedOrigins: Array.isArray(config.allowedOrigins) ? config.allowedOrigins.map(String) : [],
    bridgeToken: String(config.bridgeToken || process.env.ACADEMIC_CLIPPER_BRIDGE_TOKEN || randomBytes(24).toString('hex')),
  };
}

export function createBridgeServer(config) {
  return http.createServer(async (request, response) => {
    const origin = String(request.headers.origin || '');
    if (!allowedOrigin(origin, config)) {
      jsonResponse(response, 403, { ok: false, error: 'Origin is not allowed.' });
      return;
    }

    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        ...responseHeaders(origin, config),
        'access-control-allow-methods': 'GET,POST,OPTIONS',
      });
      response.end();
      return;
    }

    if (request.method === 'GET' && request.url === '/health') {
      jsonResponse(response, 200, { ok: true, service: 'academic-clipper-bridge', version: ACADEMIC_CLIPPER_VERSION, port: config.port }, origin, config);
      return;
    }

    if (request.method !== 'POST' || !['/paper', '/preview'].includes(request.url)) {
      jsonResponse(response, 404, { ok: false, error: 'Not found.' }, origin, config);
      return;
    }

    if (!authorized(request, config)) {
      response.writeHead(401, {
        ...responseHeaders(origin, config),
        'www-authenticate': 'Bearer',
      });
      response.end(JSON.stringify({ ok: false, error: 'Bridge token is missing or invalid.' }));
      return;
    }

    try {
      const payload = await readJson(request);
      if (typeof payload.html !== 'string' || typeof payload.url !== 'string') {
        throw new Error('The request must include html and url.');
      }
      const result = await clipNature({
        html: payload.html,
        url: payload.url,
        citationStyle: payload.citationStyle ?? config.citationStyle,
      });
      if (request.url === '/preview') {
        jsonResponse(response, 200, { ok: true, articleId: result.articleId, markdown: result.markdown, debug: result.debug }, origin, config);
        return;
      }

      const saved = await writePaper(result, {
        libraryPath: config.libraryPath,
        downloadFigures: payload.downloadFigures ?? config.downloadFigures,
        saveDebug: payload.saveDebug ?? config.saveDebug,
      });
      jsonResponse(response, 200, {
        ok: true,
        articleId: result.articleId,
        relativePath: saved.relativePath,
        debug: saved.debug,
        markdown: saved.markdown,
      }, origin, config);
    } catch (error) {
      jsonResponse(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) }, origin, config);
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const configArgIndex = process.argv.indexOf('--config');
    const configValue = configArgIndex >= 0 ? process.argv[configArgIndex + 1] : '';
    if (configArgIndex >= 0 && (!configValue || configValue.startsWith('--'))) {
      throw new Error('Missing value for --config.');
    }
    const configPath = configArgIndex >= 0 ? path.resolve(configValue) : path.resolve('config.json');
    const config = await loadConfig(configPath);
    const server = createBridgeServer(config);
    server.listen(config.port, '127.0.0.1', () => {
      console.log(`academic-clipper-bridge listening on http://127.0.0.1:${config.port}`);
      console.log(`libraryPath: ${config.libraryPath}`);
      console.log(`bridgeToken: ${config.bridgeToken}`);
    });
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
