import { ExecutionContext } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';
export declare class AcademicMemoryTools {
    private db;
    private mastery;
    constructor(db: DatabaseService, mastery: MasteryService);
    askQuestion(input: {
        studentId: string;
        courseId: string;
        question: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        student?: undefined;
        course?: undefined;
        question?: undefined;
        context?: undefined;
        relevantConcepts?: undefined;
        detectedConfusion?: undefined;
        masteryUpdate?: undefined;
    } | {
        ok: boolean;
        student: string;
        course: string;
        question: string;
        context: {
            syllabus: string;
        };
        relevantConcepts: {
            concept: string;
            confidenceScore: number;
            daysSinceReview: number;
        }[];
        detectedConfusion: boolean;
        masteryUpdate: {
            delta: number;
            timesWrongDelta: number;
        };
        message: string;
    }>;
    explainConcept(input: {
        studentId: string;
        conceptId: string;
        depth?: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        concept?: undefined;
        course?: undefined;
        mastery?: undefined;
        depth?: undefined;
        recommendedDepth?: undefined;
    } | {
        ok: boolean;
        concept: {
            id: string;
            name: string;
            description: string;
        };
        course: {
            id: string;
            title: string;
        } | null;
        mastery: {
            confidenceScore: number;
            daysSinceReview: number;
            timesWrong: number;
        };
        depth: string;
        recommendedDepth: string;
        message: string;
    }>;
    logQuizResult(input: {
        studentId: string;
        conceptId: string;
        correct: boolean;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        concept?: undefined;
        correct?: undefined;
        previousScore?: undefined;
        newScore?: undefined;
        timesWrong?: undefined;
    } | {
        ok: boolean;
        concept: string;
        correct: boolean;
        previousScore: number;
        newScore: number;
        timesWrong: number;
        message: string;
    }>;
    logTopic(input: {
        studentId: string;
        subject: string;
        topic: string;
        note: string;
    }, ctx: ExecutionContext): Promise<{
        id: string;
        subject: string;
        topic: string;
        note: string;
        loggedAt: string;
        message: string;
    }>;
    recallTopic(input: {
        studentId: string;
        query: string;
    }, ctx: ExecutionContext): Promise<{
        query: string;
        count: number;
        results: {
            id: string;
            summary: string;
            type: string;
            timestamp: string;
            channel: string;
        }[];
    }>;
}
//# sourceMappingURL=academic-memory.tools.d.ts.map