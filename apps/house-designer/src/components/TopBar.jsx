import { IconRuler } from './Icons.jsx'

// Top bar: project name, 2D/3D toggle, and file actions (import/export).
export default function TopBar({
  project, onRename, view, setView, onImport, onExportJson, onExportPng, onLoadSample, onResetView, onHelp,
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark"><IconRuler size={20} /></span>
        <div className="brand-text">
          <strong>House Designer</strong>
          <span className="brand-sub">floor plan · 3D</span>
        </div>
      </div>

      <input
        className="name-input"
        value={project.name}
        onChange={(e) => onRename(e.target.value)}
        spellCheck={false}
        aria-label="Project name"
      />

      <div className="seg view-toggle">
        <button className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}>2D</button>
        <button className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}>3D</button>
      </div>

      <div className="topbar-actions">
        <button onClick={onLoadSample} title="Load a demo apartment">Sample</button>
        <button onClick={onResetView} title="Reset camera / re-center">Reset view</button>
        <button onClick={onImport} title="Open a .house.json project file">Open…</button>
        <button onClick={onExportJson} title="Save project as JSON">Save JSON</button>
        <button onClick={onExportPng} title="Export current view as PNG">PNG</button>
        <button onClick={onHelp} title="Keyboard shortcuts (?)">?</button>
      </div>
    </header>
  )
}
