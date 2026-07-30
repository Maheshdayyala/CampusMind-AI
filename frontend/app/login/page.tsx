'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { GraduationCap, ArrowRight, Sparkles } from 'lucide-react'

const DEMO_ACCOUNTS: Record<string, { email: string; password: string; name: string; program: string }> = {
  'aisha@university.edu': { email: 'aisha@university.edu', password: 'password123', name: 'Aisha', program: 'BSc Computer Science' },
  'rohan@university.edu': { email: 'rohan@university.edu', password: 'pass456', name: 'Rohan', program: 'BSc Physics' },
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
    try {
      await login(email, password)
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-inverse" />
            </div>
          </Link>
          <h1 className="font-display text-2xl text-text mb-1">Welcome back</h1>
          <p className="text-sm text-muted">Sign in to your CampusMind account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-sm text-error bg-error/5 px-3 py-2 rounded-md">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-inverse/30 border-t-inverse rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign in <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-divider">
          <p className="text-xs text-center text-faint mb-3">Demo accounts</p>
          <div className="space-y-2">
            {Object.values(DEMO_ACCOUNTS).map((acc) => (
              <button
                key={acc.email}
                onClick={() => { setEmail(acc.email); setPassword(acc.password) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border text-left hover:bg-surface-offset transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-xs font-medium text-inverse">
                  {acc.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text">{acc.name}</div>
                  <div className="text-xs text-muted truncate">{acc.program}</div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-center text-faint mt-3">
            Password: <span className="text-text font-mono text-[11px]">password123</span> / <span className="text-text font-mono text-[11px]">pass456</span>
          </p>
        </div>
      </div>
    </div>
  )
}
