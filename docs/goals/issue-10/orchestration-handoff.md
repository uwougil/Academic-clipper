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

## D 已提交与前置缺陷调度（2026-10-05 05:30 UTC）

D 已以 `DEPENDENCY_PENDING` checkpoint 结束，原 worktree clean / branch 已 push。原始 authored commits 应依次选择 `85862de8e835a42ee198e2620be85a207a083e1d`（最小 clip seam）、`4fe27f4a5702df767f9842972219a5be8fa3fab4`（verifier / 39 D tests）、`3de7c52c42c59d9b86dce57c04a516f19d0c0e43`（durable handoff）。只选择这些 D originals，不选 A/B/C dependency copies。实际 C helper Git blob `d9f823716f93f1135b1e2b2acb3436b7e7955a4c` / SHA-256 `17ecf2bdef3d3fcdf2590e649c655b1d58c7fa5f405f7cdfba2da4690148eec5`，版本未改。

D 最终本地报告 focused security/transport/verifier 68/68、full 327/327、build/golden/diff PASS；root 已核对 committed handoff、ordered history 和 clean 状态。这些验证证明 taxonomy / guards / strict preflight 正确保留真实失败，仍不等于 mandatory source acceptance。9 source entries 全部 offline-assertions `PARSER_REGRESSION`，85 expectations 中 57 pass / 28 fail，injected live ledger HTTP0 / DNS0 / unexpected[]。Required parser fixes accepted 后恢复 SAME C / D，不能用 synthetic controller mocks 抵消 source failures；D 独立代码审查尚待 reviewer。

Table-footer PR #46 当前 head `aa30e3de917d0e34d423ec5de3b7471b3f571648`，新增 `70aaf1cfd4f4fce1e7ae77d0d5ca31427bc179b9` red 和 `aa30e3d` fix/handoff。作者报告新 27 regressions 在旧生产上 20 pass / 7 fail，修复后 focused27 / affected81 / full283 / build/golden/source PASS；真实 7 FRB markers 保持，其余 12 unit failures 仍明确为独立缺陷。SAME independent reviewer 正在复审 exact head；之前两轮 P2 不因旧 checks green 视为关闭。Fresh [CI 37267742493](https://github.com/uwougil/Academic-clipper/actions/runs/37267742493) 三平台在 root 05:30 snapshot 仍运行；[Secret scan 37267742494](https://github.com/uwougil/Academic-clipper/actions/runs/37267742494) success。PR body exact `Refs #45`，没有 `Refs #10` 或 auto-close keyword；14 changed files 限于两生产文件、最小真实 excerpts/provenance、regression 和 handoff。未 merge，也未释放 shared-file gate。

Caption/citation 独立 [Issue #47](https://github.com/uwougil/Academic-clipper/issues/47) 已建立（bug / OPEN）。作者 preflight 用三份真实 source excerpts 记录 raw/subtree/fixture hashes、A recipes、完整 ordered creators/CC notices；基线 red 11 tests = source integrity1 pass / behavior10 fail / 0 skip。当前根因报告为 captionHtml 在 semantic preparation 前冻结，以及 Defuddle 将已知内部 numeric target 链接克隆/重分类。作者须用 focused source regressions 证明范围；稀疏 Fig1/3/4/5 short-alt 是独立机制，不纳入本合同。拟改 nature.mjs / figures.mjs / citations.mjs / clip.mjs，仍等 PR46 accepted merged-main CI；没有共享生产文件并发编辑。

Plain-text scientific units child 已启动（`/root/bug_scientific_units`），先自建 isolated managed worktree、核对 actual accepted main、独立读取 B/C 原来源并做 source-backed red / Work Contract。此时只允许新的 nonoverlapping tests/excerpts/provenance / Issue intake，不允许编辑生产；root 在实际 root cause / paths 明确后调度 file-owner release。Leading isotope、literal brackets、materials adjacent styles 与 sparse figure alt 必须分别判断是否独立机制，不能合并成一个笼统 parser PR。Final integrator start gate 仍未满足。

## PR46 已接受与下一轮执行（2026-10-05 05:52 UTC）

同一 independent reviewer 已保存 exact `aa30e3de917d0e34d423ec5de3b7471b3f571648` 最终审查包，明确零 blocking findings。它独立执行 focused27/27、affected81/81、full283/283、npmci/build/golden/source PASS，重现原 source note-loss 红证据及 `70aaf1c` 27/20pass/7fail，19 个 scientific contexts 与 accepted-base cell bytes 全相等，原6excerpts共21778bytes / 1-2-6notes / 7source marker positions / ordered creators / 原 license notice hashes 通过。External packet 为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-review/pr46-aa30e3d-review.md`；root 实际读取该包，未用作者自检或旧 head review 代替。

Root 复核 fresh CI `37267742493` 与 Secrets `37267742494` 的 exact head / 全部4checks SUCCESS，14files窄范围、protectedpaths无diff、body exact `Refs #45` 且无自动关闭关键词/`Refs #10`，HEAD/base 未变。`git diff --check` 初次从缺少此 bug fixture attributes 的 orchestration checkout 执行，因原 source 行尾空白报错；随后在已审查 bug checkout 读取 scoped `.gitattributes` 和 `git check-attr whitespace`，按原 source-preservation `whitespace=-blank-at-eol` 属性执行全diff check PASS、statusclean、HEAD一致。未改任何原 HTML bytes 或全局 Git whitespace 设置。

十项门槛满足后执行 `gh pr merge 46 --repo uwougil/Academic-clipper --squash --match-head-commit aa30e3de917d0e34d423ec5de3b7471b3f571648`，exit0；PR46于 `2026-10-05T05:42:58Z` 合并，squash SHA `e0a341fc97ff845a250c2f016dcb2363e10ed49e`。Root fetch 验证 remote main=此SHA。Merged Main CI `37269007138` completed/success，Ubuntu24 `111631813071`、Windows24 `111631813246`、Ubuntu20 `111631813297` 全 success；Secret scan `37269007093` / Gitleaks `111631812915` success。Finalizer `37269456893` success；GitHub API 确认 Issue45 `state=closed,state_reason=completed,closed_at=2026-10-05T05:49:14Z`。Issue10仍 OPEN，root未手动关闭任何 Work Contract。

此 SHA 是新的 accepted main。Caption Issue47 的 preflight originals `97b193b738abb508736a4a7c5459c951f9d4c76c` 已 clean/pushed：9 owned test/excerpts/provenance/handoff files，原生产未改，red11=source1pass/behavior10fail/0skip。Root已将accepted main及Main CI直接送 SAME caption child，释放它的 nature/figures/citations/clip shared-file gate；它须 rebase、重现红、实施最小fix，保留acceptedtablebehavior。Units SAME child仅获 academic-inline.mjs 自有生产范围（若该文件足以证明/修复同根因），其余共享文件锁定；原capture/oracle/spec/validators都不改。C在名额允许后恢复SAME分支接入acceptedtablemain并复验全部85×3。

同一 reviewer 同时开始 C ff3e714 / D3de7c52 checkpoint 独立实现审查。它已实际重现 C 的 P2：真实 golden/quarto `source-figures-v1` baseline passes，删除最终 rendered Fig1 caption 中间原词 `dimensionality` 且不动 model，consumer与四validators仍pass。完整 model caption断言只在model验证，最终Markdown仅用首尾/sentinels，故没有保护中间文字完整性。Root将把漏洞交还SAME C加强最终rendered语义/真实passing-baseline mutation，不改变B source oracle；此P2独立于已知parser prerequisites。Reviewer尚未交最终C/Dpacket，checkpoint审查不能当全255 source通过或允许integrator开始。

对B最新 `b718fa8` Git objects 重计：`git ls-tree -r -l b718fa8b826c2abeb45c2dd30cd5414b3d6d8330 -- test/corpus`，29files / 3009503 Git bytes；其中13 HTML=1577502，JSON=1431707，剩余attributes=294。Physical checkout3010072的差异为既有schema等text checkout换行，不是sourcefixturehash变化。Final integrator须审真实Gitbytes/metadata overhead及canonical约2MiB目标，不能伪造sizeException或删难例。
## C/D 独立审查与第二组前置 PR（2026-10-05 06:18 UTC）

SAME reviewer 已交 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-review/issue10-cd-checkpoint-review.md`，root读取实际包。C exact ff3e714 除图注中间缺词漏检，另有第二个真实 P2：将一个实际 quarto `[1a](#fig-figure-1)` 改指 `#fig-figure-2`，保留其它正确同目标 links/model，consumer和四validators仍pass；原逻辑只全局证明target存在而未绑定具体source occurrence。两个有真实 passing baseline 的 mutation packets 保存于同目录 `c-checkpoint-mutations.*`。D exact3de7c52 控制器零新增阻塞；reviewer独立68focused/327full/build/golden及实际C strictAPI、body timeout/streamed overflow取消通过，当前9source失败与28expectation失败保持，live ledger0。此结论不是完整corpus acceptance。

Root已恢复SAME C，C用dependency-only merge `0729b3cf48ec6ad1ba8a8148f3c29af41a959139` 接入accepted e0a341f，保留原published authored SHA，不选该依赖merge作C delivery。它已证明两 reviewer mutation在未改helper上真实失败回归，再加强完整rendered figure caption frame与逐source occurrence target绑定；focused3/3报告通过，全部255复验/newhelpercommit和独立重审仍待交付。Golden/COVID source-tables-v1已三方言通过，FRB六notes通过而整体不通过。

新确认独立FRB table MathJax损坏：原 source TeX subscript `_` 在实际 rendered math 被写为 `\_`，是字面underscore而不是原subscript attachment，不能作为presentation等价放宽。原 table body SHA `97eaaa31a6f3443e63ad7cf2cef66776d72d61c6b0f0d2956d87cd43b39485a2`；`#content table.rows[9].cells[0]` prehash `d3c724281061d956a645d0254f64feaa280764a0c32a35d2fea4a84c432c2216`，`[10,0]` `8016f6120773882fd35c9e929862a40929e2e0215f628d3f70c8d3759cb80403`，`[10,1]` `2ed0971e787d02ac7c490e6d6ae15e03298b925ddb0296f708330ed789bdcbc4`。源为DM的MW,disk/MW,halo/host下标与`{903}_{-111}^{+72}`。C保持三renderedCell paths ×3dialects真正失败，source HTML/实际输出在C external `frb-table-cell-source.json` / `frb-table-presentation.json`。Root将独立分配table MathJax转换合同，必须复用原source typed TeX，不全局unescape合法literal `\_`，不塞入Units48或改Coracle。

Caption Issue47的 [PR49](https://github.com/uwougil/Academic-clipper/pull/49) 已创建/attached，exact head `97b7203db448ec2397024009d7c7fe5639d08d82`，base e0a341f。Red `9bd15729b8454d03d1a5f51201d162db874dc09b` → source-proven own-test correction `13a8b860608f389e701540d4de29a53c8c110cd3` → repair/handoff97b7203。正确回归在accepted source production依然1pass/10fail，修后11focused/54affected/294full/build/golden PASS。来源证明共享尾句Fig1/Fig2各一次；minimalquantumrecipe只有一Fig1link、无Fig6link但有真实Fig6target，原raw两Fig6refs在recipe外，不能假称fixture含它们。Root独立读PRchecks：CI37270617499三平台 / Secrets37270617500均SUCCESS；SAME reviewer正在审exacthead/source/correctedred，尚未merge。

Units独立 [Issue48](https://github.com/uwougil/Academic-clipper/issues/48) / [PR50](https://github.com/uwougil/Academic-clipper/pull/50)，目前已发布head `d94631ccf4720a4f8383a7ce1fb161bdc6e786e0`、basee0，production仅academic-inline.mjs，rawsource/3excerpts/hash/recipe/orderedcreators/CC notices不改B。Red original及acceptedmain rebase checkpoint `12874177091badf820157706fb482400f3227942` 明确2pass/6fail，保留SR7与FRB12真实simpleunit/power错误。修后reported63focused/292full/build/golden PASS；oldhead freshCI37270908434/Secrets37270908404全部SUCCESS。但作者自审发现新增math-opacity pass的escaped-dollar边界：合法`$\text{cost \$5}$ cm<sup>2</sup>`误识closing dollar；作者在同scope追加synthetic control和最小修正。Root明确旧head不得merge，newhead须newfullchecks/CI/独立review。Artifact shared-state误移除caption49已由root重新attach49，GitHub PR与作者代码未被改。

Units还提供独立未覆盖源证据：materials Main paragraph2 `r<sup>2</sup>SCAN` prehash `13879004c6bdfc0f8919bf4aae21b7c2dcbf3e057ca85daf77174f2c6b717687`，Methods paragraph42 `mScm<sup>−1</sup>` hash `7f1338d170c587581f6886da41018abd505a2e25e2522e988d6348aa9c3b2eb4`；FRB Methods paragraph22 `(5/60)<sup>2</sup>` / `(0.19/60/60)<sup>2</sup>` hash `4fe682650c4c464c1d6341c364241d29e154f18ecf7c8565de908b840c9a6fe5`。与已存literal brackets/isotope/materials adjacent styles/sparsealt packet须分别判断实际机制和file scope，再交窄bugchild；未声明这些被简单units修复。仍无规范/安全政策变更或已满足的integrator start gate。
## 图注前置修复合并与新 C 断言检查点（2026-10-05 06:31 UTC）

PR #49 exact `97b7203db448ec2397024009d7c7fe5639d08d82` 在全部十项自动合并条件满足后，由 root 执行 `gh pr merge 49 --repo uwougil/Academic-clipper --squash --match-head-commit 97b7203db448ec2397024009d7c7fe5639d08d82`。GitHub 返回 mergedAt `2026-10-05T06:27:39Z`，squash main `4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2`。独立 review packet `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-review/pr49-97b7203-review.md` 对该 exact head 零阻塞，实际 raw/recipe/完整 caption middle/两个真实 quantum Fig6 links/controller controls/revised-source RED 全部独立核查；其 own RED 1 pass / 10 fail、54 affected / 294 full、build/golden 全通过。Fresh PR CI `37270617499` 三平台 jobs `111636623685` / `111636623886` / `111636623951`、Secrets `37270617500` / Gitleaks `111636623739` success。Root 合并前再次核验 unchanged head、base e0、四 success checks、13 个窄范围文件、clean/diff checks、精确 `Refs #47`、无自动关闭关键词、protected diff 空。没有合并 Issue #10 delivery。

合并后的 Main CI `37272529095` 和 Secrets `37272529070` 正在验证 exact4783291。此 checkpoint 的最新 accepted main 仍为 e0a341f；未以 PR CI 或 main pending 替代合并后接纳。待三个 Main jobs 和 Secrets 成功后，恢复 SAME C / Units owner / D 并核验 Issue47 finalizer completed。

C 新 strict helper authored commit `6c38ad8156c6f5e3a1b7b97729640158b7772c7b`：先以旧 helper 证明两个实际 passing-baseline mutations 被错误接受，再加强每个图注完整 final-rendered paragraph frame 和逐个 source occurrence target 消费。旧模型正确且全局其它正确 links 存在不能掩盖中间缺词或单个错误 href。现实际85×3为170 pass / 85 fail（全 suite371，241 pass / 130 fail，0 skip）；这些是 accepted e0 + 新严格 helper 的真实 known-red，不是覆盖完成。95 existing regressions/build/golden pass，完整 durable handoff正在固化；之后由同一独立 reviewer 重测 exact new helper。

C occurrence 检查新增 source-backed crossref packet，原始与 sanitizer 后 hashes 明确区分：pangenome `a-section-3` paragraph8 / `figure-4-desc` Methods `#Sec18` 原 raw paragraph `624b319c81ef1e2e6746de008d449b27dbd2c00fcda4f7a1456054df7237463c`、frozen `220204e973160f6db2ec943e6d331f545be8d24f493abf733931748318fd82b6`；materials `a-section-4` p1 raw `315a861d7209ff9b9aa5f8821052ee84db09ced247bf0cd84bd363c87300e518` / frozen `884d8b41fd08d30261e2d725010a64383221bd9eff75a131af15de30647dcf81`、`a-section-5` p1 raw `3371178da2f8a14ece18de2596f65e2306208df8e9d1c195a2c803a61d7f2913` / frozen `c2eac8cea9de8fac0a21127513b05a728471568058c42d4372f63cc7ce3823ac`；SR `a-section-2` p10 raw `c6e953188b6320ca3109839fac6f8d7dd15ea0fa0f21fd852f0e1e3eda1d175f` / frozen `497bb1056dae25380809a137e6f0dee41f87f2a802759240bcce1e37326d1290`。前者发生 absolute self URL，后两篇真实数字 figure refs 被转成 prose footnotes；要先消费已 accepted PR49 再判断剩余根因，不创建重复的 bug 合同。

Units PR50 published head 已更新为 `14d35c0e47d69f5834277d2c25f0f947453d9959`，旧 d946 已 superseded；两条 escaped-dollar/code opacity 控制先红后绿，只有既有 `academic-inline.mjs` 生产范围。Own65 focused/294 full/build/golden/diff检查通过，clean；fresh CI `37272060435` / Secrets `37272060536` 对同一14d完成成功。待478 main接纳后恢复 SAME owner 更新base并形成最终精确 head、新测试/CI和独立审查；14d结果不替代后续新 head 门槛。

新增 `bug_table_mathjax` child 开始隔离source/RED preflight，worktree `C:/Users/guoli/.codex/worktrees/issue-10-bug-table-mathjax/academic-clipper`，base e0；仅处理上节三个真实 table cell 下标转义，不归入 Units48，不全局 unescape合法 TeX。Root 在定位实际文件后串行释放生产所有权。Literal brackets 另一个窄合同待 host 并发名额可用后启动；未因名额或 pending checks 停止其余可执行工作。当前无规范/安全/来源政策的 human-only 决策。
## 图注主线接纳与 C 接口固化（2026-10-05 06:40 UTC）

Root 对 exact merged main `4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2` 重新读取 Main CI `37272529095`：Windows24 `111642385793`、Ubuntu20 `111642385891`、Ubuntu24 `111642385902` 均 completed/success；Secret scan `37272529070` / Gitleaks `111642385712` success。Finalizer `37273099892` success；Issue47 API 显示 closed/completed，closed_at `2026-10-05T06:34:34Z`。最新 accepted main 更新为4783291，Issue10仍未完成。

C source-only交接检查点完整固化并推送：authored helper/test `6c38ad8156c6f5e3a1b7b97729640158b7772c7b` → handoff `79ae944ce55bcdf753ade1851587688463a865be`。实际 helper Git blob `7024870f4da896eb4ff2130cfd45991f00139067`，48425 Git bytes，SHA256 `f6de33be4cce85fbf738f784448f5a0f59ea3d0f886399ca48e09cdd20963de3`，ASSERTION_VERSION/API1.0.0不变。C authored checkpoints仅四个 owned paths；dependency-only0729不选为delivery。Root已将此接口直接交SAME D，同时恢复SAME reviewer复验两个 original source mutations。85×3 全部执行、0skip，170pass85fail、56可执行29独立parser缺陷阻塞；在后续accepted fixes上必须恢复SAME C，不能把这些失败转换成warning或修改source。

前轮 quota 意外终止了 table MathJax/reviewer/units恢复；root重新检查实际branch/status/external证据后恢复SAME三个children，没有抛弃已验证source或重做采集。Table child external `C:/Users/guoli/AppData/Local/Temp/academic-clipper-table-mathjax-preflight/preflight-report.json` 保留独立 source audit /9真实RED/完整35creators与article rights；4892-byte own excerpt SHA256 `f274cb827e7d6d10db5e63edc92ef16dac2b52bb34a469c4551479dc36df61eb`。Root授其唯一生产文件 `src/normalizers/figures.mjs` 的 tableCellMarkdown typed math修复，基于新accepted478重新证红后交独立Issue/PR。Units owner只保留academic-inline.mjs所有权，更新PR50到478并做新head全验证；C独立review先完成接口P2复验。此前14d成功checks不作为新head替代。未编辑任何他人worktree/branch。