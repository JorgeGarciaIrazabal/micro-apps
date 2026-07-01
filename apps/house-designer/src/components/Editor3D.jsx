import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { dist, openingsOnWall } from '../lib/project.js'
import { buildFurniture3D } from '../lib/furniture3d.js'

// 3D preview: extrudes the 2D walls into boxes and places furniture as boxes.
// World meters (x, y) map to 3D (x, z); height is along Y (up).

const Editor3D = forwardRef(function Editor3D({ project }, ref) {
  const mountRef = useRef(null)
  const stateRef = useRef(null) // { renderer, scene, camera, controls, content, floor }

  useImperativeHandle(ref, () => ({
    exportPNG: () => {
      const s = stateRef.current
      if (!s) return null
      s.renderer.render(s.scene, s.camera)
      return s.renderer.domElement.toDataURL('image/png')
    },
    resetCamera: () => {
      const s = stateRef.current
      if (!s) return
      frameScene(s, project)
      s.controls.update()
    },
  }), [project])

  // ---- one-time scene setup ----
  useEffect(() => {
    const mount = mountRef.current
    const w = mount.clientWidth || 800
    const h = mount.clientHeight || 560

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.setClearColor('#dfe7ee')
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#dfe7ee')
    scene.fog = new THREE.Fog('#dfe7ee', 40, 120)

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 500)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.maxPolarAngle = Math.PI / 2 - 0.02 // don't go under the floor

    // Lighting: warm key + cool fill + ambient.
    const hemi = new THREE.HemisphereLight('#ffffff', '#9aa6b2', 0.85)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight('#fff6e6', 0.7)
    dir.position.set(8, 14, 6)
    scene.add(dir)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshStandardMaterial({ color: '#e9e4db', roughness: 0.95, metalness: 0 }),
    )
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)

    // Grid is rebuilt in frameScene() so cells stay ~1m across scene sizes.

    const content = new THREE.Group()
    scene.add(content)

    stateRef.current = { renderer, scene, camera, controls, content, floor, grid: null }
    frameScene(stateRef.current, project)

    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const ro = new ResizeObserver(() => {
      const nw = mount.clientWidth
      const nh = mount.clientHeight
      if (!nw || !nh) return
      renderer.setSize(nw, nh)
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
    })
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      const s = stateRef.current
      content.traverse((o) => o.geometry?.dispose?.())
      floor.geometry.dispose()
      if (s?.grid) { s.grid.geometry.dispose(); s.grid.material.dispose() }
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      stateRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- rebuild walls + furniture when project changes ----
  useEffect(() => {
    const s = stateRef.current
    if (!s) return
    rebuild(s, project)
    frameScene(s, project)
  }, [project])

  return <div className="editor3d" ref={mountRef} />
})

export default Editor3D

// ---- helpers -------------------------------------------------------------

function bboxOf(scene) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  const pts = []
  for (const w of scene.walls || []) { pts.push([w.x1, w.y1], [w.x2, w.y2]) }
  for (const f of scene.furniture || []) {
    pts.push([f.x - f.width / 2, f.y - f.depth / 2], [f.x + f.width / 2, f.y + f.depth / 2])
  }
  for (const [x, y] of pts) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minY = Math.min(minY, y); maxY = Math.max(maxY, y)
  }
  if (!Number.isFinite(minX)) { minX = -3; maxX = 3; minY = -3; maxY = 3 }
  return { minX, maxX, minY, maxY }
}

// Union bounding box across floors (XZ extent) + the top elevation.
// If `filter` is given, only floors passing it are included (e.g. visible floors).
function unionBBox(project, filter) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, topY = 0
  const wallH = project.settings.wallHeight
  for (const fl of project.floors || []) {
    if (filter && !filter(fl)) continue
    const bb = bboxOf(fl)
    minX = Math.min(minX, bb.minX); maxX = Math.max(maxX, bb.maxX)
    minY = Math.min(minY, bb.minY); maxY = Math.max(maxY, bb.maxY)
    topY = Math.max(topY, (fl.level || 0) + wallH)
  }
  if (!Number.isFinite(minX)) { minX = -3; maxX = 3; minY = -3; maxY = 3 }
  return { minX, maxX, minY, maxY, topY }
}

function rebuild(s, project) {
  // Dispose previous content (walls + composed furniture groups).
  const dead = []
  s.content.traverse((o) => { if (o.isMesh) dead.push(o) })
  for (const m of dead) { m.geometry?.dispose?.(); m.material?.dispose?.() }
  s.content.clear()

  const wallH = project.settings.wallHeight
  const wallMat = new THREE.MeshStandardMaterial({ color: '#ece4d6', roughness: 0.85 })
  const slabMats = ['#e9e4db', '#ded7c9'].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }))

  // Only show the active floor and floors below it (so upper floors don't
  // block the view of the floor being inspected).
  const activeFl = (project.floors || []).find((f) => f.id === project.activeFloorId)
  const activeLvl = activeFl ? (activeFl.level || 0) : Infinity
  const visibleFloors = (project.floors || []).filter((f) => (f.level || 0) <= activeLvl + 1e-6)

  // addWallSeg builds a wall box for segment [a,b] (meters along the wall),
  // spanning y0..y1 within the floor, lifted by yBase (the floor's elevation).
  const addWallSeg = (w, a, b, y0, y1, yBase) => {
    const len = b - a
    if (len < 1e-3) return
    const L = dist(w.x1, w.y1, w.x2, w.y2)
    const ux = (w.x2 - w.x1) / L, uy = (w.y2 - w.y1) / L
    const geo = new THREE.BoxGeometry(len, y1 - y0, w.thickness)
    const mesh = new THREE.Mesh(geo, wallMat)
    const m = (a + b) / 2
    mesh.position.set(w.x1 + m * ux, (y0 + y1) / 2 + yBase, w.y1 + m * uy)
    mesh.rotation.y = -Math.atan2(uy, ux)
    s.content.add(mesh)
  }

  // Stack every visible floor at its elevation; the active floor is edited in 2D.
  visibleFloors.forEach((fl, fi) => {
    const yBase = fl.level || 0
    // floor slab so upper floors aren't floating
    const bb = bboxOf(fl)
    if (Number.isFinite(bb.minX)) {
      const sw = (bb.maxX - bb.minX) + 1.2, sh = (bb.maxY - bb.minY) + 1.2
      const slab = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.12, sh), slabMats[fi % 2])
      slab.position.set((bb.minX + bb.maxX) / 2, yBase - 0.06, (bb.minY + bb.maxY) / 2)
      s.content.add(slab)
    }
    for (const w of fl.walls) {
      const L = dist(w.x1, w.y1, w.x2, w.y2)
      if (L < 1e-3) continue
      let cursor = 0
      for (const o of openingsOnWall(fl, w.id)) {
        const a = Math.max(cursor, o.offset - o.width / 2)
        const b = Math.min(L, o.offset + o.width / 2)
        if (b - a < 0.05) { cursor = Math.max(cursor, b); continue }
        if (a > cursor) addWallSeg(w, cursor, a, 0, wallH, yBase)
        if (o.sill > 0.01) addWallSeg(w, a, b, 0, o.sill, yBase)           // wall below window
        const top = o.sill + o.height
        if (top < wallH - 0.01) addWallSeg(w, a, b, top, wallH, yBase)     // lintel
        addOpening3D(s, w, o, a, b, yBase)
        cursor = b
      }
      if (cursor < L - 1e-6) addWallSeg(w, cursor, L, 0, wallH, yBase)
    }
    for (const f of fl.furniture) {
      const g = buildFurniture3D(f.type, f.width, f.depth, f.height, f.color)
      g.position.set(f.x, yBase, f.y)
      g.rotation.y = -f.rotation
      s.content.add(g)
    }
  })
}

// Build a door/window in a wall opening (local x = along wall, z = thickness).
function addOpening3D(s, w, o, a, b, yBase) {
  const L = dist(w.x1, w.y1, w.x2, w.y2)
  const ux = (w.x2 - w.x1) / L, uy = (w.y2 - w.y1) / L
  const wd = b - a
  const m = (a + b) / 2
  const g = new THREE.Group()
  g.position.set(w.x1 + m * ux, yBase, w.y1 + m * uy)
  g.rotation.y = -Math.atan2(uy, ux)
  const mesh = (geo, color, x, y, z, opts) => {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color), roughness: 0.8, metalness: 0.05,
      transparent: (opts && opts.opacity < 1) || false, opacity: opts?.opacity ?? 1,
    })
    const me = new THREE.Mesh(geo, mat)
    me.position.set(x, y, z); g.add(me)
  }
  const cy = o.sill + o.height / 2
  if (o.type === 'door') {
    // Leaf hung open (~80°) on the chosen jamb, swinging to the chosen side.
    const hingeX = o.hinge === 0 ? -wd / 2 : wd / 2
    const dir = o.hinge === 0 ? 1 : -1            // leaf extends from hinge toward the opening
    const sideSign = o.side > 0 ? 1 : -1          // swing to +z or -z (wall sides)
    const hingeG = new THREE.Group()
    hingeG.position.set(hingeX, cy, 0)
    hingeG.rotation.y = -sideSign * dir * 1.4    // ~80° open
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(wd, o.height, 0.05),
      new THREE.MeshStandardMaterial({ color: new THREE.Color('#7a5a3a'), roughness: 0.8, metalness: 0.05 }),
    )
    leaf.position.set(dir * wd / 2, 0, 0)
    hingeG.add(leaf)
    g.add(hingeG)
    mesh(new THREE.BoxGeometry(0.04, o.height, w.thickness), '#9c8b78', -wd / 2, cy, 0) // jamb
    mesh(new THREE.BoxGeometry(0.04, o.height, w.thickness), '#9c8b78', wd / 2, cy, 0)  // jamb
  } else {
    mesh(new THREE.BoxGeometry(wd, o.height, 0.04), '#9fc6e0', 0, cy, 0, { opacity: 0.4, rough: 0.1 }) // glass
    mesh(new THREE.BoxGeometry(0.04, o.height, w.thickness), '#9c8b78', -wd / 2, cy, 0) // jamb
    mesh(new THREE.BoxGeometry(0.04, o.height, w.thickness), '#9c8b78', wd / 2, cy, 0)  // jamb
  }
  s.content.add(g)
}

// Position the floor + grid to cover the scene and frame the camera.
function frameScene(s, project) {
  // Only frame visible floors (active + below) so the camera isn't pulled
  // toward upper floors that are hidden.
  const activeFl = (project.floors || []).find((f) => f.id === project.activeFloorId)
  const activeLvl = activeFl ? (activeFl.level || 0) : Infinity
  const visFilter = (fl) => (fl.level || 0) <= activeLvl + 1e-6
  const { minX, maxX, minY, maxY, topY } = unionBBox(project, visFilter)
  const cx = (minX + maxX) / 2
  const cz = (minY + maxY) / 2
  const w = (maxX - minX) + 4
  const h = (maxY - minY) + 4

  s.floor.scale.set(w, h, 1)
  s.floor.position.set(cx, 0, cz)
  if (s.grid) { s.scene.remove(s.grid); s.grid.geometry.dispose(); s.grid.material.dispose() }
  const gs = Math.max(Math.ceil(w), Math.ceil(h), 2)
  const grid = new THREE.GridHelper(gs, gs, '#c4bdb0', '#d8d2c6')
  grid.material.opacity = 0.45
  grid.material.transparent = true
  grid.position.set(cx, 0.01, cz)
  s.scene.add(grid)
  s.grid = grid

  const size = Math.max(maxX - minX, maxY - minY, 4)
  const dist = size * 1.6 + 6
  s.camera.position.set(cx + dist * 0.6, Math.max(dist * 0.7, topY + size * 0.4), cz + dist * 0.9)
  s.controls.target.set(cx, topY / 2, cz)
  s.camera.near = 0.1
  s.camera.far = Math.max(200, dist * 5)
  s.camera.updateProjectionMatrix()
}