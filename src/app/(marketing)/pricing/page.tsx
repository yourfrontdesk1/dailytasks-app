import Link from 'next/link'

const FEATURES = [
  { feature: 'Tasks', free: '50 max', pro: 'Unlimited' },
  { feature: 'Pipelines', free: '1 board, 3 stages', pro: 'Unlimited' },
  { feature: 'Calendar', free: 'Full', pro: 'Full' },
  { feature: 'Email Drafts', free: 'Manual only', pro: 'AI powered' },
  { feature: 'Nutrition', free: 'Manual entry', pro: 'AI estimation + photo' },
  { feature: 'Fitness', free: 'Yes/no logging', pro: 'AI parsing + insights' },
  { feature: 'Daily Score', free: 'Basic', pro: 'Full' },
  { feature: 'Weekly Report', free: '—', pro: '✓' },
  { feature: 'Pattern Insights', free: '—', pro: '✓' },
  { feature: 'Nudges', free: '1/day', pro: '3/day, customisable' },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/" className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          DailyTasks<span style={{ color: 'var(--brand)' }}>.ai</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Log in</Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-lg font-medium text-white" style={{ background: 'var(--brand)' }}>
            Get started
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Simple pricing
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Free to start. Pro when you're ready.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Free */}
          <div className="rounded-2xl border p-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Free</p>
            <p className="text-4xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>$0</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Forever</p>
            <Link
              href="/signup"
              className="block text-center py-3 rounded-xl text-sm font-medium border mb-6"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Start free
            </Link>
            <ul className="space-y-2">
              {FEATURES.map(f => (
                <li key={f.feature} className="flex items-center gap-2 text-sm">
                  <span style={{ color: f.free === '—' ? 'var(--text-secondary)' : 'var(--success)' }}>
                    {f.free === '—' ? '—' : '✓'}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>{f.feature}:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{f.free}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 p-8 relative" style={{ borderColor: 'var(--brand)', background: 'var(--bg-card)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-medium text-white" style={{ background: 'var(--brand)' }}>
              Most popular
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--brand)' }}>Pro</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>$12</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>/month</span>
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Everything, unlimited</p>
            <Link
              href="/signup"
              className="block text-center py-3 rounded-xl text-sm font-medium text-white mb-6"
              style={{ background: 'var(--brand)' }}
            >
              Start Pro
            </Link>
            <ul className="space-y-2">
              {FEATURES.map(f => (
                <li key={f.feature} className="flex items-center gap-2 text-sm">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span style={{ color: 'var(--text-primary)' }}>{f.feature}:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{f.pro}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="px-6 py-4 border-t text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Powered by YourFrontDesk</p>
      </footer>
    </div>
  )
}
