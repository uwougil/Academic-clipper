# Agent D — transport / live verifier handoff

状态：最小完整链路 table replay seam 已交付；verifier 与 C integration 继续实现。此文不宣称 Issue #10 完成。

## 基线与 transport 审计

- Base / actual accepted main：`e85b1b809b56242b89b6313ce5d1165c745466bb`；本轮 `git fetch origin` / `git rev-parse origin/main` 再核对一致。
- [Main CI 37182993143](https://github.com/uwougil/Academic-clipper/actions/runs/37182993143) 与 [Secret scan 37182993093](https://github.com/uwougil/Academic-clipper/actions/runs/37182993093) 都 completed/success。
- Branch：`codex/issue-10-agent-d`；worktree：`C:/Users/guoli/.codex/worktrees/issue-10-live/academic-clipper`。
- A 原始依赖按 `20b48328114f195974e92827583b6bf5875beb27` → `4e0aec64f996a0090a7c74c14edd8ab5051d9639` → `3754d3a781459635e719859353fe3cbdf8741897` → `8f8a3dbf5d83c1475c41a197bcdfd1bf73834679` 原样选择。Schema/recipe `1.0.0`，sanitizer `nature-corpus-sanitizer/1.1.0`，serializer `nature-corpus-subtree/1.0.0`，projection `nature-corpus-projection/1.0.0`。Integrator 不重复选择 D 的 dependency copies。

实际审计（accepted base 的 `src/article-fetch.mjs`、`src/security.mjs`、`src/adapters/nature.mjs`、`src/clip.mjs`）：

| 边界 | 实际行为 |
| --- | --- |
| Article URL / redirect | 精确 HTTPS www.nature.com `/articles/<id>`；每跳同 requested article；manual，最多 5 redirects。 |
| DNS / SSRF | 每请求前 `lookup(hostname, {all:true,verbatim:true})` 验证全部地址；禁止 private / loopback / mapped-private / metadata 等；无 socket IP pinning，既有 residual risk 未扩大或虚称修复。 |
| Article body | `fetchNatureArticle` 30 s signal 保留到 body 完毕，25 MiB 声明/streamed limit；非 HTML/XHTML type 拒绝，缺少 type 仍按生产既有规则接受。 |
| Table URL / redirect | 同 origin、当前 article 的 `/tables/` 路径；scope 在 DNS/fetch 前验证；同样复用 safeFetchExternal/manual/max5。 |
| Table body | HTTP success 与 HTML type 检查；缺 type 按既有规则接受；20 s request signal，`response.text()` 没有显式 byte bound，也不能证明不服从 signal 的 injected body reader 会终止。Verifier 仅在自己的 injected bounded reader 中补齐 25 MiB/body timeout。 |
| Full clip injection | `hydrateNatureTables` 已接受 fetchImpl/resolveHostname；原 clipNature 未透传，因此需要下述最小 seam。 |
| Writer boundary | clipNature 仅返回 result；writePaper 是独立 export，verifier 不调用 writer、图下载或普通 papers output。 |

## 已交付 replay API

```javascript
clipNature({html, url, rawHtml = html, citationStyle = 'markdown', fetchImpl, resolveHostname})
```

只增加两个可选参数，原样传给既有 hydrateNatureTables。省略/undefined 时 destructuring 继续采用 production global fetch / DNS lookup；没有新增 parser、跳过 guards、全局 mutation 或 adapter 重构。调用者使用 A 的 `createReplay`（fresh Response/body，declared resolver）并在 finally / test teardown 检查 `assertClean`，即使 hydrator 把未知 operation 捕获为 warning，仍不能当 pass。

```javascript
const transport = createReplay({resources: await loadReplayResources(article, corpusRoot),
  dns: {'www.nature.com': [{address: '93.184.216.34', family: 4}]}});
try {
  const result = await clipNature({html, url: article.url, citationStyle: 'quarto',
    fetchImpl: transport.fetchImpl, resolveHostname: transport.resolveHostname});
  // C 独立 compareArticleResult / validators / semantic assertions。
} finally {
  transport.assertClean({expectedRequests, expectedDns});
}
```

`expectedRequests` 用 exact `{url,method:'GET',redirect:'manual'}`；`expectedDns` 用 `{hostname:'www.nature.com',all:true,verbatim:true}`，逐 hop 顺序。Scope rejected target 不能出现在 ledger。本文所在 commit 是 early seam SHA，使用 `git log --format=%H -- src/clip.mjs` 找到；parent/C 同时接收精确 SHA。

## 当前 checks 与剩余交接

Exact commands：`npm ci`（65 packages，0 vulnerabilities）；`node --test test/nature-corpus-live.test.mjs test/network-boundaries.test.mjs test/infrastructure-hardening.test.mjs`（32 pass / 0 fail / 0 skip）；`git diff --check`（exit 0）。首次 mocked declaration 把 inline body/location 写成了 manifest 而非 createReplay 输入形状，三项测试失败；更正为 A 实际 bodyBytes/headers API 后上述最终结果通过，没有修改 production guards 或 fixture 来使结果通过。

Early tests 是明确 synthetic existing unit fixture，仅 transport replay / default equivalence 证据，不作为 B article admission 或 source oracle。实际 B source contracts 尚需 C 独立消费。D 尚未完成 mocked live taxonomy/CLI/retries/bounds、C compare integration 与最终 full verification；live 未运行。无需 canonical 修订，parser defects 由独立 bug agents 负责。
