export type CardType = 'basic' | 'cloze' | 'basic-reversed'

export interface CardExample {
  jp: string
  en: string
}

export interface CardPreview {
  front: string
  meaning: string
  pattern: string
  examples: CardExample[]
  notes?: string
}

export interface AnkiCard {
  id: string
  front: string       // HTML for Anki export
  back: string        // HTML for Anki export
  type: CardType
  tags: string[]
  isEdited: boolean
  isDuplicate?: boolean
  preview?: CardPreview  // raw data for in-app dark rendering
}

export interface CardPreferences {
  language: string
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
  ankiConnectUrl: string
  defaultPreferences: CardPreferences
}

export type GenerationStatus = 'idle' | 'generating' | 'done' | 'error'

export interface BatchProgress {
  current: number
  total: number
  failed: number
}

export interface LogEntry {
  id: string
  time: string
  message: string
  type: 'info' | 'success' | 'error' | 'card'
}

export const DEFAULT_PREFERENCES: CardPreferences = {
  language: 'English',
  includeTags: true,
  context: '',
}

export const DEFAULT_SETTINGS: AppSettings = {
  ankiConnectUrl: 'http://127.0.0.1:8765',
  defaultPreferences: DEFAULT_PREFERENCES,
}
