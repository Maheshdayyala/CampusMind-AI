'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { useAuth } from '@/lib/auth'
import { getDeadlineTimeline, suggestReviewPlan, flagAtRiskTopics, listCourses, setStudyGoal, recordStudySession } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { Calendar, CheckCircle2, Clock, AlertCircle, BookOpen, ChevronRight, ListTodo, Plus, ArrowRight } from 'lucide-react'

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function PlannerPage() {
  const { studentId } = useAuth()
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [reviewPlan, setReviewPlan] = useState<any[]>([])
  const [atRisk, setAtRisk] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState('Mon')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentId) return
    Promise.all([
      getDeadlineTimeline(studentId),
      suggestReviewPlan(studentId, 5),
      flagAtRiskTopics(studentId),
      listCourses(studentId),
    ]).then(([d, p, r, c]) => {
      setDeadlines(d.deadlines || [])
      setReviewPlan(p.plan || [])
      setAtRisk(r.atRiskTopics || [])
      setCourses(c.courses || [])
      setLoading(false)
    }).catch((err) => { setError(err.message); setLoading(false) })
  }, [studentId])

  const todaySchedule = (reviewPlan || []).slice(0, 4).map((item, i) => ({
    time: `${9 + i * 2}:00`,
    subject: item.concept,
    duration: `${item.recommendedDuration}min`,
    type: item.daysSinceReview > 7 ? 'review' : 'study',
  }))

  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="skeleton h-9 w-48 mb-2" /><div className="skeleton h-5 w-64 mb-6" />
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-4"><div className="glass-card p-6"><div className="skeleton h-64 w-full" /></div></div>
        <div className="space-y-4"><div className="glass-card p-6"><div className="skeleton h-40 w-full" /></div></div>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">Study Planner</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[var(--text-secondary)] text-sm mt-1">
            {reviewPlan.length} topics suggested — powered by spaced repetition
          </motion.p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-[var(--error)]">{error}</div>}

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-4">
          <GlassCard glow className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg">Suggested Review Plan</h2>
            </div>
            <div className="space-y-2">
              {todaySchedule.length === 0 ? (
                <div className="text-center py-8"><p className="text-sm text-[var(--text-muted)]">No review items suggested</p></div>
              ) : todaySchedule.map((session, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={cn('flex items-center gap-4 p-3 rounded-xl border transition-all',
                    session.type === 'study' ? 'bg-[#1a73e8]/5 border-[var(--border-primary)]' : 'bg-amber-500/5 border-amber-500/10')}>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold',
                    session.type === 'study' ? 'bg-[#1a73e8]/20 text-[var(--accent-light)]' : 'bg-amber-500/20 text-amber-400')}>
                    {session.time}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{session.subject}</div>
                    <div className="text-xs text-[var(--text-muted)] capitalize">{session.type} &middot; {session.duration}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {reviewPlan.length > 0 && (
            <GlassCard glow className="p-5">
              <h2 className="font-display font-bold text-lg mb-4">All Review Suggestions</h2>
              <div className="space-y-2">
                {reviewPlan.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                    <div>
                      <div className="text-sm font-medium">{item.concept}</div>
                      <div className="text-xs text-[var(--text-muted)]">{item.course || 'General'} &middot; {item.recommendedDuration}min</div>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', item.currentConfidence < 40 ? 'bg-red-500/10 text-[var(--error)]' : item.currentConfidence < 60 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400')}>
                      {item.currentConfidence}%
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {atRisk.length > 0 && (
            <GlassCard glow className="p-5">
              <h2 className="font-display font-bold text-lg mb-4">At-Risk Topics</h2>
              <div className="space-y-2">
                {atRisk.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <AlertCircle className="w-4 h-4 text-[var(--error)] shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.concept}</div>
                      <div className="text-xs text-[var(--text-muted)]">{item.course} &middot; Risk: {item.riskLevel}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        <div className="space-y-6">
          <GlassCard glow className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Deadlines</h2>
              <span className="text-xs text-[var(--text-muted)]">{deadlines.length} total</span>
            </div>
            <div className="space-y-3">
              {deadlines.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No upcoming deadlines</p>
              ) : deadlines.slice(0, 5).map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                  <div className="text-sm font-medium mb-1">{d.title}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">{d.course} &middot; Due {d.dueDate}</span>
                    <span className={cn('px-2 py-0.5 rounded-full font-medium',
                      d.urgency === 'critical' ? 'bg-red-500/10 text-[var(--error)]' : d.urgency === 'high' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400')}>
                      {d.daysUntil > 0 ? `${d.daysUntil}d left` : 'Overdue'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard glow className="p-5">
            <h2 className="font-display font-bold text-lg mb-2">Study Tips</h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">Maximize your productivity</p>
            <div className="space-y-3">
              {[
                'Use active recall instead of passive reading',
                'Break study sessions into 50-minute blocks',
                'Review within 24 hours of learning',
                atRisk.length > 0 ? `${atRisk.length} topics need urgent attention` : 'Stay consistent with daily reviews',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <SparklesIcon className="w-4 h-4 text-[var(--accent-light)] shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18M5.64 5.64l12.72 12.72M18.36 5.64l-12.72 12.72" />
    </svg>
  )
}
