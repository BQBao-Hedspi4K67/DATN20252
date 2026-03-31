-- Scenario pack: instructor-led expansion

INSERT INTO classes (id, course_id, instructor_id, title, schedule_note, start_date, end_date, status)
VALUES
  (3002, 2000, 10, 'Fullstack Bootcamp - Cohort B', 'Sat/Sun 08:30-11:30', '2026-07-05', '2026-09-01', 'open')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  schedule_note = VALUES(schedule_note),
  start_date = VALUES(start_date),
  end_date = VALUES(end_date),
  status = VALUES(status);

INSERT INTO class_students (class_id, student_id, status)
VALUES
  (3002, 102, 'enrolled'),
  (3002, 103, 'enrolled')
ON DUPLICATE KEY UPDATE
  status = VALUES(status);

INSERT INTO enrollments (id, course_id, student_id, status, progress_percent, completed_at)
VALUES
  (5007, 2000, 102, 'active', 5.00, NULL),
  (5008, 2000, 103, 'active', 0.00, NULL),
  (5009, 2001, 101, 'active', 25.00, NULL)
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  progress_percent = VALUES(progress_percent);

INSERT INTO lessons (
  id, chapter_id, title, position, lesson_type, content_text,
  video_url, thumbnail_url, file_url, min_read_seconds, is_preview
)
VALUES
  (200001, 20000, 'Team Coding Rules', 2, 'document', NULL, NULL, 'https://cdn.lms.local/thumbnails/team-rules.jpg', 'https://cdn.lms.local/docs/team-coding-rules.docx', 150, 0),
  (200101, 20010, 'Sprint Retrospective Canvas', 2, 'document', NULL, NULL, 'https://cdn.lms.local/thumbnails/retro-canvas.jpg', 'https://cdn.lms.local/docs/retrospective-canvas.pdf', 120, 0)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  file_url = VALUES(file_url),
  thumbnail_url = VALUES(thumbnail_url),
  min_read_seconds = VALUES(min_read_seconds);

INSERT INTO assessments (id, course_id, chapter_id, title, assessment_type, pass_score, max_attempts, is_published)
VALUES
  (12002, 2001, 20010, 'UI Sprint Chapter Quiz', 'chapter_quiz', 70, NULL, 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  pass_score = VALUES(pass_score),
  is_published = VALUES(is_published);
