/**
 * AppearanceContext.jsx
 * Manages theme (Light / Dark / System) and accent colour.
 * Persists to localStorage and applies changes directly to <html>
 * so every Tailwind dark: and CSS-variable class picks them up instantly.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'hc_appearance'
const DEFAULTS    = { theme: 'Light', accent: 'blue' }
const THEMES      = ['Light', 'Dark', 'System']
const ACCENTS     = ['blue', 'emerald', 'violet', 'rose']

function normalizeTheme(rawTheme) {
  const candidate = String(rawTheme ?? '').trim().toLowerCase()
  if (candidate === 'light') return 'Light'
  if (candidate === 'dark') return 'Dark'
  if (candidate === 'system') return 'System'
  return DEFAULTS.theme
}

function normalizeAccent(rawAccent) {
  const candidate = String(rawAccent ?? '').trim().toLowerCase()
  return ACCENTS.includes(candidate) ? candidate : DEFAULTS.accent
}

function normalizePrefs(value) {
  const theme = normalizeTheme(value?.theme)
  const accent = normalizeAccent(value?.accent)
  return { theme, accent }
}

function applyToDOM({ theme, accent }) {
  const root = document.documentElement
  const isDark =
    theme === 'Dark' ||
    (theme === 'System' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) root.classList.add('dark')
  else root.classList.remove('dark')

  // Keep native UI controls (date/time/select/scrollbars) aligned with current theme.
  root.style.colorScheme = isDark ? 'dark' : 'light'

  if (accent && accent !== 'blue') {
    root.dataset.accent = accent
  } else {
    delete root.dataset.accent
  }
}

const AppearanceContext = createContext(null)

export function AppearanceProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      return s ? normalizePrefs({ ...DEFAULTS, ...JSON.parse(s) }) : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  // Apply to DOM + persist whenever prefs change
  useEffect(() => {
    applyToDOM(prefs)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }, [prefs])

  // Re-apply when OS theme changes while "System" is selected
  useEffect(() => {
    if (prefs.theme !== 'System') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyToDOM(prefs)

    // Safari <14 only supports addListener/removeListener.
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }

    mq.addListener(handler)
    return () => mq.removeListener(handler)
  }, [prefs])

  const setTheme = useCallback((theme) => {
    if (!THEMES.includes(theme)) return
    setPrefs((p) => ({ ...p, theme }))
  }, [])

  const setAccent = useCallback((accent) => {
    if (!ACCENTS.includes(accent)) return
    setPrefs((p) => ({ ...p, accent }))
  }, [])

  return (
    <AppearanceContext.Provider value={{ ...prefs, setTheme, setAccent }}>
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext)
  if (!ctx) throw new Error('useAppearance must be used inside <AppearanceProvider>')
  return ctx
}
