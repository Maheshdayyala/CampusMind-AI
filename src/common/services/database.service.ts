import { Injectable } from '@nitrostack/core';
import * as path from 'path';
import * as fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'fixtures');
const DB_PATH = path.join(DB_DIR, 'campusmind.json');

export interface StudentRow {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  program: string;
  year: number;
  goals: string;
}

export interface CourseRow {
  id: string;
  code: string;
  title: string;
  term: string;
  syllabus: string;
}

export interface EnrollmentRow {
  studentId: string;
  courseId: string;
  status: string;
}

export interface ConceptRow {
  id: string;
  courseId: string;
  name: string;
  description: string;
}

export interface MasteryRecordRow {
  studentId: string;
  conceptId: string;
  confidenceScore: number;
  lastReviewed: string;
  timesWrong: number;
}

export interface InteractionRow {
  id: number;
  studentId: string;
  timestamp: string;
  type: string;
  summary: string;
  channel: string;
  transcript: string;
  audioDurationSeconds: number;
  intent: string;
  responseMode: string;
}

export interface AssignmentRow {
  id: number;
  courseId: string;
  title: string;
  dueDate: string;
  weight: number;
}

export interface StudySessionRow {
  id: number;
  studentId: string;
  plannedAt: string;
  topics: string;
  completed: number;
}

interface PersistenceState {
  students: StudentRow[];
  courses: CourseRow[];
  enrollments: EnrollmentRow[];
  concepts: ConceptRow[];
  mastery_records: MasteryRecordRow[];
  interactions: InteractionRow[];
  assignments: AssignmentRow[];
  study_sessions: StudySessionRow[];
}

@Injectable()
export class DatabaseService {
  private state: PersistenceState;

  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    this.state = this.loadState();
    this.seed();
  }

  private loadState(): PersistenceState {
    if (!fs.existsSync(DB_PATH)) {
      return this.createEmptyState();
    }

    try {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as Partial<PersistenceState>;
      return {
        students: Array.isArray(parsed.students) ? parsed.students : [],
        courses: Array.isArray(parsed.courses) ? parsed.courses : [],
        enrollments: Array.isArray(parsed.enrollments) ? parsed.enrollments : [],
        concepts: Array.isArray(parsed.concepts) ? parsed.concepts : [],
        mastery_records: Array.isArray(parsed.mastery_records) ? parsed.mastery_records : [],
        interactions: Array.isArray(parsed.interactions) ? parsed.interactions : [],
        assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
        study_sessions: Array.isArray(parsed.study_sessions) ? parsed.study_sessions : [],
      };
    } catch {
      return this.createEmptyState();
    }
  }

  private createEmptyState(): PersistenceState {
    return {
      students: [],
      courses: [],
      enrollments: [],
      concepts: [],
      mastery_records: [],
      interactions: [],
      assignments: [],
      study_sessions: [],
    };
  }

  private persist(): void {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
  }

  private seed(): void {
    if (this.state.students.length > 0) return;

    // ponytail: SHA-256 for demo passwords; upgrade to bcrypt/scrypt for production
    const students: StudentRow[] = [
      { id: 's1', email: 'aisha@university.edu', passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f8c0e2fe9d9b0', name: 'Aisha', program: 'BSc Computer Science', year: 2, goals: 'Master DSA, prepare for internships' },
      { id: 's2', email: 'rohan@university.edu', passwordHash: 'ba5a1e53c1b7b3a0a7f0e5a0c8c9e5b5f4a3e2d1c0b9a8f7e6d5c4b3a2a1b0c', name: 'Rohan', program: 'BSc Physics', year: 1, goals: 'Build strong foundations in mechanics' },
    ];

    const courses: CourseRow[] = [
      { id: 'c1', code: 'CS201', title: 'Automata Theory', term: 'Fall 2026', syllabus: '# Automata Theory\n## Topics\n- Finite Automata\n- Regular Expressions\n- Context-Free Grammars\n- Turing Machines\n' },
      { id: 'c2', code: 'CS101', title: 'Intro to Programming', term: 'Fall 2026', syllabus: '# Intro to Programming\n## Topics\n- Variables & Types\n- Control Flow\n- Functions\n- Arrays\n' },
      { id: 'c3', code: 'PHY101', title: 'Classical Mechanics', term: 'Fall 2026', syllabus: '# Classical Mechanics\n## Topics\n- Newton\'s Laws\n- Kinematics\n- Energy & Momentum\n' },
    ];

    const enrollments: EnrollmentRow[] = [
      { studentId: 's1', courseId: 'c1', status: 'active' },
      { studentId: 's1', courseId: 'c2', status: 'active' },
      { studentId: 's2', courseId: 'c3', status: 'active' },
    ];

    const concepts: ConceptRow[] = [
      { id: 'k1', courseId: 'c1', name: 'NFA to DFA', description: 'Converting non-deterministic finite automata to deterministic' },
      { id: 'k2', courseId: 'c1', name: 'Regular Expressions', description: 'Pattern matching using regular expression syntax' },
      { id: 'k3', courseId: 'c1', name: 'Closure Properties', description: 'Closure of regular languages under union, concatenation, star' },
      { id: 'k4', courseId: 'c2', name: 'Functions & Scope', description: 'Function definitions, parameters, return values, variable scope' },
      { id: 'k5', courseId: 'c2', name: 'Arrays & Loops', description: 'Array manipulation and loop constructs' },
      { id: 'k6', courseId: 'c3', name: 'Newton\'s Laws', description: 'Three laws of motion and their applications' },
      { id: 'k7', courseId: 'c3', name: 'Energy Conservation', description: 'Conservation of mechanical energy' },
    ];

    const now = new Date().toISOString();
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();

    const masteryRecords: MasteryRecordRow[] = [
      { studentId: 's1', conceptId: 'k1', confidenceScore: 0.42, lastReviewed: twoWeeksAgo, timesWrong: 3 },
      { studentId: 's1', conceptId: 'k2', confidenceScore: 0.75, lastReviewed: weekAgo, timesWrong: 1 },
      { studentId: 's1', conceptId: 'k3', confidenceScore: 0.30, lastReviewed: twoWeeksAgo, timesWrong: 4 },
      { studentId: 's1', conceptId: 'k4', confidenceScore: 0.85, lastReviewed: weekAgo, timesWrong: 0 },
      { studentId: 's1', conceptId: 'k5', confidenceScore: 0.90, lastReviewed: weekAgo, timesWrong: 0 },
      { studentId: 's2', conceptId: 'k6', confidenceScore: 0.60, lastReviewed: weekAgo, timesWrong: 1 },
      { studentId: 's2', conceptId: 'k7', confidenceScore: 0.35, lastReviewed: twoWeeksAgo, timesWrong: 2 },
    ];

    const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const in14Days = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    const assignments: AssignmentRow[] = [
      { id: 1, courseId: 'c1', title: 'DFA Minimization Problem Set', dueDate: in3Days, weight: 0.15 },
      { id: 2, courseId: 'c1', title: 'Regular Expression Proofs', dueDate: in14Days, weight: 0.20 },
      { id: 3, courseId: 'c2', title: 'Array Manipulation Project', dueDate: in7Days, weight: 0.25 },
      { id: 4, courseId: 'c3', title: 'Inclined Plane Lab Report', dueDate: in7Days, weight: 0.15 },
    ];

    this.state = { students, courses, enrollments, concepts, mastery_records: masteryRecords, interactions: [], assignments, study_sessions: [] };
    this.persist();
  }

  getDb(): PersistenceState {
    return this.state;
  }

  // --- Students ---
  getStudent(id: string): StudentRow | undefined {
    return this.state.students.find((student) => student.id === id);
  }

  getStudentByEmail(email: string): StudentRow | undefined {
    return this.state.students.find((student) => student.email.toLowerCase() === email.toLowerCase());
  }

  // --- Courses ---
  getCourse(id: string): CourseRow | undefined {
    return this.state.courses.find((course) => course.id === id);
  }

  getStudentCourses(studentId: string): CourseRow[] {
    const courseIds = this.state.enrollments
      .filter((enrollment) => enrollment.studentId === studentId)
      .map((enrollment) => enrollment.courseId);

    return this.state.courses.filter((course) => courseIds.includes(course.id));
  }

  // --- Concepts ---
  getCourseConcepts(courseId: string): ConceptRow[] {
    return this.state.concepts.filter((concept) => concept.courseId === courseId);
  }

  getConcept(id: string): ConceptRow | undefined {
    return this.state.concepts.find((concept) => concept.id === id);
  }

  // --- Mastery ---
  getStudentMastery(studentId: string): MasteryRecordRow[] {
    return this.state.mastery_records.filter((record) => {
      if (record.studentId !== studentId) return false;
      const concept = this.state.concepts.find((entry) => entry.id === record.conceptId);
      return Boolean(concept && this.state.enrollments.some((enrollment) => enrollment.studentId === studentId && enrollment.courseId === concept.courseId));
    });
  }

  upsertMastery(studentId: string, conceptId: string, confidenceScore: number, timesWrong: number): void {
    const now = new Date().toISOString();
    const existing = this.state.mastery_records.find((record) => record.studentId === studentId && record.conceptId === conceptId);

    if (existing) {
      existing.confidenceScore = confidenceScore;
      existing.lastReviewed = now;
      existing.timesWrong = timesWrong;
    } else {
      this.state.mastery_records.push({ studentId, conceptId, confidenceScore, lastReviewed: now, timesWrong });
    }

    this.persist();
  }

  // --- Interactions ---
  logInteraction(studentId: string, type: string, summary: string, channel = 'text', transcript = '', audioDurationSeconds = 0, intent = '', responseMode = 'text'): number {
    const now = new Date().toISOString();
    const id = this.state.interactions.reduce((maxId, interaction) => Math.max(maxId, interaction.id), 0) + 1;
    const interaction: InteractionRow = {
      id,
      studentId,
      timestamp: now,
      type,
      summary,
      channel,
      transcript,
      audioDurationSeconds,
      intent,
      responseMode,
    };
    this.state.interactions.push(interaction);
    this.persist();
    return id;
  }

  getRecentInteractions(studentId: string, limit = 20): InteractionRow[] {
    return this.state.interactions
      .filter((interaction) => interaction.studentId === studentId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  // --- Assignments ---
  getUpcomingAssignments(studentId: string): AssignmentRow[] {
    const now = new Date().toISOString().split('T')[0];
    const courseIds = this.state.enrollments
      .filter((enrollment) => enrollment.studentId === studentId)
      .map((enrollment) => enrollment.courseId);

    return this.state.assignments
      .filter((assignment) => courseIds.includes(assignment.courseId) && assignment.dueDate >= now)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  getAssignmentsDueSoon(studentId: string, daysAhead = 7): AssignmentRow[] {
    const now = new Date().toISOString().split('T')[0];
    const cutoff = new Date(Date.now() + daysAhead * 86400000).toISOString().split('T')[0];
    const courseIds = this.state.enrollments
      .filter((enrollment) => enrollment.studentId === studentId)
      .map((enrollment) => enrollment.courseId);

    return this.state.assignments
      .filter((assignment) => courseIds.includes(assignment.courseId) && assignment.dueDate >= now && assignment.dueDate <= cutoff)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  // --- Study Sessions ---
  logStudySession(studentId: string, topics: string, completed: number): number {
    const now = new Date().toISOString();
    const id = this.state.study_sessions.reduce((maxId, session) => Math.max(maxId, session.id), 0) + 1;
    const session: StudySessionRow = { id, studentId, plannedAt: now, topics, completed: completed ? 1 : 0 };
    this.state.study_sessions.push(session);
    this.persist();
    return id;
  }

  getRecentStudySessions(studentId: string, days = 7): StudySessionRow[] {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    return this.state.study_sessions
      .filter((session) => session.studentId === studentId && session.plannedAt >= cutoff)
      .sort((a, b) => b.plannedAt.localeCompare(a.plannedAt));
  }

  close(): void {
    this.persist();
  }
}
