# noteki

Convert study notes into Anki flashcards using Claude AI.

Live at [noteki.josetano.dev](https://noteki.josetano.dev).

## What it does

Paste your study notes, hit generate — Claude reads them and creates structured Anki cards automatically. Notes are split into batches and processed sequentially, so large note sets are resilient to partial failures and cards appear in real time as each batch finishes. Cards are exported directly into Anki via AnkiConnect.

## Card format

Each card is generated with:

- **Front** — the grammar point or vocabulary
- **Back** — meaning, grammatical pattern, and 4–5 natural example sentences with English translations

Cards are styled with dark-themed HTML so they render correctly in Anki's night mode out of the box.

## Architecture

- **Frontend** — Vite/React SPA, served as static files via Nginx in production
- **Backend** — a small Express server ([server/](server)) that holds the Claude API key and proxies generation requests, streaming progress back to the browser over SSE
- **Anki export** — happens directly from your browser to AnkiConnect on your own machine; the backend/VPS never touches your Anki data

The frontend never has access to the Claude API key — it only ever talks to the backend, which is the only thing that calls Anthropic.

## Local development

### Prerequisites

- [Anki](https://apps.ankiweb.net/) with the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on installed
- An [Anthropic API key](https://console.anthropic.com) (separate from Claude Pro — requires API credits)
- Node.js

### Setup

Install dependencies for both the frontend and backend:

```bash
npm install
cd server && npm install && cd ..
```

Create a `.env` file in the project root:

```
CLAUDE_API_KEY=sk-ant-...
```

Run the backend and frontend (two terminals):

```bash
cd server && npm run dev
```
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to the backend and `/anki` to AnkiConnect.

In **Settings** you can update the AnkiConnect URL (default `http://127.0.0.1:8765`) and hit **Test** to verify Anki is reachable.

## Deployment

Runs on a VPS behind [Caddy](https://caddyserver.com) (automatic HTTPS), as two Docker containers wired together with `docker-compose.yml`:

- `frontend` — built via a multi-stage Dockerfile (Vite build → Nginx), joins the existing reverse-proxy network so Caddy can route to it
- `backend` — the Express server, holds `CLAUDE_API_KEY` as a runtime environment variable from a `.env` file on the VPS (never committed, never baked into the image)

Pushing to `main` triggers [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which SSHs into the VPS, pulls the latest code, and runs `docker compose up -d --build`.

## Usage

1. **Editor** — paste or write your notes in the left panel
2. Set language and any extra context in the right panel
3. Choose a deck (create new or append to existing)
4. Hit **Generate cards** — the activity log shows each batch as it completes and cards appear live in the review panel
5. Review and optionally edit the generated cards — cards already exported are highlighted in yellow
6. Hit **Export to Anki** to push the new cards

Your notes and generated cards are saved in localStorage so refreshing the page won't lose your work or cost another API call.

## Notes

- Single shared Claude API key — anyone with the URL can generate cards using it; there's no per-user auth yet. Keep the URL private if that matters to you.
- AnkiConnect only allows connections from localhost, so **Export to Anki only works when you open the site from the same machine Anki is running on**. AnkiConnect's `webCorsOriginList` config must include the deployed origin (`https://noteki.josetano.dev`) for this to work.
- The grammar registry (`noteki:registry` in localStorage) tracks what has been exported and prevents re-exporting the same cards
- Duplicate detection is handled by the local registry, not Anki's built-in check
