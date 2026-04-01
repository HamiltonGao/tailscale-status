'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NAV_ITEMS } from '@/lib/constants'

interface HeaderProps {
  lastSync?: Date
  isRefreshing?: boolean
  onRefresh?: () => void
}

export function Header({ lastSync, isRefreshing, onRefresh }: HeaderProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background-base/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Logo and Nav */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-500">
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary">
                Tailscale Dashboard
              </span>
              <span className="text-tiny text-text-secondary">Tailnet Overview</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-150 rounded-md ${
                  isActive(item.href)
                    ? 'text-text-primary bg-background-surface'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side - Status and Actions */}
        <div className="flex items-center gap-4">
          {/* Sync status */}
          {lastSync && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary">
              <span className="status-dot online" />
              <span className="hidden lg:inline">
                Last sync: {relativeTime(lastSync)}
              </span>
              <span className="lg:hidden">
                {relativeTimeShort(lastSync)}
              </span>
            </div>
          )}

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 w-8"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>

          {/* Settings link */}
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

function relativeTime(date: Date): string {
  const now = new Date()
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSecs < 60) return `${diffSecs}s ago`
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  return `${diffHours}h ago`
}

function relativeTimeShort(date: Date): string {
  const now = new Date()
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSecs < 60) return `${diffSecs}s`
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  return `${diffHours}h`
}
