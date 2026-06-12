import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchDeckNames } from '@/lib/ankiconnect'
import { usePreferences } from '@/context/PreferencesContext'
import { useSettings } from '@/context/SettingsContext'
import type { DeckAction } from '@/types'

export function DeckPanel() {
  const { deckConfig, setDeckConfig } = usePreferences()
  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [ankiError, setAnkiError] = useState<string | null>(null)

  async function refreshDecks() {
    setLoading(true)
    setAnkiError(null)
    try {
      const decks = await fetchDeckNames(settings.ankiConnectUrl)
      setDeckConfig({ ...deckConfig, existingDecks: decks })
    } catch (err) {
      setAnkiError(err instanceof Error ? err.message : 'Could not reach AnkiConnect')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshDecks()
  }, [])

  function setAction(action: DeckAction) {
    setDeckConfig({ ...deckConfig, action })
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Action</Label>
        <div className="flex gap-1 p-1 rounded-md bg-secondary w-fit">
          {(['create', 'append'] as DeckAction[]).map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => setAction(action)}
              className={cn(
                'px-3 py-1 text-sm rounded transition-colors capitalize',
                deckConfig.action === action
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {action === 'create' ? 'New deck' : 'Append'}
            </button>
          ))}
        </div>
      </div>

      {deckConfig.action === 'create' ? (
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Deck name</Label>
          <Input
            value={deckConfig.deckName}
            onChange={(e) => setDeckConfig({ ...deckConfig, deckName: e.target.value })}
            placeholder="e.g. Japanese::N5"
            className="h-8 text-sm"
          />
          {deckConfig.deckName && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="outline" className="text-xs">New</Badge>
              <span className="text-xs text-muted-foreground">{deckConfig.deckName}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Existing deck</Label>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={refreshDecks}
              disabled={loading}
            >
              <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
            </Button>
          </div>
          <Select
            value={deckConfig.deckName}
            onValueChange={(v) => v && setDeckConfig({ ...deckConfig, deckName: v })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select a deck..." />
            </SelectTrigger>
            <SelectContent>
              {deckConfig.existingDecks.map((deck) => (
                <SelectItem key={deck} value={deck}>{deck}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {ankiError && (
        <p className="text-xs text-destructive">
          Anki not reachable — open Anki with AnkiConnect installed.
        </p>
      )}

      {deckConfig.deckName && !ankiError && (
        <p className="text-xs text-muted-foreground">
          Cards will be added to <span className="text-foreground font-mono">{deckConfig.deckName}</span>
        </p>
      )}
    </div>
  )
}
