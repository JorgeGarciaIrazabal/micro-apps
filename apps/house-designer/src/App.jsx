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
      setProject(proj)
      setSelectedId(null)
      flash(`Opened “${proj.name}”`)
    } catch (err) {
      flash(`Import failed: ${err.message}`)
    }
  }, [flash])

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
    setProject(sampleProject())
    setSelectedId(null)
    setView('2d')
    flash('Loaded sample apartment')
  }, [flash])

  const onResetView = useCallback(() => {
    if (view === '3d') editor3dRef.current?.resetCamera?.()
    else flash('2D: scroll to zoom, drag with Space/middle button to pan')
  }, [view, flash])

  const onDeleteSelected = useCallback(() => {
    if (!selectedId) return
    setProject((p) => {
      const fl = activeFloor(p)
      if (!fl) return p
      const wallGone = fl.walls.some((w) => w.id === selectedId)
      fl.walls = fl.walls.filter((w) => w.id !== selectedId)
      fl.furniture = fl.furniture.filter((f) => f.id !== selectedId)
      fl.openings = (fl.openings || []).filter((o) => o.id !== selectedId && (!wallGone || o.wallId !== selectedId))
      return { ...p }
    })
    setSelectedId(null)
  }, [selectedId])

  // ---- floors ----------------------------------------------------------
  const onAddFloor = useCallback(() => {
    setProject((p) => {
      const level = ((p.floors || []).reduce((m, f) => Math.max(m, f.level || 0), 0)) + 3
      const f = { id: uid('floor'), name: `Floor ${p.floors.length + 1}`, level, walls: [], furniture: [], openings: [] }
      return { ...p, floors: [...p.floors, f], activeFloorId: f.id }
    })
    setSelectedId(null)
    setView('2d')
  }, [])

  const onDeleteFloor = useCallback(() => {
    setProject((p) => {
      if (p.floors.length <= 1) return p
      const idx = p.floors.findIndex((f) => f.id === p.activeFloorId)
      const floors = p.floors.filter((f) => f.id !== p.activeFloorId)
      const activeFloorId = floors[Math.max(0, idx - 1)].id
      return { ...p, floors, activeFloorId }
    })
    setSelectedId(null)
  }, [])

  const onFloorProp = useCallback((patch) => {
    setProject((p) => {
      const fl = activeFloor(p)
      if (!fl) return p
      Object.assign(fl, patch)
      return { ...p }
    })
  }, [])

  const setActiveFloor = useCallback((id) => {
    setProject((p) => ({ ...p, activeFloorId: id }))
    setSelectedId(null)
  }, [])

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
              setProject={setProject}
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
          setProject={setProject}
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