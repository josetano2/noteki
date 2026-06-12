# noteki

Convert study notes into Anki flashcards using Claude AI.

## What it does

Paste your study notes, hit generate — Claude reads them and creates structured Anki cards automatically. Cards are exported directly into Anki via AnkiConnect. Duplicates are detected and skipped so you never pay for the same card twice.

## Card format

Each card is generated with:

- **Front** — the grammar point or concept
- **Back** — meaning, pattern, and 2–3 examples with English translations

## Setup

### Prerequisites

- [Anki](https://apps.ankiweb.net/) with the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on installed
- An [Anthropic API key](https://console.anthropic.com) (separate from Claude Pro)

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Configure

Go to **Settings** and fill in:

- **Claude API Key** — your `sk-ant-...` key from console.anthropic.com
- **AnkiConnect URL** — leave as `http://127.0.0.1:8765` unless you changed the default

Hit **Test** to verify Anki is reachable.

## Usage

1. **Editor** — paste or write your notes in the left panel
2. Set language and any extra instructions in the right panel
3. Choose a deck (create new or append to existing)
4. Hit **Generate cards** and wait for Claude to process
5. Review the generated cards — cards already in your collection are highlighted in yellow
6. Hit **Export to Anki** to push them

Your notes and generated cards are saved in localStorage so refreshing the page won't lose your work or cost another API call.

## Notes

- Personal local tool — do not deploy publicly with your API key
- AnkiConnect only allows connections from localhost; the dev server proxies requests automatically to avoid CORS issues
- The grammar registry (`noteki:registry` in localStorage) tracks exported cards to flag future duplicates
