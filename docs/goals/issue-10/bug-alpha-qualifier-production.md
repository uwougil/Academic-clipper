# Issue #71 — 完整 qualified metric 的生产定向验收

状态：**LOCAL_GATES_GREEN / 等待最终 publication head review 与 fresh CI**。完整指标与原95下标的三方言回归、独立 implementation review、affected/full/build/read-only golden 已通过；PR CI/Secrets、合并和 merged Main 接纳尚未完成。本文不声明 Issue #71 已完成，也不声明 Issue #10 完成。Work Contract：[Issue #71](https://github.com/uwougil/Academic-clipper/issues/71)；来源历史及已清除的 source/plan gates 见 [source handoff](bug-alpha-qualifier-handoff.md) 与 [preflight](bug-alpha-qualifier-preflight.md)。可重建机器证据见 [production receipt](bug-alpha-qualifier-production-receipt.json)。

## 接纳依赖与固定代码

- 本轮 accepted main：`4e8dcd9ce4998c3f8f373daecf332e7f9bfcfb74`。Root 正式释放时报告 exact merged Main `37764888330` 三平台 SUCCESS，Secrets `37764888340` SUCCESS、Issue #68 automation completed。Author 不轮询或重复运行 CI；接纳门由 root 管理。
- 同分支 preflight head：`5841be890004706e4e48b1ee7675b17db656189e`。
- Dependency-only merge：`7f957a38a3a045ae2e61d9c009edba38641c8451`，只接纳上述已通过 Main CI 的状态。
- 实现与必要测试 commit：`bba4ea72864326eb781ac4bf493d17b9d8f8becf`，tree `a61c6cec3954ddbab09bb1c52b5fda4ee2746a5a`。
- Branch：`codex/issue-10-bug-alpha-qualifier`；worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-alpha-qualifier/academic-clipper`。

固定代码只改五个 owned files：`src/adapters/nature.mjs`、原真实 source test、28-case boundary test、三项 pure-string oracle test及其 test-only helper。机器 receipt 列出 base 之外所有 author ordered commits；此后的 production handoff/receipt 是 DOC_ONLY，最终 SHA 由交接消息精确报告，不嵌入文档自身尚未产生的 SHA。

## 根因与最小实现

原 plain `r.m.s.d.` + native SUB95 未作为一个 typed range 保护。Defuddle/math 阶段尚有完整原 DOM，academic-inline 随后得到 `r.m.s.d.$_{95}$`，四处95成为没有基底的孤立下标。PRD §3、EDD §2.3–2.5及 Issue #10 §7 要求保留科学上下标关系；这是已有明确合同下的 implementation bug，未证明历史 introduction commit。

Nature 新增 private `collectQualifiedMetricRun`，共26行生产 diff，只接受同一 parent 下整个 literal `r.m.s.d.` 紧邻单个 plain-text SUB95。Unicode L/N/M/_ 在完整左 prefix 和右词界均阻断；节点边缘存在未知 sibling/comment、SUB wrappers/混合 children、额外 script、未知右节点、opaque code/math/MathJax/equation及跨 sibling 的 literal delimiters均拒绝。两种既有 typed citation SUP 保持独立，不吞入 metric。

返回现有 range 的 `tex='\\mathrm{r.m.s.d.}_{95}'`，复用既有 scientific semantic marker与后续 normalizers/renderer。不添加 heading architecture、semantic field、全局 Markdown 修补、通用 all-SUB/plainword classifier、article-ID 分支、第二 parser 或网络路径。测量值0.96/2.8/1.5/3.5与 Å 留在 atom 外；95仍是原定义的95% residue coverage qualifier。

## 原证据复用与来源不变

独立 SOURCE_PROJECTION_CLEAR_ONLY 与最终 PLAN_TAIL_CLEAR 均复用，source58/raw/A helper/sanitization/source3历史 clips/28历史 preflight/历史缓存诊断本轮不重复执行。继续消费 A blob `e56f140d9756bb83013b9df0716dc650e04d7917`、sanitizer1.1、recipe/serializer/schema/projection1.0 的既有冻结输入。

真实 excerpt仍为24257 LF bytes，SHA256 `696660069bd881a163722fc020b22d0f6af5cc3387decacfd8c78789574ef634`。完整 Main p2四role/原邻文、95% confidence intervals、全部34 ordered creators、完整Fig1/panels/Nseq/Nres、MOESM1原external fragment、CC BY4.0原notice/footer、reference prefix0与全部 provenance/recipe/oracle/diagnosis文件保持 Git bytes不变。没有新 live acquisition、credentials、raw capture或图/PDF下载；资源声明 `[]`。

原 source/plan RED证明与其 harness 分类仍在原 handoff。本轮没有篡改 scholarly input、缺失值或 source oracle。生产 receipt 对所有七个原 fixture文件给出 immutable Git blob/hash及 physical身份，逐项 sourceQuiet=true。

## 必要定向运行与首次失败

两轮均使用 Node `v24.14.1` / `C:/nvm4w/nodejs/node.exe`。外部证据根为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue71-production-4e8`；所有完整 Markdown与actual cache只在外部 Temp，不进入 Git。`node_modules` junction只读取既有 dependencies，不通过它写入或安装其他 owner文件。

首轮 wrapper `node <external>/focused/run-focused.mjs` 实际执行三项明确 test files，**exit1，43 tests /36 PASS /7 FAIL，1091.0887ms，0 skipped/cancelled/todo**。四个 metric正例、全部Unicode/typed citation guards及 markdown真实三类 assertions已PASS。七项是测试 harness failure：六个 links/quarto context/attachment/rawHTML failures源于 author过早关闭第一 actual clip window，Defuddle缓存的 DOMParser仍绑定那个窗口，后续转换报 document null；另一项 mixed matrix没接受原有 `N_{\\mathrm{res}}` role 的等价表示。原 log/result/receipt/wrapper全部保留。首 wrapper仅识别 TAP summary，但默认 spec reporter输出 informational summary，所以其原 receipt.summary={}；上面的实际计数从保存log读取，不修改原receipt补造数字。

仅修正测试：全部三方言转换完成后在 finally关闭三个 actual parser-owned windows；test-only helper对独立 inherited Nres role接受精确 `N_{\\mathrm{res}}`，这与已接纳 `scientificTex` 的 roman多字母 SUB政策一致，不改95 matcher、不删除 braces或合并 `_9`+裸5。三项 pure-string controls增加这一等价表示保护。生产代码在两轮间完全不变。

修订后必要 final wrapper：

```text
node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue71-production-4e8/final-focused/run-focused.mjs
```

实际子命令：

```text
node --test --test-reporter=tap test/nature-alpha-qualifier.test.mjs test/nature-alpha-qualifier-boundaries.test.mjs test/nature-alpha-qualifier-oracle.test.mjs
```

**exit0；43/43 PASS，0 FAIL/skipped/cancelled/todo，1021.2667ms**（process wall1060.33ms）。Registry：真实 source12 tests、合成 boundary28 tests、pure strings3 tests。实际3 real-source wholeclips，一次/style；35 synthetic parse calls，0 synthetic clip calls；另1 source JSDOM用于原 fixture contract check，不重复 sanitizer/raw/source审查。

此前第一RED阻断的 assertions现在全部执行：两种 citation cues数字/角色分离；mixed body/caption完整 ordered runs/非零 marker identities/恰一次/native位置/原测量值；真实三方言完整段落、每处测量值与 Å在atom外、四qualifiers、完整Fig1 caption exactly-once、Nseq/Nres原角色与完整有序6-run registry、零临时 markers、全部metadata/authors34/外链/精确 warnings/所有 production validators。完整 source paragraph在最终 Markdown的行号是markdown51/links51/quarto52。

## 零网络、生命周期与身份

两 test模块均在 before/dynamic生产 import及任何 parse/clip之前安装 record-before-throw fetch、DNS callback与promises的 lookup/resolve/resolve4/resolve6/reverse guards，同步 named exports；独立 after ledger在测试失败时仍执行，finally恢复原函数identity。source test观察现有 `installDomGlobals` assignment得到actual3windows，完成batch后全部关闭，最后精确恢复原10项 DOM global descriptors；另 source DOM1 opened/closed。Boundary模块35 DOM opened/closed。两份 ledger均 `{http:[],dns:[]}`，restored=true。不以吞掉 throw、process exit或空本地 ledger充当证明。

Writer证据限于实际调用路径 `clipNature` → existing production rendering/validation，未调用 `writePaper`；没有 runtime writer spy，不声称整个 broader suite零 filesystem活动。

| Final external artifact | bytes | SHA256 |
| --- | ---: | --- |
| focused.log | 12885 | `9595330cdd0354d5a7b9542efa6f5adc7ff3def8971dc0a90a2927b6722d6e03` |
| focused-receipt.json | 5393 | `1a1d42fc309599911449b6be13549c665f5850e218100ba5affacb426324b8d7` |
| source-guard.json | 250 | `5378c87ca9acdfc0ad299f7e48b92346f7b03be03401131998fbbf7c838db289` |
| boundary-guard.json | 131 | `03a24a2c860ebcf2a35b9974495b89119082ce77a868dff0f590a39807f0e67d` |

三份actual缓存/Markdown的sizes与hash、首轮全部证据、精确env/command/runtime/time、原始fixture身份和最终每份四 validators状态均在机器receipt；不提交全文Markdown snapshot。`node <external>/write-stable-receipt.mjs` **exit0**只读取同run evidence与Git/physical bytes构建交接，无新 parser/clip/source audit/test。Git LF 与 Windows physical CRLF分别记录：Nature Git55594 bytes/SHA `e85dfae9fa9c51fee7df32ca7fc383b20df99b2145367d0aa5dc95f16fa5b7af`；physical56927 bytes/SHA `4a2b33fbdaa33b01bf0b7b75a0c01407844873f9f0b671fb131e821d762b7a07`，只有换行差异，不把二者混为同一hash域。

## 独立审查与已结束的 broader 验证

不同 owner `/root/alpha_qualifier_implementation_independent` 对固定 `039fc5daf47da4aa0e34e22cee0055a21e672c1e` / tree `d978e830c05b748369d530bb896091644b242f26` 给出 **IMPLEMENTATION_CLEAR，P0/P1/P2/P3 blocking均0**。实际读取26行生产diff、三个tests/helper、七个source身份、原始/最终focused收据及三方言缓存；没有追加probe/source审查或测试。外部 `implementation-review.md` 7083 bytes/SHA `7b8cfa08b5c9fead5481f7ae0ddb7af06dadc696aa2819b068e055bf13ee59b2`；machine40302 bytes/SHA `ba090b42f1125b9a7f30d6c26b8af1e2e23199610d742901e469468f44bf0eed`。

Root释放broader后，下列各阶段已结束，均 Node v24.14.1、同一上述head/codebba4。外部证据目录 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue71-broader-bba4ea7`，原wrapper/receipts/logs保留。

| 已执行命令 | 实际结果 | 测试 / process 时间 |
| --- | --- | --- |
| `node --test --test-reporter=tap` + receipt明列28个affected files | exit0，760/760 PASS，0 FAIL/skipped/cancelled/todo | 10019.6027 / 10065.2429ms |
| `npm test` | exit0，1024/1024 PASS，0 FAIL/skipped/cancelled/todo | 80098.308 / 80462.48950000001ms |
| `npm run build` | exit0，extension构建成功 | 362.7526ms process |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0，四validators与scientificFragments全部valid | 379.418ms process |

准确affected files与命令参数、四次start/finish时间、receipts/log hashes在机器production receipt `broader.phases`，没有使用模糊glob命令充当实际记录。Canonical full只执行一轮；完整spec reporter log/summary与terminal收据支持1024通过。

| Phase | receipt bytes / SHA256 | log bytes / SHA256 |
| --- | --- | --- |
| affected | 121389 / `33807ad6724a0943c6f1e2b704accddbfb7109f227d34fe88fd064e7c0bde82c` | 193696 / `fef6a6659a977bfede348ac37548816b27bdeefe5b67bdbe5ab4adacc5f1abe6` |
| full | 120269 / `fc52b399e30c64edc28c327760b497cec3b9ca2deb42da780841f7f08751fc60` | 124350 / `5b9d9f788d2852430359dd29b584121bda6f3dde6605927d0c9b2702b7c2eba6` |
| build | 119811 / `764ffae93f0ed55ed6c119cef9b7aea59af9a34cd2ac6f39c9daab62887ba14b` | 167 / `bf0d10be2634028ba22eabad6c6b1ecc40dc634e0b88fdddae8fa96bd44ef340` |
| golden | 119935 / `1ff7c0c88b3a2c778b3476bcb72f1951c4f79e47da2ac6f14a9d1160c8c48da5` | 2893 / `a5117f116c1d285880129194d874ffe7812eaa6bd8634838524e53bfa131dbfe` |

所有248个tracked src/test/package/lockfile/golden runtime输入在每个阶段前后不变。恢复只读复核当前index blob与physical bytes仍逐项匹配248份身份；全部9个golden tracked artifacts不变。四个阶段没有fixture/recipe/oracle/golden变更。Build只写既有ignored dist。

全量测试还生成自身 source/boundary guard receipts：真实3clips/3clip windows与1sourceDOM全部关闭，35synthetic parses/35DOM关闭、0synthetic clips；HTTP/DNS attempts均[]、restored=true。各style full-cache Markdown身份与稳定focused输出相同。此guard证据仅覆盖新增qualifier模块；整套broader的network/writer证据限于已有accepted security/mocked transport tests，不宣称whole-suite writer/network spy。

`publication-recovery.mjs` 只读已有四份closed receipts/logs/248inputs/golden与独立报告hash，并更新这两份owned docs。新tests/build/golden/source audits/raw reads/production imports/parses/clips/probes/installs/CI polls均0。现有committed-lockfile依赖复用，本地未追加npmci；fresh CI必须执行clean install。

## 下一道门与消费者条件

Author交接前执行 `git diff --check`、tracked filenames/status/diff范围审计，最终改动只是这两份production handoff/receipt，source/production/tests unchanged。下一步发布独立 `Refs #71` prerequisite PR；root必须核对最终DOC_ONLY publication head、fresh三平台CI与Secrets，再按全部十项gates接纳，successful merged-main才完成Work Contract。Agent C只能在merged-main接纳后对其原Alpha合同独立执行四role三方言与caption/metadata/warnings/resources验收。此PR不交付Issue #10，也不完成Issue #10。Spec/意图变更提案：无。
