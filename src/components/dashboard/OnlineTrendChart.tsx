'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts'
import { Node } from '@/types'

interface OnlineTrendData {
  timestamp: string | number
  online: number
  offline?: number
  count?: number
}

interface NodeBasic {
  id: string
  name: string
  is_online?: boolean
}

interface OnlineTrendChartProps {
  data: OnlineTrendData[]
  selectedNodeId: string
  nodes: NodeBasic[]
  height?: number
  timeRangeLabel?: string
}

export function OnlineTrendChart({ data, selectedNodeId, nodes, height = 180, timeRangeLabel = '24h' }: OnlineTrendChartProps) {
  const formatTime = (timestamp: string | number) => {
    const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  // Transform data to show percentage or binary status
  // For "all" nodes, show percentage of online nodes (0-100)
  // For individual nodes, show 1 (online) or 0 (offline)
  const chartData = data.map(point => {
    if (selectedNodeId === 'all') {
      // Show percentage online (0-100)
      return {
        timestamp: point.timestamp,
        online: point.online ?? point.count ?? 0,
      }
    } else {
      // Binary for single node
      const isOnline = (point.online ?? point.count ?? 0) > 0 ? 1 : 0
      return {
        timestamp: point.timestamp,
        online: isOnline,
      }
    }
  })

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null

    const data = payload[0].payload
    const isPercentage = selectedNodeId === 'all'
    const isOnline = data.online > 0

    return (
      <div className="card border-border-default shadow-floating p-3">
        <p className="text-small text-text-secondary mb-1">
          {new Date(data.timestamp).toLocaleString()}
        </p>
        <p className="text-body font-semibold flex items-center gap-2">
          {isPercentage ? (
            <>
              <span className="w-2 h-2 rounded-full bg-status-online" />
              {data.online}% Online
            </>
          ) : (
            <>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-status-online' : 'bg-status-offline'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </>
          )}
        </p>
      </div>
    )
  }

  // Determine if we're showing per-node (binary) or aggregate (percentage)
  const isPerNode = selectedNodeId !== 'all'
  const isPercentage = selectedNodeId === 'all'
  const yAxisMax = isPercentage ? 100 : (isPerNode ? 1 : 'auto')

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-h4 font-semibold text-text-primary mb-4">
        Online Status {timeRangeLabel}
      </h3>
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
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
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, yAxisMax]}
              ticks={isPerNode ? [0, 1] : undefined}
              tickFormatter={(v) => {
                if (isPercentage) return `${v}%`
                if (isPerNode) return v === 1 ? 'Online' : 'Offline'
                return v
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="online"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#statusGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
