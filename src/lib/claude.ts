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
- examples: 3-5 natural Japanese sentences with English translation
- the given sentence should be a valid natural Japanese language that is used by the locals
- if there is an example from the notes, you could reuse it, or if its too simple, you can make a new one that is more complex
- the sentence should be a little bit more complex too, so in a real life case, it would be easier to visualize it
- if its necessary, you could add notes: in the back to give a more detailed explanation, specific usecase, other usecase
- for vocabulary points, make the vocabulary in the front, and the meaning in the back, do not group them together
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

function formatFront(text: string): string {
  return `<div style="
    font-family: 'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif;
    font-size: 2em;
    font-weight: 600;
    color: #1a1a1a;
    text-align: center;
    letter-spacing: 0.05em;
    padding: 8px 0;
  ">${text}</div>`
}

function formatBack(card: RawCard): string {
  const examples = card.examples.map((ex) => `
    <div style="
      padding: 10px 14px;
      background: #f8f8f6;
      border-left: 3px solid #d4a853;
      border-radius: 0 6px 6px 0;
      margin-bottom: 8px;
    ">
      <div style="font-size: 1.05em; color: #1a1a1a; line-height: 1.6;">${ex.jp}</div>
      <div style="font-size: 0.85em; color: #6b6b6b; margin-top: 3px; font-style: italic;">${ex.en}</div>
    </div>`).join('')

  return `
<div style="
  font-family: 'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif;
  max-width: 560px;
  margin: 0 auto;
  padding: 4px 0;
  color: #1a1a1a;
  line-height: 1.6;
">

  <!-- Meaning -->
  <div style="
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 16px;
  ">
    <span style="
      font-size: 0.65em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #8b5cf6;
      white-space: nowrap;
    ">Meaning</span>
    <span style="font-size: 1.1em; font-weight: 500; color: #1a1a1a;">${card.meaning}</span>
  </div>

  <!-- Pattern -->
  <div style="margin-bottom: 16px;">
    <div style="
      font-size: 0.65em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #8b5cf6;
      margin-bottom: 6px;
    ">Pattern</div>
    <div style="
      display: inline-block;
      background: #f0ebff;
      color: #5b21b6;
      font-family: monospace;
      font-size: 0.95em;
      padding: 5px 12px;
      border-radius: 6px;
      border: 1px solid #ddd6fe;
    ">${card.pattern}</div>
  </div>

  <!-- Divider -->
  <div style="border-top: 1px solid #e5e5e5; margin-bottom: 16px;"></div>

  <!-- Examples -->
  <div>
    <div style="
      font-size: 0.65em;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #8b5cf6;
      margin-bottom: 8px;
    ">Examples</div>
    ${examples}
  </div>

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
    front: formatFront(card.front),
    back: formatBack(card),
    type: 'basic' as AnkiCard['type'],
    tags: card.tags ?? [],
    isEdited: false,
  }))
}
