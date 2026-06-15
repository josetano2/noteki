import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AnkiCard, GenerationStatus } from '@/types'
import { generateCards } from '@/lib/claude'
import { addNotesToDeck, createDeck } from '@/lib/ankiconnect'
import { getRegistry, addToRegistry } from '@/lib/registry'
import { useSettings } from './SettingsContext'
import { usePreferences } from './PreferencesContext'

interface GenerationContextValue {
  noteContent: string
  setNoteContent: (s: string) => void
  cards: AnkiCard[]
  setCards: React.Dispatch<React.SetStateAction<AnkiCard[]>>
  status: GenerationStatus
  error: string | null
  generate: () => Promise<void>
  exportToAnki: () => Promise<void>
}

const GenerationContext = createContext<GenerationContextValue | null>(null)

export function GenerationProvider({
  children,
  onGenerated,
}: {
  children: ReactNode
  onGenerated?: () => void
}) {
  const { settings } = useSettings()
  const { preferences, deckConfig } = usePreferences()

  const [noteContent, setNoteContent] = useState<string>(() => {
    return localStorage.getItem('noteki:note') ?? ''
  })
  const [cards, setCards] = useState<AnkiCard[]>(() => {
    try {
      const raw = localStorage.getItem('noteki:cards')
      return raw ? (JSON.parse(raw) as AnkiCard[]) : []
    } catch { return [] }
  })
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('noteki:note', noteContent)
  }, [noteContent])

  useEffect(() => {
    localStorage.setItem('noteki:cards', JSON.stringify(cards))
  }, [cards])

  async function generate() {
    if (!noteContent.trim()) return
    setStatus('generating')
    setError(null)
    try {
      const result = await generateCards({ noteContent, preferences })
      const registry = getRegistry()
      const marked = result.map((card) => ({
        ...card,
        isDuplicate: registry.has(card.front),
      }))
      setCards(marked)
      setStatus('done')
      onGenerated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
      setStatus('error')
    }
  }

  async function exportToAnki() {
    if (!cards.length) return
    setStatus('generating')
    setError(null)
    try {
      const url = settings.ankiConnectUrl
      if (deckConfig.action === 'create') {
        await createDeck(url, deckConfig.deckName)
      }
      const { added, skipped } = await addNotesToDeck(url, deckConfig.deckName, cards)
      // Save newly added cards to registry
      const newFronts = cards
        .filter((c) => !c.isDuplicate)
        .map((c) => c.front)
      addToRegistry(newFronts)
      // Mark all as non-duplicate now that they're in the registry
      setCards((prev) => prev.map((c) => ({ ...c, isDuplicate: false })))
      setStatus('done')
      if (skipped > 0) {
        setError(`${added} cards added, ${skipped} skipped (already in deck)`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setStatus('error')
    }
  }

  return (
    <GenerationContext.Provider
      value={{ noteContent, setNoteContent, cards, setCards, status, error, generate, exportToAnki }}
    >
      {children}
    </GenerationContext.Provider>
  )
}

export function useGeneration() {
  const ctx = useContext(GenerationContext)
  if (!ctx) throw new Error('useGeneration must be used within GenerationProvider')
  return ctx
}
