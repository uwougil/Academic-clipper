# Issue #64 — plain Greek + SUB 来源预检交接

当前状态：`LOCAL_VERIFIED / FINAL_PUBLICATION_REVIEW_PENDING`。下文原source-only/focused交接保留历史证据，最新生产授权、独立增量CLEAR和实际full/build/golden见末尾续章。已核验 [Issue #64](https://github.com/uwougil/Academic-clipper/issues/64) 为 OPEN、唯一 type label 为 `bug`；PR发布、鲜CI/Secrets与最终exact-head审查仍是下一门槛，Issue #10未完成。消费 `create-issue` intake与 `fix-bug` evidence-first流程，root按十gates决定独立bug合并。

## 基线、所有权与提交

- Base：`ac86b2fa509653dfeb43b968472ce6280a51de2c`。Main CI `37681190063` completed/success，Windows24 `112997400634`、Ubuntu24 `112997400858`、Ubuntu20 `112997401004` 全 success；Secrets `37681189875` 同 head success。PR27 planning contract `5971ebfbe288e0efed4abef21469f41e2cabb05f` 为祖先，`git merge-base --is-ancestor` exit0。
- Branch：`codex/issue-10-bug-greek-subscript`。Worktree：`C:/Users/guoli/.codex/worktrees/issue10-greek-source/academic-clipper`，新 managed worktree，没有改变旧 caption/scientific-citation/units branches 或其他 agent 的 checkout/index。
- Ordered authored commits：`59cf3591d4af1f5d043b6b4852a0353951a9231f`（下面五个 source/regression files）→ 本 docs-only handoff commit。末尾 SHA 用 `git log -1 --format=%H -- docs/goals/issue-10/bug-greek-subscript-handoff.md` 重建，避免自引用。
- 第一提交仅有 `test/fixtures/nature-greek-subscript/{.gitattributes,diagnosis.json,s41534-023-00746-0.excerpt.html,s41534-023-00746-0.provenance.json}` 与 `test/nature-greek-subscript.test.mjs`；末尾只加本 handoff。没有 A/B/C 合同拷贝、manifest/helper 修改或新的 publisher abstraction。

检索 actual worktrees、open+closed Issues 后没有已有 Greek 合同/工作树。完整语义对照 #48 units/numeric powers、#51 table MathJax（并检查 PR52）、#56 citation SUP、#60 Table caption、#61 leading isotope。范围不同，所以创建独立 #64；Issue 的 create 后完整 readback 成功，后续一次只读 GraphQL EOF 重试成功，没有重复创建。

## 接口与来源

[原文章](https://www.nature.com/articles/s41534-023-00746-0)：*Autonomous quantum error correction and fault-tolerant quantum computation with squeezed cat qubits*，DOI `10.1038/s41534-023-00746-0`，npj Quantum Information。原获取 `2026-10-03T16:44:08.251Z`。B immutable `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330` 的匿名 untouched body：511799 bytes / SHA256 `6b2bb78e5f3038d6281eac00b60dc90aa58bdd9ac185ca2d4b9b0de362bbe28e`。直接复用外部 B raw，不重新获取、不使用 PR13、浏览器账号或 credentials。

A original owner `3754d3a781459635e719859353fe3cbdf8741897` 的实际 helper Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`，34946 Git bytes / SHA256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`。Sanitizer `nature-corpus-sanitizer/1.1.0`、subtree serializer `nature-corpus-subtree/1.0.0`、recipe/projection `1.0.0`，从 B dependency 只读 import；没有复制/修改 sanitizer。Windows checkout 的 CRLF 只在 helper identity 对照中按 Git 的 LF 还原，实际代码与 Git bytes 完全一致；没有将 checkout hash 混称 Git hash。

C durable `19e09534736ff77b673fd289ea0b63a91514c7e3` 的 `accepted-ac86-delta-quantum-source-delta.json` 为36206 bytes / SHA256 `2a306f392a17ae9edd8e4964dcb1aae236861030de4074650179982774b2154f`。其实际 scope 是三篇×三方言的84条 source 和9个组合，不能称全部27组合。本任务只消费其中 Quantum 同次 source positions/原3份输出；没有重跑 C9/27/85 source audits。新摘录全部7段的 raw/frozen digest 与 C 原 packet 完全一致。

原完整有序 creators：Xu, Qian → Zheng, Guo → Wang, Yu-Xin → Zoller, Peter → Clerk, Aashish A. → Jiang, Liang。原 CC BY 4.0 完整 notice、原链接 `http://creativecommons.org/licenses/by/4.0/`、其 sanitization 前 digest `5594df3c02d6a2f11229ebd9246cd74c555ddbb94b2ef563a5db9dac893a4e69` 已保留。Publisher footer `© 2026 Springer Nature Limited` 与文章许可分开，prehash `09e85accdf125e9c6cb8eae79fe5bae782628f830c5d6ab5515974bd8d45dfd3`。Provenance 同时记录 B readable notice 与原 exact notice text；原 `Open Access` 后两个空格没有改写成一个。

## 原科学位置与摘录边界

Methods / `a-section-4` / `section[data-title="Methods"] p` 的 paragraph index 零起算。下面17个 source roles 是 preceding plain Γ/Ω 与紧邻原 SUB，不能当成 leading isotope 或 citation。p6 是完整 Figure5 caption；p15 是 Equ25 后正文。p13 引用 Fig6，因此保留完整 Fig6 wrapper/context，但其额外内容不计新角色。

| p / roles | 原 source selector | raw paragraph SHA256 | frozen paragraph SHA256（与 C 相同） |
| --- | --- | --- | --- |
| 4 / 2 | `#Equ18 + p` | d4b9cd5027373869e427abe3a356010ce137ee71232ba6fe10fa326e619e4636 | 74a9ca9392ba1e49f63b27c7dd139332ab694b2c99d96345da9bbca9654e8a0a |
| 5 / 1 | `#Equ19 + p` | 7917cafd5d18cb35e336b2dc2f3a83ea9c35d2e81f9e5e8c8ea513825b5ca19a | 3605d4ae2cb313d0f68293ec7698dfc605544315b6d02dabc6a2050bf3b75aff |
| 6 / 2 | `#figure-5-desc > p` | 6b5529fa2fc0f7054db8ddff9f5845f04f47dc09a92c9b6c84c6e402cd3af866 | f7f86bf155d5aa1ce3e2adc5f646839344901c4c2aa29ee7ecfa7289a32a0062 |
| 7 / 7 | `#figure-5 + p` | 41fe93f90327d2058184f53f70b106f365fec54bac3569302d2621b4e6b379a7 | 1399a9b8f93b285f03f15b8d51e9cbc5cae6c3d6205a0888e98881557c151fa4 |
| 9 / 2 | `#Equ20 + p` | 4df3e18987d23972b091c9e456138caf31e752848220bd87f716839e8bf298ad | 629a487989b7da126377e8b992c13abc2c89cd839b807066ab0144fa0d02fd6c |
| 13 / 2 | `#Equ23 + p` | a5560c83a39e0275742a9c3d0dd8c0830be4cfc503882f9def1a6c06a13ac969 | 28ea00ca891ecb94f15283d49e5fe2bee14c7a92e22a065cb6f735986288fc8e |
| 15 / 1 | `#Equ25 + p` | 71d264e4fec89fd459f23ccf020b4a263bfee0b83e3a37ef201f6437a89f3fda | d614ce67b9f636f349b500a929acaf960a7000a57efed1329d546ae35a8f8b2e |

Exact roles/order：p4 Γb/Γa；p5 Γb；p6 Γa/Γb；p7 Γb/Γb/Γb/Γa/Γb/Γa/Γb；p9 Γb/Γa；p13 Ω0/Ωi；p15 Ωi。Provenance 记录各 SUB 原 index/html、相邻 text-node 原 meaningful whitespace、完整 paragraphs、全部 i/b/sub/sup/MathJax nodes，而不是指定 parser 的当前错误输出为期待。

120 个原 complete blocks + necessary ancestors：21 metadata blocks 和1个原title、全部6作者、Methods/Sec9 headings、7完整段落（含Fig5图注）、完整 `figure-5` / `figure-6` wrappers、Equ6/16/18/19/20/22/23/25、真实 Supplementary target context、原 References prefix 1–76、rights/footer。Reference76 是 p4 原引用，因此不能为缩小 fixture 重编号或删 prefix。所有 selected blocks 的 raw prehash、recipe 和 operations 保存于 provenance。Soft article target20–150KiB 与256KiB上限均满足；这是独立 bug excerpt，不改变9篇 corpus admission/count。

转换只执行 A 原 deterministic selection/sanitizer：固定 UTF8无BOM/LF/scaffold/attribute ordering，保留原科学节点、拓扑、顺序、IDs/classes/JSON-LD article metadata；删除未选正文、无关 UI/executable/tracking，JSON-LD 仅相关 article object。未选其他图、Table1、split-SUP p33、无关 sections；没有图片/PDF binaries 或 full raw body入Git。重复从 untouched raw生成与再次 sanitizer bytes 相同。完整 Fig5/Fig6 context 没有压成 prose 或编写新 DOM。

| Git object / artifact | bytes | SHA256 |
| --- | --- | --- |
| excerpt | 90784 | 227a626f70825f2484e94754cdda3a1a6a6608f4b94f6bbe4c6ff206be9f08b7 |
| provenance | 96355 | 07e2d0cef0314ac73f6dbcf0fd6949d52c1560f7562a75d467df96ec3da93a12 |
| diagnosis | 22749 | e23edd5faa2fd4972ee77f10a5c71d5b7d5208646b8530f66f379523aaf0293a |
| permanent test | 8467 | 985e62ad9b3af61a6210dfbded1014ee98a9a3df386e35b258f25e4be4708400 |

Recipe SHA256 `8e103c0269c8a5f86e530a92b5907d78e4bffb688b93ac4882e15805491bdaac`；same retained projection structure `2996fec8f9f6b2dcc7551ae619e9288bf75483d2b3551c64918bccff69a79ea2` / payload `7ff3497399eb4b07a5defb96c862a96aa2de3c04f4763988a1ea9fc7de3f2b39`。Hash 身份不能代替独立 science review。

## 真实运行、失败与最先失效位置

Windows Node `v24.14.1`。Final permanent focused：`node --test test/nature-greek-subscript.test.mjs` exit1，27 tests / 3 PASS / 24 FAIL / 0 skip/todo/cancel，2022.2597ms。21 real paragraph×dialect attachment failures +3 real math-validator failures。3 PASS 为完整来源/creators/rights/targets/prefix integrity，以及明确 synthetic ordinary Greek/math/code 和 Nature MathJax/citation/code roles。Tests 对源 DOM 与最终原段落中所有 Γ/Ω-subscript 角色按顺序比较，包括原 opaque MathJax 中匹配的角色，因此允许等价 Unicode/TeX 或合并表达式，不要求手写特定TeX样式。

| actual source clip | math / scientificFragments | raw HTML / structure / crossrefs | warnings/resources |
| --- | --- | --- | --- |
| markdown | FAIL，17 isolatedSubscript | 全 PASS | [] / 无 table hydration |
| links | FAIL，17 isolatedSubscript | 全 PASS | [] / 无 table hydration |
| quarto | FAIL，17 isolatedSubscript | 全 PASS | [] / 无 table hydration |

每种方言原8 displays正常；75 inline计数是本 excerpt 的旧 baseline diagnostic，不是正确期待或 whole-Quantum count。测试实际调用 `clipNature`，永久文件未复制 adapter→Defuddle→normalizer→render pipeline。Optional `NATURE_GREEK_RECEIPT_PREFIX` 只保存同次3个真实 results 至明确外部路径，默认不写、不多 clip。两类synthetic控制不作为另一篇真实论文或新Greek source admission。

`diagnosis.json` 分开保留15 body +2 Fig5 caption：原正确 SUB 在 adapter 与 Defuddle 后仍在，body Defuddle 在Γ/Ω和SUB间加入显示空格；`normalizeMath` 后仍是原SUB；`normalizeAcademicInline` 的 `renderRange` 首次生成 `Γ$_{b}$` / `Ω$_{0}$`，已有 styled/unit/numeric reconstruction 不接 plain Greek。根本欠缺的是 Nature DOM scientific-run 对该源角色的保护；不是 source science 错误，不通过 input整形或降级 warning处理。

Caption lifecycle 已按 ac86实际代码和 diagnostic检查：`replaceScientificRuns` 在 protected `captionHtml` recapture 之前执行；Fig5 原 `η_pred` 的 `ACADEMICCLIPPERSCIENTIFICRUN0X` 已被 recapture并由 shared semantic.scientificRuns恢复。两处 plainΓ仍在该 captionHtml中未保护。未来最小 proposal 是在既有 Nature DOM range/marker边界保护实际terminal plainΓ/Ω与紧邻originalSUB，尊重typed math/display、citation、code、wrapper与源标点空白，复用已有scientificTex/semantic records。须同时证明15body和2caption的实际clip输出；不假设body-only改动足够。既有 figure-caption共享context可复用；若未来代码/lifecycle不兼容，先保留证据返回root，不复制#60table-caption infrastructure或改为全局Greek Markdown regex。

## 精确命令与外部证据

External root：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-greek`。原 raw仍在 B external root；这些 full/parsed Markdown logs 不进入Git。

```powershell
npm ci
node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-greek/freeze.mjs
$env:NATURE_GREEK_RECEIPT_PREFIX='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-greek/accepted-ac86-frozen'
node --test test/nature-greek-subscript.test.mjs
Remove-Item Env:NATURE_GREEK_RECEIPT_PREFIX
node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-greek/diagnose.mjs
node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-greek/audit.mjs
git diff --cached --check
git diff --check
git status --short
```

`npm ci` exit0，65 packages；原accepted lockfile已有1 high advisory，未改依赖、未运行audit fix。Freeze exit0，raw Buffer/hash、实际 A Git helper身份、7 raw/frozen paragraph digests、120 blocks、science/rights/context、repeat/idem PASS；focused exit1为上表 truthful RED；diagnostic exit0为保存证据成功，不是修复成功。Git object/source audit exit0：5个显式ownedfiles、fixtureLF/noBOM/hash、无credentials/executablefixture/fullcapture findings，protected src/scripts/PRD/EDD/canonical/security/deps/writer/golden/CI/extension diff为空；首commit后clean。实际writer未调用，parsed source/synthetic tables=[]，accepted `clipNature` 的唯一 resource hydration 收到空表列表，figure downloads仅writer路径，因此普通0live DNS/HTTP；没有global fetch/DNS改写，不把这项静态/实际empty-resource路径证明称HTTP mock ledger。

External final TAP `accepted-ac86-focused-frozen.log`：91380 bytes / SHA256 `016e4603da2624b2878d47048b823bd6e7a8a6433a7ed6bfe97aed3c82a18631`。`git-source-audit.json` SHA256 `fc5cb8857fedeb615e1a745cec62fa32a928261d5e7bf3eec2def74418fad755` 保存全部Git blob identities及外部evidence hashes。实际same-run输出：

| receipt | MD bytes / SHA256 | result JSON bytes / SHA256 |
| --- | --- | --- |
| markdown | 21650 / 2e1fc09a5cf4c0026546c85a923704b483310cabf5900ce972ee0fd8ef71bb02 | 42939 / 21d0fbc23708a0a7fa21125cbd8c4cb0446c9775babd1cbefcfe6b54ed764631 |
| links | 23322 / 9c1cc60ed4b8a2befdb186c97f9797fc412cb22b85d7a5b3b707285c9749c902 | 46118 / c1d065222f8e4d9ddfe14ebfb0de1ac0dc6b605f8a783e320a65df11f2402797 |
| quarto | 11041 / ffd293d23e4a8787283a84ff8b2cb3531b32b5c9b72bc0274237338d98cc4cbb | 44376 / 922dde757d3cf48ba0523054b2eddab76cf7ccf9b51f1a733fda930d2318cc9e |

失败准备亦保留：最初 helper checkout CRLF hash与GitLF不同；改为读取Gitobject并核对checkout内容，没有换helper。初次 selector爬到HTML根无parent、recipe错误放`omittedContent`、原nth paragraph locator在idem pruning后变化，均在写fixture前被fail-closed拒绝；最终用原Equation/Figure IDs邻接稳定recipe，omissions放provenance，未改源节点。第一次focused27为1PASS/26FAIL，其中rights原双空格与normalizer raw `<sub>` code的当前行为属于2个harness错期待；第二次3PASS/24FAIL后又将oracle从pure standalone atom拓宽为源顺序/等价表达式，最后27=3/24如上。科学fixture bytes全程未按parser错误修改；初次两份logs分别94413/SHAe935a3…、89048/SHAff5481…，完整hash在audit。初次diagnostic严格Γ紧邻SUB regex漏计Defuddle新增空格，修正观察regex后15/15/15/15与caption2/2/2/2；不将漏观察0称DOM丢失。后续仅补caption lifecycle证据，没有再次运行source3clips。未做来源重采、C9/27整批、全suite/build/golden/CI或implementationPR。

未来消费者可从committed provenance导出 `.recipe` 至外部文件，以实际A CLI `--input <original external raw> --recipe <exported recipe> --output <new external excerpt> --kind article` 重建（不得覆盖raw/source）；本任务实际用上述只读originalhelper的freeze.mjs，而没有冒称执行该等价CLI命令。

## Root / C 解阻条件

目前只完成来源预检；独立source projection/science/rights审查尚未做，不能以本作者audit代替。Root须审阅exact checkpoint及完整source recipe/原7段/17附件，待#57→#60→#61共享Nature实现门槛释放后才授权最小#64生产修复。独立 reviewer之后必须检查exact实现head、所有source roles/opaque/citation/code边界及10项自动merge门槛；source-only RED branch不merge。

#64 accepted Main/Secrets后恢复 SAME C，对Quantum `source-inline-v1` / `nature-source-inline-v1`、`source-figures-v1`和真实finalmath validators定点复验，保留source/oracle不变。同次缓存记录scope与全部validators/warnings/semantics；不得因#64的17问题清除声称 whole Quantum通过，其#60 caption24和splitSUP2仍由各合同验证。这里没有新增source expectation或放宽C registry；最终27combo/85consumer的完整验收仍属Issue10integrator。

Spec changes：无。Canonical、PRD/EDD、B科学input/oracle保持不变。没有需要human放宽科学真实性、许可或安全的决策。#64 OPEN和sourceRED说明当前工作未修复，不是Issue10完成状态。

## 生产授权与 focused checkpoint（2026-10-08）

Root明确释放 SAME owner 的唯一 Nature production写权后，采用accepted main `73d6cfafba9bb33149959e315ab29b5b0bc24d75`（#63）。Root核验 mergedMain `37734814590` 与 Secrets `37734814595` 同SHA success，Ubuntu20 `113171838806`、Ubuntu24 `113171838941`、Windows24 `113171838734` 全success；Finalizer `37735759743` success、Issue63由automation completed。只消费这个已accepted状态；没有改另一个ownercheckout/index。

Ordered新增own commits：`485190375685d49ffb3eb2920f79830f226c4845`（45-case RED/plan）→ `2935e3c293dbb359a329caaebe1761b954f45ed6`（不同owner要求的16 context cases）→ `baf0fff48599eb0b06ef1a78128836a26adbe7cd`（synthetic旧emptyI邻接harness）→ dependency-only nonFF `93edf92301dd0fe227f9a27b06f01c51c6e982a5`（adopt73d6）→ implementation/test `aeaac76b132d8e70b42fcdab266f1f99ea1213f6` → 本docs-onlycheckpoint（`git log -1 --format=%H -- docs/goals/issue-10/bug-greek-subscript-handoff.md`）。原source commits59cf359/de24c908/fcb116e与source120/helper/oracle不改；`git diff fcb116e... HEAD -- test/fixtures/nature-greek-subscript`为空。原不同owner source CLEAR与45/16 synthetic RED直接复用，没有重做raw/A/sourceaudit或oldreal RED。

最小实现仅 `src/adapters/nature.mjs` 29行新增（28行private `collectPlainGreekSubscriptRun` + 1collector-chain入口）。只接原previous TEXT末尾独立Γ/Ω与直接SUB，其内容恰plain atom或单I/单TEXT的原a/b/i/0；拒绝词/number/identifier前缀、未知前sibling/comment、separating whitespace/wrapper/mixed/nested/link/math附件，以及额外SUB/SUP链。Citation SUP仍由既有typed guard排除在range之外。Nativecode/math及parent literal cues保守opaque，借用已有range/scientificTex/shared marker：**没有第二caption parser、Markdown regex修补、normalizer/validator/security/spec/PRD/EDD/dependency/writer/golden修改**。图注仍是同一scientific pass之后既有protected caption recapture。整parent含literal cue的保守限制沿preflight声明，不声称通用Greek parser。

第一次必要productionfocused实际88tests /84PASS /4FAIL /2585.4961ms /exit1，证据不删除。源三方言四validators已经PASS，native17 isolatedSubscript均归零；失败是旧p13 locator要求plain `Here ν`，accepted styled处理现在保留`Here *ν*`（3styles）；旧synthetic `<math><p>`实际被HTML parser迁至Math之外（1case）。只以稳定原句`is the trap frequency`定位，原Greek oracle/order不改；synthetic使用合法HTML integration point `<math><mtext><p>...`维持真实Math ancestor。独立JSDOM-only检查证明旧Math ancestor false/新true，不以改生产来修错误测试。

第一次 source test的top-level await还导致afterhook过早restore guards，networkreceipt actualSourceClips=0；该receipt **不提供3真实clip的动态zero-network证明**。改为每方言lazy shared result，在test生命周期内恰一次clip，实际counters记录3real+3既有synthetic。没有为填receipt增加额外sourceclip；test运行重复是为修正必要的生命周期与harness，而不是重做来源工作。生产code在两个focused runs之间完全未变。

Corrected focused：WindowsNode24.14.1，`node --test test/nature-greek-subscript.test.mjs test/nature-greek-subscript-boundaries.test.mjs test/nature-greek-subscript-context-boundaries.test.mjs`，**88/88 PASS，2262.0838ms，exit0，0skip/cancel/todo**。Scope=原27（21 paragraph×style role +3validator +source完整性 +2syntheticcompat）+45qualification/rejection/legacy+16context。实际3原sourceclips +3原syntheticdialectclips；实际source7contexts/17native（15body/2Fig5caption）和原MathJax角色sourceorder GREEN，mixed nonzero scientific/inline/citation markers exactonce/subset/order/邻接完整执行PASS，未知边界不猜测。四validators均PASS，warnings严格[]，tables[]。HTTP/DNS guards record-before-throw、after ledger=[]，bindingsRestored=true；parsed DOM finally close。Writer仅有静态调用路径证明，不冒称writer spy。

同run3份完整MD/cache与network/两个synthetic receipts保存到外部 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue64-production/`；默认CI不输出这些文件。Cache-only compatibility检查（新parse/clip/raw/A/sourceaudit均0）核对原8display records/38inlineMath/3citation records与oldac86 cached完全相同；这些仅作旧角色不退化证明，绝不反推新scienceoracle。原6ordered creators、DOI/canonical、Fig5/6、refs连续1–76、17新native记录、全4validator与严格warnings[]均核验。Excerpt90784/SHA227a626...、provenance96355/SHA07e2d0...仍原source身份。

| Closed artifact | Bytes | SHA256 |
| --- | ---: | --- |
| focused-green-initial.log | 10634 | `0cb794a74e64cb48567295148dec69cfe0220691ae2dedc7913c858c239e02d5` |
| focused-green-stable.log | 6770 | `932b105eeeb8d97437dd1b556135e4bbaf6319e50cea3bde375c76fb2e029861` |
| green-stable.network.json | 267 | `b58d3117c4483a32077f09fa1c22ce6f5e6e9c36757d98b5d68c16c0edc5e34e` |
| green-stable.markdown.md | 21830 | `0f58f91b830de6fe23e32342c0da831ca16b57a7b27ca082d877f3ab02fca335` |
| green-stable.links.md | 23502 | `69ae83f75e9fd381433fd8c1f7da51a3505e901a7628f5c812eaf8c134492cc6` |
| green-stable.quarto.md | 11033 | `9e99f46fa894ee3c9694b8eeba8cfcf1354d0ac69683626f1b3db887eead3756` |
| focused-stable-cache-audit.json | 19181 | `b6ddc756dfca899fe4c26623609d8ab1a1adc263a8dfd22e0cff9424774f7159` |

Source/test implementation identity ataeaac76：Nature blob `5342e79f65b8209f5978cbc14481d8f1745d4854`；realtest `c5027f65bb5fed3fec3d23a74928809367097053`；45test `a624e6c4e4f601514cdf30c776d91657f14119e4`；16test `d79e4d6d27e68a9c0c02b0f732be98b8dfede06b`。三份cachebytes/Hashes、first invalid network与终态exit artifacts也在cache-audit记录，初次与corrected三份MD/cachebytes相同不等于初次guards有效。

不同owner在88-case checkpoint增加唯一8个新parse-only probes，发现同一P2 lexical缺口：decomposed Latin/Greek/combining-overlay前缀被错误当成分隔（6probes3PASS3FAIL），astral Letter/Number的低surrogate被单codeunit检查漏判（追加2probes2FAIL）。原RED保存在不同owner external `academic-clipper-issue64-implementation-independent-review/{new-parse-probes-aeaac76.json,unicode-scalars-aeaac76.json}`；未重复原61matrix或原source clips/A/raw。最小修正commit `07be843674b9c4d5f676a3c3ef42c770a6655c4b`，把leftguard改为对完整prefix末端的Unicode `L/N/M/_` 检查，加入5个明确synthetic永久反例；不扩大collector/科学input/normalize架构。Nature blob更新为 `0900530ddfd8a11db7801e0aefa9f31a89d81a08`，21-case contexttest为 `9b085791c50bfbde0583a73173754db6d1aeabe7`，real/45test身份不变。

修正production后必要focused再执行同命令：**93/93PASS，2234.6298ms，exit0，0skip/cancel/todo**，scope原27+45+21；真实3clips与synthetic3clips的同run network ledger=[]、bindingsRestored=true。新三份source MD/cache与此前88-case GREEN bytes完全相同，原scientific17/全4validators/严格warnings[]保持。最新 `focused-green-unicode.log` 7143 bytes/SHA `83660e50a6c7255f6fb8ff5b841a7660e7c3372b1c50cf26a785ed29e3aa0af9`；`context-green-unicode.json` 5817/SHA `0b8a6294c61c973a6e9110c1d26127d7afb4d3e3b352af911162bd008b637e68`，`boundary-green-unicode.json` 11007/SHA `92d230c5aa0a573d9133d0298ea14a933155e96ab78f30339af0a2e85396ca53`。最新same-run结果前缀为 `green-unicode`；对应MD/cache/network hashes复用前表身份，但scope证明来自新的必要运行。93-case证据是最新focused门槛，旧88-only成功不替代Unicode修正后验证。

上述focused checkpoint时尚未接受bug，增量审查/全量门槛当时pending；下列续章记录实际后续验收。Source/oracle无改动无需重做原120blocks来源审计。只有所有十gates满足才允许root narrow #64 PR squashmerge，mergedMain success后自动完成#64并解阻C；Issue10仍须最终统一集成与human-review PR。

## 独立增量 CLEAR 与唯一 full 验证

不同owner报告 `implementation-review-07be843-CLEAR.md`：6223 bytes / SHA256 `a117898de46a31bb6720e8989cdef51029525bbfc9a6c06cd17aeca9d364c8d1`；机器 `independent-delta-07be843.json`：2901 / SHA256 `a2676c87e354a2e8161e93f76ed9a2afaf34c37ad400977a2e1a533456aa313c`，均在外部 `academic-clipper-issue64-implementation-independent-review/`。Root全文核读后明确释放一次full。Reviewer实际只执行5旧P2 failures+3必要positive独立probes，8/8PASS，actual exit0/HTTPDNS[]/restored；不重45/21/source3styles/raw/A120。Source旧CLEAR、最新93同run/cache与protected-scope证明复用。这个incremental CLEAR不自动批准未知未来PR head。

本阶段runtime code `07be843` 与doc checkpoint `7dd01296d9681f9fb4579cd7da0c62d20ae2a3d4` 相同：src tree `ee112c7574f553a0a020bd40d2feab1f262a48c5`，test tree `403d52f3605b6ef15dd2c65bf02c29daa2f69e07`。仅最后README/handoff文档更新不会使源码/测试输入失效，故不重93或full。WindowsNode24.14.1，local committedlockfile/package未变化，原source阶段成功`npm ci`可复用；不宣称本阶段fresh npmci，freshCI负责三平台clean install。

实际执行：

```powershell
node --test test/nature-adapter.test.mjs test/nature-scientific-units.test.mjs test/nature-styled-adjacency-boundaries.test.mjs test/nature-split-power-boundaries.test.mjs test/nature-scientific-citation-boundaries.test.mjs test/nature-caption-citations.test.mjs test/output-quality.test.mjs
npm test
npm run build
npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto
git diff --check
git status --short
```

Affected实际181/181PASS、7229.1683ms、exit0（7个明确文件，不包含原93focused重跑）。唯一 `npm test` actual unified-exec session37892确认live后等待同一handle，terminal exit0：**830/830PASS、98732.2914ms、0skip/todo/cancel**。未因观察等待重启process。Build exit0；只读golden exit0，250inline/13display/50references、math/rawHTML/structure/crossrefs全PASS，原golden无diff。该full是本修复稳定code增量审通过之后的一次必要执行，既有focused/sourceaudit没有为填字段重复。

| Closed final local log | Bytes | SHA256 |
| --- | ---: | --- |
| affected.log | 31441 | `9d394fba266ab3b922c616262f15696c6b43ef42f2c2ae1d1f9f36a94532cc5d` |
| full.log | 99859 | `e2af491fef8c0b7e9211efaf3972b82b625c1efde03e1a0df9de5e796125fd7f` |
| build.log | 164 | `8ef6f2380d64f5c6d9d53d347b10e0f9be3606efae0ccb732bdae148e5a7453f` |
| golden.log | 3018 | `49fe118cfcf91bcbef91e1ec9ffad67f8807589431c6179ffc5cd1a8f8a36498` |

这些closed logs位于同一外部 `academic-clipper-issue64-production/`；各对应`*-exit.txt`为1byte `0` / SHA256 `5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9`。日志不入Git，没有live capture、cookie或credential。最终本docs/README提交的SHA以Gitlog重建；README增加明确简单Γ/Ω-SUB资格与whole-parent literalcue保守边界，没有其他产品/架构语义变更。

Publication：在 same `codex/issue-10-bug-greek-subscript` 固定head发布唯一 narrow bug PR，exact standalone `Refs #64`；PR URL/immutable head/fresh checks由GitHub与root orchestration handoff保存，不创建Issue10delivery PR。最终different-owner publication-head review和鲜三平台CI/Secrets仍必须真实PASS，root才有十gates合并权。不能把本local GREEN称已merged或已完成bug。MergedMain成功后SAME C增量恢复Quantum17body/caption、source expectations与四guards，保持旧source/oracle；完整Issue10验收另由integrator最终统一完成。
