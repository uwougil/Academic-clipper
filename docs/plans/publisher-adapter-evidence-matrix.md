# Publisher Adapter：accepted-main 实证矩阵

本轮是 Issue #26 的文档分析，不宣称该 Work Contract 完成。唯一实现基线为 **e85b1b809b56242b89b6313ce5d1165c745466bb**。八列表示有限的已实现 DOM family，不表示八个出版社全刊支持。APS/当前 ACS 仅是未来验证目标；原 [census](publisher-coverage-census.md) 与 [候选集](publisher-corpus-candidates.md) 保留为前一阶段的补充规划，不能覆盖本文件的实现事实。

正式范围仍 Nature；PRD/EDD 已明确允许 APL 的 browser → bridge → writer 实验例外。README 开头的 Nature-only 简述应结合该例外阅读；Wiley/IOP/PNAS/AAAS/RSC/SciOpen 的直接实验调用不等于生产支持。Issue #10 规范仍标记“尚未实现”；当前有 publisher-local manifests/recipes/tests，没有已落地的统一 corpus schema、replay runner 或 live verifier。

## 分类规则

每格开头的代码唯一映射到以下完整分类；后面的事实及证据 ID 限定判断范围。

| 代码 | 分类 | 含义 |
| --- | --- | --- |
| SC | STABLE COMMONALITY | 已接受的共享 helper/边界被该入口实际复用；不是全量能力承诺 |
| PS | PUBLISHER-SPECIFIC | 实证解析、发现或策略属于该 family |
| OM | OBSERVED IN MULTIPLE PUBLISHERS | 至少两个已实现 family 有同类需求/行为，尚非统一接口 |
| UV | UNVERIFIED | 缺少证据，或仅文档设想/合成探针；不等于已证明不支持 |
| KI | KNOWN INCOMPATIBILITY | 与“统一能力/统一结果/统一所有权”的候选假设已有明确反例 |

代码不是质量评分。同一需求可以具有共享语义，但发现机制必须本地；表中选择当前行为最直接的分类。“完整性 UV”表示没有独立全文完整性证明，包含返回结果的内部一致性检查。表分为两半以便阅读，行号相同。

## 可核对的证据索引

以下路径均相对本文件；行号针对固定基线，可由符号或 test 名复查。F 类索引聚合 fixtures、tests 与 handoff；其中 source excerpt、authored regression、output golden、全文 smoke、rendered-text 与 synthetic mutation 按条目分别注明，不能当作同等级来源。

| ID | 源码 / 测试 / 证据位置 |
| --- | --- |
| N1 | [nature.mjs](../../src/adapters/nature.mjs)：extractMetadata L119、isNatureUrl L999、articleIdFromUrl L1010、parseNaturePage L1019。canonical 用于 metadata.url，未交叉拒绝 DOI/请求身份冲突 |
| N2 | [nature.mjs](../../src/adapters/nature.mjs)：extractFigures L244、extractTables L300、hydrateNatureTables L334、extractReferences L398、replaceDisplayMath L428、replaceInlineMath L440、replaceScientificRuns L741、replaceCitations L833、buildCrossReferences L857 |
| N3 | [clip.mjs](../../src/clip.mjs)：clipNature L269、finishClip L293；[nature-adapter tests](../../test/nature-adapter.test.mjs) L13/L41/L97/L115；[stability regressions](../../test/stability-regressions.test.mjs) 的 concurrent Nature clips |
| NF | [nature-minimal.html](../../test/fixtures/nature-minimal.html)、其他 nature-* 小型 authored regression fixtures；[Nature golden](../../papers/s41586-026-10401-1/index.md) 为已提交输出，不能替代 input provenance；[Issue #10 spec](../specs/issue-10-nature-corpus.md) §3/§5/§6/§7 |
| W1 | [wiley.mjs](../../src/adapters/wiley.mjs)：wileyDoiFromUrl L9、parseWileyPage L18；full wrapper L31、references L112、figures L131、tables L148、displayEquationCount L160、ranges L203 |
| W2 | [wiley-clip.mjs](../../src/adapters/wiley-clip.mjs)：clipWiley L15；allowPreview、spread page、bibliography、debug.validations、validation throw；没有 finally close |
| WF | [Wiley tests](../../test/wiley.test.mjs) L21/L84/L89/L126/L133/L143；[smll-expanded provenance](../../test/fixtures/wiley/smll-expanded/provenance.json)、[Wiley handoff](../wiley-experimental.md)、[PR #41](https://github.com/uwougil/Academic-clipper/pull/41) |
| A1 | [aip.mjs](../../src/adapters/aip.mjs)：isAplUrl L12、aplArticleId L29、parseAipPage L55、header identity L100；主文 gate 不以 abstract/refs 代替 |
| A2 | [aip.mjs](../../src/adapters/aip.mjs)：modal removal L158、references L162、MathML L205、scientific attachments L248、figures L301、tables L336、最终 parser seam；[clip.mjs](../../src/clip.mjs) clipAip L282/clipArticle L289/finishClip L293 |
| AF | [APL tests](../../test/aip-adapter.test.mjs) source integrity/rendering、L125 authenticated bridge/writer、L174 identity、L188 source label mutation；[provenance](../../test/fixtures/aip/provenance.json)、[recipe](../../scripts/aip-fixture-excerpts.mjs) source Buffer hash；[APL handoff](../aip-apl-evidence.md)、[PR #40](https://github.com/uwougil/Academic-clipper/pull/40) |
| I1 | [iop.mjs](../../src/adapters/iop.mjs)：iopArticleIdentity L16、IopAdapterError L31、inspectIopPage L79、parseIopPage L127；canonical/meta conflict、fullTextVerified=false |
| I2 | [iop.mjs](../../src/adapters/iop.mjs)：convertIopPage L161、merged cells L167、TeX/alt source L194、range L219、figure L236、conversionDom L266、finally L286、extractIopFigures L317 |
| IF | [IOP tests](../../test/iop-adapter.test.mjs)：真实 math/figure/table/refs、merged-cell rejection、L229 preflight、L239 Nature reject；[aeaa68 provenance](../../test/fixtures/iop/aeaa68.provenance.json)、[integrity](../../test/fixtures/iop/excerpt-integrity.json)、[server observation](../../test/fixtures/iop/aeaa68-server-observation.json)、[handoff](../iop-experiment.md)、[PR #37](https://github.com/uwougil/Academic-clipper/pull/37) |
| P1 | [pnas.mjs](../../src/adapters/pnas.mjs)：isPnasUrl L5、parsePnasPage L14；RDFa authors、history、authoritative core roots、assistive MathML、figures/tables、citation range、prose-note handling |
| P2 | [pnas-clip.mjs](../../src/pnas-clip.mjs)：clipPnas L16；per-MathML conversion、separator-free mfenced、caption/table semantics、显式 result、validators 返回状态；无 parser catch / clip finally close |
| PF | [PNAS tests](../../test/pnas.test.mjs) L19/L32/L57/L76/L104/L117/L132/L144；[manifest](../../test/fixtures/pnas/manifest.json)、[recipe](../../scripts/prepare-pnas-fixtures.mjs)、[handoff](../pnas-experiment.md) 五入口双顺序审计、[PR #38](https://github.com/uwougil/Academic-clipper/pull/38) |
| G1 | [aaas.mjs](../../src/adapters/aaas.mjs)：aaasArticleIdentity L23、metadataFor L32、protectCitations L79、protectMath L109、parseAaasPage L169；real denial、supplementary reference namespace |
| G2 | [aaas.mjs](../../src/adapters/aaas.mjs)：静态 defuddle/full L2、parser catch L263、clipAaas L269、显式 result L286、validators gate L296、finally close L298 |
| GF | [AAAS tests](../../test/aaas-adapter.test.mjs) L18 DOM-free keys/hash、L33 close success/error/rejection、L159 real denial、L165 separate SI refs、L206 synthetic table/math、L218 synthetic section/equation links；[provenance](../../test/fixtures/aaas/provenance.json)、[handoff](../aaas-experimental.md)、[PR #43](https://github.com/uwougil/Academic-clipper/pull/43) 最后 result/lifecycle 修复节 |
| R1 | [rsc.mjs](../../src/adapters/rsc.mjs)：isExperimentalRscUrl L99、parseRscPage L108、canonical path/admission L116、media L140、references L151、targets/tableParts/image equations L179–234、parser catch L257 |
| R2 | [rsc-clip.mjs](../../src/experimental/rsc-clip.mjs)：静态 defuddle/full L1、clipRsc L21、逐子表 yield L34、note-only referencesBib L53、validators 状态 L57、finally close/yield L65 |
| RF | [RSC tests](../../test/rsc.test.mjs) L12 cold child processes、L26 six source oracles、L59 three modes、L97 guards、L110 determinism；[d4cp00788c provenance](../../test/fixtures/rsc/d4cp00788c.json)、[lifecycle script](../../scripts/rsc-lifecycle-check.mjs) L60/L70 late parser probes/L85 close counts；[handoff](../experimental-rsc.md)、[PR #36](https://github.com/uwougil/Academic-clipper/pull/36) 最后 parser 修复节 |
| S1 | [sciopen.mjs](../../src/adapters/sciopen.mjs)：isSciOpenArticleUrl L14、parseSciOpenPage L25；sourceScope/truncation、唯一 root、opening/closing/section admission、NR/NRE DOI family、bibliography/cites、table rejection、formula MathML、media/SI fallback、admission L224 |
| S2 | [sciopen.mjs](../../src/adapters/sciopen.mjs)：静态 defuddle/full L2、parser catch L228、clipSciOpenExperimental L234、Markdown-only、四项返回前 gate、移除 dom L255、finally close/yield L258 |
| SF | [SciOpen tests](../../test/sciopen-experimental.test.mjs) L25 six cold processes、L49 integrity、L125 reparsing、L144 synthetic table blocker、L152 partial loading、L169 source truncation、L184/203 plain objects；[nre-truncated provenance](../../test/fixtures/sciopen/nre-truncated/provenance.json)、[recipe](../../scripts/sanitize-sciopen-experiment.mjs)、[lifecycle script](../../scripts/sciopen-lifecycle-check.mjs)、[handoff](../experiments/nano-research-sciopen.md)、[PR #42](https://github.com/uwougil/Academic-clipper/pull/42) |
| C1 | [dom-runtime.mjs](../../src/dom-runtime.mjs) L5 keys、L26 withDomGlobals queue、own/value snapshot/finally restore。未保存 property descriptors |
| C2 | [markdown.mjs](../../src/markdown.mjs) loadConverter L4、defuddleToMarkdown L24、htmlToMarkdown L31；module-level cache |
| C3 | [output-policy.mjs](../../src/renderers/output-policy.mjs) POLICIES/outputPolicy；[clip.mjs](../../src/clip.mjs) referencesMarkdown L149/referencesBib L199/renderClipMarkdown L245 |
| C4 | [clip.mjs](../../src/clip.mjs) writePaper L813、writer validation L893/L943、references.bib L969；[security.mjs](../../src/security.mjs) safeFetchExternal L151、[bridge](../../src/bridge.mjs) clipArticle、[CLI](../../src/cli.mjs) clipNature |
| C5 | [Issue #10 spec](../specs/issue-10-nature-corpus.md) §6 digest meanings/§7 offline ledger/§8 future live command；[execution plan](issue-10-execution-plan.md) H1 尚为未来接口；[package.json](../../package.json) 当前 scripts；[Issue #26](https://github.com/uwougil/Academic-clipper/issues/26) OPEN |
| C6 | [PRD](../PRD.md) §3 与 Experimental APL；[EDD](../EDD.md) 架构/Experimental APL；[README](../../README.md)、[AGENTS](../../AGENTS.md)、[CI](../../.github/workflows/ci.yml) Ubuntu Node 20/24、Windows Node 24 |

## 矩阵 A：Nature、Wiley、APL、IOP

| # / 契约维度 | Nature | Wiley | AIP / APL | IOP / 2D Materials |
| --- | --- | --- | --- | --- |
| 1 URL / article identity | PS HTTPS nature articles；gate 较宽 N1 | PS 双 host/四 DOI prefix W1 | PS APL numeric route/header A1 | PS ISSN DOI family I1 |
| 2 canonical identity | KI canonical 用于输出、未 mismatch gate N1 | UV DOI gate 有，canonical gate 无 W1 | PS header ID/volume/article，不是 canonical gate A1 | PS canonical 与 DOI 冲突拒绝 I1 |
| 3 article ID | PS Nature URL suffix N1 | PS wiley-DOI 替换 W2 | PS aip-apl-platform-id A1 | PS identity DOI；无统一顶层 articleId I1/I2 |
| 4 access / admission | OM 无 article root 拒绝 N3 | OM preview 默认拒绝、可显式放行 W2 | OM abstract+refs 不够 AF | OM turn-away/root/meta gate I1 |
| 5 body-present | PS .c-article-body，无 substantive gate N1/N3 | PS full wrapper+p W1 | PS 非 abstract/ref 主文段落 A1 | PS articleBody+p I1 |
| 6 readiness | UV 不等待、不独立表示 N3 | PS lazy math/table states WF | PS browser title 先于 body AF | PS refs deferred；fulltext meta 不够 IF |
| 7 completeness | UV 无全文 oracle N3/NF | UV full-content-present 不证明全篇 WF | UV 所测 browser/minimal 计数一致，不是全篇证明 AF | UV fullTextVerified=false I1/I2 |
| 8 excerpt / article scope | KI 小型 authored fixture，runtime 无 scope NF/N3 | KI source excerpt 无显式 scope；preview 另议 W2/WF | KI response fullText=true 不代表 excerpt 全篇 AF | PS seed/selected blocks、明确不证明全文 IF |
| 9 metadata | OM citation_* / JSON-LD fallback N1 | OM citation_* + source W1 | PS visible Silverchair header/history A1 | OM citation_* conflict checks I1 |
| 10 authors | OM ordered source names N1 | OM ordered citation_author W1 | OM visible ordered authors AF | OM ordered citation_author I1 |
| 11 affiliations | PS Nature author-information N1 | PS metadata 顺序关联 W1 | PS superscript mapping A1/AF | PS adjacent metadata；correspondence 不推断 I1 |
| 12 sections / hierarchy | PS Nature section roots N2 | PS h2/h3 accordion WF | PS letters 常无 headings AF | PS source h2/h3/h4 I1 |
| 13 inline math source | PS .mathjax-tex N2 | PS annotation/script 或 lazy image W1 | PS source MathML，wrapper 分类 A2 | PS math/tex 或 math img alt I2 |
| 14 display math source | PS equation .mathjax-tex N2 | PS label/block + original TeX W1 | PS formula wrapper MathML A2 | PS .display-eqn source TeX I2 |
| 15 MathML / TeX / image-only | UV 未证明统一 MathML/image authority N2/NF | PS TeX 优先、image fallback warning WF | UV MathML 已验；image-only/annotation 未验 AF | KI 无 source TeX 的 math 拒绝 I2 |
| 16 scientific inline notation | OM local DOM runs→shared normalization N2 | OM local DOM runs W1 | OM adjacent base、chemical units A2 | PS attachment base 必须可确定 I2 |
| 17 figures | OM numbered models、Extended Data N2 | OM real URLs/caption 或 fallback W1 | OM modal dedupe/figure models A2 | PS viewer hi/lo URL、转入 body I2 |
| 18 captions | SC normalizeFigureCaptions N3 | SC 同 helper + local semantics W2 | SC 同 helper，预恢复 math A2 | PS local token/fragment conversion I2 |
| 19 tables | PS inline 或 guarded article table hydration N2 | PS source cells/spans 展平 WF | PS 单列无 header algorithm AF | KI merged cells 拒绝；矩形才验 I2/IF |
| 20 citations | OM markers + known numbers N2 | OM bibLink superscripts W1 | OM modal source IDs A2 | PS a.cite→footnotes/abs-link I2 |
| 21 citation ranges | PS single anchor/range parsing N2/N3 | PS superscript text expansion W1 | PS data IDs 与 source labels A2 | PS endpoint+dash；缺中间项 fallback I2 |
| 22 references | PS ol 顺序产生 number N2 | PS source bullet/data-bib-id W1 | PS ref-list 原编号 A2 | PS data-reference/indices-id I1 |
| 23 internal crossrefs | SC semantic map + output policy N2/C3 | SC semantic map，cross-host 同 DOI 未统一 W1/C3 | OM fig/table/eq 已验、section oracle 缺 AF | KI 数字引用文字、section slug；无三模式 targets I2 |
| 24 supplementary | PS source section/link 保留 N2 | PS supporting public href W1 | PS descriptions/DOI，非附件下载 AF | PS article/data + Zenodo IF |
| 25 media/resource URLs | PS Nature srcset/high-res N2 | PS data-lg-src/absolute W1 | PS signed CDN image sources A2 | PS content.cld.iop.org hi/lo I2 |
| 26 signed/expiring assets | UV 未有该类来源 oracle NF | UV 未独立验有效期 WF | OM sanitation 去签名≠匿名下载 AF | UV 当前普通 CDN URL，lifetime 未验 IF |
| 27 output dialects | SC markdown/links/quarto N3/C3 | SC 三模式 W2/C3 | SC 三模式 A2/C3 | KI 单一 Markdown API，非 policy parity I2 |
| 28 bibliography output | PS writer referencesBib inference C3/C4 | KI result.bibliography W2，不是统一字段 | PS writer 生成 .bib C4/AF | UV footnotes；无 .bib I2 |
| 29 validators | SC 四项 debug 共用 N3 | SC 四项共用 W2 | SC 四项 debug 共用 A2 | KI converter 未统一返回 validators；tests 调用 subset IF |
| 30 provenance | KI golden 输出/authored fixture，#10 未落地 NF/C5 | OM DOM subtree vs fixture hash/null HTTP WF | OM source Buffer hash+fixture+subtree AF | OM rendered DOM、null HTTP、LF/CRLF IF |
| 31 fixture model | PS authored regressions+output golden NF | OM 四 article 五 source states WF | OM 两 full sources excerpt +真实 preview AF | OM 分块 excerpt /真实 preview /synthetic-head IF |
| 32 warnings / diagnostics | KI string warnings/debug，非统一 envelope N3 | KI debug.access/validations/strings W2 | KI strings/debug/articleHistory A2 | PS typed IopAdapterError + object warnings I1 |
| 33 fail-closed conditions | OM URL/root gate；source completeness 未验 N3 | OM DOI/journal/preview；missing refs 可 warning WF | OM identity/body/math/cite A1/A2 | OM identity/access/math/merged cells I1/I2 |
| 34 parser lifecycle ownership | KI 成功/失败 seam 无 catch close N1 | KI parse failure 无 catch close W1 | KI parse failure 无 catch close A1/A2 | PS parse 返回 data 并自己 finally close I1 |
| 35 JSDOM lifecycle | KI clip 未 close；hydration window 也未显式 close N2/N3 | KI clip 保留 page/dom；拒绝也未 finally W2 | KI finishClip 未 close A2 | OM 每 article stage finally close；一个 permanent realm I2 |
| 36 DOM globals | SC queue own/value restore C1/N3 | SC withDomGlobals C1/W2 | SC withDomGlobals C1/A2 | SC converter realm withDomGlobals C1/I2 |
| 37 Defuddle/Turndown init | KI shared lazy load 可遇 article globals C2/N3 | KI 文档明确保留首窗口 W2/WF | KI shared lazy converter；无 local pre-init A2/C2 | PS empty persistent conversionDom I2 |
| 38 result shape | KI explicit envelope 但 semantic Map/policy funcs N3/C3 | KI spread page 暴露 dom/document W2 | KI explicit envelope 但 semantic Map/policy funcs A2/C3 | OM plain parsed data + markdown I2 |
| 39 plain-data boundary | KI DOM-free ≠ JSON/plain：Map/functions N3 | KI DOM/runtime 泄漏 W2 | KI Map/functions，严格 plain 未满足 A2 | OM 无 runtime 返回、数组/对象 I1/I2 |
| 40 concurrency / determinism | OM concurrent Nature globals test N3 | OM A-B-A 无 fetch WF；composition 见 PF | OM 计数/hash smoke +五入口 composition AF/PF | OM 双 cold order 五入口 composition PF |
| 41 bounded-memory evidence | UV 未为 Nature 建 ownership/heap oracle N3 | UV 未证明 article cleanup WF | UV 未证明 article cleanup AF | UV permanent realm；无 focused heap proof IF |
| 42 live-network assumptions | KI clip 自动 table hydration N2/N3 | OM 接受 supplied HTML，无 fetch WF | OM adapter 无 fetch；真实 browser smoke AF | OM supplied DOM/no fetch I2/IF |
| 43 production integration | PS 正式 bridge/CLI/writer C6 | PS direct experiment，未 route WF | PS 显式 APL bridge exception，CLI 仍 Nature AF/C6 | PS direct experiment，Nature 入口拒绝 IF |
| 44 equation numbering | PS anchors/ID-less fallback N2/N3 | PS source label 优先、独立 display counter WF | PS source label 优先，跳过保留编号 AF | PS source text 保留，无统一 target IDs I2 |
| 45 bibliography source scope | PS article ol，不取 sidebar N2 | PS references section，缺项 fallback W1 | PS authoritative ref-list；modal dedupe A2 | PS lazy canonical refs，selected labels 不重排 I1 |
| 46 exact global descriptors | UV C1 仅 own/value，无 descriptor oracle | UV 同 C1 | UV 同 C1 | UV 同 C1 |

## 矩阵 B：PNAS、AAAS、RSC、SciOpen

| # / 契约维度 | PNAS | AAAS / Science + Advances | RSC / MH + PCCP + JMCC | SciOpen / NR + NRE excerpt |
| --- | --- | --- | --- | --- |
| 1 URL / article identity | PS pnas DOI route P1 | PS two journal DOI prefixes G1 | PS mh/cp/tc routes R1 | PS host + NR/NRE metadata DOI family S1 |
| 2 canonical identity | UV request/meta DOI check，无独立 canonical gate P1 | PS canonical/JSON-LD mismatch G1 | PS canonical pathname check；非全 origin comparison R1 | UV meta DOI gate；历史迁移未 admission S1/SF |
| 3 article ID | PS pnas.<suffix> P2 | PS journal DOI-derived G1 | PS DOI suffix；namespace 需另决 R2 | KI 无统一顶层 articleId；metadata.doi S2 |
| 4 access / admission | OM source core +meta；真实 denial 缺 PF | OM real denial 即使 body root 存在也拒绝 GF | OM unauth/abstract/root/header R1 | OM substantive+scope gate，NRE article 拒绝 S1 |
| 5 body-present | PS core-container 非空 P1 | PS bodymatter+paragraph 且无 denial G1 | PS wrapper/headings gate R1 | PS insert_content_one+substantive prose S1 |
| 6 readiness | PS contributor panes/MathJax 各自加载 PF | PS contributor later projection、unloaded body GF | UV rendered/full accepted，无独立 wait/readiness API RF | PS shell 有 refs/body 为空；opening/closing/leaf checks S1 |
| 7 completeness | UV 全部 validators 不证明完整 PF | UV debug 显式 completeness not guaranteed G1 | UV full DOM smoke 不等于独立 fidelity oracle RF | UV admission.completeness 未证明 S1 |
| 8 excerpt / article scope | KI excerpt 可走普通 API，无 scope 参数 PF/P2 | KI 四 source excerpts 走普通 API，无 scope 参数 GF | KI 六 excerpts，runtime 无 scope 参数 RF | PS article/excerpt 显式；NRE 只 excerpt S1/SF |
| 9 metadata | OM citation_*、分 online/issue/history P1 | OM DC/citation/JSON-LD，记录 precedence G1 | OM citation_* R1 | OM citation_*、online/publication S1 |
| 10 authors | OM ordered meta names PF | OM ordered DC creators，genome100 GF | OM ordered citation_author RF | OM ordered citation_author SF |
| 11 affiliations | PS RDFa associations/多邮箱文本 P1 | PS contributor panes123 entries，缺项不造 GF | UV author panel 未支持 RF | PS institution list，不推断关联 S1 |
| 12 sections / hierarchy | PS nested core h2/h3/h4 PF | PS Science unheaded vs Advances nested GF | PS numbered headings/New concepts/Scheme RF | PS h2 编号推深度 S1 |
| 13 inline math source | PS assistive MathML P1/P2 | PS TeX annotation 优先否则 MathML G1 | PS HTML/有限 MathML/科学图片 R1 | PS source MathML/inert mml script S1 |
| 14 display math source | PS display-formula MathML P1 | PS wrapper 分类 MathML/TeX G1 | PS HTML/image disp-formula R1 | PS disp-formula originalMathML+label S1 |
| 15 MathML / TeX / image-only | PS 缺 assistive 拒绝；源不对称 fence 仅 warning PF | PS placeholder alt 排除，rendered-only 拒绝 GF | KI image/HTML 无权威 TeX；不能保证 Quarto equation RF | PS 原始 MathML reparsing 保护；无 image formula 承诺 S1/SF |
| 16 scientific inline notation | OM local note/power 区分、shared inline P1/P2 | OM local adjacent attachments G1 | PS vector/overline/chemical typography R1 | PS localGreek sub/powers + sharedinline S1 |
| 17 figures | OM figure.graphic 源/去 collateral 重复 P1 | OM figures/viewer button 区别 G1 | OM Scheme/visualabstract 含入 models R1 | PS caption+article link，无 signed image 返回 S1 |
| 18 captions | SC helper + fragment semantic pass P2 | SC helper + citations/math pass G2 | SC helper + finish pass R2 | PS source caption 内联转换 SF |
| 19 tables | PS hidden rows/colspan source oracle PF | PS rowspan/hidden source oracle；viewer-only notes 未验 GF | PS multiParts+notes/span flatten RF | KI 无真实 cells evidence，遇 table 拒绝 S1/SF |
| 20 citations | OM doc-biblioref/data-xml-rid P1 | OM same role +独立 SI namespace G1 | OM xref-bibr modal IDs R1 | PS JATS-like xref/rid S1 |
| 21 citation ranges | PS endpoints dash +refs existence P1 | PS bounded expansion 全编号存在 G1 | PS modal IDs 直接列 number；不据品牌复用 R1 | PS 两 endpoint+minus，有界缺项拒绝 S1 |
| 22 references | PS biblioentry/source labels P1 | PS biblioentry/main sequential G1 | PS ref-list/sourceId/label R1 | PS title_-12 全部 items；重复 ID 不可 query 首个 S1/SF |
| 23 internal crossrefs | SC semantic targets + dialect policy P2/C3 | OM figure/table 真实；section/eq 测试是 synthetic GF | PS Quarto 无 TeX equation 降级 warning R1 | KI markdown section slug；其他目标文本 S1 |
| 24 supplementary | PS Significance/backmatter/SI/data retained PF | PS 显式 convert 补 heuristic 丢 SI G2 | UV ESI modal/download 未接 RF | PS filename+article fallback 无 href；不猜端点 S1 |
| 25 media/resource URLs | PS new/legacy asset href P1 | PS source href、externaldata/code G1 | PS data-src vs preloader R1 | PS raw 可签名；只返回 imageAvailable S1 |
| 26 signed/expiring assets | UV lifetime/download 未验 PF | UV lifetime/download 未验 GF | OM URL 含 query warning；sanitized≠下载 RF | OM OSS 凭据不返回；article fallback S1/SF |
| 27 output dialects | SC 三模式 P2/C3 | SC 三模式 G2/C3 | SC 三模式、局部降级 R2/C3 | KI 明确 markdown only S2 |
| 28 bibliography output | PS writer 临时 smoke；result 不带 bib PF/C4 | PS reuse refs/renderer；result 不带 bib G2/C3 | KI referencesBib=@misc note/DOI，writer 未消费 R2/C4 | UV 仅 footnotes，不声称 bib S2 |
| 29 validators | SC 四项状态，非统一 gate P2 | SC 四项 +失败 throw G2 | SC 四项返回状态 R2 | SC 四项返回前 assert，形状不同 S2 |
| 30 provenance | OM per-block DOM hash/mtime/omissions，非 HTTP PF | OM projection+多次 capture hashes，非 HTTP GF | OM DOM/subtree/fixture+sourceoracle RF | OM selected hash/truncation boundary，不是 HTTP SF |
| 31 fixture model | OM 三真实 excerpts，synthetic 单列 PF | OM 四 admitted+真实 denial，synthetic 单列 GF | OM 六真实 excerpts，三刊六 sourceoracle RF | OM NR/NRE excerpts+真实 truncatedrepro SF |
| 32 warnings / diagnostics | KI debug.warnings strings，无统一 status P2 | KI strings + mathAudit/metadataSource G2 | KI strings+table/equationdegradation R2 | KI top-level warnings/admission，无同形 debug S2 |
| 33 fail-closed conditions | OM URL/body/identity/math/missingcite P1/P2 | OM denial/identity/bibliography/math/validators G1/G2 | OM canonical/journal/unauth/cite；validator 非 throw R1/R2 | OM partial/root/truncation/ref/table/mode S1/S2 |
| 34 parser lifecycle ownership | KI parser reject 无 catch close；成功 seam 给 clip P1 | OM 成功 handoff、失败自己 close G2/GF | OM wholeparser catch 涵盖 latecit999 R1/RF | OM early/latecatch，成功 handoff S1/SF |
| 35 JSDOM lifecycle | KI clip 未 close P2；composition 不替它修复 RF | OM clip finally exact-once G2/GF | OM clip finallyclose/yield R2/RF | OM clipfinallyclose/yield、32 owned windows/child SF |
| 36 DOM globals | SC C1 +五入口 own/value 证明 PF | SC C1 +三模式 composition GF/RF | SC C1 +coldorder/NodeFilter RF | SC C1 +own/value/sentinel SF |
| 37 Defuddle/Turndown init | KI lazyload 可能绑定首 article C2/P2 | OM pre-init existing Node fallback G2/PR43 | OM pre-init；PNAS-first 也有 boundedprobe R2/RF | OM pre-init；不保留 permanentrealm S2/SF |
| 38 result shape | KI Map/policy functions，虽不返 DOM P2 | KI 显式 DOM-free keys 仍 Map/functions G2/GF | KI DOM-free 但 Map/policy funcs R2 | OM plain summary+Markdown，无统一 envelope S2/SF |
| 39 plain-data boundary | KI 严格 plain 未满足 P2/C3 | KI “no dom”不代表严格 plain G2/C3 | KI 严格 plain 未满足 R2/C3 | OM recursiveObject/Array prototype oracle SF L203 |
| 40 concurrency / determinism | OM 五入口双顺序/三模式；参与 coldprobes PF/RF | OM AAAS+PNAS 并发/ABΑ/三模式 GF/RF | OM RSC↔AAAS/PNAS×三模式 cold RF | OM sixcoldorders/四 family 并发/ABΑ SF |
| 41 bounded-memory evidence | OM 参与 512MiB child，未证明 PNAScleanup RF/SF | OM 参与 RSC/SciOpen512MiB child，非无限上界 RF/SF | OM nine512MiB coldprobes/yield；历史 OOM RF | OM six512MiB/gc/batches，无单调累积承诺 SF |
| 42 live-network assumptions | OM supplied HTML，table 无需 endpoint 是单样本观察 PF | OM supplied DOM/no-fetch tests GF | OM supplied full DOM，无网络 RF | OM supplied loadedHTML，不主动等待/fetch SF |
| 43 production integration | PS direct 入口，writer smoke≠route PF | PS direct 入口；未 bridge/CLI GF | PS direct 入口；refsBib 保存责任未接 RF | PS direct 入口；无 writer/route/dialectnegotiation SF |
| 44 equation numbering | PS source label/eqnID，mfenced 局部改写 P1/P2 | UV 顺序 anchors，真实 eq/section crossref oracle 缺 GF | PS source ID/label，image-only 不建 Quarto eq R1 | PS source label 文本保留，非 Quartoanchor S1 |
| 45 bibliography source scope | PS canonicalbibliography，不取 collateral P1 | PS main106 vs SI62–128 区分 GF | PS source numbers，excerpt 保留至 highest RF | PS canonical 唯一 title_-12，NRE52→5 源截断 SF |
| 46 exact global descriptors | UV own/value 仅此范围 C1/PF | UV 同 C1；test 未 assertdescriptors GF | UV 同 C1/RF | UV 同 C1/SF |

## 从矩阵得到的限制与反例

共享的成熟单元是既有 Defuddle converter、正常数学/引用/锚点的部分 normalizers、四类 output validators 和受控 DOM-global queue；不是八入口的同一调用协议。IOP/SciOpen 的 Markdown-only/局部路径反驳“都必须复用 renderClipMarkdown 或都必须有 semantic.crossReferences Map”；Map/function 也不能成为可序列化公共边界。

AAAS/RSC/SciOpen 的 parser-catch + clip-finally、冷启动 converter 初始化和故障恢复提供最强的 ownership 证据。Nature/APL/PNAS/Wiley 尚未遵循；IOP 另以内部关闭、plain return、永久空 realm 解决。这支持共享所有权语义，不支持直接抽出一个接受所有现有 seam 的 runner。Exact restore 当前只证明十个 globals 的 own presence/object value；descriptor/accessor/non-writable 场景未验证。

来源质量也不整齐：APL 有真实响应文件 Buffer digest；其他新实验多为 selected browser DOM/subtree digest。Nature 的 authored fixtures 不能晋升 source-backed，golden 是输出证据。AAAS genome projection “references=128”与 canonical main list106 并不矛盾：SI62–128 是不同 scope。SciOpen NRE browser52/serialized5/reparsed5 来自 export 截断，不能归咎 JSDOM 或伪造 47 条补齐；重复 ID 是另一项风险。

失效处理目前三种：admission throw、output-validator throw、返回 invalid report/可读 fallback。PNAS/RSC/Nature/APL clip 返回 validation 状态，Wiley/AAAS/SciOpen 在返回前 gate；writer 进一步 gate math/rawHTML/crossrefs，但不能据此反推所有实验 clip 已经 fail closed，也没有证明 source fidelity。表格存在、reference 序列与正文边界都必须按源判断，不能用同一个 minimum count 冒充 readiness。

## 本轮同步和验证交接

原 census 两文件先保存为提交后，fetch origin 并 rebase 到上述 exact accepted main，**无冲突，无 conflict-resolution tracked changes**。Rebased census commit 为 a81952d6c9959fb821ec8767c70267c68d702f2a。重新执行 npm ci 成功、0 vulnerabilities；首次 rebased full suite 为 **256 tests / 256 pass / 0 fail / 0 cancelled / 0 skipped / 0 todo**。它取代历史 110/137/153/187 等计数。

文档完成后，Windows / Node v24.14.1 的最终验证：

| 命令 / 审计 | 结果 |
| --- | --- |
| npm ci | exit 0；65 packages installed、66 audited、0 vulnerabilities |
| npm test | exit 0；256 tests / 256 pass；fail/cancelled/skipped/todo 均 0；duration_ms 80899.6822 |
| npm run build | exit 0；extension build 成功，dist 保持 ignored |
| npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto | exit 0；四类 validators valid；250 inline / 13 display math / 50 reference definitions；issues=[] |
| git diff --check 与 git diff --cached --check | 通过 |
| 文档结构 / local links | 46 dimensions × 8 families = 368 classified cells；本轮四文档 local file links 均存在 |
| census preservation | 对旧 census commit 5b9e39c 的两路径 git diff --exit-code = 0；内容保持不变 |
| 非 planning paths | 相对 accepted base 的 src/test/scripts/extension/.github/dependencies/PRD/EDD/README/papers/AGENTS diff 均为空 |

相对 accepted base 的 exact changed paths 为 docs/plans 下的 publisher-coverage-census.md、publisher-corpus-candidates.md、publisher-adapter-evidence-matrix.md、publisher-adapter-contract-proposal.md、publisher-contract-boundaries.md、publisher-rollout-template.md。最终 branch head / clean status 在本轮最终 handoff 报告；无远端 PR/新 head CI 声明。

没有运行 clip:live、建立新 fixtures 或修改 runtime/intent。基线自身的 [Main CI 37182993143](https://github.com/uwougil/Academic-clipper/actions/runs/37182993143) 与 [Secret scan 37182993093](https://github.com/uwougil/Academic-clipper/actions/runs/37182993093) 为 accepted-main 证据，不冒充此文档分支新 head 的远端 checks。PR handoff 中 Draft/open/旧 CI 文字是当时状态；本轮按实际 merge ancestry 和 pinned 源码阅读。
