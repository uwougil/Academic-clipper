# Issue #73 — Chemistry Δ bond-position SOURCEONLY handoff

真实 regression 已冻结，尚未修复。此 handoff 补齐已完成来源工作的 durable receipt；恢复阶段没有新抓取、source projection、clip 或测试执行。不同作者对新57-block projection 的独立审核仍待完成，不能以 producer receipt 代替。Issue #10 尚未完成。

## 身份与选择顺序

- Work Contract：[Issue #73](https://github.com/uwougil/Academic-clipper/issues/73)，`bug`，OPEN。
- Base：`a5b6acc2984af5cb8b82106291e963f4f413f5ac`。Main CI [37716530268](https://github.com/uwougil/Academic-clipper/actions/runs/37716530268) 与 Secret scan [37716530267](https://github.com/uwougil/Academic-clipper/actions/runs/37716530267) 均为该 SHA 的 completed/success；本次恢复已重新读取两 run 身份。后续生产修复须采用届时最新 accepted main。
- Branch：`codex/issue-10-bug-chemistry-delta`。
- Worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-chemistry-delta/academic-clipper`。
- Ordered commits：来源/test/diagnosis `8301a6465ef112a31fb8891bc75a0796e34e838f` → 本 handoff 的 DOCONLY commit（由最终 HEAD 标识）。不需要重复选择来源，也不 merge 此 RED branch。
- Owned files：`test/fixtures/nature-chemistry-delta/{.gitattributes,README.md,diagnosis.json,s41467-023-44030-3.excerpt.html,s41467-023-44030-3.provenance.json}`、`test/nature-chemistry-delta.test.mjs`、本文件。
- `src/`、golden、B corpus、canonical spec、PRD/EDD、依赖、security/writer、C/D files 均无修改；无 PR。后续一个独立 #73 delivery PR 必须使用精确独立 `Refs #73` 行，且满足 orchestrator 的十项合并条件。

## 来源与科学 oracle

[原 article](https://www.nature.com/articles/s41467-023-44030-3)：`C5 methylation confers accessibility, stability and selectivity to picrotoxinin`，Nature Communications，DOI `10.1038/s41467-023-44030-3`。B source contract `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`；observedAt `2026-10-03T16:44:25.253Z`，captureMode `guarded-http`。原解压 HTTP body 460171 bytes，SHA-256 `a02d82acb4cdbde085e07ca0c276383894e7a7832c6830ad7a212f450926d88d`，保存在外部 B temp，未提交完整 capture。

唯一完整正文段落是 Results p4（零起算），C source block `a-section-2`；locator `section[data-title="Results"] p:has(#ref-link-section-d76734419e1024)`。原 subtree hash `5637b1cf3f747317aae12698db23ae4ff5fa708a47236179d7d2444e93c6bc99`；frozen subtree hash `fc038557c307a32c496972e01f5b07ab41f4f0605bdf16fb32a87b80d8df061c`。两个 role：`results-p4-delta-bond-1`、`results-p4-delta-bond-2`，对应原 SUP indices 0、3，均无 citation anchor，分别紧邻 `Hydration of the ` 与 `Cobalt catalyzed `，后邻均为 `-alkene`。原 `Δ<sup>12,13</sup>` 表示 comma-separated carbon bond positions；保持 Δ 与 12,13 的 attachment、顺序、数量及原化学值，不能改为 decimal、fraction、measurement、numeric exponent 或 citation。

57 selected blocks 保留必要原 ancestors、完整段落、Results `h2#Sec2`/design-synthesis `h3#Sec3`、title/canonical/DOI/article JSON-LD、全部9 ordered creators、References 完整 prefix 1–36、原 CC BY4.0 notice/footer。作者顺序：Tong, Guanghu；Griffin, Samantha；Sader, Avery；Crowell, Anna B.；Beavers, Ken；Watson, Jerry；Buchan, Zachary；Chen, Shuming；Shenvi, Ryan A.。唯一 citation clusters 为 `[5]` 与 `[27,36]`，不重编号。不为原 `see below` prose 编造 target；此段没有 figure/equation/table/supplementary link。9 compound bold markers、GABA_A receptor、PtO_2 catalyst、C12/C6/C5 与 65%/41%/81%/88% 由原节点/完整 context 约束；provenance 保存其完整序列。

规范 §5–§7 与 PRD §3 / EDD §2.4–§2.5 要求源上下标、原位置、三方言和 strict validators。此独立 defect 不包括三个 trailing-group SUB、leading isotope #61、Quantum Greek SUB #64、FRB powers 或 AlphaFold qualifier。不提出 spec change。

## A interface、转换与尺寸

使用原 Agent A helper Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`，34946 Git LF bytes，SHA-256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`；`sanitizeNatureHtml(raw, recipe)` 与 `serializeSubtree(node)`，sanitizer `nature-corpus-sanitizer/1.1.0`、serializer `nature-corpus-subtree/1.0.0`、recipe/projection 1.0。没有复制 sanitizer/hash/replay infrastructure。

Recipe `s41467-023-44030-3-delta-bond-positions-v1`，SHA-256 `10cab195ffba239d0871b1d8ddf9417d7ef8ba4c9108cada04ddc4f2ff2e61ef`。结构 signature `bb91524e350ac0009019db8dac7e2c2370791fe1c49f2dd7908dfaf6e9db0c3f`，payload signature `64f8a910dcf0fd8a55f466fa5c71e07f64ca3dd2399062e1ebf2998a3cc1c069`；仅同 retained projection 域可比较。Producer 已证明 repeat 与再次 sanitization bytes equal，恢复没有重跑。

转换：选择57完整 source blocks 与 ancestors；固定 scaffold、sorted attributes、UTF-8 无 BOM/LF；裁剪一个 article JSON-LD object；移除744 attributes、清理34 resource URLs。原 scientific i/b/sub/sup、完整 paragraph/source order、reference numbers、rights 保持。省略其他正文、三处独立 trailing-group SUB 与 isotope roles、References 36 后内容、未引用 figures/equations/tables/supplementary、UI/account/executable/tracking/session 材料；不提交 image/PDF binaries 或 full raw response。原 CC notice 不重新授权为 repository code license。

| Committed source artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| excerpt HTML | 57405 | `50e7bd3c941c8b448e49357109c38d1842821ce4ef2d270580a3663c1ae27030` |
| provenance JSON | 34944 | `0fb4c17500d9d2d5d878196d7f9788a6005d90e4dfa5c8cbfafca001d85e91d4` |
| diagnosis JSON | 8382 | `e0e5a40532347e8cb72a5957231d5cce2610643c61df2a8a1989252e2eabed02` |

Excerpt 57405 bytes 在 article 256 KiB 上限内；资源数量为零。上表是文件 UTF-8/LF bytes，hash 不包括本 handoff 或 manifest。

## 已完成复现及外部证据

原作者在 Windows Node `v24.14.1`、未修改 accepted-a5b6 production 执行 `node --test test/nature-chemistry-delta.test.mjs`，并通过 `CHEMISTRY_DELTA_RECEIPT_ROOT` 保存同次输出。原记录 exit 1；完整 log 明确 15 tests、6 PASS/9 FAIL、1210.4358 ms、0 skip/cancel/todo。九个 FAIL 是 two real roles × three dialects（六项）与 strict math validator × three dialects（三项），无 harness correction/failure。六个 PASS：来源 contract一项、三个 dialect ordinary chemistry/citation/resource checks、两个明确 synthetic compatibility checks。

每方言 promise 只调用一次 `clipNature`：总共三个 actual clips，全部 same-run result/Markdown/debug/semantic/ledgers 保存。恢复只读这些现有 bytes；没有 fresh clip、重复 source audit、full/build/golden。读取原输出不能声称后续生产修复已通过。

实际链路定位：Nature `cleanedHtml` 保留两处 `Δ<sup>12,13</sup>-alkene`；Defuddle `bodyMarkdown` 为 `Δ <sup>12,13</sup> -alkene`；academic renderer/final Markdown 产生 `Δ$^{12,13}$ -alkene`。原生产 source blobs 为 clip `8eec6a856ffbd1b9283c43269d38079b3ac940d2`、Nature `c6f819beb9747e83d322644c1f2a232769828afa`、academic-inline `a63eba2cacf0bc0a43552d1c16ec41e91b2cf0bc`。未来修复须在既有 boundary 保留这个明确 typed role，不能加入全局 Greek/unknown-word 猜测或修改 validator。

各方言 `mathValidation.valid=false`，恰好两个 `scientific-isolatedSuperscript`，isolatedSubscript/boldThenSubscript/italicThenSuperscript 全零；`rawHtmlValidation`、`markdownStructure`、`crossReferenceValidation` 均 valid。Exact warnings 为 `No Nature figures were detected.` 与 `No equation nodes were detected.`，figures/tables/displayMath/resources 零，References 36，citations `[5]`、`[27,36]`。Record-before-throw HTTP/DNS guards 与最后 ledger assertion 捕获可能被 fallback 吞掉的请求；ledger attempts 为 `[]`，global bindings 已恢复。Writer proof 为 static clipNature callgraph，不声称 writer spy。

原 orphan Δ 开始位置（1-based line/column；与 validator 在 `$` 上报告的 column 相差1）：markdown `27:18`、`27:686`；links `27:18`、`27:711`；quarto `26:18`、`26:714`。原 UTF-8 byte offsets 分别为 markdown 616/1285、links 616/1310、quarto 701/1398。

外部证据根 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-chemistry-delta`：`freeze.mjs` 是原已执行 producer projection；`receipt.mjs` 是原已执行三结果只读 postcheck/diagnosis 生成器，内含 provenance 写入，因此恢复不重新调用它。它们不是新的 source schema 或 committed infrastructure。Durable recipe、retained subtree digests、scope/oracles 和 diagnosis 位于 source commit。

| External artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| red-a5b6.log | 13922 | `c288adf5e326584cbebb573bd19bcbf145f73dbb6c1942fdff2dc3e61b51790b` |
| red-a5b6/network-ledger.json | 124 | `38f726f4b3895d4c6d8bc4ae526aae1052a4f15ba568e58829f92db971cfb868` |
| red-a5b6/markdown.result.json | 107939 | `919b342ed17066f363af237e6f667b580a927ad9e101ac96d739ed0c125522a8` |
| red-a5b6/markdown.md | 9664 | `b857004cba39314d9ce7aaedbeee622c72569b30cc79be6cff8fdef178e9d556` |
| red-a5b6/links.result.json | 110321 | `54006e344541917aa2dd10da559cd85d034d3ab528a11c1ca50112ad689ba34e` |
| red-a5b6/links.md | 10292 | `141560ec6eb0a34f24f8189000c2b30864f73981e0285c7e0ab4128b749c7fdb` |
| red-a5b6/quarto.result.json | 91824 | `8100ef93dfa503c514fdad55ad4cb3d678e3532938246fd6929eeb869468b383` |
| red-a5b6/quarto.md | 1701 | `48b28696a0c15c21658ad23a3242bcf2c6ee7e64cda19c299f700922f5513287` |

恢复重新读取原15-test log、测试代码、recipe/diagnosis、文件 sizes/hashes、Issue #73 与上述 accepted CI；`git diff a5b6acc -- src papers/s41586-026-10401-1 docs/specs docs/PRD.md docs/EDD.md` 无 diff。最终 `git diff --check`、`git status --short` 和 owned tracked filenames 检查供最终交接记录。没有为了 DOCONLY changes 重新执行 RED tests。

恢复实际执行 `node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-chemistry-delta/recovery-identity.mjs`，exit 0：只读验证 fixture/hash 与三个原缓存的 exact bytes、rawHtml/dialect 身份、对应 Markdown bytes、四 validators、warning/引用/资源和网络 ledger；没有调用 DOM sanitizer、production clip 或 test runner。外部 `recovery-identity-receipt.json` SHA-256 `b02bfb4729f69d50131d2647d7db1bf8f8b3166463021f60840ed6108f3872b4`。Receipt 明示 `newClips=0`、`newSourceProjections=0`、`newTests=0`；这项成功不将原九个 RED failures 改为通过。

## 下一消费者与未完成项

Independent reviewer：从最终 source HEAD 精确使用原 A helper/version、raw digest、recipe 及57 retained blocks，逐项核验新 projection，不重复全 B/85-oracle audit；包括 canonical/title/JSON-LD、9作者序列、两个原科学 role/attachment、完整 paragraph、prefix 1–36、rights 和 transformations。此审核尚未完成，不以当前 source producer 的 checks 宣称 acceptance。

Production owner：独立 source acceptance 与 root production gate 后，只处理 #73。三方言默认完整生产链必须 fresh 执行，清除 `CHEMISTRY_DELTA_CACHE_ROOT`；cached诊断不能满足修复 gate。运行相应 focused/affected/full tests、build、只读 golden、fresh 三平台 CI/Secret scan、独立 implementation review；保持源 bytes 与原 oracle，不能合并当前 RED source branch。

Agent C：#73 当前只解释原 Chemistry 中两个 Δ scientific orphan。真实主语料27 source expectations/repeat 的既有记录不重做；修复被 accepted main CI 接纳后，按原 source oracle 增量核验该角色和四 validators。另三 trailing-group SUB 仍是独立前置问题，不能因 #73 成功把 Chemistry 整体或 Issue #10 标为完成。

未执行：生产修复、independent57-block source acceptance、修复后的 affected/full/build/golden、fresh PR CI/Secrets、merged-main acceptance。无 known science/spec ambiguity，无 proposed spec changes；依赖均为 agent-resolvable，非 human-only blocker。
