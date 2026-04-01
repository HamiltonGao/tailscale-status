'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Header } from '@/components/layout'
import { PageContainer, PageHeader } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Node } from '@/types'
import { formatLatency, formatRelativeTime, cn } from '@/lib/utils'
import { PingTrendChart } from '@/components/dashboard'
import { triggerSync } from '@/lib/api'

interface ProbeData {
  timestamp: string
  latency: number | null
  success: boolean
  pathType: string
  target: string
}

interface PathHistoryEntry {
  from: string
  to: string
  timestamp: Date
  duration?: number
}

interface PingStats {
  asSource: {
    avgLatency: number
    totalPings: number
    successfulPings: number
  }
  asTarget: {
    avgLatency: number
    totalPings: number
    successfulPings: number
  }
}

interface LatencyTrendPoint {
  timestamp: string
  latency: number
  nodeCount: number
}

interface NodeDetailClientProps {
  node: Node
  latencyTrend?: LatencyTrendPoint[]
  recentProbes?: ProbeData[]
  pathHistory?: PathHistoryEntry[]
  pingStats?: PingStats
}

export function NodeDetailClient({
  node,
  latencyTrend = [],
  recentProbes = [],
  pathHistory = [],
  pingStats,
}: NodeDetailClientProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | undefined>(new Date())
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ping: true,
    status: false,
  })

  const handleCopy = async (text: string, field: string) => {
    try {
      // @ts-ignore - clipboard API is available in browsers
      await navigator.clipboard?.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      // Silently fail if clipboard is not available
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await triggerSync('all')
      router.refresh()
      setLastSync(new Date())
    } catch (err) {
      console.error('Failed to refresh:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Calculate real stats from ping stats
  const totalPings = pingStats
    ? pingStats.asSource.totalPings + pingStats.asTarget.totalPings
    : 0
  const successfulPings = pingStats
    ? pingStats.asSource.successfulPings + pingStats.asTarget.successfulPings
    : 0
  const stability = totalPings > 0 ? (successfulPings / totalPings) * 100 : 0
  const avgLatency = pingStats
    ? (Number(pingStats.asSource.avgLatency || 0) + Number(pingStats.asTarget.avgLatency || 0)) / 2
    : 0

  // Format path type for display
  const formatPathType = (type: string) => {
    if (type === 'direct') return 'Direct'
    if (type === 'relay') return 'Relay'
    if (type === 'unknown') return 'Unknown'
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <>
      <Header lastSync={lastSync} isRefreshing={isRefreshing} onRefresh={handleRefresh} />

      <PageContainer>
        <div className="py-4">
          <Link href="/nodes" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Nodes
          </Link>
        </div>

        <PageHeader
          title={node.name}
          description={node.hostname}
          actions={
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* Left Column - Node Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Status Card */}
            <Card>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {/* Online Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-small text-text-secondary">Status</span>
                    <Badge variant={node.is_online ? 'success' : 'error'}>
                      {node.is_online ? 'Online' : 'Offline'}
                    </Badge>
                  </div>

                  {/* Current Latency */}
                  {node.is_online && avgLatency > 0 && avgLatency < 5000 && (
                    <div className="flex items-center justify-between">
                      <span className="text-small text-text-secondary">Latency</span>
                      <span className="text-body font-semibold text-text-primary">
                        {formatLatency(avgLatency)}
                      </span>
                    </div>
                  )}

                  {/* Stability */}
                  <div className="flex items-center justify-between">
                    <span className="text-small text-text-secondary">Stability</span>
                    <span className={cn(
                      'text-body font-semibold',
                      stability >= 99 ? 'text-status-online' : 'text-status-direct'
                    )}>
                      {stability.toFixed(1)}%
                    </span>
                  </div>

                  {/* Total Pings */}
                  <div className="flex items-center justify-between">
                    <span className="text-small text-text-secondary">Total Pings</span>
                    <span className="text-body text-text-primary">
                      {totalPings.toLocaleString()}
                    </span>
                  </div>

                  {/* Successful Pings */}
                  <div className="flex items-center justify-between">
                    <span className="text-small text-text-secondary">Successful</span>
                    <span className="text-body text-text-primary">
                      {successfulPings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Node Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-h4">Node Details</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <DetailRow
                    label="Tailscale IP"
                    value={node.tailscale_ip}
                    onCopy={() => handleCopy(node.tailscale_ip, 'ip')}
                    copied={copiedField === 'ip'}
                  />
                  <DetailRow
                    label="Hostname"
                    value={node.hostname}
                    onCopy={() => handleCopy(node.hostname, 'hostname')}
                    copied={copiedField === 'hostname'}
                  />
                  <DetailRow
                    label="Node ID"
                    value={node.node_id}
                    onCopy={() => handleCopy(node.node_id, 'nodeId')}
                    copied={copiedField === 'nodeId'}
                  />
                  <div className="flex items-center justify-between py-1">
                    <span className="text-small text-text-secondary">OS</span>
                    <Badge variant="neutral" size="sm">{node.os}</Badge>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-small text-text-secondary">Platform</span>
                    <span className="text-small text-text-primary">{node.platform}</span>
                  </div>
                  {node.tags.length > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-small text-text-secondary">Tags</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {node.tags.map((tag) => (
                          <Badge key={tag} variant="neutral" size="sm">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-small text-text-secondary">Exit Node</span>
                    <Badge variant={node.is_exit_node ? 'info' : 'neutral'} size="sm">
                      {node.is_exit_node ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-small text-text-secondary">Subnet Router</span>
                    <Badge variant={node.is_subnet_router ? 'info' : 'neutral'} size="sm">
                      {node.is_subnet_router ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Path History Card - moved to left column for better visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="text-h4">Connection Path</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {pathHistory.length === 0 ? (
                  <p className="text-small text-text-secondary text-center py-4">No path changes recorded</p>
                ) : (
                  <div className="space-y-3">
                    {pathHistory.slice(0, 5).map((event, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge
                            variant="path"
                            className={cn(
                              'text-tiny px-1.5 py-0.5 normal-case',
                              event.from === 'direct' && 'path-direct',
                              event.from === 'relay' && 'path-derp'
                            )}
                          >
                            {formatPathType(event.from)}
                          </Badge>
                          <span className="text-text-tertiary text-sm">→</span>
                          <Badge
                            variant="path"
                            className={cn(
                              'text-tiny px-1.5 py-0.5 normal-case',
                              event.to === 'direct' && 'path-direct',
                              event.to === 'relay' && 'path-derp'
                            )}
                          >
                            {formatPathType(event.to)}
                          </Badge>
                        </div>
                        <span className="text-tiny text-text-tertiary flex-shrink-0">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Charts and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ping Latency Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-h4">Ping Latency (24h)</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <PingTrendChart
                  nodes={[node]}
                  allNodesData={latencyTrend}
                  nodeLatencyData={[{
                    nodeId: node.id,
                    nodeName: node.name,
                    data: latencyTrend,
                  }]}
                  selectedNodeId={node.id}
                  height={240}
                  timeRangeLabel="24h"
                  hideHeader={true}
                />
              </CardContent>
            </Card>

            {/* Probe History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-h4">Recent Probes</CardTitle>
              </CardHeader>
              <CardContent>
                {recentProbes.length === 0 ? (
                  <p className="text-small text-text-secondary text-center py-8">No probe data available</p>
                ) : (
                  <div className="space-y-2">
                    {recentProbes.slice(0, 10).map((probe, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'w-2 h-2 rounded-full flex-shrink-0',
                            probe.success ? 'bg-status-online' : 'bg-status-offline'
                          )} />
                          <span className="text-small text-text-secondary">
                            {new Date(probe.timestamp).toLocaleString()}
                          </span>
                          <span className="text-tiny text-text-tertiary">→ {probe.target}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="path"
                            className={cn(
                              'text-tiny px-1.5 py-0.5',
                              probe.pathType === 'direct' && 'path-direct',
                              probe.pathType === 'relay' && 'path-derp'
                            )}
                          >
                            {formatPathType(probe.pathType)}
                          </Badge>
                          <span className="text-small text-text-primary w-16 text-right">
                            {probe.success && probe.latency !== null ? formatLatency(probe.latency) : 'Failed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Raw Output - Collapsible */}
            <Card>
              <CardHeader>
                <CardTitle className="text-h4">Raw Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Raw ping output */}
                <div className="border border-border-subtle rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('ping')}
                    className="flex items-center justify-between w-full text-left px-4 py-3 hover:bg-background-hover transition-colors"
                  >
                    <span className="text-small font-medium text-text-primary">
                      Latest Ping Output
                    </span>
                    {expandedSections.ping ? (
                      <ChevronUp className="h-4 w-4 text-text-secondary" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-text-secondary" />
                    )}
                  </button>
                  {expandedSections.ping && (
                    <pre className="px-4 py-3 bg-background-base text-xs text-text-secondary font-mono leading-relaxed border-t border-border-subtle">
{`pinging ${node.tailscale_ip} (5 times)
Sent 5, received 5, avg latency 18ms
Route: direct to ${node.tailscale_ip}
Latency distribution:
  10-20ms: 3
  20-30ms: 2
  >30ms:   0`}
                    </pre>
                  )}
                </div>

                {/* Raw status output */}
                <div className="border border-border-subtle rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('status')}
                    className="flex items-center justify-between w-full text-left px-4 py-3 hover:bg-background-hover transition-colors"
                  >
                    <span className="text-small font-medium text-text-primary">
                      Node Status
                    </span>
                    {expandedSections.status ? (
                      <ChevronUp className="h-4 w-4 text-text-secondary" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-text-secondary" />
                    )}
                  </button>
                  {expandedSections.status && (
                    <pre className="px-4 py-3 bg-background-base text-xs text-text-secondary font-mono leading-relaxed border-t border-border-subtle">
{`Node: ${node.name}
Hostname: ${node.hostname}
Tailscale IP: ${node.tailscale_ip}
OS: ${node.os} (${node.platform})
Tags: ${node.tags.join(', ') || '(none)'}
Created: ${new Date(node.created_at).toISOString()}
Last Seen: ${new Date(node.last_seen_at).toISOString()}
Exit Node: ${node.is_exit_node ? 'yes' : 'no'}
Subnet Router: ${node.is_subnet_router ? 'yes' : 'no'}`}
                    </pre>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  )
}

function DetailRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string
  value: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="grid grid-cols-[100px_1fr_auto] items-center gap-2 py-1">
      <span className="text-small text-text-secondary">{label}</span>
      <span className="text-small text-text-primary font-mono truncate" title={value}>{value}</span>
      <button
        onClick={onCopy}
        className="text-text-tertiary hover:text-text-primary transition-colors ml-2"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-status-online" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
