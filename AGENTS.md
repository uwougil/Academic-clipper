# Repository guidance

## Intent and ownership

- `docs/PRD.md` is the human-maintained Product Intent source.
- `docs/EDD.md` is the human-maintained Engineering Intent source. Product and engineering intent changes require explicit human resolution; never change PRD/EDD semantics without it.
- `docs/milestones/*.md` are preserved as historical planning and execution evidence; routine agents are not required to maintain milestones in sync with PRD/EDD.
- GitHub Issues serve as persistent Work Contracts. Each Issue is one independently deliverable outcome, normally completed by one final delivery Pull Request rather than responsibility shared across multiple ordinary PRs. If one final PR cannot reasonably deliver the outcome, re-boundary the Issue before implementation.
- The default branch represents accepted implementation reality, not authority to silently override PRD/EDD.
- `README.md` is the user-facing operating guide; keep it consistent with the intent sources, but do not use it as a replacement for them.
- `papers/s41586-026-10401-1/` is the intentionally committed Nature golden artifact. Other captures under `papers/`, `dist/`, `node_modules/`, and `config.json` are local or generated and must remain ignored.

## Setup and verification

Use Node.js 20 or newer and the committed lockfile:

```bash
npm ci
npm test
npm run build
npm run validate:paper -- --file ./papers/s41586-026-10401-1/index.md --citation-style auto
```

The CI workflow must continue to run the same checks on Ubuntu Node 20, Ubuntu Node 24, and Windows Node 24. `npm run clip:live` is an opt-in network operation and must not be used as a routine CI check.

## Architecture boundaries

- Keep the first supported publisher limited to Nature. Do not introduce a generic multi-publisher abstraction without an intent change.
- Reuse Defuddle for HTML-to-Markdown conversion. Keep Nature DOM knowledge in `src/adapters/nature.mjs`; keep academic normalization, validation, bridge transport, and filesystem writing in their existing boundaries.
- The browser extension sends page content to the local bridge. This repository does not need a VS Code extension or a database.
- Preserve deterministic Markdown output, the golden artifact, citation modes, figure fallbacks, and transactional article-directory replacement.

## Security and change safety

- Keep the bridge bound to loopback and preserve Origin/token checks.
- Do not weaken `safeFetchExternal()` or add a network fetch without URL, DNS, redirect, size, and content-type checks appropriate to the resource.
- Never commit `config.json`, bridge tokens, cookies, private keys, raw page captures, or other credentials.
- Treat `dist/` as build output. Edit `extension/` and source files, then run `npm run build`.
- A live clip can overwrite a paper artifact. Use fixture tests for routine development and run live clipping only when explicitly needed.

## Collaboration and delivery

- Issue-backed changes normally use an isolated branch or worktree (such as a `codex/` branch or task worktree) and are delivered through a pull request linked to the Issue.
- Each Issue is normally completed by one final delivery Pull Request; multiple ordinary PRs must not share responsibility for completing the same Issue.
- A final delivery Pull Request is the repository-visible Delivery / Handoff Contract. Another agent must be able to reconstruct the handoff from PRD/EDD, the linked Issue, commits, the pull request description and diff, test output, and CI results; do not rely on private conversation state.
- Link Issue-backed PRs with an exact standalone `Refs #N` line; agents must not use `Closes #N`, `Fixes #N`, or `Resolves #N`. Merging code must not auto-close the Work Contract.
- Required verification must pass before merge. Record the commands and relevant results in the pull request.
- Merge only admits code to the default branch; merge does not complete the Work Contract. Only successful Main CI for the merged commit completes the Work Contract; independent automation comments on and closes the linked open Issue with the `completed` state reason on success, or comments and keeps the Issue open on any non-success conclusion.
- Product or engineering intent changes require explicit human resolution and corresponding updates to `docs/PRD.md` and `docs/EDD.md`.
- Repository-facing prose uses the resolved collaboration language; preserve technical strings such as commands, identifiers, paths, URLs, API names, and GitHub numbers verbatim.

## Completion checks

Before handing off repository changes, inspect `git diff --check`, `git status --short`, tracked filenames, and the relevant test/build output. Update `docs/PRD.md` or `docs/EDD.md` only when an explicit human resolution authorizes a change in product behavior or an architectural boundary.
