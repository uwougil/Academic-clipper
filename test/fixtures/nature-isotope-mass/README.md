# Leading isotope mass — source-only coverage

来源：[C5 methylation confers accessibility, stability and selectivity to picrotoxinin](https://www.nature.com/articles/s41467-023-44030-3)，DOI `10.1038/s41467-023-44030-3` / Nature Communications。源材料保留原 CC BY4 notice、全部九位有序作者、source URL、原 license link 与技术变化记录；不按 repository code license 重新许可。

原 `s41467-023-44030-3.excerpt.html` / provenance / `accepted-b886-diagnosis.json` 与 `test/nature-isotope-mass.test.mjs` 是 #61 九角色的原 source RED，保持 byte-for-byte 不变。它们只证明 Results p0 两个 ³H、Figure5 caption 一个 ³H、Methods p0 六个 ¹H/¹³C，并不证明整篇所有 leading masses 已覆盖。

2026-10-07 的 coverage extension 使用同 untouched raw / actual A helper。新增 `s41467-023-44030-3.all-leading-masses.excerpt.html` 是最终 **15 角色**投影，83245 bytes / SHA-256 `ca8665672f96c5590bb0767cab0448f60305f3b916b8e743e478766975a3ea81`。新 provenance 记录83个原 retained-block prehash、全部 source positions、科学节点、有序 creator/原 rights、recipe `733e4d843d613e887f2184b1cef439c2c7687ff71ae8d3d61d0e7fa570e7677d`、transformations/omissions 与实际 repeat/idempotence。

原 semantic blocks 为 Results p0/p5/p6/p20、完整 Figure3(p7) / Figure5(p15) wrapper/caption、Methods p0；索引按 raw `section[data-title] querySelectorAll('p')` 零起算。新增六个角色是 p5 两个 ¹⁹F、p6 一个 ¹H、Figure3 caption 一个 ¹H、p20 两个 ³H。保留原 Sec2/3/5/6/8 heading context、原 ancestors 和最高实际 citation 所需 References prefix1–43。未选择的 Figure2 原 href/text 不改，沿用既有 production retained-target 外链降级；没有补写或伪造 heading/figure。

`all-leading-masses-coverage.json` 是实际来源 role matrix 与 accepted3889 RED receipt，不是修复后的 output snapshot。15 = C ac86 的11个 isolated leading mass +4个不在 validator16内的错误 measurement powers。原 raw26个非citation SUP 逐项检查，11个其它 SUP（含两个 Δ¹²,¹³ bond labels、Å³、数值幂）明确排除。原完整 paragraphs 同时保留 Fe₂(ox)₃ 和 (CD₃)₂CO 的独立 trailing-group failures，不能把它们删掉或称 whole chemistry PASS。

`node --test test/nature-isotope-mass-coverage.test.mjs` 在 untouched accepted3889 production 上一轮执行25项：1PASS/24真实RED，zero skip/todo/cancel。只三次新 projection clips；显式 `NATURE_ISOTOPE_RECEIPT_ROOT` 可保存该同轮 whole result/Markdown/stages 到调用者指定外部目录，默认 tests 零写入。原九角色的22个 synthetic compatibility controls不改、不当真实 source admission。

此目录没有生产实现、full captures、image binaries、credential、第二 parser 或 live acquisition。#61 仍 source-only，Nature gate锁定；独立 reviewer 要审的是本最终 all15 recipe，不必重复旧九角色审计。完整命令、历史/source hashes、RED与消费者解除条件见 `docs/goals/issue-10/bug-isotope-mass-handoff.md`。
