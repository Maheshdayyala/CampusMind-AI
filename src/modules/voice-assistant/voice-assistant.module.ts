import { Module } from '@nitrostack/core';
import { VoiceAssistantTools } from './voice-assistant.tools.js';
import { VoiceAssistantPrompts } from './voice-assistant.prompts.js';

@Module({
  name: 'voice-assistant',
  description: 'Voice interaction sessions, speech processing, and spoken tutoring',
  controllers: [VoiceAssistantTools, VoiceAssistantPrompts],
})
export class VoiceAssistantModule {}
