'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { mcpGetReviewDue, mcpMarkReviewed, type MemoryEntry } from '@/lib/mcp'
import { cn, timeAgo, formatDate } from '@/lib/utils'
import {
  Clock,
  CheckCircle2,
  RotateCcw,
  Brain,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export default function ReviewPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [daysThreshold, setDaysThreshold] = useState(3)
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  useEffect(() => {
    mcpGetReviewDue(daysThreshold).then(data => {
      setEntries(data)
      setLoading(false)
    })
  }, [daysThreshold])

  const handleMarkReviewed = async (id: string) => {
    setReviewingId(id)
    await mcpMarkReviewed(id)
    await new Promise(r => setTimeout(r, 500))
    setEntries(prev => prev.filter(e => e.id !== id))
    setReviewingId(null)
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-[var(--text-muted)]'
    if (score >= 0.7) return 'text-emerald-400'
    if (score >= 0.4) return 'text-amber-400'
    return 'text-[var(--error)]'
  }

  const getScoreBg = (score?: number) => {
    if (!score) return 'bg-white/[0.03]'
    if (score >= 0.7) return 'bg-emerald-500/10'
    if (score >= 0.4) return 'bg-amber-500/10'
    return 'bg-red-500/10'
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
            Review Center
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[var(--text-secondary)] text-sm mt-1"
          >
            Spaced repetition — review before you forget
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-muted)]">Threshold:</label>
          {[1, 3, 7, 14].map(d => (
            <button
              key={d}
              onClick={() => setDaysThreshold(d)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                daysThreshold === d
                  ? 'bg-[#1a73e8]/20 text-[var(--accent-light)] border-[var(--border-glow)]'
                  : 'glass text-[var(--text-secondary)] border-[var(--border-primary)]'
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="skeleton h-5 w-32 mb-2" />
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-12 w-full mb-2" />
              <div className="skeleton h-9 w-28 mt-3" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">All caught up!</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">
              No topics due for review in the last {daysThreshold} days
            </p>
            <button
              onClick={() => setDaysThreshold(Math.max(1, daysThreshold - 1))}
              className="btn-secondary text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Try shorter threshold
            </button>
          </motion.div>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-static p-5 mb-6 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="font-display font-bold text-lg">{entries.length} topic{entries.length !== 1 ? 's' : ''} due for review</div>
              <p className="text-xs text-[var(--text-muted)]">Last reviewed more than {daysThreshold} days ago</p>
            </div>
          </motion.div>

          <AnimatePresence>
            <div className="grid md:grid-cols-2 gap-4">
              {entries.map((entry, i) => {
                const daysSinceReview = Math.floor(
                  (Date.now() - new Date(entry.lastReviewedAt).getTime()) / 86400000
                )
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                    transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    layout
                    className="glass-card p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl border flex items-center justify-center',
                          getScoreBg(entry.confidenceScore)
                        )}>
                          <BookOpen className={cn('w-5 h-5', getScoreColor(entry.confidenceScore))} />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base">{entry.topic}</h3>
                          <p className="text-xs text-[var(--accent-light)]">{entry.subject}</p>
                        </div>
                      </div>
                      {entry.confidenceScore !== undefined && (
                        <span className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          getScoreBg(entry.confidenceScore),
                          getScoreColor(entry.confidenceScore)
                        )}>
                          {Math.round(entry.confidenceScore * 100)}%
                        </span>
                      )}
                    </div>

                    {entry.note && (
                      <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{entry.note}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysSinceReview} days since review
                      </span>
                      <span>Reviewed {entry.reviewCount} time{entry.reviewCount !== 1 ? 's' : ''}</span>
                    </div>

                    <button
                      onClick={() => handleMarkReviewed(entry.id)}
                      disabled={reviewingId === entry.id}
                      className="btn-primary w-full text-sm !py-2.5 disabled:opacity-60"
                    >
                      {reviewingId === entry.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                          />
                          Marking...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Mark as reviewed
                        </span>
                      )}
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
