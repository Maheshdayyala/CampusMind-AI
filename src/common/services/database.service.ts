import { Injectable } from '@nitrostack/core';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'fixtures');
const DB_PATH = path.join(DB_DIR, 'campusmind.db');

export interface StudentRow {
  id: string;
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

@Injectable()
export class DatabaseService {
  private db: Database.Database;

  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');
    this.migrate();
    this.seed();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        program TEXT NOT NULL,
        year INTEGER NOT NULL,
        goals TEXT NOT NULL DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        term TEXT NOT NULL,
        syllabus TEXT NOT NULL DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        studentId TEXT NOT NULL REFERENCES students(id),
        courseId TEXT NOT NULL REFERENCES courses(id),
        status TEXT NOT NULL DEFAULT 'active',
        PRIMARY KEY (studentId, courseId)
      );

      CREATE TABLE IF NOT EXISTS concepts (
        id TEXT PRIMARY KEY,
        courseId TEXT NOT NULL REFERENCES courses(id),
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS mastery_records (
        studentId TEXT NOT NULL REFERENCES students(id),
        conceptId TEXT NOT NULL REFERENCES concepts(id),
        confidenceScore REAL NOT NULL DEFAULT 0.5,
        lastReviewed TEXT NOT NULL,
        timesWrong INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (studentId, conceptId)
      );

      CREATE TABLE IF NOT EXISTS interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId TEXT NOT NULL REFERENCES students(id),
        timestamp TEXT NOT NULL,
        type TEXT NOT NULL,
        summary TEXT NOT NULL DEFAULT '',
        channel TEXT NOT NULL DEFAULT 'text',
        transcript TEXT NOT NULL DEFAULT '',
        audioDurationSeconds REAL NOT NULL DEFAULT 0,
        intent TEXT NOT NULL DEFAULT '',
        responseMode TEXT NOT NULL DEFAULT 'text'
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId TEXT NOT NULL REFERENCES courses(id),
        title TEXT NOT NULL,
        dueDate TEXT NOT NULL,
        weight REAL NOT NULL DEFAULT 1.0
      );

      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId TEXT NOT NULL REFERENCES students(id),
        plannedAt TEXT NOT NULL,
        topics TEXT NOT NULL DEFAULT '[]',
        completed INTEGER NOT NULL DEFAULT 0
      );
    `);
  }

  private seed(): void {
    const studentCount = this.db.prepare('SELECT COUNT(*) as count FROM students').get() as any;
    if (studentCount.count > 0) return;

    const insertStudent = this.db.prepare('INSERT INTO students (id, name, program, year, goals) VALUES (?, ?, ?, ?, ?)');
    const insertCourse = this.db.prepare('INSERT INTO courses (id, code, title, term, syllabus) VALUES (?, ?, ?, ?, ?)');
    const insertEnrollment = this.db.prepare('INSERT INTO enrollments (studentId, courseId, status) VALUES (?, ?, ?)');
    const insertConcept = this.db.prepare('INSERT INTO concepts (id, courseId, name, description) VALUES (?, ?, ?, ?)');
    const insertMastery = this.db.prepare('INSERT INTO mastery_records (studentId, conceptId, confidenceScore, lastReviewed, timesWrong) VALUES (?, ?, ?, ?, ?)');
    const insertAssignment = this.db.prepare('INSERT INTO assignments (courseId, title, dueDate, weight) VALUES (?, ?, ?, ?)');

    const tx = this.db.transaction(() => {
      insertStudent.run('s1', 'Aisha', 'BSc Computer Science', 2, 'Master DSA, prepare for internships');
      insertStudent.run('s2', 'Rohan', 'BSc Physics', 1, 'Build strong foundations in mechanics');

      insertCourse.run('c1', 'CS201', 'Automata Theory', 'Fall 2026', '# Automata Theory\n## Topics\n- Finite Automata\n- Regular Expressions\n- Context-Free Grammars\n- Turing Machines\n');
      insertCourse.run('c2', 'CS101', 'Intro to Programming', 'Fall 2026', '# Intro to Programming\n## Topics\n- Variables & Types\n- Control Flow\n- Functions\n- Arrays\n');
      insertCourse.run('c3', 'PHY101', 'Classical Mechanics', 'Fall 2026', '# Classical Mechanics\n## Topics\n- Newton\'s Laws\n- Kinematics\n- Energy & Momentum\n');

      insertEnrollment.run('s1', 'c1', 'active');
      insertEnrollment.run('s1', 'c2', 'active');
      insertEnrollment.run('s2', 'c3', 'active');

      insertConcept.run('k1', 'c1', 'NFA to DFA', 'Converting non-deterministic finite automata to deterministic');
      insertConcept.run('k2', 'c1', 'Regular Expressions', 'Pattern matching using regular expression syntax');
      insertConcept.run('k3', 'c1', 'Closure Properties', 'Closure of regular languages under union, concatenation, star');
      insertConcept.run('k4', 'c2', 'Functions & Scope', 'Function definitions, parameters, return values, variable scope');
      insertConcept.run('k5', 'c2', 'Arrays & Loops', 'Array manipulation and loop constructs');
      insertConcept.run('k6', 'c3', 'Newton\'s Laws', 'Three laws of motion and their applications');
      insertConcept.run('k7', 'c3', 'Energy Conservation', 'Conservation of mechanical energy');

      const now = new Date().toISOString();
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();

      insertMastery.run('s1', 'k1', 0.42, twoWeeksAgo, 3);
      insertMastery.run('s1', 'k2', 0.75, weekAgo, 1);
      insertMastery.run('s1', 'k3', 0.30, twoWeeksAgo, 4);
      insertMastery.run('s1', 'k4', 0.85, weekAgo, 0);
      insertMastery.run('s1', 'k5', 0.90, weekAgo, 0);
      insertMastery.run('s2', 'k6', 0.60, weekAgo, 1);
      insertMastery.run('s2', 'k7', 0.35, twoWeeksAgo, 2);

      const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
      const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      const in14Days = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

      insertAssignment.run('c1', 'DFA Minimization Problem Set', in3Days, 0.15);
      insertAssignment.run('c1', 'Regular Expression Proofs', in14Days, 0.20);
      insertAssignment.run('c2', 'Array Manipulation Project', in7Days, 0.25);
      insertAssignment.run('c3', 'Inclined Plane Lab Report', in7Days, 0.15);
    });
    tx();
  }

  getDb(): Database.Database {
    return this.db;
  }

  // --- Students ---
  getStudent(id: string): StudentRow | undefined {
    return this.db.prepare('SELECT * FROM students WHERE id = ?').get(id) as any;
  }

  // --- Courses ---
  getCourse(id: string): CourseRow | undefined {
    return this.db.prepare('SELECT * FROM courses WHERE id = ?').get(id) as any;
  }

  getStudentCourses(studentId: string): CourseRow[] {
    return this.db.prepare(`
      SELECT c.* FROM courses c
      JOIN enrollments e ON e.courseId = c.id
      WHERE e.studentId = ?
    `).all(studentId) as any[];
  }

  // --- Concepts ---
  getCourseConcepts(courseId: string): ConceptRow[] {
    return this.db.prepare('SELECT * FROM concepts WHERE courseId = ?').all(courseId) as any[];
  }

  getConcept(id: string): ConceptRow | undefined {
    return this.db.prepare('SELECT * FROM concepts WHERE id = ?').get(id) as any;
  }

  // --- Mastery ---
  getStudentMastery(studentId: string): MasteryRecordRow[] {
    return this.db.prepare(`
      SELECT m.* FROM mastery_records m
      JOIN concepts c ON c.id = m.conceptId
      JOIN enrollments e ON e.courseId = c.courseId AND e.studentId = m.studentId
      WHERE m.studentId = ?
    `).all(studentId) as any[];
  }

  upsertMastery(studentId: string, conceptId: string, confidenceScore: number, timesWrong: number): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO mastery_records (studentId, conceptId, confidenceScore, lastReviewed, timesWrong)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(studentId, conceptId) DO UPDATE SET
        confidenceScore = excluded.confidenceScore,
        lastReviewed = excluded.lastReviewed,
        timesWrong = excluded.timesWrong
    `).run(studentId, conceptId, confidenceScore, now, timesWrong);
  }

  // --- Interactions ---
  logInteraction(studentId: string, type: string, summary: string, channel = 'text', transcript = '', audioDurationSeconds = 0, intent = '', responseMode = 'text'): number {
    const now = new Date().toISOString();
    const result = this.db.prepare(`
      INSERT INTO interactions (studentId, timestamp, type, summary, channel, transcript, audioDurationSeconds, intent, responseMode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(studentId, now, type, summary, channel, transcript, audioDurationSeconds, intent, responseMode);
    return result.lastInsertRowid as number;
  }

  getRecentInteractions(studentId: string, limit = 20): InteractionRow[] {
    return this.db.prepare('SELECT * FROM interactions WHERE studentId = ? ORDER BY timestamp DESC LIMIT ?').all(studentId, limit) as any[];
  }

  // --- Assignments ---
  getUpcomingAssignments(studentId: string): AssignmentRow[] {
    const now = new Date().toISOString().split('T')[0];
    return this.db.prepare(`
      SELECT a.* FROM assignments a
      JOIN enrollments e ON e.courseId = a.courseId
      WHERE e.studentId = ? AND a.dueDate >= ?
      ORDER BY a.dueDate ASC
    `).all(studentId, now) as any[];
  }

  getAssignmentsDueSoon(studentId: string, daysAhead = 7): AssignmentRow[] {
    const now = new Date().toISOString().split('T')[0];
    const cutoff = new Date(Date.now() + daysAhead * 86400000).toISOString().split('T')[0];
    return this.db.prepare(`
      SELECT a.* FROM assignments a
      JOIN enrollments e ON e.courseId = a.courseId
      WHERE e.studentId = ? AND a.dueDate >= ? AND a.dueDate <= ?
      ORDER BY a.dueDate ASC
    `).all(studentId, now, cutoff) as any[];
  }

  // --- Study Sessions ---
  logStudySession(studentId: string, topics: string, completed: number): number {
    const now = new Date().toISOString();
    const result = this.db.prepare(`
      INSERT INTO study_sessions (studentId, plannedAt, topics, completed)
      VALUES (?, ?, ?, ?)
    `).run(studentId, now, topics, completed ? 1 : 0);
    return result.lastInsertRowid as number;
  }

  getRecentStudySessions(studentId: string, days = 7): StudySessionRow[] {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    return this.db.prepare('SELECT * FROM study_sessions WHERE studentId = ? AND plannedAt >= ? ORDER BY plannedAt DESC').all(studentId, cutoff) as any[];
  }

  close(): void {
    this.db.close();
  }
}
