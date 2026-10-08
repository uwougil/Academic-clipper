# Issue #74 — 原括号化学分组下标 SOURCE_ONLY_RED

此 excerpt 源自 [真实 Nature Communications article](https://www.nature.com/articles/s41467-023-44030-3)，不是手工编写 scholarly HTML。仅冻结三个缺陷角色：Results p2 `Pb(OAc)<sub>4</sub>`、Results p5 `Fe<sub>2</sub>(ox)<sub>3</sub>`、Methods p0 `(CD<sub>3</sub>)<sub>2</sub>CO`；段落位置均零起算。外层 count 属于完整原括号分组，保留内层 Fe2/CD3、前后化学式和 measurement；大小写 OAc/ox 不互换。

Base accepted main `a5b6acc2984af5cb8b82106291e963f4f413f5ac` 的生产实现未改。65-block projection 由原 Agent A helper Git blob `e56f140d9756bb83013b9df0716dc650e04d7917` 的 `sanitizeNatureHtml()` 产生：sanitizer `nature-corpus-sanitizer/1.1.0`，serializer `nature-corpus-subtree/1.0.0`，recipe/projection/schema 1.0。完整 recipe、raw/subtree/fixture hashes、projection signatures、transformations 与 source oracle 在 provenance；repeat/idempotence bytes equal。

原 raw body 460171 bytes，SHA-256 `a02d82acb4cdbde085e07ca0c276383894e7a7832c6830ad7a212f450926d88d`。Excerpt 72722 bytes，SHA-256 `a8c10a9e583c640a3adb41cf7a55f3c1a4d1a7f7b8f88b7d370afaa969c8079b`，UTF-8 无 BOM/LF，位于 article 256 KiB cap 内。保留3完整原段落、original ancestors/headings、全部9 ordered creators、canonical/title/DOI/article JSON-LD、References 完整 prefix 1–37、Fig2/3 target/full captions、MOESM1 原 PDF-link item、原 CC BY4.0 notice/footer。Fig3 是 Fig2 caption 的真实链接依赖；不删除困难 context 缩小 fixture。

`node --test test/nature-chemical-group-index.test.mjs` 默认 fresh production chain，每方言一 clip。最初3实际 clips 保存外部缓存；原测试标题和粗体 source locator 的 presentation 错误已保留并仅用缓存校正。最终18 tests：6 PASS/12 FAIL，exit1。真实 RED 为三角色×三方言9项加 strict math validator3项。每方言恰好3 isolatedSubscript；其他三 validators valid，warning 精确 `No equation nodes were detected.`。普通内层 chemical counts、NMR isotope/value、citation/resource 与 synthetic compatibility PASS。`diagnosis.json` 列 exact commands/results、source/output positions、生产 blobs 和各缓存 sizes/hashes。

`CHEMICAL_GROUP_CACHE_ROOT` 仅供有身份核验的诊断复核；不能替代修复 gate 的 fresh production execution。`CHEMICAL_GROUP_RECEIPT_ROOT` 可将同次 result/Markdown/ledger 写入显式外部目录。Guards 记录尝试后 throw，最终 assert 使 fallback 吞错仍失败，并恢复原 fetch/DNS bindings。Writer 证据是 `clipNature` static callgraph，没有声称 runtime writer spy。

完整原始 captures、images、PDF binaries 及临时结果均不在 Git。源 material 的许可证由原 article notice/CC BY4.0 决定，不重新授权为 repository code license。其他正文、References 37 后内容、未链接资源/UI/session/executable/tracking 为明确 omissions。此 fixture 不接纳另一篇文章，不复用 PR #13，也不修改 B corpus。

不同作者对本新65-block projection 的独立来源审核仍待完成。SOURCE_ONLY_RED branch 不可直接合并；future minimal implementation、affected/full tests、build、golden、fresh CI/Secrets 与 independent review 属于后续 gate。#61 isotope、#64 Greek SUB、#73 Δ SUP、FRB powers 和 Alpha qualifier 为独立 Work Contracts。详细消费者条件见 [handoff](../../../docs/goals/issue-10/bug-chemical-group-index-handoff.md)；Issue #10 未完成。
