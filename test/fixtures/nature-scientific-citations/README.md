# Nature 科学表达式旁 citation SUP 的原文摘录

本目录服务于独立 [Issue #56](https://github.com/uwougil/Academic-clipper/issues/56) 的真实源回归。两个 HTML 是完整原段落的最小保留投影，不是编写的论文、完整 raw capture 或 B/C corpus 的替换输入。`checkpoint-evidence.json` 保留 b714 source-only RED 的历史 accepted base、因果 trace、实际 helper/Git identity 和复用边界；[delivery evidence](../../../docs/goals/issue-10/bug-scientific-citation-delivery-evidence.json) 记录后续最小 guard、独立 own test纠正和RED→GREEN。`independent-chemical-base-packet.json` 仅保留另一独立 attachment 问题的证据。

| 文件 | 原文章与有序作者 | 保留内容 |
| --- | --- | --- |
| `quantum.excerpt.html` | [Autonomous quantum error correction and fault-tolerant quantum computation with squeezed cat qubits](https://www.nature.com/articles/s41534-023-00746-0)，Xu, Qian; Zheng, Guo; Wang, Yu-Xin; Zoller, Peter; Clerk, Aashish A.; Jiang, Liang | Results p18 与 Discussion p1 的完整原段落，必要祖先/原标题、metadata、references 1–64 |
| `chemistry.excerpt.html` | [C5 methylation confers accessibility, stability and selectivity to picrotoxinin](https://www.nature.com/articles/s41467-023-44030-3)，Tong, Guanghu; Griffin, Samantha; Sader, Avery; Crowell, Anna B.; Beavers, Ken; Watson, Jerry; Buchan, Zachary; Chen, Shuming; Shenvi, Ryan A. | Results p2 的完整原段落，必要祖先/原标题、metadata、references 1–35 |

两篇文章各自的原 Rights and permissions notice 声明 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。其实际 notice selector/index/text/links/subtree hash、完整 ordered creators、copyright policy 及与文章版权不同的 publisher footer 分别保存在对应 `*.provenance.json`；没有借用其他文章的作者或版权声明，也没有对第三方内容新增许可。

技术转换使用 B `b718fa8` 上实际 A helper 的 `nature-corpus-sanitizer/1.1.0` 与 `nature-corpus-subtree/1.0.0`：选择原 complete blocks 和必要 ancestors，移除未选正文、UI、tracking/executable material，按 UTF-8 LF 无 BOM 序列化；既有 private/secret 检查未放宽，摘录没有 private material。科学 MathJax/bold/sub/sup、原 citation SUP/anchor、原文本与节点顺序保持，引用编号未改变。完整 recipe、预清洗 block hashes、raw body hash、omissions、transformations、repeat-byte equality/idempotence 记录在 provenance 中；没有把 helper 或整套 corpus infrastructure 复制进 bug branch。

真实源回归来自两个 frozen HTML。测试中 `data-test-only` / `href-only` 是仅移除已有 anchor 一个属性的边界变体，保留源文字、numbers、href（href-only）、base 和顺序；这些变体不充当 publisher source evidence。真实非 citation 负控 `<i>e</i><sup>−2<i>r</i></sup>` 来自同一 Quantum 完整段落。HTML 的 `.gitattributes` 仅为原 inline whitespace 固定 LF 和局部 `blank-at-eol` 处理，不重写科学 source bytes。

本目录没有原 HTTP capture、图片/PDF/table binaries、token/cookie/config 或网络 acquisition 代码。独立生产修复只在 Nature existing scientific eligibility guard；本目录的 source/rights/provenance bytes保持。`Pb(OAc)4` 完整原化学 base 的独立孤立 subscript 失败仍由未修改的 production validator 报告，本目录不宣称 chemistry whole paragraph 已通过验证。
