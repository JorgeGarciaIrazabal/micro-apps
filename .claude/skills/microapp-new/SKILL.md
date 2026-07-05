---
name: microapp-new
description: Scaffold a new micro-app in this monorepo (Vite + React 19), wire it into the landing page and registry, and verify it on the dev server. Use when the user asks to create/add a new micro-app.
---

# microapp-new — scaffold a new micro-app

Each micro-app is a standalone Vite + React 19 project under `apps/<name>/`, deployed to `https://jorgegarciairazabal.github.io/micro-apps/<name>/`. CI builds every app under `apps/*` **dynamically** — so you do NOT edit `.github/workflows/deploy.yml`. You touch four things: the app dir, the landing card, the landing details data, and `registry.json`.

`<name>` must be **kebab-case** and unique under `apps/`.

## 1. Create the app directory

```
apps/<name>/
  package.json
  vite.config.js
  index.html
  src/main.jsx
  src/App.jsx
  src/App.css
```

`package.json` (pin to the versions the other apps use — check one, e.g. `apps/casa-prefab-madrid/package.json`):
```json
{
  "name": "<name>",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": { "react": "^19.2.4", "react-dom": "^19.2.4" },
  "devDependencies": { "@vitejs/plugin-react": "^6.0.1", "vite": "^8.0.1" }
}
```

`vite.config.js` — **the base path is mandatory** for GitHub Pages asset resolution:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ base: '/micro-apps/<name>/', plugins: [react()] })
```

`index.html` loads `/src/main.jsx`; `src/main.jsx` mounts `<App/>` into `#root` (copy the shape from any existing app). Keep `App.jsx`/`App.css` minimal to start.

Then install:
```bash
cd apps/<name> && npm install
```

## 2. Add a landing-page card — root `index.html`

- Duplicate an existing `<div class="app-card-wrapper" …>` block inside `<main class="apps-grid" id="appsGrid">` (see the `data-id="house-designer"` block as a template). Set `data-id="<name>"`, `data-categories=` (one of the existing `filter-btn` `data-filter` values, or add a new filter button), `data-tags=`, the icon, tags, `<h2>` title, description, `card-meta-list`, and the launch link `href="./<name>/"`.
- **Bump the app-count stat**: find `<div class="stat-value" data-target="4">` and increment it to the new app count.

## 3. Add details-modal data — root `script.js`

Add an entry to the `APP_DETAILS` object (keyed by `<name>`) with `icon`, `title`, `overview`, `features[]`, `tech[]` (copy the shape of an existing entry near line 390). Without it, the card's "details" button shows nothing.

## 4. Register the app — `registry.json`

Add an entry to `apps[]`:
```json
{ "id": "<name>", "name": "<Display Name>", "icon": "<emoji>", "path": "<name>/",
  "description": "<one line>" }
```
Add `"projectParam": true`, `"dataDir": "…"`, `"dataExt": "…"`, `"suggestions": [...]` only if the app supports the file-backed embed protocol (see the `microapp-embed` skill) — most apps don't and can omit them.

## 5. Verify

```bash
make dev          # serves everything at http://localhost:8000/micro-apps/
```
Open `http://localhost:8000/micro-apps/<name>/` — the app renders. Open `http://localhost:8000/micro-apps/` — the new card appears, filters/search find it, the details modal opens. (Screenshot via chrome-devtools MCP if available.)

To publish, use the `microapp-publish` skill.

## Checklist
- [ ] `apps/<name>/` created, `npm install` run, `base: '/micro-apps/<name>/'` set
- [ ] Landing card added; `data-target` app count bumped
- [ ] `APP_DETAILS['<name>']` added to `script.js`
- [ ] `registry.json` entry added
- [ ] Verified on `make dev`
