import { ExecutionContext } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';
export declare class StudyPlannerTools {
    private db;
    private mastery;
    constructor(db: DatabaseService, mastery: MasteryService);
    getReviewDue(input: {
        studentId: string;
        daysThreshold?: number;
    }, ctx: ExecutionContext): Promise<{
        daysThreshold: number;
        count: number;
        results: {
            conceptId: string;
            conceptName: string;
            courseCode: string | null | undefined;
            confidenceScore: number;
            rawScore: number;
            lastReviewedAt: string;
            daysSinceReview: number;
            timesWrong: number;
        }[];
    }>;
    markReviewed(input: {
        studentId: string;
        conceptId: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        conceptId?: undefined;
        conceptName?: undefined;
        previousScore?: undefined;
        newScore?: undefined;
        lastReviewedAt?: undefined;
    } | {
        ok: boolean;
        conceptId: string;
        conceptName: string;
        previousScore: number;
        newScore: number;
        lastReviewedAt: string;
        message: string;
    }>;
    demoBackdateTopic(input: {
        studentId: string;
        conceptId: string;
        daysAgo?: number;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        conceptId?: undefined;
        conceptName?: undefined;
        backdatedDays?: undefined;
    } | {
        ok: boolean;
        conceptId: string;
        conceptName: string;
        backdatedDays: number;
        message: string;
    }>;
    setStudyGoal(input: {
        studentId: string;
        goal: string;
        deadline: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        goalId: string;
        goal: string;
        deadline: string;
        message: string;
    }>;
    recordStudySession(input: {
        studentId: string;
        topics: string[];
        durationMinutes: number;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        sessionId: number;
        topics: string[];
        durationMinutes: number;
        message: string;
    }>;
    getDailyBriefing(input: {
        studentId: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        student?: undefined;
        date?: undefined;
        overview?: undefined;
        deadlines?: undefined;
        reviewRecommended?: undefined;
        urgentAttention?: undefined;
    } | {
        ok: boolean;
        student: string;
        date: string;
        overview: {
            enrolledCourses: number;
            weakTopicsCount: number;
            assignmentsDueSoon: number;
            studyStreak: number;
            recentStudyDays: number;
        };
        deadlines: {
            id: number;
            title: string;
            course: string;
            dueDate: string;
            daysUntil: number;
            urgency: string;
        }[];
        reviewRecommended: {
            concept: string;
            course: string | null | undefined;
            confidence: number;
            daysSinceReview: number;
        }[];
        urgentAttention: {
            concept: string;
            course: string | null | undefined;
            reason: string;
        }[];
        message: string;
    }>;
    suggestReviewPlan(input: {
        studentId: string;
        maxTopics?: number;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        planTitle: string;
        totalRecommended: number;
        plan: {
            day: number;
            concept: string;
            course: string | null | undefined;
            currentConfidence: number;
            recommendedDuration: number;
            reason: string;
        }[];
        message: string;
    }>;
    flagAtRiskTopics(input: {
        studentId: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        count: number;
        atRiskTopics: {
            conceptId: string;
            concept: string;
            course: string;
            confidenceScore: number;
            daysSinceReview: number;
            timesWrong: number;
            nearestDeadline: {
                title: string;
                daysToDeadline: number | null;
                dueDate: string;
            } | null;
            riskScore: number;
            riskLevel: string;
        }[];
        summary: {
            critical: number;
            high: number;
            medium: number;
        };
        message: string;
    }>;
    getDeadlineTimeline(input: {
        studentId: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        studentId?: undefined;
        count?: undefined;
        deadlines?: undefined;
    } | {
        studentId: string;
        count: number;
        deadlines: {
            id: number;
            title: string;
            course: string;
            dueDate: string;
            daysUntil: number;
            weight: number;
            urgency: string;
        }[];
        ok?: undefined;
        message?: undefined;
    }>;
}
//# sourceMappingURL=study-planner.tools.d.ts.map