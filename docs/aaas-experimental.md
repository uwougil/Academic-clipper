# AAAS 实验适配器：Science / Science Advances

关联 Work Contract：[Issue #33](https://github.com/uwougil/Academic-clipper/issues/33)。架构决策归 [Issue #26](https://github.com/uwougil/Academic-clipper/issues/26)。基线 `5971ebf`；采集于 2026-10-02/03。正式产品仍为 Nature-only，未修改 PRD/EDD。

## 平台结论与实测 URL

两种期刊的实测公开 article DOM 足够兼容，可共享 `src/adapters/aaas.mjs`：`#abstracts`、`#bodymatter[data-extent="bodymatter"]`、`div[role="paragraph"]`、`figure.graphic`、`figure.table`、`.display-formula`、`#bibliography .biblioentry`、`#tab-contributors` 一致。结论来自实际 DOM，不来自品牌关系；不声称覆盖 AAAS 全部期刊或证明平台供应商身份。

| 公开 URL | 实际结果与覆盖 |
| --- | --- |
| https://www.science.org/doi/10.1126/science.aaa9297 | Free access；Weyl 物理；source excerpt 保留 43 个 inline MathML、4 图、32 条 references、1–3 和 1–22 citation ranges、abstract、supplementary link |
| https://www.science.org/doi/10.1126/science.abj6987 | Full access；genome；100 位 dc.Creator、123 个 affiliation 条目、5 图、1 表、106 条主 references、真实 data/code 外链；supplementary summary 单独引用 62–128，不伪造主 reference 107–128 |
| https://www.science.org/doi/10.1126/sciadv.1700434 | Open access；polymer thermoelectrics；7 作者、69 references、7 图、带 rowspan/hidden rows 的 Table 1、1 个 display MathML、author notes/correspondence |
| https://www.science.org/doi/10.1126/sciadv.1602536 | Open access；neutrophils；9 作者、59 references、5 图、2 个 display MathML、nested sections、supplementary PDF/movie links |
| https://www.science.org/doi/10.1126/science.adv0235 | 真实 No access preview；有 article metadata、bibliography 和正常 `#bodymatter`，但正文是 `.denial-block`；source fixture 验证拒绝采集 |
| https://www.science.org/doi/10.1126/sciadv.aeb5047 | 当前公开 metachip 文章；确认 `#abstracts` 和相同 body/section family；只作 census，不计入离线 coverage |
| https://www.science.org/doi/10.1126/science.abi4915 | publisher error page；不算 admitted article 或 DOM family 证据 |
| https://www.science.org/doi/10.1126/sciadv.adh2583 | publisher error page；不算 admitted article 或 DOM family 证据 |

普通 web fetch 对部分 URL 返回 403/inaccessible；独立 Playwright 浏览器也遇到 403 challenge。Codex in-app browser 的普通公开导航能得到上述 usable DOM；初次导航 observation timeout 后按原 tab 再检查，未把 timeout 当作终态。未登录、解 CAPTCHA、伪造凭据、使用代理或绕过订阅限制。Error page 不等于确认 DOI 不存在。

## 观察到的差异与设计

- Science 的 Weyl/genome 正文在第一 section 之前有 unheaded paragraphs；Advances 以 INTRODUCTION 开始，nested RESULTS / METHODS sections 更多。保留原结构，不强制 Nature 的 Main/Methods。
- `dc.Title`、重复 `dc.Creator`、多个 `dc.Identifier` 是实际 metadata；只有 DOI 形式的 identifier 可建立 identity。`citation_journal_title` 与 URL journal 必须一致；canonical/Article JSON-LD identity 不匹配则拒绝。
- 日期优先 citation online/publication metadata，再 Article JSON-LD datePublished，再 dc.Date；保留 structured/visible/DC dates 供审计。Genome 的 online date 为 `2022-03-31`，DC issue date 为 `2022-04-01`，不合并两者。
- 浏览器增强后的 figure/table crossrefs 可为 `a[data-target="core-fv-F1"]` 或带 aria-label 的 button；仅正文中的 viewer button 还原链接，figure 外的 OPEN IN VIEWER controls 删除。默认 markdown 降级图/表/公式跳转为文字，links/Quarto 使用现有 output policy。
- References 是 `.biblioentry` + `.label` + `.citation-content`，不是 Nature 的 ol。连续 citation 常由两个 `doc-biblioref` anchors 和中间 dash 表示，按真实 reference numbers 有界展开。正文缺引用定义拒绝；supplementary summary 中独立文献范围保留文字与明确 warning。
- 浏览器 MathJax visual tree 和 assistive `<math>` 重复；只用 source MathML 一次。真实 `alttext="No alternative text available"` 不当作 TeX；原 TeX annotation 可用时优先，否则通过 Defuddle 的成熟转换器转 MathML。debug.mathAudit 明示 converted/source provenance。不重写数学转换器；缺 MathML 的 rendered-only math 拒绝。
- Figure caption 的 heading、notes、scientific sub/sup、citation 和 crossrefs 经过同一语义链。HTML table cells 在安全的离线路径中转换，hidden rows/rowspan 都保留；没有 cells 时保留 article link/warning，无补取网络。
- Supplementary Resources 被 Defuddle 的 article heuristic 丢弃时，通过现有 HTML→Markdown converter 显式保留整个 source supplementary section，不下载 PDF/movie。真实 data/code URLs 保持外部链接。
- contributor DOM 可稍后才填充；genome 的 contributor projection 在普通页面加载后单独采集。标题栏的 dc.Creator 并不保证 affiliation UI 已加载。缺 author-information 不伪造，正文中的贡献和 data declarations 原样保留。

`clipAaas({ html, url, citationStyle })` 是独立实验入口，返回可复用的现有 result 形状并调用现有 renderer/四项 production validators。只支持精确 `www.science.org`、HTTPS、`10.1126/science.*` / `10.1126/sciadv.*` article URLs（包含 full/abs URL，但仍必须实际有正文）。无自动网络、route/base class、live verifier、共享 corpus schema、extension/bridge/CLI 改动。共享源文件唯一改动是将现有 `referencesMarkdown()` 导出供复用。

## Source-backed fixtures 与测试

`test/fixtures/aaas/*.excerpt.html` 为解析器之前的 source DOM excerpts，不是 authored scholarly fixtures、完整 raw captures 或 parser-cleaned HTML。`provenance.json` 记录真实 URL/observedAt、browser capture、captured projection digest、fixture bytes digest、retained sanitized subtree digest、裁剪/遗漏。Abstract 与 genome contributors 是另一次实际页面 projection，分别记录时间与 source-block digest。没有原 HTTP bytes，明确不声称拥有 HTTP `sourceSha256`。这些字段是 AAAS 局部调研记录，未重新定义 #10 的 corpus schema。

Recipe：在 untouched source projection 中保留 citation/DC meta、Article JSON-LD、title header、abstract、首 section、unheaded paragraphs、完整 figure/table/math paragraphs、acknowledgments、supplementary、完整主 reference list 和 contributors。其他 sections 仅保留覆盖节点及必要 ancestors；不重新编号。移除执行 scripts、analytics/account/forms、lookup/share UI、event/style attributes、MathJax visual duplicate；保留有意义 inline whitespace、sub/sup/i/b、Unicode、MathML、IDs/classes、table spans/hidden rows。保留公开 scholarly contact metadata，未保留 cookies/session tokens。HTML scaffold 来自这些 projection 的重组；跨次 projection 的 source digests 不冒充整页响应 digest。

`node --test test/aaas-adapter.test.mjs` 验证四篇 admitted excerpts 的 exact metadata/author sequence/count、abstract、references/figures/tables、supplementary links、各方言 production validators；另有 exact MathML/citation/table/caption/data/date/source-integrity assertions。明确标记的 synthetic source mutations 覆盖 section/equation crossrefs、identity mismatch、missing references、unloaded body、UI exclusion 和 no-fetch determinism。真实 source figures/tables 有 crossrefs；目前没有冻结真实 section/equation crossref 的 source instance，这两种 link mutation 不算新的真实 source evidence。

## 未覆盖与 merge blockers

1. 当前只能手工从已加载 HTML 调用实验入口；用户正常 Save/Preview/CLI 仍 Nature-only。正式 routing/实验开关、AAAS article-fetch scope、writer result ownership 和统一 diagnostics 由 #26 integrator 提案，不能在本 PR 独立发明。
2. 正式支持 AAAS 前需人类解决 Nature-only PRD/EDD 边界，再更新 intent 文档。此 Draft 不将实验当作正式能力。
3. Science Immunology、Robotics、Signaling、Translational Medicine、Science Partner Journals 均未检查/未支持；publisher 新闻、PDF reader、archive/TOC 也不支持。
4. 未证明 rendered DOM 一定完整；必须在正常加载后捕获。No body、denial、identity mismatch、missing main references、无可靠 MathML 都拒绝；不能从 metadata/fulltext-world-readable 标记推断可访问全文。
5. 当前 source coverage 为 excerpts，不能声称完整 live article 端到端 fidelity；未下载 supplementary 或比较 PDF。Caption/sidebar lazy variants、rendered-only CHTML、复杂 tables、真实 equation/section links 和更新期刊样本仍需扩充。原 Table 1 main DOM notes 为空；尚未合并 viewer-only table notes。
6. Fixture provenance 是 browser projection 而非 #10 guarded HTTP-byte protocol；要纳入未来 shared corpus，需要 integrator 审核/转换，不能把本文件当作已批准 shared contract。
7. CI matrix、依赖锁、安全 fetch、loopback/Origin/token、transaction writer、Nature golden 保持不变。合并前需要三个 CI jobs 成功；Draft 未 merge，Issue 由 merged Main CI 后续完成。

Shared proposals 仅供 #26：复用当前 structured result + renderer；将完整性/metadata-source diagnostics 纳入最小 contract；publisher-family URL identity 和 fetch scope 必须同属 publisher-specific evidence；让 MathML provenance 与 source-native TeX 分开记录。此处没有实现这些公共决策。

## 本地验证记录

Windows / Node `v24.14.1`：`npm ci` 成功；`npm test` 124/124 通过（其中 AAAS 14 项）；`npm run build` 成功；`npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` 的 math/structure/raw HTML/crossrefs 全部 valid；`git diff --check` 无错误。这些结果只说明本地 offline checks，不冒充远端 CI 或完整 live article 验收。未运行 `clip:live` 或 writer，Nature golden 未改动。
