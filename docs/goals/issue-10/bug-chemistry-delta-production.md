# Issue #73 — Δ 键位标签 focused implementation handoff

当前为 **BROADER_READY_FOR_PUBLICATION**。真实来源15项、完整synthetic边界47项与不同作者exact-head实现审查均通过；本轮唯一affected/full/build/只读golden验证全部成功。Fresh PR CI/Secrets、最终publication-head审查、merge与merged-main接纳仍待root完成，不宣称#73完成或#10 ready。

## 分支与选择顺序

- Work Contract：[Issue #73](https://github.com/uwougil/Academic-clipper/issues/73)。
- Worktree：`C:/Users/guoli/.codex/worktrees/issue-10-bug-chemistry-delta/academic-clipper`；branch `codex/issue-10-bug-chemistry-delta`。
- 最新accepted base：`0d5972e5cb5827c1aee9610323cb702482a217d6`。Root已验证同SHA的[Main CI 37840170270](https://github.com/uwougil/Academic-clipper/actions/runs/37840170270)、[Secret scan 37840170195](https://github.com/uwougil/Academic-clipper/actions/runs/37840170195)全部成功，#72 automation于2026-10-08T20:37:59Z完成合同，之后正式释放#73生产owner。
- 原source `8301a6465ef112a31fb8891bc75a0796e34e838f` → source handoff `c754d545b03045fb9d161a41174d067ff5dea781` → preflight `7d04f7e79af7666632c392a40be09780fd6c5932` → plan tail `69088a1cbad628acebfc8c4073b5c6ce119341fc` → dependency-only merge `2b1c61b200ec9433bf00fa531c4b937b1d4e9a00` → authored production/harness `3232733729a05bf9e2979387bde2e095ab5aaa21` → 本DOCONLY交接commit。
- 原57-block来源独立审核与最终PLAN_ONLY_CLEAR/blocking0按精确未变source/plan沿用，未重新审计或运行历史preflight。审核路径和hash见[原handoff](bug-chemistry-delta-handoff.md)。

## 根因与修复范围

源Results p4两处plain `Δ<sup>12,13</sup>-alkene` 在Defuddle前没有typed base/script保护，最终形成 `Δ$^{12,13}$`；原严格validator正确拒绝两个orphan。此修复只在`src/adapters/nature.mjs`增加29行Nature private `collectDeltaPositionRun`及既有dispatch，复用`range.tex`与marker/Defuddle/renderer。保留原literal Δ和完整script group，输出`Δ^{12,13}`，原`-alkene`留在range外。

资格为plain contiguous Δ加单一plain-text SUP，SUP exact集合`['12,13','12','13']`。后两者仅synthetic grouping controls；不推断化学意义、不采用通用Greek/数值/comma扫描。Unicode L/N/M/_与astral边界、未知sibling/comment/wrapper、额外script、styled/complex SUP均保守拒绝；右侧只接受parent end、立即text的whitespace/合格punctuation（排除underscore）或由既有anchor cues独立证明的citation SUP。code/pre/MathML/MathJax/equation与literal math/code cues维持opaque。未知14继续原路径。

只另改原真实source测试的必要生命周期和更完整断言：11个HTTP/DNS方法的record-before-throw guards先于动态生产导入；真实三个方言一次完整batch内保持Defuddle首次DOMParser所属窗口存活，之后关闭全部实际观察窗口并恢复10个DOMglobal descriptors。来源test原15 registrations与所有原科学oracle保留，默认路径始终fresh clip，移除可选cache执行；外部保存输出只供明确诊断，不充当当前pipeline验收。

新增断言消费ALL ordered科学runs及markers、ALL四个完整paragraph atoms、完整原paragraph science/prose与无残留marker。原typed citation clusters `[[5],[27,36]]`和36条references先独立验证，再从可读性比较中仅移除对应三个方言的精确完整emitted clusters（Quarto keys来自对应已验证reference），绝不删除普通comma或任意numeric links。严格grouping oracle独立保留，不靠可读性flatten证明attachment。

## 唯一必要依赖恢复

自己的原`node_modules` junction指向`C:/Users/guoli/.codex/worktrees/3417/academic-clipper/node_modules`，实际`jsdom`不可用。先核验绝对own root、link路径与Junction类型，以`Directory.Delete(link,false)`仅删除自己的junction本身，不递归、不触碰target。随后在自己workspace按committed lockfile执行一次`npm ci`，exit0，65 packages、Node v24.14.1；own `node_modules`为普通目录、LinkType null。未写其他owner目录或升级依赖。

Lock SHA-256前后均`5563c3ec2ac88844ce89f6034b69b31d4dba84bef84df80ce9ebbed8ef42a7a1`。安装原log完整保留（含npm既有audit摘要），没有执行`npm audit fix`。准确before/after路径与安装结果在machine receipt。

## 当前focused执行及首次失败保留

外部根：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue73-production-0d597`。普通测试未访问live article/DNS/HTTP、未调用writer；writer proof为生产clip-only静态callgraph，不声称spy。

首次实际命令：`node --test test/nature-chemistry-delta.test.mjs test/nature-chemistry-delta-boundary.test.mjs`，终止exit1，62 tests、59 PASS/3 FAIL、11081.5818ms、0skip/cancel/todo。完整边界47/47通过；source15为12PASS/3新增whole-prose harness FAIL。严格two Δ roles、complete atoms/markers、math validator已通过，失败只因全文显示投影漏删`^`。首个output/cache/log/process/input identity全部保存`focused-first/`，不改写为GREEN。

同三个已保存结果上的pointed zero-DOM/zero-parser/zero-clip检查进一步发现links原citation cluster的内部分隔comma应随整个typed cluster移除；首次失败诊断脚本`check-readable-cache-first.cjs`保留。最终`check-readable-cache.cjs`采用精确原typed clusters，三方言完整原paragraph全部匹配，exit0；`cached-readable-reconciliation.json`明确newClips/newDOM/newParses/productionImports/sourceAudits均0。这仅诊断presentation，不修改来源、production或strict grouped oracle。

随后仅运行必要修改后的source文件：`node --test test/nature-chemistry-delta.test.mjs`，实际exit0，15/15 PASS、1195.3061ms、0skip/cancel/todo；`source-final/`保存独立fresh三方言结果。两次source batch的Markdown与semantic逐字段相同，三次转换实际窗口3opened/3closed，source DOM2opened/2closed，11个HTTP/DNS guards attempted ledger`[]`且exact bindings和10个DOMglobals恢复。每方言原9creators、refs36、citations、compound bold序列、GABA_A/PtO_2、C12/C6/C5/percent prose与两exact warnings均保持，四个production validators全部valid。

未重跑边界47：它的production与boundary输入bytes在首次执行、修正后source执行及提交后完全相同，故沿用当前实现首次GREEN。实际42parser DOM关闭、3synthetic body/caption clips/3窗口关闭、guard final ledger`[]`及exact bindings恢复；ALL runs/markers/math/citations/完整atoms/placement与四validators均执行。不存在以tail5代替full47或隐藏skip。

精确commands/argv/env/node/start/end/输入前后bytes与hash、两个process实际exit、logs/guards/results sizes/hashes位于[production receipt](bug-chemistry-delta-production-receipt.json)。Source fixture57405 bytes/SHA`50e7bd3c941c8b448e49357109c38d1842821ce4ef2d270580a3663c1ae27030`；provenance34944/SHA`0fb4c17500d9d2d5d878196d7f9788a6005d90e4dfa5c8cbfafca001d85e91d4`。原source57、raw/A/sanitizer/projection、历史三clips/preflight43/tail5均未重做。

## 后续gate与消费者

不同作者对clean head `2f66f8e76b93413f2779e5b45568b525b5c0b27a` / tree `ce17434c677af3d75819094169c2a52d36035242` 给出IMPLEMENTATION_CLEAR，blockingFindings=0、P0–P3均0。Root完整读取后正式释放本轮broader/publication。Fresh三平台PR CI/Secrets、最终publication-head审查、十项门槛与successful merged-main均仍必需；author不merge、不手工关闭Issue。唯一独立delivery PR使用精确 standalone `Refs #73` 行，创建后立即attach；最终PR URL/head由root持久接续。

只接纳最小生产/harness与DOC文件；fixture/科学oracle、spec/PRD/EDD、dependency文件、validator/security/writer、golden与B/C/D均不改。`git diff --check`通过；protected paths自原plan69088无diff。无spec变更提案或human-only blocker。

Agent C的完整Chemistry复验依赖#73和独立trailing-group SUB #74均accepted后统一执行；本bug通过不代表后三个化学group已解决，不重复C框架或B来源审核，也不宣称Issue #10完成。

## 唯一broader验证与publication交接

外部根：`C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue73-broader-3232733`。本轮复用已安装的ordinary own node_modules与committed lock，不重复npm ci。唯一wrapper `run-broader.cjs` PID51368依序执行下列四tier；以实际PID/commandline和同一closed receipt观察，未因工具未转发session字段而重启。全部4tier exit0、280个tracked source/test/fixture/extension/scripts/package/golden输入在每tier前后bytes/SHA一致，全部9个golden tracked files不变。完整argv/env、起止UTC/PID、日志hash及完整input inventory在production machine receipt。

| tier | 实际结果 | UTC起止 / PID |
| --- | --- | --- |
| `node --test <34 existing files>` | 905/905 PASS，11175.2061ms，0fail/skip/cancel/todo | 2026-10-08T23:24:27.851Z → 2026-10-08T23:24:39.107Z / 15668 |
| `npm test` | 1180/1180 PASS，82215.1407ms，0fail/skip/cancel/todo | 2026-10-08T23:24:39.128Z → 2026-10-08T23:26:01.642Z / 49112 |
| `npm run build` | exit0 | 2026-10-08T23:26:01.663Z → 2026-10-08T23:26:01.936Z / 53008 |
| `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto` | exit0 | 2026-10-08T23:26:01.958Z → 2026-10-08T23:26:02.241Z / 48828 |

Affected明确排除自己两个新增#73 focused文件；完整npm test按默认scope真实执行全部1180项，包括source15及boundary47，没有cache、production override或hidden skip。仅full设`CHEMISTRY_DELTA_RECEIPT_ROOT=<根>/full-source`与`CHEMISTRY_DELTA_PREFLIGHT_RECEIPT_ROOT=<根>/full-boundary`，供真实结果记录。真实三方言3clip windows opened3/closed3、source DOM2/2、11 HTTP/DNS方法attempts[]、exact bindings与10DOMglobals恢复；boundary scopeall关闭42parser DOM与3mixed clip windows、3synthetic clips、attempts[]与bindings恢复。网络ledger的直接观测范围是#73 source/boundary；其他full tests继续既有mock或loopback契约，不声称全进程syscall监测。Writer absence仍为静态clipNature callgraph，不冒称spy。

Golden实际strict math/raw HTML/Markdown structure/crossrefs均valid，250inline/13display、50references、1structured table、issues[]。该命令只读，不执行live clip或writer；build只生成ignored dist。Source57/历史preflight/tail/standalonefocused/旧clips/独审runtime probes均没有额外重做。此前first62的3个harness failures、修正后source15与未重跑boundary47的证据全部原样保留。

本次仅production MD与receipt两个DOC路径变化；生产code和source/boundary输入不变。Source fixture与provenance原bytes/hashes保持，保护路径无diff。更新文档不触发重复测试。当前交接给root进行最终published-head独立review、fresh CI/Secrets、十gate及matched merge；#73与#74均accepted后才解除Agent C完整Chemistry复验依赖。无spec或security变更提案。
