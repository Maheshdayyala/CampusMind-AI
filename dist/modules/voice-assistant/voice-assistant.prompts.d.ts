import { ExecutionContext } from '@nitrostack/core';
export declare class VoiceAssistantPrompts {
    voiceTutorSession(args: Record<string, unknown>, context: ExecutionContext): Promise<{
        role: "user";
        content: {
            type: "text";
            text: string;
        };
    }[]>;
}
//# sourceMappingURL=voice-assistant.prompts.d.ts.map