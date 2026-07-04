import { useEffect, useState, useCallback, useRef } from 'react'
import { IconRuler } from './Icons.jsx'
import { useT } from '../contexts/LangContext.jsx'
import { deserialize, serialize } from '../lib/project.js'

// Replace this with your official Google OAuth Client ID for production deployments
const DEFAULT_CLIENT_ID = '31314617400-6scr8gn50rtpfes4123fcq0n0hb79paf.apps.googleusercontent.com'

export default function GoogleDriveModal({
  onClose,
  project,
  commit,
  flash,
  accessToken,
  setAccessToken,
  userEmail,
  setUserEmail,
  userAvatar,
  setUserAvatar
}) {
  const { t } = useT()
  
  // Load Client ID from localStorage (or fallback to the hardcoded default)
  const [clientId, setClientId] = useState(() => {
    const saved = localStorage.getItem('house-designer:google-client-id')
    if (saved) return saved
    return DEFAULT_CLIENT_ID !== '31314617400-6scr8gn50rtpfes4123fcq0n0hb79paf.apps.googleusercontent.com' ? DEFAULT_CLIENT_ID : ''
  })
  const [editingClientId, setEditingClientId] = useState(!clientId)
  const [files, setFiles] = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [savingCurrent, setSavingCurrent] = useState(false)

  // Fetch file list from Google Drive appDataFolder
  const fetchFileList = useCallback(async (token) => {
    const activeToken = token || accessToken
    if (!activeToken) return
    
    setLoadingFiles(true)
    try {
      const url = new URL('https://www.googleapis.com/drive/v3/files')
      url.searchParams.append('spaces', 'appDataFolder')
      url.searchParams.append('q', "name contains '.house.json' and trashed = false")
      url.searchParams.append('fields', 'files(id, name, modifiedTime, size)')
      url.searchParams.append('orderBy', 'modifiedTime desc')

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to retrieve file list')
      }

      const data = await response.json()
      setFiles(data.files || [])
    } catch (err) {
      console.error('Error fetching file list:', err)
      flash(t('gdrive.flash.list_failed'), 'error')
    } finally {
      setLoadingFiles(false)
    }
  }, [accessToken, flash, t])

  // Fetch User Info
  const fetchUserInfo = useCallback(async (token) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const info = await response.json()
        setUserEmail(info.email || '')
        setUserAvatar(info.picture || '')
      }
    } catch (err) {
      console.error('Error fetching user info:', err)
    }
  }, [setUserEmail, setUserAvatar])

  // Check if we already have an active session on mount
  useEffect(() => {
    if (accessToken) {
      fetchFileList(accessToken)
    }
  }, [accessToken, fetchFileList])

  // Key press close (Escape)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Save/Update current project to Drive
  const handleSaveToDrive = async () => {
    if (!accessToken) return
    setSavingCurrent(true)
    
    try {
      const fileName = `${project.name}.house.json`
      
      // Step 1: Check if file with same name already exists in appDataFolder
      const searchUrl = new URL('https://www.googleapis.com/drive/v3/files')
      searchUrl.searchParams.append('spaces', 'appDataFolder')
      searchUrl.searchParams.append('q', `name = '${fileName}' and trashed = false`)
      searchUrl.searchParams.append('fields', 'files(id)')
      
      const searchRes = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const searchData = await searchRes.json()
      const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null
      
      const fileContent = serialize(project)

      if (existingFile) {
        // Step 2a: Update existing file (PATCH)
        const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`
        const updateRes = await fetch(updateUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: fileContent
        })
        if (!updateRes.ok) throw new Error('Update failed')
        flash(t('gdrive.flash.updated_plan'), 'success')
      } else {
        // Step 2b: Create new file (multipart POST)
        const metadata = {
          name: fileName,
          parents: ['appDataFolder']
        }
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
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartBody
        })
        if (!createRes.ok) throw new Error('Creation failed')
        flash(t('gdrive.flash.saved_plan'), 'success')
      }
      
      // Refresh the file list
      await fetchFileList()
    } catch (err) {
      console.error(err)
      flash(t('gdrive.flash.save_failed'), 'error')
    } finally {
      setSavingCurrent(false)
    }
  }

  // Load file from Drive
  const handleLoadFromDrive = async (fileId, fileName) => {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      if (!response.ok) throw new Error('Download failed')
      
      const fileText = await response.text()
      const proj = deserialize(fileText)
      
      // Keep name matching filename if name matches pattern
      if (fileName && /\.json$/i.test(fileName)) {
        proj.name = fileName.replace(/\.(house|pln5d)\.json$/i, '').replace(/\.json$/i, '')
      }

      commit(proj)
      flash(t('gdrive.flash.loaded_plan', { name: proj.name }), 'success')
      onClose()
    } catch (err) {
      console.error(err)
      flash(t('gdrive.flash.load_failed'), 'error')
    }
  }

  // Delete file from Drive
  const handleDeleteFromDrive = async (fileId, fileName) => {
    if (!confirm(t('gdrive.confirm.delete_file_app_storage', { name: fileName }))) return
    
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      if (!response.ok) throw new Error('Delete failed')
      
      flash(t('gdrive.flash.deleted_file'), 'success')
      setFiles((current) => current.filter((f) => f.id !== fileId))
    } catch (err) {
      console.error(err)
      flash(t('gdrive.flash.delete_failed'), 'error')
    }
  }

  // Handle Client ID Save
  const handleSaveClientId = (e) => {
    e.preventDefault()
    const cleanId = clientId.trim()
    if (!cleanId) {
      flash(t('gdrive.flash.invalid_client_id'), 'error')
      return
    }
    localStorage.setItem('house-designer:google-client-id', cleanId)
    setEditingClientId(false)
    flash(t('gdrive.flash.client_id_saved'), 'success')
  }

  const tokenClientRef = useRef(null)

  // Initialize Google Token Client once on load or when Client ID changes
  useEffect(() => {
    if (!clientId) return
    try {
      console.log('Initializing Google OAuth token client for:', clientId)
      tokenClientRef.current = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.appdata email profile',
        callback: (tokenResponse) => {
          console.log('Google OAuth callback triggered:', tokenResponse)
          if (tokenResponse.error) {
            console.error('Auth Error:', tokenResponse)
            flash(t('gdrive.flash.auth_failed'), 'error')
            return
          }
          setAccessToken(tokenResponse.access_token)
          fetchFileList(tokenResponse.access_token)
          fetchUserInfo(tokenResponse.access_token)
          flash(t('gdrive.flash.connected'), 'success')
        },
        error_callback: (err) => {
          console.error('Google OAuth error callback triggered:', err)
          flash(t('gdrive.flash.auth_error', { error: err.message || err.type || 'unknown' }), 'error')
        }
      })
      console.log('Google OAuth token client initialized successfully.')
    } catch (err) {
      console.error('Error initializing Google OAuth token client:', err)
    }
  }, [clientId, setAccessToken, fetchFileList, fetchUserInfo, flash, t])

  // Trigger Google Login
  const handleConnect = () => {
    if (!tokenClientRef.current) {
      flash(t('gdrive.flash.init_failed'), 'error')
      return
    }
    console.log('Requesting Google Access Token...')
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' })
  }

  const handleDisconnect = () => {
    setAccessToken(null)
    setUserEmail(null)
    setUserAvatar(null)
    setFiles([])
    flash(t('gdrive.flash.disconnected'), 'info')
  }

  const handleClearClientId = () => {
    if (confirm(t('gdrive.confirm.reset'))) {
      localStorage.removeItem('house-designer:google-client-id')
      setClientId('')
      setEditingClientId(true)
      handleDisconnect()
    }
  }

  return (
    <div className="shortcut-overlay" onClick={onClose}>
      <div className="shortcut-card gdrive-modal" role="dialog" aria-label={t('gdrive.modal_header')} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <header className="shortcut-head">
          <span className="shortcut-mark" style={{ background: '#e8f0fe', color: '#1a73e8' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
            </svg>
          </span>
          <div>
            <h2>{t('gdrive.modal_header')}</h2>
            <p>{t('gdrive.modal_desc')}</p>
          </div>
          <button className="shortcut-x" onClick={onClose} aria-label={t('shortcut.close')}>✕</button>
        </header>

        <div style={{ padding: '20px' }}>
          {editingClientId ? (
            /* SECTION 1: Client ID Setup */
            <form onSubmit={handleSaveClientId} className="gdrive-setup-form">
              <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--ink)' }}>{t('gdrive.setup_api_access')}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', lineHeight: '1.4', marginBottom: '14px' }}>
                {t('gdrive.setup_api_desc')}
              </p>
              
              <div style={{ background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.76rem', color: 'var(--ink-soft)', marginBottom: '14px', lineHeight: '1.4' }}>
                <strong>{t('gdrive.quick_steps')}</strong>
                <ol style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  <li>{t('gdrive.step_1')}</li>
                  <li>{t('gdrive.step_2')}</li>
                  <li>{t('gdrive.step_3')}</li>
                  <li>{t('gdrive.step_4', { origin: window.location.origin })}</li>
                  <li>{t('gdrive.step_5')}</li>
                </ol>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                  {t('gdrive.oauth_client_id')}
                </label>
                <input
                  type="text"
                  placeholder={t('gdrive.client_id_placeholder')}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--line-strong)',
                    fontSize: '0.82rem',
                    background: 'var(--surface)'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {localStorage.getItem('house-designer:google-client-id') && (
                  <button type="button" className="gdrive-btn secondary" onClick={() => setEditingClientId(false)}>
                    {t('gdrive.cancel')}
                  </button>
                )}
                <button type="submit" className="gdrive-btn primary">
                  {t('gdrive.save_client_id')}
                </button>
              </div>
            </form>
          ) : (
            /* SECTION 2: Auth and Sync Operations */
            <div>
              {/* Connection Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--line)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {userAvatar ? (
                    <img src={userAvatar} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--line-strong)' }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContents: 'center', color: '#1a73e8', fontWeight: 'bold', fontSize: '1rem', justifyContent: 'center' }}>
                      {accessToken ? '✓' : '?'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {accessToken ? t('gdrive.connected') : t('gdrive.disconnected')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-faint)' }}>
                      {accessToken ? userEmail : t('gdrive.secure_decentralized_storage')}
                    </div>
                  </div>
                </div>

                <div>
                  {accessToken ? (
                    <button className="gdrive-btn secondary danger" onClick={handleDisconnect}>
                      {t('gdrive.disconnect')}
                    </button>
                  ) : (
                    <button className="gdrive-btn primary" onClick={handleConnect}>
                      {t('gdrive.connect_google_account')}
                    </button>
                  )}
                </div>
              </div>

              {accessToken && (
                <>
                  {/* Current Project Action */}
                  <div style={{ background: '#f8f9fa', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ minWidth: 0, paddingRight: '12px' }}>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-faint)', fontWeight: 700 }}>{t('gdrive.current_project')}</span>
                        <h4 style={{ margin: '2px 0 0 0', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {project.name}
                        </h4>
                      </div>
                      <button className="gdrive-btn primary" onClick={handleSaveToDrive} disabled={savingCurrent} style={{ flexShrink: 0 }}>
                        {savingCurrent ? t('gdrive.saving') : t('gdrive.save_to_drive')}
                      </button>
                    </div>
                  </div>

                  {/* Drive Files List */}
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {t('gdrive.saved_plans')}
                    </h3>
                    
                    {loadingFiles ? (
                      <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                        {t('gdrive.loading_files')}
                      </div>
                    ) : files.length === 0 ? (
                      <div style={{ padding: '24px 0', textAlign: 'center', fontSize: '0.82rem', color: 'var(--ink-faint)', border: '1px dashed var(--line)', borderRadius: '8px' }}>
                        {t('gdrive.no_plans_found')}
                      </div>
                    ) : (
                      <div className="gdrive-file-list" style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: '8px' }}>
                        {files.map((file) => (
                          <div key={file.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>
                            <div style={{ minWidth: 0, paddingRight: '8px' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.name}>
                                {file.name.replace(/\.house\.json$/i, '')}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--ink-faint)', marginTop: '2px' }}>
                                {t('gdrive.modified', { time: new Date(file.modifiedTime).toLocaleString() })}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <button className="gdrive-btn-sm" onClick={() => handleLoadFromDrive(file.id, file.name)}>
                                {t('gdrive.load')}
                              </button>
                              <button className="gdrive-btn-sm danger" onClick={() => handleDeleteFromDrive(file.id, file.name)}>
                                {t('gdrive.delete')}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Settings / Client ID Actions */}
              <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px dashed var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)' }}>
                  {t('gdrive.client_id_configured')}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="gdrive-btn secondary sm" onClick={() => setEditingClientId(true)}>
                    {t('gdrive.change_id')}
                  </button>
                  <button className="gdrive-btn secondary sm danger" onClick={handleClearClientId}>
                    {t('gdrive.reset_settings')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .gdrive-modal {
          background: var(--surface) !important;
        }
        .gdrive-btn {
          border: 1px solid var(--line);
          background: var(--surface);
          padding: 7px 14px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 0.82rem;
          color: var(--ink);
          font-weight: 600;
          transition: all 0.1s ease;
        }
        .gdrive-btn:hover:not(:disabled) {
          border-color: var(--line-strong);
          background: var(--surface-2);
        }
        .gdrive-btn.primary {
          background: #1a73e8;
          color: #ffffff;
          border-color: #1a73e8;
        }
        .gdrive-btn.primary:hover:not(:disabled) {
          background: #1557b0;
          border-color: #1557b0;
        }
        .gdrive-btn.danger {
          color: var(--danger) !important;
          border-color: var(--danger-soft) !important;
        }
        .gdrive-btn.danger:hover:not(:disabled) {
          background: var(--danger-soft) !important;
        }
        .gdrive-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .gdrive-btn.sm {
          padding: 4px 8px;
          font-size: 0.74rem;
        }
        .gdrive-btn-sm {
          border: 1px solid var(--line);
          background: var(--surface);
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.74rem;
          color: var(--ink-soft);
          font-weight: 600;
        }
        .gdrive-file-list::-webkit-scrollbar {
          width: 6px;
        }
        .gdrive-file-list::-webkit-scrollbar-thumb {
          background: var(--line-strong);
          border-radius: 3px;
        }
        .gdrive-btn-sm:hover {
          background: var(--surface-2);
          color: var(--ink);
          border-color: var(--line-strong);
        }
        .gdrive-btn-sm.danger:hover {
          background: var(--danger-soft);
          color: var(--danger);
          border-color: var(--danger-soft);
        }
        .gdrive-setup-form ol {
          margin-left: 20px !important;
        }
        .gdrive-setup-form li {
          margin-bottom: 4px;
        }
      `}} />
    </div>
  )
}
