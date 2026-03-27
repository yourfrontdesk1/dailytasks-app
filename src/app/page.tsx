import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            DailyTasks<span style={{ color: 'var(--brand)' }}>.ai</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 rounded-lg font-medium text-white"
            style={{ background: 'var(--brand)' }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl">
          <h1
            className="text-5xl font-bold tracking-tight mb-4"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Commit to your day.
            <br />
            See the truth at night.
          </h1>
          <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            DailyTasks.ai is a daily accountability system. Plan your morning. Execute your day. Review your night. One score tells you how you did.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--brand)' }}
            >
              Start free
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg text-sm font-medium border"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
            >
              Log in
            </Link>
          </div>

          {/* Score preview */}
          <div className="mt-16 inline-block">
            <div
              className="rounded-2xl p-8 border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Today's score</p>
              <p className="text-6xl font-bold" style={{ color: 'var(--brand)' }}>71%</p>
              <p className="text-sm mt-2" style={{ color: 'var(--warning)' }}>🔥 7 day streak</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Powered by YourFrontDesk
        </p>
      </footer>
    </div>
  )
}
