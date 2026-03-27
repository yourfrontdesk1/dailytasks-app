'use client'

import Link from 'next/link'

interface NutritionSummary {
  caloriesConsumed: number
  calorieTarget: number
  protein: number
  carbs: number
  fat: number
  mealsLogged: number
}

interface Props {
  summary: NutritionSummary
}

export default function NutritionSection({ summary }: Props) {
  const percent = summary.calorieTarget > 0
    ? Math.min(Math.round((summary.caloriesConsumed / summary.calorieTarget) * 100), 100)
    : 0

  return (
    <section className="mb-6">
      <span className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>
        Nutrition
      </span>
      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {summary.caloriesConsumed.toLocaleString()} / {summary.calorieTarget.toLocaleString()} cals
          </span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{percent}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full mb-3" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              background: percent > 100 ? 'var(--danger)' : percent > 80 ? 'var(--success)' : 'var(--brand)',
            }}
          />
        </div>

        {/* Macro bars */}
        <div className="flex gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>P: {summary.protein}g</span>
          <span>C: {summary.carbs}g</span>
          <span>F: {summary.fat}g</span>
        </div>

        <Link
          href="/nutrition"
          className="block mt-3 text-center text-xs py-2 rounded-lg border"
          style={{ borderColor: 'var(--border)', color: 'var(--brand)' }}
        >
          + Log meal
        </Link>
      </div>
    </section>
  )
}
