# Experimental RSC：DOM 实证与交接

Work Contract：[Issue #28](https://github.com/uwougil/Academic-clipper/issues/28)；[Draft PR #36](https://github.com/uwougil/Academic-clipper/pull/36)。背景：[Issue #26](https://github.com/uwougil/Academic-clipper/issues/26)。已读 AGENTS、README、PRD/EDD、Issue #10 的 [corpus 规范](specs/issue-10-nature-corpus.md)、[执行计划](plans/issue-10-execution-plan.md)及 acquisition planning；Nature pipeline 只作架构参考。

隔离分支 `codex/rsc-experimental` 从 accepted main `5971ebfbe288e0efed4abef21469f41e2cabb05f` 创建，该 SHA 的 Main CI 成功。范围仅为三个期刊已观察的 Silverchair DOM，不声明 general RSC support，不改变 Nature-only 生产路由或 PRD/EDD。

## 真实全文与同族证据

2026-10-03 侧边浏览器成功读取六篇公开全文，每刊两篇。旧 `en/content/articlehtml/...` 重定向到新平台；取得完整 rendered DOM，未登录、未解决 CAPTCHA、未绕过 paywall。实际最终 URL：

| 期刊 / DOI suffix | 全文 URL | 实证结构差异；完整 DOM 的 figure/table/equation/reference 模型数 |
| --- | --- | --- |
| Materials Horizons / d3mh00787a | https://pubs.rsc.org/mh/article/10/10/4202/813539/A-polymer-library-enables-the-rapid-identification | New concepts、Scheme、表中图片、多级表头/脚注、reference 中货币；5/3/0/72 |
| Materials Horizons / d5mh00096c | https://pubs.rsc.org/mh/article/12/15/5570/897061/Poly-3-hexylthiophene-as-a-versatile | 综述、Wider impact、编号章节与子节、宽表；10/1/0/131 |
| PCCP / d4cp00788c | https://pubs.rsc.org/cp/article/26/24/16972/842764/Out-of-focus-spatial-map-imaging-of-magnetically | 图片公式、MathML 向量与 HTML 下标混合公式、一个编号的三个子表；8/1/3/45 |
| PCCP / d4cp00012a | https://pubs.rsc.org/cp/article/26/15/11445/842411/IR-spectroscopic-characterization-of-M-C-2H-M-Ru | 未编号科学图片、化学电荷/自旋态、跨标签方括号、跨行表格；8/4/0/70 |
| Journal of Materials Chemistry C / d3tc03672c | https://pubs.rsc.org/tc/article/12/2/508/835260/A-combined-experimental-and-modelling-approach-for | 十个 HTML/图片公式、热输运符号、多级表头与 rowspan；9/2/10/62 |
| Journal of Materials Chemistry C / d4tc01199f | https://pubs.rsc.org/tc/article/12/32/12304/877520/Decoding-the-domain-dynamics-of-polycrystalline-0 | 化学计量与晶向、六个 HTML/图片公式、无主文表；13/0/6/106 |

Figure 模型包含 graphical abstract 与 Scheme；equation 只计带 ID 的 `.disp-formula`，不把未编号图片误算为编号公式。

六篇均观察到相同 family：`citation_title/author/doi/journal_title`；`.article-body .widget-ArticleFulltext` 与 `widget-items[data-widgetname="ArticleFulltext"]`；`.jumplink-heading[data-section-title]` 与 `.article-section-wrapper`；`.fig[data-id]` / `.fig-label` / `.fig-caption`；`.table-wrap` / `.table-wrap-title` / `.table-overflow > table` / `.table-modal` 重复表 / `table-wrap-foot`；`.xref-bibr[data-modal-source-id]` 指向 `.ref-list [data-content-id="citN"]`；内部链接 `reveal-id`；`.formula-wrap` / `.disp-formula[id="jumplink-eqnN"]`。图片的 `data-src` 是资源，`src` 可能是 preloader。部分公式有 `mjx-assistive-mml math`，不能假设所有公式可获得 TeX。

实际子树支持一个受限 family adapter；共同域名或相似 URL 不是结论依据。其他 RSC 期刊、旧平台、editorial/correction 及异常结构未经验证。

## 实现与入口

- `src/adapters/rsc.mjs`：URL/全文 admission、metadata、publisher DOM、重复控件清除、图表/引用/内部目标提取、科学字体与有限 MathML 向量/overline 保护。所有 RSC DOM 知识在此文件。
- `src/experimental/rsc-clip.mjs`：直接 `clipRsc({ html, url, citationStyle })`；接受已加载全文 HTML 与实际最终 URL，不 fetch、不写文件。
- 复用既有 Defuddle `htmlToMarkdown()`、`withDomGlobals()`、math/academic-inline/citation/anchor normalizers、figure captions、逐子表 table normalizer、`renderClipMarkdown()`、output policy 与四类 validators。明确选择正文 root 后使用 Defuddle 转换；未复制 Nature selectors。
- Markdown / links / Quarto；Quarto 返回 `referencesBib`，保留 source note 和 DOI 的 `@misc`，不猜 bibliography author/title fields。调用方须保存该 bibliography；生产 writer 尚未接入。

```js
import { readFile } from 'node:fs/promises';
import { clipRsc } from './src/experimental/rsc-clip.mjs';
const result = await clipRsc({
  html: await readFile('test/fixtures/rsc/d4cp00788c.html', 'utf8'),
  url: 'https://pubs.rsc.org/cp/article/26/24/16972/842764/Out-of-focus-spatial-map-imaging-of-magnetically',
  citationStyle: 'markdown',
});
console.log(result.markdown, result.debug);
```

## Fixtures 与验证

`test/fixtures/rsc/`：六对真实节选 HTML / publisher-local provenance JSON；`test/rsc.test.mjs`：26 focused tests（六个 source oracle、十八个三模式渲染检查、两个拒绝/确定性检查）。覆盖 metadata/authors/DOI、章节层级、figure/caption/Scheme、cells/rowspan/多级表头/脚注、三个子表、原编号 citation/reference/DOI、内部图表/公式目标、MathML 向量、HTML 科学记号、图片公式 warning、货币与跨标签括号。

Provenance 保存实际 URL、capture time、DOM serialization hash、retained locator/subtree hashes、fixture hash、删减说明、直接从 source DOM 提取的 oracle（未调用 adapter）。没有 HTTP response bytes，因此 `responseSha256` 为 null，明确区分 DOM hash。完整 captures 只在仓库外临时目录，不提交 raw pages、cookie、token、签名参数、chrome 或 credentials。

`scripts/rsc-excerpts.mjs <external-capture-directory>` 可从 `{url, observedAt, head, body}` 捕获格式重建。保留真实子树/祖先，不重写学术内容；移除重复 modal、控件、reference discovery links 与 CDN query signatures，保留原引用 DOI。节选引用不重编号，保留所需最高编号以前的 source references 以满足既有 sequential validator。不是完整论文，未创建全局 corpus schema。

本地验证：`node --test test/rsc.test.mjs` 26 passed；`npm test` 136 passed；`npm run build` 成功；`npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` 全部 valid；`git diff --check` 通过。另对六个完整 browser DOM 做仓库外直接 Markdown smoke，四类 validators 均 valid；这不是常规网络 CI，也不是全文忠实度的独立 oracle。CI 保持 Ubuntu Node 20/24、Windows Node 24。

## 限制、访问与集成边界

2026-10-02 web / 本地 HTTP 曾遇 403 / Cloudflare；系统 DNS `198.18.0.252` 被现有安全检查正确拒绝。2026-10-03 browser 全文解除来源 blocker，但不能保证 bridge/CLI HTTP 自动抓取可行。安全代码未放宽。`d3mh00572k` 与 `d3mh00594a` 实际重定向 `article-abstract/...?...redirectedFrom=fulltext`，明确显示无权限/购买入口；不能算全文。实验入口拒绝 abstract URL、缺正文/metadata、challenge、unauth、不同 journal/canonical identity。

- 图片公式及未编号科学图片保留图片/原编号/上下文并 warning；不 OCR、不编造 TeX。HTML 公式保留原记号。有限 MathML 只转换实证 mi/mn/mo/mrow/mover 向量/overline；其他交给 Defuddle，必须查看返回 validator 状态，不声称全量数学支持。
- Markdown 的图/表/公式 crossrefs 按既有 policy 降为标签；links 保留锚点；Quarto 支持 figure/table/section，未具备 display TeX 的 equation links 降级并 warning，不建伪造 equation identifier。
- 未找到的内部目标、ESI/modal notes 与 table note links 保留标签并 warning；主文表脚注内容保留。Supplementary PDF、PDF-only、author affiliation/对应作者面板、资产下载及离线图片未接入。
- 签名图片会到期，运行时保留 URL 并 warning。fixture 删 query 只验证 URL 选择/渲染，不保证 unsigned 图片可下载。多级表头/rowspan 使用既有 pipe-table 展平，占位和 values 保留，不复刻布局；无 HTML cells 的表 warning。

Exact changed shared files：**无**。PRD/EDD、README、package.json、CI、production router/fetch/bridge/security/writer、shared normalizers、Nature adapter/golden/corpus 均未改。

最小集成提案（未实施）：integrator 决定 `src/clip.mjs` 的有限 adapter dispatch；`src/bridge.mjs` 与 `src/cli.mjs` 的 `clipNature()` 调用点转向该 dispatch；CLI admission 和 `src/article-fetch.mjs` 添加 RSC URL/逐跳 identity scope；writer 保存实验返回的 bibliography/图片。维持 loopback/Origin/token、DNS/redirect/size/type 及事务写入边界。正式支持须人类解决 Nature-only PRD/EDD。无 universal Publisher class、router redesign、common verifier 或 shared normalizer API 提案。

Shared seam 观察：cached Defuddle 保留首个 DOMParser realm，关闭该 window 会破坏后续转换。实验入口只保留首个 realm，转换后关闭后续 article windows，逐子表转换之间让出 event loop，使 shared converter 创建的 jsdom WeakRefs 可回收；不修改 shared API。初始 CI run 37133335515 的 RSC test worker 遇到 2 GiB heap OOM，修复 lifetime 后追加 `node --max-old-space-size=512 --test test/rsc.test.mjs`，26 passed。不以提高 CI heap 或修改全局测试配置掩盖问题。统一 converter realm 回收仍应由独立集成工作处理。

Merge blockers：Draft review 与最终 head CI；production routing、fetch 可用性、离线资产、正式 publisher intent resolution 是后续集成边界，不将此实验当作正式产品支持。Issue #28 保持 open，交给 AGENTS 的 Main CI 协议；只用 `Refs #28`，不 auto-close。
