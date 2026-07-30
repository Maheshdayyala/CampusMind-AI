'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { useAuth } from '@/lib/auth'
import { getDailyBriefing, getProgressSummary, getReviewDue, type DailyBriefing, type ProgressSummary, type ReviewDueItem } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import {
  TrendingUp, Brain, AlertTriangle, Clock, Calendar, FileText, Zap, ArrowRight, BookOpen, Flame, Trophy, BarChart3, Sparkles,
} from 'lucide-react'

type WeakTopic = { name: string; confidence: number }
type UpcomingExam = { course: string; date: string; daysUntil: number }

function extractWeakTopics(briefing: DailyBriefing, progress: ProgressSummary): WeakTopic[] {
  const fromBriefing = (briefing.reviewRecommended || []).map(r => ({ name: r.concept, confidence: r.confidence / 100 }))
  const fromProgress = (progress.conceptMastery || [])
    .filter(c => c.confidenceScore < 60)
    .map(c => ({ name: c.concept, confidence: c.confidenceScore / 100 }))
  const merged = [...fromBriefing, ...fromProgress]
  const seen = new Set<string>()
  return merged.filter(t => { if (seen.has(t.name)) return false; seen.add(t.name); return true }).slice(0, 6)
}

function extractExams(briefing: DailyBriefing): UpcomingExam[] {
  return (briefing.deadlines || []).map(d => ({ course: d.course, date: d.dueDate, daysUntil: d.daysUntil }))
}

export default function DashboardPage() {
  const { studentId, student } = useAuth()
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
  if (error) return <div className="p-6 max-w-7xl mx-auto text-center py-20"><p className="text-[var(--error)]">{error}</p></div>
  if (!briefing || !progress) return null

  const weakTopics = extractWeakTopics(briefing, progress)
  const exams = extractExams(briefing)
  const overview = briefing.overview
  const assignments = (briefing.deadlines || []).slice(0, 3)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">
            Dashboard
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[var(--text-secondary)] text-sm mt-1">
            Welcome back, {briefing.student} — {briefing.date}
          </motion.p>
        </div>
        <Link href="/exam-mode" className="btn-primary text-sm !py-2.5 !px-5">
          <Zap className="w-4 h-4" />
          Exam Mode
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={Flame} label="Study Streak" value={`${overview.studyStreak} days`} sub="Keep it going!" color="from-orange-500/20 to-orange-600/10" iconColor="text-orange-400" />
        <MetricCard icon={Brain} label="Avg Confidence" value={`${progress.overview.averageConfidence}%`} sub={`${progress.overview.weakTopicsCount} weak areas`} color="from-[#01696f]/20 to-[#0c4e54]/10" iconColor="text-primary" />
        <MetricCard icon={AlertTriangle} label="Review Due" value={`${reviewDue.length} topics`} sub="Spaced repetition" color="from-amber-500/20 to-amber-600/10" iconColor="text-amber-400" />
        <MetricCard icon={Trophy} label="Active Courses" value={`${overview.enrolledCourses}`} sub={`${progress.overview.totalInteractions} interactions`} color="from-emerald-500/20 to-emerald-600/10" iconColor="text-emerald-400" />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard glow>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Weak Topics</h2>
              <Link href="/review" className="text-sm text-[var(--accent-light)] hover:underline flex items-center gap-1">
                Review now <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {weakTopics.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No weak topics right now!</p>
              ) : weakTopics.map((t, i) => (
                <motion.div key={t.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-2 h-2 rounded-full', t.confidence < 0.4 ? 'bg-[var(--error)]' : 'bg-[var(--warning)]')} />
                    <span className="text-sm font-medium">{t.name}</span>
                  </div>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', t.confidence < 0.4 ? 'bg-[var(--error)]/10 text-[var(--error)]' : 'bg-[var(--warning)]/10 text-[var(--warning)]')}>
                    {Math.round(t.confidence * 100)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard glow>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Upcoming Deadlines</h2>
              <Link href="/analytics" className="text-sm text-[var(--accent-light)] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {exams.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {exams.map((exam, i) => (
                  <motion.div key={exam.course + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-[var(--accent-light)]" />
                      <span className="text-sm font-medium">{exam.course}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[var(--text-muted)]">{exam.date}</div>
                      <div className={cn('text-xs font-medium', exam.daysUntil <= 7 ? 'text-[var(--error)]' : 'text-[var(--success)]')}>
                        {exam.daysUntil > 0 ? `${exam.daysUntil} days` : 'Today!'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard glow>
            <h2 className="font-display font-bold text-lg mb-4">Assignments</h2>
            <div className="space-y-3">
              {assignments.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No assignments due</p>
              ) : assignments.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                  className="p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                  <div className="text-sm font-medium mb-1">{a.title}</div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Due {a.dueDate}</span>
                    <span className={cn('px-2 py-0.5 rounded-full', a.daysUntil <= 3 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400')}>
                      {a.daysUntil > 0 ? `${a.daysUntil}d left` : 'Overdue'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <Link href="/planner" className="btn-ghost w-full mt-3 text-sm">
              <Calendar className="w-4 h-4" />
              View planner
            </Link>
          </GlassCard>

          <GlassCard glow className="card-hero">
            <div className="eyebrow"><Sparkles className="w-3.5 h-3.5" />AI Focus</div>
            <h2 className="font-display font-bold text-lg mb-2">
              {weakTopics[0]
                ? `${weakTopics[0].name} needs attention`
                : 'All caught up'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
              {(() => {
                const topic = weakTopics[0]
                if (!topic) return 'No weak topics detected. Keep studying!'
                const reviewItem = reviewDue.find(r => r.conceptName === topic.name)
                if (reviewItem) {
                  return `Flagged because you last reviewed ${topic.name} ${reviewItem.daysSinceReview > 1 ? `${reviewItem.daysSinceReview} days ago` : 'yesterday'} and your confidence dropped to ${Math.round(topic.confidence * 100)}%.`
                }
                return `${topic.name} confidence is at ${Math.round(topic.confidence * 100)}% — below the retention threshold. A quick review would solidify it.`
              })()}
            </p>
            <Link href="/review" className="btn-primary text-sm !py-2 !px-4 self-start">
              <Clock className="w-4 h-4" />
              {reviewDue.length > 0 ? `Review ${reviewDue.length} topic${reviewDue.length > 1 ? 's' : ''}` : 'Go to Review Center'}
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, sub, color, iconColor }: { icon: any; label: string; value: string; sub: string; color: string; iconColor: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
      className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} border border-[var(--border-primary)] flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="font-display text-2xl font-bold mb-0.5">{value}</div>
      <div className="text-sm text-[var(--text-secondary)]">{label}</div>
      <div className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</div>
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8"><div className="skeleton h-9 w-48 mb-2" /><div className="skeleton h-5 w-64" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5"><div className="skeleton h-10 w-10 rounded-xl mb-3" /><div className="skeleton h-8 w-24 mb-1" /><div className="skeleton h-4 w-20 mb-1" /><div className="skeleton h-3 w-28" /></div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6"><div className="skeleton h-6 w-32 mb-4" />{[...Array(4)].map((_, i) => (<div key={i} className="skeleton h-12 w-full mb-2" />))}</div>
        </div>
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-card p-6"><div className="skeleton h-6 w-28 mb-4" />{[...Array(3)].map((_, j) => (<div key={j} className="skeleton h-14 w-full mb-2" />))}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
