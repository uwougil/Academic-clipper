# Issue #75 — 括号数值基底平方：来源与 RED 交接

状态：SOURCE_ONLY_RED。来源与永久 regression 已提交；生产修复、不同作者的来源审查、全量验收均未完成。此分支不作为可合并交付，不声明 Issue #10 或 FRB 验证完成。

## Work Contract 与隔离

[Issue #75](https://github.com/uwougil/Academic-clipper/issues/75)，type bug / OPEN。恢复时已发现并直接回读成功创建的契约，因此没有再次创建或修改 Issue。契约符合 PRD §3/§6、EDD §2.3–2.5 与 canonical §5–7；没有历史引入点证据，分类为 implementation bug。

- Accepted base：f4a5f2ad74546ea54b990c6080e480871ee98e09。Main run 37725961177 与 Secrets run 37725961084 对同一 merged SHA 成功；源 regression 运行于该生产状态。
- Branch：codex/issue-10-bug-parenthesized-power。
- Worktree：C:/Users/guoli/.codex/worktrees/issue-10-bug-parenthesized-power/academic-clipper。
- Ordered commits：76e7bfa24217a962a0ba13753e7e2111575b57c4（以下六个来源/test/diagnosis 文件）；本文件所属的后续 docs-only commit。完整最终 SHA 由发布回执及 git log 给出，避免自引用 commit hash。
- 原 B 来源合同：b718fa8b826c2abeb45c2dd30cd5414b3d6d8330；不改 B/C manifest、fixture 或 oracle。
- Production、validators、security、writer、dependencies、golden、CI、canonical、PRD/EDD 均未改；没有 PR 或生产修复。

## 原来源与科学 oracle

[原文](https://www.nature.com/articles/s41586-022-04755-5)，A repeating fast radio burst associated with a persistent radio source，Nature，DOI 10.1038/s41586-022-04755-5。observedAt 2026-10-03T16:48:03.040Z，guarded-http、公开匿名 source body 545450 bytes，SHA 190a270027c69a816b2647d2fdc6f1777cdf669695506fa40f2fe3cab8801ace。外部原件 C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-agent-b/s41586-022-04755-5.anonymous.raw.html；没有重新访问站点、凭据、cookies 或 raw commit。

原 Methods paragraphs[22]，稳定结构 selector #Sec2-content > p:has(> i:nth-of-type(4) + sub:nth-of-type(4) + sup:nth-of-type(3)):not(:has(> sup:nth-of-type(4))):not(:has(a))。完整段落的 pre-sanitize/frozen subtree SHA 均为 4fe682650c4c464c1d6341c364241d29e154f18ecf7c8565de908b840c9a6fe5。全段位置：原 raw UTF16 [226978,228185)，原 UTF8 bytes [228124,229368)。

| Oracle ID | 原 SUP index | 完整基底 | 指数 | raw UTF16 | raw UTF8 bytes |
| --- | --- | --- | --- | --- | --- |
| methods-p22-parenthesized-power-1 | 0 | (5/60) | 2 | [227371,227383) | [228530,228542) |
| methods-p22-parenthesized-power-2 | 1 | (0.19/60/60) | 2 | [227980,227992) | [229154,229166) |

两 SUP subtree SHA 相同：4c26c9b7846d9f3fe6adde2d80dde7c3a5a2e28f995054923c9aa1301c16ad66。平方属于整个原数值括号，前置 π 与后置 /8 均在平方外。不能平方 π、只平方最后 60、改写斜线数值或补科学公式。源第三 SUP −6 属于 10；四个 S 的 sub 顺序 source/offset/offset/source、5.5 GHz、0.06/0.01/0.12/0.19 arcsec 与 steradians/Sr 原值/文字均保留。

选定全段零 href/citation，因此引用定义所需 prefix 恰为 0；没有对应 figure/table/display-equation/supplementary resource，不能制造目标或引用。此角色是独立括号数值分式平方，区别于 #48 简单 numeric/unit、#63 split sign/digits、#72 fractional units、#74 chemical-group SUB。

## A 接口、projection 与权利

消费实际 A helper blob e56f140d9756bb83013b9df0716dc650e04d7917，34946 bytes / SHA a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c；sanitizer nature-corpus-sanitizer/1.1.0、subtree nature-corpus-subtree/1.0.0、projection nature-corpus-projection/1.0.0、recipe 1.0.0。使用 sanitizeNatureHtml(rawDecodedHtml, provenance.recipe)、serializeSubtree(node)、sha256Bytes(bytes)，没有复制另一个 sanitizer。实际 helper/schema 的提取仅在 own ignored node_modules/.parenthesized-power-runtime，schema blob 3edf568bc82f9b0302f737acb5e0b19295cb927b / SHA 7f0563889be154bcb91633ee48d5ce1218d9b8aa6c46614a07bf461bd3e03915。

Recipe ID s41586-022-04755-5-parenthesized-numeric-powers-v1，recipe SHA f6b3803cd12ed3ed30705b39a91f22eeda1d07d340d14c11a9f7bb3e780adf1c。48 个完整 source blocks：39 metadata（全部 35 有序 creators），canonical、article JSON-LD、title、Methods H2 Sec2 / Persistent radio source H3 Sec9 / Chance coincidence association of the PRS H4 Sec14、完整原 p22、完整 CC BY4.0 rights paragraph、publisher site footer。原科学 inline 没有 pretty-print 或 whitespace collapse。

Fixture 25549 bytes / SHA f672ec55261b61376bb1b0a82889e05b45deec9123442dccabab9829ebcd45de，UTF8 无 BOM、LF、repeat bytes / idempotence 相同。projection structure SHA 150273c2785e9ef85f16f2fa2fecb570c64d45eb08918c6fe5238ff92a98fb72，payload SHA cbe31bfe2773d621a6ea5a0c28ae882b25a2824541d29070dc7707b778e2a0b2，不把整页或其他 projection hash 混用。

转换：完整 block/必要 ancestor 选择（48）、固定 scaffold/attributes ordering/LF（1）、article JSON-LD 裁剪（1）、6 个非 scholarly 属性删除。省略其他 body 段落（含独立 #72）、零前缀 References、无关联 resources/binaries、无关 UI/account/tracking/executable；原科学段落与 35 creators/rights 保留。原 CC BY4.0 notice/license link 界定保留材料权利；站点 footer 仅为 publisher footer，不将其混同 article-specific 权利，也不按代码 license 重新授权。

初次 ordinal selector 在 excerpt 重放时选不到段落，记录失败原样留在外部；后续稳定 original structural selector 修复 recipe 定位，补齐必要 H3 ancestor 后最终 48 blocks repeat/idempotence 通过。没有改变科学 source 来让 parser 输出通过。不同作者对这个新的 48-block projection 的 source audit 仍 PENDING；producer 验证不能代替。

## 已执行命令和实际证据

初生产 RED：Node v24.14.1 / Windows，node --test test/nature-parenthesized-power.test.mjs，exit 1；15 tests，6 PASS、9 true parser FAIL、0 harness FAIL，1046.1507 ms，0 skipped/cancelled/todo。两个原 attachment roles × 三方言的 6 semantic tests 与三方言 strict math 的 3 tests 失败；来源/metadata/原其他科学值/resource/警告控制与明确标注 synthetic 的 compatibility 通过。没有用缓存重跑测试或伪称 GREEN。

实际 clips 恰 3：markdown、links、quarto 各一次，通过本文件 suite 的 per-dialect shared promise 保存同次完整 result/Markdown。PARENTHESIZED_POWER_RECEIPT_ROOT 指向外部 red-f4a5；PARENTHESIZED_POWER_CACHE_ROOT 本次真实运行未用。未来生产修复验证必须取消 cache 变量并运行真实 chain。

四 production validators 每次实际执行：math 每方言两个 isolatedSuperscript / valid false；rawHtmlValidation、markdownStructure、crossReferenceValidation 均 true。两原科学位置最终变为 (5/60)$^{2}$、(0.19/60/60)$^{2}$。Nature cleanedHtml 仍保留两完整括号/SUP；Defuddle bodyMarkdown 插入 presentation 空白；academic normalization 首次产生孤立指数。现有 literal-base collector 匹配 simple numeric/unit bases，未保留此完整数值括号，后续修复应在既有 bounded DOM/scientific run 边界解决。

最终 MD 位置域分开：markdown/links 开括号 UTF8 offset 1395/2004，line 57、UTF16 column 381/975；quarto offset 1502/2111，line 54、column 381/975。Validator 在 dollar 起点，column 387/987；不能混同括号 role 起点和 validator 起点。

Exact warnings（三方言一致）：No Nature figures were detected.；No equation nodes were detected.；No Nature reference list was detected.。refs/citations/resources 均零，没有 warning wildcard。HTTP/DNS guards record-before-throw、after 检查 attempts=[]，复原 fetch/dns.lookup/dnsPromises.lookup 并 syncBuiltinESMExports；fallback 不能吞掉 attempts 记录。writer 非调用证据是 clipNature 静态调用路径，不声称 runtime writer spy。

先前 node 外部 freeze.mjs 最终输出 48 blocks（freeze.final48.log）；外部 receipt.mjs 只读同次 3 caches、源 hash 和日志后生成 diagnosis，没有重新 clip/source projection；contract-receipt.mjs 在 Issue #75 回读后只附加 issue 字段，source/projection bytes 未变。恢复 owner 只读既有证据并补文档，新增 raw/source/sanitizer/clips/tests 次数均为 0。未运行 full/build/golden/CI：此时尚无生产修复、source-only tests 仍真实 RED，避免无意义全量重跑。

Git diff --check、git status --short、tracked diff scope 在 docs-only 发布前检查；结果与 final commit/clean push 由发布回执记录。

## 固定文件与回执身份

以下为 source commit 76e7bfa 的 Git UTF8 blob bytes（不以 PowerShell 字符数或展示行尾替代）：

| File | Bytes | SHA256 |
| --- | --- | --- |
| test/fixtures/nature-parenthesized-power/.gitattributes | 80 | 88ea5e6fa1b78031a906f8966b9d6df30fa7c567a3a0a4c53c659625acd26166 |
| test/fixtures/nature-parenthesized-power/README.md | 2542 | b2e4638398c9e2bfb3a09871d36e4a6d283d5f0832112da2adc508fe1b0e4d42 |
| test/fixtures/nature-parenthesized-power/diagnosis.json | 11434 | 968b3dc0a185ce674dce915e13e5f7af6a02e79b2e5dc65871dd9e3065f49628 |
| test/fixtures/nature-parenthesized-power/s41586-022-04755-5.excerpt.html | 25549 | f672ec55261b61376bb1b0a82889e05b45deec9123442dccabab9829ebcd45de |
| test/fixtures/nature-parenthesized-power/s41586-022-04755-5.provenance.json | 31939 | 8ed315749e0dcf860053b1bbdbe73ef910b1480415a3ba49ea1c86a4e5b9b4e3 |
| test/nature-parenthesized-power.test.mjs | 9119 | 8b21132dde2d56dd0ad8ef624866c7ee3bf15845f19aa5fcde53759ac0db5c32 |

外部不可变回执目录 C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-parenthesized-power：

| Receipt | Bytes | SHA256 |
| --- | --- | --- |
| freeze.initial-ordinal-selector.log | 1066 | 036b7880456c9c41243d16f614da179c54e702e932ce943f513a9d22e7539406 |
| freeze.final48.log | 707 | 4aa6ae38a44fedacffe90152a0c1b12e02ac679f0aa8ac52c552c0deaf90adb0 |
| freeze-receipt.json | 3456 | 7508ae2a2104d2e4a9de5a65827f6a0579a0df4e168914a0a33b971d4b015e8d |
| red-f4a5.log | 15358 | 7a3559f34a1ccf41deebd5cd6df07b3ad6d46e151ccc7119de7b4366a82860b3 |
| source-only-receipt.json | 11910 | 77917a167cf75f274eed411abc8d82ce7025d7c55ebc9562cb998d8eccbbc96c |
| source-only-receipt.before-contract.json | 11788 | e1c9c02d26a99db44f24cf37c001d078e2e7ffad5c091943b3aa95fef20e3d52 |
| issue-readback.json | 5751 | 054c142e3282c2e28b28d16965495fd0c65348824f9900f75e507c803f8adb96 |
| red-f4a5/network-ledger.json | 126 | 544c4994b879b82ac0fb627a191e5de34c97b90c9311fcdb740365a4d6f8cf51 |
| red-f4a5/markdown.result.json | 65667 | 8305cdd36e33b4df08e390def6fe40f6ae4ca061f08637501a5cc3972aad302a |
| red-f4a5/markdown.md | 2208 | 725ce4101edec2a267e13fc18fbccf015db22b8864e08c338803f725eef0db37 |
| red-f4a5/links.result.json | 65625 | 77e57b07640d639884db17c0cfc49634ff1a4c07858014bde4233a3e6c4997d5 |
| red-f4a5/links.md | 2208 | 725ce4101edec2a267e13fc18fbccf015db22b8864e08c338803f725eef0db37 |
| red-f4a5/quarto.result.json | 65854 | 6ffad973abfbda74b4b6eb3028923a019bce29703b40686cd24e46f4d4503361 |
| red-f4a5/quarto.md | 2315 | 0b8204e86d1e4943ea6339a7e07bb0718c26a8ee4e13f639e1da69803c9773ac |

完整 source raw 与完整 Markdown/results 留在外部，不作为 Markdown snapshot 进入 Git。既有 source-only-receipt.before-contract.json 在附加 Issue 字段前的 provenance hash 与最终 provenance 不同，属于元数据变化；fixture SHA 始终相同。

## 后续 unblocking conditions

1. 不同 owner 只对本新 48-block projection 进行一次独立 source review：验 raw body prehash / stable original locators / 48 retained block digests / ancestors / scientific order、两 whole-base roles 与 π/8 boundary、35 creators/identity/rights、A exact helper 下重建 bytes/signatures、repeat/idempotence；不可审全 B85 代替或再回头生成相同来源。
2. Orchestrator 释放共享生产 owner 后，才能在最新 accepted main 继承这些固定来源/test/diagnosis 并做最小修复；先冻结 numeric-parentheses qualification/rejection controls，保持 math/code/citations opaque 与 unknown parentheses 不猜测。不能 article-ID hardcode/global dollar rewrite/validator 放宽/第二 parser。
3. Focused source 原 3 styles 真实新执行且 semantic / 全四 validators GREEN；保持源原值、roles、顺序、邻居、integer power/变量/measurements/zero-resource metadata、warnings，必要 affected tests。不同 owner 先增量审 stable code/test checkpoint，再执行一次 required full/build/golden/fresh CI/Secrets 与 immutable-head 最终审查，按 root 十门槛交付 narrow PR。
4. C 只有在该独立修复 accepted main、merged Main CI 成功后，才解除相应 FRB scientific-inline blocker；最终 integrator 统一完成 Issue #10 acceptance。

未提出 canonical/PRD/EDD 变更。Issue #75 尚未修复；独立 source audit 尚未完成；本源码/test branch 不 merge、不运行 final Issue #10 PR。
