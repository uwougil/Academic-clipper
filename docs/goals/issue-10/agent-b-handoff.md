# Agent B — Nature source handoff（9篇 source contracts）

## 后续 orchestration 与来源署名补充

用户后续 autonomous orchestrator Goal 已取代下文“C 暂未启动，先收尾”的当时状态；C / D 已被自动启动，实际任务和依赖 DAG 见 `orchestration-handoff.md`。这里仍只交付 B-owned source contracts / provenance，不修 production、不改 canonical，也不宣称 Issue #10 完成。

本补充仅新增 9 个 `source-evidence.json` 的 `sourceRights` 字段以及本文/来源指南。消费 A sanitizer `nature-corpus-sanitizer/1.1.0` 与 serializer `nature-corpus-subtree/1.0.0` 原接口；manifest、85 source expectations、13 fixture bytes / hashes、科学内容和 source positions 全部保持。记录完整 ordered authors、原页面完整 Rights and permissions 声明、原始 CC href、声明源 selector/index/hash；golden 源标注 CC BY-NC-ND 4.0，其余 8 源标注 CC BY 4.0。Publisher site footer copyright 与 article notice 分开；4 table 页面没有 CC anchor，真实记录为空并指向所属 article 的许可证据。许可/credit 不被 repository code license 替代，技术转换与 omissions 如实说明。

实际运行 `node $env:TEMP/academic-clipper-issue10-agent-b/record-source-rights.mjs`（只读 audit）及 `.../record-source-rights.mjs --write`：9 article raw hashes / creator arrays / notice positions、4 table raw hashes PASS；manifest bytes 与 13 fixture hashes 不变。随后 `audit-source-contracts.mjs` exit 0：9 payload reviews、13 fixtures、1577502 fixture bytes PASS；其 empty-registry 的 Unconsumed expectation 拒绝仅证明未使用 dummy registry，不能代替 C assertions。全 `test/corpus` 为 3010072 bytes / 29 files，大小政策仍交 integrator 审核，未写虚假 exception。本补充没有 HTTP/DNS、production/parser/tests、完整 raw capture 或 golden 修改。补充 commit SHA 由该 B branch 的 `git log -1 --format=%H` 重建，final integrator 明确选择。

C 当前已独立报告全部 85 source oracle values 与 13 原 body / retained subtree / fixture hash 校验 PASS，待其 durable checkpoint 固化。C 的三 dialect 实测中仍有真实 parser failures；Table-footer 独立 PR #46 正在等待 fresh CI / Secret scan 和独立 review，其余缺陷交独立 bug agents。B 的 explicit C unblocking conditions 仍为：消费实际 A/B interfaces、独立核验科学 oracle、经 D 的 real production seam replay resources、对每个 mandatory expectation 三 dialect 真实执行、严格 warnings / ledgers / deterministic repeat / A→B→A / bibliography / golden；缺陷 landing 后恢复 SAME C，不允许略过失败。

本轮 `audit-index.mjs` 首次在 11 staged files 上校验 13 index hashes PASS，随后因它仅允许 `test/corpus/` source paths、另含 2 个 docs paths 而 exit 1（unexpected staged path），未将该次结果称 secret audit 成功。暂时只 unstaged 两个 docs 后重跑 exit 0：13 index hashes / 9 staged source filename、secret、executable audit PASS；再 stage docs 并核对 11 个明确 owned filenames、`git diff --cached --check` 和 clean post-commit status。没有更改 audit 的 secret 规则或任何 scientific input。

## 收尾状态与未来消费者（上一轮历史）

用户已明确回复 Agent C“暂未启动 先收尾吧”。因此本交付是供未来 C / integrator 选择的 durable handoff；尚未向已启动的 C 任务发送 oracle，也没有独立审核结果。下文先前索取 C taskname/threadID 的问题已得到回答，不再等待该问题的回复，不自行创建 C 任务。

本次收尾复核：remote main 仍为 e85b1b809b56242b89b6313ce5d1165c745466bb，PR #27 planning commit 5971ebf 是其祖先；Main CI run 37182993143 completed/success，Ubuntu Node 20/24、Windows Node 24 三 jobs 均 success。B 本轮复核前 HEAD 与 remote branch 均为 cd176742ef8733b31c6e6d60814183e0a5eb9eb0，工作区干净。此次仅补交本 handoff；新的末尾 commit SHA 可用下文 git log 命令获取，不改变 source contracts 或 fixtures。

| Agent B 要求 | 当前证据与验收状态 |
| --- | --- |
| 5–10 条真实、不同结构的 admission / 来源、转换、omissions / hashes / sizes / oracle positions | 9 篇、4 table resources、13 excerpts、85 expectations；manifest、各 source-evidence 与来源指南已提交。重新执行 source audit 得到 9 source payload reviews / 13 fixtures / 1577502 fixture bytes PASS，index 13 hashes PASS；仅证明 B source/integrity 范围。 |
| A 实际接口、重复生成、sanitization / path / secret audit | 使用下文 A owner commits 和版本；各 source-evidence 记录原始输入、recipe、repeat/idem 与审计。本轮重新核对 raw subtree hashes、fixture hashes、idempotence、projection、retained-block / coverage mapping；没有替换 helper 或 scientific input。 |
| 必需角色的 passing coverage / exact oracle 已交 C 独立审核 | 未完成：C 未启动，scripts/lib/nature-corpus-assertions.mjs 不存在；empty registry 仍正确拒绝 Unconsumed expectation: nature-source-metadata-v1。未来 C 必须独立审核全部来源并真实消费 85 expectations，不能以 B audit 代替。 |
| 已知 parser failures 的处理 | 正确输入、期待与实际失败证据已保留；table footer notes、caption/citations、plain-text scientific units 三项独立 bug Work Contract 草案在下文。未解决的必需覆盖不能计 passing，B 无 production 修复授权。 |
| 全链路 table replay | 当前 src/clip.mjs 仍未向 hydrateNatureTables 透传 fetchImpl / resolveHostname；需 D 的实际 seam，再由 C 做全部 dialect、request/DNS ledger、determinism 与 validators 检查。B 的直接 hydration 诊断不能代替完整 clip 测试。 |
| 规范 / 大小审阅 | canonical 保持不变；caption sibling 及 external fragment 旧疑问已由真实来源解决。全 corpus 含 manifest/evidence 的 2977065 bytes 仍需 integrator 按约 2 MiB 政策审核，未填虚假 sizeException。 |

本轮实际命令：`gh run list --branch main --limit 6 --json databaseId,workflowName,headSha,status,conclusion`；`gh run view 37182993143 --json headSha,status,conclusion,jobs`；`git merge-base --is-ancestor 5971ebf e85b1b809b56242b89b6313ce5d1165c745466bb`（exit 0）；`node "$env:TEMP/academic-clipper-issue10-agent-b/audit-source-contracts.mjs"`（exit 0，source/integrity PASS，registry rejection 如上）；`node "$env:TEMP/academic-clipper-issue10-agent-b/audit-index.mjs"`（exit 0，13 index hashes PASS；当时 0 staged files，故该轮 staged secret scan 不提供新的 source secret 审计证明）；`git diff --check`（exit 0）；`git status --short`（空）；`git ls-remote origin refs/heads/main refs/heads/codex/issue-10-agent-b`（与上列 SHAs 一致）。首次 workflow 查询误用不存在的 main-ci.yml，返回 404；改为枚举实际 CI workflow 并检查指定 run 成功，未将查询失败当作 Main CI pending。

当前 C / D / 独立 bug 修复是验收前置条件，没有可等待的已启动 C handle；本 handoff 不宣称 Agent B 最终验收或 Issue #10 完成。

## 2026-10-04 最新补充交接（下文8-entry记录由此更新）

**当前9篇source-admitted articles、4个table resources、13个excerpts、85个source expectations**。新增source commit f4cafa32274bf0b1ab427c82c950457feb68fa78已在本isolated B branch：test/corpus/corpus-manifest.json；9篇source-evidence.json（补38个mainfigure真实sibling定位）；新fixtures/s41598-018-38309-5/article.excerpt.html、source-evidence.json、parser-defect-evidence.json；docs/nature-corpus.md。前8个manifest article/source expectation values完整保留，12个原fixture hashes未改。Accepted base仍e85b1b809b56242b89b6313ce5d1165c745466bb，A versions/ownership/branch/worktree同下文。Source/integrity验收与独立C验收保持区分，不宣称AgentB/Issue10 complete。

最新source/hash/size/role表与本轮4候选rejection准确ledger见[来源指南最新段](../../nature-corpus.md)。新admitted：[s41598-018-38309-5](https://www.nature.com/articles/s41598-018-38309-5)，Scientific Reports，Satellite-based soil moisture provides missing link between summertime precipitation and surface temperature biases in CMIP5 simulations over conterminous United States，DOI10.1038/s41598-018-38309-5；observedAt2026-10-04T06:56:41.242Z；actualraw487190bytes，SHA a1a135395d984fcda4548aacd0d6eabe0d41bb22c16cc31f4c8f16f8eaf49d51；fixture172171bytes，SHA136cb3b089fac6850fab400bcce1e7b063a2aaccf763f02eeb65697a7700af00。完整source identity/OA/substantivebody gates通过，同approvedanonymousguardedHTTP模式，全文仅externalTEMP。111blocks、3完整sections、1display、4mainfigures、74条source referencesprefix，5个metadata authors，reference锚点在li子p（sourceAnchorId/selector记录ref-CR1…74）；Figure1标签与独立captiondescription、Data Availability大小写/空publicationdate与online2019字段等是新增source DOM变体。所有fixture aggregate1577502bytes，article/tablehardbounds均满足；全corpus含manifest/evidence2977065bytes，metadata大小请integrator审核，未假填sizeException。

### 原coverage缺口核验与纠正

1. **真实externalarticlefragment已取得**：source-crossrefs-v1引用a-reference-9/29/31/35/43/50，6个不同Nature文章#supplementary-information URL，保留源HTTP/HTTPS表示。此角色不再依赖synthetic或GitHubfragment。Productionzero-tableclip诊断中markdown/links保留于References；Quarto保留于referencesBib（按policy正文不渲染reference正文），并没有改成本地target。因同篇其他validators失败，该条目仍不能计为passingcoverage。
2. **撤回“必须figure外description”的B解释**：canonical只要求保留actualcaption siblings/topology，从未规定描述必须在figure外。真实源.c-article-section__figure-content下image容器.c-article-section__figure-item与[data-test=bottom-caption]desc互为有序siblings，且均在figure里；9源38条captionSiblingEvidence保存selector、blockIds、orderedElementSiblings。既有scientificinput/recipe/sourcehash不改。这个要求已有truthfulsource证据，仍待C执行断言，不再提syntheticDOM或规范修订。
3. 下文“缺少externalfragment/caption外sibling”是上一轮判断，已由上两项更新。三项productiondefects和C/D独立验证仍是真实阻塞；不能以新增来源宣称全coverage通过。

### 新独立bug Work Contract草案（不创建Issue，不改production）

**A. Nature figure descriptions with citations emit raw anchor HTML and duplicate captions**。

Trigger：原source [Figure3 bottom-caption](https://www.nature.com/articles/s41598-018-38309-5#Fig3)包含orderedcitation74、56，title/tooltips真实保留。使用committed truthfularticle走clipNature（无tables，不会fetch）后，三种outputPolicy均出现caption两次、superscript中残留真实<a> tags，并让inline math跨行；rawHTMLvalidators每policy8violations。正确期待：每figure完整caption仅一次；citation numbers/definitions/Bib正确，superscripts不吞citation anchors；markdown/quarto zeroHTML，links只strictanchors；math/scientificFragments与全部validators通过。source paragraph/topology/links不改。

Scope：Naturecaption extraction/normalization和位置渲染的最小必要修复，复用既有Defuddle/citation/semantic机制，保留Figurelabels、paragraphadjacency、scientificnotation、imagefallback；不改其它publisher/security/writer/golden/inputscientificcontent。验收：本source Figure3及完整4mainfigures的caption/start/end/panels/orderedcitation/position一次；三policy全部validators，不容忍rawHTML或duplicate；source85expectations按C独立核验，不删除该难例。根因仅就已观察failurepath提出，最终由bugowner诊断。

**B. Nature plain-text scientific units retain isolated superscript fragments**。

Trigger：Methods的原m<sup>3</sup> /m<sup>3</sup>、kg m<sup>−2</sup> s<sup>−1</sup>、kg/m<sup>2</sup>以未包i/b的plaintext单位出现，三policy输出7个scientific-isolatedSuperscript fragments。正确期待是原bases/exponents/斜线/单位attachment完整、没有isolatedfragments，可按既有outputpolicy归一化；不创造或改写科学值、计量单位。

Scope：最小Naturescientificrun recognition/academicinline处理，literal unit+source sup/sub接合；保留citation/compoundnumber区别，不弱化scientificFragmentsvalidator。验收：source3Methodsparagraphs中原unit runs正确附着、exactbase/exponentorder；三policy全部validators通过；不会把sup内真实citations当scientificpower；protect已有golden/chemistry/astronomyruns。与caption合同分开diagnose，避免扩大基础设施Issue10职责。

两个草案共享新parser-defect-evidence.json：原4个完整source节点（caption+3Methodsparagraphs）、原serializedsubtree/hash/publicposition、correctsourceexpectations、三policyvalidator细节/actualcaptionoccurrences。没有完整Markdownsnapshot、dummyexpectedvalue或validator豁免。Tablefooternote合同仍如本文原提案，另有correctsource6FRB/2COVID/1goldennotes。所需bugfixes是Issue10passingcoverage前置，不是拆分Issue10finalPR责任。

### 本轮exact checks / C handoff状态

Exactacquisition/preparation/CLI/audit commands及UTC/results见来源指南最新段。新增CLI生成与rawinput再生成byteequal/idem PASS；sourceaudit9篇/13files/1577502bytes/sourcepayload/subtree/hash/signatures/path/mapping PASS；indexaudit13hash PASS和12本轮stagedsourcefilenames/secret/executablePASS；gitdiff --cached --check PASS。A manifestshape符合既有schema，emptyregistry仍正确拒绝Unconsumed expectation；85个expectations/10个IDs未registered消费。

新clipdiagnose为productionwholechain但只是B只读failurediagnosis，**exit0为report成功，不是validator成功**。三policycount1eq/4fig/74ref，结构/crossrefsvalid，warnings为空；math/rawHTMLfalse/7isolatedsup/caption3twice/8HTMLviolations，均保存，不计passedcoverage。No-table preflight后才跑clip，没有globalfetch/DNSpatch、writer或declaredtable网络。

C可接纳A originals（H1+3754d3a+8f8a3d）、B bee3910/61e19e0/f4cafa3及本handoff更新；现在要求独立检查9篇/85expectations，包括新SRp-IDreferences、Figurelabel/caption分离、6外文章fragments、原metadata和全部source科学内容。C需要真实strictregistry/values/assertions、各policy执行records和Dtabletransportseam。C若已启动，请用taskname/threadID完成真实交接；本轮已通过asyncquestion索取任务位置，未虚报C收到或审核。

该handoff更新commit自身仍用gitlog获取；下文原ordered列表加61e19e0981d4e82a5a6fb2d8f3c5dd9a0578fc2e（Bhandoff）→f4cafa32274bf0b1ab427c82c950457feb68fa78（B新增source/evidence/guide）→本更新commit，是完整顺序。适用证据不代表主线已接受B；未开普通deliveryPR，Issue10最终单一PR与MainCI规则不变。

## 前轮8-entry handoff（历史，latest以本节为准）

来源采集已解阻：8 篇 source-admitted Open Access article、4 个真实 table resource、12 个 deterministic sanitized excerpts 与76个source expectations已提交。**Agent B的最终验收仍未完成，Issue #10未完成**：C尚未独立审核/登记消费，table notes有真实parser defect，另有外文章fragment/caption外sibling覆盖缺口；不能把这些计成passing coverage。规范未改，production parser/tests/golden均未由B修改。

## Accepted base / branch / ordered commits

- Base：e85b1b809b56242b89b6313ce5d1165c745466bb，latest accepted main，含PR #27 planning contract（5971ebf）；[CI 37182993143](https://github.com/uwougil/Academic-clipper/actions/runs/37182993143) completed/success，Ubuntu Node20/24与Windows Node24均success。冻结源文件时de8a8955db0327c0241d648e4546c2d9f85a330d的Main CI也success；其后只rebase本branch，15 commits无冲突，未touch其他agent worktree/branch。
- Branch：codex/issue-10-agent-b；worktree：C:/Users/guoli/.codex/worktrees/3417/academic-clipper。
- 当前source delivery commit：bee3910240c83789dcb6f8ae530c233289fda737。文件：test/corpus/corpus-manifest.json；fixtures/<id>/article.excerpt.html、source-evidence.json；4 tables/table-1.excerpt.html；3 table-defect-evidence.json；docs/nature-corpus.md。没有raw capture、image/PDF/XLSX、credentials或普通delivery PR。
- 本handoff commit自身SHA使用 git log -1 --format=%H -- docs/goals/issue-10/agent-b-handoff.md 获取，避免commit自引用；完整ordered list可用 git log --reverse --format="%H %s" e85b1b809b56242b89b6313ce5d1165c745466bb..HEAD 重建。

| SHA | Commit / ownership |
| --- | --- |
| 60ccd6d726581f65d870a6c6a15f3cae16bad8ed | docs(corpus): 记录 Agent B 来源访问阻塞与交接条件 |
| 51c57bcdb6890ac576bb1b96699df25270e1483d | docs(corpus): 保留精确 UTC 来源时间并记录访问复核 |
| 2a03a06fb9e29bd43f9c28c099bb14c88a2682da | docs(corpus): 记录第三次访问核验与阻塞审计 |
| 5f54a4159984c99956f08ef2db7282da6b6f7c61 | feat(corpus): add versioned Nature corpus infrastructure for H1 |
| e5d0d29cf15df5499297b4432275766be9042ec5 | docs(corpus): record Agent A H1 interface and integration handoff |
| f840c036177d1923b405c5046191667aa42fa58d | docs(corpus): 记录 H1 接入版本与浏览器访问证据边界 |
| 75aff3ed2fb865dc94a22e8732d1c7e424f4981e | docs(corpus): 记录侧边浏览器真实 DOM 与响应字节限制 |
| 512177bc3e4bcd3fcc73bdfb2547b5e970a46f16 | docs: record initial Nature source and table research |
| cb7c792925a86853130a23e7330e860bf9ee05a5 | docs(corpus): add Agent B acquisition handoff and source-interface proposal |
| 9ebee607369f6fd0895f3c1066a6cbb1a6bcd2ad | docs(corpus): record anonymous browser redirect evidence |
| ee751a480366f0af4920cc62e4f2caeab46ad02b | docs(corpus): cite publisher access troubleshooting evidence |
| 5d2addcc87cd668e687eecaa29e6f984caa141f7 | docs(corpus): refresh accepted main and CI baseline |
| 380858d172687e0c8e769bbd7325885366806db4 | docs(corpus): refresh Agent B handoff base and commit map |
| 7e09aea4f86152eb397c4f6e8f28121058e4b704 | docs(corpus): record anonymous acquisition alternatives and bounded recovery proposal |
| b2082154fa31ab7fbda2b97cc112284ae56f0e9b | fix(corpus): version exact-identity mainEntity JSON-LD support |
| 2e0a9763540834f4b941a10a57ae96a24310299f | fix(corpus): preserve source HTML whitespace in diff checks |
| bee3910240c83789dcb6f8ae530c233289fda737 | feat(corpus): acquire eight source-backed Nature excerpts and source contracts |

早期B docs commits主要修改docs/nature-corpus.md或本handoff，保存历史访问证据；current source guide明确覆盖旧“0 admitted”状态。A dependencies是原样cherry-pick：20b48328114f195974e92827583b6bf5875beb27 → local5f54a4159984c99956f08ef2db7282da6b6f7c61（scripts/lib/nature-corpus-infrastructure.mjs、scripts/sanitize-nature-corpus.mjs、test/corpus/corpus-schema.json、test/corpus/.gitattributes、test/nature-corpus-infrastructure.test.mjs）；4e0aec64f996a0090a7c74c14edd8ab5051d9639 → locale5d0d29cf15df5499297b4432275766be9042ec5（A handoff）；3754d3a781459635e719859353fe3cbdf8741897 → localb2082154fa31ab7fbda2b97cc112284ae56f0e9b（A1.1helper/schema/tests/handoff）；8f8a3dbf5d83c1475c41a197bcdfd1bf73834679 → local2e0a976（A .gitattributes/Ahandoff whitespace rule）。Integrator已选A originals时不要再选B dependency copies。

## A interface consumed / source authorization

Schema/recipe1.0.0；sanitizer nature-corpus-sanitizer/1.1.0；serializer nature-corpus-subtree/1.0.0；projection nature-corpus-projection/1.0.0。见[A handoff](agent-a-handoff.md)。原始Nature JSON-LD为WebPage.mainEntity ScholarlyArticle，sameAs exact DOI；A1.0拒绝真实结构，B送source feedback，A owner发布1.1兼容，不改raw/source scientific content。Legacy1.0 replay仍保留。

用户对bounded fresh anonymous Cookie proposal明确回复：“可以 继续往下尝试 直到能拿到需要对的东西”。这是任务内source acquisition例外，取代原cookie禁令的受限范围；没有复用用户浏览器profile/Cookie、账号或机构凭据，Jar每个article/resource全新且内存清空；不导出Cookie/code/query、不改生产transport或canonical。原raw-body hash要求完全保持，未使用decoded string hash。

复用safeFetchExternal与生产DNS guard；public DoH A/AAAA增量64KiB/10s；verified-public-IP socket绑定；TLS hostname/cert verification；exact HTTPS article/table路径+idp /authorize,/transit allowlist；max5redirects；30s含body、25MiB增量body、HTMLtype。Observed303→302→302→200不是Cloudflare CAPTCHA证据。成功source必须canonical+exactcitationDOI+title/journal+substantivebody+OpenAccess label+JSONLD isAccessibleForFree=true同时成立。Article/table raw bytes均在TextDecoder/JSDOM前hash；ledger只保存redacted origin/path、status/type、cookieboolean/count。Fullcapturedraw仅外部TEMP，永不commit。

## Admissions / rejection / coverage / sizes

Canonical gate、distinct DOM、ordered source roles、transformations/omissions详见[来源指南](../../nature-corpus.md)与manifest；source-evidence.json是来源位置、public accessibility、sanitized HTTP/DNS ledger、repeat/idem事实。Hash不是真实性证明。

| Article | Role | Eq / main+ED / refs | Blocks | Fixture SHA |
| --- | --- | --- | --- | --- |
| [s41586-026-10401-1](https://www.nature.com/articles/s41586-026-10401-1) | golden scientific runs / main+Extended Data / rowspan table / internal crossrefs | 13 / 3+4 / 50 | 99 | 73c0cbb04cf5d2f3424b4119f9085fad54ae8928665c21c362178bee6c2ec292 |
| [s41534-023-00746-0](https://www.nature.com/articles/s41534-023-00746-0) | quantum numbered multiline arrays / Eq. (9) / four body sections / simple math table | 37 / 6+0 / 77 | 117 | b32d31f2389e8c052f990812cfd86441172538fd66e37fa17f97704d8795d9fc |
| [s41586-021-03819-2](https://www.nature.com/articles/s41586-021-03819-2) | AlphaFold five long panel captions / paragraph adjacency / main figure topology | 0 / 5+0 / 84 | 158 | b47e9b289dfd671000e361872c9feb561b6b603eaf7c9a7011923fbf43a3c5ef |
| [s41586-020-2012-7](https://www.nature.com/articles/s41586-020-2012-7) | ordered citations / update UI / zero displays / image-only table fallback | 0 / 3+2 / 16 | 84 | 42e83aae5ecffa52c031b36103b0220b52674bec0e6a79346ba088284ccdd594 |
| [s41586-023-05896-x](https://www.nature.com/articles/s41586-023-05896-x) | 119 authors / nested sections / notes and first two affiliations / supplementary links / GitHub fragments | 0 / 4+2 / 49 | 209 | 9abb9d06ecbf79f8b4cb0883c4625d64fc25ab0bd7c01a45b6fb46353e3f29af |
| [s41586-023-06735-9](https://www.nature.com/articles/s41586-023-06735-9) | materials units and scientific attachment / captions / data and code URLs | 1 / 3+0 / 71 | 115 | c997a761f1dea592df1d1b6007d338bf028de4825e48acdd94645cd2eba05517 |
| [s41467-023-44030-3](https://www.nature.com/articles/s41467-023-44030-3) | compound bold numbers / GABA_A subscripts / Greek and units / nested Results | 0 / 7+0 / 52 | 93 | b3b10a0f1b4cdb2fb9980ebc44142d778689a18b396e51af93ebeb95f84b605e |
| [s41586-022-04755-5](https://www.nature.com/articles/s41586-022-04755-5) | FRB units / coordinates and uncertainties / negative powers / colspan table / 2 Extended Data | 8 / 3+2 / 53 | 127 | 3214c1ee6e7f232b45dcb5e44768f38608edcd9d6d870c1fc93948c854d54f1b |

Rejected/replaced：s41586-021-04354-w有institutional access而非publicOA，拒绝使用已取得内容，替换s41586-022-04755-5。s41534-024-00877-y公开可取，source hash edd817c105ca946ec123076e09224ef18f377ce6bfcefbf37214108e230d3ffc、449888bytes，仅保留研究对照；其52display/2×4无span表与已有quantumrole冗余，不算第9篇。其余早期replacement只有noCookie rejection/research，无admission声明。不得把原PR #13输入作为证据，本交付没有复用它。

| Body | observedAt UTC | Raw / fixture bytes | sourceSha256 | fixtureSha256 |
| --- | --- | --- | --- | --- |
| s41586-026-10401-1 article | 2026-10-03T16:44:03.154Z | 437403 / 155363 | ea2508302b4c3af4efe421f02c3de93379b50940dd1a8762166efb38033cc91c | 73c0cbb04cf5d2f3424b4119f9085fad54ae8928665c21c362178bee6c2ec292 |
| s41586-026-10401-1 table-1 | 2026-10-03T16:47:49.080Z | 172830 / 2968 | 36a52d93aca60fb50cb7452b2990f955f399d1b8a59e5278dff0764a9042d568 | 0f140482b5ed5873629f22df427fffe01aa5374c6253e465a4678f1ea1749677 |
| s41534-023-00746-0 article | 2026-10-03T16:44:08.251Z | 511799 / 228057 | 6b2bb78e5f3038d6281eac00b60dc90aa58bdd9ac185ca2d4b9b0de362bbe28e | b32d31f2389e8c052f990812cfd86441172538fd66e37fa17f97704d8795d9fc |
| s41534-023-00746-0 table-1 | 2026-10-03T16:47:53.404Z | 169146 / 4299 | 7772399037acb3ba4dfc100bc6c9a8fdf4f82c56d8836e65fcb761294e9ee069 | 90670968407415e1f7e7c624b3244330015a4e52bc9790e811d2992205851c2d |
| s41586-021-03819-2 article | 2026-10-03T16:44:11.820Z | 616249 / 188879 | 7a9843e69996c1a64a9a5ecc8b96015cfd45262e636e33e505a011d315c4310b | b47e9b289dfd671000e361872c9feb561b6b603eaf7c9a7011923fbf43a3c5ef |
| s41586-020-2012-7 article | 2026-10-03T16:44:15.126Z | 418904 / 82098 | 340b1b93ba889c99acf492c7e5ba14ba36e0a5c12866da39a445237e992e2cb9 | 42e83aae5ecffa52c031b36103b0220b52674bec0e6a79346ba088284ccdd594 |
| s41586-020-2012-7 table-1 | 2026-10-03T16:50:31.782Z | 179489 / 2500 | 3b6d64a5934ac4b45df370930ec4d9a9e51b41dc71ad3aaf2d87eb5c3125e29e | 6d67417849218c151fc8a1b27c1cbe56634d3774005b911cdc7c763462e42794 |
| s41586-023-05896-x article | 2026-10-03T16:44:18.130Z | 1251945 / 191458 | 342b8dc5d0bf7d01618a3e9965ef6de9b23c59c7f7bef429592cbdb7852c36ec | 9abb9d06ecbf79f8b4cb0883c4625d64fc25ab0bd7c01a45b6fb46353e3f29af |
| s41586-023-06735-9 article | 2026-10-03T16:44:22.324Z | 506351 / 201653 | 79f575e1941633c2dbd036682977ea6c274acd5c8c44fdb4648856a00a8d7cc6 | c997a761f1dea592df1d1b6007d338bf028de4825e48acdd94645cd2eba05517 |
| s41467-023-44030-3 article | 2026-10-03T16:44:25.253Z | 460171 / 155114 | a02d82acb4cdbde085e07ca0c276383894e7a7832c6830ad7a212f450926d88d | b3b10a0f1b4cdb2fb9980ebc44142d778689a18b396e51af93ebeb95f84b605e |
| s41586-022-04755-5 article | 2026-10-03T16:48:03.040Z | 545450 / 187508 | 190a270027c69a816b2647d2fdc6f1777cdf669695506fa40f2fe3cab8801ace | 3214c1ee6e7f232b45dcb5e44768f38608edcd9d6d870c1fc93948c854d54f1b |
| s41586-022-04755-5 table-1 | 2026-10-03T16:50:36.037Z | 185820 / 5434 | 97eaaa31a6f3443e63ad7cf2cef66776d72d61c6b0f0d2956d87cd43b39485a2 | d5c167a5e0e2bbe016a1728985a5f96788492a9397060cee4292bcb37ec81fd0 |

Article最大228057bytes；table最大5434bytes；fixture aggregate1405331bytes，全部within256KiB/64KiB/2MiB默认bounds。几篇超过20–150KiB软目标，为完整display/caption/author/section/refprefix保留stress topology。全部corpus含schema/manifest/source/defect evidence约2.5MiB，metadata overhead需integrator明确审核，未填虚假reviewedBy。

| Table | Physical rows / cells | Real spans | Notes | Status |
| --- | --- | --- | --- | --- |
| s41586-026-10401-1/table-1 | 4; [5, 5, 4, 5] | OSSG: colSpan=1, rowSpan=2 | 1 | full-size-html |
| s41534-023-00746-0/table-1 | 3; [3, 3, 3] | none | 0 | full-size-html |
| s41586-020-2012-7/table-1 | 0; [] | none | 2 | fallback-no-html-table |
| s41586-022-04755-5/table-1 | 24; [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2] | Burst parameters: colSpan=2, rowSpan=1; Persistent radio source: colSpan=2, rowSpan=1; Host galaxy: colSpan=2, rowSpan=1 | 6 | full-size-html |

正确warning：display0的AlphaFold/COVID/pangenome/chemistry允许且只允许 No equation nodes were detected.；table HTML successes无resourcewarning；COVID exactresourcewarning为 Extended Data Table 1: The full-size Nature page did not expose HTML table cells; retained the absolute URL.。Source table footnotes仍必须保留，不因为fallback允许静默丢弃。HTTP failure/同article redirect/逃离scope rejection仍由C/D声明synthetic，不伪装sourceHTTP200。

## Frozen source expectations / public positions

实际manifest为A1.0schema形状，没有自创incompatible schema；10个proposed consumer IDs是nature-source-metadata-v1、nature-source-abstract-v1、nature-source-headings-v1、nature-source-equations-v1、nature-source-figures-v1、nature-source-citations-v1、nature-source-inline-v1、nature-source-crossrefs-v1、nature-source-ui-v1、nature-source-tables-v1。76个values均由untouched source DOM提取，value.version=1.0.0。C尚未registered消费；普通A validation严格报Unconsumed expectation，B没有dummy/no-op registry。

每个coverage条目指向retained block / expectation；每个expectation.blockIds都指向实际article/table source。公开source URL+manifest recipe.selector+original source ID可定位；retainedBlocks记录pre-sanitize subtreeSha256，source-evidence sourcePositions记录sourceSerializedBytes，按idjoin，serializer同A版本。这不是HTTP byte offset。Scientific案例另有blockId/selector/index/sourceContext；caption有完整text+首尾+bold single-letter sequence+previous/next paragraph+src/srcset候选+descriptionPlacement；equation有ordered IDs/exactsourceTex/number，包括quantumEqu9 rclarray和rowseparator；citations原anchor序列及orderednumbers、referenceprefix原positions；abstract原paragraphorder；headinglevel/text/parent；orderedauthors/date-source-fields/notes/2完整affiliations/contributions/correspondence均由源保存。C负责验证生产变换后的语义，B没有用parser output反推expected。

Metadata date保留citation_online_date/publication_date/date；first online来源字段有值优先，source字符串和最终ISO形式要区分。Figure boldsinglelettersequence不全解释为panel编号（可能有数学变量）。当前bottom-caption在figure内容div内；descriptionIsSibling=false是真实source事实。Internal targetRetained=false保留了真实omittedtarget，不可造节点。Pangenome外fragment是真实GitHubresources，并非externalNaturearticle。

Omissions：recipe选择完整sections/paragraphs/Extendednodes/referencesoriginalprefix，不重编号；其余sections、余下affiliations、部分ED figures不覆盖。全metadataauthor序列保留。移除executable/ads/analytics/session/access/tracking/无关UI；保留source metrics/update UI用于排除。JSONLD article metadata保留真实结构，A fixedscaffold/sortedattributes/UTF8noBOM/LF/URLcleanups transformations operation/count写入manifest。没有全局collapse meaningfulwhitespace或prettyprintscientificinline。Data/Code/Supplementary保留actualURLs，无supplementarybinary转HTML。

## Defect evidence / independent bug Work Contract proposal

拟议独立bug（尚未创建Issue、无parserfix）：**Nature full-size tables lose adjacent source footnotes**。

Trigger：source table page #content .c-article-table-footer li在table外，golden1条、FRB6条；COVID image-onlytable也有2条公开note。hydrateNatureTables仅赋tableElement.outerHTML，或no-cell分支仅保留URL；normalize/render只能看到cells，脚注关联及正文丢失。正确source期待见source-tables-v1.sourceNotes与sourceNotesLocator，source根本不需要改变。

Scope：最小修复Nature table source footer捕获、科学inline处理与三policy渲染，继续保留同articleURL/DNS/redirect/body/type安全边界及no-cellfallbackwarning；不改writer、publisherrouting、fixtureprose或其他适配器。验收：对本truthfulresources，在markdown/quarto/links中脚注原次序/marker/text/scientificattachment存在一次；HTMLtable和no-cellresource状态/链接/warning保持正确；tablecells/spans与quartoidentifiers/zeroHTML/linksanchorpolicy不退化；未声明requests仍fail。

Evidence：3个fixtures/<id>/table-defect-evidence.json，正确notes/fullsourcephysicalcells/status/warnings、Aledger unexpected0、三个outputPolicy的缺失结果。此诊断是production table子链路，不冒充完整clip或Call-dialect验收。Golden/astro无hydrationwarning；COVIDwarning是exactexpectedfallback。现有288testpass不能证明notes角色passed。

可复制的最小只读复现（无真实DNS/HTTP、无globalfetchpatch、无writer；保持DOM到整个诊断结束，避免Defuddle缓存realm被人为提前close）：

```javascript
import { readFile } from 'node:fs/promises';
import { parseNaturePage, hydrateNatureTables } from './src/adapters/nature.mjs';
import { normalizeTableContents, renderTables } from './src/normalizers/figures.mjs';
import { withDomGlobals } from './src/dom-runtime.mjs';
import { outputPolicy } from './src/renderers/output-policy.mjs';
import { createReplay, loadReplayResources } from './scripts/lib/nature-corpus-infrastructure.mjs';
const manifest = JSON.parse(await readFile('test/corpus/corpus-manifest.json'));
const article = manifest.articles.find(a => a.articleId === 's41586-022-04755-5');
const replay = createReplay({ resources: await loadReplayResources(article, 'test/corpus'),
  dns: { 'www.nature.com': [{ address: '151.101.0.95', family: 4 }] } });
const page = parseNaturePage(await readFile('test/corpus/' + article.fixturePath, 'utf8'), article.url);
await hydrateNatureTables(page.tables, article.url, replay);
await withDomGlobals(page.dom, () => normalizeTableContents(page.tables, article.url));
for (const style of ['markdown', 'quarto', 'links']) {
  const markdown = renderTables(page.tables, outputPolicy(style));
  console.log(style, markdown.includes('Including the FAST and VLA observations.')); // actual false; source true
}
replay.assertClean();
page.dom.window.close();
```

## Commands / exact recorded results / failed experiments

External root是 $env:TEMP/academic-clipper-issue10-agent-b（实际C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-b）；临时helper及完整raw不会进入repository。逐篇实际sanitizer CLIargs由freeze-receipts.json保留，durable source-evidence.sanitizationCommands使用external-root占位符防止localpath进入fixture。recipe内容等于manifest.recipe；要重跑时从manifest导出相应recipe，再用真实外部rawbody输入；output必须是新路径（CLI wx），重复结果与committedbytes比较，不能覆盖source。

```powershell
node $env:TEMP/academic-clipper-issue10-agent-b/acquire-anonymous.mjs s41586-026-10401-1 s41534-023-00746-0 s41586-021-03819-2 s41586-020-2012-7 s41586-023-05896-x s41586-023-06735-9 s41467-023-44030-3
node $env:TEMP/academic-clipper-issue10-agent-b/acquire-anonymous.mjs s41586-022-04755-5
node $env:TEMP/academic-clipper-issue10-agent-b/acquire-anonymous-tables.mjs s41586-026-10401-1 s41534-023-00746-0 s41586-020-2012-7 s41586-022-04755-5
node $env:TEMP/academic-clipper-issue10-agent-b/prepare-recipes.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/freeze-excerpts.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/enrich-source-oracle.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/audit-source-contracts.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/reproduce-table-notes.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/audit-index.mjs
npm ci
node --test test/nature-corpus-infrastructure.test.mjs
npm test
npm run build
npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto
git diff --cached --check
git diff --check
git status --short
git diff --name-only e85b1b809b56242b89b6313ce5d1165c745466bb..HEAD
```

上列前3条acquisition命令是重建的等价重现命令，不声称当时精确batch组合；准确observedAt/body/hash/hops以每个source-evidence ledger为准。其后source preparation/audit/verification脚本与命令均实际执行。成功source请求为article/table200与exactidentity/OAgate如表。Finalfreezeexit0：8article/4table重复bytes和idem PASS。Sourceauditexit0：8sourcepayload（metadataauthors/abstract/orderedheadings/equationTeX+numbers/完整caption/refpositions/tablecells）、blockrawhash、fixturehash/idem/signatures/coverageblockmapping/size PASS；emptyregistry被正确拒绝Unconsumed expectation。Indexaudit12hash PASS，24sourcefilenames/secret/executableaudit PASS。

npmci exit0，65packages/0vuln（e85mainpackage/lock相对de8无变化）；H1focused32pass；de8basefull270pass，最终e85basefull288pass/0fail/skip；buildexit0；goldenvalid：13display/50references，全productionvalidatorsvalid。MainCI三个job结果单独列出，不冒充BbranchCI或corpussemanticpass。npmrun test:corpus尚未集成，不声称执行。后续C实际registry可用时必须执行：node scripts/sanitize-nature-corpus.mjs --validate-manifest test/corpus/corpus-manifest.json --corpus-root test/corpus --registry scripts/lib/nature-corpus-assertions.mjs；目前该module不存在，不能用empty/dummyregistry声称通过。

诚实记录失败实验：A1.0拒绝原JSONLD，owner1.1修复；table recipe最初误用不存在main，改为源唯一#content；COVIDupdatebox/Pangenomeparagraph初始nth-of-typelocator在pruning后不稳定，改为原sourcehref稳定:has selector，firstsanitizedscientificbytes未变化，repairedrecipehash与重复/idem已重新核验。这些是B selection缺陷，不是parserbug。COVIDtable最初gate误要求cells，修为真实title/backlink的negativecase，不改sourcecells。Table诊断首次未使用withDomGlobals，以及第二轮提前close首次DOM造成Defuddle缓存realm错误；最终使用真实withDomGlobals/outputPolicy并在全部运行后close，finaldiagnostic无convertererrors，notes缺失仍复现。没有将这些setup错误当作生产defect。

普通gitdiff --cached --check initiallyexit2，2770个sourceHTML blank-at-eol，科学bytes不能trim；B把证据交A，A8f8a3d提供仅fixtures/**/*.html whitespace=-blank-at-eol（仍text eol=lf，blank-atEOF/代码prose检查保留）。原样选择后cachedcheckexit0，12indexhash未变；不是B修改sanitizer或删sourcewhitespace。JSON非hashfixture允许Git本地CRLF，HTMLforcedLF，两份filehash一致。

## Spec proposals / C unblocking conditions

未修改canonical/PRD/EDD。Sourceacquisition例外已经由human授权，仅记录，不提重新批准。需要resolvedhuman判断的spec假设：当前8个initialresponses没有figure外的captiondescription sibling，也没有externalNaturearticlefragment；补真正source是优先路径，如确实不可取得，明确允许标synthetic的补充case，而不是把GitHubfragment或nestedcaption当成该真实角色。Aggregate“约2MiB”请明确是否包括metadata/provenance；A当前gate仅fixturebytes，B总文件metadata更大，不能填假review。

C可立即消费：A H1 originals+3754d3a+8f8a3d；B bee3910 sourcecommit+本handoff。先从publicsource/retainedblocklocators独立审核8篇身份和oracle，不只看parseroutput；C登记10个严格valuevalidators/assertions，消费76个expectationIDs并维护coverage记录。审阅日期precedence、caption完整性/adjacency和notes/inlineCases尤其重要；遇到疑问交B解释，不能修改fixture以消掉failure。

正式all-dialectclip还需要D的实际productionreplayseam（clipNature当前没透传hydratefetchImpl/resolveHostname）；不能globalfetch/DNSpatch。需要单独notesbug WorkContract修复并passingregression；所需externalNaturefragment/captionlayout source或humanresolvedsyntheticcase、aggregate大小决定完成后，才有机会满足B/C最终验收。C还须运行全部validators、ledger/determinism/A→B→A/bibliography/golden契约。

当前appthreads里没有已启动的AgentC任务；这是给未来C/integrator的durablehandoff，未虚报“C已审核/收到消息”。没有新建未经人类请求的chat，也没有普通Issue10deliveryPR。Issue10只能由最终integrator单一PR和mergedcommitMainCI结束。
