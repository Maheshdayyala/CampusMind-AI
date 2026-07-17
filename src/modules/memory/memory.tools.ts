import { ToolDecorator as Tool, Widget, Injectable, ExecutionContext, z } from '@nitrostack/core';
import { StoreService, TopicEntry } from '../../store/store.service.js';

/**
 * Compute a simple fuzzy relevance score for an entry against a query.
 * Higher is better. Splits the query into tokens and rewards partial
 * substring matches across subject/topic/note.
 */
function relevanceScore(entry: TopicEntry, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const haystack = `${entry.subject} ${entry.topic} ${entry.note}`.toLowerCase();
  let score = 0;

  // Whole-query substring hit is strongest.
  if (haystack.includes(q)) score += 10;

  // Token-level partial matches.
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  for (const token of tokens) {
    if (entry.topic.toLowerCase().includes(token)) score += 4;
    if (entry.subject.toLowerCase().includes(token)) score += 3;
    if (entry.note.toLowerCase().includes(token)) score += 2;
  }
  return score;
}

@Injectable({ deps: [StoreService] })
export class MemoryTools {
  constructor(private store: StoreService) {}

  @Tool({
    name: 'log_topic',
    description:
      'Log a topic or doubt a student studied or asked about, with a note on what was covered or still unclear. Stores it with a timestamp and returns the new entry id.',
    inputSchema: z.object({
      subject: z.string().describe('The subject area, e.g. Chemistry'),
      topic: z.string().describe('The specific topic or doubt studied'),
      note: z
        .string()
        .describe('What was covered or what is still unclear about this topic'),
    }),
  })
  async logTopic(input: { subject: string; topic: string; note: string }, ctx: ExecutionContext) {
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

  @Tool({
    name: 'recall_topic',
    description:
      'Search previously logged topics by a keyword or vague query. Performs a fuzzy match against subject, topic, and note. Returns matching entries sorted newest first.',
    inputSchema: z.object({
      query: z
        .string()
        .describe('Keyword or vague phrase to search logged topics, e.g. "equilibrium shifts"'),
    }),
  })
  @Widget('recall-list')
  async recallTopic(input: { query: string }, ctx: ExecutionContext) {
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
}
