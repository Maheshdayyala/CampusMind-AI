import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/AppShell'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'CampusMind AI — Academic Memory Copilot',
  description: 'A persistent academic memory system for students. Remember what you study, resurface topics, ace your exams.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
