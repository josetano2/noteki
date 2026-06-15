import type { AnkiCard } from '@/types'

function resolveUrl(configuredUrl: string): string {
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

export async function addNotesToDeck(
  url: string,
  deckName: string,
  cards: AnkiCard[],
): Promise<{ added: number; skipped: number; duplicateNames: string[] }> {
  // Only export cards our registry hasn't already tracked as sent
  const toAdd = cards.filter((c) => !c.isDuplicate)
  const skippedByRegistry = cards
    .filter((c) => c.isDuplicate)
    .map((c) => c.preview?.front ?? '?')

  if (toAdd.length === 0) {
    return { added: 0, skipped: cards.length, duplicateNames: skippedByRegistry }
  }

  // Use allowDuplicate: true — our registry is the source of truth for dedup,
  // not Anki's own check which produces false positives from old/reformatted notes.
  const notes = toAdd.map((card) => ({
    deckName,
    modelName: 'Basic',
    fields: { Front: card.front, Back: card.back },
    tags: card.tags,
    options: { allowDuplicate: true },
  }))

  await invoke(url, 'addNotes', { notes })

  return { added: toAdd.length, skipped: skippedByRegistry.length, duplicateNames: skippedByRegistry }
}
