import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ArrowLeft, Download } from 'lucide-react'
import { usePreferences } from '@/context/PreferencesContext'
import type { GenerationStatus } from '@/types'

interface ReviewToolbarProps {
  cardCount: number
  onBack: () => void
  onExport: () => void
  exportStatus: GenerationStatus
}

export function ReviewToolbar({ cardCount, onBack, onExport, exportStatus }: ReviewToolbarProps) {
  const { deckConfig } = usePreferences()
  const exporting = exportStatus === 'generating'

  return (
    <div className="flex items-center justify-between h-12 px-4 border-b border-border shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-7 gap-1.5 text-sm pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="h-3.5 w-3.5" />
          Editor
        </Button>
        <Badge variant="secondary" className="text-xs">
          {cardCount} {cardCount === 1 ? 'card' : 'cards'}
        </Badge>
      </div>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="sm"
              onClick={onExport}
              disabled={exporting || cardCount === 0 || !deckConfig.deckName}
              className="h-7 text-sm gap-1.5"
            />
          }
        >
          {exporting ? (
            <>
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              Exporting
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Export to Anki
            </>
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {deckConfig.deckName ? `→ ${deckConfig.deckName}` : 'Select a deck first'}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
