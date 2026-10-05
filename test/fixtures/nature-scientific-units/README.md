# Nature 科学单位摘录

这些最小摘录保护 [Issue #48](https://github.com/uwougil/Academic-clipper/issues/48)。来源是 Issue #10 Agent B（`b718fa8b826c2abeb45c2dd30cd5414b3d6d8330`）记录的 untouched anonymous HTTP bodies，使用既有 A `sanitizeNatureHtml()` helper、sanitizer `nature-corpus-sanitizer/1.1.0`、serializer `nature-corpus-subtree/1.0.0`、recipe/projection `1.0.0` 选取。本目录没有第二个 parser、完整 captures、图片 binary 或凭据。

`s41598-018-38309-5.article.excerpt.html` 保留含 7 个 unit powers 的三个完整 Methods paragraphs、实际 ancestors/heading、article metadata，以及原 references prefix 1–73。完整 prefix 保护原引用编号，没有重新编号。FRB article excerpt 保留 metadata 和真实 Table 1 wrapper/link；table excerpt 保留原 cells/spans 及 adjacent footer。7 个 `a`–`f` cell markers 和 6 条 footer notes 保持真实输入，属于 accepted #45 前置条件，与本合同的 12 个 numeric powers 分开。

每个 provenance record 包含完整 ordered creators、原 article CC BY 4.0 notice 与未改写的 license URL、source positions、raw-body/pre-sanitization subtree/fixture hashes、实际 recipe/transformations/omissions，以及 repeat/idempotence 结果。原声明也保留在 article excerpts。来源材料遵循原许可证，不由 repository code license 重新许可。源 scholarly text、scientific nodes 和顺序保持；页面表示仅经过选取、确定性序列化、public metadata projection 与记录的 sanitization。

复现读取 B acquisition 外部目录的 untouched `<article-id>.anonymous.raw.html` 和 FRB `<article-id>.table-1.anonymous.raw.html`。先按 `sourceSha256` 核验 Buffer，再 decoding。对每个 recorded resource，从 A authoritative snapshot 导入既有 helper 并运行：

```javascript
const sourceText = new TextDecoder('utf8', { fatal: true }).decode(rawBytes);
const first = sanitizeNatureHtml(sourceText, record.recipe);
const repeated = sanitizeNatureHtml(sourceText, record.recipe);
const idempotent = sanitizeNatureHtml(first.html, record.recipe);
// 核验 raw 和 retained subtree digests；三个 byte arrays 及 fixtureSha256
// 必须与 committed excerpt 一致。
```

再生成需要原 external raw material 和 A helper；普通 tests 仅使用 committed reduced excerpts，不需要 live acquisition。仅本目录 HTML 的 Git attribute 保持 UTF-8 LF bytes 和有意义的 source whitespace；code/prose whitespace checks 继续执行。
