'use client'

interface Props {
  greeting: string
  score: number
  streak: number
  completedCount: number
  totalCount: number
}

export default function ScoreHeader({ greeting, score, streak, completedCount, totalCount }: Props) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {greeting}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {totalCount === 0
            ? 'Nothing planned yet'
            : `${completedCount} of ${totalCount} complete`}
        </p>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold" style={{ color: 'var(--brand)' }}>{score}%</span>
          {streak > 0 && (
            <span className="text-sm" style={{ color: 'var(--warning)' }}>🔥{streak}</span>
          )}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>score</p>
      </div>
    </div>
  )
}
