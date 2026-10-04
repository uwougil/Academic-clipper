# Issue #10 — orchestration handoff

2026-10-04。用户在 Agent B 收尾后明确授予 autonomous orchestrator 任务：自动启动、协调、恢复、审核并集成 C / D / 独立缺陷 agents，直到最终单一 Issue #10 PR 通过新 CI / Secret scan 并保持未合并，或所有未受影响工作完成后出现真正需人工决策的阻塞。本文件保存执行记录，不修改 canonical spec 的语义；权威仍为 canonical spec → execution plan → role goals → versioned handoffs。

用户明确授权的合并范围只有 Issue #10 必需的窄范围独立 parser-bug PR。合并前必须同时具备 source-backed regression、focused / full tests / build / golden / fresh CI / Secret scan 成功、独立 reviewer 零 blocking findings、没有无关架构/安全修改，并确认 reviewed head SHA 未改变。最终 Issue #10 PR 不自动 merge，不提前关闭 Issue #10；每个独立 bug 使用自己的 Work Contract 和精确独立 `Refs #N` 行。

## 启动证据与输入

- Accepted main：e85b1b809b56242b89b6313ce5d1165c745466bb。启动执行 `git fetch origin` 后核对实际 remote main，PR #27 planning commit 5971ebf 为其祖先。
- Main [CI run 37182993143](https://github.com/uwougil/Academic-clipper/actions/runs/37182993143)：completed / success；Ubuntu Node 20 / 24、Windows Node 24 三 jobs 均 success。对应 [Secret scan 37182993093](https://github.com/uwougil/Academic-clipper/actions/runs/37182993093)：completed / success。
- A 原始 selected interface commits：20b48328114f195974e92827583b6bf5875beb27 → 4e0aec64f996a0090a7c74c14edd8ab5051d9639 → 3754d3a781459635e719859353fe3cbdf8741897 → 8f8a3dbf5d83c1475c41a197bcdfd1bf73834679。以实际 origin/codex/issue-10-agent-a 核验；schema / recipe / serializer / projection 1.0.0，sanitizer 1.1.0。
- B source commits：bee3910240c83789dcb6f8ae530c233289fda737 → 61e19e0981d4e82a5a6fb2d8f3c5dd9a0578fc2e → f4cafa32274bf0b1ab427c82c950457feb68fa78 → cd176742ef8733b31c6e6d60814183e0a5eb9eb0 → 143fc77ebdc4bf15dd1cdca63afcddb91e6b55f5。最终精确 owned source input paths 可从末尾 SHA 重建；不要重复选择 B 分支上的 A dependency copies。上述 B patches 的早期来源文档依赖通过显式选择或只取相应文件解决，不能盲目 merge 整个分支。
- B 范围：9 articles、4 table resources、13 excerpts、85 expectations、10 assertion consumers。B 的 source/integrity audit 不代替 C 独立 acceptance。
- Full raw bodies 保留在外部 TEMP，不能进入任何 PR；子代理可以只读核对原始 body hash、pre-sanitize blocks 和 source oracle，普通 tests 不访问 live 网络。

## DAG / 文件所有权

当前 host 并发上限为 4（含 orchestrator）。优先同时运行 C、D、table-footer bug；其余节点在名额空出并满足 dependency 后启动，重复恢复同一 C / D child。

| Node | State at startup | Owner / isolated branch | Dependencies / scope |
| --- | --- | --- | --- |
| A H1 | DONE | codex/issue-10-agent-a | 已核验实际版本与提交；不重写 infrastructure |
| B acquisition | DONE for source inputs | codex/issue-10-agent-b | C 独立审核尚未完成；正确失败证据保持 |
| C framework / source audit | RUNNING | codex/issue-10-agent-c | strict registry / semantic assertions / execution map；不改 B inputs 或 production |
| D seam / verifier | RUNNING | codex/issue-10-agent-d | src/clip.mjs 最小 seam / mocked live verifier；API 早交 C |
| bug-table-footer | RUNNING | codex/issue-10-bug-table-footer | nature.mjs footer extraction、figures.mjs table notes、独立 regression / Work Contract |
| bug-caption-citation | PENDING | 待分配隔离分支 | source-backed duplicate / raw anchor failure；避免与 table agent 同文件并发修改 |
| bug-scientific-units | PENDING | 待分配隔离分支 | source plaintext units 与 sup attachment；独立合同，不削弱 validator |
| independent review | PENDING | 只读 child | 每个 bug 合并前、C / D、final integration diff；精确 reviewed SHA |
| integration / final CI / final PR | PENDING | codex/issue-10-integration | prerequisite bugs accepted-main checks、C 完整 rerun、D complete；最终 PR 保持 unmerged |

每个 child 的具体 worktree、SHA、commands 和 review findings 随其 durable handoff 交付；orchestrator 在决定合并/集成前重新读取实际分支、工作区、PR head 与 checks。不能把 idle agent 当作 verified live wait，不因 child 报 blocked 停止可以解决的前置工作。

## Corpus 大小初审

重新计量 B 最终源状态：13 个 HTML fixtures 共 1577502 bytes；全部 test/corpus 文件共 2977065 bytes，其中 JSON 1399265 bytes（manifest 1115096 bytes），attributes 298 bytes。最大 article 228057 bytes，全部 article / table 在 256 KiB / 64 KiB 默认硬上限以内。

Canonical §5 的“约 2 MiB”与超过目标时记录理由并由 integrator 审核，需在最终 integration 明确判定计量范围。A 当前 aggregate gate 计 fixture bytes；这里没有填虚假 sizeException。不得为凑大小删除难例、source provenance 或 oracle。最终 integrator 必须审查整个 corpus 的 metadata overhead 和所有 soft-target 超限理由；若需改变 normative requirement，才升级人工决策。

## 后续验收

C 独立消费每个 admitted expectation（85 个）与所有三 dialect，并运行真实 production validators；所有 blocked expectations 在 D seam 与各 landed bug 后恢复，不允许隐式 skip / warning wildcard / broad minima。D 使用 C API，保持 guarded transport、同 retained projection、taxonomy / exit / retry / timeout / size / no writer 语义。独立 review 与 canonical 全套 checks 成功后，最终单一 PR 使用 `Refs #10`，fresh 三平台 CI 与 Secret scan 均成功且 head 一致时达到 READY FOR HUMAN FINAL REVIEW。

该记录是执行起点，不是完成声明；最终状态、selected SHA DAG、bug Issues / PRs / landed main checks 与验证结果须在最终 handoff 更新。
