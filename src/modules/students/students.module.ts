import { Module } from '@nitrostack/core';
import { StudentsResources } from './students.resources.js';

@Module({
  name: 'students',
  description: 'Student profiles and academic information',
  controllers: [StudentsResources],
})
export class StudentsModule {}
