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
/**
 * Compute a simple fuzzy relevance score for an entry against a query.
 * Higher is better. Splits the query into tokens and rewards partial
 * substring matches across subject/topic/note.
 */
function relevanceScore(entry, query) {
    const q = query.trim().toLowerCase();
    if (!q)
        return 0;
    const haystack = `${entry.subject} ${entry.topic} ${entry.note}`.toLowerCase();
    let score = 0;
    // Whole-query substring hit is strongest.
    if (haystack.includes(q))
        score += 10;
    // Token-level partial matches.
    const tokens = q.split(/\s+/).filter((t) => t.length > 2);
    for (const token of tokens) {
        if (entry.topic.toLowerCase().includes(token))
            score += 4;
        if (entry.subject.toLowerCase().includes(token))
            score += 3;
        if (entry.note.toLowerCase().includes(token))
            score += 2;
    }
    return score;
}
let MemoryTools = class MemoryTools {
    store;
    constructor(store) {
        this.store = store;
    }
    async logTopic(input, ctx) {
        ctx.logger.info('Logging topic', { subject: input.subject, topic: input.topic });
        const entry = this.store.add(input.subject, input.topic, input.note);
        return {
            id: entry.id,
            subject: entry.subject,
            topic: entry.topic,
            note: entry.note,
            loggedAt: entry.loggedAt,
            message: `Logged "${entry.topic}" under ${entry.subject}. Entry id: ${entry.id}`,
        };
    }
    async recallTopic(input, ctx) {
        ctx.logger.info('Recalling topics', { query: input.query });
        const all = this.store.all();
        const matches = all
            .map((entry) => ({ entry, score: relevanceScore(entry, input.query) }))
            .filter((m) => m.score > 0)
            // Sorted newest first (as specified), among relevant matches.
            .sort((a, b) => new Date(b.entry.loggedAt).getTime() - new Date(a.entry.loggedAt).getTime());
        const results = matches.map((m) => ({
            id: m.entry.id,
            subject: m.entry.subject,
            topic: m.entry.topic,
            note: m.entry.note,
            imageUrl: m.entry.imageUrl,
            loggedAt: m.entry.loggedAt,
            reviewCount: m.entry.reviewCount,
        }));
        return {
            query: input.query,
            count: results.length,
            results,
        };
    }
};
__decorate([
    Tool({
        name: 'log_topic',
        description: 'Log a topic or doubt a student studied or asked about, with a note on what was covered or still unclear. Stores it with a timestamp and returns the new entry id.',
        inputSchema: z.object({
            subject: z.string().describe('The subject area, e.g. Chemistry'),
            topic: z.string().describe('The specific topic or doubt studied'),
            note: z
                .string()
                .describe('What was covered or what is still unclear about this topic'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MemoryTools.prototype, "logTopic", null);
__decorate([
    Tool({
        name: 'recall_topic',
        description: 'Search previously logged topics by a keyword or vague query. Performs a fuzzy match against subject, topic, and note. Returns matching entries sorted newest first.',
        inputSchema: z.object({
            query: z
                .string()
                .describe('Keyword or vague phrase to search logged topics, e.g. "equilibrium shifts"'),
        }),
    }),
    Widget('recall-list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MemoryTools.prototype, "recallTopic", null);
MemoryTools = __decorate([
    Injectable({ deps: [StoreService] }),
    __metadata("design:paramtypes", [StoreService])
], MemoryTools);
export { MemoryTools };
//# sourceMappingURL=memory.tools.js.map