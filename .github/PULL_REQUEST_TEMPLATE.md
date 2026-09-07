## Issue

<!-- 如果关联 Issue，请填写 Closes #123；否则填写“非 Issue-backed”。 -->

## 变更摘要

<!-- 改了什么，为什么？请说明对 PRD/EDD 或里程碑的影响。 -->

## 验证

- [ ] `npm ci`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`
- [ ] CI 通过

## 交接与安全

- [ ] Diff 不包含密钥、本地配置、原始页面快照或非预期生成文件。
- [ ] 任何 PRD/EDD 语义变更都已获得明确的人类决策，且意图文档已同步更新。
- [ ] 本 PR 已记录足够的范围与证据，使其他 agent 无需私聊上下文即可继续工作。
