'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { getDailyBriefing, getProgressSummary, getReviewDue, type DailyBriefing, type ProgressSummary, type ReviewDueItem } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { ArrowRight, Clock, BookOpen, AlertCircle } from 'lucide-react'
import { FadeUp, ScaleIn, Stagger, hoverLift } from '@/lib/animations'

type WeakTopic = { name: string; confidence: number }
type UpcomingExam = { course: string; date: string; daysUntil: number }

function extractWeakTopics(briefing: DailyBriefing, progress: ProgressSummary): WeakTopic[] {
  const fromBriefing = (briefing.reviewRecommended || []).map(r => ({ name: r.concept, confidence: r.confidence / 100 }))
  const fromProgress = (progress.conceptMastery || []).filter(c => c.confidenceScore < 60).map(c => ({ name: c.concept, confidence: c.confidenceScore / 100 }))
  const merged = [...fromBriefing, ...fromProgress]
  const seen = new Set<string>()
  return merged.filter(t => { if (seen.has(t.name)) return false; seen.add(t.name); return true }).slice(0, 6)
}

function extractExams(briefing: DailyBriefing): UpcomingExam[] {
  return (briefing.deadlines || []).map(d => ({ course: d.course, date: d.dueDate, daysUntil: d.daysUntil }))
}

export default function DashboardPage() {
  const { studentId } = useAuth()
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null)
  const [progress, setProgress] = useState<ProgressSummary | null>(null)
  const [reviewDue, setReviewDue] = useState<ReviewDueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentId) return
    Promise.all([
      getDailyBriefing(studentId),
      getProgressSummary(studentId, 14),
      getReviewDue(studentId, 3),
    ]).then(([b, p, r]) => {
      setBriefing(b)
      setProgress(p)
      setReviewDue(r.results || [])
      setLoading(false)
    }).catch((err) => {
      setError(err.message)
      setLoading(false)
    })
  }, [studentId])

  if (loading) return <DashboardSkeleton />
  if (error) return <div className="text-center py-20 text-error">{error}</div>
  if (!briefing || !progress) return null

  const weakTopics = extractWeakTopics(briefing, progress)
  const exams = extractExams(briefing)
  const overview = briefing.overview
  const assignments = (briefing.deadlines || []).slice(0, 3)
  const topWeak = weakTopics[0]
  const reviewItem = topWeak ? reviewDue.find(r => r.conceptName === topWeak.name) : null

  return (
    <div>
      <FadeUp>
        <div className="mb-10">
          <p className="text-sm text-muted mb-1">{briefing.date}</p>
          <h1 className="font-display text-3xl text-text">
            Welcome back, {briefing.student}
          </h1>
        </div>
      </FadeUp>

      {topWeak && (
        <ScaleIn delay={0.1}>
          <motion.div whileHover={{ y: -1 }} className="mb-10 p-6 rounded-lg bg-accent/5 border border-accent/10">
            <p className="text-xs uppercase tracking-wider text-accent font-medium mb-1">AI Focus</p>
            <h2 className="font-display text-2xl text-text mb-2">
              {topWeak.name} needs attention
            </h2>
            <p className="text-sm text-muted mb-4 max-w-xl">
              {reviewItem
                ? `Last reviewed ${reviewItem.daysSinceReview > 1 ? `${reviewItem.daysSinceReview} days ago` : 'yesterday'} — confidence dropped to ${Math.round(topWeak.confidence * 100)}%.`
                : `Confidence is at ${Math.round(topWeak.confidence * 100)}% — below the retention threshold. A quick review would solidify it.`
              }
            </p>
            <Link href="/review" className="btn btn-primary btn-sm">
              Review now <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        </ScaleIn>
      )}

      <FadeUp delay={0.2}>
        <div className="flex items-center gap-6 mb-10 text-sm">
          <div>
            <span className="font-semibold text-text text-lg">{overview.studyStreak}</span>
            <span className="text-muted ml-1">day streak</span>
          </div>
          <div>
            <span className="font-semibold text-text text-lg">{progress.overview.averageConfidence}%</span>
            <span className="text-muted ml-1">avg confidence</span>
          </div>
          <div>
            <span className="font-semibold text-text text-lg">{overview.enrolledCourses}</span>
            <span className="text-muted ml-1">courses</span>
          </div>
          <div>
            <span className="font-semibold text-text text-lg">{reviewDue.length}</span>
            <span className="text-muted ml-1">due for review</span>
          </div>
        </div>
      </FadeUp>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FadeUp delay={0.25}>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text">Weak Topics</h2>
                <Link href="/review" className="text-xs text-muted hover:text-text transition-colors">View all</Link>
              </div>
              {weakTopics.length === 0 ? (
                <p className="text-sm text-muted">No weak topics right now</p>
              ) : (
                <div className="space-y-2">
                  {weakTopics.map((t, i) => (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                      className="flex items-center gap-3 py-2"
                    >
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        t.confidence < 0.4 ? 'bg-error' : t.confidence < 0.7 ? 'bg-warning' : 'bg-success'
                      )} />
                      <span className="text-sm text-text flex-1">{t.name}</span>
                      <span className={cn(
                        'text-xs font-mono',
                        t.confidence < 0.4 ? 'text-error' : t.confidence < 0.7 ? 'text-warning' : 'text-success'
                      )}>
                        {Math.round(t.confidence * 100)}%
                      </span>
                      <div className="w-16 h-1 rounded-full bg-offset overflow-hidden">
                        <div className={cn(
                          'h-full rounded-full transition-all',
                          t.confidence < 0.4 ? 'bg-error' : t.confidence < 0.7 ? 'bg-warning' : 'bg-success'
                        )} style={{ width: `${t.confidence * 100}%` }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </FadeUp>

          <FadeUp delay={0.35}>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text">Upcoming</h2>
                <Link href="/planner" className="text-xs text-muted hover:text-text transition-colors">View all</Link>
              </div>
              {exams.length === 0 ? (
                <p className="text-sm text-muted">No upcoming deadlines</p>
              ) : (
                <div className="space-y-2">
                  {exams.map((exam, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                      className="flex items-center justify-between py-2 border-b border-divider last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-3.5 h-3.5 text-muted" />
                        <span className="text-sm text-text">{exam.course}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted">{exam.date}</div>
                        <div className={cn('text-xs', exam.daysUntil <= 7 ? 'text-error' : 'text-muted')}>
                          {exam.daysUntil > 0 ? `${exam.daysUntil}d` : 'Today'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </FadeUp>
        </div>

        <div className="space-y-8">
          <FadeUp delay={0.3}>
            <section>
              <h2 className="text-sm font-semibold text-text mb-4">Assignments</h2>
              {assignments.length === 0 ? (
                <p className="text-sm text-muted">No assignments due</p>
              ) : (
                <div className="space-y-2">
                  {assignments.map((a) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.3 }}
                      className="card-elevated"
                    >
                      <div className="text-sm text-text mb-0.5">{a.title}</div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Due {a.dueDate}</span>
                        <span className={cn(a.daysUntil <= 3 ? 'text-warning' : 'text-muted')}>
                          {a.daysUntil > 0 ? `${a.daysUntil}d left` : 'Overdue'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  <Link href="/planner" className="btn btn-ghost btn-sm w-full mt-2">View planner</Link>
                </div>
              )}
            </section>
          </FadeUp>

          {reviewDue.length > 0 && (
            <FadeUp delay={0.4}>
              <section>
                <h2 className="text-sm font-semibold text-text mb-4">Due for Review</h2>
                <div className="space-y-2">
                  {reviewDue.slice(0, 4).map((r) => (
                    <motion.div
                      key={r.conceptId}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45, duration: 0.3 }}
                      className="flex items-center gap-3 py-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span className="text-sm text-text flex-1">{r.conceptName}</span>
                      <span className="text-xs text-muted">{r.daysSinceReview}d ago</span>
                    </motion.div>
                  ))}
                </div>
              </section>
            </FadeUp>
          )}
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
        <div className="skeleton h-4 w-32 mb-2" />
        <div className="skeleton h-9 w-64" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="skeleton h-32 w-full mb-10 rounded-lg" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-6 mb-10">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-6 w-24" />)}
      </motion.div>
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-8 w-full" />)}
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
        </motion.div>
      </div>
    </div>
  )
}
