'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/lib/auth'
import McpStatus from './McpStatus'

const authPages = ['/', '/login']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const isAuthPage = authPages.includes(pathname)

  return (
    <AuthGuard>
      {isAuthPage ? (
        <>{children}</>
      ) : (
        <div className="min-h-screen">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main
            className={cn(
              'transition-all duration-300 min-h-screen',
              sidebarCollapsed ? 'ml-[72px]' : 'ml-[272px]'
            )}
          >
            {children}
            <div className="text-center py-4 text-[10px] text-faint opacity-50">
              Powered by MCP
            </div>
          </main>
          <McpStatus />
        </div>
      )}
    </AuthGuard>
  )
}
