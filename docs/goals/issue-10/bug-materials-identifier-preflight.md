# Issue #68 — typed identifier 实施前交接

状态：`PREFLIGHT_RED_ONLY`。生产未修改，shared Nature gate 未释放。原 source/oracle 独审已为 `SOURCE_CLEAR_ONLY`；本提交补充新的 constructed DOM 边界矩阵和最小方案，不重复来源审核或真实文章 clips。Issue #68 / #10 都未完成。

## 身份与复用范围

Own worktree `C:/Users/guoli/.codex/worktrees/issue10-materials-identifier/academic-clipper`，branch `codex/issue-10-bug-materials-identifier`。恢复时 clean source head `d501e4f8291d0e88cf5fcd0faa2a545bb29da0d7`，原 source commit `7d64103cc89474675119740d75a20a8b937fc6cc`。原 accepted base `3889f7396eab99060bec88fc8b0dcd3e6712024e` 未被改写；本次仅 read-only 导出 root 已接纳的 main `73d6cfafba9bb33149959e315ab29b5b0bc24d75` 的 34 个 `src/` Git blobs 到 own ignored `node_modules/.issue68-accepted-preflight/`，没有 merge/rebase 或使用 pending #64 代码。

Source fixture仍为 68630 LF bytes / SHA256 `443e7defac512d8f1ce87a50c0d353ff3930c85f321a859fea25dff7a66fbe69`。原 81 blocks、11 个原 r/SUP2/SCAN 位置（9 body/caption + 2 heading）、raw/source/oracle/rights/recipe/A helper 全部复用。独审报告 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-review-materials-identifier-source/issue68-source-review.md`，10420 bytes / SHA256 `e4a199d48c08263d970689563cc1547e96c10621540007be829179c180ddbe2a`；machine 77262 bytes / SHA256 `adeec315c3ac1af8c177842fb8e93daab02a860aa6cd3442bc2814ecf38846e0`。本次没有重新 raw parse、source parse、sanitize/repeat/idem、真实 clip 或重跑旧 controls。原 source-only handoff 中历史 RED/已纠正 harness scopes 保持，不伪装成新基线。

## 最小原 DOM 方案

缺失角色是一个原文本 base、真实 SUP、连续原 suffix 的 attachment；不会给文字推断具体泛函意义。新增 private collector 的 proposal 限定：直接 text sibling 末尾一个 ASCII 小写 base → 原 plain SUP（一个 text child，值 2）→ 直接 text sibling 起始至少两个 ASCII uppercase letters。两端完整 lexical 边界拒绝 Unicode `L/N/M`、underscore，包括 astral 与 combining；不能在 word/identifier 中只截出尾 r 或前 SCAN。原 base、SUP 值、suffix case 与连续关系全部进入同一个 existing scientific range；例如明确 synthetic `q<sup>2</sup>MODEL` 也保持 `q^{2}MODEL`，防止 article/rSCAN 字符串硬编码。此控制不把 MODEL 宣称为真实 scholarly 功能。

文字节点边缘不是词边缘。若 base 在一个 text node 开头且其前还有未知 sibling/comment，拒绝；明确边界已在同一 text node 中则不推断跨节点文字。SUP 与 base/suffix 之间的空白、comment、empty I、wrapper、mixed/nested children 均不能穿越。suffix 之后的 extra attachment 不合并。citation SUP 保留既有 typed citation 角色；既有 styled-base、unit/numeric、MathJax 路径不改。拒绝 code/pre/MathML/equation 祖先和 parent literal dollar/backtick/fence cues，使用当前其他 private collector 同样的保守 opaque 政策，不增加 Markdown parser 或全局 repair。普通词、多字符 base、小写/mixed-case suffix、其他 exponent 不满足这个 narrow shape。

在 `replaceScientificRuns()` 现有 collector 链加入此 private DOM role，继续走原 `replaceRangeWithScientificMarker()` 与 renderer。范围应包括完整 identifier；不得在 SUP 的独立数学片段外留孤立 base。Body/caption/headings 都在当前 parent traversal 中保护，因此原 SUP 在 Defuddle 之前有 source identity。保持两原 heading 的 H3/H4 level、ID、原文本和源 attachment，不单独写 heading formatter、不重建章节。`page.semantic.scientificRuns` 只证明 source role；未来三方言真实输出还必须由原 15 context + 6 heading source assertions 和全部 validators 验证。

## 一次新矩阵实际结果

新增 `test/nature-materials-identifier-boundaries.test.mjs` 为明确 synthetic parse-only 输入，共 48 tests：7 个合法 body 分隔、1 个 q²MODEL 同形控制、37 个 lexical/node/opaque/nonshape rejection、2 个已有 styled/citation-MathJax controls、1 个 mixed body/H3/H4/caption 场景。最后一条先放既有 v/SUB0，再检查四个新 identifier 的 marker indices、unique identity、body/heading/caption subsets、同一角色恰一次及 heading selectors；不假设这些 markers 从零开始，也不把 caption 重新解析成另一套 semantic array。

实际命令：设置 `ACADEMIC_CLIPPER_IDENTIFIER_ADAPTER` 为 own ignored accepted73d6 的 `src/adapters/nature.mjs`，执行 `node --test test/nature-materials-identifier-boundaries.test.mjs`，随后移除 env override。Node `v24.14.1`，actual exit 1；48 = 39 PASS / 9 FAIL，0 skipped/cancelled/todo，1012.9236 ms。8 新 plain shape qualification FAIL + 1 mixed-context missing-role FAIL；37 rejections 和 2 inherited controls PASS。未观察到 harness failures；mixed-case 在 missing-role first assertion 后的 marker/heading/caption assertions 尚未执行，不能提前称其 GREEN 或认为 reviewer 无需检查这些后续条件。

本 scope 恰 48 constructed parses；0 真实 clips、0 raw/source parses、0 sanitizer calls、0 full suites、0 build/golden、0 PR/CI、0 network acquisition。API 是现有 `parseNaturePage(html,url)` / `semantic.scientificRuns` / `figures[].captionHtml`，没有 A/B/C interface 变更。parse-only 没有 hydration/writer 调用；这不能代替未来真实 clip 运行时 request/DNS guard ledger。

External root `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue68-preflight/`：

| artifact | bytes / SHA256 |
| --- | --- |
| `new-boundaries-red-73d6.log` | 15020 / `6b9d29eeb360415391cc1247f55d1fa795387b169b6477793fcd76e1990f8128` |
| `runtime.json`（34 exact Git blobs/hash） | 7566 / `daaa2d23cbd4470978418e067c2ce631e7bcbe5d8bab8c5b85fd455034b63126` |
| `preflight-receipt.json`（same-run cache-only receipt） | SHA256 `991ee17ae0d56189367b51a95c924490c9914278ed01c361b9563bf1da816fbe` |
| 新 matrix 文件 | 6162 / `faa576fa236cab48b6d08cc68fd446b421d7e1fdec91d5523cc58cc5fbb75f69` |

Receipt 中 source-provenance physical disk bytes/hash 为 Windows CRLF 身份，不能混称 Git LF hash；科学 HTML bytes严格 LF，未 normalize 输入。外部 runtime/logs 不进入 tracked repository。

## 后续解除条件与避免复工

不同 owner 先审此最小计划与矩阵，尤其完整词边界、原 attached role、caption marker indices 和 heading identity；原 source 独审结果可复用，不需要再审核 81 blocks 或运行旧 baseline。Root 接纳上游 Main CI 并串行释放 Nature ownership 后，SAME author 才接入届时最新 accepted main/写最小 collector。新 production 需要重跑影响 scope，不能用这个 73d6 RED 代替 final implementation acceptance。

真实 clip 测试调用须在 network guard hooks 的有效生命周期内 lazy cache，每方言一次共享结果；ledger 在抛错之前记录 DNS/HTTP attempt，并在完成后精确检查即使 hydrator catch 的未声明操作，恢复 globals/关闭 DOM。原 fixture 0 table/resource 是静态证据，不能虚构 runtime ledger 为已覆盖。未来 focused suite 包含 unchanged real source tests + 新 matrix，全部4 production validators与原 metadata、citations、Fig2、43 references、rights source assertions保留；#65 已 accepted 时 ref2 应真实恢复，Methods p42 compound-unit 是 #67 的独立 source coverage，不得改输入或声明 whole Materials 已通过。

Implementation 独审 CLEAR 后才一次 full/build/read-only golden 与 fresh CI/Gitleaks，并由 root 核 immutable reviewed PR head 十项 gates。纯文档 commit 只核 diff/hash/protected scope，不再 clip。C 在 accepted 修复后做必要 affected Materials delta 并补两原 heading source roles；85×3 final corpus 验收仍属整合阶段。无 canonical/PRD/EDD 修改提案，无完成或 merge 声明。

## 独立计划审查的有限尾段补充

不同 owner 接纳 shape 方案，同时指出旧 negative 的 exact `r^{2}SCAN` filter 不能发现其他错误 range，且初轮 parse-only 没有动态 network guard。本补充没有重跑初轮48，也不追认旧48为动态 guarded。仅新加10个代表 cases；原 fixture/oracle、生产和 source evidence 不变。

8个新拒绝对整个 `semantic.scientificRuns` 精确断言 `[]`：plain nonshape、astral lexical prefix、combining suffix、跨 span 的 dollar/backtick/tilde opaque cue、MathJax/equation ancestor。另2个新 positive 是完整原 identifier 后的 `data-test="citation-ref"` 与 href-only `#ref-CR` SUP cue，要求各自 identifier/citation roles、numbers与完整正文 marker order 精确相等。原 mixed body/H3/H4/caption test 的宽 `includes` 改为四处完整 text/HTML 精确相等，保留原 unique/nonzero indices/exact multiplicity；原case没重跑，其 missing-role 后这些检查仍未执行。

Before hook 安装 global fetch 和 Node DNS callback/promises guards，所有 attempt 在 throw 前写 ledger；独立 after hook 断言 attempts为空，即使调用被 catch 也会失败。finally 恢复所有原函数、`syncBuiltinESMExports()`，核 exact original identities，并保存 same-run receipt。`parse()` 每次 finally 关闭 DOM。此模块仅测试调用在有效 hooks 内，没有 top-level parser/clip 调用；新的 runtime proof仅覆盖这次所选10cases，不能代替真实 clip/replay guard。

实际新命令 `node --test --test-name-pattern='synthetic plan-tail' test/nature-materials-identifier-boundaries.test.mjs` 使用原34-blob accepted73d6 snapshot。10 = 8 PASS / 2 expected RED，717.5275 ms，actual exit1，0 skip/cancel/todo。2 RED 都是 source shape 尚未被 typed collector 保护；之后的 citation/正文 exact order 尚未执行。没有观察到 harness failure。Actual guard receipt 为 constructedParses10、attempts[]、restored=true、newRealClips0；0 raw/source parse、0 sanitize、0 old48 reruns、0 full/build/golden/PR。没有无限新增 case 枚举或扩大 family。

External same-root `plan-tail-red-73d6.log` 3232 bytes / SHA256 `36b7193b5613aa4f2bfc6248ee562f64180fe5997d0d2a5acedb167218dc1fa8`；`plan-tail-guard-73d6.json` 89 bytes / SHA256 `e8b8cd0706aa2ad7b3b6e6ba88246f9674044877b8e65eded490ca1ec8657db0`；cache-only `plan-tail-receipt.json` SHA256 `76e75aea746935c0a380f439a147007b42921f6baf349328ebce69f4ee15f2f4`。更新后 matrix 9243 LF bytes / SHA256 `d46b24e54ca8d41baf5591f8d2fb61345151f8c2f75893a112ab088d7c34abf2`，新增注册10，final registry58不代表一次新58条运行。Root仍须不同owner的计划尾段接纳和串行 production release。
