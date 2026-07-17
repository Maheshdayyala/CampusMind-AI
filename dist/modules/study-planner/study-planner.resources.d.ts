import { ExecutionContext } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
export declare class StudyPlannerResources {
    private db;
    constructor(db: DatabaseService);
    upcomingDeadlines(uri: string, context: ExecutionContext): Promise<{
        type: "text";
        text: string;
    }>;
}
//# sourceMappingURL=study-planner.resources.d.ts.map