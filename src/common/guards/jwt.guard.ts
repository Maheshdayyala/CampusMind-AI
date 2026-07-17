import { Injectable, ExecutionContext, Guard } from '@nitrostack/core';

@Injectable()
export class JwtGuard implements Guard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const auth = context.auth;
    if (!auth || !auth.subject) {
      return false;
    }
    return true;
  }

  verifyStudentAccess(context: ExecutionContext, studentId: string): boolean {
    const auth = context.auth;
    if (!auth || !auth.subject) {
      return false;
    }
    return auth.subject === studentId;
  }
}
