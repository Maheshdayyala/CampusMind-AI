import { ExecutionContext } from '@nitrostack/core';
import { StoreService } from '../../store/store.service.js';
export declare class MemoryTools {
    private store;
    constructor(store: StoreService);
    logTopic(input: {
        subject: string;
        topic: string;
        note: string;
    }, ctx: ExecutionContext): Promise<{
        id: string;
        subject: string;
        topic: string;
        note: string;
        loggedAt: string;
        message: string;
    }>;
    recallTopic(input: {
        query: string;
    }, ctx: ExecutionContext): Promise<{
        query: string;
        count: number;
        results: {
            id: string;
            subject: string;
            topic: string;
            note: string;
            imageUrl: string;
            loggedAt: string;
            reviewCount: number;
        }[];
    }>;
}
//# sourceMappingURL=memory.tools.d.ts.map