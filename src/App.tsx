import { useState, useCallback } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SettingsProvider } from '@/context/SettingsContext'
import { PreferencesProvider } from '@/context/PreferencesContext'
import { GenerationProvider } from '@/context/GenerationContext'
import { TopBar } from '@/components/layout/TopBar'
import { StatusBar } from '@/components/layout/StatusBar'
import { MainView } from '@/views/MainView'
import { ReviewView } from '@/views/ReviewView'
import { SettingsView } from '@/views/SettingsView'

export type View = 'main' | 'review' | 'settings'

function AppShell() {
  const [view, setView] = useState<View>('main')
  const handleGenerated = useCallback(() => setView('review'), [])

  return (
    <GenerationProvider onGenerated={handleGenerated}>
      <div className="flex flex-col h-full bg-background text-foreground">
        <TopBar view={view} onNavigate={setView} />
        <div className="flex-1 overflow-hidden">
          {view === 'main' && <MainView />}
          {view === 'review' && <ReviewView onBack={() => setView('main')} />}
          {view === 'settings' && <SettingsView />}
        </div>
        <StatusBar />
      </div>
    </GenerationProvider>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <PreferencesProvider>
        <TooltipProvider>
          <AppShell />
        </TooltipProvider>
      </PreferencesProvider>
    </SettingsProvider>
  )
}
