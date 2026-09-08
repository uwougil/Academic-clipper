# Milestone 003 — Nature 论文代表性语料验证集与回归机制

状态：已完成（2026-09-08）

## 目标

在引入其他出版社之前，确立 Nature 适配器与学术规范化流水线在面对多样真实 Nature 论文结构时的泛化能力与鲁棒性。建立包含 8 篇代表性 Nature 论文的验证集与结构化基线清单，实现端到端学术要素全覆盖检验，并建立真实论文出处、语义期望契约、最小结构 fixture 与可选 live 校验四个层次清晰分离的抗回归保护闭环。

## 执行范围

- 挑选并权威记录 8 篇覆盖显著差异排版特征的真实 Nature 论文清单与出处（`docs/nature-corpus.md`）。
- 将语义明确划分为四个层次：真实论文出处（docs）、特性契约（manifest）、离线最小结构 fixtures（test fixtures）、可选 live 校验（`verify-corpus-live.mjs`）。
- 离线 fixture 重新标定语义：从真实 Nature 论文观察结构提炼的自包含最小结构 fixture（sanitized structural fixtures），严禁包含虚构元数据（如 Ada Lovelace），在不向版本库提交冗余 live HTML 快照的前提下保证 CI 完全离线化运行。
- 在 `test/corpus/corpus-manifest.json` 中建立确定性的结构基线、真实 bibliographic 期望与 warning 预期契约。
- 实现 `test/nature-corpus.test.mjs` 端到端验证套件，完整测试：
  `Nature DOM → Nature adapter → Defuddle → normalizers → renderer → validators → final Markdown`。
- 覆盖关键学术要素断言：核心元数据真实性、层级标题、inline/display math 定界合法性、科学行内标记（上下标、化学式、立体化学斜体、粗体化合物编号）、引用与单锚点区间展开、图与 Extended Data 图注/alt、表格结构化与 fallback warning、正文文内交叉引用无悬空（no dangling cross-references）、Markdown 结构有效性及 `debug.json` 诊断精度。
- 遵循 Issue #11 输出契约：不将 `<a id="figure-1"></a>` 当作默认 Markdown 的强制断言，转向语义属性校验。
- 确立缺陷隔离契约：将语料基线与后续具体解析 bug 隔离，保证已有黄金资产与单元测试全部通过。

## 验收标准

- [x] 文档化收录 8 篇代表性真实 Nature 论文清单与选型理由（`docs/nature-corpus.md`），覆盖黄金基线、公式密集、图多/Extended Data 密集、密集引用与极速审稿、大型国际联盟署名、表格多样与化学式、复杂有机合成与立体化学、以及密集内部交叉引用与天体坐标。
- [x] 建立确定性、可重复的离线语料验证工作流，不依赖 Nature 实时网络请求。
- [x] 建立显式可选 live 论文校验脚本（`npm run test:corpus:live`），按需验证 8 篇真实论文在 `nature.com` 的可用性。
- [x] 验证机制遵守生成物规范与 `.gitignore` 规则，不向 Git 提交非必要的原始/清洗后 live HTML 快照。
- [x] 语料断言完整覆盖真实元数据、section 层次结构、inline/display math 定界合法性、科学行内符号、引用及区间展开、主图/Extended Data 图与图注、表格提取与 fallback warning、交叉引用无悬空目标、`validateMarkdownStructure` 检验结果与 `debug.json` 诊断。
- [x] 提供明确的语料回归测试记录机制（`test/corpus/corpus-manifest.json` 与 `test/nature-corpus.test.mjs`）。
- [x] 现有的 Nature golden artifact（`papers/s41586-026-10401-1/`）及既有全部测试保持 100% 通过。
- [x] 不引入针对特定论文的特异性硬编码，不扩展支持非 Nature 出版社。

## 结果证据（基于实际运行结果）

- 语料规范与出处：`docs/nature-corpus.md`
- 语料基线清单：`test/corpus/corpus-manifest.json`
- 语料离线 fixture：`test/corpus/fixtures/*.html`
- 语料回归测试套件：`test/nature-corpus.test.mjs`
- 可选 live 校验工具：`src/verify-corpus-live.mjs`
- 既有黄金资产验证：
  `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`
  输出：250 个行内数学、13 个独立公式、50 条参考文献，0 结构与定界问题，验证通过。
- 语料专用回归测试：
  `npm run test:corpus`
  结果：9/9 测试全部通过（耗时约 4.3 秒）。
- 可选 live 真实全流水线校验：
  `npm run test:corpus:live`
  实现：执行完整 Academic Clipper 流水线（获取真实 HTML、校验 DOI 身份、解析 scholarly nodes、执行 Defuddle 与渲染，运行数学/结构/HTML/交叉引用 4 项官方校验器），输出结构化报告与 PASS / WARN / FAIL 三元状态，非致命 fallback 警告独立归类为 WARN，测试发现的独立解析问题隔离至独立 bug Issue。
- 全量回归测试：
  `npm test`
  结果：89/89 项自动化测试全部通过（耗时约 8.0 秒，完全离线运行）。
- 扩展构建：
  `npm run build` 成功通过。

## 已知边界

- 离线语料 fixture 重新标定为 sanitized structural fixtures，从真实 Nature 论文结构中提炼关键学术节点（article body, equations, figures, tables, author information, references），剔除了追踪脚本、广告栏和无用外链。
- 语料库执行过程中暴露的非结构化表格（如外部补充材料链接表格）记录受控 warning 并优雅回退为安全链接，符合预期契约。
- 仍严格限定于 Nature 出版社（`www.nature.com/articles/<id>`）。

## 本里程碑不包含

- 支持非 Nature 出版社（APS、PRL、Science、Elsevier 等）。
- 建立多 publisher 抽象层。
- 浏览器扩展 UI 改造或 Native Messaging 机制。
- 全局解析器重构或将具体解析缺陷堆叠在语料基线中一次性解决。
