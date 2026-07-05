# AGENTS.md — guide for coding agents (opencode / Claude Code)

This repo is a monorepo of small Vite + React 19 web apps deployed to GitHub Pages at `https://jorgegarciairazabal.github.io/micro-apps/`. Each app is standalone under `apps/<name>/` with `base: '/micro-apps/<name>/'`.

You are often invoked by a **host app (garbanzo-ai)** that is showing one of these apps live to a user, in a per-user git worktree. Your file edits appear in the user's view within ~1s (source via Vite HMR, `houses/*.house.json` via the dev-server file watcher). Work directly on the files in this working tree.

## Skills (use them)

Skills live in `.claude/skills/` (symlinked into `.opencode/skills/`). Match the task to a skill and follow it:

- **`house-design`** — the House Designer app's `.house.json` data model, geometry rules, furniture catalog, and the **required** `validate.mjs` + `lint-layout.mjs` gates. Use for ANY house/floor-plan edit. Houses are git-tracked files in `houses/`; edit them minimally and preserve ids.
- **`microapp-embed`** — the file-backed embedding contract (`?project=&save=1&embed=1`, `/__save`, `houses-changed` SSE, `registry.json`). Use when integrating an app into a host or making an app embed-compliant.
- **`microapp-new`** — scaffold a new app (app dir + landing card + `script.js` details + `registry.json`; CI is dynamic, no workflow edit).
- **`microapp-publish`** — build/validate/commit/push → GitHub Pages CI. Publishing is outward-facing; confirm first.
- **`microapp-revert`** — safely discard/roll back changes.

## Common workflows

- **"Modify a house"** (e.g. "add a window to the living room", "añade un baño"): follow `house-design` — read `houses/<name>.house.json`, apply the minimal JSON edit, save, run validate + lint, fix anything flagged. Mirror the user's language (EN/ES) when explaining.
- **"Change how the app looks/works"**: edit the app source under `apps/<name>/src/`. HMR reloads the user's view.

## Dev commands

- `make dev` — serve everything at `http://localhost:8000/micro-apps/` (dynamic; discovers `apps/*`, proxies HMR). Honors `PORT`.
- Per app: `cd apps/<name> && npm run dev|build`.
- Validate/lint a house: `node .claude/skills/house-design/{validate,lint-layout}.mjs houses/<name>.house.json`.

## Rules

- Never weaken the layout linter to make a design "pass" — fix the geometry.
- Never edit `.github/workflows/deploy.yml` for a new app — CI builds `apps/*` dynamically.
- Never stage the built root copies (`house-designer/`, `casa-prefab-madrid/`, etc.) — they're gitignored build output.
- Keep edits minimal and scoped to the request.
