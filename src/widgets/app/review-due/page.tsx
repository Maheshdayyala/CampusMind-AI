'use client';

import { useState } from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface ReviewEntry {
  id: string;
  subject: string;
  topic: string;
  note: string;
  imageUrl?: string;
  lastReviewedAt: string;
  reviewCount: number;
  daysSinceReview: number;
}

interface ReviewData {
  daysThreshold: number;
  count: number;
  results: ReviewEntry[];
}

function initials(subject: string): string {
  return (subject || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

function overdueColor(days: number): string {
  return days >= 14 ? '#dc2626' : days >= 7 ? '#ea580c' : '#d97706';
}

export default function ReviewDueWidget() {
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const theme = useTheme();
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const data = getToolOutput<ReviewData>();

  const primary = '#3B82F6';
  const isDark = theme === 'dark';
  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const text = isDark ? '#f1f5f9' : '#0f172a';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? '#334155' : '#e2e8f0';

  if (!isReady) {
    return <div style={{ padding: 24, color: muted }}>Initializing...</div>;
  }
  if (!data) {
    return <div style={{ padding: 24, color: muted }}>Loading...</div>;
  }

  const threshold = data.daysThreshold ?? 3;
  const results = data.results ?? [];

  const handleMarkReviewed = async (id: string) => {
    if (!callTool) return;
    setBusy(id);
    try {
      await callTool('mark_reviewed', { id });
      setReviewed((prev) => ({ ...prev, [id]: true }));
    } catch {
      // swallow - UI stays in overdue state on failure
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      style={{
        background: bg,
        padding: 20,
        borderRadius: 16,
        fontFamily: 'system-ui, sans-serif',
        color: text,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: muted, fontWeight: 600, letterSpacing: 0.3 }}>
          CAMPUSMIND AI DUE FOR REVIEW
        </div>
        <h2 style={{ margin: '4px 0 0 0', fontSize: 20, fontWeight: 700 }}>
          {results.length > 0
            ? `${results.length} topic${results.length === 1 ? '' : 's'} overdue`
            : 'All caught up!'}
          <span style={{ color: muted, fontWeight: 500 }}>
            {' '}
            (not reviewed in {threshold}+ days)
          </span>
        </h2>
      </div>

      {results.length === 0 ? (
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            color: muted,
            background: cardBg,
            borderRadius: 12,
            border: `1px solid ${border}`,
          }}
        >
          Nothing is overdue. Great work staying on top of your studies!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {results.map((entry) => {
            const done = reviewed[entry.id];
            const badgeColor = overdueColor(entry.daysSinceReview ?? 0);
            return (
              <div
                key={entry.id}
                style={{
                  background: cardBg,
                  borderRadius: 12,
                  border: `1px solid ${border}`,
                  overflow: 'hidden',
                  display: 'flex',
                  opacity: done ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 96,
                    minWidth: 96,
                    background: isDark ? '#334155' : '#e2e8f0',
                  }}
                >
                  {entry.imageUrl ? (
                    <img
                      src={entry.imageUrl}
                      alt={entry.subject}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        fontWeight: 700,
                        color: '#fff',
                        background: primary,
                      }}
                    >
                      {initials(entry.subject)}
                    </div>
                  )}
                </div>

                <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: muted, fontWeight: 600 }}>{entry.subject}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{entry.topic}</div>
                    </div>
                    <span
                      style={{
                        background: done ? '#16a34a' : badgeColor,
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 9px',
                        borderRadius: 999,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {done ? 'Reviewed' : `${entry.daysSinceReview ?? 0}d overdue`}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: muted, lineHeight: 1.4 }}>{entry.note}</div>
                  <div style={{ marginTop: 6 }}>
                    <button
                      onClick={() => handleMarkReviewed(entry.id)}
                      disabled={done || busy === entry.id}
                      style={{
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: done ? 'default' : 'pointer',
                        color: '#fff',
                        background: done ? '#16a34a' : primary,
                        opacity: busy === entry.id ? 0.7 : 1,
                      }}
                    >
                      {done ? 'Reviewed' : busy === entry.id ? 'Saving...' : 'Mark reviewed'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
