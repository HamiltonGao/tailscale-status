/**
 * Application constants
 */

import { PathType } from '@/types'

/**
 * Polling intervals in seconds
 */
export const POLLING_INTERVALS = {
  FAST: 30, // 30 seconds
  NORMAL: 60, // 1 minute
  SLOW: 300, // 5 minutes
  VERY_SLOW: 600, // 10 minutes
} as const

/**
 * Ping timeout options in milliseconds
 */
export const PING_TIMEOUTS = {
  FAST: 2000,
  NORMAL: 5000,
  SLOW: 10000,
} as const

/**
 * Data retention options in days
 */
export const DATA_RETENTION_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
] as const

/**
 * Latency thresholds for categorization
 */
export const LATENCY_THRESHOLDS = {
  EXCELLENT: 20, // ms
  GOOD: 50,
  FAIR: 100,
  POOR: 200,
} as const

/**
 * Stability thresholds
 */
export const STABILITY_THRESHOLDS = {
  EXCELLENT: 99, // percentage
  GOOD: 95,
  FAIR: 85,
  POOR: 70,
} as const

/**
 * Chart time ranges
 */
export const TIME_RANGES = [
  { value: '1h', label: '1 hour', seconds: 3600 },
  { value: '6h', label: '6 hours', seconds: 21600 },
  { value: '24h', label: '24 hours', seconds: 86400 },
  { value: '7d', label: '7 days', seconds: 604800 },
  { value: '30d', label: '30 days', seconds: 2592000 },
] as const

/**
 * Latency bucket definitions for distribution chart
 */
export const LATENCY_BUCKETS = [
  { label: '< 20ms', min: 0, max: 20 },
  { label: '20-50ms', min: 20, max: 50 },
  { label: '50-100ms', min: 50, max: 100 },
  { label: '100-200ms', min: 100, max: 200 },
  { label: '200-500ms', min: 200, max: 500 },
  { label: '> 500ms', min: 500, max: Infinity },
] as const

/**
 * Path type labels
 */
export const PATH_LABELS: Record<PathType, string> = {
  [PathType.Direct]: 'Direct',
  [PathType.DERP]: 'DERP',
  [PathType.PeerRelay]: 'Relay',
  [PathType.Unknown]: 'Unknown',
}

/**
 * DERP region names
 */
export const DERP_REGIONS: Record<string, string> = {
  hkg: 'Hong Kong',
  sin: 'Singapore',
  tok: 'Tokyo',
  ord: 'Chicago',
  lax: 'Los Angeles',
  sfo: 'San Francisco',
  nyc: 'New York',
  ams: 'Amsterdam',
  fra: 'Frankfurt',
  lon: 'London',
  syd: 'Sydney',
  blr: 'Bangalore',
  dfw: 'Dallas',
  ewr: 'Newark',
  sea: 'Seattle',
}

/**
 * OS type icons/labels
 */
export const OS_LABELS: Record<string, string> = {
  linux: 'Linux',
  macos: 'macOS',
  windows: 'Windows',
  android: 'Android',
  ios: 'iOS',
  unknown: 'Unknown',
}

/**
 * Navigation items
 */
export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'layout-dashboard' },
  { href: '/nodes', label: 'Nodes', icon: 'servers' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
] as const

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS = {
  pollingIntervalSec: POLLING_INTERVALS.NORMAL,
  pingTimeoutMs: PING_TIMEOUTS.NORMAL,
  dataRetentionDays: 30,
  debugEnabled: false,
  showRawOutput: true,
} as const
