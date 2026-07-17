import { ToolDecorator as Tool, z, ExecutionContext, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';

const VOICE_CHANNEL = 'voice';

@Injectable({ deps: [DatabaseService, MasteryService] })
export class VoiceAssistantTools {
  private sessions = new Map<string, { startedAt: string; studentId: string }>();

  constructor(
    private db: DatabaseService,
    private mastery: MasteryService,
  ) {}

  private detectIntent(transcript: string): string {
    const t = transcript.toLowerCase().trim();
    if (/[?]/.test(t) || /^(what|how|why|when|where|who|does|is|are|can|could|would)\b/.test(t)) return 'question';
    if (/\b(answer|option|choice|choose)\b/.test(t)) return 'quiz_answer';
    if (/\b(explain|tell me about|describe|what is|define|meaning of)\b/.test(t)) return 'explain';
    if (/\b(review|go over|recap|summarize|refresh|revisit)\b/.test(t)) return 'review';
    if (/\b(set|goal|plan|schedule|target|objective|i want to)\b/.test(t)) return 'set_goal';
    if (/\b(status|progress|how am i doing|dashboard|report|stats)\b/.test(t)) return 'status_check';
    return 'chitchat';
  }

  private isLearningIntent(intent: string): boolean {
    return ['question', 'quiz_answer', 'explain', 'review'].includes(intent);
  }

  private getSpokenResponse(intent: string, studentName: string, matchedConcept: string | null): string {
    const name = studentName.split(' ')[0];
    switch (intent) {
      case 'question':
        return `Good question, ${name}. Let me look into that for you.`;
      case 'quiz_answer':
        return matchedConcept
          ? `Thanks for your answer on ${matchedConcept}. I've noted it down.`
          : `Got it. I've recorded your answer.`;
      case 'explain':
        return matchedConcept
          ? `Sure, let me explain ${matchedConcept}.`
          : `Sure, what topic would you like me to explain?`;
      case 'review':
        return matchedConcept
          ? `Let's review ${matchedConcept} together.`
          : `Happy to do a review session. What should we go over?`;
      case 'set_goal':
        return `Great, I've noted your goal. Let's make a plan to achieve it.`;
      case 'status_check':
        return `Here's your current progress summary.`;
      default:
        return `I'm here to help you learn. What would you like to work on?`;
    }
  }

  @Tool({
    name: 'start_voice_session',
    description: 'Creates a new voice interaction session. Logs the start and returns a greeting tailored to the student\'s current context — recent activity, upcoming assignments, and weak topics.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID starting the voice session'),
    }),
  })
  async startVoiceSession(input: { studentId: string }, ctx: ExecutionContext) {
    const { studentId } = input;
    const student = this.db.getStudent(studentId);
    if (!student) return { ok: false, message: 'Student not found' };

    const sessionId = `voice_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    this.sessions.set(sessionId, { startedAt: new Date().toISOString(), studentId });

    this.db.logInteraction(studentId, 'voice_session_start', 'Voice session started', VOICE_CHANNEL, '', 0, '', 'voice');

    const courses = this.db.getStudentCourses(studentId);
    const upcomingAssignments = this.db.getUpcomingAssignments(studentId);
    const masteryRecords = this.db.getStudentMastery(studentId);
    const recentInteractions = this.db.getRecentInteractions(studentId, 5);

    const weakConcepts = masteryRecords
      .filter((r) => {
        const daysSince = this.mastery.computeDaysSinceReview(r.lastReviewed);
        return this.mastery.applyDecay(r.confidenceScore, daysSince) < 0.5;
      })
      .map((r) => {
        const concept = this.db.getConcept(r.conceptId);
        return concept?.name ?? r.conceptId;
      });

    const lastTopic = recentInteractions[0]
      ? recentInteractions[0].summary.substring(0, 60)
      : null;

    const greeting = [
      `Hi ${student.name}! Welcome back.`,
      courses.length > 0 ? `You're enrolled in ${courses.map((c) => c.title).join(', ')}.` : '',
      upcomingAssignments.length > 0
        ? `You have ${upcomingAssignments.length} upcoming ${upcomingAssignments.length === 1 ? 'assignment' : 'assignments'} due.`
        : '',
      weakConcepts.length > 0
        ? `Some topics that could use review: ${weakConcepts.slice(0, 3).join(', ')}.`
        : 'Your mastery looks solid across the board.',
      lastTopic ? `Last time you were working on: ${lastTopic}.` : '',
      'How can I help you today?',
    ]
      .filter(Boolean)
      .join(' ');

    return {
      ok: true,
      sessionId,
      student: student.name,
      greeting,
      context: {
        courses: courses.map((c) => c.title),
        weakConcepts: weakConcepts.slice(0, 5),
        upcomingAssignments: upcomingAssignments.length,
      },
    };
  }

  @Tool({
    name: 'process_voice_input',
    description: 'Processes spoken input from a voice session: detects intent from transcript keywords, logs the interaction with voice-specific fields, updates mastery if a learning-related intent is detected, and returns a structured spoken response.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID'),
      sessionId: z.string().describe('The active voice session ID'),
      transcript: z.string().describe('The speech-to-text transcript of the student\'s utterance'),
      audioDurationSeconds: z.number().describe('Duration of the audio input in seconds'),
    }),
  })
  async processVoiceInput(input: { studentId: string; sessionId: string; transcript: string; audioDurationSeconds: number }, ctx: ExecutionContext) {
    const { studentId, sessionId, transcript, audioDurationSeconds } = input;
    const student = this.db.getStudent(studentId);
    if (!student) return { ok: false, message: 'Student not found' };

    const session = this.sessions.get(sessionId);
    if (!session) return { ok: false, message: 'Voice session not found or expired' };

    const intent = this.detectIntent(transcript);
    const courses = this.db.getStudentCourses(studentId);
    const allConcepts = courses.flatMap((c) => this.db.getCourseConcepts(c.id));
    const matchedConcept = allConcepts.find((c) =>
      transcript.toLowerCase().includes(c.name.toLowerCase()),
    ) ?? null;

    if (this.isLearningIntent(intent) && matchedConcept) {
      const masteryRecords = this.db.getStudentMastery(studentId);
      const record = masteryRecords.find((r) => r.conceptId === matchedConcept.id);

      const isConfused = /\b(confused|unclear|don't understand|help|how|why|what)\b/i.test(transcript);
      const update = intent === 'quiz_answer'
        ? this.mastery.handleCorrectQuiz()
        : isConfused
          ? this.mastery.handleConfusedQuestion()
          : this.mastery.handleReviewSession();

      if (record) {
        this.db.upsertMastery(
          studentId,
          matchedConcept.id,
          this.mastery.clamp(record.confidenceScore + update.confidenceDelta),
          record.timesWrong + update.timesWrongDelta,
        );
      } else {
        this.db.upsertMastery(
          studentId,
          matchedConcept.id,
          this.mastery.clamp(0.5 + update.confidenceDelta),
          update.timesWrongDelta,
        );
      }
    }

    const trimmed = transcript.substring(0, 200);
    this.db.logInteraction(studentId, `voice_${intent}`, trimmed, VOICE_CHANNEL, transcript, audioDurationSeconds, intent, 'voice');

    const spokenResponse = this.getSpokenResponse(intent, student.name, matchedConcept?.name ?? null);

    return {
      ok: true,
      sessionId,
      transcript,
      audioDurationSeconds,
      detectedIntent: intent,
      matchedConcept: matchedConcept ? { id: matchedConcept.id, name: matchedConcept.name } : null,
      spokenResponse,
      masteryUpdated: this.isLearningIntent(intent) && matchedConcept !== null,
    };
  }

  @Tool({
    name: 'end_voice_session',
    description: 'Ends an active voice session, logs a summary interaction, and returns session statistics including duration, interaction count, and topics covered.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID ending the session'),
      sessionId: z.string().describe('The voice session ID to end'),
    }),
  })
  async endVoiceSession(input: { studentId: string; sessionId: string }, ctx: ExecutionContext) {
    const { studentId, sessionId } = input;
    const student = this.db.getStudent(studentId);
    if (!student) return { ok: false, message: 'Student not found' };

    const session = this.sessions.get(sessionId);
    if (!session) return { ok: false, message: 'Voice session not found or already ended' };

    const startedAt = new Date(session.startedAt).getTime();
    const endedAt = Date.now();
    const durationMinutes = Math.round((endedAt - startedAt) / 60000);

    const recentInteractions = this.db.getRecentInteractions(studentId, 50);
    const sessionInteractions = recentInteractions.filter((i) =>
      i.channel === VOICE_CHANNEL && new Date(i.timestamp).getTime() >= startedAt,
    );

    const topics = new Set<string>();
    for (const interaction of sessionInteractions) {
      if (interaction.summary) {
        const words = interaction.summary.split(/\s+/).slice(0, 5);
        words.forEach((w) => { if (w.length > 3) topics.add(w.toLowerCase()); });
      }
    }

    this.db.logInteraction(
      studentId,
      'voice_session_end',
      `Voice session ended. Duration: ${durationMinutes}min, Interactions: ${sessionInteractions.length}`,
      VOICE_CHANNEL, '', 0, '', 'voice',
    );

    this.sessions.delete(sessionId);

    return {
      ok: true,
      sessionId,
      student: student.name,
      stats: {
        durationMinutes,
        interactionCount: sessionInteractions.length,
        topicsCovered: Array.from(topics).slice(0, 10),
      },
      message: `Session ended. You spoke for ${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''} with ${sessionInteractions.length} interaction${sessionInteractions.length !== 1 ? 's' : ''}. Keep up the great work, ${student.name.split(' ')[0]}!`,
    };
  }
}
