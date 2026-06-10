import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { CardPreferences, DeckConfig } from '@/types'
import { DEFAULT_PREFERENCES } from '@/types'

interface PreferencesContextValue {
  preferences: CardPreferences
  setPreferences: (p: CardPreferences) => void
  deckConfig: DeckConfig
  setDeckConfig: (d: DeckConfig) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

const STORAGE_KEY = 'noteki:prefs'

const DEFAULT_DECK_CONFIG: DeckConfig = {
  action: 'create',
  deckName: '',
  existingDecks: [],
}

function loadPrefs(): { preferences: CardPreferences; deckConfig: DeckConfig } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { preferences: DEFAULT_PREFERENCES, deckConfig: DEFAULT_DECK_CONFIG }
    const parsed = JSON.parse(raw)
    return {
      preferences: { ...DEFAULT_PREFERENCES, ...(parsed.preferences ?? {}) },
      deckConfig: { ...DEFAULT_DECK_CONFIG, ...(parsed.deckConfig ?? {}) },
    }
  } catch {
    return { preferences: DEFAULT_PREFERENCES, deckConfig: DEFAULT_DECK_CONFIG }
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const loaded = loadPrefs()
  const [preferences, setPreferences] = useState<CardPreferences>(loaded.preferences)
  const [deckConfig, setDeckConfig] = useState<DeckConfig>(loaded.deckConfig)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preferences, deckConfig }))
  }, [preferences, deckConfig])

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences, deckConfig, setDeckConfig }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
