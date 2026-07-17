var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ToolDecorator as Tool, Widget, UseGuards as UseGuards, z, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';
import { JwtGuard } from '../../common/guards/jwt.guard.js';
let InsightsTools = class InsightsTools {
    db;
    mastery;
    constructor(db, mastery) {
        this.db = db;
        this.mastery = mastery;
    }
    async getProgressSummary(input, ctx) {
        const { studentId, days = 14 } = input;
        const student = this.db.getStudent(studentId);
        if (!student)
            return { ok: false, message: 'Student not found' };
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
            const topics = JSON.parse(s.topics || '[]');
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
};
__decorate([
    Tool({
        name: 'get_progress_summary',
        description: 'Get a progress analytics summary: confidence trends, study hours, completed sessions, and weak areas.',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID'),
            days: z.number().default(14).describe('Number of days to look back (default 14)'),
        }),
    }),
    UseGuards(JwtGuard),
    Widget('progress-dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InsightsTools.prototype, "getProgressSummary", null);
InsightsTools = __decorate([
    Injectable({ deps: [DatabaseService, MasteryService] }),
    __metadata("design:paramtypes", [DatabaseService,
        MasteryService])
], InsightsTools);
export { InsightsTools };
//# sourceMappingURL=insights.tools.js.map