import { Module } from '@nitrostack/core';
import { AcademicMemoryTools } from './academic-memory.tools.js';
import { AcademicMemoryResources } from './academic-memory.resources.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';

@Module({
  name: 'academic-memory',
  description: 'Memory graph, mastery tracking, interaction history, and tutoring tools',
  controllers: [AcademicMemoryTools, AcademicMemoryResources],
  providers: [MasteryService],
})
export class AcademicMemoryModule {}
