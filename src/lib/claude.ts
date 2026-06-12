import type { AnkiCard, CardPreferences } from '@/types'
import { MOCK_CARDS } from './mock-data'

export interface GenerateCardsParams {
  noteContent: string
  preferences: CardPreferences
  apiKey: string
}

export async function generateCards(_params: GenerateCardsParams): Promise<AnkiCard[]> {
  await new Promise((resolve) => setTimeout(resolve, 1800))
  return MOCK_CARDS.map((card) => ({
    ...card,
    id: crypto.randomUUID(),
    isEdited: false,
  }))
}
