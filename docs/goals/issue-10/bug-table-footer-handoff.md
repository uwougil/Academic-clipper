# Nature 表格脚注 bug — 独立交接

Work Contract：[Issue #45](https://github.com/uwougil/Academic-clipper/issues/45)，交付 [PR #46](https://github.com/uwougil/Academic-clipper/pull/46)。这是 Issue #10 必需表格角色的前置 parser 修复，不承担 Issue #10 的普通部分交付；本 PR 只使用独立行 `Refs #45`。独立 review 在 `5a02ceccd29680493ac58d88f0fc9599ecf2f9a3` 发现 indexed / Greek / wrapped superscripts 被误改；后续 `23ffa22e6a6ea498bd9133fe71ba7088a0272339` 修正这四例，但仍有一个 P2：任意短字母 / numeric-index products 被误认成 unit annotation。此版去除该推断，仍需新 head 的 fresh CI / Secret scan 和同一独立 reviewer 重审。此 agent 不合并 PR，不宣称 bug 已被主线接纳或 Issue #10 完成。

## 基线、分支与 commits

- Accepted base：`e85b1b809b56242b89b6313ce5d1165c745466bb`。启动及最终准备时 `origin/main` / 远端 main 均为此 SHA；包含 PR #27 planning contract（`5971ebf`）。[Main CI 37182993143](https://github.com/uwougil/Academic-clipper/actions/runs/37182993143) 与 [Secret scan 37182993093](https://github.com/uwougil/Academic-clipper/actions/runs/37182993093) completed/success。
- Branch：`codex/issue-10-bug-table-footer`。
- Worktree：`C:/Users/guoli/.codex/worktrees/issue-10-table-notes/academic-clipper`。没有改变 B / A / C / D checkout、index 或 branch。
- `bf879f1b45b56b623152f88c6f4b21c2f8dd0f30`：先提交真实小型 excerpts、provenance、scoped `.gitattributes` 和永久失败回归。生产代码仍为 accepted main。
- `ae15401284dcf4995e471c58a73dfa7d6859cd05`：最小 capture / normalize / render 修复及 marker 边界补充 tests。
- `107375674ee0443dd9a2c2bac3f898529b56e7d9`：durable evidence / source attribution。
- `5a02ceccd29680493ac58d88f0fc9599ecf2f9a3`：原 rights / copyright notices；此 head 被独立 P2 review 阻止接纳。
- `be2855e07563da0e84b8af41f358ba76d72162da`：在上述生产代码上先提交 scientific-marker 失败回归。
- `23ffa22e6a6ea498bd9133fe71ba7088a0272339`：第一次科学上标边界修正；后续独立 review 阻止此 head 的任意 parenthesized-product unit 推断。
- `70aaf1cfd4f4fce1e7ae77d0d5ca31427bc179b9`：第二次先提交三项独立 reviewer 反例和相近 styled / numeric-index / non-mass solar 边界的永久红回归。
- 本交接和来源署名补充 commit 的 SHA：`git log -1 --format=%H -- docs/goals/issue-10/bug-table-footer-handoff.md`。完整顺序：`git log --reverse --format="%H %s" e85b1b809b56242b89b6313ce5d1165c745466bb..HEAD`。

独立分支没有 cherry-pick A/B bulk infrastructure 或 corpus；只包含本 bug 的 6 个小型 source-backed HTML excerpts、3 份 provenance、scoped LF/whitespace 属性、一个回归 test、本交接和两个必要生产文件。未改变 canonical、PRD/EDD、golden、dependencies、writer、CI matrix、security 或 publisher routing。

## 真实来源与原始字节

输入来自 B durable source contract `143fc77ebdc4bf15dd1cdca63afcddb91e6b55f5`，外部完整 captures 只在 `$env:TEMP/academic-clipper-issue10-agent-b`。本 agent 没有新采集、credentials、CookieJar、浏览器 profile 或账号访问。原始响应解压后、decoding / DOM / sanitizer 前的 bytes 与 B hashes 独立核对；完整 raw 未提交。

| 真实资源 | 观察 UTC | Raw bytes / SHA-256 | 原注释 / physical layout |
| --- | --- | --- | --- |
| [golden Table 1](https://www.nature.com/articles/s41586-026-10401-1/tables/1) | 2026-10-03T16:47:49.080Z | 172830 / `36a52d93aca60fb50cb7452b2990f955f399d1b8a59e5278dff0764a9042d568` | 1；4 rows，cells `[5,5,4,5]`，OSSG rowspan 2；原 `<i>λ</i><sup>0</sup>` 关联 |
| [COVID Extended Data Table 1](https://www.nature.com/articles/s41586-020-2012-7/tables/1) | 2026-10-03T16:50:31.782Z | 179489 / `3b6d64a5934ac4b45df370930ec4d9a9e51b41dc71ad3aaf2d87eb5c3125e29e` | 2；图片表格，无 HTML cells，第二条原 `*` marker |
| [FRB Table 1](https://www.nature.com/articles/s41586-022-04755-5/tables/1) | 2026-10-03T16:50:36.037Z | 185820 / `97eaaa31a6f3443e63ad7cf2cef66776d72d61c6b0f0d2956d87cd43b39485a2` | 6；24 rows / 2 columns，三个 colspan 2 group rows，`a`–`f` 原 marker，7 个对应 cell markers |

公开 note locator 均为 `#content .c-article-table-footer li`；每条 provenance 记录完整原 `sourceText` / `sourceHtml`、原序、marker、逐条 source selector 与 pre-sanitize subtree SHA。这是 serializer 定义的源子树位置，不是 HTTP byte offset。原始 article identity、raw byte hash 和 observedAt 也在各 provenance 中。

原 raw article 的署名和许可证链接按来源保存：COVID / FRB 链接为 `http://creativecommons.org/licenses/by/4.0/`，golden 为 `http://creativecommons.org/licenses/by-nc-nd/4.0/`；记录 ordered `citation_author`、原 `#rightslink-content p` notice、copyright notices / metadata、license selector / source subtree hash、源 URL、title、DOI 和选择/序列化说明。来源 excerpts 未按 repository code license 重新许可，用途是科研工具的离线回归。公开可访问不替代许可证审核；这里仅记录观察事实，不作新的法律或使用政策决定。科学内容、脚注、表格均原样保留。

## Excerpt、转换与边界

只读采用 A owner 的 `nature-corpus-sanitizer/1.1.0`、`nature-corpus-subtree/1.0.0` 与 recipe `1.0.0` 生成选定 article figure；未把 A helper 搬入 bug 分支。Recipe 保留源 `citation_title` / `citation_doi` / canonical 和 `.c-article-body figure:has(#Tab1)` 完整块及原 ancestors。3 个 table excerpts 与 B 原文件完全同 bytes，并从 untouched raw / 相同 A recipe 重新生成确认。

转换只是确定性 UTF-8 / LF / 无 BOM 序列化、attribute ordering、原 ancestors/scaffold、移除 executable / unrelated UI / tracking；没有写 scholarly prose、DOM、equations、cell values 或修改 note。Article 其余正文、作者信息、references、其它图表和 metadata 均明确 omitted。未提交 full Markdown snapshot、image、PDF 或 XLSX。

| Fixture prefix | Article bytes / SHA-256 | Table bytes / SHA-256 |
| --- | --- | --- |
| `s41586-026-10401-1` | 3345 / `8a9cdf624343872bba5873ccda96697737b597724f627bcac39d894fd0e085eb` | 2968 / `0f140482b5ed5873629f22df427fffe01aa5374c6253e465a4678f1ea1749677` |
| `s41586-020-2012-7` | 3715 / `561079f84fa79b9a00c82e2c3a96f07fe924a0eac05a1ef1aeb3efd6b9d85620` | 2500 / `6d67417849218c151fc8a1b27c1cbe56634d3774005b911cdc7c763462e42794` |
| `s41586-022-04755-5` | 3816 / `e3aaf1a76de8ca132f6cbc08ec5f25e72afc884ec7b7a8e8a5167e5f9b0bf018` | 5434 / `d5c167a5e0e2bbe016a1728985a5f96788492a9397060cee4292bcb37ec81fd0` |

6 fixture aggregate：21778 bytes。路径是 `test/fixtures/nature-table-notes/<prefix>.article.excerpt.html` / `.table.excerpt.html`，provenance 为同 prefix `.provenance.json`。源空白造成大量 diff 行，保留真实语义空白；没有为缩短 diff pretty-print 或 collapse。仅本 fixture 目录配置 `*.html text eol=lf whitespace=-blank-at-eol`；其余 whitespace checks 保持。

## 故障、原因与修复接口

Implementation bug：`hydrateNatureTables()` 原来只保存 `tableElement.outerHTML`，footer 是 table 外节点；无 cells 分支在 capture footer 前返回。正确来源是 1 / 2 / 6 条原 note，而三个 dialect 都为 0 条。使用生产 adapter → guarded injected hydration → Defuddle / table normalization → renderer 复现，所有 recorded DNS / GET/manual requests 已声明，unexpected ledger 为 0。

最小 additive 中间模型：`table.notes = [{ html, marker, markdown? }]`。Nature adapter 从所属 table container capture 完整 note；inline figure path 同样支持；在无 cells 时仍 capture note。现有 `hydrateNatureTables(tables, articleUrl, {fetchImpl, resolveHostname})` / `normalizeTableContents(tables,url)` / `renderTables(tables,policy)` 签名和 exports 不变。

Normalizer 用既有 Defuddle、math / academic-inline 处理 note；首个 source superscript marker 渲染为可读 `**a**` 等，科学 `λ⁰` 保持完整关联。Cells 对匹配 footer 的非数字 marker 还要求明确上下文：marker 位于 paragraph / cell 末尾，前面是纯 prose label、单个带 `±` 的数值误差项，或 prose / MathJax label 后的已知 parenthesized physical-unit annotation。该最后路径只支持源已证明的 `pc cm−3`、`M⊙`、`M⊙ yr−1` 形式（minus 同时接受 ASCII `-`）；不以字母长度 / token 数量或数字下标推断单位。Subscript 只接受 solar `⊙`；styled DOM 只接受 `M` 后紧邻该 solar subscript，其余 italic / bold variables 不构成 unit 证据。没有这些证据则保留原 `<sup>`，交由现有 scientific normalization / validators 处理。未把 marker equality 当作独立关联证据，不改源 HTML，也不修补既有 unit normalization。Renderer 在对应 table 后按源序写出每条 note 一次，默认 / Quarto zero HTML、links 维持既有 strict anchor。原 cells / spans / URL / identifier / statuses 保持。

此次修正保护 indexed、Unicode / Greek、透明 wrapper、parenthesized expression、化学式、ionic charge 和单位后的上标；真实 FRB 七处 source-associated note marker 仍独立核对到原 row / cell。未锚定的 publisher superscript 本身有歧义，此推断刻意保守；新源布局若不满足这些上下文，不擅自猜作脚注，也不承诺所有未来 Nature marker 形式都已覆盖。

唯一 source fallback warning 保持精确值：`Extended Data Table 1: The full-size Nature page did not expose HTML table cells; retained the absolute URL.`。结构化资源 warnings 仍为空。失败 HTTP / escaped scope 仍不能安装 response 的 footer，所有生产 transport / DNS / URL / redirect / type / timeout 默认保持。

## 实际验证与 red → green

- `npm ci`：exit 0，65 packages，0 vulnerabilities，Node 24.14.1；lockfile 未变。
- 修复前 `node --test test/nature-table-notes.test.mjs`：exit 1，6 tests / 1 pass / 5 fail。三个真实 case 首次断言为 `0 !== 1` / `0 !== 2` / `0 !== 6`；错误原因就是源 note 丢失。测试先提交在 `bf879f1`，不是由当前 output 反推 expected。
- P2 修正前先在旧生产代码上增加 boundary tests：初次提交 `be2855e` 为 17 tests / 11 pass / 6 fail，补 wrapped Greek 后为 18 / 11 / 7。最终 19 个测试再对 `git show 5a02ceccd29680493ac58d88f0fc9599ecf2f9a3:src/normalizers/figures.mjs` 的外部临时副本运行：exit 1，19 / 11 / 8；只改 import URLs 以定位依赖，旧生产函数未改。精确命令：`node --test C:/Users/guoli/AppData/Local/Temp/issue-10-table-footer-agent/review-boundary-red-all.test.mjs`。失败均为科学指数被错误改成 footer marker；ionic charge / chemical formula 对照保持通过。
- 第二个 P2 的永久 red commit `70aaf1c`，生产代码仍为被 review 的 `23ffa22`：`node --test test/nature-table-notes.test.mjs` exit 1，27 tests / 20 pass / 7 fail。三项 exact reviewer products 与 emphasized product、literal numeric-index product、styled variables using unit names、non-mass solar variable 均保留真实失败；indexed mass product 对照原来已经通过。没有将这些 synthetic 内容当新 source article 或 admission。
- 修正后 `node --test test/nature-table-notes.test.mjs`：exit 0，最终 27 / 27，0 skipped / failures；真实 source cases 每种 `markdown` / `quarto` / `links` 精确验证完整 note 的语义、原序 / 出现一次、七个 source cell markers、golden `λ⁰`、source shapes / spans、URL / identifier / exact warning。
- `node --test test/nature-table-notes.test.mjs test/nature-adapter.test.mjs test/output-quality.test.mjs test/infrastructure-hardening.test.mjs test/network-boundaries.test.mjs`：新修正代码上 exit 0，81 / 81，0 skipped / failures。
- `npm test`：新修正代码上 exit 0，283 / 283，0 failures / cancelled / skipped / todo。旧 heads 的 265 / 275 次 green 不作为此修正的证明；A infrastructure / B corpus 不在此独立分支，测试总数不能与带 A 的 B 288 次旧结果混用。
- `npm run build`：exit 0。
- `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`：exit 0，valid，13 display equations、50 reference definitions，全部 math / scientificFragments / structure / raw HTML / crossref validators valid。
- `node C:/Users/guoli/AppData/Local/Temp/issue-10-table-footer-agent/review-boundary-check.mjs`：exit 0，四个独立 reviewer 反例加三个 scientific controls 的 cell Markdown 与其 accepted-base probe 逐字一致。独立旧 packet 为 `$env:TEMP/academic-clipper-issue10-review/pr46-5a02cecc-review.md`；本命令不写 reviewer artifacts。
- `node C:/Users/guoli/AppData/Local/Temp/issue-10-table-footer-agent/review-boundary-check-23.mjs`：exit 0，第二个 packet 的全部 19 项 scientific contexts，与各自 matching synthetic footer 通过实际 normalizer 后，cell Markdown 逐字等于 accepted-base production。参考 evidence `$env:TEMP/academic-clipper-issue10-review/boundary-probe-23ffa22.json`；完整独立 review `$env:TEMP/academic-clipper-issue10-review/pr46-23ffa22-review.md` 保持只读。不是为了通过 validator 删除指数，也没有覆盖 reviewer 的 artifact。
- `node C:/Users/guoli/AppData/Local/Temp/issue-10-table-footer-agent/source-audit.mjs`：exit 0，3 sources / 6 excerpts / 21778 bytes，1 / 2 / 6 原 notes，7 原 cell markers。只复制 reviewer 的只读审计程序并改 owner/output 路径，重新核对原 raw bytes / source positions / every note HTML/text/hash / cells/spans / 作者和 rights / license / copyright notices / A repeat / idempotence；没有更改 inputs。6 committed Git blob hashes / sizes / LF 另行 PASS。普通回归不读取外部 raw、不访问真实 DNS / HTTP、不调用 writer、不修改 global fetch / DNS；replay 另行断言 ledger，不能吞异常当通过。
- `git diff --check` / `git diff --cached --check`：exit 0；tracked filenames / protected-file diff 审计通过。Golden / canonical / PRD/EDD / security / CI / dependencies / writer / routing diff 为空。最终提交后要求 `git status --short` 为空。

Supplemental topology / marker tests 明确标 synthetic：追加另一个 unchanged source table container 不混注释、source container 的 inline relocation 无 fetch、A → B → A byte determinism、未知 / scientific / citation marker、numeric marker 与真实 unit/power 区分。新增十八项 scientific boundary examples 包括两轮独立 reviewer 的全部反例，并保留 styled / MathJax / source physical-unit controls。这些不是额外真实 article / source layout 的 admission。

准备 helper 初次使用 Windows absolute import 而非 `file:///` URL 导致 `ERR_UNSUPPORTED_ESM_URL_SCHEME`，修正后实际运行成功；未把这次环境错误当 parser defect。最初的 shell `rg` 路径 glob 在 PowerShell 被当 literal，改用 `-g` 进行路径审计。工具设置失败没有计入 source 或测试通过。

## 残留缺陷、C 解阻与接纳条件

FRB 表格原有 19 个 `scientific-isolatedSuperscript`：本合同修复 7 个 source-associated cell note markers，其余 12 个 unit / numeric powers仍由独立科学行内 bug 负责。Test 实际执行所有 validators；footer math valid，整张 FRB math 仍记录 failure diagnostic（每 dialect 12），没有 fixture 替换、validator relaxation、warning wildcard、hidden skip 或整个 corpus 通过声明。Golden / COVID 整个 rendered table validators 通过。

C 可消费的 corpus expectation：这三篇的 `source-tables-v1` / `nature-source-tables-v1`，核心 source block 是各资源 `t1-content`。新的中间模型供 C 独立比较原 `sourceNotes` 与 `table.notes[].markdown` / rendered table；不是修改 B oracle。FRB unit role仍 blocked，不能把恢复脚注算作整篇 passing acceptance。

D seam 与本修复不重叠：本分支不包含 D 的 `clip.mjs` 透传。独立 table 子链路回归不能代替 D seam 下的 all-dialect whole clip corpus acceptance。Root 接纳 bug 后需验证 merged-main CI，再将 accepted main / Issue #45 / test file / 影响 expectation 告知 C，并在原 C child 重跑。无需 canonical spec 变更。

自动合并只由 root 在真实 reviewed head 上核对 human goal §8 的十项条件：source regression、focused / full tests、build、golden、fresh CI、Secret scan、独立零 blocking findings、无 unrelated architecture/security diff、review 后 head 不变。PR fresh run IDs / head / conclusions 以真实 GitHub PR checks 及 root review packet 为准；本交接不虚报尚未执行的 PR CI / review。合并只接纳代码，merged-main CI 成功后由 automation 完成独立 bug Work Contract。
