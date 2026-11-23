---
name: pr-workflow
description: FOR THE STEWARD AGENT ONLY (the realm steward session, not an initiative's orchestrator or worker). How to take an initiative whose work the user declared done through a pull request, an adversarial review initiative, feedback and merge into master. Use when the user tells the steward that an initiative is done, or asks to open, review or merge a PR.
---

# Pull request workflow (Steward agent only)

This skill is for the realm steward of asyncTowerBattle. Orchestrators and workers do not open, review or merge PRs: they finish their work and report with `ini review`. The remote is GitHub, so a "MR" is a pull request, handled with `gh` (authenticated as ZephDio, git over ssh).

## Trigger

Start only when the user says an initiative's work is done. Without that, do not open a PR. Plain "commit and push master" requests still mean a direct commit on master, as before this workflow.

## Steps

1. **Branch and PR.** Put the initiative's work on a branch (the initiative's own checkout branch, or `git switch -c <initiative-name>` from master if the work sits in the main checkout). Commit only that work and leave unrelated changes alone. Push the branch and open the PR against master with `gh pr create`. Title: what the initiative delivers. Body or first comment: what changed and why, how it was checked (typecheck, tests, game screenshots), and known gaps or things not verified.
2. **Review initiative.** Get the head commit with `git rev-parse --short HEAD`. Create a backlog initiative named `review-<commit>` with `ini new review-<commit> --title "Review <initiative>" --realm asyncTowerBattle --backlog --project ~/workspace/asyncTowerBattle --prompt -`. Its prompt asks for an adversarial review: look for bugs, regressions, missed edge cases, broken conventions from `AGENTS.md`, missing tests and docs, and anything claimed in the PR that is not true. It gives the PR number, the commit range, the initiative's task, and says to:
   - write findings, ranked by severity with `file:line`, into its notes and as a PR review comment (`gh pr review` or `gh pr comment`);
   - make no code changes;
   - end with `ini review review-<commit> "<summary>"`, which notifies the steward.

   The user starts this initiative. Suggest it, do not start it.
3. **Feedback.** When the review notification arrives (or the user says it is done), read the notes and the PR comments. Check each point against the code. Apply the pertinent ones on the PR branch, as new commits, and push. Say which points were rejected and why, in a PR comment. If the changes were significant, create a new `review-<commit>` for the new head and wait for it again.
4. **Merge.** When every pertinent point is handled, merge with `gh pr merge --squash` unless the user wants another method (check the repository's history for its habit), and delete the branch. Then confirm master on origin.
5. **Report** to the user: PR link, what the review found, what was applied or rejected, the merge commit, and checks not run.

## Rules

- Never merge with an unresolved pertinent review point or while the review has not been done.
- Do not start initiatives, change phases, or touch checkouts of others: suggest those to the user.
- Do not force-push, rewrite master or skip hooks.
- If `gh` fails (auth, network), report the error. Do not work around it with other credentials.
