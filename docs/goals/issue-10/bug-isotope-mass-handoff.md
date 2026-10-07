# Issue #61 — leading isotope mass source-only 检查点

## 2026-10-07 — mandatory chemistry leading-mass coverage extension

当前仍为 `SOURCE_ONLY_RED / PRODUCTION_GATE_LOCKED`。本轮显式任务补齐同一 #61 的实际 coverage gap，**没有生产实现、implementation PR、full/build/golden 或新 branch CI**。以下当前记录优先；后面的九角色 preflight 原记录完整保留为历史，不能把九角色 subset 当作全部 leading-mass 验收。

### Accepted base、history 与静态缺口

独立核验新 accepted main `3889f7396eab99060bec88fc8b0dcd3e6712024e`：[Main 37691610523](https://github.com/uwougil/Academic-clipper/actions/runs/37691610523) 三 jobs Ubuntu20 `113032907666`、Ubuntu24 `113032907843`、Windows24 `113032907867` 全 SUCCESS；[Secrets 37691610455](https://github.com/uwougil/Academic-clipper/actions/runs/37691610455) 同 head SUCCESS。Own clean `b78c39a55ffccf00c4a8f8085f5b91ece55f4b6b` 非破坏 merge 此 accepted commit，dependency merge 为 `cc83c89180875299f362ff6e09bbad7328b1fad5`；原 source RED / docs 历史没有 rebase/force-push。

从同 untouched raw 枚举 **26 个非citation SUP**，逐个读取完整原 context/preceding/following nodes 与源位置，而非用 parser issues 反推科学角色。15 个真实 isotope mass 明确属于 following source H/C/F；其余11个是九个真正 trailing numeric/unit powers 与两个 Δ12,13 bond labels，全部排除。Whole raw SUP inventory、source scientific primitives 与 C 未改 packet逐项对齐。原九角色确实缺六个，不另建重复 Issue。

| 原 raw block / p 零起算 | source leading roles | 原九角色覆盖 | 本轮新增 |
| --- | --- | ---: | ---: |
| Results / a-section-2 p0 | 3→H ×2 | 2 | 0 |
| Results p5 | 19→F ×2；原 fluorine NMR / coupling context | 0 | 2 |
| Results p6 | 1→H ×1；原 hydrolysis NMR context | 0 | 1 |
| Results p7 / 完整 Figure3 caption | 1→H ×1；原 in-situ NMR panel | 0 | 1 |
| Results p15 / 完整 Figure5 caption | 3→H ×1 | 1 | 0 |
| Results p20 | 3→H ×2；原 binder / binding context | 0 | 2 |
| Methods / a-section-3 p0 | 1→H /13→C 各3；全部六个原 NMR measurements | 6 | 0 |

合计 **15 = 原9 + 新6**。C `19e09534736ff77b673fd289ea0b63a91514c7e3` / `3d533fb15115ad670e30b52b11ac6435d654c53a` 的 unchanged ac86 Chemistry comparison 每方言16个 math issues：3个 trailing compound SUB +13个 SUP（11个 leading mass orphan +2个 Δ bond label）。Methods另外4个 backward-bound measurement powers 不在16中。因此本合同总角色 **15 =11显式orphan+4语义错接**，不是9、11或16。C全source期待 PASS、validators FAIL 的既有事实未修改、未降级 warning。

### 最终 all15 source projection

旧 `.excerpt.html` / provenance / `accepted-b886-diagnosis.json` / 原 `test/nature-isotope-mass.test.mjs` 保持 b78c39 的 Git bytes；只新增最终 all15 packet 与测试。Untouched raw460171 bytes / SHA `a02d82acb4cdbde085e07ca0c276383894e7a7832c6830ad7a212f450926d88d`，未重新 acquisition；B readonly `b718fa8b…` 的实际 A helper Git blob `e56f140d9756bb83013b9df0716dc650e04d7917` /34946bytes/SHA `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c` 沿用。Sanitizer1.1.0、schema/recipe/serializer/projection1.0.0；没有复制 helper 或新 sanitizer。

最终 `s41467-023-44030-3.all-leading-masses.excerpt.html` **83245 bytes** / SHA-256 `ca8665672f96c5590bb0767cab0448f60305f3b916b8e743e478766975a3ea81`，Git blob `a4681c75d001323ab74f13d4ac4469377db1e029`。Recipe SHA `733e4d843d613e887f2184b1cef439c2c7687ff71ae8d3d61d0e7fa570e7677d`，83 retained blocks；同名新 provenance Git blob `9aa2f496bd9ea57e6ee06a5f0942497b653cd296`。

保留原完整 Results p0/p5/p6/p20、完整 Figure3与Figure5 wrappers（包括原 labels/图像候选/caption sibling/panels）、完整 Methods p0、必要原 ancestors/Sec2/3/5/6/8 headings、完整九 creators、原 raw CC BY4 notice/真实 license链接及独立 publisher footer。新增 p6 最高实际 citation为43，故 refs按原序完整prefix1–43；没有补造 refs或重编号。未保留 Figure2 的 source href/text不改，按既有 retained-target降级逻辑保持外文章fragment链接；三方言crossrefs均通过。

| 完整 paragraph | Raw pre-sanitize SHA-256 | frozen SHA-256 |
| --- | --- | --- |
| Results p0 | `146a939c2e4551225269d70f3ac93507bdbebc0c85ffb8629ae19c469d164f6c` | `1d03f1991268ca7b64f42caa0f4a5e348594a8d2c129ce9cd756ff5ca7b1359f` |
| Results p5 | `b128b77e64328225608d6694938fccf1aed9a9f58a0f7beb1c842d0511999947` | `896c0856d4585fd2b2b6df5ba7dd70bdbb466d8b1eb216d7be2d809d411fc605` |
| Results p6 | `77668daf030a601bae26e46af3b5352e4334073e3dbb2d5ed4648cc1a128a975` | `a65361c9ac6dceb63aef8ccedf9b90fc9848ba893b35dfb9046c7cc4fa5bd7b9` |
| Figure3 p7 | `f153157ebdf38415025030538f00eb00c39f5692bb24fdbff54cc37d5462baed` | `8a02db586d4a4ad340dd67722dac0b67b514dbf8133f3bea956b9c2c019bf52b` |
| Figure5 p15 | `21ed9ff8a20bc5a6cc7724c2027e9ca7ab3578ee98ecf38e0f3fb39b52336b73` | 相同 |
| Results p20 | `84ce5d602039554b81ef69b4a8801d0e6a6f1dbbaa20ad0c02545136d4c2b56a` | `20fc81daafd619e6c28721e07e40f5b7702e6c54e17ca0c3fb1d9ddac891c2f0` |
| Methods p0 | `e46e69f8e120aae7909d1f531f54052334313b78481bbce0b641e3ee72e6373a` | 相同 |

83个原 block prehash/科学节点顺序/完整 paragraph text/figure text 与全部作者/rights均在最终freeze核验；每个SUP原 UTF16/UTF8 source offsets、source fragment及raw/frozenhash列在新provenance。每个角色与 C existing original primitive 的 html/previous/next/raw+frozenprehash精确相等。Repeat raw与 frozen idempotence bytes全部相同。已在finalhashfreeze时报告root，这就是未来另一 reviewer要**一次独立审计的最终recipe**，不要先重复旧9审计再替换新recipe。

### 唯一新 focused RED、缓存与原因

命令：`node --test test/nature-isotope-mass-coverage.test.mjs`；显式 external option `NATURE_ISOTOPE_RECEIPT_ROOT=C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-isotope-mass`。Windows Node24.14.1；actual一次运行 **exit1，25=1PASS/24FAIL，zero skip/todo/cancel，2131.9855ms**。21个实际完整context ×dialect attachment RED，加三方言四错误measurement powers禁用 RED；唯一PASS核完整15role/rights/source identity与明确exclusions。无 harness-only failure，不改oracle匹配当前输出。

三个新projection whole clips同轮实际缓存保存：`<dialect>.all-leading-masses.actual-cache.json`（全部result/cleanedHtml/body/captions/semantic/validators/MD及同cachebody stages），另有同次实际 Markdown。每方言只clip一次，未为报告额外clip；默认永久测试零写入。`all-leading-masses-coverage.json`保存15role矩阵、source位置/prehash/old9/new6、缓存bytes/hash、C原comparison/MD receipts、实际command/results与未应用提案，不保存fullraw或伪造科学输入。

三方言 source display0，figures2/refs43/tables0，exactwarning只有`No equation nodes were detected.`。Structure/rawHTML/crossrefs均PASS；math均FAIL13 =11mass orphans +2独立trailing group SUB（Fe₂(ox)₃和(CD₃)₂CO），四measurement错幂仍必须由源语义assertion单独检测。C original16中的Pb(OAc)₄和两个Δlabels不在这个最小projection里，但C既有source/失败保留、明确excluded，不暗删mandatory coverage或假称全部validators通过。

真实阶段原因与原 b886 diagnosis一致，新 accepted3889不是新起因：cleaned DOM / capture caption仍为原 SUP后接H/C/F且无leading typed run；whole-body Defuddle出现`by <sup>19</sup> F`等presentation spaces，`normalizeMath()`不改。`normalizeAcademicInline()`第一次生成孤立mass，并可将四NMRmass后向绑定前measurement。Caption走真实caption路径，Figures3/5分别为`In situ$^{1}$H`与`[$^{3}$H]`。历史e2/6b replay与#48贡献已经旧packet证明，这轮复用，不重复跑历史module或把3889旧failure称新regression。

只保留未应用DOM提案：预期仍只需 `src/adapters/nature.mjs`，从**原来源已证明的SUP mass→紧邻 following element**开始typed Range，measurement/其源空格留在range之外，沿用既有scientific marker序列化。真实source现在含H/C/F，但不意味着所有uppercase words或SUP都可推断为isotope。需要明确source position资格，保护原numeric/unit powers、Delta/bondlabels、真正styled exponents、两种citation cues、unknownwords/opaque math/code；不能在全局Markdown里猜。当前Nature gate锁在#60，未修改任何生产。

原22个synthetic normalizer controls与Nature citation/exponent/code test完整保留；b886→3889 normalizers/validators Git diff为空。它们是既有边界保护，不作为本轮最新3889的新执行结果或真实admission；最终生产修复须再实际验证。未重跑旧9sourceaudit/旧15focused、C9/27/full或旧48/55 full。

### 来源提交、Work Contract 与恢复 gate

有序history：原 `2d038beaef441b346bd341c0783fba2d317ef8c6` → `b78c39a55ffccf00c4a8f8085f5b91ece55f4b6b` → dependency merge `cc83c89180875299f362ff6e09bbad7328b1fad5` → 新source RED `a91645f54bb2a23026986adf6dce6ad336db186c` → 本doc-onlyreceipt后继commit。新sourcecommit只5文件：all15excerpt/provenance、coverageJSON、fixtureREADME与`test/nature-isotope-mass-coverage.test.mjs`；后继只更新本handoff。精确finalhead另交，避免self-reference。

Auth/remote与open+closed `isotope`/`同位素`duplicate search再次核验：同机制只#61，#63split-power/#64Greek/#65literal-reference/#60caption均不同源角色。按已授权settledtask只扩同一#61已有Work Contract，保留原历史/bug/生命周期；不是新Issue或intent变更。更新body由外部精确bodyfile提交，随后完整readback核15roles、originalhistory与未来唯一`Refs #61`。AGENTS/canonical/PRD/EDD/B/C/A source/validators/security/deps/golden均无diff。

`git diff --check`/cachedcheck/status/trackedfilenames：PASS；与accepted3889比production diff为空，原九角色输入/test不变。`npm test`/build/golden/implementationPR/freshbranchCI明确NOT RUN——root显式source-only范围，没有pretend GREEN或使用acceptedMain作为本branchclearance。无新Nature DNS/HTTP、writer、sourceacquisition。

External evidence root仍为`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-isotope-mass`。本轮第一次staticinspector误用direct-child section selector得0，未形成coverageclaim；更正为真实`section[data-title]`后全SUPenumeration26。第一次候选p20 selector匹配2段，尚未写fixture；加原完整p内部SUP数量约束与源Fig5 href后唯一且幂等，再冻结finalrecipe。初始log保留，未编写DOM、改源或洗掉RED。最终focused只有上述一轮。

**恢复条件**：另一owner独立审核本finalall15recipe/rights/positions/roleoracle；root释放#60后才由SAME61owner采用届时acceptedMain实施。最终all15语义及四measurement反例、所有原边界必须GREEN，独立compound/Delta失败如实另列，full/build/golden/freshCI/Secrets/exact-headreview按最终生产树验收。C仍BLOCKED，必须在mergedMain成功后自己消费未改mandatoryChemistryoracle重新验证；本source-onlycheckpoint不解除parsergate、不宣称#10完成。Merge仍由root执行。

## 原九角色 source-only 记录（保留历史）

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
