# Milestone 001 — Nature v0.2 高保真与稳定性收敛

状态：已完成（2026-09-05）

## 目标

把单一 Nature 论文采集链路收敛为可长期 review 的本地 Markdown 源文件：保持现有 Nature 输出风格，补齐公式/图注/引用/表格质量、事务写入、并发锁恢复和跨平台回归验证。不扩出版社、不重构大架构。

## 执行范围

- Nature 页面 DOM/metadata 适配和 Defuddle 转换边界保持清晰。
- 数学、scientific inline、figure caption、引用锚点和表格经过确定性 normalization/validation。
- writer 使用 staging + 目录级 replacement；旧 backup、debug、bibliography 和 figure 不得污染新版本。
- writer 在同进程和跨进程下串行化同一 article；锁释放失败必须保留成功保存结果和可恢复 marker。
- stale lock 只在合理条件下恢复；活跃 PID 不得因年龄被误删，死 PID 可快速恢复，缺失/损坏 owner 仍走年龄阈值。
- browser extension、bridge、fixture、golden artifact 和 CI 保持可运行。

## 验收标准

- [x] `npm ci` 使用 lockfile 安装成功且无漏洞报告。
- [x] `npm test` 全部通过，包含 44 个测试。
- [x] `npm run build` 成功生成 `dist/extension/manifest.json`。
- [x] `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` 通过，golden artifact 的 Markdown、公式和结构有效。
- [x] release cleanup failure 不覆盖成功 save；下一次写入可回收 released marker。
- [x] 多个完整 backup 按最新修改时间恢复，而不是按目录字典序恢复。
- [x] CI 覆盖 Ubuntu Node 20、Ubuntu Node 24、Windows Node 24，且三个 job 均通过。

## 结果证据

- 本地提交：`f6c4851 Finalize writer lock recovery and CI matrix`
- 远端：`https://github.com/uwougil/Academic-clipper`
- GitHub Actions：run `33964616455`，Ubuntu/Node 20、Ubuntu/Node 24、Windows/Node 24 均为 `success`。
- 当前 golden paper：`papers/s41586-026-10401-1/index.md`

## 已知边界

- 当前只支持 Nature article URL。
- 外部资源的 DNS rebinding 仍是 residual risk：请求前 DNS 校验已存在，但验证地址尚未绑定到实际 socket。
- Nature DOM selector、同文章 table 补取和部分 Supplementary Information 仍依赖页面结构；异常页面应通过 debug warning 暴露，而不是静默伪造内容。

## 本里程碑不包含

其他出版社、AI 摘要、Zotero 集成、数据库、搜索、VS Code Extension、Electron、复杂 IPC 或新的 agent/MCP/plugin 基础设施。
