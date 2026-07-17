import { Module } from '@nitrostack/core';
import { ReviewTools } from './review.tools.js';
import { StoreService } from '../../store/store.service.js';

@Module({
  name: 'review',
  description: 'Spaced-repetition due tracking and review marking',
  controllers: [ReviewTools],
  providers: [StoreService],
})
export class ReviewModule {}
