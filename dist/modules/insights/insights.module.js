var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nitrostack/core';
import { InsightsTools } from './insights.tools.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';
let InsightsModule = class InsightsModule {
};
InsightsModule = __decorate([
    Module({
        name: 'insights',
        description: 'Progress analytics, study patterns, and widget-backed summaries',
        controllers: [InsightsTools],
        providers: [MasteryService],
    })
], InsightsModule);
export { InsightsModule };
//# sourceMappingURL=insights.module.js.map