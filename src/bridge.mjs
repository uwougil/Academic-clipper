#!/usr/bin/env node
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clipNature, writePaper } from './clip.mjs';

const DEFAULT_PORT = 34123;
const MAX_BODY_BYTES = 25 * 1024 * 1024;

function jsonResponse(response, status, payload) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
  });
  response.end(JSON.stringify(payload));
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

async function loadConfig(configPath) {
  let config = {};
  try {
    config = JSON.parse(await readFile(configPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const configuredLibrary = config.libraryPath || process.env.ACADEMIC_CLIPPER_LIBRARY || './papers';
  return {
    ...config,
    port: Number(config.port || process.env.ACADEMIC_CLIPPER_PORT || DEFAULT_PORT),
    libraryPath: path.resolve(path.dirname(configPath), configuredLibrary),
    downloadFigures: Boolean(config.downloadFigures),
    saveDebug: Boolean(config.saveDebug),
  };
}

export function createBridgeServer(config) {
  return http.createServer(async (request, response) => {
    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'content-type',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
      });
      response.end();
      return;
    }

    if (request.method === 'GET' && request.url === '/health') {
      jsonResponse(response, 200, { ok: true, service: 'academic-clipper-bridge', port: config.port });
      return;
    }

    if (request.method !== 'POST' || !['/paper', '/preview'].includes(request.url)) {
      jsonResponse(response, 404, { ok: false, error: 'Not found.' });
      return;
    }

    try {
      const payload = await readJson(request);
      if (typeof payload.html !== 'string' || typeof payload.url !== 'string') {
        throw new Error('The request must include html and url.');
      }
      const result = await clipNature({ html: payload.html, url: payload.url });
      if (request.url === '/preview') {
        jsonResponse(response, 200, { ok: true, articleId: result.articleId, markdown: result.markdown, debug: result.debug });
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
      });
    } catch (error) {
      jsonResponse(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const configArgIndex = process.argv.indexOf('--config');
  const configPath = configArgIndex >= 0 ? path.resolve(process.argv[configArgIndex + 1]) : path.resolve('config.json');
  const config = await loadConfig(configPath);
  const server = createBridgeServer(config);
  server.listen(config.port, '127.0.0.1', () => {
    console.log(`academic-clipper-bridge listening on http://127.0.0.1:${config.port}`);
    console.log(`libraryPath: ${config.libraryPath}`);
  });
}
