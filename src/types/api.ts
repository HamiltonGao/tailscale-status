/**
 * API request and response types
 */

import { Node, NodeStatusInfo } from './node'
import { PathType } from './path'
import { Probe, ProbeStats, ProbeDataPoint } from './probe'

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Node list filters
 */
export interface NodeFilters {
  search?: string
  status?: 'online' | 'offline' | 'all'
  os?: string[]
  pathType?: PathType[]
  tags?: string[]
  sortBy?: 'name' | 'status' | 'latency' | 'lastSeen'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Node list response with enriched data
 */
export interface NodeListItem {
  node: Node
  status: NodeStatusInfo
  currentPath: PathType
  currentLatency: number | null
  stability: number
}

/**
 * API Node detail response (different from dashboard NodeDetail)
 */
export interface ApiNodeDetail {
  node: Node
  stats: ProbeStats
  history: ProbeDataPoint[]
  pathHistory: PathHistoryEntry[]
  recentProbes: Probe[]
}

/**
 * Path history entry
 */
export interface PathHistoryEntry {
  timestamp: string
  from: PathType
  to: PathType
  duration?: number
}

/**
 * Settings types
 */
export interface Settings {
  pollingIntervalSec: number
  pingTimeoutMs: number
  dataRetentionDays: number
  debugEnabled: boolean
  showRawOutput: boolean
}

/**
 * Tailscale API device response
 */
export interface TailscaleDevice {
  name: string
  id: string
  addresses: string[]
  os: string
  created: string
  lastSeen: string
  tags: string[]
  hostname: string
  isOnline?: boolean
  isExitNode?: boolean
  isSubnetRouter?: boolean
}
