import { ExecutionContext } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
export declare class StudentsResources {
    private db;
    constructor(db: DatabaseService);
    studentProfile(uri: string, context: ExecutionContext): Promise<{
        type: "text";
        text: string;
    }>;
}
//# sourceMappingURL=students.resources.d.ts.map