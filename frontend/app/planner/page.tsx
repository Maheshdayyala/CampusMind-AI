'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { getDeadlineTimeline, suggestReviewPlan, flagAtRiskTopics, listCourses } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

export default function PlannerPage() {
  const { studentId } = useAuth()
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [reviewPlan, setReviewPlan] = useState<any[]>([])
  const [atRisk, setAtRisk] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentId) return
    Promise.all([
      getDeadlineTimeline(studentId),
      suggestReviewPlan(studentId, 5),
      flagAtRiskTopics(studentId),
      listCourses(studentId),
    ]).then(([d, p, r]) => {
      setDeadlines(d.deadlines || [])
      setReviewPlan(p.plan || [])
      setAtRisk(r.atRiskTopics || [])
      setLoading(false)
    }).catch((err) => { setError(err.message); setLoading(false) })
  }, [studentId])

  if (loading) return (
    <div>
      <div className="skeleton h-9 w-48 mb-2" />
      <div className="skeleton h-5 w-64 mb-6" />
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}</div>
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text">Planner</h1>
        <p className="text-sm text-muted mt-1">
          {reviewPlan.length > 0 ? `${reviewPlan.length} topics suggested for review` : 'Plan your study sessions'}
        </p>
      </div>

      {error && <div className="text-sm text-error mb-4">{error}</div>}

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-8">
          {reviewPlan.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text mb-3">Suggested Review</h2>
              <div className="space-y-1">
                {reviewPlan.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-divider last:border-0">
                    <div>
                      <div className="text-sm text-text">{item.concept}</div>
                      <div className="text-xs text-muted">{item.course || 'General'} &middot; {item.recommendedDuration}min</div>
                    </div>
                    <span className={cn('text-xs font-mono',
                      item.currentConfidence < 40 ? 'text-error' : item.currentConfidence < 60 ? 'text-warning' : 'text-success')}>
                      {item.currentConfidence}%
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {atRisk.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text mb-3">At-Risk Topics</h2>
              <div className="space-y-1">
                {atRisk.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 text-error shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm text-text">{item.concept}</div>
                      <div className="text-xs text-muted">{item.course} &middot; Risk: {item.riskLevel}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text">Deadlines</h2>
              <span className="text-xs text-muted">{deadlines.length}</span>
            </div>
            {deadlines.length === 0 ? (
              <p className="text-sm text-muted">No upcoming deadlines</p>
            ) : (
              <div className="space-y-2">
                {deadlines.slice(0, 5).map((d, i) => (
                  <div key={d.id} className="py-2">
                    <div className="text-sm text-text mb-0.5">{d.title}</div>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>{d.course} &middot; {d.dueDate}</span>
                      <span className={cn(d.urgency === 'critical' ? 'text-error' : d.urgency === 'high' ? 'text-warning' : '')}>
                        {d.daysUntil > 0 ? `${d.daysUntil}d left` : 'Overdue'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
