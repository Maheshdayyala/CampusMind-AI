'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'
import { Brain, Clock, Zap, MessageSquare, Sparkles, Shield, GraduationCap, ArrowRight, BookOpen, Target, ChevronDown } from 'lucide-react'
import { FadeUp, Stagger, SlideLeft, SlideRight, ScaleIn, FadeIn, hoverScale } from '@/lib/animations'

const features = [
  { icon: Brain, title: 'Academic Memory', desc: 'Remembers what you studied and resurfaces topics before you forget them.', gradient: 'from-[#1e3a5f] to-[#2a5280]' },
  { icon: Clock, title: 'Spaced Repetition', desc: 'Smart review scheduling for optimal retention with minimal daily effort.', gradient: 'from-[#2563eb] to-[#1d4ed8]' },
  { icon: Zap, title: 'Exam Mode', desc: 'A complete revision plan, quiz, and schedule generated for any exam.', gradient: 'from-[#3f6212] to-[#4d7c16]' },
  { icon: MessageSquare, title: 'AI Chat', desc: 'Natural conversation with context of your full academic history.', gradient: 'from-[#1e3a5f] to-[#2a5280]' },
  { icon: Sparkles, title: 'Weak Topic Detection', desc: 'Identifies concepts you struggle with and prioritizes them.', gradient: 'from-[#2563eb] to-[#1d4ed8]' },
  { icon: Shield, title: 'Privacy First', desc: 'Your data stays yours. End-to-end encrypted and secure.', gradient: 'from-[#3f6212] to-[#4d7c16]' },
]

const steps = [
  { num: '01', title: 'Study as usual', desc: 'Upload notes, chat with AI, or take quizzes. CampusMind learns from everything you do.' },
  { num: '02', title: 'Memory builds', desc: 'Every concept gets a confidence score. Weak topics are flagged automatically.' },
  { num: '03', title: 'Smart review', desc: 'You get a daily review session tailored to what you\'re about to forget.' },
]

const logos = ['Kickstarter', 'Etsy', 'Casper', 'Outschool', 'Scratch', 'Paytient']

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <div className="min-h-screen bg-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-transparent">
        <div className="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between">
          <motion.div className="flex items-center gap-2.5" {...hoverScale}>
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-inverse" />
            </div>
            <span className="text-sm font-medium text-text">CampusMind</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn btn-sm">Sign in</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </nav>

      <section ref={heroRef} className="relative pt-40 pb-32 px-8 overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeUp>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-highlight text-accent text-xs mb-6">
                  <Sparkles className="w-3 h-3" /> AI-powered academic memory
                </div>
              </FadeUp>
              <FadeUp delay={0.1}>
                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.08] text-text mb-6">
                  Never forget<br />
                  <span className="text-accent">what you studied</span>
                </h1>
              </FadeUp>
              <FadeUp delay={0.2}>
                <p className="text-lg text-muted max-w-md mb-10 leading-relaxed">
                  CampusMind remembers everything you learn, resurfaces topics at the right time,
                  and helps you ace exams with AI-powered revision plans.
                </p>
              </FadeUp>
              <FadeUp delay={0.3}>
                <div className="flex items-center gap-3">
                  <motion.div {...hoverScale}>
                    <Link href="/login" className="btn btn-primary px-6 py-3 text-base inline-flex items-center gap-2">
                      Start learning <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                  <Link href="/login" className="btn px-6 py-3 text-base">
                    Watch demo
                  </Link>
                </div>
              </FadeUp>
              <FadeUp delay={0.4}>
                <div className="flex items-center gap-4 mt-8 text-xs text-muted">
                  <div className="flex -space-x-2">
                    {['#1e3a5f', '#2563eb', '#3f6212', '#b45309'].map((c, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-bg" style={{ background: c }} />
                    ))}
                  </div>
                  <span>Trusted by 50K+ students</span>
                </div>
              </FadeUp>
            </div>

            <div className="hidden lg:block">
              <FadeIn delay={0.3}>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="relative z-10 rounded-2xl overflow-hidden shadow-lg">
                    <div className="aspect-[4/3] bg-gradient-to-br from-accent/5 to-accent/20 p-8 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                        {[
                          { label: 'Memory retention', value: '94%', color: 'text-accent' },
                          { label: 'Avg. score', value: '89%', color: 'text-success' },
                          { label: 'Daily review', value: '12min', color: 'text-warning' },
                          { label: 'Topics mastered', value: '142', color: 'text-accent' },
                        ].map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-surface/90 backdrop-blur rounded-xl p-4 text-center"
                          >
                            <div className={`text-2xl font-display ${s.color}`}>{s.value}</div>
                            <div className="text-[11px] text-muted mt-0.5">{s.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border border-border -z-10" />
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-5 h-5 text-muted" />
        </motion.div>
      </section>

      <section className="pb-28 px-8">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="text-center mb-4">
              <div className="eyebrow mb-2">How it works</div>
              <h2 className="font-display text-3xl md:text-4xl text-text">
                Three steps to <span className="text-accent">mastery</span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {steps.map((step, i) => (
              <ScaleIn key={i} delay={0.1 * i}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="p-6 rounded-xl border border-border bg-surface relative"
                >
                  <div className="text-4xl font-display text-accent/20 mb-4 leading-none">{step.num}</div>
                  <h3 className="text-base font-semibold text-text mb-2">{step.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
                </motion.div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-28 px-8">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="text-center mb-4">
              <div className="eyebrow mb-2">Features</div>
              <h2 className="font-display text-3xl md:text-4xl text-text">
                Everything you need to <span className="text-accent">study smarter</span>
              </h2>
            </div>
          </FadeUp>

          <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.06)' }}
                  className="p-6 rounded-xl border border-border bg-surface transition-shadow"
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-text mb-2">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
                </motion.div>
              )
            })}
          </Stagger>
        </div>
      </section>

      <section className="pb-28 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SlideLeft>
              <div className="eyebrow mb-2">Analytics</div>
              <h2 className="font-display text-3xl md:text-4xl text-text mb-6">
                Know exactly <span className="text-accent">where you stand</span>
              </h2>
              <p className="text-muted mb-8 leading-relaxed">
                Real-time confidence tracking for every concept you study.
                See weak spots before they become problems.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Topic confidence', value: 72, color: 'bg-accent' },
                  { label: 'Review consistency', value: 88, color: 'bg-success' },
                  { label: 'Exam readiness', value: 65, color: 'bg-warning' },
                ].map((bar, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text">{bar.label}</span>
                      <span className="text-muted">{bar.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-offset overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${bar.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full ${bar.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SlideLeft>

            <SlideRight>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-2xl border border-border overflow-hidden shadow-sm"
              >
                <div className="aspect-[5/4] bg-gradient-to-br from-accent/5 to-accent/10 p-8 flex flex-col justify-center">
                  <div className="text-xs text-muted mb-4 uppercase tracking-wider">Weekly Insight</div>
                  <div className="text-3xl font-display text-text mb-2">You're ahead</div>
                  <p className="text-sm text-muted mb-6">Your consistency this week is 23% higher than last week.</p>
                  <div className="grid grid-cols-7 gap-2">
                    {[60, 75, 45, 90, 85, 70, 95].map((h, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.5 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                          className="w-full rounded-sm bg-accent/60"
                          style={{ height: `${h * 0.6}%`, minHeight: 12 }}
                        />
                        <span className="text-[10px] text-muted">M T W T F S S</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </SlideRight>
          </div>
        </div>
      </section>

      <section className="pb-28 px-8">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="eyebrow mb-2">Trusted by</div>
              <h2 className="font-display text-2xl text-text">Leading academic institutions</h2>
            </div>
          </FadeUp>
          <FadeIn>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              {logos.map((name, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="text-sm text-muted font-medium tracking-wider opacity-60 hover:opacity-100 transition-opacity"
                >
                  {name}
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="pb-28 px-8">
        <div className="max-w-2xl mx-auto">
          <ScaleIn>
            <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-accent via-blue to-success" />
              <div className="p-10 md:p-14 text-center">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-5 h-5 text-inverse" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl mb-4 text-text">
                  Ready to transform your{' '}
                  <span className="text-accent">study habits</span>?
                </h2>
                <p className="text-muted mb-8 max-w-sm mx-auto">
                  Join thousands of students who never forget what they study.
                </p>
                <motion.div {...hoverScale} className="inline-block">
                  <Link href="/login" className="btn btn-primary px-8 py-3 text-base inline-flex items-center gap-2">
                    Get started free <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </ScaleIn>
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
