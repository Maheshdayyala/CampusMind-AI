'use client'

import { useState } from 'react'
import { FadeUp } from '@/lib/animations'
import { Check, Copy, ChevronDown, ChevronRight, Terminal, Brain, BookOpen, Calendar, BarChart3, Mic, LogIn, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const tools = [
  { group: 'Auth', icon: LogIn, items: [
    { name: 'login', desc: 'Authenticate with email + password, returns session token' },
  ]},
  { group: 'Academic Memory', icon: Brain, items: [
    { name: 'ask_question', desc: 'Ask a course question — reads memory, detects confusion, logs interaction' },
    { name: 'explain_concept', desc: 'Adaptive explanation based on mastery level' },
    { name: 'log_quiz_result', desc: 'Log quiz result, updates confidence score' },
    { name: 'log_topic', desc: 'Log a topic or doubt you studied' },
    { name: 'recall_topic', desc: 'Search previously logged topics by keyword' },
    { name: 'get_mastery_heatmap', desc: 'Mastery data organized by course' },
  ]},
  { group: 'Study Planner', icon: Calendar, items: [
    { name: 'get_review_due', desc: 'Find concepts due for review (spaced repetition)' },
    { name: 'mark_reviewed', desc: 'Mark a concept as reviewed, reset review clock' },
    { name: 'set_study_goal', desc: 'Set a study goal with deadline' },
    { name: 'record_study_session', desc: 'Record a completed study session' },
    { name: 'get_daily_briefing', desc: 'Daily summary: due items, weak topics, urgent tasks' },
    { name: 'suggest_review_plan', desc: 'Generate a spaced-repetition review plan' },
    { name: 'flag_at_risk_topics', desc: 'Surface topics needing urgent attention' },
    { name: 'get_deadline_timeline', desc: 'Deadlines organized for timeline view' },
  ]},
  { group: 'Courses', icon: BookOpen, items: [
    { name: 'list_courses', desc: 'List all enrolled courses with basic info' },
    { name: 'get_concept', desc: 'Get concept details with current mastery' },
  ]},
  { group: 'Analytics', icon: BarChart3, items: [
    { name: 'get_progress_summary', desc: 'Confidence trends, study hours, weak areas' },
  ]},
  { group: 'Voice', icon: Mic, items: [
    { name: 'start_voice_session', desc: 'Start a voice interaction session' },
    { name: 'process_voice_input', desc: 'Process spoken input from voice session' },
    { name: 'end_voice_session', desc: 'End voice session, return stats' },
  ]},
]

const platforms = [
  {
    name: 'Claude Desktop',
    slug: 'claude',
    file: 'claude_desktop_config.json',
    path: '~/Library/Application Support/Claude/',
    note: 'Restart Claude after saving.',
    config: `{
  "mcpServers": {
    "campusmind": {
      "command": "npx",
      "args": [
        "-y",
        "@nitrostack/mcp-stdio-bridge",
        "http://localhost:3001/mcp"
      ],
      "env": {
        "MCP_TOKEN": "YOUR_JWT_TOKEN"
      }
    }
  }
}`,
  },
  {
    name: 'Cursor',
    slug: 'cursor',
    file: '.cursor/mcp.json',
    path: 'project root',
    note: 'Open Cursor Settings → Features → MCP to verify.',
    config: `{
  "mcpServers": {
    "campusmind": {
      "type": "http",
      "url": "http://localhost:3001/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_JWT_TOKEN"
      }
    }
  }
}`,
  },
  {
    name: 'Windsurf',
    slug: 'windsurf',
    file: '.windsurf/mcp_config.json',
    path: 'project root',
    note: 'Or via Settings → MCP Servers in the IDE.',
    config: `{
  "mcpServers": {
    "campusmind": {
      "command": "npx",
      "args": [
        "-y",
        "@nitrostack/mcp-stdio-bridge",
        "http://localhost:3001/mcp"
      ],
      "env": {
        "MCP_TOKEN": "YOUR_JWT_TOKEN"
      }
    }
  }
}`,
  },
  {
    name: 'Cline (VS Code)',
    slug: 'cline',
    file: '.cline/mcp.json',
    path: 'project root',
    note: 'Cline extension reads this from the workspace root.',
    config: `{
  "mcpServers": {
    "campusmind": {
      "command": "npx",
      "args": [
        "-y",
        "@nitrostack/mcp-stdio-bridge",
        "http://localhost:3001/mcp"
      ],
      "env": {
        "MCP_TOKEN": "YOUR_JWT_TOKEN"
      }
    }
  }
}`,
  },
  {
    name: 'Continue.dev',
    slug: 'continue',
    file: 'config.json',
    path: '~/.continue/',
    note: 'Add to the "experimental" MCP servers section.',
    config: `{
  "experimental": {
    "mcpServers": {
      "campusmind": {
        "command": "npx",
        "args": [
          "-y",
          "@nitrostack/mcp-stdio-bridge",
          "http://localhost:3001/mcp"
        ],
        "env": {
          "MCP_TOKEN": "YOUR_JWT_TOKEN"
        }
      }
    }
  }
}`,
  },
]

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      {label && <div className="text-[10px] text-faint mb-1 font-mono">{label}</div>}
      <pre className="bg-offset rounded-lg p-4 pr-10 overflow-x-auto text-[12px] leading-relaxed">{code}</pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        className="absolute top-3 right-3 p-1.5 rounded-md bg-surface border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-offset"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
      </button>
    </div>
  )
}

function CollapsibleSection({ title, icon: Icon, defaultOpen, children }: { title: string; icon: LucideIcon; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-text hover:bg-offset transition-colors">
        <Icon className="w-4 h-4 text-accent shrink-0" />
        <span className="flex-1 text-left">{title}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-muted" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export default function McpPage() {
  return (
    <div className="max-w-4xl">
      <FadeUp>
      <div className="mb-8">
        <div className="text-xs text-accent uppercase tracking-wider mb-1">Integration Guide</div>
        <h1 className="font-display text-3xl text-text">Connect CampusMind MCP</h1>
        <p className="text-sm text-muted mt-1">22 tools &middot; 5 resources &middot; HTTP transport &middot; localhost:3001</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-text mb-4">Available Tools</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {tools.map(group => (
              <CollapsibleSection key={group.group} title={`${group.group} (${group.items.length})`} icon={group.icon}>
                <div className="space-y-2 mt-3">
                  {group.items.map(tool => (
                    <div key={tool.name} className="text-sm">
                      <code className="text-[12px] text-accent font-mono">{tool.name}</code>
                      <p className="text-xs text-muted mt-0.5">{tool.desc}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-text mb-4">Connect to AI Assistants</h2>
          <div className="space-y-4">
            {platforms.map(p => (
              <div key={p.slug} className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-medium text-text">{p.name}</h3>
                  <span className="text-[10px] text-faint font-mono ml-auto">{p.file}</span>
                </div>
                <p className="text-xs text-muted mb-3">
                  Place this in <code className="text-[11px] text-text font-mono">{p.path}</code>.
                  {p.note}
                </p>
                <CodeBlock code={p.config} label={p.file} />
              </div>
            ))}
          </div>
        </section>

        <section className="border border-border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-text mb-3">Getting a JWT Token</h2>
          <p className="text-xs text-muted mb-3">Use the <code className="text-[11px] text-accent font-mono">login</code> tool to get a session token, then paste it in place of <code className="text-[11px] text-accent font-mono">YOUR_JWT_TOKEN</code> above. If your MCP client supports it, you can also call <code className="text-[11px] text-accent font-mono">login</code> directly from the assistant.</p>
          <CodeBlock code={`curl -X POST http://localhost:3001/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "login",
      "arguments": {
        "email": "aisha@university.edu",
        "password": "password123"
      }
    }
  }'`} label="Get token via curl" />
        </section>

        <section className="border border-border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-text mb-3">Resources (Read-Only)</h2>
          <div className="space-y-2">
            {[
              { uri: 'student://{studentId}/profile', desc: 'Identity and academic profile' },
              { uri: 'student://{studentId}/memory', desc: 'Concept mastery, recent struggles, study streak' },
              { uri: 'student://{studentId}/weak-topics', desc: 'Low-confidence concepts sorted by urgency' },
              { uri: 'student://{studentId}/upcoming-deadlines', desc: 'Near-term deadlines sorted by due date' },
              { uri: 'course://{courseId}/syllabus', desc: 'Full syllabus in markdown' },
            ].map(r => (
              <div key={r.uri} className="flex items-start gap-3 text-sm">
                <code className="text-[11px] text-accent font-mono shrink-0 mt-0.5">{r.uri}</code>
                <span className="text-xs text-muted">{r.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-text mb-2">Server Details</h2>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
            {[
              ['Endpoint', 'http://localhost:3001/mcp'],
              ['Transport', 'HTTP (JSON-RPC 2.0 + SSE)'],
              ['Auth', 'Bearer JWT + Mcp-Session-Id header'],
              ['Protocol', '2025-06-18'],
              ['Stack', 'NitroStack (@nitrostack/core)'],
              ['Tools', '22'],
              ['Resources', '5'],
              ['Prompts', '1 (voice-tutor-session)'],
            ].map(([k, v]) => (
              <>
                <span className="text-muted shrink-0">{k}</span>
                <span className="text-text font-mono">{v}</span>
              </>
            ))}
          </div>
        </section>
      </div>
      </FadeUp>
    </div>
  )
}
