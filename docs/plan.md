## Plan: LMS Modular Build (Node React MySQL)

Build the graduation LMS in modules with an MVP-first path centered on learning flow (Auth + Learning Player + Progress + Chapter Quiz), while extending requirements with reusable final-exam capability and instructor course-authoring. The approach is: lock domain model first, scaffold backend/frontend foundations, then deliver student flow end-to-end before instructor/admin tooling.

**Steps**
1. Phase 1 - Domain and architecture baseline
- Convert requirements into a canonical domain contract: roles (student/instructor/admin), course modes (certificate, instructor-led), chapter/lesson model, chapter quiz, optional final exam, certificate issuance rule.
- Define entity ownership and permissions matrix (who can create/edit/publish courses, lessons, quizzes, final exams, enrollments, certificates).
- Freeze API response envelope and error conventions to avoid rework.

2. Phase 2 - Database design and migrations (*blocks phase 3+*)
- Finalize MySQL schema for core entities: users, courses, chapters, lessons, enrollments, progress, quiz bank, quiz attempts, final exams/final attempts, certificate records, classes/class_students.
- Model lesson resource links in DB (video_url, thumbnail_url, document_url/file_url) instead of storing uploaded binaries in database rows.
- Add tables for timed reading enforcement per lesson and server-side progress evidence.
- Design multi-seed packs (foundation seed, certificate-focused seed, instructor-led seed, assessment-heavy seed) with meaningful relationships across users, courses, chapters, lessons, quizzes, and attempts.

3. Phase 3 - Backend foundation (Node.js/Express)
- Scaffold layered backend structure (routes/controllers/services/repositories/middlewares/validators).
- Implement auth + RBAC middleware with JWT.
- Implement shared exam engine service reusable by chapter quiz and final exam (question retrieval, attempt creation, scoring, pass/fail policy, retry policy).
- Implement course authoring APIs for instructors (chapters, lessons, quizzes, optional final exam configuration), including lesson resource-link fields for video/image/document URLs.
- Implement student learning APIs (enroll, fetch curriculum, submit progress, submit quiz/final, completion checks, certificate issue).

4. Phase 4 - Frontend foundation (React)
- Scaffold React app with route guards by role and API client abstraction.
- Build Coursera-like dashboard sections: certificate courses and instructor-led courses with thumbnails, filters, and enroll CTA.
- Build course detail + learning player: chapter tree, lesson renderer (video/document/text), timed reading UI synced with backend, progress UI.
- Build quiz/final exam UI using one shared assessment module (same component pipeline, different config).

5. Phase 5 - Instructor module (*parallel with late phase 4 once APIs are stable*)
- Instructor course management screens: create/edit course, chapter, lesson, chapter quiz, and optional final exam.
- Add publish workflow and validations (cannot publish when required minimum structure missing).

6. Phase 6 - Completion and certificate logic (*depends on phases 3+4*)
- Enforce completion rules for certificate courses: 100% lessons complete + pass all chapter quizzes + pass final exam if course enables final exam.
- For instructor-led courses: final exam is optional by teacher choice; pass criteria are teacher-configurable per course.
- Generate certificate metadata (code, issued date, course snapshot) and verification endpoint/page.

7. Phase 7 - Quality and release hardening
- Add API tests for auth, enrollment, progress timing, quiz/final scoring, and certificate issuance.
- Add frontend integration checks for protected routes, learning flow transitions, and retry behavior.
- Prepare multi-seed execution scripts for examiners (load base only, or base + scenario packs) to demo different flows quickly.

**Relevant files**
- d:/DATN20252/docs/02-product-requirements.md — source of functional scope and role expectations.
- d:/DATN20252/docs/03-database-rules.md — base schema conventions to extend with final exam entities.
- d:/DATN20252/docs/04-api-rules.md — API style, module grouping, and response standards.
- d:/DATN20252/docs/05-frontend-pages.md — page-level UX scope for student/instructor/admin.
- d:/DATN20252/docs/06-seed-data-rules.md — seed realism for grading/demo.

**Verification**
1. Schema verification: run migrations on clean DB, then seed, then validate cross-table constraints for quizzes/finals/progress/certificates.
2. Backend verification: run automated tests for exam scoring, retries, pass thresholds, and completion logic for both course modes.
3. Frontend verification: manual scenario tests
- Student enrolls in certificate course -> completes timed reading + chapter quizzes + final -> receives certificate.
- Student enrolls in instructor-led course with no final -> completion works per configured rule.
- Instructor creates chapters/lessons and enables final exam -> students can take exam via same assessment module.
4. Security verification: role boundary checks (student cannot author, instructor cannot admin-manage users).

**Decisions**
- MVP priority: Auth + Learning Player + Progress + Quiz.
- Instructor-led courses: class schedule support, no livestream integration in MVP.
- Chapter quiz default: pass >=70%, unlimited retries.
- Reading lesson policy: minimum time per lesson, completion validated by backend.
- Certificate-course completion: 100% lessons + pass all chapter quizzes + final exam if configured.
- Instructor-led final exam: not mandatory globally; each teacher decides whether to create/use it.
- Final exam scoring rules for teacher-led: configurable by teacher per course.
- Seed data strategy: maintain multiple seed files/seed packs with coherent, story-like linked data to simplify maintenance and future feature expansion.
- Lesson content assets (video/image/pdf/doc): persisted as URLs/links in DB metadata, not as DB binary blobs.

**Further Considerations**
1. Assessment bank strategy recommendation: shared question bank entities with assessment_type (chapter_quiz/final_exam) to maximize reuse and reduce duplicated logic.
2. Anti-cheat for timed reading recommendation: store heartbeat checkpoints and server time deltas instead of trusting only client timers.
3. Publish governance recommendation: lock destructive edits (e.g., deleting passed quizzes) after students have active attempts; require versioning for major assessment changes.
