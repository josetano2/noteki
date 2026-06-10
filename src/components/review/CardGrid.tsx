import type { AnkiCard } from '@/types'
import { CardItem } from './CardItem'

interface CardGridProps {
  cards: AnkiCard[]
  onUpdate: (id: string, changes: Partial<AnkiCard>) => void
  onDelete: (id: string) => void
}

export function CardGrid({ cards, onUpdate, onDelete }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  )
}
