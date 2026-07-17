'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface RecallEntry {
  id: string;
  subject: string;
  topic: string;
  note: string;
  imageUrl?: string;
  loggedAt: string;
  reviewCount: number;
}

interface RecallData {
  query: string;
  count: number;
  results: RecallEntry[];
}

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function initials(subject: string): string {
  return (subject || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

export default function RecallListWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<RecallData>();

  const primary = '#3B82F6';
  const isDark = theme === 'dark';
  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const text = isDark ? '#f1f5f9' : '#0f172a';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? '#334155' : '#e2e8f0';

  if (!isReady) {
    return <div style={{ padding: 24, color: muted }}>Initializing…</div>;
  }
  if (!data) {
    return <div style={{ padding: 24, color: muted }}>Loading…</div>;
  }

  const query = data.query ?? '';
  const results = data.results ?? [];

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
          CAMPUSMIND · RECALL
        </div>
        <h2 style={{ margin: '4px 0 0 0', fontSize: 20, fontWeight: 700 }}>
          {results.length > 0
            ? `Found ${results.length} match${results.length === 1 ? '' : 'es'}`
            : 'No matches found'}
          {query ? (
            <span style={{ color: muted, fontWeight: 500 }}> for “{query}”</span>
          ) : null}
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
          Nothing logged yet that matches this. Try logging a topic first.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 14,
          }}
        >
          {results.map((entry) => (
            <div
              key={entry.id}
              style={{
                background: cardBg,
                borderRadius: 12,
                border: `1px solid ${border}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  background: isDark ? '#334155' : '#e2e8f0',
                }}
              >
                {entry.imageUrl ? (
                  <img
                    src={entry.imageUrl}
                    alt={entry.subject}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      fontWeight: 700,
                      color: '#fff',
                      background: primary,
                    }}
                  >
                    {initials(entry.subject)}
                  </div>
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: primary,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 999,
                  }}
                >
                  {entry.subject}
                </span>
              </div>
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{entry.topic}</div>
                <div style={{ fontSize: 13, color: muted, lineHeight: 1.45 }}>{entry.note}</div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: muted,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Logged {formatWhen(entry.loggedAt)}</span>
                  <span>{entry.reviewCount ?? 0} reviews</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
