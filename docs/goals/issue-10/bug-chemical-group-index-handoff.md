# Issue #74 — Nature 括号化学分组下标 SOURCE_ONLY_RED handoff

三个真实 whole-group SUB regression 已冻结，生产实现未修改，尚未修复。新65-block projection 的不同作者独立来源审核待进行，不能以 producer checks 或历史 B/C 全来源 audit 代替。Issue #10 未完成。

## 身份、base 与 ordered commits

- Work Contract：[Issue #74](https://github.com/uwougil/Academic-clipper/issues/74)，已创建并 read-back 验证为 OPEN / `bug`。在 authenticated `uwougil/Academic-clipper` remote 上检索全部 open/closed Issues、branches/worktrees 与 temp 后没有语义相同合同；#48 的 plain unit/numeric SUP、#61 isotope、#64 Greek SUB、#68 identifier、#73 Δ SUP 为相邻但不同范围。
- Base：`a5b6acc2984af5cb8b82106291e963f4f413f5ac`。已重新查询 [Main CI 37716530268](https://github.com/uwougil/Academic-clipper/actions/runs/37716530268) 和 [Secret scan 37716530267](https://github.com/uwougil/Academic-clipper/actions/runs/37716530267)，均 exact base 的 completed/success。后来其他 prerequisite 合并不改变此 RED 的基线；future implementation 使用届时最新 accepted main。
- Branch：`codex/issue-10-bug-chemical-group-index`；worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-chemical-group-index/academic-clipper`。恢复时 HEAD exact base，clean，无已有 group source files/temp/Issue；没有重启已完成任务或重新获取来源。
- Ordered authored commits：`4871f9779ceddcad05afd724e7cede3433b245d5`（来源/provenance/diagnosis/permanent RED test）→ `dfd32f5b54b0f34f0de9571b492dadaff8692b3a`（fixture-local source HTML blank-at-eol attribute）→ 本 DOCONLY handoff commit，最终 SHA 用 `git log -1 --format=%H -- docs/goals/issue-10/bug-chemical-group-index-handoff.md` 重建。
- Owned files：`test/fixtures/nature-chemical-group-index/{.gitattributes,README.md,diagnosis.json,s41467-023-44030-3.excerpt.html,s41467-023-44030-3.provenance.json}`、`test/nature-chemical-group-index.test.mjs`、本 handoff。
- 没有修改 `src/`、golden、B corpus、C/D helper/test、canonical spec、PRD/EDD、dependencies、security/writer；无 PR。SOURCE_ONLY_RED branch 不可直接合并，future one delivery PR 使用 exact standalone `Refs #74` 并满足 orchestrator 十项 gate。

## 原来源与科学 oracle

唯一既有 admitted source：[Nature Communications article](https://www.nature.com/articles/s41467-023-44030-3)，`C5 methylation confers accessibility, stability and selectivity to picrotoxinin`，DOI `10.1038/s41467-023-44030-3`。B source contract `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`；observedAt `2026-10-03T16:44:25.253Z`，captureMode `guarded-http`。原 HTTP body 460171 bytes，SHA-256 `a02d82acb4cdbde085e07ca0c276383894e7a7832c6830ad7a212f450926d88d`。本阶段仅读取 B 已授权公开 anonymous source；无新的 Cookie、credentials、session/profile 或 acquisition。完整 raw 位于外部 B temp，未入 Git，未复用 PR #13。

三个段落均完整保留，indices 零起算。SUB 是真实 chemical group count；scientific oracle 来自 source DOM attachment，未从最终 parser 输出反向定义：

| Role / 原位置 | 原 source locator 与 attachment | Raw subtree SHA-256 | Frozen subtree SHA-256 |
| --- | --- | --- | --- |
| `results-p2-Pb-OAc4`，C block `a-section-2` / Results p2 | `section[data-title="Results"] p:has(#ref-link-section-d76734419e852)`；SUB index0，`Pb(OAc)<sub>4</sub>` | `40052f20434e9ebfb090e55429d3a20e47553d31afe92b047c485808ba6e64a3` | `74e0d28852386fd8165404fa8a38afcb94b49979f2c5dd9f9f3cb457bb3df00e` |
| `results-p5-Fe2-ox3`，`a-section-2` / Results p5 | `section[data-title="Results"] p:has(#ref-link-section-d76734419e1091)`；SUB index1，`Fe<sub>2</sub>(ox)<sub>3</sub>` | `b128b77e64328225608d6694938fccf1aed9a9f58a0f7beb1c842d0511999947` | `896c0856d4585fd2b2b6df5ba7dd70bdbb466d8b1eb216d7be2d809d411fc605` |
| `methods-p0-CD3-2CO`，`a-section-3` / Methods p0 | `#Sec8-content > p:nth-of-type(1)`；SUB index5，`(CD<sub>3</sub>)<sub>2</sub>CO` | `e46e69f8e120aae7909d1f531f54052334313b78481bbce0b641e3ee72e6373a` | 同 raw hash |

4 属于完整 OAc 分组，3 属于完整 ox 分组，2 属于完整 CD3 分组。保留原 OAc/ox 大小写、inner Fe2/CD3、outside Pb/CO 与 source顺序；不能只接在内层 C/Fe 原子、前一个 measurement 或 citation，也不能改成 exponent。永久 test 接受完整 attachment 的语义等价 TeX/Unicode，不要求编造 TeX作为来源。已正确的 inner scripts、compound bold sequence、GABA_A/PtO_2 与 ordinary yields，以及 Methods 6 isotope atoms/7.26/77.16/2.05/206.26/3.31/49.00 的独立值由 compatibility assertions 保持。

65 selected blocks 使用 original ancestors/scaffold：title/canonical/DOI/article JSON-LD、全部9 ordered creators、`h2#Sec2`/`h3#Sec3`/`h2#Sec8`/`h2#Sec10`、三个完整段落、完整 Fig2/3 wrappers/captions、MOESM1 原 PDF-link item、References prefix1–37、原 CC BY4.0 notice/footer。Fig3 来自 Fig2 原 caption 中的 Fig3 link，MOESM1 同时是正文/图注原 dependency；没有为了缩小 fixture 删除它们。无需要补取的 HTML table/equation resource。

原 ordered authors 为 Tong, Guanghu；Griffin, Samantha；Sader, Avery；Crowell, Anna B.；Beavers, Ken；Watson, Jerry；Buchan, Zachary；Chen, Shuming；Shenvi, Ryan A.。原 citation clusters 按 retained source order为 `[21,28,29]`、`[30]`、`[31]`、`[32]`、`[33,34]`、`[35]`、`[37]`，保持完整37条 References，不重编号。此任务没有新增/reject候选文章，coverage role仅为 canonical §4、§7 的 chemistry scientific attachment；不改变原9篇 admission。

## A interface、transformations、omissions 与 bytes

消费原 A helper Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`，34946 Git LF bytes，SHA-256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`；实际执行文件 normalize CRLF→LF 后与此 Git bytes 相等。调用实际 `sanitizeNatureHtml(raw, recipe)`、`serializeSubtree(node)`，没有重复 sanitizer/hash/replay infrastructure。Sanitizer `nature-corpus-sanitizer/1.1.0`、serializer `nature-corpus-subtree/1.0.0`、schema/recipe/projection 1.0。

Recipe `s41467-023-44030-3-chemical-group-index-v1`，SHA-256 `ca1ca9ac5d464122bbacd56f6cca98ec0930d7af5b78cd42409661cf08a0031f`。完整65 selectors、raw subtree digests、structure/payload signatures 与 operation/count transformations 在 provenance；仅相同 recipe/version projection 的 signatures 可比较。Producer 独立 repeat 和再次 sanitization equal，原 scientific nodes/paragraph text/source order/rights相等。Hash 只证明 byte identity，不代替 different-owner science review。

转换遵循原 A：select完整 source blocks 与 necessary ancestors；固定 scaffold/attribute ordering，UTF-8无BOM/LF；保留相应 article JSON-LD，移除 executable/analytics/ads/track/session material，清理 resource URL tracking query；不 pretty-print inline 或 collapse有意义空白。原 unselected paragraphs、References37后、其他 figures/未链接 equations/tables/supplement items 与UI省略。Images/PDF只保留原 URL，binary不下载、不提交；article原许可证不重新授权为 repository code license。具体 transformations 和 omittedContent 为 committed provenance字段。

第一次 staged `git diff --check` 指出 source serializer 保留的 blank-at-eol；保留 HTML 原 bytes，采用与原 A/B一致且更窄的 local `*.excerpt.html whitespace=-blank-at-eol`。该规则不作用于 prose/code/JSON，也不关闭 blank-at-eof检查。添加规则后的 baseline/full diff check exit0；未为 diff check 改动 fixture/sanitizer。

| Committed artifact（UTF-8/LF） | Bytes | SHA-256 |
| --- | ---: | --- |
| excerpt HTML | 72722 | `a8c10a9e583c640a3adb41cf7a55f3c1a4d1a7f7b8f88b7d370afaa969c8079b` |
| provenance JSON | 59160 | `428ffafc1558ba0b07dadd0f48f44f29bfebe9b603f1e87ec8af4a564b949887` |
| diagnosis JSON | 32460 | `4b178707f39e5dac50bd270f5fc18721856a328b3feccdec3e5b92a664c92360` |
| permanent test | 10011 | `c693e600d8312c1020b95469505c985d107436d09f2a6af944502ccc17079634` |

72722 bytes 处于 article20–150KiB target和256KiB hard cap内。Resource fixture0/table0、retained mainfigures2/display0；没有 sizeException。总 metadata/test size不被冒充 excerpt bytes，最终 corpus size仍属 integrator完整政策审阅。

## Reproduction、真失败与 harness correction

Windows Node `v24.14.1`，reused既有忽略的 node_modules，无 npmci/install。最初 actual command在 unchanged base运行：

```powershell
$env:CHEMICAL_GROUP_RECEIPT_ROOT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-chemical-group-index/red-a5b6'
node --test test/nature-chemical-group-index.test.mjs
```

每方言结果 promise仅执行一次 `clipNature`：合计3 actual clips，保存同次full result/Markdown/debug/semantic到显式外部temp；随后移除该env。Original run exit1，18tests，2PASS/16FAIL，1543.39ms，零skip/cancel/todo。

额外 source test failure 因 expected headings忘了原 retained Supplementary h2/h3；Fe context locator 使用 flattened source前55字，包含源bold compound28而 production有Markdown emphasis。三个 ordinary compatibility tests也被错误 context提前挡住。修正测试的 source-heading audit（原有ID headings，supp item另单独检查）与 Fe unique literal opening `6F12FPXN `，只用同3个缓存执行，无 source/production修改、无 reclip：

```powershell
$env:CHEMICAL_GROUP_CACHE_ROOT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-chemical-group-index/red-a5b6'
node --test test/nature-chemical-group-index.test.mjs
```

Corrected run exit1，18tests，6PASS/12FAIL，768.2255ms。最后补齐 group成功后对outside Pb/Fe/CO的语义约束，final cached run exit1，18tests，6PASS/12FAIL，776.1531ms，零skip/cancel/todo；没有新clip。所有三个 Fe role现在因 missing attachment真实失败，已不把 original locator error算parser证据。Original16FAIL日志仍完整保存；最终12 trueRED为3roles×3dialects的9 attachment tests，加3 strict math validators。

6PASS分别是source fullparagraph/scientificnodes/identity/creators/rights/closure一次、三方言 ordinary chemistry/isotope/value/citations/resources，以及两个 explicitly synthetic compatibility checks。Known TeX/code/isotope/integer-unit保持；unknown parenthesized word不推断为 chemistry，validator继续拒绝3原orphan strings。最终默认 permanent test仍走 freshproduction；cache env仅诊断，不可代替实现gate。

每方言 `mathValidation.valid=false`，precise `isolatedSubscript=3`、isolatedSuperscript/boldThenSubscript/italicThenSuperscript全零。其他 production `rawHtmlValidation`、`markdownStructure`、`crossReferenceValidation`均valid；exact warnings `["No equation nodes were detected."]`，Fig2/3、37References与原7citationclusters成立。`clipNature`不下载figures，不调用writer；网络guard在throw前记HTTP/DNS尝试，最后ledger断言捕获fallback吞错，bindings已恢复，attempts `[]`。Writer proof明确为staticcallgraph，不声称writer spy。

## 传播路径与原实际位置

Nature adapter cleanedHtml保留原`Pb(OAc)<sub>4</sub>`、`(ox)<sub>3</sub>`、`)<sub>2</sub>CO`。现有typed scientific collectors不接纳这些 unstyled parenthesized chemical groups；Defuddle保留script但加入presentation spaces，academic-inline `renderRange`产生各自独立`$_{n}$`。`combineLiteralPowers`当前仅处理numericSUP/unit，`combineScientificRuns`接合styledbases；三处分组后SUB仍为orphan。Strict validator正确拒绝，不是需要放宽的规则。诊断保存原clip/Nature/academic-inline Git blobs、same-run cleanedHtml/bodyMarkdown/final evidence与validatorpositions；不声称发现历史regression引入点。

下面坐标指原完整formula开头，1-based line/column，与validator在orphan `$`的列不同。UTF-8byteoffsets同存diagnosis；不能混成原HTTPoffset。

| Dialect | Pb(OAc)4 | Fe2(ox)3 | (CD3)2CO |
| --- | --- | --- | --- |
| markdown | `27:398` | `35:54` | `47:1553` |
| links | `27:411` | `36:54` | `49:1553` |
| quarto | `26:415` | `34:54` | `44:1553` |

外部 evidence根：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-chemical-group-index`。`inspect.mjs`/`closure.mjs`/`freeze.mjs`为实际 source-only preflight/projection，exit0；`receipt.mjs`只读取这3actualcaches与source/codeidentity，exit0，不剪辑、不重复A/B全audit。Committed diagnosis与外部source-onlyreceipt对应相同bytes。Raw preflight只解析唯一原raw，不能冒充full85sourceverification。当前任务没有新的candidateaccess请求。

| External same-run evidence | Bytes | SHA-256 |
| --- | ---: | --- |
| markdown.result.json | 154599 | `5f644096cefd25eddfbadcf674f3cda45dd2bcfbb6f43849dfe161dbd109390b` |
| markdown.md | 17533 | `b7a8235f366c81d9d34a3ce1edcea351a7fba9550951217b116220edd2db8287` |
| links.result.json | 158585 | `4ac8cf1d159ed2cd9b80ad7cd2785dd85b10befa0dd5f493992c3e443a234ea5` |
| links.md | 18322 | `baa23b9fbca98c48a5533337699720b578938e869c78aec308154a18b7f3a9ad` |
| quarto.result.json | 138602 | `172e2373e3d36b658f87edfb037074406274dd66e4b7daf93850b6ae5c3386bd` |
| quarto.md | 9454 | `611804a19e0dd4690e19e56be6a19a74077ca82ec400d284004550224d257e37` |
| network-ledger.json | 124 | `38f726f4b3895d4c6d8bc4ae526aae1052a4f15ba568e58829f92db971cfb868` |

Exact log/Issue readback/receipt/projection-script sizes/hashes可从 committed diagnosis和其provenance验证；full result/externalMD不入Git，不以whole-document snapshot当oracle。未运行productionfix、affected/full tests、build、golden、PR/freshCI或Mainacceptance；SOURCE_ONLY阶段的RED不是bug完成，也不代替以后全gate。

## 消费者 unblocking 条件

Independent source reviewer：从最终selectedsourceHEAD用原A版本与rawhash独立核验新65-block projection；包括三完整paragraph/原outergroupattachment及innercount、9creator/canonicalJSONLD、Fig2→Fig3/MOESM1closure、originalprefix1–37、rights、transformations/omissions。只核验这个新增projection，复用已完成B85来源audit，不能重新采集或以producerreceipt代审。此项PENDING。

Production owner：独立sourceacceptance和rootproductiongate后，采用最新acceptedmain，最小既有 Nature/scientific-run boundary恢复这些明确 chemicalgroup roles；禁止第二parser/全局括号或word猜测。清除 `CHEMICAL_GROUP_CACHE_ROOT`，fresh跑focused三方言，保持sourcebytes/oracle。之后执行affected/full/build/golden、fresh三平台CI/Secrets、different-ownerimplementationreview，root十项gate全部成立才允许squashmerge；merged-mainCI接受后才算修复。

Agent C：保持原85expectations与Bfixture/sourceoracle。#74解释Chemistry原三个trailing-groupSUB失败；#73仍负责两个ΔSUP，其他已接纳修复保持独立。此bug被acceptedmain接纳后，用原Chemistrysource增量核验相关角色和4validators；复用之前27source/3repeat证据并明确新的executiontier。不能将newminimalprojection或cachepasses当作all255/currentwholeChemistry通过。全部requiredroles真实通过后再由root安排最终corpus/integration。

没有source/science/spec ambiguity，没有proposedspecchanges，无需humanpolicydecision；尚需独立source审核和parser修复是agent-resolvabledependencies。Canonical保持原文。终态仅SOURCE_ONLYhandoff，Issue #10未完成。
