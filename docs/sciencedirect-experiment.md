# ScienceDirect 实验：Computational Materials Science

Work Contract：[Issue #30](https://github.com/uwougil/Academic-clipper/issues/30)。背景为 #26；已阅读 #10 corpus spec / execution plan，不修改其 schema、runner 或交付责任。基线 accepted main `5971ebfbe288e0efed4abef21469f41e2cabb05f`，其 [Main CI](https://github.com/uwougil/Academic-clipper/actions/runs/37037241055) 成功。

## 来源与访问实测

2026-10-02，未使用私人凭据、机构登录、cookies 导出或 CAPTCHA 解答。Elsevier 官方 [journal product page](https://shop.elsevier.com/journals/computational-materials-science/0927-0256) 列出 Computational Materials Science、ISSN `0927-0256`、ScienceDirect 订阅与 journal 链接，确认平台归属。不据此推断跨期刊 DOM 相同；没有扩展其他期刊 claim。

| Article URL | indexed public text 线索（不是 captured DOM） | 本次直接访问 |
| --- | --- | --- |
| https://www.sciencedirect.com/science/article/pii/S0927025619301296 | MatCALO，2019，DOI `10.1016/j.commatsci.2019.03.005`；open access | web fetch HTTP 403；普通浏览器 `Are you a robot?` |
| https://www.sciencedirect.com/science/article/pii/S0927025622004803 | Zr hydride activation energy，2022，DOI `10.1016/j.commatsci.2022.111769`；open access / 化学式 | web fetch HTTP 403；普通浏览器同一 challenge |
| https://www.sciencedirect.com/science/article/pii/S0927025620300355 | MAST-ML，2020，DOI `10.1016/j.commatsci.2020.109544`；Article preview、机构访问/Purchase PDF、部分 introduction/references | web fetch HTTP 403；普通浏览器同一 challenge |
| https://www.sciencedirect.com/science/article/pii/S0927025626003812 | LLM agents，2026，DOI `10.1016/j.commatsci.2026.114862`；open access / data availability | web fetch HTTP 403；未额外尝试浏览器 |

前三篇的本机 `safeFetchExternal()` 在 DNS 安全门拒绝：`External resource hostname resolves to a local or private address: www.sciencedirect.com`。这是本环境传输限制，不能说成 publisher HTTP response；未替换 resolver 或削弱安全检查。

没有获得 usable article HTML。server HTML 在本次环境不足以可靠 clipping；不据此断言所有用户都无法公开访问全文。indexed scholarly text 不是原始 DOM，不转写成 article fixture。open-access 标记不等于访问成功。

真实 fixture 只保留浏览器实见的 `<h1 class="u-h2">Are you a robot?</h1>`；固定 scaffold、fixture hash、转换与 omissions 见 `test/fixtures/sciencedirect/provenance.json`。不记录 challenge token、IP、账号或整页 capture。浏览器观察没有 HTTP body bytes，所以 source body hash 明确为 null。

## 实现和覆盖

`parseScienceDirectPage(html, url)` 仅同步解析 supplied HTML，不执行脚本或请求资源。接受 exact HTTPS `www.sciencedirect.com/science/article/(abs/)?pii/S<16 digits>`，区分 blocked、missing-identity、identity-mismatch、unsupported-journal、preview、abstract-only、missing-body、body-present。结果始终 `fullTextVerified: false` 并带 experimental warning；缺少内容不伪造。

```js
import { parseScienceDirectPage } from './src/adapters/sciencedirect.mjs';
const result = parseScienceDirectPage(html, articleUrl);
// metadata / availability / bodyHtml / semantic / debug.warnings
```

| 要素 | focused tests 实际覆盖 | 证据限制 |
| --- | --- | --- |
| metadata/authors/affiliations | citation/DC、JSON-LD graph、DOM fallback；作者顺序、机构地址 | synthetic；不猜测作者机构关联、贡献或通讯作者 |
| sections | heading level/text/ID、nested section | synthetic `.Body` / `.Abstracts` selectors，未经 CMS DOM 核验 |
| equations/scientific markup | 原 TeX annotation / MathML alttext；多行 row breaks；Defuddle + academic normalizers 的上下标与斜体 | synthetic；image-only / unsupported MathML warning，不从图片或 glyph 推断 TeX |
| figures/captions | URL/alt/完整 caption、正文原位置、缺图 warning | synthetic；无 modal、高分辨率资源请求 |
| tables | HTML rows/cells、原 HTML、span 记录为 html-complex、缺 cells fallback | synthetic；复杂跨度不承诺 Markdown fidelity |
| citations/reference lists | 原 ID/label/text/DOI、有序 link descriptors、range label 原样保留 | synthetic；不造 missing definitions，无三种 citation dialect 或 BibTeX 整合 |
| internal references | target 存在性、外文章 fragments、缺 target warning | synthetic；绝对 source links，不生成本地悬空 anchors |
| supplementary/data links | supplied DOM 中链接和标签，不安全 URL 移除 | synthetic；不下载或触发 API |
| access response | 真实 challenge heading、integrity、拒绝 scholarly extraction | 唯一 source-backed DOM coverage；不是 article coverage |

`contract.synthetic.html` 的全部科学文字、metadata、formula、caption 和 table 都是显式编写的测试输入，不算真实 CMS admission。10 个 focused tests 包含确定性和 Defuddle conversion seam，math/raw HTML/crossref validators；不宣称端到端 writer 或所有方言验证。

## 限制、shared proposals 与 merge blockers

- Client rendering / API-backed state：challenge 阻止检查，无法判断 SSR vs client hydration。不读隐藏 app state，不猜 API endpoint。需要合法公开 article DOM 与 server response 对照。
- Paywall/preview：仅索引可见购买/机构访问 UI，实际 gating selectors 未验证；synthetic preview tests 不能证明所有访问响应都能识别。
- Figure/table modal 与实际 equation representation：均未访问；不声称 lazy/modal 内容完整或普遍有 TeX。需要公开 source-backed excerpts 与独立 semantic oracles。
- 正式启用 blocker：各学术要素都需真实 CMS DOM fixtures、来源 provenance 与独立断言；当前 Draft 实验不是 production-ready。
- Shared adapter API/result model、router、CLI article-fetch allowlist/redirect scope、ID collision、warning taxonomy、三方言 citations/crossrefs、resource bounds、corpus schema、live verifier 仅作 #26 integrator 提案，本次不修改。
- 正式接入前须明确 accepted contract 与人类意图、沿用 URL/DNS/redirect/size/content-type 安全边界、通过 Nature golden 与三平台 CI。不用 synthetic checks 替代实证 gate。

验证命令：`npm ci`；`node --test test/sciencedirect-adapter.test.mjs`；`npm test`；`npm run build`；`npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`。实际结果保留在 Draft PR；普通 checks 不请求 live article，不运行 `clip:live`。
