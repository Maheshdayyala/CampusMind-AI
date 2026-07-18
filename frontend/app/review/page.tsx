'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { useAuth } from '@/lib/auth'
import { getReviewDue, markReviewed } from '@/lib/mcp'
import { cn, timeAgo, formatDate } from '@/lib/utils'
import { Clock, CheckCircle2, RotateCcw, Brain, BookOpen, AlertTriangle, TrendingUp, ChevronRight, Sparkles } from 'lucide-react'

export default function ReviewPage() {
  const { studentId } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [daysThreshold, setDaysThreshold] = useState(3)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadReviews = async () => {
    if (!studentId) return
    setLoading(true)
    setError('')
    try {
      const result = await getReviewDue(studentId, daysThreshold)
      setItems(result.results || [])
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  useEffect(() => { loadReviews() }, [studentId, daysThreshold])

  const handleMarkReviewed = async (conceptId: string) => {
    if (!studentId) return
    setReviewingId(conceptId)
    try {
      await markReviewed(studentId, conceptId)
      setItems(prev => prev.filter(i => i.conceptId !== conceptId))
    } catch (err: any) {
      setError(err.message)
    }
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

  if (loading && items.length === 0) return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="skeleton h-9 w-48 mb-2" /><div className="skeleton h-5 w-64 mb-6" />
      <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => (<div key={i} className="glass-card p-5"><div className="skeleton h-5 w-32 mb-2" /><div className="skeleton h-4 w-24 mb-3" /><div className="skeleton h-12 w-full mb-2" /><div className="skeleton h-9 w-28 mt-3" /></div>))}</div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">Review Center</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[var(--text-secondary)] text-sm mt-1">
            Spaced repetition — review before you forget
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-muted)]">Threshold:</label>
          {[1, 3, 7, 14].map(d => (
            <button key={d} onClick={() => setDaysThreshold(d)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                daysThreshold === d ? 'bg-[#1a73e8]/20 text-[var(--accent-light)] border-[var(--border-glow)]' : 'glass text-[var(--text-secondary)] border-[var(--border-primary)]')}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-[var(--error)]">{error}</div>}

      {items.length === 0 && !loading ? (
        <div className="text-center py-24">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">All caught up!</h2>
            <p className="text-[var(--text-secondary)] text-sm mb-6">No topics due for review in the last {daysThreshold} days</p>
            <button onClick={() => setDaysThreshold(Math.max(1, daysThreshold - 1))} className="btn-secondary text-sm">
              <RotateCcw className="w-4 h-4" />Try shorter threshold
            </button>
          </motion.div>
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card-static p-5 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="font-display font-bold text-lg">{items.length} topic{items.length !== 1 ? 's' : ''} due for review</div>
              <p className="text-xs text-[var(--text-muted)]">Last reviewed more than {daysThreshold} days ago</p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div key={item.conceptId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                  layout className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center', getScoreBg(item.confidenceScore))}>
                        <BookOpen className={cn('w-5 h-5', getScoreColor(item.confidenceScore))} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base">{item.conceptName}</h3>
                        <p className="text-xs text-[var(--accent-light)]">{item.courseCode || 'General'}</p>
                      </div>
                    </div>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getScoreBg(item.confidenceScore), getScoreColor(item.confidenceScore))}>
                      {Math.round((item.confidenceScore || 0) * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.daysSinceReview} days since review</span>
                    <span>Wrong {item.timesWrong} time{item.timesWrong !== 1 ? 's' : ''}</span>
                  </div>

                  <button onClick={() => handleMarkReviewed(item.conceptId)} disabled={reviewingId === item.conceptId}
                    className="btn-primary w-full text-sm !py-2.5 disabled:opacity-60">
                    {reviewingId === item.conceptId ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
                        Marking...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />Mark as reviewed</span>
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}
