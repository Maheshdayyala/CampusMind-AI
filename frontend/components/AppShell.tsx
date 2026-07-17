'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Particles from './Particles'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const authPages = ['/', '/login']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const isAuthPage = authPages.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Particles count={30} />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        )}
      >
        {children}
      </main>
    </div>
  )
}
