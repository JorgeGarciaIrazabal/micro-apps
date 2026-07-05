---
name: microapp-embed
description: The contract for embedding a micro-app inside a host (e.g. garbanzo-ai) with a file-backed, agent-editable state. Use when integrating a micro-app into another app or making an app embed-compliant.
---

# microapp-embed — file-backed embedding contract

Hosts embed a deployed or dev micro-app in an iframe/webview and let an agent modify its state by **editing files on disk** (not a runtime message bridge). House Designer is the reference implementation.

## URL parameters (the contract)

A host opens the app with:

```
<base>/micro-apps/<app>/?project=<data-url>&save=1&embed=1
```

- **`project=<url>`** — a same-origin URL to the app's state file (e.g. `/micro-apps/houses/casa.house.json`). The app fetches it at boot (tolerant parse) instead of its localStorage slot.
- **`save=1`** — the app debounce-saves the user's manual edits back to that file via the dev server's `PUT /micro-apps/__save?path=<repo-relative>`. Only works against the **dev server** (`scripts/dev-server.js`); on static GitHub Pages there is no `/__save`, so the app is effectively read-only (harmless — the fetch fails silently).
- **`embed=1`** — chromeless mode: sets `<html data-embed="1">`; the app's CSS hides file/cloud persistence UI (the host/file owns persistence). Editing tools, 2D/3D, and undo stay.

## Live reload (how agent edits reach the user's screen)

The dev server watches the data dir (`houses/`) and broadcasts `houses-changed` Server-Sent Events on `/micro-apps/__hmr`. In `?project=` mode the app subscribes and refetches when its file changes on disk — so when the agent edits the file, the change appears in the embedded view within ~1s, applied as an **undoable** commit (the user can Ctrl+Z an AI edit). The dev server suppresses the echo from the app's own `/__save` writes (content comparison), so a manual save doesn't reload the app onto itself.

## Discovery — `registry.json`

Hosts fetch `<base>/micro-apps/registry.json` to list apps generically. An embed-capable entry carries:
```json
{ "id": "house-designer", "path": "house-designer/",
  "projectParam": true, "dataDir": "houses/", "dataExt": ".house.json",
  "suggestions": ["Add a window to the living room", "Añade un baño"] }
```
`projectParam: true` tells the host it can use `?project=`; `dataDir`/`dataExt` tell it where the app's files live and their extension; `suggestions` seed the host's instruction UI.

## Agent editing

The agent edits `dataDir/*.<dataExt>` files directly in the repo working tree. For house-designer the file format, geometry rules, and validation gates live in the **`house-design`** skill — always validate + lint after editing (that skill documents the exact commands). Keep edits minimal and preserve existing element ids.

## Making a NEW app embed-compliant

1. On boot, read `?project`/`save`/`embed` (see `apps/house-designer/src/hooks/useProjectFile.js` for a copyable, framework-light implementation): fetch the project URL, save back to `/micro-apps/__save`, subscribe to `__hmr` `houses-changed`, and apply external edits as undoable state.
2. Add `data-embed` CSS rules hiding your persistence chrome.
3. Add a `dataDir` under the repo root (git-tracked) + a `registry.json` entry with `projectParam/dataDir/dataExt`.
4. If the app has structured state an agent will edit, write (or extend) a skill describing the schema + validation, like `house-design`.

## Verify a round-trip

Start `make dev`, then load the app with `?project=&save=1&embed=1`:
- Edit in the app → the file on disk updates.
- Edit the file on disk → the app reloads and shows it; Ctrl+Z reverts.
- The Playwright suite `tools/playwright-check/project-file.spec.mjs` automates exactly this (run with `DEV_HOST=http://127.0.0.1:8020` against a dev server on that port).
