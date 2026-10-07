# Issue #53 — literal brackets delivery handoff

状态：`PR_READY_FRESH_CI_PENDING`。[PR #54](https://github.com/uwougil/Academic-clipper/pull/54) 的独立 P2 已追加永久 RED→GREEN 修复，并 non-destructive merge 最新 accepted unit prerequisite；完整 clip 控制覆盖 `kbd/samp` 及 opaque `code/pre`。两个真实来源 × 三方言的 literal boundary / phantom display 行为保持，source excerpts/provenance 与原 RED commit 逐字节一致。组合后的 own FRB excerpt 剩余 math issues 为0，chemistry仍有2个独立 leading-isotope attachment失败；不声明完整 articles/corpus 通过。独立 [Issue #53](https://github.com/uwougil/Academic-clipper/issues/53) 为一个窄 Work Contract，不分摊 #10 的普通交付责任。一个 final delivery PR 使用精确独立 `Refs #53` 行；root 负责独立 review/merge，merged-commit Main CI 成功才完成 Issue。

## 基线、文件与范围

- Initial accepted/source audit base：`4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2`。两个原来源 × 三方言均真实 RED。
- 原 P2 修复 accepted base：`e2d32e9ec819692a1f08075636c3a168f15ad20b`。重新 fetch 核验 [Main CI 37278003744](https://github.com/uwougil/Academic-clipper/actions/runs/37278003744) 三 jobs `111659279964` / `111659280091` / `111659280101`、[Secrets 37278003787](https://github.com/uwougil/Academic-clipper/actions/runs/37278003787)、[finalizer 37278762752](https://github.com/uwougil/Academic-clipper/actions/runs/37278762752) success；#51 于 `2026-10-05T07:37:25Z` closed/completed 后才 fast-forward 到此 base。Source excerpt bytes 保持。
- 最新 accepted base：`6b90413d806f7e611b00559c8208f6b95b31dd1e`（独立 #48 / PR #50 unit fix）。Actual fetched main与该SHA一致；[Main CI 37323651988](https://github.com/uwougil/Academic-clipper/actions/runs/37323651988) jobs `111808767556` / `111808767880` / `111808768068` 全success；[Secrets 37323651876](https://github.com/uwougil/Academic-clipper/actions/runs/37323651876) / Gitleaks `111808766995` success；#48 `2026-10-05T14:25:28Z` closed/completed 已独立核验。Merge commit `35aad9bf2dbd46b74fb74551d7a339333fdb5690` 保留全部既有RED/fix SHAs且无conflict，不把unit实现变成本Issue的diff。
- 新 managed worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-literal-brackets/academic-clipper`；branch：`codex/issue-10-bug-literal-brackets`。旧 #52 author branch/worktree 保持 clean `b493ac7842a6c03b4a12732edc1495bcf00dcfd1`，没有把新工作塞入 #51/#52。
- Owned 文件：`src/adapters/nature.mjs` 仅 `replaceScientificBracketText()`、`test/nature-literal-brackets.test.mjs`、`test/fixtures/nature-literal-brackets/.gitattributes`、该目录两源各自 `article.excerpt.html` / `provenance.json`、本文。没有 B/C oracle、manifest、validator/security/deps/golden/spec/intent 或其它生产改动。
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

## 最小修复 / 验收映射

仅 `src/adapters/nature.mjs` 既有 `replaceScientificBracketText()`，production **5 additions / 6 deletions**：保留 tree walker、marker storage/return、typed `literalText` API 与 parser 顺序；numeric-only pattern 改为对 source text 的 `/(?<!\\)[\[\]]/gu` bracket edges，明确 source `\[` / `\]` 继续 legacy path；existing MathJax/equation/reference DOM guard 保留，并排除 `code, pre, a[data-test="citation-ref"], a[href*="#ref-CR"]`，与原 supported citation selectors 一致。`kbd/samp` 经 Defuddle 渲染为普通文本，继续使用 literal markers，而不按 opaque code 排除。没有 normalizer、figures、inline parser、transport 或全局 Markdown unescape/禁用 legacy 的变化。Root已串行确认该最小函数的文件所有权，两个永久RED commits都先于对应实现。

永久 tests 在完整 clipNature/Defuddle/normalizers/renderers/全部 production validators 上核验 2 源 × 3 方言：FRB 5 个 label、8 原 equation typed payload/ID/order/number/rows/inline math、Methods targets；chemistry 两处 literal boundaries/mass/compound label 顺序/0 display，不把 standalone leading sup 当正确 attachment。Synthetic 控制明确标记且不算来源 admission：typed MathJax、明确 legacy `\[...\]`/`$$...$$`/inline、escaped source delimiters、numeric crystal directions、bracket citation range/ordered references/known section targets；新增 `kbd/samp/code/pre` × 三方言完整 clip model、最终 Markdown、零 inline/display 与全部 validators，不再以 `kbd/samp` adapter DOM 未改来推断最终表达正确。

原e2上的来源 clip 实测：FRB 三方言 display 均为 **8**，5 个原 label完整保留；chemistry 三方言均为 **0**，两literal边界/mass/compound labels保持。FRB原8equations typed payload、number association/order/rows与两个原inline MathJax完整；零新增 delimiter issues/raw HTML/cross-reference/structure failures。原8 FRB单位及6 chemistry scientific-isolatedSuperscript issues由原validator拒绝（包括两leading isotope）；accepted6b单位修复合入后变为0与2，来源与正确attachment expectations未改。这是独立窄行为验收，不是 whole-article math PASS。

## Ordered commits

| 顺序 | SHA / 作用 |
| --- | --- |
| 1 | `37f10500db7a362617ecf4de98fa087fca87e1f8`：原e2生产未改，ownlawfulfixtures/provenance/12永久tests与RED handoff；6原source cases真FAIL。 |
| 2 | `437fe52f21d55ac2b657071b7741cc25f9500ab9`：仅Nature函数最小typed fix、测试对source equation number trim与更强final顺序/编号关联；没有改source/oracle科学内容。 |
| 3 | `375361f768dc5fb8b85fa732123517987234438f`：原本文/source verification receipt；该头标准检查与 CI 通过，仍被独立 `kbd/samp` P2 阻塞。 |
| 4 | `37cb22cb51bd5e39afa173daedb54674d8028113`：tests-only P2 RED checkpoint；生产与375一致，24tests中仅6个 `kbd/samp` × 三方言 FAIL，source6例/opaque code6例保持通过。 |
| 5 | `e27d80be6311af5fd147b8e0b9dfd046060a216f`：同函数一行 guard 移除 `kbd, samp`，恢复其 literal protection；code/pre/math/ref/citation guards不变。 |
| 6 | `d159eb35102bedb36d96056df61ac976d4eb5a90`：P2 final receipt；24focused/108affected/337full与source byte/network证明对应此旧base头。 |
| 7 | `35aad9bf2dbd46b74fb74551d7a339333fdb5690`：non-destructive merge accepted6b，父提交d159与6b；本Issue source/test/production不变，无conflict。 |
| 8 | 本次组合后的 final handoff receipt；精确 SHA 用 `git log -1 --format=%H -- docs/goals/issue-10/bug-literal-brackets-handoff.md` 重建，PR body/CI 提供此最新 exact head。 |

首次GREEN阶段，FRB旧测试把source number DOM缩进空白直接拿来查Markdown。独立观察source number `(1)…(8)` 与原accepted输出一致后，测试仅trim周围空白并加强 final TeX后邻number/order，不改originalTeX/number provenance。最终tests再次在e2原adapter/clip Git模块snapshot上执行，只有 import URL/fixture URL改为外部路径：12 tests仍6pass/6fail；same最终tests在fix上12pass。Baseline adapter Git blob `7757ed87fb64573c8e1bd706fbee4aaa041dea7c`、43112bytes、SHA `d3fb165544bd87bed5c6dc37b1653ba2aed1ecd4561ab78b83d414371b96f4c8`；clip blob `13e08d222ebc894c4e42e3de723c76691bcc5b93`、38116bytes、SHA `38c8278a0f070f3008b27b88f8c3d0a546da3c4b3aa7fc250853fced3d4cef47`。没有生产复刻parser、global patch或临时source科学变体。

## 原375检查记录（P2之前）

External reports root：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-literal-brackets-preflight`。Source scripts 只读 Git objects/原 raw/production，不 fetch/writer。完整 raw 仍只在 B external TEMP。

| Command | Actual result |
| --- | --- |
| `npm ci` | exit0，65 packages / 0 vulnerabilities，Node `v24.14.1`。 |
| `node <external>/source-audit.mjs <own-worktree>` | exit0：2 raw body hashes/bytes/canonical/DOI、35+9 creators、完整 notice/link/prehash、copyright metadata、footer与原 paragraphs核验。 |
| `node <external>/reproduce.mjs <own-worktree>` at 478 / e2 | **exit1**，正确 source display期待失败；两源 × 3方言 `8→11` / `0→1`。Reports `preflight-478-report.json` / `preflight-e2d32e9-report.json`，分阶段输出仅 external。 |
| `node <external>/causality.mjs <own-worktree>` | exit0；clone intervention恢复正确 source display counts，仍独立 isotope/unit科学失败；`causality-478-report.json`，非生产修复。 |
| `node <external>/freeze.mjs <own-worktree>` | exit0：两own excerpts原始scientific bytes/hashes，recipe repeat/idem；`freeze-e2.log`。 |
| `node --test test/nature-literal-brackets.test.mjs` | **exit1**：12 tests，6pass/6fail，0skip/todo/cancel，1672.021ms。真实 source cases 全6因正确 source display count失败；所有 compat controls与source checks pass。`permanent-e2-red.log`。 |
| `node <external>/baseline-proof.mjs <own-worktree>`（最终tests） | harness exit0，内层 `node --test <external>/baseline-literal-brackets.test.mjs` **exit1**：12tests，6pass/6fail。e2 source snapshots+全部相同assertions；`final-test-e2-red.log` / `final-test-e2-red-proof.json`。 |
| `node --test test/nature-literal-brackets.test.mjs`（fix） | exit0，12pass/0fail/0skip，1678.473ms；`focused-green.log`。 |
| `node --test test/nature-literal-brackets.test.mjs test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-table-notes.test.mjs test/nature-caption-citations.test.mjs test/nature-table-mathjax.test.mjs` | exit0，96pass/0fail/0skip，4902.374ms；含原footers/caption/math/dialect guards；`affected-green.log`。 |
| `npm ci`（final） | exit0，65packages/0vulnerabilities，使用原lockfile。 |
| `npm test` | exit0，325pass/0fail/0skip/todo/cancel，98704.714ms；`full-green.log`。 |
| `npm run build` | exit0，ignored `dist/extension` 正常生成；`build-green.log`。 |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0，原Nature golden 13display/50refs，全部四validators/scientificFragments valid；`golden-green.log`。 |
| `node <external>/reproduce.mjs <own-worktree>`（fix437fe52） | exit0，源6cases counts8/0，fixture原hash/bytes、repeat/idem不变；`preflight-437fe52-report.json` / `source-green.log`。 |
| `git diff e2d32e9 -- src/normalizers/math.mjs src/normalizers/academic-inline.mjs src/normalizers/figures.mjs papers docs/PRD.md docs/EDD.md docs/specs src/security.mjs package.json package-lock.json` | empty。 |
| `git diff --check` / staged checks / owned filenames/status审计 | exit0，只有本合同8个ownedpaths；source fixture原bytes保持。 |

可恢复 external packet 包含 source-audit/reproduce/freeze/causality scripts、A实际dependency blobs、源审计/初始与accepted e2 RED/clone因果报告、原 own excerpt bytes、独立 leading isotope失效context、Issue body和 `proposed-nature.diff`。Setup 修正诚实记录：首次 Git manifest读超过 spawnSync 默认buffer；首次 stage脚本误用 Nature未提供的 `bodyHtml`；修正为有界buffer与现有document/defuddle production路径后才得到上表有效诊断。Synthetic legacy-subscript无typed保护的转义属于既有独立限制，compat控制使用普通变量验证正确display/inline role，不以该限制扩大本合同。

## 独立 P2 与追加 RED→GREEN

独立 reviewer 在 exact `375361f768dc5fb8b85fa732123517987234438f` 找到一个 P2：新的排除 guard 把 `kbd/samp` 当 opaque code，但 Defuddle 把它们渲染为普通 text，`[100]` 的转义因此再次进入 legacy display normalization。Accepted e2 的完整 clip 输出为 `# Untitled\n\n[100]\n`、0 display；375 输出为 `# Untitled\n\n$$\n100\n$$\n`、1 display。两标签 × 三方言全部真实回归；`code/pre` 同样输入保持原 code 表达且 0 display。这些是 synthetic compatibility controls，不是科学来源或新文章 admission。

最小 HTML：`<!doctype html><html><body><div class="c-article-body"><p><kbd>[100]</kbd></p></div></body></html>`；用 `samp` 替换 `kbd` 同样。新增永久测试先在生产375 unchanged上取得24tests/18pass/6fail，之后才提交一行 guard 修复。原 adapter-only 控制中 `kbd/samp` 的 opaque 前提被完整 clip 回归替代，code/pre/ref/citation guards的控制继续保留。原科学 fixture/originalTeX/attachment/counts/right/creator/provenance assertions没有变化。

独立旧头 packet 位于 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-review/pr54-375361f-review.md` / `pr54-kbd-samp-375361f.test.mjs` / `.test.log` / `.json`。Raw/A actual helper/137 retained blocks/35+9 creators/CC rights/raw-vs-frozen correction/8 equation-number空白/source semantics已独立核验；source四文件仍与原37f Git blobs相同，因此复用该有效审计。旧375的绿色标准检查及CI不能替代新头 review。

| 新命令（own worktree） | Actual result / external receipt |
| --- | --- |
| `node --test test/nature-literal-brackets.test.mjs`（P2 RED，375 unchanged生产） | **exit1**，24tests / 18pass / 6fail，0skip/todo/cancel；仅kbd/samp × 三方言display 1≠0，source六例与code/pre六例通过；`p2-permanent-375361f-red.log`，tests-only37cb checkpoint。 |
| `node --test test/nature-literal-brackets.test.mjs`（P2 fix） | exit0，24/24pass，0skip/todo/cancel，1988.4033ms；`p2-focused-green.log`。 |
| `npm ci` | exit0，65packages，0vulnerabilities，原lockfile不变；`p2-npm-ci.log`。 |
| `node --test test/nature-literal-brackets.test.mjs test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-table-notes.test.mjs test/nature-caption-citations.test.mjs test/nature-table-mathjax.test.mjs` | exit0，108/108pass，0skip/todo/cancel，16160.5582ms；`p2-affected-green.log`。 |
| `npm test` | exit0，337/337pass，0skip/todo/cancel，92570.1979ms；`p2-full-green.log`。不改launcher/timeouts，没有以旧325测试receipt冒充新头。 |
| `npm run build` | exit0，ignored dist正常生成；`p2-build-green.log`。 |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0，原golden13display/50refs，全部validators/scientificFragments valid，golden不变；`p2-golden-green.log`。 |
| `node <external>/p2-compatibility-proof.mjs <own-worktree>` | exit0；从exact e2/375 Git Nature+clip modules仅重定位imports，12 synthetic controls的fixed完整Markdown全部与accepted相同，旧375只有6个kbd/samp回归；再检查6真实source cases为8/0，仍保留独立unit/isotopeissues。4 source文件Git-byte-identical于37f；fetch/DNS/HTTP/HTTPS/net/TLS traps记录0 attempts，无writer；`p2-compatibility-proof.json` / `.log`。 |
| `git diff --check` / staged checks / owned filenames / protected paths / clean status | 通过；P2只增test、同一Natureguard行及本文；source fixtures/provenance/oracles不变，旧52仍b493 clean。 |

上述追加本地检查的生产/test内容固定于e27；最终仅本文receipt追加，PR body/CIcards提供最新 exact clean head 的fresh三平台CI/Gitleaks。新独立review及merged-commit Main CI尚待外部结果，本文不制造已成功receipt。Root只在其独立门槛满足后merge。作者不自行merge或关闭Issue，不声明Issue #10 complete。

## Accepted #48 dependency 组合与新头验证

仅在 #48 完成、6b Main CI 三平台与Secrets成功并独立fetch确认后，执行 `git merge --no-ff 6b90413d806f7e611b00559c8208f6b95b31dd1e -m "Merge accepted unit fix for literal bracket composition"`。Merge35aad保留原source RED37f/P2 RED37cb/fix437fe52/e27，ownNature函数、永久24tests、4source文件与d159全相同。相对于最新accepted6b，PR仍只有原8个ownedpaths；academic-inline/units fixtures/tests属于已accepted dependency，无本Issue新增修改。

此次全量重测由accepted生产base变化触发。只执行一次full；向root发送start/terminal安排本机CPU串行，未修改launcher/timeout，没有docs-only全量重跑。以下命令的code/test树固定于merge `35aad9bf2dbd46b74fb74551d7a339333fdb5690`，随后最终只追加本文receipt：

| Command | Actual composition result / external receipt |
| --- | --- |
| `node --test test/nature-literal-brackets.test.mjs` | exit0，24/24pass，0skip/todo/cancel，2157.9558ms；`composition-6b-focused-green.log`。原6source cases与6kbd/samp fullmodel/finalMarkdown控制及6opaque code/pre控制通过，source/oracle assertions未改。 |
| `npm ci` | exit0，65packages / 0vulnerabilities，原lockfile不变；`composition-6b-npm-ci.log`。 |
| `node --test test/nature-literal-brackets.test.mjs test/nature-adapter.test.mjs test/output-quality.test.mjs test/nature-table-notes.test.mjs test/nature-caption-citations.test.mjs test/nature-table-mathjax.test.mjs test/nature-scientific-units.test.mjs` | exit0，142/142pass，0skip/todo/cancel，14201.5999ms；`composition-6b-affected-green.log`。包含原notes/caption/tabletypedmath与accepted unit/code-opacity guards。 |
| `npm test` | exit0，371/371pass，0skip/todo/cancel，92880.6421ms；`composition-6b-full-green.log`。 |
| `npm run build` | exit0，ignored dist正常生成；`composition-6b-build-green.log`。 |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0，原golden13display/50refs，四validators/scientificFragments valid；`composition-6b-golden-green.log`。 |
| `node <external>/composition-6b-compatibility-proof.mjs <own-worktree>` | exit0，12synthetic controls fixed完整Markdown全部与accepted6b相同，旧375仅6kbd/samp失败；6真实source在accepted6b仍11/1 display RED，组合后8/0 GREEN；4source files与原37f Git-byte-identical；fetch/DNS/HTTP/HTTPS/net/TLS traps记录0 attempts，无writer。`composition-6b-compatibility-proof.json` / `.log`。 |
| `git diff d159eb35102bedb36d96056df61ac976d4eb5a90 35aad9bf2dbd46b74fb74551d7a339333fdb5690 -- src/adapters/nature.mjs test/nature-literal-brackets.test.mjs test/fixtures/nature-literal-brackets` | empty。 |
| `git diff 37f10500db7a362617ecf4de98fa087fca87e1f8 -- test/fixtures/nature-literal-brackets` / diffcheck / protected paths / clean status | source Git bytes全不变、checks通过；复用有效137blocks/rights/35+9creators/Arecipe独立rawaudit，未重复采集或生成source。 |

Actual accepted `src/normalizers/academic-inline.mjs` dependency blob `a63eba2cacf0bc0a43552d1c16ec41e91b2cf0bc`，13076bytes，SHA-256 `4d5baa998adb27d6c76567133b1c226082736254dc74d160a24eff8390b59a0d`，组合HEAD与6b Git bytes/实际imported module一致。比较用6b/375原Nature+clip Git modules只重定位imports，均使用已accepted的同一dependency；未复制生产parser或patch source。完整stage objects/Markdown/counts与零网络记录在externalJSON。

组合后 FRB own excerpt 三方言均8display、0math issues；chemistry均0display、仍2个source-leading-isotope `scientific-isolatedSuperscript`，原`[ $^{3}$ H]`缺陷继续被validator拒绝，不能当正确attachment。旧base的8/6单位诊断降为0/2是独立#48accepted变化，原scientifictruth/TeX/equation identity/附件/creators/rights未改。不据此声明完整FRB/chemistry或Issue10验收通过。PR body/CIcards承载组合后最新clean head的freshCI/Gitleaks；root继续独立review/十门槛与MainCI完成门槛，作者不自行merge。
