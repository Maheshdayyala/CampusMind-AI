var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { PromptDecorator as Prompt } from '@nitrostack/core';
export class AuthPrompts {
    async authHelp(args, context) {
        return [
            {
                role: 'user',
                content: {
                    type: 'text',
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
__decorate([
    Prompt({
        name: 'auth-help',
        description: 'Instructions for authenticating with CampusMind AI',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthPrompts.prototype, "authHelp", null);
//# sourceMappingURL=auth.prompts.js.map