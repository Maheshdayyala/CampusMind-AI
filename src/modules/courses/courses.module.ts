import { Module } from '@nitrostack/core';
import { CoursesResources } from './courses.resources.js';
import { CoursesTools } from './courses.tools.js';

@Module({
  name: 'courses',
  description: 'Course catalog, syllabus, and concepts',
  controllers: [CoursesResources, CoursesTools],
})
export class CoursesModule {}
