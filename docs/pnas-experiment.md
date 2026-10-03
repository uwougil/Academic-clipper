# PNAS 实验适配器与来源证据

状态：2026-10-03，独立实验入口已实现，Draft PR 待审查；正式 browser/bridge/CLI 支持仍限 Nature。

## Work Contract 与边界

[Issue #31](https://github.com/uwougil/Academic-clipper/issues/31) 是独立 Work Contract；[Issue #26](https://github.com/uwougil/Academic-clipper/issues/26) 是后续 publisher roadmap。已阅读 AGENTS.md、README.md、PRD/EDD、Issue #10 及其 corpus specification/planning docs、Nature adapter/shared pipeline。

隔离分支 `codex/experimental-pnas` 从已通过 Main CI 的 main `5971ebfbe288e0efed4abef21469f41e2cabb05f` 创建。用户授权隔离实验；不修改 PRD/EDD、不启用全局 publisher router、不扩展 extension 权限、不修改 corpus schema/live verifier/security guard。

交付前 main 已接受 Wiley/APL 实验，遂 rebase 到已通过 Main CI 的 `1597cc2ebf6d92ab24bb243f77230a1e9cc18641`（run `37111979056`）。仅 `.gitattributes` 发生冲突，保留 AIP 与 PNAS 的两条 scoped LF rules；重新阅读已合入 PRD/EDD 的 APL 例外，保留其 route/intent。本 PNAS diff 不新增默认 routing 或更改已接受实现。

实现为 `src/adapters/pnas.mjs` 和 `src/pnas-clip.mjs`。唯一 shared source 修改是导出已有 `referencesMarkdown()`；复用 Defuddle HTML→Markdown、academic normalizers、renderer、validators 和 writer。

## 当前平台与真实 DOM family

平台为 **Atypon Literatum**，适配依据是 **PNAS 当前 core article DOM**。[Atypon 的 PNAS.org tour](https://www.linkedin.com/posts/atypon_an-insiders-tour-of-pnasorg-on-literatum-activity-6971471851113832448-IcUV) 是历史证据；当前 page head 包含 `vendors~lazy-imports~literatum-auth~literatum-commerce-*.js`、`AxelPublicationContent-*.js`、`/products/pnas/releasedAssets/` 和 `tex-mml-chtml.js`，与实际 core DOM 相符。平台品牌不推出通用 selector。

- `#abstracts > .core-container > section` 分别有 Significance (`#executive-summary-abstract`) 和 Abstract (`#abstract`)；同区 signup UI 不属于这些 section。
- `section#bodymatter[property="articleBody"] > .core-container` 为正文；`div[role="paragraph"]` 表示段落，嵌套 section/h2/h3/h4 表示层级。
- `.display-formula#eqnN` 含 equation 与 sibling label；MathJax CHTML 和 `mjx-assistive-mml > math` 同时存在。gossip DOM 没有 TeX script/annotation。
- `figure.graphic#fig01` 内有 img/figcaption；编号及 Viewer button 在外部 wrapper。新图片用 `assets/images/large/*.jpg`，2014 内容用 `assets/graphic/*.jpeg`。
- `figure.table#t01` 内有真实 table；collapsed wrapper 的部分 tr 带 `hidden`，不是缺失或访问限制。
- `a[role="doc-biblioref"][data-xml-rid="rN"]` 指向 collateral IDs `#core-collateral-rN`；真实 bibliography 使用 `.biblioentry`、source label、`#rN .citation-content`。1–3 等范围只有端点 anchors。
- `#tab-contributors` 暴露 RDFa authors/affiliations/notes；`#tab-information .core-history` 与 citation metadata 区分 online/issue dates。
- body/backmatter 和 collateral panes 重复图注、文献、data/acknowledgments；adapter 只选 authoritative article roots。

## 检查过的公开文章

| URL | 访问与结构证据 | 接纳范围 |
| --- | --- | --- |
| [A mechanistic model of gossip, reputations, and cooperation](https://www.pnas.org/doi/10.1073/pnas.2400689121) | FREE ACCESS；Significance/Abstract、h2/h3/h4、22 display formulas、4 图、68 文献、多邮箱 correspondence、change history | 完整 intro/sec-1、fig02 及原 ancestor path/headings、完整 abstracts/backmatter/bibliography/author/info panes。fixture 含 6 display/100 inline MathML（含图注）、2 图、68 文献；其余长正文省略。 |
| [Evaluating language models for mathematics through interactions](https://www.pnas.org/doi/10.1073/pnas.2318124121) | OPEN ACCESS；14 作者、19 author-affiliation associations、深层章节、符号 prose notes、GitHub/data/SI CSV/PDF | 完整 selected article roots/metadata panes；2 display/32 inline MathML、3 图、69 文献。 |
| [Active learning increases student performance in science, engineering, and mathematics](https://www.pnas.org/doi/10.1073/pnas.1319030111) | OPEN ACCESS；2014 内容迁移到当前 DOM、10 行表格/colspan、currency、legacy supplementary links | 完整 selected article roots/metadata panes；1 table（含 hidden 最后行）、3 图、51 文献。 |
| [Explaining neural scaling laws](https://www.pnas.org/doi/10.1073/pnas.2311878121) | 早期 web rendered-text 调研候选 | 未接纳 DOM fixture，不能计入结构覆盖。 |

早期 `/doi/full/10.1073/pnas.1915321117` 探测失败。PMC/PNAS Nexus DOM 未作为 PNAS source 替代。

## 获取、动态加载与 access 差异

初始终端请求 403，`safeFetchExternal()` 正确拒绝本机 DNS 的私有地址 `198.18.1.3`；初始浏览器曾 `ERR_CONNECTION_CLOSED`。用户要求重试侧边浏览器后，三篇均正常加载全文。没有操作登录、CAPTCHA、credentials 或访问控制；终端不可访问不等于浏览器不可访问。没有新生产网络请求或复制 cookies/headers/tokens。

对 active-learning tab 的普通 reload 进行 CDP 被动观察：document HTTP 200，响应 HTML 241,963 characters 且完整闭合，已包含 `#bodymatter`、最终表格值 `0.580`、最终文献 `#r51`。loaded DOM 有 10 行表格和 51 文献；普通折叠操作的观测窗口内没有新增内容请求。**该文章的表格/文献无需动态 endpoint**。

同时观察 recommendations、locales、`/action/getFtrUpdate`、metrics 和站点 challenge 资源；不复放内部 endpoint。MathJax 排版和附属 UI 可以继续变化。gossip reload 的 network event buffer 被截断，不能据此证明其 server HTML 或所有文章均静态。adapter 接收已取得的 HTML/loaded DOM；未暴露 table 使用原页链接 fallback，缺少 assistive MathML 明确失败，不做动态 hydration。

FREE ACCESS 与 OPEN ACCESS 是不同标签，不能推断成相同授权或永久全文权限。没有 subscription-only/preview 真实 fixture；preview/challenge rejection 为明示 synthetic variation。新发表付费文章、机构 access、cookieAbsent/地区差异未验证。

## Corpus provenance 与 focused tests

`test/fixtures/pnas/manifest.json` 是实验本地 provenance 清单，不是共享 schema。记录 URL、`browser-loaded-dom-blocks`、各导出 block 的文件 mtime UTC/hash、fixture hash/bytes、sanitation/omissions。hash 不是 HTTP response hash，mtime 是实际导出时间而非服务器 publication time。raw captures 在外部临时目录，不提交。

大小分别 133,599、154,793、87,030 bytes；低于 Issue #10 的 256 KiB ceiling。第二篇略超通常 150 KB 建议区间，以保留完整深层正文/notes/refs。sanitizer 仅保留 citation head metadata；删除 scripts/frames/styles/event handlers、reference 返回菜单/Scholar/PubMed UI、重复 visual `mjx-math`；保留原 assistive MathML ancestry、reference numbering、hidden table rows 和 scholarly links。gossip fig02 未移动到人造 section，未重写学术文字。

`node scripts/prepare-pnas-fixtures.mjs <temporary capture directory>` 离线复现 sanitation。输入为 `pnas-<id>-block0/1/2/3/6/7.html`；gossip body 用分块导出后长度核对为 587,545 characters 的 `pnas-2400689121-body-complete.html`。长 `evaluate` 曾截断整页字符串，未使用这些截断导出。

16 个 focused tests 覆盖 hash/topology、title/DOI/journal/online/issue/history dates、完整 authors/affiliations/correspondence、abstract、section hierarchy、MathML/上下标/公式、caption boundary/去重、colspan/hidden rows、原 reference labels/DOI/ranges、equation/figure/table/caption crossrefs、SI/data/legacy links、currency/prose-note symbols、UI cleanup、URL/identity/preview rejection、三种 dialect 的 production validation/determinism。synthetic 缺表/额外 UI case 不算真实 corpus。

还对未提交的完整 gossip body blocks 手动验证（4 图、22 display/369 inline MathML），发现并修复 Quarto caption crossrefs。手动检查不扩大 committed excerpt 的 coverage。

## PNAS quirks、限制与后续 Contract 影响

1. Placeholder `alttext="No alternative text available"` 会导致 Defuddle 输出错误替代文本；仅清除该 placeholder，保留 MathML。单独转换每棵 MathML，再进入既有 typed markers，避免 math/prose delimiter 拼接。
2. `mfenced[separators=""]` 可让 Defuddle 拼成非法 `\cdotr`；PNAS 边界展开为等价 mrow/原 fence characters，转换仍由 Defuddle 完成，没有另写 TeX parser。
3. gossip **eqn6** 的公开 MathML 原本有 `open="(" close="("`；没有原 TeX 可核对。保留源并发出 debug warning，不推测作者修正。delimiter validation 不证明数学正确性或 TeX 排版。fig02 等源文案/punctuation 异常也不静默改写。
4. 普通 Markdown 按既有 policy 将 figure/table/equation 内链降为文本；links/Quarto 保留目标。prose notes/omitted targets 保留原页 fragment URL；未暴露 author 信息不猜测。BibTeX inference 继承 shared renderer 的限制，完整 reference text 在 note 中。
5. tables 仍按 shared renderer 放末尾 `## Tables`；保留多行 header/colspan/data cells，但不声称视觉复刻。没有下载 SI/图片；remote fallback/security writer 可复用，当前环境下载未验证。
6. 部分来源 note URLs 原本类似 `http://https/://proofwiki.org`；不按 label 猜测并修复。
7. 后续 Publisher Adapter Contract 应分别记录 publisher/platform/DOM family；明确 DOM vs response provenance、author pane/body ownership、placeholder alttext、MathML/TeX source quality、隐藏内容、range/reference identity、caption crossrefs、access 状态。本实验不添加 hierarchy/router/corpus/live-verifier 抽象。

## 实验入口与 merge blockers

显式调用 `clipPnas({ html, url, citationStyle: 'markdown' | 'links' | 'quarto' })`（`src/pnas-clip.mjs`），输入为公开取得的 HTML/loaded DOM，函数不 fetch。检查返回 `debug.warnings`/四项 validators；有效 result 可交给 `writePaper(result, { libraryPath, downloadFigures: false })`。`metadata.date`/frontmatter 使用 online date，issue/history 在 `metadata.dates`。未接入 extension/bridge/CLI。

Draft 交付需当前 commit 的完整 CI 与代码审查；eqn6 来源异常、真实 preview/付费样本缺失、原 TeX/公式排版未核验是**提升为正式 PNAS 支持的 blockers**。正式 browser/bridge/CLI integration 需要人工解决 Nature-only intent 并更新 PRD/EDD。不要自动 merge 或关闭 Issue #31。

## Verification（历史：最初基线及 `1597cc2` 集成）

Windows Node `v24.14.1`。最终命令/精确结果/PR CI 记录于 Draft PR delivery contract；研究-only commit 的 CI 不代表后续实现 commit 已验证。

- `npm ci`：exit 0，65 packages，0 vulnerabilities（隔离 worktree 初始化）。
- `node --test test/pnas.test.mjs`：exit 0，16/16 pass，0 fail/cancelled/skipped/todo。
- `npm test`（初始基线）：exit 0，126/126 pass，0 fail/cancelled/skipped/todo，11,953.5386 ms。
- rebase 后完整 `npm test`：169/169 pass，0 fail/cancelled/skipped/todo，14,095.5382 ms；首次执行为 168 pass/1 fail，既有 launcher 第 1 个启动测试偶发 10s timeout（23,075.8361 ms），未经代码改动完整重跑通过。
- `npm run build`：exit 0；输出为 ignored `dist/extension/`。
- `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`：exit 0；所有 validators valid，250 inline/13 display math、50 reference definitions。

## Final integration validation：Nature / Wiley / APL / IOP / PNAS

本节替代历史验证作为当前集成交付依据，不删除此前来源证据或失败记录。这次只 rebase、审计、验证并更新交付文档，没有新增功能、修改 assertions 或改变生产路由。

| 项目 | 本次证据 |
| --- | --- |
| Old base | `1597cc2ebf6d92ab24bb243f77230a1e9cc18641` |
| New accepted base | `07a4ee4df285c4c0f27b5058e041fce7eb96fee5`，Main CI run `37131882128` success，包含 IOP #37 |
| Old PR head | `e8ef378c37e4d2bcf594e3e986355f358d5c2757` |
| Rebased implementation head | `6fc351f14893138f1010f4d07e33746061e7c47c` |
| Final delivery head / CI / Secret scan | 文档提交后的精确 head SHA、fresh CI/Secret scan run IDs 与各 job conclusion 记录于 [PR #38 的 Final integration validation](https://github.com/uwougil/Academic-clipper/pull/38)。不以历史 green checks 代替新 head 检查。 |

执行 `git rebase 07a4ee4df285c4c0f27b5058e041fce7eb96fee5` 无冲突。随后：

```text
git range-diff 1597cc2ebf6d92ab24bb243f77230a1e9cc18641..e8ef378c37e4d2bcf594e3e986355f358d5c2757 07a4ee4df285c4c0f27b5058e041fce7eb96fee5..6fc351f14893138f1010f4d07e33746061e7c47c
1: 645c3ed = 1: aa02f45 docs(pnas): record source acquisition evidence and implementation blockers
2: a6af76f = 2: 21bdd26 feat(publisher): add experimental PNAS core DOM adapter
3: e8ef378 = 3: 6fc351f test(pnas): verify abstract prose and document accepted-main rebase
```

三个补丁均 `=`，没有语义变化。`git diff --exit-code e8ef378... 6fc351f... -- src/adapters/pnas.mjs src/pnas-clip.mjs src/clip.mjs test/pnas.test.mjs test/fixtures/pnas .gitattributes` exit 0；后续仅增补本次交付文档。

本地 Windows Node `v24.14.1`：

- `npm ci`：exit 0，65 packages installed，66 audited，0 vulnerabilities。
- `node --test test/pnas.test.mjs`：exit 0，16/16 pass，0 fail/cancelled/skipped/todo，20,357.8349 ms；count/assertions 均未改变。
- `npm test`：exit 0，**187/187 pass**，0 fail/cancelled/skipped/todo，14,429.5508 ms。覆盖 Nature、Wiley、APL、IOP、PNAS，并包含安全、writer、issue-finalization、CLI/extension checks；本次未发生历史 launcher timeout。
- `npm run build`：exit 0。
- `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`：exit 0，所有 validators valid，250 inline/13 display math、50 reference definitions。
- `git diff --check`：exit 0。

### IOP 共存与执行顺序审计

两个独立 Node 进程分别采用 `IOP → PNAS → Nature → APL → Wiley` 和 `PNAS → Wiley → APL → Nature → IOP` 初始化转换器。使用既有 source fixtures：PNAS gossip、Nature minimal、APL 3297874、Wiley advs、IOP aeaa68 math+crossrefs（按已接受 IOP 测试相同方式拼接 source blocks）。IOP math-only excerpt 没有 prose paragraph，单独输入会按既有 guard 拒绝；没有通过修改 IOP 或放宽 guard 来进行审计。

每个进程均比较五种 publisher 的 baseline Markdown；对 PNAS 的 markdown/links/quarto 分别在其他四种转换之间执行 A→B→A，结果逐字相同；`Promise.all()` 同时运行五种转换，结果也与各 baseline 逐字相同。每次调用及全部并发结束后，十个 DOM globals 的 property presence 和 object identity 均恢复到调用前 snapshot。

从 `clip.mjs`、`pnas-clip.mjs`、`wiley-clip.mjs`、`iop.mjs` 遍历 22 个可达本地静态模块，DFS 检查 cycles=0。publisher 入口使用不同模块/导出名；没有引入同名全局 helper。PNAS/IOP/Wiley/APL fixtures 分属独立路径。APL/PNAS root LF rules、Wiley subtree LF rules 保持原样；IOP integrity test 自行 canonicalize LF/CRLF，无新增 IOP/global gitattributes rule。

### 最终 diff 边界

相对 new base，完整 changed-file set 为 **13 paths**：

```text
.gitattributes
README.md
docs/pnas-experiment.md
scripts/prepare-pnas-fixtures.mjs
src/adapters/pnas.mjs
src/clip.mjs
src/pnas-clip.mjs
test/fixtures/pnas/1319030111.html
test/fixtures/pnas/2318124121.html
test/fixtures/pnas/2400689121.html
test/fixtures/pnas/README.md
test/fixtures/pnas/manifest.json
test/pnas.test.mjs
```

唯一 shared source diff 仍是导出已有 `referencesMarkdown()`；`.gitattributes` 只增加 PNAS fixture LF rule。Wiley/APL/IOP/Nature adapter、bridge、extension、CLI、writer behavior、normalizers、PRD/EDD、CI/issue-finalization workflows、Nature golden 均与 accepted main 完全相同。没有把 PNAS 加入 `clipArticle()`。

这是 reviewable experimental PNAS reference implementation：真实 paid/subscription-only coverage 不完整、access 会变化、MathML/TeX 来源可能异常、production integration 不在本次范围、其他 Atypon compatibility 未建立、最终 Publisher Adapter Contract 尚未解决。保持 Draft，不 merge，不手动关闭 Issue #31。
