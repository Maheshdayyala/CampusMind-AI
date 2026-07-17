import { ExecutionContext, Guard } from '@nitrostack/core';
export declare class JwtGuard implements Guard {
    canActivate(context: ExecutionContext): Promise<boolean>;
    verifyStudentAccess(context: ExecutionContext, studentId: string): boolean;
}
//# sourceMappingURL=jwt.guard.d.ts.map