import { useGeneration } from '@/context/GenerationContext'
import { ReviewToolbar } from '@/components/review/ReviewToolbar'
import { CardGrid } from '@/components/review/CardGrid'
import type { AnkiCard } from '@/types'

interface ReviewViewProps {
  onBack: () => void
}

export function ReviewView({ onBack }: ReviewViewProps) {
  const { cards, setCards, status, exportToAnki } = useGeneration()

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
