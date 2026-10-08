# Nature qualified metric 来源回归

这是 [Issue #71](https://github.com/uwougil/Academic-clipper/issues/71) 的 SOURCE_ONLY 证据，不是新 admitted corpus entry，也不是已修复输出。完整来源是 AlphaFold 论文 Main 的一个段落，其中四个 `r.m.s.d.<sub>95</sub>` 表示 Cα root-mean-square deviation at 95% residue coverage。

`s41586-021-03819-2.excerpt.html` 是 A sanitizer 1.1.0 从既有 anonymous raw capture 的 58 个完整来源 blocks/必要 ancestors 投影的 UTF-8 LF excerpt。完整34位作者、Fig1 caption/panels、MOESM1 item、article CC BY 4.0 notice 和独立 site footer 保留；零 source citation，因此 reference prefix 为0。PDF/image binaries 与 raw capture 不提交。

recipe、provenance、source-oracle 和 `accepted-a5b6-diagnosis.json` 分别保存选择规则、原始/冻结 hashes、原位置科学期望和未改生产基线的实际诊断。来源材料按原 article rights notice 处理，不归入仓库代码许可证。生产回归入口是 `node --test test/nature-alpha-qualifier.test.mjs`；当前真实 attachment/math tests 仍失败，不应合并此 RED 分支。

完整记录、测试过度约束修正、缓存身份和后续独立审核条件见 [durable handoff](../../../docs/goals/issue-10/bug-alpha-qualifier-handoff.md)。
