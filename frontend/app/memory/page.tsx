'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { useAuth } from '@/lib/auth'
import { recallTopic, logTopic, getStudentMemory } from '@/lib/mcp'
import { cn, formatDate, timeAgo } from '@/lib/utils'
import { Brain, Search, Plus, BookOpen, Clock, TrendingUp, TrendingDown, Minus, Sparkles, ArrowUpRight } from 'lucide-react'

interface MemoryDisplay {
  id: string
  subject: string
  topic: string
  note: string
  loggedAt: string
  lastReviewedAt: string
  reviewCount: number
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
        note: `Confidence: ${Math.round(m.confidenceScore * 100)}% | Raw: ${Math.round(m.rawScore * 100)}% | Wrong: ${m.timesWrong}x`,
        loggedAt: new Date(Date.now() - m.daysSinceReview * 86400000).toISOString(),
        lastReviewedAt: new Date(Date.now() - m.daysSinceReview * 86400000).toISOString(),
        reviewCount: 0,
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
      e.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.note.toLowerCase().includes(searchQuery.toLowerCase())
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
        loggedAt: result.loggedAt, lastReviewedAt: result.loggedAt, reviewCount: 0,
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
          note: r.summary || '', loggedAt: r.timestamp, lastReviewedAt: r.timestamp, reviewCount: 0,
        }))
        setEntries(mapped)
      }
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (loading && entries.length === 0) return <div className="p-6 max-w-7xl mx-auto"><div className="skeleton h-9 w-48 mb-2" /><div className="skeleton h-5 w-64 mb-4" />{[...Array(5)].map((_, i) => (<div key={i} className="skeleton h-16 w-full mb-2" />))}</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">Academic Memory</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[var(--text-secondary)] text-sm mt-1">
            {entries.length} concepts tracked — real mastery data from your studies
          </motion.p>
        </div>
        <button onClick={() => setShowLogForm(!showLogForm)} className="btn-primary text-sm !py-2.5 !px-5">
          <Plus className="w-4 h-4" />Log entry
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-[var(--error)]">{error}</div>}

      <AnimatePresence>
        {showLogForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
            <GlassCard glow className="p-5">
              <h2 className="font-display font-bold text-lg mb-4">Log a new memory entry</h2>
              <div className="grid sm:grid-cols-3 gap-3 mb-3">
                <input placeholder="Subject (e.g. Automata Theory)" value={newEntry.subject} onChange={e => setNewEntry(prev => ({ ...prev, subject: e.target.value }))} className="input-field" />
                <input placeholder="Topic (e.g. NFA to DFA)" value={newEntry.topic} onChange={e => setNewEntry(prev => ({ ...prev, topic: e.target.value }))} className="input-field" />
                <input placeholder="Note (what you covered)" value={newEntry.note} onChange={e => setNewEntry(prev => ({ ...prev, note: e.target.value }))} className="input-field" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowLogForm(false)} className="btn-ghost text-sm">Cancel</button>
                <button onClick={handleLogEntry} disabled={isLogging || !newEntry.subject || !newEntry.topic} className="btn-primary text-sm !py-2 !px-4">
                  {isLogging ? 'Saving...' : 'Save entry'}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input type="text" placeholder="Search your memory by topic, subject, or notes..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10" />
          </div>
          <button onClick={handleSearch} className="btn-primary text-sm !py-2.5 !px-4">Search</button>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {subjects.map(s => (
            <button key={s} onClick={() => setSelectedSubject(s)}
              className={cn('px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all border',
                                  selectedSubject === s ? 'bg-primary-highlight text-primary border-[var(--border-glow)]' : 'glass text-[var(--text-secondary)] border-[var(--border-primary)] hover:text-[var(--text-primary)]')}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      <motion.div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Brain className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">No memory entries found</p>
            <button onClick={() => setShowLogForm(true)} className="btn-ghost text-sm mt-2">Log your first entry</button>
          </div>
        ) : filtered.map((entry, i) => (
          <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card p-4 group">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#01696f]/20 to-[#0c4e54]/10 border border-[var(--border-primary)] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-[var(--accent-light)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-base">{entry.topic}</h3>
                    <p className="text-xs text-[var(--accent-light)] font-medium">{entry.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {entry.confidenceScore !== undefined && <ConfidenceBadge score={entry.confidenceScore} />}
                    <span className="text-xs text-[var(--text-muted)]">{timeAgo(entry.loggedAt)}</span>
                  </div>
                </div>
                {entry.note && <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">{entry.note}</p>}
                <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Reviewed {entry.reviewCount} time{entry.reviewCount !== 1 ? 's' : ''}</span>
                  <span>Last review: {timeAgo(entry.lastReviewedAt)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

function ConfidenceBadge({ score }: { score: number }) {
  const icon = score >= 0.7 ? TrendingUp : score >= 0.4 ? Minus : TrendingDown
  const Icon = icon
  const color = score >= 0.7 ? 'text-emerald-400' : score >= 0.4 ? 'text-amber-400' : 'text-[var(--error)]'
  const bg = score >= 0.7 ? 'bg-emerald-500/10' : score >= 0.4 ? 'bg-amber-500/10' : 'bg-red-500/10'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color} ${bg}`}>
      <Icon className="w-3 h-3" />{Math.round(score * 100)}%
    </span>
  )
}
