'use client'

import { useState } from 'react'

interface Props {
  onAdd: (title: string) => void
}

export default function QuickAdd({ onAdd }: Props) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setText('')
  }

  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 px-4 md:px-0 md:relative z-40">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="+ Quick add task..."
            className="flex-1 px-4 py-3 rounded-xl text-sm border outline-none"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
          {text.trim() && (
            <button
              type="submit"
              className="px-4 py-3 rounded-xl text-sm font-medium text-white"
              style={{ background: 'var(--brand)' }}
            >
              Add
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
