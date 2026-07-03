# House Designer Sample Rewrite — Handoff

## Current State

- `apps/house-designer/src/lib/layout-linter.js` is in place with six reusable rules:
  `furniture-in-room`, `furniture-wall-clearance`, `furniture-overlap`, `door-swing-blocked`, `bed-against-wall`, `narrow-passage`.
- `apps/house-designer/src/lib/sample-layout.js` exposes shared helpers (`wall`, `opening`, `door`, `window`, `place`, `alongWall`, `centered`, `facing`, `row`, `spacedRow`, `room`).
- `apps/house-designer/src/lib/sample.js` currently contains only two sample generators:
  - `tinyCabin()` — **clean** (`lintProject` → 0 issues, structural validator → valid).
  - `familyHome()` — **drafted but not clean** (15 lint issues, see below).
- The saved example `apps/house-designer/sample-houses/120m2-family-home.house.json` is still the original broken layout and must be regenerated once the generator is clean.
- The other four sample generators are missing:
  `studioApartment`, `modernApartment`, `openLoft`, `homeOffice`.

## Immediate Next Steps

1. Fix `familyHome()` in `apps/house-designer/src/lib/sample.js` until `lintProject(getSample('family-home'))` reports **0 issues**.
2. Add the remaining four sample generators to `sample.js` and register them in `SAMPLES` / `getSample`.
3. Regenerate `apps/house-designer/sample-houses/120m2-family-home.house.json` from the clean `familyHome()` generator.
4. Run the structural validator and layout linter on all sample keys and the saved file.

## How to Verify

```js
// Lint a generated sample
const { lintProject } = await import('./src/lib/layout-linter.js')
const { getSample } = await import('./src/lib/sample.js')
const issues = lintProject(getSample('family-home'))
console.log(issues.length)
for (const i of issues) console.log(`${i.severity} ${i.rule}: ${i.message}`)
```

```sh
# Validate a saved .house.json file structurally
node .claude/skills/house-design/validate.mjs apps/house-designer/sample-houses/120m2-family-home.house.json
```

## Critical Pitfalls to Avoid

- **`alongWall(..., along, ...)` uses `along` as the distance from the wall's minimum-coordinate endpoint**, not the absolute world coordinate. For a vertical wall `(x, 4.5) → (x, 7)`, an item at world `y = 5.0` needs `along = 0.5`.
- **Define walls min-first** (smaller coordinate first). Walls like the top wall must be `(0, 7) → (9, 7)`, not `(9, 7) → (0, 7)`.
- **`door(..., side=1)` meaning depends on wall direction** because `swingSideToInt` uses the wall's left/right normal. Verify swing arcs visually or with the `door-swing-blocked` rule.
- **Do not weaken linter thresholds** to mask layout bugs (e.g., keep `furniture-wall-clearance` at `d < -0.005`). Move furniture instead.

## Known Issues in Current `familyHome()` Draft

Running `lintProject(getSample('family-home'))` currently reports 15 issues:

- `furniture-in-room`: Ground-floor toilet and vanity are placed outside any room because `along` values were passed as world coordinates on short walls.
- `furniture-overlap`: Dining table overlaps all four chairs (`facing()` is placing them inside the table).
- `furniture-wall-clearance`: Upper-floor shower overlaps a wall (likely an `alongWall` direction or wall-definition issue).
- `furniture-overlap`: Upper-floor double bed overlaps the office chair; desk is too close to the bed.
- `narrow-passage`: Several bedroom/office/bathroom pairs are closer than 0.5 m.

A minimal fix strategy is to reduce the item count per room, correct all `along` offsets, then re-add items one group at a time and lint after each addition.

## File Inventory

- Generator source: `apps/house-designer/src/lib/sample.js`
- Shared helpers: `apps/house-designer/src/lib/sample-layout.js`
- Linter: `apps/house-designer/src/lib/layout-linter.js`
- Structural validator: `.claude/skills/house-design/validate.mjs`
- Saved example target: `apps/house-designer/sample-houses/120m2-family-home.house.json`
- Handoff: `apps/house-designer/HANDOFF.md` (this file)
