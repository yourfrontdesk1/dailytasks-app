'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingData {
  name: string
  role: string
  dayStartTime: string
  dayEndTime: string
  workingDays: string[]
  theme: string
  moduleTasks: boolean
  modulePipelines: boolean
  moduleCalendar: boolean
  moduleEmailDrafts: boolean
  moduleNutrition: boolean
  moduleFitness: boolean
  calorieTarget: number
  trackMacros: boolean
  proteinTarget: number
  carbsTarget: number
  fatTarget: number
  fitnessGoalDays: number
  fitnessType: string
  nudgeLevel: string
  nudgeModules: string[]
  categories: { name: string; colour: string }[]
}

const ROLES = ['Founder', 'Freelancer', 'Manager', 'Student', 'Creative', 'Other']
const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]
const COLOURS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']
const FITNESS_TYPES = ['Weights', 'Cardio', 'Both', 'Other']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    role: '',
    dayStartTime: '08:00',
    dayEndTime: '18:00',
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    theme: 'dark',
    moduleTasks: true,
    modulePipelines: false,
    moduleCalendar: false,
    moduleEmailDrafts: false,
    moduleNutrition: false,
    moduleFitness: false,
    calorieTarget: 2000,
    trackMacros: false,
    proteinTarget: 150,
    carbsTarget: 250,
    fatTarget: 65,
    fitnessGoalDays: 4,
    fitnessType: 'Both',
    nudgeLevel: 'normal',
    nudgeModules: [],
    categories: [
      { name: 'Work', colour: '#3b82f6' },
      { name: 'Personal', colour: '#22c55e' },
      { name: 'Health', colour: '#ef4444' },
    ],
  })

  const totalSteps = 8
  const progress = (step / totalSteps) * 100

  const update = (fields: Partial<OnboardingData>) => setData(prev => ({ ...prev, ...fields }))

  const next = () => {
    // Skip nutrition step if not enabled
    if (step === 4 && !data.moduleNutrition && !data.moduleFitness) {
      setStep(7)
    } else if (step === 5 && !data.moduleFitness) {
      setStep(7)
    } else {
      setStep(s => Math.min(s + 1, totalSteps))
    }
  }

  const back = () => setStep(s => Math.max(s - 1, 1))

  const finish = async () => {
    setSaving(true)
    try {
      await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      // Apply theme
      document.documentElement.className = data.theme
      router.push('/today')
    } catch {
      setSaving(false)
    }
  }

  const toggleDay = (day: string) => {
    update({
      workingDays: data.workingDays.includes(day)
        ? data.workingDays.filter(d => d !== day)
        : [...data.workingDays, day],
    })
  }

  const toggleModule = (key: keyof OnboardingData) => {
    update({ [key]: !data[key] } as Partial<OnboardingData>)
  }

  const btnStyle = {
    background: 'var(--brand)',
    color: 'white',
  }

  const cardStyle = {
    background: 'var(--bg-card)',
    borderColor: 'var(--border)',
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Step {step} of {totalSteps}</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'var(--brand)' }}
            />
          </div>
        </div>

        {/* Step 1: About You */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>About you</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Let's personalise your experience</p>

            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Your name</label>
            <input
              type="text"
              value={data.name}
              onChange={e => update({ name: e.target.value })}
              placeholder="Leon"
              className="w-full px-4 py-3 rounded-lg text-sm border outline-none mb-4"
              style={{ ...cardStyle, color: 'var(--text-primary)' }}
              autoFocus
            />

            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>What do you do?</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => update({ role: r.toLowerCase() })}
                  className="px-3 py-1.5 rounded-lg text-sm border transition-all"
                  style={{
                    background: data.role === r.toLowerCase() ? 'var(--brand)' : 'var(--bg-card)',
                    color: data.role === r.toLowerCase() ? 'white' : 'var(--text-secondary)',
                    borderColor: data.role === r.toLowerCase() ? 'var(--brand)' : 'var(--border)',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Your Day */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Your day</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>When does your day start and end?</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Start time</label>
                <input
                  type="time"
                  value={data.dayStartTime}
                  onChange={e => update({ dayStartTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm border outline-none"
                  style={{ ...cardStyle, color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>End time</label>
                <input
                  type="time"
                  value={data.dayEndTime}
                  onChange={e => update({ dayEndTime: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm border outline-none"
                  style={{ ...cardStyle, color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Working days</label>
            <div className="flex gap-2">
              {DAYS.map(d => (
                <button
                  key={d.key}
                  onClick={() => toggleDay(d.key)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
                  style={{
                    background: data.workingDays.includes(d.key) ? 'var(--brand)' : 'var(--bg-card)',
                    color: data.workingDays.includes(d.key) ? 'white' : 'var(--text-secondary)',
                    borderColor: data.workingDays.includes(d.key) ? 'var(--brand)' : 'var(--border)',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Modules */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>What do you want to track?</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Toggle on what matters. You can change this later.</p>

            {[
              { key: 'moduleTasks' as const, label: 'Tasks', desc: 'Daily checklist and recurring tasks', icon: '✓', always: true },
              { key: 'modulePipelines' as const, label: 'Pipelines', desc: 'Kanban boards for deals and projects', icon: '◫' },
              { key: 'moduleCalendar' as const, label: 'Calendar', desc: 'Meetings and events', icon: '📅' },
              { key: 'moduleEmailDrafts' as const, label: 'Email Drafts', desc: 'AI powered email writing', icon: '✉' },
              { key: 'moduleNutrition' as const, label: 'Nutrition', desc: 'Calorie and macro tracking', icon: '🍎' },
              { key: 'moduleFitness' as const, label: 'Fitness', desc: 'Workout logging and goals', icon: '💪' },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => !m.always && toggleModule(m.key)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border mb-2 text-left transition-all"
                style={{
                  background: data[m.key] ? 'var(--bg-card)' : 'transparent',
                  borderColor: data[m.key] ? 'var(--brand)' : 'var(--border)',
                  opacity: m.always ? 0.7 : 1,
                }}
              >
                <span className="text-lg w-8 text-center">{m.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.desc}</p>
                </div>
                <div
                  className="w-10 h-6 rounded-full flex items-center transition-all px-0.5"
                  style={{ background: data[m.key] ? 'var(--brand)' : 'var(--border)' }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white transition-all"
                    style={{ marginLeft: data[m.key] ? '16px' : '0' }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Theme */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Choose your theme</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Light or dark?</p>

            <div className="grid grid-cols-2 gap-4">
              {['light', 'dark'].map(t => (
                <button
                  key={t}
                  onClick={() => update({ theme: t })}
                  className="p-6 rounded-xl border text-center transition-all"
                  style={{
                    background: t === 'dark' ? '#09090b' : '#ffffff',
                    borderColor: data.theme === t ? 'var(--brand)' : t === 'dark' ? '#3f3f46' : '#e5e7eb',
                    borderWidth: data.theme === t ? '2px' : '1px',
                  }}
                >
                  <p className="text-3xl mb-2">{t === 'dark' ? '🌙' : '☀️'}</p>
                  <p className="text-sm font-medium capitalize" style={{ color: t === 'dark' ? '#fafafa' : '#111827' }}>
                    {t}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Nutrition Goals */}
        {step === 5 && data.moduleNutrition && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Nutrition goals</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Set your daily targets</p>

            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Daily calorie target</label>
            <input
              type="number"
              value={data.calorieTarget}
              onChange={e => update({ calorieTarget: Number(e.target.value) })}
              className="w-full px-4 py-3 rounded-lg text-sm border outline-none mb-4"
              style={{ ...cardStyle, color: 'var(--text-primary)' }}
            />

            <button
              onClick={() => update({ trackMacros: !data.trackMacros })}
              className="w-full flex items-center justify-between p-3 rounded-lg border mb-4"
              style={{ ...cardStyle }}
            >
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Track macros?</span>
              <div
                className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all"
                style={{ background: data.trackMacros ? 'var(--brand)' : 'var(--border)' }}
              >
                <div className="w-5 h-5 rounded-full bg-white transition-all"
                  style={{ marginLeft: data.trackMacros ? '16px' : '0' }} />
              </div>
            </button>

            {data.trackMacros && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Protein (g)</label>
                  <input type="number" value={data.proteinTarget}
                    onChange={e => update({ proteinTarget: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ ...cardStyle, color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Carbs (g)</label>
                  <input type="number" value={data.carbsTarget}
                    onChange={e => update({ carbsTarget: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ ...cardStyle, color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Fat (g)</label>
                  <input type="number" value={data.fatTarget}
                    onChange={e => update({ fatTarget: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
                    style={{ ...cardStyle, color: 'var(--text-primary)' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Fitness Goals */}
        {step === 6 && data.moduleFitness && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Fitness goals</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>How often do you train?</p>

            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              Days per week: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{data.fitnessGoalDays}</span>
            </label>
            <input
              type="range"
              min={1} max={7}
              value={data.fitnessGoalDays}
              onChange={e => update({ fitnessGoalDays: Number(e.target.value) })}
              className="w-full mb-6"
            />

            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>What type?</label>
            <div className="flex flex-wrap gap-2">
              {FITNESS_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => update({ fitnessType: t.toLowerCase() })}
                  className="px-4 py-2 rounded-lg text-sm border transition-all"
                  style={{
                    background: data.fitnessType.toLowerCase() === t.toLowerCase() ? 'var(--brand)' : 'var(--bg-card)',
                    color: data.fitnessType.toLowerCase() === t.toLowerCase() ? 'white' : 'var(--text-secondary)',
                    borderColor: data.fitnessType.toLowerCase() === t.toLowerCase() ? 'var(--brand)' : 'var(--border)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Nudge Preferences */}
        {step === 7 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Nudge preferences</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>How should we keep you accountable?</p>

            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Nudge intensity</label>
            <div className="flex gap-2 mb-6">
              {['gentle', 'normal', 'aggressive'].map(level => (
                <button
                  key={level}
                  onClick={() => update({ nudgeLevel: level })}
                  className="flex-1 py-2 rounded-lg text-sm border capitalize transition-all"
                  style={{
                    background: data.nudgeLevel === level ? 'var(--brand)' : 'var(--bg-card)',
                    color: data.nudgeLevel === level ? 'white' : 'var(--text-secondary)',
                    borderColor: data.nudgeLevel === level ? 'var(--brand)' : 'var(--border)',
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Categories */}
        {step === 8 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create your categories</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Organise your tasks by area</p>

            {data.categories.map((cat, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {COLOURS.map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        const cats = [...data.categories]
                        cats[i].colour = c
                        update({ categories: cats })
                      }}
                      className="w-5 h-5 rounded-full transition-all"
                      style={{
                        background: c,
                        boxShadow: cat.colour === c ? `0 0 0 2px var(--bg-primary), 0 0 0 4px ${c}` : 'none',
                        transform: cat.colour === c ? 'scale(1.1)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={cat.name}
                  onChange={e => {
                    const cats = [...data.categories]
                    cats[i].name = e.target.value
                    update({ categories: cats })
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
                  style={{ ...cardStyle, color: 'var(--text-primary)' }}
                />
                {data.categories.length > 1 && (
                  <button
                    onClick={() => update({ categories: data.categories.filter((_, j) => j !== i) })}
                    className="text-sm p-1"
                    style={{ color: 'var(--danger)' }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => update({ categories: [...data.categories, { name: '', colour: COLOURS[data.categories.length % COLOURS.length] }] })}
              className="text-sm mt-2"
              style={{ color: 'var(--brand)' }}
            >
              + Add category
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button onClick={back} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button onClick={next} className="px-6 py-2.5 rounded-lg text-sm font-medium" style={btnStyle}>
              Continue
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
              style={btnStyle}
            >
              {saving ? 'Setting up...' : 'Start my journey'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
