var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ToolDecorator as Tool, z, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
let AuthTools = class AuthTools {
    db;
    constructor(db) {
        this.db = db;
    }
    async login(input, ctx) {
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
};
__decorate([
    Tool({
        name: 'login',
        description: 'Authenticate as a student. Returns a session token for subsequent requests. Use student ID "s1" (Aisha) or "s2" (Rohan) for demo.',
        inputSchema: z.object({
            studentId: z.string().describe('The student ID to authenticate as'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthTools.prototype, "login", null);
AuthTools = __decorate([
    Injectable({ deps: [DatabaseService] }),
    __metadata("design:paramtypes", [DatabaseService])
], AuthTools);
export { AuthTools };
//# sourceMappingURL=auth.tools.js.map