# Issue #48 — 科学单位修复交接

状态：单位重接及独立 review 的 code-opacity 修正已实现；最新本地验证见下文，待 fresh PR CI、Secret scan 与新 exact-head 独立 review。独立合同：[Issue #48](https://github.com/uwougil/Academic-clipper/issues/48)，type `bug`，delivery [PR #50](https://github.com/uwougil/Academic-clipper/pull/50)，Work Contract 尚未完成。本 bug 是 Issue #10 的 parser 前置条件，不承担其 corpus infrastructure 最终交付；PR 只使用 `Refs #48`，不使用 `Refs #10`。

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

PR 首次 head `d94631ccf4720a4f8383a7ce1fb161bdc6e786e0` 的自查另发现新增 pass 的 opaque boundary 错误：`$\text{cost \$5}$ cm<sup>2</sup>` 的 escaped dollar 被误当 closing delimiter，` ``a``` m$^{3}$`` ` 的较长 run 被误当 inline-code closing delimiter，两者后面的 `cm²` 都未重接。此 head 的 CI 和 Secret scan 不能用于修正后的 head；root 已暂停合并，独立 review 未开始。两个最终 synthetic regression tests 在该 head 上重新执行，**2 tests / 0 pass / 2 fail，exit 1**，log `units-opacity-red-final-tests.log`。

修正仍仅在 `academic-inline.mjs` 内：数学 closing delimiter 核验连续反斜杠奇偶；inline code 只接受同长度的完整 backtick run；fenced code 只在适当 line position 用相同 character 的足够长 closing fence 结束。已有跨度 byte-for-byte 保留，unclosed fenced content 保守保持；跨度之外的源 unit attachment 仍完成。Synthetic controls 明确覆盖 escaped currency、inline/display math、even backslashes、短/长 nested backtick runs、backtick/tilde fences 与较长/过短/缺失 closing fence。没有改 validator、math normalizer、unit 白名单或独立 source boundaries。此修复初次 checkpoint `14d35c0e47d69f5834277d2c25f0f947453d9959` 的 base 是 `e0a341fc97ff845a250c2f016dcb2363e10ed49e`；CI `37272060435` 三平台和 Secret scan `37272060536` 均 success，但不能替代下面更新后的 head 验证。

| Exact command | Result |
| --- | --- |
| `npm ci` | exit 0，65 packages，0 vulnerabilities |
| `node --test test/nature-scientific-units.test.mjs test/nature-table-notes.test.mjs test/nature-adapter.test.mjs test/output-quality.test.mjs` | exit 0，65 pass / 0 fail / 0 skip/todo/cancel |
| `npm test` | exit 0，294 pass / 0 fail / 0 skip/todo/cancel，65582 ms |
| `npm run build` | exit 0，extension build 成功，dist 仍 ignored |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit 0，13 displays / 50 references / scientificFragments 和四 validators valid |
| `git diff --check`、`git status --short`、diff/tracked filename audit | owned scope only；最终 commit 前重跑 |

上述初次 checkpoint logs 只在外部 B TEMP 的 `units-opacity-focused-green.log`、`units-opacity-full-tests.log`、`units-opacity-build.log`、`units-opacity-golden.log`；先前 red/green logs 也保留。本 bug 的 frozen source/dialect attachment 合同通过，不代表完整 C 85×3 corpus 验收；C 须等其它独立修复被 accepted 后恢复 SAME C。

## 更新到最新 accepted main

本 agent 自行 fetch 并核验 accepted `4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2`（#47 / PR #49）：Main CI `37272529095` 的 Ubuntu Node 20 / Ubuntu Node 24 / Windows Node 24 jobs `111642385891` / `111642385902` / `111642385793` 均 success；Secret scan `37272529070` / Gitleaks `111642385712`、finalizer `37273099892` 均 success；Issue #47 于 `2026-10-05T06:34:34Z` closed/completed。

使用 `git merge --no-ff 4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2` 生成 dependency merge `d8023b4f770fd76edd1bbcb4d1b458c4bf1687d8`，无冲突、没有 force push。原 source-red `12874177091badf820157706fb482400f3227942`、unit fix `d94631ccf4720a4f8383a7ce1fb161bdc6e786e0`、opacity fix `14d35c0e47d69f5834277d2c25f0f947453d9959` 均按原 SHA 保留为 ancestors，无 SHA 映射改写。相对 accepted `4783291` 的唯一 production diff 仍是 `academic-inline.mjs`；其它新增文件仅本 bug 的 tests、fixtures、provenance 和本 handoff。Accepted caption 实现直接来自 main，没有本 bug 的额外修改。

再次用 accepted `4783291` 原版 normalizer 执行同一最终 11 tests，实际 **exit 1，2 pass / 9 fail，0 skip/todo/cancel**：source identity 与 negative controls 通过，6 个真实 source × dialect cases 均失败于缺少 base-power attachment，3 个 synthetic positive cases 失败。Log `units-red-478-final-tests.log`。临时恢复只限 owner normalizer，`finally` 用 SHA-256 核验 fixed bytes 完整复原。原 SR/table raw hashes再次直接重算一致，fixtures/provenance/tests/normalizer 与 `14d35c0` 的 byte diff 为零，完整 ordered creators / 原 notices / recipe / positions / power pairs 检查通过。

最新 source/focused 验证命令加入 accepted caption regression：`node --test test/nature-scientific-units.test.mjs test/nature-table-notes.test.mjs test/nature-caption-citations.test.mjs test/nature-adapter.test.mjs test/output-quality.test.mjs`，**76 pass / 0 fail/skip/todo/cancel，exit 0**，包含本 bug 全部 11 tests 和两个源的三方言四 validators/scientificFragments。`npm run build` 和同一 golden validate 命令均 exit 0，golden 13 displays / 50 references / 四 validators 和 scientificFragments valid。新 logs 使用外部 B TEMP 的 `units-478-focused-green.log`、`units-478-full-tests.log`、`units-478-build.log`、`units-478-golden.log`；不提交 logs 或完整 captures。

新基线完整 `npm test` **305 pass / 0 fail/skip/todo/cancel，exit 0，70241 ms**。最终 tracked filename / `git diff --check` / staged check / status 审计限于上述本 bug 的 10 个文件，生产路径只有 `src/normalizers/academic-inline.mjs`；没有修改 validators/security/golden/intent/B source 或 oracle。Fresh PR head CI 和 Secret scan 尚需在 push 后重新成功，旧 `14d35c0` 检查不能替代。

## 独立 review 的 code-opacity P2 与新修正

SAME reviewer 对 exact `b3fc93282da1de505dbaba51419c39048e8a8305` 独立发现一个 blocking P2，root 暂停合并。旧 head 虽然 76 focused / 305 full / build / golden 全通过，仍不能满足 #48 的 code negative-control criterion：四空格或 tab 的缩进代码、blockquote/list 内的 tilde fence 中，原字面 `m$^{3}$` 被新增 pass 改写成数学单位；list closing fence 又被误当未闭合的新 opener，使块外 `cm²` 继续孤立。Accepted `4783291` 对这些合法 code bytes 均保持原样，其块外孤立单位是本合同原缺陷。

这些输入明确是 synthetic legal-Markdown controls，不伪称来自 Nature raw，不增加真实 source admission。永久四项回归先在 unchanged b3fc production 实际执行 **4 tests / 0 pass / 4 fail，exit 1**，log `units-review-code-opacity-red-b3fc.log`。随后补足与同一 code boundary 相邻的 nested quote/list、ordered/empty/tab-padded list、container 结束与普通缩进正文 controls。初版保护自查另发现 list→blockquote、setext heading 后缩进代码和 quote prefix 后 tab 正文三项边界，补充测试先实际 **0 pass / 3 fail，exit 1**（`units-review-adjacent-code-red.log`），随后修正同一 owned pass，没有改学术 unit 识别规则。

最终新增 **14** 个 code-boundary tests（13 个完整 code bytes + 块外 unit attachment cases、1 个普通正文/不同代码块分隔 controls test）在原 b3fc normalizer 上再次实际 **0 pass / 14 fail，exit 1**，log `units-review-code-opacity-red-final-b3fc.log`。Red tests commits `04029b3`、`d569d76` 均保留旧 b3fc 的生产代码，因此永久 red checkpoint 可独立重建；原 source-red / unit fix / first opacity fix / accepted dependency merge 的 SHAs 全保持。

修正 commit `0a676d581df4fb5ccd99128d37b7f78ee4eb1749` 仅改 `src/normalizers/academic-inline.mjs`：在新增 prose pass 前定位块代码的原 spans，按其有序 quote/list prefix、tab columns、段落与 fence 状态识别边界，再逐字复制跨度。此扫描只决定 opacity，不转换 code 内容、不增加 scholarly parser/API/依赖；原 escaped-dollar 与 inline backtick 规则保留。块外已知 unit/明确数值基底仍重接，普通缩进段落不因空格或 tab 被误当 code。既有 styled/chemistry normalization 和全部 validators 未改。

原 **3 excerpts / provenance** 对 b3fc 的 diff 为零，source powers/完整 creators/rights/recipe/positions 不变。三个 untouched raw SHA-256 再次直接重算匹配，永久 source-integrity test通过；reviewer 已独立核验原 A helper blob、重建 recipe/repeat/idempotence、全部原位置及 FRB 7 cell markers/6 notes 的三方言 association，本次不以新输出改来源。再次用 accepted `4783291` 原 normalizer 运行原11个 source/negative/positive controls，实际 **2 pass / 9 fail，exit 1**；六个真实 source×dialect 均失败于源 base-power attachment 缺失，source identity/negative controls仍通过（`units-review-source-red-478.log`）。只临时替换 owned normalizer，`finally` 按 SHA-256 核验 fixed bytes 完整复原；baseline normalizer SHA-256 `b60d40974b8052f57f148407537eba5711b109054b8b6582a959dadbb7089a42`。

最终新 unit suite 为 **25** tests；新增 boundary tests 不算 Nature coverage。所有下面检查使用相同最终生产与 tests，不使用旧 b3fc 的 green 或 CI 代替：

| Exact command | Result / external log |
| --- | --- |
| `npm ci` | exit 0，65 packages，0 vulnerabilities |
| `node --test test/nature-scientific-units.test.mjs test/nature-table-notes.test.mjs test/nature-caption-citations.test.mjs test/nature-adapter.test.mjs test/output-quality.test.mjs` | exit 0，90/90，0 fail/skip/todo/cancel，4383 ms；`units-review-focused-final-green.log` |
| `npm test` | exit 0，319/319，0 fail/skip/todo/cancel，68550 ms；`units-review-final-full-tests.log`（0a676d5 checkpoint，不能代替下次 accepted-base 验证） |
| `npm run build` | exit 0，ignored dist；`units-review-final-build.log` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit 0，13 displays / 50 references / 四 validators 和 scientificFragments valid；`units-review-final-golden.log` |
| `git diff --check` / staged check / filename and status audit | owner scope，source inputs不变；docs checkpoint 前最终重核 |

原 initial candidate 的 88 focused / 317 full 通过记录保留为诊断历史，不能替代最终容器边界修正的检查。External logs 位于 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-b/`，不提交 logs/raw。Fresh exact-head 三平台 CI、Gitleaks 与独立 re-review 尚需 push 后核验；root 决定合并，本 agent 不 merge。旧 b3fc review/CI 不能用于新 head。

另一个 sparse-alt 任务使用独立 worktree `C:/Users/guoli/.codex/worktrees/issue-10-bug-sparse-figure-alt/academic-clipper`，当前 clean accepted478；其来源预检和待冻结合同独立保存 external TEMP。本次 Units 修复没有混入其代码、fixture 或 Issue。

## Checkpoint pre-review 的 block precedence 修正

Reviewer 的 `0a676d5` 独立 pre-review（非 published final-head review）确认原四失败已绿、28 scientific/negative controls 保持，并发现四个同一 code-opacity P2：`- - -` / `* * *` / quoted thematic break 先被当 list markers 消费，下一行 code 错入 prose pass；独立 `===` 被无条件当 setext heading，随后四空格 paragraph continuation 错当 code。已完整读取 reviewer packet `pr50-0a676d5-pre-review.md` 与 executable controls；[CommonMark thematic-break priority](https://spec.commonmark.org/0.31.2/#thematic-breaks)、[setext headings 的前置 paragraph](https://spec.commonmark.org/0.31.2/#setext-headings)、[indented code 不能 interrupt paragraph](https://spec.commonmark.org/0.31.2/#indented-code-blocks) 是这些 synthetic controls 的语法依据，不是 Nature source admission。

新四项永久 controls 在 unchanged `0a676d5` production 上先实际 **4 tests / 0 pass / 4 fail，exit 1**（`units-review-precedence-red-0a676d5.log`），red commit `41401cb`；随后最小修正 commit `60c48dc` 在同一 block-opacity scanner 中先识别 thematic break 再考虑 list marker，并且仅在前一行已形成 paragraph 时认可 setext underline。原科学 unit/numeric recognition、三 excerpts、provenance、validator 及其它生产文件不变。20 个 code/math boundary tests 实际全绿，完整 suite 将在下面新 accepted base dependency merge 后重跑；0a 的319 green 不是最终验收。

新的 accepted main `e2d32e9ec819692a1f08075636c3a168f15ad20b`（#51 / PR #52）已自行 fetch 核验：Main CI `37278003744` 三 jobs `111659280091` / `111659279964` / `111659280101` success；Secret scan `37278003787` / Gitleaks `111659279634` success；finalizer `37278762752` success；Issue #51 于 `2026-10-05T07:37:25Z` completed。接下来的 dependency merge 保留所有 red/fix authored SHAs；不使用旧 b3fc 或 0a 的 CI/review 批准新 final head。

## 其它来源的同机制与独立边界

对 untouched source 的 typed fragment 做只读诊断，未提交额外 captures、未将其计入 passing corpus coverage。AlphaFold 原 Å²（Main p5，`e1303eacd7a9fb18e9a873f835d611c3dc7795b50fea4dee5b3ebdb16ca41035`）、COVID ml⁻¹（Methods p1，`ad4da67f7dbb1f0c6fce335ebc795c09590b3f2f81bda469b70f0561c3ed22ae`）、materials atom⁻¹（Main p2，`13879004c6bdfc0f8919bf4aae21b7c2dcbf3e057ca85daf77174f2c6b717687`）及 day⁻¹（Methods p39，`395116f5ff2c4c95feb071fe51106cdbbf66a150a9db3de7a2a97d975d6aadad`）、chemistry Å³（Results p0，`146a939c2e4551225269d70f3ac93507bdbebc0c85ffb8629ae19c469d164f6c`）均符合相同完整 unit token rule。Paragraph index 在各原 node 最近 section 的原 `querySelectorAll('p')` 中零起算，hash 为 A serializer 的原 paragraph；它不是 C reduced block 的 paragraph index。

实际未覆盖的独立 source boundaries 已报 root：materials `r<sup>2</sup>SCAN`（上列 Main p2），`mScm<sup>−1</sup>`（Methods p42，`7f1338d170c587581f6886da41018abd505a2e25e2522e988d6348aa9c3b2eb4`），FRB Methods p22 的 `(5/60)<sup>2</sup>` / `(0.19/60/60)<sup>2</sup>`（`4fe682650c4c464c1d6341c364241d29e154f18ecf7c8565de908b840c9a6fe5`）。它们需要 identifier/compound-unit/complex-base 语义，不可宽匹配猜成 simple units。Literal [O III]、leading isotope、materials styled adjacency、caption/citation/crossrefs 和 sparse alt 同样独立。

最终 authored commits 用 `git log --first-parent --reverse --format="%H %s" e0a341fc97ff845a250c2f016dcb2363e10ed49e..HEAD` 重建；最终窄 diff 用 `git diff 4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2..HEAD` 核验。最终 PR 必须等 fresh exact-head 三平台 CI、Secret scan 和独立 review 无 blocking 后由 root 执行 merge；本 agent 不 merge。合并只接纳代码，只有 merged commit Main CI success 才完成 Work Contract。
