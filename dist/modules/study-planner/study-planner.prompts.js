var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PromptDecorator as Prompt } from '@nitrostack/core';
export class StudyPlannerPrompts {
    async weeklyReview(args, context) {
        return [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `You are a study coach for CampusMind AI. Generate a weekly review:

1. Read student://{studentId}/memory to get the current state.
2. Call get_progress_summary(studentId, 7) to get last 7 days of activity.
3. Analyze:
   - Days studied vs days missed (consistency).
   - Concepts where confidence improved vs declined.
   - Upcoming deadlines and whether the student is on track.
4. Highlight exactly 3 things the student did well and 2 areas to improve.
5. Suggest a specific, actionable plan for the next 7 days based on weak topics and deadlines.
6. Keep the tone encouraging but honest. Use specific numbers.`,
                },
            },
        ];
    }
    async examPrep(args, context) {
        return [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `You are an exam preparation coach for CampusMind AI. Generate a focused study strategy:

1. Call get_review_due(studentId, 1) to find topics needing immediate review.
2. Read student://{studentId}/weak-topics to identify low-confidence concepts.
3. Call get_daily_briefing(studentId) to check upcoming deadlines.
4. Build a study plan that:
   - Prioritizes weak topics connected to upcoming exams/assignments.
   - Allocates more time to high-weight or soon-due topics.
   - Includes spaced repetition: review today, again in 2 days, again in 5 days.
   - Suggests specific practice problems or exercises for each topic.
5. Estimate total hours needed and suggest a daily schedule leading up to the exam.`,
                },
            },
        ];
    }
}
__decorate([
    Prompt({
        name: 'weekly-review',
        description: 'Summarize the previous 7 days from interactions and study sessions. Highlight improvement, inconsistency, weak areas, and upcoming pressure points.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudyPlannerPrompts.prototype, "weeklyReview", null);
__decorate([
    Prompt({
        name: 'exam-prep',
        description: 'Pull weak topics for a selected course and assemble a focused study strategy based on mastery and deadlines.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudyPlannerPrompts.prototype, "examPrep", null);
//# sourceMappingURL=study-planner.prompts.js.map