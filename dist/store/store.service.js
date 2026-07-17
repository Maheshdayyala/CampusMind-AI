var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';
const DATA_DIR = path.join(process.cwd(), 'fixtures');
const DATA_FILE = path.join(DATA_DIR, 'store.json');
/**
 * StoreService — a simple JSON-file-backed persistence layer.
 * Data survives server restarts because every mutation flushes to disk.
 */
let StoreService = class StoreService {
    entries = [];
    loaded = false;
    ensureLoaded() {
        if (this.loaded)
            return;
        try {
            if (fs.existsSync(DATA_FILE)) {
                const raw = fs.readFileSync(DATA_FILE, 'utf-8');
                const parsed = JSON.parse(raw);
                this.entries = Array.isArray(parsed) ? parsed : [];
            }
            else {
                this.entries = [];
            }
        }
        catch {
            this.entries = [];
        }
        this.loaded = true;
    }
    flush() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(this.entries, null, 2), 'utf-8');
    }
    imageForSubject(subject) {
        const seed = encodeURIComponent(subject.trim().toLowerCase() || 'study');
        return `https://picsum.photos/seed/campusmind-${seed}/600/400`;
    }
    /** Return all entries (a copy). */
    all() {
        this.ensureLoaded();
        return [...this.entries];
    }
    /** Find a single entry by id. */
    findById(id) {
        this.ensureLoaded();
        return this.entries.find((e) => e.id === id);
    }
    /** Insert a new topic entry and persist it. */
    add(subject, topic, note) {
        this.ensureLoaded();
        const now = new Date().toISOString();
        const entry = {
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
    markReviewed(id) {
        this.ensureLoaded();
        const entry = this.entries.find((e) => e.id === id);
        if (!entry)
            return undefined;
        entry.lastReviewedAt = new Date().toISOString();
        entry.reviewCount += 1;
        this.flush();
        return entry;
    }
    /** Demo/testing: age an entry's timestamps by `daysAgo` days. */
    backdate(id, daysAgo) {
        this.ensureLoaded();
        const entry = this.entries.find((e) => e.id === id);
        if (!entry)
            return undefined;
        const ms = daysAgo * 24 * 60 * 60 * 1000;
        entry.loggedAt = new Date(Date.now() - ms).toISOString();
        entry.lastReviewedAt = new Date(Date.now() - ms).toISOString();
        this.flush();
        return entry;
    }
};
StoreService = __decorate([
    Injectable()
], StoreService);
export { StoreService };
//# sourceMappingURL=store.service.js.map