# noteki

Convert study notes into Anki flashcards using Claude AI.

## What it does

Paste your study notes, hit generate — Claude reads them and creates structured Anki cards automatically. Notes are split into batches and processed sequentially, so large note sets are resilient to partial failures and cards appear in real time as each batch finishes. Cards are exported directly into Anki via AnkiConnect.

## Card format

Each card is generated with:

- **Front** — the grammar point or vocabulary
- **Back** — meaning, grammatical pattern, and 4–5 natural example sentences with English translations

Cards are styled with dark-themed HTML so they render correctly in Anki's night mode out of the box.

## Setup

### Prerequisites

- [Anki](https://apps.ankiweb.net/) with the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on installed
- An [Anthropic API key](https://console.anthropic.com) (separate from Claude Pro — requires API credits)

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Configure

Add your Claude API key to a `.env` file in the project root:

```
VITE_CLAUDE_API_KEY=sk-ant-...
```

The key is never stored in localStorage or sent anywhere except directly to Anthropic.

In **Settings** you can also update the AnkiConnect URL (default `http://127.0.0.1:8765`) and hit **Test** to verify Anki is reachable.

## Usage

1. **Editor** — paste or write your notes in the left panel
2. Set language and any extra context in the right panel
3. Choose a deck (create new or append to existing)
4. Hit **Generate cards** — the activity log shows each batch as it completes and cards appear live in the review panel
5. Review and optionally edit the generated cards — cards already exported are highlighted in yellow
6. Hit **Export to Anki** to push the new cards

Your notes and generated cards are saved in localStorage so refreshing the page won't lose your work or cost another API call.

## Notes

- Personal local tool — do not deploy publicly with your API key in `.env`
- AnkiConnect only allows connections from localhost; the dev server proxies requests automatically to avoid CORS issues
- The grammar registry (`noteki:registry` in localStorage) tracks what has been exported and prevents re-exporting the same cards
- Duplicate detection is handled by the local registry, not Anki's built-in check
