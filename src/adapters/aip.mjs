import { JSDOM } from "jsdom";
import { withDomGlobals } from "../dom-runtime.mjs";
import { htmlToMarkdown } from "../markdown.mjs";
import { normalizeTableContents } from "../normalizers/figures.mjs";
import { normalizeMath } from "../normalizers/math.mjs";
import { semanticMarker } from "../normalizers/markers.mjs";

const text = (node) =>
  String(node?.textContent || "")
    .replace(/\s+/gu, " ")
    .trim();
export function isAplUrl(value) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      u.hostname === "pubs.aip.org" &&
      !u.port &&
      !u.username &&
      !u.password &&
      /^\/aip\/apl\/article\/\d+\/\d+\/\d+\/\d+(?:\/[^/]+)?\/?$/u.test(
        u.pathname,
      )
    );
  } catch {
    return false;
  }
}
export function aplArticleId(value) {
  if (!isAplUrl(value))
    throw new Error(
      "Experimental AIP support requires an Applied Physics Letters article URL.",
    );
  return `aip-apl-${new URL(value).pathname.split("/")[7]}`;
}
function date(value) {
  const match = String(value).match(/^(\w+)\s+(\d{1,2})\s+(\d{4})$/u);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  if (!match || !months.includes(match[1])) return value;
  return `${match[3]}-${String(months.indexOf(match[1]) + 1).padStart(2, "0")}-${match[2].padStart(2, "0")}`;
}
export async function parseAipPage(html, url) {
  aplArticleId(url);
  const dom = new JSDOM(html, { url });
  const { document } = dom.window;
  const root = document.querySelector(".widget-ArticleFulltext .module-widget");
  if (
    !root ||
    !root.querySelector(
      '.article-section-wrapper[data-section-parent-id="0"]:not(:has(.abstract)):not(:has(.ref-list)) p, .block-child-p',
    )
  ) {
    throw new Error(
      "APL main text was not found (access-limited, abstract-only, challenge, or unsupported DOM).",
    );
  }
  const titleNode = document
    .querySelector("h1.article-title-main")
    ?.cloneNode(true);
  titleNode?.querySelectorAll(".article-access").forEach((n) => n.remove());
  const authors = [
    ...document.querySelectorAll("#authorListWithFootnotes .author-full-name"),
  ].map((n) => {
    const copy = n.cloneNode(true);
    copy
      .querySelectorAll("sup,.al-orcid-info-wrap,.author-superscripts")
      .forEach((x) => x.remove());
    return text(copy);
  });
  const authorLabels = [
    ...document.querySelectorAll("#authorListWithFootnotes .author-full-name"),
  ].map((n) => text(n.querySelector(".author-superscripts")).split(/[,\s]+/u));
  const affiliations = [
    ...document.querySelectorAll(".author-affiliation .aff"),
  ].map((n) => {
    const label = text(n.querySelector(".label"));
    const copy = n.cloneNode(true);
    copy.querySelector(".label")?.remove();
    return {
      address: text(copy),
      authors: authors
        .filter((_, i) => authorLabels[i].includes(label))
        .join(", "),
    };
  });
  const doi =
    document
      .querySelector(".citation-doi a")
      ?.getAttribute("href")
      ?.replace("https://doi.org/", "") || "";
  if (!doi.startsWith("10.1063/") || !authors.length || !titleNode)
    throw new Error("APL article identity metadata was not found.");
  const route = new URL(url).pathname.split("/");
  const journalCitation = text(document.querySelector(".ww-citation-primary"));
  if (
    titleNode.id !== "aria" + route[7] ||
    !journalCitation.startsWith(
      "Appl. Phys. Lett. " + route[4] + ", " + route[6] + " ",
    )
  ) {
    throw new Error(
      "APL source identity does not match the requested journal/article URL.",
    );
  }
  const metadata = {
    title: text(titleNode).replace(/\s+Open Access$/u, ""),
    authors,
    doi,
    url,
    date: date(text(document.querySelector(".article-date"))),
    journal: "Applied Physics Letters",
    metadataSource: "AIP Silverchair article header",
    authorInformation: { affiliations, notes: [], correspondence: null },
    publisherNotes: [],
  };
  const history = [...document.querySelectorAll(".history-entry")].map((n) => [
    text(n.querySelector(".wi-state")).replace(":", "").toLowerCase(),
    date(text(n.querySelector(".wi-date"))),
  ]);
  metadata.articleHistory = Object.fromEntries(history);
  metadata.volume = new URL(url).pathname.split("/")[4];
  metadata.issue = new URL(url).pathname.split("/")[5];
  metadata.pages = new URL(url).pathname.split("/")[6];
  const correspondence = document.querySelector(".info-author-correspondence");
  if (correspondence)
    metadata.authorInformation.correspondence = {
      text: text(correspondence),
      email:
        correspondence
          .querySelector('a[href^="mailto:"]')
          ?.getAttribute("href")
          .replace(/^(?:mailto:)+/u, "") || "",
    };
  const warnings = [];
  const semantic = {
    displayMath: [],
    inlineMath: [],
    scientificRuns: [],
    literalText: [],
    citations: [],
    crossReferences: new Map(),
  };
  // Remove duplicate modal payloads before counting or converting scientific nodes.
  root
    .querySelectorAll(
      ".fig-modal,.table-modal,script,style,input,.article-metadata-panel,.article-metadata-standalone-panel,.permissionstatement-section-wrapper,.figshare-wrapper",
    )
    .forEach((n) => n.remove());
  const references = [
    ...root.querySelectorAll(".ref-list > [data-content-id]"),
  ].map((n) => {
    const number = Number(
      text(n.querySelector(".ref-content > .label")).replace(".", ""),
    );
    const citation = n.querySelector(".mixed-citation")?.cloneNode(true);
    citation?.querySelectorAll(".citation-links").forEach((x) => x.remove());
    return {
      number,
      anchor: `ref-${number}`,
      citationKey: `ref${number}`,
      text: text(citation),
      doi:
        n
          .querySelector(".pub-id-doi a")
          ?.href.replace("https://doi.org/", "") || "",
    };
  });
  root
    .querySelectorAll(".ref-list")
    .forEach((n) => n.closest(".article-section-wrapper")?.remove());
  root.querySelectorAll(".backreferences-title").forEach((n) => n.remove());
  for (const n of root.querySelectorAll("a.xref-bibr")) {
    const ids = (n.getAttribute("data-modal-source-id") || "").split(/\s+/u);
    const numbers = ids
      .map((id) => Number(id.match(/^c(\d+)$/u)?.[1]))
      .filter(Boolean);
    if (
      !numbers.length ||
      numbers.some((number) => !references.some((r) => r.number === number))
    )
      throw new Error("APL citation has no retained reference target.");
    const marker = semanticMarker("CITATION", semantic.citations.length);
    semantic.citations.push({ marker, numbers });
    n.replaceWith(document.createTextNode(marker));
  }
  let displayFallbackCounter = 0;
  const equationLabels = new Set(
    [...root.querySelectorAll(".formula-wrap > .label.title-label")]
      .map((node) => text(node).match(/^\((\d+)\)$/u)?.[1])
      .filter(Boolean),
  );
  await withDomGlobals(dom, async () => {
    for (const n of [...root.querySelectorAll("math")]) {
      const inline = Boolean(n.closest(".inline-formula"));
      const converted = await htmlToMarkdown(`<p>${n.outerHTML}</p>`, url);
      const tex = converted.trim().replace(/^\$\$\s*|\s*\$\$$/gu, "");
      if (!tex || /<\/?(?:math|mrow|mi)\b/u.test(tex))
        throw new Error("Unsupported APL MathML conversion.");
      const values = inline ? semantic.inlineMath : semantic.displayMath;
      const marker = semanticMarker(
        inline ? "INLINEMATH" : "DISPLAYMATH",
        values.length,
      );
      values.push({ marker, tex });
      const wrapper = inline
        ? n.closest(".inline-formula")
        : n.closest(".formula-wrap");
      const target = wrapper || n;
      if (!inline && wrapper) {
        const id = wrapper.getAttribute("content-id");
        const sourceLabel = text(
          wrapper.querySelector(":scope > .label.title-label"),
        ).match(/^\((\d+)\)$/u)?.[1];
        let equationNumber = sourceLabel;
        if (!equationNumber) {
          do {
            displayFallbackCounter += 1;
          } while (equationLabels.has(String(displayFallbackCounter)));
          equationNumber = String(displayFallbackCounter);
        }
        const anchor = `equation-${equationNumber}`;
        semantic.crossReferences.set(id, { type: "equation", anchor });
        const p = document.createElement("p");
        p.textContent = semanticMarker("EQUATIONANCHOR", anchor);
        wrapper.before(p);
      }
      if (inline) target.replaceWith(document.createTextNode(marker));
      else {
        const block = document.createElement("p");
        block.textContent = marker;
        target.replaceWith(block);
      }
    }
  });
  // Bind typographic scripts to their adjacent base before Markdown conversion.
  for (const n of [...root.querySelectorAll("sub,sup")]) {
    root.normalize();
    const previous = n.previousSibling;
    let base = "",
      prefix = "";
    if (previous?.nodeType === 3) {
      const value = previous.textContent;
      const existing = value.match(
        /(ACADEMICCLIPPERSCIENTIFICRUN\d+X)([\p{L}\p{N}()]*)$/u,
      );
      if (existing) {
        const run = semantic.scientificRuns.find(
          (r) => r.marker === existing[1],
        );
        base = run?.tex || "";
        base += existing[2];
        prefix = value.slice(0, -existing[0].length);
      } else {
        const match = value.match(/[\p{L}\p{N}]+$/u);
        if (match) {
          base = match[0];
          prefix = value.slice(0, -base.length);
        }
      }
      if (base) previous.textContent = prefix;
    } else if (previous?.nodeType === 1 && /^(EM|I)$/u.test(previous.tagName)) {
      base = text(previous);
      previous.remove();
    }
    if (!base) {
      warnings.push(
        "APL script without an adjacent scientific base retained as readable text.",
      );
      n.replaceWith(document.createTextNode(text(n)));
      continue;
    }
    const tex = base + (n.tagName === "SUB" ? "_" : "^") + "{" + text(n) + "}";
    const marker = semanticMarker(
      "SCIENTIFICRUN",
      semantic.scientificRuns.length,
    );
    semantic.scientificRuns.push({ marker, tex });
    n.replaceWith(document.createTextNode(marker));
  }
  const walker = document.createTreeWalker(root, 4);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    n.textContent = n.textContent.replace(/[\[\]]/gu, (value) => {
      const marker = semanticMarker("LITERALTEXT", semantic.literalText.length);
      semantic.literalText.push({ marker, text: value });
      return marker;
    });
  }
  const figures = [];
  for (const n of [...root.querySelectorAll(".fig[data-id]")]) {
    const id = n.getAttribute("data-id");
    if (figures.some((f) => f.id === id)) {
      n.remove();
      continue;
    }
    const anchor = `figure-${figures.length + 1}`;
    const caption = n.querySelector(".fig-caption");
    const image = n.querySelector("img.content-image");
    if (!image) {
      warnings.push(`APL ${id}: no image exposed.`);
      n.replaceWith(document.createTextNode(text(caption)));
      continue;
    }
    const imageUrl = new URL(
      image.getAttribute("src") || image.getAttribute("data-src"),
      url,
    ).href;
    figures.push({
      id,
      identity: id,
      anchor,
      label: `Figure ${figures.length + 1}`,
      alt: `Figure ${figures.length + 1}`,
      caption: text(caption),
      captionHtml: caption?.innerHTML || "",
      imageUrl,
      source: "inline figure",
    });
    semantic.crossReferences.set(id, { type: "figure", anchor });
    const p = document.createElement("p");
    p.textContent = semanticMarker("FIGURE", anchor);
    n.replaceWith(p);
  }
  const tables = [];
  for (const n of [...root.querySelectorAll(".table-wrap")]) {
    const id =
      n.querySelector(".table-wrap-title")?.id || `table-${tables.length + 1}`;
    const anchor = `table-${tables.length + 1}`;
    // Convert exposed cells locally; typed math is restored after cell conversion.
    const tableHtml = n.querySelector("table")?.outerHTML || "";

    tables.push({
      id,
      anchor,
      label:
        text(n.querySelector(".table-wrap-title .label")).replace(/\.$/u, "") ||
        `Table ${tables.length + 1}`,
      caption: text(n.querySelector(".table-wrap-title")),
      tableHtml,
      tableContentStatus: tableHtml ? "captured-html" : "fallback-no-html",
      tableContentWarning: tableHtml ? "" : "APL table cells not exposed.",
      url: `${url}#${id}`,
    });
    semantic.crossReferences.set(id, { type: "table", anchor });
    n.remove();
  }
  for (const n of root.querySelectorAll("a[href]")) {
    if (n.getAttribute("href")?.startsWith("javascript:")) {
      const id =
        n.getAttribute("reveal-id") || n.getAttribute("data-open") || "";
      const target = semantic.crossReferences.get(id);
      if (target) n.setAttribute("href", `#${target.anchor}`);
      else n.replaceWith(document.createTextNode(text(n)));
    } else if (n.getAttribute("href").startsWith("#")) {
      const target = semantic.crossReferences.get(
        n.getAttribute("href").slice(1),
      );
      if (target) n.setAttribute("href", `#${target.anchor}`);
      else n.replaceWith(document.createTextNode(text(n)));
    } else if (!n.getAttribute("href").startsWith("#"))
      n.setAttribute("href", new URL(n.getAttribute("href"), url).href);
  }
  // Caption conversion uses the same typed math restoration as the body.
  for (const figure of figures) {
    for (const { marker, tex } of [
      ...semantic.inlineMath,
      ...semantic.scientificRuns,
    ])
      figure.captionHtml = figure.captionHtml.replaceAll(
        marker,
        `<span class="mathjax-tex">\\(${tex}\\)</span>`,
      );
  }
  await withDomGlobals(dom, async () => {
    await normalizeTableContents(tables, url);
    const tableSemantic = {
      ...semantic,
      inlineMath: semantic.inlineMath.map((item) => ({
        ...item,
        tex: item.tex.replace(/\r?\n/gu, " ").replace(/\|/gu, "\\vert "),
      })),
    };
    for (const table of tables) {
      if (table.markdown)
        table.markdown = normalizeMath(table.markdown, tableSemantic);
      delete table.tableHtml;
    }
  });
  document.body.replaceChildren(root);
  return {
    dom,
    document,
    bodyHtml: root.innerHTML,
    metadata,
    figures,
    tables,
    references,
    semantic,
    cleanedHtml: document.documentElement.outerHTML,
    debug: {
      publisher: "AIP (experimental APL)",
      articleRoot: ".widget-ArticleFulltext .module-widget",
      metadataSource: metadata.metadataSource,
      paragraphs: root.querySelectorAll("p,.block-child-p").length,
      equations: semantic.displayMath.length,
      inlineMath: semantic.inlineMath.length,
      figures: figures.length,
      references: references.length,
      warnings,
    },
  };
}
