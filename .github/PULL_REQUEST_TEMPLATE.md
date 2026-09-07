## Issue

<!-- Closes #123 (if Issue-backed); otherwise write "Not Issue-backed". -->

## Summary

<!-- What changed and why? Mention any PRD/EDD or milestone impact. -->

## Verification

- [ ] `npm ci`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto`
- [ ] CI passed

## Handoff and safety

- [ ] The diff does not include secrets, local configuration, raw captures, or unintended generated files.
- [ ] Any PRD/EDD semantic change has explicit human resolution and the intent documents are updated.
- [ ] This PR records enough scope and evidence for another agent to continue without private conversation context.
