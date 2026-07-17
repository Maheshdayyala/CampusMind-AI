import { ResourceDecorator as Resource, ExecutionContext, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';

@Injectable({ deps: [DatabaseService] })
export class StudyPlannerResources {
  constructor(private db: DatabaseService) {}

  @Resource({
    uri: 'student://{studentId}/upcoming-deadlines',
    name: 'Upcoming Deadlines',
    description: 'Near-term deadlines sorted by due date, with course context',
    mimeType: 'application/json',
  })
  async upcomingDeadlines(uri: string, context: ExecutionContext) {
    const studentId = uri.split('/')[2];
    const student = this.db.getStudent(studentId);
    if (!student) {
      return { type: 'text' as const, text: JSON.stringify({ error: 'Student not found' }) };
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
      type: 'text' as const,
      text: JSON.stringify({ studentId, count: enriched.length, deadlines: enriched }, null, 2),
    };
  }
}
