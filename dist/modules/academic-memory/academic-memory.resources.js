var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ResourceDecorator as Resource, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';
let AcademicMemoryResources = class AcademicMemoryResources {
    db;
    mastery;
    constructor(db, mastery) {
        this.db = db;
        this.mastery = mastery;
    }
    async academicMemory(uri, context) {
        const studentId = uri.split('/')[2];
        const student = this.db.getStudent(studentId);
        if (!student) {
            return { type: 'text', text: JSON.stringify({ error: 'Student not found' }) };
        }
        const courses = this.db.getStudentCourses(studentId);
        const mastery = this.db.getStudentMastery(studentId);
        const allConcepts = courses.flatMap((c) => this.db.getCourseConcepts(c.id));
        const enrichedMastery = mastery.map((m) => {
            const concept = allConcepts.find((c) => c.id === m.conceptId);
            const daysSinceReview = this.mastery.computeDaysSinceReview(m.lastReviewed);
            return {
                conceptId: m.conceptId,
                concept: concept?.name ?? 'Unknown',
                courseCode: concept ? courses.find((c) => c.id === concept?.courseId)?.code : null,
                confidenceScore: this.mastery.applyDecay(m.confidenceScore, daysSinceReview),
                rawScore: m.confidenceScore,
                timesWrong: m.timesWrong,
                lastReviewed: m.lastReviewed,
                daysSinceReview,
            };
        });
        const recentInteractions = this.db.getRecentInteractions(studentId, 10);
        const recentStruggles = recentInteractions
            .filter((i) => i.type === 'confused_question' || i.type === 'incorrect_quiz')
            .map((i) => ({ topic: i.summary, source: i.type, timestamp: i.timestamp }));
        const recentSessions = this.db.getRecentStudySessions(studentId, 14);
        const completedSessions = recentSessions.filter((s) => s.completed);
        const studyStreak = completedSessions.length;
        return {
            type: 'text',
            text: JSON.stringify({
                student: { id: student.id, name: student.name, program: student.program, year: student.year },
                enrolledCourses: courses.map((c) => ({ courseId: c.id, code: c.code, title: c.title })),
                mastery: enrichedMastery,
                recentStruggles,
                studyStreak,
            }, null, 2),
        };
    }
    async weakTopics(uri, context) {
        const studentId = uri.split('/')[2];
        const student = this.db.getStudent(studentId);
        if (!student) {
            return { type: 'text', text: JSON.stringify({ error: 'Student not found' }) };
        }
        const courses = this.db.getStudentCourses(studentId);
        const mastery = this.db.getStudentMastery(studentId);
        const allConcepts = courses.flatMap((c) => this.db.getCourseConcepts(c.id));
        const weak = mastery
            .map((m) => {
            const concept = allConcepts.find((c) => c.id === m.conceptId);
            const daysSinceReview = this.mastery.computeDaysSinceReview(m.lastReviewed);
            const effectiveScore = this.mastery.applyDecay(m.confidenceScore, daysSinceReview);
            const urgencyScore = (1 - effectiveScore) * 10 + m.timesWrong * 2 + Math.min(daysSinceReview / 7, 5);
            return {
                conceptId: m.conceptId,
                concept: concept?.name ?? 'Unknown',
                courseCode: concept ? courses.find((c) => c.id === concept?.courseId)?.code : null,
                confidenceScore: effectiveScore,
                timesWrong: m.timesWrong,
                daysSinceReview,
                urgencyScore: Math.round(urgencyScore * 10) / 10,
            };
        })
            .filter((w) => w.confidenceScore < 0.6)
            .sort((a, b) => b.urgencyScore - a.urgencyScore);
        return {
            type: 'text',
            text: JSON.stringify({ studentId, count: weak.length, weakTopics: weak }, null, 2),
        };
    }
};
__decorate([
    Resource({
        uri: 'student://{studentId}/memory',
        name: 'Academic Memory Graph',
        description: 'Compact memory snapshot: enrolled courses, concept mastery, recent struggles, and study streak. Load this first when starting a session.',
        mimeType: 'application/json',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicMemoryResources.prototype, "academicMemory", null);
__decorate([
    Resource({
        uri: 'student://{studentId}/weak-topics',
        name: 'Weak Topics',
        description: 'Low-confidence concepts sorted by urgency, most in need of review first',
        mimeType: 'application/json',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicMemoryResources.prototype, "weakTopics", null);
AcademicMemoryResources = __decorate([
    Injectable({ deps: [DatabaseService, MasteryService] }),
    __metadata("design:paramtypes", [DatabaseService,
        MasteryService])
], AcademicMemoryResources);
export { AcademicMemoryResources };
//# sourceMappingURL=academic-memory.resources.js.map