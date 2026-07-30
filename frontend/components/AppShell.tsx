'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { cn } from '@/lib/utils'
import { AuthGuard } from '@/lib/auth'

const authPages = ['/', '/login']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = authPages.includes(pathname)

  return (
    <AuthGuard>
      {isAuthPage ? (
        <>{children}</>
      ) : (
        <div className="min-h-screen flex">
          <Sidebar />
          <main className="flex-1 min-h-screen">
            <div className="max-w-6xl mx-auto px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      )}
    </AuthGuard>
  )
}
