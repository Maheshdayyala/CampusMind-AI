import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { MemoryModule } from './modules/memory/memory.module.js';
import { ReviewModule } from './modules/review/review.module.js';
import { SystemHealthCheck } from './health/system.health.js';

/**
 * Root Application Module
 *
 * CampusMind AI — a persistent academic memory system for students.
 * Registers the memory and review feature modules plus health checks.
 */
@McpApp({
  module: AppModule,
  server: {
    name: 'campusmind-ai',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Root application module',
  imports: [
    ConfigModule.forRoot(),
    MemoryModule,
    ReviewModule
  ],
  providers: [
    // Health Checks
    SystemHealthCheck,
  ]
})
export class AppModule {}
