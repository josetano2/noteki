import Anthropic from '@anthropic-ai/sdk'
import type { AnkiCard, CardPreferences } from '@/types'

export interface GenerateCardsParams {
  noteContent: string
  preferences: CardPreferences
  apiKey: string
}

const SYSTEM_PROMPT = `You are an expert educator and flashcard creator.

Your task is to transform study notes into structured learning cards.

Rules:
1. Extract all important concepts.
2. Split concepts into atomic pieces of knowledge.
3. Preserve examples and nuances.
4. Include important warnings, exceptions, and common mistakes.
5. Generate as many cards as necessary for complete coverage.
6. Return ONLY valid JSON.

Output Format:
{
  "cards": [
    {
      "front": {
        "question": "～たことがある",
        "card_type": "grammar",
      },
      "back": {
        "answer": "Have done something before (past experience)",
        "definition": "Used to express past experiences.",
        "example": [
          {
            "japanese": "日本に行ったことがある。",
            "english": "I have been to Japan."
          }
        ],
        "notes": [
          "Uses the past tense form of the verb.",
          "Indicates life experience rather than a specific completed action."
        ],
        "common_mistakes": [
          "Confusing it with ～たところ."
        ],
        "related_concepts": [
          "～たところ",
          "～ている"
        ]
      }
    }
  ]
}`

interface RawExample {
  japanese?: string
  english?: string
  [key: string]: string | undefined
}

interface RawCard {
  front: {
    question: string
    card_type: string
    difficulty: string
    hint?: string
  }
  back: {
    answer: string
    definition?: string
    example?: RawExample[]
    notes?: string[]
    common_mistakes?: string[]
    related_concepts?: string[]
  }
}

function formatBack(back: RawCard['back']): string {
  const parts: string[] = [back.answer]

  if (back.definition) parts.push(`\n${back.definition}`)

  if (back.example?.length) {
    parts.push('\nExamples:')
    for (const ex of back.example) {
      const lines = Object.values(ex).filter(Boolean)
      parts.push(lines.map((l) => `  ${l}`).join('\n'))
    }
  }

  if (back.notes?.length) {
    parts.push('\nNotes:')
    parts.push(back.notes.map((n) => `  • ${n}`).join('\n'))
  }

  if (back.common_mistakes?.length) {
    parts.push('\nCommon mistakes:')
    parts.push(back.common_mistakes.map((m) => `  • ${m}`).join('\n'))
  }

  if (back.related_concepts?.length) {
    parts.push(`\nRelated: ${back.related_concepts.join(', ')}`)
  }

  return parts.join('\n')
}

export async function generateCards(params: GenerateCardsParams): Promise<AnkiCard[]> {
  const { noteContent, preferences, apiKey } = params

  if (!apiKey) throw new Error('No Claude API key set. Add it in Settings.')

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const userPrompt = [
    preferences.language !== 'English' && `Generate cards in ${preferences.language}.`,
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
  const parsed = JSON.parse(raw) as { cards: RawCard[] }

  return parsed.cards.map((card) => ({
    id: crypto.randomUUID(),
    front: card.front.question,
    back: formatBack(card.back),
    type: 'basic' as AnkiCard['type'],
    tags: [card.front.card_type, card.front.difficulty].filter(Boolean),
    isEdited: false,
  }))
}
