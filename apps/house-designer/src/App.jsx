import { useCallback, useEffect, useRef, useState } from 'react'
import TopBar from './components/TopBar.jsx'
import FurniturePanel from './components/FurniturePanel.jsx'
import PropertiesPanel from './components/PropertiesPanel.jsx'
import Editor2D from './components/Editor2D.jsx'
import Editor3D from './components/Editor3D.jsx'
import FloorBar from './components/FloorBar.jsx'
import ShortcutHelp from './components/ShortcutHelp.jsx'
import { IconRuler } from './components/Icons.jsx'
import { createProject, serialize, deserialize, downloadBlob, pickFile, safeName, activeFloor, uid, ERR_INVALID_JSON, ERR_NOT_PROJECT } from './lib/project.js'
import * as M from './lib/mutations.js'
import { useProjectHistory } from './hooks/useProjectHistory.js'
import { getSample } from './samples/sample.js'
import { useT } from './contexts/LangContext.jsx'

const STORAGE_KEY = 'house-designer:project:v1'
const DEFAULT_CLIENT_ID = '31314617400-6scr8gn50rtpfes4123fcq0n0hb79paf.apps.googleusercontent.com'

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return deserialize(raw)
  } catch { /* ignore corrupt storage */
  }
  return createProject('Untitled Project')
}

export default function App() {
  const { t } = useT()
  const [view, setView] = useState('2d')
  const [tool, setTool] = useState('select')
  const [selectedId, setSelectedId] = useState(null)
  const [toast, setToast] = useState(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [gdAccessToken, setGdAccessToken] = useState(() => {
    const token = localStorage.getItem('house-designer:google-token')
    const expiry = localStorage.getItem('house-designer:google-token-expiry')
    if (token && expiry) {
      if (Date.now() < Number(expiry) - 60000) { // Keep a 1-minute buffer
        return token
      }
    }
    return null
  })
  const [gdUserEmail, setGdUserEmail] = useState(() => {
    return localStorage.getItem('house-designer:google-user-email') || null
  })
  const [gdUserAvatar, setGdUserAvatar] = useState(() => {
    return localStorage.getItem('house-designer:google-user-avatar') || null
  })
  const [gdFiles, setGdFiles] = useState([])
  const [gdLoadingFiles, setGdLoadingFiles] = useState(false)
  const [gdSavingCurrent, setGdSavingCurrent] = useState(false)
  const [rightSidebarTab, setRightSidebarTab] = useState('props')
  const [gdClientId, setGdClientId] = useState(() => {
    return localStorage.getItem('house-designer:google-client-id') || DEFAULT_CLIENT_ID
  })
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
    onUndo: (ok) => flash(ok ? t('toast.undo') : t('toast.nothing_to_undo')),
    onRedo: (ok) => flash(ok ? t('toast.redo') : t('toast.nothing_to_redo')),
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

  // ---- google drive sync -----------------------------------------------
  const fetchFileList = useCallback(async (token) => {
    const activeToken = token || gdAccessToken
    if (!activeToken) return
    setGdLoadingFiles(true)
    try {
      const url = new URL('https://www.googleapis.com/drive/v3/files')
      url.searchParams.append('spaces', 'appDataFolder')
      url.searchParams.append('q', "name contains '.house.json' and trashed = false")
      url.searchParams.append('fields', 'files(id, name, modifiedTime, size)')
      url.searchParams.append('orderBy', 'modifiedTime desc')
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      })
      if (!response.ok) throw new Error('Failed to retrieve file list')
      const data = await response.json()
      setGdFiles(data.files || [])
    } catch (err) {
      console.error('Error fetching file list:', err)
      flash('Error listing files from Google Drive', 'error')
    } finally {
      setGdLoadingFiles(false)
    }
  }, [gdAccessToken, flash])

  const fetchUserInfo = useCallback(async (token) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const info = await response.json()
        setGdUserEmail(info.email || '')
        setGdUserAvatar(info.picture || '')
        localStorage.setItem('house-designer:google-user-email', info.email || '')
        localStorage.setItem('house-designer:google-user-avatar', info.picture || '')
      }
    } catch (err) {
      console.error('Error fetching user info:', err)
    }
  }, [])

  useEffect(() => {
    if (gdAccessToken) {
      fetchFileList(gdAccessToken)
    }
  }, [gdAccessToken, fetchFileList])

  // Auto-switch to Properties tab when an item is selected
  useEffect(() => {
    if (selectedId) {
      setRightSidebarTab('props')
    }
  }, [selectedId])

  const onGdConnect = useCallback((clientIdInput) => {
    const activeClientId = clientIdInput || gdClientId
    if (!activeClientId) return
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'https://www.googleapis.com/auth/drive.appdata email profile',
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('Auth Error:', tokenResponse)
            flash('Failed to authenticate with Google', 'error')
            return
          }
          const expiryTime = Date.now() + (Number(tokenResponse.expires_in) || 3600) * 1000
          localStorage.setItem('house-designer:google-token', tokenResponse.access_token)
          localStorage.setItem('house-designer:google-token-expiry', String(expiryTime))

          setGdAccessToken(tokenResponse.access_token)
          fetchFileList(tokenResponse.access_token)
          fetchUserInfo(tokenResponse.access_token)
          flash('Connected to Google Drive!', 'success')
        },
        error_callback: (err) => {
          console.error('Google OAuth error:', err)
          flash(`Auth Error: ${err.message || err.type || 'unknown'}`, 'error')
        }
      })
      client.requestAccessToken({ prompt: '' })
    } catch (err) {
      console.error(err)
      flash('Google auth initialization failed. Check your Client ID.', 'error')
    }
  }, [gdClientId, fetchFileList, fetchUserInfo, flash])

  const onGdDisconnect = useCallback(() => {
    setGdAccessToken(null)
    setGdUserEmail(null)
    setGdUserAvatar(null)
    setGdFiles([])
    localStorage.removeItem('house-designer:google-token')
    localStorage.removeItem('house-designer:google-token-expiry')
    localStorage.removeItem('house-designer:google-user-email')
    localStorage.removeItem('house-designer:google-user-avatar')
    flash('Disconnected from Google Drive', 'info')
  }, [flash])

  const onGdSave = useCallback(async () => {
    if (!gdAccessToken) return
    setGdSavingCurrent(true)
    try {
      const fileName = `${project.name}.house.json`
      const searchUrl = new URL('https://www.googleapis.com/drive/v3/files')
      searchUrl.searchParams.append('spaces', 'appDataFolder')
      searchUrl.searchParams.append('q', `name = '${fileName}' and trashed = false`)
      searchUrl.searchParams.append('fields', 'files(id)')
      
      const searchRes = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${gdAccessToken}` }
      })
      const searchData = await searchRes.json()
      const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null
      
      const fileContent = serialize(project)
      if (existingFile) {
        const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`
        const updateRes = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${gdAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: fileContent
        })
        if (!updateRes.ok) throw new Error('Update failed')
        flash('Successfully updated plan on Google Drive!', 'success')
      } else {
        const metadata = { name: fileName, parents: ['appDataFolder'] }
        const boundary = 'gdrive_upload_boundary'
        const multipartBody = 
          `\r\n--${boundary}\r\n` +
          `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
          `${JSON.stringify(metadata)}\r\n` +
          `--${boundary}\r\n` +
          `Content-Type: application/json\r\n\r\n` +
          `${fileContent}\r\n` +
          `--${boundary}--`

        const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gdAccessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartBody
        })
        if (!createRes.ok) throw new Error('Creation failed')
        flash('Successfully saved new plan to Google Drive!', 'success')
      }
      fetchFileList()
    } catch (err) {
      console.error(err)
      flash('Failed to save to Google Drive', 'error')
    } finally {
      setGdSavingCurrent(false)
    }
  }, [gdAccessToken, project, fetchFileList, flash])

  const onGdLoad = useCallback(async (fileId, fileName) => {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${gdAccessToken}` }
      })
      if (!response.ok) throw new Error('Download failed')
      const fileText = await response.text()
      const proj = deserialize(fileText)
      if (fileName && /\.json$/i.test(fileName)) {
        proj.name = fileName.replace(/\.(house|pln5d)\.json$/i, '').replace(/\.json$/i, '')
      }
      commit(proj)
      setSelectedId(null)
      flash(`Loaded "${proj.name}" from Google Drive!`, 'success')
    } catch (err) {
      console.error(err)
      flash('Failed to load file from Google Drive', 'error')
    }
  }, [gdAccessToken, commit, flash])

  const onGdDelete = useCallback(async (fileId, fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}" from Google Drive?`)) return
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${gdAccessToken}` }
      })
      if (!response.ok) throw new Error('Delete failed')
      flash('File deleted from Google Drive', 'success')
      setGdFiles((current) => current.filter((f) => f.id !== fileId))
    } catch (err) {
      console.error(err)
      flash('Failed to delete file', 'error')
    }
  }, [gdAccessToken, flash])

  // ---- file import / export --------------------------------------------
  const onImport = useCallback(async () => {
    const file = await pickFile('application/json,.json')
    if (!file) return
    try {
      const proj = deserialize(file.text)
      if (file.name && /\.json$/i.test(file.name)) {
        proj.name = file.name.replace(/\.(house|pln5d)\.json$/i, '').replace(/\.json$/i, '')
      }
      commit(proj)
      setSelectedId(null)
      flash(t('toast.opened', { name: proj.name }), 'success')
    } catch (err) {
      if (err.message === ERR_INVALID_JSON) flash(t('error.invalid_json'), 'error')
      else if (err.message === ERR_NOT_PROJECT) flash(t('error.not_project'), 'error')
      else flash(t('toast.import_failed', { error: err.message }), 'error')
    }
  }, [flash, commit, t])

  const onExportJson = useCallback(() => {
    const name = safeName(project.name, 'house-designer-project')
    downloadBlob(`${name}.house.json`, serialize(project))
    flash(t('toast.saved_json'), 'success')
  }, [project, flash, t])

  const onExportPng = useCallback(async () => {
    if (view === '3d') {
      const data = editor3dRef.current?.exportPNG?.()
      if (!data) return flash(t('toast.3d_not_ready'), 'error')
      downloadBlob(`${safeName(project.name, 'house-designer')}.3d.png`, data, 'image/png')
      flash(t('toast.exported_3d_png'), 'success')
      return
    }
    const svg = stageRef.current?.querySelector('svg')
    if (!svg) return flash(t('toast.2d_not_ready'), 'error')
    const w = Number(svg.getAttribute('width')) || svg.clientWidth || 800
    const h = Number(svg.getAttribute('height')) || svg.clientHeight || 560
    const data = await exportSvgPng(svg, w, h)
    if (!data) return flash(t('toast.png_failed'), 'error')
    downloadBlob(`${safeName(project.name, 'house-designer')}.2d.png`, data, 'image/png')
    flash(t('toast.exported_2d_png'), 'success')
  }, [view, project, flash, t])

  const onLoadSample = useCallback((key = 'studio') => {
    const proj = getSample(key)
    commit(proj)
    setSelectedId(null)
    setView('2d')
    flash(t('toast.loaded_sample', { name: proj.name }))
  }, [flash, commit, t])

  const onResetView = useCallback(() => {
    if (view === '3d') editor3dRef.current?.resetCamera?.()
    else flash(t('toast.hint_pan'))
  }, [view, flash, t])

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
    flash(t('toast.duplicated'))
  }, [selectedId, commit, flash, t])

  // Global shortcuts that aren't tied to the 2D canvas: duplicate + help.
  useEffect(() => {
    const onKey = (e) => {
      const tgt = e.target
      const typing = tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)
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
              onWallDoubleClick={() => setFocusLenToken((tok) => tok + 1)}
            />
          ) : (
            <Editor3D ref={editor3dRef} project={project} />
          )}
          {empty && (
            <div className="empty-state">
              <div className="empty-card">
                <span className="empty-ico"><IconRuler size={40} /></span>
                <h2>{t('empty.heading')}</h2>
                <p>
                  {t('empty.body', { wall: '__WALL__', view3d: '__3D__' })
                    .split(/(__WALL__|__3D__)/)
                    .map((seg, i) =>
                      seg === '__WALL__' ? <b key={i}>{t('panel.wall')}</b>
                      : seg === '__3D__' ? <b key={i}>3D</b>
                      : seg
                    )}
                </p>
                <button onClick={() => onLoadSample('studio')}>{t('empty.load_sample')}</button>
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
          flash={flash}
          // Google Drive Integration Props
          gdAccessToken={gdAccessToken}
          gdUserEmail={gdUserEmail}
          gdUserAvatar={gdUserAvatar}
          gdFiles={gdFiles}
          setGdFiles={setGdFiles}
          gdLoadingFiles={gdLoadingFiles}
          gdSavingCurrent={gdSavingCurrent}
          onGdConnect={onGdConnect}
          onGdDisconnect={onGdDisconnect}
          onGdSave={onGdSave}
          onGdLoad={onGdLoad}
          onGdDelete={onGdDelete}
          gdClientId={gdClientId}
          setGdClientId={setGdClientId}
          rightSidebarTab={rightSidebarTab}
          setRightSidebarTab={setRightSidebarTab}
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
