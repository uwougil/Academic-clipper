# Nano Research：SciOpen 独立实验

调查日期：2026-10-02。Work Contract：[#32](https://github.com/uwougil/Academic-clipper/issues/32)。本实验为 #26 后续 contract extraction 提供平台证据，也遵循 #10 的 source-backed corpus 方向；不建立全局 corpus framework。

## 已核实的平台归属

Nano Research 的当前文章由清华大学出版社（Tsinghua University Press，TUP）在 **SciOpen** 发布，文章入口为 `https://www.sciopen.com/article/<DOI>`。当前页面的 `citation_publisher` 为 `清华大学出版社`。适配器因此命名为 `src/adapters/sciopen.mjs`。

[TUP 官方公告](https://www.tup.tsinghua.edu.cn/en/news?id=12400)（2024-07-04）说明 Nano Research 与 Friction 从 2025 年 1 月起在 SciOpen 发布。[Springer 的 Nano Research archive](https://link.springer.com/journal/12274/volumes-and-issues)说明该刊已在该出版方归档，卷期列表止于 2024 年 Volume 17。因此历史 Springer 托管记录不能作为当前工程平台的判断依据。

本次在 Nano Research 与 Nano Research Energy 的当前公开文章中直接观察到相同的 `v4` 页面容器、JATS 风格标签、引用及 MathJax/MathML 结构，支持将这两个样本归入同一个 SciOpen DOM family。未据此声称所有 SciOpen 期刊或所有历史文章均兼容。Friction 的迁移有公告支持，本次没有验证其文章 DOM。

## 检查过的公开 URL

| URL | 实际检查与用途 |
| --- | --- |
| https://www.sciopen.com/journal/1998-0124 | 当前 Nano Research 期刊入口 |
| https://www.sciopen.com/article/10.26599/NR.2026.94908318 | 当前文章入口、公开摘要与平台 shell |
| https://www.sciopen.com/article/10.26599/NR.2025.94907575?issn=1998-0124 | 浏览器加载后公开全文；主要 fixture：作者、章节、行内公式、Figure 1、32 条参考文献、引用范围、ESM 和数据声明 |
| https://www.sciopen.com/article/10.26599/NR.2026.94908737?issn=1998-0124 | 浏览器加载后公开全文；额外 DOM 检查，正文约 30k 字符、4 个 figure、75 个 xref、0 个 HTML table；未提交该文章内容 |
| https://www.sciopen.com/article/10.26599/NRE.2025.9120184 | Nano Research Energy；相同 DOM family，7 个 figure、15 个公式、0 个 HTML table；保留首个显示公式及相邻原文作为 fixture |
| https://www.sciopen.com/article/10.1007/s12274-023-6400-9 | 历史 DOI 的 SciOpen shell；未完成正文 DOM admission，不声称支持历史迁移文章 |
| https://link.springer.com/journal/12274 | 重定向至 Springer archive 卷期页；历史平台边界证据 |

### 访问与动态加载

检查公开页面没有使用登录、订阅凭据、CAPTCHA 绕过或私有 API。浏览器初始页面可以只有摘要、图文摘要、参考文献和 metadata，`#insert_content_one` 为空；等待普通页面加载后，所列已核实样本出现全文。`citation_fulltext_html_url` 在正文尚未出现时也存在，不能证明全文已加载。

一次使用现有 `safeFetchExternal()` 的独立 Node 请求被本环境 DNS 安全检查拒绝（解析结果涉及 local/private 地址）。没有修改该保护或改用不受保护的抓取请求。后续证据来自正常公开浏览器渲染。该环境网络限制与期刊访问控制是不同的观测，不能据此断言期刊没有公开全文。

实验 API 只接收调用者提供的 HTML；不会启动浏览器、等待页面、访问网络或调用写入器。默认 `sourceScope: 'article'` 要求唯一 scholarly root/body、含实质段落的章节、已观察的 Introduction/Conclusions 边界、连续顶层章节、已加载且编号一致的 bibliography、可解析的 scholarly xref targets。缺失这些结构直接拒绝；正文存在仍不能证明全部内容已加载。该规则仅限已观察的研究文章，不是通用或生产级完整性协议。

## DOM 与实现证据

| 内容 | 观察到的源结构 | 实验行为与验证边界 |
| --- | --- | --- |
| Metadata / authors | `citation_*`，重复 `citation_author` / `citation_author_institution` | DOI 与 URL 一致性、作者顺序、日期、期刊与出版方；保留 affiliation 列表，不推断作者关联 |
| 正文章节 | `#v4_art_main_center`、`#insert_content_one`、`.v4-art-content-p`，不同层级均为 `h2` | 根据源章节编号恢复 heading 深度；摘要、ESM、data availability 单独保留；不包含账户/侧栏/AI UI |
| 公式 | `inline-formula` / `disp-formula`、原始 MathML、MathJax 可视重复和 inert `script[type="math/mml"]` | HTML 再解析前提取原始 MathML，避免 block wrapper 脱离公式节点；复用 Defuddle 转 TeX；保留显示公式编号；真实行内/显示公式及 wrapper 回放测试 |
| 科学记号 | 化学下标、普通 `sup` 指数 | 复用 academic-inline 下标规范化，局部保留数值/单位指数；覆盖 AgSe/Te 下标、`10^{-10}` 与 MathML |
| 图与图注 | `fig[id]`、`img`、`p > label` | 保留图注，返回稳定的文章链接和 warning；图片 URL 带临时 OSS 参数，不返回或下载这些凭据，也不假设去掉签名后可下载 |
| Table | 已完整观察的上述三个正文中均未发现 HTML `table` | 无真实 table fixture；遇到 table 明确拒绝。测试中的 table 是标注为 synthetic 的 blocker probe，不是期刊证据 |
| 参考文献 / citation | `.v4-art-reference-item`、`r_bN`、`xref[ref-type="bibr"][rid="bN"]` | 按源编号建立 footnotes，引用范围由两个端点与独立减号展开；缺失引用、无效范围和重复编号拒绝 |
| Crossrefs | `xref` 的 figure、formula 等类型 | 图/公式引用按现有 Markdown 规则降级为可读文本；section 链接仅在真实 heading target 可解析时保留；未知类型保留文字与 warning |
| ESM / data | `#title_-11` 的 `enhanceDownload(id)` 控件、DOI 链接，`#insert_content_two` 的 data availability | 保留源文件名称、声明及公开 DOI 链接；无公开 href 的下载按钮回退至文章页，不猜测隐藏下载端点 |

`clipSciOpenExperimental({ html, url, sourceScope, citationStyle })` 返回 plain metadata、语义记录、warnings、admission 和验证后的 Markdown；不返回 Window、document 或 DOM nodes。仅支持 `markdown`，显式拒绝 `links`/`quarto`。验证后的 output consistency 与 source admission 分开记录，`admission.completeness` 明确为未证明。`excerpt` scope 用于明确的删节证据回放，仍要求实质正文和 citation/reference 内部一致性，但不检查被删去的完整文章边界/图目标，也不证明整篇兼容。

当前 scope 限于 `Nano Research` / `Nano Research Energy` 的已观察 `10.26599/NR.*` / `10.26599/NRE.*` metadata/DOI family，不支持其他 SciOpen journals、Friction、历史 `10.1007` DOI 或通用 JATS。NRE 保持 outcome B：完整文章 admission 明确拒绝，只保留 excerpt 证据。

它未接入 CLI、extension、bridge、writer、生产 URL dispatch、citation-mode negotiation 或 Nature adapter。Nature 源码、golden artifact、PRD/EDD 和现有 CI workflow 均不修改。

离线使用示例（在仓库根目录，Node.js 20+）：

```js
import { readFile } from 'node:fs/promises';
import { clipSciOpenExperimental } from './src/adapters/sciopen.mjs';
const html = await readFile('test/fixtures/sciopen/nr-94907575/article.excerpt.html', 'utf8');
const result = await clipSciOpenExperimental({
  html, url: 'https://www.sciopen.com/article/10.26599/NR.2025.94907575', sourceScope: 'excerpt',
});
console.log(result.markdown);
console.error(result.warnings);
```

## Fixture provenance 与回放

`test/fixtures/sciopen/*/article.excerpt.html` 是公开渲染 DOM 的选定原文子树，经过固定 scaffold、内容删节和安全清理，**不是完整文章或原始 HTTP response**。`provenance.json` 记录 URL、日期、选定输入 hash、清理前保留子树 hash、提交 fixture hash、整页观察计数及删节清单。Hash 不代表完整页面 hash；原始选定输入包含临时媒体参数，只在本地临时目录存在，不提交。

`scripts/sanitize-sciopen-experiment.mjs` 是本实验的离线清理 recipe：输入 `{ url, metadata, blocks: [{ selector, html }], counts }`，输出 excerpt 与 manifest。重新采集时须先普通加载公开正文，仅提取列出的 citation metadata 和文章子树，再执行该 recipe。它不负责网络 acquisition，也不添加新的 corpus registry。清理后的图片 locator 不表示可下载资源。Nature golden fixture 不受影响。

```text
node scripts/sanitize-sciopen-experiment.mjs <selected-blocks.json> <output-directory>
node --test test/sciopen-experimental.test.mjs
```

当前 focused suite 为 18 个 tests，覆盖源证据、manifest 完整性和无敏感参数、DOM admission/DOI/partial-loading 失败、A-B-A 与并发确定性、MathJax 再解析问题、table 拒绝，以及既有 math/raw-HTML/crossref/structure validators。截取样本通过验证不等于对全部全文的可靠性承诺。

额外的本地完整正文 smoke replay：Nano Research `10.26599/NR.2025.94907575` 的公开文章语义块通过全部返回前 validators，得到 14 个章节、4 个 figure、1 个公式、32 条参考文献、34,415 字符 Markdown。该检查发现的 Greek variable subscript 问题已用同源段落补入 excerpt 并在适配器内修复，未修改共享 normalizer。

### NRE 52 → 5 的根因与拒绝证据

旧 NRE 导出 JSON（仅在临时目录）的观察值为 52 references，但 `html.length` 恰为 200,011：200,000 字符后附加 `[Truncated]`，并在 reference 5 的导航链接内结束，缺少闭合 scaffold。对原 serialized string 查找 `id="r_bN"` 得到 1–5；JSDOM reparsing 同样得到 1–5，root 内/全 document 计数均为 5。因此损失发生在 browser result export 的截断边界，不是 JSDOM 将已导出的 52 个节点丢掉，也没有 parser mutation 或其他 UI bibliography 被当成完整 bibliography 的证据。仅凭现有产物不能确认工具内部哪一层施加 200,000 字符上限。

源中每条引用分别使用重复 `article_references` ID；全匹配 selector 可以覆盖这些 sibling containers，但 `querySelector('#article_references')` 会只取第一条，仍是独立风险。现在从唯一的 scholarly `#title_-12` 选择全部 `.v4-art-reference-item`，不依赖 bibliography container ID 的唯一性；多个 canonical section 拒绝，不从页面其他 UI 区域补引文。

`scripts/sciopen-source-audit.mjs` 离线报告 raw/reparsed 拓扑；`scripts/sciopen-reference-repro.mjs` 从该截断产物选取真实 `b5–b8` 引用段落和 exported references 1–5，生成 `nre-truncated` 的 source-backed excerpt/manifest。Manifest 记录 serialized source digest、原串和再解析参考编号、terminal marker 和删节。测试证明原 scholarly range 因缺少 b8 被确定性拒绝，显式末尾 truncation marker 在建 DOM 前被拒绝，不返回貌似完整的 Markdown。

选择 **B：NRE excerpt-level evidence only**。已验证显示公式与同 family DOM，不声称完整 NRE clipping；默认 article scope 即使收到新的无 truncation marker 的 NRE DOM 也拒绝，直到完整 acquisition/replay 有独立证据。此次不扩大 corpus、不绕过访问、不强迫 NRE pass。

旧 head `04d5554` 的 119/119 是历史结果，不是当前集成证据。当前 accepted base 为 `de8a8955db0327c0241d648e4546c2d9f85a330d`，Main CI `37137870378` 和 Secret scan `37137870392` 成功后使用。当前本地/远端全套结果和 final SHA 记录在 PR #42 最终交接节。没有运行 `clip:live`，没有覆盖 paper artifact。

一次后续全套测试遇到既有 launcher test 的 10 秒 bridge startup timeout（`test/launcher.test.mjs:63`）；未修改 launcher 或放宽测试，复跑结果在 PR 交付记录中报告。SciOpen fixture 使用限定路径的 `.gitattributes` LF 规则，以保持 Windows checkout 后的 provenance bytes/hash。

### Lifecycle、composition 与有界内存

对照当前 AAAS/RSC 的 accepted-main 实现，SciOpen 在 article globals 安装前静态初始化 `defuddle/full`，不保留自己的永久 conversion window；title fragment 使用同一个 article document。Parser 整体 catch 关闭窗口（包含未预期的晚期异常），clip 的 finally 在成功/转换失败后关闭并 yield event loop。共享 `dom-runtime` 与 converter 不修改。

`scripts/sciopen-lifecycle-check.mjs` 的六个冷启动子进程覆盖 SciOpen↔RSC、SciOpen↔AAAS、SciOpen↔PNAS。每个进程都运行四 publisher 并发、A-B-A/跨顺序 Markdown hashes 对照、own/global 值恢复、SciOpen admission/late-parser/conversion-normalization failure、24 次额外 SciOpen clips。SciOpen owned article windows 每次正好 close 一次（每进程 32 个），返回值无 DOM nodes；NodeFilter sentinel 及缺省 DOM globals 原样恢复。PNAS 等其他 publisher 的 lifecycle 不由本 PR 修改或重新设计。

每个进程用 `--expose-gc --max-old-space-size=512`；三批回放后记录 heapUsed。初次观测为 172,106,912 → 77,567,016 → 58,083,512 bytes，未见单调积累，六顺序均未 OOM。此为有界执行/ownership 证据，不是无条件内存上界或其他 publisher 完整生命周期承诺。focused suite 同样在 512 MiB heap 下通过。仅测试 SciOpen 真正支持的 markdown；没有为 parity 添加其他 dialect。

## 后续 shared contract 提案与 merge blockers

供 #26 后续阶段讨论的提案：区分 body-present/readiness/完整性与 output validators；在 browser/export/reparse 各边界对照同一 scholarly projection 的计数/截断信号；canonical bibliography 不应依赖 publisher ID 唯一性；明确 publisher-local JATS range/reference 解析责任；保留原始 MathML provenance；规定签名媒体 lifetime、无 href ESM fallback/warning；runtime-owned parser result 与 plain clip result 分开，不能从其他 publisher 的 result shape 推断 shared type；DOM lifecycle/失败阶段应可审计。SciOpen 仅支持 markdown，而其他实验接口有不同 dialect、debug 和 result 字段，属于未来合同的证据，未在此统一。这里不提取这些合同，不修改任何共享实现或路由。

该 Draft 暂不满足生产支持的 merge 条件：

1. 需要人工确认独立实验与后续生产产品/工程意图的边界；若扩大支持范围，必须显式解决并更新 PRD/EDD。
2. 需要更多真实全文样本、公开 table layout fixture、source variants 与 readiness/完整性证据，尤其历史 DOI 与其他 SciOpen 期刊。
3. 若生产要求本地图片/ESM，必须单独设计有 URL/DNS/redirect/size/content-type 保护的公开资源 acquisition；当前链接回退须先被产品合同接受。
4. 任何 production integration、citation modes、writer 和全局 contract extraction 都需要后续独立 Work Contract。此 PR 只交付 SciOpen 实验与 blocker evidence。
5. 所有既有检查与 Ubuntu Node 20/24、Windows Node 24 的 CI 必须通过，并完成独立审查；不得因 Draft parser 回放成功直接宣称生产可用。
