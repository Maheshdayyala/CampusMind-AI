var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ToolDecorator as Tool, Widget, Injectable, z } from '@nitrostack/core';
import { StoreService } from '../../store/store.service.js';
function daysSince(iso) {
    const then = new Date(iso).getTime();
    const now = Date.now();
    return Math.floor((now - then) / (24 * 60 * 60 * 1000));
}
let ReviewTools = class ReviewTools {
    store;
    constructor(store) {
        this.store = store;
    }
    async getReviewDue(input, ctx) {
        const threshold = input.daysThreshold ?? 3;
        ctx.logger.info('Finding review-due topics', { threshold });
        const overdue = this.store
            .all()
            .map((entry) => ({ entry, daysSinceReview: daysSince(entry.lastReviewedAt) }))
            .filter((m) => m.daysSinceReview >= threshold)
            .sort((a, b) => b.daysSinceReview - a.daysSinceReview);
        const results = overdue.map((m) => ({
            id: m.entry.id,
            subject: m.entry.subject,
            topic: m.entry.topic,
            note: m.entry.note,
            imageUrl: m.entry.imageUrl,
            lastReviewedAt: m.entry.lastReviewedAt,
            reviewCount: m.entry.reviewCount,
            daysSinceReview: m.daysSinceReview,
        }));
        return {
            daysThreshold: threshold,
            count: results.length,
            results,
        };
    }
    async markReviewed(input, ctx) {
        ctx.logger.info('Marking topic reviewed', { id: input.id });
        const entry = this.store.markReviewed(input.id);
        if (!entry) {
            return {
                ok: false,
                message: `No topic found with id "${input.id}".`,
            };
        }
        return {
            ok: true,
            id: entry.id,
            subject: entry.subject,
            topic: entry.topic,
            lastReviewedAt: entry.lastReviewedAt,
            reviewCount: entry.reviewCount,
            message: `Marked "${entry.topic}" as reviewed. Review count is now ${entry.reviewCount}.`,
        };
    }
    async demoBackdateTopic(input, ctx) {
        const daysAgo = input.daysAgo ?? 5;
        ctx.logger.info('Backdating topic (demo)', { id: input.id, daysAgo });
        const entry = this.store.backdate(input.id, daysAgo);
        if (!entry) {
            return {
                ok: false,
                message: `No topic found with id "${input.id}".`,
            };
        }
        return {
            ok: true,
            id: entry.id,
            topic: entry.topic,
            loggedAt: entry.loggedAt,
            lastReviewedAt: entry.lastReviewedAt,
            message: `Backdated "${entry.topic}" by ${daysAgo} days for testing.`,
        };
    }
};
__decorate([
    Tool({
        name: 'get_review_due',
        description: 'Proactively find topics that have not been reviewed in at least N days (spaced-repetition style). Returns the overdue topics with how many days since they were last reviewed, most overdue first.',
        inputSchema: z.object({
            daysThreshold: z
                .number()
                .default(3)
                .describe('Minimum number of days since last review to count as overdue (default 3)'),
        }),
    }),
    Widget('review-due'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewTools.prototype, "getReviewDue", null);
__decorate([
    Tool({
        name: 'mark_reviewed',
        description: 'Mark a topic (by id) as reviewed right now. Resets its review clock and increments its review count.',
        inputSchema: z.object({
            id: z.string().describe('The id of the topic entry to mark as reviewed'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewTools.prototype, "markReviewed", null);
__decorate([
    Tool({
        name: 'demo_backdate_topic',
        description: 'DEMO/TESTING ONLY: artificially age a logged topic\'s timestamps by N days so get_review_due can be tested without waiting real time.',
        inputSchema: z.object({
            id: z.string().describe('The id of the topic entry to backdate'),
            daysAgo: z
                .number()
                .default(5)
                .describe('How many days to age the entry\'s timestamps (default 5)'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewTools.prototype, "demoBackdateTopic", null);
ReviewTools = __decorate([
    Injectable({ deps: [StoreService] }),
    __metadata("design:paramtypes", [StoreService])
], ReviewTools);
export { ReviewTools };
//# sourceMappingURL=review.tools.js.map