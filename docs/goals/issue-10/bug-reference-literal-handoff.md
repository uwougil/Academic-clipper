# Issue #65 — reference literal 交接

当前状态：`IMPLEMENTATION_VERIFIED_REVIEW_CI_PENDING`。独立 Work Contract [Issue #65](https://github.com/uwougil/Academic-clipper/issues/65) 仍 OPEN / bug。下方原 SOURCE_ONLY 阶段内容保持历史证据，其 pending/未实施措辞只描述旧 checkpoint；最新 accepted main、实施结果及交付 gates 在末尾恢复交接。Issue #10 未完成。

## 基线、所有权与 commit 选择

- Base：`3889f7396eab99060bec88fc8b0dcd3e6712024e`。启动 fetch 后实际 `origin/main` 同 SHA；PR #27 planning `5971ebfbe288e0efed4abef21469f41e2cabb05f` 为祖先。Main CI `37691610523` completed/success，Ubuntu Node20/24、Windows Node24 三 jobs 全 success；Secret scan `37691610455` 同 SHA success。
- Branch：`codex/issue-10-bug-reference-literal`。
- Worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-reference-literal/academic-clipper`。从 accepted main 创建新的 managed worktree；没有改动其他 branch/worktree/index。
- 第1 authored commit：`a07c82734c3e4e8c54b8be9901cf236ffe88092a`，5个 source-only 文件：`test/nature-reference-literal.test.mjs`、`test/fixtures/nature-reference-literal/.gitattributes`、`README.md`、`materials-reference-literal.excerpt.html`、`source-provenance.json`。原11条永久测试、来源 excerpt/provenance、生产未改的真实 RED 证据。
- 第2 authored commit：本交接、第12条明确 synthetic reference math 边界及 README 对测试 scope 的说明。准确 SHA 用 `git log -1 --format=%H` 或 `git log --reverse --format="%H %s" 3889f7396eab99060bec88fc8b0dcd3e6712024e..HEAD` 重建，由最终交接消息报告。不得选择其他 agent 的 dependencies 或盲目 merge 全分支。
- 最终 owned paths 共6个；共享 `src/clip.mjs` / Nature implementation 等 orchestrator 明确串行释放后才可实施。本次没有改生产、validators/security、writer、dependencies、golden、canonical/PRD/EDD、A/B/C contracts 或 helper。

`create-issue` 的 human-settled-intent intake依据为用户 autonomous goal 中来源真值/独立 parser prerequisite 的恢复任务与当前明确分派；`fix-bug` 用于可复现 proof/诊断/永久回归，执行到 SOURCE_ONLY gate。中文为 repository PRD/EDD/goal 的协作语言。已检查 open/closed 语义重复及 #53/#57 完整合同：#53 literal square brackets/legacy math、#57 styled scientific runs、#47/#56/#60 citation/caption 机制均不同。#65 不纠正论文、改变科学值或采用新 HTML 放行策略。

## 来源、界面与新 projection

来源：[Scaling deep learning for materials discovery](https://www.nature.com/articles/s41586-023-06735-9)，Nature，DOI `10.1038/s41586-023-06735-9`。B `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330` 原公开 anonymous raw Buffer，observedAt `2026-10-03T16:44:22.324Z`，506351 bytes / SHA-256 `79f575e1941633c2dbd036682977ea6c274acd5c8c44fdb4648856a00a8d7cc6`；raw 在外部 TEMP，未重采集、未用账号/cookie/private session、未提交 full capture、未复用 PR #13 HTML。

采用 A sanitizer `nature-corpus-sanitizer/1.1.0`、serializer `nature-corpus-subtree/1.0.0`、projection/recipe `1.0.0` 的实际 helper，Git blob `e56f140d9756bb83013b9df0716dc650e04d7917` / Git bytes34946 / SHA-256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`。只读 import B 原 helper；没有编写 sanitizer/hash/replay 基础设施。Windows B physical CRLF helper 的 size/hash 单独记录，不误报为 Git LF bytes。

C 当前 handoff `3d533fb15115ad670e30b52b11ac6435d654c53a` / helper e3ff unchanged；既有 cache-only packet `accepted-3889-materials-delta-source-packet.json`，34429 bytes / SHA-256 `84d93cc4261471a9c5ce20df73a214d8078be5d8d78e0c85211e07436a54ec35`。只复用该 source-role / same-run evidence，没有重跑 C 的 Materials3组合/27source、全部9篇/27组合、13raw/85source审计或 historical full suites。

新 recipe `materials-reference-literal-prefix-2-v1` 包含30完整 source blocks：article metadata/title/canonical/DOI/JSON-LD/全部六 creators、完整 Code availability section、References heading/原 prefix1–2、完整 CC BY4.0 notice/heading、publisher site footer；保留原 ancestors/order/headings/inline DOM、原 scholarly text，未改 `Li<sub><i>x</i></sub>CoO<sub>2</sub>` 或 inequality。references3–71、其他 body/abstract/figures/tables/equations、navigation/ads/executable/session 内容省略。source-provenance 独立记录完整作者及版权/许可；repository code license 不能取代原 article [CC BY4.0](http://creativecommons.org/licenses/by/4.0/) 权利声明。

新fixture为13671 bytes / SHA-256 `89001940e39557ec3d170e70979ce3477757ef107b616d2e77ff83b3ce2b249e`。低于 canonical20–150KiB软目标的理由：这是独立 bug 最小合法 projection，未增加 corpus admission；完整 refs1–2/原可用正文/身份/所有署名/rights足以保存实际机制。不为凑软目标添加无关论文内容，没有放宽 admission 或 hard bounds。没有 image/PDF/XLSX/表格资源、完整 Markdown snapshots。

技术转换为原 A deterministic selection/ancestor scaffold、UTF8无BOM/LF、排序属性、source JSON-LD相关对象裁剪、tracking/private/executable 清理；完整 transformation counts/omittedContent 在 provenance。没有 pretty-print inline nodes、collapse source meaningful whitespace、补造 prose/math/reference/DOM、重编号或修正发表负界。Raw同recipe重复生成与对输出再次 sanitize均 byte-equal；producer审计核验30个 raw prehash、保留原 source text（JSON-LD技术裁剪例外）、all6 creators/refs/rights、Git fixture byte identity。**producer audit不替代独立review**。

## 原 source oracle 位置与正确行为

| 对象 | 原 source位置 / 内容 | raw prehash / frozen digest |
| --- | --- | --- |
| Reference1 | `ol.c-article-references > li:nth-child(1)`，`#ref-CR1`，原 Green/Ho-Baillie/Snaith，DOI `10.1038/nphoton.2014.134` | raw `84f5d0b182626bfcfbcfee7dac7eef33bd7ce85d5967ff55287e2ce0926da6e6`；frozen `c074c5a85f81f504f2971adcc3c6122e126c5f76ca277c7ca0fc095c582593ed` |
| Reference2 | `ol.c-article-references > li:nth-child(2)`，`#ref-CR2`，原 `(0&lt;<i>x</i>&lt;-1)`，可读文字 `(0<x<-1)`；DOI `10.1016/0025-5408(80)90012-4` | raw `0e255b91a472bfacada32b8041e736dbe7ccbae15e28f00a75db89cb113217cb`；frozen `9892d49c445a2e6e0321a3c4865b1fd7c52de6e379be2ac212ba1f34ed7c3f7f` |

Digest依 A serializer计算DOM subtree UTF8 bytes，绝非 HTTP byte offsets；raw与frozen因 tracking清理不同，不能混用。两条文献完整source text、全部 original scientific i/b/sub节点序列、DOI/href、ordered source IDs、原 body文本与source hash都在provenance；三方言引用keys为 `Green2014` / `Mizushima1980`。

正确行为：保留两个字面小于号、原 x 和原负界 -1；reference renderer应输出安全可读 Markdown，`links` 仍只允许 strict兼容anchors。不能将 title纠正成别的 inequality、标为额外公式、删除题名或降低 rawHTML规则。既有 reference text的science-tag扁平化（LixCoO2）不是此次修改范围；fixture完整保留 originalDOM，test不声称恢复引用中所有原styled语义。

该 excerpt 无table/figure/equation；expected warnings精确为 `No Nature figures were detected.`、`No equation nodes were detected.`。permanent preflight在任何clip之前硬断言 tables/figures/同article tablelinks为空，hydration无operation；real `clipNature` 只返回结果、不调用 `writePaper` 或下载图片。普通流程没有live DNS/HTTP/新acquisition、global fetch/DNS mutation、writer或papers写入。这里没有D seam/replay资源场景的声称；fullMaterials/C原ledger复用既有证据。

## 第一 invalid state 与未实施最小提案

外部 stage trace按真实生产组件执行一次，未在永久 test复制parse/normalize pipeline：Nature `extractReferences()` 输出正确 literal text；`referenceText()` 先 `escapeHtml` 正确得到 `&lt;`；Defuddle `htmlToMarkdown()` 正常把文字实体返回裸 `<`，academic/math阶段不变；`referencesMarkdown()` 在同一行末尾追加 `<a id="ref-2"></a>` 后，audit从 `<x`读到后面anchor的第一个`>`，首先报 x tag。trace中 normalization后 rawHtml valid=true，assembly后false；最终真实links line31/column72（完整C同源 line411/column72）。Line是诊断定位，不是永久oracle；永久RED断言actual生产validator与完整source语义。

未实施提案仅限 reference text→Markdown assembly 的literal编码边界，兼容anchor仍由renderer单独生成，保留DOI/keys/order/defaultfootnotes/QuartoBib。可用安全literal `<` entity表示；真正的已有math/code保留原opaque身份，永久`$x<1$`控制防止全局HTML转义破坏TeX operator。不要全局unescape、放宽rawHtml、修改科学source，或重新实现Nature/Defuddle。正确实现方法仍须未来owner在source/review gate后证明；本提案没有生产diff。

Materials r2SCAN / mScm−1、Greek、isotope、split-power、table captions及styled adjacency都独立。本source-only不承担这些失败、不改变C oracle，也不据validators成功宣称整篇Materials通过。

## Exact commands、结果与防重复说明

External root为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-reference-literal`，下文 `<EXTERNAL>` 指此处；B raw为外部 `academic-clipper-issue10-agent-b/s41586-023-06735-9.anonymous.raw.html`。这些脚本/日志是临时diagnostics，不提交第二parser/完整capture。

| 实际 command | 实际结果 |
| --- | --- |
| `git fetch origin`；`git rev-parse origin/main`；`gh api repos/uwougil/Academic-clipper/actions/runs/37691610523`、`.../jobs`；`gh api .../37691610455`；planning ancestor check | accepted3889同SHA、Main三jobs/Secrets成功、planning祖先exit0 |
| `gh issue list --repo uwougil/Academic-clipper --state all --limit 150 --json number,title,state,labels`；另按less-than/rawHTML/reference/brackets/inequality搜索；`gh issue view 53/26/57` | open/closed语义查重与合同边界核对，无等价Issue |
| `npm ci` | exit0，65 packages；lock/deps未改；继承acceptedmain既有1high advisory，不执行audit fix，也不声称零vulnerabilities |
| `node <EXTERNAL>/freeze-source.mjs` | exit0，13671bytes/30blocks；原两条refs/作者/rights；repeat/idem/sourcehash PASS。最后仅更正source-derived无figures warning合同，不改HTML；`freeze-source-final.log` |
| `node <EXTERNAL>/reproduce.mjs` | exit0为report成功，不是validator全通过；一次外部stage+3个real clips：default/quarto四guardsPASS、links仅rawHtml x FAIL；metadata/reference/source未变 |
| `gh issue create ... --label bug --body-file <EXTERNAL>/issue-body.md`；`gh issue view 65 --json number,title,body,state,labels,url` | #65已创建、完整readback OPEN/bug，无PR或auto-close |
| `node --test test/nature-reference-literal.test.mjs` | 冻结第1commit实际11 tests，exit1，8PASS/3FAIL，0skip/todo/cancel，1242.0399ms；`focused-frozen-baseline.log`。真实source FAIL只有links rawHtml，另2synthetic literal安全encodingFAIL |
| `node --test --test-name-pattern='synthetic reference code' test/nature-reference-literal.test.mjs` | test harness改成真实typed `<code>` 后定点1PASS/0FAIL，853.3793ms；lazycache没有额外real-source clips；`typed-code-control.log` |
| `node --test --test-name-pattern='synthetic existing reference math' test/nature-reference-literal.test.mjs` | 新增第12条 reference-text已有TeX`$x<1$`/`$x+1$`控制，exit0，1PASS/0FAIL，0skip/todo/cancel，709.4158ms；未重跑真实source三组合；`reference-math-control.log` |
| `node <EXTERNAL>/audit-checkpoint.mjs` | producer audit exit0：30raw blocks/source text、Git source bytes/hash、2 refs/6作者、path/secret/protected-files检查PASS；独立review仍pending；不调用clip或网络 |
| `git diff --cached --check`；`git diff --check`；`git status --short`；tracked/diffnames审计 | sourcecommit后check exit0/status空，5ownedpaths；交接commit后重新check/status与6ownedpaths由最终消息报告 |

当前registry12 tests；第1commit11条full-focused真实执行8PASS/3FAIL，第2commit只加第12条并定点1PASS。这是可对应的两个scope，不写成新12条一次full-execution，也不再为doc-only或新synthetic控制重跑真实文章。full/npm test、affected-wide suite、build、golden、PR/CI均未运行：SOURCE_ONLY仍有真实RED、生产未改、sharedimplementation未释放。以后修复后须按bug合同完整运行，不能用这些窄source结果代替。

恢复收尾时检查 Windows 实际 Node process command lines，没有属于本 worktree 的 test/freeze/repro subprocess；已有 focused/math-control logs 均包含 terminal totals，未启动新 clips 或 tests。`node <EXTERNAL>/final-checkpoint.mjs` 只核验当前六个 Git 文件与 external evidence 的 bytes/hash、旧 producer receipt、protected diff/status；30-block source audit复用原 `a07c827` receipt，不再次解析 raw 或 regenerate。原 `checkpoint-audit.json` 保留为旧5-file审计，新增 `final-checkpoint-audit.json` 对精确最终 HEAD 记录6-file身份、旧来源审计引用与clean状态。随后 `git push -u origin codex/issue-10-bug-reference-literal`，并以公开 Issue comment记录 ordered commits/交接路径与 SOURCE_ONLY gate；没有 PR。

失败/纠正保留：external import initially用Windows path而非fileURL，修为fileURL；helper34946是GitLF、physicalCRLF35430，先拒绝混用后用`git cat-file blob`核对Gitidentity；原 rights selector选到2p，改为唯一含CClicense link的完整p，source text未改。初版warning预测遗漏NoFigures，核对生产无figure policy后修正provenance（HTML/hash不变）。第一次11条prototype7PASS/4FAIL，其中第四FAIL是把plain reference.text反引号当DOM code的测试设定错误，改为明确synthetic `<code>`，原日志保留；随后补全实际orderedauthors断言重新执行最终11条。原错误不算来源缺陷，不覆盖初次logs。若要恢复任务，使用最后immutable来源及精确scope日志，不重复已知RED/Cstage/acquisition。

## 文件与外部 evidence identities

Git source fixture：13671bytes / SHA `89001940e39557ec3d170e70979ce3477757ef107b616d2e77ff83b3ce2b249e` / blob `99df7cc9e9db59a75260ed8fea31343839e00050`。
Git provenance：21728bytes / SHA `5fddc36377682eea4b7fdd9755212d070ffa0ae5dda6bdd36491f83b01279914` / blob `5b8ab4a625e33dcbd03d500474af9dd6b3b096aa`。
最终12-test源码：11147bytes / SHA `8cc8fb3d8e730c727715ed909274676b31196e3e0c2d401af6053be8303020dc`（source commit旧11-test源码10573bytes / SHA `5c6e4c0a272e9a879c2dd990d9050ad1c14096ce37a888ba13a4f2591102fb31`）。

| 外部文件 | Bytes | SHA-256 |
| --- | --- | --- |
| `reference-stage-trace.json` | 1879 | `34f8751a8d9d7724f9d7b013cccf8ddaa3172776c9939415e3604d648d040801` |
| `reproduction.json` | 15282 | `913f0dd6d4be139b9fb63cfa1a6a7672c48816d890471b05ccf6ba39b81e94ad` |
| `freeze-source-final.log` | 1065 | `19925ffff423b24626a961cc4974f7f44e0d1f9d85237d8fca98d00e6ebd9683` |
| `focused-baseline.log`（初版设定错误保留） | 4665 | `e76b24a0318e79660bd17045124f4d614bbf314748f440074c2ba8b7b6c34f89` |
| `focused-frozen-baseline.log`（最终11scope） | 3649 | `d25f842fe40e8dd93ffc9ec3b3243ab9dff8205c72a49c3777f22de014f69f93` |
| `typed-code-control.log` | 222 | `7af2bd491e154be8eab1e13a15914c87b78cb368384a54d275429f1aafaa81d6` |
| `reference-math-control.log` | 210 | `6c53fba3c1e918236ff1247367888ce48713de34a7a7fb8a4ea5b7c390e485b0` |
| `freeze-source.mjs` | 8608 | `d1d3843ef3b2851dd57a8434c9c96775338b2564b62c2b5bdd2f9752ffed5b9b` |
| `reproduce.mjs` | 3887 | `aa30f6432690c826b3181464f87404a62b5cb4383cf3da8cc4b717134612f39e` |

最终`final-checkpoint-audit.json`在外部记录实际finalHEAD/全6Git文件sizes/hashes与protectedempty，并引用旧`checkpoint-audit.json`中的已核验30-block来源结果；只做byte/doc审计，不重跑clips或raw解析。本doc自身hash在最终消息/外部receipt给出，避免自引用。没有 proposed spec change。

## 重新启动与C解阻条件

1. 独立reviewer在精确finalHEAD审阅本30-block projection与来源rights/原DOM/referencesprefix、produceraudit/原raw/真实RED；原B/C对其他projection审核不能替代。出现source错误返回此owner修正recipe/provenance，不能改科学内容。
2. Root释放sharedproduction gate后，恢复同一owner/branch；使用届时最新accepted main合入依赖，不改另一个agent分支。再按#65合同做最小reference text safety修复，保护typedmath/code、strictanchors/source title/order/DOI/keys，不扩大其它body scientific角色。
3. 修复focused+affected+full/build/read-onlygolden和freshCI/Gitleaks、exactHEAD独立review全部通过后，root才可按goal严格门槛merge唯一#65bug PR；mergedMainCI成功才接受为新main/automation完成此bug。当前#65保持OPEN。
4. C在新acceptedbase做必要Materials3dialect delta，复用原oracle/reference2 source身份；链接参考文献rawHtml必须由真实生产链路转PASS，不能改helper/validator/oracle或把此生产RED降成expectedwarning。Materials其余10 scientific failures仍各需独立解决，不能因#65解除宣布wholeMaterials/Issue10完成。
5. 最终Issue10 integrator仍需canonical完整85×3/27 validators/resource/warnings/repeat/ABA/bibliography/golden/fullverification。此新source-only不解锁最终integration，也不创建普通#10deliveryPR。

## 恢复实施交接 — accepted a5b6 / immutable f740

2026-10-08 恢复同一 owned branch/worktree；root 根据 orchestrator §22 明确释放 sole shared-production gate。原 source-only checkpoint `aea33123c464c45273b6d3ced83a8d4478a1d88b` 启动 clean，无活跃旧 implementation handle。`git fetch origin` / actual API 核验最新 accepted main `a5b6acc2984af5cb8b82106291e963f4f413f5ac`；Main `37716530268` completed/success、三个 jobs成功，Secrets `37716530267` 同 SHA success。该 main 已接纳 #61；没有从 pending main 冻结输入。

Ordered branch commits：

1. `a07c82734c3e4e8c54b8be9901cf236ffe88092a` — 原 source/test。
2. `aea33123c464c45273b6d3ced83a8d4478a1d88b` — 原 source-only durable handoff / synthetic math control。
3. `e41058831c4c4d29f9baa2b504121a63d94890f3` — 非破坏 dependency merge accepted `a5b6acc`；保留原 source-only commits，不选择其他 agent 的未接纳 branch。
4. `1fd67c8e2d9b6cf46fbedfd7e07656cd1d23ea5b` — 新 synthetic-only boundary RED checkpoint；不重跑已知三 source clips / raw30审计。
5. `f740caab2014985088125b6c2b3d6faad8ee38ae` — 最小生产修复及最终36-test registry / no-network guards。
6. 本恢复 handoff / fixture README doc-only commit — 实际 full SHA 从 final branch head/readback 重建，不存在循环 self-SHA claim。

最终 #65 相对 accepted a5b6 只含7 owned paths：`src/clip.mjs`、`test/nature-reference-literal.test.mjs`、`test/fixtures/nature-reference-literal/{.gitattributes,README.md,materials-reference-literal.excerpt.html,source-provenance.json}`、本 handoff。Source/provenance 与第一 source commit 原 bytes 完全相同。canonical/intent/plan、A/B/C contracts、Nature/adapters、normalizers、validators/security、writer、dependencies/lock、CI、golden 零diff。No raw full capture、credential、generated artifact 或 Markdown snapshot 入Git。

### 独立源审核复用

`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue65-independent-source-review/issue65-source-review.md`，10776 bytes / SHA `c3177a697b871a68a60a88674e2bdf1bae512cbe00928de3bf7c76a6bb317521`：`SOURCE_PROJECTION_CLEAR` / zero blocking source findings。精确 reviewer head aea、全部30 blocks、原六 creators、source refs/DOM science/prefix、CC BY4.0、actual A API regeneration/repeat/idempotence和producer/source identity均已独立核验。复用这份版本化审核；本恢复没有重新 parse raw、再 sanitize、重新 acquisition 或重跑原 C Materials cache。原 source transformations/omissions/hashes/oracle positions与上方相同。

### 最小修复与边界证据

首个 invalid state 保持上方真实 trace：Defuddle 返回普通 `<` / Markdown `\<` 后，reference line 与兼容 anchor 拼接被严格 audit 当成 x tag。私有 `encodeReferenceLiterals()` 只被 `referenceText()` 调用，在现有 Defuddle/math/academic 后、DOI和anchor追加前编码 prose `<`→`&lt;`、`&`→`&amp;`。既有 `maskCode()` 保护代码；完整 dollar candidate 仅在原 `validateMathDelimiters()` 与 strict `validateRawHtml()` 均 valid 时保持 opaque，不把成对 dollars 内的 literal `<span>` 授权成公式。反斜杠奇偶按实际位置检查；移除 Defuddle 对 literal `<` 的一个 odd Markdown presentation escape，保留原 literal backslash 的 escape pair。没有生成新 TeX、重新解析 scholarly DOM、修改 validator 或全局 encoding/unescape。

Ampersand编码用于区分原可读 `&` 与原字面 entity拼写 `&lt;` / `&amp;`；经过一次 entity/Markdown presentation decode保持原 source spelling，不双重decode来凑 oracle。旧 typed DOM code/MathJax/citation control和 `$x<1$` / `$x+1$` 原 math guards保持。额外24 synthetic renderer controls覆盖两输出参考文献方言的 inline/display math旁literal HTML、escaped currency、未闭合dollars、literal entities、foreign anchor、pairedcurrency/fakeHTML、原literal backslash及even backslashes前真实math；quarto引用部分既有refs/Bib契约真实source测试覆盖。Malformed dollar控制只断言literal安全与原值，不声称 malformed math应通过math validator。

第一次 novel16 scope在 accepted a5b6：0 PASS /16 FAIL，7936.7537ms。10项实际 strict rawHTML FAIL；2项原 literal entity-spelling readable FAIL；4项 escaped-dollar输入与Defuddle既有backslash呈现比较 FAIL，不能冒称为 #65 parser RED。外部 preflight actual Defuddle输出保留；后续这些控制只消除比较器的成对 presentation backslashes，原 valid math byte guard仍独立 exact。一个 escaped-dollar-inside-TeX case显示 inherited Defuddle doubling，不将该 unrelated TeX行为固定成永久expected坏值，而改为有效 `$x<1$` 与escapedcurrency相邻的控制。初始16和preflight日志不覆盖。新增8个控制仅作为后修复边界保护，没有伪称已在旧main执行RED。

Literal原 `(0<x<-1)` 不纠正为其他边界、不改原 sub/iDOM；在 source actual links 输出为 `(0&lt;x&lt;-1)`，可读原值、原2refs/order/DOI/keys/all6authors/exactwarnings均保持。三个 actual source clips四validators全部PASS，科学fragment无orphan。No table/figure/resources；精确warnings还是 `No Nature figures were detected.`、`No equation nodes were detected.`。

普通测试额外记录 global fetch / DNS callback / promise lookup attempts；即使fallback吞掉异常，after仍硬断言空ledger，复原全局/builtin binding。实际 `networkAttempts=[]`。Writer依据 production `clipNature` 返回路径静态无 `writePaper` 调用，未声称 runtime writer spy；不写papers。显式 `NATURE_REFERENCE_RECEIPT_ROOT` 仅保存同一次实际3source结果到外部TEMP；普通invocation不写receipt、没有再clip来补证据。

### Exact implementation verification

下表 checks针对 immutable implementation `f740caab2014985088125b6c2b3d6faad8ee38ae`：src tree `72387d4155e79a38224daac3de60e56c325f7768`，test tree `57094a6273d64d56447b5b40b0b553045b6496a3`。最终 README 属于 test tree 的 doc-only差异；永久执行 `.test.mjs` 与 src identity保持，不能因此声称最终整个test tree仍同SHA。Full后只改本handoff/README，不重复full/focused/affected或源审计。

| 实际 command / scope | Terminal result |
| --- | --- |
| `node --test --test-name-pattern='synthetic renderer boundary:' test/nature-reference-literal.test.mjs` 初次accepted baseline | 16/0PASS/16FAIL，7936.7537ms；上方区分10+2+4原因，无real-source clips |
| 新边界逐步验证 | 初16 PASS 690.3445ms；新增4 safety PASS 688.7225ms；最终24 boundary PASS 685.4397ms；分别scope，不伪称三次完整36 |
| `node --test test/nature-reference-literal.test.mjs`，显式外部同-run receipt | **36/36 PASS，1175.7502ms，exit0**；3source clips各一次，network attempts空 |
| `node --test test/nature-adapter.test.mjs test/output-quality.test.mjs test/aip-adapter.test.mjs` | **43/43 PASS，6264.0575ms，exit0**；共享reference renderer直接消费者/validators/Bib/dialect，未扩大其他publisher |
| `npm test` | **640/640 PASS，81990.5797ms，exit0，0skip/todo/cancel**；actual session90928先confirmed live后terminal，只执行一次 |
| `npm run build` | exit0；dist generated且ignored，不提交 |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0 / valid=true，250inline、13display、50refs、fourguards PASS、scientificFragments zeroissues；golden零diff |
| `git diff --check` / `git status --short` / tracked-diffname/protected paths审计 | PASS；提交前仅本README/handoff doc edits，最终doccommit后clean/readback |

`npm ci`复用原source-only accepted lockfile install receipt；latest accepted合入没有package/lock/deps变化，无重新安装需求。Fresh PR CI仍必须实际运行npmci/全tests/build/golden三个platform，不以local缓存替代。没有npm audit fix、dependency更新或advisory豁免。

External evidence root `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-reference-literal/`：

| 文件 | Bytes / SHA-256 |
| --- | --- |
| renderer-boundaries-accepted-a5b6-red.log | 12806 / afc25082ddcd78b371bb2675ddcdce1f47b5f334c339d581c516b1a1653420c3 |
| boundary-conversion-preflight.log | 706 / d9054bc34f6a2c18123d7220055019e8268ab34378e1e501fd36c1598dfee01c |
| focused-implementation-green.log | 3398 / d8beab66f45d5e69924b9175a0c289c4dd492d405c61970b2f5734c8b9bbe2a8 |
| affected-reference-renderers-green.log | 3684 / 67192677178888828e650dfda0b2ad77c9eba3e77e5a47042336ee534bb36925 |
| full-f740caa.log | 84036 / 3287666f4a9d20e21a7c8545e72039e750b10d14f6bf7e9041633d0f8eee379b |
| build-f740caa.log | 174 / 29bb2fc3db9bbbaa086603e3760889fc756348e7a100307b70d3b1ca87609e1c |
| golden-f740caa.log | 3018 / 49fe118cfcf91bcbef91e1ec9ffad67f8807589431c6179ffc5cd1a8f8a36498 |

Same actual focused3 clips在 `green-a5b6-final/`，不是额外clips或committed snapshots：

| Dialect | actual Markdown bytes / SHA | actual full result cache bytes / SHA |
| --- | --- | --- |
| markdown | 1254 / 2812a02959b59dfd1fc9175250a9273438e4656b212477ef8660701aab694c00 | 31365 / d4390344ab040d404577052da67a27fa11ce31055590e00f439cf90f30ebcd25 |
| links | 1286 / bea28669499d5b1f3f8e4b2f6ea25eb5f9f07e00d3aff3b1dce5af1b15ee08da | 31429 / 392f6695a8793c6b8673ee74e8afe6bd4e95c49f405c01e3ddb379c587c74d5c |
| quarto | 846 / 60b28b76638803532b15b58ff70a244460b4901dce75ee9eab1c655b99e96be8 | 30526 / 8335eecf2952ebba3405376a72db3b8c80c457ba2164338ae5b0108339abfb65 |

`network-ledger.json`135bytes / SHA `e30d302a4958c650050cd76b1f90fca3ed4244877c942913179fa32f187aeac9`，attempts[]与静态writer proof。`implementation-receipt-f740caa.json`记录所有Git LF bytes/blobs、actualsame-run cache/MD equality、source/protectedzero diff和logs；finalhead/hash在公开PR/最终交接readback报告，避免selfhash。本receipt只是bytes/log汇总，不执行raw/sanitize/clip/full。

### Delivery / remaining gate

仅为 #65 创建唯一final bug PR，exact standalone `Refs #65`；不承担普通Issue10 delivery PR责任。Owner不merge、不手动close。需要fresh三platformCI/Secrets、不同owner exact-final-head implementation review zero blockers，root十项gate全部满足才可自动squash merge；mergedMain同SHA成功后接受base并由automation完成#65。

独立source gate已清；independent implementation review与freshCI在final PR发布时pending，不能由producer640PASS替代。C下一步在accepted #65 fix上使用既有oracle、做Materials三dialect source delta，原reference2 rawHTML必须真实PASS；不要重审raw30或替换source值。r²SCAN/compound units等其余science缺陷仍独立，wholeMaterials与Issue10尚未完成。未修改intent/spec，未提spec changes。
