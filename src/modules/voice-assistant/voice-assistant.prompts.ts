import { PromptDecorator as Prompt, ExecutionContext, Injectable } from '@nitrostack/core';

@Injectable()
export class VoiceAssistantPrompts {
  @Prompt({
    name: 'voice-tutor-session',
    description: 'Instructs the AI for voice-based tutoring using spoken-word style: shorter sentences, clearer phrasing, and a conversational tone optimized for text-to-speech output.',
  })
  async voiceTutorSession(args: Record<string, unknown>, context: ExecutionContext) {
    const { studentId, sessionId, preferredDepth } = args as {
      studentId?: string;
      sessionId?: string;
      preferredDepth?: string;
    };

    const depthInstruction = preferredDepth === 'basic'
      ? 'Keep explanations simple and short.'
      : preferredDepth === 'advanced'
        ? 'Feel free to go deeper. Use examples.'
        : 'Match your depth to the topic.';

    return [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
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
}
