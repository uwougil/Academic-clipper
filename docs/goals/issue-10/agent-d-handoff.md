# Agent D — transport / live verifier handoff

状态：`DEPENDENCY_PENDING`。最小完整链路 table replay seam、verifier 与 mocked transport/CLI checkpoint 已可供独立审查。当前 latest consumed accepted main 为 `ac86b2f`，reviewed C helper `ec53d65` 的实际 blob 仍为 `e3ff087`。固定 b88653a 的 69 个 D/transport/security tests 全通过；随后仅在 accepted ac86b2f 定点复跑 markdown 九篇 classification，85 个 source expectations 为 83 pass / 2 fail，5 篇 frozen parser/validator failure，另 4 篇完成 source-backed mocked comparison（2 PASS / 2 EXPECTED_WARNING）。这些 test passes 证明失败被保留，不表示 corpus gate 通过。本轮没有更新三 dialect 255-case 全量验收，不宣称 Agent D 最终验收或 Issue #10 完成。

## 基线与 transport 审计

- Initial base：`e85b1b809b56242b89b6313ce5d1165c745466bb`；初次 `git fetch origin` / `git rev-parse origin/main` 核对一致。
- [Main CI 37182993143](https://github.com/uwougil/Academic-clipper/actions/runs/37182993143) 与 [Secret scan 37182993093](https://github.com/uwougil/Academic-clipper/actions/runs/37182993093) 都 completed/success。
- Branch：`codex/issue-10-agent-d`；worktree：`C:/Users/guoli/.codex/worktrees/issue-10-live/academic-clipper`。
- Resume accepted base：`4783291dcb8a5d0ac62dc2e5d314ba91f6c6d9e2`（PR #46/#49 prerequisites）。[Main CI 37272529095](https://github.com/uwougil/Academic-clipper/actions/runs/37272529095) 和 [Secret scan 37272529070](https://github.com/uwougil/Academic-clipper/actions/runs/37272529070) completed/success，D 已独立复查。
- Historical resume main：`e2d32e9ec819692a1f08075636c3a168f15ad20b`（PR #52 table MathJax）。开始 resume 时该 Main CI pending，D 未采用；收到 parent acceptance notice 并独立核对 [Main CI 37278003744](https://github.com/uwougil/Academic-clipper/actions/runs/37278003744) 三 jobs `111659279964` / `111659280091` / `111659280101` 与 [Secret scan 37278003787](https://github.com/uwougil/Academic-clipper/actions/runs/37278003787) 全部 success 后才采用。当时未消费尚未 accepted 的 Unit #48 修复。
- Fixed 69-test scope base：`b88653a4be3dcf30cd487365d033f1e7a7c3da0a`（后续 accepted scientific-units / literal-brackets / sparse figure alt prerequisites）。D 独立核对 [Main CI 37670512607](https://github.com/uwougil/Academic-clipper/actions/runs/37670512607) 的三个 jobs `112960767643` / `112960767857` / `112960768046` 与 [Secret scan 37670512896](https://github.com/uwougil/Academic-clipper/actions/runs/37670512896) 全部 completed/success。PR #59 的 Main CI 当时尚未 accepted，因此没有插入或重启该固定检查。
- Latest consumed accepted main：`ac86b2fa509653dfeb43b968472ce6280a51de2c`（PR #59 / Issue #56 scientific citation）。b886 receipt 已独立 commit/push 后才采用；D 独立 `gh run view` 复查 [Main CI 37681190063](https://github.com/uwougil/Academic-clipper/actions/runs/37681190063) 的 jobs `112997400634` / `112997400858` / `112997401004` 与 [Secret scan 37681189875](https://github.com/uwougil/Academic-clipper/actions/runs/37681189875) / Gitleaks `112997360655`，均 same ac86 SHA、completed/success。只追加九篇 markdown source classification；未重复 69 mocks/security 或 C 27 styles。
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
| 3 | `3de7c52c42c59d9b86dce57c04a516f19d0c0e43` | Initial durable handoff。 |
| 4 | `e204dedf1b5b5f1dfe237f8f6417c77de89ee110` | Historical e2d32e9 / C 6c38ad8 resume evidence。 |
| 5 | `81179335fde0ca982377a608a6d53ab1e10c8c39` | 仅 D tests：拒绝 passing provider 的错误 version / 缺失、重排、替换 execution records；从既有一次九篇实际 C comparison 收集 TAP receipt，不额外执行 corpus。 |
| 6 | `54ed8f52f16ec2ad2bb9b38382b0c4fcf98264df` | Doc-only 固定 b88653a / C ec53d65 evidence，先于后续 ac86 dependency merge commit/push。 |
| 7 | 本文更新 commit：`git log -1 --format=%H -- docs/goals/issue-10/agent-d-handoff.md` | Doc-only accepted ac86b2f 定点 receipt；精确 SHA 同时提供给 parent。 |

不重复选择 D 的 dependency copies：A 原件上述四个 SHA 对应 copies `ca8f64ae4b097d484b9a7697da04caf4c848df28` → `8b8edd305f07424ab5be6b361ba641e63d5c351d` → `cdddb39caba4d3c7a08ce7c12c041b4b4fcec536` → `0abc0da4c3901f9cf85dc079587ef64efd5d35a4`。B final `143fc77ebdc4bf15dd1cdca63afcddb91e6b55f5` 原样 snapshot 是 `9d45a5e3fe1a0cd707cab52cecc13a787b222727`，只消费 B-owned manifest、fixtures、corpus guide、B handoff。没有修改 source input。

C helper 初始 source originals / dependency copies：`a896ee7e1fc4700ed5ce6dcbfb46fa594c27cf47` / `56e6ddf42dc0f72b171fc3638582e8944114225e`；`bc790819d476f7e25f7eaf4acb4d56dc73f295b9` / `9d4624fdd49c6ee633205b7738da35a3c0975181`；`5d305fa72effae2bc34770e339c1e30b3ae07d19` / `fa6f0547634dae836988595ee5e2927fd4470b5d`。旧 5d helper 的 Git blob 是 `d9f823716f93f1135b1e2b2acb3436b7e7955a4c`，46566 bytes，SHA-256 `17ecf2bdef3d3fcdf2590e649c655b1d58c7fa5f405f7cdfba2da4690148eec5`；仅保留为历史 evidence，不再作为最新验证接口。

Historical resume 消费 reviewed strict C authored helper `6c38ad8156c6f5e3a1b7b97729640158b7772c7b`（C final `79ae944ce55bcdf753ade1851587688463a865be`），原样 dependency copy `c0b18b5dc9b72d7078ed233e7d8baefe4edf3f4a`。当时 Git blob `7024870f4da896eb4ff2130cfd45991f00139067`，48425 git bytes，SHA-256 `f6de33be4cce85fbf738f784448f5a0f59ea3d0f886399ca48e09cdd20963de3`；加强完整 rendered caption 内部 payload / 每次 cross-reference occurrence，没有修改 B expectations。仅保留为历史 receipt。

本轮只原样消费 C core `ec53d6578c3103a95c9334f71f5ef14ef597303b` 的 `scripts/lib/nature-corpus-assertions.mjs`，含缺失的 reviewed 02c/dbe/ec53 helper delta；没有搬 C tests、receipt cache 或 C branch。Dependency copy `17bd200b51c288277494877eadd24b0f1ac3680f`。实际 Git blob **`e3ff08708d0aee6f364e44a881e98207f6dc6a7b`**，50693 Git bytes，SHA-256 **`ab23fa7ef25b0a24240929d8428d37300c24979ad15ad9ec1e4a5cb75d1150ff`**；不是旧 7024 helper，也没有凭共同 1.0.0 label 将不同文件视为相同。C doc-only `3006f0f7381ba843efc3c17b98370194b0a04017` 与独立 review packet `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-review/c-ec53d65-3006f0f-review.md` 已读；packet 15416 bytes，SHA-256 `448aa60401be67c205974b6a10e69367be45534dcd053e32d2deea0a2a94a0aa`，parent 已接受其零 blocker 结论。

C packet 的旧完整三 dialect 基线是 238/255 pass、17 fail；新 helper 只重跑六个 Materials/Chemistry combinations，合并未变范围后是 241 pass / 14 fail，`newFullRun=false`。这些是 C 在其 recorded production base 上的历史/局部结果，不是本轮 b88653a 的完整 255-case acceptance。D 不复跑 C 的 13 source audits、cache hook 或 27 full clips，也不把其中 failed consumers 改为 warning。

Accepted-main dependency merge commits：`aebdc46f793d61f50f7468e714cf0f0ffbc92f7f`（4783291）、`ceb290cc82483feff020bed9a002abce45dfa48f`（e2d32e9）、`3d9b74b24f33a031341fcad4e9198d21e5d3f565`（b88653a）与 `7707cd5878f9d38e1d87e1356338faab09400ea9`（ac86b2f）。Integrator 不选择上述 C copies 或 main merge copies；从最新 accepted main 选择 D authored commits 与 C 原件。`git diff ac86b2f -- src/clip.mjs src/adapters/nature.mjs src/security.mjs src/article-fetch.mjs` 仍只有原始 clip 两行 seam。D verifier 没有 migration delta；只增加上述 D test/receipt。

C `ASSERTION_VERSION='1.0.0'`，10 个 strict registry consumers / 85 source expectations；API `compareArticleResult`、`semanticSummary`、`runProductionValidators`、`auditSourceOracle` 等保持。调用实际 `compareArticleResult(article,result,{sourceDocument,citationStyle})`，bibliography 采用 C 自身默认的 `referencesBib(result.references)`；sourceDocument 是独立、只读 retained projection DOM，绝非 result.cleanedHtml。检查返回 version 与每个 ordered `[id,assertionId]`，失败 facts 全部保留。C exception 是 `UNCLASSIFIED_FAILURE`；错误 version / 缺失、重排、替换执行记录是 `FIXTURE_INTEGRITY_FAILURE`，两者都在离线阶段以 exit 1 阻断、零 live operations。A sanitizer/hash/replay、C assertions 不重复实现或修改。

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

Initial e85b1b8 + C 5d helper 的 markdown preflight：85 expectations，57 pass / 28 fail，全部 9 article result 是 `PARSER_REGRESSION` / `offline-assertions`；aggregate exit 1，注入 live ledger 为 0 requests、0 resolutions、unexpected []。以下为历史 checkpoint，最新结果见下一节：

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

测试 `frozen-source integration consumes actual C API and records all9 entries without live network fallback` 使用当前实际 helper 重现当前 checkpoint；没有将 failing required source expectation 改成 PASS。每个 failed article 的 live-comparison 阶段都被 source preflight 阻断；通过条目执行 source-backed mocked full/projection 路径。

Source oracle/provenance、13 retained hashes、coverage roles 与原始 DOM positions 归 B/C，见 [B handoff](agent-b-handoff.md)、manifest 与各 source/parser/table defect evidence。C 已独立验证 85/85 source oracle、13 hash/recipe projections、9 rights notices 与 4 tables；初始 e85/旧 helper mandatory suite 为 171 pass / 84 fail（255 cases），不代表 resumed accepted main 的最新结果。Root 正协调独立 parser bug Work Contracts；D 不修 parser、不改 input/expectations。No proposed canonical/spec changes。

## Resume source replay：accepted e2d32e9 + strict C 6c38ad8

所有 9 篇 × markdown/quarto/links 使用 B 原始 fixtures、A fresh replay 与 current strict C API，三次 aggregate exit 均为 1。每次 85 个 expectation execution records 中 72 pass / 13 fail；但另有 validator failures，仍是 8 个 article offline-assertions / PARSER_REGRESSION、仅 `s41586-026-10401-1` 为 live-comparison / PASS。这里的 live-comparison 输入来自 B excerpt 的明确 mock HTTP，未取得 fresh live full page；仅证明实际 source consumers、production pipeline、同 projection 和 declared table replay 正常连接，不声称站点当前可访问。

| Article | Remaining source failures / validator |
| --- | --- |
| `s41586-026-10401-1` | 三 dialect 全部 PASS；完整正文与 table projection signatures 一致，无 warning。 |
| `s41534-023-00746-0` | citations 的 ordered clusters / clusters 37,57，inline case 16 paragraph/sourceTeX；quarto/links 另有 crossrefs internal 43,44；math validator 失败。 |
| `s41586-021-03819-2` | Source expectations 全通过；math validator 失败，仍为 PARSER_REGRESSION。 |
| `s41586-020-2012-7` | Source expectations 全通过、declared absence/table fallback warnings 精确匹配；math validator 失败，仍为 PARSER_REGRESSION。 |
| `s41586-023-05896-x` | figures 1–3 shortAlt 不满足 source gate；无 validator failure。 |
| `s41586-023-06735-9` | displayMath count / equation 0 renderedTeX、citation cluster 60 sourceContext；math validator 失败，links 另有 rawHtml validator 失败。 |
| `s41467-023-44030-3` | displayMath count、figure 4 complete caption payload/rendered payload、ordered citations / clusters 40,49；math validator 失败。 |
| `s41586-022-04755-5` | displayMath count / equations 0–7 renderedTeX、figure 1 caption payload、crossref internal 8 readable/rendered occurrence；markdown 另有 citation cluster 50 sourceContext；math validator 失败。PR #52 修复后 source-tables-v1 全通过。 |
| `s41598-018-38309-5` | figures 0–3 complete rendered caption payload；math validator 失败。 |

每次只有两次声明的 mocked HTTP：article `s41586-026-10401-1` 与其 `/tables/1`，对应两次 mocked DNS `{hostname:'www.nature.com',all:true,verbatim:true}`，unexpected []。其他 8 篇 live ledger 为零；ordinary/fresh DNS/HTTP 全为零，writer 调用为零。没有把 matches 的 expected warnings 当作覆盖 source/validator failure 的理由。

## 固定单轮 receipt：accepted b88653a + 实际 C ec53d65

2026-10-07 固定上述 base/helper，只跑一次下述 focused command。既有九篇 integration test 包装实际 `compareArticleResult` 以保存原返回值，不替换 assertions 或 validators；其最先九次调用按 manifest 顺序执行 85 个 source expectations。Markdown 为 82 pass / 3 fail，controller business exit 1；这是 **9 篇 / markdown 一种 dialect**，不代替 C 的 **85 × 3 = 255** required suite。测试进程 exit 0 表示分类/阻断符合规范，不表示 source failures 通过。

| Article ID | Actual markdown result / remaining facts |
| --- | --- |
| `s41586-026-10401-1` | Mocked live-comparison / PASS；source/四 validators 通过；0 warnings。 |
| `s41534-023-00746-0` | Offline PARSER_REGRESSION；source-citations-v1 的 semantic/rendered ordered clusters 与 clusters 37,57；math validator 失败；0 warnings。 |
| `s41586-021-03819-2` | Source expectations 全通过，math validator 失败，仍为 offline PARSER_REGRESSION；1 declared `No equation nodes were detected.` warning 精确匹配。 |
| `s41586-020-2012-7` | Mocked live-comparison / EXPECTED_WARNING；source/四 validators 通过；恰好 2 declared warnings：`No equation nodes were detected.`、`Extended Data Table 1: The full-size Nature page did not expose HTML table cells; retained the absolute URL.`；`/tables/1` 为 source-backed 200 no-cell response。 |
| `s41586-023-05896-x` | Mocked live-comparison / EXPECTED_WARNING；source/四 validators 通过；恰好 1 declared `No equation nodes were detected.`；无 table resources。 |
| `s41586-023-06735-9` | Offline PARSER_REGRESSION；source-equations-v1 的 rendered.displayMath.count / equations[0].renderedTeX；math validator 失败；0 warnings。 |
| `s41467-023-44030-3` | Offline PARSER_REGRESSION；source-citations-v1 的 semantic/rendered ordered clusters 与 cluster 40；math validator 失败；1 declared `No equation nodes were detected.` 精确匹配。 |
| `s41586-022-04755-5` | Source expectations 全通过，math validator 失败，仍为 offline PARSER_REGRESSION；0 warnings。 |
| `s41598-018-38309-5` | Mocked live-comparison / PASS；source/四 validators 通过；0 warnings。 |

所有 expected warnings 的 unexpected/missing 都为空。五篇失败仍为 failure，不能因 warning 匹配而放行。四篇完成比对者的 full/projection signatures 一致；HTTP bodies 全是读取 frozen B excerpts 后显式声明的 mock Response，**没有访问当前 Nature 站点**。

Live-controller mock ledger 依次为 golden article + `/tables/1`、COVID article + `/tables/1`、Pangenome article、SR article，全部 `GET` / `redirect:'manual'`：6 mocked HTTP、6 mocked DNS `{hostname:'www.nature.com',all:true,verbatim:true}`，unexpected []。五个失败 article 的 live-controller ledger 为零。Separate offline/projected replay ledgers 也经 finally `assertClean()`；普通/fresh DNS/HTTP 为零。Verifier 没有 writer import/call；artifact bytes/default inline-path equivalence、undeclared-operation fail-after-fallback、原 production guards 都由同轮 tests/audit 检查。现有 writer tests 在自己的临时目录验证既有行为，不是 verifier 写 paper。

外部 TAP log：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-D-b886-e3ff-20261007.tap`，20583 bytes，SHA-256 `8ceedfc77d766a54bf4a6e18443b9b07a876e6ff996c09aff2fa56174d747f4d`，mtime `2026-10-07T20:25:06.063Z`。包含同轮 85 execution counts、九篇分类/failed paths/invalid validators、完整 declared warning facts 和 ledger JSON。Node v24.14.1；69 pass / 0 fail / 0 skip / 0 cancelled，46244.0566 ms；40 个 D tests + 29 个既有 tests。

待独立审查的 D verifier 文件仍为原始 authored implementation：Git blob `0855d3292d2805e736b5006442c757f6fe604e99`，34634 Git bytes，SHA-256 `621ee516c0b548800b02cb23405a1f8c473e56d27999f9c91246fa6ac20ac7f2`。本轮 D test commit `8117933` 的 Git blob `16aacbda29b1ff3858ddbbbf5d5ec7146d371f49`，54826 Git bytes，SHA-256 `d3b96f2aa2ac4f841a35392413eeee4ab01ca96f72b8754899b0f0d33b982801`。Hash 使用 `git show HEAD:<path>` 的 bytes；不混用工作树 CRLF bytes。本轮核验文件身份和执行证据，D 完整实现尚未经过独立 reviewer 验收。

## 追加定点 receipt：accepted ac86b2f + 相同实际 C ec53d65

独立确认 ac86 Main CI / Secret scan success 后，仅执行 `node --test --test-reporter=tap --test-name-pattern='^frozen-source integration consumes actual C API' test/nature-corpus-live.test.mjs`，仍由相同实际 helper 执行九篇 markdown source consumers，再对 ready entries 做同 frozen projection 的明确 HTTP mock comparison。D verifier/test/C helper/B/A inputs 相对 authored `8117933` 全部未变。Filtered test 为 1 pass / 0 fail / 0 skip / exit 0，29386.8732 ms；没有运行其余 D mocks/security、C mandatory tests 或任何 fresh live capture。

Actual markdown executions 为 **83/85 pass、2 fail**，controller business exit **1**，五篇 offline PARSER_REGRESSION 与四篇 mocked live-comparison（2 PASS / 2 EXPECTED_WARNING）数量未变。剩余 source failures：

| Article | Actual source failure paths / gate |
| --- | --- |
| `s41534-023-00746-0` | 仅 `source-citations-v1` 的 `rendered.orderedSourceClusters` 仍 FAIL；先前 semantic ordered clusters 和 individual clusters 37,57 已 PASS。Math validator 仍 FAIL，article 未放行。 |
| `s41586-023-06735-9` | `source-equations-v1` 的 `rendered.displayMath.count` 与 `equations[0].renderedTeX` 仍 FAIL；math validator 仍 FAIL。 |
| `s41467-023-44030-3` | Source citations / 所有 source expectations 已 PASS；math validator 仍 FAIL，article 仍离线阻断。 |
| `s41586-021-03819-2`、`s41586-022-04755-5` | Source expectations 全 PASS；各自 math validator 仍 FAIL，article 仍离线阻断。 |

没有为 remaining rendered-order failure 猜测根因或改 expected data。其余 source records、四篇通过者 full/projection comparison、所有九篇 declared warning facts/数量与 b886 上表一致；unexpected/missing 为空。Mock ledger 仍按相同顺序只有 6 HTTP / 6 DNS、unexpected []；五篇失败 article 没有 live-controller requests，verifier fresh/ordinary Nature DNS/HTTP 和 writer calls 为零。独立 C 后续正式 255-case 全量 results 仍是最终 gate，不能由这一次 markdown diagnostic 替代。

外部追加 TAP log：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-D-ac86-e3ff-20261007.tap`，4720 bytes，SHA-256 `0f21668f97ba0ad74dbce474ce8d308cadd3add91e91cded4b7438948406f400`，mtime `2026-10-07T20:32:44.511Z`。日志保留同轮九篇 classifications/failed paths/validators、完整 warnings 和 ledger；不是更换 base 后沿用旧 receipt。

## Exact checks 与 unblocking

本 worktree，Node v24.14.1，committed lockfile。Initial e85 checkpoint 的 exact checks：

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

Resume exact checks（latest accepted e2d32e9 / current C 6c38ad8，源码与 D verifier/tests 未修改）：

| Command | Result |
| --- | --- |
| `node --test test/nature-corpus-live.test.mjs test/network-boundaries.test.mjs test/infrastructure-hardening.test.mjs test/bridge-security.test.mjs` | 68 pass / 0 fail / 0 skip，exit 0。4783291 与 e2d32e9 分别执行，均通过。 |
| `npm test` | 4783291：365 pass；e2d32e9：384 pass；均 0 fail / 0 skip / exit 0。 |
| `npm run build` | e2d32e9 exit 0，只有 ignored dist output。 |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | e2d32e9 exit 0；13 display equations / 50 references，各 validators valid。 |
| `node --check scripts/verify-nature-corpus-live.mjs` / `git diff --check` | exit 0。 |
| `git diff e2d32e9 -- src/clip.mjs src/adapters/nature.mjs src/security.mjs src/article-fetch.mjs` | 仅原始 clip two-line injection seam；accepted production guards 未改。 |
| `git diff --name-only 3de7c52 -- test/corpus/corpus-manifest.json test/corpus/fixtures scripts/lib/nature-corpus-infrastructure.mjs scripts/verify-nature-corpus-live.mjs test/nature-corpus-live.test.mjs` | 空，B source/A interface/D implementation 没有 resume changes。 |

三 dialect source-backed mocked-controller 复现逻辑如下（在此 worktree 运行 `node --input-type=module`；PowerShell 用 literal here-string pipeline，避免 shell 展开）。Resources 全来自 frozen fixtures，不依赖 site/current session：

```javascript
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createReplay } from './scripts/lib/nature-corpus-infrastructure.mjs';
import { parseOptions, runVerifier } from './scripts/verify-nature-corpus-live.mjs';
const corpusRoot = path.resolve('test/corpus');
const manifest = JSON.parse(await readFile(path.join(corpusRoot, 'corpus-manifest.json')));
const resources = await Promise.all(manifest.articles.map(async article => ({
  url: article.url, method: 'GET', redirect: 'manual', responseMocked: true,
  status: 200, headers: {'content-type': 'text/html'},
  bodyBytes: await readFile(path.join(corpusRoot, article.fixturePath)),
})));
for (const article of manifest.articles) for (const resource of article.resources) {
  resources.push({url: resource.url, method: 'GET', redirect: 'manual', responseMocked: true,
    status: resource.status, headers: {'content-type': resource.contentType},
    bodyBytes: await readFile(path.join(corpusRoot, resource.fixturePath))});
}
for (const citationStyle of ['markdown', 'quarto', 'links']) {
  const transport = createReplay({resources,
    dns: {'www.nature.com': [{address: '93.184.216.34', family: 4}]}});
  const report = await runVerifier(parseOptions(['--citation-style', citationStyle]),
    {manifest, corpusRoot, transport});
  transport.assertClean();
  console.log(JSON.stringify({citationStyle, report, ledger: transport.ledger()}));
}
```

Exact executed diagnostic 用相同 import/resource/control loop，stdout 仅缩减 report 为 article/phase/cause/failed expectation paths/invalid validators 和 ledger；上述三种 report.exitCode=1 是业务结果，diagnostic process exit=0 / clean replay。这不是 live CLI 的 exit=0 或 source acceptance。

最新 b88653a / ec53d65 的 exact checks：

| Command | Result |
| --- | --- |
| `node --test --test-reporter=tap test/nature-corpus-live.test.mjs test/network-boundaries.test.mjs test/infrastructure-hardening.test.mjs test/bridge-security.test.mjs` | 单轮 69 pass / 0 fail / 0 skip / exit 0；同轮真实 markdown source receipt 见上。PowerShell `Tee-Object -FilePath` 保存上述明确外部 log，随后 `exit $LASTEXITCODE`。 |
| `node --check scripts/verify-nature-corpus-live.mjs` / `node --check test/nature-corpus-live.test.mjs` | exit 0。 |
| `git diff --check` / `git diff --cached --check` | exit 0；只有 LF/CRLF advisory。 |
| `git diff b88653a -- src/clip.mjs src/adapters/nature.mjs src/security.mjs src/article-fetch.mjs` | 只有既有 two-line clip seam。 |
| `git diff --name-only 143fc77 -- test/corpus/corpus-manifest.json test/corpus/fixtures` | 空，B 原始 inputs 完全未变。 |
| `git diff --name-only e204ded -- test/corpus/corpus-manifest.json test/corpus/fixtures scripts/lib/nature-corpus-infrastructure.mjs scripts/verify-nature-corpus-live.mjs` | 空，B/A/D verifier 没有 migration edits。 |
| `git diff --name-only b88653a -- AGENTS.md docs/PRD.md docs/EDD.md docs/specs/issue-10-nature-corpus.md package.json package-lock.json src/security.mjs src/adapters/nature.mjs src/article-fetch.mjs src/writer.mjs papers .github` | 空，禁止边界与 accepted main 一致。 |
| `git push origin codex/issue-10-agent-d` | Code/test checkpoint `81179335fde0ca982377a608a6d53ab1e10c8c39` 已成功 push；doc-only commit 另行 push。 |

Accepted ac86 的追加 exact checks：上述单个 `--test-name-pattern` 命令与注明的新 TAP receipt；`gh run view 37681190063 --repo uwougil/Academic-clipper --json headSha,status,conclusion,jobs` 和 `gh run view 37681189875 --repo uwougil/Academic-clipper --json headSha,status,conclusion,jobs`（`--jq` 仅缩减为 head/status/conclusion/job ID/name/result），same SHA/success；`git diff ac86b2f -- src/clip.mjs src/adapters/nature.mjs src/security.mjs src/article-fetch.mjs` 只有原 clip two-line seam；`git diff --name-only 8117933 -- scripts/lib/nature-corpus-assertions.mjs scripts/verify-nature-corpus-live.mjs test/nature-corpus-live.test.mjs test/corpus/corpus-manifest.json test/corpus/fixtures scripts/lib/nature-corpus-infrastructure.mjs` 空。提交前 diff/status/tracked-file checks 另照常执行，无重新 clip。

本轮未重跑 `npm test`、build、golden validation 或 27 real-source style combinations；此前结果仅是上面明确标出的历史基线，后续 integrator 仍需在所有 prerequisites accepted 后执行 required suite。Doc-only 新 head 不重跑已固定的 69-test scope。

这些 pass 验证 verifier 正确保留失败，绝非 85 source assertions 已通过。D 只消费 C helper，没有搬 C 的 mandatory test/nature-corpus.test.mjs / golden semantic tests；integrator 必须消费完整 C authored delivery 并执行真实 required suite，不能用 D mocks 替代。

Live Nature acquisition 未运行；没有使用 Nature cookie/private session/account access，没有 tracked full captures、credentials、generated output、golden 或 corpus fixture changes。D tests 使用 BOTH injected fetch/resolver 与 A declaration/ledger，不发生 ordinary DNS/HTTP；writer import/call audit、fixture/golden bytes 和 output directory unchanged checks 通过。现有 writer tests 仅在自己的临时目录检查原 behavior。

C/integrator unblocking：先完成独立 parser prerequisites，并在 accepted main 获得成功 Main CI；再消费 exact final A/B/C interfaces、resume SAME D 审查/复验。全部 85 source expectations × 三 dialect 必须执行/通过，required consumers/coverage 无 blocked；D 再验证完整真实 source-backed clip/projection 的所有 article results 为 PASS/EXPECTED_WARNING，guard/replay ledgers clean。D 完整实现的首次独立审查仍待 reviewer 对原 seam/verifier、`8117933` tests 及此 head 执行，不能只审 migration delta；之后独立审查最终 integration，执行 repository required commands、CI matrix 与 Secret scan。Opt-in live availability 单列，不替代 gates。D 没有 ordinary Issue #10 PR 或 merge。
