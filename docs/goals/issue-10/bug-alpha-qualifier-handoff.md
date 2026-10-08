# Issue #71 — AlphaFold qualified metric 来源阶段交接

状态：SOURCE_ONLY 已诊断，生产代码未修改；真实失败保留，独立来源审核待执行。Work Contract：[Issue #71](https://github.com/uwougil/Academic-clipper/issues/71)，type `bug`，OPEN。本文不声明 Issue #71 已修复，也不声明 Issue #10 完成。

## 分支、基线与选择顺序

- Base：`a5b6acc2984af5cb8b82106291e963f4f413f5ac`；[Main CI 37716530268](https://github.com/uwougil/Academic-clipper/actions/runs/37716530268) 与 [Secrets 37716530267](https://github.com/uwougil/Academic-clipper/actions/runs/37716530267) 的 exact headSha 均为该 SHA，status completed / conclusion success；恢复阶段通过 `gh run view <run> --repo uwougil/Academic-clipper --json headSha,conclusion,status` 重新核实。
- Branch：`codex/issue-10-bug-alpha-qualifier`。
- Worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-alpha-qualifier/academic-clipper`。
- 首个 ordered commit：`c12e774096cf69be6c90f06cc773c7a97d6e5795`，拥有 fixture `.gitattributes`、excerpt、provenance、recipe、source-oracle、`accepted-a5b6-diagnosis.json` 和 `test/nature-alpha-qualifier.test.mjs` 共7文件。
- 第二个 ordered commit：本文件与 `test/fixtures/nature-alpha-qualifier/README.md` 的 DOC_ONLY commit；其确切 SHA 由 `git log --format='%H %s' a5b6acc..codex/issue-10-bug-alpha-qualifier` 可重建，并在最终交接中报告。文档不嵌入自身尚未产生的 commit SHA。

没有 src、生产 validators、A helper、B corpus、C assertions、spec、PRD/EDD、writer/security、dependency、golden 或 generated files 变更。没有打开 implementation PR；RED source branch 不能直接 merge。后续最终 bug PR 使用 exact standalone `Refs #71`，merge 仅接纳代码，成功 merged-main CI 才由 automation 完成 Work Contract。

## 合同与来源

PRD §3 要求保留上下标和特殊符号；EDD §2.3–2.5 规定 Nature DOM → Defuddle → academic normalizers → renderer/validators 的现有边界。canonical Issue #10 §5 要求 source-backed、完整语义 block 和真实拓扑，§7 要求科学 attachment 及四个 production validators。这里是 implementation bug；没有证明历史引入点，不能声称已定位 regression commit。

来源为 [Highly accurate protein structure prediction with AlphaFold](https://www.nature.com/articles/s41586-021-03819-2)，DOI `10.1038/s41586-021-03819-2`，Nature。复用 B 已 admitted 的公开来源，不添加 corpus 论文、不替换或拒绝候选、不重抓 live。既有 anonymous guarded capture `observedAt=2026-10-03T16:44:11.820Z`，raw decompressed response body **616249 bytes** / SHA256 `7a9843e69996c1a64a9a5ecc8b96015cfd45262e636e33e505a011d315c4310b`。原 bytes 保留在外部 Temp `academic-clipper-issue10-agent-b/s41586-021-03819-2.anonymous.raw.html`，不进入 Git；不使用 cookies、credentials 或 private sessions。

实际消费 A original helper blob `e56f140d9756bb83013b9df0716dc650e04d7917`，Git 34946 bytes / SHA256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`。sanitizer=`nature-corpus-sanitizer/1.1.0`、subtree=`nature-corpus-subtree/1.0.0`、recipe/schema=`1.0.0`、projection=`nature-corpus-projection/1.0.0`。使用实际 `sanitizeNatureHtml`、`serializeSubtree`、`sha256Bytes`、`stableJson`、`validateRecipe`；没有复制 A 的基础设施。Recipe semantic SHA256 `428035a20d817a4fedf3351e207a7e97c44eed30500e794c87b9bfeb5130b126` 与 JSON 文件 bytes hash 是不同域。

新 projection 有58个 blocks，完整保留 canonical/DOI/article JSON-LD/title、全部34 ordered citation_author metadata、Main heading、Main p2完整段落、Fig1完整 wrapper/image/caption/panels a–e 和 Nseq/Nres styled roles、Supplementary heading/MOESM1完整 item、原 article CC BY4.0 notice与独立 publisher footer。该完整段落、Fig1 caption 和 MOESM1 均没有 source citation，最高引用0、References prefix0；不能制造 citation、补入无关84篇参考文献或消除合理 absence warning。本文保护已有多图长caption覆盖中这一段限定指标角色，不等于完整 AlphaFold/Extended Data corpus 验收。

## Oracle 原位置与科学意义

`section[data-title="Main"] p:has(a[href$="#MOESM1"]):has(>sub)`，Main `a-section-1` paragraph index2（零起算）。四处完整 literal `r.m.s.d.` 后跟原 SUB95；95 表示 Cα root-mean-square deviation at 95% residue coverage，不能附到0.96/2.8/1.5/3.5测量值或 Å，也不能改成裸95、幂95或错误96。

完整段落 raw subtree digest `0722e1e1f1fb785c0add4e0a85c04e9dca2616ec0b3a6bde07ec29710b08088d`；frozen subtree digest `cdc336a22f533271dc16194b71d553f545c6c69ae7f7a5e38c91984c77a1ec9d`；raw HTML UTF-16 range `[174425,176484)`，UTF-8 range `[174554,176648)`；rawBodyFragment SHA256 `cab085426bb1803292438706bff605776b2754bc1a4ea8b050fe2bb96a7a90d2`。Source SUB 的同版 subtree/raw fragment SHA256 都是 `34153148ff7d80b5edc5f9369e46d45ca2834c801331adc3ed33dcaf1c2b782d`。

| Source role | 原指标前测量值 | UTF-16 raw range | UTF-8 raw range |
| --- | --- | --- | --- |
| rmsd95-1 | 0.96 Å | [174580,174593) | [174711,174724) |
| rmsd95-2 | 2.8 Å | [174778,174791) | [174918,174931) |
| rmsd95-3 | 1.5 Å | [175862,175875) | [176012,176025) |
| rmsd95-4 | 3.5 Å | [175946,175959) | [176104,176117) |

Oracle 同时保存完整段落 text/html、每个角色 before/after neighbors、Fig1完整 caption/description、源 links 1a/1b/1c/1d与Supplementary Fig14、metadata全序列/rights。期望 complete metric atom 与 qualifier 的关系，允许等价 TeX 或 Unicode `r.m.s.d.₉₅`；test recognizer 拒绝原 `r.m.s.d.$_{95}$`、裸95、错值96、unknown metric。Recognizer 是限定 role 的断言，没有将 parser output 当 source oracle。

## Sanitization、omissions 与 sizes

来源转换为：58完整 blocks/必要 ancestors选择、固定 scaffold/attribute排序/UTF-8 LF、只保留 article JSON-LD、移除43个属性、sanitize 1个resource URL。完整 prose、source sub/sup、links、caption、原 node order 由原 A helper保留。Omissions：未选择正文/abstract/其他主图与Extended Data/其他supplementary/作者信息body；bibliography因零citation省略；navigation/ads/analytics/account/session/consent/executable content；raw captures、image/PDF binaries。完整34作者仍在metadata/JSON-LD。保留的CC BY4.0链接为原 `http://creativecommons.org/licenses/by/4.0/`；site footer `© 2026 Springer Nature Limited` 不当作 article-specific版权声明，亦不把来源relicense成仓库代码许可。

以下均为 **committed Git UTF-8 LF bytes**（不是 Windows CRLF checkout 或 recipe semantic hash）。HTML 24257 bytes，在canonical article256KiB限内；这是bug fixture，不增加9-entry corpus inventory，未来 integrator若纳入总size应另计。

| 文件（fixture目录下，另注明 test） | Git bytes | SHA256 |
| --- | ---: | --- |
| .gitattributes | 50 | 01ad48184330b33a6da952764a2e17e47a0f0072c6955436e0e16f58402f8cc6 |
| s41586-021-03819-2.excerpt.html | 24257 | 696660069bd881a163722fc020b22d0f6af5cc3387decacfd8c78789574ef634 |
| s41586-021-03819-2.provenance.json | 21819 | f2e4fda7018aa124407ae63fe78abe534dd277a5f0327a3a75b984589a46dcf0 |
| s41586-021-03819-2.recipe.json | 8922 | eadaf88466d38ca428b6157baa91f8756a6ed6366fed7ab1042fc8b6c7d35b88 |
| s41586-021-03819-2.source-oracle.json | 17908 | 713e657713555bb686618b4f10e086654263287dbbb824922eebfc2d0bd7d4b4 |
| accepted-a5b6-diagnosis.json | 27530 | b28211322f8f6a0585167a119b13c2359d89dc592d498eed2d85cb0fea61c15b |
| test/nature-alpha-qualifier.test.mjs | 8284 | e9bc689151b41f783d21bc25a80ad3da793d7aad3afaa74fc898f5dc766345e4 |

Structure projection hash `ea6e7ad4335cb2f9de598d541c90769a8e01a0632af2efa51422b89cdea8f2e4`；payload projection hash `86ccc822d5e7eeab01696344dda747e2b7a0cc90b40f80473c4b40594ed016d6`，均仅此58-block projection。原 producer repeat/idempotence=true，唯一构建 raw reads1、raw semantic DOM parses1、raw sanitizer runs2、idempotence runs1、frozen semantic DOM parses1；这不代替 independent source review。

原 source-build inventory 的 `.gitattributes` 为38 bytes旧状态，c12最终已修订成50 bytes；上表给最终Git身份，不把旧构建receipt错误当最终attributes身份。其余来源文件hash保持。恢复阶段只读取状态/缓存，不重新构建recipe或重新审核全部A/B。

## 实际运行、RED 分类与缓存

外部证据目录：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-alpha-qualifier`。保存 build script/receipt、original RED log、三份同run actual result+Markdown、cache-only harness/changed-scope logs和恢复identity receipt。原 build command 为 `node <external>/build-source.mjs`；该保存receipt证明58 blocks/四roles/34creators/repeat与幂等，没有单独保存其OS exit code，不补造exit0。

原 `NATURE_ALPHA_QUALIFIER_RECEIPT_ROOT=<external>` 配置下执行 `node --test test/nature-alpha-qualifier.test.mjs`：**exit1，11 tests /2 PASS /9 FAIL /0 skipped，1056.6811ms**。只执行3个real-source wholeclip，一次/style，after hook保存同次 actual result+MD。其中6个真实FAIL：各方言四 attachment不在完整atom内的角色断言，以及math validator检测四 isolatedSubscript。另3个context test强制final MD含supplementary PDF item的要求超出已证合同。

修正仅测试：fixture仍保留MOESM1原完整item/PDFlink；现有renderer排除Supplementarysection，原paragraph的Supplementary Fig14 `https://www.nature.com/articles/s41586-021-03819-2#MOESM1` external fragment实际保留。以该源链接替代PDF final-output要求；recognizer返回对象的key与预先source oracle的`literalBase`校齐，不改95、科学期望或fixture。

复用三个original actual缓存，执行 `node --test --test-name-pattern='preserve source context|synthetic qualifier recognizer' <external>/cache-only-test.mjs`：**exit0，4 PASS /0 FAIL /0 skipped，496.5255ms，clips0**。追加最终完整Fig1 description exactly-once断言后，同命令**exit0，4 PASS /0 FAIL /0 skipped，519.0361ms，clips0**。这是3个corrected context tests+1纯synthetic recognizer，不是新的wholeclip或完整12-test PASS。最终permanent registry12：2个原unchanged source/network PASS、3个修正cachedcontext PASS、1个recognizer PASS；3个真实attachment与3个math validator FAIL继续保留。未执行新12-test wholeclip，不把历史9FAIL全部当科学失败。

| 外部记录 | bytes | SHA256 |
| --- | ---: | --- |
| source-build-receipt.json | 1352 | ed2ec8f3a24561ba506c48c9ae00660e9ff7c51719f6b44913413ffde5d01762 |
| accepted-a5b6-red.log | 25310 | 4255c8d878a1bfe01566e11ac165c9c70136a20e1b20fc514868dd0f8fc176bf |
| corrected-cache-context.log | 519 | 4c6f3440e25e89bed6924dd521bc6805965298829ec87e76071c536d8870eec7 |
| corrected-cache-context-final.log | 520 | 35d1e50c29b580e952f2d65199ff8081e07d327301c9a4ef8b322c3ce6fbb01f |
| markdown.actual-cache.json | 72347 | 77f5d766925288ac85587df15f749c3696a3029d3bfbdc41291235e801817b1f |
| markdown.actual.md | 4022 | 28efbf1bdf177ee9680fbe82532f209654e54c5c489cf63a1e267faaccaf5bc4 |
| links.actual-cache.json | 72993 | df45f76c0282bee74292204cc2a9c212198794d8b1c5e61d96377929c9d44a7b |
| links.actual.md | 4096 | 9c4db38bf226ef5f098233b33425077e1aeea8b552b8ccb8cf3d881a91469214 |
| quarto.actual-cache.json | 73083 | cd2feb61e97f9bb7979ff2d9d51bf598a73ff98944b69a06bd5559afe0499199 |
| quarto.actual.md | 4136 | 73a53101457751b0232ebd690bf946971548ab634091cf65d6a7e6f20f5aaf6b |

恢复运行 `node <external>/recovery-receipt.mjs` **exit0**，仅复核c12 Git bytes、source-onlyfixturehash、原cache base/fixture身份、cache与MD字节一致、三个actual四validator状态/34creators/counts/warnings和原attemptledger；写外部 `recovery-receipt.json`。没有新 source acquisition/build/audit、productionclip、focused/full tests、build或golden。当前恢复Node为v24.14.1；未将当前版本冒充原producer未记录runtime。

## 诊断、四 validators 与资源

Nature对 plain dotted metric没有建立完整typed scientific run。Defuddle与math-normalized stage均仍有四 `r.m.s.d.<sub>95</sub>`；academic-inline把SUB变成独立 `$_{95}$`，final继续保留四 `r.m.s.d.$_{95}$`。原正确95%prose与measurements不是数学基底。根因是source role未在转换前作为完整科学run保护，symptom是孤立下标；不能只靠删除`$`或放宽scientificFragments使GREEN。

| 方言 | 原段落MD line | Math/scientificFragments | MarkdownStructure | RawHtml | CrossReferences |
| --- | ---: | --- | --- | --- | --- |
| markdown | 51 | FAIL，4 isolatedSubscript | PASS | PASS，zero raw HTML | PASS |
| links | 51 | FAIL，4 isolatedSubscript | PASS | PASS，strict anchors | PASS |
| quarto | 52 | FAIL，4 isolatedSubscript | PASS | PASS，zero raw HTML | PASS |

完整figure1、authors34、reference0、citation0、table0、display equations0。Exact warnings均为有序 `['No equation nodes were detected.','No Nature reference list was detected.']`。Declared replay resources `[]`；image/PDF不下载，不假装Table资源。原test HTTP/DNS guards先record再throw，结束assert ledger `{http:[],dns:[]}`，finally还原global fetch与两DNS入口并`syncBuiltinESMExports()`；三个实际缓存的同次ledger均空，不能用抛错被catch当零attempt。cachedcontext harness没有执行网络操作；其初始local空ledger不代替originalcache ledger，恢复脚本核验了真实缓存原ledger。

Writer proof仅static：test只调用`clipNature`→`parseNaturePage`/empty table hydration→`finishClip`→Defuddle/normalizers/render/validators，直接returnresult；`writePaper`是独立export未调用。没有writer spy，也没有paper install或资源下载断言。外部cache写入不等于writer。

## 消费者解除条件与未完成项

独立reviewer先锁定来源finalhead与上述c12未变的文件hash，消费A original e56和既有raw body，**唯一审核此58-block新projection**：核对58locator/prehash/必要ancestors、full34creators/articleidentity、完整段落四原95和UTF位置/邻文、Fig1全caption/panels/Nseq/Nres、MOESM1/zero sourcecitation-prefix0、CCnotice/footer、transformations/omissions及repeat/idempotence证据。可以复用此前B evidence与相同inputhash；不能producer自审代替独立acceptance，不应重跑13篇B来源或85 source audit。

未来bug owner在orchestrator允许的共享Nature生产锁下，基于**届时latest accepted main**吸收已接纳依赖，复用原fixture/recipe/oracle、缓存和同源RED；最小source-aware literal qualified metric角色接入已有scientific run/marker流程，不能generic all-SUB/plainword、按articleID硬编码、second parser或global Markdown补丁。Source-boundary controls应保护原citation、opaque code/existing math、已经支持的physical units、styled figure roles及unknown plainwords。#48 physical powers、#64 Greek SUB、#68 r²SCAN、#61 isotope均不同合同，不能混交付。

实装修复后必须执行最终permanent focused test、affected tests、full tests/build/read-only golden、immutable head独立implementation review和fresh三平台CI/Gitleaks。只有全部严格gates成立才可由root按授权merge独立prerequisite bug PR；随后mergedMain/Secrets接纳，C才能在原AlphaFold源段落的三方言mandatory科学run coverage中记录GREEN。目前C仍不能把12-testregistry或其他三个validatorPASS计作该role通过。未来integrator只选择真实接受实现，不merge本REDsource分支。

当前未运行full tests/build/golden/npmci/freshPRCI：仅来源与诊断阶段，没有生产变更且真实RED未修复；原accepted-main checks只证明base接纳。Spec change proposal：无。没有需要人工降级科学期待或放宽security的决定。

恢复交接前执行`git diff --check`、`git status --short`、tracked filenames和`git diff --name-only a5b6acc..HEAD`范围审计；文档commit后确认clean/upstream一致。除了本source/test/doc合同没有其他owner文件。最终SHA与push结果由交接消息精确报告。
