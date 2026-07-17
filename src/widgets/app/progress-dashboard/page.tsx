'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface ConceptMasteryItem {
  concept: string;
  courseCode: string | null;
  confidenceScore: number;
  rawScore: number;
  daysSinceReview: number;
  timesWrong: number;
}

interface ActivityItem {
  date: string;
  type: string;
  summary: string;
}

interface ProgressDashboardData {
  ok: boolean;
  student: string;
  periodDays: number;
  overview: {
    averageConfidence: number;
    weakTopicsCount: number;
    totalConceptsTracked: number;
    studySessionsCompleted: number;
    estimatedStudyMinutes: number;
    totalInteractions: number;
  };
  conceptMastery: ConceptMasteryItem[];
  recentActivity: ActivityItem[];
}

function confidenceColor(score: number): string {
  return score >= 0.7 ? '#16a34a' : score >= 0.4 ? '#ca8a04' : '#dc2626';
}

function confidenceBg(score: number): string {
  return score >= 0.7 ? '#052e16' : score >= 0.4 ? '#422006' : '#450a0a';
}

function confidenceBgLight(score: number): string {
  return score >= 0.7 ? '#dcfce7' : score >= 0.4 ? '#fef9c3' : '#fee2e2';
}

function barWidth(score: number): string {
  return `${Math.round(score * 100)}%`;
}

function activityIcon(type: string): string {
  switch (type) {
    case 'quiz':
      return 'Q';
    case 'review':
      return 'R';
    case 'study':
      return 'S';
    default:
      return '•';
  }
}

function activityColor(type: string): string {
  switch (type) {
    case 'quiz':
      return '#8b5cf6';
    case 'review':
      return '#3B82F6';
    case 'study':
      return '#16a34a';
    default:
      return '#6b7280';
  }
}

export default function ProgressDashboardWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();

  const data = getToolOutput<ProgressDashboardData>();

  const primary = '#3B82F6';
  const isDark = theme === 'dark';
  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const text = isDark ? '#f1f5f9' : '#0f172a';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? '#334155' : '#e2e8f0';

  const notReady = !isReady;
  const noData = !data;

  const overview = data?.overview;
  const concepts = data?.conceptMastery ?? [];
  const activities = data?.recentActivity ?? [];

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
              CAMPUSMIND · PROGRESS DASHBOARD
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: 20, fontWeight: 700 }}>
              {data?.student ?? 'Student'}
              <span style={{ color: muted, fontWeight: 500 }}>
                {' '}
                · Last {data?.periodDays ?? 0} days
              </span>
            </h2>
          </div>

          {!overview ? (
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
              No progress data available yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Stats cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 10,
                }}
              >
                <StatCard
                  label="Avg Confidence"
                  value={`${Math.round(overview.averageConfidence * 100)}%`}
                  color={confidenceColor(overview.averageConfidence)}
                  cardBg={cardBg}
                  border={border}
                />
                <StatCard
                  label="Weak Topics"
                  value={String(overview.weakTopicsCount)}
                  color="#dc2626"
                  cardBg={cardBg}
                  border={border}
                />
                <StatCard
                  label="Sessions"
                  value={String(overview.studySessionsCompleted)}
                  color={primary}
                  cardBg={cardBg}
                  border={border}
                />
                <StatCard
                  label="Study Min"
                  value={formatMinutes(overview.estimatedStudyMinutes)}
                  color="#16a34a"
                  cardBg={cardBg}
                  border={border}
                />
              </div>

              {/* Concept mastery */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                  Concept Mastery ({overview.totalConceptsTracked})
                </div>
                {concepts.length === 0 ? (
                  <div style={{ fontSize: 13, color: muted }}>No concepts tracked.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {concepts.map((item, idx) => {
                      const cColor = confidenceColor(item.confidenceScore);
                      const cBg = isDark ? confidenceBg(item.confidenceScore) : confidenceBgLight(item.confidenceScore);
                      return (
                        <div
                          key={idx}
                          style={{
                            background: cardBg,
                            borderRadius: 8,
                            border: `1px solid ${border}`,
                            padding: '8px 12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>
                              {item.concept}
                              {item.courseCode && (
                                <span style={{ color: muted, fontWeight: 500, fontSize: 11, marginLeft: 6 }}>
                                  {item.courseCode}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: cColor }}>
                              {Math.round(item.confidenceScore * 100)}%
                            </span>
                          </div>
                          <div
                            style={{
                              height: 6,
                              background: isDark ? '#334155' : '#e2e8f0',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: barWidth(item.confidenceScore),
                                background: cColor,
                                borderRadius: 3,
                                transition: 'width 0.3s',
                              }}
                            />
                          </div>
                          <div style={{ fontSize: 10, color: muted, marginTop: 3 }}>
                            {item.daysSinceReview}d since review · {item.timesWrong}x wrong
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent activity */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                  Recent Activity
                </div>
                {activities.length === 0 ? (
                  <div style={{ fontSize: 13, color: muted }}>No recent activity.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {activities.map((act, idx) => {
                      const aColor = activityColor(act.type);
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            gap: 10,
                            alignItems: 'flex-start',
                            background: cardBg,
                            borderRadius: 8,
                            border: `1px solid ${border}`,
                            padding: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              background: aColor,
                              color: '#fff',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {activityIcon(act.type)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{act.summary}</div>
                            <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>
                              {act.type} · {act.date}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  cardBg,
  border,
}: {
  label: string;
  value: string;
  color: string;
  cardBg: string;
  border: string;
}) {
  return (
    <div
      style={{
        background: cardBg,
        borderRadius: 10,
        border: `1px solid ${border}`,
        padding: '14px 12px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function formatMinutes(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}
