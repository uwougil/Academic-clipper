# Nature caption / citation bug — 独立交接

状态：`LOCAL_VERIFIED_PR_READY`。本文件为 [Issue #47](https://github.com/uwougil/Academic-clipper/issues/47) 的一个最终 delivery PR 交接，不承担 Issue #10 的部分交付责任，不宣称 corpus 验收完成。最终 exact-head 三平台 CI / Secrets 和独立 review 由 orchestrator 核验；本 agent 不 merge。

## 合同与基线

- Work Contract：`[bug] Nature 图注引用与内部链接绕过语义归一化`，唯一类型 `bug`，OPEN。使用 human-settled-intent 来源模式；由用户 autonomous orchestration 授权立项及修复。
- Accepted-main base：`e85b1b809b56242b89b6313ce5d1165c745466bb`。启动时 `git fetch origin main` 重新核验；Main CI `37182993143` 与 Secret scan `37182993093` 均 success。
- Shared production gate 在 #46 进入 accepted main `e0a341fc97ff845a250c2f016dcb2363e10ed49e` 后由 orchestrator 释放：Main CI `37269007138` 三平台均 success；Secrets `37269007093` success。`git fetch origin main` 确认该 SHA，从 clean/pushed 原 red `97b193b738abb508736a4a7c5459c951f9d4c76c` rebase，得到 red `9bd15729b8454d03d1a5f51201d162db874dc09b`；复跑仍 1 PASS / 10 FAIL。
- Branch：`codex/issue-10-bug-caption-citation`；managed worktree：`issue-10-caption/academic-clipper`。
- Runtime：Windows / Node `v24.14.1`、npm `11.11.0`。不是最终 Ubuntu Node 20/24、Windows Node 24 CI 证据。
- 已读实际 `AGENTS.md`、immutable canonical spec、execution plan、PRD §3、EDD §2.4–2.5，以及 B/C 完整 handoffs。PRD/EDD 既已要求完整图注、正确引用、三方言内部 target 和 HTML purity；本修复恢复这些承诺，不定义新行为。
- Open + closed duplicate search 使用 `caption`、`图注`、`citation` 和完整 Issue 列表；没有 equivalent。Closed #6 是单 anchor citation range；closed #11 是方言/HTML 契约建立；#45 是 table footer，边界分开。

## 来源与最小摘录

读入 B scientific input `143fc77ebdc4bf15dd1cdca63afcddb91e6b55f5` / provenance-only `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330` 的原始外部 HTTP bodies。先验证 untouched Buffer 的 raw hash，再调用 B checkout 中 A 的只读 helper：sanitizer `nature-corpus-sanitizer/1.1.0`、serializer `nature-corpus-subtree/1.0.0`。没有导入 A/B corpus infrastructure 到这个 bug PR，没有改 B bytes / oracle，没有复用 PR #13。

每个 `.provenance.json` 记录原 source identity / observation time、raw byte hash/size、recipe/hash、完整 retained blocks 和 sanitization 前 subtree hashes、transformations / omissions、fixture byte hash/size、完整 ordered creators、原 CC BY 4.0 notice / href / source locator/hash。三个 rights notices 及作者序列另从原 source DOM 核对。原源码许可不由 repository code license 替代。

| Fixture (`test/fixtures/nature-caption-citations/`) | Source | Bytes | Source raw SHA-256 | Fixture SHA-256 |
| --- | --- | ---: | --- | --- |
| `scientific-reports.excerpt.html` | s41598-018-38309-5 | 107925 | a1a135395d984fcda4548aacd0d6eabe0d41bb22c16cc31f4c8f16f8eaf49d51 | 23de0c22dcfd8673890a7053978ec86535a0b0ac60b14fb8ad27c0df5df54102 |
| `section-links.excerpt.html` | s41586-020-2012-7 | 44445 | 340b1b93ba889c99acf492c7e5ba14ba36e0a5c12866da39a445237e992e2cb9 | e560ec9341b7408ead9c3765df1052c3d3116763fcf2873fce766562b15a8232 |
| `internal-links.excerpt.html` | s41534-023-00746-0 | 98550 | 6b2bb78e5f3038d6281eac00b60dc90aa58bdd9ac185ca2d4b9b0de362bbe28e | 20a130d3d6118a3ed230ff68bbccd19b8aa56606b2e24834062883d26b6abb74 |

仅选择实际 metadata、完整 figure wrappers、原相邻段落、必要 source headings / table target，以及最高 retained citation 所需的完整 reference prefix（74 / 13 / 65），不重编号。UTF-8 无 BOM、LF、inline whitespace 和真实 topology 保留；再次从 raw 生成 byte-equal，二次 sanitization 幂等。三个 excerpts 总计 250920 bytes；完整 captures、图片 binary、credentials 和临时输出没有提交。

Scientific Reports 的四个 main figures 原描述位于 figure 内：image DIV 和 bottom-caption DIV 是 `.c-article-section__figure-content` 下的有序 siblings。`#figure-3-desc` 原 subtree hash `97dedd0cd8d86a6d5cf96831c688e0ab4b1295f5e3e3a54e12d4372e1812fb06`，真实引用顺序 74、56。Quantum Discussion paragraphs 6/7 原 hashes `f9fd42a89ad5b85ff6cf46d76aa480d04c17de3e69bd5557f95948e86edbded5` / `12e32b2d045fdc9e328de37c6c3f96dbac6841a670f624d1db0e8ec23e1996af`，逐字等于 C 的 checkpoint packet。

重建 recipe 不依赖 private chat：从相应 provenance 读取 `recipe`，使用记录的 A sanitizer 版本，对 raw hash 匹配的原 body 执行 `sanitizeNatureHtml(decodedRaw, recipe)`；先验证 raw Buffer，再比较返回 bytes 与 fixture hash。完整源 body 按 repository 政策仅在原外部临时捕获目录；普通测试仅用 committed excerpts，不访问这个目录。

## 分类、红证据与根因

分类：implementation bug。没有 proven historical good source case，因此不虚报 regression introduction commit。

`node --test test/nature-caption-citations.test.mjs` 在未改 production 的 accepted baseline exit 1：11 tests，1 source byte/creator/topology PASS，10 behavior FAIL，0 skip / todo / cancel。三组真实输入各自验证如下：

- Scientific Reports 三方言独立证明 caption duplication 和 citation superscript/raw-anchor validator 失败；每幅完整 caption 首尾/面板/正文位置、74/56 顺序与 definitions/Bib 是正确期待。
- COVID 三方言真实 Methods heading retained，却在 Figure 1/2 captions 输出 self-article absolute URL。
- Quantum 直接运行实际 adapter → Defuddle 子链路，真实数字 figure/table refs 产生 prose footnote definitions；Table 链接 `1` / `1)` 变成引用4，后者丢失闭括号。该 lower-stage 测试不声称运行 table hydration；没有 global fetch/DNS patch。

根因已追到两个相接边界：

1. `extractFigures()` 在 `prepareSemanticNodes()` 前冻结原始 `captionHtml`；后续正文上的 math/scientific/citation/semantic target 保护不会更新这个副本。Caption converter 因而把 `<sup><a ...>74</a></sup>` 解释为含 raw HTML 的 superscript math，并让 caption section/equation/figure links 绕过已有目标策略。
2. Adapter 仍把已识别 scholarly internal links 直接交给 Defuddle。Defuddle `elements/footnotes.js` 的 `tryGenericIdDetection()` 以数字标签和文内 IDs 识别 footnotes，克隆 retained figure placeholder 或 table wrapper；renderer 将原位与 footnote 副本的同一 placeholder 都展开，导致重复图注。Quantum body Table 1 和 retained Fig1/Fig6 failures 使用同一机制。

最小修复涉及四个已有 production 文件：`src/adapters/nature.mjs` 在已识别 internal href 放入 `CROSSREFERENCE` marker，使数字 link 暂不匹配 DOM ID，并在全部语义保护后重新 snapshot main / supplementary captions；`src/normalizers/citations.mjs` 在既有方言策略前恢复 target，caption 的 section 判定接受实际 body heading context；`src/normalizers/figures.mjs` 复用既有 typed math / academic / citation / target normalizers；`src/clip.mjs` 先取得实际 body conversion，将 semantic、references、policy、body heading context 传给 caption converter。没有第二个 parser，没有更改 Defuddle / dependencies、source numbering、fallback、table notes、writer、bridge 或 validators。

## 自有断言的 source 核查与校正

原 red 日志保存在外部临时目录的 `red-baseline.log` / `red-rebased.log`。修复后执行推进到此前未到达的断言，发现本 agent 的两项测试假设与 committed source 不符；先查询 source DOM 证明，再仅校正自有 test，不改三个 excerpts / provenance、B oracle 或 validators：

- Scientific Reports 查询 `#figure-1-desc p` 和 `#figure-2-desc p`：尾句 `White regions represent pixels with percentage of forest >60%, strong topography, or frozen soil conditions, which were excluded from the analyses.` 在各图注各出现一次，合计两次。因此 Fig1 `captionEnd` 在整个输出出现一次的旧期待是 test bug。现在完整四个 caption bodies 各出现一次，首部各一次，尾部次数等于原四幅 source captions 中的真实次数（Fig1 tail=2，其余=1）；每幅 `captionMarkdown` 的完整文本仍与原 label + description 相等，面板顺序、位置和 definitions/Bib 断言保留。
- Quantum 查询 committed excerpt 的 `a[href$="#Fig1"]`：1 个 body link，原文字 `1`；`a[href$="#Fig6"]`：0 个。`#figure-6` / `#Fig6` wrapper、原 description 及 image topology 存在，adapter 的 Fig6 target 为 `figure-6`，Defuddle body 含唯一原位 placeholder `ACADEMICCLIPPERFIGUREfigure-6X`。测试按实际 source links 检查文字和 target，并从真实 Fig1/Fig6 数据检查 links anchor / Quarto identifier；不声称此 excerpt 覆盖 Fig6 的 body link。
- Quantum 原 raw body 有两个 Fig6 body links，位于 `#Sec2-content > p:nth-of-type(15)`、`#Sec8-content > p:nth-of-type(13)`，原文字都为 `6`。本独立 recipe 仅保留六个完整 figure wrappers、直接相邻段落、必要 headings/table target、Discussion paragraphs 6/7 和 reference prefix65；这两个非相邻 paragraph 没有被选择。recipe 没有变化，也没有把不存在的 link 加进 fixture。C 的完整 B85 验收仍须独立检查其实际 retained refs。
- Source 相邻段落的 `Figures S6–7b` 被 Defuddle 排版为 `Figures S6 – 7b`；位置断言仅忽略 whitespace，所有非空白字符保留，并且现在要求相邻段落实际找到（`position >= 0`），再检查前后顺序。

校正后的完整 11 tests 另在 exact accepted production `e0a341f` 上复跑：exit1，1 PASS / 10 FAIL，0 skip / todo / cancel；真实失败仍是 duplicate caption、raw citation superscript、caption Methods target 和 quantum invented prose footnote。记录 `red-corrected.log`；不是用删真实失败换取 green。修复后的同一校正 test 为 11 PASS / 0 FAIL。

另对只读 B 的完整 quantum excerpt（fixture SHA-256 `b32d31f2389e8c052f990812cfd86441172538fd66e37fa17f97704d8795d9fc`）执行实际 adapter → Defuddle → `normalizeAnchorMarkers`：原 source 的两个 Fig6 body links 均在 links 中为 `[6](#figure-6)`、Quarto 中为 `[6](#fig-figure-6)`，默认 Markdown 依已有策略降为文本；Defuddle 没有 invented prose footnote definitions。此为额外 lower-stage 原引用检查，未执行 table hydration 或完整 article validators，不代替 C 的独立 B85 验收；日志 `quantum-complete-links.json` 仍在外部临时目录。

## 独立缺陷边界

Pangenome sparse short-alt 是另一根因：`extractFigures()` 用 `figures.length + 1` 设置 `alt`，而 `label` 取原 caption。源 `Fig1, Fig3, Fig4, Fig5` 的 label 正确，alt 却为 `Figure 1/2/3/4`。建议独立 bug Work Contract：保留真实源 figure label 对应的 short alt；验证原四个 wrapper hashes、三方言 sparse numbering、caption/identity/order/fallback 不变；不把 figure array position 当 source number。本 bug 不修改该路径。

Plain-text units、literal brackets、leading isotope、adjacent-inline dollars 的科学边界也仍属于各自独立 source-backed Work Contracts，不通过本 bug 弱化 validators 或改变 oracle。C 原 85×3 / strict validators 的最终验收仍等待所有前置修复进入 accepted main。

## 当前命令与结果

| Command | Result |
| --- | --- |
| `npm ci` | exit 0；65 packages，0 vulnerabilities |
| Source preparation with recorded A recipe/version | exit 0；3 raw hashes、source creators / notices、repeat byte equality、idempotence PASS |
| `node --test test/nature-caption-citations.test.mjs` on original / rebased / corrected accepted production | exit 1；每次 1 PASS / 10 FAIL，真实红基线 |
| `node --test test/nature-caption-citations.test.mjs` after fix | exit 0；11 PASS / 0 FAIL |
| `node --test test/nature-caption-citations.test.mjs test/nature-adapter.test.mjs test/output-quality.test.mjs test/aip-adapter.test.mjs` | exit 0；54 PASS / 0 FAIL |
| `npm test` | exit 0；294 PASS / 0 FAIL，0 skip / todo / cancel；包含 #46 table-note regressions |
| `npm run build` | exit 0；extension build 成功 |
| `node -e "if (!require('node:fs').existsSync('dist/extension/manifest.json')) process.exit(1)"` | exit 0；CI build existence check 成功 |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit 0；只读 golden validation 成功，golden bytes 无修改 |
| `git diff --check` / `git diff --cached --check` / filenames / status audit | PASS；仅四个 contracted production files、自有 test / excerpts / provenance / handoff；无完整 captures 或 credentials |
| Final exact-head PR CI / Secrets / independent review | 本地交接时尚未执行；由 orchestrator 核实 fresh results 后决定是否 merge |

`npm test` 的既有 #45 tests 仍明确报告 FRB table-cell scientific-unit/numeric-power 独立问题每方言12个；这不是 #47 的 source caption failure，也没有弱化任何 scientific validator。当前 #47 Scientific Reports 的 raw HTML、math/scientific-fragment、Markdown structure、cross-reference validators 三方言全部通过。更广的 units / literal bracket / isotope / adjacent-inline 原始 corpus failures 仍如实留给各独立 Work Contracts。

Source preparation / red diagnostic logs 只在外部临时目录。最终 PR 须使用唯一独立 `Refs #47` 行，不 merge；orchestrator 负责 fresh 三平台 CI/Gitleaks、独立 exact-head review 及是否 squash-merge。Merge 仅接纳代码；successful merged-commit Main CI 才完成本 Work Contract。
