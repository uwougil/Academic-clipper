# Nature compound conductivity unit — source-only RED

来源：[Scaling deep learning for materials discovery](https://www.nature.com/articles/s41586-023-06735-9)，DOI `10.1038/s41586-023-06735-9` / Nature；独立 Work Contract [#67](https://github.com/uwougil/Academic-clipper/issues/67)。

这是有来源的受限 bug 投影，不能代替 B 的整篇 corpus admission。Untouched anonymous raw 506351 bytes / SHA256 `79f575e1941633c2dbd036682977ea6c274acd5c8c44fdb4648856a00a8d7cc6`。A actual sanitizer1.1.0 / recipe1.0.0、serializer/projection1.0.0；fixture86732 bytes / SHA256 `fbe6ad5fe6d53056277655422baf7e3c9fec5cac42c82473553df5cb6e9c3790`，99个原块、repeat/idempotence一致。

完整 Methods / a-section-6 p42（零起算）在原 `AIMD conductivity experiments` 下说明 conductivity，含一个 `mScm<sup>−1</sup>`：单位是 `mS × cm⁻¹`，负幂只附着cm，前面的毫西门子是乘因子。原普通数字 `101.18` 保持，不补写为numeric power。原 σ/temperature SUB、citation69/heading ancestors均完整。六位有序creators、canonical/DOI/JSON-LD、原 CC BY4 notice/license link与独立publisher footer保留；不按repository code license重新许可文章片段。

最高实际citation69要求原完整references1–69。原source total71，仅70–71省略、不重编号。Required prefix里的Ref2 literal `<`仍保留，links已知#65失败分列；不能删ref或放宽validator掩盖它。

`node --test test/nature-compound-unit.test.mjs` 在生产未改的accepted3889实际一轮6项：3PASS/3真实FAIL，0skip，1410.1535ms；每dialect一个complete clip。三个正确source unit attachment assertions均RED，math各1orphan；structure/crossrefs PASS，markdown/quarto rawHTML PASS，links independent Ref2 FAIL。Exact warnings仅无figure/无equation。明确synthetic controls只是边界保护，不能算另一个来源角色。

同一轮实际缓存通过显式 `NATURE_COMPOUND_UNIT_RECEIPT_ROOT` 写到外部TEMP；普通永久test默认不写缓存。HTTP/DNS attempts记录后独立检查，包括被catch路径，globals在finally恢复。Only clipNature entry，无论文目录writer；缓存中的writerCalls0字段是这个调用范围的声明，不是instrumented writer counter，完整callgraph说明见diagnosis/handoff。

没有生产修复、full captures/binaries/credentials、新Nature acquisition或implementation PR。新projection须由另一owner独立核 source before production。详情见 `docs/goals/issue-10/bug-compound-unit-handoff.md`。
