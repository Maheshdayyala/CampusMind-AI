import { ExecutionContext } from '@nitrostack/core';
export declare class StudyPlannerPrompts {
    weeklyReview(args: Record<string, unknown>, context: ExecutionContext): Promise<{
        role: "user";
        content: {
            type: "text";
            text: string;
        };
    }[]>;
    examPrep(args: Record<string, unknown>, context: ExecutionContext): Promise<{
        role: "user";
        content: {
            type: "text";
            text: string;
        };
    }[]>;
}
//# sourceMappingURL=study-planner.prompts.d.ts.map