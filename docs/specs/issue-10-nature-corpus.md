# Issue #10 — Nature 代表性语料规范

状态：已批准设计的执行规范；尚未实现。2026-10-02。

## 1. 权威、范围与交付

本文件是 [Issue #10](https://github.com/uwougil/Academic-clipper/issues/10) 实现的唯一任务设计来源，受 [AGENTS.md](../../AGENTS.md)、[PRD](../PRD.md)、[EDD](../EDD.md) 的既有意图约束。派生层级为：本规范 → [执行计划](../plans/issue-10-execution-plan.md) → [agent goals](../goals/issue-10/integrator.md) → 实现 commits/handoffs → 一个最终交付 PR。执行者不得自行改写本规范；发现不完整、错误或不可实现的假设时，停止依赖该假设的工作，保留证据，在 handoff 中提出修订，等待明确人工授权；可继续不依赖该假设的工作。

目标是建立 5–10 篇源自真实 Nature / Nature Portfolio article DOM 的可复现回归语料。完整链路必须是：

```text
Nature DOM → src/adapters/nature.mjs → Defuddle / src/markdown.mjs
→ academic normalizers → renderer → production validators → final Markdown
```

Nature 是本任务唯一 publisher。方法可作为未来 APS、ACS、RSC、Wiley 等家族适配器的工程模板，但本任务不支持这些出版社、不建立通用 publisher abstraction、不改变 PRD/EDD 语义。语料不是样本论文收藏，也不是另一套 parser。

默认 markdown 正文保持 zero raw HTML：图、表、公式内部引用降级为可读文字；section 仅在真实 heading slug 存在时保留链接。quarto 保持 zero raw HTML，使用 fig-/tbl-/eq-/sec- identifiers、语义 citation keys 和匹配的 bibliography。links 仅允许受控 `<a id="..."></a>` 兼容锚点，保持有效 ordered references。现有 golden artifact、writer 事务/恢复、Origin/token/loopback、网络安全、figure fallback 和 Ubuntu Node 20/24、Windows Node 24 CI 矩阵均保持不变。

离线执行不得发生未声明 live DNS/HTTP。独立 parser 缺陷使用独立 bug Work Contract，不在基础设施任务中暗中修复，不伪造 fixture 或放宽 oracle。已知失败不能计入通过的必需覆盖；若必需覆盖依赖 bug 修复，该修复是前置条件，不是拆分 Issue #10 最终交付责任。

一个最终实现 PR 使用精确独立行 `Refs #10`；不使用自动关闭关键词。Merge 只接纳代码，合并 commit 的 Main CI 成功后由既有 automation 完成 Issue。规划 PR 不完成 Issue，不使用该独立行。当前 planning PR 不修改 Issue #10 或 PR #13。

## 2. 已检查的架构与基线

本规范正式化时基线是 main `b489e381620c44b4b3c9e520deca99e154d39f77`，v0.3.2；Undici 更新 commit 为 `45c2b5e7de73af648543130decf5c2b573f0aeb4`。两者的 Main CI 已成功，v0.3.2 证据：[run 37035169455](https://github.com/uwougil/Academic-clipper/actions/runs/37035169455)。执行者仍须检查启动时实际 main 和对应 CI，不依赖版本号或旧声明。

当前 clipNature() 自动调用 hydrateNatureTables()；后者支持 fetchImpl/resolveHostname，前者尚未透传。fetchNatureArticle() 已复用 safeFetchExternal()，包含文章 redirect scope、30 秒 timeout、25 MiB body limit。表格 hydration 仍须保持同文章 /tables/ scope。依赖安全更新并不等于 DNS/socket 绑定或所有 resource bounds 已重构；不能将这些能力视为已存在。

不需要拆分大型 nature.mjs 或 clip.mjs。只在必要时增加最小 transport injection/replay seam，保持默认行为和全部安全检查。不得重构 writer、整个 adapter、clip 架构、安全系统或 publisher routing；若正确性确需扩大范围，必须先有人工批准的规范修订。具体 injection API 由 Agent D 检查实际 landed transport 后选择，不能预先绕过生产安全边界。

## 3. 历史 PR #13 处理

[PR #13](https://github.com/uwougil/Academic-clipper/pull/13)，审阅 head `56a1451dbbfff8a69827ac69c6e5ad1607ea9695`，仅作历史参考，不 merge/rebase/cherry-pick 其实现。

| 部分 | 决定 | 原因 |
| --- | --- | --- |
| provenance / expectations / fixtures / optional live 四层 | KEEP THE IDEA | 需要可核验来源和明确 excerpt/full-page 区分 |
| 论文选型、manifest、warning 基线 | NEEDS REDESIGN | 学科多样不证明 DOM 多样；字段必须由断言消费 |
| 所有手工拼写的 article HTML | DROP | 真文章 ID 下的编写内容不能充当源自页面的证据 |
| manifest 与端到端 tests | REIMPLEMENT FROM CURRENT MAIN | 使用当前方言、生产 validators、确定性 replay、语义 oracle |
| broad minimum counts、强制 Main/Methods、default HTML anchors | DROP | 会掩盖丢失/重复，且与实际结构/默认方言不符 |
| live verifier | REIMPLEMENT FROM CURRENT MAIN | 不采用 unrestricted fetch、自动跟随 redirect、无界 body 或 DOI 子串匹配 |
| 文档、脚本命令 | KEEP THE IDEA | 重写为实际执行契约，不继承旧测试总数或完成声明 |
| milestone 完成声明、PRD/EDD 扩写、旧关闭语言 | DROP | 未实现不能声称完成；本任务不改变意图或生命周期 |

旧 golden fixture 的编写公式/计数不是现有完整 golden；quantum fixture 的 metadata 不可靠；AlphaFold caption/Extended Data 是编写内容；citation fixture 的分离 endpoint anchors 不证明范围展开；pangenome consortium/multiple-correspondent 宣称缺少对应断言；materials/chemistry/astronomy 的编写表格、条件、坐标不能继承。新规范无需阅读这些旧文件才能执行。

### Historical PR #13 salvage list

- 四层组织、候选研究线索、warning expectations、main/Extended Data 区分。
- 实际生产链路及 Quarto 验证、offline/live 命令、结构化 live 指标。
- 基础设施与独立 bug 分离。
- 不原样保留任何旧 HTML、计数、fetch 实现或验收声明。

## 4. 候选覆盖矩阵与 admission gate

下表是研究候选与必须寻找的覆盖角色，不是已采集、已验证的 DOM 或计数。不得将候选的预计内容写成已观察事实。每条最终 coverage 必须对应 retained block 和独立断言。

| URL / article identifier | 目标结构 | 保护行为与 offline oracle |
| --- | --- | --- |
| https://www.nature.com/articles/s41586-026-10401-1 | golden 磁序、scientific runs、主图/Extended Data、表格、crossrefs | 实际 metadata；原 TeX/科学符号；图序/caption sibling；Table 1 replay 与 fallback；各方言内部引用 |
| https://www.nature.com/articles/s41534-023-00746-0 | equation-heavy quantum；Introduction/Results/Methods；编号、多行数组 | 从源确认选定公式及 Eq. (9)；exact IDs/TeX/row separators；真实 hierarchy 和 equation targets |
| https://www.nature.com/articles/s41586-021-03819-2 | 多图、长面板 caption、Extended Data | 分开计数；caption 首尾/panel sentinels；短 alt；图位于相邻正文之间；不重复 description |
| https://www.nature.com/articles/s41586-020-2012-7 | 密集 citation、update/addendum、非公式正文 | 原 cluster 的有序 numbers 与定义；superscript 不混淆；abstract 顺序；实际 update UI 排除；零 display 仅在确认后断言 |
| https://www.nature.com/articles/s41586-023-05896-x | 长 authors/affiliations、嵌套章节、supplementary links | 完整 metadata 作者序列；选定 notes/contributions/correspondence；Unicode；不把 XLSX/PDF 伪造成 HTML table |
| https://www.nature.com/articles/s41586-023-06735-9 | materials 科学行内、caption、data/code links | 从实际 sub/sup/italic/MathJax 选例；adjacency/units；外链不变成 local targets；不继承旧表格声明 |
| https://www.nature.com/articles/s41467-023-44030-3 | chemistry compound numbers、receptor subscripts、Greek | 实际粗体 compound markers、GABA subscripts、units；citation 与 compound 数字不混淆；真实 sections |
| https://www.nature.com/articles/s41586-021-04354-w | astronomy units/coordinates、figure/section/supplementary refs | 原 primes/signs/uncertainty/negative powers；各方言 crossrefs；外文章 fragments 保持外部；表格仅确认后计入 |

Admission 步骤：验证 canonical/DOI article identity → 验证公开且有实质正文的 usable article DOM → 确认目标结构 → 记录 equation wrappers、caption placement、Extended Data、reference list、metadata 和 section 变体 → 拒绝结构冗余 → 冻结 source-backed contract。Preview/login/consent/challenge 页面不算可用全文。无法访问或不增加结构覆盖的候选必须替换，记录拒绝理由；绝不制造内容。保持 5–10 条，每个必需角色有可执行覆盖。

Tables 必须同时保护真实结构化 HTML 和无 HTML cells 的链接/warning fallback。Golden 提供已知研究线索；若缺少第二种真实 table layout，应在 5–10 篇范围内新增/替换一篇可访问、有不同 header/span/cell 结构的文章。Synthetic variants 可补充 spans、pipe escaping、failure paths，但明确标记，不算另一篇真实文章或真实结构证据。

## 5. Fixture 与 sanitization

```text
test/corpus/
  corpus-manifest.json
  fixtures/<article-id>/
    article.excerpt.html
    tables/<resource-name>.excerpt.html
```

输入是 parseNaturePage() 之前的源自页面 HTML excerpts，不是 parser-cleaned HTML、semantic placeholders 或 full Markdown snapshots。禁止编写 scholarly prose/formulas/captions/tables、secret/session state、默认提交 image/PDF/XLSX binaries 或完整 raw captures。完整响应仅内存或临时外部路径；不写入 golden 或普通 papers artifacts。

采集步骤：guarded fetch → structured identity/正文检查 → untouched DOM 上选择完整 semantic blocks 与必要 ancestors/siblings → deterministic sanitizer → source review → excerpt contract → audit/tests。保留 citation 原编号；当前 references 按 list position 编号，因此保留到最高选定 reference 所需的完整 prefix，禁止静默重编号。

保留 parser-relevant topology、node order、IDs/classes/data-test/data-title、heading levels、TeX/MathJax、scientific i/b/sub/sup、Unicode/entities/有意义空白、src/srcset/lazy-source relationships、caption siblings、table header/span/cells/notes、reference DOM 和 article-level JSON-LD。JSON-LD 是非执行 metadata 例外，只保留相关 article object；记录裁剪转换。

移除 executable scripts、analytics、ads、无关 recommendations、consent/account/session、hidden form state、event handlers、embedded binary/data URLs、tracking/access signatures、cookie/token/private/local path material。保留少量经过 sanitization 的真实 UI blocks 来验证排除；人工 sentinel 只能放入标明 synthetic 的变体。Public scholarly contact metadata 仅按所需保留，不混入账号信息。

序列化 UTF-8 无 BOM、LF、固定 scaffold 与确定性 attribute ordering。不得 pretty-print inline nodes 或全局 collapse whitespace。重复同一输入和 recipe 输出相同 bytes；再次 sanitization 幂等。目标每篇 20–150 KiB，默认上限 article 256 KiB、table 64 KiB、全 corpus 约 2 MiB，超限须记录理由和 integrator 审核，不能删掉 stress topology 来凑大小。

## 6. Provenance 与 schema

Schema 拒绝未知字段、重复 article IDs、不安全/越界 fixture paths、未消费 expectations。可增加清晰版本化的资源/recipe 字段，不改变以下语义：

| 字段 | 定义 |
| --- | --- |
| articleId / url / doi / title / journal | 经来源核验的 article identity |
| observedAt / captureMode | 真实获取时间与方式；测试不得要求固定日期 |
| sourceSha256 | 对实际获得的原始 HTTP body bytes（HTTP 解压后、任何 decoding/DOM/sanitization 前）做 SHA-256；每个 table resource 独立记录；不含 headers/cookies |
| fixtureSha256 | 对各 committed excerpt 文件的实际 UTF-8 bytes 做 SHA-256，包含 LF；不包含 manifest 本身 |
| sanitizerVersion | 使用的确定性转换版本与 recipe 标识 |
| retainedBlocks | 原 source locator/ID、role、source subtree digest；digest 用同版本的确定性 subtree serializer 对 sanitization 前 DOM subtree 的 UTF-8 bytes 计算，记录 serializer 版本 |
| transformations / omittedContent | 删除、替换、scaffold 与未覆盖内容清单 |
| coverage / expectations | 每个 feature 关联 source block 与 assertion ID；独立审核的 excerpt oracle |
| liveObservations | full-page observations、相同 retained projection 的 structure/payload signatures，与 excerpt counts 分开 |

Structure signature 包含相关 tags/attributes/topology/order，排除 scholarly text；payload signature 包含保留文本/TeX/语义资源值。明确同一 projection/serializer 版本，禁止将整页 hash 或 counts 直接与 excerpt 对比。Hash 仅记录身份，不能替代 semantic review。B 提供 source oracle；C 独立核对，不以当前 parser output 反向定义 expected values。

## 7. Offline regression

每篇 × markdown/quarto/links 走生产链路。Frozen excerpts 使用 exact retained identities/counts，不依赖 broad minima；不同论文不强制同一 Main/Methods hierarchy。Assert metadata 与有序 authors、实际 date precedence、author notes/affiliations/contributions/correspondence 可用字段；不新增未支持的 received/accepted dates 或 multiple-email promise。

逐类 oracle：abstract 首尾和 paragraph order；heading level/text 有序 tuples 与 parent-child；equation IDs/count/source TeX/number association/nesting/row breaks；科学行内 attachment、chemical/units/Greek/compound 样例；figures main/Extended Data identities、image candidate selection、caption 首尾/panels、short alt、邻近正文位置；table dimensions/cells/status/url/warning；citation cluster 有序 numbers、引用定义或 bibliography keys；dialect-specific crossrefs、外文章 fragments；UI 排除；debug counts/status/metadata audit 与 oracle 一致。

所有 production validators 必须执行：validateMathDelimiters（含 scientificFragments）、validateMarkdownStructure、validateRawHtml、validateCrossReferences。它们不证明 semantic completeness；增加上述显式断言。零 markers/MathML garbage/legacy delimiters、零 unexpected warnings。Default/quarto 禁 HTML；links 仅 strict anchors。Quarto referencesBib() keys 必须覆盖 emitted citations 且 deterministic。

Replay 只服务声明的 URL/method/redirect resources，fresh response per call，声明 resolver 不访问真实 DNS，记录 request/DNS ledger。任何 undeclared operation 都使 test fail，即使 hydrator catch 后返回 warning；不能仅靠 throw 被吞掉。禁止未复原的 global fetch/DNS mutation。场景至少包括：HTML table success、HTML 无 table、HTTP failure、同 article table redirect、逃离 scope redirect rejection。模拟 responses 必须明确标记。

同输入重复 Markdown bytes 与 semantic summaries 相同；A → B → A 首末 A 相同，保护 DOM/global isolation。Expected warnings 指向 resource/status/原因，不依赖真实网络失败。

Golden 只读，保留完整 artifact 基准：6 authors、3 main/4 Extended Data figures、13 display equations、50 references、Table 1 和 local paths、全部 validators。新 reduced excerpt 不要求复制整个 golden。Known failures 保留最小 truthful reproducer 和正确期待，独立 defect contract；不得计入已通过覆盖或静默降低验收。

## 8. Optional live verifier

计划命令：`npm run test:corpus:live`，支持 `--article <id>`、`--citation-style markdown|quarto|links`、`--json` 和有界正数 timeout；未知 options/ID/非法值拒绝。命令尚未实现。普通 CI 不运行 live，mocked CLI/classification tests 可以运行。

先检查 frozen offline integrity/assertions，再 guarded article fetch、canonical + structured DOI identity（禁止任意 DOI substring）、access/full-body 检查、正常 clipNature()/validators、同 retained projection 的 signatures/semantic invariants。不得调用 writer 或写普通 paper artifacts；report stdout，仅明确指定的外部路径可持久化。复用 guarded production transport，不复制 parser；table live body 最多 25 MiB，timeout 包括 body consumption，保持 URL/DNS/redirect/content-type/article-table scope 检查。缺少必要 resource bound 时仅在最小 seam 的 injected bounded reader 中补齐，不扩大安全架构。

默认 sequential，每条 transient network failure 最多两次 retry，尊重有界 Retry-After；parser failure 不 retry、不绕过 access challenge。Report 同时给 severity（pass/warning/failure/incomplete）与 cause、article、phase、failed assertions/validators、observed signatures、warnings、HTTP/timeout facts；timestamps/duration 不作为离线字节 oracle。

| Cause | 所需证据 |
| --- | --- |
| PARSER_REGRESSION | 未变化 frozen fixture 违反已建立 oracle/validator |
| FIXTURE_DRIFT | offline 仍通过，live 保留结构兼容但 scholarly payload 改变 |
| UPSTREAM_MARKUP_CHANGE | 正文存在而相关 wrappers/selectors/metadata representation 移动或改变 |
| NETWORK_FAILURE | DNS/TLS/timeout/connection/transport HTTP failure |
| ACCESS_BLOCKED | login/consent/challenge/subscription preview/access redirect |
| FIXTURE_INTEGRITY_FAILURE | hash/schema/path/resource/recipe 不一致或缺失 |
| UNCLASSIFIED_FAILURE | 证据不足以归因，保留不确定性 |
| PASS | 全部适用 assertions 通过，无 unexpected warning |
| EXPECTED_WARNING | assertions 通过，仅 declared fallback/absence warning |

新 live parse failure 不自动等于 regression；signature 改变不自动证明因果。允许报告 markup difference 与 validator failure 两项 evidence，而归因仍为 UNCLASSIFIED_FAILURE。网络失败不是 parser pass。

Exit codes：0 无 blocking result（含 EXPECTED_WARNING）；1 parser/fixture failure 或 unresolved parse failure；2 network/access 导致 incomplete；3 drift/markup change 待审；64 usage error。Mixed results 优先级 64 → 1 → 2 → 3 → 0，JSON 保留所有结果。

## 9. 验收与实现边界

最终 implementation PR 应包含 manifest/schema/provenance/sanitizer/replay、source-backed excerpts、全部 dialect semantic tests、golden read-only tests、optional verifier/mock tests、README/derived corpus guide 和必要的最小 seam；不得修改 dependencies、release、extension/launcher、writer、CI matrix 或 PRD/EDD 语义。Package scripts 仅在未来 implementation 中添加，当前规划提交不添加。

必需验证：`npm ci`、`npm run test:corpus`（明确文件列表，无 shell-dependent glob）、`npm test`、`npm run build`、`npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`、`git diff --check`、`git status --short`、tracked filenames/diff 审计，以及三个 CI jobs。Live 按需单列结果，不成为 routine gate。

完成需要 coverage matrix 的每个必需角色有 source block/assertion，5–10 admitted articles，全部 offline checks 无 live network、无 unexpected warning，三 dialect contracts/determinism 成立，truthful provenance/size policy 通过，既有 checks 和 golden 不变。最终 PR 写明 exact commands/results、base SHA、覆盖 omissions、独立 defects 与 spec deviations；最后由 merged-commit Main CI automation 完成 Issue。
