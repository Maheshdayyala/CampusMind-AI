import { ExecutionContext } from '@nitrostack/core';
import { StoreService } from '../../store/store.service.js';
export declare class ReviewTools {
    private store;
    constructor(store: StoreService);
    getReviewDue(input: {
        daysThreshold?: number;
    }, ctx: ExecutionContext): Promise<{
        daysThreshold: number;
        count: number;
        results: {
            id: string;
            subject: string;
            topic: string;
            note: string;
            imageUrl: string;
            lastReviewedAt: string;
            reviewCount: number;
            daysSinceReview: number;
        }[];
    }>;
    markReviewed(input: {
        id: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        id?: undefined;
        subject?: undefined;
        topic?: undefined;
        lastReviewedAt?: undefined;
        reviewCount?: undefined;
    } | {
        ok: boolean;
        id: string;
        subject: string;
        topic: string;
        lastReviewedAt: string;
        reviewCount: number;
        message: string;
    }>;
    demoBackdateTopic(input: {
        id: string;
        daysAgo?: number;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        id?: undefined;
        topic?: undefined;
        loggedAt?: undefined;
        lastReviewedAt?: undefined;
    } | {
        ok: boolean;
        id: string;
        topic: string;
        loggedAt: string;
        lastReviewedAt: string;
        message: string;
    }>;
}
//# sourceMappingURL=review.tools.d.ts.map