var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
let AppModule = class AppModule {
};
AppModule = __decorate([
    McpApp({
        module: AppModule,
        server: {
            name: 'campusmind-ai',
            version: '2.0.0'
        },
        logging: {
            level: 'info'
        }
    }),
    Module({
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
        ]
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map