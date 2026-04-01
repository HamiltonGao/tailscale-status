/**
 * Dashboard specific types
 */

import { Probe } from './probe'

/**
 * KPI metrics for dashboard overview
 */
export interface DashboardKPI {
  totalNodes: number
  onlineNodes: number
  offlineNodes: number
  avgLatency: number
  recentIssues: number
  directRatio: number
  lastSync?: Date | string
}

/**
 * Chart data types
 */
export interface TimeSeriesData {
  timestamp: string | number
  value: number
  label?: string
}

export interface LatencyTrendPoint {
  timestamp: string | number
  latency: number
  nodeCount?: number
}

export interface PathDistribution {
  direct: number
  derp: number
  peerRelay: number
  total: number
}

export interface OnlineTrendPoint {
  timestamp: string | number
  online: number
  offline?: number
  count?: number
}

export interface LatencyBuckets {
  excellent: number
  good: number
  fair: number
  poor: number
  bad: number
}

export interface NodeStabilityRanking {
  nodeId: string
  nodeName: string
  uptime: number
  avgLatency: number
  totalPings: number
}

/**
 * Node ranking for leaderboards
 */
export interface NodeRanking {
  nodeId: string
  nodeName: string
  value: number
  change?: number
}

/**
 * Issue or alert summary
 */
export interface Issue {
  id: string
  type: 'offline' | 'high-latency' | 'path-flapping' | 'timeout'
  nodeId: string
  nodeName: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  timestamp: Date | string
  resolved: boolean
}

/**
 * Dashboard overview data
 */
export interface DashboardData {
  kpi: DashboardKPI
  latencyTrend: LatencyTrendPoint[]
  latencyBuckets: LatencyBuckets
  onlineTrend: OnlineTrendPoint[]
  stabilityRanking: NodeStabilityRanking[]
  nodeLatencyData?: NodeLatencyData[]
}

/**
 * Per-node latency data for charts
 */
export interface NodeLatencyData {
  nodeId: string
  nodeName: string
  avgLatency: number
  data: Array<{
    timestamp: number
    latency: number
  }>
}

/**
 * Node list item
 */
export interface NodeListItem {
  id: string
  name: string
  hostname?: string
  tailscale_ip: string
  os: string
  tags: string[]
  is_online: boolean
  last_seen?: Date
  created_at?: Date
  currentPath?: string
  stats?: {
    avgLatency: number
    totalPings: number
    successfulPings: number
  }
  // Legacy support
  node?: {
    id: string
    name: string
    hostname: string
    tailscale_ip: string
    os: string
    tags: string[]
    is_online: boolean
    last_seen_at: Date
    created_at: Date
  }
  currentLatency?: number | null
}

/**
 * Node detail data
 */
export interface NodeDetail {
  node: {
    id: string
    name: string
    hostname?: string
    tailscale_ip: string
    os: string
    tags: string[]
    last_seen?: Date
    created_at: Date
  }
  statusHistory: Array<{
    timestamp: number
    isOnline: boolean
  }>
  stats: {
    asSource: {
      avgLatency: number
      totalPings: number
      successfulPings: number
    }
    asTarget: {
      avgLatency: number
      totalPings: number
      successfulPings: number
    }
  }
  pingResults: Array<{
    targetNodeId: string
    targetNodeName: string
    toTarget: Array<{
      timestamp: number
      latency: number
      isReachable: boolean
      connectionType?: string
    }>
    fromTarget: Array<{
      timestamp: number
      latency: number
      isReachable: boolean
      connectionType?: string
    }>
  }>
}
