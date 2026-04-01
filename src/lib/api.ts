/**
 * API client for Tailscale Dashboard
 */

import { DashboardData, NodeListItem, NodeDetail } from '@/types/dashboard'

const API_BASE = '/api'

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

// Dashboard API
export async function getDashboardData(hours = 24): Promise<DashboardData> {
  return fetchAPI<DashboardData>(`/dashboard?hours=${hours}`)
}

// Nodes API
export async function getNodes(includeStats = true, hours = 24): Promise<NodeListItem[]> {
  return fetchAPI<NodeListItem[]>(`/nodes?includeStats=${includeStats}&hours=${hours}`)
}

export async function getNodeDetail(id: string, hours = 24): Promise<NodeDetail> {
  return fetchAPI<NodeDetail>(`/nodes/${id}?hours=${hours}`)
}

// Events API
export async function getEvents(unresolved = false, limit = 50) {
  return fetchAPI(`/events?unresolved=${unresolved}&limit=${limit}`)
}

export async function resolveEvent(id: number) {
  return fetchAPI('/events', {
    method: 'PATCH',
    body: JSON.stringify({ id }),
  })
}

// Sync API
export async function triggerSync(type: 'all' | 'nodes' | 'ping' = 'all') {
  return fetchAPI(`/sync?type=${type}`, {
    method: 'POST',
  })
}

// Scheduler API
export async function getSchedulerStatus() {
  return fetchAPI('/scheduler')
}

export async function startScheduler() {
  return fetchAPI('/scheduler', {
    method: 'POST',
    body: JSON.stringify({ action: 'start' }),
  })
}

export async function stopScheduler() {
  return fetchAPI('/scheduler', {
    method: 'POST',
    body: JSON.stringify({ action: 'stop' }),
  })
}
