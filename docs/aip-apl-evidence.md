# Experimental AIP / APL evidence

本试点关联 [Issue #35](https://github.com/uwougil/Academic-clipper/issues/35)，独立于 #10 / #26 的最终交付。2026-10-02 检查，基线 main `5971ebf`，分支 `codex/aip-apl`。用户明确授权 APL experimental exception；不是全部 AIP journals 的支持承诺。

## 来源和访问事实

| APL URL | DOI | 观察 |
| --- | --- | --- |
| https://pubs.aip.org/aip/apl/article/124/24/243101/3297874/Tailoring-MoS2-domains-size-doping-and-light | 10.1063/5.0214274 | Open Access，主文、4 个唯一 figures、3 inline MathML，科学 sub/sup、47 references、supplementary 描述；无 table |
| https://pubs.aip.org/aip/apl/article/129/10/101106/3404114/Differentiable-computation-based-single-shot | 10.1063/5.0346094 | 主文、5 个唯一 figures、11 display equations、algorithm table、28 references、supplementary DOI |
| https://pubs.aip.org/aip/apl/article/127/19/192101/3371786/Regulation-of-optical-properties-in-quasi-2D | 10.1063/5.0301069 | metadata、abstract 和 references 可见，无主文；不能作为成功全文采集 |

Web 工具观察前述 URLs 返回 `https://aipp.silverchair-cdn.com/article-minimal/<platform-id>`。三份该公开 HTML 响应通过机器已配置的 proxy 获取；safeFetchExternal 仍检查 URL、公共 DNS、精确 URL redirect scope、30 秒 timeout，读取还检查 HTML type 和 25 MiB 上限。机器默认 DNS 返回 proxy synthetic `198.18.*`，没有关闭 SSRF 检查；一次性获取使用通过配置 proxy 的 bounded public DNS-over-HTTPS resolver。没有 cookies、认证 header、私人 session 或 CAPTCHA 解题。浏览器普通 article 请求停留于 Cloudflare challenge；CDN 浏览器访问超时。不能把 public minimal 响应的成功等同于浏览器完整 UI 已验收。

Silverchair 的 `.widget-ArticleFulltext .module-widget`、`.article-section-wrapper`、`.block-child-p`、`.formula-wrap/.inline-formula`、`.fig[data-id]`、`.table-wrap` 和 `.ref-list` 已直接观察。收到的 HTML 已包含 scholarly MathML、figures/captions、tables 和正文；MathJax script 负责视觉渲染，modal/reveal UI 使用 JavaScript data attributes。结论：**观察到的公开正文为 server-rendered，交互/显示部分 dynamic，主文可用性 access-dependent**。该事实不证明其他 AIP journals 相同，也不承诺 article-minimal endpoint 为稳定公共 API。adapter 不主动请求该 endpoint。

## 离线覆盖和 publisher behavior

`test/fixtures/aip/provenance.json` 记录 raw response SHA-256、excerpt SHA-256、选定原 source subtree digest、capture mode、serializer/sanitizer recipe。完整 captures 只在系统临时目录；Git 仅保留 source-backed excerpts。`scripts/aip-fixture-excerpts.mjs <source-dir>` 从已有公开 captures 重新生成，移除执行 scripts、非必要 UI、citation service links、CDN Signature/Key-Pair/Expires query。这些删掉签名的图 URL 仅测试选择和 fallback；**不声称匿名可下载**。hash 使用 committed UTF-8 bytes；测试校验完整性。excerpt 保留全 references，避免 silently renumber。

材料 excerpt：8 ordered authors、4 mapped affiliations、publication/received/accepted dates、MoS2/MoOx、组合化学式 `(NH4)6Mo7O24`、科学单位 powers、3 inline MathML、1 figure 的长 panel caption、citation ranges、supplementary 描述。

成像 excerpt：6 authors、3 affiliations、5 display equations（含积分和分式）、1 figure、无 header 的单列 algorithm HTML table（含 multiline math）、refs 27/28、Algorithm 1 crossref、supplementary DOI。两个 excerpts × markdown/quarto/links 走 production render + 四个 validators，重复执行字节一致。abstract-only excerpt 是负向真实来源用例。

AIP 特定规则：原 modal duplicates 在语义计数前删除；citations 用 `data-modal-source-id` 而非 `javascript:;` URL；MathML 经 Defuddle converter 转 TeX，再由 AIP wrappers 判定 inline/display；sub/sup 从相邻 DOM scientific base 绑定，不修改 shared normalizer；algorithm table 使用 existing table renderer，表内 TeX 换行压为同一 Markdown 行、vertical bars 保持 TeX；observed heading/content order 从限定正文直接交给 Defuddle HTML converter，避免 readability heuristics 丢 supplementary heading。原始正文不编写、不替换为 parser output fixture。

当前 shared edits 仅 `clip.mjs` 的现有渲染阶段复用、APL 分支和 bridge 调用；不改变 Nature DOM、writer/security/CLI/extension permissions。received/accepted 保留在 result metadata.articleHistory，front matter date 是 publication date。affiliation 作者映射按原 superscripts，public correspondence 捕获为文本和现有单 email 字段。

## 未支持或未验收边界 / merge blockers

- 普通 full browser Silverchair DOM（相对于 minimal response）的完整 UI smoke test 尚缺；Draft 保持实验状态，解除 Draft 前需要一次公开 browser Save/Preview 验收。
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

Node v24.14.1，Windows：npm ci（0 vulnerabilities）；focused APL tests 14/14；npm test 124/124；npm run build 成功；npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto 成功；git diff --check 通过。两份 full public responses × 3 dialects 的四个 validators 全部有效（不写入 papers）。跨平台 PR CI 在 Draft 发布后记录；不以本地通过代替 CI。
