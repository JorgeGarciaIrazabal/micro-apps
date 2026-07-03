import { useEffect } from 'react'
import { IconRuler } from './Icons.jsx'
import { useT } from '../contexts/LangContext.jsx'

// Keyboard shortcut reference panel, opened with "?" or the top-bar button.
export default function ShortcutHelp({ onClose }) {
  const { t } = useT()

  const GROUPS = [
    {
      title: t('shortcut.group.drawing'),
      rows: [
        [['Click'], t('shortcut.chain_wall')],
        [['Shift'], t('shortcut.angle_snap')],
        [['Enter'], t('shortcut.finish_chain')],
        [['Esc'], t('shortcut.cancel')],
        [['2× Click'], t('shortcut.edit_length')],
      ],
    },
    {
      title: t('shortcut.group.editing'),
      rows: [
        [['R'], t('shortcut.rotate_furn')],
        [['↑', '↓', '←', '→'], t('shortcut.nudge')],
        [['Shift', '↑↓←→'], t('shortcut.nudge5')],
        [['Shift', 'Resize'], t('shortcut.resize_center')],
        [['Del'], t('shortcut.delete')],
      ],
    },
    {
      title: t('shortcut.group.clipboard'),
      rows: [
        [['Ctrl', 'D'], t('shortcut.duplicate')],
        [['Ctrl', 'Z'], t('shortcut.undo')],
        [['Ctrl', 'Shift', 'Z'], t('shortcut.redo')],
        [['Ctrl', 'Y'], t('shortcut.redo_alt')],
      ],
    },
    {
      title: t('shortcut.group.view'),
      rows: [
        [['Scroll'], t('shortcut.zoom')],
        [['Space', 'Drag'], t('shortcut.pan')],
        [['Middle Drag'], t('shortcut.pan_alt')],
        [['?'], t('shortcut.toggle_panel')],
      ],
    },
  ]

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="shortcut-overlay" onClick={onClose}>
      <div className="shortcut-card" role="dialog" aria-label={t('shortcut.title')} onClick={(e) => e.stopPropagation()}>
        <header className="shortcut-head">
          <span className="shortcut-mark"><IconRuler size={18} /></span>
          <div>
            <h2>{t('shortcut.title')}</h2>
            <p>{t('shortcut.subtitle')}</p>
          </div>
          <button className="shortcut-x" onClick={onClose} aria-label={t('shortcut.close')}>✕</button>
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
          {t('shortcut.footer', { key: '\x00' }).split('\x00').flatMap((part, i, arr) =>
            i < arr.length - 1 ? [part, <kbd key={i}>?</kbd>] : [part]
          )}
        </footer>
      </div>
    </div>
  )
}
