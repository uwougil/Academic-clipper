# Issue #71 — qualified metric 合成边界预检与最小计划

状态：**PREFLIGHT_ONLY / 生产等待 root 释放**。本阶段只新增 test/doc；没有修改 `src/`、吸收 dependency commits、打开 PR 或修复真实 RED。分支仍为 `codex/issue-10-bug-alpha-qualifier`，工作目录为 `C:/Users/guoli/.codex/worktrees/issue-10-bug-alpha-qualifier/academic-clipper`，来源交接 head `c701894bac719ec8c5ae83d45c1d89ffa86cf240`。

## 契约与复用证据

已读 AGENTS、canonical spec、执行计划、PRD §3、EDD §2.3–2.5、[Issue #71](https://github.com/uwougil/Academic-clipper/issues/71)、[原来源交接](bug-alpha-qualifier-handoff.md)，采用 `fix-bug` 的 implementation-bug 诊断顺序。Issue 标题/正文及来源交接均明确 bug；本次 `gh issue view 71 --json number,title,body,issueType,state` 和 GraphQL `issueType{name}` 实际返回 `issueType:null`，因此不把旧文档的 type 声明当作当前 API 类型事实。没有重分类、改标签或修改契约。

来源 gate 已被独立 reviewer 清除；只读并核验其现存报告，不重新审核 raw/source58/A helper/sanitization/projection，也不重跑原 source clips或 cache tests。实际报告目录是 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue71-independent-source-review`：

| 复用证据 | bytes | SHA256 |
| --- | ---: | --- |
| `issue71-source-review.md` | 10990 | `f9fa3ff7230926b970b640b3968e8a5bc9d28ba51a5104d680a8cdfb5544eca6` |
| `source-audit.json` | 44213 | `927b68e5146c5f24ea27d9cfc2d468bfb27b0b411a4fd67352afec05a5de513b` |
| 原 Git excerpt | 24257 | `696660069bd881a163722fc020b22d0f6af5cc3387decacfd8c78789574ef634` |

Independent `SOURCE_PROJECTION_CLEAR_ONLY` 只清除来源/provenance/oracle gate。原 Main p2 四处 `r.m.s.d.<sub>95</sub>`、95% residue coverage、0.96/2.8/1.5/3.5 Å、34 creators、Fig1 panels/Nseq/Nres、MOESM1、rights及 prefix0 均沿用原合同。测量值与 Å 始终在 metric atom 外。原 source-only 11-test run 的六个真实科学 FAIL、三个 PDF harness FAIL 与后续 cache-only 四 PASS/519.0361ms/零 clips 的分类保持；12-test registry不是一次完整 GREEN。

## 新合成矩阵

`test/nature-alpha-qualifier-boundaries.test.mjs` 全部是标明 synthetic 的 DOM/prose 脚手架，不伪造论文 fixture，不计 admitted corpus coverage。每次检查完整有序 `scientificRuns`，允许整个限定指标的等价 `\mathrm`/`\text`/`\mathit` TeX base；不筛选预期 TeX来隐藏错误 run。

| 组 | test 数 | 要保护的边界 |
| --- | ---: | --- |
| 完整 base + 原 plain SUB95 | 4 | 段首、分离测量值、标点、原 NBSP；整个 literal metric 与 qualifier 同 atom |
| Unicode 左右词界 | 7 | L/N/M/underscore，含 astral L/N/M；每 test 两侧各一次，要求完整 Unicode prefix 判断 |
| 未证明 DOM/语义 | 8 | unknown/extended base、错95/幂、跨 sibling/comment、base/SUB wrappers、空 I、空白/嵌套/混合 attachment、额外 script |
| opaque context | 7 | code/pre、MathML integration-point 下真实 math ancestor、equation、MathJax、跨 span 的 literal dollar/backtick/tilde fence |
| typed citations | 1 | 两个既有 citation anchor cues，各原有编号与 qualified metric 分离 |
| shared body/caption registry | 1 | 先有 `Nres` role，让后续 metric marker 非零，精确 run 顺序、marker identity/次数、body/caption 邻文 |

空 I + SUB 是既有 styled collector 的 `_{95}`（标准化比较 `_95`），负例明确冻结此 inherited role，不能把它当新增 qualified metric。其余负例全部要求完整 `scientificRuns=[]`。MathJax 同时保留原 `inlineMath.tex`；MathML control 断言真实 `math mtext p` ancestor，避免 HTML parser breakout 造成假 PASS。

`before` hook 在 dynamic import/任何 parse 前安装 record-before-throw `fetch`、DNS callback 与 promises guards并 `syncBuiltinESMExports()`；没有 top-level parse/clip。独立 `after` hook 检查 attempted-call ledger 与 opened/closed DOM 计数，即使 case 已失败仍执行；`finally` 恢复原函数 identity并再次同步 named exports。每个返回 DOM 在 `withPage` 的 finally关闭。只调用 `parseNaturePage`，没有 writer、下载资源、table hydration或 fake writer spy。

## 实际 accepted-baseline 运行

Root 提供的 accepted main 为 `134ba67a9eefe8763314454183a625f83a34837b`（其 Main/Secrets接纳由 root 管理）。本 source 分支没有 merge/adopt/rebase：只用 `git show <SHA>:<path>` 原 bytes在**自身 ignored** `node_modules/.issue71-preflight-accepted134/src` 快照中导入 Nature 与三个直接依赖。未使用 pending #67 implementation。

| accepted Git src blob | bytes | SHA256 |
| --- | ---: | --- |
| `src/adapters/nature.mjs` | 50461 | `6b3cfc9c69813b20bd20f71633dc18e52e3abcac959d366cc2841bf41fa373e8` |
| `src/normalizers/markers.mjs` | 128 | `929109d61e08ab4cc866f925b8af08444f3e8a2893d96d4b9d219a9e5890d78f` |
| `src/version.mjs` | 161 | `380c1c8d3ce15a0c2039949b7153fc4eb11fafc1653476527adbf1f67dcdaa4e` |
| `src/security.mjs` | 6909 | `a02c3bba53802f90a8b769d05e5696ff474486878f5fa9c8f7d9e9289b6c188d` |

Node `v24.14.1`，executable `C:/nvm4w/nodejs/node.exe`。唯一新矩阵运行的 wrapper command：

```text
node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue71-preflight/run-accepted-synthetic.mjs
```

Wrapper 验证快照/复用报告 bytes 后，以 `NATURE_ALPHA_QUALIFIER_SRC_ROOT=<自身 ignored snapshot>/src` 执行实际 `node --test test/nature-alpha-qualifier-boundaries.test.mjs`。**exit1；28 tests /22 PASS /6 FAIL /0 skipped；834.1929ms**。新 test 输入7018 bytes/SHA `7d18f5a313915d35d39813a4bd57616743a2ef3e2e82fa0b2031afd0cb6a55c2`。实际 stdout/stderr 保存外部 `accepted134-synthetic.log`，SHA `342d32681f0248010035d00adcbaa8d09cfd0cb85301f137fcf5ebb3d3c48bb1`；完整 command/env/runtime/src/input hashes见同目录 `accepted134-receipt.json`。

六个 FAIL 均在完整 scientificRuns 断言证明 missing qualified metric：四正例/typed-citation case得到 `[]`；body/caption case仅已有 `N_{res}`。没有 harness failure、after-hook failure或 undeclared HTTP/DNS attempt；全部 returned DOM 关闭，函数 identity恢复。22 个边界/opaque controls PASS。

限制：typed-citation 的后续 citation-number 断言、body/caption 的后续 marker/order/multiplicity/measurement assertions，因第一条真实 RED 尚未到达，**尚未 runtime证明**；修复后必检。真实 source58 clips、source/cache checks、full/build/golden/npmci、其他 owner suites及 PR/CI本轮未运行，因仅新 synthetic preflight且未授权生产阶段。不将新矩阵与原 source registry加总成一轮测试结果。

## 最小生产计划（尚未实施）

1. 等 root 放行同分支生产阶段；#67 是现时唯一 Nature production owner，#68 必须在 #67 后，不自行夺锁或吸收未接纳提交。届时由授权 owner根据 latest accepted main选择已接纳依赖，另一个 owner独立 review此计划。
2. 在现有 Nature collector 中只识别原 DOM 的完整 literal `r.m.s.d.` 与紧邻单个 plain-text SUB95。左界对 text prefix作 end-anchored whole-prefix Unicode L/N/M/_判断；offset0 且存在未知 prior sibling/comment拒绝。右界阻断未知连续字/identifier、额外 scientific script及 wrapper；两种已经 typed的 citation SUP保持原角色。原 source空白/测量值不进入 range。opaque ancestors与 parent整体 literal数学/code cues提前拒绝。
3. 复用现有 range/semantic scientific-run/marker流程及已接纳 `range.tex` seam（需要时给整个 literal metric `\mathrm{r.m.s.d.}_{95}`）；不改变通用 `scientificTex` 语义，不 generic all-SUB/plainword guessing、不按articleID、不全局 Markdown repair、不改 normalizers/validators/spec/PRD/EDD。保持已有 collectors的原角色和 marker顺序。
4. 生产变化后才执行必要的 focused RED→GREEN、真实 source regression、affected/full/build/read-only golden及 exact immutable-head独立 implementation review/三平台 CI/Secrets。补证明此前被第一断言阻断的 citation/marker assertions，验证未知指标/代码/math/既有 units等边界。一个最终独立 bug PR使用 standalone `Refs #71`；merge只接纳代码，successful merged-main CI才完成 Work Contract。此 preflight packet不能 merge，也不解除 C 的真实四role GREEN条件。

Spec/意图修订提案：无。当前等待的是既有 orchestration 的生产释放，不是人工授权问题；本 owner没有自行开始生产。提交前检查 `git diff --check`、`git status --short`、tracked filenames与仅 test/doc diff；commit/push后的 immutable SHA与 clean状态由最终交接报告。
