# Issue #48 — 科学单位预检交接

状态：已诊断并固化真实红回归，尚未修复。独立合同：[Issue #48](https://github.com/uwougil/Academic-clipper/issues/48)，type `bug`。本 bug 是 Issue #10 的 parser 前置条件，不承担其 corpus infrastructure 最终交付；PR 只使用 `Refs #48`，不使用 `Refs #10`。

Branch `codex/issue-10-bug-scientific-units`，managed worktree `C:/Users/guoli/.codex/worktrees/issue-10-bug-scientific-units/academic-clipper`。启动 accepted base `e85b1b809b56242b89b6313ce5d1165c745466bb` 已经 fetch 核验；Main CI `37182993143`、Secret scan `37182993093` 均 success。Node `v24.14.1`，`npm ci` exit 0：65 packages、0 vulnerabilities。

已读完整 applicable AGENTS、canonical spec、execution plan、B/C complete handoffs、PRD/EDD relevant boundaries，以及 create-issue/fix-bug skills。使用 human-settled-intent 模式；remote/auth 和 open+closed duplicate search 已核验，#1/#6/#45/#47 与本行为不同。`gh issue create` 与 `gh issue view 48` 均成功，唯一 type `bug`。

## 来源与真实红证据

只读 B source snapshot `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`，C checkpoint `ff3e714c707ccc619d00a7c42dd2d155cd1be631`、assertion helper `5d305fa72effae2bc34770e339c1e30b3ae07d19`。没有改 9 sources、4 tables、13 B excerpts、85 oracle、spec 或 golden。

用 existing A helper 原版生成 3 个本 bug 的 reduced excerpts；schema/recipe/projection `1.0.0`、sanitizer `1.1.0`、serializer `1.0.0`，没有复制 helper 或另写 parser。原 external raw Buffer hashes、pre-sanitize subtree hashes、complete ordered creators（SR 5 位、FRB 35 位）、原 CC BY 4.0 notice/URL/source positions 全部重新核验，repeat/idempotent bytes 相等。Recipe/positions/transformations/omissions/hash 保留在 [provenance 目录](../../../test/fixtures/nature-scientific-units/README.md)。Full captures 和临时生成器只在 external TEMP。

SR Methods source paragraphs 8/9/12 分别有 2/2/3 个 unit powers，共 7 个。源 m³/m³、kg m⁻² s⁻¹、kg/m² 在 cleaned HTML 与 Defuddle 输出中仍有正确 raw `<sup>`；`normalizeAcademicInline()` 将其变成 `$^{…}$`，其 `combineScientificRuns()` 仅接受 styled bases，所以第一次无效状态发生在 academic normalization。Adapter 没有 capture plaintext units，但修复不需要扩展 adapter：全部原基底和 typed attachment 仍到达 normalizer。

FRB table 有 12 个 numeric powers（cm/s/Hz/yr/10），直接使用同一 normalizer；没有正文 adapter 的 literal `10` capture，因此数值幂也孤立。其 7 个 a–f cell markers 和 6 条 adjacent footer notes 属于独立 #45，保留真实输入，不混入本 12 个 powers 或隐藏 whole-validator failures。

`node --test test/nature-scientific-units.test.mjs` 在 untouched e85 production 上 **exit 1**：8 tests，2 pass / 6 fail，0 skip/todo/cancel。Source integrity/creator/license/power checks 与 synthetic negative controls通过；两个真实来源 × 三方言均因 source base-power pairs 未位于同一数学表达式而失败。外部 log `units-red-e85.log`。SR whole-chain 另直接读回 math/scientificFragments=false、7 isolatedSuperscript，structure/rawHtml/crossReferences=true、73 original references、7 correct ordered citation clusters。

## 实施边界与恢复条件

Root 明确释放 `src/normalizers/academic-inline.mjs` 给本 agent：仅在红证明和 Issue contract 固化后改此 production file，以及自身 tests/fixtures/handoff。Nature/figures/citations/clip 由 #47 owner 持有，禁止修改；不弱化 validator、不改 B source/oracle、security/writer/dependencies/golden/intent。

最小 remedy 是从 typed numeric superscript 重接明确 unit symbol 或 numeric base，拒绝 unknown word 的末尾 suffix 猜测、citation anchors、letter footer markers、leading isotope；保护已有 math/code、styled runs 与 chemistry subscript。Literal [O III]、leading isotope、materials styled adjacency 与 sparse alt 仍独立。完整 source validators 与三平台 CI 尚未通过，不能称本 bug fixed。

Root 已报告新 accepted main `e0a341fc97ff845a250c2f016dcb2363e10ed49e`（#45/PR #46），Main CI `37269007138`、Secrets `37269007093` success；本 agent 下一步自行 fetch/核验并 rebase，再证明 #45 之后仅 12 scientific powers 仍独立红。合并只接纳代码，只有 merged commit Main CI success 才完成 Work Contract。
