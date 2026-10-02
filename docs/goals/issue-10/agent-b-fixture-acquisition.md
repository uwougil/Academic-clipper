先读 [canonical spec](../../specs/issue-10-nature-corpus.md)。它是权威规范；本 goal 与其冲突时，以规范为准。

# Agent B — Fixture acquisition

## Goal

交付 5–10 条经过 admission gate 的真实来源 excerpts、可审计 provenance、source-derived expectations 与覆盖矩阵，不能为通过 parser 而改写科学内容。

## Context

本 goal 派生自 [执行计划](../../plans/issue-10-execution-plan.md)，候选只是研究线索。可内部并行公开 article 调研；协调单一 manifest owner，最后只向 integrator 提交 selected commits，不建立部分完成 Issue 的普通 PR。

## Read-first documents

读 canonical spec，重点 §4–7；读 AGENTS.md、README、PRD/EDD、当前 adapter selectors、metadata extraction、references numbering、table hydration 与现有 golden tests。无需 PR #13。

## Preconditions

隔离 codex/ worktree/branch，记录 accepted-main SHA。来源访问必须复用 guarded transport，禁止带账号/token/cookies；完整 capture 只在内存/外部临时路径。不得覆盖 papers/ 或 golden。

## Scope

负责真实 source admission、retained block selection、fixture/provenance/oracle 与来源文档。只研究公开 usable DOM；挑战页、preview、不可验证内容不算 article fixture。

## Owned / preferred files

- test/corpus/corpus-manifest.json
- test/corpus/fixtures/**
- docs/nature-corpus.md 的 source/coverage 部分

## Dependencies

可与 A 并行调研并保存临时来源证据；A H1 稳定前不冻结 manifest/fixture recipe。使用 A schema/sanitizer/hash helpers，提供真实结构反馈；C 独立核验来源和期待，不由 B 修改 C tests。D 选择实际 transport seam。

## Required implementation work

1. 按 spec §4 逐项核验 canonical URL/DOI/title/journal、实质 article body、claimed structures、distinct DOM。记录 rejected/replaced 理由，保证全部必需角色覆盖。候选替换在 admission gate 内可自主进行，不伪造来源。
2. 保留完整 semantic blocks、所需 ancestors/siblings 与 references prefix；记录 source locators、pre-sanitize subtree hashes、transformations/omissions。用 A sanitizer 生成 UTF-8/LF excerpts，再人工核对 scientific markup/topology。
3. 为 article 与各 table resource 分别记录 source/fixture hashes、observedAt/captureMode/versions；保留可复核公开来源位置，不能把 hash 当作真实性证明。
4. 从源内容冻结 exact retained counts、ordered identities、TeX、caption/abstract sentinels、section hierarchy、citation clusters、inline/crossref cases、resource/warning contracts。把 full-page live observations 与 excerpt expectations 分开。
5. 捕获真实 HTML table success 与无 cells fallback；必要时新增/替换候选保护不同 table shape。HTTP/redirect 模拟另行明确标记，不伪装源内容。记录大小/超限理由。
6. 向 C 交接每条 coverage → retained block → assertion ID 与 source evidence。不能用当前 parser 输出生成 oracle，也不能删掉困难结构掩盖 defect。

## Do-not-touch boundaries

不改生产代码、tests、schema/helpers、dependencies、CI/release、golden、PRD/EDD、canonical spec、Issue #10 或 PR #13。Parser defect 保留 truthful reproducer/正确期待/实际结果，提议独立 bug Work Contract，继续其他 articles。规范假设失败时停止受影响工作、保留证据并在 handoff 提议修订；只有明确人工授权可改规范。

## Verification

运行 A 提供的实际 schema/hash/sanitization CLI 命令，交接时记录完整命令；检查重复生成 byte equality、path/secret audit、size policy 与 `git diff --check`。不把 live acquisition 成功当成 offline parser 成功。

## Acceptance criteria

5–10 admitted articles、必需 coverage roles 完整、来源/转换可追溯、零编写 scholarly content/secret/binaries、hash 与 files 一致、exact oracle 已交 C 独立审核。未解决必需覆盖缺陷不得标完成。

## Handoff format

提供 base/branch/worktree、ordered SHAs/files、A interface version、逐篇 admission/rejection/coverage/provenance/omissions/size、oracle source positions、replay resources/expected warnings、commands/results、defect evidence/spec proposals 和 C unblocking 条件。
