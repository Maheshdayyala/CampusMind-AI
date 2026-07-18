'use client'

import { useState, useEffect } from 'react'
import { mcpDev, getSessionId, getJwtToken, ENDPOINT, type McpCallEvent } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { Bug, X, ChevronDown, ChevronUp, Activity, Terminal, Server } from 'lucide-react'

function useMcpState() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return { connected: mcpDev.connected, events: [...mcpDev.events], lastEvent: mcpDev.events[mcpDev.events.length - 1] }
}

export default function McpStatus() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'status' | 'activity'>('status')
  const { connected, events, lastEvent } = useMcpState()

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'fixed bottom-4 right-4 z-[9999] flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium shadow-lg border transition-all',
          connected
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
        )}
        title="MCP Developer Panel"
      >
        <span className={cn('w-2 h-2 rounded-full', connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
        <span>MCP {connected ? 'Connected' : 'Offline'}</span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>

      {open && (
        <div className="fixed bottom-16 right-4 z-[9999] w-96 max-h-[70vh] overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[#0d1117]/95 backdrop-blur-xl shadow-2xl flex flex-col text-xs">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)]">
            <div className="flex items-center gap-2 font-medium">
              <Terminal className="w-4 h-4 text-[var(--accent-light)]" />
              MCP Developer
            </div>
            <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex border-b border-[var(--border-primary)]">
            {(['status', 'activity'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn('flex-1 py-2 text-center text-xs font-medium transition-colors', tab === t ? 'text-[var(--accent-light)] border-b-2 border-[var(--accent-light)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}
              >{t === 'status' ? 'Status' : 'Activity'}</button>
            ))}
          </div>

          <div className="overflow-y-auto flex-1 p-4 space-y-2">
            {tab === 'status' ? (
              <StatusPanel connected={connected} />
            ) : (
              <ActivityPanel events={events} />
            )}
          </div>

          {lastEvent && (
            <div className="px-4 py-2 border-t border-[var(--border-primary)] text-[10px] text-[var(--text-muted)] flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Last: {lastEvent.tool} ({lastEvent.duration}ms)
            </div>
          )}
        </div>
      )}
    </>
  )
}

function StatusPanel({ connected }: { connected: boolean }) {
  const sessionId = getSessionId()
  const jwt = getJwtToken()
  return (
    <div className="space-y-2">
      <Row label="Connection" value={connected ? '🟢 Connected' : '🔴 Disconnected'} />
      <Row label="Endpoint" value={ENDPOINT} />
      <Row label="Session ID" value={sessionId || '—'} mono />
      <Row label="Authentication" value={jwt ? '✅ Authenticated' : '⛔ Not authenticated'} />
      <Row label="Tools tracked" value={`${mcpDev.events.filter(e => !e.tool.startsWith('resources/')).length} calls`} />
      <Row label="Resources tracked" value={`${mcpDev.events.filter(e => e.tool.startsWith('resources/')).length} calls`} />
      <Row label="Error count" value={`${mcpDev.events.filter(e => e.status === 'error').length}`} />
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className={cn('text-[var(--text-primary)] truncate ml-4 max-w-[200px]', mono && 'font-mono')}>{value}</span>
    </div>
  )
}

function ActivityPanel({ events }: { events: McpCallEvent[] }) {
  const recent = events.slice(-50).reverse()
  if (recent.length === 0) return <p className="text-[var(--text-muted)] text-center py-4">No MCP calls yet</p>
  return (
    <div className="space-y-1">
      {recent.map((e, i) => (
        <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
          <span className={e.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
            {e.status === 'success' ? '✓' : '✗'}
          </span>
          <span className="font-mono text-[11px] text-[var(--text-primary)] flex-1 truncate">{e.tool}</span>
          <span className="text-[10px] text-[var(--text-muted)]">{e.duration}ms</span>
          <span className="text-[10px] text-[var(--text-muted)]">{new Date(e.timestamp).toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  )
}
