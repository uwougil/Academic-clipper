# Agent B — 当前来源采集交接（未完成）

本文是当前 evidence/handoff，不是 5–10 corpus entries 的交付声明。Canonical spec、生产 parser、golden 与 A infrastructure 均未由 B 改写。

## Base、依赖与 commits

- Accepted base：`0ee52b585afb1ac2bed11e9a56278feae2da1949`，含 PR #27 与随后主线提交。2026-10-03 最新 remote main 对应 [CI run 37133130849](https://github.com/uwougil/Academic-clipper/actions/runs/37133130849) completed/success，三个 CI jobs（Ubuntu Node 20/24、Windows Node 24）均成功。Workflow 实际名称为 `CI`。
- Branch：`codex/issue-10-agent-b`；worktree：`C:/Users/guoli/.codex/worktrees/3417/academic-clipper`。不选择或修改其他 agent worktree。
- A H1 consumed：原 `20b48328114f195974e92827583b6bf5875beb27` → `4e0aec64f996a0090a7c74c14edd8ab5051d9639`，B 原样 cherry-pick 并 rebase 到最新 main 后为 `6e3b5e6c6dbc44dcf57f9454a8816caf6383ae8c` → `09877adb6710b88a8aac5a014108a15c6e874600`。Schema/recipe `1.0.0`；sanitizer `nature-corpus-sanitizer/1.0.0`；serializer `nature-corpus-subtree/1.0.0`；projection `nature-corpus-projection/1.0.0`。见 [A handoff](agent-a-handoff.md)。Integrator 若已选 A originals，不要重复选择 B dependency copies。

基于已成功的 latest main 做 `git rebase origin/main` 无冲突完成；本次 rebase 仅重写此 task branch 自身 commit identities。

当前完整顺序：

| SHA | 文件/归属 |
| --- | --- |
| `baa6f428ab4316ffd003a537fd0d0fc04202159c` | B：docs/nature-corpus.md |
| `07fd5f0b23e18fc2bdd302403ec866c99751d332` | B：docs/nature-corpus.md |
| `071d1d6a9b1fb530728fe88b706bb1c00252f62b` | B：docs/nature-corpus.md |
| `6e3b5e6c6dbc44dcf57f9454a8816caf6383ae8c` | A dependency：test/corpus/.gitattributes、scripts/lib/nature-corpus-infrastructure.mjs、scripts/sanitize-nature-corpus.mjs、test/corpus/corpus-schema.json、test/nature-corpus-infrastructure.test.mjs |
| `09877adb6710b88a8aac5a014108a15c6e874600` | A dependency：docs/goals/issue-10/agent-a-handoff.md |
| `1bb0ff680355ff147ab0ac604c44786c1b55f1fb` | B：docs/nature-corpus.md |
| `99cb087df662b8f033de31ef6ee2f6e061b0fb99` | B：docs/nature-corpus.md |
| `0504b0b4e40eb4f06e2937056066736e7df52264` | B：docs/nature-corpus.md |
| `2e9d36284fc34c1cd48e7d72a992ba8fda44e2e7` | B：docs/goals/issue-10/agent-b-handoff.md |
| `4dda3962f60210cba774ac36f1948516677abc45` | B：docs/goals/issue-10/agent-b-handoff.md、docs/nature-corpus.md |
| `f8d1e24522b2b814d1f7bffe99b12d81c07f272b` | B：docs/goals/issue-10/agent-b-handoff.md、docs/nature-corpus.md |
| `75f95816bac5dac2518aba6e80fe06075f169310` | B：docs/nature-corpus.md；刷新基线与 CI 记录 |

上表是本次交接刷新前的有序历史；本 handoff 刷新 commit 自身 SHA 由 `git log --format=%H -- docs/goals/issue-10/agent-b-handoff.md` 获取，避免在同一 commit 内自引用 SHA。相对最新 base 的完整列表也可由 `git log --reverse --format="%H %s" 0ee52b585afb1ac2bed11e9a56278feae2da1949..HEAD` 重建。

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

## Commands、验证与 Agent C 条件

Exact acquisition/header-probe commands、时间及结果见来源 ledger；脚本 exit 0 表示 rejection ledger 保存成功，不是取得正文。B 实际已执行 `npm ci`（65 packages，0 vulnerabilities）、接入 H1 前 `npm test`（110 pass）、`npm run build`、golden `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`（valid，13 display equations/50 references）、接入 H1 后 `node scripts/sanitize-nature-corpus.mjs --help`（exit 0）及 `node --test test/nature-corpus-infrastructure.test.mjs`（28 pass）。这些不证明 corpus 验收。A 自己的 138-test/full-build 结果见 A handoff，不冒充 B 已执行结果。

C 可基于已交 H1 做 assertion framework，但 source-specific verification 的明确 unblocking 条件是：合规获取 article/table 原 bytes 或已批准的新来源接口；B 用实际 A 版本生成 deterministic excerpts/provenance 并核对 transformations/omissions；为每条 coverage 交付 retained block、source position 和 source-derived assertion value；C 登记 strict registry 并独立确认。完整 clip table replay 还依赖 D 的 transport seam。当前这些 source-specific 条件均未满足。

Integrator 选择 B commits 前检查 `git diff --check`、`git status --short`、tracked filenames；只包含来源文档与明确的 A dependencies，不含 full captures、credentials、binaries 或 fixture 伪造。最终 implementation 的全部 checks/三平台 CI 仍须执行。本文不声明 Agent B 或 Issue #10 完成。
