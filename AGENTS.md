# Repository guidance

## Intent and ownership

- `docs/PRD.md` is the human-maintained Product Intent source.
- `docs/EDD.md` is the human-maintained Engineering Intent source. Product and engineering intent changes require explicit human resolution; never change PRD/EDD semantics without it.
- `docs/milestones/*.md` are preserved as historical planning and execution evidence; routine agents are not required to maintain milestones in sync with PRD/EDD.
- GitHub Issues serve as persistent Work Contracts. Each Issue is one independently deliverable outcome, normally completed by one final delivery Pull Request rather than responsibility shared across multiple ordinary PRs. If one final PR cannot reasonably deliver the outcome, re-boundary the Issue before implementation.
- The default branch represents accepted implementation reality, not authority to silently override PRD/EDD.
- `README.md` is the user-facing operating guide; keep it consistent with the intent sources, but do not use it as a replacement for them.
- `papers/s41586-026-10401-1/` is the intentionally committed Nature golden artifact. Other captures under `papers/`, `dist/`, `node_modules/`, and `config.json` are local or generated and must remain ignored.

## Agent startup preflight

Before modifying the repository, every new task must complete a short startup preflight. This applies to feature work, bug fixes, refactors, review, CI repair, release work, workflow-changing documentation, and tasks running in additional worktrees.

- Read the applicable `AGENTS.md`, task instructions, and linked Issue / Pull Request completely; confirm the current scope, non-goals, and acceptance boundary.
- Inspect the coding capabilities actually available in the current agent environment, including skills, tools, MCP/plugins, and repository scripts. Follow **inspect broadly, load narrowly**: inventory capabilities first, then load/use only repository-baseline and task-relevant capabilities rather than every available skill.
- For every task, confirm that Git/repository workflow, implementation or editing, testing/regression, review, and CI/GitHub-state diagnosis are adequately covered. Enable task-specific capabilities such as browser automation, network-fixture validation, documentation maintenance, or packaging/release only when the task requires them.
- Before editing, verify the current branch, expected base branch, worktree, dirty/uncommitted state, linked Issue / PR when applicable, and the task scope. Preserve unrelated work.
- If a capability required to satisfy the task contract is missing, unavailable, or incompatible with the environment, stop before modifying code and report the blocker. Do not silently fall back to an implementation that clearly fails repository requirements.
- Do not ask the user to reconfirm capabilities that are already available. The preflight should normally stay internal; surface it only when it finds a blocker or material ambiguity.
- This root `AGENTS.md` is the canonical repository agent policy. If a specific agent platform needs its own instruction entrypoint, keep that file as a thin pointer to this policy rather than duplicating a second copy that can drift.

**Do not begin implementation until the startup preflight is complete.**

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
