# Agent C — 来源核验与离线回归检查点

状态：`DEPENDENCY_PENDING`，2026-10-05。本检查点没有完成 Agent C 验收，也没有完成 Issue #10。所有 85 条期待都已在三个方言执行；当前 170/255 条通过，85/255 条失败，按三个方言全部通过分类为 56 条 `EXECUTABLE_NOW`、29 条 `BLOCKED_BY_PARSER_DEFECT`。失败保持为真正失败，不使用 skip、预期失败或删改来源输入来计入 passing coverage。已接入 accepted table-footer 修复并修正两个 C consumer P2；后续须在同一个 C 分支接入其余已接受的独立 parser 修复，再完成复验。

## 基线、依赖与提交选择

- 原始 accepted-main base：`e85b1b809b56242b89b6313ce5d1165c745466bb`；启动时 Main CI `37182993143`、Secret scan `37182993093` 均为 success。PR #27 planning contract `5971ebf` 已是该 main 的祖先。
- 本轮 accepted main：`e0a341fc97ff845a250c2f016dcb2363e10ed49e`（PR #46 / Issue #45 table footer）。C 独立检查 Main CI `37269007138` 的同一 head：Ubuntu Node24 job `111631813071`、Windows Node24 `111631813246`、Ubuntu Node20 `111631813297` 均 success；Secret scan `37269007093` 和 finalizer `37269456893` 亦 success。仅用 dependency merge `0729b3cf48ec6ad1ba8a8148f3c29af41a959139` 接入，保留此前 published originals；没有消费未 accepted 的 bug branch。
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

B source originals 由 integrator 选择：`bee3910240c83789dcb6f8ae530c233289fda737`、`61e19e0981d4e82a5a6fb2d8f3c5dd9a0578fc2e`、`f4cafa32274bf0b1ab427c82c950457feb68fa78`、`cd176742ef8733b31c6e6d60814183e0a5eb9eb0`、`143fc77ebdc4bf15dd1cdca63afcddb91e6b55f5`、上述 attribution-only commit。

C authored delivery 顺序：

1. `a896ee7e1fc4700ed5ce6dcbfb46fa594c27cf47` — 初始 shared comparison API；文件 `scripts/lib/nature-corpus-assertions.mjs`。
2. `bc790819d476f7e25f7eaf4acb4d56dc73f295b9` — 严格 source audit、最终输出语义、mutation protection、完整三方言/replay/determinism/isolation 与只读 golden；文件为 helper 和上述两个 tests。
3. `5d305fa72effae2bc34770e339c1e30b3ae07d19` — retained semantic target.type 必须匹配原 DOM 类型；新增错把 Fig1 当 equation 的 mutation protection。只改 helper 与 corpus test。
4. `d8aaaf1c489f76f60fa142b6bd3df7266213052b` — mutation 前显式证明四个相关 consumer 完整 baseline通过，以及table renderedCell和warning特定predicate通过。只改 corpus test；helper API仍为5d305fa版本。
5. `ff3e714c707ccc619d00a7c42dd2d155cd1be631` — 前一轮 source audit / dependency-pending handoff；只含本文件。
6. `6c38ad8156c6f5e3a1b7b97729640158b7772c7b` — 修正 final rendered caption 完整 payload / bold-panel sequence 与每个真实 crossref occurrence 的 target 检查；真实三方言 passing baseline + mutation regressions。只改 helper、corpus test。
7. 本次 handoff receipt commit；其准确 SHA 由 `git log -1 --format=%H -- docs/goals/issue-10/agent-c-handoff.md` 取得，并在交接消息报告。该 commit 只包含本文件。

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

D 应消费 `6c38ad8156c6f5e3a1b7b97729640158b7772c7b` 的实际 helper，不复制 consumer。原始 Git blob `7024870f4da896eb4ff2130cfd45991f00139067`，48,425 bytes，SHA-256 `f6de33be4cce85fbf738f784448f5a0f59ea3d0f886399ca48e09cdd20963de3`（按 Git object Buffer 核验，非 Windows checkout CRLF bytes）。Exports/schema/version 保持上述真实接口。Frozen 或 live-retained projection 的 comparison 只适用对应投影；完整 live 页面 validators 单独报告，不能套 excerpt counts。严格 offline failure 阻止该 article 的 live acquisition。当前只有 golden 三方言的全部 expectations + validators/warnings 都通过；pangenome validators 通过但两项来源期待失败，其余七篇 validators 亦失败。新 live markup/validator failure 的归因仍需 D 的证据规则。

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

下表 85 行，结果来自 accepted e0a341f + 本轮实际 helper 的完整 run，列顺序 `markdown / links / quarto`。`PASS` 为真实通过；`FAIL` 为真实失败。`EXECUTABLE_NOW` 不代表整个 article已满足validators。`BLOCKED_BY_PARSER_DEFECT` 是仍须修复的 scholarly行为；该期待依然执行并报失败。当前 `BLOCKED_BY_D_TRANSPORT_SEAM = 0`、`BLOCKED_BY_SPEC_QUESTION = 0`。没有 spec改写提案。各 source pointer 指向未变 B manifest 的 expectation，其 `blockIds` 和 nested sourceLocation/IDs 给出准确 source位置。

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
| s41586-026-10401-1 | source-tables-v1 | nature-source-tables-v1 | [0][9] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
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
| s41586-020-2012-7 | source-tables-v1 | nature-source-tables-v1 | [3][9] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-metadata-v1 | nature-source-metadata-v1 | [4][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-abstract-v1 | nature-source-abstract-v1 | [4][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-headings-v1 | nature-source-headings-v1 | [4][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-equations-v1 | nature-source-equations-v1 | [4][3] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-figures-v1 | nature-source-figures-v1 | [4][4] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | SOURCE_SHORT_ALT |
| s41586-023-05896-x | source-citations-v1 | nature-source-citations-v1 | [4][5] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-inline-v1 | nature-source-inline-v1 | [4][6] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-05896-x | source-crossrefs-v1 | nature-source-crossrefs-v1 | [4][7] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION_RETAINED_SECTION_TARGET |
| s41586-023-05896-x | source-ui-v1 | nature-source-ui-v1 | [4][8] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-06735-9 | source-metadata-v1 | nature-source-metadata-v1 | [5][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-06735-9 | source-abstract-v1 | nature-source-abstract-v1 | [5][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-06735-9 | source-headings-v1 | nature-source-headings-v1 | [5][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41586-023-06735-9 | source-equations-v1 | nature-source-equations-v1 | [5][3] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | ADJACENT_INLINE_DOLLARS |
| s41586-023-06735-9 | source-figures-v1 | nature-source-figures-v1 | [5][4] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / SCIENTIFIC_PAYLOAD |
| s41586-023-06735-9 | source-citations-v1 | nature-source-citations-v1 | [5][5] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / DEFUDDLE_FOOTNOTES |
| s41586-023-06735-9 | source-inline-v1 | nature-source-inline-v1 | [5][6] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | SCIENTIFIC_CASES / CAPTION_CONTEXT |
| s41586-023-06735-9 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [5][7] | PASS | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | DEFUDDLE_INTERNAL_REFS / OCCURRENCE |
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
| s41586-022-04755-5 | source-tables-v1 | nature-source-tables-v1 | [7][9] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | TABLE_MATHJAX_ATTACHMENT |
| s41598-018-38309-5 | source-metadata-v1 | nature-source-metadata-v1 | [8][0] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41598-018-38309-5 | source-abstract-v1 | nature-source-abstract-v1 | [8][1] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41598-018-38309-5 | source-headings-v1 | nature-source-headings-v1 | [8][2] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41598-018-38309-5 | source-equations-v1 | nature-source-equations-v1 | [8][3] | PASS | PASS | PASS | EXECUTABLE_NOW | — |
| s41598-018-38309-5 | source-figures-v1 | nature-source-figures-v1 | [8][4] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / SCIENTIFIC_PAYLOAD |
| s41598-018-38309-5 | source-citations-v1 | nature-source-citations-v1 | [8][5] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | CAPTION / DEFUDDLE_FOOTNOTES |
| s41598-018-38309-5 | source-inline-v1 | nature-source-inline-v1 | [8][6] | FAIL | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | SCIENTIFIC_CASES / CAPTION_CONTEXT |
| s41598-018-38309-5 | source-crossrefs-v1 | nature-source-crossrefs-v1 | [8][7] | PASS | FAIL | FAIL | BLOCKED_BY_PARSER_DEFECT | DEFUDDLE_INTERNAL_REFS / OCCURRENCE |
| s41598-018-38309-5 | source-ui-v1 | nature-source-ui-v1 | [8][8] | PASS | PASS | PASS | EXECUTABLE_NOW | — |

全部 27 clips 和每次重复 clip 均使用真实 adapter → Defuddle → normalizers → renderer，明确注入 A fresh replay。13 resource recipes在 preflight验证；每次 GET/manual 与 hostname/all/verbatim ledger均逐个核对，零 unexpected操作。没有 global fetch/DNS patch，没有 live DNS/HTTP。

所有 27 个重复输入 tests 通过：Markdown、referencesBib、semantic summary、ledger一致。三个方言 A → B → A（golden → pangenome → golden）首尾结果一致。每个方言另有四个明确 mocked table场景：HTTP503、无HTMLcells、同article302redirect、逃离article scope302rejection；12个子场景全部通过。Unknown request即使被hydrator catch也由ledger失败，绝不计为fallback通过。

完整 committed golden只读检查通过：6 authors、3 main/4 Extended Data figures、13 display equations、50 ordered references、Table1、7 local image files、四 validators/scientificFragments、read前后bytes未改。Source mutations明确证明：删除 retained Fig1 target、更改Fig1 target.type、改变 M_s attachment、交换citationclusters、移除原citation邻近词、丢失caption、更改source short alt、丢失最终rendered table cell、增加undeclared warning均被断言拒绝。Mutation前显式断言golden/quarto的crossrefs/inline/citations/figures/tables五个consumer完整通过；accepted footer 修复后 table aggregate 也真正通过。Warning基线亦无missing/unexpected。没有制造scientific baseline或依赖已有失败充当mutation成功。

独立 reviewer 的两个 P2 已先在未改 helper 上固化为真实失败 regression：golden/quarto 原完整 figure/crossref consumer baseline PASS，只删最终 Fig1 caption 内部唯一 `dimensionality` 或只把第一个 `[1a](#fig-figure-1)` 改成 `[1a](#fig-figure-2)`，model 与其他正确 links 保持原对象，四 validators 仍 PASS，而旧 consumer 错误接受。新 helper 在各自 image 后的 paragraph frame 比对完整 source caption，另比对最终 bold panel 顺序；crossrefs 将源 occurrence 的邻近正文、text 与该 occurrence 的 target 同时绑定，不能借别处正确链接通过。新增 caption deletion 在三方言、wrong-target 在 links/quarto、default figure错误 relink 到 `#methods`、最终 panel bold 删除均从真实 passing baseline 转为 failure。没有扩展 readable stripping 来容忍不同内容。

## Parser defect packets

下列 prehash 均为实际 A `serializeSubtree` 对 untouched source DOM 的 SHA-256；新 occurrence packet 另明确列出 sanitizer 后的 frozen paragraph digest，不能混用两者。Paragraph index从该 block的`querySelectorAll('p')`按零起算，table row/cell也从零起算。完整源数据仍位于外部临时目录；reproducer使用冻结的真实摘录与声明table resources。不得修改input让现有parser通过。

### Table footer — accepted main 已解除

前检查点中 Golden Table1的1条、COVID Table1的2条、astro Table1的6条真实 sourceNotes 丢失。PR #46 / Issue #45 已随 accepted e0a341f 接入：九条 notes 在三方言的准确文本、顺序、exactly once、table association 均通过；golden/COVID 两项完整 `source-tables-v1` ×3dialects 从 FAIL 变成 PASS。FRB 完整 consumer 仍因下列三处数学 attachment 失败，不能把 footer 成功当整个 table 成功。单位、Greek、scientific sup 仍受来源与 scientific validator 保护。

### FRB table MathJax subscript attachment — 独立待修复

`s41586-022-04755-5/source-tables-v1`，resource `table-1`，untouched raw SHA-256 `97eaaa31a6f3443e63ad7cf2cef66776d72d61c6b0f0d2956d87cd43b39485a2`，retained selector `#content`。对原 raw `table.rows[row].cells[column]` 的 prehash 独立核验如下：

| Physical row / cell | Raw TD subtree SHA-256 | Source MathJax TeX | Actual final cell math（markdown / links / quarto 相同） |
| --- | --- | --- | --- |
| [9][0] | d3c724281061d956a645d0254f64feaa280764a0c32a35d2fea4a84c432c2216 | `\({{\rm{DM}}}_{{\rm{MW}},{\rm{disk}}},{{\rm{DM}}}_{{\rm{MW}},{\rm{halo}}}\)` | `${\mathrm{DM}}\_{\mathrm{MW},\mathrm{disk}},{\mathrm{DM}}\_{\mathrm{MW},\mathrm{halo}}$` |
| [10][0] | 8016f6120773882fd35c9e929862a40929e2e0215f628d3f70c8d3759cb80403 | `\({{\rm{DM}}}_{{\rm{host}}}\)` | `${\mathrm{DM}}\_{\mathrm{host}}$` |
| [10][1] | 2ed0971e787d02ac7c490e6d6ae15e03298b925ddb0296f708330ed789bdcbc4 | `\({903}_{-111}^{+72}\)` | `${903}\_{-111}^{+72}$` |

Source `_` 是原本附着于 DM/903 的 subscript operator；实际 `\_` 是普通 underscore，因此不是 presentation 等价。Base、sign、subscript/exponent identity 必须保留；C 没有 globally unescape 或改变 comparison/oracle。该三处 `renderedCell` 在全部三方言保持真正失败。另有 FRB 全输出 scientificFragments 12 个单位/数字幂问题，属于独立单位缺陷，不能混入此表格 MathJax Work Contract。外部 `frb-table-cell-source.json` / `frb-table-presentation.json` 保留准确原 cell HTML、全部 sourceRows 和 actual Markdown/notes；本 packet 足以由 frozen resource复现。

### Caption / citation / internal-reference normalization

Quantum、AlphaFold、materials、astro、Scientific Reports有raw citation anchor进入caption、Defuddle副本/footnote重复或citation cluster变化。Default/quarto零HTML与完整caption/citationordered oracle为正确期待。Affected `source-figures-v1`、`source-citations-v1`、部分`source-crossrefs-v1`，不能用validator单独证明完整性。

Quantum追加的真实body failure：`a-section-3`，`section[data-title="Discussion"]` paragraphs6/7，原same-article`#Tab1`，anchor text分别`1`和`1)`；`source-crossrefs-v1.internal[42]`和`[45]`。Paragraph hashes分别`f9fd42a89ad5b85ff6cf46d76aa480d04c17de3e69bd5557f95948e86edbded5`、`12e32b2d045fdc9e328de37c6c3f96dbac6841a670f624d1db0e8ec23e1996af`。Markdown实际变成`(see Table [^4]).`与`(see Table [^4].`，并附加Defuddle prose footnote；source Table1 identity/闭括号不可变成引用4。Links/quarto也有Fig1/Fig6 caption links未使用实际dialect target。

COVID caption section links：`source-crossrefs-v1.internal[4]`/`[17]`，block`a-section-1`。原href均`/articles/s41586-020-2012-7#Sec2`、text`Methods`、targetRetained=true。Description locators `#figure-1-desc`/`#figure-2-desc`，hashes `2dba82cf467bd578f22a459253da97e5aebe689821357ad2417d40ffdd349da8` / `386cd5155f890021eff83cb8ee7fb9cf585bedaabd96943e784ea7a97c4e5562`。真实 Methods heading/semantic target存在，Quarto含`## Methods {#sec-methods}`，caption却保留绝对self-article URL。正确期待为default/links`#methods`、quarto`#sec-methods`及原Methods可读文本；canonical retained section policy不需要修订。

本轮 occurrence 修正新增检出的来源事实如下。各 href/text/original paragraph 在 untouched raw 与 frozen 两边独立查验一致；digest 差异来自 sanitizer 去掉 `data-track*` 等 tracking attrs，不能用 frozen digest冒充 prehash。完整 article raw/fixture digests 见上表。其余正确 links 不能掩盖这些 occurrence。

| Article / source-crossrefs-v1.internal index | Raw source位置 | Untouched raw paragraph prehash | Frozen paragraph digest | Actual / required |
| --- | --- | --- | --- | --- |
| pangenome [42] | a-section-3 `section[data-title="Constructing a draft pangenome"]` p8；`#figure-4-desc` | 624b319c81ef1e2e6746de008d449b27dbd2c00fcda4f7a1456054df7237463c | 220204e973160f6db2ec943e6d331f545be8d24f493abf733931748318fd82b6 | 原 `/articles/s41586-023-05896-x#Sec18` / Methods，retained=true；actual绝对self URL，required default/links `#methods`、quarto `#sec-methods`；三方言 FAIL |
| materials [7,8] | a-section-4 `section[data-title="Discovered stable crystals"]` p1 | 315a861d7209ff9b9aa5f8821052ee84db09ced247bf0cd84bd363c87300e518 | 884d8b41fd08d30261e2d725010a64383221bd9eff75a131af15de30647dcf81 | 原 Fig1/2 text1/2；actual `Figs. [^1] and [^2]`，links/quarto 应为各自真实 figure target |
| materials [16] | a-section-5 `section[data-title="Scaling up learned interatomic potentials"]` p1 | 3371178da2f8a14ece18de2596f65e2306208df8e9d1c195a2c803a61d7f2913 | c2eac8cea9de8fac0a21127513b05a728471568058c42d4372f63cc7ce3823ac | 原 Fig3 / text3；actual `see Fig. [^3]`，links/quarto 应为该 occurrence 的真实 figure target |
| Scientific Reports [17,18,19,20] | a-section-2 `section[data-title="Results"]` p10 | c6e953188b6320ca3109839fac6f8d7dd15ea0fa0f21fd852f0e1e3eda1d175f | 497bb1056dae25380809a137e6f0dee41f87f2a802759240bcce1e37326d1290 | 原 Fig2 / Fig1 / Fig2 / Fig3；actual `Figs [^2]` 与 `Figs [^1], [^2] and [^3]`，links/quarto 应按各 source occurrence 使用正确 target |

这些真实 figure identity 不是文献 citation number。Materials/SR default 可读降级分支的 crossref consumer 仍 PASS，但同文的 citation/caption/source-inline/validator failures 均没有隐藏；完整文章仍 BLOCKED。外部 `accepted-table-new-crossref-packets.json` 同时保留各原始 anchor HTML、source context、raw/frozen digests、current Quarto matching links 与具体 failure paths；同一 current full run 给出各 dialect 的实际状态。

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
| `node --test test/nature-corpus.test.mjs test/golden-paper.test.mjs`（前检查点） | **exit1**；bc79081完整run为365tests：233pass，132fail，0skip/todo/cancel；sourceexpectation子集255：171pass/84fail，85unique；log `checkpoint-tests-final-v7.log`。132包括失败parent tests/validators，不是132个distinct source expectations |
| `node --test --test-name-pattern="every source expectation through" test/nature-corpus.test.mjs`（前检查点） | **exit1**；5d305fa helper执行全部255条，结果171pass/84fail；含parent/validator309tests：177pass/132fail，0skip/todo/cancel；log `checkpoint-expectations-type-final.log` |
| `node --test --test-name-pattern="strict consumers\|immutable excerpts\|source assertions reject\|committed complete" test/nature-corpus.test.mjs test/golden-paper.test.mjs`（前检查点） | typedhelper exit0；13pass，0fail/skip；log `framework-tests-type-final.log` |
| `node --test --test-name-pattern="source assertions reject" test/nature-corpus.test.mjs`（前检查点） | d8aaaf1 baseline guards exit0；1pass，0fail/skip；log `mutation-baselines-final.log` |
| `node --test test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-corpus-infrastructure.test.mjs test/network-boundaries.test.mjs`（前检查点） | exit0；68pass，0fail/skip；log `existing-regression.log` |
| `git fetch origin`；`gh run view 37269007138 --json headSha,status,conclusion,jobs`；`gh run view 37269007093 --json headSha,status,conclusion`；`gh run view 37269456893 --json headSha,status,conclusion` | accepted e0a341f与上述3个matrix jobs/Secrets/finalizer独立核验success；没有消费随后 pending main |
| `git merge --no-ff e0a341fc97ff845a250c2f016dcb2363e10ed49e -m "chore(corpus): adopt accepted main table footer prerequisite"` | exit0；dependency-only `0729b3cf48ec6ad1ba8a8148f3c29af41a959139`，原始 authored SHAs 未重写 |
| `node --test --test-name-pattern="interior word\|wrong target at one" test/nature-corpus.test.mjs`（先加regression、未改helper） | **exit1**；2tests，0pass/2fail，0skip；actual consumer `pass` 与正确期待 `failure` 不符，两个原始baseline均真正通过；log `review-p2-before.log` |
| `node --test --test-name-pattern="interior word\|wrong target at one\|source assertions reject\|strict consumers\|immutable excerpts\|committed complete" test/nature-corpus.test.mjs test/golden-paper.test.mjs` | exit0；18pass/0fail/0skip，51.741s；log `review-p2-framework-final.log`。随后新增 default mutation 也在下行完整run通过 |
| `node --test test/nature-corpus.test.mjs test/golden-paper.test.mjs`（本轮actual helper/test） | **exit1**；371tests：241pass/130fail，0skip/todo/cancel，236.278s；全部255 source cases：170pass/85fail，85unique；27 repeat、3 dialect isolation、12 mock scenarios、全部 mutation controls、只读golden均pass。130包含失败parent/validator cases，不能当distinct expectation数；log `accepted-table-full-corpus.log`，records `accepted-table-execution.json` |
| `node --test test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-corpus-infrastructure.test.mjs test/network-boundaries.test.mjs test/nature-table-notes.test.mjs` | exit0；95pass/0fail/0skip，3.869s；log `accepted-table-existing-regression.log`。FRB剩余12scientific fragments如实诊断，未被当whole-paperpass |
| `npm run build` | exit0；只生成ignored `dist/extension`；log `accepted-table-build.log` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0；golden四validators/scientificFragments均valid；log `accepted-table-golden-validation.log` |
| `git diff --check`；`git diff --cached --check` | exit0 |
| `git diff bff2f2a90731914194f8dd081f9267a1bb8d8e11 -- test/corpus papers docs/specs docs/PRD.md docs/EDD.md` | empty；C没有改B输入/golden/意图 |
| `git diff --cached --name-only` | 本轮core commit严格helper/test两个ownedfiles；handoff receipt严格本文件 |

External 原始 source/rights audit scripts只从原rawbytes/DOM和Gitobjects读数据、不调用clip/writer/network。source audit步骤如上所述；shared `auditSourceOracle` 已提交，可按命令在任意有B原rawdirectory的环境复核。本轮没有重做此前valid85 source audit/13完整resource哈希；ordinary tests再次核对frozen语义/fixturepreflight，并独立核对新packet涉及的untouched raw Buffer和段落/TD。Occurrence repro另调用实际clipNature+fresh replay，没有live fetch/writer。Ordinary tests不依赖外部raw文件、不产生临时capture、不会重采live。Full test-run legacy intermediate logs、comparison JSON及Markdown只在外部temp，不提交snapshot。当前 `accepted-table-execution.json` 含255个实际case records；本文件85行将它们完整持久化。

没有声称`npm test`或Issue #10最终CI已通过本检查点。`npm run build`与golden验证已在本轮通过，完整C suite按真实known parser失败exit1；不再重复同一known-red suite来制造绿灯。最终integrator须在parser prerequisites accepted后运行spec§9全部checks和CI matrix。

## 恢复 C / D / integrator 的解除阻塞条件

1. Integrator采用原A/B/D依赖及C authored commits；B b718fa8 attribution作为独立metadata增量接入。不得cherry-pick C read-only B snapshot再重复集成B原提交。
2. Tablefooter已在accepted e0a341f解除。其余独立caption/citation/crossref、scientificunits、FRB table MathJax attachment、literalbrackets/isotope/adjacent-inline边界、pangenomealt修复通过各自contract、独立review、required CI/MainCI后，恢复**同一个Agent C**。不把bugbranches或pending MainCI当前结果当accepted main；本轮未消费尚pending的后续main。
3. C在没有修改sourceoracle的情况下重新执行全部85×3、27 validators/strictwarnings、repeat/isolation、replay scenarios、read-onlygolden。正确TeX presentation等价可完善test-onlycomparison，但必须独立证明不是放宽scientificattachment/identity/oracle。
4. 全部适用expectations/validators/warnings真正通过才把必需覆盖记为complete；D只在严格offline gate通过后运行其相应live流程。
5. Integrator记录最终all-corpus真实bytes/sizeexception review、最终exactcommands与三个CIjobs。Canonical spec没有修改，没有提出新产品语义，没有ordinary Issue10 deliveryPR。
