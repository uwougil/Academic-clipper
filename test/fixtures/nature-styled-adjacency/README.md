# Materials styled-adjacency 来源摘录

来源：[Scaling deep learning for materials discovery](https://www.nature.com/articles/s41586-023-06735-9)，DOI `10.1038/s41586-023-06735-9`。完整保留 Methods 原 paragraph 37（零起算）、必要原祖先、Methods / MLIPs headings、原 `Equ1`、未重编号的 References prefix 1–68，以及公开 article identity/date/全部六个有序作者 meta 与文章自身的原 rights notice。

相邻节点确实是 `128<i>x</i>0<i>e</i>` 等，没有上下标或乘号。本摘录不把它猜成指数，不改学术正文、样式或来源科学 DOM。C 的旧 `606a4dbc…` 是 frozen paragraph digest；raw pre-sanitize paragraph digest 是 `6be13b1e…`。完整 hashes、原 CC BY 4.0 notice/link、作者、来源/冻结/配方/选择块证据在同名 provenance JSON；source material 不随代码重新许可。

生成复用 B `b718fa8` 的既有匿名 acquisition，未重新联网；完整 raw capture 仅在 external temp。沿用 A 的 actual `nature-corpus-sanitizer/1.1.0`、`nature-corpus-subtree/1.0.0`、recipe `1.0.0` helper Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`。先核验原 Buffer，再 decode / DOM parse，调用相同 `sanitizeNatureHtml(sourceText, recipe)` 两次并对 frozen excerpt 再调用一次，核验 bytes 相同和幂等。原段落 source IDs、引用顺序及未选内容见 provenance；没有复制 A 基础设施到此 branch。

`node --test test/nature-styled-adjacency.test.mjs` 在未改生产代码的 accepted bases `6b90413` 与 `ac86b2f` 都是 5 PASS / 3 RED：原 display 只有一条，三方言连续 `$128x$$0e$` 被 math validator 读成两条且拒绝。#57 最小 DOM range 修复后 8/8 PASS，保留原有序字符/italic style/空白而恢复唯一 display。`failure-evidence.json` / `boundary-evidence.json` 是旧 base 的实际诊断记录，不是修复后必须复制的 snapshots；新的 permanent boundary tests 明确区分实际 source 与 disposable clone 中的 synthetic controls。

普通测试只用此 excerpt，无 network/table/figure resource、writer、raw capture 或 account state。`links` 中原 References item 2 的 literal `<` 有独立 HTML audit 失败，按原样保留并在交接记录，不能把 scoped bug 恢复声明成整个 corpus 成功。Synthetic adjacent opaque MathJax 的另一个 malformed state 仅作 typed identity 边界记录，不由本真实 styled-run 修复完成；原 validator 继续报告。

技术修改仅为完整块/原祖先选取、确定性 UTF-8 LF 序列化及 A 记录的属性 sanitization；不选其他正文、abstract、figures、tables、supplementary material、脚本或页面 UI，references 仅保留需要的完整前缀。HTML 的局部 Git attribute 保留有意义的原 whitespace；其余代码/文档的 whitespace checks 保持。原 source bytes、recipe 与 rights audit 在实现阶段不变；2026-10-07 在 root 确认 #53/#55/#56 的 accepted Main 后才更新 own 工作区并开始生产修复。
