var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nitrostack/core';
import { ReviewTools } from './review.tools.js';
import { StoreService } from '../../store/store.service.js';
let ReviewModule = class ReviewModule {
};
ReviewModule = __decorate([
    Module({
        name: 'review',
        description: 'Spaced-repetition due tracking and review marking',
        controllers: [ReviewTools],
        providers: [StoreService],
    })
], ReviewModule);
export { ReviewModule };
//# sourceMappingURL=review.module.js.map