export type CardType = 'basic' | 'cloze' | 'basic-reversed'

export interface AnkiCard {
  id: string
  front: string
  back: string
  type: CardType
  tags: string[]
  isEdited: boolean
}

export interface CardPreferences {
  cardType: CardType
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: string
  cardCount: number
  dynamicCount: boolean
  includeTags: boolean
  context: string
}

export type DeckAction = 'create' | 'append'

export interface DeckConfig {
  action: DeckAction
  deckName: string
  existingDecks: string[]
}

export interface AppSettings {
  claudeApiKey: string
  ankiConnectUrl: string
  defaultPreferences: CardPreferences
}

export type GenerationStatus = 'idle' | 'generating' | 'done' | 'error'

export const DEFAULT_PREFERENCES: CardPreferences = {
  cardType: 'basic',
  difficulty: 'intermediate',
  language: 'English',
  cardCount: 10,
  dynamicCount: true,
  includeTags: true,
  context: '',
}

export const DEFAULT_SETTINGS: AppSettings = {
  claudeApiKey: '',
  ankiConnectUrl: 'http://localhost:8765',
  defaultPreferences: DEFAULT_PREFERENCES,
}
