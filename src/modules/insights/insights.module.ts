import { Module } from '@nitrostack/core';
import { InsightsTools } from './insights.tools.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';

@Module({
  name: 'insights',
  description: 'Progress analytics, study patterns, and widget-backed summaries',
  controllers: [InsightsTools],
  providers: [MasteryService],
})
export class InsightsModule {}
