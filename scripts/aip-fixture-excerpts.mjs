import { JSDOM } from "jsdom";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const hash = (b) => createHash("sha256").update(b).digest("hex");
const sourceDir = process.argv[2];
if (!sourceDir)
  throw new Error(
    "Usage: node scripts/aip-fixture-excerpts.mjs <directory containing aip-<id>.html public captures>",
  );
const cases = [
  [
    "3297874",
    "124/24/243101/3297874/Tailoring-MoS2-domains-size-doping-and-light",
    [
      "89169191-content",
      "89169193-content",
      "89169197-content",
      "89169205-content",
      "89169210-content",
    ],
  ],
  [
    "3404114",
    "129/10/101106/3404114/Differentiable-computation-based-single-shot",
    [
      "94248671-content",
      "94248676-content",
      "94248677-content",
      "94248680-content",
      "94248686-content",
      "94248688-content",
      "94248701-content",
    ],
  ],
  [
    "3371786",
    "127/19/192101/3371786/Regulation-of-optical-properties-in-quasi-2D",
    [],
  ],
];
let records = [];
await mkdir("test/fixtures/aip", { recursive: true });
for (const [id, suffix, ids] of cases) {
  const source = await readFile(path.join(sourceDir, "aip-" + id + ".html"));
  const d = new JSDOM(source.toString()).window.document;
  const root = d.querySelector(".minimal-article-container");
  const retainedBlockDigests = ids.map((id) => ({
    id,
    sha256: hash(d.getElementById(id).outerHTML),
  }));
  root.querySelectorAll(".article-section-wrapper").forEach((n) => {
    if (
      !ids.includes(n.id) &&
      !n.querySelector(".ref-list") &&
      !(id === "3371786" && n.querySelector(".abstract"))
    )
      n.remove();
  });
  root.querySelectorAll("h2,h3").forEach((n) => {
    if (n.textContent.trim() !== "SUPPLEMENTARY MATERIAL") n.remove();
  });
  root
    .querySelectorAll(
      "script,style,input,.citation-links,.al-orcid-info-wrap,.orchid-icon,.stats-crossmark-updates,.permissionstatement-section-wrapper,.figshare-wrapper,.article-metadata-panel,.article-metadata-standalone-panel",
    )
    .forEach((n) => n.remove());
  for (const n of root.querySelectorAll("*")) {
    for (const a of [...n.attributes]) {
      if (/^on/iu.test(a.name)) n.removeAttribute(a.name);
      if (/Signature=|Key-Pair-Id=/u.test(a.value)) {
        if (a.name === "href" && a.value.includes("DownloadImage"))
          n.removeAttribute(a.name);
        else {
          try {
            const u = new URL(a.value);
            u.search = "";
            n.setAttribute(a.name, u.href);
          } catch {
            n.removeAttribute(a.name);
          }
        }
      }
    }
  }
  const html =
    '<!doctype html>\n<html><head><meta charset="utf-8"></head><body>' +
    root.outerHTML +
    "</body></html>\n";
  const file = id + ".excerpt.html";
  await writeFile("test/fixtures/aip/" + file, html.replace(/\r\n/gu, '\n'));
  records.push({
    id,
    url: "https://pubs.aip.org/aip/apl/article/" + suffix,
    sourceUrl: "https://aipp.silverchair-cdn.com/article-minimal/" + id,
    observedAt: new Date().toISOString(),
    sourceSha256: hash(source),
    fixtureSha256: hash(html.replace(/\r\n/gu, "\n")),
    file,
    retainedBlocks: ids,
    retainedBlockDigests,
    serializer: "jsdom outerHTML UTF-8 v1",
    sanitizerVersion: "apl-excerpts-v1",
    transformations: [
      "Select original header, semantic blocks and all references; retain modal duplicates to test removal",
      "Remove executable scripts, UI/account scaffolding, citation service links and ORCID images",
      "Remove signed CDN query parameters; resource download is not verified",
    ],
    captureMode:
      "public HTTP response via configured proxy; guarded URL/DNS/redirect/type/size checks",
    fullText: id !== "3371786",
  });
}
await writeFile(
  "test/fixtures/aip/provenance.json",
  JSON.stringify(records, null, 2) + "\n",
);
