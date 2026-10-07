# Issue #61 — leading isotope mass source-only 检查点

状态：`SOURCE_ONLY_PREFLIGHT / PRODUCTION_GATE_LOCKED`。本检查点建立真实 source RED 与独立 [bug Work Contract #61](https://github.com/uwougil/Academic-clipper/issues/61)，没有修复生产、implementation PR 或验收完成声明。后续实现须由 orchestrator 释放共享 Nature 文件后恢复同 owner；旧 #48 / PR #50、#55 / PR #58 worktrees/branches 均保持原样。

## 基线与所有权

- Accepted main：`b88653a4be3dcf30cd487365d033f1e7a7c3da0a`。独立核 Main CI `37670512607` 为该 head success：Windows Node24 `112960767643`、Ubuntu Node24 `112960767857`、Ubuntu Node20 `112960768046`；Secrets `37670512896` 同 head success。这些是基线接纳证据，不是本 RED branch 的 CI clearance。
- Managed worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-isotope-mass/academic-clipper`；branch：`codex/issue-10-bug-isotope-mass`。从 b886 non-destructive 新建，没有改别人 checkout/index/branch。
- Runtime：Windows / Node `v24.14.1`。阅读 scoped AGENTS、完整 canonical/plan、integrator goal、PRD §3/§6、EDD §2.3–2.5 与 B/C handoff 的原科学来源及最新 remaining-role packet；使用已读 create-issue / fix-bug 流程。
- 本检查点只有六个 owned 新文件：`test/nature-isotope-mass.test.mjs`；`test/fixtures/nature-isotope-mass/.gitattributes`；该目录 `s41467-023-44030-3.excerpt.html`、`s41467-023-44030-3.provenance.json`、`accepted-b886-diagnosis.json`；本 handoff。没有 production、B/C data/oracle、validators、canonical/intent、security/dependencies、golden、writer、package 或 infrastructure 修改。
- Ordered authored history：`2d038beaef441b346bd341c0783fba2d317ef8c6` 固化前述五个 fixture/provenance/diagnosis/RED files；随后本 handoff 为独立 docs-only receipt commit，固定检查点的 `HEAD` 可由 `git log --reverse --format="%H %s" b88653a4be3dcf30cd487365d033f1e7a7c3da0a..HEAD` 重建。没有 dependency merge、rebase 或 force-push，没有改写原 RED history。

## 原 source、合法 excerpt 与 admission

[C5 methylation confers accessibility, stability and selectivity to picrotoxinin](https://www.nature.com/articles/s41467-023-44030-3)，Nature Communications，DOI `10.1038/s41467-023-44030-3`。B snapshot `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330` 保留原 source evidence；C snapshot `3006f0f7381ba843efc3c17b98370194b0a04017` / 外部 `accepted-units-literals-remaining-source-positions.json` 的 `chemistry-scripts` 指定 fragments 提供独立位置。没有重采 13 resources；只读取原 B anonymous article raw：460171 bytes，SHA-256 `a02d82acb4cdbde085e07ca0c276383894e7a7832c6830ad7a212f450926d88d`，observedAt `2026-10-03T16:44:25.253Z`。

| 完整原 semantic block（p 零起算） | 原科学角色 | Raw pre-sanitize paragraph hash | Frozen paragraph hash |
| --- | --- | --- | --- |
| Results / a-section-2 p0 | 两处 mass 3→following H，原 `[3H]` literal brackets/compound labels | `146a939c2e4551225269d70f3ac93507bdbebc0c85ffb8629ae19c469d164f6c` | `1d03f1991268ca7b64f42caa0f4a5e348594a8d2c129ce9cd756ff5ca7b1359f` |
| Results p15 / Figure5 description | 一处 mass 3→H，完整 Fig5 原 panels/说明/image sibling topology | `21ed9ff8a20bc5a6cc7724c2027e9ca7ab3578ee98ecf38e0f3fb39b52336b73` | 相同 |
| Methods / a-section-3 p0 | 六处 mass→element：1→H、13→C 依次三组；preceding measurements 为7.26 ppm/77.16 ppm、2.05/206.26、3.31/49.00 | `e46e69f8e120aae7909d1f531f54052334313b78481bbce0b641e3ee72e6373a` | 相同 |

New own excerpt 为 **53436 bytes**，SHA-256 `3c68fff1660b3b861da7432e9d96ce9957649adca7105646e4ee206e531365f0`。61 个 recipe blocks：原 article metadata/JSON-LD/canonical/title，完整 Results p0、完整 Figure5 wrapper、完整 Methods p0、必要原 Results/子标题/Receptor selectivity/Methods headings，原 References heading 与完整 prefix 1–26，以及原 Rights and permissions notice/独立 publisher site footer。只省略未选择 blocks，没有编写 paragraph、heading、isotope 或 TeX，没有造新引用或重编号。三方言 crossrefs 都通过，未用窄 excerpt 丢 target 的假失败替代 isotope RED。

Creator metadata 按原序完整保留：Tong, Guanghu；Griffin, Samantha；Sader, Avery；Crowell, Anna B.；Beavers, Ken；Watson, Jerry；Buchan, Zachary；Chen, Shuming；Shenvi, Ryan A.。Provenance 保留原 CC BY 4.0 完整 notice、实际 raw text（`Open Access` 后有两个源空格）、license link、原 serialized notice prehash `84ab88094d2cd6f87d0a2a8abbb091db26a34a50a7701aa2a706a9a1a4b4dafd` 与独立 `© 2026 Springer Nature Limited` site footer；不把 site footer 当 article copyright，不将 excerpt 重新许可为 repository code。

A 原 actual helper `scripts/lib/nature-corpus-infrastructure.mjs` 的 Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`，34946 Git bytes，SHA-256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`。Schema/recipe/serializer/projection `1.0.0`，sanitizer `nature-corpus-sanitizer/1.1.0`。实际调用 `sanitizeNatureHtml(raw, recipe)`：raw 每个 retained block prehash、三个原段落正文/全部有序 scientific nodes、9 creators、原 rights 均核对；repeat raw 与 fixture idempotence byte-for-byte 相同。Recipe SHA-256 `04fb0c8294a21f573d806121722b073d646e66531324e9067a4922112279ff90`。全部 source positions、UTF-16 offsets/UTF-8 byte offsets（end exclusive）、prehash、transformations、omissions、signatures、reconstruction 方法在 provenance 中。

局部 `.gitattributes` 只对本目录 HTML 固定 LF、允许保留 source blank-at-eol；A serializer 的原 text whitespace 没有 trim。原 full raw/helper acquisition scripts/输出 Markdown 仅外部 TEMP，不提交 full captures、credentials、image binaries 或第二 parser。

## 真 RED、阶段因果与历史

永久测试 `node --test test/nature-isotope-mass.test.mjs` 在生产完全未改的 b886 上：**exit 1；15 tests = 3 PASS / 12 FAIL，0 skip/todo/cancel，1230.3814 ms**。

- 9 个 source behavior FAIL：Results/完整 caption/Methods 三个原 context × 三方言，正确期望是所有 mass 与 following H/C 在同一表达式，按源 order、measurement 与 bracket 邻近位置核验，不能只靠 sup 数量或语法通过。
- 3 个 source behavior FAIL：Methods × 三方言，原 2.05/206.26/3.31/49.00 measurement 不能成为 mass 1/13 的 numeric exponent base；actual 确有四个 counterfeit powers。
- 3 PASS：source identity/rights/complete blocks；22 个明确 synthetic normalizer controls；synthetic Nature citation SUP/真正 `10<sup>3</sup>H` exponent/code 经过三个 dialect 的原语义。Matrix 覆盖 ASCII/Unicode signed unit powers、angstrom/numeric powers、styled/prime/uncertainty、chemical subscript、unknown plain word/prefix、existing inline/display math/typed isotope、escaped dollars、inline/fenced/indented code、math-looking fence 与后续 prose unit。Synthetic 不作为真实 Nature isotope source admission。

完整实际链路的最先失效必须区分：

1. 原 DOM 中 `SUP` 后立即为 H/C，measurement 与 SUP 前有源空格。`replaceScientificRuns()` 没有 plain leading mass collector，保留 SUP/element DOM，但缺少 typed role protection；不是 raw acquisition/hash 或 source 内容错误。
2. 正文 Defuddle 的实际输出含 `2.05 <sup>1</sup> H NMR`，所加的 presentation spacing 使后续 text adjacency 不再足以判定前缀 role。独立 `htmlToMarkdown(paragraph)` 子链路保留 `</sup>H`，故不能用它代替实际 `defuddleToMarkdown(page.document)` 诊断。
3. `normalizeMath()` 保留上述片段。`normalizeAcademicInline()` 的 `renderRange()` 第一次将 mass 独立渲染成 `$^{1}$ H`，并删掉前方分隔空格。
4. #48 新 `combineLiteralPowers()` 的 guard 只检查 fragment 后立即字母；实际有 Defuddle space，所以把四个 prior numeric measurements 当 base，得到 `$2.05^{1}$ H NMR`、`$206.26^{13}$ C NMR`、`$3.31^{1}$ H NMR`、`$49.00^{13}$ C NMR`。
5. 四个 counterfeit powers 本身 `validateMathDelimiters()` valid；source attachment 仍错误。Permanent semantic assertion 独立检测它们，没有放宽 validator。

只读 actual historical module replay（`git show <sha>:src/normalizers/academic-inline.mjs`，加载 external/data module；不临时覆盖 production）：对同一实际 Defuddle NMR fragment，e2 `e2d32e9ec819692a1f08075636c3a168f15ad20b` 已有四个孤立 mass；6b `6b90413d806f7e611b00559c8208f6b95b31dd1e` 和 b886 则有四个错误 numeric powers。缺少 prefix role 为既有 implementation bug；#48 pass 参与新增 backward binding。没有宣称 earlier isotope correctness 或笼统归因全部问题为 #48 regression。

可直接读小 durable `accepted-b886-diagnosis.json` 的实际 source roles、Defuddle/math/academic fragments、三个 historical outputs、每个 dialect 的 validator issues/positions，以及未应用 proposal。完整外部 trace/logs 不作为隐藏唯一合同。

三个 dialect 的 structure/raw HTML/crossrefs 均 valid，source 无 display equation，exact warning 为 `No equation nodes were detected.`。Math 均真实 FAIL：5 个 leading-isotope isolatedSuperscript，另 1 个 `(CD₃)₂CO` group trailing isolatedSubscript。已错误绑定的4个 powers不在这5个上标错误中，不能拿 issue count 当 role coverage。Retained Methods 的 compound source保持原样，独立 trailing role不捆修；whole chemistry 不声明 PASS。C 其他 chemistry positions（包括其余 isotope contexts）没有删除或改 expected，本最小 admission 只证明上述9个。

## 未应用的最小提案与兼容边界

预计生产路径仅 `src/adapters/nature.mjs`。从原 DOM 的完整 numeric SUP 和紧邻 following source H/C 选择 prefix Range，通过已有 `replaceRangeWithScientificMarker()` / `scientificTex()` typed scientific 路径输出。Range 从 SUP 开始、止于 element，prior measurement/其源空格留在范围之外。不能用 global Markdown negative regex 从 Defuddle 的空格猜 isotope，也不改 unit/numeric recognition 或第二套 parser。

实施前 owner 必须用实际 bounds 判别 leading source position，保持真正 `10<sup>3</sup>H` 数值幂与 ordinary styled exponents、citation SUP（两种 source cue）、existing math/code opaque、unknown word/prefix；不要把所有 numeric SUP 或任意 uppercase letters 变成 isotope。其它尚未入本 excerpt 的元素/上下文须有真实 source与正确角色核验才能扩大 admission。此提案 **未编辑生产、未执行 GREEN**，当前 Nature gate 仍属 #56 → #57 → #60 串行任务。

## Issue intake 与执行记录

对 `uwougil/Academic-clipper` 验证 authenticated `gh`，all open/closed Issues 语义搜索 `isotope`、`同位素`、`leading mass`，并完整比较 #48、#53、#56 的 scope/body；#48 和 #53 明确排除 leading isotope，#56 为 citation role，#57/#60 亦独立，没有等价合同。以 orchestrator 已授权的 `human-settled-intent` intake 创建 #61，type 仅 `bug`，readback OPEN、编号/URL/label/未来 `Refs #61` 核验；无新 scheduling label、assignee 或 intent policy。一个未来最终 PR 独立负责，merge 不自动 close，successful merged-commit Main CI 才由既有 automation 完成。

| 实际命令 | 结果 / 限制 |
| --- | --- |
| `git fetch origin main`；`git switch -c codex/issue-10-bug-isotope-mass b88653a4be3dcf30cd487365d033f1e7a7c3da0a` | exit0，新 own managed worktree/base，旧 owned worktrees 不动 |
| `npm ci` | exit0，65 packages；npm 报现有1个 high vulnerability，本轮没有改 lock/dependencies 或执行 audit fix |
| `node <isotope-temp>/source-inspect.mjs` | exit0，原 raw bytes/hash、指定三个 paragraph/source locations 与 C prehash 匹配 |
| `node <isotope-temp>/freeze-excerpt.mjs` | exit0，53436 bytes /61 blocks、完整9 creators/rights、repeat/idempotence/全部原科学节点核验；没有重新获取网络 |
| `node <isotope-temp>/trace-accepted.mjs` | exit0，仅 evidence capture，不是 source behavior PASS；实际全 body/完整 caption path、三 dialect validators 与 historical module outputs保留 |
| `node <isotope-temp>/audit-checkpoint.mjs` | exit0，只读当前 raw/fixture/provenance：61个原 retained blocks、三段 prehash/frozenhash、9 prefix roles/9 creators、rights/独立footer/完整Figure5 identities核验；protected paths diff为空，未重采/重写fixture或重跑full |
| `node --test test/nature-isotope-mass.test.mjs`（final source RED） | exit1，15 = 3 PASS /12 FAIL，0skip；log `isotope-source-red-b886-final.log` |
| `gh issue create` / `gh issue edit` / `gh issue view 61` | 创建 OPEN bug #61；update仅把 future placeholder trailer 改为实际 `Refs #61`；不是 implementation publication |
| `git diff --check` / `git diff --cached --check` / `git diff --cached --name-only` | exit0；source commit只有5个owned新files，handoff commit只有本文件；new HTML以本目录attribute保存原LF/whitespace。`git diff b88653a4be3dcf30cd487365d033f1e7a7c3da0a -- src test/corpus scripts papers docs/specs docs/PRD.md docs/EDD.md package.json package-lock.json` 为空 |
| `npm test` / build / golden / implementation PR / fresh branch CI | **NOT RUN**，显式 SOURCE_ONLY 范围与 production gate；没有重复旧48/55 full 或以基线 CI 代新 head |

External TEMP root 为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-isotope-mass`；untouched B raw root 为 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-b`。普通永久 tests 只读 committed excerpt/provenance，无 live DNS/HTTP、table replay或 writer。

诚实保留的 harness experiments：第一次 external inspector 使用 Windows absolute ESM path，而非 `file:` URL，setup失败后按 Node正确 import修正；freeze初次将B已normalized notice同 raw双空格直接比较，改为保留 raw text另做B normalized一致性核验，未改source；test初次 `String.raw` 的 `${}` 被当JS模板expression，未执行 sourcecases，修测试语法；随后synthetic Quarto key漏源year2020，read actual source surname/year合同后修为 `Alpha2020`。前两份 focused logs不冒充 final source RED或生产 regression。

## 恢复条件

本 source-only branch 的测试有意保留真实 RED，不能合入 main 或建立完成 #61 的 PR。Root 先独立 review新的 lawful projection/positions/rights与此 diagnosis；共享 Nature gate释放后恢复 SAME owner，从届时最新 accepted main non-destructive adopt并保持 ordered source-RED history，然后只按本合同实施最小 fix、复验 original RED→GREEN、适用/full/build/golden/fresh3CI/Secrets 和 independent exact-head review。不能捆入其它 remaining roles、修改 source/oracle/validator，不能宣称 #10 已完成。最终 merge权限仍属root。
