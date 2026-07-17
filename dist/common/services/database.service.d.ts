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
export declare class DatabaseService {
    private state;
    constructor();
    private loadState;
    private createEmptyState;
    private persist;
    private seed;
    getDb(): PersistenceState;
    getStudent(id: string): StudentRow | undefined;
    getCourse(id: string): CourseRow | undefined;
    getStudentCourses(studentId: string): CourseRow[];
    getCourseConcepts(courseId: string): ConceptRow[];
    getConcept(id: string): ConceptRow | undefined;
    getStudentMastery(studentId: string): MasteryRecordRow[];
    upsertMastery(studentId: string, conceptId: string, confidenceScore: number, timesWrong: number): void;
    logInteraction(studentId: string, type: string, summary: string, channel?: string, transcript?: string, audioDurationSeconds?: number, intent?: string, responseMode?: string): number;
    getRecentInteractions(studentId: string, limit?: number): InteractionRow[];
    getUpcomingAssignments(studentId: string): AssignmentRow[];
    getAssignmentsDueSoon(studentId: string, daysAhead?: number): AssignmentRow[];
    logStudySession(studentId: string, topics: string, completed: number): number;
    getRecentStudySessions(studentId: string, days?: number): StudySessionRow[];
    close(): void;
}
export {};
//# sourceMappingURL=database.service.d.ts.map