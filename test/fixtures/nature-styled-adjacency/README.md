# Materials styled-adjacency 来源摘录

来源：[Scaling deep learning for materials discovery](https://www.nature.com/articles/s41586-023-06735-9)，DOI `10.1038/s41586-023-06735-9`。完整保留 Methods 原 paragraph 37（零起算）、必要原祖先、Methods / MLIPs headings、原 `Equ1`、未重编号的 References prefix 1–68，以及公开 article identity/date/全部六个有序作者 meta 与文章自身的原 rights notice。

相邻节点确实是 `128<i>x</i>0<i>e</i>` 等，没有上下标或乘号。本摘录不把它猜成指数，不改学术正文、样式或来源科学 DOM。C 的旧 `606a4dbc…` 是 frozen paragraph digest；raw pre-sanitize paragraph digest 是 `6be13b1e…`。完整 hashes、原 CC BY 4.0 notice/link、作者、来源/冻结/配方/选择块证据在同名 provenance JSON；source material 不随代码重新许可。

生成复用 B `b718fa8` 的既有匿名 acquisition，未重新联网；完整 raw capture 仅在 external temp。沿用 A 的 actual `nature-corpus-sanitizer/1.1.0`、`nature-corpus-subtree/1.0.0`、recipe `1.0.0` helper Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`。先核验原 Buffer，再 decode / DOM parse，调用相同 `sanitizeNatureHtml(sourceText, recipe)` 两次并对 frozen excerpt 再调用一次，核验 bytes 相同和幂等。原段落 source IDs、引用顺序及未选内容见 provenance；没有复制 A 基础设施到此 branch。

`node --test test/nature-styled-adjacency.test.mjs` 是 source-only RED checkpoint。普通测试只用此 excerpt，无 network/table/figure resource、writer、raw capture 或 account state。真实 display 只有一条；当前三方言产生连续 `$128x$$0e$`，math validator 读出两条且拒绝。`links` 中原 References item 2 的 literal `<` 有独立 HTML audit 失败，按原样保留并在交接记录，不能把 scoped bug 恢复声明成整个 corpus 成功。

技术修改仅为完整块/原祖先选取、确定性 UTF-8 LF 序列化及 A 记录的属性 sanitization；不选其他正文、abstract、figures、tables、supplementary material、脚本或页面 UI，references 仅保留需要的完整前缀。HTML 的局部 Git attribute 保留有意义的原 whitespace；其余代码/文档的 whitespace checks 保持。生产实现等待 orchestrator 明确释放共享 Nature 文件后才开始。
