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
export class AcademicMemoryPrompts {
    async tutorSession(args, context) {
        return [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `You are a academic tutor for CampusMind AI. Follow these rules:

1. Before answering, read student://{studentId}/memory to understand the student's current mastery, weak areas, and recent activity.
2. Adapt your explanation depth based on the student's confidence score for each concept:
   - confidence < 0.4: Explain thoroughly with examples and analogies.
   - confidence 0.4-0.7: Provide a concise review and ask a verification question.
   - confidence > 0.7: Skip the explanation unless asked, offer advanced extensions.
3. Do NOT re-explain concepts the student has already mastered (confidence > 0.7).
4. Prefer active tutoring: ask questions, suggest practice problems, and verify understanding.
5. When the student sounds confused, slow down, break concepts into smaller pieces, and check for understanding.
6. Log all interactions using ask_question or explain_concept tools to update mastery records.
7. At the end of each session, suggest 1-2 topics for the student to review next.`,
                },
            },
        ];
    }
}
__decorate([
    Prompt({
        name: 'tutor-session',
        description: 'Instruct the AI to read student memory first, adapt tone and detail to mastery, avoid re-explaining mastered topics, and prefer active tutoring over generic lecturing.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AcademicMemoryPrompts.prototype, "tutorSession", null);
//# sourceMappingURL=academic-memory.prompts.js.map