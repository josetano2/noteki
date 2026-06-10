import type { AnkiCard } from '@/types'

export const MOCK_DECK_NAMES = [
  'Default',
  'Japanese::N5',
  'Japanese::N4',
  'Programming::Python',
  'History::WW2',
]

export const MOCK_CARDS: AnkiCard[] = [
  {
    id: '1',
    front: 'What does は (wa) indicate in Japanese grammar?',
    back: 'は is the topic marker particle. It marks the topic of the sentence — what the sentence is about. Example: 私は学生です (I am a student).',
    type: 'basic',
    tags: ['japanese', 'grammar', 'particles'],
    isEdited: false,
  },
  {
    id: '2',
    front: 'Japanese particle が (ga) vs は (wa)',
    back: 'が marks the grammatical subject and emphasizes WHO/WHAT is doing something. は marks the topic (often the subject, but not always). が is used for new information; は for known/contextual information.',
    type: 'basic',
    tags: ['japanese', 'grammar', 'particles'],
    isEdited: false,
  },
  {
    id: '3',
    front: '猫が{{c1::魚}}を食べます。',
    back: 'The cat eats fish. (魚 = fish)',
    type: 'cloze',
    tags: ['japanese', 'vocabulary', 'animals'],
    isEdited: false,
  },
  {
    id: '4',
    front: 'What does the particle を (wo/o) mark?',
    back: 'を marks the direct object of a verb — the thing receiving the action. Example: 本を読む (to read a book).',
    type: 'basic',
    tags: ['japanese', 'grammar', 'particles'],
    isEdited: false,
  },
  {
    id: '5',
    front: 'に (ni) particle — 3 main uses',
    back: '1. Location of existence: 部屋にいる (to be in the room)\n2. Direction/destination: 東京に行く (go to Tokyo)\n3. Time: 三時に (at 3 o\'clock)',
    type: 'basic',
    tags: ['japanese', 'grammar', 'particles'],
    isEdited: false,
  },
  {
    id: '6',
    front: 'で (de) particle — 2 main uses',
    back: '1. Location of action: 図書館で勉強する (study at the library)\n2. Means/method: バスで行く (go by bus)',
    type: 'basic',
    tags: ['japanese', 'grammar', 'particles'],
    isEdited: false,
  },
  {
    id: '7',
    front: '{{c1::の}} particle connects two nouns to show possession.',
    back: 'の (no) is the possessive/linking particle. Example: 田中さんの本 (Tanaka\'s book).',
    type: 'cloze',
    tags: ['japanese', 'grammar', 'particles'],
    isEdited: false,
  },
  {
    id: '8',
    front: 'Difference between と (to) and や (ya) for listing nouns',
    back: 'と lists items exhaustively: AとB = A and B (complete list).\nや lists items non-exhaustively: AやB = A and B (among other things).',
    type: 'basic-reversed',
    tags: ['japanese', 'grammar', 'particles'],
    isEdited: false,
  },
]

export const MOCK_NOTE_CONTENT = `# Japanese Particles — Quick Reference

Particles are postpositions in Japanese that indicate grammatical relationships.

## Core Topic/Subject Particles

**は (wa)** — Topic marker. Marks what the sentence is about.
- 私は学生です。 (I am a student.)
- Can mark things that aren't the grammatical subject

**が (ga)** — Subject marker. Emphasizes the doer of an action.
- 猫が魚を食べた。 (The cat ate the fish.)
- Used for new information, contrast, or questions like "who"

## Object & Location Particles

**を (wo)** — Direct object marker. Marks what receives the action.
- 本を読む。 (Read a book.)

**に (ni)** — Direction, location of existence, time.
- 東京に行く (go to Tokyo)
- 部屋にいる (be in the room)
- 三時に起きる (wake up at 3)

**で (de)** — Location of action, means/instrument.
- 図書館で勉強する (study at the library)
- バスで行く (go by bus)

## Connecting Particles

**の (no)** — Possession / noun modification.
- 田中さんの本 (Tanaka's book)

**と (to)** — Exhaustive "and" for listing nouns.
**や (ya)** — Non-exhaustive "and" (among other things).
`
