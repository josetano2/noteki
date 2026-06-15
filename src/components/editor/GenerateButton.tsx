import { useGeneration } from '@/context/GenerationContext'
import { Button } from '@/components/ui/button'

export function GenerateButton() {
  const { noteContent, status, error, batchProgress, generate } = useGeneration()
  const disabled = !noteContent.trim() || status === 'generating'

  return (
    <div className="p-4 border-t border-border flex flex-col gap-2">
      {status === 'error' && error && (
        <p className="text-xs text-destructive wrap-break-word">{error}</p>
      )}

      {batchProgress && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Batch {batchProgress.current} of {batchProgress.total}</span>
            {batchProgress.failed > 0 && (
              <span className="text-destructive">{batchProgress.failed} failed</span>
            )}
          </div>
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <Button
        onClick={generate}
        disabled={disabled}
        className="w-full h-9 text-sm font-medium"
      >
        {status === 'generating' ? (
          <span className="flex items-center gap-2">
            <span className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
              <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
            </span>
            {batchProgress
              ? `Processing batch ${batchProgress.current} / ${batchProgress.total}…`
              : 'Generating…'}
          </span>
        ) : (
          'Generate cards'
        )}
      </Button>
    </div>
  )
}
