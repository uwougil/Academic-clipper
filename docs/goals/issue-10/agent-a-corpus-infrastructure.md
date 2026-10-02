先读 [canonical spec](../../specs/issue-10-nature-corpus.md)。它是权威规范；本 goal 与其冲突时，以规范为准。

# Agent A — Corpus infrastructure

## Goal

交付可由 B/C/D 共同消费的版本化 manifest schema、确定性 sanitizer、provenance/hash 与无网络 replay helpers，以及 focused infrastructure tests；不交付 bulk fixtures。

## Context

本 goal 派生自 [执行计划](../../plans/issue-10-execution-plan.md)。它是一个最终 Issue #10 实现 PR 的内部工作单元，不能独立建立承担部分完成责任的普通 PR。

## Read-first documents

读 canonical spec 全文，重点 §5–7；读根 AGENTS.md、README.md、docs/PRD.md、docs/EDD.md，以及当前 Nature adapter、clip.mjs、表格 hydration、安全 transport 与 test organization。无需 PR #13。

## Preconditions

从最新 accepted main 建立自己的隔离 codex/ worktree/branch，记录 base SHA；不操作其他 agent checkout/index。先确认实际 selector、metadata 与 resource 行为，不根据历史代码设计接口。

## Scope

负责 schema、输入验证、source/fixture/subtree hashes、projection signatures、recipe serialization、sanitizer CLI、resource replay 与 ledger。生产网络和 parser 修改归 D/独立 bug。

## Owned / preferred files

- test/corpus/corpus-schema.json
- scripts/sanitize-nature-corpus.mjs
- scripts/lib/nature-corpus-infrastructure.mjs
- test/nature-corpus-infrastructure.test.mjs

## Dependencies

A/B 可立即并行。向 B 提供 recipe 草案供真实 DOM 验证；H1 稳定后向 B/C/D 提供实际 helper signatures、schema version 和可执行示例。变化由 A 提交兼容修订与迁移说明，不让消费者改同一 helper。

## Required implementation work

1. 定义 spec §6 字段与 resource/expectation/assertion IDs；拒绝未知字段、重复 IDs、越界路径、无 consumer 的 expectations。CLI 验证与 schema 验证共享同一契约。
2. 实现 spec §5 保留/移除规则。以真实 DOM 结构为依据；synthetic unit inputs 必须明确标记，不能算 corpus 来源。验证 inline whitespace 不被 pretty-print 损坏、JSON-LD 例外正确、idempotence 和 byte determinism。
3. Hash raw body bytes、committed fixture bytes、pre-sanitize serialized retained subtrees；各 resource 独立，记录 serializer/recipe version。明确 structure/payload signatures 的相同 projection，不用 full-page counts 对比 excerpt。
4. Replay 支持声明 method/URL/redirect、fresh responses、injected resolver 与 request/DNS ledger。Unknown operation 即使被 hydrator 捕获也可在 test teardown 判失败；不得依赖 throw 单独保证无网络。
5. H1 handoff 包含 required/optional fields、调用/返回/error signatures、最小使用示例、ledger assertions、实际 commit SHA 和通过的 focused tests。必要的受控网络 seam 由 D 选择。

## Do-not-touch boundaries

不改 bulk real fixtures/manifest、parser、security、writer、dependencies、CI、release、golden、PRD/EDD 或 canonical spec。发现规范错误时停止受影响假设，保留 evidence，在 handoff 提议修改；只有人工明确授权才能改规范。继续未受影响工作。独立 parser bug 按计划的独立 Work Contract 流程报告。

## Verification

运行 `node --test test/nature-corpus-infrastructure.test.mjs` 和 `git diff --check`；检查 changed/tracked paths。测试覆盖 schema rejection、path safety、hash bytes、same-input/idempotent sanitization、scientific inline whitespace、replay response isolation、unexpected-request ledger。不运行 live acquisition 作为 infrastructure gate。

## Acceptance criteria

H1 接口可由新消费者依文档执行；确定性与拒绝案例通过；零实际 DNS/HTTP；未修改生产输出；每个 schema expectation 有消费登记机制；真实源保存规则满足规范。

## Handoff format

提供 base/branch/worktree、ordered SHAs、owned files、schema/helper versions、例子及错误语义、验证命令/exit/results、B/C/D unblocking 条件、limitations/defects 和 spec-change proposals。把接口证据写进 commits/交接文档，不依赖私人 chat。
