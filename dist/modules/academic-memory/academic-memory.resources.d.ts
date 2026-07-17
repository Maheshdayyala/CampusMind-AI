import { ExecutionContext } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';
export declare class AcademicMemoryResources {
    private db;
    private mastery;
    constructor(db: DatabaseService, mastery: MasteryService);
    academicMemory(uri: string, context: ExecutionContext): Promise<{
        type: "text";
        text: string;
    }>;
    weakTopics(uri: string, context: ExecutionContext): Promise<{
        type: "text";
        text: string;
    }>;
}
//# sourceMappingURL=academic-memory.resources.d.ts.map