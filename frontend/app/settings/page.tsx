'use client'

import { useTheme } from '@/lib/theme'
import { useAuth } from '@/lib/auth'
import { Sun, Moon, Monitor, User, LogOut } from 'lucide-react'
import { FadeUp } from '@/lib/animations'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { student, logout } = useAuth()

  return (
    <div>
      <FadeUp>
      <h1 className="font-display text-3xl text-text mb-8">Settings</h1>

      <div className="max-w-lg space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-text mb-3">Appearance</h2>
          <div className="flex gap-2">
            {[
              { id: 'light' as const, icon: Sun, label: 'Light' },
              { id: 'dark' as const, icon: Moon, label: 'Dark' },
            ].map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={cn('flex items-center gap-2 px-4 py-2.5 rounded-md text-sm border transition-colors',
                  theme === t.id ? 'border-accent bg-accent/5 text-accent' : 'border-border text-muted hover:text-text')}>
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-text mb-3">Account</h2>
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center text-sm font-medium text-inverse">
                {student?.name?.[0] || '?'}
              </div>
              <div>
                <div className="text-sm font-medium text-text">{student?.name || 'Student'}</div>
                <div className="text-xs text-muted">{student?.program || '—'}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Email', value: student?.id || '—' },
                { label: 'Program', value: student?.program || '—' },
                { label: 'Year', value: `Year ${student?.year || '—'}` },
              ].map(f => (
                <div key={f.label} className="flex items-center justify-between py-1.5">
                  <span className="text-muted">{f.label}</span>
                  <span className="text-text">{f.value}</span>
                </div>
              ))}
            </div>
            <button onClick={logout} className="btn btn-ghost btn-sm text-error mt-4 w-full">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </section>
      </div>
      </FadeUp>
    </div>
  )
}
