# Agent C — 来源核验与离线回归检查点

状态：`DEPENDENCY_PENDING`，2026-10-07。生产基线固定为 accepted `0de5c8b5c4c51a9231f250c336216598c10f27ae`。原 a9 / helper55a 的完整检查真实结果为 380 tests：330 PASS / 50 FAIL，source 238/255 PASS / 17 FAIL，27 same-run receipts complete；原文件和日志未覆盖。随后 ec53 / helper e3ff 只复验 Materials、Chemistry 六个组合：六个真实 baseline 与60个指定 mutation全部通过，54 source records为48 PASS / 6 FAIL；receipt因缺少其余21组合如实 hard FAIL。本文85行是这六份局部实测与机制未改的原记录归并：241 PASS / 14 FAIL、80条 `EXECUTABLE_NOW` / 5条 `BLOCKED_BY_PARSER_DEFECT`，**不是新 helper 的完整380 run**。481个 source citation clusters只有两处 plain literal punctuation context进入新路径；其余479处及全部其他consumer未改。Source/production/validators保持原样；新 e3ff helper独立review尚待完成，D不得将旧55a审计视作新blob clearance。没有 skip、known-failure-as-pass或 Issue #10完成声明。

## 基线、依赖与提交选择

- 原始 accepted-main base：`e85b1b809b56242b89b6313ce5d1165c745466bb`；启动时 Main CI `37182993143`、Secret scan `37182993093` 均为 success。PR #27 planning contract `5971ebf` 已是该 main 的祖先。
- 前轮 accepted main：`e0a341fc97ff845a250c2f016dcb2363e10ed49e`（PR #46 / Issue #45 table footer）。C 独立检查 Main CI `37269007138` 的同一 head：Ubuntu Node24 job `111631813071`、Windows Node24 `111631813246`、Ubuntu Node20 `111631813297` 均 success；Secret scan `37269007093` 和 finalizer `37269456893` 亦 success。仅用 dependency merge `0729b3cf48ec6ad1ba8a8148f3c29af41a959139` 接入，保留此前 published originals。
- 前一恢复接入 accepted `4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2`（PR #49 / Issue #47 caption/citation/crossrefs）：Main CI `37272529095` 的同一 head，Windows24 job `111642385793`、Ubuntu20 `111642385891`、Ubuntu24 `111642385902` 均 success；Secrets `37272529070` / finalizer `37273099892` success。Dependency merge `1b423c37d926d74edc1248e85336f266ebc24a70`。
- 前一检查点在478完整batch结束且root通知accepted后接入 `e2d32e9ec819692a1f08075636c3a168f15ad20b`（PR #52 / Issue #51 table MathJax）：Main CI `37278003744` 的同一 head，Ubuntu24 job `111659279964`、Ubuntu20 `111659280091`、Windows24 `111659280101` 均 success；Secrets `37278003787` success。Dependency merge `23f32e75a54c9585984954a6171010b6e36007f4`。没有消费未 accepted 的 bug branch。B source/oracle 和 production validators 均未改；C 只修来源定位/脚注遮蔽误判，没有放宽 scientific payload/identity/attachment。
- 后续恢复先接入 accepted `6b90413d806f7e611b00559c8208f6b95b31dd1e`（PR #50 / Issue #48 simple unit/numeric powers + code/math opacity）：C independently `gh run view` 验证 Main `37323651988` 同一 head 的 Ubuntu24 `111808767556`、Windows24 `111808767880`、Ubuntu20 `111808768068` 全 completed/success；Secrets `37323651876` success。Dependency merge `6c952d9eeed7b5bfb36d4cfcdfb06c4e699ec88b`。没有重复一轮6b完整known-red，而是等待literal accepted后统一执行。
- 本轮最新 accepted `0de5c8b5c4c51a9231f250c336216598c10f27ae`（PR #54 / Issue #53 literal brackets）：root accepted notice后，C independently readback Main `37329109194` 同一 head Ubuntu24 `111827337448`、Ubuntu20 `111827337770`、Windows24 `111827337830` 全 completed/success；Secrets `37329109169` success。Dependency merge `b0cee6620a2aa8ae63bddea9e5c7cbdca78c9c78`。Issue53 finalizer在root acceptance notice时尚未关闭，accepted main使用依据为同一merged head Main/Secrets成功，没有将OPEN状态当未通过CI。
- Branch：`codex/issue-10-agent-c`。
- Worktree：`C:/Users/guoli/.codex/worktrees/issue-10-offline/academic-clipper`。
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
13. 本次 handoff receipt commit；其准确 SHA 由 `git log -1 --format=%H -- docs/goals/issue-10/agent-c-handoff.md` 取得，并在交接消息报告。该 commit 只包含本文件。

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

D 应在 SAME independent reviewer 对新 delta clearance之后消费 `ec53d6578c3103a95c9334f71f5ef14ef597303b` 的实际 helper。Git blob `e3ff08708d0aee6f364e44a881e98207f6dc6a7b`，50,693 Git bytes，SHA-256 `ab23fa7ef25b0a24240929d8428d37300c24979ad15ad9ec1e4a5cb75d1150ff`。Corpus test blob `248bc4caa2006ba29100fc2b1bd889c61608c27e`，27,493 Git bytes，SHA-256 `985d91b25994c6c524791cf1a1b812c743e4cc6fa9b810b0d5e5fadca64d61e1`。Exports / schema / ASSERTION_VERSION仍1.0.0。此前 reviewed55a（48,884 bytes / SHA256 `0a2198958bc9405cddf003b99ae2c72388c55b921e871608cb92ffa12953b3bf`）仅是历史来源；不能用其旧review覆盖新blob。Frozen/live-retained comparison须给对应immutable projection；完整live validators单独执行。原完整27组合中只有golden/COVID/SR各三个组合通过全部期待、validators、warnings；其余六篇仍阻止live。本轮局部复验不改变这些validator结果或整体gate。Root负责在review后将实际blob交D。

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

下表85行来自逐项 reconciliation。`F` = 原 accepted0de + a9 / 55a 完整 run的实测记录，相关机制未改；`R` = ec53 / e3ff 六组合局部重新执行的真实 comparison，不能声称整套新full已通过。Materials/Chemistry各9条期待×3都标R，其余21个组合标F。原始 full238/17保留；此scope归并241/14、80EXECUTABLE/5BLOCKED。`BLOCKED_BY_D_TRANSPORT_SEAM = 0`、`BLOCKED_BY_SPEC_QUESTION = 0`；必需FAIL仍实际执行。Source pointer指向未改B manifest，其blockIds/nested locators给出源位置。

| Article | Expectation ID | Assertion ID | Source pointer (`articles[i].expectations[j]`) | markdown | links | quarto | State | Record scope | 阻塞证据 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| s41586-026-10401-1 | source-metadata-v1 | nature-source-metadata-v1 | [0][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-026-10401-1 | source-abstract-v1 | nature-source-abstract-v1 | [0][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-026-10401-1 | source-headings-v1 | nature-source-headings-v1 | [0][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-026-10401-1 | source-equations-v1 | nature-source-equations-v1 | [0][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-026-10401-1 | source-figures-v1 | nature-source-figures-v1 | [0][4] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-026-10401-1 | source-citations-v1 | nature-source-citations-v1 | [0][5] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-026-10401-1 | source-inline-v1 | nature-source-inline-v1 | [0][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-026-10401-1 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [0][7] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-026-10401-1 | source-ui-v1 | nature-source-ui-v1 | [0][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-026-10401-1 | source-tables-v1 | nature-source-tables-v1 | [0][9] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41534-023-00746-0 | source-metadata-v1 | nature-source-metadata-v1 | [1][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41534-023-00746-0 | source-abstract-v1 | nature-source-abstract-v1 | [1][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41534-023-00746-0 | source-headings-v1 | nature-source-headings-v1 | [1][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41534-023-00746-0 | source-equations-v1 | nature-source-equations-v1 | [1][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41534-023-00746-0 | source-figures-v1 | nature-source-figures-v1 | [1][4] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41534-023-00746-0 | source-citations-v1 | nature-source-citations-v1 | [1][5] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | F ×3 | 独立citation37/57被吞入math；table-caption未normalize |
| s41534-023-00746-0 | source-inline-v1 | nature-source-inline-v1 | [1][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41534-023-00746-0 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [1][7] | PASS | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | F ×3 | table-caption Equ7/15 source occurrence缺links/quarto target |
| s41534-023-00746-0 | source-ui-v1 | nature-source-ui-v1 | [1][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41534-023-00746-0 | source-tables-v1 | nature-source-tables-v1 | [1][9] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-021-03819-2 | source-metadata-v1 | nature-source-metadata-v1 | [2][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-021-03819-2 | source-abstract-v1 | nature-source-abstract-v1 | [2][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-021-03819-2 | source-headings-v1 | nature-source-headings-v1 | [2][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-021-03819-2 | source-equations-v1 | nature-source-equations-v1 | [2][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-021-03819-2 | source-figures-v1 | nature-source-figures-v1 | [2][4] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-021-03819-2 | source-citations-v1 | nature-source-citations-v1 | [2][5] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-021-03819-2 | source-inline-v1 | nature-source-inline-v1 | [2][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-021-03819-2 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [2][7] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-021-03819-2 | source-ui-v1 | nature-source-ui-v1 | [2][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-020-2012-7 | source-metadata-v1 | nature-source-metadata-v1 | [3][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-020-2012-7 | source-abstract-v1 | nature-source-abstract-v1 | [3][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-020-2012-7 | source-headings-v1 | nature-source-headings-v1 | [3][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-020-2012-7 | source-equations-v1 | nature-source-equations-v1 | [3][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-020-2012-7 | source-figures-v1 | nature-source-figures-v1 | [3][4] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-020-2012-7 | source-citations-v1 | nature-source-citations-v1 | [3][5] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-020-2012-7 | source-inline-v1 | nature-source-inline-v1 | [3][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-020-2012-7 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [3][7] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-020-2012-7 | source-ui-v1 | nature-source-ui-v1 | [3][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-020-2012-7 | source-tables-v1 | nature-source-tables-v1 | [3][9] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-023-05896-x | source-metadata-v1 | nature-source-metadata-v1 | [4][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-023-05896-x | source-abstract-v1 | nature-source-abstract-v1 | [4][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-023-05896-x | source-headings-v1 | nature-source-headings-v1 | [4][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-023-05896-x | source-equations-v1 | nature-source-equations-v1 | [4][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-023-05896-x | source-figures-v1 | nature-source-figures-v1 | [4][4] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | F ×3 | 原Figure3/4/5的shortAlt变为2/3/4 |
| s41586-023-05896-x | source-citations-v1 | nature-source-citations-v1 | [4][5] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-023-05896-x | source-inline-v1 | nature-source-inline-v1 | [4][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-023-05896-x | source-crossrefs-v1 | nature-source-crossrefs-v1 | [4][7] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-023-05896-x | source-ui-v1 | nature-source-ui-v1 | [4][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-023-06735-9 | source-metadata-v1 | nature-source-metadata-v1 | [5][0] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41586-023-06735-9 | source-abstract-v1 | nature-source-abstract-v1 | [5][1] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41586-023-06735-9 | source-headings-v1 | nature-source-headings-v1 | [5][2] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41586-023-06735-9 | source-equations-v1 | nature-source-equations-v1 | [5][3] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | R ×3 | 源italic数字邻接产生额外 $$ display |
| s41586-023-06735-9 | source-figures-v1 | nature-source-figures-v1 | [5][4] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41586-023-06735-9 | source-citations-v1 | nature-source-citations-v1 | [5][5] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41586-023-06735-9 | source-inline-v1 | nature-source-inline-v1 | [5][6] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41586-023-06735-9 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [5][7] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41586-023-06735-9 | source-ui-v1 | nature-source-ui-v1 | [5][8] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41467-023-44030-3 | source-metadata-v1 | nature-source-metadata-v1 | [6][0] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41467-023-44030-3 | source-abstract-v1 | nature-source-abstract-v1 | [6][1] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41467-023-44030-3 | source-headings-v1 | nature-source-headings-v1 | [6][2] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41467-023-44030-3 | source-equations-v1 | nature-source-equations-v1 | [6][3] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41467-023-44030-3 | source-figures-v1 | nature-source-figures-v1 | [6][4] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41467-023-44030-3 | source-citations-v1 | nature-source-citations-v1 | [6][5] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | R ×3 | cluster40独立33/34被吞入compound2 exponent；cluster49误判已解除 |
| s41467-023-44030-3 | source-inline-v1 | nature-source-inline-v1 | [6][6] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41467-023-44030-3 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [6][7] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41467-023-44030-3 | source-ui-v1 | nature-source-ui-v1 | [6][8] | PASS | PASS | PASS | EXECUTABLE_NOW | R ×3 | — |
| s41586-022-04755-5 | source-metadata-v1 | nature-source-metadata-v1 | [7][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-022-04755-5 | source-abstract-v1 | nature-source-abstract-v1 | [7][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-022-04755-5 | source-headings-v1 | nature-source-headings-v1 | [7][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-022-04755-5 | source-equations-v1 | nature-source-equations-v1 | [7][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-022-04755-5 | source-figures-v1 | nature-source-figures-v1 | [7][4] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-022-04755-5 | source-citations-v1 | nature-source-citations-v1 | [7][5] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-022-04755-5 | source-inline-v1 | nature-source-inline-v1 | [7][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-022-04755-5 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [7][7] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-022-04755-5 | source-ui-v1 | nature-source-ui-v1 | [7][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41586-022-04755-5 | source-tables-v1 | nature-source-tables-v1 | [7][9] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41598-018-38309-5 | source-metadata-v1 | nature-source-metadata-v1 | [8][0] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41598-018-38309-5 | source-abstract-v1 | nature-source-abstract-v1 | [8][1] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41598-018-38309-5 | source-headings-v1 | nature-source-headings-v1 | [8][2] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41598-018-38309-5 | source-equations-v1 | nature-source-equations-v1 | [8][3] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41598-018-38309-5 | source-figures-v1 | nature-source-figures-v1 | [8][4] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41598-018-38309-5 | source-citations-v1 | nature-source-citations-v1 | [8][5] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41598-018-38309-5 | source-inline-v1 | nature-source-inline-v1 | [8][6] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41598-018-38309-5 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [8][7] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |
| s41598-018-38309-5 | source-ui-v1 | nature-source-ui-v1 | [8][8] | PASS | PASS | PASS | EXECUTABLE_NOW | F ×3 | — |

原 a9完整 run 的27 clips和每次重复 clip均使用真实 adapter → Defuddle → normalizers → renderer，明确注入 A fresh replay。13 resource recipes在 preflight验证；每次 GET/manual 与 hostname/all/verbatim ledger均逐个核对，零 unexpected操作。没有 global fetch/DNS patch，没有 live DNS/HTTP。

所有 27 个重复输入 tests 通过：Markdown、referencesBib、semantic summary、ledger一致。三个方言 A → B → A（golden → pangenome → golden）首尾结果一致。每个方言另有四个明确 mocked table场景：HTTP503、无HTMLcells、同article302redirect、逃离article scope302rejection；12个子场景全部通过。Unknown request即使被hydrator catch也由ledger失败，绝不计为fallback通过。

四 production validators在原same-run27 comparisons中全部计算，没有用math assertion早失败遮蔽其他validators。下面为accepted0de实际结果；ec53六份partial的validators、warnings、summary、ledger及Markdown bytes与对应原full逐字/逐值相等。

| Article | Math / scientificFragments | structure | rawHtml | crossReferences | 严格 warnings（每个方言） |
| --- | --- | --- | --- | --- | --- |
| s41586-026-10401-1 | PASS ×3 | PASS ×3 | PASS ×3 | PASS ×3 | none |
| s41534-023-00746-0 | FAIL ×3；43 issues | PASS ×3 | PASS ×3 | PASS ×3 | none |
| s41586-021-03819-2 | FAIL ×3；4 issues | PASS ×3 | PASS ×3 | PASS ×3 | `No equation nodes were detected.` |
| s41586-020-2012-7 | PASS ×3 | PASS ×3 | PASS ×3 | PASS ×3 | `No equation nodes were detected.`；`Extended Data Table 1: The full-size Nature page did not expose HTML table cells; retained the absolute URL.` |
| s41586-023-05896-x | PASS ×3 | PASS ×3 | PASS ×3 | PASS ×3 | `No equation nodes were detected.` |
| s41586-023-06735-9 | FAIL ×3；14 issues | PASS ×3 | markdown / quarto PASS；links FAIL（ref2字面 `<x`） | PASS ×3 | none |
| s41467-023-44030-3 | FAIL ×3；16 issues | PASS ×3 | PASS ×3 | PASS ×3 | `No equation nodes were detected.` |
| s41586-022-04755-5 | FAIL ×3；14 issues | PASS ×3 | PASS ×3 | PASS ×3 | none |
| s41598-018-38309-5 | PASS ×3 | PASS ×3 | PASS ×3 | PASS ×3 | none |

合计：math 12 PASS / 15 FAIL，structure 27 PASS，rawHtml 26 PASS / 1 FAIL，crossReferences 27 PASS；27 warnings准确文本/顺序/重数均PASS。Golden、Quantum、COVID、FRB各一个真实table-1 GET/manual和www.nature.com DNS(all=true,verbatim=true)，其余article无resource requests。COVID声明no-cells并保留absolute URL，另外三个table成功；fresh replay的unexpected/实际HTTP/DNS均为零。27 repeats、三个方言A→B→A、12 mock resource场景和只读golden均在原full PASS，不是这次另跑。

完整 committed golden只读检查通过：6 authors、3 main/4 Extended Data figures、13 display equations、50 ordered references、Table1、7 local image files、四 validators/scientificFragments、read前后bytes未改。Source mutations明确证明：删除 retained Fig1 target、更改Fig1 target.type、改变 M_s attachment、交换citationclusters、移除原citation邻近词、丢失caption、更改source short alt、丢失最终rendered table cell、增加undeclared warning均被断言拒绝。Mutation前显式断言golden/quarto的crossrefs/inline/citations/figures/tables五个consumer完整通过；accepted footer 修复后 table aggregate 也真正通过。Warning基线亦无missing/unexpected。没有制造scientific baseline或依赖已有失败充当mutation成功。

独立 reviewer 的两个 P2 已先在未改 helper 上固化为真实失败 regression：golden/quarto 原完整 figure/crossref consumer baseline PASS，只删最终 Fig1 caption 内部唯一 `dimensionality` 或只把第一个 `[1a](#fig-figure-1)` 改成 `[1a](#fig-figure-2)`，model 与其他正确 links 保持原对象，四 validators 仍 PASS，而旧 consumer 错误接受。新 helper 在各自 image 后的 paragraph frame 比对完整 source caption，另比对最终 bold panel 顺序；crossrefs 将源 occurrence 的邻近正文、text 与该 occurrence 的 target 同时绑定，不能借别处正确链接通过。新增 caption deletion 在三方言、wrong-target 在 links/quarto、default figure错误 relink 到 `#methods`、最终 panel bold 删除均从真实 passing baseline 转为 failure。没有扩展 readable stripping 来容忍不同内容。

前一e2检查点另有三个 C consumer 误判，先保留各自实际 RED，再修 C-owned 定位/遮蔽；没有当成 parser defect：

- Scientific Reports 四个 source captions 的 model 都为独立 `Figure N` label paragraph 后跟完整 description；实际 renderer 将 standalone label 与 description 第一段合并。旧 frame 多计一段，包含相邻正文。现在只减去真实 source label-only paragraph，不按 article ID 特判、不删 caption payload；完整 source/最终 caption、panel、顺序、相邻正文和重复保护仍保留。三方言完整 figure consumer baseline 通过后，删除中间原词 `topography`、将 source nextParagraph 插入 caption、重复 caption 都须失败。
- Quantum `source-inline-v1.cases[16]`，Results `a-section-2` p1：原始段落 prehash `112e070cd72763f916e87827ed488d4a0f34479997a3b267167db696761e1e4e`，frozen paragraph digest `d369697f5a057c051c701a02901278551c1f0f876999bd703ddc22b5d8f018ce`。源 `C` codeword 的完整 TeX 已逐字保留，旧 locator 仅以共同开头 `where` 找段落，误报多个候选；现在同时绑定独立原段落首尾各 96 个 prose 字符。SourceTeX 和 base/attachment 判据未放宽。真实三方言 inline consumer baseline 通过后，更改 `^{\\pm }` 为 `^{+}`、删除内部原 TeX、重复原段落都须失败。
- FRB `source-citations-v1.clusters[50]`，Methods `a-section-2` p33：原始段落 prehash `371f108c174313f206e98179ddf991f351210037820203bf922d4c452480a0dc`，frozen digest `b74d66e6db3feb6e923be8ca79005364a643dd49a4d91c83ce48b928689c2d2b`。原 source ref17 及后面的冒号，在 markdown 输出行262真实完整保留为 `following equation (9) of ref. [^17]:`；旧 C unanchored footnote-definition mask 删除句中该 token。只把 definition 遮蔽锚定行首，维持真正 definition 遮蔽及 ordered clusters/context predicates。三方言 citation consumer passing baseline 之后，将该 occurrence 邻近 `equation` 改坏必须失败。旧 markdown RED、links/quarto PASS 的结果独立保留。

这些前轮helper changes的focused/full run见历史命令表。SAME reviewer在 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-review/c-bc81a28-review.md` 独立确认旧actual55a zero blockers：28focused PASS、旧机制9cases中7meaningfulRED/2PASS、原两个P2精准拒绝且四validators仍PASS、85rows/255records与旧e2 full303/77一致。本轮ec53/e3ff literal-neighbor变化和a9 receipt delta另须独立审查，旧review不覆盖新blob；本检查点不重复旧28focused。原source/rights科学审计复用、B data未改；D由root在newreview clearance后转交实际blob。


### 本检查点 literal citation neighbor 修正与scope

Materials cluster60 / ordered39：Methods a-section-6 p27，raw prehash `07c5846d67c3e10985b8dc918eb1535b2b0bf60e5a8e0accfa2983d25cb653ef`、frozen digest `6a6630230dc0644968c0718da83e804619724accc107ea11dab671948d19260f`。源普通text含 `compare_structures`，实际MD `compare\_structures`。Chemistry cluster49 / ordered43：Results a-section-2 p6，raw `77668daf030a601bae26e46af3b5352e4334073e3dbb2d5ed4648cc1a128a975`、frozen `a65361c9ac6dceb63aef8ccedf9b90fc9848ba893b35dfb9046c7cc4fa5bd7b9`；源 `pH*`，实际MD `pH\*`。这两处原source punctuation真实保留，55a旧readable删裸符号但残留escaped反斜线，导致假context failure，不能归为parser缺陷。

Source before/after分别由原Range的32个normalized字符绑定：Materials `scoveriesusingXtalFinder(ref.` / `),usingthecompare_structures`；Chemistry `/2=60vs.120h,D2O,8.2pH*)` / `,aresultoffastreversiblean`。这里只是可读source-neighbor投影，不修改科学期待。Actual source-scope audit直接枚举immutable DOM的481个source clusters，只有上述2处含plain literal punctuation，source/raw Buffer与原prehash一致；其他479处走旧sourceNeighbors/compactProse路径。数学/代码DOM及美元/legacy TeX/代码输出区保持opaque，字面underscore/star被保护而不是删除；不全局unescape TeX或改变通用readable、其他consumer、原panel/emphasis/source attachments。

先在旧55a固化真实6 RED（0PASS/6FAIL）；初始方案6 GREEN不冒充最终窄化验证。最终ec53实际6case全部通过，每个case的10个mutants均准确拒绝指定sourceContext：删除underscore/star、换成math operator/escaped TeX/legacy inline或display TeX/code、增加反斜线、改原左/右邻词、错citationidentity，semantic对象保持原件。Materials complete citations consumer三方言PASS；Chemistry只cluster49特定predicate有真实passing baseline，原cluster40/ordered33/34生产缺陷继续FAIL，不能用一个已失败aggregate充mutation baseline。

Final partial显式a9 temp receipt保存6个实际cache记录，21missing、errors=[]、unexpected=[]，`complete=false`，after硬FAIL；7tests=6PASS/1FAIL、0skip/todo/cancel，112111.9953ms。它是局部证据与fail-closed guard的真实结果，不能称完整suite PASS。Default无env的初始focused run exit0，没有receipt writer；a9 hook只收集cache不额外clip，默认零写入、未知/missing/rejected/身份不符不能补造记录。Source/input、helper/API以外的生产代码不变；本轮不再重复27clips。完整source/range/oldRED/newpartial/raw位置在外部temp，repo只保存本handoff和严格tests。

Reconciler独立验证六份实际MD bytes、validators、warnings、semantic summary、ledger与原full相等；期待failures唯一差异是Materials60与Chem49 context消除。Partial54 source records48PASS/6FAIL；与mechanism未改的旧201条source执行记录得到241PASS/14FAIL、80EXECUTABLE/5BLOCKED。新helper完整380尚未执行，独立review未clear，不用旧55a审计替代。

## Parser defect packets

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

### Quantum table caption / 相邻 citation superscript — 当前独立 packet

同一 untouched raw article SHA-256 `6b2bb78e5f3038d6281eac00b60dc90aa58bdd9ac185ca2d4b9b0de362bbe28e`。新的原始 source / frozen 段落位置及 digests 独立核验如下；不是根据当前 parser 定义期待。

| Expectation / source index | Raw source位置 | Untouched raw subtree prehash | Frozen subtree digest | 当前失败与 source-derived 期待 |
| --- | --- | --- | --- | --- |
| source-crossrefs-v1 internal43/44 | a-section-3 table-caption `[data-test="table-caption"]#Tab1`；真实源 Equ7/Equ15 anchors | f3b0491bc1cce00b208266b23277279d4f368fa7a2752e104b2fb2e0c6a19249 | 23d81f6b93cdfdbfe357c9726209878bf28a55c0952dd19c4ce0290cb90806fc | links/quarto 最终 Table1 caption只剩裸 `(7)` / `(15)`，未绑定 retained equation target；markdown 可读降级 PASS。同 caption 原 ref58 成普通 `58`，原 `\(...\)` 仍残留，math validator如实报错 |
| source-citations-v1 cluster37，ordered58/64 | a-section-2 `section[data-title="Results"]` p18 | 9461453468d164c47c8d6b64843c5578c260bf0251b713796d45fb36cbd74963 | b226cfc00f5f696516b68092ae4701b4222124e54ea965f7ec5bed543af3df16 | 独立 citation sup 被吞入 scientific `${\alpha}^{{\prime}}^{58,64}$`；三个方言都缺原 ordered citation tokens |
| source-citations-v1 cluster57，ordered42/58 | a-section-3 `section[data-title="Discussion"]` p1 | 697d3fbbdcb78ca7ee69c7d85b72b370e185ec3bb260def1aa04aa4962b1c6e4 | 9e6e99e09e8e4cd9e96b870d4c245f5ffb96a2a504c17d8ad5036e8d3b0975e8 | 独立 citation sup 被吞入 `${J}_{m}=\sqrt{\bar{n}}{\kappa}_{2}/2\epsilon^{42,58}$`；三个方言都缺原 ordered citation tokens |

Quantum 源有 77 ordered clusters，当前 semantic 为75；最终 tokens 亦有 table-caption normalization 缺失。完整 expected numbers/order 与 original TeX 都没有改。`accepted-caption-tablemath-remaining-source-packets.json` 保存这些最小源 anchors、准确上下文、raw/frozen身份和实际 table-caption 行；可从冻结 fixture、正常声明 table resource 和实际 `clipNature` 重现。建议将 table-caption scholarly normalization 与相邻独立 citation sup 分别立窄 Work Contract；不由 C 修生产输入/输出。

### 其余 citation / rawHtml 实际失败位置

Materials cluster60与Chemistry cluster49在本轮确认为上节 C literal punctuation误判，ec53 scoped复验解除，不能继续列为生产citation缺陷。Chemistry cluster40（ordered33/34）仍位于Results a-section-2 p2；raw `40052f20434e9ebfb090e55429d3a20e47553d31afe92b047c485808ba6e64a3`、frozen `74e0d28852386fd8165404fa8a38afcb94b49979f2c5dd9f9f3cb457bb3df00e`，source compound粗体2和独立citation33/34真实分开，实际 `\mathbf{2}^{33,34}` 吞掉citation role。Quantum clusters37/57同类源角色证据见上表；交各自citation contract，不改oracle。

Materials links 方言 production rawHtml validator 另报 `unpermitted-html-tag x`，line411/column72。实际源码是原 reference2 title 的字面 `(0<x<-1)`，block `a-reference-2` / `ol.c-article-references > li:nth-child(2)`，raw prehash `0e255b91a472bfacada32b8041e736dbe7ccbae15e28f00a75db89cb113217cb`，frozen digest `9892d49c445a2e6e0321a3c4865b1fd7c52de6e379be2ac212ba1f34ed7c3f7f`。C没有修改原 title、reference期待或 validator；保留该 FAIL 和证据，交独立 parser/validator 归因。外部 `accepted-caption-tablemath-final-remaining-citation-source.json` 记录这些 untouched raw Buffer身份、original HTML、whole source paragraph及每方言真实 failure；FRB cluster50证据也在同文件，但其失败已按上节认定为 C definition mask误判，而不是 production bug。

### Pangenome short-alt identity

`s41586-023-05896-x/source-figures-v1`：admitted main figure原IDs为`Fig1, Fig3, Fig4, Fig5`，原标签明确Figure1/3/4/5；actual semantic label正确，actual alt却变成顺序Figure1/2/3/4。后三个`shortAlt`在全部三方言失败。源wrapper locators / prehash：

| Source ID / block | Selector | Source subtree SHA-256 |
| --- | --- | --- |
| Fig1 / a-section-2 | #figure-1 | a67baa58454b5076eb464f4c74d03fc02ba56af081e7ca81512805d02334e8f1 |
| Fig3 / a-section-3 | #figure-3 | 0f62fea715fb860ff8ff262245ac20798dbb989ce926ea605434c87fee9fec11 |
| Fig4 / a-section-3 | #figure-4 | ef1abb9b5ba8717a76a24d4bc31b39cbc884bdba0280508cb3aebef94f86b0d4 |
| Fig5 / a-section-3 | #figure-5 | 7ec9deb70e1b659a58c27b09ae5a9173c62cdeecdbdb00c85ea34bc8480e04b3 |

### 当前scientific边界：分清已解除与typed-role剩余

- accepted0de literal repair已消除FRB [O III] phantom displays（source8→actual8）和Chemistry [3H] phantom display（source0→actual0）；相关equations/完整captions期待本轮PASS。旧raw/frozen identity分别为FRB Main p5 raw `1c3434cc6f2c022b8461aec0c726db8969900df75c44727b09e04a05a718dc8b` / frozen `6c4a2d899f9bfa7a2cd7c4263e7f0e67dbc70a9623fe3560254b8502fadeb3d6`；Chem Results p0 raw `146a939c2e4551225269d70f3ac93507bdbebc0c85ffb8629ae19c469d164f6c` / frozen `1d03f1991268ca7b64f42caa0f4a5e348594a8d2c129ce9cd756ff5ca7b1359f`。这些身份标签已区分，原科学值未变。
- AlphaFold当前4个isolatedSubscript均在Main a-section-1 p2，source原 `r.m.s.d.<sub>95</sub>` 四次，actualQuarto line60四次 `r.m.s.d.$_{95}$`。这是非unit缩写与原subscript attachment；source期待皆PASS不代替math validator。
- FRB当前14个正文issues：Methods a-section-2 p22两个原 `(5/60)<sup>2</sup>` / `(0.19/60/60)<sup>2</sup>`（actualQuarto line169孤立sup）；p50八个、p51四个 `pc<sup>−2/3</sup>` / `km<sup>−1/3</sup>`（actuallines291/293）。这两类分别为complex base和fractional unit powers，超出旧48简单单位/整数幂边界；不重复已修的12table issues。FRB全部source期待三方言PASS、整篇math仍14FAIL。
- Chemistry当前16 scientific issues为3 isolatedSubscript（Results p2 `Pb(OAc)<sub>4</sub>`，p5 `Fe2(ox)<sub>3</sub>`，Methods p0 `(CD3)<sub>2</sub>CO`）、13 isolatedSuperscript（11 leading isotope mass +2原 `Δ<sup>12,13</sup>`）。ActualQuarto source位置对应lines48/52/60/62/64/70/98/114/126；3H/19F/1H/13C属于后面元素，不得当trailing numeric power。Compound chemical grouping、Δbond-position label、leading isotope须按typed role分别审。
- Chemistry Methods a-section-3 p0还暴露4个validator未检出的mass误挂：source `2.05 <sup>1</sup>H`、`206.26 <sup>13</sup>C`、`3.31 <sup>1</sup>H`、`49.00 <sup>13</sup>C`，untouched raw/frozen同为 `e46e69f8e120aae7909d1f531f54052334313b78481bbce0b641e3ee72e6373a`。原e2 savedMD是孤立sup，accepted6b+0de实际line126变成 `$2.05^{1}$ H` / `$206.26^{13}$ C` / `$3.31^{1}$ H` / `$49.00^{13}$ C`；数字是measurement而非isotope base。它们不在当前16issues，语法valid不能证明科学attachment正确；交独立leading-isotope契约，C未修改source或validator。
- Materials当前14 issues：Methods a-section-6 p37原 `128<i>x</i>0<i>e</i> +64<i>x</i>1<i>x</i> +32<i>x</i>2<i>e</i>`，绝非sup/sub shorthand；actualline244相邻 `$128x$$0e$` 导致4个delimiter issues/source display1→2。rawprehash `6be13b1e3db2cd07f5fc81dfef06fed2ea163e8e64be100b6c958479d74c0dd9`、frozen `606a4dbc6f17d727f95d873d015c680a39155c48d9d5e7f2fe8dc9f04264b364`。其余9处identifier `r<sup>2</sup>SCAN`（actuallines32/70/78/196/280）和一处compound unit `mScm<sup>−1</sup>`（Methods p42、line264）另有typed roles；styled adjacency是已交独立contract的机制，不把已解cue39上下文当生产bug。
- Quantum当前43 math issues包括table-caption24个legacy delimiters未normalize、17个正文Greek subscript fragments、原嵌套10−15变两个isolatedsuperscript（actualline207）。Table-caption源Equ7/15、citation58、原12inlineMathJax及独立citation37/57的证据已在上节；修同一source caption lifecycle与citation角色须由相应独立contract，不靠放宽C期待。

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

当前固定accepted0de/a9 full与ec53 partial命令如下；下面前轮e0/478/e2记录明确为历史，不代表新helper完整run。

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

External source/rights审计此前13raw/85oracle全部valid并复用，本轮没有重做或live reacquire。Ordinary tests使用未改frozenexcerpt/replay，不依赖raw文件；只有显式external-temp env才收集实际cache/MD，不额外clip/writer/network。原 `accepted-units-literals-execution.json` / `-receipt.json` 完整255/27 records保留，scoped `accepted-units-literals-context-partial-reconciled-receipt.json`与本文85rows一一对应。所有full/raw/source/Markdown/comparison logs仅留外部temp，不提交capture或snapshot。

没有声称`npm test`或Issue #10最终CI已通过本检查点。`npm run build`与golden验证已在本轮通过，完整C suite按真实known parser失败exit1；不再重复同一known-red suite来制造绿灯。最终integrator须在parser prerequisites accepted后运行spec§9全部checks和CI matrix。

## 恢复 C / D / integrator 的解除阻塞条件

1. Integrator选择原A/B/D及C authored commits，B b718fa8 attribution独立增量；不重复选择C只读dependency snapshot/merges。C生产receipt固定0de，未将随后accepted b886（PR58/Issue55）插入本轮测试树；root另行安排下一恢复接入，禁止用后来的main冒充这些logs的base。
2. Tablefooter、caption旧crossrefs、tableMathJax、simpleunits/numericpowers、literalbrackets均已消费acceptedmain。Remaining source FAIL五条和validator-only typed roles/source-title证据按上文保留；pangenome shortAlt、Quantumtablecaption、独立citation sup与Materials styled adjacency由相应窄contract/mainCI接纳，再恢复SAME C，不修改B科学输入。
3. SAME reviewer定点审ec53/e3ff新helper/test及a9receipt delta、481scope、旧6RED/最终6baseline60mutants、完整原255/27 reconciliation和partial6/21missing硬失败。旧55a审计不替代新blob；未clear前D不消费它。D只有对应source comparison/全部validators/warnings真实通过才获livegate。
4. 新helper未跑完整380，本文件241/14是清晰标scope的实际归并，不称全suite通过。后续root协调一次适当的85×3、27validators/warnings/repeat/isolation/replay/golden完整verification，保留失败和zero-network证据；不因known-red反复同full或制造green。
5. Integrator在最终真实requiredchecks/三平台CI通过后交单一Issue10deliveryPR；记录最终corpus真实bytes/size review。Canonical/PRD/EDD无修改，无新spec semantics提案。本checkpoint DEPENDENCY_PENDING，非C验收完成、非Issue10完成。
