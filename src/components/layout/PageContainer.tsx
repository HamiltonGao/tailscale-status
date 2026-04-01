import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}

export function PageContainer({
  children,
  className,
  fullWidth = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full',
        !fullWidth && 'container max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 py-6',
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-h1 font-semibold text-text-primary">{title}</h1>
        {description && (
          <p className="text-body text-text-secondary">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

interface PageSectionProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
}

export function PageSection({
  children,
  className,
  title,
  description,
}: PageSectionProps) {
  return (
    <section className={cn('py-6', className)}>
      {(title || description) && (
        <div className="mb-4 space-y-1">
          {title && (
            <h2 className="text-h2 font-semibold text-text-primary">{title}</h2>
          )}
          {description && (
            <p className="text-body text-text-secondary">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
