// Selection handles (rotate + resize) rendered in screen space so they stay
// a constant pixel size regardless of zoom.
export default function SelectionHandles({ f, worldToScreen, onRotateStart, onResizeStart }) {
  const cos = Math.cos(f.rotation), sin = Math.sin(f.rotation)
  // local (lx, ly) -> screen, rotating around the furniture center.
  const toScreen = (lx, ly) => worldToScreen(f.x + lx * cos - ly * sin, f.y + lx * sin + ly * cos)
  const corners = [
    toScreen(-f.width / 2, -f.depth / 2),
    toScreen(f.width / 2, -f.depth / 2),
    toScreen(-f.width / 2, f.depth / 2),
    toScreen(f.width / 2, f.depth / 2),
  ]
  const pts = corners.map((p) => p.sx + ',' + p.sy).join(' ')
  const rh = toScreen(0, -f.depth / 2 - 0.35)
  const rhAnchor = toScreen(0, -f.depth / 2)
  const br = corners[3]
  return (
    <g>
      {/* bounding outline (marching ants via CSS animation) */}
      <polygon className="selection-ants" points={pts} fill="none" stroke="#ff8c1a" strokeWidth={1.5} strokeDasharray="4 3" />
      {/* rotate handle */}
      <line x1={rhAnchor.sx} y1={rhAnchor.sy} x2={rh.sx} y2={rh.sy} stroke="#ff8c1a" strokeWidth={1.5} />
      <circle cx={rh.sx} cy={rh.sy} r={6} fill="#fff" stroke="#ff8c1a" strokeWidth={2}
        style={{ cursor: 'grab' }} onPointerDown={(e) => { e.stopPropagation(); onRotateStart() }} />
      {/* resize handle: bottom-right corner */}
      <circle cx={br.sx} cy={br.sy} r={6} fill="#ff8c1a" stroke="#fff" strokeWidth={2}
        style={{ cursor: 'nwse-resize' }} onPointerDown={(e) => { e.stopPropagation(); onResizeStart() }} />
    </g>
  )
}
