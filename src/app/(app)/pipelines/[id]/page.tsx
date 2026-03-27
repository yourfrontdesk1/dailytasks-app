'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Stage {
  id: string
  name: string
  colour: string
}

interface PipelineItem {
  id: string
  name: string
  stageId: string
  contactName: string | null
  contactEmail: string | null
  value: number | null
  nextAction: string | null
  nextActionDate: string | null
  lastContact: string | null
}

interface Pipeline {
  id: string
  name: string
  stages: Stage[]
  items: PipelineItem[]
}

export default function PipelineBoardPage() {
  const params = useParams()
  const [pipeline, setPipeline] = useState<Pipeline | null>(null)
  const [dragItem, setDragItem] = useState<string | null>(null)
  const [addingToStage, setAddingToStage] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState('')

  useEffect(() => {
    fetchPipeline()
  }, [params.id])

  const fetchPipeline = async () => {
    try {
      const res = await fetch(`/api/pipelines/${params.id}`)
      if (res.ok) setPipeline(await res.json())
    } catch {}
  }

  const addItem = async (stageId: string) => {
    if (!newItemName.trim()) return
    try {
      await fetch(`/api/pipelines/${params.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName, stageId }),
      })
      setNewItemName('')
      setAddingToStage(null)
      fetchPipeline()
    } catch {}
  }

  const moveItem = async (itemId: string, newStageId: string) => {
    if (!pipeline) return
    // Optimistic update
    setPipeline(prev => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, stageId: newStageId } : item
        ),
      }
    })
    try {
      await fetch(`/api/pipelines/${params.id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: newStageId }),
      })
    } catch {
      fetchPipeline()
    }
  }

  const handleDrop = (stageId: string) => {
    if (dragItem) {
      moveItem(dragItem, stageId)
      setDragItem(null)
    }
  }

  const isOverdue = (date: string | null) => {
    if (!date) return false
    return new Date(date) < new Date(new Date().toISOString().split('T')[0])
  }

  if (!pipeline) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{pipeline.name}</h1>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{pipeline.items.length} items</span>
      </div>

      {/* Kanban board */}
      <div className="flex-1 flex overflow-x-auto p-4 gap-3">
        {pipeline.stages.map(stage => {
          const stageItems = pipeline.items.filter(i => i.stageId === stage.id)
          const stageValue = stageItems.reduce((sum, i) => sum + (i.value || 0), 0)

          return (
            <div
              key={stage.id}
              className="w-64 flex-shrink-0 flex flex-col rounded-xl border"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Stage header */}
              <div className="px-3 py-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: stage.colour }} />
                <span className="text-xs font-medium flex-1" style={{ color: 'var(--text-primary)' }}>
                  {stage.name}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {stageItems.length}
                </span>
                {stageValue > 0 && (
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                    ${stageValue.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {stageItems.map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDragItem(item.id)}
                    className="rounded-lg border p-3 cursor-grab active:cursor-grabbing"
                    style={{
                      borderColor: isOverdue(item.nextActionDate) ? 'var(--danger)' : 'var(--border)',
                      background: 'var(--bg-card)',
                    }}
                  >
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    {item.contactName && (
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{item.contactName}</p>
                    )}
                    {item.value && (
                      <p className="text-xs font-medium mt-1" style={{ color: 'var(--success)' }}>
                        ${item.value.toLocaleString()}
                      </p>
                    )}
                    {item.nextAction && (
                      <p className="text-[10px] mt-1" style={{
                        color: isOverdue(item.nextActionDate) ? 'var(--danger)' : 'var(--text-secondary)',
                      }}>
                        Next: {item.nextAction}
                      </p>
                    )}
                  </div>
                ))}

                {/* Add item */}
                {addingToStage === stage.id ? (
                  <div className="p-2">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addItem(stage.id)}
                      placeholder="Item name..."
                      autoFocus
                      className="w-full px-2 py-1.5 rounded text-xs border outline-none"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => addItem(stage.id)}
                        className="text-[10px] px-2 py-1 rounded text-white"
                        style={{ background: 'var(--brand)' }}
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setAddingToStage(null); setNewItemName('') }}
                        className="text-[10px] px-2 py-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingToStage(stage.id)}
                    className="w-full text-left px-2 py-1.5 rounded text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    + Add item
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
