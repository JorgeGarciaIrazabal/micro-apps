import { useEffect } from 'react'

const GROUPS = [
  {
    title: 'Drawing',
    rows: [
      [['Click'], 'Chain wall points (Wall tool)'],
      [['Enter'], 'Finish the wall chain'],
      [['Esc'], 'Cancel chain / deselect / back to Select'],
      [['Double-click'], 'Edit a wall’s length'],
    ],
  },
  {
    title: 'Editing',
    rows: [
      [['R'], 'Rotate selected furniture 90°'],
      [['←↑→↓'], 'Nudge selection (Shift = ×5)'],
      [['Del'], 'Delete selection'],
      [['Ctrl', 'D'], 'Duplicate selection'],
      [['Ctrl', 'Z'], 'Undo'],
      [['Ctrl', 'Shift', 'Z'], 'Redo (or Ctrl+Y)'],
    ],
  },
  {
    title: 'View',
    rows: [
      [['Scroll'], 'Zoom at cursor'],
      [['Space', 'Drag'], 'Pan (also middle/right button)'],
      [['?'], 'Toggle this help'],
    ],
  },
]

// Modal listing every keyboard shortcut. Opened with "?" or the top-bar button.
export default function ShortcutHelp({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="shortcut-overlay" onClick={onClose}>
      <div className="shortcut-card" onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard shortcuts</h2>
        <div className="shortcut-groups">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h3>{g.title}</h3>
              {g.rows.map(([keys, desc]) => (
                <div className="shortcut-row" key={desc}>
                  <span className="shortcut-keys">
                    {keys.map((k, i) => (
                      <span key={k}>{i > 0 && <span className="kbd-plus">+</span>}<kbd>{k}</kbd></span>
                    ))}
                  </span>
                  <span>{desc}</span>
                </div>
              ))}
            </section>
          ))}
        </div>
        <button className="shortcut-close" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
