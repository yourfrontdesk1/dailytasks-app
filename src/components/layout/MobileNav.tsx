'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/today', label: 'Today', icon: '◉' },
  { href: '/tasks', label: 'Tasks', icon: '✓' },
  { href: '/nutrition', label: 'Food', icon: '🍎' },
  { href: '/fitness', label: 'Gym', icon: '💪' },
  { href: '/review', label: 'Review', icon: '🌙' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t py-2 md:hidden z-50"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      {TABS.map(tab => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <span className="text-base">{tab.icon}</span>
            <span
              className="text-[10px]"
              style={{ color: active ? 'var(--brand)' : 'var(--text-secondary)', fontWeight: active ? 600 : 400 }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
