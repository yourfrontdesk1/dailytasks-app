'use client'

import { useState, useEffect } from 'react'
import TaskSection from '@/components/today/TaskSection'
import MeetingSection from '@/components/today/MeetingSection'
import PipelineSection from '@/components/today/PipelineSection'
import NutritionSection from '@/components/today/NutritionSection'
import FitnessSection from '@/components/today/FitnessSection'
import ScoreHeader from '@/components/today/ScoreHeader'
import QuickAdd from '@/components/today/QuickAdd'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Working late?'
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

interface Task {
  id: string
  title: string
  completed: boolean
  priority: number
  dueTime: string | null
  categoryColour?: string
  overdueDays?: number
}

interface Meeting {
  id: string
  title: string
  time: string
  duration: number | null
}

interface PipelineAction {
  id: string
  name: string
  pipelineName: string
  nextAction: string
  overdueDays: number
}

interface NutritionSummary {
  caloriesConsumed: number
  calorieTarget: number
  protein: number
  carbs: number
  fat: number
  mealsLogged: number
}

interface FitnessSummary {
  loggedToday: boolean
  weekCompleted: number
  weekTarget: number
}

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [overdue, setOverdue] = useState<Task[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [pipelineActions, setPipelineActions] = useState<PipelineAction[]>([])
  const [nutrition, setNutrition] = useState<NutritionSummary>({
    caloriesConsumed: 0, calorieTarget: 2000, protein: 0, carbs: 0, fat: 0, mealsLogged: 0,
  })
  const [fitness, setFitness] = useState<FitnessSummary>({
    loggedToday: false, weekCompleted: 0, weekTarget: 4,
  })
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchToday()
  }, [])

  const fetchToday = async () => {
    try {
      const res = await fetch('/api/today')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
        setOverdue(data.overdue || [])
        setMeetings(data.meetings || [])
        setPipelineActions(data.pipelineActions || [])
        if (data.nutrition) setNutrition(data.nutrition)
        if (data.fitness) setFitness(data.fitness)
        setScore(data.score || 0)
        setStreak(data.streak || 0)
      }
    } catch {
      // Will work once API is connected
    }
    setLoading(false)
  }

  const toggleTask = async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    setOverdue(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    try {
      await fetch(`/api/tasks/${id}/toggle`, { method: 'PATCH' })
      fetchToday()
    } catch {}
  }

  const addTask = async (title: string) => {
    const tempTask: Task = {
      id: `temp-${Date.now()}`,
      title,
      completed: false,
      priority: 2,
      dueTime: null,
    }
    setTasks(prev => [...prev, tempTask])
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, dueDate: getToday() }),
      })
      fetchToday()
    } catch {}
  }

  const completedCount = [...tasks, ...overdue].filter(t => t.completed).length
  const totalCount = tasks.length + overdue.length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
      {/* Header */}
      <ScoreHeader
        greeting={getGreeting()}
        score={score}
        streak={streak}
        completedCount={completedCount}
        totalCount={totalCount}
      />

      {/* Overdue */}
      {overdue.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--danger)' }}>
              ⚠️ Overdue ({overdue.length})
            </span>
          </div>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--danger)', background: 'var(--bg-card)' }}>
            {overdue.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                  style={{
                    borderColor: task.completed ? 'var(--success)' : 'var(--danger)',
                    background: task.completed ? 'var(--success)' : 'transparent',
                  }}
                >
                  {task.completed && <span className="text-white text-[8px]">✓</span>}
                </button>
                <span
                  className="flex-1 text-sm"
                  style={{
                    color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </span>
                <span className="text-xs" style={{ color: 'var(--danger)' }}>
                  {task.overdueDays} day{task.overdueDays !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Today's Tasks */}
      <TaskSection tasks={tasks} onToggle={toggleTask} />

      {/* Meetings */}
      {meetings.length > 0 && <MeetingSection meetings={meetings} />}

      {/* Pipeline Actions */}
      {pipelineActions.length > 0 && <PipelineSection actions={pipelineActions} />}

      {/* Nutrition */}
      <NutritionSection summary={nutrition} />

      {/* Fitness */}
      <FitnessSection summary={fitness} />

      {/* Quick Add */}
      <QuickAdd onAdd={addTask} />
    </div>
  )
}
