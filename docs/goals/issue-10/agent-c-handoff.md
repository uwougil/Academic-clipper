# Agent C — 来源核验与离线回归检查点

状态：`DEPENDENCY_PENDING`，2026-10-07。当前生产基线为 accepted `3889f7396eab99060bec88fc8b0dcd3e6712024e`（PR #62 / Issue #57 styled source boundaries）。Reviewed ec53 / helper e3ff、API `1.0.0`、C tests 和 B 科学输入均未变。

本轮仅复验 Materials `s41586-023-06735-9` × 三方言：27 条来源断言全部 PASS，3 个 Markdown / Bib / semantics / replay repeat 全部 PASS。实际 session20692：37 tests = 30 PASS / 7 FAIL，0 skip / todo / cancel，15,697.2445ms。7 FAIL 包括 3 个 validator 子测试及其 parents、receipt 缺 24 个组合的硬 FAIL；不将 partial receipt 伪造为 complete。原 Equ1 / 源 TeX 和 styled group 已恢复，原 4 个 adjacency delimiter issues 消失。整篇仍 FAIL：每方言 10 个 scientific-isolatedSuperscript（9 个 identifier-power、1 个 compound-unit）；links 的 reference2 字面 `(0<x<-1)` 仍触发 rawHtml `x` violation。

当前 85 行是按实际基线标注的已知 registry：27 条 `M3889_NEW`、前轮 ac86 实测 84 条 `AC86_NEW`、原 0de full 的 144 条 `F0DE`，合成 250 PASS / 5 FAIL、83 `EXECUTABLE_NOW` / 2 `BLOCKED_BY_PARSER_DEFECT`。**这不是最新 3889 的全 255 条或完整 suite 验收。** 剩余 source FAIL 仅是前轮 Quantum citation cluster[59] / Equ7、Equ15 occurrence 记录；科学 validators 的既有 FAIL 仍必须通过。原 full380、ec53 partial6、ac86 partial9 的所有 evidence 保留，不覆盖、不重复。本轮没有重跑 13 raw / 85 oracle audit、27/full380、60 mutations、ac86 九组合或任何其他论文。

## 基线、依赖与提交选择

- 原始 accepted-main base：`e85b1b809b56242b89b6313ce5d1165c745466bb`；启动时 Main CI `37182993143`、Secret scan `37182993093` 均为 success。PR #27 planning contract `5971ebf` 已是该 main 的祖先。
- 前轮 accepted main：`e0a341fc97ff845a250c2f016dcb2363e10ed49e`（PR #46 / Issue #45 table footer）。C 独立检查 Main CI `37269007138` 的同一 head：Ubuntu Node24 job `111631813071`、Windows Node24 `111631813246`、Ubuntu Node20 `111631813297` 均 success；Secret scan `37269007093` 和 finalizer `37269456893` 亦 success。仅用 dependency merge `0729b3cf48ec6ad1ba8a8148f3c29af41a959139` 接入，保留此前 published originals。
- 前一恢复接入 accepted `4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2`（PR #49 / Issue #47 caption/citation/crossrefs）：Main CI `37272529095` 的同一 head，Windows24 job `111642385793`、Ubuntu20 `111642385891`、Ubuntu24 `111642385902` 均 success；Secrets `37272529070` / finalizer `37273099892` success。Dependency merge `1b423c37d926d74edc1248e85336f266ebc24a70`。
- 前一检查点在478完整batch结束且root通知accepted后接入 `e2d32e9ec819692a1f08075636c3a168f15ad20b`（PR #52 / Issue #51 table MathJax）：Main CI `37278003744` 的同一 head，Ubuntu24 job `111659279964`、Ubuntu20 `111659280091`、Windows24 `111659280101` 均 success；Secrets `37278003787` success。Dependency merge `23f32e75a54c9585984954a6171010b6e36007f4`。没有消费未 accepted 的 bug branch。B source/oracle 和 production validators 均未改；C 只修来源定位/脚注遮蔽误判，没有放宽 scientific payload/identity/attachment。
- 后续恢复先接入 accepted `6b90413d806f7e611b00559c8208f6b95b31dd1e`（PR #50 / Issue #48 simple unit/numeric powers + code/math opacity）：C independently `gh run view` 验证 Main `37323651988` 同一 head 的 Ubuntu24 `111808767556`、Windows24 `111808767880`、Ubuntu20 `111808768068` 全 completed/success；Secrets `37323651876` success。Dependency merge `6c952d9eeed7b5bfb36d4cfcdfb06c4e699ec88b`。没有重复一轮6b完整known-red，而是等待literal accepted后统一执行。
- 前轮 accepted `0de5c8b5c4c51a9231f250c336216598c10f27ae`（PR #54 / Issue #53 literal brackets）：root accepted notice后，C independently readback Main `37329109194` 同一 head Ubuntu24 `111827337448`、Ubuntu20 `111827337770`、Windows24 `111827337830` 全 completed/success；Secrets `37329109169` success。Dependency merge `b0cee6620a2aa8ae63bddea9e5c7cbdca78c9c78`。Issue53 finalizer在root acceptance notice时尚未关闭，accepted main使用依据为同一merged head Main/Secrets成功，没有将OPEN状态当未通过CI。
- Branch：`codex/issue-10-agent-c`。
- Worktree：`C:/Users/guoli/.codex/worktrees/issue-10-offline/academic-clipper`。
- 前轮 accepted `ac86b2fa509653dfeb43b968472ce6280a51de2c`（PR58/Issue55 sparse-alt与PR59/Issue56 citation eligibility）：C independently readback Main `37681190063` 的Windows24 `112997400634`、Ubuntu24 `112997400858`、Ubuntu20 `112997401004` 全SUCCESS，Secrets `37681189875`同head SUCCESS。Dependency-only merge `889eb55c613e606a634ce0dfd41dee78f26fd8cd`；不重写原authored SHAs。
- 当前 accepted `3889f7396eab99060bec88fc8b0dcd3e6712024e`：root release 后 C independently readback Main `37691610523` 同 head 三 jobs（Ubuntu20 `113032907666`、Ubuntu24 `113032907843`、Windows24 `113032907867`）全部 SUCCESS，Secrets `37691610455` SUCCESS。Issue #57 automation 于21:56:25Z completed（root evidence）。Dependency-only merge `0a52908f36a161ccc6fe9495bf5505263cbc69f6`；没有消费 pending head。
- Runtime：Windows / Node `v24.14.1`；没有代替最终 Ubuntu Node 20/24、Windows Node 24 CI。
- C 自己编写的文件只有 `scripts/lib/nature-corpus-assertions.mjs`、`test/nature-corpus.test.mjs`、`test/golden-paper.test.mjs`、本 handoff。没有修改 canonical spec、B oracle/HTML、生产 parser/security、golden artifact、PRD/EDD、dependencies 或 CI。

按顺序的依赖记录如下；integrator 应选原始 A/B/D commits，不要再选择 C 的依赖复制提交。

| 原始依赖 | C 分支上的重放或记录 | 范围 |
| --- | --- | --- |
| A `20b48328114f195974e92827583b6bf5875beb27` | `2e069de7070dad2982d3c5da70e08b1d3b47a950` | H1 infrastructure |
| A `4e0aec64f996a0090a7c74c14edd8ab5051d9639` | `6e70dbf29c73ed6b8bf14fec36e8d628e24a5f63` | A handoff |
| A `3754d3a781459635e719859353fe3cbdf8741897` | `95f946011ea34eb7e185b986846ec9a21bbf152d` | exact-identity mainEntity support |
| A `8f8a3dbf5d83c1475c41a197bcdfd1bf73834679` | `05dea1067edbfbab691840baafb799d0b318a1c3` | source whitespace/diff policy |
| B final scientific input `143fc77ebdc4bf15dd1cdca63afcddb91e6b55f5` | `bff2f2a90731914194f8dd081f9267a1bb8d8e11` | 29-file read-only dependency snapshot; **不作为 C authored delivery 选择** |
| D `85862de8e835a42ee198e2620be85a207a083e1d` | `f12a4b0351990dd72b3d9682a2cac9c906f52cc8` | actual clipNature transport seam |
| B attribution-only `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330` | 从 Git object 只读核验，没有覆盖本分支 B 文件 | 9 sourceRights additions；manifest/85 oracle/13 HTML 未变 |
| accepted main `e0a341fc97ff845a250c2f016dcb2363e10ed49e` | dependency merge `0729b3cf48ec6ad1ba8a8148f3c29af41a959139` | 保留原始 C/A/B/D SHAs；integrator 从 accepted main 开始，不选择此 merge 为 C authored delivery |
| accepted main `4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2` | dependency merge `1b423c37d926d74edc1248e85336f266ebc24a70` | caption / citation / crossrefs；不选择此 merge 为 C authored delivery |
| accepted main `e2d32e9ec819692a1f08075636c3a168f15ad20b` | dependency merge `23f32e75a54c9585984954a6171010b6e36007f4` | table MathJax attachment；不选择此 merge 为 C authored delivery |
| accepted main `6b90413d806f7e611b00559c8208f6b95b31dd1e` | dependency merge `6c952d9eeed7b5bfb36d4cfcdfb06c4e699ec88b` | simple unit/numeric powers；不选择此 merge 为 C authored delivery |
| accepted main `0de5c8b5c4c51a9231f250c336216598c10f27ae` | dependency merge `b0cee6620a2aa8ae63bddea9e5c7cbdca78c9c78` | literal brackets；不选择此 merge 为 C authored delivery |
| accepted main `ac86b2fa509653dfeb43b968472ce6280a51de2c` | dependency merge `889eb55c613e606a634ce0dfd41dee78f26fd8cd` | sparse-alt / citation eligibility；不选择此merge为C authored delivery |
| accepted main `3889f7396eab99060bec88fc8b0dcd3e6712024e` | dependency merge `0a52908f36a161ccc6fe9495bf5505263cbc69f6` | styled source boundaries；不选择此 merge 为 C authored delivery |

B source originals 由 integrator 选择：`bee3910240c83789dcb6f8ae530c233289fda737`、`61e19e0981d4e82a5a6fb2d8f3c5dd9a0578fc2e`、`f4cafa32274bf0b1ab427c82c950457feb68fa78`、`cd176742ef8733b31c6e6d60814183e0a5eb9eb0`、`143fc77ebdc4bf15dd1cdca63afcddb91e6b55f5`、上述 attribution-only commit。

C authored delivery 顺序：

1. `a896ee7e1fc4700ed5ce6dcbfb46fa594c27cf47` — 初始 shared comparison API；文件 `scripts/lib/nature-corpus-assertions.mjs`。
2. `bc790819d476f7e25f7eaf4acb4d56dc73f295b9` — 严格 source audit、最终输出语义、mutation protection、完整三方言/replay/determinism/isolation 与只读 golden；文件为 helper 和上述两个 tests。
3. `5d305fa72effae2bc34770e339c1e30b3ae07d19` — retained semantic target.type 必须匹配原 DOM 类型；新增错把 Fig1 当 equation 的 mutation protection。只改 helper 与 corpus test。
4. `d8aaaf1c489f76f60fa142b6bd3df7266213052b` — mutation 前显式证明四个相关 consumer 完整 baseline通过，以及table renderedCell和warning特定predicate通过。只改 corpus test；helper API仍为5d305fa版本。
5. `ff3e714c707ccc619d00a7c42dd2d155cd1be631` — 前一轮 source audit / dependency-pending handoff；只含本文件。
6. `6c38ad8156c6f5e3a1b7b97729640158b7772c7b` — 修正 final rendered caption 完整 payload / bold-panel sequence 与每个真实 crossref occurrence 的 target 检查；真实三方言 passing baseline + mutation regressions。只改 helper、corpus test。
7. `79ae944ce55bcdf753ade1851587688463a865be` — accepted e0 / reviewed C P2 fixes 的前一份 handoff；只含本文件。Independent reviewer 已复验两真实 probes，未发现新的 checkpoint blocker。
8. `02c5664ffae4657106843767fa8b58aaab094d26` — 独立核实 source label-only caption paragraph 的 rendered frame、完整 source paragraph 首尾的 scientific locator；没有改科学 payload/attachments。只改 helper、corpus test。
9. `dbe3a1e64241ffd3ea2794485e73954b799225f4` — 将 C footnote-definition mask 锚定行首，保留正文 citation 后原冒号；三方言完整来源 citation baseline 与错邻近正文 mutation。只改 helper、corpus test。
10. `bc81a28d8edf05bbba06b1a82cdedcde3d6f8ac6` — accepted e2 的 380/255实际execution、85行map与source packets；只包含本文件。SAME reviewer对55a actual helper独立复验零阻塞，详见下文。
11. `a9b6287a282bb9854e625168d787947754f0f782` — test-only optional external receipt，重用同一full执行的真实27cache；默认不写、不加生产clip、不改原assertion/execute/helper/API。只改 `test/nature-corpus.test.mjs`。
12. `ec53d6578c3103a95c9334f71f5ef14ef597303b` — 仅 source citation literal `_` / `*` 邻居投影及六个来源回归；只改 helper、corpus test。API仍1.0.0；实际范围、旧RED/新partial和mutation证据见下文。
13. `3006f0f7381ba843efc3c17b98370194b0a04017` — 前一accepted0de/e3ff scoped241/14与来源角色handoff；独立review已clear。只包含本文件。
14. `19e09534736ff77b673fd289ea0b63a91514c7e3` — accepted ac86 三篇九组合的真实 source / validators / cache / 85 scope handoff；只包含本文件。
15. 本次 accepted3889 Materials 定点 handoff commit；其准确 SHA 由 `git log -1 --format=%H -- docs/goals/issue-10/agent-c-handoff.md` 取得，并在交接消息报告。该 commit 只包含本文件。

## 实际接口

A schema/recipe `1.0.0`，sanitizer `nature-corpus-sanitizer/1.1.0`，serializer `nature-corpus-subtree/1.0.0`，projection `1.0.0`。C `ASSERTION_VERSION = '1.0.0'`；本轮加强断言而没有修改 B value schema。

| C export | 使用契约 |
| --- | --- |
| `assertionRegistry` | 10 个 assertion IDs；未知 root/nested value fields、未知版本、无 consumer 的 expectation 均拒绝 |
| `compareArticleResult(article, result, { sourceDocument, sourceHtml, citationStyle, bibliography })` | 必须给对应 immutable retained source DOM/HTML；不使用 parser cleaned HTML。返回全部 expectation `id/assertionId/status/failures`、四 validators、严格 warning differences、semantic summary、整体 `pass` |
| `auditSourceOracle(article, sourceDocument, resourceDocuments)` | 用原始 DOM 或 frozen excerpt 直接核对 source values；table documents 以 resource ID 建 Map |
| `runProductionValidators(result, citationStyle)` | 真正运行 math（含 scientificFragments）、structure、rawHtml、crossReferences |
| `semanticSummary(result)` | 有序 scholarly metadata/figures/equations/citations/references/tables/warnings/validators；排除时间和 Defuddle word count |
| `expectationCoverage(manifest, { transportSeamAvailable, parserDefects })` | 显式枚举每一条期待；本检查点 D seam 已可用，实际状态清单见下表 |

D已可消费并实际采用 `ec53d6578c3103a95c9334f71f5ef14ef597303b` helper。Git blob `e3ff08708d0aee6f364e44a881e98207f6dc6a7b`，50,693 Git bytes，SHA256 `ab23fa7ef25b0a24240929d8428d37300c24979ad15ad9ec1e4a5cb75d1150ff`；test blob `248bc4caa2006ba29100fc2b1bd889c61608c27e`、27,493bytes/SHA256 `985d91b25994c6c524791cf1a1b812c743e4cc6fa9b810b0d5e5fadca64d61e1`。Exports/schema/version仍1.0.0；本轮helper/test字节完全未变。SAME independent packet `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-review/c-ec53d65-3006f0f-review.md`（15416 bytes/SHA256 `448aa60401be67c205974b6a10e69367be45534dcd053e32d2deea0a2a94a0aa`）零implementation blockers，独立真实6GREEN/旧55a6RED、60mutants、481clusters/2source windows、12receipt guards及原255/27/partial6/85rows全部对账。此clearance不代表corpus全部通过。D的ac86九篇Markdown摘要仅作scope提示，未当本轮C验收或完整cache；不得补跑D9以制造记录。

## 独立来源核验

C 读取 B 外部临时原始 HTTP body，而没有重新获取网络资源：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-b`。对 9 article + 4 table 分别先验证 untouched Buffer 的 sourceSha256，再按原 serializer 验证每个 sanitization 前 retained subtree digest，再用实际 A recipe/version 重算 bytes 并与 committed fixture逐字节相等。源验证不读取当前 parser 输出来定义 expected values。

全部 85 条 source oracle 均通过。核对包括完整 ordered creator metadata/date precedence/notes/selected affiliations/contributions/correspondence、abstract ordered paragraphs、source heading levels/parents、equation original IDs/number/TeX、caption完整文本/首尾/panels/image attrs/source位置、citation source DOM 顺序/anchor/range expansion/完整 reference prefix、inline literal subtree/paragraph位置、原 href/text、UI block、table每个 physical cell/span/note。Frozen DOM 的第二次语义核验亦 85/85 通过。

38 条 main figure caption sibling records 逐条通过：真实 image DIV 与 description DIV 是 figure 内同一个 `.c-article-section__figure-content` 的 element siblings。没有要求伪造 figure 外的 description。B `descriptionIsSibling` 的既有值与 `descriptionPlacement` 分开消费，真实内部 topology 由独立 sibling evidence 核验。

新的 B `sourceRights` 直接读取 commit `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330` 对应 Git objects；对全部 9 creators arrays、9 article rights notices（selector/index/text/links/prehash）、9 separate publisher footers、4 table raw hashes/空 table-page license-link观察核对通过。没有把 publisher footer当成文章版权，没有重新许可 excerpts。技术 transformations 与实际 recipe/字节核验一致。该 addition 不改变本轮 scientific results。

| Article / resource | Raw bytes | Fixture bytes | sourceSha256 | fixtureSha256 |
| --- | ---: | ---: | --- | --- |
| s41586-026-10401-1 / article | 437403 | 155363 | ea2508302b4c3af4efe421f02c3de93379b50940dd1a8762166efb38033cc91c | 73c0cbb04cf5d2f3424b4119f9085fad54ae8928665c21c362178bee6c2ec292 |
| s41586-026-10401-1 / table-1 | 172830 | 2968 | 36a52d93aca60fb50cb7452b2990f955f399d1b8a59e5278dff0764a9042d568 | 0f140482b5ed5873629f22df427fffe01aa5374c6253e465a4678f1ea1749677 |
| s41534-023-00746-0 / article | 511799 | 228057 | 6b2bb78e5f3038d6281eac00b60dc90aa58bdd9ac185ca2d4b9b0de362bbe28e | b32d31f2389e8c052f990812cfd86441172538fd66e37fa17f97704d8795d9fc |
| s41534-023-00746-0 / table-1 | 169146 | 4299 | 7772399037acb3ba4dfc100bc6c9a8fdf4f82c56d8836e65fcb761294e9ee069 | 90670968407415e1f7e7c624b3244330015a4e52bc9790e811d2992205851c2d |
| s41586-021-03819-2 / article | 616249 | 188879 | 7a9843e69996c1a64a9a5ecc8b96015cfd45262e636e33e505a011d315c4310b | b47e9b289dfd671000e361872c9feb561b6b603eaf7c9a7011923fbf43a3c5ef |
| s41586-020-2012-7 / article | 418904 | 82098 | 340b1b93ba889c99acf492c7e5ba14ba36e0a5c12866da39a445237e992e2cb9 | 42e83aae5ecffa52c031b36103b0220b52674bec0e6a79346ba088284ccdd594 |
| s41586-020-2012-7 / table-1 | 179489 | 2500 | 3b6d64a5934ac4b45df370930ec4d9a9e51b41dc71ad3aaf2d87eb5c3125e29e | 6d67417849218c151fc8a1b27c1cbe56634d3774005b911cdc7c763462e42794 |
| s41586-023-05896-x / article | 1251945 | 191458 | 342b8dc5d0bf7d01618a3e9965ef6de9b23c59c7f7bef429592cbdb7852c36ec | 9abb9d06ecbf79f8b4cb0883c4625d64fc25ab0bd7c01a45b6fb46353e3f29af |
| s41586-023-06735-9 / article | 506351 | 201653 | 79f575e1941633c2dbd036682977ea6c274acd5c8c44fdb4648856a00a8d7cc6 | c997a761f1dea592df1d1b6007d338bf028de4825e48acdd94645cd2eba05517 |
| s41467-023-44030-3 / article | 460171 | 155114 | a02d82acb4cdbde085e07ca0c276383894e7a7832c6830ad7a212f450926d88d | b3b10a0f1b4cdb2fb9980ebc44142d778689a18b396e51af93ebeb95f84b605e |
| s41586-022-04755-5 / article | 545450 | 187508 | 190a270027c69a816b2647d2fdc6f1777cdf669695506fa40f2fe3cab8801ace | 3214c1ee6e7f232b45dcb5e44768f38608edcd9d6d870c1fc93948c854d54f1b |
| s41586-022-04755-5 / table-1 | 185820 | 5434 | 97eaaa31a6f3443e63ad7cf2cef66776d72d61c6b0f0d2956d87cd43b39485a2 | d5c167a5e0e2bbe016a1728985a5f96788492a9397060cee4292bcb37ec81fd0 |
| s41598-018-38309-5 / article | 487190 | 172171 | a1a135395d984fcda4548aacd0d6eabe0d41bb22c16cc31f4c8f16f8eaf49d51 | 136cb3b089fac6850fab400bcce1e7b063a2aaccf763f02eeb65697a7700af00 |

Fixture 总计 `1,577,502` bytes（13 files）。本分支原 B 输入的 Git tracked corpus 总计 `2,976,496` bytes；B newer attribution snapshot 报告 `3,010,072` bytes。Integrator 须按最终 Git bytes 记录真实 total 和 §5 size review。仅压缩旧 JSON 空白可省 `115,083` bytes（总计仍 `2,861,413`），不足以将所有 corpus data 压到约 2 MiB；本轮没有格式化、去重或删除 B evidence。Fixture per-file limits/exception由 A preflight检查通过。

## 每条期待与三个方言的实际执行状态

下表85行按实际执行基线和范围逐条区分。`M3889_NEW` 为本轮 Materials 三组合 / 27 source records；`AC86_NEW` 是上次 accepted ac86 三篇九组合 / 84 records；`F0DE` 是原 a9 / 55a 的 accepted0de full / 144 records。后两类228条未在3889复验，不能借其 PASS 建立最新 main 的完整验收。此前 P0DE 的 Materials27条已被本轮真实结果替换；原文件仍保留。合成250/5、83EXECUTABLE/2BLOCKED仅为明确 scope 的 registry。`BLOCKED_BY_D_TRANSPORT_SEAM=0`、`BLOCKED_BY_SPEC_QUESTION=0`；必需 parser / validator FAIL 均未 skip 或降级 warning。

| Article | Expectation ID | Assertion ID | Source pointer (`articles[i].expectations[j]`) | markdown | links | quarto | State | Record scope | 阻塞证据 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| s41586-026-10401-1 | source-metadata-v1 | nature-source-metadata-v1 | [0][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-026-10401-1 | source-abstract-v1 | nature-source-abstract-v1 | [0][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-026-10401-1 | source-headings-v1 | nature-source-headings-v1 | [0][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-026-10401-1 | source-equations-v1 | nature-source-equations-v1 | [0][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-026-10401-1 | source-figures-v1 | nature-source-figures-v1 | [0][4] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-026-10401-1 | source-citations-v1 | nature-source-citations-v1 | [0][5] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-026-10401-1 | source-inline-v1 | nature-source-inline-v1 | [0][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-026-10401-1 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [0][7] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-026-10401-1 | source-ui-v1 | nature-source-ui-v1 | [0][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-026-10401-1 | source-tables-v1 | nature-source-tables-v1 | [0][9] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41534-023-00746-0 | source-metadata-v1 | nature-source-metadata-v1 | [1][0] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41534-023-00746-0 | source-abstract-v1 | nature-source-abstract-v1 | [1][1] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41534-023-00746-0 | source-headings-v1 | nature-source-headings-v1 | [1][2] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41534-023-00746-0 | source-equations-v1 | nature-source-equations-v1 | [1][3] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41534-023-00746-0 | source-figures-v1 | nature-source-figures-v1 | [1][4] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41534-023-00746-0 | source-citations-v1 | nature-source-citations-v1 | [1][5] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | AC86_NEW ×3 | ac86历史：caption source cluster59/ref58缺最终citation |
| s41534-023-00746-0 | source-inline-v1 | nature-source-inline-v1 | [1][6] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41534-023-00746-0 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [1][7] | PASS | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | AC86_NEW ×3 | ac86历史：caption internal43/44 Equ7/15缺links/quarto occurrence目标 |
| s41534-023-00746-0 | source-ui-v1 | nature-source-ui-v1 | [1][8] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41534-023-00746-0 | source-tables-v1 | nature-source-tables-v1 | [1][9] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41586-021-03819-2 | source-metadata-v1 | nature-source-metadata-v1 | [2][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-021-03819-2 | source-abstract-v1 | nature-source-abstract-v1 | [2][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-021-03819-2 | source-headings-v1 | nature-source-headings-v1 | [2][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-021-03819-2 | source-equations-v1 | nature-source-equations-v1 | [2][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-021-03819-2 | source-figures-v1 | nature-source-figures-v1 | [2][4] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-021-03819-2 | source-citations-v1 | nature-source-citations-v1 | [2][5] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-021-03819-2 | source-inline-v1 | nature-source-inline-v1 | [2][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-021-03819-2 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [2][7] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-021-03819-2 | source-ui-v1 | nature-source-ui-v1 | [2][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-020-2012-7 | source-metadata-v1 | nature-source-metadata-v1 | [3][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-020-2012-7 | source-abstract-v1 | nature-source-abstract-v1 | [3][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-020-2012-7 | source-headings-v1 | nature-source-headings-v1 | [3][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-020-2012-7 | source-equations-v1 | nature-source-equations-v1 | [3][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-020-2012-7 | source-figures-v1 | nature-source-figures-v1 | [3][4] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-020-2012-7 | source-citations-v1 | nature-source-citations-v1 | [3][5] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-020-2012-7 | source-inline-v1 | nature-source-inline-v1 | [3][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-020-2012-7 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [3][7] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-020-2012-7 | source-ui-v1 | nature-source-ui-v1 | [3][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-020-2012-7 | source-tables-v1 | nature-source-tables-v1 | [3][9] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-023-05896-x | source-metadata-v1 | nature-source-metadata-v1 | [4][0] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41586-023-05896-x | source-abstract-v1 | nature-source-abstract-v1 | [4][1] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41586-023-05896-x | source-headings-v1 | nature-source-headings-v1 | [4][2] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41586-023-05896-x | source-equations-v1 | nature-source-equations-v1 | [4][3] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41586-023-05896-x | source-figures-v1 | nature-source-figures-v1 | [4][4] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41586-023-05896-x | source-citations-v1 | nature-source-citations-v1 | [4][5] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41586-023-05896-x | source-inline-v1 | nature-source-inline-v1 | [4][6] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41586-023-05896-x | source-crossrefs-v1 | nature-source-crossrefs-v1 | [4][7] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41586-023-05896-x | source-ui-v1 | nature-source-ui-v1 | [4][8] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41586-023-06735-9 | source-metadata-v1 | nature-source-metadata-v1 | [5][0] | PASS | PASS | PASS | EXECUTABLE_NOW | M3889_NEW ×3 | — |
| s41586-023-06735-9 | source-abstract-v1 | nature-source-abstract-v1 | [5][1] | PASS | PASS | PASS | EXECUTABLE_NOW | M3889_NEW ×3 | — |
| s41586-023-06735-9 | source-headings-v1 | nature-source-headings-v1 | [5][2] | PASS | PASS | PASS | EXECUTABLE_NOW | M3889_NEW ×3 | — |
| s41586-023-06735-9 | source-equations-v1 | nature-source-equations-v1 | [5][3] | PASS | PASS | PASS | EXECUTABLE_NOW | M3889_NEW ×3 | — |
| s41586-023-06735-9 | source-figures-v1 | nature-source-figures-v1 | [5][4] | PASS | PASS | PASS | EXECUTABLE_NOW | M3889_NEW ×3 | — |
| s41586-023-06735-9 | source-citations-v1 | nature-source-citations-v1 | [5][5] | PASS | PASS | PASS | EXECUTABLE_NOW | M3889_NEW ×3 | — |
| s41586-023-06735-9 | source-inline-v1 | nature-source-inline-v1 | [5][6] | PASS | PASS | PASS | EXECUTABLE_NOW | M3889_NEW ×3 | — |
| s41586-023-06735-9 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [5][7] | PASS | PASS | PASS | EXECUTABLE_NOW | M3889_NEW ×3 | — |
| s41586-023-06735-9 | source-ui-v1 | nature-source-ui-v1 | [5][8] | PASS | PASS | PASS | EXECUTABLE_NOW | M3889_NEW ×3 | — |
| s41467-023-44030-3 | source-metadata-v1 | nature-source-metadata-v1 | [6][0] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41467-023-44030-3 | source-abstract-v1 | nature-source-abstract-v1 | [6][1] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41467-023-44030-3 | source-headings-v1 | nature-source-headings-v1 | [6][2] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41467-023-44030-3 | source-equations-v1 | nature-source-equations-v1 | [6][3] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41467-023-44030-3 | source-figures-v1 | nature-source-figures-v1 | [6][4] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41467-023-44030-3 | source-citations-v1 | nature-source-citations-v1 | [6][5] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41467-023-44030-3 | source-inline-v1 | nature-source-inline-v1 | [6][6] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41467-023-44030-3 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [6][7] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41467-023-44030-3 | source-ui-v1 | nature-source-ui-v1 | [6][8] | PASS | PASS | PASS | EXECUTABLE_NOW | AC86_NEW ×3 | — |
| s41586-022-04755-5 | source-metadata-v1 | nature-source-metadata-v1 | [7][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-022-04755-5 | source-abstract-v1 | nature-source-abstract-v1 | [7][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-022-04755-5 | source-headings-v1 | nature-source-headings-v1 | [7][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-022-04755-5 | source-equations-v1 | nature-source-equations-v1 | [7][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-022-04755-5 | source-figures-v1 | nature-source-figures-v1 | [7][4] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-022-04755-5 | source-citations-v1 | nature-source-citations-v1 | [7][5] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-022-04755-5 | source-inline-v1 | nature-source-inline-v1 | [7][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-022-04755-5 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [7][7] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-022-04755-5 | source-ui-v1 | nature-source-ui-v1 | [7][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41586-022-04755-5 | source-tables-v1 | nature-source-tables-v1 | [7][9] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41598-018-38309-5 | source-metadata-v1 | nature-source-metadata-v1 | [8][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41598-018-38309-5 | source-abstract-v1 | nature-source-abstract-v1 | [8][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41598-018-38309-5 | source-headings-v1 | nature-source-headings-v1 | [8][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41598-018-38309-5 | source-equations-v1 | nature-source-equations-v1 | [8][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41598-018-38309-5 | source-figures-v1 | nature-source-figures-v1 | [8][4] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41598-018-38309-5 | source-citations-v1 | nature-source-citations-v1 | [8][5] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41598-018-38309-5 | source-inline-v1 | nature-source-inline-v1 | [8][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41598-018-38309-5 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [8][7] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |
| s41598-018-38309-5 | source-ui-v1 | nature-source-ui-v1 | [8][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F0DE ×3 | — |

原 a9完整 run 的27 clips和每次重复 clip均使用真实 adapter → Defuddle → normalizers → renderer，明确注入 A fresh replay。13 resource recipes在 preflight验证；每次 GET/manual 与 hostname/all/verbatim ledger均逐个核对，零 unexpected操作。没有 global fetch/DNS patch，没有 live DNS/HTTP。

所有 27 个重复输入 tests 通过：Markdown、referencesBib、semantic summary、ledger一致。三个方言 A → B → A（golden → pangenome → golden）首尾结果一致。每个方言另有四个明确 mocked table场景：HTTP503、无HTMLcells、同article302redirect、逃离article scope302rejection；12个子场景全部通过。Unknown request即使被hydrator catch也由ledger失败，绝不计为fallback通过。

下表按 actual comparison 标基线：Materials 为本轮3889 ×3；Quantum / Pangenome / Chemistry 为前轮 ac86 ×3；其余为0de历史。**没有新27 / full validators 运行。** 本轮全部四 validators 已在 comparison 保存，TAP math early failure 不掩盖 links rawHtml failure。

| Article | Evidence base | Math / scientificFragments | structure | rawHtml | crossReferences | 精确warnings |
| --- | --- | --- | --- | --- | --- | --- |
| s41586-026-10401-1 | 0de历史 | PASS ×3 | PASS ×3 | PASS ×3 | PASS ×3 | none |
| s41534-023-00746-0 | AC86_NEW | FAIL ×3；43 issues | PASS ×3 | PASS ×3 | PASS ×3 | none |
| s41586-021-03819-2 | 0de历史 | FAIL ×3；4 issues | PASS ×3 | PASS ×3 | PASS ×3 | `No equation nodes were detected.` |
| s41586-020-2012-7 | 0de历史 | PASS ×3 | PASS ×3 | PASS ×3 | PASS ×3 | `No equation nodes were detected.`；`Extended Data Table 1: The full-size Nature page did not expose HTML table cells; retained the absolute URL.` |
| s41586-023-05896-x | AC86_NEW | PASS ×3 | PASS ×3 | PASS ×3 | PASS ×3 | `No equation nodes were detected.` |
| s41586-023-06735-9 | M3889_NEW | FAIL ×3；10 issues | PASS ×3 | links FAIL（ref2字面<x）；其他PASS | PASS ×3 | none |
| s41467-023-44030-3 | AC86_NEW | FAIL ×3；16 issues | PASS ×3 | PASS ×3 | PASS ×3 | `No equation nodes were detected.` |
| s41586-022-04755-5 | 0de历史 | FAIL ×3；14 issues | PASS ×3 | PASS ×3 | PASS ×3 | none |
| s41598-018-38309-5 | 0de历史 | PASS ×3 | PASS ×3 | PASS ×3 | PASS ×3 | none |

前轮 ac86 只计新9套：math3PASS/6FAIL，structure/rawHtml/crossReferences各9PASS，warnings9准确文本/顺序/重数PASS。Quantum每baseline/repeat使用声明table-1 GET/manual及www.nature.com DNS(all=true,verbatim=true)，另两篇无resource；全部fresh replay unexpected=[]、无实际HTTP/DNS。9repeat的Markdown/Bib/semantic summary/ledger均PASS。只有Pangenome三个组合整体source+validator+warning PASS；Chemistry source全PASS不能覆盖16math issues，Quantum仍两类source FAIL。原27repeat、A→B→A、12resource scenarios和golden保持前轮历史，不声称本轮额外执行。

原 full 的完整 committed golden 只读检查通过：6 authors、3 main/4 Extended Data figures、13 display equations、50 ordered references、Table1、7 local image files、四 validators/scientificFragments、read前后bytes未改。Source mutations明确证明：删除 retained Fig1 target、更改Fig1 target.type、改变 M_s attachment、交换citationclusters、移除原citation邻近词、丢失caption、更改source short alt、丢失最终rendered table cell、增加undeclared warning均被断言拒绝。Mutation前显式断言golden/quarto的crossrefs/inline/citations/figures/tables五个consumer完整通过；accepted footer 修复后 table aggregate 也真正通过。Warning基线亦无missing/unexpected。没有制造scientific baseline或依赖已有失败充当mutation成功。

独立 reviewer 的两个 P2 已先在未改 helper 上固化为真实失败 regression：golden/quarto 原完整 figure/crossref consumer baseline PASS，只删最终 Fig1 caption 内部唯一 `dimensionality` 或只把第一个 `[1a](#fig-figure-1)` 改成 `[1a](#fig-figure-2)`，model 与其他正确 links 保持原对象，四 validators 仍 PASS，而旧 consumer 错误接受。新 helper 在各自 image 后的 paragraph frame 比对完整 source caption，另比对最终 bold panel 顺序；crossrefs 将源 occurrence 的邻近正文、text 与该 occurrence 的 target 同时绑定，不能借别处正确链接通过。新增 caption deletion 在三方言、wrong-target 在 links/quarto、default figure错误 relink 到 `#methods`、最终 panel bold 删除均从真实 passing baseline 转为 failure。没有扩展 readable stripping 来容忍不同内容。

前一e2检查点另有三个 C consumer 误判，先保留各自实际 RED，再修 C-owned 定位/遮蔽；没有当成 parser defect：

- Scientific Reports 四个 source captions 的 model 都为独立 `Figure N` label paragraph 后跟完整 description；实际 renderer 将 standalone label 与 description 第一段合并。旧 frame 多计一段，包含相邻正文。现在只减去真实 source label-only paragraph，不按 article ID 特判、不删 caption payload；完整 source/最终 caption、panel、顺序、相邻正文和重复保护仍保留。三方言完整 figure consumer baseline 通过后，删除中间原词 `topography`、将 source nextParagraph 插入 caption、重复 caption 都须失败。
- Quantum `source-inline-v1.cases[16]`，Results `a-section-2` p1：原始段落 prehash `112e070cd72763f916e87827ed488d4a0f34479997a3b267167db696761e1e4e`，frozen paragraph digest `d369697f5a057c051c701a02901278551c1f0f876999bd703ddc22b5d8f018ce`。源 `C` codeword 的完整 TeX 已逐字保留，旧 locator 仅以共同开头 `where` 找段落，误报多个候选；现在同时绑定独立原段落首尾各 96 个 prose 字符。SourceTeX 和 base/attachment 判据未放宽。真实三方言 inline consumer baseline 通过后，更改 `^{\\pm }` 为 `^{+}`、删除内部原 TeX、重复原段落都须失败。
- FRB `source-citations-v1.clusters[50]`，Methods `a-section-2` p33：原始段落 prehash `371f108c174313f206e98179ddf991f351210037820203bf922d4c452480a0dc`，frozen digest `b74d66e6db3feb6e923be8ca79005364a643dd49a4d91c83ce48b928689c2d2b`。原 source ref17 及后面的冒号，在 markdown 输出行262真实完整保留为 `following equation (9) of ref. [^17]:`；旧 C unanchored footnote-definition mask 删除句中该 token。只把 definition 遮蔽锚定行首，维持真正 definition 遮蔽及 ordered clusters/context predicates。三方言 citation consumer passing baseline 之后，将该 occurrence 邻近 `equation` 改坏必须失败。旧 markdown RED、links/quarto PASS 的结果独立保留。

这些前轮 helper changes 的 focused / full run 见历史命令表。SAME reviewer 在 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-review/c-bc81a28-review.md` 独立确认旧 actual55a zero blockers：28 focused PASS、旧机制 9 cases 中 7 meaningful RED / 2 PASS、原两个 P2 精准拒绝且四 validators 仍 PASS、85 rows / 255 records 与旧 e2 full 303 / 77 一致。ec53 / e3ff literal-neighbor 与 a9 receipt delta 随后的独立审查也已通过，准确新 blob 和 packet 见“实际接口”；没有借用旧审查覆盖新代码。本轮未重复旧 28 focused 或来源审计；D 已实际采用 reviewed e3ff。


### 历史 ec53 literal citation neighbor 修正与 scope

Materials cluster60 / ordered39：Methods a-section-6 p27，raw prehash `07c5846d67c3e10985b8dc918eb1535b2b0bf60e5a8e0accfa2983d25cb653ef`、frozen digest `6a6630230dc0644968c0718da83e804619724accc107ea11dab671948d19260f`。源普通text含 `compare_structures`，实际MD `compare\_structures`。Chemistry cluster49 / ordered43：Results a-section-2 p6，raw `77668daf030a601bae26e46af3b5352e4334073e3dbb2d5ed4648cc1a128a975`、frozen `a65361c9ac6dceb63aef8ccedf9b90fc9848ba893b35dfb9046c7cc4fa5bd7b9`；源 `pH*`，实际MD `pH\*`。这两处原source punctuation真实保留，55a旧readable删裸符号但残留escaped反斜线，导致假context failure，不能归为parser缺陷。

Source before/after分别由原Range的32个normalized字符绑定：Materials `scoveriesusingXtalFinder(ref.` / `),usingthecompare_structures`；Chemistry `/2=60vs.120h,D2O,8.2pH*)` / `,aresultoffastreversiblean`。这里只是可读source-neighbor投影，不修改科学期待。Actual source-scope audit直接枚举immutable DOM的481个source clusters，只有上述2处含plain literal punctuation，source/raw Buffer与原prehash一致；其他479处走旧sourceNeighbors/compactProse路径。数学/代码DOM及美元/legacy TeX/代码输出区保持opaque，字面underscore/star被保护而不是删除；不全局unescape TeX或改变通用readable、其他consumer、原panel/emphasis/source attachments。

先在旧55a固化真实6 RED（0PASS/6FAIL）；初始方案6 GREEN不冒充最终窄化验证。最终ec53实际6case全部通过，每个case的10个mutants均准确拒绝指定sourceContext：删除underscore/star、换成math operator/escaped TeX/legacy inline或display TeX/code、增加反斜线、改原左/右邻词、错citationidentity，semantic对象保持原件。Materials complete citations consumer三方言PASS；Chemistry只cluster49特定predicate有真实passing baseline，原cluster40/ordered33/34生产缺陷继续FAIL，不能用一个已失败aggregate充mutation baseline。

前轮Final partial显式a9 temp receipt保存6个实际cache记录，21missing、errors=[]、unexpected=[]，`complete=false`，after硬FAIL；7tests=6PASS/1FAIL、0skip/todo/cancel，112111.9953ms。它是局部证据与fail-closed guard的真实结果，不能称完整suite PASS。Default无env的初始focused run exit0，没有receipt writer；a9 hook只收集cache不额外clip，默认零写入、未知/missing/rejected/身份不符不能补造记录。Source/input、helper/API以外的生产代码不变；本轮不再重复27clips。完整source/range/oldRED/newpartial/raw位置在外部temp，repo只保存本handoff和严格tests。

Reconciler独立验证六份实际MD bytes、validators、warnings、semantic summary、ledger与原full相等；期待failures唯一差异是Materials60与Chem49 context消除。Partial54 source records48PASS/6FAIL；与mechanism未改的旧201条source执行记录得到241PASS/14FAIL、80EXECUTABLE/5BLOCKED。该ec53检查点未执行完整380；独立review后来已clear，见实际接口。此旧partial仍仅是0de历史记录。


### 历史 accepted ac86 来源状态与定点 scope

Pangenome source-label、shortAlt原Figure1/3/4/5已随PR58/Issue55恢复，三方言27条source期待、完整figure payload/source位置、4validators/精确warning全PASS。下面历史shortAlt failure和原wrapper hashes仍保留来源证据，不代表本轮output。Quantum clusters37/57与Chemistry cluster40的独立citation superscripts已随PR59/Issue56恢复原语义身份/order/finaltokens；Chemistry完整citation consumer和全部source期待三方言PASS，16 scientific issues仍明确FAIL。没有修改B values或Chelper。

本轮固定正向name filter只选这三篇三方言的`every source expectation through the complete production chain`及`repeat Markdown, bibliography, semantics and replay operations`，执行前静态核9+9title/84期待。现有a9 hook无变更，保存同一次actualcache的9 comparisons（完整metadata/figures/equations/citations/references/tables summary、各期望failures、四validators及math scientificFragments、warnings、ledger）与9MD，不是post-run另clip；不声称保留了未被semanticSummary导出的全Defuddle DOM/result对象。18其余combos missing、errors=[]、unexpected=[]，completefalse，after硬FAIL。84source TAP与9actual records逐项相同；原171历史条目只带0de scope引用，不据此推导new fullPASS。

### Quantum remaining final citation / table-caption

本轮三方言source/semantic均77 ordered clusters，final只76；序列LCS的唯一缺失是`source-citations-v1.clusters[59].numbers = [58]`，不新增或丢失其他cluster。原位置为a-section-3 / `#Tab1 a#ref-link-section-d102805164e14011`（sup位于caption内，anchor href`/articles/s41534-023-00746-0#ref-CR58`）。`#Tab1` untouched raw serializerprehash `f3b0491bc1cce00b208266b23277279d4f368fa7a2752e104b2fb2e0c6a19249`、frozen digest `23d81f6b93cdfdbfe357c9726209878bf28a55c0952dd19c4ce0290cb90806fc`；与旧有效source packet相同。Actual三方言line481仍在table-caption中输出裸58、原12legacyinlineMathJax delimiter及无dialect目标的Equ7/15：`source-crossrefs-v1.internal[43].renderedOccurrence` / `[44].renderedOccurrence` links/quarto FAIL，markdown按源规则degraded文本PASS。

这证明source cluster59的final citation遗漏与table-caption原位置一致，交source-only Work Contract60对应生命周期分析；不是由semantic77或其他位置正确[58]推定成功，也不先猜内部因果。`accepted-ac86-delta-quantum-source-delta.json`保存三方言缺失index/原supanchor/同run caption整行及typed源码primitive；repo中上述selector/manifest/block/hash能直接从冻结input重建。

### Quantum remaining 43 math issue roles

同一次运行的每方言 43 个 math issues 分为 table-caption 的 24 个 legacy delimiters、17 个 Greek isolatedSubscript、2 个 split numeric-power isolatedSuperscript。17 个原 Greek attachments 全在 Methods `a-section-4` / `section[data-title="Methods"]`：真实原形分别为 `Γ<sub><i>b</i></sub>`、`Γ<sub><i>a</i></sub>`、`Ω<sub>0</sub>`、`Ω<sub><i>i</i></sub>`。实际输出对应 `Γ$_{b}$`、`Γ$_{a}$`、`Ω$_{0}$`、`Ω$_{i}$`，下标被拆成独立 inline math。下表 paragraph index 为原 block 内零起算位置；行号来自本轮保存的 Quarto MD。

| Source paragraph / Greek count / actual Quarto line | Raw paragraph prehash | Frozen paragraph digest |
| --- | --- | --- |
| a-section-4 p4 / 2 / 283 | d4b9cd5027373869e427abe3a356010ce137ee71232ba6fe10fa326e619e4636 | 74a9ca9392ba1e49f63b27c7dd139332ab694b2c99d96345da9bbca9654e8a0a |
| a-section-4 p5 / 1 / 291 | 7917cafd5d18cb35e336b2dc2f3a83ea9c35d2e81f9e5e8c8ea513825b5ca19a | 3605d4ae2cb313d0f68293ec7698dfc605544315b6d02dabc6a2050bf3b75aff |
| a-section-4 p6 / 2 / 297 | 6b5529fa2fc0f7054db8ddff9f5845f04f47dc09a92c9b6c84c6e402cd3af866 | f7f86bf155d5aa1ce3e2adc5f646839344901c4c2aa29ee7ecfa7289a32a0062 |
| a-section-4 p7 / 7 / 299 | 41fe93f90327d2058184f53f70b106f365fec54bac3569302d2621b4e6b379a7 | 1399a9b8f93b285f03f15b8d51e9cbc5cae6c3d6205a0888e98881557c151fa4 |
| a-section-4 p9 / 2 / 309 | 4df3e18987d23972b091c9e456138caf31e752848220bd87f716839e8bf298ad | 629a487989b7da126377e8b992c13abc2c89cd839b807066ab0144fa0d02fd6c |
| a-section-4 p13 / 2 / 335 | a5560c83a39e0275742a9c3d0dd8c0830be4cfc503882f9def1a6c06a13ac969 | 28ea00ca891ecb94f15283d49e5fe2bee14c7a92e22a065cb6f735986288fc8e |
| a-section-4 p15 / 1 / 351 | 71d264e4fec89fd459f23ccf020b4a263bfee0b83e3a37ef201f6437a89f3fda | d614ce67b9f636f349b500a929acaf960a7000a57efed1329d546ae35a8f8b2e |

Split-power独立于Greek和leading-isotope61：Results a-section-2 p33原`~10<sup>−</sup><sup>15</sup>`，两个相邻SUP组成原同一exponent；rawparagraphprehash`76701dc7ea4f491570f57d3ae1329c472eb812a2454237392b6f0d99c8a55435`、frozen`d9fd04d9e40ad364d1c122769be3e2f4d318ea429dfc158c9bcd66575c02c3a4`。Actual三方言line207是`~10$^{−}$ $^{15}$`；科学正关系是原负号与15属于10的同一exponent，不改原两个SUP来迎合assembler。Results p37同源positivecontrol为单一`10<sup>−15</sup>`，raw`28e06f2eac7ed32e9dca4b87991c85cc120323782c2dbe1c980cdaa669af9f64`、frozen`db986d752212798179907747abd707b3a96a2aa6fa5f9a33569798f8bba453b1`，actual line221正确`$10^{−15}$`。故不重报旧48简单数值幂，不并入61isotope scope。

Greek scripts与split negative-power各标`INDEPENDENT_BUG`来源机制，交root分窄owner；C不修Nature/normalizers/validators，也不fabricateexpected TeX。Chemistry current16issues与前轮角色定位完全一致（3 trailing compound-subscript、13 sup其中11 leading-mass/2 Δbondlabels），本轮actual同runMD保留Methods四个measurement错误mass attachment；既有raw/frozen位置及61source契约复用，不重新source acquisition。Alpha4/FRB14/Materials旧0de14/reference2 role packets保持历史，该历史 ac86 packet 未采用当时 pending57；本轮已接入 accepted3889，Materials 新状态见下面独立 packet。

### Accepted3889 Materials 新来源与剩余科学角色

Source9期待 ×3 全部 PASS，完整 citation source consumer 也 PASS，没有新 source citation failure。原 `source-equations-v1` / `nature-source-equations-v1` 的 count=1、原 `Equ1` / (1) / Methods a-section-6 / sourceTeX 均保持；same-run semantic equation payload 逐字等于原 sourceTeX 去掉外层 `$$`。最终真实 MD equation body 行为 markdown338、links341、quarto249，开放 delimiter 均 `$$`；Quarto close 为 `$$ {#eq-equation-1}`。

Equ1 frozen subtree digest `625515b2cd2bb09c0f2c1733dcfa21b70d38505568d5a67f951341c4fd6496c3`，沿用原 Methods block raw prehash `dc1d4cbb048a2423178979b536370ab21583a12ed109902f3ffca4e4833417f9`；没有重新解析 raw buffer，所以 **不声称 frozenEquationDigest 是 raw Equ1 prehash**。原13 raw与recipe/source85审计由不变Git身份复用，不重做。

Methods a-section-6 / p37（zero-based paragraph）原 `128<i>x</i>0<i>e</i> +64<i>x</i>1<i>x</i> +32<i>x</i>2<i>e</i>` 是普通数字和 italic token 相邻。原 raw paragraph prehash `6be13b1e3db2cd07f5fc81dfef06fed2ea163e8e64be100b6c958479d74c0dd9`、frozen `606a4dbc6f17d727f95d873d015c680a39155c48d9d5e7f2fe8dc9f04264b364`；新 MD 行331/334/244为 `$128x0e$ + $64x1x$ + $32x2e$`。原 display1→2 与4个 delimiter issues 已解除，全 source equation consumer PASS，不扩大为整篇 math PASS。

剩余10 scientific-isolatedSuperscript 全部从该同次缓存映射：9处 identifier `r<sup>2</sup>SCAN` 的科学关系是2属于原 identifier、保留后缀SCAN；1处 `mScm<sup>−1</sup>` 的负幂属于原 compound unit。两家族分别为 `INDEPENDENT_BUG`；不放进已accepted57 styled或48简单numeric-power，亦不改科学输入、helper、validator。以下 pindex 为保留 block 内原 `querySelectorAll('p')` 零起算，包含 caption p。

| Source block / paragraph / roles | Earlier raw paragraph prehash | Frozen paragraph digest |
| --- | --- | --- |
| a-section-1 / p2 / 1 identifier-power | 13879004c6bdfc0f8919bf4aae21b7c2dcbf3e057ca85daf77174f2c6b717687 | 92b04249b290ef4c1aa130aedce9be4508cc4ffa8e65f3a8b1f27f872c6836ee |
| a-section-4 / p2 / 1 identifier-power | 7411a00492e4f18329c6b732f410ca475376ac7d3b2a1b662535c41eb1784905 | 877fb21b9e26480533a157277c605abc871d076494deffa98b3aef2d47331d0c |
| a-section-4 / p5 / 3 identifier-power | 3440d3b012be7af1589f2418a4ed762f9b0696f3ebba55d48158453c91a095f4 | 44c85a3f59d6457f8509724712fa618f26c20c7a7cf13745a72aca670ed9fa3b |
| a-section-6 / p25 / 3 identifier-power | 60a8bdd9120069f1869adb027b67bdb65386efeae662cecc66009b7cb0383f2e | 60a8bdd9120069f1869adb027b67bdb65386efeae662cecc66009b7cb0383f2e |
| a-data-availability / p0 / 1 identifier-power | 2d2e26531f19fe9315af3b924ef1f7c1b79a8f21598589dc83993af088d89f75 | 2d2e26531f19fe9315af3b924ef1f7c1b79a8f21598589dc83993af088d89f75 |
| a-section-6 / p42 / 1 compound-unit | 7f1338d170c587581f6886da41018abd505a2e25e2522e988d6348aa9c3b2eb4 | 07309b9556b82a5861cc8b3278e520106710bdf20e8464ca5af636dbb64b7550 |

当前9个 identifier issue 的实际 MD 行（源顺序）为 markdown33,81,91×3,259×3,379；links33,83,93×3,262×3,382；quarto32,70,78×3,196×3,280。Compound unit 为 markdown357、links360、quarto264。`accepted-3889-materials-delta-source-packet.json` 留全部10原primitive/前后邻居、三方言exact context/line/column与所有预先存在 raw/frozen身份；selected frozen digests 本轮核对一致，raw prehash **沿用已完成审计且无新raw解析**。

Reference2 原 literal `(0<x<-1)` 保持，source block `a-reference-2` / `ol.c-article-references > li:nth-child(2)`，rawprehash `0e255b91a472bfacada32b8041e736dbe7ccbae15e28f00a75db89cb113217cb`、frozen `9892d49c445a2e6e0321a3c4865b1fd7c52de6e379be2ac212ba1f34ed7c3f7f`。本轮 source-citations 完整 PASS，但 links output 在line411/column72被 production rawHtml报告 unpermitted tag x；markdown/quarto该validator PASS。该字面 title 不当作 active HTML、不修输入来避报，作为独立来源角色交 root 做窄 intake。

本轮全部3comparisons `pass=false`，math均10issues，structure/crossReferences各3PASS、rawHtml2PASS/1FAIL、warnings精确none3PASS；ledger requests/resolutions/unexpected全部[]、实际 HTTP/DNS0。3repeat的MD/Bib/semanticSummary/ledger全部PASS。A9 afterhook保存3真实 comparisons与3MD；missing24、errors[]、unexpected[]、completefalse硬FAIL，0 omitted/fabricated记录。此 batch 共37 tests30PASS/7FAIL（session20692 /15,697.2445ms），没有后置重新clip取cache。

## Parser defect packets

下列既有 packets 保留历史原 source / output 证据，未经再次 clip。当前状态以顶部85行scope及上面的3889/ac86定点packet为准：Pangenome short-alt、Quantum clusters[37]/[57]、Chemistry clusters[40]/[49] 已解除；Materials styled case已在3889新27 source records中解除，scientific10及links ref2仍FAIL。旧计数、旧错误输出和旧wrapper hashes不代表本轮3889结果。

下列 prehash 均为实际 A `serializeSubtree` 对 untouched source DOM 的 SHA-256；新 occurrence packet 另明确列出 sanitizer 后的 frozen paragraph digest，不能混用两者。Paragraph index从该 block的`querySelectorAll('p')`按零起算，table row/cell也从零起算。完整源数据仍位于外部临时目录；reproducer使用冻结的真实摘录与声明table resources。不得修改input让现有parser通过。

### Table footer — accepted main 已解除

前检查点中 Golden Table1的1条、COVID Table1的2条、astro Table1的6条真实 sourceNotes 丢失。PR #46 / Issue #45 已随 accepted e0a341f 接入：九条 notes 在三方言的准确文本、顺序、exactly once、table association 均通过。再接入本轮 accepted e2 table MathJax 修复后，golden/Quantum/COVID/FRB 四项完整 `source-tables-v1` ×3dialects 全部 PASS。这不代替整篇 scientific validator；单位、Greek、scientific sup 仍受来源与 scientific validator 保护。

### FRB table MathJax subscript attachment — accepted e2 已解除

`s41586-022-04755-5/source-tables-v1`，resource `table-1`，untouched raw SHA-256 `97eaaa31a6f3443e63ad7cf2cef66776d72d61c6b0f0d2956d87cd43b39485a2`，retained selector `#content`。对原 raw `table.rows[row].cells[column]` 的 prehash 独立核验如下：

| Physical row / cell | Raw TD subtree SHA-256 | Source MathJax TeX | 修复前 actual final cell math（markdown / links / quarto 相同） |
| --- | --- | --- | --- |
| [9][0] | d3c724281061d956a645d0254f64feaa280764a0c32a35d2fea4a84c432c2216 | `\({{\rm{DM}}}_{{\rm{MW}},{\rm{disk}}},{{\rm{DM}}}_{{\rm{MW}},{\rm{halo}}}\)` | `${\mathrm{DM}}\_{\mathrm{MW},\mathrm{disk}},{\mathrm{DM}}\_{\mathrm{MW},\mathrm{halo}}$` |
| [10][0] | 8016f6120773882fd35c9e929862a40929e2e0215f628d3f70c8d3759cb80403 | `\({{\rm{DM}}}_{{\rm{host}}}\)` | `${\mathrm{DM}}\_{\mathrm{host}}$` |
| [10][1] | 2ed0971e787d02ac7c490e6d6ae15e03298b925ddb0296f708330ed789bdcbc4 | `\({903}_{-111}^{+72}\)` | `${903}\_{-111}^{+72}$` |

Source `_` 是原本附着于 DM/903 的 subscript operator；修复前的 `\_` 是普通 underscore，因此不是 presentation 等价。Base、sign、subscript/exponent identity 必须保留；C 没有 globally unescape 或改变 comparison/oracle。PR #52 / Issue #51 随 accepted `e2d32e9ec819692a1f08075636c3a168f15ad20b` 恢复原附件语义，该三处 `renderedCell` 和完整 table consumer 在全部三方言转为 PASS。FRB table 中旧12个单位/数字幂 scientificFragments已随accepted6b修复；本轮相关现有tests与table完整source期待通过。整篇当前仍有14个正文complex/fractional scientific failures，不能混入此 MathJax Work Contract或报 whole-paper PASS。外部 `frb-table-cell-source.json` / `frb-table-presentation.json` 保留准确原 cell HTML、全部 sourceRows 和旧 Markdown/notes；本轮 `accepted-caption-tablemath-source-final` comparisons 保留修复后实际结果。

### Caption / citation / internal-reference normalization — 旧 packet 与本轮状态

以下为 accepted e0 的历史 evidence。Accepted PR #49 / Issue #47 (`4783291`) 已消除 figure-caption raw citation anchor/重复 Defuddle prose、COVID Methods caption链接、pangenome Methods occurrence、materials/SR body figure crossrefs。其相关断言本轮如实 PASS；下面旧actual不代表当前输出。Quantum table-caption normalization、相邻citation superscript、styled adjacency与source-shortAlt的本检查点失败由当前packet/85行map区分；literal brackets已随accepted0de解除，不能用validator单独证明其余完整性。

Quantum追加的真实body failure：`a-section-3`，`section[data-title="Discussion"]` paragraphs6/7，原same-article`#Tab1`，anchor text分别`1`和`1)`；`source-crossrefs-v1.internal[42]`和`[45]`。Paragraph hashes分别`f9fd42a89ad5b85ff6cf46d76aa480d04c17de3e69bd5557f95948e86edbded5`、`12e32b2d045fdc9e328de37c6c3f96dbac6841a670f624d1db0e8ec23e1996af`。Markdown实际变成`(see Table [^4]).`与`(see Table [^4].`，并附加Defuddle prose footnote；source Table1 identity/闭括号不可变成引用4。Links/quarto也有Fig1/Fig6 caption links未使用实际dialect target。

COVID caption section links：`source-crossrefs-v1.internal[4]`/`[17]`，block`a-section-1`。原href均`/articles/s41586-020-2012-7#Sec2`、text`Methods`、targetRetained=true。Description locators `#figure-1-desc`/`#figure-2-desc`，hashes `2dba82cf467bd578f22a459253da97e5aebe689821357ad2417d40ffdd349da8` / `386cd5155f890021eff83cb8ee7fb9cf585bedaabd96943e784ea7a97c4e5562`。真实 Methods heading/semantic target存在，Quarto含`## Methods {#sec-methods}`，caption却保留绝对self-article URL。正确期待为default/links`#methods`、quarto`#sec-methods`及原Methods可读文本；canonical retained section policy不需要修订。

本轮 occurrence 修正新增检出的来源事实如下。各 href/text/original paragraph 在 untouched raw 与 frozen 两边独立查验一致；digest 差异来自 sanitizer 去掉 `data-track*` 等 tracking attrs，不能用 frozen digest冒充 prehash。完整 article raw/fixture digests 见上表。其余正确 links 不能掩盖这些 occurrence。

| Article / source-crossrefs-v1.internal index | Raw source位置 | Untouched raw paragraph prehash | Frozen paragraph digest | accepted 478 前 Actual / required |
| --- | --- | --- | --- | --- |
| pangenome [42] | a-section-3 `section[data-title="Constructing a draft pangenome"]` p8；`#figure-4-desc` | 624b319c81ef1e2e6746de008d449b27dbd2c00fcda4f7a1456054df7237463c | 220204e973160f6db2ec943e6d331f545be8d24f493abf733931748318fd82b6 | 原 `/articles/s41586-023-05896-x#Sec18` / Methods，retained=true；actual绝对self URL，required default/links `#methods`、quarto `#sec-methods`；三方言 FAIL |
| materials [7,8] | a-section-4 `section[data-title="Discovered stable crystals"]` p1 | 315a861d7209ff9b9aa5f8821052ee84db09ced247bf0cd84bd363c87300e518 | 884d8b41fd08d30261e2d725010a64383221bd9eff75a131af15de30647dcf81 | 原 Fig1/2 text1/2；actual `Figs. [^1] and [^2]`，links/quarto 应为各自真实 figure target |
| materials [16] | a-section-5 `section[data-title="Scaling up learned interatomic potentials"]` p1 | 3371178da2f8a14ece18de2596f65e2306208df8e9d1c195a2c803a61d7f2913 | c2eac8cea9de8fac0a21127513b05a728471568058c42d4372f63cc7ce3823ac | 原 Fig3 / text3；actual `see Fig. [^3]`，links/quarto 应为该 occurrence 的真实 figure target |
| Scientific Reports [17,18,19,20] | a-section-2 `section[data-title="Results"]` p10 | c6e953188b6320ca3109839fac6f8d7dd15ea0fa0f21fd852f0e1e3eda1d175f | 497bb1056dae25380809a137e6f0dee41f87f2a802759240bcce1e37326d1290 | 原 Fig2 / Fig1 / Fig2 / Fig3；actual `Figs [^2]` 与 `Figs [^1], [^2] and [^3]`，links/quarto 应按各 source occurrence 使用正确 target |

这些真实 figure identity 不是文献 citation number。Accepted 478 后，上表各 crossref occurrence 在全部三方言 PASS；pangenome 仅 source-shortAlt、materials 仍 equations/citations、SR 仍 scientific validator 失败，所以不能报整篇 PASS。外部 `accepted-table-new-crossref-packets.json` 保留旧原始 anchor HTML、source context、raw/frozen digests 与旧 Quarto matching links；同一本 handoff 的当前完整 map 给出各 dialect 最新状态。

### Quantum table caption / 相邻 citation superscript — 历史 0de packet

同一 untouched raw article SHA-256 `6b2bb78e5f3038d6281eac00b60dc90aa58bdd9ac185ca2d4b9b0de362bbe28e`。新的原始 source / frozen 段落位置及 digests 独立核验如下；不是根据当前 parser 定义期待。

| Expectation / source index | Raw source位置 | Untouched raw subtree prehash | Frozen subtree digest | 当前失败与 source-derived 期待 |
| --- | --- | --- | --- | --- |
| source-crossrefs-v1 internal43/44 | a-section-3 table-caption `[data-test="table-caption"]#Tab1`；真实源 Equ7/Equ15 anchors | f3b0491bc1cce00b208266b23277279d4f368fa7a2752e104b2fb2e0c6a19249 | 23d81f6b93cdfdbfe357c9726209878bf28a55c0952dd19c4ce0290cb90806fc | links/quarto 最终 Table1 caption只剩裸 `(7)` / `(15)`，未绑定 retained equation target；markdown 可读降级 PASS。同 caption 原 ref58 成普通 `58`，原 `\(...\)` 仍残留，math validator如实报错 |
| source-citations-v1 cluster37，ordered58/64 | a-section-2 `section[data-title="Results"]` p18 | 9461453468d164c47c8d6b64843c5578c260bf0251b713796d45fb36cbd74963 | b226cfc00f5f696516b68092ae4701b4222124e54ea965f7ec5bed543af3df16 | 独立 citation sup 被吞入 scientific `${\alpha}^{{\prime}}^{58,64}$`；三个方言都缺原 ordered citation tokens |
| source-citations-v1 cluster57，ordered42/58 | a-section-3 `section[data-title="Discussion"]` p1 | 697d3fbbdcb78ca7ee69c7d85b72b370e185ec3bb260def1aa04aa4962b1c6e4 | 9e6e99e09e8e4cd9e96b870d4c245f5ffb96a2a504c17d8ad5036e8d3b0975e8 | 独立 citation sup 被吞入 `${J}_{m}=\sqrt{\bar{n}}{\kappa}_{2}/2\epsilon^{42,58}$`；三个方言都缺原 ordered citation tokens |

Quantum 源有 77 ordered clusters；该历史 0de 记录的 semantic 为 75，最终 tokens 亦有 table-caption normalization 缺失。ac86 新实测 semantic 已恢复 77，final 仍为 76，唯一缺失 source cluster[59] 见上面的新 packet。完整 expected numbers/order 与 original TeX 都没有改。`accepted-caption-tablemath-remaining-source-packets.json` 保留最小原 anchors、准确上下文、raw/frozen 身份和旧 caption 行。独立 citation eligibility 已随 Issue #56 accepted；table-caption 仍交 Issue #60 对应生命周期，不由 C 修生产输入/输出。

### 历史 citation / rawHtml 失败位置

Materials cluster60与Chemistry cluster49在本轮确认为上节 C literal punctuation误判，ec53 scoped复验解除，不能继续列为生产citation缺陷。Chemistry cluster40（ordered33/34）仍位于Results a-section-2 p2；raw `40052f20434e9ebfb090e55429d3a20e47553d31afe92b047c485808ba6e64a3`、frozen `74e0d28852386fd8165404fa8a38afcb94b49979f2c5dd9f9f3cb457bb3df00e`，source compound粗体2和独立citation33/34真实分开，实际 `\mathbf{2}^{33,34}` 吞掉citation role。Quantum clusters37/57同类源角色证据见上表；交各自citation contract，不改oracle。

Materials links 方言 production rawHtml validator 另报 `unpermitted-html-tag x`，line411/column72。实际源码是原 reference2 title 的字面 `(0<x<-1)`，block `a-reference-2` / `ol.c-article-references > li:nth-child(2)`，raw prehash `0e255b91a472bfacada32b8041e736dbe7ccbae15e28f00a75db89cb113217cb`，frozen digest `9892d49c445a2e6e0321a3c4865b1fd7c52de6e379be2ac212ba1f34ed7c3f7f`。C没有修改原 title、reference期待或 validator；保留该 FAIL 和证据，交独立 parser/validator 归因。外部 `accepted-caption-tablemath-final-remaining-citation-source.json` 记录这些 untouched raw Buffer身份、original HTML、whole source paragraph及每方言真实 failure；FRB cluster50证据也在同文件，但其失败已按上节认定为 C definition mask误判，而不是 production bug。

### Pangenome short-alt identity — 原失败证据，本轮已解除

`s41586-023-05896-x/source-figures-v1`：admitted main figure原IDs为`Fig1, Fig3, Fig4, Fig5`，原标签明确Figure1/3/4/5；actual semantic label正确，actual alt却变成顺序Figure1/2/3/4。后三个`shortAlt`在全部三方言失败。源wrapper locators / prehash：

| Source ID / block | Selector | Source subtree SHA-256 |
| --- | --- | --- |
| Fig1 / a-section-2 | #figure-1 | a67baa58454b5076eb464f4c74d03fc02ba56af081e7ca81512805d02334e8f1 |
| Fig3 / a-section-3 | #figure-3 | 0f62fea715fb860ff8ff262245ac20798dbb989ce926ea605434c87fee9fec11 |
| Fig4 / a-section-3 | #figure-4 | ef1abb9b5ba8717a76a24d4bc31b39cbc884bdba0280508cb3aebef94f86b0d4 |
| Fig5 / a-section-3 | #figure-5 | 7ec9deb70e1b659a58c27b09ae5a9173c62cdeecdbdb00c85ea34bc8480e04b3 |

### Scientific 边界：既有来源角色与本轮计数

- accepted0de literal repair已消除FRB [O III] phantom displays（source8→actual8）和Chemistry [3H] phantom display（source0→actual0）；相关equations/完整captions期待本轮PASS。旧raw/frozen identity分别为FRB Main p5 raw `1c3434cc6f2c022b8461aec0c726db8969900df75c44727b09e04a05a718dc8b` / frozen `6c4a2d899f9bfa7a2cd7c4263e7f0e67dbc70a9623fe3560254b8502fadeb3d6`；Chem Results p0 raw `146a939c2e4551225269d70f3ac93507bdbebc0c85ffb8629ae19c469d164f6c` / frozen `1d03f1991268ca7b64f42caa0f4a5e348594a8d2c129ce9cd756ff5ca7b1359f`。这些身份标签已区分，原科学值未变。
- AlphaFold当前4个isolatedSubscript均在Main a-section-1 p2，source原 `r.m.s.d.<sub>95</sub>` 四次，actualQuarto line60四次 `r.m.s.d.$_{95}$`。这是非unit缩写与原subscript attachment；source期待皆PASS不代替math validator。
- FRB当前14个正文issues：Methods a-section-2 p22两个原 `(5/60)<sup>2</sup>` / `(0.19/60/60)<sup>2</sup>`（actualQuarto line169孤立sup）；p50八个、p51四个 `pc<sup>−2/3</sup>` / `km<sup>−1/3</sup>`（actuallines291/293）。这两类分别为complex base和fractional unit powers，超出旧48简单单位/整数幂边界；不重复已修的12table issues。FRB全部source期待三方言PASS、整篇math仍14FAIL。
- Chemistry当前16 scientific issues为3 isolatedSubscript（Results p2 `Pb(OAc)<sub>4</sub>`，p5 `Fe2(ox)<sub>3</sub>`，Methods p0 `(CD3)<sub>2</sub>CO`）、13 isolatedSuperscript（11 leading isotope mass +2原 `Δ<sup>12,13</sup>`）。ActualQuarto source位置对应lines48/52/60/62/64/70/98/114/126；3H/19F/1H/13C属于后面元素，不得当trailing numeric power。Compound chemical grouping、Δbond-position label、leading isotope须按typed role分别审。
- Chemistry Methods a-section-3 p0还暴露4个validator未检出的mass误挂：source `2.05 <sup>1</sup>H`、`206.26 <sup>13</sup>C`、`3.31 <sup>1</sup>H`、`49.00 <sup>13</sup>C`，untouched raw/frozen同为 `e46e69f8e120aae7909d1f531f54052334313b78481bbce0b641e3ee72e6373a`。原e2 savedMD是孤立sup，accepted6b+0de实际line126变成 `$2.05^{1}$ H` / `$206.26^{13}$ C` / `$3.31^{1}$ H` / `$49.00^{13}$ C`；数字是measurement而非isotope base。它们不在当前16issues，语法valid不能证明科学attachment正确；交独立leading-isotope契约，C未修改source或validator。
- Materials 原0de有14 issues：Methods a-section-6 p37原 `128<i>x</i>0<i>e</i> +64<i>x</i>1<i>x</i> +32<i>x</i>2<i>e</i>` 是普通数字/italic token；旧quarto line244相邻 `$128x$$0e$` 造成4个delimiter issues/source display1→2。rawprehash `6be13b1e3db2cd07f5fc81dfef06fed2ea163e8e64be100b6c958479d74c0dd9`、frozen `606a4dbc6f17d727f95d873d015c680a39155c48d9d5e7f2fe8dc9f04264b364`。本轮accepted3889已解除这4个问题；剩9处identifier `r<sup>2</sup>SCAN` 和1处compound unit `mScm<sup>−1</sup>` 的当前完整位置与源关系见上面的新packet。旧cue39上下文误判也已解除，不能继续报为生产bug。
- Quantum 当前 43 个 math issues 为 table-caption 的 24 个 legacy delimiters、17 个正文 Greek subscript fragments、Results p33 原 `~10<sup>−</sup><sup>15</sup>` 的两个相邻 SUP 被输出为独立 superscripts（actual line207）。原形是 sibling SUP，不是嵌套。table-caption 交独立 Issue #60；Greek 和 split-power 分别为 `INDEPENDENT_BUG`，详见新来源 packet。独立 citation clusters[37]/[57] 已随 Issue #56 accepted，不能继续报告为当前缺陷。

以下仅对已保存immutable raw/frozen读取定位和typed primitive，不重新clip。源位置/哈希与same-run27实际MD/validator arrays一起保存在外部 `accepted-units-literals-remaining-source-positions.json`。机制列表是来源证据与Work Contract拆分候选，不宣称上述不同roles必然同根因，不创建重复48/53任务。

| Source位置 | Untouched raw paragraph prehash | Frozen paragraph digest |
| --- | --- | --- |
| s41586-021-03819-2 / a-section-1 p2 | 0722e1e1f1fb785c0add4e0a85c04e9dca2616ec0b3a6bde07ec29710b08088d | cdc336a22f533271dc16194b71d553f545c6c69ae7f7a5e38c91984c77a1ec9d |
| s41586-022-04755-5 / a-section-2 p22 | 4fe682650c4c464c1d6341c364241d29e154f18ecf7c8565de908b840c9a6fe5 | 4fe682650c4c464c1d6341c364241d29e154f18ecf7c8565de908b840c9a6fe5 |
| s41586-022-04755-5 / a-section-2 p50 | e7cb41b94a30d276ec37144e4dd2a279ed04bf3025bea80d85a73c9b2bbae07b | 4feefaba91c53aa355d409c9e2bfdd66106a825776d5e3d715fed2bcf6147969 |
| s41586-022-04755-5 / a-section-2 p51 | 216ca0dac23172ffbfbddae293636aea1352805b92347a6bbe7dcea5e88431d0 | 216ca0dac23172ffbfbddae293636aea1352805b92347a6bbe7dcea5e88431d0 |
| s41467-023-44030-3 / a-section-2 p0 | 146a939c2e4551225269d70f3ac93507bdbebc0c85ffb8629ae19c469d164f6c | 1d03f1991268ca7b64f42caa0f4a5e348594a8d2c129ce9cd756ff5ca7b1359f |
| s41467-023-44030-3 / a-section-2 p2 | 40052f20434e9ebfb090e55429d3a20e47553d31afe92b047c485808ba6e64a3 | 74e0d28852386fd8165404fa8a38afcb94b49979f2c5dd9f9f3cb457bb3df00e |
| s41467-023-44030-3 / a-section-2 p4 | 5637b1cf3f747317aae12698db23ae4ff5fa708a47236179d7d2444e93c6bc99 | fc038557c307a32c496972e01f5b07ab41f4f0605bdf16fb32a87b80d8df061c |
| s41467-023-44030-3 / a-section-2 p5 | b128b77e64328225608d6694938fccf1aed9a9f58a0f7beb1c842d0511999947 | 896c0856d4585fd2b2b6df5ba7dd70bdbb466d8b1eb216d7be2d809d411fc605 |
| s41467-023-44030-3 / a-section-2 p6 | 77668daf030a601bae26e46af3b5352e4334073e3dbb2d5ed4648cc1a128a975 | a65361c9ac6dceb63aef8ccedf9b90fc9848ba893b35dfb9046c7cc4fa5bd7b9 |
| s41467-023-44030-3 / a-section-2 p7 | f153157ebdf38415025030538f00eb00c39f5692bb24fdbff54cc37d5462baed | 8a02db586d4a4ad340dd67722dac0b67b514dbf8133f3bea956b9c2c019bf52b |
| s41467-023-44030-3 / a-section-2 p15 | 21ed9ff8a20bc5a6cc7724c2027e9ca7ab3578ee98ecf38e0f3fb39b52336b73 | 21ed9ff8a20bc5a6cc7724c2027e9ca7ab3578ee98ecf38e0f3fb39b52336b73 |
| s41467-023-44030-3 / a-section-2 p20 | 84ce5d602039554b81ef69b4a8801d0e6a6f1dbbaa20ad0c02545136d4c2b56a | 20fc81daafd619e6c28721e07e40f5b7702e6c54e17ca0c3fb1d9ddac891c2f0 |
| s41467-023-44030-3 / a-section-3 p0 | e46e69f8e120aae7909d1f531f54052334313b78481bbce0b641e3ee72e6373a | e46e69f8e120aae7909d1f531f54052334313b78481bbce0b641e3ee72e6373a |
| s41586-023-06735-9 / a-section-1 p2 | 13879004c6bdfc0f8919bf4aae21b7c2dcbf3e057ca85daf77174f2c6b717687 | 92b04249b290ef4c1aa130aedce9be4508cc4ffa8e65f3a8b1f27f872c6836ee |
| s41586-023-06735-9 / a-section-4 p2 | 7411a00492e4f18329c6b732f410ca475376ac7d3b2a1b662535c41eb1784905 | 877fb21b9e26480533a157277c605abc871d076494deffa98b3aef2d47331d0c |
| s41586-023-06735-9 / a-section-4 p5 | 3440d3b012be7af1589f2418a4ed762f9b0696f3ebba55d48158453c91a095f4 | 44c85a3f59d6457f8509724712fa618f26c20c7a7cf13745a72aca670ed9fa3b |
| s41586-023-06735-9 / a-section-6 p25 | 60a8bdd9120069f1869adb027b67bdb65386efeae662cecc66009b7cb0383f2e | 60a8bdd9120069f1869adb027b67bdb65386efeae662cecc66009b7cb0383f2e |
| s41586-023-06735-9 / a-data-availability p0 | 2d2e26531f19fe9315af3b924ef1f7c1b79a8f21598589dc83993af088d89f75 | 2d2e26531f19fe9315af3b924ef1f7c1b79a8f21598589dc83993af088d89f75 |
| s41586-023-06735-9 / a-section-6 p42 | 7f1338d170c587581f6886da41018abd505a2e25e2522e988d6348aa9c3b2eb4 | 07309b9556b82a5861cc8b3278e520106710bdf20e8464ca5af636dbb64b7550 |

## 确切命令与结果

在上列Cworktree执行，外部logs目录为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c`。

本轮 accepted3889 的实际命令/结果：

| Command | Actual result |
| --- | --- |
| `gh run view 37691610523 --json headSha,status,conclusion,jobs`；`gh run view 37691610455 --json headSha,status,conclusion` | C 独立读取 exact3889 Main三jobs / Secrets全部SUCCESS，root accepted release后操作 |
| `git merge --no-ff 3889f7396eab99060bec88fc8b0dcd3e6712024e -m "chore(corpus): adopt accepted styled scientific source prerequisite"` | exit0；dependency-only0a52908；旧original SHAs未重写 |
| `node <TEMP>/accepted-delta-inventory.mjs <C-worktree> <TEMP>/accepted-3889-materials-delta s41586-023-06735-9` | exit0；32Gitobjects（29corpus/helper/test/golden test）与3006字节相同；API1.0/85registry/10consumer；filter精确3source+3repeat titles，27期待 |
| `node --test --test-name-pattern $cMaterialsPattern test/nature-corpus.test.mjs`；env receipt prefix `<TEMP>/accepted-3889-materials-delta` | exit1；37tests30PASS/7FAIL，0skip/cancel/todo，15697.2445ms；27sourcePASS、3repeatPASS、receipt24missing硬FAIL；session20692已terminal |
| `node <TEMP>/accepted-3889-materials-receipt.mjs <C-worktree> <TEMP>/accepted-3889-materials-delta <TEMP>/accepted-ac86-delta` | exit0；27TAP与3cache expectation ID/status逐条同；85scope更新250/5（非full255），3strictwarnings/ledgers clean |
| `node <TEMP>/accepted-3889-materials-source-packet.mjs <C-worktree> <TEMP>/accepted-3889-materials-delta` | exit0；只读same-run3/frozen/currentsourceposition evidence，27source/Equ1/adjacency/9identifier+1compound/ref2身份；new clips0/network0，无raw重新audit |
| `git diff --check`；`git diff --cached --check`；`git diff --cached --name-only` | authored仅本handoff；helper/test/B/scientificvalidators未改；最终clean/push消息报root |

`$cMaterialsPattern` 先从 inventory.pattern赋至PowerShell变量再传native：`^(?:s41586-023-06735-9)/(?:markdown|links|quarto): (?:every source expectation through the complete production chain|repeat Markdown, bibliography, semantics and replay operations)$`。该次准确6titles，未执行其他article、旧full或mutations。原 ac86 9cache和84份0de external evidence的bytes/SHA256均未覆盖。

前轮 ac86 命令/结果（以下均为历史）：

| Current accepted-ac86 command | Actual result |
| --- | --- |
| `gh run view 37681190063 --json headSha,status,conclusion,jobs`；`gh run view 37681189875 --json headSha,status,conclusion` | exactac86三matrix jobs与Secrets SUCCESS；jobs见依赖段 |
| `git merge --no-ff ac86b2fa509653dfeb43b968472ce6280a51de2c -m "chore(corpus): adopt accepted sparse figure and citation prerequisites"` | exit0、dependency-only889eb55、原commits未重写 |
| `node <TEMP>/accepted-delta-inventory.mjs <C-worktree> <TEMP>/accepted-ac86-delta s41534-023-00746-0 s41586-023-05896-x s41467-023-44030-3` | finalexit0；29corpus objects/helper/test/golden与3006相同、85registry/10consumer/API1、准确9+9title/84expectfilter；原84external evidencehash留存 |
| `node --test --test-name-pattern $cDeltaPattern test/nature-corpus.test.mjs`；env receipt-prefix`<TEMP>/accepted-ac86-delta` | **exit1**；112=94PASS/18FAIL，0skip/todo/cancel，70864.2066ms；84source79PASS/5FAIL，9repeatPASS，9receipt/18missing硬FAIL；`accepted-ac86-delta.log`，session15007 terminal |
| `node <TEMP>/accepted-delta-receipt.mjs <C-worktree> <TEMP>/accepted-ac86-delta <TEMP>/accepted-units-literals-context-partial` | exit0；全部84TAP/9comparison逐条一致、strictwarnings/ledger clean，85map247/8混basehistorical标签（不是newfull）；`-execution.json` / `-receipt.json` |
| `node <TEMP>/accepted-citation-delta-source.mjs <C-worktree> <B-raw-directory> <TEMP>/accepted-ac86-delta` | finalexit0；只读same-run9/rawQuantum，准确source59缺58、17Greekprimitive/p33split/p37control/raw-frozenhash；无新clip/网络/输入修改；`-quantum-source-delta.json` |
| `git diff --check`；`git diff --cached --check`；`git diff --cached --name-only` | 本轮仅doc authored delta；dependencymerge与author-owned分开；cleanpush结果交root |

`$cDeltaPattern`精确来自inventory.pattern：`^(?:s41534-023-00746-0|s41586-023-05896-x|s41467-023-44030-3)/(?:markdown|links|quarto): (?:every source expectation through the complete production chain|repeat Markdown, bibliography, semantics and replay operations)$`。PowerShell先赋property值至该variable，再传native参数。第一次错误插值property的启动0source/0clips，仅receipt27missing硬FAIL，已另名`accepted-ac86-filter-launch-empty.log` /0comparisons/status保存；不是验收、也未重复真实clips。Inventory externalgit Buffer首次默认1MiB不足，只有external harness maxBuffer修4MiB后通过。没有source/production/test修正或覆盖旧log。

新9actualcomparison/per-comboJSON/MD、math+scientificFragments/semantic summary/ledger与receiptstatus全部在`<TEMP>/accepted-ac86-delta.*`；`accepted-ac86-delta-evidence.json`保存每文件bytes/SHA256、固定codehead/helper/source身份、独立reviewpacket身份和旧evidence未覆盖证明。不是fullparsedDefuddleDOM或D9cache；完整raw仍外部B只读目录，不commitcapture。Core保持ec53/e3ff，本轮无新helper/test delta，accepted-main已有CI/golden/build证据复用；未为docs或known-red另跑full/npmtest/build。


### 本轮3889外部证据身份

固定生产dependency head为 `0a52908f36a161ccc6fe9495bf5505263cbc69f6`；以下均在TEMP、只有同一次actualcache。`accepted-3889-materials-delta-evidence.json` 留全部当前证据身份、32Gitobject身份和旧84/29证据未覆盖核验。

| Filename | Bytes | SHA256 |
| --- | ---: | --- |
| accepted-3889-materials-delta-receipt-status.json | 1812 | 6ca5cebff2ac0be8601682e1f74abc355117d9565c97a066eb9add7c8ff00973 |
| accepted-3889-materials-delta-receipt.json | 69956 | 44572184078913b0f6b893e26868a1b47db7c7626a4f7066e79acca63eab100d |
| accepted-3889-materials-delta-source-packet.json | 34429 | 84d93cc4261471a9c5ce20df73a214d8078be5d8d78e0c85211e07436a54ec35 |
| accepted-3889-materials-delta.comparisons.json | 251194 | f576a182f7c4f9871f4188bdfbf9bd2f586e7b27deec55a0f32c7e62bff6e0fa |
| accepted-3889-materials-delta.log | 33702 | 5b3332abda0ba32ee475b0d928214be734255226a27ddc44fdc849a83ea9a822 |

每个组合文件名为 `accepted-3889-materials-delta.<articleId>.<dialect>.comparison.json` / 同前缀 `.md`。

| Article / dialect | Comparison bytes / SHA256 | MD bytes / SHA256 |
| --- | --- | --- |
| s41586-023-06735-9.links | 104315 / 6f3b1afd332840f1c21230f09da951e1bffdc6d5755a4d5834e4cfdbb0e265a1 | 83047 / ce3a99a3944716df875345130a5d20ec8fabdf5e5ccb280dd64b8cfaf47e564b |
| s41586-023-06735-9.markdown | 61436 / db575b70547a39e32325675328603148a2ad5aecdb4ed86bbdec4056fcb5b86d | 80477 / 86446ac71fe5fe835913e2c082ca75fea775c36c448e78d8f9b4c8ab2cc87772 |
| s41586-023-06735-9.quarto | 71680 / b733bc1874328711ba153263b594c7ba169ceb3efbe9798a67ee5bfe6b9bbfa5 | 67777 / 960f2a1ed3c405beb147191185fe5d5ee56613b7a3fdd6f7e515318aa55a7e7d |

### 历史ac86外部证据身份

所有文件位于上文 TEMP，均为同一次实际运行的外部证据。以下 SHA256 从 unchanged bytes 核对；固定 code head 为 dependency merge `889eb55c613e606a634ce0dfd41dee78f26fd8cd`，helper / test 身份见“实际接口”。旧 84 份 external evidence 的原 hash 未变。

| External filename | Bytes | SHA256 |
| --- | ---: | --- |
| accepted-ac86-delta.log | 171346 | 9f71134e86539d27c498c05cd3b8335218c76b6248021b18500da0830a571c1b |
| accepted-ac86-delta.comparisons.json | 917842 | 71bd2ab711cba571ca16ee513c00f979b703b875dfaf3bbd1e64ba0eb36c1894 |
| accepted-ac86-delta-receipt-status.json | 1612 | 94e45b35a61f794393b1c54333db8d0aa41d94352c019fecf7970c90d4e75113 |
| accepted-ac86-delta-receipt.json | 103520 | 4778458d28a50eb7cf3cccba46f73ef50c22ccc3a5f35d7e3dfd930a3e6357ca |
| accepted-ac86-delta-quantum-source-delta.json | 36206 | 2a306f392a17ae9edd8e4964dcb1aae236861030de4074650179982774b2154f |

每个组合文件名为 `accepted-ac86-delta.<articleId>.<dialect>.comparison.json` 和同前缀 `.md`；下表分别记录完整 comparison 和 Markdown 的 bytes / SHA256。

| Article / dialect | Comparison bytes / SHA256 | MD bytes / SHA256 |
| --- | --- | --- |
| s41467-023-44030-3.links | 103160 / b95ae4813dddf91f922f6c1dba761ac768f6ce25d9a6d248cf8f09ecb6cd3f79 | 53160 / 540f37e8a3eeccb82a074b095e852bb782708f8d08c1e73e060227a1372c51be |
| s41467-023-44030-3.markdown | 65990 / 300a8bb1bc4a1ae08350fa611de677c6a7d15f7f3c7dcba77c1fb310a2766291 | 50962 / 8ae7b29a7301dd79fedf270227a964ae19cb31589e22c96fc5a3a61d2b0a782b |
| s41467-023-44030-3.quarto | 75805 / 3cb21faf389854e9a86528f7ded6fa94a4c936e1e5d602ae035c78023fcfbc2b | 40866 / ed589c8b5af667dc811a415bc302f90e0a167c42fff7a55483906d6632f1c596 |
| s41534-023-00746-0.links | 187286 / 9b6877a693ed63805009407552cc775e1cbdf1d7f3db20fec6e23fdf6d8e8ede | 95659 / 470fc3ee186a65318a64b903712e53a5aa71b9236a968be3059d43305e30e435 |
| s41534-023-00746-0.markdown | 121013 / b473dc39834d4606e30e40fc3b6ce7ab874de635c89a988e447aa9e567eecebb | 91042 / ac8386022f0578e119765800829563b4df773ccc4ff4775f6712a3a0106a79dc |
| s41534-023-00746-0.quarto | 144957 / 642b59d6be9c8678d5f2bc2583d7175450274af7d26fe9450d09db145f1da9e7 | 83494 / b2d2d6db3db481e8b4281ca778fa3db77e30d0265ed3e2356a9dbc396e50e83b |
| s41586-023-05896-x.links | 71582 / d2319239eeb068c611ae69f56ded78abab1e6ebe3c30cd9bc210a4705db426f3 | 62732 / 7101952ce010d1d8f7e33ef1d958b7acf45cfc29008fe852fa9e9a4e8e7e8977 |
| s41586-023-05896-x.markdown | 44841 / 406717cef56212f827b5a0039aceeeafe223f08abaeda99575c249c7c2275ea5 | 60876 / db1674e31791cc77fd67ae660d99959f074508396a61c8b6cc3e0177983575e2 |
| s41586-023-05896-x.quarto | 54197 / 08c82833dd73b7c6755f7c268db2cd88cfb682c7191407b7dea04bc9bc8d5067 | 52879 / ef06b4a7af906d37cbe62a61c089936de25fdf5dad89ebb2faa6794a58a329a3 |

以下 accepted0de / a9 full 与 ec53 partial 命令全部为历史；更早 e0 / 478 / e2 记录亦为历史，不代表 ac86 full run。

| Current command | Actual result |
| --- | --- |
| `gh run view 37323651988 --json headSha,status,conclusion,jobs`；`gh run view 37323651876 --json headSha,status,conclusion` | accepted6b同head Main三jobs/Secrets SUCCESS（jobs见依赖段）；dependency merge6c952d9 |
| `gh run view 37329109194 --json headSha,status,conclusion,jobs`；`gh run view 37329109169 --json headSha,status,conclusion` | accepted0de同head Main三jobs/Secrets SUCCESS；dependency mergeb0cee66 |
| PowerShell env `ACADEMIC_CLIPPER_CORPUS_RECEIPT_PREFIX=C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c/accepted-units-literals`；`node --test test/nature-corpus.test.mjs test/golden-paper.test.mjs`（a9/55a） | **exit1**；380tests330PASS/50FAIL，0skip/todo/cancel，259949.5111ms；255source238PASS/17FAIL，27same-runcachecomplete，原log `accepted-units-literals-full-corpus.log` |
| `node <TEMP>/current-checkpoint-receipt.mjs <C-worktree> <TEMP>/accepted-units-literals` | exit0；255 TAP与27same-run比较逐条一致，85rows79EXECUTABLE/6blocked；不clip |
| `node --test test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-corpus-infrastructure.test.mjs test/network-boundaries.test.mjs test/nature-table-notes.test.mjs test/nature-caption-citations.test.mjs test/nature-table-mathjax.test.mjs test/nature-scientific-units.test.mjs test/nature-literal-brackets.test.mjs` | exit0；183PASS/0FAIL/0skip/todo/cancel，4749.9717ms；log `accepted-units-literals-existing-regression.log` |
| `npm run build`；`npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`（accepted0de） | 各exit0；ignoredbuild、golden13displays/四validators valid；logs `accepted-units-literals-build.log` / `accepted-units-literals-golden-validation.log` |
| `node --test --test-name-pattern="source citation contexts retain literal Markdown punctuation" test/nature-corpus.test.mjs`（旧55a，先加真实regression） | **exit1**；6tests0PASS/6FAIL，0skip/todo/cancel，21121.7723ms；`accepted-units-literals-context-before.log` |
| 同命令，无receipt env，初始未窄化helper | exit0；6PASS/0FAIL，65576.6023ms；`accepted-units-literals-context-final.log`；仅历史初始GREEN，不代替ec53 |
| 同命令，ec53固定树，显式envprefix `<TEMP>/accepted-units-literals-context-partial` | **exit1**；指定6case/60mutants全PASS；after因21missing硬FAIL，7tests6PASS/1FAIL，0skip/todo/cancel，112111.9953ms；`-context-partial.log` / receipt-status completefalse、records6 |
| `node <TEMP>/citation-literal-source-scope.mjs <C-worktree> <B-raw-directory> <TEMP>/accepted-units-literals` | exit0；无parser/网络，481sourceclusters only2changedplaincontexts/raw/frozen核对；`-literal-source-scope.json` |
| `node <TEMP>/reconcile-context-partial.mjs <C-worktree> <TEMP>/accepted-units-literals <TEMP>/accepted-units-literals-context-partial` | exit0；6actualMD/validators/warnings/summary/ledgers与原full一致，唯一2contextpath解除；scoped归并241PASS/14FAIL，80/5；`-context-partial-reconciled-receipt.json`，newFullRun=false |
| `git diff --check`；`git diff --cached --check`；`git diff --cached --name-only` | exit0；ec53只有helper/test，本handoff receipt只有本文件；最终clean status/push报告到parent |

`<TEMP>` = `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c`；`<C-worktree>` / `<B-raw-directory>`在上文精确列出。其余原始logs保留；下面capture-current-comparisons仅是旧e2历史命令，本轮没有在full之后额外运行27clips。


| Command | Result |
| --- | --- |
| `git fetch origin`；`gh run list --branch main --commit e85b1b809b56242b89b6313ce5d1165c745466bb --json databaseId,name,status,conclusion,headSha --limit 10` | 启动accepted-state核验成功；上述两个CI runs success |
| `npm ci` | exit0；65packages，0vulnerabilities |
| `node source-audit.mjs <C-worktree> <B-raw-directory> <external-report>` | exit0；13raw/hash/subtree/recipe resources，85source assertions，0failed；report `source-audit-final.json` |
| `node rights-audit.mjs <C-worktree> <B-raw-directory> <external-report>` | exit0；直接核验b718fa8 Gitobjects，9articles/9notices/4tables，0failed；report `rights-audit-final.json` |
| `node --test test/nature-corpus.test.mjs test/golden-paper.test.mjs`（前检查点） | **exit1**；bc79081完整run为365tests：233pass，132fail，0skip/todo/cancel；sourceexpectation子集255：171pass/84fail，85unique；log `checkpoint-tests-final-v7.log`。132包括失败parent tests/validators，不是132个distinct source expectations |
| `node --test --test-name-pattern="every source expectation through" test/nature-corpus.test.mjs`（前检查点） | **exit1**；5d305fa helper执行全部255条，结果171pass/84fail；含parent/validator309tests：177pass/132fail，0skip/todo/cancel；log `checkpoint-expectations-type-final.log` |
| `node --test --test-name-pattern="strict consumers\|immutable excerpts\|source assertions reject\|committed complete" test/nature-corpus.test.mjs test/golden-paper.test.mjs`（前检查点） | typedhelper exit0；13pass，0fail/skip；log `framework-tests-type-final.log` |
| `node --test --test-name-pattern="source assertions reject" test/nature-corpus.test.mjs`（前检查点） | d8aaaf1 baseline guards exit0；1pass，0fail/skip；log `mutation-baselines-final.log` |
| `node --test test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-corpus-infrastructure.test.mjs test/network-boundaries.test.mjs`（前检查点） | exit0；68pass，0fail/skip；log `existing-regression.log` |
| `git fetch origin`；`gh run view 37269007138 --json headSha,status,conclusion,jobs`；`gh run view 37269007093 --json headSha,status,conclusion`；`gh run view 37269456893 --json headSha,status,conclusion` | accepted e0a341f与上述3个matrix jobs/Secrets/finalizer独立核验success；没有消费随后 pending main |
| `git merge --no-ff e0a341fc97ff845a250c2f016dcb2363e10ed49e -m "chore(corpus): adopt accepted main table footer prerequisite"` | exit0；dependency-only `0729b3cf48ec6ad1ba8a8148f3c29af41a959139`，原始 authored SHAs 未重写 |
| `node --test --test-name-pattern="interior word\|wrong target at one" test/nature-corpus.test.mjs`（先加regression、未改helper） | **exit1**；2tests，0pass/2fail，0skip；actual consumer `pass` 与正确期待 `failure` 不符，两个原始baseline均真正通过；log `review-p2-before.log` |
| `node --test --test-name-pattern="interior word\|wrong target at one\|source assertions reject\|strict consumers\|immutable excerpts\|committed complete" test/nature-corpus.test.mjs test/golden-paper.test.mjs` | exit0；18pass/0fail/0skip，51.741s；log `review-p2-framework-final.log`。随后新增 default mutation 也在下行完整run通过 |
| `node --test test/nature-corpus.test.mjs test/golden-paper.test.mjs`（前轮 accepted e0 actual helper/test） | **exit1**；371tests：241pass/130fail，0skip/todo/cancel，236.278s；全部255 source cases：170pass/85fail，85unique；27 repeat、3 dialect isolation、12 mock scenarios、全部 mutation controls、只读golden均pass。130包含失败parent/validator cases，不能当distinct expectation数；log `accepted-table-full-corpus.log`，records `accepted-table-execution.json` |
| `node --test test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-corpus-infrastructure.test.mjs test/network-boundaries.test.mjs test/nature-table-notes.test.mjs` | exit0；95pass/0fail/0skip，3.869s；log `accepted-table-existing-regression.log`。FRB剩余12scientific fragments如实诊断，未被当whole-paperpass |
| `npm run build` | exit0；只生成ignored `dist/extension`；log `accepted-table-build.log` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0；golden四validators/scientificFragments均valid；log `accepted-table-golden-validation.log` |
| `gh run view 37272529095 --json headSha,status,conclusion,jobs`；`gh run view 37272529070 --json headSha,status,conclusion`；`gh run view 37273099892 --json headSha,status,conclusion` | accepted 478 exact head / Main三jobs / Secrets / finalizer独立核验success |
| `git merge --no-ff 4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2 -m "chore(corpus): adopt accepted main caption prerequisite"` | exit0；dependency-only `1b423c37d926d74edc1248e85336f266ebc24a70` |
| `node --test test/nature-corpus.test.mjs test/golden-paper.test.mjs`（478、修正新C误报前） | **exit1**；371tests：284pass/87fail，0skip/todo/cancel，276098.4413ms；255source：213pass/42fail；log `accepted-caption-full-corpus.log` |
| `gh run view 37278003744 --json headSha,status,conclusion,jobs`；`gh run view 37278003787 --json headSha,status,conclusion` | accepted e2 exact head / Main三jobs / Secrets independently success；root acceptance notice后才消费 |
| `git merge --no-ff e2d32e9ec819692a1f08075636c3a168f15ad20b -m "chore(corpus): adopt accepted main table MathJax prerequisite"` | exit0；dependency-only `23f32e75a54c9585984954a6171010b6e36007f4` |
| `node --test test/nature-corpus.test.mjs test/golden-paper.test.mjs`（e2、修正新C误报前） | **exit1**；371tests：287pass/84fail，0skip/todo/cancel，275005.3927ms；255source：216pass/39fail；log `accepted-caption-tablemath-full-corpus.log` |
| `node --test --test-name-pattern="label-only source heading" test/nature-corpus.test.mjs`（先固化RED、未改helper） | **exit1**；3tests：0pass/3fail，0skip/todo/cancel，8996.5508ms；原四个真实caption完整，而旧C frame错计相邻正文；log `accepted-caption-tablemath-frame-before.log` |
| `node --test --test-name-pattern="common introductory word" test/nature-corpus.test.mjs`（先固化RED、未改locator） | **exit1**；3tests：0pass/3fail，0skip/todo/cancel，28194.0233ms；源精确TeX本已保留，旧C common-where locator误判；log `accepted-caption-tablemath-inline-before.log` |
| `node --test test/nature-corpus.test.mjs test/golden-paper.test.mjs`（02c5664、colon修正前） | **exit1**；377tests：299pass/78fail，0skip/todo/cancel，326083.9798ms；255source：222pass/33fail；log `accepted-caption-tablemath-final-full-corpus.log`。此时FRB citation markdown的额外1FAIL随后证实是C colon mask误判 |
| `node --test --test-name-pattern="body citation followed by a colon" test/nature-corpus.test.mjs`（先固化RED、未改mask） | **exit1**；3tests：2pass/1fail，0skip/todo/cancel，16460.463ms；唯有markdown误删正文 `[^17]:`，原links/quarto source consumer PASS；log `accepted-caption-tablemath-colon-before.log` |
| `node --test --test-name-pattern="common introductory word\|label-only source heading\|body citation followed by a colon\|interior word\|wrong target at one\|default source crossrefs\|source assertions reject\|strict consumers\|immutable excerpts\|committed complete" test/nature-corpus.test.mjs test/golden-paper.test.mjs` | **exit0**；最终actual dbe3a1e helper，28pass/0fail/0skip/todo/cancel，165250.3758ms；真实 passing baselines及其指定payload/occurrence/attachment/multiplicity mutations；log `accepted-caption-tablemath-source-framework-final.log` |
| `node --test test/nature-corpus.test.mjs test/golden-paper.test.mjs`（最终actual dbe3a1e） | **exit1**；380tests：303pass/77fail，0skip/todo/cancel，322217.2396ms；255source：223pass/32fail、85unique；27 repeat、3 dialect A→B→A、12 table mocks、所有mutation protection、只读golden PASS。77包含parent和validator failures；log `accepted-caption-tablemath-source-final-full-corpus.log` |
| `node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c/capture-current-comparisons.mjs C:/Users/guoli/.codex/worktrees/issue-10-offline/academic-clipper C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c/accepted-caption-tablemath-source-final` | exit0（evidence capture成功，**不是corpus验收PASS**）；27实际clip/全部validators/warnings/cleanledgers，223sourcepass/32fail，strictwarnings27PASS，completePass3；27per-dialect JSON/Markdown与combined `.comparisons.json`仅在外部temp |
| `node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c/current-checkpoint-receipt.mjs C:/Users/guoli/.codex/worktrees/issue-10-offline/academic-clipper C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c/accepted-caption-tablemath-source-final` | exit0；完整log全部255条与27comparison orderedIDs/status逐条一致，85row map，74EXECUTABLE/11BLOCKED；report `accepted-caption-tablemath-source-final-receipt.json` / `-execution.json` |
| `node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c/current-remaining-citation-source.mjs C:/Users/guoli/.codex/worktrees/issue-10-offline/academic-clipper C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-b C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c/accepted-caption-tablemath-final` | exit0；materials39/reference2、FRB17、chem33/34/43 的raw Buffer/hash/原paragraph位置/serializedprehash/frozen digest独立核对；report `accepted-caption-tablemath-final-remaining-citation-source.json`。只读source/previouscomparison，用于上面 durable source packets，无writer/network |
| `node --test test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-corpus-infrastructure.test.mjs test/network-boundaries.test.mjs test/nature-table-notes.test.mjs test/nature-caption-citations.test.mjs test/nature-table-mathjax.test.mjs` | **exit0**；accepted e2 actual生产，125pass/0fail/0skip/todo/cancel，5803.3201ms；log `accepted-caption-tablemath-existing-regression.log`。C helper-only更改没有修改这些生产tests或build输入 |
| `npm run build`（accepted e2） | exit0；ignored dist/extension；log `accepted-caption-tablemath-build.log` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`（accepted e2） | exit0；四validators/scientificFragments与committed完整golden全部valid；log `accepted-caption-tablemath-golden-validation.log` |
| `git diff --check`；`git diff --cached --check` | exit0 |
| `git diff bff2f2a90731914194f8dd081f9267a1bb8d8e11 -- test/corpus papers docs/specs docs/PRD.md docs/EDD.md` | empty；C没有改B输入/golden/意图 |
| `git diff --cached --name-only` | 本轮core commit严格helper/test两个ownedfiles；handoff receipt严格本文件 |

External source / rights 审计此前 13 raw / 85 oracle 全部 valid，本轮复用未变 Git 身份，没有重做或 live reacquire。Ordinary tests 使用 frozen excerpt / replay，不依赖 raw 文件；只有显式 external-temp env 收集实际 cache / MD，不额外 clip。原 `accepted-units-literals-execution.json` / `-receipt.json` 的完整 255 / 27 records，以及 ec53 的 `accepted-units-literals-context-partial-reconciled-receipt.json` 均保留；本次 `accepted-3889-materials-delta-receipt.json` 与当前85行scope逐条对应；原ac86 receipt留历史。所有 raw / Markdown / comparison logs 仅留外部 temp，不提交 capture 或 snapshot。

本次没有执行 `npm test`、build、golden 或完整 C suite。它们的历史结果已标明基线，accepted3889 的 Main CI 提供依赖检查证据，不能替代最终 corpus 验收。最终 integrator 仍须在 parser prerequisites accepted 后运行 canonical §9 全部 checks 和 CI matrix。

## 恢复 C / D / integrator 的解除阻塞条件

1. 采用 original A/B/D 与 C authored SHAs；不要选择 dependency merges0a52908/889eb等作为 authored delivery。当前生产为accepted3889，source / helper / tests未改；原B b718fa8 rights addition仍由 integrator采用。
2. Issue #57 styled-group/source-equation期待已经在本轮27 source records真实解除，整篇required math10（9identifier、1compound）和links reference2 rawHtml仍FAIL。Root各窄source契约继续；现有 #60 / #61 / #63 / #64 按各自 authoritative goal 的来源角色和冻结范围处理。额外identifier/compound/reference机制的intake由root安排，不替他人扩大scope，不放宽oracle。
3. 85registry当前27 M3889_NEW、84 AC86_NEW、144 F0DE；250/255仅合成，不声称最新main full通过。Source剩余5FAIL是Quantum前轮真实captioncitation59/internal43/44；各known scientificvalidator FAIL还必须独立通过。D采用 actual reviewed e3ff helper / API1.0；controller修复属D，不改C helper来通过provider。
4. 下一实际accepted prerequisites改变失败后恢复SAME C运行必要scope。最终canonical验收仍要85×3、27validators/warnings/repeat/ABA/resource/golden和§9 checks / matrixCI；本轮仅Materials3combos，缺24 hook硬FAIL不可mockcomplete。无必要不重复13raw/85sourceaudit、旧full或60mutations；必须完整验收时另在固定combinedacceptedbase执行。
5. 当前clean checkpoint为DEPENDENCY_PENDING，不宣称C或Issue #10完成、不打开ordinary partialPR。Canonical/PRD/EDD/Bscientificoracle/production/validators由C保持原样；无spec语义改动提案。
