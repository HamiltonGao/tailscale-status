import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-tiny font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-background-elevated text-text-secondary border border-border-subtle',
        success: 'bg-status-online/10 text-status-online',
        error: 'bg-status-offline/10 text-status-offline',
        warning: 'bg-status-derp/10 text-status-derp',
        info: 'bg-blue-500/10 text-blue-400',
        neutral: 'bg-status-unknown/10 text-status-unknown',
        path: '',
      },
      size: {
        default: 'px-2.5 py-0.5',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {props.children}
    </div>
  )
}

export { Badge, badgeVariants }
