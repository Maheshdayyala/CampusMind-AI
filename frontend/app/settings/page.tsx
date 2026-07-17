'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import { cn } from '@/lib/utils'
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  User,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Volume2,
  MessageSquare,
} from 'lucide-react'

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  { id: 'language', label: 'Language & Region', icon: Globe },
  { id: 'voice', label: 'Voice Assistant', icon: Volume2 },
  { id: 'ai', label: 'AI Preferences', icon: MessageSquare },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('appearance')
  const [theme, setTheme] = useState('dark')

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold mb-8">
        Settings
      </motion.h1>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-56 shrink-0">
          <nav className="space-y-1">
            {sections.map(s => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    activeSection === s.id
                      ? 'bg-[#1a73e8]/20 text-[var(--accent-light)] border border-[var(--border-glow)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
              )
            })}
            <div className="pt-4 mt-4 border-t border-[var(--border-primary)]">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--error)] hover:bg-red-500/5 transition-all">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <GlassCard glow className="p-6">
                <h2 className="font-display font-bold text-lg mb-1">Theme</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-5">Choose how CampusMind looks</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', icon: Sun, label: 'Light' },
                    { id: 'dark', icon: Moon, label: 'Dark' },
                    { id: 'system', icon: Monitor, label: 'System' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                        theme === t.id
                          ? 'bg-[#1a73e8]/20 border-[var(--border-glow)] text-[var(--accent-light)]'
                          : 'glass text-[var(--text-secondary)] border-[var(--border-primary)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      <t.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </GlassCard>

              <GlassCard glow className="p-6">
                <h2 className="font-display font-bold text-lg mb-1">Layout</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-5">Customize your workspace</p>
                <div className="space-y-4">
                  {[
                    { label: 'Compact sidebar', desc: 'Show icons only', enabled: false },
                    { label: 'Show dashboard stats', desc: 'Display metrics on dashboard', enabled: true },
                    { label: 'Reduced motion', desc: 'Minimize animations', enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-[var(--text-muted)]">{item.desc}</div>
                      </div>
                      <Toggle enabled={item.enabled} />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeSection === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard glow className="p-6">
                <h2 className="font-display font-bold text-lg mb-1">Profile</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-6">Manage your account details</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a73e8] to-[#0d47a1] flex items-center justify-center text-2xl font-bold text-white">
                    A
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold">Aisha Sharma</div>
                    <div className="text-sm text-[var(--text-secondary)]">BSc Computer Science, Year 2</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Full Name', value: 'Aisha Sharma' },
                    { label: 'Email', value: 'aisha@university.edu' },
                    { label: 'Program', value: 'BSc Computer Science' },
                    { label: 'Year', value: '2nd Year' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-[var(--border-primary)]">
                      <div>
                        <div className="text-xs text-[var(--text-muted)]">{f.label}</div>
                        <div className="text-sm font-medium">{f.value}</div>
                      </div>
                      <button className="text-xs text-[var(--accent-light)] hover:underline">Edit</button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {(activeSection !== 'appearance' && activeSection !== 'profile') && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard glow className="p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-[var(--border-primary)] flex items-center justify-center mx-auto mb-4">
                  {(() => { const Icon = sections.find(s => s.id === activeSection)?.icon || Settings; return <Icon className="w-6 h-6 text-[var(--text-muted)]" /> })()}
                </div>
                <h3 className="font-display font-bold text-lg mb-1">Coming soon</h3>
                <p className="text-sm text-[var(--text-secondary)]">This section is under development</p>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <div className={cn(
      'w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer',
      enabled ? 'bg-[#1a73e8]' : 'bg-white/[0.1]'
    )}>
      <div className={cn(
        'w-5 h-5 rounded-full bg-white transition-transform',
        enabled && 'translate-x-5'
      )} />
    </div>
  )
}
