'use client'

import { useState, useEffect } from 'react'
import { Activity, Cpu, Network, AlertTriangle, Zap, Monitor } from 'lucide-react'
import { Header } from '@/components/layout'
import { PageContainer, PageHeader } from '@/components/layout'
import { KPICard, PingTrendChart, LatencyDistribution, OnlineTrendChart, StabilityRanking, NodeTable } from '@/components/dashboard'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getDashboardData, getNodes, triggerSync } from '@/lib/api'
import { DashboardData, NodeListItem } from '@/types/dashboard'

// Truncate long device names - extract hostname from FQDN
function truncateDeviceName(name: string, maxLength = 20): string {
  if (name.includes('.')) {
    const hostname = name.split('.')[0]
    if (hostname.length <= maxLength) return hostname
    return hostname.slice(0, maxLength - 2) + '..'
  }
  if (name.length <= maxLength) return name
  return name.slice(0, maxLength - 2) + '..'
}

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | undefined>(undefined)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('all')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [nodes, setNodes] = useState<NodeListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [data, nodesData] = await Promise.all([
        getDashboardData(24),
        getNodes(true, 24),
      ])
      setDashboardData(data)
      // Filter out dashboard-host from the nodes list
      const filteredNodes = nodesData.filter(n => !n.name.includes('dashboard-host'))
      setNodes(filteredNodes)
      setLastSync(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial sync to start scheduler and fetch data
    triggerSync('all').catch(console.error)
    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await triggerSync('all')
      await fetchData()
    } catch (err) {
      console.error('Failed to refresh:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Get selected node info
  const selectedNode = selectedNodeId === 'all' ? null : nodes.find(n => n.id === selectedNodeId)

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-background-base flex items-center justify-center">
        <div className="text-text-secondary">Loading dashboard...</div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-background-base flex items-center justify-center">
        <div className="text-error">Error: {error}</div>
      </div>
    )
  }

  if (!dashboardData) return null

  const { kpi, latencyBuckets, onlineTrend, latencyTrend, stabilityRanking, nodeLatencyData: apiNodeLatencyData } = dashboardData

  // Calculate time range from data - use whichever has more data points
  const allTimestamps = [
    ...latencyTrend.map(t => typeof t.timestamp === 'number' ? t.timestamp : new Date(t.timestamp as string).getTime()),
    ...onlineTrend.map(t => typeof t.timestamp === 'number' ? t.timestamp : new Date(t.timestamp as string).getTime()),
  ]

  const getTimeRangeInfo = () => {
    if (allTimestamps.length === 0) return { label: 'No data', spanMs: 0, filteredLatency: latencyTrend, filteredOnline: onlineTrend }

    const now = Date.now()
    const oldest = Math.min(...allTimestamps)
    const latest = Math.max(...allTimestamps)
    const spanMs = latest - oldest
    const spanMinutes = spanMs / (1000 * 60)
    const spanHours = spanMinutes / 60

    let label: string
    if (spanMinutes < 10) label = 'Last few minutes'
    else if (spanMinutes < 60) label = `Last ${Math.round(spanMinutes)} min`
    else if (spanHours < 2) label = `Last ${Math.round(spanHours * 10) / 10} hours`
    else if (spanHours < 12) label = `Last ${Math.round(spanHours)} hours`
    else label = '24h'

    // Filter data to the actual time range
    const cutoff = oldest - (10 * 60 * 1000) // 10 min before oldest
    const filteredLatency = latencyTrend.filter(t => {
      const ts = typeof t.timestamp === 'number' ? t.timestamp : new Date(t.timestamp as string).getTime()
      return ts >= cutoff
    })
    const filteredOnline = onlineTrend.filter(t => {
      const ts = typeof t.timestamp === 'number' ? t.timestamp : new Date(t.timestamp as string).getTime()
      return ts >= cutoff
    })

    return { label, spanMs, filteredLatency, filteredOnline }
  }

  const { label: timeRangeLabel, filteredLatency, filteredOnline } = getTimeRangeInfo()

  // Transform data for charts - use nodeLatencyData from API
  const nodeLatencyData = apiNodeLatencyData || nodes.map(node => ({
    nodeId: node.id,
    nodeName: node.name,
    avgLatency: node.stats?.avgLatency || 0,
    data: [],
  }))

  const latencyTrendData = filteredLatency.map(t => ({
    timestamp: t.timestamp,
    latency: t.latency,
  }))

  const onlineTrendData = filteredOnline.map(t => ({
    timestamp: t.timestamp,
    online: t.online ?? t.count ?? 0,
    count: t.count ?? 0,
  }))

  return (
    <>
      <Header lastSync={lastSync} isRefreshing={isRefreshing} onRefresh={handleRefresh} />

      <PageContainer>
        <PageHeader
          title="Dashboard"
          description="Overview of your Tailscale tailnet status and performance"
          actions={
            <div className="flex items-center gap-3">
              <span className="text-small text-text-secondary">Device:</span>
              <Select value={selectedNodeId} onValueChange={setSelectedNodeId}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="All devices" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-text-tertiary" />
                      <div>
                        <div className="text-sm font-medium">All Devices</div>
                        <div className="text-tiny text-text-tertiary">Overview of all nodes</div>
                      </div>
                    </div>
                  </SelectItem>
                  {nodes.filter(n => !n.name.includes('dashboard-host')).map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      <div className="flex items-center gap-2 py-1">
                        <span className={`w-2 h-2 rounded-full ${node.is_online ? 'bg-status-online' : 'bg-status-offline'}`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium" title={node.name}>{truncateDeviceName(node.name)}</div>
                          <div className="text-tiny text-text-tertiary">{node.tailscale_ip}</div>
                        </div>
                        {node.tags.length > 0 && (
                          <Badge variant="neutral" size="sm" className="text-tiny">
                            {node.tags.length}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 py-6">
          <KPICard
            title="Total Nodes"
            value={kpi.totalNodes}
            icon={<Cpu className="h-5 w-5" />}
          />
          <KPICard
            title="Online"
            value={kpi.onlineNodes}
            icon={<Activity className="h-5 w-5" />}
            variant="success"
          />
          <KPICard
            title="Offline"
            value={kpi.offlineNodes}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant={kpi.offlineNodes > 0 ? 'error' : 'default'}
          />
          <KPICard
            title="Avg Latency"
            value={kpi.avgLatency}
            unit="ms"
            icon={<Network className="h-5 w-5" />}
          />
          <KPICard
            title="Direct"
            value={kpi.directRatio}
            unit="%"
            icon={<Zap className="h-5 w-5" />}
            variant="success"
          />
        </div>

        {/* Main Chart - Full Width */}
        <div className="py-4">
          <div className="card p-5 flex flex-col" style={{ minHeight: '360px' }}>
            <PingTrendChart
              nodes={nodes}
              allNodesData={latencyTrendData}
              nodeLatencyData={nodeLatencyData}
              selectedNodeId={selectedNodeId}
              timeRangeLabel={timeRangeLabel}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 py-4">
          {/* Latency Distribution */}
          <div className="card p-5 lg:col-span-3">
            <LatencyDistribution
              data={latencyBuckets}
              selectedNodeId={selectedNodeId}
              nodeLatencyData={nodeLatencyData}
            />
          </div>

          {/* Online Trend */}
          <div className="card p-5 lg:col-span-4">
            <OnlineTrendChart
              data={onlineTrendData}
              selectedNodeId={selectedNodeId}
              nodes={nodes}
              timeRangeLabel={timeRangeLabel}
            />
          </div>

          {/* Stability Ranking */}
          <div className="card p-5 lg:col-span-5">
            <StabilityRanking data={stabilityRanking} limit={8} />
          </div>
        </div>

        {/* Node Table */}
        <div className="py-4">
          <NodeTable nodes={nodes} />
        </div>

        {/* Selected node info footer */}
        {selectedNode && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 card px-4 py-3 flex items-center gap-3 shadow-floating border border-border-default">
            <span className={`status-dot ${selectedNode.is_online ? 'online' : 'offline'}`} />
            <span className="text-sm font-medium text-text-primary">{selectedNode.name}</span>
            <span className="text-tiny text-text-secondary">{selectedNode.tailscale_ip}</span>
            <span className="text-text-tertiary">•</span>
            <Badge variant="neutral" size="sm">{selectedNode.os}</Badge>
            <button
              onClick={() => setSelectedNodeId('all')}
              className="ml-auto text-tiny text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-1"
            >
              Clear
              <span className="text-lg">×</span>
            </button>
          </div>
        )}
      </PageContainer>
    </>
  )
}
