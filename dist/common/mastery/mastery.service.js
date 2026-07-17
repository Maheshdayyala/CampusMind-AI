var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nitrostack/core';
let MasteryService = class MasteryService {
    MIN = 0.0;
    MAX = 1.0;
    DECAY_FLOOR = 0.15;
    NO_DECAY_DAYS = 3;
    DAILY_DECAY = 0.015;
    clamp(score) {
        return Math.max(this.MIN, Math.min(this.MAX, score));
    }
    handleCorrectQuiz() {
        const delta = 0.08 + Math.random() * 0.07;
        return { confidenceDelta: delta, timesWrongDelta: 0 };
    }
    handleIncorrectQuiz() {
        const delta = -(0.10 + Math.random() * 0.08);
        return { confidenceDelta: delta, timesWrongDelta: 1 };
    }
    handleConfusedQuestion() {
        const delta = -(0.03 + Math.random() * 0.05);
        return { confidenceDelta: delta, timesWrongDelta: 0 };
    }
    handleClearQuestion() {
        const delta = 0.03 + Math.random() * 0.04;
        return { confidenceDelta: delta, timesWrongDelta: 0 };
    }
    handleReviewSession() {
        const delta = 0.04 + Math.random() * 0.06;
        return { confidenceDelta: delta, timesWrongDelta: 0 };
    }
    applyDecay(currentScore, daysSinceReview) {
        if (daysSinceReview <= this.NO_DECAY_DAYS)
            return currentScore;
        const decayDays = daysSinceReview - this.NO_DECAY_DAYS;
        const decay = decayDays * this.DAILY_DECAY;
        return Math.max(this.DECAY_FLOOR, currentScore - decay);
    }
    computeDaysSinceReview(lastReviewed) {
        const then = new Date(lastReviewed).getTime();
        const now = Date.now();
        return Math.floor((now - then) / (24 * 60 * 60 * 1000));
    }
};
MasteryService = __decorate([
    Injectable()
], MasteryService);
export { MasteryService };
//# sourceMappingURL=mastery.service.js.map