# Issue #75 — 括号数值平方 preproduction plan

状态：PREPRODUCTION_RED；新边界矩阵完整运行一次，生产代码未改，different-owner plan review 待执行。SOURCE_CLEAR_ONLY 已成立且复用，不重新读取 raw、执行 A sanitizer 或重跑原文章三方言。生产实现必须等待 #74 accepted Main CI 与 orchestrator 的串行 owner 释放。

## Work Contract 与固定输入

[Issue #75](https://github.com/uwougil/Academic-clipper/issues/75) 是独立 implementation bug，PRD §3/§6、EDD §2.3–2.5、canonical §5–7 要求保留原上下标 attachment；没有历史引入点证据。新测试是明确 synthetic 的 DOM 控制，不是学术来源、文章 admission 或新的 source oracle。

- Own branch：codex/issue-10-bug-parenthesized-power；worktree：C:/Users/guoli/.codex/worktrees/issue-10-bug-parenthesized-power/academic-clipper。
- 原 ordered source commit：76e7bfa24217a962a0ba13753e7e2111575b57c4 → eede55ac7136467510b04507729217b15ca9224c。
- 新矩阵运行的 accepted implementation：36c93ca81236705912c25db391d611ee28405dca。由 root 已验 Main 37749675660 与 Secrets 37749675621 同 SHA success；本任务没有重新轮询 CI，也没有接纳 PR #79 未合入的 head。
- Source fixture 25549 bytes / SHA f672ec55261b61376bb1b0a82889e05b45deec9123442dccabab9829ebcd45de；provenance 31939 / SHA 8ed315749e0dcf860053b1bbdbe73ef910b1480415a3ba49ea1c86a4e5b9b4e3。
- 原完整 Methods p22 subtree SHA 4fe682650c4c464c1d6341c364241d29e154f18ecf7c8565de908b840c9a6fe5，SUP0/1 的平方基底分别为 (5/60)、(0.19/60/60)。π 与 /8 在平方之外。原 10⁻⁶、四 S source/offset、全部 measurements、35 creators、H2/H3/H4、rights、真实 zero citation/resource 合同保持。

## 已完成且不重复的来源 gate

不同作者 `/root/chemical_group_independent_resume` 对新48-block projection 的 SOURCE_CLEAR_ONLY：C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue75-independent-source-review/source-review.md，10222 bytes / SHA 475d75d87e4206fdf32ddfa21f11e9edf09c6f1128748c012740dc288e8f42da；machine source-review.json，71582 / SHA beacb248ab51381645fc47dd680dcfe8698a3b3e7ad278414fd8ee5ad93864e8。全部原 selectors、prehash、blocks/digests/ancestors、35 creators/identity/rights、A exact helper/recipe 的 regeneration/repeat/idempotence 已完成。后来缓存尾段只修正 exponent 后 presentation whitespace 的 reviewer locator，保留原 audit exit1 与 prefix checkpoint；source gate 不重做。

原 source 15 tests：6 PASS / 9 true parser FAIL / 0 harness，1046.1507 ms；三方言实际 clips 各一次，全部四 validators 执行，math 各两 isolatedSuperscript，其他三 validators valid。它们属于原 f4a5 baseline，不能声称已在36c重跑。完整 source 证据仍见原 handoff，本次没有修改任何 fixture、recipe、expectation 或科学内容。

## 最小实施边界

应在 Nature adapter 现有 `replaceScientificRuns()` 的 private DOM collector 链增加一个 bounded role，继续返回既有 `{start, end, tex}`，复用 `replaceRangeWithScientificMarker()`、原 marker/normalizer/renderer/validators，不另建 parser 或全局 Markdown 括号 rewrite。Range 从完整数值开括号到其原紧邻 plain SUP 的末尾，显式 tex 是完整 `(numeric-fraction)^{2}`；π、/8、typed citations 保留在 range 外。

有限资格：

1. immediate previous sibling 必须是单个 text node，结尾是完整、单层数值括号，无内部空白或跨 wrapper 拼接。分式只含一或两个 `/`；分子是无符号十进制整数或普通小数，分母是正整数。源支持整数分子与小数分子、单 slash 与双 slash；synthetic 改变数值防止 article/digit hardcode。零分子是同一数值 grammar；零分母、signed/decimal denominator、加法、第三 slash、嵌套或缺失括号均拒绝。
2. 唯一 plain SUP 只有一个 text child，值严格为 2。拒绝不同指数、script wrapper、linked citation exponent、additional SUP/SUB、SUP 前的空格或 comment。不能把 exponent 从 ^{2} 放大成 ^{2/8} 或只平方末尾60。
3. 左边允许 text 内的已知词法边界；原立即前置 π 是独立乘因子，留在 text 中。不能以 π 绕过前面的 Unicode letter/number/mark/underscore。开括号恰在 text offset0 而前面存在未知 sibling/comment 时拒绝，不跨节点猜边界。
4. 右边只接受明确独立的 text boundary/end 或已识别的 typed citation。原 slash-divisor text `/8` 必须在 atom 外，synthetic `/3` 同样是外部除数。未知 element/comment/empty wrapper 不跳过；Unicode L/N/M/_ 及 supplementary-plane letter/number 的即时相邻 token continuation 拒绝。紧邻科学 SUP/SUB 不能默认为另一独立角色。
5. pre/code、MathML ancestor、MathJax/equation parent，以及跨 siblings 的 `$`、backtick、tilde-fence literal cues 保持 opaque。既有 MathJax typed identity 和 citation registry 保持；不从 scholarly prose、article ID 或 output 反推资格。

该 grammar 是保守 source-shaped family，不承诺任意括号表达式、算术求值或一般 exponent。只需 DOM qualification 与 exact range 的小函数；未知输入保持既有路径和严格 validators。正确性需要扩大这个有限 grammar 时先向 root 提供真实证据，不能隐式变更 canonical/PRD/EDD。

## 稳定矩阵与实际一次结果

新增 test/nature-parenthesized-power-preproduction.test.mjs；命令 `node --test test/nature-parenthesized-power-preproduction.test.mjs`。Windows / Node v24.14.1，2026-10-08T10:38:24.5342841Z → 10:38:25.5218610Z，实际 exit1，50 tests、42 PASS、8 CONTRACT_RED、0 HARNESS_ERROR、0 skipped/cancelled/todo，931.9007 ms。

- 七 positives：两 source-shaped π/base/SUP2/divisor、改变数字的 integer/decimal families、zero numerator、ordinary prose separation、independent typed citation。全部 RED 只因完整新 role 缺失。
- 三十九 exclusions：有限 grammar、未知 sibling/comment/wrapper、复杂 script、opaque literal/code、linked citation exponent、Unicode L/N/M/_ 左/右（含 astral letter/number）、π 不能绕过词法边界。全部 PASS，完整 scientific registry 是空数组；typed citation 的原独立数字同时检查。
- 两独立 typed/opaque controls：真实 MathML integration point 的 p 和 math namespace/原 SUP 保留；MathJax 原 inlineMath marker/TeX/唯一 DOM owner。全部 PASS。
- 一个 mixed body/caption：完整期望数组八条，前四为继承 x₂、mS×cm⁻¹、10⁻⁶、q₁，后四为新 whole squares。实际前四完全相同，新四条未生成，因此 RED；不能过滤旧 records、只查某个 tex 或用最少数量通过。新 marker indices4–7、body/caption ownership、π/8 外部 text 与 ordered citations 是必要未来 GREEN checks。
- 一个纯字符串 whole-square oracle：接受 exact完整 `(5/60)^{2}` atom，允许原 `\\left/\\right` presentation，仅移除它们与 whitespace，保留全部 grouping braces。拒绝 orphan、只平方末尾、π 并入 atom、/8 进入 exponent/base、指数后追加数字、无组指数、重复 atoms。PASS，零额外 parse。

Mixed case 因首个 complete-array assertion RED，后续新 ownership/citation assertions 本次没有执行，不能据此声称其通过。保存同次 actual scientific/inline/citation arrays 和 cleanedHtml，使后续审查可检查既有前缀与独立引用；生产实现后必须真实执行全部 checks，不靠旧输出缓存宣称 GREEN。当前完整 50-case 矩阵只运行一次，没有 cache 模式或隐藏 skips。

## Snapshot、guards 与生命周期

外部 snapshot：C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-parenthesized-power/preflight-36c93ca。36个文件（34 src 与 package.json/package-lock.json）由 `git show 36c93ca:<path>` 的 Buffer 原样写入外部目录，并核对 snapshot bytes 和 Git object；不经过 PowerShell 展示行尾。外部 node_modules junction 仅只读复用 own checkout 已安装同 Git lock 的 dependencies，没有写入 node_modules 或任何其他 owner checkout。

初 setup 在所有 exact buffers 创建后比较 owner 的 physical CRLF package-lock 与 Git LF，产生 `Dependency lock differs`，在 parser/test 导入前停止。该设置错误不是 parser/test FAIL；没有重复 snapshot 创建。setup-tail.mjs 只核验现有36 files、确认 owner Git lock 等于 accepted Git lock，并独立记录 physical CRLF bytes/hash；后续首次且唯一执行50-case matrix。两个脚本均保留，machine receipt 保存这一区别。

fetch/dns.lookup/dnsPromises.lookup 的 record-before-throw hooks 在 lazy production import 前安装。实际 HTTP/DNS attempts=[]；49 synthetic parse calls / 49 explicit DOM window.close，clips=0、source/raw/A reads/audits=0。after 中 finally 恢复 exact network bindings、syncBuiltinESMExports 以及全部10 DOM global descriptors，两个 restoration flags 均 true。writer 不调用仅为 parseNaturePage 的静态路径证据，不虚称 runtime spy；没有全局整个 suite writer/network 覆盖声明。

## 交付和后续 gates

本提交仅新 test/plan/receipt 加 own handoff 文档尾段。src、source fixtures/diagnosis/test、canonical/PRD/EDD、validators/security/writer、dependencies、golden、CI/package 均未变。日志、原完整 outputs、snapshot 留外部，不提交 full captures 或 Markdown snapshots。receipt JSON 记录 exact artifact bytes/SHA、process terminal、original source review identity、snapshot identities、guard lifecycle 与明确未执行项。

1. 不同 owner 只审核此新 plan/matrix/receipt 与必要 existing typed seams，给出 PLAN_ONLY_CLEAR 或可执行 findings；不重做已 CLEAR 的48-block raw/A audit、原3 clips或本50 tests。
2. #74 landed accepted Main CI 后，root 释放一个 Nature owner；在同 branch 只接纳最新 accepted dependency，先 minimal production + 原 source3真实 clips/15和新增50全部 GREEN，再独立 stable implementation review。旧 f4a5 source及36c matrix receipt不能替代新生产执行。
3. 独立 review clear 后执行一次 required affected/full/build/read-onlygolden；fresh三平台PR CI/Secrets、immutable finalhead审查和 root十项 merge gates。Merge后 actual merged Main CI 成功才由 automation完成 #75。
4. C 在 accepted-main 后只增量解除 FRB 对应 parenthesized-power blocker；全部FRB/Issue10的其他角色与最终联合检查仍需独立完成。

没有提出 spec change 或 human-only blocker。此 preproduction packet 不是 #75 修复完成，也不是 Issue #10 完成。

## P2 source oracle 尾修：完整表达式与真实 source assertions 共用

不同作者对41d47b6的plan review发现 P2-75-source-oracle-unwired：原 attachedRole 用 substring inclusion，可能放过 `π$(5/60)^{2}2$/8` 或同一atom内重复base；新 strict helper当时只在独立纯字符串test使用。此前50-case报告保留为历史结果；其旧独立helper PASS不能代表真实三方言source完成。

尾修仅TEST-ONLY：test/support/parenthesized-power-oracle.mjs 导出 completeParenthesizedSquare/completeOrderedParenthesizedSquares。实际 source test 的 attachedRole 直接调用 ordered helper，要求两 originalroles都完整唯一、原顺序且不重叠。每role所有精确base候选（包括malformed companion）都计数，不过滤仅“看起来合法”的atoms。已知完整 math forms 是 optional原π/`\pi` + whole base + exact `^{2}`（或 whole Unicode²）+ optional外部 `/8`；缺少的π或/8必须在邻接plain context补齐，保持全部exponent/base grouping。仅允许 `\left(`/`\right)` 与presentation whitespace，不删除大括号、不解析一般TeX。Unicode²候选也要完整、唯一、边界明确；Unicode L/N/M/_（含astral）不能继续π前或/8后的token。

“π 和 /8 在平方外”是**在 squared base外**，不强制它们在math delimiters外。原兼容合同已允许 `$\pi(5/60)^{2}/8$`，它与 `π$(5/60)^{2}$/8`、glyphπ同atom、knownpresentationleft/right、wholeUnicode²均等价。Preferred DOM collector 的小range仍只收完整base+SUP；source最终oracle接受这些完整等价表达，不把preferreddelimiter位置升级为canonical唯一形式。旧50文件的独立oracle已静态改为同一shared helper，并把合法glyphπ同atomcase改为positive；这项旧test改动未重跑，旧42PASS不能迁移到新input。

新增 test/nature-parenthesized-power-oracle.test.mjs 的**80个全新纯字符串checks**一次执行：`node --test test/nature-parenthesized-power-oracle.test.mjs`，80/80PASS、70.482ms、exit0、0skip/cancel/todo。两sourcebase各8合法完整表示、18错误完整/唯一/范围cases、12Unicode边界cases；另外4checks覆盖S_source/S_offset与10⁻⁶其他atoms存在时两roles仍按原序匹配、duplicatefirst不能替代missingsecond、单atom混入两roles拒绝、roles反序拒绝。没有import source suite，因此无原top-levelHTML/DOM/3clips。只有node assert/test和ownpurehelper imports；零parser/DOM/clip/raw/A/source/old50/old1pure/full/build/golden/CI执行，不虚称动态network/writer spy。

外部 tail root：C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-parenthesized-power/oracle-tail-41d47b6，保存实际oracle.log/process-receipt及currentinputhashes。Receipt新增 oracleTail 字段，原source/50-case记录与inputhashes明确为historical-before-tail，无改写原log/summary或伪称新sourceGREEN。Fixtures/provenance/diagnosis及其scientificoracle均未改；真实source test仅sharedimport和attachedRole body，其他assertions/normalizer/validators不变。

下一步不同作者只审核这个P2 delta；生产仍locked after74。未来正式实现时实际source15和currentfull50都必须全部GREEN，new80的已通过证据只在helper/input hash相同scope复用；不以该纯字符串尾修完成 #75 或 Issue10。
