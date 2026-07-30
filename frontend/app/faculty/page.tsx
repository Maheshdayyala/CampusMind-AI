'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { listCourses, getProgressSummary, flagAtRiskTopics, type CourseInfo, type ProgressSummary, type FlagAtRiskResult } from '@/lib/mcp'
import { BookOpen, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react'
import { FadeUp } from '@/lib/animations'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function FacultyPage() {
  const { studentId, student } = useAuth()
  const [courses, setCourses] = useState<CourseInfo[]>([])
  const [progress, setProgress] = useState<ProgressSummary | null>(null)
  const [risk, setRisk] = useState<FlagAtRiskResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    Promise.all([
      listCourses(studentId),
      getProgressSummary(studentId, 30),
      flagAtRiskTopics(studentId),
    ]).then(([c, p, r]) => {
      setCourses(c.courses || [])
      setProgress(p)
      setRisk(r)
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [studentId])

  if (loading) return (
    <div>
      <div className="skeleton h-9 w-48 mb-2" />
      <div className="skeleton h-5 w-64 mb-8" />
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-24 rounded-lg" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 w-full" />)}</div>
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 w-full" />)}</div>
      </div>
    </div>
  )

  const avgC = progress?.overview?.averageConfidence ?? 0

  return (
    <div>
      <FadeUp>
      <div className="mb-8">
        <div className="text-xs text-accent uppercase tracking-wider mb-1">Faculty Dashboard</div>
        <h1 className="font-display text-3xl text-text">Course Overview</h1>
        <p className="text-sm text-muted mt-1">{student?.name || studentId} &middot; {courses.length} courses enrolled</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BookOpen, label: 'Courses', value: courses.length },
          { icon: TrendingUp, label: 'Avg Confidence', value: `${avgC.toFixed(0)}%` },
          { icon: AlertTriangle, label: 'At-Risk Topics', value: risk?.count ?? 0 },
          { icon: TrendingUp, label: 'Study Sessions', value: progress?.overview?.studySessionsCompleted ?? 0 },
        ].map((s, i) => (
          <div key={i} className="text-center p-5 rounded-lg border border-border">
            <s.icon className="w-5 h-5 text-accent mx-auto mb-2" />
            <div className="text-2xl font-semibold text-text">{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-text mb-4">Courses</h2>
          {courses.length === 0 && <p className="text-sm text-muted">No courses found.</p>}
          <div className="space-y-1">
            {courses.map(c => (
              <div key={c.id} className="flex items-center justify-between py-3 border-b border-divider">
                <div>
                  <div className="text-sm font-medium text-text">{c.title}</div>
                  <div className="text-xs text-muted">{c.code} &middot; {c.term}</div>
                </div>
                <Link href={`/chat?course=${c.id}`} className="text-xs text-accent hover:underline flex items-center gap-1">
                  Discuss <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text mb-4">At-Risk Topics</h2>
          {(!risk?.atRiskTopics || risk.atRiskTopics.length === 0) ? (
            <p className="text-sm text-muted">No at-risk topics identified.</p>
          ) : (
            <div className="space-y-1">
              {risk.atRiskTopics.slice(0, 5).map(t => (
                <div key={t.conceptId} className="py-3 border-b border-divider">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-xs font-mono px-1.5 py-0.5 rounded',
                      t.riskLevel === 'critical' ? 'bg-error/10 text-error' :
                      t.riskLevel === 'high' ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent')}>{t.riskLevel}</span>
                    <span className="text-sm font-medium text-text">{t.concept}</span>
                  </div>
                  <div className="text-xs text-muted">{t.course} &middot; confidence {t.confidenceScore.toFixed(0)}% &middot; last reviewed {t.daysSinceReview}d ago</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {risk?.summary && (
        <div className="mt-8 p-5 rounded-lg border border-border">
          <h2 className="text-sm font-semibold text-text mb-4">Risk Summary</h2>
          <div className="flex gap-6">
            {[
              { label: 'Critical', value: risk.summary.critical, color: 'text-error' },
              { label: 'High', value: risk.summary.high, color: 'text-warning' },
              { label: 'Medium', value: risk.summary.medium, color: 'text-accent' },
            ].map(s => (
              <div key={s.label}>
                <div className={cn('text-lg font-semibold', s.color)}>{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      </FadeUp>
    </div>
  )
}
