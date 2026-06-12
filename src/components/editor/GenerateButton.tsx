import { useGeneration } from '@/context/GenerationContext'
import { Button } from '@/components/ui/button'

export function GenerateButton() {
  const { noteContent, status, error, generate } = useGeneration()
  const disabled = !noteContent.trim() || status === 'generating'

  return (
    <div className="p-4 border-t border-border flex flex-col gap-2">
      {status === 'error' && error && (
        <p className="text-xs text-destructive wrap-break-word">{error}</p>
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
            Generating
          </span>
        ) : (
          'Generate cards'
        )}
      </Button>
    </div>
  )
}
