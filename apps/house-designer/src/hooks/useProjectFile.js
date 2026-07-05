import { useEffect, useRef } from 'react'
import { serialize, deserialize } from '../lib/project.js'

// File-backed project mode, driven by URL params:
//
//   ?project=<url>   load the project JSON from <url> at boot instead of localStorage
//   &save=1          debounce-save every change back to the dev host's /__save endpoint
//   &embed=1         chromeless mode (handled in App.jsx; hides file/cloud persistence UI)
//
// The dev server (scripts/dev-server.js) watches houses/ and broadcasts
// `houses-changed` SSE events on ../__hmr — when OUR file changes on disk
// (e.g. an agent edited it) we refetch and commit it as an undoable step,
// so Ctrl+Z rolls an external edit back.
//
// Everything no-ops when ?project= is absent (normal standalone mode), and
// save/SSE fail silently on static hosts (GitHub Pages) where they don't exist.

const params = new URLSearchParams(window.location.search)
export const PROJECT_URL = params.get('project')
export const SAVE_ENABLED = params.get('save') === '1'
export const EMBED_MODE = params.get('embed') === '1'

// "houses/<file>.house.json" — the repo-relative path used by /__save and
// carried in houses-changed events. Null for arbitrary project URLs (read-only).
const REL_MATCH = PROJECT_URL && PROJECT_URL.match(/houses\/[^/?#]+\.house\.json$/)
const REL_PATH = REL_MATCH ? REL_MATCH[0] : null

// Dev-host endpoints live one level above the app base (/micro-apps/__save).
const SAVE_URL = new URL('../__save', window.location.href).toString()
const EVENTS_URL = new URL('../__hmr', window.location.href).toString()

const SAVE_DEBOUNCE_MS = 800
const ERROR_FLASH_COOLDOWN_MS = 10000

export function useProjectFile({ project, commit, flash, t }) {
  const loadedRef = useRef(false)
  const lastFileRef = useRef(null) // serialized content known to match the file
  const saveTimer = useRef(null)
  const lastSaveErrorAt = useRef(0)

  // --- initial load ---------------------------------------------------------
  useEffect(() => {
    if (!PROJECT_URL) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(PROJECT_URL, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const proj = deserialize(await res.text())
        if (cancelled) return
        lastFileRef.current = serialize(proj)
        loadedRef.current = true
        commit(proj, { undoable: false })
      } catch (err) {
        console.error('project file load failed:', PROJECT_URL, err)
        if (!cancelled) flash(t('toast.project_load_failed'), 'error')
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- debounced save-back --------------------------------------------------
  useEffect(() => {
    if (!SAVE_ENABLED || !REL_PATH || !loadedRef.current) return
    const data = serialize(project)
    if (data === lastFileRef.current) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${SAVE_URL}?path=${encodeURIComponent(REL_PATH)}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: data,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        lastFileRef.current = data
      } catch (err) {
        console.error('project file save failed:', err)
        const now = Date.now()
        if (now - lastSaveErrorAt.current > ERROR_FLASH_COOLDOWN_MS) {
          lastSaveErrorAt.current = now
          flash(t('toast.project_save_failed'), 'error')
        }
      }
    }, SAVE_DEBOUNCE_MS)
    return () => clearTimeout(saveTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])

  // --- reload on external change (agent edits the file on disk) --------------
  useEffect(() => {
    if (!PROJECT_URL || !REL_PATH) return
    let es
    try { es = new EventSource(EVENTS_URL) } catch { return }
    const onChange = async (ev) => {
      try {
        const { path: changed } = JSON.parse(ev.data)
        if (changed !== REL_PATH) return
        const res = await fetch(PROJECT_URL, { cache: 'no-store' })
        if (!res.ok) return
        const proj = deserialize(await res.text())
        const norm = serialize(proj)
        if (norm === lastFileRef.current) return // echo of our own save
        lastFileRef.current = norm
        loadedRef.current = true
        commit(proj) // undoable: Ctrl+Z rolls the external edit back
        flash(t('toast.project_reloaded'))
      } catch (err) {
        console.error('project file reload failed:', err)
      }
    }
    es.addEventListener('houses-changed', onChange)
    return () => es.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
