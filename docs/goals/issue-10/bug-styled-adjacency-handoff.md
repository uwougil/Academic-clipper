# Issue #57 — Materials styled-adjacency delivery handoff

当前状态：`IMPLEMENTED_LOCAL_GREEN / REVIEW_PENDING`，2026-10-07。独立 [Issue #57](https://github.com/uwougil/Academic-clipper/issues/57) 的最小实现与回归已交付；独立 exact-head review、fresh PR CI / Secrets 和 root merge gate 尚待完成。本 agent 不 merge 或宣称 Work Contract / Issue #10 完成。以下本轮结果优先；后面的 2026-10-05 source-only 记录保留为原 RED / 来源 / 未应用提案的历史证据。

## 2026-10-07 实现、基线与验证

新的 accepted implementation base：`ac86b2fa509653dfeb43b968472ce6280a51de2c`。Root 明确核验 [Main CI 37681190063](https://github.com/uwougil/Academic-clipper/actions/runs/37681190063) 在 `2026-10-07T20:28:26Z` 成功，Windows Node 24 job `112997400634`、Ubuntu Node 24 `112997400858`、Ubuntu Node 20 `112997401004` 全 SUCCESS；[Secrets 37681189875](https://github.com/uwougil/Academic-clipper/actions/runs/37681189875) / job `112997360655` SUCCESS。Issue #56 automation 在 `20:28:37Z` completed 后，root 明确释放本 #57 的 Nature 生产文件 gate；#60/#61 继续锁。Pending 时本 owner 只做静态读取，没有冻结 pending base、生产写入、重采来源或重复原审计。

Own worktree / branch 仍为下文的独立 `issue-10-bug-styled-adjacency`。`05be27e158b9e2de35ffc777a04f05326296e951` clean checkpoint 非破坏 merge accepted ac86，merge commit `78d0eb981a5117fd98aaf2355b59e8f50bf6826d`；原 source commits、摘录、provenance、recipe、observed failure / 16-row matrix 全保留。没有改 A/B/C corpus、oracle、canonical spec、intent、安全、writer、normalizers、validators、dependencies、golden 或 CI。

实现 commit：`7fc1cb20af05014c20b3738719728fa4775fdb05`。Production 只改 `src/adapters/nature.mjs::collectTextAndStyledSymbolRun()` 的 21 行 diff（20 additions / 1 deletion），延长同 parent 中零空白连续的完整 digits + pure I/B source pairs，将原 `128x0e` / `64x1x` / `32x2e` 各置于一个既有 scientific DOM range。既有 `scientificTex()` 仍逐原节点读取数字与 italic/bold style，不添加 SUP/SUB/times，不按最终 dollar strings 推断/合并。遇 whitespace、operator、wrapper、opaque typed marker/code 就停止。若候选 styled base 紧随真正 SUP/SUB（包括间隔原 whitespace），留给既有 attachment collector；reference SUP 沿用 accepted #56 的 `isElement()` 两种 citation cue 保护。

新增永久边界回归：`test/nature-styled-adjacency-boundaries.test.mjs`，复用原 16-row matrix，加 4 个明确 synthetic tail SUP/SUB / zero-gap / whitespace controls。Constructed controls 仅作用 disposable clone，不是 scholarly source；source assertions 仍来自原完整 p37 / Equ1。新的 20-row baseline 是 17 PASS / 3 真正分组 RED；#56 已恢复 citation identity，但该 control 的相邻 dollars 在 #57 修复前仍 RED。最小 patch 后 20/20 PASS，原完整真实 source 8/8 PASS。

修复后的 actual source model：`$128x0e$ + $64x1x$ + $32x2e$`。保留全部有序数字、六个原 italic letters、source zero gaps、原 U+2009 / plus 分隔，未猜 exponent/乘号。三方言 math valid=true、source/actual display 1/1，原 `Equ1` identity / exact semantic TeX / 既有 allowed font rendering、indexed distance、真实 powers、独立 terms、全部 ordered citations / 68 refs、warnings/resources 保持。

| 当前 actual dialect | source/actual display | math | structure | raw HTML | crossrefs |
| --- | --- | --- | --- | --- | --- |
| markdown | 1 / 1 | PASS | PASS | PASS | PASS |
| links | 1 / 1 | PASS | PASS | FAIL，独立原 Ref2 literal `<` | PASS |
| quarto | 1 / 1 | PASS | PASS | PASS | PASS |

原 Ref2 links HTML audit FAIL 未隐藏或重写，Materials source-citations context row 仍独立；不能把 #57 的 GREEN 声称为完整材料论文 / corpus 全部通过。原相邻两个 synthetic opaque MathJax inline 仍有独立 malformed dollar state，永久 boundary test 只保护两项 typed identity / 原 TeX，不断言该独立缺陷已解决，实际 math=false 明确输出 diagnostic。这不是 admitted scholarly source、没有放宽 validator；本实现不负责缺少真实来源的新 generic adjacency bug。

当前 actual commands / results（external logs 仍在下文目录）：

| 命令 | 结果 / log |
| --- | --- |
| `npm ci` | exit0；65 packages，沿用 committed lockfile；`npm-ci-ac86.log` |
| `node --test test/nature-styled-adjacency.test.mjs`（新 base、未改 production） | exit1；原 8 tests，5 PASS / 3 source RED；`focused-red-ac86-original8.log` |
| `node --test test/nature-styled-adjacency-boundaries.test.mjs`（未改 production） | 最终 exit1；20 tests，17 PASS / 3 RED；`boundaries-red-ac86-final.log` |
| `node --test test/nature-styled-adjacency.test.mjs test/nature-styled-adjacency-boundaries.test.mjs` | exit0；28/28 PASS；`focused-green-ac86.log` |
| `node --test test/nature-adapter.test.mjs test/nature-scientific-citations.test.mjs test/nature-scientific-citation-boundaries.test.mjs test/nature-literal-brackets.test.mjs test/nature-scientific-units.test.mjs test/nature-caption-citations.test.mjs test/nature-table-mathjax.test.mjs test/nature-table-notes.test.mjs test/nature-sparse-figure-alt.test.mjs` | exit0；184/184 PASS；`affected-green-ac86.log` |
| `npm test` | 唯一 full session `65796` actual terminal exit0；460/460 PASS、0 skip/todo/cancel、`77138.9269ms`；`full-green-ac86.log` |
| `npm run build` | exit0；extension build PASS；`build-ac86.log` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0；committed golden 只读 PASS；`golden-ac86.log` |
| `git diff --check` / cached check / status / filenames / protected paths | PASS；仅单函数生产修改、独立来源/测试/交接，原来源 bytes 未变 |

所有 tests 无 skip/todo/cancel。Boundary 首次 baseline 的两个 assertions 漏保留 opaque source 的单 `$` 外层（实际 semantic raw TeX 是 `$e^{0}$` / `$x$` / `$e$`）；首轮 `boundaries-red-ac86.log` 保留。只更正了 test 的原 source-identity expectations，未改 source/parser/validator，再形成上表有效 17/3 RED。没有把 harness 错误当新 parser defect。

`npm ci` 同时报告原 accepted dependencies 的一项新的外部 high advisory；独立 `npm audit --json` exit1 / `npm-audit-ac86.json` 指向 transitive `source-map-js` / [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)，affected `>=1.0.0 <1.2.2`、indexed source-map section offsets event-loop denial of service、fixAvailable。原 package/lockfile 与 ac86 完全相同，已交 root 独立处理，本 #57 没有修改依赖或隐瞒 audit；上述 test/build/golden PASS 不代表该 advisory 已解除。

Ordered owner commits：原 `e0425efa412cf72391a9bc04b0c0c1a485fd768f` → `05be27e158b9e2de35ffc777a04f05326296e951` → accepted-main merge `78d0eb9...` → production / boundary `7fc1cb20af05014c20b3738719728fa4775fdb05` → 包含本更新的交接 commit。最终消息/PR metadata 给精确 pushed head 与 fresh PR CI / Secrets run IDs；本手册不自引用最终 commit SHA。一个独立 final PR 使用唯一 standalone `Refs #57`，没有 `Refs #10` 或自动关闭关键字；任何后继独立 review findings 要求同 owner 在同 PR 修复、fresh exact-head checks，作者不 merge。

Agent C 解除本 row 的条件仍然严格：生产修复经 root review / fresh CI 门槛接纳且 merged Main CI 成功后，C 自己对同 truthful Materials source / oracle 跑三方言 source-equations consumer，确认唯一真实 display / original Equ1 与有效 math / source symbols 后，才解除 `ADJACENT_INLINE_DOLLARS`。其它 Materials citation-context / links Ref2、不同机制以及整体 Issue #10 不由本窄修复完成。Spec changes：无。

## 2026-10-05 source-only 历史记录

状态：`SOURCE_ONLY_RED`，2026-10-05。独立 [Issue #57](https://github.com/uwougil/Academic-clipper/issues/57) 已建立并回读为 OPEN / bug。仅来源摘录、严格失败回归、诊断观察与未应用提案；没有生产修复、实现 PR、merge、Issue completion 或 Issue #10 完成声明。

## 基线与所有权

- Accepted base：`6b90413d806f7e611b00559c8208f6b95b31dd1e`。先从已接纳 `e2d32e9ec819692a1f08075636c3a168f15ad20b` 创建 managed worktree；确认 6b 的 Main / Secrets 完成后，仅本 clean branch `git merge --ff-only 6b90413...`。
- 独立查询 [Main CI 37323651988](https://github.com/uwougil/Academic-clipper/actions/runs/37323651988)：同一 6b head，Ubuntu Node 24 job `111808767556`、Windows Node 24 `111808767880`、Ubuntu Node 20 `111808768068` 均 success。[Secrets 37323651876](https://github.com/uwougil/Academic-clipper/actions/runs/37323651876) / Gitleaks job `111808766995` success。
- Branch：`codex/issue-10-bug-styled-adjacency`。
- Own worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-styled-adjacency/academic-clipper`。
- 新 managed worktree operation：`2fe708b3-133b-4c3d-b4c8-ce2f7120d8b5` completed，registration 成功。
- B 仅只读：`C:/Users/guoli/.codex/worktrees/3417/academic-clipper` / `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`。C 仅只读：`C:/Users/guoli/.codex/worktrees/issue-10-offline/academic-clipper` / `bc81a28d8edf05bbba06b1a82cdedcde3d6f8ac6`。旧 Issue #45 / PR #46 交付工作区、branch 和 accepted code 未改。
- 已读 AGENTS、canonical spec、execution plan、PRD/EDD、B/C 完整手册及 `create-issue` / `fix-bug` skills；人类 orchestrator 明确授权独立 bug intake，root 当前只授权 source-only checkpoint。生产 gate 按 #53 → #55 → #56 citation → #57 styled 串行释放。

有序提交：

1. `e0425efa412cf72391a9bc04b0c0c1a485fd768f` — 7 个来源/回归文件：`test/nature-styled-adjacency.test.mjs`、`test/fixtures/nature-styled-adjacency/{.gitattributes,README.md,boundary-evidence.json,failure-evidence.json,s41586-023-06735-9.article.excerpt.html,s41586-023-06735-9.provenance.json}`。
2. 包含本手册的后继 checkpoint commit，仅新增本文件；最终交接列出精确 SHA，避免自引用。用 `git rev-list --reverse 6b90413d806f7e611b00559c8208f6b95b31dd1e..codex/issue-10-bug-styled-adjacency` 重建完整顺序。

## 原始来源、A 接口与合法摘录

Paper：[Scaling deep learning for materials discovery](https://www.nature.com/articles/s41586-023-06735-9)，`10.1038/s41586-023-06735-9` / Nature，B observed `2026-10-03T16:44:22.324Z`。使用 B 已授权的匿名 acquisition 结果，没有新联网、profile、credential/cookie 导入或 live clipping。

来源 locator：B retained block `a-section-6`，`section[data-title="Methods"]` 原 `querySelectorAll('p')[37]`，零起算。完整原段落保留，没有只截取一行或重写正文。Reduced recipe 使用唯一且幂等的 `section[data-title="Methods"] p:has(a[href$="#ref-CR66"])`，不因减少段落而误用变化的 positional index。

```html
128<i>x</i>0<i>e</i> + 64<i>x</i>1<i>x</i> + 32<i>x</i>2<i>e</i>
```

有序原 nodes 是 plain `128` / italic `x` / plain `0` / italic `e`，然后原 U+2009 / `+` / U+2009、plain `64` / italic `x` / plain `1` / italic `x`，再同样 separator 与 plain `32` / italic `x` / plain `2` / italic `e`。这个 run 的 SUP/SUB/times 都为 0；不猜成 `x^0 e`，不加入乘号。六个 italic letters、所有数字、plus、zero gaps 和两处原 operator separation 是独立源 oracle。

| 资源/范围 | UTF-8 bytes | SHA-256 |
| --- | ---: | --- |
| 原匿名 article body | 506351 | `79f575e1941633c2dbd036682977ea6c274acd5c8c44fdb4648856a00a8d7cc6` |
| 原 p37 / A pre-sanitize serializer | 3972 | `6be13b1e3db2cd07f5fc81dfef06fed2ea163e8e64be100b6c958479d74c0dd9` |
| B frozen full article | 201653 | `c997a761f1dea592df1d1b6007d338bf028de4825e48acdd94645cd2eba05517` |
| Frozen p37 / 本摘录完全相同的 p37 | 3572 | `606a4dbc6f17d727f95d873d015c680a39155c48d9d5e7f2fe8dc9f04264b364` |
| 原完整 Equ1 / A pre-sanitize serializer | 748 | `625515b2cd2bb09c0f2c1733dcfa21b70d38505568d5a67f951341c4fd6496c3` |
| 本 reduced article excerpt | 84689 | `2a0e006ed9a5f0e55c2b18bf8ae4ed71ff8a689d45dcdf20a507173b481697d7` |

C 旧叙述的 `606a4dbc...` 已独立确认为 **FROZEN**，不是 raw source prehash。差异来自删除 citation tracking attrs；paragraph text/scientific nodes/引用未改。Root 转交 C 的独立静态 cross-check 也确认 raw `6be13b...` / frozen `606a4d...` 相同；本 agent 没有改 C 手册、inputs 或 oracle。

实际 A 接口来自只读 B 的 `scripts/lib/nature-corpus-infrastructure.mjs`：

- `nature-corpus-sanitizer/1.1.0`、`nature-corpus-subtree/1.0.0`、recipe `1.0.0`、projection `nature-corpus-projection/1.0.0`。
- Helper Git blob：`e56f140d9756bb83013b9df0716dc650e04d7917`；实际 Windows helper file SHA-256：`6fef175f944a6d1abd36be9d8709a128ffe6668603eea6496cf3e38bd7862ea9`（file bytes 与 Git blob identity 分列）。
- A commits：`20b48328114f195974e92827583b6bf5875beb27`、`3754d3a781459635e719859353fe3cbdf8741897`、`8f8a3dbf5d83c1475c41a197bcdfd1bf73834679`。没有 cherry-pick A/B bulk infrastructure 或另写 serializer/sanitizer。
- Recipe SHA-256：`c5e46203c9675446d497eb32a56b1e5aad33fd4f9e23ca8203c06daf2c7f8caf`；structure `6b1f50b7c262fd660c4741161c91611d8201882d06554cdbd6040095941bdaf3`；payload `be51cac01ff1a05335af66b1f82a0ca96b82563eee0212eed3810b07e4731cd3`。

先核验原 Buffer/size/SHA，再 fatal UTF-8 decode、DOM parse、serializeSubtree prehash。首次最小 recipe 从同原 source sanitize 两次，并从 first excerpt 再 sanitize 一次；三个 byte arrays 完全一致，repeat/idempotence PASS。后续复用有效 receipt，不重采或重复同一 hash/rights 审计。

摘录保留完整 p37、Methods / MLIPs 原 headings、原 `Equ1` 和必要原 ancestors、未重编号的完整 References prefix 1–68（该段真实 ordered cites `[30,66,67,68,30]`），article title/canonical/identity/date/journal 与全部作者 metadata。Metadata 原作者顺序：`Merchant, Amil`、`Batzner, Simon`、`Schoenholz, Samuel S.`、`Aykol, Muratahan`、`Cheon, Gowoon`、`Cubuk, Ekin Dogus`。

独立核对原 Rights and permissions notice 文本/links/prehash `84ab88094d2cd6f87d0a2a8abbb091db26a34a50a7701aa2a706a9a1a4b4dafd`，原 [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) notice 保留在 excerpt 和 provenance。Publisher footer `© 2026 Springer Nature Limited` / prehash `09e85accdf125e9c6cb8eae79fe5bae782628f830c5d6ab5515974bd8d45dfd3` 单独记录为 site footer，不冒充 article copyright。原 scholarly material 遵循其来源 license，没有重新许可成代码 license。

技术变化仅选择完整原 blocks/ancestors、A deterministic sorted-attribute UTF-8 LF serialization、其记录的 tracking-attribute sanitization。没有改变 scholarly text、TeX、styling/adjacency、authors、reference data/ordinals。未选其他正文/abstract、figures/tables、author-information/supplementary sections、Refs 69–71、JSON-LD/scripts/其余 metadata、page UI；publisher footer 仅记录。无 full capture、binary、历史 PR #13 evidence、fake article 或网络 replay 基础设施。

## 实际 RED 与最先失效位置

`failure-evidence.json` 是独立的 **实际观察**，不是从 parser 反推来源的 oracle；原 expected source 在 provenance / full paragraph。连续阶段如下：

1. Adapter `collectTextAndStyledSymbolRun()` 在同一个原 parent 中只选择 numeric suffix 和一个 I/B，将一个源 contiguous term 切为 `128x | 0e`、`64x | 1x`、`32x | 2e` 六个 markers，source zero gaps 没有保存在 run 分组身份中。
2. Prepared DOM 与 Defuddle 都保留直接相邻 markers；Defuddle 未新增 dollars 或改变分组。
3. `normalizeMath()` 对每个 scientific marker 独立恢复 `$...$`，首次生成 invalid `$128x$$0e$ + $64x$$1x$ + $32x$$2e$`。
4. 该片段在 `normalizeBlockMath()` 与 academic normalizer 后仍然相同；不能叙述为它们编写/加入 phantom equation。最终 math state machine 因 delimiter collision 读出额外 display。

| dialect | source/actual display | math | structure | raw HTML | crossrefs |
| --- | --- | --- | --- | --- | --- |
| markdown | 1 / 2 | FAIL，4 issues | PASS | PASS | PASS |
| links | 1 / 2 | FAIL，4 issues | PASS | FAIL，原 Ref2 literal `<` | PASS |
| quarto | 1 / 2 | FAIL，4 issues | PASS | PASS | PASS |

Math issues 三方言相同：`inline-display-switch`、两条 `single-dollar-in-display`、`inline-math-crosses-line`。Actual source run 有序文本/italic letters 已存活，仍不能将 invalid delimiters 当成功。

Source controls：原 `r` 的 indexed `ij`、三个 actual `10` powers −3/−4/−5、独立的 `0e + 1e + 2e`、68 refs/该段五次 cites、原 Equ1 semantic TeX 与一次 rendered equation 都通过。Rendered equation 允许 C 既有的 braced legacy `rm` → `mathrm` font rule；原 semantic source TeX 完全相同，不猜造数学。预期 warnings 只有 `No Nature figures were detected.`；figures/tables/DNS/HTTP/resources 全为 0。Reduced source 含真实 Equ1/References，不能预期 no-equation/no-reference warnings。

独立 residual：原 Ref2 中 literal `<x` 在 links HTML audit 仍失败，材料 citation context 尚有单独 C row；本合同不改文字或 validator 隐藏它们。Materials source-equations row 与 source-citations row 必须独立核验，不宣称整个 corpus PASS。

## 兼容边界矩阵与尚未应用的最小提案

`boundary-evidence.json` 的 16 行是固定 accepted-base diagnostics。14 个 constructed rows 明确标为 synthetic、只作用于 disposable clone，不充当 Nature publisher/source evidence。两行使用真实 model fragment 与实际完整 Equ1，typed marker carrier 明确为诊断构造。这些观察不能作为修复后必须重复错误行为的 snapshots。

| 边界 | 当前实际观察 / 后续约束 |
| --- | --- |
| Actual zero-gap `128x0e + 64x1x + 32x2e` | RED；原 zero gaps/六个 italic letters 保持；不得猜造 SUP/SUB/times |
| Synthetic ASCII space / U+2009 space | PASS；分别 `$128x$ $0e$` / `$128x$ $0e$`，不得跨原 whitespace 合并 |
| Synthetic plus operator | PASS；`$128x$ + $0e$`，不得吞 operator/text separation |
| Synthetic genuine SUP / SUB | PASS；`x^{0}` / `x_{0}`，不得变为 plain 0 或和 source no-SUP run 混同 |
| Synthetic bold run | RED，同样 numeric/styled segmentation；必须保留 `\mathbf{x}` / `\mathbf{e}`，不能变 italic |
| Synthetic unknown span wrapper | PASS，`$128x$0*e*`；不越过未知 wrapper 推断 same-parent continuation |
| Synthetic spaced opaque inline MathJax | PASS，typed inline count 1；不并入 styled run 或改 original TeX |
| Synthetic adjacent two opaque inline nodes | 已有独立 RED `$x$$e$`；typed inline identities 2。不全局合并 dollars/markers，也不宣称本 DOM range 提案已修复这个不同输入 |
| Synthetic `$$...$$` span、无 equation wrapper | Nature 实际将它 typed inline；不能凭 dollar spelling 把它标为 display |
| Actual whole `Equ1` typed display | PASS，真正 display count 1；由原 publisher equation wrapper 和 source identity 确定 |
| Synthetic adjacent inline code | PASS，code 内容 `$0e$$1x$` 原样保留，不被 scientific range/whole-string dollar merging 改写 |
| Synthetic legacy inline / legacy display | PASS，分别 inline 与 standalone display；保留既有 legacy math 功能 |
| Synthetic citation SUP/anchor 紧邻 styled term | math guard虽PASS但 citation 变 `e^{30}`、citation identity丢失；属于 #56。等该 fix accepted 后重跑身份检查，不能用数学 PASS 替代 source meaning |

只有 `src/adapters/nature.mjs::collectTextAndStyledSymbolRun()` 需要考虑调整；当前所有 production 文件与 accepted base byte-for-byte 相同。下面是 **UNAPPLIED** 的 narrow sketch，尚未验证实现，也不是授权触碰共享文件：

```diff
   const token = previous.textContent.slice(match.index);
   if (!/^(?:∞|[−+\-]?\d+)(?:\/)?$/u.test(token)) return null;
+  let endNode = node;
+  if (!node.firstElementChild) {
+    let cursor = startIndex + 1;
+    while (cursor + 1 < parent.childNodes.length) {
+      const digits = parent.childNodes[cursor];
+      const styled = parent.childNodes[cursor + 1];
+      if (digits.nodeType !== 3 || !/^\d+$/u.test(digits.textContent)
+        || !isElement(styled, new Set(['I', 'B'])) || styled.firstElementChild) break;
+      endNode = styled;
+      cursor += 2;
+    }
+  }
   return {
     start: { node: previous, offset: match.index },
-    end: { node, after: true },
+    end: { node: endNode, after: true },
   };
```

提议仅将同 parent 中与原 numeric/styled 开头 **零空白** 相连的完整 ASCII-digit text + pure I/B 对纳入同一个真实 DOM range，由既有 `scientificTex()` 读取原节点。原三个候选分别是 plain `128` italic `x` plain `0` italic `e`，不会产生 exponent / times；不跨 operator/whitespace/SUP/SUB、code、未知 wrapper、opaque MathJax 或 citation node。Typed markers 的 text 不是纯 digits，真实 display/citation/source ancestors 不会成为 range continuation。真实 SUP/SUB 优先走既有 attachment collector；不修改它或 `normalizeMath()` / validators，不全局合并 `$$`。

此提案不能声称全局适用/通过，必须在 root gate 后结合最新 accepted #53/#55/#56 实现与 source-derived constraints 做 RED→GREEN。若机制确实需要别的文件或不可分的 typed-opaque behavior，应先报告 root、明确 Work Contract / ownership，而非自行扩张。

## 命令、结果与复现材料

本机 Node `v24.14.1` / npm `11.11.0`。External audit/log 目录：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-styled-adjacency`；原 raw 目录：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-b`。启动前确认前者为空，没有重复已有有效 audit 或覆盖 partial files。

| 命令 | 实际结果 |
| --- | --- |
| `npm ci` | PASS，65 packages、0 vulnerabilities；6b 未改 lockfile |
| `gh run view 37323651988 --repo uwougil/Academic-clipper --json headSha,conclusion,status,jobs` 与 Secrets 同类命令 | 同一 accepted 6b / success；见上述三个 Main job IDs + Gitleaks |
| `node <external>/source-inspect.mjs` | exit0；首次核验 raw/frozen/paragraph hashes，保留 `source-inspection.json` |
| `node <external>/source-freeze.mjs` | exit0；complete paragraph unique selector、creators/rights/license/site-footer raw checks PASS |
| `node <external>/source-freeze.mjs --freeze` | exit0；一次生成 excerpt / recipe / `freeze-receipt.json`，repeat/idempotence PASS；使用 `wx` 防覆盖 |
| `node <external>/stage-probe.mjs` | 三个完整实际 clips 和 stage JSON/Markdown 全已保存；最初随后打印 formatter 错误 exit1（HTML guard 字段为 `violations`，不是 `issues`） |
| `node <external>/stage-probe.mjs --report-only` | formatter 修正后 exit0，仅读取/报告既有有效三 clips，不重复捕获；`stage-probe-reused.log` |
| `node --test test/nature-styled-adjacency.test.mjs` | 最终 exit1；8 tests，5 PASS / 3真实 source RED，0 skip/todo/cancel；`focused-red-6b90413-final.log` |
| `node <external>/boundary-probe.mjs` | exit0；15 actual/constructed diagnostic rows、完整 output / source identities / math states |
| `node <external>/complete-boundary.mjs` | exit0；独立 actual Equ1 restoration control PASS，16 rows与三方言 observations 持久化 |
| `node --check test/nature-styled-adjacency.test.mjs` | PASS |
| `gh issue list ... --state all` / semantic search / 53、56 Work Contracts / labels / auth | open+closed duplicate检查完成；没有等价 styled contract；auth/bug label有效 |
| `python C:/Users/guoli/.codex/skills/create-issue/scripts/gh_issue.py --repo uwougil/Academic-clipper create --title "[bug] Nature 相邻 styled scientific runs 产生连续数学分隔符" --label bug --body-file <external>/issue-body.md` | exit0，Issue #57；完整 `gh issue view 57 ...` 回读并保存 |
| `git diff --cached --check` / `git diff --check` | PASS |
| `git diff --quiet 6b90413... -- src docs/specs docs/PRD.md docs/EDD.md package.json package-lock.json .github papers` | exit0；生产/意图/validator/security/CI/deps/golden 均未变 |

首版测试日志 `focused-red-6b90413.log` 保留。它有 4 个 harness assertion 错误：原 `ref-CR*` IDs 在 LI 的子 P，并且本 agent initially忽略了 C 已允许的 braced font normalization；仅修正 test expectations，fixture bytes/hash 未变。最终 3 source RED 与初次有效 stage trace 相同；不把 harness 错误当 parser defects，也不删除首次失败证据。

此阶段按 root gate 没有运行 `npm test` full、build、golden，也没有 fresh implementation PR CI。Accepted base 的四个成功 checks 只证明 base；不能证明这个 RED checkpoint 或任何未来改动已完成。最终 implementation review/CI 必须针对新的 exact head 重新跑。

再生成需要 external 原 Buffer + A actual helper；普通 source test 不依赖 external 文件、network、writer 或 live acquisition。记录中的 recipe 可直接喂给同版本 `sanitizeNatureHtml`；完整块 prehash / recipe hash / excerpt bytes / repeat / idempotence 必须全部匹配。边界复现可从 `boundary-evidence.json` 的 markup rows，在 disposable reduced-excerpt clone 的单个 p 中替换（明确 synthetic），调用实际 `parseNaturePage`、`withDomGlobals` / `htmlToMarkdown`、`normalizeMath`、`normalizeAcademicInline`、`normalizeCitations`、`validateMathDelimiters`；不能据 observations 修改 source oracle。

## 下一步与 C 解锁条件

先等待 root 对 #53/#55/#56 的实际 accepted Main CI 与共享 Nature ownership gate 明确释放。然后仅本工作区更新到当时真实 accepted main、保持已审计 source bytes/oracle，不改 B/C/canonical inputs；重跑这 8 个 source tests 及边界身份检查，最小实现后真实三方言 source RED→GREEN，再做 focused/适用/full/build/golden/diff/status、窄 PR `Refs #57`、fresh 三平台 CI/Gitleaks、独立 immutable exact-head review，最终由 root 决定 merge。

Agent C 的 Materials `nature-source-equations-v1` 三方言行，只有在独立生产修复已接纳、相同 truthful source恢复原唯一 display/Equ1 identity/原 allowed-canonical TeX 且 math guard有效、C 自己在相同 sources/oracle 上重跑 PASS 后才解除 `ADJACENT_INLINE_DOLLARS` blocker。单独 Materials citation-context / Ref2 links HTML、typed-opaque adjacency、leading isotope/complex bases 等没有由本 checkpoint解决；C 其余 rows 和整体 Issue #10 依赖不因此完成。

建议 spec changes：无。当前 canonical source gate / 不猜造数学要求可满足，问题在实现分组/恢复边界。原 source、失败、额外边界证据都保留，没有放宽 validator、忽略失败、改学术输入或伪报 CI/contract completion。
