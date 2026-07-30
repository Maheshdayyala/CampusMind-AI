'use client'

import { useState, useEffect } from 'react'
import { mcpDev, getSessionId, getJwtToken, ENDPOINT, type McpCallEvent } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { Bug, X, Activity, Terminal } from 'lucide-react'

export default function McpStatus() {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') setVisible(v => !v)
    }
    window.addEventListener('keydown', handler)
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')) setVisible(true)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!visible) return null

  return <McpPanel open={open} onToggle={() => setOpen(!open)} />
}

function useMcpState() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return { connected: mcpDev.connected, events: [...mcpDev.events], lastEvent: mcpDev.events[mcpDev.events.length - 1] }
}

function McpPanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [tab, setTab] = useState<'status' | 'activity'>('status')
  const { connected, events, lastEvent } = useMcpState()

  if (!open) {
    return (
      <button onClick={onToggle}
        className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border bg-surface border-border text-muted hover:text-text transition-all"
        title="MCP Dev Panel (Ctrl+Shift+D to toggle)">
        <Bug className="w-3.5 h-3.5" />
        <span className={cn('w-1.5 h-1.5 rounded-full', connected ? 'bg-emerald-500' : 'bg-red-500')} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 max-h-96 overflow-hidden rounded-xl border border-border bg-surface shadow-lg flex flex-col text-xs">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-divider">
        <span className="flex items-center gap-1.5 font-medium text-text">
          <Terminal className="w-3.5 h-3.5" /> Dev
        </span>
        <button onClick={onToggle} className="text-muted hover:text-text"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="flex border-b border-divider">
        {(['status', 'activity'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('flex-1 py-1.5 text-center text-xs transition-colors', tab === t ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-text')}>{t}</button>
        ))}
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
        {tab === 'status' ? (
          <div className="space-y-1.5">
            <Row label="Connection" value={connected ? 'Connected' : 'Disconnected'} />
            <Row label="Endpoint" value={ENDPOINT} />
            <Row label="Session" value={getSessionId() || '—'} />
            <Row label="Auth" value={getJwtToken() ? 'Yes' : 'No'} />
            <Row label="Calls" value={`${events.length}`} />
            <Row label="Errors" value={`${events.filter(e => e.status === 'error').length}`} />
          </div>
        ) : (
          events.length === 0 ? <p className="text-center text-muted py-4">No calls yet</p> :
          events.slice(-30).reverse().map((e, i) => (
            <div key={i} className="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-surface-offset">
              <span className={e.status === 'success' ? 'text-emerald-600' : 'text-red-500'}>{e.status === 'success' ? '+' : '×'}</span>
              <span className="font-mono text-text flex-1 truncate">{e.tool}</span>
              <span className="text-muted">{e.duration}ms</span>
            </div>
          ))
        )}
      </div>
      {lastEvent && (
        <div className="px-3 py-1.5 border-t border-divider text-[10px] text-muted flex items-center gap-1.5">
          <Activity className="w-3 h-3" />Last: {lastEvent.tool} ({lastEvent.duration}ms)
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="text-text truncate ml-2 max-w-44">{value}</span>
    </div>
  )
}
