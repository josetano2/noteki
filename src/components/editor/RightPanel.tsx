import { PreferencesPanel } from '@/components/preferences/PreferencesPanel'
import { DeckPanel } from '@/components/deck/DeckPanel'
import { GenerateButton } from './GenerateButton'
import { usePreferences } from '@/context/PreferencesContext'
import { Separator } from '@/components/ui/separator'

export function RightPanel() {
  const { preferences, setPreferences } = usePreferences()

  return (
    <div className="flex flex-col h-full border-l border-border">
      <div className="flex-1 overflow-y-auto">
        <PreferencesPanel preferences={preferences} onChange={setPreferences} />
        <Separator />
        <DeckPanel />
      </div>
      <GenerateButton />
    </div>
  )
}
