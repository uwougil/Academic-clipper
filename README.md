# Academic Clipper — Nature prototype v0.2

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

- `src/adapters/nature.mjs`：仅针对 Nature 当前 DOM；读取 `citation_*` metadata、`.c-article-body`、公式、figure、Extended Data figure、table link 和 `ol.c-article-references`。
- `src/clip.mjs`：把 Nature 结构交给 Defuddle，恢复语义 placeholder、生成稳定的 figure/reference Markdown，并生成 front matter。
- `src/normalizers/math.mjs`：恢复 DOM 已判定的 inline/display TeX；保留原始下标和矩阵行分隔。
- `src/normalizers/academic-inline.mjs`：把学术 `<sub>/<sup>/<i>` 组合转成可读的 Markdown/Quarto 行内表达式。
- `src/normalizers/citations.mjs`：统一本地引用链接和 section/equation 锚点。
- `src/normalizers/figures.mjs`：渲染短 alt、单次 caption、主图/Extended Data 图和表格链接。
- `src/bridge.mjs`：`127.0.0.1:34123` 的极小 HTTP bridge，接收 HTML、写入本地文件。
- `extension/`：极简 Manifest V3 popup，只有 Save Paper 和 Preview Markdown。
- `test/fixtures/nature-minimal.html`：小型 fixture，不把整篇 Nature HTML 永久塞进单元测试。

## 安装和运行

需要 Node.js 20 或更高版本。

```bash
npm install
copy config.example.json config.json   # Windows PowerShell 可用 Copy-Item
npm run dev
```

默认配置把文件写入项目下的 `papers/`。可以把 `config.json` 改成任意本地知识库目录；相对路径相对于配置文件所在目录解析：

`papers/`、`node_modules/`、`dist/` 和本地 `config.json` 默认不提交到 Git；目标论文的本地生成结果保留在开发工作区中，仓库只提交可复现的代码、fixture 和配置模板。

```json
{
  "libraryPath": "./papers",
  "port": 34123,
  "downloadFigures": true,
  "saveDebug": false
}
```

默认会把 figure 下载到 `papers/<article-id>/figures/`，并在 `index.md` 中使用相对路径。若确实需要远程图片，可在配置中设置 `downloadFigures: false`，或使用 CLI 的 `--no-download-figures`。

也可以直接使用 CLI 验证目标论文：

```bash
npm run clip:live
```

或显式指定输出和调试文件：

```bash
node src/cli.mjs --url https://www.nature.com/articles/s41586-026-10401-1 --output ./papers --debug
```

验收 live regression（包含本地图片下载）：

```bash
node src/cli.mjs --url https://www.nature.com/articles/s41586-026-10401-1 --output ./papers --debug --download-figures
```

## 浏览器扩展

1. 先保持 `npm run dev` 运行。
2. Chrome/Edge 打开 `chrome://extensions`，启用 Developer mode。
3. 选择 Load unpacked，指向本目录的 `extension/`；执行 `npm run build` 后也可以指向 `dist/extension/`。
4. 打开 Nature 论文，点击扩展图标，再点击 Save Paper。

成功状态类似：

```text
Saved:
s41586-026-10401-1/index.md
```

扩展通过 `chrome.scripting.executeScript` 读取当前 DOM，因此适合已经加载完成的 Nature article 页面；Chrome 内置页、PDF viewer 等不可注入页面会显示失败原因。

## 调试与测试

```bash
npm test
npm run build
npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md
```

`--debug` 会在论文目录保存 `raw.html`、`cleaned.html`、`debug.json`，并在 CLI 输出：publisher、article root、metadata source、paragraph/equation/figure/reference 数量、移除节点数和 warnings。

`validate:paper` 会对最终 `index.md` 做 lexical math delimiter validation，检查 inline/display math 是否闭合、是否跨 Markdown block、是否出现非法 `$`/`$$` 邻接、legacy delimiter 或 semantic marker。验证失败时返回 non-zero，不会由 writer 静默写出该文件。Pandoc/Quarto 不是运行时依赖；如果本机已安装，可另行执行 `pandoc index.md -o /tmp/academic-clipper.html` 或 `quarto render` 做可选 parser smoke test。

## 当前实测范围和已知问题

目标论文目前由 Nature 页面提供：6 位作者、DOI `10.1038/s41586-026-10401-1`、正文 13 个公式节点、3 个主图、4 个 Extended Data 图和 50 条参考文献。v0.2 默认下载 7 张图到 `figures/`，主图通过稳定 placeholder 保留在正文附近，Extended Data 图单独放入 `## Extended Data`。

已知边界：

- 只支持 `www.nature.com/articles/<id>`，没有提前抽象其他出版社。
- Nature 的两个在线表格只保留标题和 Full size table 链接；没有抓取表格详情。
- Supplementary Information 只保留在正文中被引用的内容，不下载 PDF。
- 公式优先使用页面 `.mathjax-tex` 的原始 TeX：Nature equation container 中的 TeX 先冻结为 display 语义，正文中的 TeX 先冻结为 inline 语义，再交给 Defuddle 做 HTML→Markdown；少数异常页面若没有原始 TeX，会进入 warning，而不是伪造 Unicode 公式。
- 引用统一为 `[n](#ref-n)`，References 只由本原型生成一份，并为每条文献提供 `ref-n` anchor；figure/table/equation/section cross-reference 在目标存在时改为本地 anchor。
- 下载器记录 figure label、source URL、HTTP/result、local path 和失败原因；同一 source URL 只下载一次。
- 论文网站 DOM 变化时需要维护 `src/adapters/nature.mjs` 的 selector；`raw.html`/`cleaned.html` 用于对照定位问题。
