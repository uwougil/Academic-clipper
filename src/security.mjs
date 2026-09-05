import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function parseIpv4(value) {
  const hostname = String(value).replace(/\.$/u, '');
  if (isIP(hostname) !== 4) return null;
  const octets = hostname.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return null;
  return octets;
}

function ipv4Number(octets) {
  return (((octets[0] * 256 + octets[1]) * 256 + octets[2]) * 256) + octets[3];
}

function inIpv4Range(octets, start, end) {
  const value = ipv4Number(octets);
  return value >= start && value <= end;
}

function privateIpv4(value) {
  const octets = parseIpv4(value);
  if (!octets) return false;
  const [first, second] = octets;
  return first === 0
    || first === 10
    || first === 127
    || (first === 100 && second >= 64 && second <= 127)
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 0 && octets[2] === 0)
    || (first === 192 && second === 168)
    || (first === 198 && (second === 18 || second === 19))
    || (first === 198 && second === 51 && octets[2] === 100)
    || (first === 203 && second === 0 && octets[2] === 113)
    || first >= 224
    || inIpv4Range(octets, 0xc0000200, 0xc00002ff);
}

function parseIpv6(value) {
  let input = String(value).toLowerCase().replace(/^\[|\]$/gu, '');
  if (isIP(input) !== 6) return null;

  if (input.includes('.')) {
    const lastColon = input.lastIndexOf(':');
    const octets = parseIpv4(input.slice(lastColon + 1));
    if (!octets) return null;
    const number = ipv4Number(octets);
    input = `${input.slice(0, lastColon + 1)}${(number >>> 16).toString(16)}:${(number & 0xffff).toString(16)}`;
  }

  const halves = input.split('::');
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(':').map((part) => Number.parseInt(part, 16)) : [];
  const right = halves.length === 2 && halves[1]
    ? halves[1].split(':').map((part) => Number.parseInt(part, 16))
    : [];
  if ([...left, ...right].some((part) => !Number.isInteger(part) || part < 0 || part > 0xffff)) return null;
  if (halves.length === 1 && left.length !== 8) return null;
  if (halves.length === 2 && left.length + right.length >= 8) return null;
  const missing = 8 - left.length - right.length;
  return [...left, ...Array(missing).fill(0), ...right];
}

function mappedIpv4FromIpv6(value) {
  const hextets = parseIpv6(value);
  if (!hextets || !hextets.slice(0, 5).every((part) => part === 0) || hextets[5] !== 0xffff) return null;
  const number = hextets[6] * 0x10000 + hextets[7];
  return `${number >>> 24}.${(number >>> 16) & 0xff}.${(number >>> 8) & 0xff}.${number & 0xff}`;
}

function privateIpv6(value) {
  const hextets = parseIpv6(value);
  if (!hextets) return false;
  const normalized = hextets.map((part) => part.toString(16).padStart(4, '0')).join(':');
  if (normalized === '0000:0000:0000:0000:0000:0000:0000:0000'
    || normalized === '0000:0000:0000:0000:0000:0000:0000:0001') return true;
  const mapped = mappedIpv4FromIpv6(value);
  if (mapped) return privateIpv4(mapped);
  const first = hextets[0];
  return (first & 0xfe00) === 0xfc00 // unique-local fc00::/7
    || (first & 0xffc0) === 0xfe80 // link-local fe80::/10
    || (first & 0xff00) === 0xff00 // multicast
    || (first & 0xffc0) === 0xfec0; // deprecated site-local
}

export function isPrivateIpAddress(value) {
  if (isIP(String(value)) === 4) return privateIpv4(value);
  if (isIP(String(value)) === 6) return privateIpv6(value);
  return false;
}

function blockedHostname(hostname) {
  const host = String(hostname).toLowerCase().replace(/^\[|\]$/gu, '').replace(/\.$/u, '');
  return host === 'localhost'
    || host.endsWith('.localhost')
    || host.endsWith('.local')
    || host === 'broadcasthost'
    || isPrivateIpAddress(host);
}

export function safeExternalUrl(value) {
  let parsed;
  try {
    parsed = new URL(String(value));
  } catch {
    throw new Error('External resource URL is not a valid URL.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`External resource URL scheme is not allowed: ${parsed.protocol}`);
  }
  if (!parsed.hostname || blockedHostname(parsed.hostname)) {
    throw new Error('External resource URL points to a local or private address.');
  }
  return parsed.href;
}

export function isSafeExternalUrl(value) {
  try {
    safeExternalUrl(value);
    return true;
  } catch {
    return false;
  }
}

function hostnameForDns(url) {
  return url.hostname.replace(/^\[|\]$/gu, '').replace(/\.$/u, '');
}

async function validateResolvedHostname(url, resolveHostname) {
  const hostname = hostnameForDns(url);
  if (isIP(hostname)) return;
  let records;
  try {
    records = await resolveHostname(hostname, { all: true, verbatim: true });
  } catch (error) {
    throw new Error(`External resource hostname could not be resolved: ${hostname} (${error instanceof Error ? error.message : String(error)})`);
  }
  const addresses = Array.isArray(records)
    ? records.map((record) => typeof record === 'string' ? record : record?.address).filter(Boolean)
    : [];
  if (!addresses.length) throw new Error(`External resource hostname has no DNS addresses: ${hostname}`);
  if (addresses.some((address) => !isIP(String(address)) || isPrivateIpAddress(address))) {
    throw new Error(`External resource hostname resolves to a local or private address: ${hostname}`);
  }
}

export async function safeFetchExternal(value, options = {}) {
  const {
    fetchImpl = globalThis.fetch,
    resolveHostname = lookup,
    validateUrl,
    maxRedirects = 5,
    signal,
    timeoutMs,
    ...fetchOptions
  } = options;
  let currentUrl = safeExternalUrl(value);
  let redirects = 0;
  const requestSignal = signal || (timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined);

  while (true) {
    currentUrl = safeExternalUrl(currentUrl);
    await validateUrl?.(currentUrl);
    await validateResolvedHostname(new URL(currentUrl), resolveHostname);
    const response = await fetchImpl(currentUrl, {
      ...fetchOptions,
      redirect: 'manual',
      ...(requestSignal ? { signal: requestSignal } : {}),
    });
    if (!REDIRECT_STATUSES.has(response.status)) return { response, url: currentUrl, redirects };
    if (redirects >= maxRedirects) throw new Error(`External resource redirect limit exceeded (${maxRedirects}).`);
    const location = response.headers.get('location');
    if (!location) throw new Error(`External resource redirect from ${currentUrl} has no Location header.`);
    try {
      currentUrl = new URL(location, currentUrl).href;
    } catch {
      throw new Error(`External resource redirect from ${currentUrl} has an invalid Location header.`);
    }
    redirects += 1;
  }
}
