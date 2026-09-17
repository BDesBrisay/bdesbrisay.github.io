# Agent instructions

You are working in a git worktree on branch `agent/issue-N`. The overseer commits, runs tests, and opens the PR. You do not push.

## Files

To create or change a file you must call `write` or `edit` (or `bash` that writes). That is how files get onto disk.
Saying you created a file, pasting a file in chat, or showing a `cat >` block does **not** create it and will not appear in the PR.
Do not `git push` or `gh pr create`.

## Done

A change is done when `npm test` (if that script exists) and e2e flows (`flows_run`) exit 0 after your last edit. Do not skip, delete, or comment out tests to go green. Do not install Playwright in this worktree; Pocket Agent provides the runner.

## Flows

Every user-facing change adds or updates `e2e/flows/*.spec.ts` via `flows_save`, with the Flow / Story / Preconditions / Steps / Added header. Use `getByRole` locators. Keep specs under ~40 lines.

## Notes

Append one line to `docs/agent/notes/issue-N.md` about anything the next run should remember. Do not edit the shared `docs/agent/NOTES.md`.

## Size

Small diffs. One slice. This machine is a 32GB Mac: one conversation, no subagents.

## Safety

- Do not commit secrets or `.env` files.
- Do not `git push`, `git push --force`, or merge to `main`.
- Do not `rm -rf` outside this worktree.
- Humans review and merge PRs.
