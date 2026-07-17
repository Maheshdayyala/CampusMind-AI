export interface MasteryUpdate {
    confidenceDelta: number;
    timesWrongDelta: number;
}
export declare class MasteryService {
    private readonly MIN;
    private readonly MAX;
    private readonly DECAY_FLOOR;
    private readonly NO_DECAY_DAYS;
    private readonly DAILY_DECAY;
    clamp(score: number): number;
    handleCorrectQuiz(): MasteryUpdate;
    handleIncorrectQuiz(): MasteryUpdate;
    handleConfusedQuestion(): MasteryUpdate;
    handleClearQuestion(): MasteryUpdate;
    handleReviewSession(): MasteryUpdate;
    applyDecay(currentScore: number, daysSinceReview: number): number;
    computeDaysSinceReview(lastReviewed: string): number;
}
//# sourceMappingURL=mastery.service.d.ts.map