# House Designer

A floor-plan editor with a live 3D preview. Draw walls, place doors/windows and
furniture in 2D (SVG), then orbit the extruded house in 3D (Three.js). Projects
autosave to localStorage and round-trip as `.house.json` files.

## Run

```bash
npm install
npm run dev      # dev server
npm run build    # production build (deployed under /micro-apps/house-designer/)
```

## Code map

```
src/
  App.jsx                  app shell: view/tool/selection state, import/export
  hooks/
    useProjectHistory.js   project state + undo/redo (single commit() entry point)
    usePanZoom.js          2D pan/zoom + world<->screen mapping
    useWallDraft.js        wall-chain drawing state + snapping
  lib/
    project.js             data model, normalize/serialize, file helpers
    mutations.js           ALL project mutations (pure, clone-first)
    geometry.js            shared math (also used by 3D + hit tests)
    hitTest.js             floor-level hit queries for the 2D editor
    rooms.js               room loop detection + real floor areas
    textures.js            procedural canvas textures for 3D materials
    furniture/registry.js  furniture catalog: one record per type -> 2D symbol + 3D model
  components/
    Editor2D.jsx           pointer/tool dispatch + SVG composition
    editor2d/*             render layers (grid, rooms, furniture, labels, handles)
    Editor3D.jsx           Three.js scene (shadows, materials, camera framing)
    FurnitureGraphic.jsx   top-down plan symbols (switch on registry `symbol`)
    lib/furniture3d.js     3D builders (switch on registry `model`)
```

## File format

The `.house.json` project format (settings, floors, walls, furniture, openings)
is specified in `.claude/skills/house-design/SKILL.md` at the repo root, which
also ships a validator:

```bash
node ../../.claude/skills/house-design/validate.mjs my-plan.house.json
```

## Shortcuts

Press `?` in the app for the full list (draw/edit/nudge/undo/redo/duplicate,
Space-drag pan, scroll zoom).

## Adding a furniture type

Add one record to `src/lib/furniture/registry.js`, choosing an existing
`symbol` (2D) and `model` (3D) — or add a new case to `FurnitureGraphic.jsx` /
`furniture3d.js` first if the piece needs its own look.
