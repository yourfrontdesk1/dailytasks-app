'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Pipeline {
  id: string
  name: string
  stages: { id: string; name: string; colour: string }[]
  _count: { items: number }
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchPipelines()
  }, [])

  const fetchPipelines = async () => {
    try {
      const res = await fetch('/api/pipelines')
      if (res.ok) setPipelines(await res.json())
    } catch {}
  }

  const createPipeline = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      await fetch('/api/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          stages: [
            { id: 'lead', name: 'Lead', colour: '#3b82f6' },
            { id: 'contact', name: 'Contacted', colour: '#f59e0b' },
            { id: 'proposal', name: 'Proposal', colour: '#8b5cf6' },
            { id: 'won', name: 'Won', colour: '#22c55e' },
            { id: 'lost', name: 'Lost', colour: '#ef4444' },
          ],
        }),
      })
      setNewName('')
      fetchPipelines()
    } catch {}
    setCreating(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Pipelines</h1>

      {/* Create */}
      <form onSubmit={createPipeline} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New pipeline name..."
          className="flex-1 px-4 py-3 rounded-xl text-sm border outline-none"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
        <button
          type="submit"
          disabled={!newName.trim() || creating}
          className="px-4 py-3 rounded-xl text-sm font-medium text-white disabled:opacity-30"
          style={{ background: 'var(--brand)' }}
        >
          Create
        </button>
      </form>

      {/* Pipeline list */}
      <div className="space-y-2">
        {pipelines.map(p => (
          <Link
            key={p.id}
            href={`/pipelines/${p.id}`}
            className="flex items-center gap-3 px-4 py-4 rounded-xl border transition-colors"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
          >
            <span className="text-lg">◫</span>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
              <div className="flex gap-1 mt-1">
                {p.stages.map(s => (
                  <div key={s.id} className="w-3 h-1.5 rounded-full" style={{ background: s.colour }} />
                ))}
              </div>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {p._count?.items || 0} items
            </span>
          </Link>
        ))}
      </div>

      {pipelines.length === 0 && (
        <p className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>
          No pipelines yet. Create one above.
        </p>
      )}
    </div>
  )
}
