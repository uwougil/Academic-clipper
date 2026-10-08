# Issue #67 — compound conductivity unit source-only handoff

状态：`SOURCE_ONLY_RED / PRODUCTION_GATE_LOCKED`。已经建立 [独立 bug Work Contract #67](https://github.com/uwougil/Academic-clipper/issues/67) 与一个完整真实来源投影、永久正确期待和三方言真实RED，没有生产修复、implementation PR或#10完成声明。新投影须由另一owner独立核验；shared Nature gate仅由root释放，不能把本RED branch合入main。

## 基线、历史与所有权

Base `3889f7396eab99060bec88fc8b0dcd3e6712024e`。启动时明确依root合同选择该acceptedMain；独立核 [Main37691610523](https://github.com/uwougil/Academic-clipper/actions/runs/37691610523) SUCCESS：Ubuntu20 `113032907666`、Ubuntu24 `113032907843`、Windows24 `113032907867`；[Secrets37691610455](https://github.com/uwougil/Academic-clipper/actions/runs/37691610455)同head SUCCESS。它们只是来源RED基线接纳，不能冒充本branch CI。

Root后续报告#60 merged Main已成功，新accepted `e2c1…` / Main37707702765 / Secrets37707702972；这是root提供的后续依赖信息，本source-only分支保留真实3889执行结果，不为doc-only做dependency merge或重复三次clip。未来生产必须采用届时root核验的完整最新accepted SHA。

Own branch `codex/issue-10-bug-compound-unit`；worktree `C:/Users/guoli/.codex/worktrees/issue-10-bug-compound-unit/academic-clipper`。从accepted3889新建，前一#61review与#61author branches/checkouts/index均未修改。完整读scopedAGENTS、canonical spec/plan、B/integrator goals、PRD/EDD，采用fix-bug/create-issue evidence/duplicate流程；没有借用其他owner生产编辑权限。

有序authored提交：source RED **`e8a67e9ce1fdf72d9d587c13d5700dacfd2bf1bb`** → 本handoff doc-only successor（final exact SHA由执行者另交，避免self-reference）。Source提交仅六个owned新files，下面是Git LF byte定义；后继仅本文件。没有rebase/force-push/dependency merge。

| source commit file | bytes | SHA256 | Git blob |
| --- | ---: | --- | --- |
| test/fixtures/nature-compound-unit/.gitattributes | 44 | 1872df811497cddb8b352ae602ed00f23826af1a4f72deabf4864999e855b029 | 0614587793044e18ba1c98b7e4eace4c0d081672 |
| test/fixtures/nature-compound-unit/README.md | 2555 | f84c9ec298bbfb937df6ca45a0a1759884ce8d88e1a52ef68e317d75d793548c | dc2313638c18c16eb6eefd2633c1400dca3bb86e |
| test/fixtures/nature-compound-unit/accepted-3889-diagnosis.json | 25964 | 40e130dad2d4a3fb83ebb8eec07baf7b73ddb34068782f68af30cc0b3643b125 | 291c85ae775ab597d36708809b18f5df57f5687c |
| test/fixtures/nature-compound-unit/s41586-023-06735-9.excerpt.html | 86732 | fbe6ad5fe6d53056277655422baf7e3c9fec5cac42c82473553df5cb6e9c3790 | 886da1a83579e36bd7f39e9d413c6cb2af9e775a |
| test/fixtures/nature-compound-unit/s41586-023-06735-9.provenance.json | 52083 | 99dfe055b180dc2c938bce90f9303431272c9752200644d37030442695877c41 | 20310d5cb1a0d49a18a0874fd8a51e3a07f696d3 |
| test/nature-compound-unit.test.mjs | 8870 | 148642b22a8cd49759e05cdc64e0a92640bc0b2f7561e333d3db1034fa79f7c1 | 1103318eaf6de1e1ebb2999d869d980ff0ccd758 |

## 原来源、oracle 与合法投影

[Scaling deep learning for materials discovery](https://www.nature.com/articles/s41586-023-06735-9)，Nature / DOI `10.1038/s41586-023-06735-9`。B readonly source commit `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`，原 observedAt `2026-10-03T16:44:22.324Z`、captureMode `guarded-http`。Untouched external raw506351 bytes / SHA256 `79f575e1941633c2dbd036682977ea6c274acd5c8c44fdb4648856a00a8d7cc6`；没有获取新Nature页面、credentials/cookies/private session或PR13 inputs。

C source packet `3d533fb15115ad670e30b52b11ac6435d654c53a` / external `accepted-3889-materials-delta-source-packet.json` 34429bytes、SHA256 `84d93cc4261471a9c5ce20df73a214d8078be5d8d78e0c85211e07436a54ec35`提供独立source位置。重新从untouched DOM读取，Methods / `a-section-6` p42（paragraph零起算）rawprehash `7f1338d170c587581f6886da41018abd505a2e25e2522e988d6348aa9c3b2eb4`、frozenparagraph `07309b9556b82a5861cc8b3278e520106710bdf20e8464ca5af636dbb64b7550`一致。

原完整段落位于source `Methods`→`MLIPs`→`AIMD conductivity experiments`（H2/H3/H4，IDs Sec13/Sec41/Sec44）；说明conductivityσ、temperature1,000 K、AIMD与原普通阈值101.18。一个原非citation SUP−1的previous sibling是 ` > 101.18 mScm`；只有cm是inverse length，mS是millisiemens乘因子。允许正确同义表示 `mS cm⁻¹`、`mS/cm` 或 `\mathrm{mS}\,\mathrm{cm}^{-1}`。把整个mScm取逆会改变S的量纲；不能仅把orphan改成whole-token合法TeX来洗GREEN。

Source没有把阈值10后面1.18放进SUP，原数字是普通文本101.18，完整保留、不擅自“科学修正”为10^1.18。源unit interval UTF16 `[244187,244204)` / UTF8 `[244719,244738)`；sourceSUP UTF16 `[244191,244204)` / UTF8 `[244723,244738)`，line1068 col4812（1起算）。全部end exclusive。原fragment `mScm<sup>−1</sup>` SHA256 `4ea7d1da71cff1a96de53742ab51da5e5aa8ff1f27d9f63de9994e4437d8c846`。

原整篇article paragraph inventory中mScm仅1处。本完整段落的其他科学角色全保留：两个italicσ、一个温度SUB1,000K、citation69 SUP（非unit），没有隐藏related unit roles。完整source text、所有科学节点及前后siblings/sourcepositions在provenance；不从renderedMD反向定义expected。

最终article excerpt **86732 bytes / `fbe6ad5fe6d53056277655422baf7e3c9fec5cac42c82473553df5cb6e9c3790`**，99个原blocks，recipe `32eb0c4c3c2bf9f5d37739742c4f0fa94c6377e3465edf321082412ec15f9487`。符合20–150KiB目标及article256KiB上限。保留完整paragraph、必要原ancestor/headings、metadata/JSON-LD、6有序creators、canonical/DOI/title/journal、原rights/footer、References完整prefix1–69。原source71references，仅70–71省略；highestactualcitation69，不重编号或补造。Requiredprefix保留既有Ref2 literal `<`，所以links独立#65 failure保持。Supplementary Information原href/text保留为samearticleexternalfragment，不造missingtarget/获取binary。

六位creators原序：Merchant, Amil；Batzner, Simon；Schoenholz, Samuel S.；Aykol, Muratahan；Cheon, Gowoon；Cubuk, Ekin Dogus。原CC BY4完整notice的double-space/text/link保留，noticeprehash `84ab88094d2cd6f87d0a2a8abbb091db26a34a50a7701aa2a706a9a1a4b4dafd`。`©2026 Springer Nature Limited`原sitefooter单独保留，不当article copyright、不将source材料按repository code license重新许可。JSON-LD源article公开可访问identity核验，未提交rawcaptures/image/PDF/binary或privatepath。

## 实际 A 界面、变换与 omissions

Actual helper readonly B `scripts/lib/nature-corpus-infrastructure.mjs` Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`，34946 Git bytes / SHA `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`。没有复制helper/第二sanitizer。Actual `sanitizeNatureHtml(raw, recipe)` sanitizer `nature-corpus-sanitizer/1.1.0`，schema/recipe1.0.0、serializer `nature-corpus-subtree/1.0.0`、projection `nature-corpus-projection/1.0.0`。

一轮freeze：所有99原 block selector唯一/sourceprehash保留；原paragraph scientificnodes/tag/order/text与frozen相同；同rawrepeat bytes相同，frozen再次sanitize幂等。UTF8无BOM/LF，未pretty-print inline或collapse whitespace。局部.gitattributes只对ownedHTML固定LF/原blank-at-eol；其它sourcefiles Git转换LF/CRLF只是平台checkout，无学术输入变动。

实际转换 [{"operation":"select-complete-source-blocks-with-ancestors","count":99},{"operation":"fixed-html-scaffold-sorted-attributes-utf8-lf","count":1},{"operation":"trim-json-ld-to-article-object","count":1},{"operation":"remove-attributes","count":1205},{"operation":"sanitize-resource-urls","count":60}]。Structure signature `f33d54c7259e6879fe27fcddfdcf874f98c1ae4f712828dc891fe00bf1e16e48`；payload signature `eaa2a6d2ea1175f859ef2a00f297bdfc7c1b5cdca9e2f86d3645c8dba55ba01f`，同retainedprojection，没有把fullpagecount/hash与excerpt直接比较。

- Other article prose, all figures/equations/tables; no full raw capture or binaries. This is a bounded bug projection, not replacement corpus admission.
- References70–71 omitted; complete unrenumbered1–69 prefix retained for actualcitation69.
- Other mandatory Materials identifier-power and reference-literal failures remain in unchanged C evidence; Ref2 literal is truthfully retained in required prefix.
- Supplementary Information originalhref/text retained; unretained originaltarget remains same-article external fragment by current contract, no supplementarybinary fetched.

源投影无tables/figures/samearticletablelinks，静态读取精确frozenhash之后核0/0/[]；普通clip不会有hydrationresources。Warnings exact只有 `No Nature figures were detected.` / `No equation nodes were detected.`。没有warningwildcard或借当前生产输出定义未知预期。

## 实际 RED、阶段因果与边界

唯一focused真实命令 `node --test test/nature-compound-unit.test.mjs`，Windows Nodev24.14.1，外部opt-in `NATURE_COMPOUND_UNIT_RECEIPT_ROOT=C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-compound-unit`：exit1；**6=3PASS/3真实FAIL**，0skip/todo/cancel，1410.1535ms。三PASS为sourceidentity/完整rights/context、明确syntheticboundary、零HTTP/DNS实际ledger；三FAIL分别是3dialect原sourcecompound-unit attachment语义。每dialect只一次completeclip，未为报告再clip。日志14258bytes / `e3740c3b7e704ca372e4e73795b16b847c40898572a0a7bfb60091bfac6ab7b3`。

Test-only unitrole recognizer要求cm在自己的exponent mathatom中且mS乘因子保持；不会先剥全部dollars把旧 `mScm$^{−1}$` 洗成正确，也明确拒绝 `\mathrm{mScm}^{-1}`。原unit oracle来自conductivity sourcecontext/原DOM；renderer只用于actual failure证据。

实际cached阶段一致：adapter cleanedHTML仍有 `mScm<sup>−1</sup>`，未生成该plaincompound的typed marker；Defuddle wholebody增加空格 `mScm <sup>−1</sup>`；normalizeMath仍保留SUP并只恢复σ typed run；normalizeAcademicInline首次变成 `mScm$^{−1}$`。`combineLiteralPowers`按完整word判断，现有UNIT_SYMBOL只认已支持简单units，mScm不是singleunit，不能按任意wordsuffix猜cm。Rootcause为缺少已证明compound因子角色，classification为implementation bug，没有证明历史曾正确，也不泛称#48新regression。

三dialect math/scientificFragments各真实FAIL1isolatedSuperscript；structure/crossrefs PASS，markdown/quarto rawHTML PASS，links Ref2 `x` rawHTML violation line39 col72来自独立#65。新sourceunitfailure位置markdown line33 col189、links line33 col197、quarto line28 col194。没有assertwholeMaterialsvalidators必须GREEN，也没有assert独立failures永远必须FAIL。所有4 validators实际结果保留。

| dialect | same-run cache bytes/SHA256 | same-run MD bytes/SHA256 |
| --- | --- | --- |
| markdown | 163436 / e6732cedb81d4061362072d6dbae5d81c2f66271e41c702f45fed0a9443d9cdf | 16009 / 9e85ecbbd9df519c3d92f25b2c3cba95c13baf64e9478b7d0ef09a9d02feb6d9 |
| links | 167910 / 4d9ab2ef4e91efb9b74ac2b57d684d655e6a2e519c415d6ae934ac52a6522099 | 17181 / e17a90c93bb98ef4cc511ccfbb79d1e6ef921abf7be902ff8e87229d7eac86b9 |
| quarto | 133162 / 7bc79a11d62a7e8b9985e549d73997db183b95f75f6626677a0434a38f7c9189 | 1011 / ec289b4327b87edf470f029a2982be1a58f4382d0b1bc7f900e4b49148cdd87b |

缓存JSON/MD只在外部TEMP；committeddiagnosis仅有限source/stagecontext、validator facts与receipts，没有fullMDsnapshot。Readonly cachecompilation没有执行clip/parser、新sourceacquisition/C3/C27/full/build/CI。

HTTP/fetch及DNS lookup/promise lookup guards先记录所有attempts再throw；三次clip之后独立assertledger空，即使hydratorcatch也会FAIL。finally恢复originalfetch/DNS并syncBuiltinESMExports，没有遗留globalmutation。**writer证明是静态已读clipNature→finishClip/render返回的调用路径与actual entry选择，不是runtime writer spy**；cache里的writerCalls0是declarative scope字段，不能称instrumented计数。未调用writerentry、没有papers输出；只有显式外部receipt write。

明确syntheticcontrols exercise existingnormalizer/testunitrecognizer：typed mS/cm、simplecm/m/numeric10power、unknownsample/column、footnote/Quarto citations、existinginline/displaymath和inline/fencedcode、旧orphanvalidator仍拒绝。它们不是另一Nature sourceentry，未加入syntheticwholeclips。未来DOM生产实现仍必须另核两种sourcecitationcue、unknownword与opaque-code边界；本sourcepreflight不冒充未来blastradiusGREEN。

## Work Contract 与未应用提案

Remote `https://github.com/uwougil/Academic-clipper.git`、authenticated gh已核；open+closed allIssues及 `compound unit` / `mScm` / `电导 单位` / `fractional`语义查重，完整比较#48。#48只证明已接纳简单completeunit/numeric附件，不含本compoundfactor；#61leadingmass、#63splitSUP、#64Greek、#65reference、Materialsidentifier/FRBfractional都与本机制不同。Source-mode为orchestrator已授权的human-settled-intent。

创建并完整readback#67 OPEN、仅bug type；futuretrailer已精确 `Refs #67`，body全文与externalfinalbodyfile相等，无completion/自动关闭关键字。未建立implementationPR或手动关闭Issue；futureonefinalPR负责此bug，merge只接纳代码，成功mergedMain才automation完成。

未应用提案：限定actual原DOM completeunit pair mS+cm−1，从knownqualified完整source边界选typed scientificrange，显式保留factor语义，用现有markerrecord/normalization路径的TeX `\mathrm{mS}\,\mathrm{cm}^{-1}`。Range不能吞前measurement/space，不能直接scientificTex整个mScm后接幂、globalMDregex修补或加任意plainword/SUPclassifier；不扩大publisher/security架构。No src edits。

## 验证命令、已知限制与恢复条件

| command | result |
| --- | --- |
| git worktree add -b codex/issue-10-bug-compound-unit <own-path> 3889f7396eab99060bec88fc8b0dcd3e6712024e | exit0，新隔离sourcebranch；旧61review/author不动 |
| npm ci | exit0，65packages；现有1high advisory提示，未改lock/deps或auditfix |
| node <temp>/inspect-source.mjs | exit0，原raw/p42/Cpacket匹配、唯一mScm/所有paragraphscience确认 |
| node <temp>/freeze-source.mjs | exit0，99blocks/86732bytes、sourceprehash/repeat/idem/rights/science一致，一轮finalfixture；后续只metadata#67/正确reference-total |
| node --test test/nature-compound-unit.test.mjs | exit1，6=3PASS/3REALFAIL，0skip，1410.1535ms；only3completeclips同轮cache |
| node <temp>/finalize-checkpoint.mjs | exit0，仅读取既有same-runcaches/log、frozennoresourceinput/protectedpaths，固定committed有限diagnosis；noextra3clips |
| gh issue create/edit/view67 --body-file <external-file> | exit0，OPENbug且futureRefs67，完整bodyreadback匹配 |
| git diff --check / cached --check / cached --name-only / status | exit0；sixownedsource files，production/B/C/A/spec/intent/security/deps/golden/writer/package/CI差异为空 |
| npm test / build / golden / C3/C27 / branchCI / implementationPR | NOT RUN；explicitsource-onlyrootgate，无重复wholecorpus/full |

ExternalTEMProot `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-compound-unit`。Raw/inspection/freeze/helperexecution仅external；未来独立reviewer只需最终99blockrecipe及原Braw，不要先重新clip3或复跑C/旧#48。

诚实保留两个低影响preflight错误：一次rg假定test/academic-inline.test.mjs存在，实际使用existingnature-scientific-units；initialomissionrange104未经count验证，独立raw确认总71后finalcontract/provenance改70–71，fixturebytes/recipe没有改变。唯一focusedbatch没有harnessfail，全部3RED因原科学attachment失败。

**恢复条件**：另一owner独立核finalsourcehead99recipe/rawinterval/factororacle/6creators/license/referenceprefix/hash/transformations；root释放共享Naturegate后SAMEowner采用当时latestacceptedMain实施最小DOMfactorfix，保持source/oracle原样，真实unitRED→GREEN+所有适用边界/受影响/full/build/golden/fresh3CI/Secrets/exact-headreview。独立#65仍如实分列。C在mergedMain成功后消费unchangedMaterialscompoundunit位置，不把本sourcecheckpoint当mandatorysemantic通过。没有spec change proposal；#10仍未完成。
