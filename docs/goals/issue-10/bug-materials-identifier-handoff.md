# Issue #68 — Materials identifier SOURCE_ONLY 交接

状态：`SOURCE_ONLY_UNFIXED`。独立 [Issue #68](https://github.com/uwougil/Academic-clipper/issues/68) 已创建为 OPEN / bug，未实施生产修复，无 implementation PR。本 final81-block projection 的独立来源 review pending。Issue #10 未完成。

## Base、界面、所有权和选择顺序

- Base：`3889f7396eab99060bec88fc8b0dcd3e6712024e`，Main CI `37691610523` Ubuntu Node20/24、Windows Node24 与 Secrets `37691610455` 同 head成功。Planning PR27 `5971ebfbe288e0efed4abef21469f41e2cabb05f` 为祖先。创建时 root 指示 merged60的Main尚未accepted，故从3889新建，不从pending merge开始。
- Managed worktree：`C:/Users/guoli/.codex/worktrees/issue10-materials-identifier/academic-clipper`；branch `codex/issue-10-bug-materials-identifier`。没有修改旧65或任何其他agent checkout/index/branch。
- First authored source commit：`7d64103cc89474675119740d75a20a8b937fc6cc`，5 paths：`test/fixtures/nature-materials-identifier/.gitattributes`、`README.md`、`materials-identifier.excerpt.html`、`source-provenance.json` 和 `test/nature-materials-identifier.test.mjs`。
- Second authored commit：本 durable handoff；确切 SHA 在最后checkpoint消息和external receipt给出，可用 `git log --reverse --format="%H %s" 3889f7396eab99060bec88fc8b0dcd3e6712024e..HEAD` 重建。总6 owned paths；不得盲merge整个其他agent branch。
- `create-issue` human-settled-intent：明确 autonomous source-only intake授权、真实原科学角色与既有PRD/EDD契约；open/closed所有Issues语义查重，额外搜索r2SCAN/identifier，并完整核对48/53/56/57/61/63/64，无等价outcome。`fix-bug` 执行到source-only proof/diagnosis/regression gate，不包含尚未授权的shared production实现。
- A actual helper blob `e56f140d9756bb83013b9df0716dc650e04d7917`，34946Git LF bytes / SHA256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`；原 sanitizer `nature-corpus-sanitizer/1.1.0`、serializer `nature-corpus-subtree/1.0.0`、recipe/projection1.0。只读import B原helper，未复制实现或发明incompatible schema。
- B source commit `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`；C current `3d533fb15115ad670e30b52b11ac6435d654c53a`。C cache-only source packet `accepted-3889-materials-delta-source-packet.json`34429bytes / SHA256 `84d93cc4261471a9c5ce20df73a214d8078be5d8d78e0c85211e07436a54ec35`。未重跑C3/27 clips、9articles/13raw/85oracles、历史full suites，也没有改C源码或期待。

## 来源、rights、一次final projection

[Scaling deep learning for materials discovery](https://www.nature.com/articles/s41586-023-06735-9)，Nature，DOI `10.1038/s41586-023-06735-9`。复用原anonymous raw Buffer，observedAt `2026-10-03T16:44:22.324Z`，506351bytes / SHA256 `79f575e1941633c2dbd036682977ea6c274acd5c8c44fdb4648856a00a8d7cc6`。raw只在external TEMP，未用cookies/credentials/private sessions，未重新acquisition、未复用PR13 HTML、未提交full capture。

先静态核对全部9个C body/caption位置，另发现必须保留的原H3/H4中各1个同角色，才制定final recipe，没有先audit错误subset再补论文。完整inventory11=9body/caption+2headings。Fixture68630bytes / SHA256 `443e7defac512d8f1ce87a50c0d353ff3930c85f321a859fea25dff7a66fbe69`，81blocks / recipe SHA `7055cabd92c3c0fcbb2b7e2200fa00fae734411da1afa645f5ffb68bc0519329`，在20–150KiB目标内。只输出一次final fixture/provenance；A repeat/idem三次计算byte-equal不是新的采集或多个最终格式。

保留5个完整paragraph contexts、完整Fig2 wrapper/image candidate关系/全部panel caption、必要原headings levels与ancestors、canonical/DOI/title/date/JSON-LD、全部6ordered creators、原References prefix1–43、完整原CC BY4.0 notice/heading与独立site footer。保留最高选定citation43，未重编号。Fig2完整source还提供原Fig2d target；所有source scholarly文字/SUP/italic/bold/units/citation节点、case/原意味空白/先后关系不变。

Ordered creators为 Amil Merchant、Simon Batzner、Samuel S. Schoenholz、Muratahan Aykol、Gowoon Cheon、Ekin Dogus Cubuk；provenance保留原meta顺序 `Merchant, Amil` 等。源 material 使用原 [CC BY4.0](http://creativecommons.org/licenses/by/4.0/) notice，不能由repository code license替代；`© 2026 Springer Nature Limited`明确仅为site footer，不编成article版权年。

Transformations限于A完整semantic block选择/原ancestor scaffold、UTF8无BOM/LF/attribute排序、相关article JSON-LD裁剪、tracking/private/executable清理；完整operation/count在provenance。没有pretty-print inline nodes/global collapse whitespace或造prose/TeX/authors/citation/DOM。省略全部其他正文/abstract/figures/tables/equations、References44–71、navigation/ads/session/executable内容；无image/PDF/XLSX/table binaries或Markdown snapshots入Git。Methods p42 `mScm<sup>−1</sup>` unit排除，C既有原source/失败证据保持，不属于本identifier合同。

## source oracle、位置、attachment与标题

原p index在原section内`querySelectorAll('p')`零起算，包含caption；frozen投影index可能不同，不能混称。Oracle中的 stableselectors保留原source reference anchor/heading ID，raw/frozen原DOM均核验唯一。正文role逐项记录base r / SUP2 / suffix SCAN、之前/之后原text、同段落UTF16 offset、rawHTML UTF16 start与rawUTF8 start/end byte offset。Raw byte offsets来自JSDOM原node location与原decoded字符串前缀UTF8 bytes，不是subtree digest或DOM text offset。所有原raw prehash、frozen digest分开。

| 原位置 / role count | Raw prehash | Frozen digest |
| --- | --- | --- |
| Main a-section-1 p2 /1 | `13879004c6bdfc0f8919bf4aae21b7c2dcbf3e057ca85daf77174f2c6b717687` | `92b04249b290ef4c1aa130aedce9be4508cc4ffa8e65f3a8b1f27f872c6836ee` |
| Discovered stable crystals a-section-4 p2 Fig2 caption /1 | `7411a00492e4f18329c6b732f410ca475376ac7d3b2a1b662535c41eb1784905` | `877fb21b9e26480533a157277c605abc871d076494deffa98b3aef2d47331d0c` |
| 同section p5 /3 | `3440d3b012be7af1589f2418a4ed762f9b0696f3ebba55d48158453c91a095f4` | `44c85a3f59d6457f8509724712fa618f26c20c7a7cf13745a72aca670ed9fa3b` |
| Methods a-section-6 p25 /3 | `60a8bdd9120069f1869adb027b67bdb65386efeae662cecc66009b7cb0383f2e` | same |
| Data availability p0 /1 | `2d2e26531f19fe9315af3b924ef1f7c1b79a8f21598589dc83993af088d89f75` | same |
| H3 #Sec7 /1 | `e1ba1824e3e1a4d84358faa175b14c30f234cfddf3af996eb0060851b035de00` | same |
| H4 #Sec33 /1 | `233ddf198b2cef3cea8b897146077c29ca65bdbff5e2bf817d082155f2ed7b3f` | same |

Source角色：2是原r的superscript，SCAN是连续suffix，没有原空格；不是following isotope元素、unit、citation数字或新的display。永久semantic oracle允许保留源关系的等价Unicode `r²SCAN` 或TeX（字体可等价，base/exponent同一表达式、suffix连续），不以当前parser生成输出定义期待，不把`r$^{2}$SCAN`当作attached。每个完整context中的源count和顺序均检查。

标题单独保护：原Sec7 `Validation through experimental matching and r<sup>2</sup>SCAN`、Sec33 `r<sup>2</sup>SCAN`。已有C缓存三方言标题分别在markdown87/257、links89/260、quarto74/194输出平`r2SCAN`；新excerpt同次cache位置为markdown37/51、links38/52、quarto34/42。两个标题仍保留level/text序列，但script身份丢失；不能称source semanticPASS。

## actual一次clips、第一invalid state与未应用提案

永久test每dialect只clip一次并缓存，metadata/citation/refs/各context/4validators共享结果。当前3records含1Fig2、43ordered refs、7citation clusters：`[15,16,17,27] [28] [17] [29] [39] [40,41] [29,42,43]`；第一组含4个numbers，不能混用cluster和number数量。每个方言math9isolated SUP FAIL，标题2个silent failure另算；source-derived display0。Structure/crossrefs三方言PASS；rawHTML markdown/quartoPASS、links原ref2有独立#65 `tag=x` FAIL。Warnings三方言精确`No equation nodes were detected.`，不能wildcard放行或称整篇Materials/Issue10通过。

最早共同缺口是Nature缺少plain identifier/SUP/suffix的typed range。Prepared body/headings保留原SUP；正文Defuddle输出`r<sup>2</sup> SCAN`，academic `renderRange`第一次产生`r$^{2}$ SCAN`，现有`combineLiteralPowers`只接受numeric/unit base且不吞followingletter，不能恢复r。图注同原role经既有caption normalizer，输出`r$^{2}$SCAN`。标题SUP到prepared DOM仍在，但真正Defuddle heading converter首先丢SUP为`r2SCAN`，academic/math阶段无法再恢复；没有凭顺手词法猜造原脚本。

未应用最小提案：在Nature原DOM与existing scientific typed-range boundary识别已证明的plain base+真实SUP+continuous suffix角色，并以既有semantic run保护原r/2/SCAN，覆盖body/caption/headings的同一源角色，避免两种downstream丢失。保留opaque MathJax/code/citation与未知prose边界，不generic allSUP、不硬编码article/r²SCAN句子、不全局Latin/Markdownregex、不增加第二parser/heading formatter。如果正确实现需要独立heading架构/renderer重写，应提出新Work Contract协调，不能以本source preflight自动扩大生产scope。

原noncitation SUP inventory中还有实际 `atom−1`（Main），不混作identifier；Methods p42 compound unit、61leading mass/64Greek/63split SUP与此处role方向/边界不同。没有修改它们以适配当前output。

## commands、scopes、失败与纠正

External root：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-materials-identifier`，以下`<TEMP>`指此处。只保存temporary diagnostics/caches，未提交full raw orfullMarkdown snapshots。

| command | actual result |
| --- | --- |
| `create_worktree(ref=3889...,name=issue10-materials-identifier)`；`git switch -c codex/issue-10-bug-materials-identifier` | 隔离新managedworktree/branch，acceptedbase；原65 untouched |
| `npm ci` | exit0，65 packages/committed lock未改；继承main已有1high advisory，未audit fix/改deps，未称零vulnerabilities |
| `node <TEMP>/inspect.mjs` | 一次static原DOM核9roles/5contexts+2headings；只写external plan，不生成fixture或clip |
| `node <TEMP>/freeze-source.mjs` | exit0，final81blocks/11roles/source/C位置/all6creators/43refs/rights，原A repeat/idemPASS，68630bytes同唯一hash；无clips/acquisition |
| `node --test test/nature-materials-identifier.test.mjs`（显式external evidence env） | exit1；实际32=4PASS/28FAIL，0skip/todo/cancel，1383.7043ms；原3realclips同runner cache/MD/records写external |
| `node --test --test-name-pattern=synthetic test/nature-materials-identifier.test.mjs` | 只运行更正后的3 constructed controls，3PASS/0FAIL，934.6827ms；无newrealclips |
| `node --test --test-name-pattern='synthetic unknown prose' test/nature-materials-identifier.test.mjs` | 新negative collector控制1PASS/0FAIL，744.4098ms；一次synthetic parse、无realclip |
| `node <TEMP>/trace.mjs` | correctedactualNature `defuddleToMarkdown(page.document)` stage；heading最先Defuddle丢script、body academic最先isolated，1个外部synthetic code diagnostic；无wholeclip/raw reparse |
| `node <TEMP>/evidence-summary.mjs` | cache-only读取原3records/MD/测试日志，输出exact hashes；不clip/parse source/重新sanitize |
| `gh issue list --state all --limit150 ...`；`gh issue view 48/53/56/57/61/63/64`及r2SCAN/identifier搜索；create/readback68 | 无等价outcome；#68 OPEN/bug，一独立Work Contract；最终精确Refs68/selectedSHA公开comment |
| `git diff --check`；`git status --short`；tracked/diffnames audit；最终byte checkpoint/push | 最终6ownedpaths/clean、protected diff空，实际finalHEAD/ hashes由externalreceipt和最后消息记录 |

永久registry33不是新33条一次execution。原29个real/source/guard/metadata registration结果为4PASS/25FAIL且输入/oracle未变；原32run额外3synthetic初版FAIL。更正synthetic控制3PASS，加新unknown控制1PASS；这些不同scopes必须分别描述，不能伪造成一次整套绿灯或32/33科学通过。Full/affected-wide/build/golden/PR/CI均未跑：SOURCE_ONLY生产未改且仍trueRED，rootgate未release；后续bug交付要完成全部严格gates。

纠正留证：首次PowerShell Get-FileHash用多个positional path参数失败，改为明确path数组后成功；误把C handoff当ownbase文件read报missing，改为已有C工作树/cachedpacket只读。外部stage一开始误用Nature并不提供的`bodyHtml`，报TypeError；日志留`stage-harness-bodyHtml-error.log`，之后按真实production `defuddleToMarkdown(page.document)`恢复，未重新跑wholeclips。首次diff--check发现原source indentation blank-at-eol；仅设置fixture目录`*.html text eol=lf whitespace=-blank-at-eol`保护真实空白，source bytes未改，final base→HEAD diffcheckPASS；不是全局关闭检查。

初版syntheticunit test误硬要求`m`字体TeX，改为明确接受既有roman字体包装的等价base/exponent后PASS，原真实输入/科学期待未改。初版direct normalizer/realclip code controls发现existing defect：Defuddle正确保留code内字面`r<sup>2</sup>SCAN`，academic将其改为code内`r$^{2}$SCAN`。原input/test/log与stage记录外部，code中字面markup不是真实source SUP角色；没有admittedscholarlycode evidence，留作未来独立code Work Contract提案，不强迫identifier一起修code、也不要求永久保存损坏。永久collector边界控制用明确constructed Unicode code/已有typedmath/citation/unit/unknownword，每条scope单独证明PASS。当前没有生产patch可以借这些control宣称before/afterbyteparity；未来实施时应对原codebaseline做实际before/after审查。

## artifacts与不复工说明

`source-provenance.json`是原source oracle，不含当前parser期待。所有Git6paths blobs/sizes/SHA、源Ahelper与Cpacket、下列external files身份最终由`<TEMP>/final-checkpoint-audit.json`记录；doc自身hash由receipt/最后消息给出，避免self-reference。核心external身份：

| file | bytes / SHA256 |
| --- | --- |
| focused-baseline.log | 23615 / `c7a910511d6a38fc5ea1243f258078dc683cd4b504efb90202bc015671ec3439` |
| actual-three-dialects.json | 109535 / `2c5f40c9dcf1554ece63139f4276ecbf2ab98511f9f46472ce1e7c3b455917a4` |
| synthetic-controls.log | 376 / `336a78da0c9a6e05f5f521de5934a4ea04d32fb6efd203a230ff5c110fc98ec1` |
| unknown-prose-control.log | 211 / `5f6b9dc2f0b4207a0c08201aee19d327b6be8da35403ade7cbaf2160af3e24bb` |
| stage-trace.json | 16314 / `0e30af31faf3daaabd53889f4b30152dc28519cb2b46395803e052f5d0232968` |
| identifier.markdown.md | 14651 / `957757cd9610e34378760b13e58f0bb61c3656641c829af2b5c65058196b0911` |
| identifier.links.md | 15524 / `92eea67f9e4b800728f12c809920fff51bd7cd23b2430602d0a00262fc823699` |
| identifier.quarto.md | 5730 / `6105b3286aa1159f7b6f3436cb9afdd6d1c9179954105ee6bb5e4fc45e842023` |

恢复时使用已冻结exactfixture/source/C缓存，producer all81blocks与repeat/idem有效证据无需重做。独立source reviewer须对final81blocks/11roles/newrecipe一次审核，不用B/C其他projection审核替代。Source/sourcekind/topology没有变的doc-only提交只核byte/hash/protected scope，不重复3sourceclips/full验证。

## root/C unblocking与未验证项

1. 独立reviewer在exactfinalHEAD审原raw→recipe→81 retained blocks、fixture/source/provenance、全部11角色/headingvariants、refs43/完整Fig2/context/6creators/rawrights、positions/signatures/重复幂等。发现recipe问题返回owner修，科学内容不改。
2. Root先accepted其他prerequisites并串行release共享Nature gate，恢复本owner/branch接入届时最新accepted main；独立source review不是production review或merge许可。
3. 最小typed-source实现必须让15context/6heading source assertions和3math guards真实转GREEN；不得只消除9个orphans、保留标题flat2。#65 refs真实rawHtml仍FAIL时完整focused/full不能绿灯，需对应独立prerequisiteaccepted或如实保持pending，不删除originalprefix2来凑通过。
4. Correctedfocused/affected/full/build/golden/fresh三平台CI/Gitleaks、exact-head独立review与十项gate全部成立后，root才可merge唯一68bug PR；Main CI成功才automation完成68。此处没有PR、merge、手动close或gate豁免。
5. C在accepted修复后复用旧source9/Coracle并单独核新增2headingsemantic roles；只做必要Materials3dialectdelta或root批准的合并batch，不为doc-only重新clip。Compound-unit p42等独立失败仍留，不能宣布wholeMaterials/Issue10complete。
6. Integrator仍须完整85×3/27validators/resources/warnings/repeat/ABA/bib/golden/fullverification，最终Issue10PR保持unmergedhumanreview。无proposedcanonical/PRD/EDD changes；code literal SUP独立诊断与必要futureheading边界均不默认扩入此次生产scope。
