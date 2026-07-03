import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { splitIntoBatches, generateBatch } from './cards.js'

const apiKey = process.env.CLAUDE_API_KEY
if (!apiKey) throw new Error('CLAUDE_API_KEY is not set')

const client = new Anthropic({ apiKey })
const app = express()
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.post('/api/generate-cards', async (req, res) => {
  const { noteContent, preferences } = req.body ?? {}
  if (typeof noteContent !== 'string' || !noteContent.trim()) {
    return res.status(400).json({ error: 'noteContent is required' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (event, data) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  const batches = splitIntoBatches(noteContent)

  try {
    for (let i = 0; i < batches.length; i++) {
      send('batch-start', { current: i + 1, total: batches.length })
      const cards = await generateBatch(client, batches[i], preferences ?? {}, (chars) => {
        send('batch-progress', { chars, current: i + 1 })
      })
      send('batch-done', { cards, current: i + 1, total: batches.length })
    }
    send('done', {})
  } catch (err) {
    send('error', { message: err instanceof Error ? err.message : 'Generation failed' })
  } finally {
    res.end()
  }
})

const port = process.env.PORT || 8787
app.listen(port, () => console.log(`noteki server listening on :${port}`))
