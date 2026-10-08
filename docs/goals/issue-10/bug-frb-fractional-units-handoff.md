# Issue #72 — FRB 分数单位来源合同交接

状态：SOURCE-ONLY RED，未修复。独立合同 [#72](https://github.com/uwougil/Academic-clipper/issues/72) 为 OPEN / `bug`；生产 gate 由 orchestrator 控制。不同作者的 103-block source audit 尚待执行，本 agent 不自称独立审核通过；不声明 #72 或 #10 完成，没有创建 PR。

## 基线、所有权与 commits

- Accepted base：`a5b6acc2984af5cb8b82106291e963f4f413f5ac`，PR #69 merged-main/Secret scan/automation accepted 的基线由 root 核验并交接。本 source-only 任务未改变该生产实现。
- Branch：`codex/issue-10-bug-frb-fractional-units`。
- Worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-frb-fractional-units/academic-clipper`。
- 第一个来源/复现 commit：`2b0f02abf440dffe55a5416a78d0480afe4f9357`。
- 第二个 commit：本 handoff 和局部 source-whitespace attributes；从 `git log --reverse a5b6acc..HEAD` 获取其精确 SHA，不在文件中伪造自引用 SHA。
- Owned files：`test/fixtures/nature-frb-fractional-units/{.gitattributes,README.md,diagnosis.json,s41586-022-04755-5.excerpt.html,s41586-022-04755-5.provenance.json}`、`test/nature-frb-fractional-units.test.mjs` 与本 handoff。
- 不改 canonical spec、PRD/EDD、生产 `src/`、package/lock、B corpus、C assertions、D transport、golden/security/writer；不触碰其他 agent checkout/index/branch。

Canonical §4 astronomy role、§5 truthful complete-block excerpt、§6 provenance/byte identity、§7 scientific-inline attachment 与 strict production validators 是合同依据。C 中 `s41586-022-04755-5/source-inline-v1` / `nature-source-inline-v1` 和 math-validator 的相关失败仍是前置缺陷，不能计入 #10 已通过 coverage。全部 corpus expectation 仍由 C 独立消费，本小摘录不能替代原完整 FRB corpus 验收。

## 来源与 A interface

Original B selected source contract：`b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`。来源是 [Nature article](https://www.nature.com/articles/s41586-022-04755-5)，DOI `10.1038/s41586-022-04755-5`，标题 `A repeating fast radio burst associated with a persistent radio source`；`observedAt=2026-10-03T16:48:03.040Z`、`captureMode=guarded-http`。原公开 anonymous body 545450 bytes，SHA-256 `190a270027c69a816b2647d2fdc6f1777cdf669695506fa40f2fe3cab8801ace`；仅在外部临时目录读取原 capture，没有重复 acquisition/cookies/private session。

A original helper Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`，34946 Git-LF bytes，SHA-256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`。执行前比对当前 B helper 的 CRLF→LF 与原 blob 相同，直接使用 `sanitizeNatureHtml(rawText, recipe)`、`serializeSubtree(node)`、`sha256Bytes(rawBuffer)`；未复制 A 基础设施。Sanitizer `nature-corpus-sanitizer/1.1.0`、subtree serializer `nature-corpus-subtree/1.0.0`、projection `nature-corpus-projection/1.0.0`、recipe `1.0.0`。Hash raw bytes 在 decode/DOM/sanitize 前完成。

Recipe `s41586-022-04755-5-fractional-unit-powers-v1`，103 retained blocks，recipe SHA-256 `9dac4431f9f8ac80b2de65b1540a2fee2c3971103d247aa4f63fc324b46413a3`。完整 recipe、每个 retained subtree 原 hash、transformations/signatures、source-rights 和 omittedContent 见 committed provenance。原 title/canonical/DOI/article JSON-LD、完整 35 ordered citation_author creators、Methods `Sec2` / H3 `Sec17` / H4 `Sec23`、两个完整段落、正文引用的 Equ8、References prefix 1–52、完整 original CC BY 4.0 notice/footer 保留。未以缺失 table-page license 代替 article notice，也未将源文重新授权为代码许可证。

## 源 oracle 与边界

Methods 段落 index 按原 `section[data-title="Methods"] p` 零起算。

| Block | 原 locator / index | 原 subtree SHA-256 | frozen subtree SHA-256 | 角色 |
| --- | --- | --- | --- | --- |
| p50 | `p:has(#ref-link-section-d99382980e7724)` /50 | `e7cb41b94a30d276ec37144e4dd2a279ed04bf3025bea80d85a73c9b2bbae07b` | `4feefaba91c53aa355d409c9e2bfdd66106a825776d5e3d715fed2bcf6147969` | 8 fractional unit powers、4 pairs |
| p51 | 上述完整 P 的 adjacent `+ p` /51 | `216ca0dac23172ffbfbddae293636aea1352805b92347a6bbe7dcea5e88431d0` | 同原 hash | 4 fractional unit powers、2 pairs |

12 role IDs `methods-p50-fraction-1`…`8` 与 `methods-p51-fraction-1`…`4` 逐项记录原 SUP index/HTML、preceding/next text、base/exponent。每个 pair 的 `−2/3` 只属于 `pc`，`−1/3` 只属于 `km`。前置 numeric coefficients、`0.1–1` range、ordinary measurement/denominator 与另一 unit factor 不属于这个指数；不得修正源中实际 `F̃ 0.1 ≈ pc...` 的词序/值。p50 的 source `d_so` 重复文字也照实保留。

同段已有4个 `cm⁻³`、两个 numeric powers `10⁻³`/源 `≳10²`、styled scientific runs、MathJax、citation52、Equation8 TeX/number/target 是兼容性控制。References 保留 1–52 完整 prefix，citation 编号没有压缩或重编号。未纳入原 Methods p22 的 `(5/60)²`、`(0.19/60/60)²`；它们是另一个 required numeric-base bug family。#48 是已完成的整数 unit/numeric sources；#63 是 split SUP integer sign/digits；#67 是 compound mS·cm⁻¹，均不在此任务修复范围。

## 实际复现、混合失败与缓存

Windows PowerShell、Node `v24.14.1`，dependency junction 指向已有 B `node_modules`，没有安装/更改 dependency 或 lock。三个实际 `clipNature()` 执行都来自同次新 projection，各方言只有一次调用：

```powershell
$env:FRB_FRACTIONAL_RECEIPT_ROOT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-frb-fractional-units/red-a5b6'
node --test test/nature-frb-fractional-units.test.mjs
```

初始命令 exit1：15 tests、3 PASS、12 FAIL、1540.0662 ms、0 skip/cancel/todo。6 true failures 是3方言的 fraction-role attachment + strict math validation；其余6为 harness 对 numeric `≳10²` 合法合并、不存在的 displayMath.id 等预设错误，不作为 parser RED。后续纠正 displayMath.tex、existing `equation-8`/`eq-equation-8` identifiers/链接语法、exact warning 和 `referencesBib(references)` 接口；初始日志完整保留，fixture bytes/原 12 source roles 没有变。

```powershell
$env:FRB_FRACTIONAL_CACHE_ROOT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-frb-fractional-units/red-a5b6'
Remove-Item Env:FRB_FRACTIONAL_RECEIPT_ROOT -ErrorAction SilentlyContinue
node --test test/nature-frb-fractional-units.test.mjs
```

第一次 cached harness correction：exit1、15 tests 8 PASS/7 FAIL、780.988 ms，其中1仍是错误要求 Quarto `@eq-*`，而当前 renderer 正确给 matching identifier + link。最后 cached contract：exit1、15 tests 9 PASS/6 true FAIL、743.0504 ms，0 skip/cancel/todo、0 new clips。完整 `rawHtml`/dialect 检查保证缓存匹配这个 excerpt。生产变更后的 focused acceptance 必须删除 cache 环境变量，不能将 cached diagnostics 视作 fresh pipeline validation。

三方言实际 `mathValidation` 均 false，scientificFragments 恰好12个 isolatedSuperscript；`rawHtmlValidation`、`markdownStructure`、`crossReferenceValidation` 全 true。每个 p50/p51 实际 orphan 位置/line/column 与原 role 逐项映射到 `diagnosis.json`；不会因第一个 assertion 先失败便将未到达的 p51 判作通过。引用 cluster 恰为 `[52]`，References52、displayMath1；figures/tables为0。Exact warning 仅 `No Nature figures were detected.`，没有 No equation warning。HTTP/DNS record-before-throw attempted operations 为空，并在 after hook 检查，原 global/builtin bindings 已恢复。Writer 证据是 static clipNature call graph 不调用 writePaper；未伪称 writer spy。

外部 evidence root：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-frb-fractional-units`。三个 same-run full `*.result.json` 与 `*.md` 保存于 `red-a5b6/`；完整 captures/results 不提交。Committed `diagnosis.json` 仅包含 scoped positions、hashes、validators/counts 与 failure classification。

| Evidence | Bytes | SHA-256 |
| --- | ---: | --- |
| Fixture | 80065 | `9196756aa9c59254f6b310a59f6218853a6eece7025c4eac926aed21df7b16be` |
| Provenance | 65081 | `0271c2b543d016d35c573cb047e28435a81b07cb8eb323114a1b23d0f7d6970d` |
| Diagnosis | 15276 | `aa3a66dbb9e3ae5ec714ef8f0be5d28372061e16f13bfebc4f59f531d3e7a487` |
| markdown output | 14801 | `dfb6d04d919478d2edef5da77975de4475dfff024048ba719c32edfc493a551a` |
| links output | 15722 | `c3c3b63f788978a089ae20a4f4708441055cc5e2c44406a696c0e6069ba865fe` |
| quarto output | 4311 | `f3bee091a2914818594ecf5a330cfa15b57ccf0417abeaa2b655f1729953672f` |
| markdown same-run full result | 177948 | `f75f0f7d201da5ebc36576118806c0db0f5131415d083a54ebc7cf358ec4061d` |
| links same-run full result | 181139 | `84eddef020ff4c30825e75c378a49c8a12168721dcd852074947c08754326ce6` |
| quarto same-run full result | 156878 | `d94ca3f53dc1484d3b5d233bd2fec3ae1f92119833b9c42a89a4f0b067ea2b98` |
| original RED log | 44997 | `cef1c6ee23cf2b0dab99ac4d85c7fca83d62b361f7cbae35614d6480c186422e` |
| first cached correction log | 41176 | `93ab3be830ffb4ecb4e93a7a4149382ccc030b0e998f8ef873391d130b157515` |
| final cached correction log | 40408 | `9f8cb0176b764d2c6d3fa2d7c90646fcb64529f4a99686fba54bbc05ebe27dff` |
| original attempted-network ledger | 139 | `277d9eb94e43dc1026202a2aff2acbfa4d68b228961efcb6e8ce8fc8ba05bdcc` |

## 诊断、变换与未验证项

`normalizeAcademicInline()` 的 `renderKnownTag(SUP)` 先产生 isolated `$^{...}$`；`combineLiteralPowers()` 的 `UNIT_SYMBOL` 能正确识别 pc/km，但只允许整数 fragment `^[−+\-]?\d+$`。真实 signed fractions 因此不与 preceding known-unit factor 重接，严格 validator 揭示错误。原 source scientific node 丢失并非 access、schema、Defuddle heading 或 References 问题。未来最小修复应在已有 normalization boundary 内保护这些 source-backed roles，保持 opaque math/code/citation 与 unknown-word boundaries；不建立第二 Nature parser、不宽匹配所有未知词、不改 validators/input。

完整两段 original semantic blocks 与必要祖先保留；A 清除 tracking/event/executable/session 数据、选择 article JSON-LD、稳定 UTF-8/LF scaffold/attribute order。其他正文、作者 affiliations、References52之后、未指向的 figures/tables/equations/supp、图片/PDF/binary/full raw 均省略，provenance 逐项记录。没有 TeX/manual scholarly rewrite。

首次累计 `git diff --check a5b6acc..HEAD` exit2 来自保留的 publisher whitespace-only lines，原日志 `initial-diff-check.log` 保留。第二个 commit 仿既有 source excerpt policy 加局部 `*.html ... whitespace=-blank-at-eol`，保持源字节和 hash，未 trim/pretty-print 原 scientific text。其后累计 diff check 与最终 status/owned paths 在交接核验。

新 projection 的独立103-block原 raw semantic/serialization audit：未执行，待不同作者；没有重做原B13 fixtures/C85 oracle/A infraestructura audit。生产修复、affected/full tests、build/golden、新 PR/fresh CI/Secret scan 均未执行，原因是本任务明确 SOURCEONLY且生产 gate 尚未释放，不能将 RED branch 合并。无建议 canonical spec semantic changes；所需行为已经由 §7/PRD/EDD 明确。

## Root / C 解除条件

1. 不同作者在 final source commit 上检查全部103 recipe blocks、原两段及 Equ8、references prefix/35creators/rights、byte hashes/transformations，reuse 原B provenance，报告独立 blocker结果。
2. Root 在当前最新 accepted main、源 audit 清楚且 shared production gate 空闲时恢复此独立 bug；准确选择来源 commits，补做 focused compatibility与最小生产修复。
3. 默认无 cache 的永久测试覆盖三个实际方言和全部12 source roles；真实 semantic/全部validators与HTTP/DNS guards通过。Affected/full/build/golden/independent review/fresh三平台CI与Secret scan通过，按 root 十项门槛处理唯一 bug delivery PR。
4. 成功 merged-main/Secret scan 后通知 C 最新 accepted SHA 与 `source-inline-v1` 分数单位角色，C 从原 frozen FRB fixture执行必要delta/最终完整验收。仍保留 p22两 numeric-base powers 的独立 required failures，不能称整个 FRB或#10完成。
