'use client'

import { useState, useEffect } from 'react'

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  duration: number | null
  location: string | null
  notes: string | null
}

interface TaskDue {
  id: string
  title: string
  dueDate: string
  dueTime: string | null
}

export default function CalendarPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tasksDue, setTasksDue] = useState<TaskDue[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('09:00')
  const [newDuration, setNewDuration] = useState('30')

  useEffect(() => {
    fetchDay()
  }, [selectedDate])

  const fetchDay = async () => {
    try {
      const res = await fetch(`/api/meetings?date=${selectedDate}`)
      if (res.ok) {
        const data = await res.json()
        setMeetings(data.meetings || [])
        setTasksDue(data.tasks || [])
      }
    } catch {}
  }

  const addMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          date: selectedDate,
          time: newTime,
          duration: Number(newDuration) || null,
        }),
      })
      setNewTitle('')
      setShowAdd(false)
      fetchDay()
    } catch {}
  }

  const deleteMeeting = async (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id))
    try {
      await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
    } catch {}
  }

  // Generate week dates
  const getWeekDates = () => {
    const current = new Date(selectedDate)
    const dayOfWeek = current.getDay()
    const monday = new Date(current)
    monday.setDate(current.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

    const dates = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }

  const weekDates = getWeekDates()
  const today = new Date().toISOString().split('T')[0]

  // Hours for timeline
  const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7am to 8pm

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Calendar</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
          style={{ background: 'var(--brand)' }}
        >
          + Add meeting
        </button>
      </div>

      {/* Week strip */}
      <div className="flex gap-1 mb-6">
        {weekDates.map(d => {
          const date = new Date(d + 'T12:00:00')
          return (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className="flex-1 py-2 rounded-lg text-center"
              style={{
                background: d === selectedDate ? 'var(--brand)' : d === today ? 'var(--bg-card)' : 'transparent',
                color: d === selectedDate ? 'white' : d === today ? 'var(--brand)' : 'var(--text-secondary)',
                border: `1px solid ${d === selectedDate ? 'var(--brand)' : d === today ? 'var(--brand)' : 'var(--border)'}`,
              }}
            >
              <p className="text-[10px]">{date.toLocaleDateString('en-GB', { weekday: 'short' })}</p>
              <p className="text-sm font-medium">{date.getDate()}</p>
            </button>
          )
        })}
      </div>

      {/* Add meeting form */}
      {showAdd && (
        <form onSubmit={addMeeting} className="rounded-xl border p-4 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Meeting title..."
            autoFocus
            className="w-full text-sm outline-none mb-3"
            style={{ background: 'transparent', color: 'var(--text-primary)' }}
          />
          <div className="flex items-center gap-2">
            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg border outline-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            <input type="number" value={newDuration} onChange={e => setNewDuration(e.target.value)}
              placeholder="min"
              className="w-16 text-xs px-2 py-1.5 rounded-lg border outline-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            <button type="submit" className="ml-auto px-4 py-1.5 rounded-lg text-xs font-medium text-white"
              style={{ background: 'var(--brand)' }}>Add</button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-xs px-2 py-1.5"
              style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {hours.map(hour => {
          const timeStr = `${String(hour).padStart(2, '0')}:00`
          const hourMeetings = meetings.filter(m => m.time.startsWith(String(hour).padStart(2, '0')))
          const hourTasks = tasksDue.filter(t => t.dueTime?.startsWith(String(hour).padStart(2, '0')))

          return (
            <div key={hour} className="flex gap-3 min-h-[48px]">
              <span className="w-12 text-right text-xs pt-1 flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                {timeStr}
              </span>
              <div className="flex-1 border-t pt-1 space-y-1" style={{ borderColor: 'var(--border)' }}>
                {hourMeetings.map(m => (
                  <div
                    key={m.id}
                    className="px-3 py-2 rounded-lg text-xs group flex items-center"
                    style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--brand)' }}
                  >
                    <span className="flex-1">📅 {m.title} ({m.time}{m.duration ? `, ${m.duration}min` : ''})</span>
                    <button
                      onClick={() => deleteMeeting(m.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs"
                      style={{ color: 'var(--danger)' }}
                    >×</button>
                  </div>
                ))}
                {hourTasks.map(t => (
                  <div
                    key={t.id}
                    className="px-3 py-2 rounded-lg text-xs"
                    style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}
                  >
                    ✓ {t.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
