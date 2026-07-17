'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { getAnalytics, type Analytics } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Brain,
  Clock,
  Flame,
  BookOpen,
  Target,
  Award,
  ChevronRight,
} from 'lucide-react'

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics().then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="skeleton h-9 w-48 mb-2" />
        <div className="skeleton h-5 w-64 mb-8" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6"><div className="skeleton h-64 w-full" /></div>
          </div>
          <div className="space-y-6">
            <div className="glass-card p-6"><div className="skeleton h-40 w-full" /></div>
            <div className="glass-card p-6"><div className="skeleton h-40 w-full" /></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">
            Analytics
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[var(--text-secondary)] text-sm mt-1">
            Track your academic performance and study patterns
          </motion.p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {[
          { icon: Flame, label: 'Study Streak', value: `${data.studyStreak}d`, change: '+2 from last week', color: 'from-orange-500/20 to-orange-600/10', iconColor: 'text-orange-400' },
          { icon: Brain, label: 'Memory Score', value: `${data.memoryScore}%`, change: '+5% this month', color: 'from-[#1a73e8]/20 to-[#0d47a1]/10', iconColor: 'text-[var(--accent-light)]' },
          { icon: BookOpen, label: 'Total Entries', value: `${data.totalEntries}`, change: '+3 this week', color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-400' },
          { icon: Target, label: 'Weak Topics', value: `${data.weakTopics.length}`, change: 'Need attention', color: 'from-amber-500/20 to-amber-600/10', iconColor: 'text-amber-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card p-5"
          >
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
        {/* Weak Topics Chart */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard glow className="p-6">
            <h2 className="font-display font-bold text-lg mb-5">Topic Confidence Scores</h2>
            <div className="space-y-4">
              {data.weakTopics
                .concat([{ name: 'Regular Expressions', confidence: 0.75 }, { name: 'Derivatives', confidence: 0.8 }, { name: 'Hash Tables', confidence: 0.7 }])
                .sort((a, b) => a.confidence - b.confidence)
                .map((t, i) => {
                  const barColor = t.confidence >= 0.7 ? 'from-emerald-500 to-emerald-400' :
                    t.confidence >= 0.4 ? 'from-amber-500 to-amber-400' :
                    'from-[var(--error)] to-red-400'
                  return (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <div className="flex justify-between text-sm mb-1.5">
                        <span>{t.name}</span>
                        <span className={cn(
                          'font-medium',
                          t.confidence >= 0.7 ? 'text-emerald-400' : t.confidence >= 0.4 ? 'text-amber-400' : 'text-[var(--error)]'
                        )}>
                          {Math.round(t.confidence * 100)}%
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${t.confidence * 100}%` }}
                          transition={{ duration: 1, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                        />
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          </GlassCard>

          {/* Activity Chart */}
          <GlassCard glow className="p-6">
            <h2 className="font-display font-bold text-lg mb-5">Study Activity (Last 7 Days)</h2>
            <div className="flex items-end justify-between gap-2 h-40">
              {[
                { day: 'Mon', hours: 3.5 },
                { day: 'Tue', hours: 2 },
                { day: 'Wed', hours: 4 },
                { day: 'Thu', hours: 1.5 },
                { day: 'Fri', hours: 3 },
                { day: 'Sat', hours: 5 },
                { day: 'Sun', hours: 0 },
              ].map((d, i) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.hours / 5) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      'w-full max-w-[40px] rounded-lg',
                      d.hours > 0 ? 'bg-gradient-to-t from-[#1a73e8] to-[#42a5f5]' : 'bg-white/[0.04]'
                    )}
                    style={{ minHeight: d.hours > 0 ? undefined : '8px' }}
                  />
                  <span className="text-xs text-[var(--text-muted)]">{d.day}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{d.hours}h</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <GlassCard glow className="p-5">
            <h2 className="font-display font-bold text-lg mb-4">Performance Summary</h2>
            <div className="space-y-4">
              {[
                { label: 'Avg. Study Sessions/Week', value: '8.5', icon: Clock, color: 'text-[var(--accent-light)]' },
                { label: 'Avg. Session Duration', value: '52 min', icon: Clock, color: 'text-emerald-400' },
                { label: 'Topics Mastered', value: '12', icon: Award, color: 'text-amber-400' },
                { label: 'Topics in Progress', value: '7', icon: Target, color: 'text-purple-400' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <div className="flex-1">
                    <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
                    <div className="text-sm font-medium">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard glow className="p-5">
            <h2 className="font-display font-bold text-lg mb-2">Weekly Streak</h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">Consistency tracker</p>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 21 }, (_, i) => {
                const active = i < 12 || (i >= 14 && i < 16)
                return (
                  <div
                    key={i}
                    className={cn(
                      'aspect-square rounded-md transition-colors',
                      active ? 'bg-[#1a73e8]/40 border border-[#1a73e8]/30' : 'bg-white/[0.04] border border-white/[0.06]'
                    )}
                  />
                )
              })}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-[var(--text-muted)]">
              <span>12-day streak</span>
              <span className="text-emerald-400">Best: 15 days</span>
            </div>
          </GlassCard>

          <GlassCard glow className="p-5">
            <h2 className="font-display font-bold text-lg mb-2">Recommendations</h2>
            <div className="space-y-2 mt-3">
              {[
                'Review Closure Properties',
                'Practice NFA to DFA conversion',
                'Study Limits & Continuity',
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] p-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <ChevronRight className="w-3 h-3 text-[var(--accent-light)]" />
                  {r}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
