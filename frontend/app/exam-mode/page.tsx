'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { flagAtRiskTopics, suggestReviewPlan, getProgressSummary, getReviewDue, explainConcept } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { Zap, AlertCircle, RefreshCw } from 'lucide-react'

export default function ExamModePage() {
  const { studentId } = useAuth()
  const [examName, setExamName] = useState('')
  const [daysUntil, setDaysUntil] = useState(7)
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [plan, setPlan] = useState<any>(null)
  const [atRisk, setAtRisk] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('plan')
  const [conceptExplanations, setConceptExplanations] = useState<Record<string, any>>({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentId) return
    Promise.all([flagAtRiskTopics(studentId), getProgressSummary(studentId, 14)]).then(([r, p]) => {
      setAtRisk(r.atRiskTopics || [])
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
          day: i + 1, topics: [p.concept], duration: `${p.recommendedDuration}min`,
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
    { id: 'plan', label: 'Revision Plan' },
    { id: 'weak', label: 'Focus Areas' },
    { id: 'concepts', label: 'Explanations' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text">Exam Mode</h1>
        <p className="text-sm text-muted mt-1">Powered by your mastery data</p>
      </div>

      {error && <div className="text-sm text-error mb-4">{error}</div>}

      {!generated ? (
        <div className="max-w-lg">
          <div className="p-6 rounded-lg border border-border mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-display text-xl text-text text-center mb-1">Prepare for your exam</h2>
            <p className="text-sm text-muted text-center mb-6">Real data from your study history powers this plan</p>

            <div className="space-y-5">
              <div>
                <label className="text-xs text-muted mb-1 block">Exam name</label>
                <input type="text" placeholder='e.g. "Automata Theory Final"' value={examName} onChange={e => setExamName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-muted mb-2 block">Days until exam</label>
                <div className="flex gap-2">
                  {[1, 3, 7, 14, 30].map(d => (
                    <button key={d} onClick={() => setDaysUntil(d)}
                      className={cn('flex-1 py-2.5 rounded-md text-sm border transition-colors',
                        daysUntil === d ? 'border-accent bg-accent/5 text-accent' : 'border-border text-muted hover:text-text')}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating || !examName.trim()}
              className="btn btn-primary w-full mt-6 py-3 disabled:opacity-50">
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-inverse/30 border-t-inverse rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2"><Zap className="w-4 h-4" />Generate plan</span>
              )}
            </button>
          </div>

          {atRisk.length > 0 && (
            <div>
              <p className="text-xs text-muted mb-2">Based on your at-risk topics</p>
              <div className="flex flex-wrap gap-2">
                {atRisk.slice(0, 5).map((t: any) => (
                  <span key={t.conceptId} className="tag">{t.concept}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : plan ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-text">{examName}</h2>
              <p className="text-sm text-muted">{daysUntil} days to prepare</p>
            </div>
            <button onClick={reset} className="btn btn-ghost btn-sm"><RefreshCw className="w-3 h-3" /> New exam</button>
          </div>

          <div className="flex gap-1 border-b border-divider">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('px-4 py-2 text-sm transition-colors border-b-2 -mb-[1px]',
                  activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text')}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'plan' && (
            <div className="space-y-2">
              {plan.revisionPlan.length === 0 ? (
                <p className="text-sm text-muted">No review items needed</p>
              ) : plan.revisionPlan.map((day: any, i: number) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-divider last:border-0">
                  <span className="text-xs font-mono text-muted w-6">D{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {day.topics.map((t: string, j: number) => (
                        <span key={j} className="tag">{t}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted">{day.duration}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'weak' && (
            <div>
              {plan.weakTopics.length === 0 ? (
                <p className="text-sm text-muted">No weak topics detected</p>
              ) : (
                <div className="space-y-2">
                  {plan.weakTopics.map((t: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0" />
                      <span className="text-sm text-text">{t}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'concepts' && (
            <div className="space-y-4">
              {Object.keys(conceptExplanations).length === 0 ? (
                <p className="text-sm text-muted">No explanations available</p>
              ) : Object.entries(conceptExplanations).map(([id, exp]: [string, any], i) => (
                <div key={id}>
                  <h3 className="text-sm font-semibold text-text mb-1">{exp.concept?.name || id}</h3>
                  <p className="text-sm text-muted mb-1">{exp.concept?.description || exp.message}</p>
                  {exp.mastery && (
                    <div className="flex gap-3 text-xs text-muted">
                      <span>Confidence: {Math.round(exp.mastery.confidenceScore * 100)}%</span>
                      <span>Days since review: {exp.mastery.daysSinceReview}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
