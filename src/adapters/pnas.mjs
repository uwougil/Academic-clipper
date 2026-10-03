import { JSDOM } from 'jsdom';
import { semanticMarker } from '../normalizers/markers.mjs';

const text = (node) => (node?.textContent || '').replace(/\s+/gu, ' ').trim();
export function isPnasUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'www.pnas.org' && !url.port
      && !url.username && !url.password && /^\/doi\/(?:full\/)?10\.1073\/pnas\.\d+\/?$/u.test(url.pathname);
  } catch { return false; }
}

// Experimental, observed PNAS Literatum core DOM only. No publisher dispatch.
export function parsePnasPage(html, url) {
  if (!isPnasUrl(url)) throw new Error('Expected a public https://www.pnas.org/doi/10.1073/pnas.<id> article URL.');
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;
  const meta = (name) => doc.querySelector(`meta[name="citation_${name}"]`)?.getAttribute('content')?.trim() || '';
  const doi = new URL(url).pathname.match(/10\.1073\/pnas\.\d+/u)[0];
  const body = doc.querySelector('section#bodymatter[property="articleBody"] > .core-container');
  if (!body || !text(body) || !meta('title') || meta('doi').toLowerCase() !== doi) {
    throw new Error('PNAS full article core DOM and matching citation metadata were not found; preview/challenge pages are unsupported.');
  }
  const dates = {};
  for (const row of doc.querySelectorAll('#tab-information .core-history > div')) {
    const label = text(row.querySelector('.core-label'));
    if (label) dates[label] = text(row).slice(label.length).replace(/^:\s*/u, '');
  }
  const authorInformation = { affiliations: [], notes: [] };
  for (const author of doc.querySelectorAll('#tab-contributors [property="author"]')) {
    const name = [text(author.querySelector('[property="givenName"]')), text(author.querySelector('[property="familyName"]'))].filter(Boolean).join(' ');
    for (const affiliation of author.querySelectorAll('[property="affiliation"] [property="name"]')) {
      authorInformation.affiliations.push({ authors: name, address: text(affiliation) });
    }
  }
  for (const note of doc.querySelectorAll('#tab-contributors .core-authors-notes [role="paragraph"]')) {
    // All exposed correspondence recipients are retained as text, without
    // guessing which email belongs to a single "corresponding author".
    if (/^cor\d+$/u.test(note.id)) authorInformation.correspondence = { text: text(note) };
    else authorInformation.notes.push(text(note));
  }
  const metadata = {
    title: meta('title'), doi, journal: meta('journal_title'), url,
    authors: [...doc.querySelectorAll('meta[name="citation_author"]')].map((e) => e.getAttribute('content')).filter(Boolean),
    date: (meta('online_date') || meta('publication_date')).replaceAll('/', '-'),
    dates: { online: meta('online_date').replaceAll('/', '-'), issue: meta('publication_date').replaceAll('/', '-'), history: dates },
    volume: meta('volume'), issue: meta('issue'), pages: meta('lastpage') && meta('lastpage') !== meta('firstpage') ? `${meta('firstpage')}-${meta('lastpage')}` : meta('firstpage'), authorInformation,
  };
  const references = [...doc.querySelectorAll('#bibliography .biblioentry')].map((entry) => {
    const number = Number(text(entry.querySelector(':scope > .label')));
    const content = entry.querySelector('.citation-content');
    const doiHref = entry.querySelector('.core-xlink-crossref a[href]')?.getAttribute('href') || '';
    return { number, anchor: `ref-${number}`, citationKey: `ref${number}`, text: text(content), doi: doiHref.replace(/^https?:\/\/(?:dx\.)?doi\.org\//iu, '') };
  });
  if (references.some((ref) => !Number.isInteger(ref.number) || ref.number < 1 || !ref.text)
    || new Set(references.map((ref) => ref.number)).size !== references.length) throw new Error('Invalid PNAS bibliography labels/content.');
  const root = doc.createElement('article');
  for (const section of doc.querySelectorAll('#abstracts > .core-container > section')) root.append(section.cloneNode(true));
  root.append(body.cloneNode(true));
  for (const section of doc.querySelectorAll('#backmatter > .core-container > section:not(#bibliography)')) root.append(section.cloneNode(true));
  for (const section of doc.querySelectorAll('#tab-information > .core-article-notes,#tab-information > #change-history,#tab-information > .core-copyright')) root.append(section.cloneNode(true));
  const semantic = { displayMath: [], inlineMath: [], scientificRuns: [], literalText: [], citations: [], crossReferences: new Map() };
  const warnings = [];
  for (const element of root.querySelectorAll('script,style,button,iframe,noscript,.external-links')) element.remove();
  for (const element of root.querySelectorAll('*')) for (const attribute of [...element.attributes]) {
    if (/^on/iu.test(attribute.name) || ['style', 'hidden', 'aria-hidden'].includes(attribute.name)) element.removeAttribute(attribute.name);
  }
  // Keep one semantic MathML tree, rather than both CHTML glyphs and assistive
  // text. Defuddle performs the MathML→TeX conversion; no local math grammar.
  for (const container of [...root.querySelectorAll('mjx-container')]) {
    const math = container.querySelector('mjx-assistive-mml math');
    if (!math) throw new Error('PNAS MathJax lacks assistive MathML; refusing silent equation loss.');
    container.replaceWith(math.cloneNode(true));
  }
  for (const math of root.querySelectorAll('math')) {
    if (/^(?:No alternative text available|)$/iu.test(math.getAttribute('alttext') || '')) math.removeAttribute('alttext');
    if (math.closest('.display-formula')) math.setAttribute('display', 'block');
    for (const fenced of math.querySelectorAll('mfenced')) {
      const open = fenced.getAttribute('open') ?? '(';
      const close = fenced.getAttribute('close') ?? ')';
      if (['(', '[', '{'].includes(open) && open === close) warnings.push(`Source MathML has asymmetric fences in ${math.closest('.display-formula')?.id || 'inline math'}; preserved without guessing an author correction.`);
    }
  }
  const targets = semantic.crossReferences;
  const addTarget = (id, type, label, anchor = id) => {
    const target = { type, label, anchor };
    targets.set(id, target);
    return target;
  };
  const headingSlugs = new Map();
  for (const section of root.querySelectorAll('section[id]')) {
    const heading = section.querySelector(':scope > h2,:scope > h3,:scope > h4,:scope > h5');
    if (!heading) continue;
    const slug = text(heading).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/gu, '-');
    const occurrence = headingSlugs.get(slug) || 0;
    headingSlugs.set(slug, occurrence + 1);
    const target = addTarget(section.id, 'section', text(heading), occurrence ? `${slug}-${occurrence}` : slug);
    const marker = doc.createElement('p');
    marker.textContent = semanticMarker('SECTIONANCHOR', target.anchor);
    heading.before(marker);
  }
  for (const equation of root.querySelectorAll('.display-formula[id]')) {
    const target = addTarget(equation.id, 'equation', text(equation.querySelector('.label')));
    const marker = doc.createElement('p');
    marker.textContent = semanticMarker('EQUATIONANCHOR', target.anchor);
    equation.before(marker);
    equation.querySelector('.label')?.remove();
  }
  const figures = [];
  const tables = [];
  for (const figure of [...root.querySelectorAll('figure[id]')]) {
    const table = figure.querySelector('table');
    const isTable = figure.classList.contains('table');
    const label = isTable ? `Table ${Number(figure.id.replace(/\D/gu, ''))}` : `Fig. ${Number(figure.id.replace(/\D/gu, ''))}`;
    addTarget(figure.id, isTable ? 'table' : 'figure', label);
    if (isTable) {
      tables.push({ anchor: figure.id, label, caption: text(figure.querySelector('figcaption')), tableHtml: table?.outerHTML || '', url: `${url}#${figure.id}`, tableContentStatus: table ? 'captured-html' : 'fallback-not-exposed' });
      if (!table) warnings.push(`${label}: table cells not exposed; no dynamic request attempted.`);
      figure.remove();
    } else {
      const img = figure.querySelector('img');
      if (!img?.getAttribute('src')) throw new Error(`PNAS ${label} image source was not exposed.`);
      const imageUrl = new URL(img.getAttribute('src'), url);
      if (!['http:', 'https:'].includes(imageUrl.protocol) || imageUrl.username || imageUrl.password) throw new Error('Unsafe PNAS image URL.');
      figures.push({ anchor: figure.id, label, caption: text(figure.querySelector('figcaption')), captionHtml: figure.querySelector('figcaption')?.innerHTML || '', imageUrl: imageUrl.href, alt: img.getAttribute('alt') || label, source: 'inline figure' });
      const marker = doc.createElement('p');
      marker.textContent = semanticMarker('FIGURE', figure.id);
      figure.replaceWith(marker);
    }
  }
  // Caption/table copies also need citation and internal link semantics.
  const fragments = figures.map((f) => ({ item: f, key: 'captionHtml' })).concat(tables.filter((t) => t.tableHtml).map((t) => ({ item: t, key: 'tableHtml' })));
  const fragmentRoots = fragments.map(({ item, key }) => { const wrapper = doc.createElement('div'); wrapper.innerHTML = item[key]; return wrapper; });
  const referenceNumbers = new Set(references.map((ref) => ref.number));
  for (const scope of [root, ...fragmentRoots]) {
    for (const citation of [...scope.querySelectorAll('a[role="doc-biblioref"]')]) {
      if (!scope.contains(citation)) continue;
      let numbers = (citation.getAttribute('data-xml-rid') || '').split(/\s+/u).map((id) => Number(id.replace(/^r/u, '')));
      // Literatum represents ranges with only endpoint anchors.
      const separator = citation.nextSibling;
      const end = separator?.nextSibling;
      if (separator?.nodeType === 3 && /^\s*[–−-]\s*$/u.test(separator.textContent) && end?.matches?.('a[role="doc-biblioref"]')) {
        const last = Number((end.getAttribute('data-xml-rid') || '').replace(/^r/u, ''));
        if (numbers.length === 1 && last >= numbers[0] && last - numbers[0] < 1000) {
          numbers = Array.from({ length: last - numbers[0] + 1 }, (_, i) => numbers[0] + i);
          separator.remove(); end.remove();
        }
      }
      if (!numbers.length || numbers.some((n) => !referenceNumbers.has(n))) throw new Error('PNAS citation refers to an absent bibliography entry.');
      const marker = semanticMarker('CITATION', semantic.citations.length);
      semantic.citations.push({ marker, numbers });
      citation.replaceWith(doc.createTextNode(marker));
    }
    for (const anchor of scope.querySelectorAll('a[href]')) {
      const href = anchor.getAttribute('href');
      if (href.startsWith('#')) {
        const target = targets.get(href.slice(1));
        if (target) anchor.setAttribute('href', `#${target.anchor}`);
        else {
          // Preserve links to omitted/not-yet-loaded public article targets.
          anchor.setAttribute('href', new URL(href, url).href);
        }
      } else {
        const absolute = new URL(href, url);
        if (['https:', 'http:', 'mailto:'].includes(absolute.protocol)) anchor.setAttribute('href', absolute.href);
        else anchor.replaceWith(doc.createTextNode(text(anchor)));
      }
    }
    for (const paragraph of [...scope.querySelectorAll('div[role="paragraph"]')]) {
      const replacement = doc.createElement('p');
      replacement.innerHTML = paragraph.innerHTML;
      paragraph.replaceWith(replacement);
    }
    // PNAS symbolic prose-note superscripts are not mathematical powers.
    for (const superscript of [...scope.querySelectorAll('sup')]) {
      if (superscript.querySelector('a[role="doc-noteref"]') || superscript.closest('a[role="doc-noteref"]')) superscript.replaceWith(...superscript.childNodes);
    }
    const walker = doc.createTreeWalker(scope, dom.window.NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.parentElement?.closest('math') && /[$\[\]]/u.test(node.textContent)) {
        node.textContent = node.textContent.replace(/[$\[\]]/gu, (character) => {
          const marker = semanticMarker('LITERAL', semantic.literalText.length);
          semantic.literalText.push({ marker, text: character === '$' ? '\\$' : character });
          return marker;
        });
      }
    }
  }
  fragments.forEach(({ item, key }, index) => { item[key] = fragmentRoots[index].innerHTML; });
  // Literatum labels live outside the actual figure, in a viewer UI wrapper.
  for (const label of root.querySelectorAll('.label')) if (/^(?:Fig\.|Table)\s*\d+\.?$/u.test(text(label))) label.remove();
  doc.body.replaceChildren(root);
  return { dom, document: doc, cleanedHtml: root.outerHTML, metadata, figures, tables, references, semantic,
    debug: { articleRoot: '#bodymatter > .core-container', platform: 'PNAS Literatum core DOM', warnings, mathSource: 'assistive MathML', acquisition: 'supplied HTML/loaded DOM; no network requests' } };
}
