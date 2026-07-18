const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL || ''
export const ENDPOINT = `${MCP_URL}/mcp`

let sessionId: string | null = null
let jwtToken: string | null = null

export function getSessionId() { return sessionId }
export function getJwtToken() { return jwtToken || (typeof window !== 'undefined' ? localStorage.getItem('campusmind_token') : null) }

function getJwt(): string | null {
  if (jwtToken) return jwtToken
  if (typeof window !== 'undefined') {
    return localStorage.getItem('campusmind_token')
  }
  return null
}

export function setJwt(token: string | null) {
  jwtToken = token
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('campusmind_token', token)
    else localStorage.removeItem('campusmind_token')
  }
}

export function clearSession() {
  sessionId = null
  setJwt(null)
}

// --- Dev tracking ---

export interface McpCallEvent {
  tool: string
  timestamp: string
  duration: number
  status: 'success' | 'error'
  payload?: unknown
  response?: unknown
  errorMessage?: string
}

export const mcpDev = {
  events: [] as McpCallEvent[],
  MAX_EVENTS: 200,
  get connected() { return !!sessionId },
  get authenticated() { return !!getJwt() },
}

function track<T>(label: string, payload: unknown, fn: () => Promise<T>): Promise<T> {
  const start = Date.now()
  return fn()
    .then(res => {
      mcpDev.events.push({ tool: label, timestamp: new Date().toISOString(), duration: Date.now() - start, status: 'success', payload, response: res })
      if (mcpDev.events.length > mcpDev.MAX_EVENTS) mcpDev.events = mcpDev.events.slice(-mcpDev.MAX_EVENTS)
      return res
    })
    .catch(err => {
      mcpDev.events.push({ tool: label, timestamp: new Date().toISOString(), duration: Date.now() - start, status: 'error', payload, errorMessage: err.message })
      if (mcpDev.events.length > mcpDev.MAX_EVENTS) mcpDev.events = mcpDev.events.slice(-mcpDev.MAX_EVENTS)
      throw err
    })
}

let rpcId = 1
async function jsonRpc(method: string, params?: unknown) {
  const token = getJwt()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (sessionId) headers['Mcp-Session-Id'] = sessionId

  const body = { jsonrpc: '2.0', id: rpcId++, method, params }
  const res = await fetch(ENDPOINT, { method: 'POST', headers, body: JSON.stringify(body) })

  const sid = res.headers.get('mcp-session-id')
  if (sid) sessionId = sid

  const json = await res.json()
  if (json.error) throw new Error(json.error.message || 'MCP error')
  return json.result
}

export async function initialize() {
  return track('initialize', {}, () =>
    jsonRpc('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'campusmind-webapp', version: '1.0.0' },
    })
  )
}

export async function callTool<T = unknown>(name: string, args: Record<string, unknown>): Promise<T> {
  if (!sessionId) await initialize()
  return track(name, args, () => jsonRpc('tools/call', { name, arguments: args })) as Promise<T>
}

// Generic MCP request for diagnostics page
export async function mcpRequest<T = unknown>(method: string, params?: unknown): Promise<T> {
  if (!sessionId && method !== 'initialize') await initialize()
  return jsonRpc(method, params) as Promise<T>
}

// --- Typed wrappers ---

export interface StudentInfo { id: string; name: string; program: string; year: number }
export interface LoginResult { ok: boolean; token: string; student: StudentInfo; message: string }
export async function login(studentId: string): Promise<LoginResult> {
  const result = await callTool<LoginResult>('login', { studentId })
  if (result.ok) setJwt(result.token)
  return result
}

export interface BriefingDeadline { id: number; title: string; course: string; dueDate: string; daysUntil: number; urgency: string }
export interface DailyBriefing {
  ok: boolean; student: string; date: string; overview: { enrolledCourses: number; weakTopicsCount: number; assignmentsDueSoon: number; studyStreak: number; recentStudyDays: number }
  deadlines: BriefingDeadline[]; reviewRecommended: { concept: string; course: string; confidence: number; daysSinceReview: number }[]
  urgentAttention: { concept: string; course: string; reason: string }[]; message: string
}
export async function getDailyBriefing(studentId: string): Promise<DailyBriefing> {
  return callTool<DailyBriefing>('get_daily_briefing', { studentId })
}

export interface ConceptMastery { concept: string; courseCode: string | null; confidenceScore: number; rawScore: number; daysSinceReview: number; timesWrong: number }
export interface ProgressSummary {
  ok: boolean; student: string; periodDays: number
  overview: { averageConfidence: number; weakTopicsCount: number; totalConceptsTracked: number; studySessionsCompleted: number; estimatedStudyMinutes: number; totalInteractions: number }
  conceptMastery: ConceptMastery[]; recentActivity: { date: string; type: string; summary: string }[]; message: string
}
export async function getProgressSummary(studentId: string, days = 14): Promise<ProgressSummary> {
  return callTool<ProgressSummary>('get_progress_summary', { studentId, days })
}

export interface ReviewDueItem { conceptId: string; conceptName: string; courseCode: string | null; confidenceScore: number; rawScore: number; lastReviewedAt: string; daysSinceReview: number; timesWrong: number }
export interface ReviewDueResult { studentId: string; daysThreshold: number; count: number; results: ReviewDueItem[] }
export async function getReviewDue(studentId: string, daysThreshold = 3): Promise<ReviewDueResult> {
  return callTool<ReviewDueResult>('get_review_due', { studentId, daysThreshold })
}

export interface MarkReviewedResult { ok: boolean; conceptId: string; conceptName: string; previousScore: number; newScore: number; lastReviewedAt: string; message: string }
export async function markReviewed(studentId: string, conceptId: string): Promise<MarkReviewedResult> {
  return callTool<MarkReviewedResult>('mark_reviewed', { studentId, conceptId })
}

export interface AskQuestionResult { ok: boolean; student: string; course: string; question: string; context: { syllabus: string }; relevantConcepts: { concept: string; confidenceScore: number; daysSinceReview: number }[]; detectedConfusion: boolean; masteryUpdate: { delta: number; timesWrongDelta: number }; message: string }
export async function askQuestion(studentId: string, courseId: string, question: string): Promise<AskQuestionResult> {
  return callTool<AskQuestionResult>('ask_question', { studentId, courseId, question })
}

export interface ExplainConceptResult { ok: boolean; concept: { id: string; name: string; description: string }; course: { id: string; title: string } | null; mastery: { confidenceScore: number; daysSinceReview: number; timesWrong: number }; depth: string; recommendedDepth: string; message: string }
export async function explainConcept(studentId: string, conceptId: string, depth = 'detailed'): Promise<ExplainConceptResult> {
  return callTool<ExplainConceptResult>('explain_concept', { studentId, conceptId, depth })
}

export interface LogTopicResult { id: string; subject: string; topic: string; note: string; loggedAt: string; message: string }
export async function logTopic(studentId: string, subject: string, topic: string, note: string): Promise<LogTopicResult> {
  return callTool<LogTopicResult>('log_topic', { studentId, subject, topic, note })
}

export interface RecallTopicResult { query: string; count: number; results: { id: string; summary: string; type: string; timestamp: string; channel: string }[] }
export async function recallTopic(studentId: string, query: string): Promise<RecallTopicResult> {
  return callTool<RecallTopicResult>('recall_topic', { studentId, query })
}

export interface CourseInfo { id: string; code: string; title: string; term: string }
export interface ListCoursesResult { count: number; courses: CourseInfo[] }
export async function listCourses(studentId: string): Promise<ListCoursesResult> {
  return callTool<ListCoursesResult>('list_courses', { studentId })
}

export interface AssignmentInfo { id: number; courseId: string; title: string; dueDate: string; weight: number }
export interface DeadlineTimelineResult { studentId: string; count: number; deadlines: { id: number; title: string; course: string; dueDate: string; daysUntil: number; weight: number; urgency: string }[] }
export async function getDeadlineTimeline(studentId: string): Promise<DeadlineTimelineResult> {
  return callTool<DeadlineTimelineResult>('get_deadline_timeline', { studentId })
}

export interface AtRiskTopic { conceptId: string; concept: string; course: string; confidenceScore: number; daysSinceReview: number; timesWrong: number; nearestDeadline: { title: string; daysToDeadline: number; dueDate: string } | null; riskScore: number; riskLevel: string }
export interface FlagAtRiskResult { ok: boolean; count: number; atRiskTopics: AtRiskTopic[]; summary: { critical: number; high: number; medium: number }; message: string }
export async function flagAtRiskTopics(studentId: string): Promise<FlagAtRiskResult> {
  return callTool<FlagAtRiskResult>('flag_at_risk_topics', { studentId })
}

export interface ReviewPlanItem { day: number; concept: string; course: string | null; currentConfidence: number; recommendedDuration: number; reason: string }
export interface SuggestReviewPlanResult { ok: boolean; planTitle: string; totalRecommended: number; plan: ReviewPlanItem[]; message: string }
export async function suggestReviewPlan(studentId: string, maxTopics = 5): Promise<SuggestReviewPlanResult> {
  return callTool<SuggestReviewPlanResult>('suggest_review_plan', { studentId, maxTopics })
}

export interface RecordSessionResult { ok: boolean; sessionId: string; topics: string[]; durationMinutes: number; message: string }
export async function recordStudySession(studentId: string, topics: string[], durationMinutes: number): Promise<RecordSessionResult> {
  return callTool<RecordSessionResult>('record_study_session', { studentId, topics, durationMinutes })
}

export interface SetGoalResult { ok: boolean; goalId: string; goal: string; deadline: string; message: string }
export async function setStudyGoal(studentId: string, goal: string, deadline: string): Promise<SetGoalResult> {
  return callTool<SetGoalResult>('set_study_goal', { studentId, goal, deadline })
}

export interface HeatmapCourse { code: string; title: string; concepts: { conceptId: string; concept: string; courseCode: string; confidenceScore: number; daysSinceReview: number; timesWrong: number }[] }
export interface MasteryHeatmapResult { studentId: string; courses: HeatmapCourse[] }
export async function getMasteryHeatmap(studentId: string): Promise<MasteryHeatmapResult> {
  return callTool<MasteryHeatmapResult>('get_mastery_heatmap', { studentId })
}

export interface GetConceptResult { ok: boolean; concept: { id: string; name: string; description: string; course: { id: string; code: string; title: string } | null }; mastery: { confidenceScore: number; lastReviewed: string; timesWrong: number } }
export async function getConcept(studentId: string, conceptId: string): Promise<GetConceptResult> {
  return callTool<GetConceptResult>('get_concept', { studentId, conceptId })
}

export interface LogQuizResult { ok: boolean; concept: string; correct: boolean; previousScore: number; newScore: number; timesWrong: number; message: string }
export async function logQuizResult(studentId: string, conceptId: string, correct: boolean): Promise<LogQuizResult> {
  return callTool<LogQuizResult>('log_quiz_result', { studentId, conceptId, correct })
}

export interface WeakTopicsResult { studentId: string; count: number; weakTopics: { conceptId: string; concept: string; courseCode: string | null; confidenceScore: number; timesWrong: number; daysSinceReview: number; urgencyScore: number }[] }
export async function getWeakTopics(studentId: string): Promise<WeakTopicsResult> {
  return track('resources/read (weak-topics)', { studentId }, async () => {
    const res = await fetch(`${MCP_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(getJwt() ? { Authorization: `Bearer ${getJwt()}` } : {}) },
      body: JSON.stringify({ jsonrpc: '2.0', id: rpcId++, method: 'resources/read', params: { uri: `student://${studentId}/weak-topics` } }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message || 'Resource error')
    return JSON.parse(json.result.contents?.[0]?.text || json.result.text || '{}')
  })
}

export async function getStudentMemory(studentId: string): Promise<unknown> {
  return track('resources/read (memory)', { studentId }, async () => {
    const res = await fetch(`${MCP_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(getJwt() ? { Authorization: `Bearer ${getJwt()}` } : {}) },
      body: JSON.stringify({ jsonrpc: '2.0', id: rpcId++, method: 'resources/read', params: { uri: `student://${studentId}/memory` } }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message || 'Resource error')
    return JSON.parse(json.result.contents?.[0]?.text || json.result.text || '{}')
  })
}

export async function getSyllabus(courseId: string): Promise<string> {
  return track('resources/read (syllabus)', { courseId }, async () => {
    const res = await fetch(`${MCP_URL}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: rpcId++, method: 'resources/read', params: { uri: `course://${courseId}/syllabus` } }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message || 'Resource error')
    return json.result.contents?.[0]?.text || json.result.text || ''
  })
}
