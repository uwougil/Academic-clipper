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

## 2026-10-05 UTC 恢复与审查 checkpoint

重新执行 `git fetch origin`，remote main 仍为 e85b1b809b56242b89b6313ce5d1165c745466bb；对应 Main CI 37182993143 与 Secret scan 37182993093 completed/success。恢复继续原 Goal，不将当前中间状态当作完成。

- B additive source attribution commit：b718fa8b826c2abeb45c2dd30cd5414b3d6d8330（已 push，原 B worktree clean）。9 source-evidence 新增 `nature-source-rights/1.0.0` 作者/原许可声明/源 locator/hash；不改 manifest、85 source values 或 13 HTML/hash。13 fixture bytes 仍 1577502；全部 corpus metadata 后为 3010072 bytes。完整 notice 与 site footer copyright 分开，4 table 页没有观察到 CC link，真实记录空列表并关联 article notice。最终 source-only commit DAG 追加该 SHA，不重复 dependency snapshots。
- C same child 的前轮运行因 account usage limit 意外失败；原 branch / API commit a896ee7e1fc4700ed5ce6dcbfb46fa594c27cf47 及未提交 helper/两 tests 均保留。已恢复 SAME C，读取实际 source-audit-final.json / comparison reports 后固化 checkpoint，不能重做 oracle 或丢弃失败。C 已独立报告 85/85 原 source values、13 source/hash/subtree/projection PASS；每个 expectation ×3 的最终执行记录待其正式 commit。
- D actual seam 85862de8e835a42ee198e2620be85a207a083e1d 已交 C；live verifier/tests 的未提交工作保留在 D 独立 worktree。D 的原 child 当前不运行，名额释放后恢复 SAME D；没有将 stopped child 当作正在等待的进程。
- Table-footer Issue #45 / [PR #46](https://github.com/uwougil/Academic-clipper/pull/46)，初审 head 5a02ceccd29680493ac58d88f0fc9599ecf2f9a3。Fresh [CI 37217183020](https://github.com/uwougil/Academic-clipper/actions/runs/37217183020) 三平台 PASS；[Gitleaks 37217183012](https://github.com/uwougil/Academic-clipper/actions/runs/37217183012) PASS；本地 focused 9 / affected 63 / full 265、build/golden/source hashes PASS。独立 reviewer 仍发现 blocking P2：相同 letter note 存在时，indexed / Greek / span-wrapped genuine scientific superscript 被误转为 bold footer marker。已恢复 SAME bug owner，要求 synthetic boundary regressions + 最小修复 + 全套重跑 + new exact-head re-review / fresh checks。该 head 未合并；green tests 不抵消 review finding。
- Caption/citation bug 除原 duplicate/raw anchor failure，还需核对 C 的 pangenome source Fig1/3/4/5 与 output short-alt sequential1/2/3/4，以及 COVID caption 同文章 Methods #Sec2 未按 retained local heading 转换。保留 exact source hashes；canonical §2/§7 已要求 short alt / dialect crossrefs，不降低输入要求。
- 新的独立 literal-bracket evidence：astro `a-section-1` p5 `[O <span class="u-small-caps">III</span>]`，source subtree SHA 6c4a2d899f9bfa7a2cd7c4263e7f0e67dbc70a9623fe3560254b8502fadeb3d6，source8 display vs output17；chemistry `a-section-2` p0 `[<sup>3</sup>H]-<i>t</i>-...`，SHA 1d03f1991268ca7b64f42caa0f4a5e348594a8d2c129ce9cd756ff5ca7b1359f，source0 vs output1。需独立 narrow bug Work Contract，不删除真实 bracket 科学文本。
- Materials scientific adjacency 的准确原文为 `128<i>x</i>0<i>e</i> + 64<i>x</i>1<i>x</i> + 32<i>x</i>2<i>e</i>`，`a-section-6` p37 SHA 606a4dbc6f17d727f95d873d015c680a39155c48d9d5e7f2fe8dc9f04264b364。此前 chat shorthand 不是原 DOM，不能用它造 fixture；后续 bug agent 必须从 untouched source 取完整节点。

这些缺陷属于 agent-resolvable independent prerequisite bugs / dependency pending。没有 canonical/security semantic change、人工 sizeException 或已经满足的 final integration start condition；所有 required failures 保留，final Issue #10 PR 仍未建立。

## C 完整 checkpoint 与第二轮审查

C authored commits 已 push，依次为 a896ee7e1fc4700ed5ce6dcbfb46fa594c27cf47 → bc790819d476f7e25f7eaf4acb4d56dc73f295b9 → 5d305fa72effae2bc34770e339c1e30b3ae07d19 → d8aaaf1c489f76f60fa142b6bd3df7266213052b → ff3e714c707ccc619d00a7c42dd2d155cd1be631。只包含 C helper / 两 tests / handoff。最新 helper / source target-type API 为 5d305fa，版本仍 1.0.0；mutation guards 另在 d8aaaf1 固化具体 passing predicate baselines。不要重复选择 C 分支 A/B/D dependency copies。

C durable handoff 明列全部 85 expectation rows 与每个三 dialect outcomes：255 = 171 pass / 84 fail，57 EXECUTABLE_NOW / 28 BLOCKED_BY_PARSER_DEFECT / 0 seam / 0 spec blockers；broad suite 365 = 233 pass / 132 fail / 0 skip，132 包含 parent / validator failures。Source raw/DOM oracle 85/85、13 raw/subtree/recipe/fixture projections 和 B attribution 9 notices / 4 tables 独立核验通过。Framework focused 13、existing regressions 68、mutation baseline guard 1 通过。C 工作区 clean，以 DEPENDENCY_PENDING 结束并等待 SAME child 恢复；不把当前 mandatory failures 当作完成。

D 已恢复并消费 unchanged C 5d305fa helper，独立记录 Git blob d9f823716f93f1135b1e2b2acb3436b7e7955a4c。严格 C API 让当前 9 entries 均在 offline-assertions 报 PARSER_REGRESSION / exit 1，injected live ledger 因 gate 为 HTTP0 / DNS0 / unexpected[]。D 的 controller mocks 成功不代替 C source acceptance。D 仍在完成 inline live table 依赖 external comparison resource 时的 per-attempt transient retry edge，最终代码/handoff commit 与完整验证待其交付。

Table-footer PR #46 第二轮 head 为 23ffa22e6a6ea498bd9133fe71ba7088a0272339（be2855e 红回归，23ffa22 最小修复/handoff）。19 focused / 73 affected / 275 full / build / golden / source checks PASS；fresh [CI 37265933758](https://github.com/uwougil/Academic-clipper/actions/runs/37265933758) 三平台和 [Gitleaks 37265933773](https://github.com/uwougil/Academic-clipper/actions/runs/37265933773) 均成功。但 SAME independent reviewer 在此 exact head 仍找到 blocking P2：parenthesized unit branch 将 `Mean value (<i>ab</i> <i>cd</i>)<sup>a</sup>` 与两种 numeric indexed products 误判为 units，从而丢失指数。原四个反例已修正；新三个反例均为明确 synthetic boundary checks，不冒充真实 source。Reviewer 独立核对真实 7 FRB marker contexts 后完成 external `pr46-23ffa22-review.md`，工作区 clean / 无 source edits；该 head 仍未合并。已再次恢复 SAME table owner，要求保护 arbitrary/indexed/styled products、保留实际 pc cm−3 / M⊙ / M⊙ yr−1 annotations，new head 仍需完整新 checks 与 SAME reviewer。

Caption/citation child 已在 `codex/issue-10-bug-caption-citation` / managed `issue-10-caption` worktree 开始独立原来源 preflight。它重新核对 e85b1b8 accepted main / CI / Secrets，只可写 nonoverlapping 新 red tests/excerpts/provenance/Issue intake；nature.mjs / figures.mjs overlap gate 仍锁定，等 table fix 接纳后的 Main CI 再释放。它须诊断 duplicate/raw citation caption 的实际根因；若图表 original identity / sparse short-alt / body table links 是独立机制，提交单独 Work Contract 提议，不能把所有 parser failures 混在一个 PR。
