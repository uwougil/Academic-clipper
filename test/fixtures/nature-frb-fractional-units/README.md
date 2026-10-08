# FRB signed fractional unit powers — Issue #72

真实来源是 `https://www.nature.com/articles/s41586-022-04755-5`。此摘录保留原 Methods paragraphs 50、51（零起算）两个完整段落，保护 8+4 个原 `pc<sup>−2/3</sup>` / `km<sup>−1/3</sup>`。完整 title/canonical/DOI/article JSON-LD、35 ordered creators、Methods/h3/h4 hierarchy、正文指向的 Equ8、完整 References prefix 1–52、原 CC BY 4.0 notice 与 site footer 同时保留。

`s41586-022-04755-5.provenance.json` 给出 untouched raw byte hash、103-block recipe、原 subtree hashes、确定性 sanitizer/subtree/projection 版本、完整科学节点与 12 个 factor roles。唯一 A helper blob 是 `e56f140d9756bb83013b9df0716dc650e04d7917`（sanitizer `1.1.0`）；此任务复用其接口，没有复制 sanitizer。Fixture 是 UTF-8/LF 80,065 bytes，SHA-256 `9196756aa9c59254f6b310a59f6218853a6eece7025c4eac926aed21df7b16be`。Repeat 与再次 sanitization 幂等。完整 raw response 与 image/PDF binaries 不提交。

原 source-selector 通过唯一 citation node 与 adjacent full paragraph 定位；此 selector 在 raw 与 excerpt 都稳定，未靠删除 citation、上下标或段落改造输入。未选 Methods p22 的两处 parenthesized numeric powers，属于另一独立缺陷。

`diagnosis.json` 记录原三个方言同次真实 output 的 hash、12 个实际 orphan positions、全部 validators、exact warnings、attempted-network ledger、生产 source blob identities 与混合失败分类。没有提交完整 Markdown/result snapshot；source-backed oracle 来自 original DOM，非当前输出。

永久回归命令：

```powershell
node --test test/nature-frb-fractional-units.test.mjs
```

默认走真实 `clipNature()` 完整生产链，每个方言同次只调用一次。`FRB_FRACTIONAL_RECEIPT_ROOT` 可指定外部结果目录；保存同次 full results/Markdown/attempt ledger。`FRB_FRACTIONAL_CACHE_ROOT` 是明确的零新 clip 诊断模式，必须匹配完整 `rawHtml` 与 dialect，不是新生产通过证据。生产源码变动后的验收必须移除 cache 环境变量并运行默认路径。

本 source-only 提交仍然 RED。Initial 15 tests 3 PASS /12 FAIL 中，6 是真实 fraction semantic/strict-validator failures，6 是测试对 source `≳10²`、semantic field/既有 equation identifiers 与 warning 的错误假设。保留初始完整记录，按源与 renderer contract 修正后仅复用原三个 results：15 tests 9 PASS /6 true FAIL，零新 clip。输入与 12-role oracle 未变。每方言 math validator 恰好报告12 isolatedSuperscript，raw HTML/structure/crossrefs 三 validators 全 PASS；唯一 warning `No Nature figures were detected.`；figures/tables/DNS/HTTP 全零。

独立 source audit 和生产修复均待 orchestrator 安排；本提交不称 #72 或 #10 完成。保留物适用原 article notice 及其链接的 CC BY 4.0，未改为 repository code license。
