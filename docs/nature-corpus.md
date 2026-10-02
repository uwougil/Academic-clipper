# Nature corpus — Agent B 来源采集预检交接

状态：**未完成采集，0 条 admitted articles**。本文仅记录来源预检与当前访问阻塞，不是 frozen corpus contract，不证明 Issue #10 已完成。权威要求见 [canonical spec](specs/issue-10-nature-corpus.md) §4–7；本文不修改其语义。

## 基线、所有权与接口

- Accepted main / base SHA：`5971ebfbe288e0efed4abef21469f41e2cabb05f`，包含 [PR #27](https://github.com/uwougil/Academic-clipper/pull/27) planning contract。
- [Main CI 37037241055](https://github.com/uwougil/Academic-clipper/actions/runs/37037241055)：Ubuntu Node 20、Ubuntu Node 24、Windows Node 24 全部成功；启动时重新核验。
- Branch：`codex/issue-10-agent-b`；worktree：`C:\Users\guoli\.codex\worktrees\3417\academic-clipper`。
- 本次 owned changed file：`docs/nature-corpus.md` 的 source/coverage 预检部分。没有更改 parser、tests、A infrastructure、manifest、golden、canonical spec 或 PRD/EDD。
- Ordered commit SHAs 由 `git log --reverse --format="%H %s" 5971ebfbe288e0efed4abef21469f41e2cabb05f..codex/issue-10-agent-b` 重建；最终 handoff 提供实际 SHA。没有建立普通 delivery PR。
- Agent A H1 interface：尚未消费，版本/SHA 未确定。未冻结 manifest、recipe、assertion registry 或 source oracle。基础设施由 A 所有；本文的 acquisition probe 不提供 sanitizer/hash/replay 替代实现。

## 实际来源证据与 admission

2026-10-02 首轮生产 `fetchNatureArticle()` 请求在 HTTP 之前失败：系统 DNS 将 `www.nature.com` 解析为 `198.18.0.249`，`safeFetchExternal()` 按既有策略拒绝该地址。`Resolve-DnsName www.nature.com -Server 1.1.1.1 -Type A` 也返回同一地址；未更改系统 DNS、代理或安全检查。

第二轮使用 `safeFetchExternal()` 查询公共 `https://1.1.1.1/dns-query?name=www.nature.com&type=A` 与 `type=AAAA`，限定 endpoint、JSON type、10 秒 request timeout、64 KiB body 检查。A answers 为 Fastly 公网 `151.101.0.95`、`151.101.64.95`、`151.101.128.95`、`151.101.192.95`；AAAA 没有终端 IPv6 answer。对每篇重新查询，结果继续进入生产 DNS guard，并用 Undici Agent lookup 将 socket 绑定到此次验证的地址，保留原 hostname/TLS。

生产 `fetchNatureArticle()` 在每个 article URL 收到 **HTTP 303 / `text/html` / redirect origin+path `https://idp.nature.com/authorize`** 后拒绝离开同文章 scope。没有请求该 redirect，没有使用/发送 Cookie、账号、token 或私有会话。表中是当时实际观察，不宣称网站全球不可访问，也不宣称论文缺少全文。所有条目因缺少 usable article DOM 而暂不接纳。

| Article identifier | observedAt（UTC） | 实际 HTTP | Admission 结论 |
| --- | --- | --- | --- |
| `s41586-026-10401-1` | 2026-10-02T17:02:20.570Z | 303 | 当前环境不可采集；未通过 admission |
| `s41534-023-00746-0` | 2026-10-02T17:02:22.136Z | 303 | 当前环境不可采集；未通过 admission |
| `s41586-021-03819-2` | 2026-10-02T17:02:23.212Z | 303 | 当前环境不可采集；未通过 admission |
| `s41586-020-2012-7` | 2026-10-02T17:02:24.379Z | 303 | 当前环境不可采集；未通过 admission |
| `s41586-023-05896-x` | 2026-10-02T17:02:25.486Z | 303 | 当前环境不可采集；未通过 admission |
| `s41586-023-06735-9` | 2026-10-02T17:02:26.631Z | 303 | 当前环境不可采集；未通过 admission |
| `s41467-023-44030-3` | 2026-10-02T17:02:27.718Z | 303 | 当前环境不可采集；未通过 admission |
| `s41586-021-04354-w` | 2026-10-02T17:02:28.837Z | 303 | 当前环境不可采集；未通过 admission |
| `s41534-024-00907-9` | 2026-10-02T17:02:29.967Z | 303 | 当前环境不可采集；未通过 admission |
| `s41534-024-00877-y` | 2026-10-02T17:02:31.055Z | 303 | 当前环境不可采集；未通过 admission |
| `s41598-025-30645-7` | 2026-10-02T17:02:32.151Z | 303 | 当前环境不可采集；未通过 admission |
| `s42003-024-06789-z` | 2026-10-02T17:02:33.268Z | 303 | 当前环境不可采集；未通过 admission |

前八条是规范候选；后四条是 replacement 预检。Web 搜索提供以下研究线索，不能替代 raw response bytes 或 DOM：

- [s41534-024-00907-9](https://www.nature.com/articles/s41534-024-00907-9)：检索结果标示 open access，作为 equation-heavy 替代线索；尚未验证 equation wrappers/编号/多行数组。
- [s41534-024-00877-y](https://www.nature.com/articles/s41534-024-00877-y)：检索结果标示 open access，作为另一 quantum 候选；尚未证明结构独特。
- [s41598-025-30645-7](https://www.nature.com/articles/s41598-025-30645-7.pdf)：PDF 搜索结果包含 rowspan table 的线索，但 PDF 不是 article/table HTML。未下载 PDF、未重建 cells、未计入真实 table coverage。
- [s42003-024-06789-z](https://www.nature.com/articles/s42003-024-06789-z.pdf)：PDF 搜索结果提示 receptor 科学记号；未将 PDF 转成编写 HTML，未计入 chemistry coverage。

Canonical URL、structured DOI、title、journal、完整 author sequence、实质正文与 distinct topology 均仍须在真实取得的 article DOM 上验证。URL identifier 本身不等于通过 identity gate。Web 工具直接打开三条初始候选也被导向 idp；其文本检索输出没有可用于 `sourceSha256` 的 HTTP body bytes。

## Coverage 与尚未取得的 oracle

| 必需角色（规范 §4） | 候选 | 当前证据边界 |
| --- | --- | --- |
| golden scientific runs / 主图与 Extended Data / table / crossrefs | `s41586-026-10401-1` | 只有访问失败；committed golden 不能冒充新 source capture |
| equation-heavy / Eq. (9) / nesting / row separators | `s41534-023-00746-0`；两篇 quantum replacement | 尚无 DOM，不声称原 TeX 或 equation count |
| 长面板 captions / adjacency / Extended Data | `s41586-021-03819-2` | 尚无 retained figure/caption sibling |
| 密集 ordered citations / update UI / 非公式正文 | `s41586-020-2012-7` | 尚无 citation cluster 或 zero-display 证据 |
| 长 metadata authors / notes / affiliations / supplementary links | `s41586-023-05896-x` | 尚无 source-backed ordered metadata |
| materials inline / units / data/code links | `s41586-023-06735-9` | 尚无 retained scientific run |
| compound markers / receptor subscripts / Greek | `s41467-023-44030-3`；receptor replacement | 尚无真实 inline topology |
| astronomy signs / primes / uncertainty / negative powers | `s41586-021-04354-w` | 搜索可见论文线索，仍无可保留 DOM |
| HTML table success / 不同 header-span-cell shape / 无 cells fallback | golden；Scientific Reports replacement | 尚未取得任何 table resource；全部 pending |

没有 retained blocks、pre-sanitize subtree digests、fixture/source hashes、fixture sizes、oracle source positions、assertion IDs 或 frozen expected warnings/resources。以上值不填零来冒充有效 excerpt contract。Fixture/resource 总数与 committed bytes 均为 0；manifest 未建立。

Transformations/omissions：未执行 scholarly selection/sanitization；没有完整 capture 成功写入。仅在研究 ledger 中省略 response headers、Cookie、redirect query，以保留 status/content type/redirect origin+path。所有正文、公式、图注、references、metadata、table resources 均未取得，不算有意裁剪的 excerpt。

Parser-defect evidence：无。没有对 preview、redirect 或伪造 article 输入运行 parser；redirect rejection 是生产安全边界的预期行为，不能定性 parser regression。没有提出独立 bug Work Contract。

## 复现与检查结果

外部临时目录：`$env:TEMP/academic-clipper-issue10-agent-b`。保存 `acquire.mjs`、`dns-preflight.mjs` 和每条 `<id>.research.json`，没有 `.raw.html`。临时文件不是 integrator 的持久接口；本页保留采集方法、逐条时间和失败证据。它们不在 tracked repository state。

已执行：

```powershell
Resolve-DnsName www.nature.com -Type A
Resolve-DnsName www.nature.com -Server 1.1.1.1 -Type A
node (Join-Path $env:TEMP 'academic-clipper-issue10-agent-b/dns-preflight.mjs')
node (Join-Path $env:TEMP 'academic-clipper-issue10-agent-b/acquire.mjs') s41586-026-10401-1 s41534-023-00746-0 s41586-021-03819-2 s41586-020-2012-7 s41586-023-05896-x s41586-023-06735-9 s41467-023-44030-3 s41586-021-04354-w s41534-024-00907-9 s41534-024-00877-y s41598-025-30645-7 s42003-024-06789-z
npm ci
npm test
npm run build
npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto
```

- DNS probes exit 0；系统结果不可用于 production article fetch。
- Public DNS probes：A/AAAA HTTP 200；article acquisition probe exit 0 仅表示收集了各条失败结果，**不表示 article capture 成功**；12/12 HTTP 303，被 scope guard 拒绝。
- Node `v24.14.1`；`npm ci` exit 0（65 packages，0 vulnerabilities）。
- `npm test` exit 0，110 passed、0 failed/skipped；这是 accepted-main baseline，不是 corpus acceptance。
- `npm run build` exit 0，生成 ignored `dist/extension`。
- Golden validator exit 0，13 display equations、250 inline math、50 reference definitions；math/scientific fragments、structure、raw HTML、crossrefs 均 valid。Golden 文件未修改。
- A schema/hash/sanitization CLI、byte equality/idempotence、fixture size/secret audit 和 source-specific dialect assertions：未运行，原因是尚无 H1 interface / admissible source。
- 本文 commit 前执行 `git diff --check`、`git status --short`、tracked filenames/diff 审计；仅本文新增，无 captures/credentials/binaries。

采集 probe 的完整代码保存在下方，便于未来重建。执行位置在 repository cwd；示例中的 import path 是本次 exact worktree，其他环境须改为对应 checkout 的绝对路径。它不是 frozen helper API，不应复制进 A infrastructure。

```javascript
import { fetchNatureArticle, MAX_ARTICLE_BYTES } from 'file:///C:/Users/guoli/.codex/worktrees/3417/academic-clipper/src/article-fetch.mjs';
import { safeFetchExternal, isPrivateIpAddress } from 'file:///C:/Users/guoli/.codex/worktrees/3417/academic-clipper/src/security.mjs';
import { Agent } from 'file:///C:/Users/guoli/.codex/worktrees/3417/academic-clipper/node_modules/undici/index.js';
import { JSDOM } from 'file:///C:/Users/guoli/.codex/worktrees/3417/academic-clipper/node_modules/jsdom/lib/api.js';
import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('./', import.meta.url);
const ids = process.argv.slice(2);
for (const id of ids) {
 const url = `https://www.nature.com/articles/${id}`;
 const observedAt = new Date().toISOString();
 let chunks = [], bytes = 0; let dispatcher; let dnsEvidence; const requestLedger=[];
 try {
  const answers=[];
  dnsEvidence=[];
  for(const type of ['A','AAAA']) {
   const {response}=await safeFetchExternal(`https://1.1.1.1/dns-query?name=www.nature.com&type=${type}`,{headers:{accept:'application/dns-json'},timeoutMs:10000,validateUrl:u=>{if(new URL(u).hostname!=='1.1.1.1')throw new Error('Unexpected DNS-service redirect');}});
   if(!response.ok || !response.headers.get('content-type')?.includes('json'))throw new Error('Invalid DNS response');
   const rawDns=await response.arrayBuffer(); if(rawDns.byteLength>65536)throw new Error('DNS response exceeds bound');
   const parsed=JSON.parse(new TextDecoder().decode(rawDns)); dnsEvidence.push(parsed);
   for(const a of parsed.Answer||[])if(a.type===1||a.type===28)answers.push({address:a.data,family:a.type===1?4:6});
  }
  if(!answers.length || answers.some(a=>isPrivateIpAddress(a.address)))throw new Error('Public DNS did not return safe addresses');
  const resolver=async hostname=>{if(hostname!=='www.nature.com')throw new Error('Undeclared DNS name');return answers;};
  dispatcher=new Agent({connect:{lookup:(hostname,options,callback)=>{if(hostname!=='www.nature.com')return callback(new Error('Undeclared socket hostname'));const selected=answers.filter(a=>!options.family||a.family===options.family);if(options.all)callback(null,selected);else callback(null,selected[0].address,selected[0].family);}}});
  const result = await fetchNatureArticle(url, {resolveHostname:resolver,fetchImpl: async (target, options) => {
   const response = await fetch(target, {...options, credentials:'omit',dispatcher});
   const location=response.headers.get('location'); const redirect=location?new URL(location,target):null; requestLedger.push({url:target,status:response.status,contentType:response.headers.get('content-type'),redirect:redirect?redirect.origin+redirect.pathname:null});
   if (!response.ok || !response.body) return response;
   chunks = []; bytes = 0;
   const stream = response.body.pipeThrough(new TransformStream({transform(chunk, controller) {
    bytes += chunk.byteLength;
    if(bytes > MAX_ARTICLE_BYTES) throw new Error('Capture exceeds production byte bound');
    chunks.push(Buffer.from(chunk)); controller.enqueue(chunk);
   }}));
   return new Response(stream, {status:response.status, headers:response.headers});
  }});
  const raw = Buffer.concat(chunks);
  const d = new JSDOM(result.html,{url}).window.document;
  const body = d.querySelector('.c-article-body');
  const record = {id,url:result.url,observedAt,dnsEvidence,bytes:raw.length,sourceSha256:createHash('sha256').update(raw).digest('hex'),canonical:d.querySelector('link[rel="canonical"]')?.href,doi:d.querySelector('meta[name="citation_doi"]')?.content,title:d.querySelector('meta[name="citation_title"]')?.content,journal:d.querySelector('meta[name="citation_journal_title"]')?.content,bodyChars:body?.textContent.length||0,paragraphs:body?.querySelectorAll('p').length||0,equations:body?.querySelectorAll('.c-article-equation').length||0,math:body?.querySelectorAll('.mathjax-tex').length||0,figures:body?.querySelectorAll('figure').length||0,extended:body?.querySelectorAll('[data-test="supp-item"]').length||0,tables:[...body?.querySelectorAll('a[data-test="table-link"]')||[]].map(x=>x.href),sections:[...body?.querySelectorAll('section[data-title]')||[]].map(x=>x.getAttribute('data-title')),references:body?.querySelectorAll('ol.c-article-references > li, ol.c-article-references__list > li').length||0};
  await writeFile(new URL(`${id}.raw.html`,root),raw);
  await writeFile(new URL(`${id}.research.json`,root),JSON.stringify(record,null,2)+'\n');
  console.log(JSON.stringify(record));
 } catch(error) {
  const record={id,url,observedAt,dnsEvidence,requestLedger,error:error.message};
  await writeFile(new URL(`${id}.research.json`,root),JSON.stringify(record,null,2)+'\n');
  console.log(JSON.stringify(record));
 } finally { await dispatcher?.close(); }
}
```

## 后续解阻与规范提案

用户明确选择保留证据，并自行调查访问；未授权 Cookie/会话或放宽 transport。当前不能交付 5–10 admitted entries，Agent B goal 未完成。

建议 spec changes：目前没有请求改变真实性、publisher 或 security 条款。先寻找满足既有规则的公开 cookie-free acquisition 环境。若所有可用环境仍强制 scope-external Cookie handshake，integrator 应向人工提出 §4/§5/§8 与 no-Cookie acquisition 前置条件的兼容性问题；没有授权前不得执行 handshake 或修改 canonical spec。

Agent C 的明确 unblocking 条件：

1. A 提供实际 H1 commit SHA、schema/helper/serializer/recipe versions 和可执行 focused checks；C 可据此开始 assertion framework，但仍不能把本次失败 ledger 当 oracle。
2. 采集环境能在既有 guards 下取得公开、cookie-free、canonical/DOI identity 可验证且具有实质正文的 Nature article bytes 与声明 table resources。
3. B 使用 A helper 交付 5–10 admitted articles，完成 references prefix、retained topology、source/fixture hashes、sizes、transformations/omissions、exact ordered oracle、coverage → source locator → assertion ID、expected warnings/resources。
4. C 独立核对 source 内容与 oracle；不能从当前 parser 输出反向定义期待。

Integrator 可选择本文作为来源阻塞证据，但不能将它计入已通过必需覆盖或 Issue 完成证据。后续 source/coverage 更新继续由 B 所有。

## 第二次 goal turn 核验

上一轮取得的进展是来源失败证据与 durable handoff commit `9620ad7774c461ddf31499496e201517ba4e1d74`；本轮核验没有发现新的 cookie-free source 或人工规则变更。GitHub main 仍为本页 base SHA；Agent A 的实际 thread snapshot 仍为 active/inProgress，H1 commit 尚未交付。

2026-10-02T17:06:21.499Z 再执行：

```powershell
node (Join-Path $env:TEMP 'academic-clipper-issue10-agent-b/acquire.mjs') s41534-024-00907-9
```

fresh public DNS → pinned socket → production `fetchNatureArticle()` 仍收到 HTTP 303 / `text/html` / `https://idp.nature.com/authorize`，被相同 article-scope guard 拒绝。脚本 exit 0 是 ledger 收集成功，不是 capture 成功。用户尚在调查访问；没有新 admissible DOM。

本轮修正上表 `observedAt` 的展示：PowerShell 自动 date formatting 曾丢失毫秒/ISO 格式，现恢复原始 ledger 的 UTC ISO 8601 字符串。`s41534-024-00907-9` 上表保持首轮时间；重试时间单列于本节。没有修改科学来源、schema 或期望值。Agent B 与 Issue #10 仍未完成。

## 第三次 goal turn：blocked audit

2026-10-02T17:07:21.364Z，用上面的同一 guarded acquisition 命令改为 `s41534-024-00877-y` 再核验；仍为 HTTP 303 / `text/html` / `https://idp.nature.com/authorize`，production article-scope guard 拒绝，0 admitted DOM。A thread 当前仍 active/inProgress，branch 尚无 H1 commit。本页以外没有 tracked changes，`git diff --check` 通过。

同一 source-access 前置条件已在原始执行与两次 automatic continuation 中连续成立。上一轮属于证据精度修正的进展；本轮是重验证后确认无进一步 acquisition 进展。没有新的人工授权、公开 cookie-free source 或替代环境；用户已选择自行调查访问。因此 Agent B goal 应标记 blocked，不标记 complete，也不声称 Issue #10 完成。恢复需要 source-access 条件变化；H1 交付本身仍不足以替代真实来源。

截至本节前的 ordered commits：`9620ad7774c461ddf31499496e201517ba4e1d74` → `ea9d4b2949a092c264f9b923a6cf33828ab0c41e`。本节 commit SHA 可由本页 branch history 获取，亦在最终 handoff 报告；三次提交均仅修改 `docs/nature-corpus.md`。
