import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { CardPreferences } from '@/types'

interface PreferencesPanelProps {
  preferences: CardPreferences
  onChange: (p: CardPreferences) => void
}

export function PreferencesPanel({ preferences, onChange }: PreferencesPanelProps) {
  function update<K extends keyof CardPreferences>(key: K, value: CardPreferences[K]) {
    onChange({ ...preferences, [key]: value })
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Card type</Label>
        <Select value={preferences.cardType} onValueChange={(v) => v && update('cardType', v as CardPreferences['cardType'])}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="cloze">Cloze deletion</SelectItem>
            <SelectItem value="basic-reversed">Basic + Reversed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Difficulty</Label>
        <Select value={preferences.difficulty} onValueChange={(v) => v && update('difficulty', v as CardPreferences['difficulty'])}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Language</Label>
        <Select value={preferences.language} onValueChange={(v) => v && update('language', v)}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Japanese">Japanese</SelectItem>
            <SelectItem value="Spanish">Spanish</SelectItem>
            <SelectItem value="French">French</SelectItem>
            <SelectItem value="German">German</SelectItem>
            <SelectItem value="Portuguese">Portuguese</SelectItem>
            <SelectItem value="Korean">Korean</SelectItem>
            <SelectItem value="Chinese">Chinese</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Card count</Label>
          <button
            type="button"
            onClick={() => update('dynamicCount', !preferences.dynamicCount)}
            className={cn(
              'text-xs px-2 py-0.5 rounded transition-colors',
              preferences.dynamicCount
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {preferences.dynamicCount ? 'Auto' : preferences.cardCount}
          </button>
        </div>
        {!preferences.dynamicCount && (
          <>
            <Slider
              min={5}
              max={50}
              step={5}
              value={preferences.cardCount}
              onValueChange={(v) => update('cardCount', v as number)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5</span>
              <span>50</span>
            </div>
          </>
        )}
        {preferences.dynamicCount && (
          <p className="text-xs text-muted-foreground">
            Claude decides based on note length and content
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Include tags</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Auto-tag cards from note content</p>
        </div>
        <Switch
          checked={preferences.includeTags}
          onCheckedChange={(v) => update('includeTags', v)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Extra context</Label>
        <Textarea
          value={preferences.context}
          onChange={(e) => update('context', e.target.value)}
          placeholder="Additional instructions for card generation..."
          rows={3}
          className="text-sm resize-none"
        />
      </div>
    </div>
  )
}
