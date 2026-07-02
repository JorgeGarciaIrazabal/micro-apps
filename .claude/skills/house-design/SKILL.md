---
name: house-design
description: Create and validate House Designer project JSON files (`.house.json`) for the micro-apps house-designer app. Use when the user asks to build a floor plan, generate a sample house, design a room layout, or validate a House Designer JSON file. Provides the full data-model spec, a geometry cheat sheet, and a validator script.
---

# House Design — Project JSON Builder & Validator

## Where the app lives

- **App source**: `apps/house-designer/` (Vite + React, standalone project)
- **Runtime URL (dev)**: `http://localhost:8000/micro-apps/house-designer/`
- **Runtime URL (prod)**: `https://jorgegarciairazabal.github.io/micro-apps/house-designer/`
- **Import in-app**: Top bar → "Open…" loads a `.house.json` (or any `.json`) file.
- **Export in-app**: Top bar → "Save JSON" downloads `serialize(project)` = pretty 2-space JSON.

## Coordinate system

- All geometry is in **meters** (m), resolution-independent. The 2D editor maps meters → pixels via a zoom scale.
- **2D plane**: `x` = horizontal, `y` = vertical. Origin (0,0) is top-left convention but arbitrary.
- **3D mapping**: 2D `(x, y)` → 3D `(x, z)`; height is along **Y (up)**.
- **Furniture local frame**: `x` = width, `y` = depth, rotated by `rotation` (radians) around the center `(x, y)`.
- Snap to the grid (`settings.gridSize`, default 0.1 m) for clean placement. Endpoint-snap to existing wall corners.
- Walls are axis-aligned-friendly: the app angle-snaps within ~12° of 0/90/180/270°.

## Loading a generated file into the app

Two options:

1. **File picker** (manual): write the JSON to disk, then in the app click "Open…" and select the file. The app imports via `deserialize(text)` → `normalizeProject(parsed)` which is *tolerant* (fills defaults, clamps ranges, drops junk).
2. **localStorage** (instant, dev only): paste the JSON into the browser console:
   ```js
   localStorage.setItem('house-designer:project:v1', JSON.stringify(<the-object>, null, 2));
   location.reload();
   ```

Always run the validator (below) before importing — `normalizeProject` repairs most issues but won't tell you *what* was wrong.

## The project model — top-level shape

```jsonc
{
  "version": 1,                       // integer; MUST be 1. Future-proofing only.
  "name": "My House",                 // string; shown in the top bar + used as export filename stem
  "settings": { ... },                // object; see Settings
  "floors": [ ... ],                  // array of Floor; at least 1. floors[0] is ground; stacked by `level`.
  "activeFloorId": "floor_..."        // string; MUST match one floor's `id`. The floor edited in 2D.
}
```

### Settings

```jsonc
"settings": {
  "units": "m",                 // "m" | "ft". Display only; storage is always meters.
  "wallHeight": 2.7,            // meters; clamped to [2.4, 6.0]; default 2.7.
  "wallThickness": 0.15,        // meters; clamped to [0.05, 0.6]; default 0.15.
  "gridSize": 0.1               // meters; clamped to [0.01, 1.0]; default 0.1. Snap step.
}
```

## Floor

```jsonc
{
  "id": "floor_ground",          // string; human-friendly ids are fine but must be unique within `floors`.
  "name": "Ground",             // string; shown in the floor tab.
  "level": 0,                    // number (meters); elevation of this floor's floor-slab. -10..30. Default order: 0, 3, 6, ...
  "walls": [ ... ],              // array of Wall
  "furniture": [ ... ],          // array of Furniture
  "openings": [ ... ]            // array of Opening (doors + windows)
}
```

- `level` controls vertical stacking: in 3D, floor i sits at `y = level`. Standard story = `level += 3`.
- In **3D**, only the active floor and floors *below* it are rendered (upper floors hidden).
- In **2D**, floors strictly below the active one are drawn faintly (≈22% opacity) as a construction guide.

## Wall

```jsonc
{
  "id": "w_1",                   // string; unique
  "x1": 0, "y1": 0,              // start point (meters)
  "x2": 6, "y2": 0,              // end point (meters)
  "thickness": 0.15              // meters; clamped [0.05, 0.6]; default from settings
}
```

- A wall is a line segment. Length = `hypot(x2-x1, y2-y1)`. **Zero-length walls are dropped.**
- Drawn in 2D as a thick line (`thickness` = stroke width) + a thin center line, cut by openings.
- In 3D, extruded as a box `(len, wallHeight, thickness)` lifted to `y = level`.
- **Building rectangles**: connect corners — wall B's start = wall A's end. Snap endpoints to shared coordinates (use exact values, not approximate). The app angle-snaps near-axis; hand-authored JSON should just use exact axis-aligned coords.

### Recommended pattern for a rectangular room (origin at 0,0, W×H meters)

Use 4 walls forming a closed loop (corners shared):
```jsonc
{ "id": "w_bottom", "x1": 0, "y1": 0,  "x2": W, "y2": 0,  "thickness": 0.15 },
{ "id": "w_right",  "x1": W, "y1": 0,  "x2": W, "y2": H, "thickness": 0.15 },
{ "id": "w_top",    "x1": W, "y1": H,  "x2": 0, "y2": H, "thickness": 0.15 },
{ "id": "w_left",   "x1": 0, "y1": H,  "x2": 0, "y2": 0,  "thickness": 0.15 }
```

To leave a **door gap** in a wall (alternative to using an Opening): split the wall into two segments leaving a gap, e.g. left wall with a 0.9 m door gap from y=1.5 to y=2.4:
```jsonc
{ "id": "w_left_a", "x1": 0, "y1": H, "x2": 0, "y2": 2.4 },
{ "id": "w_left_b", "x1": 0, "y1": 1.5, "x2": 0, "y2": 0 }
```
Prefer **Openings** (below) for doors/windows though — they keep the wall solid in 3D with a real cut + frame.

## Furniture

```jsonc
{
  "id": "f_1",                   // string; unique across ALL floors
  "type": "sofa",                // string; see catalog table. Unknown → treated as "box".
  "x": 4.2, "y": 1.0,            // center position (meters)
  "rotation": 0,                 // radians; 0 = width along +x, depth along +y.
  "width": 2.0,                  // meters (x-extent); clamped [0.05, 10]; default from catalog
  "depth": 0.9,                  // meters (y-extent); clamped [0.05, 10]; default from catalog
  "height": 0.85,                // meters; clamped [0.05, 4]; default from catalog
  "color": "#6c8e9f",            // hex string; default "#b08968"
  "label": "Sofa"                // string; optional; default from catalog label
}
```

- `x, y` is the **center**, not a corner. Place a sofa centered at `(4.2, 1.0)`.
- `rotation` in radians. Common values: `0` (along +x), `Math.PI/2` (=1.5708, along +y), `Math.PI` (=3.1416, along -x), `3*Math.PI/2` (along -y). The in-app 90°-rotate button uses `Math.PI/2` increments.
- In 2D, drawn as a top-down SVG symbol via `FurnitureGraphic`. In 3D, built via `buildFurniture3D`.
- Two pieces on different floors may reuse the same `type` but MUST have unique `id`.

### Furniture catalog (type → defaults)

Prefer using the catalog defaults — only override `x, y, rotation` (and optionally `color`/`label`) when generating JSON.

| type | label | width | depth | height | color | category |
|---|---|---|---|---|---|---|
| `sofa` | Sofa | 2.0 | 0.9 | 0.85 | #6c8e9f | Living Room |
| `armchair` | Armchair | 0.85 | 0.85 | 0.9 | #7d6b8d | Living Room |
| `coffee-table` | Coffee Table | 1.1 | 0.6 | 0.45 | #8a5a3b | Living Room |
| `tv-stand` | TV Stand | 1.6 | 0.45 | 0.55 | #3a3a3a | Living Room |
| `bookshelf` | Bookshelf | 0.9 | 0.35 | 1.9 | #5a3a22 | Living Room |
| `rug` | Rug | 2.4 | 1.6 | 0.05 | #b8845a | Living Room |
| `floor-lamp` | Floor Lamp | 0.4 | 0.4 | 1.6 | #c9a227 | Living Room |
| `piano` | Piano | 1.5 | 0.6 | 1.2 | #2b2b2b | Living Room |
| `side-table` | Side Table | 0.5 | 0.5 | 0.55 | #8a5a3b | Living Room |
| `bed-double` | Double Bed | 1.6 | 2.1 | 0.55 | #9aa7c2 | Bedroom |
| `bed-single` | Single Bed | 0.9 | 2.0 | 0.55 | #9aa7c2 | Bedroom |
| `nightstand` | Nightstand | 0.5 | 0.4 | 0.55 | #8a5a3b | Bedroom |
| `wardrobe` | Wardrobe | 1.5 | 0.6 | 2.1 | #6b4e3d | Bedroom |
| `dresser` | Dresser | 1.2 | 0.5 | 0.9 | #7a5a44 | Bedroom |
| `crib` | Crib | 0.7 | 1.3 | 0.9 | #c2b2d6 | Bedroom |
| `counter` | Counter | 2.0 | 0.6 | 0.9 | #cfcfcf | Kitchen |
| `sink` | Sink | 0.8 | 0.6 | 0.9 | #9aa6b2 | Kitchen |
| `stove` | Stove | 0.75 | 0.6 | 0.9 | #2f2f2f | Kitchen |
| `fridge` | Fridge | 0.7 | 0.7 | 1.9 | #dfe3e6 | Kitchen |
| `island` | Island | 1.8 | 0.9 | 0.9 | #b8b0a4 | Kitchen |
| `dining-table` | Dining Table | 1.6 | 0.9 | 0.75 | #8a5a3b | Kitchen |
| `chair` | Chair | 0.45 | 0.45 | 0.9 | #6b4e3d | Kitchen |
| `dishwasher` | Dishwasher | 0.6 | 0.6 | 0.85 | #b9c1c7 | Kitchen |
| `toilet` | Toilet | 0.4 | 0.65 | 0.8 | #eef2f5 | Bathroom |
| `bathtub` | Bathtub | 1.7 | 0.75 | 0.55 | #e7edf2 | Bathroom |
| `shower` | Shower | 0.9 | 0.9 | 2.0 | #cfe0e8 | Bathroom |
| `vanity` | Vanity | 0.9 | 0.5 | 0.85 | #d9cfc4 | Bathroom |
| `washing-machine` | Washing Machine | 0.6 | 0.6 | 0.85 | #e8ebee | Bathroom |
| `desk` | Desk | 1.4 | 0.7 | 0.75 | #7a5a44 | Office |
| `office-chair` | Office Chair | 0.6 | 0.6 | 1.0 | #2f2f2f | Office |
| `filing-cabinet` | Filing Cabinet | 0.5 | 0.6 | 1.3 | #555 | Office |
| `stairs` | Stairs | 1.0 | 3.0 | 3.0 | #b09a7a | Stairs & Balcony |
| `balcony` | Balcony | 3.0 | 1.5 | 1.05 | #c5c9cf | Stairs & Balcony |
| `railing` | Railing | 2.0 | 0.1 | 1.05 | #8b8f96 | Stairs & Balcony |
| `plant` | Plant | 0.5 | 0.5 | 1.0 | #4a7c4a | Outdoor & Garden |
| `tree` | Tree | 1.2 | 1.2 | 3.0 | #3d6b3d | Outdoor & Garden |
| `pool` | Pool | 4.0 | 2.5 | 0.5 | #5fa8d3 | Outdoor & Garden |
| `bbq` | BBQ Grill | 0.6 | 0.6 | 1.0 | #3a3a3a | Outdoor & Garden |
| `bench` | Bench | 1.5 | 0.4 | 0.45 | #8a6a4a | Outdoor & Garden |
| `outdoor-table` | Outdoor Table | 1.2 | 0.8 | 0.72 | #9a8a72 | Outdoor & Garden |
| `box` | Custom Box | 0.6 | 0.6 | 0.6 | #b08968 | Misc |

Placement notes for the structural pieces:
- `stairs`: rises along its local −y direction (the 2D arrow points "up"); set `height` to the next floor's `level` delta (default 3.0) and place the foot end (+y) where the run starts.
- `balcony`: the −y edge is the open side that attaches to the house — place its center `depth/2` outside the exterior wall, rotated so the open edge faces the wall. Add a `door` opening on that wall for access. `height` is the railing height.
- `railing`: a straight guard segment (posts + handrail) for terraces or stair edges.

## Opening (door / window)

```jsonc
{
  "id": "o_1",                   // string; unique across ALL floors
  "type": "door",                // "door" | "window"
  "style": "swing",              // doors only: "swing" (default) | "double" | "sliding" | "folding"
  "wallId": "w_bottom",          // string; MUST match a wall id ON THE SAME FLOOR
  "offset": 0.9,                 // meters along the wall from (x1,y1); clamped >= 0, < wall length
  "width": 0.9,                  // meters; door [0.3,3] default 0.9; window [0.3,3] default 1.2
  "height": 2.1,                 // meters; [0.3,4]; door default 2.1, window default 1.2
  "sill": 0,                     // meters; bottom of opening above the floor. door default 0, window default 1.0
  "hinge": 0,                    // 0 = hinge at wall start (x1,y1); 1 = hinge at wall end (x2,y2). Doors only.
  "side": 1                      // +1 = swing/side toward wall's left normal; -1 = right normal. Doors use for swing; windows for which side the glass faces.
}
```

- `offset` is **from the wall's start point (x1,y1)** along its length. To center a 0.9 m door on a 6 m wall, use `offset: 3.0` (center) ± half its width as needed. Clamp: `width/2 <= offset <= L - width/2`.
- **Coordinate an opening with its wall**: when generating, reference the wall's `id` and know which end is "start". The 2D symbol and 3D cut both depend on `offset` from start.
- Doors: rendering depends on `style` — `swing` (default): one leaf swung ~80° open on the `hinge` jamb toward `side` (2D: leaf line + arc); `double`: two half-width leaves swung from both jambs (typical width 1.5); `sliding`: two overlapping panels along the wall, one half-open (typical width 1.6; `hinge`/`side` mostly ignored); `folding`: a bifold accordion zigzag from the `hinge` jamb toward `side` (typical width 1.2).
- Windows: in 3D, translucent glass + jambs; in 2D, two parallel glass lines across the gap.
- A wall with an opening stays solid except in the gap (the wall is rendered as solid segments around it). The opening does **not** split the wall — it references it.

## Full annotated example (small studio, one floor)

```jsonc
{
  "version": 1,
  "name": "Tiny Studio",
  "settings": { "units": "m", "wallHeight": 2.7, "wallThickness": 0.15, "gridSize": 0.1 },
  "floors": [
    {
      "id": "floor_ground",
      "name": "Ground",
      "level": 0,
      "walls": [
        { "id": "w_bottom", "x1": 0, "y1": 0, "x2": 5, "y2": 0, "thickness": 0.15 },
        { "id": "w_right",  "x1": 5, "y1": 0, "x2": 5, "y2": 4, "thickness": 0.15 },
        { "id": "w_top",    "x1": 5, "y1": 4, "x2": 0, "y2": 4, "thickness": 0.15 },
        { "id": "w_left",   "x1": 0, "y1": 4, "x2": 0, "y2": 0, "thickness": 0.15 }
      ],
      "furniture": [
        { "id": "f_sofa",  "type": "sofa",        "x": 3.2, "y": 0.7, "rotation": 0, "width": 2.0, "depth": 0.9, "height": 0.85, "color": "#6c8e9f", "label": "Sofa" },
        { "id": "f_bed",   "type": "bed-double",  "x": 1.0, "y": 2.8, "rotation": 0, "width": 1.6, "depth": 2.1, "height": 0.55, "color": "#9aa7c2", "label": "Double Bed" }
      ],
      "openings": [
        { "id": "o_door",   "type": "door",   "wallId": "w_bottom", "offset": 0.9, "width": 0.9, "height": 2.1, "sill": 0,    "hinge": 0, "side": 1 },
        { "id": "o_window", "type": "window", "wallId": "w_right",  "offset": 2.0, "width": 1.2, "height": 1.2, "sill": 1.0,  "hinge": 0, "side": 1 }
      ]
    }
  ],
  "activeFloorId": "floor_ground"
}
```

## How to author a new project

1. Decide room dimensions and origin. Use round meter values (e.g. `6 × 5`) and exact corner coords.
2. Create one floor (or more — each `level += 3`).
3. Define walls as a closed loop. Reuse corners exactly so endpoints connect.
4. Place furniture by *center* (`x, y`), considering `width`/`depth` so items don't overlap walls.
5. Add openings referencing wall ids; compute `offset` from the wall start.
6. Run the validator: `node .claude/skills/house-design/validate.mjs <file.house.json>`.
7. Import into the app via "Open…" or write to `localStorage['house-designer:project:v1']` in the dev console + reload.

## Geometry helpers (when computing by hand)

```
wall length   L = hypot(x2-x1, y2-y1)
opening range on wall  =  [offset - width/2, offset + width/2]
furniture local pt (lx,ly) -> world  x = fx + lx*cos(rot) - ly*sin(rot),  y = fy + lx*sin(rot) + ly*cos(rot)
distance point->segment: project t = clamp(((px-x1)dx + (py-y1)dy)/(dx²+dy²), 0, 1)
```

## Validator script

A standalone Node.js validator lives at `.claude/skills/house-design/validate.mjs`.
Run it on any House Designer JSON file:

```bash
node .claude/skills/house-design/validate.mjs path/to/file.house.json
```

It checks:
- valid JSON + a top-level object
- `version` is `1`
- required string fields (`name`, `activeFloorId`, all ids)
- `settings` numeric ranges and units enum
- every floor has unique `id`, valid `level`, and non-overlapping ids across floors
- every wall: unique id, numeric coords, non-zero length, `thickness` in range
- every furniture: unique id (global), known `type` (warns on unknown), valid ranges, hex color
- every opening: unique id, valid `type`, `wallId` references an existing wall *on the same floor*, `offset` within wall span, valid ranges, door-specific `hinge`/`side` values
- `activeFloorId` references an existing floor
- cross-floor id uniqueness for furniture + openings

Exit code `0` = valid (warnings allowed). Non-zero = at least one error. Warnings (e.g. unknown furniture type) print but don't fail.

See the script header for all flags, including `--strict` (treat warnings as errors) and `--quiet`.

## Common pitfalls

| Pitfall | Fix |
|---|---|
| Furniture overlaps a wall | Move center inwards by `depth/2 + 0.05` from the wall line |
| Opening references a wall on another floor | `wallId` must match a wall on the **same floor** |
| `offset` outside wall span | Clamp to `[width/2, length - width/2]` |
| Corners don't connect | Use exact shared coordinates; don't approximate |
| Two items share an `id` | Ids must be unique within (and across, for furniture) floors |
| `activeFloorId` not in `floors` | Set it to an existing floor's `id` |
| Units feel off | `units` is display-only; all numbers in the file are meters |
| Unknown furniture type renders as a box | Use a known `type` from the catalog (or accept the `box` fallback) |