import Anthropic from '@anthropic-ai/sdk'
import type { AnkiCard, CardPreferences, CardPreview } from '@/types'

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
- examples: 4-5 natural Japanese sentences with English translation, or more sentence if it is necassary to capture the whole context of the grammar point
- the given sentence should be a valid natural Japanese language that is used by the locals
- if there is an example from the notes, you could reuse it, or if its too simple, you can make a new one that is more complex
- the sentence should be a bit more complex too, so in a real life case, it would be easier to visualize it
- if its necessary, you could add notes: in the back to give a more detailed explanation, specific usecase, other usecase
- for vocabulary points, make the vocabulary in the front, and the meaning in the back, do not group them together
- there is definition in my notes, if you can make the definition better, you could replace or add it to the definition
- make sure only 1 grammar point per card, so if there is a similar one, differentiate it
- use bunpro.jp as your reference standard for Japanese grammar explanations — rely on its style of breaking down meaning, nuance, and usage, whether or not the notes link to it directly
- if my notes are missing or have a weak explanation for a grammar point, fill the gap using that same bunpro-style explanation so the card is as accurate and complete as possible
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

const ANKI_STYLES = `<style>
.nk { font-family: 'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif; max-width: 560px; margin: 0 auto; padding: 4px 0; line-height: 1.6; color: #e4e4e7; }
.nk-front { font-size: 2em; font-weight: 600; text-align: center; letter-spacing: 0.05em; padding: 8px 0; color: #e4e4e7; }
.nk-label { font-size: 0.65em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #a78bfa; margin-bottom: 6px; }
.nk-meaning { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; }
.nk-meaning-text { font-size: 1.1em; font-weight: 500; color: #e4e4e7; }
.nk-pattern-wrap { margin-bottom: 16px; }
.nk-pattern { display: inline-block; background: #2e1065; color: #c4b5fd; font-family: monospace; font-size: 0.95em; padding: 5px 12px; border-radius: 6px; border: 1px solid #4c1d95; }
.nk-divider { border-top: 1px solid #3f3f46; margin-bottom: 16px; }
.nk-example { padding: 10px 14px; background: #27272a; border-left: 3px solid #d4a853; border-radius: 0 6px 6px 0; margin-bottom: 8px; }
.nk-example-jp { font-size: 1.05em; color: #e4e4e7; line-height: 1.6; }
.nk-example-en { font-size: 0.85em; color: #a1a1aa; margin-top: 3px; font-style: italic; }
</style>`

function formatFront(text: string): string {
  // No <style> block here — Anki uses the Front field's text content for
  // duplicate detection (stripping tags but keeping style text), so keeping
  // it style-free ensures dedup works on the grammar point text only.
  return `<div class="nk"><div class="nk-front">${text}</div></div>`
}

function formatBack(card: RawCard): string {
  const examples = card.examples.map((ex) => `
    <div class="nk-example">
      <div class="nk-example-jp">${ex.jp}</div>
      <div class="nk-example-en">${ex.en}</div>
    </div>`).join('')

  return `${ANKI_STYLES}
<div class="nk">
  <div class="nk-meaning">
    <span class="nk-label" style="white-space:nowrap">Meaning</span>
    <span class="nk-meaning-text">${card.meaning}</span>
  </div>
  <div class="nk-pattern-wrap">
    <div class="nk-label">Pattern</div>
    <div class="nk-pattern">${card.pattern}</div>
  </div>
  <div class="nk-divider"></div>
  <div>
    <div class="nk-label">Examples</div>
    ${examples}
  </div>
</div>`
}

async function generateBatch(
  client: Anthropic,
  chunk: string,
  preferences: CardPreferences,
  onProgress?: (chars: number) => void,
): Promise<AnkiCard[]> {
  const userPrompt = [
    preferences.language !== 'English' && `Target language: ${preferences.language}.`,
    preferences.includeTags ? 'Include relevant tags.' : 'Do not include tags.',
    preferences.context && `Additional instructions: ${preferences.context}`,
    '',
    'Study Notes:',
    chunk,
  ].filter(Boolean).join('\n')

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  let raw = ''
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      raw += event.delta.text
      onProgress?.(raw.length)
    }
  }

  const message = await stream.finalMessage()
  if (message.stop_reason === 'max_tokens') {
    throw new Error(`Response was cut off mid-generation (too many cards in one batch). Try splitting your notes into smaller sections.`)
  }
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()

  let parsed: { cards: RawCard[] }
  try {
    parsed = JSON.parse(cleaned) as { cards: RawCard[] }
  } catch {
    throw new Error(`Failed to parse Claude response. Stop reason: ${message.stop_reason}. Preview: ${cleaned.slice(0, 200)}`)
  }

  return parsed.cards.map((card) => {
    const preview: CardPreview = {
      front: card.front,
      meaning: card.meaning,
      pattern: card.pattern,
      examples: card.examples,
    }
    return {
      id: crypto.randomUUID(),
      front: formatFront(card.front),
      back: formatBack(card),
      type: 'basic' as AnkiCard['type'],
      tags: card.tags ?? [],
      isEdited: false,
      preview,
    }
  })
}

export async function generateCards(params: GenerateCardsParams): Promise<AnkiCard[]> {
  const { noteContent, preferences, onBatchStart, onBatchProgress, onBatchDone } = params
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY as string

  if (!apiKey) throw new Error('VITE_CLAUDE_API_KEY is not set in .env')

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const batches = splitIntoBatches(noteContent)
  const allCards: AnkiCard[] = []

  for (let i = 0; i < batches.length; i++) {
    onBatchStart?.(i + 1, batches.length)
    const cards = await generateBatch(client, batches[i], preferences, (chars) =>
      onBatchProgress?.(chars, i + 1),
    )
    allCards.push(...cards)
    onBatchDone?.(cards, i + 1, batches.length)
  }

  return allCards
}
