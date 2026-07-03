import { IconRuler } from './Icons.jsx'
import { useT } from '../contexts/LangContext.jsx'
import { SUPPORTED_LANGS } from '../lib/i18n.js'
import { SAMPLES } from '../lib/sample.js'

// Top bar: project name, 2D/3D toggle, file actions, and language switch.
export default function TopBar({
  project, onRename, view, setView, onImport, onExportJson, onExportPng, onLoadSample, onResetView, onHelp,
}) {
  const { t, lang, setLang } = useT()
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark"><IconRuler size={20} /></span>
        <div className="brand-text">
          <strong>{t('brand.name')}</strong>
          <span className="brand-sub">{t('brand.sub')}</span>
        </div>
      </div>

      <input
        className="name-input"
        value={project.name}
        onChange={(e) => onRename(e.target.value)}
        spellCheck={false}
        aria-label={t('topbar.project_name')}
      />

      <div className="seg view-toggle">
        <button className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}>2D</button>
        <button className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}>3D</button>
      </div>

      <div className="topbar-actions">
        <select
          className="sample-select"
          value=""
          title={t('topbar.examples_title')}
          onChange={(e) => { if (e.target.value) { onLoadSample(e.target.value); e.target.value = '' } }}
        >
          <option value="">{t('topbar.examples')}</option>
          {SAMPLES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <button onClick={onResetView} title={t('topbar.reset_view_title')}>{t('topbar.reset_view')}</button>
        <button onClick={onImport} title={t('topbar.open_title')}>{t('topbar.open')}</button>
        <button onClick={onExportJson} title={t('topbar.save_json_title')}>{t('topbar.save_json')}</button>
        <button onClick={onExportPng} title={t('topbar.png_title')}>{t('topbar.png')}</button>
        <button onClick={onHelp} title={t('topbar.help_title')}>?</button>
      </div>

      <div className="seg lang-toggle">
        {SUPPORTED_LANGS.map((l) => (
          <button key={l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  )
}
