import { ExecutionContext } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
export declare class CoursesTools {
    private db;
    constructor(db: DatabaseService);
    listCourses(input: {
        studentId: string;
    }, ctx: ExecutionContext): Promise<{
        count: number;
        courses: {
            id: string;
            code: string;
            title: string;
            term: string;
        }[];
    }>;
    getConcept(input: {
        studentId: string;
        conceptId: string;
    }, ctx: ExecutionContext): Promise<{
        ok: boolean;
        message: string;
        concept?: undefined;
        mastery?: undefined;
    } | {
        ok: boolean;
        concept: {
            id: string;
            name: string;
            description: string;
            course: {
                id: string;
                code: string;
                title: string;
            } | null;
        };
        mastery: {
            confidenceScore: number;
            lastReviewed: string;
            timesWrong: number;
        } | {
            confidenceScore: number;
            lastReviewed: null;
            timesWrong: number;
        };
        message?: undefined;
    }>;
}
//# sourceMappingURL=courses.tools.d.ts.map