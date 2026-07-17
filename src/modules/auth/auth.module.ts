import { Module } from '@nitrostack/core';
import { AuthTools } from './auth.tools.js';

@Module({
  name: 'auth',
  description: 'JWT authentication and student identity management',
  controllers: [AuthTools],
})
export class AuthModule {}
