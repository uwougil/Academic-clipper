# Nature corpus 来源与覆盖

## 2026-10-04 来源署名与许可记录补齐

9 篇 `source-evidence.json` 新增 `sourceRights`，版本 `nature-source-rights/1.0.0`。从已核对 raw-body SHA 的原始响应提取完整 ordered `citation_author` 署名、原页面 Rights and permissions 声明、原始许可 href、声明 paragraph selector/index 与 A serializer 的 pre-sanitize subtree hash。`s41586-026-10401-1` 原页面声明 [CC BY-NC-ND 4.0](http://creativecommons.org/licenses/by-nc-nd/4.0/)；其余 8 篇原页面声明 [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/)。每篇保留原声明中的第三方材料说明；记录不把摘录重新授权为 repository code license，也不声称检查过未提交的 image binaries。

原页面 `p.c-footer__legal` 的 `© 2026 Springer Nature Limited` 单独标为 site footer，不冒充文章自身的 copyright notice。4 个 table 页面均未观察到 CC license anchor；记录真实空列表及关联 article 的署名/许可来源，没有虚报 table 页面存在许可链接。摘录转换为 recipe 选取、A sanitizer 1.1.0、确定性 serialization 与 LF normalization；遗漏项仍见 manifest / handoff，科学文字、公式、caption、表格和原 source expectations 未改。

本补充命令 `node $env:TEMP/academic-clipper-issue10-agent-b/record-source-rights.mjs --write`：9 raw hashes / ordered creators / rights notice positions、4 table raw hashes PASS；manifest bytes 与全部 13 fixture hashes 不变。`audit-source-contracts.mjs` 复核 9 source payloads / 13 fixtures / 1577502 HTML bytes PASS；全 `test/corpus` 为 3010072 bytes（29 files），供 integrator 审核 metadata overhead，未填 sizeException。普通读取没有新 HTTP/DNS、writer 或 production 变更。

此前“C 尚未启动”的收尾状态已被用户后续 autonomous orchestrator 任务取代。C / D 已在独立 worktrees 工作：C 报告独立核对全部 85 source expectations 和 13 source hashes，通过记录待其 checkpoint 固化；解析输出的失败仍完整保留，不能把 source audit 当 semantic acceptance。Table-footer 修复已形成独立 PR #46 / Issue #45，待独立 review 与 fresh checks；caption/citations、scientific units 等前置缺陷按各自 Work Contract 处理。下文保留 acquisition 历史，最终 passing coverage 由 C 和 integrator 的实测记录确定。

## 2026-10-04 后续覆盖补齐（最新状态）

当前为 **9篇source-admitted articles、4个table resources、13个excerpts、85个source expectations**。保留原8篇的全部科学内容和expectation values；没有把已知parser失败算作passing coverage。Sources已准备供C独立核验，完整Issue10仍未完成。

新增 [s41598-018-38309-5](https://www.nature.com/articles/s41598-018-38309-5)：Satellite-based soil moisture provides missing link between summertime precipitation and surface temperature biases in CMIP5 simulations over conterminous United States；Scientific Reports，DOI 10.1038/s41598-018-38309-5，canonical/structured identity、实质body、OpenAccess label与JSONLD mainEntity.isAccessibleForFree=true均核验。ObservedAt 2026-10-04T06:56:41.242Z；raw 487190bytes / SHA256 a1a135395d984fcda4548aacd0d6eabe0d41bb22c16cc31f4c8f16f8eaf49d51；fixture 172171bytes / SHA256 136cb3b089fac6850fab400bcce1e7b063a2aaccf763f02eeb65697a7700af00；111 retained blocks，3个完整body sections，1 display equation、4mainfigures、74条原referenceprefix。使用同一A sanitizer1.1.0/schema1.0.0，不重复或改写A infrastructure。原始响应只有外部TEMP；新excerpt<256KiB，全部13fixturebytes共1577502（<2MiB）；全corpus含manifest/evidence 2977065bytes，metadataoverhead仍如实交integrator审核。

新增的reference锚点位于li子级p，而非li自身：source-citations-v1.references逐项记录sourceAnchorId及sourceAnchorSelector（ref-CR1…ref-CR74）。Figures标签为Figure1…4，description另含完整caption；Data Availability大小写、firstpage作为article number1657/lastpage空均保持源事实。source-headings/metadata/figures values采用同一10个proposedconsumerIDs，C仍未registered/consumed。

### 真实外文章fragment

新source-crossrefs-v1保留6个不同article链接，均来自referenceprefix而非造进body的测试文本：

- [https://www.nature.com/articles/nclimate1716#supplementary-information](https://www.nature.com/articles/nclimate1716#supplementary-information)；source block a-reference-9
- [http://www.nature.com/ngeo/journal/v7/n5/abs/ngeo2141.html#supplementary-information](http://www.nature.com/ngeo/journal/v7/n5/abs/ngeo2141.html#supplementary-information)；source block a-reference-29
- [https://www.nature.com/articles/ngeo1174#supplementary-information](https://www.nature.com/articles/ngeo1174#supplementary-information)；source block a-reference-31
- [https://www.nature.com/articles/nature11377#supplementary-information](https://www.nature.com/articles/nature11377#supplementary-information)；source block a-reference-35
- [http://www.nature.com/ngeo/journal/v4/n1/abs/ngeo1032.html#supplementary-information](http://www.nature.com/ngeo/journal/v4/n1/abs/ngeo1032.html#supplementary-information)；source block a-reference-43
- [https://www.nature.com/articles/ngeo2514#supplementary-information](https://www.nature.com/articles/ngeo2514#supplementary-information)；source block a-reference-50

这些hrefs在markdown/links productionclip诊断中保留于References；Quarto保留于真实referencesBib输出（正文按既有policy不列reference文本）。不把bibliography中的sourceexternalURL写成local章节target。诊断没有tables，不需要尚未提供的tabletransportseam；未运行writer或globalfetch/DNSpatch。仍待C独立verification，不能以此代替ledger/semantic/all-dialect suite。

### 更正caption sibling的先前解释

Canonical §4/§5要求保留真实caption siblings/topology，并没有额外要求description必须位于figure外。实际9源的38个retained mainfigures中，在.c-article-section__figure-content下，.c-article-section__figure-item（image/link容器）与[data-test=bottom-caption]描述div是有序siblings；description同时是figure后代。各source-evidence.json的captionSiblingEvidence记录公开sourceLocator、blockIds和orderedElementSiblings；whole-source block digests/原excerpt bytes未改。先前把“无figure外description”当作未完成必需coverage，是B过严的解释，撤回该缺口判断，不修改canonical，也不需要syntheticDOM补洞。C应按实际src/caption节点关系验证完整caption一次和相邻正文位置。

### 新发现的生产defects（保持真实input与正确oracle）

新article的生产clipNature三policy诊断：debug1display/4figures/74refs，structure/crossrefs validators为true、warnings为空；math与rawHTML validators为false。Figure3的sourcecitation74/56进入数学superscript并残留<a>原HTML；Figure3caption出现2次（sourcewrapper1次）；Methods的m+sup3、kg m+sup−2 s+sup−1等产生7个isolatedSuperscript fragments。完整source nodes、pre-sanitize digests、正确source期待和各policyvalidation结果见fixtures/s41598-018-38309-5/parser-defect-evidence.json；没有完整Markdown snapshot、没有validator豁免。

这两个scope（figurecaption引用/重复；plain-text scientificunit attachment）应以独立bugWorkContracts修复，不能在B扩大parser任务，也不能删掉Methods/caption让它通过。先前tablefooter-note defect仍未解决。Requiredroles已有truthfulsource，passingcoverage仍受这些defects与C/D独立验证阻塞。

### 本轮候选与精确执行命令

[Scientific Reports官方PDF线索](https://www.nature.com/articles/s41598-018-38309-5.pdf)仅用于定位candidate URL/外文章fragment，fixture来自实际guardedarticlebody；未下载PDF转换或构造HTML。另一个[候选PDF线索](https://www.nature.com/articles/s41598-018-35577-z.pdf)也未计为DOM evidence。

| Candidate | UTC observedAt | Raw bytes | Source body SHA256 | Decision |
| --- | --- | --- | --- | --- |
| ncomms5918 | 2026-10-04T06:55:46.635Z | 422351 | 36d618ff2a872585a9e3107587cba985478fbf69b35e9c481aee87b53f4d8adb | 拒绝：无OA label，JSONLD isAccessibleForFree=false |
| ncomms12307 | 2026-10-04T06:55:51.372Z | 485680 | 20968b27bc3689ca1339cbe7337bdf07c1ffe8e0b9dd4995cb72d86c1dc0088e | 不接纳：公开但无目标外文章fragment，caption同布局/已有roles冗余 |
| s41598-018-38309-5 | 2026-10-04T06:56:41.242Z | 487190 | a1a135395d984fcda4548aacd0d6eabe0d41bb22c16cc31f4c8f16f8eaf49d51 | 接纳：真实外文章fragments，Scientific Reports reference p-ID/figure label变体 |
| s41598-018-35577-z | 2026-10-04T06:56:46.238Z | 433829 | 560f708b2f173fe33d72f4af1abd81f2556fe027ae5de207df71d3740fd10608 | 不接纳：公开且有3个外文章fragment；与已选SR角色重复 |

以下本轮命令按实际执行记录，不声称复制前轮batch组合：

```powershell
node $env:TEMP/academic-clipper-issue10-agent-b/acquire-anonymous.mjs ncomms5918 ncomms12307
node $env:TEMP/academic-clipper-issue10-agent-b/acquire-anonymous.mjs s41598-018-38309-5 s41598-018-35577-z
node $env:TEMP/academic-clipper-issue10-agent-b/prepare-recipes.mjs s41598-018-38309-5
node $env:TEMP/academic-clipper-issue10-agent-b/freeze-additional.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/enrich-additional-oracle.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/append-additional-contract.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/caption-sibling-evidence.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/reference-anchor-evidence.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/audit-source-contracts.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/diagnose-additional.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/preserve-additional-defect.mjs
```

Finalsourceaudit exit0：9篇untouchedsourcepayload/hash/subtree/idem/signatures/path/mapping，13fixture bytes/hash/size PASS；第9篇原input重复与idem PASS；manifestemptyregistry正确拒绝Unconsumed expectation，仍未Cassertionpreflight通过。完整clip诊断exit0只表示report已生成，**不表示validators通过**。本轮生产/parser/tests/规范/黄金artifact无修改；未因仅新增source数据重复已有288-test suite来冒充corpus测试。

## 前轮8-entry交接与历史访问ledger（下文是当时状态）

## 2026-10-04 前轮8-entry来源交接

已取得并按来源接纳 8 篇公开 Open Access article DOM、4 个独立 table responses；12 个 A-generated excerpts 共 1,405,331 bytes，全部重复生成一致、二次 sanitization 幂等、fixture/hash 与原始 source bytes 一致。来源字段已写入 [manifest](../test/corpus/corpus-manifest.json)，逐篇 source-evidence.json 是脱敏 DNS/HTTP ledger 与 source position 证据。76 个 versioned source expectations / 10 个 assertion IDs 交未来 C 登记；尚未独立消费，不能视为 offline regression 通过或 Issue #10 完成。

基线为 latest accepted main e85b1b809b56242b89b6313ce5d1165c745466bb（[Main CI](https://github.com/uwougil/Academic-clipper/actions/runs/37182993143)，Ubuntu Node 20/24、Windows Node 24 全 success）。此前冻结源文件时基线 de8a8955db0327c0241d648e4546c2d9f85a330d 的 [CI](https://github.com/uwougil/Academic-clipper/actions/runs/37137870378) 也已成功；最后无冲突 rebase 到 e85b1b8。PR #27 contract 在 accepted ancestry 中。B-owned files 仅 source manifest、fixtures/evidence、本文与 B handoff；A dependencies 原样接入。

### 明确的人类 acquisition 例外

前一轮提出 bounded fresh anonymous Cookie 方案后，用户明确回复“可以 继续往下尝试 直到能拿到需要对的东西”。据此执行一次 task-specific source acquisition 例外：每个 article/resource 新建内存 CookieJar，只接收 Nature 本次会话设置的临时站点 Cookie，结束立即清空；无账号、机构凭据、用户 browser profile/Cookie 复用或导出。没有改变 canonical、生产 safeFetchExternal、默认 article/table scope 或 D 的 no-Cookie live 行为。旧 ledger 中“未批准 / 0 admitted”均是当时状态。本次保留 raw sourceSha256 语义，未采用 decodedSourceSha256。

实际 guarded acquisition：public DoH A/AAAA + 64 KiB/10s bound、生产 DNS guard、公网 socket lookup binding、原 hostname/TLS verification；HTTPS exact article/table 路径与 idp.nature.com 的 /authorize、/transit 路径 allowlist，最多 5 redirects；总 article/body 30s、25 MiB incrementally bounded body、HTML content type。所有临时 code/query/Cookie values、set-cookie headers 均未输出/保存到 repository。Ledger 只含 redacted origin+path、HTTP status/type 与 cookie sent boolean / set count。最终重新检查 exact canonical、citation DOI、title/journal、有实质 .c-article-body，并要求源 JSON-LD mainEntity.isAccessibleForFree true 与 Open Access label。

### 来源接纳与覆盖

下表 equation / main+Extended figures / references 是 retained source counts，不是 full-page observations，也不是 parser 成功计数。

| Article | 来源角色 | Eq / figures / refs | Blocks | Fixture SHA-256 |
| --- | --- | --- | --- | --- |
| [s41586-026-10401-1](https://www.nature.com/articles/s41586-026-10401-1) | golden scientific runs / main+Extended Data / rowspan table / internal crossrefs | 13 / 3+4 / 50 | 99 | 73c0cbb04cf5d2f3424b4119f9085fad54ae8928665c21c362178bee6c2ec292 |
| [s41534-023-00746-0](https://www.nature.com/articles/s41534-023-00746-0) | quantum numbered multiline arrays / Eq. (9) / four body sections / simple math table | 37 / 6+0 / 77 | 117 | b32d31f2389e8c052f990812cfd86441172538fd66e37fa17f97704d8795d9fc |
| [s41586-021-03819-2](https://www.nature.com/articles/s41586-021-03819-2) | AlphaFold five long panel captions / paragraph adjacency / main figure topology | 0 / 5+0 / 84 | 158 | b47e9b289dfd671000e361872c9feb561b6b603eaf7c9a7011923fbf43a3c5ef |
| [s41586-020-2012-7](https://www.nature.com/articles/s41586-020-2012-7) | ordered citations / update UI / zero displays / image-only table fallback | 0 / 3+2 / 16 | 84 | 42e83aae5ecffa52c031b36103b0220b52674bec0e6a79346ba088284ccdd594 |
| [s41586-023-05896-x](https://www.nature.com/articles/s41586-023-05896-x) | 119 authors / nested sections / notes and first two affiliations / supplementary links / GitHub fragments | 0 / 4+2 / 49 | 209 | 9abb9d06ecbf79f8b4cb0883c4625d64fc25ab0bd7c01a45b6fb46353e3f29af |
| [s41586-023-06735-9](https://www.nature.com/articles/s41586-023-06735-9) | materials units and scientific attachment / captions / data and code URLs | 1 / 3+0 / 71 | 115 | c997a761f1dea592df1d1b6007d338bf028de4825e48acdd94645cd2eba05517 |
| [s41467-023-44030-3](https://www.nature.com/articles/s41467-023-44030-3) | compound bold numbers / GABA_A subscripts / Greek and units / nested Results | 0 / 7+0 / 52 | 93 | b3b10a0f1b4cdb2fb9980ebc44142d778689a18b396e51af93ebeb95f84b605e |
| [s41586-022-04755-5](https://www.nature.com/articles/s41586-022-04755-5) | FRB units / coordinates and uncertainties / negative powers / colspan table / 2 Extended Data | 8 / 3+2 / 53 | 127 | 3214c1ee6e7f232b45dcb5e44768f38608edcd9d6d870c1fc93948c854d54f1b |

8 篇 DOM 差异可核对：Nature 与 npj Quantum Information / Nature Communications；分开编号的 nested display arrays、无 display；caption 另有 bottom-caption 节点但当前初始响应中位于 figure 内；不同 main/Extended DOM、author metadata 119 项与6项、H2/H3 hierarchy、update boxes、不同 citation href 表示和 scientific i/b/sub/sup/MathJax。未把学科数量当作 DOM 多样性的唯一证据。

Rejected/replaced：s41586-021-04354-w 虽返回正文，却显示 institutional-access banner，非 Open Access且 JSON-LD 不声明免费公开；拒绝该 source，不使用机构内容做 excerpt，换成 s41586-022-04755-5。s41534-024-00877-y 可公开采集，作为研究对照；52 displays/简单2×4 table与已有 quantum role 冗余，最终不计入8篇。最初8+4的 no-Cookie acquisition rejection 保留在历史 ledger；它们不是论文科学内容被证实无效，后来成功的候选已重新通过 source gate。其余 replacement 仍仅研究线索，未冒充 admitted。

### 表格、来源 hashes 与 sizes

Physical rows 是原 DOM cells，不把 colspan/rowspan 展开后的矩阵当作另一份原文。

| Resource | Physical rows / cells per row | 原 spans | Source notes | Expected status |
| --- | --- | --- | --- | --- |
| s41586-026-10401-1/table-1 | 4; [5, 5, 4, 5] | OSSG: colSpan=1, rowSpan=2 | 1 | full-size-html |
| s41534-023-00746-0/table-1 | 3; [3, 3, 3] | none | 0 | full-size-html |
| s41586-020-2012-7/table-1 | 0; [] | none | 2 | fallback-no-html-table |
| s41586-022-04755-5/table-1 | 24; [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2] | Burst parameters: colSpan=2, rowSpan=1; Persistent radio source: colSpan=2, rowSpan=1; Host galaxy: colSpan=2, rowSpan=1 | 6 | full-size-html |

Quantum/golden/astro 的 HTML table success 正确 resource warnings 为空；COVID 必须为 fallback-no-html-table，并保留 absolute URL，exact warning 为 Extended Data Table 1: The full-size Nature page did not expose HTML table cells; retained the absolute URL. Source equations 为0的 AlphaFold/COVID/pangenome/chemistry 声明 No equation nodes were detected.；其余不允许 absence warning。HTTP failure/同文章 redirect/逃离 scope 的 simulated scenarios 仍由 C/D 明确标 synthetic；它们不是新的 raw captures。

| Body | observedAt UTC | Raw / fixture bytes | sourceSha256 | fixtureSha256 |
| --- | --- | --- | --- | --- |
| s41586-026-10401-1 article | 2026-10-03T16:44:03.154Z | 437403 / 155363 | ea2508302b4c3af4efe421f02c3de93379b50940dd1a8762166efb38033cc91c | 73c0cbb04cf5d2f3424b4119f9085fad54ae8928665c21c362178bee6c2ec292 |
| s41586-026-10401-1 table-1 | 2026-10-03T16:47:49.080Z | 172830 / 2968 | 36a52d93aca60fb50cb7452b2990f955f399d1b8a59e5278dff0764a9042d568 | 0f140482b5ed5873629f22df427fffe01aa5374c6253e465a4678f1ea1749677 |
| s41534-023-00746-0 article | 2026-10-03T16:44:08.251Z | 511799 / 228057 | 6b2bb78e5f3038d6281eac00b60dc90aa58bdd9ac185ca2d4b9b0de362bbe28e | b32d31f2389e8c052f990812cfd86441172538fd66e37fa17f97704d8795d9fc |
| s41534-023-00746-0 table-1 | 2026-10-03T16:47:53.404Z | 169146 / 4299 | 7772399037acb3ba4dfc100bc6c9a8fdf4f82c56d8836e65fcb761294e9ee069 | 90670968407415e1f7e7c624b3244330015a4e52bc9790e811d2992205851c2d |
| s41586-021-03819-2 article | 2026-10-03T16:44:11.820Z | 616249 / 188879 | 7a9843e69996c1a64a9a5ecc8b96015cfd45262e636e33e505a011d315c4310b | b47e9b289dfd671000e361872c9feb561b6b603eaf7c9a7011923fbf43a3c5ef |
| s41586-020-2012-7 article | 2026-10-03T16:44:15.126Z | 418904 / 82098 | 340b1b93ba889c99acf492c7e5ba14ba36e0a5c12866da39a445237e992e2cb9 | 42e83aae5ecffa52c031b36103b0220b52674bec0e6a79346ba088284ccdd594 |
| s41586-020-2012-7 table-1 | 2026-10-03T16:50:31.782Z | 179489 / 2500 | 3b6d64a5934ac4b45df370930ec4d9a9e51b41dc71ad3aaf2d87eb5c3125e29e | 6d67417849218c151fc8a1b27c1cbe56634d3774005b911cdc7c763462e42794 |
| s41586-023-05896-x article | 2026-10-03T16:44:18.130Z | 1251945 / 191458 | 342b8dc5d0bf7d01618a3e9965ef6de9b23c59c7f7bef429592cbdb7852c36ec | 9abb9d06ecbf79f8b4cb0883c4625d64fc25ab0bd7c01a45b6fb46353e3f29af |
| s41586-023-06735-9 article | 2026-10-03T16:44:22.324Z | 506351 / 201653 | 79f575e1941633c2dbd036682977ea6c274acd5c8c44fdb4648856a00a8d7cc6 | c997a761f1dea592df1d1b6007d338bf028de4825e48acdd94645cd2eba05517 |
| s41467-023-44030-3 article | 2026-10-03T16:44:25.253Z | 460171 / 155114 | a02d82acb4cdbde085e07ca0c276383894e7a7832c6830ad7a212f450926d88d | b3b10a0f1b4cdb2fb9980ebc44142d778689a18b396e51af93ebeb95f84b605e |
| s41586-022-04755-5 article | 2026-10-03T16:48:03.040Z | 545450 / 187508 | 190a270027c69a816b2647d2fdc6f1777cdf669695506fa40f2fe3cab8801ace | 3214c1ee6e7f232b45dcb5e44768f38608edcd9d6d870c1fc93948c854d54f1b |
| s41586-022-04755-5 table-1 | 2026-10-03T16:50:36.037Z | 185820 / 5434 | 97eaaa31a6f3443e63ad7cf2cef66776d72d61c6b0f0d2956d87cd43b39485a2 | d5c167a5e0e2bbe016a1728985a5f96788492a9397060cee4292bcb37ec81fd0 |

所有 article <256 KiB、table <64 KiB、fixture bytes <2 MiB。Quantum/AlphaFold/pangenome/materials/astro 超过150 KiB软目标，是为了保留完整公式/长caption/119 authors/嵌套章节/正文邻接和 references prefix；未删除 stress topology 凑大小。Manifest与provenance/defect evidence另占约1.1 MiB，全部 corpus文件约2.5 MiB；需要 integrator 审核“约2 MiB”是否只指fixture bytes（A当前size gate）或含metadata。没有虚报 reviewed sizeException。

### 转换、source oracle 与未通过的覆盖

消费 A schema/recipe 1.0.0、sanitizer nature-corpus-sanitizer/1.1.0、serializer nature-corpus-subtree/1.0.0、projection nature-corpus-projection/1.0.0。1.0.0 不支持原 WebPage.mainEntity ScholarlyArticle + exact DOI sameAs；B提供真实反馈，A以独立3754d3a781459635e719859353fe3cbdf8741897发布兼容版本。未编辑或删掉 source JSON-LD 来绕过问题。

Manifest recipe是实际source selector、block roles；retainedBlocks附 pre-sanitize deterministic subtree digests。各 source-evidence.json 的 sourcePositions 补 serialized bytes / original source ID，按 block id关联manifest，不是假body byte offsets。Original figures完整 captionText、首尾 sentinels、bold single-letter sequence、相邻段落、candidate src/srcset 与 descriptionPlacement 已冻结；bold letter不全声称panel标号。Source equations保留原delimiters/TeX/编号，quantum Equ9 的 rcl array 与 row separator 原样保留。Ordered citation anchors/numbers和refs完整原prefix；metadata保留全author序列和source date fields（online date优先）、选定notes/前两条完整affiliations/contributions/full correspondence。Scientific cases带source node subtree、context和source locator/index。Internal targetRetained false保留为真实excerpt omission，不能造target。

移除scripts/analytics/tracking/session/access signatures/无关UI，保留少量原metrics/update UI供排除；fixed scaffold/attribute sort/UTF-8无BOM LF由A实现，operation/count逐篇存manifest。仅选择完整源sections或完整paragraph、Extended nodes、originalreferenceprefix；未选sections/余下affiliations/其余ED figures明确omitted；Data/Code/Supplementary只保留真实links，无image/PDF/XLSX binaries。Initial raw sources只在外部TEMP，没有 full capture或完整Markdown snapshot入库。

未通过的必需覆盖：C尚未独立source审核/登记并消费76 expectations，也尚无all-dialect clip/seam/determinism/validator结果；不能把B source/integrity audit或现有288 tests当corpus通过。真实外文章章节fragment暂未找到：pangenome的两条fragment是GitHub资源，不能声称另一篇Nature article。当前8源caption bottom-description都位于figure内，不能假称已观察到figure外的sibling描述布局。应补真实不同source或由人类明确允许标synthetic的补充案例，不能悄悄放宽spec。

独立parser defect：source .c-article-table-footer li notes golden1/COVID2/astro6项被hydrateNatureTables只选table.outerHTML而丢弃；在其生产 table normalizer/renderers 子链路三种policy下确认缺失。证据各table-defect-evidence.json包括correct source notes、statuses、exact warning与A replay request/DNS ledger（unexpected0）。B没有修parser、删notes或把该角色计为passing coverage。见B handoff中的独立bug Work Contract草案。

详细ordered SHA/commands/失败实验修正/Agent C unblocking见 [B handoff](goals/issue-10/agent-b-handoff.md)。

## 历史访问研究 ledger（下文保留当时状态）


状态：**未完成采集，0 条 admitted articles**。本文仅记录来源预检与当前访问阻塞，不是 frozen corpus contract，不证明 Issue #10 已完成。权威要求见 [canonical spec](specs/issue-10-nature-corpus.md) §4–7；本文不修改其语义。

## 基线、所有权与接口

- 当前 accepted main / rebased base SHA：`ef3975c6a0eb1ec1e5a010a2df5b4f57309cebbe`，保留 [PR #27](https://github.com/uwougil/Academic-clipper/pull/27) planning contract。其后包括 PR #37、#38、#40、#41、#43；B 无关的 publisher 实验不改变本 task 的 Nature corpus 范围。
- [Latest Main CI 37135219340](https://github.com/uwougil/Academic-clipper/actions/runs/37135219340)：head `ef3975c6a0eb1ec1e5a010a2df5b4f57309cebbe`，Ubuntu Node 20、Ubuntu Node 24、Windows Node 24 全部成功（2026-10-03）。此前 base CI 37037241055、37133130849 也已成功。
- Branch：`codex/issue-10-agent-b`；worktree：`C:\Users\guoli\.codex\worktrees\3417\academic-clipper`。
- 本次 owned changed file：`docs/nature-corpus.md` 的 source/coverage 预检部分。没有更改 parser、tests、A infrastructure、manifest、golden、canonical spec 或 PRD/EDD。
- 分支已 rebase 到当前 accepted main；ordered commits 由 `git log --reverse --format="%H %s" ef3975c6a0eb1ec1e5a010a2df5b4f57309cebbe..codex/issue-10-agent-b` 重建，最终 handoff 记录本次重放后的 SHA。没有建立普通 delivery PR。
- Agent A H1 interface：现已原样消费，schema/recipe `1.0.0`、sanitizer `nature-corpus-sanitizer/1.0.0`、serializer `nature-corpus-subtree/1.0.0`、projection `nature-corpus-projection/1.0.0`。实际 source SHA 和本地 dependency commits 见下方更新。未冻结 manifest、recipe、assertion registry 或 source oracle；基础设施由 A 所有，B 未自行修改。

## 实际来源证据与 admission

### 2026-10-03 latest main / CI 与分支重放

检查 remote `origin/main` 与 GitHub Actions 后，main 从原 base `5971ebfbe288e0efed4abef21469f41e2cabb05f` 前进至 `0ee52b585afb1ac2bed11e9a56278feae2da1949`，包括 PR #37、#38、#40、#41。最新 CI workflow `CI` run `37133130849` 对该 head 三个平台均为 completed/success：Ubuntu Node 20、Ubuntu Node 24、Windows Node 24。随后本 branch 对 `origin/main` 执行 `git rebase origin/main`，无冲突，保留 11 项有序 commits；新 SHAs 与文件见 [durable handoff](goals/issue-10/agent-b-handoff.md)。本次仅更新本文/handoff 的基线与提交记录，没有更改 publisher code、PRD/EDD、canonical spec 或测试。

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

## H1 接入与浏览器观察更新

Agent A 现已完成 H1，原始有序 commits：`20b48328114f195974e92827583b6bf5875beb27` → `4e0aec64f996a0090a7c74c14edd8ab5051d9639`。B 通过 `git cherry-pick` 原样选择，local commits 为 `3728ae3` → `9c9da86`；这些是 A-owned dependency，不是 B 修改生产代码/tests 或新编写 infrastructure。Integrator 若已选择 A 原始 commits，不应重复 cherry-pick B 的这两个 dependency commits；仅选 B-owned docs commits。完整 interface 见 [A handoff](goals/issue-10/agent-a-handoff.md)。

执行 `node scripts/sanitize-nature-corpus.mjs --help` exit 0；`node --test test/nature-corpus-infrastructure.test.mjs` exit 0，28 pass、0 fail/skip。H1 的 synthetic helper checks 不算真实 source admission。恢复采集后将直接使用该版本，仍需 C 登记严格 assertion IDs/value validators；不创建独立 incompatible manifest schema。

用户提供的 Edge 截图显示 `https://www.nature.com/articles/s41534-024-00877-y` 的真实 article 页面：标题、两名作者、Open access、摘要及章节导航可见，没有可见 CAPTCHA/CF challenge。截图只证明当时浏览器呈现该页面，不证明完整正文、无 Cookie、HTTP byte provenance 或可供 sanitizer 使用的 DOM。Computer Use 多次被工具自身的 URL 识别安全检查停止，未取得 DOM、未执行页面输入；不绕过该检查。

2026-10-02T17:21:04.512Z 对上述文章再次运行同一 guarded/pinned acquisition probe，仍返回 HTTP 303 / `text/html` / `https://idp.nature.com/authorize`，被 production scope guard 拒绝。不能把浏览器成功显示或截图 hash 冒充 `sourceSha256`。No-Cookie 要求仍未改变，不能复用浏览器 Cookie/登录状态来使采集通过。

当前 unblocking 状态：A H1 已满足；usable source bytes/DOM 前置条件仍未满足。0 admitted articles、0 fixtures/resources、无 frozen manifest/oracle；Agent B 与 Issue #10 未完成。源码/规范/golden 均未由 B 修改。当前恢复运行的第一次核验取得 H1 新证据，第二次核验完成 dependency 接入；source blocker 仍在，尚未宣称完成。

## 侧边浏览器：可读 DOM 研究进展

用户明确打开并授权检查 Codex 侧边浏览器中 `https://www.nature.com/articles/s41534-024-00877-y`。通过已绑定 tab 的只读 DOM API 确认 canonical 为同 URL、citation DOI 为 `10.1038/s41534-024-00877-y`，citation title 为 `Hamiltonian dynamics on digital quantum computers without discretization error`，journal 为 `npj Quantum Information`，citation authors 按序为 `Granet, Etienne`、`Dreyer, Henrik`，citation_online_date 为 `2024/09/07`。这些是来源观察，不是 parser-output oracle，也尚未通过 acquisition provenance gate。

当前 rendered DOM `.c-article-body` textContent 长 78014（JS string length），52 个 `.c-article-equation`，IDs 连续 `Equ1`–`Equ52`；257 个 `.mathjax-tex`；74 条 reference list items。包含 Introduction、Results（多个 H3）、DISCUSSION。四个 figure 的外层 id 均为空；table-link 暴露 `/articles/s41534-024-00877-y/tables/1`，尚未取得 table response。未把这些 full-page observations 当 reduced excerpt exact counts。

来源定位 `#Equ9`：`.c-article-equation__number` 为 `(9)`；`.mathjax-tex` 在浏览器 MathJax 执行后包含 SVG/assistive MathML 及非执行 `script[type="math/tex; mode=display"]#MathJax-Element-63`。其原 TeX textContent 为：

```tex
{p}_{n}=\frac{{\tau }^{{\prime} }{c}_{n}}{\sin {\tau }_{n}}+{\mathcal{O}}({({\tau }^{{\prime} })}^{2}),
```

这是该 replacement 的真实 Eq. (9)，不是 canonical 原候选 `s41534-023-00746-0` 的 Eq. (9)；不能混用身份或宣称已经覆盖原候选角色。Rendered DOM 不能未经审核直接套用 initial-HTTP recipe：sanitizer 删除非 JSON-LD scripts，当前 production math extraction 读取 `.mathjax-tex.textContent`；完整 assistive MathML 与 TeX 可能一起进入 extraction。尚未运行 truthful reduced reproducer，因此这里只记录结构风险，不宣称 parser defect。

通过 tab 的 `cdp` capability 执行 `Page.getResourceTree` 取得当前 main frame identity，再对 exact article URL 调用 `Page.getResourceContent`。返回 `base64Encoded: false`、decoded content 长 449217，包含 article body。没有将其重新 UTF-8 编码 hash 冒充 pre-decoding body hash；未提交全文。`pageAssets.bundle()` 仅支持 image/font/stylesheet/video，不提供 article response byte export。未读取 Cookie、credentials、账号、private session 或执行网络认证。

后续依然需要能提供实际原始 body bytes 的合规 capture 接口，或人工明确修订 byte-provenance 要求；不自行改 canonical spec。可继续以已打开页面做只读 source research，但不能用它虚报 5–10 admitted fixtures。A H1 接口已可用，当前瓶颈缩小为 raw-byte acquisition/provenance 与真实 table resources。

## 初始源码与真实表格形状的对照

在上述 article 的 `Page.getResourceContent` decoded string 中，`id="Equ9"` 起始位置为 158984（zero-based JS UTF-16 code units，不是 byte offset）。初始 `.mathjax-tex` 为直接含 `$$…$$` 的 span，内部没有 rendered SVG、assistive MathML 或 math/tex script；其 TeX 与上一节来源一致。初始 HTTP 源码应优先作为该候选的 excerpt 输入，不能把 rendered DOM 节点改写成自造 initial DOM。

通过 article 唯一 `a[data-test="table-link"]` 的可见 “Full size table” 进入公开来源 [Table 1](https://www.nature.com/articles/s41534-024-00877-y/tables/1)。页面 H1 为 `Table 1 Algorithms’ gate counts`，返回 article 链接指向同一 article 的 `#Tab1`。实际 `table.data.last-table` 有 `thead.c-article-table-head`、1 header row（4 th）及 1 body row（4 td），无 `rowspan`/`colspan`。按序 headers 为 `Trotter K-th order`、`qDRIFT`、`LCU`、`our algorithm`；首 header 的 K 保留 `<i>`。Body 的前两列及末列保留 `<i>`/`<sup>`；第三列为单个 `.mathjax-tex` inline span。该表可研究为 simple-table-with-inline-math success 候选，不能承担 merged-cell coverage。

同一 table URL 的 `Page.getResourceContent` 返回 `base64Encoded: false`、decoded string 长 162813。初始 `<table…>` 的 `[71483, 72221)` 为 JS UTF-16 offsets；其中第三个 td 的原始 TeX 为：

```tex
N\mu t\frac{\log (\mu t/\epsilon )}{\log \log \mu t/\epsilon }
```

此 span 初始 delimiters 为 `\(` / `\)`，浏览器 MathJax 后变为 SVG/assistive MathML/math/tex script。上述形状与定位均来自实际源页面，不由 parser 输出推导。它们是 research evidence，尚非 frozen oracle；table raw-byte hash、observedAt capture ledger、sanitized resource 和 replay contracts 仍缺失，不能虚报 table resource admission。

2026-10-02T17:32:31.331Z，外部临时 helper `acquire-header-probe.mjs` 对同一 article 做 cookie-free 请求头对照：复用 production `fetchNatureArticle()` / `safeFetchExternal()`，fresh public DNS 与 pinned socket、scope/timeout/size/content-type guards 均保持；仅 wrapper 的请求头改为常规 Chrome UA、HTML Accept 与 `en-US` Accept-Language，仍 `credentials: omit`，无 Cookie/auth header。结果仍 HTTP 303 / `text/html` / `https://idp.nature.com/authorize`，未跟随该 redirect，未取得 raw article body。该结果排除了本次普通请求头组合即可解除阻塞的假设；不能据此断言 Cloudflare 或认证根因。

```powershell
node (Join-Path $env:TEMP 'academic-clipper-issue10-agent-b/acquire-header-probe.mjs') s41534-024-00877-y
```

exit 0 仅为 rejection ledger 写入成功。Helper 与 ledger 在 repo 外 TEMP；未修改 production transport、A interface、canonical spec 或测试。当前 0 admitted entries。C 仍需可验证 raw-byte article/table capture、A-generated excerpts/hashes 及 coverage-to-assertion map 才能开始正式独立验收。

## 同一侧边浏览器中的无 Cookie 请求验证

2026-10-03T15:26:40.746Z 在文章 tab 的页面 JS realm 用 Chrome CDP `Runtime.evaluate` 发起 GET `fetch(location.href, {credentials: "omit", cache: "no-store", redirect: "follow", headers: {accept: "text/html,application/xhtml+xml"}})`，随后读取 arrayBuffer 并计算 SHA-256（只在有 200 body 时才输出 hash；本文没有 source hash）。脚本显式 omit credentials，没有读取或输出 Cookie/auth header/value。

结果为 `TypeError: Failed to fetch`。同一次 Network event ledger 显示请求先由 Nature 返回 303 至 `idp.nature.com/authorize`，之后身份 transit endpoint 返回 302，最终回 Nature 时 URL 含 `error=cookies_not_supported`；Fetch 以跨域 CORS error 结束。未取得文章 body、size 或 hash。重定向中的临时 code 未保存进 repository evidence。

这在同一个侧边浏览器网络上下文中复现了“匿名 Fetch 无法跟随 Nature 身份 cookie 流程”，故不是仅命令行环境存在的现象。它**不能**证明 Nature 全站都必须登录，也不能判定最初为何触发该身份跳转；没有 Cloudflare challenge 证据。浏览器页面能显示文章与匿名 Fetch 失败，是不同请求模式的实测差异。若公开匿名路径在该网络可直接返回 200，Fetch `Response.arrayBuffer()` 可作为任何文本 decoding 前取得 response body bytes 的候选途径；本次 status chain 未给出这种可用 body，不能据此 admission。

出版社官方 [Site License Access Issue Help](https://support.springernature.com/en/support/solutions/articles/6000210847-site-license-access-issue-help) 将 `idp.nature.com/debug` 列为 Nature content access troubleshooting 页面，并说明缓存/Cookie 可能影响访问。该文档描述站点许可故障排查，不足以识别本次为何跳转，也不表示此 Open Access article 要求订阅。我们没有访问 debug 页面（不需要把任何本机身份状态传给出版社），因此根因仍未知；可确认的只是 cookie-free Fetch 没拿到 body。

后续 exact probe：在 `Network.enable` 后记录 event cursor，使用以上 `Runtime.evaluate` expression（将 result 限制为 status/url/type/content-type/byte count/SHA，绝不回显 body、Cookie 或 redirect code）；成功必须同时确认 200、canonical article body identity、声明长度/hash、`credentials: omit`，并通过 guarded policy/规范来源 review。当前这一步仍失败，不能改用已显示页面所携带的站点状态。

## 2026-10-03：多路径诊断，保持无 Cookie

本轮实际测试不同请求模式及网络路线，没有重复全部候选，也没有跟随身份 redirect。仅使用已核验的 article URL `https://www.nature.com/articles/s41534-024-00877-y`。页面的真实 links 只提供 canonical、journal RSS、PDF、supplementary PDF 和 citation/reference downloads，没有 alternate HTML/XML/AMP article link；PDF 不能替代本规范要求的真实 article DOM。实际侧边浏览器 UA 为 Chrome/154 Windows。

临时 `navigation-transport-probes.mjs` 复用 production `fetchNatureArticle()` / `safeFetchExternal()`，fresh public DoH、明确 socket IP binding、原 hostname/TLS verification、article redirect scope、15 秒 article/body timeout、25 MiB body bound、HTML type checks 和 `credentials: omit`。DNS reader 增量检查 64 KiB 并使用 10 秒 abort。注入浏览器 UA、Accept、Accept-Language、`Sec-Fetch-Dest: document`、`Sec-Fetch-Mode: navigate`、`Sec-Fetch-Site: none`、`Sec-Fetch-User: ?1` 和 `Upgrade-Insecure-Requests: 1`。四个 CDN addresses 来自同一次当前 public DNS answer，不是猜测的 origin。HTTP/2 case 使用 Undici `allowH2: true`；未记录 ALPN，不能宣称已经证明某个 negotiated protocol。

| Case | UTC observedAt | Transport address | Result |
| --- | --- | --- | --- |
| navigation-cdn-1 | 2026-10-03T16:27:19.134Z | 151.101.64.95 | 303 / text/html → idp authorize；scope rejection |
| navigation-cdn-2 | 2026-10-03T16:27:20.208Z | 151.101.128.95 | 同上 |
| navigation-cdn-3 | 2026-10-03T16:27:21.198Z | 151.101.192.95 | 同上 |
| navigation-cdn-4 | 2026-10-03T16:27:22.213Z | 151.101.0.95 | 同上 |
| navigation-http2 | 2026-10-03T16:27:23.272Z | 151.101.64.95；allowH2 | 同上 |
| proxy-navigation-http1 | 2026-10-03T16:29:42.002Z | verified 151.101.192.95 via local proxy | 同上 |
| proxy-navigation-http2 | 2026-10-03T16:29:43.084Z | verified 151.101.192.95 via local proxy；allowH2 | 同上 |

系统设置只读核查得到启用的本地 HTTP proxy `127.0.0.1:7897`，与先前浏览器 Network 观察一致；没有修改系统代理/DNS，未输出其他代理地址或 credentials。`proxy-transport-probes.mjs` 使用该无认证 ProxyAgent，但 CONNECT endpoint 显式替换为 fresh 验证的 public IP:443，拒绝其他目标 hostname；TLS servername 仍为 `www.nature.com` 并保持 certificate verification。这样比较同一本地代理入口而不将 target DNS 交给代理重新解析。无法证明 CDN 或代理后续选用的出口位置；不声称已遍历所有网络环境。

同一侧边浏览器的 JS Fetch 在 2026-10-03T16:28:23.406Z 使用 `credentials: omit`、`redirect: manual`、`cache: no-store` 和 12 秒 abort。结果 `AbortError`；Network ledger 仅观察到 exact article request，无 Cookie header key，没有收到 response 事件。此结果是 timeout/证据不足，不能写成新的 303 或证明浏览器必须使用 Cookie。浏览器请求不是 production guarded transport，故只计入诊断，不作为 acquisition admission。当前 tab 仍为原 article/title，DOM 未修改。先前 follow 探测超出 article scope；本轮明确禁止 follow，未再请求 idp。

Exact commands（external TEMP scripts/ledgers；两者 exit 0 仅表示失败 ledger 保存成功）：

```powershell
node $env:TEMP/academic-clipper-issue10-agent-b/navigation-transport-probes.mjs
node $env:TEMP/academic-clipper-issue10-agent-b/proxy-transport-probes.mjs
gh run list --repo uwougil/Academic-clipper --branch main --workflow CI --limit 1 --json databaseId,headSha,status,conclusion,url
gh run view 37135219340 --repo uwougil/Academic-clipper --json headSha,conclusion,jobs,url
git rebase origin/main
```

最新 main `ef3975c6a0eb1ec1e5a010a2df5b4f57309cebbe` 含 PR #43；CI run 37135219340 三个平台均 success，随后仅重放本 B branch 的 13 个 commits，无冲突。当前 SHA map 见 durable handoff。

| Temporary file | bytes | SHA-256（诊断文件；不是 source/fixture hash） |
| --- | --- | --- |
| navigation-transport-probes.mjs | 4315 | 648a6a8972f0b3fd05c5fce1fa9f1677ff196ed1f5349745523d45a18692f59d |
| navigation-transport-probes.json | 3607 | 9123c5bc6e9ef09da0208e5617aa00d65eb7ff24837ba136054c5e82e4227228 |
| proxy-transport-probes.mjs | 4551 | 77fc580b5dfdf2c9578b900da8c1b3faf45c5a05a5525f9a626ab010a9871851 |
| proxy-transport-probes.json | 1637 | 052eb8742860d28d726439756909870fc1b9065bc55f0c5cb9775d7eb42fb79d |

没有成功的 raw body、source hash、fixture、manifest 或新增 coverage。新证据排除了以上组合可直接恢复访问的假设；没有证明 Cloudflare 或 headless 检测为根因。有限下一步提案见 B handoff：独立批准受限的临时匿名 Cookie acquisition，或者在保持严格 no-Cookie 的另一出口继续。本轮没有执行提案、读取 Cookie 或修改 canonical。
