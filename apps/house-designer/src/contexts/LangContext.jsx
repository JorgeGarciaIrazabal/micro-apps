import { createContext, useContext, useState } from 'react'
import { createT, SUPPORTED_LANGS } from '../lib/i18n.js'

const LangContext = createContext(null)

function savedLang() {
  try {
    const l = localStorage.getItem('house-designer:lang')
    return SUPPORTED_LANGS.includes(l) ? l : 'en'
  } catch {
    return 'en'
  }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(savedLang)

  function setLang(l) {
    setLangState(l)
    try { localStorage.setItem('house-designer:lang', l) } catch { /* quota */ }
  }

  const t = createT(lang)
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useT() {
  return useContext(LangContext)
}
