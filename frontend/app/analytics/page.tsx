'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { useAuth } from '@/lib/auth'
import { getProgressSummary, getMasteryHeatmap } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { BarChart3, TrendingUp, TrendingDown, Brain, Clock, Flame, BookOpen, Target, Award, ChevronRight } from 'lucide-react'

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="skeleton h-9 w-48 mb-2" /><div className="skeleton h-5 w-64 mb-8" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6"><div className="glass-card p-6"><div className="skeleton h-64 w-full" /></div></div>
        <div className="space-y-6"><div className="glass-card p-6"><div className="skeleton h-40 w-full" /></div><div className="glass-card p-6"><div className="skeleton h-40 w-full" /></div></div>
      </div>
    </div>
  )

  if (error) return <div className="p-6 max-w-7xl mx-auto text-center py-20"><p className="text-[var(--error)]">{error}</p></div>
  if (!progress) return null

  const overview = progress.overview
  const concepts = progress.conceptMastery || []
  const activity = progress.recentActivity || []

  const stats = [
    { icon: Flame, label: 'Study Sessions', value: `${overview.studySessionsCompleted}`, change: `in ${progress.periodDays} days`, color: 'from-orange-500/20 to-orange-600/10', iconColor: 'text-orange-400' },
    { icon: Brain, label: 'Avg Confidence', value: `${overview.averageConfidence}%`, change: `across ${overview.totalConceptsTracked} concepts`, color: 'from-[#1a73e8]/20 to-[#0d47a1]/10', iconColor: 'text-[var(--accent-light)]' },
    { icon: BookOpen, label: 'Total Interactions', value: `${overview.totalInteractions}`, change: '+ from study sessions', color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-400' },
    { icon: Target, label: 'Weak Topics', value: `${overview.weakTopicsCount}`, change: 'Need attention', color: 'from-amber-500/20 to-amber-600/10', iconColor: 'text-amber-400' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">Analytics</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[var(--text-secondary)] text-sm mt-1">
            Real academic performance data — last {progress.periodDays} days
          </motion.p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} border border-[var(--border-primary)] flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div className="font-display text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{stat.change}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard glow className="p-6">
            <h2 className="font-display font-bold text-lg mb-5">Topic Confidence Scores</h2>
            <div className="space-y-4">
              {concepts.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No concept data yet</p>
              ) : concepts.sort((a: any, b: any) => a.confidenceScore - b.confidenceScore).map((t: any, i: number) => {
                const barColor = t.confidenceScore >= 70 ? 'from-emerald-500 to-emerald-400' :
                  t.confidenceScore >= 40 ? 'from-amber-500 to-amber-400' : 'from-[var(--error)] to-red-400'
                return (
                  <motion.div key={t.concept + i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span>{t.concept}</span>
                      <span className={cn('font-medium', t.confidenceScore >= 70 ? 'text-emerald-400' : t.confidenceScore >= 40 ? 'text-amber-400' : 'text-[var(--error)]')}>
                        {t.confidenceScore}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${t.confidenceScore}%` }}
                        transition={{ duration: 1, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full bg-gradient-to-r ${barColor}`} />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </GlassCard>

          <GlassCard glow className="p-6">
            <h2 className="font-display font-bold text-lg mb-5">Recent Activity</h2>
            <div className="space-y-3">
              {activity.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No recent activity</p>
              ) : activity.slice(0, 10).map((a: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                  <div className={cn('w-2 h-2 rounded-full',
                    a.type === 'confused_question' || a.type === 'incorrect_quiz' ? 'bg-[var(--error)]' :
                    a.type === 'correct_quiz' ? 'bg-emerald-400' : 'bg-[var(--accent-light)]')} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{a.summary || a.type}</div>
                    <div className="text-xs text-[var(--text-muted)]">{new Date(a.date).toLocaleDateString()}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard glow className="p-5">
            <h2 className="font-display font-bold text-lg mb-4">Performance Summary</h2>
            <div className="space-y-4">
              {[
                { label: 'Avg Confidence', value: `${overview.averageConfidence}%`, icon: Brain, color: 'text-[var(--accent-light)]' },
                { label: 'Study Sessions', value: `${overview.studySessionsCompleted}`, icon: Clock, color: 'text-emerald-400' },
                { label: 'Est. Study Time', value: `${overview.estimatedStudyMinutes}min`, icon: Flame, color: 'text-amber-400' },
                { label: 'Weak Topics', value: `${overview.weakTopicsCount}`, icon: Target, color: 'text-purple-400' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <div className="flex-1"><div className="text-xs text-[var(--text-muted)]">{s.label}</div><div className="text-sm font-medium">{s.value}</div></div>
                </div>
              ))}
            </div>
          </GlassCard>

          {heatmap?.courses?.map((course: any) => (
            <GlassCard key={course.code} glow className="p-5">
              <h2 className="font-display font-bold text-lg mb-2">{course.title}</h2>
              <p className="text-xs text-[var(--text-muted)] mb-4">{course.code} — concepts</p>
              <div className="space-y-2">
                {(course.concepts || []).slice(0, 5).map((c: any) => (
                  <div key={c.conceptId} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-[var(--border-primary)]">
                    <span className="text-xs font-medium">{c.concept}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded',
                      c.confidenceScore >= 0.7 ? 'bg-emerald-500/10 text-emerald-400' : c.confidenceScore >= 0.4 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-[var(--error)]')}>
                      {Math.round(c.confidenceScore * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}
