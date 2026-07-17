import { ResourceDecorator as Resource, ExecutionContext, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';

@Injectable({ deps: [DatabaseService] })
export class CoursesResources {
  constructor(private db: DatabaseService) {}

  @Resource({
    uri: 'course://{courseId}/syllabus',
    name: 'Course Syllabus',
    description: 'Returns the full syllabus for a course in markdown',
    mimeType: 'text/markdown',
  })
  async courseSyllabus(uri: string, context: ExecutionContext) {
    const courseId = uri.split('/')[2];
    const course = this.db.getCourse(courseId);
    if (!course) {
      return { type: 'text' as const, text: 'Course not found' };
    }
    const concepts = this.db.getCourseConcepts(courseId);
    const syllabus = `${course.syllabus}\n\n## Concepts\n${concepts.map((c) => `- ${c.name}: ${c.description}`).join('\n')}`;
    return { type: 'text' as const, text: syllabus };
  }
}
