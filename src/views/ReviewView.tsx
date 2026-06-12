import { useGeneration } from '@/context/GenerationContext'
import { ReviewToolbar } from '@/components/review/ReviewToolbar'
import { CardGrid } from '@/components/review/CardGrid'
import { XCircle, CheckCircle, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { AnkiCard } from '@/types'

interface ReviewViewProps {
  onBack: () => void
}

export function ReviewView({ onBack }: ReviewViewProps) {
  const { cards, setCards, status, error, exportToAnki } = useGeneration()
  const [banner, setBanner] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  useEffect(() => {
    if (status === 'error' && error) {
      setBanner({ type: 'error', message: error })
    } else if (status === 'done' && !error) {
      setBanner({ type: 'success', message: 'Exported to Anki successfully.' })
      const t = setTimeout(() => setBanner(null), 3000)
      return () => clearTimeout(t)
    } else if (status === 'done' && error) {
      // partial success (skipped duplicates info)
      setBanner({ type: 'success', message: error })
      const t = setTimeout(() => setBanner(null), 4000)
      return () => clearTimeout(t)
    }
  }, [status, error])

  function handleUpdate(id: string, changes: Partial<AnkiCard>) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)))
  }

  function handleDelete(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="flex flex-col h-full">
      <ReviewToolbar
        cardCount={cards.length}
        onBack={onBack}
        onExport={exportToAnki}
        exportStatus={status}
      />

      {banner && (
        <div className={`flex items-center gap-2 px-4 py-2.5 text-sm shrink-0 ${
          banner.type === 'error'
            ? 'bg-destructive/10 text-destructive border-b border-destructive/20'
            : 'bg-green-500/10 text-green-400 border-b border-green-500/20'
        }`}>
          {banner.type === 'error'
            ? <XCircle className="h-4 w-4 shrink-0" />
            : <CheckCircle className="h-4 w-4 shrink-0" />}
          <span className="flex-1">{banner.message}</span>
          <button type="button" onClick={() => setBanner(null)} className="opacity-60 hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {cards.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No cards yet. Go back to the editor and generate some.
          </div>
        ) : (
          <CardGrid cards={cards} onUpdate={handleUpdate} onDelete={handleDelete} />
        )}
      </div>
    </div>
  )
}
