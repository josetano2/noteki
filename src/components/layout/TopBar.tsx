import { cn } from '@/lib/utils'
import { useGeneration } from '@/context/GenerationContext'
import type { View } from '@/App'

interface TopBarProps {
  view: View
  onNavigate: (v: View) => void
}

const NAV_ITEMS: { label: string; value: View }[] = [
  { label: 'Editor', value: 'main' },
  { label: 'Review', value: 'review' },
  { label: 'Settings', value: 'settings' },
]

export function TopBar({ view, onNavigate }: TopBarProps) {
  const { status, cards } = useGeneration()

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-border shrink-0">
      <span className="font-mono text-sm font-medium tracking-tight text-foreground select-none">
        noteki
      </span>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onNavigate(item.value)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              view === item.value
                ? 'text-foreground bg-secondary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 w-[72px] justify-end">
        {status === 'generating' && (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Generating
          </span>
        )}
        {status === 'done' && cards.length > 0 && view !== 'review' && (
          <button
            type="button"
            onClick={() => onNavigate('review')}
            className="text-xs text-primary hover:underline"
          >
            {cards.length} cards
          </button>
        )}
      </div>
    </header>
  )
}
