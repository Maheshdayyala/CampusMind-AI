'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { getProgressSummary, getMasteryHeatmap } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { Brain, Clock, BookOpen, Target } from 'lucide-react'
import { FadeUp } from '@/lib/animations'

export default function AnalyticsPage() {
  const { studentId } = useAuth()
  const [progress, setProgress] = useState<any>(null)
  const [heatmap, setHeatmap] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentId) return
    Promise.all([
      getProgressSummary(studentId, 14),
      getMasteryHeatmap(studentId),
    ]).then(([p, h]) => {
      setProgress(p)
      setHeatmap(h)
      setLoading(false)
    }).catch((err) => { setError(err.message); setLoading(false) })
  }, [studentId])

  if (loading) return (
    <div>
      <div className="skeleton h-9 w-48 mb-2" />
      <div className="skeleton h-5 w-64 mb-8" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}</div>
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 w-full" />)}</div>
      </div>
    </div>
  )

  if (error) return <div className="text-error py-20 text-center">{error}</div>
  if (!progress) return null

  const overview = progress.overview
  const concepts = progress.conceptMastery || []
  const activity = progress.recentActivity || []

  const stats = [
    { icon: Brain, label: 'Avg Confidence', value: `${overview.averageConfidence}%`, sub: `across ${overview.totalConceptsTracked} concepts` },
    { icon: Clock, label: 'Study Sessions', value: `${overview.studySessionsCompleted}`, sub: `in ${progress.periodDays} days` },
    { icon: BookOpen, label: 'Interactions', value: `${overview.totalInteractions}`, sub: 'total' },
    { icon: Target, label: 'Weak Topics', value: `${overview.weakTopicsCount}`, sub: 'need attention' },
  ]

  return (
    <div>
      <FadeUp>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text">Analytics</h1>
        <p className="text-sm text-muted mt-1">Last {progress.periodDays} days</p>
      </div>

      <div className="flex items-center gap-6 mb-10 text-sm">
        {stats.map((s, i) => (
          <div key={i}>
            <span className="font-semibold text-text text-lg">{s.value}</span>
            <span className="text-muted ml-1">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-text mb-4">Topic Confidence</h2>
            <div className="space-y-3">
              {concepts.length === 0 ? (
                <p className="text-sm text-muted">No data yet</p>
              ) : concepts.sort((a: any, b: any) => a.confidenceScore - b.confidenceScore).map((t: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text">{t.concept}</span>
                    <span className={cn('font-mono text-xs',
                      t.confidenceScore >= 70 ? 'text-success' : t.confidenceScore >= 40 ? 'text-warning' : 'text-error')}>
                      {t.confidenceScore}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-offset overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all',
                      t.confidenceScore >= 70 ? 'bg-success' : t.confidenceScore >= 40 ? 'bg-warning' : 'bg-error')}
                      style={{ width: `${t.confidenceScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-text mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {activity.length === 0 ? (
                <p className="text-sm text-muted">No recent activity</p>
              ) : activity.slice(0, 10).map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-divider last:border-0">
                  <div className={cn('w-1.5 h-1.5 rounded-full shrink-0',
                    a.type === 'confused_question' || a.type === 'incorrect_quiz' ? 'bg-error' :
                    a.type === 'correct_quiz' ? 'bg-success' : 'bg-accent')} />
                  <span className="text-sm text-text flex-1 truncate">{a.summary || a.type}</span>
                  <span className="text-xs text-muted shrink-0">{new Date(a.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-text mb-3">Summary</h2>
            <div className="space-y-2">
              {[
                { label: 'Avg Confidence', value: `${overview.averageConfidence}%` },
                { label: 'Study Sessions', value: `${overview.studySessionsCompleted}` },
                { label: 'Est. Study Time', value: `${overview.estimatedStudyMinutes}min` },
                { label: 'Weak Topics', value: `${overview.weakTopicsCount}` },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-divider last:border-0">
                  <span className="text-sm text-muted">{s.label}</span>
                  <span className="text-sm font-medium text-text">{s.value}</span>
                </div>
              ))}
            </div>
          </section>

          {heatmap?.courses?.map((course: any) => (
            <section key={course.code}>
              <h2 className="text-sm font-semibold text-text mb-3">{course.title}</h2>
              <div className="space-y-1">
                {(course.concepts || []).slice(0, 5).map((c: any) => (
                  <div key={c.conceptId} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-text">{c.concept}</span>
                    <span className={cn('text-xs font-mono',
                      c.confidenceScore >= 0.7 ? 'text-success' : c.confidenceScore >= 0.4 ? 'text-warning' : 'text-error')}>
                      {Math.round(c.confidenceScore * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      </FadeUp>
    </div>
  )
}

