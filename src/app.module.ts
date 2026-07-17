import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { AuthModule } from './modules/auth/auth.module.js';
import { StudentsModule } from './modules/students/students.module.js';
import { CoursesModule } from './modules/courses/courses.module.js';
import { AcademicMemoryModule } from './modules/academic-memory/academic-memory.module.js';
import { StudyPlannerModule } from './modules/study-planner/study-planner.module.js';
import { VoiceAssistantModule } from './modules/voice-assistant/voice-assistant.module.js';
import { InsightsModule } from './modules/insights/insights.module.js';
import { DatabaseService } from './common/services/database.service.js';
import { JwtGuard } from './common/guards/jwt.guard.js';
import { SystemHealthCheck } from './health/system.health.js';
import { FrontendRoutesService } from './frontend-routes.service.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'campusmind-ai',
    version: '2.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'CampusMind AI — persistent academic memory system for students',
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    StudentsModule,
    CoursesModule,
    AcademicMemoryModule,
    StudyPlannerModule,
    VoiceAssistantModule,
    InsightsModule,
  ],
  providers: [
    DatabaseService,
    JwtGuard,
    SystemHealthCheck,
    FrontendRoutesService,
  ]
})
export class AppModule {}
