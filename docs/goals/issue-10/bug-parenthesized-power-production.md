# Issue #75 — 完整数值括号平方：focused production 交接

当前状态：BROADER_GREEN_FINAL_PUBLICATION_REVIEW_AND_CI_PENDING。独立 implementation/DOC_ONLY 审查零finding后，root释放一次 affected/full/build/read-onlygolden，全部通过。最后两DOC提交不会改变已验生产/tests/fixtures。原65、72、73与RED及CHANGES_REQUIRED记录保留；fresh PR CI/Secrets、不同作者finalhead审查、root十gates及merged Main acceptance待执行，不声明 #75、完整 FRB 或 Issue #10 完成。

## 契约、基线与提交

[Issue #75](https://github.com/uwougil/Academic-clipper/issues/75) 是 implementation bug，落实 PRD §3/§6、EDD §2.3–2.5 与 corpus canonical §5–7 的原上下标 attachment。原 Methods p22 的 `π(5/60)<sup>2</sup>/8` 与 `π(0.19/60/60)<sup>2</sup>/8` 不能输出孤立指数，或只平方最后 60、平方 π、把 /8 纳入基底。π 和 /8 可以与平方同处一个最终 math atom，但必须在被平方的完整基底外。

- Accepted base：`5c5556499e4ce2755d61e4608a87c72da6677da4`。Root 已核验 merged Main [37870243865](https://github.com/uwougil/Academic-clipper/actions/runs/37870243865) 的三平台成功、Secret scan [37870244073](https://github.com/uwougil/Academic-clipper/actions/runs/37870244073) 同 SHA 成功，以及 #74 automation completed；本 owner 没有重复 CI polling。
- Own branch：`codex/issue-10-bug-parenthesized-power`；worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-parenthesized-power/academic-clipper`。
- 来源/计划前缀：`76e7bfa24217a962a0ba13753e7e2111575b57c4` → `eede55ac7136467510b04507729217b15ca9224c` → `41d47b6a47cbd048f7c92972e0b5c9ddc6f50c5b` → `3e4c12e859d91091d97ba99acd0d854c1d6d8c16`。
- Dependency-only accepted-main merge：`0d1468641092590ea1c21a29872bf710ccb33ff0`。
- 最小生产与必要 source harness：`b65fca0749e346ab9375ad488787c06f20d42ef2`，tree `415878bb692ee17229272f49c03386e91517fa3b`；仅 `src/adapters/nature.mjs` 与 `test/nature-parenthesized-power.test.mjs`。
- 本阶段发布另一个 DOC_ONLY commit，仅本文件及 `bug-parenthesized-power-production-receipt.json`；final SHA 由 root 实际 Git checkpoint 读取，不制造自引用 hash。

## 来源与已有 gate 的复用

原文 [A repeating fast radio burst associated with a persistent radio source](https://www.nature.com/articles/s41586-022-04755-5)，DOI `10.1038/s41586-022-04755-5`。固定 48-block excerpt 25549 bytes / SHA `f672ec55261b61376bb1b0a82889e05b45deec9123442dccabab9829ebcd45de`；provenance 31939 / `8ed315749e0dcf860053b1bbdbe73ef910b1480415a3ba49ea1c86a4e5b9b4e3`。Fixture/provenance/diagnosis 三个 Git blobs 与 `3e4c12e` 完全相同。原 source raw body 545450 bytes / `190a270027c69a816b2647d2fdc6f1777cdf669695506fa40f2fe3cab8801ace`；只复用此前审查，不重新读取或重新抓取 raw。

完整原 Methods p22 subtree SHA `4fe682650c4c464c1d6341c364241d29e154f18ecf7c8565de908b840c9a6fe5`。两个原 SUP 的 UTF8 source 位置分别为 `[228530,228542)` 与 `[229154,229166)`，UTF16 `[227371,227383)` 与 `[227980,227992)`；原基底 `(5/60)` 与 `(0.19/60/60)`、指数 2、乘因子 π、除数 /8 都不改变。原四个有序 S_source/S_offset、`10⁻⁶`、5.5 GHz、0.06/0.01/0.12/0.19 arcsec、steradians/Sr、35 位有序 creators、H2/H3/H4 和 rights 保留。原段落无 citation/resource，合法 references prefix 是 0。

A helper blob `e56f140d9756bb83013b9df0716dc650e04d7917`，sanitizer 1.1.0 / subtree、projection、recipe 1.0.0，保持不变且本次没有 sanitizer/projection 调用。独立 SOURCE_CLEAR_ONLY 48-block gate（human SHA `475d75d87e4206fdf32ddfa21f11e9edf09c6f1128748c012740dc288e8f42da`，machine `beacb248ab51381645fc47dd680dcfe8698a3b3e7ad278414fd8ee5ad93864e8`）与 PLAN_ONLY_CLEAR exact `3e4c12e`（human `589489627ab45ee9fb39e6cf34e74a8c593fef5f2284f2cea81cf98ae9c96b65`，machine `380b6d022fdc62344119129b76d6be270b362f32381dc14a45db3bacb897306f`）复用。

Shared complete-expression oracle 3256 bytes / SHA `42584ede9ff3033fab1628a206e7594f8ad106073bbb8ffd7f55a33f9464e806` 及其 80 个纯字符串 tests 未变；已有 80/80 PASS、70.482ms 不重复运行。本次真实 source15 与当前 strengthened50 已首次执行，不能用原 source15 的 6PASS/9RED 或原50 的 42PASS/8RED 替代；旧失败原样留在原 handoff/外部证据。

## 最小修复与测试生命周期

生产只增加 private `collectParenthesizedNumericSquareRun()` 与一次现有 collector dispatch，共 32 行。它要求同一个直接 text node 尾部为完整单层分式括号：无符号整数或普通小数分子、正整数分母、一或两个 slash，无内部空白；紧邻的原 plain SUP 只有一个 text child，值严格 2。Range 只含完整原括号与 SUP，返回 `${base}^{2}`，继续走现有 typed scientific range、marker、Defuddle、normalizers、renderer、validators。π 与后置除数留在原 text，独立 typed citation 不被吞入。

未知 wrappers/comments、不完整/嵌套括号、零/decimal denominator、不同或拆分 exponent、SUP/SUB continuation、Unicode L/N/M/underscore（含 astral）词法 continuation 均不推测。MathML/MathJax/equation、pre/code、跨 siblings 的 literal math/code cues 保持 opaque。没有 article-ID/digit hardcode、算术求值、一般数学 parser、全局 Markdown 修补、normalizer/validator/security/writer 改动。

必要 source harness 修复不改变 scientific assertions 或 shared helper：11 个 HTTP/DNS bindings 在动态生产导入和 parse 前安装，record-before-throw；默认总是真实三方言 clip，移除 cache 分支；三次 clip 的 windows 保持到整个 batch 完成再关闭，随后 source/test 两个 DOM 在 finally 关闭。After 恢复原 bindings、syncBuiltinESMExports 与全部 10 DOM descriptors，并记录/检查闭合和零尝试。Writer 不调用为静态 clipNature call-path 证据，不声称 runtime writer spy。

## 环境恢复

最初 own `node_modules` 为普通目录，含 `.parenthesized-power-runtime` 和两个 dangling child junction `jsdom`/`defuddle`，指向不可用的 3417 package directories。先将 runtime 两个精确 helper/schema 文件保留到外部 `preserved-source-runtime` 并记录 hashes；确认 own 绝对 child paths containment、LinkType/targets 后，只用 `Directory.Delete(child-link,false)` 删除两个链接，没有递归或触碰目标。

随后仅一次 own `npm ci`，2026-10-09T01:40:06.8876015Z → 01:40:09.4279650Z，exit0；得到实际自有物理 dependencies。Committed lock Git blob `c4883d68e0a71a4abbbab9c01b7f219c9731c08f`，physical SHA `5563c3ec2ac88844ce89f6034b69b31d4dba84bef84df80ce9ebbed8ef42a7a1` 前后相同。没有升级/audit fix，也没有 through-junction install。Before/after receipts、原 npm log 留外部。

## 唯一新 focused 执行

```text
node --test --test-reporter=tap test/nature-parenthesized-power.test.mjs test/nature-parenthesized-power-preproduction.test.mjs
```

Windows / Node v24.14.1，PID 46648，2026-10-09T01:42:38.770Z → 01:42:45.301Z，exit0。65 tests / 65 PASS / 0 FAIL，6479.0275ms；0 skip/cancel/todo。真实 source15 与当前 boundary50 一次执行，无 source/cache/snapshot override；全部 runtime/source/golden physical input identities 前后相同。

真实三 clips，各恰两个完整 ordered squares，所有四 validators valid；scientificFragments 各全部零，7 inline math / 0 display。观察到完整 typed registry 按原序为 S_source、第一 whole square、S_offset=、第二 whole square、S_offset、S_source、10⁻⁶；全部结果保存外部，source断言保护科学 roles/邻居及四 validators，synthetic矩阵额外严格检查完整 registry、markers 和 native ownership。Refs/citations/figures/tables/display nodes 都为空。Exact warnings 仅 `No Nature figures were detected.`、`No equation nodes were detected.`、`No Nature reference list was detected.`，没有 wildcard。

Source lifecycle：3 clip calls / 3 opened / 3 closed windows，2 source DOM / 2 closed，11 bindings 与 10 descriptors restored，attempts=[]。Boundary50 的 49 synthetic parses / 49 closed windows、49 observations 全 PASS，加纯字符串 whole-square第50项 PASS；零 source/clip，原3 bindings及10 descriptors restored。完整 mixed8-run array、原继承四 roles、新四角色、body/caption marker indices/ownership、原 π/divisors、ordered citations 均实际执行并通过。该 boundary suite 的 network ledger 仅覆盖它既有三 bindings，不虚称全 suite 或11 bindings覆盖。

Output positions（零起算 UTF8/UTF16 offset，一起算 line/UTF16 column）：markdown/links 第一基底 1396/1383、57:382，第二 2004/1976、57:975；quarto 第一 1503/1490、54:382，第二 2111/2083、54:975。它们是最终开括号位置，不与原 source SUP 位置混同。

## 外部回执与后续 gate

外部唯一根 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue75-production-5c5556`；所有 full results/Markdown、原 scripts/logs 仅留外部。首次65候选的原 production receipt 54890 bytes / SHA `87ef9b1e2e10bfcbc0470e5d523b85eadc0c5a68fe1702acd33beb26c3498875` 已独立保存；当前续交 receipt 见文末，只承载身份、结构化结果及限界证据，不提交 Markdown snapshot 或 full live capture。

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| focused-first/process-receipt.json | 19561 | ba0334a87c47090bd441d7f7ec5d5cd25c58d67e9afd847468ae14db9a9d6a3f |
| focused-first/focused.log | 13039 | 92114b59d6ff3453d6f90fdb936cff4d36033e01b7892cb19337638565e4f800 |
| focused-first/synthetic-results.json | 22661 | 2d049fc91f7d5cbf11bb0eebdb26ef608821e602319996fceecca4ef9856b35d |
| focused-first/source/network-ledger.json | 332 | 3792ab4450f27ccf9eaec4352758060cd3c9b4f7f6e57d2c85ac70dbb9dfe354 |
| source markdown.md / links.md（各） | 2206 | 215f5d3c979ff6bb5d81f46a794cc052033d25a9ae42a9a01bd86d74c343dc3c |
| source quarto.md | 2313 | ef3b62c6dd7219a4fcd8c38564b6cbe9dcaf4ad716a4dad08179fcb8943caaa4 |

Git diff --check exit0；production commit scope只有上述两文件，DOC_ONLY仅两份交接；source fixtures、canonical/PRD/EDD、golden、dependencies contract、security、writer、CI 保持。一次读取不存在的 `src/dom.mjs` 随后定位为实际 `src/dom-runtime.mjs`；仅定位读取错误，没有 runtime重启/重复执行。

下一步不同 owner 审查精确 stable implementation head；clear 后 root 再释放一次 meaningful affected/full/build/read-onlygolden。之后窄 prerequisite PR 使用独立 `Refs #75`，fresh 三平台 CI/Secrets、immutable finalhead审查、root十项 merge gate 必需。Successful merged Main CI 后由 automation完成 #75，届时 C 才解除 FRB 对应 role；完整FRB与最终 Issue10联合验收另行执行。没有提出 spec change 或 human-only blocker。当前不建立 PR、不执行 broader，也不合并/手动关闭 Issue。

## P2 续交：内层数值平方的资格修正

Different-owner `/root/issue75_implementation_independent` 审查 exact `d2096ddc7a9cd3a33ac6886e0e857aff9ad6750c` / tree `db8b48aba8557a1f753444f325f04208f195c7fb`，结论 CHANGES_REQUIRED，唯一 P2 `P2-75-nested-inner-qualification`。原 text-suffix qualification 会把 `((5/60)<sup>2</sup>)`、`x((5/60)<sup>2</sup>)`、`(5/(5/60)<sup>2</sup>)` 的内层视为独立 finite role；`(see (5/60)<sup>2</sup>)` 是应保留的普通 prose positive。报告 human5921 / SHA `06889750466154fb6498ebffd3694c2e77f4c8d20d7876ce967844906a7aba04`，machine53419 / `f9e1abcc0f41d9e41ccf2916540efce3db53a60fe88365445a16826cc8d6285a`，在外部 `academic-clipper-issue75-implementation-review-d2096dd`。Reviewer 原四次 probe 已记录并复用，没有重复 probe 或声称它们是真实学术来源。

新增永久 `test/nature-parenthesized-power-nesting.test.mjs` 仅七条明确 synthetic 回归：原三 negatives、enclosing numerator 与内层之间空白、外层 numeric 中的 π factor；普通 prose positive 与带原 π/divisor 的 decimal prose positive。每条断言完整 ordered scientific registry、零 inlineMath/citations；negatives 的原 innerHTML 不变，positives 只有一个原 paragraph marker owner。Guards 在 lazy production import 之前覆盖11bindings，七 DOM 在finally逐一close，exactbindings/10DOM descriptors复原，attempts=[]，零 clips/source/raw/A。

在 production 仍为 exact d2096dd 时，仅一次新7 RED：

```text
node --test --test-reporter=tap test/nature-parenthesized-power-nesting.test.mjs
```

PID26112，2026-10-09T01:50:38.878Z → 01:50:39.579Z，exit1；7tests /2PASS /5true CONTRACT_RED /0harness，649.0815ms，0skip/cancel/todo。两个 prose positives PASS，五个 unsupported enclosing cases 仍产生内层 marker，证明新回归失败于本 P2。未重跑原65/source48/pure80。

随后仅新增三行 qualification（两行注释、一行 guard）：text prefix 中尚未闭合的 opening parenthesis 若后面只有数值/decimal dot/π/算术 punctuation/空白，就不能证明独立 base；未知 numeric enclosing group 保持原 DOM。普通含词语、已分隔的 prose parenthesis 不被该 guard 禁用。没有一般数学 parser、blanket parenthesis ban、fixture/oracle/helper/validator 变更。Code commit `39bf7bd2663616302bca466b482db52133d00877` / tree `935a1fe04a7f6900deb41ada074f665989fffa9d`，仅 production三行与新synthetic test；总生产 delta35行。

代码改变后一次必要 fresh batch：

```text
node --test --test-reporter=tap test/nature-parenthesized-power.test.mjs test/nature-parenthesized-power-preproduction.test.mjs test/nature-parenthesized-power-nesting.test.mjs
```

PID53468，2026-10-09T01:50:59.555Z → 01:51:00.670Z，exit0，72/72PASS，1065.4939ms，0skip/cancel/todo。Source15/current50/new7全部实际执行，不搬用原65。3真实clip windows在wholebatch后close3、sourceDOM2close2、11bindings/10DOM复原、attempts=[]；两个完整原source squares、其余原S/10⁻⁶/measurements/35creators/rights/zeroresources/exactwarnings、四validators全部保持。三个完整savedresults与三个Markdown共六文件与首次65 **bytes完全一致**，该比较仅读同次既有输出，没有新的 clip/DOM。Current50完整mixed8-run/所有markers/body-captionownership/原有typedcitations仍PASS，49parses/49close；new7均PASS、7close7。

本次没有新的 dependency setup/install、source48/raw/A/recipe audit、pure80重跑、full/build/golden/CI。原first candidate documents完整拷贝到外部 `original-d2096dd-production.md` / `original-d2096dd-production-receipt.json`，原65与独立CHANGES_REQUIRED证据不覆盖。当前 production receipt146795 bytes / SHA `cf5d66c00f1ae2216c4c68f0ed6846b660adfaf24f5840a7821f19ed895be213`；root fields指向新代码/72执行，firstCandidate明确保留首次65，p2Revision保留原finding、RED→GREEN、outputs equality与当前未完成gates。

| P2 artifact | Bytes | SHA256 |
| --- | ---: | --- |
| nesting-red/process-receipt.json | 19050 | 71c5382c1beeff3be396fd3a1267726adc7e211abbccd1db2883fa660a90fd6b |
| nesting-red/tests.log | 7314 | 2be7155aaaf5cd9126970a0dc6edfa6d6cd10c8133d8961c2f3dc7b23af07f8f |
| nesting-red/nesting-results.json | 4818 | b2758b031462df344162d18832930a813982f3925b37a8fb9dcdfd3d317cb611 |
| p2-focused-green/process-receipt.json | 20166 | 4acb43429e30b9911f1bc7b96a35407f29d15376d72838386333d1a2921139e9 |
| p2-focused-green/tests.log | 14437 | cc63d2e9816c9ad65b401e625333eb4dbbb083bd5e2159af5594031caf09b8d1 |
| p2-focused-green/nesting-results.json | 2653 | 613895ad32f1c995bd2da46945a10ff9295b5ce987b44e2f57eb3230113179fc |

Sourcefixture/provenance/diagnosis 与 shared3256-byte oracle保持；current runtime inputs在各次run内pre/post精确相同。DOC_ONLY仅更新这两生产交接文件。下一步交同一 reviewer 对 exact新publication做P2增量审查；还未有 IMPLEMENTATION_CLEAR，broader/full/build/golden/PR仍锁定等待root释放。没有 spec change，没有 #75/Issue10 completion声明。

## 同一 P2 尾修：识别包含先前闭合 group 的数值外围

Different-owner 对 exact 5d3c353fc9a4aac29a92571d0794291c9cffc513 / tree 3b28129f09bafb073a7276614a6468d16523b0d6 的增量审查仍 CHANGES_REQUIRED，唯一 P2-75-nested-inner-qualification。新增唯一 synthetic 形状为 `((3/12)+(5/60)<sup>2</sup>)`：前缀包含闭合 `)`，旧数值 suffix guard漏掉仍开放的外层。Reviewer已做的一次probe和原报告复用，没有新增probe/来源审查。报告human5218 / SHA 7d22456bd7eb3f4c562e85411208926915e9cb5f8891d20e2ec7bd8ea09f8be7，machine35697 / SHA 048241a1ce37bbc357d184dffd979ffcfc462fe6d1ee5ed6474e709af92c3842，原probe837 / SHA 4e7e40f007963db213f575d7c92701fc45dda33d8020eb19a8e38149569fcdf3。

永久nesting suite仅增加这一个完整registry negative。在production未改变的5d3c353上，唯一命令 `node --test --test-reporter=tap --test-name-pattern=numeric-outer-with-closed-inner-group test/nature-parenthesized-power-nesting.test.mjs`，PID39452，2026-10-09T01:58:05.620Z→01:58:06.273Z，exit1：1test/0PASS/1true CONTRACT_RED，596.8056ms，0skip/cancel/todo。1parse/1DOMclose，11bindings attempts=[]、exactbindings/10DOM复原，clips/source/raw/A=0。原7与72没有在修正前重复执行。

Code commit dc05eaeb794cd8a65cb86912d47a63a6c10ac959 / tree b8b154bbdaca9b044193ecf88b3a935674c31c48，仅 nature.mjs资格判断与一条synthetic case。Bounded backward scan只检查原直接text prefix括号深度，识别先前已闭合group之后仍开放的numeric enclosure；普通含文字的prose parenthesis继续保留，未知结构不作一般表达式推断。最终production相对accepted dependency总计46新增行，没有一般数学parser/求值、fixture/oracle/helper/validator/security改变。

一次必要changed-code batch：`node --test --test-reporter=tap test/nature-parenthesized-power.test.mjs test/nature-parenthesized-power-preproduction.test.mjs test/nature-parenthesized-power-nesting.test.mjs`。PID41104，2026-10-09T01:58:57.645Z→01:58:58.849Z，exit0，source15+current50+nesting8=73/73PASS，1155.0823ms，0skip/cancel/todo。Closed process receipt的implementationHead为当时尚未提交delta的5d3c353；actual productionBlob583fa29b9242fd676336edc59f4daf0b32cf206e及全部physical pre/post inputs准确匹配dc05代码，不将priorHEAD误作旧production运行、不改写原回执。55项pre/post精确相同，当前physical bytes/hash同样逐一匹配。

3真实clipwindows在wholebatch后close3，sourceDOM2close2，11bindings/10DOM复原、attempts=[]；old50的49parse全部close49、既有3bindings范围；nesting8close8、11bindings/10DOM复原。八条完整ordered registries全部PASS，六negatives保留原innerHTML（由test原断言检查，不把receipt的textContent当innerHTML），两个prose positives保留唯一marker owner。真实source两whole squares、原S/10⁻⁶、measurements/35creators/rights/zeroresources/exactwarnings与四validators全部GREEN。原mixed8及citation/body-caption ownership均通过。三个完整resultJSON与三个Markdown共六文件，与首次65及此前72 outputs bytes完全一致；此比较仅读savedoutputs，没有重复clip。

恢复packaging仅复用闭合回执，runtime/tests/install/source/raw/A/probes/pure80/full/build/golden/CI调用均0。原5d3c353两文档先复制外部original-5d3c353-production.md/receipt.json；JSON的secondCandidate保留72，firstCandidate保留65，原p2Revision保留7RED及首次finding，closedPrefixRevision明确新1RED→73GREEN、第二CHANGES_REQUIRED、所有identities和未完成gates。当前receipt 231883 bytes / SHA b8f884c91b5841b072c920b90b3e286c764595b348ae154c2b55e7c755462370。

| Closed-prefix artifact | Bytes | SHA256 |
| --- | ---: | --- |
| closed-prefix-red/process-receipt.json | 19132 | 7b59de7fb60ec172a6edca9fcda5b97ef9b67be98f278a18669081a10fff86ff |
| closed-prefix-red/tests.log | 1391 | 94a7e6c37f6074dd2c916481a95f28668cfb8457547c74ccad379c9b62f5bdcb |
| closed-prefix-red/nesting-results.json | 1048 | 1066f5135bba7bfee9ae1bc3b78d932b1c87131b7fce1ffffaa400045efc6296 |
| p2-closed-prefix-green/process-receipt.json | 20196 | f124cb40ae976d7364b71b78fb4370c3af61697cd3b1fc2fb9c8281a3ff641d7 |
| p2-closed-prefix-green/tests.log | 14668 | d2f1410cea8eb21af4b40ec811ddfc35b4edaab58091a8e707027c1a427e031b |
| p2-closed-prefix-green/nesting-results.json | 2956 | 51905bc889066320fd47ce80200f3e8693be0bdfffe803ac93be5ec4ec2b61ab |

DOC_ONLY仅这两production交接文件；code dc05保持。下一步同一reviewer只对有限资格尾修/一条case/闭合73回执增量复审；clear之前不执行broader或建立PR。其后required affected/full/build/golden、single Refs #75 PR、fresh三平台CI/Secrets、immutablehead审查、root十gates及successfulmergedMain仍必需。C的完整FRB与最终Issue10联合验收仍待对应accepted-main，不以本packet声明完成。没有spec change。

## 正式 broader 一次执行与最终发布交接

Different-owner code dc05 IMPLEMENTATION_CLEAR与exact31382912101d8f41258994bbb25ca9f1a6ca7cd3 / tree d8d1f547b33ac854ba321521968146951e774043 的 IMPLEMENTATION_CLEAR_DOC_DELTA_CLEAR均 blockingFindings0。Human implementation5900 / SHA 4017a65fc30a8055cef21f5d7cc72e3df8237c28b2a05f496875e7aa605063bb；machine39980 / SHA e5562e176667e52c1be16fd80ed8efb80109f3a9259d66affb3f4fe57dd07c6d；DOC delta身份见JSON broader.reviewArtifacts。Root全文回读后正式释放下面一次序列。

外部根 C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue75-broader-dc05eae。WrapperPID46672，execsession38357，Windows/Nodev24.14.1。精确clean313829为全部检查head，production仍dc05；299项tracked src/tests/extension/scripts/golden/package-lock输入每tier前后以及finalpackaging时bytes/SHA完全相同。Golden9文件没有改动，dist构建保持ignored。

| Check | Actual result | Native PID | UTC start → finish |
| --- | --- | --- | --- |
| affected | 1029/1029 PASS, 15108.3441ms | 23372 | 2026-10-09T02:19:57.693Z → 2026-10-09T02:20:12.897Z |
| full | 1439/1439 PASS, 96078.1574ms | 12164 | 2026-10-09T02:20:12.927Z → 2026-10-09T02:21:49.297Z |
| build | exit0 | 52352 | 2026-10-09T02:21:49.326Z → 2026-10-09T02:21:49.598Z |
| golden | exit0 | 39748 | 2026-10-09T02:21:49.626Z → 2026-10-09T02:21:49.911Z |

Affected命令为node --test加38个有限相关文件，完整argv在receipt；排除own parenthesized suites，避免额外重跑73与pure80。Canonical full命令严格npm test，自然执行全部own source/current50/nesting8与pure80，不能把required全量中的这些执行虚称零。随后npm run build、npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto全部exit0。两测试tier均0fail/skip/cancel/todo；没有npm ci或dependency升级、额外focused/probe/source48/raw/A/recipeaudit。

Full运行保存原source3真实clips，wholebatch后close3articlewindows、sourceDOM2close2，11bindings/10DOM复原，attempts=[]；old50有49parse49close，原3binding范围；nesting8有8parse8close、11bindings/10DOM复原。原科学/三方言/fourvalidators/mixed/citations保护实际执行全部GREEN，六savedsourceoutputs与73focused逐字节相同。Writer无调用仍为静态clipNature路径证据，不宣称fullsuite全局network/writer spy。

每个native process都onclose保存exit/signal/logbytes/hash及inputpre/post，one sequential runner成功terminal为BROADER_PASS；没有超时重启/重试。Machine production receipt追加broader与当前未运行门槛，不覆盖firstCandidate/p2Revision/closedPrefixRevision；原313829两DOC外部保留。当前receipt376104 bytes / SHA 7235bd461d47f3dcf462c44c8fd2d940c8318d3934717796d53130daac3fbaae。所有日志、完整outputs、runner仅外部，DOC_ONLY只改变这两个production交接文件。

发布一份独立 prerequisite PR，仅精确 standalone Refs #75，base为最新accepted5c5556499e4ce2755d61e4608a87c72da6677da4。Final DOCcommit SHA/tree由root/PR真实Git回读，不制造自引用；PR head在push后固定。当前不授权merge：fresh三平台PR CI与Secrets成功、不同作者final immutablehead审查、root十项matchheadgates仍必需。Merge仅接纳代码，successfulmergedMain与automation完成#75；C随后对fullB FRB及最终Issue10做独立accepted-main增量验收。本PR不完成Issue10，最终Issue10 PR仍保留humanreview/unmerged。无spec/PRD/EDD变化或human-only blocker。
