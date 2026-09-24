# Nature 代表性论文语料库规范与回归基线

状态：生效（Issue #10，Milestone 003）

## 1. 目标与定位

Academic Clipper 面向 Nature 论文的首发能力最初建立在单一物理学黄金资产（`papers/s41586-026-10401-1/`）之上。为了确保 Nature 适配器（`src/adapters/nature.mjs`）与学术规范化链路（`src/normalizers/*`、`src/markdown.mjs`、`src/validators/*`）在面对真实多样化学术排版时具备坚实的泛化能力与防回归保障，本项目建立了面向 8 篇代表性真实 Nature 论文的验证与回归工程体系。

### 四个清晰分离的层次

为了消除将测试 fixture 与真实语料语义混淆的问题，本项目严格划分四个工程层次：

1. **真实论文语料库出处（Provenance Matrix）**（本规范文档）：
   记录 8 篇在 Nature 真实发表的代表性论文的完整客观事实，包括权威标题、DOI、作者、单位、通讯作者邮箱、收录卷期与官方链接。语料绝不包含任何虚构元数据。
2. **语料语义期望与特性契约（`test/corpus/corpus-manifest.json`）**：
   形式化定义各论文所覆盖的核心排版特征、各学术节点数量基线、数学定界合法性、Markdown 结构规范性以及受控的警告（warnings）预期。
3. **离线最小结构 Fixtures（`test/corpus/fixtures/*.html`）**：
   定位为**从真实 Nature 论文观察结构中提炼的离线最小化结构 fixture（sanitized structural fixtures）**。保留验证关键边界所需的真实 DOM 节点拓扑与真实 bibliographic 元数据，剥离冗余的商业追踪脚本和巨量多媒体二进制数据，保证 CI 环境可在零外部网络依赖、毫秒级执行时间与确定性状态下运行。
4. **可选 Live 真实论文全流水线校验（`npm run test:corpus:live`）**：
   提供显式、按需的手工网络验证工具（位于 `src/verify-corpus-live.mjs`，独立于日常离线 CI）。直接连通 `nature.com` 官方端点获取真实 HTML，校验规范元数据身份，并完整执行 Academic Clipper 处理流水线（`parseNaturePage` → `clipNature` → normalizers → renderer），最终运行 4 项官方校验器（数学定界、文档结构、原生 HTML 审计、交叉引用）。严格以 `PASS`（全绿无警报）、`WARN`（流水线与校验通过但含非致命受控警告）、`FAIL`（请求失败、身份不符或存在致命校验异常）三元状态呈现真实生态质量。

---

## 2. 真实论文出处矩阵（Corpus Provenance Matrix）

语料库挑选的 8 篇论文覆盖凝聚态物理、量子计算、人工智能与结构生物学、流行病毒学、全基因组学、材料科学、有机全合成及射电天文学等 8 大前沿学科，形成严格互补的正交特征矩阵：

| 文章 ID | 学科领域 | 真实论文标题 | 真实 DOI | 出处与卷期 | 核心结构特征与验证侧重 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `s41586-026-10401-1` | 物理 / 凝聚态磁学 | Symmetry classification of magnetic orders using oriented spin space groups | `10.1038/s41586-026-10401-1` | *Nature* **652**, 869–873 (2026) | **黄金基线**：标准学术三段论（Abstract, Main, Methods）、display/inline 数学混排、OSG 空间群符号、单锚点连续区间引用展开、Extended Data 图及 1 项结构化表格、1 项外部表格 fallback 警告。 |
| `s41586-019-1666-5` | 量子物理 / 理论计算 | Quantum supremacy using a programmable superconducting processor | `10.1038/s41586-019-1666-5` | *Nature* **574**, 505–510 (2019) | **高密公式与定理**：多行对齐 `array`、独立编号 display math（`(1)`–`(4)`）、狄拉克态矢（`\vert \psi \rangle`）、正文公式交叉跳转锚点（`[Equation (1)](#equation-1)`）、复杂下标。 |
| `s41586-021-03819-2` | 计算生物 / 机器学习 | Highly accurate protein structure prediction with AlphaFold | `10.1038/s41586-021-03819-2` | *Nature* **596**, 583–589 (2021) | **高密图注与 Extended Data**：多面板子图（**a**–**d**）、高达 10 张 Extended Data Figures（`Extended Data Fig. 1`–`10`）、千字级长图注、短 alt 替代文本清洗。 |
| `s41586-020-2012-7` | 病毒学 / 流行病学 | A pneumonia outbreak associated with a new coronavirus of probable bat origin | `10.1038/s41586-020-2012-7` | *Nature* **579**, 270–273 (2020) | **密集引用与极速审稿**：密集引用区间（`[1-5]`）、极速审稿出版日期、系统发育树分析图、无编号公式节点的受控 warning 处理。 |
| `s41586-023-05896-x` | 基因组学 / 大型联盟 | A draft human pangenome reference | `10.1038/s41586-023-05896-x` | *Nature* **617**, 312–324 (2023) | **大型国际联盟与多机构署名**：Human Pangenome Reference Consortium 署名、跨国跨层级多机构地址、共同第一作者说明、多表格基因组组装指标对比。 |
| `s41586-023-06735-9` | 材料科学 / 自动探索 | Scaling deep learning for materials discovery | `10.1038/s41586-023-06735-9` | *Nature* **624**, 80–85 (2023) | **复杂表格与化学计量式**：多行多列结构化 HTML 表格、外部下载补充数据表安全 fallback 与受控 warning 记录、复合材料多元素下标（$\mathrm{Li}_3\mathrm{YCl}_6$）。 |
| `s41586-024-08538-y` | 有机化学 / 分子合成 | Total synthesis of 25 picrotoxanes by virtual library selection | `10.1038/s41586-024-08538-y` | *Nature* **638**, 980–986 (2024) | **化学行内符号与立体化学**：粗体化合物代号（**1**, **2a**, **3**, **4**）、斜体构型标识（*R*, *S*, *trans*, *cis*）、旋光度与产率（${[\alpha]}_{\mathrm{D}}^{20}$、$\mathrm{ee} > 99\%$）。 |
| `s41586-021-04354-w` | 天体物理 / 射电天文 | A repeating fast radio burst source in a globular cluster | `10.1038/s41586-021-04354-w` | *Nature* **602**, 585–589 (2022) | **多向内部交叉引用与天体坐标**：章节、图、扩展图、表、公式多向跳转、无 dangling 悬空链接、赤经赤纬天体坐标（RA/Dec）、负指数单位（$\mathrm{erg\ s^{-1}}$）、误差容限（$\pm$）。 |

---

## 3. 语料详细出处与验收期望

### 3.1 论文 1：`s41586-026-10401-1`
- **Canonical URL**: `https://www.nature.com/articles/s41586-026-10401-1`
- **DOI**: `10.1038/s41586-026-10401-1`
- **真实作者**: Yuntian Liu, Xiaobing Chen, Yutong Yu, Jesús Etxebarria, J. Manuel Perez-Mato, Qihang Liu
- **通讯作者**: Qihang Liu (`liuqh@sustech.edu.cn`)
- **单位机构**: Southern University of Science and Technology, Shenzhen, China; University of the Basque Country (UPV/EHU), Bilbao, Spain
- **出版卷期**: *Nature* 652, 869–873 (2026-04-22)
- **核心断言**: 提取 6 位作者、共同一作注释、2 个 display 公式、3 个主图、2 个 Extended Data 图、1 个捕获表格及 1 个 fallback 表格（记录 warning）。

### 3.2 论文 2：`s41586-019-1666-5`
- **Canonical URL**: `https://www.nature.com/articles/s41586-019-1666-5`
- **DOI**: `10.1038/s41586-019-1666-5`
- **真实作者**: Frank Arute, Kunal Arya, Rishi Babbush, John M. Martinis et al.
- **通讯作者**: John M. Martinis (`jmartinis@google.com`)
- **单位机构**: Google Quantum AI, Mountain View, CA, USA
- **出版卷期**: *Nature* 574, 505–510 (2019-10-23)
- **核心断言**: 提取 4 个编号 display 公式、`\vert \psi \rangle` 态矢与 `\sum` 求和定界完好、`[Equation (1)](#equation-1)` 跳转有效。

### 3.3 论文 3：`s41586-021-03819-2`
- **Canonical URL**: `https://www.nature.com/articles/s41586-021-03819-2`
- **DOI**: `10.1038/s41586-021-03819-2`
- **真实作者**: John Jumper, Richard Evans, Alexander Pritzel, Pushmeet Kohli, Demis Hassabis et al.
- **通讯作者**: Demis Hassabis (`dhcontact@deepmind.com`)
- **单位机构**: DeepMind, London, UK
- **出版卷期**: *Nature* 596, 583–589 (2021-07-15)
- **核心断言**: 提取 4 张主图与 10 张 Extended Data 图、长图注解析保持层级、alt 属性规范化、`## Extended Data` 分组生成正确。

### 3.4 论文 4：`s41586-020-2012-7`
- **Canonical URL**: `https://www.nature.com/articles/s41586-020-2012-7`
- **DOI**: `10.1038/s41586-020-2012-7`
- **真实作者**: Peng Zhou, Xing-Lou Yang, Xian-Guang Wang, Ben Hu, Zheng-Li Shi et al.
- **通讯作者**: Zheng-Li Shi (`zlshi@wh.iov.cn`)
- **单位机构**: CAS Key Laboratory of Special Pathogens, Wuhan Institute of Virology, Wuhan, China
- **出版卷期**: *Nature* 579, 270–273 (2020-02-03)
- **核心断言**: 10 篇参考文献连续区间展开（`[^1][^2][^3][^4][^5]`）、无公式节点时发出受控警告 `No equation nodes were detected.`。

### 3.5 论文 5：`s41586-023-05896-x`
- **Canonical URL**: `https://www.nature.com/articles/s41586-023-05896-x`
- **DOI**: `10.1038/s41586-023-05896-x`
- **真实作者**: Wen-Wei Liao, Mobin Asri, Jana Ebler, Daniel Doerr, Marina Haukness, Glenn Hickey, Karen H. Miga, Tobias Marschall, Evan E. Eichler, Benedict Paten et al.
- **通讯作者**: Benedict Paten (`bpaten@ucsc.edu`)
- **单位机构**: UC Santa Cruz Genomics Institute, Santa Cruz, CA, USA; Saarland University, Germany; University of Washington, Seattle, WA, USA
- **出版卷期**: *Nature* 617, 312–324 (2023-05-10)
- **核心断言**: 多机构地址与共同一作注解匹配、多张表格（组装指标与变异分析）结构化输出。

### 3.6 论文 6：`s41586-023-06735-9`
- **Canonical URL**: `https://www.nature.com/articles/s41586-023-06735-9`
- **DOI**: `10.1038/s41586-023-06735-9`
- **真实作者**: Amil Merchant, Simon Batzner, Samuel S. Schoenholz, Ekin Dogus Cubuk et al.
- **通讯作者**: Ekin Dogus Cubuk (`cubuk@google.com`)
- **单位机构**: Google DeepMind, Mountain View, CA, USA
- **出版卷期**: *Nature* 624, 80–85 (2023-11-29)
- **核心断言**: 2 张结构化表格与 1 张外部数据链接 fallback 表格、化学计量式多元素下标转义为 Markdown 安全表达。

### 3.7 论文 7：`s41586-024-08538-y`
- **Canonical URL**: `https://www.nature.com/articles/s41586-024-08538-y`
- **DOI**: `10.1038/s41586-024-08538-y`
- **真实作者**: Chunyu Li, Ryan A. Shenvi
- **通讯作者**: Ryan A. Shenvi (`rshenvi@scripps.edu`)
- **单位机构**: Department of Chemistry, The Scripps Research Institute, La Jolla, CA, USA
- **出版卷期**: *Nature* 638, 980–986 (2024-12-23)
- **核心断言**: 粗体化合物代号（**1**, **2a**, **3**, **4**）不误识别为其他语法、手性构型与立体化学符号排版正常、反应条件优化表完整解析。

### 3.8 论文 8：`s41586-021-04354-w`
- **Canonical URL**: `https://www.nature.com/articles/s41586-021-04354-w`
- **DOI**: `10.1038/s41586-021-04354-w`
- **真实作者**: Franz Kirsten, Benito Marcote, Kenzie Nimmo, Jason W. T. Hessels, Mohit Bhardwaj et al.
- **通讯作者**: Franz Kirsten (`franz.kirsten@chalmers.se`)
- **单位机构**: Chalmers University of Technology, Onsala Space Observatory, Sweden; JIVE, Dwingeloo, The Netherlands; University of Amsterdam, The Netherlands
- **出版卷期**: *Nature* 602, 585–589 (2022-02-23)
- **核心断言**: 跨章节、图、扩展图、表、公式内部引用闭环、零 dangling 悬空引用、天体坐标与物理量纲（$\mathrm{erg\ s^{-1}}$）完好。

---

## 4. 验证与回归执行工作流

### 4.1 离线语料回归验证（常规 CI 核心）
```bash
npm run test:corpus
```
该命令执行 `test/nature-corpus.test.mjs`，在自包含离线环境下对全部 8 篇语料执行端到端解析，严格验证元数据真实性、DOM 抽取完整性、Markdown 结构合法性、数学定界符完备性与交叉引用非悬空性。

### 4.2 全量测试套件
```bash
npm test
```
运行包含单元测试、安全防护测试、并发事务锁恢复、Markdown 结构与交叉引用校验、以及完整语料库验证的 89 项自动化测试（100% 离线、零网络依赖）。

### 4.3 可选 Live 真实论文全流水线验证（按需手工运行）
```bash
# 全量验证 8 篇 live 论文
npm run test:corpus:live

# 指定单篇论文验证（例如黄金基线）
node src/verify-corpus-live.mjs --article s41586-026-10401-1

# 以 JSON 格式输出评估结果
node src/verify-corpus-live.mjs --json
```

该工具直接从 Nature 官方获取实时页面，执行完整剪藏流水线并运行 4 项官方生产校验器，按严格的三元分类报告结果：
- **PASS**: 流水线完整跑通，4 项官方校验器（数学、结构、HTML、交叉引用）全部通过且无警告。
- **WARN**: 流水线与 4 项校验器全部通过，但伴随非致命性学术警告（如表格外部链接安全 fallback、无公式提示等）。WARN 独立计数，严禁混同于 PASS。
- **FAIL**: 网络请求失败、身份元数据不匹配、抛出未捕获异常、或任意一项官方校验器检测到致命语法/格式违规。

### 4.4 缺陷隔离政策（Defect Isolation Policy）
当在真实 Nature 在线文章中探测到解析器或校验器违规（例如特定上标化学式在某些极端上下文下的定界符切分异常，或 Defuddle 残留未经清洗的特定原始 HTML 标签）时：
1. **严格禁止在 Issue #10 随意打补丁或扩大范围**：本任务专注于语料集基线建立与全流水线验证工具链收敛；
2. **客观呈现生态现实**：Live 校验器如实判定并报告 `FAIL`，不掩盖问题；
3. **隔离独立 Bug Issue**：提取最小可复现 HTML 片段，建立独立的缺陷跟踪 Issue（例如数学上标孤立片段缺陷、Defuddle 残留引用锚点清洗缺陷），交由独立 PR 修复并在合入 main 后更新基线。
