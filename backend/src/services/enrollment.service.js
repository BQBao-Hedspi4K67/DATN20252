const pool = require('../config/db');
const { computeProgressPercent, shouldMarkLessonCompleted } = require('../utils/progressRules');
const AppError = require('../utils/appError');
const completionService = require('./completion.service');

async function enrollToCourse(studentId, courseId) {
  const [existingRows] = await pool.query(
    `SELECT id, status
     FROM enrollments
     WHERE student_id = ? AND course_id = ?
     LIMIT 1`,
    [studentId, courseId]
  );

  if (existingRows[0]) {
    return existingRows[0];
  }

  const [result] = await pool.query(
    `INSERT INTO enrollments (course_id, student_id, status, progress_percent)
     VALUES (?, ?, 'active', 0)`,
    [courseId, studentId]
  );

  return {
    id: result.insertId,
    status: 'active'
  };
}

async function getMyEnrollments(studentId) {
  const [rows] = await pool.query(
    `SELECT
      e.id,
      e.status,
      e.progress_percent,
      e.enrolled_at,
      e.completed_at,
      c.id AS course_id,
      c.title AS course_title,
      c.slug AS course_slug,
      c.thumbnail_url,
      c.course_mode,
      c.final_exam_enabled
     FROM enrollments e
     INNER JOIN courses c ON c.id = e.course_id
     WHERE e.student_id = ?
     ORDER BY e.enrolled_at DESC`,
    [studentId]
  );

  return rows;
}

async function findLessonWithEnrollment(studentId, lessonId) {
  const [rows] = await pool.query(
    `SELECT
      ls.id AS lesson_id,
      ls.lesson_type,
      ls.min_read_seconds,
      ls.chapter_id,
      ch.course_id,
      e.id AS enrollment_id,
      e.status AS enrollment_status
     FROM lessons ls
     INNER JOIN chapters ch ON ch.id = ls.chapter_id
     INNER JOIN enrollments e ON e.course_id = ch.course_id AND e.student_id = ?
     WHERE ls.id = ?
     LIMIT 1`,
    [studentId, lessonId]
  );

  return rows[0] || null;
}

async function findOrCreateLessonProgress(enrollmentId, lessonId) {
  const [existingRows] = await pool.query(
    `SELECT id, status, read_seconds, last_position
     FROM lesson_progress
     WHERE enrollment_id = ? AND lesson_id = ?
     LIMIT 1`,
    [enrollmentId, lessonId]
  );

  if (existingRows[0]) {
    return existingRows[0];
  }

  const [insertResult] = await pool.query(
    `INSERT INTO lesson_progress (enrollment_id, lesson_id, status, read_seconds, last_position)
     VALUES (?, ?, 'in_progress', 0, 0)`,
    [enrollmentId, lessonId]
  );

  return {
    id: insertResult.insertId,
    status: 'in_progress',
    read_seconds: 0,
    last_position: 0
  };
}

async function refreshEnrollmentProgress(enrollmentId) {
  const [[summary]] = await pool.query(
    `SELECT
      COUNT(*) AS total_lessons,
      SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) AS completed_lessons
     FROM lessons ls
     INNER JOIN chapters ch ON ch.id = ls.chapter_id
     INNER JOIN enrollments e ON e.course_id = ch.course_id
     LEFT JOIN lesson_progress lp ON lp.lesson_id = ls.id AND lp.enrollment_id = e.id
     WHERE e.id = ?`,
    [enrollmentId]
  );

  const totalLessons = Number(summary.total_lessons || 0);
  const completedLessons = Number(summary.completed_lessons || 0);
  const nextProgress = computeProgressPercent(totalLessons, completedLessons);
  await pool.query(
    `UPDATE enrollments
     SET progress_percent = ?
     WHERE id = ?`,
    [nextProgress, enrollmentId]
  );

  return {
    progressPercent: nextProgress,
    status: 'active'
  };
}

async function addLessonHeartbeat(studentId, lessonId, heartbeatSecond, lastPosition = 0) {
  const joined = await findLessonWithEnrollment(studentId, lessonId);
  if (!joined) {
    throw new AppError('Lesson not found or you are not enrolled in this course', 404, 'LESSON_ACCESS_DENIED');
  }

  const progress = await findOrCreateLessonProgress(joined.enrollment_id, lessonId);
  const nextReadSeconds = Number(progress.read_seconds) + Number(heartbeatSecond || 0);
  const nextPosition = Math.max(Number(progress.last_position || 0), Number(lastPosition || 0));
  const completed = shouldMarkLessonCompleted(
    { min_read_seconds: joined.min_read_seconds },
    nextReadSeconds,
    nextPosition,
    false
  );

  await pool.query(
    `UPDATE lesson_progress
     SET read_seconds = ?,
         last_position = ?,
         status = ?,
         completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
     WHERE id = ?`,
    [nextReadSeconds, nextPosition, completed ? 'completed' : 'in_progress', completed ? 'completed' : 'in_progress', progress.id]
  );

  await pool.query(
    `INSERT INTO reading_heartbeats (lesson_progress_id, heartbeat_second)
     VALUES (?, ?)`,
    [progress.id, heartbeatSecond]
  );

  const enrollment = await refreshEnrollmentProgress(joined.enrollment_id);
  const completion = await completionService.syncEnrollmentCompletion(joined.enrollment_id);

  return {
    lessonId,
    readSeconds: nextReadSeconds,
    lastPosition: nextPosition,
    status: completed ? 'completed' : 'in_progress',
    enrollment,
    completion
  };
}

async function completeLesson(studentId, lessonId, lastPosition = 100) {
  const joined = await findLessonWithEnrollment(studentId, lessonId);
  if (!joined) {
    throw new AppError('Lesson not found or you are not enrolled in this course', 404, 'LESSON_ACCESS_DENIED');
  }

  const progress = await findOrCreateLessonProgress(joined.enrollment_id, lessonId);
  const nextReadSeconds = Number(progress.read_seconds);
  const nextPosition = Math.max(Number(progress.last_position || 0), Number(lastPosition || 0));

  const completed = shouldMarkLessonCompleted(
    { min_read_seconds: joined.min_read_seconds },
    nextReadSeconds,
    nextPosition,
    true
  );

  if (!completed) {
    throw new AppError('Minimum reading time has not been reached for this lesson', 400, 'MIN_READ_TIME_NOT_REACHED');
  }

  await pool.query(
    `UPDATE lesson_progress
     SET last_position = ?,
         status = 'completed',
         completed_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [nextPosition, progress.id]
  );

  const enrollment = await refreshEnrollmentProgress(joined.enrollment_id);
  const completion = await completionService.syncEnrollmentCompletion(joined.enrollment_id);

  return {
    lessonId,
    status: 'completed',
    enrollment,
    completion
  };
}

module.exports = {
  enrollToCourse,
  getMyEnrollments,
  addLessonHeartbeat,
  completeLesson
};
