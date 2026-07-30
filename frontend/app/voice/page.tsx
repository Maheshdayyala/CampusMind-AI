'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { startVoiceSession, endVoiceSession, processVoiceInput } from '@/lib/mcp'
import { Mic, Square, Send, Volume2 } from 'lucide-react'

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
    } catch (e: any) { alert(e.message) }
    finally { setLoading(false) }
  }

  const handleEnd = async () => {
    if (!studentId || !sessionId) return
    setLoading(true)
    try {
      const res = await endVoiceSession(studentId, sessionId)
      setTranscript(res.transcript || [])
    } catch (e: any) { alert(e.message) }
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
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div className="card-hero text-center">
        <div className={`orb ${listening ? 'scale-110' : ''}`} />
        <h1 className="text-xl font-bold mb-1">Voice Assistant</h1>
        <p className="text-muted text-sm mb-6">
          {listening ? 'Session active — speak or type your question' : 'Start a voice session to ask questions naturally'}
        </p>
        <div className="flex items-center justify-center gap-3">
          {!sessionId ? (
            <button onClick={handleStart} disabled={loading} className="btn btn-primary">
              <Mic className="w-4 h-4" />
              {loading ? 'Starting...' : 'Start Session'}
            </button>
          ) : (
            <button onClick={handleEnd} disabled={loading} className="btn" style={{color:'var(--color-error)',borderColor:'var(--color-error)'}}>
              <Square className="w-4 h-4" />
              {loading ? 'Ending...' : 'End Session'}
            </button>
          )}
        </div>
      </div>

      {sessionId && (
        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Volume2 className="w-4 h-4 text-primary" />
            <span>Session active</span>
            <span className="tag tag-ok ml-auto">live</span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {transcript.length === 0 && (
              <p className="text-center text-faint py-8">No conversation yet. Type your first question below.</p>
            )}
            {transcript.map((entry, i) => (
              <div key={i} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  entry.role === 'user'
                    ? 'bg-primary text-inverse rounded-br-md'
                    : 'bg-surface-offset text-text rounded-bl-md'
                }`}>
                  {entry.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
              className="input-field flex-1 border border-border rounded-full px-4 py-2.5 text-sm"
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} className="btn btn-primary btn-sm !rounded-full">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
