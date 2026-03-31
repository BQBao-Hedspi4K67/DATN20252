const pool = require('../config/db');
const AppError = require('../utils/appError');
const { normalizeIsActive, assertValidCourseStatus } = require('../utils/adminRules');

async function listUsers(filters = {}) {
  const where = [];
  const params = [];

  if (filters.role) {
    where.push('role = ?');
    params.push(filters.role);
  }

  if (filters.keyword) {
    where.push('(full_name LIKE ? OR email LIKE ?)');
    params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
  }

  const clause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT id, full_name, email, role, is_active, created_at
     FROM users
     ${clause}
     ORDER BY created_at DESC`,
    params
  );

  return rows;
}

async function updateUserActiveStatus(userId, isActive) {
  const activeValue = normalizeIsActive(isActive);

  const [result] = await pool.query(
    `UPDATE users
     SET is_active = ?
     WHERE id = ?`,
    [activeValue, userId]
  );

  if (result.affectedRows === 0) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const [rows] = await pool.query(
    `SELECT id, full_name, email, role, is_active
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0];
}

async function listCourses(filters = {}) {
  const where = [];
  const params = [];

  if (filters.status) {
    where.push('c.status = ?');
    params.push(filters.status);
  }

  if (filters.courseMode) {
    where.push('c.course_mode = ?');
    params.push(filters.courseMode);
  }

  if (filters.keyword) {
    where.push('(c.title LIKE ? OR c.description LIKE ?)');
    params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
  }

  const clause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT
      c.id,
      c.title,
      c.slug,
      c.course_mode,
      c.status,
      c.final_exam_enabled,
      c.final_exam_pass_score,
      u.full_name AS instructor_name,
      c.created_at
     FROM courses c
     INNER JOIN users u ON u.id = c.instructor_id
     ${clause}
     ORDER BY c.created_at DESC`,
    params
  );

  return rows;
}

async function updateCourseStatus(courseId, status) {
  assertValidCourseStatus(status);

  const [result] = await pool.query(
    `UPDATE courses
     SET status = ?
     WHERE id = ?`,
    [status, courseId]
  );

  if (result.affectedRows === 0) {
    throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND');
  }

  const [rows] = await pool.query(
    `SELECT id, title, slug, status
     FROM courses
     WHERE id = ?
     LIMIT 1`,
    [courseId]
  );

  return rows[0];
}

async function listCategories() {
  const [rows] = await pool.query(
    `SELECT id, name, slug, created_at
     FROM categories
     ORDER BY name ASC`
  );

  return rows;
}

async function createCategory(payload) {
  const { name, slug } = payload;
  if (!name || !slug) {
    throw new AppError('name and slug are required', 400, 'CATEGORY_INVALID_PAYLOAD');
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO categories (name, slug)
       VALUES (?, ?)`,
      [name, slug]
    );

    return {
      id: result.insertId,
      name,
      slug
    };
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      throw new AppError('Category name or slug already exists', 409, 'CATEGORY_DUPLICATE');
    }
    throw error;
  }
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function getOverviewReport() {
  const [
    [userRowSet],
    [courseRowSet],
    [enrollmentRowSet],
    [certificateRowSet],
    [assessmentRowSet]
  ] = await Promise.all([
    pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(role = 'admin') AS admins,
        SUM(role = 'instructor') AS instructors,
        SUM(role = 'student') AS students,
        SUM(is_active = 1) AS active
       FROM users`
    ),
    pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'draft') AS draft,
        SUM(status = 'published') AS published,
        SUM(status = 'archived') AS archived,
        SUM(course_mode = 'certificate') AS certificate,
        SUM(course_mode = 'instructor_led') AS instructor_led
       FROM courses`
    ),
    pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'active') AS active,
        SUM(status = 'completed') AS completed,
        SUM(status = 'dropped') AS dropped
       FROM enrollments`
    ),
    pool.query(
      `SELECT COUNT(*) AS total
       FROM certificates`
    ),
    pool.query(
      `SELECT
        COUNT(*) AS total,
        SUM(assessment_type = 'chapter_quiz') AS chapter_quiz,
        SUM(assessment_type = 'final_exam') AS final_exam
       FROM assessments`
    )
  ]);

  const userRow = userRowSet[0] || {};
  const courseRow = courseRowSet[0] || {};
  const enrollmentRow = enrollmentRowSet[0] || {};
  const certificateRow = certificateRowSet[0] || {};
  const assessmentRow = assessmentRowSet[0] || {};

  return {
    users: {
      total: toNumber(userRow.total),
      active: toNumber(userRow.active),
      admins: toNumber(userRow.admins),
      instructors: toNumber(userRow.instructors),
      students: toNumber(userRow.students)
    },
    courses: {
      total: toNumber(courseRow.total),
      draft: toNumber(courseRow.draft),
      published: toNumber(courseRow.published),
      archived: toNumber(courseRow.archived),
      certificate: toNumber(courseRow.certificate),
      instructor_led: toNumber(courseRow.instructor_led)
    },
    enrollments: {
      total: toNumber(enrollmentRow.total),
      active: toNumber(enrollmentRow.active),
      completed: toNumber(enrollmentRow.completed),
      dropped: toNumber(enrollmentRow.dropped)
    },
    certificates: {
      total: toNumber(certificateRow.total)
    },
    assessments: {
      total: toNumber(assessmentRow.total),
      chapter_quiz: toNumber(assessmentRow.chapter_quiz),
      final_exam: toNumber(assessmentRow.final_exam)
    }
  };
}

module.exports = {
  listUsers,
  updateUserActiveStatus,
  listCourses,
  updateCourseStatus,
  listCategories,
  createCategory,
  getOverviewReport
};
