import { useCallback, useEffect, useRef, useState } from 'react'
import TopBar from './components/TopBar.jsx'
import FurniturePanel from './components/FurniturePanel.jsx'
import PropertiesPanel from './components/PropertiesPanel.jsx'
import Editor2D from './components/Editor2D.jsx'
import Editor3D from './components/Editor3D.jsx'
import FloorBar from './components/FloorBar.jsx'
import ShortcutHelp from './components/ShortcutHelp.jsx'
import { createProject, serialize, deserialize, downloadBlob, pickFile, safeName, activeFloor, uid } from './lib/project.js'
import * as M from './lib/mutations.js'
import { useProjectHistory } from './hooks/useProjectHistory.js'
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
  const [view, setView] = useState('2d')
  const [tool, setTool] = useState('select')
  const [selectedId, setSelectedId] = useState(null)
  const [toast, setToast] = useState(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [focusLenToken, setFocusLenToken] = useState(0)
  const stageRef = useRef(null)
  const editor3dRef = useRef(null)

  const toastTimer = useRef(null)
  const flash = useCallback((msg, type = 'info') => {
    clearTimeout(toastTimer.current)
    setToast({ msg, type, key: Date.now() })
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const { project, commit } = useProjectHistory(loadSaved, {
    onUndo: (ok) => flash(ok ? 'Undo' : 'Nothing to undo'),
    onRedo: (ok) => flash(ok ? 'Redo' : 'Nothing to redo'),
  })

  // Drop the selection when the selected element no longer exists (deleted,
  // undone, floor switched…).
  useEffect(() => {
    if (!selectedId) return
    const fl = activeFloor(project)
    const exists = fl && (
      fl.walls.some((w) => w.id === selectedId) ||
      fl.furniture.some((f) => f.id === selectedId) ||
      (fl.openings || []).some((o) => o.id === selectedId)
    )
    if (!exists) setSelectedId(null)
  }, [project, selectedId])

  // Persist to localStorage (debounced via rAF).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try { localStorage.setItem(STORAGE_KEY, serialize(project)) } catch { /* quota */ }
    })
    return () => cancelAnimationFrame(id)
  }, [project])

  // ---- file import / export --------------------------------------------
  const onImport = useCallback(async () => {
    const file = await pickFile('application/json,.json')
    if (!file) return
    try {
      const proj = deserialize(file.text)
      // Keep the file's name as the project name when sensible.
      if (file.name && /\.json$/i.test(file.name)) {
        proj.name = file.name.replace(/\.(house|pln5d)\.json$/i, '').replace(/\.json$/i, '')
      }
      commit(proj)
      setSelectedId(null)
      flash(`Opened “${proj.name}”`, 'success')
    } catch (err) {
      flash(`Import failed: ${err.message}`, 'error')
    }
  }, [flash, commit])

  const onExportJson = useCallback(() => {
    const name = safeName(project.name, 'house-designer-project')
    downloadBlob(`${name}.house.json`, serialize(project))
    flash('Saved project JSON', 'success')
  }, [project, flash])

  const onExportPng = useCallback(async () => {
    if (view === '3d') {
      const data = editor3dRef.current?.exportPNG?.()
      if (!data) return flash('3D render not ready', 'error')
      downloadBlob(`${safeName(project.name, 'house-designer')}.3d.png`, data, 'image/png')
      flash('Exported 3D PNG', 'success')
      return
    }
    const svg = stageRef.current?.querySelector('svg')
    if (!svg) return flash('2D view not ready', 'error')
    const w = Number(svg.getAttribute('width')) || svg.clientWidth || 800
    const h = Number(svg.getAttribute('height')) || svg.clientHeight || 560
    const data = await exportSvgPng(svg, w, h)
    if (!data) return flash('PNG export failed', 'error')
    downloadBlob(`${safeName(project.name, 'house-designer')}.2d.png`, data, 'image/png')
    flash('Exported 2D PNG', 'success')
  }, [view, project, flash])

  const onLoadSample = useCallback(() => {
    commit(sampleProject())
    setSelectedId(null)
    setView('2d')
    flash('Loaded sample apartment')
  }, [flash, commit])

  const onResetView = useCallback(() => {
    if (view === '3d') editor3dRef.current?.resetCamera?.()
    else flash('2D: scroll to zoom, drag with Space/middle button to pan')
  }, [view, flash])

  const onDeleteSelected = useCallback(() => {
    if (!selectedId) return
    commit((p) => M.deleteElement(p, selectedId))
    setSelectedId(null)
  }, [selectedId, commit])

  const onDuplicateSelected = useCallback(() => {
    if (!selectedId) return
    const newId = uid('dup')
    commit((p) => M.duplicateElement(p, selectedId, newId))
    setSelectedId(newId)
    flash('Duplicated')
  }, [selectedId, commit, flash])

  // Global shortcuts that aren't tied to the 2D canvas: duplicate + help.
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && !typing) {
        e.preventDefault()
        onDuplicateSelected()
      } else if (e.key === '?' && !typing) {
        e.preventDefault()
        setHelpOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDuplicateSelected])

  // ---- floors ----------------------------------------------------------
  const onAddFloor = useCallback(() => {
    commit(M.addFloor)
    setSelectedId(null)
    setView('2d')
  }, [commit])

  const onDeleteFloor = useCallback(() => {
    commit(M.deleteFloor)
    setSelectedId(null)
  }, [commit])

  const onFloorProp = useCallback((patch) => {
    commit((p) => M.patchActiveFloor(p, patch))
  }, [commit])

  const setActiveFloor = useCallback((id) => {
    commit((p) => M.setActiveFloorId(p, id), { undoable: false })
    setSelectedId(null)
  }, [commit])

  // Empty-state shows only when the WHOLE project has no content, so switching
  // to an empty floor (or adding one) doesn't hide content that exists elsewhere.
  const empty = (project.floors || []).every(
    (f) => (f.walls || []).length === 0 && (f.furniture || []).length === 0 && (f.openings || []).length === 0
  )

  return (
    <div className="app">
      <TopBar
        project={project}
        onRename={(name) => commit((p) => M.renameProject(p, name))}
        view={view}
        setView={setView}
        onImport={onImport}
        onExportJson={onExportJson}
        onExportPng={onExportPng}
        onLoadSample={onLoadSample}
        onResetView={onResetView}
        onHelp={() => setHelpOpen(true)}
      />
      <FloorBar project={project} onSelect={setActiveFloor} onAdd={onAddFloor} />
      <div className="workspace">
        <FurniturePanel tool={tool} onTool={setTool} />
        <main className="stage" ref={stageRef}>
          {view === '2d' ? (
            <Editor2D
              project={project}
              commit={commit}
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
          commit={commit}
          onDelete={onDeleteSelected}
          onDuplicate={onDuplicateSelected}
          focusLenToken={focusLenToken}
          onAddFloor={onAddFloor}
          onDeleteFloor={onDeleteFloor}
          onFloorProp={onFloorProp}
        />
      </div>
      {helpOpen && <ShortcutHelp onClose={() => setHelpOpen(false)} />}
      {toast && <div key={toast.key} className={`toast ${toast.type}`}>{toast.msg}</div>}
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
