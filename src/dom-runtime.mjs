/**
 * Defuddle's full Markdown converter expects browser DOM globals in Node.
 * Keep this boundary in one place so the parser and bridge remain testable.
 */
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
