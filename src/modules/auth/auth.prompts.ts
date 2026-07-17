import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

export class AuthPrompts {
  @Prompt({
    name: 'auth-help',
    description: 'Instructions for authenticating with CampusMind AI',
  })
  async authHelp(args: Record<string, unknown>, context: ExecutionContext) {
    return [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `To use CampusMind AI, you must first authenticate.

Call the login tool with a student ID. Demo accounts:
- "s1" — Aisha (BSc Computer Science, Year 2)
- "s2" — Rohan (BSc Physics, Year 1)

After login, use the returned token in subsequent requests.
Every student-specific tool checks that the studentId matches the authenticated subject.`,
        },
      },
    ];
  }
}
