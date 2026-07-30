'use client'

import { useState, useEffect } from 'react'
import { mcpDev, getSessionId, getJwtToken, ENDPOINT, mcpRequest, initialize } from '@/lib/mcp'
import { cn } from '@/lib/utils'
import { FadeUp } from '@/lib/animations'

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
    try { await initialize(); setPingStatus('ok') }
    catch { setPingStatus('error') }
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
    <div>
      <FadeUp>
      <div className="mb-8">
        <div className="text-xs text-accent uppercase tracking-wider mb-1">Developer Panel</div>
        <h1 className="font-display text-3xl text-text">MCP Diagnostics</h1>
        <p className="text-sm text-muted mt-1">{buildInfo}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-lg border border-border">
          <h2 className="text-sm font-semibold text-text mb-3">Connection Test</h2>
          <button onClick={handlePing} className="btn btn-sm btn-primary mb-3">Ping Backend</button>
          {pingStatus === 'ok' && <p className="text-xs text-success">MCP backend reachable</p>}
          {pingStatus === 'error' && <p className="text-xs text-error">MCP backend unreachable</p>}
          <p className="text-[10px] text-muted mt-2">Endpoint: {ENDPOINT}</p>
        </div>

        <div className="p-5 rounded-lg border border-border">
          <h2 className="text-sm font-semibold text-text mb-3">Runtime</h2>
          <div className="space-y-1.5">
            {[
              ['Session', getSessionId() || '—'],
              ['JWT', getJwtToken() ? `${getJwtToken()!.slice(0, 20)}...` : '—'],
              ['Total calls', `${mcpDev.events.length}`],
              ['Success', `${mcpDev.events.filter(e => e.status === 'success').length}`],
              ['Errors', `${mcpDev.events.filter(e => e.status === 'error').length}`],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex items-center justify-between text-xs">
                <span className="text-muted">{label}</span>
                <span className="font-mono text-[11px] text-text truncate ml-4 max-w-[200px]">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { title: 'Tools', data: tools, onFetch: handleListTools, extract: (d: any) => d?.tools || d || [] },
          { title: 'Resources', data: resources, onFetch: handleListResources, extract: (d: any) => d?.resources || d || [] },
          { title: 'Prompts', data: prompts, onFetch: handleListPrompts, extract: (d: any) => d?.prompts || d || [] },
        ].map(card => (
          <div key={card.title} className="p-5 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text">{card.title}</h2>
              <button onClick={card.onFetch} className="text-xs text-accent hover:underline">{card.data ? 'Refresh' : 'Fetch'}</button>
            </div>
            {card.data === null ? (
              <p className="text-xs text-muted">Click fetch to load</p>
            ) : card.extract(card.data).length === 0 ? (
              <p className="text-xs text-muted">None registered</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {card.extract(card.data).map((item: any, i: number) => (
                  <div key={i} className="text-xs font-mono text-text py-0.5 truncate">
                    &check; {item.name || item.title || JSON.stringify(item).slice(0, 50)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-lg border border-border">
          <h2 className="text-sm font-semibold text-text mb-3">Latest Requests</h2>
          {recent.length === 0 ? <p className="text-xs text-muted">No requests yet</p> : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {recent.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1">
                  <span className={cn(e.status === 'success' ? 'text-success' : 'text-error')}>{e.status === 'success' ? '\u2713' : '\u2717'}</span>
                  <span className="font-mono text-[11px] text-text flex-1 truncate">{e.tool}</span>
                  <span className="text-muted">{e.duration}ms</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-lg border border-border">
          <h2 className="text-sm font-semibold text-text mb-3">Errors</h2>
          {errors.length === 0 ? <p className="text-xs text-muted">No errors</p> : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {errors.map((e, i) => (
                <div key={i} className="text-xs p-2 rounded bg-error/5 border border-error/20">
                  <div className="font-mono text-[11px] text-error">{e.tool}</div>
                  <div className="text-muted mt-0.5">{e.errorMessage}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </FadeUp>
    </div>
  )
}
