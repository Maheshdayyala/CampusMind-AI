var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PromptDecorator as Prompt, Injectable } from '@nitrostack/core';
let VoiceAssistantPrompts = class VoiceAssistantPrompts {
    async voiceTutorSession(args, context) {
        const { studentId, sessionId, preferredDepth } = args;
        const depthInstruction = preferredDepth === 'basic'
            ? 'Keep explanations simple and short.'
            : preferredDepth === 'advanced'
                ? 'Feel free to go deeper. Use examples.'
                : 'Match your depth to the topic.';
        return [
            {
                role: 'user',
                content: {
                    type: 'text',
                    text: `You are a voice tutor for CampusMind AI. Speak like you're talking to a student.

Rules for spoken responses:
1. Use short sentences. Keep each sentence under 20 words.
2. Speak clearly. Avoid complex clauses and jargon.
3. Pause between ideas. Use natural breaks.
4. Ask one question at a time.
5. Confirm understanding before moving on.
6. ${depthInstruction}
7. Read student://${studentId ?? 'unknown'}/memory before answering to adapt to their mastery level.
8. Log all interactions using the voice tools provided.
9. At the end, summarize what was covered in 2-3 short sentences.

Session id: ${sessionId ?? 'new'}
Student id: ${studentId ?? 'unknown'}

Begin the session with a short greeting and ask what the student wants to learn today.`,
                },
            },
        ];
    }
};
__decorate([
    Prompt({
        name: 'voice-tutor-session',
        description: 'Instructs the AI for voice-based tutoring using spoken-word style: shorter sentences, clearer phrasing, and a conversational tone optimized for text-to-speech output.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VoiceAssistantPrompts.prototype, "voiceTutorSession", null);
VoiceAssistantPrompts = __decorate([
    Injectable()
], VoiceAssistantPrompts);
export { VoiceAssistantPrompts };
//# sourceMappingURL=voice-assistant.prompts.js.map