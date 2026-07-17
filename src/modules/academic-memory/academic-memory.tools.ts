import { ToolDecorator as Tool, Widget, UseGuards as UseGuards, z, ExecutionContext, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/services/database.service.js';
import { MasteryService } from '../../common/mastery/mastery.service.js';
import { JwtGuard } from '../../common/guards/jwt.guard.js';

@Injectable({ deps: [DatabaseService, MasteryService] })
export class AcademicMemoryTools {
  constructor(
    private db: DatabaseService,
    private mastery: MasteryService,
  ) {}

  @Tool({
    name: 'ask_question',
    description: 'Ask a question about a course topic. The system reads memory, answers using course context, identifies relevant concepts, infers confusion from phrasing, logs an interaction, and updates mastery records.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID asking the question'),
      courseId: z.string().describe('The course ID the question is about'),
      question: z.string().describe('The student\'s question'),
    }),
  })
  @UseGuards(JwtGuard)
  async askQuestion(input: { studentId: string; courseId: string; question: string }, ctx: ExecutionContext) {
    const { studentId, courseId, question } = input;
    const student = this.db.getStudent(studentId);
    if (!student) return { ok: false, message: 'Student not found' };

    const course = this.db.getCourse(courseId);
    if (!course) return { ok: false, message: 'Course not found' };

    const concepts = this.db.getCourseConcepts(courseId);
    const masteryRecords = this.db.getStudentMastery(studentId);

    const isConfused = /\b(confused|unclear|don't understand|help|how|why|what)\b/i.test(question.toLowerCase());
    const update = isConfused ? this.mastery.handleConfusedQuestion() : this.mastery.handleClearQuestion();
    const confidentQuestion = !isConfused && question.length > 30;

    let matchedConcept: string | null = null;
    for (const concept of concepts) {
      if (question.toLowerCase().includes(concept.name.toLowerCase())) {
        matchedConcept = concept.id;
        const record = masteryRecords.find((m) => m.conceptId === concept.id);
        if (record) {
          const newScore = this.mastery.clamp(record.confidenceScore + update.confidenceDelta);
          this.db.upsertMastery(studentId, concept.id, newScore, record.timesWrong + update.timesWrongDelta);
        }
        break;
      }
    }

    if (confidentQuestion) {
      for (const concept of concepts) {
        if (matchedConcept && concept.id !== matchedConcept) {
          const record = masteryRecords.find((m) => m.conceptId === concept.id);
          if (record && record.confidenceScore < 0.8) {
            const boost = this.mastery.handleReviewSession();
            this.db.upsertMastery(studentId, concept.id, this.mastery.clamp(record.confidenceScore + boost.confidenceDelta), record.timesWrong);
          }
        }
      }
    }

    this.db.logInteraction(studentId, isConfused ? 'confused_question' : 'question', question.substring(0, 200));

    const recentMastery = this.db.getStudentMastery(studentId);
    const relevantMastery = concepts.map((c) => {
      const r = recentMastery.find((m) => m.conceptId === c.id);
      const daysSince = r ? this.mastery.computeDaysSinceReview(r.lastReviewed) : 0;
      return {
        concept: c.name,
        confidenceScore: r ? this.mastery.applyDecay(r.confidenceScore, daysSince) : 0.5,
        daysSinceReview: daysSince,
      };
    });

    return {
      ok: true,
      student: student.name,
      course: course.title,
      question,
      context: { syllabus: course.syllabus.substring(0, 500) },
      relevantConcepts: relevantMastery,
      detectedConfusion: isConfused,
      masteryUpdate: { delta: update.confidenceDelta, timesWrongDelta: update.timesWrongDelta },
      message: isConfused
        ? `I see you're working on ${course.title}. Let me help clarify — I've noted the confusion and adjusted your mastery for related concepts.`
        : `Great question about ${course.title}! Your engagement strengthens your understanding.`,
    };
  }

  @Tool({
    name: 'explain_concept',
    description: 'Get an adaptive explanation of a concept based on your current mastery level. Deeper explanations for weaker topics, concise for stronger ones.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID'),
      conceptId: z.string().describe('The concept ID to explain'),
      depth: z.enum(['basic', 'detailed', 'advanced']).default('detailed').describe('Explanation depth preference'),
    }),
  })
  @UseGuards(JwtGuard)
  async explainConcept(input: { studentId: string; conceptId: string; depth?: string }, ctx: ExecutionContext) {
    const { studentId, conceptId, depth = 'detailed' } = input;
    const concept = this.db.getConcept(conceptId);
    if (!concept) return { ok: false, message: 'Concept not found' };

    const course = this.db.getCourse(concept.courseId);
    const masteryRecords = this.db.getStudentMastery(studentId);
    const record = masteryRecords.find((m) => m.conceptId === conceptId);
    const daysSince = record ? this.mastery.computeDaysSinceReview(record.lastReviewed) : 0;
    const effectiveScore = record ? this.mastery.applyDecay(record.confidenceScore, daysSince) : 0.5;

    const boost = this.mastery.handleReviewSession();
    if (record) {
      this.db.upsertMastery(studentId, conceptId, this.mastery.clamp(record.confidenceScore + boost.confidenceDelta), record.timesWrong);
    }

    this.db.logInteraction(studentId, 'explanation', `Explained concept: ${concept.name}`);

    return {
      ok: true,
      concept: {
        id: concept.id,
        name: concept.name,
        description: concept.description,
      },
      course: course ? { id: course.id, title: course.title } : null,
      mastery: record ? {
        confidenceScore: effectiveScore,
        daysSinceReview: daysSince,
        timesWrong: record.timesWrong,
      } : { confidenceScore: 0.5, daysSinceReview: 0, timesWrong: 0 },
      depth,
      recommendedDepth: effectiveScore < 0.4 ? 'detailed' : effectiveScore < 0.7 ? 'basic' : 'advanced',
      message: effectiveScore < 0.4
        ? `Let's cover ${concept.name} thoroughly since it needs reinforcement. ${concept.description}`
        : `You have a solid foundation in ${concept.name}. Here's a quick overview: ${concept.description}`,
    };
  }

  @Tool({
    name: 'log_quiz_result',
    description: 'Log a quiz or quick-check result for a concept. Updates mastery: correct answers boost confidence, incorrect ones reduce it and increment the wrong count.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID'),
      conceptId: z.string().describe('The concept ID the quiz was about'),
      correct: z.boolean().describe('Whether the answer was correct'),
    }),
  })
  @UseGuards(JwtGuard)
  async logQuizResult(input: { studentId: string; conceptId: string; correct: boolean }, ctx: ExecutionContext) {
    const { studentId, conceptId, correct } = input;
    const concept = this.db.getConcept(conceptId);
    if (!concept) return { ok: false, message: 'Concept not found' };

    const masteryRecords = this.db.getStudentMastery(studentId);
    const record = masteryRecords.find((m) => m.conceptId === conceptId);

    const update = correct ? this.mastery.handleCorrectQuiz() : this.mastery.handleIncorrectQuiz();
    const newScore = record
      ? this.mastery.clamp(record.confidenceScore + update.confidenceDelta)
      : this.mastery.clamp(0.5 + update.confidenceDelta);
    const newWrong = record ? record.timesWrong + update.timesWrongDelta : update.timesWrongDelta;

    this.db.upsertMastery(studentId, conceptId, newScore, newWrong);
    this.db.logInteraction(studentId, correct ? 'correct_quiz' : 'incorrect_quiz', `Quiz on ${concept.name}: ${correct ? 'correct' : 'incorrect'}`);

    return {
      ok: true,
      concept: concept.name,
      correct,
      previousScore: record?.confidenceScore ?? 0.5,
      newScore,
      timesWrong: newWrong,
      message: correct
        ? `Great job! Your understanding of ${concept.name} is solidifying (confidence: ${Math.round(newScore * 100)}%).`
        : `No problem — getting it wrong is part of learning. I've noted this so we can review ${concept.name} again soon.`,
    };
  }

  @Tool({
    name: 'log_topic',
    description: 'Log a topic or doubt a student studied or asked about. Stores it with a timestamp and returns an id.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID'),
      subject: z.string().describe('The subject area, e.g. Chemistry'),
      topic: z.string().describe('The specific topic or doubt studied'),
      note: z.string().describe('What was covered or what is still unclear'),
    }),
  })
  @UseGuards(JwtGuard)
  async logTopic(input: { studentId: string; subject: string; topic: string; note: string }, ctx: ExecutionContext) {
    const { studentId, subject, topic, note } = input;
    this.db.logInteraction(studentId, 'log_topic', `${subject}: ${topic} — ${note}`.substring(0, 200));
    const id = `topic_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
    return {
      id,
      subject,
      topic,
      note,
      loggedAt: new Date().toISOString(),
      message: `Logged "${topic}" under ${subject}. Entry id: ${id}.`,
    };
  }

  @Tool({
    name: 'recall_topic',
    description: 'Search previously logged topics by a keyword or vague query. Performs a fuzzy match against subject, topic, and note from interaction history.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID'),
      query: z.string().describe('Keyword or vague phrase to search logged topics'),
    }),
  })
  @Widget('recall-list')
  @UseGuards(JwtGuard)
  async recallTopic(input: { studentId: string; query: string }, ctx: ExecutionContext) {
    const { studentId, query } = input;
    const q = query.trim().toLowerCase();
    const all = this.db.getRecentInteractions(studentId, 100);
    const matches = all
      .filter((i) => {
        const haystack = `${i.summary} ${i.transcript}`.toLowerCase();
        if (haystack.includes(q)) return true;
        const tokens = q.split(/\s+/).filter((t) => t.length > 2);
        return tokens.some((t) => haystack.includes(t));
      })
      .map((i) => ({
        id: `interaction_${i.id}`,
        summary: i.summary,
        type: i.type,
        timestamp: i.timestamp,
        channel: i.channel,
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      query,
      count: matches.length,
      results: matches.slice(0, 20),
    };
  }

  @Tool({
    name: 'get_mastery_heatmap',
    description: 'Get mastery data organized by course for the mastery heatmap widget. Returns courses with their concepts and confidence scores.',
    inputSchema: z.object({
      studentId: z.string().describe('The student ID'),
    }),
  })
  @UseGuards(JwtGuard)
  @Widget('mastery-heatmap')
  async getMasteryHeatmap(input: { studentId: string }, ctx: ExecutionContext) {
    const { studentId } = input;
    const student = this.db.getStudent(studentId);
    if (!student) return { ok: false, message: 'Student not found' };

    const courses = this.db.getStudentCourses(studentId);
    const allConcepts = courses.flatMap((c) => this.db.getCourseConcepts(c.id));
    const mastery = this.db.getStudentMastery(studentId);

    const heatmap = courses.map((course) => {
      const concepts = allConcepts
        .filter((c) => c.courseId === course.id)
        .map((concept) => {
          const record = mastery.find((m) => m.conceptId === concept.id);
          const daysSince = record ? this.mastery.computeDaysSinceReview(record.lastReviewed) : 0;
          const effectiveScore = record ? this.mastery.applyDecay(record.confidenceScore, daysSince) : 0.5;
          return {
            conceptId: concept.id,
            concept: concept.name,
            courseCode: course.code,
            confidenceScore: Math.round(effectiveScore * 100) / 100,
            daysSinceReview: daysSince,
            timesWrong: record?.timesWrong ?? 0,
          };
        });
      return { code: course.code, title: course.title, concepts };
    });

    this.db.logInteraction(studentId, 'mastery_heatmap', 'Mastery heatmap viewed');
    return { studentId, courses: heatmap };
  }
}
