'use client'

import { useState, useEffect } from 'react'

interface FitnessEntry {
  id: string
  date: string
  completed: boolean
  type: string | null
  description: string | null
  parsedData: any
  duration: number | null
}

export default function FitnessPage() {
  const [entries, setEntries] = useState<FitnessEntry[]>([])
  const [todayEntry, setTodayEntry] = useState<FitnessEntry | null>(null)
  const [description, setDescription] = useState('')
  const [workoutType, setWorkoutType] = useState('weights')
  const [duration, setDuration] = useState('')
  const [weekCompleted, setWeekCompleted] = useState(0)
  const [weekTarget, setWeekTarget] = useState(4)
  const [parsing, setParsing] = useState(false)
  const [showLog, setShowLog] = useState(false)

  useEffect(() => {
    fetchFitness()
  }, [])

  const fetchFitness = async () => {
    try {
      const res = await fetch('/api/fitness')
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries || [])
        setTodayEntry(data.todayEntry || null)
        setWeekCompleted(data.weekCompleted || 0)
        setWeekTarget(data.weekTarget || 4)
      }
    } catch {}
  }

  const logWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    setParsing(true)

    try {
      await fetch('/api/fitness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: workoutType,
          description: description || null,
          duration: duration ? Number(duration) : null,
          useAi: !!description,
        }),
      })
      setDescription('')
      setDuration('')
      setShowLog(false)
      fetchFitness()
    } catch {}
    setParsing(false)
  }

  const logRestDay = async () => {
    try {
      await fetch('/api/fitness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: false, type: 'rest' }),
      })
      fetchFitness()
    } catch {}
  }

  const TYPES = ['weights', 'cardio', 'both', 'other']

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Fitness</h1>

      {/* Weekly progress */}
      <div className="rounded-xl border p-5 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>This week</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{weekCompleted}/{weekTarget} sessions</p>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: weekTarget }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-3 rounded-full"
              style={{ background: i < weekCompleted ? 'var(--success)' : 'var(--border)' }}
            />
          ))}
        </div>
      </div>

      {/* Today status */}
      {!todayEntry ? (
        <div className="rounded-xl border p-5 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <p className="text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Did you work out today?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLog(true)}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white"
              style={{ background: 'var(--success)' }}
            >
              💪 Yes, log it
            </button>
            <button
              onClick={logRestDay}
              className="flex-1 py-3 rounded-xl text-sm font-medium border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Rest day
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border p-5 mb-6" style={{ borderColor: 'var(--success)', background: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm" style={{ color: 'var(--success)' }}>✓</span>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {todayEntry.completed ? 'Workout logged' : 'Rest day'}
            </p>
          </div>
          {todayEntry.type && (
            <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{todayEntry.type}</p>
          )}
          {todayEntry.description && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{todayEntry.description}</p>
          )}
          {todayEntry.parsedData && (
            <div className="mt-3 space-y-1">
              {(todayEntry.parsedData as any).exercises?.map((ex: any, i: number) => (
                <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {ex.name}: {ex.sets}x{ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ''}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Log form */}
      {showLog && (
        <form onSubmit={logWorkout} className="rounded-xl border p-4 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <div className="flex gap-1 mb-3">
            {TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setWorkoutType(t)}
                className="flex-1 py-1.5 rounded-lg text-xs capitalize"
                style={{
                  background: workoutType === t ? 'var(--brand)' : 'transparent',
                  color: workoutType === t ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${workoutType === t ? 'var(--brand)' : 'var(--border)'}`,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your workout (e.g. bench press 80kg 4x8, squats 100kg 3x5)"
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none mb-3"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="Duration (min)"
              className="w-32 px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit"
              disabled={parsing}
              className="ml-auto px-6 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--brand)' }}
            >
              {parsing ? 'AI parsing...' : 'Log workout'}
            </button>
          </div>
        </form>
      )}

      {/* History */}
      {entries.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>Recent</p>
          <div className="space-y-1">
            {entries.slice(0, 7).map(entry => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-2 rounded-xl border"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <span className="text-xs" style={{ color: entry.completed ? 'var(--success)' : 'var(--text-secondary)' }}>
                  {entry.completed ? '✓' : '—'}
                </span>
                <span className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                  {entry.type || 'rest'}
                </span>
                <span className="text-xs ml-auto" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(entry.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
