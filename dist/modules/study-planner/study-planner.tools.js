var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ToolDecorator as Tool, Widget, z, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';
let StudyPlannerTools = class StudyPlannerTools {
    db;
    mastery;
    constructor(db, mastery) {
        this.db = db;
        this.mastery = mastery;
    }
    async getReviewDue(input, ctx) {
        const threshold = input.daysThreshold ?? 3;
        const mastery = this.db.getStudentMastery(input.studentId);
        const courses = this.db.getStudentCourses(input.studentId);
        const allConcepts = courses.flatMap((c) => this.db.getCourseConcepts(c.id));
        const overdue = mastery
            .map((m) => {
            const concept = allConcepts.find((c) => c.id === m.conceptId);
            const daysSince = this.mastery.computeDaysSinceReview(m.lastReviewed);
            const effectiveScore = this.mastery.applyDecay(m.confidenceScore, daysSince);
            return {
                conceptId: m.conceptId,
                conceptName: concept?.name ?? 'Unknown',
                courseCode: concept ? courses.find((c) => c.id === concept?.courseId)?.code : null,
                confidenceScore: effectiveScore,
                rawScore: m.confidenceScore,
                lastReviewedAt: m.lastReviewed,
                daysSinceReview: daysSince,
                timesWrong: m.timesWrong,
            };
        })
            .filter((m) => m.daysSinceReview >= threshold)
            .sort((a, b) => b.daysSinceReview - a.daysSinceReview);
        return {
            daysThreshold: threshold,
            count: overdue.length,
            results: overdue,
        };
    }
    async markReviewed(input, ctx) {
        const { studentId, conceptId } = input;
        const concept = this.db.getConcept(conceptId);
        if (!concept)
            return { ok: false, message: `No concept found with id "${conceptId}".` };
        const masteryRecords = this.db.getStudentMastery(studentId);
        const record = masteryRecords.find((m) => m.conceptId === conceptId);
        const update = this.mastery.handleReviewSession();
        const newScore = record ? this.mastery.clamp(record.confidenceScore + update.confidenceDelta) : 0.6;
        const newWrong = record?.timesWrong ?? 0;
        this.db.upsertMastery(studentId, conceptId, newScore, newWrong);
        this.db.logInteraction(studentId, 'reviewed', `Reviewed concept: ${concept.name}`);
        return {
            ok: true,
            conceptId,
            conceptName: concept.name,
            previousScore: record?.confidenceScore ?? 0.5,
            newScore,
            lastReviewedAt: new Date().toISOString(),
            message: `Marked "${concept.name}" as reviewed. Confidence updated to ${Math.round(newScore * 100)}%.`,
        };
    }
    async demoBackdateTopic(input, ctx) {
        const daysAgo = input.daysAgo ?? 5;
        const concept = this.db.getConcept(input.conceptId);
        if (!concept)
            return { ok: false, message: `No concept found with id "${input.conceptId}".` };
        const masteryRecords = this.db.getStudentMastery(input.studentId);
        const record = masteryRecords.find((m) => m.conceptId === input.conceptId);
        if (!record) {
            this.db.upsertMastery(input.studentId, input.conceptId, 0.5, 0);
        }
        const ms = daysAgo * 24 * 60 * 60 * 1000;
        const backdatedTime = new Date(Date.now() - ms).toISOString();
        this.db.upsertMastery(input.studentId, input.conceptId, record?.confidenceScore ?? 0.5, record?.timesWrong ?? 0);
        this.db.logInteraction(input.studentId, 'demo_backdate', `Backdated concept: ${concept.name} by ${daysAgo} days`);
        return {
            ok: true,
            conceptId: input.conceptId,
            conceptName: concept.name,
            backdatedDays: daysAgo,
            message: `Backdated "${concept.name}" by ${daysAgo} days for testing.`,
        };
    }
    async setStudyGoal(input, ctx) {
        const { studentId, goal, deadline } = input;
        const id = `goal_${Date.now().toString(36)}`;
        this.db.logInteraction(studentId, 'set_goal', `Goal: ${goal} by ${deadline}`);
        return {
            ok: true,
            goalId: id,
            goal,
            deadline,
            message: `Study goal set: "${goal}" by ${deadline}. I'll remind you about this in your daily briefings.`,
        };
    }
    async recordStudySession(input, ctx) {
        const { studentId, topics, durationMinutes } = input;
        const topicsJson = JSON.stringify(topics);
        const id = this.db.logStudySession(studentId, topicsJson, 1);
        this.db.logInteraction(studentId, 'study_session', `Studied ${topics.length} topics for ${durationMinutes} minutes`);
        for (const topic of topics) {
            const concept = this.db.getConcept(topic);
            if (concept) {
                const masteryRecords = this.db.getStudentMastery(studentId);
                const record = masteryRecords.find((m) => m.conceptId === topic);
                if (record) {
                    const update = this.mastery.handleReviewSession();
                    const newScore = this.mastery.clamp(record.confidenceScore + update.confidenceDelta);
                    this.db.upsertMastery(studentId, topic, newScore, record.timesWrong);
                }
            }
        }
        return {
            ok: true,
            sessionId: id,
            topics,
            durationMinutes,
            message: `Logged ${durationMinutes}-minute study session covering ${topics.length} topics. Keep up the momentum!`,
        };
    }
    async getDailyBriefing(input, ctx) {
        const { studentId } = input;
        const student = this.db.getStudent(studentId);
        if (!student)
            return { ok: false, message: 'Student not found' };
        const courses = this.db.getStudentCourses(studentId);
        const mastery = this.db.getStudentMastery(studentId);
        const allConcepts = courses.flatMap((c) => this.db.getCourseConcepts(c.id));
        const assignments = this.db.getUpcomingAssignments(studentId);
        const dueSoon = this.db.getAssignmentsDueSoon(studentId, 7);
        const recentSessions = this.db.getRecentStudySessions(studentId, 14);
        const completedSessions = recentSessions.filter((s) => s.completed);
        const weakTopics = mastery
            .filter((m) => {
            const days = this.mastery.computeDaysSinceReview(m.lastReviewed);
            const effective = this.mastery.applyDecay(m.confidenceScore, days);
            return effective < 0.5;
        })
            .map((m) => {
            const concept = allConcepts.find((c) => c.id === m.conceptId);
            const days = this.mastery.computeDaysSinceReview(m.lastReviewed);
            return {
                conceptId: m.conceptId,
                concept: concept?.name ?? 'Unknown',
                courseCode: concept ? courses.find((c) => c.id === concept?.courseId)?.code : null,
                confidenceScore: this.mastery.applyDecay(m.confidenceScore, days),
                daysSinceReview: days,
            };
        })
            .sort((a, b) => a.confidenceScore - b.confidenceScore);
        const now = Date.now();
        const urgentDeadlines = dueSoon.filter((a) => {
            const dueMs = new Date(a.dueDate).getTime();
            const days = (dueMs - now) / (24 * 60 * 60 * 1000);
            return days <= 3;
        });
        const atRisk = weakTopics.filter((w) => {
            const weakCourseAssignments = assignments.filter((a) => {
                const course = courses.find((c) => c.id === a.courseId);
                const conceptCourse = allConcepts.find((c) => c.id === w.conceptId);
                return course && conceptCourse && course.id === conceptCourse.courseId;
            });
            return weakCourseAssignments.length > 0;
        });
        this.db.logInteraction(studentId, 'daily_briefing', 'Daily briefing delivered');
        return {
            ok: true,
            student: student.name,
            date: new Date().toISOString().split('T')[0],
            overview: {
                enrolledCourses: courses.length,
                weakTopicsCount: weakTopics.length,
                assignmentsDueSoon: dueSoon.length,
                studyStreak: completedSessions.length,
                recentStudyDays: recentSessions.length,
            },
            deadlines: dueSoon.map((a) => {
                const course = courses.find((c) => c.id === a.courseId);
                const daysUntil = Math.floor((new Date(a.dueDate).getTime() - now) / (24 * 60 * 60 * 1000));
                return {
                    id: a.id,
                    title: a.title,
                    course: course?.title ?? 'Unknown',
                    dueDate: a.dueDate,
                    daysUntil,
                    urgency: daysUntil <= 1 ? 'CRITICAL' : daysUntil <= 3 ? 'URGENT' : 'upcoming',
                };
            }),
            reviewRecommended: weakTopics.slice(0, 5).map((w) => ({
                concept: w.concept,
                course: w.courseCode,
                confidence: Math.round(w.confidenceScore * 100),
                daysSinceReview: w.daysSinceReview,
            })),
            urgentAttention: atRisk.slice(0, 3).map((w) => ({
                concept: w.concept,
                course: w.courseCode,
                reason: 'Weak concept with upcoming deadline pressure',
            })),
            message: `Good morning, ${student.name}! You have ${dueSoon.length} upcoming deadlines and ${weakTopics.length} topics that need review. I've highlighted the most urgent items above.`,
        };
    }
    async suggestReviewPlan(input, ctx) {
        const max = input.maxTopics ?? 5;
        const courses = this.db.getStudentCourses(input.studentId);
        const mastery = this.db.getStudentMastery(input.studentId);
        const allConcepts = courses.flatMap((c) => this.db.getCourseConcepts(c.id));
        const priorities = mastery
            .map((m) => {
            const concept = allConcepts.find((c) => c.id === m.conceptId);
            const daysSince = this.mastery.computeDaysSinceReview(m.lastReviewed);
            const effectiveScore = this.mastery.applyDecay(m.confidenceScore, daysSince);
            const priorityScore = (1 - effectiveScore) * 10 + Math.log(daysSince + 1) * 2 + m.timesWrong;
            return {
                conceptId: m.conceptId,
                concept: concept?.name ?? 'Unknown',
                courseCode: concept ? courses.find((c) => c.id === concept?.courseId)?.code : null,
                confidenceScore: effectiveScore,
                daysSinceReview: daysSince,
                timesWrong: m.timesWrong,
                priorityScore: Math.round(priorityScore * 10) / 10,
            };
        })
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .slice(0, max);
        return {
            ok: true,
            planTitle: 'Spaced Repetition Review Plan',
            totalRecommended: priorities.length,
            plan: priorities.map((p, i) => ({
                day: i + 1,
                concept: p.concept,
                course: p.courseCode,
                currentConfidence: Math.round(p.confidenceScore * 100),
                recommendedDuration: p.confidenceScore < 0.3 ? 20 : p.confidenceScore < 0.6 ? 15 : 10,
                reason: p.daysSinceReview > 7
                    ? `Not reviewed in ${p.daysSinceReview} days — confidence may have decayed`
                    : p.timesWrong > 2
                        ? `Missed ${p.timesWrong} times — needs reinforcement`
                        : 'Routine spaced repetition',
            })),
            message: `Here's your review plan. Start with "${priorities[0]?.concept}" — it needs the most attention.`,
        };
    }
    async flagAtRiskTopics(input, ctx) {
        const { studentId } = input;
        const courses = this.db.getStudentCourses(studentId);
        const mastery = this.db.getStudentMastery(studentId);
        const allConcepts = courses.flatMap((c) => this.db.getCourseConcepts(c.id));
        const assignments = this.db.getUpcomingAssignments(studentId);
        const riskFlags = mastery
            .map((m) => {
            const concept = allConcepts.find((c) => c.id === m.conceptId);
            const daysSince = this.mastery.computeDaysSinceReview(m.lastReviewed);
            const effectiveScore = this.mastery.applyDecay(m.confidenceScore, daysSince);
            const course = concept ? courses.find((c) => c.id === concept.courseId) : undefined;
            const courseAssignments = course
                ? assignments.filter((a) => a.courseId === course.id)
                : [];
            const nearestDue = courseAssignments.length > 0
                ? courseAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
                : null;
            const daysToDeadline = nearestDue
                ? Math.floor((new Date(nearestDue.dueDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
                : null;
            let riskScore = 0;
            if (effectiveScore < 0.3)
                riskScore += 5;
            else if (effectiveScore < 0.5)
                riskScore += 3;
            if (daysSince > 14)
                riskScore += 4;
            else if (daysSince > 7)
                riskScore += 2;
            if (m.timesWrong > 3)
                riskScore += 3;
            else if (m.timesWrong > 1)
                riskScore += 1;
            if (daysToDeadline !== null && daysToDeadline <= 7)
                riskScore += daysToDeadline <= 3 ? 5 : 3;
            if (daysToDeadline !== null && daysToDeadline <= 0)
                riskScore += 10;
            return {
                conceptId: m.conceptId,
                concept: concept?.name ?? 'Unknown',
                course: course?.title ?? 'Unknown',
                confidenceScore: effectiveScore,
                daysSinceReview: daysSince,
                timesWrong: m.timesWrong,
                nearestDeadline: nearestDue
                    ? { title: nearestDue.title, daysToDeadline, dueDate: nearestDue.dueDate }
                    : null,
                riskScore,
                riskLevel: riskScore >= 15 ? 'critical' : riskScore >= 8 ? 'high' : riskScore >= 4 ? 'medium' : 'low',
            };
        })
            .filter((f) => f.riskLevel !== 'low')
            .sort((a, b) => b.riskScore - a.riskScore);
        return {
            ok: true,
            count: riskFlags.length,
            atRiskTopics: riskFlags,
            summary: {
                critical: riskFlags.filter((f) => f.riskLevel === 'critical').length,
                high: riskFlags.filter((f) => f.riskLevel === 'high').length,
                medium: riskFlags.filter((f) => f.riskLevel === 'medium').length,
            },
            message: riskFlags.length > 0
                ? `Found ${riskFlags.length} at-risk topics. ${riskFlags.filter((f) => f.riskLevel === 'critical').length} need immediate attention.`
                : 'No critical at-risk topics right now.',
        };
    }
};
__decorate([
    Tool({
        name: 'get_review_due',
        description: 'Proactively find concepts that have not been reviewed in at least N days (spaced-repetition style). Returns overdue concepts with effective confidence and days since review.',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID'),
            daysThreshold: z.number().default(3).describe('Minimum days since last review to count as overdue (default 3)'),
        }),
    }),
    Widget('review-due'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudyPlannerTools.prototype, "getReviewDue", null);
__decorate([
    Tool({
        name: 'mark_reviewed',
        description: 'Mark a concept (by id) as reviewed right now. Resets its review clock, applies a confidence boost, and increments awareness.',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID'),
            conceptId: z.string().describe('The concept ID to mark as reviewed'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudyPlannerTools.prototype, "markReviewed", null);
__decorate([
    Tool({
        name: 'demo_backdate_topic',
        description: 'DEMO/TESTING ONLY: artificially age a concept\'s last-reviewed timestamp by N days so get_review_due can be tested without waiting real time.',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID'),
            conceptId: z.string().describe('The concept ID to backdate'),
            daysAgo: z.number().default(5).describe('How many days to age the last-reviewed timestamp (default 5)'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudyPlannerTools.prototype, "demoBackdateTopic", null);
__decorate([
    Tool({
        name: 'set_study_goal',
        description: 'Set a study goal for a student with a deadline. Goals appear in daily briefings and help the planner prioritize.',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID'),
            goal: z.string().describe('The study goal description'),
            deadline: z.string().describe('Deadline for the goal (ISO date string, e.g. 2026-08-15)'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudyPlannerTools.prototype, "setStudyGoal", null);
__decorate([
    Tool({
        name: 'record_study_session',
        description: 'Record a completed study session. Stores which topics were studied and duration, updates study streak analytics.',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID'),
            topics: z.array(z.string()).describe('Array of topic names or concept IDs studied'),
            durationMinutes: z.number().describe('Duration of the study session in minutes'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudyPlannerTools.prototype, "recordStudySession", null);
__decorate([
    Tool({
        name: 'get_daily_briefing',
        description: 'Build a daily academic summary: what is due soon, what should be reviewed today, trending weak topics, and urgent items. Call this at session start for a proactive briefing.',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudyPlannerTools.prototype, "getDailyBriefing", null);
__decorate([
    Tool({
        name: 'suggest_review_plan',
        description: 'Generate a spaced-repetition review plan from mastery data and recency. Prioritizes weak and long-unreviewed concepts.',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID'),
            maxTopics: z.number().default(5).describe('Maximum number of topics to suggest (default 5)'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudyPlannerTools.prototype, "suggestReviewPlan", null);
__decorate([
    Tool({
        name: 'flag_at_risk_topics',
        description: 'Surface concepts where low confidence intersects with deadline pressure or prolonged neglect. Prioritizes topics that need urgent intervention.',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudyPlannerTools.prototype, "flagAtRiskTopics", null);
StudyPlannerTools = __decorate([
    Injectable({ deps: [DatabaseService, MasteryService] }),
    __metadata("design:paramtypes", [DatabaseService,
        MasteryService])
], StudyPlannerTools);
export { StudyPlannerTools };
//# sourceMappingURL=study-planner.tools.js.map