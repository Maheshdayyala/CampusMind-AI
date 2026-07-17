var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ToolDecorator as Tool, z, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
let CoursesTools = class CoursesTools {
    db;
    constructor(db) {
        this.db = db;
    }
    async listCourses(input, ctx) {
        const courses = this.db.getStudentCourses(input.studentId);
        return {
            count: courses.length,
            courses: courses.map((c) => ({
                id: c.id,
                code: c.code,
                title: c.title,
                term: c.term,
            })),
        };
    }
    async getConcept(input, ctx) {
        const concept = this.db.getConcept(input.conceptId);
        if (!concept) {
            return { ok: false, message: `Concept "${input.conceptId}" not found` };
        }
        const course = this.db.getCourse(concept.courseId);
        const mastery = this.db.getStudentMastery(input.studentId);
        const record = mastery.find((m) => m.conceptId === input.conceptId);
        return {
            ok: true,
            concept: {
                id: concept.id,
                name: concept.name,
                description: concept.description,
                course: course ? { id: course.id, code: course.code, title: course.title } : null,
            },
            mastery: record ? {
                confidenceScore: record.confidenceScore,
                lastReviewed: record.lastReviewed,
                timesWrong: record.timesWrong,
            } : { confidenceScore: 0.5, lastReviewed: null, timesWrong: 0 },
        };
    }
};
__decorate([
    Tool({
        name: 'list_courses',
        description: 'List all courses a student is enrolled in with basic info',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesTools.prototype, "listCourses", null);
__decorate([
    Tool({
        name: 'get_concept',
        description: 'Get details about a specific concept including current mastery for a student',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID'),
            conceptId: z.string().describe('The concept ID (e.g. k1, k2, k3...)'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CoursesTools.prototype, "getConcept", null);
CoursesTools = __decorate([
    Injectable({ deps: [DatabaseService] }),
    __metadata("design:paramtypes", [DatabaseService])
], CoursesTools);
export { CoursesTools };
//# sourceMappingURL=courses.tools.js.map