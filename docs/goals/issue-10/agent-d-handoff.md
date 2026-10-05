# Agent D — transport / live verifier handoff

状态：`DEPENDENCY_PENDING`。最小完整链路 table replay seam、verifier 与 mocked transport/CLI checkpoint 已可供独立审查。当前 accepted base 上全部 9 篇的实际 C source comparison 仍失败；不计入通过覆盖。此文不宣称 Agent D 最终验收或 Issue #10 完成。

## 基线与 transport 审计

- Base / actual accepted main：`e85b1b809b56242b89b6313ce5d1165c745466bb`；本轮 `git fetch origin` / `git rev-parse origin/main` 再核对一致。
- [Main CI 37182993143](https://github.com/uwougil/Academic-clipper/actions/runs/37182993143) 与 [Secret scan 37182993093](https://github.com/uwougil/Academic-clipper/actions/runs/37182993093) 都 completed/success。
- Branch：`codex/issue-10-agent-d`；worktree：`C:/Users/guoli/.codex/worktrees/issue-10-live/academic-clipper`。
- Base 包含 planning PR #27 commit `5971ebfbe288e0efed4abef21469f41e2cabb05f`（`git merge-base --is-ancestor` exit 0）、v0.3.2 release `b489e381620c44b4b3c9e520deca99e154d39f77` 与 Undici update `45c2b5e7de73af648543130decf5c2b573f0aeb4`。历史 release [Main CI 37035169455](https://github.com/uwougil/Academic-clipper/actions/runs/37035169455) 已成功；启动时仍以最新 accepted main 的 CI 为准。
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

`expectedRequests` 用 exact `{url,method:'GET',redirect:'manual'}`；`expectedDns` 用 `{hostname:'www.nature.com',all:true,verbatim:true}`，逐 hop 顺序。Scope rejected target 不能出现在 ledger。Early seam SHA 为 `85862de8e835a42ee198e2620be85a207a083e1d`，parent/C 已原样消费。

## Ordered authored commits 与依赖

Integrator 选择 D authored commits：

| 顺序 | SHA | Files |
| --- | --- | --- |
| 1 | `85862de8e835a42ee198e2620be85a207a083e1d` | `src/clip.mjs` 两行最小参数透传、初始 `test/nature-corpus-live.test.mjs`、early handoff。 |
| 2 | `4fe27f4a5702df767f9842972219a5be8fa3fab4` | `scripts/verify-nature-corpus-live.mjs` 与完整 `test/nature-corpus-live.test.mjs`（39 个 D tests）。 |
| 3 | 本文最终更新 commit：`git log -1 --format=%H -- docs/goals/issue-10/agent-d-handoff.md` | 仅 durable handoff；精确 SHA 同时提供给 parent。 |

不重复选择 D 的 dependency copies：A 原件上述四个 SHA 对应 copies `ca8f64ae4b097d484b9a7697da04caf4c848df28` → `8b8edd305f07424ab5be6b361ba641e63d5c351d` → `cdddb39caba4d3c7a08ce7c12c041b4b4fcec536` → `0abc0da4c3901f9cf85dc079587ef64efd5d35a4`。B final `143fc77ebdc4bf15dd1cdca63afcddb91e6b55f5` 原样 snapshot 是 `9d45a5e3fe1a0cd707cab52cecc13a787b222727`，只消费 B-owned manifest、fixtures、corpus guide、B handoff。没有修改 source input。

C actual helper 的 source originals / dependency copies：`a896ee7e1fc4700ed5ce6dcbfb46fa594c27cf47` / `56e6ddf42dc0f72b171fc3638582e8944114225e`；`bc790819d476f7e25f7eaf4acb4d56dc73f295b9` / `9d4624fdd49c6ee633205b7738da35a3c0975181`；最终 `5d305fa72effae2bc34770e339c1e30b3ae07d19` / `fa6f0547634dae836988595ee5e2927fd4470b5d`。后二者仅恢复 C helper 原件。最终 helper 的 Git blob 是 `d9f823716f93f1135b1e2b2acb3436b7e7955a4c`；git blob bytes 为 46566，SHA-256 `17ecf2bdef3d3fcdf2590e649c655b1d58c7fa5f405f7cdfba2da4690148eec5`。

C `ASSERTION_VERSION='1.0.0'`，10 个 strict registry consumers / 85 source expectations；调用实际 `compareArticleResult(article,result,{sourceDocument,citationStyle})`，sourceDocument 是独立、只读 retained projection DOM，绝非 result.cleanedHtml。检查返回 version 与每个 ordered `[id,assertionId]`，失败 facts 全部保留。A sanitizer/hash/replay、C assertions 均不复制、不修改。

## Verifier / deadline / retry behavior

直接命令（package scripts 由 integrator 负责）：

```text
node scripts/verify-nature-corpus-live.mjs --article <id> --citation-style markdown --json --timeout 30000
```

支持 `--article`、`--citation-style markdown|quarto|links`、`--json`、`--timeout`、`--help`；timeout 是 1–120000 ms 的正整数，默认 30000 ms。Unknown/repeated/missing/illegal options 与 unknown ID 返回 64。Report stdout-only，没有 output option；普通 CI 不运行 live。Exports 为 `parseOptions`、`runVerifier`、`createBoundedTransport`、`classifyLive`、`exitCode`、`retryAfterMs`、`main` 与 version/bounds constants；verifier version `nature-corpus-live/1.0.0`。

先验整个 manifest 的 schema/path/hash/recipe/idempotence，再完成所有 selected frozen full-clip/C assertions，之后才允许任何 live article request。失败 article 不进入 live。Programmatic transport 必须同时提供 fetch/resolver，单边注入不退回 live default。生产 `fetchNatureArticle` / `safeFetchExternal` / `clipNature` / Defuddle / normalizers / renderers / validators 继续工作；没有第二 parser/fetch、global patch 或 writer。

Live identity 使用 exact canonical、citation_doi/article JSON-LD DOI identity，禁止正文 substring；要求 `.c-article-body` 至少两个 paragraphs / 200 字符，另识别 challenge/access/preview/structured restriction，正常 navigation login link 不误判。执行 full-page clip/四种 production validators，再使用 frozen A recipe/version 投影 article 与各个 table，执行 C comparison。Full-page 与 retained validators 分列；仅比较同 retained projection 的 structure/payload signatures，不拿 full-page counts/hash 对比 excerpt。

每次 DNS resolution 单独受 selected timeout 限制。每个 HTTP exchange 的 selected timer 覆盖 headers 与 streaming body，并与 production signal 合并；article 保留其 selected article signal，table 保留跨 redirect hops 共享的既有 20 s signal。DNS 接口不接收该 parent signal，因此不声称 selected timeout 是整个 DNS/redirect/parse cycle 的单一 aggregate deadline。Canonical 要求 table body bound/timeout，没有要求新增整个 table cycle 的 selected aggregate timer；parent 已确认这一解释。Combined redirect/final-body mocks 验证 same-article guards、共享 parent signal、declared/streamed overflow 和 stalled body cancellation。

Reader 先检查 declared length，再按 chunks 累计最多 25 MiB；read 与 abort race，失败 cancel/release，不等待永不完成的 cancel promise，拒绝不能增量限制的 injected body。完整 clip 的实际 table `25 MiB + 1` declared oversize 仍失败，不能被 hydration fallback 隐去；mini-limit streaming mocks 验证同一计数/cancellation 算法。缺 content-type 保持生产规则，有 type 时 verifier 只接受 MIME HTML/XHTML。

默认 sequential，transient HTTP 408/429/500/502/503/504 和识别的 temporary DNS/connection/timeout 最多两次 retry（总三 attempts）；Retry-After 支持秒/日期，最多 5000 ms，0 不改成默认 backoff。Access evidence、permanent body/type guard 禁止 retry，即使同时有 timeout 或 503。Table retry 使用同一 captured article 的 fresh production clip/hydration，稳定 tables 可能随 full clip 再请求；不重复 fetch article。不 retry parser exception 或新 validator failure。现场 inline table 仍需 frozen external resource 比较时，以本 attempt 的请求记录避免同轮二次抓取，先前 503 不作为可用 capture，也不阻止下一轮 transient retry；额外 mock 覆盖恢复与三次上限。

JSON 保留 article/phase/cause/severity、失败 assertions/validators、warning facts、双方 signatures/C semantic summaries、attempts、HTTP/DNS/timeout facts；额外重复 declared warning 也视为 unexpected。只记录 URL public origin/path，不输出 redirect query access code、auth/cookie headers、full capture。Body 只在内存中投影/hash；observedAt/duration 不作为离线 oracle。Unknown replay operation 即使被 fallback 捕获，最终仍是 integrity failure。

## 分类、退出码与真实失败

| Cause | Severity / exit | 证据 / mocks |
| --- | --- | --- |
| `PARSER_REGRESSION` | failure / 1 | 未改 frozen fixture 违反已建立 source oracle，见下表。 |
| `FIXTURE_INTEGRITY_FAILURE` | failure / 1 | Hash/path/schema/recipe/resource 或 undeclared replay operation。 |
| `NETWORK_FAILURE` | incomplete / 2 | Private DNS、HTTP/connection、DNS/header/body timeout、body cap、redirect scope。 |
| `ACCESS_BLOCKED` | incomplete / 2 | 401/403、idp/access redirect、challenge/preview；不 follow / retry。 |
| `FIXTURE_DRIFT` | warning / 3 | Offline 通过，同 retained structure 的 payload 改变。 |
| `UPSTREAM_MARKUP_CHANGE` | warning / 3 | 正文可用，相关 wrapper/selector/metadata representation 改变。 |
| `UNCLASSIFIED_FAILURE` | failure / 1 | 新 live parse error、comparison execution error、unexpected warning、markup difference 与新 validator failure 同时存在；不擅自断言因果。 |
| `PASS` | pass / 0 | Assertions/validators 通过，无 warning；三种 dialect 的 explicit synthetic existing unit fixture。 |
| `EXPECTED_WARNING` | warning / 0 | Assertions 通过，仅 declared fallback/absence warning。 |

CLI misuse 为 `USAGE_ERROR` / failure / 64；mixed precedence 64 → 1 → 2 → 3 → 0，保留全部 results。新 live parse failure 不自动称 regression；network incomplete 不叫 parser pass。Synthetic controller/transport variants 明确标明 synthetic，不作为 B admission 或 scholarly source evidence。

B exact source + A replay + C actual strict API 的当前 markdown preflight：85 expectations，57 pass / 28 fail，全部 9 article result 是 `PARSER_REGRESSION` / `offline-assertions`；aggregate exit 1。注入的 live ledger 是 0 requests、0 resolutions、unexpected []：

| Article ID | Failed expectation IDs |
| --- | --- |
| `s41586-026-10401-1` | source-tables-v1 |
| `s41534-023-00746-0` | source-figures-v1, source-citations-v1, source-inline-v1, source-crossrefs-v1 |
| `s41586-021-03819-2` | source-figures-v1, source-citations-v1 |
| `s41586-020-2012-7` | source-crossrefs-v1, source-tables-v1 |
| `s41586-023-05896-x` | source-figures-v1 |
| `s41586-023-06735-9` | source-equations-v1, source-figures-v1, source-citations-v1, source-inline-v1 |
| `s41467-023-44030-3` | source-equations-v1, source-figures-v1, source-citations-v1, source-inline-v1, source-crossrefs-v1 |
| `s41586-022-04755-5` | source-equations-v1, source-figures-v1, source-citations-v1, source-inline-v1, source-crossrefs-v1, source-tables-v1 |
| `s41598-018-38309-5` | source-figures-v1, source-citations-v1, source-inline-v1 |

测试 `frozen-source integration consumes actual C API and records all9 entries without live network fallback` 重现这一 checkpoint；没有将 failing required source expectation 改成 PASS。真实 live-comparison 阶段被 source preflight 阻断；synthetic mocks 执行了完整 live/projection 路径，prerequisites landed 后须再次对真实来源执行。

Source oracle/provenance、13 retained hashes、coverage roles 与原始 DOM positions 归 B/C，见 [B handoff](agent-b-handoff.md)、manifest 与各 source/parser/table defect evidence。C 已独立验证 85/85 source oracle、13 hash/recipe projections、9 rights notices 与 4 tables，最终 helper 的三 dialect mandatory suite 仍为 171 pass / 84 fail（255 cases）。Root 正协调独立 parser bug Work Contracts；D 不修 parser、不改 input/expectations。No proposed canonical/spec changes。

## Exact checks 与 unblocking

本 worktree，Node v24.14.1，committed lockfile：

| Command | Result |
| --- | --- |
| `npm ci` | 65 packages，0 vulnerabilities，exit 0（初始 setup；此后没有 dependency changes）。 |
| `node --check scripts/verify-nature-corpus-live.mjs` | exit 0。 |
| `node --test test/nature-corpus-live.test.mjs test/network-boundaries.test.mjs test/infrastructure-hardening.test.mjs test/bridge-security.test.mjs` | 68 pass / 0 fail / 0 skip，exit 0；含 39 个 D tests。 |
| `npm test` | 327 pass / 0 fail / 0 skip，exit 0。 |
| `npm run build` | exit 0，dist/extension 为 ignored build output。 |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit 0；13 display equations、50 references，全部 validators/scientific fragments 有效。 |
| `git diff --check` / staged check | exit 0；CRLF advisory 不是 diff error。 |
| `git diff --name-only e85b1b8 -- AGENTS.md docs/PRD.md docs/EDD.md docs/specs/issue-10-nature-corpus.md package.json package-lock.json src/security.mjs src/adapters/nature.mjs src/article-fetch.mjs src/writer.mjs papers .github` | 空，禁止边界未修改。 |

这些 pass 验证 verifier 正确保留失败，绝非 85 source assertions 已通过。D 只消费 C helper，没有搬 C 的 mandatory test/nature-corpus.test.mjs / golden semantic tests；integrator 必须消费完整 C authored delivery 并执行真实 required suite，不能用 D mocks 替代。

Live Nature acquisition 未运行；没有使用 Nature cookie/private session/account access，没有 tracked full captures、credentials、generated output、golden 或 corpus fixture changes。D tests 使用 BOTH injected fetch/resolver 与 A declaration/ledger，不发生 ordinary DNS/HTTP；writer import/call audit、fixture/golden bytes 和 output directory unchanged checks 通过。现有 writer tests 仅在自己的临时目录检查原 behavior。

C/integrator unblocking：先完成独立 parser prerequisites，并在 accepted main 获得成功 Main CI；再消费 exact final A/B/C interfaces、resume SAME D 审查/复验。全部 85 source expectations × 三 dialect 必须执行/通过，required consumers/coverage 无 blocked；D 再验证完整真实 source-backed clip/projection 的所有 article results 为 PASS/EXPECTED_WARNING，guard/replay ledgers clean。最后独立 reviewer 审查 D/integration，执行 repository required commands、CI matrix 与 Secret scan。Opt-in live availability 单列，不替代 gates。D 没有 ordinary Issue #10 PR 或 merge。
