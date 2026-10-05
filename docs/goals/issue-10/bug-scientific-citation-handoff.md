# Issue #56 — 科学表达式旁 citation SUP 的 source-only handoff

状态：`SOURCE_ONLY_RED_NOT_FIXED`。独立 Work Contract 为 [Issue #56](https://github.com/uwougil/Academic-clipper/issues/56)，type `bug`，仍 open。此检查点只交付源摘录、永久 RED、因果诊断及未应用提案；不是最终 delivery PR，也不完成 Issue #10。下一生产写入须由 root 释放 Nature gate，目前按 #53 → #55 串行。

## Checkout 与权威边界

- Own managed worktree：`C:/Users/guoli/.codex/worktrees/issue-10-scientific-citation/academic-clipper`；branch `codex/issue-10-bug-scientific-citation`。
- 从 accepted `e2d32e9ec819692a1f08075636c3a168f15ad20b` 开始；root 核验新 accepted 后 `git merge --ff-only 6b90413d806f7e611b00559c8208f6b95b31dd1e`，保留未提交科学摘录 bytes。冻结 base 为 exact `6b90413`：Main CI [37323651988](https://github.com/uwougil/Academic-clipper/actions/runs/37323651988) 的 Ubuntu24 `111808767556`、Windows24 `111808767880`、Ubuntu20 `111808768068` 与 Secrets [37323651876](https://github.com/uwougil/Academic-clipper/actions/runs/37323651876) 全 success。
- 已读 actual `AGENTS.md`、PRD §3、EDD §2.3–2.5、immutable canonical `docs/specs/issue-10-nature-corpus.md`、execution plan、B handoff 和 C `bc81a28` handoff。采用 `create-issue` 的 `human-settled-intent` intake 与 `fix-bug` evidence-first protocol。GitHub remote/account、all open/closed Issues、既有 type labels 已核验；#47/#48/#51/#53/#55/#6 与此行为不同，没有 equivalent duplicate；#56 create 后已 `gh issue view` 核验。
- PRD 的原 TeX/正文引用/References 与 canonical source citation order、scientific identity/attachment 支持 implementation bug 分类。未证明引入 commit，因此不称 introduced regression。无需 PRD/EDD 语义变化。
- 旧 #47/PR #49 checkout/branch 没有触碰；无 production、B/C oracle/input、canonical/intent、安全/validator/CI、golden 或 generated 文件改动。没有 live source acquisition、global fetch monkey-patch 或 full raw captures。

## Immutable source 与复用证明

原匿名 bodies 只读位于 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-b`。本任务 reports/原始 RED/trace 位于 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-scientific-citation`。源文章 URLs、真实完整 ordered authors、每篇自身 CC BY 4.0 notice 和版权/变换说明见 [fixture README](../../../test/fixtures/nature-scientific-citations/README.md) 及各 provenance。Quantum 6 authors、chemistry 9 authors 均由 actual raw metadata 独立核验；没有借用其他文献的 119 authors 或通用 footer 当 article rights。

| Own immutable excerpt | Bytes / SHA-256 | 保留 source roles |
| --- | --- | --- |
| `quantum.excerpt.html` | 65,179 / `3fdd325ba36f107ecdcdbc4643e3bda22350091565de75bf9b169ea36df6f277` | complete Results p18、Discussion p1；原 MathJax bases 与 citation SUP；4 ordered paragraph clusters；refs prefix 1–64 |
| `chemistry.excerpt.html` | 59,993 / `a98b1bc64cb0b86e90225ea4d3a0d1071da3fe195d53ad54c1fdf86ad9693b98` | complete Results p2；原 bold compound 2 与独立 citation SUP；6 ordered clusters；refs prefix 1–35 |

总 125,172 bytes。两个 recipe 均由实际 A helper 处理 untouched source complete paragraphs、原 headings/ancestors、metadata 与必要完整 references prefix；无 figure/table/image/PDF binaries。raw hashes：Quantum `6b2bb78e5f3038d6281eac00b60dc90aa58bdd9ac185ca2d4b9b0de362bbe28e`（511,799 bytes），chemistry `a02d82acb4cdbde085e07ca0c276383894e7a7832c6830ad7a212f450926d88d`（460,171 bytes）。源选择、rights/prehash、UTF-8 fatal decode、repeat equality 和 idempotence 的有效 audit 已完成；遵守 root durable `2445ae2` 的增量规则，base 更新后不重复采集/生成/全部 source audit，仅对既有 receipt/hash 做 identity 核对。

实际只读 A helper `scripts/lib/nature-corpus-infrastructure.mjs` 的 B `b718fa8` Git blob 与工作文件 hash-object 均为 `e56f140d9756bb83013b9df0716dc650e04d7917`，versions 为 sanitizer `1.1.0` / serializer `1.0.0`。B final scientific `143fc77` + provenance-only `b718fa8` 与 C exact `bc81a28d8edf05bbba06b1a82cdedcde3d6f8ac6` 两原 article excerpts 的 Git blobs 相同：Quantum `a2030bd4dd4cb72343b9b7a7d5e9d23b68d7f8e8`、chemistry `d049ece2e34c1246b8a9c420df3b213216f45504`。B/C source-evidence blobs不同，B `b718fa8` 补了完整 rights provenance；不把它们说成 identical。具体四 provenance blobs、C handoff blob、own recipe/raw/fixture hashes 和合法 RED logs SHA 保存在 [checkpoint evidence](../../../test/fixtures/nature-scientific-citations/checkpoint-evidence.json)。原 source bytes、rights、recipe 不变，所以后续只需按变化 delta 决定重新审计。

## 三个 actual source triggers

Indices 为 C/B 既有 section paragraph order 的 zero-based locator，并非自建编号。provenance 的 unique CSS selector 和 anchor IDs 消除 scope 枚举的歧义。

| Article / source-citations-v1 | 原 paragraph prehash | Frozen paragraph hash | 原 attachment roles |
| --- | --- | --- | --- |
| Quantum cluster37 / Results `a-section-2` p18 | `9461453468d164c47c8d6b64843c5578c260bf0251b713796d45fb36cbd74963` | `b226cfc00f5f696516b68092ae4701b4222124e54ea965f7ec5bed543af3df16` | source MathJax alpha prime，后接独立 SUP 两 anchors 58/64，再接原 prose；paragraph clusters `[63] [58,64] [30]` |
| Quantum cluster57 / Discussion `a-section-3` p1 | `697d3fbbdcb78ca7ee69c7d85b72b370e185ec3bb260def1aa04aa4962b1c6e4` | `9e6e99e09e8e4cd9e96b870d4c245f5ffb96a2a504c17d8ad5036e8d3b0975e8` | source MathJax `J_m = sqrt(nbar) kappa_2 / 2 epsilon`，后接独立 SUP 42/58，再接原 prose |
| Chemistry cluster40 / Results `a-section-2` p2 | `40052f20434e9ebfb090e55429d3a20e47553d31afe92b047c485808ba6e64a3` | `74e0d28852386fd8165404fa8a38afcb94b49979f2c5dd9f9f3cb457bb3df00e` | source `<b>2</b>`，后接独立 SUP 33/34，再接原 prose；paragraph clusters `[21,28,29] [30] [31] [32] [33,34] [35]` |

表中数学文字仅解释 source roles；exact 原 TeX、base/source cluster subtree hashes、original href/IDs、following text 均来自 provenance，未由本 handoff 重建科学 DOM。三个 trigger 的 raw/frozen digest 与 C checkpoint 相同。

## First-invalid-stage 因果链

既有外部 `trace-stages.mjs` 使用 Node inspector 在 `replaceScientificRuns` 前、`range.extractContents()` 与 scientific runs 后/citations 前设 breakpoints，读取 clone Range；生产实现未注入 tracing 代码。trace 与 adapter exact Git blob identity 支持复用：e2 与 6b 的 `src/adapters/nature.mjs` 均为 `7757ed87fb64573c8e1bd706fbee4aaa041dea7c`。

1. source typed citation SUP 直接跟在 original MathJax marker 或 bold scientific base 后，二者都是实际 sibling nodes。
2. `collectMathMarkerRun` / `collectStyledRun` 的 `isElement(..., SCIENTIFIC_ATTACHMENT_TAGS)` 仅检查 SUB/SUP tag；缺少与 later `replaceCitations` 相同的 citation cue exclusion。
3. 最先 invalid transition 为 `replaceRangeWithScientificMarker` 的 `range.extractContents()`：Range 把源引用 SUP 及两个原 anchors 一起从正文拿走。此时引用 identity 已不可由 later pass 保持。
4. `scientificTex()` 递归只保留 anchor text，SUP 变成 `^{...}`。实际错误 runs 为 `{\alpha}^{{\prime}}^{58,64}`、`{J}_{m}=\sqrt{\bar{n}}{\kappa}_{2}/2\epsilon^{42,58}`、`\mathbf{2}^{33,34}`。
5. 原 Quantum clusters `[63] [58,64] [30] [42,58]` 在 citation pass 前已变为 `[63] [30]`；原 chemistry 六 clusters 丢掉 `[33,34]`。Defuddle 和各 dialect 只消费已经错误的语义，不是根因。

`collectDetachedSuperscriptRun` / `collectNumericSuperscriptRun` 现有局部 guard 仅检查 data-test，不覆盖 href-only；其他同一 scientific-node eligibility callers 也应在一次边界审查中检查，不通过数值或科学文本猜 citation。Quantum 现有 lexical validators 仍可 PASS，故必须保留 source identity/attachment 的显式断言。

## 未应用最小提案与完整边界审查

候选生产修改仅 `src/adapters/nature.mjs`；此 source-only commit 未应用该提案，也未宣称 GREEN。在既有 scientific `isElement` eligibility boundary 排除包含 later citation pass 两种 selector cue 的 SUP，让 scientific range 在 typed citation 前结束，继续复用原 `replaceCitations`、Defuddle、normalizers。提案示意（未应用）：

```diff
 function isElement(node, tags = SCIENTIFIC_TAGS) {
-  return node?.nodeType === 1 && tags.has(node.tagName);
+  return node?.nodeType === 1 && tags.has(node.tagName)
+    && !(node.tagName === 'SUP'
+      && node.querySelector('a[data-test="citation-ref"], a[href*="#ref-CR"]'));
 }
```

这是反事实假设：仅资格判断改变，应保留原 anchors 至既有 citation pass，而 genuine scientific SUP 不含这些 cues 继续参与科学表达式。未改 pass order、TeX renderer 或源 science 内容。下一 owner 必须以一次性矩阵和实际修复后 focused green 验证此假设，不能把这份提案当生产验收。

| 边界 | 当前 source-only 证据 / 下一生产验证 |
| --- | --- |
| 原 MathJax 与 bold base 后真实多-anchor SUP | 三 actual source cases × adapter/三 dialect，原 12 行 RED；保留 intrinsic prime、epsilon 和 compound identity |
| 两个现有 selector cues | 仅移除实际 anchors 一个属性：data-test-only 与保留 exact actual href 的 href-only，各 12 行 RED；清楚标为 synthetic attribute variants |
| 非 citation scientific SUP | 同原 paragraph 的 `<i>e</i><sup>−2<i>r</i></sup>`，adapter/三 dialect 4 PASS；neither cue、不按数字文本排除 exponent，原 alpha intrinsic prime 同时保留 |
| 多 href prefixes / ranges | 原 relative article href 已真实覆盖；下一实现检查同 anchors 的 fragment-only、same-article absolute URL representations 和现有 range regressions，作为 laboratory boundary variants，不编造 publisher source rows或重编号 |
| whitespace、italic mixing、多个 science attachments | 从完整原段落提取合法已有 nodes/attachment 作为负控，受控 whitespace variants 明示为 synthetic；沿全部 eligibility callers 定点审查 citation 边界，避免只修 data-test 而漏 href |
| 原 MathJax opaque 内容 | 原 alpha intrinsic prime 和原复合 MathJax TeX 保持自身科学 identity；没有 citation cue 的真实数学指数不能因 numbers 看似 references 被拆开；不重写原公式 |
| 不在此合同内的机制 | adjacent styled-run 合并、leading isotope、plain units、table-caption、materials source context/rawHtml、sparse alt 与 complex chemical base 单独诊断/合同，不乘机修复 |

所有未来 boundary additions 应在生产代码写入前一次审完，并复用 immutable source audit/实际已有 regression。没有 source/base/code 变化时不重复 full；生产/base 变化后依 user policy 运行相关验证及必要的一轮完整验证。

## RED / verification receipt

Windows Node `v24.14.1`、npm `11.11.0`，Node ≥20 和 committed lockfile；`npm ci` 已于 e2 PASS（65 packages，0 vulnerabilities），6b dependency/lock 无变，不重复安装。没有 HTTP/DNS/table/image/writer 操作；摘录不含资源 nodes，fixture clip 完全离线。

| 命令 / 阶段 | 实际结果 |
| --- | --- |
| `node --test test/nature-scientific-citations.test.mjs`，accepted e2，合法旧 RED | exit1；13 tests = 1 source PASS / 12 behavior FAIL / 0 skip；`red-corrected-integrity.log` SHA-256 `4f4abcde91cb3508292ad76e6b136dbe2df7fcdd364706e8bf54ec050d79434d` |
| 同 focused command，accepted 6b，仅一次新矩阵运行 | exit1；41 tests = 5 PASS / 36 FAIL / 0 skip；原 13 行不变，增加 24 selector-boundary FAIL + 4 actual scientific negative-control PASS；`red-accepted-6b-matrix.log` SHA-256 `4886858be88c7e0fd3ca81d1b05a5974391e6c67404a4bde44b4d32b9f5de011` |
| 原 source/hash/rights/recipe/repeat/idempotence audit | 复用既有有效 `source-proof.json`、`prepare-excerpts.mjs` / `freeze-receipts.jsonl`；fixture bytes 与两个旧 receipts 相同，actual A helper/B/C excerpt Git identities 已记录，没有重造 source |
| `npm test`、build、golden、新 PR CI/Secrets、independent review | 本轮未运行：source-only、无生产变化，用户明确要求复用有效检查并保留 full slot 给生产作者/reviewer。GREEN delivery 阶段全部仍必须满足，不能以本 RED checkpoint 替代 |
| diff/status/filename audit | `git diff --check` / `git diff --cached --check` PASS；10 个新增 owned files，只有本 handoff、fixture README/receipts/两合法 excerpts/provenance、永久 test；`src`、canonical/intent、B/C、golden、security/validators diff 空；无未预期的 staged/untracked files |

永久测试执行所有生产 clip validators，并显式保护选定 citations/order/adjacent source base、prefix count、定义/BibTeX、零 raw HTML/markers 及 Quantum scientific validators。Chemistry 没有被当作 full paragraph PASS：source complete block 自带下面的独立 `Pb(OAc)4` scientificFragments FAIL，每个 whole clip 将其在 citation assert 前打印。没有弱化生产 validator、删除 source node 或用 compiler-only/lexical-only PASS 替代 semantic identity。

历史 harness/test correction 如实保存：最早 integrity assertion 错把 ref-CR ID 当作 LI 自身 ID；实际 raw/frozen id 在 LI 内 P 上。独立核实后只修 own assertion，`red-baseline.log` 的 0/13 不计为合法 citation RED。`diagnose.mjs` 初始括号 SyntaxError 修在外部 harness，没有生产更改；后来合法 1/12、source audit 与 stage trace 都保留。6b 矩阵不修改 source assertions 的 numbers/base/context 来换绿。

## 独立 chemical-base failure packet

`independent-chemical-base-packet.json` 保存 chemistry 同 complete paragraph 的准确独立问题：原 `Pb(OAc)<sub>4</sub>`，raw/frozen 各只出现一次；base Text child12 offset74、SUB child13、paragraph text index378，原序列 SHA-256 `3321e536f10a05c67e23e8f618214d0490c189f141bb4913895283db96af9424`，SUB subtree SHA-256 `434bb0e29512b0d2713621b156811d15313a1da74b72e5ddfb0ab617346b04f3`。它附着于化学 text base `Pb(OAc)`，不是文献 citation SUP。

e2 与新 accepted 6b 均输出 `Pb(OAc)$_{4}$`；production `scientific-isolatedSubscript` 在 markdown/links line25 column464、quarto line26 column464 报 FAIL。只记录原角色与 attachment 要求，不编写一种新化学 TeX 作为 oracle。该 packet 不成为 #56 修复责任，不修改 validator，也不伪报 chemistry 整段通过；root 可据完整独立 raw/frozen evidence 安排另一个 bounded Work Contract。

## 恢复与交付

root 释放 gate 后，同一 branch non-destructively 接入当时 latest accepted main；immutable source bytes/recipe/rights 没变时复用本 audit，base/code delta 需要复跑受影响 RED 和上述完整 boundary matrix。实现最小正确 repair后跑 focused/affected、一轮适用 `npm test`、build、committed golden、diff/status/filenames，然后一个最终 PR 必须 exact standalone `Refs #56`，fresh exact-head 三平台 CI/Secrets 与 independent zero-blocking review。子代理不 merge；成功 merged Main CI 后由现有 automation 完成 Issue。
