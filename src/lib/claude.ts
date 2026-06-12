import Anthropic from '@anthropic-ai/sdk'
import type { AnkiCard, CardPreferences } from '@/types'

export interface GenerateCardsParams {
  noteContent: string
  preferences: CardPreferences
  apiKey: string
}

const SYSTEM_PROMPT = `You are a Japanese grammar flashcard generator.

Generate exactly ONE card per grammar point. No duplicates, no padding.

Return ONLY a raw JSON object (no markdown, no code blocks):

{
  "cards": [
    {
      "front": "～たことがある",
      "meaning": "Have done ~ before",
      "pattern": "V(た) + ことがある",
      "examples": [
        { "jp": "日本に行ったことがある。", "en": "I have been to Japan before." },
        { "jp": "寿司を食べたことがありますか。", "en": "Have you ever eaten sushi?" }
      ],
      "tags": ["grammar", "n5"]
    }
  ]
}

Rules:
- front: the grammar point only, keep it short
- meaning: one concise English translation
- pattern: the grammatical structure
- examples: 2-3 natural Japanese sentences with English translation
- tags: lowercase, relevant (jlpt level, grammar category, etc.)`

interface RawExample {
  jp: string
  en: string
}

interface RawCard {
  front: string
  meaning: string
  pattern: string
  examples: RawExample[]
  tags: string[]
}

function formatBack(card: RawCard): string {
  const examples = card.examples
    .map((ex) => `<li>${ex.jp}<br><span class="translation">${ex.en}</span></li>`)
    .join('')

  return `<div class="noteki-card">
  <p class="meaning"><b>Meaning:</b> ${card.meaning}</p>
  <hr/>
  <p class="label">Pattern</p>
  <ul><li>${card.pattern}</li></ul>
  <p class="label">Examples</p>
  <ul>${examples}</ul>
</div>`
}

export async function generateCards(params: GenerateCardsParams): Promise<AnkiCard[]> {
  const { noteContent, preferences, apiKey } = params

  if (!apiKey) throw new Error('No Claude API key set. Add it in Settings.')

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const userPrompt = [
    preferences.language !== 'English' && `Target language: ${preferences.language}.`,
    preferences.includeTags ? 'Include relevant tags.' : 'Do not include tags.',
    preferences.context && `Additional instructions: ${preferences.context}`,
    '',
    'Study Notes:',
    noteContent,
  ].filter(Boolean).join('\n')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  let parsed: { cards: RawCard[] }
  try {
    parsed = JSON.parse(cleaned) as { cards: RawCard[] }
  } catch {
    throw new Error(`Failed to parse Claude response. Stop reason: ${message.stop_reason}. Preview: ${cleaned.slice(0, 200)}`)
  }

  return parsed.cards.map((card) => ({
    id: crypto.randomUUID(),
    front: card.front,
    back: formatBack(card),
    type: 'basic' as AnkiCard['type'],
    tags: card.tags ?? [],
    isEdited: false,
  }))
}
