import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PreferencesPanel } from '@/components/preferences/PreferencesPanel'
import { DeckPanel } from '@/components/deck/DeckPanel'
import { GenerateButton } from './GenerateButton'
import { usePreferences } from '@/context/PreferencesContext'

export function RightPanel() {
  const { preferences, setPreferences } = usePreferences()

  return (
    <div className="flex flex-col h-full border-l border-border">
      <Tabs defaultValue="generate" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="h-10 rounded-none border-b border-border bg-transparent px-4 gap-0 justify-start shrink-0">
          <TabsTrigger
            value="generate"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm px-3 py-2 h-full"
          >
            Generate
          </TabsTrigger>
          <TabsTrigger
            value="deck"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm px-3 py-2 h-full"
          >
            Deck
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="generate" className="m-0">
            <PreferencesPanel preferences={preferences} onChange={setPreferences} />
          </TabsContent>
          <TabsContent value="deck" className="m-0">
            <DeckPanel />
          </TabsContent>
        </div>
      </Tabs>
      <GenerateButton />
    </div>
  )
}
