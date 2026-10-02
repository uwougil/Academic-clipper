# Wiley 实验性适配器

这是 [Issue #34](https://github.com/uwougil/Academic-clipper/issues/34) 的独立试点，关联 #26 的 publisher contract 调研，不承担 #10 的 Nature corpus 交付。正式产品仍按 PRD/EDD 只支持 Nature。此代码没有接入 extension、bridge、CLI 或 publisher router。

基线：accepted main `5971ebfbe288e0efed4abef21469f41e2cabb05f`，Main CI [37037241055](https://github.com/uwougil/Academic-clipper/actions/runs/37037241055) 成功。分支 `codex/wiley-experimental`。

## 公开页面核验（2026-10-02）

| 期刊 | 请求的 URL | 观察 |
| --- | --- | --- |
| Advanced Functional Materials | https://advanced.onlinelibrary.wiley.com/doi/full/10.1002/adfm.202411631 | 重定向到同 host `/doi/abs/10.1002/adfm.202411631`；header 仅 Research Article；没有 full wrapper；有 abstract、data statement、supplements、references。不能声称全文支持。 |
| Advanced Science | https://advanced.onlinelibrary.wiley.com/doi/full/10.1002/advs.202404860 | header Open Access；full wrapper、章节、figures、references、supplements；初始 equation 是 lazy MathJax 与 image fallback。 |
| Small | https://advanced.onlinelibrary.wiley.com/doi/full/10.1002/smll.202402938 | 实际落在 https://onlinelibrary.wiley.com/doi/full/10.1002/smll.202402938；header Open Access；full wrapper、HTML tables、figures、references、supplements。Equation (1) 进入 viewport 后保留 `application/x-tex` annotation。 |
| Advanced Electronic Materials | https://advanced.onlinelibrary.wiley.com/doi/full/10.1002/aelm.202300874 | header Open Access；full wrapper、figures、range citations、references、supplements；lazy equations。 |

另检查 [Advanced Science editorial](https://advanced.onlinelibrary.wiley.com/doi/full/10.1002/advs.202400981)，有 `.article-section__full`，没有普通研究论文的全部结构；未作为研究 fixture。

这四个实际页面共享 Wiley article DOM family：`.article__body`、`.article-section__abstract`、`.article-section__full`（仅全文）、`.article-section__content`；研究正文使用 `h2.article-section__title` 和 `h3.article-section__sub-title`。图使用 `figure.figure`、`.figure__caption-text`、`data-lg-src`，表使用 `.article-table-content[id]`，参考文献使用 `.article-section__references li[data-bib-id]`，引用使用 `.bibLink`，补充信息使用 `.article-section__supporting`。Article ID prefixes 与 DOI 不相同，例如 `advs10387`、`aelm670`，不能从 DOI 拼 DOM IDs。共同结构证据只覆盖已观察的页面，不证明所有年份、所有文章类型均兼容。

搜索/网页文本工具无法获取这些 full pages。现有 `safeFetchExternal()` 在本环境拒绝 Wiley DNS 的 local/private address；未改动或绕过该检查。普通浏览器导航成功，因此 source 使用公开浏览器 DOM。没有登录、private cookies、authentication/paywall 绕过，也没有抓取隐藏的收费全文。

## 调用与行为

```js
import { clipWiley } from './src/adapters/wiley-clip.mjs';
const result = await clipWiley({ html: publicLoadedDom, url, citationStyle: 'markdown' });
// result.markdown, result.metadata, result.debug, result.bibliography (quarto)
```

`parseWileyPage()` 限定两个精确 Wiley hosts、四个期刊与 `10.1002/{adfm,advs,smll,aelm}.*` DOI；要求 citation DOI 与 URL 一致。`clipWiley()` 复用 Defuddle、既有 normalizers、`renderClipMarkdown()`、BibTeX renderer 和全部 production validators。没有新增网络请求或 writer。

Preview 默认拒绝。只有显式 `allowPreview: true` 才转换不完整 preview，并保留 warning。`full-content-present` 仅指 supplied DOM 有 full wrapper 和段落，不证明动态加载已完整，不表示访问权已验证。

Publisher-local 逻辑包括 metadata 顺序关联 authors/institutions、online/publication dates、body isolation、图与高分辨率 URL、caption UI 排除、table cells、DOM-attached scientific runs、bracketed table units、原 TeX冻结、image fallback、bibliography numbers、superscript citation ranges、section/figure/table/equation targets、supplement links。默认 markdown 的 figure/table/equation crossrefs 按既有契约降为文字；links/quarto 使用既有 identifiers。未知同文章 targets 保留绝对源链接；不生成不存在的 local target。

Supporting Information 的实际 download links 保留为绝对链接，PDF/Word/movie 不下载、不伪装成研究表格。HTML research tables 复用现有 span grid conversion；multirow header 的后续行保留为 grid 行，不声称完整视觉排版还原。Table cells 缺失时保留源链接和 warning，不自动打开 overlay。Figures 只使用 inline DOM 的 caption/image，不把 viewer/PowerPoint 控件当作学术内容。

## Fixture 来源与覆盖

`test/fixtures/wiley/{adfm,advs,smll,aelm,smll-expanded}/` 保存 selected DOM excerpts 与 `provenance.json`。四篇论文、五个状态；expanded 不是第五篇独立论文。每个 excerpt 保留原来的 ancestor tags、section nesting、source order、原编号、原 prose/caption/table/TeX，不编写学术内容。截取 abstract、前三个正文 heading、首段、首图、首个 display equation、首个 HTML table（存在时）、supplement section、引用最高编号所需的完整 references prefix。Expanded Small 另保留真正的 Figure 1 crossref paragraph 和 Data Availability Statement。

| Fixture | Authors / affiliations | Retained references | 图 / 表 | Equation |
| --- | --- | --- | --- | --- |
| adfm | 13 / 13 | 0（preview excerpt 不保留 refs） | 0 / 0 | none |
| advs | 9 / 9 | 5 | 1 / 0 | lazy image fallback |
| smll | 11 / 11 | 9 | 1 / 1 | lazy image fallback |
| aelm | 7 / 7 | 24 | 1 / 0 | lazy image fallback |
| smll-expanded | 11 / 11 | 9 | 1 / 1 | source TeX Equation (1) |

Acquisition recipe：在公开页面上读 `.article__body`，选择上述完整 blocks；递归投影仅保留 blocks 及原 ancestor tags，删除未选 siblings；读取 `citation_*` meta。记录 selected source `outerHTML` 的 SHA-256，再用 `scripts/wiley-fixture-from-blocks.mjs <selected-blocks.json> <output-directory>` 做确定性 sanitizer。Sanitizer 删除 scripts/forms/iframes/style/events、reference linkout/analytics controls；保留 academic DOI。最终固定 UTF-8/LF、去除行尾 indentation（保留 newline）、fixture SHA-256；publisher-local `.gitattributes` 保证 Windows checkout 也保持 hash bytes。

Source input 是临时目录内的 selected blocks，不提交完整 raw/cleaned HTML。`sourceResponseSha256: null` 是明确的缺项：没有拿到 HTTP body，不能用 DOM digest冒充 HTTP digest。Hashes 标识 serializations，不能独立证明科学内容或全文完整。Source subtree digest 记录在 provenance；真正 fixture hash 被 tests 消费。重新采集需重新核对源与 oracle，不能仅重新生成 expected counts。

`node --test test/wiley.test.mjs` 包含三方言 conversion + production validators、metadata/affiliations/日期、section hierarchy、原 TeX、chemical/unit formatting、caption/image source、7-column merged-header table cells、AEM citation ranges（1–3、4–9 等）、bibliography/Quarto keys、实际 Figure 1 crossref、supplement/data statement、preview/identity gates、A→B→A determinism 与零 fetch。缺表格/缺bibliography 是明确 synthetic variants，不能当作新增真实页面覆盖。

## 已知失败与 merge blockers

- 未接入 production 保存/预览入口。正式 Wiley 支持需要明确 PRD/EDD intent resolution 与集成决策；本 PR 不自行修改这些语义。
- 只验证四篇研究文章及一个 editorial；没有 AFM 可公开全文 fixture，没有完整 subscription-authenticated capture。AFM preview 证明访问边界，不证明完整 subscription page parser。
- 初始或未 expanded 的 MathJax 可能没有原 TeX。此时使用真正的远程 equation image 并 warning；没有 image 时明确 unavailable。不会用空 MathML 或 OCR 冒充可靠公式。
- References/table overlays 尚未加载时不会 fetch；缺 references 的 citations 保留 public links 并 warning。没有 renderer/headless 等待器或 access automation。
- 单独的 MathML、特殊 inline equation wrappers、复杂 table footnotes、多个 corresponding emails、received/accepted history 等未形成 source-backed coverage。Meta dates 目前仅 online/publication。没有承诺这些变体。
- 图号使用 retained DOM order 的稳定 anchors；输出没有本地资源下载的 live 验证。Unknown same-article targets 回到 absolute source links。未验证所有补充/数据 endpoint 能下载。
- Defuddle 缓存其首次 DOMParser；不能关闭该初始 window 后再调用 converter。此处沿用 Nature 生命周期，A→B→A 测试保护转换隔离；没有重构 shared runtime。
- Fixture source 是 DOM excerpt，不符合尚未落地的 #10 HTTP-response provenance 全契约；需要 integrator 决定 browser capture provenance admission。

Shared-contract 问题（仅提案）：publisher-local entry point 如何进入 production routing；metadata/access/completeness/warning taxonomy；跨host同 DOI fragment 如何归一化；excerpt capture 的 browser-vs-HTTP provenance；动态 expansion 是否由 browser capture 层处理；references rendering 目前需小量 publisher-local glue，何时共享。没有 universal base class、global router/manifest 或 common live verifier 改动。
