'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { useAuth } from '@/lib/auth'
import { flagAtRiskTopics, suggestReviewPlan, getProgressSummary, getReviewDue, getConcept, explainConcept } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { Zap, Brain, Clock, BookOpen, CheckCircle2, AlertTriangle, ChevronRight, ArrowRight, Sparkles, Target, ListChecks, FileQuestion, GraduationCap, Calendar, BarChart3, RefreshCw } from 'lucide-react'

export default function ExamModePage() {
  const { studentId } = useAuth()
  const [examName, setExamName] = useState('')
  const [daysUntil, setDaysUntil] = useState(7)
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [plan, setPlan] = useState<any>(null)
  const [atRisk, setAtRisk] = useState<any[]>([])
  const [weakTopics, setWeakTopics] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('plan')
  const [conceptExplanations, setConceptExplanations] = useState<Record<string, any>>({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentId) return
    Promise.all([flagAtRiskTopics(studentId), getProgressSummary(studentId, 14)]).then(([r, p]) => {
      setAtRisk(r.atRiskTopics || [])
      setWeakTopics((p.conceptMastery || []).filter((c: any) => c.confidenceScore < 50).slice(0, 5))
    }).catch(() => {})
  }, [studentId])

  const handleGenerate = async () => {
    if (!examName.trim() || !studentId) return
    setGenerating(true)
    setError('')
    try {
      const [reviewPlanResult, reviewDueResult] = await Promise.all([
        suggestReviewPlan(studentId, 7),
        getReviewDue(studentId, 1),
      ])

      const topicsForExplanation = [...(reviewPlanResult.plan || []), ...(reviewDueResult.results || [])].slice(0, 3)
      const explanations: Record<string, any> = {}
      for (const t of topicsForExplanation) {
        try {
          const id = (t as any).conceptId || (t as any).concept
          const exp = await explainConcept(studentId, id, 'detailed')
          explanations[id] = exp
        } catch {}
      }
      setConceptExplanations(explanations)

      setPlan({
        revisionPlan: (reviewPlanResult.plan || []).map((p: any, i: number) => ({
          day: i + 1, topics: [p.concept], duration: `${p.recommendedDuration}min`, conceptId: p.conceptId,
        })),
        weakTopics: (reviewDueResult.results || []).slice(0, 5).map((r: any) => `${r.conceptName} (${Math.round((r.confidenceScore || 0) * 100)}%)`),
        reviewCount: reviewDueResult.count,
        planTitle: reviewPlanResult.planTitle,
      })
      setGenerated(true)
    } catch (err: any) {
      setError(err.message)
    }
    setGenerating(false)
  }

  const reset = () => { setGenerated(false); setPlan(null) }

  const tabs = [
    { id: 'plan', label: 'Revision Plan', icon: Calendar },
    { id: 'weak', label: 'Weak Topics', icon: AlertTriangle },
    { id: 'concepts', label: 'Explain Concepts', icon: Brain },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </span>
            Exam Mode
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-[var(--text-secondary)] text-sm mt-1">
            Powered by real mastery data from your academic memory
          </motion.p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-[var(--error)]">{error}</div>}

      <AnimatePresence mode="wait">
        {!generated ? (
          <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
            <GlassCard glow className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Prepare for your exam</h2>
                <p className="text-[var(--text-secondary)] text-sm">Real data from your study history powers this plan</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Exam name / subject</label>
                  <input type="text" placeholder='e.g. "Automata Theory Final"' value={examName} onChange={e => setExamName(e.target.value)}
                    className="input-field" onKeyDown={e => e.key === 'Enter' && handleGenerate()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Days until exam</label>
                  <div className="flex gap-2">
                    {[1, 3, 7, 14, 30].map(d => (
                      <button key={d} onClick={() => setDaysUntil(d)}
                        className={cn('flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border',
                          daysUntil === d ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'glass text-[var(--text-secondary)] border-[var(--border-primary)]')}>
                        {d} {d === 1 ? 'day' : 'days'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleGenerate} disabled={generating || !examName.trim()}
                className="btn-primary w-full text-base !py-3.5 disabled:opacity-60">
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block" />
                    Generating your exam plan...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><Zap className="w-5 h-5" />Generate exam plan</span>
                )}
              </button>

              {atRisk.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[var(--border-primary)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-3">
                    <Brain className="w-3 h-3" /> Based on your at-risk topics
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {atRisk.slice(0, 5).map((t: any) => (
                      <span key={t.conceptId} className="px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {t.concept} ({t.riskLevel})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        ) : plan ? (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card-static p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">{examName}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{daysUntil} days to prepare &middot; {plan.weakTopics.length} weak areas</p>
                </div>
              </div>
              <button onClick={reset} className="btn-ghost text-sm"><RefreshCw className="w-4 h-4" />New exam</button>
            </motion.div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap border',
                      activeTab === tab.id ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'glass text-[var(--text-secondary)] border-[var(--border-primary)] hover:text-[var(--text-primary)]')}>
                    <Icon className="w-4 h-4" />{tab.label}
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'plan' && (
                <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                  {plan.revisionPlan.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">No review items. You're in great shape!</p>
                  ) : plan.revisionPlan.map((day: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                            i < daysUntil ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400')}>
                            {i + 1}
                          </div>
                          <span className="font-display font-bold">Day {i + 1}</span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">{day.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {day.topics.map((t: string, j: number) => (
                          <span key={j} className="px-2.5 py-1 rounded-full text-xs bg-white/[0.04] border border-[var(--border-primary)] text-[var(--text-secondary)]">{t}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'weak' && (
                <motion.div key="weak" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-6">
                  <h3 className="font-display font-bold text-lg mb-1">Focus Areas</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-5">From your spaced repetition and mastery data</p>
                  <div className="space-y-3">
                    {plan.weakTopics.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)]">No weak topics detected!</p>
                    ) : plan.weakTopics.map((t: string, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                        <AlertTriangle className="w-4 h-4 text-[var(--error)]" />
                        <span className="text-sm font-medium">{t}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'concepts' && (
                <motion.div key="concepts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  {Object.keys(conceptExplanations).length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">No concept explanations available</p>
                  ) : Object.entries(conceptExplanations).map(([id, exp]: [string, any], i) => (
                    <motion.div key={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
                      <h3 className="font-display font-bold text-base mb-2">{exp.concept?.name || id}</h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-3">{exp.concept?.description || exp.message}</p>
                      {exp.mastery && (
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span>Confidence: {Math.round(exp.mastery.confidenceScore * 100)}%</span>
                          <span>Days since review: {exp.mastery.daysSinceReview}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
