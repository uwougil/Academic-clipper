# Issue #63 — source-only split negative exponent handoff

独立 [bug Work Contract #63](https://github.com/uwougil/Academic-clipper/issues/63) 已创建并 read back：OPEN、唯一类型 `bug`。当前交付为真实来源与永久 RED 复现，**没有修复生产实现，没有实现 PR，不宣称 #63 或 Issue #10 完成**。分类为 implementation bug；未证明是哪次 commit 引入的 regression。使用 `create-issue` 完成立项，然后按 `fix-bug` 完成 source/reproduce/prove/diagnose/regression 阶段；root 仅授权本阶段，生产修改仍 locked。

## 基线、分支与选择

- Base：`ac86b2fa509653dfeb43b968472ce6280a51de2c`，accepted main。独立查询 Main CI `37681190063` 与 Secrets `37681189875` 的实际 `headSha`/`conclusion` 均为该 SHA / success；Main 的 Windows Node24 `112997400634`、Ubuntu Node24 `112997400858`、Ubuntu Node20 `112997401004` 全 completed/success。PR #27 planning commit `5971ebfbe288e0efed4abef21469f41e2cabb05f` 为该 base 祖先。
- Branch：`codex/issue-10-bug-split-power`。
- Worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-split-power/academic-clipper`，由 managed create_worktree 建立；从 detached accepted base 新建 branch，未改其他 agent branch/index/checkout。
- Ordered authored commit 1：`b3cda21b2456c08f036abc7ef0aa6fe632c0e4d2`，五个 source/test files，见下表。
- Ordered authored commit 2：仅本文；SHA 用 `git log -1 --format=%H -- docs/goals/issue-10/bug-split-power-handoff.md` 重建，避免 commit 自引用。消费者选择上述 source commit 再选本文 commit，不选择其他 agent branch。

PRD §3 的科学符号/上下标与原 TeX 保留、EDD §2.3–2.5 的 Nature → Defuddle → normalization/validators，以及 canonical §4/5/6/7/9 是正确行为依据。未改 PRD/EDD/canonical/plan，不需要 spec proposal。独立检索全部 open/closed Issues，读完整 #48/#56/#57/#60/#61 scopes，并再次搜索 `"split" in:title,body`：没有等价合同。#48 已接受单 SUP 数值/单位幂；本来源的两个 sibling SUP 负号/数字不是重新立项该行为。

## 实际消费的接口与来源

| 依赖 | 精确身份 |
| --- | --- |
| B source contract | `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`，只读 |
| C 当前 source packet / handoff | `19e09534736ff77b673fd289ea0b63a91514c7e3`，只读；`accepted-ac86-delta-quantum-source-delta.json` 的两条 `split-numeric-power` 原节点记录及 actual line207 |
| A actual helper Git blob | `e56f140d9756bb83013b9df0716dc650e04d7917`；34946 Git bytes；SHA-256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c` |
| Sanitizer | `nature-corpus-sanitizer/1.1.0` |
| Recipe / serializer / projection | `1.0.0` / `nature-corpus-subtree/1.0.0` / `nature-corpus-projection/1.0.0` |

使用 B 的实际 helper 原 export `sanitizeNatureHtml(decodedHtml, recipe)`、`serializeSubtree(node)`、`sha256Bytes(Buffer)`，不复制 sanitizer。原始 Buffer 先核 size/hash 再 decode/JSDOM。Helper checkout CRLF 与 Git LF 的差异已单独核验：只折叠 checkout CRLF 后 bytes 等于原 Git object，未改 helper。第一次把 physical helper hash 与 Git hash直接比较被拒绝，随后用 `git show HEAD:scripts/lib/nature-corpus-infrastructure.mjs` 的原 bytes 校验；这是 byte-domain 修正，不是来源或 helper 改动。

[Autonomous quantum error correction and fault-tolerant quantum computation with squeezed cat qubits](https://www.nature.com/articles/s41534-023-00746-0)，DOI `10.1038/s41534-023-00746-0`，npj Quantum Information。原 acquisition observedAt `2026-10-03T16:44:08.251Z`；复用 B 的实际 acquisition/captureMode 与 source rights，没有重新获取。原匿名 HTTP 解压后 body **511799 bytes**，SHA-256 **`6b2bb78e5f3038d6281eac00b60dc90aa58bdd9ac185ca2d4b9b0de362bbe28e`**。完整 raw 仅在外部 temporary evidence directory；不进入 Git，不使用 PR #13 输入、浏览器 profile/credentials 或私人 session。

| 原 Results 位置，零起算 | 原角色与 source prehash | frozen paragraph digest |
| --- | --- | --- |
| `a-section-2` p33 | 原 `~10<sup>−</sup><sup>15</sup>`：10 是 base，原两个直接相邻 sibling SUP 的 − 与 15 是同一负指数；raw `76701dc7ea4f491570f57d3ae1329c472eb812a2454237392b6f0d99c8a55435` | `d9fd04d9e40ad364d1c122769be3e2f4d318ea429dfc158c9bcd66575c02c3a4` |
| `a-section-2` p37 | 同源单 SUP `10<sup>−15</sup>` positive control；raw `28e06f2eac7ed32e9dca4b87991c85cc120323782c2dbe1c980cdaa669af9f64` | `db986d752212798179907747abd707b3a96a2aa6fa5f9a33569798f8bba453b1` |

来源位置由 provenance 原 selector/paragraph index/serializer prehash 和完整 source text/scientific node list 定位，不是 HTTP byte offset。p33 没有 nested SUP。选择 p33 的稳定 selector 同时要求 direct sibling SUP、无 SUP citation anchor、原 Fig4 href；raw 中唯一，pruning 后仍唯一，避免原 p33 的 nth-of-type 在 excerpt 中漂移。原 p37 用真实 citation anchor ID 唯一定位。

## Lawful projection、rights、文件与大小

全部 **77** 个 recipe blocks 保存于 [provenance](../../../test/fixtures/nature-split-power/s41534-023-00746-0.provenance.json)：canonical、真实 citation metadata/JSON-LD、title、Results heading、完整原 p33/p37、原 Fig4 完整 wrapper（正文链接目标与完整 caption）、原 references prefix 1–58、原 article CC BY 4.0 notice、独立 publisher footer。没有缩写或编写 scholarly prose、作者、引用、图注、数学 DOM；原 order/classes/IDs/有意义 inline whitespace、source sign/sibling SUP、MathJax 和 figure resource relationships 均保留。Reference prefix 由 selected paragraph/figure 中最大原 citation 58 得到，不重编号；真正 retained citation clusters 的原 DOM order 是 `[[58],[58],[8,51],[58]]`。

6 位全部原 ordered creators 为 Xu, Qian；Zheng, Guo；Wang, Yu-Xin；Zoller, Peter；Clerk, Aashish A.；Jiang, Liang。Provenance 保存 B 原 creator list、完整原 CC BY 4.0 notice（含原 raw text，不 collapse 其科学来源）、license href/source/prehash，并单独保存 `© 2026 Springer Nature Limited` publisher footer。Article source material 按原权利声明归属，不重新许可为 repository code license。保留 source text/raw source nodes与必要 contextual references，而非完整 live capture。

| Owned file | 实际 UTF-8 LF bytes / SHA-256 |
| --- | --- |
| `test/fixtures/nature-split-power/s41534-023-00746-0.excerpt.html` | **62731** / `dc1136a1c70a66e63cce9bbe696b9cd790eb8eefbad3b499cce04dc140b16ad0` |
| `test/fixtures/nature-split-power/s41534-023-00746-0.provenance.json` | **53459** / `a0390f1f98c6b8781dc5b4c8abdd486d011cac7e1c1b53c627255a64073fd742` |
| `test/fixtures/nature-split-power/diagnosis.json` | **20374** / `a895e03dfe9b99d83ffb575ae1883eb79d5ef4ecec7f11640920d5f70ded2944` |
| `test/fixtures/nature-split-power/.gitattributes` | **63** / `95c26320a50e72d4a1163cd31cdbf4b76815efac4afd81241683c0a81b0a6b6c` |
| `test/nature-split-power.test.mjs` | 永久真实生产回归与明确标 synthetic 的兼容边界；Git bytes 可从 selected source commit 重建 |
| 本文 | docs-only handoff |

62731-byte article 在 canonical 20–150 KiB 目标与 256 KiB 上限内。未创建 table resource、补充 binary 或 corpus manifest 新 entry；这个窄 bug fixture 不替代 B 的 9 篇 corpus，也不承担 final corpus aggregate review。原 Fig4 source wrapper 必须保留才能验证真实 links/quarto target 与 caption context，不能只删 figure 以追求更小字节数。

原 raw+recipe 的 repeated output 与 re-sanitize output 均 byte-equal；fixture hash 包含 LF。RecipeSha、retained prehashes、structure/payload projection signatures、transformation counts 保存于 provenance。Omissions 为其余正文/figure/equation/Methods/affiliations/author information、refs 59以后、无关 UI/执行/tracking/session、binary与全文 raw；A 的固定 scaffold/ordered attributes/JSON-LD article extraction/URL cleanup 如实记录，不全局 collapse inline whitespace。局部 `.gitattributes` 只确保这些 HTML/JSON LF，HTML 放行必要的科学 blank-at-eol；不放宽整个 repository diff checks。

## 真实复现与第一失效状态

永久命令：`node --test test/nature-split-power.test.mjs`，最终确认 **exit 1，9 tests：6 PASS / 3 FAIL，0 skip/todo/cancel，1470.1774 ms**。三 FAIL 唯一对应 p33 × markdown/links/quarto：实际仍是 `~10$^{−}$ $^{15}$`，没有同一 math expression 中的 base 10 / exponent −15。期待来自原节点 attachment，不来自 parser output。三个 same-source p37 controls 的五个单 SUP powers/order、source citation roles PASS；source metadata/完整节点/6 creators/rights/refprefix integrity PASS；明确 synthetic 的 math/code、unrelated SUP、citation、spacing/unknown wrapper controls PASS。构造的无关联 split nodes 保持被诊断，不充当额外真实 admission。

每个方言调用一次真实 `clipNature` 并在同一 promise/cache 上执行两个 assertions；过滤 source-only integrity 时不启动这些 clip。四 production validators **由真实 clip 全部执行**，并从同次 actual receipt 验证：三个 dialect 都是 math invalid/正好两个 `scientific-isolatedSuperscript`；rawHtml/markdownStructure/crossReferenceValidation valid。精确且唯一 warning 为 `No equation nodes were detected.`（本 excerpt 没有 display equation），保留 Fig4 因此没有 figure-absence warning。RED assertions 在 source attachment 处先失败，不能宣称后面的 validator assertions 都到达；完整 debug/cache 和 diagnosis 单独证明实际 validators 执行与结果。Tests 不调用 writer，不下载图片，parse preflight/result 明确零 tables；当前 clip 没有 table hydration/resource 请求路径。没有 live fetch/DNS、replay resources 或 global fetch/DNS patch，不把这个无资源 fixture 当 D 的 transport/ledger acceptance。

[diagnosis](../../../test/fixtures/nature-split-power/diagnosis.json) 保存实际四阶段的小 source attachment context 与三方言同次最终 validators：

1. Nature `cleanedHtml` 仍保留 `10<sup>−</sup><sup>15</sup>`。已有 `collectNumericSuperscriptRun` 要求当前 SUP 自身为 signed digits；sign-only − 被拒绝，下一 digits SUP 的 previous sibling 又不是 numeric text，因而未形成 typed numeric run。
2. Actual accepted ac86 `finishClip` 通过 `defuddleToMarkdown(page.document)`，converted fragment 为 `10 <sup>−</sup> <sup>15</sup>`，两个原 nodes 被 presentation spaces 隔开。
3. `normalizeMath` 不改变这两个 DOM-tag fragments。
4. `normalizeAcademicInline` / `renderRange` 首次生成 `10$^{−}$ $^{15}$`。`combineLiteralPowers` 只识别一个 fragment 内 signed digits，sign-only 第一 fragment 不合条件，无法恢复原一个负指数。最终 real clip 与该 attachment context 一致。

外部 trace 是只读因果诊断，不作为永久第二条 clip pipeline。永久 tests 始终真实调用 `clipNature`；三个最终输出来自一次 test same-run receipt，trace 没有额外重跑三个 dialect。

**未应用提案**：在现有 Nature scientific DOM recognition 边界，仅对真实 contiguous sign-SUP + digits-SUP 与明确 preceding numeric base 建立一个 typed negative-power role，复用 existing semantic marker/conversion。不得令通用 `scientificTex` 自动串成 `10^{−}^{15}`，不得全局合并 dollars、扩大到 unknown wrapper/whitespace/citation/opaque，也不得伪造科学输入或放宽 validators。具体最小 patch 由 root 释放生产 gate 后 owner 执行；此提案不是已接受实现。

## 命令、日志、错误与复用界限

External evidence root：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-split-power`。原 raw 仍在 B external root `academic-clipper-issue10-agent-b`；不要把任何 full captures/cache/生成文件写入 Git。

| 实际命令/检查 | 结果 |
| --- | --- |
| `gh run view 37681190063 --repo uwougil/Academic-clipper --json headSha,conclusion,jobs`；Secrets 对应 `37681189875` | accepted exact SHA / success，三 jobs success |
| `gh issue list --repo uwougil/Academic-clipper --state all --limit 150 --json number,title,state,labels`；`gh issue view` 48/56/57/60/61 | open+closed semantic duplicate scope 核验，无等价合同 |
| `gh issue create ... --label bug --body-file <external-root>/issue-body.md`；`gh issue view 63 ... --json number,title,state,labels,body,url` | create/readback success、OPEN bug；body 为独立窄合同 |
| `npm ci` | exit 0，65 packages；现有 lockfile 的 1 high dependency advisory 原样保留，不做 dependency/audit fix；这不是本 source-only diff 引入 |
| `node <external-root>/freeze.mjs` | 最终 77 blocks/62731 bytes/hash、6 creators/58 refprefix、raw及source prehash/rights、repeated/idempotent PASS，未 acquisition |
| `node --test --test-name-pattern '^source split-power excerpt' test/nature-split-power.test.mjs` | 1 source-integrity PASS、785.004 ms；未调用三个 real clip，不冒充完整 focused |
| `$env:SPLIT_POWER_RECEIPT='<external-root>/actual-ac86-final-receipt.json'; node --test test/nature-split-power.test.mjs` | 上述最终 9 / 6 PASS / 3 FAIL，test exit 1；same-run external 3 result cache |
| `node <external-root>/finalize-diagnosis.mjs` | exit 0，从已保存实际 stage capture 固化4 stages/三 final caches，未新增 converter/clip |
| `git diff --cached --check`；protected-path diff；source commit 后 `git status --short` | exit 0 / protected diff为空 / clean |
| `npm test`、build、golden、新 CI、PR | **未运行/未创建**：仅 source-only RED checkpoint，按 root 授权避免将 incomplete bug 送宽范围验收。未来最终 implementation 十项门槛全部仍必须执行 |

最终 `focused-red-final-confirmed.log` 5482 bytes / SHA-256 `ac2eb1a0a4400d3774803cabc2fded0a8245dcd4a2ccccb2a0cfb0c2a6018865`；同次 `actual-ac86-final-receipt.json` 98340 bytes / `a742fdb2c03a799825cf63f9f88b7dc9210bb4e12e74ecae3082fa02007507a4`；实际 corrected `diagnosis-inspection.json` 27038 bytes / `db95f40689caa16e0d78528dd101f7a67fa86da23e77053df19360e2df6aa868`。这些只证明本新 excerpt 与 scope，没有 C9/27/full corpus 新验收，不能当 final caches。

初始错误保留在外部日志且不计 parser failures：helper checkout CRLF 与 Git hash domain 混用；初始 p33 selector 非唯一（8节点，后改成源属性稳定唯一 selector）；最初遗漏 canonical block，rights `sourceRawNoticeText` 当时不存在、expected whole-clip citations漏算原 Fig4 citation（后从 source原字段补录 raw notice并直接从 source DOM 有序提取）；raw HTML code case 超出本 scope，换为已有 math-code fragment保护。初始 9 tests 1/8，以及 intermediate 5/4 包含 harness errors，均不是最终 source RED 总数；真实 attachment 三方言始终 RED。Trace 首次传不存在的 `page.bodyHtml` 导致 converter error，实际 ac86 使用 `cleanedHtml`/`defuddleToMarkdown`；随后 assertion 错猜 first-SUP 前没有 space，实际 capture显示两处 space，最终从已保存 stages 校验，未重跑转换去“修”数据。这些脚手架失误没有修改 raw/A/B/C/oracle/production。未来从最终 source commit/日志继续，不重做 initial attempts。

## 后续 gate 与 C unblocking

1. Root 保持 source-only 状态，等待共享 Nature gate（至少 #57 → #60 → #61）实际 accepted Main CI 之后明确释放；仅 commit/old green PR 不等于 accepted新base。Owner 先更新到当时 latest accepted main，不改其他 agent checkout。
2. 独立 reviewer 必须核对这个**新 77-block projection** 的 raw/recipe/source prehash、rights/referenceprefix/fixture hash、repeat/idempotence与 source oracle。B 对原 corpus 或别的 bug excerpt 的核验不替代本新 projection 审核。
3. 最小修复后保留 three-dialect source assertion、source p37 controls与 synthetic boundaries，运行 relevant/full/build/golden 与 fresh CI/Secrets、immutable-head independent review；本 checkpoint 不允许自动 merge。
4. 成功 merged-main CI 后才告诉 SAME C actual accepted SHA + Issue63/source test/source p33/prehash/frozen identity；C 执行受影响真实 Quantum source/validator scope，确认原两个 isolatedSuperscript 解除，同时单列 #60 caption、Greek17或其他仍存问题，不声明 full corpus自动通过。

Greek plain-base scripts、leading isotope61、table caption60、styled adjacency57、compound/parenthesized/fractional powers、AlphaFold/r²SCAN/FRB 科学角色都不在本修复 scope。无需 spec change、人类政策决定或 source reacquisition；当前依赖为 agent-resolvable parser prerequisite / shared file sequencing。
