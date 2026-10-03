# PNAS source excerpts

These are sanitized **real public PNAS browser-loaded DOM blocks**, captured on 2026-10-03 through the in-app browser. They are not reconstructed HTML, raw HTTP responses, PMC DOM, or complete-page captures. See `manifest.json` for URLs, per-block export file mtime UTC/hashes, fixture hashes, omissions and sanitation. See `docs/pnas-experiment.md` for platform/DOM, access and coverage boundaries.

The gossip excerpt keeps introductory prose, complete sec-1, fig02 and its original ancestor path/headings, and full selected abstract/backmatter/author/information blocks. The other fixtures keep their full selected article blocks. References retain actual source labels; hidden table rows are intact. Redundant visual MathJax glyphs were removed; original assistive MathML was retained. No academic text, equation, reference, date or affiliation was invented.

Offline reproduction: `node scripts/prepare-pnas-fixtures.mjs <temporary capture directory>`. Raw inputs stay outside the repository. Hashes cover exported browser DOM strings, not HTTP bytes; mtime timestamps are export times. This script is publisher-specific research support, not a Nature corpus schema extension. Explicit synthetic negative/fallback tests never count as real source coverage.
