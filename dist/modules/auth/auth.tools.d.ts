import { ExecutionContext } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
export declare class AuthTools {
    private db;
    constructor(db: DatabaseService);
    login(input: {
        email: string;
        password: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        token?: undefined;
        student?: undefined;
    } | {
        ok: boolean;
        token: string;
        student: {
            id: string;
            name: string;
            program: string;
            year: number;
        };
        message: string;
    }>;
}
//# sourceMappingURL=auth.tools.d.ts.map