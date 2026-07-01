import { useCallback, useEffect, useRef, useState } from 'react'
import TopBar from './components/TopBar.jsx'
import FurniturePanel from './components/FurniturePanel.jsx'
import PropertiesPanel from './components/PropertiesPanel.jsx'
import Editor2D from './components/Editor2D.jsx'
import Editor3D from './components/Editor3D.jsx'
import FloorBar from './components/FloorBar.jsx'
import { createProject, serialize, deserialize, downloadBlob, pickFile, safeName, activeFloor, uid } from './lib/project.js'
import { sampleProject } from './lib/sample.js'

const STORAGE_KEY = 'house-designer:project:v1'

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return deserialize(raw)
  } catch { /* ignore corrupt storage */
  }
  return createProject('Untitled Project')
}

export default function App() {
  const [project, setProject] = useState(loadSaved)
  const [view, setView] = useState('2d')
  const [tool, setTool] = useState('select')
  const [selectedId, setSelectedId] = useState(null)
  const [toast, setToast] = useState(null)
  const [focusLenToken, setFocusLenToken] = useState(0)
  const stageRef = useRef(null)
  const editor3dRef = useRef(null)

  // ---- undo history -----------------------------------------------------
  // Every project mutation pushes the PREVIOUS snapshot onto the history
  // stack. Ctrl+Z pops the most recent and restores it. Rapid consecutive
  // mutations (e.g. drag-move) collapse into a single undo step via a time
  // debounce so dragging a piece doesn't flood the stack.
  const historyRef = useRef([])
  const lastPushRef = useRef(0)
  const MAX_HISTORY = 80
  const PUSH_DEBOUNCE_MS = 350

  const pushHistory = useCallback((prev) => {
    const now = Date.now()
    if (now - lastPushRef.current < PUSH_DEBOUNCE_MS) {
      // Skip: a snapshot was pushed very recently (same drag/interaction).
      return
    }
    lastPushRef.current = now
    const h = historyRef.current
    h.push(serialize(prev))
    if (h.length > MAX_HISTORY) h.shift()
  }, [])

  // Wrapper used for ALL project mutations that should be undoable.
  const setProjectHist = useCallback((updater) => {
    setProject((prev) => {
      pushHistory(prev)
      return typeof updater === 'function' ? updater(prev) : updater
    })
  }, [pushHistory])

  const undo = useCallback(() => {
    const h = historyRef.current
    if (!h.length) { return false }
    const snap = h.pop()
    try { setProject(deserialize(snap)) } catch { /* corrupted snapshot */ }
    setSelectedId(null)
    return true
  }, [])

  // Global Ctrl+Z / Cmd+Z to undo.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (undo()) flash('Undo')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, flash])

  // Persist to localStorage (debounced via rAF).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try { localStorage.setItem(STORAGE_KEY, serialize(project)) } catch { /* quota */ }
    })
    return () => cancelAnimationFrame(id)
  }, [project])

  const flash = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }, [])

  // ---- file import / export --------------------------------------------
  const onImport = useCallback(async () => {
    const file = await pickFile('application/json,.json')
    if (!file) return
    try {
      const proj = deserialize(file.text)
      // Keep the file's name as the project name when sensible.
      if (file.name && /\.json$/i.test(file.name)) {
        proj.name = file.name.replace(/\.json$/i, '').replace(/\.pln5d$/i, '')
      }
      setProjectHist(proj)
      setSelectedId(null)
      flash(`Opened “${proj.name}”`)
    } catch (err) {
      flash(`Import failed: ${err.message}`)
    }
  }, [flash, setProjectHist])

  const onExportJson = useCallback(() => {
    const name = safeName(project.name, 'house-designer-project')
    downloadBlob(`${name}.pln5d.json`, serialize(project))
    flash('Saved project JSON')
  }, [project, flash])

  const onExportPng = useCallback(async () => {
    if (view === '3d') {
      const data = editor3dRef.current?.exportPNG?.()
      if (!data) return flash('3D render not ready')
      downloadBlob(`${safeName(project.name, 'house-designer')}.3d.png`, data, 'image/png')
      flash('Exported 3D PNG')
      return
    }
    const svg = stageRef.current?.querySelector('svg')
    if (!svg) return flash('2D view not ready')
    const w = Number(svg.getAttribute('width')) || svg.clientWidth || 800
    const h = Number(svg.getAttribute('height')) || svg.clientHeight || 560
    const data = await exportSvgPng(svg, w, h)
    if (!data) return flash('PNG export failed')
    downloadBlob(`${safeName(project.name, 'house-designer')}.2d.png`, data, 'image/png')
    flash('Exported 2D PNG')
  }, [view, project, flash])

  const onLoadSample = useCallback(() => {
    setProjectHist(sampleProject())
    setSelectedId(null)
    setView('2d')
    flash('Loaded sample apartment')
  }, [flash, setProjectHist])

  const onResetView = useCallback(() => {
    if (view === '3d') editor3dRef.current?.resetCamera?.()
    else flash('2D: scroll to zoom, drag with Space/middle button to pan')
  }, [view, flash])

  const onDeleteSelected = useCallback(() => {
    if (!selectedId) return
    setProjectHist((p) => {
      const fl = activeFloor(p)
      if (!fl) return p
      const wallGone = fl.walls.some((w) => w.id === selectedId)
      fl.walls = fl.walls.filter((w) => w.id !== selectedId)
      fl.furniture = fl.furniture.filter((f) => f.id !== selectedId)
      fl.openings = (fl.openings || []).filter((o) => o.id !== selectedId && (!wallGone || o.wallId !== selectedId))
      return { ...p }
    })
    setSelectedId(null)
  }, [selectedId, setProjectHist])

  // ---- floors ----------------------------------------------------------
  const onAddFloor = useCallback(() => {
    setProjectHist((p) => {
      const level = ((p.floors || []).reduce((m, f) => Math.max(m, f.level || 0), 0)) + 3
      const f = { id: uid('floor'), name: `Floor ${p.floors.length + 1}`, level, walls: [], furniture: [], openings: [] }
      return { ...p, floors: [...p.floors, f], activeFloorId: f.id }
    })
    setSelectedId(null)
    setView('2d')
  }, [setProjectHist])

  const onDeleteFloor = useCallback(() => {
    setProjectHist((p) => {
      if (p.floors.length <= 1) return p
      const idx = p.floors.findIndex((f) => f.id === p.activeFloorId)
      const floors = p.floors.filter((f) => f.id !== p.activeFloorId)
      const activeFloorId = floors[Math.max(0, idx - 1)].id
      return { ...p, floors, activeFloorId }
    })
    setSelectedId(null)
  }, [setProjectHist])

  const onFloorProp = useCallback((patch) => {
    setProjectHist((p) => {
      const fl = activeFloor(p)
      if (!fl) return p
      Object.assign(fl, patch)
      return { ...p }
    })
  }, [setProjectHist])

  const setActiveFloor = useCallback((id) => {
    setProjectHist((p) => ({ ...p, activeFloorId: id }))
    setSelectedId(null)
  }, [setProjectHist])

  // Empty-state shows only when the WHOLE project has no content, so switching
  // to an empty floor (or adding one) doesn't hide content that exists elsewhere.
  const empty = (project.floors || []).every(
    (f) => (f.walls || []).length === 0 && (f.furniture || []).length === 0 && (f.openings || []).length === 0
  )

  return (
    <div className="app">
      <TopBar
        project={project}
        setProject={setProject}
        view={view}
        setView={setView}
        onImport={onImport}
        onExportJson={onExportJson}
        onExportPng={onExportPng}
        onLoadSample={onLoadSample}
        onResetView={onResetView}
      />
      <FloorBar project={project} onSelect={setActiveFloor} onAdd={onAddFloor} />
      <div className="workspace">
        <FurniturePanel tool={tool} onTool={setTool} />
        <main className="stage" ref={stageRef}>
          {view === '2d' ? (
            <Editor2D
              project={project}
              setProject={setProjectHist}
              tool={tool}
              setTool={setTool}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              onWallDoubleClick={() => setFocusLenToken((t) => t + 1)}
            />
          ) : (
            <Editor3D ref={editor3dRef} project={project} />
          )}
          {empty && (
            <div className="empty-state">
              <div className="empty-card">
                <span className="empty-ico">📐</span>
                <h2>Start your floor plan</h2>
                <p>Choose <b>Wall</b> to draw walls, or pick furniture from the left. Switch to <b>3D</b> anytime to preview.</p>
                <button onClick={onLoadSample}>Load sample apartment</button>
              </div>
            </div>
          )}
        </main>
        <PropertiesPanel
          project={project}
          selectedId={selectedId}
          setProject={setProjectHist}
          onDelete={onDeleteSelected}
          focusLenToken={focusLenToken}
          onAddFloor={onAddFloor}
          onDeleteFloor={onDeleteFloor}
          onFloorProp={onFloorProp}
        />
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

// Serialize an SVG element to a PNG data URL via a canvas. The SVG must already
// render with explicit width/height (the 2D editor sets these).
function exportSvgPng(svg, w, h) {
  return new Promise((resolve) => {
    const clone = svg.cloneNode(true)
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', w)
    clone.setAttribute('height', h)
    clone.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    const src = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = w * scale
      canvas.height = h * scale
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}