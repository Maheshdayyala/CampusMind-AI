import { ToolDecorator as Tool, z, ExecutionContext, Injectable } from '@nitrostack/core';
import { createHash } from 'crypto';
import { DatabaseService } from '../../common/services/database.service.js';

function base64url(s: string) { return Buffer.from(s).toString('base64url') }
function demoJwt(sub: string) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64url(JSON.stringify({ sub }))
  return `${header}.${payload}.demo`
}

@Injectable({ deps: [DatabaseService] })
export class AuthTools {
  constructor(private db: DatabaseService) {}

  @Tool({
    name: 'login',
    description: 'Authenticate with email and password. Returns a session token for subsequent requests.',
    inputSchema: z.object({
      email: z.string().describe('Student email address'),
      password: z.string().describe('Account password'),
    }),
  })
  async login(input: { email: string; password: string }, ctx: ExecutionContext) {
    const student = this.db.getStudentByEmail(input.email);
    if (!student) {
      return { ok: false, message: 'No account found with that email.' };
    }
    // ponytail: SHA-256 for demo; upgrade to bcrypt/scrypt for production
    const hash = createHash('sha256').update(input.password).digest('hex');
    if (hash !== student.passwordHash) {
      return { ok: false, message: 'Invalid password.' };
    }
    return {
      ok: true,
      token: demoJwt(student.id),
      student: {
        id: student.id,
        name: student.name,
        program: student.program,
        year: student.year,
      },
      message: `Logged in as ${student.name}.`,
    };
  }
}
