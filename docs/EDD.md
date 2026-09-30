# Academic Clipper 工程设计文档

状态：v0.2 当前实现的工程意图与边界。

## 1. 技术基线

- 运行时：Node.js `>=20`，ES modules。
- 依赖：`defuddle` 负责成熟的正文抽取/HTML→Markdown 转换，`jsdom` 提供 Node 中的 DOM 环境。
- 浏览器端：Manifest V3 extension，使用 `chrome.scripting.executeScript` 读取当前页面 DOM。
- 服务端：Node 原生 HTTP、文件系统和 DNS/URL 能力；不引入数据库、Electron 或重量级服务框架。
- 测试：Node 内置 `node:test`，fixture 和 committed Nature golden artifact 驱动回归。
- CI：GitHub Actions，在 Ubuntu Node 20、Ubuntu Node 24、Windows Node 24 上运行 `npm ci`、`npm test`、`npm run build` 和 golden paper validator。

选择这些组件的原因是：项目是本地单用户原型，核心价值在论文 DOM/语义转换而不是服务编排；Node 与浏览器扩展共享 JavaScript 生态，Defuddle 可复用 Obsidian Web Clipper 依赖的成熟转换能力。

## 2. 组件与职责

```text
extension/popup.*
  → POST /preview 或 /paper
src/bridge.mjs
  → loadConfig + Origin/token boundary
src/launcher.mjs
  → Windows Native Messaging host for lifecycle management (auto-wake)
src/adapters/nature.mjs
  → Nature DOM/metadata/table capture
src/markdown.mjs + Defuddle
  → HTML → Markdown
src/normalizers/*
  → math, scientific inline, citations, figures, markers
src/validators/*
  → math delimiters, citation style, Markdown structure
src/clip.mjs
  → result model, front matter, figure IO, locks, recovery, directory replacement
papers/<article-id>/
  → local durable artifact
```

### 2.1 浏览器扩展

`extension/manifest.json` 声明最小 scripting/activeTab 和 nativeMessaging 能力。popup 只负责 endpoint/token/config、Save Paper、Preview Markdown 以及通过 Native Messaging 唤醒本地 bridge；不承载 Nature 解析逻辑。

### 2.2 本地 bridge

`src/bridge.mjs` 默认监听 `127.0.0.1:34123`，从 `config.json` 读取 library path、端口、图片下载、debug、citation style 和 allow-list。环境变量只作为配置覆盖：`ACADEMIC_CLIPPER_LIBRARY`、`ACADEMIC_CLIPPER_PORT`、`ACADEMIC_CLIPPER_BRIDGE_TOKEN`。

端点：

- `GET /health`：返回服务状态和版本。
- `POST /preview`：解析页面并返回 Markdown/debug，不写论文目录。
- `POST /paper`：解析、验证、下载资源并事务性写入论文目录。

### 2.3 Nature adapter

`src/adapters/nature.mjs` 是唯一的 publisher-specific 边界：识别 Nature URL、metadata、article body、equation、figure、Extended Data、references、table link 和 author information。适配器输出结构化中间结果，不直接拼装最终 Markdown。

### 2.4 Markdown 与 academic normalization

`src/markdown.mjs` 在受控 DOM 环境中调用 Defuddle。`src/normalizers/` 处理语义 placeholder、原始 TeX、scientific inline、引用/锚点、figure caption 和表格；`src/validators/` 对最终候选 Markdown 实施词法数学、raw HTML audit、文档结构与交叉引用校验。任一校验失败时 writer 均拒绝安装新版本。

### 2.5 输出方言契约与校验管线

系统提供三种明确的输出方言（dialect）契约：

- `markdown`（默认模式）：
  - 维持 zero raw HTML（正文中严禁出现任何原生 HTML 标签）。
  - figure、table、equation 等无法以纯 CommonMark 可靠定位的内部引用，按契约降级为普通文本（例如 `Figure 1`、`Table 1`、`Equation (2)`），杜绝生成指向不存在内部 target 的 `](#...)` 死链；section 仅在存在对应 heading slug 时保留链接，否则降级为普通文本。
- `quarto`（学术出版模式）：
  - 使用 Quarto-native identifiers 与交叉引用前缀：
    - `{#fig-*}`
    - `{#tbl-*}`
    - `{#eq-*}`
    - `{#sec-*}`
  - 保持正文 zero raw HTML。
- `links`（legacy compatibility 模式）：
  - 仅允许严格受控的 `<a id="..."></a>` 兼容锚点。
  - 严禁任意其他 raw HTML 标签（如 `<a href="...">`、`<a onclick="...">`、`<div>`、`<span>` 等）。

最终写入论文目录前的校验管线（Validation Pipeline）：

```text
rendered Markdown
  → raw HTML audit (代码块与行内代码外严禁未授权 HTML；links 模式仅放行合法兼容锚点)
  → Markdown structure validation (标题层级、脚注/参考文献连续性、表格结构)
  → cross-reference validation (验证正文内部引用均存在合法 target，拦截未知悬空死链)
  → write index.md
```

## 3. 写入与恢复协议

单篇文章的写入流程：

```text
acquire same-process queue + cross-process lock
  → recover stale transaction/backup
  → render and validate remote Markdown
  → create temporary sibling staging directory
  → download figures and write index/debug/bib
  → validate the staged result
  → move old destination to backup when needed
  → rename staging directory to destination
  → remove backup and release lock
```

每个竞争 writer 使用独立的 `.academic-clipper-locks/<hash>-<article-id>.claim-<token>` claim 目录，owner metadata 至少包含 `pid`、`createdAt` 和随机 `token`；claim 通过单调 ticket 与目录名确定全序，同一文章始终只有排在最前的活跃 claim 进入写入区：

- 有效 owner 且 PID 存活：不按年龄回收。
- 有效 owner 且 PID 已死：经过短 dead-PID grace 后可回收。
- owner 缺失或损坏：只有达到正常 stale age 才可回收。
- stale 判定后只删除同一个唯一 claim 路径，并在删除前复核；新 owner 使用不同路径，不会被陈旧判定误删。
- 锁释放清理失败：成功保存不能被改报为失败；保留 `releasedAt` marker、warning 和路径，下一次 writer 可恢复并最终清理。

恢复时只接受包含非空 `index.md` 的完整 backup；存在多个完整 backup 时按目录修改时间选择最新者，再清理其他 transaction。staging 目录即使存在也不默认视为完整版本。

## 4. 安全边界

- bridge 仅绑定 loopback，不接受任意外部监听。
- 请求 Origin 必须是允许的 extension origin 或显式 configured allow-list；配置 token 时 `/preview` 和 `/paper` 要求 Bearer token。
- `src/security.mjs` 只允许 HTTP(S)，拒绝 localhost、loopback、link-local、私有网段、CGNAT、metadata、multicast 和 mapped-private IPv6。
- DNS 在请求前解析全部地址；redirect 手动逐跳检查并限制跳数；图片检查 `image/*`、超时和 20 MiB 大小上限。
- CLI 论文 HTML 只允许同一 `https://www.nature.com/articles/<id>` redirect scope，默认 30 秒超时、25 MiB 响应上限，并拒绝非 HTML content type。
- Nature table 补取还必须保持在当前 article 的 `/tables/` scope。
- bridge 配置端口必须是 `1..65535` 的整数，配置加载阶段即以简洁错误拒绝非法值。
- Native Messaging launcher 仅承担 control plane 的 lifecycle 责任（检查存活、进程拉起、readiness 等待与会话同步），不承载 Nature HTML、Markdown 或图片数据；论文采集与预览通过 loopback HTTP bridge 数据面处理。
- launcher 与 bridge 采用确定性路径解析（基于项目根目录及显式 config 路径），不依赖宿主环境启动时的 working directory。
- 存活验证结合操作系统 PID 状态与 `/health` 端点服务标识校验（包含 `service`、`version` 与随机 `instanceId`）；遇到死进程、端口占用或服务不匹配等 stale state 时自动清理并重启。
- 并发唤醒采用原子 startup lock（`.bridge-startup.lock`）序列化启动，确保多个并发请求最多启动一个 bridge 实例；锁具备两级回收机制：owner PID 死亡立即回收，owner PID 存活时默认等待、仅超过更长的硬超时阈值（60s）才允许回收，未写完整或损坏的 fresh lock 同样不立即删除、仅超期后按 age-based stale recovery 安全回收，防止慢启动被二次 caller 误抢占。
- 遇到 token 变更或失效时，扩展在捕获 401 后经 Native Messaging 重新获取当前有效会话并仅重试一次，严格杜绝无限重试循环；bridge 不在普通控制台输出 token 明文。
- Windows 注册支持 Chrome 与 Edge 当前用户注册（HKCU），Native Messaging manifest 严格使用编译生成的无窗口原生宿主 `launcher.exe`（`.bat/.cmd` 仅作为开发与调试辅助脚本，生产配置不回退），记录确定性 Node 安装路径防范 PATH 缺失；`allowed_origins` 严格限定为单个 `chrome-extension://<extensionId>/`，路径与注册表命令均经安全引用以支持空格路径。
- 当前残余风险：已验证的 DNS 地址尚未绑定到实际 undici socket，因此仍存在 DNS rebinding 风险；这在本轮不扩大为架构重写。

## 5. 文件与生成物策略

- `src/`、`extension/`、`test/`、`docs/` 和 `.github/` 是源代码/规范/测试，直接维护。
- `dist/` 是 `npm run build` 生成物，不手工编辑、不提交。
- `papers/s41586-026-10401-1/` 是用于 review 和 CI 的刻意提交 golden artifact；普通 `papers/*` 是本地捕获输出。
- `config.example.json` 是唯一提交的配置示例；`config.json` 可能包含本地路径和 token，必须忽略。
- raw/cleaned HTML 只用于本地调试，不进入版本库。

## 6. 测试设计

- parser fixture：验证 Nature metadata、标题、段落、inline/display math、figure、reference。
- output-quality：验证公式、图、引用、表格、Quarto 和本地资源。
- stability regressions：验证 DOM 隔离、并发写入、旧文件清理、失败提交回滚、CLI 参数边界。
- infrastructure hardening：验证 SSRF 边界、bridge 安全与端口、CLI fetch 超时/响应上限、跨进程锁、PID/owner 恢复、stale takeover race、release failure 和 newest backup。
- CI 不访问真实 Nature；golden artifact validator 检查已提交的最终 Markdown。

## 7. 变更约束

任何新增 publisher、输出格式、外部服务、持久化系统或浏览器权限都必须先更新 PRD/EDD/milestone，并补充对应的安全与回归测试。普通修复应在现有边界内做最小增量修改。
