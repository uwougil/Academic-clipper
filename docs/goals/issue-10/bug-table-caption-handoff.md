# Quantum Table 1 caption：独立 source-only handoff

[Issue #60](https://github.com/uwougil/Academic-clipper/issues/60) 是独立 bug Work Contract。本 checkpoint 只冻结合法 source、最近生产组件 RED、实际阶段因果证据和未应用提案，没有修复生产实现、实现 PR 或完整验证结论。一个后续最终 PR 使用精确独立行 Refs #60，由 root 独立 review/merge；成功 merged Main CI 后才完成合同，不承担 #10 的普通交付责任。

Own managed worktree 为 C:/Users/guoli/.codex/worktrees/issue-10-bug-quantum-table-caption/academic-clipper，branch 为 codex/issue-10-bug-quantum-table-caption。永久 source/RED commit 为 7c8ce9fcc312a0697e686ec396083eea3f8a3b30，生产基线为 0de5c8b5c4c51a9231f250c336216598c10f27ae。此时最新 accepted main 已是 b88653a4be3dcf30cd487365d033f1e7a7c3da0a：Main CI 37670512607 的三 jobs 112960767643 / 112960767857 / 112960768046 与 Secrets 37670512896 全 success。此 checkpoint 没有执行 b886 上的 RED，不能把 0de 结果当新 accepted runtime 结果；只读 Git 对比显示 0de→b886 在三个拟触及文件中仅 nature.mjs 的 sparse figure label/alt 五行变化，caption 机制未变。

Nature 生产 gate 仍由 #56 占用，随后 #57；nature.mjs、figures.mjs 和 clip.mjs 均未编辑。实施前必须由 root 更新依赖/释放所有相关 gate，并在当时最新 accepted base 复核来源失败。旧 PR54 checkout 保持 clean，exact 6f1e110c1cabbf8fb4aa45d3d39076c696e6c703；旧 PR52 checkout 保持 clean，exact b493ac7842a6c03b4a12732edc1495bcf00dcfd1。B checkout、A/B/C corpus 与 oracle、canonical/intent/security/validators/dependencies/golden 均未改。

真实来源是 [Autonomous quantum error correction and fault-tolerant quantum computation with squeezed cat qubits](https://www.nature.com/articles/s41534-023-00746-0)，npj Quantum Information，DOI 10.1038/s41534-023-00746-0。原 Table 1 caption 为 Discussion / #Sec7-content 内的完整 #Tab1[data-test="table-caption"]，其实际祖先为 figcaption→figure→#table-1。保留原 wrapper 和完整前后邻接、原 Results/Discussion 标题、Equ7/15 完整 blocks 及各自完整前后邻接、references prefix 1–71、metadata 和 rights。71 是原 context 所需最大 reference，不是重编号；此摘录未扩为全文或其他 13 resources 审计。

原 6 位有序 creators 为 Xu, Qian；Zheng, Guo；Wang, Yu-Xin；Zoller, Peter；Clerk, Aashish A.；Jiang, Liang。原文章 CC BY 4.0 完整 notice、原 license link、raw dc.copyright/dc.rights/prism.copyright 和独立 Springer Nature footer notice 均在 provenance 中分别记录；footer 不当作 article license。原 table page 未独立声明 license link，使用其所属文章原 notice 作为归属依据，没有制造新许可。摘录属于注明来源和变换的有限保留，省略无关源 blocks、其他 equations/figures、navigation/session/analytics 与 image binaries。

| 输入/保留证据 | Bytes | SHA-256 |
| --- | ---: | --- |
| 原 anonymous article body | 511799 | 6b2bb78e5f3038d6281eac00b60dc90aa58bdd9ac185ca2d4b9b0de362bbe28e |
| caption raw pre-sanitize subtree | — | f3b0491bc1cce00b208266b23277279d4f368fa7a2752e104b2fb2e0c6a19249 |
| B frozen / own frozen caption subtree | — | 23d81f6b93cdfdbfe357c9726209878bf28a55c0952dd19c4ce0290cb90806fc |
| own article excerpt | 76331 | 0f45652f6fb88406a34bbe244236d0ad61b24d90bdcff8165f2ec3591ca0e52d |
| 原 Table 1 anonymous resource | 169146 | 7772399037acb3ba4dfc100bc6c9a8fdf4f82c56d8836e65fcb761294e9ee069 |
| 原 B / own Table 1 resource excerpt | 4299 | 90670968407415e1f7e7c624b3244330015a4e52bc9790e811d2992205851c2d |

原 raw files 位于 C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-b/，文件名分别是 s41534-023-00746-0.anonymous.raw.html 和 s41534-023-00746-0.table-1.anonymous.raw.html。Resource URL 为 https://www.nature.com/articles/s41534-023-00746-0/tables/1，B manifest 路径为 fixtures/s41534-023-00746-0/tables/table-1.excerpt.html。实际 raw #content block prehash 为 cce27a4a2cbb6e4fab61a8decd636f830d54b3a18ede2b4d4d15d355005c26c0，原物理 table 为 3 rows × 3 cells；这些值都读取 manifest/原 DOM，没有猜测。

B source contract 为 b718fa8b826c2abeb45c2dd30cd5414b3d6d8330。A dependency commit 为 3754d3a781459635e719859353fe3cbdf8741897：scripts/lib/nature-corpus-infrastructure.mjs blob e56f140d9756bb83013b9df0716dc650e04d7917，34946 bytes，SHA a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c；schema blob 3edf568bc82f9b0302f737acb5e0b19295cb927b，12843 bytes，SHA 7f0563889be154bcb91633ee48d5ce1218d9b8aa6c46614a07bf461bd3e03915。使用实际 sanitizer 1.1.0 / serializer 1.0.0 / recipe 1.0.0 外部生成一次，没有将 A helper/schema 复制到永久 bug tests。Provenance 保存 105 个完整 recipe blocks、prehash/retained hash、全部 transformations/omissions、repeat bytes equal 和 idempotent bytes equal。Raw/frozen digest 差别是删除 tracking attrs；caption 原科学文本、节点顺序、12 个 originalTeX 和 anchors 保持。

独立 oracle 来自 untouched raw DOM。Caption 保留 12 个原 inline MathJax（含重复项的原顺序/多重性），原 citation 58 在第二个公式之后且处于 math 之外，原 Equ7 / Equ15 anchors 的 readable labels 分别为 7 / 15。Equ7 prehash 为 4122520b3efe88d19f23427009715f07e5b16aefe1d0fd9982da5e76e54270c8；Equ15 为 be806297133d95723d0cfe051a600535ce047160ce7a0f3e84a25af412ec65aa。原 number whitespace、source row counts、全部 TeX/prime/fraction/base 和相邻文本均保存；两个源 display，不接受 phantom display。Rendered oracle 只对明确 braced \rm / \bf presentation 使用既有 \mathrm / \mathbf 对应，不以当前 parser 输出作科学期望。早期诊断 setup 的 presentation mapping 曾处理错额外 braces，已改为实际 braced 形式；originalTeX、HTML excerpts 和 source hashes未改变，旧手工 runner 的历史计数不作为当前永久 runner 的结果。

外部 packet 位于 C:/Users/guoli/AppData/Local/Temp/academic-clipper-quantum-table-caption-preflight/。source-inventory.json / source-prepared-receipt.json 保存合法原 source/A/recipe/repeat/idem；stage-causality-0de.json 保存只读 Node Inspector 的原生产 checkpoints。实际链条为：

1. 原 caption DOM 中原 12 math、citation 58、Equ7/15 全部存在。
2. extractTables 只取 captionFor(figure).text，生成的真实 table record 没有 captionHtml/captionMarkdown；这是首个 invalid state。
3. prepareSemanticNodes 的实际 body DOM 正确生成 12 inline math markers、1 citation58 marker、两个已知 typed equation href。图注重捕机制只处理 figures，tables 没有重捕。
4. Cleanup 删除原 table figure。Hydration 只补原 table/cells/notes；normalizeTableContents 只归一化 cells/notes，caption 仍是旧纯文本。
5. renderTables 直接追加纯文本 caption，位于 body normalization 之后。自己的阶段结果与 C 保存的真实完整 clip 三方言 caption line 完全相同。

Inspector 是只读观察，不 monkeypatch 生产模块。将其实际 protected caption DOM 交给既有 normalizeFigureCaptions 的 counterfactual intervention 恢复了 12 TeX、58 和两个 targets；这只证明机制可复用，不是应用修复、真实 clipNature 验收或 source admission。

C 的真实完整 clips 来自同次 accepted-units-literals cache（C a9b6287 packet；原 corpus 238/255，17 source failures），不是当前 branch 新运行。该 source contract 的 source-crossrefs-v1.internal43/44 就是原 caption 的 Equ7/15；默认 readable label PASS，links/quarto target expectations FAIL。三个 saved Markdown 的原路径和 byte digests 在 provenance.cachedAcceptedC 中，文件名前缀 accepted-units-literals.s41534-023-00746-0.，分别为 markdown.md / links.md / quarto.md。Own stage 候选确实执行全部 validators：三方言各 math valid=false、24 delimiter issues，scientificFragments valid=true、rawHtml/structure/crossReferences valid=true。这些是外部组件编排候选的实际结果；C 全文 Quantum math 的 43 issues 是独立 full clip 结果，不能将两者混计或声称 whole article green。Citation 或 target 丢失不会自动使 production cross-reference validator 报错，因此其 PASS 不能替代原 source expectations。

永久 tests 现在只包含最近组件边界，没有 test/lib helper、第二 Nature parser、hash/serializer/replay infrastructure 副本或手工 finishClip 编排。parseNaturePage 原 source projection 三个角色、已有 hydrateNatureTables guarded seam 和 renderTables normalized-caption 选择是独立定点调用；不提前向当前签名传 ignored options。Renderer 的三个 plain controls 明确 synthetic，不伪装 source science。原手工链及旧 runner 原字节移到 external legacy-helper-original.mjs / legacy-test-original.mjs；capture-stages.0de-original.mjs 保存其历史来源，当前 external diagnostic import 指向 external 文件，不是永久测试依赖。

| 检查 | 实际结果/范围 |
| --- | --- |
| 原 source inventory / A recipe / rights / repeat / idempotence | PASS，既有合法审计复用，本次不重复 raw collection |
| 原 external 13-case runner | exit 1；13 tests，5 pass / 8 fail；历史诊断，不是真实 clipNature runner |
| 当前永久 node --test test/nature-table-caption.test.mjs | exit 1；9 tests，3 pass / 6 fail，0 skip/todo/cancel，751.8419 ms |
| 永久 PASS controls | 原 fixture/rights/context；retained Equ7/15/71 references；guarded真实 resource hydration |
| 永久三个 source RED | table record 缺少 captionHtml，typed TeX / citation58 / Equ7&15 projection 丢失 |
| 永久三个 synthetic RED | renderTables 忽略 captionMarkdown，输出 RAW_CAPTION_CONTROL |
| Network/writer | 真实 DNS/HTTP 0、writer 0；existing hydrator injected GET/manual 和 all/verbatim ledger 无未声明操作 |
| Full / build / golden / PR CI | 本 source-only 阶段未运行；生产 gate 未释放，没有实现 PR |
| b886 runtime compatibility | 未运行；保留 0de exact RED，不用静态相同代替运行证明 |

本次 Node v24.14.1。原 npm ci 已 exit 0（65 packages，0 vulnerabilities）。新最近组件 scope 只首次执行一次，未重复旧 13 cases 或 full。具体命令：

~~~powershell
Set-Location 'C:/Users/guoli/.codex/worktrees/issue-10-bug-quantum-table-caption/academic-clipper'
node --test test/nature-table-caption.test.mjs *> 'C:/Users/guoli/AppData/Local/Temp/academic-clipper-quantum-table-caption-preflight/components-0de-red.log'
git diff --check
git status --short
git diff 0de5c8b5c4c51a9231f250c336216598c10f27ae b88653a4be3dcf30cd487365d033f1e7a7c3da0a -- src/adapters/nature.mjs src/normalizers/figures.mjs src/clip.mjs
~~~

External components-0de-red.log SHA 为 49f215ac66eed23e3f6b0f95efd8a172438fd10f5b0650b95d8970e67e2c82f5；stage-causality-0de.json SHA 为 f34dcc84e9e9ac0c833b039a67316a3687e2a2d436dfb6144524f95aa1d0b27b。旧 helper/test/source script SHA 分别为 567b5d3e770b3c71df329c6ca9d9f8928d160e30246bc5ac27bdcda2c71a8acf、99b44033426063abd064e3db3c7d6187845479a165398d7a160a90aed75abc82、b9c4b54c1e3fe8d3d88f7d64784ab4b0982058ed612ce4bf314b0e383101bdc8。完整 captures 保持 TEMP。

未应用最小提案在 external proposed-caption-reuse.diff，精确文件 ownership 需求为以下三个，生产仍为零 diff：

| 需要 gate 的文件 | 拟最小动作 | 复用机制 |
| --- | --- | --- |
| src/adapters/nature.mjs | extractTables 保留原 caption HTML；prepareSemanticNodes cleanup 前按原 Tab identity 重捕 protected caption HTML | 现有 captionFor、typed math/citation/known crossrefs |
| src/normalizers/figures.mjs | normalizeTableContents 接受已有 caption context 并调用 normalizeFigureCaptions；renderTables 优先 captionMarkdown，保留 caption fallback | 同一 Defuddle / academic / math / citation / anchor normalization，不复制 parser |
| src/clip.mjs | 既有 normalizeTableContents 调用传同一 semantic/references/policy/bodyMarkdown context | 真实 finishClip 编排，不新增 transport/public API |

提案依据 0de actual source 的 Tab1，不是已应用/验证的 patch。Missing ID/plain caption/fallback、legal display/explicit legacy/code 角色必须在未来最小实现前检查；不能用猜测 ID 或一律 inline 的 label 掩盖新 regression。不会从本 packet 扩大为 Greek、body SUP 或另一条科学 parser。

| 未来兼容/验收边界 | 明确验证方式 |
| --- | --- |
| 原 12 inline TeX、58、Equ7/15 三方言 | 原 source oracle；真实 clipNature 输出及各 emitted definitions/targets，不接受手工链 GREEN |
| 真正的 clipNature / finishClip / validators | 明确 synthetic composition：测试时将未改实际 resource table DOM 附入原 figure，用现有 inline table 路径避免 fetch；比较原 caption subtree、creators/references bytes 不变；不计真实 publisher layout/admission |
| 原 full-size resource | 现有 guarded hydration seam 定点 component + C/owner 受控实际 full replay；不复制 transport，不 global patch |
| Equ7/15 display identity/TeX/number/rows/order | 原完整 equation blocks；只这两个源 display，无 phantom；不认其他 equation 当成功 |
| Inline / no-HTML / URL/redirect/content-type fallbacks | 既有 source/component/security tests；无 resource 时仅保留安全 fallback，caption 科学 payload 不丢 |
| Source roles / math / code / literal escapes | 合法 inline/display/explicit legacy、unknown literal、code、underscore controls，明确 synthetic；旧 PR52/PR54 边界回归保持 |
| Cells / notes / table/footer associations | 既有 accepted FRB #45/#48/#51 tests，源 marks/notes/物理 rows 不变，不把其中科学附件塞入 #60 |
| Default guards / citations / references | 原 citation58 attachment/order、numeric/range controls、已知 targets、完整 deterministic BibTeX，rawHtml/delimiter/scientific/structure/crossref validators 都实际执行 |
| 后续 delivery | 最新 accepted base 上 RED→minimal GREEN；affected/full/build/golden；clean exact head；fresh 3-platform CI+Secrets；独立 review，再由 root merge |

仍未满足的是实现、最新 accepted runtime 组合验证和最终 CI/review；因此 Issue #60 保持 OPEN。当前冻结 source-only checkpoint 后释放 slot，等待 root 明确 production gate，不继续扩矩阵、raw audit 或全量测试。
