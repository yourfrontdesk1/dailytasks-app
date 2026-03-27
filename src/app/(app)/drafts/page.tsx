'use client'

import { useState, useEffect } from 'react'

interface EmailDraft {
  id: string
  to: string
  subject: string
  body: string
  status: string
  createdAt: string
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<EmailDraft[]>([])
  const [showCompose, setShowCompose] = useState(false)
  const [to, setTo] = useState('')
  const [context, setContext] = useState('')
  const [tone, setTone] = useState('professional')
  const [generating, setGenerating] = useState(false)
  const [generatedSubject, setGeneratedSubject] = useState('')
  const [generatedBody, setGeneratedBody] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/drafts')
      if (res.ok) setDrafts(await res.json())
    } catch {}
  }

  const generateDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!to.trim() || !context.trim()) return
    setGenerating(true)

    try {
      const res = await fetch('/api/ai/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, context, tone }),
      })
      if (res.ok) {
        const data = await res.json()
        setGeneratedSubject(data.subject)
        setGeneratedBody(data.body)
      }
    } catch {}
    setGenerating(false)
  }

  const saveDraft = async () => {
    try {
      await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject: generatedSubject,
          body: generatedBody,
        }),
      })
      resetForm()
      fetchDrafts()
    } catch {}
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`Subject: ${generatedSubject}\n\n${generatedBody}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetForm = () => {
    setShowCompose(false)
    setTo('')
    setContext('')
    setGeneratedSubject('')
    setGeneratedBody('')
  }

  const deleteDraft = async (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id))
    try {
      await fetch(`/api/drafts/${id}`, { method: 'DELETE' })
    } catch {}
  }

  const TONES = ['professional', 'friendly', 'direct', 'formal', 'casual']

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Email Drafts</h1>
        <button
          onClick={() => setShowCompose(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
          style={{ background: 'var(--brand)' }}
        >
          + New draft
        </button>
      </div>

      {/* Compose */}
      {showCompose && (
        <div className="rounded-xl border p-4 mb-6" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <form onSubmit={generateDraft} className="space-y-3">
            <input
              type="email"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="To: email@example.com"
              required
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="What's this email about? (e.g. Follow up on the proposal I sent last week, mention the 15% discount)"
              rows={3}
              required
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Tone:</span>
              {TONES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className="px-2 py-1 rounded text-[10px] capitalize"
                  style={{
                    background: tone === t ? 'var(--brand)' : 'var(--bg-secondary)',
                    color: tone === t ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${tone === t ? 'var(--brand)' : 'var(--border)'}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--brand)' }}
            >
              {generating ? 'AI is writing...' : 'Generate draft'}
            </button>
          </form>

          {/* Generated result */}
          {generatedSubject && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Subject:</p>
              <input
                type="text"
                value={generatedSubject}
                onChange={e => setGeneratedSubject(e.target.value)}
                className="w-full text-sm font-medium outline-none mb-3"
                style={{ background: 'transparent', color: 'var(--text-primary)' }}
              />
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Body:</p>
              <textarea
                value={generatedBody}
                onChange={e => setGeneratedBody(e.target.value)}
                rows={6}
                className="w-full text-sm outline-none resize-none mb-3"
                style={{ background: 'transparent', color: 'var(--text-primary)' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-white"
                  style={{ background: copied ? 'var(--success)' : 'var(--brand)' }}
                >
                  {copied ? '✓ Copied!' : 'Copy to clipboard'}
                </button>
                <button
                  onClick={saveDraft}
                  className="px-4 py-2 rounded-lg text-xs border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Save
                </button>
                <button
                  onClick={() => generateDraft({ preventDefault: () => {} } as React.FormEvent)}
                  className="px-4 py-2 rounded-lg text-xs border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}

          <button onClick={resetForm} className="mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Cancel
          </button>
        </div>
      )}

      {/* Draft list */}
      <div className="space-y-2">
        {drafts.map(d => (
          <div
            key={d.id}
            className="rounded-xl border p-4 group"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
          >
            <div className="flex items-start justify-between mb-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.subject}</p>
              <button
                onClick={() => deleteDraft(d.id)}
                className="opacity-0 group-hover:opacity-100 text-xs"
                style={{ color: 'var(--danger)' }}
              >×</button>
            </div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>To: {d.to}</p>
            <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{d.body}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(`Subject: ${d.subject}\n\n${d.body}`)
                }}
                className="text-[10px] px-2 py-1 rounded"
                style={{ color: 'var(--brand)', background: 'var(--bg-secondary)' }}
              >
                Copy
              </button>
              <span className="text-[10px] capitalize px-2 py-0.5 rounded"
                style={{
                  background: d.status === 'copied' ? 'rgba(34,197,94,0.1)' : 'var(--bg-secondary)',
                  color: d.status === 'copied' ? 'var(--success)' : 'var(--text-secondary)',
                }}>
                {d.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {drafts.length === 0 && !showCompose && (
        <p className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>
          No drafts yet. Create one above.
        </p>
      )}
    </div>
  )
}
