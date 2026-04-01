'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Header } from '@/components/layout'
import { PageContainer, PageHeader } from '@/components/layout'
import { NodeTable } from '@/components/dashboard'
import { getNodes, triggerSync } from '@/lib/api'
import { NodeListItem } from '@/types/dashboard'

export default function NodesPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | undefined>(undefined)
  const [nodes, setNodes] = useState<NodeListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNodes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getNodes(true, 24)
      setNodes(data)
      setLastSync(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nodes')
      console.error('Failed to fetch nodes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNodes()
    // Refresh every 30 seconds
    const interval = setInterval(fetchNodes, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await triggerSync('all')
      await fetchNodes()
    } catch (err) {
      console.error('Failed to refresh:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <>
      <Header lastSync={lastSync} isRefreshing={isRefreshing} onRefresh={handleRefresh} />

      <PageContainer>
        <div className="py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <PageHeader
          title="Nodes"
          description="View and manage all Tailscale nodes in your tailnet"
          actions={
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn btn-secondary"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        />

        {error && (
          <div className="py-4">
            <div className="card bg-error/10 border-error text-error p-4">
              {error}
            </div>
          </div>
        )}

        <div className="py-4">
          <NodeTable nodes={nodes} isLoading={isLoading} />
        </div>
      </PageContainer>
    </>
  )
}
