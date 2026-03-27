'use client'

import { useState, useEffect, useRef } from 'react'

interface NutritionEntry {
  id: string
  meal: string
  food: string
  calories: number
  protein: number | null
  carbs: number | null
  fat: number | null
  isAiEstimate: boolean
}

interface FoodHistoryItem {
  food: string
  label: string
  calories: number
  protein: number | null
  carbs: number | null
  fat: number | null
  isFavourite: boolean
}

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export default function NutritionPage() {
  const [entries, setEntries] = useState<NutritionEntry[]>([])
  const [history, setHistory] = useState<FoodHistoryItem[]>([])
  const [selectedMeal, setSelectedMeal] = useState<string>('lunch')
  const [foodInput, setFoodInput] = useState('')
  const [estimating, setEstimating] = useState(false)
  const [photoMode, setPhotoMode] = useState(false)
  const [calorieTarget, setCalorieTarget] = useState(2000)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchEntries()
    fetchHistory()
  }, [])

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/nutrition?date=' + new Date().toISOString().split('T')[0])
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries || [])
        setCalorieTarget(data.calorieTarget || 2000)
      }
    } catch {}
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/nutrition/history')
      if (res.ok) setHistory(await res.json())
    } catch {}
  }

  const addManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foodInput.trim()) return

    setEstimating(true)
    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal: selectedMeal, food: foodInput, useAi: true }),
      })
      if (res.ok) {
        setFoodInput('')
        fetchEntries()
        fetchHistory()
      }
    } catch {}
    setEstimating(false)
  }

  const addFromHistory = async (item: FoodHistoryItem) => {
    try {
      await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal: selectedMeal,
          food: item.label,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
        }),
      })
      fetchEntries()
    } catch {}
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setEstimating(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1]
      try {
        const res = await fetch('/api/ai/estimate-food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            mimeType: file.type,
            meal: selectedMeal,
          }),
        })
        if (res.ok) {
          fetchEntries()
          fetchHistory()
        }
      } catch {}
      setEstimating(false)
      setPhotoMode(false)
    }
    reader.readAsDataURL(file)
  }

  const deleteEntry = async (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
    try {
      await fetch(`/api/nutrition/${id}`, { method: 'DELETE' })
    } catch {}
  }

  const totalCals = entries.reduce((sum, e) => sum + e.calories, 0)
  const totalProtein = entries.reduce((sum, e) => sum + (e.protein || 0), 0)
  const totalCarbs = entries.reduce((sum, e) => sum + (e.carbs || 0), 0)
  const totalFat = entries.reduce((sum, e) => sum + (e.fat || 0), 0)
  const percent = calorieTarget > 0 ? Math.round((totalCals / calorieTarget) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Nutrition</h1>

      {/* Summary */}
      <div className="rounded-xl border p-5 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalCals.toLocaleString()}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>of {calorieTarget.toLocaleString()} cals</p>
          </div>
          <p className="text-lg font-bold" style={{ color: percent > 100 ? 'var(--danger)' : 'var(--brand)' }}>{percent}%</p>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full mb-4" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(percent, 100)}%`,
              background: percent > 100 ? 'var(--danger)' : percent > 80 ? 'var(--success)' : 'var(--brand)',
            }}
          />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{totalProtein}g</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Protein</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{totalCarbs}g</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Carbs</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{totalFat}g</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Fat</p>
          </div>
        </div>
      </div>

      {/* Meal selector */}
      <div className="flex gap-1 mb-4">
        {MEALS.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMeal(m)}
            className="flex-1 py-2 rounded-lg text-xs capitalize"
            style={{
              background: selectedMeal === m ? 'var(--brand)' : 'var(--bg-card)',
              color: selectedMeal === m ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${selectedMeal === m ? 'var(--brand)' : 'var(--border)'}`,
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Add food */}
      <div className="rounded-xl border p-4 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <form onSubmit={addManual} className="flex gap-2 mb-3">
          <input
            type="text"
            value={foodInput}
            onChange={e => setFoodInput(e.target.value)}
            placeholder="Describe your food (e.g. chicken breast 200g with rice)"
            className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <button
            type="submit"
            disabled={!foodInput.trim() || estimating}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-30"
            style={{ background: 'var(--brand)' }}
          >
            {estimating ? '...' : 'Add'}
          </button>
        </form>

        {/* Photo upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 rounded-lg text-xs border"
          style={{ borderColor: 'var(--border)', color: 'var(--brand)' }}
        >
          📷 Take photo of food
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {estimating && (
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
            AI is analyzing your food...
          </p>
        )}
      </div>

      {/* Recent / Favourites */}
      {history.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>
            Quick add from history
          </p>
          <div className="flex flex-wrap gap-1.5">
            {history.slice(0, 10).map(item => (
              <button
                key={item.food}
                onClick={() => addFromHistory(item)}
                className="px-3 py-1.5 rounded-lg text-xs border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}
              >
                {item.isFavourite ? '⭐ ' : ''}{item.label} ({item.calories} cal)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Today's entries by meal */}
      {MEALS.map(meal => {
        const mealEntries = entries.filter(e => e.meal === meal)
        if (mealEntries.length === 0) return null
        return (
          <div key={meal} className="mb-4">
            <p className="text-xs font-medium uppercase mb-2 capitalize" style={{ color: 'var(--text-secondary)' }}>
              {meal} ({mealEntries.reduce((s, e) => s + e.calories, 0)} cal)
            </p>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
              {mealEntries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-4 py-2 border-b last:border-b-0 group"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                    {entry.food}
                    {entry.isAiEstimate && <span className="text-[10px] ml-1" style={{ color: 'var(--brand)' }}>AI</span>}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{entry.calories} cal</span>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs transition-opacity"
                    style={{ color: 'var(--danger)' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
