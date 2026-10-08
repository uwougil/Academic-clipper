# Issue #73 — Chemistry Δ bond-position SOURCEONLY handoff

真实 regression 已冻结，尚未修复。原 SOURCEONLY 恢复没有新抓取、source projection、clip 或测试执行；随后不同作者已完成57-block source admission，新的 synthetic-only 预检与未实施计划见末节。生产 gate 仍锁定，Issue #10 尚未完成。

## 身份与选择顺序

- Work Contract：[Issue #73](https://github.com/uwougil/Academic-clipper/issues/73)，`bug`，OPEN。
- Base：`a5b6acc2984af5cb8b82106291e963f4f413f5ac`。Main CI [37716530268](https://github.com/uwougil/Academic-clipper/actions/runs/37716530268) 与 Secret scan [37716530267](https://github.com/uwougil/Academic-clipper/actions/runs/37716530267) 均为该 SHA 的 completed/success；本次恢复已重新读取两 run 身份。后续生产修复须采用届时最新 accepted main。
- Branch：`codex/issue-10-bug-chemistry-delta`。
- Worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-chemistry-delta/academic-clipper`。
- Ordered commits：来源/test/diagnosis `8301a6465ef112a31fb8891bc75a0796e34e838f` → 原 DOCONLY handoff `c754d545b03045fb9d161a41174d067ff5dea781` → 首次 synthetic-only test/plan `7d04f7e79af7666632c392a40be09780fd6c5932` → 四项独立审查 tail controls/计划澄清（由最终 HEAD 标识）。不需要重复选择来源，也不 merge 此 RED branch。
- Owned files：`test/fixtures/nature-chemistry-delta/{.gitattributes,README.md,diagnosis.json,s41467-023-44030-3.excerpt.html,s41467-023-44030-3.provenance.json}`、`test/nature-chemistry-delta.test.mjs`、`test/nature-chemistry-delta-boundary.test.mjs`、本文件。
- `src/`、golden、B corpus、canonical spec、PRD/EDD、依赖、security/writer、C/D files 均无修改；无 PR。后续一个独立 #73 delivery PR 必须使用精确独立 `Refs #73` 行，且满足 orchestrator 的十项合并条件。

## 来源与科学 oracle

[原 article](https://www.nature.com/articles/s41467-023-44030-3)：`C5 methylation confers accessibility, stability and selectivity to picrotoxinin`，Nature Communications，DOI `10.1038/s41467-023-44030-3`。B source contract `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`；observedAt `2026-10-03T16:44:25.253Z`，captureMode `guarded-http`。原解压 HTTP body 460171 bytes，SHA-256 `a02d82acb4cdbde085e07ca0c276383894e7a7832c6830ad7a212f450926d88d`，保存在外部 B temp，未提交完整 capture。

唯一完整正文段落是 Results p4（零起算），C source block `a-section-2`；locator `section[data-title="Results"] p:has(#ref-link-section-d76734419e1024)`。原 subtree hash `5637b1cf3f747317aae12698db23ae4ff5fa708a47236179d7d2444e93c6bc99`；frozen subtree hash `fc038557c307a32c496972e01f5b07ab41f4f0605bdf16fb32a87b80d8df061c`。两个 role：`results-p4-delta-bond-1`、`results-p4-delta-bond-2`，对应原 SUP indices 0、3，均无 citation anchor，分别紧邻 `Hydration of the ` 与 `Cobalt catalyzed `，后邻均为 `-alkene`。原 `Δ<sup>12,13</sup>` 表示 comma-separated carbon bond positions；保持 Δ 与 12,13 的 attachment、顺序、数量及原化学值，不能改为 decimal、fraction、measurement、numeric exponent 或 citation。

57 selected blocks 保留必要原 ancestors、完整段落、Results `h2#Sec2`/design-synthesis `h3#Sec3`、title/canonical/DOI/article JSON-LD、全部9 ordered creators、References 完整 prefix 1–36、原 CC BY4.0 notice/footer。作者顺序：Tong, Guanghu；Griffin, Samantha；Sader, Avery；Crowell, Anna B.；Beavers, Ken；Watson, Jerry；Buchan, Zachary；Chen, Shuming；Shenvi, Ryan A.。唯一 citation clusters 为 `[5]` 与 `[27,36]`，不重编号。不为原 `see below` prose 编造 target；此段没有 figure/equation/table/supplementary link。9 compound bold markers、GABA_A receptor、PtO_2 catalyst、C12/C6/C5 与 65%/41%/81%/88% 由原节点/完整 context 约束；provenance 保存其完整序列。

规范 §5–§7 与 PRD §3 / EDD §2.4–§2.5 要求源上下标、原位置、三方言和 strict validators。此独立 defect 不包括三个 trailing-group SUB、leading isotope #61、Quantum Greek SUB #64、FRB powers 或 AlphaFold qualifier。不提出 spec change。

## A interface、转换与尺寸

使用原 Agent A helper Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`，34946 Git LF bytes，SHA-256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`；`sanitizeNatureHtml(raw, recipe)` 与 `serializeSubtree(node)`，sanitizer `nature-corpus-sanitizer/1.1.0`、serializer `nature-corpus-subtree/1.0.0`、recipe/projection 1.0。没有复制 sanitizer/hash/replay infrastructure。

Recipe `s41467-023-44030-3-delta-bond-positions-v1`，SHA-256 `10cab195ffba239d0871b1d8ddf9417d7ef8ba4c9108cada04ddc4f2ff2e61ef`。结构 signature `bb91524e350ac0009019db8dac7e2c2370791fe1c49f2dd7908dfaf6e9db0c3f`，payload signature `64f8a910dcf0fd8a55f466fa5c71e07f64ca3dd2399062e1ebf2998a3cc1c069`；仅同 retained projection 域可比较。Producer 已证明 repeat 与再次 sanitization bytes equal，恢复没有重跑。

转换：选择57完整 source blocks 与 ancestors；固定 scaffold、sorted attributes、UTF-8 无 BOM/LF；裁剪一个 article JSON-LD object；移除744 attributes、清理34 resource URLs。原 scientific i/b/sub/sup、完整 paragraph/source order、reference numbers、rights 保持。省略其他正文、三处独立 trailing-group SUB 与 isotope roles、References 36 后内容、未引用 figures/equations/tables/supplementary、UI/account/executable/tracking/session 材料；不提交 image/PDF binaries 或 full raw response。原 CC notice 不重新授权为 repository code license。

| Committed source artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| excerpt HTML | 57405 | `50e7bd3c941c8b448e49357109c38d1842821ce4ef2d270580a3663c1ae27030` |
| provenance JSON | 34944 | `0fb4c17500d9d2d5d878196d7f9788a6005d90e4dfa5c8cbfafca001d85e91d4` |
| diagnosis JSON | 8382 | `e0e5a40532347e8cb72a5957231d5cce2610643c61df2a8a1989252e2eabed02` |

Excerpt 57405 bytes 在 article 256 KiB 上限内；资源数量为零。上表是文件 UTF-8/LF bytes，hash 不包括本 handoff 或 manifest。

## 已完成复现及外部证据

原作者在 Windows Node `v24.14.1`、未修改 accepted-a5b6 production 执行 `node --test test/nature-chemistry-delta.test.mjs`，并通过 `CHEMISTRY_DELTA_RECEIPT_ROOT` 保存同次输出。原记录 exit 1；完整 log 明确 15 tests、6 PASS/9 FAIL、1210.4358 ms、0 skip/cancel/todo。九个 FAIL 是 two real roles × three dialects（六项）与 strict math validator × three dialects（三项），无 harness correction/failure。六个 PASS：来源 contract一项、三个 dialect ordinary chemistry/citation/resource checks、两个明确 synthetic compatibility checks。

每方言 promise 只调用一次 `clipNature`：总共三个 actual clips，全部 same-run result/Markdown/debug/semantic/ledgers 保存。恢复只读这些现有 bytes；没有 fresh clip、重复 source audit、full/build/golden。读取原输出不能声称后续生产修复已通过。

实际链路定位：Nature `cleanedHtml` 保留两处 `Δ<sup>12,13</sup>-alkene`；Defuddle `bodyMarkdown` 为 `Δ <sup>12,13</sup> -alkene`；academic renderer/final Markdown 产生 `Δ$^{12,13}$ -alkene`。原生产 source blobs 为 clip `8eec6a856ffbd1b9283c43269d38079b3ac940d2`、Nature `c6f819beb9747e83d322644c1f2a232769828afa`、academic-inline `a63eba2cacf0bc0a43552d1c16ec41e91b2cf0bc`。未来修复须在既有 boundary 保留这个明确 typed role，不能加入全局 Greek/unknown-word 猜测或修改 validator。

各方言 `mathValidation.valid=false`，恰好两个 `scientific-isolatedSuperscript`，isolatedSubscript/boldThenSubscript/italicThenSuperscript 全零；`rawHtmlValidation`、`markdownStructure`、`crossReferenceValidation` 均 valid。Exact warnings 为 `No Nature figures were detected.` 与 `No equation nodes were detected.`，figures/tables/displayMath/resources 零，References 36，citations `[5]`、`[27,36]`。Record-before-throw HTTP/DNS guards 与最后 ledger assertion 捕获可能被 fallback 吞掉的请求；ledger attempts 为 `[]`，global bindings 已恢复。Writer proof 为 static clipNature callgraph，不声称 writer spy。

原 orphan Δ 开始位置（1-based line/column；与 validator 在 `$` 上报告的 column 相差1）：markdown `27:18`、`27:686`；links `27:18`、`27:711`；quarto `26:18`、`26:714`。原 UTF-8 byte offsets 分别为 markdown 616/1285、links 616/1310、quarto 701/1398。

外部证据根 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-chemistry-delta`：`freeze.mjs` 是原已执行 producer projection；`receipt.mjs` 是原已执行三结果只读 postcheck/diagnosis 生成器，内含 provenance 写入，因此恢复不重新调用它。它们不是新的 source schema 或 committed infrastructure。Durable recipe、retained subtree digests、scope/oracles 和 diagnosis 位于 source commit。

| External artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| red-a5b6.log | 13922 | `c288adf5e326584cbebb573bd19bcbf145f73dbb6c1942fdff2dc3e61b51790b` |
| red-a5b6/network-ledger.json | 124 | `38f726f4b3895d4c6d8bc4ae526aae1052a4f15ba568e58829f92db971cfb868` |
| red-a5b6/markdown.result.json | 107939 | `919b342ed17066f363af237e6f667b580a927ad9e101ac96d739ed0c125522a8` |
| red-a5b6/markdown.md | 9664 | `b857004cba39314d9ce7aaedbeee622c72569b30cc79be6cff8fdef178e9d556` |
| red-a5b6/links.result.json | 110321 | `54006e344541917aa2dd10da559cd85d034d3ab528a11c1ca50112ad689ba34e` |
| red-a5b6/links.md | 10292 | `141560ec6eb0a34f24f8189000c2b30864f73981e0285c7e0ab4128b749c7fdb` |
| red-a5b6/quarto.result.json | 91824 | `8100ef93dfa503c514fdad55ad4cb3d678e3532938246fd6929eeb869468b383` |
| red-a5b6/quarto.md | 1701 | `48b28696a0c15c21658ad23a3242bcf2c6ee7e64cda19c299f700922f5513287` |

恢复重新读取原15-test log、测试代码、recipe/diagnosis、文件 sizes/hashes、Issue #73 与上述 accepted CI；`git diff a5b6acc -- src papers/s41586-026-10401-1 docs/specs docs/PRD.md docs/EDD.md` 无 diff。最终 `git diff --check`、`git status --short` 和 owned tracked filenames 检查供最终交接记录。没有为了 DOCONLY changes 重新执行 RED tests。

恢复实际执行 `node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-chemistry-delta/recovery-identity.mjs`，exit 0：只读验证 fixture/hash 与三个原缓存的 exact bytes、rawHtml/dialect 身份、对应 Markdown bytes、四 validators、warning/引用/资源和网络 ledger；没有调用 DOM sanitizer、production clip 或 test runner。外部 `recovery-identity-receipt.json` SHA-256 `b02bfb4729f69d50131d2647d7db1bf8f8b3166463021f60840ed6108f3872b4`。Receipt 明示 `newClips=0`、`newSourceProjections=0`、`newTests=0`；这项成功不将原九个 RED failures 改为通过。

## 下一消费者与未完成项

Independent reviewer：不同作者已从精确 source HEAD `c754d545b03045fb9d161a41174d067ff5dea781` 完成57-block admission，见末节的原 report 与 machine receipt。复用该有效结论，不重复 source projection、全 B/85-oracle audit 或旧真实 clips；它只放行来源，不放行生产实现。

Production owner：独立 source acceptance 与 root production gate 后，只处理 #73。三方言默认完整生产链必须 fresh 执行，清除 `CHEMISTRY_DELTA_CACHE_ROOT`；cached诊断不能满足修复 gate。运行相应 focused/affected/full tests、build、只读 golden、fresh 三平台 CI/Secret scan、独立 implementation review；保持源 bytes 与原 oracle，不能合并当前 RED source branch。

Agent C：#73 当前只解释原 Chemistry 中两个 Δ scientific orphan。真实主语料27 source expectations/repeat 的既有记录不重做；修复被 accepted main CI 接纳后，按原 source oracle 增量核验该角色和四 validators。另三 trailing-group SUB 仍是独立前置问题，不能因 #73 成功把 Chemistry 整体或 Issue #10 标为完成。

未执行：生产修复、修复后的 affected/full/build/golden、fresh PR CI/Secrets、merged-main acceptance。Independent57-block source acceptance 已在本 producer 之外完成。无 known science/spec ambiguity，无 proposed spec changes；依赖均为 agent-resolvable，非 human-only blocker。

## 新 synthetic-only 预检与最小计划（生产锁定）

本轮只修改本 handoff 与新增 `test/nature-chemistry-delta-boundary.test.mjs`。没有采用其他 owner commits 到本分支，没有改 `src/`、原 fixture/provenance/diagnosis、原15-test 文件、B/C/D、golden、intent/spec、dependencies/security/writer，也没有 PR、merge、live、full/build/golden。新的测试输入明确 synthetic，不是第三个真实 Δ 来源或新增 corpus admission；单独的12与13只检查完整 source grouping，不据此判断其化学键位/数学 exponent 意义。

### 复用已完成证据

原不同作者报告位于 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue73-independent-source-review/issue73-source-review.md`：9456 bytes，SHA-256 `1d765a0b05535771ef8ba167df195c5ab7847ff8f43128293f2b5b16cf919c49`。同根 `source-audit.json`：120973 bytes，SHA-256 `8772433d4f0df35ba103e6e1f4bcbf73aa372ad4d3ea41605a206ca6962414e7`。本轮只读、核对这两个原 bytes；实际结论 `SOURCE_PROJECTION_CLEAR_ONLY`、零 blocking source findings、source head c754，非 implementation acceptance。没有重复57 source parse、raw/A recipe/projection/signatures/rights audit、旧三次真实 clips 或原15 tests。

### accepted-main 私有快照与一次执行

固定 accepted-main `36c93ca81236705912c25db391d611ee28405dca`：[Main CI 37749675660](https://github.com/uwougil/Academic-clipper/actions/runs/37749675660)、[Secret scan 37749675621](https://github.com/uwougil/Academic-clipper/actions/runs/37749675621)，本轮只读确认均 completed/success、headSha 精确相同。它是本次预检域，不能代替将来的最新 accepted production base。

外部 evidence 根：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-chemistry-delta`。`node <根>/preflight-setup.cjs` exit0；通过 `git show <sha>:<path>` 的原 stdout Buffer 写入自己私有 `preflight-36c93ca/`，36 个 `src/**`/package/lock 文件逐字节校验，未经过 PowerShell 字符串 CRLF 转换。Node `v24.14.1`；只读运行现有 immutable dependency junction，未安装/更新/写入 junction target 或其他 owner 的物理目录。`snapshot-identity.json` 保存完整逐文件 bytes/SHA。source branch仍在 a5b6 加来源/doc commits，不 rebase、cherry-pick 或采用 dependencies 到本分支。

`node <根>/run-preflight.cjs` 只执行一次实际命令 `node --test test/nature-chemistry-delta-boundary.test.mjs`，通过 `CHEMISTRY_DELTA_PRODUCTION_ROOT=<根>/preflight-36c93ca` 与 `CHEMISTRY_DELTA_PREFLIGHT_RECEIPT_ROOT=<根>/preflight-36c93ca/baseline` 选择快照与证据路径。实际 node exit1，43 tests（42 children+1 aggregate）、33 PASS/10 FAIL、1226.2818 ms、0 skip/cancel/todo。九个 child failures 分解为八个 genuine RED 与一个 harness expectation 错误；另一个 FAIL 是 aggregate。不要把它改写成已通过。

八个 genuine RED：原 comma label、完整12 group、完整13 group、两标签有序 identity、direct citation 后的 label（五项）与 mixed body/caption 三方言（另外三项）。它们均在 ALL ordered semantic-runs assertion 因缺少 typed Δ run 失败。预检同时通过 whole Unicode L/N/M/_/astral 左右边界、空白/comment/wrapper/complex/额外 attachment、unknown word/other Greek、code/pre/real MathML ancestor/MathJax/equation、跨 span 已闭合 literal math 等负例，以及既有 styled base 与 typed citation 的完整序列断言。没有过滤科学 runs、power minima 或 validator-only semantic oracle。

唯一 harness 错误：`Δ<sup><i>12,13</i></sup>-alkene` 由既有 `collectDetachedSuperscriptRun` 生成 `^{12,13}-alkene`，初始预期 `[]` 不正确。只将这一个 expected ALL-run array 更正为原 collector 的既有输出；`node <根>/preflight-postcheck.cjs` exit0，以同次 `synthetic-results.json` 的该记录复核 marker0、完整 TeX、inline/display/citations空；新增 parse/clip为零。这个 orphan 的既有行为不被宣称语义健康，也不纳入新增 plain Δ collector。严格 atom oracle 另用无 parser 的字符串检查拒绝 `Δ^{1}2` 冒充 `Δ^{12}`、`Δ^{1}3` 冒充 `Δ^{13}`、decimal/fraction/isolated SUP counterfeit。没有重跑整矩阵。

五个 positive parse rows 在首个 RED 之后的 marker identity、inline/display/citation断言尚未执行；三 mixed rows 在首个 RED 之后的 marker identity、inline/citation/final ALL atoms、body/caption exact placement、残留marker与四validators断言亦未执行。cached存在这些值不等于后续 assertion已通过；它们保留给生产 gate 后 GREEN。mixed inputs已经执行三次新的、明确 synthetic `clipNature`，没有旧真实 reclip、resource hydration、writer或paper writes。

guard在所有 dynamic production imports与 parse之前安装：global fetch、callback DNS lookup、promise DNS lookup均 record-before-throw；每行独立检查 ledger，最终 after-attempt ledger `[]`，exact bindings已恢复。原矩阵38个显式 parser DOM在finally关闭；三个 clip内部DOM没有公开handle，初次harness只能在该短命测试进程结束释放。最终测试文件增加受控 `withDomGlobals` window赋值观察（只在 synthetic clip期间、finally恢复原descriptor），以便未来GREEN关闭这三个内部window；该加强未新运行clip，运行时效果暂未证实，不能回写原receipt为41个主动close。finally嵌套保证DOM清理异常也恢复网络bindings。未安装第二parser或修改runtime。

| 原一次执行 evidence（相对 `preflight-36c93ca/`） | Bytes | SHA-256 |
| --- | ---: | --- |
| `snapshot-identity.json` | 6095 | `1008526b5f5fc7e1d9fc1b081d58a9aa5ea354ab2fcd9607d2664bedf7295d4b` |
| `baseline/initial-test.mjs` | 8989 | `a7de58b66b0b60c55729013d7b9f7c4905b50e49a4ea7ae02837095d50de040c` |
| `baseline/stdout.log` | 12013 | `c0e96244c5d8bb73bdfed26a96855a6e1ecf51890b7e88745fb10101adeb7219` |
| `baseline/process.json` | 377 | `93dcd6469295b71ada7ef96bddccc8fe0492dec19b165cb27ec444d7f3547a76` |
| `baseline/synthetic-results.json` | 60042 | `8d471ca4ea0a61420e0afb4bd7dae169e5fff81d2f2bac78822530091af69980` |

`baseline/stderr.log` 为0 bytes；`postcheck.json` 是 cached-only correction与未执行assertion清单，不是新的矩阵run。最终test的hash与owned commit在交接状态提供；`node --check test/nature-chemistry-delta-boundary.test.mjs` 和 `git diff --check`通过。

### 尚未实施的 Nature private typed-label 计划

1. 在既有 `replaceScientificRuns()` 内增加一个 Nature private collector；它只接受 plain contiguous text Δ + 一个 plain-text SUP 的 typed label slot。原 `12,13` 是唯一真实已证明 chemistry value；synthetic12/13只证明同 glyph的源分组必须完整保留，不推断 exponent或键位。SUP exact `textContent` 必须属于 `new Set(['12,13','12','13'])`，不使用通用数字/comma grammar、清洗/去空白后匹配或新增values。未知Δ值（包括clean numeric14）继续原路径，不建立 generic Greek/SUP scanner。原源码位置、作者/文章ID不参与识别。
2. 检查完整前后source词边界，使用 Unicode `\p{L}\p{N}\p{M}_`，按code points覆盖astral。文本节点开始且前面已有未知sibling/comment/wrapper不能假定lexical boundary；source Δ与SUP之间的空白/comment/wrapper、复杂/styled SUP或额外非citation attachment均不进入此role。SUP右侧只允许parent end、立即非空Text以whitespace或合格Unicode punctuation起始（排除underscore），或由既有两个citation anchor cues独立证明的typed citation SUP。其它element/comment/empty wrapper等未知continuation均拒绝，不跨node查找下一个看似合法边界；立即Text中的Unicode词/数字/mark/underscore亦不得截断。原 `-alkene` 的hyphen是合格punctuation且保持在range外；direct citation正例维持独立，不能被吸收。
3. `parent.closest('pre, code, math, .mathjax-tex, .c-article-equation')` 不消费；对跨inline siblings的闭合literal math/code采用保守whole-parent delimiter-cue排除，而不是在text-node局部猜测。检查 dollar/backtick/fence以及 `\(...\)`/`\[...\]`闭合来源；这些synthetic opacity预检只声明新增collector不应介入，不重写既有MathJax/MathML/code语义。
4. range只提取完整Δ和该plain SUP，给已有 `replaceRangeWithScientificMarker(..., range.tex)` 写精确原 `Δ^{12,13}`（synthetic对应完整 `Δ^{12}`/`Δ^{13}`）。复用现有 `range.tex` 接口、semantic marker编号、renderer与Defuddle；既有styled/numeric/MathJax/citation路径、body/caption共享collector顺序保持。Δsource字体/glyph保持，不强制改为roman text、decimal、fraction、citation或numeric power。
5. 新矩阵全部ALL ordered runs与markers、inline/citations、严格grouped ALL final atoms及body/caption placement必须GREEN；旧source test三方言在最新accepted实现首次fresh no-cache执行、原来源 bytes/oracle保持、四validators必须GREEN。未来修复再按root gate执行focused/affected/full/build/golden、独立implementation review、fresh三平台CI/Secret scan，后续successfulmerged-main完成#73。

本计划尚未获得 independent plan/implementation CLEAR，也未改生产代码。root仍把Nature生产owner锁在#68及其accepted dependency顺序#68→#71→#72；#73只能在该gate释放及最新accepted base确认之后开始。当前稳定checkpoint只为下一位独立read-only plan reviewer与未来production owner准备，不宣称bug已修复、#73完成或#10 ready。

### 两项独立 plan findings 的窄 tail（四个新controls）

不同作者报告：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue73-plan-independent-review/plan-review-7d04f7e-FINDINGS.md`，4991 bytes/SHA-256 `42d373279915112ad4d1f8458975d52e0c503a61b292f80fd2f1a39b7614fcc3`；同根 `plan-review-7d04f7e-FINDINGS.json`，5353 bytes/SHA-256 `7ff15e2f8d28152773bbc36078fbe1ebf8a562e9a9abfba65eb967297d212bac`。本owner读完整报告并核对原bytes。审阅结论 `PLAN_REQUIRES_TWO_NARROW_CORRECTIONS`，两个P2只涉及明确value set及SUP右侧资格；原 source CLEAR保留，不重审来源、不声称candidate实现发现。

上方计划第1项现在明确exact string集合 `new Set(['12,13','12','13'])`；第2项明确右侧只接受end、立即非空Text的whitespace/合格punctuation（排除underscore），或独立typed citation。unknown wrapper/comment/empty-wrapper不跨越、不推测，原hyphenated `-alkene` 和direct-citation正例继续保留。只新增四个synthetic controls：clean unknown numeric14、SUP后`<span>A</span>`、SUP后`<!--edge-->A`、SUP后空`<span></span>`，全部预期ALL ordered scientific runs和markers为空，inline/display/citations全为空。

为避免旧矩阵重做，测试新增明确 `CHEMISTRY_DELTA_BOUNDARY_SCOPE=review-tail` 入口：在case loop之前仅选这四个IDs，assert其数量恰好4；loop结束直接return，甚至不import `clip.mjs`，不注册旧oracle或三个mixed clips，不执行window observer。默认scope仍为`all`，future正常candidate必须消费原42 children+新4 children，共46children/47含aggregate；本轮没有运行这个47-test全量，也没有把旧43结果改为GREEN。

唯一实际新运行：`node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-chemistry-delta/run-review-tail.cjs` exit0；其子命令仍为 `node --test test/nature-chemistry-delta-boundary.test.mjs`，设置上述scope、原 `CHEMISTRY_DELTA_PRODUCTION_ROOT=<根>/preflight-36c93ca` 与新的 `CHEMISTRY_DELTA_PREFLIGHT_RECEIPT_ROOT=<根>/preflight-36c93ca/review-tail-7d04f7e`。Node v24.14.1；原36文件snapshot bytes逐项只读验证相同，未重建snapshot或写dependency target。真实5tests（仅4新children+aggregate）5PASS/0FAIL、640.6308ms、0skip/cancel/todo。动态guard仍在production import与parse之前，四个DOM在finally关闭、exact fetch/callback+promise DNS bindings恢复、独立final attempts`[]`；新的synthetic/real clips、internal window observer、source audit/projection、旧case/runtime/43矩阵/15-test/旧真实三clips均0。

Evidence相对`preflight-36c93ca/review-tail-7d04f7e/`：

| 同次新 tail evidence | Bytes | SHA-256 |
| --- | ---: | --- |
| `executed-test.mjs` | 11184 | `9c0de9d06caadd1d730bd89344f5d3a6bcfb8ebd0db40bd837c09501c105d1fe` |
| `stdout.log` | 441 | `71354e962d0afa1fb8fa97f8c1496516e412b97f8ee89d25ad7add972fd951b6` |
| `process.json` | 716 | `cf9527ae588e0a7ebb7f2e27725ac58a04c2418caf9c1b01b08d36e9ca23d487` |
| `synthetic-results.json` | 3477 | `071cb37b655658a84bed0451f80809943ced27dea19e62523991cecadaab8114` |

同根`summary.json`存四个actual records的完整run/inline/display/citation arrays、scope/count/ledger/closure与上述hash；stderr0bytes。旧initial/preflight/cache/postcheck/原source文件及证据全保留，原八个genuine RED与后续assertion未执行状态不变。没有修改production、adopt其它owner/current#68/source inputs/validator/security，没有full/build/golden/PR CI/live/merge。`node --check`及`git diff --check`通过，最终own HEAD/push/clean receipt另行提供。两项tail已提交给root指定的不同作者再次静态review；未经其零blocking结论不自宣plan CLEAR，生产锁顺序仍为#68→#71→#72→#73。
