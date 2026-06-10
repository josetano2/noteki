import type { AnkiCard } from '@/types'
import { MOCK_DECK_NAMES } from './mock-data'

export async function fetchDeckNames(_url: string): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return MOCK_DECK_NAMES
}

export async function createDeck(_url: string, _deckName: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
}

export async function addNotesToDeck(
  _url: string,
  _deckName: string,
  _cards: AnkiCard[],
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600))
}
