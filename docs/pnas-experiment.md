# PNAS 实验：来源获取阻塞记录

状态：调研未完成，尚无 PNAS adapter 或可接纳的 source-backed fixtures。2026-10-02。

## Work Contract 与基线

独立 Work Contract：[Issue #31](https://github.com/uwougil/Academic-clipper/issues/31)。关联规划为 Issue #26；Issue #10 的 corpus specification/planning docs 只作为真实性和回归方法参考，不修改其 schema、goals 或交付责任。

基线为 main `5971ebfbe288e0efed4abef21469f41e2cabb05f`，启动时已通过 GitHub CLI 确认该 SHA 的 CI conclusion 为 success。隔离分支 `codex/experimental-pnas`。

已阅读 AGENTS.md、README.md、docs/PRD.md、docs/EDD.md、Issue #26、Issue #10、docs/specs/issue-10-nature-corpus.md、docs/plans/issue-10-execution-plan.md、Nature adapter 与 shared conversion/rendering/validation pipeline。

用户授权隔离的 PNAS 实验；现有 PRD/EDD 的正式支持范围仍为 Nature。本记录不改变这些 intent sources，也不添加 browser/bridge/CLI routing。

## 已尝试的文章来源

| 公开文章 URL | 研究角色 | 实际获取情况 |
| --- | --- | --- |
| https://www.pnas.org/doi/10.1073/pnas.2400689121 | A mechanistic model of gossip, reputations, and cooperation；理论、公式、Significance、nested sections、citation ranges、correction notice | web tool 首次提供 rendered text；显示 Free access、Significance/Abstract、h2/h3 层次及多段公式表示。没有 HTML bytes/DOM。 |
| https://www.pnas.org/doi/10.1073/pnas.2311878121 | Explaining neural scaling laws；另一数学模型候选 | web tool 首次确认标题及文章文本可读；未取得实际 DOM。 |
| https://www.pnas.org/doi/10.1073/pnas.2318124121 | Evaluating language models for mathematics through interactions；实验评估候选 | web tool 首次提供文章 rendered text，经 `?cookieSet=1` redirect；未取得实际 DOM。 |
| https://www.pnas.org/doi/full/10.1073/pnas.1915321117 | 初始候选探测 | web tool Internal Error；未接纳。 |

前三条标准 `/doi/` 和 `/doi/full/` URL 的本地、无凭据、通过既有环境代理的 bounded HTTP GET 均返回 HTTP 403。没有尝试 CAPTCHA、隐蔽模式、伪造授权、cookies 或私有 endpoint。

后续 web tool 读取前三篇的部分内容/搜索时转到 `https://www.pnas.org/action/cookieAbsent`，只返回站点导航和登录 UI。这些响应不是 article corpus；不能因为 URL 含 DOI 就接纳。

## Platform 与 DOM 证据的边界

Atypon 自身的 [An insider’s tour of PNAS.org on Literatum](https://www.linkedin.com/posts/atypon_an-insiders-tour-of-pnasorg-on-literatum-activity-6971471851113832448-IcUV) 说明 PNAS.org 使用 Literatum。PNAS 编辑部的 [2022 rebrand editorial](https://pmc.ncbi.nlm.nih.gov/articles/PMC8931316/) 讨论当时新站点的组织与 UI。

当前可观察 URL family 是 `/doi/10.1073/pnas.*`，包含 `/action/cookieAbsent` 会话/浏览器差异；这与旧 `/content/` 链路不同。厂商声明与当前路径支持 Atypon/Literatum 的研究方向，但**不构成当前 article DOM family 的充分确认**。尚未观察 article root、metadata 标签、公式源、figure/caption siblings、reference IDs、table topology 或动态请求。不能仅凭 publisher 名称或平台历史创建 selector。

PMC 版本可以验证论文身份/科学内容，但 PMC 自己的 DOM 不代表 pnas.org。PNAS Nexus 的 Oxford Academic URL 也不属于本任务。二者均不作为 PNAS publisher fixture 替代品。

## 获取诊断与 access 差异

- `safeFetchExternal()` 拒绝本机 `www.pnas.org` 的 DNS 地址 `198.18.1.3`，报告 local/private address。保留此 guard；不修改 production transport。
- In-app browser 访问 gossip 论文返回 `ERR_CONNECTION_CLOSED`。
- Windows curl 的正常证书检查遇到 `CRYPT_E_REVOCATION_OFFLINE`；未禁用证书检查。随后 Node 的正常 TLS、环境代理、30s timeout、manual redirects、25 MiB body cap 研究请求返回 403。
- web tool 的早期全文可见与后续 cookieAbsent 响应说明 access 状态会变化。它不证明内容必须由动态请求加载，也不证明 paid content 能公开访问。动态依赖、公开授权范围及新发表 subscription-only 文章差异仍未验证。

研究 HTTP 请求仅为外部临时操作，没有添加生产网络能力、保存 access headers 或提交 raw captures。

## Corpus 与测试覆盖

接纳真实 PNAS DOM fixtures：**0**。新增 PNAS parser/end-to-end tests：**0**。没有用 rendered text 重写 HTML，没有手工编写学术内容来充当 source-backed fixture，没有以 broad count 或 synthetic case 宣称真实覆盖。

全部请求的 PNAS 覆盖仍为未验证：title/DOI/journal/dates；authors/affiliations/correspondence；abstract；section hierarchy；equations/scientific notation；figures/captions；tables；citations/reference list；internal crossrefs；supplementary/data links；site UI cleanup。gossip 的 rendered headings 只是选型线索，不是 parser oracle。

## Shared contract 研究影响

1. Publisher identity、hosting platform 与当前 DOM family 必须分别记录。Literatum 品牌不能推出通用 selector，也不能把所有使用 Atypon 的站点当成同一个 adapter。
2. Acquisition status 必须先区分 article、preview、cookie/login/challenge/network response，再判断 parser regression；DOI URL 和 HTTP HTML 不足以接纳 corpus。
3. browser DOM capture 与 server HTML response 的 provenance 应明确区分。仅有 rendered text 无法生成 source subtree hashes、原始 TeX 或拓扑断言。
4. 当前 renderer/result model 可以作为实验复用起点，但其 Nature-shaped fields、references 按 position 编号、caption MathJax selector 等是否适合 PNAS，必须等真实 DOM 验证。现在不抽取共享 API，不设计 router/schema/live-verifier。

## Merge blockers 与恢复条件

本 Draft 不可 merge 作为 PNAS 支持：需要取得多篇无凭据、公开可访问的 pnas.org article HTML/loaded DOM，并记录来源、实际获取时间、hash、保留 block、sanitization/omissions；确认当前 DOM family 后才能实现 `src/adapters/pnas.mjs` 和离线 focused tests。还需 source-backed table/math/reference/caption 等差异覆盖、三种输出方言的 production validation、完整回归结果与 PR CI。

如已有公开获取的本地 DOM captures，可直接提供目录路径；不需要任何凭据。若将实验接入正式 browser/bridge/CLI，需要人工解决 Nature-only 意图边界并更新 PRD/EDD。本记录不代替该决定。

## 本次 baseline verification

Windows Node `v24.14.1`，以上 main 基线，仅新增本记录；这些结果不验证 PNAS。

- `npm ci`：exit 0，65 packages installed，0 vulnerabilities。
- `npm test`：exit 0，110 tests，110 pass，0 fail/cancelled/skipped/todo；duration 17487.29 ms。
- `npm run build`：exit 0，生成 ignored `dist/extension/`。
- `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`：exit 0；math、scientificFragments、Markdown structure、raw HTML 与 cross-reference validation 全部 valid；250 inline math、13 display math、50 reference definitions。
- `git diff --check`：exit 0。最终 tracked change 仅 `docs/pnas-experiment.md`；没有 source/test/intent/security/CI/golden 修改。

Linux Node 20/24 与 Windows Node 24 的本 Draft PR CI 尚待 GitHub 执行；本地 Node 24 结果不能替代跨平台 CI。
