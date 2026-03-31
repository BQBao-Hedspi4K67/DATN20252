const pool = require('../config/db');

async function listPublishedCourses(filters = {}) {
  const params = [];
  const where = [`c.status = 'published'`];

  if (filters.courseMode) {
    where.push('c.course_mode = ?');
    params.push(filters.courseMode);
  }

  if (filters.keyword) {
    where.push('(c.title LIKE ? OR c.description LIKE ?)');
    params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
  }

  const sql = `
    SELECT
      c.id,
      c.title,
      c.slug,
      c.description,
      c.thumbnail_url,
      c.course_mode,
      c.final_exam_enabled,
      c.final_exam_pass_score,
      u.full_name AS instructor_name,
      COUNT(DISTINCT ch.id) AS chapter_count,
      COUNT(DISTINCT ls.id) AS lesson_count
    FROM courses c
    INNER JOIN users u ON u.id = c.instructor_id
    LEFT JOIN chapters ch ON ch.course_id = c.id
    LEFT JOIN lessons ls ON ls.chapter_id = ch.id
    WHERE ${where.join(' AND ')}
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function findCourseBySlug(slug) {
  const [courseRows] = await pool.query(
    `SELECT
      c.id,
      c.title,
      c.slug,
      c.description,
      c.thumbnail_url,
      c.course_mode,
      c.status,
      c.pass_score_chapter_quiz,
      c.final_exam_enabled,
      c.final_exam_pass_score,
      u.full_name AS instructor_name
     FROM courses c
     INNER JOIN users u ON u.id = c.instructor_id
     WHERE c.slug = ?
     LIMIT 1`,
    [slug]
  );

  if (!courseRows[0]) {
    return null;
  }

  const course = courseRows[0];
  const [chapterRows] = await pool.query(
    `SELECT id, title, position
     FROM chapters
     WHERE course_id = ?
     ORDER BY position ASC`,
    [course.id]
  );

  const chapterIds = chapterRows.map((item) => item.id);
  let lessonRows = [];
  const [assessmentRows] = await pool.query(
    `SELECT
      id,
      chapter_id,
      title,
      assessment_type,
      pass_score
     FROM assessments
     WHERE course_id = ?
       AND is_published = 1
     ORDER BY created_at ASC`,
    [course.id]
  );

  if (chapterIds.length > 0) {
    const [rows] = await pool.query(
      `SELECT
        id,
        chapter_id,
        title,
        position,
        lesson_type,
        thumbnail_url,
        video_url,
        file_url,
        min_read_seconds,
        is_preview
       FROM lessons
       WHERE chapter_id IN (?)
       ORDER BY chapter_id ASC, position ASC`,
      [chapterIds]
    );
    lessonRows = rows;
  }

  const chapters = chapterRows.map((chapter) => ({
    ...chapter,
    lessons: lessonRows.filter((lesson) => lesson.chapter_id === chapter.id),
    chapterQuiz: assessmentRows.find(
      (assessment) =>
        assessment.assessment_type === 'chapter_quiz'
        && Number(assessment.chapter_id) === Number(chapter.id)
    ) || null
  }));

  const finalExam = assessmentRows.find((assessment) => assessment.assessment_type === 'final_exam') || null;

  return {
    ...course,
    chapters,
    finalExam
  };
}

async function findCourseById(courseId) {
  const [rows] = await pool.query(
    `SELECT id, course_mode, status
     FROM courses
     WHERE id = ?
     LIMIT 1`,
    [courseId]
  );

  return rows[0] || null;
}

module.exports = {
  listPublishedCourses,
  findCourseBySlug,
  findCourseById
};
