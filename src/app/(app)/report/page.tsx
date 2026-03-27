'use client'

import { useState, useEffect } from 'react'

interface WeeklyData {
  averageScore: number
  streak: number
  tasksCompleted: number
  tasksPlanned: number
  nutritionDaysHit: number
  averageCalories: number
  fitnessCompleted: number
  fitnessTarget: number
  pipelinesClosed: number
  pipelinesOverdue: number
  patterns: string[]
  dailyScores: { date: string; score: number; day: string }[]
}

export default function ReportPage() {
  const [data, setData] = useState<WeeklyData | null>(null)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      const res = await fetch('/api/score/weekly')
      if (res.ok) setData(await res.json())
    } catch {}
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
        <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Weekly Report</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading your weekly report...</p>
      </div>
    )
  }

  const maxScore = Math.max(...data.dailyScores.map(d => d.score), 1)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Your Week in Review</h1>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>{data.averageScore}%</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Avg Score</p>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>🔥{data.streak}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Streak</p>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{data.tasksCompleted}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Tasks Done</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-xl border p-4 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Daily Scores</p>
        <div className="flex items-end justify-between gap-2 h-24">
          {data.dailyScores.map(d => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{d.score}%</p>
              <div className="w-full flex items-end justify-center" style={{ height: '60px' }}>
                <div
                  className="w-full max-w-[32px] rounded-t-md transition-all"
                  style={{
                    height: `${(d.score / maxScore) * 100}%`,
                    background: d.score >= 80 ? 'var(--success)' : d.score >= 50 ? 'var(--warning)' : 'var(--danger)',
                    minHeight: d.score > 0 ? '4px' : '0',
                  }}
                />
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{d.day}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Module breakdowns */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Tasks</p>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {data.tasksCompleted}/{data.tasksPlanned}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            {data.tasksPlanned > 0 ? Math.round((data.tasksCompleted / data.tasksPlanned) * 100) : 0}% completion
          </p>
        </div>
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Nutrition</p>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {data.nutritionDaysHit}/7 days
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            Avg {data.averageCalories} cal/day
          </p>
        </div>
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fitness</p>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {data.fitnessCompleted}/{data.fitnessTarget}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>sessions completed</p>
        </div>
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Pipeline</p>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {data.pipelinesClosed} closed
          </p>
          <p className="text-[10px]" style={{ color: data.pipelinesOverdue > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
            {data.pipelinesOverdue} overdue
          </p>
        </div>
      </div>

      {/* Patterns */}
      {data.patterns.length > 0 && (
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Patterns</p>
          <div className="space-y-2">
            {data.patterns.map((p, i) => (
              <p key={i} className="text-sm" style={{ color: 'var(--text-primary)' }}>{p}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
