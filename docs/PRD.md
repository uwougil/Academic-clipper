# Academic Clipper 产品需求文档

状态：v0.2 原型已完成，本文档是当前产品意图的规范化版本。

## 1. 产品目标

Academic Clipper 是一个面向科研论文的浏览器采集工具原型。它复用 Obsidian Web Clipper 使用的 Defuddle 网页解析与 HTML→Markdown 能力，把当前浏览器中的 Nature 论文转换成可长期保存的学术 Markdown，并写入本地科研知识库目录。

核心链路：

```text
Nature 论文页面
  → Manifest V3 浏览器扩展
  → 本机 loopback bridge
  → Nature DOM/metadata 适配器
  → Defuddle HTML→Markdown
  → 学术公式、引用、图注和结构规范化
  → 本地论文目录/index.md
  → VS Code 或其他 Markdown 工具
```

“VS Code 出口”指本地文件系统被 VS Code 管理，不意味着需要开发 VS Code Extension。

## 2. 用户与主要场景

目标用户是需要积累论文原文、公式、图注和参考文献的科研人员。

主要场景：

1. 在已加载完成的 Nature article 页面点击浏览器扩展的 `Save Paper`。
2. 在保存前通过 `Preview Markdown` 检查转换结果。
3. 在本地科研知识库中得到 `papers/<article-id>/index.md`，可继续由 VS Code、Markdown 编辑器或 Quarto 使用。
4. 发生页面结构变化、图片下载失败或公式异常时，通过 `debug.json` 和 warning 定位问题。

## 3. v0.2 产品范围

### 必须支持

- 仅支持 `www.nature.com/articles/<article-id>`，当前 golden paper 为 `s41586-026-10401-1`。
- 从当前页面 DOM 和结构化 metadata 提取标题、作者、期刊、日期、DOI、URL，以及可用的 affiliation、correspondence 和贡献信息。
- 保留文章正文的标题层级、段落、列表、链接、粗体、斜体、上下标、特殊符号和语义区块。
- 优先保留原始 TeX，生成标准 Markdown inline/display math；无法可靠解析时记录 warning，不伪造公式。
- 提取主图、Extended Data 图、图号、短 alt、完整学术图注和本地/远程图片资源。
- 保留正文引用和 References 结构；支持 `markdown`、显式兼容的 `links`、以及 Quarto `quarto` 引用模式。
- 识别同文章表格链接并在安全范围内补取可用表格；无法结构化时保留链接并记录 warning。
- 通过本地 bridge 写入可配置目录，并保证单篇论文写入具有确定的事务性和恢复行为。
- 提供最小调试信息、fixture 回归测试、golden artifact 校验和跨平台 CI。

### 明确不做

- 不扩展 APS、Wiley、Elsevier、Springer、ACS、IOP、Science 或其他出版社。
- 不开发 VS Code Extension、Electron 应用、数据库、搜索系统、知识图谱或 AI 摘要/自动 LLM 调用。
- 不把成熟的 Defuddle HTML→Markdown/Math 转换器复制进本仓库重写。
- 不把 Zotero/BibTeX 管理作为独立产品能力；Quarto 模式仅生成当前输出所需的 `references.bib`。
- 不在常规 CI 中访问 Nature live 页面，不提交 raw/cleaned HTML 快照或真实配置凭据。

## 4. 输出契约

默认输出：

```text
papers/
└── s41586-026-10401-1/
    ├── index.md
    ├── debug.json                 # 仅在 debug/saveDebug 时生成
    ├── references.bib             # 仅在 Quarto 模式生成
    └── figures/                   # 启用图片下载时生成
```

`index.md` 应包含 YAML front matter、正文语义结构、公式、图和参考文献。默认 Markdown 模式使用原生脚注引用；Quarto 模式使用稳定 citation key、`[@key]` 和同目录 BibTeX；`links` 仅为旧项目兼容模式。

## 5. 验收基准

目标 Nature 论文的 golden artifact 必须满足：

- 标题、作者、DOI、期刊和 URL 来自页面，而非针对论文硬编码。
- Abstract、正文标题层级、Methods/相关区块和 References 可读，网页导航、Cookie、广告、推荐内容不进入正文。
- inline/display math 保留为 TeX/Markdown math，不出现明显 MathML/XML 垃圾。
- 目标论文当前基准包括 6 位作者、13 个正文公式节点、3 个主图、4 个 Extended Data 图和 50 条参考文献；当前可用的 Table 1 应保持结构化表格。
- 代表性 Nature 语料库（涵盖公式密集、图与 Extended Data 密集、表格多样、引用密集、大型联盟作者等 8 篇代表性论文）保持离线确定性端到端校验通过，结构及 warning 诊断符合基线预期。
- 图片下载失败时文章仍可保存，Markdown 保留远程 fallback，debug 中有可诊断记录。
- 重复保存不会残留旧的 bibliography、debug 文件或过期图片；失败写入不会把目标目录变成新旧版本混合状态。

## 6. 产品质量属性

- 确定性：相同输入和配置应生成相同结构的 Markdown，事务恢复不能依赖目录名字的偶然字典序。
- 可维护性：Nature selector、转换器、归一化器、验证器、bridge 和 writer 分层，避免用全局正则修补 HTML。
- 安全性：bridge 只监听 loopback；Origin/token、外部 URL、DNS 解析、redirect、响应类型和大小都必须经过边界检查。
- 可审计性：debug 记录来源、计数、fallback、warning、metadata audit 和验证结果。
