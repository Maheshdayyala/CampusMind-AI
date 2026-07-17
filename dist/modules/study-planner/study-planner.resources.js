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
let StudyPlannerResources = class StudyPlannerResources {
    db;
    constructor(db) {
        this.db = db;
    }
    async upcomingDeadlines(uri, context) {
        const studentId = uri.split('/')[2];
        const student = this.db.getStudent(studentId);
        if (!student) {
            return { type: 'text', text: JSON.stringify({ error: 'Student not found' }) };
        }
        const assignments = this.db.getUpcomingAssignments(studentId);
        const courses = this.db.getStudentCourses(studentId);
        const now = Date.now();
        const enriched = assignments.map((a) => {
            const course = courses.find((c) => c.id === a.courseId);
            const dueMs = new Date(a.dueDate).getTime();
            const daysUntil = Math.floor((dueMs - now) / (24 * 60 * 60 * 1000));
            return {
                id: a.id,
                title: a.title,
                course: course ? { id: course.id, code: course.code, title: course.title } : null,
                dueDate: a.dueDate,
                daysUntil,
                weight: a.weight,
                urgency: daysUntil <= 1 ? 'critical' : daysUntil <= 3 ? 'high' : daysUntil <= 7 ? 'medium' : 'low',
            };
        });
        return {
            type: 'text',
            text: JSON.stringify({ studentId, count: enriched.length, deadlines: enriched }, null, 2),
        };
    }
};
__decorate([
    Resource({
        uri: 'student://{studentId}/upcoming-deadlines',
        name: 'Upcoming Deadlines',
        description: 'Near-term deadlines sorted by due date, with course context',
        mimeType: 'application/json',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudyPlannerResources.prototype, "upcomingDeadlines", null);
StudyPlannerResources = __decorate([
    Injectable({ deps: [DatabaseService] }),
    __metadata("design:paramtypes", [DatabaseService])
], StudyPlannerResources);
export { StudyPlannerResources };
//# sourceMappingURL=study-planner.resources.js.map