'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { getReviewDue } from '@/lib/mcp'
import {
  LayoutDashboard, MessageSquare, Clock, Calendar,
  Upload, BarChart3, Settings, GraduationCap,
  Zap, Mic, Users, Bug, Brain, Terminal,
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
  { href: '/mcp', label: 'MCP', icon: Terminal },
  { href: '/developer', label: 'Dev', icon: Bug },
]

const sidebarVariants = {
  open: { x: 0, width: 224, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  closed: { x: '-100%', width: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
}

const navItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: 0.05 * i, duration: 0.25, ease: [0.16, 1, 0.3, 1] } }),
}

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

  return (
    <>
      <motion.button
        initial={false}
        animate={open ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 left-4 z-30 w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-text hover:border-divider hover:shadow-sm"
        title="Open sidebar"
      >
        <GraduationCap className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        ref={ref}
        variants={sidebarVariants}
        initial="closed"
        animate={open ? 'open' : 'closed'}
        className="fixed left-0 top-0 h-full z-40 flex flex-col bg-surface border-r border-border overflow-hidden"
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: -5 }}
                className="w-7 h-7 rounded-md bg-accent flex items-center justify-center"
              >
                <GraduationCap className="w-4 h-4 text-inverse" />
              </motion.div>
              <span className="text-sm font-medium text-text">CampusMind</span>
            </Link>
          </motion.div>
          <motion.button
            onClick={() => setOpen(false)}
            whileHover={{ rotate: 90, color: 'var(--color-text)' }}
            transition={{ duration: 0.2 }}
            className="text-muted p-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </motion.button>
        </div>

        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <motion.div
                key={item.href}
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 relative',
                    isActive
                      ? 'text-accent font-medium'
                      : 'text-muted hover:text-text hover:bg-surface-offset'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-md bg-accent-highlight"
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                  {item.href === '/review' && reviewCount !== null && reviewCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded-sm bg-accent-highlight text-accent relative z-10"
                    >
                      {reviewCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </motion.aside>
    </>
  )
}
