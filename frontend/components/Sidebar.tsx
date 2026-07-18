'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Brain, MessageSquare, Clock, BookOpen,
  Calendar, Upload, BarChart3, Settings, GraduationCap,
  ChevronLeft, Zap, Bug, Mic, Users,
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
  { href: '/voice', label: 'Voice Assistant', icon: Mic },
  { href: '/faculty', label: 'Faculty', icon: Users },
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
        'fixed left-0 top-0 h-screen z-40 flex flex-col bg-surface border-r border-border transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[272px]'
      )}
    >
      <div className={cn(
        'flex items-center h-16 border-b border-border px-5',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-inverse" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text">CampusMind</div>
              <div className="text-[10px] text-faint">AI copilot</div>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-inverse" />
          </Link>
        )}
      </div>

      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-primary-highlight text-primary'
                  : 'text-muted hover:text-text hover:bg-surface-offset'
              )}
            >
              <Icon className={cn('w-[18px] h-[18px] shrink-0')} />
              {!collapsed && <span>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-text opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-sm">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={cn('p-3 border-t border-border', collapsed && 'flex justify-center')}>
        <button
          onClick={onToggle}
          className="btn btn-sm w-full justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>
    </aside>
  )
}
