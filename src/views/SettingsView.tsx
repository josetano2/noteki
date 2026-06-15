import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { PreferencesPanel } from '@/components/preferences/PreferencesPanel'
import { fetchDeckNames } from '@/lib/ankiconnect'
import { DEFAULT_PREFERENCES } from '@/types'

export function SettingsView() {
  const { settings, updateSettings } = useSettings()
  const [ankiUrl, setAnkiUrl] = useState(settings.ankiConnectUrl)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')

  function saveAnkiUrl() {
    updateSettings({ ankiConnectUrl: ankiUrl })
  }

  async function testConnection() {
    setTestStatus('testing')
    try {
      await fetchDeckNames(ankiUrl)
      setTestStatus('ok')
    } catch {
      setTestStatus('fail')
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-5">

        <div>
          <h1 className="text-lg font-medium text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your API keys and preferences</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">AnkiConnect</CardTitle>
            <CardDescription className="text-xs">Local Anki integration via the AnkiConnect add-on</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Server URL</Label>
              <div className="flex gap-2">
                <Input
                  value={ankiUrl}
                  onChange={(e) => setAnkiUrl(e.target.value)}
                  className="h-8 text-sm font-mono flex-1"
                />
                <Button variant="outline" size="sm" onClick={saveAnkiUrl} className="h-8 text-xs">Save</Button>
                <Button variant="outline" size="sm" onClick={testConnection} disabled={testStatus === 'testing'} className="h-8 text-xs">
                  {testStatus === 'testing' ? 'Testing...' : 'Test'}
                </Button>
              </div>
              {testStatus === 'ok' && (
                <div className="flex items-center gap-1.5 text-xs text-green-500">
                  <CheckCircle className="h-3 w-3" /> Connected
                </div>
              )}
              {testStatus === 'fail' && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <XCircle className="h-3 w-3" /> Could not connect — is Anki running with AnkiConnect installed?
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Default preferences</CardTitle>
            <CardDescription className="text-xs">Used as starting values for new sessions</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <PreferencesPanel
              preferences={settings.defaultPreferences}
              onChange={(p) => updateSettings({ defaultPreferences: p })}
            />
            <div className="px-4 pb-4">
              <Separator className="mb-4" />
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => updateSettings({ defaultPreferences: DEFAULT_PREFERENCES })}
              >
                Reset to defaults
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
