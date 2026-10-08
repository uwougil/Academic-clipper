# Publisher corpus candidates — 未 admission 的研究清单

2026-10-02；配套 [coverage census](publisher-coverage-census.md)。以下 **APS 7 + ACS 7 + Wiley 6 = 20** 个第一波候选；RSC另4条备用线索。未获取/提交fixtures，未把web/index投影当原HTML。OBSERVED-W/I、ACCESS-BLOCKED定义与限制见主文§1。观察状态是按feature标记，不按整篇paper“全已观察”标记。

Admission仍须：公开可用current DOM → canonical/structured DOI/journal identity → 实质正文 → 目标结构源节点 → distinct coverage → sanitizer/provenance/replay → 独立semantic oracle。理论/综述/化学题材不能证明equations/tables/reference DOM。替换结构冗余、preview、未增覆盖样本，保留拒绝理由；别把所有高频altermagnet题材样本全部收进corpus。

## APS（7）

| ID / journal / URL | 目标role与用途 | 实际观察与access | NEEDS CONFIRMATION / admission条件 |
| --- | --- | --- | --- |
| A1 / Physical Review X / [12.031042](https://journals.aps.org/prx/abstract/10.1103/PhysRevX.12.031042) | 理论、gallery、supplement、dense refs；比较shell与body | OBSERVED-W：OA、作者/DOI、Figures 1–4、Popular Summary、93 references、supplemental link；browser challenge | equation-heavy只是候选：完整body、原math/labels、citation ranges、caption/panel/source必须确认 |
| A2 / Physical Review X / [12.040501](https://journals.aps.org/prx/abstract/10.1103/PhysRevX.12.040501) | perspective、长outline、多figures/refs | OBSERVED-W：OA、outline多个sections、gallery 1–7及更多控件、references；Article Text缺实质内容投影 | 获取完整body与长caption；图/refs独特性不够则替换A1/A2其中一篇；不能以空Article Text admit |
| A3 / Physical Review X / [52wh-1z5y](https://journals.aps.org/prx/abstract/10.1103/52wh-1z5y) | 新DOI短码、superconducting理论与scientific inline | OBSERVED-I：OA、编号affiliations、Popular Summary、78 references；article shell可见 | display数学/多行式、table、crossref未知；需current完整body，不能用abstract或PDF |
| A4 / Physical Review B / [k5vw-c9ks](https://journals.aps.org/prb/abstract/10.1103/k5vw-c9ks) | Hubbard theory、多个corresponding、U–V scientific runs | OBSERVED-I：title/author/affiliations、3 contact notes、abstract科学notation、dates；未见全文 | preview/access negative probe；公式/相图/表格仍候选。没有公开正文则不计positive corpus |
| A5 / Physical Review Letters / [133.206702](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.133.206702) | letter、equal contribution、twist/symmetry inline | OBSERVED-I：共同贡献daggers、联系人/DOI/dates/abstract；未见正文 | 确认公开access、letter section/fig/citation差异；可作为negative preview结构，不替代positive来源 |
| A6 / Reviews of Modern Physics / [93.025006](https://journals.aps.org/rmp/abstract/10.1103/RevModPhys.93.025006) | long review、作者逐人affiliations、多gallery、dense bibliography候选 | OBSERVED-I：metadata、复杂affiliations、figure gallery；正文access未确定 | long refs、tables、nested headings须原DOM确认；题材不能证明table，可能因无法取得公开body被拒 |
| A7 / Physical Review Applied / [41by-5p3c](https://journals.aps.org/prapplied/abstract/10.1103/41by-5p3c) | experimental device、short DOI、figure/table对照 | OBSERVED-I：OA license、DOI、received/revised/accepted/published | table/figure-heavy只是候选；公开原body、caption/real cells须确认。若无实表，寻找替换表格样本 |

PRR [2.023051](https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.2.023051) 是cross-journal补验入口，本次直接失败，未在7个positive研究候选中伪称已观察。APS admission必须补到至少一个真实table case和确切equation source；当前7条不能证明必需结构覆盖。

## ACS-current（7）

所有候选必须核验2026-07-24 Silverchair迁移后的current DOM，即使paper发表更早。以下OBSERVED-I可能是cache；direct/browser challenge不是admission。

| ID / journal / URL | 目标role与用途 | 实际观察与access | NEEDS CONFIRMATION / admission条件 |
| --- | --- | --- | --- |
| C1 / Nano Letters / [6c01391](https://pubs.acs.org/doi/10.1021/acs.nanolett.6c01391) | twist theory、chemistry subscripts、Methods、visual abstract、citation ranges | OBSERVED-I：OA、Methods/navigation、PT/Fe₂CoGaTe₂ notation、(1−4)、visual abstract；direct失败/browser challenge | current canonical/DOM/body、formula source、figures/refs；不能直接以index TeX做oracle |
| C2 / Nano Letters / [5c02091](https://pubs.acs.org/doi/10.1021/acs.nanolett.5c02091) | 实验+model、STM/H atom、scientific inline与citation clusters | OBSERVED-I：abstract及正文段落、(1−4,6,7) citation线索；access尚未充分确认 | 公开body、math/display、panel/caption、table未知；若与C1结构冗余则替换 |
| C3 / Nano Letters / [6c00927](https://pubs.acs.org/doi/10.1021/acs.nanolett.6c00927) | 有正文purchase但免费SI的access negative case | OBSERVED-I：Available to Purchase、abstract、visual abstract、PDF SI及figshare UI | 不计positive正文corpus；可研究partial/access detection。display理论内容未观察 |
| C4 / ACS Nano / [5c03144](https://pubs.acs.org/doi/10.1021/acsnano.5c03144) | figure/supplement-heavy实验、共同贡献与Methods | OBSERVED-I：OA、Intro/Results and Discussion/Conclusion/Methods/References/SI navigation、作者notes | figures/table数与panels/source、SI形式、heading IDs、current完整body须确认 |
| C5 / ACS Nano / [5c15791](https://pubs.acs.org/doi/10.1021/acsnano.5c15791) | Unicode names、多affiliations/现址、多个corresponding、figure viewer | OBSERVED-I：OA、作者/地址/notes/ORCID/funding/dates；direct403 | 去重作者/完整caption、source scientific typography、experimental figure结构；正文capture未验 |
| C6 / The Journal of Physical Chemistry C / [6c02330](https://pubs.acs.org/doi/10.1021/acs.jpcc.6c02330) | NMR equation/table候选、Li₂OHCl/⁷Li、比纯altermagnet题材更异构 | OBSERVED-I：官方[130/23 TOC](https://pubs.acs.org/toc/jpccck/130/23)将该NMR文章标OA；article direct403 | 本文metadata/source/body未观察；数学/表格不能因NMR推断。若缺cells替换table样本 |
| C7 / Journal of the American Chemical Society / [4c18150](https://pubs.acs.org/doi/full/10.1021/jacs.4c18150) | 分子notation、transport equations、chemistry vs physics对照 | OBSERVED-I：article identity、charge transport内容与SI线索；direct403；public body status待确认 | OA/full-body、current canonical、compound bold/chemistry markup、表格/方程/refs均需源确认 |

JPCL [5c03292](https://pubs.acs.org/doi/10.1021/acs.jpclett.5c03292) 是额外preview/transparent-review入口：OBSERVED-I purchase、PDF Table S1描述与peer-review PDF；不将SI Table S1计作HTML table。若positive admission缺JPCL，另找可公开全文且增加结构覆盖的文章，而非强行将preview纳入。

## Wiley-Advanced（6）

| ID / journal / URL | 目标role与用途 | 实际观察与access | NEEDS CONFIRMATION / admission条件 |
| --- | --- | --- | --- |
| W1 / Advanced Science / [202503235](https://advanced.onlinelibrary.wiley.com/doi/10.1002/advs.202503235) | equation-heavy theory、matrix、nested headings、多corresponding、DOCX SI | OBSERVED-W：OA、2.1–2.3、编号(2)matrix/(3)Kerr、长panel captions、citation ranges、11.4MB DOCX link；browser challenge | 原MathML/TeX/image与inline/display区分、完整数学sentinels、IDs/source attributes；不要copy投影`$$` |
| W2 / Advanced Functional Materials / [202516924](https://advanced.onlinelibrary.wiley.com/doi/10.1002/adfm.202516924) | figure-heavy STM/XPS/DFT、长affiliations、SI/section refs | OBSERVED-W：OA、a–f panel captions、scientific sub/sup、Section 3/S1 links、20.7MB PDF SI | main-vs-SI targets、caption panels、image attributes、equation/table是否存在须原DOM确认 |
| W3 / Advanced Functional Materials / [202531001](https://advanced.onlinelibrary.wiley.com/doi/10.1002/adfm.202531001) | 实table、多公式、units/inline、Methods、所有crossref类型 | OBSERVED-W：OA、Eq.9显示与link、Table 1 headers+2 numeric rows、长Figure 4caption、4 Methods/4.1；最强table probe | 真实 HTML cells/spans/notes、math annotation、section IDs与表图source；单table layout不代表全部 |
| W4 / Advanced Electronic Materials / [201900334](https://advanced.onlinelibrary.wiley.com/doi/10.1002/aelm.201900334) | 历史Full Paper/abstract对照、BiSbTeSe₂notation、单联系人 | OBSERVED-W：authors/affiliations、Full Paper、abstract、dates、keywords；未见实质正文 | access-negative/历史对照优先；不能推断2023后OA文章也只有abstract。positive corpus需换当前public全文 |
| W5 / Small / [202411133](https://advanced.onlinelibrary.wiley.com/doi/10.1002/smll.202411133) | chemistry/rare-earth substitution、material notation、cross-journal probe | OBSERVED-I：其他官方Wiley文章refs核实Small 21(13)/2411133 citation；原article direct不可用 | 本文access/identity需重验，所有claimed结构仍CANDIDATE；不是Small已验证DOM |
| W6 / Advanced Science / [202512533](https://advanced.onlinelibrary.wiley.com/doi/10.1002/advs.202512533) | V₂Se₂Onotation、transport/ferroelasticity、不同年份schema线索 | OBSERVED-I：官方Wiley research references列出该文章citation与DOI；未检查本文full body | access、年份/issue与first published、math/real tables/captions均CANDIDATE；若不增结构替换 |

Wiley至少W1–W3有完整可读研究投影，但原HTML仍未source-backed获取；其余是备用/负例。为了未来5–10positive sources需替换不能公开正文者；不要把W4的abstract当positive article，也不要用OA editorial或cover凑数量。

## RSC备用研究线索（4，不属于推荐第一波20条）

| journal / URL | role / 已观察 | access与未知 |
| --- | --- | --- |
| Materials Horizons / [D5MH00120J](https://pubs.rsc.org/en/content/articlehtml/2025/mh/d5mh00120j) | OBSERVED-I：review、Wider impact、biography、magnetic Kagome notation；long refs/tables候选 | direct403；raw body/math/table/refs/topology未验 |
| Physical Chemistry Chemical Physics / [D6CP00658B](https://pubs.rsc.org/en/content/articlehtml/2026/cp/d6cp00658b) | OBSERVED-I：OA research、multiple affiliations/corresponding、NMR；equation/table probe候选 | direct403/browser challenge；source forms、spans、numbering待验 |
| Journal of Materials Chemistry C / [D5TC04440E](https://pubs.rsc.org/en/content/articlelanding/2026/tc/d5tc04440e/unauth) | OBSERVED-I：advance/accepted version、equal contribution、graphite compound notation、PDF SI | landing不等于全文；articlehtml403；需最终version/publicfull body |
| Chemical Science（范围外对照）/ [D4SC04125A](https://pubs.rsc.org/en/content/articlehtml/2024/sc/d4sc04125a) | 官方PDF/index核实MOF/chemical notation研究线索；可比较同RSC platform跨journal | HTML403；PDF不是DOM来源；加入用户scope须另行明确，不计29journals |

## Coverage缺口与未来替换要求

1. 第一波至少找到一条源可验的display/multiline math、一条真实table cells、一条figure caption边界、一条citation range、一条unusual author、一条scientific inline、一条internal cross-reference与supplement resource；一篇可兼多role，但每role对应retained block/independent assertion。
2. 目前WileyTable 1、matrix/captions有W观察；APS与ACS对应role不少仍只是candidate。XLSX、table header/span、image-only math、consortium authors没有确认样本。不能把absence填为“无此结构”。
3. Article题材重复不等于DOM多样。APS三个PRX、ACS两条NanoLetters等应在实际source comparison后淘汰冗余；跨journal也不自动证明不同DOM。
4. 研究时记录OA/Free/Available to Purchase/挑战的各自事实；每条admission都重新访问，别把本日期或web index cache当固定access oracle。若失败，只保留rejection理由/公开URL，不制造excerpt或回避困难结构。
