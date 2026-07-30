'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { recallTopic, logTopic, getStudentMemory } from '@/lib/mcp'
import { timeAgo } from '@/lib/utils'
import { Search, Plus, Brain } from 'lucide-react'
import { FadeUp } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface MemoryDisplay {
  id: string
  subject: string
  topic: string
  note: string
  loggedAt: string
  lastReviewedAt: string
  confidenceScore?: number
}

export default function MemoryPage() {
  const { studentId } = useAuth()
  const [entries, setEntries] = useState<MemoryDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLogForm, setShowLogForm] = useState(false)
  const [newEntry, setNewEntry] = useState({ subject: '', topic: '', note: '' })
  const [isLogging, setIsLogging] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [error, setError] = useState('')

  const loadMemory = async () => {
    if (!studentId) return
    setLoading(true)
    setError('')
    try {
      const memory = await getStudentMemory(studentId) as any
      const mastery = memory.mastery || []
      const mapped = mastery.map((m: any) => ({
        id: m.conceptId,
        subject: m.courseCode || 'General',
        topic: m.concept,
        note: `Confidence: ${Math.round(m.confidenceScore * 100)}% | Wrong: ${m.timesWrong}x`,
        loggedAt: new Date(Date.now() - m.daysSinceReview * 86400000).toISOString(),
        lastReviewedAt: new Date(Date.now() - m.daysSinceReview * 86400000).toISOString(),
        confidenceScore: m.confidenceScore,
      }))
      setEntries(mapped)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  useEffect(() => { loadMemory() }, [studentId])

  const subjects = ['all', ...new Set(entries.map(e => e.subject))]

  const filtered = entries.filter(e => {
    const matchesSearch = !searchQuery ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.topic.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || e.subject === selectedSubject
    return matchesSearch && matchesSubject
  }).sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())

  const handleLogEntry = async () => {
    if (!newEntry.subject || !newEntry.topic || !studentId) return
    setIsLogging(true)
    try {
      const result = await logTopic(studentId, newEntry.subject, newEntry.topic, newEntry.note)
      const entry: MemoryDisplay = {
        id: result.id, subject: newEntry.subject, topic: newEntry.topic, note: newEntry.note,
        loggedAt: result.loggedAt, lastReviewedAt: result.loggedAt,
      }
      setEntries(prev => [entry, ...prev])
      setNewEntry({ subject: '', topic: '', note: '' })
      setShowLogForm(false)
    } catch (err: any) {
      setError(err.message)
    }
    setIsLogging(false)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || !studentId) return
    setLoading(true)
    try {
      const results = await recallTopic(studentId, searchQuery)
      if (results.count > 0) {
        const mapped = results.results.map((r: any) => ({
          id: r.id, subject: r.summary?.split(':')[0] || 'Memory', topic: r.summary?.substring(0, 40) || r.type,
          note: r.summary || '', loggedAt: r.timestamp, lastReviewedAt: r.timestamp,
        }))
        setEntries(mapped)
      }
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted'
    if (score >= 0.7) return 'text-success'
    if (score >= 0.4) return 'text-warning'
    return 'text-error'
  }

  if (loading && entries.length === 0) return (
    <div>
      <div className="skeleton h-9 w-48 mb-2" />
      <div className="skeleton h-5 w-64 mb-6" />
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full mb-2" />)}
    </div>
  )

  return (
    <div>
      <FadeUp>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-text">Memory</h1>
          <p className="text-sm text-muted mt-1">{entries.length} concepts tracked</p>
        </div>
        <button onClick={() => setShowLogForm(!showLogForm)} className="btn btn-sm btn-primary">
          <Plus className="w-3.5 h-3.5" /> Log
        </button>
      </div>

      {error && <div className="text-sm text-error mb-4">{error}</div>}

      {showLogForm && (
        <div className="p-4 rounded-lg border border-border mb-6">
          <h2 className="text-sm font-semibold text-text mb-3">Log new entry</h2>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <input placeholder="Subject" value={newEntry.subject} onChange={e => setNewEntry(prev => ({ ...prev, subject: e.target.value }))} className="input-field" />
            <input placeholder="Topic" value={newEntry.topic} onChange={e => setNewEntry(prev => ({ ...prev, topic: e.target.value }))} className="input-field" />
            <input placeholder="Note" value={newEntry.note} onChange={e => setNewEntry(prev => ({ ...prev, note: e.target.value }))} className="input-field" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowLogForm(false)} className="btn btn-ghost btn-sm">Cancel</button>
            <button onClick={handleLogEntry} disabled={isLogging || !newEntry.subject || !newEntry.topic} className="btn btn-primary btn-sm">Save</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Search memory..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="input-field pl-6" />
        </div>
        <button onClick={handleSearch} className="btn btn-sm">Search</button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {subjects.map(s => (
          <button key={s} onClick={() => setSelectedSubject(s)}
            className={cn('btn btn-xs', selectedSubject === s ? 'btn-primary' : '')}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Brain className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">No entries found</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((entry) => (
            <div key={entry.id} className="py-3 border-b border-divider last:border-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text">{entry.topic}</div>
                  <div className="text-xs text-accent">{entry.subject}</div>
                  {entry.note && <div className="text-xs text-muted mt-1 line-clamp-2">{entry.note}</div>}
                  <div className="text-xs text-muted mt-1">{timeAgo(entry.loggedAt)}</div>
                </div>
                {entry.confidenceScore !== undefined && (
                  <span className={cn('text-xs font-mono shrink-0', getScoreColor(entry.confidenceScore))}>
                    {Math.round(entry.confidenceScore * 100)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </FadeUp>
    </div>
  )
}
