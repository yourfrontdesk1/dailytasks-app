'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: string
  moduleKey?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/today', label: 'Today', icon: '◉' },
  { href: '/tasks', label: 'Tasks', icon: '✓', moduleKey: 'moduleTasks' },
  { href: '/pipelines', label: 'Pipelines', icon: '◫', moduleKey: 'modulePipelines' },
  { href: '/calendar', label: 'Calendar', icon: '📅', moduleKey: 'moduleCalendar' },
  { href: '/drafts', label: 'Email Drafts', icon: '✉', moduleKey: 'moduleEmailDrafts' },
  { href: '/nutrition', label: 'Nutrition', icon: '🍎', moduleKey: 'moduleNutrition' },
  { href: '/fitness', label: 'Fitness', icon: '💪', moduleKey: 'moduleFitness' },
]

const BOTTOM_ITEMS: NavItem[] = [
  { href: '/review', label: 'Night Review', icon: '🌙' },
  { href: '/report', label: 'Weekly Report', icon: '📊' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
]

interface Props {
  enabledModules?: Record<string, boolean>
  userName?: string
  score?: number
  streak?: number
}

export default function Sidebar({ enabledModules = {}, userName, score, streak }: Props) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter(item => {
    if (!item.moduleKey) return true
    return enabledModules[item.moduleKey] !== false
  })

  return (
    <aside
      className="w-56 h-screen flex flex-col border-r flex-shrink-0"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          DailyTasks<span style={{ color: 'var(--brand)' }}>.ai</span>
        </span>
      </div>

      {/* Score */}
      {score !== undefined && (
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Today</span>
            {streak !== undefined && streak > 0 && (
              <span className="text-xs" style={{ color: 'var(--warning)' }}>🔥{streak}</span>
            )}
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>{score}%</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {visibleItems.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: active ? 'var(--bg-card)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active ? 500 : 400,
              }}
            >
              <span className="w-5 text-center text-xs">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-2 border-t space-y-0.5" style={{ borderColor: 'var(--border)' }}>
        {BOTTOM_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: active ? 'var(--bg-card)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <span className="w-5 text-center text-xs">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* User */}
      {userName && (
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{userName}</p>
        </div>
      )}
    </aside>
  )
}
