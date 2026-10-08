# Issue #63 — split negative exponent handoff

当前状态：真实源 p33/p37 的最小生产修复、必要 local focused/affected/full/build/golden 与不同 owner incremental review 已通过；源码/测试精确验证于 `1ea875efe80be3ebc1eacb61510a294a63aff7ce`。唯一 delivery [PR #76](https://github.com/uwougil/Academic-clipper/pull/76) 已建立；fresh CI/Secrets、immutable final publication review、root 十项 merge gates 与成功 merged Main CI 仍待完成。尚不宣称 #63 或 Issue #10 完成。最新验证和边界见本文末尾“增量审查修正与最终 local 验证”。

## 历史 source-only checkpoint

独立 [bug Work Contract #63](https://github.com/uwougil/Academic-clipper/issues/63) 已创建并 read back：OPEN、唯一类型 `bug`。该历史阶段交付为真实来源与永久 RED 复现，**当时没有修复生产实现、没有实现 PR，不宣称 #63 或 Issue #10 完成**。分类为 implementation bug；未证明是哪次 commit 引入的 regression。使用 `create-issue` 完成立项，然后按 `fix-bug` 完成 source/reproduce/prove/diagnose/regression 阶段；root 当时仅授权本阶段，生产修改仍 locked。

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

## 2026-10-08 production checkpoint（增量 review 前）

上文保留 source-only 历史证据；本节描述当前状态。Root 已按 orchestration goal §22 恢复原分支的唯一 Nature production owner 并明确释放 #63 生产 gate。Accepted dependency main 为 `f4a5f2ad74546ea54b990c6080e480871ee98e09`；实际再次查询 main API 同 SHA，Main `37725961177` / Secrets `37725961084` completed/success，Ubuntu Node20 `113144056165`、Ubuntu Node24 `113144056319`、Windows Node24 `113144056321` 均 success。Dependency-only merge `524ba8927fe8d2bd09b4d4eb71292a9bf2d9c41b` 不替代原 source authored commits。

新 77-block source 独立审核已 CLEAR：external `academic-clipper-issue10-review-63-64-source/issue63-source-review.md`，4802 bytes，SHA-256 `124d4443e2165a7df99b164d6636c155e16daa466af343d932a2a99a82b51fa5`；machine evidence 36653 bytes，SHA-256 `97c3c3ba3c8f9675c7894184ed03849f8698976e8028942690b0ffc342b8e0d0`。该 source identity 未变化，恢复后不重复 raw/A/source audit 或原三方言 baseline clips。

新增 ordered commits：

1. `e6305d3f83d86032ba42be7f57f424af95329ade`：40 项明确 synthetic 的 qualification/rejection matrix，复用原 owner 已完成的 `boundary-red-f4a5.log/json`。
2. `314967658d1403f4fbbb2dcfc785244de0a91949`：Nature private collector / typed exponent rendering 和 focused source HTTP/DNS guards。Production `src` tree 为 `ea74e67375491610bdba66767a62c513aebbdee6`，Nature blob 为 `e1e7f088c2910b01a1f8a2670d70b00e19ee575b`。
3. 本节后续 docs-only commit（使用 `git log` 重建），不改变已验证 source/code/test tree。

原 owner 的 synthetic RED terminal log 是 **40 tests / 32 PASS / 8 FAIL / 10658.4171 ms / 0 skip**：6 个 plain sign+digits qualification 失败对应本缺陷；另 2 个 nested-style SUP 项误要求空 `scientificRuns`，但 baseline 实际既有 detached roles 为 `^{−}` / `^{15}`。新 matrix 严格保留这两个已有角色并拒绝把它们合并为 numeric exponent；没有修复其既有 orphan validator 状态。旧 log/hash 原样保留。恢复 owner 未掌握该旧 shell 的 exit receipt，不为补写 exit 字段重复运行；terminal failure text 和 JSON 证明其实际失败范围。

最小修复在 `collectSplitNumericSuperscriptRun` 识别原直接相邻的 sign-only SUP 和 digits SUP，每个 SUP 只有一个原 text child。只接 source token `10` 的明确分隔边界，不接别的 numeric base、identifier/decimal/word tail、source whitespace/comment、wrapped/nested children、citation children、math/code ancestor、literal dollar/backtick context、额外连续 SUP。之后的 typed citation SUP 保留自己的引用角色。返回的 explicit source TeX 是 `10^{<原 sign><原 digits>}`，交给已有 range/semantic marker；generic `scientificTex`、Defuddle、normalizers、validators 不变，避免它把原两个 SUP 串成两组 exponent。ASCII minus/Unicode minus/plus 仅作为明确 synthetic 的同一 signed-integer attachment controls，不冒充新增真实文章。

实际 focused 命令（外部 receipt 环境变量只影响证据写入，不影响 oracle）：

```text
SPLIT_POWER_RECEIPT=<external-root>/green-source-f4a5.json
SPLIT_POWER_RECEIPT_ROOT=<external-root>
SPLIT_POWER_BOUNDARY_RECEIPT=<external-root>/boundary-green-f4a5.json
node --test test/nature-split-power.test.mjs test/nature-split-power-boundaries.test.mjs
exit 0; 49 tests / 49 PASS / 0 FAIL / 0 skipped/todo/cancelled; 1848.4829 ms
```

三方言实际 source clips 每个仅一次并复用同一 promise/result；另有原 synthetic DOM protection 的一次 clip，共 3 real + 1 synthetic。三份完整最终 Markdown 和三 source caches 同次保存。原 p33 单一 `10 / −15` 与 neighboring prose、p37 五个 single-SUP powers、原四 ordered citation clusters `[[58],[58],[8,51],[58]]` 均 PASS。三 source 结果实际四 validators 全 valid，精确 warning 只有 `No equation nodes were detected.`，tables/resources 为空。

Global HTTP、callback DNS、promise DNS guard 均先记账再 throw；after hook 复原三 bindings 并 `syncBuiltinESMExports()`，最后严格检查 ledger 空，即使 resource fallback 捕获异常也不能掩盖尝试。Writer 证明为静态 call graph：tests 只调用返回 result 的 `clipNature()`；不调用 `writePaper()`，不宣称有 runtime writer spy。

External root 仍是 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-split-power`：

| Evidence | bytes / SHA-256 |
| --- | --- |
| `boundary-red-f4a5.log` | 11516 / `9a6957838f11939e024199fcf3fed5cb27da6cc650c5844ce747d7182e1e228c` |
| `boundary-red-f4a5.json` | 365730 / `5e167ba70302c81bbc36200a7f60d3ee242cebaa1d47cdf0ddc7b1185dbf81c7` |
| `focused-green-f4a5.log` | 4096 / `875bcc0b8e9c4158d634b66ddffd6b2526e7fa61bfbaf4d0f6469b587aaf36fa` |
| `boundary-green-f4a5.json` | 365919 / `e059ed8968ec9715f1eb303986a1d9cd755f90ab9fb0baebb831f3fac8f7e17f` |
| `green-source-f4a5.json` | 92793 / `2ef9dea42c8e212949323f4e900ab0543f626228e98bcc17eea0b8934c5ba28f` |
| `green-markdown.md` | 12552 / `b129f16453561224b47607a3a1a1e0578675f1ff869ca2224547ef3c96b93792` |
| `green-links.md` | 13631 / `e29dd7ffce11c8d90626f80bea6244a3b93fec8ad7af052c47377b4e9c60b88a` |
| `green-quarto.md` | 4187 / `88ed712bda5da54cc5227d3317ab40958cc8bf81ec10c6a234cf73179742e5f4` |
| `network-ledger.json` | 177 / `6c839154eab57375eba590f0e749ec1d52d4806e2eca010094e7c343ded332d7` |

`git diff --check` exit 0；3149676 clean。相对 dependency merge 524ba89，fixture/diagnosis/provenance、canonical/plan/PRD/EDD、golden、package/lock、security、clip、normalizers、validators、extension、CI 均无变化。仅 Nature 最小 33-line delta、原 focused test 的 17-line network evidence、40 synthetic matrix 和本 handoff 改动。

**尚未完成**：不同 owner 的 incremental implementation review、affected/full tests、build/golden、新 implementation PR、fresh CI/Secrets、immutable final head review，以及 root 的十 gate merge/main acceptance。按 root 授权先等增量 review CLEAR 再跑一次必要 full/build/golden，不为 checkpoint 重跑 source clips 或旧 source audits；当前不宣称 PR-ready 或 #63 完成。成功 accepted merged main 后 SAME C 才恢复 Quantum source/validators，精确解除 p33 两 orphan SUP；Greek17 等独立缺陷继续保留。没有 spec proposal。

## 增量审查修正与最终 local 验证

上节 checkpoint 的 remaining 状态由本节更新，历史证据不删除。不同 owner 首次增量审查在 `3149676` 找到两个真实 P2：offset0 的 unknown sibling/comment 会把 word/210/0.10/identifier 尾段错当独立10；跨 inline sibling 的 literal math/code opening cue 没被单个 previous text guard 看见。独立 exact-baseline 22 个 parse-only probes 中 11 个新增误推；没有重复 source77/A/raw 或三个 real clips。首次 BLOCKED report 5378 bytes / `04ccb3b71499ce305e12ce381c165878f94b451639fe9bc8d6e3a98522fb5e1c` 与其 artifacts 在 `academic-clipper-issue63-incremental-review` 原样保存。

追加 ordered authored commits：`d5981c5cc7239b0a1c4263c50b035db26cad6a4b`（12 新拒绝 matrix：11 review cases + 1 带空格 sibling opaque case）→ `1ea875efe80be3ebc1eacb61510a294a63aff7ce`（7 add / 2 delete 的 qualification 修正）。新12 cases-only 先在旧314生产真实 RED：exit1，0 PASS / 12 FAIL，953.7069 ms，没有重跑旧49/source baseline。修正要求 offset0 时无任何 previousSibling，并保守检查整个 parent inline text 的 dollar/backtick/fenced-tilde cues；没有复制 math/code parser。原 source、typed range TeX、generic scientific renderer 与其他 collector 不变。

最终 qualification 局限：同 paragraph 内任何 literal dollar/backtick/fence cue 会让这一窄 role 走既有路径，包含 cue 已闭合之后的 plain split10。既有 single-text guard 已保守拒绝同类 context；本合同不声称通用 delimiter parser 或所有任意科学上下文已覆盖。真实 source p33/p37 没有此 literal cue，原 MathJax 已用 typed marker 保护；保留来源正确性，不能把这个 scope 局限藏成 required coverage PASS。若未来真实 source 要求更广识别，须保存新来源证据并独立立窄合同。README 如实记录该运行边界。

不同 owner 第二次 review exact1ea875 CLEAR，zero blocking：`academic-clipper-issue63-incremental-review/delta-1ea875/incremental-review-1ea875.md`，5313 bytes / `f925ab72250818bf0f77606139227a0c1fbdc99dc3280c3005046f6ad402da55`。唯一同22 inputs delta 使先前11误推清零；另6有效 controls 分开记录（3正例 + 3纠正后的 literal controls），不重复正确旧观察；一次 reviewer PowerShell 插值错误的3inputs不计产品证据。有效28 probes均为 synthetic parse-only，0 new source clips/audits/full。

最终 local runtime 精确绑定 code/test HEAD **`1ea875efe80be3ebc1eacb61510a294a63aff7ce`**、src tree **`9a79861e85a539b87da96e08ef855f037348cd64`**、test tree **`3935bbe3265d28bf614a4ded8d30851813e89581`**、Nature blob **`40593974b4ae7d6120c35c40ed6b8ef974b48509`**。Node v24.14.1；没有更改现有 lockfile/已按 `npm ci` 安装的 dependencies。

| 最终必要命令 | 实际结果 |
| --- | --- |
| `node --test test/nature-split-power.test.mjs test/nature-split-power-boundaries.test.mjs` | code change 后必要 fresh source3 clips，每 style 一次；61/61 PASS，1866.487 ms，exit0、0 skip/todo/cancel |
| `node --test test/nature-adapter.test.mjs test/nature-scientific-units.test.mjs test/nature-styled-adjacency.test.mjs test/nature-styled-adjacency-boundaries.test.mjs test/nature-scientific-citations.test.mjs test/nature-scientific-citation-boundaries.test.mjs test/nature-isotope-mass.test.mjs test/nature-isotope-mass-boundaries.test.mjs test/nature-isotope-mass-coverage.test.mjs test/nature-table-caption-clip.test.mjs test/output-quality.test.mjs` | 275/275 PASS，6439.1221 ms，exit0、0 skip/todo/cancel |
| `npm test` | **737/737 PASS，81070.8737 ms，exit0、0 skip/todo/cancel**。唯一 full exec session29335，经实际同 handle 等待到终态；不是仅从 log 推测完成 |
| `npm run build` | exit0；ignored dist output 不进 Git |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0；250 inline / 13 display / 50 refs，四 validators valid，golden 未改变 |
| `git diff --check` / `git status --short` / protected paths | exit0 / clean code checkpoint / spec、source fixture、security、normalizers、validators、writer、clip、dependencies、golden、extension/CI 无变化 |

Full 前清除所有 optional focused receipt environment variables；全量 suite 真实运行，不用 cached clip 替代，不覆盖旧focused缓存。Source3 fresh final cache 与上一fixed cache恰好字节相同，但是 code变更后确实重新运行，不能拿旧byteidentity冒充新runtime。四 validators valid、warnings 唯一NoEquation、ordered citations仍 `[[58],[58],[8,51],[58]]`、refs58、resources/tables[]、record-before-throw HTTP/DNS ledger[]、bindings复原。新MD缓存另存 `reviewed-delta/`，各Markdown bytes/hash同上表，原历史产物不覆写。

External final evidence（仍不提交 full captures/cache/logs）：

| Evidence | bytes / SHA-256 |
| --- | --- |
| `review-boundary-red-3149676.log` | 14174 / `a31bd4f9f5094b907fb7e396c330d18224d7c5f2b69b09f2456431e3a92ae737` |
| `review-boundary-red-3149676.json` | 110364 / `57de5d3f9b7873a332f01e029d98599fbad2dbd330148c06e7a4b7c91354e044` |
| `focused-green-reviewed-delta.log` | 5259 / `dc69e7085cad17876b2cbfee59e67a322a1511ff07f5d4675440a4877a5c3b9f` |
| `boundary-green-reviewed-delta.json` | 475980 / `8f33efc4edd96da6f8a8727a92d94cb89ea8d8b41e2bf3b5734bfdc8528223f9` |
| `green-source-reviewed-delta.json` | 92793 / `2ef9dea42c8e212949323f4e900ab0543f626228e98bcc17eea0b8934c5ba28f` |
| `affected-1ea875.log` | 51371 / `1e5321628ed85e1600aa2dc60da881040fdf017854b49902a5f112eb3521e0f2` |
| `full-1ea875.log` | 92765 / `1ae187b180537db10b75471afdff9d9c1ba9ce0991bcd2d4914a2bd30089d115` |
| `full-1ea875-exit.txt` | 1 / `5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9`（实际0） |
| `build-1ea875.log` | 168 / `a2b090d8b57c0f4eb3698da6e609deea60f71bd1e76a87e31092dabb5a103af2` |
| `golden-1ea875.log` | 3018 / `49fe118cfcf91bcbef91e1ec9ffad67f8807589431c6179ffc5cd1a8f8a36498` |
| `final-local-1ea875-receipt.json` | 9546 / `c64bf6632215df5979cb7c703f21f4e858b1ec590cadbebfc0c4f6ad6471fee8` |

上述 immutable receipt 包含 exact commands/heads/blobs/terminal exits、full session、四 validators/citation/cache/network/writer事实、全部log hashes和protected scope，后续 docs-only/head CI 审核可在相同 source/code/test tree 上复用。原源77 audit、旧40RED、49GREEN、第一次BLOCKED、12新RED全部保留，不重做。最后 docs-only commit 用 git log 重建，除本文与 README 外无新 runtime变更。

目前 local implementation / incremental review 已通过；下一步唯一 `Refs #63` delivery PR、fresh 三平台 CI/Secrets、different-owner immutable final publication review、root十 gates后合并与 merged-main CI automation 尚须完成。Owner 不自行 merge 或关闭合同，不宣称 Issue #10 complete。
