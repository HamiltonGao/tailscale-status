'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { formatLatency } from '@/lib/utils'

interface LatencyPoint {
  timestamp: string | number
  latency: number
  nodeCount?: number
}

interface NodeBasic {
  id: string
  name: string
}

interface NodeLatencyData {
  nodeId: string
  nodeName: string
  data?: LatencyPoint[]
  avgLatency?: number
}

interface PingTrendChartProps {
  nodes: NodeBasic[]
  allNodesData: LatencyPoint[]
  nodeLatencyData: NodeLatencyData[]
  selectedNodeId: string
  height?: number
  timeRangeLabel?: string
  hideHeader?: boolean
}

export function PingTrendChart({ nodes, allNodesData, nodeLatencyData, selectedNodeId, height = 280, timeRangeLabel = '24h', hideHeader = false }: PingTrendChartProps) {
  // Get current data based on selection (controlled from parent)
  const currentData = selectedNodeId === 'all'
    ? (allNodesData || [])
    : (nodeLatencyData.find(n => n.nodeId === selectedNodeId)?.data || [])

  const currentNodeName = selectedNodeId === 'all'
    ? 'All Nodes (Average)'
    : nodeLatencyData.find(n => n.nodeId === selectedNodeId)?.nodeName || ''

  // Debug: log data state
  console.log('[PingTrendChart] selectedNodeId:', selectedNodeId, 'currentData length:', currentData.length, 'allNodesData:', allNodesData?.length, 'nodeLatencyData:', nodeLatencyData?.length)

  // Format time for X-axis
  const formatTime = (timestamp: string | number) => {
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null

    const data = payload[0].payload
    return (
      <div className="card border-border-default shadow-floating p-3">
        <p className="text-small text-text-secondary mb-1">
          {new Date(data.timestamp).toLocaleString()}
        </p>
        <p className="text-body font-semibold text-text-primary">
          Latency: {formatLatency(data.latency)}
        </p>
        {selectedNodeId === 'all' && data.nodeCount && (
          <p className="text-tiny text-text-secondary">
            Nodes: {data.nodeCount}
          </p>
        )}
      </div>
    )
  }

  // Calculate thresholds - dynamic Y axis based on data
  const latencies = currentData.map((d) => d.latency || 0)
  const avgLatency =
    latencies.reduce((a, b) => a + b, 0) / latencies.length || 0
  const dataMax = latencies.length > 0 ? Math.max(...latencies) : 100
  const dataMin = latencies.length > 0 ? Math.min(...latencies) : 0
  // Add some padding to min/max for better visualization
  const yAxisMax = Math.ceil((dataMax * 1.2) / 10) * 10
  const yAxisMin = Math.max(0, Math.floor((dataMin * 0.8) / 5) * 5)

  // Get color based on selection
  const getColor = () => {
    if (selectedNodeId === 'all') return '#2dd4bf' // teal
    // Use different colors for different nodes
    const nodeIndex = nodeLatencyData.findIndex(n => n.nodeId === selectedNodeId)
    const colors = ['#2dd4bf', '#8b5cf6', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899']
    return colors[nodeIndex % colors.length]
  }

  const chartColor = getColor()

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header with title */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-h4 font-semibold text-text-primary">
            Ping Latency Trend {timeRangeLabel}
          </h3>
          {selectedNodeId !== 'all' && (
            <span className="text-tiny text-text-secondary">
              {currentNodeName}
            </span>
          )}
        </div>
      )}

      {/* Chart - explicit height to ensure it renders */}
      <div style={{ height: `${height}px`, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={currentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => `${v}ms`}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[yAxisMin, yAxisMax]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avgLatency}
              stroke="#8b5cf6"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{
                value: `Avg: ${formatLatency(avgLatency)}`,
                position: 'insideTopRight',
                fill: '#8b5cf6',
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="latency"
              stroke={chartColor}
              strokeWidth={2}
              fill="url(#latencyGradient)"
              activeDot={{ r: 4, fill: chartColor, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
