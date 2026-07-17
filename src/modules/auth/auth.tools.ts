import { ToolDecorator as Tool, z, ExecutionContext, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';

@Injectable({ deps: [DatabaseService] })
export class AuthTools {
  constructor(private db: DatabaseService) {}

  @Tool({
    name: 'login',
    description: 'Authenticate as a student. Returns a session token for subsequent requests. Use student ID "s1" (Aisha) or "s2" (Rohan) for demo.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID to authenticate as'),
    }),
  })
  async login(input: { studentId: string }, ctx: ExecutionContext) {
    const student = this.db.getStudent(input.studentId);
    if (!student) {
      return { ok: false, message: `No student found with id "${input.studentId}".` };
    }
    return {
      ok: true,
      token: `demo-jwt-${student.id}`,
      student: {
        id: student.id,
        name: student.name,
        program: student.program,
        year: student.year,
      },
      message: `Logged in as ${student.name}. You can now use all tools with studentId "${student.id}".`,
    };
  }
}
