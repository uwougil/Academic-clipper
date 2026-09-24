# Academic Clipper — Nature prototype v0.2.0

项目规范已按 bootstrap 结构整理：

- [产品需求文档](docs/PRD.md)
- [工程设计文档](docs/EDD.md)
- [Nature 代表性论文语料库规范](docs/nature-corpus.md)
- 里程碑与验收记录：
  - [Milestone 001 — Nature v0.2 高保真与稳定性收敛](docs/milestones/001-nature-v0.2-stability.md)
  - [Milestone 002 — 架构加固与代码审查收敛](docs/milestones/002-code-review-hardening.md)
  - [Milestone 003 — Nature 代表性语料验证集与回归机制](docs/milestones/003-nature-corpus-verification.md)
- [仓库协作与验证规则](AGENTS.md)

这是一个面向科研论文的最小浏览器采集原型：当前页面的 Nature HTML 由浏览器扩展送到本机 bridge，bridge 使用 Obsidian Web Clipper 依赖的 Defuddle 解析并转换为 Markdown，最后写入本地 `papers/<Nature article id>/index.md`。VS Code 只需要打开同一个文件夹即可看到新增文件，不需要开发 VS Code Extension。

## 架构与复用边界

开发工作区旁边的 `../obsidian-web-clipper` 是从官方仓库克隆的源码快照（clone 时 HEAD 为 `9aa509b8f2801b08d974fb59f026df6f9a12e496`）。它用于源码研究，未重复 vendored 到本仓库；本项目运行时直接依赖 npm 的 `defuddle` 包。研究得到的调用链是：

```text
browser page HTML
  -> NatureAdapter (DOM selectors + semantic extraction/placeholder mapping)
  -> Defuddle.parse()
  -> defuddle/full.createMarkdownContent()
  -> academic normalization (math/inline typography/citations/anchors)
  -> local bridge filesystem writer
```

Obsidian Web Clipper 关键位置：

- `obsidian-web-clipper/src/api.ts`：公共 clip API，调用 `Defuddle` 和 `createMarkdownContent`，随后构造模板变量。
- `obsidian-web-clipper/src/utils/content-extractor.ts`：扩展运行时提取页面内容并进入同一 Markdown 转换链。
- `obsidian-web-clipper/src/utils/template-compiler.ts`、`src/utils/renderer.ts`、`src/utils/filters/`：模板、变量、过滤器系统。
- `obsidian-web-clipper/src/utils/cli-utils.ts`：与 Obsidian CLI/URI 强耦合的保存出口，本原型没有复用它。
- `defuddle` / `defuddle/full`：正文抽取及 HTML→Markdown、公式转换的成熟实现，本原型直接依赖它，没有另写 HTML regex 转换器。

本原型新增边界：

- `src/adapters/nature.mjs`：仅针对 Nature 当前 DOM；读取 `citation_*` metadata、`.c-article-body`、公式、figure、Extended Data figure、table link 和 `ol.c-article-references`。主图同时读取外层 `data-test="bottom-caption"` 的完整面板说明；对同文章的 `/tables/<n>` 页面做受限补取，并把表格内容状态写入 debug。在交给 Defuddle 前把 MathJax 与 `<i>/<b>/<sub>/<sup>` 组合成带 provenance 的 scientific run，避免在最终 Markdown 上不断叠加正则补丁。
- `src/clip.mjs`：把 Nature 结构交给 Defuddle，恢复语义 placeholder、生成稳定的 figure/reference Markdown，并生成 front matter；每篇论文先在临时兄弟目录中完整生成，再以目录级交换提交，避免旧的 bib/debug/figure 文件残留。
- `src/normalizers/math.mjs`：恢复 DOM 已判定的 inline/display TeX；保留原始下标和矩阵行分隔。
- `src/normalizers/academic-inline.mjs`：把学术 `<sub>/<sup>/<i>` 组合转成可读的 Markdown/Quarto 行内表达式。
- `src/normalizers/citations.mjs`：统一本地引用链接和 section/equation 锚点。
- `src/normalizers/figures.mjs`：通过同一条 math/academic-inline 语义链渲染短 alt、完整 caption、主图/Extended Data 图和 Markdown 表格；无法得到 HTML 单元格时保留绝对链接和显式 warning。
- `src/validators/markdown-structure.mjs`：对最终 Markdown 的 References/Tables section 做确定性的脚注、列表和 Markdown 表格结构检查；math validator 另行报告 scientific fragment 诊断。
- `src/bridge.mjs`：`127.0.0.1:34123` 的极小 HTTP bridge，接收 HTML、写入本地文件。
- `src/security.mjs`：bridge 的 Origin/token 边界和 figure URL 的最小 SSRF 防护。
- `extension/`：极简 Manifest V3 popup，只有 Save Paper 和 Preview Markdown。
- `test/fixtures/nature-minimal.html`：小型 fixture，不把整篇 Nature HTML 永久塞进单元测试。

## 安装和运行

需要 Node.js 20 或更高版本。

```bash
npm ci
copy config.example.json config.json   # Windows PowerShell 可用 Copy-Item
npm run dev
```

默认配置把文件写入项目下的 `papers/`。可以把 `config.json` 改成任意本地知识库目录；相对路径相对于配置文件所在目录解析：

普通 `papers/` 捕获、`node_modules/`、`dist/` 和本地 `config.json` 默认不提交到 Git；本仓库特意保留 `papers/s41586-026-10401-1/` 作为可供 review 的 Nature golden artifact（最终 Markdown、图片和 `debug.json`），但不提交 `raw.html`/`cleaned.html` 网页快照。

```json
{
  "libraryPath": "./papers",
  "port": 34123,
  "downloadFigures": true,
  "saveDebug": false,
  "citationStyle": "markdown",
  "bridgeToken": "",
  "allowedOrigins": []
}
```

bridge 启动时若没有配置 `bridgeToken` 会生成随机 token 并打印在本机终端；把它粘贴到扩展 popup 的 Bridge token 输入框。默认 CORS 只接受 Chrome extension Origin；`allowedOrigins` 非空时可进一步限制为指定扩展 Origin。bridge 仍只监听 `127.0.0.1`，端口必须是 `1..65535` 的整数，`/paper` 和 `/preview` 需要 Bearer token。

默认会把 figure 下载到 `papers/<article-id>/figures/`，并在 `index.md` 中使用相对路径。若确实需要远程图片，可在配置中设置 `downloadFigures: false`，或使用 CLI 的 `--no-download-figures`。

也可以直接使用 CLI 验证目标论文：

```bash
npm run clip:live
```

或显式指定输出和调试文件：

```bash
node src/cli.mjs --url https://www.nature.com/articles/s41586-026-10401-1 --output ./papers --debug
```

CLI 只接受精确的 `https://www.nature.com/articles/<id>` 地址；文章请求及每次重定向都必须保持在同一文章 scope，默认 30 秒超时并限制 HTML 响应为 25 MiB。

验收 live regression（包含本地图片下载）：

```bash
node src/cli.mjs --url https://www.nature.com/articles/s41586-026-10401-1 --output ./papers --debug --download-figures
```

## 浏览器扩展

1. 先保持 `npm run dev` 运行。
2. Chrome/Edge 打开 `chrome://extensions`，启用 Developer mode。
3. 选择 Load unpacked，指向本目录的 `extension/`；执行 `npm run build` 后也可以指向 `dist/extension/`。
4. 在 popup 的 `Bridge endpoint` 中填写 bridge 地址（只接受 `http://localhost:<port>` 或 `http://127.0.0.1:<port>`），点击 Save settings。
5. 打开 Nature 论文，点击扩展图标，再点击 Save Paper。

成功状态类似：

```text
Saved:
s41586-026-10401-1/index.md
```

扩展通过 `chrome.scripting.executeScript` 读取当前 DOM，因此适合已经加载完成的 Nature article 页面；Chrome 内置页、PDF viewer 等不可注入页面会显示失败原因。

## 调试与测试

```bash
npm test
npm run test:corpus
npm run test:corpus:live
npm run build
npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto
```

`--debug` 会在论文目录保存 `raw.html`、`cleaned.html`、`debug.json`，并在 CLI 输出：publisher、article root、metadata source、paragraph/equation/figure/reference/scientific-run 数量、移除节点数、figure local/remote-fallback/failed summary、table capture/fallback summary、author-information audit、math fragment/structure validation 和 warnings。

`validate:paper` 会对最终 `index.md` 做 lexical math delimiter validation，检查 inline/display math 是否闭合、是否跨 Markdown block、是否出现非法 `$`/`$$` 邻接、legacy delimiter 或 semantic marker。`--citation-style` 支持 `auto`、`markdown`、`links`、`quarto`；auto 会根据 References 结构识别，无法确定时明确报错。验证失败返回 non-zero，不会由 writer 静默写出该文件。普通 Markdown 默认使用原生脚注引用（`[^8]`，References 区只定义一次）；设置 `citationStyle` 为 `quarto`，或 CLI 使用 `--citation-style quarto`，正文会改用 `[@Jungwirth2016]` 形式，front matter 会声明 `references.bib`，并在论文目录生成可复用的 BibTeX 文件。旧项目若明确需要 `[n](#ref-n)`，仍可显式设置 `citationStyle` 为 `links`。Pandoc/Quarto 不是运行时依赖；如果本机已安装，可另行执行 `pandoc index.md -o /tmp/academic-clipper.html` 或 `quarto render` 做可选 parser smoke test。

GitHub Actions 在 pull request 和 `main` push 上运行 Node 20/24 的 `npm ci`、完整测试、clean extension build 和 golden paper validation；普通 CI 只使用仓库 fixture/golden artifact，不重新访问 Nature。

## 当前实测范围和已知问题

目标论文目前由 Nature 页面提供：6 位作者、DOI `10.1038/s41586-026-10401-1`、正文 13 个公式节点、3 个主图、4 个 Extended Data 图和 50 条参考文献。v0.2.0 默认下载 7 张图到 `figures/`，主图通过稳定 placeholder 保留在正文附近，Figure 自身不生成二级 heading，Extended Data 图单独放入 `## Extended Data`。图注中的 `<sub>`、`<sup>`、`<i>` 和 `.mathjax-tex` 会经过 academic inline/math 转换；图片下载失败时保留远程 URL，并在 debug 中记录 fallback。

已知边界：

- 只支持 `www.nature.com/articles/<id>`，没有提前抽象其他出版社。
- Nature 表格优先补取同文章的 Full size table HTML：当前目标论文的 Table 1 可生成 Markdown 表格；Extended Data Table 1 只有图片，因此保留标题、绝对 Full size table 链接和 debug warning，不把图片伪装成结构化表格。
- 主图 1–3 的图注包含 `figcaption` 外的 `data-test="bottom-caption"` 面板说明；适配器会合并这两段，避免只留下标题。标题/表格链接中的 root-relative Nature URL 会按文章 URL 归一化，同文章 fragment 会改为稳定本地锚点，外部 fragment 不改写。
- Author information 中的作者备注、affiliation、贡献和 correspondence 会在存在时作为独立 Markdown section 输出；`debug.json.metadataAudit` 标记 author information、contributions、correspondence 与 publisher notes 是已捕获、未发现还是由正文段落承载。
- Supplementary Information 只保留在正文中被引用的内容，不下载 PDF。
- 公式优先使用页面 `.mathjax-tex` 的原始 TeX：Nature equation container 中的 TeX 先冻结为 display 语义，正文中的 TeX 先冻结为 inline 语义，再交给 Defuddle 做 HTML→Markdown；少数异常页面若没有原始 TeX，会进入 warning，而不是伪造 Unicode 公式。
- 输出策略默认是 Markdown 原生脚注：语义 citation marker 只渲染为 `[^n]`，重复引用复用同一个 id，References 只生成一份 `[^n]: ...` 定义，不再依赖 `ref-n` HTML anchor；`links` 仅作为显式兼容模式保留。Quarto 使用稳定的作者-年份 key、`[@key]` 语义引用、同目录 `references.bib` 和 `::: {#refs}` citeproc 目标，不手工复制第二份 bibliography。章节目标使用自然 Markdown slug；Quarto 章节会附加 `sec-` identifier。figure/table/equation cross-reference 仍保留稳定本地目标。
- 下载器记录 figure label、source URL、最终 URL、HTTP/result、content type、local path、fallback 和失败原因；同一 source URL 无论成功或失败只下载一次，并有 20 秒 timeout、20 MiB 单图大小上限和 `image/*` 响应检查。
- writer 会先对远程图片版本 Markdown 做数学验证，再在 staging 目录下载和二次验证；在 `.academic-clipper-locks/` 中为每个竞争 writer 创建唯一 claim，并按 ticket 串行化同一文章。stale 清理只删除已复核的原 claim，因此不会误删刚接管的新 owner；下一次写入仍会恢复明显的 stale backup/transaction，避免无效 Markdown 或失败下载留下新半成品。最终文章使用目录级 replacement，旧 backup 清理失败只记录 warning，不把已成功安装报告为失败。
- 所有外部 resource 使用统一 `safeFetchExternal()`：只允许 HTTP(S)，拒绝明显的 localhost、loopback、link-local、私有 LAN、CGNAT、metadata、multicast 和 IPv4-mapped IPv6 私有地址；请求前解析 DNS 的全部地址，redirect 手动逐跳检查并限制 5 跳。当前没有把已验证地址绑定到 undici 的实际 socket，因此 DNS rebinding 仍是 residual risk；Nature table 还要求每一跳保持在当前 article 的 `/tables/` scope。
- 论文网站 DOM 变化时需要维护 `src/adapters/nature.mjs` 的 selector；同文章的 fragment cross-reference 会转为本地锚点，外部文章的 fragment URL 保持不变；`raw.html`/`cleaned.html` 用于对照定位问题。
