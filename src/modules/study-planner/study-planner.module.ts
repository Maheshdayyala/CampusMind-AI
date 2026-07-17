import { Module } from '@nitrostack/core';
import { StudyPlannerTools } from './study-planner.tools.js';
import { StudyPlannerResources } from './study-planner.resources.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';

@Module({
  name: 'study-planner',
  description: 'Scheduling, review recommendations, spaced repetition, and proactive planning',
  controllers: [StudyPlannerTools, StudyPlannerResources],
  providers: [MasteryService],
})
export class StudyPlannerModule {}
