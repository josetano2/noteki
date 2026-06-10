import type { AnkiCard, CardPreferences } from '@/types'
import { MOCK_CARDS } from './mock-data'

export interface GenerateCardsParams {
  noteContent: string
  preferences: CardPreferences
  apiKey: string
}

export async function generateCards(_params: GenerateCardsParams): Promise<AnkiCard[]> {
  await new Promise((resolve) => setTimeout(resolve, 1800))
  const count = Math.min(_params.preferences.cardCount, MOCK_CARDS.length)
  return MOCK_CARDS.slice(0, count).map((card) => ({
    ...card,
    id: crypto.randomUUID(),
    isEdited: false,
  }))
}
