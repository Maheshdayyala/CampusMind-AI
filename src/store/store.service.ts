import { Injectable } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';

/**
 * A single logged study topic entry.
 */
export interface TopicEntry {
  id: string;
  subject: string;
  topic: string;
  note: string;
  imageUrl: string;
  loggedAt: string;        // ISO timestamp
  lastReviewedAt: string;  // ISO timestamp (starts equal to loggedAt)
  reviewCount: number;
}

const DATA_DIR = path.join(process.cwd(), 'fixtures');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

/**
 * StoreService — a simple JSON-file-backed persistence layer.
 * Data survives server restarts because every mutation flushes to disk.
 */
@Injectable()
export class StoreService {
  private entries: TopicEntry[] = [];
  private loaded = false;

  private ensureLoaded(): void {
    if (this.loaded) return;
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.entries = Array.isArray(parsed) ? parsed : [];
      } else {
        this.entries = [];
      }
    } catch {
      this.entries = [];
    }
    this.loaded = true;
  }

  private flush(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.entries, null, 2), 'utf-8');
  }

  private imageForSubject(subject: string): string {
    const seed = encodeURIComponent(subject.trim().toLowerCase() || 'study');
    return `https://picsum.photos/seed/campusmind-${seed}/600/400`;
  }

  /** Return all entries (a copy). */
  all(): TopicEntry[] {
    this.ensureLoaded();
    return [...this.entries];
  }

  /** Find a single entry by id. */
  findById(id: string): TopicEntry | undefined {
    this.ensureLoaded();
    return this.entries.find((e) => e.id === id);
  }

  /** Insert a new topic entry and persist it. */
  add(subject: string, topic: string, note: string): TopicEntry {
    this.ensureLoaded();
    const now = new Date().toISOString();
    const entry: TopicEntry = {
      id: `topic_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`,
      subject,
      topic,
      note,
      imageUrl: this.imageForSubject(subject),
      loggedAt: now,
      lastReviewedAt: now,
      reviewCount: 0,
    };
    this.entries.push(entry);
    this.flush();
    return entry;
  }

  /** Mark an entry reviewed now: reset review clock + increment count. */
  markReviewed(id: string): TopicEntry | undefined {
    this.ensureLoaded();
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return undefined;
    entry.lastReviewedAt = new Date().toISOString();
    entry.reviewCount += 1;
    this.flush();
    return entry;
  }

  /** Demo/testing: age an entry's timestamps by `daysAgo` days. */
  backdate(id: string, daysAgo: number): TopicEntry | undefined {
    this.ensureLoaded();
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return undefined;
    const ms = daysAgo * 24 * 60 * 60 * 1000;
    entry.loggedAt = new Date(Date.now() - ms).toISOString();
    entry.lastReviewedAt = new Date(Date.now() - ms).toISOString();
    this.flush();
    return entry;
  }
}
