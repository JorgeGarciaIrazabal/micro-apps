import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { openingsOnWall, activeFloor } from '../lib/project.js'
import { dist, wallCutSegments, pointSegDist } from '../lib/geometry.js'
import { buildFurniture3D } from '../lib/furniture3d.js'
import { makeWoodTexture, makeSkyTexture, makeGroundTexture } from '../lib/textures.js'
import { shade } from '../lib/color.js'

// 3D preview: extrudes the 2D walls into boxes and places furniture as boxes.
// World meters (x, y) map to 3D (x, z); height is along Y (up).

const Editor3D = forwardRef(function Editor3D({ project }, ref) {
  const mountRef = useRef(null)
  const stateRef = useRef(null) // { renderer, scene, camera, controls, content, floor }
  const [controlsMode, setControlsMode] = useState('orbit')
  const modeRef = useRef(controlsMode)
  const wallsRef = useRef([])
  const floorLevelRef = useRef(0)

  useEffect(() => {
    modeRef.current = controlsMode
  }, [controlsMode])

  useEffect(() => {
    const fl = activeFloor(project)
    if (!fl) {
      wallsRef.current = []
      floorLevelRef.current = 0
      return
    }
    floorLevelRef.current = fl.level || 0

    const walkSegments = []
    const walls = fl.walls || []
    for (const w of walls) {
      const L = dist(w.x1, w.y1, w.x2, w.y2)
      if (L < 1e-3) continue
      const ux = (w.x2 - w.x1) / L
      const uy = (w.y2 - w.y1) / L
      const walkOpenings = openingsOnWall(fl, w.id).filter(o => o.sill < 0.4)
      const { segs } = wallCutSegments(L, walkOpenings)
      for (const [a, b] of segs) {
        walkSegments.push({
          x1: w.x1 + a * ux,
          y1: w.y1 + a * uy,
          x2: w.x1 + b * ux,
          y2: w.y1 + b * uy,
          thickness: w.thickness
        })
      }
    }
    wallsRef.current = walkSegments
  }, [project])

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
      if (modeRef.current === 'walk') {
        const fl = activeFloor(project)
        const bb = fl && fl.walls.length ? bboxOf({ walls: fl.walls }) : { minX: -5, maxX: 5, minY: -5, maxY: 5 }
        const cx = (bb.minX + bb.maxX) / 2
        const cz = (bb.minY + bb.maxY) / 2
        const levelY = floorLevelRef.current
        s.camera.position.set(cx, levelY + 1.6, cz)
        s.camera.rotation.set(0, 0, 0)
      } else {
        frameScene(s, project)
        s.controls.update()
      }
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
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = makeSkyTexture()
    scene.fog = new THREE.Fog('#e8ddca', 40, 120)

    // Image-based environment so PBR materials (clearcoat ceramics, metals,
    // fabric sheen) have something real to reflect instead of flat lights.
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    scene.environment = envTex
    scene.environmentIntensity = 0.4

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 500)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.maxPolarAngle = Math.PI / 2 - 0.02 // don't go under the floor
    controls.minDistance = 2

    // Lighting: warm shadow-casting key + hemisphere fill.
    const hemi = new THREE.HemisphereLight('#ffffff', '#9aa6b2', 0.4)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight('#fff6e6', 1.0)
    dir.position.set(8, 14, 6)
    dir.castShadow = true
    dir.shadow.mapSize.set(2048, 2048)
    dir.shadow.bias = -0.0003
    scene.add(dir)
    scene.add(dir.target)

    // Soft ground patch under the house (radial fade, no hard edges).
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshStandardMaterial({
        map: makeGroundTexture(), transparent: true, roughness: 0.95, metalness: 0,
      }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // Grid is rebuilt in frameScene() so cells stay ~1m across scene sizes.

    const content = new THREE.Group()
    scene.add(content)

    stateRef.current = { renderer, scene, camera, controls, content, floor, dir, grid: null }
    frameScene(stateRef.current, project)

    // Keyboard listeners for walking
    const keys = {}
    const handleKeyDown = (e) => {
      if (modeRef.current !== 'walk') return
      const k = e.key.toLowerCase()
      keys[k] = true
    }
    const handleKeyUp = (e) => {
      if (modeRef.current !== 'walk') return
      const k = e.key.toLowerCase()
      keys[k] = false
    }
    const handleBlur = () => {
      for (const k in keys) keys[k] = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    // Pointer-lock-free mouse look listeners on the mount element
    let isDragging = false
    let prevX = 0, prevY = 0

    const handlePointerDown = (e) => {
      if (modeRef.current !== 'walk') return
      // Only look-drag from the canvas — capturing from overlay buttons would
      // steal their click (making it impossible to leave walk mode).
      if (e.target !== renderer.domElement) return
      isDragging = true
      prevX = e.clientX
      prevY = e.clientY
      mount.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e) => {
      if (!isDragging || modeRef.current !== 'walk') return
      const deltaX = e.clientX - prevX
      const deltaY = e.clientY - prevY
      prevX = e.clientX
      prevY = e.clientY

      const sensitivity = 0.003
      camera.rotation.order = 'YXZ'
      camera.rotation.y -= deltaX * sensitivity
      camera.rotation.x -= deltaY * sensitivity

      const limit = (85 * Math.PI) / 180
      camera.rotation.x = Math.max(-limit, Math.min(limit, camera.rotation.x))
    }

    const handlePointerUp = (e) => {
      if (!isDragging) return
      isDragging = false
      mount.releasePointerCapture(e.pointerId)
    }

    mount.addEventListener('pointerdown', handlePointerDown)
    mount.addEventListener('pointermove', handlePointerMove)
    mount.addEventListener('pointerup', handlePointerUp)

    // Collision detection check using precomputed wall segments
    const checkCollides = (x, z) => {
      const segments = wallsRef.current
      for (const seg of segments) {
        const d = pointSegDist(x, z, seg.x1, seg.y1, seg.x2, seg.y2)
        const minDist = (seg.thickness / 2) + 0.22 // Camera body clearance
        if (d < minDist) return true
      }
      return false
    }

    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)

      if (modeRef.current === 'walk') {
        let dx = 0, dz = 0
        if (keys['w'] || keys['arrowup']) {
          dx += -Math.sin(camera.rotation.y)
          dz += -Math.cos(camera.rotation.y)
        }
        if (keys['s'] || keys['arrowdown']) {
          dx += Math.sin(camera.rotation.y)
          dz += Math.cos(camera.rotation.y)
        }
        if (keys['a'] || keys['arrowleft']) {
          dx += -Math.cos(camera.rotation.y)
          dz += Math.sin(camera.rotation.y)
        }
        if (keys['d'] || keys['arrowright']) {
          dx += Math.cos(camera.rotation.y)
          dz += -Math.sin(camera.rotation.y)
        }

        if (dx !== 0 || dz !== 0) {
          const len = Math.hypot(dx, dz)
          const speed = 0.045
          const stepX = (dx / len) * speed
          const stepZ = (dz / len) * speed

          const targetX = camera.position.x + stepX
          const targetZ = camera.position.z + stepZ

          // AABB sliding collisions
          if (!checkCollides(targetX, targetZ)) {
            camera.position.x = targetX
            camera.position.z = targetZ
          } else if (!checkCollides(targetX, camera.position.z)) {
            camera.position.x = targetX
          } else if (!checkCollides(camera.position.x, targetZ)) {
            camera.position.z = targetZ
          }
        }
        camera.position.y = floorLevelRef.current + 1.6


      } else {
        controls.update()
      }

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
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      mount.removeEventListener('pointerdown', handlePointerDown)
      mount.removeEventListener('pointermove', handlePointerMove)
      mount.removeEventListener('pointerup', handlePointerUp)
      const s = stateRef.current
      content.traverse((o) => o.geometry?.dispose?.())
      floor.geometry.dispose()
      envTex.dispose()
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
    if (modeRef.current !== 'walk') {
      frameScene(s, project)
    }
  }, [project])

  // ---- handle camera placement / control activation on mode switch ----
  useEffect(() => {
    const s = stateRef.current
    if (!s) return
    if (controlsMode === 'walk') {
      s.controls.enabled = false
      const fl = activeFloor(project)
      const bb = fl && fl.walls.length ? bboxOf({ walls: fl.walls }) : { minX: -5, maxX: 5, minY: -5, maxY: 5 }
      const cx = (bb.minX + bb.maxX) / 2
      const cz = (bb.minY + bb.maxY) / 2
      const levelY = floorLevelRef.current
      s.camera.position.set(cx, levelY + 1.6, cz)
      s.camera.rotation.set(0, 0, 0)
      s.camera.rotation.order = 'YXZ'
    } else {
      s.controls.enabled = true
      frameScene(s, project)
      s.controls.update()
    }
  }, [controlsMode, project])

  return (
    <div className="editor3d" ref={mountRef} style={{ position: 'relative' }}>
      <div className="editor3d-modes" style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        gap: '6px',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.85)',
        padding: '4px',
        borderRadius: '6px',
        border: '1px solid var(--line)',
        backdropFilter: 'blur(4px)'
      }}>
        <button
          className={`editor3d-mode-btn ${controlsMode === 'orbit' ? 'active' : ''}`}
          onClick={() => setControlsMode('orbit')}
          style={{
            border: 0,
            background: controlsMode === 'orbit' ? 'var(--accent)' : 'transparent',
            color: controlsMode === 'orbit' ? 'var(--accent-ink)' : 'var(--ink-soft)',
            padding: '6px 12px',
            fontSize: '0.74rem',
            fontWeight: 600,
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🌐 Orbit View
        </button>
        <button
          className={`editor3d-mode-btn ${controlsMode === 'walk' ? 'active' : ''}`}
          onClick={() => setControlsMode('walk')}
          style={{
            border: 0,
            background: controlsMode === 'walk' ? 'var(--accent)' : 'transparent',
            color: controlsMode === 'walk' ? 'var(--accent-ink)' : 'var(--ink-soft)',
            padding: '6px 12px',
            fontSize: '0.74rem',
            fontWeight: 600,
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🚶 Walk Mode
        </button>
      </div>

      {controlsMode === 'walk' && (
        <div className="walk-help" style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.65)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '0.74rem',
          pointerEvents: 'none',
          zIndex: 10,
          textAlign: 'center',
          backdropFilter: 'blur(2px)'
        }}>
          Use <strong>W, A, S, D</strong> or <strong>Arrow Keys</strong> to walk · <strong>Drag mouse</strong> to look around
        </div>
      )}
    </div>
  )
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
  const wallMat = new THREE.MeshStandardMaterial({ color: '#ece4d6', roughness: 0.9 })
  // Light wood floor slabs (two tones so stacked floors read separately);
  // a light clearcoat gives the varnished-parquet glint.
  const slabMats = ['#e6d7bd', '#dccbae'].map((c) => new THREE.MeshPhysicalMaterial({
    map: makeWoodTexture(c), roughness: 0.6, clearcoat: 0.3, clearcoatRoughness: 0.5,
  }))

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
    mesh.castShadow = true
    mesh.receiveShadow = true
    s.content.add(mesh)
  }

  // Stack every visible floor at its elevation; the active floor is edited in 2D.
  visibleFloors.forEach((fl, fi) => {
    const yBase = fl.level || 0
    // floor slab so upper floors aren't floating — sized to the WALLS only,
    // so outdoor items (pool, trees, balconies) don't stretch it
    const bb = fl.walls.length ? bboxOf({ walls: fl.walls }) : bboxOf(fl)
    if (Number.isFinite(bb.minX)) {
      const sw = (bb.maxX - bb.minX) + 1.2, sh = (bb.maxY - bb.minY) + 1.2
      const slabGeo = new THREE.BoxGeometry(sw, 0.12, sh)
      // Tile the plank texture ~one repeat per 1.5 m instead of stretching it.
      const uv = slabGeo.attributes.uv
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (sw / 1.5), uv.getY(i) * (sh / 1.5))
      const slab = new THREE.Mesh(slabGeo, slabMats[fi % 2])
      slab.position.set((bb.minX + bb.maxX) / 2, yBase - 0.06, (bb.minY + bb.maxY) / 2)
      slab.castShadow = true
      slab.receiveShadow = true
      s.content.add(slab)
    }
    for (const w of fl.walls) {
      const L = dist(w.x1, w.y1, w.x2, w.y2)
      if (L < 1e-3) continue
      const { segs, ops } = wallCutSegments(L, openingsOnWall(fl, w.id))
      for (const [a, b] of segs) addWallSeg(w, a, b, 0, wallH, yBase)
      for (const { o, a, b } of ops) {
        if (o.sill > 0.01) addWallSeg(w, a, b, 0, o.sill, yBase)           // wall below window
        const top = o.sill + o.height
        if (top < wallH - 0.01) addWallSeg(w, a, b, top, wallH, yBase)     // lintel
        addOpening3D(s, w, o, a, b, yBase)
      }
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
    const translucent = (opts && opts.opacity < 1) || false
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color), roughness: opts?.rough ?? 0.8, metalness: opts?.metal ?? 0.05,
      transparent: translucent, opacity: opts?.opacity ?? 1,
    })
    const me = new THREE.Mesh(geo, mat)
    me.castShadow = !translucent // glass shouldn't black out the room
    me.receiveShadow = true
    me.position.set(x, y, z); g.add(me)
    return me
  }
  const cy = o.sill + o.height / 2
  if (o.type === 'door') {
    const LEAF = '#7a5a3a'
    const hingeX = o.hinge === 0 ? -wd / 2 : wd / 2
    const dir = o.hinge === 0 ? 1 : -1            // leaf extends from hinge toward the opening
    const sideSign = o.side > 0 ? 1 : -1          // swing to +z or -z (wall sides)

    // A leaf hung open on a jamb, swung toward `sideSign`.
    const swingLeaf = (hx, ldir, len, angle = 1.4) => {
      const hingeG = new THREE.Group()
      hingeG.position.set(hx, cy, 0)
      hingeG.rotation.y = -sideSign * ldir * angle
      const leaf = new THREE.Mesh(
        new THREE.BoxGeometry(len, o.height, 0.05),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(LEAF), roughness: 0.8, metalness: 0.05 }),
      )
      leaf.castShadow = true
      leaf.receiveShadow = true
      leaf.position.set(ldir * len / 2, 0, 0)
      hingeG.add(leaf)
      g.add(hingeG)
    }

    if (o.style === 'sliding') {
      // One wood panel half-open over a fixed glass panel.
      const pw = wd * 0.55
      mesh(new THREE.BoxGeometry(pw, o.height, 0.035), '#9fc6e0', wd / 2 - pw / 2, cy, -0.032, { opacity: 0.45, rough: 0.08 })
      mesh(new THREE.BoxGeometry(0.05, o.height, 0.04), '#8a6a48', wd / 2 - pw, cy, -0.032) // glass stile
      mesh(new THREE.BoxGeometry(pw, o.height, 0.04), LEAF, -wd / 2 + pw * 0.4, cy, 0.036)  // slid-open leaf
      mesh(new THREE.BoxGeometry(wd, 0.05, 0.12), '#9c8b78', 0, o.sill + o.height - 0.025, 0) // track
    } else if (o.style === 'folding') {
      // Bifold accordion: panels zigzag from the hinge jamb, partially folded.
      const n = 4
      const theta = 1.05
      const p = wd / n
      const verts = []
      for (let k = 0; k <= n; k++) {
        verts.push({ x: hingeX + dir * p * Math.cos(theta) * k, z: sideSign * (k % 2) * p * Math.sin(theta) })
      }
      for (let k = 0; k < n; k++) {
        const a2 = verts[k], b2 = verts[k + 1]
        const panel = mesh(new THREE.BoxGeometry(p, o.height, 0.03), k % 2 ? shade(LEAF, 0.85) : LEAF,
          (a2.x + b2.x) / 2, cy, (a2.z + b2.z) / 2)
        panel.rotation.y = -Math.atan2(b2.z - a2.z, b2.x - a2.x)
      }
      mesh(new THREE.BoxGeometry(wd, 0.05, 0.1), '#9c8b78', 0, o.sill + o.height - 0.025, 0) // track
    } else if (o.style === 'double') {
      swingLeaf(-wd / 2, 1, wd / 2, 1.25)
      swingLeaf(wd / 2, -1, wd / 2, 1.25)
    } else {
      swingLeaf(hingeX, dir, wd)
    }
    mesh(new THREE.BoxGeometry(0.04, o.height, w.thickness), '#9c8b78', -wd / 2, cy, 0) // jamb
    mesh(new THREE.BoxGeometry(0.04, o.height, w.thickness), '#9c8b78', wd / 2, cy, 0)  // jamb
  } else {
    mesh(new THREE.BoxGeometry(wd, o.height, 0.04), '#9fc6e0', 0, cy, 0, { opacity: 0.35, rough: 0.08, metal: 0.1 }) // glass
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
  // ~35° elevation reads more like an architectural viz than a top-down peek.
  s.camera.position.set(cx + dist * 0.62, Math.max(dist * 0.5, topY + size * 0.3), cz + dist * 0.85)
  s.controls.target.set(cx, topY / 2, cz)
  s.controls.maxDistance = dist * 3
  s.camera.near = 0.1
  s.camera.far = Math.max(200, dist * 5)
  s.camera.updateProjectionMatrix()

  // Key light + its orthographic shadow camera sized to the scene so shadows
  // stay crisp at any plan size.
  if (s.dir) {
    s.dir.position.set(cx + size * 0.8, topY + size * 1.2 + 6, cz + size * 0.5)
    s.dir.target.position.set(cx, 0, cz)
    const r = size * 0.9 + 3
    const cam = s.dir.shadow.camera
    cam.left = -r; cam.right = r; cam.top = r; cam.bottom = -r
    cam.near = 0.5
    cam.far = size * 4 + 30
    cam.updateProjectionMatrix()
  }
}