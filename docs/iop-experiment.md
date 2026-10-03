# IOPscience / 2D Materials 实验

Work Contract：[Issue #29](https://github.com/uwougil/Academic-clipper/issues/29)。交付为独立 publisher-local 实验，生产 Nature 入口不变；不修改 PRD/EDD、universal router、base adapter、global corpus 或 live verifier。基线 accepted main `5971ebfbe288e0efed4abef21469f41e2cabb05f` 的 [Main CI 成功](https://github.com/uwougil/Academic-clipper/actions/runs/37037473932)，隔离分支 `codex/iop-2d-materials`。已读取 AGENTS、README、PRD/EDD、#26、#10 canonical corpus 文档以及 Nature adapter/pipeline/normalizers/validators/writer/security。

## 实际检查的页面

| URL | 观察范围和访问情况 |
| --- | --- |
| https://iopscience.iop.org/article/10.1088/2053-1583/1/2/025001 | Isolation and characterization of few-layer black phosphorus；公开 metadata、13 位作者、摘要和 references 控件；真实 `#wd-jnl-art-turn-away-panel` 说明未订阅，无 full-text root。只观察公开预览。 |
| https://iopscience.iop.org/article/10.1088/2053-1583/aeaa68 | Tuning magnitude and direction of lattice thermal conductivity in transition metal dichalcogenide heterobilayers；开放全文、CC BY 4.0；检查正文、图表、数学、数据声明及公开按钮加载的 88 条 references。 |
| https://iopscience.iop.org/article/10.1088/2053-1583/aeaa6b | Optomechanical method for characterizing thermal transport across suspended van der Waals interfaces；开放全文、CC BY 4.0；4 个显示公式、4 幅图、两个原生表格；公开按钮加载 41 条 references。后续 reload 到验证码页，未操作 challenge。 |
| https://iopscience.iop.org/journal/2053-1583 | 从真实期刊页标记 Open Access 的链接发现上述两篇开放文章。 |

未检查其他 IOP 期刊；以上结论只适用于观察到的 2D Materials 结构。早期 web/terminal 获取失败不代表浏览器不能读取：本机 DNS 返回 `198.18.1.5`，既有 `safeFetchExternal()` 在 HTTP 前拒绝该 benchmark 地址；未覆写 resolver、IP、安全规则或使用绕过渠道。`3/3/031012`、`ad77e0`、`ac5d0e`、`ae2b82` 曾尝试但没有 admitted publisher DOM，不作为成功样本。

## DOM 与服务器 HTML 发现

`citation_*` 提供 DOI、journal、title、ordered authors；本批页面日期使用 `citation_online_date`。机构与 ORCID 紧随对应 author。fulltext URL 元数据在订阅预览也存在，不是 access/completeness 信号。通信作者与 email 没有从 head 推断。

正文根为 `.wd-jnl-art-full-text[itemprop="articleBody"]`；`h2/h3.header-anchor` 有文章前缀 ID。方程 `.inline-eqn/.display-eqn` 含原始 `script[type="math/tex"]` 或 `math/tex; mode=display`，同时存在 lazy GIF 和 MathJax 渲染副本。显示公式的原始 TeX 包含 `\\tag` 和 align 环境。references 中另有 image-only math，`img[role=math]` 的 `$...$` alt 是可用原 TeX；不执行 OCR。化学下标与逆幂单位可能由文字 base 加独立 TeX attachment 构成，转换据 DOM 邻接重建科学表达式。

图的外层 `figure[data-toolbar-type=figure]` 有嵌套 viewer、完整 `.figure-caption`、lazy `data-src`，及 `content.cld.iop.org` 的 `_lr.jpg`/`_hr.jpg` 链接。实验只返回链接，不下载图片。表格在正文中已有真实 `table/thead/tbody`，不是远程 hydration 占位；单元格也含 TeX 与引用。普通矩形表复用 Defuddle；合并单元格显式拒绝，避免压平导致语义丢失。

正文 `a.cite` 指向 `bib*`；引用区间可由两个端点 anchor 加 dash 表示。只有中间编号全部存在时才展开；缺项报告 warning，不编写文献。公开 Show References 按钮按需加载 `#references-wrapper li[data-reference]`，含原始编号、`cite`、DOI/Crossref 与 backlink。转换使用原编号 Markdown 脚注；未加载条目保留 publisher fragment URL 并报告缺失。章节引用映射到实际 Markdown heading slug；figure/table/equation 数字引用保留可读文字，不留下不存在的局部 target。

两篇开放文章均有 `/article/<doi>/data` Supplementary data 入口；aeaa68 数据声明链接 `https://doi.org/10.5281/zenodo.19881818`，aeaa6b 说明数据包含在 article/supplementary files。只保留链接，不下载附件。

2026-10-03 使用浏览器 CDP `Page.getResourceTree` / `Page.getResourceContent` 读取已加载 aeaa68 主文档资源，而非 DOM outerHTML：529556 decoded characters；服务器文档含 articleBody、12 个显示公式、10 幅图、1 张表及末尾数据声明，与渲染正文数量相同。whole-document 原始 TeX scripts 为 528，articleBody rendered scripts 为 523（计数范围不同）；参考列表 li 为 0，wrapper 存在。由此可确定观察到的正文、数学源与图表由服务器 HTML 提供，references 是 deferred component，不能宣称初始页面包含全部内容或推广到所有 IOP 文章。定量记录见 `test/fixtures/iop/aeaa68-server-observation.json`；未保存原始响应字节，不提供虚构 response hash。另一次 Network events 观察被截断，不用它证明完整性。

## 实现与来源覆盖

`src/adapters/iop.mjs` 暴露 `iopArticleIdentity`、`inspectIopPage`、`parseIopPage`、`convertIopPage`、`extractIopMath`、`extractIopFigures`。调用方提供 HTML 和 article URL；本模块不 fetch、不写文件、不接生产入口。parse 要求一致 metadata、publisher full-text root 与实质 paragraph，遇到真实订阅 panel 拒绝。返回 `fullTextVerified: false`：该接口不能认证输入是完整页面，不能把精选片段当作全篇。转换复用 Defuddle、已有 DOM globals 边界和 academic inline normalizer；文章 JSDOM 不运行脚本、不加载资源并关闭 window，保留一个空转换 window 以适应 Defuddle 缓存 DOMParser。

| 要求 | 来源片段与直接断言 |
| --- | --- |
| identity/metadata、authors | `aeaa68-math.excerpt.html`：title、DOI、journal、date、作者顺序、机构对应和 ORCID；synthetic 只用于冲突/URL fault tests。 |
| sections、equations | 同片段的真实 heading 与 equation 1 exact TeX/number；`aeaa68-crossrefs.excerpt.html` 的章节和向量段落；保留层级。 |
| sub/sup、scientific units | reference 11 原生 SiO subscript；reference 1/2 image-alt MoS math；`aeaa68-units.excerpt.html` 完整 Figure 2 caption 的逆幂单位、网格、拟合参数；既有数学 validator 验证。 |
| figures/captions | `aeaa68-figure.excerpt.html`：完整 Figure 3 caption、原始 TeX、300 K 及两种图片 URL；拒绝伪装 CDN。 |
| tables | `aeaa6b-table.excerpt.html`：完整 Table 2 caption、四行四列、header、温度与 TeX、单元格 citations；测试矩形表转换与合并单元格拒绝。 |
| citations/references | `aeaa6b-references.excerpt.html` 保留 11/40/41；`aeaa68-citations.excerpt.html` 保留首句、range 1–3 与前三条完整文献；断言原编号、DOI、缺项和无重复。 |
| internal crossrefs | 实际 eqnref 3 降级为文本；独立观察的 secref 2 与源 heading 组合测试映射；既有 crossref validator。 |
| supplementary/data | aeaa6b 真实 Supplementary data URL；aeaa68 完整 data availability paragraph、Zenodo DOI 与缺失 reference 88 warning。 |
| access differences | `025001-preview.excerpt.html`：真实 panel ID/提示及 fulltext metadata；预览和派生伪 body 均拒绝。 |

每组片段旁有 provenance，注明 rendered capture、locator/保留块、scaffold、清理/重建方式、未保留内容和非原始邻接；原文段落、完整图注/表/选定文献来自公开 DOM，不把编写论文内容伪装到真实 DOI 下。原始整页捕获、cookies、tokens、浏览器 challenge 参数未提交。没有 original HTTP bytes/hash 的样本明确为 null，source selection 不能代替完整 corpus admission。publisher-local `excerpt-integrity.json` 记录精选片段的 UTF-8/LF SHA-256，并由离线测试核对；这些不是原始响应 hash。

## 验证与集成限制

Windows Node v24.14.1：`npm test` 128/128；`npm run build` 成功；`npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` valid（13 display equations、50 references，math/structure/raw HTML/crossref 均通过）。focused 18 项测试；source units/crossrefs 输出另用现有 math/raw HTML/crossref validators 检查。`git diff --check` 通过。完整 IOP 全页 Markdown/图片下载/附件写入尚未端到端验证；离线精选来源测试与 Nature golden 不能替代这一步。

集成前必须解决：Nature-only PRD/EDD 的人工意图决议；独立生产 pipeline/security 接入审查；真实整页输入和所有 loaded references 的完整性验收；不同文章年代/版本及更多布局的 admission；CI 对最终提交的检查。未支持 merged cells、无原始 TeX 的 image/MathML-only 公式、无邻接 base 的 attachment、通信作者/email 映射、附件内容抓取、脚注/引用以外的未知特殊结构。此 PR 维持 Draft，不 merge、不自动关闭 #29。

## Shared-contract lessons：仅提案

- URL identity、metadata、access 与完整性应是不同信号；公开 head 不证明全文可用。
- 采集故障、订阅拒绝、challenge 和 parser regression 需分别报告；rendered DOM、server document、selected excerpts 与 raw bytes/hash 需不同 provenance。
- 数学应保存一份原始语义源，另记录 image fallback；引用 range 与 deferred references 需要 source-derived admission，不猜测缺失条目。
- publisher-local source matrix 验证后再讨论公共 result/warning/citation dialect 合同；当前不提出 universal router/base adapter/global corpus/live-verifier 实现改动。
