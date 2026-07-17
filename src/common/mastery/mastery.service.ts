import { Injectable } from '@nitrostack/core';

export interface MasteryUpdate {
  confidenceDelta: number;
  timesWrongDelta: number;
}

@Injectable()
export class MasteryService {
  private readonly MIN = 0.0;
  private readonly MAX = 1.0;
  private readonly DECAY_FLOOR = 0.15;
  private readonly NO_DECAY_DAYS = 3;
  private readonly DAILY_DECAY = 0.015;

  clamp(score: number): number {
    return Math.max(this.MIN, Math.min(this.MAX, score));
  }

  handleCorrectQuiz(): MasteryUpdate {
    const delta = 0.08 + Math.random() * 0.07;
    return { confidenceDelta: delta, timesWrongDelta: 0 };
  }

  handleIncorrectQuiz(): MasteryUpdate {
    const delta = -(0.10 + Math.random() * 0.08);
    return { confidenceDelta: delta, timesWrongDelta: 1 };
  }

  handleConfusedQuestion(): MasteryUpdate {
    const delta = -(0.03 + Math.random() * 0.05);
    return { confidenceDelta: delta, timesWrongDelta: 0 };
  }

  handleClearQuestion(): MasteryUpdate {
    const delta = 0.03 + Math.random() * 0.04;
    return { confidenceDelta: delta, timesWrongDelta: 0 };
  }

  handleReviewSession(): MasteryUpdate {
    const delta = 0.04 + Math.random() * 0.06;
    return { confidenceDelta: delta, timesWrongDelta: 0 };
  }

  applyDecay(currentScore: number, daysSinceReview: number): number {
    if (daysSinceReview <= this.NO_DECAY_DAYS) return currentScore;
    const decayDays = daysSinceReview - this.NO_DECAY_DAYS;
    const decay = decayDays * this.DAILY_DECAY;
    return Math.max(this.DECAY_FLOOR, currentScore - decay);
  }

  computeDaysSinceReview(lastReviewed: string): number {
    const then = new Date(lastReviewed).getTime();
    const now = Date.now();
    return Math.floor((now - then) / (24 * 60 * 60 * 1000));
  }
}
