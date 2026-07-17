import { Module } from '@nitrostack/core';
import { MemoryTools } from './memory.tools.js';
import { StoreService } from '../../store/store.service.js';

@Module({
  name: 'memory',
  description: 'Log and fuzzy-recall studied topics',
  controllers: [MemoryTools],
  providers: [StoreService],
})
export class MemoryModule {}
