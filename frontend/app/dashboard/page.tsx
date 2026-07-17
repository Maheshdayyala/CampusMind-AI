'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { getAnalytics, type Analytics } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  Brain,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  Zap,
  ArrowRight,
  BookOpen,
  Flame,
  Trophy,
  BarChart3,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

export default function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!data) return null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[var(--text-secondary)] text-sm mt-1"
          >
            Your academic overview for Fall 2026
          </motion.p>
        </div>
        <Link href="/exam-mode" className="btn-primary text-sm !py-2.5 !px-5">
          <Zap className="w-4 h-4" />
          Exam Mode
        </Link>
      </div>

      {/* Metric Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <MetricCard
          icon={Flame}
          label="Study Streak"
          value={`${data.studyStreak} days`}
          sub="Keep it going!"
          color="from-orange-500/20 to-orange-600/10"
          iconColor="text-orange-400"
        />
        <MetricCard
          icon={Brain}
          label="Memory Score"
          value={`${data.memoryScore}%`}
          sub={`${data.weakTopics.length} weak areas`}
          color="from-[#1a73e8]/20 to-[#0d47a1]/10"
          iconColor="text-[var(--accent-light)]"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Review Due"
          value={`${data.reviewDue} topics`}
          sub="Spaced repetition"
          color="from-amber-500/20 to-amber-600/10"
          iconColor="text-amber-400"
        />
        <MetricCard
          icon={Trophy}
          label="Active Courses"
          value={`${data.activeCourses}`}
          sub={`${data.totalEntries} memory entries`}
          color="from-emerald-500/20 to-emerald-600/10"
          iconColor="text-emerald-400"
        />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity & Weak Topics */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard glow delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Weak Topics</h2>
              <Link href="/review" className="text-sm text-[var(--accent-light)] hover:underline flex items-center gap-1">
                Review now <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {data.weakTopics.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      t.confidence < 0.4 ? 'bg-[var(--error)]' : 'bg-[var(--warning)]'
                    )} />
                    <span className="text-sm font-medium">{t.name}</span>
                  </div>
                  <span className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    t.confidence < 0.4
                      ? 'bg-[var(--error)]/10 text-[var(--error)]'
                      : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                  )}>
                    {Math.round(t.confidence * 100)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard glow delay={0.15}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Upcoming Exams</h2>
              <Link href="/analytics" className="text-sm text-[var(--accent-light)] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {data.upcomingExams.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No upcoming exams</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingExams.map((exam, i) => (
                  <motion.div
                    key={exam.course}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-[var(--accent-light)]" />
                      <span className="text-sm font-medium">{exam.course}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[var(--text-muted)]">{exam.date}</div>
                      <div className={cn(
                        'text-xs font-medium',
                        exam.daysUntil <= 7 ? 'text-[var(--error)]' : 'text-[var(--success)]'
                      )}>
                        {exam.daysUntil > 0 ? `${exam.daysUntil} days` : 'Today!'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <GlassCard glow delay={0.2}>
            <h2 className="font-display font-bold text-lg mb-4">Assignments</h2>
            <div className="space-y-3">
              {data.assignments.slice(0, 3).map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]"
                >
                  <div className="text-sm font-medium mb-1">{a.title}</div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Due {a.dueDate}</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full',
                      new Date(a.dueDate) < new Date(Date.now() + 7 * 86400000)
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    )}>
                      {Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000)} days left
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

          <GlassCard glow delay={0.25}>
            <h2 className="font-display font-bold text-lg mb-2">Quick Actions</h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">Common tasks to keep you on track</p>
            <div className="space-y-2">
              <Link href="/chat" className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)] text-sm hover:bg-white/[0.06] transition-colors">
                <Brain className="w-4 h-4 text-[var(--accent-light)]" />
                Log today&apos;s study
              </Link>
              <Link href="/review" className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)] text-sm hover:bg-white/[0.06] transition-colors">
                <Clock className="w-4 h-4 text-amber-400" />
                Review weak topics
              </Link>
              <Link href="/exam-mode" className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)] text-sm hover:bg-white/[0.06] transition-colors">
                <Zap className="w-4 h-4 text-purple-400" />
                Exam mode
              </Link>
              <Link href="/upload" className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)] text-sm hover:bg-white/[0.06] transition-colors">
                <FileText className="w-4 h-4 text-emerald-400" />
                Upload notes
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, sub, color, iconColor }: {
  icon: any; label: string; value: string; sub: string; color: string; iconColor: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
      }}
      className="glass-card p-5"
    >
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
      <div className="mb-8">
        <div className="skeleton h-9 w-48 mb-2" />
        <div className="skeleton h-5 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="skeleton h-10 w-10 rounded-xl mb-3" />
            <div className="skeleton h-8 w-24 mb-1" />
            <div className="skeleton h-4 w-20 mb-1" />
            <div className="skeleton h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="skeleton h-6 w-32 mb-4" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full mb-2" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-6 w-28 mb-4" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="skeleton h-14 w-full mb-2" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
