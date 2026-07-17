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
let StudentsResources = class StudentsResources {
    db;
    constructor(db) {
        this.db = db;
    }
    async studentProfile(uri, context) {
        const studentId = uri.split('/')[2];
        const student = this.db.getStudent(studentId);
        if (!student) {
            return { type: 'text', text: JSON.stringify({ error: 'Student not found' }) };
        }
        const courses = this.db.getStudentCourses(studentId);
        return {
            type: 'text',
            text: JSON.stringify({
                id: student.id,
                name: student.name,
                program: student.program,
                year: student.year,
                goals: student.goals,
                enrolledCourses: courses.map((c) => ({ id: c.id, code: c.code, title: c.title, term: c.term })),
            }, null, 2),
        };
    }
};
__decorate([
    Resource({
        uri: 'student://{studentId}/profile',
        name: 'Student Profile',
        description: 'Returns identity and academic profile details for the student',
        mimeType: 'application/json',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsResources.prototype, "studentProfile", null);
StudentsResources = __decorate([
    Injectable({ deps: [DatabaseService] }),
    __metadata("design:paramtypes", [DatabaseService])
], StudentsResources);
export { StudentsResources };
//# sourceMappingURL=students.resources.js.map