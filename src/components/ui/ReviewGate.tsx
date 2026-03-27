'use client'

import Link from 'next/link'

export default function ReviewGate() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">🌙</p>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Complete last night's review
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          You need to close out yesterday before planning today. No hiding from what you missed.
        </p>
        <Link
          href="/review"
          className="inline-block px-8 py-3 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--brand)' }}
        >
          Start review
        </Link>
      </div>
    </div>
  )
}
