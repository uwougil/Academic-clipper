# Repository guidance

## Intent and ownership

- `docs/PRD.md` is the product intent source.
- `docs/EDD.md` is the engineering intent source.
- `docs/milestones/*.md` is the execution and acceptance source.
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

- Issue-backed changes normally use an isolated `codex/` branch or worktree and are delivered through a pull request linked to the Issue.
- A handoff must be reconstructible from PRD/EDD, the linked Issue, commits, the pull request description and diff, test output, and CI results; do not rely on private conversation state.
- Required verification must pass before merge. Record the commands and relevant results in the pull request.
- Product or engineering intent changes require explicit human resolution and corresponding updates to `docs/PRD.md`, `docs/EDD.md`, or the applicable milestone.
- Repository-facing prose uses the resolved collaboration language; preserve technical strings such as commands, identifiers, paths, URLs, API names, and GitHub numbers verbatim.

## Completion checks

Before handing off repository changes, inspect `git diff --check`, `git status --short`, tracked filenames, and the relevant test/build output. Update the appropriate PRD, EDD, or milestone when a change alters product behavior or an architectural boundary.
