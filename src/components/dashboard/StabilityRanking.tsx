'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StabilityRankingData {
  nodeId: string
  nodeName: string
  uptime: number // percentage
  avgLatency: number
  totalPings: number
}

interface StabilityRankingProps {
  data: StabilityRankingData[]
  limit?: number
}

// Truncate long device names - extract hostname from FQDN
function truncateDeviceName(name: string, maxLength = 16): string {
  if (name.includes('.')) {
    const hostname = name.split('.')[0]
    if (hostname.length <= maxLength) return hostname
    return hostname.slice(0, maxLength - 2) + '..'
  }
  if (name.length <= maxLength) return name
  return name.slice(0, maxLength - 2) + '..'
}

// Format latency - show "timeout" for 5000ms+ values
function formatLatencyDisplay(latency: number): string {
  if (latency >= 5000) return 'timeout'
  return `${latency.toFixed(1)}ms`
}

export function StabilityRanking({ data, limit = 5 }: StabilityRankingProps) {
  const displayData = data.slice(0, limit)

  const getStabilityColor = (value: number) => {
    if (value >= 99) return 'text-status-online'
    if (value >= 95) return 'text-status-direct'
    if (value >= 85) return 'text-status-derp'
    return 'text-status-offline'
  }

  const getBarColor = (value: number) => {
    if (value >= 99) return 'bg-status-online'
    if (value >= 95) return 'bg-status-direct'
    if (value >= 85) return 'bg-status-derp'
    return 'bg-status-offline'
  }

  if (displayData.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <h3 className="text-h4 font-semibold text-text-primary mb-4">
          Node Stability
        </h3>
        <div className="flex-1 flex items-center justify-center text-text-tertiary text-small">
          No data available
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-h4 font-semibold text-text-primary mb-4">
        Node Stability
      </h3>
      <div className="flex-1 space-y-3">
        {displayData.map((node, index) => (
          <div key={node.nodeId} className="space-y-2">
            <div className="flex items-center justify-between text-small">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-tiny text-text-tertiary w-4">
                  {index + 1}.
                </span>
                <span className="text-text-primary truncate" title={node.nodeName}>
                  {truncateDeviceName(node.nodeName)}
                </span>
              </div>
              <span
                className={cn('text-small font-semibold', getStabilityColor(node.uptime))}
              >
                {node.uptime.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-background-input rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', getBarColor(node.uptime))}
                style={{ width: `${node.uptime}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-tiny text-text-secondary">
              <span>Avg: {formatLatencyDisplay(node.avgLatency)}</span>
              <span>{node.totalPings} pings</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
