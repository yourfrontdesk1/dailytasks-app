'use client'

interface Meeting {
  id: string
  title: string
  time: string
  duration: number | null
}

interface Props {
  meetings: Meeting[]
}

export default function MeetingSection({ meetings }: Props) {
  return (
    <section className="mb-6">
      <span className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>
        Meetings ({meetings.length})
      </span>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        {meetings.map(m => (
          <div
            key={m.id}
            className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="text-sm">📅</span>
            <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{m.title}</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {m.time}
              {m.duration ? ` (${m.duration}min)` : ''}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
