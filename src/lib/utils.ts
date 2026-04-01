import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility for merging Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date as relative time (e.g., "2m ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return past.toLocaleDateString()
}

/**
 * Format latency in ms
 */
export function formatLatency(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 10) return `${ms.toFixed(1)}ms`
  return `${Math.round(ms)}ms`
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format bytes
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}

/**
 * Get status color class based on value
 */
export function getStatusColor(value: number, thresholds: {
  excellent: number
  good: number
  fair: number
}): string {
  if (value >= thresholds.excellent) return 'text-status-online'
  if (value >= thresholds.good) return 'text-status-direct'
  if (value >= thresholds.fair) return 'text-status-derp'
  return 'text-status-offline'
}

/**
 * Calculate percentile from array of numbers
 */
export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[index]
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
