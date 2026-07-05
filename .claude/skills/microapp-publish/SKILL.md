---
name: microapp-publish
description: Build, validate, commit, and push micro-app changes so GitHub Pages CI deploys them live. Use when the user asks to publish, deploy, or ship micro-app changes.
---

# microapp-publish — ship to GitHub Pages

Publishing = push to `main`. The **Deploy to GitHub Pages** GitHub Action (`.github/workflows/deploy.yml`) then builds every app under `apps/*`, assembles `_site/` (landing `index.html`/`style.css`/`script.js`, `registry.json`, `houses/`, each app's `dist/`), and deploys. This is **outward-facing and hard to reverse** — confirm with the user before pushing unless they already told you to.

## Preflight (catch failures locally before CI)

1. **Build the touched apps** — CI fails the whole deploy if any app build breaks:
   ```bash
   cd apps/<changed-app> && npm run build   # for each changed app
   ```
2. **Validate changed houses** (if any `houses/*.house.json` changed):
   ```bash
   node .claude/skills/house-design/validate.mjs houses/<changed>.house.json
   node .claude/skills/house-design/lint-layout.mjs houses/<changed>.house.json
   ```
3. **Guard the working tree** — never stage the built root copies. `casa-prefab-madrid/`, `house-designer/`, `clara-summer-camps-madrid/`, `andalucia-scouting-2026/` (the root-level dirs, NOT `apps/*`) and `_site/`, `dist/`, `.worktrees/` are gitignored. Run `git status` and confirm only source files are staged:
   ```bash
   git status --short
   ```

## Publish

```bash
git add -A
git commit -m "<clear message describing the change>"
```

If working in a per-user worktree branch (e.g. `garbanzo/<user>`), rebase onto the latest main and push to main:
```bash
git fetch origin
git rebase origin/main            # STOP and report if this conflicts — do not force-resolve
git push origin HEAD:main
```
On `main` directly, just `git push`. **Never** `git push --force`.

## Verify the deploy

```bash
gh run watch                      # wait for the Pages deploy to go green
```
Then confirm the live site:
- `https://jorgegarciairazabal.github.io/micro-apps/` — landing loads WITH styling (CSS/JS present).
- `https://jorgegarciairazabal.github.io/micro-apps/<app>/` — the changed app loads.
- `https://jorgegarciairazabal.github.io/micro-apps/registry.json` — reflects changes.

If a house was published, it is loadable at `…/micro-apps/houses/<name>.house.json` (read-only on Pages — no `/__save`).

To undo a bad publish, use the `microapp-revert` skill (revert the commit + re-push).
