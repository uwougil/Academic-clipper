先读 [canonical spec](../../specs/issue-10-nature-corpus.md)。它是权威规范；本 goal 与其冲突时，以规范为准。

# Agent D — Live verifier / transport integration

## Goal

交付最小必要 replay/transport seam、可选 live verifier 与 mocked 分类/CLI tests；复用 landed production security/pipeline，不写 paper artifacts。

## Context

本 goal 派生自 [执行计划](../../plans/issue-10-execution-plan.md)。v0.3.2 evidence 是启动门槛，不意味着旧 transport API 永久有效。只交 selected commits，不建立部分完成 Issue 的普通 PR。

## Read-first documents

读 canonical spec，重点 §2、§7–9；读 AGENTS/README/PRD/EDD、实际 accepted main 的 src/clip.mjs、Nature adapter/table hydration、safeFetchExternal/article fetch、安全 tests、writer call boundary；读 A replay 和 C assertion APIs。

## Preconditions

记录已 landed v0.3.2/security SHA 与该 commit 成功 Main CI URL；重新检查最新 main 实际 API。隔离 worktree/branch，不干扰 release/security agent。A H1 稳定才连接 replay；C API 未稳定可先实现独立 mocked CLI/classification tests。

## Scope

只允许必要参数透传/injected bounded resource reader；可选 verifier、report/classification/exit semantics。没有必要就不改生产模块。

## Owned / preferred files

- scripts/verify-nature-corpus-live.mjs
- test/nature-corpus-live.test.mjs
- src/clip.mjs 的最小 seam（如必要）；adapter 修改仅确需兼容 seam 时先与 integrator 协调

## Dependencies

消费 A declaration/ledger/signature APIs 与 C offline assertion/comparison APIs，向 C 交接可执行 replay seam。不得让 tests/live verifier 各实现一套 parser 或 fetch。

## Required implementation work

1. 先交 transport audit：article/table URL、DNS、redirect、scope、content-type、timeout/body bounds 与 injection 的真实行为。再选最小 API；默认路径与 guards 保持。
2. Verifier 先验 frozen schema/hash/offline assertions，再 guarded live capture、canonical/structured DOI/access 检查、正常 clipNature()/validators 与同 retained projection 比较。禁止 DOI substring 匹配、writer 调用、ordinary paper output。
3. 按 spec §8 实现 options/usage validation、bounded timeout（含 body）、table 25 MiB bound、默认 sequential 与最多两次 transient retries/有界 Retry-After；不 retry parser failure 或绕过 challenge。
4. 复用所有九种 cause taxonomy；severity 与 cause 分开。只在证据足够时归因，live failure 不自动称 regression；JSON 保存 article/phase/assertions/signatures/warnings/transport evidence。
5. Exit 0/1/2/3/64 与 mixed precedence 严格按规范；stdout report，外部持久化只有明确指定路径。普通 CI 只跑 mocks，不跑 live。
6. Mock tests 覆盖每种 cause、mixed results、usage、DNS/HTTP/access/timeout/oversize、redirect scope 与 retries；证明 verifier 不调用 writer，unknown replay operation 在 fallback 后仍失败。

## Do-not-touch boundaries

不改 security architecture、dependencies、release、writer、publisher routing、大模块布局、CI、golden、PRD/EDD 或 canonical spec。必要 seam 之外的 bug 提议独立 Work Contract。规范不可实现时停止受影响假设、保留证据与修订提案；只经人工明确授权改规范，继续未受影响工作。

## Verification

运行 `node --test test/nature-corpus-live.test.mjs` 与实际受影响现有 transport/security tests，记录确切命令；与 C 跑 replay integration，`git diff --check`。Live 仅 opt-in，单列结果；不以站点暂时可访问作为 gate。

## Acceptance criteria

真实 landed API 已审计；最小 seam 保持默认行为和 guards；无第二 parser/unrestricted fetch/writer；所有 taxonomy/CLI/exit/mock cases 通过；正常测试零 live DNS/HTTP。不宣称安全补丁未提供的额外能力。

## Handoff format

提供 base/landed SHA/CI URL、branch/worktree/ordered commits/files、transport audit、seam API/default equivalence、A/C versions、classification evidence/examples、commands/results、live 未运行项、defects/spec proposals 和 C/integrator unblocking 条件。
