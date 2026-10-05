# Nature 稀疏主图 short-alt 来源回归

本目录是 [Issue #55](https://github.com/uwougil/Academic-clipper/issues/55) 的独立 bug 输入，当前只保存来源与真实 RED。它不是 Issue #10 corpus 的第二个 manifest、parser 或 assertion framework。生产文件未修改。

原文章为 [A draft human pangenome reference](https://www.nature.com/articles/s41586-023-05896-x)，DOI `10.1038/s41586-023-05896-x`，Nature。完整 119 位原 ordered creators 见 provenance 的 `sourceRights.orderedSourceCreators`；excerpt 保留同一序列的 citation metadata。来源许可为原 article 的 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) notice；原文字、链接、位置与 pre-sanitize digest 均保留在 `sourceRights.notices`，excerpt 也保留原 notice。`sourceRights` 另区分原 publisher footer，不把 footer 当成文章许可，也不为原第三方材料另行授予许可。

## 保留范围与独立期待

输入来自 B frozen snapshot `b718fa8b826c2abeb45c2dd30cd5414b3d6d8330` 已获取的 untouched anonymous raw body，无新 live fetch。重新在原 DOM 验证 canonical、DOI、title、journal、公开 article JSON-LD、119 authors、完整 rights、四个 wrappers 与相邻段落；C checkpoint `bc81a28d8edf05bbba06b1a82cdedcde3d6f8ac6` 也独立记录相同 source short-alt packet。

| 原 source ID | 原 locator / B block | 原 pre-sanitize subtree SHA-256 | source short alt |
| --- | --- | --- | --- |
| Fig1 | `#figure-1` / `a-section-2` | `a67baa58454b5076eb464f4c74d03fc02ba56af081e7ca81512805d02334e8f1` | Figure 1 |
| Fig3 | `#figure-3` / `a-section-3` | `0f62fea715fb860ff8ff262245ac20798dbb989ce926ea605434c87fee9fec11` | Figure 3 |
| Fig4 | `#figure-4` / `a-section-3` | `ef1abb9b5ba8717a76a24d4bc31b39cbc884bdba0280508cb3aebef94f86b0d4` | Figure 4 |
| Fig5 | `#figure-5` / `a-section-3` | `7ec9deb70e1b659a58c27b09ae5a9173c62cdeecdbdb00c85ea34bc8480e04b3` | Figure 5 |

每个 wrapper 原样保留完整 figure title、picture/source/img candidates、caption siblings、全部 description/panels；保留原 ancestors 及前后完整 paragraphs。原 source sections 中的前/后 paragraph 零起算位置依次为 `0/2`、`0/2`、`7/9`、`12/14`。`sourcePositions` 记录全部 204 selected nodes 的原 DOM element index、section、paragraph index、serialized bytes 和 prehash，`sourceFigures` 保留完整 payload 与 source image attrs。

保留选定正文所需的 Methods heading `#Sec18`、真实首个 subsection `#Sec19` 和完整首段 `#Sec19 + p`，使原 section targets 在 Defuddle 后仍存在。只保留空 Methods heading 的早期投影会被 Defuddle 删除并留下 links/quarto dangling targets；最终 recipe 增选真实上下文后，四 production validators 在三方言全部通过。没有手编 heading 或放宽 validator。

References 保留原 list prefix 1–48，即四 wrappers、相邻 paragraphs 与 Methods context 的最大 citation 编号。Full raw 确实还有 Fig2；它不在 B 已接纳稀疏 projection 与此窄 excerpt 内，不制造缺图。原 Extended Data、其余正文/作者信息 UI 与 reference 49 之后明确不在本输入覆盖范围内。

source short-alt 由原 caption `Fig. N:` 和对应 `FigN` marker 直接核验，不从 adapter output 反推。兼容期待 `expectedAnchor` / `expectedIdentity` 则明确保存既有 ordinal routing，保护本 bug 只修 alt，不把其他字段一起重编号。原 `picture/source` 中唯一无 descriptor 的 srcset candidate 位于 img fallback 前；`expectedImageUrl` 记录该 source candidate，`sourceImageUrl` 单独记录原 img fallback，避免误把两者混同。

## 字节、版本与重建

| 数据 | Bytes | SHA-256 |
| --- | ---: | --- |
| untouched raw body | 1,251,945 | `342b8dc5d0bf7d01618a3e9965ef6de9b23c59c7f7bef429592cbdb7852c36ec` |
| committed excerpt | 143,109 | `468df531667836eb8484b522482b915bad8de9f375a06489423b34e8bb43a537` |
| recipe | 按 A `stableJson()` 计算 | `db247b8e4a6a636f16b941adeac369e9109b8cdad7e8f8f209a763e7ef0162c0` |

使用已有 `scripts/lib/nature-corpus-infrastructure.mjs`，没有复制 helper 或整个 A branch。实际读取 B snapshot 的 Git blob `e56f140d9756bb83013b9df0716dc650e04d7917`，34,946 bytes，SHA-256 `a8fb615105fe538b05e200d83c2c9895c80550c16f07c3abf8b3cfaaf45f4f7c`。Schema/recipe `1.0.0`，sanitizer `nature-corpus-sanitizer/1.1.0`，serializer `nature-corpus-subtree/1.0.0`，projection `nature-corpus-projection/1.0.0`。完整 recipe、retainedBlocks、transformations、signatures、omissions 与重复/幂等证据在 provenance 中。

在具有该原 raw body 的外部审核环境，读取 provenance 的 `recipe`，使用上述 existing helper 的 `sanitizeNatureHtml(rawHtml, recipe)` 重建。先核 raw Buffer 的 bytes/hash，再用 `serializeSubtree()` 核四 wrapper 和全部 `retainedBlocks` 的 source prehash；生成 bytes 必须与本 excerpt 完全相等。对同一 raw/recipe 重复生成及对 sanitized HTML 再 sanitization，均已实际验证 byte-equal。UTF-8 无 BOM、LF、deterministic attr ordering；source inline whitespace 未 trim。目录 `.gitattributes` 只对原 HTML 的 blank-at-eol 做 source-preserving 设置，其他 diff 检查保留。

普通回归只依赖本目录已提交 bytes 与现有 production API，不依赖 TEMP raw/helper 路径，不抓取网页，不下载图片、不调用 writer。无 table/table-link，因此 `clipNature()` 没有 hydration DNS/HTTP。

## 真实 RED 与 synthetic controls

```powershell
node --test test/nature-sparse-figure-alt.test.mjs
```

未改 production 的 accepted `e2d32e9ec819692a1f08075636c3a168f15ad20b` 上 exit 1，10 tests：6 pass / 4 fail，0 skip/todo/cancel。Adapter 与最终三方言的 alt 均错误为 `Figure 1/2/3/4`，应为 `Figure 1/3/4/5`；四个失败只证明这个行为。三个独立 preservation tests 全部通过完整 caption/panels/邻接正文、原 image association、ordinal anchors/identities、ordered metadata/references、全部 production validators/scientificFragments 和精确 warning `No equation nodes were detected.`。

两个标明 synthetic 的 inline HTML controls 只保护既有 id-less/无可识别 label fallback 与 Extended Data identity/alt；不算真实 Nature 来源，也未写进 article admission。图片本地 filename、实际下载/IO 在此 source-only preflight 没有执行；后续最小 production fix 后须完成 affected/full/build/golden、独立 review、fresh CI 等最终交付门槛。
