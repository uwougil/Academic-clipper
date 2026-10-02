先读 [canonical spec](../../specs/issue-10-nature-corpus.md)。它是权威规范；本 goal 与其冲突时，以规范为准。

# Integrator — Single Issue #10 delivery

## Goal

整合 A/B/C/D 的 accepted commits，完整验证真实性、覆盖、边界和三平台 CI，准备一个最终 focused Issue #10 实现 PR。少写 feature logic，接口问题优先退回 owner。

## Context

本 goal 派生自 [执行计划](../../plans/issue-10-execution-plan.md)。Canonical → plan → goals → commits/handoffs → single final PR 是权威层级；当前 planning PR 不是 implementation completion。

## Read-first documents

读 canonical spec 全文、execution plan、全部四份 agent goals/handoffs；读 AGENTS/README/PRD/EDD、Issue #10、当前 CI 与 issue-finalize automation，以及实际 selected diffs/tests。无需历史 PR #13 才能验收。

## Preconditions

隔离 codex/ integration branch/worktree 从最新 accepted main 启动；记录 v0.3.2 landed SHA/成功 Main CI。A H1、B admitted contracts、C independent assertions、D transport/mock evidence 均可审阅后接纳；不要改变其他 agent 工作区。

## Scope

选取 commits、协调接口、验收/文档/scripts、最终 PR 和交付证据。只解决必要 integration 问题，不增加 publisher/refactor/independent parser bug。

## Owned / preferred files

- package.json 的 test:corpus / test:corpus:live scripts
- README.md 的 opt-in/offline 操作说明
- docs/nature-corpus.md 的最终运行/handoff 说明（保留 B source evidence）
- .gitignore 仅必要 generated report entries

## Dependencies

A → B finalization/C framework/D replay；B → C paper oracle；C comparison → D final verifier；A/B/C/D → integrator。A/B 可从 T0 并行，C 等 H1，D 等 landed v0.3.2 成功 CI 并检查实际 API。不能以 chat 中的口头完成替代 commits/evidence。

## Required implementation work

1. 按 A → B → C/D 接纳 selected SHAs，审核 owned/shared files；冲突退回 owner 或仅做必要接口协调，禁止直接放宽 oracle。记录实际最终 commit/file provenance。
2. 核验 5–10 admitted articles 与所有必需结构角色、source authenticity、hash definitions、omissions/size、source-independent assertions；确保无 old fabricated HTML/计数迁入。
3. 验证全部三方言/semantic validators、replay ledger、warning policy、determinism/A → B → A/bibliography、golden 只读以及 live mock taxonomy/guards。Known mandatory failure 不能算完成。
4. 添加明确 test 文件列表的跨平台 scripts，不用 shell glob；保持现有 routine CI matrix，不调用 live。README/guide 如实说明 excerpt vs full page、opt-in live、classification/exit codes。
5. 执行 canonical §9 完整验证与 tracked filename 审计，核对 source/runtime/security/release/intent 边界。每个必要 defect 单独 Work Contract；依赖 bug 未解除或规范待人工修订时暂缓最终完成声明。
6. 准备一个最终实现 PR，精确独立 Refs trailer、无自动关闭关键词；PR 保存 base、覆盖/omissions、exact commands/results、defects/deviations、CI 和 durable handoff。Merge 只接纳代码，成功 merged-commit Main CI 才由 automation 完成 Issue。

## Do-not-touch boundaries

不混入 PR #13 commits；不改 dependencies/release/security architecture/writer/extension/CI matrix/PRD/EDD/golden。不得替 agent 隐藏缺陷或自行改 canonical spec；规范问题停止受影响假设、记录证据并请求人工明确修订，其他工作继续。当前已有 planning PR 不可作为最终 delivery PR。

## Verification

运行 `npm ci`、`npm run test:corpus`、`npm test`、`npm run build`、`npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`、`git diff --check`、`git status --short`、`git diff --name-status`/tracked-file audit；确认 Ubuntu Node 20/24、Windows Node 24 jobs。Live 如运行独立报告，绝非 routine gate。

## Acceptance criteria

Canonical §9 全部满足；没有未承认的 scope/intent/spec 变更；所有 agent evidence 可从仓库/PR 重建；只有一个最终实现 PR 负责 Issue #10。PR-ready 不等于 Issue completed，遵循 merged-commit Main CI 生命周期。

## Handoff format

最终 PR 记录 integrated ordered SHAs、base、ownership/interface versions、source/coverage audit、verification commands/results、平台 CI、live status、defects/omissions/spec decisions。交接下一步和是否尚待 merge/Main CI，不能提前关闭 Issue 或宣称完成。
