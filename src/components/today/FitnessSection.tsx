'use client'

import Link from 'next/link'

interface FitnessSummary {
  loggedToday: boolean
  weekCompleted: number
  weekTarget: number
}

interface Props {
  summary: FitnessSummary
}

export default function FitnessSection({ summary }: Props) {
  return (
    <section className="mb-6">
      <span className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>
        Fitness
      </span>
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: summary.loggedToday ? 'var(--success)' : 'var(--border)' }}
            />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {summary.loggedToday ? 'Logged today' : 'Not logged today'}
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            This week: {summary.weekCompleted}/{summary.weekTarget}
          </span>
        </div>

        {!summary.loggedToday && (
          <Link
            href="/fitness"
            className="block mt-3 text-center text-xs py-2 rounded-lg border"
            style={{ borderColor: 'var(--border)', color: 'var(--brand)' }}
          >
            + Log workout
          </Link>
        )}
      </div>
    </section>
  )
}
