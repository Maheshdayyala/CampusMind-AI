import { ExecutionContext } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';
export declare class VoiceAssistantTools {
    private db;
    private mastery;
    private sessions;
    constructor(db: DatabaseService, mastery: MasteryService);
    private detectIntent;
    private isLearningIntent;
    private getSpokenResponse;
    startVoiceSession(input: {
        studentId: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        sessionId?: undefined;
        student?: undefined;
        greeting?: undefined;
        context?: undefined;
    } | {
        ok: boolean;
        sessionId: string;
        student: string;
        greeting: string;
        context: {
            courses: string[];
            weakConcepts: string[];
            upcomingAssignments: number;
        };
        message?: undefined;
    }>;
    processVoiceInput(input: {
        studentId: string;
        sessionId: string;
        transcript: string;
        audioDurationSeconds: number;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        sessionId?: undefined;
        transcript?: undefined;
        audioDurationSeconds?: undefined;
        detectedIntent?: undefined;
        matchedConcept?: undefined;
        spokenResponse?: undefined;
        masteryUpdated?: undefined;
    } | {
        ok: boolean;
        sessionId: string;
        transcript: string;
        audioDurationSeconds: number;
        detectedIntent: string;
        matchedConcept: {
            id: string;
            name: string;
        } | null;
        spokenResponse: string;
        masteryUpdated: boolean;
        message?: undefined;
    }>;
    endVoiceSession(input: {
        studentId: string;
        sessionId: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        sessionId?: undefined;
        student?: undefined;
        stats?: undefined;
    } | {
        ok: boolean;
        sessionId: string;
        student: string;
        stats: {
            durationMinutes: number;
            interactionCount: number;
            topicsCovered: string[];
        };
        message: string;
    }>;
}
//# sourceMappingURL=voice-assistant.tools.d.ts.map