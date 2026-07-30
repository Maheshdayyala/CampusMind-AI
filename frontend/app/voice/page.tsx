'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { startVoiceSession, endVoiceSession, processVoiceInput } from '@/lib/mcp'
import { Mic, Square, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

type TranscriptEntry = { role: string; text: string; timestamp: string }

export default function VoicePage() {
  const { studentId } = useAuth()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [transcript])

  const handleStart = async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const res = await startVoiceSession(studentId)
      setSessionId(res.sessionId)
      setListening(true)
      setTranscript(res.transcript || [])
    } catch (e: any) { setTranscript(p => [...p, { role: 'assistant', text: `Error: ${e.message}`, timestamp: new Date().toISOString() }]) }
    finally { setLoading(false) }
  }

  const handleEnd = async () => {
    if (!studentId || !sessionId) return
    setLoading(true)
    try {
      const res = await endVoiceSession(studentId, sessionId)
      setTranscript(res.transcript || [])
    } catch (e: any) { setTranscript(p => [...p, { role: 'assistant', text: `Error: ${e.message}`, timestamp: new Date().toISOString() }]) }
    finally { setSessionId(null); setListening(false); setLoading(false) }
  }

  const handleSend = async () => {
    if (!studentId || !sessionId || !input.trim()) return
    const text = input
    setInput('')
    setTranscript(p => [...p, { role: 'user', text, timestamp: new Date().toISOString() }])
    setLoading(true)
    try {
      const res = await processVoiceInput(studentId, sessionId, text)
      setTranscript(p => [...p, { role: 'assistant', text: res.response || res.text, timestamp: new Date().toISOString() }])
    } catch (e: any) {
      setTranscript(p => [...p, { role: 'assistant', text: `Error: ${e.message}`, timestamp: new Date().toISOString() }])
    }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-text">Voice Assistant</h1>
        <p className="text-sm text-muted mt-1">
          {listening ? 'Session active — speak or type your question' : 'Start a voice session to ask questions naturally'}
        </p>
        <div className="mt-4">
          {!sessionId ? (
            <button onClick={handleStart} disabled={loading} className="btn btn-primary">
              <Mic className="w-4 h-4" />
              {loading ? 'Starting...' : 'Start Session'}
            </button>
          ) : (
            <button onClick={handleEnd} disabled={loading} className="btn btn-sm text-error border border-error/30">
              <Square className="w-3.5 h-3.5" />
              {loading ? 'Ending...' : 'End Session'}
            </button>
          )}
        </div>
      </div>

      {sessionId && (
        <div className="max-w-2xl space-y-4">
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {transcript.length === 0 && (
              <p className="text-center text-sm text-muted py-12">No conversation yet. Type your first question below.</p>
            )}
            {transcript.map((entry, i) => (
              <div key={i} className={cn('flex', entry.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[80%] rounded-lg px-4 py-2.5 text-sm',
                  entry.role === 'user'
                    ? 'bg-accent text-inverse rounded-br-sm'
                    : 'bg-offset text-text rounded-bl-sm'
                )}>
                  {entry.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..." className="input-field flex-1" disabled={loading} />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="btn btn-primary btn-sm">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
