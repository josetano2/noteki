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
        "日本に行ったことがある。",
        "寿司を食べたことがありますか。"
      ],
      "tags": ["grammar", "n5"]
    }
  ]
}

Rules:
- front: the grammar point only, keep it short
- meaning: one concise English translation
- pattern: the grammatical structure
- examples: 2-3 natural Japanese sentences using the grammar point
- tags: lowercase, relevant (jlpt level, grammar category, etc.)`

interface RawCard {
  front: string
  meaning: string
  pattern: string
  examples: string[]
  tags: string[]
}

function formatBack(card: RawCard): string {
  const examples = card.examples
    .map((ex) => `<li>${ex}</li>`)
    .join('')

  return `\
<div class="noteki-card">
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
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  const parsed = JSON.parse(cleaned) as { cards: RawCard[] }

  return parsed.cards.map((card) => ({
    id: crypto.randomUUID(),
    front: card.front,
    back: formatBack(card),
    type: 'basic' as AnkiCard['type'],
    tags: card.tags ?? [],
    isEdited: false,
  }))
}
