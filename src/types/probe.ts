/**
 * Probe and ping types
 */

import { PathType } from './path'

/**
 * Individual probe result from ping
 */
export interface Probe {
  id: string
  node_id: string
  success: boolean
  latency_ms: number | null
  timeout: boolean
  path_type: PathType
  derp_region: string | null
  relay_endpoint: string | null
  upgraded_to_direct: boolean
  upgrade_duration_ms: number | null
  raw_output: string | null
  measured_at: Date | string
  created_at: Date | string
}

/**
 * Aggregated probe statistics for a node
 */
export interface ProbeStats {
  nodeId: string
  totalProbes: number
  successfulProbes: number
  failedProbes: number
  timeoutProbes: number
  successRate: number
  avgLatency: number | null
  minLatency: number | null
  maxLatency: number | null
  p50Latency: number | null
  p95Latency: number | null
  p99Latency: number | null
  directCount: number
  derpCount: number
  relayCount: number
  directRatio: number
  currentPathType: PathType
  currentLatency: number | null
  lastProbeAt: Date | string | null
  stability: number
}

/**
 * Time series probe data point for charts
 */
export interface ProbeDataPoint {
  timestamp: Date | string
  latency: number | null
  success: boolean
  pathType: PathType
}

/**
 * Latency distribution bucket
 */
export interface LatencyBucket {
  range: string
  min: number
  max: number
  count: number
  percentage: number
}

/**
 * Path transition event
 */
export interface PathTransition {
  from: PathType
  to: PathType
  timestamp: Date | string
  duration?: number
}
