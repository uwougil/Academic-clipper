# Issue #48 — 科学单位修复交接

状态：修复已实现，local source/focused/full/build/golden 验证通过；待 fresh PR CI、Secret scan 与 exact-head 独立 review。独立合同：[Issue #48](https://github.com/uwougil/Academic-clipper/issues/48)，type `bug`，Work Contract 尚未完成。本 bug 是 Issue #10 的 parser 前置条件，不承担其 corpus infrastructure 最终交付；PR 只使用 `Refs #48`，不使用 `Refs #10`。

Branch `codex/issue-10-bug-scientific-units`，managed worktree `C:/Users/guoli/.codex/worktrees/issue-10-bug-scientific-units/academic-clipper`。启动 accepted base `e85b1b809b56242b89b6313ce5d1165c745466bb` 已经 fetch 核验；Main CI `37182993143`、Secret scan `37182993093` 均 success。Node `v24.14.1`，`npm ci` exit 0：65 packages、0 vulnerabilities。

已读完整 applicable AGENTS、canonical spec、execution plan、B/C complete handoffs、PRD/EDD relevant boundaries，以及 create-issue/fix-bug skills。使用 human-settled-intent 模式；remote/auth 和 open+closed duplicate search 已核验，#1/#6/#45/#47 与本行为不同。`gh issue create` 与 `gh issue view 48` 均成功，唯一 type `bug`。

## 来源与真实红证据

只读 B source snapshot `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`，C checkpoint `ff3e714c707ccc619d00a7c42dd2d155cd1be631`、assertion helper `5d305fa72effae2bc34770e339c1e30b3ae07d19`。没有改 9 sources、4 tables、13 B excerpts、85 oracle、spec 或 golden。

用 existing A helper 原版生成 3 个本 bug 的 reduced excerpts；schema/recipe/projection `1.0.0`、sanitizer `1.1.0`、serializer `1.0.0`，没有复制 helper 或另写 parser。原 external raw Buffer hashes、pre-sanitize subtree hashes、complete ordered creators（SR 5 位、FRB 35 位）、原 CC BY 4.0 notice/URL/source positions 全部重新核验，repeat/idempotent bytes 相等。Recipe/positions/transformations/omissions/hash 保留在 [provenance 目录](../../../test/fixtures/nature-scientific-units/README.md)。Full captures 和临时生成器只在 external TEMP。

SR Methods source paragraphs 8/9/12 分别有 2/2/3 个 unit powers，共 7 个。源 m³/m³、kg m⁻² s⁻¹、kg/m² 在 cleaned HTML 与 Defuddle 输出中仍有正确 raw `<sup>`；`normalizeAcademicInline()` 将其变成 `$^{…}$`，其 `combineScientificRuns()` 仅接受 styled bases，所以第一次无效状态发生在 academic normalization。Adapter 没有 capture plaintext units，但修复不需要扩展 adapter：全部原基底和 typed attachment 仍到达 normalizer。

FRB table 有 12 个 numeric powers（cm/s/Hz/yr/10），直接使用同一 normalizer；没有正文 adapter 的 literal `10` capture，因此数值幂也孤立。其 7 个 a–f cell markers 和 6 条 adjacent footer notes 属于独立 #45，保留真实输入，不混入本 12 个 powers 或隐藏 whole-validator failures。

`node --test test/nature-scientific-units.test.mjs` 在 untouched e85 production 上 **exit 1**：8 tests，2 pass / 6 fail，0 skip/todo/cancel。Source integrity/creator/license/power checks 与 synthetic negative controls通过；两个真实来源 × 三方言均因 source base-power pairs 未位于同一数学表达式而失败。外部 log `units-red-e85.log`。SR whole-chain 另直接读回 math/scientificFragments=false、7 isolatedSuperscript，structure/rawHtml/crossReferences=true、73 original references、7 correct ordered citation clusters。

## 最小修复与验证

Root 明确释放 `src/normalizers/academic-inline.mjs` 给本 agent：仅在红证明和 Issue contract 固化后改此 production file，以及自身 tests/fixtures/handoff。Nature/figures/citations/clip 由 #47 owner 持有，禁止修改；不弱化 validator、不改 B source/oracle、security/writer/dependencies/golden/intent。

唯一 production 变化是 `src/normalizers/academic-inline.mjs`：从 typed numeric superscript 重接完整已知 unit token 或明确 numeric base。普通 unit 保持源 roman 样式，以 `\mathrm{...}` 和同一数学表达式的 superscript 渲染；原符号、值和 unit separation 保持。只接受 signed integer powers，不从 unknown word 末尾截取 unit suffix；citation anchors/letter markers/leading isotope 不被猜成单位。新 pass 将已有 math 和 code 作为 opaque input，原 styled/chemical normalization 保持。

本 agent 已自行 fetch/rebase 到 accepted `e0a341fc97ff845a250c2f016dcb2363e10ed49e`（#45/PR #46），核验 Main CI `37269007138` 三平台及 Secrets `37269007093` success。Red checkpoint rebase 后是 `12874177091badf820157706fb482400f3227942`。只读 source-table 诊断明确记录 notes `a,b,c,d,e,f` 已全部保留，剩余 **12** 个 numeric powers 孤立，math=false；没有将 #45 的 7 个 markers 混计。

新增 unit-prefix/numeric-base synthetic case 后，最终 9 个 tests 用 accepted e0 原 normalizer重新运行：**exit 1，2 pass / 7 fail**，6 个真实来源行为 cases 均因正确 power attachment 缺失失败，新增 literal-prefix case 正确失败。临时恢复仅本 owner normalizer，`finally` 按 SHA-256 核验固定代码 byte-for-byte 复原；没有改别的文件。Log `units-red-final-tests.log`。修复后 source cases 与全部 negative controls 通过；三方言 SR 和 FRB table 四个 production validators、scientificFragments 都 valid。

初次 green-run 揭示本任务新 test harness 的两处错误假设：reduced SR excerpt 没有 figures，应同时声明 `No Nature figures were detected.`；BibTeX 既可为 `article` 也可为 `misc`，应核验 emitted keys 与 bibliography keys 的实际对应。修正仅新 test，未改生产 warning/BibTeX 或 B oracle，最终 red 使用同一最终 test 重证 attachment 缺陷。

| Exact command | Result |
| --- | --- |
| `npm ci` | exit 0，65 packages，0 vulnerabilities |
| `node --test test/nature-scientific-units.test.mjs test/nature-table-notes.test.mjs test/nature-adapter.test.mjs test/output-quality.test.mjs` | exit 0，63 pass / 0 fail / 0 skip/todo/cancel |
| `npm test` | exit 0，292 pass / 0 fail / 0 skip/todo/cancel，79907 ms |
| `npm run build` | exit 0，extension build 成功，dist 仍 ignored |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit 0，13 displays / 50 references / scientificFragments 和四 validators valid |
| `git diff --check`、`git status --short`、diff/tracked filename audit | owned scope only；最终 commit 前重跑 |

Logs 只在外部 B TEMP 的 `units-focused-green.log`、`units-full-tests.log`。本 bug 的 frozen source/dialect attachment 合同通过，不代表完整 C 85×3 corpus 验收；C 须等其它独立修复被 accepted 后恢复 SAME C。

## 其它来源的同机制与独立边界

对 untouched source 的 typed fragment 做只读诊断，未提交额外 captures、未将其计入 passing corpus coverage。AlphaFold 原 Å²（Main p5，`e1303eacd7a9fb18e9a873f835d611c3dc7795b50fea4dee5b3ebdb16ca41035`）、COVID ml⁻¹（Methods p1，`ad4da67f7dbb1f0c6fce335ebc795c09590b3f2f81bda469b70f0561c3ed22ae`）、materials atom⁻¹（Main p2，`13879004c6bdfc0f8919bf4aae21b7c2dcbf3e057ca85daf77174f2c6b717687`）及 day⁻¹（Methods p39，`395116f5ff2c4c95feb071fe51106cdbbf66a150a9db3de7a2a97d975d6aadad`）、chemistry Å³（Results p0，`146a939c2e4551225269d70f3ac93507bdbebc0c85ffb8629ae19c469d164f6c`）均符合相同完整 unit token rule。Paragraph index 在各原 node 最近 section 的原 `querySelectorAll('p')` 中零起算，hash 为 A serializer 的原 paragraph；它不是 C reduced block 的 paragraph index。

实际未覆盖的独立 source boundaries 已报 root：materials `r<sup>2</sup>SCAN`（上列 Main p2），`mScm<sup>−1</sup>`（Methods p42，`7f1338d170c587581f6886da41018abd505a2e25e2522e988d6348aa9c3b2eb4`），FRB Methods p22 的 `(5/60)<sup>2</sup>` / `(0.19/60/60)<sup>2</sup>`（`4fe682650c4c464c1d6341c364241d29e154f18ecf7c8565de908b840c9a6fe5`）。它们需要 identifier/compound-unit/complex-base 语义，不可宽匹配猜成 simple units。Literal [O III]、leading isotope、materials styled adjacency、caption/citation/crossrefs 和 sparse alt 同样独立。

最终 authored commits 用 `git log --reverse --format="%H %s" e0a341fc97ff845a250c2f016dcb2363e10ed49e..HEAD` 重建。最终 PR 必须等 fresh exact-head 三平台 CI、Secret scan 和独立 review 无 blocking 后由 root 执行 merge；本 agent 不 merge。合并只接纳代码，只有 merged commit Main CI success 才完成 Work Contract。
