# Agent C — 来源核验与离线回归检查点

状态：`DEPENDENCY_PENDING`，2026-10-05。本检查点没有完成 Agent C 验收，也没有完成 Issue #10。所有 85 条期待都已在三个方言执行；当前 171/255 条通过，84/255 条失败。失败保持为真正失败，不使用 skip、预期失败或删改来源输入来计入 passing coverage。后续须在同一个 C 分支接入已接受的独立 parser 修复，再完成复验。

## 基线、依赖与提交选择

- Accepted-main base：`e85b1b809b56242b89b6313ce5d1165c745466bb`；启动时 Main CI `37182993143`、Secret scan `37182993093` 均为 success。PR #27 planning contract `5971ebf` 已是该 main 的祖先。
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

B source originals 由 integrator 选择：`bee3910240c83789dcb6f8ae530c233289fda737`、`61e19e0981d4e82a5a6fb2d8f3c5dd9a0578fc2e`、`f4cafa32274bf0b1ab427c82c950457feb68fa78`、`cd176742ef8733b31c6e6d60814183e0a5eb9eb0`、`143fc77ebdc4bf15dd1cdca63afcddb91e6b55f5`、上述 attribution-only commit。

C authored delivery 顺序：

1. `a896ee7e1fc4700ed5ce6dcbfb46fa594c27cf47` — 初始 shared comparison API；文件 `scripts/lib/nature-corpus-assertions.mjs`。
2. `bc790819d476f7e25f7eaf4acb4d56dc73f295b9` — 严格 source audit、最终输出语义、mutation protection、完整三方言/replay/determinism/isolation 与只读 golden；文件为 helper 和上述两个 tests。
3. `5d305fa72effae2bc34770e339c1e30b3ae07d19` — retained semantic target.type 必须匹配原 DOM 类型；新增错把 Fig1 当 equation 的 mutation protection。只改 helper 与 corpus test。
4. `d8aaaf1c489f76f60fa142b6bd3df7266213052b` — mutation 前显式证明四个相关 consumer 完整 baseline通过，以及table renderedCell和warning特定predicate通过。只改 corpus test；helper API仍为5d305fa版本。
5. 本 handoff receipt commit；其准确 SHA 由 `git log -1 --format=%H -- docs/goals/issue-10/agent-c-handoff.md` 取得，并在交接消息报告。该 commit 只包含本文件。

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

D 应消费 `5d305fa72effae2bc34770e339c1e30b3ae07d19` 的实际 helper，不复制 consumer。Frozen 或 live-retained projection 的 comparison 只适用对应投影；完整 live 页面 validators 单独报告，不能套 excerpt counts。严格 offline failure 阻止该 article 的 live acquisition。新 live markup/validator failure 的归因仍需 D 的证据规则。

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

下表 85 行，结果来自完整 final run，列顺序 `markdown / links / quarto`。`PASS` 为真实通过；`FAIL` 为真实失败。`EXECUTABLE_NOW` 不代表整个 article已满足validators。`BLOCKED_BY_PARSER_DEFECT` 是仍须修复的 scholarly行为；该期待依然执行并报失败。当前 `BLOCKED_BY_D_TRANSPORT_SEAM = 0`、`BLOCKED_BY_SPEC_QUESTION = 0`。没有 spec改写提案。各 source pointer 指向未变 B manifest 的 expectation，其 `blockIds` 和 nested sourceLocation/IDs 给出准确 source位置。

| Article | Expectation ID | Assertion ID | Source pointer (`articles[i].expectations[j]`) | markdown | links | quarto | State | 阻塞证据 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| s41586-026-10401-1 | source-metadata-v1 | nature-source-metadata-v1 | [0][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-026-10401-1 | source-abstract-v1 | nature-source-abstract-v1 | [0][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-026-10401-1 | source-headings-v1 | nature-source-headings-v1 | [0][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-026-10401-1 | source-equations-v1 | nature-source-equations-v1 | [0][3] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-026-10401-1 | source-figures-v1 | nature-source-figures-v1 | [0][4] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-026-10401-1 | source-citations-v1 | nature-source-citations-v1 | [0][5] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-026-10401-1 | source-inline-v1 | nature-source-inline-v1 | [0][6] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-026-10401-1 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [0][7] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-026-10401-1 | source-ui-v1 | nature-source-ui-v1 | [0][8] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-026-10401-1 | source-tables-v1 | nature-source-tables-v1 | [0][9] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | TABLE_FOOTER |
| s41534-023-00746-0 | source-metadata-v1 | nature-source-metadata-v1 | [1][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41534-023-00746-0 | source-abstract-v1 | nature-source-abstract-v1 | [1][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41534-023-00746-0 | source-headings-v1 | nature-source-headings-v1 | [1][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41534-023-00746-0 | source-equations-v1 | nature-source-equations-v1 | [1][3] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41534-023-00746-0 | source-figures-v1 | nature-source-figures-v1 | [1][4] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / SCIENTIFIC_PAYLOAD |
| s41534-023-00746-0 | source-citations-v1 | nature-source-citations-v1 | [1][5] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / DEFUDDLE_FOOTNOTES |
| s41534-023-00746-0 | source-inline-v1 | nature-source-inline-v1 | [1][6] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | SCIENTIFIC_CASES / CAPTION_CONTEXT |
| s41534-023-00746-0 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [1][7] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | DEFUDDLE_INTERNAL_REFS / CONTEXT |
| s41534-023-00746-0 | source-ui-v1 | nature-source-ui-v1 | [1][8] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41534-023-00746-0 | source-tables-v1 | nature-source-tables-v1 | [1][9] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-021-03819-2 | source-metadata-v1 | nature-source-metadata-v1 | [2][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-021-03819-2 | source-abstract-v1 | nature-source-abstract-v1 | [2][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-021-03819-2 | source-headings-v1 | nature-source-headings-v1 | [2][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-021-03819-2 | source-equations-v1 | nature-source-equations-v1 | [2][3] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-021-03819-2 | source-figures-v1 | nature-source-figures-v1 | [2][4] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / SCIENTIFIC_PAYLOAD |
| s41586-021-03819-2 | source-citations-v1 | nature-source-citations-v1 | [2][5] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / DEFUDDLE_FOOTNOTES |
| s41586-021-03819-2 | source-inline-v1 | nature-source-inline-v1 | [2][6] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-021-03819-2 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [2][7] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-021-03819-2 | source-ui-v1 | nature-source-ui-v1 | [2][8] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-020-2012-7 | source-metadata-v1 | nature-source-metadata-v1 | [3][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-020-2012-7 | source-abstract-v1 | nature-source-abstract-v1 | [3][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-020-2012-7 | source-headings-v1 | nature-source-headings-v1 | [3][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-020-2012-7 | source-equations-v1 | nature-source-equations-v1 | [3][3] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-020-2012-7 | source-figures-v1 | nature-source-figures-v1 | [3][4] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-020-2012-7 | source-citations-v1 | nature-source-citations-v1 | [3][5] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-020-2012-7 | source-inline-v1 | nature-source-inline-v1 | [3][6] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-020-2012-7 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [3][7] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | RETAINED_SECTION_TARGET |
| s41586-020-2012-7 | source-ui-v1 | nature-source-ui-v1 | [3][8] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-020-2012-7 | source-tables-v1 | nature-source-tables-v1 | [3][9] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | TABLE_FOOTER |
| s41586-023-05896-x | source-metadata-v1 | nature-source-metadata-v1 | [4][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-abstract-v1 | nature-source-abstract-v1 | [4][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-headings-v1 | nature-source-headings-v1 | [4][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-equations-v1 | nature-source-equations-v1 | [4][3] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-figures-v1 | nature-source-figures-v1 | [4][4] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | SOURCE_SHORT_ALT |
| s41586-023-05896-x | source-citations-v1 | nature-source-citations-v1 | [4][5] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-inline-v1 | nature-source-inline-v1 | [4][6] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-crossrefs-v1 | nature-source-crossrefs-v1 | [4][7] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-ui-v1 | nature-source-ui-v1 | [4][8] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-06735-9 | source-metadata-v1 | nature-source-metadata-v1 | [5][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-06735-9 | source-abstract-v1 | nature-source-abstract-v1 | [5][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-06735-9 | source-headings-v1 | nature-source-headings-v1 | [5][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-06735-9 | source-equations-v1 | nature-source-equations-v1 | [5][3] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | ADJACENT_INLINE_DOLLARS |
| s41586-023-06735-9 | source-figures-v1 | nature-source-figures-v1 | [5][4] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / SCIENTIFIC_PAYLOAD |
| s41586-023-06735-9 | source-citations-v1 | nature-source-citations-v1 | [5][5] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / DEFUDDLE_FOOTNOTES |
| s41586-023-06735-9 | source-inline-v1 | nature-source-inline-v1 | [5][6] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | SCIENTIFIC_CASES / CAPTION_CONTEXT |
| s41586-023-06735-9 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [5][7] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-06735-9 | source-ui-v1 | nature-source-ui-v1 | [5][8] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41467-023-44030-3 | source-metadata-v1 | nature-source-metadata-v1 | [6][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41467-023-44030-3 | source-abstract-v1 | nature-source-abstract-v1 | [6][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41467-023-44030-3 | source-headings-v1 | nature-source-headings-v1 | [6][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41467-023-44030-3 | source-equations-v1 | nature-source-equations-v1 | [6][3] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | LEADING_ISOTOPE |
| s41467-023-44030-3 | source-figures-v1 | nature-source-figures-v1 | [6][4] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / SCIENTIFIC_PAYLOAD |
| s41467-023-44030-3 | source-citations-v1 | nature-source-citations-v1 | [6][5] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / DEFUDDLE_FOOTNOTES |
| s41467-023-44030-3 | source-inline-v1 | nature-source-inline-v1 | [6][6] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | SCIENTIFIC_CASES / CAPTION_CONTEXT |
| s41467-023-44030-3 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [6][7] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | DEFUDDLE_INTERNAL_REFS / CONTEXT |
| s41467-023-44030-3 | source-ui-v1 | nature-source-ui-v1 | [6][8] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-022-04755-5 | source-metadata-v1 | nature-source-metadata-v1 | [7][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-022-04755-5 | source-abstract-v1 | nature-source-abstract-v1 | [7][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-022-04755-5 | source-headings-v1 | nature-source-headings-v1 | [7][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-022-04755-5 | source-equations-v1 | nature-source-equations-v1 | [7][3] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | LITERAL_BRACKETS |
| s41586-022-04755-5 | source-figures-v1 | nature-source-figures-v1 | [7][4] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / SCIENTIFIC_PAYLOAD |
| s41586-022-04755-5 | source-citations-v1 | nature-source-citations-v1 | [7][5] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / DEFUDDLE_FOOTNOTES |
| s41586-022-04755-5 | source-inline-v1 | nature-source-inline-v1 | [7][6] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | SCIENTIFIC_CASES / CAPTION_CONTEXT |
| s41586-022-04755-5 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [7][7] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | DEFUDDLE_INTERNAL_REFS / CONTEXT |
| s41586-022-04755-5 | source-ui-v1 | nature-source-ui-v1 | [7][8] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-022-04755-5 | source-tables-v1 | nature-source-tables-v1 | [7][9] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | TABLE_FOOTER |
| s41598-018-38309-5 | source-metadata-v1 | nature-source-metadata-v1 | [8][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41598-018-38309-5 | source-abstract-v1 | nature-source-abstract-v1 | [8][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41598-018-38309-5 | source-headings-v1 | nature-source-headings-v1 | [8][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41598-018-38309-5 | source-equations-v1 | nature-source-equations-v1 | [8][3] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41598-018-38309-5 | source-figures-v1 | nature-source-figures-v1 | [8][4] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / SCIENTIFIC_PAYLOAD |
| s41598-018-38309-5 | source-citations-v1 | nature-source-citations-v1 | [8][5] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / DEFUDDLE_FOOTNOTES |
| s41598-018-38309-5 | source-inline-v1 | nature-source-inline-v1 | [8][6] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | SCIENTIFIC_CASES / CAPTION_CONTEXT |
| s41598-018-38309-5 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [8][7] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41598-018-38309-5 | source-ui-v1 | nature-source-ui-v1 | [8][8] | PASS | PASS | PASS | EXECUTABLE_NOW | — |

全部 27 clips 和每次重复 clip 均使用真实 adapter → Defuddle → normalizers → renderer，明确注入 A fresh replay。13 resource recipes在 preflight验证；每次 GET/manual 与 hostname/all/verbatim ledger均逐个核对，零 unexpected操作。没有 global fetch/DNS patch，没有 live DNS/HTTP。

所有 27 个重复输入 tests 通过：Markdown、referencesBib、semantic summary、ledger一致。三个方言 A → B → A（golden → pangenome → golden）首尾结果一致。每个方言另有四个明确 mocked table场景：HTTP503、无HTMLcells、同article302redirect、逃离article scope302rejection；12个子场景全部通过。Unknown request即使被hydrator catch也由ledger失败，绝不计为fallback通过。

完整 committed golden只读检查通过：6 authors、3 main/4 Extended Data figures、13 display equations、50 ordered references、Table1、7 local image files、四 validators/scientificFragments、read前后bytes未改。Source mutations明确证明：删除 retained Fig1 target、更改Fig1 target.type、改变 M_s attachment、交换citationclusters、移除原citation邻近词、丢失caption、更改source short alt、丢失最终rendered table cell、增加undeclared warning均被断言拒绝。Mutation前显式断言golden/quarto的crossrefs/inline/citations/figures四个consumer完整通过；table aggregate虽被真实footer defect阻塞，renderedCell predicate基线无失败，再丢cell后出现该predicate failure。Warning基线亦无missing/unexpected。没有制造scientific baseline或依赖已有失败充当mutation成功。

## Parser defect packets

下列所说 hash 均为实际 A `serializeSubtree` 对 untouched source DOM 的 SHA-256；paragraph index从该 block的`querySelectorAll('p')`按零起算。完整源数据仍位于外部临时目录；reproducer使用冻结的真实摘录与声明table resources。不得修改input让现有parser通过。

### Table footer

Golden Table1有1条、COVID Table1有2条、astro Table1有6条真实 sourceNotes；final table Markdown丢失这些notes，而cells仍可正确。涉及三个 `source-tables-v1` ×3dialects。B manifest提供每条note完整text/html/locator，table resource源hash见上表。前置bug Work Contract由orchestrator处理；旧PR #46 head仍需独立review，C不把其未accepted的结果计为pass。Notes要保留source顺序、exactly once且和其table关联，不得误把单位、Greek、scientific sup等当footer脚注。

### Caption / citation / internal-reference normalization

Quantum、AlphaFold、materials、astro、Scientific Reports有raw citation anchor进入caption、Defuddle副本/footnote重复或citation cluster变化。Default/quarto零HTML与完整caption/citationordered oracle为正确期待。Affected `source-figures-v1`、`source-citations-v1`、部分`source-crossrefs-v1`，不能用validator单独证明完整性。

Quantum追加的真实body failure：`a-section-3`，`section[data-title="Discussion"]` paragraphs6/7，原same-article`#Tab1`，anchor text分别`1`和`1)`；`source-crossrefs-v1.internal[42]`和`[45]`。Paragraph hashes分别`f9fd42a89ad5b85ff6cf46d76aa480d04c17de3e69bd5557f95948e86edbded5`、`12e32b2d045fdc9e328de37c6c3f96dbac6841a670f624d1db0e8ec23e1996af`。Markdown实际变成`(see Table [^4]).`与`(see Table [^4].`，并附加Defuddle prose footnote；source Table1 identity/闭括号不可变成引用4。Links/quarto也有Fig1/Fig6 caption links未使用实际dialect target。

COVID caption section links：`source-crossrefs-v1.internal[4]`/`[17]`，block`a-section-1`。原href均`/articles/s41586-020-2012-7#Sec2`、text`Methods`、targetRetained=true。Description locators `#figure-1-desc`/`#figure-2-desc`，hashes `2dba82cf467bd578f22a459253da97e5aebe689821357ad2417d40ffdd349da8` / `386cd5155f890021eff83cb8ee7fb9cf585bedaabd96943e784ea7a97c4e5562`。真实 Methods heading/semantic target存在，Quarto含`## Methods {#sec-methods}`，caption却保留绝对self-article URL。正确期待为default/links`#methods`、quarto`#sec-methods`及原Methods可读文本；canonical retained section policy不需要修订。

### Pangenome short-alt identity

`s41586-023-05896-x/source-figures-v1`：admitted main figure原IDs为`Fig1, Fig3, Fig4, Fig5`，原标签明确Figure1/3/4/5；actual semantic label正确，actual alt却变成顺序Figure1/2/3/4。后三个`shortAlt`在全部三方言失败。源wrapper locators / prehash：

| Source ID / block | Selector | Source subtree SHA-256 |
| --- | --- | --- |
| Fig1 / a-section-2 | #figure-1 | a67baa58454b5076eb464f4c74d03fc02ba56af081e7ca81512805d02334e8f1 |
| Fig3 / a-section-3 | #figure-3 | 0f62fea715fb860ff8ff262245ac20798dbb989ce926ea605434c87fee9fec11 |
| Fig4 / a-section-3 | #figure-4 | ef1abb9b5ba8717a76a24d4bc31b39cbc884bdba0280508cb3aebef94f86b0d4 |
| Fig5 / a-section-3 | #figure-5 | 7ec9deb70e1b659a58c27b09ae5a9173c62cdeecdbdb00c85ea34bc8480e04b3 |

### Scientific boundaries；必须区分机制

- Astro `s41586-022-04755-5`，block`a-section-1` (`section[data-title="Main"]`) paragraph5，hash`6c4a2d899f9bfa7a2cd7c4263e7f0e67dbc70a9623fe3560254b8502fadeb3d6`。真实literal`[O <span class="u-small-caps">III</span>]`被解释为display delimiter；源8条display变17条。涉及`source-equations-v1`和相关figure/inline/citation输出。Caption paragraph4 hash`c2386c70b88e69c4707e0bdb41967c818fcda54e0bd6b958c6f1c0da6db2d59d`。
- Chemistry `s41467-023-44030-3`，block`a-section-2` (`section[data-title="Results"]`) paragraph0，hash`1d03f1991268ca7b64f42caa0f4a5e348594a8d2c129ce9cd756ff5ca7b1359f`。原isotope`[<sup>3</sup>H]-<i>t</i>-butyl…`产生`$$^{3}$ H$…`，源0条display变1条。Caption paragraph15 hash`21ed9ff8a20bc5a6cc7724c2027e9ca7ab3578ee98ecf38e0f3fb39b52336b73`。不能把此leadingisotope简单当普通trailingunit来修。
- Materials `s41586-023-06735-9`，block`a-section-6` (`section[data-title="Methods"]`) paragraph37，hash`606a4dbc6f17d727f95d873d015c680a39155c48d9d5e7f2fe8dc9f04264b364`。真实markup是`128<i>x</i>0<i>e</i> + 64<i>x</i>1<i>x</i> + 32<i>x</i>2<i>e</i>`，绝非sup/sub shorthand；输出包含相邻`$128x$$0e$`，源1条display变2条。
- Scientific Reports `s41598-018-38309-5` 的m³/m³、kg m⁻² s⁻¹等单位留下7个isolatedsuperscript fragments；AlphaFold/COVID/materials/chemistry/astro也有production math/scientificFragments失败。Selected source-inline值本身通过不等于整篇validator通过，例如COVID。

这些packets建议独立、source-backed bug Work Contracts。C只提供正确oracle和真实失败；没有推定上述三种数学边界失败必然同根因。

## 确切命令与结果

在上列Cworktree执行，外部logs目录为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-c`。

| Command | Result |
| --- | --- |
| `git fetch origin`；`gh run list --branch main --commit e85b1b809b56242b89b6313ce5d1165c745466bb --json databaseId,name,status,conclusion,headSha --limit 10` | 启动accepted-state核验成功；上述两个CI runs success |
| `npm ci` | exit0；65packages，0vulnerabilities |
| `node source-audit.mjs <C-worktree> <B-raw-directory> <external-report>` | exit0；13raw/hash/subtree/recipe resources，85source assertions，0failed；report `source-audit-final.json` |
| `node rights-audit.mjs <C-worktree> <B-raw-directory> <external-report>` | exit0；直接核验b718fa8 Gitobjects，9articles/9notices/4tables，0failed；report `rights-audit-final.json` |
| `node --test test/nature-corpus.test.mjs test/golden-paper.test.mjs` | **exit1**；bc79081完整run为365tests：233pass，132fail，0skip/todo/cancel；sourceexpectation子集255：171pass/84fail，85unique；log `checkpoint-tests-final-v7.log`。132包括失败parent tests/validators，不是132个distinct source expectations |
| `node --test --test-name-pattern="every source expectation through" test/nature-corpus.test.mjs` | **exit1**；最终5d305fa helper重新执行全部255条，结果与之前逐条相同：171pass/84fail。含parent/validator共309tests：177pass/132fail，0skip/todo/cancel，85.073s；log `checkpoint-expectations-type-final.log`、records `checkpoint-execution-type-final.json` |
| `node --test --test-name-pattern="strict consumers\|immutable excerpts\|source assertions reject\|committed complete" test/nature-corpus.test.mjs test/golden-paper.test.mjs` | 最终typedhelper exit0；13pass，0fail/skip；log `framework-tests-type-final.log` |
| `node --test --test-name-pattern="source assertions reject" test/nature-corpus.test.mjs` | d8aaaf1 baseline guards exit0；1pass，0fail/skip；log `mutation-baselines-final.log`；随后未改test/helper |
| `node --test test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-corpus-infrastructure.test.mjs test/network-boundaries.test.mjs` | exit0；68pass，0fail/skip；log `existing-regression.log` |
| `git diff --check`；`git diff --cached --check` | exit0 |
| `git diff bff2f2a90731914194f8dd081f9267a1bb8d8e11 -- test/corpus papers docs/specs docs/PRD.md docs/EDD.md` | empty；C没有改B输入/golden/意图 |
| `git diff --cached --name-only` | core commit严格3个ownedfiles；handoff receipt严格本文件 |

External one-shot audit scripts只从原rawbytes/DOM和Gitobjects读数据、不调用clip/writer/network。source audit步骤如上所述；shared `auditSourceOracle` 已提交，可按命令在任意有B原rawdirectory的环境复核。Ordinary tests不依赖这些外部raw文件、不产生临时capture、不会重采live。Full test-run legacy intermediate logs、comparison JSON及Markdown只在外部temp，不提交snapshot。`checkpoint-execution.json`含255个实际case records；本文件85行将它们完整持久化。

没有声称`npm test`、`npm run build`或最终CI已通过本检查点；最终integrator须在parser prerequisites accepted后运行spec§9全部checks和CI matrix。

## 恢复 C / D / integrator 的解除阻塞条件

1. Integrator采用原A/B/D依赖及C authored commits；B b718fa8 attribution作为独立metadata增量接入。不得cherry-pick C read-only B snapshot再重复集成B原提交。
2. 独立tablefooter、caption/citation/crossref、scientificunits、literalbrackets/isotope/adjacent-inline边界、pangenomealt修复通过各自contract、独立review、required CI/MainCI后，恢复**同一个Agent C**。不把bugbranches当前结果当accepted main。
3. C在没有修改sourceoracle的情况下重新执行全部85×3、27 validators/strictwarnings、repeat/isolation、replay scenarios、read-onlygolden。正确TeX presentation等价可完善test-onlycomparison，但必须独立证明不是放宽scientificattachment/identity/oracle。
4. 全部适用expectations/validators/warnings真正通过才把必需覆盖记为complete；D只在严格offline gate通过后运行其相应live流程。
5. Integrator记录最终all-corpus真实bytes/sizeexception review、最终exactcommands与三个CIjobs。Canonical spec没有修改，没有提出新产品语义，没有ordinary Issue10 deliveryPR。
