import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnkiCard } from '@/types'

interface CardItemProps {
  card: AnkiCard
  onUpdate: (id: string, changes: Partial<AnkiCard>) => void
  onDelete: (id: string) => void
}


export function CardItem({ card, onUpdate, onDelete }: CardItemProps) {
  const [editing, setEditing] = useState(false)
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)
  const [tagsStr, setTagsStr] = useState(card.tags.join(', '))

  function handleSave() {
    onUpdate(card.id, {
      front: front.trim(),
      back: back.trim(),
      tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
      isEdited: true,
    })
    setEditing(false)
  }

  function handleCancel() {
    setFront(card.front)
    setBack(card.back)
    setTagsStr(card.tags.join(', '))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-primary/50 bg-card p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Front</span>
          <Textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            rows={3}
            className="text-sm font-mono resize-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Back</span>
          <Textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            rows={3}
            className="text-sm font-mono resize-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Tags</span>
          <Input
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="h-8 text-sm font-mono"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleCancel} className="h-7 text-xs gap-1.5">
            <X className="h-3 w-3" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="h-7 text-xs gap-1.5">
            <Check className="h-3 w-3" /> Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'group rounded-lg border bg-card p-4 flex flex-col gap-3 transition-colors',
      card.isDuplicate
        ? 'border-yellow-600/50 bg-yellow-950/20'
        : 'border-border hover:border-border/80',
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {card.isDuplicate && (
            <Badge className="text-xs px-1.5 py-0 h-5 bg-yellow-600/20 text-yellow-400 border-yellow-600/40">
              already saved
            </Badge>
          )}
          {card.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 h-5 text-muted-foreground">
              {tag}
            </Badge>
          ))}
          {card.isEdited && (
            <span className="text-xs text-muted-foreground italic">edited</span>
          )}
        </div>
        <div className={cn('flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity')}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:text-destructive"
            onClick={() => onDelete(card.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <p className="text-foreground font-medium leading-relaxed">{card.front}</p>
        <Separator className="bg-border" />
        <div
          className="text-muted-foreground leading-relaxed card-back"
          dangerouslySetInnerHTML={{ __html: card.back }}
        />
      </div>
    </div>
  )
}
