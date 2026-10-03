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

实验 API 只接收调用者提供的 HTML；不会启动浏览器、等待页面、访问网络或调用写入器。空正文直接报错；已有正文节点只是必要条件，目前没有生产级的全文完整性/readiness 判定。

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

`clipSciOpenExperimental({ html, url })` 返回 metadata、语义记录、warnings 和验证后的 Markdown。它未接入 CLI、extension、bridge、writer、生产 URL dispatch、citation-mode negotiation 或 Nature adapter。Nature 源码、golden artifact、PRD/EDD 和现有 CI workflow 均不修改。

离线使用示例（在仓库根目录，Node.js 20+）：

```js
import { readFile } from 'node:fs/promises';
import { clipSciOpenExperimental } from './src/adapters/sciopen.mjs';
const html = await readFile('test/fixtures/sciopen/nr-94907575/article.excerpt.html', 'utf8');
const result = await clipSciOpenExperimental({
  html, url: 'https://www.sciopen.com/article/10.26599/NR.2025.94907575',
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

9 个实验测试覆盖上述源证据、manifest 完整性和无敏感参数、DOM admission/DOI 失败、A-B-A 与并发确定性、MathJax 再解析问题、table 拒绝，以及既有 math/raw-HTML/crossref/structure validators。截取样本通过验证不等于对全部全文的可靠性承诺。

额外的本地完整正文 smoke replay：Nano Research `10.26599/NR.2025.94907575` 的公开文章语义块通过全部返回前 validators，得到 14 个章节、4 个 figure、1 个公式、32 条参考文献、34,415 字符 Markdown。该检查发现的 Greek variable subscript 问题已用同源段落补入 excerpt 并在适配器内修复，未修改共享 normalizer。

Nano Research Energy 的整页 DOM 观察到 52 条参考文献，但所导出的语义块经 HTML 再解析后只有 5 条，完整正文回放因此报 `Invalid SciOpen citation range.`，没有输出不完整 Markdown。其页面含重复 `article_references` ID；当前仅证明显示公式 excerpt 的兼容性，尚未证明整篇 NRE acquisition/replay。需后续以完整子树采集、原始/再解析 DOM 计数对照查明丢失边界，不能把此次失败称为付费墙或忽略引用验证。该来源变体也是 merge blocker。

本地验证环境为 Windows、Node.js 24.14.1：`npm ci` 成功；`npm test` 为 119/119 通过（包括 9 个实验测试）；`npm run build` 成功；`npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` 返回 `valid: true`。没有运行 `clip:live`，没有覆盖 paper artifact。

一次后续全套测试遇到既有 launcher test 的 10 秒 bridge startup timeout（`test/launcher.test.mjs:63`）；未修改 launcher 或放宽测试，复跑结果在 PR 交付记录中报告。SciOpen fixture 使用限定路径的 `.gitattributes` LF 规则，以保持 Windows checkout 后的 provenance bytes/hash。

## 后续 shared contract 提案与 merge blockers

供 #26 后续阶段讨论的提案：区分 article identity、正文 readiness 与完整性；明确 publisher-local JATS range/reference 解析到中间语义的责任；保留原始公式 payload 与标签；规定签名媒体、无 href 下载控件的 fallback/warning；统一验证诊断的交接形式。这里不提取这些合同，不修改任何共享实现或路由。

该 Draft 暂不满足生产支持的 merge 条件：

1. 需要人工确认独立实验与后续生产产品/工程意图的边界；若扩大支持范围，必须显式解决并更新 PRD/EDD。
2. 需要更多真实全文样本、公开 table layout fixture、source variants 与 readiness/完整性证据，尤其历史 DOI 与其他 SciOpen 期刊。
3. 若生产要求本地图片/ESM，必须单独设计有 URL/DNS/redirect/size/content-type 保护的公开资源 acquisition；当前链接回退须先被产品合同接受。
4. 任何 production integration、citation modes、writer 和全局 contract extraction 都需要后续独立 Work Contract。此 PR 只交付 SciOpen 实验与 blocker evidence。
5. 所有既有检查与 Ubuntu Node 20/24、Windows Node 24 的 CI 必须通过，并完成独立审查；不得因 Draft parser 回放成功直接宣称生产可用。
