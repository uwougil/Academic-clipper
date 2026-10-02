先读 [canonical spec](../../specs/issue-10-nature-corpus.md)。它是权威规范；本 goal 与其冲突时，以规范为准。

# Agent C — Offline regression suite

## Goal

交付真实生产链路的三方言语义回归、确定性和 isolation tests，并独立核验 B 的 source oracle。Validators 之外证明重要 scholarly content 未丢失或重复。

## Context

本 goal 派生自 [执行计划](../../plans/issue-10-execution-plan.md)。保持与 fixture 作者逻辑独立；只交 integrator selected commits，不独立建立部分完成 Issue 的普通 PR。

## Read-first documents

读 canonical spec，重点 §1、§6–7、§9；读 AGENTS/README/PRD/EDD、current clip/adapter/markdown/normalizers、全部 production validators、parser tests、golden tests，以及 A H1/B source handoff。

## Preconditions

隔离 codex/ worktree/branch，记录 accepted-main SHA；A H1 接口稳定才开始 framework。Paper-specific tests 必须有 B admitted source contract；需要生产 replay seam 时等待 D，不能私自 global fetch patch 绕过安全边界。

## Scope

负责 semantic assertion helpers/tests、all-dialect replay、resource scenarios、determinism、bibliography、A → B → A isolation，以及 golden read-only assertions。

## Owned / preferred files

- test/nature-corpus.test.mjs
- scripts/lib/nature-corpus-assertions.mjs
- test/golden-paper.test.mjs 的只读 regression assertions

## Dependencies

消费 A schema/replay/ledger 与 B source contracts；独立回查公开来源或 B retained-block evidence，不能只看 parser result。把 comparison API 与失败 evidence 交 D，用于 live 分类；遇到 oracle 疑问退回 B 解释，不改其 manifest/fixtures。

## Required implementation work

1. 每篇 × markdown/quarto/links 从 article.excerpt.html 进入 clipNature() 的真实 adapter → Defuddle → normalizer → renderer 链路，运行 spec §7 全部 validators 与显式 semantic oracle。
2. 消费每个 expectation/assertion ID；精确检查 metadata/authors、abstract/section order、equation TeX/IDs、inline notation、main/Extended Data figures/captions、tables、citation sequences、crossrefs、external links、UI absence、debug consistency。不同结构不强制统一章节模板。
3. 检查 markdown/quarto zero HTML 与 links strict anchor allowlist；Quarto emitted keys 与 deterministic referencesBib() 一致。避免 full-document snapshots 和 broad minimum counts。
4. 使用 A ledger 保证实际 DNS/HTTP 为零；声明 fresh resources。验证 table success、no cells、HTTP failure、同文章 redirect、逃离 scope rejection；catch 后 fallback 不能吞掉 unexpected request failure。
5. 重复输入验证 Markdown bytes/semantic summaries；A → B → A 验证隔离；重复 bibliography bytes。Warning 必须匹配声明 resource/status/cause，禁止允许所有 warnings。
6. Golden artifact 只读；检查 spec §7 的基准、local paths 和 validators。新 excerpts 不冒充完整 golden。

## Do-not-touch boundaries

不改 fixtures/manifest/schema、生产 parser/security、golden artifact、dependencies、CI/release、PRD/EDD、canonical spec。Independent parser bug 保存最小真实 repro、正确 oracle、实际失败，提议独立 Work Contract；不得修 fixture/expectations 让当前 output 通过。规范问题停止受影响假设、交证据和修订提议，等待人工明确授权；继续其他覆盖。

## Verification

运行 `node --test test/nature-corpus.test.mjs test/golden-paper.test.mjs`，以及相关现有 parser/normalizer/validator tests（记录 inspected 文件与确切命令）；`git diff --check`。Integration script 由 integrator 添加。验证过程不能需要 live network。

## Acceptance criteria

所有 admitted paper/dialect 组合与 expectation 有执行记录；ledger 零 unexpected operations/warnings；semantic/determinism/isolation/bibliography/golden 通过；必需 known failure 不记作 passing coverage。Assertion helper 可供 D 重用，不形成第二 parser。

## Handoff format

提供 base/branch/worktree、ordered SHAs/files、A/B contract versions、oracle 独立核验记录、coverage/assertion 映射、helper API 与失败 evidence、exact commands/results、defects/limitations/spec proposals 和 D/integrator unblocking 条件。
