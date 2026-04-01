'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, Filter, ArrowUpDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { NodeListItem, PathType, PATH_DISPLAY } from '@/types'
import { formatLatency, formatRelativeTime, cn } from '@/lib/utils'

interface NodeTableProps {
  nodes: NodeListItem[]
  className?: string
  isLoading?: boolean
}

type SortField = 'name' | 'status' | 'latency' | 'lastSeen'
type SortOrder = 'asc' | 'desc'

// Truncate long device names - extract hostname from FQDN
function truncateDeviceName(name: string, maxLength = 24): string {
  // If name contains a dot, it's likely a FQDN - extract just the hostname
  if (name.includes('.')) {
    const hostname = name.split('.')[0]
    if (hostname.length <= maxLength) return hostname
    return hostname.slice(0, maxLength - 2) + '..'
  }
  // No dot - check length
  if (name.length <= maxLength) return name
  return name.slice(0, maxLength - 2) + '..'
}

// Helper to normalize node data
function normalizeNode(item: NodeListItem): {
  id: string
  name: string
  hostname: string
  tailscale_ip: string
  os: string
  is_online: boolean
  last_seen_at: Date
  currentPath?: PathType
  currentLatency: number | null
  tags: string[]
} {
  // Check if it's the old format (nested node object)
  if ('node' in item && 'currentPath' in item) {
    const oldItem = item as any
    return {
      id: oldItem.node.id,
      name: oldItem.node.name,
      hostname: oldItem.node.hostname,
      tailscale_ip: oldItem.node.tailscale_ip,
      os: oldItem.node.os,
      is_online: oldItem.node.is_online,
      last_seen_at: oldItem.node.last_seen_at,
      currentPath: oldItem.currentPath,
      currentLatency: oldItem.currentLatency,
      tags: oldItem.node.tags || [],
    }
  }

  // New format (flat)
  return {
    id: item.id,
    name: item.name,
    hostname: item.hostname || '',
    tailscale_ip: item.tailscale_ip,
    os: item.os || 'unknown',
    is_online: item.is_online,
    last_seen_at: item.last_seen || new Date(),
    currentPath: item.currentPath as any,
    currentLatency: item.stats?.avgLatency ?? null,
    tags: item.tags || [],
  }
}

export function NodeTable({ nodes, className, isLoading }: NodeTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Normalize and filter nodes
  const normalizedNodes = nodes.map(normalizeNode)

  const filteredNodes = normalizedNodes
    .filter((node) => {
      // Search filter
      const matchesSearch =
        search === '' ||
        node.name.toLowerCase().includes(search.toLowerCase()) ||
        node.hostname.toLowerCase().includes(search.toLowerCase()) ||
        node.tailscale_ip.includes(search)

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'online' && node.is_online) ||
        (statusFilter === 'offline' && !node.is_online)

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          comparison = Number(a.is_online) - Number(b.is_online)
          break
        case 'latency':
          comparison = (a.currentLatency ?? 9999) - (b.currentLatency ?? 9999)
          break
        case 'lastSeen':
          comparison =
            new Date(a.last_seen_at).getTime() -
            new Date(b.last_seen_at).getTime()
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const SortHeader = ({
    field,
    children,
  }: {
    field: SortField
    children: React.ReactNode
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-text-primary transition-colors"
    >
      {children}
      {sortField === field && (
        <ArrowUpDown
          className={cn(
            'h-3 w-3 transition-transform',
            sortOrder === 'desc' && 'rotate-180'
          )}
        />
      )}
    </button>
  )

  if (isLoading) {
    return (
      <div className={cn('card p-12 text-center', className)}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-border-default border-t-primary rounded-full animate-spin" />
          <p className="text-text-secondary">Loading nodes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-disabled" />
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(String((e.target as any)?.value ?? ''))}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[40px]"></th>
                <th>
                  <SortHeader field="name">Node Name</SortHeader>
                </th>
                <th className="hidden md:table-cell">IP Address</th>
                <th className="hidden sm:table-cell">OS</th>
                <th>
                  <SortHeader field="status">Status</SortHeader>
                </th>
                <th>
                  <SortHeader field="latency">Latency</SortHeader>
                </th>
                <th className="w-[40px]"></th>
              </tr>
            </thead>
            <tbody>
              {filteredNodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-background-hover flex items-center justify-center">
                        <Search className="h-5 w-5 text-text-disabled" />
                      </div>
                      <p className="text-text-secondary">No nodes found</p>
                      <p className="text-text-tertiary text-small">
                        Try adjusting your filters or search query
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredNodes.map((node) => (
                  <tr key={node.id} className="group">
                    <td>
                      <div
                        className={cn(
                          'status-dot',
                          node.is_online ? 'online' : 'offline'
                        )}
                      />
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary" title={node.name}>
                          {truncateDeviceName(node.name)}
                        </span>
                        <span className="text-tiny text-text-tertiary sm:hidden">
                          {node.tailscale_ip}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-text-secondary">
                      {node.tailscale_ip}
                    </td>
                    <td className="hidden sm:table-cell">
                      <Badge variant="neutral" size="sm">
                        {node.os}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        variant={node.is_online ? 'success' : 'error'}
                        size="sm"
                      >
                        {node.is_online ? 'Online' : 'Offline'}
                      </Badge>
                    </td>
                    <td>
                      {node.currentLatency !== null && node.is_online ? (
                        node.currentLatency >= 5000 ? (
                          <span className="text-small font-medium text-status-offline">
                            timeout
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'text-small font-medium',
                              node.currentLatency < 50 && 'text-status-online',
                              node.currentLatency >= 50 &&
                                node.currentLatency < 100 &&
                                'text-status-direct',
                              node.currentLatency >= 100 && 'text-status-derp'
                            )}
                          >
                            {formatLatency(node.currentLatency)}
                          </span>
                        )
                      ) : (
                        <span className="text-text-tertiary text-tiny">—</span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/nodes/${encodeURIComponent(node.name)}`}
                        className="text-text-tertiary hover:text-text-primary transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-small text-text-secondary">
        <span>
          Showing {filteredNodes.length} of {nodes.length} nodes
        </span>
      </div>
    </div>
  )
}
