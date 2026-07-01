import { useCallback, useMemo, useState } from 'react'
import { dist, snap, angleSnap } from '../lib/geometry.js'
import * as M from '../lib/mutations.js'

// The in-progress wall chain for the Wall tool: click to chain points, click
// near the first point to close the loop, Enter/Escape to finish. Each segment
// commits immediately so partial chains survive tool switches.
export function useWallDraft({ walls, grid, scale, thickness, commit, snapPx = 12 }) {
  const [draft, setDraft] = useState([]) // [{x,y}] in meters
  const [cursor, setCursor] = useState(null) // world meters, for preview

  // Snap a world point to grid + nearby wall endpoints, optionally
  // angle-aligned to a reference point (for wall drawing).
  const snapPoint = useCallback((x, y, ignoreId = null, alignTo = null) => {
    const threshold = snapPx / scale // meters
    let best = { x: snap(x, grid), y: snap(y, grid) }
    let bestD = threshold
    for (const w of walls) {
      if (w.id === ignoreId) continue
      for (const pt of [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }]) {
        const d = dist(pt.x, pt.y, x, y)
        if (d < bestD) { bestD = d; best = { x: pt.x, y: pt.y } }
      }
    }
    // Only angle-snap when no endpoint snap won (so corners still connect).
    if (alignTo && bestD >= threshold) {
      best = angleSnap(best.x, best.y, alignTo)
    }
    return best
  }, [walls, grid, scale, snapPx])

  // Handle a Wall-tool click at a world point.
  // NOTE: the wall commit and the draft update stay separate setState calls —
  // nesting commit inside setDraft's updater is "setState during render".
  const handleWallClick = useCallback((world) => {
    const prev = draft[draft.length - 1]
    const p = snapPoint(world.x, world.y, null, prev || null)
    // Closing the chain: click near the first point loops back and resets.
    if (draft.length >= 2 && dist(draft[0].x, draft[0].y, p.x, p.y) < snapPx / scale) {
      commit((proj) => M.addWall(proj, draft[draft.length - 1], draft[0], thickness))
      setDraft([])
      return
    }
    if (prev) commit((proj) => M.addWall(proj, prev, p, thickness))
    setDraft([...draft, p])
  }, [draft, snapPoint, commit, thickness, scale, snapPx])

  const finish = useCallback(() => setDraft([]), [])

  // Snapped preview segment from the last draft point to the cursor.
  const preview = useMemo(() => {
    if (!draft.length || !cursor) return null
    const last = draft[draft.length - 1]
    const p = snapPoint(cursor.x, cursor.y, null, last)
    return { from: last, to: p }
  }, [draft, cursor, snapPoint])

  return { draft, preview, cursor, setCursor, snapPoint, handleWallClick, finish }
}
