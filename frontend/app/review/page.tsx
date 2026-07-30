'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { getReviewDue, markReviewed } from '@/lib/mcp'
import { cn, timeAgo, formatDate } from '@/lib/utils'
import { CheckCircle2, RotateCcw } from 'lucide-react'
import { FadeUp } from '@/lib/animations'

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
    if (!score) return 'text-muted'
    if (score >= 0.7) return 'text-success'
    if (score >= 0.4) return 'text-warning'
    return 'text-error'
  }

  if (loading) return (
    <div>
      <div className="skeleton h-9 w-48 mb-2" />
      <div className="skeleton h-5 w-64 mb-6" />
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 w-full mb-2" />)}
    </div>
  )

  return (
    <div>
      <FadeUp>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-text">Review</h1>
          <p className="text-sm text-muted mt-1">Spaced repetition — review before you forget</p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 3, 7, 14].map(d => (
            <button key={d} onClick={() => setDaysThreshold(d)}
              className={cn('btn btn-xs', daysThreshold === d ? 'btn-primary' : '')}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-sm text-error mb-4">{error}</div>}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <h2 className="font-display text-xl text-text mb-1">All caught up</h2>
          <p className="text-sm text-muted mb-4">No topics due in the last {daysThreshold} days</p>
          <button onClick={() => setDaysThreshold(Math.max(1, daysThreshold - 1))} className="btn btn-sm">
            <RotateCcw className="w-3 h-3" /> Shorter threshold
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/5 border border-accent/10">
            <span className="text-sm text-accent font-medium">{items.length} topic{items.length !== 1 ? 's' : ''} due</span>
            <span className="text-xs text-muted">last reviewed &gt;{daysThreshold}d ago</span>
          </div>

          <div className="space-y-1">
            {items.map((item, i) => (
              <div key={item.conceptId} className="flex items-center gap-4 py-3 border-b border-divider last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text">{item.conceptName}</div>
                  <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                    <span>{item.courseCode || 'General'}</span>
                    <span>{item.daysSinceReview}d since review</span>
                    <span>Wrong {item.timesWrong}x</span>
                  </div>
                </div>
                <span className={cn('text-sm font-mono', getScoreColor(item.confidenceScore))}>
                  {Math.round((item.confidenceScore || 0) * 100)}%
                </span>
                <button onClick={() => handleMarkReviewed(item.conceptId)} disabled={reviewingId === item.conceptId}
                  className="btn btn-ghost btn-xs text-accent disabled:opacity-40">
                  {reviewingId === item.conceptId ? '...' : 'Reviewed'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      </FadeUp>
    </div>
  )
}
