# Issue #72 — 分数 unit factor 的生产前矩阵与最小实现计划

状态：**SYNTHETIC PREFLIGHT READY FOR ROOT PLAN REVIEW / PRODUCTION LOCKED**。本提交只有新 synthetic tests、执行 receipt 与派生交接文档；不是修复，不创建 PR，不声称 #72 / #10 完成。生产 `src/`、dependencies、B source/oracle、canonical spec、PRD/EDD、golden、writer/security 未改。仍在原 `codex/issue-10-bug-frb-fractional-units` / worktree 上从 `2ef0774d63bba7202c84089e1d233e70197c2cdd` 继续。

## 已完成的来源证据不重做

[原 handoff](bug-frb-fractional-units-handoff.md)、[Issue #72](https://github.com/uwougil/Academic-clipper/issues/72)、canonical §4–7、execution plan、PRD §3/§6、EDD §2.3–2.5 及 fix-bug workflow 约束本阶段。不同作者的 source packet 已在精确 `2ef0774` 报告 **SOURCE_PROJECTION_CLEAR_ONLY / zero blockers**：

- `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue72-independent-source-review/issue72-source-review.md`，9164 bytes / SHA-256 `96c1aa069a3e773b482b63450fbc9c14eb902857895b5244a8e507731b29b766`。
- 同目录实际 machine `source-audit.json`，153780 / SHA-256 `cc34e860ac3992a1bac477e4e5e04f12c4a7f5372aff0f10feac8a6d98d3fa18`。

复用现有 103-block 独立原 source / serializer / projection audit 和原三个 real-clip results / 15-test RED 证据；没有 raw reacquisition、raw semantic parse、A sanitizer、source reaudit、原 real clips 或原 15 tests 重跑。fixture 仅重新核对 byte identity：80065 / SHA-256 `9196756aa9c59254f6b310a59f6218853a6eece7025c4eac926aed21df7b16be`，exact bytes 不变。Methods p50 的8处、p51的4处 `pc<sup>−2/3</sup>` / `km<sup>−1/3</sup>`、35 ordered authors、References1–52、Equ8、4个 cm⁻³、两个 numeric controls 的真实来源合同仍使用原 provenance/diagnosis。

## 实际生产输入与 setup 修正

没有采用本 branch 旧 `a5b6acc` 或正在工作的 #67 Nature 代码。新矩阵只使用 root 已接受的 `134ba67a9eefe8763314454183a625f83a34837b`，外部只读 production snapshot：

`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue72-preflight/accepted-134ba67/src/`

前 owner 的 snapshot 文本复制有 CRLF；不能称为 Git byte-identical。执行前使用 Node `execFileSync('git', ['show', SHA + ':' + file])` 返回的 Buffer 对全部34 tracked `src` files逐项比较。修正仅写外部临时 snapshot，保留原/实际 size/hash 与变更 receipt；尚未执行任何新矩阵，因此没有把旧输入的结果冒充 accepted baseline。

Nature 原物理 bytes：51707 / `9242406296ade3581cce1b73222b0006383d1c9419a378769e9ec2af94bf56f8`。修正后是实际 Git-LF 50461 / `6b3cfc9c69813b20bd20f71633dc18e52e3abcac959d366cc2841bf41fa373e8`。全部34 files now exact Git Buffer；完整 manifest `snapshot-identity.json` 11034 / SHA `57e11a8832719a545a64f8d83c32db134c351fde0f92c594d7a33d3edb3fa8ab`。

外部及本 worktree 的 `node_modules` junction 均指向既有共享 `3417/.../node_modules`，仅作为 read-only dependency import；没有在 junction 内创建测试/snapshot/receipt，没有 npm install/ci 或 lock mutation，没有写其他 owner 的 checkout。Node `v24.14.1` / `C:/nvm4w/nodejs/node.exe`；实际 dependency `.package-lock.json` SHA `dea8bf451dc880801c5ef9c5e7301803f39fe8631a48e06b4e25f9c9224e4767` 是身份记录，不声称更换依赖或按旧 branch lock 安装。

## 新 synthetic 矩阵与真实 RED

`test/nature-frb-fractional-preflight.test.mjs` 中每条 synthetic 输入明确不是 scholarly source，不替代12个真实 roles/C corpus expectations。完整67 cases 全部执行一次，checks 独立记录，失败不会使后续 role/control 被默认为 PASS：

| 类别 | Cases | 结果/用途 |
| --- | ---: | --- |
| whole-factor positives | 8 | 全 RED；两 source-backed units、coefficients、range、denominator、相邻/重复 factors，要求 atomic marker 与完整范围 |
| rejection boundaries | 37 | 修正后的 exact controls 全 PASS；unknown word、未证明的 unit/fraction、0/unsigned/plus/ASCII-minus/extra slash、complex SUP、wrapper/comment/gap/extra scripts、whole-prefix Unicode L/N/M/underscore/astral、两个 typed anchor cues |
| opaque contexts | 11 | 全 PASS；已有 inline/display TeX、code/pre、跨 span 的 literal dollar/backtick、fence、MathJax、equation ancestor、真正 MathML ancestor |
| inherited scientific roles | 6 | 全 PASS；numeric integer、split-SUP integer、italic/bold attachment、Γ index、leading isotope |
| existing normalizer/strict orphan control | 1 | PASS；仅复用既有接口检查 opacity、cm integer/numeric attachment 和 validator 拒绝原 orphan，不提出 normalizer repair |
| mixed production pipeline | 3 | 三 dialect 全 RED；body + 实际 figure caption 均 missing pc/km factor，其他 nonzero numeric/styled/inline/display/citation roles 和另三 validators 实际通过 |
| independent final network ledger | 1 | PASS；attempted operations 为空 |

MathML input 使用 `<math><mrow><mtext><p>...</p></mtext></mrow></math>` 的 HTML integration point；另建初始 DOM 断言 P 的实际 `closest('math')` namespace 是 MathML。没有靠 parser 重排后已不存在的祖先宣称保护。Mixed input 有真实 synthetic figure/image/caption path，`clipNature()` 不下载图片；synthetic remote URL 仅用于 figure identification。三个 synthetic `clipNature` calls 是新增 mixed cases，不能把执行称为 parse-only，也没有调用原 FRB real clip。

Guard 在所有 production dynamic imports、DOM construction、parse 和 clip 前安装：global fetch、callback DNS、promise DNS 都 record-before-throw，随后 `syncBuiltinESMExports()`；独立 ledger test 和 after hook 检查全部 attempts，即使 fallback 吞异常仍会失败。after 的 finally 恢复 bindings；临时包内 prototype window getter 只在进程内收集 JSDOM windows，after 逐个 close 并恢复 getter，没有改 dependency bytes。初次62 parse +3 synthetic clips，63 explicit DOM opened/closed、75 captured windows closed。修正 subset38 parse +0 new clips，38 explicit/captured DOM closed。总100 synthetic parses、3 synthetic clips、101 explicit DOM closed、zero HTTP/DNS。Writer non-use 为 harness API/call-graph 证据，不声称 runtime writer spy。

### 唯一完整执行及受影响 harness 修正

```powershell
$env:FRB_PREFLIGHT_SOURCE_ROOT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue72-preflight/accepted-134ba67/src'
$env:FRB_PREFLIGHT_RECEIPT_ROOT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue72-preflight/matrix-134ba67-initial'
node --test test/nature-frb-fractional-preflight.test.mjs
```

实际 wrapper 用 Node `spawnSync` 的 Buffer 保存完整 stdout/stderr，防止 PowerShell 重写日志 bytes。Child exit1，67 tests 53 PASS /14 FAIL，0 skip/cancel/todo，Node-test1339.7254 ms / wrapper1386.4266 ms。初版 test SHA `671ea5ed115bfbe41a58d7993c03b510265b9bc0095dd4671a441afc6dbc6fa4`；完整 log30786 / SHA `900b799c6c85b8025cb69e1fc0d4bc190709de3aa06ca712aa05a7117876ff45`。

14 failed cases 中8 positives +3 mixed 是 genuine new role RED。两个 anchor 的 label 是 `−2/3`，不能假设其 citation number 为1；正确 contract 是 typed-anchor 不被 whole-unit range 吞掉、non-numeric label 保留。MathJax inline semantic value 按现有接口保留外 `$`；opaque MathJax 和 mixed inline checks 的 delimiter-stripped 期待属于 harness 错误。原 logs/results 完整保留。Rejection assertion 同时加严到任意被猜测的 whole-unit exponent，避免只匹配已知 fraction 值而漏掉 unsigned/wrong fraction；没有增加输入 family。

只运行这些受影响 checks：

```powershell
$env:FRB_PREFLIGHT_RECEIPT_ROOT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue72-preflight/matrix-134ba67-corrected-subset'
$env:FRB_PREFLIGHT_MIXED_CACHE_ROOT='C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue72-preflight/matrix-134ba67-initial'
node --test --test-name-pattern='synthetic reject inference:|synthetic opaque context: mathjax|synthetic mixed body and caption pipeline:' test/nature-frb-fractional-preflight.test.mjs
```

Child exit1，41 tests 38 PASS /3 genuine mixed FAIL，0 skip/cancel/todo，Node-test863.0192 ms / wrapper907.0504 ms；new clips0。每个 cached result 的 exact `rawHtml`、dialect 均检查。修正后 test SHA `8ace802e48c1e76bc91436b67e6df0952c7e13e386488e1e274b627b4b0188d0`；完整 log15719 / SHA `c1548e0eb28ca37bcdac37fc22b11f9be3515e2fa934156b5c97130952d3e20a`。未重复67-case完整矩阵、原15tests或原realclips。联合 distinct实际 records 是67 cases /56 PASS /11 FAIL；这不是一次新的67-test运行，也不是 GREEN。

全部 commands/runtime/log/result/input hashes、67个 IDs 与实际 check status 在 [machine receipt](bug-frb-fractional-units-preflight.json)。原完整结果和日志仅外部 Temp 保留；没有新 full captures。每个 mixed结果恰4 isolated SUPs，其他三 validators valid；最终 corrected mixed 保留 nonzero inherited scientific markers、2 inline TeX、1 display TeX、2 citations、2 cm integer powers、coefficient/sentinels 和 figure caption path。没有 wildcard warning、skip/todo 或 fake registry PASS。

## 待 root 审核的最小 Nature 私有实现计划

1. 新 helper 仅置于 `src/adapters/nature.mjs` 现有 `replaceScientificRuns` 附近，返回已有 range shape `{start,end,tex}`。名称可为 `collectPlainFractionalUnitRun(parent,startIndex)`，仅供 Nature 私有调用；没有 exported generic parser、新 abstraction 或 article-ID hardcode。
2. 只接受立即相邻的 original Text + SUP：Text 尾部完整 factor `pc` / `km`，SUP **exactly one plain Text child**，exact pair `pc → −2/3`、`km → −1/3`。不将当前 source contract 推广为任意 fraction/sign/denominator/unit，不清理源空白、fraction 文本、source values 或 scientific spelling。
3. 同现有 typed-reference guard，`isElement(SUP)` 排除两个 citation cues。拒绝 parent/ancestor `pre,code,math,.mathjax-tex,.c-article-equation`；parent literal dollar/backtick/fence cues跨 siblings存在时保持 opaque。不解析 literal math/code 或跨 wrappers 去推测 attachment。Typed inline/display markers 和已有 collectors 保持原所有权。
4. Whole-prefix 边界检查 `previous.textContent.slice(0,offset)` 的末尾 Unicode `L/N/M/_`，使用 Unicode regexp 判断完整 suffix，不以 `text[offset-1]` 的单个 UTF16 code unit判断 astral字符。如果factor从Text offset0开始且有 previousSibling，拒绝未知拓扑 continuation；Text/SUP 之间必须直接相邻，comment/whitespace/wrapper均不跨越。Immediately following untyped scientific SUB/SUP使候选 ambiguous，拒绝；typed citation SUP可以保持独立。
5. Range 起点是前置 Text 中factor首字符；终点 `setEndAfter(originalSup)`。只提取一个原 unit factor，coefficient、range、measurement、denominator和下一个 factor都留在DOM原位置。`range.tex` 原子化为 `\mathrm{pc}^{−2/3}` / `\mathrm{km}^{−1/3}`，交给既有 `replaceRangeWithScientificMarker`；不能让 `scientificTex` 将 extracted Text当成普通 math-italic unit，也不能把所有周围测量合成指数。
6. 只在现有 element branch 中增加这一私有 narrow collector，保留 inherited collector顺序/outputs；插入点在 plain fractional SUP可到达、typed roles先被排除的位置。既有 inline/display/scientific marker registry继续正常增长，body/caption共用当前 typed pipeline。Mixed tests防止 nonzero marker相互污染。
7. **不改** `academic-inline.mjs` 的全局 literal power rule、其他 scientific collectors、validators、Defuddle、dependency、transport/writer、安全系统、A sanitizer、fixture/provenance/科学输入。#67 compound role、#68/#71正在串行交付的 roles和 p22 numeric family保持各自合同。未来accepted source更新必须由 root授权后选择；本次snapshot不是production adoption。

本计划没有运行 candidate collector，因此 candidate实现正确性、final-head compatibility/new synthetic GREEN、12个真实 source roles GREEN及生产范围审核均 **PENDING**，不能把 baseline rejection PASS冒充新实现已经安全。Root 审核计划并在 #67 → #68 → #71 的共享 Nature生产gate释放后，才可授权正式实现/接纳latest accepted main。正式阶段使用 fresh no-cache原source focused tests、新synthetic matrix、affected/full tests/build/read-onlygolden、不同作者 exact-head review、fresh三平台CI/Secrets，完成唯一 Issue72 delivery PR及 merged-main acceptance。当前不运行full/build/golden、不创建PR、不合并任何 RED branch。
