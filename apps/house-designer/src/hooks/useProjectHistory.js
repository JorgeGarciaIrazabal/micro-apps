import { useCallback, useEffect, useRef, useState } from 'react'
import { serialize, deserialize } from '../lib/project.js'

// Owns the project state plus undo/redo. History is a stack of serialized
// snapshots: cheap enough at this scale and immune to accidental aliasing.
// Rapid consecutive commits (e.g. drag-move) collapse into a single undo step
// via a time debounce so dragging a piece doesn't flood the stack.
const MAX_HISTORY = 80
const PUSH_DEBOUNCE_MS = 350

export function useProjectHistory(initial, { onUndo, onRedo } = {}) {
  const [project, setProject] = useState(initial)
  // Mirror of the latest project so commit/undo/redo stay pure (no side
  // effects inside setState updaters, which StrictMode double-invokes).
  const currentRef = useRef(null)
  if (currentRef.current === null) currentRef.current = project
  const pastRef = useRef([])
  const futureRef = useRef([])
  const lastPushRef = useRef(0)
  const cbRef = useRef({ onUndo, onRedo })
  cbRef.current = { onUndo, onRedo }

  // The ONE entry point for project mutations. `undoable: false` skips the
  // history push (view-only changes like switching the active floor).
  const commit = useCallback((updater, { undoable = true } = {}) => {
    const prev = currentRef.current
    const next = typeof updater === 'function' ? updater(prev) : updater
    if (next === prev) return
    if (undoable) {
      const now = Date.now()
      if (now - lastPushRef.current >= PUSH_DEBOUNCE_MS) {
        lastPushRef.current = now
        pastRef.current.push(serialize(prev))
        if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift()
      }
      futureRef.current = []
    }
    currentRef.current = next
    setProject(next)
  }, [])

  const restore = useCallback((snapshot) => {
    try {
      const proj = deserialize(snapshot)
      currentRef.current = proj
      setProject(proj)
      return true
    } catch { return false } // corrupted snapshot
  }, [])

  const undo = useCallback(() => {
    const snapshot = pastRef.current.pop()
    if (!snapshot) return false
    futureRef.current.push(serialize(currentRef.current))
    return restore(snapshot)
  }, [restore])

  const redo = useCallback(() => {
    const snapshot = futureRef.current.pop()
    if (!snapshot) return false
    pastRef.current.push(serialize(currentRef.current))
    if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift()
    lastPushRef.current = 0 // don't debounce-collapse the next real commit into this
    return restore(snapshot)
  }, [restore])

  // Global Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y. Skipped while typing in a field so
  // native input undo keeps working.
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const k = e.key.toLowerCase()
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault()
        cbRef.current.onUndo?.(undo())
      } else if ((k === 'z' && e.shiftKey) || k === 'y') {
        e.preventDefault()
        cbRef.current.onRedo?.(redo())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  return { project, commit, undo, redo }
}
