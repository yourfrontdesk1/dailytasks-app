'use client'

import { useState } from 'react'

interface Props {
  feature: string
  message: string
}

export default function UpgradePrompt({ feature, message }: Props) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {}
    setLoading(false)
  }

  return (
    <div className="rounded-xl border p-5 text-center" style={{ borderColor: 'var(--brand)', background: 'var(--bg-card)' }}>
      <p className="text-2xl mb-2">🔒</p>
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Pro feature</p>
      <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="px-6 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
        style={{ background: 'var(--brand)' }}
      >
        {loading ? 'Loading...' : 'Upgrade to Pro ($12/mo)'}
      </button>
    </div>
  )
}
