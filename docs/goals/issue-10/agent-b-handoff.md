# Agent B — 当前来源采集交接（未完成）

本文是当前 evidence/handoff，不是 5–10 corpus entries 的交付声明。Canonical spec、生产 parser、golden 与 A infrastructure 均未由 B 改写。

## Base、依赖与 commits

- Accepted base：`ef3975c6a0eb1ec1e5a010a2df5b4f57309cebbe`，含 PR #27 与随后主线提交。2026-10-03 最新 remote main 对应 [CI run 37135219340](https://github.com/uwougil/Academic-clipper/actions/runs/37135219340) completed/success，三个 CI jobs（Ubuntu Node 20/24、Windows Node 24）均成功。Workflow 实际名称为 `CI`。
- Branch：`codex/issue-10-agent-b`；worktree：`C:/Users/guoli/.codex/worktrees/3417/academic-clipper`。不选择或修改其他 agent worktree。
- A H1 consumed：原 `20b48328114f195974e92827583b6bf5875beb27` → `4e0aec64f996a0090a7c74c14edd8ab5051d9639`，B 原样 cherry-pick 并 rebase 到最新 main 后为 `330e8d1a63bca29b2f0bc9236609b8bd5d814113` → `6d7389e4ed16d7a98416a47a7499c7871780bfe0`。Schema/recipe `1.0.0`；sanitizer `nature-corpus-sanitizer/1.0.0`；serializer `nature-corpus-subtree/1.0.0`；projection `nature-corpus-projection/1.0.0`。见 [A handoff](agent-a-handoff.md)。Integrator 若已选 A originals，不要重复选择 B dependency copies。

基于已成功的 latest main 做 `git rebase origin/main` 无冲突完成；本次 rebase 仅重写此 task branch 自身 commit identities。

当前完整顺序：

| SHA | 文件/归属 |
| --- | --- |
| `052a7c381047a5afea8d621c03c77e890eb91419` | B：docs/nature-corpus.md |
| `8158be383c370c11020f36ddd4735844159f1fa9` | B：docs/nature-corpus.md |
| `36daaf422c74da2d55b241603e21572bd54c9809` | B：docs/nature-corpus.md |
| `330e8d1a63bca29b2f0bc9236609b8bd5d814113` | A dependency：test/corpus/.gitattributes、scripts/lib/nature-corpus-infrastructure.mjs、scripts/sanitize-nature-corpus.mjs、test/corpus/corpus-schema.json、test/nature-corpus-infrastructure.test.mjs |
| `6d7389e4ed16d7a98416a47a7499c7871780bfe0` | A dependency：docs/goals/issue-10/agent-a-handoff.md |
| `52ef6380724b536e88c9f61797d7fac274bb7f9b` | B：docs/nature-corpus.md |
| `6730e7446e84e8d982abdaea9825f118c3576f2a` | B：docs/nature-corpus.md |
| `462443eb9290fed668f50579c746841fee3ad8ef` | B：docs/nature-corpus.md |
| `9094b1f51a3e66e045a18baf152506e5df0feaaa` | B：docs/goals/issue-10/agent-b-handoff.md |
| `13fdc0b3d3178eff77c2dd08ef336af568186595` | B：docs/goals/issue-10/agent-b-handoff.md、docs/nature-corpus.md |
| `b11f6ed852c336cb11bc78b777cfc439f5bd9f3e` | B：docs/goals/issue-10/agent-b-handoff.md、docs/nature-corpus.md |
| `64639633fd43863cc97ee2784b59e035294eb456` | B：docs/nature-corpus.md；刷新基线与 CI 记录 |
| `92c3a6a0c595703cd564fc727ae78af634d686a6` | B：docs/goals/issue-10/agent-b-handoff.md；前次基线与 commit map |

上表是本次交接刷新前的有序历史；本 handoff 刷新 commit 自身 SHA 由 `git log --format=%H -- docs/goals/issue-10/agent-b-handoff.md` 获取，避免在同一 commit 内自引用 SHA。相对最新 base 的完整列表也可由 `git log --reverse --format="%H %s" ef3975c6a0eb1ec1e5a010a2df5b4f57309cebbe..HEAD` 重建。

## 当前 admission、source oracle 与资源状态

0 admitted articles；没有 frozen manifest、fixtures、resource files 或 source-derived expectations。没有可报告的 fixture/resource byte sizes/hashes、通过的 coverage 或 expected warning contracts。不能把研究观察计入验收。

8 个 canonical 候选及 4 个 replacement 的 cookie-free guarded acquisition 均因 HTTP 303 到 `https://idp.nature.com/authorize` 被 article-scope guard 拒绝；每个 ID/URL、精确 UTC observedAt、失败理由和临时 evidence 路径见 [来源 ledger](../../nature-corpus.md)。它们是 acquisition-rejected candidates，不是已证实科学内容不足或结构冗余的论文。完整 captures 未提交，也没有取得可用 raw article body。

`s41534-024-00877-y` 的用户已打开公开页面可供只读研究：canonical/DOI/title/journal/两名 ordered authors 已核验，rendered DOM 有 52 display wrappers、257 math spans、74 references。Full-page observations 不等于 excerpt oracle。Eq9 的初始源码保留直接 `$$…$$` TeX；Table 1 初始 HTML 为 4 th + 4 td、单行 body、无 spans，含 i/sup 和 inline TeX。其 equation-heavy 与 simple-table-with-inline-math roles 仅为候选；不能覆盖 multiline-array、第二种 table layout 或其他必需角色。精确 TeX、公开 locators 与 decoded-string positions 见来源 ledger；positions 明确是 UTF-16 offsets，不是原 body byte offsets。

Article/table 的 CDP `Page.getResourceContent` 均返回 decoded string，`base64Encoded: false`。Lengths 分别 449217/162813 JS code units。没有任何 sourceSha256；未将字符串重新 UTF-8 编码冒充 pre-decoding hash。浏览器网络请求是否带站点 Cookie 亦未取得合规 acquisition 证明；没有读取或导出 Cookie/credentials。Source sanitization 尚未执行，因此 transformations/omissions/size policy 审核待采集后完成。

尚无 truthful reduced parser reproducer 或已确认 parser defect。Rendered MathJax 与 initial HTML 的差异是来源选择风险，不是已证明的生产 defect；B 未修改 parser/tests 来回避它。

## 恢复路径与待人工决议的规范建议

优先保持当前规范：在可由 production guarded transport 取得 cookie-free 原始 article/table bytes 的环境继续采集。该环境必须保留 URL、DNS、redirect scope、timeout、size 和 content-type 检查；不得把跟随 idp、带 Cookie 或关闭安全检查当作恢复步骤。现有 browser request headers 对照没有解除 303，故无需继续同类重复重试。未确认根因为 Cloudflare。

当前 `Page.getResourceContent` 的 decoded response text 可证明源码结构，但不足以满足 §6 的 sourceSha256 定义。一次更新的 CDP 页面内 fetch 探测显式设置 `credentials: "omit"` 并尝试读取 `Response.arrayBuffer()` / SHA-256；Nature 返回 303 到 `idp.nature.com/authorize`，之后身份 transit 返回 302，最终 URL 标出 `error=cookies_not_supported`，浏览器因跨域 CORS 失败且没有 article body/hash。精确过程见 [来源 ledger](../../nature-corpus.md)。因此这不是已验证的 headless 假设；在同一侧边浏览器中，无 Cookie fetch 也遇到身份 cookie 流程。本次没有证明 Cloudflare 参与。

出版社官方文档将 `idp.nature.com/debug` 指向 Nature content access troubleshooting，并提到 cookies 可能影响访问（链接及范围限制见来源 ledger）。它没有说明当前 Open Access article 为何 303，也没有将错误归因于 Cloudflare；没有访问需要携带本机访问状态的 debug 端点。

若另一个合规网络路径下同样的 cookie-omitting fetch 能返回 200，`Response.arrayBuffer()` 可提供 decoding 前的 body bytes，可能直接满足当前 source hash 定义，无需改 spec。当前探测失败，没有可用 bytes；浏览器展示页的内容依旧不能替代它。A H1 的 `browser-dom` 说明仍适用。

如果人工决定以现有公开浏览器来源作为正式 acquisition，应先独立批准并落地如下设计变更，再恢复依赖该变更的工作：

1. 在 canonical §5/§6 明确一种 decoded-initial-response acquisition，保留独立 `decodedSourceSha256`（对浏览器返回的 initial response text UTF-8 bytes），禁止将它命名或解释为 raw `sourceSha256`；保留 source capability、实际观察时间、公开 URL/locators、独立 source review。Rendered DOM 与 initial response 仍要区分。
2. 人工明确这种公开浏览器读取是否允许匿名站点 session/Cookie；当前“不使用 cookies/private sessions”指令不因页面打开而自动解除。保持不使用账号、机构权限、credentials，不导出 Cookie 到脚本，不以受限页面替代公开全文。
3. A 发布兼容 schema/helper/CLI/provenance 版本及迁移说明；C 独立审查该模式可证明和不能证明的来源性质；D 的 guarded live verifier 仍单独报告 access blocked，不把浏览器访问等同 guarded HTTP 成功。
4. 5–10 篇、所有必需覆盖、完整 semantic blocks、真实 table resource、三 dialect、确定性与所有 validators 等验收范围保持不变。

以上只是供人工审议的 proposal；B 没有修改 canonical、采用该模式或宣称它满足现有规范。单独允许 decoded hash 仍不能解除 Cookie/guarded acquisition 前置条件，必须完整解决来源访问契约。

### 本轮实际多路径结果与较小的恢复提案（未批准、未执行）

2026-10-03 已实际比较：文章公开 alternate links、真实 Chrome/154 UA 与 navigation headers、4 个 fresh-DNS public CDN addresses、Undici allowH2、系统现有 local proxy 的 public-IP-pinned CONNECT 路线。7 个 guarded HTTP cases 均为 303/text/html → `https://idp.nature.com/authorize`，未跟随；同一侧边浏览器的 cookie-omitting/manual-redirect Fetch 则 12 秒 timeout，没有新的 HTTP response evidence。完整配置、UTC、exact commands、external diagnostic file hashes 见 [ledger](../../nature-corpus.md)。未证实 Cloudflare/headless 归因，不能保证换出口一定成功。

当前最小待审议选项是仅改变 acquisition 的匿名站点 Cookie 限制，而保持 raw-byte provenance 定义：

1. 新建可证明独立的临时匿名浏览器 context；不能复用当前用户 profile/Cookie、账号、机构权限或 credentials。当前 CUA 已列出的能力没有专门的 isolated-context API，不能把普通新 tab 宣称匿名隔离；具体可用接口/环境仍需证明。
2. 仅在人工明确批准并修订 canonical acquisition 契约后，允许 Nature 在该 context 设置临时站点 Cookie。认证路径仅限定 HTTPS `www.nature.com` 和 `idp.nature.com`，严格 redirect count/time/body bounds；最终 article/table 必须返回所声明 article 的 canonical/structured DOI 与实质全文。拒绝任何账号登录、机构权限、付费授权或其他 host。不得导出 Cookie、token/authorization code 或写入 repository。
3. 从 cookie exchange 后的实际 HTTP 解压 body bytes 在 decoding 前捕获 sourceSha256；不得以 decoded string/DOM 重新编码替代。Source hash 语义、5–10 篇、真实 topology、table resources、independent oracle、全部 coverage/validators 均保持原要求。若可用接口仍只返回 decoded string，此选项尚不能满足来源条件，不能悄悄改成另一种 hash。
4. 这是 source acquisition 例外提案，不修改 production `safeFetchExternal()` / article/table redirect scope 或 D 默认 live verifier。无 Cookie live verifier仍如实报告 access blocked，不将 acquisition 特例算作默认传输成功。批准后也须由相应 owner 定义明确的 versioned captureMode/schema 接口再冻结 manifest；B 不自行修改 A infrastructure。
5. 若继续严格 no-Cookie，则保留本轮全部拒绝证据，在可用另一出口作有限探测；当前没有已验证的新出口。不能通过反复改 UA、允许越界 redirect、复制 Cookie 或关闭 guards 来宣称解阻。

这份具体提案是为解决用户当前困境的审议材料，不是已测试的成功方案。人工可以批准这段有限的来源规则变更，或继续严格 no-Cookie；没有决议前，B 不执行依赖 Cookie 的步骤，也不改 canonical spec。它比上述 decoded-source 模式更小，但仍需要显式解除原始用户指令与 Agent B precondition 中的 Cookie 禁令以及 canonical guarded-acquisition 范围假设。

## Commands、验证与 Agent C 条件

Exact acquisition/header-probe commands、时间及结果见来源 ledger；脚本 exit 0 表示 rejection ledger 保存成功，不是取得正文。B 实际已执行 `npm ci`（65 packages，0 vulnerabilities）、接入 H1 前 `npm test`（110 pass）、`npm run build`、golden `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`（valid，13 display equations/50 references）、接入 H1 后 `node scripts/sanitize-nature-corpus.mjs --help`（exit 0）及 `node --test test/nature-corpus-infrastructure.test.mjs`（28 pass）。这些不证明 corpus 验收。A 自己的 138-test/full-build 结果见 A handoff，不冒充 B 已执行结果。

本轮 rebase 到 `ef3975c6a0eb1ec1e5a010a2df5b4f57309cebbe` 后重新执行 `node --test test/nature-corpus-infrastructure.test.mjs`：exit 0，28 pass，0 fail/skip。`git diff --check` exit 0；本轮 tracked diff 只含 B 的来源文档和 handoff；相对 accepted base 的其他文件仍是原样 A dependencies。没有 full capture、Cookie、credentials 或新 fixture。未因仅来源文档变更重复整套 parser/build checks；新 accepted main 的三平台 CI 结果单独记录，不冒充 B 本地全套重跑。

C 可基于已交 H1 做 assertion framework，但 source-specific verification 的明确 unblocking 条件是：合规获取 article/table 原 bytes 或已批准的新来源接口；B 用实际 A 版本生成 deterministic excerpts/provenance 并核对 transformations/omissions；为每条 coverage 交付 retained block、source position 和 source-derived assertion value；C 登记 strict registry 并独立确认。完整 clip table replay 还依赖 D 的 transport seam。当前这些 source-specific 条件均未满足。

Integrator 选择 B commits 前检查 `git diff --check`、`git status --short`、tracked filenames；只包含来源文档与明确的 A dependencies，不含 full captures、credentials、binaries 或 fixture 伪造。最终 implementation 的全部 checks/三平台 CI 仍须执行。本文不声明 Agent B 或 Issue #10 完成。
