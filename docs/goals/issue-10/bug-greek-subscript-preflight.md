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

## 下一门槛

本commit只新增newtest/doc，src/sourcefixture/validators/security/golden/deps/canonical/PRD/EDD无改动。Root正式发布#63mergedcommit Main/Secrets接受并释放共享Nature写权之前，**不得实施生产**。之后same64ownerbranch采用latestacceptedmain，重新确认actualcollector范围再最小修复；source原bytes/17oracle不变，不重新生成摘录。

Stablecode/test checkpoint先different-owner增量review，再必要focused（新matrix+原realstyles）、affected、一次full/build/golden/fresh三平台CI/Secrets与immutableexacthead独立review。Root十gate全部PASS才允许独立narrow#64PR squashmerge；mergedMain成功后C才增量复验source17bodycaption及四validators。完整Issue10integration/finalPR仍另行统一完成。无需specchange/humanpolicydecision。
