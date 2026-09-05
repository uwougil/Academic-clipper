const LOCALHOST_NAMES = new Set(['localhost', '127.0.0.1']);

export function normalizeBridgeEndpoint(value) {
  let parsed;
  try {
    parsed = new URL(String(value).trim());
  } catch {
    throw new Error('Invalid bridge endpoint. Use http://localhost:<port> or http://127.0.0.1:<port>.');
  }
  if (parsed.protocol !== 'http:' || !LOCALHOST_NAMES.has(parsed.hostname.toLowerCase())
    || parsed.username || parsed.password || parsed.search || parsed.hash || !['', '/'].includes(parsed.pathname)) {
    throw new Error('Invalid bridge endpoint. Use http://localhost:<port> or http://127.0.0.1:<port>.');
  }
  if (parsed.port && (!/^\d+$/u.test(parsed.port) || Number(parsed.port) < 1 || Number(parsed.port) > 65535)) {
    throw new Error('Invalid bridge endpoint port. Use a port from 1 to 65535.');
  }
  return parsed.origin;
}

export function isValidBridgeEndpoint(value) {
  try {
    normalizeBridgeEndpoint(value);
    return true;
  } catch {
    return false;
  }
}
