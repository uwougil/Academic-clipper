# Experimental AIP / APL evidence

本试点关联 [Issue #35](https://github.com/uwougil/Academic-clipper/issues/35)，独立于 #10 / #26 的最终交付。初次检查为 2026-10-02；2026-10-03 已无冲突 rebase 到 main `955b9ad9a9cc7efbc8dc28f7c8143ccb488d6416`（包含 Wiley PR #41），分支 `codex/aip-apl`。Wiley adapter、fixtures、tests 未改，`renderClipMarkdown` / `referencesBib` 导出保留并由完整 combined tests 验证。用户明确授权 APL experimental exception；不是全部 AIP journals 的支持承诺。

## 来源和访问事实

| APL URL | DOI | 观察 |
| --- | --- | --- |
| https://pubs.aip.org/aip/apl/article/124/24/243101/3297874/Tailoring-MoS2-domains-size-doping-and-light | 10.1063/5.0214274 | Open Access，主文、4 个唯一 figures、3 inline MathML，科学 sub/sup、47 references、supplementary 描述；无 table |
| https://pubs.aip.org/aip/apl/article/129/10/101106/3404114/Differentiable-computation-based-single-shot | 10.1063/5.0346094 | 主文、5 个唯一 figures、11 display equations、algorithm table、28 references、supplementary DOI |
| https://pubs.aip.org/aip/apl/article/127/19/192101/3371786/Regulation-of-optical-properties-in-quasi-2D | 10.1063/5.0301069 | metadata、abstract 和 references 可见，无主文；不能作为成功全文采集 |

Web 工具观察前述 URLs 返回 `https://aipp.silverchair-cdn.com/article-minimal/<platform-id>`。三份该公开 HTML 响应通过机器已配置的 proxy 获取；safeFetchExternal 仍检查 URL、公共 DNS、精确 URL redirect scope、30 秒 timeout，读取还检查 HTML type 和 25 MiB 上限。机器默认 DNS 返回 proxy synthetic `198.18.*`，没有关闭 SSRF 检查；一次性获取使用通过配置 proxy 的 bounded public DNS-over-HTTPS resolver。没有 cookies、认证 header、私人 session 或 CAPTCHA 解题。2026-10-02 初次检查的浏览器普通 article 请求停留于 Cloudflare challenge；CDN 浏览器访问超时。2026-10-03 独立公开浏览器随后自行加载成功，扩展 smoke 结果见下文。不能把 public minimal 响应的成功等同于浏览器完整 UI 已验收。

Silverchair 的 `.widget-ArticleFulltext .module-widget`、`.article-section-wrapper`、`.block-child-p`、`.formula-wrap/.inline-formula`、`.fig[data-id]`、`.table-wrap` 和 `.ref-list` 已直接观察。收到的 HTML 已包含 scholarly MathML、figures/captions、tables 和正文；MathJax script 负责视觉渲染，modal/reveal UI 使用 JavaScript data attributes。结论：**观察到的公开正文为 server-rendered，交互/显示部分 dynamic，主文可用性 access-dependent**。该事实不证明其他 AIP journals 相同，也不承诺 article-minimal endpoint 为稳定公共 API。adapter 不主动请求该 endpoint。

## 离线覆盖和 publisher behavior

`test/fixtures/aip/provenance.json` 记录 raw response SHA-256、excerpt SHA-256、选定原 source subtree digest、capture mode、serializer/sanitizer recipe。完整 captures 只在系统临时目录；Git 仅保留 source-backed excerpts。`scripts/aip-fixture-excerpts.mjs <source-dir>` 从已有公开 captures 重新生成，移除执行 scripts、非必要 UI、citation service links、CDN Signature/Key-Pair/Expires query。这些删掉签名的图 URL 仅测试选择和 fallback；**不声称匿名可下载**。hash 使用 committed UTF-8 bytes；测试校验完整性。excerpt 保留全 references，避免 silently renumber。

材料 excerpt：8 ordered authors、4 mapped affiliations、publication/received/accepted dates、MoS2/MoOx、组合化学式 `(NH4)6Mo7O24`、科学单位 powers、3 inline MathML、1 figure 的长 panel caption、citation ranges、supplementary 描述。

成像 excerpt：6 authors、3 affiliations、5 display equations（含积分和分式）、1 figure、无 header 的单列 algorithm HTML table（含 multiline math）、refs 27/28、Algorithm 1 crossref、supplementary DOI。两个 excerpts × markdown/quarto/links 走 production render + 四个 validators，重复执行字节一致。abstract-only excerpt 是负向真实来源用例。

AIP 特定规则：原 modal duplicates 在语义计数前删除；citations 用 `data-modal-source-id` 而非 `javascript:;` URL；MathML 经 Defuddle converter 转 TeX，再由 AIP wrappers 判定 inline/display；sub/sup 从相邻 DOM scientific base 绑定，不修改 shared normalizer；algorithm table 使用 existing table renderer，表内 TeX 换行压为同一 Markdown 行、vertical bars 保持 TeX；observed heading/content order 从限定正文直接交给 Defuddle HTML converter，避免 readability heuristics 丢 supplementary heading。原始正文不编写、不替换为 parser output fixture。

当前 shared edits 仅 `clip.mjs` 的现有渲染阶段复用、APL 分支和 bridge 调用；不改变 Nature DOM、writer/security/CLI/extension permissions。received/accepted 保留在 result metadata.articleHistory，front matter date 是 publication date。affiliation 作者映射按原 superscripts，public correspondence 捕获为文本和现有单 email 字段。

## 2026-10-03 公开浏览器扩展 smoke

Playwright CLI 启动独立有界面 Microsoft Edge profile，加载本 worktree 构建的 `dist/extension`，不读取个人 profile、私人 cookies 或机构认证。公开 article 的初次导航出现 HTTP 403 / Cloudflare；等待后浏览器自行进入完整文章，未点击或破解 challenge。标题可见但 fulltext selector 尚不存在的中间状态也被观察到，随后正文出现。因此 minimal HTML 的 server-rendered 内容与普通页面的延迟加载应分别描述，不能保证导航完成即正文就绪。

从浏览器 extension action 打开真实 toolbar popup（CDP `Extensions.triggerAction`），操作原 Preview Markdown / Save Paper 按钮；没有 mock `chrome.scripting`、替换 DOM、改 manifest permissions 或直接 POST 代替 extension 流程。仅调用 `chrome.action.openPopup()` 的初次自动化尝试没有授予 activeTab，被浏览器拒绝读取页面；正常 extension action 后成功。bridge 为 `127.0.0.1:34129`，随机临时 token、精确 extension Origin allow-list、markdown 模式、saveDebug=true、downloadFigures=false。

| 公开 URL（上表的完整 URL） | Preview | Save | 保存输出 / 主要计数 |
| --- | --- | --- | --- |
| 3297874 | `Preview: aip-apl-3297874` | `Saved: aip-apl-3297874/index.md` | 8 authors、4 affiliations、4 figures/captions、0 tables、0 display equations、47 references；3 source inline MathML，规范化后 validator 计 239 inline math（包括科学 sub/sup） |
| 3404114 | `Preview: aip-apl-3404114` | `Saved: aip-apl-3404114/index.md` | 6 authors、3 affiliations、5 figures/captions、1 algorithm table、11 display equations、50 normalized inline math、28 references；supplementary DOI 保留 |

两份 `index.md` 和 `debug.json` 实际位于 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-apl-smoke-20261003/papers/<articleId>/`，不覆盖 golden 或已有 library。两个输出的 math、Markdown structure、raw HTML、crossref validators 都 valid=true；成像 normal DOM 再次转换与 saved Markdown 字节一致。

成像普通 browser DOM 为 1,775,569 UTF-8 bytes；之前公开 minimal response 为 211,281 bytes。页面 shell、广告、scripts、MathJax 渲染使 DOM 显著增大；分别通过当前 adapter 后 authors/affiliations、5 figures、1 table、50 inline MathML、11 display MathML、28 references 计数一致，equation anchors 都为 `equation-1`…`equation-11`。这是所检查结构的语义一致证据，不是所有 normal/minimal DOM 的等价承诺。下载图片关闭，保留 remote image links/captions；没有验证匿名图片文件下载或 signed URL 有效期。浏览器 raw DOM、profile、token 和 debug 原件仅留本机临时目录，不提交。

本次公开 extension → bridge Preview/Save 流程已有成功证据，因访问不稳定而撤回路由的条件未触发。如果今后正常公开页面持续不能进入全文，应保留拒绝行为，并在合并前将 APL 改回隔离实验入口；不能以 minimal response 或 fixture bridge tests 代替浏览器验收。

## 未支持或未验收边界 / merge blockers

- 两篇普通 public-browser 的 Preview/Save 已成功；Cloudflare 和延迟正文仍是运行时访问边界。Draft 保持实验状态，解除 Draft 前仍需 reviewer 评估范围和以下未覆盖行为。
- 图片签名 URL 的有效期和匿名下载没有验证；运行时仍使用既有 bounded image fetch/fallback。不提交签名，不伪造成功图片。
- 非 algorithm 的数据 table、其他 table layouts、视频、image-only equations、TeX annotations、旧 article-abstract URLs、独立 supplementary downloads 没有真实覆盖。无 HTML table 保留 link/warning。
- APL 大多数 Letter 主文无 section headings；保留所见 supplementary/author declarations 等层级，不创造 Introduction/Methods。未知 internal target 降级可读文字；section-specific target mapping 尚未建立独立真实 oracle。
- 观察 MathML→TeX 由现有 Defuddle 数学 converter 提供；无法可靠转换时拒绝。font/MathML accent 的语义正确性仍需专家 review，green lexical validator 不是公式等价证明。
- 默认 UI 仍有 Nature 文案；APL CLI 网络采集不在本 Draft 范围。其他 AIP family 不支持。

## 对未来 Publisher Adapter Contract 的问题

这些是 APL 证据，不是已验证 Nature/APS/ACS 都没有的需求；本 baseline 没有 APS/ACS adapter，不能做无来源排他断言。

1. 主文 access gate 必须独立于 metadata/abstract/references，不能由 reference 数量判断全文。
2. citation 的 source IDs 可以藏在 modal data attributes；figure/table 同一 scholarly payload 可因 modal 重复。
3. MathML-only 平台需要以 publisher wrapper 判定 inline/display，不能让 converter 默认 display 推断改变语义。
4. algorithm 可表现为无表头、单列、多行 math 的 table；需要 fidelity oracle，不能以普通数据表 oracle 替代。
5. signed CDN resource 的 fixture sanitization 与 live resource validity 是不同契约；metadata publication/received/accepted 的公共输出位置也待 shared contract 决定。
6. 已选正文可直接使用 Defuddle HTML converter；readability extraction 是否强制以及保留 heading 的责任归属待多平台证据决定。

## 验证结果

Node v24.14.1，Windows，rebase 后实际 Nature + Wiley + APL composition：npm ci（0 vulnerabilities）；focused APL tests 16/16；npm test 153/153；npm run build 成功；npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto 成功；git diff --check 通过。新增 links/quarto 合成回归：unnumbered display 位于源 Equation (7) 之前，目标仍为 `equation-7` / `eq-equation-7`；真实 excerpt 的 (1)…(5) 保持不变，full browser 的 (1)…(11) 也保持不变。source labels 优先；缺失 label 使用独立 display fallback counter，并跳过已保留 source labels，避免 anchor 冲突。新版跨平台 CI 和 secret scan 的 exact head/run 记录于 PR #40；旧 pre-Wiley green CI 不作为当前 admission evidence。
