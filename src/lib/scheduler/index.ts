/**
 * Background task scheduler for Tailscale monitoring
 * Runs periodic sync and ping tasks
 */

import { syncNodesFromTailscale, runPingTests } from '@/lib/tailscale'
import { cleanupOldData } from '@/db/queries'

const NODE_SYNC_INTERVAL_MS = (parseInt(process.env.NODE_SYNC_INTERVAL_SEC || '10')) * 1000
const PING_INTERVAL_MS = (parseInt(process.env.PING_POLLING_INTERVAL_SEC || '30')) * 1000
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000 // Daily

let nodeSyncTimer: NodeJS.Timeout | null = null
let pingTimer: NodeJS.Timeout | null = null
let cleanupTimer: NodeJS.Timeout | null = null
let isInitialized = false

/**
 * Run node sync task
 */
async function runNodeSync() {
  try {
    console.log('[Scheduler] Running node sync...')
    const result = await syncNodesFromTailscale()
    console.log(`[Scheduler] Node sync completed: ${result.synced}/${result.total} nodes`)
  } catch (error) {
    console.error('[Scheduler] Node sync failed:', error)
  }
}

/**
 * Run ping task
 */
async function runPingTask() {
  try {
    console.log('[Scheduler] Running ping tests...')
    const result = await runPingTests()
    console.log(`[Scheduler] Ping tests completed: ${result.successCount}/${result.targetCount} successful`)
  } catch (error) {
    console.error('[Scheduler] Ping tests failed:', error)
  }
}

/**
 * Run cleanup task
 */
async function runCleanupTask() {
  try {
    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '30')
    console.log(`[Scheduler] Running cleanup (retention: ${retentionDays} days)...`)
    await cleanupOldData(retentionDays)
    console.log('[Scheduler] Cleanup completed')
  } catch (error) {
    console.error('[Scheduler] Cleanup failed:', error)
  }
}

/**
 * Start the scheduler
 */
export function startScheduler() {
  if (isInitialized) {
    console.log('[Scheduler] Already initialized')
    return
  }

  console.log('[Scheduler] Starting background scheduler...')

  // Run initial tasks
  runNodeSync().catch(() => {})
  runPingTask().catch(() => {})

  // Schedule periodic tasks
  nodeSyncTimer = setInterval(runNodeSync, NODE_SYNC_INTERVAL_MS)
  pingTimer = setInterval(runPingTask, PING_INTERVAL_MS)
  cleanupTimer = setInterval(runCleanupTask, CLEANUP_INTERVAL_MS)

  isInitialized = true
  console.log('[Scheduler] Started with intervals:', {
    nodeSync: NODE_SYNC_INTERVAL_MS,
    ping: PING_INTERVAL_MS,
    cleanup: CLEANUP_INTERVAL_MS,
  })
}

/**
 * Stop the scheduler
 */
export function stopScheduler() {
  console.log('[Scheduler] Stopping...')

  if (nodeSyncTimer) {
    clearInterval(nodeSyncTimer)
    nodeSyncTimer = null
  }

  if (pingTimer) {
    clearInterval(pingTimer)
    pingTimer = null
  }

  if (cleanupTimer) {
    clearInterval(cleanupTimer)
    cleanupTimer = null
  }

  isInitialized = false
  console.log('[Scheduler] Stopped')
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    isInitialized,
    nodeSyncInterval: NODE_SYNC_INTERVAL_MS,
    pingInterval: PING_INTERVAL_MS,
    cleanupInterval: CLEANUP_INTERVAL_MS,
  }
}
