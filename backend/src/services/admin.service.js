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

module.exports = {
  listUsers,
  updateUserActiveStatus,
  listCourses,
  updateCourseStatus,
  listCategories,
  createCategory
};
