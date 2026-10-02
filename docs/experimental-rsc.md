# Experimental RSC：来源访问与集成交接

状态：**来源 admission 受阻；adapter 尚未实现，不能声称 RSC 支持。**

Work Contract：[Issue #28](https://github.com/uwougil/Academic-clipper/issues/28)。
规划背景：[Issue #26](https://github.com/uwougil/Academic-clipper/issues/26)。
方法参考：Issue #10 的 [corpus 规范](specs/issue-10-nature-corpus.md)、[执行计划](plans/issue-10-execution-plan.md)和 [fixture acquisition goal](goals/issue-10/agent-b-fixture-acquisition.md)。

本分支从 accepted main `5971ebfbe288e0efed4abef21469f41e2cabb05f` 创建；启动时已确认该 SHA 的 CI、Secret scan 与 Issue-finalize 均为 success。目标仅为 Materials Horizons、Physical Chemistry Chemical Physics (PCCP)、Journal of Materials Chemistry C 的独立实验，不改变当前 Nature-only 产品范围。

## 公开来源检查（2026-10-02）

以下 URL 已发起公开访问。403/challenge/landing 不是可用全文，不能用于证明共享 DOM，不能从搜索文本重新编写 HTML fixture。

| 期刊 | 真实候选全文 URL | 此次观察 |
| --- | --- | --- |
| Materials Horizons | https://pubs.rsc.org/en/content/articlehtml/2025/mh/d5mh00096c | web 与本地 HTTP 为 403；in-app browser 显示 Cloudflare 安全验证页，无 article DOM |
| Materials Horizons | https://pubs.rsc.org/en/content/articlehtml/2023/mh/d3mh00787a | web、本地 HTTP 为 403；对应 landing 在 browser 也显示 challenge |
| Materials Horizons | https://pubs.rsc.org/en/content/articlehtml/2023/mh/d3mh00572k | web 为 403 |
| Materials Horizons | https://pubs.rsc.org/en/content/articlehtml/2023/mh/d3mh00378g | web 为 403 |
| PCCP | https://pubs.rsc.org/en/content/articlehtml/2024/cp/d4cp00012a | web 与本地 HTTP 为 403 |
| PCCP | https://pubs.rsc.org/en/content/articlehtml/2024/cp/d3cp05267b | web 与本地 HTTP 为 403 |
| PCCP | https://pubs.rsc.org/en/content/articlehtml/2024/cp/d4cp00788c | web 为 403 |
| Journal of Materials Chemistry C | https://pubs.rsc.org/en/content/articlehtml/2025/tc/d5tc02647d | web 重定向至 `articlelanding/2025/tc/d5tc02647d/unauth`；仅有摘要、作者、DOI，不接纳为全文 |
| Journal of Materials Chemistry C | https://pubs.rsc.org/en/content/articlehtml/2024/tc/d3tc03672c | web 为 403；公开 landing 可验证 title/DOI/journal，但不能验证全文 DOM |
| Journal of Materials Chemistry C | https://pubs.rsc.org/en/content/articlehtml/2024/tc/d4tc01199f | web 为 403 |
| Journal of Materials Chemistry C | https://pubs.rsc.org/en/content/articlehtml/2014/tc/c4tc00336e | web 与本地 HTTP 为 403 |

身份与候选来源：RSC [PCCP collection](https://pubs.rsc.org/en/journals/articlecollectionlanding?sercode=cp&themeid=6ff5d516-59da-4392-abda-38159efa24d0)、RSC [Ag-doped SnS landing](https://pubs.rsc.org/en/content/articlelanding/2024/tc/d3tc03672c)、[Materials Horizons institutional record](https://spiral.imperial.ac.uk/entities/publication/db56fa52-073f-43e0-8d09-816e61ae316c)。候选链接的存在不等于全文获得或结构被验证。

本地环境的系统 DNS 将 `pubs.rsc.org` 返回为 `198.18.0.252`；现有 `safeFetchExternal()` 正确拒绝该地址。为区分环境 DNS 与 publisher 访问错误，研究阶段另查询公开 DoH，Google / Cloudflare 均返回 `104.18.12.179`、`104.18.13.179`；使用现有 resolver injection 及 URL/redirect、30s、25MiB、HTML type 约束后仍为 403。此诊断没有修改或放宽生产安全代码。完整响应仅存于仓库外临时目录，不提交 cookies、challenge HTML、raw captures 或 credentials。未解决 CAPTCHA、未登录或绕过 paywall。

## DOM family 与 coverage 结论

三个期刊使用同一域名及相似 `articlehtml/<year>/<journal-code>/<id>` 路径，**这不足以证明共享 article DOM**。目前没有任何 admitted full-text article，没有 source-backed excerpts，没有 RSC-focused tests；metadata/authors/DOI、section、equation/scientific notation、figure/caption、table、reference/citation、internal crossref 均尚未取得可执行的 adapter coverage。403 是访问失败，不能归因于 parser regression；`/unauth` 摘要页面不能算成功采集。

后续来源 admission 必须先获取每个期刊多个公开、具有实质正文的 DOM，比较 metadata、body root、heading、equation wrappers、caption placement、table topology、citation links/reference IDs。不同结构必须对应保留的原始 semantic blocks 和独立 source-derived oracle。公式只有在源提供可信 TeX/MathML 时转换；仅有 equation image 时保留 image/label 并显式 warning，不能编造 TeX。保留原 reference 编号，不静默重编号。

fixture 将使用 RSC 专有目录（例如 `test/fixtures/rsc/`），只提交 sanitized semantic excerpts 与 provenance，不创建或改写全局 corpus schema，也不触碰 Nature agent 所有的 `test/corpus/`。每个 excerpt 应记录 URL/identity、capture mode/time、原响应与 fixture hashes、retained locators/subtree hashes、sanitization/omissions、exact expectations 和 coverage 对应断言。没有来源时不创建合成内容冒充真实 fixture。

## 架构参考与最小集成提案（未实施）

已阅读 `src/adapters/nature.mjs`、`src/clip.mjs`、`src/markdown.mjs`、`src/normalizers/{math,academic-inline,citations,figures}.mjs`、`src/renderers/output-policy.mjs` 和现有 validators。Nature selectors 不是 RSC selectors 的证据。

- RSC DOM 知识拟集中于 `src/adapters/rsc.mjs`；在有来源后先直接 focused tests，避免 production router 冲突。
- 现有 `defuddleToMarkdown()` / `htmlToMarkdown()`、`withDomGlobals()`、academic normalizers、figure/table normalizers、`renderClipMarkdown()`、output policy 和 validators 可评估复用。必须按真实 RSC 结构验证其输入契约，不能靠复用名称声称正确。
- `clipNature()` 内的 references rendering 与部分 assembly 是私有函数。如果 RSC 证据证明需要公共 seam，在 Draft PR 提案并由 integrator 决定；本分支不改 normalizer API，不复制 Nature DOM 知识到 shared code。
- 最小 routing 提案需要 integrator 统一处理 `src/clip.mjs` 的 adapter dispatch，以及 `src/cli.mjs`、`src/article-fetch.mjs` 的 URL/redirect scope。RSC fetch 必须逐跳约束同一 article identity，维持 DNS、timeout、size、content-type 边界。bridge 的 loopback/Origin/token 和 writer 事务协议不需要重构。
- 正式路由前还必须由人类解决并更新 `docs/PRD.md`、`docs/EDD.md` 的 Nature-only 边界。当前仅授权实验 workstream，不将实验结果写成正式支持。

没有 universal Publisher base class、router redesign、common live verifier 或 global corpus schema 提案；暂不抽取新公共 abstraction。当前 changed shared files：**无**。

## 继续与 merge blockers

需要公开完整 article HTML 的可用获取方式或已有本地 capture 路径；不需要账号、cookies 或 token。取得来源后，在**同一 Issue / 同一 Draft PR**继续完成 adapter、代表性 fixtures、focused tests、三种 output dialect 的生产 validators 和既有回归验证。任何目前未验证的结构均属不支持，不声称 general RSC support。

Merge blockers：来源 admission、三刊共享 DOM 实证、adapter 实现、真实结构 fixtures、focused coverage、最终回归证据、intent/routing 的明确人工集成决议和 PR CI。此次 source-access 文档不是功能交付，不应 merge 或完成 Issue #28。

## 本地验证

npm ci 成功（0 vulnerabilities）；npm test：110 passed、0 failed；npm run build 成功；npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto：全部 validators valid。上述为既有 Nature regression，不证明 RSC coverage。git diff --check 通过。
