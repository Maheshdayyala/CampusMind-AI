export interface MemoryEntry {
  id: string
  subject: string
  topic: string
  note: string
  loggedAt: string
  lastReviewedAt: string
  reviewCount: number
  confidenceScore?: number
}

export interface Course {
  id: string
  code: string
  title: string
  term: string
}

export interface Assignment {
  id: number
  courseId: string
  title: string
  dueDate: string
  weight: number
  course?: Course
}

export interface Concept {
  id: string
  courseId: string
  name: string
  description: string
  confidenceScore?: number
}

export interface StudySession {
  id: string
  date: string
  duration: number
  topics: string[]
  notes?: string
}

export interface Analytics {
  studyStreak: number
  memoryScore: number
  weakTopics: { name: string; confidence: number }[]
  reviewDue: number
  upcomingExams: { course: string; date: string; daysUntil: number }[]
  assignments: Assignment[]
  totalEntries: number
  activeCourses: number
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const mockEntries: MemoryEntry[] = [
  { id: 'm1', subject: 'Automata Theory', topic: 'NFA to DFA Conversion', note: 'Understood the subset construction algorithm. Need more practice with epsilon transitions.', loggedAt: '2026-07-14T10:30:00Z', lastReviewedAt: '2026-07-14T10:30:00Z', reviewCount: 1, confidenceScore: 0.42 },
  { id: 'm2', subject: 'Automata Theory', topic: 'Regular Expressions', note: 'Covered basic patterns and Kleene star. Clear on most concepts.', loggedAt: '2026-07-12T14:00:00Z', lastReviewedAt: '2026-07-13T09:00:00Z', reviewCount: 3, confidenceScore: 0.75 },
  { id: 'm3', subject: 'Data Structures', topic: 'Binary Search Trees', note: 'Insertion and deletion algorithms. Struggling with balancing.', loggedAt: '2026-07-10T11:00:00Z', lastReviewedAt: '2026-07-10T11:00:00Z', reviewCount: 1, confidenceScore: 0.55 },
  { id: 'm4', subject: 'Data Structures', topic: 'Hash Tables', note: 'Collision resolution strategies: chaining and open addressing.', loggedAt: '2026-07-08T16:00:00Z', lastReviewedAt: '2026-07-11T10:00:00Z', reviewCount: 2, confidenceScore: 0.7 },
  { id: 'm5', subject: 'Calculus', topic: 'Limits and Continuity', note: 'Epsilon-delta definition still fuzzy. Need to review.', loggedAt: '2026-07-05T09:30:00Z', lastReviewedAt: '2026-07-05T09:30:00Z', reviewCount: 0, confidenceScore: 0.3 },
  { id: 'm6', subject: 'Calculus', topic: 'Derivatives', note: 'Power rule, chain rule, product rule. Comfortable with basic problems.', loggedAt: '2026-07-03T13:00:00Z', lastReviewedAt: '2026-07-07T11:00:00Z', reviewCount: 2, confidenceScore: 0.8 },
  { id: 'm7', subject: 'Automata Theory', topic: 'Closure Properties', note: 'Regular languages under union, concatenation, star. Need more proofs practice.', loggedAt: '2026-07-01T10:00:00Z', lastReviewedAt: '2026-07-01T10:00:00Z', reviewCount: 0, confidenceScore: 0.3 },
]

const mockCourses: Course[] = [
  { id: 'c1', code: 'CS201', title: 'Automata Theory', term: 'Fall 2026' },
  { id: 'c2', code: 'CS101', title: 'Intro to Programming', term: 'Fall 2026' },
  { id: 'c3', code: 'PHY101', title: 'Classical Mechanics', term: 'Fall 2026' },
]

const mockAssignments: Assignment[] = [
  { id: 1, courseId: 'c1', title: 'DFA Minimization Problem Set', dueDate: '2026-07-20', weight: 0.15 },
  { id: 2, courseId: 'c1', title: 'Regular Expression Proofs', dueDate: '2026-07-31', weight: 0.2 },
  { id: 3, courseId: 'c2', title: 'Array Manipulation Project', dueDate: '2026-07-24', weight: 0.25 },
  { id: 4, courseId: 'c3', title: 'Inclined Plane Lab Report', dueDate: '2026-07-24', weight: 0.15 },
]

export async function mcpLogTopic(subject: string, topic: string, note: string): Promise<{ id: string }> {
  await sleep(300)
  const id = `m${Date.now()}`
  return { id }
}

export async function mcpRecallTopic(query: string): Promise<MemoryEntry[]> {
  await sleep(400)
  const q = query.toLowerCase()
  return mockEntries.filter(e =>
    e.subject.toLowerCase().includes(q) ||
    e.topic.toLowerCase().includes(q) ||
    e.note.toLowerCase().includes(q)
  ).sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
}

export async function mcpGetReviewDue(daysThreshold: number = 3): Promise<MemoryEntry[]> {
  await sleep(300)
  const now = Date.now()
  const threshold = daysThreshold * 24 * 60 * 60 * 1000
  return mockEntries
    .filter(e => (now - new Date(e.lastReviewedAt).getTime()) > threshold)
    .sort((a, b) => new Date(a.lastReviewedAt).getTime() - new Date(b.lastReviewedAt).getTime())
}

export async function mcpMarkReviewed(id: string): Promise<void> {
  await sleep(200)
}

export async function getAnalytics(): Promise<Analytics> {
  await sleep(500)
  return {
    studyStreak: 12,
    memoryScore: 68,
    weakTopics: [
      { name: 'NFA to DFA', confidence: 0.42 },
      { name: 'Closure Properties', confidence: 0.3 },
      { name: 'Limits & Continuity', confidence: 0.3 },
      { name: 'BST Balancing', confidence: 0.55 },
    ],
    reviewDue: 5,
    upcomingExams: [
      { course: 'Automata Theory', date: '2026-07-25', daysUntil: 8 },
      { course: 'Data Structures', date: '2026-08-01', daysUntil: 15 },
    ],
    assignments: mockAssignments,
    totalEntries: 24,
    activeCourses: 3,
  }
}

export async function getCourses(): Promise<Course[]> {
  await sleep(200)
  return mockCourses
}

export async function getAssignments(): Promise<Assignment[]> {
  await sleep(200)
  return mockAssignments
}

export async function generateExamPlan(examName: string, daysUntil: number): Promise<{
  revisionPlan: { day: number; topics: string[]; duration: string }[]
  weakTopics: string[]
  quiz: { question: string; options: string[]; correct: number }[]
  flashcards: { front: string; back: string }[]
  schedule: { time: string; activity: string }[]
}> {
  await sleep(800)
  return {
    revisionPlan: [
      { day: 1, topics: ['NFA to DFA Conversion', 'Regular Expressions'], duration: '2 hours' },
      { day: 2, topics: ['Closure Properties', 'Pumping Lemma'], duration: '2 hours' },
      { day: 3, topics: ['Context-Free Grammars', 'Pushdown Automata'], duration: '2.5 hours' },
      { day: 4, topics: ['Turing Machines', 'Undecidability'], duration: '2.5 hours' },
      { day: 5, topics: ['Previous Year Questions', 'Mock Test'], duration: '3 hours' },
      { day: 6, topics: ['Weak Areas Revision', 'Formula Review'], duration: '2 hours' },
      { day: 7, topics: ['Final Revision', 'Confidence Building'], duration: '2 hours' },
    ],
    weakTopics: ['NFA to DFA (42%)', 'Closure Properties (30%)', 'Pumping Lemma (45%)'],
    quiz: [
      { question: 'Which of the following is true about NFA to DFA conversion?', options: ['Every NFA has an equivalent DFA', 'NFA has more states than DFA', 'DFA cannot simulate NFA', 'NFA is more powerful than DFA'], correct: 0 },
      { question: 'What is the closure property of regular languages?', options: ['Closed under union only', 'Closed under union, concatenation, and Kleene star', 'Closed under intersection only', 'Not closed under any operation'], correct: 1 },
      { question: 'Which language class does a PDA recognize?', options: ['Regular', 'Context-Free', 'Context-Sensitive', 'Recursively Enumerable'], correct: 1 },
      { question: 'What does the Pumping Lemma prove?', options: ['A language is regular', 'A language is not regular', 'A language is context-free', 'A language is Turing-decidable'], correct: 1 },
    ],
    flashcards: [
      { front: 'What is an NFA?', back: 'Nondeterministic Finite Automaton - allows multiple transitions for same input, including epsilon moves.' },
      { front: 'Closure Properties of Regular Languages', back: 'Regular languages are closed under union, concatenation, Kleene star, complement, and intersection.' },
      { front: 'What does a PDA consist of?', back: 'Pushdown Automaton: finite states, input tape, stack memory. Recognizes context-free languages.' },
      { front: 'Church-Turing Thesis', back: 'Any effectively calculable function can be computed by a Turing Machine.' },
    ],
    schedule: [
      { time: '06:00 - 07:00', activity: 'Morning revision: Weak topics' },
      { time: '09:00 - 11:00', activity: 'Deep work: Core concepts' },
      { time: '14:00 - 16:00', activity: 'Practice: Previous year questions' },
      { time: '20:00 - 21:00', activity: 'Review: Flashcards & Quiz' },
    ],
  }
}
