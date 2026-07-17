import { ToolDecorator as Tool, UseGuards as UseGuards, z, ExecutionContext, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { JwtGuard } from '../../common/guards/jwt.guard.js';

@Injectable({ deps: [DatabaseService] })
export class CoursesTools {
  constructor(private db: DatabaseService) {}

  @Tool({
    name: 'list_courses',
    description: 'List all courses a student is enrolled in with basic info',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID'),
    }),
  })
  @UseGuards(JwtGuard)
  async listCourses(input: { studentId: string }, ctx: ExecutionContext) {
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

  @Tool({
    name: 'get_concept',
    description: 'Get details about a specific concept including current mastery for a student',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID'),
      conceptId: z.string().describe('The concept ID (e.g. k1, k2, k3...)'),
    }),
  })
  @UseGuards(JwtGuard)
  async getConcept(input: { studentId: string; conceptId: string }, ctx: ExecutionContext) {
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
}
