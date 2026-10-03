import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { clipAip, clipArticle } from "../src/clip.mjs";
import { isAplUrl, aplArticleId } from "../src/adapters/aip.mjs";
const base = new URL("./fixtures/aip/", import.meta.url);
const cases = JSON.parse(await readFile(new URL("provenance.json", base)));
test("APL URL scope excludes other AIP journals, credentials and abstract routes", () => {
  assert.equal(aplArticleId(cases[0].url), "aip-apl-3297874");
  for (const url of [
    "https://pubs.aip.org/aip/apm/article/1/1/1/123/x",
    cases[0].url.replace("/article/", "/article-abstract/"),
    cases[0].url.replace("https://", "https://user@"),
    "http://pubs.aip.org/aip/apl/article/1/1/1/123",
  ])
    assert.equal(isAplUrl(url), false);
});
for (const c of cases) {
  test(`source integrity ${c.id}`, async () => {
    const bytes = await readFile(new URL(c.file, base));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      c.fixtureSha256,
    );
    assert.doesNotMatch(
      bytes.toString(),
      /Signature=|Key-Pair-Id=|<script\b|\sonclick=/u,
    );
  });
  if (!c.fullText) {
    test("abstract and references do not imply APL full text", async () => {
      await assert.rejects(
        clipAip({
          html: await readFile(new URL(c.file, base), "utf8"),
          url: c.url,
        }),
        /main text was not found/,
      );
    });
    continue;
  }
  for (const style of ["markdown", "quarto", "links"])
    test(`APL ${c.id} ${style} production rendering`, async () => {
      const html = await readFile(new URL(c.file, base), "utf8");
      const r = await clipArticle({ html, url: c.url, citationStyle: style });
      assert.equal(r.metadata.journal, "Applied Physics Letters");
      assert.equal(
        r.metadata.doi,
        c.id === "3297874" ? "10.1063/5.0214274" : "10.1063/5.0346094",
      );
      assert.equal(
        r.metadata.date,
        c.id === "3297874" ? "2024-06-11" : "2026-09-09",
      );
      assert.equal(r.metadata.authors.length, c.id === "3297874" ? 8 : 6);
      assert.equal(
        r.metadata.authorInformation.affiliations.length,
        c.id === "3297874" ? 4 : 3,
      );
      assert.equal(
        r.metadata.articleHistory.accepted,
        c.id === "3297874" ? "2024-06-02" : "2026-08-20",
      );
      assert.equal(r.figures.length, 1);
      assert.equal(r.references.length, c.id === "3297874" ? 47 : 28);
      assert.equal(r.debug.equations, c.id === "3297874" ? 0 : 5);
      assert.match(r.markdown, /## SUPPLEMENTARY MATERIAL/);
      assert.doesNotMatch(
        r.markdown,
        /ACADEMICCLIPPER|javascript:|Download slide|Close modal|MathML/,
      );
      for (const key of [
        "mathValidation",
        "markdownStructure",
        "rawHtmlValidation",
        "crossReferenceValidation",
      ])
        assert.equal(r.debug[key].valid, true, JSON.stringify(r.debug[key]));
      if (c.id === "3297874") {
        assert.match(r.markdown, /\$MoS_\{2\}\$/);
        assert.match(r.markdown, /NH_\{4\}\)_\{6\}Mo_\{7\}O_\{24\}/);
        assert.match(r.markdown, /Optical and morphological/);
        assert.deepEqual(r.metadata.authors.slice(0, 3), [
          "Salvatore Ethan Panasci",
          "Emanuela Schilirò",
          "Antal Koos",
        ]);
        assert.equal(
          r.metadata.authorInformation.affiliations[1].authors,
          "Antal Koos, Béla Pécz",
        );
      } else {
        assert.equal(r.tables.length, 1);
        assert.match(r.tables[0].markdown, /\*\*Input:\*\*/);
        assert.match(r.tables[0].markdown, /\*\*Output:\*\*/);
        assert.match(
          r.markdown,
          /https:\/\/doi.org\/10.60893\/figshare.apl.c.8665005/,
        );
        assert.match(r.semantic.displayMath[0].tex, /\\int/);
        assert.equal(r.semantic.citations[0].numbers[0], 27);
      }
      assert.equal(
        (await clipAip({ html, url: c.url, citationStyle: style })).markdown,
        r.markdown,
      );
    });
}
test("challenge and invalid citation mode are refused", async () => {
  await assert.rejects(
    clipAip({ html: "<h1>Verify you are human</h1>", url: cases[0].url }),
    /main text/,
  );
  await assert.rejects(
    clipAip({ html: "", url: cases[0].url, citationStyle: "invalid" }),
    /citationStyle/,
  );
});
import { createBridgeServer } from "../src/bridge.mjs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

test("APL bridge Preview and Save use the authenticated production writer", async () => {
  const libraryPath = await mkdtemp(path.join(tmpdir(), "apl-bridge-test-"));
  const origin = "chrome-extension://abcdefghijklmnopqrstuvwxzyabcdef";
  const server = createBridgeServer({
    libraryPath,
    downloadFigures: false,
    saveDebug: false,
    bridgeToken: "fixture-only-token",
    allowedOrigins: [origin],
    citationStyle: "markdown",
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const endpoint = `http://127.0.0.1:${server.address().port}`;
  try {
    const c = cases[1];
    const html = await readFile(new URL(c.file, base), "utf8");
    const headers = {
      origin,
      authorization: "Bearer fixture-only-token",
      "content-type": "application/json",
    };
    for (const route of ["/preview", "/paper"]) {
      const response = await fetch(endpoint + route, {
        method: "POST",
        headers,
        body: JSON.stringify({ html, url: c.url }),
      });
      assert.equal(response.status, 200, await response.clone().text());
      const payload = await response.json();
      assert.equal(payload.ok, true);
    }
    const saved = await readFile(
      path.join(libraryPath, "aip-apl-3404114", "index.md"),
      "utf8",
    );
    assert.match(saved, /doi: "10.1063\/5.0346094"/);
    assert.match(saved, /Algorithm 1/);
    const denied = await fetch(endpoint + "/preview", {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({ html, url: c.url }),
    });
    assert.equal(denied.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(libraryPath, { recursive: true, force: true });
  }
});

test("source journal and article identity must match the APL URL", async () => {
  const html = await readFile(new URL(cases[0].file, base), "utf8");
  await assert.rejects(clipAip({ html, url: cases[1].url }), /source identity/);
  await assert.rejects(
    clipAip({
      html: html.replace("Appl. Phys. Lett.", "J. Appl. Phys."),
      url: cases[0].url,
    }),
    /source identity/,
  );
});

// Synthetic topology mutation: preceding unnumbered math must not renumber source labels.
for (const citationStyle of ["links", "quarto"]) {
  test(`source Equation (7) survives preceding unnumbered display in ${citationStyle}`, async () => {
    const original = await readFile(new URL(cases[1].file, base), "utf8");
    const unnumbered =
      '<div class="formula-wrap" content-id="unnumbered"><div class="disp-formula"><math><mi>x</mi></math></div></div>';
    const synthetic = original
      .replace(
        '<div class="formula-wrap" content-id="d1">',
        unnumbered +
          '<a href="javascript:;" reveal-id="d1">Equation (7)</a><div class="formula-wrap" content-id="d1">',
      )
      .replace(
        '<span class="label title-label">(1)</span>',
        '<span class="label title-label">(7)</span>',
      );
    const result = await clipAip({
      html: synthetic,
      url: cases[1].url,
      citationStyle,
    });
    assert.equal(
      result.semantic.crossReferences.get("d1").anchor,
      "equation-7",
    );
    assert.equal(
      result.semantic.crossReferences.get("unnumbered").anchor,
      "equation-1",
    );
    assert.match(
      result.markdown,
      citationStyle === "links"
        ? /\[Equation \(7\)\]\(#equation-7\)/
        : /\[Equation \(7\)\]\(#eq-equation-7\)/,
    );
    assert.match(
      result.markdown,
      citationStyle === "links"
        ? /<a id="equation-7"><\/a>/
        : /\{#eq-equation-7\}/,
    );
    assert.equal(result.debug.crossReferenceValidation.valid, true);
    const real = await clipAip({
      html: original,
      url: cases[1].url,
      citationStyle,
    });
    assert.deepEqual(
      ["d1", "d2", "d3", "d4", "d5"].map(
        (id) => real.semantic.crossReferences.get(id).anchor,
      ),
      ["equation-1", "equation-2", "equation-3", "equation-4", "equation-5"],
    );
  });
}
