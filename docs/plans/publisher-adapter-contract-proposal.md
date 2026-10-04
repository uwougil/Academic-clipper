# 最小 Publisher Adapter Contract：证据提案

状态：供人类审查的 Issue #26 架构分析；不是 implementation spec，不宣布 #26 完成。实现证据固定于 **e85b1b809b56242b89b6313ce5d1165c745466bb**。证据 ID 与准确路径/符号见 [矩阵索引](publisher-adapter-evidence-matrix.md#可核对的证据索引)。提案只决定值得共享的语义，不决定 TypeScript types、module paths、base class、runner、router 或 migration patch。

最小可共享边界应围绕“可审计的输入身份/接纳结论、DOM-free 结果、明确的 runtime 所有权、独立输出验证”。目前还不能把八个入口都套进同一个执行器：Wiley 返回 DOM，Nature/APL/PNAS 未关闭 article window，IOP 自己关闭 parse DOM 并保留空 conversion realm，AAAS/RSC/SciOpen 采用 parser-catch/clip-finally，SciOpen 的结果才有严格 plain-data 回归。

概念上的最小成功结果只需要 sourceIdentity、sourceScope、admission（分别记录 bodyPresent、readinessEvidence、completenessEvidence）、markdown 与 validationReport；诊断和详细 scholarly metadata 可由明确的 local evidence 扩充。Runtime ownership 是执行责任，不是塞入这个 public result 的 DOM 字段。下面列出的其他字段是逐项评估的候选，不是要求第一项 PR 全部实现；尤其不要求先统一 figure/table/reference/math schemas 才能治理所有权。

以下 required/optional 仅描述未来候选边界，不能追认现有字段已符合；publisher-local 表示不应纳入首轮共享协议。“share now”表示证据足以提出一个小型独立实现 Work Contract，仍须人类审查；本轮不实现。“share later”要补齐反例处理/消费者；“insufficient evidence”不冻结形状。每一行是一个独立字段或 API 概念，所有拟议名称均在表中解释。

## A. Identity / admission

| 拟议名称 | 语义 / 可共享理由 | 支持证据 | 反例 / 限制 | 地位 | confidence | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| sourceIdentity | 输入 URL 与源中 DOI/journal/article identifiers 的有证据关联；防串篇是共同需求 | Wiley W1、APL A1、IOP I1、PNAS P1、AAAS G1、SciOpen S1 | Nature N1 不做对应 mismatch gate；RSC R1 numeric URL 与 DOI 关联较弱；不能统一 URL grammar | required；核对方法本地 | high | share now |
| canonicalIdentity | 记录 canonical claim 与 sourceIdentity 的核对结果，不默认替换请求身份 | IOP I1、AAAS G1、RSC R1、Nature N1 | Nature 只用 canonical 输出；RSC 仅 pathname 比较；PNAS/Wiley/SciOpen 独立 canonical 规则缺证据 | optional | medium | share later |
| articleKey | 本地保存/比较用稳定 key，与 DOI、platform ID 分开 | N1、W2、A1、P2、G1、R2 | IOP/SciOpen 无同形顶层 field；RSC suffix 的跨 family namespace 和迁移稳定性未决 | optional；计算本地 | medium | share later |
| sourceScope | article 或 excerpt 的明确输入意图；删节回放不升级全文 | SciOpen S1/SF；其他七家 fixtures/documentation NF/WF/AF/IF/PF/GF/RF | 仅 SciOpen runtime 有 scope；preview 是 access 状态，不能等同 excerpt；调用者声明不能证明 source 完整 | required | high | share now |
| admission | 已接纳、拒绝或未验证的理由及检查证据；不和 warnings/validation 混为一体 | I1、W1/W2、A1、G1、R1、S1 | 状态字符串/错误形状不统一；Nature gate 弱；不能以统一段落数替代检查 | required | high | share now |
| bodyPresent | scholarly body 是否出现的观测，独立于 metadata/abstract/refs | A1、I1、G1、S1、W1 | Nature 仅 root 存在；AAAS denial 也有 root；不同 family 的 substantive 条件不同 | required 观测；判据本地 | high | share now |
| readinessEvidence | 记录 body/refs/math/author panes 在什么阶段可用；表示必要条件，不是浏览器 wait 实现 | Wiley WF、APL AF、IOP IF、AAAS GF、SciOpen SF | 部分页面 SSR、部分 deferred；同一 DOM 可缺 affiliations 但有 body；RSC 没有独立 wait 证明 | optional，具体规则本地 | high | share now |
| completenessEvidence | 标明未知、明确局部/截断或有独立比对依据；绿 validator 不能填“完整” | IOP fullTextVerified=false I1；AAAS G1；SciOpen S1/SF；PNAS PF | 未有八家统一全文 oracle；SciOpenopening/closing 是必要条件，不能建立全篇证明 | required；允许 unknown | high | share now |
| migrationEvidence | 记录 redirect/当前与历史 platform 观察，不将供应商品牌当 identity | SciOpen SF 历史 Springer 边界；RSC RF 旧 route 迁移 | 当前 ACS 仅 census；未 admit 历史 SciOpen DOI；没有通用 migrationresolver | publisher-local | medium | remain publisher-specific |

## B. Publisher-local DOM extraction

| 拟议名称 | 语义 / 可共享理由 | 支持证据 | 反例 / 限制 | 地位 | confidence | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| extractScholarlyContent | 概念上的 local extraction 阶段，限定 authoritative roots 并排除 UI | 八家 N2/W1/A2/I1/P1/G1/R1/S1 | 多个入口在 parse 内异步 convert 或多次建 DOM；不冻结统一 parse signature/seam | publisher-local | high | remain publisher-specific |
| discoverMathSource | 区分 source TeX、MathML、HTML typography、image-only，并保留 source label | N2、W1、A2、I2、P1/G1、R1、S1 | IOP 拒绝无 TeX；RSC 可保留图片；PNAS mfenced 有局部处理；不能统一 selector/优先级 | publisher-local | high | remain publisher-specific |
| extractTables | 按真实 cells/spans/notes/parts 判定捕获或 fallback/拒绝 | N2、WF、AF、IF、PF、GF、RF | SciOpen 无真实 table；IOP 拒绝 spans；APL 仅 algorithm，不能要求通用 grid 成功 | publisher-local | high | remain publisher-specific |

## C. Scholarly semantic result

| 拟议名称 | 语义 / 可共享理由 | 支持证据 | 反例 / 限制 | 地位 | confidence | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| clipSummary | public DOM-free 且只含 plain objects/arrays/scalars 的摘要边界；与 runtime seam 分离 | SciOpen S2/SF；IOP I1/I2；AAAS G2/GF 证明 DOM-free 修复价值 | AAAS/RSC/Nature/APL/PNAS 仍 Map 及 policy functions；Wiley 还 dom/document；不能只删顶层 dom 宣称 plain | required 未来公共边界 | high | share now |
| metadata | 来源明确的 title/DOI/journal/dates 等，不猜失踪字段 | 八家 N1/W1/A1/I1/P1/G1/R1/S1 | dates 字段/优先级不一致；Nature 默认 Untitled/Nature，APLvisibleheader；不冻结全量 requiredmeta schema | required 容器；细项暂本地 | medium | share later |
| authors | 按源顺序保留作者姓名，不用排序/去重破坏作者顺序 | 八家来源及 NF/WF/AF/IF/PF/GF/RF/SF tests | RSC/IOP 部分 authors gate 弱；只有姓名不能证明作者 pane ready；name parsing 国际化未验 | optional 源有则保留 | high | share now |
| affiliations | 保留源机构及有证据的关联，未关联不猜 | N1/W1/A1/I1/P1/G1/S1 | RSC 未验；SciOpen 仅 institution list，PNAS 多对多，APLsuperscript；不能强制 author-index 数组 | optional，映射本地 | medium | share later |
| sections | 源 heading 顺序/深度/label，不强制 Main/Methods | N2/W1/P1/G1/R1/S1、IOP I1 | APL letters 常无 heading；SciOpen 按数字恢复 h2 层级；各 slug 算法不同 | optional | medium | share later |
| mathEvidence | 记录 source representation、inline/display、源 label 及转换/降级依据；无源 TeX 就不填它 | N2/WF/A2/I2/PF/G1/R1/S1 | 数学等价性没有通用 oracle；imageOnly 与 displayTeX 不可替换；局部 audit 并非同一 data shape | optional 有 math 时保留证据 | high | share later |
| figureEvidence | 保留 label/caption/原页 target 和是否有可用资源的事实 | N2/W1/A2/I2/P1/G1/R1/S1 | SciOpen 没有 stableimageURL；RSC 含 Scheme/graphicalabstract；caption fragment 处理不同 | optional | medium | share later |
| tableEvidence | 保存源 cells 捕获状态、fallback 或 unsupported 及损失说明，不仅 table 数量 | N2/WF/AF/IF/PF/GF/RF/SF | 当前 status 字符串不一；布局展平不等于视觉忠实；SciOpen 只拒绝 | optional 遇 table 必须诊断 | high | share later |
| referenceEvidence | 记录原编号/sourceIDs、source scope、文本和有证据 DOI；与格式化 bibliography 分离 | W1/A2/I1/P1/G1/R1/S1 | Nature 按 ol position 编号；IOPexcerpt11/40/41 非连续；AAASmain 与 SI 并非一个 list | optional 源有则保留 | high | share later |
| crossReferenceEvidence | target 类型/sourceID/label 及输出降级；不共享 publisherID 发现 | N2/W1/A2/P1/G1/R1/S1 | IOP 只 sectionslug；AAAS 真实 eq/sectioncrossref 未冻结；RSCimageeq 不能有 QuartoeqID | optional | medium | share later |

## D. Markdown conversion / normalization

| 拟议名称 | 语义 / 可共享理由 | 支持证据 | 反例 / 限制 | 地位 | confidence | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| convertPreparedContent | 复用现有 Defuddle 转 Markdown，输入已按 local 责任准备 | C2；N3/W2/A2/P2/G2/R2/I2/S2 | defuddleToMarkdown heuristic 会丢 SI/heading；APL/RSC/PNAS/SciOpen 直接 html 路径；不强制 readability 阶段 | required 转换责任；方法 local | high | share now |
| supportedDialects | 显式列出入口实际支持的模式并拒绝不支持请求，非强制三模式 | N3/W2/A2/P2/G2/R2；S2 明确拒 links/quarto | IOP 没有 mode API；SciOpen 仅 markdown，不能靠默认 outputPolicy fallback 冒充支持 | required 能力声明 | high | share now |
| markdown | 最终文本，确定性应对同一输入/模式/依赖版本成立 | 八入口+测试 | 字节一致仅覆盖 fixtures；不能跨依赖升级保证恒定；不等于源完整 | required 成功输出 | high | share now |
| bibliographyArtifact | 有来源依据的独立 bibliography 输出与保存责任 | C3/C4、W2、R2、PFwriter smoke | Wiley.bibliography / RSC.referencesBib 不同，writer 重生成且未消费 RSC 字段；Naturefree-text 推断与 RSCnote-only 不同 | optional | medium | share later |

## E. Validation

| 拟议名称 | 语义 / 可共享理由 | 支持证据 | 反例 / 限制 | 地位 | confidence | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| validationReport | 输出 math-delimiters/structure/rawHTML/crossrefs 独立结果，带 dialect 语境；复用既有 validators | C3/C4、N3/W2/A2/P2/G2/R2/S2 | IOP 仅 tests subset；SciOpenassert 无同形报告；Wiley.debug.validations 与其他 debug 不同 | required 在受支持输出范围 | high | share now |
| rejectInvalidOutput | 必需输出检查失败不得返回被标记为成功的结果；preserve originalerror/diagnostic | W2/G2/S2 gates；C4writer gates | N3/A2/P2/R2 返回 invalid 报告；structure 是否 mandatory 在 writer 不一致；不据绿 tests 宣布已统一 | required 候选行为 | high | share now |
| sourceFidelityCheck | 由 source-derived oracle 比较 metadata/math/table/refs 等，不以 validator 代替 | WF/AF/IF/PF/GF/RF/SF 语义 assertions；NFgolden 约束 | 没有统一 full-articleoracle；作者、公式等价性、viewer-only notes 仍缺项 | publisher-local assertions | high | remain publisher-specific |

## F. Provenance / corpus

| 拟议名称 | 语义 / 可共享理由 | 支持证据 | 反例 / 限制 | 地位 | confidence | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| evidenceKind | 明确 source-backed excerpt、synthetic mutation、authored fixture、output golden 等不同证据类型 | NF/WF/AF/IF/PF/GF/RF/SF；C5 §3/§5 | 现有字段非同形；synthetic 示范可测试契约，不能提供 publisher 覆盖事实 | required 证据记录 | high | share now |
| acquisitionEvidence | URL/observedAt/captureMode/sourceScope 及 browser→export→reparse 的已知变化 | WF/AF/IF/PF/GF/RF/SF | PNASmtime 非 server 时钟；IOPdecodedresource 非原 bytes；SciOpen 截断来源未知内部层 | required 来源记录；未知须标明 | high | share later |
| typedDigests | 分别定义 HTTP 解压后未 decodebytes、serializedDOM、retainedsubtree、committedfixturebytes 的 hash | C5 §6、AF sourceBuffer、WF/IF/PF/GF/RF/SF explicitlimitations | 字段名称“source”语义不一致；IOP fixturehash 规范 LF/CRLF；AFscript 只能证明输入 Bufferhash，不能仅靠 recipe 证明 transport 原 bytes | required fixture digest；HTTP 可 null/缺省并说明 | high | share later |
| transformations | 可复现 sanitizer/serializer 版本、retainedblocks、scaffold/omissions 及不保持邻接的说明 | Wiley/AIP/PNAS/RSC/SciOpenrecipes 与 IFprovenance | 没有统一 serializer；跨次 capture 重组不等于完整 response；不能去掉困难结构再声称原 coverage | requiredexcerpt 证据 | high | share later |
| deterministicReplay | 严格 offline、声明每个 resource 和 DNS/HTTP ledger，重复输入/顺序稳定 | WF/GF/RF/SF no-fetch/ABΑ；C5 §7 设计 | Nature 自动 hydrate 且 clip 不透传 fetch/resolver；共同 runner/#10 H1 未实现；throw 被 catch 吞掉不代表无网络 | optional 未来 test 基础设施 | medium | share later |

## G. Runtime lifecycle

| 拟议名称 | 语义 / 可共享理由 | 支持证据 | 反例 / 限制 | 地位 | confidence | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| parserOwnership | 创建者负责其 DOM 直到成功 handoff；任何 parser 拒绝/晚期异常自己关闭，并重抛原 error | AAAS G2/GF、RSC R1/RF、SciOpen S1/SF latefailure | N1/W1/A1/P1 未整体 catch；IOP I1 直接返回 plaindata，根本没有 DOMhandoff | required 所有权语义；seam 形状 local | high | share now |
| conversionOwnership | 接受成功 handoff 的 clip 在成功/转换/normalization/validation 失败后恰 close 一次 | G2/R2/S2 exactcounts GF/RF/SF | N3/A2/P2/W2 未 close；IOP 内部 finally 是不同模型；childtest 不负责关闭别家窗口 | required 有 handoff 时 | high | share now |
| converterLifetime | Defuddle/Turndown 初始化不能依赖随 article 关闭的 DOMParser；modulecache 与文章所有权分开 | PR43 G2/GF、R2/RF、S2/SF coldorders；I2 emptyrealm | Nature/Wiley 首窗口策略；PNAS-first 后再 pre-init 不能追溯改变缓存；现有 staticimport 仅证明受测 coldorders | required 约束；初始化策略暂不统一 | high | share now |
| domGlobalIsolation | 转换期间十个 DOMglobals 排队安装、成功失败后恢复原 ownpresence/objectvalue | C1、N3、PF/RF/SF sentinels | descriptor/accessor/non-writable 不在实现/测试范围；全 processimport 并非被 queue 控制 | required 值/存在性隔离 | high | share now |
| exactDescriptorRestore | 是否要求也保持完整 propertydescriptor/accessor 且支持特殊 global 布局 | C1 暴露未保存 descriptor 事实 | 没有 descriptororacle；恢复 setter/non-writable 会有语义风险；不能称当前 exact 所有语义 | optional 未来增强 | low | insufficient evidence |
| compositionEvidence | 独立 coldprocess 双顺序、A-B-A、并发、异常后恢复；检查所有权/outputs/globals | PF 五入口审计；RF 九进程；SF 六进程 | 八入口任意顺序全组合未证明；IOP 永久 realm 与多模式不等价 | required 相关共存组合的交付证据 | high | share now |
| boundedRunEvidence | 固定 heap 下有限 batch/GC 诊断、closecounts、无 OOM；不规定恒定 heap 值 | RF/SF 512MiB coldtests/yield/measurements | 历史 RSC OOM；不是理论 upperbound；Nature/Wiley/APL/IOP 未有 focused 证明 | required 对生命周期改变的验证 | high | share now |

## H. Diagnostics

| 拟议名称 | 语义 / 可共享理由 | 支持证据 | 反例 / 限制 | 地位 | confidence | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| diagnostic | 带 stage/severity/reason 及 source 定位的可序列化诊断；warning 可伴成功，failure 须改变 admission/output 状态 | I1 typederrors/objects；G1mathAudit；S1admission；N3/W2/A2/P2/R2warnings | 当前大多 string，多个不同 debug 层；完整 code 枚举缺证据，不能把所有 warning 转 throw | optional 列表，失败必须有理由 | medium | share later |
| failureStage | 区分 source 访问/取得、身份、readiness、extraction、conversion、validation 与 writer 失败 | IF/AF 访问 observations；RF/SF lateparser/conversion；C5futureliveclassification | suppliedHTML API 通常不知道 network 失败；transporttruncation 不能归 parser；第三方错误需保留 cause | required 可知阶段；允许 unknown | high | share now |

## I. Optional resource acquisition

| 拟议名称 | 语义 / 可共享理由 | 支持证据 | 反例 / 限制 | 地位 | confidence | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| resourceEvidence | 区分 source locator、stablearticlefallback、sanitizedfixtureURL、signed/expiringURL 与成功下载，不猜 endpoint | N2/W1/A2/I2/P1/G1/R1/S1，AF/RF/SF 签名边界 | SciOpen 不返回 signedURL；APL 去签名不保证匿名下载；其他 lifetime 未验 | optional；发现 local | high | share later |
| acquireResources | 若获授权，独立有 URL/DNS/redirect/timeout/size/type 保护的资源取得责任 | C4 safeFetchExternal/writer；N2boundedarticlepath；AFguardedacquisition 记录 | 其他实验均无网络；Naturetablehydration 资源 bounds/fixture 注入 seam 尚有#10 问题；禁止统一自动 hydrate | publisher-local 策略，shared 安全 primitive 既有 | high | remain publisher-specific |

## J. Production routing / writer boundary

| 拟议名称 | 语义 / 可共享理由 | 支持证据 | 反例 / 限制 | 地位 | confidence | 建议 |
| --- | --- | --- | --- | --- | --- | --- |
| productionEligibility | 明确是隔离实验还是有已解决 intent/route/security/用户流程验收的入口 | C6 Nature/APL 例外；AFbrowser/bridge，WF/IF/PF/GF/RF/SF 实验边界 | accepted-main 有代码≠正式 publisher 支持；不得因 sharedcontract 提出就注册 routing | required 交付说明，不作自动 dispatchAPI | high | share now |
| writerHandoff | 只传 plain clipdata/文本/声明资源；writer 保持 transaction/security 及 bibliography 保存责任 | C4、AFbridge、PFwriter smoke | 现 writer 依赖 policyfunctions/Map，重生 bib；RSC/Wiley 不同 artifact 未接；接入 Wiley 会有反向 import 风险 WF | optional 未来 integration | medium | share later |

## 18 项新出现主题的裁定

| # | 主题 | 当前证据支持共享什么 | 不足 / 反例及下一步 |
| --- | --- | --- | --- |
| 1 | readiness != body presence | high：共享分别记录观测，具体判据 local | APLtitle 先 body、IOPbody 先 refs、AAASauthors 晚到、SciOpenpartialbody；AF/IF/GF/SF |
| 2 | completeness != validator success | high：共享未知/局部/截断事实与独立 outputreport | 没有全篇 oracle；PNAS 源 fence 异常仍可过 lexicalcheck；PF/S1/C5 |
| 3 | article != excerpt scope | high：共享 scope 语义，不能自动推断 source 完整 | S1 唯一显式 runtime 实现；其他 excerptAPI 尚需迁移，preview 不等于 excerpt |
| 4 | public result 不能泄漏 runtime | high：共享严格 plain 边界；先界定 DOM-free 与 plain 的差别 | G2 修复只排 DOM；Map/policyfunctions 仍在；W2 泄漏；SF recursiveoracle 最强 |
| 5 | parser 拥有直到 handoff | high：共享 ownership 规则，不强制同一 parser 返回形状 | G2/R1/S1 成功 seam，I1 自闭 plainreturn；旧四入口违反 |
| 6 | clip 关闭成功 parserDOM | high：共享接收方 finalization 责任 | G2/R2/S2 exactonce；N3/A2/P2/W2 无 close，不可直接统一 runner |
| 7 | parser 拒绝自己 close | high：共享 wholeparser 异常覆盖 | RF latecit999、SF lateexception、GFrealdenial；局部 earlyclose 不足 |
| 8 | converter 不捕获 disposable realm | high：共享 lifetime 约束 | G2/R2/S2 coldproof；I2 永久 emptyrealm 另一实现；全 importorder 未证 |
| 9 | DOMglobals 必须 exact 恢复 | high：当前 ownpresence/value；descriptor 目标 low 未证 | C1 snapshots 未记 descriptor；RF/SF 只 assertown/value，不能把 exact 扩写为完整 descriptor |
| 10 | 并发不能污染 publisherstate | high：共享 composition 交付要求和 per-call 隔离 | C1queue、PF/RF/SF；并发不等于所有 CPU 阶段 parallel；全八模式组合未证 |
| 11 | source 与 synthetic 分开 | high：共享 evidenceKind/原编号/sourceoracle | NFauthored 不可升级；GFsection/eq 变体与 SFtableblocker 是 synthetic |
| 12 | media 可能 signed/expiring | high：共享资源事实与 fallback 语义，discoverylocal | AF/RF/SF；fixture 删 query 不是可下载证明；不承诺每家 signed |
| 13 | mathauthority 不同 | high：共享来源 representation 说明，优先级 local | N2/IFTeX、P1/G1/S1MathML、R1HTML/image、WF 惰性→TeX；无 OCR 推测 |
| 14 | table 支持须有来源证据 | high：共享 coverage/unsupported 说明，extractionlocal | IFmerged 拒绝、SF 无 cells 拒绝、AFalgorithm 局限；PF/GF/RF 复杂 cells 不能泛化 |
| 15 | crossref 依 dialect | high：共享能力/降级声明；targetdiscoverylocal | C3 成熟 policy 但 S2/I2 无三模式；R1 无 TeXeq 不建 Quartoeq；GF 缺真实部分 oracle |
| 16 | warning != admission failure | high：共享 severity/status 分离；详细 codes 待 later | WFpreview 显式允许、RFimagewarning、SFmediafallback；缺 ref 可 warning 或 throw 因 scope/承诺不同 |
| 17 | failclosed 是 contract 一部分 | high：共享不返回被误标完整/成功的失败；具体触发 local | G2/S2 输出 gate vs P2/R2 状态返回；不能无来源把所有 warn 变拒绝 |
| 18 | source/canonical/migration 分开 | high 概念，medium 统一字段 | N1canonical 宽、I1/G1 核对、R1pathname、SF 历史 DOI 未验；ACS 迁移仅未来目标 |

## 下一轮如何推翻这份提案

**CONTRACT EXTRACTION EVIDENCE** 只有固定基线的八家源码、source excerpts、tests 及 mergedhandoffs。**FUTURE CONTRACT VALIDATION TARGETS** 来自 [census](publisher-coverage-census.md) 和 [候选表](publisher-corpus-candidates.md)；APS/ACS 当前没有 source-backed adapter evidence，不把它们计算进任何 high-confidence 支持家数。候选可访问性应在实际实验重新核实；不以 census 的公开索引/品牌或平台公告建立 DOMcontract。

| 目标 | 拟挑战的假设 | 实验应取得什么 | 何种结果构成反证 / 决策 |
| --- | --- | --- | --- |
| APS：math authority | mathEvidence 可保留 source authority，converterLifetime 不依附文章窗口 | PRB/PRL/PRX/PRR/RMP 等候选中真实 inline/display/编号公式；冷启动前后相同 inputs | 仅 visualmath/无可可靠提取 source 时必须拒绝或明示图像；不能强迫 TeX-only；新 representation 应留 local 直到实证 |
| APS：equation/crossrefs | label 优先而非全 math 顺序；supportedDialects 可局部降级 | source 真实 unnumbered-before-numbered、equation/section/figuretarget、captionlink | label 与 ID 分离/多 paneltarget 使现 targetmodel 失效；缩小 crossReferenceEvidence，勿改 source 以过 validator |
| APS：citations | referenceEvidence 足以保存原编号/cluster 及 scope | 单 anchorrange、多 anchorendpoint、notes/reference 混合及缺项负例 | 非数字 labels/嵌套 notes 使统一 sequential 假设失效；不重编号、local 处理 |
| APS：identity | sourceIdentity 与 articleKey 可分开，canonical 不是请求 URL 替身 | finalURL/DOI/canonical 及旧路径/版本 source observations | 同 DOI 不同 version 或 canonical 别名使 key 不可稳定；保留版次/关系，不猜 merge |
| APS：access/readiness | bodyPresent、readiness、completeness 可独立表达 | 公开 OA 完整页面与普通受限/abstract 页；普通 load 阶段的 body/refs/math 计数 | 有 body 但 selected/full 章节未就绪，或 root 不区分 preview：不能依赖 Naturegate；拒绝/unknown 直到证明 |
| current ACS：scientific notation | sourceMath 与化学 typography 可以分清，plainresult 不需 DOM 持久化 | JPCC/JPCL/NanoLetters/ACSNano/JACS 等 source 的 charge/isotope/subsup/bond/units/styledsymbols | sharedinline 把 chemistry 错误转数学、caption/table 异形：保留 localtypedprotection，独立 expert/sourceoracle |
| current ACS：figures/tables | figure/tableEvidence 容器可容纳 caption、Scheme、parts/notes 及 loss | 当前 DOM 的 Figure/Scheme/table 原 cells、spans、footer/viewerduplicate、lazyvariants | table 非 HTML/多 panel 关系不能 fit 现 grid，fallback/reject 并重新评估；不能把 RSC Silverchairselector 直接套用 |
| current ACS：supplementary/media | sourceURL 与可下载/expired/sanitizedfixture 状态分离 | 真正公开 href、JS-onlydownload 按钮、签名 resource 的 sanitation 说明 | 无 publichref/临时 permission：用 articlefallback，不猜 ACSendpoint；授权资源流程单独立项 |
| current ACS：references | mainbibliography 与 SI/list/scope 可区分 | 真正 sourceIDs/原 labels/cluster/DOI、notes、lazyreferences | labels/引用 scope 异形反驳统一 numericsequence；不要用 Silverchair vendor 名判同族 |
| current ACS：migration/identity | migration 只是证据关系，不能等同 source/canonicalID | 当前页面与历史 landing URL 的正常 redirect/DOI/canonical 核对 | 2026 平台迁移后 legacy/currentasset 或 ID 变化：拆 family/version，不照抄 AIP/RSC identity 或抓旧 ACS fixture 冒充 current |
| Wiley expansion（可选） | 现四期刊 family 仅为范围内共同 DOM，非全 Wiley | 原 AFM preview 的公开完整样本；额外刊/年份、author/math/table variants | fullroot 却不同 refs/math/authorpane：扩大 localscope 前重做 admission，不放宽既有 gate 换取通过 |

APS/ACS 各用独立 Issue/最终 deliveryPR；先做合法 sourceadmission，遇阻记录 access/sourceblocker，不制造 fixtures 或绕过。至少有真实 math/table/reference/crossref 结构及差异 oracle 后才评价提案是否经验证；syntheticnegatives 只验证 failclosed。现有候选无需全部抓取，优先选择能反驳已有假设的样本。

## 是否可开始小型实现 PR

证据足够在人工确认小范围 Work Contract 后，开始一项聚焦公共 plain-data 边界、admission/output 区分及生命周期语义的小型实现 PR；不够冻结全量 semantic schema、所有 adapter 执行器、共享 corpus runner、resource hydrator 或 production router。首轮应明确选择已有 exact-once/DOM-free 证据的 AAAS/RSC/SciOpen 作有限消费者，并解释 AAAS/RSC 的 Map/function 反例；不能顺带重写 Nature/APL/PNAS/Wiley/IOP。是否改变现有 public shape、如何兼容 writer、是否仅治理文档还是迁移 API，须人类在实现 Issue 解决。

剩余矛盾：旧四入口 cleanup 与新模型不一致；DOM-free 与 JSON/plain-data 的差别；IOP 永久 realm 与静态初始化方案的差别；返回 validator report 与 mandatory gate 的差别；Wiley/RSC bibliography 字段与 writer 重新生成 bibliography 的差别；Nature 自动网络 hydration 与其他 offline 入口的差别；excerpt scope 缺省与完整性；canonical 核对力度及跨 host fragment；#10 HTTP provenance 计划与 browser excerpt 现实。每项都已有来源，不用“通用 parser”掩盖。**本轮只交付提案，停止供人类审查；不创建实现 PR、不宣称 Issue #26 完成。**
