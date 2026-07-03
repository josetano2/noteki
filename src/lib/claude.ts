import type { AnkiCard, CardPreferences } from '@/types'

export interface GenerateCardsParams {
  noteContent: string
  preferences: CardPreferences
  onBatchStart?: (batchIndex: number, total: number) => void
  onBatchProgress?: (chars: number, batchIndex: number) => void
  onBatchDone?: (cards: AnkiCard[], batchIndex: number, total: number) => void
}

// Split notes into chunks by blank lines, grouping up to maxChars per batch
export function splitIntoBatches(text: string, maxChars = 1500): string[] {
  const sections = text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
  const batches: string[] = []
  let current = ''
  for (const section of sections) {
    if (current && current.length + section.length + 2 > maxChars) {
      batches.push(current)
      current = section
    } else {
      current = current ? `${current}\n\n${section}` : section
    }
  }
  if (current) batches.push(current)
  return batches.length ? batches : [text]
}

interface SseEvent {
  event: string
  data: unknown
}

// Parses an SSE byte stream into discrete `{ event, data }` messages.
async function* readSseEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let sepIndex: number
    while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, sepIndex)
      buffer = buffer.slice(sepIndex + 2)

      let event = 'message'
      let data = ''
      for (const line of rawEvent.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7)
        else if (line.startsWith('data: ')) data = line.slice(6)
      }
      if (data) yield { event, data: JSON.parse(data) }
    }
  }
}

export async function generateCards(params: GenerateCardsParams): Promise<AnkiCard[]> {
  const { noteContent, preferences, onBatchStart, onBatchProgress, onBatchDone } = params

  const response = await fetch('/api/generate-cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteContent, preferences }),
  })

  if (!response.ok || !response.body) {
    throw new Error(`Card generation request failed (${response.status})`)
  }

  const allCards: AnkiCard[] = []

  for await (const { event, data } of readSseEvents(response.body)) {
    switch (event) {
      case 'batch-start': {
        const { current, total } = data as { current: number; total: number }
        onBatchStart?.(current, total)
        break
      }
      case 'batch-progress': {
        const { chars, current } = data as { chars: number; current: number }
        onBatchProgress?.(chars, current)
        break
      }
      case 'batch-done': {
        const { cards, current, total } = data as { cards: AnkiCard[]; current: number; total: number }
        allCards.push(...cards)
        onBatchDone?.(cards, current, total)
        break
      }
      case 'error': {
        const { message } = data as { message: string }
        throw new Error(message)
      }
      case 'done':
        break
    }
  }

  return allCards
}