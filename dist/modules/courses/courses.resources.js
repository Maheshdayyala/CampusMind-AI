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
let CoursesResources = class CoursesResources {
    db;
    constructor(db) {
        this.db = db;
    }
    async courseSyllabus(uri, context) {
        const courseId = uri.split('/')[2];
        const course = this.db.getCourse(courseId);
        if (!course) {
            return { type: 'text', text: 'Course not found' };
        }
        const concepts = this.db.getCourseConcepts(courseId);
        const syllabus = `${course.syllabus}\n\n## Concepts\n${concepts.map((c) => `- ${c.name}: ${c.description}`).join('\n')}`;
        return { type: 'text', text: syllabus };
    }
};
__decorate([
    Resource({
        uri: 'course://{courseId}/syllabus',
        name: 'Course Syllabus',
        description: 'Returns the full syllabus for a course in markdown',
        mimeType: 'text/markdown',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoursesResources.prototype, "courseSyllabus", null);
CoursesResources = __decorate([
    Injectable({ deps: [DatabaseService] }),
    __metadata("design:paramtypes", [DatabaseService])
], CoursesResources);
export { CoursesResources };
//# sourceMappingURL=courses.resources.js.map