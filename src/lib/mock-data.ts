import { Node, NodeListItem, PathType, DashboardData, OSType } from '@/types'

/**
 * Mock node data for development
 */
export const mockNodes: Node[] = [
  {
    id: '1',
    node_id: 'node_001',
    name: 'server-hk',
    hostname: 'server-hk',
    tailscale_ip: '100.1.0.1',
    os: 'linux' as OSType,
    platform: 'linux-amd64',
    tags: ['tag:prod', 'tag:server'],
    is_online: true,
    last_seen_at: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    is_exit_node: false,
    is_subnet_router: true,
    raw_metadata: null,
    created_at: new Date('2024-01-15'),
    updated_at: new Date(),
  },
  {
    id: '2',
    node_id: 'node_002',
    name: 'nas-home',
    hostname: 'nas-home',
    tailscale_ip: '100.1.0.2',
    os: 'linux' as OSType,
    platform: 'linux-amd64',
    tags: ['tag:nas'],
    is_online: true,
    last_seen_at: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
    is_exit_node: false,
    is_subnet_router: false,
    raw_metadata: null,
    created_at: new Date('2024-01-20'),
    updated_at: new Date(),
  },
  {
    id: '3',
    node_id: 'node_003',
    name: 'laptop-sf',
    hostname: 'macbook-pro',
    tailscale_ip: '100.1.0.3',
    os: 'macOS' as OSType,
    platform: 'darwin-arm64',
    tags: [],
    is_online: true,
    last_seen_at: new Date(Date.now() - 30 * 1000), // 30 seconds ago
    is_exit_node: true,
    is_subnet_router: false,
    raw_metadata: null,
    created_at: new Date('2024-02-01'),
    updated_at: new Date(),
  },
  {
    id: '4',
    node_id: 'node_004',
    name: 'desktop-ny',
    hostname: 'desktop-ny',
    tailscale_ip: '100.1.0.4',
    os: 'windows' as OSType,
    platform: 'windows-amd64',
    tags: [],
    is_online: true,
    last_seen_at: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    is_exit_node: false,
    is_subnet_router: false,
    raw_metadata: null,
    created_at: new Date('2024-02-10'),
    updated_at: new Date(),
  },
  {
    id: '5',
    node_id: 'node_005',
    name: 'pi-cluster-01',
    hostname: 'pi-cluster-01',
    tailscale_ip: '100.1.0.5',
    os: 'linux' as OSType,
    platform: 'linux-arm64',
    tags: ['tag:cluster', 'tag:pi'],
    is_online: true,
    last_seen_at: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
    is_exit_node: false,
    is_subnet_router: false,
    raw_metadata: null,
    created_at: new Date('2024-02-15'),
    updated_at: new Date(),
  },
  {
    id: '6',
    node_id: 'node_006',
    name: 'pi-cluster-02',
    hostname: 'pi-cluster-02',
    tailscale_ip: '100.1.0.6',
    os: 'linux' as OSType,
    platform: 'linux-arm64',
    tags: ['tag:cluster', 'tag:pi'],
    is_online: true,
    last_seen_at: new Date(Date.now() - 3 * 60 * 1000),
    is_exit_node: false,
    is_subnet_router: false,
    raw_metadata: null,
    created_at: new Date('2024-02-15'),
    updated_at: new Date(),
  },
  {
    id: '7',
    node_id: 'node_007',
    name: 'pi-cluster-03',
    hostname: 'pi-cluster-03',
    tailscale_ip: '100.1.0.7',
    os: 'linux' as OSType,
    platform: 'linux-arm64',
    tags: ['tag:cluster', 'tag:pi'],
    is_online: true,
    last_seen_at: new Date(Date.now() - 4 * 60 * 1000),
    is_exit_node: false,
    is_subnet_router: false,
    raw_metadata: null,
    created_at: new Date('2024-02-15'),
    updated_at: new Date(),
  },
  {
    id: '8',
    node_id: 'node_008',
    name: 'android-phone',
    hostname: 'pixel-7',
    tailscale_ip: '100.1.0.8',
    os: 'android' as OSType,
    platform: 'android-arm64',
    tags: [],
    is_online: true,
    last_seen_at: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    is_exit_node: false,
    is_subnet_router: false,
    raw_metadata: null,
    created_at: new Date('2024-03-01'),
    updated_at: new Date(),
  },
  {
    id: '9',
    node_id: 'node_009',
    name: 'iphone-work',
    hostname: 'iphone-15-pro',
    tailscale_ip: '100.1.0.9',
    os: 'ios' as OSType,
    platform: 'ios-arm64',
    tags: [],
    is_online: true,
    last_seen_at: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    is_exit_node: false,
    is_subnet_router: false,
    raw_metadata: null,
    created_at: new Date('2024-03-05'),
    updated_at: new Date(),
  },
  {
    id: '10',
    node_id: 'node_010',
    name: 'backup-server',
    hostname: 'backup-nas',
    tailscale_ip: '100.1.0.10',
    os: 'linux' as OSType,
    platform: 'linux-amd64',
    tags: ['tag:backup'],
    is_online: false,
    last_seen_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    is_exit_node: false,
    is_subnet_router: true,
    raw_metadata: null,
    created_at: new Date('2024-01-25'),
    updated_at: new Date(),
  },
  {
    id: '11',
    node_id: 'node_011',
    name: 'dev-container',
    hostname: 'dev-box',
    tailscale_ip: '100.1.0.11',
    os: 'linux' as OSType,
    platform: 'linux-amd64',
    tags: ['tag:dev'],
    is_online: true,
    last_seen_at: new Date(Date.now() - 1 * 60 * 1000),
    is_exit_node: false,
    is_subnet_router: false,
    raw_metadata: null,
    created_at: new Date('2024-03-10'),
    updated_at: new Date(),
  },
  {
    id: '12',
    node_id: 'node_012',
    name: 'staging-db',
    hostname: 'postgres-primary',
    tailscale_ip: '100.1.0.12',
    os: 'linux' as OSType,
    platform: 'linux-amd64',
    tags: ['tag:db', 'tag:staging'],
    is_online: true,
    last_seen_at: new Date(Date.now() - 2 * 60 * 1000),
    is_exit_node: false,
    is_subnet_router: false,
    raw_metadata: null,
    created_at: new Date('2024-03-12'),
    updated_at: new Date(),
  },
  {
    id: '13',
    node_id: 'node_013',
    name: 'monitoring',
    hostname: 'grafana-server',
    tailscale_ip: '100.1.0.13',
    os: 'linux' as OSType,
    platform: 'linux-amd64',
    tags: ['tag:monitoring'],
    is_online: true,
    last_seen_at: new Date(Date.now() - 1 * 60 * 1000),
    is_exit_node: false,
    is_subnet_router: false,
    raw_metadata: null,
    created_at: new Date('2024-03-15'),
    updated_at: new Date(),
  },
]

/**
 * Mock node list items with path and latency data
 */
export const mockNodeListItems = mockNodes.map((node) => ({
  id: node.id,
  name: node.name,
  hostname: node.hostname,
  tailscale_ip: node.tailscale_ip,
  os: node.os,
  tags: node.tags,
  is_online: node.is_online,
  last_seen: node.last_seen_at,
  created_at: node.created_at,
  stats: {
    avgLatency: node.is_online ? Math.floor(Math.random() * 80) + 5 : 0,
    totalPings: 100,
    successfulPings: 95,
  },
})) as any

/**
 * Mock dashboard data
 */
export const mockDashboardData = {
  kpi: {
    totalNodes: mockNodes.length,
    onlineNodes: mockNodes.filter((n) => n.is_online).length,
    offlineNodes: mockNodes.filter((n) => !n.is_online).length,
    avgLatency: 18,
    recentIssues: 0,
    directRatio: 92,
    lastSync: new Date(Date.now() - 2 * 60 * 1000),
  },
  latencyTrend: generateLatencyTrend(),
  pathDistribution: {
    direct: 92,
    derp: 6,
    peerRelay: 2,
    total: 100,
  },
  latencyBuckets: {
    excellent: 45,
    good: 35,
    fair: 15,
    poor: 4,
    bad: 1,
  },
  onlineTrend: generateOnlineTrend(),
  stabilityRanking: [
    { nodeId: '1', nodeName: 'server-hk', uptime: 99.8, avgLatency: 12.5, totalPings: 100 },
    { nodeId: '2', nodeName: 'nas-home', uptime: 99.5, avgLatency: 8.2, totalPings: 100 },
    { nodeId: '3', nodeName: 'laptop-sf', uptime: 98.2, avgLatency: 25.0, totalPings: 100 },
    { nodeId: '5', nodeName: 'pi-cluster-01', uptime: 97.8, avgLatency: 18.7, totalPings: 100 },
    { nodeId: '6', nodeName: 'pi-cluster-02', uptime: 97.5, avgLatency: 22.3, totalPings: 100 },
  ],
  latencyRanking: [
    { nodeId: '3', nodeName: 'laptop-sf', value: 8 },
    { nodeId: '11', nodeName: 'dev-container', value: 12 },
    { nodeId: '1', nodeName: 'server-hk', value: 15 },
    { nodeId: '2', nodeName: 'nas-home', value: 45 },
    { nodeId: '4', nodeName: 'desktop-ny', value: 52 },
  ],
  recentIssues: [],
}

/**
 * Generate mock latency trend data
 */
function generateLatencyTrend() {
  const data = []
  const now = Date.now()
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000)
    const baseLatency = 15 + Math.sin(i / 4) * 10
    const latency = Math.floor(baseLatency + Math.random() * 15)
    data.push({
      timestamp: timestamp.toISOString(),
      latency,
      nodeCount: 11 + Math.floor(Math.random() * 2),
    })
  }
  return data
}

/**
 * Generate mock online trend data
 */
function generateOnlineTrend() {
  const data = []
  const now = Date.now()
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000)
    data.push({
      timestamp: timestamp.toISOString(),
      online: 11 + Math.floor(Math.random() * 1),
      offline: 1 + Math.floor(Math.random() * 1),
    })
  }
  return data
}

/**
 * Generate mock latency trend data for individual nodes
 */
export function generateNodeLatencyData() {
  return mockNodes.filter(n => n.is_online).map((node) => {
    const data = []
    const now = Date.now()
    // Different base latencies for different nodes to simulate geography
    const baseLatencies: Record<string, number> = {
      'server-hk': 25,      // Hong Kong to current location
      'nas-home': 40,       // Home NAS
      'laptop-sf': 8,       // Local laptop
      'desktop-ny': 45,     // New York desktop
      'pi-cluster-01': 20,
      'pi-cluster-02': 22,
      'pi-cluster-03': 21,
      'android-phone': 35,
      'iphone-work': 12,
      'dev-container': 15,
      'staging-db': 18,
      'monitoring': 16,
    }

    const baseLatency = baseLatencies[node.name] || 20

    for (let i = 48; i >= 0; i--) {
      const timestamp = new Date(now - i * 30 * 60 * 1000) // Every 30 mins
      // Add some randomness and occasional spikes
      const spike = Math.random() > 0.9 ? Math.random() * 30 : 0
      const trend = Math.sin(i / 8) * 5
      const latency = Math.floor(baseLatency + trend + Math.random() * 10 + spike)

      data.push({
        timestamp: timestamp.toISOString(),
        latency,
      })
    }

    return {
      nodeId: node.id,
      nodeName: node.name,
      data,
    }
  })
}
