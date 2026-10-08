# Issue #68 — typed identifier 生产 focused checkpoint

状态：`LOCAL_GATES_GREEN_PENDING_PUBLICATION_REVIEW_AND_CI`。原 source-only 与 preflight 文档保留历史身份；本文件记录正式释放后的实际实现与 broader 验证。Root 已在 exact implementation head 独审 CLEAR 后释放下列 gates；Issue #68 尚未完成，fresh PR CI/Secret scan、最终 immutable publication review 与 merged-main acceptance 仍由 root 协调。

## 接纳依赖与范围

Same worktree `C:/Users/guoli/.codex/worktrees/issue10-materials-identifier/academic-clipper`，branch `codex/issue-10-bug-materials-identifier`；从 clean `8f18620bbc28278cde20c2dbda5423cbe259dc00` 恢复。Root 正式释放 accepted main `36c93ca81236705912c25db391d611ee28405dca`（#67 / PR #78），Main `37749675660` 三平台及 Secret scan `37749675621` 全部成功；本 owner 不重新轮询 CI。Own dependency-only merge 为 `0184eb77d14eea1ee2ca21335f8d317b6f33ed19`，没有修改其他 checkout/index/branch。

原 source commits `7d64103cc89474675119740d75a20a8b937fc6cc`、`d501e4f8291d0e88cf5fcd0faa2a545bb29da0d7`，preflight `6442d6f2ede0c61f5f3fe2a23f9d43f7a5e1fc7c`、`8f18620bbc28278cde20c2dbda5423cbe259dc00` 全部保留。Source81 独审与计划尾段独审 CLEAR 复用，未再获取或解析 raw、重做 A sanitizer/projection/source audit 或重复 preflight baseline。原 fixture 68630 LF bytes / SHA256 `443e7defac512d8f1ce87a50c0d353ff3930c85f321a859fea25dff7a66fbe69`；整目录相对 `8f18620` diff 为空。

## 最小实现与实际新问题

Private `collectPlainScriptedIdentifierRun()` 加入既有 `replaceScientificRuns()` DOM traversal：直接 text 末尾单 ASCII 小写 base、直接单 text child SUP2、直接 text 起始至少两个 ASCII uppercase suffix，并核两端完整 Unicode `L/N/M/_` lexical 边界。未知 sibling/comment、空白、wrapper、mixed/nested SUP、额外 attachment 与 opaque MathJax/equation/code/math/dollar/backtick/fence 保持边界；typed citation SUP 可作为独立后继。Constructed q²MODEL 保持同形关系，没有 article/rSCAN allowlist 或泛函意义推断。

整体 range 沿用 `replaceRangeWithScientificMarker()` 与 `range.tex`，保留原 base、SUP、suffix case 和无间隔 attachment。Body/caption/H3/H4 使用同一源角色；无第二 parser、全局 Markdown 修补、heading formatter、validator/security/writer/dependency 改动。

首轮实际 cache 发现 Quarto heading identity 的新增问题：原 marker 在既有 `buildCrossReferences()` 的 label/slug 派生中变为 `academicclipperscientificrun2x` / `academicclipperscientificrun6x`，四 validators 仍通过。首轮 Quarto output 保留作证据。Root 接纳 narrow source identity handoff 后，仅新 collector 返回原 plain `sourceText`；既有 range 存储该可选字段，既有 `buildCrossReferences()` 仅用有此字段的 run 替换 heading text 中的临时 marker。其它 collectors 不获得此字段、不改变行为；不重排 semantic pipeline 或重写 slug 规则。原 Sec7/Sec33 的 label 分别为 `Validation through experimental matching and r2SCAN` / `r2SCAN`，anchor 为 `validation-through-experimental-matching-and-r2scan` / `r2scan`。Permanent controls 明确核完整 label/anchor 及 case-insensitive marker 零泄漏。

## focused 实际执行与 harness 修正

命令 `node --test test/nature-materials-identifier.test.mjs test/nature-materials-identifier-boundaries.test.mjs`，Windows Node `v24.14.1`。两文件 registry 为原 source suite33 + constructed boundaries58，共91。

首轮91 = 87 PASS / 4 FAIL，exit1，1634.8514 ms，0skip/cancel/todo。58 boundaries 全 PASS，target body 与全部6 heading attachment/math/其它 validators PASS。三项 caption harness 用 literal `Validation by r` 找行，不能匹配正确的 `Validation by $r...`；改为保持源 cue `Validation by `。新 whole scientific array 断言误当11为所有 retained ranges：原 References prefix 中还有 ref3 的既有 `<i>T</i><sub>c</sub>` 与 ref29/ref43 的同形原 r/SUP2/SCAN。纠正为完整 source array14 = target11 + 原 reference roles3，永久源 DOM 断言分别核 ref3 和 ref29/ref43；没有删 reference、按 output 发明 scholarly role 或给 References 硬编码排除。

生产 sourceText 修复与真实 source/prose/identity assertions 稳定后，必要 focused 再运行一次：91 PASS / 0 FAIL，exit0，1520.2196 ms，0skip/cancel/todo。没有重复预实施48/10 RED 或生成新矩阵。每轮真实 source clips 恰3（markdown/links/quarto），同轮其它 assertions 共用 lazy cache；另3个明确 synthetic clip controls。两轮记录独立，不能混称仅一轮 clipping。

最终15 context×dialect assertions 核完整原 paragraph text、punctuation、scientific attachment 和全部 Fig2 panel prose；6 heading assertions 核完整文字/level/script。Source11 = body/caption9 + H3/H4各1；每方言附件 count 为1、1、3、3、1、1、1。Final source 行位置（1-based，按 main/caption/H3/crystals/H4/methods/data 顺序）为 markdown `23,33,37,39,51,53,59`，links `23,34,38,40,52,54,60`，quarto `24,32,34,36,42,44,48`。

四 production validators、scientificFragments、display0、精确 warnings 全 GREEN；完整 source metadata（cache-only 与原 source baseline逐字段相等）、6ordered creators、43 ordered references/DOI/keys 与 Bib bytes、7 ordered citation clusters、完整 Fig2 caption/image/位置/Fig2d target、三条 data URLs、rights source与两 heading identity 保留。最终不含 case-insensitive `ACADEMICCLIPPER` 临时 marker。原 unit `11 meV atom−1` 在完整 main prose 等价检查中保留；ordinary words、numeric/unit powers、Unicode code、typed math/citation、Unicode lexical拒绝均通过。#65 accepted 修复使原 ref2 `(0<x<-1)` rawHtml 真实 GREEN；#67 p42 coverage仍属独立 fixture/C delta，本 projection没有它，不能声称整篇 Materials 或 Issue #10 完成。

## 网络与资源生命周期

两个模块 before hook 在实际 parse/clip 调用前安装 global fetch 和 Node DNS callback/promises guards，并 `syncBuiltinESMExports()`。任何 attempt 在 throw 前入 ledger；独立 after hook 检查整个 ledger，即使 catch 也会失败；finally 恢复所有原函数并核 exact identity。Source parse 改为 guarded before，真实 clips 在 hooks 内 lazy cache；关闭持有的 source DOM，constructed parse 在每次 finally 关闭 DOM。

两轮各自 receipt 均为 source `realSourceClips=3, syntheticClips=3, attempts=[], restored=true`；boundaries `constructedParses=58, attempts=[], restored=true, newRealClips=0`。Writer 证据是实际 `clipNature()` 路径，测试未 import/invoke writer；没有伪造一个未 spy 的 writerCalls 计数。Fixture无 tables/resource，但 runtime guard 仍真实覆盖实际 clips，不能仅用静态零 table 替代 ledger。

## 外部证据与接下来 gate

External root `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue68-production-36c/`；`final-focused/` 是最终同轮 cache。下列 hash 为实际 physical bytes（log来自PowerShell，不能混称 Git LF）。

| artifact | bytes / SHA256 |
| --- | --- |
| `focused-first.log` | 10034 / `bbed318c4b62bcc912d53a09c49bd9a193c76a8c7a89a5e995fbfa913d6dddf5` |
| 首轮 `identifier.quarto.md`（marker-derived IDs保留） | 5780 / `7ebcbd91c742d0182ebaed056cbcb7189f57c6114f173e0851a8d320cb08646e` |
| `final-focused/focused.log` | 6572 / `70f43e8eb3c73780c34acfc0c7d10eccfb84e68592bfd39cc362c9368ac7bb6c` |
| `final-focused/actual-three-dialects.json` | 88472 / `27173a62d70176cace6802d233a56367269b6dbbd8742c87990b479a51abbb0f` |
| `final-focused/identifier.markdown.md` | 14731 / `7555923216bc924712610ee294d152e53c1aac7302a664262132459ff5ddf0b3` |
| `final-focused/identifier.links.md` | 15604 / `5285e3682e20a1f14bdc06cdf89ae9d86ea2227a526c29858360f1522a5509e5` |
| `final-focused/identifier.quarto.md` | 5732 / `b48692dc19a0a37b5228aaf550faf5af8d324917f1948e7c61a7ca696ca005e0` |
| `final-focused/source-guard.json` | 156 / `27ff266dea1a6a7381e623e006cea4f57a852e1505cf1ca213c8586a9d2304d8` |
| `final-focused/boundary-guard.json` | 89 / `fd2d9c215054112800460b55208d5178ae0cad47644b5c03eff1c0f9e0081825` |
| `final-focused/focused-receipt.json`（cache-only metadata/positions/hash） | SHA256 `39cce8ff649a4f9cddbae2b910af0646b72243b35db48b5d5f600cfd9f8f107c` |

本生产 authored diff仅 Nature、两个 focused test 文件及本 durable 文档；source fixture/provenance/rights、canonical/PRD/EDD、A/B/C contracts、normalizers/validators、security/writer、package/lock/golden 均未修改。Diff/status/filenames检查由最终 checkpoint给出 exact commit SHA，不在文档中构造 self-reference。

Root 安排的不同 owner 已在 immutable `976f4798da464bb4b69115259f05ff1d2cf25685` 完整独审并报告 `IMPLEMENTATION_CLEAR` / blocking findings = 0，特别核 sourceText→heading identity、完整 ranges14 的 source归属、零 marker/网络、Refs/Bib/Fig2 与三方言 source11。保存于 `<TEMP>/academic-clipper-issue68-implementation-review-976f479/implementation-review.md`（7664 bytes / SHA256 `c3e69ac038c54304edd35f801e11b46fa4b47c43da051156033a4a55dcd2e0c3`）和 `.json`（175752 bytes / SHA256 `2ee8d48669b53a72582fc32c0e571e2aafc3fe2bb2f9455b6cf967f5bade8666`）。Reviewer 仅执行3个事先限定的新 synthetic parse probes，3 PASS，663.3904 ms，parses3/closedDoms3/attempts[]/restored=true；没有重复 source81、作者91、raw/source clips 或 broader gates。本 owner已实际读取报告并核 hashes，随后按 root 释放执行下列验证。

## broader 验证与最终交接

所有4 gates 的 code/test head 都是 `976f4798da464bb4b69115259f05ff1d2cf25685`，Windows Node `v24.14.1` / npm `11.11.0`。原 lock/dependencies 未变，复用已有安装；本 prerequisite 不重新 `npm ci`，fresh 三平台 CI 及最终 integrator 的规范验证仍须执行它。未运行 live clipping、未重新获取 raw/source、未重做 source81/A/C audits 或另跑作者91；唯一 full run 正常包含这两个 focused 模块。

必要 affected 命令如下，覆盖原 Nature 各 collectors/markers、headings/captions/citations/refs、tables、normalizers/validators、DOM/writer lifecycle、transport/security；排除另已通过的两 identifier focused 文件。

```text
node --test test/nature-adapter.test.mjs test/nature-caption-citations.test.mjs test/nature-compound-unit-boundaries.test.mjs test/nature-compound-unit.test.mjs test/nature-greek-subscript-boundaries.test.mjs test/nature-greek-subscript-context-boundaries.test.mjs test/nature-greek-subscript.test.mjs test/nature-isotope-mass-boundaries.test.mjs test/nature-isotope-mass-coverage.test.mjs test/nature-isotope-mass.test.mjs test/nature-literal-brackets.test.mjs test/nature-reference-literal.test.mjs test/nature-scientific-citation-boundaries.test.mjs test/nature-scientific-citations.test.mjs test/nature-scientific-units.test.mjs test/nature-sparse-figure-alt.test.mjs test/nature-split-power-boundaries.test.mjs test/nature-split-power.test.mjs test/nature-styled-adjacency-boundaries.test.mjs test/nature-styled-adjacency.test.mjs test/nature-table-caption-clip.test.mjs test/nature-table-caption.test.mjs test/nature-table-mathjax.test.mjs test/nature-table-notes.test.mjs test/output-quality.test.mjs test/stability-regressions.test.mjs test/network-boundaries.test.mjs test/infrastructure-hardening.test.mjs
```

| gate（各执行一次） | closed result / test duration / whole process duration |
| --- | --- |
| 上述 affected 28 files | exit0；695 PASS / 0 FAIL；12904.4599 / 12964.9669 ms；skip/cancel/todo0 |
| `npm test` | exit0；980 PASS / 0 FAIL；96003.2132 / 96382.9803 ms；skip/cancel/todo0 |
| `npm run build` | exit0；394.6053 ms；extension 生成于 own ignored `dist/` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0；382.0513 ms；math/scientificFragments/structure/rawHtml/crossrefs全部valid；13 display、50 references、Table1结构保留 |

Full 的两个模块 runtime receipts 仍是 source `realSourceClips=3, syntheticClips=3, attempts=[], restored=true` 和 boundaries `constructedParses=58, attempts=[], restored=true, newRealClips=0`；这是必要 full 的新同轮证据，不同于此前 focused。Writer 的零调用声明继续只适用于实际 identifier `clipNature()` 测试路径；broader/full 中的既有 writer tests 明确调用临时目录 writer，不可声称整次 full writerCalls=0。网络 evidence 同样限定新模块 guarded ledger与既有 mocked transport tests，不构造未监测全部进程的全局网络计数。

External root `<TEMP>/academic-clipper-issue68-broader-976f479/` 保存完整 closed stdout/stderr logs、每 gate receipt 与 `full-source/` 同轮缓存。每个 receipt 记录 exact command/head、start/end UTC、exit/signal、process/test durations、全部34 source files 和相应 execution test 的 Git blob/physical bytes/SHA256（full 为全部42 tracked test modules），并逐项核9个 golden tracked files 的 before/after Git/physical identities相同；未触碰 shared node_modules 或其它 owner outputs。

| physical artifact | bytes / SHA256 |
| --- | --- |
| `affected.log` | 94799 / `40bd40022e79c90f6b0c0afcdf5ae4c9522d59ffade857a847da7be9da0387eb` |
| `affected-receipt.json` | 32391 / `fd0a6b62aed396d560e95718f7c69e75a91440b6a87233b073958a42148d5d2d` |
| `full.log` | 117119 / `8da1f1616ff4f04201173e551c815a69058b243d9a92ac7c86d9358b6b6e6f42` |
| `full-receipt.json` | 36705 / `4703cf7f5a6d969ddb8a5006a2ab4bef3e52d79f0a1ec16e32de54756627470b` |
| `build.log` | 167 / `b1d781eb0f5e40970d0b6f0923efb863c6aa02516e42c9f665aa4ca6cfa17263` |
| `build-receipt.json` | 19661 / `e460dba4d3479448b507342f0c6cb6fac5856d15080f21399d0628b6357794a7` |
| `golden.log` | 2893 / `a5117f116c1d285880129194d874ffe7812eaa6bd8634838524e53bfa131dbfe` |
| `golden-receipt.json` | 19741 / `63d242afba793804b23c3576a65a5d1e311bb03623659a3ebcb95a909a5217a2` |

Broader gates 未发现产品失败，因此 implementation/两个测试/source均不再修改。最后提交仅本 handoff 与 README 窄 identifier/原 H3/H4 identity 边界说明；不为这次 doc-only 更新重复解析/clip/tests。最终 publication head、ordered commits 与完整11-path diff 由 PR 和 root 的外部 publication receipt给出，避免本文件 self-reference。全部 tracked scope、diff-check/status/filenames、科学 fixture身份与受保护路径继续检查。

唯一 prerequisite bug PR 使用 exact standalone `Refs #68`，不分摊 final Issue #10 PR责任。本 owner不 poll CI、merge 或手动 close；root 在 fresh Ubuntu20/24、Windows24 与 Secret scan 全绿和最终 immutable publication review后核十项gate，再执行获授权的 prerequisite merge。Merge仅接纳代码，successful merged-commit Main CI 才由automation完成 Work Contract。#67 p42 不在本 fixture，literal SUP code的既有独立诊断也未扩入；本结果不宣称 whole Materials、全部未知标识符或 Issue #10 完成。
