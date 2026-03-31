-- Scenario pack: richer certificate-learning story data

INSERT INTO courses (
  id, instructor_id, title, slug, description, thumbnail_url, course_mode, status,
  pass_score_chapter_quiz, final_exam_enabled, final_exam_pass_score
)
VALUES
  (1002, 10, 'MySQL Certificate Path', 'mysql-certificate-path', 'Certificate path focused on schema design and query optimization.', 'https://cdn.lms.local/thumbnails/mysql-cert.jpg', 'certificate', 'published', 70, 1, 70)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  thumbnail_url = VALUES(thumbnail_url),
  status = VALUES(status),
  final_exam_enabled = VALUES(final_exam_enabled),
  final_exam_pass_score = VALUES(final_exam_pass_score);

INSERT INTO course_categories (course_id, category_id)
VALUES
  (1002, 1), (1002, 3)
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id);

INSERT INTO chapters (id, course_id, title, position)
VALUES
  (10020, 1002, 'SQL Basics and Data Modeling', 1),
  (10021, 1002, 'Indexing and Query Performance', 2)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  position = VALUES(position);

INSERT INTO lessons (
  id, chapter_id, title, position, lesson_type, content_text,
  video_url, thumbnail_url, file_url, min_read_seconds, is_preview
)
VALUES
  (100200, 10020, 'Relational Modeling in Practice', 1, 'video', NULL, 'https://www.youtube.com/watch?v=HXV3zeQKqGY', 'https://cdn.lms.local/thumbnails/sql-modeling.jpg', NULL, 0, 1),
  (100201, 10020, 'Normalization Notes', 2, 'document', NULL, NULL, 'https://cdn.lms.local/thumbnails/sql-normalization.jpg', 'https://cdn.lms.local/docs/normalization-guide.pdf', 180, 0),
  (100210, 10021, 'How Index Works', 1, 'video', NULL, 'https://www.youtube.com/watch?v=FSs_JYwnAdI', 'https://cdn.lms.local/thumbnails/sql-index.jpg', NULL, 0, 0),
  (100211, 10021, 'Index Strategy Cheat Sheet', 2, 'image', NULL, NULL, 'https://cdn.lms.local/thumbnails/index-cheat.jpg', 'https://cdn.lms.local/images/index-cheatsheet.png', 120, 0)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  lesson_type = VALUES(lesson_type),
  video_url = VALUES(video_url),
  thumbnail_url = VALUES(thumbnail_url),
  file_url = VALUES(file_url),
  min_read_seconds = VALUES(min_read_seconds);

INSERT INTO enrollments (id, course_id, student_id, status, progress_percent, completed_at)
VALUES
  (5005, 1002, 100, 'active', 35.00, NULL),
  (5006, 1002, 103, 'active', 55.00, NULL)
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  progress_percent = VALUES(progress_percent);

INSERT INTO assessments (id, course_id, chapter_id, title, assessment_type, pass_score, max_attempts, is_published)
VALUES
  (11010, 1002, 10020, 'Chapter 1 Quiz - SQL Basics', 'chapter_quiz', 70, NULL, 1),
  (11011, 1002, 10021, 'Chapter 2 Quiz - SQL Performance', 'chapter_quiz', 70, NULL, 1),
  (11012, 1002, NULL, 'Final Exam - MySQL Certificate Path', 'final_exam', 70, NULL, 1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  pass_score = VALUES(pass_score),
  is_published = VALUES(is_published);
