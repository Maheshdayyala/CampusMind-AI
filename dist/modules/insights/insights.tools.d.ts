import { ExecutionContext } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';
export declare class InsightsTools {
    private db;
    private mastery;
    constructor(db: DatabaseService, mastery: MasteryService);
    getProgressSummary(input: {
        studentId: string;
        days?: number;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        student?: undefined;
        periodDays?: undefined;
        overview?: undefined;
        conceptMastery?: undefined;
        recentActivity?: undefined;
    } | {
        ok: boolean;
        student: string;
        periodDays: number;
        overview: {
            averageConfidence: number;
            weakTopicsCount: number;
            totalConceptsTracked: number;
            studySessionsCompleted: number;
            estimatedStudyMinutes: number;
            totalInteractions: number;
        };
        conceptMastery: {
            concept: string;
            courseCode: string | null | undefined;
            confidenceScore: number;
            rawScore: number;
            daysSinceReview: number;
            timesWrong: number;
        }[];
        recentActivity: {
            date: string;
            type: string;
            summary: string;
        }[];
        message: string;
    }>;
}
//# sourceMappingURL=insights.tools.d.ts.map