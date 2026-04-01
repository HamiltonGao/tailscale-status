/**
 * Node types for Tailscale nodes
 */

import { PathType } from './path'

export type OSType = 'linux' | 'macOS' | 'windows' | 'android' | 'ios' | 'unknown'

export type NodeStatus = 'online' | 'offline' | 'unknown'

export type NodeType = 'normal' | 'exit-node' | 'subnet-router' | 'both'

/**
 * Full node entity from database
 */
export interface Node {
  id: string
  node_id: string
  name: string
  hostname: string
  tailscale_ip: string
  os: OSType
  platform: string
  tags: string[]
  is_online: boolean
  last_seen_at: Date | string
  is_exit_node: boolean
  is_subnet_router: boolean
  raw_metadata: Record<string, unknown> | null
  created_at: Date | string
  updated_at: Date | string
}

/**
 * Computed node status for UI
 */
export interface NodeStatusInfo {
  status: NodeStatus
  lastSeen: string
  lastSeenRelative: string
}

/**
 * Node display card data
 */
export interface NodeCard {
  node: Node
  status: NodeStatusInfo
  currentPath?: PathType
  currentLatency?: number
  stability?: number
}
