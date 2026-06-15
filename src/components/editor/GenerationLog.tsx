import { useEffect, useRef } from 'react'
import { useGeneration } from '@/context/GenerationContext'
import { cn } from '@/lib/utils'

export function GenerationLog() {
  const { log, status } = useGeneration()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  if (log.length === 0) return null

  return (
    <div className="border-t border-border flex flex-col" style={{ maxHeight: '220px' }}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Activity</span>
        {status === 'generating' && (
          <span className="flex gap-0.5 ml-auto">
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </span>
        )}
      </div>
      <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-0.5 font-mono text-[11px]">
        {log.map((entry) => (
          <div key={entry.id} className="flex gap-2 items-start leading-relaxed">
            <span className="text-muted-foreground/50 shrink-0 select-none">{entry.time}</span>
            <span className={cn(
              entry.type === 'success' && 'text-green-400',
              entry.type === 'error'   && 'text-destructive',
              entry.type === 'card'    && 'text-primary',
              entry.type === 'info'    && 'text-muted-foreground',
            )}>
              {entry.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
