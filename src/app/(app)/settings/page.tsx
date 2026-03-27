'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [settings, setSettings] = useState({
    name: '',
    theme: 'dark',
    dayStartTime: '08:00',
    dayEndTime: '18:00',
    moduleTasks: true,
    modulePipelines: false,
    moduleCalendar: false,
    moduleEmailDrafts: false,
    moduleNutrition: false,
    moduleFitness: false,
    calorieTarget: 2000,
    fitnessGoalDays: 4,
    nudgeLevel: 'normal',
    streakThreshold: 80,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/auth/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch {}
  }

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/auth/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      document.documentElement.className = settings.theme
    } catch {}
    setSaving(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const update = (fields: Partial<typeof settings>) => setSettings(prev => ({ ...prev, ...fields }))

  const MODULES = [
    { key: 'moduleTasks' as const, label: 'Tasks' },
    { key: 'modulePipelines' as const, label: 'Pipelines' },
    { key: 'moduleCalendar' as const, label: 'Calendar' },
    { key: 'moduleEmailDrafts' as const, label: 'Email Drafts' },
    { key: 'moduleNutrition' as const, label: 'Nutrition' },
    { key: 'moduleFitness' as const, label: 'Fitness' },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:px-8">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Settings</h1>

      {/* Profile */}
      <div className="rounded-xl border p-4 mb-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <p className="text-xs font-medium uppercase mb-3" style={{ color: 'var(--text-secondary)' }}>Profile</p>
        <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
        <input
          type="text"
          value={settings.name}
          onChange={e => update({ name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg text-sm border outline-none mb-3"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />

        <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Theme</label>
        <div className="flex gap-2">
          {['light', 'dark'].map(t => (
            <button
              key={t}
              onClick={() => update({ theme: t })}
              className="flex-1 py-2 rounded-lg text-xs capitalize border"
              style={{
                background: settings.theme === t ? 'var(--brand)' : 'transparent',
                color: settings.theme === t ? 'white' : 'var(--text-secondary)',
                borderColor: settings.theme === t ? 'var(--brand)' : 'var(--border)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="rounded-xl border p-4 mb-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <p className="text-xs font-medium uppercase mb-3" style={{ color: 'var(--text-secondary)' }}>Schedule</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Day start</label>
            <input type="time" value={settings.dayStartTime} onChange={e => update({ dayStartTime: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Day end</label>
            <input type="time" value={settings.dayEndTime} onChange={e => update({ dayEndTime: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="rounded-xl border p-4 mb-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <p className="text-xs font-medium uppercase mb-3" style={{ color: 'var(--text-secondary)' }}>Modules</p>
        {MODULES.map(m => (
          <div key={m.key} className="flex items-center justify-between py-2">
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{m.label}</span>
            <button
              onClick={() => update({ [m.key]: !settings[m.key] })}
              className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all"
              style={{ background: settings[m.key] ? 'var(--brand)' : 'var(--border)' }}
            >
              <div className="w-5 h-5 rounded-full bg-white transition-all"
                style={{ marginLeft: settings[m.key] ? '16px' : '0' }} />
            </button>
          </div>
        ))}
      </div>

      {/* Goals */}
      <div className="rounded-xl border p-4 mb-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <p className="text-xs font-medium uppercase mb-3" style={{ color: 'var(--text-secondary)' }}>Goals</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              Streak threshold: {settings.streakThreshold}%
            </label>
            <input type="range" min={50} max={100} step={5} value={settings.streakThreshold}
              onChange={e => update({ streakThreshold: Number(e.target.value) })}
              className="w-full" />
          </div>
          {settings.moduleNutrition && (
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Daily calorie target</label>
              <input type="number" value={settings.calorieTarget}
                onChange={e => update({ calorieTarget: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
          )}
          {settings.moduleFitness && (
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Fitness days/week: {settings.fitnessGoalDays}
              </label>
              <input type="range" min={1} max={7} value={settings.fitnessGoalDays}
                onChange={e => update({ fitnessGoalDays: Number(e.target.value) })}
                className="w-full" />
            </div>
          )}
        </div>
      </div>

      {/* Nudges */}
      <div className="rounded-xl border p-4 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <p className="text-xs font-medium uppercase mb-3" style={{ color: 'var(--text-secondary)' }}>Nudge level</p>
        <div className="flex gap-2">
          {['gentle', 'normal', 'aggressive'].map(level => (
            <button
              key={level}
              onClick={() => update({ nudgeLevel: level })}
              className="flex-1 py-2 rounded-lg text-xs capitalize border"
              style={{
                background: settings.nudgeLevel === level ? 'var(--brand)' : 'transparent',
                color: settings.nudgeLevel === level ? 'white' : 'var(--text-secondary)',
                borderColor: settings.nudgeLevel === level ? 'var(--brand)' : 'var(--border)',
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-xl text-sm font-medium text-white mb-3 disabled:opacity-50"
        style={{ background: saved ? 'var(--success)' : 'var(--brand)' }}
      >
        {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save settings'}
      </button>

      <button
        onClick={signOut}
        className="w-full py-3 rounded-xl text-sm border"
        style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}
      >
        Sign out
      </button>

      {/* Footer */}
      <p className="text-center mt-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
        Powered by YourFrontDesk
      </p>
    </div>
  )
}
