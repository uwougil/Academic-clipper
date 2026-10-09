# Issue #74 — 括号化学分组 focused implementation handoff

当前为 **BROADER_CLEAR_PUBLICATION_READY**。真实18项与全部synthetic44项在当前实现62/62 PASS，不同作者exact-head IMPLEMENTATION_CLEAR、blocking0；本轮唯一affected/full/build/只读golden全部通过。历史首轮46PASS/9FAIL、pre-P2 55PASS和新增7项3PASS/4RED均保留。最终publication-head独审、fresh CI/Secrets、root十gate、merge与merged-main仍pending，不宣称#74或#10完成。

## 当前增量 — 独立P2嵌套范围修复

Different-owner原实现审核对 `13c6341b30094e935254f0d8ccf17635881c9bc0` 给出 `IMPLEMENTATION_CHANGES_REQUIRED`，P0/P1/P3=0、P2=1。外部报告与原guarded probe在machine记录exacthash。Synthetic `Ca(Pb(OAc)<sub>4</sub>)<sub>2</sub>`被内部suffix regex误接纳成单独Pb group，违反已审finite非嵌套family；原55绿色不覆盖该缺口。

生产增量 `101bd4cf40111433b92852913e364cb3bceb7807`（tree `d1d655976855871edea450bc32dc857ca1a32602`），仅 `src/adapters/nature.mjs` 新增7行与原synthetic测试新增7个永久controls。候选左侧同一direct-text/nativeSUB序列中，紧邻opening parentheses之前若是Unicode lexical token或原native count，拒绝内部suffix；右侧原element suffix/closing parentheses紧邻native outerSUB同样拒绝。没有跳过unknownsibling、flatten wrapper、元素查表或通用化学parser。普通正文 `(Pb(OAc)4, …)`、`(Fe2(ox)3, …)`的标点边界继续接纳，并有exact完整math/orderedmarker positives。所有7controls明确synthetic，不作为source admission或新增scholarly prose。

先在unchanged13c production、仅修改regression registration后执行 `CHEMICAL_GROUP_SYNTHETIC_SCOPE=nested-review`，只注册7new cases，不注册旧37/真实18。实际 `node --test --test-reporter=tap test/nature-chemical-group-index-preproduction.test.mjs`：PID42548、2026-10-09T00:30:14.140Z → 2026-10-09T00:30:14.829Z，exit1，7tests/3PASS/4真实RED，640.6915ms。2prose positives和CD suffix negative已PASS；4Pb nested cases错误whole-group interpretation。各negative比较ALL ordered scientificRuns；观察确认这些输入无既有atomic roles，不猜测或过滤。7actualwindows全部关闭，attempts[]且bindings/DOM descriptors复原。

最小fix后唯一fresh candidate：`node --test --test-reporter=tap test/nature-chemical-group-index.test.mjs test/nature-chemical-group-index-preproduction.test.mjs`，PID43956、2026-10-09T00:30:31.119Z → 2026-10-09T00:30:32.725Z，exit0，**62tests/62PASS/0FAIL**、1557.1207ms，0skip/cancel/todo。真实18包括3source whole-formula角色×3方言、4strictvalidators、完整measurement/isotope/compoundbold/citations/37refs/Fig2+3/MOESM1和精确warning；synthetic44包括原37与新7、全部orderedregistry/marker multiplicity、mixed nonzero body/caption indices、typedcitations、Unicode/unknown/opaque边界。

External root：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue74-nested-revision`；执行方式 `node <root>/run.cjs red` → 最小fix → `node <root>/run.cjs green`。Nodev24.14.1，实际argv/env/physical54inputs/pre-post/runnerhash在receipt，均unchangedDuringRun/current。Green source3clipwindows3/3关闭、sourceDOM2/2、11HTTP/DNSguardattempts[]/bindings及10DOMdescriptors复原；synthetic44parsewindows44/44、0clip/0sourceaudit、ledger[]且恢复。Writer仅staticcallgraph proof。既有ignoreddependencyjunction只读复用，无install/write-through。

Raw/A/source65/plan/sourceoracle/42pure/old26/tail53不重做。此次因productioncode改变而fresh source3clips与44boundaries是必要candidate验证；历史first46/9、pre-P2corrected55以及本次red7均未改写。本段记录focused交付时状态；后续P2复审与broader gate现已通过，见下方当前publication段。PR/CI仍交给root。

当前focused green外部artifacts：

| 文件 | Bytes | SHA-256 |
| --- | ---: | --- |
| command-inputs.json | 10029 | `c2d09f20ee8d6b2f2637f1eb212bc6cbe98ab5bc96dc597717fc00119d370f66` |
| exit.json | 9532 | `006449ebae6759450612bce1475d91e261241891bb2e8e02d517d3fe120acf01` |
| focus.log | 12961 | `533c37fea04b87be9e59ce70609b9c6175e0eb4c41f5e81921b9e4395369f1a6` |
| links.md | 18454 | `cfb7833a7d2e9d29da38100b7bdfb9bc4e3ee794bc1a5fb693085bcb9af7d955` |
| links.result.json | 156400 | `1a669060094a52a90675d43c9b4b583bba306e1c866e523e4b641e1d98367b47` |
| markdown.md | 17665 | `1378d9758092f396944bb2bd62fa9b29665cef57966312a9597e7e47dc542586` |
| markdown.result.json | 152414 | `3f207b5780695bd5fc82889fee655261d8ce833bfdb7b80e2dcb7ff8ddda9cb8` |
| network-ledger.json | 330 | `912eac19fcde4785e4c90992f9b60e1919fffcdf83402fd285b32e201382ee13` |
| process.json | 231 | `14b407f75979e1a90d0b980df1b40108f8544ca86b51c05cf99e8234c758f81e` |
| quarto.md | 9502 | `8fcc36bcf53fdf2a262b424fb436c45615c05be9e28aedeaa71265a5172216e7` |
| quarto.result.json | 136249 | `bb8ad6daf71b6fa9970cd5c9b433e69cc68390d27a42b3a26059fd091793ece6` |
| synthetic-observations.json | 21542 | `1eb94849cff9c9ab693d396827b0c6bdb8cf34c171dbcf39f96556dc8362432e` |

以下原阶段说明及55PASS artifact列表作为明确历史证据保留，不能代替本次62candidate或后续canonical full。

## 分支、基线与提交

- Work Contract：[Issue #74](https://github.com/uwougil/Academic-clipper/issues/74)；PRD §3上下标/语义保留、EDD §2.3–§2.5现有Nature/Defuddle/normalizer/strict validators边界。分类为已证明的implementation bug，不声称历史regression引入点。
- Branch：`codex/issue-10-bug-chemical-group-index`；worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-chemical-group-index/academic-clipper`。
- Root接纳的最新main：`497b303250d6918d58575f9b8df3fddaa43b7f2d`（#73 prerequisite合并后成功Main/Secrets，由root释放本owner）；dependency-only adoption：`8b10643e562b71697eaa4dba51dd955798254890`。
- 原source commits：`4871f9779ceddcad05afd724e7cede3433b245d5` → `dfd32f5b54b0f34f0de9571b492dadaff8692b3a` → `5d4347a532d8f349e354a220de36914d7716e084` → `8ddd4f1b806b9a72e3552d75070f30b5c919ac29`；preproduction `56f45db6962d512fd9ac82bc7aadef7a9cb696df` → reviewed tail `964f6436127b8d53d8e2ae7b9911552e37e465c1` → dependency-only adoption → production/harness `754c4d2889a0c6b46072cbccffbbe44e1b1381ef`（tree `10b4d334d2d05bd2741665e2d16a81822f145acd`）→ 本DOC_ONLY提交。最终DOC提交用 `git log -1 --format=%H -- docs/goals/issue-10/bug-chemical-group-production.md` 重建，避免自引用SHA。
- Production提交仅拥有 `src/adapters/nature.mjs` 和 `test/nature-chemical-group-index.test.mjs`。本次DOC_ONLY只新增本文件与[机器receipt](bug-chemical-group-production-receipt.json)。当前无PR；之后一个prerequisite delivery PR使用精确独立 `Refs #74`。

## 来源与复用边界

真实[article](https://www.nature.com/articles/s41467-023-44030-3)，DOI `10.1038/s41467-023-44030-3`。原Results p2的 `Pb(OAc)<sub>4</sub>`、Results p5的 `Fe<sub>2</sub>(ox)<sub>3</sub>`、Methods p0的 `(CD<sub>3</sub>)<sub>2</sub>CO` 是三个完整source paragraph内原native attachment；完整source positions/subtree hashes/rights/omissions/A版本见[原handoff](bug-chemical-group-index-handoff.md)。仍是9 ordered creators、37 references、Fig2/Fig3及MOESM1依赖；不下载image/PDF。

Excerpt 72722 bytes/SHA `a8c10a9e583c640a3adb41cf7a55f3c1a4d1a7f7b8f88b7d370afaa969c8079b`；provenance59160/SHA `428ffafc1558ba0b07dadd0f48f44f29bfebe9b603f1e87ec8af4a564b949887`。65-block原独立SOURCE_CLEAR_ONLY与最终964f的PLAN_ONLY_CLEAR均沿用未变输入，其报告hash在receipt。A helper34946 Gitbytes/SHA `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`、sanitizer1.1.0/serializer1.0.0维持；不重新source65审核/raw获取/A投影/旧26/tail53或42纯字符串controls执行。

原source corrected RED为18tests、6PASS/12trueFAIL、776.1531ms；原26 synthetic baseline18PASS/8RED、844.8042ms；review-tail53PASS为42纯字符串+11新增parse-onlynegatives、736.9922ms。历史结果保持原性质，不能当本candidate运行。Source oracle未改，test-only whole-formula helper1934 bytes/SHA `ec7cd2e84643b796ce1c72d39e7c49d976008a517b5caf445204ed0b67489b95`未变。

## 根因与最小实现

原adapter没有typed保护plain whole-parenthesized native chemical group，Defuddle后的outer SUB变成孤立math fragment，原strict validator正确拒绝。本次新增私有 `collectParenthesizedChemicalGroupRun`，复用existing range.tex、scientific marker、Defuddle与renderers；只消费完整合格direct text/native positive-integer SUB range。单个非嵌套group保留roman atom/ligand字体、完整prefix/suffix、inner/outer不同owner与源顺序。短lowercase ligand只在已有element-led prefix及原native prefix atomSUB时接纳；没有article/prose/formula allowlist或化学意义推断。

Unicode whitespace/punctuation边界（排除underscore）及parent起止、真正typed citation是允许的边缘；Unicode L/N/M/_和astral邻接、未知span/comment/wrapper、额外script、untyped anchor保守拒绝。code/pre/MathML/MathJax/equation与跨siblings的literal math/code保持opaque。一个完整range可能跨此前inner SUB，故既有loop在成功替换后以range.restartIndex返回range起点后的实际位置，保持之后registry的source order和非零shared indices，不另建marker列表。

初次candidate boundary漏接正文原标点 `(`，因此Pb/Fe真实roles各三方言以及三个math validators仍失败；CD role和全部37 synthetic已通过。修正仅恢复已独立审过的Unicode punctuation边界，源fixture/oracle/harness不改。原失败保存为 `focus-first`，不改写为GREEN。

原source harness改为guards先于动态生产导入、默认始终fresh三方言，无cache读取。Defuddle持有第一DOMParser时整个batch维持全部真实窗口存活，batch结束统一关闭，after检查ledger并finally恢复所有network bindings及10个DOMglobal descriptors。原18注册与全部科学/普通compatibility断言保留；sharedwhole-formula oracle比较exact完整math atom/Unicode token，不以readable flattening证明group。

## 实际focused命令与封存结果

外部根：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue74-production-497b`。Node `v24.14.1`，executable `C:/nvm4w/nodejs/node.exe`。实际argv：

`node --test --test-reporter=tap test/nature-chemical-group-index.test.mjs test/nature-chemical-group-index-preproduction.test.mjs`

Child-only env为 `CHEMICAL_GROUP_RECEIPT_ROOT=<root>/focus-corrected`、`CHEMICAL_GROUP_SYNTHETIC_SCOPE=all`、`CHEMICAL_GROUP_SYNTHETIC_RECEIPT=<root>/focus-corrected/synthetic-observations.json`；移除 `CHEMICAL_GROUP_CACHE_ROOT` 与 `CHEMICAL_GROUP_SNAPSHOT_ROOT`。精确参数/env/current physical input hashes及pre/post身份全在receipt。

| 实际执行 | PID | UTC start → finish | Exit / tests | TAP duration |
| --- | ---: | --- | --- | ---: |
| focus-first | 52188 | 2026-10-08T23:46:02.021Z → 2026-10-08T23:46:12.088Z | 1 / 55：46PASS、9FAIL | 10021.3853 ms |
| focus-corrected | 51632 | 2026-10-08T23:46:43.543Z → 2026-10-08T23:46:45.260Z | 0 / 55：55PASS、0FAIL | 1671.3758 ms |

两次均0skip/cancel/todo。Corrected真实18项覆盖3source roles×3方言、4unchanged validators、bold sequence、ordinary counts/6NMR isotope atoms/原measurement、typed citations与37references/bibliography、Fig2/3/MOESM1与exact warning `No equation nodes were detected.`。没有table/display equation。Synthetic37比较全部ordered scientificRuns+完整TeX/marker唯一性，包括mixed body/caption全部8roles的shared indices0–7、existing inlineMath与2typed citations。

Corrected real3clip windows打开3/关闭3，source DOM2/2；11HTTP/DNS guarded methods，attempts `[]`、restoredBindings/restoredDomGlobals均true。Synthetic37actual parse windows37/37，0clips/sourceReads/sourceAudits，独立HTTP/DNS ledger `[]`且bindings/descriptors恢复true。Writer proof是 `clipNature` 返回模型而未调用writer的static callgraph，不声称writer spy。

复用own ignored junction只读dependencies，实际resolved `C:/Users/guoli/.codex/worktrees/issue-10-bug-reference-literal/academic-clipper/node_modules`，没有install/write-through/升级；lock/package/golden/source与54项实际run pre/post及当前physical身份相等。Git LF与physical CRLF身份分别记录，不混淆。此恢复仅读闭合证据并写两docs/提交，0新增test/parse/clip/sourceaudit/A/install。

Corrected外部文件身份（first全部文件同样在machine保留；不提交生成Markdown/full result）：

| 文件 | Bytes | SHA-256 |
| --- | ---: | --- |
| command-inputs.json | 10086 | `6f04e8d21d61f263e65751da9e2b055c36bc6176cc92eb3369ac9b3860ae0af5` |
| exit.json | 9584 | `8fa4e4cd6f38d2bbf15a7a85b4a5420b639991a703f21e92dadb3b4fe8e5b231` |
| focus.log | 11481 | `87d2d609b804b545da1ffc9a3c8f7f61388d9ddab4942336035048fd6fc2b606` |
| links.md | 18454 | `cfb7833a7d2e9d29da38100b7bdfb9bc4e3ee794bc1a5fb693085bcb9af7d955` |
| links.result.json | 156400 | `1a669060094a52a90675d43c9b4b583bba306e1c866e523e4b641e1d98367b47` |
| markdown.md | 17665 | `1378d9758092f396944bb2bd62fa9b29665cef57966312a9597e7e47dc542586` |
| markdown.result.json | 152414 | `3f207b5780695bd5fc82889fee655261d8ce833bfdb7b80e2dcb7ff8ddda9cb8` |
| network-ledger.json | 330 | `912eac19fcde4785e4c90992f9b60e1919fffcdf83402fd285b32e201382ee13` |
| process.json | 326 | `24f9661b551d5aaae01794b581a6e552e5facacf13600c6ec913a3e472ab1149` |
| quarto.md | 9502 | `8fcc36bcf53fdf2a262b424fb436c45615c05be9e28aedeaa71265a5172216e7` |
| quarto.result.json | 136249 | `bb8ad6daf71b6fa9970cd5c9b433e69cc68390d27a42b3a26059fd091793ece6` |
| synthetic-observations.json | 18304 | `ff1e3d2a24b162e647651c88852c4daee7a43ae6fce7f7c45cbe97c4fd33b94d` |

## 尚未完成的gate与消费者

不同作者对clean `5c307ccb4424b7b8feab5bba6fc2f25cacf7d464` / tree `3886a8dc5942d4c1fea38aa55d1df7b5651ef279` 完成P2增量复审：IMPLEMENTATION_CLEAR，blockingFindings=0、P0–P3均0。Root完整读取后释放broader；本轮affected/full/build/golden已经全部完成。随后仅两个production handoff/receipt DOC路径publication与一个精确独立 `Refs #74` PR；最终publication-head独审、fresh三平台CI/Secrets、root十gate、match-head squash merge及merged-main成功接纳仍必需。Author不CIwatch、不merge、不manualIssueclose。

Agent C必须等#74 merged-main接纳后消费原B whole Chemistry，#73独立Δ修复已在accepted main；本minimal excerpt的55PASS不证明current wholeChemistry/255corpus通过。范围不扩展为nested/wrapped/fractionalcounts/charge/hydrate/generalchemicalparser。B/C/D、validators/security/writer、dependencies/golden、canonical/PRD/EDD都未改变，无specchange proposal。Merge仅接纳代码，成功merged commit Main CI与既有automation才完成Work Contract；Issue #10保持未完成。

## 当前broader与publication证据

外部根：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue74-broader-101bd4c`；Node `v24.14.1`，wrapper PID52808，唯一exec session31857。Affected 36个现有Nature/网络边界/output-quality/stability文件，明确排除本Issue两个Nature focus文件与纯字符串helper测试；随后canonical `npm test`真实执行全部测试。复用ignored own junction已安装依赖只读，不install或write-through。每tier完整argv/env/PID/UTC/日志hash、289个tracked src/test/fixture/extension/scripts/package/golden pre/post bytes/SHA在machine receipt，全部一致；9个tracked golden文件不变。

| tier | 结果 | UTC start → finish / PID |
| --- | --- | --- |
| `node --test <36 existing files>` | 967/967 PASS，11034.4801ms；0fail/skip/cancel/todo | 2026-10-09T01:22:47.917Z → 2026-10-09T01:22:59.027Z / 21960 |
| `npm test` | 1285/1285 PASS，80628.2398ms；0fail/skip/cancel/todo | 2026-10-09T01:22:59.049Z → 2026-10-09T01:24:19.937Z / 11304 |
| `npm run build` | exit0 | 2026-10-09T01:24:19.958Z → 2026-10-09T01:24:20.213Z / 44680 |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0 | 2026-10-09T01:24:20.233Z → 2026-10-09T01:24:20.490Z / 4900 |

只有full设置 `CHEMICAL_GROUP_RECEIPT_ROOT=<根>/full-source`、`CHEMICAL_GROUP_SYNTHETIC_SCOPE=all`、`CHEMICAL_GROUP_SYNTHETIC_RECEIPT=<根>/full-boundary/synthetic-observations.json`；所有继承CHEMICAL_GROUP变量清除，未使用cache/snapshot override。Full自然执行source18、synthetic44和pure42，没有额外standalone重做。Source实际3clips/windows opened3/closed3、sourceDOM2/2、11HTTP/DNS methods ledger[]，bindings与10DOM descriptors复原；synthetic44 parses/windows44/44、0clips/sourceReads/audits、ledger[]且bindings/DOM descriptors复原。直接网络观测仅覆盖这两个#74 consumers；其他测试沿用既有mock或loopback契约，不声称全进程network capture。Writer仅static callgraph proof。

只读golden通过strict math/raw HTML/Markdown structure/crossrefs，issues[]；build仅生成ignored dist，没有live clip或paper writer。来源65/A/raw、旧baseline/tail/focused/独审probes均未重复。当前生产src/test字节与exact reviewed5c一致；本次只改两个DOC路径，因此不因文档更新重复测试。源fixture/provenance/helper与golden/dependencies/validators/security/spec/PRD/EDD无delta。一个prerequisite PR创建并立即attach后冻结head；最终URL与head由GitHub PR/root handoff持久记录。

Implementation review identities：human4960 bytes/SHA `6cbd5a60c1bbc62dad3e608e54292a388dcbfb27e5971472a79ab3917bc028cb`；machine12936/SHA `886658751d29e40e3b8f06cf878c88711c597e602e74a2fc68dcddaa0993de28`。本次ordered DOC_ONLY commit可由 `git log -1 --format=%H -- docs/goals/issue-10/bug-chemical-group-production.md` 重建；没有自引用SHA。Agent C仍等待#74 merged-main接纳，再以原B whole Chemistry验证；本minimal fixture不证明wholeCorpus255已通过。
