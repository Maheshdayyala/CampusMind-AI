import { ResourceDecorator as Resource, ExecutionContext, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';

@Injectable({ deps: [DatabaseService] })
export class StudentsResources {
  constructor(private db: DatabaseService) {}

  @Resource({
    uri: 'student://{studentId}/profile',
    name: 'Student Profile',
    description: 'Returns identity and academic profile details for the student',
    mimeType: 'application/json',
  })
  async studentProfile(uri: string, context: ExecutionContext) {
    const studentId = uri.split('/')[2];
    const student = this.db.getStudent(studentId);
    if (!student) {
      return { type: 'text' as const, text: JSON.stringify({ error: 'Student not found' }) };
    }
    const courses = this.db.getStudentCourses(studentId);
    return {
      type: 'text' as const,
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
}
