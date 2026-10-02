# IOPscience / 2D Materials 实验

状态：未完成，来源访问阻塞；不得集成或宣称支持。Work Contract：[Issue #29](https://github.com/uwougil/Academic-clipper/issues/29)。

基线为 accepted main `5971ebfbe288e0efed4abef21469f41e2cabb05f`，对应 [成功 Main CI](https://github.com/uwougil/Academic-clipper/actions/runs/37037473932)。隔离 branch 为 `codex/iop-2d-materials`。已读取 AGENTS.md、README、PRD/EDD、Issue #26、Issue #10 canonical spec/execution plan 及 Nature adapter、Defuddle、normalizers、validators、writer 与安全边界。

## 实际访问记录（2026-10-02）

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
