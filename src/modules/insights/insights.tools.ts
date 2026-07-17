import { ToolDecorator as Tool, z, ExecutionContext, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';

@Injectable({ deps: [DatabaseService, MasteryService] })
export class InsightsTools {
  constructor(
    private db: DatabaseService,
    private mastery: MasteryService,
  ) {}

  @Tool({
    name: 'get_progress_summary',
    description: 'Get a progress analytics summary: confidence trends, study hours, completed sessions, and weak areas.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID'),
      days: z.number().default(14).describe('Number of days to look back (default 14)'),
    }),
  })
  async getProgressSummary(input: { studentId: string; days?: number }, ctx: ExecutionContext) {
    const { studentId, days = 14 } = input;
    const student = this.db.getStudent(studentId);
    if (!student) return { ok: false, message: 'Student not found' };

    const mastery = this.db.getStudentMastery(studentId);
    const courses = this.db.getStudentCourses(studentId);
    const allConcepts = courses.flatMap((c) => this.db.getCourseConcepts(c.id));
    const interactions = this.db.getRecentInteractions(studentId, 100);
    const sessions = this.db.getRecentStudySessions(studentId, days);

    const avgConfidence = mastery.length > 0
      ? mastery.reduce((sum, m) => {
          const ds = this.mastery.computeDaysSinceReview(m.lastReviewed);
          return sum + this.mastery.applyDecay(m.confidenceScore, ds);
        }, 0) / mastery.length
      : 0;

    const weakCount = mastery.filter((m) => {
      const ds = this.mastery.computeDaysSinceReview(m.lastReviewed);
      return this.mastery.applyDecay(m.confidenceScore, ds) < 0.5;
    }).length;

    const completedSessions = sessions.filter((s) => s.completed);
    const totalDuration = completedSessions.reduce((sum, s) => {
      const topics: string[] = JSON.parse(s.topics || '[]');
      return sum + topics.length * 10; // estimate 10 min per topic
    }, 0);

    const conceptMastery = mastery.map((m) => {
      const concept = allConcepts.find((c) => c.id === m.conceptId);
      const ds = this.mastery.computeDaysSinceReview(m.lastReviewed);
      return {
        concept: concept?.name ?? 'Unknown',
        courseCode: concept ? courses.find((c) => c.id === concept?.courseId)?.code : null,
        confidenceScore: Math.round(this.mastery.applyDecay(m.confidenceScore, ds) * 100),
        rawScore: Math.round(m.confidenceScore * 100),
        daysSinceReview: ds,
        timesWrong: m.timesWrong,
      };
    });

    const activityTimeline = interactions.slice(0, 20).map((i) => ({
      date: i.timestamp,
      type: i.type,
      summary: i.summary.substring(0, 100),
    }));

    return {
      ok: true,
      student: student.name,
      periodDays: days,
      overview: {
        averageConfidence: Math.round(avgConfidence * 100),
        weakTopicsCount: weakCount,
        totalConceptsTracked: mastery.length,
        studySessionsCompleted: completedSessions.length,
        estimatedStudyMinutes: totalDuration,
        totalInteractions: interactions.length,
      },
      conceptMastery,
      recentActivity: activityTimeline,
      message: `You've completed ${completedSessions.length} study sessions in the last ${days} days. Average confidence across all topics: ${Math.round(avgConfidence * 100)}%.`,
    };
  }
}
