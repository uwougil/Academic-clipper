# Publisher coverage census — Issue #26 研究证据

研究日期：2026-10-02（America/Chicago）。状态：规划证据；不是 adapter contract，也不是新增 publisher support。基线：`5971ebfbe288e0efed4abef21469f41e2cabb05f`。本文件为 [Issue #26](https://github.com/uwougil/Academic-clipper/issues/26) 提供 census，不完成其实现试点与 contract 验收。

## 1. 权威、范围与证据规则

已阅读 [AGENTS.md](../../AGENTS.md)、[README](../../README.md)、[PRD](../PRD.md)、[EDD](../EDD.md)、Issue #26、[Issue #10 canonical spec](../specs/issue-10-nature-corpus.md) 和 [execution plan](issue-10-execution-plan.md)。Nature-only 产品/工程边界不变；Issue #10 仍只处理 Nature。本文只提出后续独立 Work Contracts 的研究输入，实施前仍需人工解决并更新多出版社 intent。

起始清单有 **29 个明确命名期刊 + 1 个未枚举的“relevant Nature-branded journals”范围项**。未获得另一个手写来源，不推断其未列出的期刊。Nature Physics、Nature Materials 等只作为待用户收敛的范围例子，不计入 29。另列的 Chemical Science、Advanced Materials 仅用于平台对照，不静默增加产品范围。

确认了 **11 个当前站点/平台规划组，加 1 个 Nano Research 历史 Springer Link 组，共 12 个研究组**。这不是“12 个已验证同构 DOM”或“必须实现 12 个 adapter”的结论。平台归属可高置信，DOM 合并仍可低置信。特别是 ACS/AIP 的 Silverchair、Wiley/AAAS 的 Literatum 不能按供应商名字自动合并。

证据标记：

| 标记 | 含义 | 可以证明 / 不能证明 |
| --- | --- | --- |
| OBSERVED-W | web 工具打开官方 article URL，获得可读页面投影 | 可见 metadata、正文、链接、表格文本；不证明原始 classes、MathML/TeX annotation、srcset 或实际 HTTP body |
| OBSERVED-I | 官方站点的搜索索引/摘要投影已检查 | 可见字段或结构线索；缓存可能早于迁移，不证明当前完整 HTML |
| OBSERVED-R | 仓库 source/golden/spec 检查 | 当前 Nature 已实现的边界或规范；不是本次新 live DOM 证据 |
| ACCESS-BLOCKED | 直接打开失败、challenge、robots 或 transport 拒绝 | 证明本研究路径未取得可用全文；不能推出所有匿名用户都不可访问 |
| CANDIDATE / NEEDS CONFIRMATION | URL/内容有来源，目标结构尚待源 DOM 确认 | 不能计入 admitted corpus、已通过覆盖或新支持 |

未使用登录、机构代理、私有 cookie、认证 session 或 challenge/paywall bypass。临时匿名 in-app browser 在 APS、ACS、RSC、Wiley 四个代表页均显示 Cloudflare 安全验证；未操作挑战。web 投影与 browser 结果不同，分别记录。一次通过现有 `safeFetchExternal()` 的内存研究探测在 DNS 检查阶段被拒绝（解析到受限地址），未弱化检查，也未获得源 HTML。未保存原始网页、图片、PDF/XLSX 或 fixture；因此本文没有 source/fixture hash，也不声称 source-backed admission。

所有表中 journal 行同时继承 §3 对应 family profile 的 equations、figures/tables/references、access、未知项及 Issue #10 reuse 字段；不是空缺字段的隐含确认。`高/中/低` 分别评价“publisher/host”和“跨期刊 DOM”；无已看文章的行明确注明。链接是证据入口，重新 admission 必须重验。

## 2. Journal → 平台 / DOM / adapter 候选矩阵

| # | 核实的期刊名称 / publisher | 官方 host / URL pattern / 平台组 | 置信（归属；DOM） | proposed adapter / 优先级 | 代表 article 或核实入口；主要未知项 |
| --- | --- | --- | --- | --- | --- |
| 1 | Physical Review B / American Physical Society | `journals.aps.org/prb/{abstract,accepted}/10.1103/<suffix>`；APS | 高；中 | aps-physical-review / wave 1 | [PRB k5vw-c9ks](https://journals.aps.org/prb/abstract/10.1103/k5vw-c9ks) OBSERVED-I；Hubbard 科学 inline、多个联系人；全文未知 |
| 2 | Physical Review Letters / APS | `journals.aps.org/prl/abstract/10.1103/<suffix>`；APS | 高；中 | 同上 / wave 1 | [PRL 133.206702](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.133.206702) OBSERVED-I；共同第一作者；subscription 正文未知 |
| 3 | Physical Review X / APS | `journals.aps.org/prx/abstract/10.1103/<suffix>`；APS | 高；中 | 同上 / wave 1 | [12.031042](https://journals.aps.org/prx/abstract/10.1103/PhysRevX.12.031042)、[12.040501](https://journals.aps.org/prx/abstract/10.1103/PhysRevX.12.040501)、[52wh-1z5y](https://journals.aps.org/prx/abstract/10.1103/52wh-1z5y) OBSERVED-W/I；OA、gallery、summary、references；正文加载未知 |
| 4 | Physical Review Research / APS | `journals.aps.org/prresearch/abstract/10.1103/<suffix>`；APS | 高；低–中 | 同上 / wave 1 | [官方期刊页](https://journals.aps.org/prresearch/)、[2.023051](https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.2.023051)（article open 失败）；article DOM 待确认 |
| 5 | Reviews of Modern Physics / APS | `journals.aps.org/rmp/abstract/10.1103/<suffix>`；APS | 高；中 | 同上 / wave 1 | [93.025006](https://journals.aps.org/rmp/abstract/10.1103/RevModPhys.93.025006) OBSERVED-I；review、多 affiliations、gallery；超长正文/表格未知 |
| 6 | Physical Review Applied / APS | `journals.aps.org/prapplied/abstract/10.1103/<suffix>`；APS | 高；中 | 同上 / wave 1 | [41by-5p3c](https://journals.aps.org/prapplied/abstract/10.1103/41by-5p3c) OBSERVED-I；OA license 与 dates；正文待确认 |
| 7 | The Journal of Physical Chemistry C / American Chemical Society | `pubs.acs.org/doi[/full 或 /abs]/10.1021/<suffix>`；现 Silverchair，另有 journal article paths | 高；中 | acs-current / wave 1 | [130/23 TOC](https://pubs.acs.org/toc/jpccck/130/23)、[6c02330](https://pubs.acs.org/doi/10.1021/acs.jpcc.6c02330)（直接 403）；TOC 核实 OA NMR 候选，非本文正文观察 |
| 8 | The Journal of Physical Chemistry Letters / ACS | `pubs.acs.org/doi/10.1021/acs.jpclett.<suffix>`；ACS-current | 高；中 | 同上 / wave 1 | [5c03292](https://pubs.acs.org/doi/10.1021/acs.jpclett.5c03292) OBSERVED-I；purchase preview、完整作者/affiliation、PDF SI/peer review；全文未知 |
| 9 | Nano Letters / ACS | `pubs.acs.org/doi/10.1021/acs.nanolett.<suffix>`；另见 `/nalefd/article/<volume>/<issue>/<page>/<id>/<slug>` | 高；中 | 同上 / wave 1 | [6c01391](https://pubs.acs.org/doi/10.1021/acs.nanolett.6c01391)、[5c02091](https://pubs.acs.org/doi/10.1021/acs.nanolett.5c02091)、[6c00927](https://pubs.acs.org/doi/10.1021/acs.nanolett.6c00927) OBSERVED-I；OA vs purchase、visual abstract、citation ranges；迁移后 DOM 未核实 |
| 10 | ACS Nano / ACS | `pubs.acs.org/doi/10.1021/acsnano.<suffix>`；ACS-current | 高；中 | 同上 / wave 1 | [5c15791](https://pubs.acs.org/doi/10.1021/acsnano.5c15791)、[5c03144](https://pubs.acs.org/doi/10.1021/acsnano.5c03144) OBSERVED-I；OA、author notes、Methods 等；直接 403 |
| 11 | Journal of the American Chemical Society / ACS | `pubs.acs.org/doi/10.1021/jacs.<suffix>`；ACS-current | 高；中 | 同上 / wave 1 | [4c18150](https://pubs.acs.org/doi/full/10.1021/jacs.4c18150) OBSERVED-I/直接 403；分子化学/transport 候选，当前 HTML 未核实 |
| 12 | Materials Horizons / Royal Society of Chemistry | `pubs.rsc.org/en/content/{articlehtml,articlelanding}/<year>/mh/<code>`；RSC | 高；中 | rsc-publishing / early later wave | [D5MH00120J](https://pubs.rsc.org/en/content/articlehtml/2025/mh/d5mh00120j) OBSERVED-I/403；review、Wider impact、作者简介；源 wrappers 未核实 |
| 13 | Physical Chemistry Chemical Physics / RSC | 同 pattern，journal code `cp`；RSC | 高；中 | 同上 / early later wave | [D6CP00658B](https://pubs.rsc.org/en/content/articlehtml/2026/cp/d6cp00658b) OBSERVED-I/403；OA、联合 affiliations、NMR；math/table 未核实 |
| 14 | Journal of Materials Chemistry C / RSC | 同 pattern，code `tc`；RSC | 高；低–中 | 同上 / early later wave | [D5TC04440E landing](https://pubs.rsc.org/en/content/articlelanding/2026/tc/d5tc04440e/unauth) OBSERVED-I；accepted/advance 版本变化、SI PDF；HTML 403，不继承其他 journal 全文事实 |
| 15 | Nature / Springer Nature | `www.nature.com/articles/<id>`；Nature Portfolio | 高；高（现有实现）；本次 live 未验 | nature（既有）/ Stage 0 | [golden](https://www.nature.com/articles/s41586-026-10401-1) OBSERVED-R；本次 web 被 idp redirect 阻断；精确结构见 §3 |
| 16 | Nature Communications / Springer Nature | 同 pattern；Nature Portfolio | 高；中 | nature（需 corpus 验证）/ Stage 0 | [s41467-023-44030-3](https://www.nature.com/articles/s41467-023-44030-3) Issue #10 候选，本次 idp redirect；不称已覆盖此篇 |
| 17 | npj Computational Materials / Springer Nature | 同 pattern；Nature Portfolio | 高；中 | nature 候选扩充 / Stage 0 | [s41524-026-02083-0](https://www.nature.com/articles/s41524-026-02083-0) OBSERVED-W；OA、author/DOI；cookie-error query 与 article-in-press 历史线索需清理和版本核验 |
| 18 | npj 2D Materials and Applications / Springer Nature | 同 pattern；Nature Portfolio | 高；中 | nature 候选扩充 / Stage 0 | [s41699-025-00648-z](https://www.nature.com/articles/s41699-025-00648-z) OBSERVED-I；科学 inline、publication date 与 volume year 不同；源 DOM 待确认 |
| 19 | Science / AAAS | `www.science.org/doi[/full]/10.1126/<suffix>`；Science/Literatum | 高；低 | science-aaas / later | [官方 journal](https://www.science.org/journal/science) 直接 open 失败；本次没有验证研究 article，方程/表格未知 |
| 20 | Science Advances / AAAS | 同 pattern，`10.1126/sciadv.<suffix>`；Science/Literatum | 高；低 | 同上 / later | [aaz8809](https://www.science.org/doi/10.1126/sciadv.aaz8809) 直接 open 失败；OA 标识不保证 transport 可用 |
| 21 | Advanced Functional Materials / Wiley-VCH（Wiley） | `advanced.onlinelibrary.wiley.com/doi[/full 或 /abs]/10.1002/adfm.<suffix>`；Advanced Hub / Wiley Online Library | 高；中 | wiley-advanced / wave 1 | [202516924](https://advanced.onlinelibrary.wiley.com/doi/10.1002/adfm.202516924)、[202531001](https://advanced.onlinelibrary.wiley.com/doi/10.1002/adfm.202531001) OBSERVED-W；OA、figure panels、table、math、Methods、PDF SI |
| 22 | Advanced Science / Wiley-VCH | 同 host/pattern，`advs`；Wiley-Advanced | 高；中 | 同上 / wave 1 | [202503235](https://advanced.onlinelibrary.wiley.com/doi/10.1002/advs.202503235) OBSERVED-W；nested numbered headings、matrix equation、DOCX SI |
| 23 | Small / Wiley-VCH | [Advanced Hub journal](https://advanced.onlinelibrary.wiley.com/journal/16136829)；DOI prefix `10.1002/smll`，Wiley-Advanced 候选 | 高；低–中 | 同上候选 / wave 1 | [202411133](https://advanced.onlinelibrary.wiley.com/doi/10.1002/smll.202411133) 其他 Wiley 文章 references 核实 citation；直接 article 不可用；不是已观察本文 DOM |
| 24 | Advanced Electronic Materials / Wiley-VCH | 同 host/pattern，`aelm`；Wiley-Advanced | 高；中 | 同上 / wave 1 | [201900334](https://advanced.onlinelibrary.wiley.com/doi/10.1002/aelm.201900334) OBSERVED-W（abstract）；[OA 转换 editorial](https://advanced.onlinelibrary.wiley.com/doi/10.1002/aelm.202300791) OBSERVED-I；旧年份仍有 access 差异 |
| 25 | Applied Physics Letters / AIP Publishing | `pubs.aip.org/aip/apl/article[-abstract]/<volume>/<issue>/<locator>/<id>/<slug>`；Silverchair | 高；低–中 | aip-current / later | [126/8/080502](https://pubs.aip.org/aip/apl/article-abstract/126/8/080502/3337249/Valley-polarization-in-two-dimensional-zero-net) OBSERVED-I；structured references/DOI links、preview；勿用旧 Scitation 架构 |
| 26 | Proceedings of the National Academy of Sciences / National Academy of Sciences | `www.pnas.org/doi[/full]/10.1073/pnas.<suffix>`；PNAS 独立站点组，vendor 未核实 | 高；低–中 | pnas / later | [2108924118](https://www.pnas.org/doi/10.1073/pnas.2108924118) OBSERVED-W；Significance、edited/approval metadata、math alt 缺失、figures/citation ranges |
| 27 | Computational Materials Science / Elsevier | `www.sciencedirect.com/science/article[/abs]/pii/<PII>`；ScienceDirect | 高；低 | elsevier-sciencedirect / later | [S0927025626003563](https://www.sciencedirect.com/science/article/abs/pii/S0927025626003563)、[S092702562600460X](https://www.sciencedirect.com/science/article/pii/S092702562600460X) OBSERVED-I；highlights/overlay authors/DOI；不是已验全文 |
| 28 | 2D Materials / IOP Publishing | `iopscience.iop.org/article/10.1088/<suffix>[/meta]`；IOPscience | 高；低 | iopscience / later | [官方 scope/access policy](https://publishingsupport.iopscience.iop.org/journals/2d-materials/about-2d-materials/)；主站 robots 阻断；没有本次验证 article URL，不猜 DOI |
| 29 | Nano Research / Tsinghua University Press（当前） | `www.sciopen.com/article/10.26599/NR.<suffix>`；SciOpen；旧 DOI 亦须核验 resolution | 高；低–中 | sciopen / later；旧刊另见 springer-link | [94907025](https://www.sciopen.com/article/10.26599/NR.2025.94907025) OBSERVED-W；metadata、abstract、PDF、未展开模板；正文能力未知 |
| 范围项 | relevant Nature-branded journals / 待明确枚举 | Nature Portfolio 候选，不能按品牌覆盖所有 article types | 未枚举；低 | 待用户 scope 收敛 | [Nature journal directory](https://www.nature.com/nature-portfolio/about/our-journals)；review/editorial/news 与 research DOM 可能不同，不加 journal 计数 |

### 反向映射与平台核实

| 平台/DOM 研究组 → journals | proposed adapter family | 合并依据 / 分离依据 |
| --- | --- | --- |
| APS → PRB、PRL、PRX、PRR、RMP、Physical Review Applied（6） | aps-physical-review | 官方 [APS journals](https://journals.aps.org/about) 与多个 article 的共同 identity/author/DOI/gallery shell；全文 DOM 合并待验证。`10.1103` suffix 既有传统 journal-volume-locator 又有新短码，不能只匹配旧式 DOI |
| ACS-current → JPCC、JPCL、Nano Letters、ACS Nano、JACS（5） | acs-current | [官方迁移说明](https://pubs.acs.org/pages/platform-migration)：2026-07-24 全 collection 迁往 Silverchair。当前 indexed 页面有 journal code paths 与 article navigation；旧 `/doi/full` URL 不能证明旧 Literatum DOM 仍在 |
| RSC → Materials Horizons、PCCP、JMC C（3） | rsc-publishing | [官方 journals](https://www.rsc.org/publishing/journals) 与共同 articlehtml/articlelanding 路径和 author/DOI shell；review、research、accepted manuscript 分开验 |
| Nature Portfolio → Nature、Nature Communications、npj Computational Materials、npj 2D Materials and Applications（4 + 未枚举项） | nature（既有候选增广） | 当前 Nature adapter 知识；不能把 Springer Nature 企业其他 host 并入此 DOM |
| Wiley-Advanced → AFM、Advanced Science、Small、AEM（4） | wiley-advanced | [Wiley 官方 Literatum 迁移](https://newsroom.wiley.com/press-releases/press-release-details/2018/Wiley-Online-Library-Migrates-to-Atypons-Literatum-Platform/default.aspx)；当前 Advanced Hub 同 host/shell。全 Wiley、Hindawi 历史页面不在本组确认范围 |
| Science/AAAS → Science、Science Advances（2） | science-aaas | [AAAS 官方平台声明](https://www.eurekalert.org/news-releases/927888) 的 Literatum 迁移；research DOM 同构未核实，保留独立于 Wiley 的候选组 |
| AIP-current → Applied Physics Letters（1） | aip-current | [AIP 官方 2023 launch](https://publishing.aip.org/about/news/aip-publishing-launches-new-digital-content-platform/)：Silverchair / pubs.aip.org；与 ACS 同 vendor，未证明 wrappers/math/access 同构 |
| PNAS → PNAS（1） | pnas | 独立 Significance、editor/approval、figure/math 投影；vendor 未确认，不从 URL 的 `/doi` 推断 Literatum |
| ScienceDirect → Computational Materials Science（1） | elsevier-sciencedirect | 官方 article 明示 Elsevier；PII/DOI 双 identity、author overlay、highlights 与 Nature 不同 |
| IOPscience → 2D Materials（1） | iopscience | 官方 publisher scope 可核实；full article DOM 待合法公开验证 |
| SciOpen → 当前 Nano Research（1） | sciopen | [当前 journal 声明](https://www.sciopen.com/journal/1998-0124?issn=1998-0124) 与 [publisher submission guidelines](https://www.sciopen.com/journal/join_journal/submission_guidelines?id=1400285564990251009&issn=1998-0124)：2025-01-01 转 OA；旧 hybrid 全文指向 Springer |
| Springer Link → Nano Research 2025 前历史卷（同一本 journal，不额外计数） | springer-link-legacy 候选 | [官方历史 volumes](https://link.springer.com/journal/12274/volumes-and-issues)；不能将 current Nano Research 放入 Nature adapter，亦不能因旧 DOI `10.1007` 就认定所有历史页同构 |

同平台跨 publisher 的已核实例子为 ACS + AIP / Silverchair、Wiley + AAAS / Literatum。这里只确认 platform service；不输出供应商级万能 adapter。一个品牌跨平台的实例如 Springer Nature 的 Nature Portfolio / Springer Link；同一 journal 跨时期平台的实例为 Nano Research。

## 3. Family structural evidence profiles

下表逐项记录 A–I。未见原 HTML 的 selectors、JSON-LD/meta、image srcset/lazy、MathML/TeX 归属、rowspan/colspan 均 **NEEDS CONFIRMATION**，即使 web 投影显示了 TeX 或表格。web 工具可能执行转换，不能反推出源 equation representation。所有 family 预计可试用 Issue #10 的 provenance、sanitizer/replay 方法、独立 semantic assertions、三 dialect validators 和 failure taxonomy；现有 Nature selector、文章/表格 URL scope 与 resource recipe 不可直接复用。

### APS

观察样本：PRX 12.031042（研究）、12.040501（perspective）、52wh-1z5y（2026 研究）；另有 PRB、PRL、RMP、Applied 的 indexed metadata 对照。

- A：title、作者顺序、编号 affiliations、联系/共同作者注、DOI、journal、received/revised/accepted/published 在投影中可见。多作者组 RMP 与短 PRL 不同。meta/JSON-LD 未见。
- B：Abstract、Popular Summary（PRX）、Article Text、References、outline 区存在；12.040501 outline 有 INTRODUCTION / ALTERMAGNETIC PHASE 等。Article Text 在投影中为空或缺 substantive 正文，不能认定已取全文或断言“必定 client-rendered”。root/heading IDs 未见。
- C：metadata/abstract/reference 中有 TeX-like inline 科学符号；display equations、MathML、annotation、编号均未确认。理论题材不是 equation-heavy DOM 证据。
- D：12.031042 gallery 显示 Figures 1–4；12.040501 显示 1–7 + 更多 figures 控件。gallery 与正文 figure 是否重复、完整 captions、panels、alt/srcset/lazy 未确认。
- E：未观察 article table cells；需要含实表候选，不能用 PDF 表或 gallery 替代。
- F：12.031042 References (93)、52wh-1z5y References (78) 可见；references 含 DOI 与 supplemental 链接。正文 citation range DOM 未确认。
- G：gallery 的 View figure in article 与 outline links 可见；equation/table/section target IDs 未确认。
- H：Supplemental Material 区与 `link.aps.org/supplemental/...` 链接可见；未下载文件，不承诺格式全集。
- I：OA PRX 与 preview PRB/PRL 不可混为一谈；browser challenge。APS accepted route 是独立 article lifecycle/identity probe，不是研究全文替代品。

### ACS-current

观察样本：Nano Letters 6c01391（OA research/Methods）、6c00927（purchase preview/SI）、ACS Nano 5c03144（OA Methods/sections）、5c15791（复杂 metadata）；JPCL 5c03292 与 JACS 对照来自 OBSERVED-I。直接 article opens 403/browser challenge，未拿到迁移后 raw DOM。

- A：author 展开区、机构/地址、ORCID、corresponding、共同贡献/现址符号、COI/funding、DOI、online 与 issue 两种日期均可见。需避免折叠与重复 UI 造成重复 authors。metadata serialization 未确认。
- B：Article Contents、Abstract、Introduction/Results/Discussion/Methods 等随 article type/access 改变；purchase sample 仅 abstract/SI。Visual Abstract 是独立结构，不能算 numbered main figure。root/IDs 待确认。
- C：6c01391 inline symmetry 与化学 subscripts 可见；正文 (1−4) 是 citation range 线索。TeX-like 投影不等于确认源 MathML/MathJax/TeX。display 与图像方程均待验。
- D：visual abstract、Open figure viewer、graphic alt 提示可见；正文 captions/panels/high-resolution/source variants 未验。
- E：JPCL SI 描述提到 Table S1，不是 HTML cells。JPCC NMR 仅 OA TOC 候选，表格/编号数学待验。
- F：正文 citation range (1−4,6,7) 在 indexed Nano Letters 可见，References 在 OA article navigation 可见；ordered bibliography 原 DOM、DOI links、range endpoint 合成方法待验。
- G：article navigation / figure viewer 可见；scientific paragraph figure/equation/table target IDs 未验。
- H：Supporting Information PDF、figshare UI、JPCL transparent peer-review PDF 可见；免费 SI 与“正文可购买”并存，不能误判正文完整。不要采 figshare 嵌入浏览器整个 UI 作为正文。
- I：ACS 本次最大未知是迁移后源 DOM 与公开获取；旧 cached `/doi/full` 结果不能冻结 current fixture。后续 admission 第一条必须确认 Silverchair canonical/DOI/body，而非继续沿用迁移前 selector。

### Wiley-Advanced

三个可读 OBSERVED-W research pages：[Advanced Science 202503235](https://advanced.onlinelibrary.wiley.com/doi/10.1002/advs.202503235)、[AFM 202516924](https://advanced.onlinelibrary.wiley.com/doi/10.1002/adfm.202516924)、[AFM 202531001](https://advanced.onlinelibrary.wiley.com/doi/10.1002/adfm.202531001)。AEM 201900334 为 abstract 对照。

- A：authors、对应 affiliations/ORCID、多个 Corresponding Author blocks、first-published/DOI、issue locator 与 publication history 可见；重复作者 UI 需去重。meta/JSON-LD 未验。
- B：Advanced Hub shell；1 Introduction、2 Results、2.1–2.3 nested sections；AFM sensing 有 4 Experimental Section/Methods、4.1 子节。不能硬要求 Nature 风格 Methods。heading IDs/root 待验。
- C：Advanced Science 投影明确显示 numbered equations (2) matrix、(3) Kerr；AFM sensing 有 Equation (9) 指向编号公式。inline TeX、sub/sup 与有些缺失符号并存；投影中的 `$$` 不可原样当 source delimiter oracle。源 MathML/annotation/image fallback 待验。
- D：figure viewer/PowerPoint，AFM/Advanced Science 的长 a–e/a–f panels captions 可见；真实 image src/srcset/lazy 与 caption ancestors 待验，viewer UI 不能重复输出。
- E：AFM sensing 的 Table 1 在投影提供 column headers 和两行数值，正文 table link；这是可读 cells 证据，原 HTML spans/layout/download variants 仍待验。
- F：superscript bracket citation ranges（1–9 等）与 numbered references/DOI links 可见；原 cluster endpoint/range wrappers 待验。
- G：figure panels、Section 3、Equation 9、Table 1、SI S1 等 links 可见；actual IDs 与跨 supplementary/document 的 target 归属待验。
- H：Advanced Science `advs70103-sup-0001-SuppMat.docx`（11.4 MB）、AFM MnTe `adfm71519-sup-0001-SuppMat.pdf`（20.7 MB）链接可见；不下载。Supplementary 格式不能只枚举 PDF/XLSX。
- I：web readable OA research，但 browser challenge；AEM 旧年 abstract 不证明新 OA research 不可用。Small 原文仍未确认，故 4 journals 是潜在覆盖上限，而非已证明一个 adapter 全覆盖。

### RSC

检查 MH D5MH00120J review、PCCP D6CP00658B research、JMC C D5TC04440E advance/accepted landing；另有 [Chemical Science D4SC04125A](https://pubs.rsc.org/en/content/articlehtml/2024/sc/d4sc04125a) 作为范围外公开研究线索。前两者 full-text index 与 JMC landing 为 OBSERVED-I，direct HTML 403 / browser challenge。

- A：DOI、journal、article type、received/accepted/first-published；letter-coded affiliations、corresponding email、equal-contribution dagger。JSON-LD/citation meta 未验。
- B：articlelanding 与 articlehtml 分工显著。MH review 有 Abstract、Wider impact、作者 biography；research/advance/accepted 结构必须分别确认。root/heading IDs 不猜。
- C：化学 subscripts、spin/units 在投影可见；源 equation images vs MathML/TeX、display numbering 未验。不能按历史经验声称 RSC 全部 image math。
- D：graphical abstract/cover 与 article figures 要区分；caption/panel/srcset/lazy 均未源验。
- E/F/G：研究目标包括 tables、dense review references、crossrefs；原 cells/spans、citation range、anchor topology 尚未确认，不计为观察覆盖。
- H：PCCP/JMC landing 的 SI PDF 链接可见；未下载，未发现 XLSX 不等于不存在。
- I：landing 的“You have access”及 loading error UI 不能当 usable full-body；JMC 版本标签在索引间变化。不得以 OA cover/contents list 替代 real research sample。

### 其余组的证据与未知项（A–I）

| Family / samples | A/B：identity、sections | C：equations | D/E/F/G：figures、tables、references、crossrefs | H/I：supplement/access；必须补验 |
| --- | --- | --- | --- | --- |
| Nature / golden；npj 02083-0、00648-z | OBSERVED-R：`citation_*`/JSON-LD、`.c-article-body`、author information；npj W/I 确认 host 与 metadata，不能继承 exact DOM | R：`.mathjax-tex` 与 `.c-article-equation`，freeze inline/display；npj 未源验 | R：figcaption 外 `data-test="bottom-caption"`、Extended Data；同 article `/tables/<n>` hydration、image-only table fallback；`ol.c-article-references` 与 semantic targets | R：正文 SI links，不自动下载 PDF；live Nature 两篇 idp redirect，npj cookie query。不同 article types 需 admission |
| Science/AAAS / aaz8809 + journal pages（失败） | 官方平台/host 可核实；没有本次 usable article body | 全部未知 | 全部未知；不得复用 Wiley selectors 因为同 vendor | ACCESS-BLOCKED；public full-text 与 consent/challenge/preview 分开确认 |
| AIP / APL 126/8/080502 | I：authors、DOI、journal、article history、abstract | inline 科学 notation 可见，源类型未知 | I：numbered structured references、Crossref/Google Scholar links；figures/table/body targets 未验 | preview 路径；supplement resources/types 未验。与 ACS 比较 current Silverchair DOM 后再决定是否复用 |
| PNAS / 2108924118 | W：Significance、Abstract、editor/approved/received、authors info | TeX-like symbols与“No alternative text available” math 输出并存；不能保证可恢复数学 | W：Fig.1A/1B、numbered references、1–6 ranges、figure links；table/spans 未确认 | W：Free access；补充链接/资源边界待验。单 sample 不证明全期刊 |
| ScienceDirect / 两篇 CMS（§2） | I：DOI/PII、journal、author overlay、highlights、abstract | 科学 subscripts 可见；source math 全未知 | figure/table/reference 全文及 internal targets 待验 | subscription preview vs research route不等于 full body；significant separate loads 未验 |
| IOPscience / journal support page | publisher/scope/access 核实；article root/metadata 未验 | 未知 | 未知 | robots 非可重试；合法公开 browser DOM 待研究，不从其他平台或 arXiv 替换 IOP fixture |
| SciOpen / 94907025 | W：title、DOI、authors/affiliations/equal notes、abstract、dates；页面含 `{{...}}` 未展开模板 | abstract sub/sup/units 可见；正文 representation 未知 | graphical abstract 与 outline controls；正文 tables/figures/references 未见 | W：OA、26.2 MB PDF link；shell 不等于 full HTML，client/data hydration 待确认；AI summary UI 排除 |
| Springer Link / Nano Research volumes | journal archive 与 legacy mapping 可核实；没有本次已验历史 article | 未知 | 未知 | legacy hybrid；不能把 archive list 当 article DOM；应另研究 2–3 篇不同历史文章后决定 family 合并 |

## 4. 第一波建议：APS + ACS-current + Wiley-Advanced

这是工程 sequencing 判断，不是期刊产品排名。潜在覆盖为 **6 + 5 + 4 = 15/29**；跨刊统一 DOM 尚待 fixture admission 验证，不承诺一个 adapter 自动 unlock 全部。

| 维度 | APS | ACS-current | Wiley-Advanced | RSC 对照 |
| --- | --- | --- | --- | --- |
| 用户实际 condensed-matter/materials 覆盖 | PRB/PRL/PRX/PRR/RMP/Applied；理论、实验、review | 5 个材料/化学高频 titles | 4 个材料高频 titles | 3 个起始 titles |
| 与 Nature 的已见结构差异 | gallery/popular summary、abstract/Article Text split、新 DOI short codes | recent Silverchair migration、visual abstract、author modal/notes、SI/preview并存 | numbered nested sections、matrix math投影、table cells、DOCX SI、figure viewer | articlelanding/articlehtml 分离、Wider impact/biographies、advance/accepted lifecycle |
| real HTML evidence | 3 PRX shell pages，本文主体仍待获取 | 多 article indexed projections，当前 DOM acquisition gate 尚未通过 | 3 OA research readable projections，含可读正文、编号公式、table | MH/PCCP indexed full-text clues，JMC 仅 landing；raw HTML blocked |
| Contract probe 的价值 | article completeness、DOI identity、dense refs/gallery、long review | 迁移/资源 provenance、partial access、metadata duplication、vendor 共性边界 | equation/table/scientific inline/跨 supplement targets最有可观察证据 | image/math fallback 或特殊 DOM 必须确认，不能仅以预期差异决定 |

**第三家选择 Wiley**：此轮拿到了跨 AFM / Advanced Science 的三篇不同研究页面投影，实际见到矩阵/编号公式、内联符号、实表内容、长面板图注及 PDF/DOCX SI；RSC target journals 的 comparable 原文证据更弱。Wiley 也潜在多覆盖一个起始期刊。RSC 的 path/lifecycle/Wider impact 差异确实值得下一波优先研究，但方程图像/表格结构尚无证据，不把猜测当架构探针优势。

保留条件：这不是立即开始无证据编码。APS、ACS-current、Wiley 都须首先公开获得当前源 DOM、确认正文完整与相互结构差异。若 ACS 在合理合法 acquisition 路径仍没有 5–10 admissible sources，应暂停其 implementation gate，同时推进其他已获得 source 的 family；RSC 若补验更可靠或发现 distinct image-only equation path，可重新比较第三 probe。不能因 challenge 将 access failure 记作 parser success，也不能转用 PMC/arXiv DOM冒充 publisher 源。

第一波 [corpus candidates](publisher-corpus-candidates.md)：APS 7、ACS 7、Wiley 6，合计 20；RSC 附 4 个备用线索。这些是研究名单，不是 admitted corpus；没有 fixture acquisition/commit。

## 5. 可能共享 / 必须保留 specific 的证据表

| 边界 | 证据与可尝试 reuse | 第一波需要回答的问题 |
| --- | --- | --- |
| corpus manifest concepts / provenance（likely shared） | 所有组都有 article identity、获取时间、source vs excerpt 需要；Issue #10 定义原始 bytes hash/recipe/retained blocks/fixture hash | family 与 platform generation 要否成为 versioned provenance 字段？迁移前后同 DOI 如何区分？ |
| deterministic fixture / replay rules（likely shared） | Issue #10 的 UTF-8/LF/idempotence、script/session 移除、声明 resources/DNS/request ledger可试用 | 怎么保留 folded author、gallery caption、MathML/TeX annotation 等 stress topology，同时排除 executable UI？ |
| semantic assertion framework（likely shared） | 各投影重复出现 metadata/math/figures/citations；三 dialect生产 validators 仍是输出要求 | oracle 如何独立于每个 adapter selector？跨页/嵌入 SI 的 semantic ownership 如何定义？ |
| failure taxonomy（likely shared） | 本次真实出现 challenge、robots、partial article、metadata-only、idp redirect与 shell template | ACCESS_BLOCKED 与 NETWORK_FAILURE/UPSTREAM_MARKUP_CHANGE 怎么用证据区分？无正文不能一律 regression |
| live orchestration（likely shared hypothesis） | bounded fetch、identity/full-body gate、offline-first、retained projection comparison、no writer来自 #10规范 | 哪些 redirect/resource allow-lists应 per-family？browser current DOM 与 static HTML观察签名如何分开？ |
| academic normalization（有条件 shared） | 科学 i/b/sub/sup、citation ranges、caption math是多个 family共同语义 | 输入原始语义足够一致后，哪些 normalization可共用？不能把 Nature `.mathjax-tex`识别搬入 generic layer |
| DOM cleanup（specific） | APS summaries/gallery、ACS visual abstract/figshare、Wiley share UI、RSC biographies、SciOpen AI summary不同 | 哪些非正文区需要保留给 metadata、哪些必须删除？ |
| metadata extraction（specific） | author folding/repetition、letter vs numeric affiliations、approval/online-vs-issue dates、DOI short codes | “作者去重”如何不删除合法同名作者或现址？article identity和version最小证据是什么？ |
| figure/table wrappers（specific） | Nature sibling caption/remote tables与 Wiley viewer/local table projection已见不同 | captions/panels/notes完整性、重复 gallery与body、table span降级、absolute fallback由谁决定？ |
| citation DOM / equation extraction（specific） | APS references列表、ACS parentheses、Wiley superscript brackets；math投影并不能统一来源 | source TeX优先级、MathML conversion、image-only honest fallback、equation labels如何表达？range endpoints与scientific superscripts怎么区分？ |
| article/access identity rules（specific） | ACS migration、APS accepted vs final、新/旧 Nano Research hosts、PNAS Significance、SciOpen shell | selector missing与preview/challenge如何在清理前判断？canonical与structured DOI mismatch是否拒绝？ |

开放 contract 问题还包括：minimum adapter 输入是原始 HTML还是已加载 browser DOM；resource discovery和transport hydration如何隔离；跨 origin assets能否安全绑定 article identity；引用数字保持原号还是独立 key映射；article type与platform generation如何声明；部分 metadata/正文缺失时诊断结构；数值/公式缺 alt如何显式 fallback；同 DOI 不同 route的output determinism；writer目录 ID如何跨 publisher避免冲突。这里只列问题，不选新 API、不建 base class、不添加 routing。

支持共性的当前证据：重复的学术语义、原始 source/projection 区别与 access gate、现有 validators。尚无证据支持：统一企业 publisher class、供应商级 selectors、全网通用 URL regex、所有 family共享一种 table endpoint或 equation encoding、直接将 Nature 中间对象冻结为最终 API。

## 6. Rollout 与启动 gates

| Stage | 工作 / handoff | 退出证据 |
| --- | --- | --- |
| 0 — Nature A/B foundation | Issue #10 A schema/sanitizer/replay H1；B公开 source研究与source-backed excerpts；C/D继续 assertions/live | 实际 H1版本、helper checks、provenance/recipe、admission contracts；检查 landed SHA/CI。本文不声称 #10 已实现或完成 |
| 1 — heterogeneous pilots | 人工解决intent边界后为 APS、ACS-current、Wiley-Advanced 建各自独立 Work Contract；先 admission，再 implementation；使用 A方法，保留family差异 | 每个 family真实5–10篇非冗余 admitted sources、独立offline三 dialect oracle、零undeclared网络、明确access/fallback；各Issue一个final delivery PR |
| 2 — contract extraction | 比较 Nature + pilot真实输入/输出、resource recipes、warnings、failed assumptions；只提取已重复验证部分 | 明确最小 Adapter/Benchmark Contract、shared/specific边界；人工批准必要intent修改；Issue #26依据完整criteria独立验收 |
| 3 — broad fan-out | Contract稳定后多个family独立并行；不是本次并行授权，也不共享同一个Issue最终责任 | 统一handoff模板、source-backed corpus、offline assertions、optional live；各自required checks与merged Main CI |

Stage 3 研究地图：RSC优先补齐 articlehtml/landing/version与math/table证据；AIP利用 current Silverchair作为ACS的跨品牌对照；AAAS与Wiley比较 actual Literatum customization；PNAS独立profile与vendor再核验；IOP合法公开正文研究；Elsevier/ScienceDirect区分PII、preview与全文；SciOpen当前Nano Research与Springer Link历史Nano Research分别立source lanes。若Wiley未在first wave，仍为高优先later候选。没有充分证据时不承诺这几家的严格实施顺序。

每个未来 pilot handoff至少包含：resolved scope/intent、base SHA与Issue、平台/时期、canonical URL/DOI/journal、observed access/full-body、source/fixture hashes与recipe、retained blocks、coverage/assertion IDs、资源/redirect declaration、三个dialects结果、warnings/fallback/omissions、独立bug与contract questions、exact commands/CI。这些字段是基于 #10 的研究复用建议，不是已部署共享schema。

## 7. 未解决来源与复核边界

- 所有第一波 family 原始 classes/JSON-LD/meta/math annotation/image attributes均未通过本次source检查。W/I只是各自声明范围内的观察，后续不得直接变成fixture expectations。
- APS完整研究body、ACS migration后usable current DOM、RSC source HTML、Small article、AEM当前OA research需补验。已有至少多个第一波 article投影检查，但不声称已获得三家可冻结源DOM。
- AAAS direct失败；IOP robots；历史Springer只有archive；Nature两条idp redirect；SciOpen article有metadata/abstract与模板，无已观察实质正文。这些限制已进入各journal/profile，不猜selectors或supplement formats。
- table spans/pipe cells、跨page table downloads、image-only math、XLSX、consortium metadata等仍缺具体source case，候选名单必须 admission后调整，不能保留题材冗余来凑数量。
- research目前足以形成透明的coverage/sequence计划；**未来corpus acquisition与contract实现 readiness 尚未满足**。29期刊归属矩阵完成，不等于所有页面DOM已验证。

## 8. 文档交付与验证

本次只新增本文件及 `publisher-corpus-candidates.md`；不修改 PRD/EDD、Issue #10实现文档、src、extension、tests、dependencies、CI、release、golden。没有新adapter、router、fixture、parser或runtime实现，没有live clip或paper覆盖。

规划PR（若提交）只在prose说明与Issue #26关系；不能写会触发finalizer的独立completion trailer，不能使用自动关闭关键词。`.github/scripts/issue-finalize.js`当前会从merged PR的独立Refs行提取Issue并在Main CI成功时关闭，故本规划不能被当final delivery。

2026-10-02 在本worktree（Node `v24.14.1`）的验证：

| 命令 / 审计 | 结果 |
| --- | --- |
| `npm ci` | exit 0；65 packages，audit 0 vulnerabilities；lockfile未改变 |
| `npm test` | exit 0；110 passed，0 failed / skipped / cancelled |
| `npm run build` | exit 0；生成ignored `dist/extension` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit 0；`valid: true`，250 inline / 13 display math、50 references、1 structured table；raw HTML/crossrefs/structure均valid |
| `git diff --check`、`git diff --cached --check` | 无whitespace错误；含staged新增文件检查 |
| `git status --short`、`git diff --name-status`、`git diff --cached --name-status`、`git ls-files docs/plans` | 只有本文与candidate文档新增；unstaged diff为空；tracked/index filenames已核实 |
| Markdown表格 / local links审计 | journal矩阵29行、candidate IDs 7/7/6唯一；表格column count与relative文件链接通过 |

这些是本机文档/基线回归结果；未运行远程CI、live clipping或新publisherparser，也没有新fixture。现有tests/golden不能证明新publisher支持或本次网络来源已admitted。交付为本地planning分支中的文档；未提交GitHub PR、未merge、未修改或关闭Issue #26。
