'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface LatencyBuckets {
  excellent: number
  good: number
  fair: number
  poor: number
  bad: number
}

interface NodeLatencyData {
  nodeId: string
  nodeName: string
  data?: Array<{ timestamp: string | number; latency: number }>
  avgLatency?: number
}

interface LatencyDistributionProps {
  data: LatencyBuckets
  selectedNodeId: string
  nodeLatencyData: NodeLatencyData[]
  height?: number
}

function getNodeLatencyBuckets(nodeData: Array<{ latency: number }>) {
  const buckets = [
    { range: '< 10ms', min: 0, max: 10, count: 0 },
    { range: '10-50ms', min: 10, max: 50, count: 0 },
    { range: '50-100ms', min: 50, max: 100, count: 0 },
    { range: '100-200ms', min: 100, max: 200, count: 0 },
    { range: '> 200ms', min: 200, max: Infinity, count: 0 },
  ]

  for (const point of nodeData) {
    const latency = point.latency
    for (const bucket of buckets) {
      if (latency >= bucket.min && latency < bucket.max) {
        bucket.count++
        break
      }
    }
  }

  return buckets.map(b => ({ range: b.range, count: b.count }))
}

function formatBuckets(buckets: LatencyBuckets) {
  return [
    { range: '< 10ms', count: buckets.excellent },
    { range: '10-50ms', count: buckets.good },
    { range: '50-100ms', count: buckets.fair },
    { range: '100-200ms', count: buckets.poor },
    { range: '> 200ms', count: buckets.bad },
  ]
}

const getBarColor = (range: string) => {
  if (range.includes('< 10')) return '#22c55e'
  if (range.includes('10-50')) return '#2dd4bf'
  if (range.includes('50-100')) return '#f59e0b'
  if (range.includes('100-200')) return '#f97316'
  return '#ef4444'
}

export function LatencyDistribution({ data, selectedNodeId, nodeLatencyData }: LatencyDistributionProps) {
  // Get data based on selection
  let chartData = formatBuckets(data)

  if (selectedNodeId !== 'all') {
    const nodeData = nodeLatencyData.find(n => n.nodeId === selectedNodeId)
    if (nodeData && nodeData.data) {
      chartData = getNodeLatencyBuckets(nodeData.data)
    }
  }

  const maxValue = Math.max(...chartData.map((d) => d.count), 1)

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null

    const data = payload[0].payload
    return (
      <div className="card border-border-default shadow-floating p-3">
        <p className="text-small font-semibold text-text-primary mb-1">
          {data.range}
        </p>
        <p className="text-body text-text-secondary">
          {data.count} measurement{data.count !== 1 ? 's' : ''}
        </p>
      </div>
    )
  }

  const isEmpty = chartData.every((d) => d.count === 0)

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-h4 font-semibold text-text-primary mb-4">
        Latency Distribution
      </h3>
      <div className="flex-1 min-h-[180px]">
        {isEmpty ? (
          <div className="h-full flex items-center justify-center text-text-tertiary text-small">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="range"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.range)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
