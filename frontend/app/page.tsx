'use client'

import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import {
  Brain,
  Clock,
  Sparkles,
  Shield,
  Zap,
  MessageSquare,
  ArrowRight,
  Star,
  GraduationCap,
  Menu,
  X,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const features = [
  { icon: Brain, title: 'Academic Memory', desc: 'Persistent memory that remembers what you studied and proactively resurfaces topics before you forget.' },
  { icon: Clock, title: 'Spaced Repetition', desc: 'Smart review scheduling ensures optimal retention with minimal time investment.' },
  { icon: Zap, title: 'Exam Mode', desc: 'Type "I have an exam tomorrow" and get a complete revision plan, quiz, flashcards, and schedule.' },
  { icon: MessageSquare, title: 'AI Chat', desc: 'Natural conversation with context of your entire academic history and progress.' },
  { icon: Sparkles, title: 'Weak Topic Detection', desc: 'Identifies concepts you struggle with and prioritizes them in your study plan.' },
  { icon: Shield, title: 'Privacy First', desc: 'Your data stays yours. End-to-end encrypted and never shared with third parties.' },
]

const stats = [
  { value: '12x', label: 'Better retention' },
  { value: '89%', label: 'Exam pass rate' },
  { value: '2.5h', label: 'Daily time saved' },
  { value: '50K+', label: 'Active students' },
]

export default function LandingPage() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1a73e8] to-[#0d47a1] flex items-center justify-center shadow-glow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-[var(--text-primary)]">CampusMind</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/login" className="btn-primary text-sm !px-5 !py-2.5">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <motion.div style={{ opacity, scale }} className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#1a73e8]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#0d47a1]/10 rounded-full blur-[100px]" />
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-[var(--accent-light)] mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-powered academic memory system</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6"
          >
            <span className="gradient-text">Never forget</span>
            <br />
            <span className="text-[var(--text-primary)]">what you studied</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            CampusMind remembers everything you learn, resurfaces topics at the right time,
            and helps you ace exams with AI-powered revision plans.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link href="/login" className="btn-primary text-base !px-8 !py-3.5">
              Start learning free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary text-base !px-8 !py-3.5">
              Watch demo
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold gradient-text">{s.value}</div>
                <div className="text-sm text-[var(--text-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-glow)] to-transparent" />
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Everything you need to{' '}
              <span className="gradient-text">study smarter</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
              Built for students who want to retain more, stress less, and perform better.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div key={i} variants={item} className="glass-card p-6 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a73e8]/20 to-[#0d47a1]/10 border border-[var(--border-primary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-[var(--accent-light)]" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-glow)] to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card-static max-w-3xl mx-auto text-center p-12 md:p-16 glow-border relative overflow-hidden"
        >
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#1a73e8]/10 rounded-full blur-[80px]" />
          <div className="relative z-[1]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a73e8] to-[#0d47a1] flex items-center justify-center mx-auto mb-6 shadow-glow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Ready to transform your{' '}
              <span className="gradient-text">study habits</span>?
            </h2>
            <p className="text-[var(--text-secondary)] text-lg mb-8 max-w-lg mx-auto">
              Join thousands of students who never forget what they study.
            </p>
            <Link href="/login" className="btn-primary text-base !px-8 !py-3.5">
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-primary)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <GraduationCap className="w-4 h-4" />
            <span>CampusMind AI &mdash; Academic Memory Copilot</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Terms</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
