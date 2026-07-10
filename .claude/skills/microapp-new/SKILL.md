---
name: microapp-new
description: Scaffold a new micro-app in this monorepo (Vite + React 19), wire it into the landing page and registry, and verify it on the dev server. Use when the user asks to create/add a new micro-app.
---

# microapp-new — scaffold a new micro-app

Each micro-app is a standalone Vite + React 19 project under `apps/<name>/`, deployed to `https://jorgegarciairazabal.github.io/micro-apps/<name>/`. CI builds every app under `apps/*` **dynamically** — so you do NOT edit `.github/workflows/deploy.yml`. You touch four things: the app dir, the landing card, the landing details data, and `registry.json`.

`<name>` must be **kebab-case** and unique under `apps/`.

## 0. Design the app for its purpose (BEFORE writing any code)

**Do not look at other apps for UX/design inspiration.** Every app in this repo serves a different purpose; copying another app's layout produces a generic tool that fits none of them. Instead:

1. **Understand the purpose.** What is the user trying to *do* with this app? What decisions are they making? What data are they exploring? Write one sentence answering this before proceeding.
2. **Identify the primary interaction.** Is it: comparing options? Calculating an outcome? Exploring/filtering data? Building/configuring something? Visualizing a space? Browsing content?
3. **Design the UI around that interaction.** The layout should be dictated by the purpose, not by convention. Some examples (do not treat these as templates — derive your own):
   - A *comparison* app → sortable summary with multi-metric cards + drill-down detail
   - A *calculator* app → live input sliders driving real-time outputs with visual feedback
   - A *filtering/exploration* app → faceted chip filters + responsive grid that updates live
   - A *configuration* app → canvas/editor + side panel of controls
   - A *display* app → immersive full-viewport presentation with minimal chrome
4. **Pick metrics and visuals that matter to THIS app's purpose.** Don't blindly reuse KPI tiles, bar charts, or tab bars from another app. Choose the representations that make the user's decision easier.

### Quality bar

- **Interactive, not static.** The user should be able to manipulate something (sort, filter, slide, drill down) and see the result update live. A page that only scrolls and displays text is a document, not an app.
- **Purpose-driven layout.** Every UI element should serve the app's stated purpose. If you can't justify why a tab/KPI/chart exists for *this* app, remove it.
- **Self-contained.** Single `App.jsx` + `App.css` + `src/data.js` (or `src/data.jsx` for richer data). Keep it in one file unless it gets unwieldy.

## 1. Create the app directory

```
apps/<name>/
  package.json
  vite.config.js
  index.html
  src/main.jsx
  src/App.jsx
  src/App.css
  src/data.js
```

`package.json` — use these pinned versions (do NOT read another app's package.json to "match" it; these are the canonical versions):
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

`index.html` — loads `/src/main.jsx`. `src/main.jsx` — mounts `<App/>` into `#root`:
```jsx
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.css'
createRoot(document.getElementById('root')).render(<App />)
```

Write `App.jsx`, `App.css`, and `src/data.js` from scratch, designed for the app's purpose (step 0). **Do not open, read, or copy from any other app under `apps/`.** The only things you may reference from other apps are the mechanical wiring (package.json versions, vite base path, main.jsx shape) provided verbatim in this skill.

Then install:
```bash
cd apps/<name> && npm install
```

## 2. Add a landing-page card — root `index.html`

Add a `<div class="app-card-wrapper" …>` block inside `<main class="apps-grid" id="appsGrid">`. Required attributes: `data-id="<name>"`, `data-categories=` (one of the existing `filter-btn` `data-filter` values, or add a new filter button), `data-tags=`, the icon, tags, `<h2>` title, description, `card-meta-list`, and the launch link `href="./<name>/"`. Match the HTML structure of the existing cards for the landing page to render correctly (this is wiring, not UX — the card shell is shared infrastructure).
- **Bump the app-count stat**: find `<div class="stat-value" data-target="N">` and increment it to the new app count.

## 3. Add details-modal data — root `script.js`

Add an entry to the `APP_DETAILS` object (keyed by `<name>`) with `icon`, `title`, `overview`, `features[]`, `tech[]`. Without it, the card's "details" button shows nothing. Match the object shape used by existing entries (this is shared landing-page infrastructure, not app UX).

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
Open `http://localhost:8000/micro-apps/<name>/` — the app renders and serves its stated purpose. Open `http://localhost:8000/micro-apps/` — the new card appears, filters/search find it, the details modal opens. (Screenshot via browser MCP if available.)

To publish, use the `microapp-publish` skill.

## Checklist
- [ ] Purpose stated in one sentence before coding; primary interaction identified; UI designed for that interaction (not copied from any existing app)
- [ ] `apps/<name>/` created, `npm install` run, `base: '/micro-apps/<name>/'` set
- [ ] `App.jsx` / `App.css` / `data.js` written from scratch for this app's purpose — no other app under `apps/` was read for UX/design
- [ ] At least one reactive interaction (sort/filter/slide/drill-down) that updates the view live
- [ ] Landing card added; `data-target` app count bumped
- [ ] `APP_DETAILS['<name>']` added to `script.js`
- [ ] `registry.json` entry added
- [ ] Verified on `make dev`