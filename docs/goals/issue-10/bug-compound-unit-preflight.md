# Issue #67 — 单 collector 预检

状态：`PREFLIGHT_RED / PRODUCTION_GATE_LOCKED`。仅准备新 synthetic DOM 边界；#64 仍拥有 shared Nature production，root 未释放 #67。本文件不声明实现、真实来源 GREEN、Main 接纳或 Issue #10 完成。

Own branch `codex/issue-10-bug-compound-unit`，worktree `C:/Users/guoli/.codex/worktrees/issue-10-bug-compound-unit/academic-clipper`；恢复 clean head `961092365823acf313647e28213679d81e319cff`，来源提交 `e8a67e9ce1fdf72d9d587c13d5700dacfd2bf1bb`。此前 [handoff](bug-compound-unit-handoff.md) 和 [Work Contract #67](https://github.com/uwougil/Academic-clipper/issues/67) 不变。

复用独立来源报告 `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue10-review-compound-unit-source67/issue67-source-review.md`，9975 bytes / SHA256 `4315f0c73eeca8795beb407c5b27764ecd6ffbd4cf8b11a9161a6ec96029a2e5`，99 blocks `SOURCE_CLEAR_ONLY`。Fixture 86732 bytes / `fbe6ad5fe6d53056277655422baf7e3c9fec5cac42c82473553df5cb6e9c3790`，provenance 52083 Git LF bytes / `99dfe055b180dc2c938bce90f9303431272c9752200644d37030442695877c41`。原 accepted3889 真实 batch `6=3PASS/3FAIL` / 1410.1535ms、三次 clip、链接方言独立 #65 failure 均按原时点保留；没有重新执行 raw/A/source audit、source clips 或旧测试。

## 最小实现计划（未实施）

`src/adapters/nature.mjs` 的既有 `replaceScientificRuns()` 加一个 private collector；仅认原 DOM 完整 `mScm` + contiguous single plain SUP `−1` 或 `-1`。选定 Range 从 previous text 中单位的 m 开始，到 SUP 后结束，沿 existing `replaceRangeWithScientificMarker(..., range.tex)` 路径记录一个 typed scientific run。显式 TeX `\mathrm{mS}\,\mathrm{cm}^{-1}`：mS 为乘因子，只有 cm 逆幂，不用 `scientificTex(fragment)` 把 whole mScm 取逆，不新增 renderer/normalizer/global Markdown regex/unit parser。

左端必须是明确 source lexical boundary；对 token 前完整 code point 使用 Unicode `L/N/M/_` 保护，不能用 UTF16 单 code unit 或仅 ASCII word。token 从 text-node offset0 开始但有 preceding sibling 时保守拒绝；word/style/empty I/comment 不能冒充边界。位于同一 text 中的原 whitespace/operator boundary 可以资格成立，全部 measurement/101.18/thin spaces 保持在 Range 外。右端以原 end/whitespace/punctuation 为边界，未知 word/digit/combining-mark/styled continuation、额外科学 SUB/SUP 均不归入该窄角色。

SUP 只能一个直接 text child；未知 anchor/style/wrapper/comment/split exponent、正幂/其它逆幂/分数幂/其它 compound 全部拒绝。两种 source citation cue `data-test="citation-ref"` / `href*="#ref-CR"` 自有角色，qualification 后的 citation 不被 unit Range 吞入。Opaque ancestor `pre/code/math/.mathjax-tex/.c-article-equation` 和 parent literal dollar/backtick/tilde-fence cues 沿既有保守策略拒绝；不解释已有 math/code。该计划只针对 conductivity 的已证明因子，不改变 Greek、identifier、FRB fractional、isotope 或未知科学 families。

## 新 matrix 与唯一 baseline

新增 `test/nature-compound-unit-boundaries.test.mjs`（7227 LF bytes / SHA256 `77c9212b8662f7f0ff5534c7fd5a757a21949997672e32ebc043b8be0e576666`）。明确 synthetic scaffold、parse-only，没有 scholarly metadata/prose、真实 fixture、Defuddle、hydrate、clip 或 writer。8 个 qualification 包括两种负号、完整 measurement/邻接、punctuation/operator、两种后继 citation 以及有明确空格的 styled neighbor；37 个 rejection 包括 Unicode astral L/N、combining M、跨 sibling/empty I/comment、two citation cues、opaque ancestors/literal cues、unsupported exponent/compound/continuations；1 个既有 styled/numeric/MathJax separation control。

使用 root 已核 Main/Secrets 成功的 accepted `73d6cfafba9bb33149959e315ab29b5b0bc24d75`，src tree `9a79861e85a539b87da96e08ef855f037348cd64`；34 个原 Git `src/` blobs 只导出至 own ignored `node_modules/.cache/issue67-accepted-73d6`，per-file hashes 在 external `accepted-runtime.json`。没有 dependency merge、更改 own production、采用 pending64 或复制 A sanitizer。

唯一运行（PowerShell 设置环境后 finally 移除）：

```text
NATURE_COMPOUND_PREFLIGHT_MODULE=<own ignored runtime>/src/adapters/nature.mjs
node --test test/nature-compound-unit-boundaries.test.mjs
```

**exit1，46 tests = 38PASS / 8真实预期RED，10177.4508ms，0 skip/cancel/todo，0 harness failures**。8 FAIL 都首先停在 expected compound role count `0 !== 1`；后续 exact Range/TeX/citation assertions 仍须实现后实际到达，不能因 baseline 首断言失败便声称已验证。37 拒绝及1旧角色 control 实际 PASS。HTTP/fetch、DNS lookup/promise lookup 先记录 attempt 再 throw，after 独立核 ledger `[]` 并 finally 恢复 originals/关闭每个 JSDOM；测试只调用 `parseNaturePage()`，不声称运行时 writer spy。

External TEMP `C:/Users/guoli/AppData/Local/Temp/academic-clipper-issue67-preflight`：log `synthetic-red-73d6.log` 10989 bytes / SHA256 `66d4a0f692ddf35457766d55477e4274aadff3f80c39866f0f3d5a201f0552ed`；runtime receipt `accepted-runtime.json` 5514 bytes / `7bf51d6d2762345c17fb1bdf25788aa0df47693bcb9cef30a852c27b27f993ac`。这些记录仅此一次新 matrix，不包装成 whole Materials / canonical C acceptance。

## 后续与复用边界

另一 owner 先独审本计划/新 matrix；保持原99-source审核不重做。只有 root 在 #64 merged Main 接纳后正式释放共享 Nature gate，SAME owner 才 adopt 届时 latest accepted main 并实施以上单 collector。新实现必须让原 truthful source regression 三方言 GREEN，并补 exact σ/temperature/quantity/citation/resource 邻接与四 validators（#65 已接纳后不再期待 links rawHTML failure）。运行 source clip 时 network guards 必须覆盖其实际调用；任何被 catch 的 attempt 仍独立 FAIL，结果每 style 缓存一次。生产改动后仅必要 focused/affected/full/build/golden/fresh3CI/Secrets/exact-head independent review，未变来源/source99/oldRED 不因角色恢复重跑。

本预检没有实施、full/build/golden/CI、PR、live capture、spec/intent/security/writer/dependency/golden 变更；这些不是省略验收，属于尚未释放的下一阶段。无 spec change proposal。
