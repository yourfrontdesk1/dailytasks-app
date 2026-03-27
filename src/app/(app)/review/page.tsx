'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ReviewItem {
  id: string
  title: string
  type: 'task' | 'nutrition' | 'fitness' | 'pipeline'
  completed: boolean
}

export default function ReviewPage() {
  const router = useRouter()
  const [completed, setCompleted] = useState<ReviewItem[]>([])
  const [missed, setMissed] = useState<ReviewItem[]>([])
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [step, setStep] = useState<'review' | 'handle' | 'done'>('review')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReview()
  }, [])

  const fetchReview = async () => {
    try {
      const res = await fetch('/api/score/today')
      if (res.ok) {
        const data = await res.json()
        setCompleted(data.completed || [])
        setMissed(data.missed || [])
        setScore(data.score || 0)
        setStreak(data.streak || 0)
      }
    } catch {}
    setLoading(false)
  }

  const handleMoveToTomorrow = async (id: string) => {
    setMissed(prev => prev.filter(m => m.id !== id))
    try {
      await fetch(`/api/tasks/${id}/reschedule`, { method: 'PATCH' })
    } catch {}
  }

  const handleDelete = async (id: string) => {
    setMissed(prev => prev.filter(m => m.id !== id))
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    } catch {}
  }

  const completeReview = async () => {
    try {
      await fetch('/api/score/complete-review', { method: 'POST' })
    } catch {}
    setStep('done')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {step === 'review' && (
        <>
          <div className="text-center mb-8">
            <p className="text-4xl mb-4">{score === 100 ? '🏆' : score >= 80 ? '👏' : score >= 50 ? '🌙' : '😤'}</p>
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Let's close out today
            </h1>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--success)' }}>{completed.length}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Done</p>
            </div>
            <div className="w-px h-10" style={{ background: 'var(--border)' }} />
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: missed.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
                {missed.length}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Remaining</p>
            </div>
            <div className="w-px h-10" style={{ background: 'var(--border)' }} />
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: 'var(--brand)' }}>{score}%</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Score</p>
            </div>
          </div>

          {/* Completed list */}
          {completed.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--success)' }}>Completed</p>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                {completed.map(item => (
                  <div key={item.id} className="flex items-center gap-2 px-4 py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--success)' }}>✓</span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missed list */}
          {missed.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--danger)' }}>Missed</p>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                {missed.map(item => (
                  <div key={item.id} className="flex items-center gap-2 px-4 py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-xs" style={{ color: 'var(--danger)' }}>✗</span>
                    <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => missed.length > 0 ? setStep('handle') : completeReview()}
            className="w-full py-3 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--brand)' }}
          >
            {missed.length > 0 ? 'Handle missed items' : 'Complete review'}
          </button>
        </>
      )}

      {step === 'handle' && (
        <>
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>What about these?</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Move them to tomorrow or drop them.</p>

          <div className="space-y-2 mb-6">
            {missed.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-3 rounded-xl border"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                <button
                  onClick={() => handleMoveToTomorrow(item.id)}
                  className="text-xs px-2.5 py-1 rounded-lg"
                  style={{ color: 'var(--brand)', background: 'var(--bg-secondary)' }}
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs px-2.5 py-1 rounded-lg"
                  style={{ color: 'var(--danger)', background: 'var(--bg-secondary)' }}
                >
                  Drop
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={completeReview}
            className="w-full py-3 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--brand)' }}
          >
            Complete review
          </button>
        </>
      )}

      {step === 'done' && (
        <div className="text-center">
          <p className="text-5xl mb-4">🌙</p>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Day closed</h2>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Score: <span className="font-bold" style={{ color: 'var(--brand)' }}>{score}%</span>
          </p>
          {streak > 0 && (
            <p className="text-sm mb-6" style={{ color: 'var(--warning)' }}>🔥 {streak} day streak</p>
          )}
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Rest up. Tomorrow's a fresh start.
          </p>
          <button
            onClick={() => router.push('/today')}
            className="px-8 py-3 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--success)' }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
