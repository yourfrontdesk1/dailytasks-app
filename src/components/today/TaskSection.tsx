'use client'

interface Task {
  id: string
  title: string
  completed: boolean
  priority: number
  dueTime: string | null
  categoryColour?: string
}

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
}

const PRIORITY_COLOURS: Record<number, string> = {
  1: 'var(--priority-high)',
  2: 'var(--priority-medium)',
  3: 'var(--priority-low)',
}

export default function TaskSection({ tasks, onToggle }: Props) {
  if (tasks.length === 0) return null

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          Today's Tasks ({tasks.length})
        </span>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        {tasks.map(task => (
          <div
            key={task.id}
            className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 transition-colors"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Priority dot */}
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: PRIORITY_COLOURS[task.priority] || 'var(--text-secondary)' }}
            />

            {/* Checkbox */}
            <button
              onClick={() => onToggle(task.id)}
              className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
              style={{
                borderColor: task.completed ? 'var(--success)' : 'var(--border)',
                background: task.completed ? 'var(--success)' : 'transparent',
              }}
            >
              {task.completed && <span className="text-white text-[8px]">✓</span>}
            </button>

            {/* Category colour */}
            {task.categoryColour && (
              <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: task.categoryColour }} />
            )}

            {/* Title */}
            <span
              className="flex-1 text-sm"
              style={{
                color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                textDecoration: task.completed ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </span>

            {/* Time */}
            {task.dueTime && (
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {task.dueTime}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
