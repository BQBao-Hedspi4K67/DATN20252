const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { isEnrollmentEligibleForCompletion } = require('../utils/completionRules');

async function getEnrollmentCompletionSummary(enrollmentId) {
  const [[enrollment]] = await pool.query(
    `SELECT
      e.id AS enrollment_id,
      e.student_id,
      e.course_id,
      e.status,
      e.progress_percent,
      c.slug AS course_slug,
      c.course_mode,
      c.final_exam_enabled
     FROM enrollments e
     INNER JOIN courses c ON c.id = e.course_id
     WHERE e.id = ?
     LIMIT 1`,
    [enrollmentId]
  );

  if (!enrollment) {
    return null;
  }

  const [[lessonSummary]] = await pool.query(
    `SELECT
      COUNT(ls.id) AS total_lessons,
      SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) AS completed_lessons
     FROM chapters ch
     INNER JOIN lessons ls ON ls.chapter_id = ch.id
     LEFT JOIN lesson_progress lp ON lp.lesson_id = ls.id AND lp.enrollment_id = ?
     WHERE ch.course_id = ?`,
    [enrollmentId, enrollment.course_id]
  );

  const [[chapterQuizSummary]] = await pool.query(
    `SELECT
      COUNT(a.id) AS published_chapter_quiz_count,
      SUM(
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM assessment_attempts aa
            WHERE aa.assessment_id = a.id
              AND aa.enrollment_id = ?
              AND aa.is_passed = 1
          ) THEN 1
          ELSE 0
        END
      ) AS passed_chapter_quiz_count
     FROM assessments a
     WHERE a.course_id = ?
       AND a.assessment_type = 'chapter_quiz'
       AND a.is_published = 1`,
    [enrollmentId, enrollment.course_id]
  );

  const [[finalSummary]] = await pool.query(
    `SELECT
      SUM(CASE WHEN a.assessment_type = 'final_exam' AND a.is_published = 1 THEN 1 ELSE 0 END) AS published_final_exam_count,
      SUM(
        CASE
          WHEN a.assessment_type = 'final_exam'
           AND a.is_published = 1
           AND EXISTS (
             SELECT 1
             FROM assessment_attempts aa
             WHERE aa.assessment_id = a.id
               AND aa.enrollment_id = ?
               AND aa.is_passed = 1
           ) THEN 1
          ELSE 0
        END
      ) AS passed_final_exam_count
     FROM assessments a
     WHERE a.course_id = ?`,
    [enrollmentId, enrollment.course_id]
  );

  return {
    enrollment,
    summary: {
      totalLessons: Number(lessonSummary.total_lessons || 0),
      completedLessons: Number(lessonSummary.completed_lessons || 0),
      publishedChapterQuizCount: Number(chapterQuizSummary.published_chapter_quiz_count || 0),
      passedChapterQuizCount: Number(chapterQuizSummary.passed_chapter_quiz_count || 0),
      finalExamRequired: Number(enrollment.final_exam_enabled || 0),
      publishedFinalExamCount: Number(finalSummary.published_final_exam_count || 0),
      passedFinalExamCount: Number(finalSummary.passed_final_exam_count || 0)
    }
  };
}

async function ensureCertificate(enrollment) {
  if (enrollment.course_mode !== 'certificate') {
    return null;
  }

  const [existingRows] = await pool.query(
    `SELECT id, certificate_code, verification_url, issued_at
     FROM certificates
     WHERE enrollment_id = ?
     LIMIT 1`,
    [enrollment.enrollment_id]
  );

  if (existingRows[0]) {
    return existingRows[0];
  }

  const code = `CERT-${enrollment.course_id}-${uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  const verificationUrl = `https://lms.local/verify/${code}`;

  await pool.query(
    `INSERT INTO certificates (enrollment_id, certificate_code, verification_url)
     VALUES (?, ?, ?)`,
    [enrollment.enrollment_id, code, verificationUrl]
  );

  const [rows] = await pool.query(
    `SELECT id, certificate_code, verification_url, issued_at
     FROM certificates
     WHERE enrollment_id = ?
     LIMIT 1`,
    [enrollment.enrollment_id]
  );

  return rows[0] || null;
}

async function syncEnrollmentCompletion(enrollmentId) {
  const wrapped = await getEnrollmentCompletionSummary(enrollmentId);
  if (!wrapped) {
    return null;
  }

  const eligible = isEnrollmentEligibleForCompletion(wrapped.summary);

  await pool.query(
    `UPDATE enrollments
     SET status = ?,
         completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END
     WHERE id = ?`,
    [eligible ? 'completed' : 'active', eligible ? 'completed' : 'active', enrollmentId]
  );

  const certificate = eligible ? await ensureCertificate(wrapped.enrollment) : null;

  return {
    enrollmentId,
    status: eligible ? 'completed' : 'active',
    completionSummary: wrapped.summary,
    certificate
  };
}

module.exports = {
  syncEnrollmentCompletion
};
