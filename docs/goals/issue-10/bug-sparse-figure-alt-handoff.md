# Issue #55 — Nature 稀疏主图 short-alt handoff

状态：**LOCAL_VERIFIED / PR_CI_AND_REVIEW_PENDING**。真实来源短 alt 缺陷已由最小生产修复消除，同一 adapter/三方言永久回归与完整本机 suite 全部通过；最终 fresh PR CI/独立 review/merged Main acceptance 仍待完成，不声明 Issue #55/#10 完成。Issue #53 的 accepted Main CI 后 root 已释放 Nature main short-alt gate。原 Units Issue #48 / PR #50 的工作区与固定 head 未触碰；这里只通过 accepted-main dependency merge 接入已经接受的实现。

## Work Contract、基线与所有权

- Work Contract：[Issue #55](https://github.com/uwougil/Academic-clipper/issues/55)，`bug`、OPEN。已核对 Git remote/auth；对 open/closed Issues 搜索 `pangenome`、`short alt`、`alt`、`figure`，阅读 #47/#53 边界，没有等价合同。#47 明确将 sparse source alt 排除；#48/#51/#53 是其他机制；#10 仍由一个最终 corpus PR 负责。
- 原 source RED base：`e2d32e9ec819692a1f08075636c3a168f15ad20b`。本工作区从 clean `4783291` fast-forward 到 e2；尚无 authored commits 时无需 dependency merge。来源 provenance 中保留这一真实 acquisition/preflight 历史。
- 独立重读 Main CI `37278003744`：同一 e2 head，Ubuntu24 job `111659279964`、Ubuntu20 `111659280091`、Windows24 `111659280101` 全 success；Secrets `37278003787` 同 head success。它们证明 base accepted，不冒充本 RED checkpoint 的 CI。
- 当前 accepted base：`0de5c8b5c4c51a9231f250c336216598c10f27ae`。重新 fetch 后 origin/main 同值；独立核 Main CI `37329109194` 同 head 三个 jobs `111827337448` / `111827337770` / `111827337830` 全 success，Secrets `37329109169` 同 head success。通过 dependency merge `2a120b5cf739c1f67fa88c7a9795e2cf7fe7b273` 接入，原 authored history 不重写。这些 checks 不替代最终 PR head 的 fresh CI。
- Branch：`codex/issue-10-bug-sparse-figure-alt`。
- Managed worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-sparse-figure-alt/academic-clipper`。
- Runtime：Windows / Node `v24.14.1`；使用已有 committed lockfile 依赖。没有改 package/lock/CI。
- 已读 scoped AGENTS、完整 canonical spec/execution plan、B/C handoffs 及 PRD §3、EDD §2.3–2.5。使用 create-issue 与 fix-bug：intake 已由验证成功的 Issue create 完成；在两个 accepted bases 分别完成真实 reproduce/prove/diagnose/permanent regression，获 root 释放 production gate 后才实施最小修复。

按顺序的 authored commits：

1. `bb356049b00eb33654c38540c14c09f3af3de6a8` — source/rights/recipe/excerpt、明确 synthetic controls 与 adapter/final-rendered 三方言 RED；五个文件。
2. `56ced086f0bb6f90ab5b46fc3eabfef0f1f34453` — 原 source-only preflight handoff；仅本文件。
3. `c7f86e19d59a243f103878125766958c2424cf7d` — 最小 main figure short-alt fix；仅 `src/adapters/nature.mjs`，3 insertions / 2 deletions。
4. 最终 handoff receipt commit — 本 handoff 与 fixture README；准确 SHA 从 `git log -1 --format=%H -- docs/goals/issue-10/bug-sparse-figure-alt-handoff.md` 取得并在交接消息报告。

Dependency-only merge `2a120b5cf739c1f67fa88c7a9795e2cf7fe7b273` 不作为 authored delivery 选择。Owned files 仅 `src/adapters/nature.mjs` main figure loop、`test/nature-sparse-figure-alt.test.mjs`、`test/fixtures/nature-sparse-figure-alt/{.gitattributes,README.md,s41586-023-05896-x.excerpt.html,s41586-023-05896-x.provenance.json}`、本 handoff。相对当前 accepted 0de 只涉及这七个路径；其他 production / B corpus / validators / intents / security / dependencies / golden 无变更。

## 来源、admission 与真实期待

原文章 [A draft human pangenome reference](https://www.nature.com/articles/s41586-023-05896-x)，DOI `10.1038/s41586-023-05896-x`，Nature。使用 B authoritative readonly snapshot `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330` 的 untouched raw body；没有重新采集网络。C 最新 `bc81a28d8edf05bbba06b1a82cdedcde3d6f8ac6` handoff 独立核对同一四-wrapper short-alt packet；本轮不重跑无关的 13-resource audit。

原 raw 1,251,945 bytes，SHA-256 `342b8dc5d0bf7d01618a3e9965ef6de9b23c59c7f7bef429592cbdb7852c36ec`。原 canonical / DOI / title / journal / article JSON-LD public-access / usable body 已从 raw DOM 重核。完整 119 ordered creators 与原 CC BY 4.0 notice 的文本、链接、原位置与 prehash 全保留；publisher footer 单独记录，未重新许可原材料。细节与完整署名在 fixture README/provenance。

| Source ID / locator / B block | 原 wrapper pre-sanitize SHA-256 | 正确 short alt | 未修复 model / final alt |
| --- | --- | --- | --- |
| Fig1 / `#figure-1` / `a-section-2` | `a67baa58454b5076eb464f4c74d03fc02ba56af081e7ca81512805d02334e8f1` | Figure 1 | Figure 1 |
| Fig3 / `#figure-3` / `a-section-3` | `0f62fea715fb860ff8ff262245ac20798dbb989ce926ea605434c87fee9fec11` | Figure 3 | Figure 2 |
| Fig4 / `#figure-4` / `a-section-3` | `ef1abb9b5ba8717a76a24d4bc31b39cbc884bdba0280508cb3aebef94f86b0d4` | Figure 4 | Figure 3 |
| Fig5 / `#figure-5` / `a-section-3` | `7ec9deb70e1b659a58c27b09ae5a9173c62cdeecdbdb00c85ea34bc8480e04b3` | Figure 5 | Figure 4 |

四原 wrapper、caption siblings、全部 caption/panels、picture/srcset/lazy resource relationships 与原 ancestors 不改。保留完整前后 paragraphs，原 section 的前/后 paragraph 零起算位置 `0/2, 0/2, 7/9, 12/14`；全部 204 selected nodes 的 source positions/prehash/bytes、四完整 caption payload 和 source candidate attrs 都在 provenance。Source expected 从原 `Fig. N:` caption / `FigN` marker 核验；不是从 parser 当前 alt 反推。

必要 section targets 用原 `#Sec18` Methods heading、`#Sec19` Sample selection heading、`#Sec19 + p` 完整首段。其 raw prehash 分别为 `d344e5b694a801db41a693817ff7217eaf675eddd07f71ce623889604aa365f4`、`84098fb25ff55cda9539276586509c30d9284b2641e9fe7403b8b6de3015f914`、`c7048e76b28580d673044cfbc28d3066fe626ce40a260edf3e6fd11423d91c70`。早期只选空 Methods heading 的过窄投影经 Defuddle 丢 target，导致 links/quarto dangling Methods；增加真实最小上下文后四 validators 全通过。这是 own recipe 修正，不是 parser defect，也没有手编 DOM 或放宽 oracle。

References 原 prefix 1–48 完整保留。原 full page 确实存在 Fig2；它在 B admitted projection/本窄 excerpt 外，未补造。原 Extended Data 及其余正文不计入这个真实输入覆盖；test 的两个 inline HTML controls 明确 synthetic，只保护 id-less/unlabelled fallback 和 Extended Data，不作为 admission。

最终 excerpt 143,109 bytes，SHA-256 `468df531667836eb8484b522482b915bad8de9f375a06489423b34e8bb43a537`；recipe hash `db247b8e4a6a636f16b941adeac369e9109b8cdad7e8f8f209a763e7ef0162c0`。读取 A actual helper `scripts/lib/nature-corpus-infrastructure.mjs`，Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`，34,946 Git bytes，SHA-256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`。没有复制 helper 或第二套 parser。Schema/recipe `1.0.0`，sanitizer `1.1.0`，subtree serializer/projection `1.0.0`；完整 recipe、transformations/signatures/omissions、重复和幂等 byte-equality 已记录并实际重验。UTF-8 无 BOM、LF；source inline whitespace 未 trim。

## 因果诊断、最小修复与兼容边界

Implementation bug，违背 PRD 的图号/short-alt 契约。`extractFigures()` 的 main loop 已用 `figureLabel(caption, fallback)` 得到正确 label，却用 `figures.length + 1` 设置 alt。`renderFigure()` 原样消费错误 alt；无需改 renderer。所有 retained source labels 正确，而后三个 alt 与原 image/caption 身份错配。

唯一生产路径是 `src/adapters/nature.mjs` 的 main figure loop。原冻结提案现已实际应用：

```diff
 const number = figures.length + 1;
+const label = figureLabel(caption, `Figure ${number}`);
 const identity = `inline-figure-${number}`;
 ...
-label: figureLabel(caption, `Figure ${number}`),
+label,
 ...
-alt: `Figure ${number}`,
+alt: `Figure ${figureNumber(label, number)}`,
```

这保持 ordinal identity/anchor、原 label/caption、source ID、image order/resource/fallback 和其他字段；没有可识别 source label 时，已有 fallback 仍得到当前 ordinal。仅使用已经存在的 `figureLabel()` / `figureNumber()`；不扩展 source label regex，也不从 DOM IDs、filename、正文数字或 arbitrary caption 内容猜图号。Extended Data 原路径已用 `figureNumber(label, extendedNumber)`，完全未改。

实施前已核对 source sparse labels、id-less figures、不可识别 source label 的 fallback、Extended Data 与 image association 边界，复用已提交且先于 fix 的永久 controls，没有新增重复 tests。Synthetic `Fig90` 配无编号 caption 的 case 仍 fallback 为 Figure3，不从 ID90 或正文47猜数字；顺序 id-less Fig1/2 与独立 Extended Data7 identity/alt 保持。最终三方言真实图片短 alt 是 Figure1/3/4/5，ordinal anchors/identities 仍为1/2/3/4，caption labels/payload、四原 picture/source winners、完整 panel/邻接正文与 metadata/reference 契约未变。本 bug 不重编号其他字段或写入本地 artifact。

## 精确验证与当前限制

外部日志目录 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-sparse-alt`。普通 test 不依赖这些外部文件，也不需要 raw response；重建审核按 fixture README 的 raw/recipe/existing-helper 流程。

| Command / evidence | 实际结果 |
| --- | --- |
| `node .../build-fixture.mjs`，读取原 raw、readonly B actual helper 与 own provenance recipe | exit0；最终 204 blocks、143109 bytes；raw/四 wrapper/119 creators/原 rights/source positions/image attrs/necessary targets/prefix48 PASS；repeat/idempotence PASS。`fixture-final-generation.log` |
| `node .../probe-source-output.mjs` / `source-output-before.json` | exit0 为捕获成功，非 bug 通过；三方言实际 labels1/3/4/5、alts1/2/3/4，三方言四 validators/scientificFragments 全 PASS，只有声明的 no-equations warning。最终 permanent test 再次执行同一生产链路 |
| `node --test test/nature-sparse-figure-alt.test.mjs` | **exit1**；10 tests：**6 pass / 4 fail**，0 skip/todo/cancel，1791.0525ms。四 FAIL 仅 adapter alt 与 final rendered 三方言；source/rights/topology test、三 preservation tests、两个 synthetic controls 全 PASS。`source-red-e2.log` |
| `node --test test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-caption-citations.test.mjs` | exit0；**38 pass**，0 fail/skip/todo/cancel，4108.1113ms。`affected-preflight-e2.log` |
| `npm run build` | exit0；只生成 ignored `dist/extension`。`build-preflight-e2.log` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0；完整 golden 13 display / 50 references，四 validators/scientificFragments valid。`golden-preflight-e2.log`；golden 文件未改 |
| `git diff --check` / `git diff --cached --check` / tracked filenames | exit0；source HTML source-preserving attributes 仅限 own fixture；所有五 source/test files 审查过，生产/intents/B/golden 差异 empty |

最初 harness 曾误把原 img fallback 当作 picture/source winner，以及将 captionMarkdown 的原 `Fig. N:` 错当 renderer 的 `Figure N.`，还遗漏 default adjacent footnotes 的 presentation commas。都先核原 source 和 existing production 契约后修正 own harness；没有更改科学源或 B expectations。这些 setup failures 不计入上述真正四个 short-alt RED。最终 permanent test 绑定 source candidate、完整 caption frame 和相邻正文，不能借别幅图片或 model 的正确 label 通过。

上述表格保存原 source-only preflight 的 exact evidence；不会把当时 expected failures 改写成通过。当前 production 修复的验证如下：

| Command / evidence | 当前实际结果 |
| --- | --- |
| `npm ci` | exit0；65 packages，0 vulnerabilities，committed lockfile；`npm-ci-0de.log` |
| `node --test test/nature-sparse-figure-alt.test.mjs`（dependency merge 后、未改 main loop） | **exit1**；10 tests：6 pass / 4 fail，0 skip/todo/cancel，9087.5482ms；production Git bytes 与 accepted0de 完全相等。`source-red-0de.log` |
| 同一 focused command（最小 fix 后） | **exit0**；10/10 pass，0 skip/todo/cancel，1957.2648ms；adapter/source IDs 与 rendered three-dialect alt、完整 preservation/validators、两 synthetic controls 全通过。`source-green-0de.log` |
| `npm test`（fixed c7f86 production/test 树） | **exit0**；381 tests，381 pass / 0 fail / 0 skip/todo/cancel，76061.0958ms。`full-fixed-0de.log`。在 C actual terminal、root 释放唯一 full slot 后执行一次；full 包含 affected tests及原单位/code-opacity/table-MathJax/literal/figure/writer边界，不另重复大subset |
| 外部只读 `audit-frozen-source.mjs` | exit0；raw 1251945/hash342b8dc5、excerpt143109/hash468df531、provenance211523/hashcd485e65；后两文件与原 bb356 Git bytes 完全相等；全部204source prehash/四wrappers/119creators/原CCnotice/actual helper Git identity/recipe/regeneration/repeat/idem PASS。`frozen-source-audit-0de.json` / `.log` |
| `npm run build` | exit0；ignored dist only。`build-fixed-0de.log` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0；原完整 golden13 displays/50references、四validators/scientificFragments valid；文件未改。`golden-fixed-0de.log` |

Full 已 actual terminal，root 已收到准确 command/result 并可调度下一本机 full。随后的改动只补本 handoff 与 fixture README，不改变被验证的 production/test 树，不再重复 full。`git diff --check 0de5c8b5c4c51a9231f250c336216598c10f27ae..HEAD`、cached check、tracked filenames、status 与 source/provenance identity 均核验。Fresh PR CI/Gitleaks、独立最终 review 与 PR/Main acceptance 仍待完成；accepted-base checks 不算新 head checks。最终精确 head、PR URL 和 fresh run/job IDs 由 delivery PR 的 GitHub checks 与交接消息记录；CI 失败或 review finding 必须恢复同一 owner，不掩盖问题、不自行 merge。

实际 image download/local filename IO 本轮未单独执行；所有 ordinal anchor/path 及 filename/writer 代码未改，三方言保留 source resource/fallback 由真实 regression 保护，writer/image IO 由已通过的既有 full suite 保护。静态核对 `downloadFigureAssets()`：filename来自 unique source URL 的 encounter order，path map 用 figure.anchor；alt 不参与文件名或下载选择。没有新 live HTTP/DNS、artifact writer、source fixture mutations 或生产 scientific/unit/literal/citation/styled 行为扩展。

最终只有一个 bug delivery PR，精确独立 trailer 为 `Refs #55`，无自动关闭关键词，不使用 `Refs #10` 完成此 bug。Root 负责最终十门槛与 merge；merge 只接纳代码，merged Main CI success 后既有 automation 才完成 #55。
