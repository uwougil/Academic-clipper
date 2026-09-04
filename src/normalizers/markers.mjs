export function semanticMarker(kind, value) {
  return `ACADEMICCLIPPER${kind}${String(value).replace(/[^a-z0-9-]/gi, '')}X`;
}
