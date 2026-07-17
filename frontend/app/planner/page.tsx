'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { getAssignments, type Assignment, getCourses, type Course } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  ChevronRight,
  ListTodo,
  Plus,
  ArrowRight,
} from 'lucide-react'

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const scheduleData = [
  { day: 'Mon', sessions: [
    { time: '09:00', subject: 'Automata Theory', duration: '1.5h', type: 'study' },
    { time: '11:00', subject: 'Data Structures', duration: '2h', type: 'study' },
    { time: '14:00', subject: 'Review', duration: '1h', type: 'review' },
  ]},
  { day: 'Tue', sessions: [
    { time: '10:00', subject: 'Calculus', duration: '2h', type: 'study' },
    { time: '14:00', subject: 'Automata Theory', duration: '1.5h', type: 'study' },
  ]},
  { day: 'Wed', sessions: [
    { time: '09:00', subject: 'Data Structures', duration: '2h', type: 'study' },
    { time: '13:00', subject: 'Practice Problems', duration: '2h', type: 'practice' },
  ]},
  { day: 'Thu', sessions: [
    { time: '10:00', subject: 'Automata Theory', duration: '2h', type: 'study' },
    { time: '14:00', subject: 'Review', duration: '1h', type: 'review' },
  ]},
  { day: 'Fri', sessions: [
    { time: '09:00', subject: 'Calculus', duration: '1.5h', type: 'study' },
    { time: '11:00', subject: 'Mock Test', duration: '2h', type: 'test' },
  ]},
  { day: 'Sat', sessions: [
    { time: '10:00', subject: 'Weak Topics', duration: '2h', type: 'review' },
  ]},
  { day: 'Sun', sessions: []},
]

export default function PlannerPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedDay, setSelectedDay] = useState('Mon')

  useEffect(() => {
    Promise.all([getAssignments(), getCourses()]).then(([a, c]) => {
      setAssignments(a)
      setCourses(c)
    })
  }, [])

  const todaySchedule = scheduleData.find(d => d.day === selectedDay)?.sessions || []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold">
            Study Planner
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[var(--text-secondary)] text-sm mt-1">
            Plan your week, track assignments, stay on top of deadlines
          </motion.p>
        </div>
        <button className="btn-primary text-sm !py-2.5 !px-5">
          <Plus className="w-4 h-4" />
          Add session
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Weekly Calendar */}
        <div className="space-y-4">
          <GlassCard glow className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg">This Week</h2>
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-xs">&larr;</button>
                <span className="text-sm font-medium">Jul 14 - 20</span>
                <button className="btn-ghost text-xs">&rarr;</button>
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto">
              {weekDays.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-w-[60px] text-center border',
                    selectedDay === d
                      ? 'bg-[#1a73e8]/20 text-[var(--accent-light)] border-[var(--border-glow)]'
                      : 'glass text-[var(--text-secondary)] border-[var(--border-primary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <div className="text-xs mb-1">{d}</div>
                  <div className="font-display text-lg font-bold">14</div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {todaySchedule.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--text-muted)]">No sessions scheduled for {selectedDay}</p>
                </div>
              ) : (
                todaySchedule.map((session, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-xl border transition-all',
                      session.type === 'study'
                        ? 'bg-[#1a73e8]/5 border-[var(--border-primary)]'
                        : session.type === 'review'
                        ? 'bg-amber-500/5 border-amber-500/10'
                        : session.type === 'test'
                        ? 'bg-purple-500/5 border-purple-500/10'
                        : 'bg-emerald-500/5 border-emerald-500/10'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold',
                      session.type === 'study' ? 'bg-[#1a73e8]/20 text-[var(--accent-light)]' :
                      session.type === 'review' ? 'bg-amber-500/20 text-amber-400' :
                      session.type === 'test' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    )}>
                      {session.time}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{session.subject}</div>
                      <div className="text-xs text-[var(--text-muted)] capitalize">{session.type} &middot; {session.duration}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Weekly Progress */}
          <GlassCard glow className="p-5">
            <h2 className="font-display font-bold text-lg mb-4">Weekly Progress</h2>
            <div className="space-y-3">
              {[
                { label: 'Study hours completed', current: 12, target: 20 },
                { label: 'Topics reviewed', current: 5, target: 8 },
                { label: 'Practice problems', current: 18, target: 30 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">{item.label}</span>
                    <span className="font-medium">{item.current}/{item.target}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.current / item.target) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-[#1a73e8] to-[#42a5f5]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <GlassCard glow className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Assignments</h2>
              <span className="text-xs text-[var(--text-muted)]">{assignments.length} total</span>
            </div>
            <div className="space-y-3">
              {assignments.map((a, i) => {
                const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000)
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]"
                  >
                    <div className="text-sm font-medium mb-1">{a.title}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Due {a.dueDate}</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full font-medium',
                        daysLeft <= 3 ? 'bg-red-500/10 text-[var(--error)]' :
                        daysLeft <= 7 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      )}>
                        {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
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
