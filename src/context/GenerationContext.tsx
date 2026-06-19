import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import type { AnkiCard, GenerationStatus, BatchProgress, LogEntry } from '@/types'
import { generateCards, splitIntoBatches } from '@/lib/claude'
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
  batchProgress: BatchProgress | null
  log: LogEntry[]
  generate: () => Promise<void>
  exportToAnki: () => Promise<void>
}

const GenerationContext = createContext<GenerationContextValue | null>(null)

function ts() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function mkLog(message: string, type: LogEntry['type'] = 'info'): LogEntry {
  return { id: crypto.randomUUID(), time: ts(), message, type }
}

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
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const failedRef = useRef(0)

  function pushLog(message: string, type: LogEntry['type'] = 'info') {
    setLog((prev) => [...prev, mkLog(message, type)])
  }

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
    setBatchProgress(null)
    setCards([])
    failedRef.current = 0

    const registry = getRegistry()
    const batches = splitIntoBatches(noteContent)
    setLog([mkLog(`Splitting notes — ${batches.length} batch${batches.length > 1 ? 'es' : ''} detected`, 'info')])

    try {
      await generateCards({
        noteContent,
        preferences,
        onBatchStart: (current, total) => {
          pushLog(`Batch ${current} / ${total} — sending to Claude…`, 'info')
          setBatchProgress({ current: current - 1, total, failed: failedRef.current })
        },
        onBatchProgress: (chars, current) => {
          setLog((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (last?.type === 'info' && last.message.startsWith(`Batch ${current}`)) {
              next[next.length - 1] = { ...last, message: `Batch ${current} — receiving… ${chars.toLocaleString()} chars` }
            }
            return next
          })
        },
        onBatchDone: (batchCards, current, total) => {
          setBatchProgress({ current, total, failed: failedRef.current })
          const marked = batchCards.map((card) => ({
            ...card,
            isDuplicate: registry.has(card.front),
          }))
          setCards((prev) => [...prev, ...marked])

          const names = batchCards
            .map((c) => c.preview?.front ?? '—')
            .slice(0, 4)
            .join(', ')
          const more = batchCards.length > 4 ? ` +${batchCards.length - 4} more` : ''
          pushLog(`Batch ${current} / ${total} done — ${batchCards.length} card${batchCards.length !== 1 ? 's' : ''}: ${names}${more}`, 'success')
        },
      })
      setStatus('done')
      setBatchProgress(null)
      pushLog(`All done — check the review panel`, 'success')
      if (failedRef.current === 0) onGenerated?.()
    } catch (err) {
      failedRef.current++
      const msg = err instanceof Error ? err.message : 'Generation failed'
      pushLog(msg, 'error')
      setError(msg)
      setStatus('error')
      setBatchProgress(null)
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
      const { added, skipped, duplicateNames } = await addNotesToDeck(url, deckConfig.deckName, cards)
      const dupeSet = new Set(duplicateNames)
      // Mark duplicates yellow, clear flag on successfully added cards
      setCards((prev) => prev.map((c) => ({
        ...c,
        isDuplicate: dupeSet.has(c.preview?.front ?? ''),
      })))
      const newFronts = cards
        .filter((c) => !dupeSet.has(c.preview?.front ?? ''))
        .map((c) => c.front)
      addToRegistry(newFronts)
      setStatus('done')
      if (skipped > 0) {
        setError(`${added} added — ${skipped} already in Anki: ${duplicateNames.join(', ')}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setStatus('error')
    }
  }

  return (
    <GenerationContext.Provider
      value={{ noteContent, setNoteContent, cards, setCards, status, error, batchProgress, log, generate, exportToAnki }}
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
