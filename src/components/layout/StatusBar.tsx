import { useGeneration } from '@/context/GenerationContext'
import { useSettings } from '@/context/SettingsContext'
import { useEffect, useState } from 'react'
import { fetchDeckNames } from '@/lib/ankiconnect'

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function StatusBar() {
  const { noteContent, cards, status } = useGeneration()
  const { settings } = useSettings()
  const [ankiConnected, setAnkiConnected] = useState<boolean | null>(null)

  useEffect(() => {
    fetchDeckNames(settings.ankiConnectUrl)
      .then(() => setAnkiConnected(true))
      .catch(() => setAnkiConnected(false))
  }, [settings.ankiConnectUrl])

  const words = wordCount(noteContent)
  const chars = noteContent.length

  return (
    <footer className="flex items-center justify-between h-6 px-4 border-t border-border text-xs text-muted-foreground shrink-0 select-none">
      <div className="flex items-center gap-3">
        <span>{words} words</span>
        <span>{chars} chars</span>
        {status === 'done' && cards.length > 0 && (
          <span className="text-primary">{cards.length} cards generated</span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor:
              ankiConnected === null ? '#52525b' : ankiConnected ? '#22c55e' : '#71717a',
          }}
        />
        <span>AnkiConnect</span>
      </div>
    </footer>
  )
}
