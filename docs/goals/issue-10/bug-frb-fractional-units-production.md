# Issue #72 — 原分数单位因子的 focused 生产交接

状态：**LOCAL VERIFICATION GREEN / AWAITING PUBLICATION REVIEW AND FRESH CI**。首次 source15 + matrix79 focused、独立 implementation review、affected831、full1118、build 与只读 golden 均已完成。本文追加闭合 broader 证据；原 focused-stage 执行记录与 null-summary 更正保留。最终 publication exact-head review、fresh 三平台 CI/Secrets 和 root 十项 gate 仍待完成。#72 尚未完成，#10 尚未完成。

## 基线与精确 commit 顺序

- Accepted main：`3dba1bbccddb43e0ba22fa7b7717dc559b7f3494`，#71 PR #80 squash。Root 明确释放本任务前已核验 merged Main `37770933630` 与 Secrets `37770933677` 对同一 SHA 成功，Issue #71 由既有 automation 完成。这里消费 root 交接的 accepted state，没有重复其 CI watch 或源审核。
- Worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-frb-fractional-units/academic-clipper`；branch：`codex/issue-10-bug-frb-fractional-units`。
- 原完整来源/计划序列：`2b0f02abf440dffe55a5416a78d0480afe4f9357` → `2ef0774d63bba7202c84089e1d233e70197c2cdd` → `7de3629334576d5cfdf0d48429802dfa4b4964d0` → `fbc5c59d07f2ac6de6496f2c27eedbb107c17753`。
- Dependency-only adoption：`2d6cee2ad760be0ce1cf9f08ff126a8548e8b480`。只合入上面的 accepted main，没有另一个未接受 Nature writer 的代码。
- 本任务生产/测试 commit：`2dcaaf926a4a424fda20b6c61148c12b916de0d1`；tree：`e36de93dd756f33089943a40d7ec51ab799fbfb4`。仅 `src/adapters/nature.mjs` 和 `test/nature-frb-fractional-units.test.mjs`；本 handoff 和 [machine receipt](bug-frb-fractional-units-production-receipt.json) 在后续 docs-only commit 中。实际最终 SHA 从 branch `git log` 获取，不在文档伪造 self-reference。

## 证据与最小修复

[Issue #72](https://github.com/uwougil/Academic-clipper/issues/72)、canonical §4–7、PRD §3/§6、EDD §2.3–2.5 已要求保留原科学上下标关系。原 `pc<sup>−2/3</sup>` 与 `km<sup>−1/3</sup>` 在 literal integer attachment 之外，变成严格 validator 拒绝的 isolated SUP；不是 access、schema、writer 或 source 改写问题。不同作者的 source103 审查 `SOURCE_PROJECTION_CLEAR_ONLY / 0 blockers` 与固定 `fbc5c59` 的 `PLAN_ONLY_CLEAR / 0 blockers` 继续有效；没有重新 acquisition、raw/HTML source audit、A sanitization、projection 或历史 RED 执行。

Nature 私有 `collectPlainFractionalUnitRun` 共 28 行，既有 collector 链新增一行调用，返回现有 `{start,end,tex}` range。它只接受直接相邻 Text + 单个 plain Text child 的 SUP，完整 factor/exponent pair 严格为 `pc → −2/3`、`km → −1/3`。原 Unicode minus 和 rational denominator 不改写；原子 `\mathrm{pc}^{−2/3}` / `\mathrm{km}^{−1/3}` 交给既有 scientific marker/render pipeline。

起点仅是原 unit 首字符，终点仅在原 SUP 后。测量 coefficient、range、denominator、相邻 unit 和普通 prose 保持在 range 外。左右 Unicode L/N/M/_ 包括 astral 边界、未知 sibling/wrapper/comment/extra scripts、complex SUP、错误 unit/fraction/sign、opaque TeX/code/MathML/MathJax/equation 均保持原所有权；紧邻已证明的 citation SUP 仍独立处理。没有 general fraction parser、generic publisher abstraction、全局 Markdown/normalizer repair、article hardcode 或安全改变；validators 与 Defuddle 原样复用。

永久 source harness 的必要修订：guards 在动态 production import 与 DOM 创建前安装；实际三次 clip 通过真实 global DOM seam 观察 parser window。Defuddle 会缓存第一 DOMParser，因此三方言整个 batch 完成后再关闭观察到的三个 window。After 恢复 11 个 fetch/callback/promise DNS methods 和全部 10 个 DOM descriptors，写实际 restore identity；不声称虚构的 window 或 writer spy。此生命周期更正没有关闭后重跑的失败，首次 candidate 即通过。

Source assertions 保留全部原 checks，并加严到 23 个完整有序 scientific records（含 marker/provenance/inherited roles）、10 个原 inline TeX records、完整两个段落 source text/TeX presentation comparison、35 ordered creators/identity、每个 math atom 完整且只含单一 unit factor、zero leaked placeholders。Paragraph presentation comparison只移除字体 wrapper、强调、delimiter、结构 brace 与表示空白；12 个单位指数、原整数控制和完整 registry 用独立 exact checks 验证，不能靠去 brace 比较把错误 attachment 计作通过。Synthetic79原文件没有修改，全量消费已经 independently CLEAR 的完整 registry/marker/ownership/multiplicity/boundary assertions。

## 原来源、位置、界限

真实来源：[FRB article](https://www.nature.com/articles/s41586-022-04755-5)，DOI `10.1038/s41586-022-04755-5`；35 creators。B selected `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330` 的 anonymous guarded body 身份与 frozen source oracle 原样消费。A helper `e56f140d9756bb83013b9df0716dc650e04d7917`，sanitizer `1.1.0` / subtree、projection、recipe `1.0.0`；原 103-block audit、recipe/signatures/rights/omissions 见 [source handoff](bug-frb-fractional-units-handoff.md) 和 frozen provenance。

| 来源 / roles | 精确定位 / 原 digest | 必须保留 |
| --- | --- | --- |
| Methods p50，fraction-1…8 | `p:has(#ref-link-section-d99382980e7724)`，zero-based50；`e7cb41b94a30d276ec37144e4dd2a279ed04bf3025bea80d85a73c9b2bbae07b` | 四对 pc/km，完整原 prose、measurements、ranges 与 source `d_so` 重复文字 |
| Methods p51，fraction-1…4 | 上述 adjacent `+ p`，zero-based51；`216ca0dac23172ffbfbddae293636aea1352805b92347a6bbe7dcea5e88431d0` | 两对 pc/km，原 `F̃ 0.1 ≈ pc…` 词序/值不整理 |

Excerpt `80065` bytes / SHA-256 `9196756aa9c59254f6b310a59f6218853a6eece7025c4eac926aed21df7b16be`；provenance `65081` / `0271c2b543d016d35c573cb047e28435a81b07cb8eb323114a1b23d0f7d6970d`；diagnosis `15276` / `aa3a66dbb9e3ae5ec714ef8f0be5d28372061e16f13bfebc4f59f531d3e7a487`。五个 fixture-folder tracked files 与 source commit `2ef0774` 的 Git bytes/blob 完全一致，machine receipt 列出 Git/physical identities；source text 没有 trim、手工 TeX 或 DOM 修补。

35 creators、Methods/H3/H4、原 Equ8、References 完整 prefix1–52、citation52、CC BY4.0 notice/footer、四个 cm⁻³、10⁻³ 与 ≳10² 为兼容性控制。NoFigures warning 恰好一条，figure/table resources 为 `[]`，无需 replay network。Methods p22 的两个 parenthesized numeric-base powers 仍为独立 #75，不把本 focused GREEN 称作原完整 B FRB corpus 已通过。

## 唯一 candidate 执行

Windows / Node `v24.14.1`，既有 read-only dependency junction；没有 npm ci/install 或共享依赖写入。External wrapper：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue72-production-3dba/run-focused.mjs`，两个 commands 分别在不同 Node test child process 执行一次。未设置 SOURCE_ROOT override；实际消费 adopted worktree 的当前代码。两个 CACHE env 均被删除。

```powershell
$env:FRB_FRACTIONAL_RECEIPT_ROOT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue72-production-3dba/focused-first/source'
node --test test/nature-frb-fractional-units.test.mjs
# 第二个 child 的实际 env 使用独立 matrix receipt root，无 source/cache overrides。
$env:FRB_PREFLIGHT_RECEIPT_ROOT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue72-production-3dba/focused-first/matrix'
node --test test/nature-frb-fractional-preflight.test.mjs
```

| 实际 command / UTC | 结果 | Runtime 与 guards |
| --- | --- | --- |
| Source15，11:57:24.478 → 11:57:26.088 | exit0；15/15 PASS；1568.1294ms；0 skip/cancel/todo | markdown/links/quarto 各一 actual clip；3 windows observed/closed after batch，1 source DOM opened/closed；attempts `[]`；11 methods/10 DOM descriptors restored |
| Complete matrix79，11:57:26.096 → 11:57:27.667 | exit0；79/79 PASS；1529.3215ms；0 skip/cancel/todo | 73 synthetic parses、3 synthetic clips，74 harness DOM opened/closed；86 captured windows closed；attempts `[]`；原 bindings/getter restore 全 true |

三个 source results 的全部四个 production validators valid，23 scientific runs、10 inline TeX、1 display、References52、citation52、完整两个原段落与 12 个 whole-factor atoms 通过。79 个矩阵 records 的每个 check 真实 PASS；没有 filtered counts、warning wildcard、缓存替换 fresh result 或 hidden required skip。所有输入 physical bytes 在两个 commands 前后及 packaging 核对不变。

| 外部闭合 artifact | Bytes / SHA-256 |
| --- | --- |
| `focused-first/source/source.log` | 1536 / `b0e2f4f6665454c2210923372b5c7364c1f5c7381e736c054e9dc7b953d76d5c` |
| `focused-first/matrix/matrix.log` | 4689 / `bd9d6dc1b1c40a7a59d6cff52f657e0325b7bf2d35e1d8d01d8df67eff5eae1f` |

Machine receipt 记录 raw fixture 身份、所有执行输入、两个 child 的 closed process status/argv/env、same-run outputs/MD 和 mixed outputs 的 sizes/hashes、complete guards/validators/registries、79个IDs/checks、review packets。Full raw/source results 只留外部 Temp，不提交。

Wrapper 初版 summary regex 预期 TAP，但 Node 实际输出 spec reporter，于是第一份 receipt 的 summary 字段为 null。原 wrapper/receipt/log 保留；`assemble-focused.mjs` 只读取同一 closed log 修正 summary，没有重跑或改 reporter。Commit 成功后的 trailing PowerShell 未引号 `HEAD^{tree}` 查询被 shell 错展开；树 SHA 随后通过 argv 数组正确只读查询，原 command 输出保留。两项均不是 parser/test 失败。

## 原 focused 阶段解除条件（历史记录）

Root 必须让不同作者审查精确最终 head：最小 collector、source-derived whole-factor/full-context oracle、79-case complete registry、zero-network/lifecycle/inputs/guard receipts、native fixture quiet、继承 Nature families 和安全边界。独立 review 前不运行 broader/full/build/golden、不创建 delivery PR。随后这些检查、fresh三平台 CI/Secrets 和 root 十项门槛全满足才可处理唯一 `Refs #72` delivery PR。Merged Main 成功与既有 automation 完成合同之后，C 从原 frozen B FRB oracle 执行受影响 delta，并继续保留 #75 必需 numeric roles 的真实失败。

本次无 canonical/spec/PRD/EDD/security semantic change 提案。原 source103、旧67/41/17 preflight、历史 clips/A sanitizer/原projection全部复用，新增 runtime 仅94个当前必需 focused cases（实际 six clips，其中三次 synthetic）。

## 闭合 broader 与 publication 交接

独立 reviewer 对 clean `cc2178f420a370db00a6bb8bf8e7a118cbe013f6` / tree `581db1d21cd1143971c866d48b84d294a0c57b3f` 报告 **IMPLEMENTATION_CLEAR / blockingFindings=0 / P0–P3 全零**。Human packet 5712 bytes / SHA-256 `15f42dc3b9f97b3e828e2ce43c2213793d4bd466b8a72d2a62d8f9c6cd6d7154`；machine packet 40864 / `b02c405494c6e5fe5e54601ac382c80f0b2a5241fb99be3aede53daa7b95bc4f`；均在 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue72-implementation-review-cc2178-recovery/`。复用既有 source103、plan 与 focused94 审查，没有新 reviewer runtime。

以下原进程均已关闭且 exit0。没有因为后续 goal 恢复而重启原 full handle；当前 publication 只读核对同一 closed artifacts。所有 273 个 tracked runtime/source/lockfile/golden 输入与 full receipt 的 bytes/SHA-256 精确匹配，mismatch=[]；四次原执行均 inputBytesUnchanged=true、changedInputs=[]、trackedStatus clean。

| 原 command | UTC start → finish | 闭合结果 | receipt SHA-256 |
| --- | --- | --- | --- |
| `node --test --test-reporter=tap（34 个显式文件，完整 argv 见 machine receipt）` | 2026-10-08T12:41:54.401Z → 2026-10-08T12:42:08.239Z | 831/831 PASS；13782.7969ms；skip/cancel/todo/fail=0 | `c3b5d52f4564786f28a18851e89eb42c9dbef0beeebc4fb9ea2afa1512c2d99e` |
| `npm test` | 2026-10-08T12:42:08.366Z → 2026-10-08T12:43:45.003Z | 1118/1118 PASS；96368.7189ms；skip/cancel/todo/fail=0 | `29a70aabf8db20c75563ce208eeb1086e27fbf8314934e492934742ac029e949` |
| `npm run build` | 2026-10-08T12:43:45.114Z → 2026-10-08T12:43:45.355Z | exit0 | `e341548a715acd78b8cd4eecb71eab037d3a23f56db2760544313b63e0f40694` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | 2026-10-08T12:43:45.459Z → 2026-10-08T12:43:45.732Z | exit0 | `1863a9495f9d2685a2592745e3620d37c92f6a290ebb6a79049495971540126e` |

原 affected 的完整 command/argv、所有 log bytes/hash、process timings 与输入身份由 [machine receipt](bug-frb-fractional-units-production-receipt.json) 的 `closedBroaderVerification` 保留；external directory 为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue72-broader-2dcaaf9/`。Full log 130449 bytes / `3d168a4eb7796d6f65b5213304ff5dd3cf671f264984bb17ee6fe460a0c39a6d`。Golden 全四 validators valid，scientificFragments.valid=true、issues=[]；完整已提交 golden 与源码输入保持原 bytes。

Full 再次执行 source harness 的同次 ledger：attempts=[]；真实三方言 clips=3、observed windows 3 opened/3 closed、source DOM 1 opened/1 closed、11 fetch/callback/promise DNS methods 与10 DOM bindings 恢复。其 writer 证据是既有 static call graph，不虚称动态 writer spy。Focused matrix 的73 parses/3 synthetic clips/闭合 windows 与 guards 原记录继续保留，不能把 focused guard冒充 broader全部测试的全局网络拦截。

Local 闭合测试使用既有 read-only dependency junction，没有新 npm ci/install。Publication recovery 时 junction 仍指向 `C:/Users/guoli/.codex/worktrees/3417/academic-clipper/node_modules`，但目标现已不可用；未修复或探测依赖。原相同源码/lockfile上的 closed GREEN 继续作为历史证据，当前环境不声称可重跑；fresh CI 的三个 jobs 必须各执行现有 workflow 的 `npm ci`、tests、build、golden。

当前新增仅两份 production handoff/receipt 文档。既有 `cc2178f` focused packaging 后的 publication docs-only commit 从 git log 获取，避免 self-reference。Root 接收唯一 standalone `Refs #72` 前置 bug PR 后须完成 final publication review、fresh CI/Secrets、精确 head 未变检查及其余十项 gate；本 author 不 merge、watch、close Issue 或声明 #10 完成。Merged Main 成功且 automation完成 #72 后，C 执行原 B FRB affected delta；独立 #75 numeric powers仍须完成，不能把本单位修复替代完整 FRB acceptance。
