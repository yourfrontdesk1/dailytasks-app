'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: number
  dueDate: string | null
  dueTime: string | null
  recurring: string | null
  categoryId: string | null
  categoryColour?: string
  categoryName?: string
}

interface Category {
  id: string
  name: string
  colour: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState(2)
  const [newCategory, setNewCategory] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newRecurring, setNewRecurring] = useState('')
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('today')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
    fetchCategories()
  }, [filter])

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?filter=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch {}
    setLoading(false)
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) setCategories(await res.json())
    } catch {}
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          priority: newPriority,
          categoryId: newCategory || null,
          dueDate: newDueDate || new Date().toISOString().split('T')[0],
          recurring: newRecurring || null,
        }),
      })
      setNewTitle('')
      setNewPriority(2)
      setNewCategory('')
      setNewDueDate('')
      setNewRecurring('')
      fetchTasks()
    } catch {}
  }

  const toggleTask = async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    try {
      await fetch(`/api/tasks/${id}/toggle`, { method: 'PATCH' })
    } catch {}
  }

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    } catch {}
  }

  const PRIORITY_LABELS: Record<number, string> = { 1: 'High', 2: 'Medium', 3: 'Low' }
  const PRIORITY_COLOURS: Record<number, string> = { 1: 'var(--priority-high)', 2: 'var(--priority-medium)', 3: 'var(--priority-low)' }
  const FILTERS = ['today', 'all', 'upcoming', 'completed'] as const

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Tasks</h1>

      {/* Filters */}
      <div className="flex gap-1 mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs capitalize"
            style={{
              background: filter === f ? 'var(--brand)' : 'var(--bg-card)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? 'var(--brand)' : 'var(--border)'}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Add task form */}
      <form onSubmit={addTask} className="rounded-xl border p-4 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="New task..."
          className="w-full text-sm outline-none mb-3"
          style={{ background: 'transparent', color: 'var(--text-primary)' }}
        />
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority */}
          <select
            value={newPriority}
            onChange={e => setNewPriority(Number(e.target.value))}
            className="text-xs px-2 py-1 rounded-lg border outline-none"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value={1}>High</option>
            <option value={2}>Medium</option>
            <option value={3}>Low</option>
          </select>

          {/* Category */}
          {categories.length > 0 && (
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="text-xs px-2 py-1 rounded-lg border outline-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {/* Due date */}
          <input
            type="date"
            value={newDueDate}
            onChange={e => setNewDueDate(e.target.value)}
            className="text-xs px-2 py-1 rounded-lg border outline-none"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />

          {/* Recurring */}
          <select
            value={newRecurring}
            onChange={e => setNewRecurring(e.target.value)}
            className="text-xs px-2 py-1 rounded-lg border outline-none"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="">Once</option>
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="ml-auto px-4 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-30"
            style={{ background: 'var(--brand)' }}
          >
            Add
          </button>
        </div>
      </form>

      {/* Task list */}
      <div className="space-y-1">
        {tasks.map(task => (
          <div
            key={task.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border group"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLOURS[task.priority] }} />
            <button
              onClick={() => toggleTask(task.id)}
              className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
              style={{
                borderColor: task.completed ? 'var(--success)' : 'var(--border)',
                background: task.completed ? 'var(--success)' : 'transparent',
              }}
            >
              {task.completed && <span className="text-white text-[8px]">✓</span>}
            </button>
            {task.categoryColour && (
              <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: task.categoryColour }} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{
                color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                textDecoration: task.completed ? 'line-through' : 'none',
              }}>
                {task.title}
              </p>
              <div className="flex items-center gap-2">
                {task.recurring && (
                  <span className="text-[10px]" style={{ color: 'var(--brand)' }}>↻ {task.recurring}</span>
                )}
                {task.dueDate && (
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{task.dueDate}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-xs p-1 transition-opacity"
              style={{ color: 'var(--danger)' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {!loading && tasks.length === 0 && (
        <p className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>
          No tasks here. Add one above.
        </p>
      )}
    </div>
  )
}
