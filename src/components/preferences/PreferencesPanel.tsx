import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
