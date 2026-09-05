/**
 * Defuddle's full Markdown converter expects browser DOM globals in Node.
 * Keep this boundary in one place so the parser and bridge remain testable.
 */
const DOM_GLOBAL_KEYS = [
  'window', 'document', 'DOMParser', 'XMLSerializer', 'Node', 'NodeFilter',
  'HTMLElement', 'Element', 'SVGElement', 'Document',
];

let domQueue = Promise.resolve();

export function installDomGlobals(dom) {
  const { window } = dom;
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.DOMParser = window.DOMParser;
  globalThis.XMLSerializer = window.XMLSerializer;
  globalThis.Node = window.Node;
  globalThis.NodeFilter = window.NodeFilter;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Element = window.Element;
  globalThis.SVGElement = window.SVGElement;
  globalThis.Document = window.Document;
}

export async function withDomGlobals(dom, task) {
  const previous = domQueue;
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  domQueue = current;
  await previous;

  const snapshot = DOM_GLOBAL_KEYS.map((key) => ({
    key,
    present: Object.prototype.hasOwnProperty.call(globalThis, key),
    value: globalThis[key],
  }));
  try {
    installDomGlobals(dom);
    return await task();
  } finally {
    for (const { key, present, value } of snapshot) {
      if (present) globalThis[key] = value;
      else delete globalThis[key];
    }
    release();
  }
}
