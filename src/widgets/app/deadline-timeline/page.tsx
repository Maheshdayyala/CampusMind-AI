'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface TimelineItem {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  daysUntil: number;
  weight: number;
  urgency: string;
}

interface DeadlineTimelineData {
  studentId: string;
  count: number;
  deadlines: TimelineItem[];
}

function urgencyColor(urgency: string): string {
  switch (urgency) {
    case 'critical':
      return '#dc2626';
    case 'urgent':
      return '#ea580c';
    case 'upcoming':
      return '#ca8a04';
    default:
      return '#6b7280';
  }
}

function urgencyBg(urgency: string): string {
  switch (urgency) {
    case 'critical':
      return '#450a0a';
    case 'urgent':
      return '#431407';
    case 'upcoming':
      return '#422006';
    default:
      return '#1f2937';
  }
}

function urgencyBgLight(urgency: string): string {
  switch (urgency) {
    case 'critical':
      return '#fee2e2';
    case 'urgent':
      return '#ffedd5';
    case 'upcoming':
      return '#fef9c3';
    default:
      return '#f3f4f6';
  }
}

export default function DeadlineTimelineWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();

  const data = getToolOutput<DeadlineTimelineData>();

  const primary = '#3B82F6';
  const isDark = theme === 'dark';
  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const text = isDark ? '#f1f5f9' : '#0f172a';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? '#334155' : '#e2e8f0';

  const notReady = !isReady;
  const noData = !data;

  const deadlines = data?.deadlines ?? [];
  const connectorColor = isDark ? '#334155' : '#e2e8f0';

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
              CAMPUSMIND · DEADLINE TIMELINE
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: 20, fontWeight: 700 }}>
              {deadlines.length > 0
                ? `${deadlines.length} deadline${deadlines.length === 1 ? '' : 's'} ahead`
                : 'No upcoming deadlines'}
            </h2>
          </div>

          {deadlines.length === 0 ? (
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
              You have no pending deadlines. Enjoy the break!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
              {deadlines.map((item, idx) => {
                const uColor = urgencyColor(item.urgency);
                const uBg = isDark ? urgencyBg(item.urgency) : urgencyBgLight(item.urgency);
                const isLast = idx === deadlines.length - 1;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: 12,
                      position: 'relative',
                      paddingBottom: isLast ? 0 : 16,
                    }}
                  >
                    {/* Timeline column */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: 20,
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: uColor,
                          border: `2px solid ${uColor}`,
                          flexShrink: 0,
                          marginTop: 4,
                        }}
                      />
                      {!isLast && (
                        <div
                          style={{
                            width: 2,
                            flex: 1,
                            background: connectorColor,
                            minHeight: 16,
                          }}
                        />
                      )}
                    </div>

                    {/* Content card */}
                    <div
                      style={{
                        flex: 1,
                        background: uBg,
                        borderRadius: 10,
                        border: `1px solid ${border}`,
                        padding: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: muted, fontWeight: 600 }}>{item.course}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginTop: 1 }}>{item.title}</div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              background: uColor,
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '4px 9px',
                              borderRadius: 999,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.daysUntil <= 0
                              ? 'Overdue'
                              : `${item.daysUntil}d`}
                          </span>
                          <span
                            style={{
                              background: isDark ? '#1e293b' : '#e2e8f0',
                              color: muted,
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '3px 7px',
                              borderRadius: 6,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.weight}%
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>
                        Due: {item.dueDate}
                      </div>
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
