import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  sparkline?: ReactNode
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function KPICard({
  title,
  value,
  unit,
  icon,
  trend,
  sparkline,
  className,
  variant = 'default',
}: KPICardProps) {
  const variantStyles = {
    default: 'text-text-primary',
    success: 'text-status-online',
    warning: 'text-status-derp',
    error: 'text-status-offline',
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-small text-text-secondary">{title}</p>
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  'text-2xl font-semibold tracking-tight',
                  variantStyles[variant]
                )}
              >
                {value}
              </span>
              {unit && (
                <span className="text-small text-text-secondary">{unit}</span>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-1 text-tiny">
                <span
                  className={cn(
                    'font-medium',
                    trend.isPositive
                      ? 'text-status-online'
                      : 'text-status-offline'
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="text-text-tertiary">vs last period</span>
              </div>
            )}
          </div>

          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background-hover text-text-secondary">
              {icon}
            </div>
          )}
        </div>

        {sparkline && (
          <div className="absolute bottom-0 right-0 left-0 h-12 opacity-30">
            {sparkline}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
