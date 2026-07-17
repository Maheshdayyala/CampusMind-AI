var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nitrostack/core';
import { StudyPlannerTools } from './study-planner.tools.js';
import { StudyPlannerResources } from './study-planner.resources.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';
let StudyPlannerModule = class StudyPlannerModule {
};
StudyPlannerModule = __decorate([
    Module({
        name: 'study-planner',
        description: 'Scheduling, review recommendations, spaced repetition, and proactive planning',
        controllers: [StudyPlannerTools, StudyPlannerResources],
        providers: [MasteryService],
    })
], StudyPlannerModule);
export { StudyPlannerModule };
//# sourceMappingURL=study-planner.module.js.map