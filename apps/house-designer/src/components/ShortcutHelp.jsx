import { useEffect } from 'react'
import { IconRuler } from './Icons.jsx'

const GROUPS = [
  {
    title: 'Drawing',
    rows: [
      [['Click'], 'Chain wall points (Wall tool)'],
      [['Enter'], 'Finish the wall chain'],
      [['Esc'], 'Cancel chain / deselect'],
      [['2× Click'], 'Edit a wall’s length'],
    ],
  },
  {
    title: 'Editing',
    rows: [
      [['R'], 'Rotate furniture 90°'],
      [['↑', '↓', '←', '→'], 'Nudge selection'],
      [['Shift', '↑↓←→'], 'Nudge ×5'],
      [['Del'], 'Delete selection'],
    ],
  },
  {
    title: 'Clipboard & History',
    rows: [
      [['Ctrl', 'D'], 'Duplicate selection'],
      [['Ctrl', 'Z'], 'Undo'],
      [['Ctrl', 'Shift', 'Z'], 'Redo'],
      [['Ctrl', 'Y'], 'Redo (alternate)'],
    ],
  },
  {
    title: 'View',
    rows: [
      [['Scroll'], 'Zoom at cursor'],
      [['Space', 'Drag'], 'Pan the plan'],
      [['Middle Drag'], 'Pan (also right button)'],
      [['?'], 'Toggle this panel'],
    ],
  },
]

// Keyboard shortcut reference panel, opened with "?" or the top-bar button.
export default function ShortcutHelp({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="shortcut-overlay" onClick={onClose}>
      <div className="shortcut-card" role="dialog" aria-label="Keyboard shortcuts" onClick={(e) => e.stopPropagation()}>
        <header className="shortcut-head">
          <span className="shortcut-mark"><IconRuler size={18} /></span>
          <div>
            <h2>Keyboard shortcuts</h2>
            <p>Work faster in the 2D editor</p>
          </div>
          <button className="shortcut-x" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="shortcut-groups">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h3>{g.title}</h3>
              {g.rows.map(([keys, desc]) => (
                <div className="shortcut-row" key={desc}>
                  <span>{desc}</span>
                  <span className="shortcut-keys">
                    {keys.map((k, i) => (
                      <span key={k}>{i > 0 && <span className="kbd-plus">+</span>}<kbd>{k}</kbd></span>
                    ))}
                  </span>
                </div>
              ))}
            </section>
          ))}
        </div>
        <footer className="shortcut-foot">
          Press <kbd>?</kbd> anytime to open this panel
        </footer>
      </div>
    </div>
  )
}
