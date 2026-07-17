'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { generateExamPlan, type Analytics, getAnalytics } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import {
  Zap,
  Brain,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Target,
  ListChecks,
  FileQuestion,
  GraduationCap,
  Calendar,
  BarChart3,
  RefreshCw,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

export default function ExamModePage() {
  const [examName, setExamName] = useState('')
  const [daysUntil, setDaysUntil] = useState(7)
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [plan, setPlan] = useState<any>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [activeTab, setActiveTab] = useState('plan')
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])

  useEffect(() => {
    getAnalytics().then(setAnalytics)
  }, [])

  const handleGenerate = async () => {
    if (!examName.trim()) return
    setGenerating(true)
    const result = await generateExamPlan(examName.trim(), daysUntil)
    setPlan(result)
    setGenerated(true)
    setGenerating(false)
    setQuizAnswers([])
  }

  const reset = () => {
    setGenerated(false)
    setPlan(null)
    setQuizAnswers([])
  }

  const tabs = [
    { id: 'plan', label: 'Revision Plan', icon: Calendar },
    { id: 'weak', label: 'Weak Topics', icon: AlertTriangle },
    { id: 'quiz', label: 'Practice Quiz', icon: FileQuestion },
    { id: 'flashcards', label: 'Flashcards', icon: Brain },
    { id: 'schedule', label: 'Schedule', icon: Clock },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold flex items-center gap-3"
          >
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </span>
            Exam Mode
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-[var(--text-secondary)] text-sm mt-1"
          >
            Type your exam and get a complete preparation plan in seconds
          </motion.p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!generated ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <GlassCard glow className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Prepare for your exam</h2>
                <p className="text-[var(--text-secondary)] text-sm">
                  Tell me about your exam and I&apos;ll create a personalized study plan
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Exam name / subject</label>
                  <input
                    type="text"
                    placeholder='e.g. "Automata Theory Final"'
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                    className="input-field"
                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Days until exam</label>
                  <div className="flex gap-2">
                    {[1, 3, 7, 14, 30].map(d => (
                      <button
                        key={d}
                        onClick={() => setDaysUntil(d)}
                        className={cn(
                          'flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border',
                          daysUntil === d
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'glass text-[var(--text-secondary)] border-[var(--border-primary)]'
                        )}
                      >
                        {d} {d === 1 ? 'day' : 'days'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !examName.trim()}
                className="btn-primary w-full text-base !py-3.5 disabled:opacity-60"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                    />
                    Generating your exam plan...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    Generate exam plan
                  </span>
                )}
              </button>

              {analytics && analytics.weakTopics.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-3">
                    <Brain className="w-3 h-3" />
                    Based on your weak areas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analytics.weakTopics.map(t => (
                      <span key={t.name} className="px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {t.name} ({Math.round(t.confidence * 100)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ) : plan ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Exam Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-static p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">{examName}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{daysUntil} days to prepare &middot; {plan.weakTopics.length} weak areas identified</p>
                </div>
              </div>
              <button onClick={reset} className="btn-ghost text-sm">
                <RefreshCw className="w-4 h-4" />
                New exam
              </button>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap border',
                      activeTab === tab.id
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : 'glass text-[var(--text-secondary)] border-[var(--border-primary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'plan' && (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {plan.revisionPlan.map((day: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass-card p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                            i < daysUntil ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'
                          )}>
                            {i + 1}
                          </div>
                          <span className="font-display font-bold">Day {i + 1}</span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">{day.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {day.topics.map((t: string, j: number) => (
                          <span key={j} className="px-2.5 py-1 rounded-full text-xs bg-white/[0.04] border border-[var(--border-primary)] text-[var(--text-secondary)]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'weak' && (
                <motion.div
                  key="weak"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-6"
                >
                  <h3 className="font-display font-bold text-lg mb-1">Focus Areas</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-5">Topics that need the most attention</p>
                  <div className="space-y-3">
                    {plan.weakTopics.map((t: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10"
                      >
                        <AlertTriangle className="w-4 h-4 text-[var(--error)]" />
                        <span className="text-sm font-medium">{t}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'quiz' && (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {plan.quiz.map((q: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-5"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm font-medium">{q.question}</p>
                      </div>
                      <div className="space-y-2 ml-10">
                        {q.options.map((opt: string, j: number) => {
                          const isSelected = quizAnswers[i] === j
                          const isCorrect = j === q.correct
                          const showResult = quizAnswers[i] !== undefined
                          return (
                            <button
                              key={j}
                              onClick={() => {
                                const newAnswers = [...quizAnswers]
                                newAnswers[i] = j
                                setQuizAnswers(newAnswers)
                              }}
                              disabled={showResult}
                              className={cn(
                                'w-full text-left p-3 rounded-xl text-sm border transition-all',
                                showResult && isCorrect && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                                showResult && isSelected && !isCorrect && 'bg-red-500/10 border-red-500/30 text-[var(--error)]',
                                !showResult && isSelected && 'bg-[#1a73e8]/20 border-[var(--border-glow)]',
                                !showResult && !isSelected && 'bg-white/[0.03] border-[var(--border-primary)] hover:border-[var(--border-glow)]'
                              )}
                            >
                              <span className="text-xs text-[var(--text-muted)] mr-2">{String.fromCharCode(65 + j)}.</span>
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'flashcards' && (
                <motion.div
                  key="flashcards"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  {plan.flashcards.map((card: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-5 min-h-[140px] group cursor-pointer"
                    >
                      <div className="text-xs text-[var(--text-muted)] mb-2 font-medium">Front</div>
                      <p className="text-sm font-medium mb-4">{card.front}</p>
                      <div className="h-px bg-[var(--border-primary)] mb-4" />
                      <div className="text-xs text-[var(--text-muted)] mb-2 font-medium">Back</div>
                      <p className="text-sm text-[var(--text-secondary)]">{card.back}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'schedule' && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-6"
                >
                  <h3 className="font-display font-bold text-lg mb-1">Daily Study Schedule</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-5">Recommended daily routine</p>
                  <div className="space-y-3">
                    {plan.schedule.map((s: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]"
                      >
                        <div className="w-16 text-center">
                          <div className="text-xs font-bold text-[var(--accent-light)]">{s.time}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{s.activity}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
