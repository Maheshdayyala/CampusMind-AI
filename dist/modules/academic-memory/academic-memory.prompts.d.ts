import { ExecutionContext } from '@nitrostack/core';
export declare class AcademicMemoryPrompts {
    tutorSession(args: Record<string, unknown>, context: ExecutionContext): Promise<{
        role: "user";
        content: {
            type: "text";
            text: string;
        };
    }[]>;
}
//# sourceMappingURL=academic-memory.prompts.d.ts.map