# Issue #53 — literal brackets source / RED 检查点

状态：`BASELINE_RED`。真实 source 与永久 RED 已完成，生产实现未改；root已释放仅 `replaceScientificBracketText()` 的生产gate，先固化本RED commit再实施。本检查点不声称缺陷修复或完整 FRB/chemistry corpus 通过。独立 [Issue #53](https://github.com/uwougil/Academic-clipper/issues/53) 为一个窄 Work Contract，不分摊 #10 的普通交付责任。将由一个 final delivery PR 使用精确独立 `Refs #53` 行；root 负责独立 review/merge，merged-commit Main CI 成功才完成 Issue。

## 基线、文件与范围

- Initial accepted/source audit base：`4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2`。两个原来源 × 三方言均真实 RED。
- 最新 accepted base：`e2d32e9ec819692a1f08075636c3a168f15ad20b`。重新 fetch 核验 [Main CI 37278003744](https://github.com/uwougil/Academic-clipper/actions/runs/37278003744) 三 jobs `111659279964` / `111659280091` / `111659280101`、[Secrets 37278003787](https://github.com/uwougil/Academic-clipper/actions/runs/37278003787)、[finalizer 37278762752](https://github.com/uwougil/Academic-clipper/actions/runs/37278762752) success；#51 于 `2026-10-05T07:37:25Z` closed/completed 后才 fast-forward 到此 base。Source excerpt bytes 保持。
- 新 managed worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-literal-brackets/academic-clipper`；branch：`codex/issue-10-bug-literal-brackets`。旧 #52 author branch/worktree 保持 clean `b493ac7842a6c03b4a12732edc1495bcf00dcfd1`，没有把新工作塞入 #51/#52。
- Owned 文件：`test/nature-literal-brackets.test.mjs`、`test/fixtures/nature-literal-brackets/.gitattributes`、该目录两源各自 `article.excerpt.html` / `provenance.json`、本文。没有 B/C oracle、manifest、validator/security/deps/golden/spec/intent 或生产改动。
- B 原始 source contract：`b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`；C 最新只读 packet：`79ae944ce55bcdf753ade1851587688463a865be`；D latest source preflight/handoff：`e204dedf`（table fix 后 72/85、仍 `DEPENDENCY_PENDING`）。它们不是本 bug delivery 的 copies。

## 真实来源、权利与重建

两源从 B 已保留的 untouched anonymous response bytes 读取；无新 live fetch、无 full raw commit、无编写科学 HTML/TeX/署名/rights。完整 ordered source creators（FRB 35、chemistry 9）、原 Rights and permissions 全文/原 CC BY 4.0 href/源 notice selector + subtree digest、原 dc.copyright/dc.rights/prism.copyright metadata 和单独 publisher footer 均由 actual raw DOM 核验并随 provenance 保存。摘录保留原科学节点/Unicode/有意义空白，技术删除/选择/省略不改变其科学内容。原 article rights 约束保留，不以 repository code license 替换。

| Source | Raw article bytes / SHA-256 | Own excerpt bytes / SHA-256 | 完整 retained topology |
| --- | --- | --- | --- |
| [FRB](https://www.nature.com/articles/s41586-022-04755-5) | 545450 / `190a270027c69a816b2647d2fdc6f1777cdf669695506fa40f2fe3cab8801ace` | 50135 / `7182c8625529cbba2e04fc9fda540aed5a33bfde74a6621ddc8a2ae4e88b6469` | Main p5 三处 literal `[O III]`；前邻 Figure 2 两处同 label、完整 caption；后邻 paragraph 两个原 inline MathJax；8 原 display equation wrappers/IDs/TeX/number/rows；Main/Methods headings；原 References prefix 16；原 metadata/JSON-LD/ordered authors。 |
| [Chemistry](https://www.nature.com/articles/s41467-023-44030-3) | 460171 / `a02d82acb4cdbde085e07ca0c276383894e7a7832c6830ad7a212f450926d88d` | 50263 / `f655fd7f928149ee683f0e4781cde3c5ef1dbe515a30461358db88aa40a6d500` | Results h2、真实前邻 h3、完整 p0 两处 `[<sup>3</sup>H]`/compound labels、后邻 p1、原 References prefix 27、metadata/JSON-LD/9 authors；真实 source 0 display。 |

实际接口是 A `3754d3a781459635e719859353fe3cbdf8741897` 的 `sanitizeNatureHtml` / `serializeSubtree`，sanitizer `nature-corpus-sanitizer/1.1.0`、serializer `nature-corpus-subtree/1.0.0`、recipe `1.0.0`。Own provenance 内记录完整 recipe/retained blocks/pre-sanitize digests/transformations/omissions/projection signatures/重复与幂等。Helper 仅外部 own dependency snapshot 使用，没有混入 bug Git 文件：

| A file | Git blob / bytes / SHA-256 |
| --- | --- |
| `scripts/lib/nature-corpus-infrastructure.mjs` | `e56f140d9756bb83013b9df0716dc650e04d7917` / 34946 / `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c` |
| `test/corpus/corpus-schema.json` | `3edf568bc82f9b0302f737acb5e0b19295cb927b` / 12843 / `7f0563889be154bcb91633ee48d5ce1218d9b8aa6c46614a07bf461bd3e03915` |

重建时从各 provenance 导出 `.fixture.recipe`，从该 A commit 读取上述两个 Git blobs 到外部 dependency snapshot，调用原 `sanitizeNatureHtml(rawHtml, recipe)`；原 Buffer 先比 raw SHA，再 decode。重复调用和再次 sanitization 比较返回 `.bytes`；UTF-8 no BOM / LF 按原 helper 序列化，不 pretty-print 或 collapse inline whitespace。Recipe 中 source locators 使用原 ID/引用 anchor，不受 pruning 后 paragraph ordinal 变化影响。保留所需完整 reference prefix，不重编号。

**Raw/frozen digest 更正**：原 C packet 将两个 frozen paragraph digest 标作 raw prehash。本次实际 A serializer 对未处理 DOM 独立核验：FRB raw Main p5 `1c3434cc6f2c022b8461aec0c726db8969900df75c44727b09e04a05a718dc8b` / frozen `6c4a2d899f9bfa7a2cd7c4263e7f0e67dbc70a9623fe3560254b8502fadeb3d6`；chemistry raw Results p0 `146a939c2e4551225269d70f3ac93507bdbebc0c85ffb8629ae19c469d164f6c` / frozen `1d03f1991268ca7b64f42caa0f4a5e348594a8d2c129ce9cd756ff5ca7b1359f`。去除 tracking attrs 造成区别，原 raw bytes/source hash/科学内容不变，B/C input 未编辑。

## 因果链与独立失败

Implementation bug：PRD §3 要求保留 source 科学语义/上下标、优先原 TeX、不伪造公式；EDD §2.3–2.5 要求 Nature semantic adapter 与 existing normalizers 分层处理。原 DOM 普通 bracket edges 跨 `.u-small-caps` 或 `sup` inline nodes，当前 numeric-only `replaceScientificBracketText()` 没有为其保留 typed literal 身份。Defuddle 正常把 text brackets 转义为 `\[...\]`，`normalizeLegacyDelimiters()` 缺少原 source 身份而解释成 math。这是首个无效状态；不是 Defuddle escaping 或合法 `\_` 应被全局取消。

- FRB own excerpt 原 8 display 三方言实际均 11，另 caption 中两处 label 变成 inline math；全部 5 literal labels 丢失。完整 B source 8→17 是更大的既有 C packet，本 reduced excerpt 不冒充其 counts。
- Chemistry 原 0 display 三方言实际均 1。先变成 `$<sup>3</sup> H$`，后在 academic-inline 中嵌入孤立 `$^{3}$`，得到 `$$^{3}$ H$`。
- 诊断只在 adapter clone 的源 text bracket edges 添加现有 typed literalText markers，生产/source bytes 不变：FRB 恢复 8 display 和 literal labels，chemistry 恢复 0，但仍有 `[ $^{3}$ H]` leading isotope attachment 缺陷。该干预只证明因果，不是生产实现、真实 source admission 或整个 validator PASS。
- FRB excerpt 仍有 8 个 unrelated unit isolated-superscript failures（#48）；chemistry 有 Å units/ordinary bases与两处 leading isotope。全部 production validators 仍执行，本合同不把这些 failures 当已修复。永久测试仅允许明确分列的 `scientific-isolatedSuperscript` 残留，并拒绝新增 delimiter issues；不改 validator。

## 最小拟 diff / 边界计划（尚未应用）

仅 `src/adapters/nature.mjs` 既有 `replaceScientificBracketText()`：保留 tree walker、marker storage/return、typed `literalText` API 与 parser 顺序；numeric-only pattern 改为对 source text 的 `/(?<!\\)[\[\]]/gu` bracket edges，明确 source `\[` / `\]` 继续 legacy path；existing MathJax/equation/reference DOM guard 保留，并排除 `code, pre, kbd, samp, a[data-test="citation-ref"], a[href*="#ref-CR"]`，与原 supported citation selectors 一致。没有 normalizer、figures、inline parser、transport 或全局 Markdown unescape/禁用 legacy 的变化。Root已串行确认该最小函数的文件所有权，永久RED commit先于实现。

永久 tests 在完整 clipNature/Defuddle/normalizers/renderers/全部 production validators 上核验 2 源 × 3 方言：FRB 5 个 label、8 原 equation typed payload/ID/order/number/rows/inline math、Methods targets；chemistry 两处 literal boundaries/mass/compound label 顺序/0 display，不把 standalone leading sup 当正确 attachment。Synthetic 控制明确标记且不算来源 admission：typed MathJax、明确 legacy `\[...\]`/`$$...$$`/inline、escaped source delimiters、numeric crystal directions、code/pre/kbd/samp DOM、bracket citation range/ordered references/known section targets。

## 实际命令与结果

External reports root：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-literal-brackets-preflight`。Source scripts 只读 Git objects/原 raw/production，不 fetch/writer。完整 raw 仍只在 B external TEMP。

| Command | Actual result |
| --- | --- |
| `npm ci` | exit0，65 packages / 0 vulnerabilities，Node `v24.14.1`。 |
| `node <external>/source-audit.mjs <own-worktree>` | exit0：2 raw body hashes/bytes/canonical/DOI、35+9 creators、完整 notice/link/prehash、copyright metadata、footer与原 paragraphs核验。 |
| `node <external>/reproduce.mjs <own-worktree>` at 478 / e2 | **exit1**，正确 source display期待失败；两源 × 3方言 `8→11` / `0→1`。Reports `preflight-478-report.json` / `preflight-e2d32e9-report.json`，分阶段输出仅 external。 |
| `node <external>/causality.mjs <own-worktree>` | exit0；clone intervention恢复正确 source display counts，仍独立 isotope/unit科学失败；`causality-478-report.json`，非生产修复。 |
| `node <external>/freeze.mjs <own-worktree>` | exit0：两own excerpts原始scientific bytes/hashes，recipe repeat/idem；`freeze-e2.log`。 |
| `node --test test/nature-literal-brackets.test.mjs` | **exit1**：12 tests，6pass/6fail，0skip/todo/cancel，1672.021ms。真实 source cases 全6因正确 source display count失败；所有 compat controls与source checks pass。`permanent-e2-red.log`。 |
| `git diff -- src/adapters/nature.mjs src/normalizers/math.mjs src/normalizers/academic-inline.mjs src/normalizers/figures.mjs` | empty，尚未生产编辑。 |
| `git diff --check` / owned filenames/status审计 | exit0，只有本合同own fixture/test/handoff。 |

可恢复 external packet 包含 source-audit/reproduce/freeze/causality scripts、A实际dependency blobs、源审计/初始与accepted e2 RED/clone因果报告、原 own excerpt bytes、独立 leading isotope失效context、Issue body和 `proposed-nature.diff`。Setup 修正诚实记录：首次 Git manifest读超过 spawnSync 默认buffer；首次 stage脚本误用 Nature未提供的 `bodyHtml`；修正为有界buffer与现有document/defuddle production路径后才得到上表有效诊断。Synthetic legacy-subscript无typed保护的转义属于既有独立限制，compat控制使用普通变量验证正确display/inline role，不以该限制扩大本合同。

Full/affected tests、build/golden、PR/CI 暂未运行：目前是 unchanged-production permanent RED，按已释放gate开始最小修复后必须完整执行，不能以本检查点完成 Issue #53 或 #10。
