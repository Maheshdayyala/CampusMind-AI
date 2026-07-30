'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { GraduationCap, ArrowRight, Sparkles, User, Eye, EyeOff } from 'lucide-react'

const DEMO_ACCOUNTS: Record<string, { id: string; name: string; program: string }> = {
  'aisha@': { id: 's1', name: 'Aisha', program: 'BSc Computer Science' },
  'rohan@': { id: 's2', name: 'Rohan', program: 'BSc Physics' },
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = []
    const count = 40

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.1,
      })
    }

    let animId: number
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(1, 105, 111, ${p.alpha})`
        ctx.fill()
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(1, 105, 111, ${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

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

  const quickSelect = (key: string) => {
    setEmail(key)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f7f6f2]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0 bg-gradient-to-br from-[#01696f]/[0.03] via-transparent to-[#01696f]/[0.06]" />

      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-[#01696f]/[0.03] blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#01696f]/[0.04] blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative w-full max-w-md mx-4">
        <div className="relative">
          <div className="absolute inset-0 bg-[#f9f8f5] rounded-3xl shadow-[0_0_0_1px_rgba(40,37,29,0.08),0_8px_32px_rgba(20,16,10,0.06)]" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#01696f]/[0.02] to-transparent pointer-events-none" />
          <div className="relative px-8 py-10 md:px-10 md:py-12">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
                <div className="w-11 h-11 rounded-[14px] bg-[#01696f] flex items-center justify-center shadow-[0_4px_12px_rgba(1,105,111,0.2)] transition-transform duration-300 group-hover:scale-105">
                  <GraduationCap className="w-5 h-5 text-[#f9f8f4]" />
                </div>
              </Link>
              <h1 className="font-display text-[28px] font-bold tracking-tight text-[#28251d] mb-1">
                Welcome back
              </h1>
              <p className="text-sm text-[#6d6b66]">
                Sign in to your CampusMind account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#6d6b66]">Email</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-[#f9f8f5] border border-[rgba(40,37,29,0.12)] rounded-xl shadow-[0_1px_2px_rgba(20,16,10,0.06)] transition-colors duration-200 focus-within:border-[#01696f]/40 focus-within:shadow-[0_0_0_3px_rgba(1,105,111,0.08)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a59d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <input
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-0 bg-transparent outline-none text-sm text-[#28251d] placeholder:text-[#a8a59d]"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#6d6b66]">Password</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-[#f9f8f5] border border-[rgba(40,37,29,0.12)] rounded-xl shadow-[0_1px_2px_rgba(20,16,10,0.06)] transition-colors duration-200 focus-within:border-[#01696f]/40 focus-within:shadow-[0_0_0_3px_rgba(1,105,111,0.08)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a59d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={''}
                    onChange={() => {}}
                    className="w-full border-0 bg-transparent outline-none text-sm text-[#28251d] placeholder:text-[#a8a59d]"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-[#a8a59d] hover:text-[#6d6b66] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 px-4 py-3 bg-[#a12c7b]/[0.06] border border-[#a12c7b]/[0.15] rounded-xl">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a12c7b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="text-sm text-[#a12c7b]">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3.5 px-4 bg-[#01696f] text-[#f9f8f4] rounded-xl font-medium text-sm shadow-[0_4px_14px_rgba(1,105,111,0.25)] hover:bg-[#0c4e54] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
              >
                <span className={`flex items-center justify-center gap-2 transition-all duration-300 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                  Sign in
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
                {isLoading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[rgba(40,37,29,0.12)]">
              <p className="text-xs text-[#a8a59d] text-center mb-3">
                Demo accounts — use any password
              </p>
              <div className="flex flex-col gap-2">
                {Object.entries(DEMO_ACCOUNTS).map(([key, acc]) => (
                  <button
                    key={key}
                    onClick={() => quickSelect(key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                      email === key
                        ? 'bg-[#dce9e7] border-[#01696f]/30 text-[#01696f] shadow-[0_0_0_1px_rgba(1,105,111,0.15)]'
                        : 'bg-[#fbfbf9] border-[rgba(40,37,29,0.08)] text-[#6d6b66] hover:bg-[#f3f0ec] hover:border-[rgba(40,37,29,0.15)]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                      email === key
                        ? 'bg-[#01696f] text-[#f9f8f4]'
                        : 'bg-[#f3f0ec] text-[#6d6b66]'
                    }`}>
                      {acc.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{acc.name}</div>
                      <div className="text-[11px] opacity-70 truncate">{acc.program}</div>
                    </div>
                    <User className={`w-4 h-4 shrink-0 transition-opacity duration-200 ${email === key ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#a8a59d]">
                <Sparkles className="w-3 h-3" />
                <span>Use <code className="px-1.5 py-0.5 rounded-md bg-[#f3f0ec] text-[#6d6b66] text-[11px] font-mono">aisha@</code> or <code className="px-1.5 py-0.5 rounded-md bg-[#f3f0ec] text-[#6d6b66] text-[11px] font-mono">rohan@</code> to log in instantly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
