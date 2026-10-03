# IOPscience / 2D Materials 实验

状态：未完成，浏览器 DOM 采集已恢复；全文适配器与代表性 coverage 正在实现，不得集成或宣称支持。Work Contract：[Issue #29](https://github.com/uwougil/Academic-clipper/issues/29)。

## 浏览器来源更新（2026-10-02）

用户指出侧边浏览器可用后，重新读取现有 tab：`https://iopscience.iop.org/article/10.1088/2053-1583/1/2/025001` 已成功显示真实页面，含 citation metadata、13 位 authors 与相邻 `citation_author_institution`、摘要和公开 references 控件。`.wd-jnl-art-turn-away-panel` 明确说明当前机构未订阅，正文未提供。浏览器渠道可读取 DOM；下文早先 web/terminal 失败不代表 browser 当前状态。

从该页真实 journal link 进入 `https://iopscience.iop.org/journal/2053-1583`，点击标记 Open Access 的 `https://iopscience.iop.org/article/10.1088/2053-1583/aeaa68`，成功获得全文。其标题为 Tuning magnitude and direction of lattice thermal conductivity in transition metal dichalcogenide heterobilayers，authors 为 Elliot Perviz / Antonio Cammarata，`citation_online_date=2026/10/01`。已确认：

- `.wd-jnl-art-full-text[itemprop=articleBody]` 包含正文；`h2/h3.header-anchor` 使用文章前缀 section IDs。
- `.inline-eqn` 与 `.display-eqn` 保留 `script[type="math/tex"]` / `script[type="math/tex; mode=display"]` 的原 TeX，另有 image fallback 与渲染后 MathJax。不能同时转换这些重复表示。
- `figure[data-toolbar-type=figure]` 包含嵌套 figure、caption 和 lazy image `data-src`，standard/high-resolution 链接指向 `content.cld.iop.org`。
- `#tdmaeaa68t1` 是正文实际 HTML table，cells 中亦有 inline TeX；并非只提供外部 table link。
- 正文 `a.cite` 指向 `bib*`，range 可用两端 links 与 intervening dash 表示。References 点击后显示 loading，再生成 `li[data-reference][id]` 与 `cite`、DOI/Crossref/backlink；故 references 至少在所观察 UI 中按需加载。
- 页面显示 Supplementary data 和 Data availability statement，后者链接 `https://doi.org/10.5281/zenodo.19881818`。

以上来自 rendered DOM。server-side response 完整性尚未确定，不能从已加载 DOM 推断。OA 与 subscription 差异已观察到 full-text root vs turn-away panel，但更多文章仍需调研。

第二篇开放全文 `https://iopscience.iop.org/article/10.1088/2053-1583/aeaa6b`（Optomechanical method for characterizing thermal transport across suspended van der Waals interfaces）也从期刊页的 Open Access link 发现。其 full-text root 可用，4 个 display equations，两个 HTML tables 分别为 3 rows × 8 columns / 4 rows × 4 columns（包含 header row）。补充链接为 `/article/10.1088/2053-1583/aeaa6b/data`，data availability 表示数据包含在 article/supplementary files，区别于 aeaa68 的外部 Zenodo link。全文包含 2 个原生 sup、未见原生 sub，其他上下标通过 TeX 表示；这些是 full-page observations，尚非 excerpt tests。

新增 `aeaa68-math.excerpt.html` / `aeaa68.provenance.json`：保留真实 head metadata 与首个 display equation 的来源种子；明确 scaffold、删除项、non-original adjacency、rendered DOM capture 与无 HTTP-byte hash 的限制。首个真实 identity test 通过；此 reduced excerpt 尚未承担完整结构 coverage。`citation_online_date` 已据来源加入 date precedence。后续需要更多实际 blocks、独立 source oracle、equation/figure/table/reference/crossref rendering tests，不能把 7/7 focused preflight tests 宣称为 full-text 验收。

已加入 `extractIopMath()`，只提取实际 `.inline-eqn/.display-eqn` 内 script TeX，忽略 duplicate image/rendered MathJax；没有源 TeX 的 node 返回明确 warning，image-only reference equations 尚不转换。真实首个 equation 的 exact source TeX（含内部 whitespace 与 tag 1）断言通过；当前 focused tests 为 8/8。`parseIopPage()` 仍拒绝全文输出，待剩余 extraction/rendering/validation 完成。

基线为 accepted main `5971ebfbe288e0efed4abef21469f41e2cabb05f`，对应 [成功 Main CI](https://github.com/uwougil/Academic-clipper/actions/runs/37037473932)。隔离 branch 为 `codex/iop-2d-materials`。已读取 AGENTS.md、README、PRD/EDD、Issue #26、Issue #10 canonical spec/execution plan 及 Nature adapter、Defuddle、normalizers、validators、writer 与安全边界。

## 早期访问失败记录（2026-10-02，browser 更新前）

下表记录访问尝试，不等于已检查文章全文 DOM。

| 文章 URL | 渠道与结果 |
| --- | --- |
| https://iopscience.iop.org/article/10.1088/2053-1583/1/2/025001 | web reader：restricted URL；普通 in-app browser：`net::ERR_CONNECTION_CLOSED`；同文章 `/meta` guarded transport：DNS 安全拒绝 |
| https://iopscience.iop.org/article/10.1088/2053-1583/3/3/031012 | web reader：not accessible；同文章 `/meta` guarded transport：DNS 安全拒绝 |
| https://iopscience.iop.org/article/10.1088/2053-1583/ad77e0 | web reader：restricted URL；同文章 `/meta` guarded transport：DNS 安全拒绝 |
| https://iopscience.iop.org/article/10.1088/2053-1583/ac5d0e | web reader：restricted URL |
| https://iopscience.iop.org/article/10.1088/2053-1583/ae2b82 | web reader：restricted URL；从 IOP China 的真实 article link（带 utm 参数）点击同样拒绝 |

系统 `Resolve-DnsName iopscience.iop.org` 返回 `198.18.1.5`，处于既有 security.mjs 拒绝的 benchmark 地址范围。guarded transport 在 HTTP 之前拒绝，故未收到 article HTTP body、status 或 content type。未更换 resolver、覆写 IP、绕过 URL/DNS 检查、使用代理、登录或破解 challenge。

可访问的身份旁证：

- [IOP China roadmap 介绍](https://china.ioppublishing.org/news/2dm-yan-jiu-lu-xian-tu-er-wei-cai-liao-lu-xian-tu/) 提供 `ae2b82` article link、title 与作者名单；该页面是推广页，不是 IOPscience article DOM。
- [Caltech author record](https://authors.library.caltech.edu/records/8vz1q-3tj40) 提供 `10.1088/2053-1583/3/3/031012`、journal 与作者信息；其开放文件为 submitted manuscript，不证明 publisher HTML 开放。
- [CNR author record](https://www.imm.cnr.it/node/54183) 是 `ad77e0` 的候选身份线索，不能作 full-text DOM fixture。

没有将上述第三方/推广页改写成 IOPscience HTML，也未把文章内容编写到真实 DOI 下。

## 已实现范围与测试证据

`src/adapters/iop.mjs` 仅实现 experimental preflight：严格限制 2D Materials 已见现代/旧式 DOI URL family；读取候选 `citation_*` head metadata；对 DOI、journal、canonical 冲突拒绝；metadata 缺失返回 null。`authorInformation` 明确为 null。`parseIopPage()` 始终以 `IOP_DOM_UNVERIFIED` 拒绝转换。

此 API 是本实验的临时本地接口，不是 proposed shared adapter contract，也不是可用 full-text adapter。没有接入 CLI、bridge、extension、writer 或 universal router；没有新增 fetch。JSDOM 不执行 scripts 或载入远程资源，且及时关闭 window。

`test/fixtures/iop/synthetic-head.html` 在文件中标记 SYNTHETIC。它只测试候选 head convention，并不算 source-backed fixture 或 journal DOM evidence。focused tests 检查 ordered metadata、URL 范围、identity conflicts、preview/full-text fail-closed、DOM isolation 与 Nature entry point 继续拒绝 IOP。

| 原请求覆盖 | 当前证据 |
| --- | --- |
| identity/metadata | 公开身份旁证与 synthetic preflight；无 IOPscience source-backed DOM test |
| author information | synthetic ordered author head values；affiliation/correspondence 未验证 |
| sections | 未验证 |
| equations/math representation | 未验证，不推断 TeX、MathML 或 equation image |
| sub/sup/scientific units | 未验证 |
| figures/captions | 未验证 |
| tables | 未验证 |
| citations/references | 未验证 |
| internal crossrefs | 未验证 |
| supplementary/data links | 未验证 |

由于没有获得正文，无法确定 HTML 是否完整 server-side、equation representation、figure/table loading、reference/crossref encoding。也无法比较 subscription 与 open-access DOM；网络拒绝不证明付费墙，author-repository open badge 不证明 publisher open access。没有检查其他 IOP journals，也不声称平台家族复用。

## 集成前 blockers

本地验证：Windows / Node `v24.14.1`，`npm ci` 成功（0 vulnerabilities）；`node --test test/iop-adapter.test.mjs` 6/6；`npm test` 116/116；`npm run build` 成功；`npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` valid（13 display equations、50 references、math/structure/raw HTML/crossref validators 全部通过）。`git diff --check` 通过。上述结果证明 preflight 与既有回归保持，不证明 IOP full-text conversion。三平台 PR CI 由 GitHub 执行，不能从本地结果推断。

1. 在正常可访问环境获得多个真实公开 2D Materials article DOM；subscription 页面只检查公开可见部分，不绕过访问控制。
2. 按 Issue #10 admission 思路验证 canonical/DOI/journal 与实质正文；保留 semantic blocks/topology，制作 deterministic sanitized excerpts、原 source bytes/hash、fixture hash、retained-block locators 与 source-derived oracle。完整 raw captures 不提交。
3. 据实际 DOM 完成 publisher-local semantic extraction，并复用 Defuddle 和既有 academic normalizers；避免另一套 HTML-to-Markdown parser。
4. 对上述每个必需覆盖建立真实 source-backed focused assertions，并验证 deterministic Markdown 与 production validators。synthetic edge tests 不替代真实 coverage。
5. 更新 Draft PR 的真实 DOM findings/access comparison/unsupported structures 与验证记录；生产接入需要人工解决 Nature-only PRD/EDD 边界及独立 integration 决策。

## Shared-contract proposals（仅提案）

- 将 URL identity、metadata presence、实质全文可用性作为不同信号，避免 preview/challenge 被当成全文。
- 将网络/DNS/access failures 与 parser regression 分开；失败采集不能生成成功 fixture。
- provenance 区分 publisher article DOM、author repository record、promotion page 与 synthetic input；不以公开 DOI 或 hash 替代 DOM 真实性。
- 在真实多 publisher 证据到位后再讨论 semantic result shape、warnings 和 dialect integration。当前没有证据支持 base adapter、global corpus 或 live verifier 改造。
# 2026-10-03：图注与作者信息增量

侧边浏览器中已加载的 `https://iopscience.iop.org/article/10.1088/2053-1583/aeaa68` 提供 Figure 3 的完整图注、原始行内 TeX、300 K 单位文本，以及 `content.cld.iop.org` 的 `_lr.jpg` / `_hr.jpg` 下载链接。新增代表性片段与独立 provenance 文件，明确它不是完整文章或原始 HTTP 响应。实验性 `extractIopFigures()` 使用 Defuddle 转换图注，保护 TeX 避免反斜线被普通文本转义；只返回观察到的 HTTPS CDN 链接，不下载图片。作者机构和 ORCID 按观察到的 citation 元数据顺序关联，不推断通信作者。

本次 Windows Node 24 验证：`npm test` 119/119；`npm run build` 成功；Nature golden 的 `validate:paper` 全部通过。全文 `parseIopPage()` 仍未开放；表格、引用、交叉引用及服务器初始响应完整性仍待完成，不能据此宣称 IOP 全文支持完成。

## 2026-10-03：正文与原生表格、引用增量

新增 `convertIopPage()`，对提供的可访问正文 DOM 使用 Defuddle 转换。订阅提示、缺少正文或身份不符仍拒绝；实验结果不宣称完整 HTTP 捕获。真实 aeaa6b Table 2 四行、完整图注、TeX 温度范围、补充数据入口已加入片段。通过公开 Show References 按钮观察到 41 条参考文献，保留表格引用的 11/40/41 完整 cite、原始索引及 DOI；加载后转成脚注，未加载时保留出版商链接并报告 IOP_REFERENCE_UNAVAILABLE。片段选取及清理均写入各自 provenance，未提交原始整页捕获。数字交叉引用暂降级为可读文本；精确章节链接和引用区间展开仍待完善。初始服务器响应的 CDP 观察事件出现 truncated，不能将渲染 DOM 当作服务器完整性证据。

本次 focused 11 项测试通过；全套测试、build、Nature golden validate 已运行。仍需整页转换验证、科学符号与交叉引用覆盖，以及初始 HTML 完整性证据。
