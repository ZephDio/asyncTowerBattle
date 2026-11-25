---
name: pr-workflow
description: FOR THE INITIATIVE ORCHESTRATOR (the session that runs an initiative, not the realm steward and not its workers). How to take the initiative's finished work through a pull request, an adversarial review done by a worker inside the session, iteration on the feedback and merge into master. Use when the user asks the orchestrator to open the PR, finish, review or merge its work.
---

# Pull request workflow (orchestrator only)

This skill is for the orchestrator of an initiative in asyncTowerBattle. The steward does not run this workflow and workers only do what the orchestrator asks of them. The remote is GitHub, so a "MR" is a pull request, handled with `gh` (authenticated as ZephDio, git over ssh). Master has no branch protection and the repository has no CI, so the checks below are yours to run.

## Trigger

Start only when the user asks the orchestrator to do the PR. Without that, do not open one. A plain "commit and push master" request still means a direct commit on master. Only the user marks the initiative done (`ini done`).

## Steps

1. **Branch and PR.**
   - Work from the initiative's checkout branch. Check `git merge-base master HEAD` is current master's tip (`git fetch origin master`); `ini branch` bases a checkout on the project's base, which can be older than master or on someone else's unmerged branch. If it is, rebase onto master (a branch that has not been pushed) or merge master into it (one that has).
   - Commit only this initiative's work and leave unrelated changes alone.
   - Run the checks the change calls for: `pnpm typecheck` and `pnpm test` for code (a fresh checkout needs `pnpm install` first), `pnpm test:integration` if the server's database code changed, and `pnpm format`, which rewrites files, so commit its result. A change to docs or skills only needs a read-through. Fix what fails.
   - `git push -u origin HEAD`, then `gh pr create --base master --title "<what the initiative delivers>" --body-file <file>`. The reviewer reads nothing else about the feature, so the body carries all of it: what the feature is and the user's decisions behind it, what changed and why, the design choices and their reasons, how it was checked (typecheck, tests, game screenshots), and the known gaps and what was not verified.
2. **Adversarial review by a worker.** Start a worker (`worker` tool, `start`; default model; Opus only for a large or subtle change) to run an adversarial review of the PR's diff. It gets a worktree of its own, so create it at the PR head: `branch: review-pr-<number>`, `base: origin/<pr-branch>`. It may stop on a "Trust project folder?" prompt in that new folder; answer it with `worker` `answer`, choosing "Trust (this session only)". The review stays in the session: the worker does not post on GitHub, edit files, commit or push. Give it as little context as possible: the PR page and its comments are its context, and the feature is not explained to it in the instruction. The instruction holds only:
   - the words "adversarial review", asking for one of this pull request;
   - the PR number and URL, and the diff command `git diff origin/master...HEAD` (run `git fetch origin` first; `gh pr diff <number>` is the same diff);
   - where to read about the change: `gh pr view <number> --comments`, the body and the comments, which the worker reads itself;
   - the brief: look for bugs, regressions, missed edge cases, conventions from `AGENTS.md` and the skills that the change breaks, missing tests and docs, and anything the PR claims that is not true; run the checks it doubts rather than trusting the PR body;
   - the output: findings ranked by severity, each with `file:line` and the evidence (code read, command run), or "no finding" for a clean diff.

   Do not paste the initiative's task, the user's decisions or your own summary of the feature into the instruction. If the worker would need a fact to judge the change, it is missing from the PR: add it to the body or a comment first.
3. **Iterate.** The worker's result arrives in the session; read it and check each finding against the code yourself. Apply the pertinent ones as new commits on the PR branch (no amending or force-push), rerun the checks and push. Keep a list of the rejected findings with the reason. After each round, comment on the PR what was found, applied and rejected (with the reasons), so the PR page stays the reviewers' only context. If a finding was serious or the changes were significant, start a new review worker on the new diff, with the same short instruction; a trivial fix needs none. Repeat until no pertinent finding is left.
4. **Merge.**
   - Make sure every review round is commented on the PR (`gh pr comment <number> --body-file <file>`: what was found, applied and rejected); post the ones still missing.
   - Merge with `gh pr merge <number> --squash --delete-branch`, the user's rule. (History on master is mixed: some PRs were merged with merge commits.) Use another method only if the user asks. If the merge fails on conflicts, merge `origin/master` into the branch, rerun the checks, push, and review the conflict resolution if it was not trivial. If `--delete-branch` cannot delete the local branch because a worktree has it checked out, the remote branch is still deleted; leave the checkout to `ini`.
   - Confirm with `gh pr view <number> --json state,mergeCommit` and `git fetch origin && git log origin/master -1`.
5. **Clean up the feature environment.** Once the PR has reached master:
   - Stop every dev process you started for the feature (the server, Vite, anything on a port of your own): find it with `ss -ltnpH 'sport = :<port>'` and kill that pid only, never `pkill -f` and never the user's servers (ports 5173 and 6868, or processes of another checkout). Confirm the ports are free.
   - Remove the test data your runs left in the dev database (test players, their boards and saved games, putting back the boards they pulled), if you have not already.
   - Pull master in the main checkout with `git -C <main checkout> pull --ff-only` so it holds the merge. It refuses rather than overwrite local changes: if it refuses, say so in the report and leave the checkout as it is.
6. **Report** to the user: PR link, what the review found, what was applied or rejected, the merge commit, and checks not run. Then `ini review <initiative-name> "<summary>"`. Do not run `ini done`.

## Rules

- Never merge while a pertinent finding is unhandled or before at least one review has run.
- Each review round uses a fresh worker with no memory of earlier rounds, and not one that wrote the code. Its only knowledge of the feature is the PR page and comments.
- Do not force-push, rewrite master or skip hooks.
- If `gh` fails (auth, network), report the error. Do not work around it with other credentials.
