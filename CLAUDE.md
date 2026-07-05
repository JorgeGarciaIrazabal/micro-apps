# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of small React web apps deployed to GitHub Pages at `https://jorgegarciairazabal.github.io/micro-apps/`. Each app lives under `apps/<app-name>/` and is a standalone Vite + React project.

## Development

Each app is developed independently. Navigate into the app directory to run it:

```bash
cd apps/clara-summer-camps-madrid
npm install
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview production build
```

To serve the root index from the parent directory (simulates GitHub Pages landing page):

```bash
make serve   # runs python3 -m http.server 8000 from parent of micro-apps/
```

## Architecture

- **Root `index.html`** — static landing page listing all apps; no build step. Styling in `style.css`, behavior in `script.js` (search/filter/details modal + `APP_DETAILS`).
- **`apps/<app-name>/`** — each app is self-contained (own `node_modules`, `package.json`, `vite.config.js`)
- **`apps/<app-name>/dist/`** — build output; copied to `_site/<app-name>/` by CI
- **`registry.json`** (root) — machine-readable app list used by hosts (garbanzo-ai) to discover apps + embed capabilities.
- **`houses/`** (root) — git-tracked House Designer state files (`*.house.json`); the source of truth for both manual and agent edits.
- **Deployment** — `.github/workflows/deploy.yml` builds **every app under `apps/*` dynamically** and assembles `_site/` (landing assets + `registry.json` + `houses/` + each `dist/`) on every push to `main`.
- **`make dev`** (`scripts/dev-server.js`) — serves everything at `http://localhost:8000/micro-apps/` with HMR; also provides `PUT /micro-apps/__save` and the `houses/` change watcher used by embedded apps.

## Skills

Agent skills in `.claude/skills/` (symlinked into `.opencode/skills/` for opencode): `house-design` (`.house.json` model + validators), `microapp-new`, `microapp-publish`, `microapp-revert`, `microapp-embed`. See `AGENTS.md` for the agent workflow.

## Adding a new app

Use the `microapp-new` skill. In short (CI is dynamic — **no `deploy.yml` edit needed**):

1. Create `apps/<app-name>/` with its own Vite + React setup; set `base: '/micro-apps/<app-name>/'` in `vite.config.js`.
2. Add a card to root `index.html` and bump the `data-target` app count; add an `APP_DETAILS` entry to `script.js`.
3. Add an entry to `registry.json`.

## Embedding an app in a host (garbanzo-ai)

House Designer supports a **file-backed embed protocol**: open it at `…/house-designer/?project=/micro-apps/houses/<f>.house.json&save=1&embed=1`. It loads the file, saves manual edits back via `/__save`, and live-reloads when the file changes on disk (agent edits). See the `microapp-embed` skill for the full contract.
