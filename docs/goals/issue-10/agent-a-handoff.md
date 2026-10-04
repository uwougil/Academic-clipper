# Issue #10 — Agent A H1 infrastructure handoff

状态：H1 基础设施接口已交付，供 B/C/D 与 integrator 选择；不代表 Issue #10 完成。2026-10-02。

更新：2026-10-04 的 `mainEntity` 兼容修订见本文末尾；新增采集应使用 sanitizer `1.1.0`。下面原 H1 证据保留为历史版本记录。

## 基线、提交与所有权

- Base SHA：`5971ebfbe288e0efed4abef21469f41e2cabb05f`。
- Branch：`codex/issue-10-agent-a`。
- Worktree：`C:\Users\guoli\.codex\worktrees\7658\academic-clipper`。
- PR #27 已在该 SHA 合入；启动时先只读检查 pending CI，待 [Main CI 37037241055](https://github.com/uwougil/Academic-clipper/actions/runs/37037241055) 成功后才 fetch/switch 和修改仓库。Ubuntu Node 20、Ubuntu Node 24、Windows Node 24 三个 jobs 均为 success。结束前再次查询 remote main，仍为该 SHA。
- Ordered implementation SHA：`20b48328114f195974e92827583b6bf5875beb27`。
- 第二个提交仅保存本 handoff；其 SHA 是包含本文件的交接 commit，可由 `git rev-list --reverse 5971ebfbe288e0efed4abef21469f41e2cabb05f..codex/issue-10-agent-a` 重建完整有序列表。最终交接消息同时列出两个精确 SHA，避免文档自引用 commit hash。

Changed files：

- `scripts/lib/nature-corpus-infrastructure.mjs`
- `scripts/sanitize-nature-corpus.mjs`
- `test/corpus/corpus-schema.json`
- `test/corpus/.gitattributes`
- `test/nature-corpus-infrastructure.test.mjs`
- `docs/goals/issue-10/agent-a-handoff.md`

`.gitattributes` 仅限定 corpus fixture HTML 的 `text eol=lf`。它是 §5–6 字节契约的必要基础设施：Windows autocrlf 不得改变 excerpt hash。没有修改生产 parser/transport/writer、dependencies、CI、release、golden、PRD/EDD、canonical spec、manifest 或 bulk fixtures；没有使用 PR #13 实现，也没有创建 delivery PR。

## 版本和字段契约

导出的版本常量：

| 常量 | 值 |
| --- | --- |
| `SCHEMA_VERSION` | `1.0.0` |
| `RECIPE_VERSION` | `1.0.0` |
| `SANITIZER_VERSION` | `nature-corpus-sanitizer/1.0.0` |
| `SERIALIZER_VERSION` | `nature-corpus-subtree/1.0.0` |
| `PROJECTION_VERSION` | `nature-corpus-projection/1.0.0` |

JSON Schema 文件定义静态形状；`validateManifest()` 在同一文件的 schema 上补充唯一性、article identity、path、recipe、coverage 和 consumer 检查。CLI 使用同一 helper。独立 JSON Schema 工具只能验证静态形状，不能替代这些跨字段/登记检查。版本未知、额外字段、缺失必需字段均拒绝。

Root 必需：`schemaVersion`, `articles`；可选：`sizeException`。基础设施允许 0–10 条用于分阶段检查；最终 5–10 admitted articles 与覆盖矩阵验收仍由 integrator 按规范执行。

每篇必需：`articleId`, `url`, `doi`, `title`, `journal`, `observedAt`, `captureMode`, `sourceSha256`, `fixturePath`, `fixtureSha256`, `sanitizerVersion`, `serializerVersion`, `recipe`, `retainedBlocks`, `transformations`, `omittedContent`, `resources`, `coverage`, `expectations`。

每篇可选：`liveObservations`, `sizeException`。`url` 必须精确为 `https://www.nature.com/articles/<articleId>`；`doi` 必须为 `10.1038/<articleId>`；不接受 query/fragment 或 DOI substring identity。`observedAt` 是带 timezone 的实际 ISO timestamp，不能填写测试固定日期。`captureMode` 是 `guarded-http` 或 `browser-dom`，按实际获取方式选择。

- Recipe：`{version, id, articleUrl, blocks, removeSelectors}`；每个 block 是 `{id, selector, role}`。每个 selector 在未经 sanitizer 的源 DOM 上必须恰好选中一个 node。Recipe block 顺序进入 recipe hash；HTML node 顺序仍来自原 DOM，不按 recipe 重排。
- `retainedBlocks`：对应 recipe blocks，逐项增加 `sourceSubtreeSha256`。Block IDs 在每篇及其真实 table resources 内唯一。
- `transformations`：`[{operation, count}]`。记录选择/scaffold、删除、JSON-LD 裁剪、URL 清理；B 还须人工填写 `omittedContent`，说明未覆盖内容，不能从 hash 推断覆盖。
- `expectations`：`[{id, assertionId, blockIds, value}]`。Expectation IDs 在每篇唯一；`blockIds` 非空且必须指向真实 retained blocks。`value` 是 C 拥有的 JSON oracle，必须由登记 consumer 的严格 validator 接受，不能用当前 parser 输出生成。
- `coverage`：`[{feature, blockId, expectationId}]`。必须引用已有 block/expectation，且该 expectation 实际包含该 block。
- `sizeException`：`{reason, reviewedBy}`；用于 article >256 KiB、table >64 KiB 或 corpus >2 MiB，必须是真实 integrator 审核记录。20–150 KiB 是选取目标，不用删掉 stress topology 满足目标。
- `liveObservations`：`{observedAt, fullPageObservations, retainedProjection}`。完整页面观察写为独立说明列表；`retainedProjection` 是同 recipe 的五个 signature 字段。Frozen preflight 验证 recipe hash 和 excerpt signatures 一致；D 的新 live 漂移结果应放报告，不能覆盖 frozen baseline。

每个 resource 代表一个 table HTTP exchange：必需 `{id, kind: "table", url, method: "GET", redirect: "manual", status, responseMocked}`；可选 `contentType`, `location`, `body` 或真实 provenance 字段、`sizeException`。URL 必须在同文章 `/tables/` scope。Redirect statuses 与 `location` 必须同时出现。

- 真实 resource：`responseMocked: false`，另必需 `observedAt`, `captureMode`, `sourceSha256`, `fixturePath`, `fixtureSha256`, `sanitizerVersion`, `serializerVersion`, `recipe`, `retainedBlocks`, `transformations`, `omittedContent`；禁止 inline `body`。Source hash 是该 resource 自己的原始 body bytes。Fixture 路径必须为 `fixtures/<article-id>/tables/<name>.excerpt.html`。
- Mock response：`responseMocked: true`，可提供 synthetic `body`，禁止 source/fixture hashes 和 fixturePath；用于失败、absence、redirect 等声明场景。不能充当另一篇真实文章或真实 table layout 证据。
- 每个跟随的 redirect hop 独立声明 exact URL/method。逃离 scope 的 redirect 只声明原响应，不声明/访问被生产 guards 拒绝的目标。
- Article fixture 路径固定为 `fixtures/<article-id>/article.excerpt.html`；没有 headers/cookies provenance，也不提交 binary assets。

## Hash、选择与 sanitizer

`sha256Bytes(bytes: Uint8Array): string` 只接受实际 bytes，拒绝 decoded string。

1. `sourceSha256`：HTTP 解压后的原始 body bytes，任何 UTF-8 decoding、DOM parse、sanitization 之前计算；不含 headers。
2. `fixtureSha256`：committed excerpt 的 UTF-8 无 BOM、LF、末尾 LF bytes；不含 manifest。Windows checkout 的 LF 由 corpus `.gitattributes` 固定。
3. `sourceSubtreeSha256`：选择的原 DOM node 在 sanitizer 前，经 `serializeSubtree(node)` 转为 UTF-8 bytes 再 hash。Serializer 排序 attributes，保留 text-node whitespace，使用 DOM 已解析的 Unicode/entity 表示，不保留原始 HTML 的 entity 拼写。Document-external `</html>` 后 whitespace 不进入 scaffold DOM，避免末尾 LF 在 HTML parser 中回流 body；原 HTTP bytes hash 仍完整保留。
4. `recipeSha256`：`stableJson(recipe)` 的 UTF-8 bytes，object keys 排序，arrays 保持顺序。

`sanitizeNatureHtml(html: string, recipe): result` 返回：`bytes`（Buffer）、`html`、`fixtureSha256`、`sanitizerVersion`、`serializerVersion`、`recipeSha256`、`retainedBlocks`、`transformations`、`signatures`。不要将整个 result spread 进 article；其中 `bytes/html/signatures/recipeSha256` 并非 article schema 字段，按上面的字段映射写入 manifest。

选择完整 semantic blocks 和原 ancestors，不作者化 prose、TeX、captions、cells。B 必须明确选择 figure 的 caption sibling、必要正文位置、metadata 与 reference prefix；选择器不会猜测遗漏的邻接语义。引用列表不得只选后面的 li，必须保留到最高选定 reference 的完整源 prefix，否则拒绝。保留 IDs/classes/data-test/data-title、科学 inline adjacency、image candidates、table spans/cells 和所需 UI。会移除 executable scripts、forms/hidden state、account/session/consent、ads/analytics/recommendations、comments、event handlers、未知 attributes、data/binary URLs 和 access/tracking query 参数。Public scholarly contact 可由所选块保留。

非执行 JSON-LD 只保留按 article URL 匹配的 article object；单个没有 URL identity 的 article object允许作为 metadata fallback，来源 identity 仍需 B 独立审核。歧义、错误 JSON-LD 或 sanitizer 删除被选 block 时直接失败，要求明确修订 recipe。JSON values/key ordering 确定，并转义 `<`，不会生成 executable closing-script text。

`projectionSignatures(root, recipe)` 是低层 API，只接受已 sanitize 的 retained root；推荐直接使用 `sanitizeNatureHtml(...).signatures`。返回 `{projectionVersion, serializerVersion, recipeSha256, structureSha256, payloadSha256}`。Structure 包含 tags、attribute 名称/结构属性值、node topology/order，排除 scholarly text/resource values；payload 包含精确保留文本/TeX、资源值和 JSON-LD metadata。移除节点产生的 adjacent text nodes 在签名前 normalize，文本 bytes 不改变。源全文和 frozen excerpt 必须使用同 recipe/sanitizer/serializer；不能把 full-page hash/counts 与 excerpt 比较。

## APIs、错误语义与可执行示例

其余 exports：

- `stableJson(value): string`：确定性 JSON；拒绝 undefined/非有限值。
- `validateRecipe(recipe): recipe`、`validateFixturePath(path, articleId): path`：成功返回原输入。
- `validateManifest(manifest, {assertionRegistry}): manifest`：registry 必须是 Map，即使 articles 为空。
- `consumeExpectations(article, context, assertionRegistry): Promise<string[]>`：逐项调用所有消费者，返回 consumed expectation IDs；callback throw/返回 false 都失败。
- `readFixtureBytes(corpusRoot, fixturePath, articleId, expectedSha256): Promise<Buffer>`：realpath containment 包括 symlink，检查 UTF-8/LF/BOM/hash；绝不按越界路径读取 fixture。
- `verifyManifestFixtures(manifest, corpusRoot, {assertionRegistry}): Promise<{files, totalBytes}>`：完整 shared validation、各文件 hash、size policy、canonical recipe/idempotence、frozen observation signatures；不运行 parser。
- `loadReplayResources(article, corpusRoot): Promise<Resource[]>`：验证后的 manifest resources 转为 replay `bodyBytes`，真实资源必须经过 fixture hash 检查；请先运行完整 preflight。
- `createReplay({resources, dns}): {fetchImpl, resolveHostname, ledger, assertClean}`：下例给出参数格式。
- `CorpusIntegrityError`：`name = "CorpusIntegrityError"`，`code = "FIXTURE_INTEGRITY_FAILURE"`，`message` 指出拒绝原因。Assertion callback errors 与正常 I/O、UTF-8 decode、Response construction errors 原样传播，不能把异常当 pass。

在仓库根目录用 `node --input-type=module` 执行以下 synthetic 示例；不需要网络、不写真实 fixture、不算 admission evidence：

```js
import assert from 'node:assert/strict';
import { sanitizeNatureHtml, sha256Bytes, createReplay, validateManifest,
  consumeExpectations, SCHEMA_VERSION } from './scripts/lib/nature-corpus-infrastructure.mjs';

const articleId = 'synthetic-h1';
const url = `https://www.nature.com/articles/${articleId}`;
const recipe = {version: '1.0.0', id: 'synthetic-h1-v1', articleUrl: url,
  blocks: [{id: 'paragraph', selector: '#p1', role: 'scientific-inline'}], removeSelectors: []};
const raw = Buffer.from('<html><head></head><body><main class="c-article-body"><p id="p1">Synthetic <i>x</i><sub>i</sub> K</p></main></body></html>');
const output = sanitizeNatureHtml(new TextDecoder('utf-8', {fatal: true}).decode(raw), recipe);
assert.deepEqual(output.bytes, sanitizeNatureHtml(output.html, recipe).bytes);
const assertionRegistry = new Map([['exact-inline', {
  validate: value => typeof value === 'string',
  assert: (context, expectation) => assert.equal(context.inline, expectation.value),
}]]);
const article = {articleId, url, doi: `10.1038/${articleId}`, title: 'Synthetic', journal: 'Synthetic Nature',
  observedAt: '2026-10-02T00:00:00Z', captureMode: 'guarded-http', sourceSha256: sha256Bytes(raw),
  fixturePath: `fixtures/${articleId}/article.excerpt.html`, fixtureSha256: output.fixtureSha256,
  sanitizerVersion: output.sanitizerVersion, serializerVersion: output.serializerVersion, recipe,
  retainedBlocks: output.retainedBlocks, transformations: output.transformations, omittedContent: [], resources: [],
  coverage: [{feature: 'scientific-inline', blockId: 'paragraph', expectationId: 'inline'}],
  expectations: [{id: 'inline', assertionId: 'exact-inline', blockIds: ['paragraph'], value: 'xi K'}]};
validateManifest({schemaVersion: SCHEMA_VERSION, articles: [article]}, {assertionRegistry});
assert.deepEqual(await consumeExpectations(article, {inline: 'xi K'}, assertionRegistry), ['inline']);

const tableUrl = `${url}/tables/1`;
const transport = createReplay({resources: [{url: tableUrl, method: 'GET', redirect: 'manual',
  status: 200, responseMocked: true, headers: {'content-type': 'text/html'},
  bodyBytes: Buffer.from('<table><tr><td>Synthetic cell</td></tr></table>')}],
  dns: {'www.nature.com': [{address: '93.184.216.34', family: 4}]}});
await transport.resolveHostname('www.nature.com', {all: true, verbatim: true});
const response = await transport.fetchImpl(tableUrl, {redirect: 'manual'});
assert.match(await response.text(), /Synthetic cell/);
transport.assertClean({expectedRequests: [{url: tableUrl, method: 'GET', redirect: 'manual'}],
  expectedDns: [{hostname: 'www.nature.com', all: true, verbatim: true}]});
```

Replay 每次生成新的 Response/body/Headers 和 DNS record copies。`fetchImpl(value: string | Request, options)` 只允许已声明 exact GET/manual URL，未知 URL/method/redirect/body 必须记录并 throw。`resolveHostname(hostname, {all: true, verbatim: true})` 只读取声明的 IP/family 数组，不调用 live DNS。没有 global fetch/DNS mutation，也没有默认网络 fallback。

`ledger(): {requests, resolutions, unexpected}` 返回 snapshot。`assertClean({expectedRequests?, expectedDns?} = {}): true` 必须在 `node:test` 的 `t.after(() => transport.assertClean(...))` 或 `finally` 中执行。未知操作即使被生产 hydrator catch 转成 warning，ledger 仍使 teardown fail。应同时提供 exact expected requests/DNS，以检查遗漏和多余的已声明操作。Production scope 拒绝的目标不应出现在 HTTP/DNS ledger。

CLI：

```text
node scripts/sanitize-nature-corpus.mjs --help
node scripts/sanitize-nature-corpus.mjs --input <external-raw-body.html> --recipe <recipe.json> --output <new-excerpt.html> --kind article
node scripts/sanitize-nature-corpus.mjs --validate-manifest <manifest.json> --corpus-root <test/corpus> --registry <consumer-registry.mjs>
```

Registry module exports `assertionRegistry`。Sanitize CLI 在 UTF-8 decoding 前 hash input bytes，stdout 输出 provenance JSON；只写新 excerpt，采用 `wx` 拒绝覆盖。Raw input 必须在仓库外（已存在 corpus excerpts 可用于复核），output 只能为仓库外新 excerpt 或 `test/corpus/fixtures` 下新文件，不能写 ordinary papers/golden/unrelated repository files。目录须先存在。默认 article/table limits 分别 256/64 KiB；`--size-exception <json>` 必须包含真实 `{reason, reviewedBy}`。Exit 0 成功、1 integrity/I/O failure、64 usage error；未知/重复/缺值选项拒绝。

## 验证证据

执行环境：Windows PowerShell，Node `v24.14.1`，committed lockfile。所有最终检查均 exit 0：

| Exact command | 结果 |
| --- | --- |
| `npm ci` | 65 packages；audit 0 vulnerabilities；未改 lockfile |
| `node --test test/nature-corpus-infrastructure.test.mjs` | 28 tests，28 pass，0 fail/skip；全部 HTML/identity/日期为明确 synthetic unit inputs |
| `npm test` | 138 tests，138 pass，0 fail/skip |
| `npm run build` | 成功生成 ignored `dist/extension` |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | valid；13 display equations、50 reference definitions；math/scientificFragments/Markdown/raw HTML/cross-reference validators 全通过 |
| `git diff --check`、`git diff --cached --check` | 无 whitespace errors |
| `git check-attr text eol -- test/corpus/fixtures/synthetic-infrastructure/article.excerpt.html test/corpus/fixtures/synthetic-infrastructure/tables/1.excerpt.html` | 两种路径均 `text: set`, `eol: lf`；没有创建这些 synthetic 路径文件 |
| `git diff --name-only 5971ebfbe288e0efed4abef21469f41e2cabb05f..HEAD`、`git ls-files`、`git status --short` | changed/tracked path 审计只包含本 handoff 与上述五个 infrastructure files；提交后工作区干净 |

上面的可执行 handoff 示例也已在 Node 下执行成功。Focused tests 包括 schema/consumer 拒绝、portable paths/symlink escape、精确 byte hashes、科学 whitespace、JSON-LD、same-input/idempotence、same retained projection signatures、reference prefix、独立 table provenance/size exception、fresh responses/DNS copies、unexpected ledger、真实生产 hydration 的 HTML/no-cells/HTTP failure/同文章 redirect/逃离 scope rejection、A→B→A isolation、CLI shared validation。所有 replay HTTP/DNS 均来自显式内存声明。

未执行 live acquisition/live clipping；未为本分支运行 GitHub 三平台 CI，因为没有创建 implementation PR。本次三平台成功证据仅适用于 accepted base；integrator 必须对实际选择的 commits 重新验证和运行最终 CI。临时完整 test log 在 OS temp 目录，不进入 commits。

## 限制、缺陷与规范建议

- 未获取任何真实 paper corpus；没有 source-backed admission/coverage 声明。基于当前 Nature selector/metadata/table/resource 行为设计，并用明确 synthetic inputs 验证接口；B 的真实 DOM/source 审核仍是必要条件。
- Sanitizer 不能证明 semantic completeness，也不是通用 secret detector。未知 secret 形态、私人内容和真实 scholarly contact 都需要源审阅。检测到 private/local plaintext 时失败，不能通过改写科学内容“修复”。B 应选完整块并审核 transformations、JSON-LD trimming 和 omissions。
- CLI 当前支持 UTF-8 HTTP body；raw hash 在解码前计算。非 UTF-8 source 应通过 helper 在调用方明确按实际编码 decoding，同时保留原 body bytes hash。`browser-dom` 不允许用 DOM string hash冒充原 HTTP body hash；调用方必须另提供实际取得的原 body bytes 证据，CLI 不采集浏览器 DOM/HTTP。
- 生产 `clipNature()` 尚未透传 table fetch/resolver；A 没有修改此 API。C 的完整 table replay 等 D 的最小 seam。当前 focused hydration tests 直接调用已有 `hydrateNatureTables()` 注入点，保留原安全检查。
- 当前 sanitizer attribute allowlist/JSON-LD article matching 若与真实可用 DOM 冲突，B 保留 evidence 交 A 做兼容版本修订，不自行编辑 shared helper，不伪造内容或绕过规则。必要 ancestors/siblings 由显式 recipe 固定，无法猜测 recipe 未选择的 semantic content。
- 没有发现独立 parser defect；没有 proposed canonical spec changes。Canonical spec 保持不变。新增 `.gitattributes` 是规范要求的 LF byte policy 实现，不改变规范语义。

## B/C/D unblocking 条件

- **B**：选择 implementation SHA 与本 handoff commit，记录 `1.0.0` 接口版本后可冻结来源 recipes/excerpts/provenance；每条必须完成 source identity/admission review、实际 observedAt、原 body/hash、pre-sanitize digests、完整 references prefix、caption siblings、真实 resource 独立 provenance、omissions 和 size review。冻结 expectations 需与 C 的 strict registry IDs 协调。不要把 synthetic 示例、mock responses 或 hash 相等当真实结构证据。
- **C**：选择相同 SHA/版本后可立即实现 assertion framework；每个 oracle payload 注册严格 `validate` 和独立 `assert`，先 full preflight，再生产链路，再 `consumeExpectations()`；每个 dialect 均执行 validators。最终 source-specific assertions 等 B 的真实源合同。每场景 teardown 检查 ledger，full clip table replay 等 D seam，不调用缺少注入的 full clip 导致 live 网络。
- **D**：选择相同 SHA/版本并重新检查 actual landed transport/main CI 后，可用 replay API 与 frozen signatures 实现 live/mock tests。保持生产 guards，选择最小 table transport seam、bounded body/timeout 透传；不建立第二套 parser。新 live signatures 使用同 recipe/sanitizer/serializer，与 frozen retained projection 比较；full-page counts 另列。最终 semantic comparison 等 C API。
- **Integrator**：按有序 SHA 选择 commits；B/C/D 接受接口并记录 SHA 后 H1 才成为它们各自的明确依赖。后续接口变更由 A 提供兼容 commits 和迁移说明。最终 5–10 真文章、全覆盖、三 dialect、full checks 和 CI 不在本 H1 中宣称完成。

## 2026-10-04 — B 真实来源反馈后的 JSON-LD 兼容修订

本次只修订 A infrastructure，不更改生产 parser、安全 transport、B fixtures/manifest、canonical spec 或 raw captures。仍在原隔离 branch/worktree `codex/issue-10-agent-a` / `C:\Users\guoli\.codex\worktrees\7658\academic-clipper` 工作；原 base `5971ebfbe288e0efed4abef21469f41e2cabb05f` 与两个原 H1 SHA 不变，兼容提交顺接 `4e0aec64f996a0090a7c74c14edd8ab5051d9639`，不 rebase 消费者已选的 dependency commits。修订启动时 remote main 是 `de8a8955db0327c0241d648e4546c2d9f85a330d`，其 [Main CI 37137870378](https://github.com/uwougil/Academic-clipper/actions/runs/37137870378) 已成功；未把其他任务的 main changes 混入兼容提交。精确新 SHA 由包含本节的 commit 确定，并在最终交接列出；可用 `git rev-list --reverse 4e0aec64f996a0090a7c74c14edd8ab5051d9639..codex/issue-10-agent-a` 查询。

本次 changed files 仅：`scripts/lib/nature-corpus-infrastructure.mjs`、`test/corpus/corpus-schema.json`、`test/nature-corpus-infrastructure.test.mjs`、本 handoff。没有新 PR。

### 真实结构证据与根因

B 提供的两个临时 capture 均为 `script[type="application/ld+json"]`，根 keys 为 `mainEntity`, `@context`, `@type`，根 type 为 `WebPage`；`mainEntity.@type` 是 `ScholarlyArticle`。两份 `sameAs` 的实际类型均为 string，分别精确为：

- `https://doi.org/10.1038/s41534-023-00746-0`
- `https://doi.org/10.1038/s41586-023-05896-x`

没有 mainEntity 根 `url`, `@id`, `mainEntityOfPage`；`isPartOf` 是 journal/volume 对象。原 sanitizer `1.0.0` 只遍历 root/`@graph`，无法取得 `mainEntity`，两份均实际抛出 `Ambiguous or mismatched article JSON-LD; select relevant article script explicitly`。这违反了实现对规范 §5 相关 article object 的支持，属于 A helper compatibility defect，未通过删除 JSON-LD 或重写 source 绕过；不是生产 parser defect，也无需改规范。

| Article ID | 原始 HTTP body SHA-256（只读重查相同） | 本次 metadata-only excerpt SHA-256 |
| --- | --- | --- |
| `s41534-023-00746-0` | `6b2bb78e5f3038d6281eac00b60dc90aa58bdd9ac185ca2d4b9b0de362bbe28e` | `edfb3cb27a70af54701590a7ec3555af25fc5bb2fbcee1de5eea94382ab95283` |
| `s41586-023-05896-x` | `342b8dc5d0bf7d01618a3e9965ef6de9b23c59c7f7bef429592cbdb7852c36ec` | `14e468a46ddfd4b09679afa13949337b78b813c12efa274b82ba5f55653e7456` |

这两份 excerpt 只在内存中验证，未提交，不能计入 corpus admission/coverage；B 仍负责最终完整 semantic block 选取、真实来源 provenance/oracle。A 没有审查/授权 B acquisition Cookie 行为，也没有使用 Cookie、账号、已有 profile、新 HTTP/DNS 或读取 research ledger 的敏感内容。

### 版本、调用及迁移

- `SANITIZER_VERSION` 默认改为 `nature-corpus-sanitizer/1.1.0`；新增 `LEGACY_SANITIZER_VERSION = "nature-corpus-sanitizer/1.0.0"`。
- Schema、recipe、subtree serializer、projection version 仍为 `1.0.0`，数据形状/API 无破坏性变化；schema 的 `sanitizerVersion` 接受明确的 `1.0.0` 和 `1.1.0`，未知版本拒绝。
- 调用新增可选第三参数：`sanitizeNatureHtml(html, recipe, {sanitizerVersion = SANITIZER_VERSION} = {})`。默认使用新版本；`verifyManifestFixtures()` 按每个 article/resource 已记录的版本重放，不悄悄用新算法改变旧 fixture oracle。
- 新版本只遍历 JSON-LD root/arrays/`@graph`/`mainEntity` containers，抽出相关 article，保留继承的源 `@context`（article 自己的 context 优先）。不遍历 publisher/author 等任意字段寻找 article。保留既有 `trim-json-ld-to-article-object` transformation 记录。
- 新版要求候选具有显式身份；`url`, `@id`, `mainEntityOfPage`, `sameAs` 支持 scalar/array，字符串或 `{"@id": ...}` identity 对象。所有声明值必须为 recipe 的精确 canonical article URL 或精确 `https://doi.org/10.1038/<article-id>`；仅 `@id`/`mainEntityOfPage` 可附 article node fragment。URL query、相似 DOI、外部域嵌入 DOI、相似域、混合 foreign identity、空数组/无身份均拒绝。候选必须恰有一个匹配，否则继续抛同一 integrity error。
- `1.0.0` 分支仅用于已标记旧版本 fixture 的 byte verification，保留原 root/graph 与无 identity fallback；新增采集不得为了绕过新版 identity gate 标为 legacy。CLI 默认是 `1.1.0`，没有 legacy downgrade flag。
- B 从未经修改的 raw body 重跑 source selection/sanitization，填写新 `sanitizerVersion`，重算 fixture hash、transformations、retained signatures。Source body hash 和 subtree serializer定义不变；源 digest 必须继续在 raw DOM 上计算。JSON-LD 裁剪时继承 context 可改变输出 bytes，因此已有 JSON-LD fixtures 升级时不能只改版本字符串。
- D 比较 frozen/live 必须使用 frozen article/resource 的 `sanitizerVersion` 调用第三参数；不可用默认新版与旧版 frozen signatures 混比。C 的 fixture preflight 已自动 version dispatch；其它显式重新 sanitize 调用也应透传 frozen version。

### Exact verification commands 与结果

以下均 exit 0（Windows Node `v24.14.1`）：

- `npm ci`：65 packages、0 vulnerabilities，lockfile 未改。
- `node --test test/nature-corpus-infrastructure.test.mjs`：32 pass、0 fail/skip；新增四组测试覆盖 source-shape synthetic mainEntity/context、strict sameAs scalar/array rejection、multiple/graph candidates、legacy preflight/version dispatch。原 28 项继续通过。
- `npm test`：142 pass、0 fail/skip。
- `npm run build`：成功；`dist/` ignored。
- `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`：所有 validators valid，13 display equations、50 references；golden 未改。
- `git diff --check`、`git diff --cached --check`：无 whitespace errors；changed/tracked paths 只含本次四个 owned files，提交后 `git status --short` 干净。

真实源复核命令：仓库根目录 PowerShell 中把以下 JS 用 `@' ... '@ | node --input-type=module` 执行。它只读取既有临时 raw，输出 hash/check facts，不写 source/excerpt 文件，不访问网络：

```js
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {sanitizeNatureHtml, sha256Bytes, LEGACY_SANITIZER_VERSION} from './scripts/lib/nature-corpus-infrastructure.mjs';
for (const id of ['s41534-023-00746-0', 's41586-023-05896-x']) {
  const file = `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-b/${id}.anonymous.raw.html`;
  const bytes = readFileSync(file), source = bytes.toString('utf8');
  const recipe = {version: '1.0.0', id: 'real-jsonld-review', articleUrl: `https://www.nature.com/articles/${id}`,
    blocks: [{id: 'metadata', selector: 'script[type="application/ld+json"]', role: 'metadata'}], removeSelectors: []};
  assert.throws(() => sanitizeNatureHtml(source, recipe, {sanitizerVersion: LEGACY_SANITIZER_VERSION}), /JSON-LD/);
  const first = sanitizeNatureHtml(source, recipe), again = sanitizeNatureHtml(first.html, recipe);
  assert.deepEqual(first.bytes, sanitizeNatureHtml(source, recipe).bytes);
  assert.deepEqual(first.bytes, again.bytes); assert.deepEqual(first.signatures, again.signatures);
  const rawDom = new JSDOM(source), excerptDom = new JSDOM(first.html);
  const original = JSON.parse(rawDom.window.document.querySelector('script[type="application/ld+json"]').textContent);
  const retained = JSON.parse(excerptDom.window.document.querySelector('script[type="application/ld+json"]').textContent);
  assert.deepEqual(retained, {...original.mainEntity, '@context': original['@context']});
  assert.equal(retained.sameAs, `https://doi.org/10.1038/${id}`);
  assert.equal(sha256Bytes(bytes), sha256Bytes(readFileSync(file)));
  console.log(JSON.stringify({id, sourceSha256: sha256Bytes(bytes), fixtureSha256: first.fixtureSha256,
    bytes: first.bytes.length, sanitizerVersion: first.sanitizerVersion, result: 'PASS'}));
  rawDom.window.close(); excerptDom.window.close();
}
```

结果两篇均 PASS；in-memory excerpts 为 6689/47040 bytes。真实来源只用于复核这个接口问题；未作 bulk fixtures，不新增网络采集。临时文件可能被 B 清理，因此永久 offline regression 使用明确 synthetic source-shape inputs，不能伪称其为真实全文。

### Consumers / remaining boundaries

B 选择本修订 SHA 后可保留原 JSON-LD script 输入并正常冻结 `1.1.0` source-backed excerpts，不需要删 JSON-LD 或修改 input。C/D 选择相同 SHA 并登记版本后可按上述 migration 消费；旧 fixture 仍可显式重放旧版本。Integrator 对实际 selected commits 重跑完整 checks/三平台 CI。本 compatibility branch 未运行新的 GitHub CI，accepted main 的成功 CI 不能替代修订后的集成 CI。

若其它真实来源仅有不支持的身份表示，继续保留 evidence 交 A 扩展明确规则，不能以 DOI substring/无 identity fallback 绕过。Production adapter 对原 WebPage.mainEntity 的 metadata fallback 支持不属于本次修订，仍由独立 source assertions 判断；没有宣称生产 parser 对这些文章通过。无 proposed spec changes，Issue #10 仍未完成。
