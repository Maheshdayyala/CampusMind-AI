'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { mcpRecallTopic, mcpLogTopic, type MemoryEntry } from '@/lib/mcp'
import { cn, formatDate, timeAgo } from '@/lib/utils'
import {
  Brain,
  Search,
  Plus,
  BookOpen,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'

const initialEntries: MemoryEntry[] = [
  { id: 'm1', subject: 'Automata Theory', topic: 'NFA to DFA Conversion', note: 'Understood the subset construction algorithm. Need more practice with epsilon transitions.', loggedAt: '2026-07-14T10:30:00Z', lastReviewedAt: '2026-07-14T10:30:00Z', reviewCount: 1, confidenceScore: 0.42 },
  { id: 'm2', subject: 'Automata Theory', topic: 'Regular Expressions', note: 'Covered basic patterns and Kleene star. Clear on most concepts.', loggedAt: '2026-07-12T14:00:00Z', lastReviewedAt: '2026-07-13T09:00:00Z', reviewCount: 3, confidenceScore: 0.75 },
  { id: 'm3', subject: 'Data Structures', topic: 'Binary Search Trees', note: 'Insertion and deletion algorithms. Struggling with balancing.', loggedAt: '2026-07-10T11:00:00Z', lastReviewedAt: '2026-07-10T11:00:00Z', reviewCount: 1, confidenceScore: 0.55 },
  { id: 'm4', subject: 'Data Structures', topic: 'Hash Tables', note: 'Collision resolution strategies: chaining and open addressing.', loggedAt: '2026-07-08T16:00:00Z', lastReviewedAt: '2026-07-11T10:00:00Z', reviewCount: 2, confidenceScore: 0.7 },
  { id: 'm5', subject: 'Calculus', topic: 'Limits and Continuity', note: 'Epsilon-delta definition still fuzzy. Need to review.', loggedAt: '2026-07-05T09:30:00Z', lastReviewedAt: '2026-07-05T09:30:00Z', reviewCount: 0, confidenceScore: 0.3 },
  { id: 'm6', subject: 'Calculus', topic: 'Derivatives', note: 'Power rule, chain rule, product rule. Comfortable with basic problems.', loggedAt: '2026-07-03T13:00:00Z', lastReviewedAt: '2026-07-07T11:00:00Z', reviewCount: 2, confidenceScore: 0.8 },
  { id: 'm7', subject: 'Automata Theory', topic: 'Closure Properties', note: 'Regular languages under union, concatenation, star. Need more proofs practice.', loggedAt: '2026-07-01T10:00:00Z', lastReviewedAt: '2026-07-01T10:00:00Z', reviewCount: 0, confidenceScore: 0.3 },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

export default function MemoryPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>(initialEntries)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLogForm, setShowLogForm] = useState(false)
  const [newEntry, setNewEntry] = useState({ subject: '', topic: '', note: '' })
  const [isLogging, setIsLogging] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

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
    if (!newEntry.subject || !newEntry.topic) return
    setIsLogging(true)
    const result = await mcpLogTopic(newEntry.subject, newEntry.topic, newEntry.note)
    const entry: MemoryEntry = {
      id: result.id,
      subject: newEntry.subject,
      topic: newEntry.topic,
      note: newEntry.note,
      loggedAt: new Date().toISOString(),
      lastReviewedAt: new Date().toISOString(),
      reviewCount: 0,
    }
    setEntries(prev => [entry, ...prev])
    setNewEntry({ subject: '', topic: '', note: '' })
    setShowLogForm(false)
    setIsLogging(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold"
          >
            Academic Memory
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[var(--text-secondary)] text-sm mt-1"
          >
            {entries.length} entries logged — everything you&apos;ve studied
          </motion.p>
        </div>
        <button onClick={() => setShowLogForm(!showLogForm)} className="btn-primary text-sm !py-2.5 !px-5">
          <Plus className="w-4 h-4" />
          Log entry
        </button>
      </div>

      {/* Log Form */}
      <AnimatePresence>
        {showLogForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <GlassCard glow className="p-5">
              <h2 className="font-display font-bold text-lg mb-4">Log a new memory entry</h2>
              <div className="grid sm:grid-cols-3 gap-3 mb-3">
                <input
                  placeholder="Subject (e.g. Automata Theory)"
                  value={newEntry.subject}
                  onChange={e => setNewEntry(prev => ({ ...prev, subject: e.target.value }))}
                  className="input-field"
                />
                <input
                  placeholder="Topic (e.g. NFA to DFA)"
                  value={newEntry.topic}
                  onChange={e => setNewEntry(prev => ({ ...prev, topic: e.target.value }))}
                  className="input-field"
                />
                <input
                  placeholder="Note (what you covered)"
                  value={newEntry.note}
                  onChange={e => setNewEntry(prev => ({ ...prev, note: e.target.value }))}
                  className="input-field"
                />
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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search your memory by topic, subject, or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all border',
                selectedSubject === s
                  ? 'bg-[#1a73e8]/20 text-[var(--accent-light)] border-[var(--border-glow)]'
                  : 'glass text-[var(--text-secondary)] border-[var(--border-primary)] hover:text-[var(--text-primary)]'
              )}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Brain className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">No memory entries found</p>
            <button onClick={() => setShowLogForm(true)} className="btn-ghost text-sm mt-2">Log your first entry</button>
          </div>
        ) : (
          filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="glass-card p-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a73e8]/20 to-[#0d47a1]/10 border border-[var(--border-primary)] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[var(--accent-light)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display font-bold text-base">{entry.topic}</h3>
                      <p className="text-xs text-[var(--accent-light)] font-medium">{entry.subject}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {entry.confidenceScore !== undefined && (
                        <ConfidenceBadge score={entry.confidenceScore} />
                      )}
                      <span className="text-xs text-[var(--text-muted)]">{timeAgo(entry.loggedAt)}</span>
                    </div>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">{entry.note}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Reviewed {entry.reviewCount} time{entry.reviewCount !== 1 ? 's' : ''}
                    </span>
                    <span>Last review: {timeAgo(entry.lastReviewedAt)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
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
      <Icon className="w-3 h-3" />
      {Math.round(score * 100)}%
    </span>
  )
}
