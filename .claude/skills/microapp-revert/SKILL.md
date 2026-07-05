---
name: microapp-revert
description: Safely undo micro-app changes — discard uncommitted edits, roll back a house file, or revert a published commit. Use when the user asks to revert, undo, discard, or roll back changes.
---

# microapp-revert — undo changes safely

Always **show what will be undone first**, scope the operation to only the intended paths, and never touch other branches or worktrees.

## 1. Inspect first (always)

```bash
git status --short          # what's changed
git diff --stat             # magnitude per file
git log --oneline -10       # recent commits, to identify a published change
```
Summarize for the user which files/commits are involved before doing anything destructive.

## 2. Discard uncommitted changes (scoped)

Prefer scoping to the touched paths over a blanket reset:
```bash
git checkout -- <path> ...          # revert tracked-file edits
git clean -fd <dir>                 # remove new untracked files (dangerous — list them first with `git clean -nd`)
```
For a single house reverted to its committed state:
```bash
git checkout -- houses/<name>.house.json
```
If the app is open in the host with live-reload, it picks the reverted file up automatically.

## 3. Revert a published commit

```bash
git revert <sha>            # creates an inverse commit (preferred — keeps history)
```
Then re-publish via the `microapp-publish` skill (push → CI redeploys the reverted state). **Do not** `git reset --hard` + force-push a shared branch.

## 4. Roll back to a house's earlier version

```bash
git log --oneline -- houses/<name>.house.json     # find the good revision
git checkout <sha> -- houses/<name>.house.json     # restore just that file
```

## Guardrails
- Never `git reset --hard` without confirming the user accepts losing uncommitted work.
- Never operate on a worktree/branch other than the current one.
- After reverting anything that was live, offer to re-run `microapp-publish` so the deployed site matches.
