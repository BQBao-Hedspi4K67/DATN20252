-- Password for all seeded users: Password@123
-- Bcrypt hash:
-- $2a$10$KvPBjwM9ITmAkV4lsomzb.hY97W.RX9zul49eBOI0aJS.XhYEIaBW

INSERT INTO users (id, full_name, email, password_hash, role, is_active)
VALUES
  (1, 'System Admin', 'admin@lms.local', '$2a$10$KvPBjwM9ITmAkV4lsomzb.hY97W.RX9zul49eBOI0aJS.XhYEIaBW', 'admin', 1),
  (10, 'Nguyen Minh Instructor', 'minh.instructor@lms.local', '$2a$10$KvPBjwM9ITmAkV4lsomzb.hY97W.RX9zul49eBOI0aJS.XhYEIaBW', 'instructor', 1),
  (11, 'Tran Lan Instructor', 'lan.instructor@lms.local', '$2a$10$KvPBjwM9ITmAkV4lsomzb.hY97W.RX9zul49eBOI0aJS.XhYEIaBW', 'instructor', 1),
  (100, 'Le An Student', 'an.student@lms.local', '$2a$10$KvPBjwM9ITmAkV4lsomzb.hY97W.RX9zul49eBOI0aJS.XhYEIaBW', 'student', 1),
  (101, 'Pham Binh Student', 'binh.student@lms.local', '$2a$10$KvPBjwM9ITmAkV4lsomzb.hY97W.RX9zul49eBOI0aJS.XhYEIaBW', 'student', 1),
  (102, 'Do Chau Student', 'chau.student@lms.local', '$2a$10$KvPBjwM9ITmAkV4lsomzb.hY97W.RX9zul49eBOI0aJS.XhYEIaBW', 'student', 1),
  (103, 'Vu Dung Student', 'dung.student@lms.local', '$2a$10$KvPBjwM9ITmAkV4lsomzb.hY97W.RX9zul49eBOI0aJS.XhYEIaBW', 'student', 1)
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  is_active = VALUES(is_active);

INSERT INTO categories (id, name, slug)
VALUES
  (1, 'Backend Development', 'backend-development'),
  (2, 'Frontend Development', 'frontend-development'),
  (3, 'Fullstack Career', 'fullstack-career'),
  (4, 'UI UX', 'ui-ux')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  slug = VALUES(slug);

INSERT INTO courses (
  id, instructor_id, title, slug, description, thumbnail_url, course_mode, status,
  pass_score_chapter_quiz, final_exam_enabled, final_exam_pass_score
)
VALUES
  (1000, 10, 'Node.js Certificate Path', 'nodejs-certificate-path', 'Self-paced certificate course with reading, video, and chapter quizzes.', 'https://cdn.lms.local/thumbnails/nodejs-cert.jpg', 'certificate', 'published', 70, 1, 70),
  (1001, 11, 'React.js Certificate Path', 'reactjs-certificate-path', 'Certificate course for frontend fundamentals and project practice.', 'https://cdn.lms.local/thumbnails/react-cert.jpg', 'certificate', 'published', 70, 1, 70),
  (2000, 10, 'Instructor-led Fullstack Bootcamp', 'instructor-fullstack-bootcamp', 'Instructor-led class with schedule and optional final exam.', 'https://cdn.lms.local/thumbnails/fullstack-class.jpg', 'instructor_led', 'published', 70, 1, 75),
  (2001, 11, 'Instructor-led UI Design Sprint', 'instructor-ui-design-sprint', 'Instructor-led design sprint focused on teamwork.', 'https://cdn.lms.local/thumbnails/ui-sprint.jpg', 'instructor_led', 'published', 70, 0, NULL)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  thumbnail_url = VALUES(thumbnail_url),
  course_mode = VALUES(course_mode),
  status = VALUES(status),
  final_exam_enabled = VALUES(final_exam_enabled),
  final_exam_pass_score = VALUES(final_exam_pass_score);

INSERT INTO course_categories (course_id, category_id)
VALUES
  (1000, 1), (1000, 3),
  (1001, 2),
  (2000, 1), (2000, 2), (2000, 3),
  (2001, 4)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id);

INSERT INTO chapters (id, course_id, title, position)
VALUES
  (10000, 1000, 'Node Core Foundations', 1),
  (10001, 1000, 'Build REST API with Express', 2),
  (10010, 1001, 'React Fundamentals', 1),
  (20000, 2000, 'Bootcamp Kickoff', 1),
  (20010, 2001, 'Design Sprint Planning', 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  position = VALUES(position);

INSERT INTO lessons (
  id, chapter_id, title, position, lesson_type, content_text,
  video_url, thumbnail_url, file_url, min_read_seconds, is_preview
)
VALUES
  (100000, 10000, 'What is Node Runtime', 1, 'video', NULL, 'https://www.youtube.com/watch?v=TlB_eWDSMt4', 'https://cdn.lms.local/thumbnails/node-runtime.jpg', NULL, 0, 1),
  (100001, 10000, 'Node Event Loop Reading', 2, 'document', NULL, NULL, 'https://cdn.lms.local/thumbnails/event-loop.jpg', 'https://cdn.lms.local/docs/node-event-loop.pdf', 180, 0),
  (100010, 10001, 'Express Routing Deep Dive', 1, 'video', NULL, 'https://www.youtube.com/watch?v=L72fhGm1tfE', 'https://cdn.lms.local/thumbnails/express-routing.jpg', NULL, 0, 0),
  (100011, 10001, 'HTTP Status Cheatsheet', 2, 'image', NULL, NULL, 'https://cdn.lms.local/thumbnails/http-status.jpg', 'https://cdn.lms.local/images/http-status-map.png', 90, 0),
  (100100, 10010, 'React Component Lifecycle', 1, 'video', NULL, 'https://www.youtube.com/watch?v=qB4AF7-4N3Y', 'https://cdn.lms.local/thumbnails/react-lifecycle.jpg', NULL, 0, 1),
  (100101, 10010, 'Hooks Reading Guide', 2, 'document', NULL, NULL, 'https://cdn.lms.local/thumbnails/react-hooks.jpg', 'https://cdn.lms.local/docs/react-hooks-guide.docx', 240, 0),
  (200000, 20000, 'Bootcamp Orientation', 1, 'text', 'Instructor shares roadmap and weekly workflow expectations.', NULL, 'https://cdn.lms.local/thumbnails/bootcamp-orientation.jpg', NULL, 120, 1),
  (200100, 20010, 'Design Sprint Template', 1, 'document', NULL, NULL, 'https://cdn.lms.local/thumbnails/design-sprint.jpg', 'https://cdn.lms.local/docs/design-sprint-template.pdf', 120, 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  lesson_type = VALUES(lesson_type),
  video_url = VALUES(video_url),
  thumbnail_url = VALUES(thumbnail_url),
  file_url = VALUES(file_url),
  min_read_seconds = VALUES(min_read_seconds);

INSERT INTO classes (id, course_id, instructor_id, title, schedule_note, start_date, end_date, status)
VALUES
  (3000, 2000, 10, 'Fullstack Bootcamp - Cohort A', 'Mon/Wed/Fri 19:30-21:00 via Google Meet', '2026-04-06', '2026-06-30', 'open'),
  (3001, 2001, 11, 'UI Design Sprint - Cohort A', 'Tue/Thu 20:00-21:30', '2026-04-08', '2026-05-30', 'open')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  schedule_note = VALUES(schedule_note),
  start_date = VALUES(start_date),
  end_date = VALUES(end_date),
  status = VALUES(status);

INSERT INTO class_students (class_id, student_id, status)
VALUES
  (3000, 100, 'enrolled'),
  (3000, 101, 'enrolled'),
  (3001, 102, 'enrolled')
ON DUPLICATE KEY UPDATE
  status = VALUES(status);

INSERT INTO enrollments (id, course_id, student_id, status, progress_percent, completed_at)
VALUES
  (5000, 1000, 100, 'active', 40.00, NULL),
  (5001, 1000, 101, 'completed', 100.00, '2026-03-28 20:00:00'),
  (5002, 1001, 102, 'active', 15.00, NULL),
  (5003, 2000, 100, 'active', 20.00, NULL),
  (5004, 2001, 102, 'active', 10.00, NULL)
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  progress_percent = VALUES(progress_percent),
  completed_at = VALUES(completed_at);

INSERT INTO lesson_progress (id, enrollment_id, lesson_id, status, read_seconds, last_position, completed_at)
VALUES
  (7000, 5000, 100000, 'completed', 420, 0, '2026-03-20 09:00:00'),
  (7001, 5000, 100001, 'in_progress', 110, 4, NULL),
  (7002, 5001, 100000, 'completed', 560, 0, '2026-03-22 08:00:00'),
  (7003, 5001, 100001, 'completed', 320, 9, '2026-03-22 09:00:00'),
  (7004, 5002, 100100, 'in_progress', 90, 3, NULL),
  (7005, 5003, 200000, 'in_progress', 70, 0, NULL)
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  read_seconds = VALUES(read_seconds),
  last_position = VALUES(last_position),
  completed_at = VALUES(completed_at);

INSERT INTO reading_heartbeats (id, lesson_progress_id, heartbeat_second)
VALUES
  (9000, 7001, 30),
  (9001, 7001, 60),
  (9002, 7001, 90),
  (9003, 7004, 45)
ON DUPLICATE KEY UPDATE
  heartbeat_second = VALUES(heartbeat_second);

INSERT INTO assessments (id, course_id, chapter_id, title, assessment_type, pass_score, max_attempts, is_published)
VALUES
  (11000, 1000, 10000, 'Chapter 1 Quiz - Node Foundations', 'chapter_quiz', 70, NULL, 1),
  (11001, 1000, 10001, 'Chapter 2 Quiz - Express API', 'chapter_quiz', 70, NULL, 1),
  (11002, 1000, NULL, 'Final Exam - Node.js Certificate Path', 'final_exam', 70, NULL, 1),
  (12000, 2000, 20000, 'Bootcamp Chapter Quiz', 'chapter_quiz', 70, NULL, 1),
  (12001, 2000, NULL, 'Bootcamp Optional Final Exam', 'final_exam', 75, NULL, 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  pass_score = VALUES(pass_score),
  max_attempts = VALUES(max_attempts),
  is_published = VALUES(is_published);

INSERT INTO assessment_questions (id, assessment_id, question_text, question_type, position)
VALUES
  (21000, 11000, 'Node.js runs on which JavaScript engine?', 'single_choice', 1),
  (21001, 11000, 'What does the event loop primarily handle?', 'single_choice', 2),
  (21002, 11002, 'Which package is commonly used to build APIs in Node.js?', 'single_choice', 1),
  (22000, 12001, 'Which HTTP method is idempotent by design?', 'single_choice', 1)
ON DUPLICATE KEY UPDATE
  question_text = VALUES(question_text),
  position = VALUES(position);

INSERT INTO assessment_options (id, question_id, option_text, is_correct)
VALUES
  (31000, 21000, 'V8', 1),
  (31001, 21000, 'SpiderMonkey', 0),
  (31002, 21000, 'Java VM', 0),
  (31003, 21001, 'Scheduling asynchronous callbacks', 1),
  (31004, 21001, 'Rendering DOM', 0),
  (31005, 21001, 'Compiling TypeScript', 0),
  (31006, 21002, 'Express', 1),
  (31007, 21002, 'Pandas', 0),
  (31008, 21002, 'NumPy', 0),
  (32000, 22000, 'GET', 1),
  (32001, 22000, 'POST', 0),
  (32002, 22000, 'PATCH', 0)
ON DUPLICATE KEY UPDATE
  option_text = VALUES(option_text),
  is_correct = VALUES(is_correct);

INSERT INTO assessment_attempts (id, assessment_id, enrollment_id, score, is_passed, submitted_at)
VALUES
  (41000, 11000, 5000, 50.00, 0, '2026-03-24 10:00:00'),
  (41001, 11000, 5000, 80.00, 1, '2026-03-24 11:00:00'),
  (41002, 11002, 5001, 86.00, 1, '2026-03-27 16:00:00')
ON DUPLICATE KEY UPDATE
  score = VALUES(score),
  is_passed = VALUES(is_passed),
  submitted_at = VALUES(submitted_at);

INSERT INTO assessment_attempt_answers (id, attempt_id, question_id, option_id, is_correct)
VALUES
  (51000, 41000, 21000, 31001, 0),
  (51001, 41000, 21001, 31003, 1),
  (51002, 41001, 21000, 31000, 1),
  (51003, 41001, 21001, 31003, 1),
  (51004, 41002, 21002, 31006, 1)
ON DUPLICATE KEY UPDATE
  option_id = VALUES(option_id),
  is_correct = VALUES(is_correct);

INSERT INTO certificates (id, enrollment_id, certificate_code, verification_url, issued_at)
VALUES
  (61000, 5001, 'CERT-NODE-5001-2026', 'https://lms.local/verify/CERT-NODE-5001-2026', '2026-03-28 20:10:00')
ON DUPLICATE KEY UPDATE
  certificate_code = VALUES(certificate_code),
  verification_url = VALUES(verification_url),
  issued_at = VALUES(issued_at);
