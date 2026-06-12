import type { AnkiCard } from '@/types'

function resolveUrl(configuredUrl: string): string {
  // In dev, route through Vite proxy (/anki) to avoid CORS.
  // In prod builds, use the configured URL directly (user hosts their own server).
  if (import.meta.env.DEV) return '/anki'
  return configuredUrl
}

async function invoke<T>(url: string, action: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(resolveUrl(url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, version: 6, params }),
  })
  if (!res.ok) throw new Error(`AnkiConnect HTTP ${res.status}`)
  const data = await res.json() as { result: T; error: string | null }
  if (data.error) throw new Error(data.error)
  return data.result
}

export async function fetchDeckNames(url: string): Promise<string[]> {
  const names = await invoke<string[]>(url, 'deckNames')
  return names.sort()
}

export async function createDeck(url: string, deckName: string): Promise<void> {
  await invoke(url, 'createDeck', { deck: deckName })
}

export async function addNotesToDeck(url: string, deckName: string, cards: AnkiCard[]): Promise<void> {
  const notes = cards.map((card) => ({
    deckName,
    modelName: card.type === 'cloze' ? 'Cloze' : 'Basic',
    fields: card.type === 'cloze'
      ? { Text: card.front, 'Back Extra': card.back }
      : { Front: card.front, Back: card.back },
    tags: card.tags,
  }))
  await invoke(url, 'addNotes', { notes })
}
