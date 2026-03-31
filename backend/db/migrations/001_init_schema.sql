CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'instructor', 'admin') NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(140) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  instructor_id BIGINT NOT NULL,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url VARCHAR(500),
  course_mode ENUM('certificate', 'instructor_led') NOT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  pass_score_chapter_quiz INT NOT NULL DEFAULT 70,
  final_exam_enabled TINYINT(1) NOT NULL DEFAULT 0,
  final_exam_pass_score INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS course_categories (
  course_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  PRIMARY KEY (course_id, category_id),
  CONSTRAINT fk_course_categories_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_course_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chapters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  title VARCHAR(180) NOT NULL,
  position INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chapters_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY uq_chapter_position (course_id, position)
);

CREATE TABLE IF NOT EXISTS lessons (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  chapter_id BIGINT NOT NULL,
  title VARCHAR(180) NOT NULL,
  position INT NOT NULL,
  lesson_type ENUM('video', 'document', 'text', 'image') NOT NULL,
  content_text LONGTEXT,
  video_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  file_url VARCHAR(500),
  min_read_seconds INT NOT NULL DEFAULT 0,
  is_preview TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lessons_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY uq_lesson_position (chapter_id, position)
);

CREATE TABLE IF NOT EXISTS classes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  instructor_id BIGINT NOT NULL,
  title VARCHAR(180) NOT NULL,
  schedule_note VARCHAR(500),
  start_date DATE,
  end_date DATE,
  status ENUM('open', 'closed', 'completed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_classes_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_classes_instructor FOREIGN KEY (instructor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS class_students (
  class_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  status ENUM('enrolled', 'completed', 'dropped') NOT NULL DEFAULT 'enrolled',
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (class_id, student_id),
  CONSTRAINT fk_class_students_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_class_students_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  status ENUM('active', 'completed', 'dropped') NOT NULL DEFAULT 'active',
  progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_enrollment_course_student (course_id, student_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  enrollment_id BIGINT NOT NULL,
  lesson_id BIGINT NOT NULL,
  status ENUM('not_started', 'in_progress', 'completed') NOT NULL DEFAULT 'not_started',
  read_seconds INT NOT NULL DEFAULT 0,
  last_position INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_lesson_progress_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  CONSTRAINT fk_lesson_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE KEY uq_lesson_progress (enrollment_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS reading_heartbeats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  lesson_progress_id BIGINT NOT NULL,
  heartbeat_second INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_heartbeats_progress FOREIGN KEY (lesson_progress_id) REFERENCES lesson_progress(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  chapter_id BIGINT NULL,
  title VARCHAR(180) NOT NULL,
  assessment_type ENUM('chapter_quiz', 'final_exam') NOT NULL,
  pass_score INT NOT NULL,
  max_attempts INT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assessments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_assessments_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  assessment_id BIGINT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('single_choice') NOT NULL DEFAULT 'single_choice',
  position INT NOT NULL,
  CONSTRAINT fk_questions_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  UNIQUE KEY uq_question_position (assessment_id, position)
);

CREATE TABLE IF NOT EXISTS assessment_options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  is_correct TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  assessment_id BIGINT NOT NULL,
  enrollment_id BIGINT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  is_passed TINYINT(1) NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP NULL,
  CONSTRAINT fk_attempts_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  CONSTRAINT fk_attempts_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessment_attempt_answers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  attempt_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  option_id BIGINT NOT NULL,
  is_correct TINYINT(1) NOT NULL,
  CONSTRAINT fk_answers_attempt FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_option FOREIGN KEY (option_id) REFERENCES assessment_options(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS certificates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  enrollment_id BIGINT NOT NULL UNIQUE,
  certificate_code VARCHAR(64) NOT NULL UNIQUE,
  verification_url VARCHAR(500),
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_certificates_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);
