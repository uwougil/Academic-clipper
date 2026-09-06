# Milestone 002 — Code review hardening

状态：本地验证完成，等待 CI（2026-09-07）

## 目标

解决公开仓库 code review 提出的六项确定性与边界问题，不扩出版社、不改变现有输出模式：修复 TeX 转义、writer stale takeover 竞态、Nature hostname 不一致、CLI fetch 无边界、bridge port 延迟失败和单锚点引用范围丢失。

## 执行范围

- scientific TeX 外层 literal brace 转义幂等化，并让最终 Markdown validator 拒绝已知损坏模式。
- writer 使用唯一 claim 与稳定 ticket 顺序；stale cleanup 只作用于被判定的原 claim。
- Nature 支持范围严格统一为 `https://www.nature.com/articles/<id>`，table hydration 对不支持的 article URL fail closed。
- CLI article fetch 复用外部 URL 安全边界，增加 redirect scope、timeout、content type 和 body-size 限制。
- bridge 在配置加载阶段验证 TCP port 并输出无堆栈的用户错误。
- 引用 anchor 完整解析单值、列表和升序范围；非法或过大范围保留原文，不做部分转换。

## 验收标准

- [x] 六个 Issue 均有对应的失败复现和自动化回归测试。
- [x] `npm test` 全部通过（58 个测试）。
- [x] `npm run build` 成功。
- [x] committed golden paper validator 通过，且已修正已知 doubled-backslash artifact。
- [ ] GitHub Actions 的 Ubuntu Node 20/24 与 Windows Node 24 全部通过。
- [ ] Issues #1–#6 由包含 `Closes` trailer 的主分支提交关闭。

## 已知边界

- 仍只支持精确的 `www.nature.com` HTTPS article URL；不自动接受裸域或任意子域。
- DNS rebinding residual risk 不在本轮重构范围内。
- 引用范围单次最多展开 100 项，避免异常页面制造无界输出。
