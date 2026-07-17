import { ExecutionContext } from '@nitrostack/core';
export declare class AuthPrompts {
    authHelp(args: Record<string, unknown>, context: ExecutionContext): Promise<{
        role: "user";
        content: {
            type: "text";
            text: string;
        };
    }[]>;
}
//# sourceMappingURL=auth.prompts.d.ts.map