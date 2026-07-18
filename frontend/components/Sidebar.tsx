'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Brain,
  MessageSquare,
  Clock,
  BookOpen,
  Calendar,
  Upload,
  BarChart3,
  Settings,
  GraduationCap,
  ChevronLeft,
  Zap,
  Bug,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/memory', label: 'Memory Timeline', icon: Brain },
  { href: '/review', label: 'Review Center', icon: Clock },
  { href: '/planner', label: 'Study Planner', icon: Calendar },
  { href: '/upload', label: 'Notes Upload', icon: Upload },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/exam-mode', label: 'Exam Mode', icon: Zap },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/developer', label: 'Developer', icon: Bug },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-40 flex flex-col glass border-r border-[var(--border-primary)] transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      <div className={cn(
        'flex items-center h-16 border-b border-[var(--border-primary)] px-4',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1a73e8] to-[#0d47a1] flex items-center justify-center shadow-glow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">CampusMind</div>
              <div className="text-[10px] text-[var(--text-muted)]">AI copilot</div>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1a73e8] to-[#0d47a1] flex items-center justify-center shadow-glow">
            <GraduationCap className="w-5 h-5 text-white" />
          </Link>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'text-white bg-gradient-to-r from-[#1a73e8]/20 to-[#0d47a1]/10 border border-[var(--border-glow)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
              )}
            >
              {isActive && !collapsed && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#1a73e8]/20 to-[#0d47a1]/10 border border-[var(--border-glow)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn('w-[18px] h-[18px] shrink-0', isActive && 'text-[var(--accent-light)]')} />
              {!collapsed && <span className="relative z-[1]">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 rounded-lg bg-[#0e0f2a] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={cn('p-3 border-t border-[var(--border-primary)]', collapsed && 'flex justify-center')}>
        <button
          onClick={onToggle}
          className="btn-ghost w-full justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>
    </aside>
  )
}
