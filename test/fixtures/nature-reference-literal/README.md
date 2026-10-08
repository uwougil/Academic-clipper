# Nature reference literal — Issue #65

来源：[Scaling deep learning for materials discovery](https://www.nature.com/articles/s41586-023-06735-9)，Nature，DOI `10.1038/s41586-023-06735-9`。作者按 source metadata 顺序为 Amil Merchant、Simon Batzner、Samuel S. Schoenholz、Muratahan Aykol、Gowoon Cheon、Ekin Dogus Cubuk。本文摘录的 source material 使用原 [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) notice；该完整声明与 publisher site copyright footer 保留在 HTML/provenance，不能以 repository code license 替代。

此真实摘录复用 B 的既有公开 anonymous raw body，不重新 acquisition。原 HTTP body 506351 bytes / SHA-256 `79f575e1941633c2dbd036682977ea6c274acd5c8c44fdb4648856a00a8d7cc6`，完整 capture 只在外部临时目录。新 fixture 为 13671 bytes / SHA-256 `89001940e39557ec3d170e70979ce3477757ef107b616d2e77ff83b3ce2b249e`；A helper Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`，sanitizer `nature-corpus-sanitizer/1.1.0`、serializer `nature-corpus-subtree/1.0.0`、recipe `1.0.0`。未编写 scholarly prose、题名、作者、DOI 或 DOM。

30 个 recipe blocks 保留完整 source References prefix1–2、完整 Code availability source section、原 ancestors/headings、canonical/DOI/metadata/JSON-LD、全部六位 creators、完整 article license notice 与 publisher footer。原 reference2 `#ref-CR2` 的题名文字包含 `(0<x<-1)`，DOM 是 `(0&lt;<i>x</i>&lt;-1)`；保留原负界 `-1`，不纠正发表内容。Raw subtree digest `0e255b91a472bfacada32b8041e736dbe7ccbae15e28f00a75db89cb113217cb` 与 frozen `9892d49c445a2e6e0321a3c4865b1fd7c52de6e379be2ac212ba1f34ed7c3f7f` 分开记录。

技术转换限于 A 原 recipe selection、ancestors/fixed scaffold、attribute sorting、LF、article JSON-LD selection、tracking/executable/session 清理。未选 body、abstract、figures/tables/equations、references3–71、navigation/advertisements 均省略，不覆盖其他 Materials 科学角色。13671 bytes 小于 canonical 每篇20–150KiB软目标：本文件是独立 bug 的最小合法 projection，不新增 corpus admission；两条完整 refs、可用原 body 与全部身份/署名/rights 已足以保留真正失败。增加无关论文内容以凑软目标只会重复来源；没有放宽 article admission 或默认 hard bounds。

`node --test test/nature-reference-literal.test.mjs` 在未改生产的 accepted main `3889f7396eab99060bec88fc8b0dcd3e6712024e` 上真实 RED。原11 tests实际 8 PASS / 3 FAIL；随后只新增第12条 reference-text 既有 `$x<1$` math 边界，定点执行1 PASS / 0 FAIL，没有重跑真实三篇组合，不把两次scope写成新的12条整套执行。真实 source FAIL 仅 `links` 的 rawHtml `x`；两个 synthetic FAIL 分别保护 literal operator 与 HTML-looking text 的安全转义。Markdown/Quarto 四 validators、三个 dialect 的 source literal/refs/DOI/keys/ordered creators/exact warnings均 PASS。Synthetic typed `<code>`/既有 MathJax/citation control、reference math和严格 anchor 拒绝控制 PASS；它们是 constructed cases，不算来源 admission。

普通测试每 dialect 只执行一次真实 clip并共享结果；不复制 parser 或保存整篇 Markdown snapshot。无 tables/figures 的 preflight 在任何 clip 前硬断言，因而没有 hydration/resource/DNS/HTTP 路径；直接 `clipNature` 不调用 writer。小摘录唯一允许 warnings 是 `No Nature figures were detected.`、`No equation nodes were detected.`。Production/validators/security/writer/golden、A/B/C input/helper、canonical/PRD/EDD/dependencies 均未改。

后续独立 source projection 审核已通过，packet SHA-256 `c3177a697b871a68a60a88674e2bdf1bae512cbe00928de3bf7c76a6bb317521`。原来源 bytes/provenance/oracles 均保持；原 SOURCE_ONLY RED 历史如上，不将新执行结果倒写到旧日志。

在 accepted main `a5b6acc2984af5cb8b82106291e963f4f413f5ac` 上，最小 reference renderer 修复只在 Defuddle/normalization 后、DOI/兼容 anchor 拼接前编码字面 `<` 与 `&`，保护既有完整 math/code。新增明确 synthetic 边界覆盖未闭合/成对 dollars、合法数学与 literal HTML 混合、escaped currency、实体拼写、原 literal backslash 与 strict anchors。当前36 focused tests一次执行36 PASS / 0 FAIL；实际三个 source dialect 结果各保存一次到显式外部临时 evidence 路径，所有四 production validators PASS。HTTP/DNS attempts ledger为空；测试结束复原全局/builtin bindings。Writer未调用依据真实 `clipNature` 调用边界的静态证明，未声称存在 writer spy。

完整 commands/results、selected commits、源审核复用、fresh CI 与独立实现 review gate见 `docs/goals/issue-10/bug-reference-literal-handoff.md`。Issue #65 仍须独立实现 review、fresh CI 和 merged-main 验证后由 automation 完成；本摘录不使其他 Materials science 角色或 Issue #10 完成。
