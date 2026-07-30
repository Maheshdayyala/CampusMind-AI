'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { useAuth } from '@/lib/auth'
import { askQuestion, logTopic, recallTopic, getReviewDue, listCourses } from '@/lib/mcp'
import { cn, timeAgo } from '@/lib/utils'
import { Send, Bot, User, Brain, Sparkles, Lightbulb, Clock, Plus, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  toolsUsed?: string[]
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
      const toolsUsed: string[] = []

      if (q.includes('exam') && q.includes('tomorrow')) {
        toolsUsed.push('recall_topic')
        const atRisk = await recallTopic(studentId, 'exam preparation').catch(() => null)
        const briefing = atRisk?.results?.slice(0, 3).map(r => r.summary).join(', ') || 'your weak areas'
        response = `I'll help you prepare! 🎯 I've analyzed your academic history. Head over to **Exam Mode** for a full revision plan, quiz, flashcards, and study schedule.\n\nKey areas to focus based on your memory:\n- ${briefing || 'Check your weak topics on the Dashboard'}`
      } else if (q.includes('log') || q.includes('studied') || q.includes('learned')) {
        toolsUsed.push('log_topic')
        const subject = q.split(/\b(?:about|studied|learned)\b/).pop()?.trim() || 'General'
        await logTopic(studentId, subject, input.trim(), 'Logged from chat')
        response = "✅ Done! I've logged that to your academic memory. It'll be factored into your review schedule and weak topic analysis."
      } else if (q.includes('review') || q.includes('due')) {
        toolsUsed.push('get_review_due')
        const due = await getReviewDue(studentId, 3)
        if (due.count === 0) {
          response = "Great job! You're all caught up — no topics due for review right now."
        } else {
          response = `You have **${due.count} topics** due for review:\n\n${due.results.slice(0, 5).map((d: any) => `- **${d.conceptName}** (${d.courseCode || 'Unknown'}) — last reviewed ${timeAgo(d.lastReviewedAt)}`).join('\n')}\n\nGo to the **Review Center** to start reviewing!`
        }
      } else if (q.includes('recall') || q.includes('remember') || q.includes('what about') || q.includes('last week')) {
        toolsUsed.push('recall_topic')
        const results = await recallTopic(studentId, input.trim())
        if (results.count === 0) {
          response = "I couldn't find anything matching that query in your academic memory. Try different keywords or log new study sessions."
        } else {
          response = `Here's what I found (${results.count} matches):\n\n${results.results.slice(0, 5).map((r: any) => `- **${r.summary.substring(0, 50)}** — ${timeAgo(r.timestamp)}`).join('\n')}`
        }
      } else {
        toolsUsed.push('list_courses')
        const courses = await listCourses(studentId).catch(() => ({ courses: [] }))
        const course = courses.courses[0]
        if (course) {
          try {
            toolsUsed.push('ask_question')
            const answer = await askQuestion(studentId, course.id, input.trim())
            response = answer.message + '\n\n' + (answer.relevantConcepts?.slice(0, 3).map((c: any) => `- **${c.concept}**: ${Math.round(c.confidenceScore * 100)}% confidence`).join('\n') || '')
          } catch {
            response = "I can help you with:\n\n- 📝 **Logging** what you studied\n- 🔍 **Recalling** past topics\n- ⏰ **Review** items due\n- 🎯 **Exam preparation**\n\nWhat would you like to do?"
          }
        } else {
          response = "I can help you with:\n\n- 📝 **Logging** what you studied\n- 🔍 **Recalling** past topics\n- ⏰ **Review** items due\n- 🎯 **Exam preparation**\n\nWhat would you like to do?"
        }
      }

      if (toolsUsed.length > 0) {
        response += `\n\n\`\`\`\nMCP tools used: ${toolsUsed.map(t => `✓ ${t}`).join(', ')}\n\`\`\``
      }

      setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: response, timestamp: new Date(), toolsUsed }])
    } catch (err: any) {
      setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: `Error: ${err.message}`, timestamp: new Date() }])
    }
    setIsLoading(false)
  }

  return (
    <div className="h-screen flex flex-col max-w-5xl mx-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#01696f]/20 to-[#0c4e54]/10 border border-[var(--border-primary)] flex items-center justify-center">
            <Bot className="w-5 h-5 text-[var(--accent-light)]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg">AI Assistant</h1>
            <p className="text-xs text-[var(--text-muted)]">Powered by CampusMind memory</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Online</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn('flex gap-3 max-w-[85%]', msg.role === 'user' ? 'ml-auto flex-row-reverse' : '')}>
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', msg.role === 'user' ? 'bg-gradient-to-br from-[#01696f] to-[#0c4e54]' : 'bg-white/[0.06] border border-[var(--border-primary)]')}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[var(--accent-light)]" />}
              </div>
              <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed', msg.role === 'user' ? 'bg-gradient-to-br from-[#01696f] to-[#0c4e54] text-white' : 'glass-card')}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className={cn('text-[10px] mt-2', msg.role === 'user' ? 'text-white/50' : 'text-[var(--text-muted)]')}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-[var(--border-primary)] flex items-center justify-center"><Bot className="w-4 h-4 text-[var(--accent-light)]" /></div>
              <div className="glass-card rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: d }}
                      className="w-2 h-2 rounded-full bg-[var(--accent-light)]" />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {messages.length <= 2 && (
        <div className="px-6 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => { setInput(s); document.getElementById('chat-input')?.focus() }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-glow)] transition-all whitespace-nowrap">
                <Lightbulb className="w-3 h-3" />{s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 py-4 border-t border-[var(--border-primary)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input id="chat-input" type="text" placeholder="Ask about your studies, log topics, or get exam help..."
              value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="input-field pr-12" />
          </div>
          <button onClick={handleSend} disabled={!input.trim() || isLoading} className="btn-primary !p-3 !rounded-xl disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
