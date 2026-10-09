// Test-only source role: the complete literal base and grouped original SUB95.
// Never erase braces or whitespace: _{9}5 and _95 attach only the first digit.
const metricAtom = /^(?:r\.m\.s\.d\.|\\(?:mathrm|text|mathit)\{r\.m\.s\.d\.\})_\{95\}$/u;
export const isQualifiedMetricTex = tex => typeof tex === 'string' && metricAtom.test(tex);

export function attachedQualifiers(value) {
  const roles = [];
  for (const match of value.matchAll(/(?<!\$)\$([^$\n]+)\$(?!\$)/gu)) {
    if (isQualifiedMetricTex(match[1])) roles.push({ literalBase: 'r.m.s.d.', script: 'subscript', value: '95' });
  }
  for (const match of value.matchAll(/r\.m\.s\.d\.₉₅/gu)) roles.push({ literalBase: 'r.m.s.d.', script: 'subscript', value: '95' });
  return roles;
}

export function normalizeQualifierRun(tex) {
  if (isQualifiedMetricTex(tex)) return 'r.m.s.d._{95}';
  // Separate inherited styled roles; all other runs keep their exact TeX.
  if (/^(?:N|\\(?:mathrm|text|mathit)\{N\})_\{(?:res|\\mathrm\{res\})\}$/u.test(tex)) return 'N_res';
  if (tex === '_{95}') return '_95';
  return tex;
}
