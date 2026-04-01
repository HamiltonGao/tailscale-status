'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, RotateCcw } from 'lucide-react'
import { Header } from '@/components/layout'
import { PageContainer, PageHeader } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { POLLING_INTERVALS, PING_TIMEOUTS, DATA_RETENTION_OPTIONS } from '@/lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Settings {
  pollingIntervalSec: number
  pingTimeoutMs: number
  dataRetentionDays: number
  debugEnabled: boolean
  showRawOutput: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    pollingIntervalSec: POLLING_INTERVALS.NORMAL,
    pingTimeoutMs: PING_TIMEOUTS.NORMAL,
    dataRetentionDays: 30,
    debugEnabled: false,
    showRawOutput: true,
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasChanges(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleReset = () => {
    setSettings({
      pollingIntervalSec: POLLING_INTERVALS.NORMAL,
      pingTimeoutMs: PING_TIMEOUTS.NORMAL,
      dataRetentionDays: 30,
      debugEnabled: false,
      showRawOutput: true,
    })
    setHasChanges(false)
    setSaveSuccess(false)
  }

  return (
    <>
      <Header />

      <PageContainer>
        <div className="py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <PageHeader
          title="Settings"
          description="Configure your Tailscale dashboard preferences"
        />

        <div className="py-4 max-w-3xl">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="polling">Polling</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-h4">Tailscale Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tailnet">Tailnet Name</Label>
                    <Input
                      id="tailnet"
                      placeholder="your-name.tailnet-xxx.ts.net"
                      defaultValue=""
                    />
                    <p className="text-tiny text-text-secondary">
                      Your Tailscale tailnet name for API access
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="tskey-api-xxx..."
                      defaultValue=""
                    />
                    <p className="text-tiny text-text-secondary">
                      Tailscale API key with access to your tailnet
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-h4">Display Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Raw Output</Label>
                      <p className="text-tiny text-text-secondary">
                        Display raw diagnostic information in node details
                      </p>
                    </div>
                    <Switch
                      checked={settings.showRawOutput}
                      onCheckedChange={(checked) => updateSetting('showRawOutput', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="polling" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-h4">Polling Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pollingInterval">Node Sync Interval</Label>
                    <Select
                      value={settings.pollingIntervalSec.toString()}
                      onValueChange={(v) => updateSetting('pollingIntervalSec', Number(v))}
                    >
                      <SelectTrigger id="pollingInterval">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={POLLING_INTERVALS.FAST.toString()}>
                          30 seconds (Fast)
                        </SelectItem>
                        <SelectItem value={POLLING_INTERVALS.NORMAL.toString()}>
                          1 minute (Normal)
                        </SelectItem>
                        <SelectItem value={POLLING_INTERVALS.SLOW.toString()}>
                          5 minutes (Slow)
                        </SelectItem>
                        <SelectItem value={POLLING_INTERVALS.VERY_SLOW.toString()}>
                          10 minutes (Very Slow)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-tiny text-text-secondary">
                      How often to fetch node list from Tailscale
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pingInterval">Ping Polling Interval</Label>
                    <Select defaultValue="60">
                      <SelectTrigger id="pingInterval">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="120">2 minutes</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-tiny text-text-secondary">
                      How often to ping nodes for latency and path detection
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-h4">Ping Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pingTimeout">Ping Timeout</Label>
                    <Select
                      value={settings.pingTimeoutMs.toString()}
                      onValueChange={(v) => updateSetting('pingTimeoutMs', Number(v))}
                    >
                      <SelectTrigger id="pingTimeout">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PING_TIMEOUTS.FAST.toString()}>
                          2 seconds (Fast)
                        </SelectItem>
                        <SelectItem value={PING_TIMEOUTS.NORMAL.toString()}>
                          5 seconds (Normal)
                        </SelectItem>
                        <SelectItem value={PING_TIMEOUTS.SLOW.toString()}>
                          10 seconds (Slow)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-tiny text-text-secondary">
                      Maximum time to wait for ping response
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-h4">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="retention">Data Retention</Label>
                    <Select
                      value={settings.dataRetentionDays.toString()}
                      onValueChange={(v) => updateSetting('dataRetentionDays', Number(v))}
                    >
                      <SelectTrigger id="retention">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DATA_RETENTION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-tiny text-text-secondary">
                      How long to keep historical probe data
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-h4">Debug Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Debug Mode</Label>
                      <p className="text-tiny text-text-secondary">
                        Enable verbose logging for troubleshooting
                      </p>
                    </div>
                    <Switch
                      checked={settings.debugEnabled}
                      onCheckedChange={(checked) => updateSetting('debugEnabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-status-error/20">
                <CardHeader>
                  <CardTitle className="text-h4 text-status-error">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-status-offline">Clear All Data</Label>
                    <p className="text-tiny text-text-secondary">
                      Permanently delete all probe history and reset the database
                    </p>
                    <Button variant="danger" size="sm">
                      Clear All Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Bar */}
          <div className="flex items-center justify-between py-6 border-t border-border-subtle mt-6">
            <Button variant="ghost" onClick={handleReset} disabled={!hasChanges || isSaving}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-tiny text-status-online">Settings saved successfully</span>
              )}
              <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  )
}
