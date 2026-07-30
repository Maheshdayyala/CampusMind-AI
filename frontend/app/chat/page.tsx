'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { askQuestion, logTopic, recallTopic, getReviewDue, listCourses } from '@/lib/mcp'
import { timeAgo } from '@/lib/utils'
import { Send, Bot } from 'lucide-react'
import { FadeUp } from '@/lib/animations'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestions = [
  'What did I study about automata last week?',
  'Log a new study session: Data Structures - Hash Tables',
  'Show me topics due for review',
  'I have an exam tomorrow!',
]

export default function ChatPage() {
  const { studentId } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: "Hi! I'm your CampusMind assistant. I can help you log what you studied, recall past topics, find review items, and create exam plans. What would you like to do?", timestamp: new Date() },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !studentId) return

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const q = input.trim().toLowerCase()
      let response = ''

      if (q.includes('exam') && q.includes('tomorrow')) {
        const atRisk = await recallTopic(studentId, 'exam preparation').catch(() => null)
        const briefing = atRisk?.results?.slice(0, 3).map(r => r.summary).join(', ') || 'your weak areas'
        response = `I'll help you prepare! Head over to **Exam Mode** for a full revision plan.\n\nKey areas:\n${briefing || 'Check weak topics on Dashboard'}`
      } else if (q.includes('log') || q.includes('studied') || q.includes('learned')) {
        const subject = q.split(/\b(?:about|studied|learned)\b/).pop()?.trim() || 'General'
        await logTopic(studentId, subject, input.trim(), 'Logged from chat')
        response = "Done! I've logged that to your academic memory."
      } else if (q.includes('review') || q.includes('due')) {
        const due = await getReviewDue(studentId, 3)
        if (due.count === 0) {
          response = "You're all caught up — no topics due for review."
        } else {
          response = `**${due.count} topics** due:\n\n${due.results.slice(0, 5).map((d: any) => `- **${d.conceptName}** (${d.courseCode || 'Unknown'}) — last reviewed ${timeAgo(d.lastReviewedAt)}`).join('\n')}`
        }
      } else if (q.includes('recall') || q.includes('remember') || q.includes('what about') || q.includes('last week')) {
        const results = await recallTopic(studentId, input.trim())
        if (results.count === 0) {
          response = "I couldn't find anything matching that query."
        } else {
          response = `Found ${results.count} matches:\n\n${results.results.slice(0, 5).map((r: any) => `- ${r.summary.substring(0, 60)} — ${timeAgo(r.timestamp)}`).join('\n')}`
        }
      } else {
        const courses = await listCourses(studentId).catch(() => ({ courses: [] }))
        const course = courses.courses[0]
        if (course) {
          try {
            const answer = await askQuestion(studentId, course.id, input.trim())
            response = answer.message
          } catch {
            response = "I can help with:\n- **Logging** what you studied\n- **Recalling** past topics\n- **Review** items due\n- **Exam preparation"
          }
        } else {
          response = "I can help with:\n- **Logging** what you studied\n- **Recalling** past topics\n- **Review** items due\n- **Exam preparation"
        }
      }

      setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: response, timestamp: new Date() }])
    } catch (err: any) {
      setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: `Error: ${err.message}`, timestamp: new Date() }])
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <FadeUp>
        <div className="flex items-center justify-between pb-4 border-b border-divider mb-4">
          <div>
            <h1 className="font-display text-2xl text-text">Chat</h1>
            <p className="text-sm text-muted">AI assistant with memory context</p>
          </div>
        </div>
      </FadeUp>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={msg.role === 'user'
                ? 'bg-accent text-inverse px-4 py-2.5 rounded-2xl rounded-br-md text-sm leading-relaxed'
                : 'text-text px-4 py-2.5 text-sm leading-relaxed'
              }>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className={`text-[11px] mt-1.5 ${msg.role === 'user' ? 'text-inverse/60' : 'text-muted'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="text-text px-4 py-2.5 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 2 && (
        <div className="flex gap-2 pb-3 overflow-x-auto">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setInput(s)}
              className="shrink-0 text-xs text-muted px-3 py-1.5 rounded-md border border-border hover:border-divider hover:text-text transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-divider">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask about your studies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="input-field flex-1"
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading}
            className="btn btn-primary btn-sm disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
