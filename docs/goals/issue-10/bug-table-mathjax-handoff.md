# Nature table MathJax 下标 — 独立 bug 交接

Work Contract：[Issue #51](https://github.com/uwougil/Academic-clipper/issues/51)，`bug`。本交付修复 table MathJax 原下标被 Markdown 转义的 implementation bug。它是 Issue #10 的 parser prerequisite；不分摊 Issue #10 最终 delivery PR 责任，不声称整个 FRB article/corpus 已通过。

## 基线、所有权与提交

- Accepted main：`4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2`（PR #49）；独立核验 Main CI `37272529095` 三 jobs `111642385793` / `111642385891` / `111642385902` 均 success，Secret scan `37272529070` success。最初只读 preflight 在 `e0a341fc97ff845a250c2f016dcb2363e10ed49e`，生产文件未改；文件 gate 释放后 fast-forward 到 accepted `4783291`。
- Branch：`codex/issue-10-bug-table-mathjax`；managed worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-table-mathjax/academic-clipper`。未改 B checkout、index、branch 或任何其他 agent 的文件。
- 原始 source contract：B `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`，仅用 Git object 只读核验；没有选择 B dependency copies 或 PR #13 commits。
- 唯一 production 改动：`src/normalizers/figures.mjs` 的 `tableCellMarkdown()`，复用现有 typed MathJax protection，并按原 source delimiters 保留 inline/display 角色。新 authored 文件为 `test/nature-table-mathjax.test.mjs`、`test/fixtures/nature-table-mathjax/.gitattributes`、同目录 FRB table excerpt/provenance，以及本文。
- 先交 RED-only commit `258447a90165167709355bfcb53ae83a1569b4b2`；随后 fix commit 与本 handoff receipt 的完整 SHA 用 `git log --reverse --format="%H %s" 4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2..HEAD` 重建。RED commit 只含 source excerpt/provenance 与永久回归，production parent 为 accepted main。

没有改变 canonical spec、PRD/EDD、B manifest/oracle/fixtures、validators、security、writer、publisher routing、dependencies、golden artifact、extension 或 CI。PRD §3 的原始 TeX/上下标保留与 EDD §2.4–2.5 的 normalization/方言边界是已有正确期待。

## 真实来源、署名与许可证

来源：[A repeating fast radio burst associated with a persistent radio source](https://www.nature.com/articles/s41586-022-04755-5)，Nature，DOI `10.1038/s41586-022-04755-5`，以及同文 [Table 1](https://www.nature.com/articles/s41586-022-04755-5/tables/1)。原 capture 是 B 已授权的 bounded anonymous acquisition，本修复没有重新访问 live DNS/HTTP，没有使用账号、浏览器 profile 或 credentials。

| 原 body | 原 observedAt UTC | bytes | untouched Buffer SHA-256 |
| --- | --- | ---: | --- |
| article | `2026-10-03T16:48:03.040Z` | 545450 | `190a270027c69a816b2647d2fdc6f1777cdf669695506fa40f2fe3cab8801ace` |
| table-1 | `2026-10-03T16:50:36.037Z` | 185820 | `97eaaa31a6f3443e63ad7cf2cef66776d72d61c6b0f0d2956d87cd43b39485a2` |

从上述 raw Buffer/hash、untouched DOM 独立验证完整 35 位 `meta[name="citation_author"]` ordered creators、原 Rights and permissions paragraph/text/href/prehash。原 notice 为 CC BY 4.0，链接 `http://creativecommons.org/licenses/by/4.0/`；notice subtree SHA-256 `5594df3c02d6a2f11229ebd9246cd74c555ddbb94b2ef563a5db9dac893a4e69`。`dc.copyright`、`dc.rights`、`prism.copyright` 均实际写为 `2022 The Author(s)`，其独立 DOM hashes 保存在 provenance。Publisher site footer `© 2026 Springer Nature Limited` 单独标为 site footer，不冒充 article copyright。Table 页面没有 CC href，许可证据关联原 article。原 ordered creators、完整 notice、原 URL 与上述事实均在 owned provenance 中保留；excerpt 不按 repository code license 重新许可。

原完整 bodies 仅在外部 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-b`。Ordinary tests 不依赖此目录，不进行 acquisition，不调用 writer。

## 最小来源摘录与 sanitizer

独立从 raw table 选择完整 `#content table` 和 `#content .c-article-table-footer`，保留原 ancestors、24 个 physical rows、真实 colspan、所有科学 cells、7 个 letter marker associations 和 6 条 notes。不手写科学 HTML/TeX，也不删除单位使 validator 变绿。未选择 page title/backlink、navigation、scripts、analytics；完整 article/capture 不提交。

Fixture 为 4892 bytes，SHA-256 `f274cb827e7d6d10db5e63edc92ef16dac2b52bb34a469c4551479dc36df61eb`。Git object bytes 与 Windows checkout bytes 一致；owned `.gitattributes` 保持 LF 和原 publisher whitespace。单独的 parser-relevant article link fixture复用 accepted #45 的 `test/fixtures/nature-table-notes/s41586-022-04755-5.article.excerpt.html`（3816 bytes，SHA-256 `e3aaf1a76de8ca132f6cbc08ec5f25e72afc884ec7b7a8e8a5167e5f9b0bf018`），不复制 B article input。

A 实际 dependency snapshot 只在外部临时目录，由 Git objects 导出，没有混入 bug delivery：

| A `3754d3a781459635e719859353fe3cbdf8741897` 文件 | Git blob | Git bytes SHA-256 |
| --- | --- | --- |
| `scripts/lib/nature-corpus-infrastructure.mjs` | `e56f140d9756bb83013b9df0716dc650e04d7917` | `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c` |
| `test/corpus/corpus-schema.json` | `3edf568bc82f9b0302f737acb5e0b19295cb927b` | `7f0563889be154bcb91633ee48d5ce1218d9b8aa6c46614a07bf461bd3e03915` |

使用 `sanitizeNatureHtml(decodedRaw, recipe)`，sanitizer `nature-corpus-sanitizer/1.1.0`、serializer `nature-corpus-subtree/1.0.0`、recipe `1.0.0`；source body 在 decoding 前 hash，选定 DOM 在 sanitize 前由 A `serializeSubtree()` hash。重复同 raw/recipe 与再次 sanitize excerpt 均 byte-equal。精确 recipe、prehashes、transformations、omissions、signature/hash 定义、source identity、original TeX 和 independently reviewed attachment 已提交至 provenance。没有复制第二 parser 或 sanitizer。

## RED、根因与最小修复

源位置从 `#content table.rows[row].cells[column]` 零起算，prehash 使用原 DOM 与 A serializer：

| Cell | 原 source subtree SHA-256 | 必须保留的 attachment |
| --- | --- | --- |
| [9][0] | `d3c724281061d956a645d0254f64feaa280764a0c32a35d2fea4a84c432c2216` | `DM` 的 `MW,disk` 与 `MW,halo` 两组下标 |
| [10][0] | `8016f6120773882fd35c9e929862a40929e2e0215f628d3f70c8d3759cb80403` | `DM` 的 `host` 下标 |
| [10][1] | `2ed0971e787d02ac7c490e6d6ae15e03298b925ddb0296f708330ed789bdcbc4` | `903` 的 `-111` 下标与 `+72` 上标 |

三个原 `.mathjax-tex` text 从 raw DOM 读取，不把 chat 转义文本或生产 output 当 source oracle。Defuddle 首先把 `_` 转义为 `\_`；随后 legacy delimiter normalization 恢复 `$...$` 和 `\rm` font switch，却保留合法 literal escape guard。最终 `${903}\_{-111}^{+72}$` 等失去 source subscript operator。正确期待独立保留 original TeX/attachment，只接受已有 `\rm` → `\mathrm` presentation normalization。

修复在 footnote marker association 判定后，复用同文件已有 `protectCaptionMath()`，让 typed placeholders 经过 Defuddle；原 `\[...\]` / `$$...$$` 对应 `semanticMath.displayMath`，其余现有 inline 角色对应 `semanticMath.inlineMath`，再由 `normalizeMath(converted, semanticMath)` 恢复原 TeX。原 `_` 没有进入 Markdown text escaping，原合法 `\_` 也保留；没有全局 unescape。其余 table cell处理与所有 guards 保持。

对已改变路径的精确 review 控制发现，最初将全部 typed records当 inline 会改变合法 display节点的角色。用同一明确 synthetic non-scholarly literal-text cells分别运行 unchanged `4783291` 与初始修复：`\[\text{literal display}\]` 和 `$$\text{literal display}$$` 在 baseline均 valid/displayCount1/inline0，初始修复变成 valid/display0/inline1；`\(\text{literal inline}\)` baseline与修复均 inline1/display0。这些控制不算真实 source/admission，不改真实 fixture。先提交 role regression `7a1c4bebe4e5c40b106cf4c457977229be81673d`，3 tests为1 PASS / 2 FAIL；再只在 `tableCellMarkdown()`按原完整 delimiter pair分配既有 typed records。最终两个 display角色均保持 display1/inline0，inline保持inline1/display0；内容只经过已有 math/cell whitespace presentation。`display-control-report.json`保留 baseline/final结果和 baseline生产 Git bytes SHA-256 `8860d32e3f727b3f5944fc79a6af4a383282c3d555c1c597252badfbe0a379ef`，`display-initial-fix-red.json`另保存初始差异。

## 确切验证与限制

Runtime：Windows / Node `v24.14.1`。日志、原 source audit/helper snapshots 和完整失败报告只在外部 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-table-mathjax-preflight`；它们没有进入 Git。

| Command / phase | 实际结果 |
| --- | --- |
| 外部 `node preflight.mjs <own-worktree>`，`e0a341f` 未改实现 | exit1；raw/source/rights/3 TD prehash/recipe/重复/幂等 PASS；3 cells × 3 dialects 全 9 FAIL |
| 同 command，accepted `4783291` 未改实现 | exit1；同 9 FAIL；未消费 pending main；`preflight-478-red.json` / `.log` 保存 |
| `node --test test/nature-table-mathjax.test.mjs`，未改 production | exit1；16 tests，3 PASS / 13 FAIL / 0 skip；9 source children、3 failing parents、1合法 literal TeX escape case失败。输入/署名、plain underscore/code、determinism controls通过 |
| `node --test --test-name-pattern='synthetic .* retains its original MathJax role' test/nature-table-mathjax.test.mjs`，角色修复前 | exit1；3 tests，1 PASS / 2 FAIL，0 skip；两个 display角色确实因displayCount0失败 |
| `node --test test/nature-table-mathjax.test.mjs`，最终修复后 | exit0；19/19 PASS，0 fail/skip；9 source cases、literal `\_`、plain underscore/code、3 source delimiter role controls、6 notes/7 markers/三方言 identifiers、raw HTML/structure/crossref validators、verified math fragments、A→literal→A deterministic output PASS |
| 外部 `node display-control.mjs <own-worktree>`，unchanged `4783291`与最终修复 | exit0；同 synthetic display/inline source与最终类型/计数一致；两种display1/inline0，一种inline1/display0；全部valid |
| 原外部 `node preflight.mjs <own-worktree>`，修复后 | exit0；9/9 actual final source expressions PASS；原 unit/note association保持 |
| `npm ci` | exit0；65 packages，0 vulnerabilities |
| `node --test test/nature-table-mathjax.test.mjs test/nature-table-notes.test.mjs test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-caption-citations.test.mjs` | 最终 role修复后 exit0；84/84 PASS，0 fail/skip；`affected-final-green.log` |
| `npm test` | 最终 role修复后 exit0；313/313 PASS，0 fail/skip/todo/cancel，86.701s；`full-tests-final-green.log` |
| `npm run build` | exit0；仅生成 ignored `dist/extension` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0；13 display equations、50 references；math/scientificFragments/structure/raw HTML/crossrefs 全 valid；golden只读 |
| `git diff --check` / `git diff --cached --check` / tracked filenames / index-vs-checkout excerpt hash / `git status --short` | PASS；delivery严格 owned文件；无capture/credentials/额外helper，最终clean状态与exact head由PR/交接消息记录 |

完整 FRB table math validator仍有 12 个 plain-unit/numeric-power isolated superscripts，属于独立 [Issue #48](https://github.com/uwougil/Academic-clipper/issues/48)。Focused tests运行并如实 diagnostic报告该完整 validator；本修复的真实 source MathJax表达式与其余适用 validators通过。没有改、skip 或弱化 scientificFragments，没有把 source notes pass当完整 FRB article/corpus pass。#47 caption prerequisite已 accepted；literal astronomy brackets、leading isotope、adjacent styled runs、sparse figure alt等其他失败仍须对应独立合同。`test:corpus`/live verifier不是本 branch 的完成声明，没有 live clip。

最终 PR 必须为 #51 唯一 final delivery PR，使用精确独立 `Refs #51` 行。PR 的 exact head / 三平台 CI / Gitleaks results 是仓库可见交接证据；由 root独立 review与门槛核验后决定 merge。本 agent不 merge。Merge仅接纳代码，只有 merged commit 的 Main CI成功才由automation完成 #51；该成功仍不完成 #10。
