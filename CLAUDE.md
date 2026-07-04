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

- **Root `index.html`** — static landing page listing all apps; no build step
- **`apps/<app-name>/`** — each app is self-contained (own `node_modules`, `package.json`, `vite.config.js`)
- **`apps/<app-name>/dist/`** — build output; copied to `_site/<app-name>/` by CI
- **Deployment** — `.github/workflows/deploy.yml` builds all apps, assembles `_site/`, and deploys to GitHub Pages on every push to `main`

## Adding a new app

1. Create `apps/<app-name>/` with its own Vite + React setup
2. Set `base: '/micro-apps/<app-name>/'` in `vite.config.js`
3. Add build + copy steps in `.github/workflows/deploy.yml`
4. Add a card to the root `index.html`
