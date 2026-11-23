---
name: pr-workflow
description: FOR THE INITIATIVE ORCHESTRATOR (the session that runs an initiative, not the realm steward and not its workers). How to take the initiative's finished work through a pull request, an adversarial review done by a worker inside the session, iteration on the feedback and merge into master. Use when the user asks the orchestrator to open the PR, finish, review or merge its work.
---

# Pull request workflow (orchestrator only)

This skill is for the orchestrator of an initiative in asyncTowerBattle. The steward does not run this workflow and workers only do what the orchestrator asks of them. The remote is GitHub, so a "MR" is a pull request, handled with `gh` (authenticated as ZephDio, git over ssh).

## Trigger

Start only when the user asks the orchestrator to do the PR. Without that, do not open one. A plain "commit and push master" request still means a direct commit on master.

## Steps

1. **Branch and PR.** Put the initiative's work on a branch (its checkout branch, or `git switch -c <initiative-name>` from master). Commit only this initiative's work and leave unrelated changes alone. Run `pnpm typecheck`, `pnpm test` and `pnpm format` first, and fix what fails. Push the branch and open the PR against master with `gh pr create`. Title: what the initiative delivers. Body: what changed and why, how it was checked (typecheck, tests, game screenshots), and known gaps or things not verified.
2. **Adversarial review by a worker.** Start a worker (`worker_start`, default model; use Opus only for a large or subtle change) whose task is an adversarial review of the PR's diff against master. The review stays in the session: the worker does not post on GitHub, change files or commit. Give it the PR number, the diff command (`git diff master...HEAD`), the initiative's task and the PR body. Ask it to look for bugs, regressions, missed edge cases, broken conventions from `AGENTS.md` and the skills, missing tests and docs, and anything the PR claims that is not true. It returns findings ranked by severity with `file:line`, each with the evidence for it.
3. **Iterate.** Read the review and check each finding against the code yourself. Apply the pertinent ones as new commits on the PR branch, rerun typecheck and tests, and push. Note the rejected findings and why. If the changes were significant, or a finding was serious, start a fresh review worker on the new diff. Repeat until no pertinent finding is left.
4. **Merge.** Write a PR comment that summarizes the review rounds: what was found, applied and rejected. Then merge with `gh pr merge --squash --delete-branch` unless the user wants another method, and confirm master on origin.
5. **Report** to the user: PR link, what the review found, what was applied or rejected, the merge commit, and checks not run.

## Rules

- Never merge while a pertinent finding is unhandled or before at least one review has run.
- The reviewer is a different worker from whoever wrote the code, and it starts with no memory of earlier rounds.
- Do not force-push, rewrite master or skip hooks.
- If `gh` fails (auth, network), report the error. Do not work around it with other credentials.
