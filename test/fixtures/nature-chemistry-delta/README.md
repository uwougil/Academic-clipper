# Chemistry Delta bond positions — Issue #73

真实来源：[Nature Communications article](https://www.nature.com/articles/s41467-023-44030-3)，原 Results paragraph4，C source block `a-section-2`。此完整段落的两个 `Δ<sup>12,13</sup>-alkene` 保留 comma-separated bond positions 与原 Δ attachment；不修改原化学值/普通 prose。独立范围不包括三处 trailing-group SUB、leading isotope 或 Quantum plain Greek SUB。

新57-block A recipe保留整个原段落、Results/h3 hierarchy、title/canonical/DOI/article JSON-LD、全部9 ordered creators、References完整1–36、原CC BY4.0 notice/footer。唯一 citation clusters 是 `[5]`、`[27,36]`；段落没有figure/equation/table/supp links，不为原 `see below` prose 编写target。Source rights未重新授权为代码许可证，适用original notice/link。

`s41467-023-44030-3.provenance.json` 记录 source raw bytes、原/frozen subtree hashes、原科学节点、两 role positions、完整recipe/retained blocks、transformations/omissions与A版本。Original helper Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`，sanitizer1.1、serializer/projection1.0；未复制基础设施。Fixture为UTF-8/LF57405 bytes，SHA-256 `50e7bd3c941c8b448e49357109c38d1842821ce4ef2d270580a3663c1ae27030`，repeat与再次sanitization幂等。

`diagnosis.json` 记录未改accepted-a5b6实现上实际三个方言的source→Nature→Defuddle→final阶段证据、两个真实orphan positions、全部validators、warnings、网络attempt ledger、输出hashes与scope。没有提交Markdown/full-result snapshot或完整raw response。

```powershell
node --test test/nature-chemistry-delta.test.mjs
```

实际baseline15 tests：6 PASS /9 true FAIL，1210.4358 ms，0 skip/cancel/todo。每个方言同次只clip一次。Math validator各报告恰好2个isolatedSuperscript；其他三个validators全部valid。两条exact warnings为`No Nature figures were detected.`和`No equation nodes were detected.`；figures/tables/DNS/HTTP均零。没有harness correction或额外clip。

`CHEMISTRY_DELTA_RECEIPT_ROOT` 指定外部同次results/Markdown/ledgers保存目录；`CHEMISTRY_DELTA_CACHE_ROOT` 为显式零新clip诊断模式，要求同一rawHtml/dialect。生产变更后验收必须清除cache变量，走默认完整真实生产链。Source复查只能证明输入来源，不能充当fresh pipeline通过证据。

不同作者57-blocksource audit、生产修复、affected/full/build/golden与fresh CI均待root安排。本SOURCEONLY branch仍RED，不声明#73或#10完成。
