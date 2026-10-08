# Agent C — 来源核验与离线回归检查点

状态：`DEPENDENCY_PENDING`，2026-10-08 UTC。当前生产基线 accepted `134ba67a9eefe8763314454183a625f83a34837b`（PR #77 / Issue #64），dependency-only `d3dd8573560be019164698f726425294a5101239` 接入。C-owned reviewed9c5 / API/schema1.0保持不变。最新实际 Quantum30来源/3repeat及三方言四validators全PASS；40tests39PASS1FAIL仅partial after缺24组合。当前85行registry为30 `Q134_NEW` 加225历史记录的合成255PASS，不是最新main全255/27验收。Materials/Chemistry/Alpha/FRB所需科学角色仍待accepted prerequisites，见末尾。

历史 e2c1 轮仅复验 Quantum `s41534-023-00746-0` × 三方言：30 条来源记录 27 PASS / 3 FAIL；3 个 Markdown / Bib / semantics / replay repeat 全部 PASS。实际 session22332：40 tests = 30 PASS / 10 FAIL，0 skip / todo / cancel，43,193.7263ms。10 FAIL 包含 3 个 citation 子测试、3 个 validator 子测试、3 个 parents 及 receipt 缺 24 个组合的硬 FAIL。每方言完整 source-crossrefs 已恢复；原 12 个 table-caption MathJax 产生的 24 legacy delimiter issues 消失。其余 math 仍 19 issues（17 Greek isolatedSubscript、2 split isolatedSuperscript），整篇不通过。

历史 e2c1 当时的85行按实际基线区分：30 条 `Qe2c1_NEW`、27 条 `M3889_NEW`、54 条 `AC86_NEW`、144 条 `F0DE`，合成 252 PASS / 3 FAIL、84 条来源 consumer 通过 / 1 条尚未通过。**这不是最新 e2c1 的全 255 条或完整 suite 验收。** 唯一剩余 source failure 为 Quantum `rendered.orderedSourceClusters`：source/semantic/final 均 77 clusters，原 caption cluster[59] 的 citation58 已保留一次，但在既有末尾 Tables section 成为 rendered[76]；其他 76 clusters 相对顺序不变。该失败保持，归因待独立审查现有 source 与 renderer 顺序契约，不提前声称 parser 或 C helper 缺陷。旧证据保留；本轮没有重跑 13 raw / 85 oracle audit、27/full380、60 mutations、ac86 九组合或其他论文。

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
- 前轮 accepted `3889f7396eab99060bec88fc8b0dcd3e6712024e`：root release 后 C independently readback Main `37691610523` 同 head 三 jobs（Ubuntu20 `113032907666`、Ubuntu24 `113032907843`、Windows24 `113032907867`）全部 SUCCESS，Secrets `37691610455` SUCCESS。Issue #57 automation 于21:56:25Z completed（root evidence）。Dependency-only merge `0a52908f36a161ccc6fe9495bf5505263cbc69f6`；没有消费 pending head。
- 当前 accepted `e2c1faddf7219f1886f0fa846353f0f667358375`：root release 后 C independently readback Main `37707702765` 同 head 三 jobs（Ubuntu20 `113085922063`、Ubuntu24 `113085921991`、Windows24 `113085921818`）全部 SUCCESS，Secrets `37707702972` SUCCESS；fetch 后 origin/main 为同 SHA。Issue #60 automation 于00:33:59Z completed（root evidence）。Dependency-only merge `ff6a6c9a360ac9f5e6210a36f241c927c5b9a52c`；原 C authored SHAs 均保留，没有消费 pending head。
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
| accepted main `e2c1faddf7219f1886f0fa846353f0f667358375` | dependency merge `ff6a6c9a360ac9f5e6210a36f241c927c5b9a52c` | table caption；不选择此 merge 为 C authored delivery |

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
15. `3d533fb15115ad670e30b52b11ac6435d654c53a` — accepted3889 Materials 定点 handoff；只包含本文件。
16. `d9939c650a3756232857c09bb08194483c4fb315` — accepted e2c1 Quantum 定点 handoff；只包含本文件。
17. `9c5c3ff9f232ecc3d9eb03b579fb04eef45a4fce` — 按独立容器顺序仲裁修正 citation consumer，并增加真实/明确 synthetic mutations；只含 helper 与 corpus test。
18. `90bac3815eb056abd852edba5083cd4c3e3b2088` — consumer-only receipt；仅本文件。
19. 本文末 accepted a5b6 Chemistry 定点 receipt 的 doc-only commit；准确 SHA 由交接消息与 `git log -1 --format=%H -- docs/goals/issue-10/agent-c-handoff.md` 取得。Dependency-only84cd04e不作为 authored delivery 选择。

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

下表85行使用各文章最近一次实际 execution scope：Quantum30 `Q134_NEW`（本轮）、Materials27 `Mf4a5_NEW`、Chemistry27 `Ca5b6_NEW`、Pangenome27 `AC86_NEW`、其余144 `F0DE`。合成255PASS/0sourceFAIL、85来源consumers有PASS记录；225历史记录未在当前134重新执行。原e2c1三citation FAIL与73d6 native17Greek math FAIL保留在旧外部cache及历史章节；本轮Quantum30source与全部四validators实际通过。Registry不替代全部27组合/255records/ABA/resources/golden及final npmchecks验收，其它论文required math失败继续独立阻塞。

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
| s41534-023-00746-0 | source-metadata-v1 | nature-source-metadata-v1 | [1][0] | PASS | PASS | PASS | EXECUTABLE_NOW | Q134_NEW ×3 | — |
| s41534-023-00746-0 | source-abstract-v1 | nature-source-abstract-v1 | [1][1] | PASS | PASS | PASS | EXECUTABLE_NOW | Q134_NEW ×3 | — |
| s41534-023-00746-0 | source-headings-v1 | nature-source-headings-v1 | [1][2] | PASS | PASS | PASS | EXECUTABLE_NOW | Q134_NEW ×3 | — |
| s41534-023-00746-0 | source-equations-v1 | nature-source-equations-v1 | [1][3] | PASS | PASS | PASS | EXECUTABLE_NOW | Q134_NEW ×3 | — |
| s41534-023-00746-0 | source-figures-v1 | nature-source-figures-v1 | [1][4] | PASS | PASS | PASS | EXECUTABLE_NOW | Q134_NEW ×3 | — |
| s41534-023-00746-0 | source-citations-v1 | nature-source-citations-v1 | [1][5] | PASS | PASS | PASS | EXECUTABLE_NOW | Q134_NEW ×3 | — |
| s41534-023-00746-0 | source-inline-v1 | nature-source-inline-v1 | [1][6] | PASS | PASS | PASS | EXECUTABLE_NOW | Q134_NEW ×3 | — |
| s41534-023-00746-0 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [1][7] | PASS | PASS | PASS | EXECUTABLE_NOW | Q134_NEW ×3 | — |
| s41534-023-00746-0 | source-ui-v1 | nature-source-ui-v1 | [1][8] | PASS | PASS | PASS | EXECUTABLE_NOW | Q134_NEW ×3 | — |
| s41534-023-00746-0 | source-tables-v1 | nature-source-tables-v1 | [1][9] | PASS | PASS | PASS | EXECUTABLE_NOW | Q134_NEW ×3 | — |
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
| s41586-023-06735-9 | source-metadata-v1 | nature-source-metadata-v1 | [5][0] | PASS | PASS | PASS | EXECUTABLE_NOW | Mf4a5_NEW ×3 | — |
| s41586-023-06735-9 | source-abstract-v1 | nature-source-abstract-v1 | [5][1] | PASS | PASS | PASS | EXECUTABLE_NOW | Mf4a5_NEW ×3 | — |
| s41586-023-06735-9 | source-headings-v1 | nature-source-headings-v1 | [5][2] | PASS | PASS | PASS | EXECUTABLE_NOW | Mf4a5_NEW ×3 | — |
| s41586-023-06735-9 | source-equations-v1 | nature-source-equations-v1 | [5][3] | PASS | PASS | PASS | EXECUTABLE_NOW | Mf4a5_NEW ×3 | — |
| s41586-023-06735-9 | source-figures-v1 | nature-source-figures-v1 | [5][4] | PASS | PASS | PASS | EXECUTABLE_NOW | Mf4a5_NEW ×3 | — |
| s41586-023-06735-9 | source-citations-v1 | nature-source-citations-v1 | [5][5] | PASS | PASS | PASS | EXECUTABLE_NOW | Mf4a5_NEW ×3 | — |
| s41586-023-06735-9 | source-inline-v1 | nature-source-inline-v1 | [5][6] | PASS | PASS | PASS | EXECUTABLE_NOW | Mf4a5_NEW ×3 | — |
| s41586-023-06735-9 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [5][7] | PASS | PASS | PASS | EXECUTABLE_NOW | Mf4a5_NEW ×3 | — |
| s41586-023-06735-9 | source-ui-v1 | nature-source-ui-v1 | [5][8] | PASS | PASS | PASS | EXECUTABLE_NOW | Mf4a5_NEW ×3 | — |
| s41467-023-44030-3 | source-metadata-v1 | nature-source-metadata-v1 | [6][0] | PASS | PASS | PASS | EXECUTABLE_NOW | Ca5b6_NEW ×3 | — |
| s41467-023-44030-3 | source-abstract-v1 | nature-source-abstract-v1 | [6][1] | PASS | PASS | PASS | EXECUTABLE_NOW | Ca5b6_NEW ×3 | — |
| s41467-023-44030-3 | source-headings-v1 | nature-source-headings-v1 | [6][2] | PASS | PASS | PASS | EXECUTABLE_NOW | Ca5b6_NEW ×3 | — |
| s41467-023-44030-3 | source-equations-v1 | nature-source-equations-v1 | [6][3] | PASS | PASS | PASS | EXECUTABLE_NOW | Ca5b6_NEW ×3 | — |
| s41467-023-44030-3 | source-figures-v1 | nature-source-figures-v1 | [6][4] | PASS | PASS | PASS | EXECUTABLE_NOW | Ca5b6_NEW ×3 | — |
| s41467-023-44030-3 | source-citations-v1 | nature-source-citations-v1 | [6][5] | PASS | PASS | PASS | EXECUTABLE_NOW | Ca5b6_NEW ×3 | — |
| s41467-023-44030-3 | source-inline-v1 | nature-source-inline-v1 | [6][6] | PASS | PASS | PASS | EXECUTABLE_NOW | Ca5b6_NEW ×3 | — |
| s41467-023-44030-3 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [6][7] | PASS | PASS | PASS | EXECUTABLE_NOW | Ca5b6_NEW ×3 | — |
| s41467-023-44030-3 | source-ui-v1 | nature-source-ui-v1 | [6][8] | PASS | PASS | PASS | EXECUTABLE_NOW | Ca5b6_NEW ×3 | — |
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

## Accepted e2c1 Quantum 定点结果与未决顺序契约

本轮固定 code head 为 dependency merge `ff6a6c9a360ac9f5e6210a36f241c927c5b9a52c`，实际 production accepted base 为 `e2c1faddf7219f1886f0fa846353f0f667358375`。32 个 Git objects（29 corpus files、C helper、corpus test、golden test）与 reviewed `3006f0f` 逐字节相同；原始 B fixture `b32d31f2389e8c052f990812cfd86441172538fd66e37fa17f97704d8795d9fc`、table fixture `90670968407415e1f7e7c624b3244330015a4e52bc9790e811d2992205851c2d` 不变。没有采用 bug projection 替换 admitted corpus article；没有重新解析 raw body。

源 `#Tab1` caption 的 raw prehash 沿用 `f3b0491bc1cce00b208266b23277279d4f368fa7a2752e104b2fb2e0c6a19249`，本轮 frozen serializer digest 核对仍为 `23d81f6b93cdfdbfe357c9726209878bf28a55c0952dd19c4ce0290cb90806fc`。source packet 保存原 12 MathJax sourceTeX/DOM 与实际最终 12 inline TeX；原 caption citation58 在 markdown `[^58]`、links `[58](#ref-58)`、quarto `[@Chamberland2022]` 各出现一次。实际 caption 行分别 578 / 584 / 481，位于现有 `## Tables` 后。source-crossrefs 完整 PASS 包括 internal[43]/[44] 的 Equ7 / Equ15 原 occurrence。24 caption legacy-delimiter issues 已消失；不能据此称整篇 math 或 source-citations PASS。

source/semantic/final 均 77 clusters，reference numbers 严格 1–77；Markdown 77 definitions、links 77 strict reference anchors 保留。实际 ordered source consumer 只剩 `rendered.orderedSourceClusters` FAIL：原 source[59] caption58 在渲染末尾成为 final[76]，原 body source[60…76] 在其前，其他 76 clusters 相对顺序不变。same-run failure arrays 精确满足 `actual = expected.slice(0,59) + expected.slice(60) + expected[59]`，semantic source order 完全等于原 expected。没有把全篇 source count、别处 citation58 或无缺项充当顺序 PASS。Root 将交独立审查判断 existing renderer 的 table relocation 与 canonical source ordering 的准确关系；C 不预判根因，不改 helper、B oracle 或科学输入。本轮没有 spec 语义改动提案。

每方言 math FAIL 为 17 Greek isolatedSubscript + 2 split isolatedSuperscript；structure/rawHtml/crossReferences 均 PASS。原 17 Greek primitive、2 split 与 5 numeric-power controls 的共 24 来源位置从未变旧 packet 复用，并核对 frozen paragraph digests，没有声称做了新的 raw audit。3 warnings 的 expected/actual/missing/unexpected 都准确为 []；每 baseline/repeat 仅声明的 table-1 GET/manual 和 www.nature.com resolver(all/verbatim) 各一次，ledger unexpected=[]，实际 HTTP/DNS 0。3 repeat 的 Markdown/Bib/semanticSummary/ledger 全部 PASS。after hook 只保存同次 actual 3 comparisons/MD，records3、missing24、errors[]、unexpected[]、completefalse；硬 FAIL 不改为 complete。

本轮确切命令如下，`<TEMP>` / `<C-worktree>` 使用下文已列绝对路径；native PowerShell 先从 inventory.pattern 赋 `$cQuantumPattern`，静态确认准确 3 source + 3 repeat / 30 expectation IDs 后，仅执行一次。

| Command | Actual result |
| --- | --- |
| `gh run view 37707702765 --json headSha,status,conclusion,jobs`；`gh run view 37707702972 --json headSha,status,conclusion`；`git fetch origin main` | 同 e2c1 SHA Main 三 jobs / Secrets completed success；origin/main 同 SHA |
| `git merge --no-ff e2c1faddf7219f1886f0fa846353f0f667358375 -m 'chore(corpus): adopt accepted table caption prerequisite'` | exit0；dependency-only ff6a6c9，原 C authored commits 不重写 |
| `node <TEMP>/accepted-delta-inventory.mjs <C-worktree> <TEMP>/accepted-e2c1-quantum-caption-delta s41534-023-00746-0` | exit0；32 immutable Git identities、API1.0/85registry/10consumers，准确 3+3 title / 30 source records |
| `node --test --test-name-pattern $cQuantumPattern test/nature-corpus.test.mjs`；env `ACADEMIC_CLIPPER_CORPUS_RECEIPT_PREFIX=<TEMP>/accepted-e2c1-quantum-caption-delta` | exit1；session22332 terminal，40 tests30PASS/10FAIL，0skip/cancel/todo，43193.7263ms；source30=27PASS/3FAIL，3repeatPASS，receipt24missing硬FAIL |
| `node <TEMP>/accepted-e2c1-quantum-receipt.mjs <C-worktree> <TEMP>/accepted-e2c1-quantum-caption-delta <TEMP>/accepted-3889-materials-delta` | exit0；全部30 TAP/cache ordered IDs/status 一致；225 历史记录仅合成 scope，无新 full |
| `node <TEMP>/accepted-e2c1-quantum-source-packet.mjs <C-worktree> <TEMP>/accepted-e2c1-quantum-caption-delta` | exit0；cache/frozen only，caption59→76、12原/最终TeX、77reference identities、24 unchanged scientific positions、全部 validators/warnings/ledgers；new clip/raw parse/network 0 |
| 外部旧 evidence manifest 按 bytes/SHA256 逐项核对 | ac86 原29文件、3889 原16文件全部 unchanged；旧0de84 identity inventory 保存 |
| `node <TEMP>/accepted-e2c1-quantum-checkpoint-audit.mjs <C-worktree> <TEMP>/accepted-e2c1-quantum-caption-delta` | exit0；85 doc rows/255 scoped statuses 与 receipt 逐项相同，252/3、Q30/M27/AC54/F144；32 immutable Git objects、29/16/84 旧证据字节核对；只读，无新 clips |
| `git diff --check`；`git diff --cached --check`；`git diff --cached --name-only`；`git status --short` | authored delta 仅本 handoff；immutable inputs/golden quiet；最终 clean checkpoint SHA 在交接消息报告 |

`$cQuantumPattern` 精确为 `^(?:s41534-023-00746-0)/(?:markdown|links|quarto): (?:every source expectation through the complete production chain|repeat Markdown, bibliography, semantics and replay operations)$`。运行前 prefix log 不存在，没有错误 filter 启动、覆盖旧证据或再 clip 取 cache。外部 receipt harness 仅由已用 Materials reconciler 改 accepted-base 和 Qe2c1 scope 标签；不修改 test receipt hook、consumer 或 oracle。

| External filename | Bytes | SHA256 |
| --- | ---: | --- |
| accepted-e2c1-quantum-caption-delta.log | 92082 | 896a9bc1682a5b6613f67fd3e570f4e29d5fa4af5472b393821e618e51e41b55 |
| accepted-e2c1-quantum-caption-delta.comparisons.json | 407799 | e78b114900df5bbe8c0b8939ef234bb4bf7b3aaef62bb0642f9ac747cc67e9d2 |
| accepted-e2c1-quantum-caption-delta-receipt-status.json | 1812 | 1a8e036ac6e52f4bc77634623ad8293e2135c8069d03bc22dfaba6eea638a450 |
| accepted-e2c1-quantum-caption-delta-receipt.json | 98877 | 70dae5a39bdae88c6f7b2d0aacb490d9f1e728dd3552a55ce8bec2673f199f3c |
| accepted-e2c1-quantum-caption-delta-execution.json | 3769 | 89e84507b71e29517871c9aac91dd786141e4f38a4a423300f99b21383dd7a7c |
| accepted-e2c1-quantum-caption-delta-source-packet.json | 87805 | 303930308cf9b1ff949e793440fe5ef3845433b78a89714e9f8ad9062c1794a5 |
| accepted-e2c1-quantum-caption-delta-inventory.json | 26645 | 524d5779a39b869eadd6177c3debeaaf04a2066634a9b070f5667c23564ea775 |

各组合文件共用 prefix `accepted-e2c1-quantum-caption-delta.s41534-023-00746-0.`：

| Dialect | Comparison bytes / SHA256 | MD bytes / SHA256 |
| --- | --- | --- |
| markdown | 97909 / 79d38c60730dfbee17e924e70da8c9039e14bbc6367cf48b901f3426d6c214bf | 91027 / 4530d8fa6059bc3dd79ff3b9eedbee6fe0f7e7258f95d4ba9b960c663d213870 |
| links | 164567 / 5de32221ba4c837a2ca9b031c476db25e5d79e3caa6a4274b1246f870d67b361 | 95683 / 3c38065d06812995ad6f8bc33afe093d85d0b519bcf3091d5f62f29a8d427cde |
| quarto | 121972 / 4875ef80d7df5364e14ac318f1a9ed13095cdca004fb45785ffecac111bce2c6 | 83529 / ba75a44883df53856b38b9679d87de8a851b5377de1dc0a30fef854a9995d94c |

以下 Materials/ac86/full packets 和命令记录是各自旧检查点，不冒充本轮 e2c1 全验收。

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

历史 accepted3889 的实际命令/结果：

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


### 历史3889外部证据身份

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

本次没有执行 `npm test`、build、golden 或完整 C suite。它们的历史结果已标明基线，accepted e2c1 的 Main CI 提供依赖检查证据，不能替代最终 corpus 验收。最终 integrator 仍须在 parser prerequisites accepted 后运行 canonical §9 全部 checks 和 CI matrix。

## 恢复 C / D / integrator 的解除阻塞条件

1. 采用 original A/B/D 与 C authored SHAs；不要选择 dependency mergesff6a6c9/0a52908/889eb等作为 authored delivery。当前生产为accepted e2c1，source / helper / tests未改；原B b718fa8 rights addition仍由 integrator采用。
2. Issue #57 styled-group/source-equation期待已经在本轮27 source records真实解除，整篇required math10（9identifier、1compound）和links reference2 rawHtml仍FAIL。Root各窄source契约继续；现有 #60 / #61 / #63 / #64 按各自 authoritative goal 的来源角色和冻结范围处理。额外identifier/compound/reference机制的intake由root安排，不替他人扩大scope，不放宽oracle。
3. 85registry当前30 Qe2c1_NEW、27 M3889_NEW、54 AC86_NEW、144 F0DE；252/255仅合成，不声称最新main full通过。Source剩余3FAIL只为Quantum caption59→final76的ordered-cluster predicate；citation58和crossrefs43/44已真实恢复，准确顺序契约待独立审查。各known scientificvalidator FAIL还必须独立通过。D采用 actual reviewed e3ff helper / API1.0；controller修复属D，不改C helper来通过provider。
4. 下一实际accepted prerequisites改变失败后恢复SAME C运行必要scope。最终canonical验收仍要85×3、27validators/warnings/repeat/ABA/resource/golden和§9 checks / matrixCI；本轮仅Quantum3combos，缺24 hook硬FAIL不可mockcomplete。无必要不重复13raw/85sourceaudit、旧full或60mutations；必须完整验收时另在固定combinedacceptedbase执行。Root可仅用本次 immutable source / actual cache 进行独立顺序契约审核，不能补跑本批来制造不同结果。
5. 当前clean checkpoint为DEPENDENCY_PENDING，不宣称C或Issue #10完成、不打开ordinary partialPR。Canonical/PRD/EDD/Bscientificoracle/production/validators由C保持原样；无spec语义改动提案。

## 9c5c3ff 容器 citation consumer-only 检查点

本节覆盖新的 C-owned implementation，不改上述 d993 历史执行记录或 85 行 map。独立合同仲裁已确认：canonical §7 的 cluster 内有序 numbers 与 definitions/keys，并未新增所有 tables 必须 inline 的输出行为；accepted B base e85 已把 tables 放到末尾 `## Tables`。旧全文扁平比较把合法 table relocation 当成 failure，属于 `AGENT_RESOLVABLE` 的 C consumer 缺陷。独立报告为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-cluster-order-arbitration/cluster-order-arbitration.md`，13171 bytes / SHA256 `9ee18b07e54dbbff2db07bd8f9466b5a04a656ee604fed65871e2aad1cc7fffb`；本 implementation 尚待另一 owner 独立审查。

固定 code head 为 `9c5c3ff9f232ecc3d9eb03b579fb04eef45a4fce`，生产基线 e2c1 不变。API/schema仍 `1.0.0`。helper blob `f9144ce6f40653061ee57164d6612860c47da981`，55520 Git/working bytes / SHA256 `120b67bb02bf0d209b2e0a47bb7a8f24424a2b23792604db42ab67cba2347cf4`；test blob `9530e0f194f78cc7d0ff9a9e98fb4b660873585f`，36099 Git/working bytes / SHA256 `2b71573750c6f614ecce7855270e165841aa31f05721295452208737524a1a04`。`git diff --quiet d9939c650a3756232857c09bb08194483c4fb315 -- src test/corpus papers docs/specs docs/PRD.md docs/EDD.md` exit0，确认科学 source/oracle、生产实现、四 validators、golden、意图未改。

新消费者从 immutable retained DOM 识别真实 table caption owner：必须有唯一 caption ID、原 label、唯一声明的 full-size resource URL。最终每个 table frame 必须按原 source table 顺序具有唯一 label、匹配 URL 以及方言 target；模糊/重复 framing fail closed。只允许这个已有 output container relocation。semantic/source 的全文 cluster 顺序仍严格相等；非 relocation 正文 cluster 顺序、每个 table caption 的 cluster 顺序、每簇内 numbers/key/token、完整 occurrence 总数、references/Bib keys 顺序保持严格检查。每个 citation 绑定对应 occurrence 和该容器内原 before/after 邻居，不能由别处相同号码或正文命中替代。不排序 oracle/output，不按 Quantum ID/index59/citation58 特判。

该步重用原实际 Markdown、references、semantic citation arrays：Quantum 取 e2c1 packet，Materials 取3889，Pangenome/Chemistry取ac86，其余取0de；这些输入的生产基线分别保留，**不是 e2c1 新27 clips**。外部 harness 只重建 citation consumer 所需的 result 字段，不冒充完整 production result 或重新运行 `compareArticleResult()`。旧 helper 同缓存27 cases为24 PASS / 3真实 Quantum FAIL；固定9c5 helper为27/27 PASS。真实 source mutation function bodies 从永久 test 精确提取，对同缓存三方言运行8项各方言，共24 checks：删原引用而别处同号码仍在、重复、错号码、移到正文、改邻词、交换正文簇、增加 unmatched 引用、簇内号码倒序，均拒绝，semantic 对象保持原件。

明确 synthetic 的双表/多簇补充永久 tests 实际3/3 PASS、0 skip/todo/cancel、682.2205ms，共33 rejection checks：错误 owner、簇内/容器顺序、缺失/重复、错误号码/邻词、跨 owner 移动、重复 frame、错误 resource、unmatched token 和原 caption identity 歧义。Synthetic 不算真实文章或 scholarly oracle。该缓存步骤与 synthetic tests 的 new clips/raw parses/sanitizer regenerations/network/full suites 均为0。外部初始 harness 的 bibliography 缺字段、caption label range、有限 JSON diagnostic 纠正不属于真实科学 RED；不借这些 harness 故障充当 regression。

外部文件均在 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c/`，没有提交 raw capture、Markdown snapshot 或生成结果：

| Filename | Bytes | SHA256 |
| --- | ---: | --- |
| citation-container-cache-check.mjs | 4943 | 8ca94d1d53ff2ab204dd348c0924e0165dc62367f39d649e402c3ec251e12179 |
| citation-container-old-helper.mjs | 51215 | 38a8a95bfa4ccb365aa0828272ffa13d5bb329b13084680b8a6a5aa980969656 |
| citation-container-red-cached-results.json | 35368 | 5b9cdfd696057bf0b97091d524d2ddf4108074435531ac527e067fee7fae74d7 |
| citation-container-green-cached-results.json | 8178 | d937861747b52e3b83dbbc50007351bb67c642490837a2f40bfe4d7aaea4b976 |
| citation-container-final-exact-cache.log | 93 | 9ab2d511f1550e167dde868ddf5d5414c6854f50c68f1779f39e114ae8cd3cc7 |
| citation-container-final-synthetic.log | 452 | c842d5f710edd461b0fad6df3276c176a90a071453f7fbaed8202691ccf7d426 |
| citation-container-identity-receipt.json | 3341 | f6ef5fa728a5cbe9be95a1dd4ffe3fd1772863d05e3c159abc8aeac29ec70a84 |

可复现的原 scoped 命令为 `node <TEMP>/citation-container-cache-check.mjs red`、同脚本 `green`，以及 `node --test --test-name-pattern="^synthetic citation containers reject wrong owner, caption order and ambiguous framing/(?:markdown|links|quarto)$" test/nature-corpus.test.mjs`（无 receipt env）。旧 red 是脚本报告三个真实 consumer FAIL，非声明旧脚本 process exit1；最终 exact-cache log 报27/27与24 mutations，synthetic TAP 报3/3。恢复者读取既有完成输出并核对7份 evidence 的 bytes/SHA256、27 reports/current helper/test身份和保护路径 quiet diff，没有重复这些命令。9c5实施者与独立 reviewer 的职责保持分开。

旧 d993 实际40tests30PASS/10FAIL、receipt24missing硬FAIL与 Quantum每方言19 math issues 继续作为历史事实保留；本节只证明 source-citations consumer 范围修正，不把整篇 validator FAIL 或 unconsumed receipt 改成PASS，不推导新255全来源/27全生产验收。真实 mutations在最终 canonical batch会由永久 test 的 `run()` 消费完整生产结果；当前只是其准确函数体的缓存执行。此 consumer-only 检查点的后续独立审查、accepted dependency 和实际 Chemistry delta 见下一节；最终 full255/27、四 validators/strictwarnings、replay/resources、determinism/ABA、golden、npm checks与三平台CI仍必需。D消费新 helper 时须核对上述 blobs/API；C、D、Issue #10均未声称完成。Canonical无需语义修订。

## Accepted a5b6 Chemistry 实际定点执行与当前解除阻塞条件

Root 释放后独立读取 Main `37716530268`：同一 merged SHA `a5b6acc2984af5cb8b82106291e963f4f413f5ac`，Ubuntu20 `113114140455`、Ubuntu24 `113114140323`、Windows24 `113114140480` 全 completed/success，最终02:21:27Z；Secrets `37716530267` 同 head success。`git fetch origin main` 后 origin/main 同 SHA，以 non-destructive dependency merge `84cd04e7ced048f5375fac5cb608fd0b75555263` 接入，并已 push。29 corpus files 加 C helper/test/golden共32 Git objects 与前一90bac byte-identical，采用 accepted生产 prerequisite，不覆盖 B 源材料，也不重写 authored commits。

新 C consumer 的独立 review 为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-c-container-independent-review/review.md`，8964 bytes / SHA256 `249953c6736529e2aa6e88cedf954d3d88f5478a9c64d5cf4e14f8b9fc7879db`；同目录 `results.json`8546 / `e17f3adbc576c654d29500df574581eb5c60ff27d17f9f20ca735d87c7a030b5`。精确9c5 helper/test、后续90bac doc-only identities相同；独立3真实cached baseline、48额外mutations、3 synthetic/33 checks通过，零blocking findings。结果仅在全部assert结束后写出，process已terminal，原OS exit code未捕获；不虚报exit0、不重跑来补码。报告还区分Git LF/Windows CRLF，并明确 C 旧9份source-evidence缺 B b718后补rights的已知差异，integrator仍必须选完整B ordered commits，不能whole-branch merge覆盖rights。

本次仅执行 admitted `s41467-023-44030-3` × markdown/links/quarto 的3来源 parent和3repeat。准确9个ID为 source-metadata-v1、source-abstract-v1、source-headings-v1、source-equations-v1、source-figures-v1、source-citations-v1、source-inline-v1、source-crossrefs-v1、source-ui-v1；共27来源 records全PASS。Actual session82368 terminal **exit1**：37tests=30PASS/7FAIL、0skip/todo/cancel、21067.6519ms。7FAIL为三个math validator子测试、三个parent和after缺24combos硬FAIL。每方言math5issues=3 trailing group SUB+2 Δbond-position SUP；structure/rawHtml/crossReferences各PASS。warnings精确为 `No equation nodes were detected.`，missing/unexpected均[]；resources[]，baseline/repeat ledgers均requests[]/resolutions[]/unexpected[]，没有ordinary live DNS/HTTP。3repeat的Markdown/Bib/semanticSummary/ledger全部PASS。此完整来源PASS不代表整篇通过。

保存缓存使用原a9 after hook，不改变receipt基础设施，也不额外clip取证：同次3完整comparison记录保留全部expectations/semanticSummary/四validators（含scientificFragments）/strictwarnings/ledgers，加3MD；它们不是完整Defuddle DOM/result对象。receipt records3、missing24、errors[]、unexpected[]、completefalse，after硬FAIL保持。执行prefix为外部TEMP `accepted-a5b6-chemistry-delta`，先确认不存在 `.log`，没有覆盖历史或重启实际batch。

只读same-cache packet逐个核对原15leading mass roles，分别在7原完整段落/图注source context，顺序和原方括号保持；6个Methods measurement均与随后 isotope expression分开（7.26/77.16带原ppm，2.05/206.26/3.31/49.00没有ppm），包括原四个silently backward-bound cases。每方言15/15实际`$^{mass}Element$` atom准确，先前11孤立mass superscripts消失；未修复另5独立roles。首个external receipt harness误要求measurement直接邻接atom，忽略原7.26/77.16的ppm，实际报 `methods-p0: source measurement separate from isotope`；只修external诊断为既有源测试的 `([\d.]+)(?: ppm)?\s+$`，继续严格核对数值与NMR后邻词。科学input、Chelper/test/production均未改，没有重clip，这个harness误判不作为科学RED。

剩余5问题的actual行号按 markdown/links/quarto：Pb(OAc) trailing4=57/58/52；Fe2(ox) trailing3=67/69/62；(CD3)2CO grouping2=139/146/126；两处Δ12,13分别同65/67/60行。只读frozen source重新核对四个完整paragraph digests：Results p2 `74e0d28852386fd8165404fa8a38afcb94b49979f2c5dd9f9f3cb457bb3df00e`，p4 `fc038557c307a32c496972e01f5b07ab41f4f0605bdf16fb32a87b80d8df061c`，p5 `896c0856d4585fd2b2b6df5ba7dd70bdbb466d8b1eb216d7be2d809d411fc605`，Methods p0 `e46e69f8e120aae7909d1f531f54052334313b78481bbce0b641e3ee72e6373a`。原raw/prehash复用之前独立audit，没有重解析raw或A regeneration；这些roles不混入已accepted61，不放宽math validator。

85行mixed map保存在本轮receipt：27 `Ca5b6_NEW`实际records、30 `Qe2c1_NEW`历史、27 `M3889_NEW`历史、27 `AC86_NEW`历史、144 `F0DE`历史。合成252PASS/3历史FAIL，未宣称当前main255PASS。Quantum原三个citation全局顺序历史FAIL仍保留；另以独立reviewed9c5的cache-only citation consumer PASS×3标记已解决的C机制，**不替换为新30 Quantum生产执行或伪造新完整验收**。新Chemistry真实27record与TAP逐项一致。当前remaining required math roles仍按独立bug Work Contracts推进；D可消费上述reviewed1.0helper，但无需重跑其9clips；最终完整production consumption与canonical验收留待prerequisites全部accepted。

本次实际命令：

| Command | Result |
| --- | --- |
| `gh run view 37716530268 --json headSha,status,conclusion,jobs`；`gh run view 37716530267 --json headSha,status,conclusion`；`git fetch origin main` | exacta5b6 Main三jobs/Secrets success，origin/main同SHA |
| `git merge --no-ff a5b6acc2984af5cb8b82106291e963f4f413f5ac -m 'chore(corpus): adopt accepted leading isotope prerequisite'`；`git push` | exit0，dependency-only84cd，clean |
| `node <TEMP>/accepted-a5b6-chemistry-preflight.mjs` | exit0；32immutableidentities、API1/85registry/10consumers、准确3source+3repeat/27IDs、原15source masses/paragraph digests；clips/raw/Aregen/network0 |
| `node --test --test-name-pattern $cPattern test/nature-corpus.test.mjs`，env `ACADEMIC_CLIPPER_CORPUS_RECEIPT_PREFIX=<TEMP>/accepted-a5b6-chemistry-delta` | session82368 terminalexit1，37/30PASS7FAIL，21067.6519ms，27source/3repeatPASS、receipt24missing硬FAIL |
| `node <TEMP>/accepted-a5b6-chemistry-receipt.mjs` | 最终exit0，仅读same-run三actualcache；27TAP/status/IDs逐项一致、15mass×3/6measurement×3、4validators/strictwarning/zeroledgers、85mixed-tier map、5剩余roles原paragraph身份；新clips/raw/Aregen/network0 |
| `git diff --check`；`git diff --cached --check`；`git status --short`；tracked changed paths审计 | 本轮authored仅本handoff；最终clean checkpoint SHA/推送由交接消息报告 |

`$cPattern`直接从preflight JSON.property赋值给PowerShell变量，精确正向filter：`^(?:s41467-023-44030-3)/(?:markdown|links|quarto): (?:every source expectation through the complete production chain|repeat Markdown, bibliography, semantics and replay operations)$`。没有空filter启动、其他文章/full/framework/mutations/build/golden/npmtest/A85/raw13重复执行。

以下文件位于同外部TEMP，不提交生成内容：

| Filename | Bytes | SHA256 |
| --- | ---: | --- |
| accepted-a5b6-chemistry-delta-inventory.json | 15715 | 6a2e317171e1fd2fe8b60987ec8b5573cb480f32319409e0b196e3c8cc1c862d |
| accepted-a5b6-chemistry-delta.log | 21325 | 39c82f97fc7f29d8ca26e7fc27326cb9836f7ac494abcf2615774eef3657dd61 |
| accepted-a5b6-chemistry-delta.comparisons.json | 187837 | 9e03499a886690d8d8735cf5d088b61b747aa1efe71e0025cc402bcaefbb5ac6 |
| accepted-a5b6-chemistry-delta-receipt-status.json | 1812 | a2ef8b702c5c6bb9b6ec644322095042ab24e5b2dec9fee4843e07f431baefa4 |
| accepted-a5b6-chemistry-delta-receipt.json | 292661 | f236666d540c8fdd9282f6d1481fd046f5fd19d0728aac209b6dbfcc32c6afd1 |
| accepted-a5b6-chemistry-delta-process-exit.txt | 2 | 4355a46b19d348dc2f57c046f8ef63d4538ebb936000f3c9ee954a27460dd865 |

每方言文件前缀 `accepted-a5b6-chemistry-delta.s41467-023-44030-3.`：

| Style | Comparison bytes / SHA256 | Markdown bytes / SHA256 |
| --- | --- | --- |
| markdown | 43345 / 1a74ab9f773e7c85cf2460b2ca524a9534d38f40c7d9b576e82c070fbad5e3df | 50959 / 0f01485de2b853de7d4ecc998221cef9461262ddc91e174eb2d3474bb0b5497e |
| links | 80519 / 0645e8d958794afda64532064d4b286c6b78b3c16d0cca938558ec69bcc0a08c | 53157 / 9767992956b7ac1072f427b100acc2ccd0ad1f99e28e8cb8902e9add79c6a190 |
| quarto | 53168 / 71ced20b6f12c9aa95a9db6e00618793230470aa3d80f90ec8d3d7265749edba | 40863 / 964045dfcb3281926ac468c5da304e84c42989c3c81adfcdd578a170499e9b0b |

C保持DEPENDENCY_PENDING；等待独立Δ/group、Quantum Greek/split、Materials identifier/compound/reference及Alpha/FRB各required roles的accepted修复后继续必要delta，最终再执行固定combinedhead的canonical全255/27/repeat/ABA/resources/golden/npmchecks/CI。不得删除困难source、降低期待、把known失败计成通过，或打开Issue #10部分普通PR。没有spec changes。

## Accepted f4a5 Reference literal — Materials 实际增量执行

Root 确认 PR #70 的 merged main 后，C independently readback Main `37725961177` / Secrets `37725961084` 的同一 SHA `f4a5f2ad74546ea54b990c6080e480871ee98e09`：Ubuntu20 job `113144056165`（04:16:39Z）、Ubuntu24 `113144056319`（04:14:41Z）、Windows24 `113144056321`（04:17:33Z）均 completed/success，Secrets success。Fetch 后 origin/main 同 SHA；non-destructive dependency merge `99282d167c400d556fd115ae049466a716b63dff` 接入，保留全部 C authored originals。没有消费未 accepted head，也未选择其他 agent 的 whole branch。后续本节 DOCONLY commit 的最终 HEAD 由交接消息标识；integrator 从 accepted main 开始，不将 dependency merge 当作 C authored delivery。

Preflight 的32个 protected Git objects（29 corpus files、C helper、corpus test、golden test）全部与 `779fc99c4a6ffa55672da08ac6226c6b906f36f6` 相同。Helper blob `f9144ce6f40653061ee57164d6612860c47da981`，test `9530e0f194f78cc7d0ff9a9e98fb4b660873585f`，golden test `74b776eece94dc8402844ed1edc95fd6847250a4`；沿用独立 reviewed 9c5 / API1.0。B attribution 后补 source-evidence rights 的既有继承差异保持原状，最终 integrator 必须先选择完整 B ordered commits；此轮不修改 fixture、manifest、scientific oracle、consumer、validator 或生产代码。

准确执行 `s41586-023-06735-9` 的3 source parents 与3repeat，9 IDs为 source-metadata-v1、source-abstract-v1、source-headings-v1、source-equations-v1、source-figures-v1、source-citations-v1、source-inline-v1、source-crossrefs-v1、source-ui-v1。Actual session `45303` confirmed live 后同 handle terminal **exit1**：37tests=30PASS/7FAIL，16356.5531ms，0skip/cancel/todo。**27来源 records全部 PASS；3repeat 的 Markdown/Bib/semanticSummary/replay ledger 全部 PASS。** 七个 FAIL 为三 math validator 子测试、三个 parents 与 after 缺24 combos 的硬 FAIL。没有重新启动或运行其他文章，实际3baseline+3repeat共六次 clips。

所有四 production validators 在 source comparison 中实际执行：三方言 math均FAIL、structure/rawHtml/crossReferences均PASS。每方言恰好10 `scientific-isolatedSuperscript`，其他 fragment counts零；warnings exact `[]`，missing/unexpected为[]；resources[]，baseline ledger requests/resolutions/unexpected均[]。Repeat test已严格比较全部 ledger 等值；repeat完整result没有另存，不能声称存在独立repeat缓存。现有 a9 after hook 保存同次3baseline comparison（含全部 expectation/summary/四validators/strictwarnings）与3Markdown；after `records=3`、`missing=24`、`errors=[]`、`unexpected=[]`、`complete=false`，硬FAIL原样保留。它们不是完整 Defuddle DOM/result。缓存 postcheck 没有再clip。

Issue #65 的真实解除证据：links `rawHtml.valid` 从历史3889的false变为true。最终 Reference2 line411保留原 title，通过 literal `&lt;` 编码得到 `(0&lt;x&lt;-1)`；读取呈现为原 `(0<x<-1)`，不改成新的数学界限。三方言 semantic reference2仍 `Mizushima1980` / DOI `10.1016/0025-5408(80)90012-4`，完整 ordered references 与 citation summary 均和历史相同。原 `a-reference-2` subtree raw `0e255b91a472bfacada32b8041e736dbe7ccbae15e28f00a75db89cb113217cb`、frozen `9892d49c445a2e6e0321a3c4865b1fd7c52de6e379be2ac212ba1f34ed7c3f7f` 复用已完成 source audit，无新 raw 解析。

剩余科学角色仍为独立 mandatory prerequisites：#68共11个 original r²SCAN identifier roles，9个正文/图注的 r$^{2}$SCAN orphan 加2个 H3/H4中 silently flattened `r2SCAN`；#67是一个 `mS × cm^-1` compound unit，负幂只属于 cm factor，不能把整个 mScm 取逆。旧3889 source packet 的 family prose曾称 exponent属于compound unit；其历史 bytes保留，此处采用已独立核验的 #67 factor oracle澄清，不改源DOM/数值。原普通 conductivity `101.18` 保持普通值，不推测为10的指数。Raw/frozen paragraph identities均复用之前已完成 source packet，六个科学 source位置与 digest见本文件历史表和新 receipt。

| Dialect | 9个 identifier orphan行（重复表示同一行不同出现） | 两个 silently flattened heading行 | compound unit行 |
| --- | --- | --- | --- |
| markdown | 33,81,91,91,91,259,259,259,379 | 87,257 | 357 |
| links | 33,83,93,93,93,262,262,262,382 | 89,260 | 360 |
| quarto | 32,70,78,78,78,196,196,196,280 | 74,194 | 264 |

Registry仍85 admitted expectations /10 consumers。本次只为 Materials 的27 records建立 `Mf4a5_NEW` scope；其他文章记录仍来自前一 Chemistry `Ca5b6_NEW`、Quantum `Qe2c1_NEW`、Pangenome `AC86_NEW` 和其余 `F0DE` 的历史执行，原252PASS/3历史QFAIL map留原文件，citation-container缓存独立review解释该历史Q机制已解决。这不制造最新255 execution、27组合验收、ABA/full-resource/golden或新的Quantum/其他文章pipeline。原 Materials `M3889_NEW` bytes 与原Chemistry receipt `f236666d540c8fdd9282f6d1481fd046f5fd19d0728aac209b6dbfcc32c6afd1`保留；无需为map或doc重复clips。

实际命令在本 C worktree：

| Command | Result |
| --- | --- |
| `gh run view 37725961177 --repo uwougil/Academic-clipper --json headSha,status,conclusion,jobs`；对应Secrets `37725961084`；`git fetch origin main` | exact f4a5 merged-main三jobs/Secrets success，origin/main同SHA |
| `git merge --no-ff f4a5f2ad74546ea54b990c6080e480871ee98e09 -m 'chore(corpus): adopt accepted reference literal prerequisite'` | exit0，dependency-only99282d；32 protected Gitobjects未变 |
| `node <TEMP>/pending65-materials-779fc99-preflight.mjs` | 已完成READONLY preflight exit0；准确3source+3repeat/27IDs、API1.0、原cache/fixture身份，无raw/sourceA audit/新clip |
| `node --test --test-name-pattern $cMaterialsPattern test/nature-corpus.test.mjs`；env `ACADEMIC_CLIPPER_CORPUS_RECEIPT_PREFIX=<TEMP>/accepted-reference-literal-materials-delta` | session45303 terminalexit1，37/30PASS7FAIL，16356.5531ms；27source+3repeat PASS；sixactualclips；24missing硬FAIL |
| `node <TEMP>/accepted-reference-literal-materials-receipt.mjs` | exit0，仅读同次3缓存；全部27 IDs/status与TAP对应、原refs/citations不变、9orphan+2headings+1unit位置、四validators/strictwarning/zeroledgers、32Gitobjects均严格assert；newclips/raw/A/sourceaudit0 |
| `git diff --check`；`git diff --cached --check`；`git status --short`；tracked changed paths | 本轮authored仅本handoff；dependency production source不冒充 C authored变化；最终clean/push消息另报root |

`$cMaterialsPattern`从preflight JSON.property直接赋至PowerShell变量后传native，精确正向filter：`^(?:s41586-023-06735-9)/(?:markdown|links|quarto): (?:every source expectation through the complete production chain|repeat Markdown, bibliography, semantics and replay operations)$`。Prefix原先不存在；原6titles全部实际执行，没有empty-filter启动。receipt postcheck为现有JSON/Markdown身份和语义核对，不复制sanitizer/replay/assertion框架，不调用生产链。所有失败与成功证据保留，没有harness correction。

外部TEMP `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c`，不提交 generated Markdown/cache/log/raw：

| File | Bytes | SHA256 |
| --- | ---: | --- |
| pending65-materials-779fc99-preflight.json | 14314 | 612f295085f382322ee435d7b1c8b918cb0d9e765aaac9ae752f5dd8f0b53dec |
| accepted-reference-literal-materials-delta.log | 33702 | be496cd897a1243f3c50bd2eb098feb68b37b205471f9747272f084231a755f4 |
| accepted-reference-literal-materials-delta.comparisons.json | 250408 | f4a2f704e73df3650fba333ca91b780b2e70a4b95f9a9d10ac6eee28cda0894b |
| accepted-reference-literal-materials-delta-receipt-status.json | 1812 | 6ca5cebff2ac0be8601682e1f74abc355117d9565c97a066eb9add7c8ff00973 |
| accepted-reference-literal-materials-delta-process-exit.txt | 1 | 6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b |
| accepted-reference-literal-materials-delta-receipt.json | 40328 | 4aaa7bae7061093f80ff98d3cdcecfd50c6e020af5376b4a38b23d4c6b968aef |

每方言 file prefix `accepted-reference-literal-materials-delta.s41586-023-06735-9.`：

| Dialect | Comparison bytes / SHA256 | Markdown bytes / SHA256 |
| --- | --- | --- |
| markdown | 61436 / 54e095714fe1edf18794339d3b113d18d47225f7a6fe6a0200e8cb7c59cabf25 | 80619 / bb184af976d5c40140cfe0069bf976aa0aee4213a8983bffbba29fcd1bb7dc5f |
| links | 103561 / ad59dd4575ebe55c7ce3b4d93f960835d875c6f571d94eeb8ad91fe5d18aaf86 | 83189 / d9cec7eb0c9411a08a9835b4c74ba4484f1a2d5211f69443b27e4fed0fd6787f |
| quarto | 71680 / b733bc1874328711ba153263b594c7ba169ceb3efbe9798a67ee5bfe6b9bbfa5 | 67777 / 960f2a1ed3c405beb147191185fe5d5ee56613b7a3fdd6f7e515318aa55a7e7d |

C仍DEPENDENCY_PENDING。#65在此次实际 Materials source/linksrawHtml已解除；#67/#68、Quantum Greek/split、ChemistryΔ/group、Alpha/FRB required roles仍待accepted prerequisite，再按需delta或最终combinedhead canonical全验收。此轮没有full255、golden/build/npmtest、A/B/source重审或Dcontroller重复运行；没有修改spec、扩大安全/架构范围或新PR；不声明Materials或Issue#10完成。

## Accepted73d6 Split power — Quantum 实际增量执行

Root正式release之后 independently readback Main `37734814590` / Secrets `37734814595` 同 merged SHA `73d6cfafba9bb33149959e315ab29b5b0bc24d75`：Ubuntu20 job `113171838806` completed06:04:14Z、Ubuntu24 `113171838941`06:02:32Z、Windows24 `113171838734`06:05:44Z，全部success；Secrets completed/success。Fetch origin/main同SHA，non-destructive dependency merge `12ec9e76b9fce6942997ebd79da4da55458e5853` 接入。Root另验证 Finalize `37735759743` / Issue #63 automation completed06:05:56Z；该finalizer非C重复查询。C原 authored SHAs不重写，integrator只选C authored，不能whole-branch合并覆盖B后补rights。

复用此前只读 `pending63-quantum-c508-preflight.json` / `.mjs`，没有再运行它、重新解析raw、A regeneration、source85独审或框架重写。接入后按预检32 protected Gitobjects逐个assert unchanged：29corpus files与helper `f9144ce6f40653061ee57164d6612860c47da981`、test `9530e0f194f78cc7d0ff9a9e98fb4b660873585f`、golden test `74b776eece94dc8402844ed1edc95fd6847250a4`。沿用独立 reviewed `9c5c3ff9f232ecc3d9eb03b579fb04eef45a4fce` / API1.0，未改source/manifest/helper/tests/validators/production/canonical。

只执行 admitted `s41534-023-00746-0` 的3 source parents 与3repeat。十个 IDs为 source-metadata-v1、source-abstract-v1、source-headings-v1、source-equations-v1、source-figures-v1、source-citations-v1、source-inline-v1、source-crossrefs-v1、source-ui-v1、source-tables-v1。Actual session `95973` confirmed live 后同handle terminal **exit1**：40tests=33PASS/7FAIL、61747.9297ms、0skip/todo/cancel。**30source records全PASS、3repeat全PASS**；7FAIL为三个math validator子测试、三个parents、after缺24组合硬FAIL。三baseline+三repeat为六actualclips，postcheck只读同次cache没有额外clip。

Four production validators全部执行；每方言 mathFAIL、structure/rawHtml/crossReferences PASS。Math原19issues变为17，全部 `scientific-isolatedSubscript`；isolatedSuperscript由2归零，其他scientific fragment类型零。仍然是17个native Γ/Ω subscript科学角色，受独立 Issue #64 阻塞，不允许warnings替代或宣称Quantum整篇通过。每baseline warnings expected/actual均[]、missing/unexpected[]。Source真实 table1为 `full-size-html`，表格cells/TeX/summary与原e2c1 unchanged。

Actual replay每baseline恰好一个GET `https://www.nature.com/articles/s41534-023-00746-0/tables/1` / redirect `manual`，DNS `www.nature.com` / all:true / verbatim:true；unexpected[]。Repeat测试严格比较MD bytes、referencesBib bytes、semanticSummary与整个ledger equality，全部PASS；repeat完整result未另保存，不声称独立repeatcache。现有 reviewed execute() 使用A replay注入到D seam，finally严格assert resources，记录后拒绝未声明请求，catch不能吞掉unexpected；没有global fetch/DNS mutation。本轮没有另加process-wide spy；零ordinary live操作的证据范围是既有受审生产注入路径与exact replay ledger，不能把声明table回放说成零request。Corpus执行路径不调用writer。

原source Results p33的完整段落仍对应 `a-section-2`、raw prehash `76701dc7ea4f491570f57d3ae1329c472eb812a2454237392b6f0d99c8a55435`、frozen `d9fd04d9e40ad364d1c122769be3e2f4d318ea429dfc158c9bcd66575c02c3a4`。原直接相邻 `<sup>−</sup><sup>15</sup>` 在真实whole B corpus三方言都成为同一个 `$10^{−15}$`，保留前 `~`、后“even with a small SC”及相邻Fig4d。Actual MD行markdown244/links248/quarto207。原Results p37完整段落raw `28e06f2eac7ed32e9dca4b87991c85cc120323782c2dbe1c980cdaa669af9f64`、frozen `db986d752212798179907747abd707b3a96a2aa6fa5f9a33569798f8bba453b1`，五singleSUP controls为−3两次、−15、−2、−5，均准确。引用原科研结论和数值未修改；sourcepacket复用既有 `303930308cf9b1ff949e793440fe5ef3845433b78a89714e9f8ad9062c1794a5` 身份，无新raw/sourceparse。

Reviewed9c5 source-owned table relocation消费者现在actual source-citations全三方言PASS。原semantic/source77citationclusters、有序77 references和table summary与历史e2c1缓存全等，source58图注引用仍在原table caption语境，原全局差异由严格container归属、内部顺序、多重性和非迁移cluster顺序断言判定。此轮不改sourceoracle或caption内容，也不把旧历史FAIL擦掉。

Optional existing a9 after hook保存本次3baseline comparison（含完整expectations/summary/四validators/warnings）和3MD；这些不是完整Defuddle DOM/result。Receipt records3/missing24/errors[]/unexpected[]/completefalse，after继续硬FAIL，scope与测试结果如实保留。Current85行map为30 `Q73d6_NEW`、27 `Mf4a5_NEW`、27 `Ca5b6_NEW`、27 `AC86_NEW`、144 `F0DE`；合成255PASS/0sourceFAIL，仅本轮30是current accepted73d6实际执行。仍没有最新全部255/27、全篇validator PASS、ABA/resource scenarios/golden、final npmchecks/CI验收。

External cached诊断经历两次独立harness修正，均不算scienceRED：首次exit1误用了reduced #64 refsPREFIX76，B admitted source-citations.referenceCount与old/newactual均77，改external数值检查；第二次exit1把三方言p37都定位为literal `In Fig. 4d,`，实际links/quarto保留4d的链接，改定位为同一完整源段唯一正文短语 `we plot the minimal total logical error probability`。所有scientific atoms/control仍严格相同；最后postcheck exit0。原两版脚本 `.initial-harness.mjs` / `.second-harness.mjs`在TEMP保留，未重新clip。以后直接从manifest取full prefix，使用已有方言兼容定位，避免这两类重复误判。

实际命令（C ownworktree）：

| Command | Result |
| --- | --- |
| `gh run view 37734814590 --repo uwougil/Academic-clipper --json headSha,status,conclusion,jobs`；Secrets37734814595；`git fetch origin main` | exact73d6 Main三jobs/Secrets success，origin/main同SHA |
| `git merge --no-ff 73d6cfafba9bb33149959e315ab29b5b0bc24d75 -m 'chore(corpus): adopt accepted split numeric power prerequisite'`；32protected Gitblobs逐项比较 | exit0，dependency12ec，全部unchanged |
| `node --test --test-name-pattern $cQuantumPlan.pattern test/nature-corpus.test.mjs`；env `ACADEMIC_CLIPPER_CORPUS_RECEIPT_PREFIX=<TEMP>/accepted-split-power-quantum-delta` | session95973 terminalexit1、40/33PASS7FAIL、61747.9297ms；30source+3repeat PASS；仅六clips，missing24硬FAIL |
| `node <TEMP>/accepted-split-power-quantum-receipt.mjs`（仅读同runcache） | finalexit0；30TAP IDs/status、32blobs、原split+五controls、ref/cite/table不变、四validators/strictwarnings/exactledgers、85mixedregistry全部assert。此前两次externalharness exit1如上保留 |
| `git diff --check`；`git diff --cached --check`；`git status --short`；changed tracked paths审计；`git push` | 本轮authored仅本handoff；最终clean/push SHA由交接消息标识 |

`$cQuantumPlan.pattern`复用preflight.property，准确正向filter：`^(?:s41534-023-00746-0)/(?:markdown|links|quarto): (?:every source expectation through the complete production chain|repeat Markdown, bibliography, semantics and replay operations)$`。Prefix起初不存在，只启动一次，没有empty filter、full suite/其他文章/newraw/Aaudit/review/source重做/build/golden/npmtest/Dcontroller重复。

外部TEMP为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c`，以下cache/MD/log没有提交：

| File | Bytes | SHA256 |
| --- | ---: | --- |
| pending63-quantum-c508-preflight.json | 33137 | 1cd21c705ec7753dae9bcdf0ba3e2af3fcbf32212588040135f54159666181d3 |
| accepted-split-power-quantum-delta.log | 51481 | 6db670cb59d462a2e209fccf3242e48ead3fa023bf12e35205227cbc97be5a82 |
| accepted-split-power-quantum-delta.comparisons.json | 362040 | ccf254d14934f234bcfb08504b3419f95b35a5abaea1298e46bdb7d9110962f2 |
| accepted-split-power-quantum-delta-receipt-status.json | 1812 | 1a8e036ac6e52f4bc77634623ad8293e2135c8069d03bc22dfaba6eea638a450 |
| accepted-split-power-quantum-delta-process-exit.txt | 1 | 6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b |
| accepted-split-power-quantum-delta-receipt.json | 107388 | 28ea340fee8a3467640d1513bc39ca43dc539b5190b21d559a58a90db5192dd6 |

每方言文件前缀 `accepted-split-power-quantum-delta.s41534-023-00746-0.`：

| Dialect | Comparison bytes / SHA256 | MD bytes / SHA256 |
| --- | --- | --- |
| markdown | 84006 / b2ee3d6519da3a9cd7c3e38695bc9ec5bd7819f89f9adf38a07bc64acc591803 | 91213 / 8009d348593686693d5b8569d65c380346da8862ad2931ea0e710060ae607b6e |
| links | 150664 / a427b53a685add22df1693b213cf964abfe2b219ab78a55350c1866ecacd6814 | 95869 / 164882290c2388ba0b0da54e2a10ad43b29339c49f38bfc4d0d308c28e32e373 |
| quarto | 108069 / f325c702199165922d7c75924a6026139ed171cdae0cb3d86dd22d91d53c08ab | 83523 / 01a2350c40afe7fc9db194ecf8c979abeff3d79e2c9ef763774bcf3d629aa702 |

C仍DEPENDENCY_PENDING；#63原split科学角色已在wholecorpus实际解除，#64 native17Greek、Materials/Chemistry/Alpha/FRB等requiredroles仍待各自accepted prerequisites。按受影响范围继续必要delta；最终combinedacceptedhead仍须canonical全部255/27/四validators、determinism/ABA/resources/golden/npmchecks/三平台CI。没有spec changes，不声明Quantum、C或Issue #10 complete，不开partial普通PR。


## Accepted134 Native Greek — Quantum 实际增量执行

Root正式release：PR #77 / Issue #64 squashmerged07:01:18Z，accepted main `134ba67a9eefe8763314454183a625f83a34837b`。Root唯一watch75708 actualterminalexit0与API核验 Main `37740911355` 三jobs：Ubuntu24 `113191151412`07:05:57Z、Ubuntu20 `113191151772`07:09:22Z、Windows24 `113191151763`07:09:35Z全部success；Secrets `37740911189` 同merged SHA success。Issue64由automation于07:09:48Z completed，见 [验收comment](https://github.com/uwougil/Academic-clipper/issues/64#issuecomment-6054575816)。C没有重复poll这些CI；`git fetch origin main` + nonFF dependency-only merge `d3dd8573560be019164698f726425294a5101239` 接入该accepted代码，原C authored SHAs不重写。

复用外部 `pending64-quantum-791d-preflight.json` 的source/fixture/resource identity、原reviewed9c5 API1.0与准确正向filter，合并后32protected Gitobjects逐项unchanged。没有修改corpus/manifest/expectations/helper/tests/validators/production/spec，没有source85/raw/A重审。新prefix `accepted-greek-quantum-delta` 在启动前确认无文件，仅启动一次唯一batch：三baseline+三repeat=六actualclips。

Actual session `9983` confirmed live后同handle terminalexit1，`40 tests = 39 PASS / 1 FAIL`、`53572.4901ms`、0skip/todo/cancel。**Quantum十个source IDs ×3 =30PASS，三个MD/Bib/semanticSummary/ledger repeat PASS，三个方言全部四production validators PASS**。Math scientificFragments全部counts为0，原17isolatedSUB和旧2splitSUP均不存在；并不是只看validator绿色。唯一FAIL为existing afterhook记录3baseline、缺24article/dialect组合的硬FAIL：records3、missing24、errors[]、unexpected[]、completefalse。该局部证据不伪称full255/27或全C验收，repeat完整result未另保存，只声明实际repeat测试通过。

同次cached postcheck首次exit0：复用已sealed独立source64机器packet `67736 bytes / 628be3bf139544503f38b17614489a42e8ec95dfd43c1007c80a33753b84e0cd`。七完整原段 native17=15body+2Fig5caption；逐段用唯一源句定位，检查所有native与原typedMathJax Greek roles交织序列完全相同。Gamma/Omega与script必须在同一inline表达式，不能用globalcontains代替；对完整旧/新段落仅将native attachment拼写与其生成boundary ASCIIspace正规化，其他TeX/邻文/citation保持逐字相等。含source paragraph6的完整Fig5 caption内两个原Γ关系；typed与native合计依次4/1/2/9/5/2/1，每方言全通过。原源段raw/frozen digests复用，未重新parse原始来源或sanitizer。

| Original Methods paragraph / role | Native roles | Native + typed Greek roles | Raw prehash | Frozen paragraph digest |
| --- | ---: | ---: | --- | --- |
| 4 / body | 2 | 4 | d4b9cd5027373869e427abe3a356010ce137ee71232ba6fe10fa326e619e4636 | 74a9ca9392ba1e49f63b27c7dd139332ab694b2c99d96345da9bbca9654e8a0a |
| 5 / body | 1 | 1 | 7917cafd5d18cb35e336b2dc2f3a83ea9c35d2e81f9e5e8c8ea513825b5ca19a | 3605d4ae2cb313d0f68293ec7698dfc605544315b6d02dabc6a2050bf3b75aff |
| 6 / Fig5 caption | 2 | 2 | 6b5529fa2fc0f7054db8ddff9f5845f04f47dc09a92c9b6c84c6e402cd3af866 | f7f86bf155d5aa1ce3e2adc5f646839344901c4c2aa29ee7ecfa7289a32a0062 |
| 7 / body | 7 | 9 | 41fe93f90327d2058184f53f70b106f365fec54bac3569302d2621b4e6b379a7 | 1399a9b8f93b285f03f15b8d51e9cbc5cae6c3d6205a0888e98881557c151fa4 |
| 9 / body | 2 | 5 | 4df3e18987d23972b091c9e456138caf31e752848220bd87f716839e8bf298ad | 629a487989b7da126377e8b992c13abc2c89cd839b807066ab0144fa0d02fd6c |
| 13 / body | 2 | 2 | a5560c83a39e0275742a9c3d0dd8c0830be4cfc503882f9def1a6c06a13ac969 | 28ea00ca891ecb94f15283d49e5fe2bee14c7a92e22a065cb6f735986288fc8e |
| 15 / body | 1 | 1 | 71d264e4fec89fd459f23ccf020b4a263bfee0b83e3a37ef201f6437a89f3fda | d614ce67b9f636f349b500a929acaf960a7000a57efed1329d546ae35a8f8b2e |

原Results p33 `~10<sup>−</sup><sup>15</sup>` 仍准确为单一 `$10^{−15}$`，原前~、后“even with a small SC”和p37的五singleSUP controls均保持；ref prefix77、semantic citation77有序序列、Table1 summary与73d6真实cache完全相等。完整source-citations/figures/tables/inline等十consumers仍实际PASS；不是为17新角色修改B oracle。

每baseline实际ledger只服务声明GET `https://www.nature.com/articles/s41534-023-00746-0/tables/1`，redirectmanual、mockresolver `www.nature.com` all:true/verbatim:true一次；unexpected[]。每repeat完整ledger equality通过。Warnings expected/actual/missing/unexpected皆[]。既有受审A replay和D seam注入路径finally严格记录并reject未声明操作，没有global network patch/newspy；零ordinary liveDNS/HTTP证明范围同既有受审执行路径，声明回放请求不能称零request。Corpus路径仅clipNature返回结果，不调用writer，未增加writer spy。

85行currentregistry只更新Quantum10行scope到 `Q134_NEW`（30records），另225历史records保持 `Mf4a5_NEW`27 / `Ca5b6_NEW`27 / `AC86_NEW`27 / `F0DE`144。合成255PASS/0sourceFAIL、85uniqueconsumers有执行记录；没有将225旧记录改成current PASS。其它Materials #67 compoundunit/#68 identifier、Alpha #71 qualifier、FRB #72 fractionalunits/#75 wholeparenthesizedpower、Chemistry #73 Δbond/#74 groupindex仍待root各accepted prerequisites，再继续受影响delta或最终combinedhead验证。

实际commands/results：

| Command | Result |
| --- | --- |
| `git fetch origin main`；`git merge --no-ff 134ba67a9eefe8763314454183a625f83a34837b -m 'chore(corpus): adopt accepted native Greek subscript prerequisite'` | exit0，dependency d3dd857；32protectedblobs unchanged |
| `node --test --test-name-pattern $cGreekPlan.pattern test/nature-corpus.test.mjs`；env `ACADEMIC_CLIPPER_CORPUS_RECEIPT_PREFIX=<TEMP>/accepted-greek-quantum-delta` | session9983 terminalexit1、40/39PASS1FAIL、53572.4901ms；唯一六clips |
| `node <TEMP>/accepted-greek-quantum-receipt.mjs`（同run cache only） | 首次exit0；30TAP IDs/status、17native+typed source order/fullneighbors、四validators、refs/cites/table/strictwarnings/exactledgers、85registry assertions |
| `git diff --check` / stageddiffcheck / trackedfilenames / `git status --short` / push | 本轮authored只本handoff，末尾commit由git log与交接消息重建；未重复build/full/golden/其它文章/Dcontroller |

Filter完整复用：`^(?:s41534-023-00746-0)/(?:markdown|links|quarto): (?:every source expectation through the complete production chain|repeat Markdown, bibliography, semantics and replay operations)$`。初始read-onlyprep的两处externalharness假设曾exit1：摘要抄错sealedhash（实际文件及sealed-packets一致以上628…e0cd），以及宽p4sentinel匹配三个不同段落；已保留两原版脚本，并分别改用actualsealedhash、唯一源句“modes act as a Markovian reservoir for mode”。这两个失败都是只读缓存检查，无source/production改变、无新clip；production后的postcheck无需修正或重跑。

外部TEMP为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c`，下列同run证据未提交：

| File | Bytes | SHA256 |
| --- | ---: | --- |
| accepted-greek-quantum-delta.log | 5337 | baeab79c63aedd097b9cbdfdfde0c2c2fa6628134ccb68de4a58578374884d9c |
| accepted-greek-quantum-delta.comparisons.json | 252791 | 93a7481f8dfbd5abf0c675d4a0479ae249b2e03b15b329b125cdf8c54047b782 |
| accepted-greek-quantum-delta-receipt-status.json | 1812 | 1a8e036ac6e52f4bc77634623ad8293e2135c8069d03bc22dfaba6eea638a450 |
| accepted-greek-quantum-delta-process-exit.txt | 1 | 6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b |
| pending64-quantum-791d-preflight.json | 46335 | 7990bec3507251400ce701fa149bd521091ee2f7882362d63d37552bf717b884 |
| accepted-greek-quantum-delta-receipt.json | 113076 | b604628f6d917a1d1ce3a3e653b65255647c177d753caf4b723155711226094d |
| accepted-greek-quantum-receipt.mjs | 9906 | b2ac8ea3c678a945279d25d0913a19a3155390f60acd41a0e3797a2902766b32 |

方言文件前缀 `accepted-greek-quantum-delta.s41534-023-00746-0.`：

| Dialect | Actual validators | Comparison bytes / SHA256 | MD bytes / SHA256 |
| --- | --- | --- | --- |
| markdown | all four PASS / scientific fragments zero | 48675 / c08f6102de95e13e6aeba6bb3879a0afc463da85c18be0977d827faaff074b0c | 91205 / bba068d969a1f52ed2ee27a0921764a5001e46b817f8114fd75a0fa437bc131c |
| links | all four PASS / scientific fragments zero | 115349 / 59f9b4d488c202fcd4e24fed1dd4e75234b27e6d5d2e9f0e838443ff41ce30f4 | 95861 / 211b3ed9e66de986c9bba2d29bcf39c97462d5ac828483baf47987151770717f |
| quarto | all four PASS / scientific fragments zero | 72754 / ee21fdda2cdba31a5cb9136faf44da281a695466e472ff7baa522afca37b44f3 | 83515 / 29c7aad4cba1b4377c3a0086fe08e40e5dc7555a90b4be83cbe74d5a8e362526 |

C仍DEPENDENCY_PENDING；当前Quantum适用的30source/四validators/repeat已在accepted134实际通过。最终combinedacceptedhead仍须canonical全部255/27、ABA/resource scenarios/golden/npmchecks/三平台CI；其它required科学角色不能以历史sourcePASS替代。没有spec changes、不声明Issue#10完成、没有partial delivery PR、没有重做旧来源/framework/审查。Integrator选择C authored docs与原framework commits，不能whole-branch合并覆盖B后补rights。
