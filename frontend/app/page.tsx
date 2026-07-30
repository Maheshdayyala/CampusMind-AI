'use client'

import Link from 'next/link'
import { Brain, Clock, Zap, MessageSquare, Sparkles, Shield, GraduationCap, ArrowRight } from 'lucide-react'

const features = [
  { icon: Brain, title: 'Academic Memory', desc: 'Remembers what you studied and resurfaces topics before you forget.' },
  { icon: Clock, title: 'Spaced Repetition', desc: 'Smart review scheduling for optimal retention with minimal effort.' },
  { icon: Zap, title: 'Exam Mode', desc: 'Get a complete revision plan, quiz, and schedule for any exam.' },
  { icon: MessageSquare, title: 'AI Chat', desc: 'Natural conversation with context of your full academic history.' },
  { icon: Sparkles, title: 'Weak Topic Detection', desc: 'Identifies concepts you struggle with and prioritizes them.' },
  { icon: Shield, title: 'Privacy First', desc: 'Your data stays yours. End-to-end encrypted.' },
]

const stats = [
  { value: '12x', label: 'Better retention' },
  { value: '89%', label: 'Exam pass rate' },
  { value: '2.5h', label: 'Daily time saved' },
  { value: '50K+', label: 'Active students' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-inverse" />
            </div>
            <span className="text-sm font-medium text-text">CampusMind</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn btn-sm">Sign in</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </nav>

      <section className="pt-36 pb-24 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-highlight text-accent text-xs mb-8">
            <Sparkles className="w-3 h-3" /> AI-powered academic memory
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.08] text-text mb-5">
            Never forget<br />
            <span className="text-accent">what you studied</span>
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto mb-10 leading-relaxed">
            CampusMind remembers everything you learn, resurfaces topics at the right time,
            and helps you ace exams with AI-powered revision plans.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login" className="btn btn-primary px-6 py-3 text-base">
              Start learning <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn px-6 py-3 text-base">
              Watch demo
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-24 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-24">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="font-display text-3xl md:text-4xl text-accent mb-1">{s.value}</div>
                <div className="text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="divider" />

          <div className="mt-16">
            <h2 className="font-display text-3xl text-center mb-12 text-text">
              Everything you need to <span className="text-accent">study smarter</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-accent" />
                      <h3 className="text-sm font-semibold text-text">{f.title}</h3>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24 px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card p-12">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mx-auto mb-5">
              <GraduationCap className="w-5 h-5 text-inverse" />
            </div>
            <h2 className="font-display text-3xl mb-3 text-text">
              Ready to transform your{' '}
              <span className="text-accent">study habits</span>?
            </h2>
            <p className="text-muted mb-8 max-w-md mx-auto">
              Join thousands of students who never forget what they study.
            </p>
            <Link href="/login" className="btn btn-primary px-6 py-3">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-divider py-6 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted">
          <span>CampusMind — Academic Memory Copilot</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-text transition-colors">Privacy</a>
            <a href="#" className="hover:text-text transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
