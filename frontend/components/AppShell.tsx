'use client'

import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import { AuthGuard } from '@/lib/auth'
import { PageWrapper } from '@/lib/animations'

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
              <AnimatePresence mode="wait">
                <PageWrapper key={pathname}>
                  {children}
                </PageWrapper>
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}
    </AuthGuard>
  )
}
