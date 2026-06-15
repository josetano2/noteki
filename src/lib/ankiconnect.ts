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

export async function checkDuplicates(url: string, deckName: string, cards: AnkiCard[]): Promise<boolean[]> {
  const notes = cards.map((card) => ({
    deckName,
    modelName: 'Basic',
    fields: { Front: card.front, Back: card.back },
    tags: card.tags,
    options: { allowDuplicate: false, duplicateScope: 'deck' },
  }))
  return invoke<boolean[]>(url, 'canAddNotes', { notes })
}

export async function addNotesToDeck(
  url: string,
  deckName: string,
  cards: AnkiCard[],
): Promise<{ added: number; skipped: number; duplicateNames: string[] }> {
  // Pre-check which cards Anki will accept
  const canAdd = await checkDuplicates(url, deckName, cards)
  const duplicateNames = cards
    .filter((_, i) => !canAdd[i])
    .map((c) => c.preview?.front ?? c.tags[0] ?? '?')

  const addable = cards.filter((_, i) => canAdd[i])
  if (addable.length === 0) {
    return { added: 0, skipped: cards.length, duplicateNames }
  }

  const notes = addable.map((card) => ({
    deckName,
    modelName: 'Basic',
    fields: { Front: card.front, Back: card.back },
    tags: card.tags,
    options: { allowDuplicate: false, duplicateScope: 'deck' },
  }))
  await invoke(url, 'addNotes', { notes })

  return { added: addable.length, skipped: duplicateNames.length, duplicateNames }
}
