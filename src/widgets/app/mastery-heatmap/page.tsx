'use client';

import { useState } from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface HeatmapCell {
  conceptId: string;
  concept: string;
  courseCode: string;
  confidenceScore: number;
  daysSinceReview: number;
  timesWrong: number;
}

interface CourseGroup {
  code: string;
  title: string;
  concepts: HeatmapCell[];
}

interface MasteryHeatmapData {
  studentId: string;
  courses: CourseGroup[];
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

export default function MasteryHeatmapWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();

  const data = getToolOutput<MasteryHeatmapData>();

  const primary = '#3B82F6';
  const isDark = theme === 'dark';
  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const text = isDark ? '#f1f5f9' : '#0f172a';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const border = isDark ? '#334155' : '#e2e8f0';

  const notReady = !isReady;
  const noData = !data;

  const courses = data?.courses ?? [];
  const totalConcepts = courses.reduce((sum, c) => sum + c.concepts.length, 0);

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
              CAMPUSMIND · MASTERY HEATMAP
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: 20, fontWeight: 700 }}>
              {totalConcepts > 0
                ? `${totalConcepts} topic${totalConcepts === 1 ? '' : 's'} tracked`
                : 'No topics tracked yet'}
            </h2>
          </div>

          {courses.length === 0 ? (
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
              No concept data available yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {courses.map((course) => (
                <div key={course.code}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: text,
                      marginBottom: 8,
                      paddingBottom: 4,
                      borderBottom: `1px solid ${border}`,
                    }}
                  >
                    {course.code}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: 8,
                    }}
                  >
                    {course.concepts.map((cell) => {
                      const cColor = confidenceColor(cell.confidenceScore);
                      const cBg = isDark ? confidenceBg(cell.confidenceScore) : confidenceBgLight(cell.confidenceScore);
                      return (
                        <div
                          key={cell.conceptId}
                          style={{
                            background: cBg,
                            border: `1px solid ${border}`,
                            borderRadius: 10,
                            padding: 12,
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{cell.concept}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, color: muted }}>
                            <span>
                              Confidence:{' '}
                              <span style={{ color: cColor, fontWeight: 700 }}>
                                {Math.round(cell.confidenceScore * 100)}%
                              </span>
                            </span>
                            <span>{cell.daysSinceReview}d since review</span>
                            <span>{cell.timesWrong}x wrong</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
