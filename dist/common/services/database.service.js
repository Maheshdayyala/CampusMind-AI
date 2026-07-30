var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nitrostack/core';
import * as path from 'path';
import * as fs from 'fs';
const DB_DIR = path.join(process.cwd(), 'fixtures');
const DB_PATH = path.join(DB_DIR, 'campusmind.json');
let DatabaseService = class DatabaseService {
    state;
    constructor() {
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }
        this.state = this.loadState();
        this.seed();
    }
    loadState() {
        if (!fs.existsSync(DB_PATH)) {
            return this.createEmptyState();
        }
        try {
            const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
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
        }
        catch {
            return this.createEmptyState();
        }
    }
    createEmptyState() {
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
    persist() {
        fs.writeFileSync(DB_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    }
    seed() {
        if (this.state.students.length > 0)
            return;
        // ponytail: SHA-256 for demo passwords; upgrade to bcrypt/scrypt for production
        const students = [
            { id: 's1', email: 'aisha@university.edu', passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', name: 'Aisha', program: 'BSc Computer Science', year: 2, goals: 'Master DSA, prepare for internships' },
            { id: 's2', email: 'rohan@university.edu', passwordHash: '1d4598d1949b47f7f211134b639ec32238ce73086a83c2f745713b3f12f817e5', name: 'Rohan', program: 'BSc Physics', year: 1, goals: 'Build strong foundations in mechanics' },
        ];
        const courses = [
            { id: 'c1', code: 'CS201', title: 'Automata Theory', term: 'Fall 2026', syllabus: '# Automata Theory\n## Topics\n- Finite Automata\n- Regular Expressions\n- Context-Free Grammars\n- Turing Machines\n' },
            { id: 'c2', code: 'CS101', title: 'Intro to Programming', term: 'Fall 2026', syllabus: '# Intro to Programming\n## Topics\n- Variables & Types\n- Control Flow\n- Functions\n- Arrays\n' },
            { id: 'c3', code: 'PHY101', title: 'Classical Mechanics', term: 'Fall 2026', syllabus: '# Classical Mechanics\n## Topics\n- Newton\'s Laws\n- Kinematics\n- Energy & Momentum\n' },
        ];
        const enrollments = [
            { studentId: 's1', courseId: 'c1', status: 'active' },
            { studentId: 's1', courseId: 'c2', status: 'active' },
            { studentId: 's2', courseId: 'c3', status: 'active' },
        ];
        const concepts = [
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
        const masteryRecords = [
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
        const assignments = [
            { id: 1, courseId: 'c1', title: 'DFA Minimization Problem Set', dueDate: in3Days, weight: 0.15 },
            { id: 2, courseId: 'c1', title: 'Regular Expression Proofs', dueDate: in14Days, weight: 0.20 },
            { id: 3, courseId: 'c2', title: 'Array Manipulation Project', dueDate: in7Days, weight: 0.25 },
            { id: 4, courseId: 'c3', title: 'Inclined Plane Lab Report', dueDate: in7Days, weight: 0.15 },
        ];
        this.state = { students, courses, enrollments, concepts, mastery_records: masteryRecords, interactions: [], assignments, study_sessions: [] };
        this.persist();
    }
    getDb() {
        return this.state;
    }
    // --- Students ---
    getStudent(id) {
        return this.state.students.find((student) => student.id === id);
    }
    getStudentByEmail(email) {
        return this.state.students.find((student) => student.email.toLowerCase() === email.toLowerCase());
    }
    // --- Courses ---
    getCourse(id) {
        return this.state.courses.find((course) => course.id === id);
    }
    getStudentCourses(studentId) {
        const courseIds = this.state.enrollments
            .filter((enrollment) => enrollment.studentId === studentId)
            .map((enrollment) => enrollment.courseId);
        return this.state.courses.filter((course) => courseIds.includes(course.id));
    }
    // --- Concepts ---
    getCourseConcepts(courseId) {
        return this.state.concepts.filter((concept) => concept.courseId === courseId);
    }
    getConcept(id) {
        return this.state.concepts.find((concept) => concept.id === id);
    }
    // --- Mastery ---
    getStudentMastery(studentId) {
        return this.state.mastery_records.filter((record) => {
            if (record.studentId !== studentId)
                return false;
            const concept = this.state.concepts.find((entry) => entry.id === record.conceptId);
            return Boolean(concept && this.state.enrollments.some((enrollment) => enrollment.studentId === studentId && enrollment.courseId === concept.courseId));
        });
    }
    upsertMastery(studentId, conceptId, confidenceScore, timesWrong) {
        const now = new Date().toISOString();
        const existing = this.state.mastery_records.find((record) => record.studentId === studentId && record.conceptId === conceptId);
        if (existing) {
            existing.confidenceScore = confidenceScore;
            existing.lastReviewed = now;
            existing.timesWrong = timesWrong;
        }
        else {
            this.state.mastery_records.push({ studentId, conceptId, confidenceScore, lastReviewed: now, timesWrong });
        }
        this.persist();
    }
    // --- Interactions ---
    logInteraction(studentId, type, summary, channel = 'text', transcript = '', audioDurationSeconds = 0, intent = '', responseMode = 'text') {
        const now = new Date().toISOString();
        const id = this.state.interactions.reduce((maxId, interaction) => Math.max(maxId, interaction.id), 0) + 1;
        const interaction = {
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
    getRecentInteractions(studentId, limit = 20) {
        return this.state.interactions
            .filter((interaction) => interaction.studentId === studentId)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            .slice(0, limit);
    }
    // --- Assignments ---
    getUpcomingAssignments(studentId) {
        const now = new Date().toISOString().split('T')[0];
        const courseIds = this.state.enrollments
            .filter((enrollment) => enrollment.studentId === studentId)
            .map((enrollment) => enrollment.courseId);
        return this.state.assignments
            .filter((assignment) => courseIds.includes(assignment.courseId) && assignment.dueDate >= now)
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    getAssignmentsDueSoon(studentId, daysAhead = 7) {
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
    logStudySession(studentId, topics, completed) {
        const now = new Date().toISOString();
        const id = this.state.study_sessions.reduce((maxId, session) => Math.max(maxId, session.id), 0) + 1;
        const session = { id, studentId, plannedAt: now, topics, completed: completed ? 1 : 0 };
        this.state.study_sessions.push(session);
        this.persist();
        return id;
    }
    getRecentStudySessions(studentId, days = 7) {
        const cutoff = new Date(Date.now() - days * 86400000).toISOString();
        return this.state.study_sessions
            .filter((session) => session.studentId === studentId && session.plannedAt >= cutoff)
            .sort((a, b) => b.plannedAt.localeCompare(a.plannedAt));
    }
    close() {
        this.persist();
    }
};
DatabaseService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], DatabaseService);
export { DatabaseService };
//# sourceMappingURL=database.service.js.map