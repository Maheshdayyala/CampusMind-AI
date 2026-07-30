'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { getReviewDue } from '@/lib/mcp'
import {
  LayoutDashboard, MessageSquare, Clock, Calendar,
  Upload, BarChart3, Settings, GraduationCap,
  Zap, Mic, Users, Bug, Brain,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/review', label: 'Review', icon: Clock },
  { href: '/planner', label: 'Planner', icon: Calendar },
  { href: '/memory', label: 'Memory', icon: Brain },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/exam-mode', label: 'Exam Mode', icon: Zap },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/voice', label: 'Voice', icon: Mic },
  { href: '/faculty', label: 'Faculty', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/developer', label: 'Dev', icon: Bug },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { studentId } = useAuth()
  const [open, setOpen] = useState(false)
  const [reviewCount, setReviewCount] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!studentId) return
    getReviewDue(studentId, 3).then(r => setReviewCount(r.count)).catch(() => {})
  }, [studentId])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const collapsed = !open

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-30 w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-text transition-all"
          title="Open sidebar"
        >
          <GraduationCap className="w-5 h-5" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-30 bg-black/20" onClick={() => setOpen(false)} />
      )}

      <aside
        ref={ref}
        className={cn(
          'fixed left-0 top-0 h-full z-40 flex flex-col bg-surface border-r border-border transition-all duration-300',
          open ? 'w-56' : 'w-0 -translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-inverse" />
            </div>
            <span className="text-sm font-medium text-text">CampusMind</span>
          </Link>
          <button onClick={() => setOpen(false)} className="text-muted hover:text-text transition-colors p-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150',
                  isActive
                    ? 'bg-accent-highlight text-accent font-medium'
                    : 'text-muted hover:text-text hover:bg-surface-offset'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.href === '/review' && reviewCount !== null && reviewCount > 0 && (
                  <span className="ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded-sm bg-accent-highlight text-accent">{reviewCount}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
