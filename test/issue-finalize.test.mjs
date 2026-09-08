import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const finalize = require('../.github/scripts/issue-finalize.js');

function mergedPr(number, body, sha = 'abc123', baseRef = 'main') {
  return {
    number,
    body,
    merged_at: '2026-09-08T00:00:00Z',
    merge_commit_sha: sha,
    base: { ref: baseRef },
  };
}

function contextFor(overrides = {}) {
  return {
    repo: { owner: 'uwougil', repo: 'Academic-clipper' },
    payload: {
      repository: { default_branch: 'main' },
      workflow_run: {
        id: 100,
        run_attempt: 1,
        event: 'push',
        head_branch: 'main',
        head_sha: 'abc123',
        conclusion: 'success',
        html_url: 'https://github.com/uwougil/Academic-clipper/actions/runs/100',
        ...overrides,
      },
    },
  };
}

function mockGitHub({ prs = [], issues = {}, comments = {} } = {}) {
  const calls = {
    associated: 0,
    pulls: [],
    getIssue: [],
    listComments: [],
    createComment: [],
    update: [],
  };
  const github = {
    rest: {
      repos: {
        listPullRequestsAssociatedWithCommit: async () => {
          calls.associated += 1;
          return { data: prs };
        },
      },
      pulls: {
        get: async ({ pull_number }) => {
          calls.pulls.push(pull_number);
          return { data: prs.find((pr) => pr.number === pull_number) };
        },
      },
      issues: {
        get: async ({ issue_number }) => {
          calls.getIssue.push(issue_number);
          return { data: issues[issue_number] || { number: issue_number, state: 'open' } };
        },
        listComments: async ({ issue_number }) => {
          calls.listComments.push(issue_number);
          return { data: comments[issue_number] || [] };
        },
        createComment: async (params) => {
          calls.createComment.push(params);
          return { data: {} };
        },
        update: async (params) => {
          calls.update.push(params);
          return { data: {} };
        },
      },
    },
  };
  github.paginate = async (method, params) => (await method(params)).data;
  return { github, calls };
}

test('parseIssueReferences extracts strict standalone Refs lines and deduplicates', () => {
  const body = [
    'Refs #8',
    '  Refs #9  ',
    'refs #8',
    'See Refs #10 for background',
    'Closes #11',
    'Fixes #12',
    'Resolves #13',
    'Refs #0',
    'Refs #-5',
    'Refs #abc',
    'Refs #14 extra words',
    'Refs #15',
  ].join('\n');

  const refs = finalize.parseIssueReferences(body);
  assert.deepEqual(refs, [8, 9, 15]);
});

test('PR CI completion never modifies or closes issues', async () => {
  const { github, calls } = mockGitHub({ prs: [mergedPr(42, 'Refs #8')] });
  const result = await finalize({
    github,
    context: contextFor({ event: 'pull_request', head_branch: 'codex/issue-8' }),
  });

  assert.deepEqual(result.skipped, ['not-default-branch-push-ci']);
  assert.equal(calls.associated, 0);
  assert.equal(calls.createComment.length, 0);
  assert.equal(calls.update.length, 0);
});

test('push to non-default branch never modifies or closes issues', async () => {
  const { github, calls } = mockGitHub({ prs: [mergedPr(42, 'Refs #8')] });
  const result = await finalize({
    github,
    context: contextFor({ event: 'push', head_branch: 'feature-branch' }),
  });

  assert.deepEqual(result.skipped, ['not-default-branch-push-ci']);
  assert.equal(calls.associated, 0);
  assert.equal(calls.createComment.length, 0);
  assert.equal(calls.update.length, 0);
});

test('direct push to main without merged PR exits safely', async () => {
  const { github, calls } = mockGitHub({ prs: [] });
  const result = await finalize({ github, context: contextFor() });

  assert.deepEqual(result.skipped, ['no-merged-pr-for-main-ci-commit']);
  assert.equal(calls.getIssue.length, 0);
  assert.equal(calls.createComment.length, 0);
  assert.equal(calls.update.length, 0);
});

test('merged PR without exact Refs #N lines exits safely', async () => {
  const { github, calls } = mockGitHub({ prs: [mergedPr(42, 'Related to issue #8 and Closes #8')] });
  const result = await finalize({ github, context: contextFor() });

  assert.deepEqual(result.skipped, ['pr-42-has-no-refs']);
  assert.equal(calls.getIssue.length, 0);
  assert.equal(calls.createComment.length, 0);
  assert.equal(calls.update.length, 0);
});

test('referenced pull request is ignored and never treated as an issue', async () => {
  const { github, calls } = mockGitHub({
    prs: [mergedPr(42, 'Refs #8')],
    issues: { 8: { number: 8, state: 'open', pull_request: { url: 'https://api.github.com/repos/octo/repo/pulls/8' } } },
  });
  const result = await finalize({ github, context: contextFor() });

  assert.deepEqual(result.skipped, ['#8-is-a-pull-request']);
  assert.equal(calls.createComment.length, 0);
  assert.equal(calls.update.length, 0);
});

test('already closed issue is not commented on or updated again', async () => {
  const { github, calls } = mockGitHub({
    prs: [mergedPr(42, 'Refs #8')],
    issues: { 8: { number: 8, state: 'closed' } },
  });
  const result = await finalize({ github, context: contextFor() });

  assert.deepEqual(result.skipped, ['#8-already-closed']);
  assert.equal(calls.createComment.length, 0);
  assert.equal(calls.update.length, 0);
});

test('Main CI success comments and closes linked open issue with completed', async () => {
  const { github, calls } = mockGitHub({ prs: [mergedPr(42, 'Refs #8')] });
  const result = await finalize({ github, context: contextFor({ conclusion: 'success' }) });

  assert.equal(result.commentsCreated, 1);
  assert.equal(result.issuesClosed, 1);
  assert.equal(calls.createComment.length, 1);
  assert.equal(calls.createComment[0].issue_number, 8);
  assert.match(calls.createComment[0].body, /Main CI 已通过/);
  assert.match(calls.createComment[0].body, /PR #42/);
  assert.match(calls.createComment[0].body, /main-ci-issue-finalize/);

  assert.equal(calls.update.length, 1);
  assert.equal(calls.update[0].issue_number, 8);
  assert.equal(calls.update[0].state, 'closed');
  assert.equal(calls.update[0].state_reason, 'completed');
});

test('Main CI non-success conclusions comment and keep issue open', async () => {
  for (const conclusion of ['failure', 'cancelled', 'timed_out', 'action_required', 'stale']) {
    const { github, calls } = mockGitHub({ prs: [mergedPr(42, 'Refs #8')] });
    const result = await finalize({ github, context: contextFor({ conclusion }) });

    assert.equal(result.commentsCreated, 1);
    assert.equal(result.issuesClosed, 0);
    assert.equal(calls.update.length, 0);
    assert.equal(calls.createComment.length, 1);
    assert.match(calls.createComment[0].body, /未成功/);
    assert.match(calls.createComment[0].body, /此 Issue 保持 Open/);
    assert.match(calls.createComment[0].body, new RegExp(conclusion));
  }
});

test('idempotency: same run attempt does not duplicate comments', async () => {
  const run = contextFor({ conclusion: 'failure' }).payload.workflow_run;
  const marker = finalize.commentMarker(run, 8, 'failure');
  const { github, calls } = mockGitHub({
    prs: [mergedPr(42, 'Refs #8')],
    comments: { 8: [{ body: `${marker}\nExisting failure notice` }] },
  });

  const result = await finalize({ github, context: contextFor({ conclusion: 'failure' }) });
  assert.equal(result.commentsCreated, 0);
  assert.equal(calls.createComment.length, 0);
  assert.equal(calls.update.length, 0);
});

test('later successful rerun with higher attempt creates comment and closes issue', async () => {
  const failedRun = contextFor({ conclusion: 'failure', run_attempt: 1 }).payload.workflow_run;
  const oldMarker = finalize.commentMarker(failedRun, 8, 'failure');
  const { github, calls } = mockGitHub({
    prs: [mergedPr(42, 'Refs #8')],
    comments: { 8: [{ body: `${oldMarker}\nPrevious failure` }] },
  });

  const result = await finalize({ github, context: contextFor({ conclusion: 'success', run_attempt: 2 }) });
  assert.equal(result.commentsCreated, 1);
  assert.equal(result.issuesClosed, 1);
  assert.match(calls.createComment[0].body, /attempt:2/);
  assert.equal(calls.update[0].state, 'closed');
});

test('multiple exact Refs lines finalize multiple issues', async () => {
  const { github, calls } = mockGitHub({
    prs: [mergedPr(42, 'Refs #8\nRefs #9\nRefs #8')],
    issues: {
      8: { number: 8, state: 'open' },
      9: { number: 9, state: 'open' },
    },
  });

  const result = await finalize({ github, context: contextFor({ conclusion: 'success' }) });
  assert.equal(result.referencedIssues, 2);
  assert.equal(result.issuesClosed, 2);
  assert.deepEqual(calls.update.map((c) => c.issue_number), [8, 9]);
});

test('issue-finalize workflow contract and permissions match bootstrap-repo protocol', async () => {
  const workflowContent = await readFile(new URL('../.github/workflows/issue-finalize.yml', import.meta.url), 'utf8');

  assert.match(workflowContent, /workflow_run:/);
  assert.match(workflowContent, /workflows:\s*\["CI"\]/);
  assert.match(workflowContent, /types:\s*\[completed\]/);
  assert.match(workflowContent, /github\.event\.workflow_run\.event == 'push'/);
  assert.match(workflowContent, /github\.event\.workflow_run\.head_branch == github\.event\.repository\.default_branch/);
  assert.match(workflowContent, /contents:\s*read/);
  assert.match(workflowContent, /pull-requests:\s*read/);
  assert.match(workflowContent, /issues:\s*write/);
  assert.match(workflowContent, /issue-finalize\.js/);
});

test('CI workflow maintains project test scope and does not include issue lifecycle logic', async () => {
  const ciContent = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');

  assert.match(ciContent, /^name:\s*CI$/m);
  assert.match(ciContent, /Ubuntu \/ Node 20/);
  assert.match(ciContent, /Ubuntu \/ Node 24/);
  assert.match(ciContent, /Windows \/ Node 24/);
  assert.doesNotMatch(ciContent, /issue-finalize/);
  assert.doesNotMatch(ciContent, /issues:\s*write/);
  assert.doesNotMatch(ciContent, /pull-requests:\s*read/);
});

test('PULL_REQUEST_TEMPLATE follows lightweight contract without active auto-close syntax', async () => {
  const template = await readFile(new URL('../.github/PULL_REQUEST_TEMPLATE.md', import.meta.url), 'utf8');

  assert.match(template, /## Issue/);
  assert.match(template, /Refs #<number>/);
  assert.match(template, /## 变更摘要/);
  assert.match(template, /## 验证/);
  assert.match(template, /## 契约影响/);
  assert.match(template, /PRD：无变化 \/ 需要人工决策/);
  assert.match(template, /EDD：无变化 \/ 需要人工决策/);

  // Active closing syntax like `Closes #123` or `Fixes #123` on standalone lines must not appear
  const activeCompletionRegex = /^\s*(?:Closes|Fixes|Resolves|Delivers|Completes)\s+#\d+\s*$/gim;
  assert.equal(activeCompletionRegex.test(template), false);
});
