'use client';

import { useState } from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface ReviewEntry {
  conceptId: string;
  conceptName: string;
  courseCode: string | null;
  confidenceScore: number;
  rawScore: number;
  lastReviewedAt: string;
  daysSinceReview: number;
  timesWrong: number;
}

interface ReviewData {
  studentId: string;
  daysThreshold: number;
  count: number;
  results: ReviewEntry[];
}

function overdueColor(days: number): string {
  return days >= 14 ? '#dc2626' : days >= 7 ? '#ea580c' : '#d97706';
}

function confidenceColor(score: number): string {
  return score >= 0.7 ? '#16a34a' : score >= 0.4 ? '#ca8a04' : '#dc2626';
}

export default function ReviewDueWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput, callTool } = useWidgetSDK();
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const data = getToolOutput<ReviewData>();

  const primary = '#3B82F6';
  const isDark = theme === 'dark';
  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const text = isDark ? '#f1f5f9' : '#0f172a';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? '#334155' : '#e2e8f0';

  const notReady = !isReady;
  const noData = !data;

  const threshold = data?.daysThreshold ?? 3;
  const studentId = data?.studentId ?? '';
  const results = data?.results ?? [];

  const handleMarkReviewed = async (conceptId: string) => {
    if (!callTool) return;
    setBusy(conceptId);
    try {
      await callTool('mark_reviewed', { studentId, conceptId });
      setReviewed((prev) => ({ ...prev, [conceptId]: true }));
    } catch {
      // keep overdue state on failure
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
      {notReady ? (
        <div style={{ padding: 4, color: muted }}>Initializing…</div>
      ) : noData ? (
        <div style={{ padding: 4, color: muted }}>Loading…</div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: muted, fontWeight: 600, letterSpacing: 0.3 }}>
              CAMPUSMIND · DUE FOR REVIEW
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
                const done = reviewed[entry.conceptId];
                const days = entry.daysSinceReview ?? 0;
                const badgeColor = overdueColor(days);
                const confPct = Math.round((entry.confidenceScore ?? 0) * 100);
                return (
                  <div
                    key={entry.conceptId}
                    style={{
                      background: cardBg,
                      borderRadius: 12,
                      border: `1px solid ${border}`,
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      opacity: done ? 0.6 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        {entry.courseCode ? (
                          <div style={{ fontSize: 11, color: muted, fontWeight: 600 }}>{entry.courseCode}</div>
                        ) : null}
                        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{entry.conceptName}</div>
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
                        {done ? 'reviewed ✓' : `${days}d overdue`}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: muted, flexWrap: 'wrap' }}>
                      <span>
                        Confidence:{' '}
                        <span style={{ color: confidenceColor(entry.confidenceScore ?? 0), fontWeight: 700 }}>
                          {confPct}%
                        </span>
                      </span>
                      <span>{entry.timesWrong ?? 0}x wrong</span>
                    </div>

                    <div>
                      <button
                        onClick={() => handleMarkReviewed(entry.conceptId)}
                        disabled={done || busy === entry.conceptId}
                        style={{
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: done ? 'default' : 'pointer',
                          color: '#fff',
                          background: done ? '#16a34a' : primary,
                          opacity: busy === entry.conceptId ? 0.7 : 1,
                        }}
                      >
                        {done ? 'Reviewed' : busy === entry.conceptId ? 'Saving…' : 'Mark reviewed'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
