# Issue #74 — chemical group attachment 的 preproduction plan

状态：`SOURCE_CLEAR_ONLY / BASELINE_ONLY_PLAN_REVIEW_PENDING`。来源已独立通过；本计划没有生产实现，不能把 synthetic baseline 的 negative PASS 当作修复后的保证。Root 仍按 #68 → #71 → #72 → #73 的顺序持有 production gate；本分支等待 different-owner plan review 和 root 的后续释放。

Work Contract：[Issue #74](https://github.com/uwougil/Academic-clipper/issues/74)。遵守 PRD §3 的原上下标/语义保留、EDD §2.3–§2.5 的 Nature DOM → Defuddle → normalization/strict validators 边界及 canonical Issue #10 §4、§5、§7。源码、源 excerpt、PRD/EDD、规范、B corpus、golden、dependencies/security/writer 均未改动。

## 复用的有效证据

来源 head `8ddd4f1b806b9a72e3552d75070f30b5c919ac29` 的 65-block projection 已取得不同作者的 `SOURCE_CLEAR_ONLY`，零 blocking source findings。完整契约和真实三方言 RED 见 [原 handoff](../goals/issue-10/bug-chemical-group-index-handoff.md)；外部审核报告及 machine bytes/hash 见 [本次 receipt](../goals/issue-10/bug-chemical-group-preproduction-receipt.json)。本次不重读 raw/source HTML、不调用 A sanitizer、不重新投影、不重审65块、不重剪真实三方言或重跑原18测试。原6 PASS /12 true FAIL、776.1531 ms 与原失败日志保持。

三个完整原式是 `Pb(OAc)<sub>4</sub>`、`Fe<sub>2</sub>(ox)<sub>3</sub>`、`(CD<sub>3</sub>)<sub>2</sub>CO`。需要把 outer SUB 留给完整括号分组，同时保留 outside Pb/Fe/CO、inner Fe2/CD3、源顺序/数量/字体角色。它们不是新 TeX 来源；计划中的 TeX 仅为忠实输出编码。禁止把缩写展开、修正文献值或推断 chemical identity。

## 最小私有 Nature 边界

建议只在 `src/adapters/nature.mjs` 的 existing scientific range pass 添加一个私有 `collectParenthesizedChemicalGroupRun(parent, startIndex)`；不导出公共 parser，不新增 module/dependency，不修改 Defuddle、normalizer、validator 或全局 Markdown。消费 `parseNaturePage()` 既有 DOM、`replaceRangeWithScientificMarker()` 的已接纳 `sourceTex` 参数；返回 existing `{start, end, tex}` 或 `null`。最终 implementation owner 必须按释放时 accepted main 检查这个实际接口，不能以本次 snapshot 代替届时 rebase。

以原 plain numeric SUB 节点为候选，只有它紧邻原 plain text 中的 closing `)` 才尝试识别完整 group。扫描同一 parent 的相邻 text/SUB siblings，寻找完整 formula 的 start/end，先验证再抽取；不能在失败时先改 DOM。范围包含可能的 element-led prefix、prefix 原 atom SUB、括号内所有原 atom SUB、整个 outer SUB 和紧邻的 element-led suffix。不要仅返回 `(ox)_{3}` 或 `)_{2}`，也不要提前把 Fe2/CD3 消费成另一个部分。

有限 structural family 为：一个 balanced、非嵌套圆括号 group；plain atom-like text 由 uppercase token 和可选 lowercase token 组成；native integer SUB 保留在其原 atom/group owner。元素名称不查表、不转换，不进行化学组成或价态解析。由 group 开头的式子必须有 atom-like group 内容；由元素开头的式子保留全 prefix。为容纳原 `Fe2(ox)3`，group 内还可保留长度1–2的 lowercase ligand identifier，但仅当它前面已有同 formula 的 element-led prefix 及直接原 native atom SUB。这是一项**待独立 plan review 的词法边界**；不能把任意括号 word 纳入，更不能采用 article/prose/整式 allowlist。若 reviewer 认为这一有限 family 仍没有足够可靠的结构证据，冻结该部分并向 root 解释边界；不能悄悄放宽为通用 chemical parser。

numeric SUB 必须是单个 plain text child、正整数、无 nested style/link/MathJax、无空白伪造。不接纳 SUP、fractional/decimal counts、charge、dot/hydrate、nested parentheses 或复杂 wrapper。拒绝不平衡、未知长 word、数字括号族（独立 #75）、script children、跨 span literal token。原 fixture 没有要求上述更广 family；这些 rejection 不宣称全文科学 parser completeness。

prefix/suffix 边界必须按 Unicode code point 检查 `\p{L}\p{N}\p{M}_`，包括 astral letter；不能只取一个 UTF-16 code unit。同一 token 不得从 `xPb` 或 suffix word 中截出似乎有效的 formula。邻接 typed citation 的 SUP/direct anchor 是 formula 的终点，citation 节点归原 citation pass；不能当 group count 或跨越它。原分隔空白/标点及前后 measurement 留在 range 外。

边界验证必须先于任何 DOM mutation。formula 的 direct Text offset0 左侧只允许 parent 起点，或同级 direct Text 中已经证明的空白/Unicode punctuation（排除 `_`）；不能把未知 element/comment/empty wrapper 的节点边缘当作 lexical edge，也不能跳过未知节点去找更远分隔符。右侧同样只允许 parent 终点、原 direct Text 中明确空白/Unicode punctuation（排除 `_`），或真正 typed 的独立 citation（既有 direct/SUP citation positive）。紧邻 element-led plain Text suffix 必须完整纳入 formula 后，再验证该 suffix 的终点。额外 SUB/SUP、untyped anchor、未知 span/comment/empty wrapper 都拒绝新增 group interpretation；不得通过 flattening 来证明边界。上述规则仅约束新 group collector，保留既有 typed scientific roles。

短 lowercase ligand 的资格必须同时满足 element-led 原 prefix 和该 prefix 的直接 native atom SUB。`Fe(ox)<sub>3</sub>`、`(ox)<sub>3</sub>`、`word<sub>2</sub>(ox)<sub>3</sub>`、`Fe<sub>2</sub>(word)<sub>3</sub>` 均不能生成新 group role；原已有 scientific roles 仍按完整 ordered registry 保持。

ancestor `pre, code, math, .mathjax-tex, .c-article-equation` 保持 opaque；literal `$`/backtick/fence 跨 siblings 时保守拒绝新增 attachment interpretation。原 MathJax/display typed role、scientific styled/Greek/unit/numeric collectors 不重写。新 collector 只消费成功验证的 native plain group，不与 styled collector抢 owner。真实 HTML-in-MathML integration-point 用 `.closest('math')` 原祖先证据拒绝；不能用 flattened synthetic HTML 代替。

renderer 保留原 roman atom/ligand 字体；括号保持数学 grouping，原 atom SUB 与 whole-group SUB 各有唯一 owner，prefix/suffix 不丢失、不重复。规范输出例如 `\mathrm{Pb}(\mathrm{OAc})_{4}`、`\mathrm{Fe}_{2}(\mathrm{ox})_{3}`、`(\mathrm{CD}_{3})_{2}\mathrm{CO}`。不添加 `\mathbf`、italic、Greek 或新的运算符。单个 source range 插入一个 existing scientific marker；使用统一 list 的实际非零 index，禁止另建局部 index0 或在caption 重置。

## 本次唯一新增 synthetic batch

[测试](../../test/nature-chemical-group-index-preproduction.test.mjs) 明确标为 synthetic；替换 integer count/atom-like token 只测试 structural grammar，不是新论文、来源 oracle 或科学组成声明。整个 batch 仅执行一次、仅走 actual `parseNaturePage()`，无需增加 synthetic clip。模块 imports/任何 parse 前安装 fetch、callback DNS、promise DNS 的 record-before-throw guards；独立 after hook 检查 ledger，finally恢复 exact bindings/原 DOM descriptors，关闭每个实际 API 返回的 `page.dom.window`。没有复制 #73 的 window setter，未模拟缺失的 DOM API。

运行基线为 accepted `36c93ca81236705912c25db391d611ee28405dca`，通过 `git show` child-process Buffer 写入本任务 external temp physical snapshot；36个 src/package files 逐字节与 Git 相等。Dependencies 仅通过 read-only junction 消费原既有安装；实际 resolved target在 receipt，未写入任何他人的 node_modules、未 install。测试文件复制也记录 exact bytes/hash。原 owned SOURCE branch 的旧 production 文件不作为新基线。

26 cases：7个 whole-formula positive；16个 unknown/numeric/unbalanced/wrapper/script/SUP/code/literal/citation-child/Unicode boundary exclusion；1个 real native MathML ancestor；1个 opaque MathJax；1个 mixed body/caption。每个断言比较**全部 ordered scientificRuns 的 marker+完整 TeX**，无过滤、minimum count 或仅 presence；每个 scientific marker要求唯一 DOM occurrence。mixed case含既有 styled、mS·cm^-1、numeric10^4、MathJax+native SUB，随后4个 group roles，其中 Pb式在body/caption重复，shared indices4–7；typed citations、实际 body/caption text 与 marker identity/multiplicity同列。严格保留所有2/3/4完整下标，不能用接受 `_{2}extra` 或 erasing group的 regex 放过缺损。

实际命令由 external `run-preflight.cjs` 记录为 Node argv、cwd与两项 child-only env；完整日志/observations保存在 receipt 所指外部路径。结果：exit1，26 tests，18 PASS /8 genuine contract RED /0 harness errors，844.8042 ms，零 skip/cancel/todo。7 positives 缺少全式 scientificRuns；mixed只保留既有 exact ordered4项，缺少全部4个 group roles。18 baseline passes包含所有 exclusions、原 MathML ancestor、typed MathJax；candidate状态全部为 `UNPROVEN_PRODUCTION_LOCKED`。

after ledger为 `[]`，26 actual returned windows全部关闭，exact bindings/descriptors复原；0新clips/0scholarly source reads/0source audits。后续只读同批 observations，独立核对 mixed原4-item prefix、inlineMath、两 citations、各实际marker唯一性，0新parse/test/clip。mixed candidate完整array失败后的exact body/caption index assertions尚未执行，receipt明确列为 blocked；不能从baseline推断其通过。原source counts/admission、旧3clips/18RED和85expectation契约均不变。

## 后续释放与 gate

### 独立审查增量（P2-1 / P2-2 / P2-3）

原 `56f45db` 的审查为 `PLAN_CHANGES_REQUIRED`，三个 P2 均属测试契约缺口，不是新 source 或 production failure。真实三方言的 attachment 断言改为共享 [test-only whole-formula oracle](../../test/helpers/chemical-group-output-oracle.mjs)。匹配完整 math atom 或完整 Unicode token，只移除明确 font/spacing presentation，保留所有 numeric braces、inner/outer counts、完整 Pb/Fe/CO prefix/suffix 和大小写；重复、split roles、多余 math 内容或 Unicode 数字/字母/mark 邻接均拒绝。原 `readable()` 仍只用于普通兼容性检查，不参与 group attachment 判定。

新增 [纯字符串 controls](../../test/chemical-group-output-oracle.test.mjs) 独立导入 helper，不导入原 source test/production/DOM；新增11个 parse-only negative controls覆盖 ligand 资格与未知同级边界，其中 left span case明确保留已存在的 `x_{2}`。完整 scientific array、marker顺序/唯一性仍逐字断言。`CHEMICAL_GROUP_SYNTHETIC_SCOPE=review-tail` 在任何 production import / case registration 前选择，只注册这11项；旧26项不注册、不运行、不跳过。默认 `all` 将是后续正式 candidate 的37个 synthetic cases，尚未执行；原18真实 tests也仅强化了未来的 oracle，不能将旧PASS转移到新字节。此次执行精确结果、脚本和输入身份见 [tail receipt](../goals/issue-10/bug-chemical-group-plan-tail-receipt.json) 与 handoff。

Different-owner reviewer先审核这个语法/范围/字体/typed boundaries及 synthetic oracle的独立性；root批准 plan并释放serialized production后，owner才基于届时 accepted main最小实现。若 source/helper/recipe/科学oracle未变，复用已完成sourceclear；不要重复65 source audit或 raw获取。实现后清除旧cache env，fresh跑真实三方言 regression和本synthetic matrix，完整all-run/mixed/citation assertions必须GREEN；任何新增 unsupported真实结构向root报告，不静默泛化。

随后按 Issue合同和root十项gate完成affected/full tests、build、只读Nature golden、三平台fresh CI、Secret scan、different-owner代码review、exact head稳定性。此前synthetic negative PASS不能替代candidate证明。本阶段无生产采用、full/build/golden/PR/CI/merge或新 scholarly acquisition；只读 GitHub Issue和authorized Git push属独立control-plane操作，不冒充guarded测试操作。一个最终 delivery PR用精确 standalone `Refs #74`。Merge只接纳代码；successful merged-main CI才完成Work Contract。Issue #10仍未完成。
