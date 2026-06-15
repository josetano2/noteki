import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AppSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (partial: Partial<AppSettings>) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const STORAGE_KEY = 'noteki:settings'

function encode(s: AppSettings): string {
  return btoa(JSON.stringify(s))
}

function decode(raw: string): AppSettings {
  // support both legacy plain JSON and encoded
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(atob(raw)) }
  } catch {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  }
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return decode(raw)
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, encode(settings))
  }, [settings])

  function updateSettings(partial: Partial<AppSettings>) {
    setSettings((prev) => ({ ...prev, ...partial }))
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
