'use client'

interface PipelineAction {
  id: string
  name: string
  pipelineName: string
  nextAction: string
  overdueDays: number
}

interface Props {
  actions: PipelineAction[]
}

export default function PipelineSection({ actions }: Props) {
  return (
    <section className="mb-6">
      <span className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>
        Pipeline Actions ({actions.length})
      </span>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        {actions.map(a => (
          <div
            key={a.id}
            className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: a.overdueDays > 0 ? 'var(--danger)' : 'var(--warning)' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.nextAction}</p>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: a.overdueDays > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
              {a.overdueDays > 0 ? `${a.overdueDays} day${a.overdueDays !== 1 ? 's' : ''}` : 'today'}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
