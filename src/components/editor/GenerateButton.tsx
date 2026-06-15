import { useGeneration } from '@/context/GenerationContext'
import { Button } from '@/components/ui/button'

export function GenerateButton() {
  const { noteContent, status, error, batchProgress, cards, generate } = useGeneration()
  const disabled = !noteContent.trim() || status === 'generating'
  const isGenerating = status === 'generating'

  const pct = batchProgress
    ? Math.round((batchProgress.current / batchProgress.total) * 100)
    : 0

  return (
    <div className="p-4 border-t border-border flex flex-col gap-2">
      {status === 'error' && error && (
        <p className="text-xs text-destructive wrap-break-word">{error}</p>
      )}

      {isGenerating && batchProgress && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-medium text-foreground">
              {cards.length} {cards.length === 1 ? 'card' : 'cards'} created
            </span>
            <span className="text-xs text-muted-foreground">
              batch {batchProgress.current} / {batchProgress.total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <Button
        onClick={generate}
        disabled={disabled}
        className="w-full h-9 text-sm font-medium"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
            </span>
            {batchProgress ? `${pct}% done` : 'Starting…'}
          </span>
        ) : (
          'Generate cards'
        )}
      </Button>
    </div>
  )
}
