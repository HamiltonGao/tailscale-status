/**
 * Connection path types
 */

/**
 * The type of connection path between nodes
 */
export enum PathType {
  /** Direct peer-to-peer connection */
  Direct = 'direct',
  /** Relayed through DERP server */
  DERP = 'derp',
  /** Relayed through another peer */
  PeerRelay = 'peer-relay',
  /** Unknown or undetermined */
  Unknown = 'unknown',
}

/**
 * DERP region codes
 */
export type DERPRegion =
  | 'hkg' // Hong Kong
  | 'sin' // Singapore
  | 'tok' // Tokyo
  | 'ord' // Chicago
  | 'lax' // Los Angeles
  | 'sfo' // San Francisco
  | 'nyc' // New York
  | 'ams' // Amsterdam
  | 'fra' // Frankfurt
  | 'lon' // London
  | 'syd' // Sydney
  | 'blr' // Bangalore
  | 'dfw' // Dallas
  | 'ewr' // Newark
  | 'sea' // Seattle
  | 'unknown'

/**
 * Parsed connection path information
 */
export interface ConnectionPath {
  type: PathType
  derpRegion?: DERPRegion
  relayEndpoint?: string
  upgradedToDirect?: boolean
  upgradeDuration?: number
}

/**
 * Display information for a path type
 */
export interface PathDisplay {
  type: PathType
  label: string
  description: string
  color: string
  bgColor: string
  icon: 'direct' | 'relay' | 'server'
}

export const PATH_DISPLAY: Record<PathType, PathDisplay> = {
  [PathType.Direct]: {
    type: PathType.Direct,
    label: 'Direct',
    description: 'Direct peer-to-peer connection',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    icon: 'direct',
  },
  [PathType.DERP]: {
    type: PathType.DERP,
    label: 'DERP',
    description: 'Relayed through DERP server',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: 'server',
  },
  [PathType.PeerRelay]: {
    type: PathType.PeerRelay,
    label: 'Relay',
    description: 'Relayed through peer node',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    icon: 'relay',
  },
  [PathType.Unknown]: {
    type: PathType.Unknown,
    label: 'Unknown',
    description: 'Connection type unknown',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    icon: 'direct',
  },
}
