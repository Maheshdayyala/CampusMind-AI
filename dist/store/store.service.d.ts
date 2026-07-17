/**
 * A single logged study topic entry.
 */
export interface TopicEntry {
    id: string;
    subject: string;
    topic: string;
    note: string;
    imageUrl: string;
    loggedAt: string;
    lastReviewedAt: string;
    reviewCount: number;
}
/**
 * StoreService — a simple JSON-file-backed persistence layer.
 * Data survives server restarts because every mutation flushes to disk.
 */
export declare class StoreService {
    private entries;
    private loaded;
    private ensureLoaded;
    private flush;
    private imageForSubject;
    /** Return all entries (a copy). */
    all(): TopicEntry[];
    /** Find a single entry by id. */
    findById(id: string): TopicEntry | undefined;
    /** Insert a new topic entry and persist it. */
    add(subject: string, topic: string, note: string): TopicEntry;
    /** Mark an entry reviewed now: reset review clock + increment count. */
    markReviewed(id: string): TopicEntry | undefined;
    /** Demo/testing: age an entry's timestamps by `daysAgo` days. */
    backdate(id: string, daysAgo: number): TopicEntry | undefined;
}
//# sourceMappingURL=store.service.d.ts.map