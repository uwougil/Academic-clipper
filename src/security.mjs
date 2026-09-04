import { isIP } from 'node:net';

function privateIpv4(hostname) {
  if (isIP(hostname) !== 4) return false;
  const octets = hostname.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return true;
  const [first, second] = octets;
  return first === 0
    || first === 10
    || first === 127
    || (first === 100 && second >= 64 && second <= 127)
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 168)
    || (first === 198 && (second === 18 || second === 19))
    || first >= 224;
}

function privateIpv6(hostname) {
  if (isIP(hostname) !== 6) return false;
  const normalized = hostname.toLowerCase();
  if (normalized === '::' || normalized === '::1') return true;
  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.slice('::ffff:'.length);
    if (privateIpv4(mapped)) return true;
  }
  const firstHextet = Number.parseInt(normalized.split(':')[0] || '0', 16);
  return (firstHextet >= 0xfc00 && firstHextet <= 0xfdff)
    || (firstHextet >= 0xfe80 && firstHextet <= 0xfebf);
}

function blockedHostname(hostname) {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return host === 'localhost'
    || host.endsWith('.localhost')
    || host.endsWith('.local')
    || host === 'broadcasthost'
    || privateIpv4(host)
    || privateIpv6(host);
}

export function safeExternalUrl(value) {
  let parsed;
  try {
    parsed = new URL(String(value));
  } catch {
    throw new Error('Figure URL is not a valid URL.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`Figure URL scheme is not allowed: ${parsed.protocol}`);
  }
  const hostname = parsed.hostname.replace(/^\[|\]$/g, '');
  if (!hostname || blockedHostname(hostname)) throw new Error('Figure URL points to a local or private address.');
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
