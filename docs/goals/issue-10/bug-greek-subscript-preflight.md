# Issue #64 — production 前置准备 checkpoint

状态：**PREPARATION_ONLY / PRODUCTION_RELEASE_PENDING**。新边界矩阵已在 unchanged accepted production 做一次 synthetic parse-only RED；没有修改生产或重跑已有效的真实来源/基线。Issue #64/#10尚未完成。

## 固定来源与权限范围

恢复 SAME `codex/issue-10-bug-greek-subscript`，worktree `C:/Users/guoli/.codex/worktrees/issue10-greek-source/academic-clipper`，起始clean head `fcb116e7d4a3e57d4efff3da8dd14590280d42ed`。旧source authored commits保持，原source handoff完整读取；Issue64完整API readback仍OPEN/typebug。采用fix-bug evidence-first协议，PRD §3/6、EDD §2.3–2.5、canonical §5–7要求原上下标和科学语义保留，不扩大publisher/normalizer/validator架构。

Root本阶段仅授权：只读生产调查、OWN新增synthetic test/doc、在accepted f4a5跑一次新synthetic RED。明确不授权src修改、merge/adopt未接受#63候选、真实clip/full/build/golden/PR。这个checkpoint不会取得共享Nature写权。

原120-block source fixture90784 bytes/SHA `227a626f70825f2484e94754cdda3a1a6a6608f4b94f6bbe4c6ff206be9f08b7`，provenance96355/SHA `07e2d0cef0314ac73f6dbcf0fd6949d52c1560f7562a75d467df96ec3da93a12`；source/A/原scientificoracle无改动。Source CLEAR独立packet直接复用，不重审raw/A：

- `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-review-63-64-source/issue64-source-review.md`，5334 bytes/SHA `8c33d7ba35f38fabd352ca376d29dfe89e7833500ea090190c63df2d03f6bcef`。
- 同目录 `issue64-source-review-manifest.json`，67736 bytes/SHA `628be3bf139544503f38b17614489a42e8ec95dfd43c1007c80a33753b84e0d0`。

17 nativeΓ/Ω→SUB角色仍为15正文+2完整Fig5图注；Methods p4/5/6/7/9/13/15，sourceorder2/1/2/7/2/2/1。Fig5/6完整context、8equations、all6creators、refs1–76、rights/JSONLD保持。原实际27tests3PASS/24FAIL与三方言17orphan SUB的真实RED只复用原receipt，不重clip。

## 未实施的最小修复计划

Read-only检查 actual accepted f4a5 `replaceScientificRuns`：元素分支已有styled/math/textnumeric/isotope collectors；plainΓ/Ω上一text-node与SUB没有类型保护。之后existing`scientificTex`和Range抽取生成marker；existingfigure-caption recapture在这些markers建立之后进行，能够复用同一semantic context。

最小计划是在这个existing SUB-element collector chain接入窄plain Greek attachment collector：

1. 仅原previous text末尾单独Γ/Ω，以及直接邻接SUB的真实source角色；source whole-symbol lexical边界保持，不吞Latin/Greekword、数字前缀、未知前sibling/comment/wrapper。
2. 原SUB内部接纳真实plain0/single-letter或单层I a/b/i attachment；拒绝未知wrapper、nestedscript、anchor/citation、typedmath marker/空或prosechild。仍以原range+scientificTex建立同一个表达式，不能重写Markdown或猜未知Greekfamily。
3. 保留原意义空白：Γ与SUB间ASCII/thin/newline/comment都是边界；leftmeasurement/punctuation/operator、右邻citation保持在range外。NativeGreek SUB不等于isotope、numericSUP或其他独立合同。
4. MathJax/display/nativecode/literalmath/backtick/fence保持opaque；借用现有typedmarker/parent边界，不新写数学parser。
5. 不改captionnormalizer：同一个Nature DOM protected marker由现有figure recapture共享context恢复。必须later真实3styles覆盖15body+2caption才可GREEN，不假设body-only成功等于source完成。

只读#63 candidate `1ea875`显示其新增split-SUP collector及optional sourceTex range接口。**没有消费、merge或执行该未accepted实现**；#64 collector与其source角色不重叠，正式生产release后使用届时latestacceptedmain再确认collector链顺序和range接口，避免基于旧src覆盖新修复。

## 新synthetic matrix（非 scholarly 来源）

新增 `test/nature-greek-subscript-boundaries.test.mjs`，只调用实际`parseNaturePage`，不调用clip/Defuddle/normalizers/validators/writer。测试文字/DOM/图注和example.org image URL明确synthetic，不计真实候选/文章/coverage admission。Images仅使既有figure生命周期可执行，不下载。

45条唯一矩阵：

- 12qualification：Γ italicb/a、Ω plain0/italici、plain single-letter语义等价、leftpunctuation/measurementoutside、两个独立range/operator、followcitation/precedingtypedMathJax、两个完整captionrecapture场景。
- 28rejection：无SUB prose；3种separatingspaces；comment/wrappedbase/wrappedSUB；word/Latin/numeric/Greek-prefix与unknownpreceding-sibling；SUBcitation/externalanchor/nestedSUB/nestedSUP/unknownchild/MathJaxchild/empty/prose；otherGreekfamily/SUPseparate；code/nativecodeancestor/mathancestor/dollar/backtick/fenceopaque。
- 5legacycompatibility：typedMathJax、styledGreekbase、knowninteger10power、leadingisotope、nativecitationSUP，保护当前实际接纳行为。

Qualification要求sourcebase/SUB同时进入同一个semanticrun；context必须保留source标点/空白，citation/inlineMath独立，captionprotectedHtml必须使用对应sharedmarkers。Negative不建立猜测的nativeGreekmarker。该矩阵补充新资格/拒绝边界，不重复真实17roles的三方言tests。

## 实际 accepted runtime 与一次 RED

Author branch不merge任何dependency。只在OWN ignored `node_modules/issue64-preflight-f4a5/`放exact accepted `f4a5f2ad74546ea54b990c6080e480871ee98e09` 的35个Git文件（34src+package.json）；perfilebyte/hash/blob与src tree `c452b9ab2b6f582f8948c4535808a142bdf00380`独立记录。只读execution目标以env明确指定；正常newtest默认import当前checkoutproduction adapter。无npmci/install/dependency修改。

```powershell
node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue64-production-preflight/prepare-accepted-runtime.mjs
$env:GREEK_BOUNDARY_ADAPTER_MODULE='file:///C:/Users/guoli/.codex/worktrees/issue10-greek-source/academic-clipper/node_modules/issue64-preflight-f4a5/src/adapters/nature.mjs'
$env:GREEK_BOUNDARY_RECEIPT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue64-production-preflight/synthetic-red-f4a5.json'
node --test test/nature-greek-subscript-boundaries.test.mjs
Remove-Item Env:GREEK_BOUNDARY_ADAPTER_MODULE
Remove-Item Env:GREEK_BOUNDARY_RECEIPT
```

WindowsNode24.14.1，actual session20541终态exit1：**45tests /33PASS /12 expectedRED /9602.5387ms，0skip/cancel/todo**。12失败全部只有missingnativeGreektypedscientificrun（actualTex=[]），不是harness失败；28reject+5existingcompat全PASS。没有重跑任何synthetic/真实baseline以补字段。HTTP/DNS guards record-before-throw、after检查attempts[]和恢复globalbindings；每page DOM在finallyclose。接纳runtimeprepare exit0；newsynthetic nodeprocess仅一次，实际clip0/sourceaudit0/rawreads0/A0/full0。

证据根 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue64-production-preflight/`：

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| prepare-accepted-runtime.mjs | 1675 | `b61488378d9b64bc6d9eb7867b7f3db8968e0697e85b07b815e6948bbe1e2daf` |
| accepted-runtime.json | 8107 | `d1690d909b0d6dffc36a441e05d7377082fb9e0ebbf27c42ea481c928292289b` |
| synthetic-red-f4a5.log | 15295 | `05c3cd3667967f765951c4bbf9a22d6d192695947d254887257dba4effc5e64d` |
| synthetic-red-f4a5.json | 13185 | `9ad4ee876af58fa9c9c503e242cb86856fcf0429472e15ff816089a38be106bb` |
| process-exit.txt | 1 | `6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b` |

Newtest SHA `0978eb02e9fe4164ff0b6ca2e318b7c7905d1014738c25f4e56ce911181a288e`（LFbytes）。原source/audit/globaloutput不重算hash来伪称freshsource验收；read-onlycheck源码与preparedruntime身份不改变既有science。

## 不同 owner 计划审查与补充 context matrix

不同 owner 的 `plan-review-4851903.md` 对 clean checkpoint `485190375685d49ffb3eb2920f79830f226c4845` 给出 `PLAN_SCOPE_COMPATIBLE_WITH_MATRIX_ADDITIONS_REQUESTED`，不是 implementation CLEAR。报告在 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue64-plan-independent-review/`，7734 bytes / SHA256 `bfa7410cc82152e92665a658d5d363d92483c6a180d1e2a89b7983164e57ee3f`。据此新增独立 `test/nature-greek-subscript-context-boundaries.test.mjs`；不加载原45或真实回归文件，避免其 top-level clip 被名称过滤误执行。

新增16条明确 synthetic parse-only 控制：12 rejection（非空前 sibling、comment 连续词、identifier 前缀、3跨span literal cues、mixed/nested SUB、额外SUB/SUP附件），1 inherited styled-SUP compatibility，3 qualification（明确空格分隔的 sibling、href-only相邻citation、mixed body/caption共享非零marker）。拒绝新Greek role时仍保留既有 detached styled SUP、typed MathJax与citations，不能顺手更改另一个collector。

实现资格据此明确：原 text-node 起点不自动是词法起点；真实前空格/标点是分隔，未知前 sibling/comment 与 identifier 连续性不猜成独立Greek变量。SUB仅原单 text atom，或恰一个I且I内恰单 text atom；不压平多个I、I与text混合、I内anchor/MathJax。额外相邻SUB/SUP保守拒绝新增Greek range；独立 native citation SUP不属于额外数学附件，不吞引用。含跨node `$`/backtick/fence cues的原inline parent保守保持opaque；若采用整parent cue guard，也会拒绝已闭合literal region之后的新plainGreek附件，这个未覆盖场景不得宣称通用Greek支持。原typedMathJax marker不等于literal cue。

Mixed wiring control明确body scientific marker为原styled `v_{0}`，caption为新 `Γ_{a}`/`Γ_{b}`；inlineMath/citation也各有body/caption非零shared records。修复后必须分别一对一出现、保持原邻接与顺序、另一区块marker不得漏入，并移除已替换的原Greek/SUB节点。Baseline在missingGreek比较即失败，**后续wiring断言还未执行通过**；不能以global semantic列表存在推导finalMarkdown或caption正确。

原owner已经于2026-10-08 05:57 UTC完成下面唯一新cases RED；恢复owner仅核读终态log/JSON/exit artifact，没有重新启动process或重跑。

```powershell
$env:GREEK_BOUNDARY_ADAPTER_MODULE='file:///C:/Users/guoli/.codex/worktrees/issue10-greek-source/academic-clipper/node_modules/issue64-preflight-f4a5/src/adapters/nature.mjs'
$env:GREEK_CONTEXT_BOUNDARY_RECEIPT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue64-production-preflight/context-synthetic-red-f4a5.json'
node --test test/nature-greek-subscript-context-boundaries.test.mjs
Remove-Item Env:GREEK_BOUNDARY_ADAPTER_MODULE
Remove-Item Env:GREEK_CONTEXT_BOUNDARY_RECEIPT
```

实际 **16tests /13PASS /3 expectedRED /722.325ms，0skip/cancel/todo，exit1**。12拒绝与1旧styled-SUP角色全PASS；两个正例actualTex=[]，mixed actualTex=[v_{0}] 缺captionΓa/Γb，均为预期缺失的nativeGreek保护；已经执行的断言未出现harness错误，但后置断言仍需独立审查。HTTP/DNS attempt ledger=[]、bindingsRestored=true；每个DOM finally close。原45/真实27/A120/raw/sourceaudit/clip/full/build/golden均未重复，未消费未接受#63实现。

同一external preflight目录的新终态证据：

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| context-synthetic-red-f4a5.log | 4692 | `4d70a745b810d318caac717c700afdbaacdea32bf0d480396e9a7b71753a8beb` |
| context-synthetic-red-f4a5.json | 5344 | `6611db83f979bc70d61e4f645a548229ed8e9b0649f8200c68b0967cb872f44d` |
| context-process-exit.txt | 1 | `6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b` |
| new context test (LF) | 7548 | `2357356511559272aadd13798c81e1db9cb0a75dc08cc93ed3e611561c3684d8` |

本补充只增加该测试与本preflight文档；原 source 与 scientific oracle不动。提交SHA可由 `git log -1 --format=%H -- test/nature-greek-subscript-context-boundaries.test.mjs` 重建，前置commit为4851903。Pending mergedMain仍由root唯一核验，本owner未poll/rebase/merge或取得Nature生产写权。

后续不同owner cached/static检查指出mixed的未到达body adjacency断言要求`Body <marker>`，而accepted styled range实际留下`Body <i></i><marker>`。这是synthetic harness的潜在错误，原13/3 RED前置判断仍有效。仅调整测试允许原恰空I或无空I两种exact邻接，不删除原DOM、不为其修改production；marker exactonce、body/caption子集隔离和order断言保持。执行唯一cache-only `node C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue64-production-preflight/context-cached-body-tail-check.mjs`，exit0，核验原body adjacency与body marker exactonce/subset PASS；没有parse/clip/16suite重跑。结果JSON355 bytes / SHA256 `9f082016a94cfeeeee0f564cdca4914737a2297ac663641fcd43155b8d4d330a`。这项有限cached检查不证明新Greek/caption wiring GREEN，生产修复后的正式focused仍须实际执行完整后置断言。前表7548/SHA235735记录的是原baseline测试bytes，harness修订后版本以新commit Git object为准。

## 下一门槛

本commit只新增newtest/doc，src/sourcefixture/validators/security/golden/deps/canonical/PRD/EDD无改动。Root正式发布#63mergedcommit Main/Secrets接受并释放共享Nature写权之前，**不得实施生产**。之后same64ownerbranch采用latestacceptedmain，重新确认actualcollector范围再最小修复；source原bytes/17oracle不变，不重新生成摘录。

Stablecode/test checkpoint先different-owner增量review，再必要focused（新matrix+原realstyles）、affected、一次full/build/golden/fresh三平台CI/Secrets与immutableexacthead独立review。Root十gate全部PASS才允许独立narrow#64PR squashmerge；mergedMain成功后C才增量复验source17bodycaption及四validators。完整Issue10integration/finalPR仍另行统一完成。无需specchange/humanpolicydecision。
