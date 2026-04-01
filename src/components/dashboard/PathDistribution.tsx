'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { PATH_DISPLAY, PathType } from '@/types'
import { cn } from '@/lib/utils'

interface PathDistributionProps {
  data: {
    direct: number
    derp: number
    peerRelay: number
    total: number
  }
  size?: 'sm' | 'md' | 'lg'
}

const CHART_COLORS = {
  [PathType.Direct]: '#22c55e',
  [PathType.DERP]: '#f59e0b',
  [PathType.PeerRelay]: '#8b5cf6',
}

const SIZE_CONFIG = {
  sm: { height: 180, fontSize: 11 },
  md: { height: 240, fontSize: 12 },
  lg: { height: 300, fontSize: 14 },
}

export function PathDistribution({ data, size = 'md' }: PathDistributionProps) {
  const config = SIZE_CONFIG[size]

  const chartData = [
    {
      name: PATH_DISPLAY[PathType.Direct].label,
      value: data.direct,
      type: PathType.Direct,
    },
    {
      name: PATH_DISPLAY[PathType.DERP].label,
      value: data.derp,
      type: PathType.DERP,
    },
    {
      name: PATH_DISPLAY[PathType.PeerRelay].label,
      value: data.peerRelay,
      type: PathType.PeerRelay,
    },
  ].filter((d) => d.value > 0)

  const percentage = (value: number) => {
    if (data.total === 0) return 0
    return ((value / data.total) * 100).toFixed(1)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null

    const data = payload[0].payload
    return (
      <div className="card border-border-default shadow-floating p-3">
        <p className="text-small font-semibold text-text-primary mb-1">
          {data.name}
        </p>
        <p className="text-body text-text-secondary">
          {data.value} connections ({percentage(data.value)}%)
        </p>
      </div>
    )
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-tiny text-text-secondary">
              {entry.value} ({percentage(entry.payload.value)}%)
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (data.total === 0) {
    return (
      <div
        className="flex items-center justify-center border border-border-subtle rounded-lg bg-background-surface/50"
        style={{ height: config.height }}
      >
        <p className="text-text-tertiary text-small">No path data available</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={config.height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={size === 'sm' ? 40 : size === 'md' ? 60 : 80}
            outerRadius={size === 'sm' ? 60 : size === 'md' ? 80 : 100}
            paddingAngle={2}
            dataKey="value"
            cornerRadius={4}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                stroke="none"
                fill={CHART_COLORS[entry.type as keyof typeof CHART_COLORS]}
                className="transition-opacity duration-150 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
