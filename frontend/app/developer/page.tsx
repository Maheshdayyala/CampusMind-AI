'use client'

import { useState, useEffect } from 'react'
import { mcpDev, getSessionId, getJwtToken, ENDPOINT, mcpRequest, initialize, callTool } from '@/lib/mcp'
import { cn } from '@/lib/utils'

export default function DeveloperPage() {
  const [tools, setTools] = useState<any[] | null>(null)
  const [resources, setResources] = useState<any[] | null>(null)
  const [prompts, setPrompts] = useState<any[] | null>(null)
  const [pingStatus, setPingStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [buildInfo, setBuildInfo] = useState('')

  useEffect(() => {
    document.title = 'MCP Diagnostics — CampusMind AI'
    fetch('/package.json').then(r => r.json()).then(p => setBuildInfo(`v${p.version}`)).catch(() => {})
  }, [])

  const handlePing = async () => {
    setPingStatus('idle')
    try {
      await initialize()
      setPingStatus('ok')
    } catch {
      setPingStatus('error')
    }
  }

  const handleListTools = async () => {
    try { setTools(await mcpRequest<any>('tools/list')) } catch { setTools([]) }
  }

  const handleListResources = async () => {
    try { setResources(await mcpRequest<any>('resources/list')) } catch { setResources([]) }
  }

  const handleListPrompts = async () => {
    try { setPrompts(await mcpRequest<any>('prompts/list')) } catch { setPrompts([]) }
  }

  const errors = mcpDev.events.filter(e => e.status === 'error').slice(-20).reverse()
  const recent = mcpDev.events.slice(-20).reverse()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">MCP Diagnostics</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Developer panel — {buildInfo}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ConnectionCard pingStatus={pingStatus} onPing={handlePing} />
        <StatusCard />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ListCard title="Tools" data={tools} onFetch={handleListTools} extract={(d: any) => d?.tools || d || []} />
        <ListCard title="Resources" data={resources} onFetch={handleListResources} extract={(d: any) => d?.resources || d || []} />
        <ListCard title="Prompts" data={prompts} onFetch={handleListPrompts} extract={(d: any) => d?.prompts || d || []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-sm mb-3">Latest Requests</h2>
          {recent.length === 0 ? <p className="text-xs text-[var(--text-muted)]">No requests yet</p> : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {recent.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1">
                  <span className={e.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>{e.status === 'success' ? '✓' : '✗'}</span>
                  <span className="font-mono text-[11px] flex-1 truncate">{e.tool}</span>
                  <span className="text-[var(--text-muted)]">{e.duration}ms</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-sm mb-3">Errors</h2>
          {errors.length === 0 ? <p className="text-xs text-[var(--text-muted)]">No errors</p> : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {errors.map((e, i) => (
                <div key={i} className="text-xs p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="font-mono text-[11px] text-red-400">{e.tool}</div>
                  <div className="text-[var(--text-muted)] mt-0.5">{e.errorMessage}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConnectionCard({ pingStatus, onPing }: { pingStatus: string; onPing: () => void }) {
  return (
    <div className="glass-card p-5">
      <h2 className="font-display font-bold text-sm mb-3">Connection Test</h2>
      <button onClick={onPing} className="btn-primary text-xs !py-2 !px-4 mb-3">
        Ping Backend
      </button>
      {pingStatus === 'ok' && <p className="text-xs text-emerald-400">✅ MCP backend reachable</p>}
      {pingStatus === 'error' && <p className="text-xs text-red-400">❌ MCP backend unreachable</p>}
      <p className="text-[10px] text-[var(--text-muted)] mt-2">Endpoint: {ENDPOINT}</p>
    </div>
  )
}

function StatusCard() {
  return (
    <div className="glass-card p-5">
      <h2 className="font-display font-bold text-sm mb-3">Runtime</h2>
      <div className="space-y-1.5">
        <Row label="Session" value={getSessionId() || '—'} />
        <Row label="JWT" value={getJwtToken() ? `${getJwtToken()!.slice(0, 20)}...` : '—'} />
        <Row label="Total calls" value={`${mcpDev.events.length}`} />
        <Row label="Success" value={`${mcpDev.events.filter(e => e.status === 'success').length}`} />
        <Row label="Errors" value={`${mcpDev.events.filter(e => e.status === 'error').length}`} />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between text-xs"><span className="text-[var(--text-secondary)]">{label}</span><span className="font-mono text-[11px] truncate ml-4 max-w-[200px]">{value}</span></div>
}

function ListCard({ title, data, onFetch, extract }: { title: string; data: any[] | null; onFetch: () => void; extract: (d: any) => any[] }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-sm">{title}</h2>
        <button onClick={onFetch} className="text-xs text-[var(--accent-light)] hover:underline">
          {data ? 'Refresh' : 'Fetch'}
        </button>
      </div>
      {data === null ? (
        <p className="text-xs text-[var(--text-muted)]">Click fetch to load</p>
      ) : extract(data).length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">None registered</p>
      ) : (
        <div className="max-h-40 overflow-y-auto space-y-1">
          {extract(data).map((item: any, i: number) => (
            <div key={i} className="text-xs font-mono text-[11px] py-0.5 truncate">
              ✓ {item.name || item.title || JSON.stringify(item).slice(0, 50)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
