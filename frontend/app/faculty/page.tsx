'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { listCourses, getProgressSummary, flagAtRiskTopics, type CourseInfo, type ProgressSummary, type FlagAtRiskResult } from '@/lib/mcp'
import { BookOpen, AlertTriangle, TrendingUp, Users, BarChart3, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
    </div>
  )

  const avgC = progress?.overview?.averageConfidence ?? 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="card-hero">
        <div className="eyebrow"><Users className="w-3 h-3" /> Faculty Dashboard</div>
        <h1 className="text-xl font-bold">Course Overview</h1>
        <p className="text-muted text-sm mt-1">{student?.name || studentId} &middot; {courses.length} courses enrolled</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <BookOpen className="w-5 h-5 text-primary mb-2" />
          <div className="text-2xl font-bold">{courses.length}</div>
          <div className="text-xs text-muted">Active Courses</div>
        </div>
        <div className="metric-card">
          <BarChart3 className="w-5 h-5 text-primary mb-2" />
          <div className="text-2xl font-bold">{avgC.toFixed(0)}%</div>
          <div className="text-xs text-muted">Avg Confidence</div>
        </div>
        <div className="metric-card">
          <AlertTriangle className="w-5 h-5 text-primary mb-2" />
          <div className="text-2xl font-bold">{risk?.count ?? 0}</div>
          <div className="text-xs text-muted">At-Risk Topics</div>
        </div>
        <div className="metric-card">
          <TrendingUp className="w-5 h-5 text-primary mb-2" />
          <div className="text-2xl font-bold">{progress?.overview?.studySessionsCompleted ?? 0}</div>
          <div className="text-xs text-muted">Study Sessions</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <h2 className="font-semibold text-sm">Courses</h2>
          {courses.length === 0 && <p className="text-sm text-faint">No courses found.</p>}
          {courses.map(c => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium">{c.title}</div>
                <div className="text-xs text-muted">{c.code} &middot; {c.term}</div>
              </div>
              <Link href={`/chat?course=${c.id}`} className="tag">
                Discuss <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          ))}
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold text-sm">At-Risk Topics</h2>
          {(!risk?.atRiskTopics || risk.atRiskTopics.length === 0) && (
            <p className="text-sm text-faint">No at-risk topics identified.</p>
          )}
          {risk?.atRiskTopics?.slice(0, 5).map(t => (
            <div key={t.conceptId} className="py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <span className={`tag ${t.riskLevel === 'critical' ? 'tag-warn' : 'tag-ok'}`}>{t.riskLevel}</span>
                <span className="text-sm font-medium">{t.concept}</span>
              </div>
              <div className="text-xs text-muted mt-1">{t.course} &middot; confidence {t.confidenceScore.toFixed(0)}% &middot; last reviewed {t.daysSinceReview}d ago</div>
            </div>
          ))}
        </div>
      </div>

      {risk?.summary && (
        <div className="card">
          <h2 className="font-semibold text-sm mb-3">Risk Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold" style={{color:'var(--color-error)'}}>{risk.summary.critical}</div>
              <div className="text-xs text-muted">Critical</div>
            </div>
            <div>
              <div className="text-lg font-bold" style={{color:'var(--color-warning)'}}>{risk.summary.high}</div>
              <div className="text-xs text-muted">High</div>
            </div>
            <div>
              <div className="text-lg font-bold" style={{color:'var(--color-success)'}}>{risk.summary.medium}</div>
              <div className="text-xs text-muted">Medium</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
