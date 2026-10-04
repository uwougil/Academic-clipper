# Publisher 实验：未来 Work Contract 模板

本模板归纳固定 accepted-main **e85b1b809b56242b89b6313ce5d1165c745466bb** 的八家有限实验经验，用于未来独立 Issue / 最终 delivery PR；不是本轮新增支持、共享 schema/runner 或生产接线授权。配合 [实证矩阵](publisher-adapter-evidence-matrix.md)、[分层提案](publisher-adapter-contract-proposal.md)、[边界表](publisher-contract-boundaries.md) 使用。APS/当前 ACS 为首选未来验证目标，具体反证计划见提案末节；不要在开始前把其 DOM 属性填成已知事实。

## 开始时填写

| 项目 | 必填记录 |
| --- | --- |
| Work Contract | 独立 Issue、一个可交付 outcome、最终一个 delivery PR、明确 non-goals |
| accepted base | SHA、对应成功 merged-main CI/Secret scan；不要只写“latest main” |
| workspace | 分支/worktree、当前 head、已读 AGENTS/README/PRD/EDD、相关#10/#26 规范及适配器证据 |
| 范围 | 具体 journals/hosts/routes/DOI 年代/DOM family；authorised experiment vs 正式支持 |
| 意图冲突 | 如需改变正式 publisher/format/network/权限范围，列出需要人类解决的问题；不静默更改 PRD/EDD |
| 最大约束 | 允许的直接实验入口、owned files、fixture/data 大小边界、依赖/CI/安全/写入器不得改动的部分 |

## 20 个必须机械回答的问题

每项填：**Observed / Implemented / Tested / Unverified / Rejected**，附真实来源、准确源码符号/test 名称、反例/限制。没有证据写 Unverified，不能填“和某平台一样”。来源事实、合成 contract probe 和手工 smoke 分列；若本轮只做调研，Implemented 明确为无。

| # | 问题 | 必须提交的答案 / 验收证据 | 已接受经验提示 |
| --- | --- | --- | --- |
| 1 | Platform identity | publisher/currentplatform/DOMfamily 分别记录；官方/页面 source 证据及日期、历史迁移/redirect；以多个真实 article 子树判断 family | [SciOpen 历史与当前](../experiments/nano-research-sciopen.md)、[RSC 三刊六样本](../experimental-rsc.md)；同 Silverchair/Literatum 品牌不足 |
| 2 | URL identity | 精确 host/protocol/port/credential/path 范围；source DOI/journal/ID 与请求、canonical 核对；articleKey 与 platformID 分开；negative URLs | [APL header identity](../../src/adapters/aip.mjs)、[IOP canonical conflict](../../src/adapters/iop.mjs)、[AAAS 两 journal scope](../../src/adapters/aaas.mjs) |
| 3 | Access evidence | 每 URL 的普通公开导航/HTTP 结果、OA/free/full/preview/denial/challenge；取得方式与时间；访问失败和 parser 失败分别记；不用登录/解 challenge 或绕过 | [APL public browser smoke](../aip-apl-evidence.md)、[AAAS real denial](../../test/aaas-adapter.test.mjs)、[IOP preview](../iop-experiment.md) |
| 4 | Source-backed article census | retained 样本/替换或拒绝候选、每篇新增结构角色、完整观测与 excerpt 覆盖分别列；覆盖收益而非数量优先；重复 states 不是独立 article | [Wiley 同 Small 两 states](../wiley-experimental.md)、[PNAS 三 article](../pnas-experiment.md)、[#10 admission](../specs/issue-10-nature-corpus.md) |
| 5 | Admission/readiness | identity、bodyPresent、substantivebody、refs/math/authorpane readiness、sourceScope、completeness；证明哪些必要条件，哪些仍 unknown；真实和 synthetic 拒绝 case 分开 | [SciOpen opening/closing/leaf checks](../../src/adapters/sciopen.mjs)、[IOP deferred refs](../iop-experiment.md)；body 不等于 ready |
| 6 | Scholarly DOM topology | authoritative roots、headings/levels/order、unheadedparagraphs、abstract/backmatter、modal/collateral copies、UI 排除；hidden scholarly content 不能因 hidden 而删除 | [PNAS hidden row oracle](../../test/pnas.test.mjs)、[AAAS Science vsAdvances](../aaas-experimental.md)、[RSC modal/parts](../../src/adapters/rsc.mjs) |
| 7 | Math | inline/display wrappers、source TeX/MathML/HTML/image authority、label/ID、duplicates/placeholderalt、caption/table/ref math、单位/chemical/note 区分；精确 source→expected assertions；无法转换明示拒绝或 fallback | [Wiley lazy→TeX](../../test/wiley.test.mjs)、[PNAS source fence anomaly](../pnas-experiment.md)、[RSC image math](../experimental-rsc.md)、[SciOpen reparsing](../../test/sciopen-experimental.test.mjs) |
| 8 | Figures | 真实 Figure/Scheme/ExtendedData/graphicalabstract、source label 与 anchor、caption 完整边界/panels/notes/math/cites、duplication、URL 发现优先级、无图 fallback；不能用 figurecount 证明 caption 忠实 | [Nature outer caption](../../src/adapters/nature.mjs)、[RSC Schemes](../../test/rsc.test.mjs)、[SciOpen article fallback](../../src/adapters/sciopen.mjs) |
| 9 | Tables | 真实 cells/row/column/values/spans/hiddenrows/notes/parts 的独立 oracle；布局展平损失；没 cells 和没 table 分别诊断；无真实 table 则明确 unsupported probe 不计 coverage | [IOP merged 拒绝](../../src/adapters/iop.mjs)、[APL algorithm](../../test/aip-adapter.test.mjs)、[RSC 三子表](../../test/rsc.test.mjs)、[SciOpen blocker](../../test/sciopen-experimental.test.mjs) |
| 10 | References/citations | canonicalbibliography root、原 IDs/labels/scope、citation single/range/endpoint/modal、缺失/重复/非法 cluster、SI 范围；只在全部定义有来源时展开，不重编号或补造 | [AAAS main/SI 范围](../../test/aaas-adapter.test.mjs)、[SciOpen52→5](../experiments/nano-research-sciopen.md)、[IOP 非连续 excerpt 编号](../iop-experiment.md) |
| 11 | Crossrefs | 真实 section/figure/table/equation targets 和 label、caption/tablelinks；各 supportedmode 输出或明确降级；缺 target 保留可读信息并诊断；syntheticonly 角色不能标 realcoverage | [outputpolicy](../../src/renderers/output-policy.mjs)、[RSC Quarto image-equation 降级](../../src/adapters/rsc.mjs)、[AAAS eq/section synthetic 限制](../aaas-experimental.md) |
| 12 | Supplemental/media | visible filename/publichref/DOI/data/code 与 JS-onlycontrols 分别记录；signed/expiring vsstable vsfixture-sanitized vsdownloaded；无 href 用原页 fallback，不猜下载端点 | [SciOpen ESM](../../src/adapters/sciopen.mjs)、[APL signed assets](../aip-apl-evidence.md)、[AAAS SI 显式转换](../../src/adapters/aaas.mjs) |
| 13 | Provenance | evidenceKind、URL/time/mode、inputscope、HTTPbyte/DOMprojection/subtree/fixturetypedhash、serializer/recipe 版本、retainedlocators、omissions/scaffold/非原邻接、credential 清理；capture 外存不进 Git | [#10 digest 语义](../specs/issue-10-nature-corpus.md)、[APL Buffer hash recipe](../../scripts/aip-fixture-excerpts.mjs)、[PNAS manifest](../../test/fixtures/pnas/manifest.json)、[IOP nullHTTP](../../test/fixtures/iop/aeaa68.provenance.json) |
| 14 | Parser lifecycle | 每次 JSDOM creation 的 owner；parse 早/晚拒绝、successfulhandoff、conversion/render/validatorfailure 的 close 责任；exact-once counter 与原 error 重抛；converter 不能捕获 disposable realm | [AAAS failure probes](../../test/aaas-adapter.test.mjs)、[RSC latecit999](../../scripts/rsc-lifecycle-check.mjs)、[SciOpen latefailure](../../scripts/sciopen-lifecycle-check.mjs) |
| 15 | Result shape | parser/runtime seam 与 publicsummary 准确 keys、optionalfields、diagnostic/validation 位置；public 无 Window/Document/nodes/functions/Map 等 runtime 引用；递归 plain 检查与 serialization 核对，依赖消费者说明 | [AAAS noDOM keys](../../test/aaas-adapter.test.mjs)还不是 strictplain、[SciOpen recursiveoracle](../../test/sciopen-experimental.test.mjs)、[Wiley counterexample](../../src/adapters/wiley-clip.mjs) |
| 16 | Offline deterministic tests | source-derivedexact 期待、不依赖宽泛 minimum；syntheticvariation 明示；同 source/mode 重复字节一致；无 liveDNS/HTTP；若有 hydration 使用声明资源/ledger，捕获被 catch 吞掉的未声明 request | [Wiley no-fetch](../../test/wiley.test.mjs)、[#10 replay 计划](../specs/issue-10-nature-corpus.md)尚未落地；不要假装公共 runner 已存在 |
| 17 | Cross-publisher composition | 从干净 process 启动每个相关 importorder；A-B-A、并发、fault 后恢复、Markdownhash、per-callsemantic 独立性、十 globals own/value；descriptor 若声称 exact 也需独立 oracle | [PNAS 五入口审计](../pnas-experiment.md)、[RSC 九 coldtests](../../test/rsc.test.mjs)、[SciOpen 六 orders](../../test/sciopen-experimental.test.mjs)；其他 publisher cleanup 范围不能借用 |
| 18 | Bounded-memory test | 限定 heap、process timeout、足够有限 batch、closecounts、event-loopyield/GC 可选诊断；coldorderfault 路径；记录 heapmeasurements/波动/OOM，不抬 heap 掩盖泄漏、不声称无限上界 | [RSC512MiB 历史 OOM 与修复](../experimental-rsc.md)、[SciOpen 六 512MiB 进程](../../scripts/sciopen-lifecycle-check.mjs)；probe 自身不保留 windows |
| 19 | Known unsupported structures | 列 observedbutunsupported、unverified、accessblocked、lossyfallback、sourceanomaly、parserdefect；具体 failclosed/warning 策略、source repro、下一步独立 Issue；不删难例提升 passrate | [SciOpen NRE outcome B/table 拒绝](../experiments/nano-research-sciopen.md)、[PNAS sourcefence](../pnas-experiment.md)、[IOP mergedcell](../iop-experiment.md) |
| 20 | Production integration boundary | directexperiment vsroute/CLI/bridge/writer/status；intentresolution、host 权限/security/下载 scope、bib 保存、UI/fullworkflow 验证另立 WorkContract；实验 merge 不宣称正式能力 | [PRD APL 显式例外](../PRD.md)、[Wiley reverseimport 风险](../wiley-experimental.md)、[PNAS writer smoke](../pnas-experiment.md)、[SciOpen 未接生产](../experiments/nano-research-sciopen.md) |

## 不得做的事情

- 不编写或修改学术原文来制造 source fixtures。Authored/synthetic 契约探针只放明确标识的变体，不冒充真实来源或 coverage。
- 不使用 parser-cleaned HTML 代替 pre-parser source input；不把 DOM/subtree/fixturehash 冒充 HTTPbytes；不把 outputgolden 当 acquisitionprovenance。
- 不猜下载 URL，不执行不明 downloadhandler 补取内容；不把 fixture 去签名 URL 声称为匿名可下载 URL。
- 不绕过 paywall、登录、CAPTCHA 或访问控制；遇阻保留拒绝事实与限制，不更改 safeFetchExternal 保护换取 source。
- 不从 publisher/vendor 品牌、同域名、相似 URL 或官方平台公告推出整个 family 同构；必须有真实 scholarlyDOM 对照。
- 不在证据不足时创造 universalclass/router/sharedrunner/lifecyclehelper/corpusschema；不得复制另一 adapter 的公共 proposal 成为既成接口。
- 不静默接纳 partial/unloaded/truncated article。Metadata/abstract/refs/fulltextURL 标签、JSDOM 自动闭合 HTML 或绿 outputvalidators 不能证明全文完整。
- 不把 image-only 公式 OCR/猜写为 TeX，不给缺 cells 表造数据，不补造 missingrefs/编号，不让 synthetic 拓扑反过来定义真实 source。

这些约束落实于 sourceadmission、fixtureprovenance 和 negativeassertions，不以额外权限流程代替工作。常规 fixture 验证与 build 按 AGENTS 执行；liveclip 是显式按需操作，可能覆盖 paperartifact，不能用于普通 CI。

## 最终 delivery / handoff

PR 描述应能独立重建交接：base/finalhead、Issue outcome、实际 journal/DOMscope、20 项答案、exactchangedpaths、source/expected/actual 证据、公开 access 与未知项、warning/failclosed 表、coldcomposition/heap 范围、准确命令/count/exit、current-headCI、production/intent 边界。使用精确独立 **Refs #N** 行；不使用自动关闭 Issue 关键字。Merge 只接纳代码，由 mergedcommit 成功 MainCI 的既有 automation 完成 WorkContract。

至少执行 npm ci、npm test、npm run build、npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto、git diff --check、git status --short，并审计 trackedfilenames；记录确切计数和合理的平台 skip，不引用 oldhead 绿色结果。CI 保持 Ubuntu Node20/24、Windows Node24；config/tokens/cookies/rawcaptures/dist/node_modules 与非 golden papers 保持 ignored。Sourcefidelity 与 lexicalvalidation 分别报告。

Future shared-contract change 另用独立 Issue：明确要共享的一个小边界、limitedconsumers、已知反例、兼容/rollback 与验收，不把多个 ordinaryPR 共同承担同一 Issue。对本轮提案，只能据人类审查后的新 WorkContract 继续；**本轮不创建实现 PR、不宣布 Issue #26 完成。**
