import { ExecutionContext } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
export declare class CoursesResources {
    private db;
    constructor(db: DatabaseService);
    courseSyllabus(uri: string, context: ExecutionContext): Promise<{
        type: "text";
        text: string;
    }>;
}
//# sourceMappingURL=courses.resources.d.ts.map