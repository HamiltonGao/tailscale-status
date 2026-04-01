/**
 * Tailscale Integration
 * Uses tailscale CLI to ping nodes via DERP relay
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { upsertNode, recordNodeStatus, recordPingResult, createSystemEvent, getAllNodes } from '@/db/queries'

const execAsync = promisify(exec)

// Configuration
const PING_TIMEOUT_MS = parseInt(process.env.PING_TIMEOUT_MS || '5000')

// Socket path for tailscale CLI
const TS_SOCKET = '/tmp/tailscaled.sock'

/**
 * Execute tailscale CLI command via socket
 */
async function tailscaleCmd(args: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`tailscale ${args}`, {
      timeout: 30000,
      env: {
        ...process.env,
        TS_SOCKET,
        TS_STATE_DIR: process.env.TS_STATE_DIR || '/var/lib/tailscale',
      },
    })
    return stdout.trim()
  } catch (error) {
    throw new Error(`Tailscale command failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Ping a node using tailscale ping via DERP relay
 */
async function pingNode(target: string): Promise<{
  latency: number
  reachable: boolean
  connectionType?: string
}> {
  try {
    // Build the command with proper shell handling
    const cmd = `TS_SOCKET=${TS_SOCKET} tailscale ping --timeout=5s ${target}`
    const { stdout, stderr } = await execAsync(cmd, {
      timeout: PING_TIMEOUT_MS + 2000,
      env: {
        ...process.env,
        TS_SOCKET,
      },
      shell: '/bin/sh',
    })

    const output = stdout + stderr

    // Parse output: "pong from ... in 800ms"
    const latencyMatch = output.match(/in\s+(\d+\.?\d*)ms/i)
    const viaMatch = output.match(/via\s+(?:DERP\()?(\w+)/i)

    if (latencyMatch) {
      const latency = parseFloat(latencyMatch[1])

      // Timeout-level latency is unreachable
      if (latency >= 5000) {
        return { latency, reachable: false }
      }

      // Determine connection type
      let connectionType: string | undefined
      if (viaMatch) {
        const via = viaMatch[1].toLowerCase()
        if (via.includes('derp') || via.includes('relay')) {
          connectionType = 'relay'
        } else if (via.includes('direct')) {
          connectionType = 'direct'
        }
      }

      // Infer from latency if not specified
      if (!connectionType) {
        connectionType = latency < 150 ? 'direct' : 'relay'
      }

      return { latency, reachable: true, connectionType }
    }

    // Check for failure
    if (output.includes('no answer') || output.includes('0 packets received')) {
      return { latency: PING_TIMEOUT_MS, reachable: false }
    }

    console.warn(`[Tailscale] Unknown ping output: ${output}`)
    return { latency: PING_TIMEOUT_MS, reachable: false }
  } catch (error: any) {
    // Even if command fails (non-zero exit), try to parse output
    const output = error.stdout || error.stderr || ''
    const latencyMatch = output.match(/in\s+(\d+\.?\d*)ms/i)
    const viaMatch = output.match(/via\s+(?:DERP\()?(\w+)/i)

    if (latencyMatch) {
      const latency = parseFloat(latencyMatch[1])
      const connectionType = viaMatch?.[1]?.toLowerCase()?.includes('derp') ? 'relay' : 'direct'
      return { latency, reachable: true, connectionType }
    }

    console.warn(`[Tailscale] Ping failed for ${target}: ${error.message}`)
    return { latency: PING_TIMEOUT_MS, reachable: false }
  }
}

/**
 * Run ping tests from current node to all other nodes
 */
export async function runPingTests(sourceNodeId?: string) {
  try {
    const nodes = await getAllNodes()
    const sourceNode = sourceNodeId ? nodes.find((n) => n.id === sourceNodeId) : nodes[0]

    if (!sourceNode) {
      throw new Error('Source node not found')
    }

    const targets = nodes.filter((n) => n.id !== sourceNode.id)

    let successCount = 0
    let failCount = 0

    for (const target of targets) {
      const pingTarget = target.hostname || target.tailscaleIp
      console.log(`[Tailscale] Pinging ${pingTarget}...`)
      const result = await pingNode(pingTarget)

      await recordPingResult({
        sourceNodeId: sourceNode.id,
        targetNodeId: target.id,
        latencyMs: result.latency,
        isReachable: result.reachable,
        connectionType: result.connectionType,
        timestamp: new Date(),
      })

      if (result.reachable) {
        successCount++
        console.log(`[Tailscale] ${pingTarget}: ${result.latency}ms (${result.connectionType})`)
      } else {
        failCount++
        console.log(`[Tailscale] ${pingTarget}: timeout`)

        await createSystemEvent({
          type: 'high_latency',
          nodeId: target.id,
          severity: 'warning',
          message: `Node ${target.name} is unreachable from ${sourceNode.name}`,
          metadata: JSON.stringify({ source: sourceNode.id, latency: result.latency }),
          timestamp: new Date(),
        })
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return {
      sourceNodeId: sourceNode.id,
      targetCount: targets.length,
      successCount,
      failCount,
    }
  } catch (error) {
    console.error('Failed to run ping tests:', error)
    throw error
  }
}

/**
 * Sync nodes from Tailscale to database (via API)
 */
export async function syncNodesFromTailscale() {
  try {
    const API_KEY = process.env.TAILSCALE_API_KEY || ''
    const TAILNET = process.env.TAILSCALE_TAILNET || ''

    if (!API_KEY || !TAILNET) {
      throw new Error('TAILSCALE_API_KEY and TAILSCALE_TAILNET not configured')
    }

    const response = await fetch(
      `https://api.tailscale.com/api/v2/tailnet/${TAILNET}/devices`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Tailscale API error: ${response.status}`)
    }

    const data = await response.json() as { devices: any[] }
    const apiNodes = data.devices

    let synced = 0
    for (const device of apiNodes) {
      // Determine online status based on connectedToControl and lastSeen
      const lastSeenDate = new Date(device.lastSeen)
      const isOnline = device.connectedToControl &&
        (Date.now() - lastSeenDate.getTime()) < 5 * 60 * 1000 // 5 minutes threshold

      await upsertNode({
        id: device.id,
        name: device.name,
        hostname: device.name,
        tailscaleIp: device.addresses[0],
        os: device.os || 'unknown',
        tags: JSON.stringify(device.tags || []),
        lastSeen: lastSeenDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await recordNodeStatus({
        nodeId: device.id,
        isOnline: isOnline,
        timestamp: new Date(),
      })

      synced++
    }

    console.log(`[Tailscale] Synced ${synced} nodes`)
    return { synced, total: apiNodes.length }
  } catch (error) {
    console.error('Failed to sync nodes:', error)
    throw error
  }
}

/**
 * Initialize - sync nodes first
 */
export async function initializeTailscaleIntegration() {
  try {
    await syncNodesFromTailscale()
    console.log('Tailscale integration initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Tailscale integration:', error)
    throw error
  }
}
