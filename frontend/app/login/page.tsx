'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { GraduationCap, Mail, ArrowRight, Sparkles, Lock } from 'lucide-react'

const DEMO_ACCOUNTS: Record<string, { id: string; name: string }> = {
  'aisha@': { id: 's1', name: 'Aisha' },
  'rohan@': { id: 's2', name: 'Rohan' },
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const match = Object.entries(DEMO_ACCOUNTS).find(([key]) => email.toLowerCase().includes(key))
    const studentId = match ? match[1].id : 's1'

    try {
      await login(studentId)
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-full max-w-md mx-4">
        <div className="card p-8 md:p-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 text-inverse" />
              </div>
            </Link>
            <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
            <p className="text-muted text-sm">Sign in to your CampusMind account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
              <div className="search-box">
                <Mail className="w-4 h-4 text-faint shrink-0" />
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Password</label>
              <div className="search-box">
                <Lock className="w-4 h-4 text-faint shrink-0" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3.5 !rounded-xl disabled:opacity-60 disabled:cursor-not-allowed justify-center"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" viewBox="0 0 24 24" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-faint text-center mb-2">Demo accounts (type any password)</p>
            <div className="flex items-center justify-center gap-2 text-xs text-faint">
              <Sparkles className="w-3 h-3" />
              <span>Use aisha@ or rohan@ to log in instantly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
