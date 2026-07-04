import { useEffect, useState, useCallback } from 'react'
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
      url.searchParams.append('q', "name ends with '.house.json' and trashed = false")
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
      flash('Error listing files from Google Drive', 'error')
    } finally {
      setLoadingFiles(false)
    }
  }, [accessToken, flash])

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
        flash('Successfully updated existing plan on Google Drive!', 'success')
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
        flash('Successfully saved new plan to Google Drive!', 'success')
      }
      
      // Refresh the file list
      await fetchFileList()
    } catch (err) {
      console.error(err)
      flash('Failed to save to Google Drive', 'error')
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
      flash(`Loaded "${proj.name}" from Google Drive!`, 'success')
      onClose()
    } catch (err) {
      console.error(err)
      flash('Failed to load file from Google Drive', 'error')
    }
  }

  // Delete file from Drive
  const handleDeleteFromDrive = async (fileId, fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}" from Google Drive app storage?`)) return
    
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      if (!response.ok) throw new Error('Delete failed')
      
      flash('File deleted from Google Drive', 'success')
      setFiles((current) => current.filter((f) => f.id !== fileId))
    } catch (err) {
      console.error(err)
      flash('Failed to delete file', 'error')
    }
  }

  // Handle Client ID Save
  const handleSaveClientId = (e) => {
    e.preventDefault()
    const cleanId = clientId.trim()
    if (!cleanId) {
      flash('Please enter a valid Client ID', 'error')
      return
    }
    localStorage.setItem('house-designer:google-client-id', cleanId)
    setEditingClientId(false)
    flash('Client ID saved!', 'success')
  }

  // Trigger Google Login
  const handleConnect = () => {
    if (!clientId) return

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.appdata email profile',
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('Auth Error:', tokenResponse)
            flash('Failed to authenticate with Google', 'error')
            return
          }
          setAccessToken(tokenResponse.access_token)
          fetchFileList(tokenResponse.access_token)
          fetchUserInfo(tokenResponse.access_token)
          flash('Connected to Google Drive!', 'success')
        },
      })
      client.requestAccessToken({ prompt: 'consent' })
    } catch (err) {
      console.error(err)
      flash('OAuth Initialization failed. Double check your Client ID.', 'error')
    }
  }

  const handleDisconnect = () => {
    setAccessToken(null)
    setUserEmail(null)
    setUserAvatar(null)
    setFiles([])
    flash('Disconnected from Google Drive', 'info')
  }

  const handleClearClientId = () => {
    if (confirm('Clear Client ID and reset Google configuration?')) {
      localStorage.removeItem('house-designer:google-client-id')
      setClientId('')
      setEditingClientId(true)
      handleDisconnect()
    }
  }

  return (
    <div className="shortcut-overlay" onClick={onClose}>
      <div className="shortcut-card gdrive-modal" role="dialog" aria-label="Google Drive Sync" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <header className="shortcut-head">
          <span className="shortcut-mark" style={{ background: '#e8f0fe', color: '#1a73e8' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
            </svg>
          </span>
          <div>
            <h2>Google Drive App Storage</h2>
            <p>Save and load floor plans privately using your personal Google account</p>
          </div>
          <button className="shortcut-x" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div style={{ padding: '20px' }}>
          {editingClientId ? (
            /* SECTION 1: Client ID Setup */
            <form onSubmit={handleSaveClientId} className="gdrive-setup-form">
              <h3 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--ink)' }}>Configure Google API Access</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', lineHeight: '1.4', marginBottom: '14px' }}>
                To save plans to your Drive, you need a Google OAuth Client ID. 
                This keeps your credentials entirely yours.
              </p>
              
              <div style={{ background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.76rem', color: 'var(--ink-soft)', marginBottom: '14px', lineHeight: '1.4' }}>
                <strong>Quick Steps:</strong>
                <ol style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  <li>Go to Google Cloud Console and create a project.</li>
                  <li>Enable the <strong>Google Drive API</strong>.</li>
                  <li>Configure OAuth Consent Screen and create credentials for a <strong>Web Application</strong>.</li>
                  <li>Add <code>{window.location.origin}</code> to <strong>Authorized JavaScript Origins</strong>.</li>
                  <li>Copy the Client ID and paste below.</li>
                </ol>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                  Google OAuth Client ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12345-abcde.apps.googleusercontent.com"
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
                    Cancel
                  </button>
                )}
                <button type="submit" className="gdrive-btn primary">
                  Save Client ID
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
                      {accessToken ? 'Connected' : 'Disconnected'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-faint)' }}>
                      {accessToken ? userEmail : 'Secure decentralized storage'}
                    </div>
                  </div>
                </div>

                <div>
                  {accessToken ? (
                    <button className="gdrive-btn secondary danger" onClick={handleDisconnect}>
                      Disconnect
                    </button>
                  ) : (
                    <button className="gdrive-btn primary" onClick={handleConnect}>
                      Connect Google Account
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
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-faint)', fontWeight: 700 }}>Current Project</span>
                        <h4 style={{ margin: '2px 0 0 0', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {project.name}
                        </h4>
                      </div>
                      <button className="gdrive-btn primary" onClick={handleSaveToDrive} disabled={savingCurrent} style={{ flexShrink: 0 }}>
                        {savingCurrent ? 'Saving...' : 'Save to Drive'}
                      </button>
                    </div>
                  </div>

                  {/* Drive Files List */}
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Saved Plans in Google Drive
                    </h3>
                    
                    {loadingFiles ? (
                      <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                        Loading files from Drive...
                      </div>
                    ) : files.length === 0 ? (
                      <div style={{ padding: '24px 0', textAlign: 'center', fontSize: '0.82rem', color: 'var(--ink-faint)', border: '1px dashed var(--line)', borderRadius: '8px' }}>
                        No saved floor plans found in your Drive app folder.
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
                                Modified {new Date(file.modifiedTime).toLocaleString()}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <button className="gdrive-btn-sm" onClick={() => handleLoadFromDrive(file.id, file.name)}>
                                Load
                              </button>
                              <button className="gdrive-btn-sm danger" onClick={() => handleDeleteFromDrive(file.id, file.name)}>
                                Delete
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
                  OAuth Client ID Configured
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="gdrive-btn secondary sm" onClick={() => setEditingClientId(true)}>
                    Change ID
                  </button>
                  <button className="gdrive-btn secondary sm danger" onClick={handleClearClientId}>
                    Reset Settings
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
